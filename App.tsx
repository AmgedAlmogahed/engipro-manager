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
import { ClientsList } from './components/sales/ClientsList';
import { ClientDetail } from './components/sales/ClientDetail';
import { OpportunitiesList } from './components/sales/OpportunitiesList';
import { OpportunityDetail } from './components/sales/OpportunityDetail';
import { RfqList } from './components/sales/RfqList';
import { RfqDetail } from './components/sales/RfqDetail';
import { QuotationsList } from './components/sales/QuotationsList';
import { QuotationDetail } from './components/sales/QuotationDetail';
import { LanguageProvider } from './contexts/LanguageContext';
import { SalesProvider } from './contexts/SalesContext';

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
      <SalesProvider>
        <HashRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="my-tasks" element={<MyTasks />} />
              <Route path="leads" element={<ClientsList mode="leads" />} />
              <Route path="clients" element={<ClientsList mode="clients" />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="opportunities" element={<OpportunitiesList />} />
              <Route path="opportunities/:id" element={<OpportunityDetail />} />
              <Route path="rfqs" element={<RfqList />} />
              <Route path="rfqs/:id" element={<RfqDetail />} />
              <Route path="quotations" element={<QuotationsList />} />
              <Route path="quotations/:id" element={<QuotationDetail />} />
              <Route path="projects" element={<ProjectsList />} />
              <Route path="projects/new" element={<CreateProjectWizard />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="authority" element={<AuthorityTracking />} />
              <Route path="team" element={<TeamManagement />} />
              <Route path="roles" element={<RolesManagement />} />
            </Route>
          </Routes>
        </HashRouter>
      </SalesProvider>
    </LanguageProvider>
  );
};

export default App;