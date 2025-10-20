# 🔧 Troubleshooting Backend RFID System

## ❌ **Error: Missing parameter name at 1**

### **Penyebab:**
- Express.js v5.1.0 (beta) tidak kompatibel dengan `path-to-regexp`
- Konflik dependencies dengan routing system

### **Solusi:**
```bash
# 1. Jalankan script setup otomatis
setup_backend.bat

# 2. Atau manual:
cd MERN_backend
del package-lock.json
rmdir /s /q node_modules
npm cache clean --force
npm install
```

## 🔌 **WebSocket Terputus / Backend Offline**

### **Penyebab:**
- MongoDB tidak berjalan
- Port 5000 sudah digunakan aplikasi lain
- Dependencies tidak terinstall dengan benar

### **Solusi:**

#### **A. Cek MongoDB (Opsional)**
```bash
# Windows
net start MongoDB
# atau
mongod

# Cek status
mongosh --eval "db.adminCommand('ismaster')"
```

#### **B. Cek Port 5000**
```bash
# Windows
netstat -ano | findstr :5000
# Kill process jika ada
taskkill /PID <PID_NUMBER> /F
```

#### **C. Mode Fallback (Tanpa MongoDB)**
Sistem dirancang untuk tetap berjalan tanpa MongoDB menggunakan dummy data.

## 📡 **RFID Data & Simulator**

### **Fitur Simulator:**
- **Auto Scan:** Setiap 30 detik mengirim scan random
- **Manual Test:** Endpoint `/api/scans` untuk test manual
- **Dummy Data:** 12 karyawan dan 10 scan history

### **Dummy Data Location:**
- `MERN_backend/dummy-data/employees-dummy.json`
- `MERN_backend/dummy-data/rfid-dummy.json`

## 🚀 **Status Check Commands**

### **Backend Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Server backend berjalan dengan baik",
  "status": {
    "mongo": "connected|offline",
    "clients": 0,
    "rfidSimulator": "active"
  }
}
```

### **Database Check:**
```bash
# Via API
curl http://localhost:5000/api/employees/stats/overview

# Direct MongoDB
mongosh rfidData --eval "db.employees.count()"
```

## 📝 **Log Analysis**

### **Startup Logs (Normal):**
```
✅ MongoDB terhubung dengan sukses
✅ Dummy data karyawan berhasil di-seed
✅ Dummy data RFID scans berhasil di-seed
🤖 RFID Simulator dimulai (scan otomatis setiap 30 detik)
🚀 SERVER RFID PRODUCTIVITY BERHASIL DIMULAI
📡 Backend Server: http://localhost:5000
🔗 Socket.IO: Ready untuk real-time connection
💾 Database: MongoDB Connected
```

### **Startup Logs (Fallback Mode):**
```
❌ MongoDB connection failed: MongooseServerSelectionError
⚠️  Server tetap berjalan tanpa database (mode fallback)
🤖 RFID Simulator dimulai (scan otomatis setiap 30 detik)
🚀 SERVER RFID PRODUCTIVITY BERHASIL DIMULAI
💾 Database: Offline Mode (Dummy Data)
```

## 🐛 **Common Errors & Solutions**

### **1. TypeError: Missing parameter name**
```bash
# Downgrade Express to 4.x
npm uninstall express
npm install express@^4.19.2
```

### **2. MongooseServerSelectionError**
```bash
# Start MongoDB service
net start MongoDB
# atau install MongoDB Community Server
```

### **3. EADDRINUSE: Port 5000**
```bash
# Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### **4. Module not found: axios**
```bash
cd React-Frontend
npm install axios socket.io-client
```

## 🔄 **Reset System (Nuclear Option)**

Jika semua gagal, reset komplet:

```bash
# 1. Stop semua process
taskkill /f /im node.exe
taskkill /f /im npm.exe

# 2. Clean backend
cd MERN_backend
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install

# 3. Clean frontend
cd ../React-Frontend  
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install

# 4. Restart system
cd ..
start_rfid_system.bat
```

## 📞 **Support Contacts**

- **Backend Issues:** Cek log di terminal backend
- **Frontend Issues:** Cek developer console browser (F12)
- **Database Issues:** Cek MongoDB service status
- **RFID Issues:** Gunakan test scan manual di RFID Monitor

## 🎯 **Quick Test Commands**

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test employee API
curl http://localhost:5000/api/employees

# Test RFID API
curl http://localhost:5000/api/scans

# Manual RFID scan
curl -X POST http://localhost:5000/api/scans -H "Content-Type: application/json" -d "{\"uid\":\"TEST123\"}"
```

---

**✅ Sistem dirancang untuk robust dengan fallback mode, jadi tidak perlu khawatir jika MongoDB offline!** 