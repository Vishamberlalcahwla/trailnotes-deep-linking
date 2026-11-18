import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { findTrail } from '../../src/trails';
import { isValidTrailId, sanitizeRef } from '../../src/validation';

export default function TrailScreen() {
  const { id, ref } = useLocalSearchParams<{ id: string; ref?: string }>();

  // Deep links are untrusted input: reject anything that isn't a valid ID.
  if (!isValidTrailId(id)) {
    return <Redirect href="/not-found" />;
  }

  const trail = findTrail(id);
  const safeRef = sanitizeRef(ref);

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
      {safeRef ? <Text style={styles.ref}>Opened from: {safeRef}</Text> : null}
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
