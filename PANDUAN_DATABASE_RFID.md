# 📋 Panduan Database RFID dan Perubahan Design

## 🗄️ Konfigurasi Database

### Database Connection
- **Database Name**: `RFID` (semua huruf kapital)
- **Connection String**: `mongodb://localhost:27017/RFID`
- **Collection**: `karyawan`

### Struktur Data Karyawan
```javascript
{
  _id: ObjectId,
  idCard: "4300409172E0",      // RFID Card ID
  nama: "Ahmad Ridwan",        // Nama Karyawan
  nik: "EMP001",              // NIK Karyawan
  bagian: "Cutting",          // Bagian Kerja
  line: "A1",                 // Line Produksi
  fasilitas: "Transport",     // Fasilitas
  status: "aktif",            // Status: aktif/non-aktif/cuti
  createdAt: Date,            // Tanggal dibuat
  updatedAt: Date             // Tanggal update terakhir
}
```

## 🎨 Perubahan Design

### ✅ Yang TIDAK Berubah (Tetap Design Baru)
1. **Daftar ID** - Layout 2 kolom dengan form di kiri, tabel di kanan
2. **RFID Monitor** - Full-screen dengan card layout dan real-time monitoring
3. **Test RFID Reader** - Professional UI dengan data testing

### ✅ Yang Dikembalikan (Design Dashboard Lama)
1. **Daftar Karyawan** - Card-based dashboard dengan:
   - Header dengan gradient background
   - Grid layout untuk cards statistik
   - Total Karyawan, Karyawan Aktif, dll.
   - Refresh button untuk reload data

2. **Data SMV** - (Future: Card dashboard untuk data SMV)
3. **Data Layout** - (Future: Card dashboard untuk layout)
4. **Productivity** - (Future: Card dashboard untuk productivity)
5. **Report** - (Future: Card dashboard untuk reports)

## 🔧 File Yang Diubah

### Backend Changes
1. **`db.js`**: Connection string ke database `RFID`
2. **`models/Employee.js`**: Collection name `karyawan`
3. **`server.js`**: API endpoints tetap sama, mengakses collection karyawan

### Frontend Changes
1. **`App.css`**: 
   - Kembalikan styling dashboard untuk main-content
   - Page header styling scoped ke dashboard-header
   - Card dan grid styling dipertahankan

2. **Component Files**: Tidak ada perubahan pada Daftar ID, RFID Monitor, Test RFID Reader

## 🧪 Testing Database

### Test Connection
```bash
cd MERN_backend
node testConnection.js
```

### Expected Output
```
🔄 Testing connection to MongoDB RFID database...
✅ Connected to RFID database successfully!

📋 Sample data from karyawan collection:
Total employees found: [number]

1. Employee: {
  _id: 6879efd5ef6e656f1f718dc4,
  idCard: "4300409172E0",
  nama: "Ahmad Ridwan",
  nik: "EMP001",
  bagian: "Cutting",
  line: "A1",
  fasilitas: "Transport",
  status: "aktif",
  createdAt: 2024-01-15T07:30:00.000Z
}

🔍 Found test employee Ahmad Ridwan: {
  nama: "Ahmad Ridwan",
  bagian: "Cutting", 
  line: "A1"
}
```

## 🚀 API Endpoints

### Employee Management
- `GET /api/employees` - Get all employees from karyawan collection
- `GET /api/employees/:id` - Get specific employee
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/rfid/:rfidId` - Find employee by RFID ID
- `GET /api/employees/stats/overview` - Get employee statistics

### RFID Scan Management  
- `GET /api/scans` - Get all RFID scans
- `POST /api/scans` - Create new scan
- `DELETE /api/scans/:id` - Delete scan
- `DELETE /api/scans/clear-all` - Clear all scan history

## 🎯 Next Steps

1. **Populate Database**: Import data karyawan ke collection `karyawan`
2. **Test API**: Verify all endpoints work with real database
3. **Test RFID**: Ensure RFID scanning works with database data
4. **Add More Features**: Implement SMV, Layout, Productivity, Report dashboards

## ⚠️ Important Notes

- Database harus running di `localhost:27017`
- Collection `karyawan` harus exist dengan data yang valid
- RFID IDs harus unique dan dalam format uppercase
- Status values: `aktif`, `non-aktif`, `cuti` 