import React, { useState } from 'react';
import { MOCK_PROJECTS, CURRENT_USER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { LayoutList, LayoutGrid, Calendar, Filter, Search, CheckCircle, Clock, AlertTriangle, Briefcase } from 'lucide-react';
import { TaskListView } from './my-tasks/TaskListView';
import { TaskBoardView } from './my-tasks/TaskBoardView';
import { TaskCalendarView } from './my-tasks/TaskCalendarView';

export const MyTasks: React.FC = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Aggregate Tasks assigned to current user
  const myTasks = MOCK_PROJECTS.flatMap(project => 
    project.phases.flatMap(phase => 
      phase.tasks
        .filter(task => task.assignee?.id === CURRENT_USER.id)
        .map(task => ({
          ...task,
          project: project, // Attach project reference for context
          phaseName: phase.name
        }))
    )
  );

  // 2. Filter Tasks
  const filteredTasks = myTasks.filter(task => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.project.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 3. Calculate Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const stats = {
    total: myTasks.length,
    completedToday: myTasks.filter(t => t.status === 'Completed' /* && t.completedAt === today */).length, // simplified
    dueToday: myTasks.filter(t => t.dueDate === todayStr && t.status !== 'Completed').length,
    overdue: myTasks.filter(t => t.dueDate < todayStr && t.status !== 'Completed').length,
    blocked: myTasks.filter(t => t.status === 'Blocked').length,
  };

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">{t('myTasks.title')}</h1>
             <p className="text-gray-500 text-sm mt-1">{t('myTasks.totalTasks')}: {stats.total}</p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
             <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><LayoutList size={18}/></button>
             <button onClick={() => setViewMode('board')} className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><LayoutGrid size={18}/></button>
             <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><Calendar size={18}/></button>
          </div>
       </div>

       {/* Quick Stats Row */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4 rtl:ml-4 rtl:mr-0">
                <Clock size={20} />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase">{t('myTasks.stats.dueToday')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dueToday}</p>
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
             <div className="p-3 bg-red-50 text-red-600 rounded-lg mr-4 rtl:ml-4 rtl:mr-0">
                <AlertTriangle size={20} />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase">{t('myTasks.stats.overdue')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
             <div className="p-3 bg-amber-50 text-amber-600 rounded-lg mr-4 rtl:ml-4 rtl:mr-0">
                <Briefcase size={20} />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase">{t('myTasks.stats.blocked')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.blocked}</p>
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
             <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4 rtl:ml-4 rtl:mr-0">
                <CheckCircle size={20} />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase">{t('myTasks.completedToday')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
             </div>
          </div>
       </div>

       {/* Filters */}
       <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 w-full gap-3">
             <div className="relative flex-1">
                <input 
                   type="text" 
                   placeholder={t('myTasks.filters.search')}
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
                <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-gray-400" size={16} />
             </div>
             <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
             >
                <option value="All">All Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
             </select>
             <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 hidden sm:block">
                <option value="">Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
             </select>
          </div>
          <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 bg-white">
             <Filter size={18} />
          </button>
       </div>

       {/* Content */}
       <div className="min-h-[400px]">
          {viewMode === 'list' && <TaskListView tasks={filteredTasks} />}
          {viewMode === 'board' && <TaskBoardView tasks={filteredTasks} />}
          {viewMode === 'calendar' && <TaskCalendarView tasks={filteredTasks} />}
       </div>
    </div>
  );
};