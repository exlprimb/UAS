// src/lib/axios.ts
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true, // WAJIB untuk mengirim cookie ke Laravel Sanctum
    headers: {
        'Accept': 'application/json',
    }
});

export default apiClient;