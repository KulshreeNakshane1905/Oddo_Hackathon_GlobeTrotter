@echo off
echo ========================================================
echo   GlobalTrotters - Installation and First Time Setup
echo ========================================================
echo.
echo Setting up local database and servers...
echo.

echo [1/4] Starting Local Database (PostgreSQL)...
call .\start_postgres.bat
echo.

echo [2/4] Installing Client Dependencies...
cd client
call npm install
cd ..
echo.

echo [3/4] Installing Server Dependencies...
cd server
call npm install
echo.

echo [4/4] Setting up Database schema...
call npx prisma generate
call npx prisma migrate deploy
cd ..
echo.

echo ========================================================
echo   Setup Complete! Starting both servers...
echo ========================================================
echo.

start "GlobalTrotters Client" cmd /k "cd client && npm run dev"
start "GlobalTrotters Server" cmd /k "cd server && npm run dev"

echo Servers are booting up in separate terminal windows!
echo Client will run on: http://localhost:5173
echo Server will run on: http://localhost:3001
echo.
pause
