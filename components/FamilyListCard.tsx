import React, { useCallback, useState } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, Dimensions } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/solid'; // Import the right arrow icon
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from "../Utils/Family/axios";

const { width, height } = Dimensions.get('window');

const FamilyListCard = () => {
    const navigation = useNavigation();
    const [familyData, setFamilyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        try {
            const familyResponse = await axios.get('/family');
            setFamilyData(familyResponse.data.data); // Update to access the correct portion of the response
            setLoading(false);
            console.log(familyResponse);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );

    const renderSkeletonLoader = () => (
        Array(5).fill(0).map((_, index) => (
            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8, paddingBottom: 16, backgroundColor: 'transparent', borderBottomWidth: 1, borderColor: '#ABB0BC' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                    <View style={{ width: width * 0.13, height: width * 0.13, borderRadius: 10, backgroundColor: '#e0e0e0', marginRight: 20 }} />
                    <View style={{ width: width * 0.3, height: 20, borderRadius: 4, backgroundColor: '#e0e0e0' }} />
                </View>
                <View style={{ width: 25, height: 25, borderRadius: 12.5, backgroundColor: '#e0e0e0' }} />
            </View>
        ))
    );

    return (
        <View style={{ paddingVertical: 4, backgroundColor: '#E6D8B6', height: height * 0.35, width: '100%', borderRadius: 19, shadowColor:'#000000', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5, marginBottom: 20 }}>
            <ScrollView style={{ paddingHorizontal: 4 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                {loading ? (
                    renderSkeletonLoader()
                ) : (
                    familyData.length > 0 ? familyData.map((family, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, paddingBottom: 10, borderBottomWidth: 0.6, borderColor: '#000000', }}
                            onPress={() => navigation.navigate('Familyfeed', { familyId: family.family_id })}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                                <Image source={{ uri: family.attachment_url }} style={{ width: width * 0.13, height: width * 0.13, borderRadius: 10, marginRight: 20 }} />
                                <Text style={{ fontSize: 15, fontWeight: '600', color: 'black' }}>{family.name}</Text>
                            </View>
                            <ChevronRightIcon size={25} color="black" />
                        </TouchableOpacity>
                    )) : (
                        <Text style={{ textAlign: 'center', marginTop: 20, color: '#ABB0BC' }}>No family data available.</Text>
                    )
                )}
            </ScrollView>
        </View>
    );
};

export default FamilyListCard;
