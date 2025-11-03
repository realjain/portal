@echo off
echo ========================================
echo   STOP ALL NODE SERVERS
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Checking if port 5000 is free...
netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo Port 5000 is still in use. Trying to kill specific process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        echo Killing process %%a
        taskkill /F /PID %%a 2>nul
    )
) else (
    echo Port 5000 is now free!
)

echo.
echo Checking if port 5001 is free...
netstat -ano | findstr :5001
if %errorlevel% equ 0 (
    echo Port 5001 is still in use. Trying to kill specific process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
        echo Killing process %%a
        taskkill /F /PID %%a 2>nul
    )
) else (
    echo Port 5001 is now free!
)

echo.
echo All servers stopped!
echo You can now start fresh servers.
echo.
pause