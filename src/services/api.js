import axios from 'axios';

const api = axios.create({
    // Já adicionamos o prefixo global do Java aqui no final da URL base
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api/logistica/ordens'
});

export default api;