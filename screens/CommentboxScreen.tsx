import React, { useCallback, useContext, useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Share, StyleSheet, Dimensions } from 'react-native';
import { HeartIcon as HeartOutline, ChatBubbleOvalLeftEllipsisIcon as ChatOutline, ArrowLeftIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from "../Utils/Family/axios";
import { AuthContext } from '../AuthContext';
import Video from 'react-native-video';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const CommentboxScreen = () => {
    const navigation = useNavigation();
    const [userPosts, setUserPosts] = useState([]);
    const [userComments, setUserComments] = useState([]);
    const [usedata, Setuserdata] = useState('');
    const [Postslike, setPostslikes] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [loading, setLoading] = useState(true);
    const route = useRoute();
    const { post_id, family_id } = route.params; //get the familyid and post id from postcrad and userpostcard for geting post data 

    const { currentUser } = useContext(AuthContext); // get current user for setup like and unlike functionality 
    const isCurrentUser = currentUser?.user_id;

    const createdAtFormatted = moment(usedata.created_at).format('YYYY-MM-DD '); // convert the post created time to readable formate 
   
    

    
    // get single post data using axios call 

    const fetchPostData = async () => {
        try {
            const postsResponse = await axios.get(`/posts/${post_id}`);
            setUserPosts(postsResponse.data.attachments);
            setUserComments(postsResponse.data.comments);
            setPostslikes(postsResponse.data.likes.length);
            setIsLiked(postsResponse.data.likes.some(like => like.user_id === isCurrentUser));
            Setuserdata(postsResponse.data.post);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPostData();
        }, [])
    );

    // add comment function 

    const [newComment, setNewComment] = useState('');

    const addComment = async (comment) => {
        try {
            const response = await axios.post(`/posts/${post_id}/comments`, { comment });
            return response.data;
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleAddComment = async () => {
        if (newComment.trim() !== '') {
            const commentText = newComment.trim();
            const addedComment = await addComment(commentText);

            if (addedComment) {
                setNewComment('');
                fetchPostData();
            }
        }
    };

    // like and unlike function 

    const toggleLike = async () => {
        try {
            const response = await axios.put(`/posts/${post_id}/likes`);
            setIsLiked(response.data);
            fetchPostData();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // share function for link sharing 

    const handleShare = async () => {
        try {
            const url = `https://www.memorilink.com?${
                family_id ? `family_id=${family_id}` : `user_id=${isCurrentUser}`
            }`;
            await Share.share({
                message: `Check out this post on Memorilink: ${url}`,
            });
        } catch (error) {
            console.error('Error sharing post:', error);
        }
    };

    // get the video url from post data

    const isVideo = (url) => {
        const videoExtensions = ['mp4', 'mov', 'wmv', 'flv', 'avi', 'mkv'];
        const extension = url.split('.').pop();
        return videoExtensions.includes(extension);
    };

    // user profile redirection function 
    const handleProfilePress = () => {
        navigation.navigate('FriendProfile', { userId: usedata.id });
      };

      // post comment scren skeleton loader for loading state

    const renderSkeletonLoader = () => (
        <View>
            <View style={styles.skeletonUserInfo}>
                <View style={styles.skeletonBackButton} />
                <View style={styles.skeletonUserImage} />
                <View style={styles.skeletonTextContainer}>
                    <View style={styles.skeletonUserName} />
                    <View style={styles.skeletonUserDate} />
                </View>
            </View>
            <View style={styles.skeletonDescription} />
            <View style={styles.skeletonPostContent}>
                <View style={styles.skeletonLargeMedia} />
                <View style={styles.skeletonSmallMediaContainer}>
                    <View style={styles.skeletonSmallMedia} />
                    <View style={styles.skeletonSmallMedia} />
                </View>
            </View>
            <View style={styles.skeletonActions}>
                <View style={styles.skeletonActionButton} />
                <View style={styles.skeletonActionButton} />
                <View style={styles.skeletonActionButton} />
            </View>
            <View style={styles.skeletonSeparator} />
            <View style={styles.skeletonComment} />
            <View style={styles.skeletonComment} />
        </View>
    );
    // scrollview show the post content and comments also setup the post attachment according to the number of media 

    return (
        <ScrollView style={styles.container}>
            <SafeAreaView style={styles.header}>
                {loading ? (
                    renderSkeletonLoader()
                ) : (
                    <>
                        <View style={styles.userInfo}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <ArrowLeftIcon size={width * 0.06} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleProfilePress}>
                            <Image source={usedata?.profile_image ? { uri: usedata.profile_image } : require('../assets/profile.png')} style={styles.userImage} />

                            </TouchableOpacity>
                            
                            <View>
                                <Text style={styles.userName}>{usedata?.full_name}</Text>
                                <Text style={styles.userDate}>{createdAtFormatted}</Text>


                            </View>
                        </View>
                        {usedata?.description && (
                            <View>
                                <Text style={styles.postDescription}>
                                    {showFullDescription ? usedata.description : `${usedata.description.slice(0, 100)}...`}
                                </Text>
                                {usedata.description.length > 100 && (
                                    <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                                        <Text style={styles.readMore}>
                                            {showFullDescription ? 'Read less' : 'Read more'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        <View style={styles.postContent}>  
                            {userPosts.length > 0 && (
                                <View style={styles.mediaContainer}>
                                    {userPosts.length === 5 && (
                                        <>
                                            <View style={styles.largeMediaContainer}>
                                                {isVideo(userPosts[0].attachment_url) ? (
                                                    <Video
                                                        source={{ uri: userPosts[0].attachment_url }}
                                                        style={styles.largeMedia}
                                                        resizeMode="cover"
                                                        repeat
                                                        muted
                                                    />
                                                ) : (
                                                    <Image source={{ uri: userPosts[0].attachment_url }} style={styles.largeMedia} />
                                                )}
                                            </View>
                                            <View style={styles.smallMediaContainer}>
                                                {userPosts.slice(1, 3).map((post, index) => (
                                                    <View key={index} style={styles.smallMedia}>
                                                        {isVideo(post.attachment_url) ? (
                                                            <Video
                                                                source={{ uri: post.attachment_url }}
                                                                style={styles.smallMedia}
                                                                resizeMode="cover"
                                                                repeat
                                                                muted
                                                            />
                                                        ) : (
                                                            <Image source={{ uri: post.attachment_url }} style={styles.smallMedia} />
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                            <View style={styles.smallMediaContainer}>
                                                {userPosts.slice(3, 5).map((post, index) => (
                                                    <View key={index} style={styles.smallMedia}>
                                                        {isVideo(post.attachment_url) ? (
                                                            <Video
                                                                source={{ uri: post.attachment_url }}
                                                                style={styles.smallMedia}
                                                                resizeMode="cover"
                                                                repeat
                                                                muted
                                                            />
                                                        ) : (
                                                            <Image source={{ uri: post.attachment_url }} style={styles.smallMedia} />
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        </>
                                    )}
                                    {userPosts.length === 4 && (
                                        <View style={styles.fourMediaContainer}>
                                            {userPosts.map((post, index) => (
                                                <View key={index} style={styles.quadMedia}>
                                                    {isVideo(post.attachment_url) ? (
                                                        <Video
                                                            source={{ uri: post.attachment_url }}
                                                            style={styles.quadMedia}
                                                            resizeMode="cover"
                                                            repeat
                                                            muted
                                                        />
                                                    ) : (
                                                        <Image source={{ uri: post.attachment_url }} style={styles.quadMedia} />
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                    {userPosts.length === 3 && (
                                        <>
                                            <View style={styles.largeMediaContainer}>
                                                {isVideo(userPosts[0].attachment_url) ? (
                                                    <Video
                                                        source={{ uri: userPosts[0].attachment_url }}
                                                        style={styles.largeMedia}
                                                        resizeMode="cover"
                                                        repeat
                                                        muted
                                                    />
                                                ) : (
                                                    <Image source={{ uri: userPosts[0].attachment_url }} style={styles.largeMedia} />
                                                )}
                                            </View>
                                            <View style={styles.smallMediaContainer}>
                                                {userPosts.slice(1).map((post, index) => (
                                                    <View key={index} style={styles.smallMedia}>
                                                        {isVideo(post.attachment_url) ? (
                                                            <Video
                                                                source={{ uri: post.attachment_url }}
                                                                style={styles.smallMedia}
                                                                resizeMode="cover"
                                                                repeat
                                                                muted
                                                            />
                                                        ) : (
                                                            <Image source={{ uri: post.attachment_url }} style={styles.smallMedia} />
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        </>
                                    )}
                                    {userPosts.length === 2 && (
                                        <View style={styles.twoMediaContainer}>
                                            {userPosts.map((post, index) => (
                                                <View key={index} style={styles.dualMedia}>
                                                    {isVideo(post.attachment_url) ? (
                                                        <Video
                                                            source={{ uri: post.attachment_url }}
                                                            style={styles.dualMedia}
                                                            resizeMode="cover"
                                                            repeat
                                                            muted
                                                        />
                                                    ) : (
                                                        <Image source={{ uri: post.attachment_url }} style={styles.dualMedia} />
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                    {userPosts.length === 1 && (
                                        <View style={styles.singleMediaContainer}>
                                            {isVideo(userPosts[0].attachment_url) ? (
                                                <Video
                                                    source={{ uri: userPosts[0].attachment_url }}
                                                    style={styles.singleMedia}
                                                    resizeMode="cover"
                                                    repeat
                                                    muted
                                                />
                                            ) : (
                                                <Image source={{ uri: userPosts[0].attachment_url }} style={styles.singleMedia} />
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                        <View style={styles.postActions}>
                            <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
                                {isLiked ? (
                                    <HeartOutline size={width * 0.06} color="red" />
                                ) : (
                                    <HeartOutline size={width * 0.06} color="#16436C" />
                                )}
                                <Text style={styles.actionText}>{Postslike}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <ChatOutline size={width * 0.06} color="#16436C" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                <Image source={require('../assets/share.png')} style={styles.shareIcon} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.separator} />
                    </>
                )}
            </SafeAreaView>
            <View style={styles.commentSection}>
                {loading ? (
                    <View>
                        <View style={styles.skeletonComment} />
                        <View style={styles.skeletonComment} />
                    </View>
                ) : userComments.length > 0 ? (
                    userComments.map((comment, index) => (
                        <View key={`${comment.id}-${index}`} style={styles.comment}>
                            <Image source={ comment?.profile_image?{ uri: comment?.profile_image }: require('../assets/profile.png')} style={styles.commentImage} />
                            <View style={styles.commentTextContainer}>
                                <Text style={styles.commentText}>{comment.comment}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
                )}
            </View>
            {!loading && (
                <View style={styles.commentInputContainer}>
                    <View style={styles.commentInputWrapper}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Write a comment..."
                            value={newComment}
                            onChangeText={setNewComment}
                        />
                        <TouchableOpacity style={styles.commentSendButton} onPress={handleAddComment}>
                            <ChevronRightIcon size={width * 0.06} color="#828287" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: width * 0.05,
    },
    header: {
        backgroundColor: 'transparent',
        borderRadius: 10,
        marginBottom: height * 0.03,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.01,
        marginTop: height * 0.03,
    },
    backButton: {
        marginRight: width * 0.05,
        marginTop: height * 0.01,
    },
    userImage: {
        width: width * 0.1,
        height: width * 0.1,
        borderRadius: width * 0.05,
        marginRight: width * 0.03,
    },
    userName: {
        fontSize: width * 0.04,
        fontWeight: '600',
    },
    userDate: {
        fontSize: width * 0.03,
        color: 'black',
    },
    postDescription: {
        fontSize: width * 0.03,
        marginTop: height * 0.02,
        marginBottom: height * 0.01,
        color: 'black',
    },
    readMore: {
        fontSize: width * 0.03,
        color: 'blue',
    },
    postContent: {
        marginBottom: height * 0.01,
        marginTop: height * 0.01,
    },
    mediaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    largeMediaContainer: {
        flex: 1,
        marginRight:5,
    },
    largeMedia: {
        width: '100%',
        height: height * 0.25,
        borderRadius: 20,
         overflow: "hidden"
        
    },
    smallMediaContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    smallMedia: {
        width: '100%',
        height: height * 0.12,
        borderRadius: 20,
        overflow: "hidden"
    },
    fourMediaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quadMedia: {
        width:width * 0.44,
        height: height * 0.15,
        marginBottom: height * 0.01,
        borderRadius: 20,
        overflow: "hidden"
    },
    twoMediaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
       
    },
    dualMedia: {
        width: width * 0.43,
        height: height * 0.22,
        borderRadius: 20,
        overflow:"hidden",
        margin:2,
    },
    singleMediaContainer: {
        flex: 1,
    },
    singleMedia: {
        width: '100%',
        height: height * 0.3,
        borderRadius: 15,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: height * 0.02,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        fontSize: width * 0.03,
        color: 'black',
    },
    shareIcon: {
        width: width * 0.07,
        height: width * 0.07,
    },
    separator: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        marginVertical: height * 0.02,
    },
    commentSection: {
        flex: 1,
    },
    comment: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.01,
    },
    commentImage: {
        width: width * 0.08,
        height: width * 0.08,
        borderRadius: width * 0.04,
        marginRight: width * 0.03,
    },
    commentTextContainer: {
        backgroundColor: '#d4d7de',
        padding: width * 0.02,
        borderRadius: 10,
        maxWidth: '85%',
    },
    commentText: {
        fontSize: width * 0.03,
        fontWeight: '500',
        color: 'black',
    },
    noComments: {
        textAlign: 'center',
        color: 'gray',
        marginTop: height * 0.02,
        fontSize: width * 0.03,
    },
    commentInputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: height * 0.02,
    },
    commentInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: width * 0.03,
    },
    commentInput: {
        flex: 1,
        paddingVertical: height * 0.01,
        fontSize: width * 0.04,
    },
    commentSendButton: {
        padding: width * 0.02,
    },
    skeletonUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.01,
        marginTop: height * 0.03,
    },
    skeletonBackButton: {
        width: width * 0.06,
        height: width * 0.06,
        backgroundColor: '#e0e0e0',
        borderRadius: width * 0.03,
        marginRight: width * 0.05,
    },
    skeletonUserImage: {
        width: width * 0.1,
        height: width * 0.1,
        backgroundColor: '#e0e0e0',
        borderRadius: width * 0.05,
        marginRight: width * 0.03,
    },
    skeletonTextContainer: {
        flex: 1,
    },
    skeletonUserName: {
        width: width * 0.4,
        height: width * 0.04,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 4,
    },
    skeletonUserDate: {
        width: width * 0.3,
        height: width * 0.03,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
    },
    skeletonDescription: {
        width: '100%',
        height: height * 0.05,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginTop: height * 0.02,
        marginBottom: height * 0.01,
    },
    skeletonPostContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: height * 0.02,
        marginTop: height * 0.01,
    },
    skeletonLargeMedia: {
        width: '100%',
        height: height * 0.25,
        backgroundColor: '#e0e0e0',
        borderRadius: 15,
        marginBottom: height * 0.02,
    },
    skeletonSmallMediaContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    skeletonSmallMedia: {
        width: '95%',
        height: height * 0.12,
        backgroundColor: '#e0e0e0',
        borderRadius: 15,
    },
    skeletonActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: height * 0.02,
    },
    skeletonActionButton: {
        width: width * 0.1,
        height: width * 0.1,
        backgroundColor: '#e0e0e0',
        borderRadius: width * 0.05,
    },
    skeletonSeparator: {
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: 1,
        marginVertical: height * 0.02,
    },
    skeletonComment: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.01,
        paddingVertical: height * 0.02,
    },
    skeletonCommentImage: {
        width: width * 0.08,
        height: width * 0.08,
        backgroundColor: '#e0e0e0',
        borderRadius: width * 0.04,
        marginRight: width * 0.03,
    },
    skeletonCommentText: {
        flex: 1,
        height: height * 0.05,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        marginRight: width * 0.02,
    },
});

export default CommentboxScreen;
