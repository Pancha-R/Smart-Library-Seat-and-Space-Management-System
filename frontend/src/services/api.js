// Generate seats as a grid: rows 1-6, columns A-E per floor
const generateFloorSeats = (floor, floorCode, statusOverrides = {}) => {
  const rows = [1, 2, 3, 4, 5, 6];
  const cols = ['E', 'D', 'C', 'B', 'A'];
  const seats = [];
  rows.forEach(row => {
    cols.forEach(col => {
      const id = `${floorCode}${col}${row}`;
      const override = statusOverrides[id] || {};
      seats.push({
        id,
        seatCode: `${floorCode}${col}${row}`,
        col,
        row,
        floor,
        floorCode,
        status: override.status || 'available',
        occupiedUntil: override.occupiedUntil || null,
        reservations: override.reservations || [],
      });
    });
  });
  return seats;
};

export const mockSeats = [
  ...generateFloorSeats('Ground', 'GE', {
    'GEC2': { status: 'occupied', occupiedUntil: '01:00 PM' },
    'GEB3': { status: 'occupied', occupiedUntil: '02:00 PM' },
    'GEA1': { status: 'occupied', occupiedUntil: '12:00 PM' },
    'GED4': { status: 'reserved', reservations: [{ start: '10:00 AM', end: '12:00 PM' }] },
    'GEC5': { status: 'reserved', reservations: [{ start: '01:00 PM', end: '03:00 PM' }] },
    'GEE6': { status: 'reserved', reservations: [{ start: '09:00 AM', end: '11:00 AM' }] },
    'GEB1': { status: 'reserved', reservations: [{ start: '02:00 PM', end: '04:00 PM' }] },
  }),
  ...generateFloorSeats('First', 'F1', {
    'F1C1': { status: 'occupied', occupiedUntil: '03:00 PM' },
    'F1A3': { status: 'reserved', reservations: [{ start: '11:00 AM', end: '01:00 PM' }] },
  }),
  ...generateFloorSeats('Second', 'F2', {}),
];

export const mockUser = {
  name: 'L.R.P.P. Rajasekara',
  email: 'rajasekara@sjp.ac.lk',
  regNumber: 'AS2022953',
  penalties: 1,
  isBanned: false,
  currentReservation: {
    seatCode: 'GE1',
    floor: 'Ground',
    start: '01:30 PM',
    end: '03:00 PM',
    status: 'confirmed',
  },
};