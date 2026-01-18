import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProjectsList } from './components/ProjectsList';
import { CreateProjectWizard } from './components/CreateProjectWizard';
import { ProjectDetail } from './components/ProjectDetail';
import { AuthorityTracking } from './components/AuthorityTracking';
import { MyTasks } from './components/MyTasks';
import { TeamManagement } from './components/TeamManagement';
import { RolesManagement } from './components/RolesManagement';
import { LanguageProvider } from './contexts/LanguageContext';

// Simple ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/new" element={<CreateProjectWizard />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="authority" element={<AuthorityTracking />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="roles" element={<RolesManagement />} />
          </Route>
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;