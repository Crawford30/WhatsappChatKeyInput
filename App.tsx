import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatScreen } from './src/screens/ChatScreen';
import { VoiceRecorderProvider } from './src/common/VoiceRecorderContext';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <VoiceRecorderProvider>
        <StatusBar barStyle="light-content" backgroundColor="#25D366" />
        <ChatScreen />
      </VoiceRecorderProvider>
    </SafeAreaProvider>
  );
};

export default App;
