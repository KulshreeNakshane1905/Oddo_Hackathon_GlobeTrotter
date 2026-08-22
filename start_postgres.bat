@echo off
set "PGROOT=%~dp0pgsql"
set "PGDATA=%PGROOT%\data"
set "PGLOG=%PGROOT%\postgres.log"

echo ========================================================
echo   Checking PostgreSQL Database...
echo ========================================================

if not exist "%PGROOT%\bin\initdb.exe" (
    echo PostgreSQL binaries not found in %PGROOT%.
    echo Downloading PostgreSQL 16 Windows binaries (this may take a few minutes)...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-16.3-1-windows-x64-binaries.zip' -OutFile 'pgsql.zip'"
    echo Extracting PostgreSQL binaries...
    powershell -Command "Expand-Archive -Path 'pgsql.zip' -DestinationPath '%~dp0' -Force"
    del pgsql.zip
    echo Download and extraction complete.
)

if not exist "%PGDATA%" (
    echo Initializing new database cluster...
    echo postgres> "%PGROOT%\pwfile.txt"
    "%PGROOT%\bin\initdb.exe" -U postgres -A md5 --pwfile="%PGROOT%\pwfile.txt" -D "%PGDATA%"
    del "%PGROOT%\pwfile.txt"
)

echo Starting PostgreSQL in %PGROOT%...
"%PGROOT%\bin\pg_ctl.exe" -D "%PGDATA%" -l "%PGLOG%" start
echo PostgreSQL started successfully.
