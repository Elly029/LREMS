@echo off
REM Setup script for Evaluation Monitoring feature (Windows)
REM This script creates the necessary database collections and indexes

echo ==========================================
echo Evaluation Monitoring Setup
echo ==========================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
mongosh --eval "db.version()" >nul 2>&1
if errorlevel 1 (
    echo X Error: MongoDB is not running or not accessible
    echo Please start MongoDB and try again
    exit /b 1
)

echo √ MongoDB is running
echo.

REM Run the migration
echo Running database migration...
call npx ts-node src/database/migrations/create-monitoring-collection.ts

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo √ Setup completed successfully!
    echo ==========================================
    echo.
    echo Next steps:
    echo 1. Start the backend server: npm run dev
    echo 2. The monitoring API will be available at /api/monitoring
    echo 3. Check DATABASE_ALIGNMENT.md for API documentation
) else (
    echo.
    echo X Setup failed. Please check the error messages above.
    exit /b 1
)
