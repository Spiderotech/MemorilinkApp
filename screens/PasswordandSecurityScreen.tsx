import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, StyleSheet, Dimensions } from 'react-native';
import { ArrowLeftIcon, EyeIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import axios from "../Utils/Auth/axios";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const PasswordandSecurityScreen = () => {
    const navigation = useNavigation();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
// user auhenticated password changing 
    const handlePasswordChange = async () => {
        if (newPassword !== confirmNewPassword) { // password checking 
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'New passwords do not match',
                visibilityTime: 3000,
            });
            return;
        }

        if (!oldPassword || !newPassword || !email) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields',
                visibilityTime: 3000,
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.put('/change/email', { // password changing api call contain email , newpassword , and old password 
                email:email,
                oldPassword:oldPassword,
                newPassword:newPassword,
            });

            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Password changed successfully',
                    visibilityTime: 3000,
                });
                setTimeout(() => {
                    navigation.goBack(); // after sucess navigaion to settings screen 
                }, 3000);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to change password',
                    visibilityTime: 3000,
                });
            }
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to change password',
                visibilityTime: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

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
                    <Text style={styles.title}>Change Password</Text>
                </View>
            </View>

            <View style={styles.formContainer}>
                {/* Old Password Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Old Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#18426D"
                        secureTextEntry={!showOldPassword}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowOldPassword(!showOldPassword)}
                    >
                        <EyeIcon size={20} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* New Password Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#18426D"
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                        <EyeIcon size={20} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* Confirm New Password Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#18426D"
                        secureTextEntry={!showConfirmNewPassword}
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    >
                        <EyeIcon size={20} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#18426D"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* Update Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, loading ? styles.buttonDisabled : styles.buttonEnabled]}
                        onPress={handlePasswordChange}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Updating...' : 'Update'}
                        </Text>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        marginTop: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    backButton: {
        marginTop: 5,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: 'black',
        fontSize: 20,
        fontWeight: '300',
        textAlign: 'center',
        letterSpacing: 2,
    },
    formContainer: {
        paddingHorizontal: 20,
        marginTop: 40,
    },
    inputContainer: {
        marginBottom: 20,
        position: 'relative',
    },
    label: {
        marginBottom: 5,
        color: '#848488',
        fontSize: 17,
        fontWeight: '500',
    },
    input: {
        borderBottomWidth: 2,
        borderBottomColor: 'gray',
        paddingBottom: 5,
        paddingRight: 30,
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        bottom: 10,
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        padding: 10,
        width: 150,
        height: 40,
        borderRadius: 7,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonEnabled: {
        backgroundColor: '#1E90FF',
    },
    buttonDisabled: {
        backgroundColor: 'gray',
    },
    buttonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '500',
    },
});

export default PasswordandSecurityScreen;
