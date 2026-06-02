import React from 'react';
import { Star } from 'lucide-react';

export const StarDisplay = ({ value = 0 }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(
        <Star key={i} size={16} fill="var(--warning)" color="var(--warning)" />
      );
    } else if (value > i - 1) {
      // Draw a half-filled star using overlay clippings
      stars.push(
        <div key={i} style={{ position: 'relative', display: 'inline-block', width: '16px', height: '16px' }}>
          <Star size={16} color="var(--text-muted)" style={{ position: 'absolute', top: 0, left: 0 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden', height: '16px' }}>
            <Star size={16} fill="var(--warning)" color="var(--warning)" />
          </div>
        </div>
      );
    } else {
      stars.push(
        <Star key={i} size={16} color="var(--text-muted)" />
      );
    }
  }

  return (
    <div className="star-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'inline-flex', gap: '2px' }}>{stars}</div>
      {value > 0 ? (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
          {parseFloat(value).toFixed(1)}
        </span>
      ) : (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not Rated</span>
      )}
    </div>
  );
};
export default StarDisplay;
