import React, { useEffect } from 'react'
import messaging from '@react-native-firebase/messaging';
import PushNotification from "react-native-push-notification";
import { requestUserPermission } from './nottificationservice';
// forground notification handler
const Forgroundhandler = () => {
  useEffect(() => {
    console.log("Setting up notifications...");

    requestUserPermission().then(() => {
      PushNotification.createChannel({
        channelId: "your-channel-id", 
        channelName: "Default channel",
        channelDescription: "A default channel for app notifications",
      });
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log("Foreground message received:", remoteMessage);
        PushNotification.localNotification({
          channelId: "your-channel-id",
          title: remoteMessage.notification?.title || "Default Title",
          message: remoteMessage.notification?.body || "Default Body",
          smallIcon: 'ic_notification',
          soundName: "default",
          vibrate: true
        });
      });
      return unsubscribe;
    });
  }, []);


  return null
}

export default Forgroundhandler
