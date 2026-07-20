import express from 'express';
import Doctor  from '../models/Doctor.js';
import User    from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/doctors
router.get('/', protect, async (req, res) => {
  try {
    const doctors = await Doctor.find({ available: true }).sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/doctors/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/doctors — admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, specialization, experience, email, password } = req.body;
    if (!name || !specialization || !email)
      return res.status(400).json({ message: 'Name, specialization and email required' });

    // Create login account for the doctor
    const user = await User.create({
      name,
      email,
      password: password || 'doctor123',
      role: 'doctor',
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      name, specialization, experience, email, userId: user._id,
    });

    // Link account to profile
    user.doctorId = doctor._id;
    await user.save();

    res.status(201).json(doctor);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Email already in use' });
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/doctors/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/doctors/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
