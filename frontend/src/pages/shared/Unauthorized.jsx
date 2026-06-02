import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', textAlign: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3.5rem 2rem', maxWidth: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ShieldAlert size={64} color="var(--danger)" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Unauthorized Access</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          You do not possess the privilege level required to access this administration page.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
export default Unauthorized;
