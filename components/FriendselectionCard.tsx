import React, { useState } from 'react';
import { TouchableOpacity, View, Image, Text } from 'react-native';

const FriendselectionCard = () => {
  const [selected, setSelected] = useState(false);

  return (
    <TouchableOpacity 
      className="flex-row items-center justify-between p-1.5 bg-transparent border-b border-stone-300"
      onPress={() => setSelected(!selected)}
    >
      <View className="flex-row items-center">
        <Image source={require('../assets/user.jpg')} className="w-16 h-16 rounded-full mr-4" />
        <View className='flex flex-col'>
        <Text className="text-[15px] font-semibold">Friend name</Text>
        <Text className="text-[10px] font-medium  text-slate-400">dhdhdjhs</Text>

        </View>
       
      </View>
      <View className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
        {selected && <View className="w-3 h-3 bg-black rounded-full" />}
      </View>
    </TouchableOpacity>
  );
};

export default FriendselectionCard;
