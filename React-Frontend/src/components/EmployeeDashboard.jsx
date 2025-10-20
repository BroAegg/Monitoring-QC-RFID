/**
 * Komponen EmployeeDashboard - Dashboard Detail Karyawan dengan Data Realtime
 * Menampilkan data produktivitas karyawan dengan simulasi data realtime dari MQTT
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './EmployeeDashboard.css';
import mqttService from '../services/mqttService';

const EmployeeDashboard = ({ employee, onClose }) => {
    const [dashboardData, setDashboardData] = useState({
        workTime: { hours: 0, minutes: 0, seconds: 0 },
        lossTime: { hours: 0, minutes: 0, seconds: 0 },
        startTime: '08:00',
        endTime: '17:00',
        targetProduction: 100,
        actualProduction: 0,
        efficiency: 0,
        status: 'active'
    });

    const [chartData, setChartData] = useState({
        workTimeHistory: [],
        lossTimeHistory: [],
        efficiencyHistory: [],
        productionHistory: []
    });

    const [timeRange, setTimeRange] = useState('today');
    const [mqttStatus, setMqttStatus] = useState('disconnected');
    const [mqttInfo, setMqttInfo] = useState({});
    const intervalRef = useRef(null);

    // MQTT Connection dan Subscription
    useEffect(() => {
        console.log('🔌 Initializing MQTT connection for employee:', employee.employeeName);
        mqttService.connect(); // Connect to MQTT broker

        // Load data persisten untuk karyawan ini
        const persistentData = mqttService.getEmployeeData(employee.employeeName);
        if (persistentData) {
            setDashboardData(prevData => ({
                ...prevData,
                workTime: persistentData.workTime,
                lossTime: persistentData.lossTime,
                targetProduction: persistentData.targetProduction,
                actualProduction: persistentData.actualProduction,
                efficiency: persistentData.efficiency
            }));
            console.log('📥 Loaded persistent data for', employee.employeeName, ':', persistentData);
        }

        mqttService.subscribeToEmployee(employee.employeeName, (mqttData) => {
            console.log('📨 MQTT Data received:', mqttData);

            // Gunakan data yang sudah diupdate oleh MQTT service
            if (mqttData.updatedData) {
                setDashboardData(prevData => ({
                    ...prevData,
                    workTime: mqttData.updatedData.workTime,
                    lossTime: mqttData.updatedData.lossTime,
                    targetProduction: mqttData.updatedData.targetProduction,
                    actualProduction: mqttData.updatedData.actualProduction,
                    efficiency: mqttData.updatedData.efficiency
                }));
            }
        });

        const checkMqttStatus = () => {
            const status = mqttService.getConnectionStatus();
            const info = mqttService.getConnectionInfo();
            setMqttStatus(status ? 'connected' : 'disconnected');
            setMqttInfo(info);
        };

        checkMqttStatus();
        const statusInterval = setInterval(checkMqttStatus, 2000);

        return () => {
            mqttService.unsubscribeFromEmployee(employee.employeeName);
            clearInterval(statusInterval);
        };
    }, [employee.employeeName]);

    // Test MQTT connection function
    const testMqttConnection = useCallback(() => {
        console.log('🧪 Testing MQTT connection...');
        mqttService.testConnection();

        // Update status immediately
        const status = mqttService.getConnectionStatus();
        const info = mqttService.getConnectionInfo();
        setMqttStatus(status ? 'connected' : 'disconnected');
        setMqttInfo(info);
    }, []);

    // Reset data untuk testing
    const resetEmployeeData = useCallback(() => {
        if (window.confirm(`Yakin ingin reset data untuk ${employee.employeeName}?`)) {
            mqttService.resetEmployeeData(employee.employeeName);

            // Reset dashboard data ke default
            const employeeData = generateEmployeeData(employee.employeeName);
            setDashboardData(prevData => ({
                ...prevData,
                workTime: { hours: 0, minutes: 0, seconds: 0 },
                lossTime: { hours: 0, minutes: 0, seconds: 0 },
                targetProduction: employeeData.targetProduction,
                actualProduction: 0,
                efficiency: 0
            }));

            console.log('🔄 Reset data for', employee.employeeName);
        }
    }, [employee.employeeName]);

    // Generate data dummy untuk karyawan berdasarkan nama (backup jika MQTT tidak tersedia)
    const generateEmployeeData = (employeeName) => {
        // Simple hash function untuk konsistensi data per karyawan
        let hash = 0;
        for (let i = 0; i < employeeName.length; i++) {
            const char = employeeName.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        const seed = Math.abs(hash);
        const random = (min, max) => {
            const x = Math.sin(seed) * 10000;
            return min + (x - Math.floor(x)) * (max - min);
        };

        return {
            workTime: {
                hours: Math.floor(random(2, 8)),
                minutes: Math.floor(random(0, 59)),
                seconds: Math.floor(random(0, 59))
            },
            lossTime: {
                hours: Math.floor(random(0, 2)),
                minutes: Math.floor(random(0, 30)),
                seconds: Math.floor(random(0, 59))
            },
            targetProduction: Math.floor(random(80, 150)),
            actualProduction: Math.floor(random(60, 120)),
            efficiency: Math.floor(random(70, 95)),
            status: ['active', 'break', 'maintenance'][Math.floor(random(0, 3))]
        };
    };

    // Generate data hourly untuk efficiency trend
    const generateHourlyData = (employeeName) => {
        let hash = 0;
        for (let i = 0; i < employeeName.length; i++) {
            const char = employeeName.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        const seed = Math.abs(hash);
        const random = (min, max) => {
            const x = Math.sin(seed) * 10000;
            return min + (x - Math.floor(x)) * (max - min);
        };

        const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        return hours.map((hour, index) => ({
            time: hour,
            value: Math.floor(random(65, 95)) // Efficiency antara 65-95%
        }));
    };

    // Initialize data (backup jika MQTT tidak tersedia)
    useEffect(() => {
        const employeeData = generateEmployeeData(employee.employeeName);
        const hourlyData = generateHourlyData(employee.employeeName);

        setDashboardData(prevData => ({
            ...prevData,
            ...employeeData,
            efficiency: Math.min(100, ((employeeData.actualProduction / employeeData.targetProduction) * 100))
        }));

        setChartData(prevData => ({
            ...prevData,
            efficiencyHistory: hourlyData
        }));
    }, [employee.employeeName]);

    // Simulasi data realtime setiap 1 menit (backup jika MQTT tidak tersedia)
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setDashboardData(prevData => {
                // Update work time (tambah 1 menit)
                const newWorkTime = { ...prevData.workTime };
                newWorkTime.minutes += 1;
                if (newWorkTime.minutes >= 60) {
                    newWorkTime.hours += 1;
                    newWorkTime.minutes = 0;
                }

                // Update actual production (tambah 1-3 unit)
                const productionIncrease = Math.floor(Math.random() * 3) + 1;
                const newActualProduction = prevData.actualProduction + productionIncrease;

                // Recalculate efficiency
                const newEfficiency = Math.min(100, ((newActualProduction / prevData.targetProduction) * 100));

                return {
                    ...prevData,
                    workTime: newWorkTime,
                    actualProduction: newActualProduction,
                    efficiency: newEfficiency
                };
            });
        }, 60000); // Update setiap 1 menit

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [employee.employeeName]);

    // Format time helper
    const formatTime = (timeObj) => {
        return `${timeObj.hours.toString().padStart(2, '0')}:${timeObj.minutes.toString().padStart(2, '0')}:${timeObj.seconds.toString().padStart(2, '0')}`;
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'break': return 'warning';
            case 'maintenance': return 'error';
            default: return 'neutral';
        }
    };

    // Get efficiency color
    const getEfficiencyColor = (efficiency) => {
        if (efficiency >= 90) return 'excellent';
        if (efficiency >= 80) return 'good';
        if (efficiency >= 70) return 'average';
        return 'poor';
    };

    return (
        <div className="employee-dashboard-overlay">
            <div className="employee-dashboard">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1>📊 Dashboard Karyawan</h1>
                        <p>Detail produktivitas realtime untuk {employee.employeeName}</p>
                    </div>
                    <div className="header-controls">
                        <div className="mqtt-status">
                            <span className={`mqtt-indicator ${mqttStatus}`}>
                                {mqttStatus === 'connected' ? '🔗' : '🔌'}
                            </span>
                            <span className="mqtt-text">
                                MQTT: {mqttStatus === 'connected' ? 'Connected' : 'Disconnected'}
                            </span>
                            <button
                                className="mqtt-test-btn"
                                onClick={testMqttConnection}
                                title="Test MQTT Connection"
                            >
                                🧪
                            </button>
                            <button
                                className="mqtt-reset-btn"
                                onClick={resetEmployeeData}
                                title="Reset Employee Data"
                            >
                                🔄
                            </button>
                        </div>
                        <select
                            className="time-filter"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="today">Hari Ini</option>
                            <option value="week">Minggu Ini</option>
                            <option value="month">Bulan Ini</option>
                        </select>
                        <button className="close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* MQTT Connection Info (Debug) - Hanya tampilkan jika benar-benar disconnected */}
                {mqttStatus === 'disconnected' && mqttInfo.connectionAttempts >= 3 && (
                    <div className="mqtt-debug-info">
                        <h4>🔧 MQTT Connection Debug Info:</h4>
                        <div className="debug-details">
                            <p><strong>Service Connected:</strong> {mqttInfo.isConnected ? 'Yes' : 'No'}</p>
                            <p><strong>Client Exists:</strong> {mqttInfo.clientExists ? 'Yes' : 'No'}</p>
                            <p><strong>Client Connected:</strong> {mqttInfo.clientConnected ? 'Yes' : 'No'}</p>
                            <p><strong>Connection Attempts:</strong> {mqttInfo.connectionAttempts}/{mqttInfo.maxRetries}</p>
                        </div>
                        <div className="troubleshooting-tips">
                            <h5>💡 Troubleshooting Tips:</h5>
                            <ul>
                                <li>Pastikan Docker Mosquitto broker berjalan</li>
                                <li>Periksa port 9001 tidak diblokir firewall</li>
                                <li>Coba restart Docker container</li>
                                <li>Periksa WebSocket listener aktif</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Data Persistence Info */}
                <div className="data-persistence-info">
                    <div className="persistence-indicator">
                        <span className="persistence-icon">💾</span>
                        <span className="persistence-text">Data tersimpan secara otomatis</span>
                    </div>
                    <div className="persistence-details">
                        <p>✅ Data MQTT akan tetap tersimpan meskipun keluar/masuk dashboard</p>
                        <p>🔄 Gunakan tombol 🔄 untuk reset data jika diperlukan</p>
                    </div>
                </div>

                {/* Dashboard Content Container */}
                <div className="dashboard-content">
                    {/* Key Metrics Cards */}
                    <div className="metrics-grid">
                        <div className="metric-card work-time">
                            <div className="metric-icon">⏰</div>
                            <div className="metric-content">
                                <h3>{formatTime(dashboardData.workTime)}</h3>
                                <p>Work Time</p>
                                <div className="metric-trend positive">
                                    {useMemo(() => {
                                        return '+1 menit';
                                    }, [])}
                                </div>
                            </div>
                        </div>

                        <div className="metric-card loss-time">
                            <div className="metric-icon">⏸️</div>
                            <div className="metric-content">
                                <h3>{formatTime(dashboardData.lossTime)}</h3>
                                <p>Loss Time</p>
                                <div className="metric-trend negative">
                                    {useMemo(() => {
                                        return '+0 menit';
                                    }, [])}
                                </div>
                            </div>
                        </div>

                        <div className="metric-card target-production">
                            <div className="metric-icon">🎯</div>
                            <div className="metric-content">
                                <h3>{dashboardData.targetProduction}</h3>
                                <p>Target Production</p>
                                <div className="metric-trend neutral">
                                    {useMemo(() => {
                                        return 'Target';
                                    }, [])}
                                </div>
                            </div>
                        </div>

                        <div className="metric-card actual-production">
                            <div className="metric-icon">📦</div>
                            <div className="metric-content">
                                <h3>{dashboardData.actualProduction}</h3>
                                <p>Actual Production</p>
                                <div className="metric-trend positive">
                                    {useMemo(() => {
                                        return `+${dashboardData.actualProduction - (dashboardData.actualProduction - 1)}`;
                                    }, [dashboardData.actualProduction])}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time and Status Section */}
                    <div className="time-status-section">
                        <div className="time-info">
                            <div className="time-item">
                                <span className="time-label">Waktu Mulai:</span>
                                <span className="time-value">{dashboardData.startTime}</span>
                            </div>
                            <div className="time-item">
                                <span className="time-label">Waktu Selesai:</span>
                                <span className="time-value">{dashboardData.endTime}</span>
                            </div>
                        </div>
                        <div className="status-info">
                            <div className="status-item">
                                <span className="status-label">Status:</span>
                                <span className={`status-badge ${getStatusColor(dashboardData.status)}`}>
                                    {dashboardData.status}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Efficiency:</span>
                                <span className={`efficiency-badge ${getEfficiencyColor(dashboardData.efficiency)}`}>
                                    {dashboardData.efficiency}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="charts-section">
                        {/* Work Time vs Loss Time Chart */}
                        <div className="chart-container">
                            <div className="chart-header">
                                <h3>Work Time vs Loss Time</h3>
                                <div className="chart-legend">
                                    <span className="legend-item">
                                        <span className="legend-color work-time-color"></span>
                                        Work Time
                                    </span>
                                    <span className="legend-item">
                                        <span className="legend-color loss-time-color"></span>
                                        Loss Time
                                    </span>
                                </div>
                            </div>
                            <div className="chart-content">
                                <div className="mixed-chart">
                                    <div className="donut-chart">
                                        <div className="donut-inner">
                                            <span className="donut-percentage">
                                                {useMemo(() => {
                                                    const workMinutes = dashboardData.workTime.hours * 60 + dashboardData.workTime.minutes;
                                                    const lossMinutes = dashboardData.lossTime.hours * 60 + dashboardData.lossTime.minutes;
                                                    const totalMinutes = workMinutes + lossMinutes;
                                                    return totalMinutes > 0 ? Math.round((workMinutes / totalMinutes) * 100) : 0;
                                                }, [dashboardData.workTime.hours, dashboardData.workTime.minutes, dashboardData.lossTime.hours, dashboardData.lossTime.minutes])}%
                                            </span>
                                            <span className="donut-label">Work Time</span>
                                        </div>
                                    </div>
                                    <div className="bar-charts">
                                        <div className="bar-chart">
                                            <div className="bar-label">Work Time</div>
                                            <div className="bar-container">
                                                <div
                                                    className="bar work-time-bar"
                                                    style={{ height: `${Math.min(100, (dashboardData.workTime.hours * 60 + dashboardData.workTime.minutes) / 8 * 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="bar-value">{dashboardData.workTime.hours}h {dashboardData.workTime.minutes}m</div>
                                        </div>
                                        <div className="bar-chart">
                                            <div className="bar-label">Loss Time</div>
                                            <div className="bar-container">
                                                <div
                                                    className="bar loss-time-bar"
                                                    style={{ height: `${Math.min(100, (dashboardData.lossTime.hours * 60 + dashboardData.lossTime.minutes) / 2 * 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="bar-value">{dashboardData.lossTime.hours}h {dashboardData.lossTime.minutes}m</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Efficiency Trend Chart */}
                        <div className="chart-container">
                            <div className="chart-header">
                                <h3>Efficiency Trend</h3>
                            </div>
                            <div className="chart-content">
                                <div className="line-chart">
                                    <div className="chart-y-axis">
                                    </div>
                                    <div className="chart-area">
                                        <svg className="line-chart-svg" viewBox="0 0 400 200" preserveAspectRatio="none">
                                            {chartData.efficiencyHistory.length > 1 && (
                                                <>
                                                    {/* Grid lines */}
                                                    <defs>
                                                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                                                        </pattern>
                                                    </defs>
                                                    <rect width="400" height="200" fill="url(#grid)" />

                                                    {/* Line chart */}
                                                    <polyline
                                                        className="line-chart-path"
                                                        points={chartData.efficiencyHistory.map((point, index) =>
                                                            `${(index / (chartData.efficiencyHistory.length - 1)) * 400},${200 - (point.value / 100) * 200}`
                                                        ).join(' ')}
                                                        fill="none"
                                                        stroke="var(--primary-color)"
                                                        strokeWidth="3"
                                                        vectorEffect="non-scaling-stroke"
                                                    />

                                                    {/* Data points */}
                                                    {chartData.efficiencyHistory.map((point, index) => (
                                                        <g key={`point-${index}-${point.time}`}>
                                                            <circle
                                                                cx={(index / (chartData.efficiencyHistory.length - 1)) * 400}
                                                                cy={200 - (point.value / 100) * 200}
                                                                r="4"
                                                                fill="white"
                                                                stroke="var(--primary-color)"
                                                                strokeWidth="2"
                                                                vectorEffect="non-scaling-stroke"
                                                            />
                                                            <text
                                                                x={(index / (chartData.efficiencyHistory.length - 1)) * 400}
                                                                y={200 - (point.value / 100) * 200 - 10}
                                                                textAnchor="middle"
                                                                fontSize="10"
                                                                fill="var(--text-primary)"
                                                                fontWeight="600"
                                                            >
                                                                {point.value.toFixed(1)}%
                                                            </text>
                                                        </g>
                                                    ))}

                                                    {/* Area fill */}
                                                    <polyline
                                                        points={`0,200 ${chartData.efficiencyHistory.map((point, index) =>
                                                            `${(index / (chartData.efficiencyHistory.length - 1)) * 400},${200 - (point.value / 100) * 200}`
                                                        ).join(' ')} 400,200`}
                                                        fill="url(#gradient)"
                                                        opacity="0.2"
                                                    />

                                                    <defs>
                                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                            <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.3" />
                                                            <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.1" />
                                                        </linearGradient>
                                                    </defs>
                                                </>
                                            )}
                                        </svg>
                                    </div>
                                    <div className="chart-x-axis">
                                        {chartData.efficiencyHistory.map((point, index) => (
                                            <span key={index} className="x-axis-label">
                                                {point.time}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Karyawan Chart */}
                        <div className="chart-container">
                            <div className="chart-header">
                                <h3>Data Karyawan</h3>
                            </div>
                            <div className="chart-content">
                                <div className="employee-info">
                                    <div className="employee-detail">
                                        <div className="detail-item">
                                            <span className="detail-label">Nama:</span>
                                            <span className="detail-value">{employee.employeeName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">NIK:</span>
                                            <span className="detail-value">{employee.nik || '123456789854'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Bagian:</span>
                                            <span className="detail-value">{employee.department || 'Produksi'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">LINE:</span>
                                            <span className="detail-value">{employee.line || 'Montbell'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">MESIN:</span>
                                            <span className="detail-value">{employee.machine || 'Sewing'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Updates Indicator */}
                <div className="realtime-indicator">
                    <span className="pulse-dot"></span>
                    <span>Data realtime update setiap 1 menit</span>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard; 