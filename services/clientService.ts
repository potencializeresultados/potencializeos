import api from './api';
import { ClientProfile } from '../types';

export const ClientService = {
    getAll: async (): Promise<ClientProfile[]> => {
        const response = await api.get('/clients/profiles/');
        return response.data;
    },

    getById: async (id: number): Promise<ClientProfile> => {
        const response = await api.get(`/clients/profiles/${id}/`);
        return response.data;
    },

    create: async (data: Partial<ClientProfile>): Promise<ClientProfile> => {
        const response = await api.post('/clients/profiles/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<ClientProfile>): Promise<ClientProfile> => {
        const response = await api.patch(`/clients/profiles/${id}/`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/clients/profiles/${id}/`);
    }
};
