import React, { useEffect } from 'react';
import Navigation from './Navigation';
import { AuthProvider } from './AuthContext';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SendbirdCalls } from '@sendbird/calls-react-native';
import { navigate } from './Utils/notification/navigationService';
import { requestUserPermission } from './Utils/notification/nottificationservice';

const App = () => {
  useEffect(() => {
    requestUserPermission(); // call the notification permision 
    const setupNotifications = async () => {
      PushNotification.createChannel({
        channelId: "your-channel-id",
        channelName: "Default channel",
        channelDescription: "A default channel for app notifications",
        smallIcon: 'ic_notification', // create push notification for sendbird and other push notification
      });

      messaging().setBackgroundMessageHandler(async (message) => {
        SendbirdCalls.android_handleFirebaseMessageData(message.data); // setup background handler 
        await handleNotification(message);
      });

      const unsubscribe = messaging().onMessage(async (message) => {
        SendbirdCalls.android_handleFirebaseMessageData(message.data); // handle  notification function for navigation 
        await handleNotification(message);
      });

      return unsubscribe;
    };

    const handleNotification = async (message) => {
      const isSendbirdNotification = Boolean(message.data.sendbird); // setup notificastion payload  and sendbird channel data for navigation 
      if (!isSendbirdNotification) return;

      const payload = JSON.parse(message.data.sendbird);
      const channelId = await notifee.createChannel({
        id: 'your-channel-id',
        name: 'Default channel',
        importance: AndroidImportance.HIGH,
        sound: 'ringing',
      });

      const data = Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [key, String(value)]) // extract navigation payload 
      );
     // display sendbird chat notification  
      await notifee.displayNotification({
        id: message.messageId,
        title: 'New message has arrived!',
        subtitle: `messages: ${data.unread_message_count}`,
        body: data.message,
        data: data,
        android: {
          channelId,
          smallIcon: 'ic_launcher_round',
          importance: AndroidImportance.HIGH,
          actions: [
            { title: 'View', pressAction: { id: 'view_message',launchActivity: 'default' } },
          ],
        },
      });
    };
    // handle senbird notification navigation
    const handleNotificationAction = async ({ type, detail }) => {
      const { pressAction, notification } = detail;
      const data = notification.data;

      if (pressAction.id === 'accept') {
        const directCall = await SendbirdCalls.getDirectCall(data.callId);// get the direct call 
        const userName = directCall.remoteUser?.nickname ?? 'Unknown';
        navigate('Calling', { callId: data.callId, userName });  // notification call redirection 
      } else if (pressAction.id === 'decline' || pressAction.id === 'end') { // call ending redirection 
        endCall(data.callId);
      } else if (pressAction.id === 'view_message') { // chat notification redirection 
        navigate('Messages', {});
      }

      await notifee.cancelNotification(detail.notification.id);
    };
  // show sendbird missed call notificaion 
    const showMissedCallNotification = async (callProps) => {
      await notifee.displayNotification({
        title: 'Missed Call',
        body: `You missed a call from ${callProps.remoteUser?.nickname ?? 'Unknown'}`,
        android: {
          channelId: 'your-channel-id',
          smallIcon: 'ic_launcher_round',
          importance: AndroidImportance.HIGH,
        },
        ios: {
          sound: 'ringing',
        },
        data: { callId: callProps.callId, type: 'missed_call' },
      });
    };
  // show sendbird on going call notifaication 
    const showOngoingCallNotification = async (callId) => {
      const directCall = await SendbirdCalls.getDirectCall(callId); // get the direct call 
      await notifee.displayNotification({
        id: callId,
        title: `Ongoing Call with ${directCall.remoteUser?.nickname ?? 'Unknown'}`,
        android: {
          ongoing: true,
          channelId: 'your-channel-id',
          smallIcon: 'ic_launcher_round',
          importance: AndroidImportance.HIGH,
          actions: [{ title: 'End', pressAction: { id: 'end' } }], // notification action 
        },
        ios: {
          sound: 'ringing',
          actions: [{ title: 'End', pressAction: { id: 'end' } }],// notification action 
        },
        data: { callId, type: 'ongoing_call' },
      });
    };

    const endCall = async (callId) => {
      const directCall = await SendbirdCalls.getDirectCall(callId);
      directCall.end();
    };
  // setup background notication for 
    notifee.onBackgroundEvent(handleNotificationAction);
    notifee.onForegroundEvent(handleNotificationAction);

    SendbirdCalls.setListener({
      async onRinging(callProps) {
        const directCall = await SendbirdCalls.getDirectCall(callProps.callId);// get the direct call 
        await notifee.displayNotification({
          title: 'Incoming Voice Call',
          body: `Incoming voice call from ${directCall.remoteUser?.nickname ?? 'Unknown'}`,
          android: {
            channelId: 'your-channel-id',
            smallIcon: 'ic_launcher_round',
            importance: AndroidImportance.HIGH,
            actions: [
              { title: 'Accept', pressAction: { id: 'accept',launchActivity: 'default' } }, // notification action 
              { title: 'Decline', pressAction: { id: 'decline' } },// notification action 
            ],
          },
          ios: {
            sound: 'ringing',
            actions: [
              { title: 'Accept', pressAction: { id: 'accept' } },
              { title: 'Decline', pressAction: { id: 'decline' } },
            ],
          },
          data: { callId: callProps.callId, type: 'call' },
        });

        const unsubscribe = directCall.addListener({
          onEstablished() {
            showOngoingCallNotification(callProps.callId);
          },
          onEnded() {
            showMissedCallNotification(callProps);
            notifee.stopForegroundService();
            unsubscribe();
          },
        });
      }
    });

    const fetchToken = async () => {
      const fcmToken = await AsyncStorage.getItem('fcmToken'); // setup user token 
      console.log(fcmToken, "Token fetched from AsyncStorage");
    };

    setupNotifications(); // call notification function  
    fetchToken();
  }, []);

  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
};

export default App;
