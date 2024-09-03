import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const StorySkeleton = () => {
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

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#e0e0e0', '#f0f0f0'],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.skeletonBox, styles.imageSkeleton, { backgroundColor }]} />
            <Animated.View style={[styles.skeletonBox, styles.nameSkeleton, { backgroundColor }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginHorizontal: width * 0.02,
    },
    skeletonBox: {
        overflow: 'hidden',
    },
    imageSkeleton: {
        width: width * 0.18,
        height: width * 0.18,
        borderRadius: (width * 0.18) / 2,
        marginBottom: 8,
    },
    nameSkeleton: {
        width: width * 0.16,
        height: 12,
        borderRadius: 6,
    },
});

export default StorySkeleton;
