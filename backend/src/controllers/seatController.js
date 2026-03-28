const { db } = require('../firebase');

// Seed all seats into Firestore (run once)
exports.seedSeats = async (req, res) => {
  try {
    const floors = [
      { name: 'Ground', code: 'GE' },
      { name: 'First', code: 'F1' },
      { name: 'Second', code: 'F2' },
    ];
    const cols = ['A', 'B', 'C', 'D', 'E'];
    const rows = [1, 2, 3, 4, 5, 6];

    const batch = db.batch();

    floors.forEach(floor => {
      rows.forEach(row => {
        cols.forEach(col => {
          const seatCode = `${floor.code}${col}${row}`;
          const ref = db.collection('seats').doc(seatCode);
          batch.set(ref, {
            seatCode,
            floor: floor.name,
            floorCode: floor.code,
            col,
            row,
            status: 'available',
            occupiedUntil: null,
            currentReservationId: null,
          });
        });
      });
    });

    await batch.commit();
    return res.json({ message: 'All seats seeded successfully!' });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ error: 'Seed failed' });
  }
};

// Get all seats
exports.getAllSeats = async (req, res) => {
  try {
    const snapshot = await db.collection('seats').get();
    const seats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(seats);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch seats' });
  }
};

// Get seats by floor
exports.getSeatsByFloor = async (req, res) => {
  try {
    const { floor } = req.params;
    const snapshot = await db.collection('seats')
      .where('floor', '==', floor)
      .get();
    const seats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(seats);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch seats' });
  }
};