import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Pressable, SafeAreaView, ScrollView, Alert, ActivityIndicator, Dimensions, Image } from 'react-native';
import { ArrowLeftIcon, ClockIcon, PaperClipIcon, MapPinIcon, LinkIcon } from 'react-native-heroicons/outline';
import DatePicker from 'react-native-date-picker';
import { useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import axios from "../Utils/Family/axios";
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const CreateEventScreen = () => {
    const [modalVisible, setModalVisible] = useState(false); // share modale state
    const [startDate, setStartDate] = useState(new Date()); //setup start date
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [eventTime, setEventTime] = useState(new Date());
    const [shareType, setShareType] = useState('');
    const [eventName, setEventName] = useState('');
    const [location, setLocation] = useState('');
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({});
    const [media, setMedia] = useState([]);
    const [triggerCreateEvent, setTriggerCreateEvent] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    useEffect(() => {
        if (triggerCreateEvent) {
            handleCreateEvent();
            setTriggerCreateEvent(false);
        }
    }, [shareType, triggerCreateEvent]);

    // media selection with image cropping 

    const selectMedia = async () => {
        try {
            const images = await ImagePicker.openPicker({
                mediaType: 'photo', // Change to 'any' if you want videos too
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

    // event form validation 

    const handleCreateEvent = async () => {
        const newErrors = {};
        if (!eventName) newErrors.eventName = 'Event Name is required';
        if (!location) newErrors.location = 'Location is required';
        if (!description) newErrors.description = 'Description is required';
        if (media.length === 0) newErrors.attachment = 'Attachment is required';
        if (!link) newErrors.link = 'Link is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        const data = {
            name: eventName,
            start_date: startDate,
            end_date: endDate,
            location: location,
            event_url: link,
            description: description,
            event_share: shareType,
            event_time: eventTime,
        };

        try {
            // Step 1: Create the event
            const response = await axios.post('/events', data);

            const eventId = response.data[0].id;

            if (media.length > 0) {
                // Step 2: Request presigned URLs for the event attachments
                const files = media.map(file => ({ file_name: file.fileName, mime: file.mime }));
                const urlResponse = await axios.post(`/events/${eventId}/get-signed-url`, { files });
                const signedUrls = urlResponse.data;

                // Step 3: Upload the attachments to the presigned URLs
                await Promise.all(signedUrls.map(async (urlObj, index) => {
                    const fileUri = media[index].uri;
                    const attachmentResponse = await fetch(fileUri);
                    const blob = await attachmentResponse.blob();

                    await fetch(urlObj.url, {
                        method: 'PUT',
                        body: blob,
                    });
                }));
            }

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Event created successfully',
                visibilityTime: 3000,
            });

            // Redirect based on share type to screen
            if (shareType === 'Public') {
                navigation.navigate('Event', {eventId:eventId });
            } else if (shareType === 'Family') {
                navigation.navigate('Eventsharefamily', {eventId:eventId });
            } else if (shareType === 'Friend') {
                navigation.navigate('Eventsharefriends', {eventId:eventId });
            }

        } catch (error) {
            console.error('Error creating event:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to create event',
                visibilityTime: 3000,
            });
        } finally {
            setLoading(false);
        }
    };
    // handle event share selecion for user 
    const handleShareTypeSelection = (type) => {
        setShareType(type);
        setModalVisible(false);
        setTriggerCreateEvent(true);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ flexDirection: 'row', marginTop: height * 0.02, paddingHorizontal: width * 0.05, alignItems: 'center' }}>
                <TouchableOpacity style={{ marginTop: height * 0.01 }} onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon size={width * 0.05} color="black" />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center', position: 'absolute', left: 0, right: 0 }}>
                    <Text style={{ color: 'black', fontSize: width * 0.05, fontWeight: '300', textAlign: 'center', letterSpacing: width * 0.002 }}>Create Moments</Text>
                </View>
            </View>

            <ScrollView style={{ paddingHorizontal: width * 0.02 }} showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: width * 0.05, marginTop: height * 0.05 }}>
                    <View style={{ marginBottom: height * 0.02 }}>
                        <Text style={{ marginBottom: height * 0.005, color: '#848488', fontWeight: '500', fontSize: width * 0.03 }}>Event Name</Text>
                        <TextInput
                            value={eventName}
                            onChangeText={setEventName}
                            placeholder="Event"
                            style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', paddingBottom: height * 0.005, fontWeight: '500', fontSize: width * 0.033 }}
                            placeholderTextColor="#18426D"
                        />
                        {errors.eventName && <Text style={{ color: 'red', fontSize: width * 0.03 }}>{errors.eventName}</Text>}
                    </View>

                    <View style={{ marginBottom: height * 0.02, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, marginRight: width * 0.02 }}>
                            <Text style={{ marginBottom: height * 0.005, color: '#848488', fontWeight: '500', fontSize: width * 0.03 }}>Start Date</Text>
                            <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', paddingBottom: height * 0.005, fontWeight: '500', fontSize: width * 0.033 }}>
                                <Text style={{ color: '#18426D' }}>{startDate.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            <DatePicker
                                modal
                                open={showStartDatePicker}
                                date={startDate}
                                onConfirm={(date) => {
                                    setShowStartDatePicker(false);
                                    setStartDate(date);
                                }}
                                onCancel={() => {
                                    setShowStartDatePicker(false);
                                }}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: width * 0.02 }}>
                            <Text style={{ marginBottom: height * 0.005, color: '#848488', fontWeight: '500', fontSize: width * 0.03 }}>End Date</Text>
                            <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', paddingBottom: height * 0.005, fontWeight: '500', fontSize: width * 0.03 }}>
                                <Text style={{ color: '#18426D' }}>{endDate.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            <DatePicker
                                modal
                                open={showEndDatePicker}
                                date={endDate}
                                onConfirm={(date) => {
                                    setShowEndDatePicker(false);
                                    setEndDate(date);
                                }}
                                onCancel={() => {
                                    setShowEndDatePicker(false);
                                }}
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: height * 0.02, paddingHorizontal: width * 0.03, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'column', width: width * 0.16, justifyContent: 'center', alignItems: 'center' }}>
                            <ClockIcon size={width * 0.05} color="#18426D" />
                            <Text style={{ marginBottom: height * 0.005, marginTop: height * 0.005, color: '#848488', fontWeight: '500', fontSize: width * 0.03 }}>Time</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', fontWeight: '500', color: '#18426D', fontSize: width * 0.033, paddingBottom: height * 0.007, width: width * 0.7 }}>
                            <Text style={{ color: '#18426D' }}>{eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                        <DatePicker
                            modal
                            open={showTimePicker}
                            date={eventTime}
                            mode="time"
                            onConfirm={(date) => {
                                setShowTimePicker(false);
                                setEventTime(date);
                            }}
                            onCancel={() => {
                                setShowTimePicker(false);
                            }}
                        />
                    </View>

                    <View style={{ marginBottom: height * 0.02, paddingHorizontal: width * 0.03, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'column', width: width * 0.16, justifyContent: 'center', alignItems: 'center' }}>
                            <MapPinIcon size={width * 0.05} color="#18426D" />
                            <Text style={{ marginBottom: height * 0.005, marginTop: height * 0.005, color: '#848488', fontWeight: '500', fontSize: width * 0.03 }}>Location</Text>
                        </View>
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Location"
                            style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', fontWeight: '500', fontSize: width * 0.033, paddingBottom: height * 0.007, width: width * 0.7 }}
                            placeholderTextColor="#18426D"
                        />
                    </View>
                    {errors.location && <Text style={{ color: 'red', fontSize: width * 0.03 }}>{errors.location}</Text>}

                    <View style={{ marginBottom: height * 0.02, paddingHorizontal: width * 0.03, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'column', width: width * 0.16, justifyContent: 'center', alignItems: 'center' }}>
                            <LinkIcon size={width * 0.05} color="#18426D" />
                            <Text style={{ marginBottom: height * 0.005, marginTop: height * 0.005, color: '#848488', fontWeight: '500', fontSize: width * 0.03 }}>Link</Text>
                        </View>
                        <TextInput
                            value={link}
                            onChangeText={setLink}
                            placeholder="Link"
                            style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', fontWeight: '500', fontSize: width * 0.033, paddingBottom: height * 0.007, width: width * 0.7 }}
                            placeholderTextColor="#18426D"
                        />
                    </View>
                    {errors.link && <Text style={{ color: 'red', fontSize: width * 0.03 }}>{errors.link}</Text>}

                    <View style={{ marginBottom: height * 0.02 }}>
                        <Text style={{ marginBottom: height * 0.005, color: '#848488', fontSize: width * 0.03 }}>Description</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            multiline={true}
                            numberOfLines={4}
                            style={{ height: height * 0.2, borderRadius: width * 0.02, borderWidth: 2, borderColor: '#ccc', paddingBottom: height * 0.01, paddingHorizontal: width * 0.05, fontSize: width * 0.033, textAlignVertical: 'top' }}
                        />
                        {errors.description && <Text style={{ color: 'red', fontSize: width * 0.03 }}>{errors.description}</Text>}
                    </View>

                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity
                            onPress={selectMedia}
                            style={{
                                padding: width * 0.02,
                                backgroundColor: media.length > 0 ? '#90EE90' : '#EFEFF0', // Change color when media is added
                                flexDirection: 'row',
                                paddingHorizontal: width * 0.03,
                                alignItems: 'center',
                                width: width * 0.6,
                                borderRadius: width * 0.2,
                                marginTop: height * 0.02
                            }}
                        >
                            <PaperClipIcon size={width * 0.05} color="#828287" />
                            <Text style={{ color: '#848488', textAlign: 'center', fontSize: width * 0.04, flex: 1 }}>Attachment</Text>
                        </TouchableOpacity>
                        {errors.attachment && <Text style={{ color: 'red', fontSize: width * 0.03 }}>{errors.attachment}</Text>}
                    </View>

                    <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: height * 0.05 }}>
                        <TouchableOpacity
                            style={{ padding: width * 0.02, backgroundColor: '#1E90FF', justifyContent: 'center', alignItems: 'center', width: width * 0.3, borderRadius: width * 0.02, marginTop: height * 0.02 }}
                            onPress={() => setModalVisible(true)}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={{ color: 'white', fontWeight: '500', fontSize: width * 0.045 }}>Publish</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <Modal transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <Pressable
                    style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={{ width: width * 0.8, backgroundColor: 'white', borderRadius: width * 0.05, padding: height * 0.02, marginBottom: height * 0.05 }}>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: height * 0.01, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingHorizontal: width * 0.05 }} onPress={() => handleShareTypeSelection('Public')}>
                            <Text style={{ fontSize: width * 0.04 }}>Public</Text>
                            <Image source={require('../assets/icons8-paper-plane-100.png')} style={{ width: width * 0.06, height: height * 0.03 }} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: height * 0.015, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingHorizontal: width * 0.05 }} onPress={() => handleShareTypeSelection('Family')}>
                            <Text style={{ fontSize: width * 0.04 }}>Links</Text>
                            <Image source={require('../assets/icons8-paper-plane-100.png')} style={{ width: width * 0.06, height: height * 0.03 }} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: height * 0.01, paddingHorizontal: width * 0.05 }} onPress={() => handleShareTypeSelection('Friend')}>
                            <Text style={{ fontSize: width * 0.04 }}>Friend</Text>
                            <Image source={require('../assets/icons8-paper-plane-100.png')} style={{ width: width * 0.06, height: height * 0.03 }} />
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

export default CreateEventScreen;
