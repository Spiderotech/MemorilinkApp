import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SendbirdCalls, SoundType } from '@sendbird/calls-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMicrophone, faMicrophoneSlash, faPhone } from '@fortawesome/free-solid-svg-icons';

const CallingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { callId, userName, userImage } = route.params; //data from notification or incoming call screen
  const [call, setCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [callStatus, setCallStatus] = useState('Calling...'); //change the call state  calling , connecting ,ongoing timer and end call

  // setup sound of calling

  useEffect(() => {
    let interval;

    const setupSoundEffects = async () => {
      SendbirdCalls.addDirectCallSound(SoundType.RINGING, 'ringing.mp3');
      SendbirdCalls.addDirectCallSound(SoundType.DIALING, 'dialing.mp3');
      SendbirdCalls.addDirectCallSound(SoundType.RECONNECTED, 'reconnected.mp3');
      SendbirdCalls.addDirectCallSound(SoundType.RECONNECTING, 'reconnecting.mp3');
    };

    //get the direct call from sendbird using callId

    const fetchCall = async () => {
      try {
        const directCall = await SendbirdCalls.getDirectCall(callId);
        setCall(directCall);

        const unsubscribe = directCall.addListener({
          onRinging: (call) => {
            console.log('Call ringing...');
            SendbirdCalls.playDirectCallSound(SoundType.RINGING);
          },
          onEstablished: (call) => {
            console.log('Call established', call);
          },
          onConnected: (call) => {
            console.log('Call connected', call);
            setCallStatus('Connected');
            interval = setInterval(() => {
              setCallTime((prevTime) => prevTime + 1);
            }, 1000);
          },
          onEnded: (call) => {
            console.log('Call ended', call);
            clearInterval(interval);
            setCallStatus('Call Ended');
            unsubscribe();
            setTimeout(() => {
              navigation.goBack();
            }, 2000);
          },
          onError: (call, error) => {
            console.error('Call error:', error);
            clearInterval(interval);
            setCallStatus('Error');
            unsubscribe();
            navigation.goBack();
          },
          onRemoteAudioSettingsChanged: (call) => {
            console.log('Remote audio settings changed', call);
          }
        });

        directCall.accept();
      } catch (error) {
        console.error('Error fetching call:', error);
      }
    };

    setupSoundEffects();
    fetchCall();

    return () => {
      clearInterval(interval);
      SendbirdCalls.removeDirectCallSound(SoundType.DIALING);
      SendbirdCalls.removeDirectCallSound(SoundType.RINGING);
      SendbirdCalls.removeDirectCallSound(SoundType.RECONNECTING);
      SendbirdCalls.removeDirectCallSound(SoundType.RECONNECTED);
    };
  }, [callId, navigation]);

  // call end button function 

  const endCall = () => {
    if (call) {
      call.end();
    }
  };


  // call mute and unmute 

  const toggleMute = () => {
    if (call) {
      if (isMuted) {
        call.unmuteMicrophone();
      } else {
        call.muteMicrophone();
      }
      setIsMuted(!isMuted);
    }
  };

  // on going call timer

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.userInfo}>
        {userImage && <Image source={{ uri: userImage }} style={styles.userImage} />}
        {userName && <Text style={styles.userName}>{userName}</Text>}
        <Text style={styles.callStatus}>{callStatus}</Text>
        {callStatus === 'Connected' && <Text style={styles.callTime}>{formatTime(callTime)}</Text>}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
          <FontAwesomeIcon 
            icon={isMuted ? faMicrophoneSlash : faMicrophone} 
            size={30} 
            color="white" 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
          <FontAwesomeIcon 
            icon={faPhone} 
            size={30} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 50,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  callStatus: {
    fontSize: 18,
    color: 'gray',
    marginTop: 10,
  },
  callTime: {
    fontSize: 18,
    color: 'gray',
    marginTop: 10,
  },
  controls: {
    alignItems: 'center',
  },
  muteButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#18426D',
    borderRadius: 30,
  },
  endCallButton: {
    padding: 15,
    backgroundColor: 'red',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CallingScreen;
