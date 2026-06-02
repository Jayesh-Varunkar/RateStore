import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { useToast } from '../../components/Toast';
import FormField from '../../components/FormField';
import { UserPlus } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const registerSchema = z.object({
  name: z.string()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name must be at most 60 characters long'),
  email: z.string().email('Must be a valid email address'),
  address: z.string().max(400, 'Address must be at most 400 characters long').optional().or(z.literal('')),
  password: z.string().regex(PASSWORD_REGEX, {
    message: 'Password must be 8–16 characters with at least 1 uppercase letter and 1 special character.'
  }),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const Register = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    // Remove confirmPassword before sending to server
    const { confirmPassword, ...payload } = data;
    try {
      const response = await api.post('/api/auth/register', payload);
      if (response.success) {
        addToast('Registration successful! Please sign in.', 'success');
        navigate('/login');
      }
    } catch (err) {
      addToast(err.message || 'Registration failed. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
            Join RateStore
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Create an account to browse and rate local stores
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField
            label="Full Name"
            type="text"
            placeholder="Min 20 - Max 60 characters"
            error={errors.name}
            {...register('name')}
          />

          <FormField
            label="Email Address"
            type="email"
            placeholder="name@domain.com"
            error={errors.email}
            {...register('email')}
          />

          <FormField
            label="Address"
            type="text"
            placeholder="Your physical address (optional, max 400 characters)"
            error={errors.address}
            {...register('address')}
          />

          <FormField
            label="Password"
            type="password"
            placeholder="8-16 chars, 1 uppercase, 1 special symbol"
            error={errors.password}
            {...register('password')}
          />

          <FormField
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
            <UserPlus size={18} />
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
