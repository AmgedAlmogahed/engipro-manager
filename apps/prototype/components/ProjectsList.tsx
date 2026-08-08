import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, Search, MoreVertical, Calendar, Users, Briefcase, 
  LayoutList, LayoutGrid, CheckSquare, Download, Edit, 
  BarChart2, Trash2, UserPlus, FileCheck, ArrowRight, ArrowLeft
} from 'lucide-react';
import { MOCK_PROJECTS, MOCK_USERS, MOCK_CLIENTS } from '../constants';
import { Project, Department, ProjectStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [deptFilter, setDeptFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(p => p.id));
    }
  };

  const toggleSelectProject = (id: string) => {
    if (selectedProjects.includes(id)) {
      setSelectedProjects(selectedProjects.filter(pId => pId !== id));
    } else {
      setSelectedProjects([...selectedProjects, id]);
    }
  };

  // Filter Logic
  const filteredProjects = MOCK_PROJECTS.filter(p => {
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(p.status);
    const matchesDept = deptFilter.length === 0 || p.departments.some(d => deptFilter.includes(d));
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesDept && matchesSearch;
  });

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

  const getAuthorityColor = (status: 'Green' | 'Yellow' | 'Red') => {
    switch(status) {
      case 'Green': return 'bg-green-500';
      case 'Yellow': return 'bg-amber-500';
      case 'Red': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const DEPARTMENTS: Department[] = ['Architecture', 'Civil', 'Safety', 'Surveying', 'Modern', 'Khitbrah'];
  const STATUSES: ProjectStatus[] = ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">{t('projects')}</h1>
           <p className="text-sm text-gray-500 mt-1">
             {t('totalProjects')}: <span className="font-semibold text-gray-900">{MOCK_PROJECTS.length}</span>
           </p>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
           <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title={t('common.list')}
              >
                <LayoutList size={18} />
              </button>
              <button 
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title={t('common.board')}
              >
                <LayoutGrid size={18} />
              </button>
           </div>
           <button onClick={() => navigate('/projects/new')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 shadow-sm transition-colors flex items-center">
             {t('createProject')}
           </button>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
         <div className="flex flex-col md:flex-row gap-3 flex-1 overflow-x-auto pb-2 md:pb-0">
            {/* Search */}
            <div className="relative min-w-[240px]">
               <input 
                 type="text" 
                 placeholder={t('filters.searchPlaceholder')} 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-start bg-white text-gray-900"
               />
               <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-gray-400" size={16} />
            </div>

            {/* Status Filter Dropdown */}
            <select 
               className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
               onChange={(e) => {
                 const val = e.target.value;
                 setStatusFilter(val ? [val] : []);
               }}
            >
               <option value="">{t('filters.status')}: {t('filters.all')}</option>
               {STATUSES.map(s => (
                 <option key={s} value={s}>
                   {t(`status.${s.replace(/ /g, '').replace(/^./, str => str.toLowerCase())}` as any)}
                 </option>
               ))}
            </select>

            {/* Dept Filter Dropdown */}
            <select 
               className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
               onChange={(e) => {
                 const val = e.target.value;
                 setDeptFilter(val ? [val] : []);
               }}
            >
               <option value="">{t('filters.department')}: {t('filters.all')}</option>
               {DEPARTMENTS.map(d => (
                 <option key={d} value={d}>
                   {t(`enums.departments.${d}` as any)}
                 </option>
               ))}
            </select>
            
            {/* Manager Filter Placeholder */}
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900">
               <option value="">{t('filters.manager')}: {t('filters.all')}</option>
               {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>

         </div>
         
         <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-max">
            {(statusFilter.length > 0 || deptFilter.length > 0 || searchTerm) && (
              <button 
                onClick={() => {
                  setStatusFilter([]);
                  setDeptFilter([]);
                  setSearchTerm('');
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium px-2"
              >
                {t('filters.clear')}
              </button>
            )}
            <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 bg-white">
               <Filter size={18} />
            </button>
         </div>
      </div>

      {/* 3. Bulk Actions (Conditional) */}
      {selectedProjects.length > 0 && (
        <div className="bg-slate-900 text-white rounded-lg p-3 flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
           <div className="flex items-center px-2">
             <span className="font-semibold text-sm">{selectedProjects.length} {t('common.selected')}</span>
           </div>
           <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button className="flex items-center px-3 py-1.5 hover:bg-slate-700 rounded text-sm transition-colors">
                <Download size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('actions.bulkExport')}
              </button>
              <button className="flex items-center px-3 py-1.5 hover:bg-slate-700 rounded text-sm transition-colors">
                <Edit size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('actions.bulkStatus')}
              </button>
              <button className="flex items-center px-3 py-1.5 hover:bg-slate-700 rounded text-sm transition-colors">
                <UserPlus size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('actions.bulkAssign')}
              </button>
           </div>
        </div>
      )}

      {/* 4. Projects Content (List or Card) */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-start">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-start w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                      checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.name')} / {t('table.id')}</th>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.client')}</th>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t('table.departments')}</th>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">{t('table.dates')}</th>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.progress')}</th>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.authority')}</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('table.actions')}</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr 
                    key={project.id} 
                    className={`hover:bg-gray-50 transition-colors ${selectedProjects.includes(project.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                       <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => toggleSelectProject(project.id)}
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                        <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                          {project.name.substring(0,2).toUpperCase()}
                        </div>
                        <div className="ms-4">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{project.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{project.client.name}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getStatusColor(project.status)}`}>
                        {t(`status.${project.status.replace(/ /g, '').replace(/^./, str => str.toLowerCase())}` as any) || project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                         {project.departments.map((d, i) => (
                           <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600 border border-gray-200">
                             {t(`enums.departments.${d}` as any)}
                           </span>
                         )).slice(0, 2)}
                         {project.departments.length > 2 && <span className="text-xs text-gray-400">+{project.departments.length - 2}</span>}
                      </div>
                      <div className="flex items-center mt-2">
                         <img src={project.manager.avatar} className="w-5 h-5 rounded-full mr-2 rtl:ml-2 rtl:mr-0" alt="" />
                         <span className="text-xs text-gray-500">{project.manager.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-xs text-gray-500 flex flex-col">
                        <span className="flex items-center"><Calendar size={12} className="mr-1 rtl:ml-1 rtl:mr-0" /> {project.startDate}</span>
                        <span className="flex items-center mt-1"><ArrowRight size={12} className="mr-1 rtl:ml-1 rtl:mr-0 rtl:rotate-180" /> {project.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex justify-between w-full max-w-[100px]">
                         <span>{project.progress}%</span>
                         <span>{project.tasksCompleted}/{project.tasksTotal}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className={`h-3 w-3 rounded-full ${getAuthorityColor(project.authorityStatus)} mr-2 rtl:ml-2 rtl:mr-0 shadow-sm`} />
                            <span className="text-xs text-gray-600 font-medium">
                                {project.authorityStatus === 'Green' ? t('enums.authStatus.Approved') : project.authorityStatus === 'Yellow' ? t('enums.authStatus.Pending') : t('dashboard.overdue')}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
             <span className="text-sm text-gray-700">{t('common.showing')} <span className="font-medium">{filteredProjects.length}</span> {t('common.results')}</span>
             <div className="flex space-x-2 rtl:space-x-reverse">
               <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white disabled:opacity-50 hover:bg-gray-50 flex items-center">
                 {language === 'ar' ? <ArrowRight size={14} className="ml-1" /> : <ArrowLeft size={14} className="mr-1" />}
                 {t('common.previous')}
               </button>
               <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 flex items-center">
                 {t('common.next')}
                 {language === 'ar' ? <ArrowLeft size={14} className="mr-1" /> : <ArrowRight size={14} className="ml-1" />}
               </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredProjects.map(project => (
             <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-5 flex flex-col relative group">
                <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical size={18} className="text-gray-400" />
                    </button>
                </div>
                
                <div className="flex items-start mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-700 font-bold text-lg border border-slate-300">
                        {project.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="ms-4">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{project.name}</h3>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{project.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('table.client')}</p>
                      <p className="text-xs font-medium text-gray-800 truncate" title={project.client.name}>{project.client.name}</p>
                   </div>
                   <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('table.manager')}</p>
                      <div className="flex items-center">
                          <img src={project.manager.avatar} className="w-4 h-4 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0" alt=""/>
                          <p className="text-xs font-medium text-gray-800 truncate">{project.manager.name.split(' ')[0]}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-3 flex-1">
                   <div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{t('table.progress')}</span>
                          <span className="font-bold text-gray-900">{project.progress}%</span>
                       </div>
                       <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${project.progress}%` }}></div>
                       </div>
                   </div>
                   
                   <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                       <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                          {t(`status.${project.status.replace(/ /g, '').replace(/^./, str => str.toLowerCase())}` as any) || project.status}
                       </span>
                       <div className="flex items-center space-x-2 rtl:space-x-reverse">
                           <div className="flex items-center text-xs text-gray-500" title="Tasks">
                               <CheckSquare size={14} className="mr-1 rtl:ml-1 rtl:mr-0" />
                               {project.tasksCompleted}/{project.tasksTotal}
                           </div>
                           <div className="flex items-center text-xs text-gray-500" title="Authority Status">
                               <FileCheck size={14} className={`mr-1 rtl:ml-1 rtl:mr-0 ${project.authorityStatus === 'Green' ? 'text-green-500' : project.authorityStatus === 'Red' ? 'text-red-500' : 'text-amber-500'}`} />
                           </div>
                       </div>
                   </div>
                </div>

                <button 
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="mt-4 w-full py-2 border border-gray-200 hover:border-blue-300 hover:text-blue-600 rounded-lg text-sm font-medium text-gray-600 transition-colors"
                >
                  {t('actions.view')}
                </button>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};