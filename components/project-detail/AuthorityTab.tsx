import React from 'react';
import { Project } from '../../types';
import { MOCK_AUTHORITY_APPS } from '../../constants';
import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  project: Project;
}

export const AuthorityTab: React.FC<Props> = ({ project }) => {
  const { t } = useLanguage();
  // Filter apps for this project
  const projectApps = MOCK_AUTHORITY_APPS.filter(app => app.projectId === project.id);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Approved': return <span className="flex items-center text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs font-bold"><CheckCircle size={12} className="mr-1"/> {t('enums.authStatus.Approved')}</span>;
      case 'Pending': return <span className="flex items-center text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-bold"><Clock size={12} className="mr-1"/> {t('enums.authStatus.Pending')}</span>;
      case 'Info Required': return <span className="flex items-center text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-xs font-bold"><AlertCircle size={12} className="mr-1"/> {t('enums.authStatus.Info Required')}</span>;
      default: return <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
       <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">{t('detail.authority.title')}</h2>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 text-sm">
             + {t('detail.authority.new')}
          </button>
       </div>

       {projectApps.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
             <p className="text-gray-500 mb-2">{t('detail.authority.noApps')}</p>
             <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t('detail.authority.createFirst')}</button>
          </div>
       ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                   <tr>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t('detail.authority.trackingId')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t('detail.authority.authType')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t('detail.authority.status')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t('detail.authority.waitTime')}</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {projectApps.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                         <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">{app.trackingId}</td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{app.authority}</div>
                            <div className="text-xs text-gray-500">{app.type}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(app.status)}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {app.daysWaiting > 0 ? `${app.daysWaiting} days` : '-'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 flex items-center justify-end ml-auto">
                               {t('detail.authority.view')} <ExternalLink size={14} className="ml-1 rtl:mr-1 rtl:ml-0" />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       )}
    </div>
  );
};