
import { Deal, LedgerEntry, Project, Task, User, UserRole, Product, Lead, OnboardingItem, Activity, Ticket, ProjectMeeting, ProjectDocument, ProjectNote, ClientProfile, Role, SystemPermission, TicketCategory } from './types';

// System Permissions Definition (Checkboxes)
export const SYSTEM_PERMISSIONS: SystemPermission[] = [
  { key: 'view_dashboard', label: 'Ver Dashboard', module: 'Geral' },
  { key: 'manage_users', label: 'Gerenciar Usuários & Funções', module: 'Admin' },
  { key: 'view_client_base', label: 'Ver Base de Clientes', module: 'Comercial' },
  { key: 'view_crm', label: 'Visualizar Pipeline (CRM)', module: 'Comercial' },
  { key: 'edit_crm', label: 'Editar/Criar Negócios', module: 'Comercial' },
  { key: 'view_onboarding', label: 'Ver Onboarding', module: 'Operações' },
  { key: 'view_projects', label: 'Visualizar Projetos', module: 'Projetos' },
  { key: 'edit_projects', label: 'Editar Projetos', module: 'Projetos' },
  { key: 'manage_project_client_access', label: 'Criar Acesso Cliente', module: 'Projetos' },
  { key: 'view_financials', label: 'Ver Financeiro/Ledger', module: 'Financeiro' },
  { key: 'view_tickets', label: 'Ver/Gerenciar Chamados', module: 'Suporte' },
];

// Mock Roles
export const MOCK_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrador (Super Admin)',
    description: 'Acesso total ao sistema',
    permissions: SYSTEM_PERMISSIONS.map(p => p.key),
    isSystem: true
  },
  {
    id: 'comercial',
    name: 'Comercial',
    description: 'Foco em Vendas e CRM',
    permissions: ['view_dashboard', 'view_client_base', 'view_crm', 'edit_crm', 'view_financials', 'view_tickets']
  },
  {
    id: 'consultor',
    name: 'Consultor',
    description: 'Execução de Projetos e Atendimento',
    permissions: ['view_dashboard', 'view_projects', 'edit_projects', 'manage_project_client_access', 'view_onboarding', 'view_tickets']
  },
  {
    id: 'assessor',
    name: 'Assessor',
    description: 'Suporte a execução',
    permissions: ['view_dashboard', 'view_projects', 'view_tickets']
  },
  {
    id: 'cs',
    name: 'Sucesso do Cliente',
    description: 'Onboarding e Acompanhamento',
    permissions: ['view_dashboard', 'view_onboarding', 'view_client_base', 'view_projects', 'view_tickets']
  },
  {
    id: 'gerente_ops',
    name: 'Gerente Operacional',
    description: 'Visão macro da operação',
    permissions: ['view_dashboard', 'view_projects', 'edit_projects', 'view_onboarding', 'view_financials', 'manage_roles', 'view_tickets']
  },
  {
    id: 'client_basic',
    name: 'Cliente (Básico)',
    description: 'Acesso ao Portal do Cliente',
    permissions: ['view_projects', 'view_tickets'], // Added Tickets access
    isSystem: true
  }
];

// Mock Users
export const MOCK_USERS: User[] = [
  { 
    id: 1, 
    name: 'Carlos CEO', 
    email: 'carlos@potencialize.com', 
    password: '123',
    role: UserRole.SUPER_ADMIN, 
    roleId: 'admin',
    avatar: 'https://picsum.photos/100/100' 
  },
  { 
    id: 2, 
    name: 'Roberta Ops', 
    email: 'roberta@potencialize.com', 
    password: '123',
    role: UserRole.MANAGER_CS_OPS, 
    roleId: 'gerente_ops',
    avatar: 'https://picsum.photos/103/103' 
  },
  { 
    id: 3, 
    name: 'João Consultor', 
    email: 'joao@potencialize.com', 
    password: '123',
    role: UserRole.CONSULTANT, 
    roleId: 'consultor',
    avatar: 'https://picsum.photos/101/101' 
  },
  { 
    id: 4, 
    name: 'Maria Cliente', 
    email: 'maria@industriasabc.com.br', 
    password: '123',
    role: UserRole.CLIENT_USER, 
    roleId: 'client_basic',
    companyName: 'Indústrias ABC', 
    avatar: 'https://picsum.photos/102/102' 
  },
  { 
    id: 5, 
    name: 'Pedro Aluno', 
    email: 'pedro@club.com', 
    password: '123',
    role: UserRole.CLUB_MEMBER, 
    roleId: 'client_basic',
    companyName: 'Membro Club', 
    avatar: 'https://picsum.photos/104/104' 
  },
  { 
    id: 6, 
    name: 'Sandro Rabelo', 
    email: 'sandro@potencialize.com', 
    password: '123',
    role: UserRole.CONSULTANT, 
    roleId: 'consultor',
    avatar: 'https://picsum.photos/105/105' 
  },
];

