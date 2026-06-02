import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/Toast';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import StarDisplay from '../../components/StarDisplay';
import RatingModal from '../../components/RatingModal';
import useDebounce from '../../hooks/useDebounce';
import { Star } from 'lucide-react';

export const UserStores = () => {
  const { addToast } = useToast();

  // State managers
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Search/Filter states
  const [filterValues, setFilterValues] = useState({
    name: '',
    address: ''
  });

  const debouncedFilters = useDebounce(filterValues, 300);

  // Rating modal states
  const [selectedStore, setSelectedStore] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
      addToast(err.message || 'Failed to retrieve stores.', 'error');
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

  // Open modal handler
  const handleOpenRating = (store) => {
    setSelectedStore(store);
    setModalOpen(true);
  };

  // Submit rating to API
  const handleRatingSubmit = async (ratingValue) => {
    try {
      const response = await api.post('/api/ratings', {
        store_id: selectedStore.id,
        value: ratingValue
      });
      if (response.success) {
        addToast(
          response.data.action === 'created'
            ? 'Rating submitted successfully!'
            : 'Rating updated successfully!',
          'success'
        );
        setModalOpen(false);
        setSelectedStore(null);
        fetchStores(); // Reload store list to recompute ratings
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit rating.', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'avg_rating',
      label: 'Overall Rating',
      sortable: true,
      render: (row) => <StarDisplay value={row.avg_rating} />
    },
    {
      key: 'my_rating',
      label: 'My Rating',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {row.my_rating !== null ? (
            <>
              <Star size={16} fill="var(--warning)" color="var(--warning)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{row.my_rating}</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not Rated</span>
          )}
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <button
          className={`btn ${row.my_rating !== null ? 'btn-secondary' : 'btn-primary'}`}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenRating(row);
          }}
        >
          {row.my_rating !== null ? 'Edit Rating' : 'Submit Rating'}
        </button>
      )
    }
  ];

  return (
    <div>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Browse & Rate Stores</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Find stores in your location and submit or update your reviews.</p>
        </div>
      </header>

      <FilterBar
        filters={[
          { key: 'name', label: 'Store Name', type: 'text', placeholder: 'Filter by name...' },
          { key: 'address', label: 'Address', type: 'text', placeholder: 'Filter by location...' }
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

      <RatingModal
        isOpen={modalOpen}
        initialValue={selectedStore?.my_rating || 0}
        storeName={selectedStore?.name || ''}
        onSubmit={handleRatingSubmit}
        onClose={() => {
          setModalOpen(false);
          setSelectedStore(null);
        }}
      />
    </div>
  );
};
export default UserStores;
