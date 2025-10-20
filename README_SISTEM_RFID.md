# 📡 Sistem RFID Productivity MERN Stack

Sistem manajemen produktivitas dengan teknologi RFID yang dibangun menggunakan **MERN Stack** (MongoDB, Express.js, React, Node.js).

## 🚀 Fitur Utama

### 🔍 **RFID Monitor Real-time**
- Monitor scan RFID secara real-time menggunakan WebSocket
- Notifikasi suara untuk setiap scan baru
- Test scan manual untuk keperluan testing
- Riwayat scan dengan timestamp lengkap

### 👥 **Manajemen Karyawan**
- CRUD operasi lengkap (Create, Read, Update, Delete)
- Pencarian berdasarkan nama, NIK, atau ID Card
- Filter berdasarkan bagian, line, dan status
- Integrasi dengan sistem RFID

### 📊 **Dashboard Real-time**
- Statistik karyawan yang update otomatis
- Data total karyawan, karyawan aktif, cuti, dan karyawan baru
- Interface yang modern dan responsif

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - Express API   │    │ - Employee      │
│ - RFID Monitor  │    │ - Socket.IO     │    │ - RfidScan      │
│ - Employee CRUD │    │ - Serial Port   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                       ┌───────▼────────┐
                       │  RFID Reader   │
                       │   (COM Port)   │
                       └────────────────┘
```

## 📋 Prasyarat

### Software yang Diperlukan:
- **Node.js** v16+ 
- **MongoDB** Community Server
- **RFID Reader** yang terhubung via Serial Port (opsional untuk testing)

### Hardware (Opsional):
- RFID Reader dengan koneksi USB/Serial
- Kartu RFID untuk testing

## ⚙️ Instalasi & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd Productivity
```

### 2. Setup Backend
```bash
cd MERN_backend
npm install
```

### 3. Setup Frontend
```bash
cd React-Frontend
npm install
```

### 4. Konfigurasi MongoDB
- Pastikan MongoDB berjalan di `mongodb://localhost:27017`
- Database akan dibuat otomatis dengan nama `rfidData`

### 5. Konfigurasi RFID Reader (Opsional)
- Hubungkan RFID Reader ke komputer
- Update port COM di `MERN_backend/server.js` (default: COM3)
- Untuk Linux/Mac, ganti dengan `/dev/ttyUSB0` atau sesuai port yang tersedia

## 🚀 Menjalankan Sistem

### Cara 1: Menggunakan Batch Script (Windows)
```bash
# Jalankan dari root directory
start_rfid_system.bat
```

### Cara 2: Manual

**Terminal 1 - Backend:**
```bash
cd MERN_backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd React-Frontend
npm run dev
```

## 🌐 Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📡 API Endpoints

### RFID Scans
- `GET /api/scans` - Ambil semua data scan
- `GET /api/scans/:uid` - Ambil scan berdasarkan UID
- `POST /api/scans` - Tambah scan manual
- `DELETE /api/scans/:id` - Hapus scan

### Employees
- `GET /api/employees` - Ambil semua karyawan
- `GET /api/employees/:id` - Ambil karyawan berdasarkan ID
- `POST /api/employees` - Tambah karyawan baru
- `PUT /api/employees/:id` - Update karyawan
- `DELETE /api/employees/:id` - Hapus karyawan
- `GET /api/employees/stats/overview` - Statistik karyawan

## 🎯 Cara Penggunaan

### 1. Dashboard Utama
- Lihat statistik karyawan real-time
- Klik **"Kelola Data Karyawan"** untuk CRUD operasi
- Klik **"Monitor RFID Real-time"** untuk monitoring

### 2. Kelola Data Karyawan
- **Tambah**: Isi form dan klik "Add"
- **Update**: Pilih data, edit form, klik "Up"
- **Hapus**: Pilih data, klik "Del"
- **Pencarian**: Gunakan search bar atau form filter

### 3. RFID Monitor
- Monitor scan real-time akan muncul otomatis
- Test scan manual dengan memasukkan UID
- Hapus scan dengan klik tombol 🗑️

## 🔧 Troubleshooting

### Backend Tidak Terkoneksi
```bash
# Cek status backend
curl http://localhost:5000/api/health
```

### MongoDB Error
```bash
# Cek status MongoDB
mongosh --eval "db.adminCommand('ismaster')"
```

### RFID Reader Error
- Pastikan port COM benar di `server.js`
- Cek Device Manager untuk port yang tersedia
- Driver RFID reader sudah terinstall

### Port Sudah Digunakan
```bash
# Kill process di port 5000
npx kill-port 5000

# Kill process di port 3000
npx kill-port 3000
```

## 📂 Struktur Project

```
Productivity/
├── MERN_backend/           # Backend Node.js
│   ├── models/            # Model database
│   │   ├── Employee.js    # Model karyawan
│   │   └── RfidScan.js   # Model scan RFID
│   ├── db.js             # Konfigurasi MongoDB
│   ├── server.js         # Server utama
│   └── package.json      # Dependencies backend
│
├── React-Frontend/        # Frontend React
│   ├── src/
│   │   ├── components/   # Komponen React
│   │   │   ├── DaftarID.jsx     # CRUD Karyawan
│   │   │   ├── RfidMonitor.jsx  # Monitor RFID
│   │   │   └── Sidebar.jsx      # Navigation
│   │   ├── services/     # API Services
│   │   │   └── api.js    # HTTP client
│   │   └── App.jsx       # Komponen utama
│   └── package.json      # Dependencies frontend
│
├── start_rfid_system.bat  # Script launcher
└── README_SISTEM_RFID.md  # Dokumentasi ini
```

## 🛡️ Keamanan

- CORS dikonfigurasi untuk localhost
- Input validation pada semua endpoint
- Error handling yang komprehensif
- Graceful shutdown untuk serial port

## 🔄 Update & Maintenance

### Update Dependencies
```bash
# Backend
cd MERN_backend
npm update

# Frontend  
cd React-Frontend
npm update
```

### Backup Database
```bash
mongodump --db rfidData --out backup/
```

### Restore Database
```bash
mongorestore --db rfidData backup/rfidData/
```

## 📞 Support

Jika mengalami masalah:

1. **Cek log console** di browser dan terminal
2. **Restart sistem** dengan batch script
3. **Cek koneksi MongoDB** dan RFID reader
4. **Pastikan port tidak bentrok** dengan aplikasi lain

## 🏆 Fitur Mendatang

- [ ] Authentication & Authorization
- [ ] Report generation (PDF/Excel)
- [ ] Email notifications
- [ ] Mobile app companion
- [ ] Advanced analytics dashboard
- [ ] Multi-location support

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Sistem RFID real-time monitoring
- ✅ CRUD operasi karyawan
- ✅ Dashboard dengan statistik
- ✅ WebSocket integration
- ✅ Serial port RFID reader support
- ✅ Responsive design

---

**© 2024 Sistem RFID Productivity - MERN Stack** 