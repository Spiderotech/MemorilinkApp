import React from 'react'
import { SafeAreaView, Text, StyleSheet, Image, View } from 'react-native';
import 'nativewind'; // Import NativeWind
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native'


const WelcomeScreen = () => {
  const navigation = useNavigation()
  setTimeout(() => {

    navigation.navigate('Signin')


  }, 10000);
  return (
    <LinearGradient
      colors={['#18426D', '#286EB5', '#64D2FF']}
      style={styles.gradient}
    >
      <SafeAreaView className="h-full justify-center items-center">
        <Image source={require('../assets/logo.png')} className=' w-80  h-10 mt-36   object-fill' />
        <Text className="text-white font-semibold  mt-10  text-[40px]">Welcome</Text>

        <Text className="text-white text-center  font-medium mt-10    text-[20px]  w-60 mb-20 ">Let's bulid your connection together</Text>
      </SafeAreaView>
      <View className="absolute bottom-0 w-full h-[250px]  ">
        <View className="absolute w-12 h-12 bg-white opacity-30 rounded-full" style={{ bottom: '65%', left: '45%' }} />
        <View className="absolute w-10 h-10 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '40%', left: '25%' }} />
        <View className="absolute w-10 h-10 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '40%', left: '65%' }} />
        <View className="absolute w-9 h-9 bg-white opacity-30 rounded-full" style={{ bottom: '30%', left: '46%' }} />
        <View className="absolute w-10 h-10 bg-white opacity-30 rounded-full" style={{ bottom: '30%', left: '-4%' }} />
        <View className="absolute w-10 h-10 bg-white opacity-30 rounded-full" style={{ bottom: '30%', left: '95%' }} />

        <View className="absolute w-10 h-10 bg-white opacity-30 rounded-full" style={{ bottom: '10%', left: '15%' }} />
        <View className="absolute w-8 h-8 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '15%', left: '35%' }} />
        <View className="absolute w-8 h-8 bg-white opacity-30 rounded-full" style={{ bottom: '7%', left: '46%' }} />
        <View className="absolute w-8 h-8 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '15%', left: '58%' }} />
        <View className="absolute w-10 h-10 bg-white opacity-30 rounded-full" style={{ bottom: '10%', left: '75%' }} />




      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WelcomeScreen
