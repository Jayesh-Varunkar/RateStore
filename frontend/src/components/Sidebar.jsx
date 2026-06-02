import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useToast } from './Toast';
import { LayoutDashboard, Users, Store, User, Key, LogOut } from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          RateStore
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={user.name}>
            {user.name.split(' ')[0]} {/* Shorten name for display */}
          </span>
          <span className={`badge badge-${user.role}`} style={{ marginTop: '0.4rem', alignSelf: 'flex-start', padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>
            {user.role}
          </span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {/* Admin Links */}
        {user.role === 'admin' && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `btn btn-secondary ${isActive ? 'btn-primary' : ''}`}
              style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: 'none' }}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `btn btn-secondary ${isActive ? 'btn-primary' : ''}`}
              style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: 'none' }}
            >
              <Users size={18} />
              Manage Users
            </NavLink>
            <NavLink
              to="/admin/stores"
              className={({ isActive }) => `btn btn-secondary ${isActive ? 'btn-primary' : ''}`}
              style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: 'none' }}
            >
              <Store size={18} />
              Manage Stores
            </NavLink>
          </>
        )}

        {/* Owner Links */}
        {user.role === 'owner' && (
          <NavLink
            to="/owner/dashboard"
            className={({ isActive }) => `btn btn-secondary ${isActive ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: 'none' }}
          >
            <LayoutDashboard size={18} />
            My Dashboard
          </NavLink>
        )}

        {/* Regular User Links */}
        {user.role === 'user' && (
          <NavLink
            to="/user/stores"
            className={({ isActive }) => `btn btn-secondary ${isActive ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: 'none' }}
          >
            <Store size={18} />
            Browse Stores
          </NavLink>
        )}

        {/* Shared Links */}
        <NavLink
          to="/user/profile"
          className={({ isActive }) => `btn btn-secondary ${isActive ? 'btn-primary' : ''}`}
          style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: 'none' }}
        >
          <Key size={18} />
          Change Password
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="btn btn-secondary"
        style={{ justifyContent: 'flex-start', border: 'none', background: 'none', color: 'var(--danger)', marginTop: 'auto' }}
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </aside>
  );
};
export default Sidebar;
