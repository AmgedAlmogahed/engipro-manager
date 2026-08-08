import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Briefcase, FileText, User } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../../constants';

interface Props {
  onClose: () => void;
  onSave: (department: any) => void;
}

export const CreateDepartmentModal: React.FC<Props> = ({ onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headId: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const head = MOCK_EMPLOYEES.find(e => e.id === formData.headId);
    
    onSave({
      id: `d_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      headOfDepartment: head || MOCK_EMPLOYEES[0],
      employeeCount: 0,
      activeProjectCount: 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{t('team.form.deptTitle')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-department-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.deptName')} <span className="text-red-500">*</span></label>
               <div className="relative">
                  <Briefcase size={18} className="absolute top-2.5 left-3 rtl:left-auto rtl:right-3 text-gray-400" />
                  <input 
                     required
                     type="text" 
                     value={formData.name}
                     onChange={e => handleChange('name', e.target.value)}
                     className="pl-10 rtl:pl-3 rtl:pr-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 bg-white text-gray-900"
                     placeholder="e.g. Mechanical Engineering"
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.deptHead')}</label>
               <div className="relative">
                  <User size={18} className="absolute top-2.5 left-3 rtl:left-auto rtl:right-3 text-gray-400" />
                  <select 
                     value={formData.headId}
                     onChange={e => handleChange('headId', e.target.value)}
                     className="pl-10 rtl:pl-3 rtl:pr-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 bg-white text-gray-900"
                  >
                     <option value="">Select Department Head</option>
                     {MOCK_EMPLOYEES.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                     ))}
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.description')}</label>
               <div className="relative">
                  <FileText size={18} className="absolute top-3 left-3 rtl:left-auto rtl:right-3 text-gray-400" />
                  <textarea 
                     rows={3}
                     value={formData.description}
                     onChange={e => handleChange('description', e.target.value)}
                     className="pl-10 rtl:pl-3 rtl:pr-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 border px-3 bg-white text-gray-900"
                  />
               </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 rtl:space-x-reverse">
          <button onClick={onClose} type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
            {t('common.cancel')}
          </button>
          <button 
            type="submit"
            form="create-department-form"
            className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            {t('team.form.createDept')}
          </button>
        </div>
      </div>
    </div>
  );
};