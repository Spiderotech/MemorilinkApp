import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import PostCardSkeleton from '../components/PostCardSkeleton';
import UserpostCard from '../components/UserpostCard';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from "../Utils/Family/axios";

const UserpostsScreen = () => {
    const route = useRoute();
    const { userId } = route.params; // Assuming you pass userId as a route param
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        try {
            const profileResponse = await axios.get(`/family/${userId}/userprofile`);
            const postsResponse = await axios.get(`/family/${userId}/userposts`);
            setUserData(profileResponse.data);
            setUserPosts(postsResponse.data.data);
            console.log(postsResponse.data.data);
            
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

    const refreshPosts = () => {
        setLoading(true);
        fetchUserData();
    };

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className="flex-row mt-5">
                <TouchableOpacity className="mt-1 ml-5" onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon size={20} color="black" />
                </TouchableOpacity>
                <Text className="text-black font-light text-[20px] tracking-widest ml-5">
                    Posts
                </Text>
            </View>
            <View className='p-3'>
                <View className="mt-5 mb-10">
                    <ScrollView className="px-1 pb-20" showsVerticalScrollIndicator={false}>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <View key={index} className="mb-5">
                                    <PostCardSkeleton />
                                </View>
                            ))
                        ) : (
                            userPosts.map((post, index) => (
                                <UserpostCard key={index} post={post} user={userData} refreshPosts={refreshPosts} />
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default UserpostsScreen;
