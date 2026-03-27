import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Alert, ScrollView,
} from 'react-native';
import { COLORS } from '../constants/colors';

export default function SeatDetailScreen({ route, navigation }) {
  const { reservation, user } = route.params;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancel = () => {
    setShowCancelModal(false);
    Alert.alert('Cancelled', 'Your reservation has been cancelled.', [
      { text: 'OK', onPress: () => navigation.navigate('Home', { user }) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation Detail</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Seat Map Visual */}
        <View style={styles.mapBox}>
          <Text style={styles.mapTitle}>{reservation?.floor} Floor Map</Text>
          <View style={styles.deskRow}>
            {['GE1','GE2','GE3','GE4','GE5'].map(code => (
              <View
                key={code}
                style={[
                  styles.miniSeat,
                  code === reservation?.seatCode && styles.miniSeatActive,
                ]}
              >
                <Text style={[
                  styles.miniSeatText,
                  code === reservation?.seatCode && styles.miniSeatTextActive,
                ]}>
                  {code}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.mapNote}>
            ● Your seat is highlighted
          </Text>
        </View>

        {/* Reservation Info */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Reservation Info</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Seat</Text>
            <Text style={styles.detailValue}>{reservation?.seatCode}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Floor</Text>
            <Text style={styles.detailValue}>{reservation?.floor} Floor</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>From</Text>
            <Text style={styles.detailValue}>{reservation?.start}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Until</Text>
            <Text style={styles.detailValue}>{reservation?.end}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedText}>CONFIRMED</Text>
            </View>
          </View>
        </View>

        {/* Reminder */}
        <View style={styles.reminderBox}>
          <Text style={styles.reminderTitle}>⏰ Check-in Reminder</Text>
          <Text style={styles.reminderText}>
            Please check in by scanning the QR code on your desk within{' '}
            <Text style={styles.bold}>15 minutes</Text> of your reservation
            start time to avoid a penalty.
          </Text>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowCancelModal(true)}
        >
          <Text style={styles.cancelBtnText}>Cancel Reservation</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal transparent visible={showCancelModal} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Cancel Reservation?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to cancel your reservation for{' '}
              <Text style={styles.bold}>Seat {reservation?.seatCode}</Text>?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnKeep]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalBtnKeepText}>Keep It</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={handleCancel}
              >
                <Text style={styles.modalBtnCancelText}>Yes, Cancel</Text>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { color: COLORS.white, fontSize: 16 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 16 },
  mapBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  deskRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  miniSeat: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniSeatActive: { backgroundColor: COLORS.primary },
  miniSeatText: { fontSize: 11, fontWeight: '600', color: COLORS.textLight },
  miniSeatTextActive: { color: COLORS.white },
  mapNote: { fontSize: 12, color: COLORS.primary },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: { fontSize: 14, color: COLORS.textLight },
  detailValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border },
  confirmedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  confirmedText: { color: COLORS.available, fontSize: 11, fontWeight: 'bold' },
  reminderBox: {
    borderWidth: 1.5,
    borderColor: COLORS.reserved,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#FFF9F0',
  },
  reminderTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 6, color: COLORS.text },
  reminderText: { fontSize: 13, color: COLORS.text, lineHeight: 20 },
  bold: { fontWeight: 'bold' },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.occupied,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  cancelBtnText: { color: COLORS.occupied, fontWeight: 'bold', fontSize: 15 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  modalText: { fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  modalBtnKeep: { backgroundColor: COLORS.primary },
  modalBtnCancel: { borderWidth: 1, borderColor: COLORS.occupied },
  modalBtnKeepText: { color: COLORS.white, fontWeight: 'bold' },
  modalBtnCancelText: { color: COLORS.occupied, fontWeight: '600' },
});