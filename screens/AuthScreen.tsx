import React from 'react';
import { SafeAreaView, Text, Image, View, TouchableOpacity, Dimensions } from 'react-native';
import 'nativewind'; // Import NativeWind
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const AuthScreen = () => {
    const navigation = useNavigation();
    return (
        <LinearGradient colors={['#18426D', '#286EB5', '#64D2FF']} style={{ flex: 1 }}>
            {/* Header area */}
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* logo */}
                <Image source={require('../assets/logo.png')} style={{ width: width * 0.8, height: height * 0.1, resizeMode: 'contain', marginBottom: height * 0.1 }} />
                <View style={{ position: 'absolute', bottom: 0, height: height * 0.5, width: width * 1.6 }}>
                    {/* gradient section for background color */}
                    <LinearGradient
                        colors={['#10BAFF', '#286EB5', '#286EB5']}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            borderTopLeftRadius: width * 0.75,
                            borderTopRightRadius: width * 0.75,
                        }}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: height * 0.05, width: width * 0.6 }}>
                            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '300', fontSize: width * 0.03, width: width * 0.65, padding: width * 0.05 }}>
                                By continuing, you agree to our Terms of Service and Privacy Policy
                            </Text>
                            {/* get started button for new user signup */}
                            <TouchableOpacity style={{ width: width * 0.6, height: height * 0.06, padding: width * 0.03, backgroundColor: '#17A4EA', borderRadius: 999, marginBottom: height * 0.02 }} onPress={() => navigation.navigate('Signup')}>
                                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '500', fontSize: width * 0.04 }}>Get started</Text>
                            </TouchableOpacity>
                            {/* I have account button for user sign in */}
                            <TouchableOpacity style={{ width: width * 0.6, height: height * 0.06, padding: width * 0.03, backgroundColor: 'white', borderRadius: 999 }} onPress={() => navigation.navigate('Signin')}>
                                <Text style={{ color: 'black', textAlign: 'center', fontWeight: '500', fontSize: width * 0.04 }}>I have account</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default AuthScreen;
