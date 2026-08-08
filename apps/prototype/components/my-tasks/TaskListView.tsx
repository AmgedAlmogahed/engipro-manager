import React from 'react';
import { Task, Project } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Clock, CheckSquare, AlertTriangle, ArrowRight, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  tasks: (Task & { project: Project; phaseName: string })[];
}

export const TaskListView: React.FC<Props> = ({ tasks }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const getDueDateStatus = (dueDate: string) => {
    if (!dueDate) return 'noDate';
    const d = new Date(dueDate);
    d.setHours(0, 0, 0, 0);
    
    if (d.getTime() < now.getTime()) return 'overdue';
    if (d.getTime() === now.getTime()) return 'today';
    
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    if (d.getTime() <= nextWeek.getTime()) return 'week';
    return 'later';
  };

  const groupedTasks = {
    overdue: tasks.filter(t => getDueDateStatus(t.dueDate) === 'overdue' && t.status !== 'Completed'),
    today: tasks.filter(t => getDueDateStatus(t.dueDate) === 'today' && t.status !== 'Completed'),
    week: tasks.filter(t => getDueDateStatus(t.dueDate) === 'week' && t.status !== 'Completed'),
    later: tasks.filter(t => getDueDateStatus(t.dueDate) === 'later' && t.status !== 'Completed'),
    noDate: tasks.filter(t => getDueDateStatus(t.dueDate) === 'noDate' && t.status !== 'Completed'),
    // Optionally we can show completed in a separate list or filter, for now omitting based on "workload" focus
  };

  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderSection = (title: string, taskList: typeof tasks, colorClass: string) => {
    if (taskList.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${colorClass} flex items-center`}>
          {title} <span className="ml-2 rtl:mr-2 rtl:ml-0 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{taskList.length}</span>
        </h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {taskList.map(task => (
            <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 group">
               <div className="flex items-start flex-1 gap-3">
                  <div className="mt-1">
                     <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5 border-gray-300 cursor-pointer" />
                  </div>
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{task.name}</span>
                        {task.status === 'Blocked' && (
                           <span className="flex items-center text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">
                              <AlertTriangle size={10} className="mr-1" /> Blocked
                           </span>
                        )}
                        {task.priority && (
                           <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)} font-medium`}>
                              {task.priority}
                           </span>
                        )}
                     </div>
                     <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                        <button onClick={() => navigate(`/projects/${task.project.id}`)} className="hover:text-blue-600 hover:underline font-medium text-gray-600">
                           {task.project.name}
                        </button>
                        <span className="text-gray-300">•</span>
                        <span>{task.phaseName}</span>
                        <span className="text-gray-300">•</span>
                        <span className={`px-1.5 py-0.5 rounded ${task.type === 'External' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                           {task.type}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-4 text-sm text-gray-500 pl-8 sm:pl-0">
                  <div className={`flex items-center ${task === groupedTasks.overdue[0] || task.dueDate < new Date().toISOString() ? 'text-red-600 font-medium' : ''}`}>
                     <Clock size={16} className="mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                     {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-full transition-opacity">
                     <ArrowRight size={18} className="text-gray-400" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">
      {renderSection(t('myTasks.sections.overdue'), groupedTasks.overdue, 'text-red-600')}
      {renderSection(t('myTasks.sections.today'), groupedTasks.today, 'text-green-600')}
      {renderSection(t('myTasks.sections.week'), groupedTasks.week, 'text-blue-600')}
      {renderSection(t('myTasks.sections.later'), groupedTasks.later, 'text-gray-600')}
      {renderSection(t('myTasks.sections.noDate'), groupedTasks.noDate, 'text-gray-400')}
      
      {tasks.length === 0 && (
         <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
            <CheckSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500">No tasks found matching your criteria.</p>
         </div>
      )}
    </div>
  );
};