/**
 * Database Seeder
 * Creates the initial admin user and sample data
 * Run with: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const FraudReport = require('./models/FraudReport');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/scam_fraud_shield');
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out to keep existing)
    await User.deleteMany({});
    await FraudReport.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@fraudshield.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      totalScans: 0,
      scamsDetected: 0
    });
    console.log(`👑 Admin created: ${admin.email}`);

    // Create a demo user
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@fraudshield.com',
      password: 'Demo@123',
      role: 'user',
      totalScans: 5,
      scamsDetected: 2
    });
    console.log(`👤 Demo user created: ${demoUser.email}`);

    // Create sample fraud reports for demo user
    const sampleReports = [
      {
        user: demoUser._id, type: 'text',
        inputData: { text: 'URGENT: Your bank account has been SUSPENDED! Click here: bit.ly/verify-now' },
        result: { label: 'SCAM', riskScore: 85, riskLevel: 'High', confidence: 92, patterns: ['urgency: urgent', 'identity: suspended account'], explanation: 'High risk scam detected' }
      },
      {
        user: demoUser._id, type: 'transaction',
        inputData: { transactionDetails: { amount: 9500, frequency: 12, timeOfDay: 'night', merchantCategory: 'crypto', location: 'international' } },
        result: { label: 'HIGH_RISK', riskScore: 91, riskLevel: 'High', confidence: 88, patterns: ['Very large amount', 'Cryptocurrency', 'Night time'], explanation: 'Multiple high-risk indicators' }
      },
      {
        user: demoUser._id, type: 'text',
        inputData: { text: 'Your Amazon order #123 has shipped. Track at amazon.com/track' },
        result: { label: 'NOT_SCAM', riskScore: 8, riskLevel: 'Low', confidence: 85, patterns: [], explanation: 'Appears legitimate' }
      }
    ];

    await FraudReport.insertMany(sampleReports);
    console.log('📊 Sample reports created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('\nDemo User Login:');
    console.log('  Email: demo@fraudshield.com');
    console.log('  Password: Demo@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
