// serialRfidReader.js
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

/**
 * Kelas untuk menangani komunikasi serial dengan RFID Reader
 * Menangani pembacaan data dari ESP32 RFID reader melalui COM port
 */
class SerialRfidReader {
    constructor() {
        this.port = null;
        this.parser = null;
        this.isConnected = false;
        this.portName = 'COM4';
        this.baudRate = 9600;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = null;
        this.socketIO = null;
    }

    /**
     * Set Socket.IO instance untuk real-time communication
     * @param {Object} io - Socket.IO instance
     */
    setSocketIO(io) {
        this.socketIO = io;
    }

    /**
     * Mengecek port serial yang tersedia
     * @returns {Promise<Array>} Daftar port yang tersedia
     */
    async getAvailablePorts() {
        try {
            const ports = await SerialPort.list();
            console.log('📱 Port serial yang tersedia:');
            ports.forEach(port => {
                console.log(`   - ${port.path}: ${port.manufacturer || 'Unknown'}`);
            });
            return ports;
        } catch (error) {
            console.error('❌ Error mengecek port serial:', error);
            return [];
        }
    }

    /**
     * Memulai koneksi serial dengan RFID reader
     * @param {string} portName - Nama port (default: COM4) 
     * @param {number} baudRate - Baud rate (default: 9600)
     * @returns {Promise<boolean>} Status koneksi berhasil atau tidak
     */
    async connect(portName = this.portName, baudRate = this.baudRate) {
        try {
            // Cek apakah sudah terhubung
            if (this.isConnected) {
                console.log('⚠️  Serial sudah terhubung');
                return true;
            }

            this.portName = portName;
            this.baudRate = baudRate;

            console.log(`🔌 Mencoba menghubungkan ke ${portName} dengan baudrate ${baudRate}...`);

            // Cek apakah port tersedia
            const availablePorts = await this.getAvailablePorts();
            const targetPort = availablePorts.find(port => port.path === portName);

            if (!targetPort) {
                throw new Error(`Port ${portName} tidak ditemukan. Pastikan RFID reader terhubung.`);
            }

            // Buat koneksi serial
            this.port = new SerialPort({
                path: portName,
                baudRate: baudRate,
                autoOpen: false
            });

            // Setup parser untuk membaca data line by line
            this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

            // Event handlers
            this.setupEventHandlers();

            // Buka koneksi
            await new Promise((resolve, reject) => {
                this.port.open((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            this.isConnected = true;
            this.reconnectAttempts = 0;

            console.log(`✅ Serial RFID reader berhasil terhubung ke ${portName}`);

            // Emit status ke WebSocket clients
            if (this.socketIO) {
                this.socketIO.emit('serial_status', {
                    connected: true,
                    port: portName,
                    baudRate: baudRate,
                    message: `Terhubung ke ${portName}`
                });
            }

            return true;

        } catch (error) {
            console.error(`❌ Error menghubungkan serial ${portName}:`, error.message);

            // Emit error ke WebSocket clients
            if (this.socketIO) {
                this.socketIO.emit('serial_status', {
                    connected: false,
                    port: portName,
                    message: `Error: ${error.message}`
                });

                this.socketIO.emit('rfid_error', {
                    message: error.message,
                    port: portName
                });
            }

            return false;
        }
    }

    /**
     * Setup event handlers untuk serial communication
     */
    setupEventHandlers() {
        // Event ketika data diterima
        this.parser.on('data', (data) => {
            this.handleSerialData(data);
        });

        // Event ketika port terbuka
        this.port.on('open', () => {
            console.log(`📡 Port serial ${this.portName} terbuka`);
        });

        // Event ketika port tertutup
        this.port.on('close', () => {
            console.log(`📴 Port serial ${this.portName} tertutup`);
            this.isConnected = false;

            if (this.socketIO) {
                this.socketIO.emit('serial_status', {
                    connected: false,
                    port: this.portName,
                    message: 'Koneksi serial terputus'
                });
            }

            // Auto reconnect
            this.startReconnect();
        });

        // Event ketika error
        this.port.on('error', (err) => {
            console.error(`❌ Serial error pada ${this.portName}:`, err.message);
            this.isConnected = false;

            if (this.socketIO) {
                this.socketIO.emit('rfid_error', {
                    message: err.message,
                    port: this.portName
                });
            }
        });
    }

    /**
 * Menangani data yang diterima dari serial
 * @param {string} rawData - Data mentah dari serial
 */
    handleSerialData(rawData) {
        try {
            const data = rawData.trim();
            console.log(`📨 Data serial diterima: "${data}"`);

            // Check if data is direct RFID ID (12 hex characters)
            const directRfidMatch = data.match(/^([A-F0-9]{12})$/i);

            if (directRfidMatch) {
                // Direct RFID ID format (new format)
                const uid = directRfidMatch[1].toUpperCase();
                console.log(`🏷️  RFID UID terdeteksi (direct): ${uid}`);

                // Emit data ke WebSocket clients
                if (this.socketIO) {
                    this.socketIO.emit('rfid_serial_data', {
                        uid: uid,
                        timestamp: new Date().toISOString(),
                        port: this.portName,
                        rawData: data
                    });

                    // Emit juga sebagai RFID scan untuk integrasi dengan sistem
                    this.socketIO.emit('new_rfid_scan', {
                        uid: uid,
                        scannedAt: new Date(),
                        source: 'serial'
                    });
                }

                return uid;
            }

            // Legacy format: "ID Kartu Terdeteksi: XXXXXXXXXXXX" (for backward compatibility)
            if (data.includes('ID Kartu Terdeteksi:')) {
                const uidMatch = data.match(/ID Kartu Terdeteksi:\s*([A-F0-9]{12})/i);

                if (uidMatch) {
                    const uid = uidMatch[1].toUpperCase();
                    console.log(`🏷️  RFID UID terdeteksi (legacy): ${uid}`);

                    // Emit data ke WebSocket clients
                    if (this.socketIO) {
                        this.socketIO.emit('rfid_serial_data', {
                            uid: uid,
                            timestamp: new Date().toISOString(),
                            port: this.portName,
                            rawData: data
                        });

                        // Emit juga sebagai RFID scan untuk integrasi dengan sistem
                        this.socketIO.emit('new_rfid_scan', {
                            uid: uid,
                            scannedAt: new Date(),
                            source: 'serial'
                        });
                    }

                    return uid;
                } else {
                    console.log('⚠️  Format data RFID legacy tidak valid:', data);
                }
            } else {
                // Log data lain yang diterima untuk debugging
                console.log(`📝 Data serial lain: "${data}" (Length: ${data.length})`);

                // Additional check for partial RFID data
                if (data.length >= 10 && data.length <= 14 && /^[A-F0-9]+$/i.test(data)) {
                    console.log(`⚠️  Possible RFID ID dengan length tidak standard: "${data}"`);
                }
            }

        } catch (error) {
            console.error('❌ Error memproses data serial:', error);
        }
    }

    /**
     * Memulai proses reconnect otomatis
     */
    startReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log(`❌ Maksimal attempt reconnect (${this.maxReconnectAttempts}) tercapai`);
            return;
        }

        if (this.reconnectInterval) {
            clearTimeout(this.reconnectInterval);
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s

        console.log(`🔄 Mencoba reconnect dalam ${delay / 1000} detik... (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

        this.reconnectInterval = setTimeout(async () => {
            this.reconnectAttempts++;
            const success = await this.connect();

            if (!success) {
                this.startReconnect();
            }
        }, delay);
    }

    /**
     * Menutup koneksi serial
     * @returns {Promise<boolean>} Status berhasil menutup atau tidak
     */
    async disconnect() {
        try {
            if (this.reconnectInterval) {
                clearTimeout(this.reconnectInterval);
                this.reconnectInterval = null;
            }

            if (this.port && this.port.isOpen) {
                await new Promise((resolve) => {
                    this.port.close(resolve);
                });
                console.log(`✅ Koneksi serial ${this.portName} berhasil ditutup`);
            }

            this.isConnected = false;
            this.port = null;
            this.parser = null;

            // Emit status ke WebSocket clients
            if (this.socketIO) {
                this.socketIO.emit('serial_status', {
                    connected: false,
                    port: this.portName,
                    message: 'Koneksi serial ditutup'
                });
            }

            return true;

        } catch (error) {
            console.error('❌ Error menutup koneksi serial:', error);
            return false;
        }
    }

    /**
     * Mengirim data ke serial port (untuk testing)
     * @param {string} data - Data yang akan dikirim
     * @returns {Promise<boolean>} Status berhasil mengirim atau tidak
     */
    async sendData(data) {
        try {
            if (!this.port || !this.isConnected) {
                throw new Error('Port serial tidak terhubung');
            }

            await new Promise((resolve, reject) => {
                this.port.write(data + '\n', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            console.log(`📤 Data berhasil dikirim ke ${this.portName}: "${data}"`);
            return true;

        } catch (error) {
            console.error('❌ Error mengirim data serial:', error);
            return false;
        }
    }

    /**
     * Mendapatkan status koneksi
     * @returns {Object} Status koneksi dan informasi port
     */
    getStatus() {
        return {
            connected: this.isConnected,
            port: this.portName,
            baudRate: this.baudRate,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts
        };
    }
}

module.exports = SerialRfidReader; 