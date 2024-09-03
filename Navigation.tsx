import 'react-native-gesture-handler'; // Ensure this is at the top
import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeIcon, UserIcon, QrCodeIcon, PlusCircleIcon, UsersIcon } from 'react-native-heroicons/solid';
import { ChatBubbleOvalLeftIcon } from 'react-native-heroicons/outline';
import { navigate, navigationRef } from './Utils/notification/navigationService';



// Import your screens
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';
import SignupScreen from './screens/SignupScreen';
import EmailPasswordScreen from './screens/EmailPasswordScreen';
import SigninScreen from './screens/SigninScreen';
import ForgotepasswordScreen from './screens/ForgotepasswordScreen';
import CreatepasswordScreen from './screens/CreatepasswordScreen';
import HomeScreen from './screens/HomeScreen';
import NotificationScreen from './screens/NotificationScreen';
import FamilyfeedScreen from './screens/FamilyfeedScreen';
import CommentboxScreen from './screens/CommentboxScreen';
import QRscanScreen from './screens/QRscanScreen';
import QRcodeScreen from './screens/QRcodeScreen';
import FriendProfileScreen from './screens/FriendProfileScreen';
import UserprofileScreen from './screens/UserprofileScreen';
import FamilyScreen from './screens/FamilyScreen';
import FamilylistScreen from './screens/FamilylistScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import CreateFamilyScreen from './screens/CreateFamilyScreen';
import CreateeventScreen from './screens/CreateeventScreen';
import EventScreen from './screens/EventScreen';
import NewFriendProfileScreen from './screens/NewFriendProfileScreen';
import NewFamilyScreen from './screens/NewFamilyScreen';
import EventsharefirendScreen from './screens/EventsharefirendScreen';
import EventsharefamilyScreen from './screens/EventsharefamilyScreen';
import ChatScreen from './screens/ChatScreen';
import FriendConversationScreen from './screens/FriendConversationScreen';
import FamilyConversationScreen from './screens/FamilyConversationScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';
import PersonaldetailsScreen from './screens/PersonaldetailsScreen';
import PasswordandSecurityScreen from './screens/PasswordandSecurityScreen';
import InviteFriendsScreen from './screens/InviteFriendsScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import FamilyQRcodeScreen from './screens/FamilyQRcodeScreen';
import ConnectionsScreen from './screens/ConnectionsScreen';
import OtpverificationScreen from './screens/OtpverificationScreen';
import UserpostsScreen from './screens/UserpostsScreen';
import { AuthContext } from './AuthContext';
import UserFamilysScreen from './screens/UserFamilysScreen';
import UserConnectionscreen from './screens/UserConnectionscreen';
import UserEventlistScreen from './screens/UserEventlistScreen';
import FavoritesfamilyScreen from './screens/FavoritesfamilyScreen';
import CallingScreen from './screens/CallingScreen';
import PostshareFamilyScreen from './screens/PostshareFamilyScreen';
import Toast from 'react-native-toast-message';
import IncomingCallScreen from './screens/IncomingCallScreen';



const { width, height } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const iconSize = width < 400 ? 24 : 28;

  const getIcon = (routeName, isFocused) => {
    const color = isFocused ? '#286EB5' : '#ffffff';
    switch (routeName) {
      case 'Home':
        return <HomeIcon width={iconSize} height={iconSize} color={color} />;
      case 'Family':
        return <UsersIcon width={iconSize} height={iconSize} color={color} />;
      case 'QR':
        return <QrCodeIcon width={iconSize} height={iconSize} color={color} />;
      case 'Add':
        return <PlusCircleIcon width={iconSize} height={iconSize} color={color} />;
      case 'Messages':
        return <ChatBubbleOvalLeftIcon width={iconSize} height={iconSize} color={color} />;
      case 'Profile':
        return <UserIcon width={iconSize} height={iconSize} color={color} />;
      default:
        return <HomeIcon width={iconSize} height={iconSize} color={color} />;
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              key={index}
            >
              <View style={isFocused ? styles.focusedTab : null}>
                {getIcon(route.name, isFocused)}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent', // Ensure full transparency here
    position: 'absolute', // Make sure the tab bar is positioned absolutely
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBar: {
    flexDirection: 'row',
    height: height * 0.1, // Responsive height
    backgroundColor: '#18426D', // Transparent background
    justifyContent: 'space-around',
    borderTopLeftRadius: width * 0.1, // Rounded corners
    borderTopRightRadius: width * 0.1, // Rounded corners
    overflow: 'hidden', // Prevent overflow from affecting the design
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02, // Responsive padding
     
  },
  focusedTab: {
    backgroundColor: '#ffffff', // Keep the focused tab background
    borderRadius: 50,
    padding: width * 0.01, // Responsive padding
  },
});

