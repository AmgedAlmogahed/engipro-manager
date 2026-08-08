import React, { useState, useMemo } from 'react';
import { ProjectWizardState, Task, Department } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { MOCK_USERS } from '../../constants';
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Calendar, ArrowRight } from 'lucide-react';
import { calculateSchedule } from '../../utils/scheduler';

interface Props {
  data: ProjectWizardState;
  onChange: (data: Partial<ProjectWizardState>) => void;
}

const DEPARTMENTS: Department[] = ['Architecture', 'Civil', 'Safety', 'Surveying', 'Modern', 'Khitbrah'];

export const Step4Tasks: React.FC<Props> = ({ data, onChange }) => {
  const { t, language } = useLanguage();
  const [expandedPhases, setExpandedPhases] = useState<string[]>(data.phases.map(p => p.id));

  // Memoize the flat list of all previous tasks for dependency dropdown
  const allTasks = useMemo(() => {
     return data.phases.flatMap(p => p.tasks);
  }, [data.phases]);

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleAddTask = (phaseId: string) => {
    const newTask: Task = {
      id: `t_${Date.now()}`,
      name: 'New Task',
      phaseId: phaseId,
      status: 'Not Started',
      duration: 1,
      type: 'Internal',
      dependencies: [],
      dueDate: '', // Will be calculated
    };
    
    const updatedPhases = data.phases.map(p => {
       if (p.id === phaseId) {
          return { ...p, tasks: [...p.tasks, newTask] };
       }
       return p;
    });

    const scheduledPhases = calculateSchedule(data.startDate, updatedPhases);
    onChange({ phases: scheduledPhases });
  };

  const updateTask = (phaseId: string, taskId: string, field: keyof Task, value: any) => {
     const updatedPhases = data.phases.map(p => {
        if (p.id === phaseId) {
           return {
              ...p,
              tasks: p.tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t)
           };
        }
        return p;
     });
     const scheduledPhases = calculateSchedule(data.startDate, updatedPhases);
     onChange({ phases: scheduledPhases });
  };

  const removeTask = (phaseId: string, taskId: string) => {
    const updatedPhases = data.phases.map(p => {
       if (p.id === phaseId) {
          return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
       }
       return p;
    });
    const scheduledPhases = calculateSchedule(data.startDate, updatedPhases);
    onChange({ phases: scheduledPhases });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Left: Task List Accordion */}
      <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2">
         <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-900">{t('wizard.tasks.title')}</h3>
         </div>
         
         {data.phases.map((phase) => {
            const isExpanded = expandedPhases.includes(phase.id);
            const phaseDuration = phase.tasks.reduce((acc, t) => acc + (t.duration || 0), 0); // Rough approximation
            
            return (
               <div key={phase.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                  <div 
                     className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                     onClick={() => togglePhase(phase.id)}
                  >
                     <div className="flex items-center">
                        {isExpanded ? <ChevronDown size={18} className="text-gray-500 mr-2 rtl:ml-2 rtl:mr-0" /> : <ChevronRight size={18} className="text-gray-500 mr-2 rtl:ml-2 rtl:mr-0" />}
                        <span className="font-semibold text-gray-800">{phase.name}</span>
                        <span className="ml-3 rtl:mr-3 rtl:ml-0 text-xs bg-white border px-2 py-0.5 rounded-full text-gray-500">
                           {phase.tasks.length} {t('detail.stats.tasks')}
                        </span>
                     </div>
                     <span className="text-xs text-gray-400">~{phaseDuration} {t('wizard.tasks.duration')}</span>
                  </div>

                  {isExpanded && (
                     <div className="p-4 space-y-4 bg-white">
                        {phase.tasks.length === 0 && (
                           <p className="text-sm text-gray-400 italic text-center py-2">{t('wizard.tasks.noTasks')}</p>
                        )}
                        
                        {phase.tasks.map((task) => (
                           <div key={task.id} className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow bg-gray-50/50">
                              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-3">
                                 <GripVertical size={16} className="text-gray-300 hidden md:block cursor-move" />
                                 <div className="flex-1 w-full">
                                    <input 
                                       value={task.name}
                                       onChange={(e) => updateTask(phase.id, task.id, 'name', e.target.value)}
                                       className="w-full font-medium text-gray-900 border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                                       placeholder="Task Name"
                                    />
                                 </div>
                                 <div className="w-24">
                                    <input 
                                       type="number"
                                       min="1"
                                       value={task.duration}
                                       onChange={(e) => updateTask(phase.id, task.id, 'duration', parseInt(e.target.value) || 1)}
                                       className="w-full text-sm border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
                                       placeholder="Days"
                                       title="Duration in Days"
                                    />
                                 </div>
                                 <div className="w-32">
                                    <select
                                       value={task.department || ''}
                                       onChange={(e) => updateTask(phase.id, task.id, 'department', e.target.value)}
                                       className="w-full text-sm border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
                                    >
                                       <option value="">{t('wizard.tasks.dept')}...</option>
                                       {DEPARTMENTS.map(d => <option key={d} value={d}>{t(`enums.departments.${d}` as any)}</option>)}
                                    </select>
                                 </div>
                                 <button onClick={() => removeTask(phase.id, task.id)} className="text-gray-300 hover:text-red-500">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-0 md:pl-7">
                                 <div>
                                    <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">{t('wizard.tasks.type')}</label>
                                    <select
                                       value={task.type}
                                       onChange={(e) => updateTask(phase.id, task.id, 'type', e.target.value)}
                                       className="w-full text-xs border-gray-200 rounded bg-white text-gray-900 py-1"
                                    >
                                       <option value="Internal">{t('wizard.tasks.internal')}</option>
                                       <option value="External">{t('wizard.tasks.external')}</option>
                                    </select>
                                 </div>
                                 <div>
                                    <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">{t('wizard.tasks.deps')}</label>
                                    <select
                                       value={task.dependencies[0] || ''}
                                       onChange={(e) => {
                                          const val = e.target.value;
                                          updateTask(phase.id, task.id, 'dependencies', val ? [val] : []);
                                       }}
                                       className="w-full text-xs border-gray-200 rounded bg-white text-gray-900 py-1"
                                    >
                                       <option value="">None</option>
                                       {allTasks.filter(t => t.id !== task.id).map(t => (
                                          <option key={t.id} value={t.id}>{t.name}</option>
                                       ))}
                                    </select>
                                 </div>
                                 <div>
                                    <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">{t('wizard.tasks.assignee')}</label>
                                    <select
                                       value={task.assigneeId || ''}
                                       onChange={(e) => updateTask(phase.id, task.id, 'assigneeId', e.target.value)}
                                       className="w-full text-xs border-gray-200 rounded bg-white text-gray-900 py-1"
                                    >
                                       <option value="">{t('wizard.tasks.unassigned')}</option>
                                       {MOCK_USERS.map(u => (
                                          <option key={u.id} value={u.id}>{u.name}</option>
                                       ))}
                                    </select>
                                 </div>
                              </div>
                           </div>
                        ))}

                        <button 
                           onClick={() => handleAddTask(phase.id)}
                           className="w-full py-2 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center transition-colors bg-white"
                        >
                           <Plus size={14} className="mr-1 rtl:ml-1 rtl:mr-0" /> {t('wizard.buttons.addTask')}
                        </button>
                     </div>
                  )}
               </div>
            );
         })}
      </div>

      {/* Right: Gantt Preview */}
      <div className="w-full lg:w-1/3 bg-slate-900 rounded-xl p-5 text-white flex flex-col shadow-lg">
         <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center border-b border-gray-700 pb-2">
            <Calendar size={16} className="mr-2 rtl:ml-2 rtl:mr-0"/> {t('wizard.tasks.gantt')}
         </h3>
         
         <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
            {data.phases.map((phase) => (
               <div key={phase.id} className="space-y-2">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{phase.name}</div>
                  {phase.tasks.map((task, i) => {
                     return (
                        <div key={task.id} className="relative group">
                           <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                              <span className="truncate max-w-[100px]">{task.name}</span>
                              <span>{task.duration}d</span>
                           </div>
                           <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                 className={`h-full rounded-full ${task.type === 'External' ? 'bg-amber-500' : 'bg-blue-500'}`}
                                 style={{ width: '100%' }} // Just full width for rows, simplistic
                              ></div>
                           </div>
                           <div className="text-[10px] text-gray-500 mt-0.5 flex items-center justify-end">
                              {task.startDate ? (
                                 <>
                                   <span className="opacity-75">{new Date(task.startDate).toLocaleDateString(language, {month:'short', day:'numeric'})}</span>
                                   <ArrowRight size={8} className="mx-1" />
                                   <span>{new Date(task.dueDate).toLocaleDateString(language, {month:'short', day:'numeric'})}</span>
                                 </>
                              ) : <span className="italic text-gray-600">Set Date</span>}
                           </div>
                        </div>
                     );
                  })}
               </div>
            ))}
            
            {data.phases.flatMap(p => p.tasks).length === 0 && (
               <div className="text-center text-gray-600 text-sm py-10">
                  {t('wizard.tasks.addTasksPrompt')}
               </div>
            )}
         </div>

         <div className="mt-4 pt-4 border-t border-gray-700">
             <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-400">{t('wizard.tasks.totalTasks')}</span>
                 <span className="text-lg font-bold">{data.phases.reduce((acc, p) => acc + p.tasks.length, 0)}</span>
             </div>
             {data.phases.flatMap(p => p.tasks).length > 0 && (
                <div className="text-xs text-gray-500 mt-2 text-center">
                   {t('wizard.tasks.projectEnds')} {data.phases.flatMap(p => p.tasks).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0]?.dueDate}
                </div>
             )}
         </div>
      </div>
    </div>
  );
};