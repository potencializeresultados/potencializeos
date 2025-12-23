
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Ticket, TicketInteraction, User, Task, Project, ProjectMeeting, LedgerEntry } from '../types';
import { TaskService } from '../services/taskService';
import { ProjectService } from '../services/projectService';
import { SupportService } from '../services/supportService';
import { FinancialService } from '../services/financialService';
import { FileText, Clock, AlertTriangle, CheckCircle, ThumbsUp, MessageSquare, Plus, Send, X, User as UserIcon, Paperclip, Trash2, File, Upload, Calendar, List, CheckSquare, Video, ExternalLink } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const ClientPortal: React.FC = () => {
   const { user } = useOutletContext<{ user: User }>();
   const [loading, setLoading] = useState(true);

   // Data State
   const [projects, setProjects] = useState<Project[]>([]);
   const [tasksList, setTasksList] = useState<Task[]>([]);
   const [myTickets, setMyTickets] = useState<Ticket[]>([]);
   const [myMeetings, setMyMeetings] = useState<ProjectMeeting[]>([]);
   const [ledger, setLedger] = useState<LedgerEntry[]>([]);

   // UI State
   const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
   const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
   const [taskNote, setTaskNote] = useState('');

   // Mock Local State for Task Metadata (Keep local for now or move to service if supported)
   const [taskAttachments, setTaskAttachments] = useState<{ taskId: number, name: string, size: string }[]>([]);
   const [taskComments, setTaskComments] = useState<{ taskId: number, text: string, date: string, author: string }[]>([]);

   // New Ticket Form State
   const [newTicketForm, setNewTicketForm] = useState({
      title: '',
      description: '',
      area: 'Sucesso do Cliente',
      priority: 'Média',
      projectId: ''
   });

   // Chat Input State
   const [chatInput, setChatInput] = useState('');

   useEffect(() => {
      loadData();
   }, [user]);

   const loadData = async () => {
      try {
         const [allProjects, allTasks, allTickets, allLedger] = await Promise.all([
            ProjectService.getAll(),
            TaskService.getAll(),
            SupportService.getAll(),
            FinancialService.getLedger()
         ]);

         // Filter for Current Client
         const clientProjects = allProjects.filter(p => p.clientName === user.companyName);
         const clientProjectIds = clientProjects.map(p => p.id);

         setProjects(clientProjects);

         // Filter Tasks: Assigned to client AND related to their projects
         setTasksList(allTasks.filter(t =>
            t.assigneeType === 'client' &&
            t.status !== 'completed' &&
            (clientProjectIds.includes(t.projectId || 0) || t.projectRef === user.companyName)
         ));

         // Filter Tickets: Related to their projects
         setMyTickets(allTickets.filter(t => clientProjectIds.includes(t.projectId)));

         // Filter Ledger: By Company Name
         setLedger(allLedger.filter(l => l.clientName === user.companyName));

         // Fetch Meetings for each project
         const meetingsPromises = clientProjectIds.map(id => ProjectService.getMeetings(id));
         const meetingsArrays = await Promise.all(meetingsPromises);
         const consolidatedMeetings = meetingsArrays.flat().filter(m => new Date(m.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

         setMyMeetings(consolidatedMeetings);

      } catch (error) {
         console.error("Error loading client data", error);
      } finally {
         setLoading(false);
      }
   };

   const myProjects = projects;
   const myPendingTasks = tasksList;
   const ledgerBalance = ledger.reduce((acc, curr) => {
      return curr.type === 'credit' ? acc + curr.amount : acc - curr.amount;
   }, 0);

   // --- Task Helpers ---

   const handleAddTaskNote = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTask || !taskNote.trim()) return;

      const newComment = {
         taskId: selectedTask.id,
         text: taskNote,
         date: new Date().toISOString(),
         author: user.name
      };

      setTaskComments([...taskComments, newComment]);
      setTaskNote('');
   };

   const handleUploadFile = () => {
      if (!selectedTask) return;
      const newFile = {
         taskId: selectedTask.id,
         name: `Documento_Anexo_${Math.floor(Math.random() * 100)}.pdf`,
         size: `${(Math.random() * 5).toFixed(1)} MB`
      };
      setTaskAttachments([...taskAttachments, newFile]);
      alert("Arquivo anexado com sucesso!");
   };

   const handleRemoveFile = (fileName: string) => {
      setTaskAttachments(taskAttachments.filter(f => f.name !== fileName));
   };

   const handleCompleteTask = (taskId: number) => {
      alert(`Tarefa #${taskId} marcada como concluída/aprovada!`);
      setTasksList(tasksList.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      setSelectedTask(null);
   };

   const handleToggleSubTask = (subTaskId: number) => {
      if (!selectedTask || !selectedTask.subTasks) return;

      const updatedSubTasks = selectedTask.subTasks.map(st =>
         st.id === subTaskId ? { ...st, completed: !st.completed } : st
      );

      const updatedTask = { ...selectedTask, subTasks: updatedSubTasks };
      setSelectedTask(updatedTask);
      setTasksList(tasksList.map(t => t.id === selectedTask.id ? updatedTask : t));
   };

   const getProgress = (task: Task) => {
      if (!task.subTasks || task.subTasks.length === 0) return 0;
      const completed = task.subTasks.filter(st => st.completed).length;
      return Math.round((completed / task.subTasks.length) * 100);
   };

   // --- Ticket Helpers ---
   const handleCreateTicket = async (e: React.FormEvent) => {
      e.preventDefault();
      const selectedProjId = newTicketForm.projectId ? Number(newTicketForm.projectId) : (myProjects[0]?.id || 0);

      const newTicketData: Partial<Ticket> = {
         projectId: selectedProjId,
         title: newTicketForm.title,
         description: newTicketForm.description,
         type: 'Dúvida',
         area: newTicketForm.area as any,
         priority: newTicketForm.priority as any,
         status: 'Aberto',
         openedBy: user.name,
         assignedTo: 'A definir',
      };

      try {
         const createdTicket = await SupportService.create(newTicketData);
         setMyTickets([createdTicket, ...myTickets]);
         setIsTicketModalOpen(false);
         setNewTicketForm({ title: '', description: '', area: 'Sucesso do Cliente', priority: 'Média', projectId: '' });
         setActiveTicket(createdTicket);
         alert('Chamado criado com sucesso!');
      } catch (error) {
         console.error("Failed to create ticket", error);
         alert('Erro ao criar chamado. Tente novamente.');
      }
   };

   const handleSendReply = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeTicket || !chatInput.trim()) return;

      try {
         const interaction = await SupportService.addInteraction(activeTicket.id, chatInput, 'client');

         // Update local state
         const updatedTicket = {
            ...activeTicket,
            interactions: interaction ? [...(activeTicket.interactions || []), interaction] : activeTicket.interactions
         };

         setMyTickets(myTickets.map(t => t.id === activeTicket.id ? updatedTicket : t));
         setActiveTicket(updatedTicket);
         setChatInput('');
      } catch (error) {
         console.error("Failed to send reply", error);
         alert('Erro ao enviar resposta.');
      }
   };

   return (
      <div className="space-y-8 max-w-7xl mx-auto">

         <div className="flex justify-between items-center mb-2">
            <div>
               <h1 className="text-3xl font-bold text-pot-petrol">Olá, {user.name.split(' ')[0]}!</h1>
               <p className="text-gray-500">Acompanhe aqui o andamento dos seus projetos e pendências.</p>
            </div>
            <div className="hidden md:block text-right">
               <p className="text-sm font-bold text-gray-600">{user.companyName}</p>
               <p className="text-xs text-gray-400">Portal do Cliente v2.0</p>
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* LEFT COLUMN (2/3) - ACTION & PROJECTS */}
            <div className="xl:col-span-2 space-y-8">

               {/* 1. SUAS PENDÊNCIAS (TAREFAS) */}
               <section>
                  <h2 className="text-xl font-bold text-pot-petrol flex items-center mb-4">
                     <div className="bg-pot-orange p-1.5 rounded-lg mr-3 shadow-sm">
                        <AlertTriangle className="text-white" size={20} />
                     </div>
                     Sua Vez de Agir
                  </h2>

                  {myPendingTasks.length > 0 ? (
                     <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-pot-orange"></div>
                        <div className="divide-y divide-gray-100">
                           {myPendingTasks.map(task => (
                              <div
                                 key={task.id}
                                 className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group"
                                 onClick={() => setSelectedTask(task)}
                              >
                                 <div className="pl-2">
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wide">Ação Necessária</span>
                                       <span className="text-xs text-gray-400 font-medium">{task.projectRef}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-gray-800 group-hover:text-pot-petrol transition-colors">{task.title}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                                 </div>

                                 <div className="flex items-center gap-4 pl-2 sm:pl-0 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="text-right mr-2 hidden sm:block">
                                       <p className="text-[10px] text-gray-400 uppercase font-bold">Vencimento</p>
                                       <p className={`text-sm font-bold ${new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                                          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                       </p>
                                    </div>
                                    <button
                                       onClick={(e) => { e.stopPropagation(); handleCompleteTask(task.id); }}
                                       className="px-4 py-2 bg-white border border-pot-petrol text-pot-petrol hover:bg-pot-petrol hover:text-white font-bold rounded-lg text-sm transition-all shadow-sm flex items-center"
                                    >
                                       {task.title.toLowerCase().includes('aprovar') ? <ThumbsUp size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                                       {task.title.toLowerCase().includes('aprovar') ? 'Aprovar' : 'Concluir'}
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                           <CheckCircle size={32} />
                        </div>
                        <p className="text-lg text-gray-800 font-bold">Tudo em dia!</p>
                        <p className="text-gray-500 text-sm">Você não tem pendências no momento.</p>
                     </div>
                  )}
               </section>

               {/* 2. PROJETOS (PROGRESSO) */}
               <section>
                  <h2 className="text-xl font-bold text-pot-petrol flex items-center mb-4">
                     <div className="bg-blue-600 p-1.5 rounded-lg mr-3 shadow-sm">
                        <FileText className="text-white" size={20} />
                     </div>
                     Progresso dos Projetos
                  </h2>

                  {myProjects.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {myProjects.map(proj => (
                           <div key={proj.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3 relative z-10">
                                 <h4 className="font-bold text-gray-800 line-clamp-1 pr-2" title={proj.title}>{proj.title}</h4>
                                 <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase shrink-0 ${proj.status === 'Aguardando Aprovação' ? 'bg-orange-100 text-orange-800' :
                                    proj.status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-blue-50 text-blue-700'
                                    }`}>{proj.status}</span>
                              </div>

                              <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1">{proj.description || 'Sem descrição.'}</p>

                              <div className="mt-auto">
                                 <div className="flex justify-between text-xs text-gray-500 mb-1 font-bold">
                                    <span>Conclusão</span>
                                    <span>{proj.progress}%</span>
                                 </div>
                                 <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                       className={`h-full rounded-full ${proj.progress === 100 ? 'bg-green-500' : 'bg-pot-petrol'}`}
                                       style={{ width: `${proj.progress}%` }}
                                    ></div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="p-8 bg-white rounded-xl shadow border border-gray-200 text-center text-gray-500">
                        <p>Você não possui projetos vinculados no momento.</p>
                     </div>
                  )}
               </section>

            </div>

            {/* RIGHT COLUMN (1/3) - MEETINGS, TICKETS, INFO */}
            <div className="space-y-8">

               {/* 3. AGENDA (NOVO) */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                     <h3 className="font-bold text-pot-petrol flex items-center">
                        <Calendar className="mr-2 text-pot-orange" size={18} /> Próximas Reuniões
                     </h3>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                     {myMeetings.length > 0 ? (
                        myMeetings.map(meeting => (
                           <div key={meeting.id} className="p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                 <div className="bg-blue-100 text-blue-700 rounded-lg p-2 text-center min-w-[50px]">
                                    <span className="block text-[10px] font-bold uppercase">{new Date(meeting.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="block text-lg font-bold leading-none">{new Date(meeting.date).getDate()}</span>
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-800 leading-tight mb-1">{meeting.title}</h4>
                                    <div className="flex items-center text-xs text-gray-500 mb-2">
                                       <Clock size={12} className="mr-1" />
                                       {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                       <span className="mx-1">•</span>
                                       {meeting.durationMinutes} min
                                    </div>
                                    {meeting.link && (
                                       <a
                                          href={meeting.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center text-[10px] bg-pot-petrol text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                                       >
                                          <Video size={10} className="mr-1" /> Entrar na Sala
                                       </a>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="p-6 text-center text-gray-400 text-xs italic">
                           Nenhuma reunião agendada em breve.
                        </div>
                     )}
                  </div>
               </div>

               {/* 4. CHAMADOS */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                     <h3 className="font-bold text-pot-petrol flex items-center">
                        <MessageSquare className="mr-2 text-pot-magenta" size={18} /> Chamados Recentes
                     </h3>
                     <button
                        onClick={() => setIsTicketModalOpen(true)}
                        className="text-xs bg-white border border-gray-300 hover:border-pot-magenta hover:text-pot-magenta px-2 py-1 rounded transition-colors font-medium"
                     >
                        + Novo
                     </button>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                     {myTickets.length > 0 ? (
                        myTickets.slice(0, 5).map(ticket => (
                           <div
                              key={ticket.id}
                              onClick={() => setActiveTicket(ticket)}
                              className="p-4 hover:bg-blue-50 cursor-pointer transition-colors group"
                           >
                              <div className="flex justify-between items-start mb-1">
                                 <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ticket.status === 'Resolvido' ? 'bg-green-100 text-green-800' :
                                    ticket.status === 'Aguardando Cliente' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {ticket.status === 'Aguardando Cliente' ? 'Sua Resposta' : ticket.status}
                                 </span>
                                 <span className="text-[10px] text-gray-400">{new Date(ticket.updatedAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 truncate">{ticket.title}</h4>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{ticket.description}</p>
                           </div>
                        ))
                     ) : (
                        <div className="p-6 text-center text-gray-400 text-xs italic">
                           Nenhum chamado aberto.
                        </div>
                     )}
                  </div>
                  {myTickets.length > 5 && (
                     <div className="p-2 text-center border-t border-gray-100">
                        <button className="text-xs text-blue-600 font-bold hover:underline">Ver todos</button>
                     </div>
                  )}
               </div>

               {/* BANCO DE HORAS */}
               <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-pot-petrol">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-gray-700 flex items-center">
                        <Clock className="text-pot-petrol mr-2" size={18} /> Banco de Horas
                     </h3>
                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Mensal</span>
                  </div>

                  <div className="flex items-end justify-between mb-2">
                     <div>
                        <p className="text-xs text-gray-500 uppercase">Saldo Disponível</p>
                        <p className="text-3xl font-bold text-pot-success">{ledgerBalance.toFixed(1)}h</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-gray-400">Consumido</p>
                        <p className="text-sm font-bold text-gray-600">6.5h</p>
                     </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                     <div className="bg-pot-success h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                     <img src="https://picsum.photos/101/101" alt="Consultant" className="w-10 h-10 rounded-full border border-white" />
                     <div>
                        <p className="text-xs font-bold text-blue-900">João Consultor</p>
                        <p className="text-[10px] text-blue-700">Seu Gerente de Sucesso</p>
                     </div>
                     <a href="#" className="ml-auto text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100">
                        Contato
                     </a>
                  </div>
               </div>

            </div>

         </div>

         {/* --- TASK DETAILS MODAL (FULL FEATURES) --- */}
         {selectedTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden animate-fade-in">

                  {/* Modal Header */}
                  <div className="bg-pot-petrol px-6 py-4 text-white shrink-0 flex justify-between items-start">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">{selectedTask.projectRef || 'Projeto'}</span>
                           <span className="text-xs opacity-70 flex items-center">
                              <Calendar size={12} className="mr-1" /> Vence: {new Date(selectedTask.dueDate).toLocaleDateString('pt-BR')}
                           </span>
                        </div>
                        <h3 className="text-xl font-bold leading-tight">{selectedTask.title}</h3>
                     </div>
                     <button onClick={() => setSelectedTask(null)} className="text-gray-300 hover:text-white p-1">
                        <X size={24} />
                     </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">

                     {/* Description */}
                     <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                           <FileText size={16} className="mr-2 text-pot-petrol" /> Descrição da Tarefa
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                           {selectedTask.description || 'Sem descrição detalhada.'}
                        </p>
                     </div>

                     {/* Subtasks / Checklist (Added for Parity) */}
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h4 className="text-sm font-bold text-pot-petrol mb-3 flex items-center">
                           <List size={16} className="mr-2 text-pot-orange" /> Checklist / Sub-tarefas
                        </h4>
                        <div className="mb-4">
                           <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progresso</span>
                              <span>{getProgress(selectedTask)}%</span>
                           </div>
                           <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-pot-success h-2 rounded-full transition-all duration-300" style={{ width: `${getProgress(selectedTask)}%` }}></div>
                           </div>
                        </div>
                        <div className="space-y-2 mb-4">
                           {selectedTask.subTasks && selectedTask.subTasks.length > 0 ? (
                              selectedTask.subTasks.map(sub => (
                                 <div key={sub.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 group">
                                    <div
                                       className="flex items-center cursor-pointer flex-1"
                                       onClick={() => handleToggleSubTask(sub.id)}
                                    >
                                       <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors ${sub.completed ? 'bg-pot-success border-pot-success' : 'border-gray-300 bg-white'}`}>
                                          {sub.completed && <CheckSquare size={10} className="text-white" />}
                                       </div>
                                       <span className={`text-sm ${sub.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                          {sub.title}
                                       </span>
                                    </div>
                                 </div>
                              ))
                           ) : (
                              <p className="text-xs text-gray-400 italic text-center py-2">Nenhuma sub-tarefa adicionada.</p>
                           )}
                        </div>
                     </div>

                     {/* Documents / Attachments */}
                     <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="text-sm font-bold text-gray-700 flex items-center">
                              <Paperclip size={16} className="mr-2 text-pot-petrol" /> Documentos & Anexos
                           </h4>
                           <button
                              onClick={handleUploadFile}
                              className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 flex items-center font-bold"
                           >
                              <Upload size={12} className="mr-1" /> Anexar Arquivo
                           </button>
                        </div>

                        {taskAttachments.filter(a => a.taskId === selectedTask.id).length > 0 ? (
                           <div className="space-y-2">
                              {taskAttachments.filter(a => a.taskId === selectedTask.id).map((file, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded hover:bg-gray-100">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                       <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0">
                                          <File size={16} />
                                       </div>
                                       <div className="min-w-0">
                                          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                          <p className="text-[10px] text-gray-500">{file.size}</p>
                                       </div>
                                    </div>
                                    <button
                                       onClick={() => handleRemoveFile(file.name)}
                                       className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                              Nenhum documento anexado.
                           </div>
                        )}
                     </div>

                     {/* Notes / Comments */}
                     <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                           <MessageSquare size={16} className="mr-2 text-pot-petrol" /> Anotações e Comentários
                        </h4>

                        <div className="bg-gray-50 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto mb-3 space-y-3">
                           {taskComments.filter(c => c.taskId === selectedTask.id).length > 0 ? (
                              taskComments.filter(c => c.taskId === selectedTask.id).map((comment, idx) => (
                                 <div key={idx} className="flex flex-col text-sm">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                       <span className="font-bold text-gray-700">{comment.author}</span>
                                       <span>{new Date(comment.date).toLocaleDateString('pt-BR')} {new Date(comment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-200 text-gray-700">
                                       {comment.text}
                                    </div>
                                 </div>
                              ))
                           ) : (
                              <p className="text-xs text-gray-400 text-center italic mt-4">Nenhuma observação registrada.</p>
                           )}
                        </div>

                        <form onSubmit={handleAddTaskNote} className="flex gap-2">
                           <input
                              type="text"
                              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-pot-orange outline-none"
                              placeholder="Digite uma observação..."
                              value={taskNote}
                              onChange={e => setTaskNote(e.target.value)}
                           />
                           <button type="submit" className="bg-gray-800 text-white p-2 rounded hover:bg-gray-900 transition-colors">
                              <Send size={16} />
                           </button>
                        </form>
                     </div>

                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
                     <button
                        onClick={() => setSelectedTask(null)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium text-sm"
                     >
                        Fechar
                     </button>

                     {selectedTask.title.toLowerCase().includes('aprovar') ? (
                        <button
                           onClick={() => handleCompleteTask(selectedTask.id)}
                           className="px-6 py-2 bg-pot-success text-white font-bold rounded shadow hover:bg-green-700 flex items-center text-sm"
                        >
                           <ThumbsUp size={18} className="mr-2" /> Aprovar Entrega
                        </button>
                     ) : (
                        <button
                           onClick={() => handleCompleteTask(selectedTask.id)}
                           className="px-6 py-2 bg-pot-petrol text-white font-bold rounded shadow hover:bg-gray-800 flex items-center text-sm"
                        >
                           <CheckCircle size={18} className="mr-2" /> Concluir Tarefa
                        </button>
                     )}
                  </div>

               </div>
            </div>
         )}

         {/* NEW TICKET MODAL */}
         {isTicketModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white">
                     <h3 className="font-bold flex items-center">
                        <MessageSquare size={18} className="mr-2" /> Novo Chamado
                     </h3>
                     <button onClick={() => setIsTicketModalOpen(false)}><X size={20} /></button>
                  </div>
                  <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Assunto</label>
                        <input required type="text" className="w-full border border-gray-300 rounded p-2 focus:border-pot-orange outline-none bg-white text-gray-900"
                           value={newTicketForm.title} onChange={e => setNewTicketForm({ ...newTicketForm, title: e.target.value })} placeholder="Resumo do problema..." />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Projeto Relacionado</label>
                        <select
                           className="w-full border border-gray-300 rounded p-2 outline-none bg-white text-gray-900"
                           value={newTicketForm.projectId}
                           onChange={e => setNewTicketForm({ ...newTicketForm, projectId: e.target.value })}
                        >
                           {myProjects.map(p => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                           ))}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Área</label>
                           <select className="w-full border border-gray-300 rounded p-2 outline-none bg-white text-gray-900"
                              value={newTicketForm.area} onChange={e => setNewTicketForm({ ...newTicketForm, area: e.target.value })}>
                              <option>Sucesso do Cliente</option>
                              <option>Fiscal</option>
                              <option>Contábil</option>
                              <option>Pessoal</option>
                              <option>TI</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Prioridade</label>
                           <select className="w-full border border-gray-300 rounded p-2 outline-none bg-white text-gray-900"
                              value={newTicketForm.priority} onChange={e => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}>
                              <option>Baixa</option>
                              <option>Média</option>
                              <option>Alta</option>
                              <option>Urgente</option>
                           </select>
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                        <textarea required className="w-full h-32 border border-gray-300 rounded p-2 resize-none focus:border-pot-orange outline-none bg-white text-gray-900"
                           value={newTicketForm.description} onChange={e => setNewTicketForm({ ...newTicketForm, description: e.target.value })} placeholder="Descreva o que aconteceu..."></textarea>
                     </div>
                     <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsTicketModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-pot-success text-white font-bold rounded shadow hover:bg-green-700">Abrir Chamado</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* VIEW TICKET / CHAT MODAL */}
         {activeTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-fade-in">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0">
                     <div>
                        <div className="flex items-center gap-2">
                           <span className="bg-white/20 px-2 py-0.5 rounded text-xs">#{activeTicket.id}</span>
                           <h3 className="font-bold">{activeTicket.title}</h3>
                        </div>
                        <p className="text-xs text-gray-300 mt-1">{activeTicket.area} • {activeTicket.status}</p>
                     </div>
                     <button onClick={() => setActiveTicket(null)}><X size={20} /></button>
                  </div>

                  {/* Chat History */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                     {activeTicket.interactions?.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'client' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${msg.role === 'client'
                              ? 'bg-blue-100 text-blue-900 rounded-tr-none'
                              : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'
                              }`}>
                              <p className="text-xs font-bold mb-1 opacity-70">{msg.sender}</p>
                              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                              <p className="text-[10px] text-right mt-1 opacity-50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 bg-white border-t border-gray-200">
                     {activeTicket.status === 'Resolvido' ? (
                        <div className="text-center p-2 bg-green-50 text-green-700 rounded border border-green-200 text-sm">
                           Este chamado foi marcado como resolvido. <button className="underline font-bold">Reabrir?</button>
                        </div>
                     ) : (
                        <form onSubmit={handleSendReply} className="flex gap-2">
                           <input
                              type="text"
                              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-pot-orange outline-none text-sm bg-white text-gray-900"
                              placeholder="Digite uma resposta..."
                              value={chatInput}
                              onChange={e => setChatInput(e.target.value)}
                           />
                           <button type="submit" className="bg-pot-petrol text-white p-2 rounded-full hover:bg-gray-800 transition-colors shadow-sm">
                              <Send size={18} />
                           </button>
                        </form>
                     )}
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default ClientPortal;
