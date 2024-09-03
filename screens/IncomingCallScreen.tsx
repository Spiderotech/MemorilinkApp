import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SendbirdCalls } from '@sendbird/calls-react-native';
import Sound from 'react-native-sound';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPhoneAlt, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';

// incoming calling screen inside chat screen 
const IncomingCallScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { callId } = route.params; // call id from direct call
  const [call, setCall] = useState(null);
  const [callerName, setCallerName] = useState('');
  const [ringtone, setRingtone] = useState(null);
// get the sendbird direct call using caller id
  useEffect(() => {
    const fetchCall = async () => {
      try {
        console.log(`Fetching call with ID: ${callId}`);
        const directCall = await SendbirdCalls.getDirectCall(callId);
        if (directCall) {
          console.log('Fetched call: ', directCall);
          setCall(directCall);
          setCallerName(directCall.caller.nickname);

          directCall.addListener({
            onEnded: (callProps) => {
              console.log('Call ended', callProps);
              navigation.goBack();
            },
          });
        } else {
          console.error('No call found with ID: ', callId);
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching call: ', error);
        navigation.goBack();
      }
    };

    fetchCall();

    console.log('Loading sound...');
    let soundPath = 'ringing.mp3';
// setup caller rington 
    const ringtone = new Sound(soundPath, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error('Failed to load the sound', error);
        return;
      }
      console.log('Sound loaded successfully');
      ringtone.setNumberOfLoops(-1); // Loop indefinitely
      ringtone.play((success) => {
        if (success) {
          console.log('Sound played successfully');
        } else {
          console.error('Sound playback failed');
        }
      });
      setRingtone(ringtone);
    });
// accept stop rington 
    return () => {
      if (ringtone) {
        ringtone.stop(() => {
          ringtone.release();
        });
      }
      if (call) {
        call.removeListener();
      }
    };
  }, [callId, navigation]);
// after accept redirect calling screen 
  const acceptCall = () => {
    if (call) {
      console.log('Accepting call...');
      if (ringtone) {
        ringtone.stop();
      }
      call.accept();
      navigation.navigate('Calling', { callId: call.callId, userName: call.caller.nickname, userImage: call.caller.profile_url });
    }
  };
// call reject to navigate to back 
  const rejectCall = () => {
    if (call) {
      console.log('Rejecting call...');
      if (ringtone) {
        ringtone.stop();
      }
      call.end();
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Incoming Call...</Text>
      {callerName ? <Text style={styles.callerName}>{callerName}</Text> : null}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.acceptButton} onPress={acceptCall}>
          <FontAwesomeIcon icon={faPhoneAlt} size={32} color="white" />
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton} onPress={rejectCall}>
          <FontAwesomeIcon icon={faPhoneSlash} size={32} color="white" />
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    color: 'white',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  callerName: {
    fontSize: 22,
    color: '#f0f0f0',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
});

export default IncomingCallScreen;
