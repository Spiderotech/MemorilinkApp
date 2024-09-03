import { AppRegistry } from 'react-native';
import App from './App';
import messaging from '@react-native-firebase/messaging';
import { name as appName } from './app.json';
import { SendbirdCalls } from '@sendbird/calls-react-native';

const handleNotification = async (message) => {
  console.log('Message handled in the background!', message); // handle background notification
  SendbirdCalls.android_handleFirebaseMessageData(message.data);
  console.log("messgae getting in background ");
  
};


messaging().setBackgroundMessageHandler(handleNotification);

AppRegistry.registerComponent(appName, () => App);
