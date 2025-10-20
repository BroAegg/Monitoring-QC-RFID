/**
 * RFID Context - Shared state for RFID scans
 */

import { createContext, useContext, useState } from 'react';

const RFIDContext = createContext();

export const useRFID = () => {
    const context = useContext(RFIDContext);
    if (!context) {
        throw new Error('useRFID must be used within RFIDProvider');
    }
    return context;
};

export const RFIDProvider = ({ children }) => {
    const [scans, setScans] = useState([
        // 10 Mock data untuk simulasi
        {
            id: 1,
            rfidId: 'RF20251019001',
            workOrder: 'WO-2025-001',
            style: 'POLO-SHIRT-XL-BLUE',
            buyer: 'NIKE USA',
            scanTime: '2025-10-19 08:30:15'
        },
        {
            id: 2,
            rfidId: 'RF20251019002',
            workOrder: 'WO-2025-001',
            style: 'POLO-SHIRT-XL-BLUE',
            buyer: 'NIKE USA',
            scanTime: '2025-10-19 08:35:20'
        },
        {
            id: 3,
            rfidId: 'RF20251019003',
            workOrder: 'WO-2025-002',
            style: 'T-SHIRT-M-BLACK',
            buyer: 'ADIDAS EU',
            scanTime: '2025-10-19 09:15:30'
        },
        {
            id: 4,
            rfidId: 'RF20251019004',
            workOrder: 'WO-2025-002',
            style: 'T-SHIRT-M-BLACK',
            buyer: 'ADIDAS EU',
            scanTime: '2025-10-19 09:20:45'
        },
        {
            id: 5,
            rfidId: 'RF20251019005',
            workOrder: 'WO-2025-003',
            style: 'JACKET-L-NAVY',
            buyer: 'PUMA ASIA',
            scanTime: '2025-10-19 10:00:00'
        },
        {
            id: 6,
            rfidId: 'RF20251019006',
            workOrder: 'WO-2025-003',
            style: 'JACKET-L-NAVY',
            buyer: 'PUMA ASIA',
            scanTime: '2025-10-19 10:10:30'
        },
        {
            id: 7,
            rfidId: 'RF20251019007',
            workOrder: 'WO-2025-004',
            style: 'HOODIE-XL-GRAY',
            buyer: 'UNDER ARMOUR',
            scanTime: '2025-10-19 11:00:15'
        },
        {
            id: 8,
            rfidId: 'RF20251019008',
            workOrder: 'WO-2025-004',
            style: 'HOODIE-XL-GRAY',
            buyer: 'UNDER ARMOUR',
            scanTime: '2025-10-19 11:10:20'
        },
        {
            id: 9,
            rfidId: 'RF20251019009',
            workOrder: 'WO-2025-005',
            style: 'SHORTS-S-RED',
            buyer: 'REEBOK GLOBAL',
            scanTime: '2025-10-19 12:00:00'
        },
        {
            id: 10,
            rfidId: 'RF20251019010',
            workOrder: 'WO-2025-005',
            style: 'SHORTS-S-RED',
            buyer: 'REEBOK GLOBAL',
            scanTime: '2025-10-19 12:15:45'
        }
    ]);

    // Add new scan
    const addScan = (scanData) => {
        const newScan = {
            id: scans.length + 1,
            ...scanData,
            scanTime: new Date().toLocaleString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).replace(/\//g, '-'),
            qcStatus: {
                endline: {
                    reject: 0,
                    rework: 0,
                    hasper: 0,
                    qcPass: 0
                },
                pqc: {
                    reject: 0,
                    rework: 0,
                    hasper: 0,
                    qcPass: 0
                }
            },
            sewingOutput: 0
        };
        setScans([newScan, ...scans]);
        return newScan;
    };

    // Update scan QC status
    const updateScanQC = (scanId, qcStatus) => {
        setScans(scans.map(scan => 
            scan.id === scanId 
                ? { ...scan, qcStatus, sewingOutput: qcStatus.sewingOutput || scan.sewingOutput }
                : scan
        ));
    };

    // Delete scan
    const deleteScan = (scanId) => {
        setScans(scans.filter(scan => scan.id !== scanId));
    };

    // Get statistics
    const getStatistics = () => {
        const totalScans = scans.length;
        const totalOutput = scans.reduce((sum, scan) => sum + scan.sewingOutput, 0);
        const totalQcPass = scans.reduce((sum, scan) => 
            sum + (scan.qcStatus?.endline?.qcPass || 0) + (scan.qcStatus?.pqc?.qcPass || 0), 0
        );
        const totalReject = scans.reduce((sum, scan) => 
            sum + (scan.qcStatus?.endline?.reject || 0) + (scan.qcStatus?.pqc?.reject || 0), 0
        );

        return {
            totalScans,
            totalOutput,
            totalQcPass,
            totalReject,
            avgQcPass: totalScans > 0 ? Math.round(totalQcPass / totalScans) : 0
        };
    };

    const value = {
        scans,
        addScan,
        updateScanQC,
        deleteScan,
        getStatistics
    };

    return (
        <RFIDContext.Provider value={value}>
            {children}
        </RFIDContext.Provider>
    );
};
