import React from 'react'
import { Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { BellAlertIcon, Bars4Icon } from 'react-native-heroicons/solid'
import { useNavigation } from '@react-navigation/native'

const NewFamilyScreen = () => {
    const navigation=useNavigation()
    return (
        <View className='flex-1 bg-white'>
            <View className="flex-row  justify-between mt-16  ">
                <Text className="text-black font-light text-[20px] tracking-widest ml-5">
                    Memories
                </Text>

            </View>
            <View className='px-5 mt-5'>
                <View className="flex flex-row gap-x-2  " >

                    <Image source={require('../assets/user.jpg')} className=" w-56  h-52 rounded-[15px] " />
                    <View className='flex flex-col  justify-evenly  gap-9'>
                        <View className='flex justify-center items-center '>
                            <Text className='text-black   font-semibold  text-[22px]   '>
                                100
                            </Text>
                            <Text className='text-[#848488] font-light  text-[12px]  '>
                                Moments
                            </Text>

                        </View>
                        <View className='flex justify-center items-center'>
                            <Text className='text-black  font-semibold  text-[22px]   '>
                                31K
                            </Text>
                            <Text className='text-[#848488]  font-light  text-[12px]  '>
                                Connections
                            </Text>

                        </View>
                        <View className=' py-4'>
                            <TouchableOpacity className="p-2 bg-blue-500 flex justify-center items-center  h-10  w-[87px] rounded-[7px]  "onPress={() => navigation.navigate('Familyfeed')}>
                                <Text className="text-white font-medium  text-[17px]">Join</Text>
                            </TouchableOpacity>

                        </View>


                    </View>

                </View>

                <View className="mt-5" >
                    <Text className='text-[#C7C7CC]   font-normal text-[10px] leading-4 tracking-tighter  text-justify mb-3   '>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled
                    </Text>

                </View>

                <View className="border-b border-[#ABB0BC] w-full mt-5 px-5" />

                <View className=' mt-5 '>
                    <Text className="text-black font-semibold text-xl tracking-widest ml-2 ">
                        View
                    </Text>



                    <View className="flex flex-row mt-2 gap-2.5" >
                        <View className="flex flex-col gap-2 ">
                            <Image source={require('../assets/user.jpg')} className=" w-24 h-24 rounded-2xl" />
                            <Image source={require('../assets/user.jpg')} className=" w-24 h-24 rounded-2xl" />
                            <Image source={require('../assets/user.jpg')} className=" w-24 h-24 rounded-2xl" />


                        </View>
                        <View className="flex flex-col gap-2 ">
                            <Image source={require('../assets/user.jpg')} className=" w-24 h-24 rounded-2xl" />
                            <Image source={require('../assets/user.jpg')} className=" w-24 h-24 rounded-2xl" />
                            <Image source={require('../assets/user.jpg')} className=" w-24 h-24 rounded-2xl" />


                        </View>
                        <View className="flex flex-col gap-2 ">
                            <Image source={require('../assets/user.jpg')} className=" w-24 h-24 rounded-2xl" />
                            <Image source={require('../assets/user.jpg')} className=" w-24 h-24 rounded-2xl" />
                            <Image source={require('../assets/user.jpg')} className=" w-24 h-24 rounded-2xl" />


                        </View>



                    </View>






                </View>


            </View>





        </View>
    )
}

export default NewFamilyScreen
