import React, { useCallback, useContext, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { ArrowLeftIcon, ChevronRightIcon, UserPlusIcon, StarIcon } from 'react-native-heroicons/solid';
import { ShieldCheckIcon, IdentificationIcon, ArrowLeftOnRectangleIcon } from 'react-native-heroicons/outline';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "../Utils/Family/axios";
import { AuthContext } from '../AuthContext';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import sb from '../sendbird';
import { SendbirdCalls } from '@sendbird/calls-react-native';

const { width, height } = Dimensions.get('window');

const SettingsScreen = () => {
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    events: false,
    family: false,
    post_comments: false,
    post_likes: false,
  });
  const { setIsLoggedIn, checkLoginStatus } = useContext(AuthContext); // authcontex login stauts 

  const fetchUserData = async () => {
    try {
      const profileResponse = await axios.get('/auth/profile'); // get user profile data 
      const notificationResponse = await axios.get('/auth/notifications'); // get the current user notification settings 
      setUserData(profileResponse.data);
      setNotification(notificationResponse.data);
      console.log(notificationResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );
// handle the change the notification settings
  const handleToggleNotification = async (type) => {
    try {
      const newValue = !notification[type];

      console.log(type);
      
      
      await axios.post('/auth/updatenotifications', { type }); // notification settings update api 

      setNotification((prevNotification) => ({
        ...prevNotification,
        [type]: newValue,
      }));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const navigation = useNavigation();
// user logout function 
  const handleLogout = async () => {
    try {
        // Get the FCM or APNs token
        let token;
        if (Platform.OS === 'ios') {
            token = await messaging().getAPNSToken();
        } else {
            token = await messaging().getToken();
        }

        if (token) {
            // Unregister FCM or APNs token for SendBird messaging
            if (Platform.OS === 'ios') {
                await sb.unregisterAPNSPushTokenForCurrentUser(token);
                console.log('APNs token unregistered:', token);
            } else {
                await sb.unregisterGCMPushTokenForCurrentUser(token);
                console.log('FCM token unregistered:', token);
            }

            // Unregister token for SendBird Calls
            await SendbirdCalls.unregisterPushToken(token);
            console.log('Token unregistered from SendBird Calls:', token);
        }

        // Call the backend to log out
        await axios.post('/auth/signout');
        
        // Clear AsyncStorage
        await AsyncStorage.clear();

        // Update state and navigate to Splash
        setIsLoggedIn(false); 
        checkLoginStatus();
        navigation.navigate('Splash');
    } catch (error) { 
        console.error('Logout failed:', error);
    }
};

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#EFEFF0', justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EFEFF0' }}>
      <View style={{ flexDirection: 'row', marginTop: 20, paddingHorizontal: 20 }}>
        <TouchableOpacity style={{ marginTop: 4 }} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={20} color="black" /> 
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'black', fontSize: 20, fontWeight: 'normal', textAlign: 'center', letterSpacing: 1 }}>
            Settings
          </Text>
        </View>
      </View>

      <View style={{ padding: 12 }}>
        <ScrollView style={{ paddingHorizontal: 4 }} showsVerticalScrollIndicator={false}>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, width: '100%', backgroundColor: 'white', borderRadius: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={userData?.profile_image ? { uri: userData.profile_image } : require('../assets/profile.png')} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 16 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{userData?.full_name}</Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Invitation')}>
              <LinearGradient colors={['#18426D', '#286EB5', '#64D2FF']} style={{ width: width * 0.38, height: height * 0.2, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                <UserPlusIcon size={40} color="white" />
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '500', textAlign: 'center', marginTop: 4 }}>Invite Friends</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Favoritesfamily', { userId: userData?.id })}>
              <LinearGradient colors={['#18426D', '#286EB5', '#64D2FF']} style={{ width: width *  0.38, height: height * 0.2, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>
                <StarIcon size={40} color="white" />
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '500', textAlign: 'center', marginTop: 4 }}>Favorite</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18, letterSpacing: 1, marginLeft: 8, marginTop: 20 }}>
            Received notification for
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Text style={{ color: '#50555C', fontSize: 15, letterSpacing: 1, marginLeft: 8 }}>
              Like on your posts
            </Text>
            <TouchableOpacity
              style={{ width: 56, height: 34, borderRadius: 17, backgroundColor: notification.post_likes ? 'green' : 'gray', justifyContent: 'center' }}
              onPress={() => handleToggleNotification('post_likes')}
            >
              <View
                style={{ width: 30, height: 30, backgroundColor: 'white', borderRadius: 15, alignSelf: notification.post_likes ? 'flex-end' : 'flex-start', margin: 2 }}
              />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Text style={{ color: '#50555C', fontSize: 15, letterSpacing: 1, marginLeft: 8 }}>
              Comment on your posts
            </Text>
            <TouchableOpacity
              style={{ width: 56, height: 34, borderRadius: 17, backgroundColor: notification.post_comments ? 'green' : 'gray', justifyContent: 'center' }}
              onPress={() => handleToggleNotification('post_comments')}
            >
              <View
                style={{ width: 30, height: 30, backgroundColor: 'white', borderRadius: 15, alignSelf: notification.post_comments ? 'flex-end' : 'flex-start', margin: 2 }}
              />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
            <TouchableOpacity
              style={{ padding: 8, backgroundColor: notification.events ? '#286EB5' : 'white', justifyContent: 'center', alignItems: 'center', width: width * 0.4, height: height * 0.06, borderRadius: 7, marginTop: 16 }}
              onPress={() => handleToggleNotification('events')}
            >
              <Text style={{ color: 'black', fontSize: 17, fontWeight: '500' }}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 8, backgroundColor: notification.family ? '#286EB5' : 'white', justifyContent: 'center', alignItems: 'center', width: width * 0.35, height: height * 0.06, borderRadius: 7, marginTop: 16, marginLeft: 8 }}
              onPress={() => handleToggleNotification('family')}
            >
              <Text style={{ color: 'black', fontSize: 17, fontWeight: '500' }}>Links</Text>
            </TouchableOpacity>
          </View>

          <View style={{ borderBottomWidth: 1, borderBottomColor: '#ABB0BC', width: '100%', marginTop: 20, paddingHorizontal: 20 }} />

          <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18, letterSpacing: 1, marginLeft: 8, marginTop: 20 }}>
            Account Settings
          </Text>
          <View style={{ padding: 4, backgroundColor: 'white', height: 88, width: '100%', borderRadius: 19, marginTop: 8 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderBottomWidth: 1, borderBottomColor: '#ABB0BC' }} onPress={() => navigation.navigate('Passwordsecurity')}>
              <View style={{ justifyContent: 'flex-start' }}>
                <ShieldCheckIcon size={25} color="#18426D" />
              </View>
              <Text style={{ fontSize: 15, color: '#50555C' }}>Password & Security</Text>
              <ChevronRightIcon size={25} color="#18426D" />
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8 }} onPress={() => navigation.navigate('Personaldetails')}>
              <View style={{ justifyContent: 'flex-start' }}>
                <IdentificationIcon size={25} color="#18426D" />
              </View>
              <Text style={{ fontSize: 15, color: '#50555C' }}>Personal details</Text>
              <ChevronRightIcon size={25} color="#18426D" />
            </TouchableOpacity>
          </View>

          <View style={{ borderBottomWidth: 1, borderBottomColor: '#ABB0BC', width: '100%', marginTop: 20, paddingHorizontal: 20 }} />

          <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18, letterSpacing: 1, marginLeft: 8, marginTop: 20 }}>
            App Settings
          </Text>
          <View style={{ paddingHorizontal: 8 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 15, color: '#50555C' }}>Rate Memorilink</Text>
              <ChevronRightIcon size={25} color="#18426D" />
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 15, color: '#50555C' }}>Terms of Use</Text>
              <ChevronRightIcon size={25} color="#18426D" />
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 15, color: '#50555C' }}>Privacy Policy</Text>
              <ChevronRightIcon size={25} color="#18426D" />
            </TouchableOpacity>
          </View>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#ABB0BC', width: '100%', marginTop: 12, paddingHorizontal: 20 }} />

          <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18, letterSpacing: 1, marginLeft: 8, marginTop: 20 }}>
            Support
          </Text>
          <View style={{ paddingHorizontal: 8 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 15, color: '#50555C' }}>Help and Support</Text>
              <ChevronRightIcon size={25} color="#18426D" />
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }} onPress={() => setModalVisible(true)}>
              <Text style={{ fontSize: 15, color: '#50555C' }}>About</Text>
              <ChevronRightIcon size={25} color="#18426D" />
            </TouchableOpacity>
          </View>

          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 4, marginBottom: 40 }}>
            <TouchableOpacity style={{ padding: 8, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: width * 0.4, height: height * 0.06, borderRadius: 7, marginTop: 16,marginBottom:20 }} onPress={handleLogout}>
              <ArrowLeftOnRectangleIcon size={20} color="#18426D" />
              <Text style={{ color: 'black', fontSize: 17, fontWeight: '500', marginLeft: 8 }}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Modal
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <Pressable
    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
    onPress={() => setModalVisible(false)}
  >
    <View style={{ width: width * 0.9, height: height * 0.3, backgroundColor: 'black', borderRadius: 20, padding: 16 }}>
      <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 20, textAlign: 'center' }}>About</Text>
      <Text style={{ color: 'white', fontSize: 15, marginTop: 20, textAlign: 'center' }}>Version: 1.0</Text>
      <Text style={{ color: 'white', fontSize: 15, marginTop: 8, textAlign: 'center' }}>DM: 1.0 (2024)</Text>
      <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginTop: 20 }}>
        <View style={{ borderBottomWidth: 1, borderBottomColor: 'white', width: '100%', marginBottom: 20 }} />
        <TouchableOpacity style={{ padding: 8, justifyContent: 'center', alignItems: 'center', width: width * 0.4, height: height * 0.06 }} onPress={() => setModalVisible(false)}>
          <Text style={{ color: 'red', fontSize: 17, fontWeight: '500' }}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Pressable>
</Modal>

    </SafeAreaView>
  );
};

export default SettingsScreen;
