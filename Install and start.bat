@echo off
echo ========================================================
echo   GlobalTrotters - Installation and First Time Setup
echo ========================================================
echo.
echo Make sure you have added your actual Supabase credentials 
echo to both server/.env and client/.env before proceeding!
echo.
pause
echo.

echo [1/3] Installing Client Dependencies...
cd client
call npm install
cd ..

echo.
echo [2/3] Installing Server Dependencies...
cd server
call npm install

echo.
echo [3/3] Generating Prisma Client...
call npx prisma generate
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
