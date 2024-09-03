import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { Bars3Icon, CalendarDaysIcon, StarIcon, QrCodeIcon, LinkIcon } from 'react-native-heroicons/solid';

const screenWidth = Dimensions.get('window').width;

const familyscreenSkeloton = () => {
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
        outputRange: ['#e0e0e0', '#f0f0f0'], // Lighter color change
    });

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-screenWidth, screenWidth], // Animation flow from left to right
    });
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <View style={[styles.skeletonBox, { width: screenWidth * 0.5, height: screenWidth * 0.05, marginLeft: 24 }]} />
                <View style={{ flexDirection: 'row' }}>
                    <Bars3Icon size={screenWidth * 0.08} color="#CBD5E1" style={{ marginRight: 15, marginTop: 2 }} />
                </View>
            </View>
            <View style={{ paddingHorizontal: 20, marginTop: "10%" }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <View style={[styles.skeletonBox, { width: screenWidth / 1.5, height: screenWidth / 1.8, borderRadius: 20 }]} />
                    <View style={{ justifyContent: 'space-between', marginLeft: screenWidth * 0.05 }}>
                        <View style={{ alignItems: 'center' }}>
                            <View style={[styles.skeletonBox, { width: screenWidth * 0.1, height: screenWidth * 0.055 }]} />
                            <View style={[styles.skeletonBox, { width: screenWidth * 0.2, height: screenWidth * 0.03, marginTop: 5 }]} />
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <View style={[styles.skeletonBox, { width: screenWidth * 0.1, height: screenWidth * 0.055 }]} />
                            <View style={[styles.skeletonBox, { width: screenWidth * 0.2, height: screenWidth * 0.03, marginTop: 5 }]} />
                        </View>
                        <View style={{ paddingVertical: 12 }}>
                            <View style={[styles.skeletonBox, { width: screenWidth * 0.2, height: screenWidth * 0.1, borderRadius: 7 }]} />
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 30 }}>
                    <View style={[styles.skeletonBox, { width: '100%', height: screenWidth * 0.05, marginBottom: 15 }]} />
                </View>

                <View style={{ borderBottomWidth: 0.5, borderColor: '#000000', width: '100%', marginTop: 20 }} />

                <View style={{ marginTop: 20 }}>
                    <View style={[styles.skeletonBox, { width: screenWidth * 0.2, height: screenWidth * 0.05, marginBottom: 20 }]} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                        {[...Array(3)].map((_, index) => (
                            <View key={index} style={[styles.skeletonBox, { width: screenWidth / 3.5, height: screenWidth / 3.5, borderRadius: 20 }]} />
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                        {[...Array(3)].map((_, index) => (
                            <View key={index} style={[styles.skeletonBox, { width: screenWidth / 3.5, height: screenWidth / 3.5, borderRadius: 20 }]} />
                        ))}
                    </View>
                </View>
            </View>
        </View>
  )
}
const styles = StyleSheet.create({
    skeletonBox: {
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
    },
});
export default familyscreenSkeloton
