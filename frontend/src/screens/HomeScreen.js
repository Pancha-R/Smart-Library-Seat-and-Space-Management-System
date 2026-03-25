import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ScrollView,
} from 'react-native';
import Header from '../components/Header';
import SeatCard from '../components/SeatCard';
import { COLORS } from '../constants/colors';
import { mockSeats } from '../services/api';

export default function HomeScreen({ navigation, route }) {
  const { user } = route.params;
  const [floor, setFloor] = useState(1);

  const seats = mockSeats.filter(s => s.floor === floor);

  const counts = {
    available: mockSeats.filter(s => s.status === 'available').length,
    occupied: mockSeats.filter(s => s.status === 'occupied').length,
    reserved: mockSeats.filter(s => s.status === 'reserved').length,
  };

  return (
    <View style={styles.container}>
      <Header title="Library Seat Map" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Welcome */}
        <Text style={styles.welcome}>Welcome, {user.name.split(' ')[0]} 👋</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: COLORS.available }]}>
            <Text style={styles.statNum}>{counts.available}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: COLORS.occupied }]}>
            <Text style={styles.statNum}>{counts.occupied}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: COLORS.reserved }]}>
            <Text style={styles.statNum}>{counts.reserved}</Text>
            <Text style={styles.statLabel}>Reserved</Text>
          </View>
        </View>

        {/* Floor selector */}
        <View style={styles.floorRow}>
          {[1, 2].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.floorBtn, floor === f && styles.floorBtnActive]}
              onPress={() => setFloor(f)}
            >
              <Text style={[styles.floorText, floor === f && styles.floorTextActive]}>
                Floor {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seat Grid */}
        <View style={styles.grid}>
          {seats.map(seat => (
            <SeatCard
              key={seat.id}
              seat={seat}
              onPress={() => navigation.navigate('SeatDetail', { seat, user })}
            />
          ))}
        </View>

        {/* Quick actions */}
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate('QRScan', { user })}
        >
          <Text style={styles.qrButtonText}>📷  Scan QR to Occupy Seat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookingButton}
          onPress={() => navigation.navigate('MyBooking', { user })}
        >
          <Text style={styles.bookingButtonText}>📋  My Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16 },
  welcome: {
    fontSize: 18, fontWeight: '600',
    color: COLORS.text, marginBottom: 16,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  stat: {
    flex: 1, marginHorizontal: 4, borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  statNum: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: COLORS.white, fontSize: 11, marginTop: 2 },
  floorRow: { flexDirection: 'row', marginBottom: 12 },
  floorBtn: {
    flex: 1, padding: 10, marginHorizontal: 4,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary,
    alignItems: 'center',
  },
  floorBtnActive: { backgroundColor: COLORS.primary },
  floorText: { color: COLORS.primary, fontWeight: '600' },
  floorTextActive: { color: COLORS.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 },
  qrButton: {
    backgroundColor: COLORS.primaryDark, borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  qrButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  bookingButton: {
    backgroundColor: COLORS.white, borderRadius: 10,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary,
  },
  bookingButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
});