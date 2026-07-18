import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile'; // Shared component
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobListing from './pages/JobListing';
import JobDetails from './pages/JobDetails';
import ApplicationTracking from './pages/ApplicationTracking';
import CareerPath from './pages/CareerPath';

// Recruiter Pages
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import RecruiterJobs from './pages/RecruiterJobs';
import Applicants from './pages/Applicants';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import RecruiterApprovals from './pages/RecruiterApprovals';

const AppLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar />
      <div style={{
        display: 'flex',
        padding: '0 24px 24px 24px',
        gap: '24px',
        flex: 1,
        width: '100%'
      }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
  if (user.role === 'RECRUITER') return <Navigate to="/recruiter" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Root Redirect Router */}
            <Route path="/" element={<DashboardRedirect />} />

            {/* Student Module Protected Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AppLayout><StudentDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AppLayout><Profile /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/resume" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AppLayout><ResumeAnalyzer /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/jobs" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AppLayout><JobListing /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/jobs/:id" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AppLayout><JobDetails /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/applications" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AppLayout><ApplicationTracking /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/recommendations" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AppLayout><CareerPath /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Recruiter Module Protected Routes */}
            <Route path="/recruiter" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <AppLayout><RecruiterDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/recruiter/profile" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <AppLayout><Profile /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/recruiter/post-job" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <AppLayout><PostJob /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs/edit/:id" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <AppLayout><PostJob /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <AppLayout><RecruiterJobs /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/recruiter/applicants" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <AppLayout><Applicants /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Admin Module Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout><UserManagement /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/approvals" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout><RecruiterApprovals /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
