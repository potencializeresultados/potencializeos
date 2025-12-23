import api from './api';
import { Ticket, TicketInteraction } from '../types';

export const SupportService = {
    getAll: async (): Promise<Ticket[]> => {
        const response = await api.get('/support/tickets/');
        return response.data;
    },

    getById: async (id: number): Promise<Ticket> => {
        const response = await api.get(`/support/tickets/${id}/`);
        return response.data;
    },

    create: async (data: Partial<Ticket>): Promise<Ticket> => {
        const response = await api.post('/support/tickets/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Ticket>): Promise<Ticket> => {
        const response = await api.patch(`/support/tickets/${id}/`, data);
        return response.data;
    },

    // Interactions
    addInteraction: async (ticketId: number, text: string, role: string): Promise<TicketInteraction> => {
        const response = await api.post('/support/interactions/', { ticket: ticketId, text, role });
        return response.data;
    }
};
