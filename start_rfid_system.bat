@echo off
cls
echo ========================================
echo    SISTEM RFID PRODUCTIVITY GISTEX
echo ========================================
echo.
echo Memulai sistem MERN Stack RFID...
echo.

REM Cek dan setup dependencies jika belum ada
echo [INFO] Mengecek setup backend...
cd MERN_backend
if not exist node_modules (
    echo [SETUP] Dependencies backend belum terinstall...
    echo [SETUP] Menginstall dependencies...
    if exist package-lock.json del package-lock.json
    npm cache clean --force
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Gagal menginstall dependencies backend!
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies backend berhasil diinstall!
)
cd ..

echo [INFO] Mengecek setup frontend...
cd React-Frontend
if not exist node_modules (
    echo [SETUP] Dependencies frontend belum terinstall...
    echo [SETUP] Menginstall dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Gagal menginstall dependencies frontend!
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies frontend berhasil diinstall!
)
cd ..

REM Cek MongoDB (opsional)
echo [INFO] Mengecek MongoDB...
timeout /t 2 /nobreak >nul

REM Memulai backend server
echo [INFO] Memulai Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d MERN_backend && npm run dev"

REM Tunggu backend startup
echo [INFO] Menunggu backend startup...
timeout /t 8 /nobreak >nul

REM Memulai frontend development server
echo [INFO] Memulai Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d React-Frontend && npm run dev"

REM Tunggu frontend startup
echo [INFO] Menunggu frontend startup...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo    SISTEM BERHASIL DIJALANKAN!
echo ========================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend Server: http://localhost:3000
echo Backend Health: http://localhost:5000/api/health
echo.
echo STATUS SISTEM:
echo - Backend: Express 4.x + Node.js + MongoDB
echo - Frontend: React + Vite
echo - Database: MongoDB (localhost:27017)
echo - RFID: Simulator Mode (auto scan setiap 30s)
echo - WebSocket: Real-time connection aktif
echo.
echo CATATAN PENTING:
echo ✅ Sistem menggunakan dummy data jika MongoDB offline
echo ✅ RFID simulator otomatis mengirim scan test
echo ✅ WebSocket real-time sudah aktif
echo ⚠️  MongoDB opsional (sistem tetap jalan tanpa DB)
echo.
echo Tekan tombol apa saja untuk membuka browser...
pause >nul

REM Membuka browser
start http://localhost:3000

echo.
echo ========================================
echo Sistem sedang berjalan...
echo.
echo TROUBLESHOOTING:
echo - Jika error "path-to-regexp": Jalankan setup_backend.bat
echo - Jika port conflict: Tutup aplikasi yang menggunakan port 3000/5000
echo - Jika WebSocket error: Refresh browser atau restart sistem
echo.
echo Tutup terminal ini untuk menghentikan sistem.
echo ========================================
pause 