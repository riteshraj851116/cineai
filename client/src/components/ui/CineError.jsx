import React from 'react';
import { AlertTriangle, RefreshCw, Film } from 'lucide-react';
import { CineButton } from './CineButton';

export const CineError = ({
  title = 'WE LOST THE SIGNAL.',
  message = 'Something went wrong while communicating with the cinema servers.',
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <AlertTriangle size={26} color="var(--cine-accent)" />
      </div>

      <h3 className="cine-h3" style={{ marginBottom: '10px' }}>
        {title}
      </h3>

      <p className="cine-body-muted" style={{ marginBottom: '24px' }}>
        {message}
      </p>

      {onRetry && (
        <CineButton
          onClick={onRetry}
          variant="outline"
          icon={<RefreshCw size={14} />}
        >
          TRY AGAIN
        </CineButton>
      )}
    </div>
  );
};

export const CineEmptyState = ({
  title = 'NOTHING HERE YET.',
  message = 'No screenings or items found matching your current parameters.',
  actionLabel = 'EXPLORE MOVIES',
  onAction,
  icon,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--cine-surface-2)',
          border: '1px solid var(--cine-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          color: 'var(--cine-muted)',
        }}
      >
        {icon || <Film size={26} />}
      </div>

      <h3 className="cine-h3" style={{ marginBottom: '10px' }}>
        {title}
      </h3>

      <p className="cine-body-muted" style={{ marginBottom: '24px' }}>
        {message}
      </p>

      {onAction && (
        <CineButton onClick={onAction} variant="secondary">
          {actionLabel}
        </CineButton>
      )}
    </div>
  );
};

export default CineError;