// Create the main bottom tab navigator
const Tab = createBottomTabNavigator();

const HomeStack = createStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="Familyfeed" component={FamilyfeedScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="Familylist" component={FamilyScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="NewFriendProfile" component={NewFriendProfileScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="NewFamily" component={NewFamilyScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="Connections" component={ConnectionsScreen} options={{ headerShown: false }} />
  </HomeStack.Navigator>
);

const MainTabs = () => {
  return (
    <Tab.Navigator 
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'transparent', 
        position: 'absolute', 
        borderTopWidth: 0, 
        elevation: 0, // Remove shadow on Android
      },
    }}
    tabBar={(props) => <CustomTabBar {...props} />}
    
       >
      <Tab.Screen name="Home" component={HomeStackScreen} options={{ headerShown: false }} /> 
      <Tab.Screen name="Family" component={FamilylistScreen} options={{ headerShown: false }} />
      <Tab.Screen name="QR" component={QRscanScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Add" component={CreatePostScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Messages" component={ChatScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={UserprofileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};



// Create the main stack navigator
const Stack = createStackNavigator();

// link navigation 

const linking = { 
  prefixes: ['https://www.memorilink.com', 'memorilink://'], 
  config: {
    screens: {
      Main: {
        screens: {
          Home: {
            path: '',
            screens: {
              Familylist: {
                path: 'family/:familyId',
              },

              FriendProfile: {
                path: 'friend/:userId',
              },
              // other screens within the HomeStack
            }
          },
          // other tabs in the MainTabs
        }   
      },
      Otpverification: {
        path: 'confirm',
        parse: {
          confirmation_code: (confirmation_code) => `${confirmation_code}`,  // otp verification page redirection
          username: (username) => `${username}`,
        },
      },
      CreatePassword: {
        path: 'reset-password',
        parse: {
          confirmation_code: (confirmation_code) => `${confirmation_code}`, // create password screen redirection 
          username: (username) => `${username}`,
        },
      },
    },
  },
};




const Navigation = () => {
  const { isLoggedIn, checkLoginStatus } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      console.log(url,"pdodjdjdj");
      
      if (url) {
        handleUrl(url);
      }
    };

    const handleUrl = (url) => {
      const path = url.split('://')[1]; 
      const [domain, ...pathSegments] = path.split('/');
      const fullPath = pathSegments.join('/');
    
      const pathParts = fullPath.split('/');
      const route = pathParts[0];
      const param = pathParts.slice(1).join('/');
    
      switch (route) { 
        case 'friend':
          navigationRef.current?.navigate('FriendProfile', { userId: param });    
          break;
        case 'family':
          navigationRef.current?.navigate('Familylist', { familyId: param });
          break;
        default:
          break;
      }
    };
    
    handleInitialURL();

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  
// check user login for authentication stack navigation 
  useEffect(() => {
    const initialize = async () => {  
      await checkLoginStatus();
      setLoading(false);
    };
    initialize();
  }, []);

 

  return (
    <NavigationContainer linking={linking}  ref={navigationRef}  >   
      <Stack.Navigator  >
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateFamily" component={CreateFamilyScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateEvent" component={CreateeventScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Event" component={EventScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Userqr" component={QRcodeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Eventsharefriends" component={EventsharefirendScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Eventsharefamily" component={EventsharefamilyScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Friendchat" component={FriendConversationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Familychat" component={FamilyConversationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Postcomment" component={CommentboxScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Personaldetails" component={PersonaldetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Passwordsecurity" component={PasswordandSecurityScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Invitation" component={InviteFriendsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FamilyQR" component={FamilyQRcodeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Userpost" component={UserpostsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Userfamilylist" component={UserFamilysScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Userconnectionlist" component={UserConnectionscreen} options={{ headerShown: false }} />
            <Stack.Screen name="Usereventlist" component={UserEventlistScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Favoritesfamily" component={FavoritesfamilyScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Calling" component={CallingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Postshare" component={PostshareFamilyScreen} options={{ headerShown: false }} />
            <Stack.Screen name="IncomingCall" component={IncomingCallScreen} options={{ headerShown: false }} />
            
          </>
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EmailPassword" component={EmailPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signin" component={SigninScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotepasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreatePassword" component={CreatepasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Otpverification" component={OtpverificationScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

export default Navigation;
