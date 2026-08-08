import React from 'react';
import { Project, ProjectStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Calendar, Users, Clock, CheckSquare, MoreVertical, Edit, Download, Copy, Archive, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  project: Project;
  onStatusChange: (status: ProjectStatus) => void;
}

export const ProjectHeader: React.FC<Props> = ({ project, onStatusChange }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const getStatusColor = (status: ProjectStatus) => {
    switch(status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-amber-100 text-amber-800';
      case 'Not Started': return 'bg-slate-100 text-slate-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const daysRemaining = Math.max(0, Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Breadcrumb & Actions */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
         <div className="flex items-center text-sm text-gray-500">
            <button onClick={() => navigate('/projects')} className="hover:text-blue-600 transition-colors flex items-center">
               {language === 'ar' ? <ArrowRight size={16} className="ml-1" /> : <ArrowLeft size={16} className="mr-1" />}
               {t('projects')}
            </button>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900 truncate max-w-[200px]">{project.name}</span>
         </div>
         <div className="flex items-center space-x-2 rtl:space-x-reverse">
             <div className="relative group">
                 <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <MoreVertical size={20} />
                 </button>
                 <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block z-50">
                    <button className="w-full text-left rtl:text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"><Edit size={14} className="mr-2 rtl:ml-2 rtl:mr-0"/> {t('actions.edit')}</button>
                    <button className="w-full text-left rtl:text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"><Download size={14} className="mr-2 rtl:ml-2 rtl:mr-0"/> {t('actions.bulkExport')}</button>
                    <button className="w-full text-left rtl:text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"><Copy size={14} className="mr-2 rtl:ml-2 rtl:mr-0"/> {t('actions.duplicate')}</button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button className="w-full text-left rtl:text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"><Archive size={14} className="mr-2 rtl:ml-2 rtl:mr-0"/> {t('actions.archive')}</button>
                 </div>
             </div>
         </div>
      </div>

      {/* Main Info */}
      <div className="px-6 py-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                   <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                   <span className="px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-600 border border-gray-200">{project.id}</span>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                   <select 
                      value={project.status}
                      onChange={(e) => onStatusChange(e.target.value as ProjectStatus)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer appearance-none ${getStatusColor(project.status)}`}
                   >
                      <option value="Not Started">{t('status.notStarted')}</option>
                      <option value="In Progress">{t('status.inProgress')}</option>
                      <option value="On Hold">{t('status.onHold')}</option>
                      <option value="Completed">{t('status.completed')}</option>
                      <option value="Cancelled">{t('status.cancelled')}</option>
                   </select>
                   <div className="flex items-center w-48">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-600 rounded-full" style={{width: `${project.progress}%`}}></div>
                      </div>
                      <span className="ml-2 rtl:mr-2 rtl:ml-0 text-xs font-medium text-gray-600">{project.progress}%</span>
                   </div>
                </div>
             </div>
             
             {/* Quick Stats */}
             <div className="flex space-x-6 rtl:space-x-reverse text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <div className="flex flex-col items-center px-2">
                    <span className="text-xs text-gray-400 uppercase font-bold mb-1">{t('detail.stats.startDate')}</span>
                    <div className="flex items-center font-medium">
                       <Calendar size={14} className="mr-1.5 rtl:ml-1.5 rtl:mr-0 text-blue-500" />
                       {new Date(project.startDate).toLocaleDateString(language)}
                    </div>
                 </div>
                 <div className="w-px bg-gray-200 h-10"></div>
                 <div className="flex flex-col items-center px-2">
                    <span className="text-xs text-gray-400 uppercase font-bold mb-1">{t('detail.stats.daysRemaining')}</span>
                    <div className="flex items-center font-medium">
                       <Clock size={14} className="mr-1.5 rtl:ml-1.5 rtl:mr-0 text-amber-500" />
                       {daysRemaining}
                    </div>
                 </div>
                 <div className="w-px bg-gray-200 h-10"></div>
                 <div className="flex flex-col items-center px-2">
                    <span className="text-xs text-gray-400 uppercase font-bold mb-1">{t('detail.stats.tasks')}</span>
                    <div className="flex items-center font-medium">
                       <CheckSquare size={14} className="mr-1.5 rtl:ml-1.5 rtl:mr-0 text-green-500" />
                       {project.tasksCompleted}/{project.tasksTotal}
                    </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};