import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const CineToast = ({
  id,
  type = 'info',
  message,
  onDismiss,
}) => {
  const iconMap = {
    success: <CheckCircle2 size={16} color="#10B981" />,
    error: <AlertCircle size={16} color="#EF4444" />,
    warning: <AlertTriangle size={16} color="#F59E0B" />,
    info: <Info size={16} color="var(--cine-accent)" />,
  };

  const borderMap = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: 'var(--cine-accent)',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 16px',
        background: 'var(--cine-surface-2)',
        border: '1px solid var(--cine-border)',
        borderLeft: `4px solid ${borderMap[type] || borderMap.info}`,
        borderRadius: 'var(--cine-radius-md)',
        boxShadow: 'var(--cine-shadow-lg)',
        color: 'var(--cine-text)',
        fontSize: '0.85rem',
        minWidth: '280px',
        maxWidth: '420px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {iconMap[type] || iconMap.info}
        <span>{message}</span>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={() => onDismiss(id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--cine-text-dim)',
            cursor: 'pointer',
            padding: '2px',
          }}
          title="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default CineToast;
