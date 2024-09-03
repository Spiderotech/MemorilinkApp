import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import axios from "../Utils/Family/axios";
import StorySkeleton from '../components/StorySkeleton'; // Import Skeleton Component

const { width, height } = Dimensions.get('window');

const StoryList = ({ onRefreshComplete }) => {
  const [stories, setStories] = useState([]);
  const navigation = useNavigation();
  const [rotationValue] = useState(new Animated.Value(0));

  const fetchStories =async () => {
    try {
      const response = await axios.get('/connections');
      console.log(response, "user connection");

      const formattedStories = response.data.map((story, index) => ({
        id: index + 1,
        user_id: story.connected_user_id,
        name: story.connected_user_full_name,
        image: { uri: story.connected_user_profile_image },
        event_id: story.event_id
      }));
      setStories(formattedStories); 
      if (onRefreshComplete) {
        onRefreshComplete();
      }
    } catch (error) {
      console.error('Error fetching stories:', error); 
      if (onRefreshComplete) {
        onRefreshComplete();
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStories();
    }, [])
  );

  useEffect(() => {
    Animated.loop( 
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotationValue]);

  const handlePress = (story) => {
    if (story.event_id) {
      navigation.navigate('Event', { eventId: story.event_id });
    } else {
      navigation.navigate('CreateEvent');
    }
  };

  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], 
  });

  const animatedBorderStyle = {
    transform: [{ rotate: rotation }], 
    borderColor: '#286EB5',
    borderWidth: 2,
    borderRadius: (width * 0.2) / 2,
    borderStyle: 'dotted',
    borderDashArray: [2, 6],
    position: 'absolute',
    width: width * 0.2,
    height: width * 0.2,
    top: -width * 0.01,
    left: -width * 0.01,
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {stories.length === 0
          ? Array(6).fill(0).map((_, index) => <StorySkeleton key={index} />)
          : stories.map(story => (
            <TouchableOpacity
              key={story.id}
              style={styles.storyItem}
              onPress={() => handlePress(story)}
            >
              <View style={styles.gradientContainer}>
                {story.event_id && <Animated.View style={animatedBorderStyle} />}
                <LinearGradient
                  colors={['#286EB5', '#10BAFF']}
                  style={styles.gradient}
                >
                  <Image source={story.image.uri ? { uri: story.image.uri } : require('../assets/profile.png')} style={styles.image} />
                </LinearGradient>
              </View>
              <Text style={styles.storyName}>{story.name}</Text>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.01,
    width: '100%',
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: width * 0.02,
  },
  gradientContainer: {
    width: width * 0.18,
    height: width * 0.18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradient: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: (width * 0.18) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: (width * 0.16) / 2,
  },
  storyName: {
    marginTop: height * 0.01,
    fontSize: width * 0.03,
    fontWeight: 'normal',
    color: 'black',
  },
});

export default StoryList;
