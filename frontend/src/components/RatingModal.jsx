import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';

export const RatingModal = ({ isOpen, initialValue = 0, storeName, onSubmit, onClose }) => {
  const [rating, setRating] = useState(initialValue);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setRating(initialValue || 0);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    onSubmit(rating);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
        <button
          onClick={onClose}
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

        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Submit Rating</h3>
        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Rate your experience at <strong>{storeName}</strong>:
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '2rem'
            }}
          >
            {[1, 2, 3, 4, 5].map((index) => {
              const active = hover >= index || (!hover && rating >= index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRating(index)}
                  onMouseEnter={() => setHover(index)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    padding: '4px'
                  }}
                >
                  <Star
                    size={36}
                    fill={active ? 'var(--warning)' : 'none'}
                    color={active ? 'var(--warning)' : 'var(--text-muted)'}
                    style={{ transition: 'transform 0.1s ease', transform: active ? 'scale(1.1)' : 'none' }}
                  />
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={rating < 1}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RatingModal;
