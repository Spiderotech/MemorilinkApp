import React, { useCallback, useContext, useState } from 'react';
import { Alert, Image, Modal, Pressable, SafeAreaView, Text, TouchableOpacity, View, ScrollView, Share, Dimensions, RefreshControl, LogBox } from 'react-native';
import { Bars3Icon, CalendarDaysIcon, StarIcon, QrCodeIcon, LinkIcon, PencilIcon } from 'react-native-heroicons/solid';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from "../Utils/Family/axios";
import Video from 'react-native-video';
import sb from '../sendbird';
import FamilyscreenSkeloton from "../components/FamilyscreenSkeloton"
import Toast from 'react-native-toast-message';
import { AuthContext } from '../AuthContext';

const screenWidth = Dimensions.get('window').width;

const FamilyScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { familyId } = route.params;// family id from family realated component and screen 
    const { currentUser } = useContext(AuthContext); // get current user for condition checking 
    const [modalVisible, setModalVisible] = useState(false);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [familyData, setFamilyData] = useState(null);
    const [connections, setConnections] = useState(null);
    const [postcount, setFamilypostcount] = useState(null);
    const [familyimgData, setFamilyimgData] = useState([]);
    const [connectionstatus, setConnectionstatus] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const isCurrentUser = currentUser?.user_id;


// get the family data contain family post data also get the family connection data

    const fetchUserData = async () => {
        try {
            const postsResponse = await axios.get(`/family/${familyId}`);
            const response = await axios.get(`/family/${familyId}/familyconnections`);

            setUserPosts(postsResponse?.data.posts); // set family post data
            setFamilyData(postsResponse.data.family); // set family data
            setConnections(response.data.length); // set family connection count 
            setFamilypostcount(postsResponse?.data?.posts.length);
            setFamilyimgData(postsResponse.data.familyAttachments[0]); // set family profile image 
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };
  // get the connection checking for the current user joined or not 
    const fetchConnectionData = async () => {
        try {
            const connectioncheck = await axios.post(`/family/${familyId}/connectioncheck`);
            setConnectionstatus(connectioncheck.data);
        } catch (error) {
            console.error('Error fetching connection data:', error);
        }
    };
// check the current user add the family in favorite list 
    const checkFavoriteStatus = async () => {
        try {
            const response = await axios.post(`/family/${familyId}/favoritefamilycheck`);
            setIsFavorite(response.data);

        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };
    
// family add to favorite function
    const addToFavorites = async () => {
        try {
            await axios.post(`/family/${familyId}/favorite`);
            setIsFavorite(true);

            Toast.show({
                type: 'success',
                text1: 'Added to Favorites',
                text2: 'This family has been added to your favorites.',
                visibilityTime: 3000,
            });


        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };
 // favorite remove function
    const removeFromFavorites = async () => {
        try {
            await axios.delete(`/family/${familyId}/favorite`);
            setIsFavorite(false);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'This family has been removed from your favorites.',
                visibilityTime: 3000,
            });


        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserData();
        await fetchConnectionData();
        await checkFavoriteStatus();
        setRefreshing(false);
    };
 // get all the data at the time screen render 
    useFocusEffect(
        useCallback(() => {
            fetchUserData();
            fetchConnectionData();
            checkFavoriteStatus();
        }, [familyId,isFavorite])
    );
// family post navigation feed screen 
    const handlePostPress = () => {
        if (connectionstatus) {
            navigation.navigate('Familyfeed', { familyId: familyId });
        } else {

            Toast.show({
                type: 'error',
                text1: 'Not Connected',
                text2: 'You need to be connected to view this post.',
                visibilityTime: 3000,
            });
        }
    };
// current user can join the family function 
    const handleJoin = async () => {
        try {
            const response = await axios.post(`/family/${familyId}/connections`);
            if (response.data) {
                setConnectionstatus(true);
                await fetchUserData();

                const channelUrl = familyData?.channel_url;  // get the family channel url 

                if (channelUrl) {
                    sb.GroupChannel.getChannel(channelUrl, async (groupChannel, error) => { // get the family channel using family url 
                        if (error) {
                            console.error('Error retrieving channel:', error);
                            return;
                        }

                        if (groupChannel.isPublic) {
                            try {
                                await groupChannel.join();
                                console.log('User joined the public channel:', groupChannel); // family channel join function from sendbird 
                                Toast.show({
                                    type: 'success',
                                    text1: 'Connected',
                                    text2: 'You are now connected to the family and the chat group.',
                                    visibilityTime: 3000,
                                });
                            } catch (joinError) {
                                console.error('Error joining public channel:', joinError);
                                Toast.show({
                                    type: 'error',
                                    text1: 'Error',
                                    text2: 'Unable to join the public chat channel.',
                                    visibilityTime: 3000,
                                });
                            }
                        } else {
                            console.error('Channel is not public.');

                        }
                    });
                } else {
                    console.error('Channel URL not found.');

                }
            } else {
                console.error('Failed to Connect', 'Unable to connect to the family.');
            }
        } catch (error) {
            console.error('Error connecting to family:', error);

        }
    };
// unfollow the family function 
    const handleUnfollow = async () => {
        try {
            const response = await axios.delete(`/family/${familyId}/connections`);

            if (response.data) {
                setConnectionstatus(false);
                await fetchUserData();

                // Leave the Sendbird family channel
                const channelUrl = familyData?.channel_url;
                if (channelUrl) {
                    sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
                        if (error) {
                            console.error('Error retrieving channel:', error);
                            return;
                        }
                        groupChannel.leave((response, leaveError) => {
                            if (leaveError) {
                                console.error('Error leaving channel:', leaveError);
                                return;
                            }
                            console.log('Successfully left the channel:', groupChannel.name);
                        });
                    });
                }

                Toast.show({
                    type: 'success',
                    text1: 'Disconnected',
                    text2: 'You have unfollowed the family and left the chat group.',
                    visibilityTime: 3000,
                });
            } else {
                Alert.alert('Failed to Unfollow', 'Unable to unfollow the family.');
            }
        } catch (error) {
            console.error('Error unfollowing family:', error);
            Alert.alert('Error', 'An error occurred while trying to unfollow.');
        }
        setModalVisible(false);
    };

