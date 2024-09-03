import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import PostCard from '../components/PostCard';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from "../Utils/Family/axios";
import PostCardSkeleton from '../components/PostCardSkeleton';

const { width, height } = Dimensions.get('window');

const SearchScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { familyId } = route.params;
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [familyData, setFamilyData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
// get the family post data for seach data 
    const fetchUserData = async () => {
        try {
            const postsResponse = await axios.get(`/family/${familyId}`);
            setUserPosts(postsResponse.data.posts);
            setFamilyData(postsResponse.data.family);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleToggleLike = async (postId) => {
        try {
            await axios.put(`/posts/${postId}/likes`);
            fetchUserData();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );
// post search function 
    const handleSearch = (text) => {
        setSearchQuery(text);
    };
// search filter function 
    const filteredPosts = userPosts.filter(post => 
        post?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post?.user?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon size={20} color="black" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>
                        Search
                    </Text>
                </View>
            </View>
            <View style={styles.content}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
                <View style={styles.resultsContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <View key={index} style={styles.skeletonContainer}>
                                    <PostCardSkeleton />
                                </View>
                            ))
                        ) : (
                            filteredPosts.map((post, index) => (
                                <PostCard key={post.id} post={post} onToggleLike={handleToggleLike} family_id={familyId} />
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        marginTop: height * 0.05,
        paddingHorizontal: width * 0.05,
    },
    backButton: {
        marginTop: height * 0.01,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    titleText: {
        color: 'black',
        fontSize: width * 0.05,
        fontWeight: '400',
        textAlign: 'center',
        letterSpacing: 1.2,
    },
    content: {
        padding: width * 0.03,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.02,
        paddingHorizontal: width * 0.05,
    },
    searchInput: {
        flex: 1,
        height: height * 0.05,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: width * 0.02,
    },
    resultsContainer: {
        marginTop: height * 0.02,
    },
    skeletonContainer: {
        marginBottom: height * 0.02,
    },
});

export default SearchScreen;
