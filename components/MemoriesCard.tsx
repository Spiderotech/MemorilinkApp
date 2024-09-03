import React, { useCallback, useState } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from "../Utils/Family/axios";
import { useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';

const MemoriesCard = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMemoriesData = async () => {
    try {
      const response = await axios.get('/posts'); // Assuming this endpoint returns the user's memories
      setMemories(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching memories data:', error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMemoriesData();
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

  const validMediaMemories = memories.filter(hasValidMedia);

  return (
    <View style={styles.container}>
      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
          {renderSkeletonLoader()}
        </ScrollView>
      ) : validMediaMemories.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
          {validMediaMemories.slice(0, 5).map((memory, index) => (
            memory.attachment_urls.filter(isValidUrl).map((url, idx) => (
              <TouchableOpacity style={styles.memoryItem} key={`${index}-${idx}`}>
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
        <View style={styles.noMemoriesContainer}>
          <Text style={styles.noMemoriesText}>No memories available</Text>
        </View>
      )}
    </View>
  );
};

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
    width: 168,
    height: 131,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
  },
  memoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  mediaContainer: {
    position: 'relative',
  },
  media: {
    width: 168,
    height: 131,
    borderRadius: 15,
    overflow: 'hidden',
  },
  noMemoriesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 131,
  },
  noMemoriesText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MemoriesCard;
