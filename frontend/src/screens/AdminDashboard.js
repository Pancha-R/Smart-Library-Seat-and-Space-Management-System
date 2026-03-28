import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

export default function AdminDashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Librarian Dashboard</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.text}>🏛️ Librarian Panel</Text>
        <Text style={styles.sub}>Full dashboard coming soon...</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 28, marginBottom: 8 },
  sub: { fontSize: 15, color: COLORS.textLight, marginBottom: 24 },
  btn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    paddingHorizontal: 40,
  },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
});