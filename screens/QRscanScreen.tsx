import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Platform, Alert, SafeAreaView, PermissionsAndroid, Dimensions, Animated } from 'react-native';
import { ArrowLeftIcon, QrCodeIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { width, height } = Dimensions.get('window');
const screenWidth = Dimensions.get('window').width;

const QRscanScreen = () => {
    const navigation = useNavigation();
    const [isScannerActive, setIsScannerActive] = useState(true);
    const animatedValue = new Animated.Value(0);
// setup permisson for camera acess
    useEffect(() => {
        const requestCameraPermission = async () => {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'App needs camera permission to scan QR codes',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Camera permission denied');
                }
            } else {
                const result = await request(PERMISSIONS.IOS.CAMERA);
                if (result === RESULTS.GRANTED) {
                    console.log('Camera permission granted');
                } else {
                    Alert.alert('Camera permission denied');
                }
            }
        };

        requestCameraPermission();
// anmation to the scanner border 
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    const animatedStyle = {
        borderColor: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['#286EB5', '#FFFFFF'],
        }),
        borderWidth: 6,
    };
// scaner function and get the qr url and extract the url to get the familyid or userid for navigation to that screen 
    const onSuccess = (e) => {
        console.log('QR Code Data:', e.data);
        setIsScannerActive(false); 
        const { id, type } = extractIdFromQR(e.data);
        if (id && type) {
            if (type === 'family') {
                navigation.navigate('Familylist', { familyId: id }); // famly qr navigation
            } else if (type === 'user') {
                navigation.navigate('FriendProfile', { userId: id }); // friends qr navigation 
            }
        } else {
            Alert.alert('Invalid QR Code');
            setIsScannerActive(true); 
        }
    };
// qr extraction function 
    const extractIdFromQR = (data) => {
        console.log('Extracting ID from QR data:', data);
        const familyPattern = /^https:\/\/www\.memorilink\.com\/family\/(.+)$/;
        const userPattern = /^https:\/\/www\.memorilink\.com\/user\/(.+)$/;

        const familyMatch = familyPattern.exec(data);
        const userMatch = userPattern.exec(data);

        if (familyMatch) {
            console.log('Family ID Match:', familyMatch[1]);
            return { id: familyMatch[1], type: 'family' };
        }
        if (userMatch) {
            console.log('User ID Match:', userMatch[1]);
            return { id: userMatch[1], type: 'user' };
        }

        try {
            const parsedData = JSON.parse(data);
            if (parsedData.familyId) {
                console.log('Parsed Family ID from JSON:', parsedData.familyId);
                return { id: parsedData.familyId, type: 'family' };
            }
            if (parsedData.userId) {
                console.log('Parsed User ID from JSON:', parsedData.userId);
                return { id: parsedData.userId, type: 'user' };
            }
        } catch (error) {
            console.error('Error parsing QR code data as JSON:', error);
            return null;
        }
    };
// reset scanner function
    const resetScanner = () => {
        setIsScannerActive(true);
    };

    return (
        <View className='flex-1 bg-white p-5'>
            <SafeAreaView className="  mb-4">
                <View className="flex-row justify-between mb-2">
                    <TouchableOpacity className="mr-5 mt-1" onPress={() => navigation.goBack()}>
                        <ArrowLeftIcon size={25} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity className="mr-5 mt-1" onPress={() => navigation.navigate('Userqr')}>
                        <QrCodeIcon size={screenWidth * 0.08} color="#16436C" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <View className='flex justify-center items-center'>
                <Text style={{ fontSize: width * 0.05, width: width * 0.4 }} className="text-center font-light text-black mb-4 mt-20">Scan QR Code to Join Family</Text>
            </View>
            <View className="justify-center items-center mt-10">
                <Animated.View style={[{ width: screenWidth * 0.6, height: screenWidth * 0.6, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }, animatedStyle]}>
                    {isScannerActive && (
                        <QRCodeScanner
                            onRead={onSuccess}
                            flashMode={RNCamera.Constants.FlashMode.off}
                            cameraStyle={{ width: '99%', height: '99%', margin: 2, borderRadius: 5, overflow: 'hidden' }}
                            containerStyle={{ width: '99%', height: '99%', margin: 1, borderRadius: 5, overflow: 'hidden' }}
                        />
                    )}
                </Animated.View>
            </View>
            <View className='flex justify-center items-center mt-10'>
                <TouchableOpacity style={{ width: width * 0.3, height: height * 0.052 }} className="p-1 bg-blue-500 flex justify-center items-center rounded-[7px] mt-4" onPress={resetScanner}>
                    <Text style={{ fontSize: width * 0.05 }} className="text-white">Scan</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default QRscanScreen;
