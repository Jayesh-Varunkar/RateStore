import React from 'react';

export const FilterBar = ({ filters = [], values = {}, onChange }) => {
  return (
    <div className="filter-bar">
      {filters.map((filter) => {
        if (filter.type === 'select') {
          return (
            <div key={filter.key} className="filter-input" style={{ minWidth: '160px' }}>
              <select
                className="form-control"
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
              >
                <option value="">All {filter.label}s</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={filter.key} className="filter-input" style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              className="form-control"
              placeholder={filter.placeholder || `Filter by ${filter.label}...`}
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
};
export default FilterBar;
