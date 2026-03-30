# ⚡ Quick Reference - Commands & Tips

## 🚀 Start Here

```bash
# Clone and setup (Windows)
setup.bat

# Or manual setup:
npm install
npm run db:push
npm run dev
```

## 📦 Package Management

```bash
# Install dependencies
npm install

# Add new package
npm install package-name

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

## 🗄️ Database Commands

```bash
# Push schema to database
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio (GUI)
npm run db:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 🔨 Development

```bash
# Start dev server
npm run dev

# Build
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Format code
npm run lint -- --fix
```

## 🧪 Testing API Endpoints

### Using curl

```bash
# Sign Up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Add Expense (replace TOKEN)
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":500,"category":"food","date":"2024-01-15"}'

# Get Expenses
curl http://localhost:3000/api/expenses \
  -H "Authorization: Bearer TOKEN"

# Ask Chatbot
curl -X POST http://localhost:3000/api/ai/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"message":"Where am I overspending?"}'

# Get Alerts
curl http://localhost:3000/api/ai/anomalies \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import endpoints from API documentation
2. Set Authorization header: `Bearer <token>`
3. Send JSON requests

## 🔧 Troubleshooting Quick Fixes

### Port 3000 in use
```bash
npm run dev -- -p 3001
```

### PostgreSQL not running
```bash
# Windows
net start PostgreSQL

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Database connection failed
```bash
# Check if database exists
psql -U postgres -l

# Create database if missing
psql -U postgres -c "CREATE DATABASE ai_finance_db;"
```

### Build errors
```bash
# Clear next cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Prisma issues
```bash
# Sync schema
npm run db:push -- --force

# Generate Prisma client
npx prisma generate
```

## 🌐 Environment Variables

```env
# .env.local

# Database (Required)
DATABASE_URL="postgresql://user:pass@localhost:5432/ai_finance_db"

# JWT (Required)
JWT_SECRET="min-32-characters-for-security"

# OpenAI (Required for chatbot)
OPENAI_API_KEY="sk-your-key-here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

## 📁 Important File Locations

```
Root
├── app/                    # Frontend pages & API routes
├── lib/                    # Business logic
├── prisma/
│   └── schema.prisma      # Database schema
├── .env.local             # Secrets (NEVER commit)
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## 🎯 Development Workflow

1. **Make changes** → Edit files in `app/` or `lib/`
2. **Check types** → TypeScript will show errors
3. **Test locally** → `npm run dev`
4. **Build & test** → `npm run build`
5. **Commit & deploy** → Push to GitHub

## 📊 File Size Reference

```
node_modules/      ~500MB (don't commit)
.next/             ~50MB  (generated)
Database backup    ~10MB  (if saved)
Source code        ~500KB (our code)
```

## 🔐 Security Reminders

```bash
# Never commit secrets
echo ".env.local" >> .gitignore

# Update secrets before deployment
# Change JWT_SECRET in production
# Rotate OpenAI API key periodically
```

## 💡 Pro Tips

### TypeScript Checking
```bash
# Check for type errors
npx tsc --noEmit
```

### View Database
```bash
# Open Prisma Studio (visual DB editor)
npm run db:studio
```

### Quick Test Page
```bash
# Create test.tsx in app/
export default function Test() {
  return <div>Test Page</div>
}
# Visit: http://localhost:3000/test
```

### Database Queries
```typescript
// app/api/test/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany()
  return Response.json(users)
}
```

### Add New Expense Category
1. Edit: `app/dashboard/expenses/page.tsx`
2. Update: `categories` array
3. Done! ✅

## 🚀 Performance Tips

```bash
# Analyze bundle size
npm install -g next-bundle-analyzer
NODE_ENV=production npm run build

# Check build time
npm run build -- --profile
```

## 📱 Testing Responsiveness

```bash
# Firefox DevTools
F12 → Responsive Design Mode (Ctrl+Shift+M)

# Chrome DevTools
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| `ENOENT: no such file or directory, open '.env.local'` | Create .env.local file |
| `connect ECONNREFUSED` | Start PostgreSQL service |
| `error: database "ai_finance_db" does not exist` | Run `npm run db:push` |
| `Port 3000 already in use` | Use `npm run dev -- -p 3001` |
| `OpenAI 401 Unauthorized` | Check API key in .env.local |
| `TypeError: Cannot read property 'id'` | Missing authentication token |

## 📚 Documentation Links

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Tailwind: https://tailwindcss.com/docs
- OpenAI: https://platform.openai.com/docs
- PostgreSQL: https://www.postgresql.org/docs

## 🎉 Quick Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] `.env.local` created
- [ ] Dependencies installed
- [ ] Database migrated
- [ ] Dev server running
- [ ] Can access `http://localhost:3000`
- [ ] Can sign up
- [ ] Can add expense
- [ ] Can chat with AI

---

**Bookmark this page for quick reference!** ⭐
