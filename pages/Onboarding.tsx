
import React, { useState } from 'react';
import { MOCK_ONBOARDING, MOCK_PROJECTS, MOCK_TASKS, MOCK_PRODUCTS, MOCK_USERS } from '../constants';
import { OnboardingItem, Project, Task, UserRole } from '../types';
import { Rocket, CheckCircle, Clock, X, MessageSquare, CheckSquare, Plus, ArrowRight, Check, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STAGES = ['Pendente de Kickoff', 'Em andamento', 'Concluído'];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<OnboardingItem[]>(MOCK_ONBOARDING);
  const [selectedItem, setSelectedItem] = useState<OnboardingItem | null>(null);
  const [newNote, setNewNote] = useState('');

  // Filter possible assignees (Consultants and Managers)
  const internalUsers = MOCK_USERS.filter(u => u.role === UserRole.CONSULTANT || u.role === UserRole.MANAGER_CS_OPS || u.role === UserRole.SUPER_ADMIN);

  const getCardColor = (stage: string) => {
    switch(stage) {
      case 'Concluído': return 'border-t-4 border-pot-success';
      case 'Em andamento': return 'border-t-4 border-pot-orange';
      default: return 'border-t-4 border-gray-400';
    }
  };

  const calculateProgress = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  // --- Actions ---

  const handleToggleTask = (taskId: number) => {
    if (!selectedItem) return;

    const updatedTasks = selectedItem.tasks.map(t => 
       t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    const updatedItem = { ...selectedItem, tasks: updatedTasks };
    
    // Update local state
    setSelectedItem(updatedItem);
    setItems(items.map(i => i.id === selectedItem.id ? updatedItem : i));
  };

  const handleUpdateTask = (taskId: number, field: 'dueDate' | 'assignedTo', value: string) => {
    if (!selectedItem) return;

    const updatedTasks = selectedItem.tasks.map(t => 
       t.id === taskId ? { ...t, [field]: value } : t
    );

    const updatedItem = { ...selectedItem, tasks: updatedTasks };
    
    // Update local state
    setSelectedItem(updatedItem);
    setItems(items.map(i => i.id === selectedItem.id ? updatedItem : i));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !newNote.trim()) return;

    const note = {
      id: Math.random(),
      text: newNote,
      createdAt: new Date().toISOString().split('T')[0],
      user: 'Você' // Mock user
    };

    const updatedItem = { 
      ...selectedItem, 
      notes: [note, ...selectedItem.notes] 
    };

    setSelectedItem(updatedItem);
    setItems(items.map(i => i.id === selectedItem.id ? updatedItem : i));
    setNewNote('');
  };

  const handleFinishOnboarding = () => {
    if (!selectedItem) return;

    // 1. Move to "Concluído" locally
    const finishedItem = { ...selectedItem, stage: 'Concluído' as const };
    setItems(items.map(i => i.id === selectedItem.id ? finishedItem : i));

    // 2. Create New Project automatically
    const projectType = 
       selectedItem.product.includes('Diagnóstico') ? 'Diagnóstico' :
       selectedItem.product.includes('Assessoria') ? 'Assessoria' :
       selectedItem.product.includes('Club') ? 'Club' : 'Implementação';

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6); // Default 6 months

    const newProject: Project = {
      id: Math.floor(Math.random() * 10000),
      code: `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      title: `${selectedItem.product} - ${selectedItem.clientName}`,
      type: projectType as any,
      clientName: selectedItem.clientName,
      status: 'Em Andamento',
      slaStatus: 'ok',
      progress: calculateProgress(selectedItem.tasks),
      lastUpdate: startDate.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString() 
    };

    // Push to mock database
    MOCK_PROJECTS.push(newProject);

    // 3. Generate Tasks from the current Onboarding Checklist
    let tasksCreatedCount = 0;
    
    // We prioritize the actual tasks in the checklist, which now have dates/assignees
    selectedItem.tasks.forEach(checklistTask => {
       // Only create if not completed or create all? Let's create all for history, but marked as completed if done.
       const newTask: Task = {
         id: Math.floor(Math.random() * 100000),
         title: checklistTask.title,
         description: `Tarefa gerada a partir do Onboarding: ${selectedItem.product}`,
         status: checklistTask.completed ? 'completed' : 'pending',
         dueDate: checklistTask.dueDate || new Date().toISOString().split('T')[0], // Use defined date or today
         assignedTo: checklistTask.assignedTo || selectedItem.consultant || 'Sistema', // Use defined assignee or default
         assigneeType: 'consultant',
         projectId: newProject.id,
         projectRef: newProject.title,
         googleSynced: false,
         subTasks: []
       };
       
       MOCK_TASKS.push(newTask);
       tasksCreatedCount++;
    });

    setSelectedItem(null);
    
    // Feedback
    let msg = `Onboarding concluído! Projeto "${newProject.title}" criado.`;
    if (tasksCreatedCount > 0) {
      msg += `\n\n${tasksCreatedCount} itens do checklist foram convertidos em Tarefas no sistema.`;
    }
    alert(msg);
    navigate('/projects');
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-pot-petrol">Onboarding de Clientes</h2>
          <p className="text-sm text-gray-500">Gerencie a entrada de novos clientes, checklists e transição para projetos.</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max h-full">
          {STAGES.map((stage) => {
            const stageItems = items.filter(item => item.stage === stage);
            
            return (
              <div key={stage} className="w-80 bg-gray-100 rounded-lg flex flex-col max-h-full border border-gray-200">
                <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center justify-between">
                  <h3 className="font-bold text-gray-700">{stage}</h3>
                  <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs font-bold text-gray-600">{stageItems.length}</span>
                </div>

                <div className="p-2 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  {stageItems.map((item) => {
                    const progress = calculateProgress(item.tasks);
                    
                    return (
                      <div 
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`bg-white p-4 rounded shadow-sm hover:shadow-md transition-all cursor-pointer ${getCardColor(item.stage)}`}
                      >
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <Rocket size={12} className="mr-1" />
                          {item.product}
                        </div>
                        <h4 className="font-bold text-gray-800">{item.clientName}</h4>
                        <p className="text-xs text-gray-500 mt-1 mb-3">CS: {item.consultant}</p>

                        {/* Progress Bar */}
                        <div className="mb-3">
                           <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                              <span>Progresso</span>
                              <span>{progress}%</span>
                           </div>
                           <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${progress === 100 ? 'bg-pot-success' : 'bg-pot-orange'}`} style={{ width: `${progress}%` }}></div>
                           </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                           <span className="text-xs text-gray-400 flex items-center">
                              <Clock size={12} className="mr-1" /> {new Date(item.startDate).toLocaleDateString('pt-BR')}
                           </span>
                           {item.stage === 'Concluído' ? (
                             <span className="text-xs text-pot-success font-bold flex items-center">
                                <CheckCircle size={12} className="mr-1" /> Projeto Criado
                             </span>
                           ) : (
                             <span className="text-xs text-pot-petrol font-medium hover:underline">
                                Ver Tarefas
                             </span>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Modal Details --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-fade-in">
             
             {/* Modal Header */}
             <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0">
               <div>
                 <h2 className="text-xl font-bold">{selectedItem.clientName}</h2>
                 <p className="text-sm opacity-80">{selectedItem.product} | Início: {new Date(selectedItem.startDate).toLocaleDateString('pt-BR')}</p>
               </div>
               <button onClick={() => setSelectedItem(null)} className="text-gray-300 hover:text-white transition-colors">
                 <X size={24} />
               </button>
             </div>

             {/* Modal Body */}
             <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Left: Checklist */}
                <div className="flex-1 p-6 overflow-y-auto border-r border-gray-100 bg-white">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-pot-petrol flex items-center">
                        <CheckSquare size={20} className="mr-2 text-pot-orange" />
                        Checklist de Atividades
                      </h3>
                      <p className="text-xs text-gray-500">Defina datas e responsáveis para gerar tarefas.</p>
                   </div>
                   
                   <div className="space-y-4">
                     {selectedItem.tasks && selectedItem.tasks.length > 0 ? (
                        selectedItem.tasks.map(task => (
                           <div 
                             key={task.id} 
                             className={`p-3 rounded-lg border transition-all ${
                               task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-pot-orange'
                             }`}
                           >
                              <div className="flex items-center mb-3">
                                <div 
                                  onClick={() => handleToggleTask(task.id)}
                                  className={`w-5 h-5 rounded border flex items-center justify-center mr-3 cursor-pointer transition-colors shrink-0 ${
                                    task.completed ? 'bg-pot-success border-pot-success' : 'bg-white border-gray-300'
                                  }`}
                                >
                                   {task.completed && <Check size={14} className="text-white" />}
                                </div>
                                <span className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                   {task.title}
                                </span>
                              </div>

                              {/* Task Details Inputs */}
                              <div className="flex flex-wrap gap-2 pl-8">
                                <div className="flex items-center gap-1 bg-gray-50 rounded p-1 border border-gray-200">
                                   <Calendar size={14} className="text-gray-400 ml-1" />
                                   <input 
                                      type="date" 
                                      className="bg-transparent text-xs text-gray-600 outline-none border-none p-1 w-28 text-gray-900"
                                      value={task.dueDate || ''}
                                      onChange={(e) => handleUpdateTask(task.id, 'dueDate', e.target.value)}
                                   />
                                </div>
                                <div className="flex items-center gap-1 bg-gray-50 rounded p-1 border border-gray-200 flex-1 min-w-[150px]">
                                   <User size={14} className="text-gray-400 ml-1" />
                                   <select 
                                      className="bg-transparent text-xs text-gray-600 outline-none border-none p-1 w-full text-gray-900"
                                      value={task.assignedTo || ''}
                                      onChange={(e) => handleUpdateTask(task.id, 'assignedTo', e.target.value)}
                                   >
                                      <option value="">Selecione Responsável...</option>
                                      {internalUsers.map(user => (
                                         <option key={user.id} value={user.name}>{user.name}</option>
                                      ))}
                                   </select>
                                </div>
                              </div>
                           </div>
                        ))
                     ) : (
                        <p className="text-gray-500 text-sm italic">Nenhuma tarefa definida para este onboarding.</p>
                     )}
                   </div>
                </div>

                {/* Right: Notes */}
                <div className="w-full md:w-80 bg-gray-50 p-6 overflow-hidden flex flex-col">
                   <h3 className="font-bold text-pot-petrol mb-4 flex items-center">
                     <MessageSquare size={20} className="mr-2 text-pot-magenta" />
                     Anotações
                   </h3>
                   
                   {/* Notes List */}
                   <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2">
                      {selectedItem.notes && selectedItem.notes.length > 0 ? (
                        selectedItem.notes.map((note, idx) => (
                           <div key={idx} className="bg-white p-3 rounded border border-gray-200 text-sm shadow-sm">
                              <p className="text-gray-700 mb-1">{note.text}</p>
                              <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                                 <span>{note.user}</span>
                                 <span>{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                           </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-400 text-xs mt-10">Nenhuma anotação ainda.</p>
                      )}
                   </div>

                   {/* Add Note Input */}
                   <form onSubmit={handleAddNote} className="mt-auto">
                      <input 
                        type="text" 
                        placeholder="Digite uma observação..." 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-pot-orange bg-white text-gray-900"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <button type="submit" className="w-full mt-2 bg-gray-200 text-gray-700 py-1.5 rounded text-xs font-bold hover:bg-gray-300 transition-colors">
                         Adicionar
                      </button>
                   </form>
                </div>
             </div>

             {/* Modal Footer */}
             <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
                >
                  Fechar
                </button>
                
                {selectedItem.stage !== 'Concluído' && (
                  <button 
                    onClick={handleFinishOnboarding}
                    className="px-6 py-2 bg-pot-success text-white rounded shadow hover:bg-green-700 font-bold text-sm flex items-center"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Finalizar & Gerar Tarefas
                  </button>
                )}
             </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Onboarding;
