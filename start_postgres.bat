@echo off
set "PGROOT=%~dp0pgsql"
set "PGDATA=%PGROOT%\data"
set "PGLOG=%PGROOT%\postgres.log"

echo ========================================================
echo   Checking PostgreSQL Database...
echo ========================================================

REM Check if PostgreSQL binaries exist
if not exist "%PGROOT%\bin\initdb.exe" (
    echo PostgreSQL binaries not found in %PGROOT%.
    echo Downloading PostgreSQL 16 Windows binaries...
    echo This may take a few minutes, please wait...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-16.3-1-windows-x64-binaries.zip' -OutFile '%~dp0pgsql.zip'"
    echo Extracting PostgreSQL binaries...
    powershell -Command "Expand-Archive -Path '%~dp0pgsql.zip' -DestinationPath '%~dp0' -Force"
    del "%~dp0pgsql.zip"
    echo Download and extraction complete.
)

REM Check if database cluster needs initialization
if not exist "%PGDATA%" goto :INITDB
goto :STARTDB

:INITDB
echo Initializing new database cluster...
echo postgres> "%PGROOT%\pwfile.txt"
"%PGROOT%\bin\initdb.exe" -U postgres -A md5 --pwfile="%PGROOT%\pwfile.txt" -D "%PGDATA%"
del "%PGROOT%\pwfile.txt"
echo Configuring PostgreSQL to use port 5433...
powershell -Command "(Get-Content '%PGDATA%\postgresql.conf') -replace '#port = 5432', 'port = 5433' | Set-Content '%PGDATA%\postgresql.conf'"
echo Database cluster initialized.

:STARTDB
echo Starting PostgreSQL on port 5433...
"%PGROOT%\bin\pg_ctl.exe" -D "%PGDATA%" -l "%PGLOG%" start
echo PostgreSQL started successfully.
