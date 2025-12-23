import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MOCK_TICKET_CATEGORIES } from '../constants'; // Keeping Categories Mock for now
import { Ticket, TicketInteraction, TicketCategory, User, UserRole, Project, ClientProfile } from '../types';
import { SupportService } from '../services/supportService';
import { ProjectService } from '../services/projectService';
import { ClientService } from '../services/clientService';
import { UserService } from '../services/userService';
import {
   LifeBuoy,
   Plus,
   Search,
   Filter,
   Settings,
   X,
   Send,
   User as UserIcon,
   Building,
   Folder,
   Calendar,
   AlertCircle,
   CheckCircle,
   Clock,
   Trash2,
   RefreshCw,
   MoreHorizontal
} from 'lucide-react';

const Tickets: React.FC = () => {
   const { user } = useOutletContext<{ user: User }>();
   const isClient = user.role === UserRole.CLIENT_USER || user.role === UserRole.CLUB_MEMBER;
   const isInternal = !isClient;

   // -- MAIN DATA STATE --
   const [tickets, setTickets] = useState<Ticket[]>([]);
   const [projects, setProjects] = useState<Project[]>([]);
   const [clients, setClients] = useState<ClientProfile[]>([]);
   const [internalUsers, setInternalUsers] = useState<User[]>([]);
   const [categories, setCategories] = useState<TicketCategory[]>(MOCK_TICKET_CATEGORIES);

   const [loading, setLoading] = useState(true);

   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState('Todos');

   // -- MODALS STATE --
   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
   const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
   const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

   // -- FORMS STATE --
   const [ticketReply, setTicketReply] = useState('');
   const [newCategoryName, setNewCategoryName] = useState('');

   const [newTicketForm, setNewTicketForm] = useState({
      clientId: '',
      projectId: '',
      categoryId: '',
      subject: '',
      description: '',
      priority: 'Média',
      consultant: ''
   });

   // -- EFFECT: SYNC DATA --
   useEffect(() => {
      loadData();
   }, [user.id]);

   const loadData = async () => {
      try {
         const [ticketsData, projectsData, clientsData, usersData] = await Promise.all([
            SupportService.getAll(),
            ProjectService.getAll(),
            ClientService.getAll(),
            UserService.getAll()
         ]);
         setTickets(ticketsData);
         setProjects(projectsData);
         setClients(clientsData);
         setInternalUsers(usersData.filter(u => u.role !== UserRole.CLIENT_USER && u.role !== UserRole.CLUB_MEMBER));
      } catch (error) {
         console.error("Failed to load tickets data", error);
      } finally {
         setLoading(false);
      }
   };

   const refreshTickets = () => {
      loadData();
   };

   // -- FILTERS & COMPUTED DATA --

   // Projects available for creating a ticket
   const availableProjects = isClient
      ? projects.filter(p => p.clientName === user.companyName)
      : projects.filter(p => {
         if (newTicketForm.clientId) {
            const clientName = clients.find(c => c.id === Number(newTicketForm.clientId))?.companyName;
            return p.clientName === clientName;
         }
         return true;
      });

   const filteredTickets = tickets.filter(t => {
      // 1. Role Filter
      if (isClient) {
         const myProjectIds = projects.filter(p => p.clientName === user.companyName).map(p => p.id);
         if (!myProjectIds.includes(t.projectId)) return false;
      }

      // 2. Search Filter
      const searchMatch =
         t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
         t.id.toString().includes(searchTerm);
      if (!searchMatch) return false;

      // 3. Status Filter
      if (statusFilter !== 'Todos' && t.status !== statusFilter) return false;

      return true;
   });

   // -- SLA LOGIC --
   const checkSLA = (ticket: Ticket) => {
      // Se resolvido, SLA cumprido
      if (ticket.status === 'Resolvido' || ticket.status === 'Concluído') {
         return { status: 'ok', label: 'Concluído', color: 'bg-gray-100 text-gray-600 border-gray-200' };
      }

      // Pega última interação
      const lastInteraction = ticket.interactions && ticket.interactions.length > 0
         ? ticket.interactions[ticket.interactions.length - 1]
         : null;

      // Se não tem interação, conta da criação
      const referenceDate = lastInteraction ? new Date(lastInteraction.createdAt) : new Date(ticket.createdAt);

      // Se a última pessoa a falar foi o Suporte, estamos esperando o Cliente (SLA Pausado/OK)
      if (lastInteraction && lastInteraction.role === 'support') {
         return { status: 'paused', label: 'Aguardando Cliente', color: 'bg-blue-50 text-blue-700 border-blue-100' };
      }

      // Cálculo do tempo decorrido desde a última mensagem do cliente
      const diffMs = new Date().getTime() - referenceDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      // Regras de Tempo (Demo: 5min warning, 10min delay)
      if (diffMins > 10) return { status: 'delay', label: `+${diffMins}m Atraso`, color: 'bg-red-50 text-red-700 border-red-200' };
      if (diffMins > 5) return { status: 'warning', label: `${diffMins}m Decorridos`, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };

      return { status: 'ok', label: 'No Prazo', color: 'bg-green-50 text-green-700 border-green-200' };
   };

   // -- HANDLERS --

   const handleOpenDetail = (ticket: Ticket) => {
      setSelectedTicket(ticket);
      setIsDetailModalOpen(true);
   };

   const handleReplyTicket = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTicket || !ticketReply.trim()) return;

      try {
         const newInteraction = await SupportService.addInteraction(selectedTicket.id, ticketReply, isClient ? 'client' : 'support');

         // Update Status Check
         let newStatus = selectedTicket.status;
         if (isClient) {
            newStatus = 'Respondido pelo Cliente';
         } else {
            newStatus = 'Respondido Pelo Consultor';
         }

         if (newStatus !== selectedTicket.status) {
            await SupportService.update(selectedTicket.id, { status: newStatus as any });
         }

         const updatedTicket = {
            ...selectedTicket,
            status: newStatus as any,
            updatedAt: new Date().toISOString(),
            interactions: [...(selectedTicket.interactions || []), newInteraction]
         };

         // Update Local State
         setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
         setSelectedTicket(updatedTicket);
         setTicketReply('');
      } catch (error) {
         console.error("Failed to reply to ticket", error);
      }
   };

   const handleCreateTicket = async (e: React.FormEvent) => {
      e.preventDefault();

      let finalProjectId = 0;
      let finalClientName = '';

      if (isClient) {
         finalProjectId = Number(newTicketForm.projectId) || (availableProjects[0]?.id || 0);
         finalClientName = user.companyName || 'Cliente';
      } else {
         finalProjectId = Number(newTicketForm.projectId);
         const clientProfile = clients.find(c => c.id === Number(newTicketForm.clientId));
         finalClientName = clientProfile ? clientProfile.companyName : 'Desconhecido';
      }

      const project = projects.find(p => p.id === finalProjectId);
      const categoryName = categories.find(c => c.id.toString() === newTicketForm.categoryId)?.name || 'Geral';

      const ticketPayload: Partial<Ticket> = {
         projectId: finalProjectId,
         title: newTicketForm.subject,
         description: newTicketForm.description,
         type: categoryName,
         area: 'Sucesso do Cliente',
         priority: newTicketForm.priority as any,
         status: 'Aberto',
         openedBy: user.name,
         assignedTo: newTicketForm.consultant || (project?.specialist || 'A definir')
      };

      try {
         const newTicket = await SupportService.create(ticketPayload);
         // API might not return interactions populated immediately if they are separate, but typically creation implies emptiness or simple init. 
         // If we need to send initial message, we might need to call addInteraction too if backend doesn't take 'description' as first message.
         // Assuming backend handles description as body or first message.

         // Update Local State
         setTickets([newTicket, ...tickets]);

         setIsCreateModalOpen(false);
         setNewTicketForm({
            clientId: '', projectId: '', categoryId: '', subject: '', description: '', priority: 'Média', consultant: ''
         });
         alert("Chamado aberto com sucesso!");
      } catch (error) {
         console.error("Failed to create ticket", error);
         alert("Erro ao abrir chamado.");
      }
   };

   const handleAddCategory = () => {
      if (newCategoryName.trim()) {
         const newCat: TicketCategory = {
            id: Math.floor(Math.random() * 1000),
            name: newCategoryName
         };
         setCategories([...categories, newCat]);
         setNewCategoryName('');
      }
   };

   const handleRemoveCategory = (id: number) => {
      setCategories(categories.filter(c => c.id !== id));
   };

   const getTicketContext = (ticket: Ticket) => {
      const project = projects.find(p => p.id === ticket.projectId);
      const client = project ? clients.find(c => c.companyName === project.clientName) : null;

      return {
         clientName: project?.clientName || 'N/A',
         clientCode: client ? `CLI-${client.id.toString().padStart(3, '0')}` : 'N/A',
         projectCode: project?.code || 'N/A',
         projectName: project?.title || 'N/A',
         consultant: ticket.assignedTo
      };
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'Aberto': return 'bg-red-100 text-red-800';
         case 'Em Análise': return 'bg-yellow-100 text-yellow-800';
         case 'Respondido Pelo Consultor': return 'bg-blue-100 text-blue-800';
         case 'Respondido pelo Cliente': return 'bg-purple-100 text-purple-800';
         case 'Concluído':
         case 'Resolvido': return 'bg-green-100 text-green-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   return (
      <div className="space-y-6 animate-fade-in">
         {/* HEADER & CONTROLS */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-pot-petrol flex items-center">
                  <LifeBuoy size={24} className="mr-2 text-pot-orange" />
                  Central de Chamados
               </h2>
               <p className="text-sm text-gray-500">Gerencie solicitações, dúvidas e suporte técnico.</p>
            </div>
            <div className="flex gap-2">
               <button
                  onClick={refreshTickets}
                  className="p-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-pot-petrol transition-colors shadow-sm"
                  title="Atualizar lista"
               >
                  <RefreshCw size={18} />
               </button>
               {isInternal && (
                  <button
                     onClick={() => setIsCategoryModalOpen(true)}
                     className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                  >
                     <Settings size={18} className="mr-2" /> Categorias
                  </button>
               )}
               <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-pot-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-bold shadow-md"
               >
                  <Plus size={18} className="mr-2" /> Novo Chamado
               </button>
            </div>
         </div>

         {/* FILTERS */}
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
               <input
                  type="text"
                  placeholder="Buscar por assunto, ID ou descrição..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-pot-orange"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
               <Filter size={18} className="text-gray-400" />
               <select
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white min-w-[150px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
               >
                  <option value="Todos">Todos os Status</option>
                  <option value="Aberto">Aberto</option>
                  <option value="Em Análise">Em Análise</option>
                  <option value="Respondido Pelo Consultor">Resp. Consultor</option>
                  <option value="Respondido pelo Cliente">Resp. Cliente</option>
                  <option value="Concluído">Concluído</option>
               </select>
            </div>
         </div>

         {/* TICKETS LIST */}
         <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                  <tr>
                     <th className="p-4">ID</th>
                     <th className="p-4">Assunto</th>
                     <th className="p-4">Cliente / Projeto</th>
                     <th className="p-4">Categoria</th>
                     <th className="p-4">SLA (Resp.)</th>
                     <th className="p-4">Situação</th>
                     <th className="p-4">Responsável</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredTickets.map(ticket => {
                     const ctx = getTicketContext(ticket);
                     const sla = checkSLA(ticket);

                     return (
                        <tr
                           key={ticket.id}
                           onClick={() => handleOpenDetail(ticket)}
                           className="hover:bg-blue-50 transition-colors cursor-pointer group"
                        >
                           <td className="p-4 font-mono text-xs text-gray-500">#{ticket.id}</td>
                           <td className="p-4 max-w-[250px]">
                              <div className="font-bold text-gray-800 text-sm group-hover:text-blue-600 truncate">{ticket.title}</div>
                              <div className="text-xs text-gray-400 truncate">{ticket.description}</div>
                           </td>
                           <td className="p-4 text-xs max-w-[200px]">
                              <div className="font-bold text-gray-700 truncate" title={ctx.clientName}>{ctx.clientName}</div>
                              <div className="text-gray-500 truncate" title={ctx.projectName}>{ctx.projectName}</div>
                           </td>
                           <td className="p-4 text-xs">
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                 {ticket.type}
                              </span>
                           </td>
                           <td className="p-4 text-xs">
                              <span className={`inline-flex items-center px-2 py-1 rounded font-bold border ${sla.color}`}>
                                 {sla.status === 'delay' && <AlertCircle size={10} className="mr-1" />}
                                 {sla.status === 'warning' && <Clock size={10} className="mr-1" />}
                                 {sla.status === 'ok' && <CheckCircle size={10} className="mr-1" />}
                                 {sla.status === 'paused' && <MoreHorizontal size={10} className="mr-1" />}
                                 {sla.label}
                              </span>
                           </td>
                           <td className="p-4 text-xs">
                              <span className={`px-2 py-1 rounded font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                 {ticket.status}
                              </span>
                           </td>
                           <td className="p-4 text-xs text-gray-600">
                              {ticket.assignedTo}
                           </td>
                        </tr>
                     );
                  })}
                  {filteredTickets.length === 0 && (
                     <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                           Nenhum chamado encontrado.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* --- TICKET DETAIL MODAL --- */}
         {isDetailModalOpen && selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 md:p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-fade-in">

                  {/* Header Grid (Detailed Info) */}
                  <div className="bg-pot-petrol p-6 text-white shrink-0">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h3 className="text-xl font-bold flex items-center gap-2">
                              <LifeBuoy size={20} className="text-pot-orange" />
                              {selectedTicket.title}
                           </h3>
                           <span className="text-xs text-gray-300 font-mono">Chamado #{selectedTicket.id}</span>
                        </div>
                        <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-300 hover:text-white">
                           <X size={24} />
                        </button>
                     </div>

                     {/* Data Grid */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-sm border-t border-white/20 pt-4">
                        {(() => {
                           const ctx = getTicketContext(selectedTicket);
                           return (
                              <>
                                 <div>
                                    <span className="block text-xs text-gray-400 uppercase font-bold">Cliente</span>
                                    <div className="font-semibold flex items-center gap-1">
                                       <Building size={14} className="opacity-70" /> {ctx.clientName}
                                    </div>
                                    <div className="text-xs opacity-70">{ctx.clientCode}</div>
                                 </div>
                                 <div>
                                    <span className="block text-xs text-gray-400 uppercase font-bold">Projeto</span>
                                    <div className="font-semibold flex items-center gap-1">
                                       <Folder size={14} className="opacity-70" /> {ctx.projectName}
                                    </div>
                                    <div className="text-xs opacity-70">{ctx.projectCode}</div>
                                 </div>
                                 <div>
                                    <span className="block text-xs text-gray-400 uppercase font-bold">Abertura</span>
                                    <div className="font-semibold flex items-center gap-1">
                                       <Calendar size={14} className="opacity-70" /> {new Date(selectedTicket.createdAt).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="text-xs opacity-70">{new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                 </div>
                                 <div>
                                    <span className="block text-xs text-gray-400 uppercase font-bold">Responsável</span>
                                    <div className="font-semibold flex items-center gap-1">
                                       <UserIcon size={14} className="opacity-70" /> {ctx.consultant}
                                    </div>
                                 </div>
                                 <div>
                                    <span className="block text-xs text-gray-400 uppercase font-bold">Categoria</span>
                                    <div className="font-semibold bg-white/10 px-2 py-0.5 rounded inline-block text-xs mt-1">
                                       {selectedTicket.type}
                                    </div>
                                 </div>
                                 <div>
                                    <span className="block text-xs text-gray-400 uppercase font-bold">Situação</span>
                                    <div className={`font-bold uppercase text-xs mt-1 inline-block px-2 py-0.5 rounded text-gray-800 ${getStatusColor(selectedTicket.status).replace('text-gray-800', '')}`}>
                                       {selectedTicket.status}
                                    </div>
                                 </div>
                              </>
                           );
                        })()}
                     </div>
                  </div>

                  {/* Chat History */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                     {selectedTicket.interactions?.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === (isClient ? 'client' : 'support') ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] rounded-lg p-4 shadow-sm relative ${msg.role === 'client'
                              ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                              : 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tr-none'
                              }`}>
                              <div className="flex justify-between items-center mb-1 gap-4">
                                 <span className="text-xs font-bold">{msg.sender}</span>
                                 <span className="text-[10px] opacity-60 flex items-center">
                                    <Clock size={10} className="mr-1" />
                                    {new Date(msg.createdAt).toLocaleDateString('pt-BR')} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Reply Box */}
                  <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                     <form onSubmit={handleReplyTicket} className="flex gap-2">
                        <textarea
                           className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pot-orange outline-none text-sm bg-gray-50 text-gray-900 resize-none h-20"
                           placeholder="Escreva sua resposta..."
                           value={ticketReply}
                           onChange={e => setTicketReply(e.target.value)}
                        ></textarea>
                        <button
                           type="submit"
                           disabled={!ticketReply.trim()}
                           className="bg-pot-petrol text-white px-6 rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex flex-col items-center justify-center disabled:opacity-50"
                        >
                           <Send size={18} />
                           <span className="text-[10px] mt-1 font-bold">Enviar</span>
                        </button>
                     </form>
                  </div>

               </div>
            </div>
         )}

         {/* --- CREATE TICKET MODAL --- */}
         {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white">
                     <h3 className="font-bold flex items-center">
                        <Plus size={20} className="mr-2" /> Novo Chamado
                     </h3>
                     <button onClick={() => setIsCreateModalOpen(false)}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                     {/* If Internal User, select Client first */}
                     {isInternal && (
                        <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Cliente Solicitante</label>
                           <select
                              required
                              className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                              value={newTicketForm.clientId}
                              onChange={e => setNewTicketForm({ ...newTicketForm, clientId: e.target.value, projectId: '' })}
                           >
                              <option value="">-- Selecione o Cliente --</option>
                              {clients.map(c => (
                                 <option key={c.id} value={c.id}>{c.companyName}</option>
                              ))}
                           </select>
                        </div>
                     )}

                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Projeto Vinculado</label>
                        <select
                           required
                           className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                           value={newTicketForm.projectId}
                           onChange={e => setNewTicketForm({ ...newTicketForm, projectId: e.target.value })}
                           disabled={isInternal && !newTicketForm.clientId}
                        >
                           <option value="">-- Selecione o Projeto --</option>
                           {availableProjects.map(p => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                           ))}
                        </select>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Categoria</label>
                           <select
                              required
                              className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                              value={newTicketForm.categoryId}
                              onChange={e => setNewTicketForm({ ...newTicketForm, categoryId: e.target.value })}
                           >
                              <option value="">-- Selecione --</option>
                              {categories.map(c => (
                                 <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Prioridade</label>
                           <select
                              className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                              value={newTicketForm.priority}
                              onChange={e => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                           >
                              <option>Baixa</option>
                              <option>Média</option>
                              <option>Alta</option>
                              <option>Urgente</option>
                           </select>
                        </div>
                     </div>

                     {/* If Internal, can override assignee */}
                     {isInternal && (
                        <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Consultor Responsável (Opcional)</label>
                           <select
                              className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                              value={newTicketForm.consultant}
                              onChange={e => setNewTicketForm({ ...newTicketForm, consultant: e.target.value })}
                           >
                              <option value="">Automático (Responsável do Projeto)</option>
                              {internalUsers.map(u => (
                                 <option key={u.id} value={u.name}>{u.name}</option>
                              ))}
                           </select>
                        </div>
                     )}

                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Assunto</label>
                        <input
                           required
                           type="text"
                           className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-pot-orange bg-white text-gray-900"
                           placeholder="Resumo do problema..."
                           value={newTicketForm.subject}
                           onChange={e => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Descrição Detalhada</label>
                        <textarea
                           required
                           className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-pot-orange h-24 resize-none bg-white text-gray-900"
                           placeholder="Descreva o que está acontecendo..."
                           value={newTicketForm.description}
                           onChange={e => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                        ></textarea>
                     </div>

                     <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-pot-success text-white rounded text-sm font-bold shadow hover:bg-green-700 flex items-center">
                           <CheckCircle size={16} className="mr-2" /> Abrir Chamado
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* --- MANAGE CATEGORIES MODAL (INTERNAL ONLY) --- */}
         {isCategoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                  <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b border-gray-200">
                     <h3 className="font-bold text-gray-700 flex items-center">
                        <Settings size={18} className="mr-2" /> Categorias de Chamado
                     </h3>
                     <button onClick={() => setIsCategoryModalOpen(false)}><X size={20} className="text-gray-500" /></button>
                  </div>

                  <div className="p-6">
                     <div className="flex gap-2 mb-4">
                        <input
                           type="text"
                           className="flex-1 border border-gray-300 rounded p-2 text-sm outline-none focus:border-pot-orange bg-white text-gray-900"
                           placeholder="Nova categoria..."
                           value={newCategoryName}
                           onChange={e => setNewCategoryName(e.target.value)}
                        />
                        <button onClick={handleAddCategory} className="bg-pot-petrol text-white px-3 rounded hover:bg-gray-800">
                           <Plus size={18} />
                        </button>
                     </div>

                     <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {categories.map(cat => (
                           <div key={cat.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                              <span className="text-sm text-gray-700">{cat.name}</span>
                              <button onClick={() => handleRemoveCategory(cat.id)} className="text-gray-400 hover:text-red-500 p-1">
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default Tickets;
