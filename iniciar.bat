@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Falta instalar Node.js. Descargalo en https://nodejs.org ^(version LTS^), instalalo y vuelve a abrir este archivo.
  pause
  exit /b
)
if "%ADMIN_KEY%"=="" set ADMIN_KEY=anfitrion2026
node server.js
pause
