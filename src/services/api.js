import axios from 'axios';

const api = axios.create({
    // Lê a URL da nuvem. Se não achar, usa o localhost de fallback.
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
});

export default api;