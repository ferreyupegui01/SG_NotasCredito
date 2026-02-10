// src/api/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

// Middleware para incluir el token en cada petición si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;