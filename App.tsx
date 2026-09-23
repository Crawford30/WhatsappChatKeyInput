import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { primaryColor } from './src/assets/style/Colors';
import { ChatScreen } from './src/screens/ChatScreen';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      <ChatScreen />
    </SafeAreaProvider>
  );
};

export default App;
