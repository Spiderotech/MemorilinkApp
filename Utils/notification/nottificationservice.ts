import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// impliment notification permission 
export async function requestUserPermission() {
    try {


        if (Platform.OS == "android" && Platform.Version >= 33) {

            const granted =  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

            if (await granted === PermissionsAndroid.RESULTS.GRANTED) {

                getFCMToken();

            } else {
                console.log("permission denided");

            }

        } else {

            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log('Authorization status:', authStatus);
                
                getFCMToken();
            } else {
                console.log('User denied permission for push notifications.'); 
            }

        }

    } catch (error) {
        console.error('Error requesting user permission:', error);
    }
}
// get device token 
const getFCMToken = async () => {
    try {
        await messaging().registerDeviceForRemoteMessages();
        let fcmToken = await AsyncStorage.getItem('fcmToken'); 
        console.log(fcmToken,"pppff");
        

        if (fcmToken) {
            console.log("Existing FCM token:", fcmToken);
        } else {
            const newToken = await messaging().getToken();
            await AsyncStorage.setItem('fcmToken', newToken);
            console.log("New FCM token saved:", newToken);
        }
    } catch (error) {
        console.error('Error generating FCM token:', error);
    }
};



