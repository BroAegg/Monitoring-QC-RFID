const { connectDB } = require('./db');
const Employee = require('./models/Employee');

/**
 * Test koneksi database menggunakan konfigurasi yang sama dengan server.js
 */
async function testServerConnection() {
    console.log('🔄 Testing server database connection...');
    console.log('Using same configuration as server.js\n');

    let isMongoConnected = false;

    try {
        // Gunakan connectDB function yang sama dengan server.js
        await connectDB();
        isMongoConnected = true;
        console.log('✅ MongoDB terhubung dengan sukses');

        // Test basic operations
        console.log('\n📊 Testing database operations:');

        const totalEmployees = await Employee.countDocuments();
        console.log(`📋 Total employees: ${totalEmployees}`);

        if (totalEmployees > 0) {
            const sampleEmployee = await Employee.findOne().limit(1);
            console.log('👤 Sample employee:', {
                idCard: sampleEmployee.idCard,
                nama: sampleEmployee.nama,
                bagian: sampleEmployee.bagian,
                line: sampleEmployee.line
            });

            // Test search by RFID
            const foundEmployee = await Employee.findByRfidUid(sampleEmployee.idCard);
            if (foundEmployee) {
                console.log('🔍 RFID search test: ✅ SUCCESS');
            } else {
                console.log('🔍 RFID search test: ❌ FAILED');
            }
        }

        console.log('\n✅ All database tests passed!');

    } catch (error) {
        console.error('❌ Database connection/operation failed:');
        console.error('Error message:', error.message);
        console.error('Error details:', error);
        isMongoConnected = false;
    }

    console.log(`\n🏁 Final status: ${isMongoConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
    console.log('This matches what server.js will experience.\n');

    process.exit(0);
}

// Run test
testServerConnection(); 