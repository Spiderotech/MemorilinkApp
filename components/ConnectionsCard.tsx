import React from 'react'
import { TouchableOpacity, View, Image, Text } from 'react-native'
import { ChevronRightIcon } from 'react-native-heroicons/solid';

const ConnectionsCard = () => {
  return (
    <TouchableOpacity 
    className="flex-row items-center justify-between p-1.5 bg-transparent border-b border-stone-300"
    
  >
    <View className="flex-row items-center">
      <Image source={require('../assets/user.jpg')} className="w-16 h-16 rounded-full mr-4" />
      <View className='flex flex-col'>
      <Text className="text-[15px] font-semibold">Friend name</Text>
      <Text className="text-[10px] font-medium  text-slate-400">dhdhdjhs</Text>

      </View>
     
    </View>
    <ChevronRightIcon size={25} color="black"   />
  </TouchableOpacity>
  )
}

export default ConnectionsCard
