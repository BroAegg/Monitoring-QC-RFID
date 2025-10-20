@echo off
cls
echo ========================================
echo    SETUP BACKEND RFID SYSTEM
echo ========================================
echo.

echo [1/5] Masuk ke direktori backend...
cd MERN_backend

echo [2/5] Menghapus node_modules dan package-lock.json jika ada...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo [3/5] Menghapus cache npm...
npm cache clean --force

echo [4/5] Menginstall dependencies dengan Express 4.x...
npm install

echo [5/5] Verifikasi instalasi...
npm list express

echo.
echo ========================================
echo    BACKEND SETUP SELESAI!
echo ========================================
echo.
echo Untuk menjalankan backend:
echo   cd MERN_backend
echo   npm run dev
echo.
echo CATATAN:
echo - Pastikan MongoDB berjalan sebelum start backend
echo - Backend akan berjalan di port 5000
echo - RFID Simulator akan otomatis aktif
echo.
pause 