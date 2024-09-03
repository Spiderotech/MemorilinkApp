import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert, StyleSheet, Dimensions, Pressable } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from '../Utils/Family/axios';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const EditProfileScreen = () => {
    const navigation = useNavigation();

    const [fullName, setFullName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [fromPlace, setFromPlace] = useState('');
    const [currentCity, setCurrentCity] = useState('');
    const [favoriteFood, setFavoriteFood] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [profileImageBase64, setProfileImageBase64] = useState(null);
    const [profileImageName, setProfileImageName] = useState('');
    const [profileImageType, setProfileImageType] = useState('');
    const [errors, setErrors] = useState({});

    // get the current user profile data and add the edit form 

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/auth/profile');
                const userData = response.data;

                setFullName(userData.full_name);
                setJobTitle(userData.job_title);
                setSchoolName(userData.school_name);
                setFromPlace(userData.place);
                setCurrentCity(userData.city);
                setFavoriteFood(userData.favorite_food);
                setBio(userData.bio);
                if (userData.profile_image) {
                    setProfileImage({ uri: userData.profile_image });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.alert('Error', 'Could not fetch user data. Please try again.');
            }
        };

        fetchUserData();
    }, []);

    // function for profile image selection  

    const handleImagePick = () => {
        launchImageLibrary({ mediaType: 'photo' }, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const source = { uri: response.assets[0].uri, name: response.assets[0].fileName, type: response.assets[0].type };
                setProfileImage(source);
                setProfileImageName(response.assets[0].fileName);
                setProfileImageType(response.assets[0].type);

                const base64Image = await RNFS.readFile(response.assets[0].uri, 'base64');
                setProfileImageBase64(base64Image);
            }
        });
    };

    // edit profile form valiadtion 

    const validate = () => {
        let valid = true;
        let errors = {};

        if (!fullName) {
            errors.fullName = 'Full Name is required';
            valid = false;
        }
        if (!jobTitle) {
            errors.jobTitle = 'Job Title is required';
            valid = false;
        }
        if (!schoolName) {
            errors.schoolName = 'School Name is required';
            valid = false;
        }
        if (!fromPlace) {
            errors.fromPlace = 'Place of Origin is required';
            valid = false;
        }
        if (!currentCity) {
            errors.currentCity = 'Current City is required';
            valid = false;
        }
        if (!favoriteFood) {
            errors.favoriteFood = 'Favorite Food is required';
            valid = false;
        }
        if (!bio) {
            errors.bio = 'Bio is required';
            valid = false;
        }

        setErrors(errors);
        return valid;
    };

    // upadte profile data function 

    const handleSave = async () => {
        if (validate()) {
            try {
                await axios.put('/auth/profile', {
                    full_name: fullName,
                    job_title: jobTitle,
                    school_name: schoolName,
                    place: fromPlace,
                    city: currentCity,
                    favorite_food: favoriteFood,
                    bio: bio,
                    profile_pic: {
                        uri: profileImageBase64,
                        name: profileImageName,
                        type: profileImageType
                    }
                });
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Profile updated successfully!',
                    visibilityTime: 4000,
                });
                navigation.navigate('Profile');
            } catch (error) {
                console.error('Error updating profile:', error);

                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Could not update profile. Please try again.',
                    visibilityTime: 4000,
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeftIcon size={20} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                </View>
            </View>
            <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={handleImagePick}>
                    {profileImage && profileImage.uri ? (
                        <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.emptyProfileImage}>
                            <Image source={profileImage} style={styles.profileImage} />
                        </View>
                    )}
                    <View style={styles.addIconContainer}>
                        <Text style={styles.addIcon}>+</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollContainer}>
                {[
                    { label: 'Full Name', value: fullName, onChange: setFullName, error: errors.fullName },
                    { label: 'Job Title', value: jobTitle, onChange: setJobTitle, error: errors.jobTitle },
                    { label: 'School Name', value: schoolName, onChange: setSchoolName, error: errors.schoolName },
                    { label: 'Where are you from', value: fromPlace, onChange: setFromPlace, error: errors.fromPlace },
                    { label: 'Current City', value: currentCity, onChange: setCurrentCity, error: errors.currentCity },
                    { label: 'Favorite Food', value: favoriteFood, onChange: setFavoriteFood, error: errors.favoriteFood },
                ].map((field, index) => (
                    <View key={index} style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>{field.label}</Text>
                        <TextInput
                            value={field.value}
                            onChangeText={field.onChange}
                            placeholder={field.label}
                            style={styles.input}
                            placeholderTextColor="#18426D"
                        />
                        {field.error && <Text style={styles.errorText}>{field.error}</Text>}
                    </View>
                ))}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Bio</Text>
                    <TextInput
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell us about yourself..."
                        multiline
                        numberOfLines={4}
                        style={styles.textArea}
                        placeholderTextColor="#18426D"
                    />
                    {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
                </View>
                <View style={styles.saveButtonContainer}>
                <Pressable
                    style={({ pressed }) => [
                        {
                            backgroundColor: pressed ? '#0056b3' : '#007bff',
                        },
                        styles.saveButton,
                    ]}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
            </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        backgroundColor: '#18426D',
        height: height * 0.15,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        justifyContent: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        paddingBottom: height * 0.05,
    },
    headerTitle: {
        color: 'white',
        fontSize: width * 0.05,
        fontWeight: '300',
        textAlign: 'center',
        flex: 1,
        marginRight:width * 0.03,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginTop: -height * 0.05,
    },
    profileImage: {
        width: width * 0.28,
        height: width * 0.28,
        borderRadius: (width * 0.28) / 2,
        borderWidth: 4,
        borderColor: 'white',
    },
    emptyProfileImage: {
        width: width * 0.28,
        height: width * 0.28,
        borderRadius: (width * 0.28) / 2,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'gray',
    },
    addIconContainer: {
        position: 'absolute',
        bottom: 5,
        right: 16,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'gray',
    },
    addIcon: {
        fontSize: 16,
        color: '#18426D',
    },
    scrollContainer: {
        paddingHorizontal: width * 0.05,
    },
    inputContainer: {
        marginBottom: height * 0.02,
    },
    inputLabel: {
        marginBottom: height * 0.01,
        color: '#848488',
        fontSize: width * 0.035,
        fontWeight: '500',
    },
    input: {
        borderBottomWidth: 2,
        borderBottomColor: 'gray',
        paddingBottom: height * 0.01,
        fontSize: width * 0.04,
        fontWeight: '500',
        color: '#18426D',
    },
    textArea: {
        backgroundColor: '#EFEFF0',
        height: height * 0.12,
        borderRadius: 10,
        padding: width * 0.03,
        fontSize: width * 0.04,
        color: '#18426D',
        textAlignVertical: 'top',
    },
    errorText: {
        color: 'red',
        fontSize: width * 0.03,
    },
    saveButtonContainer: {
        alignItems: 'center',
        marginVertical: height * 0.03,
    },
    saveButton: {
        backgroundColor: '#007bff',
        paddingVertical: height * 0.009,
        paddingHorizontal: width * 0.12,
        borderRadius: 10,
    },
    saveButtonText: {
        color: 'white',
        fontSize: width * 0.045,
        fontWeight: '500',
    },
    hoveredButton: {
        backgroundColor: '#18426D',
    },
});

export default EditProfileScreen;
