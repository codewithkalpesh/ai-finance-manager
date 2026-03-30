# 🎬 FINAL SETUP & RUN INSTRUCTIONS

## ✅ Prerequisites Verification

Before starting, verify you have:

```bash
# Check Node.js
node --version
# Expected: v18.0.0 or higher

# Check npm
npm --version
# Expected: 8.0.0 or higher

# Check PostgreSQL
psql --version
# Expected: psql (PostgreSQL) 12 or higher
```

If any are missing, install them before proceeding.

---

## 📋 Complete Setup Guide (Step-by-Step)

### Step 1: Navigate to Project
```bash
cd ai-finance-manager
```

### Step 2: Install All Dependencies
```bash
npm install
```

Wait for installation to complete. You should see:
```
added XXX packages in Xs
```

### Step 3: Set Up PostgreSQL

#### Windows Users:
```bash
# Start PostgreSQL service
net start PostgreSQL

# Open PostgreSQL console
psql -U postgres

# Create database (in psql console)
CREATE DATABASE ai_finance_db;

# Exit psql
\q
```

#### macOS Users:
```bash
# Start PostgreSQL
brew services start postgresql

# Create database
createdb ai_finance_db
```

#### Linux Users:
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb ai_finance_db
```

### Step 4: Configure Environment Variables

Open `.env.local` in your editor and update:

```env
# Replace 'password' with your PostgreSQL password
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_finance_db"

# Keep this as is (or change to something more secure in production)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"

# Add your OpenAI API Key (https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-your-actually-secret-key-here"

# Keep as is for development
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Step 5: Initialize Database Schema

```bash
npm run db:push
```

You should see:
```
✓ Your database is now in sync with your Prisma schema
```

### Step 6: Start Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 16.2.1
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1.2s
```

### Step 7: Open in Browser

Visit: `http://localhost:3000`

You should see the landing page with:
- AI Finance Manager logo
- Feature showcase
- Sign Up / Login buttons

---

## 🎯 First-Time Usage

### Create Your Account

1. **Click "Sign Up"** on the landing page
2. **Fill in your details:**
   - Full Name: `Your Name`
   - Email: `your@email.com`
   - Password: `securepassword123`
   - Confirm Password: `securepassword123`
3. **Click "Sign Up"**
4. **Automatically logged in** and redirected to Dashboard

### Add Your First Expense

1. **From Dashboard**, click **"Add Expense"**
2. **Fill in the form:**
   - Amount: `500`
   - Category: `Food`
   - Date: `Today's date`
   - Description: `Lunch at restaurant` (optional)
3. **Click "Add Expense"**
4. **Success!** Expense appears in recent list

### Try the AI Chatbot

1. **From Dashboard**, click **"Ask AI"**
2. **Ask a question** like:
   - "How much did I spend on food?"
   - "Where am I overspending?"
   - "What's my spending breakdown?"
3. **Get AI-powered response** (requires OpenAI API key to work)

### Check for Fraud Alerts

1. **From Dashboard**, click **"View Alerts"**
2. **Add an unusually high expense** to trigger detection
3. **Alerts appear** if anomaly is detected
4. **Click "Resolve"** to mark as reviewed

### Create a Savings Goal

1. **From Dashboard**, click **"Create Goal"** or go to Goals page
2. **Fill in goal details:**
   - Goal Title: `Vacation Fund`
   - Target Amount: `50000`
   - Deadline: `6 months from now`
   - Priority: `High`
3. **Click "Create Goal"**
4. **Track progress** on the Goals page

---

## 🔧 Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push         # Sync schema
npm run db:migrate      # Create migrations
npm run db:studio       # Open database GUI

# Linting
npm run lint            # Check code quality
npm run lint -- --fix   # Auto-fix issues
```

---

## 🐛 Common Issues & Fixes

### Issue: "Error: connect ECONNREFUSED"

**Cause:** PostgreSQL not running

**Fix:**
```bash
# Windows
net start PostgreSQL

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

---

### Issue: "Database ai_finance_db does not exist"

**Cause:** Database not created

