import React from 'react'
import { View, TouchableOpacity, Text, Image, ScrollView } from 'react-native'
import { ArrowLeftIcon, HomeModernIcon, MapPinIcon, AcademicCapIcon } from 'react-native-heroicons/solid'

const NewFriendProfileScreen = () => {
    return (
        <View className='flex-1 bg-white'>
            <Image source={require('../assets/bakground.jpg')} className="flex h-40 w-full rounded-b-[35px]    " />
            <View className='flex justify-center items-center -mt-10'>
                <TouchableOpacity className="items-center mx-2 ">
                    {/* <Image source={require('../assets/profile.jpg')} className="w-24 h-24 rounded-full   border-4 border-white" /> */}

                </TouchableOpacity>
                <Text className='text-black  font-semibold  text-[20px]  '>
                    Friend name
                </Text>

                <View className='flex flex-row gap-5 mt-2 w-full justify-center '>
                   
                    <TouchableOpacity className="p-2 bg-blue-500 flex justify-center items-center  w-32 rounded-[7px] mt-4 ">
                        <Text className="text-white font-medium text-[17px]">Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2 bg-blue-500 flex justify-center items-center  w-32 rounded-[7px] mt-4 ">
                        <Text className="text-white font-medium text-[17px]">Connect</Text>
                    </TouchableOpacity>

                </View>


                <View className="border-b border-[#ABB0BC] w-[90%] mt-5 mb-2 px-5" />
                <View className='flex flex-row gap-x-20 '>

                    <View className='flex justify-center items-center '>
                        <Text className='text-black  font-semibold  text-[22px] mt-2  '>
                            450
                        </Text>
                        <Text className='text-[#848488]   font-medium  text-xs  '>
                            Post
                        </Text>

                    </View>
                    <View className='flex justify-center items-center'>
                        <Text className='text-black  font-semibold  text-[22px] mt-2  '>
                            31K
                        </Text>
                        <Text className='text-[#848488]  font-medium  text-xs  '>
                            Connections
                        </Text>

                    </View>

                    <View className='flex justify-center items-center'>
                        <Text className='text-black  font-semibold  text-[22px] mt-2  '>
                            11K
                        </Text>
                        <Text className='text-[#848488]   font-medium  text-xs  '>
                            Links
                        </Text>

                    </View>

                </View>
                <View className="border-b border-[#ABB0BC] w-[90%] mt-4 px-5" />





            </View>

            <ScrollView className="px-1" showsVerticalScrollIndicator={false}>



                <View className='px-5 mt-3 '>
                    <Text className="text-black font-semibold text-xl tracking-widest mb-2  ">
                        Pictures
                    </Text>



                    <View className="flex flex-row mt-2 gap-2" >
                        <View >
                            <Image source={require('../assets/user.jpg')} className="w-40  h-40 rounded-2xl " />

                        </View>


                        <View className="flex flex-col gap-1 ">
                            <Image source={require('../assets/user.jpg')} className="w-20 h-20 rounded-2xl" />
                            <Image source={require('../assets/user.jpg')} className="w-20 h-20 rounded-2xl" />

                        </View>
                        <View className="flex flex-col gap-1">
                            <Image source={require('../assets/user.jpg')} className="w-20 h-20 rounded-2xl" />
                            <Image source={require('../assets/user.jpg')} className="w-20 h-20 rounded-2xl" />

                        </View>



                    </View>

                    <View className="border-b border-[#ABB0BC] w-full mt-5 px-5" />




                </View>



                <View className='px-5 mt-3'>
                    <Text className="text-black font-semibold text-xl tracking-widest mb-2 ">
                        Videos
                    </Text>

                    <View className="flex flex-row mt-2 gap-2" >
                        <View>
                            <Image source={require('../assets/user.jpg')} className="w-40  h-40 rounded-2xl mt-1" />

                        </View>


                        <View className="flex flex-col gap-1 ">
                            <Image source={require('../assets/user.jpg')} className="w-20 h-20 rounded-2xl" />
                            <Image source={require('../assets/user.jpg')} className="w-20 h-20 rounded-2xl" />

                        </View>
                        <View className="flex flex-col gap-1">
                            <Image source={require('../assets/user.jpg')} className="w-20 h-20 rounded-2xl" />
                            <Image source={require('../assets/user.jpg')} className="w-20 h-20 rounded-2xl" />

                        </View>



                    </View>



                </View>
            </ScrollView>








        </View>
    )
}

export default NewFriendProfileScreen
