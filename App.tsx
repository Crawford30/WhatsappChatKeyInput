import React from 'react';
import { StatusBar } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatScreen } from './src/screens/ChatScreen';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      {/* Frame-by-frame keyboard tracking for the chat input */}
      <KeyboardProvider>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <ChatScreen />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};

export default App;
