import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Share, StyleSheet, Dimensions, Alert } from 'react-native';
import { HeartIcon as HeartOutline, ChatBubbleOvalLeftEllipsisIcon as ChatOutline } from 'react-native-heroicons/outline';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import Video from 'react-native-video';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import axios from "../Utils/Family/axios";

const { width, height } = Dimensions.get('window');

const PostCard = ({ post, family_id, onRemovePost, admin }) => {
  const navigation = useNavigation();
  const { description, created_at, attachments, user, id, likes } = post;
  const { currentUser } = useContext(AuthContext);
  const isCurrentUser = currentUser?.user_id;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const fetchPostLikes = async () => {
    try {
      const response = await axios.get(`/posts/${id}/likes`);
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
    }, [id, isCurrentUser])
);

 

  const handleLikePress = async () => {
    try {
      const response = await axios.put(`/posts/${id}/likes`);
      setIsLiked(!isLiked);
      fetchPostLikes();  
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };


  const handleShare = async () => {
    try {
      const url = `https://www.memorilink.com/family/${familyId}`;
      await Share.share({
        message: `Check out this post on Memorilink: ${url}`,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      "Remove Post",
      "Are you sure you want to remove this post?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: async () => {
          try {
            const response = await axios.put(`/posts/${post.id}/removepostbyadmin`,{family_id});
            console.log('Delete response:', response.data);
            setModalVisible(false);
            Toast.show({
              type: 'success',
              text1: 'Post removed',
              text2: 'Post removed sucessfully.',
              visibilityTime: 3000,
          });
           
          } catch (error) {
            console.error('Error deleting post:', error);
          }
        }, }
      ]
    );
    setModalVisible(false);
  };

  const renderAttachment = (attachment, index) => {
    const isVideo = attachment.attachment_url.endsWith('.mp4') || attachment.attachment_url.endsWith('.mov');
    if (isVideo) {
      return (
        <Video
          key={index}
          source={{ uri: attachment.attachment_url }}
          style={styles.attachment}
          resizeMode="cover"
          controls
        />
      );
    }
    return (
      <Image
        key={index}
        source={{ uri: attachment.attachment_url }}
        style={styles.attachment}
      />
    );
  };

  const renderDescription = () => {
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

  const handleProfilePress = () => {
    navigation.navigate('FriendProfile', { userId: user.id });
  };

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.userInfoLeft}>
          <TouchableOpacity onPress={handleProfilePress}>
            <Image source={user?.profile_image?{ uri: user?.profile_image }:require('../assets/profile.png')} style={styles.userImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleProfilePress}>
            <View>
              <Text style={styles.userName}>{user?.full_name}</Text>
              <Text style={styles.userDate}>{moment(created_at).fromNow()}</Text>
            </View>
          </TouchableOpacity>
        </View>
        {admin === isCurrentUser || user.id === isCurrentUser && (
          <TouchableOpacity onPress={toggleModal} style={styles.dots}>
            <Text style={styles.dotsText}>⋮</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled={true}>
          {attachments.map(renderAttachment)}
        </ScrollView>
      </View>
      {renderDescription()}

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
          <HeartOutline size={width * 0.06} color={isLiked ? "red" : "#16436C"} />
          <Text>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Postcomment', { post_id: id, family_id })}>
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
            <Text style={styles.modalButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    marginBottom: height * 0.02,
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
    color: 'black',
  },
  userDate: {
    fontSize: width * 0.02,
    fontWeight: '400',
    color: 'black',
    marginTop: height * 0.003,
  },
  dots: {
    padding: 10,
  },
  dotsText: {
    fontSize: 24,
    color: '#000',
  },
  postContent: {
    marginBottom: height * 0.02,
  },
  attachment: {
    width: width * 0.92,
    height: height * 0.25,
    borderRadius: 20,
    marginRight: width * 0.03,
    overflow: "hidden"
  },
  descriptionContainer: {
    marginLeft: width * 0.03,
    marginBottom: height * 0.009,
  },
  description: {
    fontSize: width * 0.03,
    color: 'black',
    
  },
  readMore: {
    fontSize: width * 0.03,
    color: 'blue',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: height * 0.01,
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
    top: 40,
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
});

export default PostCard;
