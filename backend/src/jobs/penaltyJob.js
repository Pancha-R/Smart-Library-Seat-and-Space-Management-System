const cron = require('node-cron');
const { db } = require('../firebase');

// Runs every minute - checks for expired reservations
const startPenaltyJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const snapshot = await db.collection('reservations')
        .where('status', '==', 'confirmed')
        .get();

      for (const doc of snapshot.docs) {
        const res = doc.data();

        // Parse reservation start time
        const [time, modifier] = res.startTime.split(' ');
        let [hours, minutes] = time.split(':');
        if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
        if (modifier === 'AM' && hours === '12') hours = '00';

        const reservationStart = new Date();
        reservationStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // 30 min deadline
        const deadline = new Date(reservationStart.getTime() + 30 * 60 * 1000);

        if (now > deadline && !res.penaltyApplied) {
          console.log(`Penalty applying for reservation ${doc.id}`);

          // Apply penalty to user
          const userDoc = await db.collection('users').doc(res.userId).get();
          const userData = userDoc.data();
          const newPenalties = (userData.penalties || 0) + 1;
          const isBanned = newPenalties >= 5;

          await db.collection('users').doc(res.userId).update({
            penalties: newPenalties,
            isBanned,
            currentReservationId: null,
          });

          // Mark reservation as expired
          await db.collection('reservations').doc(doc.id).update({
            status: 'expired',
            penaltyApplied: true,
          });

          // Release seat back to available
          await db.collection('seats').doc(res.seatId).update({
            status: 'available',
            occupiedUntil: null,
            currentReservationId: null,
          });

          console.log(
            `Penalty applied to user ${res.userId}. Total: ${newPenalties}. Banned: ${isBanned}`
          );
        }
      }

      // Also release seats whose end time has passed
      const checkedInSnap = await db.collection('reservations')
        .where('status', '==', 'checked-in')
        .get();

      for (const doc of checkedInSnap.docs) {
        const res = doc.data();

        const [time, modifier] = res.endTime.split(' ');
        let [hours, minutes] = time.split(':');
        if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
        if (modifier === 'AM' && hours === '12') hours = '00';

        const endTime = new Date();
        endTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (now > endTime) {
          // Release seat
          await db.collection('seats').doc(res.seatId).update({
            status: 'available',
            occupiedUntil: null,
            currentReservationId: null,
          });

          await db.collection('reservations').doc(doc.id).update({
            status: 'completed',
          });

          await db.collection('users').doc(res.userId).update({
            currentReservationId: null,
          });

          console.log(`Seat ${res.seatCode} released after reservation ended.`);
        }
      }
    } catch (err) {
      console.error('Penalty job error:', err);
    }
  });

  console.log('✅ Penalty job started - checking every minute');
};

module.exports = { startPenaltyJob };