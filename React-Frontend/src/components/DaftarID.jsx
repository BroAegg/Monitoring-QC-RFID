import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import {
    getAllEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    searchEmployees
} from '../services/api';
import './DaftarID.css';

const DaftarID = () => {
    const [formData, setFormData] = useState({
        id: '',
        nama: '',
        nik: '',
        bagian: '',
        line: '',
        fasilitas: ''
    });

    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [socket, setSocket] = useState(null);
    const [rfidScanEnabled, setRfidScanEnabled] = useState(true);
    const [lastRfidScan, setLastRfidScan] = useState(null);

    /**
     * Menampilkan notifikasi kecil yang tidak mengganggu UI
     */
    const showSmallNotification = (text, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `small-notification ${type}`;
        notification.textContent = text;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    };

    /**
     * Menampilkan pesan notifikasi
     */
    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    /**
     * Memuat data karyawan dari backend
     */
    const loadEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await getAllEmployees();
            const employees = response.data.map(emp => ({
                id: emp._id,
                idCard: emp.idCard,
                fasilitas: emp.fasilitas,
                nama: emp.nama,
                nik: emp.nik,
                bagian: emp.bagian,
                line: emp.line,
                status: emp.status,
                checked: false
            }));

            setTableData(employees);
            setFilteredData(employees);

            // Hanya tampilkan notifikasi jika benar-benar loading dari backend
            if (employees.length > 0) {
                showSmallNotification(`✅ Data loaded: ${employees.length} karyawan`, 'success');
            }
        } catch (error) {
            console.error('❌ Error loading employees:', error);
            showSmallNotification('⚠️ Backend tidak tersedia, menggunakan mode offline', 'warning');

            // Tetap tampilkan data yang ada atau data kosong tanpa loading state
            if (tableData.length === 0) {
                setTableData([]);
                setFilteredData([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Setup WebSocket untuk RFID scan integration
     */
    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // Listen untuk RFID scan dari serial
        newSocket.on('rfid_serial_data', (data) => {
            if (rfidScanEnabled) {
                handleRfidScan(data.uid);
            }
        });

        // Listen untuk new scan dengan data karyawan
        newSocket.on('new_scan', (scanData) => {
            if (rfidScanEnabled && scanData.employee) {
                handleRfidEmployeeFound(scanData);
            }
        });

        return () => {
            newSocket.close();
        };
    }, [rfidScanEnabled]);

    /**
     * Inisialisasi data saat component mount
     */
    useEffect(() => {
        loadEmployees();
    }, []);

    /**
     * Menangani RFID scan - auto search atau fill form
     */
    const handleRfidScan = async (rfidId) => {
        try {
            console.log(`🔍 DaftarID: RFID scan detected: ${rfidId}`);
            setLastRfidScan({ id: rfidId, timestamp: new Date() });
            showSmallNotification(`📡 RFID Detected: ${rfidId}`, 'info');

            // Cari karyawan berdasarkan RFID ID
            const response = await fetch(`http://localhost:5000/api/employees/rfid/${rfidId}`);

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log(`✅ Employee found via API: ${result.data.nama} (${result.data.idCard})`);
                    // Karyawan ditemukan - auto search
                    handleRfidEmployeeFound({
                        employee: result.data,
                        uid: rfidId
                    });
                } else {
                    console.log(`❌ Employee not found via API for RFID: ${rfidId}`);
                    // Karyawan tidak ditemukan - auto fill form untuk input baru
                    handleRfidNewEmployee(rfidId);
                }
            } else {
                console.log(`❌ API error for RFID: ${rfidId}, status: ${response.status}`);
                // Karyawan tidak ditemukan - auto fill form untuk input baru
                handleRfidNewEmployee(rfidId);
            }

        } catch (error) {
            console.error('❌ Error handling RFID scan:', error);
            showSmallNotification('❌ Error processing RFID scan', 'error');
        }
    };

    /**
 * Menangani RFID scan untuk karyawan yang sudah ada
 */
    const handleRfidEmployeeFound = (scanData) => {
        const employee = scanData.employee;
        console.log(`🔍 DaftarID: Searching for employee in tableData with RFID: ${scanData.uid}`);
        console.log(`🔍 Employee from API: ${employee.nama} (${employee.idCard})`);
        console.log(`🔍 Current tableData count: ${tableData.length}`);

        // Log semua data di tableData untuk debugging
        console.log('🔍 All employees in tableData:');
        tableData.forEach((emp, index) => {
            console.log(`   ${index + 1}. "${emp.idCard}" -> ${emp.nama}`);
        });

        // Auto search karyawan berdasarkan RFID ID (case-insensitive match)
        const searchResults = tableData.filter(emp => {
            const match = emp.idCard && emp.idCard.toUpperCase() === scanData.uid.toUpperCase();
            console.log(`   Comparing: "${emp.idCard}" with "${scanData.uid}" -> ${match}`);
            return match;
        });

        console.log(`✅ Found ${searchResults.length} matching employees in tableData`);

        // Jika tidak ditemukan di tableData, refresh data dari backend
        if (searchResults.length === 0) {
            console.log('⚠️ Employee not found in tableData, refreshing from backend...');
            loadEmployees().then(() => {
                // Setelah refresh, cari lagi
                const refreshedTableData = tableData;
                const refreshedSearchResults = refreshedTableData.filter(emp =>
                    emp.idCard && emp.idCard.toUpperCase() === scanData.uid.toUpperCase()
                );

                if (refreshedSearchResults.length > 0) {
                    setFilteredData(refreshedSearchResults);
                    console.log(`✅ Found ${refreshedSearchResults.length} employees after refresh`);
                } else {
                    console.log('❌ Still not found after refresh');
                }
            });
        } else {
            setFilteredData(searchResults);
        }

        // Update form dengan data karyawan yang ditemukan
        setFormData({
            id: employee.idCard,
            nama: employee.nama,
            nik: employee.nik,
            bagian: employee.bagian,
            line: employee.line,
            fasilitas: employee.fasilitas
        });

        showSmallNotification(
            `✅ RFID Found: ${employee.nama} (${employee.bagian} - ${employee.line})`,
            'success'
        );
    };

    /**
     * Menangani RFID scan untuk karyawan baru
     */
    const handleRfidNewEmployee = (rfidId) => {
        // Auto fill ID Card dengan RFID yang di-scan
        setFormData({
            id: rfidId,
            nama: '',
            nik: '',
            bagian: '',
            line: '',
            fasilitas: ''
        });

        showSmallNotification(
            `📝 RFID baru terdeteksi. Silakan lengkapi data karyawan.`,
            'warning'
        );
    };

    /**
     * Toggle RFID scan functionality
     */
    const toggleRfidScan = () => {
        setRfidScanEnabled(!rfidScanEnabled);
        showSmallNotification(
            rfidScanEnabled ? '📡 RFID Scan dinonaktifkan' : '📡 RFID Scan diaktifkan',
            'info'
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Handle form submit untuk search
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let searchResults = [];

            if (formData.nama || formData.id || formData.nik) {
                // Gunakan search API jika ada input
                const searchQuery = formData.nama || formData.id || formData.nik;
                const response = await searchEmployees(searchQuery);
                searchResults = response.data.map(emp => ({
                    id: emp._id,
                    idCard: emp.idCard,
                    fasilitas: emp.fasilitas,
                    nama: emp.nama,
                    nik: emp.nik,
                    bagian: emp.bagian,
                    line: emp.line,
                    status: emp.status,
                    checked: false
                }));
            } else {
                // Load semua data jika tidak ada input
                await loadEmployees();
                return;
            }

            setFilteredData(searchResults);
            showMessage(`Ditemukan ${searchResults.length} data`, 'success');
        } catch (error) {
            showSmallNotification('⚠️ Pencarian gagal, coba lagi', 'warning');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        // Update filteredData dengan checked status baru
        const newFilteredData = filteredData.map(item => ({
            ...item,
            checked: newSelectAll
        }));

        // Update tableData untuk konsistensi
        const newTableData = tableData.map(item => {
            const isInFiltered = filteredData.some(filtered => filtered.id === item.id);
            return {
                ...item,
                checked: isInFiltered ? newSelectAll : item.checked
            };
        });

        setFilteredData(newFilteredData);
        setTableData(newTableData);

        const newSelectedRows = newSelectAll ? newFilteredData.map(item => item.id) : [];
        setSelectedRows(newSelectedRows);
    };

    const handleRowSelect = (id) => {
        // Cari item dan toggle checked status dengan deep copy yang benar
        const newFilteredData = filteredData.map(item => {
            if (item.id === id) {
                return { ...item, checked: !item.checked };
            }
            return { ...item }; // Pastikan semua item di-copy, bukan reference
        });

        // Update juga tableData untuk konsistensi
        const newTableData = tableData.map(item => {
            if (item.id === id) {
                return { ...item, checked: !item.checked };
            }
            return { ...item };
        });

        setFilteredData(newFilteredData);
        setTableData(newTableData);

        // Update selected rows based on checked items
        const selectedIds = newFilteredData.filter(item => item.checked).map(item => item.id);
        setSelectedRows(selectedIds);

        // Update select all status
        setSelectAll(selectedIds.length === newFilteredData.length && newFilteredData.length > 0);
    };

    /**
     * Handle search berdasarkan nama
     */
    const handleSearch = async () => {
        if (!searchName.trim()) {
            setFilteredData(tableData);
            return;
        }

        setIsLoading(true);
        try {
            const response = await searchEmployees(searchName);
            const results = response.data.map(emp => ({
                id: emp._id,
                idCard: emp.idCard,
                fasilitas: emp.fasilitas,
                nama: emp.nama,
                nik: emp.nik,
                bagian: emp.bagian,
                line: emp.line,
                status: emp.status,
                checked: false
            }));

            setFilteredData(results);
            showMessage(`Ditemukan ${results.length} data untuk "${searchName}"`, 'success');
        } catch (error) {
            showSmallNotification('⚠️ Pencarian gagal, coba lagi', 'warning');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Refresh data
     */
    const handleRefresh = async () => {
        setSearchName('');
        setSelectedRows([]);
        setSelectAll(false);
        await loadEmployees();
    };

    /**
     * Tambah karyawan baru
     */
    const handleAdd = async () => {
        if (!formData.id || !formData.nama || !formData.nik) {
            showMessage('Mohon isi ID, Nama, dan NIK', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const employeeData = {
                idCard: formData.id,
                nama: formData.nama,
                nik: formData.nik,
                bagian: formData.bagian || 'Default',
                line: formData.line || 'Default',
                fasilitas: formData.fasilitas || 'Default'
            };

            await addEmployee(employeeData);

            // Reset form
            setFormData({
                id: '',
                nama: '',
                nik: '',
                bagian: '',
                line: '',
                fasilitas: ''
            });

            // Refresh data
            await loadEmployees();
            showMessage('Data berhasil ditambahkan', 'success');
        } catch (error) {
            showSmallNotification('⚠️ Penambahan data gagal, coba lagi', 'warning');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Update karyawan
     */
    const handleUpdate = async () => {
        if (selectedRows.length !== 1) {
            showMessage('Pilih tepat satu data untuk diupdate', 'error');
            return;
        }

        if (!formData.id || !formData.nama || !formData.nik) {
            showMessage('Mohon isi semua field untuk update', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const employeeData = {
                idCard: formData.id,
                nama: formData.nama,
                nik: formData.nik,
                bagian: formData.bagian,
                line: formData.line,
                fasilitas: formData.fasilitas
            };

            await updateEmployee(selectedRows[0], employeeData);

            // Reset form dan selection
            setFormData({
                id: '',
                nama: '',
                nik: '',
                bagian: '',
                line: '',
                fasilitas: ''
            });
            setSelectedRows([]);
            setSelectAll(false);

            // Refresh data
            await loadEmployees();
            showMessage('Data berhasil diupdate', 'success');
        } catch (error) {
            showSmallNotification('⚠️ Pembaruan data gagal, coba lagi', 'warning');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Hapus karyawan
     */
    const handleDelete = async () => {
        if (selectedRows.length === 0) {
            showMessage('Pilih data yang akan dihapus', 'error');
            return;
        }

        if (!window.confirm(`Yakin ingin menghapus ${selectedRows.length} data?`)) {
            return;
        }

        setIsLoading(true);
        try {
            // Delete each selected employee
            const deletePromises = selectedRows.map(id => deleteEmployee(id));
            await Promise.all(deletePromises);

            setSelectedRows([]);
            setSelectAll(false);

            // Refresh data
            await loadEmployees();
            showMessage(`${selectedRows.length} data berhasil dihapus`, 'success');
        } catch (error) {
            showSmallNotification('⚠️ Penghapusan data gagal, coba lagi', 'warning');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Populate form dengan data yang dipilih
     */
    useEffect(() => {
        if (selectedRows.length === 1) {
            const selectedEmployee = filteredData.find(emp => emp.id === selectedRows[0]);
            if (selectedEmployee) {
                setFormData({
                    id: selectedEmployee.idCard,
                    nama: selectedEmployee.nama,
                    nik: selectedEmployee.nik,
                    bagian: selectedEmployee.bagian,
                    line: selectedEmployee.line,
                    fasilitas: selectedEmployee.fasilitas
                });
            }
        }
    }, [selectedRows, filteredData]);

    return (
        <div className="daftar-id-container">
            {/* Message Display */}
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* RFID Status Panel */}
            <div className="rfid-status-panel">
                <div className="rfid-status-content">
                    <div className="rfid-status-info">
                        <span className={`rfid-indicator ${rfidScanEnabled ? 'active' : 'inactive'}`}>
                            📡 RFID Scan: {rfidScanEnabled ? 'ON' : 'OFF'}
                        </span>
                        {lastRfidScan && (
                            <span className="last-rfid-scan">
                                Last: {lastRfidScan.id} ({lastRfidScan.timestamp.toLocaleTimeString()})
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        className={`rfid-toggle-btn ${rfidScanEnabled ? 'active' : 'inactive'}`}
                        onClick={toggleRfidScan}
                    >
                        {rfidScanEnabled ? '🔴 Disable' : '🟢 Enable'} RFID
                    </button>
                </div>
            </div>

            <div className="daftar-id-main-content">
                {/* Left Panel - Form Section */}
                <div className="left-panel">
                    <div className="form-section">
                        <h2>Form Input Data Karyawan</h2>
                        <form onSubmit={handleSubmit} className="input-form">
                            <div className="form-group">
                                <label htmlFor="id">ID Card:</label>
                                <input
                                    type="text"
                                    id="id"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan ID Card"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="nama">Nama:</label>
                                <input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan Nama"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="nik">NIK:</label>
                                <input
                                    type="text"
                                    id="nik"
                                    name="nik"
                                    value={formData.nik}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan NIK"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="bagian">BAGIAN:</label>
                                <input
                                    type="text"
                                    id="bagian"
                                    name="bagian"
                                    value={formData.bagian}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan Bagian"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="line">LINE:</label>
                                <input
                                    type="text"
                                    id="line"
                                    name="line"
                                    value={formData.line}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan Line"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="fasilitas">FASILITAS:</label>
                                <input
                                    type="text"
                                    id="fasilitas"
                                    name="fasilitas"
                                    value={formData.fasilitas}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan Fasilitas"
                                />
                            </div>

                            <div className="button-group">
                                <button
                                    type="submit"
                                    className={`btn btn-search ${isLoading ? 'loading' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? '⏳' : '🔍'} Search Panel
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-delete ${isLoading ? 'loading' : ''}`}
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                >
                                    {isLoading ? '⏳' : '🗑️'} Del
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-update ${isLoading ? 'loading' : ''}`}
                                    onClick={handleUpdate}
                                    disabled={isLoading}
                                >
                                    {isLoading ? '⏳' : '✏️'} Up
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-add ${isLoading ? 'loading' : ''}`}
                                    onClick={handleAdd}
                                    disabled={isLoading}
                                >
                                    {isLoading ? '⏳' : '➕'} Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Panel - Table Section */}
                <div className="right-panel">
                    <div className="table-section">
                        <div className="table-header">
                            <h2>Data Karyawan</h2>
                            <button
                                className={`btn btn-refresh ${isLoading ? 'loading' : ''}`}
                                onClick={handleRefresh}
                                disabled={isLoading}
                            >
                                {isLoading ? '⏳' : '🔄'} Refresh
                            </button>
                        </div>

                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Cari Nama..."
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="search-input"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                className={`btn btn-search-small ${isLoading ? 'loading' : ''}`}
                                onClick={handleSearch}
                                disabled={isLoading}
                            >
                                {isLoading ? '⏳' : '🔍'}
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                className="checkbox-all"
                                            />
                                            <span>All</span>
                                        </th>
                                        <th>ID Card</th>
                                        <th>Fasilitas</th>
                                        <th>Nama</th>
                                        <th>NIK</th>
                                        <th>Bagian</th>
                                        <th>LINE</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="8" className="loading-cell">
                                                ⏳ Memuat data...
                                            </td>
                                        </tr>
                                    ) : filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="empty-cell">
                                                📂 Belum ada data karyawan. Tambahkan data baru atau periksa koneksi backend.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((row) => (
                                            <tr key={row.id} className={row.checked ? 'selected' : ''}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={row.checked}
                                                        onChange={() => handleRowSelect(row.id)}
                                                        className="checkbox-row"
                                                    />
                                                </td>
                                                <td>{row.idCard}</td>
                                                <td>{row.fasilitas}</td>
                                                <td>{row.nama}</td>
                                                <td>{row.nik}</td>
                                                <td>{row.bagian}</td>
                                                <td>{row.line}</td>
                                                <td>
                                                    <span className={`status-badge ${row.status}`}>
                                                        {row.status || 'aktif'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DaftarID; 