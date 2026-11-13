import React from 'react';
import {StatusBar} from 'react-native';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ChatScreen} from './src/screens/ChatScreen';

const App: React.FC = () => {
  return (
    // KeyboardProvider reports keyboard height every frame on iOS and
    // Android; preserveEdgeToEdge keeps Android's edge-to-edge layout
    // (edgeToEdgeEnabled=true) instead of switching the window mode
    <KeyboardProvider preserveEdgeToEdge>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <ChatScreen />
      </SafeAreaProvider>
    </KeyboardProvider>
  );
};

export default App;
