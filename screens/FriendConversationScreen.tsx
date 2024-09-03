import React, { useState, useEffect, useContext, useRef } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Modal, FlatList, Dimensions, Linking, Platform } from 'react-native';
import { ArrowLeftIcon, EllipsisVerticalIcon, PhoneIcon, XMarkIcon } from 'react-native-heroicons/solid';
import { PaperClipIcon, FaceSmileIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import sb from '../sendbird';
import { AuthContext } from '../AuthContext';
import * as ImagePicker from 'react-native-image-picker';
import Video from 'react-native-video';
import { DirectCallProperties, SendbirdCalls } from '@sendbird/calls-react-native';
import axios from '../Utils/Family/axios';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { width, height } = Dimensions.get('window');

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble = ({ isUser, message, otherMember, onMediaPress }) => {
    const isImage = message.type && message.type.startsWith('image/');
    const isVideo = message.type && message.type.startsWith('video/');
    const paddingValue = isImage || isVideo ? 4 : 8;

    const renderTextWithLinks = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                return (
                    <Text
                        key={index}
                        style={{ color: isUser ? '#ADD8E6' : '#1E90FF', textDecorationLine: 'underline' }}
                        onPress={() => Linking.openURL(part)}
                    >
                        {part}
                    </Text>
                );
            }
            return <Text key={index} style={{ color: isUser ? 'white' : 'black' }}>{part}</Text>;
        });
    };


    return (
        <View style={{ flexDirection: isUser ? 'row-reverse' : 'row', marginBottom: 16, alignItems: 'flex-end' }}>
            {!isUser && <Image source={{ uri: otherMember?.profile_image }} style={{ width: 28, height: 28, borderRadius: 14, marginLeft: 8, marginRight: 3 }} />}
            <View style={{ maxWidth: width * 0.7 }}>
                <View style={{
                    padding: paddingValue,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderBottomLeftRadius: isUser ? 20 : 0,
                    borderBottomRightRadius: isUser ? 0 : 20,
                    backgroundColor: isUser ? '#1E90FF' : '#E6D8B6',
                    position: 'relative'
                }}>
                    {isImage && (
                        <TouchableOpacity onPress={() => onMediaPress(message)}>
                            <Image source={{ uri: message.url || message.plainUrl }} style={{ width: width * 0.6, height: width * 0.6, borderRadius: 10 }} />
                        </TouchableOpacity>
                    )}
                    {isVideo && (
                        <TouchableOpacity onPress={() => onMediaPress(message)}>
                            <Video source={{ uri: message.url || message.plainUrl }} style={{ width: width * 0.6, height: width * 0.6, borderRadius: 10 }} />
                        </TouchableOpacity>
                    )}
                    {!isImage && !isVideo && <Text style={{ color: isUser ? 'white' : 'black', fontSize: 18 }}> {renderTextWithLinks(message.message)}</Text>}
                    <Text style={{ color: isUser ? 'white' : 'black', fontSize: 10, marginTop: 4, textAlign: "right" }}>
                        {formatTime(message.createdAt)}
                    </Text>
                    <View style={{
                        position: 'absolute',
                        bottom: -10,
                        width: 12,
                        height: 20,
                        borderTopWidth: 10,
                        borderTopColor: 'transparent',
                        borderBottomWidth: 10,
                        borderBottomColor: 'transparent',
                        borderLeftWidth: isUser ? 0 : 12,
                        borderLeftColor: isUser ? 'transparent' : '#E6D8B6',
                        borderRightWidth: isUser ? 12 : 0,
                        borderRightColor: isUser ? '#1E90FF' : 'transparent',
                        right: isUser ? 0 : undefined,
                        left: isUser ? undefined : 0,
                    }} />
                </View>
            </View>
        </View>
    );
};

