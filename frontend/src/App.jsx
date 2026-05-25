import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import RegisterAgency from './pages/RegisterAgency';
import UploadQuotation from './pages/UploadQuotation';
import QuotationDetail from './pages/QuotationDetail';
import AgencyRedirector from './components/AgencyRedirector';

// Admin Imports
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import WorkforceAllocation from './pages/admin/WorkforceAllocation';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardRoster from './pages/admin/AdminDashboardRoster';
import AdminRequirements from './pages/admin/AdminRequirements';

// Wrapper for standard agency routes to keep the main layout
const AgencyLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <main className="flex-grow pt-16">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Agency Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAgency />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        
        {/* Standalone Admin Dashboard Routes with Sidebar Layout */}
        <Route 
          path="/admin" 
          element={<Navigate to="/admin/dashboard" replace />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminDashboardRoster />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/allocation" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <WorkforceAllocation />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/requirements" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminRequirements />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />

        {/* Root: send agency users to /upload, admin users to /admin/dashboard */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AgencyRedirector />
            </ProtectedRoute>
          } 
        />

        {/* /dashboard: agency-only alias */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AgencyRedirector />
            </ProtectedRoute>
          } 
        />
        
        {/* Core Workspace routes */}
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <AgencyLayout>
                <UploadQuotation />
              </AgencyLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quotation/:id" 
          element={
            <ProtectedRoute>
              <AgencyLayout>
                <QuotationDetail />
              </AgencyLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
