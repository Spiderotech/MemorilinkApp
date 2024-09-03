import React, { useState, useEffect, useContext, useRef } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Alert, Modal, FlatList, Dimensions, Linking } from 'react-native';
import { ArrowLeftIcon, EllipsisVerticalIcon, XMarkIcon } from 'react-native-heroicons/solid';
import { PaperClipIcon, FaceSmileIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import sb from '../sendbird';
import { AuthContext } from '../AuthContext';
import * as ImagePicker from 'react-native-image-picker';
import Video from 'react-native-video';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import axios from '../Utils/Family/axios';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

// setup the message timestamp for readable form

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// get the intial name letter for showing messge profile

const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    return initials;
};
 // setup random color for each messaging user profile 
const getRandomColor = () => {
    const colors = ['#FFC107', '#FF5722', '#03A9F4', '#8BC34A', '#E91E63', '#9C27B0'];
    return colors[Math.floor(Math.random() * colors.length)];
};

// component for showing each message in the chat screeen  data will coming form the scrollview container 

// setup message sender reciver message card aligment and color change 

const MessageBubble = ({ isUser, message, otherMember, onMediaPress, navigation, nickname }) => {
    const isImage = message.type && message.type.startsWith('image/');  // media file showing 
    const isVideo = message.type && message.type.startsWith('video/'); // media file showing 
    const paddingValue = isImage || isVideo ? 4 : 8;
    const gradientColors = isUser ? ['#18426D', '#286EB5'] : ['#E6D8B6', '#FFE4C4']; // message container color change 

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
        <View style={{ flexDirection: isUser ? 'row-reverse' : 'row', marginBottom: 16, alignItems: 'flex-end', }}>
            {!isUser && (
                <TouchableOpacity onPress={() => navigation.navigate('FriendProfile', { userId: message._sender.userId })}>
                    {message._sender.profileUrl ? (
                        <Image source={{ uri: message._sender.profileUrl }} style={{ width: 28, height: 28, borderRadius: 14, marginLeft: 8, marginRight: 3 }} />
                    ) : (
                        <View style={{ width: 28, height: 28, borderRadius: 14, marginLeft: 8, marginRight: 3, backgroundColor: getRandomColor(), justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 14 }}>{getInitials(nickname)}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}
            <View style={{ maxWidth: width * 0.7 }}>
                {!isUser && <Text style={{ color: 'gray', fontSize: 12 }}>{nickname}</Text>} 
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        padding: paddingValue,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        borderBottomLeftRadius: isUser ? 20 : 0,
                        borderBottomRightRadius: isUser ? 0 : 20,
                        position: 'relative'
                    }}
                >
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
                    {!isImage && !isVideo && <Text style={{ color: isUser ? 'white' : 'black', fontSize: 18 }}>{renderTextWithLinks(message.message)}</Text>}
                    <Text style={{ color: isUser ? 'white' : 'black', fontSize: 14, marginTop: 4, textAlign: "right" }}>
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
                        borderLeftColor: isUser ? 'transparent' : gradientColors[1],
                        borderRightWidth: isUser ? 12 : 0,
                        borderRightColor: isUser ? gradientColors[1] : 'transparent',
                        right: isUser ? 0 : undefined,
                        left: isUser ? undefined : 0,
                    }} />
                </LinearGradient>
            </View>
        </View>
    );
};

const FamilyConversationScreen = ({ route }) => {
    const navigation = useNavigation();
    const { currentUser } = useContext(AuthContext);  // get current user 
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const { channelUrl, memberId, name, profile } = route.params; // channel data from chat screen famlychat card 
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
    const [familyId, setFamilyId] = useState(null);
    

   // get the channel data from senbird chat sdk using channel id and exract the channel contain messages and data

    useEffect(() => {
        const fetchChannel = async () => {
            if (!currentUser || !currentUser.user_id) {
                console.error('Current user is not defined.');
                return;
            }

            try {
                const groupChannel = await sb.GroupChannel.getChannel(channelUrl);
                setChannel(groupChannel);
                console.log(groupChannel,"channel daata");

                if (groupChannel.data) {
                    const parsedData = JSON.parse(groupChannel.data);
                    setFamilyId(parsedData.familyId);
                }
                

                const messageListQuery = groupChannel.createPreviousMessageListQuery(); // get all message 
                messageListQuery.limit = 20;
                messageListQuery.reverse = false;

                const messages = await messageListQuery.load(); // loade message 
                setMessages(messages);
                console.log(messages);

                const ChannelHandler = new sb.ChannelHandler();
                ChannelHandler.onMessageReceived = (channel, message) => {
                    setMessages(prevMessages => [...prevMessages, message]);
                };
                ChannelHandler.onReadReceiptUpdated = (channel) => {  // update message read 
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
        scrollViewRef.current?.scrollToEnd({ animated: true }); // chat scroll navigation to end or last message 
    }, [messages]);

    // send message function to sendbird server 

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

    // send media contain message to sendbird server 

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

    // function for media selcetion in the chat 

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

    // function for selecting emoji

    const handleEmojiPicked = (emoji) => {
        setMessageText(prevMessageText => prevMessageText + emoji);
        setIsEmojiPickerVisible(false);
    };

    // media selection cancel function

    const cancelSelectedMedia = () => {
        setSelectedMedia(null);
    };

    // help modale dropdown 

    const openDropdown = () => {
        setModalVisible(true);
    };

    const closeDropdown = () => {
        setModalVisible(false);
    };

    const handleHelpClick = () => {
        Linking.openURL('mailto:spiderodevp@memorilink.com');
    };
 // function for media message preview 
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
            <SafeAreaView style={{ flex: 0, backgroundColor: '#18426D', height: height * 0.2, borderBottomLeftRadius: 30, borderBottomRightRadius: 30,zIndex: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 8, paddingHorizontal: 20 }}>
                    <TouchableOpacity style={{ marginRight: 20, marginTop: 4 }} onPress={() => navigation.goBack()}>
                        <ArrowLeftIcon size={25} color="white" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold',marginRight: width * 0.01 }}>{name}</Text>
                    <TouchableOpacity style={{ marginTop: 4 }} onPress={openDropdown}>
                        <EllipsisVerticalIcon size={25} color="white" />
                    </TouchableOpacity>
                </View>
                 {/* family screen navigation  */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: "10%", marginBottom: 8, paddingHorizontal: 20 }}> 
                    <TouchableOpacity onPress={() => navigation.navigate('Familylist', { familyId: familyId })} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={{ uri: profile }} style={{ width: width * 0.25, height: width * 0.25, borderRadius: (width * 0.3) / 2, borderWidth: 4, borderColor: 'white',zIndex: 3 }} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
             {/* message showing scrollview */}
            <ScrollView style={{ flex: 1, padding: 20, marginTop: -50, zIndex: 1  }} ref={scrollViewRef} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
                {messages.map(message => {
                    const isUser = message._sender?.userId === currentUser.user_id.toString();
                    return (
                        <TouchableOpacity key={message.messageId} onPress={() => navigation.navigate('FriendProfileScreen', { userId: message._sender.userId })}>
                            <MessageBubble
                                isUser={isUser}
                                message={message}
                                otherMember={otherMember}
                                onMediaPress={handleMediaPress}
                                navigation={navigation}
                                nickname={message._sender.nickname}
                            />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
             {/* message sending  */}
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
                 {/* emoji selection */}
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
             {/* media preview   */}
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
             {/* emoji selction container  */}
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
             {/* media preview modal  */}
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

export default FamilyConversationScreen;
