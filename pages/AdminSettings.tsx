
import React, { useState } from 'react';
import { MOCK_USERS, MOCK_ROLES, SYSTEM_PERMISSIONS } from '../constants';
import { User, Role, UserRole, PermissionKey } from '../types';
import { Shield, User as UserIcon, Lock, Check, Plus, Trash2, Edit2, X, Search } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  
  // -- State for Users --
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
     name: '', email: '', password: '', roleId: 'consultor', role: UserRole.CONSULTANT
  });

  // -- State for Roles --
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);

  // -- Handlers for Users --
  const handleCreateUser = (e: React.FormEvent) => {
     e.preventDefault();
     // Match legacy enum based on roleId for compatibility
     let legacyRole = UserRole.CONSULTANT;
     if (newUser.roleId === 'admin') legacyRole = UserRole.SUPER_ADMIN;
     if (newUser.roleId === 'gerente_ops') legacyRole = UserRole.MANAGER_CS_OPS;
     
     const createdUser: User = {
        id: Math.floor(Math.random() * 10000),
        name: newUser.name!,
        email: newUser.email!,
        password: newUser.password!,
        roleId: newUser.roleId!,
        role: legacyRole,
        avatar: 'https://picsum.photos/100/100'
     };

     setUsers([...users, createdUser]);
     MOCK_USERS.push(createdUser); // Sync with Mock DB
     setIsUserModalOpen(false);
     setNewUser({ name: '', email: '', password: '', roleId: 'consultor', role: UserRole.CONSULTANT });
  };

  const handleDeleteUser = (id: number) => {
     if (confirm('Tem certeza que deseja remover este usuário?')) {
        setUsers(users.filter(u => u.id !== id));
     }
  };

  // -- Handlers for Roles --
  const handleOpenRoleModal = (role?: Role) => {
     if (role) {
        setEditingRole(role);
        setNewRoleName(role.name);
        setNewRoleDescription(role.description);
        setSelectedPermissions(role.permissions);
     } else {
        setEditingRole(null);
        setNewRoleName('');
        setNewRoleDescription('');
        setSelectedPermissions([]);
     }
     setIsRoleModalOpen(true);
  };

  const handleTogglePermission = (key: PermissionKey) => {
     if (selectedPermissions.includes(key)) {
        setSelectedPermissions(selectedPermissions.filter(p => p !== key));
     } else {
        setSelectedPermissions([...selectedPermissions, key]);
     }
  };

  const handleSaveRole = (e: React.FormEvent) => {
     e.preventDefault();
     
     if (editingRole) {
        // Edit existing
        const updatedRole = { 
           ...editingRole, 
           name: newRoleName, 
           description: newRoleDescription, 
           permissions: selectedPermissions 
        };
        setRoles(roles.map(r => r.id === editingRole.id ? updatedRole : r));
        
        // Update Mock
        const idx = MOCK_ROLES.findIndex(r => r.id === editingRole.id);
        if (idx >= 0) MOCK_ROLES[idx] = updatedRole;

     } else {
        // Create new
        const newRole: Role = {
           id: newRoleName.toLowerCase().replace(/\s+/g, '_'),
           name: newRoleName,
           description: newRoleDescription,
           permissions: selectedPermissions,
           isSystem: false
        };
        setRoles([...roles, newRole]);
        MOCK_ROLES.push(newRole);
     }
     setIsRoleModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-pot-petrol">Administração do Sistema</h2>
             <p className="text-sm text-gray-500">Gerencie usuários, funções e níveis de acesso.</p>
          </div>
       </div>

       {/* Tabs */}
       <div className="bg-white border-b border-gray-200 px-6 pt-2 rounded-t-xl shadow-sm">
           <div className="flex space-x-8">
              <button 
                 onClick={() => setActiveTab('users')}
                 className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users' ? 'border-pot-orange text-pot-petrol' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                 Usuários ({users.length})
              </button>
              <button 
                 onClick={() => setActiveTab('roles')}
                 className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'roles' ? 'border-pot-orange text-pot-petrol' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                 Funções & Permissões ({roles.length})
              </button>
           </div>
       </div>

       {/* Content Area */}
       <div className="bg-white p-6 rounded-b-xl shadow-md border border-gray-100 border-t-0 min-h-[500px]">
           
           {/* TAB: USERS */}
           {activeTab === 'users' && (
              <div>
                 <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                       <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                       <input type="text" placeholder="Buscar usuário..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:border-pot-orange" />
                    </div>
                    <button 
                       onClick={() => setIsUserModalOpen(true)}
                       className="bg-pot-petrol text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-800 transition-colors shadow-sm"
                    >
                       <Plus size={16} className="mr-2" /> Novo Usuário
                    </button>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                             <th className="py-3 font-bold">Usuário</th>
                             <th className="py-3 font-bold">E-mail</th>
                             <th className="py-3 font-bold">Função (Role)</th>
                             <th className="py-3 font-bold text-right">Ações</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {users.map(user => {
                             const userRole = roles.find(r => r.id === user.roleId);
                             return (
                                <tr key={user.id} className="hover:bg-gray-50">
                                   <td className="py-3">
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                            {user.avatar ? <img src={user.avatar} alt="" /> : <UserIcon size={20} className="m-1.5 text-gray-500" />}
                                         </div>
                                         <span className="font-bold text-gray-800 text-sm">{user.name}</span>
                                      </div>
                                   </td>
                                   <td className="py-3 text-sm text-gray-600">{user.email}</td>
                                   <td className="py-3">
                                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded border border-blue-100">
                                         {userRole?.name || user.roleId}
                                      </span>
                                   </td>
                                   <td className="py-3 text-right">
                                      <button 
                                         onClick={() => handleDeleteUser(user.id)}
                                         disabled={user.role === UserRole.SUPER_ADMIN}
                                         className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-30"
                                      >
                                         <Trash2 size={16} />
                                      </button>
                                   </td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}

           {/* TAB: ROLES */}
           {activeTab === 'roles' && (
              <div>
                 <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-500">Defina quais módulos cada perfil pode acessar.</p>
                    <button 
                       onClick={() => handleOpenRoleModal()}
                       className="bg-pot-orange text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-orange-600 transition-colors shadow-sm"
                    >
                       <Plus size={16} className="mr-2" /> Nova Função
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map(role => (
                       <div key={role.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <Shield size={18} className="text-pot-petrol" />
                                <h4 className="font-bold text-gray-800">{role.name}</h4>
                             </div>
                             {!role.isSystem && (
                                <button onClick={() => handleOpenRoleModal(role)} className="text-gray-400 hover:text-blue-500">
                                   <Edit2 size={16} />
                                </button>
                             )}
                          </div>
                          <p className="text-xs text-gray-500 mb-4 h-8">{role.description}</p>
                          <div className="text-xs font-bold text-gray-600 mb-2 uppercase">Acessos Permitidos:</div>
                          <div className="flex flex-wrap gap-1">
                             {role.permissions.slice(0, 4).map(p => (
                                <span key={p} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">
                                   {SYSTEM_PERMISSIONS.find(sp => sp.key === p)?.label || p}
                                </span>
                             ))}
                             {role.permissions.length > 4 && (
                                <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded text-[10px]">
                                   +{role.permissions.length - 4}
                                </span>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}

       </div>

       {/* CREATE USER MODAL */}
       {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
                <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white rounded-t-xl">
                   <h3 className="font-bold flex items-center">
                      <UserIcon size={20} className="mr-2" /> Novo Usuário
                   </h3>
                   <button onClick={() => setIsUserModalOpen(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Nome Completo</label>
                      <input required type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none" 
                         value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">E-mail de Acesso</label>
                      <input required type="email" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none" 
                         value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Senha Temporária</label>
                      <div className="relative">
                         <Lock className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                         <input required type="text" className="w-full border border-gray-300 rounded pl-8 p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none" 
                            value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="Ex: 123456" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Função (Role)</label>
                      <select className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                         value={newUser.roleId} onChange={e => setNewUser({...newUser, roleId: e.target.value})}>
                         {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                         ))}
                      </select>
                   </div>
                   <div className="pt-4 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancelar</button>
                      <button type="submit" className="px-6 py-2 bg-pot-success text-white rounded font-bold text-sm hover:bg-green-700">Criar Usuário</button>
                   </div>
                </form>
             </div>
          </div>
       )}

       {/* CREATE/EDIT ROLE MODAL */}
       {isRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in flex flex-col max-h-[90vh]">
                <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white rounded-t-xl shrink-0">
                   <h3 className="font-bold flex items-center">
                      <Shield size={20} className="mr-2" /> {editingRole ? 'Editar Função' : 'Nova Função'}
                   </h3>
                   <button onClick={() => setIsRoleModalOpen(false)}><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-6 space-y-6">
                   <div className="grid grid-cols-1 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-gray-600 mb-1">Nome da Função</label>
                         <input required type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none" 
                            placeholder="Ex: Analista Financeiro"
                            value={newRoleName} onChange={e => setNewRoleName(e.target.value)} />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-600 mb-1">Descrição</label>
                         <input type="text" className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:border-pot-orange outline-none" 
                            placeholder="Breve descrição do que este cargo faz..."
                            value={newRoleDescription} onChange={e => setNewRoleDescription(e.target.value)} />
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">Permissões de Acesso</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {SYSTEM_PERMISSIONS.map(permission => (
                            <label key={permission.key} className={`flex items-start p-3 rounded border cursor-pointer transition-all ${
                               selectedPermissions.includes(permission.key) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}>
                               <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                                  selectedPermissions.includes(permission.key) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                               }`}>
                                  {selectedPermissions.includes(permission.key) && <Check size={14} className="text-white" />}
                               </div>
                               <input type="checkbox" className="hidden" 
                                  checked={selectedPermissions.includes(permission.key)} 
                                  onChange={() => handleTogglePermission(permission.key)} 
                               />
                               <div>
                                  <span className={`text-sm font-medium ${selectedPermissions.includes(permission.key) ? 'text-blue-800' : 'text-gray-700'}`}>
                                     {permission.label}
                                  </span>
                                  <span className="block text-[10px] text-gray-400">{permission.module}</span>
                               </div>
                            </label>
                         ))}
                      </div>
                   </div>
                </form>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl shrink-0">
                   <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancelar</button>
                   <button onClick={handleSaveRole} className="px-6 py-2 bg-pot-success text-white rounded font-bold text-sm hover:bg-green-700">Salvar Função</button>
                </div>
             </div>
          </div>
       )}

    </div>
  );
};

export default AdminSettings;
