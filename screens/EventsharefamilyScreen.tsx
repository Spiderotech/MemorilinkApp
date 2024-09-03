import React, { useCallback, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, SafeAreaView, ScrollView, Alert, BackHandler } from 'react-native';
import { ArrowLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from "../Utils/Family/axios";
import { AuthContext } from '../AuthContext'; // Adjust the import path as needed
import Toast from 'react-native-toast-message';

const EventsharefamilyScreen = () => {
    const navigation = useNavigation();
    const { currentUser } = useContext(AuthContext);
    const route = useRoute();
    const { eventId } = route.params; // Assuming eventId is passed as a route parameter
    const userId = currentUser?.user_id;
    console.log(userId);
    console.log(eventId);
    

    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState([]);
    const [selectedFamilyIds, setSelectedFamilyIds] = useState([]); // State to track selected family IDs

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`/family/${userId}/userfamily`);
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

            const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
            return () => backHandler.remove();
        }, [])
    );
 // function for upadte the famly id for event sharing 
    const handleSend = async () => {
        if (selectedFamilyIds.length > 0) {
            try {
                const response = await axios.post(`/events/${eventId}/addfamilyshare`, {
                    selectedFamilyIds: selectedFamilyIds,
                });
                Toast.show({
                    type: 'success',
                    text1: 'Event',
                    text2: 'Event sharing sucessfully.',
                    visibilityTime: 3000,
                });
                navigation.navigate('Main');
            } catch (error) {
                
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2:  'Error sharing event',
                    visibilityTime: 3000,
                });
                
            }
        } else {
            console.log('No families selected');
        }
    };

    // family card selection function get each selected family ids 

    const toggleFamilySelection = (familyId) => {
        if (selectedFamilyIds.includes(familyId)) {
            setSelectedFamilyIds(selectedFamilyIds.filter(id => id !== familyId));
        } else {
            setSelectedFamilyIds([...selectedFamilyIds, familyId]);
        }
    };

    //event discarding function with out selecting family for sharing 

    const handleBackPress = () => {
        Alert.alert(
            'Discard Event',
            'Are you sure you want to discard the event?',
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

    // delete event function

    const handleDiscard = async () => {
        try {
            const response = await axios.delete(`/events/${eventId}/deleteevent`);
            console.log('Delete response:', response.data);
            navigation.navigate('Main');
        } catch (error) {
           
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2:  'Error deleting event:',
                visibilityTime: 3000,
            });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-start px-5">
                <TouchableOpacity className="mr-3 mt-1 flex justify-center" onPress={handleBackPress}>
                    <ArrowLeftIcon size={25} color="black" />
                </TouchableOpacity>
                <View className="flex justify-center items-center w-[80%]">
                    <TouchableOpacity
                        className="p-2 bg-blue-500 flex justify-center items-center w-20 rounded-[7px] mt-4"
                        onPress={handleSend}
                    >
                        <Text className="text-white text-[17px] font-medium">Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="flex justify-center items-center mt-10">
                <View className="flex-row items-center w-[90%] h-10 bg-[#EFEFF0] rounded-lg px-2.5">
                    <MagnifyingGlassIcon size={22} color="#828287" />
                    <TextInput
                        className="flex-1 ml-3 text-[17px] text-[#828287]"
                        placeholder="Search"
                        placeholderTextColor="#828287"
                    />
                    <ChevronRightIcon size={22} color="#828287" />
                </View>
            </View>
            <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                {connections.map((connection) => (
                    <TouchableOpacity
                        key={connection?.family_id}
                        className={`flex-row items-center justify-between p-1.5 bg-transparent border-b border-stone-300 mt-1`}
                        onPress={() => toggleFamilySelection(connection?.family_id)} // Toggle selected family ID
                    >
                        <View className="flex-row items-center">
                            <Image source={{ uri: connection?.attachment_url }} className="w-16 h-16 rounded-full mr-4" />
                            <View className="flex flex-col">
                                <Text className="text-[15px] font-semibold">{connection?.name}</Text>
                                <Text className="text-[10px] font-medium text-slate-400">{connection?.category}</Text>
                            </View>
                        </View>
                        <View
                            style={{
                                borderRadius: 15,
                                width: 30,
                                height: 30,
                                borderColor: selectedFamilyIds.includes(connection?.family_id) ? 'green' : 'gray',
                                borderWidth: 4,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {selectedFamilyIds.includes(connection?.family_id) && (
                                <View
                                    style={{
                                        width: 15,
                                        height: 15,
                                        borderRadius: 7.5,
                                        backgroundColor: 'green',
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

export default EventsharefamilyScreen;
