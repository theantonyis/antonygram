import axios from 'axios';
import Router from 'next/router';
import { getToken } from './getToken';
import nookies from "nookies";

const api = axios.create({
    baseURL: '/api',
});

api.interceptors.request.use((config) => {
    // На клієнті читаємо куки без контексту
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (typeof window !== 'undefined' && error.response && (error.response.status === 401 || error.response.status === 403)) {
            nookies.destroy(null, 'token');  // очистити куки
            Router.push('/login');
        }
        return Promise.reject(error);
    }
);

export default api;
