import React, { useCallback, useState } from 'react';
import { SafeAreaView, Text, View, FlatList, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import 'nativewind'; // Import NativeWind
import { MagnifyingGlassIcon, ChevronRightIcon, ArrowLeftIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import Favoritesfamilycard from '../components/Favoritesfamilycard';
import axios from "../Utils/Family/axios";
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const FavoritesfamilyScreen = () => {
    const navigation = useNavigation();
    const [familyData, setFamilyData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const route = useRoute();
    const { userId } = route.params;
// get the current user favorite family data 
    const fetchUserData = async () => {
        try {
            const familyResponse = await axios.get(`/family/${userId}/favorite`);
            setFamilyData(familyResponse.data);
            console.log(familyResponse.data);
            setLoading(false);
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
// render the family card 
    const renderItem = ({ item }) => (
        <Favoritesfamilycard family={item} />
    );
// render loading skeleton 
    const renderSkeletonLoader = () => (
        <View style={styles.skeletonContainer}>
            {Array(9).fill(0).map((_, index) => (
                <View key={index} style={styles.skeletonCard} />
            ))}
        </View>
    );
// fmaily search filter 
    const filteredFamilyData = familyData.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <LinearGradient
        colors={['#18426D', '#286EB5', '#64D2FF']}
        style={styles.container}
    >
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon size={25} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    Favorite Links
                </Text>
            </View>
        </SafeAreaView>
        <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
                <MagnifyingGlassIcon size={22} color="#828287" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#828287"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                
            </View>
        </View>
        {loading ? (
            renderSkeletonLoader()
        ) : filteredFamilyData.length === 0 ? (
            <View style={styles.noFamilyContainer}>
                <Text style={styles.noFamilyText}>No links added yet.</Text>
            </View>
        ) : (
            <FlatList
                data={filteredFamilyData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                contentContainerStyle={styles.flatListContent}
                style={styles.flatList}
            />
        )}
    </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        paddingHorizontal: width * 0.05,
       
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: height * 0.05,
       
    },
    backButton: {
        marginRight: width * 0.03,
        justifyContent: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: width * 0.05,
        fontWeight: '300',
        textAlign: 'center',
        marginLeft: width * 0.2,
    },
    searchContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.02,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width * 0.9,
        height: height * 0.05,
        backgroundColor: 'white',
        borderColor: '#D1D1D1',
        borderWidth: 1,
        borderRadius: width * 0.025,
        paddingHorizontal: width * 0.025,
    },
    searchInput: {
        flex: 1,
        marginLeft: width * 0.03,
        fontSize: width * 0.045,
        paddingVertical: height * 0.01,
        color: '#828287',
    },
    flatListContent: {
        paddingHorizontal: width * 0.025,
        paddingVertical: height * 0.02,
    },
    flatList: {
        flex: 1,
    },
    skeletonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.025,
        paddingVertical: height * 0.02,
    },
    skeletonCard: {
        width: (width - width * 0.09) / 3, 
        height: height * 0.13,
        borderRadius: width * 0.025,
        backgroundColor: '#e0e0e0',
        marginBottom: height * 0.02,
    },
    noFamilyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noFamilyText: {
        color: 'white',
        fontSize: width * 0.05,
        textAlign: 'center',
    },
    
});

export default FavoritesfamilyScreen;
