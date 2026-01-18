import React, { useState } from 'react';
import { MOCK_AUTHORITY_APPS, MOCK_PROJECTS } from '../constants';
import { AuthorityApplication, AuthorityStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { FileText, Plus, Search, Filter, Calendar, LayoutList, LayoutGrid, CheckCircle, Clock, AlertCircle, ExternalLink, MoreVertical, X, UploadCloud, ChevronRight, File } from 'lucide-react';

export const AuthorityTracking: React.FC = () => {
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedApp, setSelectedApp] = useState<AuthorityApplication | null>(null);

  // Filters
  const filteredApps = MOCK_AUTHORITY_APPS.filter(app => {
    const matchesSearch = 
      app.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.authority.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats Calculation
  const stats = {
    total: MOCK_AUTHORITY_APPS.length,
    pending: MOCK_AUTHORITY_APPS.filter(a => a.status === 'Pending').length,
    approved: MOCK_AUTHORITY_APPS.filter(a => a.status === 'Approved').length,
    rejected: MOCK_AUTHORITY_APPS.filter(a => a.status === 'Rejected' || a.status === 'Info Required').length,
    avgTime: Math.round(MOCK_AUTHORITY_APPS.reduce((acc, curr) => acc + curr.daysWaiting, 0) / Math.max(1, MOCK_AUTHORITY_APPS.length))
  };

  const getStatusBadge = (status: AuthorityStatus) => {
    switch(status) {
      case 'Approved': return <span className="flex items-center text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full text-xs font-bold"><CheckCircle size={12} className="mr-1 rtl:ml-1 rtl:mr-0"/> {t('enums.authStatus.Approved')}</span>;
      case 'Pending': return <span className="flex items-center text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full text-xs font-bold"><Clock size={12} className="mr-1 rtl:ml-1 rtl:mr-0"/> {t('enums.authStatus.Pending')}</span>;
      case 'Info Required': 
      case 'Rejected': return <span className="flex items-center text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full text-xs font-bold"><AlertCircle size={12} className="mr-1 rtl:ml-1 rtl:mr-0"/> {t('enums.authStatus.Rejected')}</span>;
      default: return <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
       {/* Module Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('authority.title')}</h1>
            <p className="text-gray-500 mt-1">{t('projects')}: {stats.total} {t('authority.stats.total')}</p>
         </div>
         <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
               <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><LayoutList size={18}/></button>
               <button onClick={() => setViewMode('timeline')} className={`p-1.5 rounded-md ${viewMode === 'timeline' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><Calendar size={18}/></button>
            </div>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 shadow-sm flex items-center">
               <Plus size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('authority.newApp')}
            </button>
         </div>
       </div>

       {/* Statistics Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <p className="text-gray-500 text-xs uppercase font-bold">{t('authority.stats.total')}</p>
             <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <p className="text-gray-500 text-xs uppercase font-bold">{t('authority.stats.pending')}</p>
             <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <p className="text-gray-500 text-xs uppercase font-bold">{t('authority.stats.rejected')}</p>
             <p className="text-2xl font-bold text-amber-500 mt-1">{stats.rejected}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <p className="text-gray-500 text-xs uppercase font-bold">{t('authority.stats.avgTime')}</p>
             <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgTime} Days</p>
          </div>
       </div>

       {/* Filters Bar */}
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col md:flex-row gap-3 flex-1 w-full">
             <div className="relative flex-1">
                <input 
                   type="text" 
                   placeholder={t('authority.filters.search')}
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                />
                <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-gray-400" size={16} />
             </div>
             <select 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
             >
                <option value="All">{t('authority.filters.allStatuses')}</option>
                <option value="Pending">{t('enums.authStatus.Pending')}</option>
                <option value="Approved">{t('enums.authStatus.Approved')}</option>
                <option value="Info Required">{t('enums.authStatus.Info Required')}</option>
                <option value="Rejected">{t('enums.authStatus.Rejected')}</option>
             </select>
             <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900">
                <option value="">{t('authority.filters.allAuthorities')}</option>
                <option>Municipality</option>
                <option>Civil Defense</option>
                <option>Electricity</option>
             </select>
          </div>
          <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 bg-white">
             <Filter size={18} />
          </button>
       </div>

       {/* Applications Content */}
       {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('authority.table.trackingId')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('authority.table.authority')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('authority.table.project')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('authority.table.submission')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('authority.table.status')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('authority.table.lastUpdate')}</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedApp(app)}>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-blue-600 font-medium">{app.trackingId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm font-medium text-gray-900">{app.authority}</div>
                           <div className="text-xs text-gray-500">{app.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900 max-w-[200px] truncate">{app.projectName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {app.submissionDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           {getStatusBadge(app.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {app.lastUpdate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <button className="text-gray-400 hover:text-gray-600">
                             <MoreVertical size={18} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
       ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <h3 className="text-lg font-bold text-gray-900 mb-6">{t('authority.timeline')}</h3>
             <div className="relative border-l-2 border-gray-200 ml-3 rtl:mr-3 rtl:ml-0 space-y-8">
                {filteredApps.sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()).map(app => (
                   <div key={app.id} className="relative pl-8 rtl:pr-8 rtl:pl-0 cursor-pointer group" onClick={() => setSelectedApp(app)}>
                      <div className={`absolute -left-2.5 rtl:-right-2.5 rtl:left-auto top-0 w-5 h-5 rounded-full border-2 bg-white ${app.status === 'Approved' ? 'border-green-500' : 'border-blue-500'}`}></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                         <div>
                            <span className="text-xs text-gray-500 font-mono">{app.submissionDate}</span>
                            <h4 className="font-bold text-gray-900 text-sm mt-1">{app.authority} - {app.type}</h4>
                            <p className="text-xs text-gray-600">{app.projectName}</p>
                         </div>
                         <div className="mt-2 sm:mt-0 flex items-center">
                            {getStatusBadge(app.status)}
                            <ChevronRight size={16} className="ml-2 rtl:mr-2 rtl:ml-0 text-gray-400 group-hover:text-blue-500" />
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       )}

       {/* Application Detail Modal */}
       {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                   <div>
                      <h2 className="text-xl font-bold text-gray-900">{t('authority.modal.title')}</h2>
                      <p className="text-sm text-gray-500 font-mono">{selectedApp.trackingId}</p>
                   </div>
                   <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <X size={20} />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                   {/* Info Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('authority.modal.info')}</h3>
                         <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-100">
                               <span className="text-gray-600">{t('authority.table.authority')}</span>
                               <span className="font-medium">{selectedApp.authority}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                               <span className="text-gray-600">{t('authority.table.type')}</span>
                               <span className="font-medium">{selectedApp.type}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                               <span className="text-gray-600">{t('authority.table.submission')}</span>
                               <span className="font-medium">{selectedApp.submissionDate}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                               <span className="text-gray-600">{t('authority.modal.expected')}</span>
                               <span className="font-medium">{selectedApp.expectedResponseDate || '-'}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div>
                         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('authority.modal.linkedTask')}</h3>
                         <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">{t('authority.table.project')}</p>
                            <p className="font-medium text-gray-900 mb-3">{selectedApp.projectName}</p>
                            
                            {selectedApp.linkedTaskName && (
                               <>
                                  <p className="text-xs text-blue-600 font-bold uppercase mb-1">Task</p>
                                  <div className="flex items-center text-sm font-medium text-gray-800">
                                     <CheckCircle size={14} className="mr-2 rtl:ml-2 rtl:mr-0 text-blue-500" />
                                     {selectedApp.linkedTaskName}
                                  </div>
                               </>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* Documents */}
                   <div className="mb-8">
                      <div className="flex justify-between items-center mb-3">
                         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('authority.modal.docs')}</h3>
                         <button className="text-xs text-blue-600 font-medium flex items-center hover:underline">
                            <UploadCloud size={14} className="mr-1 rtl:ml-1 rtl:mr-0" /> {t('authority.modal.uploadNew')}
                         </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {selectedApp.documents.map(doc => (
                            <div key={doc.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                               <FileText size={20} className="text-gray-400 group-hover:text-blue-500 mr-3 rtl:ml-3 rtl:mr-0" />
                               <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                  <p className="text-xs text-gray-500">{doc.type} • {doc.date}</p>
                               </div>
                               <ExternalLink size={14} className="text-gray-400 group-hover:text-gray-600" />
                            </div>
                         ))}
                         {selectedApp.documents.length === 0 && <p className="text-sm text-gray-400 italic">{t('authority.modal.noDocs')}</p>}
                      </div>
                   </div>

                   {/* History Timeline */}
                   <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('authority.modal.history')}</h3>
                      <div className="relative border-l-2 border-gray-200 ml-3 rtl:mr-3 rtl:ml-0 space-y-6">
                         {selectedApp.history.map((item, idx) => (
                            <div key={idx} className="relative pl-6 rtl:pr-6 rtl:pl-0">
                               <div className={`absolute -left-1.5 rtl:-right-1.5 rtl:left-auto top-1.5 w-3 h-3 rounded-full border-2 bg-white ${item.status === 'Approved' ? 'border-green-500 bg-green-500' : 'border-gray-400'}`}></div>
                               <div>
                                  <div className="flex items-center mb-1">
                                     <span className="text-sm font-bold text-gray-900 mr-2 rtl:ml-2 rtl:mr-0">{item.status}</span>
                                     <span className="text-xs text-gray-500">{item.date}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{item.note}</p>
                                  <p className="text-xs text-gray-400 mt-1">{t('authority.modal.by')} {item.user}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 rtl:space-x-reverse">
                   <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">{t('authority.modal.requestInfo')}</button>
                   <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">{t('authority.modal.updateStatus')}</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};