import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, SafeAreaView, Alert, Dimensions, StyleSheet, Linking } from 'react-native';
import { ArrowLeftIcon, CalendarDaysIcon, LinkIcon, MapPinIcon, TrashIcon } from 'react-native-heroicons/solid';
import { ClockIcon } from 'react-native-heroicons/outline';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from '../Utils/Family/axios';
import { AuthContext } from '../AuthContext';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const EventScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { eventId } = route.params; // event id from story list or family story list component 
    const { currentUser } = useContext(AuthContext); // get the current user for conditon checking 
    const isCurrentUser = currentUser?.user_id;

    
    

    const [eventData, setEventData] = useState(null);

    // get the single event using event id from db 

    useEffect(() => {
        axios.get(`/events/${eventId}`)
            .then(response => {
                setEventData(response.data);
                console.log('Event Data:', response.data);
                console.log('Condition:', isCurrentUser === response.data.user_id);
            })
            .catch(error => {
                console.error('Error fetching event data:', error);
            });
    }, [eventId]);

   
    // upgate the event share option 
    const handleShareEvent = async () => {
        try {
            const response = await axios.put(`/events/${eventId}`);
            if (response.status === 200) {
                

                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Event share update successfully',
                    visibilityTime: 3000,
                });

            } else {

                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to share event',
                    visibilityTime: 3000,
                });
            }
        } catch (error) {
            console.error('Error sharing event:', error);
            Alert.alert('An error occurred while sharing the event');
        }
    };
   // delete functon for event creator 
    const handleDeleteEvent = () => {
        Alert.alert(
            "Delete Event",
            "Are you sure you want to delete this event?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => deleteEvent() }
            ],
            { cancelable: false }
        );
    };
  // delete functon to backend 
    const deleteEvent = async () => {
        try {
            const response = await axios.delete(`/events/${eventId}/deleteevent`);
            Toast.show({
                type: 'success',
                text1: 'Delete',
                text2: 'Event deleted successfully',
                visibilityTime: 3000,
            });
            navigation.navigate('Main');
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleLinkPress = async (url) => {
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {

            Toast.show({
                type: 'error',
                text1: 'Invalid URL',
                text2: 'This URL cannot be opened. Please check the link and try again.',
                visibilityTime: 3000,
            });
        }
    };

    // loading state

    if (!eventData) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: eventData.attachment_url }}
                style={styles.imageBackground}
                imageStyle={styles.imageStyle}
            >
                <SafeAreaView style={styles.safeArea}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeftIcon size={20} color="black" />
                    </TouchableOpacity>
                     {/* delete button conditon check  */}
                    {isCurrentUser === eventData.user_id && (
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEvent}>
                            <TrashIcon size={30} color="black" />
                        </TouchableOpacity>
                    )}
                </SafeAreaView>
                <View style={styles.eventNameContainer}>
                    <Text style={styles.eventName}>{eventData.name}</Text>
                </View>
            </ImageBackground>

            <View style={styles.contentContainer}>
                <TouchableOpacity style={styles.profileImageContainer}>
                    <Image
                        source={eventData.user.profile_image?{ uri: eventData.user.profile_image }:require('../assets/profile.png')}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>

                <Text style={styles.userName}>
                    {eventData.user.full_name}
                </Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.joinButton}>
                        <Text style={styles.buttonText}>Join this moment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ticketButton}>
                        <Text style={styles.buttonText}>Ticket</Text>
                    </TouchableOpacity>
                </View>
                 {/* share  button conditon check  */}
                {isCurrentUser === eventData.user_id &&
                    (eventData.event_share === 'Family' || eventData.event_share === 'Friends') && (
                        <TouchableOpacity style={styles.shareButton} onPress={handleShareEvent}>
                            <Text style={styles.buttonText}>Share</Text>
                        </TouchableOpacity>
                    )}
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <CalendarDaysIcon size={25} color="#16436C" />
                        <Text style={styles.infoText}>{eventData.start_date.split('T')[0]}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <ClockIcon size={25} color="#16436C" />
                        <Text style={styles.infoText}>{new Date(eventData.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <CalendarDaysIcon size={25} color="#16436C" />
                        <Text style={styles.infoText}>{eventData.end_date.split('T')[0]}</Text>
                    </View>
                </View>
                <View style={styles.locationContainer}>
                    <View style={styles.locationItem}>
                        <MapPinIcon size={18} color="#16436C" />
                        <Text style={styles.locationText}>{eventData.location}</Text>
                    </View>
                    <TouchableOpacity style={styles.locationItem} onPress={() => handleLinkPress(eventData.event_url)}>
                        <LinkIcon size={18} color="#16436C" />
                        <Text style={styles.locationText}>{eventData.event_url}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText} >{eventData.description}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageBackground: {
        width: '100%',
        height: height * 0.25,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    imageStyle: {
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    safeArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    backButton: {
        marginTop: 10,
    },
    deleteButton: {
        marginTop: 10,
    },
    eventNameContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.05,
    },
    eventName: {
        color: 'white',
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 1,
    },
    contentContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -height * 0.1,
    },
    profileImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: (width * 0.3) / 2,
        borderWidth: 4,
        borderColor: 'white',
    },
    userName: {
        color: 'black',
        fontSize: 18,
        fontWeight: '500',
        marginVertical: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginVertical: 10,
    },
    joinButton: {
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
        width: width * 0.4,
        height: 40,
        borderRadius: 7,
    },
    ticketButton: {
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
        width: width * 0.3,
        height: 40,
        borderRadius: 7,
    },
    shareButton: {
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
        width: width * 0.4,
        height: 40,
        borderRadius: 7,
        marginVertical: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        gap: 20,
    },
    infoItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        color: '#848488',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 5,
    },
    locationContainer: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    locationItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
    locationText: {
        color: '#848488',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 5,
    },
    descriptionContainer: {
        backgroundColor: '#E6D8B6',
        width: '90%',
        height: '30%',
        borderRadius: 7,
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        padding: 10,
    },
    descriptionText: {
        color: 'black',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'left',
        lineHeight: 20,
        letterSpacing: 0.5,
    },
});

export default EventScreen;
