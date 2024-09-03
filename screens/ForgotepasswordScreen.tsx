import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from "../Utils/Auth/axios";
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
// forgote password email validation 
    const handleResetPassword = async () => {
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Success',
                text2: 'Please enter your email',
                visibilityTime: 3000,
            });
            return;
        }

        setLoading(true);
// forgotte password requst api call 
        try {
            const response = await axios.post('/forgot', { email });
            if (response.status === 200) {

                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Link sent to the email for verification',
                    visibilityTime: 8000,
                });
    
                
                setEmail('');
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to send reset link',
                    visibilityTime: 8000,
                });
                
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error occurred while sending the reset link',
                visibilityTime: 8000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
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
                                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                            <ArrowLeftIcon size={24} color="white" />
                                        </TouchableOpacity>
                                        <Text style={styles.headerText}>
                                            Reset Password
                                        </Text>
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
                            style={[styles.resetButton, loading ? styles.buttonDisabled : styles.buttonEnabled]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            <Text style={styles.resetButtonText}>
                                {loading ? 'Sending...' : 'Reset Password'}
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </KeyboardAvoidingView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
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
        marginRight: width * 0.09,
       
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
    footerGradient: {
        flex: 1,
        paddingHorizontal: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resetButton: {
        width: width * 0.6,
        height: height * 0.06,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    },
    buttonEnabled: {
        backgroundColor: 'white',
    },
    buttonDisabled: {
        backgroundColor: 'gray',
    },
    resetButtonText: {
        color: '#16436C',
        fontSize: width * 0.045,
        fontWeight: '600',
    },
});

export default ForgotPasswordScreen;
