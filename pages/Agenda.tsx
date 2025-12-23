
import React, { useState } from 'react';
import { Activity, ActivityType, Deal } from '../types';
import { MOCK_ACTIVITIES, MOCK_DEALS } from '../constants';
import { Calendar as CalendarIcon, Phone, Users, MapPin, UserPlus, Search, Plus, X, Check, ChevronLeft, ChevronRight, RefreshCw, LogOut } from 'lucide-react';

const ACTIVITY_TYPES: ActivityType[] = ['Prospecção Novo Lead', 'Follow Up', 'Ligação', 'Reunião externa', 'Visita'];

const Agenda: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Google Calendar State
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: 'Ligação',
    date: '',
    durationMinutes: 30,
    title: '',
    dealId: undefined
  });

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getActivitiesForDay = (day: number) => {
    return activities.filter(act => {
      const actDate = new Date(act.date);
      return actDate.getDate() === day && actDate.getMonth() === month && actDate.getFullYear() === year;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getIconForType = (type: ActivityType) => {
    switch(type) {
      case 'Ligação': return <Phone size={12} />;
      case 'Reunião externa': return <Users size={12} />;
      case 'Visita': return <MapPin size={12} />;
      case 'Prospecção Novo Lead': return <UserPlus size={12} />;
      case 'Follow Up': return <Search size={12} />;
      case 'Google Event': return <CalendarIcon size={12} />;
      default: return <CalendarIcon size={12} />;
    }
  };

  const getColorClass = (type: ActivityType, isGoogle?: boolean) => {
     if (isGoogle) return 'bg-white border-blue-200 text-blue-600 border-l-4 border-l-blue-500 shadow-sm';

     switch(type) {
        case 'Reunião externa': 
        case 'Visita': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Ligação': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'Prospecção Novo Lead': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
     }
  };

  const handleToggleGoogleSync = () => {
    if (isGoogleConnected) {
      // Disconnect: Remove Google Events
      setActivities(activities.filter(a => !a.isGoogleEvent));
      setIsGoogleConnected(false);
    } else {
      // Connect: Simulate Sync
      setIsSyncing(true);
      setTimeout(() => {
        const today = new Date();
        const mockGoogleEvents: Activity[] = [
          { 
            id: 901, 
            type: 'Google Event', 
            title: 'Dentista (G-Cal)', 
            date: new Date(year, month, today.getDate() + 1, 14, 0).toISOString(), 
            durationMinutes: 60, 
            userId: 1, 
            status: 'pending', 
            isGoogleEvent: true 
          },
          { 
            id: 902, 
            type: 'Google Event', 
            title: 'Almoço c/ Equipe (G-Cal)', 
            date: new Date(year, month, today.getDate() + 3, 12, 30).toISOString(), 
            durationMinutes: 90, 
            userId: 1, 
            status: 'pending', 
            isGoogleEvent: true 
          }
        ];
        setActivities([...activities, ...mockGoogleEvents]);
        setIsGoogleConnected(true);
        setIsSyncing(false);
      }, 1500);
    }
  };

  const handleOpenModal = (day: number | null = null) => {
    let initialDate = new Date().toISOString();
    
    if (day) {
      const d = new Date(year, month, day, 9, 0, 0); // Default to 9 AM on selected day
      // Adjust for timezone offset for input[type="datetime-local"]
      const offset = d.getTimezoneOffset() * 60000;
      initialDate = new Date(d.getTime() - offset).toISOString().slice(0, 16);
    }

    setNewActivity({
      type: 'Ligação',
      date: initialDate,
      durationMinutes: 30,
      title: '',
      dealId: undefined
    });
    setIsModalOpen(true);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const deal = MOCK_DEALS.find(d => d.id === Number(newActivity.dealId));
    
    const activity: Activity = {
      id: Math.random(),
      type: newActivity.type as ActivityType,
      title: newActivity.title || 'Nova Atividade',
      date: newActivity.date || new Date().toISOString(),
      durationMinutes: newActivity.durationMinutes || 30,
      userId: 1, // Mock current user
      status: 'pending',
      dealId: deal?.id,
      dealTitle: deal?.title
    };

    setActivities([...activities, activity]);
    MOCK_ACTIVITIES.push(activity);
    
    if (isGoogleConnected) {
      alert("Atividade criada e sincronizada com Google Calendar!");
    }

    setIsModalOpen(false);
  };

  const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-pot-petrol">Minha Agenda</h2>
          <p className="text-sm text-gray-500">Visualização Mensal</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Google Sync Button */}
          <button 
             onClick={handleToggleGoogleSync}
             disabled={isSyncing}
             className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                isGoogleConnected 
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
             }`}
          >
             {isSyncing ? (
               <RefreshCw size={16} className="mr-2 animate-spin" />
             ) : (
               <div className="flex items-center">
                 {/* Google G Logo Simulation */}
                 <span className="font-bold text-blue-500 mr-1">G</span> 
               </div>
             )}
             {isSyncing ? 'Sincronizando...' : isGoogleConnected ? 'Google Conectado' : 'Conectar Google'}
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
             <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-md text-gray-600"><ChevronLeft size={20} /></button>
             <span className="px-4 font-bold text-gray-700 min-w-[140px] text-center">
               {MONTH_NAMES[month]} {year}
             </span>
             <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-md text-gray-600"><ChevronRight size={20} /></button>
          </div>
          <button onClick={goToToday} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Hoje</button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-pot-orange text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm font-medium"
          >
            <Plus size={18} className="mr-2" />
            Agendar
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
           {WEEKDAYS.map(day => (
             <div key={day} className="py-2 text-center text-sm font-bold text-gray-500 uppercase tracking-wide">
               {day}
             </div>
           ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
           {/* Blanks for previous month */}
           {blanksArray.map(blank => (
             <div key={`blank-${blank}`} className="bg-gray-50/50 border-b border-r border-gray-100"></div>
           ))}

           {/* Days */}
           {daysArray.map(day => {
             const dayActivities = getActivitiesForDay(day);
             const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

             return (
               <div 
                 key={day} 
                 onClick={() => handleOpenModal(day)}
                 className={`min-h-[100px] p-2 border-b border-r border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative group ${isToday ? 'bg-blue-50/30' : ''}`}
               >
                 <div className="flex justify-between items-start">
                   <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-pot-petrol text-white' : 'text-gray-700'}`}>
                     {day}
                   </span>
                   <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-pot-orange transition-opacity">
                     <Plus size={14} />
                   </button>
                 </div>

                 <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {dayActivities.map(act => (
                      <div 
                        key={act.id} 
                        className={`text-[10px] px-1.5 py-1 rounded border truncate flex items-center gap-1 ${getColorClass(act.type, act.isGoogleEvent)} ${act.status === 'done' ? 'opacity-50 line-through' : ''}`}
                        title={`${act.type}: ${act.title}`}
                      >
                         {getIconForType(act.type)}
                         <span className="truncate">{new Date(act.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})} {act.title}</span>
                      </div>
                    ))}
                 </div>
               </div>
             );
           })}
           
           {/* Fill remaining cells if needed (optional, just leaving blank here) */}
        </div>
      </div>

      {/* Modal Nova Atividade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
             <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center">
               <h3 className="text-lg font-bold text-white flex items-center">
                 <CalendarIcon size={20} className="mr-2" />
                 Agendar na Agenda
               </h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                 <X size={20} />
               </button>
             </div>
             
             <form onSubmit={handleCreateActivity} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Atividade</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none bg-white text-gray-900"
                    value={newActivity.type}
                    onChange={e => setNewActivity({...newActivity, type: e.target.value as ActivityType})}
                  >
                    {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título / Assunto</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none bg-white text-gray-900"
                    placeholder="Ex: Reunião de Alinhamento"
                    value={newActivity.title}
                    onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                    <input 
                      type="datetime-local" 
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none bg-white text-gray-900"
                      value={newActivity.date}
                      onChange={e => setNewActivity({...newActivity, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none bg-white text-gray-900"
                      value={newActivity.durationMinutes}
                      onChange={e => setNewActivity({...newActivity, durationMinutes: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vincular a Negócio (Opcional)</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none bg-white text-gray-900"
                    value={newActivity.dealId || ''}
                    onChange={e => setNewActivity({...newActivity, dealId: Number(e.target.value)})}
                  >
                    <option value="">-- Nenhum --</option>
                    {MOCK_DEALS.map(d => (
                      <option key={d.id} value={d.id}>{d.title} - {d.company}</option>
                    ))}
                  </select>
                </div>

                {isGoogleConnected && (
                   <div className="bg-blue-50 p-2 rounded border border-blue-200 flex items-center text-xs text-blue-800">
                      <RefreshCw size={12} className="mr-2" />
                      Este evento será sincronizado automaticamente com sua agenda Google.
                   </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
                   <button type="submit" className="px-6 py-2 bg-pot-orange text-white rounded-lg hover:bg-orange-600 text-sm font-bold shadow-md">Agendar</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
