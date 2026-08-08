import React from 'react';
import { Project } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Briefcase, User, Calendar, Activity, CheckCircle, Clock } from 'lucide-react';

interface Props {
  project: Project;
}

export const OverviewTab: React.FC<Props> = ({ project }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Project Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
         <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <Briefcase size={18} className="mr-2 rtl:ml-2 rtl:mr-0 text-blue-600" />
            {t('detail.overview.projectInfo')}
         </h3>
         <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">{project.description || t('detail.overview.noDesc')}</p>
            <div className="grid grid-cols-2 gap-4 pt-2">
               <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">{t('table.type')}</p>
                  <p className="font-medium text-sm">{t(`enums.projectTypes.${project.type}` as any)}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">{t('table.departments')}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                     {project.departments.map(d => (
                        <span key={d} className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600">{t(`enums.departments.${d}` as any)}</span>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Client Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
         <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <User size={18} className="mr-2 rtl:ml-2 rtl:mr-0 text-indigo-600" />
            {t('detail.overview.clientInfo')}
         </h3>
         <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
               <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3 rtl:ml-3 rtl:mr-0">
                  {project.client.name.substring(0, 2).toUpperCase()}
               </div>
               <div>
                  <p className="font-bold text-sm text-gray-900">{project.client.name}</p>
                  <p className="text-xs text-gray-500">{project.client.type}</p>
               </div>
            </div>
            <div className="space-y-2 text-sm">
               <div className="flex justify-between">
                  <span className="text-gray-500">{t('detail.overview.contact')}</span>
                  <span className="font-medium">{project.client.contact}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-gray-500">{t('detail.overview.email')}</span>
                  <span className="font-medium text-blue-600 truncate max-w-[150px]">{project.client.email}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-gray-500">{t('detail.overview.phone')}</span>
                  <span className="font-medium">{project.client.phone || t('detail.overview.na')}</span>
               </div>
            </div>
         </div>
      </div>

      {/* Timeline Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
         <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <Calendar size={18} className="mr-2 rtl:ml-2 rtl:mr-0 text-amber-600" />
            {t('detail.overview.timeline')}
         </h3>
         <div className="relative pt-2 pl-2">
             {/* Vertical Line */}
             <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-100 rtl:right-2 rtl:left-auto"></div>
             
             <div className="space-y-6">
                <div className="relative flex items-center pl-6 rtl:pr-6 rtl:pl-0">
                   <div className="absolute left-0 rtl:right-0 w-4 h-4 rounded-full border-2 border-blue-500 bg-white"></div>
                   <div>
                      <p className="text-xs text-gray-400">{t('detail.stats.startDate')}</p>
                      <p className="font-medium text-sm">{project.startDate}</p>
                   </div>
                </div>
                
                <div className="relative flex items-center pl-6 rtl:pr-6 rtl:pl-0">
                   <div className="absolute left-0 rtl:right-0 w-4 h-4 rounded-full border-2 border-gray-300 bg-gray-100"></div>
                   <div>
                      <p className="text-xs text-gray-400">{t('wizard.review.currentPhase')}</p>
                      <p className="font-medium text-sm text-blue-600">
                         {project.phases.find(p => p.tasks.some(t => t.status === 'In Progress'))?.name || t('wizard.review.allInactive')}
                      </p>
                   </div>
                </div>

                <div className="relative flex items-center pl-6 rtl:pr-6 rtl:pl-0">
                   <div className="absolute left-0 rtl:right-0 w-4 h-4 rounded-full border-2 border-gray-300 bg-gray-100"></div>
                   <div>
                      <p className="text-xs text-gray-400">{t('detail.stats.endDate')}</p>
                      <p className="font-medium text-sm">{project.endDate}</p>
                   </div>
                </div>
             </div>
         </div>
      </div>

      {/* Progress By Phase */}
      <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
             <Activity size={18} className="mr-2 rtl:ml-2 rtl:mr-0 text-green-600" />
             {t('wizard.review.phaseProgress')}
          </h3>
          <div className="space-y-4">
             {project.phases.map(phase => {
                const completed = phase.tasks.filter(t => t.status === 'Completed').length;
                const total = phase.tasks.length;
                const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
                
                return (
                   <div key={phase.id}>
                      <div className="flex justify-between text-sm mb-1">
                         <span className="font-medium text-gray-700">{phase.name}</span>
                         <span className="text-gray-500 text-xs">{completed}/{total} {t('detail.stats.tasks')}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                         <div 
                           className={`h-2.5 rounded-full ${percent === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                           style={{width: `${percent}%`}}
                         ></div>
                      </div>
                   </div>
                )
             })}
          </div>
      </div>

      {/* Recent Activity Mini */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
             <Clock size={18} className="mr-2 rtl:ml-2 rtl:mr-0 text-gray-600" />
             {t('detail.overview.recentActivity')}
          </h3>
          <div className="space-y-4">
             {project.activityLog?.slice(0, 3).map(log => (
                <div key={log.id} className="flex items-start text-sm">
                   <img src={log.user.avatar} className="w-6 h-6 rounded-full mr-2 rtl:ml-2 rtl:mr-0 mt-0.5" alt="" />
                   <div>
                      <p className="text-gray-800">
                         <span className="font-medium">{log.user.name.split(' ')[0]}</span> {log.action} <span className="font-medium text-blue-600">{log.target}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(log.timestamp).toLocaleDateString()}</p>
                   </div>
                </div>
             )) || <p className="text-sm text-gray-400 italic">{t('detail.overview.noActivity')}</p>}
          </div>
      </div>
    </div>
  );
};