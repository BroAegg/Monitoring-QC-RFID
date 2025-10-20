/**
 * List ID Component
 * Menampilkan daftar semua RFID ID yang sudah di-scan (dengan Table View)
 */

import { useState } from 'react';
import './ListID.css';
import { useRFID } from '../../context/RFIDContext';

const ListID = () => {
    const { scans, deleteScan } = useRFID();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBuyer, setFilterBuyer] = useState('');
    const [selectedScan, setSelectedScan] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString.replace(/-/g, '/'));
        return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Filter data
    const filteredScans = scans.filter(scan => {
        const matchSearch = scan.rfidId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scan.workOrder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scan.style?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchBuyer = !filterBuyer || scan.buyer === filterBuyer;
        
        return matchSearch && matchBuyer;
    });

    // Get unique buyers for filter
    const uniqueBuyers = [...new Set(scans.map(scan => scan.buyer))];

    // Handle view details
    const handleView = (scan) => {
        setSelectedScan(scan);
        setShowModal(true);
    };

    // Handle close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedScan(null);
    };

    // Handle delete
    const handleDelete = (id) => {
        if (window.confirm('⚠️ Apakah Anda yakin ingin menghapus data ini?\n\nData yang dihapus tidak dapat dikembalikan.')) {
            deleteScan(id);
            // Show success notification
            showNotification('✅ Data berhasil dihapus!');
        }
    };

    // Show notification
    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'toast-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    };

    return (
        <div className="list-id-container">
            <div className="list-id-header">
                <div className="header-content">
                    <h1>📄 List ID - Data RFID</h1>
                    <p>Daftar lengkap semua RFID ID yang telah di-scan</p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge">
                        <span className="stat-label">Total ID:</span>
                        <span className="stat-number">{scans.length}</span>
                    </div>
                </div>
            </div>

            <div className="filter-section">
                <div className="search-box">
                    <span className="search-icon"></span>
                    <input
                        type="text"
                        placeholder="Search by RFID ID, Work Order, or Style..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filterBuyer}
                    onChange={(e) => setFilterBuyer(e.target.value)}
                >
                    <option value="">All Buyers</option>
                    {uniqueBuyers.map(buyer => (
                        <option key={buyer} value={buyer}>{buyer}</option>
                    ))}
                </select>
            </div>

            {filteredScans.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"></div>
                    <h3>Tidak ada data</h3>
                    <p>Belum ada data RFID yang discan atau tidak ditemukan dengan filter yang dipilih</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="rfid-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>RFID ID</th>
                                <th>Work Order</th>
                                <th>Style</th>
                                <th>Buyer</th>
                                <th>Scanned At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredScans.map((scan, index) => (
                                <tr key={scan.id} className="table-row">
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="rfid-badge">{scan.rfidId}</span>
                                    </td>
                                    <td>{scan.workOrder}</td>
                                    <td>{scan.style}</td>
                                    <td>{scan.buyer}</td>
                                    <td>
                                        <span className="date-text">{formatDate(scan.scanTime)}</span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="action-btn view-btn"
                                                onClick={() => handleView(scan)}
                                                title="View Details"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            </button>
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(scan.id)}
                                                title="Delete"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {showModal && selectedScan && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📋 Detail RFID Scan</h2>
                            <button className="close-btn" onClick={handleCloseModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <span className="detail-label">RFID ID:</span>
                                <span className="detail-value rfid-badge">{selectedScan.rfidId}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Work Order:</span>
                                <span className="detail-value">{selectedScan.workOrder}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Style:</span>
                                <span className="detail-value">{selectedScan.style}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Buyer:</span>
                                <span className="detail-value">{selectedScan.buyer}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Scanned At:</span>
                                <span className="detail-value">{formatDate(selectedScan.scanTime)}</span>
                            </div>
                            {selectedScan.qcStatus && (
                                <div className="detail-row">
                                    <span className="detail-label">QC Status:</span>
                                    <span className={`qc-status-badge ${selectedScan.qcStatus.toLowerCase()}`}>
                                        {selectedScan.qcStatus}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn close-modal-btn" onClick={handleCloseModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListID;
