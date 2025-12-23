
import React, { useState, useEffect } from 'react';
import { MOCK_PROJECTS, MOCK_USERS } from '../constants';
import { ClientProfile, Project, User } from '../types';
import {
   Building,
   Search,
   Plus,
   User as UserIcon,
   Phone,
   Instagram,
   Users,
   Database,
   X,
   Check,
   Briefcase,
   MapPin,
   Star,
   ExternalLink,
   Shield
} from 'lucide-react';

import { ClientService } from '../services/clientService';

const Clients: React.FC = () => {
   const [clients, setClients] = useState<ClientProfile[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');

   useEffect(() => {
      loadClients();
   }, []);

   const loadClients = async () => {
      try {
         const data = await ClientService.getAll();
         setClients(data);
      } catch (error) {
         console.error("Failed to fetch clients", error);
      } finally {
         setLoading(false);
      }
   };

   // Modals
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

   // New Client Form State
   const [newClient, setNewClient] = useState<Partial<ClientProfile>>({
      companyName: '',
      cnpj: '',
      responsibleName: '',
      responsiblePhone: '',
      ownerPhone: '',
      instagram: '',
      address: '',
      city: '',
      state: '',
      employeeCount: 0,
      clientCount: 0,
      hasMappedProcesses: false,
      isReference: false,
      softwareAccounting: '',
      softwareNoteCapture: '',
      softwareFileConverter: '',
      softwareWhatsapp: '',
      status: 'Ativo'
   });

   const filteredClients = clients.filter(c =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj.includes(searchTerm)
   );

   // Derived data for Dossier
   const clientProjects = selectedClient ? MOCK_PROJECTS.filter(p => p.clientName === selectedClient.companyName) : [];
   const clientUsers = selectedClient ? MOCK_USERS.filter(u => u.companyName === selectedClient.companyName) : [];

   const handleCreateClient = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         const client = await ClientService.create({
            ...newClient,
            joinedAt: new Date().toISOString()
         });

         setClients([client, ...clients]);
         setIsModalOpen(false);
         // Reset form
         setNewClient({
            companyName: '', cnpj: '', responsibleName: '', responsiblePhone: '',
            ownerPhone: '', instagram: '', employeeCount: 0, clientCount: 0,
            hasMappedProcesses: false, softwareAccounting: '', softwareNoteCapture: '',
            softwareFileConverter: '', softwareWhatsapp: '', status: 'Ativo'
         });
         alert('Cliente cadastrado com sucesso!');
      } catch (error) {
         console.error("Failed to create client", error);
         alert('Erro ao criar cliente.');
      }
   };

   const handleToggleReference = async () => {
      if (selectedClient) {
         try {
            const updated = await ClientService.update(selectedClient.id, { isReference: !selectedClient.isReference });
            setClients(clients.map(c => c.id === selectedClient.id ? updated : c));
            setSelectedClient(updated);
         } catch (error) {
            console.error("Failed to update client", error);
         }
      }
   };

   return (
      <div className="space-y-6 animate-fade-in">
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-pot-petrol">Base de Clientes</h2>
               <p className="text-sm text-gray-500">Gestão cadastral e técnica da carteira.</p>
            </div>
            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center px-4 py-2 bg-pot-orange text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md font-bold"
            >
               <Plus size={18} className="mr-2" />
               Novo Cliente
            </button>
         </div>

         {/* Filter */}
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <Search className="text-gray-400 mr-2" size={20} />
            <input
               type="text"
               placeholder="Buscar por Empresa ou CNPJ..."
               className="flex-1 outline-none text-sm text-gray-700 bg-white"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Clients List */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => {
               // Aggregate stack items for display
               const stackList = [
                  client.softwareAccounting,
                  client.softwareNoteCapture,
                  client.softwareFileConverter,
                  client.softwareWhatsapp
               ].filter(s => s && s !== 'Não utiliza' && s !== 'N/A' && s !== '' && s !== 'Outros');
               const stackDisplay = stackList.length > 0 ? stackList.join(', ') : 'Não informado';

               return (
                  <div key={client.id} className={`bg-white rounded-xl shadow-md border overflow-hidden hover:shadow-lg transition-all group relative ${client.isReference ? 'border-yellow-300 ring-1 ring-yellow-100' : 'border-gray-100'}`}>
                     {client.isReference && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-white px-2 py-1 rounded-bl text-[10px] font-bold flex items-center shadow-sm z-10">
                           <Star size={10} className="mr-1 fill-white" /> Referência
                        </div>
                     )}
                     <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center">
                              <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                                 <Building size={20} />
                              </div>
                              <div>
                                 <h3 className="font-bold text-gray-800">{client.companyName}</h3>
                                 <p className="text-xs text-gray-500">{client.cnpj}</p>
                              </div>
                           </div>
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${client.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {client.status}
                           </span>
                        </div>

                        <div className="space-y-3 mb-6">
                           <div className="flex items-center text-sm text-gray-600">
                              <UserIcon size={14} className="mr-2 text-gray-400" />
                              <span className="truncate">{client.responsibleName}</span>
                           </div>
                           <div className="flex items-center text-sm text-gray-600">
                              <Phone size={14} className="mr-2 text-gray-400" />
                              <span>{client.responsiblePhone}</span>
                           </div>
                           <div className="flex items-center text-sm text-gray-600">
                              <Instagram size={14} className="mr-2 text-gray-400" />
                              <span>{client.instagram || 'N/A'}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                           <div>
                              <span className="block font-bold text-gray-700">{client.employeeCount}</span>
                              Colaboradores
                           </div>
                           <div>
                              <span className="block font-bold text-gray-700">{client.clientCount}</span>
                              Clientes
                           </div>
                           <div className="col-span-2 pt-2 border-t border-gray-200 mt-1">
                              <span className="block font-bold text-gray-700 mb-0.5">Stack Tecnológico:</span>
                              <div
                                 title={stackDisplay}
                                 className="text-gray-600 truncate cursor-help border-b border-dashed border-gray-300 inline-block max-w-full"
                              >
                                 {stackDisplay}
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-right">
                        <button
                           onClick={() => setSelectedClient(client)}
                           className="text-xs font-bold text-pot-petrol hover:text-pot-orange transition-colors"
                        >
                           Ver Perfil Completo &rarr;
                        </button>
                     </div>
                  </div>
               )
            })}
         </div>

         {/* --- CLIENT DOSSIER MODAL --- */}
         {selectedClient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-fade-in">

                  {/* Header */}
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0">
                     <div className="flex items-center gap-4">
                        <div>
                           <h2 className="text-xl font-bold flex items-center gap-2">
                              {selectedClient.companyName}
                              {selectedClient.isReference && <Star size={18} className="text-yellow-400 fill-yellow-400" />}
                           </h2>
                           <p className="text-sm opacity-80">{selectedClient.cnpj} • Cliente desde {new Date(selectedClient.joinedAt).getFullYear()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase bg-white/20 border border-white/30`}>
                           {selectedClient.status}
                        </span>
                     </div>
                     <div className="flex items-center gap-4">
                        <label className="flex items-center cursor-pointer bg-white/10 px-3 py-1.5 rounded hover:bg-white/20 transition-colors">
                           <input
                              type="checkbox"
                              checked={selectedClient.isReference || false}
                              onChange={handleToggleReference}
                              className="form-checkbox h-4 w-4 text-yellow-400 rounded focus:ring-yellow-400 bg-white border-none mr-2"
                           />
                           <span className="text-sm font-medium">Cliente Referência</span>
                        </label>
                        <button onClick={() => setSelectedClient(null)} className="text-gray-300 hover:text-white">
                           <X size={24} />
                        </button>
                     </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto bg-gray-50 p-6">

                     {/* Section 1: Location & Map */}
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                           <h3 className="font-bold text-pot-petrol mb-4 flex items-center">
                              <MapPin size={18} className="mr-2 text-pot-orange" /> Localização
                           </h3>
                           <div className="space-y-3 text-sm text-gray-700">
                              <p><strong>Endereço:</strong> {selectedClient.address || 'Não informado'}</p>
                              <p><strong>Cidade/UF:</strong> {selectedClient.city}/{selectedClient.state} {selectedClient.zip && `- ${selectedClient.zip}`}</p>
                              <hr className="border-gray-100 my-2" />
                              <p className="text-xs text-gray-500">Mapa de localização aproximada:</p>
                              <div className="w-full h-40 bg-gray-100 rounded overflow-hidden border border-gray-300 relative">
                                 {selectedClient.city ? (
                                    <iframe
                                       width="100%"
                                       height="100%"
                                       frameBorder="0"
                                       scrolling="no"
                                       marginHeight={0}
                                       marginWidth={0}
                                       src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedClient.city + ', ' + selectedClient.state + ', Brasil')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                       title="Client Location"
                                    ></iframe>
                                 ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">Sem localização</div>
                                 )}
                              </div>
                           </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                           <h3 className="font-bold text-pot-petrol mb-4 flex items-center">
                              <Phone size={18} className="mr-2 text-pot-orange" /> Contatos Estratégicos
                           </h3>
                           <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                 <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Dono / Sócio</p>
                                    <p className="font-bold text-gray-800">{selectedClient.ownerPhone || 'N/A'}</p>
                                 </div>
                                 <button className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200">
                                    <Phone size={16} />
                                 </button>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                 <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Responsável Operacional</p>
                                    <p className="font-bold text-gray-800">{selectedClient.responsibleName}</p>
                                    <p className="text-xs text-gray-600">{selectedClient.responsiblePhone}</p>
                                 </div>
                              </div>
                              {selectedClient.instagram && (
                                 <a
                                    href={`https://instagram.com/${selectedClient.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-pot-magenta hover:underline text-sm font-medium"
                                 >
                                    <Instagram size={16} className="mr-2" />
                                    {selectedClient.instagram} <ExternalLink size={12} className="ml-1" />
                                 </a>
                              )}
                           </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                           <h3 className="font-bold text-pot-petrol mb-4 flex items-center">
                              <Database size={18} className="mr-2 text-pot-orange" /> Raio-X Operacional
                           </h3>
                           <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
                                 <span className="block text-xl font-bold text-blue-800">{selectedClient.employeeCount}</span>
                                 <span className="text-[10px] text-blue-600 uppercase font-bold">Colaboradores</span>
                              </div>
                              <div className="text-center p-2 bg-green-50 rounded border border-green-100">
                                 <span className="block text-xl font-bold text-green-800">{selectedClient.clientCount}</span>
                                 <span className="text-[10px] text-green-600 uppercase font-bold">Clientes</span>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <p className="text-xs font-bold text-gray-500 uppercase">Stack Tecnológico</p>
                              <div className="flex flex-wrap gap-2">
                                 {selectedClient.softwareAccounting && (
                                    <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700">{selectedClient.softwareAccounting}</span>
                                 )}
                                 {selectedClient.softwareNoteCapture !== 'Não utiliza' && selectedClient.softwareNoteCapture && (
                                    <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700">{selectedClient.softwareNoteCapture}</span>
                                 )}
                                 {selectedClient.softwareWhatsapp !== 'Outros' && selectedClient.softwareWhatsapp && (
                                    <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700">{selectedClient.softwareWhatsapp}</span>
                                 )}
                              </div>
                           </div>
                           <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-500 uppercase">Processos Mapeados?</span>
                              {selectedClient.hasMappedProcesses ? (
                                 <span className="flex items-center text-xs font-bold text-green-600"><Check size={14} className="mr-1" /> Sim</span>
                              ) : (
                                 <span className="flex items-center text-xs font-bold text-red-500"><X size={14} className="mr-1" /> Não</span>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Section 2: Projects & Users */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Projects */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                           <h3 className="font-bold text-pot-petrol mb-4 flex items-center">
                              <Briefcase size={18} className="mr-2 text-pot-orange" /> Projetos Vinculados
                           </h3>
                           {clientProjects.length > 0 ? (
                              <div className="space-y-3">
                                 {clientProjects.map(project => (
                                    <div key={project.id} className="p-3 border border-gray-100 rounded hover:bg-gray-50">
                                       <div className="flex justify-between items-start mb-1">
                                          <span className="font-bold text-sm text-gray-800">{project.title}</span>
                                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${project.status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{project.status}</span>
                                       </div>
                                       <p className="text-xs text-gray-500 mb-2">{project.type}</p>
                                       <div className="w-full bg-gray-200 rounded-full h-1.5">
                                          <div className="bg-pot-petrol h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="text-center py-8 text-gray-400 text-sm italic bg-gray-50 rounded">
                                 Nenhum projeto ativo ou histórico encontrado.
                              </div>
                           )}
                        </div>

                        {/* Users */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                           <h3 className="font-bold text-pot-petrol mb-4 flex items-center">
                              <Shield size={18} className="mr-2 text-pot-orange" /> Acessos ao Sistema
                           </h3>
                           {clientUsers.length > 0 ? (
                              <div className="divide-y divide-gray-100">
                                 {clientUsers.map(user => (
                                    <div key={user.id} className="py-3 first:pt-0 flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                             <img src={user.avatar} alt={user.name} />
                                          </div>
                                          <div>
                                             <p className="text-sm font-bold text-gray-800">{user.name}</p>
                                             <p className="text-xs text-gray-500">{user.email}</p>
                                          </div>
                                       </div>
                                       <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                          {user.role}
                                       </span>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="text-center py-8 text-gray-400 text-sm italic bg-gray-50 rounded">
                                 Nenhum usuário cadastrado para este cliente.
                              </div>
                           )}
                        </div>

                     </div>

                  </div>
               </div>
            </div>
         )}

         {/* REGISTER CLIENT MODAL */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0">
                     <h3 className="text-lg font-bold flex items-center">
                        <Briefcase size={20} className="mr-2" />
                        Novo Cliente
                     </h3>
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-white">
                        <X size={20} />
                     </button>
                  </div>

                  <form onSubmit={handleCreateClient} className="flex-1 overflow-y-auto p-6 space-y-8">

                     {/* 1. DADOS CORPORATIVOS */}
                     <div>
                        <h4 className="text-sm font-bold text-pot-orange uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center">
                           <Building size={16} className="mr-2" /> Identificação Corporativa
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                           <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-600 mb-1">Razão Social / Nome Fantasia</label>
                              <input required type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 value={newClient.companyName} onChange={e => setNewClient({ ...newClient, companyName: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">CNPJ</label>
                              <input required type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 placeholder="00.000.000/0000-00"
                                 value={newClient.cnpj} onChange={e => setNewClient({ ...newClient, cnpj: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Nome do Responsável</label>
                              <input required type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 value={newClient.responsibleName} onChange={e => setNewClient({ ...newClient, responsibleName: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Tel. Responsável</label>
                              <input required type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 placeholder="(00) 00000-0000"
                                 value={newClient.responsiblePhone} onChange={e => setNewClient({ ...newClient, responsiblePhone: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Tel. Dono do Escritório</label>
                              <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 placeholder="(00) 00000-0000"
                                 value={newClient.ownerPhone} onChange={e => setNewClient({ ...newClient, ownerPhone: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Instagram (@)</label>
                              <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 placeholder="@usuario"
                                 value={newClient.instagram} onChange={e => setNewClient({ ...newClient, instagram: e.target.value })} />
                           </div>
                        </div>
                     </div>

                     {/* 1.5. ENDEREÇO (New) */}
                     <div>
                        <h4 className="text-sm font-bold text-pot-orange uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center">
                           <MapPin size={16} className="mr-2" /> Endereço
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                           <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-600 mb-1">Logradouro, Nº e Bairro</label>
                              <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 placeholder="Rua Exemplo, 123"
                                 value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Cidade</label>
                              <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 value={newClient.city} onChange={e => setNewClient({ ...newClient, city: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Estado (UF)</label>
                              <input type="text" maxLength={2} className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 value={newClient.state} onChange={e => setNewClient({ ...newClient, state: e.target.value })} />
                           </div>
                        </div>
                     </div>

                     {/* 2. MÉTRICAS E PORTE */}
                     <div>
                        <h4 className="text-sm font-bold text-pot-orange uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center">
                           <Users size={16} className="mr-2" /> Porte & Métricas
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Qtd. Colaboradores</label>
                              <input type="number" min="0" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 value={newClient.employeeCount} onChange={e => setNewClient({ ...newClient, employeeCount: Number(e.target.value) })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Qtd. Clientes</label>
                              <input type="number" min="0" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 value={newClient.clientCount} onChange={e => setNewClient({ ...newClient, clientCount: Number(e.target.value) })} />
                           </div>
                           <div className="flex flex-col justify-end space-y-2">
                              <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 p-2 rounded border border-gray-200 w-full hover:bg-gray-100">
                                 <input type="checkbox" className="form-checkbox h-4 w-4 text-pot-orange rounded focus:ring-pot-orange bg-white border-gray-300"
                                    checked={newClient.hasMappedProcesses}
                                    onChange={e => setNewClient({ ...newClient, hasMappedProcesses: e.target.checked })} />
                                 <span className="text-sm text-gray-700">Processos Mapeados?</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer bg-yellow-50 p-2 rounded border border-yellow-200 w-full hover:bg-yellow-100">
                                 <input type="checkbox" className="form-checkbox h-4 w-4 text-yellow-500 rounded focus:ring-yellow-500 bg-white border-gray-300"
                                    checked={newClient.isReference}
                                    onChange={e => setNewClient({ ...newClient, isReference: e.target.checked })} />
                                 <span className="text-sm text-yellow-800 font-bold flex items-center"><Star size={12} className="mr-1" /> Cliente Referência?</span>
                              </label>
                           </div>
                        </div>
                     </div>

                     {/* 3. STACK TECNOLÓGICO */}
                     <div>
                        <h4 className="text-sm font-bold text-pot-orange uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center">
                           <Database size={16} className="mr-2" /> Stack Tecnológico
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Software Contábil</label>
                              <select className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                                 value={newClient.softwareAccounting} onChange={e => setNewClient({ ...newClient, softwareAccounting: e.target.value })}>
                                 <option value="">-- Selecione --</option>
                                 <option value="Domínio Sistemas">Domínio Sistemas</option>
                                 <option value="Alterdata">Alterdata</option>
                                 <option value="Questor">Questor</option>
                                 <option value="Nasajon">Nasajon</option>
                                 <option value="SCI">SCI</option>
                                 <option value="Outros">Outros</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Captura de Notas</label>
                              <select className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                                 value={newClient.softwareNoteCapture} onChange={e => setNewClient({ ...newClient, softwareNoteCapture: e.target.value })}>
                                 <option value="">-- Selecione --</option>
                                 <option value="Gieg">Gieg</option>
                                 <option value="Sieq">Sieq</option>
                                 <option value="Arquivei">Arquivei</option>
                                 <option value="Outros">Outros</option>
                                 <option value="Não utiliza">Não utiliza</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Conversor de Arquivos</label>
                              <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 placeholder="Ex: Conversor Pro"
                                 value={newClient.softwareFileConverter} onChange={e => setNewClient({ ...newClient, softwareFileConverter: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Gestão de WhatsApp</label>
                              <select className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                                 value={newClient.softwareWhatsapp} onChange={e => setNewClient({ ...newClient, softwareWhatsapp: e.target.value })}>
                                 <option value="">-- Selecione --</option>
                                 <option value="Zappy">Zappy</option>
                                 <option value="ChatGuru">ChatGuru</option>
                                 <option value="Sirena">Sirena</option>
                                 <option value="WhatsApp Business">WhatsApp Business (Sem API)</option>
                                 <option value="Outros">Outros</option>
                              </select>
                           </div>
                        </div>
                     </div>

                  </form>

                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                     <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium text-sm"
                     >
                        Cancelar
                     </button>
                     <button
                        onClick={handleCreateClient}
                        className="px-6 py-2 bg-pot-success text-white rounded shadow hover:bg-green-700 font-bold text-sm flex items-center"
                     >
                        <Check size={18} className="mr-2" /> Salvar Cliente
                     </button>
                  </div>

               </div>
            </div>
         )}

      </div>
   );
};

export default Clients;
