import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              backgroundColor: 'var(--cine-surface-2)',
              border: `1px solid ${
                t.type === 'success'
                  ? 'var(--cine-success)'
                  : t.type === 'error'
                  ? 'var(--cine-error)'
                  : 'var(--cine-border)'
              }`,
              borderRadius: 'var(--cine-radius-sm)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.85)',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-sans)',
              minWidth: '260px',
              maxWidth: '380px',
              animation: 'cine-slide-up 0.25s ease-out',
            }}
          >
            {t.type === 'success' && <CheckCircle2 size={16} color="var(--cine-success)" />}
            {t.type === 'error' && <AlertCircle size={16} color="var(--cine-error)" />}
            {t.type === 'info' && <Info size={16} color="var(--cine-accent)" />}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'none', border: 'none', color: 'var(--cine-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useCineToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useCineToast must be used within a ToastProvider');
  }
  return context;
};
