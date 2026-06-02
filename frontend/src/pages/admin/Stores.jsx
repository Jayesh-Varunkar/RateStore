import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../api/api';
import { useToast } from '../../components/Toast';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import FormField from '../../components/FormField';
import StarDisplay from '../../components/StarDisplay';
import useDebounce from '../../hooks/useDebounce';
import { Plus, X } from 'lucide-react';

const createStoreSchema = z.object({
  name: z.string()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name must be at most 60 characters long'),
  email: z.string().email('Must be a valid email address'),
  address: z.string().max(400, 'Address must be at most 400 characters long').optional().or(z.literal('')),
  owner_id: z.string().optional().or(z.literal(''))
});

export const AdminStores = () => {
  const { addToast } = useToast();

  // Table states
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Filter states
  const [filterValues, setFilterValues] = useState({
    name: '',
    address: ''
  });

  const debouncedFilters = useDebounce(filterValues, 300);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [owners, setOwners] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createStoreSchema),
    mode: 'onBlur'
  });

  // Fetch registered store owners to populate select option
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await api.get('/api/users?role=owner&limit=1000');
        if (response.success) {
          setOwners(response.data.users);
        }
      } catch (err) {
        console.error('Failed to retrieve owner list:', err);
      }
    };
    fetchOwners();
  }, []);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder,
        ...(debouncedFilters.name && { name: debouncedFilters.name }),
        ...(debouncedFilters.address && { address: debouncedFilters.address })
      });

      const response = await api.get(`/api/stores?${queryParams.toString()}`);
      if (response.success) {
        setStores(response.data.stores);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      addToast(err.message || 'Failed to retrieve store listings.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, debouncedFilters, addToast]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(columnKey);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    
    // Parse owner_id to integer if set, or null
    const payload = {
      ...data,
      owner_id: data.owner_id ? parseInt(data.owner_id, 10) : null
    };

    try {
      const response = await api.post('/api/stores', payload);
      if (response.success) {
        addToast('Store created successfully!', 'success');
        setModalOpen(false);
        reset();
        fetchStores();
      }
    } catch (err) {
      addToast(err.message || 'Failed to register store.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Store Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'owner',
      label: 'Owner',
      sortable: false,
      render: (row) => (row.owner ? row.owner.name : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>)
    },
    {
      key: 'avg_rating',
      label: 'Average Rating',
      sortable: true,
      render: (row) => <StarDisplay value={row.avg_rating} />
    }
  ];

  return (
    <div>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Manage Stores</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure locations, manage email assignments, and monitor overall user reviews.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          Add Store
        </button>
      </header>

      <FilterBar
        filters={[
          { key: 'name', label: 'Store Name', type: 'text', placeholder: 'Search by store name...' },
          { key: 'address', label: 'Address', type: 'text', placeholder: 'Search by address...' }
        ]}
        values={filterValues}
        onChange={handleFilterChange}
      />

      <SortableTable
        columns={columns}
        data={stores}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
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

            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Add New Store</h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <FormField
                label="Store Name"
                type="text"
                placeholder="Must be 20 to 60 characters"
                error={errors.name}
                {...register('name')}
              />

              <FormField
                label="Store Email Address"
                type="email"
                placeholder="storefront@domain.com"
                error={errors.email}
                {...register('email')}
              />

              <FormField
                label="Physical Address"
                type="text"
                placeholder="Store address (max 400 characters)"
                error={errors.address}
                {...register('address')}
              />

              <FormField
                label="Assigned Owner"
                type="select"
                error={errors.owner_id}
                options={[
                  { value: '', label: 'Select an Owner (Optional)...' },
                  ...owners.map((o) => ({ value: o.id.toString(), label: `${o.name} (${o.email})` }))
                ]}
                {...register('owner_id')}
              />

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setModalOpen(false); reset(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Register Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminStores;
