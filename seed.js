require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Bed = require('./models/Bed');

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Patient.deleteMany({}), Bed.deleteMany({})]);

  const users = await User.create([
    { name: 'Demo Patient', email: 'patient@mediqueue.com', password: '123456', role: 'patient', phone: '9876543210' },
    { name: 'Dr. Riya Mehta', email: 'doctor@mediqueue.com', password: '123456', role: 'doctor', department: 'General Medicine' },
    { name: 'Demo Pharmacist', email: 'pharmacist@mediqueue.com', password: '123456', role: 'pharmacist' },
    { name: 'Demo Nurse', email: 'nurse@mediqueue.com', password: '123456', role: 'nurse' },
    { name: 'Hospital Admin', email: 'admin@mediqueue.com', password: '123456', role: 'admin' }
  ]);

  const patientUser = users.find(u => u.role === 'patient');
  await Patient.create({
    user: patientUser._id,
    patientId: 'PAT-100001',
    name: patientUser.name,
    email: patientUser.email,
    phone: patientUser.phone,
    bloodGroup: 'B+',
    allergies: ['Penicillin']
  });

  const beds = [];
  for (const ward of ['General Ward', 'ICU', 'Private', 'Emergency']) {
    for (let i = 1; i <= 5; i++) beds.push({ bedNumber: `${ward.slice(0, 2).toUpperCase()}-${String(i).padStart(2, '0')}`, ward });
  }
  await Bed.insertMany(beds);

  console.log('Seed complete. Demo login password for all users: 123456');
  console.log('Demo accounts: patient@mediqueue.com, doctor@mediqueue.com, pharmacist@mediqueue.com, nurse@mediqueue.com, admin@mediqueue.com');
  process.exit(0);
}

seed().catch(error => { console.error(error); process.exit(1); });
