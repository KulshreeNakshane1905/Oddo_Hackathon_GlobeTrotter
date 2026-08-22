@echo off
echo ========================================================
echo   GlobalTrotters - Starting Servers...
echo ========================================================
echo.

echo Starting Local Database (PostgreSQL)...
call "%~dp0start_postgres.bat"
echo.

start "GlobalTrotters Client" cmd /k "cd /d "%~dp0client" && npm run dev"
start "GlobalTrotters Server" cmd /k "cd /d "%~dp0server" && npm run dev"

echo Servers are booting up in separate terminal windows!
echo Client will run on: http://localhost:5173
echo Server will run on: http://localhost:3001
echo.
pause
