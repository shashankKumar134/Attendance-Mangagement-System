const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker'); // ✅ modern faker

dotenv.config();

const User = require('./models/User');
const Attendance = require('./models/Attendance');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  await User.deleteMany();
  await Attendance.deleteMany();

  console.log('✅ Cleared previous data');

  // Password hash for all users
  const password = await bcrypt.hash('123456', 10);

  // Create Admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password,
    role: 'admin'
  });

  // Create 2 known employees
  const testEmp1 = await User.create({
    name: 'Alice Tester',
    email: 'alice@example.com',
    password,
    role: 'employee'
  });

  const testEmp2 = await User.create({
    name: 'Bob Developer',
    email: 'bob@example.com',
    password,
    role: 'employee'
  });

  const employees = [testEmp1, testEmp2];

  // Create 18 more fake employees
  for (let i = 1; i <= 18; i++) {
    const name = faker.person.fullName(); // ✅ fixed
    const email = `user${i}@example.com`;

    const user = await User.create({
      name,
      email,
      password,
      role: 'employee'
    });

    employees.push(user);
  }

  console.log('✅ Created 1 admin and 20 employees');

  // Create attendance for each employee
  const today = new Date();
  for (const user of employees) {
    const numDays = Math.floor(Math.random() * 6) + 5; // 5 to 10 records

    for (let i = 0; i < numDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const formattedDate = date.toISOString().split('T')[0];

      const checkInHour = 9 + Math.floor(Math.random() * 2); // 9-10 AM
      const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM

      const checkIn = `${checkInHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
      const checkOut = `${checkOutHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;

      await Attendance.create({
        userId: user._id,
        date: formattedDate,
        checkIn,
        checkOut
      });
    }
  }

  console.log('✅ Created attendance records');
  console.log('\n🔐 Test Users:\n');
  console.log('Admin:    admin@example.com / 123456');
  console.log('Employee: alice@example.com / 123456');
  console.log('Employee: bob@example.com   / 123456');
  console.log('\n✅ Seeding complete!\n');

  process.exit();
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});

