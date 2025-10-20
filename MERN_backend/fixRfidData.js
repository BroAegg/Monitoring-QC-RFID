/**
 * Script untuk memperbaiki data RFID di database
 * Menjalankan: node fixRfidData.js
 */

const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// Koneksi ke database
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/RFID', {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB Connected successfully!');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

/**
 * Fungsi untuk mengecek dan memperbaiki data RFID
 */
const fixRfidData = async () => {
    try {
        console.log('\n🔍 Mengecek dan memperbaiki data RFID...');

        // Ambil semua data karyawan
        const employees = await Employee.find({});
        console.log(`📊 Total karyawan: ${employees.length}`);

        if (employees.length === 0) {
            console.log('⚠️ Tidak ada data karyawan');
            return;
        }

        console.log('\n📋 Data RFID sebelum perbaikan:');
        employees.forEach((emp, index) => {
            console.log(`${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
        });

        // Perbaiki format RFID ID
        let fixedCount = 0;
        for (const emp of employees) {
            const originalIdCard = emp.idCard;
            const normalizedIdCard = originalIdCard.toString().trim().toUpperCase();

            if (originalIdCard !== normalizedIdCard) {
                console.log(`🔧 Fixing: "${originalIdCard}" -> "${normalizedIdCard}"`);
                emp.idCard = normalizedIdCard;
                await emp.save();
                fixedCount++;
            }
        }

        console.log(`✅ Fixed ${fixedCount} RFID ID formats`);

        // Test pencarian dengan RFID yang bermasalah
        const testRfid = '43003DC71EA7';
        console.log(`\n🧪 Testing pencarian dengan RFID: ${testRfid}`);

        const foundEmployee = await Employee.findByRfidUid(testRfid);
        if (foundEmployee) {
            console.log(`✅ Employee found: ${foundEmployee.nama} (${foundEmployee.idCard})`);
        } else {
            console.log(`❌ Employee not found for RFID: ${testRfid}`);

            // Cek apakah RFID ada dengan format yang berbeda
            const allEmployees = await Employee.find({});
            const matchingEmployee = allEmployees.find(emp =>
                emp.idCard.toUpperCase().includes(testRfid.toUpperCase()) ||
                testRfid.toUpperCase().includes(emp.idCard.toUpperCase())
            );

            if (matchingEmployee) {
                console.log(`💡 Found similar RFID: ${matchingEmployee.idCard} -> ${matchingEmployee.nama}`);
            }
        }

        // Tampilkan data setelah perbaikan
        console.log('\n📋 Data RFID setelah perbaikan:');
        const updatedEmployees = await Employee.find({});
        updatedEmployees.forEach((emp, index) => {
            console.log(`${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
        });

    } catch (error) {
        console.error('❌ Error fixing RFID data:', error);
    }
};

/**
 * Fungsi untuk menambahkan data test jika tidak ada
 */
const addTestData = async () => {
    try {
        const count = await Employee.countDocuments();
        if (count > 0) {
            console.log('📊 Database sudah berisi data');
            return;
        }

        console.log('\n➕ Menambahkan data test...');

        const testEmployees = [
            {
                idCard: '4300409172E0',
                nama: 'Ahmad Ridwan',
                nik: 'EMP001',
                bagian: 'Cutting',
                line: 'A1',
                fasilitas: 'Transport',
                status: 'aktif'
            },
            {
                idCard: '43003DC71EA7',
                nama: 'Wahyu Setiawan',
                nik: 'EMP002',
                bagian: 'Finishing',
                line: 'C3',
                fasilitas: 'Transport',
                status: 'aktif'
            }
        ];

        for (const empData of testEmployees) {
            const newEmployee = new Employee(empData);
            await newEmployee.save();
            console.log(`✅ Added: ${empData.nama} (${empData.idCard})`);
        }

    } catch (error) {
        console.error('❌ Error adding test data:', error);
    }
};

/**
 * Main function
 */
const main = async () => {
    try {
        await connectDB();

        console.log('🚀 Starting RFID Data Fix...');

        // Tambah data test jika database kosong
        await addTestData();

        // Perbaiki data RFID
        await fixRfidData();

        console.log('\n✅ RFID Data Fix completed!');

    } catch (error) {
        console.error('❌ Error in main:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Jalankan script
main(); 