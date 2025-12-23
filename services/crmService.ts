import api from './api';
import { Lead, Deal, Activity } from '../types';

export const CRMService = {
    // Leads
    getLeads: async (): Promise<Lead[]> => {
        const response = await api.get('/crm/leads/');
        return response.data;
    },
    createLead: async (data: Partial<Lead>): Promise<Lead> => {
        const response = await api.post('/crm/leads/', data);
        return response.data;
    },

    // Deals
    getDeals: async (): Promise<Deal[]> => {
        const response = await api.get('/crm/deals/');
        return response.data;
    },
    createDeal: async (data: Partial<Deal>): Promise<Deal> => {
        const response = await api.post('/crm/deals/', data);
        return response.data;
    },
    updateDeal: async (id: number, data: Partial<Deal>): Promise<Deal> => {
        const response = await api.patch(`/crm/deals/${id}/`, data);
        return response.data;
    },

    // Activities
    getActivities: async (): Promise<Activity[]> => {
        const response = await api.get('/crm/activities/');
        return response.data;
    },
    createActivity: async (data: Partial<Activity>): Promise<Activity> => {
        const response = await api.post('/crm/activities/', data);
        return response.data;
    }
};
