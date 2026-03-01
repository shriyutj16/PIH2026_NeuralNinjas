🛡 AI Scam & Fraud Shield
Real-Time AI-Powered Digital Fraud Prevention Platform

🚀 Proactive fraud prevention using Multimodal AI + Behavioral Risk Scoring

🌍 Live Demo

🔗 Frontend: https://pih-2026-neural-ninjas.vercel.app

🔗 Backend API: https://ai-scam-fraud-shield-backend.onrender.com

🚀 Overview

AI Scam & Fraud Shield is a full-stack AI-powered fraud prevention platform built to detect and prevent digital payment scams before financial damage occurs.

Unlike traditional fraud systems that act after the loss, our solution:

Detects scam patterns in real-time

Analyzes suspicious screenshots

Evaluates behavioral transaction risks

Generates a dynamic Fraud Risk Score

Warns users instantly

This shifts fraud management from reactive detection → proactive prevention.


🎯 Problem Statement

With the exponential growth of:

-UPI transactions

-Online banking

-Digital wallets

-QR payments

-Cyber fraud cases (phishing, smishing, fake payment pages, scam screenshots) are increasing rapidly.

Most systems:

❌ Register complaints after fraud
❌ Provide no real-time prevention

Our solution focuses on:

✅ Real-time detection
✅ Instant risk scoring
✅ User-level fraud prevention

💡 Core Features
🔍 AI-Based SMS Scam Detection

Gemini AI powered text analysis

Detects phishing & smishing patterns

Provides scam probability %

Explains why message is risky

🖼 Image Fraud Analysis (Multimodal AI)

Upload suspicious screenshots

Detect fake UPI pages

Identify QR fraud layouts

Analyze visual scam indicators

📊 Behavioral Risk Scoring Engine

Transaction simulator

Rule-based fraud engine

Evaluates:

Transaction amount

Frequency

Time-of-day anomalies

Generates dynamic Fraud Risk Score

📈 Security Dashboard

Total scans

Flagged threats

Risk trend tracking

Searchable fraud history

Admin analytics panel

🔐 Secure Authentication

JWT-based authentication

Password hashing with bcrypt

Role-based access control (Admin/User)

Secure token verification

🧠 Risk Score Formula (MVP)
Risk Score =
(Text Scam Probability × 0.5) +
(Transaction Risk × 0.3) +
(Image Fraud Probability × 0.2)
Score Range	Risk Level
0–39	Low Risk
40–69	Medium Risk
70+	High Risk


🏗 Tech Stack
Frontend:

React

Tailwind CSS

Framer Motion

Lucide Icons

Axios


Backend:

Node.js

Express.js

JWT Authentication

bcryptjs

CORS

Multer


Database:

MongoDB Atlas (Production)

SQLite (MVP portability)


AI Integration:

Google Gemini API

Text analysis

Multimodal image analysis


🧠 System Architecture
User
   ↓
React Frontend (Vercel)
   ↓
Express Backend (Render)
   ↓
• Gemini AI (Text + Image)
• Behavioral Risk Engine
   ↓
MongoDB Atlas
   ↓
Dashboard + Risk Insights

🛠 Local Installation:

1️⃣ Clone Repository
git clone https://github.com/shriyutj16/PIH2026_NeuralNinjas.git
cd PIH2026_NeuralNinjas

2️⃣ Install Dependencies
npm install

3️⃣ Configure Environment Variables

Create a .env file:

GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secure_secret
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
CLIENT_URL=http://localhost:5173

4️⃣ Run Application
npm run dev

🌍 Production Deployment
Frontend → Vercel
Backend → Render
Database → MongoDB Atlas

Environment variables are configured securely on cloud platforms.

🔐 Security Best Practices

Environment variables excluded via .gitignore

JWT secure authentication

bcrypt password hashing

CORS origin restriction

Token-based route protection

Role-based authorization

📊 Real-World Impact

Prevent financial loss before it occurs

Reduce phishing success rates

Assist users in identifying fake payment interfaces

Enhance digital payment safety

Scalable to banking-grade infrastructure

🌟 Future Scope

Direct UPI API integration

Browser extension for link scanning

Real-time bank transaction monitoring

AI fine-tuning with fraud datasets

Bank & fintech integration APIs

Mobile application version

Enterprise fraud analytics dashboard

🏆 Hackathon Value Proposition

✔ Proactive fraud prevention
✔ Multimodal AI integration
✔ Hybrid AI + rule-based risk scoring
✔ Real-time scoring engine
✔ Cloud-deployed scalable architecture
✔ Production-ready authentication system

👥 Team

Neural Ninjas 🚀
PIH 2026 Hackathon
