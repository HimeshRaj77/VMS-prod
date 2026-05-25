import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';
import { Loader2 } from 'lucide-react';

export default function AgencyRedirector() {
  const [redirectTo, setRedirectTo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCurrentQuotation = async () => {
      const token = localStorage.getItem('token');
      const isDemo = token === 'demo-static-token-bypass';

      if (isDemo) {
        // In static demo mode, redirect straight to upload
        setRedirectTo('/upload');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/quotation/current');
        if (response.data && response.data.id) {
          setRedirectTo(`/quotation/${response.data.id}`);
        } else {
          setRedirectTo('/upload');
        }
      } catch (err) {
        console.error('Error checking current quotation status:', err);
        // Fallback to upload if there is any error
        setRedirectTo('/upload');
      } finally {
        setLoading(false);
      }
    };

    checkCurrentQuotation();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
        <p className="text-sm font-bold text-slate-700 mt-2 uppercase tracking-wider animate-pulse">
          Opening Workspace...
        </p>
      </div>
    );
  }

  return <Navigate to={redirectTo} replace />;
}
