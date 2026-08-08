import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus } from 'lucide-react';
import { EmployeesTab } from './team/EmployeesTab';
import { DepartmentsTab } from './team/DepartmentsTab';
import { WorkloadTab } from './team/WorkloadTab';

export const TeamManagement: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'employees' | 'departments' | 'workload'>('employees');

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('team.title')}</h1>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
             <Plus size={18} className="mr-2 rtl:ml-2 rtl:mr-0" /> 
             {activeTab === 'departments' ? t('team.addDepartment') : t('team.addEmployee')}
          </button>
       </div>

       {/* Navigation */}
       <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
             <button
                onClick={() => setActiveTab('employees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                   activeTab === 'employees'
                   ? 'border-blue-500 text-blue-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
             >
                {t('team.tabs.employees')}
             </button>
             <button
                onClick={() => setActiveTab('departments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                   activeTab === 'departments'
                   ? 'border-blue-500 text-blue-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
             >
                {t('team.tabs.departments')}
             </button>
             <button
                onClick={() => setActiveTab('workload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                   activeTab === 'workload'
                   ? 'border-blue-500 text-blue-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
             >
                {t('team.tabs.workload')}
             </button>
          </nav>
       </div>

       {/* Content */}
       <div className="min-h-[500px]">
          {activeTab === 'employees' && <EmployeesTab />}
          {activeTab === 'departments' && <DepartmentsTab />}
          {activeTab === 'workload' && <WorkloadTab />}
       </div>
    </div>
  );
};