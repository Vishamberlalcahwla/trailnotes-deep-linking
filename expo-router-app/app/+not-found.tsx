import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.body}>That link doesn't match a screen in TrailNotes.</Text>
      <Link href="/" style={styles.link}>
        Go to your trails
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 16, marginTop: 12 },
  link: { marginTop: 20, color: '#2f6f4e', fontWeight: '600' },
});
