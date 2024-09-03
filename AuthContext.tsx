import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import sb from './sendbird';
import { SendbirdCalls } from '@sendbird/calls-react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
// check user login 
  const checkLoginStatus = async () => {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setCurrentUser(user);
      connectToSendBird(user.user_id.toString(), user.name, user.accessToken);
      authenticateWithSendBirdCalls(user.user_id.toString(), user.accessToken);
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // setup user senbird authentication 

  const connectToSendBird = async (userId, nickname, accessToken) => {
    if (!userId || !nickname || !accessToken) {
      console.error('User ID, nickname, or access token is missing:', { userId, nickname, accessToken });
      return;
    }

    console.log('Connecting to SendBird with:', { userId, nickname, accessToken });

    sb.connect(userId, accessToken, async (user, error) => {
      if (error) {
        console.error('SendBird connection failed:', error);
        return;
      }
      sb.updateCurrentUserInfo(nickname, null, async (response, error) => { // upadte sendbird user connection 
        if (error) {
          console.error('SendBird update user info failed:', error);
          return;
        }
        console.log('SendBird user connected and info updated:', response);

        // Register FCM or APNs token
        try {
          if (Platform.OS === 'ios') {
            const apnsToken = await messaging().getAPNSToken();
            await sb.registerAPNSPushTokenForCurrentUser(apnsToken); // add token to sendbird 
            console.log('APNs token registered:', apnsToken);
          } else {
            const fcmToken = await messaging().getToken();
            await sb.registerGCMPushTokenForCurrentUser(fcmToken); // add token to sendbird 
            console.log('FCM token registered:', fcmToken);
          }
        } catch (tokenError) {
          console.error('Failed to register push token:', tokenError);
        }
      });
    });
  };

  const authenticateWithSendBirdCalls = async (userId, accessToken) => {
    try {
      // Initialize Sendbird Calls if not already initialized
      if (!SendbirdCalls.initialized) {
        SendbirdCalls.initialize(""); // Replace with your actual Sendbird application ID
      }

      await SendbirdCalls.authenticate({ userId, accessToken });
      console.log('SendBird Calls authentication successful');

      
      if (Platform.OS === 'ios') {
        const apnsToken = await messaging().getAPNSToken();
        await SendbirdCalls.registerPushToken(apnsToken);// Register FCM or APNs token with SendBird Calls
        console.log('APNs token registered with SendBird Calls:', apnsToken);
      } else {
        const fcmToken = await messaging().getToken();
        await SendbirdCalls.registerPushToken(fcmToken);// Register FCM or APNs token with SendBird Calls
        console.log('FCM token registered with SendBird Calls:', fcmToken);
      }
    } catch (error) {
      console.error('SendBird Calls authentication failed:', error);
    }
  };

  useEffect(() => {
    checkLoginStatus(); // all time check user login status 
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, checkLoginStatus, currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
