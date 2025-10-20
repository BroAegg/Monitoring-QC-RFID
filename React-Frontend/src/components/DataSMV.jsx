/**
 * Komponen DataSMV - Professional Standard Minute Value Management
 * Design dengan color palette: biru tua, biru muda, cyan, kuning, dan gold
 */

import { useState, useEffect } from 'react';
import './DataSMV.css';

const DataSMV = () => {
    const [smvData, setSmvData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('all');
    const [selectedOperation, setSelectedOperation] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSMV, setEditingSMV] = useState(null);

    const [formData, setFormData] = useState({
        styleCode: '',
        styleName: '',
        operation: '',
        smvValue: '',
        target: '',
        efficiency: '',
        status: 'active'
    });

    const styleOptions = [
        'ST001', 'ST002', 'ST003', 'ST004', 'ST005'
    ];

    const operationOptions = [
        'Cutting', 'Sewing', 'Finishing', 'Quality Check', 'Packaging'
    ];

    const statusOptions = [
        { value: 'active', label: 'Active', color: 'success' },
        { value: 'inactive', label: 'Inactive', color: 'danger' },
        { value: 'pending', label: 'Pending', color: 'warning' }
    ];

    // Mock data untuk demo
    useEffect(() => {
        const mockSMVData = [
            {
                id: 1,
                styleCode: 'ST001',
                styleName: 'Polo Shirt Basic',
                operation: 'Sewing',
                smvValue: 12.5,
                target: 15.0,
                efficiency: 83.3,
                status: 'active',
                lastUpdated: '2024-01-15',
                operator: 'Ahmad Ridwan'
            },
            {
                id: 2,
                styleCode: 'ST002',
                styleName: 'T-Shirt Premium',
                operation: 'Cutting',
                smvValue: 8.2,
                target: 10.0,
                efficiency: 82.0,
                status: 'active',
                lastUpdated: '2024-01-14',
                operator: 'Lilis Suryani'
            },
            {
                id: 3,
                styleCode: 'ST003',
                styleName: 'Jeans Classic',
                operation: 'Finishing',
                smvValue: 18.7,
                target: 20.0,
                efficiency: 93.5,
                status: 'active',
                lastUpdated: '2024-01-13',
                operator: 'Wahyu Setiawan'
            }
        ];
        setSmvData(mockSMVData);
        setFilteredData(mockSMVData);
    }, []);

    // Filter data
    useEffect(() => {
        let filtered = smvData;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.styleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.styleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.operation.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedStyle !== 'all') {
            filtered = filtered.filter(item => item.styleCode === selectedStyle);
        }

        if (selectedOperation !== 'all') {
            filtered = filtered.filter(item => item.operation === selectedOperation);
        }

        setFilteredData(filtered);
    }, [smvData, searchTerm, selectedStyle, selectedOperation]);

    const handleAddSMV = () => {
        if (!formData.styleCode || !formData.styleName || !formData.smvValue) {
            alert('Style Code, Style Name, dan SMV Value wajib diisi!');
            return;
        }

        const newSMV = {
            id: Date.now(),
            ...formData,
            smvValue: parseFloat(formData.smvValue),
            target: parseFloat(formData.target) || 0,
            efficiency: parseFloat(formData.efficiency) || 0,
            lastUpdated: new Date().toISOString().split('T')[0],
            operator: 'Current User'
        };

        setSmvData([...smvData, newSMV]);
        setFormData({
            styleCode: '',
            styleName: '',
            operation: '',
            smvValue: '',
            target: '',
            efficiency: '',
            status: 'active'
        });
        setShowAddModal(false);
    };

    const handleEditSMV = (smv) => {
        setEditingSMV(smv);
        setFormData({
            styleCode: smv.styleCode,
            styleName: smv.styleName,
            operation: smv.operation,
            smvValue: smv.smvValue.toString(),
            target: smv.target.toString(),
            efficiency: smv.efficiency.toString(),
            status: smv.status
        });
        setShowAddModal(true);
    };

    const handleUpdateSMV = () => {
        const updatedSMVData = smvData.map(item =>
            item.id === editingSMV.id ? {
                ...item,
                ...formData,
                smvValue: parseFloat(formData.smvValue),
                target: parseFloat(formData.target),
                efficiency: parseFloat(formData.efficiency),
                lastUpdated: new Date().toISOString().split('T')[0]
            } : item
        );
        setSmvData(updatedSMVData);
        setEditingSMV(null);
        setFormData({
            styleCode: '',
            styleName: '',
            operation: '',
            smvValue: '',
            target: '',
            efficiency: '',
            status: 'active'
        });
        setShowAddModal(false);
    };

    const handleDeleteSMV = (id) => {
        if (window.confirm('Yakin ingin menghapus data SMV ini?')) {
            setSmvData(smvData.filter(item => item.id !== id));
        }
    };

    const getStatusColor = (status) => {
        const statusObj = statusOptions.find(s => s.value === status);
        return statusObj ? statusObj.color : 'secondary';
    };

    const getEfficiencyColor = (efficiency) => {
        if (efficiency >= 90) return 'success';
        if (efficiency >= 80) return 'warning';
        return 'danger';
    };

    return (
        <div className="data-smv-container">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>⚡ Data SMV</h1>
                    <p>Standard Minute Value Management System</p>
                </div>
                <button
                    className="add-btn"
                    onClick={() => setShowAddModal(true)}
                >
                    <span>➕</span>
                    Tambah SMV
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>{smvData.length}</h3>
                        <p>Total SMV Data</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{smvData.filter(item => item.status === 'active').length}</h3>
                        <p>Active SMV</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <h3>{(smvData.reduce((acc, item) => acc + item.efficiency, 0) / smvData.length).toFixed(1)}%</h3>
                        <p>Avg Efficiency</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <h3>{styleOptions.length}</h3>
                        <p>Style Types</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Cari SMV data..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <div className="filter-controls">
                    <select
                        value={selectedStyle}
                        onChange={(e) => setSelectedStyle(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Semua Style</option>
                        {styleOptions.map(style => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                    <select
                        value={selectedOperation}
                        onChange={(e) => setSelectedOperation(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Semua Operasi</option>
                        {operationOptions.map(op => (
                            <option key={op} value={op}>{op}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* SMV Table */}
            <div className="table-container">
                <table className="smv-table">
                    <thead>
                        <tr>
                            <th>Style Code</th>
                            <th>Style Name</th>
                            <th>Operation</th>
                            <th>SMV Value</th>
                            <th>Target</th>
                            <th>Efficiency</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Operator</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(item => (
                            <tr key={item.id} className="smv-row">
                                <td>
                                    <span className="style-code">{item.styleCode}</span>
                                </td>
                                <td>
                                    <div className="style-info">
                                        <span className="style-name">{item.styleName}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="operation-badge">{item.operation}</span>
                                </td>
                                <td>
                                    <span className="smv-value">{item.smvValue}</span>
                                </td>
                                <td>
                                    <span className="target-value">{item.target}</span>
                                </td>
                                <td>
                                    <span className={`efficiency-badge ${getEfficiencyColor(item.efficiency)}`}>
                                        {item.efficiency}%
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${getStatusColor(item.status)}`}>
                                        {statusOptions.find(s => s.value === item.status)?.label}
                                    </span>
                                </td>
                                <td>{item.lastUpdated}</td>
                                <td>
                                    <span className="operator-name">{item.operator}</span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn edit"
                                            onClick={() => handleEditSMV(item)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDeleteSMV(item.id)}
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
                            <h2>{editingSMV ? 'Edit SMV Data' : 'Tambah SMV Data'}</h2>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingSMV(null);
                                    setFormData({
                                        styleCode: '',
                                        styleName: '',
                                        operation: '',
                                        smvValue: '',
                                        target: '',
                                        efficiency: '',
                                        status: 'active'
                                    });
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Style Code</label>
                                    <select
                                        value={formData.styleCode}
                                        onChange={(e) => setFormData({ ...formData, styleCode: e.target.value })}
                                    >
                                        <option value="">Pilih Style Code</option>
                                        {styleOptions.map(style => (
                                            <option key={style} value={style}>{style}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Style Name</label>
                                    <input
                                        type="text"
                                        value={formData.styleName}
                                        onChange={(e) => setFormData({ ...formData, styleName: e.target.value })}
                                        placeholder="Masukkan nama style"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Operation</label>
                                    <select
                                        value={formData.operation}
                                        onChange={(e) => setFormData({ ...formData, operation: e.target.value })}
                                    >
                                        <option value="">Pilih Operation</option>
                                        {operationOptions.map(op => (
                                            <option key={op} value={op}>{op}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>SMV Value</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.smvValue}
                                        onChange={(e) => setFormData({ ...formData, smvValue: e.target.value })}
                                        placeholder="Masukkan SMV value"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Target</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.target}
                                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                        placeholder="Masukkan target"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Efficiency (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.efficiency}
                                    onChange={(e) => setFormData({ ...formData, efficiency: e.target.value })}
                                    placeholder="Masukkan efficiency"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingSMV(null);
                                }}
                            >
                                Batal
                            </button>
                            <button
                                className="btn-primary"
                                onClick={editingSMV ? handleUpdateSMV : handleAddSMV}
                            >
                                {editingSMV ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataSMV; 