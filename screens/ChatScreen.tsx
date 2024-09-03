import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions, RefreshControl } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import StoryList from '../components/StoryList';
import UserchatCard from '../components/UserchatCard';
import FamilychatCard from '../components/FamilychatCard';
import { AuthContext } from '../AuthContext';
import sb from '../sendbird';
import chatIcon from '../assets/friend-icon.png';
import chatIcon2 from '../assets/gruop-icon.png';


const { width, height } = Dimensions.get('window');

const ChatScreen = () => {
    const navigation = useNavigation();
    const { currentUser } = useContext(AuthContext); // get current user from authcontext
    const [showFamilyChat, setShowFamilyChat] = useState(false);
    const [oneToOneChats, setOneToOneChats] = useState([]);
    const [groupChats, setGroupChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // get all user one to one and group chat from sendbird chat sdk using user_id and filter the user chat 

    const fetchChannels = async () => {
        if (!currentUser || !currentUser.user_id) return;

        try {
            const userId = currentUser.user_id.toString();

            // Fetch One-to-One Channels
            const oneToOneQuery = sb.GroupChannel.createMyGroupChannelListQuery();
            oneToOneQuery.includeEmpty = true;
            oneToOneQuery.limit = 20;
            oneToOneQuery.memberStateFilter = 'all';

            const oneToOneChannels = await new Promise((resolve, reject) => {
                oneToOneQuery.next((channels, error) => {
                    if (error) return reject(error);
                    const oneToOne = channels.filter(channel =>
                        channel.customType === 'one-to-one' &&
                        channel.memberCount === 2 &&
                        channel.members.some(member => member.userId === userId) // Check userId in channel members
                    );
                    resolve(oneToOne);
                });
            });

            setOneToOneChats(oneToOneChannels);

            // Fetch Group Channels
            const groupQuery = sb.GroupChannel.createMyGroupChannelListQuery();
            groupQuery.includeEmpty = true;
            groupQuery.limit = 20;
            groupQuery.memberStateFilter = 'all';

            const groupChannels = await new Promise((resolve, reject) => {
                groupQuery.next((channels, error) => {
                    if (error) return reject(error);
                    const groups = channels.filter(channel =>
                        channel.customType === 'family' &&
                        channel.memberCount > 0 &&
                        channel.members.some(member => member.userId === userId) // Check userId in channel members
                    );
                    resolve(groups);
                });
            });

            setGroupChats(groupChannels);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching channels:', error);
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchChannels();
        }, [currentUser])
    );
    // toggle button for family and one to one chat cards 
    const toggleChatType = () => {
        setShowFamilyChat(prevState => !prevState);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChannels().then(() => setRefreshing(false));
    }, [currentUser]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', marginTop: height * 0.02, paddingHorizontal: width * 0.05, alignItems: 'center' }}>
                {/* Back Button */}
                <TouchableOpacity style={{ marginTop: height * 0.01 }} onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon size={width * 0.05} color="black" />
                </TouchableOpacity>
                {/* Title */}
                <View style={{ flex: 1, alignItems: 'center', position: 'absolute', left: 0, right: 0, marginBottom: height * 0.06 }}>
                    <Text style={{ color: 'black', fontSize: width * 0.06, fontWeight: '300', textAlign: 'center', letterSpacing: width * 0.002 }}>
                        Chat
                    </Text>
                </View>
            </View>
            <View className='mt-8'>
                <StoryList />
            </View>

            {/* Button for switching user chat and family chat */}
            <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <TouchableOpacity
                    style={{ padding: width * 0.02, backgroundColor: '#1E90FF', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: width * 0.34, borderRadius: width * 0.02, marginTop: height * 0.02 }}
                    onPress={toggleChatType}
                >
                    <Image
                        source={showFamilyChat ? chatIcon : chatIcon2}
                        style={{ width: width * 0.05, height: width * 0.05, marginRight: width * 0.02 }}
                    />
                    <Text style={{ color: 'white', fontSize: width * 0.045, fontWeight: '500' }}>
                        {showFamilyChat ? 'Friends' : 'Social Links'}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ justifyContent: 'flex-start', paddingHorizontal: width * 0.05, marginTop: height * 0.03 }}>
                <Text style={{ color: 'black', fontSize: width * 0.05, fontWeight: '300', letterSpacing: width * 0.002 }}>
                    {showFamilyChat ? 'Social Links' : 'Friends'}
                </Text>
            </View>
            {/* Scrolling user card views and family card view according to top button conditional rendering */}
            <ScrollView
                style={{ paddingHorizontal: width * 0.05, marginTop: height * 0.03 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                        <View key={index} style={{ flexDirection: 'row', marginBottom: height * 0.02 }}>
                            <View style={{ width: width * 0.15, height: width * 0.15, borderRadius: width * 0.075, marginRight: width * 0.05, backgroundColor: '#E0E0E0' }} />
                            <View style={{ flex: 1 }}>
                                <View style={{ width: '80%', height: height * 0.02, marginBottom: height * 0.01, backgroundColor: '#E0E0E0' }} />
                                <View style={{ width: '60%', height: height * 0.02, backgroundColor: '#E0E0E0' }} />
                            </View>
                        </View>
                    ))
                ) : (
                    showFamilyChat ? (
                        groupChats.length > 0 ? (
                            groupChats.map(channel => (
                                <FamilychatCard key={channel.url} channel={channel} /> // family chat card from components 
                            ))
                        ) : (
                            <View style={{ alignItems: 'center', marginTop: height * 0.1 }}>
                                <Text style={{ color: 'gray', fontSize: width * 0.05, fontWeight: '300' }}>
                                    No link chats available.
                                </Text>
                            </View>
                        )
                    ) : (
                        oneToOneChats.length > 0 ? (
                            oneToOneChats.map(channel => (
                                <UserchatCard key={channel.url} channel={channel} /> // one to one chat card from components
                            ))
                        ) : (
                            <View style={{ alignItems: 'center', marginTop: height * 0.1 }}>
                                <Text style={{ color: 'gray', fontSize: width * 0.05, fontWeight: '300' }}>
                                    No friend chats available.
                                </Text>
                            </View>
                        )
                    )
                )}
            </ScrollView>

        </SafeAreaView>
    );
};

export default ChatScreen;
