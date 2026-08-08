
import React, { useState } from 'react';
import { Project, Task, Phase } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronDown, ChevronRight, CheckCircle, Clock, AlertCircle, Plus, Filter, X, Paperclip, MessageSquare, LayoutList, LayoutGrid, Link, Trash2 } from 'lucide-react';
import { MOCK_USERS } from '../../constants';
import { TaskBoard } from './TaskBoard';
import { CreateTaskModal } from './CreateTaskModal';

interface Props {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
}

export const TasksTab: React.FC<Props> = ({ project, onUpdate }) => {
  const { t } = useLanguage();
  const [expandedPhases, setExpandedPhases] = useState<string[]>(project.phases.map(p => p.id));
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const getStatusColor = (status: Task['status']) => {
     switch(status) {
        case 'Completed': return 'bg-green-100 text-green-700';
        case 'In Progress': return 'bg-blue-100 text-blue-700';
        case 'Blocked': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-600';
     }
  };

  // Helper to flatten tasks for board view and dependency checks
  const allTasks = project.phases.flatMap(p => p.tasks);

  // General task update handler
  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    const updatedPhases = project.phases.map(p => ({
      ...p,
      tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
    
    // In a real app, update backend here
    onUpdate({ ...project, phases: updatedPhases });
    
    // Update local selected task if it's the one moved
    if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  // Wrapper for Move/Status change for Board compatibility
  const handleTaskMove = (taskId: string, newStatus: Task['status']) => {
     handleTaskUpdate(taskId, { status: newStatus });
  };

  const handleCreateTask = (newTask: Task) => {
    const updatedPhases = project.phases.map(p => {
        if (p.id === newTask.phaseId) {
            return { ...p, tasks: [...p.tasks, newTask] };
        }
        return p;
    });
    onUpdate({ ...project, phases: updatedPhases });
    setIsCreateOpen(false);
  };

  const handleAddDependency = (depId: string) => {
     if (!selectedTask) return;
     const newDeps = [...selectedTask.dependencies, depId];
     handleTaskUpdate(selectedTask.id, { dependencies: newDeps });
  };

  const handleRemoveDependency = (depId: string) => {
     if (!selectedTask) return;
     const newDeps = selectedTask.dependencies.filter(d => d !== depId);
     handleTaskUpdate(selectedTask.id, { dependencies: newDeps });
  };

  return (
    <div className="flex h-[calc(100vh-250px)]">
       {/* Main Content Area */}
       <div className={`flex-1 overflow-y-auto pr-4 transition-all ${selectedTask ? 'w-2/3' : 'w-full'}`}>
          <div className="flex justify-between items-center mb-4">
             <div className="flex space-x-2 rtl:space-x-reverse bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                   <LayoutList size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                   {t('common.list')}
                </button>
                <button 
                  onClick={() => setViewMode('board')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${viewMode === 'board' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                   <LayoutGrid size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                   {t('common.board')}
                </button>
             </div>
             <div className="flex space-x-2 rtl:space-x-reverse">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Filter size={18} /></button>
                <button 
                   onClick={() => setIsCreateOpen(true)}
                   className="flex items-center px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                >
                   <Plus size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('common.addTask')}
                </button>
             </div>
          </div>

          {viewMode === 'board' ? (
             <TaskBoard tasks={allTasks} onTaskMove={handleTaskMove} onTaskClick={setSelectedTask} />
          ) : (
             <div className="space-y-4">
                {project.phases.map(phase => (
                   <div key={phase.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <div 
                         className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                         onClick={() => togglePhase(phase.id)}
                      >
                         <div className="flex items-center font-semibold text-gray-800">
                            {expandedPhases.includes(phase.id) ? <ChevronDown size={18} className="mr-2 rtl:ml-2 rtl:mr-0" /> : <ChevronRight size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />}
                            {phase.name}
                         </div>
                         <span className="text-xs text-gray-500">{phase.tasks.length} {t('detail.stats.tasks')}</span>
                      </div>
                      
                      {expandedPhases.includes(phase.id) && (
                         <div className="divide-y divide-gray-100">
                            {phase.tasks.map(task => {
                               const unmetDependencies = task.dependencies.filter(depId => {
                                  const depTask = allTasks.find(t => t.id === depId);
                                  return depTask && depTask.status !== 'Completed';
                               });
                               const isBlocked = unmetDependencies.length > 0;
                               const hasDependencies = task.dependencies.length > 0;

                               return (
                                  <div 
                                     key={task.id} 
                                     className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group ${selectedTask?.id === task.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                     onClick={() => setSelectedTask(task)}
                                  >
                                     <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'Completed' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                           {task.status === 'Completed' && <CheckCircle size={12} className="text-white" />}
                                        </div>
                                        <div>
                                           <div className="flex items-center">
                                              <p className={`text-sm font-medium mr-2 rtl:ml-2 rtl:mr-0 ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.name}</p>
                                              {hasDependencies && (
                                                 <span title={isBlocked ? 'Dependencies Unmet' : 'Dependencies Met'} className="flex items-center">
                                                    <Link 
                                                       size={14} 
                                                       className={isBlocked ? 'text-red-500' : 'text-green-500'} 
                                                    />
                                                 </span>
                                              )}
                                           </div>
                                           <div className="flex items-center mt-1 space-x-2 rtl:space-x-reverse">
                                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusColor(task.status)}`}>{t(`status.${task.status.replace(/ /g, '').replace(/^./, str => str.toLowerCase())}` as any)}</span>
                                              {task.type === 'External' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">{t('table.authority')}</span>}
                                              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{task.department ? t(`enums.departments.${task.department}` as any) : 'General'}</span>
                                           </div>
                                        </div>
                                     </div>

                                     <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                                        {task.assignee && (
                                           <img src={task.assignee.avatar} className="w-6 h-6 rounded-full" title={task.assignee.name} alt="" />
                                        )}
                                        <div className="flex items-center">
                                           <Clock size={14} className="mr-1 rtl:ml-1 rtl:mr-0" />
                                           <span className="text-xs">{task.duration}d</span>
                                        </div>
                                        <div className="text-xs">
                                           {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                     </div>
                                  </div>
                               );
                            })}
                            {phase.tasks.length === 0 && (
                               <div className="p-4 text-center text-sm text-gray-400 italic">{t('detail.tasks.noTasksPhase')}</div>
                            )}
                         </div>
                      )}
                   </div>
                ))}
             </div>
          )}
       </div>

       {/* Slide-out Task Detail Panel */}
       {selectedTask && (
          <div className="w-[400px] bg-white border-l border-gray-200 h-full overflow-y-auto shadow-xl animate-in slide-in-from-right-10 duration-300 flex flex-col z-20">
             <div className="p-4 border-b border-gray-200 flex justify-between items-start sticky top-0 bg-white z-10">
                <div>
                   <span className="text-xs font-mono text-gray-400">{selectedTask.id}</span>
                   <h2 className="text-lg font-bold text-gray-900 leading-tight mt-1">{selectedTask.name}</h2>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                   <X size={20} />
                </button>
             </div>

             <div className="p-4 space-y-6">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase">{t('detail.tasks.status')}</label>
                   <select 
                      value={selectedTask.status}
                      onChange={(e) => handleTaskUpdate(selectedTask.id, { status: e.target.value as any })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-900"
                   >
                      <option value="Not Started">{t('status.notStarted')}</option>
                      <option value="In Progress">{t('status.inProgress')}</option>
                      <option value="Blocked">{t('status.onHold')}</option> 
                      <option value="Completed">{t('status.completed')}</option>
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">{t('detail.tasks.startDate')}</label>
                      <p className="mt-1 text-sm font-medium">{selectedTask.startDate || t('detail.overview.na')}</p>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">{t('detail.tasks.dueDate')}</label>
                      <p className="mt-1 text-sm font-medium">{selectedTask.dueDate}</p>
                   </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase">{t('detail.tasks.assignee')}</label>
                   <div className="mt-2 flex items-center">
                      {selectedTask.assignee ? (
                         <>
                            <img src={selectedTask.assignee.avatar} className="w-8 h-8 rounded-full mr-3 rtl:ml-3 rtl:mr-0" alt="" />
                            <div>
                               <p className="text-sm font-medium text-gray-900">{selectedTask.assignee.name}</p>
                               <p className="text-xs text-gray-500">{selectedTask.assignee.role}</p>
                            </div>
                         </>
                      ) : (
                         <div className="flex items-center text-gray-400 text-sm">
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 mr-3 rtl:ml-3 rtl:mr-0"></div>
                            {t('wizard.tasks.unassigned')}
                         </div>
                      )}
                   </div>
                </div>

                <div>
                   <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">{t('detail.tasks.dependencies')}</label>
                   </div>
                   
                   {/* Add Dependency Dropdown */}
                   <div className="mb-3">
                      <select 
                         onChange={(e) => {
                            if(e.target.value) handleAddDependency(e.target.value);
                            e.target.value = "";
                         }}
                         className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                         <option value="">{t('detail.tasks.addDependency')}</option>
                         {project.phases.map(phase => {
                            const availableTasks = phase.tasks.filter(t => t.id !== selectedTask.id && !selectedTask.dependencies.includes(t.id));
                            if (availableTasks.length === 0) return null;
                            return (
                               <optgroup key={phase.id} label={phase.name}>
                                  {availableTasks.map(t => (
                                     <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                               </optgroup>
                            );
                         })}
                      </select>
                   </div>

                   {/* Dependency List */}
                   {selectedTask.dependencies.length > 0 ? (
                      <div className="space-y-2">
                         {selectedTask.dependencies.map(depId => {
                            const depTask = allTasks.find(t => t.id === depId);
                            const isMet = depTask?.status === 'Completed';
                            
                            return (
                               <div key={depId} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border border-gray-200">
                                  <div className="flex items-center overflow-hidden">
                                     {isMet ? (
                                        <CheckCircle size={14} className="text-green-500 mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0" />
                                     ) : (
                                        <AlertCircle size={14} className="text-amber-500 mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0" />
                                     )}
                                     <span className="truncate">{depTask?.name || depId}</span>
                                  </div>
                                  <button onClick={() => handleRemoveDependency(depId)} className="text-gray-400 hover:text-red-500 ml-2 rtl:ml-0 rtl:mr-2">
                                     <Trash2 size={14} />
                                  </button>
                               </div>
                            );
                         })}
                      </div>
                   ) : (
                      <p className="mt-1 text-sm text-gray-500 italic">{t('detail.tasks.noDependencies')}</p>
                   )}
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                   <div className="flex space-x-4 rtl:space-x-reverse text-gray-500">
                      <button className="flex items-center text-sm hover:text-blue-600">
                         <Paperclip size={16} className="mr-1 rtl:ml-1 rtl:mr-0" /> {t('detail.tasks.attachments')}
                      </button>
                      <button className="flex items-center text-sm hover:text-blue-600">
                         <MessageSquare size={16} className="mr-1 rtl:ml-1 rtl:mr-0" /> {t('detail.tasks.comments')}
                      </button>
                   </div>
                </div>
             </div>
          </div>
       )}

       {/* Create Task Modal */}
       {isCreateOpen && (
          <CreateTaskModal phases={project.phases} onClose={() => setIsCreateOpen(false)} onSave={handleCreateTask} />
       )}
    </div>
  );
};
