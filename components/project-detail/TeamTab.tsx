import React from 'react';
import { Project } from '../../types';
import { MOCK_USERS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, Mail, Phone, MoreHorizontal, Plus } from 'lucide-react';

interface Props {
  project: Project;
}

export const TeamTab: React.FC<Props> = ({ project }) => {
  const { t } = useLanguage();

  // Mock team members (filter from all users for demo)
  const teamMembers = MOCK_USERS; 

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center">
         <h2 className="text-lg font-bold text-gray-900">{t('detail.team.projectTeam')} ({teamMembers.length})</h2>
         <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            <Plus size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('common.addMember')}
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Project Manager Card */}
         <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-10"></div>
            <div className="flex items-start justify-between relative z-10">
               <div className="flex items-center">
                  <img src={project.manager.avatar} className="w-16 h-16 rounded-full border-4 border-white/20 mr-4 rtl:ml-4 rtl:mr-0" alt=""/>
                  <div>
                     <p className="text-blue-100 text-xs uppercase font-bold tracking-wider mb-1">{t('detail.team.projectManager')}</p>
                     <h3 className="text-2xl font-bold">{project.manager.name}</h3>
                     <p className="text-blue-100">{project.manager.role}</p>
                  </div>
               </div>
               <div className="flex space-x-2 rtl:space-x-reverse">
                  <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 backdrop-blur-sm"><Mail size={20} /></button>
                  <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 backdrop-blur-sm"><Phone size={20} /></button>
               </div>
            </div>
         </div>

         {/* Member Cards */}
         {teamMembers.filter(u => u.id !== project.manager.id).map(member => (
            <div key={member.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                  <img src={member.avatar} className="w-12 h-12 rounded-full" alt="" />
                  <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
               </div>
               <h4 className="font-bold text-gray-900">{member.name}</h4>
               <p className="text-sm text-gray-500 mb-4">{member.role}</p>
               
               <div className="flex items-center space-x-2 rtl:space-x-reverse pt-4 border-t border-gray-100">
                  <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-600">{t('enums.departments.Architecture')}</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};