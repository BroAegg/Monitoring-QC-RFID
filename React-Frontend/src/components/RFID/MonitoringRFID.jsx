/**
 * Monitoring RFID Component
 * Dashboard untuk melihat dan manage data RFID yang sudah discan
 */

import { useState, useEffect, useCallback } from 'react';
import './MonitoringRFID.css';
import { useRFID } from '../../context/RFIDContext';

const MonitoringRFID = () => {
    const { scans, getStatistics } = useRFID();
    const [notification, setNotification] = useState(null); // Toast notification state
    
    // QC Checkpoint counters - 2 rows (QC Endline & PQC)
    const [qcCounters, setQcCounters] = useState({
        sewingOutput: 10, // Default 10 sesuai data simulasi baru
        // QC Endline (Row 1)
        endline: {
            reject: 0,
            rework: 0,
            hasper: 0,
            qcPass: 0
        },
        // PQC (Row 2)
        pqc: {
            reject: 0,
            rework: 0,
            hasper: 0,
            qcPass: 0
        }
    });

    // Update sewing output when scans change
    useEffect(() => {
        setQcCounters(prev => ({
            ...prev,
            sewingOutput: scans.length
        }));
    }, [scans]);

    // Handle QC checkpoint increment - NO DELAY, instant response
    const handleQcIncrement = useCallback((rowType, checkpointType) => {
        console.log(`Processing: ${rowType} - ${checkpointType}`);

        setQcCounters(prev => {
            // Calculate total dari kedua row
            const totalEndline = prev.endline.reject + prev.endline.rework + 
                               prev.endline.hasper + prev.endline.qcPass;
            const totalPqc = prev.pqc.reject + prev.pqc.rework + 
                            prev.pqc.hasper + prev.pqc.qcPass;
            const currentTotal = totalEndline + totalPqc;
            
            // Validasi: total checkpoint tidak boleh melebihi sewing output
            if (currentTotal >= prev.sewingOutput) {
                // Show toast notification
                showNotification({
                    type: 'error',
                    title: '⚠️ Limit Tercapai!',
                    message: `Total checkpoint (${currentTotal}) sudah mencapai Sewing Output (${prev.sewingOutput})`
                });
                return prev; // Return previous state, no changes
            }

            const newCounters = { ...prev };
            
            // Logic untuk Rework/Hasper toggle
            if (checkpointType === 'rework') {
                // Klik Rework: +1 Rework, -1 Hasper (jika ada)
                newCounters[rowType].rework = prev[rowType].rework + 1;
                if (prev[rowType].hasper > 0) {
                    newCounters[rowType].hasper = prev[rowType].hasper - 1;
                }
            } else if (checkpointType === 'hasper') {
                // Klik Hasper: +1 Hasper, -1 Rework (jika ada)
                newCounters[rowType].hasper = prev[rowType].hasper + 1;
                if (prev[rowType].rework > 0) {
                    newCounters[rowType].rework = prev[rowType].rework - 1;
                }
            } else {
                // Reject dan QC Pass: hanya +1
                newCounters[rowType][checkpointType] = prev[rowType][checkpointType] + 1;
            }
            
            return newCounters;
        });
    }, []);

    // Show toast notification
    const showNotification = (notifData) => {
        setNotification(notifData);
        
        // Play sound alert
        const audio = new Audio('data:audio/wav;base64,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');
        audio.play().catch(() => {}); // Ignore errors if audio fails
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            setNotification(null);
        }, 4000);
    };

    // Calculate total QC Pass (Row 1 + Row 2)
    const totalQcPass = qcCounters.endline.qcPass + qcCounters.pqc.qcPass;

    return (
        <div className="monitoring-rfid-container">
            {/* Toast Notification */}
            {notification && (
                <div className={`toast-notification ${notification.type}`}>
                    <div className="toast-icon">
                        {notification.type === 'error' ? '⚠️' : '✅'}
                    </div>
                    <div className="toast-content">
                        <div className="toast-title">{notification.title}</div>
                        <div className="toast-message">{notification.message}</div>
                    </div>
                    <button 
                        className="toast-close"
                        onClick={() => setNotification(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="monitoring-header">
                <div className="header-content">
                    <h1>📊 Monitoring RFID - QC Dashboard</h1>
                    <p>Real-time QC Checkpoint Monitoring</p>
                </div>
            </div>

            {/* QC Checkpoint Section */}
            <div className="qc-checkpoint-section">
                <div className="qc-section-header">
                    <h2 className="qc-section-title">🎯 QC Checkpoint Monitor</h2>
                </div>
                
                {/* Sewing Output Display */}
                <div className="sewing-output-card">
                    <div className="sewing-output-content">
                        <span className="sewing-output-label">SEWING OUTPUT</span>
                        <span className="sewing-output-value">{qcCounters.sewingOutput}</span>
                    </div>
                </div>

                {/* QC Endline (Row 1) */}
                <div className="qc-row-container">
                    <h3 className="qc-row-title">
                        <span className="row-indicator endline-indicator"></span>
                        QC Endline
                    </h3>
                    <div className="qc-checkpoint-grid">
                        <button 
                            className="qc-checkpoint-btn reject-btn"
                            onClick={() => handleQcIncrement('endline', 'reject')}
                            title="Reject: +1 (Produk ditolak)"
                        >
                            <div className="qc-btn-label">REJECT</div>
                            <div className="qc-btn-value">{qcCounters.endline.reject}</div>
                        </button>

                        <button 
                            className="qc-checkpoint-btn rework-btn"
                            onClick={() => handleQcIncrement('endline', 'rework')}
                            title="Rework: +1 (Hasper -1 jika ada)"
                        >
                            <div className="qc-btn-label">REWORK</div>
                            <div className="qc-btn-value">{qcCounters.endline.rework}</div>
                        </button>

                        <button 
                            className="qc-checkpoint-btn hasper-btn"
                            onClick={() => handleQcIncrement('endline', 'hasper')}
                            title="Hasper: +1 (Rework -1 jika ada)"
                        >
                            <div className="qc-btn-label">HASPER</div>
                            <div className="qc-btn-value">{qcCounters.endline.hasper}</div>
                        </button>

                        <button 
                            className="qc-checkpoint-btn qcpass-btn"
                            onClick={() => handleQcIncrement('endline', 'qcPass')}
                            title="QC Pass: +1 (Produk lolos QC)"
                        >
                            <div className="qc-btn-label">QC PASS</div>
                            <div className="qc-btn-value">{qcCounters.endline.qcPass}</div>
                        </button>
                    </div>
                </div>

                {/* PQC (Row 2) */}
                <div className="qc-row-container">
                    <h3 className="qc-row-title">
                        <span className="row-indicator pqc-indicator"></span>
                        PQC
                    </h3>
                    <div className="qc-checkpoint-grid">
                        <button 
                            className="qc-checkpoint-btn reject-btn"
                            onClick={() => handleQcIncrement('pqc', 'reject')}
                            title="Reject: +1 (Produk ditolak)"
                        >
                            <div className="qc-btn-label">REJECT</div>
                            <div className="qc-btn-value">{qcCounters.pqc.reject}</div>
                        </button>

                        <button 
                            className="qc-checkpoint-btn rework-btn"
                            onClick={() => handleQcIncrement('pqc', 'rework')}
                            title="Rework: +1 (Hasper -1 jika ada)"
                        >
                            <div className="qc-btn-label">REWORK</div>
                            <div className="qc-btn-value">{qcCounters.pqc.rework}</div>
                        </button>

                        <button 
                            className="qc-checkpoint-btn hasper-btn"
                            onClick={() => handleQcIncrement('pqc', 'hasper')}
                            title="Hasper: +1 (Rework -1 jika ada)"
                        >
                            <div className="qc-btn-label">HASPER</div>
                            <div className="qc-btn-value">{qcCounters.pqc.hasper}</div>
                        </button>

                        <button 
                            className="qc-checkpoint-btn qcpass-btn"
                            onClick={() => handleQcIncrement('pqc', 'qcPass')}
                            title="QC Pass: +1 (Produk lolos QC)"
                        >
                            <div className="qc-btn-label">QC PASS</div>
                            <div className="qc-btn-value">{qcCounters.pqc.qcPass}</div>
                        </button>
                    </div>
                </div>

                {/* Total QC Pass Display */}
                <div className="total-qcpass-card">
                    <div className="total-qcpass-content">
                        <span className="total-qcpass-label">TOTAL QC PASS</span>
                        <span className="total-qcpass-value">{totalQcPass}</span>
                    </div>
                </div>

                {/* Progress Info */}
                <div className="qc-progress-info">
                    <span className="progress-label">Total Checkpoint:</span>
                    <span className="progress-value">
                        {qcCounters.endline.reject + qcCounters.endline.rework + qcCounters.endline.hasper + qcCounters.endline.qcPass +
                         qcCounters.pqc.reject + qcCounters.pqc.rework + qcCounters.pqc.hasper + qcCounters.pqc.qcPass} / {qcCounters.sewingOutput}
                    </span>
                </div>
            </div>

        </div>
    );
};

export default MonitoringRFID;
