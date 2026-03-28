const { db } = require('../firebase');

exports.checkIn = async (req, res) => {
  try {
    const { seatCode } = req.body;
    const userId = req.user.userId;

    // Find active reservation for this user and seat
    const snapshot = await db.collection('reservations')
      .where('userId', '==', userId)
      .where('seatCode', '==', seatCode)
      .where('status', '==', 'confirmed')
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: 'No confirmed reservation found for this seat.',
      });
    }

    const resDoc = snapshot.docs[0];
    const resData = resDoc.data();
    const now = new Date();

    // Check 30 min window
    const [time, modifier] = resData.startTime.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
    if (modifier === 'AM' && hours === '12') hours = '00';

    const reservationStart = new Date();
    reservationStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const deadline = new Date(reservationStart.getTime() + 30 * 60 * 1000);

    if (now > deadline) {
      return res.status(400).json({
        error: 'Check-in window has expired (30 minutes after reservation time).',
      });
    }

    // Mark reservation as checked-in
    await db.collection('reservations').doc(resDoc.id).update({
      status: 'checked-in',
      checkedInAt: now.toISOString(),
    });

    // Mark seat as occupied (RED - only happens after QR scan)
    await db.collection('seats').doc(resData.seatId).update({
      status: 'occupied',
      occupiedUntil: resData.endTime,
    });

    return res.json({
      message: 'Check-in successful!',
      reservation: {
        seatCode: resData.seatCode,
        floor: resData.floor,
        startTime: resData.startTime,
        endTime: resData.endTime,
      },
    });
  } catch (err) {
    console.error('Checkin error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};