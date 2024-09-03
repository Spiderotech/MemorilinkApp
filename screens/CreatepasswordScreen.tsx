import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from "../Utils/Auth/axios";
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const CreatepasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { confirmation_code, username } = route.params; // get the data from email link redirection using linking 

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSavePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/reset', { username, code: confirmation_code, password }); // setup new password axios call to backend cognito with confirmation code and new password 
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password has been reset successfully',
          visibilityTime: 2000,
        });
        navigation.navigate('Signin');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to reset password',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to reset password',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
    <View style={styles.container}>
      {/* First Section with Bottom Curve */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#18426D', '#286EB5', '#64D2FF']}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <ArrowLeftIcon size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Reset Password</Text>
            </View>
            {/* password adding input components */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#10BAFF"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <EyeSlashIcon size={20} color="#10BAFF" />
                  ) : (
                    <EyeIcon size={20} color="#10BAFF" />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>Confirm password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!confirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#10BAFF"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                >
                  {confirmPasswordVisible ? (
                    <EyeSlashIcon size={20} color="#10BAFF" />
                  ) : (
                    <EyeIcon size={20} color="#10BAFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* Second Section with Gradient */}
      <LinearGradient
        colors={['#18426D', '#286EB5', '#64D2FF']}
        style={styles.footerGradient}
      >
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: loading ? 'gray' : 'white' }]}
          onPress={handleSavePassword}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
},
  container: {
    flex: 1,
    backgroundColor: '#18426D',
  },
  headerContainer: {
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    flex: 1,
    width: width * 1.3,
    borderBottomLeftRadius: width * 0.7,
    borderBottomRightRadius: width * 0.7,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: width * 0.1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: height * 0.05,
    paddingHorizontal: width * 0.1,
  },
  backButton: {
    marginRight: 15,
    marginTop: 10,
  },
  headerTitle: {
    color: 'white',
        fontSize: width * 0.05,
        fontWeight: '300',
        textAlign: 'center',
        flex: 1,
        marginRight: width * 0.09,
  },
  inputContainer: {
    marginTop: height * 0.05,
    paddingHorizontal: width * 0.1,
  },
  inputLabel: {
    color: 'white',
    fontSize: width * 0.05,
    marginTop: height * 0.02,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#10BAFF',
    color: 'white',
    fontSize: width * 0.045,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: height * 0.015,
  },
  footerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.05,
  },
  saveButton: {
    width: '80%',
    paddingVertical: height * 0.02,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#16436C',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
});

export default CreatepasswordScreen;
