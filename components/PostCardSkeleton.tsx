import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { HeartIcon as HeartOutline, ChatBubbleOvalLeftEllipsisIcon as ChatOutline, ShareIcon as ShareOutline } from 'react-native-heroicons/outline';

const { width } = Dimensions.get('window');

const PostCardSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animate();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#f0f0f0'], // Lighter color change
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width], // Animation flow from left to right
  });

  return (
    <View className="bg-transparent rounded-lg shadow-lg mb-5">
      {/* User Info */}
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full mr-3 overflow-hidden">
          <Animated.View style={{ width: '100%', height: '100%', backgroundColor, transform: [{ translateX }] }} />
        </View>
        <View>
          <View className="h-4 bg-gray-300 rounded w-32 mb-1 overflow-hidden">
            <Animated.View style={{ width: '100%', height: '100%', backgroundColor, transform: [{ translateX }] }} />
          </View>
          <View className="h-3 bg-gray-300 rounded w-20 overflow-hidden">
            <Animated.View style={{ width: '100%', height: '100%', backgroundColor, transform: [{ translateX }] }} />
          </View>
        </View>
      </View>

      {/* Post Content */}
      <View className="mb-2 overflow-hidden">
        <View className="w-full h-52 bg-gray-300 rounded-[15px] overflow-hidden">
          <Animated.View style={{ width: '100%', height: '100%', backgroundColor, transform: [{ translateX }] }} />
        </View>
      </View>

      {/* Post Actions */}
      <View className="flex-row justify-around mt-2">
        <View className="flex-row items-center space-x-1">
          <HeartOutline size={24} color="#CBD5E1" />
        </View>
        <View className="flex-row items-center space-x-1">
          <ChatOutline size={24} color="#CBD5E1" />
        </View>
        <View className="flex-row items-center space-x-1">
          <ShareOutline size={24} color="#CBD5E1" />
        </View>
      </View>
    </View>
  );
};

export default PostCardSkeleton;
