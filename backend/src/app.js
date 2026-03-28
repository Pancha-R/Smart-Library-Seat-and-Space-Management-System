require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { startPenaltyJob } = require('./jobs/penaltyJob');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/seats', require('./routes/seats'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/checkin', require('./routes/checkin'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Smart Library API running ✅' }));

// Start penalty job
startPenaltyJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});