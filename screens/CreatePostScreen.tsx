import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, SafeAreaView, ScrollView, Alert, ActionSheetIOS, Platform, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { XMarkIcon, PaperAirplaneIcon, PaperClipIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import axios from '../Utils/Family/axios';
import ActionSheet from 'react-native-actionsheet';
import Video from 'react-native-video';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const CreatePostScreen = () => {
    const navigation = useNavigation();
    const [media, setMedia] = useState([]);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [name, setName] = useState('');
    const [inputHeight, setInputHeight] = useState(40);

    // get the current user data 

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const profileResponse = await axios.get('/auth/profile');
                setName(profileResponse.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    // action sheet for selecting media file from the device 

    let actionSheet = null;

    const showActionSheet = () => {
        actionSheet.show();
    };

    // meda validation for images  and selction of media 

    const handleActionSheet = async (index) => {
        if (media.length >= 5) {
            Toast.show({
                type: 'error',
                text1: 'Limit Reached',
                text2: 'You can only select up to 5 media files.',
                visibilityTime: 3000,
            });
            return;
        }

        try {
            if (index === 1) {
                // Take photo or video
                const mediaFile = await ImagePicker.openCamera({
                    mediaType: 'any',
                });

                if (mediaFile.mime.startsWith('video/')) {
                    if (media.some(item => item.mime.startsWith('video/'))) {
                        Toast.show({
                            type: 'error',
                            text1: 'Limit Reached',
                            text2: 'You can only select one video file',
                            visibilityTime: 3000,
                        });
                        return;
                    }
                    setMedia(prevMedia => [...prevMedia, {
                        uri: mediaFile.path,
                        width: mediaFile.width,
                        height: mediaFile.height,
                        mime: mediaFile.mime,
                        fileName: mediaFile.path.split('/').pop(),
                    }]);
                } else {
                    const croppedImage = await ImagePicker.openCropper({
                        path: mediaFile.path,
                        width: 800,
                        height: 800,
                        mediaType: 'photo',
                    });

                    setMedia(prevMedia => [...prevMedia, {
                        uri: croppedImage.path,
                        width: croppedImage.width,
                        height: croppedImage.height,
                        mime: croppedImage.mime,
                        fileName: croppedImage.path.split('/').pop(),
                    }]);
                }
            } else if (index === 2) {
                // Choose from gallery
                const remainingSlots = 5 - media.length;
                const mediaFiles = await ImagePicker.openPicker({
                    mediaType: 'any',
                    multiple: true,
                    maxFiles: remainingSlots,
                });

                const processedMediaFiles = [];

                // video file vavlidation 

                for (let mediaFile of mediaFiles) {
                    if (mediaFile.mime.startsWith('video/')) {
                        if (media.some(item => item.mime.startsWith('video/'))) {
                            Toast.show({
                                type: 'error',
                                text1: 'Limit Reached',
                                text2: 'You can only select one video file',
                                visibilityTime: 3000,
                            });
                            return;
                        }
                        processedMediaFiles.push({
                            uri: mediaFile.path,
                            width: mediaFile.width,
                            height: mediaFile.height,
                            mime: mediaFile.mime,
                            fileName: mediaFile.path.split('/').pop(),
                        });
                    } else {
                        const croppedImage = await ImagePicker.openCropper({
                            path: mediaFile.path,
                            width: 800,
                            height: 800,
                            mediaType: 'photo',
                        });
                        processedMediaFiles.push({
                            uri: croppedImage.path,
                            width: croppedImage.width,
                            height: croppedImage.height,
                            mime: croppedImage.mime,
                            fileName: croppedImage.path.split('/').pop(),
                        });
                    }
                }

                setMedia(prevMedia => [...prevMedia, ...processedMediaFiles]);
            }
        } catch (error) {
            console.log('Error selecting or processing media: ', error);

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Error selecting or processing media.',
                visibilityTime: 3000,
            });
        }
    };

    // action sheet for ios 

    const selectMedia = async () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo or Video', 'Choose from Gallery'],
                    cancelButtonIndex: 0,
                },
                async (buttonIndex) => {
                    await handleActionSheet(buttonIndex);
                }
            );
        } else {
            showActionSheet();
        }
    };

    const handleRemoveMedia = (index) => {
        setMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {

        // description and media valiadtion 

        if (!description.trim()  && media.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Cannot Create Post',
                text2: 'Please add a description or media before posting.',
                visibilityTime: 3000,
            });
            return;
        }
        setUploading(true);

        try {
            console.log("working....");

            // Step 1: Create the post and get the post ID
            const response = await axios.post('/posts', { description });

            console.log(response.data);

            const postId = response.data[0].id;
            console.log(postId);

            console.log(media);

            // Step 2: Request presigned URLs for the media files using the post ID
            const files = media.map(item => ({ file_name: item.fileName, mime: item.mime }));
            const urlResponse = await axios.post(`/posts/${postId}/get-signed-url`, { files });
            const signedUrls = urlResponse.data.urls;

            console.log('Signed URLs:', signedUrls);

            // Step 3: Upload each image to the presigned URL
            await Promise.all(
                signedUrls.map(async ({ url, file_name }) => {
                    const mediaFile = media.find(item => item.fileName === file_name);
                    const response = await fetch(mediaFile.uri);
                    const blob = await response.blob();

                    const uploadResponse = await fetch(url, {
                        method: 'PUT',
                        body: blob,
                    });

                    console.log(`Response for ${file_name}:`, uploadResponse);
                    const responseText = await uploadResponse.text();
                    console.log(`Response text for ${file_name}:`, responseText);
                })
            );

            setDescription('');
            setMedia([]);
            navigation.navigate('Postshare', { postId: postId });
        } catch (error) {
            console.error('Error during API call:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error occurred while creating the post',
                visibilityTime: 3000,
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', marginTop: height * 0.02, paddingHorizontal: width * 0.05, alignItems: 'center' }}>
                <TouchableOpacity style={{ marginTop: height * 0.01, marginLeft: width * 0.05 }} onPress={() => navigation.goBack()}>
                    <XMarkIcon size={width * 0.08} color="black" />
                </TouchableOpacity>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 0, right: 0 }}>
                    <Text style={{ fontSize: width * 0.05, color: 'black', fontWeight: '300', letterSpacing: 1.5 }}>
                        Create Post
                    </Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: "10%", marginBottom:height * 0.035 }}>
                <View style={{ backgroundColor: '#EFEFF0', width: width * 0.9, borderRadius: width * 0.05, paddingBottom: height * 0.035,marginBottom: height * 0.1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: width * 0.05 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={name.profile_image ?{ uri: name.profile_image }:require('../assets/profile.png')} style={{ width: width * 0.12, height: width * 0.12, borderRadius: width * 0.06, marginRight: width * 0.03 }} />
                            <View>
                                <Text style={{ fontSize: width * 0.04, fontWeight: '600' }}>{name.full_name}</Text>
                                <Text style={{ fontSize: width * 0.025, fontWeight: '500', color: 'gray', marginTop: height * 0.005 }}>just now</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={{ marginTop: height * 0.01, marginLeft: width * 0.05 }} onPress={handleSubmit}>
                            <PaperAirplaneIcon size={width * 0.08} color="#18426D" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ borderBottomColor: '#ABB0BC', borderBottomWidth: 1, width: '100%' }} /> 
                     {/* discription input component setup accroding to the length of the content  */}
                    <View style={{ padding: width * 0.05 }}>
                        <TextInput
                            placeholder="Share your thoughts ....."
                            value={description}
                            onChangeText={setDescription}
                            onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
                            style={{ fontSize: width * 0.035, height: Math.max(10, inputHeight), width: '100%', paddingBottom: height * 0.009 }}
                            placeholderTextColor="#848488"
                            multiline
                        />
                    </View>
                      {/* show the selected image or video files also add the selction remove option  */}
                    <ScrollView horizontal>
                        {media.map((item, index) => (
                            <View key={index} style={{ padding: width * 0.05 }}>
                                {item.mime.startsWith('image/') ? (
                                    <View>
                                        <Image
                                            source={{ uri: item.uri }}
                                            style={{ width: width * 0.2, height: height * 0.1, borderRadius: 19, overflow: 'hidden' }}
                                        />
                                        <TouchableOpacity
                                            style={{
                                                position: 'absolute',
                                                top: 5,
                                                right: 5,
                                                backgroundColor: '#18426D',
                                                borderRadius: 50, // Adjust the radius as needed
                                                padding: 2 // Add some padding for better visual appearance
                                            }}
                                            onPress={() => handleRemoveMedia(index)}
                                        >
                                            <XMarkIcon size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View>
                                        <Video
                                            source={{ uri: item.uri }}
                                            style={{ width: width * 0.2, height: height * 0.1,resizeMode: 'cover', borderRadius: 19, overflow: 'hidden' }}
                                            controls={true}
                                        />
                                        <TouchableOpacity
                                            style={{ position: 'absolute', top: 5, right: 5 }}
                                            onPress={() => handleRemoveMedia(index)}
                                        >
                                            <XMarkIcon size={20} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',  }}>
                        <TouchableOpacity style={{ marginTop: height * 0.01, marginLeft: width * 0.05 }} onPress={selectMedia}>
                            <PaperClipIcon size={width * 0.08} color="#18426D" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <ActionSheet
                ref={o => actionSheet = o}
                title={'Select Media'}
                options={['Cancel', 'Take Photo or Video', 'Choose from Gallery']}
                cancelButtonIndex={0}
                onPress={(index) => handleActionSheet(index)}
            />
            <Modal
                visible={uploading}
                transparent={true}
                animationType="fade"
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ padding: width * 0.05, backgroundColor: 'white', borderRadius: width * 0.03 }}>
                        <ActivityIndicator size="large" color="#18426D" />
                        <Text style={{ marginTop: height * 0.01 }}>Uploading...</Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CreatePostScreen;
