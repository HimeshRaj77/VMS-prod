import { Navigate } from 'react-router-dom';

const DEMO_TOKEN = 'demo-static-token-bypass';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // Allow demo token through without backend
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
