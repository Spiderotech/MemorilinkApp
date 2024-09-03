import React, { useState } from 'react';
import { TouchableOpacity, View, Image, Text } from 'react-native';

const FriendinvitationCard = () => {
    const [selected, setSelected] = useState(false);
    return (
        <TouchableOpacity
            className="flex-row items-center justify-between p-2 bg-transparent border-b border-stone-300"
            onPress={() => setSelected(!selected)}
        >
            <View className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
                {selected && <View className="w-3 h-3 bg-black rounded-full" />}
            </View>
            <View className="flex-row items-center">
                <Image source={require('../assets/user.jpg')} className="w-14 h-14 rounded-full mr-4" />
                <View className='flex flex-col'>
                    <Text className="text-[15px] font-semibold">Friend name</Text>
                    <Text className="text-[10px] font-medium  text-slate-400">dhdhdjhs</Text>

                </View>

            </View>
            <View className='flex justify-center items-center'>
                    <TouchableOpacity className=" p-1.5 bg-blue-500 flex justify-center items-center   w-20 rounded-[7px] mt-4 " >
                        <Text className="text-white text-[17px] font-medium">Invite</Text>
                    </TouchableOpacity>

                </View>

        </TouchableOpacity>
    )
}

export default FriendinvitationCard
