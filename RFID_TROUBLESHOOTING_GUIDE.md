# 🔍 Panduan Troubleshooting RFID System

## 📋 Masalah yang Ditemukan

### 1. **Unknown Employee di Monitoring**
- **Gejala**: RFID terdeteksi tapi menampilkan "Unknown Employee"
- **Penyebab**: Data employee tidak dimuat dengan benar di state Monitoring
- **Solusi**: ✅ **DIPERBAIKI** - Menambahkan logging detail dan memastikan data employee dimuat dengan benar

### 2. **Data Tidak Muncul di Daftar ID**
- **Gejala**: RFID scan berhasil tapi table tidak menampilkan data
- **Penyebab**: Data employee ditemukan via API tapi tidak di-refresh di tableData
- **Solusi**: ✅ **DIPERBAIKI** - Menambahkan auto-refresh ketika employee tidak ditemukan di tableData

### 3. **Inkonsistensi Pencarian**
- **Gejala**: Pencarian berhasil di satu halaman tapi gagal di halaman lain
- **Penyebab**: Perbedaan format data antara Monitoring dan DaftarID
- **Solusi**: ✅ **DIPERBAIKI** - Menyeragamkan format data dan menambahkan case-insensitive matching

## 🔧 Perbaikan yang Telah Dilakukan

### 1. **Model Employee (`MERN_backend/models/Employee.js`)**
```javascript
// Static method untuk mencari employee berdasarkan RFID UID
EmployeeSchema.statics.findByRfidUid = function (uid) {
    if (!uid) {
        console.log('⚠️ findByRfidUid: UID kosong');
        return null;
    }
    
    // Normalize UID - remove spaces, convert to uppercase
    const normalizedUid = uid.toString().trim().toUpperCase();
    console.log(`🔍 findByRfidUid: Searching for "${normalizedUid}" (original: "${uid}")`);
    
    // Try exact match first
    return this.findOne({ idCard: normalizedUid })
        .then(employee => {
            if (employee) {
                console.log(`✅ Employee found: ${employee.nama} (${employee.idCard})`);
                return employee;
            } else {
                console.log(`❌ Employee not found for UID: ${normalizedUid}`);
                // Try case-insensitive search as fallback
                return this.findOne({ idCard: { $regex: new RegExp(`^${normalizedUid}$`, 'i') } });
            }
        })
        .then(employee => {
            if (employee) {
                console.log(`✅ Employee found (case-insensitive): ${employee.nama} (${employee.idCard})`);
            }
            return employee;
        })
        .catch(error => {
            console.error('❌ Error in findByRfidUid:', error);
            return null;
        });
};
```

### 2. **Server Backend (`MERN_backend/server.js`)**
```javascript
// Event handler untuk RFID scan yang akan disimpan ke database
socket.on('new_rfid_scan', async (data) => {
    try {
        console.log(`🔍 Processing RFID scan: ${data.uid}`);

        // Cari karyawan berdasarkan RFID ID di database
        let employee = null;
        let newScan = null;

        if (!isMongoConnected) {
            console.log('⚠️  Database tidak tersedia, scan diabaikan');
            return;
        }

        // Cari employee berdasarkan idCard dengan logging detail
        console.log(`🔍 Searching for employee with RFID ID: "${data.uid}"`);
        employee = await Employee.findByRfidUid(data.uid);

        if (!employee) {
            console.log(`⚠️  RFID ID ${data.uid} tidak ditemukan di database`);
            console.log(`💡 Available employees in database:`);
            const allEmployees = await Employee.find({}, 'idCard nama');
            allEmployees.forEach(emp => {
                console.log(`   - ${emp.idCard} -> ${emp.nama}`);
            });
            // Tetap simpan scan meskipun employee tidak ditemukan
        } else {
            console.log(`✅ Employee found: ${employee.nama} (${employee.idCard})`);
        }

        // Simpan scan ke database
        newScan = await RfidScan.findOneAndUpdate(
            { uid: data.uid },
            {
                scannedAt: new Date(),
                employeeId: employee ? employee._id : null,
                employeeName: employee ? employee.nama : null
            },
            { new: true, upsert: true }
        );

        // Emit scan dengan data karyawan ke semua client
        io.emit('new_scan', {
            ...newScan,
            employee: employee,
            source: data.source || 'unknown'
        });

        console.log(`✅ RFID scan processed: ${data.uid} - ${employee ? employee.nama : 'Unknown'}`);

    } catch (error) {
        console.error('❌ Error processing RFID scan:', error);
    }
});
```

### 3. **Frontend Monitoring (`React-Frontend/src/components/Monitoring.jsx`)**
```javascript
/**
 * Handle real-time scan dengan data karyawan lengkap
 */
const handleRealtimeScan = (uid) => {
    try {
        console.log(`🔍 Monitoring: Real-time scan detected: ${uid}`);
        console.log(`🔍 Available employees count: ${employees.length}`);
        
        // Log semua employee untuk debugging
        console.log('🔍 All employees in state:');
        employees.forEach((emp, index) => {
            console.log(`   ${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
        });
        
        // Cari employee dengan case-insensitive matching
        const employee = employees.find(emp => {
            const match = emp.idCard && emp.idCard.toUpperCase() === uid.toUpperCase();
            console.log(`   Comparing: "${emp.idCard}" with "${uid}" -> ${match}`);
            return match;
        });

        console.log(`✅ Employee found: ${employee ? employee.nama : 'Not found'}`);

        // ... rest of the function
    } catch (error) {
        console.error('❌ Error handling real-time scan:', error);
        showMessage('Error processing real-time scan', 'error');
    }
};
```

### 4. **Frontend DaftarID (`React-Frontend/src/components/DaftarID.jsx`)**
```javascript
/**
 * Menangani RFID scan untuk karyawan yang sudah ada
 */
