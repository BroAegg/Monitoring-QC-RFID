/**
 * RFID Service
 * API calls for RFID scanning operations
 */

import apiClient from './api';

const rfidService = {
    /**
     * Create new RFID scan record
     */
    createScan: async (scanData) => {
        try {
            const response = await apiClient.post('/rfid/scan', scanData);
            return {
                success: true,
                data: response.data,
                message: 'RFID scan saved successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to save RFID scan'
            };
        }
    },

    /**
     * Get all RFID scans
     */
    getAllScans: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/rfid/scans?${params}`);
            return {
                success: true,
                data: response.data,
                message: 'Scans retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch scans'
            };
        }
    },

    /**
     * Get RFID scan by ID
     */
    getScanById: async (id) => {
        try {
            const response = await apiClient.get(`/rfid/scans/${id}`);
            return {
                success: true,
                data: response.data,
                message: 'Scan retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch scan'
            };
        }
    },

    /**
     * Update RFID scan
     */
    updateScan: async (id, updateData) => {
        try {
            const response = await apiClient.put(`/rfid/scans/${id}`, updateData);
            return {
                success: true,
                data: response.data,
                message: 'Scan updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to update scan'
            };
        }
    },

    /**
     * Delete RFID scan
     */
    deleteScan: async (id) => {
        try {
            const response = await apiClient.delete(`/rfid/scans/${id}`);
            return {
                success: true,
                data: response.data,
                message: 'Scan deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to delete scan'
            };
        }
    },

    /**
     * Get scan statistics
     */
    getStatistics: async () => {
        try {
            const response = await apiClient.get('/rfid/statistics');
            return {
                success: true,
                data: response.data,
                message: 'Statistics retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch statistics'
            };
        }
    }
};

export default rfidService;
