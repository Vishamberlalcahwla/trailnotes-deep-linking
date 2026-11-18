import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { TRAILS } from '../data/trails';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Try: trailnotes://trail/42 or trailnotes://settings
      </Text>
      <FlatList
        data={TRAILS}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('Trail', { id: item.id })}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.distanceKm} km · /trail/{item.id}
            </Text>
          </Pressable>
        )}
      />
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  hint: { color: '#666', marginBottom: 12 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontSize: 17, fontWeight: '600' },
  meta: { color: '#777', marginTop: 2 },
  button: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2f6f4e',
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '600' },
});
