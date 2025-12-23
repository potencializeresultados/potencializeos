import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { MOCK_USERS, MOCK_PRODUCTS } from '../constants';
import { Lead, Deal, UserRole, ActivityType, Activity, OnboardingItem, User } from '../types';
import { CRMService } from '../services/crmService';
import {
  MoreHorizontal, Plus, UserCircle, X, Check, DollarSign, Building, Briefcase, FileText, PenTool, Calendar, Users,
  Megaphone,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  User as UserIcon,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const STAGES = ['Lead', 'Contato', 'Proposta', 'Negociação', 'Ganho', 'Perdido'];
const ACTIVITY_TYPES: ActivityType[] = ['Prospecção Novo Lead', 'Follow Up', 'Ligação', 'Reunião externa', 'Visita'];

const CRM: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const navigate = useNavigate();
  const location = useLocation();

  // API State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'leads' | 'deals' | 'activities'>('deals');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDealStage, setNewDealStage] = useState('');
  const [draggedDealId, setDraggedDealId] = useState<number | null>(null);

  // Activity Modal State
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedDealForActivity, setSelectedDealForActivity] = useState<Deal | null>(null);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: 'Ligação',
    date: '',
    durationMinutes: 30,
    title: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    value: '',
    productInterest: '',
    owner: ''
  });

  useEffect(() => {
    loadCRMData();
  }, []);

  const loadCRMData = async () => {
    try {
      const [leadsData, dealsData, activitiesData] = await Promise.all([
        CRMService.getLeads(),
        CRMService.getDeals(),
        CRMService.getActivities()
      ]);
      setLeads(leadsData);
      setDeals(dealsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error("Failed to load CRM data", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle incoming new deal from Leads page
  useEffect(() => {
    if (location.state && (location.state as any).newDeal) {
      const incomingDeal = (location.state as any).newDeal as Deal;

      // If deal is not in current list (which comes from API), we might want to reload or just append locally
      // For now, just append locally if not present
      setDeals(prev => {
        if (prev.find(d => d.id === incomingDeal.id)) return prev;
        return [...prev, incomingDeal];
      });

      // Clear location state to clean up history
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Filter internal users for the "Owner" dropdown
  const internalUsers = MOCK_USERS.filter(u => u.role !== UserRole.CLIENT_USER && u.role !== UserRole.CLUB_MEMBER);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Ganho': return 'border-t-4 border-pot-success';
      case 'Perdido': return 'border-t-4 border-pot-error';
      default: return 'border-t-4 border-pot-orange';
    }
  };

  const handleOpenModal = (stage: string) => {
    setNewDealStage(stage);
    setFormData({
      title: '',
      company: '',
      value: '',
      productInterest: MOCK_PRODUCTS[0]?.title || '',
      owner: internalUsers[0]?.name || ''
    });
    setIsModalOpen(true);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const dealPayload: Partial<Deal> = {
      title: formData.title,
      company: formData.company,
      value: Number(formData.value),
      stage: newDealStage as any,
      productInterest: formData.productInterest as any,
      owner: formData.owner,
      active: true,
      priority: 'Medium'
    };

    try {
      const newDeal = await CRMService.createDeal(dealPayload);
      setDeals([...deals, newDeal]);
      setIsModalOpen(false);
      alert('Negócio criado com sucesso!');
    } catch (error) {
      console.error("Failed to create deal", error);
      alert('Erro ao criar negócio.');
    }
  };

  const handleOpenActivityModal = (e: React.MouseEvent, deal: Deal, defaultType: ActivityType = 'Ligação') => {
    e.stopPropagation();
    setSelectedDealForActivity(deal);
    setNewActivity({
      type: defaultType,
      date: '',
      durationMinutes: defaultType === 'Reunião externa' ? 60 : 30,
      title: defaultType === 'Reunião externa' ? 'Reunião com Cliente' : ''
    });
    setIsActivityModalOpen(true);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealForActivity) return;

    try {
      const activityPayload = {
        type: newActivity.type as ActivityType,
        title: newActivity.title || 'Nova Atividade',
        date: newActivity.date || new Date().toISOString(),
        durationMinutes: newActivity.durationMinutes || 30,
        dealId: selectedDealForActivity.id
      };

      const activity = await CRMService.createActivity(activityPayload);
      setActivities([...activities, activity]);
      setIsActivityModalOpen(false);
      alert("Atividade agendada com sucesso!");
    } catch (error) {
      console.error("Failed to create activity", error);
    }
  };

  // --- Drag and Drop Logic ---

  const handleDragStart = (e: React.DragEvent, dealId: number) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
    // Optional: Make the drag ghost image clearer if needed, standard browser behavior is usually fine.
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();

    if (draggedDealId === null) return;

    // Find the deal and check if stage actually changed
    const dealToUpdate = deals.find(d => d.id === draggedDealId);
    if (!dealToUpdate || dealToUpdate.stage === targetStage) {
      setDraggedDealId(null);
      return;
    }

    try {
      // Optimistic Update
      const updatedDeals = deals.map(deal => {
        if (deal.id === draggedDealId) {
          return { ...deal, stage: targetStage as any };
        }
        return deal;
      });
      setDeals(updatedDeals);

      // API Call
      await CRMService.updateDeal(draggedDealId, { stage: targetStage as Deal['stage'] });

      // Note: Automation for Onboarding creation should ideally move to Backend Signals/Logic
      // to avoid logic duplication and ensure consistency.
    } catch (error) {
      console.error("Failed to update deal stage", error);
      // Revert on failure involves reloading or undoing local state change
      loadCRMData();
    }

    setDraggedDealId(null);
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-pot-petrol">Pipeline de Vendas</h2>
          <p className="text-sm text-gray-500">Gerencie oportunidades, propostas e contratos. Arraste os cards para mover de etapa.</p>
        </div>
        <button
          onClick={() => handleOpenModal('Lead')}
          className="flex items-center px-4 py-2 bg-pot-orange text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} className="mr-2" />
          Novo Negócio
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max h-full">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage);
            const totalValue = stageDeals.reduce((acc, curr) => acc + curr.value, 0);

            return (
              <div
                key={stage}
                className="w-80 bg-gray-100 rounded-lg flex flex-col max-h-full border border-gray-200 transition-colors"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-700">{stage}</h3>
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600 font-bold">{stageDeals.length}</span>
                    </div>
                    <button
                      onClick={() => handleOpenModal(stage)}
                      className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-pot-orange transition-colors"
                      title="Adicionar Deal nesta etapa"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold border-t border-gray-200 pt-2 mt-1">
                    R$ {totalValue.toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Column Content */}
                <div className="p-2 flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-[100px]">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onClick={() => navigate(`/crm/${deal.id}`)}
                      className={`bg-white p-4 rounded shadow-sm hover:shadow-lg transition-all cursor-grab active:cursor-grabbing transform hover:-translate-y-1 ${getStageColor(deal.stage)} ${draggedDealId === deal.id ? 'opacity-50' : 'opacity-100'} group relative`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-pot-magenta bg-pink-50 px-2 py-1 rounded uppercase tracking-wider truncate max-w-[150px]">
                          {deal.productInterest}
                        </span>

                        <div className="flex gap-1">
                          {/* Quick Meeting Button */}
                          <button
                            className="text-gray-400 hover:text-pot-orange hover:bg-orange-50 p-1.5 rounded transition-colors"
                            onClick={(e) => handleOpenActivityModal(e, deal, 'Reunião externa')}
                            title="Nova Reunião"
                          >
                            <Users size={14} />
                          </button>

                          {/* Quick Generic Activity Button */}
                          <button
                            className="text-gray-400 hover:text-pot-petrol hover:bg-gray-100 p-1.5 rounded transition-colors"
                            onClick={(e) => handleOpenActivityModal(e, deal, 'Ligação')}
                            title="Nova Atividade"
                          >
                            <Calendar size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{deal.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{deal.company}</p>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="font-bold text-pot-petrol">R$ {deal.value.toLocaleString('pt-BR')}</span>
                        <div className="flex items-center text-xs text-gray-400" title={`Responsável: ${deal.owner} `}>
                          <UserCircle size={14} className="mr-1" />
                          {deal.owner.split(' ')[0]}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded text-gray-400">
                      <p className="text-sm opacity-50 font-medium">Arraste aqui</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Plus size={20} className="mr-2" />
                Novo Negócio em <span className="text-pot-orange ml-1">{newDealStage}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Negócio</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none bg-white text-gray-900"
                  placeholder="Ex: Consultoria Completa"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa / Cliente</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none bg-white text-gray-900"
                    placeholder="Nome da Empresa"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Estimado (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="number"
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none bg-white text-gray-900"
                      placeholder="0,00"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none bg-white text-gray-900"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  >
                    {internalUsers.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produto de Interesse</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-gray-400" size={16} />
                  <select
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none bg-white text-gray-900"
                    value={formData.productInterest}
                    onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                  >
                    {MOCK_PRODUCTS.map(p => (
                      <option key={p.id} value={p.title}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fake Document Actions for demo */}
              {(newDealStage === 'Proposta' || newDealStage === 'Negociação') && (
                <div className="flex gap-2 pt-2">
                  <button type="button" className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-medium rounded text-gray-700 border border-gray-200">
                    <FileText size={14} className="mr-2" /> Gerar Proposta
                  </button>
                  <button type="button" className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-medium rounded text-gray-700 border border-gray-200">
                    <PenTool size={14} className="mr-2" /> Gerar Contrato
                  </button>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-pot-success text-white rounded-lg hover:bg-green-700 text-sm font-bold shadow-md flex items-center"
                >
                  <Check size={18} className="mr-2" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fade-in">
            <div className="bg-pot-petrol px-5 py-3 flex justify-between items-center rounded-t-xl">
              <h3 className="text-md font-bold text-white flex items-center">
                <Calendar size={18} className="mr-2" />
                {newActivity.type === 'Reunião externa' ? 'Nova Reunião' : 'Nova Atividade'}
              </h3>
              <button onClick={() => setIsActivityModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateActivity} className="p-5 space-y-3">
              <p className="text-xs text-gray-500 mb-2">Para: <strong>{selectedDealForActivity?.title}</strong></p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-pot-orange bg-white text-gray-900"
                  value={newActivity.type}
                  onChange={e => setNewActivity({ ...newActivity, type: e.target.value as ActivityType })}
                >
                  {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assunto</label>
                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-pot-orange bg-white text-gray-900"
                  value={newActivity.title} onChange={e => setNewActivity({ ...newActivity, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
                  <input type="datetime-local" required className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-pot-orange bg-white text-gray-900"
                    value={newActivity.date} onChange={e => setNewActivity({ ...newActivity, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duração (min)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-pot-orange bg-white text-gray-900"
                    value={newActivity.durationMinutes} onChange={e => setNewActivity({ ...newActivity, durationMinutes: Number(e.target.value) })} />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-pot-orange text-white rounded font-bold text-sm hover:bg-orange-600 mt-2">Agendar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
