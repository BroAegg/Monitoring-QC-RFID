/**
 * Script debug khusus untuk RFID 4300445CFBA0
 * Menjalankan: node debugSpecificRfid.js
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
 * Debug RFID 4300445CFBA0 secara spesifik
 */
const debugSpecificRfid = async () => {
    try {
        console.log('\n🔍 Debug RFID 4300445CFBA0...');

        const targetRfid = '4300445CFBA0';

        // 1. Cek apakah RFID ada di database
        console.log('\n1️⃣ Checking if RFID exists in database...');
        const directQuery = await Employee.findOne({ idCard: targetRfid });
        console.log(`Direct query result: ${directQuery ? 'FOUND' : 'NOT FOUND'}`);
        if (directQuery) {
            console.log(`   Employee: ${directQuery.nama} (${directQuery.idCard})`);
            console.log(`   Full data:`, JSON.stringify(directQuery, null, 2));
        }

        // 2. Test dengan findByRfidUid
        console.log('\n2️⃣ Testing findByRfidUid function...');
        const findByRfidResult = await Employee.findByRfidUid(targetRfid);
        console.log(`findByRfidUid result: ${findByRfidResult ? 'FOUND' : 'NOT FOUND'}`);
        if (findByRfidResult) {
            console.log(`   Employee: ${findByRfidResult.nama} (${findByRfidResult.idCard})`);
        }

        // 3. Test dengan berbagai format
        console.log('\n3️⃣ Testing with different formats...');
        const formats = [
            targetRfid,
            targetRfid.toUpperCase(),
            targetRfid.toLowerCase(),
            targetRfid.trim(),
            ` ${targetRfid} `,
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

        // 4. Tampilkan semua RFID yang ada
        console.log('\n4️⃣ All RFID IDs in database:');
        const allEmployees = await Employee.find({}, 'idCard nama');
        allEmployees.forEach((emp, index) => {
            console.log(`${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
        });

        // 5. Test API endpoint
        console.log('\n5️⃣ Testing API endpoint...');
        try {
            const response = await fetch(`http://localhost:5000/api/employees/rfid/${targetRfid}`);
            const result = await response.json();
            console.log(`API Response Status: ${response.status}`);
            console.log(`API Response:`, JSON.stringify(result, null, 2));
        } catch (error) {
            console.log(`API Error: ${error.message}`);
        }

    } catch (error) {
        console.error('❌ Error in debugSpecificRfid:', error);
    }
};

/**
 * Test getAllEmployees API
 */
const testGetAllEmployees = async () => {
    try {
        console.log('\n6️⃣ Testing getAllEmployees API...');

        const response = await fetch('http://localhost:5000/api/employees');
        const result = await response.json();

        console.log(`API Status: ${response.status}`);
        console.log(`Total employees: ${result.count}`);

        // Cari RFID target dalam response
        const targetEmployee = result.data.find(emp => emp.idCard === '4300445CFBA0');
        if (targetEmployee) {
            console.log(`✅ Target RFID found in API response: ${targetEmployee.nama}`);
        } else {
            console.log(`❌ Target RFID NOT found in API response`);
            console.log('Available RFID IDs in API response:');
            result.data.forEach((emp, index) => {
                console.log(`   ${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
            });
        }

    } catch (error) {
        console.log(`API Error: ${error.message}`);
    }
};

/**
 * Main function
 */
const main = async () => {
    try {
        await connectDB();

        console.log('🚀 Starting Specific RFID Debug...');

        await debugSpecificRfid();
        await testGetAllEmployees();

        console.log('\n✅ Specific RFID Debug completed!');

    } catch (error) {
        console.error('❌ Error in main:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Jalankan script
main(); 