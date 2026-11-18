import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { TRAILS } from '../src/trails';

export default function HomeScreen() {
  // createURL returns the right prefix for this environment
  // (trailnotes:// in a dev build or release, exp:// in Expo Go).
  const example = Linking.createURL('trail/42');

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Try: {example}</Text>
      <FlatList
        data={TRAILS}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/trail/[id]', params: { id: item.id } }} asChild>
            <Pressable style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.distanceKm} km · /trail/{item.id}
              </Text>
            </Pressable>
          </Link>
        )}
      />
      <Link href="/settings" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Settings</Text>
        </Pressable>
      </Link>
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
