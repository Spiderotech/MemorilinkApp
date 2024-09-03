import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import axios from "../Utils/Family/axios";

const { width, height } = Dimensions.get('window');

const FamilystoryList = ({ familyId }) => {
    const navigation = useNavigation();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rotationValue] = useState(new Animated.Value(0));

    const fetchStories = async () => {
        try {
            const response = await axios.get(`/family/${familyId}/connections`);
            console.log(response.data, "family connections");
            setStories(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stories:', error);
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStories();
        }, [])
    );

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotationValue, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [rotationValue]);

    const handlePress = (story) => {
        if (story.event_id) {
            navigation.navigate('Event', { eventId: story.event_id });
        } else {
            navigation.navigate('CreateEvent');
        }
    };

    const rotation = rotationValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const renderSkeletonLoader = () => (
        Array(5).fill(0).map((_, index) => (
            <View key={index} style={styles.skeletonItem}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonText} />
            </View>
        ))
    );

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {loading ? (
                    renderSkeletonLoader()
                ) : (
                    stories.map(story => (
                        <TouchableOpacity
                            key={story.id}
                            style={styles.storyItem}
                            onPress={() => handlePress(story)}
                        >
                            <View style={styles.gradientContainer}>
                                {story.event_id && (
                                    <Animated.View style={[styles.animatedBorder, { transform: [{ rotate: rotation }] }]} />
                                )}
                                <LinearGradient
                                    colors={['#286EB5', '#10BAFF']}
                                    style={styles.gradient}
                                >
                                    <Image source={story.profile_image ? { uri: story.profile_image } : require('../assets/profile.png')} style={styles.image} />
                                </LinearGradient>
                            </View>
                            <Text style={styles.storyName}>{story.full_name}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: height * 0.01,
        width: '100%',
    },
    skeletonItem: {
        alignItems: 'center',
        marginHorizontal: width * 0.02,
    },
    skeletonImage: {
        width: width * 0.16,
        height: width * 0.16,
        borderRadius: width * 0.08,
        backgroundColor: '#e0e0e0',
    },
    skeletonText: {
        width: width * 0.15,
        height: height * 0.015,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        marginTop: height * 0.01,
    },
    storyItem: {
        alignItems: 'center',
        marginHorizontal: width * 0.02,
    },
    gradientContainer: {
        width: width * 0.18,
        height: width * 0.18,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    gradient: {
        width: width * 0.18,
        height: width * 0.18,
        borderRadius: (width * 0.18) / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: width * 0.16,
        height: width * 0.16,
        borderRadius: (width * 0.16) / 2,
    },
    storyName: {
        marginTop: height * 0.01,
        fontSize: width * 0.03,
        fontWeight: 'normal',
        color: 'black',
    },
    animatedBorder: {
        position: 'absolute',
        width: width * 0.2,
        height: width * 0.2,
        borderRadius: (width * 0.2) / 2,
        borderWidth: 2,
        borderColor: '#286EB5',
        borderStyle: 'dotted',
        borderDashArray: [4, 4],
    },
});

export default FamilystoryList;
