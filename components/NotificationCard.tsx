import React from 'react';
import { TouchableOpacity, View, Image, Text } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/solid';

const NotificationCard = () => {
  return (
    <View className="w-full ">
      <TouchableOpacity className="flex-row items-center justify-between p-2 bg-transparent">
        <View className="flex-row items-center">
          <Image source={require('../assets/user.jpg')} className="w-14 h-14 rounded-full mr-4" />
          <View className="flex-col">
            <Text className="text-[14px] font-semibold text-black">Message description</Text>
            <Text className="text-[12px] font-medium text-gray-400 mt-2">2 days ago</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View className="border-b border-[#ABB0BC] w-[80%] ml-20" />
    </View>
  );
};

export default NotificationCard;
