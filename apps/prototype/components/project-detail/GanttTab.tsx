import React from 'react';
import { Project } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Calendar, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface Props {
  project: Project;
}

export const GanttTab: React.FC<Props> = ({ project }) => {
  const { t } = useLanguage();

  // Simplistic visual rendering logic for the Gantt Chart
  // In a real app, this would use dates to calculate precise offsets
  const allTasks = project.phases.flatMap(p => p.tasks);
  
  // Calculate relative start/end for demo purposes
  // Assume project duration is 100 units
  // We need real dates parsing
  const start = new Date(project.startDate).getTime();
  const end = new Date(project.endDate).getTime();
  const totalDuration = end - start;

  const getPosition = (dateStr: string) => {
    if (!dateStr) return 0;
    const current = new Date(dateStr).getTime();
    const pos = ((current - start) / totalDuration) * 100;
    return Math.max(0, Math.min(100, pos));
  };

  const getWidth = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 5; // Default width
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    const width = ((e - s) / totalDuration) * 100;
    return Math.max(1, width); // Min 1% width
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-[600px] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
         <h3 className="font-bold text-gray-900 flex items-center">
            <Calendar size={18} className="mr-2 rtl:ml-2 rtl:mr-0 text-blue-600" />
            {t('detail.gantt.timeline')}
         </h3>
         <div className="flex space-x-2 rtl:space-x-reverse">
            <button className="p-2 border bg-white rounded hover:bg-gray-50"><ZoomIn size={16} /></button>
            <button className="p-2 border bg-white rounded hover:bg-gray-50"><ZoomOut size={16} /></button>
            <button className="p-2 border bg-white rounded hover:bg-gray-50"><Download size={16} /></button>
         </div>
      </div>

      {/* Gantt Body */}
      <div className="flex-1 flex overflow-hidden">
         {/* Left Panel: Task List */}
         <div className="w-64 border-r border-gray-200 overflow-y-auto flex-shrink-0 bg-white">
            <div className="h-10 border-b border-gray-100 flex items-center px-4 bg-gray-50 font-semibold text-xs text-gray-500 uppercase">
               {t('detail.gantt.taskName')}
            </div>
            {project.phases.map(phase => (
               <div key={phase.id}>
                  <div className="px-4 py-2 bg-gray-50 font-bold text-xs text-gray-700 truncate" title={phase.name}>{phase.name}</div>
                  {phase.tasks.map(task => (
                     <div key={task.id} className="px-4 py-2 text-sm text-gray-600 border-b border-gray-50 truncate hover:bg-blue-50 cursor-pointer" title={task.name}>
                        {task.name}
                     </div>
                  ))}
               </div>
            ))}
         </div>

         {/* Right Panel: Timeline */}
         <div className="flex-1 overflow-x-auto overflow-y-auto relative bg-slate-50">
             <div className="min-w-[800px] h-full relative">
                 {/* Timeline Header (Months) */}
                 <div className="h-10 border-b border-gray-200 bg-white sticky top-0 z-10 flex">
                    {Array.from({length: 12}).map((_, i) => (
                       <div key={i} className="flex-1 border-r border-gray-100 flex items-center justify-center text-xs font-medium text-gray-400">
                          M{i+1}
                       </div>
                    ))}
                 </div>
                 
                 {/* Grid Lines */}
                 <div className="absolute inset-0 top-10 pointer-events-none flex">
                    {Array.from({length: 12}).map((_, i) => (
                       <div key={i} className="flex-1 border-r border-gray-200 border-dashed h-full opacity-50"></div>
                    ))}
                 </div>

                 {/* Bars */}
                 <div className="pt-0">
                    {project.phases.map(phase => (
                       <div key={phase.id}>
                          {/* Phase Header Row Placeholder to align with Left Panel */}
                          <div className="h-[32px] w-full bg-gray-100/30 mb-px"></div>
                          
                          {phase.tasks.map(task => {
                             const left = getPosition(task.startDate || task.dueDate); // Fallback if no start date
                             const width = getWidth(task.startDate || task.dueDate, task.dueDate);
                             
                             return (
                                <div key={task.id} className="h-[37px] relative w-full hover:bg-blue-50/30 transition-colors border-b border-gray-100/50">
                                   <div 
                                      className={`absolute top-2 h-5 rounded-full shadow-sm text-[10px] text-white flex items-center px-2 whitespace-nowrap overflow-hidden ${task.status === 'Completed' ? 'bg-green-500' : task.type === 'External' ? 'bg-purple-500' : 'bg-blue-500'}`}
                                      style={{
                                         left: `${left}%`,
                                         width: `${width}%`
                                      }}
                                   >
                                      {task.duration}d
                                   </div>
                                </div>
                             )
                          })}
                       </div>
                    ))}
                 </div>

                 {/* Today Marker */}
                 <div className="absolute top-10 bottom-0 w-0.5 bg-red-500 z-20" style={{ left: `${getPosition(new Date().toISOString().split('T')[0])}%` }}>
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                 </div>
             </div>
         </div>
      </div>
      
      {/* Legend */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex space-x-6 rtl:space-x-reverse text-xs">
         <div className="flex items-center"><div className="w-3 h-3 rounded bg-blue-500 mr-2 rtl:ml-2 rtl:mr-0"></div> {t('detail.gantt.internal')}</div>
         <div className="flex items-center"><div className="w-3 h-3 rounded bg-purple-500 mr-2 rtl:ml-2 rtl:mr-0"></div> {t('detail.gantt.external')}</div>
         <div className="flex items-center"><div className="w-3 h-3 rounded bg-green-500 mr-2 rtl:ml-2 rtl:mr-0"></div> {t('detail.gantt.completed')}</div>
         <div className="flex items-center"><div className="w-0.5 h-3 bg-red-500 mr-2 rtl:ml-2 rtl:mr-0"></div> {t('detail.gantt.today')}</div>
      </div>
    </div>
  );
};