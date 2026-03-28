const { db } = require('../firebase');

exports.getOverview = async (req, res) => {
  try {
    const [seatsSnap, reservationsSnap, usersSnap] = await Promise.all([
      db.collection('seats').get(),
      db.collection('reservations').where('status', 'in', ['confirmed', 'checked-in']).get(),
      db.collection('users').get(),
    ]);

    const seats = seatsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const reservations = reservationsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return res.json({
      stats: {
        totalSeats: seats.length,
        available: seats.filter(s => s.status === 'available').length,
        occupied: seats.filter(s => s.status === 'occupied').length,
        reserved: seats.filter(s => s.status === 'reserved').length,
        totalUsers: users.length,
        bannedUsers: users.filter(u => u.isBanned).length,
        activeReservations: reservations.length,
      },
      seats,
      activeReservations: reservations,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};