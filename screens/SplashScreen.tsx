import React from 'react';
import { SafeAreaView, Image, View } from 'react-native';
import 'nativewind'; // Import NativeWind
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native'

const SplashScreen = () => {
  const navigation=useNavigation()
  setTimeout(()=>{

    navigation.navigate('Auth')
  

},3000);
  return (
    <LinearGradient
      colors={['#18426D', '#286EB5', '#64D2FF']}
      className="flex-1 justify-center items-center"
    >
      <SafeAreaView className="h-full justify-center items-center relative">
        <Image source={require('../assets/logo.png')} className="w-80 h-10 object-fill" />
        <View className="absolute bottom-0 w-full h-1/2">
          <View className="absolute w-12 h-12 bg-white opacity-30 rounded-full" style={{ bottom: '65%', left: '45%' }} />
          <View className="absolute w-10 h-10 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '50%', left: '25%' }} />
          <View className="absolute w-10 h-10 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '50%', left: '65%' }} />
          <View className="absolute w-9 h-9 bg-white opacity-30 rounded-full" style={{ bottom: '40%', left: '46%' }} />
          <View className="absolute w-10 h-10 bg-white opacity-30 rounded-full" style={{ bottom: '40%', left: '-4%' }} />
          <View className="absolute w-10 h-10 bg-white opacity-30 rounded-full" style={{ bottom: '40%', left: '95%' }} />

          <View className="absolute w-10 h-10 bg-white opacity-30 rounded-full" style={{ bottom: '25%', left: '15%' }} />
          <View className="absolute w-8 h-8 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '28%', left: '35%' }} />
          <View className="absolute w-8 h-8 bg-white opacity-30 rounded-full" style={{ bottom: '20%', left: '46%' }} />
          <View className="absolute w-8 h-8 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '28%', left: '58%' }} />
          <View className="absolute w-10 h-10 bg-white opacity-30 rounded-full" style={{ bottom: '25%', left: '75%' }} />


          <View className="absolute w-10 h-10 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '2%', left: '1%' }} />
          <View className="absolute w-8 h-8 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '2%', left: '25%' }} />
          <View className="absolute w-8 h-8 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '2%', left: '68%' }} />
          <View className="absolute w-10 h-10 bg-[#286EB5] opacity-30 rounded-full" style={{ bottom: '2%', left: '90%' }} />
         
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SplashScreen;