const handleRfidEmployeeFound = (scanData) => {
    const employee = scanData.employee;
    console.log(`🔍 DaftarID: Searching for employee in tableData with RFID: ${scanData.uid}`);
    console.log(`🔍 Employee from API: ${employee.nama} (${employee.idCard})`);
    console.log(`🔍 Current tableData count: ${tableData.length}`);

    // Log semua data di tableData untuk debugging
    console.log('🔍 All employees in tableData:');
    tableData.forEach((emp, index) => {
        console.log(`   ${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
    });

    // Auto search karyawan berdasarkan RFID ID (case-insensitive match)
    const searchResults = tableData.filter(emp => {
        const match = emp.idCard && emp.idCard.toUpperCase() === scanData.uid.toUpperCase();
        console.log(`   Comparing: "${emp.idCard}" with "${scanData.uid}" -> ${match}`);
        return match;
    });

    console.log(`✅ Found ${searchResults.length} matching employees in tableData`);

    // Jika tidak ditemukan di tableData, refresh data dari backend
    if (searchResults.length === 0) {
        console.log('⚠️ Employee not found in tableData, refreshing from backend...');
        loadEmployees().then(() => {
            // Setelah refresh, cari lagi
            const refreshedTableData = tableData;
            const refreshedSearchResults = refreshedTableData.filter(emp => 
                emp.idCard && emp.idCard.toUpperCase() === scanData.uid.toUpperCase()
            );
            
            if (refreshedSearchResults.length > 0) {
                setFilteredData(refreshedSearchResults);
                console.log(`✅ Found ${refreshedSearchResults.length} employees after refresh`);
            } else {
                console.log('❌ Still not found after refresh');
            }
        });
    } else {
        setFilteredData(searchResults);
    }

    // Update form dengan data karyawan yang ditemukan
    setFormData({
        id: employee.idCard,
        nama: employee.nama,
        nik: employee.nik,
        bagian: employee.bagian,
        line: employee.line,
        fasilitas: employee.fasilitas
    });

    showSmallNotification(
        `✅ RFID Found: ${employee.nama} (${employee.bagian} - ${employee.line})`,
        'success'
    );
};
```

## 🛠️ Script Debug dan Perbaikan

### 1. **Debug RFID (`MERN_backend/debugRfid.js`)**
```bash
cd MERN_backend
node debugRfid.js
```
- Mengecek fungsi `findByRfidUid`
- Test pencarian dengan berbagai format
- Debug data format

### 2. **Fix RFID Data (`MERN_backend/fixRfidData.js`)**
```bash
cd MERN_backend
node fixRfidData.js
```
- Memperbaiki format RFID ID
- Menambahkan data test jika diperlukan
- Test pencarian setelah perbaikan

### 3. **Test Database (`MERN_backend/testDatabase.js`)**
```bash
cd MERN_backend
node testDatabase.js
```
- Mengecek data RFID di database
- Test pencarian dengan RFID yang ada
- Memperbaiki format RFID jika diperlukan

## 🚀 Langkah Troubleshooting

### 1. **Jalankan Script Debug**
```bash
cd MERN_backend
node debugRfid.js
```

### 2. **Perbaiki Data RFID**
```bash
cd MERN_backend
node fixRfidData.js
```

### 3. **Restart Backend Server**
```bash
cd MERN_backend
npm start
```

### 4. **Test RFID Scanning**
- Scan RFID di halaman Monitoring
- Scan RFID di halaman Daftar ID
- Periksa console log di browser dan terminal

### 5. **Periksa Console Log**
- **Browser Console**: Lihat log dari frontend
- **Terminal Backend**: Lihat log dari server
- **Database Log**: Lihat log dari MongoDB

## 📊 Data Test yang Seharusnya Bekerja

```json
{
  "idCard": "43003DC71EA7",
  "nama": "Wahyu Setiawan",
  "nik": "EMP002",
  "bagian": "Finishing",
  "line": "C3",
  "fasilitas": "Transport",
  "status": "aktif"
}
```

## ✅ Hasil yang Diharapkan

1. **Monitoring**: RFID scan menampilkan "Wahyu Setiawan (Finishing - C3)"
2. **Daftar ID**: RFID scan menampilkan data di table dan mengisi form
3. **Console Log**: Menampilkan detail proses pencarian dan hasilnya

## 🔍 Tips Debugging

1. **Periksa Format RFID**: Pastikan format RFID di database sama dengan yang di-scan
2. **Case Sensitivity**: Gunakan case-insensitive matching
3. **Data Loading**: Pastikan data employee dimuat dengan benar di frontend
4. **Network Issues**: Periksa koneksi antara frontend dan backend
5. **Database Connection**: Pastikan MongoDB berjalan dan terhubung

## 📞 Support

Jika masalah masih berlanjut:
1. Jalankan script debug dan share hasilnya
2. Periksa console log browser dan terminal
3. Pastikan semua service berjalan dengan benar
4. Restart semua service jika diperlukan 