import React, { useState, useEffect } from 'react';
import { Role, PermissionDefinition } from '../../types';
import { PERMISSION_MATRIX } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Check } from 'lucide-react';

interface Props {
  role?: Role;
  onSave: (role: Role) => void;
  onClose: () => void;
}

export const RoleModal: React.FC<Props> = ({ role, onSave, onClose }) => {
  const { t } = useLanguage();
  
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || []);

  const handleTogglePermission = (key: string) => {
    setSelectedPermissions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleToggleCategory = (categoryKeys: string[]) => {
    const allSelected = categoryKeys.every(k => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(k => !categoryKeys.includes(k)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryKeys])]);
    }
  };

  const handleSubmit = () => {
    const newRole: Role = {
      id: role?.id || `r_${Date.now()}`,
      name,
      description,
      userCount: role?.userCount || 0,
      isSystem: role?.isSystem || false,
      permissions: selectedPermissions
    };
    onSave(newRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{t('roles.modal.title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('roles.modal.roleName')} <span className="text-red-500">*</span></label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 bg-white text-gray-900"
                placeholder={t('roles.modal.placeholderName')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('roles.modal.description')}</label>
              <input 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 bg-white text-gray-900"
                placeholder={t('roles.modal.placeholderDesc')}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('roles.modal.permissions')}</h3>
            
            <div className="space-y-6">
              {PERMISSION_MATRIX.map((category) => {
                const categoryKeys = category.actions.map(a => a.key);
                const isAllSelected = categoryKeys.every(k => selectedPermissions.includes(k));
                
                return (
                  <div key={category.category} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
                      <h4 className="font-bold text-gray-800 uppercase text-sm">{t(`roles.categories.${category.category}`)}</h4>
                      <button 
                        onClick={() => handleToggleCategory(categoryKeys)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        {isAllSelected ? t('common.deselectAll') : t('roles.modal.selectAll')}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {category.actions.map(action => (
                        <label key={action.key} className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer group">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedPermissions.includes(action.key) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                            {selectedPermissions.includes(action.key) && <Check size={14} className="text-white" />}
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={selectedPermissions.includes(action.key)}
                            onChange={() => handleTogglePermission(action.key)}
                          />
                          <span className={`text-sm ${selectedPermissions.includes(action.key) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                            {action.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 rtl:space-x-reverse">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
            {t('roles.modal.cancel')}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!name}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('roles.modal.save')}
          </button>
        </div>
      </div>
    </div>
  );
};