/**
 * Service API untuk koneksi dengan backend MERN
 * Mengelola semua request HTTP ke server backend
 */

import axios from 'axios';

// Konfigurasi base URL untuk API backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Membuat instance axios dengan konfigurasi default
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 detik timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor untuk request
api.interceptors.request.use(
    (config) => {
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor untuk response
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// ------------------- RFID SCAN API -------------------

/**
 * Mengambil semua data scan RFID
 * @returns {Promise} Response dengan daftar scan RFID
 */
export const getAllScans = async () => {
    try {
        const response = await api.get('/api/scans');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil data scans');
    }
};

/**
 * Mengambil data scan RFID berdasarkan UID
 * @param {string} uid - UID kartu RFID
 * @returns {Promise} Response dengan data scan
 */
export const getScanByUid = async (uid) => {
    try {
        const response = await api.get(`/api/scans/${uid}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil data scan');
    }
};

/**
 * Menambahkan scan RFID manual (untuk testing)
 * @param {string} uid - UID kartu RFID
 * @returns {Promise} Response dengan data scan yang dibuat
 */
export const addScanManual = async (uid) => {
    try {
        const response = await api.post('/api/scans', { uid });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal menambahkan scan');
    }
};

/**
 * Menghapus data scan RFID
 * @param {string} id - ID data scan di database
 * @returns {Promise} Response konfirmasi penghapusan
 */
export const deleteScan = async (id) => {
    try {
        const response = await api.delete(`/api/scans/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal menghapus scan');
    }
};

// ------------------- EMPLOYEE/ID CARD API -------------------

/**
 * Mengambil semua data karyawan
 * @param {Object} filters - Filter untuk pencarian (search, bagian, line, status)
 * @returns {Promise} Response dengan daftar karyawan
 */
export const getAllEmployees = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        const response = await api.get(`/api/employees?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil data karyawan');
    }
};

/**
 * Mengambil data karyawan berdasarkan ID
 * @param {string} id - ID karyawan
 * @returns {Promise} Response dengan data karyawan
 */
export const getEmployeeById = async (id) => {
    try {
        const response = await api.get(`/api/employees/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil data karyawan');
    }
};

/**
 * Menambahkan karyawan baru
 * @param {Object} employeeData - Data karyawan (idCard, nama, nik, bagian, line, fasilitas)
 * @returns {Promise} Response dengan data karyawan yang dibuat
 */
export const addEmployee = async (employeeData) => {
    try {
        const response = await api.post('/api/employees', employeeData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal menambahkan karyawan');
    }
};

/**
 * Mengupdate data karyawan
 * @param {string} id - ID karyawan
 * @param {Object} employeeData - Data karyawan yang akan diupdate
 * @returns {Promise} Response dengan data karyawan yang diupdate
 */
export const updateEmployee = async (id, employeeData) => {
    try {
        const response = await api.put(`/api/employees/${id}`, employeeData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal mengupdate karyawan');
    }
};

/**
 * Menghapus karyawan
 * @param {string} id - ID karyawan
 * @returns {Promise} Response konfirmasi penghapusan
 */
export const deleteEmployee = async (id) => {
    try {
        const response = await api.delete(`/api/employees/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal menghapus karyawan');
    }
};

/**
 * Mengambil statistik karyawan
 * @returns {Promise} Response dengan data statistik
 */
export const getEmployeeStats = async () => {
    try {
        const response = await api.get('/api/employees/stats/overview');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil statistik karyawan');
    }
};

// ------------------- UTILITY FUNCTIONS -------------------

/**
 * Mencari karyawan berdasarkan keyword
 * @param {string} keyword - Keyword pencarian
 * @returns {Promise} Response dengan hasil pencarian
 */
export const searchEmployees = async (keyword) => {
    try {
        return await getAllEmployees({ search: keyword });
    } catch (error) {
        throw new Error('Gagal melakukan pencarian karyawan');
    }
};

/**
 * Mengambil daftar bagian/departemen yang unik
 * @returns {Promise} Response dengan daftar bagian
 */
export const getDepartments = async () => {
    try {
        // Ini bisa diganti dengan endpoint khusus jika diperlukan
        const employees = await getAllEmployees();
        const departments = [...new Set(employees.data.map(emp => emp.bagian))].sort();
        return { success: true, data: departments };
    } catch (error) {
        throw new Error('Gagal mengambil daftar bagian');
    }
};

/**
 * Mengambil daftar line produksi yang unik
 * @returns {Promise} Response dengan daftar line
 */
export const getProductionLines = async () => {
    try {
        // Ini bisa diganti dengan endpoint khusus jika diperlukan
        const employees = await getAllEmployees();
        const lines = [...new Set(employees.data.map(emp => emp.line))].sort();
        return { success: true, data: lines };
    } catch (error) {
        throw new Error('Gagal mengambil daftar line produksi');
    }
};

/**
 * Health check untuk memastikan backend berjalan
 * @returns {Promise} Response status backend
 */
export const healthCheck = async () => {
    try {
        const response = await api.get('/api/health');
        return response.data;
    } catch (error) {
        throw new Error('Backend tidak dapat dijangkau');
    }
};

export default api; 