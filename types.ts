
// User Roles (Enum mantido para compatibilidade, mas o sistema agora usa Dynamic Roles)
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  MANAGER_CS_OPS = 'manager_cs_ops',
  CONSULTANT = 'consultant',
  CLIENT_USER = 'client_user',
  CLUB_MEMBER = 'club_member'
}

// Permission System
export type PermissionKey =
  | 'view_dashboard'
  | 'view_crm'
  | 'edit_crm'
  | 'view_projects'
  | 'edit_projects'
  | 'manage_project_client_access' // Permissão para criar usuário do cliente
  | 'view_financials'
  | 'view_onboarding'
  | 'view_client_base'
  | 'view_tickets' // New
  | 'manage_users' // Acesso a tela de Admin
  | 'manage_roles';

export interface SystemPermission {
  key: PermissionKey;
  label: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  isSystem?: boolean; // Se true, não pode ser deletada (ex: SuperAdmin)
}

// Entities
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // New: Login logic
  role: UserRole; // Mantido para lógica legada
  roleId?: string; // Link para a Role dinâmica
  permissions?: PermissionKey[]; // Permissões efetivas
  avatar?: string;
  companyName?: string;
}

export interface ClientProfile {
  id: number;
  companyName: string;
  cnpj: string;
  responsibleName: string;
  responsiblePhone: string;
  ownerPhone: string; // Telefone do dono
  instagram: string;

  // Endereço (New)
  address?: string;
  city?: string;
  state?: string;
  zip?: string;

  // Métricas
  employeeCount: number;
  clientCount: number;

  // Operacional
  hasMappedProcesses: boolean;
  isReference?: boolean; // New: Checkbox de Referência

  // Stack Tecnológico
  softwareAccounting: string; // Contábil (Domínio, etc)
  softwareNoteCapture: string; // Captura de notas
  softwareFileConverter: string; // Conversor
  softwareWhatsapp: string; // Gestão de Zap

  status: 'Ativo' | 'Inativo' | 'Churn';
  joinedAt: string;
}

export interface SubTask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  assignedTo: string;
  assigneeType: 'consultant' | 'client';
  projectRef?: string;
  projectId?: number; // Added for linking
  googleSynced: boolean;
  googleTaskId?: string;
  subTasks?: SubTask[]; // New: Checklist support
}

export interface TicketInteraction {
  id: number;
  text: string;
  sender: string;
  role: 'client' | 'support' | 'system';
  createdAt: string;
}

export interface TicketCategory {
  id: number;
  name: string;
}

export interface Ticket {
  id: number;
  projectId: number;
  title: string;
  description: string;
  type: string; // Changed from literal union to string to support dynamic categories
  area: 'Fiscal' | 'Contábil' | 'Pessoal' | 'Domínio' | 'Financeiro' | 'TI' | 'Sucesso do Cliente';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'Aberto' | 'Em Análise' | 'Respondido Pelo Consultor' | 'Respondido pelo Cliente' | 'Em Andamento' | 'Aguardando Cliente' | 'Resolvido' | 'Concluído';
  openedBy: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline?: string;
  interactions: TicketInteraction[]; // Historico do chat
}

export interface ProjectMeeting {
  id: number;
  projectId: number;
  title: string;
  date: string;
  durationMinutes: number;
  link?: string;
  recordingLink?: string;
  attendees: string[];
}

export interface ProjectDocument {
  id: number;
  projectId: number;
  title: string;
  type: 'POP' | 'Planilha' | 'Contrato' | 'Relatório' | 'Diagnóstico';
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
}

export interface ProjectNote {
  id: number;
  projectId: number;
  text: string;
  type: 'internal' | 'external' | 'risk' | 'highlight';
  author: string;
  createdAt: string;
}

export interface Project {
  id: number;
  code: string; // New: Código do projeto
  title: string;
  description?: string;
  type: 'Diagnóstico' | 'Assessoria' | 'Recorrência' | 'Implementação' | 'Club';
  clientName: string;

  // Equipe
  manager?: string;
  specialist?: string; // New: Especialista responsável

  // Interlocutor
  interlocutor?: string; // New
  interlocutorContact?: string; // New
  interlocutorEmail?: string; // New

  // Status & SLA
  status: 'Em Andamento' | 'Aguardando Aprovação' | 'Concluído' | 'Coleta de Dados' | 'Atrasado' | 'Pausado';
  slaStatus: 'ok' | 'warning' | 'delay'; // New: Dashboard SLA
  progress: number;
  lastUpdate: string;

  // Datas
  startDate?: string;
  endDate?: string; // Data real/prevista de fim
  contractStart?: string; // New: Vigência
  contractEnd?: string; // New: Vigência

  // Detalhes
  deliveryModel?: string; // 'Online', 'Híbrido'
  highlights?: string[]; // Destaques
  risks?: string[]; // Riscos

  // Financeiro
  financialValue?: number;
  hoursSold?: number;
  hoursSpent?: number;
}

export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'Novo' | 'Contatado' | 'Qualificado';
  createdAt: string;
}

export interface OnboardingTask {
  id: number;
  title: string;
  completed: boolean;
  dueDate?: string; // New: Data da tarefa no onboarding
  assignedTo?: string; // New: Responsável pela tarefa
}

export interface OnboardingNote {
  id: number;
  text: string;
  createdAt: string;
  user: string;
}

export interface OnboardingItem {
  id: number;
  clientName: string;
  product: string;
  stage: 'Pendente de Kickoff' | 'Em andamento' | 'Concluído';
  startDate: string;
  consultant: string;
  tasks: OnboardingTask[];
  notes: OnboardingNote[];
}

export interface Deal {
  id: number;
  title: string;
  value: number;
  stage: 'Lead' | 'Contato' | 'Proposta' | 'Negociação' | 'Ganho' | 'Perdido';
  productInterest: string;
  additionalProducts?: string[];
  company: string;
  owner: string;
  active?: boolean;
  priority?: 'Low' | 'Medium' | 'High';
}

export interface LedgerEntry {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  consultant: string;
  clientName?: string; // New: For Client Filtering
}

export interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  type: 'meeting' | 'task' | 'milestone';
  relativeDays: number;
  durationHours: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  priceModel: 'fixed' | 'hourly' | 'monthly' | 'yearly';
  description: string;
  category: 'Curso' | 'Diagnóstico' | 'Assessoria' | 'Horas' | 'Club';
  paymentMethods: string[];
  onboardingProcess: string;
  automationDesc?: string;
  workflow?: WorkflowStep[];
}

export type ActivityType = 'Prospecção Novo Lead' | 'Follow Up' | 'Ligação' | 'Reunião externa' | 'Visita' | 'Google Event';

export interface Activity {
  id: number;
  type: ActivityType;
  title: string;
  description?: string;
  date: string;
  durationMinutes: number;
  dealId?: number;
  dealTitle?: string;
  userId: number;
  status: 'pending' | 'done';
  isGoogleEvent?: boolean;
}
