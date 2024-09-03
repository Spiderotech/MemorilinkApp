import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const FamilychatCard = ({ channel }) => {
    const navigation = useNavigation();
    const [isHovered, setIsHovered] = useState(false);

    // Check if there are unread messages
    const hasUnreadMessages = channel.unreadMessageCount > 0;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('Familychat', { channelUrl: channel.url, name: channel.name, profile: channel.coverUrl })}
            onPressIn={() => setIsHovered(true)}
            onPressOut={() => setIsHovered(false)}
            style={{
                backgroundColor: isHovered ? '#E6D8B6' : 'transparent'
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingBottom: height * 0.02,
                    paddingTop: height * 0.01,
                    borderBottomWidth: 0.5,
                    borderBottomColor: 'black',
                    backgroundColor: isHovered ? '#E6D8B6' : 'transparent'
                }}
            >
                <Image source={{ uri: channel.coverUrl }} style={{ width: width * 0.15, height: width * 0.15, borderRadius: (width * 0.15) / 2 }} />
                <View style={{ marginLeft: width * 0.04, flex: 1 }}>
                    <Text style={{ color: 'black', fontWeight: '500', fontSize: width * 0.045 }}>{channel.name}</Text>
                    <Text style={{ color: 'gray', fontSize: width * 0.035 }}>{channel.lastMessage ? channel.lastMessage.message : 'No messages yet'}</Text>
                </View>

                {hasUnreadMessages && (
                    <View style={{
                        backgroundColor: '#18426D',
                        borderRadius: 25,
                        width: 15,
                        height: 15,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default FamilychatCard;
