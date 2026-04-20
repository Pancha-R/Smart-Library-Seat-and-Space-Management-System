import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';


// Auth 
export const registerUser = async (name, email, regNumber, password) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, regNumber, password }),
  });
  return res.json();
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};


// Delete Acc
export const deleteAccount = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/auth/delete`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};


// Token helpers
export const saveToken = async (token) => {
  await AsyncStorage.setItem('token', token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const removeToken = async () => {
  await AsyncStorage.removeItem('token');
};

export const saveUser = async (user) => {
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

export const getUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = async () => {
  await AsyncStorage.removeItem('user');
};


// Seats 
export const fetchSeats = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/seats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};


// Reservations 
export const createReservation = async (data) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const cancelReservation = async (reservationId) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/reservations/${reservationId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getUserReservation = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/reservations/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};


// Check-in 
export const checkInSeat = async (seatCode) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ seatCode }),
  });
  return res.json();
};


// Admin 
export const getAdminOverview = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};