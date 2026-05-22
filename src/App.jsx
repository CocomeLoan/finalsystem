import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { PortalAuthProvider, usePortalAuth } from '@/lib/PortalAuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PortalLogin from '@/pages/PortalLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import StudentManagement from '@/pages/admin/StudentManagement';
import PredictionPage from '@/pages/admin/PredictionPage';
import ModelTraining from '@/pages/admin/ModelTraining';
import ModelResults from '@/pages/admin/ModelResults';
import ConcernsPage from '@/pages/admin/ConcernsPage';
import ReportsPage from '@/pages/admin/ReportsPage';
import TrainingLogsPage from '@/pages/admin/TrainingLogsPage';
import PredictionLogsPage from '@/pages/admin/PredictionLogsPage';
import DeanDashboard from '@/pages/dean/DeanDashboard';
import DeanStudents from '@/pages/dean/DeanStudents';
import DeanPredictions from '@/pages/dean/DeanPredictions';
import DeanTraining from '@/pages/dean/DeanTraining';
import DeanConcerns from '@/pages/dean/DeanConcerns';
import DeanModelResults from '@/pages/dean/DeanModelResults';
import DeveloperDashboard from '@/pages/developer/DeveloperDashboard';
import UserManagement from '@/pages/developer/UserManagement';
import SystemStats from '@/pages/developer/SystemStats';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentGrades from '@/pages/student/StudentGrades';
import StudentPrediction from '@/pages/student/StudentPrediction';
import StudentConcerns from '@/pages/student/StudentConcerns';
import Settings from '@/pages/Settings';

const ROLE_DEFAULTS = {
  admin: '/admin',
  dean: '/dean',
  developer: '/developer',
  student: '/student',
};

// Guard: redirects to login if not authenticated, or wrong role
function PortalGuard({ children, allowedRole }) {
  const { portalUser, isLoading } = usePortalAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!portalUser) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRole && portalUser.role !== allowedRole) {
    // Redirect to the user's own dashboard
    return <Navigate to={ROLE_DEFAULTS[portalUser.role] || '/'} replace />;
  }

  return children;
}

const AppRoutes = () => {
  const { portalUser, isLoading } = usePortalAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* "/" → login if not logged in, else redirect to role dashboard */}
      <Route path="/" element={
        portalUser
          ? <Navigate to={ROLE_DEFAULTS[portalUser.role] || '/admin'} replace />
          : <PortalLogin />
      } />

      {/* Admin Routes */}
      <Route element={<PortalGuard allowedRole="admin"><DashboardLayout role="admin" user={portalUser} /></PortalGuard>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/predictions" element={<PredictionPage />} />
        <Route path="/admin/training" element={<ModelTraining />} />
        <Route path="/admin/model-results" element={<ModelResults />} />
        <Route path="/admin/concerns" element={<ConcernsPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/training-logs" element={<TrainingLogsPage />} />
        <Route path="/admin/prediction-logs" element={<PredictionLogsPage />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      {/* Dean Routes */}
      <Route element={<PortalGuard allowedRole="dean"><DashboardLayout role="dean" user={portalUser} /></PortalGuard>}>
        <Route path="/dean" element={<DeanDashboard />} />
        <Route path="/dean/students" element={<DeanStudents />} />
        <Route path="/dean/predictions" element={<DeanPredictions />} />
        <Route path="/dean/training" element={<DeanTraining />} />
        <Route path="/dean/model-results" element={<DeanModelResults />} />
        <Route path="/dean/concerns" element={<DeanConcerns />} />
        <Route path="/dean/training-logs" element={<TrainingLogsPage />} />
        <Route path="/dean/prediction-logs" element={<PredictionLogsPage />} />
        <Route path="/dean/settings" element={<Settings />} />
      </Route>

      {/* Developer Routes */}
      <Route element={<PortalGuard allowedRole="developer"><DashboardLayout role="developer" user={portalUser} /></PortalGuard>}>
        <Route path="/developer" element={<DeveloperDashboard />} />
        <Route path="/developer/users" element={<UserManagement />} />
        <Route path="/developer/stats" element={<SystemStats />} />
        <Route path="/developer/settings" element={<Settings />} />
      </Route>

      {/* Student Routes */}
      <Route element={<PortalGuard allowedRole="student"><DashboardLayout role="student" user={portalUser} /></PortalGuard>}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/prediction" element={<StudentPrediction />} />
        <Route path="/student/concerns" element={<StudentConcerns />} />
        <Route path="/student/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <PortalAuthProvider>
          <AppRoutes />
          <Toaster />
        </PortalAuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;