import api from './api';
import { User } from '../types';

export const AuthService = {
    login: async (username: string, password: string): Promise<{ access: string; refresh: string }> => {
        const response = await api.post('/token/', { username, password });
        return response.data;
    },

    me: async (): Promise<User> => {
        const response = await api.get('/core/users/me/');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    }
};
