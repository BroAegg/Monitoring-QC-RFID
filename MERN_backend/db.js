// backend/db.js
const mongoose = require('mongoose');

/**
 * Fungsi untuk menghubungkan ke MongoDB dengan error handling yang robust
 */
const connectDB = async () => {
    try {
        // Connection options untuk stabilitas dan performa (kompatibel dengan MongoDB driver terbaru)
        const options = {
            serverSelectionTimeoutMS: 5000, // 5 detik timeout untuk server selection
            socketTimeoutMS: 45000, // 45 detik socket timeout
            maxPoolSize: 10, // Maximum 10 connection dalam pool
            minPoolSize: 1, // Minimum 1 connection dalam pool
            maxIdleTimeMS: 30000, // Close connection setelah 30 detik idle
        };

        // Attempt connection
        await mongoose.connect('mongodb://localhost:27017/RFID', options);

        console.log('💾 MongoDB Connected successfully!');

        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('🔗 Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  Mongoose disconnected from MongoDB');
        });

        // Graceful closure
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('✅ MongoDB connection closed through app termination');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error closing MongoDB connection:', error);
                process.exit(1);
            }
        });

    } catch (err) {
        console.error('❌ MongoDB connection failed:');
        console.error('Error details:', err.message);

        // Log specific connection issues
        if (err.name === 'MongooseServerSelectionError') {
            console.error('💡 Pastikan MongoDB server berjalan di localhost:27017');
            console.error('💡 Untuk menjalankan MongoDB:');
            console.error('   - Windows: net start MongoDB atau mongod');
            console.error('   - Linux/Mac: sudo systemctl start mongod atau mongod');
        }

        // Throw error untuk ditangani di level atas
        throw err;
    }
};

/**
 * Fungsi untuk mengecek status koneksi MongoDB
 */
const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

/**
 * Fungsi untuk menutup koneksi MongoDB secara paksa
 */
const closeConnection = async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed manually');
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
        throw error;
    }
};

/**
 * Fungsi untuk mendapatkan status koneksi dalam bentuk string
 */
const getConnectionStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = {
    connectDB,
    isConnected,
    closeConnection,
    getConnectionStatus
};