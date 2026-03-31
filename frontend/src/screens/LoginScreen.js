import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView,
  Platform, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { loginUser, saveToken, saveUser, getUserReservation } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both Email and Password');
      return;
    }
    setLoading(true);
    try {
      const result = await loginUser(email.trim(), password.trim());
      if (result.error) {
        Alert.alert('Login Failed', result.error);
        return;
      }
      // Save token and user
      await saveToken(result.token);
      await saveUser(result.user);

      // Check if user has active reservation
      const resResult = await getUserReservation();

      if (resResult.reservation) {
        // Has active booking → go to Profile
        navigation.replace('Profile', {
          user: result.user,
          reservation: resResult.reservation,
        });
      } else {
        // No booking → go to Home
        navigation.replace('Home', { user: result.user });
      }
    } catch (err) {
      Alert.alert('Error', 'Cannot connect to server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.logoBox}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Library Seat Management Service</Text>
          <Text style={styles.university}>University of Sri Jayawardenepura</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student-Sign In</Text>
          <Text style={styles.cardSubtitle}>Enter your email and password to login</Text>

          <Text style={styles.label}>✉  Email</Text>
          <TextInput
            style={styles.input}
            placeholder="as2022953@sjp.ac.lk"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>🔒  Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.buttonText}>SIGN IN</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoBox: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 130, height: 130, marginBottom: 10 },
  appName: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  university: { fontSize: 13, color: COLORS.text, textAlign: 'center', marginTop: 2 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 24,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: COLORS.textLight, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 0, borderRadius: 8, padding: 12,
    fontSize: 15, backgroundColor: '#F0F0F0',
  },
  button: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    padding: 16, alignItems: 'center', marginTop: 28,
  },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: COLORS.text, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold' },
});