// Mock Client Profiles
export const MOCK_CLIENT_PROFILES: ClientProfile[] = [
  {
    id: 1,
    companyName: 'Indústrias ABC',
    cnpj: '12.345.678/0001-90',
    responsibleName: 'Tobias Ogura',
    responsiblePhone: '(11) 98888-1234',
    ownerPhone: '(11) 97777-5555',
    instagram: '@industrias.abc',
    address: 'Av. Paulista, 1000 - Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zip: '01310-100',
    employeeCount: 45,
    clientCount: 120,
    hasMappedProcesses: false,
    isReference: true,
    softwareAccounting: 'Domínio Sistemas',
    softwareNoteCapture: 'Sieq',
    softwareFileConverter: 'Não utiliza',
    softwareWhatsapp: 'Zappy',
    status: 'Ativo',
    joinedAt: '2023-11-01'
  },
  {
    id: 2,
    companyName: 'Padaria Central',
    cnpj: '98.765.432/0001-10',
    responsibleName: 'Ana Maria',
    responsiblePhone: '(21) 99999-0000',
    ownerPhone: '(21) 98888-1111',
    instagram: '@padariacentral',
    address: 'Rua das Flores, 123 - Centro',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip: '20000-000',
    employeeCount: 12,
    clientCount: 0, // Varejo
    hasMappedProcesses: true,
    isReference: false,
    softwareAccounting: 'Alterdata',
    softwareNoteCapture: 'Gieg',
    softwareFileConverter: 'N/A',
    softwareWhatsapp: 'WhatsApp Business',
    status: 'Ativo',
    joinedAt: '2023-10-15'
  }
];

// Mock Projects (Enhanced)
export const MOCK_PROJECTS: Project[] = [
  { 
    id: 1,
    code: 'PRJ-2023-001',
    title: 'Implementação CRM Bitrix24', 
    description: 'Projeto completo de migração e implantação do CRM Bitrix24. Inclui mapeamento do funil de vendas, automação de e-mails.',
    type: 'Assessoria', 
    clientName: 'Indústrias ABC', 
    manager: 'Roberta Ops',
    specialist: 'João Consultor',
    interlocutor: 'Tobias Ogura',
    interlocutorEmail: 'tobias@abc.com',
    interlocutorContact: '(11) 98888-1234',
    status: 'Em Andamento', 
    slaStatus: 'ok',
    progress: 45, 
    lastUpdate: '2023-11-15',
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    contractStart: '2023-11-01',
    contractEnd: '2024-11-01',
    deliveryModel: 'Híbrido',
    highlights: ['Cliente engajado', 'Primeira fase entregue no prazo'],
    risks: ['Demora na aprovação de acessos'],
    financialValue: 15000,
    hoursSold: 40,
    hoursSpent: 12.5
  },
  { 
    id: 2,
    code: 'PRJ-2023-042',
    title: 'Diagnóstico Comercial', 
    description: 'Análise profunda dos processos de venda atuais.',
    type: 'Diagnóstico', 
    clientName: 'Padaria Central', 
    manager: 'João Consultor',
    specialist: 'João Consultor',
    interlocutor: 'Ana Maria',
    status: 'Aguardando Aprovação', 
    slaStatus: 'warning',
    progress: 90, 
    lastUpdate: '2023-11-16',
    startDate: '2023-10-15',
    endDate: '2023-11-20',
    contractStart: '2023-10-15',
    contractEnd: '2023-12-15',
    deliveryModel: 'Online',
    highlights: ['Relatório gerado', 'Aguardando reunião final'],
    risks: [],
    financialValue: 2000,
    hoursSold: 10,
    hoursSpent: 8
  },
  { 
    id: 3, 
    code: 'PRJ-REC-005',
    title: 'Consultoria Mensal', 
    description: 'Acompanhamento recorrente.',
    type: 'Recorrência', 
    clientName: 'Tech Start', 
    manager: 'Roberta Ops',
    specialist: 'Sandro Rabelo',
    interlocutor: 'Carlos CTO',
    status: 'Em Andamento', 
    slaStatus: 'ok',
    progress: 15, 
    lastUpdate: '2023-11-17',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    contractStart: '2023-01-01',
    contractEnd: '2024-01-01',
    deliveryModel: 'Online',
    financialValue: 3000,
    hoursSold: 120, // Anual
    hoursSpent: 105
  },
  { 
    id: 4, 
    code: 'PRJ-CLUB-099',
    title: 'Onboarding Club', 
    description: 'Processo de entrada do novo membro.',
    type: 'Club', 
    clientName: 'Membro Club', 
    manager: 'Carlos CEO',
    specialist: 'Equipe Club',
    status: 'Concluído', 
    slaStatus: 'ok',
    progress: 100, 
    lastUpdate: '2023-10-01',
    startDate: '2023-09-01',
    endDate: '2023-09-30',
    contractStart: '2023-09-01',
    contractEnd: '2024-09-01',
    deliveryModel: 'Online',
    financialValue: 48000,
    hoursSold: 0,
    hoursSpent: 0
  },
];

