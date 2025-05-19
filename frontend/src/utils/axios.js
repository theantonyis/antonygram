import axios from 'axios';
import Router from 'next/router';
import { getToken } from './getToken';
import { deleteCookie } from 'cookies-next';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + '/api',
});

api.interceptors.request.use((config) => {
    // On the client, get cookie without context
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (
            typeof window !== 'undefined' &&
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
        ) {
            deleteCookie('token'); // ⬅ replaced nookies.destroy
            Router.push('/login');
        }
        return Promise.reject(error);
    }
);

export default api;
