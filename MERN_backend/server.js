// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Import DB dan Models
const { connectDB } = require('./db');
const RfidScan = require('./models/RfidScan');
const Employee = require('./models/Employee');

// Import Serial RFID Reader
const SerialRfidReader = require('./serialRfidReader');

// ===== DATA SEKARANG 100% DARI DATABASE MONGODB =====
// Tidak ada lagi data dummy atau JSON files

// Inisialisasi Express App
const app = express();

// Middleware
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create HTTP server dan Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Global variables
let isMongoConnected = false;
let connectedClients = new Set();

// Inisialisasi Serial RFID Reader
const serialRfidReader = new SerialRfidReader();

// ------------------- DATABASE CONNECTION -------------------

/**
 * Inisialisasi koneksi database dengan error handling
 */
const initializeDatabase = async () => {
    try {
        await connectDB();
        isMongoConnected = true;
        console.log('✅ MongoDB terhubung dengan sukses');

        // Check existing data
        const employeeCount = await Employee.countDocuments();
        const scanCount = await RfidScan.countDocuments();
        console.log(`📊 Database ready: ${employeeCount} karyawan, ${scanCount} scan records`);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('⚠️  Server tetap berjalan tanpa database (mode fallback)');
        isMongoConnected = false;
    }
};

// ===== SEEDING DIHAPUS - SEMUA DATA DARI DATABASE REAL =====

// ------------------- SOCKET.IO CONNECTION -------------------

/**
 * Setup SerialRfidReader dengan Socket.IO
 */
serialRfidReader.setSocketIO(io);

/**
 * Mengelola koneksi WebSocket client
 */
io.on('connection', (socket) => {
    connectedClients.add(socket.id);
    console.log(`🔗 Client terhubung: ${socket.id} (Total: ${connectedClients.size})`);

    // Send welcome message dengan status server
    socket.emit('server_status', {
        mongoConnected: isMongoConnected,
        serialConnected: serialRfidReader.getStatus().connected,
        realDataOnly: true, // Semua data dari database real
        timestamp: new Date()
    });

    // Send status serial connection
    socket.emit('serial_status', {
        connected: serialRfidReader.getStatus().connected,
        port: serialRfidReader.getStatus().port,
        message: serialRfidReader.getStatus().connected ?
            `Terhubung ke ${serialRfidReader.getStatus().port}` :
            'Serial tidak terhubung'
    });

    // Event handler untuk memulai koneksi serial
    socket.on('start_serial_connection', async (data) => {
        console.log(`📡 Request start serial connection: ${data.port} @ ${data.baudRate}`);
        const success = await serialRfidReader.connect(data.port, data.baudRate);

        if (success) {
            socket.emit('serial_status', {
                connected: true,
                port: data.port,
                baudRate: data.baudRate,
                message: `Berhasil terhubung ke ${data.port}`
            });
        }
    });

    // Event handler untuk menghentikan koneksi serial
    socket.on('stop_serial_connection', async () => {
        console.log('🛑 Request stop serial connection');
        const success = await serialRfidReader.disconnect();

        if (success) {
            socket.emit('serial_status', {
                connected: false,
                port: serialRfidReader.getStatus().port,
                message: 'Koneksi serial dihentikan'
            });
        }
    });

    // Event handler untuk mendapatkan status serial
    socket.on('get_serial_status', () => {
        const status = serialRfidReader.getStatus();
        socket.emit('serial_status', {
            connected: status.connected,
            port: status.port,
            baudRate: status.baudRate,
            reconnectAttempts: status.reconnectAttempts,
            message: status.connected ?
                `Terhubung ke ${status.port}` :
                'Serial tidak terhubung'
        });
    });

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

    socket.on('disconnect', () => {
        connectedClients.delete(socket.id);
        console.log(`❌ Client terputus: ${socket.id} (Total: ${connectedClients.size})`);
    });
});

// ===== RFID SIMULATOR DIHAPUS - SEKARANG REAL DATA ONLY =====

// ------------------- API ROUTES -------------------

/**
 * Middleware untuk logging request
 */
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server backend berjalan dengan baik',
        status: {
            mongo: isMongoConnected ? 'connected' : 'offline',
            clients: connectedClients.size,
            rfidSimulator: 'active'
        },
        timestamp: new Date(),
        port: PORT
    });
});

// ------------------- RFID SCAN API -------------------

/**
 * Endpoint untuk mengambil semua data scan RFID
 */
