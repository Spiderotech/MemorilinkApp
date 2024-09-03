import React, { useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, Image, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { ArrowLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import axios from "../Utils/Family/axios";

const UserEventlistScreen = () => {
    const navigation = useNavigation()
    const route = useRoute();
    const { userId } = route.params;

    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState([]);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`/events`);
            setConnections(response.data.data);
            console.log(response.data);

        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );
  return (
    <SafeAreaView className="flex-1 bg-white">
    <View className="flex-row justify-start mt-5 px-5">
        <TouchableOpacity className="mr-3  flex  justify-center" onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={25} color="black" />
        </TouchableOpacity>


    </View>
    <View className='flex justify-center items-center mt-10'>
        <View className="flex-row items-center  w-[90%] h-10  bg-[#EFEFF0] rounded-lg px-2.5">
            <MagnifyingGlassIcon size={22} color="#828287" />
            <TextInput
                className="flex-1 ml-3 text-[17px] text-[#828287]  "
                placeholder="Search"
                placeholderTextColor="#828287"
            />
            <ChevronRightIcon size={22} color="#828287" />
        </View>

    </View>

    <ScrollView className="px-5 " showsVerticalScrollIndicator={false}>
    {connections.map((connection) => (
            <TouchableOpacity
                key={connection?.id}
                className="flex-row items-center justify-between p-1.5 bg-transparent border-b border-stone-300 mt-1"
                onPress={() => navigation.navigate('Event', { eventId: connection?.id })}
            >
                <View className="flex-row items-center">
                    <Image source={{uri:connection?.attachment_url}} className="w-16 h-16 rounded-full mr-4" />
                    <View className='flex flex-col'>
                        <Text className="text-[15px] font-semibold">{connection?.name}</Text>
                        <Text className="text-[10px] font-medium text-slate-400">{connection?.location}</Text>
                    </View>
                </View>
                <ChevronRightIcon size={25} color="black" />
            </TouchableOpacity>
        ))}

    </ScrollView>
</SafeAreaView>
  )
}

export default UserEventlistScreen
