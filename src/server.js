import 'dotenv/config';
import express      from 'express';
import cors         from 'cors';
import { connectDB } from './config/db.js';
import authRoutes   from './routes/auth.js';
import doctorRoutes from './routes/doctors.js';
import apptRoutes   from './routes/appointments.js';

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', apptRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

app.use((req, res) => res.status(404).json({ message: `Route ${req.path} not found` }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
