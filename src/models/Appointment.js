import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    doctor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date:     { type: String, required: true },
    timeSlot: { type: String, required: true },
    reason:   { type: String, default: 'Not specified' },
    status:   { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  },
  { timestamps: true }
);

appointmentSchema.index(
  { doctor: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

export default mongoose.model('Appointment', appointmentSchema);
