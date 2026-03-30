# AI Finance Manager 🤖💰

An AI-powered personal finance system that automates expense tracking, provides intelligent insights, detects anomalies, and delivers personalized financial planning and investment recommendations.

## ✨ Features

### 1. **AI Receipt Scanner** 📸
- Upload receipt images
- OCR extracts amount, date, and category automatically
- Auto-adds expenses to your dashboard

### 2. **Voice Assistant** 🎤
- Add expenses via voice commands
- Query your finances by voice
- Natural language processing

### 3. **AI Financial Chatbot** 🧠
- Ask financial questions
- Get personalized advice based on your data
- Examples: "Where am I overspending?", "How can I save more?"

### 4. **Fraud & Anomaly Detection** 🛡️
- Detects unusual spending patterns
- Real-time alerts for suspicious transactions
- "This expense is 2x higher than normal" notifications

### 5. **Multi-Currency Support** 🌍
- Support for INR, USD, and other currencies
- Auto-conversion via API
- Global expense tracking

### 6. **Goal-Based Financial Planning** 🎯
- Set savings goals with deadlines
- Track progress towards targets
- Example: ₹1,00,000 in 6 months → Shows required monthly saving

### 7. **Advanced Investment Engine** 💹
- Risk-based recommendations
- SIP & return estimation
- Personalized portfolio suggestions

### 8. **Expense Sharing** 👥
- Split bills with friends
- Track who owes whom
- Example: ₹1200 → 4 people → ₹300 each

### 9. **Advanced Security** 🔐
- Password hashing with bcrypt
- JWT authentication
- Secure API endpoints

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.4
- **Next.js** 16.2.1
- **Tailwind CSS** 4.2.2
- **TypeScript** 5

### Backend
- **Next.js API Routes**
- **Node.js**

### Database
- **PostgreSQL**
- **Prisma** ORM

### AI & Integrations
- **OpenAI API** - Chatbot and insights
- **Tesseract.js** - OCR for receipt scanning
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- OpenAI API Key
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create `.env.local` in the root directory (already created):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_finance_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
OPENAI_API_KEY="sk-your-openai-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Set Up Database
```bash
# Create Prisma migrations
npm run db:migrate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser!

## 📚 Project Structure

```
ai-finance-manager/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/
│   │   │   └── login/
│   │   ├── expenses/
│   │   ├── goals/
│   │   ├── ai/
│   │   │   ├── chatbot/
│   │   │   ├── investments/
│   │   │   └── anomalies/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── expenses/
│   │   ├── chatbot/
│   │   ├── alerts/
│   │   └── goals/
│   ├── login/
│   ├── signup/
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts - Authentication utilities
│   ├── prisma.ts - Prisma client
│   ├── ai-chatbot.ts - Chatbot logic
│   ├── fraud-detection.ts - Anomaly detection
│   └── investment-engine.ts - Investment recommendations
├── prisma/
│   └── schema.prisma - Database schema
├── public/
├── package.json
└── README.md
```

## 🗄️ Database Schema

### Main Models
- **User** - User accounts with authentication
- **Expense** - Individual expenses with anomaly detection
- **Goal** - Savings goals tracking
- **Investment** - Investment recommendations
- **ExpenseShare** - Split bills and expense sharing
- **ChatMessage** - Chat history
- **AnomalyAlert** - Fraud detection alerts
- **Notification** - User notifications

## 🔐 Authentication Flow

1. **Signup**: Create account → Password hashed (bcrypt) → JWT token generated
2. **Login**: Email & password → Validate → JWT token returned
3. **Authenticated Requests**: Include `Authorization: Bearer <token>` header

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Expenses
- `POST /api/expenses` - Add new expense
- `GET /api/expenses` - Get all expenses

### ChatBot
- `POST /api/ai/chatbot` - Ask financial question
- `GET /api/ai/chatbot` - Get financial insights

### Investments
- `GET /api/ai/investments` - Get investment recommendations
- `POST /api/ai/investments` - Calculate SIP maturity

### Anomalies
- `GET /api/ai/anomalies` - Get unresolved alerts
- `POST /api/ai/anomalies` - Resolve alert

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get all goals
- `PUT /api/goals` - Update goal progress

## 🎯 Key Features Explained

### AI Chatbot
The chatbot uses your financial data to provide personalized advice:
- Analyzes monthly income, expenses, and spending patterns
- Provides insights on where you're overspending
- Suggests ways to save more
- Answers financial questions with context

### Fraud Detection
Statistical anomaly detection using Z-scores:
- Compares current expense to historical average
- Alerts if expense is 3+ standard deviations from mean (high severity)
- Creates alerts for unusual patterns

### Investment Recommendations
Risk profiling based on:
- Monthly savings rate
- Income stability
- Existing obligations
- Returns: debt funds (5.5%), balanced funds (9%), equity (13%), etc.

### SIP Calculator
Calculates future value of Systematic Investment Plans:
- Compound interest over investment period
- Shows total returns and maturity amount

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Database Management
```bash
npm run db:migrate    # Create migrations
npm run db:push       # Apply schema changes
npm run db:studio     # Open database GUI
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/DB

# Authentication
JWT_SECRET=min-32-chars-long-secret-key

# AI & APIs
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development|production
```

---

**Made with ❤️ for better financial management**
