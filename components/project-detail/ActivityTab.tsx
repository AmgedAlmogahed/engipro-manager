import React from 'react';
import { Project } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Filter } from 'lucide-react';

interface Props {
  project: Project;
}

export const ActivityTab: React.FC<Props> = ({ project }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
       <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">{t('detail.tabs.activity')}</h2>
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
             <Filter size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('detail.activity.filter')}
          </button>
       </div>

       <div className="relative border-l-2 border-gray-200 ml-3 rtl:mr-3 rtl:ml-0 space-y-8 py-2">
          {project.activityLog?.map((log, idx) => (
             <div key={log.id} className="relative pl-8 rtl:pr-8 rtl:pl-0">
                <div className="absolute -left-2.5 rtl:-right-2.5 rtl:left-auto top-0 bg-white border-2 border-blue-500 w-5 h-5 rounded-full"></div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                         <img src={log.user.avatar} className="w-8 h-8 rounded-full mr-3 rtl:ml-3 rtl:mr-0" alt=""/>
                         <span className="font-bold text-gray-900 text-sm">{log.user.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                   </div>
                   <p className="text-sm text-gray-600">
                      {log.action} <span className="font-medium text-gray-900">{log.target}</span>
                   </p>
                </div>
             </div>
          ))}
          
          {(!project.activityLog || project.activityLog.length === 0) && (
             <p className="pl-8 rtl:pr-8 rtl:pl-0 text-gray-500 italic">{t('detail.activity.noActivity')}</p>
          )}
       </div>
    </div>
  );
};