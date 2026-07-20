import express     from 'express';
import Appointment from '../models/Appointment.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/appointments
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patient = req.user._id;
    else if (req.user.role === 'doctor') filter.doctor = req.user.doctorId;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor',  'name specialization')
      .sort({ date: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/appointments/booked-slots?doctorId=&date=
router.get('/booked-slots', protect, async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date)
      return res.status(400).json({ message: 'doctorId and date required' });
    const booked = await Appointment.find({
      doctor: doctorId, date, status: { $ne: 'cancelled' },
    }).select('timeSlot');
    res.json(booked.map(a => a.timeSlot));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/appointments
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;
    const conflict = await Appointment.findOne({
      doctor: doctorId, date, timeSlot, status: { $ne: 'cancelled' },
    });
    if (conflict)
      return res.status(409).json({ message: 'This time slot is already booked' });

    const appointment = await Appointment.create({
      patient: req.user._id, doctor: doctorId, date, timeSlot,
      reason: reason || 'Not specified',
    });

    const populated = await appointment.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor',  select: 'name specialization' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'This time slot is already booked' });
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['scheduled', 'completed', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Invalid status value' });

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'patient') {
      if (appt.patient.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Not your appointment' });
      if (status !== 'cancelled')
        return res.status(403).json({ message: 'Patients can only cancel' });
    }

    appt.status = status;
    await appt.save();

    const populated = await appt.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor',  select: 'name specialization' },
    ]);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/appointments/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
