import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS } from '../constants/colors';
import { checkInSeat } from '../services/api';

// Convert "01:30 PM" to minutes since midnight
const timeToMinutes = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export default function QRScanScreen({ route, navigation }) {
  const { user, reservation } = route.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showEarlyModal, setShowEarlyModal] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(0);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionBox}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan QR codes.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);

    // Check if reservation exists
    if (!reservation) {
      Alert.alert(
        'No Reservation',
        'You do not have an active reservation. Please reserve a seat first.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    // Check if current time is before reservation start time
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = timeToMinutes(reservation.startTime);

    if (nowMinutes < startMinutes) {
      // Too early — show popup with time reminder
      const diff = startMinutes - nowMinutes;
      setMinutesLeft(diff);
      setShowEarlyModal(true);
      return;
    }

    // Check if scanned seat matches reserved seat
    if (data !== reservation.seatCode) {
      Alert.alert(
        '❌ Wrong Seat',
        `You scanned seat ${data} but your reservation is for seat ${reservation.seatCode}.\n\nPlease scan the correct QR code.`,
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
      return;
    }

    // All good — check in
    try {
      const result = await checkInSeat(data);
      if (result.error) {
        Alert.alert('Check-in Failed', result.error, [
          { text: 'Try Again', onPress: () => setScanned(false) },
        ]);
        return;
      }
      setShowResult(true);
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server.', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} hr ${m} min` : `${h} hour${h !== 1 ? 's' : ''}`;
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Reservation reminder bar */}
      {reservation && (
        <View style={styles.reservationBar}>
          <Text style={styles.reservationBarText}>
            📋 Seat {reservation.seatCode} · {reservation.startTime} – {reservation.endTime}
          </Text>
        </View>
      )}

      {/* Camera */}
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.scanHint}>
            Point your camera at the QR code on your desk
          </Text>
        </View>
      </CameraView>

      {/* MODAL 1: Too Early */}
      <Modal transparent visible={showEarlyModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalIcon}>⏰</Text>
            <Text style={styles.modalTitle}>Too Early to Check In</Text>
            <Text style={styles.modalText}>
              Your reservation for{' '}
              <Text style={styles.bold}>Seat {reservation?.seatCode}</Text>{' '}
              starts at{' '}
              <Text style={styles.bold}>{reservation?.startTime}</Text>.
            </Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeBoxLabel}>Time remaining</Text>
              <Text style={styles.timeBoxValue}>{formatTime(minutesLeft)}</Text>
            </View>
            <Text style={styles.modalSubtext}>
              Please come back at your reservation time. You have a 30-minute window to check in after your start time.
            </Text>
            <TouchableOpacity
              style={styles.okBtn}
              onPress={() => {
                setShowEarlyModal(false);
                setScanned(false);
              }}
            >
              <Text style={styles.okBtnText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Success */}
      <Modal transparent visible={showResult} animationType="slide">
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Check-in Successful!</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                You are seated in{' '}
                <Text style={styles.bold}>
                  {reservation?.seatCode} ({reservation?.floor} floor)
                </Text>
              </Text>
              <Text style={styles.infoText}>
                Your reservation time till{' '}
                <Text style={styles.bold}>{reservation?.endTime}</Text>
              </Text>
              <Text style={styles.infoSubtext}>
                If you want to extend your time please do the reservation again!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setShowResult(false);
                setScanned(false);
                navigation.navigate('Profile', { user, reservation });
              }}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  back: { color: COLORS.white, fontSize: 16 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  reservationBar: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  reservationBarText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: COLORS.white,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scanHint: {
    color: COLORS.white,
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  permissionBox: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 24,
    backgroundColor: COLORS.background,
  },
  permissionText: { fontSize: 15, color: COLORS.text, textAlign: 'center', marginBottom: 20 },
  permissionBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 10 },
  permissionBtnText: { color: COLORS.white, fontWeight: 'bold' },

  // Early modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 20, padding: 24, width: '100%', alignItems: 'center',
  },
  modalIcon: { fontSize: 48, marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  modalText: { fontSize: 14, color: COLORS.text, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  bold: { fontWeight: 'bold', color: COLORS.primary },
  timeBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12, padding: 16,
    alignItems: 'center', width: '100%', marginBottom: 16,
  },
  timeBoxLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 4 },
  timeBoxValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.reserved },
  modalSubtext: {
    fontSize: 12, color: COLORS.textLight,
    textAlign: 'center', lineHeight: 18, marginBottom: 20,
  },
  okBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    padding: 14, width: '100%', alignItems: 'center',
  },
  okBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },

  // Success modal
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  successModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, alignItems: 'center',
  },
  successIcon: { fontSize: 48, marginBottom: 8 },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  infoBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12, padding: 16,
    width: '100%', marginBottom: 20,
  },
  infoText: { fontSize: 15, color: COLORS.text, marginBottom: 8 },
  infoSubtext: { fontSize: 13, color: COLORS.textLight, fontStyle: 'italic' },
  doneBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    padding: 16, width: '100%', alignItems: 'center',
  },
  doneBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});