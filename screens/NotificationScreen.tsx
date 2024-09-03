import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import axios from '../Utils/Family/axios';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const NotificationScreen = () => {
    const navigation = useNavigation();
    const [connectionNotifications, setConnectionNotifications] = useState([]);
    const [postNotifications, setPostNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // get all current user notification 

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('/auth/getnotifications');
                const sortedConnectionNotifications = response.data.connectionNotifications // filter the notification according to created date 
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 10);
                const sortedPostNotifications = response.data.postNotifications   // filter the notification according to created date 
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 10);
                setConnectionNotifications(sortedConnectionNotifications); // set connection  notification  
                setPostNotifications(sortedPostNotifications); //set post notiffication 
                setLoading(false);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);
// skeleton for loading state 
    const SkeletonCard = () => (
        <View style={{ width: width * 0.9, flexDirection: 'row', padding: 10, alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, backgroundColor: '#E0E0E0', borderRadius: 28, marginRight: 16 }} />
            <View style={{ flex: 1 }}>
                <View style={{ width: '70%', height: 14, backgroundColor: '#E0E0E0', marginBottom: 8 }} />
                <View style={{ width: '50%', height: 12, backgroundColor: '#E0E0E0' }} />
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <SafeAreaView style={{ flex: 0, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: '#18426D', height: 150, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 }}>
                <Text style={{ color: 'white', fontSize: 20, marginTop: 10, marginBottom: 15 }}>Notification</Text>
            </SafeAreaView>
            <View style={{ paddingVertical: 10, marginTop: 10 }}>
                <ScrollView contentContainerStyle={{ paddingHorizontal: 5, marginBottom: 15 }} showsVerticalScrollIndicator={false}>
                    {loading ? (
                        Array(5).fill().map((_, index) => <SkeletonCard key={index} />) // skelton showing array 
                    ) : (
                        <>
                            {connectionNotifications.map((notification, index) => (
                                <View key={index} style={{ width: '100%' }}>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: 'transparent' }}// notification card with profile redirection
                                        onPress={() => navigation.navigate('FriendProfile', { userId: notification?.connected_user_id })}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image source={notification.profile_image?{ uri: notification.profile_image}:require('../assets/profile.png')} style={{ width: 56, height: 56, borderRadius: 28, marginRight: 16 }} />
                                            <View>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: 'black' }}>{notification.title}</Text>
                                                <Text style={{ fontSize: 12, color: 'gray', marginTop: 4 }}>{moment(notification.created_at).fromNow()}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ borderBottomColor: '#ABB0BC', borderBottomWidth: 1, width: '80%', alignSelf: 'flex-end' }} />
                                </View>
                            ))}
                            {postNotifications.map((notification, index) => (
                                <View key={index} style={{ width: '100%' }}>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: 'transparent' }} // notiffication with user post redirection 
                                        onPress={() => navigation.navigate('Userpost', { userId: notification?.user_id })}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image source={{ uri: notification.attachment_url }} style={{ width: 56, height: 56, borderRadius: 28, marginRight: 16 }} />
                                            <View>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: 'black' }}>{notification.title}</Text>
                                                <Text style={{ fontSize: 12, color: 'gray', marginTop: 4 }}>{moment(notification.created_at).fromNow()}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ borderBottomColor: '#ABB0BC', borderBottomWidth: 1, width: '80%', alignSelf: 'flex-end' }} />
                                </View>
                            ))}
                        </>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

export default NotificationScreen;
