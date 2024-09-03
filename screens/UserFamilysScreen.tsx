import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, SafeAreaView, ScrollView, StyleSheet, Dimensions, Animated } from 'react-native';
import { ArrowLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from "../Utils/Family/axios";

const { width, height } = Dimensions.get('window');

const UserFamilysScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params;

    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredConnections, setFilteredConnections] = useState([]);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`/family/${userId}/userfamily`);
            setConnections(response.data.data);
            setFilteredConnections(response.data.data); // Initialize with all connections
            console.log(response.data);
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

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query) {
            const filteredData = connections.filter(connection => 
                connection.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredConnections(filteredData);
        } else {
            setFilteredConnections(connections);
        }
    };

    const renderSkeletonCard = () => (
        <View style={styles.skeletonContainer}>
            <View style={styles.skeletonProfilePic} />
            <View style={styles.skeletonTextContainer}>
                <View style={styles.skeletonTextLine} />
                <View style={styles.skeletonTextLine} />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon size={25} color="black" />
                </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <MagnifyingGlassIcon size={22} color="#828287" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="#828287"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <>
                        {renderSkeletonCard()}
                        {renderSkeletonCard()}
                        {renderSkeletonCard()}
                    </>
                ) : (
                    filteredConnections.map((connection) => (
                        <TouchableOpacity
                            key={connection?.family_id}
                            style={styles.connectionItem}
                            onPress={() => navigation.navigate('Familylist', { familyId: connection?.family_id })}
                        >
                            <View style={styles.connectionInfo}>
                                <Image source={{ uri: connection?.attachment_url }} style={styles.connectionImage} />
                                <View style={styles.connectionTextContainer}>
                                    <Text style={styles.connectionName}>{connection?.name}</Text>
                                    <Text style={styles.connectionCategory}>{connection?.category}</Text>
                                </View>
                            </View>
                            <ChevronRightIcon size={25} color="black" />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
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
        justifyContent: 'flex-start',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        marginRight: 10,
        justifyContent: 'center',
    },
    searchContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width * 0.9,
        height: 40,
        backgroundColor: '#EFEFF0',
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 17,
        color: '#828287',
        padding:1,
    },
    scrollView: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    connectionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        marginTop: 10,
    },
    connectionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    connectionImage: {
        width: width * 0.15,
        height: width * 0.15,
        borderRadius: (width * 0.2) / 2,
        marginRight: 10,
    },
    connectionTextContainer: {
        flexDirection: 'column',
    },
    connectionName: {
        fontSize: 15,
        fontWeight: '600',
    },
    connectionCategory: {
        fontSize: 10,
        fontWeight: '500',
        color: '#808080',
    },
    skeletonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        marginTop: 10,
    },
    skeletonProfilePic: {
        width: width * 0.15,
        height: width * 0.15,
        borderRadius: (width * 0.2) / 2,
        backgroundColor: '#E0E0E0',
        marginRight: 10,
    },
    skeletonTextContainer: {
        flex: 1,
    },
    skeletonTextLine: {
        width: '80%',
        height: 10,
        backgroundColor: '#E0E0E0',
        marginBottom: 5,
        borderRadius: 5,
    },
});

export default UserFamilysScreen;
