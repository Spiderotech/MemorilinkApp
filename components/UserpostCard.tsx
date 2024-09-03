import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert, Share } from 'react-native';
import { HeartIcon as HeartOutline, ChatBubbleOvalLeftEllipsisIcon as ChatOutline } from 'react-native-heroicons/outline';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import moment from 'moment';
import axios from "../Utils/Family/axios";
import Toast from 'react-native-toast-message';
import { AuthContext } from '../AuthContext';

const { width, height } = Dimensions.get('window');

const UserpostCard = ({ post, user, refreshPosts,  }) => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const isCurrentUser = currentUser?.user_id;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const fetchPostLikes = async () => {
    try {
      const response = await axios.get(`/posts/${post.id}/likes`);
      console.log(response.data);
      
      setLikeCount(response.data.length);
      setIsLiked(response.data.some(like => like === isCurrentUser));
    } catch (error) {
      console.error('Error fetching post likes:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPostLikes();
    }, [post.id, isCurrentUser])
);

 

  const handleLikePress = async () => {
    try {
      const response = await axios.put(`/posts/${post.id}/likes`);
      setIsLiked(!isLiked);
      fetchPostLikes();  
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    try {
      const url = `https://www.memorilink.com/friend/${user?.id}`;
      await Share.share({
        message: `Check out this post on Memorilink: ${url}`,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const renderMedia = () => {
    if (post.attachment_urls && post.attachment_urls.length > 0) {
      return (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} nestedScrollEnabled={true} style={styles.mediaContainer}>
          {post.attachment_urls.map((url, index) => {
            const isVideo = url.endsWith('.mp4');
            return (
              <View key={index} style={styles.mediaItem}>
                {isVideo ? (
                  <Video
                    source={{ uri: url }}
                    style={styles.media}
                    resizeMode="cover"
                    controls={true}
                  />
                ) : (
                  <Image
                    source={{ uri: url }}
                    style={styles.media}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>
      );
    }
    return null;
  };

  const renderDescription = () => {
    const description = post?.description || '';
    
    if (!description) return null;

    return (
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {description.length > 100 ? (
            expanded ? description : `${description.slice(0, 100)}...`
          ) : (
            description
          )}
        </Text>
        {description.length > 100 && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.readMore}>
              {expanded ? 'Read less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
};

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleRemove = async () => {
    Alert.alert(
      "Remove Post",
      "Are you sure you want to remove this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            try {
              const response = await axios.delete(`/posts/${post.id}/deletepost`);
              console.log('Delete response:', response.data);
              setModalVisible(false);
              Toast.show({
                type: 'success',
                text1: 'Remove',
                text2: 'Post removed successfully.',
                visibilityTime: 3000,
              });
              refreshPosts();
            } catch (error) {
              console.error('Error deleting post:', error);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.userInfoLeft}>
          <Image source={user?.profile_image?{ uri: user?.profile_image}:require('../assets/profile.png')} style={styles.userImage} />
          <View>
            <Text style={styles.userName}>{user?.full_name}</Text>
            <Text style={styles.userDate}>{moment(post?.created_at).fromNow()}</Text>
          </View>
        </View>
        {isCurrentUser === user?.id && (
          <TouchableOpacity onPress={toggleModal} style={styles.dots}>
            <Text style={styles.dotsText}>⋮</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        {renderMedia()}
        {renderDescription()}
      </View>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
          <HeartOutline size={width * 0.06} color={isLiked ? "red" : "#16436C"} />
          <Text>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Postcomment', { post_id: post.id })}>
          <ChatOutline size={width * 0.06} color="#16436C" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Image
            source={require('../assets/share.png')}
            style={styles.shareIcon} 
          />
        </TouchableOpacity>
      </View>

      {isModalVisible && (
        <View style={styles.dropdownContainer}>
          <TouchableOpacity onPress={handleRemove} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginBottom: height * 0.03,
    position: 'relative',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: width * 0.02,
    color: 'black',
    fontWeight: '400',
  },
  dots: {
    padding: 10,
  },
  dotsText: {
    fontSize: 24,
    color: '#000',
  },
  postContent: {
    marginBottom: height * 0.01,
  },
  mediaContainer: {
    marginBottom: height * 0.02,
  },
  mediaItem: {
    marginRight: width * 0.02,
  },
  media: {
    width: width * 0.92,
    height: height * 0.25,
    borderRadius: 15,
    overflow: "hidden"
  },
  description: {
    fontSize: width * 0.03,
    color: 'black',
  },
  readMore: {
    fontSize: width * 0.032,
    color: 'blue',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareIcon: {
    width: width * 0.07,
    height: width * 0.07,
  },
  dropdownContainer: {
    position: 'absolute',
    right: 10,
    top: 30,
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 1000,
  },
  modalButton: {
    padding: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: 'black',
  },
  descriptionContainer: {
    marginLeft: width * 0.03,
    marginBottom: height * 0.009,
  },
});

export default UserpostCard;
