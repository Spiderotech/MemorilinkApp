import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, SafeAreaView, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../Utils/Family/axios';

const { width, height } = Dimensions.get('window');

const PersonaldetailsScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
// get user profile details for showing user personal details 
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setEmail(userData.email);
        }

        const profileResponse = await axios.get('/auth/profile'); // user profile getting api call 
        setName(profileResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={20} color="black" />
        </TouchableOpacity>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Personal details</Text>
        </View>
      </View>

      {/* Profile Image */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity style={styles.profileImageWrapper}>
          <Image
            source={name.profile_image?{ uri: name.profile_image }:require('../assets/profile.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {/* Input Fields */}
        <View style={styles.inputFieldContainer}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
          
            value={email}
            editable={false}
            style={styles.input}
          />
        </View>
        <View style={styles.inputFieldContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
          

            value={name.full_name}
            editable={false}
            style={styles.input}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 5,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -20,
  },
  title: {
    color: 'black',
    fontSize: 20,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 2,
  },
  profileImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  profileImageWrapper: {
    alignItems: 'center',
  },
  profileImage: {
    width: width * 0.30,
    height: width * 0.30,
    borderRadius: (width * 0.30) / 2,
    borderWidth: 4,
    borderColor: 'white',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputFieldContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    color: 'black',
    fontSize: 17,
    fontWeight: '500',
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: 'gray',
    paddingBottom: 5,
    fontSize: 20,
  },
});

export default PersonaldetailsScreen;
