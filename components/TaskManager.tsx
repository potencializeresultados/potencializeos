
import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, CheckCircle, Clock, AlertTriangle, GripVertical, Calendar, User } from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: number, newStatus: Task['status']) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

const COLUMNS: { id: Task['status'] | 'overdue_group'; title: string; color: string; bg: string }[] = [
  { id: 'pending', title: 'Pendente', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  { id: 'in_progress', title: 'Em Andamento', color: 'text-blue-700', bg: 'bg-blue-50' },
  { id: 'completed', title: 'Concluído', color: 'text-green-700', bg: 'bg-green-50' }
];

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onUpdateTaskStatus, onTaskClick, onAddTask }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTaskId !== null) {
      onUpdateTaskStatus(draggedTaskId, targetStatus);
      setDraggedTaskId(null);
    }
  };

  const getTasksByStatus = (status: string) => {
    if (status === 'pending') {
      // Group 'pending' and 'overdue' together in the first column visually, 
      // but keep overdue styled differently
      return tasks.filter(t => t.status === 'pending' || t.status === 'overdue');
    }
    return tasks.filter(t => t.status === status);
  };

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        // Skip specialized 'overdue_group' if strictly following type
        if (col.id === 'overdue_group') return null;
        
        const columnTasks = getTasksByStatus(col.id as string);

        return (
          <div 
            key={col.id} 
            className={`flex-1 min-w-[300px] flex flex-col rounded-xl border border-gray-200 bg-gray-50/50`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id as Task['status'])}
          >
            {/* Column Header */}
            <div className={`p-4 rounded-t-xl border-b border-gray-100 flex justify-between items-center ${col.bg}`}>
              <div className="flex items-center gap-2">
                <h3 className={`font-bold ${col.color}`}>{col.title}</h3>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                  {columnTasks.length}
                </span>
              </div>
              <button 
                onClick={onAddTask}
                className="p-1 hover:bg-white rounded text-gray-400 hover:text-pot-orange transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Column Body */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-[200px]">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onTaskClick(task)}
                  className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md border transition-all cursor-grab active:cursor-grabbing group
                    ${task.status === 'overdue' ? 'border-red-200 border-l-4 border-l-red-500' : 
                      task.status === 'completed' ? 'border-gray-100 opacity-70' : 'border-gray-100 hover:border-pot-orange'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 truncate max-w-[120px]">
                      {task.projectRef || 'Geral'}
                    </span>
                    {task.status === 'overdue' && (
                      <span className="flex items-center text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                        <AlertTriangle size={10} className="mr-1" /> Atrasado
                      </span>
                    )}
                  </div>

                  <h4 className={`font-semibold text-gray-800 text-sm mb-1 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h4>
                  
                  {task.subTasks && task.subTasks.length > 0 && (
                    <div className="mb-3">
                       <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-pot-success transition-all" 
                               style={{ width: `${Math.round((task.subTasks.filter(s => s.completed).length / task.subTasks.length) * 100)}%` }}
                             ></div>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {task.subTasks.filter(s => s.completed).length}/{task.subTasks.length}
                          </span>
                       </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-2 border-t border-gray-50">
                    <div className="flex items-center" title={task.assignedTo}>
                      <User size={12} className="mr-1" />
                      <span className="truncate max-w-[80px]">{task.assignedTo.split(' ')[0]}</span>
                    </div>
                    <div className={`flex items-center ${task.status === 'overdue' ? 'text-red-500 font-bold' : ''}`}>
                      <Calendar size={12} className="mr-1" />
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-gray-300 text-xs">
                  Sem tarefas
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskManager;