// family link sharing function 
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out the ${familyData?.name} family on Memorilink: https://www.memorilink.com/family/${familyId}`,
            });
        } catch (error) {
            console.error('Error sharing family link:', error);
        }
        setModalVisible(false);
    };

    const isVideo = (url) => {
        if (typeof url !== 'string') {
            return false;
        }
        const videoExtensions = ['mp4', 'mov', 'wmv', 'flv', 'avi', 'mkv'];
        const extension = url.split('.').pop();
        return videoExtensions.includes(extension);
    };
// family post rendering 
    const renderPostItem = (post, index) => {
        if (post.attachments.length === 0) {
            // No attachments, show container with pencil icon
            return (
                <TouchableOpacity key={`${index}-no-media`} onPress={() => handlePostPress(post)}>
                    <View
                        style={{
                            width: screenWidth / 3.5,
                            height: screenWidth / 3.5,
                            borderRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#E6E6E6',
                        }}
                    >
                        <PencilIcon size={30} color="#000000" />
                    </View>
                </TouchableOpacity>
            );
        }

        // Handle posts with attachments (images or videos)
        return post.attachments.slice(0, 1).map((url, idx) => (
            <TouchableOpacity key={`${index}-${idx}`} onPress={() => handlePostPress(post)}>
                {isVideo(url.attachment_url) ? (
                    <Video
                        source={{ uri: url.attachment_url }}
                        style={{
                            width: screenWidth / 3.5,
                            height: screenWidth / 3.5,
                            borderRadius: 20,
                            overflow: 'hidden',
                            shadowColor: '#000000',
                            shadowOffset: { width: 0, height: 5 },
                            shadowOpacity: 0.2,
                            elevation: 5,
                        }}
                        resizeMode="cover"
                        repeat
                        muted
                    />
                ) : (
                    <Image
                        source={{ uri: url.attachment_url }}
                        style={{
                            width: screenWidth / 3.5,
                            height: screenWidth / 3.5,
                            borderRadius: 20,
                            shadowColor: '#000000',
                            shadowOffset: { width: 0, height: 5 },
                            shadowOpacity: 0.2,
                        }}
                    />
                )}
            </TouchableOpacity>
        ));
    };
