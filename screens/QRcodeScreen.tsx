import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, StyleSheet, Dimensions } from 'react-native';
import { ArrowLeftIcon, CameraIcon } from 'react-native-heroicons/solid';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from "../Utils/Family/axios";

const { width, height } = Dimensions.get('window');

const QRcodeScreen = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);
// get the user profile data for show the user detail in the qr code screen and setup user qr code according to the userid 
    const fetchUserData = async () => {
        try {
            const profileResponse = await axios.get('/auth/profile'); //get user data api 
            setUserData(profileResponse.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );

    const userId = userData?.id; // setup userid 

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} >
                        <ArrowLeftIcon size={width * 0.05} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>My QR code</Text>
                </View>
            </SafeAreaView>
            <View style={styles.profileContainer}>
                <TouchableOpacity style={styles.profileImageContainer}>
                    <Image source={userData?.profile_image ? { uri: userData.profile_image } : require('../assets/profile.png')}style={styles.profileImage} />
                </TouchableOpacity>
                <Text style={styles.profileName}>{userData?.full_name}</Text>
            </View>
             {/* user qr code with redirection link   */}
            <View style={styles.qrCodeContainer}>
                <View style={styles.qrCodeWrapper}>
                    <QRCode value={`https://www.memorilink.com/user/${userId}`} size={width * 0.5} />
                </View>
            </View>
             {/* Qr scaner navigator  */}
            <View style={styles.scanButtonContainer}>
                <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('QR')}> 
                    <CameraIcon size={width * 0.05} color="white" />
                    <Text style={styles.scanButtonText}>Scan QR Code</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flex: 0,
        backgroundColor: '#18426D',
        height: height * 0.25,
        borderBottomLeftRadius: width * 0.09,
        borderBottomRightRadius: width * 0.09,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: height * 0.05,
        paddingHorizontal: width * 0.05,
    },
    headerTitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.05,
    },
    headerTitle: {
        color: 'white',
        fontSize: width * 0.05,
        fontWeight: '300',
    },
    profileContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -height * 0.075,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: height * 0.01,
    },
    profileImage: {
        width: width * 0.24,
        height: width * 0.24,
        borderRadius: width * 0.12,
        borderWidth: 4,
        borderColor: 'white',
    },
    profileName: {
        color: 'black',
        fontSize: width * 0.05,
        fontWeight: '600',
        marginBottom: height * 0.02,
    },
    qrCodeContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.05,
    },
    qrCodeWrapper: {
        width: width * 0.6,
        height: width * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: width * 0.05,
        borderWidth: 2,
        borderColor: '#286EB5',
    },
    scanButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.05,
    },
    scanButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E90FF',
        width: width * 0.4,
        height: height * 0.05,
        borderRadius: width * 0.02,
    },
    scanButtonText: {
        color: 'white',
        fontSize: width * 0.04,
        marginLeft: width * 0.02,
    },
});

export default QRcodeScreen;
