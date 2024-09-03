import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const FamilyCardSkeleton = () => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        };

        animate();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.skeletonBox, styles.imageSkeleton, { opacity }]} />
            <Animated.View style={[styles.skeletonBox, styles.nameSkeleton, { opacity }]} />
            <View style={styles.nestedCirclesContainer}>
                <Animated.View style={[styles.skeletonBox, styles.circleSkeleton, { opacity }]} />
                <Animated.View style={[styles.skeletonBox, styles.circleSkeleton, { opacity }]} />
                <Animated.View style={[styles.skeletonBox, styles.circleSkeleton, { opacity }]} />
            </View>
            <Animated.View style={[styles.skeletonBox, styles.deleteButtonSkeleton, { opacity }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '30%',
        height: 100,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        marginBottom: 10,
        padding: 10,
        overflow: 'hidden', // Ensures all animations stay within the container
    },
    skeletonBox: {
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
    },
    imageSkeleton: {
        width: '100%',
        height: 50,
        borderRadius: 30,
    },
    nameSkeleton: {
        width: '70%',
        height: 15,
        borderRadius: 5,
        marginTop: 10,
    },
    nestedCirclesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    circleSkeleton: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
    },
    deleteButtonSkeleton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
    },
});

export default FamilyCardSkeleton;
