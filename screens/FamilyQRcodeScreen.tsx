import React, { useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, Image, SafeAreaView, Share } from 'react-native'
import { ArrowLeftIcon, CameraIcon } from 'react-native-heroicons/solid'
import QRCode from 'react-native-qrcode-svg'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import axios from "../Utils/Family/axios";

const FamilyQRcodeScreen = () => {
    const navigation = useNavigation()
    const route = useRoute();
    const { familyId } = route.params; // family id from family screen 
    const [loading, setLoading] = useState(true);
    const [familyData, setFamilyData] = useState(null);
    const [familyimgData, setFamilyimgData] = useState([]);

    // get the family data for showing in side the screen and qr code 

    const fetchUserData = async () => {
        try {
            const postsResponse = await axios.get(`/family/${familyId}`);
            setFamilyData(postsResponse.data.family);
            console.log(familyData);
            setFamilyimgData(postsResponse.data.familyAttachments[0])
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
    return (
        <View className='flex-1'>
            <SafeAreaView className=' flex   bg-[#18426D] h-64 rounded-b-[35px]  '>
                <View className="flex-row justify-start mt-5 px-5">
                    <TouchableOpacity className="mr-3 mt-1" onPress={() => navigation.goBack()} >
                        <ArrowLeftIcon size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View className='flex justify-center items-center mt-10'>
                    <Text className='text-white  font-light text-[20px] mt-2 mb-3 '>
                        My QR code
                    </Text>
                </View>
            </SafeAreaView>

            <View className='flex justify-center items-center -mt-12'>
                <TouchableOpacity className="items-center mx-2 ">
                    <Image source={{ uri: familyimgData?.attachment_url }} className="w-24 h-24 rounded-full   border-4 border-white" />
                </TouchableOpacity>
                <Text className='text-black  font-semibold  text-[20px] mt-2 mb-3 '>
                    {familyData?.name}
                </Text>
            </View>
    {/* qr code contain family data  */}
            <View className=" justify-center items-center mt-10   ">
                <View className=' w-60 h-60  flex justify-center items-center rounded-xl border-2 border-[#286EB5]'>
                    <QRCode value={`https://www.memorilink.com/family/${familyId}`} size={200} />
                </View>
            </View>


        </View>
    )
}

export default FamilyQRcodeScreen