// Mock Ticket Categories
export const MOCK_TICKET_CATEGORIES: TicketCategory[] = [
  { id: 1, name: 'Dúvida' },
  { id: 2, name: 'Reclamação' },
  { id: 3, name: 'Solicitação de Reunião' },
  { id: 4, name: 'Envio de Arquivos' },
  { id: 5, name: 'Erro no Sistema' },
  { id: 6, name: 'Financeiro' }
];

// Mock Tickets
export const MOCK_TICKETS: Ticket[] = [
  {
    id: 1714247,
    projectId: 1,
    title: 'Verificar e ajustar Menu Favoritos Fiscal',
    description: 'Cliente relata erro ao acessar favoritos no módulo Fiscal.',
    type: 'Reclamação',
    area: 'Fiscal',
    priority: 'Média',
    status: 'Resolvido',
    openedBy: 'Tobias Ogura',
    assignedTo: 'João Consultor',
    createdAt: '2023-12-01T10:00:00',
    updatedAt: '2023-12-03T15:00:00',
    interactions: [
       { id: 1, role: 'client', text: 'Estou com erro ao tentar favoritar relatórios fiscais.', sender: 'Tobias Ogura', createdAt: '2023-12-01T10:00:00' },
       { id: 2, role: 'support', text: 'Olá Tobias! Poderia enviar um print do erro?', sender: 'João Consultor', createdAt: '2023-12-01T10:05:00' },
       { id: 3, role: 'client', text: 'Claro, segue anexo (erro_print.png).', sender: 'Tobias Ogura', createdAt: '2023-12-01T10:10:00' },
       { id: 4, role: 'support', text: 'Resolvido! Havia uma permissão faltando no seu perfil.', sender: 'João Consultor', createdAt: '2023-12-03T15:00:00' }
    ]
  },
  {
    id: 1710373,
    projectId: 1,
    title: 'Agendamento de Treinamento Final',
    description: 'Precisamos definir data para o treinamento da equipe comercial.',
    type: 'Solicitação de Reunião',
    area: 'Sucesso do Cliente',
    priority: 'Alta',
    status: 'Aberto',
    openedBy: 'João Consultor',
    assignedTo: 'Tobias Ogura',
    createdAt: '2023-11-24T09:00:00',
    updatedAt: '2023-11-24T09:00:00',
    slaDeadline: '2023-11-26T18:00:00',
    interactions: [
      { id: 1, role: 'support', text: 'Tobias, temos disponibilidade para próxima quinta às 14h. Funciona?', sender: 'João Consultor', createdAt: '2023-11-24T09:00:00' }
    ]
  },
  {
    id: 1715001,
    projectId: 1,
    title: 'Erro na importação de notas',
    description: 'XMLs não estão sendo processados corretamente.',
    type: 'Dúvida',
    area: 'TI',
    priority: 'Urgente',
    status: 'Em Andamento',
    openedBy: 'Tobias Ogura',
    assignedTo: 'Roberta Ops',
    createdAt: '2023-12-05T14:30:00',
    updatedAt: '2023-12-05T16:00:00',
    slaDeadline: '2023-12-05T18:00:00',
    interactions: [
      { id: 1, role: 'client', text: 'As notas de serviço de SP não estão entrando.', sender: 'Tobias Ogura', createdAt: '2023-12-05T14:30:00' },
      { id: 2, role: 'support', text: 'Vou acionar o time de desenvolvimento agora mesmo.', sender: 'Roberta Ops', createdAt: '2023-12-05T14:35:00' }
    ]
  }
];

