import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from "../Utils/Auth/axios";

const { width, height } = Dimensions.get('window');

const OtpVerificationScreen = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation();
    const route = useRoute();
    const { username } = route.params; // Get username from navigation params

    const validateOtp = async () => {
        const otpRegex = /^[0-9]{6}$/;
        if (otpRegex.test(otp)) {
            setError('');
            try {
                const response = await axios.post('/confirm', { code: otp, username: username }); // Confirm OTP for email verification
                if (response.status === 200) {
                    navigation.navigate('Welcome'); // Navigate to Welcome screen after verification
                } else {
                    setError('Invalid OTP');
                }
            } catch (error) {
                setError('Invalid OTP');
            }
        } else {
            setError('OTP must be a 6-digit number');
        }
    };

    return (
        <View style={styles.container}>
            {/* First Section with Bottom Curve */}
            <View style={styles.headerSection}>
                <LinearGradient
                    colors={['#18426D', '#286EB5', '#64D2FF']}
                    style={styles.headerGradient}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <View>
                            <View style={styles.headerContent}>
                                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Signin')}>
                                    <ArrowLeftIcon size={24} color="white" />
                                </TouchableOpacity>
                                <Text style={styles.headerText}>
                                    OTP Verification
                                </Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Your OTP</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your OTP here"
                                    placeholderTextColor="#10BAFF"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={(text) => {
                                        setOtp(text);
                                        setError('');
                                    }}
                                />
                                {error ? (
                                    <Text style={styles.errorText}>{error}</Text>
                                ) : null}
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
                <TouchableOpacity style={styles.verifyButton} onPress={validateOtp}>
                    <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#18426D',
    },
    headerSection: {
        height: height * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerGradient: {
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
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.05,
        paddingHorizontal: width * 0.1,
    },
    backButton: {
        marginRight: width * 0.02,
    },
    headerText: {
        color: 'white',
        fontSize: width * 0.06,
        fontWeight: '300',
        textAlign: 'center',
        flex: 1,
       
    },
    inputContainer: {
        marginTop: height * 0.15,
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
    errorText: {
        color: 'red',
        marginTop: height * 0.01,
        fontSize: width * 0.035,
    },
    footerGradient: {
        flex: 1,
        paddingHorizontal: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyButton: {
        width: width * 0.6,
        height: height * 0.06,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        backgroundColor: 'white',
    },
    verifyButtonText: {
        color: '#16436C',
        fontSize: width * 0.045,
        fontWeight: '600',
    },
});

export default OtpVerificationScreen;
