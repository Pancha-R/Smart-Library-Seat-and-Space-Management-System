const { db } = require('../firebase');

// Create reservation
exports.createReservation = async (req, res) => {
  try {
    const { seatId, seatCode, floor, startTime, endTime } = req.body;
    const userId = req.user.userId;

    // Check if user already has active reservation
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (userData.currentReservationId) {
      return res.status(400).json({
        error: 'You already have an active reservation. Cancel it first.',
      });
    }

    if (userData.isBanned) {
      return res.status(403).json({
        error: 'Your account is banned due to repeated penalties.',
      });
    }

    // Check seat is available
    const seatDoc = await db.collection('seats').doc(seatId).get();
    if (!seatDoc.exists) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    // Check for conflicting reservations on same seat
    const conflicts = await db.collection('reservations')
      .where('seatId', '==', seatId)
      .where('status', 'in', ['confirmed', 'checked-in'])
      .get();

    for (const doc of conflicts.docs) {
      const r = doc.data();
      const newStart = new Date(`1970-01-01T${convertTo24(startTime)}`);
      const newEnd = new Date(`1970-01-01T${convertTo24(endTime)}`);
      const exStart = new Date(`1970-01-01T${convertTo24(r.startTime)}`);
      const exEnd = new Date(`1970-01-01T${convertTo24(r.endTime)}`);

      if (newStart < exEnd && newEnd > exStart) {
        return res.status(400).json({
          error: `Seat already reserved from ${r.startTime} to ${r.endTime}`,
        });
      }
    }

    // Create reservation
    const reservationRef = await db.collection('reservations').add({
      userId,
      seatId,
      seatCode,
      floor,
      startTime,
      endTime,
      status: 'confirmed',
      checkedInAt: null,
      penaltyApplied: false,
      createdAt: new Date().toISOString(),
    });

    // Update seat status to reserved
    await db.collection('seats').doc(seatId).update({
      status: 'reserved',
      currentReservationId: reservationRef.id,
    });

    // Update user's current reservation
    await db.collection('users').doc(userId).update({
      currentReservationId: reservationRef.id,
    });

    return res.status(201).json({
      message: 'Reservation confirmed!',
      reservationId: reservationRef.id,
      reservation: {
        id: reservationRef.id,
        seatCode,
        floor,
        startTime,
        endTime,
        status: 'confirmed',
      },
    });
  } catch (err) {
    console.error('Reservation error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Cancel reservation
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const resDoc = await db.collection('reservations').doc(id).get();
    if (!resDoc.exists) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const resData = resDoc.data();
    if (resData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Cancel reservation
    await db.collection('reservations').doc(id).update({
      status: 'cancelled',
    });

    // Release seat back to available
    await db.collection('seats').doc(resData.seatId).update({
      status: 'available',
      occupiedUntil: null,
      currentReservationId: null,
    });

    // Clear user's current reservation
    await db.collection('users').doc(userId).update({
      currentReservationId: null,
    });

    return res.json({ message: 'Reservation cancelled. Seat released.' });
  } catch (err) {
    console.error('Cancel error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get user's active reservation
exports.getUserReservation = async (req, res) => {
  try {
    const userId = req.user.userId;

    const snapshot = await db.collection('reservations')
      .where('userId', '==', userId)
      .where('status', 'in', ['confirmed', 'checked-in'])
      .get();

    if (snapshot.empty) {
      return res.json({ reservation: null });
    }

    const doc = snapshot.docs[0];
    return res.json({
      reservation: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Helper: convert "01:30 PM" to "13:30"
function convertTo24(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
  if (modifier === 'AM' && hours === '12') hours = '00';
  return `${hours}:${minutes}`;
}