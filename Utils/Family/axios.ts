import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';

export const baseUrl = "https://api.memorilink.com";

const instance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
    "Accept": " */*",
  }
});

// Add a request interceptor to set the authorization header
instance.interceptors.request.use(
  async (config) => {
    try {
      const authDataString = await AsyncStorage.getItem('userData');
      if (authDataString) {
        const userData = JSON.parse(authDataString);
        const token = userData.jwtToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error fetching the auth token', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to refresh the token
const refreshToken = async () => {
  try {
    const authDataString = await AsyncStorage.getItem('userData');
    if (authDataString) {
      const userData = JSON.parse(authDataString);
      const refresh = userData.refreshToken;

      const response = await axios.post(`${baseUrl}/auth/refresh`, { refreshToken: refresh });
      const newToken = response.data.jwtToken;

      // Update AsyncStorage with new token
      const updatedUserData = { ...userData, jwtToken: newToken };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

      return newToken;
    }
  } catch (error) {
    console.error('Error refreshing the token', error);
    throw error;
  }
  return null;
};

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();

        if (newToken) {
          instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return instance(originalRequest);
        }
      } catch (tokenRefreshError) {
        console.error('Error refreshing the token', tokenRefreshError);
      }
      
      Alert.alert(
        'Invalid Authentication',
        'Your session has expired. Please log in again.',
        [{ 
          text: 'OK', 
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            const navigation = originalRequest.navigation; // Pass navigation in the request config if needed
            if (navigation) {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }], 
                })
              );
            }
          } 
        }]
      );
    }
    console.log('Error Response:', error.response); // Log the error response for debugging
    return Promise.reject(error);
  }
);

export default instance;
