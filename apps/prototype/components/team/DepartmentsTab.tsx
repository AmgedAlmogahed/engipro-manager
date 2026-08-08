import React, { useState } from 'react';
import { MOCK_DEPARTMENTS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { Users, Briefcase, Plus, ChevronRight, LayoutGrid, LayoutList, Search, MoreVertical } from 'lucide-react';
import { CreateDepartmentModal } from './CreateDepartmentModal';
import { DepartmentDetails } from '../../types';

export const DepartmentsTab: React.FC = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [departments, setDepartments] = useState<DepartmentDetails[]>(MOCK_DEPARTMENTS);

  const filteredDepartments = departments.filter(dept => 
    t(`enums.departments.${dept.name}` as any).toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.headOfDepartment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDepartment = (newDept: DepartmentDetails) => {
    setDepartments([...departments, newDept]);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
       {/* Controls Bar */}
       <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative flex-1 w-full md:max-w-md">
             <input 
                type="text" 
                placeholder={t('team.departments.search')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
             />
             <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-gray-400" size={16} />
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                   title={t('common.grid')}
                >
                   <LayoutGrid size={18} />
                </button>
                <button 
                   onClick={() => setViewMode('list')}
                   className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                   title={t('common.list')}
                >
                   <LayoutList size={18} />
                </button>
             </div>
          </div>
       </div>

       {/* Grid View */}
       {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Add Department Card */}
             <button 
                onClick={() => setIsCreateOpen(true)}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all group min-h-[200px]"
             >
                <div className="bg-gray-100 rounded-full p-4 mb-4 group-hover:bg-blue-100 transition-colors">
                   <Plus size={24} className="text-gray-400 group-hover:text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-600 group-hover:text-blue-700">{t('team.addDepartment')}</h3>
             </button>

             {filteredDepartments.map(dept => (
                <div key={dept.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <h3 className="text-lg font-bold text-gray-900">{t(`enums.departments.${dept.name}` as any)}</h3>
                         <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                            {dept.id}
                         </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-6 min-h-[40px] line-clamp-2">{dept.description}</p>
                      
                      <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-lg">
                         <img src={dept.headOfDepartment.avatar} className="w-10 h-10 rounded-full mr-3 rtl:ml-3 rtl:mr-0" alt=""/>
                         <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">{t('team.departments.head')}</p>
                            <p className="text-sm font-medium text-gray-900">{dept.headOfDepartment.name}</p>
                         </div>
                      </div>

                      <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                         <div className="flex items-center text-gray-600">
                            <Users size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                            <span>{dept.employeeCount} {t('team.departments.members')}</span>
                         </div>
                         <div className="flex items-center text-gray-600">
                            <Briefcase size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                            <span>{dept.activeProjectCount} {t('team.departments.projects')}</span>
                         </div>
                      </div>
                   </div>
                   <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center group-hover:bg-blue-50 transition-colors">
                      <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600">{t('team.departments.viewDetails')}</span>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 rtl:rotate-180" />
                   </div>
                </div>
             ))}
          </div>
       )}

       {/* List View */}
       {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex justify-end bg-gray-50">
               <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
               >
                  <Plus size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('team.addDepartment')}
               </button>
             </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                      <tr>
                         <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('team.departments.name')}</th>
                         <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('team.departments.head')}</th>
                         <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('team.departments.members')}</th>
                         <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('team.departments.projects')}</th>
                         <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('team.departments.description')}</th>
                         <th className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.actions')}</th>
                      </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDepartments.map(dept => (
                         <tr key={dept.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="font-medium text-gray-900">{t(`enums.departments.${dept.name}` as any)}</div>
                               <div className="text-xs text-gray-500 font-mono">{dept.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="flex items-center">
                                  <img src={dept.headOfDepartment.avatar} className="w-8 h-8 rounded-full mr-2 rtl:ml-2 rtl:mr-0" alt="" />
                                  <span className="text-sm text-gray-900">{dept.headOfDepartment.name}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                               <div className="flex items-center">
                                  <Users size={14} className="mr-1.5 rtl:ml-1.5 rtl:mr-0 text-gray-400" />
                                  {dept.employeeCount}
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                               <div className="flex items-center">
                                  <Briefcase size={14} className="mr-1.5 rtl:ml-1.5 rtl:mr-0 text-gray-400" />
                                  {dept.activeProjectCount}
                               </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell max-w-xs truncate" title={dept.description}>
                               {dept.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                               <button className="text-gray-400 hover:text-gray-600 p-1">
                                  <MoreVertical size={18} />
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       )}

       {isCreateOpen && (
          <CreateDepartmentModal onClose={() => setIsCreateOpen(false)} onSave={handleCreateDepartment} />
       )}
    </div>
  );
};