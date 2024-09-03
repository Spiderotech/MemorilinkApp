import React, { useState } from 'react';
import { Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SignupScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
// name validation 
    const handleNext = () => {
        if (name.trim() === '') {
            setError('Name is required');
        } else {
            setError('');
            navigation.navigate('EmailPassword', { fullname: name }); // navigation to email password  screen 
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                {/* First Section with Bottom Curve */}
                <View style={styles.headerSection}>
                    <LinearGradient
                        colors={['#18426D', '#286EB5', '#64D2FF']}
                        style={styles.headerGradient}
                    >
                        <SafeAreaView style={styles.safeArea}>
                            <View style={styles.headerContent}>
                                <View style={styles.backButtonContainer}>
                                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                        <ArrowLeftIcon size={24} color="white" />
                                    </TouchableOpacity>
                                    <Text style={styles.headerText}>
                                        We'll make this quick
                                    </Text>
                                </View>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>What's your name?</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="First and last name"
                                        placeholderTextColor="#10BAFF"
                                        value={name}
                                        onChangeText={setName}
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
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>Next</Text>
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
        flex: 1,
    },
    backButtonContainer: {
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
    errorText: {
        color: 'red',
        marginTop: height * 0.01,
    },
    footerGradient: {
        flex: 1,
        paddingHorizontal: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButton: {
        width: width * 0.6,
        height: height * 0.06,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    },
    nextButtonText: {
        color: '#16436C',
        fontSize: width * 0.045,
        fontWeight: '600',
    },
});

export default SignupScreen;
