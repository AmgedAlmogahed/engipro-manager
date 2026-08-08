import React, { useState } from 'react';
import { MOCK_EMPLOYEES } from '../../constants';
import { Employee } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, Filter, MoreVertical, Briefcase, CheckSquare, Mail, Phone, LayoutGrid, LayoutList, MoreHorizontal } from 'lucide-react';
import { CreateEmployeeModal } from './CreateEmployeeModal';
import { EmployeeDetailPanel } from './EmployeeDetailPanel';

export const EmployeesTab: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State for Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Local state for list to simulate addition
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || emp.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const handleCreateEmployee = (newEmployee: Employee) => {
    setEmployees([...employees, newEmployee]);
    setIsCreateOpen(false);
  };

  const getStatusColorClass = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'On Leave': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
         <div className="flex flex-1 w-full gap-3">
            <div className="relative flex-1">
               <input 
                  type="text" 
                  placeholder={t('team.employees.search')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
               />
               <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-gray-400" size={16} />
            </div>
            <select 
               value={filterDept}
               onChange={e => setFilterDept(e.target.value)}
               className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            >
               <option value="All">{t('team.employees.allDepts')}</option>
               <option value="Architecture">{t('enums.departments.Architecture')}</option>
               <option value="Civil">{t('enums.departments.Civil')}</option>
               <option value="Safety">{t('enums.departments.Safety')}</option>
               <option value="Surveying">{t('enums.departments.Surveying')}</option>
            </select>
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
            <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 bg-white">
               <Filter size={18} />
            </button>
         </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add Employee Card */}
            <button 
               onClick={() => setIsCreateOpen(true)}
               className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group h-full min-h-[250px] bg-white"
            >
               <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-4 transition-colors">
                  <PlusIcon size={32} className="text-gray-400 group-hover:text-blue-600" />
               </div>
               <span className="font-semibold text-gray-600 group-hover:text-blue-700">{t('team.addEmployee')}</span>
            </button>

            {filteredEmployees.map(employee => (
               <div 
                  key={employee.id} 
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow relative group cursor-pointer"
                  onClick={() => setSelectedEmployee(employee)}
               >
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={(e) => { e.stopPropagation(); }} className="text-gray-400 hover:text-gray-600 p-1"><MoreVertical size={18}/></button>
                  </div>
                  
                  <div className="flex flex-col items-center text-center mb-4">
                     <div className="relative">
                        <img src={employee.avatar} className="w-20 h-20 rounded-full border-4 border-gray-50 mb-3" alt="" />
                        <span className={`absolute bottom-3 right-0 w-4 h-4 rounded-full border-2 border-white ${employee.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                     </div>
                     <h3 className="font-bold text-gray-900 text-lg">{employee.name}</h3>
                     <p className="text-sm text-gray-500">{employee.role}</p>
                     <span className="mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">{t(`enums.departments.${employee.department}` as any)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center border-t border-b border-gray-100 py-3 mb-4">
                     <div>
                        <p className="text-xl font-bold text-gray-900">{employee.activeProjects}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">{t('team.employees.projects')}</p>
                     </div>
                     <div className="border-l border-gray-100 rtl:border-l-0 rtl:border-r">
                        <p className="text-xl font-bold text-gray-900">{employee.openTasks}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">{t('team.employees.tasks')}</p>
                     </div>
                  </div>

                  <div className="flex justify-center space-x-3 rtl:space-x-reverse">
                     <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" onClick={(e) => e.stopPropagation()}>
                        <Mail size={18} />
                     </button>
                     <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors" onClick={(e) => e.stopPropagation()}>
                        <Phone size={18} />
                     </button>
                     <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors" onClick={(e) => e.stopPropagation()}>
                        <CheckSquare size={18} />
                     </button>
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
                  <PlusIcon size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('team.addEmployee')}
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('team.employees.employee')}</th>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('team.form.department')}</th>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('team.employees.contact')}</th>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('team.workload.status')}</th>
                        <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('team.workload.utilization')}</th>
                        <th className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.actions')}</th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {filteredEmployees.map(employee => (
                        <tr 
                           key={employee.id} 
                           className="hover:bg-gray-50 cursor-pointer transition-colors"
                           onClick={() => setSelectedEmployee(employee)}
                        >
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                 <img src={employee.avatar} className="w-10 h-10 rounded-full mr-3 rtl:ml-3 rtl:mr-0" alt="" />
                                 <div>
                                    <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                                    <p className="text-xs text-gray-500">{employee.role}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                 {t(`enums.departments.${employee.department}` as any)}
                              </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex flex-col">
                                 <span className="flex items-center mb-1"><Mail size={12} className="mr-1 rtl:ml-1 rtl:mr-0"/> {employee.email}</span>
                                 <span className="flex items-center"><Phone size={12} className="mr-1 rtl:ml-1 rtl:mr-0"/> {employee.phone || 'N/A'}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(employee.status)}`}>
                                 {employee.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap align-middle">
                              <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                                 <div 
                                    className={`h-2 rounded-full ${employee.utilization > 100 ? 'bg-red-500' : 'bg-blue-600'}`} 
                                    style={{ width: `${Math.min(employee.utilization, 100)}%` }}
                                 ></div>
                              </div>
                              <span className="text-xs text-gray-500 mt-1 block">{employee.utilization}%</span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-gray-400 hover:text-gray-600 p-1">
                                 <MoreHorizontal size={18} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
         <CreateEmployeeModal onClose={() => setIsCreateOpen(false)} onSave={handleCreateEmployee} />
      )}

      {selectedEmployee && (
         <EmployeeDetailPanel employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}
    </div>
  );
};

const PlusIcon = ({ size, className }: { size: number, className: string }) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
   </svg>
);