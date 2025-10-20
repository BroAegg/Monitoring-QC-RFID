# 🔧 Panduan TEST RFID Reader

## Deskripsi
Sistem TEST RFID Reader memungkinkan Anda untuk menguji komunikasi serial langsung dengan RFID reader ESP32 melalui port COM4. Sistem ini dapat membaca data RFID secara real-time dan menampilkannya di website.

## ⚡ Setup Cepat

### 1. Install Dependencies Backend
```bash
cd MERN_backend
npm install serialport
```

### 2. Pastikan ESP32 Terhubung
- Hubungkan ESP32 RFID reader ke komputer via USB
- Pastikan driver CH340/CP210x sudah terinstall
- Cek Device Manager bahwa device terdeteksi di COM4

### 3. Jalankan Backend
```bash
cd MERN_backend
npm start
```

### 4. Jalankan Frontend
```bash
cd React-Frontend
npm run dev
```

### 5. Akses Test Page
- Buka browser ke `http://localhost:5173`
- Klik menu **"TEST RFID Reader"** di sidebar

## 🔧 Fitur TEST RFID Reader

### Status Panel
- **Backend Connection**: Status koneksi ke server backend
- **Serial COM4**: Status koneksi ke port COM4
- **Last Scan**: Waktu scan RFID terakhir

### Control Panel
- **📡 Connect COM4**: Memulai koneksi serial ke port COM4
- **⏹️ Disconnect**: Menghentikan koneksi serial
- **🎲 Simulate Test Data**: Mensimulasikan data RFID untuk testing
- **🗑️ Clear Data**: Menghapus semua data yang ditampilkan

### Data Display
- Menampilkan data RFID real-time dari ESP32
- Format: `ID Kartu Terdeteksi: XXXXXXXXXXXX`
- Maksimal 20 entries terakhir
- Auto-scroll untuk data terbaru

### Test Data Reference
Sistem menyediakan 9 data test RFID:
1. `43003DC71EA7`
2. `430044A2C560`
3. `43003DEEEF7F`
4. `4300403F714D`
5. `430044079696`
6. `43004484AE2D`
7. `4300445CFBA0`
8. `4300447C0972`
9. `43004451D583`

## 📱 Penggunaan

### Testing dengan ESP32 Real
1. Pastikan ESP32 RFID sudah terprogram dengan code dari folder `RFID_ESP32`
2. Hubungkan ESP32 ke komputer via USB (COM4)
3. Di website, klik **"Connect COM4"**
4. Tunggu status berubah menjadi **"Connected"**
5. Tempelkan kartu RFID ke reader
6. Data akan muncul real-time di website

### Testing dengan Simulasi
1. Tanpa perlu ESP32 terhubung
2. Klik **"Simulate Test Data"**
3. Sistem akan generate data RFID random dari test data
4. Berguna untuk testing UI dan fungsionalitas

## 🛠️ Troubleshooting

### COM4 Not Found
```
Error: Port COM4 tidak ditemukan
```
**Solusi:**
- Cek Device Manager, pastikan ESP32 terdeteksi
- Install driver CH340 atau CP210x
- Coba port lain (COM3, COM5, etc.)
- Restart ESP32 dan komputer

### Connection Failed
```
Error: Access denied to COM4
```
**Solusi:**
- Tutup Arduino IDE atau Serial Monitor lain
- Pastikan tidak ada aplikasi lain yang menggunakan COM4
- Run aplikasi sebagai Administrator
- Restart ESP32

### No Data Received
```
ESP32 terhubung tapi tidak ada data
```
**Solusi:**
- Pastikan ESP32 sudah terprogram dengan code yang benar
- Cek baudrate (harus 9600)
- Reset ESP32
- Cek koneksi RFID reader ke ESP32

### Backend Connection Failed
```
Disconnected from Backend
```
**Solusi:**
- Pastikan backend server berjalan di port 5000
- Cek `http://localhost:5000/api/health`
- Restart backend server
- Cek firewall settings

## 🔍 Monitoring & Debug

### Console Logs Backend
```bash
# Log koneksi serial
🔌 Mencoba menghubungkan ke COM4 dengan baudrate 9600...
✅ Serial RFID reader berhasil terhubung ke COM4

# Log data diterima
📨 Data serial diterima: "ID Kartu Terdeteksi: 43003DC71EA7"
🏷️  RFID UID terdeteksi: 43003DC71EA7
```

### Browser Console
```javascript
// Cek koneksi WebSocket
console.log('WebSocket connected:', socket.connected);

// Listen untuk data RFID
socket.on('rfid_serial_data', (data) => {
    console.log('RFID Data:', data);
});
```

### API Endpoints
```bash
# Cek status serial
GET http://localhost:5000/api/serial/status

# Cek port yang tersedia
GET http://localhost:5000/api/serial/ports

# Start koneksi manual
POST http://localhost:5000/api/serial/connect
{
    "port": "COM4",
    "baudRate": 9600
}
```

## ⚙️ Konfigurasi

### Mengganti Port
Jika ESP32 tidak di COM4, edit di `TestRfidReader.jsx`:
```javascript
const handleStartSerial = () => {
    if (socket) {
        socket.emit('start_serial_connection', { 
            port: 'COM3', // Ganti sesuai port
            baudRate: 9600 
        });
    }
};
```

### Mengganti Baudrate
Jika menggunakan baudrate berbeda, edit di backend dan frontend:
```javascript
// Frontend
{ port: 'COM4', baudRate: 115200 }

// Arduino code
Serial.begin(115200);
RFID.begin(115200, SERIAL_8N1, RFID_RX_PIN, RFID_TX_PIN);
```

## 🔧 Development

### Menambah Fitur
File yang perlu dimodifikasi:
- `MERN_backend/serialRfidReader.js` - Logic serial communication
- `React-Frontend/src/components/TestRfidReader.jsx` - UI component
- `React-Frontend/src/components/TestRfidReader.css` - Styling
- `MERN_backend/server.js` - WebSocket events & API endpoints

### Testing
```bash
# Test tanpa ESP32
npm run test:simulation

# Test dengan mock data
npm run test:mock
```

## 📞 Support

Jika mengalami masalah:
1. Cek log console backend dan frontend
2. Pastikan semua dependencies terinstall
3. Verifikasi ESP32 dan driver USB
4. Coba dengan data simulasi terlebih dahulu
5. Restart semua services (backend, frontend, ESP32)

---
*Dibuat untuk sistem Productivity RFID - Testing & Development Mode* 