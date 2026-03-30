@echo off
REM AI Finance Manager - Setup Script for Windows

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║       AI Finance Manager - Complete Setup Script           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)
echo ✅ Node.js found: %node --version%

REM Check if PostgreSQL is installed
echo.
echo [2/5] Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL not found in PATH. Make sure PostgreSQL is installed and added to PATH.
    echo 📝 To fix: Add PostgreSQL bin directory to your PATH environment variable.
) else (
    echo ✅ PostgreSQL found
)

REM Install dependencies
echo.
echo [3/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed

REM Create .env.local if it doesn't exist
echo.
echo [4/5] Setting up environment variables...
if not exist .env.local (
    echo Creating .env.local...
    (
        echo # Database
        echo DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_finance_db"
        echo.
        echo # JWT Secret
        echo JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
        echo.
        echo # OpenAI API
        echo OPENAI_API_KEY="sk-your-openai-api-key"
        echo.
        echo # App URL
        echo NEXT_PUBLIC_APP_URL="http://localhost:3000"
        echo.
        echo # Node Environment
        echo NODE_ENV="development"
    ) > .env.local
    echo ✅ .env.local created. Please update with your credentials.
) else (
    echo ✅ .env.local already exists
)

REM Initialize Prisma
echo.
echo [5/5] Initializing Prisma...
echo Note: Make sure PostgreSQL is running and DATABASE_URL is correct
echo Running: npx prisma db push
call npx prisma db push
if %errorlevel% neq 0 (
    echo ⚠️  Prisma setup encountered an issue. Please ensure PostgreSQL is running.
    echo 💡 Troublesshooting:
    echo    1. Start PostgreSQL service: net start PostgreSQL
    echo    2. Create database: psql -U postgres -c "CREATE DATABASE ai_finance_db;"
    echo    3. Run again: npx prisma db push
) else (
    echo ✅ Prisma setup complete
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║            Setup Complete! 🎉                              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo 1. Update .env.local with your actual values:
echo    - DATABASE_URL (PostgreSQL connection string)
echo    - JWT_SECRET (keep it secret!)
echo    - OPENAI_API_KEY (from OpenAI)
echo.
echo 2. Start the development server:
echo    npm run dev
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo 4. Sign up for a new account and start using the app!
echo.
echo Happy coding! 🚀
echo.
