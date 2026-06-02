import React from 'react';

export const FormField = React.forwardRef(({ label, type = 'text', error, options, ...props }, ref) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      
      {type === 'select' ? (
        <select className="form-control" ref={ref} {...props}>
          {options && options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#1e293b', color: '#fff' }}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea className="form-control" rows="3" ref={ref} {...props} />
      ) : (
        <input className="form-control" type={type} ref={ref} {...props} />
      )}
      
      {error && <div className="form-error">{error.message}</div>}
    </div>
  );
});

FormField.displayName = 'FormField';
export default FormField;