// post rendering length in the each  row 
    const rows = [];
    for (let i = 0; i < userPosts.length; i += 3) {
        rows.push(userPosts.slice(i, i + 3));
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            {loading ? (
                <FamilyscreenSkeloton />

            ) : (
                <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                        <Text style={{ color: 'black', fontSize: screenWidth * 0.05, fontWeight: '300', marginLeft: 24 }}>
                            {familyData?.name}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                style={{ marginRight: 15, marginTop: 2 }}
                                onPress={() => setModalVisible(true)}
                            >
                                <Bars3Icon size={screenWidth * 0.08} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 20, marginTop: "10%" }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                            {isVideo(familyimgData?.attachment_url) ? (
                                <Video
                                    source={{ uri: familyimgData?.attachment_url }}
                                    style={{ width: screenWidth / 1.5, height: screenWidth / 1.8, borderRadius: 20, overflow: 'hidden' }}
                                    resizeMode="cover"
                                    muted
                                />
                            ) : (
                                <Image source={{ uri: familyimgData?.attachment_url }} style={{ width: screenWidth / 1.5, height: screenWidth / 1.8, borderRadius: 20 }} />
                            )}
                             {/*  family data and connection redirection and feed redirection   */}
                            <View style={{ justifyContent: 'space-between', marginLeft: screenWidth * 0.05 }}>
                                <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Familyfeed', { familyId: familyId })}>
                                    <Text style={{ color: 'black', fontSize: screenWidth * 0.055, fontWeight: '600' }}>
                                        {postcount}
                                    </Text>
                                    <Text style={{ color: '#848488', fontSize: screenWidth * 0.03, fontWeight: '300' }}>
                                        Memories
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Connections', { familyId: familyId })}>
                                    <Text style={{ color: 'black', fontSize: screenWidth * 0.055, fontWeight: '600' }}>
                                        {connections}
                                    </Text>
                                    <Text style={{ color: '#848488', fontSize: screenWidth * 0.03, fontWeight: '300' }}>
                                        Connections
                                    </Text>
                                </TouchableOpacity>
                                <View style={{ paddingVertical: 12 }}>
                                    {connectionstatus ? (
                                        <TouchableOpacity style={{ backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: "center", height: screenWidth * 0.1, width: screenWidth * 0.2, borderRadius: 7 }} onPress={() => navigation.navigate('Messages')}>
                                            <Text style={{ color: 'white', fontSize: screenWidth * 0.04, fontWeight: '400' }}>Chat</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity style={{ backgroundColor: '#22c55e', alignItems: 'center', justifyContent: "center", height: screenWidth * 0.1, width: screenWidth * 0.2, borderRadius: 7 }} onPress={handleJoin}>
                                            <Text style={{ color: 'white', fontSize: screenWidth * 0.04, fontWeight: '400' }}>Join</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>

                        <View style={{ marginTop: 30 }}>
                            <Text style={{ color: '#C7C7CC', fontSize: screenWidth * 0.03, fontWeight: '400', lineHeight: 14, textAlign: 'justify', marginBottom: 15 }}>
                                {familyData?.bio}
                            </Text>
                        </View>

                        <View style={{ borderBottomWidth: 0.5, borderColor: '#000000', width: '100%', marginTop: 20 }} />
                      {/* family post  */}
                        <View style={{ marginTop: 20 }}>
                            <Text style={{ color: 'black', fontSize: screenWidth * 0.05, fontWeight: '600', marginLeft: 8 }}>
                                View
                            </Text>

                            <ScrollView style={{ marginTop: 20, marginBottom: 24 }}>
                                {rows.length === 0 ? (
                                    <Text style={{ textAlign: 'center', color: 'grey', fontSize: 16, marginTop: 20 }}>
                                        No posts available
                                    </Text>
                                ) : (
                                    rows.map((row, rowIndex) => (
                                        <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                                            {row.map((post, postIndex) => renderPostItem(post, rowIndex * 3 + postIndex))}
                                        </View>
                                    ))
                                )}

                            </ScrollView>
                        </View>
                    </View>
                     {/* fmaily scrren modal for unfollow ,QRcode ,add to favorite ,share button  */}

                    <Modal
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <Pressable
                            style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                            onPress={() => setModalVisible(false)}
                        >
                            <View style={{ width: '100%', backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center', paddingHorizontal: 20 }}>
                                <View style={{ borderBottomWidth: 4, borderColor: 'black', borderRadius: 10, width: 80, marginTop: 20 }} />
                                <View style={{ justifyContent: 'center', alignItems: 'center', width: '80%', marginTop: 30 }}>
                                    {connectionstatus && isCurrentUser !== familyData?.user_id && (
                                        <TouchableOpacity style={{ padding: 10, backgroundColor: '#6c757d', alignItems: 'center', width: 110, borderRadius: 7 }} onPress={handleUnfollow}>
                                            <Text style={{ color: 'white', fontSize: 17, fontWeight: '500' }}>Unfollow</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={{ paddingVertical: 10, backgroundColor: '#E6D8B6', marginTop: 30, width: '100%', borderRadius: 19, marginBottom: 40 }}>
                                    {connectionstatus && (
                                        <TouchableOpacity
                                            onPress={isFavorite ? removeFromFavorites : addToFavorites}
                                            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10, paddingTop: 15, borderBottomWidth: 0.5, borderColor: '#000000' }}
                                        >
                                            <StarIcon size={25} color="black" />
                                            <Text style={{ fontSize: 18, color: 'black', fontWeight: '400', marginLeft: 20 }}>
                                                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                                            </Text>
                                        </TouchableOpacity>

                                    )}

                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10, paddingTop: 15, borderBottomWidth: 0.5, borderColor: '#000000' }} onPress={() => { navigation.navigate('FamilyQR', { familyId: familyId }); setModalVisible(false); }}>
                                        <QrCodeIcon size={25} color="black" />
                                        <Text style={{ fontSize: 18, color: 'black', fontWeight: '400', marginLeft: 20 }}>QR Code</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10, paddingTop: 15, borderBottomWidth: 0.5, borderColor: '#000000' }} onPress={() => { navigation.navigate('CreateEvent'); setModalVisible(false); }}>
                                        <CalendarDaysIcon size={25} color="black" />
                                        <Text style={{ fontSize: 18, color: 'black', fontWeight: '400', marginLeft: 20 }}>Create a Moment</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10, paddingTop: 15 }} onPress={handleShare}>
                                        <LinkIcon size={25} color="black" />
                                        <Text style={{ fontSize: 18, color: 'black', fontWeight: '400', marginLeft: 20 }}>Share Group Link</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Pressable>
                    </Modal>
                </>
            )}
        </SafeAreaView>
    );
};

export default FamilyScreen;