// Mock Meetings
export const MOCK_PROJECT_MEETINGS: ProjectMeeting[] = [
  {
    id: 1,
    projectId: 1,
    title: 'Kick-off do Projeto',
    date: '2023-11-01T10:00:00',
    durationMinutes: 60,
    link: 'https://meet.google.com/abc-defg-hij',
    recordingLink: 'https://drive.google.com/file/d/recording1',
    attendees: ['João Consultor', 'Roberta Ops', 'Tobias Ogura']
  },
  {
    id: 2,
    projectId: 1,
    title: 'Validação de Mapeamento',
    date: '2023-11-15T14:00:00',
    durationMinutes: 90,
    link: 'https://meet.google.com/xyz-woiq-asd',
    attendees: ['João Consultor', 'Tobias Ogura']
  }
];

// Mock Documents
export const MOCK_PROJECT_DOCUMENTS: ProjectDocument[] = [
  {
    id: 1,
    projectId: 1,
    title: 'Contrato Assinado.pdf',
    type: 'Contrato',
    url: '#',
    uploadedBy: 'Roberta Ops',
    uploadedAt: '2023-10-30T10:00:00',
    version: '1.0'
  },
  {
    id: 2,
    projectId: 1,
    title: 'Mapeamento de Processos v1.xlsx',
    type: 'Planilha',
    url: '#',
    uploadedBy: 'João Consultor',
    uploadedAt: '2023-11-10T16:30:00',
    version: '1.0'
  }
];

// Mock Notes
export const MOCK_PROJECT_NOTES: ProjectNote[] = [
  { id: 1, projectId: 1, text: 'Cliente muito detalhista com prazos.', type: 'highlight', author: 'João Consultor', createdAt: '2023-11-02' },
  { id: 2, projectId: 1, text: 'Risco de atraso devido a férias do Interlocutor em Dezembro.', type: 'risk', author: 'Roberta Ops', createdAt: '2023-11-05' }
];

// Mock Leads
export const MOCK_LEADS: Lead[] = [
  { id: 1, name: 'Fernanda Souza', company: 'Contabilidade Ágil', email: 'fernanda@agil.com', phone: '(11) 98888-7777', status: 'Novo', createdAt: '2023-11-20' },
  { id: 2, name: 'Roberto Lima', company: 'Construtora Forte', email: 'roberto@forte.com', phone: '(21) 99999-0000', status: 'Contatado', createdAt: '2023-11-19' },
  { id: 3, name: 'Amanda Dias', company: 'Tech Solutions', email: 'amanda@tech.com', phone: '(31) 97777-6666', status: 'Qualificado', createdAt: '2023-11-18' },
];

