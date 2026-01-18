import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Briefcase, Calendar, User, Flag, Layers, AlignLeft, ChevronDown } from 'lucide-react';
import { MOCK_USERS } from '../../constants';
import { Phase } from '../../types';

interface Props {
  phases: Phase[];
  onClose: () => void;
  onSave: (task: any) => void;
}

export const CreateTaskModal: React.FC<Props> = ({ phases, onClose, onSave }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phaseId: phases.length > 0 ? phases[0].id : '',
    assigneeId: '',
    dueDate: '',
    priority: 'Medium',
    type: 'Internal',
    description: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = MOCK_USERS.find(u => u.id === formData.assigneeId);
    
    onSave({
      id: `t_${Date.now()}`,
      name: formData.name,
      phaseId: formData.phaseId,
      status: 'Not Started',
      assignee: assignee,
      dueDate: formData.dueDate,
      priority: formData.priority,
      type: formData.type,
      duration: 1, // Default
      dependencies: []
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{t('wizard.tasks.form.title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-task-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Task Name */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('wizard.tasks.form.taskName')} <span className="text-red-500">*</span></label>
               <div className="relative">
                  <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                    <Briefcase size={18} />
                  </div>
                  <input 
                     required
                     type="text" 
                     value={formData.name}
                     onChange={e => handleChange('name', e.target.value)}
                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 border bg-white text-gray-900 text-sm"
                     placeholder={language === 'ar' ? 'أدخل اسم المهمة' : 'Enter task name'}
                  />
               </div>
            </div>

            {/* Row 1: Phase & Assignee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('wizard.tasks.form.phase')} <span className="text-red-500">*</span></label>
                   <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                        <Layers size={18} />
                      </div>
                      <select 
                         required
                         value={formData.phaseId}
                         onChange={e => handleChange('phaseId', e.target.value)}
                         className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-10 rtl:pr-10 rtl:pl-10 border bg-white text-gray-900 text-sm appearance-none"
                      >
                         {phases.map(phase => (
                            <option key={phase.id} value={phase.id}>{phase.name}</option>
                         ))}
                      </select>
                      <div className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-gray-400 pointer-events-none">
                        <ChevronDown size={16} />
                      </div>
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('wizard.tasks.assignee')}</label>
                   <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                        <User size={18} />
                      </div>
                      <select 
                         value={formData.assigneeId}
                         onChange={e => handleChange('assigneeId', e.target.value)}
                         className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-10 rtl:pr-10 rtl:pl-10 border bg-white text-gray-900 text-sm appearance-none"
                      >
                         <option value="">{t('wizard.tasks.unassigned')}</option>
                         {MOCK_USERS.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                         ))}
                      </select>
                      <div className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-gray-400 pointer-events-none">
                        <ChevronDown size={16} />
                      </div>
                   </div>
                </div>
            </div>

            {/* Row 2: Due Date & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('wizard.tasks.form.dueDate')}</label>
                   <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                        <Calendar size={18} />
                      </div>
                      <input 
                         type="date"
                         value={formData.dueDate}
                         onChange={e => handleChange('dueDate', e.target.value)}
                         className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 border bg-white text-gray-900 text-sm"
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('wizard.tasks.form.priority')}</label>
                   <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                        <Flag size={18} />
                      </div>
                      <select 
                         value={formData.priority}
                         onChange={e => handleChange('priority', e.target.value)}
                         className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 pr-10 rtl:pr-10 rtl:pl-10 border bg-white text-gray-900 text-sm appearance-none"
                      >
                         <option value="Low">Low</option>
                         <option value="Medium">Medium</option>
                         <option value="High">High</option>
                      </select>
                      <div className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-gray-400 pointer-events-none">
                        <ChevronDown size={16} />
                      </div>
                   </div>
                </div>
            </div>

            {/* Description */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('wizard.tasks.form.description')}</label>
               <div className="relative">
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 text-gray-400 pointer-events-none">
                    <AlignLeft size={18} />
                  </div>
                  <textarea 
                     rows={4}
                     value={formData.description}
                     onChange={e => handleChange('description', e.target.value)}
                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 pl-10 rtl:pl-3 rtl:pr-10 border bg-white text-gray-900 text-sm resize-none"
                     placeholder={language === 'ar' ? 'وصف المهمة...' : 'Task description...'}
                  />
               </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 rtl:space-x-reverse">
          <button onClick={onClose} type="button" className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
            {t('common.cancel')}
          </button>
          <button 
            type="submit"
            form="create-task-form"
            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            {t('wizard.tasks.form.create')}
          </button>
        </div>
      </div>
    </div>
  );
};