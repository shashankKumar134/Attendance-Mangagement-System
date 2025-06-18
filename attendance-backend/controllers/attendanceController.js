const Attendance = require('../models/Attendance');
const moment = require('moment'); // for date handling

// Check-In
const checkIn = async (req, res) => {
  try {
    const { id: userId } = req.user; // safer destructuring
    const date = moment().format('YYYY-MM-DD');
    const time = moment().format('HH:mm');

    const existing = await Attendance.findOne({ userId, date });
    if (existing) return res.status(400).json({ message: 'Already checked in today' });

    const record = new Attendance({ userId, date, checkIn: time });
    await record.save();

    res.status(200).json({ message: 'Checked in successfully', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Check-Out
const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = moment().format('YYYY-MM-DD');
    const time = moment().format('HH:mm');

    const record = await Attendance.findOne({ userId, date });
    if (!record) return res.status(404).json({ message: 'Check-in record not found' });

    if (record.checkOut) return res.status(400).json({ message: 'Already checked out' });

    record.checkOut = time;
    await record.save();

    res.status(200).json({ message: 'Checked out successfully', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user's attendance history
const getMyAttendance = async (req, res) => {
  try {
    const targetUserId = req.user.role === 'admin' && req.query.userId
      ? req.query.userId
      : req.user.id;

    const records = await Attendance.find({ userId: targetUserId }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Admin: Get all records
const getAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const records = await Attendance.find().populate('userId', 'name email').sort({ date: -1 });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance
};
