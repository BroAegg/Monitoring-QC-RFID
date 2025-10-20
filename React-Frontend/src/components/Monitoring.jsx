/**
 * Komponen Monitoring - Professional RFID Monitoring dengan real-time scanning
 * Menampilkan monitoring scan RFID secara real-time dengan kontrol serial dan test
 * Menggunakan Socket.IO untuk koneksi WebSocket dengan backend
 */

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getAllScans, addScanManual, healthCheck, getAllEmployees } from '../services/api';
import './Monitoring.css';

const Monitoring = () => {
    console.log('🚀 Monitoring component rendering...');

    // State management untuk monitoring
    const [scans, setScans] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [testUid, setTestUid] = useState('');
    const [backendStatus, setBackendStatus] = useState('unknown');

    // State management untuk test RFID reader
    const [isSerialConnected, setIsSerialConnected] = useState(false);
    const [rfidData, setRfidData] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [lastScanTime, setLastScanTime] = useState(null);

    // State untuk real-time scanning
    const [isRealtimeActive, setIsRealtimeActive] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [currentScan, setCurrentScan] = useState(null);

    // State untuk error handling
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Refs
    const socketRef = useRef(null);
    const scanIntervalRef = useRef(null);

    /**
     * Menampilkan pesan notifikasi
     */
    const showMessage = (text, type) => {
        console.log(`[${type.toUpperCase()}] ${text}`);
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    /**
     * Inisialisasi koneksi Socket.IO dengan error handling yang lebih baik
     */
    const initializeSocket = () => {
        try {
            const serverURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
            console.log('🔌 Mencoba koneksi ke:', serverURL);

            if (typeof io === 'undefined') {
                console.error('❌ Socket.IO client tidak tersedia');
                showMessage('Socket.IO client tidak tersedia', 'error');
                return;
            }

            socketRef.current = io(serverURL, {
                transports: ['websocket', 'polling'],
                autoConnect: true,
                timeout: 5000,
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 1000,
            });

            // Event listeners untuk Socket.IO
            socketRef.current.on('connect', () => {
                console.log('🔗 Terhubung ke backend via Socket.IO');
                setIsConnected(true);
                setHasError(false);
                showMessage('Berhasil terhubung ke server', 'success');
            });

            socketRef.current.on('disconnect', () => {
                console.log('❌ Terputus dari backend');
                setIsConnected(false);
                showMessage('Terputus dari server', 'error');
            });

            socketRef.current.on('serial_status', (status) => {
                console.log('📡 Serial status:', status);
                setIsSerialConnected(status.connected);
                setConnectionStatus(status.message);
            });

            socketRef.current.on('rfid_serial_data', (data) => {
                console.log('📋 RFID data dari serial:', data);
                handleRealtimeScan(data.uid);
            });

            socketRef.current.on('new_scan', (scanData) => {
                console.log('📡 Scan RFID baru diterima:', scanData);
                handleNewScan(scanData);
            });

            socketRef.current.on('rfid_error', (errorData) => {
                console.error('❌ Error RFID:', errorData);
                showMessage(`Error RFID: ${errorData.message}`, 'error');
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error);
                setIsConnected(false);
                setHasError(true);
                setErrorMessage('Gagal terhubung ke server backend');
                showMessage('Gagal terhubung ke server - Backend mungkin tidak berjalan', 'error');
            });

        } catch (error) {
            console.error('❌ Error initializing socket:', error);
            setHasError(true);
            setErrorMessage('Error initializing socket connection');
            showMessage('Error initializing socket connection', 'error');
        }
    };

    /**
     * Handle real-time scan dengan data karyawan lengkap
     */
    const handleRealtimeScan = async (uid) => {
        try {
            console.log(`🔍 Monitoring: Real-time scan detected: ${uid}`);
            console.log(`🔍 Available employees count: ${employees.length}`);

            // Log semua employee untuk debugging
            console.log('🔍 All employees in state:');
            employees.forEach((emp, index) => {
                console.log(`   ${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
            });

            // Cari employee dengan case-insensitive matching
            let employee = employees.find(emp => {
                const match = emp.idCard && emp.idCard.toUpperCase() === uid.toUpperCase();
                console.log(`   Comparing: "${emp.idCard}" with "${uid}" -> ${match}`);
                return match;
            });

            console.log(`✅ Employee found in state: ${employee ? employee.nama : 'Not found'}`);

            // Jika tidak ditemukan di state, coba cari via API
            if (!employee) {
                console.log('⚠️ Employee not found in state, trying API...');
                try {
                    const response = await fetch(`http://localhost:5000/api/employees/rfid/${uid}`);
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            employee = result.data;
                            console.log(`✅ Employee found via API: ${employee.nama} (${employee.idCard})`);

                            // Refresh employees data dari backend
                            await loadEmployees();
                        } else {
                            console.log(`❌ Employee not found via API for RFID: ${uid}`);
                        }
                    } else {
                        console.log(`❌ API error for RFID: ${uid}, status: ${response.status}`);
                    }
                } catch (error) {
                    console.error('❌ Error calling API:', error);
                }
            }

            const scanData = {
                uid: uid,
                timestamp: new Date(),
                employee: employee || null,
                employeeName: employee?.nama || 'Unknown Employee',
                employeeNik: employee?.nik || '-',
                employeeBagian: employee?.bagian || '-',
                employeeLine: employee?.line || '-',
                employeeStatus: employee?.status || 'unknown'
            };

            setCurrentScan(scanData);

            const newRfidEntry = {
                id: Date.now(),
                uid: uid,
                timestamp: new Date(),
                source: 'Serial COM4',
                employee: employee
            };

            setRfidData(prev => [newRfidEntry, ...prev.slice(0, 19)]);
            setLastScanTime(new Date());

            if (employee) {
                showMessage(`✅ ${employee.nama} (${employee.bagian} - ${employee.line})`, 'success');
            } else {
                showMessage(`⚠️ Unknown RFID: ${uid}`, 'warning');
            }

            setTimeout(() => setCurrentScan(null), 3000);
        } catch (error) {
            console.error('❌ Error handling real-time scan:', error);
            showMessage('Error processing real-time scan', 'error');
        }
    };

    /**
     * Handle new scan dari database
     */
    const handleNewScan = (scanData) => {
        try {
            const formattedScan = {
                ...scanData,
                timestamp: new Date(scanData.scannedAt || new Date()),
                employeeName: scanData.employee?.nama || 'Employee Not Found',
                employeeNik: scanData.employee?.nik || '-',
                employeeBagian: scanData.employee?.bagian || '-',
                employeeLine: scanData.employee?.line || '-',
                employeeStatus: scanData.employee?.status || 'unknown'
            };

            setScans(prevScans => [formattedScan, ...prevScans.slice(0, 49)]);

            const employeeInfo = scanData.employee
                ? `${scanData.employee.nama} (${scanData.employee.bagian} - ${scanData.employee.line})`
                : `Unknown RFID: ${scanData.uid}`;
            showMessage(`RFID Scan: ${employeeInfo}`, scanData.employee ? 'success' : 'warning');
        } catch (error) {
            console.error('❌ Error handling new scan:', error);
            showMessage('Error processing new scan data', 'error');
        }
    };

    /**
     * Memuat data scan dari backend dengan error handling
     */
    const loadScans = async () => {
        setIsLoading(true);
        try {
            console.log('📥 Loading scans from backend...');
            const response = await getAllScans();
            console.log('📥 Scans loaded:', response);
            setScans(response.data || []);
            showMessage(`Berhasil memuat ${response.count || 0} data scan`, 'success');
        } catch (error) {
            console.error('❌ Error loading scans:', error);
            setScans([]);
            showMessage(error.message || 'Gagal memuat data scan - Backend mungkin tidak berjalan', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Memuat data karyawan untuk mapping RFID dengan error handling
     */
    const loadEmployees = async () => {
        try {
            console.log('👥 Loading employees data...');
            const response = await getAllEmployees();
            const employeesData = response.data || [];

            console.log('👥 Raw employees data:', employeesData);
            console.log('👥 Employees loaded:', employeesData.length);

            // Log sample employee untuk debugging
            if (employeesData.length > 0) {
                console.log('👥 Sample employee:', {
                    idCard: employeesData[0].idCard,
                    nama: employeesData[0].nama,
                    bagian: employeesData[0].bagian
                });

                // Cek apakah RFID target ada dalam data
                const targetEmployee = employeesData.find(emp => emp.idCard === '4300445CFBA0');
                if (targetEmployee) {
                    console.log('✅ Target RFID found in loaded data:', targetEmployee.nama);
                } else {
                    console.log('❌ Target RFID NOT found in loaded data');
                    console.log('Available RFID IDs:');
                    employeesData.forEach((emp, index) => {
                        console.log(`   ${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
                    });
                }
            }

            setEmployees(employeesData);
        } catch (error) {
            console.error('❌ Error loading employees:', error);
            setEmployees([]);
            showMessage('Gagal memuat data karyawan - Backend mungkin tidak berjalan', 'error');
        }
    };

    /**
     * Cek status backend dengan error handling
     */
    const checkBackendStatus = async () => {
        try {
            console.log('🔍 Checking backend status...');
            await healthCheck();
            setBackendStatus('online');
            setHasError(false);
            console.log('✅ Backend online');
        } catch (error) {
            setBackendStatus('offline');
            setHasError(true);
            setErrorMessage('Backend tidak dapat dijangkau');
            console.error('❌ Backend offline:', error);
        }
    };

    /**
     * Fungsi untuk memulai koneksi serial COM 4
     */
    const handleStartSerial = () => {
        if (socketRef.current && isConnected) {
            console.log('📡 Starting serial connection...');
            socketRef.current.emit('start_serial_connection', { port: 'COM4', baudRate: 9600 });
            setIsRealtimeActive(true);
        } else {
            showMessage('Socket tidak tersedia atau tidak terhubung', 'error');
        }
    };

    /**
     * Fungsi untuk menghentikan koneksi serial
     */
    const handleStopSerial = () => {
        if (socketRef.current && isConnected) {
            console.log('⏹️ Stopping serial connection...');
            socketRef.current.emit('stop_serial_connection');
            setIsRealtimeActive(false);
        } else {
            showMessage('Socket tidak tersedia atau tidak terhubung', 'error');
        }
    };

    /**
     * Simulasi data test dengan data karyawan real
     */
    const handleSimulateTest = () => {
        try {
            console.log('🎲 Simulating test data...');
            const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
            const uid = randomEmployee ? randomEmployee.idCard : '43' + Math.random().toString(16).substr(2, 10).toUpperCase();

            const newRfidEntry = {
                id: Date.now(),
                uid: uid,
                timestamp: new Date(),
                source: 'Test Simulation',
                employee: randomEmployee
            };

            setRfidData(prev => [newRfidEntry, ...prev.slice(0, 19)]);
            setLastScanTime(new Date());

            if (randomEmployee) {
                showMessage(`🎲 Simulasi: ${randomEmployee.nama} (${randomEmployee.bagian})`, 'success');
            } else {
                showMessage('Test data berhasil disimulasikan', 'success');
            }
        } catch (error) {
            console.error('❌ Error simulating test data:', error);
            showMessage('Error simulating test data', 'error');
        }
    };

    /**
     * Test scan manual dengan data karyawan
     */
    const handleTestScan = async () => {
        if (!testUid.trim()) {
            showMessage('Masukkan UID untuk test scan', 'error');
            return;
        }

        setIsLoading(true);
        try {
            console.log('🔍 Testing scan with UID:', testUid);
            const employee = employees.find(emp => emp.idCard === testUid.trim());

            if (employee) {
                const newScan = {
                    _id: Date.now(),
                    uid: testUid.trim(),
                    timestamp: new Date(),
                    employeeName: employee.nama,
                    employeeNik: employee.nik,
                    employeeBagian: employee.bagian,
                    employeeLine: employee.line,
                    employee: employee
                };
                setScans(prev => [newScan, ...prev.slice(0, 49)]);
                showMessage(`✅ Test scan: ${employee.nama} (${employee.bagian})`, 'success');
            } else {
                await addScanManual(testUid.trim());
                showMessage('Test scan berhasil ditambahkan (Unknown UID)', 'warning');
            }
            setTestUid('');
        } catch (error) {
            console.error('❌ Error test scan:', error);
            showMessage(error.message || 'Gagal melakukan test scan', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Clear semua scan history
     */
    const handleClearAllScans = async () => {
        if (!window.confirm('Yakin ingin menghapus SEMUA riwayat scan? Data tidak dapat dikembalikan!')) {
            return;
        }

        setIsLoading(true);
        try {
            console.log('🗑️ Clearing all scans...');
            // NOTE: Consider moving this URL to a centralized config or service function
            const response = await fetch('http://localhost:5000/api/scans/clear-all', {
                method: 'DELETE',
            });

            if (response.ok) {
                const result = await response.json();
                setScans([]);
                showMessage(`✅ Berhasil menghapus ${result.deletedCount || 'semua'} data scan`, 'success');
            } else {
                throw new Error('Failed to clear scans');
            }
        } catch (error) {
            console.error('Error clearing scans:', error);
            showMessage('❌ Gagal menghapus riwayat scan', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Clear data test RFID
     */
    const handleClearTestData = () => {
        console.log('🗑️ Clearing test data...');
        setRfidData([]);
        setLastScanTime(null);
        showMessage('Test data berhasil dihapus', 'success');
    };

    /**
     * Toggle real-time scanning mode
     */
    const toggleRealtimeMode = () => {
        setIsRealtimeActive(!isRealtimeActive);
        if (!isRealtimeActive) {
            showMessage('Real-time scanning mode aktif', 'success');
        } else {
            showMessage('Real-time scanning mode nonaktif', 'info');
        }
    };

    /**
     * Retry connection
     */
    const handleRetryConnection = () => {
        setHasError(false);
        setErrorMessage('');
        initializeSocket();
        checkBackendStatus();
    };

    // useEffect untuk inisialisasi
    useEffect(() => {
        console.log('🚀 Monitoring component mounted');

        initializeSocket();
        loadScans();
        loadEmployees();
        checkBackendStatus();

        // Set up interval untuk refresh employees data setiap 30 detik
        const employeesInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing employees data...');
            loadEmployees();
        }, 30000);

        return () => {
            console.log('🧹 Cleaning up Monitoring component');
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
            }
            if (employeesInterval) {
                clearInterval(employeesInterval);
            }
        };
    }, []);

    console.log('🔄 Rendering Monitoring component', {
        isConnected,
        isSerialConnected,
        backendStatus,
        scansCount: scans.length,
        rfidDataCount: rfidData.length,
        employeesCount: employees.length,
        isRealtimeActive,
        hasError
    });

    // Error state UI
    if (hasError) {
        return (
            <div className="monitoring-container">
                <div className="error-state">
                    <div className="error-content">
                        <h2>⚠️ Koneksi Error</h2>
                        <p>{errorMessage || 'Terjadi kesalahan pada sistem monitoring'}</p>
                        <div className="error-actions">
                            <button
                                className="btn btn-primary"
                                onClick={handleRetryConnection}
                            >
                                🔄 Coba Lagi
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => window.location.reload()}
                            >
                                🔄 Refresh Halaman
                            </button>
                        </div>
                        <div className="error-tips">
                            <h4>Tips Troubleshooting:</h4>
                            <ul>
                                <li>Pastikan backend server berjalan di port 5000</li>
                                <li>Periksa koneksi internet Anda</li>
                                <li>Coba refresh halaman</li>
                                <li>Hubungi administrator jika masalah berlanjut</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback UI jika komponen masih loading
    if (isLoading && scans.length === 0 && employees.length === 0) {
        return (
            <div className="monitoring-container">
                <div className="error-state">
                    <div className="error-content">
                        <h2>⏳ Loading Monitoring System</h2>
                        <p>Sedang memuat sistem monitoring RFID...</p>
                        <div className="error-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                🔄 Refresh Halaman
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="monitoring-container">
            {/* ... Sisa kode JSX Anda tetap sama ... */}
            {isRealtimeActive && (
                <div className="realtime-indicator">
                    Real-time Scanning Active
                </div>
            )}

            {/* Current Scan Animation */}
            {currentScan && (
                <div className="current-scan-overlay">
                    <div className="current-scan-card">
                        <div className="scan-animation">
                            <div className="scan-icon">📱</div>
                            <div className="scan-text">
                                <h3>RFID Card Detected!</h3>
                                <p className="scan-uid">{currentScan.uid}</p>
                                {currentScan.employee ? (
                                    <div className="employee-info">
                                        <h4>{currentScan.employeeName}</h4>
                                        <p>NIK: {currentScan.employeeNik}</p>
                                        <p>Bagian: {currentScan.employeeBagian}</p>
                                        <p>Line: {currentScan.employeeLine}</p>
                                    </div>
                                ) : (
                                    <p className="unknown-employee">Unknown Employee</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Display */}
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Header */}
            <div className="monitoring-header">
                <h1>📡 Monitoring RFID System</h1>
                <p>Professional RFID monitoring dengan real-time scanning dan data karyawan lengkap</p>
            </div>

            {/* Status Panel */}
            <div className="status-panel">
                <div className="status-row">
                    <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                        <span className="status-dot"></span>
                        <span>Backend Connection</span>
                    </div>
                    <div className={`status-indicator ${isSerialConnected ? 'connected' : 'disconnected'}`}>
                        <span className="status-dot"></span>
                        <span>Serial COM4</span>
                    </div>
                    <div className={`status-indicator ${backendStatus}`}>
                        <span className="status-dot"></span>
                        <span>Backend Status</span>
                    </div>
                    <div className={`status-indicator ${isRealtimeActive ? 'connected' : 'disconnected'}`}>
                        <span className="status-dot"></span>
                        <span>Real-time Mode</span>
                    </div>
                    <div className="status-indicator">
                        <span className="status-dot"></span>
                        <span>Total Scan: {scans.length}</span>
                    </div>
                    <div className="status-indicator">
                        <span className="status-dot"></span>
                        <span>Employees: {employees.length}</span>
                    </div>
                </div>
                <div className="status-message">
                    <strong>Status:</strong> {connectionStatus}
                </div>
                {lastScanTime && (
                    <div className="last-scan">
                        <strong>Last Scan:</strong> {lastScanTime.toLocaleString('id-ID')}
                    </div>
                )}
            </div>

            {/* Control Panel */}
            <div className="control-panel">
                <div className="control-group">
                    <h3>📡 Serial Connection Controls</h3>
                    <div className="button-group">
                        <button className="btn btn-primary" onClick={handleStartSerial} disabled={isSerialConnected || !isConnected}>
                            📡 Connect COM4
                        </button>
                        <button className="btn btn-danger" onClick={handleStopSerial} disabled={!isSerialConnected || !isConnected}>
                            ⏹️ Disconnect
                        </button>
                        <button className={`btn ${isRealtimeActive ? 'btn-test' : 'btn-secondary'}`} onClick={toggleRealtimeMode}>
                            {isRealtimeActive ? '🟢' : '🔴'} Real-time Mode
                        </button>
                    </div>
                </div>
                <div className="control-group">
                    <h3>🧪 Test & Debug</h3>
                    <div className="button-group">
                        <button className="btn btn-secondary" onClick={handleSimulateTest} disabled={employees.length === 0}>
                            🎲 Simulate Test Data
                        </button>
                        <button className="btn btn-warning" onClick={handleClearTestData}>
                            🗑️ Clear Test Data
                        </button>
                        <button className="btn btn-refresh" onClick={loadEmployees} disabled={isLoading}>
                            👥 Refresh Employees
                        </button>
                        <button className="btn btn-primary" onClick={() => {
                            console.log('🔍 Current employees count:', employees.length);
                            console.log('🔍 Employees data:', employees);
                        }}>
                            🔍 Debug Employees
                        </button>
                    </div>
                </div>
                <div className="control-group">
                    <h3>🔍 Manual Test Scan</h3>
                    <div className="test-controls">
                        <input
                            type="text"
                            value={testUid}
                            onChange={(e) => setTestUid(e.target.value)}
                            placeholder="Masukkan UID untuk test (contoh: 43A1B2C3D4)"
                            className="test-input"
                            onKeyPress={(e) => e.key === 'Enter' && handleTestScan()}
                        />
                        <button onClick={handleTestScan} disabled={isLoading || !testUid.trim()} className="btn btn-test">
                            {isLoading ? '⏳' : '🔍'} Test Scan
                        </button>
                        <button onClick={loadScans} disabled={isLoading} className="btn btn-refresh">
                            {isLoading ? '⏳' : '🔄'} Refresh
                        </button>
                        <button onClick={handleClearAllScans} disabled={isLoading} className="btn btn-danger">
                            {isLoading ? '⏳' : '🗑️'} Clear All
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Panels */}
            <div className="data-display-grid">
                <div className="data-panel">
                    <div className="data-header">
                        <h3>📋 Data RFID Real-time (Test)</h3>
                        <span className="data-count">Total: {rfidData.length} entries</span>
                    </div>
                    <div className="data-list">
                        {rfidData.length === 0 ? (
                            <div className="no-data">
                                <p>🔍 Belum ada data RFID yang terdeteksi</p>
                                <p>Pastikan RFID reader terhubung ke COM4 dan tekan "Connect COM4"</p>
                            </div>
                        ) : (
                            rfidData.map((entry, index) => (
                                <div key={entry.id} className={`data-entry ${index === 0 ? 'latest' : ''}`}>
                                    <div className="entry-header">
                                        <span className="entry-number">#{rfidData.length - index}</span>
                                        <span className="entry-source">{entry.source}</span>
                                        <span className="entry-time">{entry.timestamp.toLocaleTimeString('id-ID')}</span>
                                    </div>
                                    <div className="entry-uid">
                                        <strong>ID Kartu Terdeteksi: {entry.uid}</strong>
                                    </div>
                                    {entry.employee && (
                                        <div className="employee-details">
                                            <div className="scan-employee"><strong>Karyawan:</strong> {entry.employee.nama}</div>
                                            <div className="scan-info">
                                                <span>NIK: {entry.employee.nik}</span>
                                                <span>Bagian: {entry.employee.bagian}</span>
                                                <span>Line: {entry.employee.line}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="scan-history-panel">
                    <div className="scan-history-header">
                        <h3>📊 Riwayat Scan Database</h3>
                        <span className="scan-count">Total: {scans.length} scans</span>
                    </div>
                    <div className="scan-list">
                        {scans.length === 0 ? (
                            <div className="no-scans">
                                <p>📋 Belum ada riwayat scan dalam database</p>
                                <p>Scan RFID akan muncul di sini secara real-time</p>
                            </div>
                        ) : (
                            scans.map((scan, index) => (
                                <div key={scan._id || index} className={`scan-entry ${index === 0 ? 'latest' : ''}`}>
                                    <div className="scan-header">
                                        <span className="scan-number">#{scans.length - index}</span>
                                        <span className="scan-time">{new Date(scan.timestamp).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="scan-details">
                                        <div className="scan-uid"><strong>RFID UID:</strong> {scan.uid}</div>
                                        <div className="scan-employee"><strong>Karyawan:</strong> {scan.employeeName}</div>
                                        <div className="scan-info">
                                            <span>NIK: {scan.employeeNik}</span>
                                            <span>Bagian: {scan.employeeBagian}</span>
                                            <span>Line: {scan.employeeLine}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Monitoring;