import { registerGlobals, AudioSession } from '@livekit/react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Ensure WebRTC globals are available before any other imports run
registerGlobals();
AudioSession.startAudioSession();

registerRootComponent(App);


