# CHECKLIST SETUP SISTEM RFID

## ✅ PERSIAPAN AWAL
- [ ] Python30.8+ terinstall
- [ ] Node.js 16+ terinstall  
- [ ] Redis Server terinstall
- [ ] RFID Scanner terhubung ke komputer
-t COM RFID scanner diketahui (misal: COM3)

## ✅ BACKEND DJANGO
- [ ] Virtual environment dibuat dan aktif
- endensi terinstall: `pip install -r requirements.txt`
- [ ] Migrasi database: `python manage.py makemigrations && migrate`
- [ ] Superuser dibuat: `python manage.py createsuperuser`
- Django server berjalan: `python manage.py runserver`
- [ ] Admin panel bisa diakses: http://127000.1:8000/admin/
-] Data test ditambahkan di admin panel

## ✅ REDIS SERVER
- [ ] Redis server berjalan: `redis-server`
-Koneksi Redis test: `redis-cli ping` → PONG
- [ ] Redis tidak error di console

## ✅ FRONTEND REACT
- endensi terinstall: `npm install`
- [ ] WebSocket package terinstall: `npm install react-use-websocket`
- [ ] React server berjalan: `npm run dev`
-] Aplikasi bisa diakses: http://localhost:5173 Form input normal tanpa error

## ✅ RFID SCANNER
-  Port COM dikonfigurasi di `scan_rfid.py`
- [ ] Script RFID berjalan: `python scan_rfid.py`
- [ ] RFID scanner terdeteksi: "Berhasil terhubung ke RFID Scanner"
-  ] Test scan RFID: Tag terdeteksi: [ID]"
-] Data terkirim ke Django: Data berhasil dikirim ke Django"

## ✅ WEBSOCKET INTEGRATION
- [ ] Import WebSocket ditambahkan di DaftarID.jsx
-  State RFID ditambahkan: `isScanMode`, `wsConnected`
- [ ] WebSocket connection dibuat
- Handler pesan WebSocket ditambahkan
- [ ] Tombol Scan RFID" ditambahkan di form
-ndikator WebSocket terhubung muncul

## ✅ TESTING SISTEM LENGKAP

### Test 1FID yang Sudah Terdaftar
- [ ] Buka http://localhost:5173
- Klik tombolScan RFID"
-Scan RFID tag yang sudah ada di database
- Form terisi otomatis dengan data yang ada
- [ ] Pesan sukses muncul: "RFID [ID] ditemukan! Data terisi otomatis."

### Test 2 RFID Baru
- Klik tombolScan RFID"
-Scan RFID tag yang belum terdaftar
- [ ] Field ID terisi otomatis
-  Field lain kosong, siap untuk diisi
- [ ] Pesan info muncul:RFID baru: ID]. Silakan lengkapi data."

### Test 3 Submit Form
-] Isi data lengkap di form
-] Klik tombol Add" atau "Update"
-  Data tersimpan ke database
- [ ] Pesan sukses muncul

### Test 4 Admin Panel
- [ ] Buka http://127000.1:8000/admin/
- [ ] Login dengan superuser
- [ ] Lihat data Data Terdaftar"
- ] Data yang disubmit dari form muncul di admin

## ✅ TROUBLESHOOTING CHECKLIST

### Jika Django Error:
- [ ] Virtual environment aktif
- endensi terinstall lengkap
- [ ] Redis server berjalan
- [ ] Port 800ak digunakan aplikasi lain

### Jika WebSocket Error:
- Django server berjalan dengan ASGI
- [ ] Redis server berjalan
-RL WebSocket benar: `ws://12700.1800id/`
- [ ] Browser console tidak ada error

### Jika RFID Scanner Error:
-  Port COM benar di `scan_rfid.py`
- [ ] RFID scanner terhubung
- [ ] Driver RFID scanner terinstall
-  ] Script `scan_rfid.py` berjalan tanpa error

### Jika Form Tidak Terisi Otomatis:
-] WebSocket terhubung (indikator hijau)
-] Data RFID ada di database Django
- [ ] API `/api/check_rfid/` merespon dengan benar
- [ ] Browser console tidak ada error JavaScript

## ✅ PERFORMANCE CHECK
-  WebSocket koneksi stabil
-Response time scan RFID < 2tik
- Form terisi otomatis tanpa delay
- [ ] Tidak ada memory leak
- Semua service berjalan bersamaan tanpa konflik

## ✅ SECURITY CHECK
- ] CORS dikonfigurasi dengan benar
- [ ] CSRF protection aktif
- [ ] Input validation di backend
- [ ] Tidak ada sensitive data di console log

## ✅ BACKUP & MAINTENANCE
- [ ] Database di-backup
-] Log files dipantau
- ror handling sudah baik
- [ ] Dokumentasi lengkap

---

## 🎯 STATUS AKHIR
- **SEMUA CHECKLIST DI ATAS TERCENTANG** ✅
- [ ] Sistem RFID berfungsi sempurna
- ser bisa scan RFID dan form terisi otomatis
- a tersimpan dengan benar ke database
- [ ] Tidak ada error di console

---

**SELAMAT! SISTEM RFID ANDA SIAP DIGUNAKAN** 🚀

Jika ada checklist yang belum tercentang, ikuti troubleshooting di file `PANDUAN_SETUP_RFID_SYSTEM.txt` 