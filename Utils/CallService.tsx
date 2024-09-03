// Utils/CallService.js
import { SendbirdCalls } from '@sendbird/calls-react-native';

const CallService = {
  initialize: (appId) => {
    SendbirdCalls.initialize(appId);
  },

  setListener: (navigation) => {
    SendbirdCalls.setListener({
      async onRinging(callProps) {
        console.log('Incoming call props:', callProps);
        const directCall = await SendbirdCalls.getDirectCall(callProps.callId);

        const unsubscribe = directCall.addListener({
          onEstablished: (call) => {
            console.log('Incoming call established', call);
          },
          onConnected: (call) => {
            console.log('Incoming call connected', call);
          },
          onEnded: (call) => {
            console.log('Incoming call ended', call);
            unsubscribe();
          },
        });

        // Navigate to the Incoming Call Screen
        navigation.navigate('IncomingCallScreen', { callId: callProps.callId });
      },
    });
  },
};

export default CallService;
