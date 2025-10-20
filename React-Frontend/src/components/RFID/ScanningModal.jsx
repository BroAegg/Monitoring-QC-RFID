/**
 * Scanning Modal Component
 * Menampilkan animasi scanning RFID dan capture RFID ID
 * Mode Batch: Scan beberapa RFID sekaligus sebelum save
 */

import { useState, useEffect } from 'react';
import './ScanningModal.css';

const ScanningModal = ({ onClose, onScanComplete, onSaveAll, workOrderData, scannedRfids, isSubmitting }) => {
    const [lastScannedRfid, setLastScannedRfid] = useState('');
    const [showFlash, setShowFlash] = useState(false);

    // Auto scan simulation untuk demo (real implementation akan pakai serial reader)
    const handleScanSimulation = () => {
        const generatedRfid = generateRFIDId();
        
        // Flash effect untuk feedback visual
        setLastScannedRfid(generatedRfid);
        setShowFlash(true);
        
        // Add to list
        onScanComplete(generatedRfid);
        
        // Reset flash after animation
        setTimeout(() => {
            setShowFlash(false);
        }, 800);
    };

    // Generate random RFID ID
    const generateRFIDId = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `RF${year}${month}${day}${random}`;
    };

    return (
        <div className="scanning-modal-overlay">
            <div className="scanning-modal-content batch-mode" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>

                <div className="modal-header">
                    <h2>📡 Batch Scanning Mode</h2>
                    <p className="subtitle">Scan beberapa RFID sekaligus</p>
                </div>

                {/* Work Order Info */}
                <div className="work-order-info compact">
                    <div className="info-item">
                        <span className="info-label">WO:</span>
                        <span className="info-value">{workOrderData.workOrder}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Style:</span>
                        <span className="info-value">{workOrderData.style}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Buyer:</span>
                        <span className="info-value">{workOrderData.buyer}</span>
                    </div>
                </div>

                {/* Scan Area - Always Active */}
                <div className={`scan-area ${showFlash ? 'flash-success' : ''}`}>
                    <div className="scanning-active">
                        <div className="rfid-card-animation">
                            <div className="rfid-card">
                                <div className="card-chip"></div>
                                <div className="card-waves">
                                    <div className="wave"></div>
                                    <div className="wave"></div>
                                    <div className="wave"></div>
                                </div>
                                <div className="card-text">
                                    <div className="card-logo">RFID</div>
                                    <div className="card-number">●●●● ●●●● ●●●●</div>
                                </div>
                            </div>
                            <div className="scan-beam"></div>
                        </div>
                        <p className="scanning-text">🔍 Siap Scan - Dekatkan kartu RFID...</p>
                        
                        {/* Last Scanned Indicator */}
                        {lastScannedRfid && (
                            <div className="last-scanned-badge">
                                ✓ {lastScannedRfid}
                            </div>
                        )}
                        
                        {/* Demo Scan Button */}
                        <button 
                            className="scan-trigger-btn"
                            onClick={handleScanSimulation}
                            disabled={isSubmitting}
                        >
                            📡 Simulasi Scan (Demo)
                        </button>
                    </div>
                </div>

                {/* Scanned List */}
                <div className="scanned-list-container">
                    <div className="list-header">
                        <h3>📋 RFID yang Sudah di-Scan</h3>
                        <span className="count-badge">{scannedRfids.length}</span>
                    </div>
                    
                    {scannedRfids.length === 0 ? (
                        <div className="empty-list">
                            <p>Belum ada RFID yang di-scan</p>
                        </div>
                    ) : (
                        <div className="scanned-list">
                            {scannedRfids.map((rfid, index) => (
                                <div key={index} className="scanned-item">
                                    <span className="item-number">{index + 1}</span>
                                    <span className="item-rfid">{rfid.id}</span>
                                    <span className="item-time">
                                        {new Date(rfid.scanTime).toLocaleTimeString('id-ID')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="modal-actions">
                    <button 
                        className="cancel-btn"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        ❌ Batal
                    </button>
                    <button 
                        className="save-all-btn"
                        onClick={onSaveAll}
                        disabled={scannedRfids.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? '⏳ Menyimpan...' : `💾 Simpan Semua (${scannedRfids.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScanningModal;
