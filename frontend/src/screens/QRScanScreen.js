import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS } from '../constants/colors';
import { checkInSeat } from '../services/api';

export default function QRScanScreen({ route, navigation }) {
  const { user, reservation } = route.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showResult, setShowResult] = useState(false);

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
    if (!scanned) {
      setScanned(true);
      try {
        // data from QR code will be the seatCode e.g. "GEA1"
        const result = await checkInSeat(data);
        if (result.error) {
          Alert.alert('Check-in Failed', result.error, [
            { text: 'Try Again', onPress: () => setScanned(false) },
          ]);
          return;
        }
        setShowResult(true);
      } catch (err) {
        Alert.alert('Error', 'Could not connect to server.');
        setScanned(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Camera */}
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        {/* Overlay frame */}
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.scanHint}>
            Point your camera at the QR code on your desk
          </Text>
        </View>
      </CameraView>

      {/* Result Modal */}
      <Modal transparent visible={showResult} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.modalTitle}>Check-in Successful!</Text>

            <View style={styles.infoBox}>
              <Text style={styles.seatText}>
                You are seated in{' '}
                <Text style={styles.bold}>
                  {reservation?.seatCode || 'GE1'} ({reservation?.floor || 'Ground'} floor)
                </Text>
              </Text>
              <Text style={styles.timeText}>
                Your reservation time till{' '}
                <Text style={styles.bold}>{reservation?.end || '03:00 PM'}</Text>
              </Text>
              <Text style={styles.extendText}>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { color: COLORS.white, fontSize: 16 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  permissionText: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
  },
  permissionBtnText: { color: COLORS.white, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  successIcon: { fontSize: 48, marginBottom: 8 },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  seatText: { fontSize: 15, color: COLORS.text, marginBottom: 8 },
  timeText: { fontSize: 15, color: COLORS.text, marginBottom: 8 },
  extendText: { fontSize: 13, color: COLORS.textLight, fontStyle: 'italic' },
  bold: { fontWeight: 'bold', color: COLORS.primary },
  doneBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});