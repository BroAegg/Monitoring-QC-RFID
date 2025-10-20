/**
 * MQTT Service untuk Dashboard Karyawan
 * Menangani koneksi MQTT dan subscription ke topic-topic karyawan
 */

import mqtt from 'mqtt';

class MQTTService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.subscribers = new Map(); // Map untuk menyimpan callback functions
        this.employeeTopics = new Map(); // Map untuk menyimpan topic per karyawan
        this.connectionAttempts = 0;
        this.maxRetries = 3; // Kurangi dari 5 ke 3
        this.retryInterval = 2000; // Kurangi dari 3000 ke 2000

        // Persistent storage untuk data MQTT
        this.employeeData = new Map(); // Menyimpan data per karyawan
        this.loadPersistentData(); // Load data dari localStorage saat inisialisasi
    }

    // Load data persisten dari localStorage
    loadPersistentData() {
        try {
            const savedData = localStorage.getItem('mqtt_employee_data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.employeeData = new Map(Object.entries(parsedData));
                console.log('📥 Loaded persistent MQTT data:', this.employeeData);
            }
        } catch (error) {
            console.error('❌ Error loading persistent data:', error);
        }
    }

    // Save data persisten ke localStorage
    savePersistentData() {
        try {
            const dataToSave = Object.fromEntries(this.employeeData);
            localStorage.setItem('mqtt_employee_data', JSON.stringify(dataToSave));
            console.log('💾 Saved persistent MQTT data:', dataToSave);
        } catch (error) {
            console.error('❌ Error saving persistent data:', error);
        }
    }

    // Get data untuk karyawan tertentu
    getEmployeeData(employeeName) {
        const normalizedName = employeeName.toLowerCase().replace(/\s+/g, '_');
        return this.employeeData.get(normalizedName) || {
            workTime: { hours: 0, minutes: 0, seconds: 0 },
            lossTime: { hours: 0, minutes: 0, seconds: 0 },
            startTime: '08:00',
            endTime: '17:00',
            targetProduction: 100,
            actualProduction: 0,
            efficiency: 0,
            lastUpdated: new Date().toISOString()
        };
    }

    // Update data untuk karyawan tertentu
    updateEmployeeData(employeeName, dataType, value) {
        const normalizedName = employeeName.toLowerCase().replace(/\s+/g, '_');
        const currentData = this.getEmployeeData(employeeName);

        let updatedData = { ...currentData };

        switch (dataType) {
            case 'workTime':
                // Tambah detik ke work time
                const currentWorkSeconds = currentData.workTime.hours * 3600 + currentData.workTime.minutes * 60 + currentData.workTime.seconds;
                const newWorkSeconds = currentWorkSeconds + value;
                updatedData.workTime = {
                    hours: Math.floor(newWorkSeconds / 3600),
                    minutes: Math.floor((newWorkSeconds % 3600) / 60),
                    seconds: newWorkSeconds % 60
                };
                break;
            case 'lossTime':
                // Tambah detik ke loss time
                const currentLossSeconds = currentData.lossTime.hours * 3600 + currentData.lossTime.minutes * 60 + currentData.lossTime.seconds;
                const newLossSeconds = currentLossSeconds + value;
                updatedData.lossTime = {
                    hours: Math.floor(newLossSeconds / 3600),
                    minutes: Math.floor((newLossSeconds % 3600) / 60),
                    seconds: newLossSeconds % 60
                };
                break;
            case 'targetProduction':
                updatedData.targetProduction = value;
                // Update efficiency jika actual production sudah ada
                if (updatedData.actualProduction > 0) {
                    updatedData.efficiency = Math.min(100, ((updatedData.actualProduction / value) * 100));
                }
                break;
            case 'actualProduction':
                updatedData.actualProduction = value;
                updatedData.efficiency = Math.min(100, ((value / updatedData.targetProduction) * 100));
                break;
            case 'checkIn':
                // Set waktu mulai dengan timestamp saat ini
                const now = new Date();
                updatedData.startTime = now.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                break;
            case 'checkOut':
                // Set waktu selesai dengan timestamp saat ini
                const endTime = new Date();
                updatedData.endTime = endTime.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                break;
        }

        updatedData.lastUpdated = new Date().toISOString();
        this.employeeData.set(normalizedName, updatedData);
        this.savePersistentData();

        console.log(`📊 Updated ${employeeName} ${dataType}:`, updatedData);
        return updatedData;
    }

    // Reset data untuk karyawan tertentu (untuk testing)
    resetEmployeeData(employeeName) {
        const normalizedName = employeeName.toLowerCase().replace(/\s+/g, '_');
        // Set data ke nilai default (0 untuk times, 100 untuk target, 0 untuk actual)
        const resetData = {
            workTime: { hours: 0, minutes: 0, seconds: 0 },
            lossTime: { hours: 0, minutes: 0, seconds: 0 },
            startTime: '08:00',
            endTime: '17:00',
            targetProduction: 100,
            actualProduction: 0,
            efficiency: 0,
            lastUpdated: new Date().toISOString()
        };
        this.employeeData.set(normalizedName, resetData);
        this.savePersistentData();
        console.log(`🔄 Reset data for ${employeeName} to:`, resetData);
    }

    // Reset semua data (untuk testing)
    resetAllData() {
        this.employeeData.clear();
        this.savePersistentData();
        console.log('🔄 Reset all MQTT data');
    }

    // Koneksi ke MQTT broker dengan retry logic
    connect(brokerUrl = 'ws://localhost:9001') {
        try {
            console.log('🔄 Connecting to MQTT broker:', brokerUrl);

            // Disconnect existing connection if any
            if (this.client) {
                this.client.end();
                this.client = null;
            }

            this.client = mqtt.connect(brokerUrl, {
                clientId: `dashboard_${Math.random().toString(16).slice(3)}`,
                clean: true,
                connectTimeout: 10000, // Increased timeout
                reconnectPeriod: 2000, // Increased reconnect period
                keepalive: 60,
                rejectUnauthorized: false, // For development
            });

            this.client.on('connect', () => {
                console.log('✅ Connected to MQTT broker');
                this.isConnected = true;
                this.connectionAttempts = 0; // Reset attempts on successful connection
                this.subscribeToAllTopics();
            });

            this.client.on('message', (topic, message) => {
                this.handleMessage(topic, message);
            });

            this.client.on('error', (error) => {
                console.error('❌ MQTT Error:', error);
                this.isConnected = false;
                this.handleConnectionError();
            });

            this.client.on('close', () => {
                console.log('🔌 MQTT connection closed');
                this.isConnected = false;
                this.handleConnectionError();
            });

            this.client.on('reconnect', () => {
                console.log('🔄 Reconnecting to MQTT broker...');
            });

            this.client.on('offline', () => {
                console.log('📴 MQTT client went offline');
                this.isConnected = false;
            });

        } catch (error) {
            console.error('❌ Failed to connect to MQTT:', error);
            this.handleConnectionError();
        }
    }

    // Handle connection errors dengan retry logic
    handleConnectionError() {
        if (this.connectionAttempts < this.maxRetries) {
            this.connectionAttempts++;
            console.log(`🔄 Retry attempt ${this.connectionAttempts}/${this.maxRetries} in ${this.retryInterval / 1000} seconds...`);

            setTimeout(() => {
                this.connect();
            }, this.retryInterval);
        } else {
            console.error('❌ Max retry attempts reached. MQTT connection failed.');
            console.log('💡 Troubleshooting tips:');
            console.log('   1. Pastikan Docker Mosquitto broker berjalan: docker run -it -p 1883:1883 -p 9001:9001 eclipse-mosquitto');
            console.log('   2. Periksa port 9001 tidak diblokir firewall');
            console.log('   3. Pastikan WebSocket listener aktif di Docker container');
        }
    }

    // Disconnect dari MQTT broker
    disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
            this.isConnected = false;
            this.connectionAttempts = 0;
            console.log('🔌 Disconnected from MQTT broker');
        }
    }

    // Generate topic names untuk karyawan
    generateEmployeeTopics(employeeName) {
        const normalizedName = employeeName.toLowerCase().replace(/\s+/g, '_');

        return {
            workTime: `work_time_${normalizedName}`,
            lossTime: `loss_time_${normalizedName}`,
            targetProduction: `target_production_${normalizedName}`,
            actualProduction: `actual_production_${normalizedName}`,
            checkIn: `check_in_${normalizedName}`,
            checkOut: `check_out_${normalizedName}`
        };
    }

    // Subscribe ke topic untuk karyawan tertentu
    subscribeToEmployee(employeeName, callback) {
        const topics = this.generateEmployeeTopics(employeeName);

        // Simpan callback untuk karyawan ini
        this.subscribers.set(employeeName, callback);
        this.employeeTopics.set(employeeName, topics);

        if (this.isConnected && this.client) {
            Object.values(topics).forEach(topic => {
                this.client.subscribe(topic, (err) => {
                    if (err) {
                        console.error(`❌ Failed to subscribe to ${topic}:`, err);
                    } else {
                        console.log(`✅ Subscribed to ${topic}`);
                    }
                });
            });
        } else {
            console.log('⚠️ MQTT not connected, will subscribe when connected');
        }
    }

    // Unsubscribe dari topic karyawan
    unsubscribeFromEmployee(employeeName) {
        const topics = this.employeeTopics.get(employeeName);

        if (topics && this.isConnected && this.client) {
            Object.values(topics).forEach(topic => {
                this.client.unsubscribe(topic, (err) => {
                    if (err) {
                        console.error(`❌ Failed to unsubscribe from ${topic}:`, err);
                    } else {
                        console.log(`✅ Unsubscribed from ${topic}`);
                    }
                });
            });
        }

        this.subscribers.delete(employeeName);
        this.employeeTopics.delete(employeeName);
    }

    // Subscribe ke semua topic yang sudah terdaftar
    subscribeToAllTopics() {
        if (!this.isConnected || !this.client) {
            console.log('⚠️ Cannot subscribe: MQTT not connected');
            return;
        }

        this.employeeTopics.forEach((topics, employeeName) => {
            Object.values(topics).forEach(topic => {
                this.client.subscribe(topic, (err) => {
                    if (err) {
                        console.error(`❌ Failed to subscribe to ${topic}:`, err);
                    } else {
                        console.log(`✅ Subscribed to ${topic}`);
                    }
                });
            });
        });
    }

    // Handle incoming messages
    handleMessage(topic, message) {
        try {
            const value = parseInt(message.toString());

            if (isNaN(value)) {
                console.warn(`⚠️ Invalid value received on ${topic}:`, message.toString());
                return;
            }

            // Cari karyawan berdasarkan topic
            let employeeName = null;
            let dataType = null;

            this.employeeTopics.forEach((topics, name) => {
                if (topics.workTime === topic) {
                    employeeName = name;
                    dataType = 'workTime';
                } else if (topics.lossTime === topic) {
                    employeeName = name;
                    dataType = 'lossTime';
                } else if (topics.targetProduction === topic) {
                    employeeName = name;
                    dataType = 'targetProduction';
                } else if (topics.actualProduction === topic) {
                    employeeName = name;
                    dataType = 'actualProduction';
                } else if (topics.checkIn === topic) {
                    employeeName = name;
                    dataType = 'checkIn';
                } else if (topics.checkOut === topic) {
                    employeeName = name;
                    dataType = 'checkOut';
                }
            });

            if (employeeName && dataType) {
                // Update data persisten
                const updatedData = this.updateEmployeeData(employeeName, dataType, value);

                // Callback ke component
                const callback = this.subscribers.get(employeeName);
                if (callback) {
                    callback({
                        employeeName,
                        dataType,
                        value,
                        topic,
                        timestamp: new Date().toISOString(),
                        updatedData: updatedData
                    });
                }
            }

        } catch (error) {
            console.error('❌ Error handling MQTT message:', error);
        }
    }

    // Publish message ke topic (untuk testing)
    publish(topic, message) {
        if (this.isConnected && this.client) {
            this.client.publish(topic, message.toString(), (err) => {
                if (err) {
                    console.error(`❌ Failed to publish to ${topic}:`, err);
                } else {
                    console.log(`📤 Published to ${topic}: ${message}`);
                }
            });
        } else {
            console.warn('⚠️ MQTT not connected, cannot publish message');
        }
    }

    // Get connection status
    getConnectionStatus() {
        return this.isConnected && this.client && this.client.connected;
    }

    // Get connection details
    getConnectionInfo() {
        return {
            isConnected: this.isConnected,
            clientExists: !!this.client,
            clientConnected: this.client ? this.client.connected : false,
            connectionAttempts: this.connectionAttempts,
            maxRetries: this.maxRetries
        };
    }

    // Get list of all topics
    getAllTopics() {
        const allTopics = [];
        this.employeeTopics.forEach((topics, employeeName) => {
            allTopics.push({
                employeeName,
                topics
            });
        });
        return allTopics;
    }

    // Test connection
    testConnection() {
        if (this.isConnected && this.client) {
            console.log('✅ MQTT Connection Test: SUCCESS');
            console.log('   - Client connected:', this.client.connected);
            console.log('   - Connection state:', this.client.connected ? 'Connected' : 'Disconnected');
            return true;
        } else {
            console.log('❌ MQTT Connection Test: FAILED');
            console.log('   - Service connected:', this.isConnected);
            console.log('   - Client exists:', !!this.client);
            return false;
        }
    }
}

// Export singleton instance
const mqttService = new MQTTService();
export default mqttService; 