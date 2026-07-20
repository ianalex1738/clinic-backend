import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    specialization: { type: String, required: true },
    experience:     { type: Number, required: true, min: 0 },
    email:          { type: String, required: true, unique: true, lowercase: true },
    available:      { type: Boolean, default: true },
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);
