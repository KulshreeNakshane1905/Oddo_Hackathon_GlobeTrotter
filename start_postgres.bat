@echo off
set "PGROOT=%~dp0pgsql"
set "PGDATA=%PGROOT%\data"
set "PGLOG=%PGROOT%\postgres.log"

echo Starting PostgreSQL in %PGROOT%...

if not exist "%PGDATA%" (
    echo Initializing database cluster...
    echo postgres> "%PGROOT%\pwfile.txt"
    "%PGROOT%\bin\initdb.exe" -U postgres -A md5 --pwfile="%PGROOT%\pwfile.txt" -D "%PGDATA%"
    del "%PGROOT%\pwfile.txt"
)

"%PGROOT%\bin\pg_ctl.exe" -D "%PGDATA%" -l "%PGLOG%" start
echo PostgreSQL started.
