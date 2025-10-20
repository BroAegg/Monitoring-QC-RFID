/**
 * Komponen Productivity - Professional Productivity Analysis
 * Design dengan color palette: biru tua, biru muda, cyan, kuning, dan gold
 */

import { useState, useEffect } from 'react';
import './Productivity.css';
import EmployeeDashboard from './EmployeeDashboard';
import MQTTTopicList from './MQTTTopicList';
import mqttService from '../services/mqttService';

const Productivity = () => {
    const [productivityData, setProductivityData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProductivity, setEditingProductivity] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showMQTTTopics, setShowMQTTTopics] = useState(false);

    const [formData, setFormData] = useState({
        employeeName: '',
        department: '',
        target: '',
        actual: '',
        efficiency: '',
        date: '',
        notes: ''
    });

    const departments = [
        'Cutting', 'Sewing', 'Finishing', 'Quality Control', 'Packaging'
    ];

    const periodOptions = [
        { value: 'today', label: 'Hari Ini' },
        { value: 'week', label: 'Minggu Ini' },
        { value: 'month', label: 'Bulan Ini' },
        { value: 'quarter', label: 'Kuartal Ini' }
    ];

    // Mock data untuk demo
    useEffect(() => {
        const mockProductivityData = [
            {
                id: 1,
                employeeName: 'Rusdi',
                department: 'Produksi',
                target: 100,
                actual: 95,
                efficiency: 95.0,
                date: '2024-01-15',
                notes: 'Performansi sangat baik',
                status: 'excellent',
                nik: '123456789854',
                line: 'Montbell',
                machine: 'Sewing'
            },
            {
                id: 2,
                employeeName: 'Ahmad Ridwan',
                department: 'Cutting',
                target: 80,
                actual: 78,
                efficiency: 97.5,
                date: '2024-01-15',
                notes: 'Target tercapai dengan baik',
                status: 'good',
                nik: '123456789855',
                line: 'Adidas',
                machine: 'Cutting Machine'
            },
            {
                id: 3,
                employeeName: 'Lilis Suryani',
                department: 'Sewing',
                target: 120,
                actual: 110,
                efficiency: 91.7,
                date: '2024-01-15',
                notes: 'Perlu peningkatan',
                status: 'average',
                nik: '123456789856',
                line: 'Nike',
                machine: 'Sewing Machine'
            },
            {
                id: 4,
                employeeName: 'Wahyu Setiawan',
                department: 'Finishing',
                target: 90,
                actual: 85,
                efficiency: 94.4,
                date: '2024-01-15',
                notes: 'Konsisten dalam bekerja',
                status: 'good',
                nik: '123456789857',
                line: 'Puma',
                machine: 'Finishing Machine'
            },
            {
                id: 5,
                employeeName: 'Siti Nurhaliza',
                department: 'Quality Control',
                target: 150,
                actual: 145,
                efficiency: 96.7,
                date: '2024-01-15',
                notes: 'Kualitas sangat baik',
                status: 'excellent',
                nik: '123456789858',
                line: 'Under Armour',
                machine: 'QC Station'
            }
        ];
        setProductivityData(mockProductivityData);
        setFilteredData(mockProductivityData);
    }, []);

    // Filter data
    useEffect(() => {
        let filtered = productivityData;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.department.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(item => item.department === selectedDepartment);
        }

        setFilteredData(filtered);
    }, [productivityData, searchTerm, selectedDepartment]);

    const handleAddProductivity = () => {
        if (!formData.employeeName || !formData.target || !formData.actual) {
            alert('Nama karyawan, target, dan actual wajib diisi!');
            return;
        }

        const efficiency = ((parseFloat(formData.actual) / parseFloat(formData.target)) * 100).toFixed(1);
        let status = 'average';
        if (efficiency >= 95) status = 'excellent';
        else if (efficiency >= 85) status = 'good';
        else if (efficiency < 75) status = 'poor';

        const newProductivity = {
            id: Date.now(),
            ...formData,
            target: parseFloat(formData.target),
            actual: parseFloat(formData.actual),
            efficiency: parseFloat(efficiency),
            date: formData.date || new Date().toISOString().split('T')[0],
            status: status
        };

        setProductivityData([...productivityData, newProductivity]);

        // Sinkronkan data dengan MQTT service
        mqttService.updateEmployeeData(formData.employeeName, 'targetProduction', parseFloat(formData.target));
        mqttService.updateEmployeeData(formData.employeeName, 'actualProduction', parseFloat(formData.actual));

        setFormData({
            employeeName: '',
            department: '',
            target: '',
            actual: '',
            efficiency: '',
            date: '',
            notes: ''
        });
        setShowAddModal(false);
    };

    const handleEditProductivity = (productivity) => {
        setEditingProductivity(productivity);
        setFormData({
            employeeName: productivity.employeeName,
            department: productivity.department,
            target: productivity.target.toString(),
            actual: productivity.actual.toString(),
            efficiency: productivity.efficiency.toString(),
            date: productivity.date,
            notes: productivity.notes
        });
        setShowAddModal(true);
    };

    const handleUpdateProductivity = () => {
        const efficiency = ((parseFloat(formData.actual) / parseFloat(formData.target)) * 100).toFixed(1);
        let status = 'average';
        if (efficiency >= 95) status = 'excellent';
        else if (efficiency >= 85) status = 'good';
        else if (efficiency < 75) status = 'poor';

        const updatedProductivityData = productivityData.map(item =>
            item.id === editingProductivity.id ? {
                ...item,
                ...formData,
                target: parseFloat(formData.target),
                actual: parseFloat(formData.actual),
                efficiency: parseFloat(efficiency),
                status: status
            } : item
        );

        // Sinkronkan data dengan MQTT service
        const updatedItem = updatedProductivityData.find(item => item.id === editingProductivity.id);
        if (updatedItem) {
            mqttService.updateEmployeeData(formData.employeeName, 'targetProduction', parseFloat(formData.target));
            mqttService.updateEmployeeData(formData.employeeName, 'actualProduction', parseFloat(formData.actual));
        }

        setProductivityData(updatedProductivityData);
        setEditingProductivity(null);
        setFormData({
            employeeName: '',
            department: '',
            target: '',
            actual: '',
            efficiency: '',
            date: '',
            notes: ''
        });
        setShowAddModal(false);
    };

    const handleDeleteProductivity = (id) => {
        if (window.confirm('Yakin ingin menghapus data produktivitas ini?')) {
            setProductivityData(productivityData.filter(item => item.id !== id));
        }
    };

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'excellent': return 'success';
            case 'good': return 'primary';
            case 'average': return 'warning';
            case 'poor': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'excellent': return '🏆';
            case 'good': return '✅';
            case 'average': return '⚠️';
            case 'poor': return '❌';
            default: return '📊';
        }
    };

    const calculateAverageEfficiency = () => {
        if (productivityData.length === 0) return 0;
        const total = productivityData.reduce((acc, item) => acc + item.efficiency, 0);
        return (total / productivityData.length).toFixed(1);
    };

    return (
        <div className="productivity-container">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>📊 Productivity Analysis</h1>
                    <p>Analisis produktivitas karyawan dan performansi kerja</p>
                </div>
                <div className="header-actions">
                    <button
                        className="mqtt-btn"
                        onClick={() => setShowMQTTTopics(true)}
                        title="MQTT Topics List"
                    >
                        <span>📡</span>
                        MQTT Topics
                    </button>
                    <button
                        className="add-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        <span>➕</span>
                        Tambah Data
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{productivityData.length}</h3>
                        <p>Total Records</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <h3>{calculateAverageEfficiency()}%</h3>
                        <p>Avg Efficiency</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                        <h3>{productivityData.filter(item => item.status === 'excellent').length}</h3>
                        <p>Excellent Performance</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>{departments.length}</h3>
                        <p>Departments</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Cari karyawan atau departemen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <div className="filter-controls">
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Semua Departemen</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="filter-select"
                    >
                        {periodOptions.map(period => (
                            <option key={period.value} value={period.value}>
                                {period.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Productivity Table */}
            <div className="table-container">
                <table className="productivity-table">
                    <thead>
                        <tr>
                            <th>Karyawan</th>
                            <th>Departemen</th>
                            <th>Target</th>
                            <th>Actual</th>
                            <th>Efficiency</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                            <th>Notes</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(item => (
                            <tr key={item.id} className="productivity-row" onClick={() => handleEmployeeClick(item)}>
                                <td>
                                    <div className="employee-info">
                                        <div className="employee-avatar">
                                            {item.employeeName.charAt(0)}
                                        </div>
                                        <div className="employee-details">
                                            <span className="employee-name">{item.employeeName}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="department-badge">{item.department}</span>
                                </td>
                                <td>
                                    <span className="target-value">{item.target}</span>
                                </td>
                                <td>
                                    <span className="actual-value">{item.actual}</span>
                                </td>
                                <td>
                                    <span className={`efficiency-badge ${getStatusColor(item.status)}`}>
                                        {item.efficiency}%
                                    </span>
                                </td>
                                <td>
                                    <div className="status-indicator">
                                        <span className="status-icon">{getStatusIcon(item.status)}</span>
                                        <span className={`status-badge ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </td>
                                <td>{item.date}</td>
                                <td>
                                    <span className="notes-text">{item.notes}</span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn edit"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditProductivity(item);
                                            }}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteProductivity(item.id);
                                            }}
                                            title="Hapus"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingProductivity ? 'Edit Data Produktivitas' : 'Tambah Data Produktivitas'}</h2>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingProductivity(null);
                                    setFormData({
                                        employeeName: '',
                                        department: '',
                                        target: '',
                                        actual: '',
                                        efficiency: '',
                                        date: '',
                                        notes: ''
                                    });
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nama Karyawan</label>
                                    <input
                                        type="text"
                                        value={formData.employeeName}
                                        onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                                        placeholder="Masukkan nama karyawan"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Departemen</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="">Pilih Departemen</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Target</label>
                                    <input
                                        type="number"
                                        value={formData.target}
                                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                        placeholder="Masukkan target"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Actual</label>
                                    <input
                                        type="number"
                                        value={formData.actual}
                                        onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                                        placeholder="Masukkan actual"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tanggal</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Notes</label>
                                    <input
                                        type="text"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Tambahkan catatan"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingProductivity(null);
                                }}
                            >
                                Batal
                            </button>
                            <button
                                className="btn-primary"
                                onClick={editingProductivity ? handleUpdateProductivity : handleAddProductivity}
                            >
                                {editingProductivity ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Dashboard Modal */}
            {selectedEmployee && (
                <EmployeeDashboard
                    employee={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                />
            )}

            {/* MQTT Topics List Modal */}
            {showMQTTTopics && (
                <MQTTTopicList
                    isOpen={showMQTTTopics}
                    onClose={() => setShowMQTTTopics(false)}
                />
            )}
        </div>
    );
};

export default Productivity; 