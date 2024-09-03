import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ArchiveBoxXMarkIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';

const Favoritesfamilycard = ({family}) => {
    const navigation=useNavigation()
    console.log(family);
    
  return (
    <TouchableOpacity className="py-2 bg-[#E6D8B6] h-[120px] w-[100px] m-3.5 rounded-[12px] items-center " onPress={() => navigation.navigate('Familylist',{ familyId: family?.family_id })}>
    <View className="flex justify-center items-center mt-3">
        <TouchableOpacity className="items-center mx-2">
            <Image source={{uri:family?.attachment_url}} className="w-[45px] h-[45px] rounded-full" />
        </TouchableOpacity>
        <Text className="text-black  font-semibold text-[10px] mt-2">
            {family.name}
        </Text>
        <Text className="text-[#848488] mt-2  font-normal text-[8px]">
        {family.location}
           
        </Text>
    </View>
</TouchableOpacity>
  )
}

export default Favoritesfamilycard
