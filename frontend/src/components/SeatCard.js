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
      disabled={seat.status !== 'available'}
    >
      <Text style={styles.number}>{seat.number}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 55,
    height: 55,
    margin: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  number: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});