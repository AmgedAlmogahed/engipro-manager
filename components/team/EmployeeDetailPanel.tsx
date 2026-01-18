import React from 'react';
import { Employee } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Mail, Phone, Calendar, Briefcase, CheckSquare, Activity, MoreVertical } from 'lucide-react';

interface Props {
  employee: Employee;
  onClose: () => void;
}

export const EmployeeDetailPanel: React.FC<Props> = ({ employee, onClose }) => {
  const { t, language } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex max-w-full pl-10 rtl:pr-10 rtl:pl-0">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col h-full animate-in slide-in-from-right rtl:slide-in-from-left duration-300">
          
          {/* Header */}
          <div className="relative h-32 bg-slate-900">
             <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10">
                <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                   <X size={20} />
                </button>
             </div>
             <div className="absolute -bottom-10 left-6 rtl:left-auto rtl:right-6">
                <img src={employee.avatar} alt={employee.name} className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white" />
             </div>
          </div>

          <div className="pt-12 px-6 pb-6 border-b border-gray-100 flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                <p className="text-gray-500">{employee.role}</p>
                <div className="flex items-center mt-2 space-x-2 rtl:space-x-reverse">
                   <span className={`px-2 py-0.5 rounded text-xs font-medium ${employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {employee.status}
                   </span>
                   <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {t(`enums.departments.${employee.department}` as any)}
                   </span>
                </div>
             </div>
             <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                <MoreVertical size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
             {/* Contact Info */}
             <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('team.detail.contact')}</h3>
                <div className="space-y-3">
                   <div className="flex items-center text-sm">
                      <Mail size={16} className="text-gray-400 mr-3 rtl:ml-3 rtl:mr-0" />
                      <span className="text-gray-900">{employee.email}</span>
                   </div>
                   <div className="flex items-center text-sm">
                      <Phone size={16} className="text-gray-400 mr-3 rtl:ml-3 rtl:mr-0" />
                      <span className="text-gray-900">{employee.phone || 'N/A'}</span>
                   </div>
                   <div className="flex items-center text-sm">
                      <Calendar size={16} className="text-gray-400 mr-3 rtl:ml-3 rtl:mr-0" />
                      <span className="text-gray-900">{t('team.form.joinDate')}: {new Date(employee.joinDate).toLocaleDateString(language)}</span>
                   </div>
                </div>
             </section>

             {/* Performance / Stats */}
             <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('team.detail.performance')}</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center text-gray-500 mb-2">
                         <Briefcase size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                         <span className="text-xs font-medium">{t('team.employees.projects')}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{employee.activeProjects}</p>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center text-gray-500 mb-2">
                         <CheckSquare size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                         <span className="text-xs font-medium">{t('team.employees.tasks')}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{employee.openTasks}</p>
                   </div>
                </div>
             </section>

             {/* Utilization */}
             <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('team.detail.utilization')}</h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                   <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center text-gray-900 font-medium">
                         <Activity size={18} className="mr-2 rtl:ml-2 rtl:mr-0 text-blue-500" />
                         {employee.utilization}%
                      </div>
                      <span className="text-xs text-gray-500">Target: 80%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                         className={`h-2.5 rounded-full ${employee.utilization > 100 ? 'bg-red-500' : employee.utilization > 80 ? 'bg-blue-600' : 'bg-green-500'}`} 
                         style={{width: `${Math.min(employee.utilization, 100)}%`}}
                      ></div>
                   </div>
                   <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                      {employee.utilization > 100 
                         ? t('team.workload.overloadedDesc') 
                         : t('team.workload.availableDesc')}
                   </p>
                </div>
             </section>

             {/* Recent Work (Mock) */}
             <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('team.detail.currentWork')}</h3>
                <div className="space-y-3">
                   <div className="p-3 border border-gray-100 rounded-lg flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                         <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 rtl:ml-3 rtl:mr-0"></div>
                         <span className="text-sm font-medium text-gray-700">Downtown Hub Design</span>
                      </div>
                      <span className="text-xs text-gray-400">Project</span>
                   </div>
                   <div className="p-3 border border-gray-100 rounded-lg flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                         <div className="w-2 h-2 rounded-full bg-orange-500 mr-3 rtl:ml-3 rtl:mr-0"></div>
                         <span className="text-sm font-medium text-gray-700">Safety Inspection Report</span>
                      </div>
                      <span className="text-xs text-gray-400">Task</span>
                   </div>
                </div>
             </section>
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
             <button className="flex-1 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm">
                Edit Profile
             </button>
             <button className="flex-1 py-2 bg-red-50 text-red-600 border border-red-100 font-medium rounded-lg hover:bg-red-100 text-sm">
                Deactivate
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};