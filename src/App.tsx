/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthGuard';
import AuthGuard from '@/components/AuthGuard';
import Layout from '@/components/Layout';
import { useAuth } from '@/components/AuthGuard';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Dashboard from '@/pages/Dashboard';
import ProjectPortal from '@/pages/ProjectPortal';
import ProjectDetails from '@/pages/ProjectDetails';
import SubmitProject from '@/pages/SubmitProject';
import AdminApproval from '@/pages/AdminApproval';
import SuperadminApproval from '@/pages/SuperadminApproval';
import Configuration from '@/pages/Configuration';
import UserManagement from '@/pages/UserManagement';
import ErrorBoundary from '@/components/ErrorBoundary';
import WelcomeModal from '@/components/WelcomeModal';

function AppContent() {
  const { user } = useAuth();

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/portal" element={<ProjectPortal />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/submit" element={<SubmitProject />} />
        <Route path="/admin" element={<AdminApproval />} />
        <Route path="/superadmin" element={<SuperadminApproval />} />
        <Route path="/config" element={<Configuration />} />
        <Route path="/users" element={<UserManagement />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AuthGuard>
            <WelcomeModal />
            <AppContent />
            <Toaster position="top-right" richColors />
          </AuthGuard>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}



