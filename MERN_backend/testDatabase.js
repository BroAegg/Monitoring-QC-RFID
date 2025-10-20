/**
 * Script untuk mengecek dan memperbaiki data RFID di database
 * Menjalankan: node testDatabase.js
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
 * Fungsi untuk mengecek data RFID di database
 */
const checkRfidData = async () => {
    try {
        console.log('\n🔍 Mengecek data RFID di database...');

        // Ambil semua data karyawan
        const employees = await Employee.find({});
        console.log(`📊 Total karyawan di database: ${employees.length}`);

        if (employees.length === 0) {
            console.log('⚠️ Tidak ada data karyawan di database');
            return;
        }

        console.log('\n📋 Data RFID yang ada di database:');
        employees.forEach((emp, index) => {
            console.log(`${index + 1}. ${emp.idCard} -> ${emp.nama} (${emp.bagian} - ${emp.line})`);
        });

        // Test pencarian dengan RFID ID yang ada
        console.log('\n🧪 Testing pencarian RFID...');
        const testRfid = employees[0].idCard;
        console.log(`Testing dengan RFID: ${testRfid}`);

        const foundEmployee = await Employee.findByRfidUid(testRfid);
        if (foundEmployee) {
            console.log(`✅ Pencarian berhasil: ${foundEmployee.nama}`);
        } else {
            console.log(`❌ Pencarian gagal untuk RFID: ${testRfid}`);
        }

        // Test dengan format yang berbeda
        console.log('\n🧪 Testing dengan format berbeda...');
        const testVariations = [
            testRfid.toLowerCase(),
            testRfid.toUpperCase(),
            testRfid.trim(),
            ` ${testRfid} `,
        ];

        for (const variation of testVariations) {
            console.log(`Testing: "${variation}"`);
            const result = await Employee.findByRfidUid(variation);
            if (result) {
                console.log(`✅ Found: ${result.nama}`);
            } else {
                console.log(`❌ Not found`);
            }
        }

    } catch (error) {
        console.error('❌ Error checking RFID data:', error);
    }
};

/**
 * Fungsi untuk memperbaiki format RFID ID jika diperlukan
 */
const fixRfidFormat = async () => {
    try {
        console.log('\n🔧 Memperbaiki format RFID ID...');

        const employees = await Employee.find({});
        let fixedCount = 0;

        for (const emp of employees) {
            const originalIdCard = emp.idCard;
            const normalizedIdCard = originalIdCard.toString().trim().toUpperCase();

            if (originalIdCard !== normalizedIdCard) {
                console.log(`Fixing: "${originalIdCard}" -> "${normalizedIdCard}"`);
                emp.idCard = normalizedIdCard;
                await emp.save();
                fixedCount++;
            }
        }

        console.log(`✅ Fixed ${fixedCount} RFID ID formats`);

    } catch (error) {
        console.error('❌ Error fixing RFID format:', error);
    }
};

/**
 * Fungsi untuk menambahkan data test jika database kosong
 */
const addTestData = async () => {
    try {
        const count = await Employee.countDocuments();
        if (count > 0) {
            console.log('📊 Database sudah berisi data, skip adding test data');
            return;
        }

        console.log('\n➕ Menambahkan data test...');

        const testEmployee = new Employee({
            idCard: '4300409172E0',
            nama: 'Ahmad Ridwan',
            nik: 'EMP001',
            bagian: 'Cutting',
            line: 'A1',
            fasilitas: 'Transport',
            status: 'aktif'
        });

        await testEmployee.save();
        console.log('✅ Test data berhasil ditambahkan');

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

        // Tambah data test jika database kosong
        await addTestData();

        // Cek data RFID
        await checkRfidData();

        // Perbaiki format RFID jika diperlukan
        await fixRfidFormat();

        // Cek lagi setelah perbaikan
        await checkRfidData();

        console.log('\n✅ Database check completed!');

    } catch (error) {
        console.error('❌ Error in main:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Jalankan script
main(); 