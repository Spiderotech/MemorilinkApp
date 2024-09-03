import React, { useState, useContext } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from "../Utils/Auth/axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../AuthContext'; // Import the AuthContext
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const SigninScreen = () => {
    const navigation = useNavigation();
    const { setIsLoggedIn, checkLoginStatus } = useContext(AuthContext); // Use the AuthContext
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // email validation
        return regex.test(email);
    };
    
    // login form validation 

    const handleLogin = async () => {
        let valid = true;

        if (!validateEmail(email)) {
            setEmailError('Invalid email address'); // validation error
            valid = false;
        } else {
            setEmailError('');
        }

        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters long'); // validation error
            valid = false;
        } else {
            setPasswordError('');
        }

        if (valid) {
            try {

                var fcmToken = await AsyncStorage.getItem('fcmToken'); // get device token form async storage 
                console.log(fcmToken, "Token fetched from AsyncStorage");
               
                
                const response = await axios.post('/signin', { email, password, fcmToken });// sigin api call

                if (response.status === 200) {
                    const { email_verified, ...userData } = response.data;

                    console.log(response.data);
                    

                    if (email_verified) {
                        await AsyncStorage.setItem('userData', JSON.stringify(userData));
                        setIsLoggedIn(true); // Update login status
                        checkLoginStatus(); // Ensure the login status is checked
                        navigation.navigate('Main');// home navigation 
                    } else {
                        const userId = response.data.userId;
                        setPasswordError('Verification code sent to your email!'); // api error
                        Toast.show({ 
                            type: 'success',
                            text1: 'Verification',
                            text2: 'Verification link sent to your email!',
                            visibilityTime: 4000,
                        });
                        setTimeout(() => {
                            navigation.navigate('Otpverification', { username: userId });
                          }, 3000); 
                    }
                } else {
                    setPasswordError('Invalid email or password!'); // api error
                }
            } catch (error) {
                console.error(error);
                setPasswordError('Invalid email or password!'); // api error
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <LinearGradient
                        colors={['#18426D', '#286EB5', '#64D2FF']}
                        style={styles.gradient}
                    >
                        <SafeAreaView style={styles.safeArea}>
                            <View style={styles.backContainer}>
                                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                    <ArrowLeftIcon size={24} color="white" />
                                </TouchableOpacity>
                                <Text style={styles.welcomeText}>Welcome back</Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Your email</Text>
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

                                <Text style={styles.label}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter your password"
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

                                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                    <Text style={styles.forgotText}>Forgot?</Text>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>
                </View>

                <LinearGradient
                    colors={['#18426D', '#286EB5', '#64D2FF']}
                    style={styles.footer}
                >
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.signupText}>Don't have an account? Sign up now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Log in</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#18426D',
    },
    header: {
        height: height * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradient: {
        flex: 1,
        width: width * 1.3,
        borderBottomLeftRadius: width * 0.7,
        borderBottomRightRadius: width * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    safeArea: {
        flex: 1,
        width: '100%',
        paddingHorizontal: width * 0.1,
    },
    backContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.05,
        paddingHorizontal: width * 0.1,
    },
    backButton: {
        marginRight: width * 0.01,
    },
    welcomeText: {
        color: 'white',
        fontSize: width * 0.06,
        fontWeight: '300',
        textAlign: 'center',
        flex: 1,
        marginRight: width * 0.09,
    },
    inputContainer: {
        marginTop: height * 0.05,
        paddingHorizontal: width * 0.1,
    },
    label: {
        color: 'white',
        fontSize: width * 0.05,
        fontWeight: '300',
        marginTop: height * 0.02,
    },
    input: {
        width: '100%',
        marginTop: height * 0.01,
        paddingVertical: height * 0.01,
        borderBottomWidth: 2,
        borderBottomColor: '#10BAFF',
        color: 'white',
        fontSize: width * 0.05,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.02,
        borderBottomWidth: 2,
        borderBottomColor: '#10BAFF',
    },
    passwordInput: {
        flex: 1,
        paddingVertical: height * 0.01,
        color: 'white',
        fontSize: width * 0.05,
    },
    errorText: {
        color: 'red',
        marginTop: height * 0.01,
    },
    forgotText: {
        color: 'white',
        fontSize: width * 0.035,
        fontWeight: '500',
        textAlign: 'right',
        marginTop: height * 0.01,
    },
    footer: {
        flex: 1,
        paddingHorizontal: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        color: 'white',
        fontSize: width * 0.035,
        textAlign: 'center',
        marginVertical: height * 0.02,
    },
    loginButton: {
        width: width * 0.6,
        height: height * 0.06,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    },
    loginButtonText: {
        color: '#16436C',
        fontSize: width * 0.045,
        fontWeight: '600',
    },
});

export default SigninScreen;
