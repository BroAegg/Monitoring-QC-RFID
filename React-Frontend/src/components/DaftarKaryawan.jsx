/**
 * Komponen DaftarKaryawan - Professional Employee Management
 * Design dengan color palette: biru tua, biru muda, cyan, kuning, dan gold
 */

import { useState, useEffect } from 'react';
import './DaftarKaryawan.css';

const DaftarKaryawan = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const [formData, setFormData] = useState({
        nama: '',
        nik: '',
        bagian: '',
        line: '',
        posisi: '',
        status: 'aktif'
    });

    const departments = [
        'Cutting', 'Sewing', 'Finishing', 'Quality Control', 'Packaging', 'Maintenance'
    ];

    const statusOptions = [
        { value: 'aktif', label: 'AKTIF', color: 'success' },
        { value: 'cuti', label: 'CUTI', color: 'warning' },
        { value: 'non-aktif', label: 'NON-AKTIF', color: 'danger' }
    ];

    // Mock data untuk 40 karyawan sesuai database
    useEffect(() => {
        const mockEmployees = [
            {
                id: 1,
                nama: 'Ahmad Ridwan',
                nik: 'EMP001',
                bagian: 'Cutting',
                line: 'A1',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2023-01-15',
                rfidId: '4300409172E0'
            },
            {
                id: 2,
                nama: 'Lilis Suryani',
                nik: 'EMP012',
                bagian: 'Sewing',
                line: 'B4',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2023-03-20',
                rfidId: '4300445CFBA0'
            },
            {
                id: 3,
                nama: 'Wahyu Setiawan',
                nik: 'EMP002',
                bagian: 'Finishing',
                line: 'C3',
                posisi: 'Supervisor',
                status: 'aktif',
                joinDate: '2022-11-10',
                rfidId: '43003DC71EA7'
            },
            {
                id: 4,
                nama: 'Siti Nurhaliza',
                nik: 'EMP003',
                bagian: 'Sewing',
                line: 'B1',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2023-02-08',
                rfidId: '430041234567'
            },
            {
                id: 5,
                nama: 'Budi Santoso',
                nik: 'EMP004',
                bagian: 'Cutting',
                line: 'A2',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2023-04-12',
                rfidId: '430045678901'
            },
            {
                id: 6,
                nama: 'Dewi Sartika',
                nik: 'EMP005',
                bagian: 'Quality Control',
                line: 'QC1',
                posisi: 'Inspector',
                status: 'aktif',
                joinDate: '2023-01-25',
                rfidId: '430049876543'
            },
            {
                id: 7,
                nama: 'Rudi Hartono',
                nik: 'EMP006',
                bagian: 'Packaging',
                line: 'P1',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2023-05-18',
                rfidId: '430043210987'
            },
            {
                id: 8,
                nama: 'Nina Marlina',
                nik: 'EMP007',
                bagian: 'Sewing',
                line: 'B2',
                posisi: 'Operator',
                status: 'cuti',
                joinDate: '2023-03-10',
                rfidId: '430047654321'
            },
            {
                id: 9,
                nama: 'Agus Supriyadi',
                nik: 'EMP008',
                bagian: 'Maintenance',
                line: 'M1',
                posisi: 'Technician',
                status: 'aktif',
                joinDate: '2022-12-05',
                rfidId: '430041112223'
            },
            {
                id: 10,
                nama: 'Maya Indah',
                nik: 'EMP009',
                bagian: 'Finishing',
                line: 'C1',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2023-06-22',
                rfidId: '430044445556'
            },
            {
                id: 11,
                nama: 'Hendra Gunawan',
                nik: 'EMP010',
                bagian: 'Cutting',
                line: 'A3',
                posisi: 'Supervisor',
                status: 'aktif',
                joinDate: '2022-10-15',
                rfidId: '430047778889'
            },
            {
                id: 12,
                nama: 'Rina Marlina',
                nik: 'EMP011',
                bagian: 'Sewing',
                line: 'B3',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2023-07-08',
                rfidId: '430040001112'
            },
            {
                id: 13,
                nama: 'Joko Widodo',
                nik: 'EMP013',
                bagian: 'Quality Control',
                line: 'QC2',
                posisi: 'Inspector',
                status: 'aktif',
                joinDate: '2023-08-14',
                rfidId: '430043334445'
            },
            {
                id: 14,
                nama: 'Sri Wahyuni',
                nik: 'EMP014',
                bagian: 'Packaging',
                line: 'P2',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2023-09-03',
                rfidId: '430046667778'
            },
            {
                id: 15,
                nama: 'Bambang Sutejo',
                nik: 'EMP015',
                bagian: 'Maintenance',
                line: 'M2',
                posisi: 'Technician',
                status: 'aktif',
                joinDate: '2023-10-12',
                rfidId: '430049990001'
            },
            {
                id: 16,
                nama: 'Yuni Safitri',
                nik: 'EMP016',
                bagian: 'Finishing',
                line: 'C2',
                posisi: 'Operator',
                status: 'cuti',
                joinDate: '2023-11-20',
                rfidId: '430042223334'
            },
            {
                id: 17,
                nama: 'Dedi Kurniawan',
                nik: 'EMP017',
                bagian: 'Cutting',
                line: 'A4',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2023-12-05',
                rfidId: '430045556667'
            },
            {
                id: 18,
                nama: 'Sari Indah',
                nik: 'EMP018',
                bagian: 'Sewing',
                line: 'B5',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2024-01-10',
                rfidId: '430048889990'
            },
            {
                id: 19,
                nama: 'Eko Prasetyo',
                nik: 'EMP019',
                bagian: 'Quality Control',
                line: 'QC3',
                posisi: 'Supervisor',
                status: 'aktif',
                joinDate: '2024-02-15',
                rfidId: '430041112223'
            },
            {
                id: 20,
                nama: 'Ratna Sari',
                nik: 'EMP020',
                bagian: 'Packaging',
                line: 'P3',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2024-03-08',
                rfidId: '430044445556'
            },
            {
                id: 21,
                nama: 'Tono Suharto',
                nik: 'EMP021',
                bagian: 'Maintenance',
                line: 'M3',
                posisi: 'Technician',
                status: 'aktif',
                joinDate: '2024-04-12',
                rfidId: '430047778889'
            },
            {
                id: 22,
                nama: 'Linda Permata',
                nik: 'EMP022',
                bagian: 'Finishing',
                line: 'C4',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2024-05-20',
                rfidId: '430040001112'
            },
            {
                id: 23,
                nama: 'Roni Setiawan',
                nik: 'EMP023',
                bagian: 'Cutting',
                line: 'A5',
                posisi: 'Operator',
                status: 'non-aktif',
                joinDate: '2023-06-15',
                rfidId: '430043334445'
            },
            {
                id: 24,
                nama: 'Diana Putri',
                nik: 'EMP024',
                bagian: 'Sewing',
                line: 'B6',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2024-06-25',
                rfidId: '430046667778'
            },
            {
                id: 25,
                nama: 'Ahmad Fauzi',
                nik: 'EMP025',
                bagian: 'Quality Control',
                line: 'QC4',
                posisi: 'Inspector',
                status: 'aktif',
                joinDate: '2024-07-30',
                rfidId: '430049990001'
            },
            {
                id: 26,
                nama: 'Siti Aisyah',
                nik: 'EMP026',
                bagian: 'Packaging',
                line: 'P4',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2024-08-05',
                rfidId: '430042223334'
            },
            {
                id: 27,
                nama: 'Muhammad Rizki',
                nik: 'EMP027',
                bagian: 'Maintenance',
                line: 'M4',
                posisi: 'Technician',
                status: 'aktif',
                joinDate: '2024-09-10',
                rfidId: '430045556667'
            },
            {
                id: 28,
                nama: 'Nurul Hidayah',
                nik: 'EMP028',
                bagian: 'Finishing',
                line: 'C5',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2024-10-15',
                rfidId: '430048889990'
            },
            {
                id: 29,
                nama: 'Rizki Pratama',
                nik: 'EMP029',
                bagian: 'Cutting',
                line: 'A6',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2024-11-20',
                rfidId: '430041112223'
            },
            {
                id: 30,
                nama: 'Anisa Fitriani',
                nik: 'EMP030',
                bagian: 'Sewing',
                line: 'B7',
                posisi: 'Operator',
                status: 'cuti',
                joinDate: '2024-12-25',
                rfidId: '430044445556'
            },
            {
                id: 31,
                nama: 'Doni Kusuma',
                nik: 'EMP031',
                bagian: 'Quality Control',
                line: 'QC5',
                posisi: 'Inspector',
                status: 'aktif',
                joinDate: '2025-01-05',
                rfidId: '430047778889'
            },
            {
                id: 32,
                nama: 'Putri Anggraini',
                nik: 'EMP032',
                bagian: 'Packaging',
                line: 'P5',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2025-02-10',
                rfidId: '430040001112'
            },
            {
                id: 33,
                nama: 'Arief Rahman',
                nik: 'EMP033',
                bagian: 'Maintenance',
                line: 'M5',
                posisi: 'Technician',
                status: 'aktif',
                joinDate: '2025-03-15',
                rfidId: '430043334445'
            },
            {
                id: 34,
                nama: 'Maya Sari',
                nik: 'EMP034',
                bagian: 'Finishing',
                line: 'C6',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2025-04-20',
                rfidId: '430046667778'
            },
            {
                id: 35,
                nama: 'Budi Prasetyo',
                nik: 'EMP035',
                bagian: 'Cutting',
                line: 'A7',
                posisi: 'Supervisor',
                status: 'aktif',
                joinDate: '2025-05-25',
                rfidId: '430049990001'
            },
            {
                id: 36,
                nama: 'Sari Dewi',
                nik: 'EMP036',
                bagian: 'Sewing',
                line: 'B8',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2025-06-30',
                rfidId: '430042223334'
            },
            {
                id: 37,
                nama: 'Eko Saputra',
                nik: 'EMP037',
                bagian: 'Quality Control',
                line: 'QC6',
                posisi: 'Inspector',
                status: 'aktif',
                joinDate: '2025-07-05',
                rfidId: '430045556667'
            },
            {
                id: 38,
                nama: 'Rina Safitri',
                nik: 'EMP038',
                bagian: 'Packaging',
                line: 'P6',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2025-08-10',
                rfidId: '430048889990'
            },
            {
                id: 39,
                nama: 'Teguh Santoso',
                nik: 'EMP039',
                bagian: 'Maintenance',
                line: 'M6',
                posisi: 'Technician',
                status: 'aktif',
                joinDate: '2025-09-15',
                rfidId: '430041112223'
            },
            {
                id: 40,
                nama: 'Lina Marlina',
                nik: 'EMP040',
                bagian: 'Finishing',
                line: 'C7',
                posisi: 'Operator',
                status: 'aktif',
                joinDate: '2025-10-20',
                rfidId: '430044445556'
            }
        ];
        setEmployees(mockEmployees);
        setFilteredEmployees(mockEmployees);
    }, []);

    // Filter employees
    useEffect(() => {
        let filtered = employees;

        if (searchTerm) {
            filtered = filtered.filter(emp =>
                emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.rfidId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(emp => emp.bagian === selectedDepartment);
        }

        setFilteredEmployees(filtered);
    }, [employees, searchTerm, selectedDepartment]);

    const handleAddEmployee = () => {
        if (!formData.nama || !formData.nik) {
            alert('Nama dan NIK wajib diisi!');
            return;
        }

        const newEmployee = {
            id: Date.now(),
            ...formData,
            joinDate: new Date().toISOString().split('T')[0],
            rfidId: 'RFID-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        setEmployees([...employees, newEmployee]);
        setFormData({
            nama: '',
            nik: '',
            bagian: '',
            line: '',
            posisi: '',
            status: 'aktif'
        });
        setShowAddModal(false);
    };

    const handleEditEmployee = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            nama: employee.nama,
            nik: employee.nik,
            bagian: employee.bagian,
            line: employee.line,
            posisi: employee.posisi,
            status: employee.status
        });
        setShowAddModal(true);
    };

    const handleUpdateEmployee = () => {
        const updatedEmployees = employees.map(emp =>
            emp.id === editingEmployee.id ? { ...emp, ...formData } : emp
        );
        setEmployees(updatedEmployees);
        setEditingEmployee(null);
        setFormData({
            nama: '',
            nik: '',
            bagian: '',
            line: '',
            posisi: '',
            status: 'aktif'
        });
        setShowAddModal(false);
    };

    const handleDeleteEmployee = (id) => {
        if (window.confirm('Yakin ingin menghapus karyawan ini?')) {
            setEmployees(employees.filter(emp => emp.id !== id));
        }
    };

    const getStatusColor = (status) => {
        const statusObj = statusOptions.find(s => s.value === status);
        return statusObj ? statusObj.color : 'secondary';
    };

    return (
        <div className="daftar-karyawan-container">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>👥 Daftar Karyawan</h1>
                    <p>Kelola data karyawan dan informasi personal</p>
                </div>
                <button
                    className="add-btn"
                    onClick={() => setShowAddModal(true)}
                >
                    <span>➕</span>
                    Tambah Karyawan
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{employees.length}</h3>
                        <p>Total Karyawan</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{employees.filter(emp => emp.status === 'aktif').length}</h3>
                        <p>Karyawan Aktif</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>{departments.length}</h3>
                        <p>Departemen</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏭</div>
                    <div className="stat-content">
                        <h3>{new Set(employees.map(emp => emp.line)).size}</h3>
                        <p>Line Produksi</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Cari karyawan..."
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
                </div>
            </div>

            {/* Employee Table */}
            <div className="table-container">
                <table className="employee-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>NIK</th>
                            <th>Departemen</th>
                            <th>Line</th>
                            <th>Posisi</th>
                            <th>Status</th>
                            <th>RFID ID</th>
                            <th>Join Date</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map(employee => (
                            <tr key={employee.id} className="employee-row">
                                <td>
                                    <div className="employee-info">
                                        <div className="employee-avatar">
                                            {employee.nama.charAt(0)}
                                        </div>
                                        <div className="employee-details">
                                            <span className="employee-name">{employee.nama}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{employee.nik}</td>
                                <td>
                                    <span className="department-badge">{employee.bagian}</span>
                                </td>
                                <td>{employee.line}</td>
                                <td>{employee.posisi}</td>
                                <td>
                                    <span className={`status-badge ${getStatusColor(employee.status)}`}>
                                        {statusOptions.find(s => s.value === employee.status)?.label}
                                    </span>
                                </td>
                                <td>
                                    <span className="rfid-id">{employee.rfidId}</span>
                                </td>
                                <td>{employee.joinDate}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn edit"
                                            onClick={() => handleEditEmployee(employee)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDeleteEmployee(employee.id)}
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
                            <h2>{editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan'}</h2>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingEmployee(null);
                                    setFormData({
                                        nama: '',
                                        nik: '',
                                        bagian: '',
                                        line: '',
                                        posisi: '',
                                        status: 'aktif'
                                    });
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                            <div className="form-group">
                                <label>NIK</label>
                                <input
                                    type="text"
                                    value={formData.nik}
                                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                                    placeholder="Masukkan NIK"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Departemen</label>
                                    <select
                                        value={formData.bagian}
                                        onChange={(e) => setFormData({ ...formData, bagian: e.target.value })}
                                    >
                                        <option value="">Pilih Departemen</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Line</label>
                                    <input
                                        type="text"
                                        value={formData.line}
                                        onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                                        placeholder="Contoh: A1, B2"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Posisi</label>
                                    <input
                                        type="text"
                                        value={formData.posisi}
                                        onChange={(e) => setFormData({ ...formData, posisi: e.target.value })}
                                        placeholder="Contoh: Operator, Supervisor"
                                    />
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
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingEmployee(null);
                                }}
                            >
                                Batal
                            </button>
                            <button
                                className="btn-primary"
                                onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                            >
                                {editingEmployee ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DaftarKaryawan; 