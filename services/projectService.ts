import api from './api';
import { Project, ProjectMeeting, ProjectDocument, ProjectNote } from '../types';

export const ProjectService = {
    getAll: async (): Promise<Project[]> => {
        const response = await api.get('/projects/projects/');
        return response.data;
    },

    getById: async (id: number): Promise<Project> => {
        const response = await api.get(`/projects/projects/${id}/`);
        return response.data;
    },

    create: async (data: Partial<Project>): Promise<Project> => {
        const response = await api.post('/projects/projects/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Project>): Promise<Project> => {
        const response = await api.patch(`/projects/projects/${id}/`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/projects/projects/${id}/`);
    },

    // Sub-resources
    getMeetings: async (projectId: number): Promise<ProjectMeeting[]> => {
        const response = await api.get(`/projects/meetings/?project=${projectId}`);
        return response.data;
    },

    getDocuments: async (projectId: number): Promise<ProjectDocument[]> => {
        const response = await api.get(`/projects/documents/?project=${projectId}`);
        return response.data;
    },

    getNotes: async (projectId: number): Promise<ProjectNote[]> => {
        const response = await api.get(`/projects/notes/?project=${projectId}`);
        return response.data;
    }
};
