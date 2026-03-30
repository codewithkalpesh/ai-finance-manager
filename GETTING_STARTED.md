# 🚀 Getting Started - AI Finance Manager

Welcome! This guide will walk you through setting up the AI Finance Manager on your machine.

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- ✅ **Node.js 18 or higher** - [Download](https://nodejs.org/)
- ✅ **PostgreSQL 12 or higher** - [Download](https://www.postgresql.org/download/)
- ✅ **npm or yarn** - Comes with Node.js
- ✅ **OpenAI API Key** - [Get Key](https://platform.openai.com/api-keys)
- ✅ **Git** (Optional) - [Download](https://git-scm.com/)

## 🔧 Installation Steps

### Step 1: Verify Node.js & PostgreSQL

```bash
# Check Node.js version
node --version
# Expected output: v18.0.0 or higher

# Check npm version  
npm --version
# Expected output: 8.0.0 or higher

# Check PostgreSQL version
psql --version
# Expected output: psql (PostgreSQL) 12 or higher
```

### Step 2: Install Dependencies

```bash
# Navigate to project directory
cd ai-finance-manager

# Install all dependencies
npm install

# This should complete without errors
```

### Step 3: PostgreSQL Setup

#### On Windows:
```bash
# Start PostgreSQL service
net start PostgreSQL

# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE ai_finance_db;

# Exit psql
\q
```

#### On macOS:
```bash
# Start PostgreSQL (if installed via Homebrew)
brew services start postgresql

# Create the database
createdb ai_finance_db
```

#### On Linux:
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create the database
sudo -u postgres createdb ai_finance_db
```

### Step 4: Configure Environment Variables

1. Open `.env.local` in the root directory (already exists)
2. Update the following values:

```env
# Database Connection String
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_finance_db"
# Replace YOUR_PASSWORD with your PostgreSQL password

# JWT Secret (keep this secret!)
JWT_SECRET="change-this-to-a-long-random-string-at-least-32-characters-long"

# OpenAI API Key
OPENAI_API_KEY="sk-your-actual-openai-api-key-here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### Step 5: Initialize Database Schema

```bash
# Push Prisma schema to database
npm run db:push

# Verify with Prisma Studio (optional)
npm run db:studio
```

This will create all necessary tables in your PostgreSQL database.

### Step 6: Start Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 16.2.1
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.3s
```

### Step 7: Access the Application

1. Open your browser
2. Go to `http://localhost:3000`
3. You should see the landing page

## 📝 Create Your First Account

1. Click **"Sign Up"** on the landing page
2. Fill in:
   - Full Name: Your name
   - Email: your@email.com
   - Password: Choose a strong password
3. Click **"Sign Up"**
4. You'll be redirected to the **Dashboard**

## 🎯 Quick Tour

### Pages You Can Access:

1. **Dashboard** (`/dashboard`)
   - View financial overview
   - See stats (balance, income, expenses, savings rate)
   - Quick action buttons

2. **Add Expense** (`/dashboard/expenses`)
   - Add new expenses with amount, category, date
   - View recent expenses
   - Automatic anomaly detection

3. **AI Chatbot** (`/dashboard/chatbot`)
   - Ask financial questions
   - Get personalized advice
   - View financial insights

4. **Alerts** (`/dashboard/alerts`)
   - See fraud detection alerts
   - Review unusual spending patterns
   - Resolve alerts

5. **Savings Goals** (`/dashboard/goals`)
   - Create savings goals
   - Track progress
   - Set deadlines and priorities

## 🐛 Troubleshooting

### PostgreSQL Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Make sure PostgreSQL is running
# Windows: net start PostgreSQL
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Verify connection
psql -U postgres -d ai_finance_db
```

### Database Doesn't Exist

**Error:** `Database "ai_finance_db" doesn't exist`

**Solution:**
```bash
# Create the database manually
psql -U postgres -c "CREATE DATABASE ai_finance_db;"

# Then run Prisma push
npm run db:push
```

### PORT 3000 Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Option 1: Stop the process using port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000

# Option 2: Use a different port
npm run dev -- -p 3001
```

### OpenAI API Error

**Error:** `401 Unauthorized`

**Solution:**
1. Check your API key is correct
2. Verify it's active at https://platform.openai.com/api-keys
3. Make sure you have API credits

### Prisma Migration Issues

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npm run db:push -- --force-reset

# Or manually reset
npx prisma migrate reset
```

## 📚 Available Commands

```bash
# Development
npm run dev                 # Start dev server (http://localhost:3000)

# Building
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run db:push           # Sync Prisma schema with database
npm run db:migrate        # Create and apply migrations
npm run db:studio         # Open Prisma Studio (GUI)

# Linting
npm run lint              # Run ESLint
```

## 🔑 API Testing with curl

### Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword"
  }'
```

### Add Expense (Replace TOKEN with your JWT token)
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "amount": 500,
    "category": "food",
    "description": "Lunch",
    "date": "2024-01-15"
  }'
```

## 🎨 Customization

### Change App Theme
Edit `app/globals.css` to modify colors and styling.

### Add New Categories
Update `categories` array in `/app/dashboard/expenses/page.tsx`

### Adjust Anomaly Sensitivity
Modify Z-score threshold in `lib/fraud-detection.ts` (currently 3, 2, 1.5)

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

## 📞 Need Help?

1. Check the [Setup Guide](./SETUP_GUIDE.md)
2. Review [README.md](./README.md) for more details
3. Check API endpoints in the code
4. Review Prisma documentation: https://www.prisma.io/docs/

## 🎉 You're All Set!

You now have a complete AI-powered personal finance system running locally. Start by:

1. Adding some expenses
2. Asking the AI chatbot for advice
3. Setting savings goals
4. Exploring the dashboard

Happy tracking! 💰

---

**Questions?** Check the troubleshooting section or review the code in `lib/` and `app/api/` directories.
