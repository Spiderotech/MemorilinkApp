import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import axios from "../Utils/Family/axios"; // Assuming you have an AuthContext to get the current user's ID

const { width, height } = Dimensions.get('window');

const UserchatCard = ({ channel }) => {
    const navigation = useNavigation();
    const { currentUser } = useContext(AuthContext); // Get the current user from context

    const [otherMember, setOtherMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOtherMemberProfile = async () => {
            try {
                // Convert the current user's ID to a string for comparison
                const currentUserId = String(currentUser.user_id);

                // Filter out the current user from the members to find the other member's userId
                const otherMemberId = Object.keys(channel.memberMap).find(userId => String(userId) !== currentUserId);
                console.log(otherMemberId);

                // Fetch the other member's profile data from the backend
                const profileResponse = await axios.get(`/family/${otherMemberId}/userprofile`);
                console.log(profileResponse.data);

                setOtherMember(profileResponse.data);
            } catch (error) {
                console.error("Error fetching the other member's profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOtherMemberProfile();
    }, [channel.memberMap, currentUser.user_id]);

    if (!otherMember) {
        // If there's no other member, we can't render this chat card properly
        return null;
    }

    // Check if there are unread messages
    const hasUnreadMessages = channel.unreadMessageCount > 0;

    return (
        <TouchableOpacity onPress={() => navigation.navigate('Friendchat', { channelUrl: channel.url, memberId: otherMember?.id })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: height * 0.02, paddingBottom: height * 0.02, borderBottomWidth: 0.5, borderBottomColor: 'black' }}>
                <Image source={otherMember.profile_image?{ uri: otherMember.profile_image }:require('../assets/profile.png')} style={{ width: width * 0.16, height: width * 0.16, borderRadius: (width * 0.20) / 2 }} />
                <View style={{ marginLeft: width * 0.04, flex: 1 }}>
                    <Text style={{ color: 'black', fontWeight: '500', fontSize: width * 0.045 }}>{otherMember.full_name}</Text>
                    <Text style={{ color: 'gray', fontSize: width * 0.035 }}>{channel.lastMessage ? channel.lastMessage.message : 'No messages yet'}</Text>
                </View>
                
                {hasUnreadMessages && (
                    <View style={{
                        backgroundColor: '#18426D',
                        borderRadius: 25, 
                        paddingHorizontal: 2,
                        paddingVertical: 4,
                        width: 15, 
                        height: 15
                    }}>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default UserchatCard;
