import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  service: {
    type: String,
    required: [true, 'Please select a service'],
  },
  date: {
    type: Date,
    required: [true, 'Please select a date'],
  },
  time: {
    type: String,
    required: [true, 'Please select a time'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
