import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', textAlign: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3.5rem 2rem', maxWidth: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AlertCircle size={64} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Back to Safety
        </button>
      </div>
    </div>
  );
};
export default NotFound;
