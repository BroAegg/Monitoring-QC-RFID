@echo off
cls
echo.
echo ========================================
echo    🔧 STARTING TEST RFID READER SYSTEM
echo ========================================
echo.

REM Cek apakah Node.js terinstall
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js tidak ditemukan! 
    echo    Silakan install Node.js terlebih dahulu
    echo    Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js terdeteksi
echo.

REM Cek apakah ada ESP32 di COM4
echo 🔍 Checking COM4 untuk ESP32...
powershell -Command "Get-WmiObject -Class Win32_SerialPort | Where-Object {$_.DeviceID -eq 'COM4'}" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  ESP32 tidak terdeteksi di COM4
    echo    Sistem tetap bisa berjalan dengan mode simulasi
) else (
    echo ✅ Device terdeteksi di COM4
)
echo.

REM Install dependencies jika belum ada
echo 📦 Checking Backend Dependencies...
cd /d "%~dp0\MERN_backend"
if not exist "node_modules\serialport" (
    echo 📥 Installing serialport...
    npm install serialport
    if errorlevel 1 (
        echo ❌ Gagal menginstall serialport
        pause
        exit /b 1
    )
)

if not exist "node_modules" (
    echo 📥 Installing backend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Gagal menginstall backend dependencies
        pause
        exit /b 1
    )
)
echo ✅ Backend dependencies ready

echo.
echo 📦 Checking Frontend Dependencies...
cd /d "%~dp0\React-Frontend"
if not exist "node_modules" (
    echo 📥 Installing frontend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Gagal menginstall frontend dependencies
        pause
        exit /b 1
    )
)
echo ✅ Frontend dependencies ready

echo.
echo 🚀 Starting Backend Server...
cd /d "%~dp0\MERN_backend"
start "RFID Backend Server" cmd /k "npm start"

echo ⏳ Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Starting Frontend Development Server...
cd /d "%~dp0\React-Frontend"
start "RFID Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    ✅ TEST RFID SYSTEM STARTED!
echo ========================================
echo.
echo 📡 Backend Server: http://localhost:5000
echo 🌐 Frontend App: http://localhost:5173
echo.
echo 📋 NEXT STEPS:
echo    1. Tunggu frontend selesai loading (~10-30 detik)
echo    2. Buka browser ke http://localhost:5173
echo    3. Klik "TEST RFID Reader" di sidebar
echo    4. Connect ke COM4 atau gunakan simulasi
echo.
echo 🔧 TESTING OPTIONS:
echo    • Real ESP32: Pastikan terhubung ke COM4
echo    • Simulation: Klik "Simulate Test Data"
echo.
echo 📚 Untuk panduan lengkap, baca:
echo    PANDUAN_TEST_RFID_READER.md
echo.
echo Press any key to open browser...
pause >nul

REM Buka browser ke frontend
start http://localhost:5173

echo.
echo 🎉 System is ready! 
echo    Check the TEST RFID Reader menu in sidebar
echo.
pause 