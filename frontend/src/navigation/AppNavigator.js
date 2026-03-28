import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SeatDetailScreen from '../screens/SeatDetailScreen';
import QRScanScreen from '../screens/QRScanScreen';
import MyBookingScreen from '../screens/MyBookingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ReservationScreen from '../screens/ReservationScreen.js';
import ProfileScreen from '../screens/ProfileScreen.js';
import AdminDashboard from '../screens/AdminDashboard';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SeatDetail" component={SeatDetailScreen} />
        <Stack.Screen name="QRScan" component={QRScanScreen} />
        <Stack.Screen name="MyBooking" component={MyBookingScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Reservation" component={ReservationScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Admin" component={AdminDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}