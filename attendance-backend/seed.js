const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Attendance = require('./models/Attendance');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await Attendance.deleteMany();

  console.log('✅ Old data removed');

  // Create users
  const password = await bcrypt.hash('123456', 10);

  const users = await User.insertMany([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password,
      role: 'admin'
    },
    {
      name: 'Alice Employee',
      email: 'alice@example.com',
      password,
      role: 'employee'
    },
    {
      name: 'Bob Employee',
      email: 'bob@example.com',
      password,
      role: 'employee'
    }
  ]);

  console.log('✅ Users created');

  const [admin, alice, bob] = users;

  // Create attendance records for Alice and Bob
  await Attendance.insertMany([
    {
      userId: alice._id,
      date: '2025-06-17',
      checkIn: '09:01',
      checkOut: '17:05'
    },
    {
      userId: alice._id,
      date: '2025-06-18',
      checkIn: '09:00',
      checkOut: '17:00'
    },
    {
      userId: bob._id,
      date: '2025-06-18',
      checkIn: '09:10',
      checkOut: '17:20'
    }
  ]);

  console.log('✅ Attendance records created');

  process.exit();
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
