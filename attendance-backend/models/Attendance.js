const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: String,
  checkIn: String,
  checkOut: String
});

module.exports = mongoose.model('Attendance', attendanceSchema);
