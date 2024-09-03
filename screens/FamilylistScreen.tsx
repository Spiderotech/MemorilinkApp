import React, { useCallback, useState } from 'react';
import { SafeAreaView, Text, View, FlatList, TextInput, StyleSheet, Modal, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import 'nativewind'; // Import NativeWind
import LinearGradient from 'react-native-linear-gradient';
import FamilyCard from '../components/FamilyCard';
import { MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import axios from "../Utils/Family/axios";
import { useFocusEffect } from '@react-navigation/native';
import FamilyCardSkeleton from '../components/FamilyCardSkeleton';
import sb from '../sendbird';

const { width, height } = Dimensions.get('window');
const screenWidth = Dimensions.get('window').width;

const FamilylistScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [familyData, setFamilyData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [familyToDelete, setFamilyToDelete] = useState(null);
    const [deleteStatusMessage, setDeleteStatusMessage] = useState('');
// list all current user created or connected famly data 
    const fetchUserData = async () => {
        try {
            const familyResponse = await axios.get('/family');
            setFamilyData(familyResponse.data.data);
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

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserData().then(() => setRefreshing(false));
    }, []);

    // fmaily delete function

    const handleDeletePress = (family) => {
        setFamilyToDelete(family);
        setModalVisible(true);
    };


    // delete confirmation 

    const handleConfirmDelete = async () => {
        if (familyToDelete) {
            try {
                const response = await axios.delete(`/family/${familyToDelete.family_id}`); // delete  api  to backend 
                if (response.data.success) {
                    const channelUrl = response.data.channel_url;
                    console.log(channelUrl);

                    // Delete the channel from Sendbird
                    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
                        if (error) {
                            console.error('Error fetching channel:', error);
                            setDeleteStatusMessage('Family deleted but unable to delete the channel.');
                        } else {
                            channel.delete((response, error) => {
                                if (error) {
                                    console.error('Error deleting channel:', error);
                                    setDeleteStatusMessage('Family deleted but unable to delete the channel.');
                                } else {
                                    setDeleteStatusMessage('Successfully deleted the family and channel.');
                                }
                            });
                        }
                    });

                    await fetchUserData();
                } else {
                    setDeleteStatusMessage('Unable to delete the family. You are not the creator.');
                }
            } catch (error) {
                console.error('Error deleting family:', error);
                setDeleteStatusMessage('Unable to delete the family. You are not the creator.');
            } finally {
                setTimeout(() => {
                    setDeleteStatusMessage('');
                    setModalVisible(false);
                    setFamilyToDelete(null);
                }, 3000);
            }
        }
    };

    const handleCancelDelete = () => {
        setModalVisible(false);
        setFamilyToDelete(null); // Clear the family to delete
    };
 
    const renderItem = ({ item }) => (
        <FamilyCard family={item} onDeletePress={() => handleDeletePress(item)} /> // render family list card from components 
    );
 // skeleton loader in the time of loading 
    const renderSkeletonLoader = () => (
        <View style={styles.skeletonContainer}>
            {Array(9).fill(0).map((_, index) => (
                <FamilyCardSkeleton key={index}/>
            ))}
        </View>
    );
// empty family list view 
    const renderEmptyListMessage = () => (
        <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No links available. Start by creating one!</Text>
        </View>
    );
  // search filter of family data
    const filteredFamilyData = familyData.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <LinearGradient
            colors={['#18426D', '#286EB5', '#64D2FF']}
            style={styles.linearGradient}
        >
            <SafeAreaView style={styles.safeAreaView}>
                <Text style={styles.headerText}>
                    List Of Links
                </Text>
            </SafeAreaView>
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <MagnifyingGlassIcon size={screenWidth * 0.065} color="#828287" />
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
            ) : filteredFamilyData.length > 0 ? (
                <FlatList
                    data={filteredFamilyData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.flatListContent}
                    style={styles.flatList}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            ) : (
                renderEmptyListMessage()
            )}
             {/* delte family confirmation modal  */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancelDelete}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {deleteStatusMessage ? (
                            <Text style={styles.modalText}>{deleteStatusMessage}</Text>
                        ) : (
                            <>
                                <Text style={styles.modalText}>Are you sure you want to permanently delete this link?</Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.modalButtonYes} onPress={handleConfirmDelete}>
                                        <Text style={styles.modalButtonText}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalButtonNo} onPress={handleCancelDelete}>
                                        <Text style={styles.modalButtonText}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    linearGradient: {
        flex: 1,
    },
    safeAreaView: {
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    headerText: {
        color: 'white',
        fontSize: width * 0.05,
        fontWeight: '300',
        letterSpacing: 1.5,
    },
    searchContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 5,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        height: 45,
        borderWidth: 1,
        borderColor: '#828287',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: 'white',
       
    },
    searchInput: {
        flex: 1,
        fontSize: width * 0.045,
        fontWeight: "500",
        color: '#828287',
       
       
       
        
    },
    flatListContent: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    flatList: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: width * 0.8,
        height: height * 0.14,
        backgroundColor: '#E6D8B6',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    modalText: {
        fontSize: screenWidth * 0.04,
        fontWeight: '400',
        textAlign: 'center',
        color: "black"
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 15,
        justifyContent: "space-evenly",
        alignItems: 'center',
    },
    modalButtonYes: {
        padding: 5,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        borderRadius: 7,
        width: width * 0.1,
        justifyContent: 'space-between',
    },
    modalButtonNo: {
        padding: 5,
        backgroundColor: '#847145',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 7,
        width: width * 0.1,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '500',
    },
    skeletonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyListText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default FamilylistScreen;
