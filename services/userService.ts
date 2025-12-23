import api from './api';
import { User } from '../types';

export const UserService = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get('/core/users/');
        return response.data;
    },
    getById: async (id: number): Promise<User> => {
        const response = await api.get(`/core/users/${id}/`);
        return response.data;
    }
};
