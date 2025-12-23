
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Kanban, 
  LogOut, 
  Menu,
  X,
  MessageSquare,
  Package,
  Users,
  ChevronDown,
  ChevronRight,
  Rocket,
  Calendar,
  Building,
  Shield,
  LifeBuoy
} from 'lucide-react';
import { User, UserRole } from '../types';
import AIAssistant from './AIAssistant';
import { MOCK_ROLES } from '../constants';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [comercialOpen, setComercialOpen] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <Outlet />; // Render login page if not authenticated
  }

  // Helper to check permissions
  const hasPermission = (permissionKey: string) => {
    // 1. Get user role
    const userRole = MOCK_ROLES.find(r => r.id === user.roleId);
    if (!userRole) return false;
    
    // 2. Check permission
    return userRole.permissions.includes(permissionKey as any);
  };

  const isClient = user.role === UserRole.CLIENT_USER || user.role === UserRole.CLUB_MEMBER;
  const isInternal = !isClient;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-pot-bg overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-pot-petrol text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-center bg-pot-petrol border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pot-orange to-pot-magenta bg-clip-text text-transparent">
            Potencialize OS
          </h1>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {hasPermission('view_dashboard') && (
            <NavLink 
              to="/dashboard"
              className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-pot-orange text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard size={20} className="mr-3" />
              Dashboard
            </NavLink>
          )}

          {isClient && (
            <NavLink 
              to="/portal"
              className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-pot-orange text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard size={20} className="mr-3" />
              Portal do Cliente
            </NavLink>
          )}

          {(hasPermission('view_crm') || hasPermission('view_client_base')) && (
            <div>
              <button 
                onClick={() => setComercialOpen(!comercialOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-700 hover:text-white`}
              >
                <div className="flex items-center">
                  <Users size={20} className="mr-3" />
                  <span>Comercial</span>
                </div>
                {comercialOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {comercialOpen && (
                <div className="pl-6 space-y-1 mt-1">
                  {hasPermission('view_client_base') && (
                    <NavLink 
                      to="/clients"
                      className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'text-pot-orange bg-gray-800' : 'text-gray-400 hover:text-white'}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      Base de Clientes
                    </NavLink>
                  )}
                  {hasPermission('edit_crm') && (
                    <NavLink 
                      to="/leads"
                      className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'text-pot-orange bg-gray-800' : 'text-gray-400 hover:text-white'}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      Cadastro de Leads
                    </NavLink>
                  )}
                  {hasPermission('view_crm') && (
                    <NavLink 
                      to="/crm"
                      className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'text-pot-orange bg-gray-800' : 'text-gray-400 hover:text-white'}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      Negócios (Pipeline)
                    </NavLink>
                  )}
                  <NavLink 
                    to="/agenda"
                    className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'text-pot-orange bg-gray-800' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    Agenda
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {hasPermission('view_onboarding') && (
            <NavLink 
              to="/onboarding"
              className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-pot-orange text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Rocket size={20} className="mr-3" />
              Onboarding
            </NavLink>
          )}

          {hasPermission('view_projects') && (
             <NavLink 
             to="/projects"
             className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-pot-orange text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
             onClick={() => setSidebarOpen(false)}
           >
             <Briefcase size={20} className="mr-3" />
             Projetos
           </NavLink>
          )}
          
          <NavLink 
            to="/tasks"
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-pot-orange text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            onClick={() => setSidebarOpen(false)}
          >
            <CheckSquare size={20} className="mr-3" />
            Minhas Tarefas
          </NavLink>

          {hasPermission('view_tickets') && (
            <NavLink 
              to="/tickets"
              className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-pot-orange text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <LifeBuoy size={20} className="mr-3" />
              Chamados
            </NavLink>
          )}

          {isInternal && (
             <div className="pt-4 mt-4 border-t border-gray-700">
               <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gestão</p>
               <NavLink 
                 to="/products"
                 className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-pot-orange text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                 onClick={() => setSidebarOpen(false)}
               >
                 <Package size={20} className="mr-3" />
                 Produtos & Serviços
               </NavLink>

               {hasPermission('manage_users') && (
                  <NavLink 
                    to="/admin"
                    className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-pot-orange text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Shield size={20} className="mr-3" />
                    Admin & Acessos
                  </NavLink>
               )}
             </div>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700 bg-pot-petrol">
           <div className="flex items-center mb-4">
              <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full mr-3" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {isClient ? user.companyName : 
                   user.role === UserRole.SUPER_ADMIN ? 'Super Admin' :
                   user.role === UserRole.MANAGER_CS_OPS ? 'Gestão de Operações' : 'Consultor'}
                </p>
              </div>
           </div>
           <button 
            onClick={onLogout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-pot-error rounded-md hover:bg-red-700 transition-colors"
           >
             <LogOut size={16} className="mr-2" />
             Sair
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-6 lg:px-8">
          <button 
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex-1 flex justify-end items-center">
            {/* Gradient Line Decor */}
            <div className="hidden md:block h-1 w-32 bg-gradient-to-r from-pot-orange to-pot-magenta rounded-full mr-6"></div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isClient ? 'bg-blue-100 text-blue-800' : 'bg-pot-bg text-pot-petrol border border-gray-200'
              }`}>
                {isClient ? 'Ambiente Cliente' : 'Intranet Corporativa'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-pot-bg p-6">
          <Outlet context={{ user }} />
        </main>
        
        {/* AI Assistant Floating Button */}
        {isInternal && <AIAssistant />}
      </div>
    </div>
  );
};

export default Layout;
