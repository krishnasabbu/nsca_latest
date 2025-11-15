import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { PlayersPage } from './pages/Admin/PlayersPage';
import { StaffPage } from './pages/Admin/StaffPage';
import { BatchesPage } from './pages/Admin/BatchesPage';
import { MediaPage } from './pages/Admin/MediaPage';
import { YoyoTestPage } from './pages/Admin/YoyoTestPage';
import { AttendancePage } from './pages/Admin/AttendancePage';
import { FeesPage } from './pages/Admin/FeesPage';
import { SalaryPage } from './pages/Admin/SalaryPage';
import { SmsMessagesPage } from './pages/Admin/SmsMessagesPage';
import { CoachDashboard } from './pages/Coach/CoachDashboard';
import { CoachPlayersPage } from './pages/Coach/CoachPlayersPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'admin' ? '/admin' : '/coach'} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="batches" element={<BatchesPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="yoyo-test" element={<YoyoTestPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="fees" element={<FeesPage />} />
          <Route path="salary" element={<SalaryPage />} />
          <Route path="sms-messages" element={<SmsMessagesPage />} />
        </Route>

        <Route
          path="/coach"
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CoachDashboard />} />
          <Route path="players" element={<CoachPlayersPage />} />
          <Route path="batches" element={<BatchesPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="yoyo-test" element={<YoyoTestPage />} />
          <Route path="attendance" element={<AttendancePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
