import { StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  // Deep links only *open* this screen. Nothing here changes data
  // based on URL params; that would need explicit user confirmation.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.body}>
        You reached this screen via /settings. Deep links can open screens,
        but they should never change data without the user confirming.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 16, marginTop: 12, lineHeight: 22 },
});
