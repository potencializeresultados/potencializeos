import api from './api';
import { Task, SubTask } from '../types';

export const TaskService = {
    getAll: async (): Promise<Task[]> => {
        const response = await api.get('/tasks/all/');
        return response.data;
    },

    getById: async (id: number): Promise<Task> => {
        const response = await api.get(`/tasks/all/${id}/`);
        return response.data;
    },

    create: async (data: Partial<Task>): Promise<Task> => {
        const response = await api.post('/tasks/all/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Task>): Promise<Task> => {
        const response = await api.patch(`/tasks/all/${id}/`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/tasks/all/${id}/`);
    },

    // SubTasks
    createSubTask: async (data: Partial<SubTask>): Promise<SubTask> => {
        const response = await api.post('/tasks/subtasks/', data);
        return response.data;
    },

    toggleSubTask: async (id: number, completed: boolean): Promise<SubTask> => {
        const response = await api.patch(`/tasks/subtasks/${id}/`, { completed });
        return response.data;
    },

    deleteSubTask: async (id: number): Promise<void> => {
        await api.delete(`/tasks/subtasks/${id}/`);
    }
};
