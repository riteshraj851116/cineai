import React from 'react';
import { Film, AlertCircle, RefreshCw } from 'lucide-react';
import { CineButton } from './CineButton';

export const CineEmptyState = ({
  icon: Icon = Film,
  title = 'NO RESULTS FOUND',
  message = 'Try adjusting your filters or search terms.',
  actionLabel,
  onAction,
  minHeight = '360px',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        minHeight,
        background: 'var(--cine-surface)',
        border: '1px dashed var(--cine-border)',
        borderRadius: 'var(--cine-radius-lg)',
        margin: '20px 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--cine-surface-2)',
          border: '1px solid var(--cine-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--cine-muted)',
          marginBottom: '16px',
        }}
      >
        <Icon size={26} />
      </div>
      <h3 style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--cine-muted)', fontSize: '0.9rem', maxWidth: '420px', lineHeight: 1.5, marginBottom: actionLabel ? '24px' : '0' }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <CineButton variant="secondary" onClick={onAction}>
          {actionLabel}
        </CineButton>
      )}
    </div>
  );
};

export const CineErrorState = ({
  title = 'UNABLE TO LOAD DATA',
  message = 'An unexpected network error occurred while communicating with CineAI servers.',
  onRetry,
  minHeight = '320px',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        minHeight,
        background: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 'var(--cine-radius-lg)',
        margin: '20px 0',
      }}
    >
      <AlertCircle size={36} color="#EF4444" style={{ marginBottom: '14px' }} />
      <h3 style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--cine-muted)', fontSize: '0.875rem', maxWidth: '440px', lineHeight: 1.5, marginBottom: '20px' }}>
        {message}
      </p>
      {onRetry && (
        <CineButton variant="outline" onClick={onRetry} icon={RefreshCw}>
          TRY AGAIN
        </CineButton>
      )}
    </div>
  );
};

export default CineEmptyState;
