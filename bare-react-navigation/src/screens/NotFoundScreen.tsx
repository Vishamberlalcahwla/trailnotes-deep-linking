import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NotFound'>;

export function NotFoundScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.body}>That link doesn't match a screen in TrailNotes.</Text>
      <Pressable onPress={() => navigation.navigate('Home')}>
        <Text style={styles.link}>Go to your trails</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 16, marginTop: 12 },
  link: { marginTop: 20, color: '#2f6f4e', fontWeight: '600' },
});
