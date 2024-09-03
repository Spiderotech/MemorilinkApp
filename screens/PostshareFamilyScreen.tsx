import React, { useCallback, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, SafeAreaView, ScrollView, Dimensions, Alert, BackHandler } from 'react-native';
import { ArrowLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from "../Utils/Family/axios";
import { AuthContext } from '../AuthContext'; // Adjust the import path as needed
import { Button } from 'react-native-elements';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');
// user post creation share option to the famly 
const PostshareFamilyScreen = ({ route }) => {
    const navigation = useNavigation();
    const { currentUser } = useContext(AuthContext);
    const userId = currentUser?.user_id;
    const { postId } = route.params; // Assuming postId is passed as a route parameter

    console.log(userId);

    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState([]);
    const [selectedFamilyIds, setSelectedFamilyIds] = useState([]); // State to track selected family IDs

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`/family/${userId}/userfamily`); // get currrent user connected family data 
            setConnections(response.data.data);
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

            const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress); // back navigation handler for show post  removal option 
            return () => backHandler.remove();
        }, [])
    );
// add share option function 
    const handleSend = async () => {
        console.log(selectedFamilyIds);
        
        if (selectedFamilyIds.length > 0) {
            try {
                const response = await axios.post(`/posts/${postId}/shares`, { // api for adding family share option 
                 selectedFamilyIds,
                });
                console.log('Share response:', response.data);
                navigation.navigate('Main'); // navigatioj to main screen 
            } catch (error) {
                console.error('Error sharing post:', error);
            }
        } else {
            console.log('No families selected');
        }
    };

    const toggleFamilySelection = (familyId) => {
        if (selectedFamilyIds.includes(familyId)) {
            setSelectedFamilyIds(selectedFamilyIds.filter(id => id !== familyId));
        } else {
            setSelectedFamilyIds([...selectedFamilyIds, familyId]);
        }
    };
//  post removal confirmation 
    const handleBackPress = () => {
        Alert.alert(
            'Discard Post',
            'Are you sure you want to discard the post?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Discard',
                    onPress: handleDiscard,
                    style: 'destructive',
                },
            ],
            { cancelable: false }
        );
        return true;
    };
// post delete function 
    const handleDiscard = async () => {
        try {
            const response = await axios.delete(`/posts/${postId}/deletepost`);
            Toast.show({
                type: 'error',
                text1: 'Discard',
                text2: 'Post removed sucessfully.',
                visibilityTime: 3000,
            });
            navigation.navigate('Main');
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: width * 0.05, marginTop: height * 0.01 }}>
                <TouchableOpacity style={{ justifyContent: 'center' }} onPress={handleBackPress}>
                    <ArrowLeftIcon size={width * 0.06} color="black" />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ padding: width * 0.02, backgroundColor: '#1E90FF', justifyContent: 'center', alignItems: 'center', width: width * 0.3, borderRadius: width * 0.02 }}
                        onPress={handleSend}
                    >
                        <Text style={{ color: 'white', fontSize: width * 0.045, fontWeight: '500' }}>Send</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width: width * 0.06 }} />
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: height * 0.05 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: width * 0.9, height: height * 0.05, backgroundColor: '#EFEFF0', borderRadius: width * 0.025, paddingHorizontal: width * 0.025 }}>
                    <MagnifyingGlassIcon size={width * 0.055} color="#828287" />
                    <TextInput
                        style={{ flex: 1, marginLeft: width * 0.03, fontSize: width * 0.043, color: '#828287' }}
                        placeholder="Search"
                        placeholderTextColor="#828287"
                    />
                    <ChevronRightIcon size={width * 0.055} color="#828287" />
                </View>
            </View>
            <ScrollView style={{ paddingHorizontal: width * 0.05 }} showsVerticalScrollIndicator={false}>
                {connections.map((connection) => (
                    <TouchableOpacity
                        key={connection?.family_id}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: width * 0.015,
                            backgroundColor: 'transparent',
                            borderBottomWidth: 1,
                            borderBottomColor: '#D3D3D3',
                            marginTop: height * 0.01
                        }}
                        onPress={() => toggleFamilySelection(connection?.family_id)} // Toggle selected family ID
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={{ uri: connection?.attachment_url }} style={{ width: width * 0.16, height: width * 0.16, borderRadius: width * 0.08, marginRight: width * 0.04 }} />
                            <View style={{ flexDirection: 'column' }}>
                                <Text style={{ fontSize: width * 0.037, fontWeight: '600', color: "black" }}>{connection?.name}</Text>
                                <Text style={{ fontSize: width * 0.025, fontWeight: '500', color: '#708090' }}>{connection?.category}</Text>
                            </View>
                        </View>
                        <View
                            style={{
                                borderRadius: width * 0.075,
                                width: width * 0.075,
                                height: width * 0.075,
                                borderColor: selectedFamilyIds.includes(connection?.family_id) ? '#34C759' : 'gray',
                                borderWidth: 4,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {selectedFamilyIds.includes(connection?.family_id) && (
                                <View
                                    style={{
                                        width: width * 0.037,
                                        height: width * 0.037,
                                        borderRadius: width * 0.0185,
                                        backgroundColor: '#34C759',
                                    }}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PostshareFamilyScreen;
