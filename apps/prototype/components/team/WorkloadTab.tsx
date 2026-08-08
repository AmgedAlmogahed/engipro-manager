import React from 'react';
import { MOCK_EMPLOYEES } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const WorkloadTab: React.FC = () => {
  const { t } = useLanguage();

  const sortedEmployees = [...MOCK_EMPLOYEES].sort((a, b) => b.utilization - a.utilization);

  const getUtilizationColor = (percent: number) => {
    if (percent > 100) return 'bg-red-500';
    if (percent > 80) return 'bg-amber-500';
    if (percent < 50) return 'bg-green-500'; // Underutilized but available
    return 'bg-blue-500'; // Optimal
  };

  const getStatusLabel = (percent: number) => {
     if (percent > 100) return { label: t('team.workload.overloaded'), icon: AlertTriangle, color: 'text-red-600' };
     if (percent < 60) return { label: t('team.workload.available'), icon: CheckCircle, color: 'text-green-600' };
     return { label: t('team.workload.optimal'), icon: Info, color: 'text-blue-600' };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
       {/* Recommendations Header */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center shadow-sm">
             <div className="bg-white p-2 rounded-full mr-4 rtl:ml-4 rtl:mr-0 shadow-sm text-red-500">
                <AlertTriangle size={24} />
             </div>
             <div>
                <h4 className="font-bold text-red-800">{t('team.workload.overloadedTitle')}</h4>
                <p className="text-sm text-red-600 mt-1">
                   {sortedEmployees.filter(e => e.utilization > 100).length} {t('team.workload.overloadedDesc')}
                </p>
             </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center shadow-sm">
             <div className="bg-white p-2 rounded-full mr-4 rtl:ml-4 rtl:mr-0 shadow-sm text-green-500">
                <CheckCircle size={24} />
             </div>
             <div>
                <h4 className="font-bold text-green-800">{t('team.workload.availableTitle')}</h4>
                <p className="text-sm text-green-600 mt-1">
                   {sortedEmployees.filter(e => e.utilization < 60).length} {t('team.workload.availableDesc')}
                </p>
             </div>
          </div>
       </div>

       {/* Workload Table/Chart Hybrid */}
       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
             <h3 className="font-bold text-gray-900">{t('team.workload.resourceUtil')}</h3>
             <span className="text-xs text-gray-500">{t('team.workload.thisWeek')}</span>
          </div>
          
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                   <tr>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">{t('team.workload.employee')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">{t('team.workload.status')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">{t('team.workload.utilization')}</th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {sortedEmployees.map(emp => {
                      const status = getStatusLabel(emp.utilization);
                      const Icon = status.icon;
                      
                      return (
                         <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="flex items-center">
                                  <img src={emp.avatar} className="w-8 h-8 rounded-full mr-3 rtl:ml-3 rtl:mr-0" alt="" />
                                  <div>
                                     <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                     <p className="text-xs text-gray-500">{emp.role}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className={`flex items-center text-sm font-medium ${status.color}`}>
                                  <Icon size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                                  {status.label}
                               </div>
                            </td>
                            <td className="px-6 py-4 align-middle">
                               <div className="flex items-center">
                                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden mr-3 rtl:ml-3 rtl:mr-0">
                                     <div 
                                       className={`h-full rounded-full ${getUtilizationColor(emp.utilization)}`} 
                                       style={{ width: `${Math.min(emp.utilization, 100)}%` }}
                                     ></div>
                                  </div>
                                  <span className="text-sm font-bold text-gray-700 w-12 text-right">{emp.utilization}%</span>
                               </div>
                            </td>
                         </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};