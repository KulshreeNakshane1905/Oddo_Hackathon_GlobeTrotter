@echo off
echo ========================================================
echo   Starting GlobalTrotters Application...
echo ========================================================
echo.

start "GlobalTrotters Client" cmd /k "cd client && npm run dev"
start "GlobalTrotters Server" cmd /k "cd server && npm run dev"

echo Servers are booting up in separate terminal windows!
echo Client will run on: http://localhost:5173
echo Server will run on: http://localhost:3001
echo.
pause
