import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function SeatCard({ seat, onPress }) {
  const bgColor =
    seat.status === 'available'
      ? COLORS.available
      : seat.status === 'occupied'
      ? COLORS.occupied
      : COLORS.reserved;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bgColor }]}
      onPress={() => onPress(seat)}
    >
      <Text style={styles.label}>{seat.col}{seat.row}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 44,
    height: 44,
    margin: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
});