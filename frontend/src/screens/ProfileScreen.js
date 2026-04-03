import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { getUserReservation, getUser, removeToken, removeUser, deleteAccount } from '../services/api';

export default function ProfileScreen({ route, navigation }) {
  const user = route.params?.user || {};
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservation();
  }, []);

  const loadReservation = async () => {
    setLoading(true);
    try {
      const result = await getUserReservation();
      setReservation(result?.reservation || null);
    } catch (err) {
      setReservation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await removeToken();
    await removeUser();
    navigation.replace('Login');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteAccount();
              if (result.error) {
                Alert.alert('Error', result.error);
                return;
              }
              await removeToken();
              await removeUser();
              Alert.alert('Deleted', 'Your account has been deleted.', [
                { text: 'OK', onPress: () => navigation.replace('Login') },
              ]);
            } catch (err) {
              Alert.alert('Error', 'Could not delete account. Try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Student'}</Text>
          <Text style={styles.regNumber}>{user?.regNumber || ''}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>

          <View style={[
            styles.penaltyBadge,
            { backgroundColor: (user?.penalties || 0) > 0 ? '#FFF3E0' : '#E8F5E9' }
          ]}>
            <Text style={[
              styles.penaltyText,
              { color: (user?.penalties || 0) > 0 ? COLORS.reserved : COLORS.available }
            ]}>
              ⚠️ Penalties: {user?.penalties || 0} / 5
            </Text>
          </View>
        </View>

        {/* Current Reservation */}
        <Text style={styles.sectionTitle}>Current Reservation</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : reservation ? (
          <TouchableOpacity
            style={styles.reservationCard}
            onPress={() => navigation.navigate('SeatDetail', { reservation, user })}
          >
            <View style={styles.reservationLeft}>
              <Text style={styles.reservationSeat}>Seat {reservation.seatCode}</Text>
              <Text style={styles.reservationFloor}>{reservation.floor} Floor</Text>
              <Text style={styles.reservationTime}>
                {reservation.startTime} – {reservation.endTime}
              </Text>
            </View>
            <View style={styles.reservationRight}>
              <View style={styles.confirmedBadge}>
                <Text style={styles.confirmedText}>
                  {reservation.status?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.viewDetail}>View →</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No active reservation</Text>
            <Text style={styles.emptySubtext}>
              Go to the seat map to reserve a seat
            </Text>
            <TouchableOpacity
              style={styles.goHomeBtn}
              onPress={() => navigation.navigate('Home', { user })}
            >
              <Text style={styles.goHomeBtnText}>View Seat Map</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* QR Scan Button - only show if has reservation */}
        {reservation && (
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => navigation.navigate('QRScan', { user, reservation })}
          >
            <Text style={styles.qrBtnText}>📷 Scan QR to Check In</Text>
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>

      </ScrollView>
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
  profileCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 20, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primary, justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: COLORS.white, fontSize: 30, fontWeight: 'bold' },
  name: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  regNumber: { fontSize: 14, color: COLORS.primary, marginTop: 4 },
  email: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  penaltyBadge: {
    marginTop: 12, paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20,
  },
  penaltyText: { fontWeight: '600', fontSize: 13 },
  sectionTitle: {
    fontSize: 17, fontWeight: 'bold',
    color: COLORS.text, marginBottom: 10,
  },
  reservationCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    borderLeftWidth: 4, borderLeftColor: COLORS.primary,
  },
  reservationLeft: { flex: 1 },
  reservationSeat: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  reservationFloor: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  reservationTime: { fontSize: 14, color: COLORS.primary, marginTop: 4, fontWeight: '600' },
  reservationRight: { alignItems: 'flex-end' },
  confirmedBadge: {
    backgroundColor: '#E8F5E9', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 10,
  },
  confirmedText: { color: COLORS.available, fontSize: 11, fontWeight: 'bold' },
  viewDetail: { color: COLORS.primary, marginTop: 8, fontSize: 13 },
  emptyBox: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 32,
    alignItems: 'center', marginBottom: 16, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptySubtext: { color: COLORS.textLight, fontSize: 13, textAlign: 'center', marginBottom: 16 },
  goHomeBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  goHomeBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  qrBtn: {
    backgroundColor: COLORS.primaryDark, borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  qrBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  logoutBtn: {
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 30,
  },
  logoutText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },

  deleteBtn: {
  borderWidth: 1.5,
  borderColor: COLORS.occupied,
  borderRadius: 10,
  padding: 14,
  alignItems: 'center',
  marginBottom: 30,
},
deleteBtnText: {
  color: COLORS.occupied,
  fontWeight: 'bold',
  fontSize: 15,
},
});