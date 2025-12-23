
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Clock, 
  TrendingUp, 
  Briefcase, 
  CheckCircle, 
  Calendar, 
  PhoneCall, 
  Users, 
  Rocket, 
  AlertTriangle, 
  Activity,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { 
  MOCK_LEDGER, 
  MOCK_PROJECTS, 
  MOCK_DEALS, 
  MOCK_ACTIVITIES, 
  MOCK_ONBOARDING, 
  MOCK_CLIENT_PROFILES, 
  MOCK_TICKETS, 
  MOCK_TASKS, 
  MOCK_PROJECT_MEETINGS 
} from '../constants';
import { User, UserRole } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();

  const isConsultant = user.role === UserRole.CONSULTANT;

  // --- DATA CALCULATIONS ---

  // 1. Comercial Logic
  const salesDeals = MOCK_DEALS.filter(d => d.stage === 'Ganho');
  const totalSalesValue = salesDeals.reduce((acc, curr) => acc + curr.value, 0);
  const meetingsCount = MOCK_ACTIVITIES.filter(a => a.type === 'Reunião externa' || a.type === 'Visita').length;
  const activitiesCount = MOCK_ACTIVITIES.length;

  // 2. Onboarding Logic
  const onboardingsCompleted = MOCK_ONBOARDING.filter(o => o.stage === 'Concluído').length;
  const onboardingsPending = MOCK_ONBOARDING.filter(o => o.stage !== 'Concluído').length;
  const activeClients = MOCK_CLIENT_PROFILES.filter(c => c.status === 'Ativo').length;
  
  // SLA & Interaction Logic
  // Calculate average days since last update across all projects (Proxy for interaction)
  const today = new Date();
  let totalDaysNoInteraction = 0;
  MOCK_PROJECTS.forEach(p => {
     const lastUp = new Date(p.lastUpdate);
     const diffTime = Math.abs(today.getTime() - lastUp.getTime());
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
     totalDaysNoInteraction += diffDays;
  });
  const avgDaysNoInteraction = MOCK_PROJECTS.length > 0 ? Math.round(totalDaysNoInteraction / MOCK_PROJECTS.length) : 0;

  // Calculate Average Response Time (Mock based on ticket updates)
  // In a real scenario, this would differ createAt vs first interaction
  const avgResponseTimeHours = 4.5; // Mocked calculated value based on MOCK_TICKETS data analysis

  // 3. Projects Logic
  const totalProjects = MOCK_PROJECTS.length;
  const totalProjectMeetings = MOCK_PROJECT_MEETINGS.length;
  const totalProjectActivities = MOCK_TASKS.filter(t => t.status === 'completed').length;

  // Projects per Consultant (For Chart)
  const projectsPerConsultantMap = MOCK_PROJECTS.reduce((acc, curr) => {
     const specialist = curr.specialist || 'Não atribuído';
     acc[specialist] = (acc[specialist] || 0) + 1;
     return acc;
  }, {} as Record<string, number>);

  const projectsPerConsultantData = Object.keys(projectsPerConsultantMap).map(name => ({
     name: name.split(' ')[0], // First name only for chart
     value: projectsPerConsultantMap[name]
  }));

  // --- CONSULTANT SPECIFIC METRICS ---
  const myTasks = MOCK_TASKS.filter(t => t.assignedTo === user.name && t.status !== 'completed').length;
  const myProjectsCount = MOCK_PROJECTS.filter(p => p.specialist === user.name || p.manager === user.name).length;
  const myTickets = MOCK_TICKETS.filter(t => t.assignedTo === user.name);
  // Mock SLA calculation for consultant
  const mySlaBreached = myTickets.filter(t => {
     // Simple mock check: if priority is high and status not resolved, assume breach risk
     return t.priority === 'Urgente' && t.status !== 'Resolvido';
  }).length;


  const COLORS = ['#FF9F1C', '#E91E63', '#2C3E50', '#27AE60', '#3498DB'];

  // --- RENDER: CONSULTANT DASHBOARD ---
  if (isConsultant) {
    return (
      <div className="space-y-8 animate-fade-in">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-pot-petrol">Painel do Consultor</h2>
               <p className="text-sm text-gray-500">Bem-vindo, {user.name}. Aqui está o resumo das suas entregas.</p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Visão Operacional</span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPI 1: Tarefas */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-pot-orange flex items-center justify-between">
               <div>
                  <p className="text-sm text-gray-500 font-medium">Tarefas Pendentes</p>
                  <p className="text-4xl font-bold text-pot-petrol mt-1">{myTasks}</p>
                  <p className="text-xs text-gray-400 mt-2">Atividades atribuídas a você</p>
               </div>
               <div className="p-4 bg-orange-50 rounded-full text-pot-orange">
                  <Briefcase size={32} />
               </div>
            </div>

            {/* KPI 2: Projetos */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 flex items-center justify-between">
               <div>
                  <p className="text-sm text-gray-500 font-medium">Projetos Ativos</p>
                  <p className="text-4xl font-bold text-pot-petrol mt-1">{myProjectsCount}</p>
                  <p className="text-xs text-gray-400 mt-2">Sob sua responsabilidade</p>
               </div>
               <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                  <Rocket size={32} />
               </div>
            </div>

            {/* KPI 3: SLA */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex items-center justify-between">
               <div>
                  <p className="text-sm text-gray-500 font-medium">SLA Médio (Chamados)</p>
                  <p className="text-4xl font-bold text-pot-petrol mt-1">98%</p>
                  <p className="text-xs text-gray-400 mt-2">Dentro do prazo</p>
               </div>
               <div className="p-4 bg-green-50 rounded-full text-green-600">
                  <CheckCircle size={32} />
               </div>
            </div>
         </div>

         {/* Chart Section */}
         <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-gray-700 mb-4">Minhas Atividades da Semana</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded text-gray-400">
               <p>Gráfico de performance individual (Em breve)</p>
            </div>
         </div>
      </div>
    );
  }

  // --- RENDER: ADMIN DASHBOARD ---
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-pot-petrol">Visão Geral da Operação</h2>
            <p className="text-sm text-gray-500">Métricas consolidadas de vendas, onboarding e projetos.</p>
         </div>
         <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Última atualização</p>
            <p className="text-sm font-bold text-gray-700">Hoje, {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
         </div>
      </div>

      {/* 1. SEÇÃO COMERCIAL */}
      <section>
         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <div className="w-1 h-6 bg-pot-success rounded mr-3"></div>
            Comercial
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="p-3 bg-green-100 text-green-700 rounded-lg"><TrendingUp size={24} /></div>
               <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Vendas Fechadas (Mês)</p>
                  <p className="text-2xl font-bold text-gray-800">R$ {totalSalesValue.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-green-600 font-medium flex items-center"><TrendingUp size={10} className="mr-1"/> {salesDeals.length} contratos</p>
               </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="p-3 bg-blue-100 text-blue-700 rounded-lg"><Users size={24} /></div>
               <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Reuniões Realizadas</p>
                  <p className="text-2xl font-bold text-gray-800">{meetingsCount}</p>
                  <p className="text-xs text-gray-400">Comerciais & Pré-venda</p>
               </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="p-3 bg-purple-100 text-purple-700 rounded-lg"><PhoneCall size={24} /></div>
               <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Total de Atividades</p>
                  <p className="text-2xl font-bold text-gray-800">{activitiesCount}</p>
                  <p className="text-xs text-gray-400">Ligações, E-mails, Visitas</p>
               </div>
            </div>
         </div>
      </section>

      {/* 2. SEÇÃO ONBOARDING & CLIENTES */}
      <section>
         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <div className="w-1 h-6 bg-pot-orange rounded mr-3"></div>
            Onboarding & Sucesso do Cliente
         </h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
               <p className="text-xs text-gray-500 mb-1">Onboarding Concluído</p>
               <p className="text-2xl font-bold text-green-600">{onboardingsCompleted}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
               <p className="text-xs text-gray-500 mb-1">Onboarding Pendente</p>
               <p className="text-2xl font-bold text-orange-500">{onboardingsPending}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
               <p className="text-xs text-gray-500 mb-1">Clientes Ativos</p>
               <p className="text-2xl font-bold text-blue-600">{activeClients}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
               <p className="text-xs text-gray-500 mb-1" title="Dias sem interação na plataforma">Ausência de Interação</p>
               <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-gray-800">{avgDaysNoInteraction}</p>
                  <span className="text-xs text-gray-400 mb-1">dias (média)</span>
               </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
               <p className="text-xs text-gray-500 mb-1">Tempo Médio Resposta</p>
               <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-gray-800">{avgResponseTimeHours}</p>
                  <span className="text-xs text-gray-400 mb-1">horas</span>
               </div>
            </div>
         </div>
      </section>

      {/* 3. SEÇÃO PROJETOS */}
      <section>
         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <div className="w-1 h-6 bg-pot-petrol rounded mr-3"></div>
            Projetos & Consultoria
         </h3>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KPI Cards for Projects */}
            <div className="space-y-4">
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                     <p className="text-sm text-gray-500 font-bold">Total de Projetos</p>
                     <p className="text-3xl font-bold text-pot-petrol">{totalProjects}</p>
                  </div>
                  <Briefcase className="text-gray-300" size={32} />
               </div>
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                     <p className="text-sm text-gray-500 font-bold">Reuniões Realizadas</p>
                     <p className="text-3xl font-bold text-blue-600">{totalProjectMeetings}</p>
                  </div>
                  <Users className="text-blue-200" size={32} />
               </div>
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                     <p className="text-sm text-gray-500 font-bold">Atividades Entregues</p>
                     <p className="text-3xl font-bold text-green-600">{totalProjectActivities}</p>
                  </div>
                  <CheckCircle className="text-green-200" size={32} />
               </div>
            </div>

            {/* Chart: Projects per Consultant */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
               <h4 className="font-bold text-gray-700 mb-4">Total de Projetos por Consultor</h4>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={projectsPerConsultantData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="value" fill="#2C3E50" radius={[0, 4, 4, 0]} barSize={25}>
                           {projectsPerConsultantData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

         </div>
      </section>
    </div>
  );
};

export default Dashboard;
