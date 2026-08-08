import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_PROJECTS } from '../constants';
import { Project, ProjectStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// Sub-components
import { ProjectHeader } from './project-detail/ProjectHeader';
import { OverviewTab } from './project-detail/OverviewTab';
import { TasksTab } from './project-detail/TasksTab';
import { GanttTab } from './project-detail/GanttTab';
import { TeamTab } from './project-detail/TeamTab';
import { DocumentsTab } from './project-detail/DocumentsTab';
import { AuthorityTab } from './project-detail/AuthorityTab';
import { ActivityTab } from './project-detail/ActivityTab';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  
  // Local state for project data to simulate editing capability
  // In a real app, this would come from a query hook
  const [project, setProject] = useState<Project | undefined>(
    MOCK_PROJECTS.find(p => p.id === id) || MOCK_PROJECTS[0]
  );
  
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'gantt' | 'team' | 'documents' | 'authority' | 'activity'>('overview');

  if (!project) return <div className="p-10 text-center">Project not found</div>;

  const handleUpdateProject = (updated: Project) => {
     setProject(updated);
  };

  const handleStatusChange = (status: ProjectStatus) => {
     setProject({ ...project, status });
  };

  const tabs = [
    { id: 'overview', label: t('detail.tabs.overview') },
    { id: 'tasks', label: t('detail.tabs.tasks') },
    { id: 'gantt', label: t('detail.tabs.gantt') },
    { id: 'team', label: t('detail.tabs.team') },
    { id: 'documents', label: t('detail.tabs.documents') },
    { id: 'authority', label: t('detail.tabs.authority') },
    { id: 'activity', label: t('detail.tabs.activity') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <ProjectHeader project={project} onStatusChange={handleStatusChange} />
      
      {/* Tab Nav */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 shadow-sm overflow-x-auto">
         <nav className="-mb-px flex space-x-6 rtl:space-x-reverse min-w-max">
            {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 {tab.label}
               </button>
            ))}
         </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
         {activeTab === 'overview' && <OverviewTab project={project} />}
         {activeTab === 'tasks' && <TasksTab project={project} onUpdate={handleUpdateProject} />}
         {activeTab === 'gantt' && <GanttTab project={project} />}
         {activeTab === 'team' && <TeamTab project={project} />}
         {activeTab === 'documents' && <DocumentsTab project={project} />}
         {activeTab === 'authority' && <AuthorityTab project={project} />}
         {activeTab === 'activity' && <ActivityTab project={project} />}
      </div>
    </div>
  );
};