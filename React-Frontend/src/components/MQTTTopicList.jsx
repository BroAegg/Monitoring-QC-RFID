/**
 * Komponen MQTTTopicList - Menampilkan daftar topic MQTT untuk testing
 * Dilengkapi dengan search functionality dan copy command
 */

import { useState, useMemo } from 'react';
import './MQTTTopicList.css';

const MQTTTopicList = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('all');

    // Data karyawan dari productivity table
    const employees = [
        { name: 'Rusdi', department: 'Produksi', nik: '123456789854', line: 'Montbell', machine: 'Sewing' },
        { name: 'Ahmad Ridwan', department: 'Cutting', nik: '123456789855', line: 'Adidas', machine: 'Cutting Machine' },
        { name: 'Lilis Suryani', department: 'Sewing', nik: '123456789856', line: 'Nike', machine: 'Sewing Machine' },
        { name: 'Wahyu Setiawan', department: 'Finishing', nik: '123456789857', line: 'Puma', machine: 'Finishing Machine' },
        { name: 'Siti Nurhaliza', department: 'Quality Control', nik: '123456789858', line: 'Under Armour', machine: 'QC Station' }
    ];

    // Generate topics untuk setiap karyawan
    const generateEmployeeTopics = (employeeName) => {
        const normalizedName = employeeName.toLowerCase().replace(/\s+/g, '_');
        return {
            workTime: `work_time_${normalizedName}`,
            lossTime: `loss_time_${normalizedName}`,
            targetProduction: `target_production_${normalizedName}`,
            actualProduction: `actual_production_${normalizedName}`,
            checkIn: `check_in_${normalizedName}`,
            checkOut: `check_out_${normalizedName}`
        };
    };

    // Filter employees berdasarkan search dan selection
    const filteredEmployees = useMemo(() => {
        let filtered = employees;

        if (selectedEmployee !== 'all') {
            filtered = filtered.filter(emp => emp.name === selectedEmployee);
        }

        if (searchTerm) {
            filtered = filtered.filter(emp =>
                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.line.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [searchTerm, selectedEmployee]);

    // Copy command ke clipboard
    const copyToClipboard = (command) => {
        navigator.clipboard.writeText(command).then(() => {
            // Optional: Show success message
            console.log('Command copied to clipboard');
        });
    };

    // Generate Docker command untuk testing
    const generateDockerCommand = (topic, value) => {
        return `docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "${topic}" -m "${value}"`;
    };

    if (!isOpen) return null;

    return (
        <div className="mqtt-topic-overlay" onClick={onClose}>
            <div className="mqtt-topic-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📡 MQTT Topics List</h2>
                    <p>Daftar topic MQTT untuk testing real-time data</p>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Search dan Filter */}
                    <div className="search-filter-section">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Cari karyawan, departemen, atau line..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                        <div className="filter-controls">
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">Semua Karyawan</option>
                                {employees.map(emp => (
                                    <option key={emp.name} value={emp.name}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Topics List */}
                    <div className="topics-container">
                        {filteredEmployees.map(employee => {
                            const topics = generateEmployeeTopics(employee.name);

                            return (
                                <div key={employee.name} className="employee-topics-card">
                                    <div className="employee-header">
                                        <div className="employee-info">
                                            <h3>{employee.name}</h3>
                                            <div className="employee-details">
                                                <span className="detail-item">
                                                    <strong>NIK:</strong> {employee.nik}
                                                </span>
                                                <span className="detail-item">
                                                    <strong>Dept:</strong> {employee.department}
                                                </span>
                                                <span className="detail-item">
                                                    <strong>Line:</strong> {employee.line}
                                                </span>
                                                <span className="detail-item">
                                                    <strong>Machine:</strong> {employee.machine}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="topics-grid">
                                        {/* Work Time Topic */}
                                        <div className="topic-item work-time">
                                            <div className="topic-header">
                                                <span className="topic-icon">⏰</span>
                                                <span className="topic-name">Work Time</span>
                                                <span className="topic-type">Add Seconds</span>
                                            </div>
                                            <div className="topic-content">
                                                <div className="topic-name-display">
                                                    <code>{topics.workTime}</code>
                                                </div>
                                                <div className="topic-actions">
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.workTime, '10'))}
                                                        title="Copy Docker Command"
                                                    >
                                                        📋 Copy
                                                    </button>
                                                    <button
                                                        className="test-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.workTime, '10'))}
                                                        title="Test dengan 10 detik"
                                                    >
                                                        🧪 Test 10s
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Loss Time Topic */}
                                        <div className="topic-item loss-time">
                                            <div className="topic-header">
                                                <span className="topic-icon">⏸️</span>
                                                <span className="topic-name">Loss Time</span>
                                                <span className="topic-type">Add Seconds</span>
                                            </div>
                                            <div className="topic-content">
                                                <div className="topic-name-display">
                                                    <code>{topics.lossTime}</code>
                                                </div>
                                                <div className="topic-actions">
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.lossTime, '5'))}
                                                        title="Copy Docker Command"
                                                    >
                                                        📋 Copy
                                                    </button>
                                                    <button
                                                        className="test-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.lossTime, '5'))}
                                                        title="Test dengan 5 detik"
                                                    >
                                                        🧪 Test 5s
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Target Production Topic */}
                                        <div className="topic-item target-production">
                                            <div className="topic-header">
                                                <span className="topic-icon">🎯</span>
                                                <span className="topic-name">Target Production</span>
                                                <span className="topic-type">Set Value</span>
                                            </div>
                                            <div className="topic-content">
                                                <div className="topic-name-display">
                                                    <code>{topics.targetProduction}</code>
                                                </div>
                                                <div className="topic-actions">
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.targetProduction, '100'))}
                                                        title="Copy Docker Command"
                                                    >
                                                        📋 Copy
                                                    </button>
                                                    <button
                                                        className="test-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.targetProduction, '100'))}
                                                        title="Test dengan target 100"
                                                    >
                                                        🧪 Test 100
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actual Production Topic */}
                                        <div className="topic-item actual-production">
                                            <div className="topic-header">
                                                <span className="topic-icon">📦</span>
                                                <span className="topic-name">Actual Production</span>
                                                <span className="topic-type">Set Value</span>
                                            </div>
                                            <div className="topic-content">
                                                <div className="topic-name-display">
                                                    <code>{topics.actualProduction}</code>
                                                </div>
                                                <div className="topic-actions">
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.actualProduction, '85'))}
                                                        title="Copy Docker Command"
                                                    >
                                                        📋 Copy
                                                    </button>
                                                    <button
                                                        className="test-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.actualProduction, '85'))}
                                                        title="Test dengan actual 85"
                                                    >
                                                        🧪 Test 85
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Check In Topic */}
                                        <div className="topic-item check-in">
                                            <div className="topic-header">
                                                <span className="topic-icon">🟢</span>
                                                <span className="topic-name">Check In</span>
                                                <span className="topic-type">Set Start Time</span>
                                            </div>
                                            <div className="topic-content">
                                                <div className="topic-name-display">
                                                    <code>{topics.checkIn}</code>
                                                </div>
                                                <div className="topic-actions">
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.checkIn, '1'))}
                                                        title="Copy Docker Command"
                                                    >
                                                        📋 Copy
                                                    </button>
                                                    <button
                                                        className="test-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.checkIn, '1'))}
                                                        title="Set waktu mulai sekarang"
                                                    >
                                                        🧪 Check In
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Check Out Topic */}
                                        <div className="topic-item check-out">
                                            <div className="topic-header">
                                                <span className="topic-icon">🔴</span>
                                                <span className="topic-name">Check Out</span>
                                                <span className="topic-type">Set End Time</span>
                                            </div>
                                            <div className="topic-content">
                                                <div className="topic-name-display">
                                                    <code>{topics.checkOut}</code>
                                                </div>
                                                <div className="topic-actions">
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.checkOut, '1'))}
                                                        title="Copy Docker Command"
                                                    >
                                                        📋 Copy
                                                    </button>
                                                    <button
                                                        className="test-btn"
                                                        onClick={() => copyToClipboard(generateDockerCommand(topics.checkOut, '1'))}
                                                        title="Set waktu selesai sekarang"
                                                    >
                                                        🧪 Check Out
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Test Section */}
                    <div className="quick-test-section">
                        <h3>🚀 Quick Test Commands</h3>
                        <div className="quick-test-grid">
                            <div className="quick-test-item">
                                <h4>Test Semua Karyawan</h4>
                                <button
                                    className="quick-test-btn"
                                    onClick={() => {
                                        const commands = employees.map(emp => {
                                            const topics = generateEmployeeTopics(emp.name);
                                            return [
                                                generateDockerCommand(topics.workTime, '10'),
                                                generateDockerCommand(topics.lossTime, '5'),
                                                generateDockerCommand(topics.targetProduction, '100'),
                                                generateDockerCommand(topics.actualProduction, '85'),
                                                generateDockerCommand(topics.checkIn, '1'),
                                                generateDockerCommand(topics.checkOut, '1')
                                            ].join('\n');
                                        }).join('\n\n');
                                        copyToClipboard(commands);
                                    }}
                                >
                                    📋 Copy All Commands
                                </button>
                            </div>
                            <div className="quick-test-item">
                                <h4>Test Rusdi Only</h4>
                                <button
                                    className="quick-test-btn"
                                    onClick={() => {
                                        const topics = generateEmployeeTopics('Rusdi');
                                        const commands = [
                                            generateDockerCommand(topics.workTime, '10'),
                                            generateDockerCommand(topics.lossTime, '5'),
                                            generateDockerCommand(topics.targetProduction, '100'),
                                            generateDockerCommand(topics.actualProduction, '85'),
                                            generateDockerCommand(topics.checkIn, '1'),
                                            generateDockerCommand(topics.checkOut, '1')
                                        ].join('\n');
                                        copyToClipboard(commands);
                                    }}
                                >
                                    📋 Copy Rusdi Commands
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="footer-info">
                        <p>💡 <strong>Tips:</strong> Copy command dan paste di terminal untuk test MQTT</p>
                        <p>🔗 Pastikan Docker Mosquitto broker berjalan sebelum testing</p>
                    </div>
                    <button className="btn-secondary" onClick={onClose}>
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MQTTTopicList; 