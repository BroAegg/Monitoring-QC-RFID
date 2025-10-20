/**
 * Script debug untuk mengecek masalah RFID
 * Menjalankan: node debugRfid.js
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
 * Debug fungsi findByRfidUid
 */
const debugFindByRfidUid = async () => {
    try {
        console.log('\n🔍 Debug findByRfidUid function...');

        // Ambil semua data karyawan
        const employees = await Employee.find({});
        console.log(`📊 Total karyawan: ${employees.length}`);

        if (employees.length === 0) {
            console.log('⚠️ Tidak ada data karyawan');
            return;
        }

        // Test dengan RFID yang ada
        const testRfid = '43003DC71EA7'; // RFID yang bermasalah
        console.log(`\n🧪 Testing dengan RFID: ${testRfid}`);

        // Cek apakah RFID ada di database
        const directQuery = await Employee.findOne({ idCard: testRfid });
        console.log(`Direct query result: ${directQuery ? 'FOUND' : 'NOT FOUND'}`);
        if (directQuery) {
            console.log(`   Employee: ${directQuery.nama} (${directQuery.idCard})`);
        }

        // Test dengan case-insensitive
        const caseInsensitiveQuery = await Employee.findOne({
            idCard: { $regex: new RegExp(`^${testRfid}$`, 'i') }
        });
        console.log(`Case-insensitive query result: ${caseInsensitiveQuery ? 'FOUND' : 'NOT FOUND'}`);
        if (caseInsensitiveQuery) {
            console.log(`   Employee: ${caseInsensitiveQuery.nama} (${caseInsensitiveQuery.idCard})`);
        }

        // Test dengan findByRfidUid
        const findByRfidResult = await Employee.findByRfidUid(testRfid);
        console.log(`findByRfidUid result: ${findByRfidResult ? 'FOUND' : 'NOT FOUND'}`);
        if (findByRfidResult) {
            console.log(`   Employee: ${findByRfidResult.nama} (${findByRfidResult.idCard})`);
        }

        // Tampilkan semua RFID yang ada
        console.log('\n📋 Semua RFID yang ada di database:');
        employees.forEach((emp, index) => {
            console.log(`${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
        });

    } catch (error) {
        console.error('❌ Error in debugFindByRfidUid:', error);
    }
};

/**
 * Debug API endpoint
 */
const debugApiEndpoint = async () => {
    try {
        console.log('\n🔍 Debug API endpoint...');

        const testRfid = '43003DC71EA7';
        const url = `http://localhost:5000/api/employees/rfid/${testRfid}`;

        console.log(`Testing API: ${url}`);

        const response = await fetch(url);
        const result = await response.json();

        console.log(`API Response Status: ${response.status}`);
        console.log(`API Response:`, JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Error testing API endpoint:', error);
    }
};

/**
 * Debug data format
 */
const debugDataFormat = async () => {
    try {
        console.log('\n🔍 Debug data format...');

        const employees = await Employee.find({});

        if (employees.length === 0) {
            console.log('⚠️ Tidak ada data karyawan');
            return;
        }

        const sampleEmployee = employees[0];
        console.log('Sample employee data:');
        console.log(JSON.stringify(sampleEmployee, null, 2));

        // Test mapping seperti di DaftarID.jsx
        const mappedEmployee = {
            id: sampleEmployee._id,
            idCard: sampleEmployee.idCard,
            fasilitas: sampleEmployee.fasilitas,
            nama: sampleEmployee.nama,
            nik: sampleEmployee.nik,
            bagian: sampleEmployee.bagian,
            line: sampleEmployee.line,
            status: sampleEmployee.status,
            checked: false
        };

        console.log('\nMapped employee data (DaftarID format):');
        console.log(JSON.stringify(mappedEmployee, null, 2));

    } catch (error) {
        console.error('❌ Error in debugDataFormat:', error);
    }
};

/**
 * Test pencarian dengan berbagai format
 */
const testSearchFormats = async () => {
    try {
        console.log('\n🧪 Testing search with different formats...');

        const testRfid = '43003DC71EA7';
        const formats = [
            testRfid,
            testRfid.toUpperCase(),
            testRfid.toLowerCase(),
            testRfid.trim(),
            ` ${testRfid} `,
            testRfid.replace(/[^A-F0-9]/gi, ''),
        ];

        for (const format of formats) {
            console.log(`\nTesting format: "${format}"`);

            // Direct query
            const directResult = await Employee.findOne({ idCard: format });
            console.log(`  Direct query: ${directResult ? 'FOUND' : 'NOT FOUND'}`);

            // Case-insensitive
            const caseResult = await Employee.findOne({
                idCard: { $regex: new RegExp(`^${format}$`, 'i') }
            });
            console.log(`  Case-insensitive: ${caseResult ? 'FOUND' : 'NOT FOUND'}`);

            // findByRfidUid
            const findByRfidResult = await Employee.findByRfidUid(format);
            console.log(`  findByRfidUid: ${findByRfidResult ? 'FOUND' : 'NOT FOUND'}`);
        }

    } catch (error) {
        console.error('❌ Error in testSearchFormats:', error);
    }
};

/**
 * Main function
 */
const main = async () => {
    try {
        await connectDB();

        console.log('🚀 Starting RFID Debug...');

        await debugFindByRfidUid();
        await debugDataFormat();
        await testSearchFormats();

        console.log('\n✅ Debug completed!');

    } catch (error) {
        console.error('❌ Error in main:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Jalankan script
main(); 