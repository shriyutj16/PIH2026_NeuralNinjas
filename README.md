# 🛡️ AI Scam & Fraud Shield

A full-stack MERN application for detecting scams, fraud, and suspicious transactions using AI-powered analysis.

---

## 📁 Project Structure

```
ai-scam-fraud-shield/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # JWT auth (login/register)
│   │   ├── detectionController.js   # Text + image analysis
│   │   ├── transactionController.js # Transaction risk scoring
│   │   ├── reportsController.js     # Fraud history & stats
│   │   └── adminController.js       # Admin panel APIs
│   ├── middleware/
│   │   ├── auth.js                  # JWT protect + adminOnly
│   │   └── upload.js                # Multer file upload
│   ├── models/
│   │   ├── User.js                  # Users collection
│   │   ├── FraudReport.js           # FraudReports collection
│   │   └── Transaction.js           # Transactions collection
│   ├── routes/
│   │   ├── auth.js                  # /api/auth
│   │   ├── detection.js             # /api/detection
│   │   ├── transactions.js          # /api/transactions
│   │   ├── reports.js               # /api/reports
│   │   └── admin.js                 # /api/admin
│   ├── utils/
│   │   ├── scamClassifier.js        # NLP/TF-IDF AI Module
│   │   └── transactionRiskScorer.js # Rule-based risk engine
│   ├── uploads/                     # Screenshot storage
│   ├── server.js                    # Express entry point
│   ├── seed.js                      # DB seeder
│   ├── .env.example                 # Environment template
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── auth/
        │   │   ├── LoginPage.js     # Login form
        │   │   └── RegisterPage.js  # Registration form
        │   ├── dashboard/
        │   │   ├── Layout.js        # Sidebar + nav wrapper
        │   │   ├── Dashboard.js     # Main dashboard with charts
        │   │   └── FraudHistory.js  # Paginated history table
        │   ├── detection/
        │   │   ├── RiskResult.js    # Reusable risk score display
        │   │   ├── TextDetection.js # SMS/text analysis
        │   │   ├── ImageDetection.js # Screenshot upload
        │   │   └── TransactionDetection.js # Transaction form
        │   └── admin/
        │       └── AdminPanel.js    # Admin overview + user mgmt
        ├── context/
        │   └── AuthContext.js       # JWT auth global state
        ├── styles/
        │   └── global.css           # Dark theme design system
        ├── App.js                   # Router + protected routes
        └── index.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm / yarn

### 1. Clone and Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/scam_fraud_shield
JWT_SECRET=your_secret_key_here
ADMIN_EMAIL=admin@fraudshield.com
ADMIN_PASSWORD=Admin@123
```

### 3. Seed the Database

```bash
cd backend
node seed.js
```

### 4. Start the Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev       # or: node server.js

# Terminal 2 - Frontend
cd frontend
npm start
```

- Backend runs at: http://localhost:5000
- Frontend runs at: http://localhost:3000

---

## 🔑 Login Credentials (After Seeding)

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@fraudshield.com    | Admin@123  |
| User  | demo@fraudshield.com     | Demo@123   |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/register | Register new user  |
| POST   | /api/auth/login    | Login              |
| GET    | /api/auth/me       | Get current user   |

### Detection
| Method | Endpoint                 | Description              |
|--------|--------------------------|--------------------------|
| POST   | /api/detection/text      | Analyze text for scams   |
| POST   | /api/detection/image     | Upload + analyze image   |

### Transactions
| Method | Endpoint                    | Description          |
|--------|----------------------------|----------------------|
| POST   | /api/transactions/analyze  | Score transaction risk |
| GET    | /api/transactions           | Get transaction history|

### Reports
| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| GET    | /api/reports         | Get fraud history      |
| GET    | /api/reports/stats   | Dashboard statistics   |
| GET    | /api/reports/:id     | Get single report      |

### Admin (Admin only)
| Method | Endpoint                       | Description         |
|--------|-------------------------------|---------------------|
| GET    | /api/admin/stats              | System statistics   |
| GET    | /api/admin/users              | All users           |
| GET    | /api/admin/reports            | All reports         |
| PUT    | /api/admin/users/:id/toggle   | Toggle user status  |

---

## 🧠 AI Module Architecture

### Text Scam Classifier (`scamClassifier.js`)
- **TF-IDF** vectorization via `natural` npm package
- **Pattern matching** across 6 scam categories (100+ patterns)
- **Linguistic analysis**: CAPS ratio, exclamation density, URL shorteners
- **Weighted scoring formula**:
  ```
  Score = (Pattern × 50%) + (Linguistic × 25%) + (TF-IDF × 25%) - Legitimate Deductions
  ```

### Transaction Risk Scorer (`transactionRiskScorer.js`)
- **5-factor rule-based model**:
  - Amount Risk (25 pts max)
  - Frequency/Velocity Risk (20 pts)
  - Merchant Category Risk (20 pts)
  - Geographic Risk (20 pts)
  - Time-of-Day Risk (15 pts)
- **Combination amplifiers** for compound risk patterns
- **Formula**: `Score = Σ(factor × weight) / 100 × 100%`

### Risk Levels
| Score Range | Level  | Action              |
|-------------|--------|---------------------|
| 0-39        | Low    | Safe to proceed     |
| 40-69       | Medium | Verify before acting|
| 70-100      | High   | Block / Alert       |

---

## 🔧 Production Enhancements

1. **Real OCR**: Install `tesseract.js` for actual image text extraction
2. **Better NLP**: Integrate HuggingFace transformers via Python microservice
3. **Rate limiting**: Add `express-rate-limit` to prevent abuse
4. **Email alerts**: Send emails on high-risk detection via Nodemailer
5. **Redis caching**: Cache stats for performance
6. **HTTPS**: Add SSL for production deployment

---

## 🔐 Security Features
- JWT authentication with token expiry
- Password hashing (bcryptjs, 12 salt rounds)
- File type + size validation
- Route protection middleware
- Admin-only route guards
- Input sanitization
