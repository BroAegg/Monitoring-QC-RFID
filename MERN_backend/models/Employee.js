/**
 * Model Employee untuk data karyawan
 * Terintegrasi dengan sistem RFID untuk tracking
 */

const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    // ID Card RFID
    idCard: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    // Data Personal
    nama: {
        type: String,
        required: true,
        trim: true
    },

    nik: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Data Pekerjaan
    bagian: {
        type: String,
        required: true,
        trim: true
    },

    line: {
        type: String,
        required: true,
        trim: true
    },

    fasilitas: {
        type: String,
        required: true,
        trim: true
    },

    // Status
    status: {
        type: String,
        enum: ['aktif', 'non-aktif', 'cuti'],
        default: 'aktif'
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    },

    // Tracking data
    lastScanAt: {
        type: Date,
        default: null
    },

    totalScans: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Otomatis menambahkan createdAt dan updatedAt
});

// Index untuk optimasi pencarian (idCard dan nik sudah unique, tidak perlu index manual)
EmployeeSchema.index({ nama: 1 });
EmployeeSchema.index({ bagian: 1 });
EmployeeSchema.index({ line: 1 });

// Middleware untuk update timestamp
EmployeeSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Methods untuk update scan data
EmployeeSchema.methods.updateScanData = function () {
    this.lastScanAt = new Date();
    this.totalScans += 1;
    return this.save();
};

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

module.exports = mongoose.model('Employee', EmployeeSchema, 'karyawan'); 