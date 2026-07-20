import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User        from './models/User.js';
import Doctor      from './models/Doctor.js';
import Appointment from './models/Appointment.js';

const today = new Date();
const fmt   = (d) => d.toISOString().split('T')[0];
const d1    = new Date(today); d1.setDate(today.getDate() + 1);
const d2    = new Date(today); d2.setDate(today.getDate() + 2);

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing data');

  const doctors = await Doctor.insertMany([
    { name: 'Dr. Amara Osei',     specialization: 'General Practice', experience: 8,  email: 'amara.osei@lianas.co.ke'    },
    { name: 'Dr. Fatuma Njoroge', specialization: 'Cardiology',        experience: 12, email: 'fatuma.njoroge@lianas.co.ke' },
    { name: 'Dr. Brian Kamau',    specialization: 'Dermatology',       experience: 5,  email: 'brian.kamau@lianas.co.ke'   },
    { name: 'Dr. Grace Wanjiku',  specialization: 'Pediatrics',        experience: 10, email: 'grace.wanjiku@lianas.co.ke' },
    { name: 'Dr. Kevin Mwangi',   specialization: 'Orthopedics',       experience: 7,  email: 'kevin.mwangi@lianas.co.ke'  },
  ]);
  console.log(`✅ Created ${doctors.length} doctors`);

  const [patient, docUser] = await Promise.all([
    User.create({ name: 'Ian Odhiambo',       email: 'ian@patient.com',             password: 'patient123', role: 'patient' }),
    User.create({ name: 'Dr. Amara Osei',     email: 'amara.osei@lianas.co.ke',     password: 'doctor123',  role: 'doctor', doctorId: doctors[0]._id }),
    User.create({ name: 'Dr. Fatuma Njoroge', email: 'fatuma.njoroge@lianas.co.ke', password: 'doctor123',  role: 'doctor', doctorId: doctors[1]._id }),
    User.create({ name: 'Admin User',         email: 'admin@lianas.co.ke',          password: 'admin123',   role: 'admin'  }),
  ]);
  console.log('✅ Created 4 users');

  await Doctor.findByIdAndUpdate(doctors[0]._id, { userId: docUser._id });

  await Appointment.insertMany([
    { patient: patient._id, doctor: doctors[0]._id, date: fmt(d1),    timeSlot: '09:00', reason: 'Annual checkup',     status: 'scheduled' },
    { patient: patient._id, doctor: doctors[1]._id, date: fmt(d2),    timeSlot: '10:30', reason: 'Heart palpitations', status: 'scheduled' },
    { patient: patient._id, doctor: doctors[2]._id, date: fmt(today), timeSlot: '08:00', reason: 'Skin rash',          status: 'completed' },
  ]);
  console.log('✅ Created 3 sample appointments');

  console.log('\n🎉 Seed complete! Login credentials:');
  console.log('   Patient: ian@patient.com              / patient123');
  console.log('   Doctor:  amara.osei@lianas.co.ke      / doctor123');
  console.log('   Admin:   admin@lianas.co.ke            / admin123');

  mongoose.connection.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