app.get('/api/scans', async (req, res) => {
    try {
        let scans;

        if (isMongoConnected) {
            scans = await RfidScan.find().sort({ scannedAt: -1 }).limit(100);
        } else {
            // Fallback ke data RFID scan dari karyawan
            scans = rfidScanData.map((item, index) => ({
                _id: `rfid_${index}`,
                uid: item.uid,
                scannedAt: item.scannedAt
            })).reverse();
        }

        res.json({
            success: true,
            data: scans,
            count: scans.length,
            source: isMongoConnected ? 'database' : 'rfid_data'
        });
    } catch (error) {
        console.error('❌ Error mengambil data scans:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data scan',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk mengambil data scan RFID berdasarkan UID
 */
app.get('/api/scans/:uid', async (req, res) => {
    try {
        let scan;

        if (isMongoConnected) {
            scan = await RfidScan.findOne({ uid: req.params.uid });
        } else {
            // Fallback ke data RFID scan
            const rfidScan = rfidScanData.find(item => item.uid === req.params.uid);
            if (rfidScan) {
                scan = {
                    _id: `rfid_${req.params.uid}`,
                    uid: rfidScan.uid,
                    scannedAt: rfidScan.scannedAt
                };
            }
        }

        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Data scan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: scan,
            source: isMongoConnected ? 'database' : 'rfid_data'
        });
    } catch (error) {
        console.error('❌ Error mengambil data scan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data scan',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk menambahkan scan RFID manual (untuk testing)
 */
app.post('/api/scans', async (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: 'UID diperlukan'
            });
        }

        let newScan;

        if (isMongoConnected) {
            newScan = await RfidScan.findOneAndUpdate(
                { uid: uid },
                { scannedAt: new Date() },
                { new: true, upsert: true }
            );
        } else {
            // Simulasi untuk mode offline
            newScan = {
                _id: `manual_${Date.now()}`,
                uid: uid,
                scannedAt: new Date()
            };
        }

        // Kirim ke WebSocket clients
        io.emit('new_scan', newScan);

        res.status(201).json({
            success: true,
            data: newScan,
            message: 'Scan berhasil ditambahkan',
            source: isMongoConnected ? 'database' : 'manual'
        });
    } catch (error) {
        console.error('❌ Error menambahkan scan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan scan',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk menghapus semua data scan RFID (clear history)
 */
app.delete('/api/scans/clear-all', async (req, res) => {
    try {
        if (!isMongoConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database tidak tersedia'
            });
        }

        const deleteResult = await RfidScan.deleteMany({});

        res.json({
            success: true,
            message: `Berhasil menghapus ${deleteResult.deletedCount} data scan`,
            deletedCount: deleteResult.deletedCount
        });
    } catch (error) {
        console.error('❌ Error menghapus semua scan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data scan',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk menghapus data scan RFID
 */
app.delete('/api/scans/:id', async (req, res) => {
    try {
        if (!isMongoConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database tidak tersedia'
            });
        }

        const deletedScan = await RfidScan.findByIdAndDelete(req.params.id);

        if (!deletedScan) {
            return res.status(404).json({
                success: false,
                message: 'Data scan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Data scan berhasil dihapus',
            data: deletedScan
        });
    } catch (error) {
        console.error('❌ Error menghapus scan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus scan',
            error: error.message
        });
    }
});

// ------------------- SERIAL RFID API ROUTES -------------------

/**
 * Endpoint untuk mengecek status koneksi serial
 */
app.get('/api/serial/status', (req, res) => {
    try {
        const status = serialRfidReader.getStatus();
        res.json({
            success: true,
            data: status,
            message: status.connected ?
                `Terhubung ke ${status.port}` :
                'Serial tidak terhubung'
        });
    } catch (error) {
        console.error('❌ Error mendapatkan status serial:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mendapatkan status serial',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk mendapatkan daftar port serial yang tersedia
 */
app.get('/api/serial/ports', async (req, res) => {
    try {
        const ports = await serialRfidReader.getAvailablePorts();
        res.json({
            success: true,
            data: ports,
            count: ports.length,
            message: `Ditemukan ${ports.length} port serial`
        });
    } catch (error) {
        console.error('❌ Error mendapatkan daftar port serial:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mendapatkan daftar port serial',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk memulai koneksi serial
 */
app.post('/api/serial/connect', async (req, res) => {
    try {
        const { port = 'COM4', baudRate = 9600 } = req.body;

        console.log(`📡 API Request: Connect to ${port} @ ${baudRate}`);

        const success = await serialRfidReader.connect(port, baudRate);

        if (success) {
            res.json({
                success: true,
                message: `Berhasil terhubung ke ${port}`,
                data: serialRfidReader.getStatus()
            });
        } else {
            res.status(400).json({
                success: false,
                message: `Gagal terhubung ke ${port}`,
                data: serialRfidReader.getStatus()
            });
        }
    } catch (error) {
        console.error('❌ Error connecting serial:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghubungkan serial',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk menghentikan koneksi serial
 */
app.post('/api/serial/disconnect', async (req, res) => {
    try {
        console.log('🛑 API Request: Disconnect serial');

        const success = await serialRfidReader.disconnect();

        if (success) {
            res.json({
                success: true,
                message: 'Koneksi serial berhasil dihentikan',
                data: serialRfidReader.getStatus()
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Gagal menghentikan koneksi serial',
                data: serialRfidReader.getStatus()
            });
        }
    } catch (error) {
        console.error('❌ Error disconnecting serial:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghentikan koneksi serial',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk mengirim data test ke serial port
 */
app.post('/api/serial/send', async (req, res) => {
    try {
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'Data diperlukan untuk dikirim'
            });
        }

        const success = await serialRfidReader.sendData(data);

        if (success) {
            res.json({
                success: true,
                message: `Data berhasil dikirim: "${data}"`,
                data: { sentData: data, timestamp: new Date() }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Gagal mengirim data ke serial port'
            });
        }
    } catch (error) {
        console.error('❌ Error sending serial data:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengirim data serial',
            error: error.message
        });
    }
});

// ------------------- EMPLOYEE API ROUTES -------------------

/**
 * Endpoint untuk mengambil semua data karyawan
 */
app.get('/api/employees', async (req, res) => {
    try {
        const { search, bagian, line, status } = req.query;
        let employees;

        if (!isMongoConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database tidak tersedia',
                error: 'MongoDB connection required'
            });
        }

        let query = {};

        // Filter berdasarkan parameter
        if (search) {
            query.$or = [
                { nama: { $regex: search, $options: 'i' } },
                { nik: { $regex: search, $options: 'i' } },
                { idCard: { $regex: search, $options: 'i' } }
            ];
        }

        if (bagian) query.bagian = bagian;
        if (line) query.line = line;
        if (status) query.status = status;

        employees = await Employee.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: employees,
            count: employees.length,
            source: 'database'
        });
    } catch (error) {
        console.error('❌ Error mengambil data karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data karyawan',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk mencari karyawan berdasarkan RFID ID
 */
app.get('/api/employees/rfid/:rfidId', async (req, res) => {
    try {
        let employee;

        if (!isMongoConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database tidak tersedia',
                error: 'MongoDB connection required'
            });
        }

        employee = await Employee.findByRfidUid(req.params.rfidId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Karyawan dengan RFID ID tersebut tidak ditemukan',
                rfidId: req.params.rfidId
            });
        }

        res.json({
            success: true,
            data: employee,
            source: isMongoConnected ? 'database' : 'rfid_data',
            message: `Karyawan ditemukan: ${employee.nama}`
        });
    } catch (error) {
        console.error('❌ Error mencari karyawan dengan RFID ID:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mencari karyawan dengan RFID ID',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk mengambil data karyawan berdasarkan ID
 */
app.get('/api/employees/:id', async (req, res) => {
    try {
        let employee;

        if (!isMongoConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database tidak tersedia',
                error: 'MongoDB connection required'
            });
        }

        employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Data karyawan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: employee,
            source: isMongoConnected ? 'database' : 'rfid_data'
        });
    } catch (error) {
        console.error('❌ Error mengambil data karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data karyawan',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk menambahkan karyawan baru
 */
app.post('/api/employees', async (req, res) => {
    try {
        const { idCard, nama, nik, bagian, line, fasilitas } = req.body;

        // Validasi input
        if (!idCard || !nama || !nik || !bagian || !line || !fasilitas) {
            return res.status(400).json({
                success: false,
                message: 'Semua field wajib diisi'
            });
        }

        if (!isMongoConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database tidak tersedia untuk operasi tulis'
            });
        }

        // Cek duplikasi
        const existingEmployee = await Employee.findOne({
            $or: [
                { idCard: idCard.toUpperCase() },
                { nik: nik }
            ]
        });

        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'ID Card atau NIK sudah terdaftar'
            });
        }

        const newEmployee = new Employee({
            idCard,
            nama,
            nik,
            bagian,
            line,
            fasilitas
        });

        await newEmployee.save();

        res.status(201).json({
            success: true,
            data: newEmployee,
            message: 'Karyawan berhasil ditambahkan'
        });
    } catch (error) {
        console.error('❌ Error menambahkan karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan karyawan',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk mengupdate data karyawan
 */
app.put('/api/employees/:id', async (req, res) => {
    try {
        if (!isMongoConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database tidak tersedia untuk operasi update'
            });
        }

        const { idCard, nama, nik, bagian, line, fasilitas, status } = req.body;

        // Cek duplikasi untuk ID Card dan NIK kecuali untuk record yang sedang diupdate
        if (idCard || nik) {
            const duplicateQuery = { _id: { $ne: req.params.id } };
            if (idCard) {
                duplicateQuery.$or = [{ idCard: idCard.toUpperCase() }];
            }
            if (nik) {
                if (duplicateQuery.$or) {
                    duplicateQuery.$or.push({ nik: nik });
                } else {
                    duplicateQuery.$or = [{ nik: nik }];
                }
            }

            const existingEmployee = await Employee.findOne(duplicateQuery);
            if (existingEmployee) {
                return res.status(400).json({
                    success: false,
                    message: 'ID Card atau NIK sudah terdaftar'
                });
            }
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { idCard, nama, nik, bagian, line, fasilitas, status },
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Data karyawan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: updatedEmployee,
            message: 'Data karyawan berhasil diupdate'
        });
    } catch (error) {
        console.error('❌ Error mengupdate karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate karyawan',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk menghapus karyawan
 */
app.delete('/api/employees/:id', async (req, res) => {
    try {
        if (!isMongoConnected) {
            return res.status(503).json({
                success: false,
                message: 'Database tidak tersedia untuk operasi hapus'
            });
        }

        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);

        if (!deletedEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Data karyawan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Data karyawan berhasil dihapus',
            data: deletedEmployee
        });
    } catch (error) {
        console.error('❌ Error menghapus karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus karyawan',
            error: error.message
        });
    }
});

/**
 * Endpoint untuk statistik karyawan
 */
app.get('/api/employees/stats/overview', async (req, res) => {
    try {
        let stats;

        if (isMongoConnected) {
            const totalKaryawan = await Employee.countDocuments();
            const karyawanAktif = await Employee.countDocuments({ status: 'aktif' });
            const karyawanCuti = await Employee.countDocuments({ status: 'cuti' });
            const karyawanNonAktif = await Employee.countDocuments({ status: 'non-aktif' });

            // Karyawan baru (dalam 30 hari terakhir)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const karyawanBaru = await Employee.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            stats = {
                totalKaryawan,
                karyawanAktif,
                karyawanCuti,
                karyawanNonAktif,
                karyawanBaru
            };
        } else {
            return res.status(503).json({
                success: false,
                message: 'Database tidak tersedia untuk statistik',
                error: 'MongoDB connection required'
            });
        }

        res.json({
            success: true,
            data: stats,
            source: isMongoConnected ? 'database' : 'rfid_data'
        });
    } catch (error) {
        console.error('❌ Error mengambil statistik karyawan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil statistik karyawan',
            error: error.message
        });
    }
});

// ------------------- ERROR HANDLING -------------------

/**
 * Middleware untuk handle 404 errors
 */
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`
    });
});

/**
 * Global error handler
 */
app.use((error, req, res, next) => {
    console.error('❌ Global Error:', error);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan internal server',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
});

// ------------------- START SERVER -------------------

const PORT = process.env.PORT || 5000;

/**
 * Menjalankan server dengan inisialisasi bertahap
 */
const startServer = async () => {
    try {
        // 1. Inisialisasi database
        await initializeDatabase();

        // 2. Start HTTP server (No simulator - real data only)
        server.listen(PORT, () => {
            console.log('🚀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🚀');
            console.log(`🌟 SERVER RFID PRODUCTIVITY BERHASIL DIMULAI 🌟`);
            console.log('🚀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🚀');
            console.log(`📡 Backend Server: http://localhost:${PORT}`);
            console.log(`🔗 Socket.IO: Ready untuk real-time connection`);
            console.log(`💾 Database: ${isMongoConnected ? 'MongoDB Connected (Real Data)' : 'Database Required'}`);
            console.log(`📱 Serial RFID: Ready untuk koneksi COM4`);
            console.log(`🔄 Real Data Only: No simulation, pure database integration`);
            console.log(`👥 Connected Clients: ${connectedClients.size}`);
            console.log('🚀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🚀');
        });

    } catch (error) {
        console.error('❌ Gagal menjalankan server:', error);
        process.exit(1);
    }
};

// ------------------- GRACEFUL SHUTDOWN -------------------

/**
 * Graceful shutdown handling
 */
const shutdown = async () => {
    console.log('🛑 Menerima sinyal shutdown...');

    // No simulator to stop - real data only

    // Disconnect serial connection
    try {
        await serialRfidReader.disconnect();
        console.log('✅ Serial RFID Reader disconnected');
    } catch (error) {
        console.error('❌ Error disconnecting serial:', error);
    }

    // Close server
    server.close(() => {
        console.log('✅ HTTP Server ditutup');

        // Close database connection
        if (isMongoConnected) {
            require('mongoose').connection.close(() => {
                console.log('✅ MongoDB connection ditutup');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Mulai server
startServer();