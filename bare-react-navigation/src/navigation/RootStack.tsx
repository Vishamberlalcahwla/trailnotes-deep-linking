import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { TrailScreen } from '../screens/TrailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotFoundScreen } from '../screens/NotFoundScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'TrailNotes' }} />
      <Stack.Screen name="Trail" component={TrailScreen} options={{ title: 'Trail' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Not found' }} />
    </Stack.Navigator>
  );
}
