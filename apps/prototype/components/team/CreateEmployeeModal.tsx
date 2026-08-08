import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Upload, User, Mail, Briefcase, Calendar, Phone, Shield, ChevronDown } from 'lucide-react';
import { Department } from '../../types';
import { MOCK_ROLES } from '../../constants';

interface Props {
  onClose: () => void;
  onSave: (employee: any) => void;
}

const DEPARTMENTS: Department[] = ['Architecture', 'Civil', 'Safety', 'Surveying', 'Modern', 'Khitbrah'];

export const CreateEmployeeModal: React.FC<Props> = ({ onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    roleId: '', // System Role ID
    email: '',
    phone: '',
    department: 'Architecture',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find role name for the selected ID to store (since Employee type has 'role' string currently)
    // In a real app, we'd store roleId.
    const selectedRole = MOCK_ROLES.find(r => r.id === formData.roleId);
    const roleName = selectedRole ? selectedRole.name : formData.jobTitle;

    onSave({
      id: `u_${Date.now()}`,
      name: formData.name,
      role: roleName, // Storing System Role name here for display consistency
      jobTitle: formData.jobTitle, // Extra field if needed
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      status: formData.status,
      joinDate: formData.joinDate,
      avatar: 'https://picsum.photos/200', // Mock avatar
      activeProjects: 0,
      openTasks: 0,
      utilization: 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{t('team.form.title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-employee-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar Upload Placeholder */}
            <div className="flex flex-col items-center justify-center mb-6">
               <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500 transition-all">
                  <Upload size={24} className="mb-1" />
                  <span className="text-xs font-medium">Upload</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Personal Info */}
               <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{t('team.form.personalInfo')}</h3>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.fullName')} <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                        <User size={18} />
                     </div>
                     <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 border bg-white text-gray-900 text-sm"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.email')} <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                        <Mail size={18} />
                     </div>
                     <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => handleChange('email', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 border bg-white text-gray-900 text-sm"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.phone')}</label>
                  <div className="relative">
                     <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                        <Phone size={18} />
                     </div>
                     <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 border bg-white text-gray-900 text-sm"
                     />
                  </div>
               </div>

               {/* Work Info */}
               <div className="md:col-span-2 mt-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{t('team.form.workInfo')}</h3>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.role')} (Job Title) <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                        <Briefcase size={18} />
                     </div>
                     <input 
                        required
                        type="text" 
                        value={formData.jobTitle}
                        onChange={e => handleChange('jobTitle', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 border bg-white text-gray-900 text-sm"
                        placeholder="e.g. Senior Architect"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Role (Permissions) <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                        <Shield size={18} />
                     </div>
                     <select 
                        required
                        value={formData.roleId}
                        onChange={e => handleChange('roleId', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-10 rtl:pr-10 rtl:pl-10 border bg-white text-gray-900 text-sm appearance-none"
                     >
                        <option value="">Select a Role...</option>
                        {MOCK_ROLES.map(role => (
                           <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                     </select>
                     <div className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-gray-400 pointer-events-none">
                        <ChevronDown size={16} />
                     </div>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.department')} <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <select 
                        value={formData.department}
                        onChange={e => handleChange('department', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border bg-white text-gray-900 text-sm appearance-none"
                     >
                        {DEPARTMENTS.map(dept => (
                           <option key={dept} value={dept}>{t(`enums.departments.${dept}` as any)}</option>
                        ))}
                     </select>
                     <div className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-gray-400 pointer-events-none">
                        <ChevronDown size={16} />
                     </div>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.joinDate')}</label>
                  <div className="relative">
                     <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                        <Calendar size={18} />
                     </div>
                     <input 
                        type="date" 
                        value={formData.joinDate}
                        onChange={e => handleChange('joinDate', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 border bg-white text-gray-900 text-sm"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.form.status')}</label>
                  <div className="relative">
                     <select 
                        value={formData.status}
                        onChange={e => handleChange('status', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border bg-white text-gray-900 text-sm appearance-none"
                     >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                     </select>
                     <div className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-gray-400 pointer-events-none">
                        <ChevronDown size={16} />
                     </div>
                  </div>
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
            form="create-employee-form"
            className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            {t('team.form.create')}
          </button>
        </div>
      </div>
    </div>
  );
};