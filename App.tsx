
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Leads from './pages/Leads';
import Onboarding from './pages/Onboarding';
import DealDetails from './pages/DealDetails';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import ClientPortal from './pages/ClientPortal';
import Products from './pages/Products';
import Agenda from './pages/Agenda';
import Clients from './pages/Clients';
import AdminSettings from './pages/AdminSettings';
import Tickets from './pages/Tickets'; // New Import
import Financial from './pages/Financial';
import { User, UserRole } from './types';
import { MOCK_USERS } from './constants';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
   const [currentUser, setCurrentUser] = useState<User | null>(null);

   // Login Form State
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');

   const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      // Find user by email
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (user) {
         // Check password (mock check)
         if (user.password === password) {
            setCurrentUser(user);
         } else {
            setError('Senha incorreta.');
         }
      } else {
         setError('Usuário não encontrado.');
      }
   };

   const handleLogout = () => {
      setCurrentUser(null);
      setEmail('');
      setPassword('');
   };

   // Login Screen
   if (!currentUser) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
               {/* Header */}
               <div className="bg-pot-petrol p-8 text-center relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pot-orange to-pot-magenta"></div>
                  <h1 className="text-3xl font-extrabold text-white mb-2">Potencialize OS</h1>
                  <p className="text-gray-300 text-sm">Intranet Corporativa & CRM</p>
               </div>

               {/* Form */}
               <div className="p-8">
                  <form onSubmit={handleLogin} className="space-y-6">
                     <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">E-mail Corporativo</label>
                        <div className="relative">
                           <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                           <input
                              type="email"
                              required
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pot-orange focus:ring-1 focus:ring-pot-orange transition-all bg-white text-gray-900"
                              placeholder="seu.nome@potencialize.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Senha</label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                           <input
                              type="password"
                              required
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pot-orange focus:ring-1 focus:ring-pot-orange transition-all bg-white text-gray-900"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                           />
                        </div>
                     </div>

                     {error && (
                        <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                           <AlertCircle size={16} className="mr-2" />
                           {error}
                        </div>
                     )}

                     <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pot-orange to-pot-magenta text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                     >
                        Acessar Sistema <ArrowRight size={18} className="ml-2" />
                     </button>
                  </form>

                  {/* Quick Login Helpers for Dev/Demo */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                     <p className="text-xs text-center text-gray-400 mb-3">Acesso Rápido (Demo)</p>
                     <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => { setEmail('carlos@potencialize.com'); setPassword('123'); }} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600">Admin</button>
                        <button onClick={() => { setEmail('joao@potencialize.com'); setPassword('123'); }} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600">Consultor</button>
                        <button onClick={() => { setEmail('maria@industriasabc.com.br'); setPassword('123'); }} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600">Cliente</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   const isClient = currentUser.role === UserRole.CLIENT_USER || currentUser.role === UserRole.CLUB_MEMBER;

   return (
      <HashRouter>
         <Routes>
            <Route path="/" element={<Layout user={currentUser} onLogout={handleLogout} />}>
               {/* Redirect based on role */}
               <Route index element={<Navigate to={isClient ? "/portal" : "/dashboard"} replace />} />

               {/* Internal Routes (Protected) */}
               <Route path="dashboard" element={isClient ? <Navigate to="/portal" /> : <Dashboard />} />

               {/* Commercial Routes */}
               <Route path="clients" element={isClient ? <Navigate to="/portal" /> : <Clients />} />
               <Route path="leads" element={isClient ? <Navigate to="/portal" /> : <Leads />} />
               <Route path="crm" element={isClient ? <Navigate to="/portal" /> : <CRM />} />
               <Route path="crm/:id" element={isClient ? <Navigate to="/portal" /> : <DealDetails />} />
               <Route path="agenda" element={isClient ? <Navigate to="/portal" /> : <Agenda />} />

               {/* Operational Routes */}
               <Route path="onboarding" element={isClient ? <Navigate to="/portal" /> : <Onboarding />} />

               {/* PROJECTS: Allow clients to view */}
               <Route path="projects" element={<Projects />} />

               {/* TASKS: Allow clients to view */}
               <Route path="tasks" element={<Tasks />} />

               {/* TICKETS: Shared access */}
               <Route path="tickets" element={<Tickets />} />

               <Route path="products" element={isClient ? <Navigate to="/portal" /> : <Products />} />

               {/* Admin Routes */}
               <Route path="admin" element={isClient ? <Navigate to="/portal" /> : <AdminSettings />} />
               <Route path="financial" element={isClient ? <Navigate to="/portal" /> : <Financial />} />

               {/* Client Routes */}
               <Route path="portal" element={<ClientPortal />} />
            </Route>
         </Routes>
      </HashRouter>
   );
};

export default App;
