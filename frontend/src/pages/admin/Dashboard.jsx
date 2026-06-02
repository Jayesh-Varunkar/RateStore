import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/Toast';
import { Users, Store, Star } from 'lucide-react';

export const AdminDashboard = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/dashboard/stats');
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        addToast(err.message || 'Failed to fetch dashboard statistics.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);

  return (
    <div>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to the RateStore administration overview.</p>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading statistics...</div>
      ) : (
        <div className="grid-cols-3">
          {/* Card 1: Total Users */}
          <div className="glass-panel p-2 flex-between" style={{ padding: '2rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Users</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{stats?.totalUsers || 0}</h2>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '1rem', borderRadius: '50%' }}>
              <Users size={32} />
            </div>
          </div>

          {/* Card 2: Total Stores */}
          <div className="glass-panel p-2 flex-between" style={{ padding: '2rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Stores</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{stats?.totalStores || 0}</h2>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', padding: '1rem', borderRadius: '50%' }}>
              <Store size={32} />
            </div>
          </div>

          {/* Card 3: Total Ratings */}
          <div className="glass-panel p-2 flex-between" style={{ padding: '2rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Ratings</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{stats?.totalRatings || 0}</h2>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '50%' }}>
              <Star size={32} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
