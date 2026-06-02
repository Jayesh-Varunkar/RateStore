import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';
import SortableTable from '../../components/SortableTable';
import StarDisplay from '../../components/StarDisplay';
import { Award, Store, Calendar, Star, Mail, User } from 'lucide-react';

export const OwnerDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Table pagination & sorting states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Load owner stores
  useEffect(() => {
    const fetchOwnerStores = async () => {
      setLoadingStores(true);
      try {
        const response = await api.get('/api/stores?limit=1000');
        if (response.success) {
          // Filter stores where owner_id matches current owner's ID
          const myStores = response.data.stores.filter((s) => s.owner_id === user.id);
          setStores(myStores);
          if (myStores.length > 0) {
            setSelectedStoreId(myStores[0].id.toString());
          }
        }
      } catch (err) {
        addToast(err.message || 'Failed to retrieve owned stores.', 'error');
      } finally {
        setLoadingStores(false);
      }
    };
    if (user) {
      fetchOwnerStores();
    }
  }, [user, addToast]);

  // Load ratings for selected store
  const fetchRatings = useCallback(async () => {
    if (!selectedStoreId) return;
    setLoadingRatings(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder
      });
      const response = await api.get(`/api/ratings/store/${selectedStoreId}?${queryParams.toString()}`);
      if (response.success) {
        setRatings(response.data.ratings);
        setAvgRating(response.data.avg_rating);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      addToast(err.message || 'Failed to retrieve store reviews.', 'error');
    } finally {
      setLoadingRatings(false);
    }
  }, [selectedStoreId, page, limit, sortBy, sortOrder, addToast]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

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

  const selectedStoreName = stores.find((s) => s.id.toString() === selectedStoreId)?.name || 'Store';

  const columns = [
    {
      key: 'name',
      label: 'Rater Name',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="var(--text-secondary)" />
          <span>{row.user?.name}</span>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Rater Email',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={16} color="var(--text-secondary)" />
          <span>{row.user?.email}</span>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Rating Value',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Star size={16} fill="var(--warning)" color="var(--warning)" />
          <span style={{ fontWeight: 600 }}>{row.value}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Date Given',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="var(--text-secondary)" />
          <span>{new Date(row.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
        </div>
      )
    }
  ];

  return (
    <div>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Store Owner Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitor review progress and rating averages for your locations.</p>
        </div>

        {/* Store Selector Dropdown */}
        {stores.length > 1 && (
          <div style={{ minWidth: '220px' }}>
            <select
              className="form-control"
              value={selectedStoreId}
              onChange={(e) => {
                setSelectedStoreId(e.target.value);
                setPage(1);
              }}
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {loadingStores ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Store size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No stores assigned</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            There are currently no stores mapped to your owner account. Please contact an administrator.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Info Cards */}
          <div className="grid-cols-2">
            {/* Display overall avg */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Store Rating
              </span>
              <div style={{ margin: '1rem 0' }}>
                <h2 style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--warning)', textShadow: '0 0 15px rgba(245, 158, 11, 0.2)' }}>
                  {avgRating ? parseFloat(avgRating).toFixed(1) : '0.0'}
                </h2>
              </div>
              <StarDisplay value={avgRating} />
            </div>

            {/* Store Information */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
                <Store size={20} color="var(--primary)" />
                Store Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Store Name</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedStoreName}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Email Address</span>
                  <span>{stores.find((s) => s.id.toString() === selectedStoreId)?.email || '-'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Location Address</span>
                  <span>{stores.find((s) => s.id.toString() === selectedStoreId)?.address || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Raters Table */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Award size={20} color="var(--primary)" />
              Customer Reviews List
            </h3>
            <SortableTable
              columns={columns}
              data={ratings}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              loading={loadingRatings}
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default OwnerDashboard;
