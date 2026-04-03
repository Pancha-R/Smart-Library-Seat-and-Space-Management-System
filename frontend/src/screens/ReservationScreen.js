import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal, Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { createReservation } from '../services/api';

const getCurrentTimeInMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const timeSlotToMinutes = (slot) => {
  const [time, modifier] = slot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM',
];

export default function ReservationScreen({ route, navigation }) {
  const { seat, user } = route.params;

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showOccupiedModal, setShowOccupiedModal] = useState(seat.status === 'occupied');
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getAvailableSlots = () => {
    const nowMinutes = getCurrentTimeInMinutes();
    let slots = TIME_SLOTS.filter(slot => timeSlotToMinutes(slot) > nowMinutes);

    if (seat.status === 'occupied') {
      const occupiedIndex = TIME_SLOTS.indexOf(seat.occupiedUntil);
      if (occupiedIndex !== -1) {
        const afterOccupied = TIME_SLOTS.slice(occupiedIndex);
        slots = slots.filter(s => afterOccupied.includes(s));
      }
    }

    if (seat.status === 'reserved') {
      const blocked = [];
      const reservationsList = seat.reservations || [];
      reservationsList.forEach(r => {
        const startKey = r.startTime || r.start;
        const endKey = r.endTime || r.end;
        const s = TIME_SLOTS.indexOf(startKey);
        const e = TIME_SLOTS.indexOf(endKey);
        if (s !== -1 && e !== -1) {
          for (let i = s; i <= e; i++) blocked.push(TIME_SLOTS[i]);
        }
      });
      slots = slots.filter(t => !blocked.includes(t));
    }

    return slots;
  };

  const availableSlots = getAvailableSlots();
  const isSlotDisabled = (slot) => !availableSlots.includes(slot);

  const handleSlotPress = (slot) => {
    if (!startTime) {
      setStartTime(slot);
      setEndTime(null);
    } else if (!endTime && slot !== startTime) {
      const startIdx = TIME_SLOTS.indexOf(startTime);
      const slotIdx = TIME_SLOTS.indexOf(slot);
      if (slotIdx > startIdx) {
        setEndTime(slot);
      } else {
        setStartTime(slot);
        setEndTime(null);
      }
    } else {
      setStartTime(slot);
      setEndTime(null);
    }
  };

  const getSlotStyle = (slot) => {
    if (isSlotDisabled(slot)) return [styles.slot, styles.slotDisabled];
    if (slot === startTime || slot === endTime) return [styles.slot, styles.slotSelected];
    if (startTime && endTime) {
      const startIdx = TIME_SLOTS.indexOf(startTime);
      const endIdx = TIME_SLOTS.indexOf(endTime);
      const slotIdx = TIME_SLOTS.indexOf(slot);
      if (slotIdx > startIdx && slotIdx < endIdx) return [styles.slot, styles.slotInRange];
    }
    return [styles.slot, styles.slotAvailable];
  };

  const handleReserve = () => {
    if (!startTime || !endTime) {
      Alert.alert('Select Time', 'Please select both start and end time.');
      return;
    }
    setShowPenaltyModal(true);
  };

  const handlePenaltyOk = () => {
    setShowPenaltyModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    try {
      const result = await createReservation({
        seatId: seat.seatCode,
        seatCode: seat.seatCode,
        floor: seat.floor,
        startTime,
        endTime,
      });
      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }
      navigation.replace('Profile', {
        user,
        reservation: result.reservation,
      });
    } catch (err) {
      Alert.alert('Error', 'Could not create reservation. Try again.');
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reserve Seat {seat.seatCode}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Seat Info */}
        <View style={styles.seatInfoBox}>
          <Text style={styles.seatCode}>{seat.seatCode}</Text>
          <Text style={styles.seatFloor}>{seat.floor} Floor</Text>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor:
                seat.status === 'available' ? COLORS.available :
                seat.status === 'occupied' ? COLORS.occupied :
                COLORS.reserved
            }
          ]}>
            <Text style={styles.statusText}>{seat.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Reserved times info */}
        {seat.status === 'reserved' && seat.reservations?.length > 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>⚠️ Already Reserved</Text>
            {seat.reservations.map((r, i) => (
              <Text key={i} style={styles.infoText}>
                {r.startTime || r.start} – {r.endTime || r.end}
              </Text>
            ))}
            <Text style={styles.infoSubtext}>
              You can select times outside these slots.
            </Text>
          </View>
        )}

        {/* Occupied info */}
        {seat.status === 'occupied' && (
          <View style={[styles.infoBox, { borderColor: COLORS.occupied }]}>
            <Text style={styles.infoTitle}>🔴 Currently Occupied</Text>
            <Text style={styles.infoText}>In use until {seat.occupiedUntil}</Text>
            <Text style={styles.infoSubtext}>
              You can only reserve after {seat.occupiedUntil}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Select Time Slot</Text>
        <Text style={styles.instruction}>
          Tap start time, then tap end time to select your reservation window.
        </Text>

        {startTime && (
          <Text style={styles.selectionText}>
            {startTime} {endTime ? `→ ${endTime}` : '→ select end time'}
          </Text>
        )}

        {/* No slots available message */}
        {availableSlots.length === 0 && (
          <View style={styles.noSlotsBox}>
            <Text style={styles.noSlotsText}>
              ⚠️ No available time slots for today.
            </Text>
          </View>
        )}

        {/* Time Slot Grid */}
        <View style={styles.slotGrid}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={getSlotStyle(slot)}
              onPress={() => !isSlotDisabled(slot) && handleSlotPress(slot)}
              disabled={isSlotDisabled(slot)}
            >
              <Text style={[
                styles.slotText,
                isSlotDisabled(slot) && styles.slotTextDisabled,
                (slot === startTime || slot === endTime) && styles.slotTextSelected,
              ]}>
                {slot}
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
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ccc' }]} />
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.reserveBtn} onPress={handleReserve}>
          <Text style={styles.reserveBtnText}>Reserve Seat</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL 1: Occupied */}
      <Modal transparent visible={showOccupiedModal} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>🔴 Seat In Use</Text>
            <Text style={styles.modalText}>
              This seat is currently in use until {seat.occupiedUntil} today.{'\n\n'}
              Do you want to reserve this seat after {seat.occupiedUntil}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.modalBtnCancelText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => setShowOccupiedModal(false)}
              >
                <Text style={styles.modalBtnConfirmText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Penalty Policy */}
      <Modal transparent visible={showPenaltyModal} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>⚠️ Penalty Policy</Text>
            <Text style={styles.modalText}>
              If you do not check in within{' '}
              <Text style={styles.bold}>30 minutes</Text> after reservation
              time, your seat will be released and a penalty will be applied.{'\n\n'}
              <Text style={styles.bold}>5 consecutive penalties</Text> will
              temporarily ban your account from the booking system.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnConfirm, { width: '100%' }]}
              onPress={handlePenaltyOk}
            >
              <Text style={styles.modalBtnConfirmText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Confirm */}
      <Modal transparent visible={showConfirmModal} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>✅ Confirm Reservation</Text>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmSeat}>Seat {seat.seatCode}</Text>
              <Text style={styles.confirmFloor}>{seat.floor} Floor</Text>
              <Text style={styles.confirmTime}>{startTime} – {endTime}</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleConfirm}
              >
                <Text style={styles.modalBtnConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  back: { color: COLORS.white, fontSize: 16 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 16 },
  seatInfoBox: {
    alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 12, padding: 20, marginBottom: 16, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  seatCode: { fontSize: 36, fontWeight: 'bold', color: COLORS.text },
  seatFloor: { fontSize: 16, color: COLORS.textLight, marginTop: 4 },
  statusBadge: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  infoBox: {
    borderWidth: 1.5, borderColor: COLORS.reserved, borderRadius: 10,
    padding: 14, marginBottom: 16, backgroundColor: '#FFF9F0',
  },
  infoTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 6, color: COLORS.text },
  infoText: { fontSize: 14, color: COLORS.text, marginBottom: 2 },
  infoSubtext: { fontSize: 12, color: COLORS.textLight, marginTop: 6 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text, marginBottom: 6 },
  instruction: { fontSize: 13, color: COLORS.textLight, marginBottom: 8 },
  selectionText: {
    fontSize: 15, fontWeight: '600', color: COLORS.primary,
    marginBottom: 12, textAlign: 'center',
  },
  noSlotsBox: {
    backgroundColor: '#FFF3E0', borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 16,
  },
  noSlotsText: { color: COLORS.reserved, fontWeight: '600', fontSize: 14 },
  slotGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', marginBottom: 16,
  },
  slot: { width: '30%', padding: 10, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  slotAvailable: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: COLORS.available },
  slotSelected: { backgroundColor: COLORS.primary },
  slotInRange: { backgroundColor: '#BBDEFB', borderWidth: 1, borderColor: COLORS.primary },
  slotDisabled: { backgroundColor: '#F0F0F0' },
  slotText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  slotTextDisabled: { color: '#BDBDBD' },
  slotTextSelected: { color: COLORS.white },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: COLORS.textLight },
  reserveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 30,
  },
  reserveBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modal: {
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 24, width: '100%', elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  modalText: { fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 20 },
  bold: { fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  modalBtnCancel: { borderWidth: 1, borderColor: COLORS.border },
  modalBtnConfirm: { backgroundColor: COLORS.primary },
  modalBtnCancelText: { color: COLORS.text, fontWeight: '600' },
  modalBtnConfirmText: { color: COLORS.white, fontWeight: 'bold' },
  confirmBox: {
    backgroundColor: COLORS.primaryLight, borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 20,
  },
  confirmSeat: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  confirmFloor: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  confirmTime: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 8 },
});