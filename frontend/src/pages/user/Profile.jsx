import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../api/api';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';
import FormField from '../../components/FormField';
import { Key, User, Shield } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().regex(PASSWORD_REGEX, {
    message: 'Password must be 8–16 characters, containing at least 1 uppercase letter and 1 special character.'
  }),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const UserProfile = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.patch(`/api/users/${user.id}/password`, {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      if (response.success) {
        addToast('Password updated successfully!', 'success');
        reset();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>My Account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your security credentials and view profile information.</p>
        </div>
      </header>

      <div className="grid-cols-2">
        {/* User Card info */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
            <User size={20} color="var(--primary)" />
            Profile Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Account Name</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.name}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Email Address</span>
              <span>{user.email}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} color="var(--text-secondary)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Role Privilege Level</span>
                <span className={`badge badge-${user.role}`} style={{ marginTop: '0.25rem' }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
            <Key size={20} color="var(--primary)" />
            Update Password
          </h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              label="Current Password"
              type="password"
              placeholder="••••••••"
              error={errors.oldPassword}
              {...register('oldPassword')}
            />

            <FormField
              label="New Password"
              type="password"
              placeholder="8-16 chars, 1 uppercase, 1 special character"
              error={errors.newPassword}
              {...register('newPassword')}
            />

            <FormField
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              error={errors.confirmPassword}
              {...register('confirmPassword')}
            />

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
              {submitting ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default UserProfile;
