import api from './api';
import { Product } from '../types';

export const ProductService = {
    getAll: async (): Promise<Product[]> => {
        const response = await api.get('/products/products/');
        return response.data;
    },

    getById: async (id: number): Promise<Product> => {
        const response = await api.get(`/products/products/${id}/`);
        return response.data;
    },

    create: async (data: Partial<Product>): Promise<Product> => {
        const response = await api.post('/products/products/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Product>): Promise<Product> => {
        const response = await api.put(`/products/products/${id}/`, data);
        return response.data;
    }
};
