import axios from 'axios';

// Configuración de URL base
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, "");

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 1. AUTENTICACIÓN
export const authService = {
    login: async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        return data;
    }
};

// 2. REGISTROS
export const registryService = {
    getRegistries: async (queryString = '') => {
        const { data } = await api.get(`/registros${queryString}`);
        return data;
    },
    create: async (formData) => {
        const { data } = await api.post('/registros', formData);
        return data; 
    },
    uploadFile: async (fileData) => {
        const { data } = await api.post('/registros/upload', fileData, {
            headers: { 'Content-Type': 'multipart/form-data' } 
        });
        return data;
    },
    delete: async (id) => {
        const { data } = await api.delete(`/registros/${id}`);
        return data;
    },
    // --- NUEVO: OBTENER ARCHIVO SEGURO ---
    viewFileSecure: async (filename) => {
        const response = await api.get(`/registros/archivo/${filename}`, {
            responseType: 'blob' // Importante: esperamos binario
        });
        return response.data;
    }
};

// 3. USUARIOS
export const userService = {
    getAll: async () => {
        const { data } = await api.get('/users');
        return data;
    },
    create: async (userData) => {
        const { data } = await api.post('/users', userData);
        return data;
    },
    update: async (id, userData) => {
        const { data } = await api.put(`/users/${id}`, userData);
        return data;
    },
    toggleStatus: async (id, status) => {
        const { data } = await api.patch(`/users/${id}/status`, { activo: status });
        return data;
    }
};

export default api;