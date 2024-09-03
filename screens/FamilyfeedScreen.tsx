import React, { useCallback, useState } from 'react';
import { Modal, Pressable, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { BellAlertIcon, Bars3Icon, Cog8ToothIcon, CalendarDaysIcon } from 'react-native-heroicons/outline';
import { MagnifyingGlassIcon, UsersIcon } from 'react-native-heroicons/solid';
import FamilystoryList from '../components/FamilystoryList';
import PostCard from '../components/PostCard';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from "../Utils/Family/axios";
import PostCardSkeleton from '../components/PostCardSkeleton';

const { width, height } = Dimensions.get('window');

const FamilyfeedScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const { familyId } = route.params;
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [familyData, setFamilyData] = useState(null);
    const [creatorData, setcreatorData] = useState(null);
    
    // get all family data contain family post data 
    const fetchUserData = async () => {
        try {
            const postsResponse = await axios.get(`/family/${familyId}`);
            setUserPosts(postsResponse.data.posts);
            setFamilyData(postsResponse.data.family);
            setcreatorData(postsResponse.data.family.user_id)
            console.log(postsResponse.data.posts);

            

            
           
            
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false); // Stop refreshing after data is fetched
        }
    };

   

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [familyId])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserData();
    }, []);
// navigation for top dropdown 
    const handleNavigation = (screen) => {
        setModalVisible(false);
        navigation.navigate(screen);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                 {/* family navigation */}
                <TouchableOpacity onPress={() => navigation.navigate('Familylist', { familyId: familyId })}>
                    <Text style={styles.familyName}>
                        {familyData?.name}
                    </Text>
                </TouchableOpacity>
                 {/* notification navigation */}
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notification')}>
                        <BellAlertIcon size={width * 0.06} color="black" />
                    </TouchableOpacity>
                     {/* dropdown button  */}
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Bars3Icon size={width * 0.08} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.content}>
                 {/* family connection with event list of the users   */}
                <FamilystoryList familyId={familyId} />
                <View style={styles.scrollViewContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                       {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <View key={index} style={styles.skeletonContainer}> 
                                    <PostCardSkeleton /> 
                                </View>
                            ))
                        ) : userPosts.length === 0 ? (
                            <View style={styles.noPostsContainer}>
                                <Text style={styles.noPostsText}>
                                    No posts available yet. Start sharing your memories now!
                                </Text>
                            </View>
                        ) : (
                            userPosts.map((post, index) => (
                                <PostCard key={post.id} post={post} family_id={familyId}  admin={creatorData} /> // post card for render all family post from the postcard component 
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
             {/* Top navigation modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalBackground}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Settings')}>
                            <Cog8ToothIcon size={width * 0.04} color="black" />
                            <Text style={styles.menuText}>Settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('CreateEvent')}>
                            <CalendarDaysIcon size={width * 0.04} color="black" />
                            <Text style={styles.menuText}>Create a Moment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('CreateFamily')}>
                            <UsersIcon size={width * 0.04} color="black" />
                            <Text style={styles.menuText}>Create a Link</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem1} onPress={() => navigation.navigate('Search', { familyId: familyId })}>
                            <MagnifyingGlassIcon size={width * 0.04} color="black" />
                            <Text style={styles.menuText}>Search</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: height * 0.03,
        paddingHorizontal: width * 0.05,
    },
    familyName: {
        fontSize: width * 0.055,
        color: 'black',
        fontWeight: '300',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginRight: width * 0.03,
        marginTop: height * 0.005,
    },
    content: {
        flex: 1,
        padding: width * 0.03,
    },
    scrollViewContainer: {
        marginTop: height * 0.02,
        paddingBottom: height * 0.25,
    },
    skeletonContainer: {
        marginBottom: height * 0.02,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: width * 0.4,
        backgroundColor: '#EFEFF0',
        padding: width * 0.02,
        borderRadius: width * 0.02,
        marginTop: height * 0.07,
        marginRight: width * 0.02,
    },
    menuItem: {
        paddingVertical: height * 0.01,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItem1: {
        paddingVertical: height * 0.01,
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuText: {
        fontSize: width * 0.03,
        color: 'black',
        marginLeft: width * 0.02,
    },
    noPostsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.2,
    },
    noPostsText: {
        fontSize: width * 0.045,
        color: 'gray',
        textAlign: 'center',
        paddingHorizontal: width * 0.1,
    },
});

export default FamilyfeedScreen;