const FriendConversationScreen = ({ route }) => {
    const navigation = useNavigation();
    const { currentUser } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const { channelUrl, memberId } = route.params;
    const [channel, setChannel] = useState(null);
    const [repliedMessage, setRepliedMessage] = useState(null);
    const scrollViewRef = useRef();
    const [otherMember, setOtherMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewMedia, setPreviewMedia] = useState(null);

    useEffect(() => {
        const fetchOtherMemberProfile = async () => {
            try {
                const profileResponse = await axios.get(`/family/${memberId}/userprofile`);
                console.log(profileResponse.data, 'chat');
                setOtherMember(profileResponse.data);
            } catch (error) {
                console.error("Error fetching the other member's profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOtherMemberProfile();
    }, [memberId]);

    useEffect(() => {
        const requestMicrophonePermission = async () => {
            if (Platform.OS === 'android') {
                const result = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
                if (result !== RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Microphone permission is required to make calls.');
                }
            }
        };

        requestMicrophonePermission();
    }, []);

    useEffect(() => {
        const fetchChannel = async () => {
            if (!currentUser || !currentUser.user_id) {
                console.error('Current user is not defined.');
                return;
            }

            try {
                const groupChannel = await sb.GroupChannel.getChannel(channelUrl);
                setChannel(groupChannel);

                const messageListQuery = groupChannel.createPreviousMessageListQuery();
                messageListQuery.limit = 20;
                messageListQuery.reverse = false;

                const messages = await messageListQuery.load();
                setMessages(messages);
                console.log(messages);

                const ChannelHandler = new sb.ChannelHandler();
                ChannelHandler.onMessageReceived = (channel, message) => {
                    setMessages(prevMessages => [...prevMessages, message]);
                };
                ChannelHandler.onReadReceiptUpdated = (channel) => {
                    const updatedMessages = messages.map(message => {
                        const readCount = channel.getReadReceipt(message);
                        return { ...message, readCount };
                    });
                    setMessages(updatedMessages);
                };
                sb.addChannelHandler(channelUrl, ChannelHandler);

            } catch (error) {
                console.error('Error fetching channel:', error);
            }
        };

        fetchChannel();

        return () => {
            sb.removeChannelHandler(channelUrl);
        };
    }, [channelUrl, currentUser]);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    useEffect(() => {
        const initializeListener = async () => {
            try {
                SendbirdCalls.setListener({
                    async onRinging(callProps) {
                        navigation.navigate('IncomingCall', { callId: callProps.callId });
                    },
                    onConnected: (call) => console.log('onConnected:', call),
                    onEnded: (call) => console.log('onEnded:', call),
                    onError: (call, error) => console.error('onError:', error),
                });
            } catch (error) {
                console.error("Error setting up call listener:", error);
            }
        };

        initializeListener();

        return () => {
            SendbirdCalls.removeListener();
        };
    }, []);

    const sendMessage = () => {
        if (messageText.trim() === '') return;

        if (!channel) {
            console.error('Channel is not defined.');
            return;
        }

        const params = new sb.UserMessageParams();
        params.message = messageText;
        if (repliedMessage) {
            params.parentMessageId = repliedMessage.messageId;
            setRepliedMessage(null);
        }

        channel.sendUserMessage(params, (message, error) => {
            if (error) {
                console.error('Error sending message:', error);
                return;
            }
            setMessages(prevMessages => [...prevMessages, message]);
            setMessageText('');
        });
    };

    const sendMediaMessage = () => {
        if (!selectedMedia) return;

        const { uri, type } = selectedMedia;
        const fileMessageParams = new sb.FileMessageParams();
        fileMessageParams.file = {
            uri,
            name: uri.split('/').pop(),
            type,
        };

        if (!channel) {
            console.error('Channel is not defined.');
            return;
        }

        channel.sendFileMessage(fileMessageParams, (message, error) => {
            if (error) {
                console.error('Error sending media message:', error);
                return;
            }
            setMessages(prevMessages => [...prevMessages, message]);
            setSelectedMedia(null);
        });
    };

    const handleMediaPicker = () => {
        const options = {
            mediaType: 'mixed',
        };

        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.error('ImagePicker Error: ', response.error);
            } else if (response.assets && response.assets.length > 0) {
                const { uri, type } = response.assets[0];
                setSelectedMedia({ uri, type });
            }
        });
    };

    const handleEmojiPicked = (emoji) => {
        setMessageText(prevMessageText => prevMessageText + emoji);
        setIsEmojiPickerVisible(false);
    };

    const cancelSelectedMedia = () => {
        setSelectedMedia(null);
    };

    const initiateAudioCall = async () => {
        try {
            if (!currentUser) {
                console.error('Current user is not defined.');
                return;
            }
            if (!memberId) {
                console.error('Member ID is not defined.');
                return;
            }

            const userId = typeof memberId === 'string' ? memberId : memberId.toString();

            const callOptions = {
                audioEnabled: true,
                videoEnabled: false,
                frontCamera: false,
            };

            console.log('Initiating call with options:', callOptions);

            const callProps = await SendbirdCalls.dial(userId, false, callOptions);
            console.log('Call props:', callProps);

            const directCall = await SendbirdCalls.getDirectCall(callProps.callId);
            console.log('Direct call:', directCall);

            directCall.addListener({
                onEstablished: (call) => {
                    console.log('Call established', call);
                },
                onConnected: (call) => {
                    console.log('Call connected', call);
                },
                onEnded: (call) => {
                    console.log('Call ended', call);
                },
                onError: (call, error) => {
                    console.error('Call error:', error);
                }
            });

            navigation.navigate('Calling', { callId: callProps.callId, userName: otherMember?.full_name, userImage: otherMember?.profile_image });

        } catch (error) {
            console.error('Failed to initiate call', error);
        }
    };

    const openDropdown = () => {
        setModalVisible(true);
    };

    const closeDropdown = () => {
        setModalVisible(false);
    };

    const handleHelpClick = () => {
        Linking.openURL('mailto:help@memorilink.com');
    };

    const handleMediaPress = (message) => {
        setPreviewMedia(message);
        setPreviewVisible(true);
    };

    const dropdownOptions = [
        { id: 3, title: 'Help', action: handleHelpClick },
    ];

    const renderDropdownItem = ({ item }) => (
        <TouchableOpacity
            key={item.id}
            onPress={() => {
                item.action();
                closeDropdown();
            }}
            style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
        >
            <Text style={{ fontSize: 16 }}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <SafeAreaView style={{ flex: 0, backgroundColor: '#18426D', height: height * 0.23, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 8, paddingHorizontal: 20 }}>
                    <TouchableOpacity style={{ marginRight: 20, marginTop: 4 }} onPress={() => navigation.goBack()}>
                        <ArrowLeftIcon size={25} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: 4 }} onPress={openDropdown}>
                        <EllipsisVerticalIcon size={25} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8, paddingHorizontal: 20 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('FriendProfile', { userId: memberId })} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={otherMember?.profile_image?{ uri: otherMember?.profile_image }:require('../assets/profile.png')} style={{ width: width * 0.17, height: width * 0.17, borderRadius: (width * 0.17) / 2, borderWidth: 4, borderColor: 'white', marginRight: 12 }} />
                        <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>{otherMember?.full_name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: 'white', borderRadius: 20, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }} onPress={initiateAudioCall}>
                        <PhoneIcon size={15} color="#18426D" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <ScrollView style={{ flex: 1, padding: 20 }} ref={scrollViewRef} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
                {messages.map(message => {
                    const isUser = message._sender?.userId === currentUser.user_id.toString();
                    return (
                        <TouchableOpacity key={message.messageId} >
                            <MessageBubble
                                isUser={isUser}
                                message={message}
                                otherMember={otherMember}
                                onMediaPress={handleMediaPress}
                            />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <View style={{ flexDirection: 'row', alignItems: 'center', margin: 15, borderRadius: 7, backgroundColor: '#f0f0f0', padding: 5 }}>
                <TouchableOpacity style={{ padding: 8 }} onPress={handleMediaPicker}>
                    <PaperClipIcon size={25} color="#828287" />
                </TouchableOpacity>
                <TextInput
                    style={{ flex: 1, padding: 8, marginHorizontal: 8, fontSize: 17, borderRadius: 50 }}
                    placeholder="Enter message"
                    value={messageText}
                    onChangeText={setMessageText}
                />
                <TouchableOpacity style={{ padding: 8 }} onPress={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}>
                    <FaceSmileIcon size={25} color="#828287" />
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 8 }} onPress={sendMessage}>
                    <Image
                        source={require('../assets/chat.png')}
                        style={{ width: 20, height: 20 }}
                    />
                </TouchableOpacity>
            </View>
            {selectedMedia && (
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{ position: 'relative', width: '100%', height: height * 0.25, backgroundColor: '#f0f0f0', padding: 8, borderRadius: 10 }}>
                        <TouchableOpacity onPress={cancelSelectedMedia} style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, backgroundColor: '#FF0000', padding: 4, borderRadius: 50 }}>
                            <XMarkIcon size={15} color="white" />
                        </TouchableOpacity>
                        {selectedMedia.type.startsWith('image/') && (
                            <Image source={{ uri: selectedMedia.uri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                        )}
                        {selectedMedia.type.startsWith('video/') && (
                            <Video source={{ uri: selectedMedia.uri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                        )}
                        <TouchableOpacity onPress={sendMediaMessage} style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 50 }}>
                            <Image
                                source={require('../assets/chat.png')}
                                style={{ width: 20, height: 20 }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {isEmojiPickerVisible && (
                <EmojiSelector
                    onEmojiSelected={handleEmojiPicked}
                    showSearchBar={false}
                    showTabs={true}
                    category={Categories.all}
                    columns={8}
                    shouldInclude={emoji => true}
                />
            )}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeDropdown}
            >
                <TouchableOpacity style={{ flex: 1 }} onPress={closeDropdown}>
                    <View style={{ position: 'absolute', top: 64, right: 20, backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, width: 144 }}>
                        <FlatList
                            data={dropdownOptions}
                            renderItem={renderDropdownItem}
                            keyExtractor={item => item.id.toString()}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal
                visible={previewVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setPreviewVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                    {previewMedia?.type?.startsWith('image/') && (
                        <Image source={{ uri: previewMedia.url || previewMedia.plainUrl }} style={{ width: width * 0.9, height: height * 0.7, borderRadius: 10 }} />
                    )}
                    {previewMedia?.type?.startsWith('video/') && (
                        <Video source={{ uri: previewMedia.url || previewMedia.plainUrl }} style={{ width: width * 0.9, height: height * 0.7, borderRadius: 10 }} controls />
                    )}
                    <TouchableOpacity onPress={() => setPreviewVisible(false)} style={{ position: 'absolute', top: 40, right: 20 }}> 
                        <XMarkIcon size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default FriendConversationScreen;
