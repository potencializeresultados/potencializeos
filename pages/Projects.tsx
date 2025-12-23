
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MOCK_TASKS, MOCK_TICKETS, MOCK_PROJECT_MEETINGS, MOCK_PROJECT_DOCUMENTS, MOCK_PROJECT_NOTES, MOCK_USERS } from '../constants'; // MOCK_PROJECTS removed
import { Project, Ticket, TicketInteraction, Task, User, UserRole, SubTask, ProjectMeeting } from '../types';
import { ProjectService } from '../services/projectService';
import { TaskService } from '../services/taskService';
import { generateActionPlan } from '../services/ai';
import {
   ArrowRight,
   BarChart2,
   Calendar,
   X,
   Briefcase,
   User as UserIcon,
   CheckCircle,
   Clock,
   AlertTriangle,
   Settings,
   Phone,
   Tag,
   Users,
   MessageSquare,
   Video,
   List,
   Filter,
   Plus,
   Search,
   ExternalLink,
   FileText,
   Download,
   MoreVertical,
   Check,
   Send,
   Zap,
   Building,
   Save,
   CheckSquare,
   Lock,
   Flag,
   UserCheck,
   Trash2,
   MapPin
} from 'lucide-react';

const Projects: React.FC = () => {
   const { user } = useOutletContext<{ user: User }>();
   const [selectedProject, setSelectedProject] = useState<Project | null>(null);
   const [activeTab, setActiveTab] = useState('visão geral');
   const [aiPlan, setAiPlan] = useState<string | null>(null);
   const [isLoadingAi, setIsLoadingAi] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');

   // Determine Role & Access
   const isClient = user.role === UserRole.CLIENT_USER || user.role === UserRole.CLUB_MEMBER;

   // API State
   const [projectsList, setProjectsList] = useState<Project[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadProjects();
   }, []);

   const loadProjects = async () => {
      try {
         const data = await ProjectService.getAll(); // Fetch real data
         setProjectsList(data);
      } catch (error) {
         console.error("Failed to load projects", error);
      } finally {
         setLoading(false);
      }
   };

   // 1. Filter Projects based on Role (Security)
   // Note: Backend should already filter this, but keeping for safety if endpoint returns all
   const accessibleProjects = isClient
      ? projectsList.filter(p => p.clientName === user.companyName)
      : projectsList;

   // 2. Filter by Search Term (UI)
   const displayedProjects = accessibleProjects.filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
   );

   // Filter Data based on selected project
   // Using a local state wrapper for tasks to allow instant updates
   const [projectTasks, setProjectTasks] = useState<Task[]>([]);
   // Local state for meetings to update instantly
   const [localMeetings, setLocalMeetings] = useState<ProjectMeeting[]>([]);

   useEffect(() => {
      const fetchProjectDetails = async () => {
         if (selectedProject) {
            try {
               // Parallel fetch for sub-resources
               const [tasks, meetings] = await Promise.all([
                  TaskService.getAll(), // Ideally filter by project in API: TaskService.getByProject(selectedProject.id)
                  ProjectService.getMeetings(selectedProject.id)
               ]);

               // Filter tasks locally for now as getAll returns all
               setProjectTasks(tasks.filter(t => t.projectId === selectedProject.id));
               setLocalMeetings(meetings);
            } catch (error) {
               console.error("Error fetching project details", error);
            }
         }
      };
      fetchProjectDetails();
   }, [selectedProject]);

   const projectTickets = selectedProject ? MOCK_TICKETS.filter(t => t.projectId === selectedProject.id) : [];
   const projectDocs = selectedProject ? MOCK_PROJECT_DOCUMENTS.filter(d => d.projectId === selectedProject.id) : [];
   const projectNotes = selectedProject ? MOCK_PROJECT_NOTES.filter(n => n.projectId === selectedProject.id) : [];

   // Edit Project Settings State
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [editFormData, setEditFormData] = useState<Partial<Project>>({});

   // Client Access Modal State
   const [isClientAccessModalOpen, setIsClientAccessModalOpen] = useState(false);
   const [newClientUser, setNewClientUser] = useState({ name: '', email: '', password: '' });

   // Ticket Detail View State
   const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
   const [ticketReply, setTicketReply] = useState('');

   // Task Creation State
   const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
   const [newTaskForm, setNewTaskForm] = useState({
      title: '',
      description: '',
      assignedTo: '',
      assigneeType: 'consultant' as 'consultant' | 'client',
      dueDate: ''
   });
   // New Checklist State for Creation
   const [newTaskChecklist, setNewTaskChecklist] = useState<string[]>([]);
   const [tempChecklistInput, setTempChecklistInput] = useState('');

   // Task Detail/Edit View State
   const [viewTask, setViewTask] = useState<Task | null>(null);
   const [editSubTaskTitle, setEditSubTaskTitle] = useState('');

   // --- Meeting Creation State ---
   const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
   const [newMeetingForm, setNewMeetingForm] = useState({
      subject: '', // Pauta
      department: 'Sucesso do Cliente',
      stageId: '',
      date: '',
      duration: 60,
      link: ''
   });

   const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('pt-BR');
   };

   const getStatusColor = (status: Project['status']) => {
      switch (status) {
         case 'Em Andamento': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
         case 'Aguardando Aprovação': return 'bg-red-100 text-red-800 border-red-200';
         case 'Concluído': return 'bg-green-100 text-green-800 border-green-200';
         case 'Coleta de Dados': return 'bg-blue-100 text-blue-800 border-blue-200';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const handleGeneratePlan = async () => {
      if (!selectedProject) return;
      setIsLoadingAi(true);
      const plan = await generateActionPlan(`${selectedProject.title} - ${selectedProject.description}`);
      setAiPlan(plan);
      setIsLoadingAi(false);
   };

   // --- Handlers for Project Settings ---

   const handleOpenEditSettings = () => {
      if (selectedProject) {
         setEditFormData({ ...selectedProject });
         setIsEditModalOpen(true);
      }
   };

   const handleSaveSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProject || !editFormData) return;

      try {
         const updatedProject = await ProjectService.update(selectedProject.id, editFormData);

         // Update Local State
         setProjectsList(projectsList.map(p => p.id === updatedProject.id ? updatedProject : p));
         setSelectedProject(updatedProject);
         setIsEditModalOpen(false);
         alert('Configurações salvas!');
      } catch (error) {
         console.error("Failed to update project", error);
         alert("Erro ao salvar configurações");
      }
   };

   const checkSLA = (ticket: Ticket) => {
      // Rule: Response within 10 minutes from last Client interaction if ticket is NOT resolved
      if (ticket.status === 'Resolvido') return { status: 'ok', text: 'Resolvido' };

      const lastInteraction = ticket.interactions && ticket.interactions.length > 0
         ? ticket.interactions[ticket.interactions.length - 1]
         : null;

      if (!lastInteraction) return { status: 'ok', text: 'Novo' };

      // If last person to speak was support, we are waiting for client
      if (lastInteraction.role === 'support') return { status: 'ok', text: 'Aguardando Cliente' };

      // If last person was client, check time
      const diffMs = new Date().getTime() - new Date(lastInteraction.createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins > 10) return { status: 'breach', text: `+${diffMins} min (Meta 10)` };
      if (diffMins > 5) return { status: 'warning', text: `${diffMins} min` };
      return { status: 'ok', text: 'No prazo' };
   };

   const handleReplyTicket = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTicket || !ticketReply.trim()) return;

      const newInteraction: TicketInteraction = {
         id: Math.random(),
         text: ticketReply,
         sender: 'Consultor (Você)',
         role: 'support',
         createdAt: new Date().toISOString()
      };

      const updatedTicket = {
         ...selectedTicket,
         status: 'Aguardando Cliente' as const,
         updatedAt: new Date().toISOString(),
         interactions: [...(selectedTicket.interactions || []), newInteraction]
      };

      // Update local state (in a real app, this would be an API call and re-fetch)
      const ticketIndex = MOCK_TICKETS.findIndex(t => t.id === selectedTicket.id);
      if (ticketIndex >= 0) MOCK_TICKETS[ticketIndex] = updatedTicket;

      setSelectedTicket(updatedTicket);
      setTicketReply('');
   };

   // --- Handlers for Task Creation ---

   const handleAddChecklistItem = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!tempChecklistInput.trim()) return;
      setNewTaskChecklist([...newTaskChecklist, tempChecklistInput]);
      setTempChecklistInput('');
   };

   const handleRemoveChecklistItem = (index: number) => {
      setNewTaskChecklist(newTaskChecklist.filter((_, i) => i !== index));
   };

   const handleCreateTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProject) return;

      // Convert string list to SubTask objects
      // Note: API expects creating subtasks separate or nested depending on serializer. 
      // Assuming nested creation is supported for simplicity or we do it later.
      const subTasksPayload = newTaskChecklist.map(title => ({
         title: title,
         completed: false
      }));

      const taskPayload: Partial<Task> = {
         title: newTaskForm.title,
         description: newTaskForm.description,
         status: 'pending',
         dueDate: newTaskForm.dueDate || new Date().toISOString().split('T')[0],
         assignedTo: newTaskForm.assignedTo, // Value is ID string? Need to check types.
         assigneeType: newTaskForm.assigneeType,
         projectId: selectedProject.id,
         projectRef: selectedProject.title,
         googleSynced: false,
         // subTasks: subTasksPayload // If backend supports nested write
      };

      try {
         const newTask = await TaskService.create(taskPayload);
         setProjectTasks([...projectTasks, newTask]);
         setIsTaskModalOpen(false);

         // Reset Form
         setNewTaskForm({ title: '', description: '', assignedTo: '', assigneeType: 'consultant', dueDate: '' });
         setNewTaskChecklist([]);
         setTempChecklistInput('');
         alert('Tarefa criada com sucesso!');
      } catch (error) {
         console.error("Erro ao criar tarefa", error);
         alert('Erro ao criar tarefa.');
      }
   };

   // --- Handlers for Meeting Creation ---
   const handleCreateMeeting = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProject) return;

      // Build title with Department context if desired, or just use subject
      const fullTitle = `${newMeetingForm.subject} (${newMeetingForm.department})`;

      const newMeeting: ProjectMeeting = {
         id: Math.floor(Math.random() * 100000),
         projectId: selectedProject.id,
         title: fullTitle,
         date: newMeetingForm.date,
         durationMinutes: newMeetingForm.duration,
         link: newMeetingForm.link || 'https://meet.google.com/new',
         attendees: ['Consultor', 'Cliente'] // Mock
      };

      MOCK_PROJECT_MEETINGS.push(newMeeting);
      setLocalMeetings([...localMeetings, newMeeting].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setIsMeetingModalOpen(false);

      // Reset
      setNewMeetingForm({
         subject: '',
         department: 'Sucesso do Cliente',
         stageId: '',
         date: '',
         duration: 60,
         link: ''
      });
      alert('Reunião agendada e convites enviados!');
   };

   // --- Handlers for Existing Task Edit (ViewTask Modal) ---

   const handleToggleSubTask = async (subTaskId: number) => {
      if (!viewTask || !viewTask.subTasks) return;

      const subTask = viewTask.subTasks.find(s => s.id === subTaskId);
      if (!subTask) return;

      try {
         await TaskService.toggleSubTask(subTaskId, !subTask.completed);

         // Update UI Optimistically
         const updatedSubTasks = viewTask.subTasks.map(st =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
         );

         const updatedTask = { ...viewTask, subTasks: updatedSubTasks };
         setViewTask(updatedTask);

         // Update List
         setProjectTasks(projectTasks.map(t => t.id === viewTask.id ? updatedTask : t));
      } catch (error) {
         console.error("Error updating subtask", error);
      }
   };

   const handleAddSubTaskToExisting = (e: React.FormEvent) => {
      e.preventDefault();
      if (!viewTask || !editSubTaskTitle.trim()) return;

      const newSub: SubTask = {
         id: Math.random(),
         title: editSubTaskTitle,
         completed: false
      };

      const updatedSubTasks = viewTask.subTasks ? [...viewTask.subTasks, newSub] : [newSub];
      const updatedTask = { ...viewTask, subTasks: updatedSubTasks };

      setViewTask(updatedTask);
      setEditSubTaskTitle('');

      // Update List & Mock
      setProjectTasks(projectTasks.map(t => t.id === viewTask.id ? updatedTask : t));
      const idx = MOCK_TASKS.findIndex(t => t.id === viewTask.id);
      if (idx >= 0) MOCK_TASKS[idx] = updatedTask;
   };

   const handleDeleteSubTaskFromExisting = (subTaskId: number) => {
      if (!viewTask || !viewTask.subTasks) return;

      const updatedSubTasks = viewTask.subTasks.filter(st => st.id !== subTaskId);
      const updatedTask = { ...viewTask, subTasks: updatedSubTasks };

      setViewTask(updatedTask);

      // Update List & Mock
      setProjectTasks(projectTasks.map(t => t.id === viewTask.id ? updatedTask : t));
      const idx = MOCK_TASKS.findIndex(t => t.id === viewTask.id);
      if (idx >= 0) MOCK_TASKS[idx] = updatedTask;
   };

   // Get users for dropdowns
   const consultants = MOCK_USERS.filter(u =>
      u.role === UserRole.CONSULTANT || u.role === UserRole.MANAGER_CS_OPS || u.role === UserRole.SUPER_ADMIN
   );

   const projectClientUsers = selectedProject
      ? MOCK_USERS.filter(u => u.companyName === selectedProject.clientName && (u.role === UserRole.CLIENT_USER || u.role === UserRole.CLUB_MEMBER))
      : [];

   const availableAssignees = newTaskForm.assigneeType === 'consultant' ? consultants : projectClientUsers;

   // --- Handler for Client Access ---
   const handleCreateClientAccess = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProject) return;

      const newUser: User = {
         id: Math.floor(Math.random() * 10000),
         name: newClientUser.name,
         email: newClientUser.email,
         password: newClientUser.password,
         role: UserRole.CLIENT_USER,
         roleId: 'client_basic',
         companyName: selectedProject.clientName,
         avatar: 'https://ui-avatars.com/api/?name=' + newClientUser.name
      };

      MOCK_USERS.push(newUser);
      setIsClientAccessModalOpen(false);
      setNewClientUser({ name: '', email: '', password: '' });
      alert('Acesso para o cliente criado com sucesso! E-mail de boas-vindas enviado (Simulação).');
   };

   // Separate tasks by assignee type
   const clientTasks = projectTasks.filter(t => t.assigneeType === 'client');
   const consultantTasks = projectTasks.filter(t => t.assigneeType === 'consultant');

   return (
      <div className="space-y-6 relative">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-pot-petrol">Projetos Ativos</h2>
               <p className="text-sm text-gray-500">Gestão de entregas, chamados e cronogramas.</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
               <input
                  type="text"
                  placeholder="Buscar projetos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-pot-orange outline-none bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProjects.map((project) => {
               // Determine SLA border color
               let slaBorderClass = 'border-l-gray-300';
               if (project.slaStatus === 'ok') slaBorderClass = 'border-l-pot-success';
               if (project.slaStatus === 'warning') slaBorderClass = 'border-l-pot-alert';
               if (project.slaStatus === 'delay') slaBorderClass = 'border-l-pot-error';

               return (
                  <div
                     key={project.id}
                     onClick={() => { setSelectedProject(project); setActiveTab('visão geral'); }}
                     className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-100 border-l-4 cursor-pointer group ${slaBorderClass}`}
                  >
                     <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.type === 'Assessoria' ? 'bg-purple-100 text-purple-800' :
                              project.type === 'Diagnóstico' ? 'bg-blue-100 text-blue-800' :
                                 'bg-green-100 text-green-800'
                              }`}>
                              {project.type}
                           </span>
                           <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(project.status)}`}>
                              {project.status}
                           </span>
                        </div>

                        <h3 className="text-lg font-bold text-pot-petrol mb-1 group-hover:text-pot-orange transition-colors">{project.title}</h3>
                        <p className="text-sm text-gray-500 mb-6">{project.clientName}</p>

                        <div className="space-y-4">
                           <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                 <span>Progresso</span>
                                 <span>{project.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                 <div
                                    className="bg-pot-orange h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${project.progress}%` }}
                                 ></div>
                              </div>
                           </div>

                           <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="flex items-center">
                                 <Calendar size={14} className="mr-2" />
                                 {new Date(project.lastUpdate).toLocaleDateString('pt-BR')}
                              </span>

                              {/* SLA Status Indicator Text */}
                              {project.slaStatus === 'warning' && (
                                 <span className="text-yellow-600 font-bold flex items-center" title="Atenção ao prazo">
                                    <AlertTriangle size={12} className="mr-1" /> Risco SLA
                                 </span>
                              )}
                              {project.slaStatus === 'delay' && (
                                 <span className="text-pot-error font-bold flex items-center" title="SLA Estourado">
                                    <AlertTriangle size={12} className="mr-1" /> Atrasado
                                 </span>
                              )}
                              {project.slaStatus === 'ok' && (
                                 <span className="text-pot-success font-bold flex items-center">
                                    <CheckCircle size={12} className="mr-1" /> SLA OK
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-mono">{project.code}</span>
                        <button className="p-2 rounded-full bg-white border border-gray-200 group-hover:bg-pot-orange group-hover:text-white group-hover:border-pot-orange transition-all text-gray-400">
                           <ArrowRight size={16} />
                        </button>
                     </div>
                  </div>
               )
            })}
            {displayedProjects.length === 0 && (
               <div className="col-span-full p-10 text-center bg-gray-100 rounded-xl border border-dashed border-gray-300 text-gray-500">
                  {accessibleProjects.length === 0
                     ? "Nenhum projeto encontrado para sua conta."
                     : "Nenhum projeto corresponde à sua busca."}
               </div>
            )}
         </div>

         {/* PROJECT DETAILS MODAL (ERP STYLE) */}
         {selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 md:p-4 backdrop-blur-sm">
               <div className="bg-white rounded-lg shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col overflow-hidden animate-fade-in text-sm text-gray-700">

                  {/* Top Bar */}
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shrink-0">
                     <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                           Projeto #{selectedProject.code}
                           {!isClient && (
                              <button
                                 onClick={handleOpenEditSettings}
                                 className="p-1 rounded hover:bg-gray-100 transition-colors"
                                 title="Configurações do Projeto"
                              >
                                 <Settings size={16} className="text-gray-400 hover:text-blue-600" />
                              </button>
                           )}
                        </h2>
                        <span className="px-3 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600 border border-gray-300">
                           {selectedProject.title}
                        </span>
                     </div>
                     <div className="flex items-center gap-4">
                        {/* Client Access Management Button (Internal Only) */}
                        {!isClient && (
                           <button
                              onClick={() => setIsClientAccessModalOpen(true)}
                              className="hidden md:flex items-center px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold text-xs hover:bg-blue-100 transition-colors"
                           >
                              <UserIcon size={14} className="mr-2" /> Gerenciar Acesso do Cliente
                           </button>
                        )}

                        {/* KPI Stats Top Right */}
                        <div className="hidden md:flex bg-gray-50 rounded border border-gray-200 divide-x divide-gray-200">
                           <div className="px-4 py-2 text-center">
                              <div className="text-xs text-gray-500 font-bold uppercase">SLA Status</div>
                              <div className={`text-lg font-bold ${selectedProject.slaStatus === 'ok' ? 'text-green-500' :
                                 selectedProject.slaStatus === 'warning' ? 'text-yellow-500' : 'text-red-500'
                                 }`}>
                                 {selectedProject.slaStatus === 'ok' ? 'Regular' : selectedProject.slaStatus === 'warning' ? 'Atenção' : 'Crítico'}
                              </div>
                           </div>
                           <div className="px-4 py-2 text-center">
                              <div className="text-xs text-gray-500 font-bold uppercase">Modelo</div>
                              <div className="text-sm font-bold text-gray-800 mt-1">{selectedProject.deliveryModel || 'Padrão'}</div>
                           </div>
                           <div className="px-4 py-2 text-center">
                              <div className="text-xs text-gray-500 font-bold uppercase">% Cronograma</div>
                              <div className="text-sm font-bold text-gray-800 mt-1 flex items-center justify-center">
                                 {selectedProject.progress}%
                                 <div className="w-4 h-4 rounded-full border-2 border-gray-200 ml-1 relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent animate-spin" style={{ animationDuration: '0s', transform: `rotate(${selectedProject.progress * 3.6}deg)` }}></div>
                                 </div>
                              </div>
                           </div>
                           <div className="px-4 py-2 text-center">
                              <div className="text-xs text-gray-500 font-bold uppercase">Situação</div>
                              <div className="text-sm font-bold text-blue-600 mt-1">{selectedProject.status}</div>
                           </div>
                        </div>

                        <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-red-500">
                           <X size={24} />
                        </button>
                     </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-gray-200 bg-gray-50 shrink-0">
                     {/* Left Info */}
                     <div className="md:col-span-5 p-4 space-y-2 border-r border-gray-200">
                        <div className="grid grid-cols-3 gap-2 items-center">
                           <span className="text-gray-500 font-medium flex items-center"><Building size={14} className="mr-1" /> Empresa</span>
                           <span className="col-span-2 text-blue-600 font-bold hover:underline cursor-pointer">{selectedProject.clientName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-center">
                           <span className="text-gray-500 font-medium flex items-center"><Phone size={14} className="mr-1" /> Telefone(s)</span>
                           <div className="col-span-2 flex items-center gap-2">
                              <span>{selectedProject.interlocutorContact || 'N/A'}</span>
                           </div>
                        </div>
                     </div>

                     {/* Right Info */}
                     <div className="md:col-span-7 p-4 space-y-2">
                        <div className="grid grid-cols-6 gap-2 items-center">
                           <span className="text-gray-500 font-medium col-span-1 flex items-center"><Calendar size={14} className="mr-1" /> Vigência</span>
                           <div className="col-span-5 flex items-center justify-between">
                              <span className="text-gray-800 font-bold">{formatDate(selectedProject.contractStart)} à {formatDate(selectedProject.contractEnd)}</span>
                           </div>
                        </div>
                        <div className="grid grid-cols-6 gap-2 items-center">
                           <span className="text-gray-500 font-medium col-span-1 flex items-center"><UserIcon size={14} className="mr-1" /> Especialista</span>
                           <span className="col-span-5 text-gray-800">{selectedProject.specialist || 'Não atribuído'}</span>
                        </div>
                     </div>
                  </div>

                  {/* Tabs Navigation */}
                  <div className="bg-white border-b border-gray-200 px-4 pt-2">
                     <div className="flex space-x-1 overflow-x-auto custom-scrollbar">
                        {['Visão Geral', 'Tarefas', 'Chamados', 'Agenda', 'Cronograma', 'OPR', 'Arquivos'].map(tab => (
                           <button
                              key={tab}
                              onClick={() => setActiveTab(tab.toLowerCase())}
                              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase()
                                 ? 'border-pot-orange text-pot-petrol bg-gray-50 rounded-t'
                                 : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                 }`}
                           >
                              {tab}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Tab Content Area */}
                  <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">

                     {/* VISÃO GERAL TAB */}
                     {activeTab === 'visão geral' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                              <h3 className="font-bold text-gray-800 mb-4 text-lg">Resumo do Projeto</h3>
                              <p className="text-gray-600 mb-6">{selectedProject.description}</p>
                              <div className="space-y-4">
                                 <div>
                                    <div className="flex justify-between text-xs mb-1 font-bold text-gray-500">
                                       <span>PROGRESSO GERAL</span>
                                       <span>{selectedProject.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                       <div className="bg-pot-orange h-3 rounded-full" style={{ width: `${selectedProject.progress}%` }}></div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* TAREFAS TAB */}
                     {activeTab === 'tarefas' && (
                        <div className="space-y-6 h-full flex flex-col">
                           <div className="flex justify-between items-center mb-0">
                              <h3 className="font-bold text-gray-700 flex items-center">
                                 <CheckSquare size={20} className="mr-2 text-pot-orange" /> Tarefas do Projeto
                              </h3>
                              {!isClient && (
                                 <button
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="bg-pot-orange text-white px-4 py-2 rounded text-sm font-bold flex items-center shadow hover:bg-orange-600 transition-colors"
                                 >
                                    <Plus size={16} className="mr-2" /> Nova Tarefa
                                 </button>
                              )}
                           </div>

                           {/* Client Pending Tasks Section */}
                           {clientTasks.length > 0 && (
                              <div className="bg-white border-l-4 border-l-red-500 rounded-lg shadow-sm overflow-hidden mb-4">
                                 <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex justify-between items-center">
                                    <h4 className="font-bold text-red-700 flex items-center text-sm uppercase">
                                       <AlertTriangle size={14} className="mr-2" />
                                       Suas Pendências (Ação Requerida)
                                    </h4>
                                    <span className="text-xs bg-white text-red-600 px-2 py-0.5 rounded-full font-bold">{clientTasks.filter(t => t.status !== 'completed').length} Pendentes</span>
                                 </div>
                                 <table className="w-full text-left">
                                    <thead className="bg-white text-xs text-gray-500 uppercase border-b border-gray-100">
                                       <tr>
                                          <th className="p-3">Status</th>
                                          <th className="p-3">O que fazer?</th>
                                          <th className="p-3">Impacto no Projeto</th>
                                          <th className="p-3">Prazo Limite</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                       {clientTasks.map(task => {
                                          const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
                                          return (
                                             <tr key={task.id} className="hover:bg-red-50/30 transition-colors cursor-pointer" onClick={() => setViewTask(task)}>
                                                <td className="p-3">
                                                   <span className={`px-2 py-1 rounded text-[10px] font-bold ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                      isOverdue ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-yellow-100 text-yellow-800'
                                                      }`}>
                                                      {task.status === 'completed' ? 'Feito' : isOverdue ? 'ATRASADO' : 'Pendente'}
                                                   </span>
                                                </td>
                                                <td className="p-3">
                                                   <div className="font-bold text-gray-800 text-sm">{task.title}</div>
                                                   <div className="text-xs text-gray-500">{task.description}</div>
                                                </td>
                                                <td className="p-3">
                                                   <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded flex items-center w-fit">
                                                      <Flag size={10} className="mr-1" />
                                                      Bloqueante
                                                   </span>
                                                </td>
                                                <td className="p-3">
                                                   <span className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                                                      {formatDate(task.dueDate)}
                                                   </span>
                                                </td>
                                             </tr>
                                          );
                                       })}
                                    </tbody>
                                 </table>
                              </div>
                           )}

                           {/* General/Consultant Tasks List */}
                           <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex-1">
                              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                 <h4 className="font-bold text-gray-600 text-xs uppercase">Cronograma da Equipe & Consultoria</h4>
                              </div>
                              <table className="w-full text-left">
                                 <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase">
                                    <tr>
                                       <th className="p-4">Status</th>
                                       <th className="p-4">Tarefa</th>
                                       <th className="p-4">Responsável</th>
                                       <th className="p-4">Vencimento</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                    {consultantTasks.length > 0 ? consultantTasks.map(task => (
                                       <tr key={task.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setViewTask(task)}>
                                          <td className="p-4">
                                             <span className={`px-2 py-1 rounded text-xs font-bold ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                   task.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {task.status === 'completed' ? 'Concluído' :
                                                   task.status === 'in_progress' ? 'Em Andamento' :
                                                      task.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                                             </span>
                                          </td>
                                          <td className="p-4">
                                             <div className="font-medium text-gray-800">{task.title}</div>
                                             <div className="text-xs text-gray-500 truncate max-w-md">{task.description}</div>
                                             {task.subTasks && task.subTasks.length > 0 && (
                                                <div className="flex items-center text-[10px] text-gray-400 mt-1">
                                                   <List size={10} className="mr-1" />
                                                   {task.subTasks.filter(s => s.completed).length}/{task.subTasks.length}
                                                </div>
                                             )}
                                          </td>
                                          <td className="p-4 text-sm text-gray-600">{task.assignedTo}</td>
                                          <td className="p-4 text-sm text-gray-600">{formatDate(task.dueDate)}</td>
                                       </tr>
                                    )) : (
                                       <tr>
                                          <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                                             Nenhuma tarefa de consultoria pendente.
                                          </td>
                                       </tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     )}

                     {/* CHAMADOS TAB */}
                     {activeTab === 'chamados' && (
                        <div className="space-y-4 h-full flex flex-col">
                           {/* Tickets List */}
                           <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex-1">
                              <table className="w-full text-left">
                                 <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                                    <tr>
                                       <th className="p-4 w-10"><input type="checkbox" /></th>
                                       <th className="p-4">Situação</th>
                                       <th className="p-4">Área / Tipo</th>
                                       <th className="p-4">Assunto</th>
                                       <th className="p-4">Responsável</th>
                                       <th className="p-4">SLA (10min)</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                    {projectTickets.length > 0 ? projectTickets.map(ticket => {
                                       const sla = checkSLA(ticket);
                                       return (
                                          <tr
                                             key={ticket.id}
                                             className="hover:bg-blue-50 transition-colors group cursor-pointer"
                                             onClick={() => setSelectedTicket(ticket)}
                                          >
                                             <td className="p-4"><input type="checkbox" /></td>
                                             <td className="p-4">
                                                <div className="text-xs text-gray-400 mb-1">#{ticket.id}</div>
                                                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${ticket.status === 'Resolvido' ? 'bg-green-500' :
                                                   ticket.status === 'Em Andamento' ? 'bg-blue-500' :
                                                      ticket.status === 'Aguardando Cliente' ? 'bg-yellow-500' : 'bg-red-500'
                                                   }`}>
                                                   {ticket.status}
                                                </span>
                                             </td>
                                             <td className="p-4 text-xs">
                                                <div className="font-bold text-gray-800">{ticket.area}</div>
                                                <div className="text-gray-500">{ticket.type}</div>
                                             </td>
                                             <td className="p-4">
                                                <div className="font-bold text-blue-600 hover:underline text-sm">{ticket.title}</div>
                                                <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">{ticket.description}</div>
                                             </td>
                                             <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                   <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden"><img src="https://picsum.photos/50/50" alt="" /></div>
                                                   <div className="text-xs">
                                                      <div className="font-bold text-gray-700">{ticket.assignedTo}</div>
                                                   </div>
                                                </div>
                                             </td>
                                             <td className="p-4 text-xs">
                                                <span className={`font-bold px-2 py-1 rounded ${sla.status === 'breach' ? 'bg-red-100 text-red-600' :
                                                   sla.status === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                                   }`}>
                                                   {sla.text}
                                                </span>
                                             </td>
                                          </tr>
                                       )
                                    }) : (
                                       <tr>
                                          <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                                             Nenhum chamado encontrado para este projeto.
                                          </td>
                                       </tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     )}

                     {/* AGENDA TAB */}
                     {activeTab === 'agenda' && (
                        <div className="bg-white p-6 rounded shadow border border-gray-200">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-gray-700 flex items-center">
                                 <Calendar size={20} className="mr-2 text-pot-orange" /> Próximos Eventos
                              </h3>
                              {!isClient && (
                                 <button
                                    onClick={() => setIsMeetingModalOpen(true)}
                                    className="bg-pot-petrol text-white px-4 py-2 rounded text-sm font-bold flex items-center shadow hover:bg-gray-800 transition-colors"
                                 >
                                    <Plus size={16} className="mr-2" /> Agendar Reunião
                                 </button>
                              )}
                           </div>

                           {localMeetings.length > 0 ? (
                              <div className="space-y-3">
                                 {localMeetings.map(meeting => (
                                    <div key={meeting.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                                       <div className="flex items-center gap-4">
                                          <div className="bg-blue-100 text-blue-700 p-3 rounded-lg text-center min-w-[60px]">
                                             <div className="text-xs uppercase font-bold">{new Date(meeting.date).toLocaleString('default', { month: 'short' })}</div>
                                             <div className="text-xl font-bold">{new Date(meeting.date).getDate()}</div>
                                          </div>
                                          <div>
                                             <h4 className="font-bold text-gray-800">{meeting.title}</h4>
                                             <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <Clock size={12} className="mr-1" /> {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {meeting.durationMinutes} min
                                             </div>
                                          </div>
                                       </div>
                                       {meeting.link && (
                                          <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center">
                                             <Video size={16} className="mr-2" /> Entrar
                                          </a>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <p className="text-gray-400">Nenhuma reunião agendada.</p>
                           )}
                        </div>
                     )}

                     {/* CRONOGRAMA TAB */}
                     {activeTab === 'cronograma' && (
                        <div className="bg-white p-6 rounded shadow border border-gray-200">
                           <h3 className="font-bold text-gray-700 mb-6">Linha do Tempo de Entregas</h3>
                           <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                              {projectTasks.map(task => (
                                 <div key={task.id} className="ml-8 relative group">
                                    <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                                       }`}>
                                       {task.status === 'completed' && <Check size={12} className="text-white" />}
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded border border-gray-200 hover:bg-white hover:shadow-sm transition-all cursor-pointer" onClick={() => setViewTask(task)}>
                                       <div className="flex justify-between items-start mb-2">
                                          <h4 className={`font-bold ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-pot-petrol'}`}>{task.title}</h4>
                                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-100">
                                             {formatDate(task.dueDate)}
                                          </span>
                                       </div>
                                       <p className="text-sm text-gray-600">{task.description}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* OPR / DIAGNÓSTICO TAB (AI) - ADMIN ONLY */}
                     {activeTab === 'opr' && !isClient && (
                        <div className="bg-white p-6 rounded shadow border border-gray-200">
                           <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-gray-700 flex items-center">
                                 <Zap size={20} className="mr-2 text-pot-orange" /> Plano de Ação Inteligente (PRIA)
                              </h3>
                              <button
                                 onClick={handleGeneratePlan}
                                 disabled={isLoadingAi}
                                 className="bg-pot-petrol text-white px-4 py-2 rounded text-sm font-bold flex items-center hover:bg-gray-800 disabled:opacity-50"
                              >
                                 {isLoadingAi ? 'Gerando...' : 'Gerar com IA'}
                              </button>
                           </div>

                           {aiPlan ? (
                              <div className="bg-gray-50 p-6 rounded border border-gray-200 prose prose-sm max-w-none">
                                 <div className="whitespace-pre-wrap">{aiPlan}</div>
                              </div>
                           ) : (
                              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded text-gray-400">
                                 <p>Nenhum plano gerado ainda. Clique no botão acima para usar a IA.</p>
                              </div>
                           )}
                        </div>
                     )}

                     {/* ARQUIVOS TAB */}
                     {activeTab === 'arquivos' && (
                        <div className="bg-white p-6 rounded shadow border border-gray-200">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-gray-700">Documentos do Projeto</h3>
                              <button className="text-blue-600 text-sm font-bold hover:underline flex items-center">
                                 <Plus size={16} className="mr-1" /> Upload
                              </button>
                           </div>
                           <div className="space-y-2">
                              {projectDocs.map(doc => (
                                 <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                       <FileText size={20} className="text-gray-400" />
                                       <div>
                                          <p className="text-sm font-bold text-gray-700">{doc.title}</p>
                                          <p className="text-xs text-gray-400">{doc.type} • v{doc.version} • {formatDate(doc.uploadedAt)}</p>
                                       </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-pot-orange">
                                       <Download size={18} />
                                    </button>
                                 </div>
                              ))}
                              {projectDocs.length === 0 && <p className="text-gray-400 italic text-sm">Nenhum documento anexado.</p>}
                           </div>
                        </div>
                     )}

                  </div>
               </div>
            </div>
         )}

         {/* EDIT PROJECT SETTINGS MODAL */}
         {isEditModalOpen && selectedProject && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl animate-fade-in flex flex-col max-h-[90vh]">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0 rounded-t-xl">
                     <h3 className="text-lg font-bold flex items-center">
                        <Settings size={20} className="mr-2" />
                        Configurações do Projeto
                     </h3>
                     <button onClick={() => setIsEditModalOpen(false)} className="text-gray-300 hover:text-white">
                        <X size={20} />
                     </button>
                  </div>

                  <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto p-6 space-y-6">

                     {/* Identification */}
                     <div>
                        <h4 className="text-sm font-bold text-pot-orange uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Identidade</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Título do Projeto</label>
                              <input type="text" required className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                                 value={editFormData.title || ''} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Código</label>
                              <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-100 text-gray-900" readOnly value={editFormData.code || ''} />
                           </div>
                           <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-500 mb-1">Descrição / Escopo</label>
                              <textarea className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none h-20 resize-none"
                                 value={editFormData.description || ''} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}></textarea>
                           </div>
                        </div>
                     </div>

                     {/* Status & SLA */}
                     <div>
                        <h4 className="text-sm font-bold text-pot-orange uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Status & Indicadores</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Situação</label>
                              <select className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                                 value={editFormData.status || ''} onChange={e => setEditFormData({ ...editFormData, status: e.target.value as any })}>
                                 <option value="Em Andamento">Em Andamento</option>
                                 <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                                 <option value="Coleta de Dados">Coleta de Dados</option>
                                 <option value="Concluído">Concluído</option>
                                 <option value="Atrasado">Atrasado</option>
                                 <option value="Pausado">Pausado</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Status SLA</label>
                              <select className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                                 value={editFormData.slaStatus || ''} onChange={e => setEditFormData({ ...editFormData, slaStatus: e.target.value as any })}>
                                 <option value="ok">Regular (Verde)</option>
                                 <option value="warning">Atenção (Amarelo)</option>
                                 <option value="delay">Crítico (Vermelho)</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Progresso (%)</label>
                              <input type="number" min="0" max="100" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 outline-none"
                                 value={editFormData.progress || 0} onChange={e => setEditFormData({ ...editFormData, progress: Number(e.target.value) })} />
                           </div>
                        </div>
                     </div>

                     {/* Team & Dates */}
                     <div>
                        <h4 className="text-sm font-bold text-pot-orange uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Equipe & Prazos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Especialista Responsável</label>
                              <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 outline-none"
                                 value={editFormData.specialist || ''} onChange={e => setEditFormData({ ...editFormData, specialist: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Interlocutor Cliente</label>
                              <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 outline-none"
                                 value={editFormData.interlocutor || ''} onChange={e => setEditFormData({ ...editFormData, interlocutor: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Início do Contrato</label>
                              <input type="date" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 outline-none"
                                 value={editFormData.contractStart ? new Date(editFormData.contractStart).toISOString().split('T')[0] : ''}
                                 onChange={e => setEditFormData({ ...editFormData, contractStart: e.target.value })} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Fim do Contrato</label>
                              <input type="date" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 outline-none"
                                 value={editFormData.contractEnd ? new Date(editFormData.contractEnd).toISOString().split('T')[0] : ''}
                                 onChange={e => setEditFormData({ ...editFormData, contractEnd: e.target.value })} />
                           </div>
                        </div>
                     </div>

                  </form>

                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
                     <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium">Cancelar</button>
                     <button onClick={handleSaveSettings} className="px-6 py-2 bg-pot-success text-white rounded font-bold shadow hover:bg-green-700 flex items-center">
                        <Save size={18} className="mr-2" /> Salvar Alterações
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* CLIENT ACCESS CREATION MODAL */}
         {isClientAccessModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white rounded-t-xl">
                     <h3 className="font-bold flex items-center">
                        <UserIcon size={20} className="mr-2" /> Portal do Cliente
                     </h3>
                     <button onClick={() => setIsClientAccessModalOpen(false)}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleCreateClientAccess} className="p-6 space-y-4">
                     <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 border border-blue-200 mb-2">
                        <p className="font-bold mb-1">Empresa: {selectedProject?.clientName}</p>
                        <p>Crie um usuário para o cliente acessar o painel e acompanhar este projeto.</p>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Nome do Cliente</label>
                        <input required type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                           value={newClientUser.name} onChange={e => setNewClientUser({ ...newClientUser, name: e.target.value })} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">E-mail de Acesso</label>
                        <input required type="email" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                           value={newClientUser.email} onChange={e => setNewClientUser({ ...newClientUser, email: e.target.value })} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Senha Provisória</label>
                        <div className="relative">
                           <Lock className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                           <input required type="text" className="w-full border border-gray-300 rounded pl-8 p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none"
                              value={newClientUser.password} onChange={e => setNewClientUser({ ...newClientUser, password: e.target.value })} placeholder="Senha inicial" />
                        </div>
                     </div>

                     <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsClientAccessModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-pot-success text-white rounded font-bold text-sm hover:bg-green-700">Criar Acesso</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* --- TASK CREATION MODAL --- */}
         {isTaskModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in flex flex-col max-h-[90vh]">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0 rounded-t-xl">
                     <h3 className="text-lg font-bold flex items-center">
                        <CheckSquare size={20} className="mr-2" />
                        Nova Tarefa
                     </h3>
                     <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-300 hover:text-white">
                        <X size={20} />
                     </button>
                  </div>

                  <form onSubmit={handleCreateTask} className="flex-1 overflow-y-auto p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                        <input type="text" required className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 focus:border-pot-orange outline-none"
                           value={newTaskForm.title} onChange={e => setNewTaskForm({ ...newTaskForm, title: e.target.value })} placeholder="Ex: Preparar relatório mensal" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                        <textarea className="w-full border border-gray-300 rounded p-2 h-20 resize-none bg-white text-gray-900 focus:border-pot-orange outline-none"
                           value={newTaskForm.description} onChange={e => setNewTaskForm({ ...newTaskForm, description: e.target.value })} placeholder="Detalhes da tarefa..."></textarea>
                     </div>

                     {/* Checklist Section for Creation */}
                     <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Checklist / Sub-tarefas</label>
                        <div className="flex gap-2 mb-2">
                           <input
                              type="text"
                              className="flex-1 border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 outline-none"
                              placeholder="Novo item..."
                              value={tempChecklistInput}
                              onChange={e => setTempChecklistInput(e.target.value)}
                           />
                           <button type="button" onClick={handleAddChecklistItem} className="bg-pot-petrol text-white p-2 rounded hover:bg-gray-800"><Plus size={16} /></button>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                           {newTaskChecklist.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100">
                                 <span>{item}</span>
                                 <button type="button" onClick={() => handleRemoveChecklistItem(idx)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                              </div>
                           ))}
                           {newTaskChecklist.length === 0 && <p className="text-xs text-gray-400 italic">Nenhum item adicionado.</p>}
                        </div>
                     </div>

                     {/* Type Selector */}
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Quem fará a tarefa?</label>
                        <div className="flex gap-2">
                           <button
                              type="button"
                              onClick={() => {
                                 setNewTaskForm({ ...newTaskForm, assigneeType: 'consultant', assignedTo: '' });
                              }}
                              className={`flex-1 py-2 px-3 rounded border text-sm font-medium flex items-center justify-center transition-colors ${newTaskForm.assigneeType === 'consultant'
                                 ? 'bg-pot-petrol text-white border-pot-petrol shadow-md'
                                 : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                 }`}
                           >
                              <UserIcon size={16} className="mr-2" /> Consultor (Interno)
                           </button>
                           <button
                              type="button"
                              onClick={() => {
                                 setNewTaskForm({ ...newTaskForm, assigneeType: 'client', assignedTo: '' });
                              }}
                              className={`flex-1 py-2 px-3 rounded border text-sm font-medium flex items-center justify-center transition-colors ${newTaskForm.assigneeType === 'client'
                                 ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                 : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                 }`}
                           >
                              <UserCheck size={16} className="mr-2" /> Cliente (Externo)
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Responsável</label>
                           <select
                              className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 outline-none"
                              value={newTaskForm.assignedTo}
                              onChange={e => setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })}
                           >
                              <option value="">-- Selecione --</option>
                              {availableAssignees.map(u => (
                                 <option key={u.id} value={u.name}>{u.name} {newTaskForm.assigneeType === 'consultant' ? '' : `(${u.role === UserRole.CLIENT_USER ? 'Cliente' : 'Membro'})`}</option>
                              ))}
                              {availableAssignees.length === 0 && (
                                 <option disabled>Nenhum usuário encontrado</option>
                              )}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Vencimento</label>
                           <input type="date" required className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 outline-none"
                              value={newTaskForm.dueDate} onChange={e => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })} />
                        </div>
                     </div>

                     <div className="pt-2 flex justify-end gap-2 border-t border-gray-100 mt-2">
                        <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-pot-orange text-white font-bold rounded shadow hover:bg-orange-600">Criar Tarefa</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* --- CREATE MEETING MODAL --- */}
         {isMeetingModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in flex flex-col max-h-[90vh]">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0 rounded-t-xl">
                     <h3 className="text-lg font-bold flex items-center">
                        <Video size={20} className="mr-2" />
                        Agendar Reunião
                     </h3>
                     <button onClick={() => setIsMeetingModalOpen(false)} className="text-gray-300 hover:text-white">
                        <X size={20} />
                     </button>
                  </div>

                  <form onSubmit={handleCreateMeeting} className="flex-1 overflow-y-auto p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Pauta / Assunto</label>
                        <input type="text" required className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 focus:border-pot-orange outline-none"
                           value={newMeetingForm.subject} onChange={e => setNewMeetingForm({ ...newMeetingForm, subject: e.target.value })} placeholder="Ex: Alinhamento de Expectativas" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Departamento</label>
                           <select
                              className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 outline-none"
                              value={newMeetingForm.department}
                              onChange={e => setNewMeetingForm({ ...newMeetingForm, department: e.target.value })}
                           >
                              <option value="Sucesso do Cliente">Sucesso do Cliente</option>
                              <option value="Financeiro">Financeiro</option>
                              <option value="Fiscal">Fiscal</option>
                              <option value="Contábil">Contábil</option>
                              <option value="TI">TI</option>
                              <option value="Diretoria">Diretoria</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Etapa do Cronograma</label>
                           <select
                              className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 outline-none"
                              value={newMeetingForm.stageId}
                              onChange={e => setNewMeetingForm({ ...newMeetingForm, stageId: e.target.value })}
                           >
                              <option value="">-- Geral / Sem Etapa --</option>
                              {projectTasks.length > 0 ? (
                                 projectTasks.map(task => (
                                    <option key={task.id} value={task.id}>{task.title}</option>
                                 ))
                              ) : (
                                 <option disabled>Nenhuma tarefa cadastrada</option>
                              )}
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Data e Hora</label>
                           <input type="datetime-local" required className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 outline-none"
                              value={newMeetingForm.date} onChange={e => setNewMeetingForm({ ...newMeetingForm, date: e.target.value })} />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Duração (min)</label>
                           <input type="number" min="15" step="15" className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 outline-none"
                              value={newMeetingForm.duration} onChange={e => setNewMeetingForm({ ...newMeetingForm, duration: Number(e.target.value) })} />
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Link da Reunião (Opcional)</label>
                        <input type="text" className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 focus:border-pot-orange outline-none"
                           value={newMeetingForm.link} onChange={e => setNewMeetingForm({ ...newMeetingForm, link: e.target.value })} placeholder="https://meet.google.com/..." />
                     </div>

                     <div className="pt-2 flex justify-end gap-2 border-t border-gray-100 mt-2">
                        <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-pot-petrol text-white font-bold rounded shadow hover:bg-gray-800 flex items-center">
                           <Calendar size={16} className="mr-2" /> Agendar
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* --- CONSULTANT TICKET RESPONSE MODAL --- */}
         {selectedTicket && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden animate-fade-in">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0">
                     <div>
                        <div className="flex items-center gap-2">
                           <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono">#{selectedTicket.id}</span>
                           <h3 className="font-bold">{selectedTicket.title}</h3>
                        </div>
                        <p className="text-xs text-gray-300 mt-1">{selectedTicket.area} • SLA: {checkSLA(selectedTicket).text}</p>
                     </div>
                     <button onClick={() => setSelectedTicket(null)}><X size={20} /></button>
                  </div>

                  {/* Chat History */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                     {selectedTicket.interactions?.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'support' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${msg.role === 'support'
                              ? 'bg-orange-100 text-orange-900 rounded-tr-none'
                              : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'
                              }`}>
                              <p className="text-xs font-bold mb-1 opacity-70 flex items-center justify-between w-full">
                                 {msg.sender}
                                 <span className="font-normal opacity-50 ml-2">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </p>
                              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Reply Box */}
                  <div className="p-4 bg-white border-t border-gray-200">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Responder como Especialista</span>
                        <div className="flex gap-2">
                           <button
                              onClick={() => setSelectedTicket({ ...selectedTicket, status: 'Resolvido' })}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200"
                           >
                              Marcar Resolvido
                           </button>
                        </div>
                     </div>
                     <form onSubmit={handleReplyTicket} className="flex gap-2">
                        <textarea
                           className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pot-orange outline-none text-sm bg-white text-gray-900 resize-none h-20"
                           placeholder="Digite sua resposta..."
                           value={ticketReply}
                           onChange={e => setTicketReply(e.target.value)}
                        ></textarea>
                        <button type="submit" className="bg-pot-petrol text-white px-4 rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex flex-col items-center justify-center">
                           <Send size={18} />
                           <span className="text-[10px] mt-1">Enviar</span>
                        </button>
                     </form>
                  </div>
               </div>
            </div>
         )}

         {/* --- TASK EDIT/DETAIL MODAL --- */}
         {viewTask && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden animate-fade-in">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-start text-white shrink-0">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">{viewTask.projectRef || 'Projeto'}</span>
                           <span className="text-xs opacity-70 flex items-center">
                              <Calendar size={12} className="mr-1" /> Vence: {new Date(viewTask.dueDate).toLocaleDateString('pt-BR')}
                           </span>
                        </div>
                        <h3 className="text-xl font-bold leading-tight">{viewTask.title}</h3>
                     </div>
                     <button onClick={() => setViewTask(null)} className="text-gray-300 hover:text-white p-1">
                        <X size={24} />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">

                     {/* Description */}
                     <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                           <FileText size={16} className="mr-2 text-pot-petrol" /> Descrição da Tarefa
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                           {viewTask.description || 'Sem descrição detalhada.'}
                        </p>
                     </div>

                     {/* Checklist */}
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h4 className="text-sm font-bold text-pot-petrol mb-3 flex items-center">
                           <List size={16} className="mr-2 text-pot-orange" /> Checklist / Sub-tarefas
                        </h4>
                        <div className="space-y-2 mb-4">
                           {viewTask.subTasks && viewTask.subTasks.length > 0 ? (
                              viewTask.subTasks.map(sub => (
                                 <div key={sub.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 group">
                                    <div className="flex items-center cursor-pointer flex-1" onClick={() => handleToggleSubTask(sub.id)}>
                                       <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors ${sub.completed ? 'bg-pot-success border-pot-success' : 'border-gray-300 bg-white'}`}>
                                          {sub.completed && <CheckSquare size={10} className="text-white" />}
                                       </div>
                                       <span className={`text-sm ${sub.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                          {sub.title}
                                       </span>
                                    </div>
                                    <button onClick={() => handleDeleteSubTaskFromExisting(sub.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              ))
                           ) : (
                              <p className="text-xs text-gray-400 italic text-center py-2">Nenhuma sub-tarefa adicionada.</p>
                           )}
                        </div>
                        <form onSubmit={handleAddSubTaskToExisting} className="flex gap-2">
                           <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-pot-orange bg-white text-gray-900" placeholder="Adicionar item..." value={editSubTaskTitle} onChange={(e) => setEditSubTaskTitle(e.target.value)} />
                           <button type="submit" className="bg-pot-petrol text-white px-3 py-2 rounded hover:bg-gray-800"><Plus size={16} /></button>
                        </form>
                     </div>
                  </div>

                  <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                     <button onClick={() => setViewTask(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Fechar</button>
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default Projects;