**Fix:**
```bash
# Create database manually
psql -U postgres -c "CREATE DATABASE ai_finance_db;"

# Then sync
npm run db:push
```

---

### Issue: "Port 3000 already in use"

**Cause:** Another app using port 3000

**Fix:**
```bash
# Use different port
npm run dev -- -p 3001

# Then visit http://localhost:3001
```

---

### Issue: "OpenAI API 401 Unauthorized"

**Cause:** Invalid or missing API key

**Fix:**
1. Get key from https://platform.openai.com/api-keys
2. Update `OPENAI_API_KEY` in `.env.local`
3. Restart dev server

---

### Issue: "Cannot find module '@prisma/client'"

**Cause:** Prisma not installed

**Fix:**
```bash
npm install
npx prisma generate
```

---

## ✨ Features to Try

### 1. Dashboard Overview
- See financial stats
- View quick action buttons
- Check your balance

### 2. Expense Tracking
- Add expenses by category
- Set date and description
- View recent expenses
- Automatic categorization

### 3. AI Chatbot
- Ask financial questions
- Get budget recommendations
- View spending insights

### 4. Fraud Detection
- Unusual expenses detected
- Severity levels shown
- Easy alert resolution

### 5. Savings Goals
- Create financial goals
- Track progress visually
- Set deadlines

---

## 📊 Testing with Sample Data

### Add Test Expenses
```bash
# Via API with curl (after getting token):
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 250,
    "category": "food",
    "date": "2024-01-15",
    "description": "Coffee with friend"
  }'
```

### View via Prisma Studio
```bash
npm run db:studio
# Opens http://localhost:5555
# Visual database explorer
```

---

## 🚀 Performance Tips

### Frontend Optimization
- Already using Next.js optimization
- Tailwind CSS is production-ready
- Images optimized by default

### Database Optimization
- Prisma has indexed key fields
- Queries are optimized
- Connection pooling ready

### API Optimization
- Middleware for auth checks
- Error handling implemented
- Response compression ready

---

## 🔐 Security Checklist

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens for sessions
- ✅ API routes protected
- ✅ Environment variables secured
- ✅ SQL injection prevention (Prisma)
- ✅ CORS headers ready
- ✅ Type safety with TypeScript

---

## 📝 Logging & Debugging

### Enable Debug Logging
```env
# Add to .env.local
DEBUG=*
# or
DEBUG=prisma:*
```

### View API Requests
```bash
# In browser, F12 → Network tab
# See all API calls
```

### Check Database Directly
```bash
npm run db:studio
# Opens visual database explorer
```

---

## 🎉 What's Next?

After setting up, you can:

1. **Explore the dashboard** - Get familiar with the UI
2. **Add expenses** - Start tracking your spending
3. **Use the chatbot** - Ask financial questions
4. **Set goals** - Plan your finances
5. **Customize** - Modify colors, categories, etc.

---

## 📞 Detailed Support Links

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **OpenAI API**: https://platform.openai.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## ✅ Final Verification Checklist

Before running, verify:

- [ ] Node.js v18+ installed: `node --version`
- [ ] PostgreSQL v12+ installed: `psql --version`
- [ ] PostgreSQL service started
- [ ] Database `ai_finance_db` created
- [ ] `.env.local` file updated with credentials
- [ ] All dependencies installed: `npm install`
- [ ] Database schema synced: `npm run db:push`
- [ ] Dev server running: `npm run dev`
- [ ] Can visit http://localhost:3000
- [ ] Can sign up and create account

---

## 🎬 Ready to Go!

You now have a **complete, production-ready AI Finance Manager**! 🚀

All the features are implemented:
- ✅ User authentication
- ✅ Expense tracking with anomaly detection
- ✅ AI-powered chatbot
- ✅ Fraud detection system
- ✅ Investment recommendations
- ✅ Savings goal management
- ✅ Beautiful responsive UI

**Start the server and begin managing your finances with AI!**

```bash
npm run dev
```

Then visit: http://localhost:3000

---

**Happy Coding! 💰🤖**
