/**
 * Daftar RFID Component
 * Form untuk input Work Order, Style, Buyer dan memulai scanning RFID
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DaftarRFID.css';
import { useRFID } from '../../context/RFIDContext';
import ScanningModal from './ScanningModal';

const DaftarRFID = () => {
    const navigate = useNavigate();
    const { addScan } = useRFID();
    
    const [formData, setFormData] = useState({
        workOrder: '',
        style: '',
        buyer: ''
    });

    const [errors, setErrors] = useState({});
    const [showScanModal, setShowScanModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [scannedRfids, setScannedRfids] = useState([]); // Array untuk menyimpan RFID yang di-scan

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.workOrder.trim()) {
            newErrors.workOrder = 'No. Work Order harus diisi';
        } else if (formData.workOrder.trim().length < 2) {
            newErrors.workOrder = 'No. Work Order minimal 2 karakter';
        }

        if (!formData.style.trim()) {
            newErrors.style = 'Style harus diisi';
        } else if (formData.style.trim().length < 2) {
            newErrors.style = 'Style minimal 2 karakter';
        }

        if (!formData.buyer.trim()) {
            newErrors.buyer = 'Buyer harus diisi';
        } else if (formData.buyer.trim().length < 2) {
            newErrors.buyer = 'Buyer minimal 2 karakter';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle scan button click
    const handleScan = () => {
        if (validateForm()) {
            setShowScanModal(true);
        }
    };

    // Handle scan complete - LANGSUNG SIMPAN KE DATABASE (AUTO-SAVE)
    const handleScanComplete = async (rfidId) => {
        const scanTime = new Date().toISOString();
        
        // Tambahkan RFID ke list untuk display
        setScannedRfids(prev => [...prev, {
            id: rfidId,
            scanTime: scanTime
        }]);
        
        // LANGSUNG SAVE KE DATABASE
        try {
            const scanData = {
                rfidId: rfidId,
                workOrder: formData.workOrder,
                style: formData.style,
                buyer: formData.buyer,
                scanTime: scanTime
            };
            
            await addScan(scanData);
            console.log('✅ RFID auto-saved:', rfidId);
            
            // Show brief success indicator (optional)
            // bisa tambahkan flash green effect kalau mau
        } catch (error) {
            console.error('❌ Error auto-saving RFID:', error);
            // Hapus dari list jika gagal save
            setScannedRfids(prev => prev.filter(item => item.id !== rfidId));
            alert('⚠️ Gagal menyimpan RFID: ' + rfidId);
        }
        
        // Modal tetap terbuka untuk scan berikutnya
    };

    // Handle selesai scanning (semua RFID sudah auto-saved)
    const handleSaveAll = async () => {
        if (scannedRfids.length === 0) {
            alert('⚠️ Belum ada RFID yang di-scan!');
            return;
        }
        
        // Semua RFID sudah auto-saved, jadi tinggal close modal dan reset
        console.log(`✅ Selesai scanning ${scannedRfids.length} RFID (semua sudah tersimpan)`);
        
        // Close modal
        setShowScanModal(false);
        
        // Show success message
        setSuccessMessage(`✅ ${scannedRfids.length} RFID berhasil disimpan!`);
        
        // Reset form dan scanned list after 2 seconds
        setTimeout(() => {
            setFormData({
                workOrder: '',
                style: '',
                buyer: ''
            });
            setScannedRfids([]);
            setSuccessMessage('');
        }, 2000);
    };

    // Handle modal close
    const handleCloseModal = () => {
        // Reset scanned list jika user cancel
        setScannedRfids([]);
        setShowScanModal(false);
    };

    const isFormValid = formData.workOrder.trim() && 
                        formData.style.trim() && 
                        formData.buyer.trim();

    return (
        <div className="daftar-rfid-container">
            <div className="daftar-rfid-header">
                <h1>📋 Daftar RFID</h1>
                <p>Input informasi Work Order untuk scanning RFID</p>
            </div>

            <div className="rfid-form-card">
                {/* Success Message */}
                {successMessage && (
                    <div className="success-message-banner">
                        <span className="success-icon">✅</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="workOrder">
                        No. Work Order <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="workOrder"
                        name="workOrder"
                        value={formData.workOrder}
                        onChange={handleChange}
                        placeholder="Contoh: WO-2025-001"
                        className={errors.workOrder ? 'error' : ''}
                        disabled={isSubmitting}
                    />
                    {errors.workOrder && (
                        <span className="error-message">{errors.workOrder}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="style">
                        Style <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="style"
                        name="style"
                        value={formData.style}
                        onChange={handleChange}
                        placeholder="Contoh: Polo Shirt Basic"
                        className={errors.style ? 'error' : ''}
                        disabled={isSubmitting}
                    />
                    {errors.style && (
                        <span className="error-message">{errors.style}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="buyer">
                        Buyer <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="buyer"
                        name="buyer"
                        value={formData.buyer}
                        onChange={handleChange}
                        placeholder="Contoh: PT. Gistex Indonesia"
                        className={errors.buyer ? 'error' : ''}
                        disabled={isSubmitting}
                    />
                    {errors.buyer && (
                        <span className="error-message">{errors.buyer}</span>
                    )}
                </div>

                <button
                    className="scan-button"
                    onClick={handleScan}
                    disabled={!isFormValid || isSubmitting}
                >
                    <span className="scan-icon">📡</span>
                    <span>{isSubmitting ? 'Menyimpan...' : 'Scan RFID'}</span>
                </button>

                <div className="form-info">
                    <p>ℹ️ Pastikan semua field terisi dengan benar sebelum melakukan scan</p>
                </div>
            </div>

            {showScanModal && (
                <ScanningModal
                    onClose={handleCloseModal}
                    onScanComplete={handleScanComplete}
                    onSaveAll={handleSaveAll}
                    workOrderData={formData}
                    scannedRfids={scannedRfids}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
};

export default DaftarRFID;
