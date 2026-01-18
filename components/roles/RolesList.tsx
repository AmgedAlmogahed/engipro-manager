import React from 'react';
import { Role } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Shield, Users, Edit, Copy, Trash2, Lock, MoreVertical } from 'lucide-react';

interface Props {
  roles: Role[];
  viewMode: 'grid' | 'list';
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onDelete: (roleId: string) => void;
}

export const RolesList: React.FC<Props> = ({ roles, viewMode, onEdit, onDuplicate, onDelete }) => {
  const { t } = useLanguage();

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('roles.modal.roleName')}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('roles.modal.description')}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('roles.card.users')}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('roles.card.permissions')}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 rtl:ml-3 rtl:mr-0 ${role.isSystem ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        <Shield size={16} />
                      </div>
                      <span className="font-medium text-gray-900">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={role.description}>
                    {role.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users size={14} className="mr-1.5 rtl:ml-1.5 rtl:mr-0 text-gray-400" />
                      {role.userCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                      {role.permissions.length} Enabled
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {role.isSystem ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        <Lock size={10} className="mr-1 rtl:ml-1 rtl:mr-0" /> {t('roles.card.system')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        Custom
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
                      <button onClick={() => onEdit(role)} className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => onDuplicate(role)} className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded">
                        <Copy size={16} />
                      </button>
                      {!role.isSystem && (
                        <button onClick={() => onDelete(role.id)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
      {roles.map((role) => (
        <div key={role.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
          {role.isSystem && (
            <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg rtl:rounded-bl-none rtl:rounded-br-lg flex items-center">
               <Lock size={10} className="mr-1 rtl:ml-1 rtl:mr-0" /> {t('roles.card.system')}
            </div>
          )}
          
          <div className="p-6 flex-1">
             <div className="flex items-start mb-4">
                <div className={`p-3 rounded-lg ${role.isSystem ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-600'}`}>
                   <Shield size={24} />
                </div>
                <div className="ms-4">
                   <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                   <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">{role.description}</p>
                </div>
             </div>

             <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex items-center">
                   <Users size={16} className="mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                   <span>{role.userCount} {t('roles.card.users')}</span>
                </div>
                <div className="flex items-center">
                   <span className="font-semibold text-gray-900 mr-1 rtl:ml-1 rtl:mr-0">{role.permissions.length}</span>
                   <span>{t('roles.card.permissions')}</span>
                </div>
             </div>
          </div>

          <div className="border-t border-gray-100 p-3 flex justify-between bg-gray-50/50">
             <button 
                onClick={() => onEdit(role)}
                className="flex-1 flex items-center justify-center py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
             >
                <Edit size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('roles.card.edit')}
             </button>
             <div className="w-px bg-gray-200 my-1 mx-1"></div>
             <button 
                onClick={() => onDuplicate(role)}
                className="flex-1 flex items-center justify-center py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
             >
                <Copy size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('actions.duplicate')}
             </button>
             {!role.isSystem && (
                <>
                   <div className="w-px bg-gray-200 my-1 mx-1"></div>
                   <button 
                      onClick={() => onDelete(role.id)}
                      className="flex-1 flex items-center justify-center py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-white rounded-md transition-colors"
                   >
                      <Trash2 size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('actions.delete')}
                   </button>
                </>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};