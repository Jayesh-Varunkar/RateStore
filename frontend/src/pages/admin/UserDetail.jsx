import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useToast } from '../../components/Toast';
import StarDisplay from '../../components/StarDisplay';
import { ArrowLeft, User, Mail, MapPin, Shield, Calendar } from 'lucide-react';

export const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetail = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/users/${id}`);
        if (response.success) {
          setUserDetail(response.data);
        }
      } catch (err) {
        addToast(err.message || 'Failed to retrieve user details.', 'error');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [id, navigate, addToast]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading user details...</div>;
  }

  if (!userDetail) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>User not found.</div>;
  }

  return (
    <div>
      <header className="header" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')} style={{ padding: '0.5rem 0.75rem' }}>
          <ArrowLeft size={18} />
          Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>User Profile Details</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Administration audit view for registered account profiles.</p>
        </div>
      </header>

      <div className="grid-cols-2">
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
            <User size={20} color="var(--primary)" />
            Account Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Full Name</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{userDetail.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} color="var(--text-secondary)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Email Address</span>
                <span>{userDetail.email}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={18} color="var(--text-secondary)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Physical Address</span>
                <span>{userDetail.address || 'No address registered.'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={18} color="var(--text-secondary)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>User Privilege Level</span>
                <span className={`badge badge-${userDetail.role}`} style={{ marginTop: '0.25rem' }}>
                  {userDetail.role}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={18} color="var(--text-secondary)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Registered Since</span>
                <span>{new Date(userDetail.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Owner Card */}
        {userDetail.role === 'owner' && (
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Owned Stores Overall Rating
            </span>
            <div style={{ margin: '1.5rem 0' }}>
              <h2 style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--warning)', textShadow: '0 0 15px rgba(245, 158, 11, 0.2)' }}>
                {userDetail.avg_rating ? parseFloat(userDetail.avg_rating).toFixed(1) : '0.0'}
              </h2>
            </div>
            <StarDisplay value={userDetail.avg_rating || 0} />
            <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
              This rating represents the dynamic cumulative average rating computed across all stores assigned to this owner.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminUserDetail;