// Mock Onboarding Items
export const MOCK_ONBOARDING: OnboardingItem[] = [
  { 
    id: 1, 
    clientName: 'Logística Fast', 
    product: 'Assessoria de Processos', 
    stage: 'Pendente de Kickoff', 
    startDate: '2023-11-21', 
    consultant: 'João Consultor',
    tasks: [
      { id: 1, title: 'Agendar Kick-off', completed: false, dueDate: '2023-11-25', assignedTo: 'João Consultor' },
      { id: 2, title: 'Enviar Contrato Assinado', completed: true, dueDate: '2023-11-22', assignedTo: 'Roberta Ops' },
      { id: 3, title: 'Criar Grupo no WhatsApp', completed: false, dueDate: '2023-11-23', assignedTo: 'João Consultor' },
      { id: 4, title: 'Coletar Organograma', completed: false, dueDate: '2023-11-28', assignedTo: 'Maria Cliente' }
    ],
    notes: [
      { id: 1, text: 'Cliente prefere contato pela manhã.', createdAt: '2023-11-20', user: 'Carlos CEO' }
    ]
  },
  { 
    id: 2, 
    clientName: 'Padaria Central', 
    product: 'Diagnóstico Domínio', 
    stage: 'Em andamento', 
    startDate: '2023-11-20', 
    consultant: 'Roberta Ops',
    tasks: [
      { id: 1, title: 'Validar Credenciais do Banco', completed: true, dueDate: '2023-11-21', assignedTo: 'Roberta Ops' },
      { id: 2, title: 'Rodar Script de Extração', completed: true, dueDate: '2023-11-22', assignedTo: 'João Consultor' },
      { id: 3, title: 'Gerar Relatório Preliminar', completed: false, dueDate: '2023-11-24', assignedTo: 'João Consultor' }
    ],
    notes: []
  },
  { 
    id: 3, 
    clientName: 'Startup One', 
    product: 'Horas Técnicas', 
    stage: 'Concluído', 
    startDate: '2023-11-15', 
    consultant: 'João Consultor',
    tasks: [
      { id: 1, title: 'Definir escopo das horas', completed: true, dueDate: '2023-11-16', assignedTo: 'João Consultor' },
      { id: 2, title: 'Cadastrar no Banco de Horas', completed: true, dueDate: '2023-11-16', assignedTo: 'Roberta Ops' },
      { id: 3, title: 'Apresentar Consultor', completed: true, dueDate: '2023-11-17', assignedTo: 'João Consultor' }
    ],
    notes: [
      { id: 1, text: 'Horas já creditadas no sistema.', createdAt: '2023-11-15', user: 'Sistema' }
    ]
  },
];

// Mock Tasks
export const MOCK_TASKS: Task[] = [
  { 
    id: 101, 
    title: 'Validar acessos Bitrix', 
    description: 'Testar logins fornecidos pelo cliente.', 
    status: 'pending', 
    dueDate: '2023-11-20', 
    assignedTo: 'João Consultor', 
    assigneeType: 'consultant', 
    projectRef: 'Implementação CRM Bitrix24', 
    projectId: 1, 
    googleSynced: true, 
    googleTaskId: 'g-123',
    subTasks: [
      { id: 1, title: 'Acesso Admin Painel', completed: true },
      { id: 2, title: 'Acesso FTP', completed: false },
      { id: 3, title: 'Configurar SMTP', completed: false }
    ]
  },
  { 
    id: 102, 
    title: 'Aprovar Diagnóstico Comercial', 
    description: 'Validar o relatório de diagnóstico entregue.', 
    status: 'pending', 
    dueDate: '2023-11-18', 
    assignedTo: 'Maria Cliente', 
    assigneeType: 'client', 
    projectRef: 'Diagnóstico Comercial', 
    projectId: 2, 
    googleSynced: false,
    subTasks: [] 
  },
  { 
    id: 103, 
    title: 'Configurar Webhook Greenn', 
    description: 'Garantir que vendas do curso criem usuário no WP.', 
    status: 'completed', 
    dueDate: '2023-11-10', 
    assignedTo: 'João Consultor', 
    assigneeType: 'consultant', 
    projectRef: 'Suporte Técnico', 
    googleSynced: true, 
    googleTaskId: 'g-124',
    subTasks: [
      { id: 1, title: 'Criar Endpoint PHP', completed: true },
      { id: 2, title: 'Testar Payload JSON', completed: true }
    ]
  },
  { 
    id: 104, 
    title: 'Check-in Mensal', 
    description: 'Reunião de acompanhamento recorrente.', 
    status: 'pending', 
    dueDate: '2023-11-25', 
    assignedTo: 'Roberta Ops', 
    assigneeType: 'consultant', 
    projectRef: 'Consultoria Mensal', 
    projectId: 3, 
    googleSynced: true, 
    googleTaskId: 'g-125' 
  },
  { 
    id: 105, 
    title: 'Preencher Formulário de Coleta', 
    description: 'Necessário para iniciar o Diagnóstico.', 
    status: 'overdue', 
    dueDate: '2023-11-15', 
    assignedTo: 'Maria Cliente', 
    assigneeType: 'client', 
    projectRef: 'Diagnóstico Comercial', 
    projectId: 2, 
    googleSynced: false 
  },
];

