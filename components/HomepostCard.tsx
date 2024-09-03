import React, { useCallback, useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import axios from "../Utils/Family/axios";
import { useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';

const HomepostCard = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const postsResponse = await axios.get('/posts'); // Assuming this endpoint returns the user's posts
      setUserPosts(postsResponse.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user postdata:', error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const renderSkeletonLoader = () => (
    Array(5).fill(0).map((_, index) => (
      <View key={index} style={styles.skeletonItem}>
        <View style={styles.skeletonBox} />
      </View>
    ))
  );

  const isVideo = (url) => {
    const videoExtensions = ['mp4', 'mov', 'wmv', 'flv', 'avi', 'mkv'];
    const extension = url.split('.').pop();
    return videoExtensions.includes(extension);
  };

  const isValidUrl = (url) => {
    return url && url.startsWith('http');
  };

  const hasValidMedia = (post) => {
    return post.attachment_urls && post.attachment_urls.some(isValidUrl);
  };

  const validMediaPosts = userPosts.filter(hasValidMedia);

  return (
    <View style={styles.container}>
      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
          {renderSkeletonLoader()}
        </ScrollView>
      ) : validMediaPosts.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
          {validMediaPosts.slice(0, 5).map((post, index) => (
            post.attachment_urls.filter(isValidUrl).map((url, idx) => (
              <TouchableOpacity style={styles.postItem} key={`${index}-${idx}`}>
                <View style={styles.mediaContainer}>
                  {isVideo(url) ? (
                    <Video
                      source={{ uri: url }}
                      style={styles.media}
                      resizeMode="cover"
                      muted
                    />
                  ) : (
                    <Image source={{ uri: url }} style={styles.media} />
                  )}
                </View>
              </TouchableOpacity>
            ))
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPostsText}>No posts available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    width: '100%',
    
  },
  scrollViewContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  skeletonItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  skeletonBox: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  postItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  mediaContainer: {
    position: 'relative',
  },
  media: {
    width: 100,
    height: 100,
    borderRadius: 19,
    overflow: 'hidden',
  },
  noPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
  },
  noPostsText: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomepostCard;
