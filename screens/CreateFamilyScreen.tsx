import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, SafeAreaView, Alert, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import axios from "../Utils/Family/axios";
import sb from '../sendbird';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const CreateFamilyScreen = () => {
    const navigation = useNavigation();
    const [name, setFamilyName] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [media, setMedia] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // media selecion for family creation with image cropping 

    const selectMedia = async () => {
        try {
            const images = await ImagePicker.openPicker({
                mediaType: 'photo',
                multiple: true,
            });

            const croppedImages = [];

            for (let image of images) {
                const croppedImage = await ImagePicker.openCropper({
                    path: image.path,
                    width: 800,
                    height: 800,
                    mediaType: 'photo',
                });
                croppedImages.push({
                    uri: croppedImage.path,
                    width: croppedImage.width,
                    height: croppedImage.height,
                    mime: croppedImage.mime,
                    fileName: croppedImage.path.split('/').pop(),
                });
            }

            setMedia(prevMedia => [...prevMedia, ...croppedImages]);
        } catch (error) {
            console.log('Error selecting or cropping images: ', error);
        }
    };

    // function for  setup family group channel for chat in senbird chat sdk using  family data 

    const createSendBirdGroupChannel = async (familyName, creatorId, profileImageUrl, familyId) => {
        return new Promise((resolve, reject) => {
            const params = new sb.GroupChannelParams();
            params.name = familyName;
            params.operatorUserIds = [creatorId];
            params.coverUrl = profileImageUrl;
            params.isPublic = true;
            params.isDistinct = false;
            params.isSuper = false;
            params.data = JSON.stringify({ familyId: familyId });
            params.customType = 'family';

            sb.GroupChannel.createChannel(params, (channel, error) => {
                if (error) {
                    console.error('SendBird channel creation failed:', error);
                    return reject(error);
                }
                console.log('SendBird channel created:', channel);
                resolve(channel);
            });
        });
    };

    // create family screen validation function 

    const handleCreateFamily = async () => {
        const newErrors = {};
        if (!name) newErrors.name = 'Family Name is required';
        if (!category) newErrors.category = 'Category is required';
        if (!location) newErrors.location = 'Location is required';
        if (!bio) newErrors.bio = 'Bio is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        const data = {
            name,
            category,
            location,
            bio,
        };
        // create family in databse 

        try {
            const response = await axios.post('/family', data);
            const familyData = response.data[0];
            const familyId = familyData.id;
            const creatorId = familyData.user_id.toString();

            const files = media.map(item => ({ file_name: item.fileName, mime: item.mime })); // media uploading  
            const urlResponse = await axios.post(`/family/${familyId}/get-signed-url`, { files }); //setup url for image uploading 
            const signedUrl = urlResponse.data[0].url;

            const file = media[0];
            const localFileUrl = file.uri;

            const imageResponse = await fetch(localFileUrl);
            const blob = await imageResponse.blob();

            const uploadResponse = await fetch(signedUrl, { // add image in s3 bucket 
                method: 'PUT',
                body: blob,
            });

            const profileImageUrl = signedUrl.split('?')[0];

            const channel = await createSendBirdGroupChannel(name, creatorId, profileImageUrl, familyId); // create sendbird channel 

            console.log(channel,"chaneel data ");
            

            channel.inviteWithUserIds([creatorId], (response, error) => { // add  family creator in the senbird chat as admin 
                if (error) {
                    console.error('SendBird invite failed:', error);
                    throw error;
                }
                console.log('SendBird invite response:', response);
            });

            const familyurl=channel.url

            try {
                await axios.put(`/family/${familyId}`, { channelUrl: familyurl }); // add sendbird family chat uel in database 
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Link and group channel created successfully',
                    visibilityTime: 3000,
                });
                setTimeout(() => {
                    navigation.navigate('Familylist', { familyId: familyId });  //family screen navigation 
                }, 3000);
            } catch (updateError) {
                console.error('Error updating channel URL:', updateError);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2:  'Failed to update channel URL',
                    visibilityTime: 3000,
                });
                
            }
        } catch (error) {
            console.error('Error creating link:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2:  'Failed to create link',
                visibilityTime: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon size={width * 0.05} color="black" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Create Link</Text>
                </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileImageContainer}>
                    <TouchableOpacity style={styles.profileImageButton} onPress={selectMedia}>
                        {media.length > 0 ? (
                            <Image source={{ uri: media[0].uri }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.profileImagePlaceholder}>
                                <Text style={styles.profileImagePlaceholderText}>+</Text>
                            </View>
                        )}
                        <View style={styles.profileImageOverlay}>
                            <Text style={styles.profileImageOverlayText}>+</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.formContainer}>
                    <View style={styles.formItem}>
                        <Text style={styles.formLabel}>Group Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setFamilyName}
                            style={styles.formInput}
                            placeholderTextColor="#18426D"
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>
                    <View style={styles.formItem}>
                        <Text style={styles.formLabel}>Category</Text>
                        <TextInput
                            value={category}
                            onChangeText={setCategory}
                            style={styles.formInput}
                            placeholderTextColor="#18426D"
                        />
                        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                    </View>
                    <View style={styles.formItem}>
                        <Text style={styles.formLabel}>Location</Text>
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            style={styles.formInput}
                            placeholderTextColor="#18426D"
                        />
                        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
                    </View>
                    <View style={styles.formItem}>
                        <Text style={styles.formLabel}>Discription</Text>
                        <TextInput
                            value={bio}
                            onChangeText={setBio}
                            multiline={true}
                            numberOfLines={4}
                            style={styles.bioInput}
                        />
                        {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
                    </View>
                    <View style={styles.submitButtonContainer}>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleCreateFamily}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Create Family</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
        marginTop: height * 0.05,
        paddingHorizontal: width * 0.05,
    },
    headerTitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        color: 'black',
        fontSize: width * 0.05,
        fontWeight: '300',
        textAlign: 'center',
        marginRight: width * 0.05,
    },
    profileImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.05,
    },
    profileImageButton: {
        alignItems: 'center',
        position: 'relative',
    },
    profileImage: {
        width: width * 0.28,
        height: width * 0.28,
        borderRadius: width * 0.14,
        borderWidth: 4,
        borderColor: 'white',
    },
    profileImagePlaceholder: {
        width: width * 0.28,
        height: width * 0.28,
        borderRadius: width * 0.14,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'gray',
    },
    profileImagePlaceholderText: {
        fontSize: width * 0.05,
        
    },
    profileImageOverlay: {
        position: 'absolute',
        bottom: height * 0.015,
        right: width * 0.02,
        width: width * 0.08,
        height: width * 0.08,
        borderRadius: width * 0.04,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'gray',
    },
    profileImageOverlayText: {
        fontSize: width * 0.05,
        color: '#18426D',
    },
    formContainer: {
        paddingHorizontal: width * 0.05,
        marginTop: height * 0.05,
    },
    formItem: {
        marginBottom: height * 0.03,
    },
    formLabel: {
        marginBottom: height * 0.005,
        color: '#848488',
        fontSize: width * 0.04,
        fontWeight: '500',
    },
    formInput: {
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        paddingBottom: height * 0.01,
        color: '#18426D',
    },
    bioInput: {
        backgroundColor: '#EFEFF0',
        height: height * 0.15,
        borderRadius: 7,
        padding: width * 0.05,
        textAlignVertical: 'top',
    },
    errorText: {
        color: 'red',
        fontSize: width * 0.03,
    },
    submitButtonContainer: {
        alignItems: 'center',
        marginBottom: height * 0.05,
    },
    submitButton: {
        padding: height * 0.01,
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40%',
        borderRadius: 7,
        marginTop: height * 0.02,
    },
    submitButtonText: {
        color: 'white',
        fontSize: width * 0.04,
        fontWeight: '500',
    },
});

export default CreateFamilyScreen;
