import React from 'react';
import { Task, Project } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { AlertCircle, CheckCircle, Clock, MoreVertical, Flag } from 'lucide-react';

interface Props {
  tasks: (Task & { project: Project; phaseName: string })[];
}

export const TaskBoardView: React.FC<Props> = ({ tasks }) => {
  const { t } = useLanguage();

  const columns = [
    { id: 'Not Started', label: 'Not Started', color: 'bg-gray-100 border-gray-200' },
    { id: 'In Progress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
    { id: 'Blocked', label: 'Blocked', color: 'bg-red-50 border-red-200' },
    { id: 'Completed', label: 'Completed', color: 'bg-green-50 border-green-200' }
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)] min-h-[500px]">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col h-full rounded-xl bg-gray-50 border border-gray-200">
             <div className={`p-3 font-bold text-sm text-gray-700 border-b flex justify-between items-center ${col.color} rounded-t-xl`}>
                <span>{col.label}</span>
                <span className="bg-white/50 px-2 py-0.5 rounded text-xs">{colTasks.length}</span>
             </div>
             
             <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {colTasks.map(task => (
                   <div key={task.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                            {task.project.name}
                         </span>
                         <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100">
                            <MoreVertical size={14} />
                         </button>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 text-sm mb-2">{task.name}</h4>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                         <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            {task.priority === 'High' && <Flag size={14} className="text-red-500" />}
                            {task.status === 'Blocked' && <AlertCircle size={14} className="text-red-500" />}
                         </div>
                         {task.dueDate && (
                            <div className={`text-xs flex items-center ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-red-600' : 'text-gray-500'}`}>
                               <Clock size={12} className="mr-1 rtl:ml-1 rtl:mr-0" />
                               {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                         )}
                      </div>
                   </div>
                ))}
                {colTasks.length === 0 && (
                   <div className="text-center py-8 text-gray-400 text-xs italic">Empty</div>
                )}
             </div>
          </div>
        );
      })}
    </div>
  );
};