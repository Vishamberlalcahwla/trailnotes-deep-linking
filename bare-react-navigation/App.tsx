import React from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { linking } from './src/navigation/linking';
import { RootStack } from './src/navigation/RootStack';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking} fallback={<ActivityIndicator />}>
        <RootStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
