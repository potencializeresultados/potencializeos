import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, UserRole, LedgerEntry, ClientProfile } from '../types';
import { FinancialService } from '../services/financialService';
import { ClientService } from '../services/clientService';
import { DollarSign, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, TrendingUp, Calendar, Search } from 'lucide-react';

const Financial: React.FC = () => {
    const { user } = useOutletContext<{ user: User }>();
    const isManager = user.role === UserRole.MANAGER_CS_OPS || user.role === UserRole.SUPER_ADMIN;

    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [clients, setClients] = useState<ClientProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form
    const [newEntry, setNewEntry] = useState<Partial<LedgerEntry>>({
        type: 'credit',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        consultant: '',
        clientName: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [ledgerData, clientsData] = await Promise.all([
                FinancialService.getLedger(),
                ClientService.getAll()
            ]);
            setLedger(ledgerData);
            setClients(clientsData);
        } catch (error) {
            console.error("Failed to load financial data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const entryData = {
                ...newEntry,
                amount: Number(newEntry.amount),
                consultant: newEntry.consultant || user.name
            };
            const created = await FinancialService.addEntry(entryData);
            setLedger([created, ...ledger]);
            setIsAddModalOpen(false);
            setNewEntry({
                type: 'credit',
                amount: 0,
                description: '',
                date: new Date().toISOString().split('T')[0],
                consultant: '',
                clientName: ''
            });
            alert("Lançamento adicionado!");
        } catch (error) {
            console.error("Failed to add entry", error);
            alert("Erro ao adicionar lançamento.");
        }
    };

    const handleDeleteEntry = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
        try {
            await FinancialService.deleteEntry(id);
            setLedger(ledger.filter(l => l.id !== id));
        } catch (error) {
            console.error("Failed to delete entry", error);
            alert("Erro ao excluir lançamento.");
        }
    };

    // Calculations
    const totalCredit = ledger.filter(l => l.type === 'credit').reduce((acc, curr) => acc + curr.amount, 0);
    const totalDebit = ledger.filter(l => l.type === 'debit').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalCredit - totalDebit;

    if (!isManager) {
        return <div className="p-8 text-center text-gray-500">Acesso restrito ao Financeiro.</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-pot-petrol">Gestão Financeira (Banco de Horas)</h2>
                    <p className="text-sm text-gray-500">Controle de créditos e débitos de horas dos clientes.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-pot-success text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-green-700 transition-colors font-bold"
                >
                    <Plus size={18} className="mr-2" /> Novo Lançamento
                </button>
            </div>

            {/* Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase">Total Créditos</p>
                        <p className="text-3xl font-bold text-green-600">+{totalCredit.toFixed(1)}h</p>
                    </div>
                    <ArrowUpCircle size={32} className="text-green-200" />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase">Total Débitos</p>
                        <p className="text-3xl font-bold text-red-600">-{totalDebit.toFixed(1)}h</p>
                    </div>
                    <ArrowDownCircle size={32} className="text-red-200" />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-pot-petrol flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase">Saldo Geral</p>
                        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-pot-petrol' : 'text-red-600'}`}>
                            {balance.toFixed(1)}h
                        </p>
                    </div>
                    <TrendingUp size={32} className="text-gray-200" />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center">
                        <DollarSign size={18} className="mr-2 text-pot-orange" /> Histórico de Lançamentos
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Descrição</th>
                                <th className="px-6 py-3">Consultor</th>
                                <th className="px-6 py-3 text-right">Valor</th>
                                <th className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-400">Carregando...</td>
                                </tr>
                            ) : ledger.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-400">Nenhum lançamento encontrado.</td>
                                </tr>
                            ) : (
                                ledger.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(entry.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-700">
                                            {entry.clientName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${entry.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {entry.type === 'credit' ? 'Crédito' : 'Débito'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {entry.description}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {entry.consultant}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${entry.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {entry.type === 'credit' ? '+' : '-'}{entry.amount.toFixed(1)}h
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold flex items-center">
                                <Plus size={18} className="mr-2" /> Novo Lançamento
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="hover:text-gray-300">✕</button>
                        </div>
                        <form onSubmit={handleAddEntry} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Cliente</label>
                                <select
                                    required
                                    className="w-full border border-gray-300 rounded p-2 focus:border-pot-orange outline-none bg-white text-gray-900"
                                    value={newEntry.clientName}
                                    onChange={e => setNewEntry({ ...newEntry, clientName: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.companyName}>{c.companyName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Lançamento</label>
                                <div className="flex bg-gray-100 rounded p-1">
                                    <button
                                        type="button"
                                        className={`flex-1 py-2 text-sm font-bold rounded ${newEntry.type === 'credit' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                                        onClick={() => setNewEntry({ ...newEntry, type: 'credit' })}
                                    >
                                        Crédito (Entrada)
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 py-2 text-sm font-bold rounded ${newEntry.type === 'debit' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                                        onClick={() => setNewEntry({ ...newEntry, type: 'debit' })}
                                    >
                                        Débito (Saída)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Quantidade de Horas</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    className="w-full border border-gray-300 rounded p-2 focus:border-pot-orange outline-none"
                                    value={newEntry.amount}
                                    onChange={e => setNewEntry({ ...newEntry, amount: Number(e.target.value) })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded p-2 focus:border-pot-orange outline-none"
                                    placeholder="Ex: Consultoria Mensal, Ajuste Extra..."
                                    value={newEntry.description}
                                    onChange={e => setNewEntry({ ...newEntry, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Data</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border border-gray-300 rounded p-2 focus:border-pot-orange outline-none"
                                    value={newEntry.date}
                                    onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Responsável (Consultor)</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-2 focus:border-pot-orange outline-none"
                                    placeholder="Opcional"
                                    value={newEntry.consultant}
                                    onChange={e => setNewEntry({ ...newEntry, consultant: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-pot-petrol text-white font-bold py-3 rounded shadow hover:bg-gray-800 transition-colors mt-4"
                            >
                                Confirmar Lançamento
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Financial;
