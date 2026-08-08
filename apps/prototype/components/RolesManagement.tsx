import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MOCK_ROLES } from '../constants';
import { Role } from '../types';
import { Shield, Plus, History, List, LayoutGrid, LayoutList } from 'lucide-react';
import { RolesList } from './roles/RolesList';
import { AuditLogTab } from './roles/AuditLogTab';
import { RoleModal } from './roles/RoleModal';

export const RolesManagement: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'roles' | 'audit'>('roles');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);

  const handleCreate = () => {
    setEditingRole(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDuplicate = (role: Role) => {
    const newRole: Role = {
      ...role,
      id: `r_${Date.now()}`,
      name: `${role.name} (Copy)`,
      isSystem: false,
      userCount: 0
    };
    setRoles([...roles, newRole]);
  };

  const handleDelete = (roleId: string) => {
    if (window.confirm(t('common.confirmDeleteRole'))) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const handleSaveRole = (role: Role) => {
    if (editingRole) {
      setRoles(roles.map(r => r.id === role.id ? role : r));
    } else {
      setRoles([...roles, role]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div className="flex items-center">
            <div className="bg-indigo-600 p-2 rounded-lg mr-3 rtl:ml-3 rtl:mr-0">
               <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('roles.title')}</h1>
         </div>
         <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {activeTab === 'roles' && (
               <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                  <button 
                     onClick={() => setViewMode('grid')}
                     className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                     title={t('common.grid')}
                  >
                     <LayoutGrid size={18} />
                  </button>
                  <button 
                     onClick={() => setViewMode('list')}
                     className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                     title={t('common.list')}
                  >
                     <LayoutList size={18} />
                  </button>
               </div>
            )}
            <button 
               onClick={handleCreate}
               className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors"
            >
               <Plus size={18} className="mr-2 rtl:ml-2 rtl:mr-0" /> 
               {t('roles.create')}
            </button>
         </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
         <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
            <button
               onClick={() => setActiveTab('roles')}
               className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeTab === 'roles'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
            >
               <List size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
               {t('roles.list')}
            </button>
            <button
               onClick={() => setActiveTab('audit')}
               className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeTab === 'audit'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
            >
               <History size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
               {t('roles.audit')}
            </button>
         </nav>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
         {activeTab === 'roles' && (
            <RolesList 
               roles={roles} 
               viewMode={viewMode}
               onEdit={handleEdit} 
               onDuplicate={handleDuplicate} 
               onDelete={handleDelete} 
            />
         )}
         {activeTab === 'audit' && <AuditLogTab />}
      </div>

      {/* Modal */}
      {isModalOpen && (
         <RoleModal 
            role={editingRole} 
            onSave={handleSaveRole} 
            onClose={() => setIsModalOpen(false)} 
         />
      )}
    </div>
  );
};