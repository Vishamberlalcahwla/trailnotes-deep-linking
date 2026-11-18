import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { findTrail } from '../data/trails';
import { isValidTrailId, sanitizeRef } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Trail'>;

export function TrailScreen({ route }: Props) {
  const { id } = route.params;
  // Defense in depth: linking.ts already rejects bad IDs.
  const trail = isValidTrailId(id) ? findTrail(id) : undefined;
  const ref = sanitizeRef(route.params.ref);

  if (!trail) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Trail not found</Text>
        <Text style={styles.body}>No trail with that ID in your journal.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{trail.name}</Text>
      <Text style={styles.meta}>
        {trail.distanceKm} km · {trail.elevationM} m elevation gain
      </Text>
      <Text style={styles.body}>{trail.notes}</Text>
      {ref ? <Text style={styles.ref}>Opened from: {ref}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  meta: { color: '#777', marginTop: 4 },
  body: { fontSize: 16, marginTop: 16, lineHeight: 22 },
  ref: { marginTop: 24, color: '#2f6f4e' },
});
