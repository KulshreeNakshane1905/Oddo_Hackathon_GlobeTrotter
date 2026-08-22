@echo off
echo ========================================================
echo   GlobalTrotters - Installation and First Time Setup
echo ========================================================
echo.
echo Setting up local database and servers...
echo.

echo [1/5] Starting Local Database (PostgreSQL)...
call "%~dp0start_postgres.bat"
echo.

echo [2/5] Installing Client Dependencies...
cd /d "%~dp0client"
call npm install --legacy-peer-deps
cd /d "%~dp0"
echo.

echo [3/5] Installing Server Dependencies...
cd /d "%~dp0server"
call npm install --legacy-peer-deps
echo.

echo [4/5] Setting up Database schema...
call npx prisma generate
call npx prisma db push
cd /d "%~dp0"
echo.

echo [5/5] Seeding Database with initial data...
cd /d "%~dp0server"
call npx prisma db seed
cd /d "%~dp0"
echo.

echo ========================================================
echo   Setup Complete! Starting both servers...
echo ========================================================
echo.

start "GlobalTrotters Client" cmd /k "cd /d "%~dp0client" && npm run dev"
start "GlobalTrotters Server" cmd /k "cd /d "%~dp0server" && npm run dev"

echo Servers are booting up in separate terminal windows!
echo Client will run on: http://localhost:5173
echo Server will run on: http://localhost:3001
echo.
pause
