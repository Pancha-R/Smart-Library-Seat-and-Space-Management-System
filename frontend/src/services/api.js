// This will connect to your backend later
// For now it returns mock data so screens work

export const mockSeats = Array.from({ length: 30 }, (_, i) => ({
  id: `SEAT-${String(i + 1).padStart(3, '0')}`,
  number: i + 1,
  status: i % 5 === 0 ? 'reserved' : i % 3 === 0 ? 'occupied' : 'available',
  reservedBy: i % 5 === 0 ? 'AS2022001' : null,
  floor: i < 15 ? 1 : 2,
}));

export const loginUser = async (studentId, name) => {
  // Replace with real API call later
  return { success: true, user: { studentId, name } };
};