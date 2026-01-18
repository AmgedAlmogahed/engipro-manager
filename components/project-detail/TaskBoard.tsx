import React from 'react';
import { Task } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Clock, Flag, AlertCircle, MoreVertical } from 'lucide-react';

interface Props {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Task['status']) => void;
  onTaskClick: (task: Task) => void;
}

export const TaskBoard: React.FC<Props> = ({ tasks, onTaskMove, onTaskClick }) => {
  const { t } = useLanguage();

  const columns: { id: Task['status']; label: string; color: string }[] = [
    { id: 'Not Started', label: t('status.notStarted'), color: 'bg-gray-100 border-gray-200' },
    { id: 'In Progress', label: t('status.inProgress'), color: 'bg-blue-50 border-blue-200' },
    { id: 'Blocked', label: t('status.onHold'), color: 'bg-red-50 border-red-200' }, // Mapping Blocked to OnHold visually or text-wise
    { id: 'Completed', label: t('status.completed'), color: 'bg-green-50 border-green-200' }
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskMove(taskId, status);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)] min-h-[500px]">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div 
            key={col.id} 
            className="flex-shrink-0 w-80 flex flex-col h-full rounded-xl bg-gray-50 border border-gray-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
             <div className={`p-3 font-bold text-sm text-gray-700 border-b flex justify-between items-center ${col.color} rounded-t-xl`}>
                <span>{col.label}</span>
                <span className="bg-white/50 px-2 py-0.5 rounded text-xs">{colTasks.length}</span>
             </div>
             
             <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {colTasks.map(task => (
                   <div 
                      key={task.id} 
                      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onTaskClick(task)}
                   >
                      <div className="flex justify-between items-start mb-2">
                         {task.priority && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getPriorityColor(task.priority)}`}>
                               {task.priority}
                            </span>
                         )}
                         <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 p-1">
                            <MoreVertical size={14} />
                         </button>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 text-sm mb-2 leading-snug">{task.name}</h4>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                         <div className="flex items-center">
                            {task.assignee ? (
                               <img src={task.assignee.avatar} className="w-6 h-6 rounded-full border border-gray-200" title={task.assignee.name} alt="" />
                            ) : (
                               <div className="w-6 h-6 rounded-full bg-gray-100 border border-dashed border-gray-300" title="Unassigned"></div>
                            )}
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
                   <div className="text-center py-8 text-gray-400 text-xs italic">
                      Drag tasks here
                   </div>
                )}
             </div>
          </div>
        );
      })}
    </div>
  );
};