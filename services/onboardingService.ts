import api from './api';
import { OnboardingItem, OnboardingTask, OnboardingNote } from '../types';

export const OnboardingService = {
    getItems: async (): Promise<OnboardingItem[]> => {
        const response = await api.get('/onboarding/items/');
        return response.data;
    },

    createItem: async (data: Partial<OnboardingItem>): Promise<OnboardingItem> => {
        const response = await api.post('/onboarding/items/', data);
        return response.data;
    },

    updateItem: async (id: number, data: Partial<OnboardingItem>): Promise<OnboardingItem> => {
        const response = await api.patch(`/onboarding/items/${id}/`, data);
        return response.data;
    },

    // Tasks
    getTasks: async (onboardingId: number): Promise<OnboardingTask[]> => {
        const response = await api.get(`/onboarding/tasks/?onboarding=${onboardingId}`);
        return response.data;
    },

    // Notes
    getNotes: async (onboardingId: number): Promise<OnboardingNote[]> => {
        const response = await api.get(`/onboarding/notes/?onboarding=${onboardingId}`);
        return response.data;
    }
};