// Mock Deals (CRM)
export const MOCK_DEALS: Deal[] = [
  { id: 1, title: 'Implantação Completa', value: 15000, stage: 'Proposta', productInterest: 'Assessoria de Processos', company: 'Logística Fast', owner: 'João Consultor' },
  { id: 2, title: 'Assinatura Anual Club', value: 997, stage: 'Ganho', productInterest: 'Potencialize Club', company: 'Pedro Pessoa Física', owner: 'Sistema' },
  { id: 3, title: 'Diagnóstico Inicial', value: 2000, stage: 'Lead', productInterest: 'Diagnóstico', company: 'Padaria Central', owner: 'João Consultor' },
  { id: 4, title: 'Renovação Anual', value: 25000, stage: 'Ganho', productInterest: 'Assessoria Domínio', company: 'Indústrias ABC', owner: 'Roberta Ops' },
  { id: 5, title: 'Pacote de Horas (10h)', value: 3000, stage: 'Negociação', productInterest: 'Horas Técnicas', company: 'Startup One', owner: 'João Consultor' },
];

// Mock Ledger (Banco de Horas)
export const MOCK_LEDGER: LedgerEntry[] = [
  { id: 1, type: 'credit', amount: 20.0, description: 'Pacote Inicial Contratado', date: '2023-10-01', consultant: 'Sistema' },
  { id: 2, type: 'debit', amount: 2.5, description: 'Reunião de Kick-off', date: '2023-10-05', consultant: 'João Consultor' },
  { id: 3, type: 'debit', amount: 4.0, description: 'Mapeamento de Processos', date: '2023-10-12', consultant: 'João Consultor' },
  { id: 4, type: 'credit', amount: 10.0, description: 'Aditivo Contratual', date: '2023-11-01', consultant: 'Roberta Ops' },
];

