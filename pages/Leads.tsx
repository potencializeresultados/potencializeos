
import React, { useState } from 'react';
import { MOCK_LEADS, MOCK_DEALS } from '../constants';
import { Lead, Deal } from '../types';
import { Plus, User, Building, Mail, Phone, ArrowRight, Trash2, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', company: '', email: '', phone: '' });
  const navigate = useNavigate();

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Lead = {
      id: Math.random(),
      ...newLead,
      status: 'Novo',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeads([...leads, created]);
    setIsModalOpen(false);
    setNewLead({ name: '', company: '', email: '', phone: '' });
  };

  const handleConvertToDeal = (lead: Lead) => {
    // Create a new Deal object based on the Lead
    const newDeal: Deal = {
      id: Math.floor(Math.random() * 100000),
      title: `Oportunidade - ${lead.company}`,
      company: lead.company,
      value: 0, // Valor inicial zero, a ser definido no CRM
      stage: 'Lead', // Entra na primeira etapa do funil
      productInterest: 'Diagnóstico', // Produto padrão inicial
      owner: 'A definir'
    };

    // Add to mock database directly so it persists
    MOCK_DEALS.push(newDeal);

    // Navigate to Deal Details for configuration instead of Pipeline view
    navigate(`/crm/${newDeal.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-pot-petrol">Cadastro de Leads</h2>
          <p className="text-sm text-gray-500">Cadastre contatos iniciais antes de virarem oportunidades.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-pot-orange text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} className="mr-2" />
          Novo Lead
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contatos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                      <User size={20} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{lead.name}</div>
                      <div className="text-xs text-gray-500">Cadastrado em: {new Date(lead.createdAt).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 font-medium">
                    <Building size={16} className="text-gray-400 mr-2" />
                    {lead.company}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 flex flex-col gap-1">
                    <span className="flex items-center"><Mail size={14} className="mr-2 text-gray-400"/> {lead.email}</span>
                    <span className="flex items-center"><Phone size={14} className="mr-2 text-gray-400"/> {lead.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    lead.status === 'Novo' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleConvertToDeal(lead)}
                    className="text-pot-success hover:text-green-900 bg-green-50 px-3 py-1.5 rounded-md border border-green-200 hover:bg-green-100 transition-colors mr-2 inline-flex items-center font-bold"
                    title="Converter em Negócio"
                  >
                    Virar Negócio <ArrowRight size={14} className="ml-1" />
                  </button>
                  <button className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center">
               <h3 className="text-lg font-bold text-white flex items-center">
                 <User size={20} className="mr-2" />
                 Novo Lead
               </h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleCreateLead} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Nome - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      required 
                      type="text" 
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none transition-shadow bg-white text-gray-900" 
                      placeholder="Ex: João Silva"
                      value={newLead.name} 
                      onChange={e => setNewLead({...newLead, name: e.target.value})} 
                    />
                  </div>
                </div>
                
                {/* Empresa - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      required 
                      type="text" 
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none transition-shadow bg-white text-gray-900" 
                      placeholder="Nome da Empresa"
                      value={newLead.company} 
                      onChange={e => setNewLead({...newLead, company: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Contatos - Row Split */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      required 
                      type="email" 
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none transition-shadow bg-white text-gray-900" 
                      placeholder="contato@email.com"
                      value={newLead.email} 
                      onChange={e => setNewLead({...newLead, email: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      required 
                      type="text" 
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none transition-shadow bg-white text-gray-900" 
                      placeholder="(00) 00000-0000"
                      value={newLead.phone} 
                      onChange={e => setNewLead({...newLead, phone: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-pot-orange text-white rounded-lg hover:bg-orange-600 text-sm font-bold shadow-md flex items-center transition-colors"
                >
                  <Check size={18} className="mr-2" />
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
