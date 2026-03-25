import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

export default function SeatDetailScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Seat Detail Screen</Text>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  text: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  back: { color: COLORS.primary, fontSize: 16 },
});