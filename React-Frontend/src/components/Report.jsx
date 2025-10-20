/**
 * Komponen Report - Professional Report Generation & Analytics
 * Design dengan color palette: biru tua, biru muda, cyan, kuning, dan gold
 */

import { useState, useEffect } from 'react';
import './Report.css';

const Report = () => {
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReportType, setSelectedReportType] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const [formData, setFormData] = useState({
        reportTitle: '',
        reportType: '',
        startDate: '',
        endDate: '',
        description: '',
        includeCharts: true,
        includeTables: true
    });

    const reportTypes = [
        'RFID Attendance',
        'Productivity Analysis',
        'SMV Performance',
        'Department Summary',
        'Employee Performance',
        'System Analytics'
    ];

    const periodOptions = [
        { value: 'day', label: 'Hari Ini' },
        { value: 'week', label: 'Minggu Ini' },
        { value: 'month', label: 'Bulan Ini' },
        { value: 'quarter', label: 'Kuartal Ini' },
        { value: 'year', label: 'Tahun Ini' }
    ];

    // Mock data untuk demo
    useEffect(() => {
        const mockReportData = [
            {
                id: 1,
                title: 'RFID Attendance Report - January 2024',
                type: 'RFID Attendance',
                generatedBy: 'Admin System',
                generatedDate: '2024-01-15',
                period: 'January 2024',
                status: 'completed',
                fileSize: '2.5 MB',
                downloadCount: 15,
                description: 'Laporan kehadiran karyawan berdasarkan RFID scan'
            },
            {
                id: 2,
                title: 'Productivity Analysis Q4 2023',
                type: 'Productivity Analysis',
                generatedBy: 'Manager Production',
                generatedDate: '2024-01-10',
                period: 'Q4 2023',
                status: 'completed',
                fileSize: '4.2 MB',
                downloadCount: 8,
                description: 'Analisis produktivitas departemen produksi'
            },
            {
                id: 3,
                title: 'SMV Performance Report',
                type: 'SMV Performance',
                generatedBy: 'Quality Control',
                generatedDate: '2024-01-08',
                period: 'December 2023',
                status: 'processing',
                fileSize: '1.8 MB',
                downloadCount: 12,
                description: 'Laporan performa Standard Minute Value'
            }
        ];
        setReportData(mockReportData);
        setFilteredData(mockReportData);
    }, []);

    // Filter data
    useEffect(() => {
        let filtered = reportData;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedReportType !== 'all') {
            filtered = filtered.filter(item => item.type === selectedReportType);
        }

        setFilteredData(filtered);
    }, [reportData, searchTerm, selectedReportType]);

    const handleGenerateReport = () => {
        if (!formData.reportTitle || !formData.reportType || !formData.startDate) {
            alert('Judul laporan, tipe laporan, dan tanggal mulai wajib diisi!');
            return;
        }

        const newReport = {
            id: Date.now(),
            title: formData.reportTitle,
            type: formData.reportType,
            generatedBy: 'Current User',
            generatedDate: new Date().toISOString().split('T')[0],
            period: `${formData.startDate} - ${formData.endDate}`,
            status: 'processing',
            fileSize: '0 MB',
            downloadCount: 0,
            description: formData.description,
            includeCharts: formData.includeCharts,
            includeTables: formData.includeTables
        };

        setReportData([newReport, ...reportData]);
        setFormData({
            reportTitle: '',
            reportType: '',
            startDate: '',
            endDate: '',
            description: '',
            includeCharts: true,
            includeTables: true
        });
        setShowGenerateModal(false);
    };

    const handleDownloadReport = (report) => {
        // Simulasi download
        alert(`Downloading: ${report.title}`);
        const updatedData = reportData.map(item =>
            item.id === report.id
                ? { ...item, downloadCount: item.downloadCount + 1 }
                : item
        );
        setReportData(updatedData);
    };

    const handleDeleteReport = (id) => {
        if (window.confirm('Yakin ingin menghapus laporan ini?')) {
            setReportData(reportData.filter(item => item.id !== id));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'warning';
            case 'failed': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return '✅';
            case 'processing': return '⏳';
            case 'failed': return '❌';
            default: return '📊';
        }
    };

    const getFileSizeColor = (size) => {
        const sizeInMB = parseFloat(size);
        if (sizeInMB > 5) return 'danger';
        if (sizeInMB > 2) return 'warning';
        return 'success';
    };

    return (
        <div className="report-container">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>📋 Report & Analytics</h1>
                    <p>Generate dan kelola laporan sistem RFID</p>
                </div>
                <button
                    className="add-btn"
                    onClick={() => setShowGenerateModal(true)}
                >
                    <span>📊</span>
                    Generate Report
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-content">
                        <h3>{reportData.length}</h3>
                        <p>Total Reports</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{reportData.filter(item => item.status === 'completed').length}</h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📥</div>
                    <div className="stat-content">
                        <h3>{reportData.reduce((acc, item) => acc + item.downloadCount, 0)}</h3>
                        <p>Total Downloads</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>{reportTypes.length}</h3>
                        <p>Report Types</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Cari laporan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <div className="filter-controls">
                    <select
                        value={selectedReportType}
                        onChange={(e) => setSelectedReportType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Semua Tipe</option>
                        {reportTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
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

            {/* Report Table */}
            <div className="table-container">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Report Title</th>
                            <th>Type</th>
                            <th>Generated By</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>File Size</th>
                            <th>Downloads</th>
                            <th>Description</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(item => (
                            <tr key={item.id} className="report-row">
                                <td>
                                    <div className="report-info">
                                        <div className="report-icon">📄</div>
                                        <div className="report-details">
                                            <span className="report-title">{item.title}</span>
                                            <span className="report-period">{item.period}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="report-type-badge">{item.type}</span>
                                </td>
                                <td>
                                    <span className="generated-by">{item.generatedBy}</span>
                                </td>
                                <td>{item.generatedDate}</td>
                                <td>
                                    <div className="status-indicator">
                                        <span className="status-icon">{getStatusIcon(item.status)}</span>
                                        <span className={`status-badge ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`file-size ${getFileSizeColor(item.fileSize)}`}>
                                        {item.fileSize}
                                    </span>
                                </td>
                                <td>
                                    <span className="download-count">{item.downloadCount}</span>
                                </td>
                                <td>
                                    <span className="description-text">{item.description}</span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn download"
                                            onClick={() => handleDownloadReport(item)}
                                            title="Download"
                                            disabled={item.status !== 'completed'}
                                        >
                                            📥
                                        </button>
                                        <button
                                            className="action-btn view"
                                            onClick={() => setSelectedReport(item)}
                                            title="View"
                                        >
                                            👁️
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDeleteReport(item.id)}
                                            title="Delete"
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

            {/* Generate Report Modal */}
            {showGenerateModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Generate New Report</h2>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowGenerateModal(false);
                                    setFormData({
                                        reportTitle: '',
                                        reportType: '',
                                        startDate: '',
                                        endDate: '',
                                        description: '',
                                        includeCharts: true,
                                        includeTables: true
                                    });
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Report Title</label>
                                <input
                                    type="text"
                                    value={formData.reportTitle}
                                    onChange={(e) => setFormData({ ...formData, reportTitle: e.target.value })}
                                    placeholder="Masukkan judul laporan"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Report Type</label>
                                    <select
                                        value={formData.reportType}
                                        onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                                    >
                                        <option value="">Pilih Tipe Laporan</option>
                                        {reportTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Period</label>
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(e.target.value)}
                                    >
                                        {periodOptions.map(period => (
                                            <option key={period.value} value={period.value}>
                                                {period.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Deskripsi laporan"
                                    rows="3"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.includeCharts}
                                            onChange={(e) => setFormData({ ...formData, includeCharts: e.target.checked })}
                                        />
                                        Include Charts
                                    </label>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.includeTables}
                                            onChange={(e) => setFormData({ ...formData, includeTables: e.target.checked })}
                                        />
                                        Include Tables
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowGenerateModal(false)}
                            >
                                Batal
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleGenerateReport}
                            >
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Report Modal */}
            {selectedReport && (
                <div className="modal-overlay">
                    <div className="modal report-view-modal">
                        <div className="modal-header">
                            <h2>Report Details</h2>
                            <button
                                className="close-btn"
                                onClick={() => setSelectedReport(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="report-detail-item">
                                <label>Title:</label>
                                <span>{selectedReport.title}</span>
                            </div>
                            <div className="report-detail-item">
                                <label>Type:</label>
                                <span className="report-type-badge">{selectedReport.type}</span>
                            </div>
                            <div className="report-detail-item">
                                <label>Generated By:</label>
                                <span>{selectedReport.generatedBy}</span>
                            </div>
                            <div className="report-detail-item">
                                <label>Date:</label>
                                <span>{selectedReport.generatedDate}</span>
                            </div>
                            <div className="report-detail-item">
                                <label>Period:</label>
                                <span>{selectedReport.period}</span>
                            </div>
                            <div className="report-detail-item">
                                <label>Status:</label>
                                <span className={`status-badge ${getStatusColor(selectedReport.status)}`}>
                                    {selectedReport.status}
                                </span>
                            </div>
                            <div className="report-detail-item">
                                <label>File Size:</label>
                                <span>{selectedReport.fileSize}</span>
                            </div>
                            <div className="report-detail-item">
                                <label>Downloads:</label>
                                <span>{selectedReport.downloadCount}</span>
                            </div>
                            <div className="report-detail-item">
                                <label>Description:</label>
                                <span>{selectedReport.description}</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setSelectedReport(null)}
                            >
                                Close
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => handleDownloadReport(selectedReport)}
                                disabled={selectedReport.status !== 'completed'}
                            >
                                Download Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Report; 