// Mock Products
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Curso Padronização de Processos Contábeis',
    price: 497.00,
    priceModel: 'fixed',
    category: 'Curso',
    description: 'Vendido via Greenn. Integração via Webhook disponível.',
    paymentMethods: ['Plataforma Greenn'],
    onboardingProcess: 'CS entra em contato com o aluno para validar se está realizando as atividades.',
    automationDesc: 'Disparo automático de tarefa para CS após 30 dias da compra (Gatilho: Webhook Greenn).'
  },
  {
    id: 2,
    title: 'Diagnóstico Domínio',
    price: 3000.00,
    priceModel: 'fixed',
    category: 'Diagnóstico',
    description: 'Varredura do banco de dados Domínio, aplicação de BI e análise de usabilidade. Entrega de Plano de Ação.',
    paymentMethods: ['PIX', 'Cartão'],
    onboardingProcess: 'Contato inicial imediato para agendamento da captura do Banco de Dados e coleta de acessos.',
    automationDesc: 'Criação automática do Projeto "Diagnóstico" e envio de e-mail com Formulário de Coleta.',
    workflow: [
      { id: 1, title: 'Coletar Backup do Banco', description: 'Baixar .bak do cliente', type: 'task', relativeDays: 0, durationHours: 2 },
      { id: 2, title: 'Processar BI', description: 'Rodar scripts de análise', type: 'task', relativeDays: 2, durationHours: 4 },
      { id: 3, title: 'Apresentação de Diagnóstico', description: 'Reunião de entrega', type: 'meeting', relativeDays: 5, durationHours: 2 }
    ]
  },
  {
    id: 3,
    title: 'Diagnóstico Gestor de Tarefas',
    price: 1500.00,
    priceModel: 'fixed',
    category: 'Diagnóstico',
    description: 'Varredura de uso do sistema de tarefas (GClick, Tareffa, Onvio, etc) e plano de ação para resolução de problemas.',
    paymentMethods: ['PIX', 'Cartão'],
    onboardingProcess: 'Contato inicial imediato para coleta de acessos administrativos do sistema de tarefas.',
    automationDesc: 'Criação automática do Projeto e Tarefa para CS: "Validar credenciais do sistema".'
  },
  {
    id: 4,
    title: 'Assessoria de Processos',
    price: 14000.00,
    priceModel: 'fixed',
    category: 'Assessoria',
    description: 'Mapeamento Operacional e construção de POPs. Duração de 7 meses.',
    paymentMethods: ['PIX', 'Cartão', 'Boleto'],
    onboardingProcess: 'Realização do Kick-off. Contatos de checagem com 45 dias (ajuda) e 90 dias (resultados).',
    automationDesc: 'Agendamento de Cron Jobs para criar tarefas de "Check-in" a cada 45 dias para o Consultor.',
    workflow: [
      { id: 1, title: 'Kick-off Meeting', description: 'Alinhamento de expectativas', type: 'meeting', relativeDays: 0, durationHours: 2 },
      { id: 2, title: 'Mapeamento "AS IS"', description: 'Levantamento de processos atuais', type: 'task', relativeDays: 7, durationHours: 10 },
      { id: 3, title: 'Validação de POPs', description: 'Entrega dos procedimentos', type: 'task', relativeDays: 30, durationHours: 5 },
      { id: 4, title: 'Treinamento da Equipe', description: 'Capacitação nos novos processos', type: 'meeting', relativeDays: 45, durationHours: 4 }
    ]
  },
  {
    id: 5,
    title: 'Horas Técnicas Domínio',
    price: 500.00,
    priceModel: 'hourly',
    category: 'Horas',
    description: 'Configuração do sistema Domínio baseado no diagnóstico.',
    paymentMethods: ['A combinar'],
    onboardingProcess: 'Contato único imediato após fechamento para realização do Kick-off.',
    automationDesc: 'Crédito automático de horas no Ledger e notificação ao time de Ops.'
  },
  {
    id: 6,
    title: 'Horas Técnicas Gestor de Tarefas',
    price: 300.00,
    priceModel: 'hourly',
    category: 'Horas',
    description: 'Configuração de Acessórias, Onvio, Tareffa, GClick ou Nibo.',
    paymentMethods: ['A combinar'],
    onboardingProcess: 'Contato inicial para explicação do trabalho e alocação das horas.',
    automationDesc: 'Crédito automático de horas no Ledger e criação de tarefa de alocação.'
  },
  {
    id: 7,
    title: 'Assessoria Domínio',
    price: 3000.00,
    priceModel: 'monthly',
    category: 'Assessoria',
    description: 'Acompanhamento mensal, treinamentos e tarefas para colocar automações em prática.',
    paymentMethods: ['Boleto'],
    onboardingProcess: 'Kick-off inicial e acompanhamento mensal.',
    automationDesc: 'Criação de Projeto Recorrente e agendamento de tarefa mensal de "Acompanhamento" (Ciclo 30 dias).'
  },
  {
    id: 8,
    title: 'Potencialize Club',
    price: 48000.00,
    priceModel: 'yearly',
    category: 'Club',
    description: 'Clube exclusivo de fomento ao crescimento e segmentação (Mentorias).',
    paymentMethods: ['PIX', 'Cartão'],
    onboardingProcess: 'Boas-vindas ao novo sócio e agendamento da primeira mentoria.',
    automationDesc: 'Alteração de Role do usuário para "club_member" e disparo de sequência de e-mails de boas-vindas.'
  }
];

// Mock Activities (Agenda)
export const MOCK_ACTIVITIES: Activity[] = [
  { id: 1, type: 'Reunião externa', title: 'Apresentação de Diagnóstico', date: '2023-11-21T10:00:00', durationMinutes: 60, dealId: 3, dealTitle: 'Diagnóstico Inicial', userId: 3, status: 'pending' },
  { id: 2, type: 'Ligação', title: 'Follow-up Proposta', date: '2023-11-21T14:30:00', durationMinutes: 15, dealId: 1, dealTitle: 'Implantação Completa', userId: 3, status: 'pending' },
  { id: 3, type: 'Visita', title: 'Almoço com Cliente', date: '2023-11-20T12:00:00', durationMinutes: 90, dealId: 4, dealTitle: 'Renovação Anual', userId: 2, status: 'done' },
  { id: 4, type: 'Prospecção Novo Lead', title: 'Contato inicial Contabilidade X', date: '2023-11-19T09:00:00', durationMinutes: 30, userId: 3, status: 'done' },
  { id: 5, type: 'Follow Up', title: 'Verificar assinatura de contrato', date: '2023-11-22T11:00:00', durationMinutes: 10, dealId: 5, dealTitle: 'Pacote de Horas (10h)', userId: 3, status: 'pending' },
];
