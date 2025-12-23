import api from './api';
import { LedgerEntry } from '../types';

export const FinancialService = {
    getLedger: async (): Promise<LedgerEntry[]> => {
        const response = await api.get('/financial/ledger/');
        return response.data;
    },

    addEntry: async (data: Partial<LedgerEntry>): Promise<LedgerEntry> => {
        const response = await api.post('/financial/ledger/', data);
        return response.data;
    },

    deleteEntry: async (id: number): Promise<void> => {
        await api.delete(`/financial/ledger/${id}/`);
    }
};
