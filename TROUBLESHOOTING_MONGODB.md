# 🔧 Troubleshooting MongoDB Connection

## ❌ Masalah yang Diperbaiki

### 1. Error: "option buffermaxentries is not supported"

**Penyebab**: Connection options deprecated/tidak supported di MongoDB driver versi baru.

**Solusi**: 
- ✅ Hapus `bufferMaxEntries: 0` dan `bufferCommands: false`
- ✅ Hapus `useNewUrlParser: true` dan `useUnifiedTopology: true` (deprecated)

**Sebelum**:
```javascript
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferMaxEntries: 0,
    bufferCommands: false,
    // ... other options
};
```

**Sesudah**:
```javascript
const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
};
```

### 2. Warning: Duplicate Schema Index

**Penyebab**: Field dengan `unique: true` sudah otomatis membuat index, tidak perlu manual `schema.index()`.

**Solusi**:
- ✅ Hapus `EmployeeSchema.index({ idCard: 1 })` 
- ✅ Hapus `EmployeeSchema.index({ nik: 1 })`

**Penjelasan**: 
```javascript
// Field unique sudah otomatis indexed
idCard: { unique: true } // ← Mongoose otomatis buat index
nik: { unique: true }    // ← Mongoose otomatis buat index

// Tidak perlu manual index lagi:
// EmployeeSchema.index({ idCard: 1 }); // ← HAPUS INI
// EmployeeSchema.index({ nik: 1 });    // ← HAPUS INI
```

## 🧪 Testing Connection

### Test 1: Basic Connection
```bash
cd MERN_backend
node testConnection.js
```

### Test 2: Server-Style Connection  
```bash
cd MERN_backend
node testServerConnection.js
```

### Test 3: Full Server Start
```bash
cd MERN_backend
npm start
```

## ✅ Expected Results

### Successful Connection Output:
```
🔄 Testing server database connection...
Using same configuration as server.js

✅ MongoDB terhubung dengan sukses

📊 Testing database operations:
📋 Total employees: 20
👤 Sample employee: {
  idCard: "4300409172E0",
  nama: "Ahmad Ridwan", 
  bagian: "Cutting",
  line: "A1"
}
🔍 RFID search test: ✅ SUCCESS

✅ All database tests passed!

🏁 Final status: CONNECTED
```

### Server Start Output:
```
✅ MongoDB terhubung dengan sukses
🤖 RFID Simulator dimulai
🚀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🚀
🌟 SERVER RFID PRODUCTIVITY BERHASIL DIMULAI 🌟
🔗 Backend Server running on http://localhost:5000
🔗 Socket.IO Server ready for connections
🔗 Serial RFID Reader available on: null
🚀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🚀
```

## 🔍 Debugging Commands

### Check MongoDB Status:
```bash
# Windows
net start MongoDB

# Check if MongoDB is running
tasklist | find "mongod"
```

### Check Database and Collection:
```bash
# Connect to MongoDB shell
mongosh

# Use RFID database
use RFID

# Show collections
show collections

# Count documents in karyawan collection
db.karyawan.countDocuments()

# Show sample document
db.karyawan.findOne()
```

## 📋 Checklist Troubleshooting

- [ ] MongoDB service running di localhost:27017
- [ ] Database `RFID` exists
- [ ] Collection `karyawan` exists dan ada data
- [ ] Connection options compatible dengan MongoDB driver versi terbaru
- [ ] Tidak ada duplicate index definitions
- [ ] Environment variables set dengan benar (jika ada)

## ⚠️ Common Issues

1. **MongoDB tidak running**: 
   - Windows: `net start MongoDB`
   - Check port 27017: `netstat -an | find "27017"`

2. **Database/Collection tidak ada**:
   - Import data ke collection `karyawan`
   - Pastikan struktur data sesuai schema

3. **Permission issues**:
   - Check MongoDB user permissions
   - Pastikan tidak ada firewall blocking

4. **Version compatibility**:
   - MongoDB driver >= 4.0.0 tidak perlu deprecated options
   - Mongoose >= 6.0.0 sudah tidak perlu `useNewUrlParser` 