import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Image, ScrollView, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import Video from 'react-native-video';
import { ArrowLeftIcon, HomeModernIcon, MapPinIcon, AcademicCapIcon, IdentificationIcon } from 'react-native-heroicons/solid';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from "../Utils/Family/axios";
import LinearGradient from 'react-native-linear-gradient';


const { width, height } = Dimensions.get('window');

const UserprofileScreen = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);
    const [postCount, setPostCount] = useState(0);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [familyData, setFamilyData] = useState('');
    const [connections, setConnections] = useState(0);

    const fetchUserData = async () => {
        try {
            const profileResponse = await axios.get('/auth/profile');
            setUserData(profileResponse.data);

            const postsResponse = await axios.get('/posts');
            console.log(postsResponse);
            const postCount = postsResponse.data.metadata.total_records;
            setPostCount(postCount);
            setUserPosts(postsResponse.data.data);

            const familyResponse = await axios.get(`/family/${profileResponse.data.id}/userfamily`);
            const familycount = familyResponse.data.data.length;
            setFamilyData(familycount);

            const connectioncount = await axios.get(`/connections/${userData?.id}/addconnection`);
            const connectioncounts = connectioncount?.data?.count
            setConnections(connectioncounts);
            console.log(connectioncount?.data,"pookdd");
            

            setLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [postCount])
    );

    const renderSkeletonLoader = () => {
        const animatedValue = new Animated.Value(0);

        const animate = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        };

        animate();

        const backgroundColor = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['#e0e0e0', '#c0c0c0'],
        });

        return (
            <View style={{ paddingHorizontal: width * 0.05, width: '100%' }}>
                <View style={{ alignItems: 'center', marginTop: -height * 0.05 }}>
                    <Animated.View style={{ width: width * 0.24, height: width * 0.24, borderRadius: width * 0.12, backgroundColor, borderWidth: 4, borderColor: 'white' }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: height * 0.015, gap: width * 0.05 }}>
                        {[...Array(3)].map((_, index) => (
                            <View key={index} style={{ alignItems: 'center' }}>
                                <Animated.View style={{ width: width * 0.05, height: width * 0.05, borderRadius: 4, backgroundColor }} />
                                <Animated.View style={{ width: width * 0.1, height: height * 0.012, borderRadius: 4, backgroundColor, marginTop: height * 0.01 }} />
                            </View>
                        ))}
                    </View>
                    <Animated.View style={{ width: width * 0.3, height: height * 0.025, borderRadius: 4, backgroundColor, marginTop: height * 0.015 }} />
                    <View style={{ marginTop: height * 0.02, width: '100%' }}>
                        <Animated.View style={{ width: '100%', height: height * 0.1, borderRadius: 4, backgroundColor }} />
                    </View>
                    {[...Array(5)].map((_, index) => (
                        <View key={index} style={{ flexDirection: 'row', justifyContent: 'center', gap: width * 0.02, width: '100%', marginTop: height * 0.02 }}>
                            <Animated.View style={{ padding: width * 0.02, backgroundColor, justifyContent: 'center', alignItems: 'center', width: '50%', borderRadius: 7 }} />
                            <Animated.View style={{ padding: width * 0.02, backgroundColor, justifyContent: 'center', alignItems: 'center', width: '30%', borderRadius: 7 }} />
                        </View>
                    ))}
                    <View style={{ flexDirection: 'row', justifyContent: 'evenly', marginTop: height * 0.025 }}>
                        {[...Array(3)].map((_, index) => (
                            <View key={index} style={{ alignItems: 'center', marginHorizontal: width * 0.02 }}>
                                <Animated.View style={{ width: width * 0.27, height: width * 0.27, borderRadius: 16, backgroundColor }} />
                            </View>
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'evenly',marginTop: height * 0.025  }}>
                        {[...Array(3)].map((_, index) => (
                            <View key={index} style={{ alignItems: 'center', marginHorizontal: width * 0.02 }}>
                                <Animated.View style={{ width: width * 0.27, height: width * 0.27, borderRadius: 16, backgroundColor }} />
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    const categorizePosts = () => {
        const imagePosts = userPosts.filter(post =>
            post.attachment_urls.some(url => /\.(jpg|jpeg|png|gif)$/i.test(url))
        );
        const videoPosts = userPosts.filter(post =>
            post.attachment_urls.some(url => /\.(mp4|mov)$/i.test(url))
        );
        const blogPosts = userPosts.filter(post => post.attachment_urls.length === 0);
        return { imagePosts, videoPosts, blogPosts };
    };

    const { imagePosts, videoPosts, blogPosts } = categorizePosts();

    const renderMediaPosts = (posts) => {
        const firstPost = posts[0];
        const otherPosts = posts.slice(1, 5);

        return (
            <View style={styles.mediaContainer}>
                <View style={styles.firstMediaContainer}>
                    {firstPost.attachment_urls.length > 0 && (
                        firstPost.attachment_urls[0].endsWith('.mp4') || firstPost.attachment_urls[0].endsWith('.mov') ? (
                            <TouchableOpacity onPress={() => navigation.navigate('Userpost', { userId: userData?.id })}>
                                <Video
                                    source={{ uri: firstPost.attachment_urls[0] }}
                                    style={styles.firstPostMedia}
                                    resizeMode="cover"
                                    isLooping
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => navigation.navigate('Userpost', { userId: userData?.id })}>
                                <Image source={{ uri: firstPost.attachment_urls[0] }} style={styles.firstPostMedia} />
                            </TouchableOpacity>
                        )
                    )}
                </View>
                <View style={styles.otherMediaContainer}>
                    {otherPosts.map((post, index) => (
                        <View key={index} style={styles.otherMediaWrapper}>
                            {post.attachment_urls.length > 0 && (
                                post.attachment_urls[0].endsWith('.mp4') || post.attachment_urls[0].endsWith('.mov') ? (
                                    <TouchableOpacity onPress={() => navigation.navigate('Userpost', { userId: userData?.id })}>
                                        <Video
                                            source={{ uri: post.attachment_urls[0] }}
                                            style={styles.otherPostMedia}
                                            resizeMode="cover"
                                            isLooping
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => navigation.navigate('Userpost', { userId: userData?.id })}>
                                        <Image source={{ uri: post.attachment_urls[0] }} style={styles.otherPostMedia} />
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderBlogs = (blogs) => {
        return blogs?.slice(0, 5).map((post, index) => {
            const date = new Date(post.created_at);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' });

            // Determine the number of characters to show
            let descriptionLength;
            if (index === 0) {
                descriptionLength = 50; // Fixed length for the first blog post
            } else {
                descriptionLength = Math.floor(Math.random() * (post?.description.length + 1)); // Random length for others
            }

            const truncatedDescription = post?.description.slice(0, descriptionLength) + (descriptionLength < post?.description.length ? '...' : '');

            return (
                <TouchableOpacity onPress={() => navigation.navigate('Userpost', { userId: userData?.id })}>
                    <View key={index} style={styles.blogContainer}>
                        <Text style={styles.blogNumber}>#{index + 1} - {day} {month}</Text>
                        <Text style={styles.blogText}>{truncatedDescription}</Text>
                    </View>
                </TouchableOpacity>

            );
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <LinearGradient
                colors={['#18426D', '#286EB5', '#64D2FF']}
                style={{
                    height: height * 0.2,
                    width: '100%',
                    borderBottomLeftRadius: width * 0.09,
                    borderBottomRightRadius: width * 0.09,
                    top: 0,
                    left: 0,
                    right: 0,
                }}
            />
            {loading ? (
                renderSkeletonLoader()
            ) : (
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: -height * 0.06 }}>
                    <TouchableOpacity style={{ alignItems: 'center' }}>
                        <Image source={userData?.profile_image ? { uri: userData.profile_image } : require('../assets/profile.png')} style={styles.profileImage} />
                    </TouchableOpacity>
                    <Text style={styles.userName}>
                        {userData?.full_name}
                    </Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {postCount}
                            </Text>
                            <Text style={styles.statLabel}>
                                Posts
                            </Text>
                        </View>
                        <View style={styles.verticalDivider} />
                        <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Userconnectionlist', { userId: userData?.id })}>
                            <Text style={styles.statNumber}>
                                {connections}
                            </Text>
                            <Text style={styles.statLabel}>
                                Connections
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.verticalDivider} />
                        <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Userfamilylist', { userId: userData?.id })}>
                            <Text style={styles.statNumber}>
                                {familyData}
                            </Text>
                            <Text style={styles.statLabel}>
                                Links
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Pressable style={({ pressed }) => [
                            styles.createFamilyButton,
                            pressed && styles.hoveredButton
                        ]} onPress={() => navigation.navigate('CreateFamily')}>
                            <Text style={styles.buttonText}>Create link</Text>
                        </Pressable>
                        <Pressable style={({ pressed }) => [
                            styles.editProfileButton,
                            pressed && styles.hoveredButton
                        ]} onPress={() => navigation.navigate('EditProfile')}>
                            <Text style={styles.buttonText}>
                                {userData?.job_title ? 'Edit' : 'Add'}
                            </Text>
                        </Pressable>
                    </View>
                    {userData?.bio && (
                        <View style={styles.bioContainer}>
                            <Text style={styles.bioText}>
                                {userData?.bio}
                            </Text>
                        </View>
                    )}
                </View>
            )}
            {!loading && (
                <ScrollView style={{ paddingHorizontal: width * 0.025 }} showsVerticalScrollIndicator={false}>
                    {userData?.job_title && (
                        <View>
                            <Text style={styles.sectionTitle}>
                                About
                            </Text>
                            <View style={styles.aboutContainer}>
                                <View style={styles.aboutItem}>
                                    <IdentificationIcon size={30} color="black" />
                                    <View style={styles.aboutTextContainer}>
                                        <Text style={styles.aboutLabel}>
                                            Job Title
                                        </Text>
                                        <Text style={styles.aboutText}>
                                            {userData?.job_title}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.aboutItem}>
                                    <AcademicCapIcon size={30} color="black" />
                                    <View style={styles.aboutTextContainer}>
                                        <Text style={styles.aboutLabel}>
                                            School Name
                                        </Text>
                                        <Text style={styles.aboutText}>
                                            {userData?.school_name}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.aboutItem}>
                                    <HomeModernIcon size={30} color="black" />
                                    <View style={styles.aboutTextContainer}>
                                        <Text style={styles.aboutLabel}>
                                            Where are you from
                                        </Text>
                                        <Text style={styles.aboutText}>
                                            {userData?.place}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.aboutItem}>
                                    <MapPinIcon size={30} color="black" />
                                    <View style={styles.aboutTextContainer}>
                                        <Text style={styles.aboutLabel}>
                                            Current City
                                        </Text>
                                        <Text style={styles.aboutText}>
                                            {userData?.city}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.aboutItem}>
                                    <Image source={require('../assets/food.png')} style={styles.aboutIcon} />
                                    <View style={styles.aboutTextContainer}>
                                        <Text style={styles.aboutLabel}>
                                            Favorite Food
                                        </Text>
                                        <Text style={styles.aboutText}>
                                            {userData?.favorite_food}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                    <View style={styles.postsContainer}>
                        <Text style={styles.postsTitle}>Pictures</Text>
                        {imagePosts.length > 0 ? (
                            renderMediaPosts(imagePosts)
                        ) : (
                            <View style={styles.noPostsContainer}>
                                 <Text style={styles.noPostsText}>No pictures available.</Text>
                                
                            </View>
                           
                        )}

                        <Text style={styles.postsTitle}>Videos</Text>
                        {videoPosts.length > 0 ? (
                            renderMediaPosts(videoPosts)
                        ) : (
                            <View style={styles.noPostsContainer}>
                                 <Text style={styles.noPostsText}>No videos available.</Text>
                                
                            </View>
                           
                        )}

                        <Text style={styles.postsTitle}>Blogs</Text>
                        {blogPosts.length > 0 ? (
                            renderBlogs(blogPosts)
                        ) : (

                             <View style={styles.noPostsContainer}>
                                <Text style={styles.noPostsText}>No blogs available.</Text>
                                
                            </View>
                            
                           
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    profileImage: {
        width: width * 0.24,
        height: width * 0.24,
        borderRadius: width * 0.12,
        borderWidth: 4,
        borderColor: 'white',
    },
    userName: {
        color: 'black',
        fontWeight: '600',
        fontSize: width * 0.05,
        marginTop: height * 0.01,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.015,
    },
    statItem: {
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: width * 0.05,
    },
    statNumber: {
        color: 'black',
        fontWeight: '600',
        fontSize: width * 0.038,
        marginTop: height * 0.005,
    },
    statLabel: {
        color: '#848488',
        fontWeight: '300',
        fontSize: width * 0.025,
    },
    verticalDivider: {
        height: height * 0.03,
        borderWidth: 0.5,
        borderColor: 'black',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: width * 0.02,
        width: '100%',
        justifyContent: 'center',
        marginTop: height * 0.02,
    },
    createFamilyButton: {
        padding: width * 0.02,
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        borderRadius: 7,
    },
    editProfileButton: {
        padding: width * 0.02,
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
        width: '30%',
        borderRadius: 7,
    },
    buttonText: {
        color: 'white',
        fontSize: width * 0.045,
        fontWeight: '500',
    },
    bioContainer: {
        paddingHorizontal: width * 0.08,
        marginTop: height * 0.02,

    },
    bioText: {
        color: 'black',
        fontWeight: '400',
        fontSize: width * 0.025,
        lineHeight: height * 0.02,
        textAlign: 'justify',
        marginBottom: height * 0.02,
    },
    sectionTitle: {
        color: 'black',
        fontWeight: '600',
        fontSize: width * 0.038,
        textAlign: 'center',
        marginTop: height * 0.02,
    },
    aboutContainer: {
        flexDirection: 'column',
        paddingHorizontal: width * 0.05,
        marginTop: height * 0.01,
    },
    aboutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.01,
    },
    aboutTextContainer: {
        flexDirection: 'column',
        borderBottomWidth: 0.5,
        borderBottomColor: '#ABB0BC',
        marginLeft: width * 0.03,
        width: '85%',
    },
    aboutLabel: {
        color: '#848488',
        fontFamily: 'monospace',
        fontSize: width * 0.02,
    },
    aboutText: {
        color: 'black',
        fontWeight: '300',
        fontSize: width * 0.025,
        marginTop: height * 0.005,
        marginBottom: height * 0.01,
    },
    aboutIcon: {
        width: width * 0.08,
        height: width * 0.08,
    },
    postsContainer: {
        paddingHorizontal: width * 0.01,
        marginTop: height * 0.02,
    },
    postsTitle: {
        color: 'black',
        fontWeight: '600',
        fontSize: width * 0.04,
        marginLeft: width * 0.02,
    },
    mediaContainer: {
        flexDirection: 'row',
        marginTop: height * 0.02,
    },
    firstMediaContainer: {
        flex: 1,
        marginRight: width * 0.10,
        marginBottom: height * 0.01, // Adjusted margin to create a gap between first and other media
    },
    firstPostMedia: {
        width: width * 0.45,
        height: width * 0.45,
        borderRadius: 16,
        overflow: "hidden"
    },
    otherMediaContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    otherMediaWrapper: {
        width: '48%',
        marginBottom: height * 0.02,
    },
    otherPostMedia: {
        width: '100%',
        height: width * 0.20,
        borderRadius: 16,
        overflow: "hidden"
    },
    postsRow: {
        flexDirection: 'row',
        gap: width * 0.02,
        marginTop: height * 0.01,
    },
    blogContainer: {
        flexDirection: 'column',
        alignItems: 'start',
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        padding: width * 0.04,
        marginBottom: height * 0.01,
        marginTop: height * 0.01,
    },
    blogNumber: {
        fontWeight: 'normal',
        marginRight: width * 0.02,
        fontSize: width * 0.035,
    },
    blogText: {
        fontSize: width * 0.045,
        color: 'black',
    },
    postText: {
        color: 'black',
        fontSize: width * 0.04,
        marginTop: height * 0.01,
    },
    noPostsText: {
        color: 'black',
        textAlign: 'center',
        fontWeight: '300',
        fontSize: width * 0.035,
        marginTop: height * 0.01,
    },
    hoveredButton: {
        backgroundColor: '#18426D',
    },
    noPostsContainer: {
        height: height * 0.15,  // Adjust the height as needed
        justifyContent: 'center',
        alignItems: 'center',
    },
   
});

export default UserprofileScreen;
