import React, { useState } from 'react';
import { KeyboardAvoidingView, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from "../Utils/Auth/axios";
import Toast from 'react-native-toast-message';


const { width, height } = Dimensions.get('window');

const EmailPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const route = useRoute();
  const { fullname } = route.params; // get the username from sigup screen 

  const validateEmail = (email) => {  // email validation codd 
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // form validation for adding email and password 

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    if (password.length < minLength) {
      return 'Password must be at least 8 characters long.';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number.';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character.';
    }
    return '';
  };
  
  const handleFinish = async () => {
    let valid = true;
  
    if (!validateEmail(email)) {
      setEmailError('Invalid email address');
      valid = false;
    } else {
      setEmailError('');
    }
  
    const passwordValidationMessage = validatePassword(password);
    if (passwordValidationMessage) {
      setPasswordError(passwordValidationMessage);
      valid = false;
    } else {
      setPasswordError('');
    }
  
    if (valid) {
      try {
        const response = await axios.post('/signup', { full_name: fullname, email: email, password: password });
        console.log(response.data);
        
        if (response.status === 200) {
          const userId = response.data.userId;
          setPasswordError('SignUp successful, Verification code sent to your email!');
          Toast.show({
            type: 'success',
            text1: 'SignUp successful',
            text2: 'Verification link sent to your email!',
            visibilityTime: 4000,
          });
          setTimeout(() => {
            navigation.navigate('Otpverification', { username: userId });
          }, 3000);
        } else {
          setPasswordError('Sign up failed: Invalid email address or user already exists.');
          setTimeout(() => {
            navigation.navigate('Signin');
          }, 3000);
        }
      } catch (error) {
        if (error.response) {
          setPasswordError('Sign up failed: Invalid email address or user already exists.');
          console.log('Error response:', error.response);
          setTimeout(() => {
            navigation.navigate('Signin');
          }, 3000);
        } else if (error.request) {
          setPasswordError('Sign up failed: No response from the server.');
          console.log('Error request:', error.request);
          setTimeout(() => {
            navigation.navigate('Signin');
          }, 3000);
        } else {
          setPasswordError('Sign up failed: Invalid email address or user already exists.');
          console.log('Error message:', error.message);
          setTimeout(() => {
            navigation.navigate('Signin');
          }, 3000);
        }
      }
    }
  };
  

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* First Section with Bottom Curve */}
          <View style={styles.firstSection}>
            <LinearGradient
              colors={['#18426D', '#286EB5', '#64D2FF']}
              style={styles.linearGradient}
            >
              <SafeAreaView style={styles.safeAreaView}>
                <View style={styles.header}>
                  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon size={20} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.headerText}>
                    We'll make this quick
                  </Text>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Your email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email here"
                    placeholderTextColor="#10BAFF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                  <Text style={[styles.inputLabel, { marginTop: height * 0.03 }]}>Create a password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Create a password"
                      placeholderTextColor="#10BAFF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeSlashIcon size={24} color="#10BAFF" />
                      ) : (
                        <EyeIcon size={24} color="#10BAFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>
              </SafeAreaView>
            </LinearGradient>
          </View>

          {/* Second Section with Gradient */}
          <LinearGradient
            colors={['#18426D', '#286EB5', '#64D2FF']}
            style={styles.secondSection}
          >
            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <Text style={styles.finishButtonText}>Finish</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18426D',
  },
  firstSection: {
    height: height * 0.67,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linearGradient: {
    flex: 1,
    borderBottomLeftRadius: width * 0.7,
    borderBottomRightRadius: width * 0.7,
    width: '130%',
  },
  safeAreaView: {
    flex: 1,
    paddingHorizontal: width * 0.1,
  },
  header: {
    flexDirection: 'row',
    marginTop: height * 0.05,
    paddingHorizontal: width * 0.1,
  },
  backButton: {
    marginRight: width * 0.1,
    marginTop: height * 0.01,
  },
  headerText: {
    color: 'white',
    fontSize: width * 0.06,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  inputContainer: {
    marginTop: height * 0.1,
    paddingHorizontal: width * 0.1,
  },
  inputLabel: {
    color: 'white',
    fontSize: width * 0.05,
    fontWeight: '300',
  },
  input: {
    width: '100%',
    marginTop: height * 0.02,
    paddingVertical: height * 0.015,
    borderBottomWidth: 2,
    borderBottomColor: '#10BAFF',
    color: 'white',
    fontSize: width * 0.05,
    fontWeight: '400',
  },
  passwordContainer: {
    width: '100%',
    marginTop: height * 0.02,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#10BAFF',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: height * 0.015,
    color: 'white',
    fontSize: width * 0.05,
    fontWeight: '400',
  },
  errorText: {
    color: 'red',
    fontSize: width * 0.03,
    marginTop: height * 0.01,
  },
  secondSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.05,
  },
  finishButton: {
    width: width * 0.5,
    height: height * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 50,
  },
  finishButtonText: {
    color: '#16436C',
    fontSize: width * 0.05,
    fontWeight: '600',
  },
});

export default EmailPasswordScreen;
