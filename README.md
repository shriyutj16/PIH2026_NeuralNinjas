🛡 AI Scam & Fraud Shield
Real-Time Digital Payment Fraud Prevention Platform
🚀 Overview

AI Scam & Fraud Shield is a full-stack AI-powered web application designed to proactively detect and prevent digital fraud before financial loss occurs.

Unlike traditional fraud systems that act after damage is done, our platform uses multimodal AI + behavioral risk scoring to generate a real-time Fraud Risk Score and warn users instantly.

🎯 Problem Statement

With the rapid growth of digital payments (UPI, online banking, wallets), cyber fraud incidents such as phishing SMS, fake payment requests, scam calls, and fraudulent screenshots have increased significantly.

Most systems focus on post-fraud complaint registration instead of prevention.

AI Scam & Fraud Shield shifts fraud management from reactive detection to proactive prevention.

💡 Key Features
🔍 AI-Based SMS Scam Detection

Uses Gemini AI to detect phishing, smishing, and fraud patterns

Provides risk percentage and explanation

🖼 Image Fraud Analysis

Upload suspicious screenshots

Detect fake payment pages, QR scams, and fraudulent UI patterns

📊 Behavioral Risk Scoring

Transaction simulator

Rule-based risk engine (amount, frequency, time-of-day analysis)

Dynamic Fraud Risk Score generation

📈 Security Dashboard

Total scans

Flagged threats

Average risk levels

Searchable fraud history

🔐 Secure Authentication

JWT-based authentication

Password hashing using bcryptjs

Role-based access (Admin Panel)

🏗 Tech Stack
Frontend

React

Tailwind CSS

Lucide Icons

Framer Motion

Backend

Node.js

Express.js

JWT Authentication

bcryptjs

Database

SQLite (MVP portability)

Easily scalable to MongoDB Atlas

AI Integration

Google Gemini (Text + Multimodal Image Analysis)

🧠 Architecture

User → React Frontend → Express API →
• Gemini AI (Text & Image Analysis)
• Behavioral Risk Engine
→ SQLite Database → Dashboard

📊 Risk Score Formula (MVP)

Risk Score =
(Text Scam Probability × 0.5) +
(Transaction Risk × 0.3) +
(Image Fraud Probability × 0.2)

0–39 → Low Risk

40–69 → Medium Risk

70+ → High Risk

🛠 Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/shriyutj16/PIH2026_NeuralNinjas.git
cd PIH2026_NeuralNinjas
2️⃣ Install Dependencies
npm install
3️⃣ Configure Environment Variables

Create a .env file in root:

GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_super_secure_secret
4️⃣ Run the Application
npm run dev

The application will initialize the database automatically on first run.

👤 Admin Access

To access Admin Panel:

Manually update user role to admin in the database
OR

Modify default role in server.ts

🔐 Security Practices

Environment variables excluded via .gitignore

JWT-based authentication

Password hashing with bcrypt

Secure token verification

🌍 Future Scope

Direct UPI API integration

Browser extension for real-time link scanning

Real-time bank transaction monitoring

AI model fine-tuning with fraud datasets

Cloud deployment with MongoDB Atlas

🏆 Hackathon Value Proposition

Proactive fraud prevention

Multimodal AI detection

Hybrid AI + rule-based risk scoring

Scalable architecture

Real-world financial impact

👥 Team

Neural Ninjas 🚀
(PIH 2026 Hackathon)