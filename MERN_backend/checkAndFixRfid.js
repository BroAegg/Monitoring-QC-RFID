/**
 * Script untuk mengecek dan memperbaiki data RFID secara langsung
 * Menjalankan: node checkAndFixRfid.js
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
const checkAndFixRfid = async () => {
    try {
        console.log('\n🔍 Checking and fixing RFID data...');

        const targetRfid = '4300445CFBA0';

        // 1. Cek data yang ada
        console.log('\n1️⃣ Checking existing data...');
        const employees = await Employee.find({});
        console.log(`📊 Total karyawan: ${employees.length}`);

        if (employees.length === 0) {
            console.log('⚠️ Tidak ada data karyawan');
            return;
        }

        // 2. Cari RFID target
        console.log(`\n2️⃣ Looking for RFID: ${targetRfid}`);
        const targetEmployee = employees.find(emp => emp.idCard === targetRfid);

        if (targetEmployee) {
            console.log(`✅ Found: ${targetEmployee.nama} (${targetEmployee.idCard})`);
            console.log('Full data:', JSON.stringify(targetEmployee, null, 2));
        } else {
            console.log(`❌ RFID ${targetRfid} not found`);

            // Cari dengan case-insensitive
            const caseInsensitiveMatch = employees.find(emp =>
                emp.idCard.toUpperCase() === targetRfid.toUpperCase()
            );

            if (caseInsensitiveMatch) {
                console.log(`💡 Found case-insensitive match: ${caseInsensitiveMatch.nama} (${caseInsensitiveMatch.idCard})`);
            }
        }

        // 3. Tampilkan semua RFID
        console.log('\n3️⃣ All RFID IDs in database:');
        employees.forEach((emp, index) => {
            console.log(`${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
        });

        // 4. Test findByRfidUid
        console.log(`\n4️⃣ Testing findByRfidUid with: ${targetRfid}`);
        const findByRfidResult = await Employee.findByRfidUid(targetRfid);
        console.log(`Result: ${findByRfidResult ? 'FOUND' : 'NOT FOUND'}`);
        if (findByRfidResult) {
            console.log(`Employee: ${findByRfidResult.nama} (${findByRfidResult.idCard})`);
        }

        // 5. Perbaiki format RFID jika diperlukan
        console.log('\n5️⃣ Fixing RFID formats...');
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

        // 6. Test lagi setelah perbaikan
        console.log(`\n6️⃣ Testing again after fix...`);
        const updatedEmployees = await Employee.find({});
        const updatedTargetEmployee = updatedEmployees.find(emp => emp.idCard === targetRfid);

        if (updatedTargetEmployee) {
            console.log(`✅ Found after fix: ${updatedTargetEmployee.nama} (${updatedTargetEmployee.idCard})`);
        } else {
            console.log(`❌ Still not found after fix`);
        }

        // 7. Test findByRfidUid lagi
        const finalResult = await Employee.findByRfidUid(targetRfid);
        console.log(`Final findByRfidUid result: ${finalResult ? 'FOUND' : 'NOT FOUND'}`);
        if (finalResult) {
            console.log(`Final employee: ${finalResult.nama} (${finalResult.idCard})`);
        }

    } catch (error) {
        console.error('❌ Error in checkAndFixRfid:', error);
    }
};

/**
 * Fungsi untuk menambahkan data test jika tidak ada
 */
const addTestData = async () => {
    try {
        const targetRfid = '4300445CFBA0';
        const existingEmployee = await Employee.findOne({ idCard: targetRfid });

        if (existingEmployee) {
            console.log(`✅ Employee with RFID ${targetRfid} already exists: ${existingEmployee.nama}`);
            return;
        }

        console.log('\n➕ Adding test employee...');

        const testEmployee = new Employee({
            idCard: targetRfid,
            nama: 'Lilis Suryani',
            nik: 'EMP012',
            bagian: 'Sewing',
            line: 'B4',
            fasilitas: 'Transport + Makan',
            status: 'aktif'
        });

        await testEmployee.save();
        console.log(`✅ Added: ${testEmployee.nama} (${testEmployee.idCard})`);

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

        console.log('🚀 Starting RFID Check and Fix...');

        // Tambah data test jika tidak ada
        await addTestData();

        // Cek dan perbaiki data RFID
        await checkAndFixRfid();

        console.log('\n✅ RFID Check and Fix completed!');

    } catch (error) {
        console.error('❌ Error in main:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Jalankan script
main(); 