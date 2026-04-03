import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal, ActivityIndicator, Alert,
} from 'react-native';
import SeatCard from '../components/SeatCard';
import { COLORS } from '../constants/colors';
import { fetchSeats, getUserReservation } from '../services/api';

const FLOORS = ['Ground', 'First', 'Second'];
const COLS = ['E', 'D', 'C', 'B', 'A'];
const ROWS = [1, 2, 3, 4, 5, 6];

export default function HomeScreen({ navigation, route }) {
  const { user } = route.params;
  const [floor, setFloor] = useState('Ground');
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupSeat, setPopupSeat] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    loadSeats();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSeats();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSeats = async () => {
    setLoading(true);
    try {
      const data = await fetchSeats();
      setSeats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load seats:', err);
    } finally {
      setLoading(false);
    }
  };

  const floorSeats = seats.filter(s => s.floor === floor);
  const getSeat = (row, col) => floorSeats.find(s => s.row === row && s.col === col);

  const counts = {
    available: seats.filter(s => s.status === 'available').length,
    occupied: seats.filter(s => s.status === 'occupied').length,
    reserved: seats.filter(s => s.status === 'reserved').length,
  };

  const handleSeatPress = async (seat) => {
    try {
      const result = await getUserReservation();
      if (result?.reservation) {
        const status = result.reservation.status;

        // If confirmed (not yet checked in) - block new reservation
        if (status === 'confirmed') {
          Alert.alert(
            'Active Reservation',
            `You have a reserved seat (${result.reservation.seatCode}) that you haven't checked into yet. Please cancel it or scan the QR code to check in first.`,
            [
              {
                text: 'View Reservation',
                onPress: () => navigation.navigate('Profile', { user })
              },
              { text: 'OK' },
            ]
          );
          return;
        }

        // If already checked in - allow viewing but not new reservation
        if (status === 'checked-in') {
          Alert.alert(
            'Already Seated',
            `You are currently seated at ${result.reservation.seatCode}. Please release your current seat before making a new reservation.`,
            [
              {
                text: 'View My Seat',
                onPress: () => navigation.navigate('Profile', { user })
              },
              { text: 'OK' },
            ]
          );
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }

    if (seat.status === 'available') {
      navigation.navigate('Reservation', { seat, user });
    } else {
      setPopupSeat(seat);
      setShowPopup(true);
    }
  };

  const handlePopupReserve = () => {
    setShowPopup(false);
    navigation.navigate('Reservation', { seat: popupSeat, user });
  };

  return (
    <View style={styles.container}>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Library Seat Map</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { user })}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Welcome */}
        <Text style={styles.welcome}>
          Welcome, {user?.name?.split(' ')[0] || 'Student'} 👋
        </Text>

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

        {/* Floor Selector */}
        <View style={styles.floorRow}>
          {FLOORS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.floorBtn, floor === f && styles.floorBtnActive]}
              onPress={() => setFloor(f)}
            >
              <Text style={[styles.floorText, floor === f && styles.floorTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.available }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.occupied }]} />
            <Text style={styles.legendText}>Occupied</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.reserved }]} />
            <Text style={styles.legendText}>Reserved</Text>
          </View>
        </View>

        {/* Seat Grid Box */}
        <View style={styles.gridBox}>
          <View style={styles.doorRow}>
            <Text style={styles.doorLabel}>🚪 Door</Text>
          </View>
          <View style={styles.colHeaderRow}>
            <View style={styles.rowNumSpace} />
            {COLS.map(col => (
              <View key={col} style={styles.colHeader}>
                <Text style={styles.colHeaderText}>{col}</Text>
              </View>
            ))}
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ padding: 40 }} />
          ) : (
            ROWS.map(row => (
              <View key={row} style={styles.seatRow}>
                <Text style={styles.rowNum}>{row}</Text>
                {COLS.map(col => {
                  const seat = getSeat(row, col);
                  return seat ? (
                    <SeatCard key={seat.id} seat={seat} onPress={handleSeatPress} />
                  ) : (
                    <View key={`${row}-${col}`} style={styles.emptySeat} />
                  );
                })}
              </View>
            ))
          )}
          <Text style={styles.hint}>Click on the seat you want to reserve</Text>
        </View>

        {/* Bottom Buttons */}
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate('QRScan', { user })}
        >
          <Text style={styles.qrButtonText}>📷  Scan QR to Occupy Seat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookingButton}
          onPress={() => navigation.navigate('Profile', { user })}
        >
          <Text style={styles.bookingButtonText}>📋  My Booking</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Popup for occupied/reserved seats */}
      <Modal transparent visible={showPopup} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>

            {popupSeat?.status === 'occupied' && (
              <>
                <Text style={styles.modalIcon}>🔴</Text>
                <Text style={styles.modalTitle}>Seat In Use</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Seat {popupSeat.seatCode}</Text> is
                  currently occupied until{' '}
                  <Text style={styles.bold}>{popupSeat.occupiedUntil}</Text> today.{'\n\n'}
                  Do you want to reserve this seat after{' '}
                  <Text style={styles.bold}>{popupSeat.occupiedUntil}</Text>?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => setShowPopup(false)}
                  >
                    <Text style={styles.cancelBtnText}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.confirmBtn]}
                    onPress={handlePopupReserve}
                  >
                    <Text style={styles.confirmBtnText}>Yes, Reserve</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {popupSeat?.status === 'reserved' && (
              <>
                <Text style={styles.modalIcon}>🟠</Text>
                <Text style={styles.modalTitle}>Seat Reserved</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Seat {popupSeat?.seatCode}</Text> is
                  reserved during these times:
                </Text>
                {popupSeat?.reservations?.map((r, i) => (
                  <View key={i} style={styles.reservedTimeBox}>
                    <Text style={styles.reservedTimeText}>
                      🕐 {r.start} – {r.end}
                    </Text>
                    <Text style={styles.reservedTimeNote}>Not available</Text>
                  </View>
                ))}
                <Text style={styles.modalSubtext}>
                  You can still reserve this seat at other available times.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => setShowPopup(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.confirmBtn]}
                    onPress={handlePopupReserve}
                  >
                    <Text style={styles.confirmBtnText}>Reserve Anyway</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  profileIcon: { fontSize: 24 },
  scroll: { padding: 16 },
  welcome: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  stat: {
    flex: 1, marginHorizontal: 4,
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  statNum: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: COLORS.white, fontSize: 11, marginTop: 2 },
  floorRow: { flexDirection: 'row', marginBottom: 12 },
  floorBtn: {
    flex: 1, padding: 10, marginHorizontal: 4,
    borderRadius: 8, borderWidth: 1,
    borderColor: COLORS.primary, alignItems: 'center',
  },
  floorBtnActive: { backgroundColor: COLORS.primary },
  floorText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  floorTextActive: { color: COLORS.white },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: COLORS.textLight },
  gridBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doorRow: { alignItems: 'flex-end', marginBottom: 4, paddingRight: 4 },
  doorLabel: {
    fontSize: 12, fontWeight: 'bold', color: COLORS.text,
    backgroundColor: '#E0E0E0', paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 6,
  },
  colHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rowNumSpace: { width: 24 },
  colHeader: { width: 44, marginHorizontal: 4, alignItems: 'center' },
  colHeaderText: { fontWeight: 'bold', color: COLORS.textLight, fontSize: 13 },
  seatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  rowNum: {
    width: 24, fontWeight: 'bold',
    color: COLORS.textLight, fontSize: 13, textAlign: 'center',
  },
  emptySeat: { width: 44, height: 44, margin: 4 },
  hint: { textAlign: 'center', color: COLORS.textLight, fontSize: 12, marginTop: 10 },
  qrButton: {
    backgroundColor: COLORS.primaryDark, borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  qrButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  bookingButton: {
    backgroundColor: COLORS.white, borderRadius: 10, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary, marginBottom: 20,
  },
  bookingButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modal: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, width: '100%' },
  modalIcon: { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold',
    color: COLORS.text, textAlign: 'center', marginBottom: 12,
  },
  modalText: {
    fontSize: 14, color: COLORS.text,
    lineHeight: 22, marginBottom: 12, textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 13, color: COLORS.textLight,
    textAlign: 'center', marginTop: 8, marginBottom: 12,
  },
  bold: { fontWeight: 'bold' },
  reservedTimeBox: {
    backgroundColor: '#FFF3E0', borderRadius: 8, padding: 10,
    marginBottom: 8, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  reservedTimeText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  reservedTimeNote: { fontSize: 12, color: COLORS.occupied },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { borderWidth: 1, borderColor: COLORS.border },
  confirmBtn: { backgroundColor: COLORS.primary },
  cancelBtnText: { color: COLORS.text, fontWeight: '600' },
  confirmBtnText: { color: COLORS.white, fontWeight: 'bold' },
});