import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../api/api';
import { useToast } from '../../components/Toast';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import FormField from '../../components/FormField';
import useDebounce from '../../hooks/useDebounce';
import { UserPlus, X } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const createUserSchema = z.object({
  name: z.string()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name must be at most 60 characters long'),
  email: z.string().email('Must be a valid email address'),
  address: z.string().max(400, 'Address must be at most 400 characters long').optional().or(z.literal('')),
  password: z.string().regex(PASSWORD_REGEX, {
    message: 'Password must be 8–16 characters, containing at least 1 uppercase letter and 1 special character.'
  }),
  role: z.enum(['admin', 'user', 'owner'], { message: 'Please select a role' })
});

export const AdminUsers = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Table states
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Filter states
  const [filterValues, setFilterValues] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });

  const debouncedFilters = useDebounce(filterValues, 300);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createUserSchema),
    mode: 'onBlur'
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder,
        ...(debouncedFilters.name && { name: debouncedFilters.name }),
        ...(debouncedFilters.email && { email: debouncedFilters.email }),
        ...(debouncedFilters.address && { address: debouncedFilters.address }),
        ...(debouncedFilters.role && { role: debouncedFilters.role })
      });

      const response = await api.get(`/api/users?${queryParams.toString()}`);
      if (response.success) {
        setUsers(response.data.users);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      addToast(err.message || 'Failed to retrieve users.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, debouncedFilters, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle pagination changes
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle sorting click
  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(columnKey);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  // Handle filtering input
  const handleFilterChange = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Handle modal submit
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.post('/api/users', data);
      if (response.success) {
        addToast('User created successfully!', 'success');
        setModalOpen(false);
        reset();
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Table columns definition
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => (
        <span className={`badge badge-${row.role}`}>
          {row.role}
        </span>
      )
    }
  ];

  return (
    <div>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Manage Users</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View, search, and register administrators, store owners, and customers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <UserPlus size={18} />
          Add User
        </button>
      </header>

      {/* Filter Options */}
      <FilterBar
        filters={[
          { key: 'name', label: 'Name', type: 'text', placeholder: 'Search by name...' },
          { key: 'email', label: 'Email', type: 'text', placeholder: 'Search by email...' },
          { key: 'address', label: 'Address', type: 'text', placeholder: 'Search by address...' },
          {
            key: 'role',
            label: 'Role',
            type: 'select',
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'owner', label: 'Owner' },
              { value: 'user', label: 'User' }
            ]
          }
        ]}
        values={filterValues}
        onChange={handleFilterChange}
      />

      {/* Paginated Sortable Table */}
      <SortableTable
        columns={columns}
        data={users}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Creation Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <button
              onClick={() => { setModalOpen(false); reset(); }}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Add New User</h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <FormField
                label="Full Name"
                type="text"
                placeholder="Must be 20 to 60 characters"
                error={errors.name}
                {...register('name')}
              />

              <FormField
                label="Email Address"
                type="email"
                placeholder="user@domain.com"
                error={errors.email}
                {...register('email')}
              />

              <FormField
                label="Physical Address"
                type="text"
                placeholder="Optional address details (max 400 chars)"
                error={errors.address}
                {...register('address')}
              />

              <FormField
                label="Temporary Password"
                type="password"
                placeholder="8-16 chars, 1 uppercase, 1 special character"
                error={errors.password}
                {...register('password')}
              />

              <FormField
                label="Role"
                type="select"
                error={errors.role}
                options={[
                  { value: '', label: 'Select a privilege level...' },
                  { value: 'user', label: 'User (Customer)' },
                  { value: 'owner', label: 'Owner (Store Owner)' },
                  { value: 'admin', label: 'Admin (System Administrator)' }
                ]}
                {...register('role')}
              />

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setModalOpen(false); reset(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminUsers;
