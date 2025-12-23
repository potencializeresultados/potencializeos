
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Task, UserRole, SubTask, User, Project } from '../types';
import { TaskService } from '../services/taskService';
import { ProjectService } from '../services/projectService';
import { UserService } from '../services/userService';
import { CheckCircle, Circle, RefreshCw, AlertCircle, Plus, Calendar, X, Briefcase, List, Trash2, CheckSquare, Clock, AlertTriangle, LayoutTemplate, Kanban as KanbanIcon, Paperclip, MessageSquare, Send, Upload, File, FileText } from 'lucide-react';
import TaskManager from '../components/TaskManager';

const Tasks: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  // API State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [consultants, setConsultants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const isClient = user.role === UserRole.CLIENT_USER || user.role === UserRole.CLUB_MEMBER;
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(isClient ? 'list' : 'kanban');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // For Details/Subtasks

  // Create Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    projectId: ''
  });

  // Subtask Input State
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  // Attachments & Notes State (Mock - Not persisted in API yet)
  const [taskNote, setTaskNote] = useState('');
  const [taskAttachments, setTaskAttachments] = useState<{ taskId: number, name: string, size: string }[]>([]);
  const [taskComments, setTaskComments] = useState<{ taskId: number, text: string, date: string, author: string }[]>([]);

  // Date Configuration State
  const [dateMode, setDateMode] = useState<'absolute' | 'relative_start' | 'relative_end'>('absolute');
  const [absoluteDate, setAbsoluteDate] = useState('');
  const [relativeDays, setRelativeDays] = useState(0);
  const [relativeDirection, setRelativeDirection] = useState<'after' | 'before'>('after');

  useEffect(() => {
    loadData();
  }, [user.id]); // Reload if user changes

  const loadData = async () => {
    try {
      const [tasksData, projectsData, usersData] = await Promise.all([
        TaskService.getAll(),
        ProjectService.getAll(),
        UserService.getAll()
      ]);

      let filteredTasks = tasksData;

      if (isClient) {
        // Filter for client
        const clientProjectIds = projectsData
          .filter(p => p.clientName === user.companyName)
          .map(p => p.id);

        filteredTasks = tasksData.filter(t =>
          t.assigneeType === 'client' &&
          (t.projectId && clientProjectIds.includes(t.projectId) || t.projectRef === user.companyName) // Check logic
        );
      }

      setTasks(filteredTasks);
      setProjects(projectsData);
      setConsultants(usersData.filter(u => u.role === UserRole.CONSULTANT || u.role === UserRole.MANAGER_CS_OPS));

    } catch (error) {
      console.error("Failed to load tasks data", error);
    } finally {
      setLoading(false);
    }
  };

  // Derived calculation for display
  const calculateDueDate = (): string | null => {
    if (dateMode === 'absolute') return absoluteDate;

    if (!newTask.projectId) return null;
    const project = projects.find(p => p.id === Number(newTask.projectId));
    if (!project) return null;

    let baseDateStr = dateMode === 'relative_start' ? project.startDate : project.endDate;
    if (!baseDateStr) return null;

    const baseDate = new Date(baseDateStr);
    const multiplier = relativeDirection === 'after' ? 1 : -1;
    baseDate.setDate(baseDate.getDate() + (relativeDays * multiplier));

    return baseDate.toISOString().split('T')[0];
  };

  const calculatedPreviewDate = calculateDueDate();

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDueDate = calculateDueDate();
    const project = projects.find(p => p.id === Number(newTask.projectId));

    if (!finalDueDate) {
      alert("Data inválida. Verifique se o projeto selecionado possui datas definidas.");
      return;
    }

    try {
      const taskPayload: Partial<Task> = {
        title: newTask.title,
        description: newTask.description,
        status: 'pending',
        dueDate: finalDueDate,
        assignedTo: newTask.assignedTo || 'Sistema',
        assigneeType: 'consultant',
        projectId: project?.id,
        projectRef: project?.title,
        googleSynced: false
      };

      const createdTask = await TaskService.create(taskPayload);
      setTasks([createdTask, ...tasks]);
      setIsModalOpen(false);

      // Reset form
      setNewTask({ title: '', description: '', assignedTo: '', projectId: '' });
      setDateMode('absolute');
      setRelativeDays(0);
    } catch (error) {
      console.error("Failed to create task", error);
      alert("Erro ao criar tarefa.");
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: Task['status']) => {
    try {
      await TaskService.update(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Failed to update task status", error);
    }
  };

  // --- Subtask Logic ---

  const handleOpenDetails = (task: Task) => {
    setSelectedTask(task);
  };

  const handleAddSubTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubTaskTitle.trim()) return;

    try {
      const newSub = await TaskService.createSubTask({
        title: newSubTaskTitle,
        task: selectedTask.id
      } as any); // Using 'any' because createSubTask expects Partial<SubTask> but we need to pass task ID which might not be in Partial<SubTask> depending on type def.

      // Re-fetch task or update locally. Best to append locally if return type matches.
      // The SubTask from API should have id.
      const updatedTask = {
        ...selectedTask,
        subTasks: selectedTask.subTasks ? [...selectedTask.subTasks, newSub] : [newSub]
      };

      updateTaskState(updatedTask);
      setNewSubTaskTitle('');
    } catch (error) {
      console.error("Failed to add subtask", error);
    }
  };

  const handleToggleSubTask = async (subTaskId: number) => {
    if (!selectedTask || !selectedTask.subTasks) return;

    const subTask = selectedTask.subTasks.find(s => s.id === subTaskId);
    if (!subTask) return;

    try {
      await TaskService.toggleSubTask(subTaskId, !subTask.completed);

      const updatedSubTasks = selectedTask.subTasks.map(st =>
        st.id === subTaskId ? { ...st, completed: !st.completed } : st
      );

      const updatedTask = { ...selectedTask, subTasks: updatedSubTasks };
      updateTaskState(updatedTask);
    } catch (error) {
      console.error("Failed to toggle subtask", error);
    }
  };

  const handleDeleteSubTask = async (subTaskId: number) => {
    if (!selectedTask || !selectedTask.subTasks) return;

    try {
      await TaskService.deleteSubTask(subTaskId);
      const updatedTask = {
        ...selectedTask,
        subTasks: selectedTask.subTasks.filter(st => st.id !== subTaskId)
      };
      updateTaskState(updatedTask);
    } catch (error) {
      console.error("Failed to delete subtask", error);
    }
  };

  const updateTaskState = (updatedTask: Task) => {
    setSelectedTask(updatedTask);
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const getProgress = (task: Task) => {
    if (!task.subTasks || task.subTasks.length === 0) return 0;
    const completed = task.subTasks.filter(st => st.completed).length;
    return Math.round((completed / task.subTasks.length) * 100);
  };

  // --- Attachments & Notes Handlers ---
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

  // --- Deadline Logic ---
  const getDeadlineStatus = (task: Task) => {
    if (task.status === 'completed') return 'completed';

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(23, 59, 59);

    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffMs < 0) return 'overdue';
    if (diffHours <= 48) return 'approaching';
    return 'normal';
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-pot-petrol">
            {isClient ? 'Minhas Pendências' : 'Gerenciamento de Tarefas'}
          </h2>
          <p className="text-sm text-gray-500">
            {isClient ? 'Acompanhe o que precisa ser feito para avançar nos projetos.' : 'Acompanhe entregas, prazos e checklists.'}
          </p>
        </div>

        <div className="flex space-x-2">
          {!isClient && (
            <div className="bg-white border border-gray-300 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-pot-petrol text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Lista"
              >
                <LayoutTemplate size={18} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-pot-petrol text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Quadro"
              >
                <KanbanIcon size={18} />
              </button>
            </div>
          )}

          {!isClient && <div className="w-px bg-gray-300 mx-2"></div>}

          {!isClient && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-pot-orange text-white rounded-lg hover:bg-orange-600 shadow-sm font-medium transition-colors"
            >
              <Plus size={18} className="mr-2" /> Nova Tarefa
            </button>
          )}
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-hidden">
          <TaskManager
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onTaskClick={handleOpenDetails}
            onAddTask={() => setIsModalOpen(true)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex-1 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarefa</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso (Sub-tarefas)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length > 0 ? tasks.map((task) => {
                const progress = getProgress(task);
                const hasSubTasks = task.subTasks && task.subTasks.length > 0;
                const deadlineStatus = getDeadlineStatus(task);

                let rowClass = "hover:bg-gray-50 transition-colors cursor-pointer group";
                let dateClass = "text-gray-500";
                let DateIcon = null;
                let StatusBadge = null;

                if (deadlineStatus === 'overdue') {
                  rowClass = "bg-red-50 hover:bg-red-100 transition-colors cursor-pointer group";
                  dateClass = "text-red-700 font-bold";
                  DateIcon = AlertTriangle;
                  StatusBadge = <span className="ml-2 text-[10px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded font-bold uppercase">Atrasado</span>;
                } else if (deadlineStatus === 'approaching') {
                  dateClass = "text-orange-600 font-bold";
                  DateIcon = Clock;
                  StatusBadge = <span className="ml-2 text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-bold uppercase">Em breve</span>;
                }

                return (
                  <tr
                    key={task.id}
                    className={rowClass}
                    onClick={() => handleOpenDetails(task)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.status === 'completed' ? (
                        <CheckCircle className="text-pot-success" size={20} />
                      ) : deadlineStatus === 'overdue' ? (
                        <AlertCircle className="text-pot-error" size={20} />
                      ) : task.status === 'in_progress' ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      ) : (
                        <Circle className="text-gray-300 group-hover:text-pot-orange" size={20} />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-pot-orange transition-colors">{task.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{task.description}</div>
                      {task.googleSynced && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 mt-1">
                          G-Sync
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      {hasSubTasks ? (
                        <div className="w-32">
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>{task.subTasks!.filter(s => s.completed).length}/{task.subTasks!.length}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${progress === 100 ? 'bg-pot-success' : 'bg-pot-petrol'}`} style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sem sub-tarefas</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {task.projectRef || 'Geral'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.assignedTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`flex items-center ${dateClass}`}>
                        {DateIcon && <DateIcon size={14} className="mr-1.5" />}
                        <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                        {StatusBadge}
                      </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    <p className="text-sm italic">Nenhuma tarefa pendente encontrada para você.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && !isClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Briefcase size={20} className="mr-2" />
                Nova Tarefa
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              {/* Form Inputs (Same as before) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none bg-white text-gray-900" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Título da tarefa" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none h-20 resize-none bg-white text-gray-900" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Projeto Relacionado</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none bg-white text-gray-900" value={newTask.projectId} onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}>
                    <option value="">-- Geral / Nenhum --</option>
                    {projects.map(p => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none bg-white text-gray-900" value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}>
                    <option value="">-- Selecione --</option>
                    {consultants.map(c => (<option key={c.id} value={c.name}>{c.name}</option>))}
                  </select>
                </div>
              </div>
              {/* Date Logic */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-pot-petrol mb-3 flex items-center">
                  <Calendar size={16} className="mr-2" /> Configuração de Prazo
                </h4>
                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={() => setDateMode('absolute')} className={`flex-1 py-2 text-xs font-bold rounded border ${dateMode === 'absolute' ? 'bg-white border-pot-orange text-pot-orange shadow-sm' : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'}`}>Data Fixa</button>
                  <button type="button" disabled={!newTask.projectId} onClick={() => setDateMode('relative_start')} className={`flex-1 py-2 text-xs font-bold rounded border ${dateMode === 'relative_start' ? 'bg-white border-pot-orange text-pot-orange shadow-sm' : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200 disabled:opacity-50'}`}>Relativo ao Início</button>
                  <button type="button" disabled={!newTask.projectId} onClick={() => setDateMode('relative_end')} className={`flex-1 py-2 text-xs font-bold rounded border ${dateMode === 'relative_end' ? 'bg-white border-pot-orange text-pot-orange shadow-sm' : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200 disabled:opacity-50'}`}>Relativo ao Fim</button>
                </div>
                {dateMode === 'absolute' ? (
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-pot-orange bg-white text-gray-900" value={absoluteDate} onChange={e => setAbsoluteDate(e.target.value)} />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input type="number" min="0" className="w-20 px-3 py-2 border border-gray-300 rounded outline-none focus:border-pot-orange bg-white text-gray-900" value={relativeDays} onChange={e => setRelativeDays(Number(e.target.value))} />
                      <span className="text-sm text-gray-600">dias</span>
                      <select className="flex-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-pot-orange text-sm bg-white text-gray-900" value={relativeDirection} onChange={e => setRelativeDirection(e.target.value as 'after' | 'before')}>
                        <option value="after">Depois do {dateMode === 'relative_start' ? 'Início' : 'Fim'}</option>
                        <option value="before">Antes do {dateMode === 'relative_start' ? 'Início' : 'Fim'}</option>
                      </select>
                    </div>
                    {calculatedPreviewDate && <div className="text-xs text-center bg-blue-50 text-blue-800 p-2 rounded border border-blue-100">Data Calculada: <strong>{new Date(calculatedPreviewDate).toLocaleDateString('pt-BR')}</strong></div>}
                  </div>
                )}
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-pot-orange text-white rounded-lg hover:bg-orange-600 text-sm font-bold shadow-md">Criar Tarefa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details / Subtasks / Attachments Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
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

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-6">

              {/* Description */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <FileText size={16} className="mr-2 text-pot-petrol" /> Descrição da Tarefa
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {selectedTask.description || 'Sem descrição detalhada.'}
                </p>
              </div>

              {/* Subtasks / Checklist */}
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
                        <div className="flex items-center cursor-pointer flex-1" onClick={() => handleToggleSubTask(sub.id)}>
                          <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors ${sub.completed ? 'bg-pot-success border-pot-success' : 'border-gray-300 bg-white'}`}>
                            {sub.completed && <CheckSquare size={10} className="text-white" />}
                          </div>
                          <span className={`text-sm ${sub.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{sub.title}</span>
                        </div>
                        {!isClient && (
                          <button onClick={() => handleDeleteSubTask(sub.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center py-2">Nenhuma sub-tarefa adicionada.</p>
                  )}
                </div>
                {!isClient && (
                  <form onSubmit={handleAddSubTask} className="flex gap-2">
                    <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-pot-orange bg-white text-gray-900" placeholder="Adicionar item..." value={newSubTaskTitle} onChange={(e) => setNewSubTaskTitle(e.target.value)} />
                    <button type="submit" className="bg-pot-petrol text-white px-3 py-2 rounded hover:bg-gray-800"><Plus size={16} /></button>
                  </form>
                )}
              </div>

              {/* Attachments */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center">
                    <Paperclip size={16} className="mr-2 text-pot-petrol" /> Documentos & Anexos
                  </h4>
                  <button onClick={handleUploadFile} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 flex items-center font-bold">
                    <Upload size={12} className="mr-1" /> Anexar Arquivo
                  </button>
                </div>
                {taskAttachments.filter(a => a.taskId === selectedTask.id).length > 0 ? (
                  <div className="space-y-2">
                    {taskAttachments.filter(a => a.taskId === selectedTask.id).map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded hover:bg-gray-100">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0"><File size={16} /></div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                            <p className="text-[10px] text-gray-500">{file.size}</p>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveFile(file.name)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">Nenhum documento anexado.</div>
                )}
              </div>

              {/* Notes */}
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
                        <div className="bg-white p-2 rounded border border-gray-200 text-gray-700">{comment.text}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center italic mt-4">Nenhuma observação registrada.</p>
                  )}
                </div>
                <form onSubmit={handleAddTaskNote} className="flex gap-2">
                  <input type="text" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-pot-orange outline-none" placeholder="Digite uma observação..." value={taskNote} onChange={e => setTaskNote(e.target.value)} />
                  <button type="submit" className="bg-gray-800 text-white p-2 rounded hover:bg-gray-900 transition-colors"><Send size={16} /></button>
                </form>
              </div>
            </div>

            <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setSelectedTask(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Fechar</button>
              {selectedTask.status !== 'completed' && (
                <button onClick={() => {
                  updateTaskState({ ...selectedTask, status: 'completed' });
                  handleUpdateTaskStatus(selectedTask.id, 'completed');
                }} className="px-6 py-2 bg-pot-petrol text-white font-bold rounded shadow hover:bg-gray-800 flex items-center text-sm">
                  <CheckSquare size={18} className="mr-2" /> Concluir
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
