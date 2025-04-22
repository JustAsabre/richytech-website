@echo off
title RichyTech Startup Script
echo Starting RichyTech Website...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Please run this script as Administrator!
    echo Right-click the batch file and select "Run as administrator"
    pause
    exit
)

REM Check if MongoDB is running
echo Checking MongoDB status...
sc query MongoDB >nul 2>&1
if %errorLevel% neq 0 (
    echo MongoDB service not found. Starting MongoDB...
    net start MongoDB
    if %errorLevel% neq 0 (
        echo Failed to start MongoDB. Please make sure MongoDB is installed correctly.
        pause
        exit
    )
)
echo MongoDB is running.
echo.

REM Check if ports are available
echo Checking if required ports are available...
netstat -ano | find "5000" >nul 2>&1
if %errorLevel% equ 0 (
    echo Port 5000 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| find "5000"') do (
        taskkill /F /PID %%a
    )
)

netstat -ano | find "3000" >nul 2>&1
if %errorLevel% equ 0 (
    echo Port 3000 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| find "3000"') do (
        taskkill /F /PID %%a
    )
)
echo Ports are available.
echo.

REM Kill any existing Node.js processes
echo Cleaning up any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo.

REM Create a temporary directory for log files
if not exist "logs" mkdir logs

REM Start the backend server
echo Starting backend server...
cd backend
start /B cmd /c "node server.js > ../logs/backend.log 2>&1"
cd ..
echo Backend server started.
echo.

REM Wait for backend to initialize
timeout /t 3 /nobreak >nul

REM Start the frontend server
echo Starting frontend server...
start /B cmd /c "node server.js > logs/frontend.log 2>&1"
echo Frontend server started.
echo.

REM Wait for frontend to initialize
timeout /t 2 /nobreak >nul

REM Check if servers are running by testing the ports
echo Verifying servers are running...
netstat -ano | find "5000" >nul 2>&1
if %errorLevel% neq 0 (
    echo Backend server failed to start. Check logs/backend.log for details.
    pause
    exit
)

netstat -ano | find "3000" >nul 2>&1
if %errorLevel% neq 0 (
    echo Frontend server failed to start. Check logs/frontend.log for details.
    pause
    exit
)

echo All servers are running successfully!
echo.

REM Open the website in default browser
echo Opening RichyTech website in your default browser...
timeout /t 1 /nobreak >nul
start http://localhost:3000/index.html

echo.
echo Setup complete! The website should now be open in your browser.
echo DO NOT CLOSE THIS WINDOW - it keeps the servers running.
echo To stop the servers, simply close this window.
echo.
echo Log files are available in the logs directory:
echo - Backend server: logs/backend.log
echo - Frontend server: logs/frontend.log
echo.

REM Keep the window open
pause 