import React from 'react';
import {StatusBar} from 'react-native';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ChatScreen} from './src/screens/ChatScreen';

const App: React.FC = () => {
  return (
    // KeyboardProvider reports the keyboard height every frame on iOS and
    // Android (it detects the app's edge-to-edge setting on its own)
    <KeyboardProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <ChatScreen />
      </SafeAreaProvider>
    </KeyboardProvider>
  );
};

export default App;
