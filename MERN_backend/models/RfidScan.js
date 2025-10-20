// backend/models/RfidScan.js
const mongoose = require('mongoose');

const RfidScanSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    scannedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RfidScan', RfidScanSchema);