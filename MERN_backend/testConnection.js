const mongoose = require('mongoose');
const Employee = require('./models/Employee');

/**
 * Test koneksi ke database RFID dan akses collection karyawan
 */
async function testConnection() {
    try {
        console.log('🔄 Testing connection to MongoDB RFID database...');

        // Connect ke MongoDB
        await mongoose.connect('mongodb://localhost:27017/RFID', {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ Connected to RFID database successfully!');

        // Test query ke collection karyawan
        const employees = await Employee.find({}).limit(5);
        console.log('\n📋 Sample data from karyawan collection:');
        console.log('Total employees found:', await Employee.countDocuments());

        employees.forEach((emp, index) => {
            console.log(`\n${index + 1}. Employee:`, {
                _id: emp._id,
                idCard: emp.idCard,
                nama: emp.nama,
                nik: emp.nik,
                bagian: emp.bagian,
                line: emp.line,
                fasilitas: emp.fasilitas,
                status: emp.status,
                createdAt: emp.createdAt
            });
        });

        // Test specific employee search
        const testEmployee = await Employee.findOne({ idCard: "4300409172E0" });
        if (testEmployee) {
            console.log('\n🔍 Found test employee Ahmad Ridwan:', {
                nama: testEmployee.nama,
                bagian: testEmployee.bagian,
                line: testEmployee.line
            });
        } else {
            console.log('\n⚠️  Test employee Ahmad Ridwan not found');
        }

    } catch (error) {
        console.error('❌ Connection/Query error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔚 Connection closed');
        process.exit(0);
    }
}

// Run test
testConnection(); 