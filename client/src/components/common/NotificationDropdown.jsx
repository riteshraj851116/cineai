import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, Ticket, DollarSign, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Ticket size={18} style={{ color: 'var(--cine-accent)' }} />;
      case 'payment':
        return <DollarSign size={18} style={{ color: '#10B981' }} />;
      default:
        return <Info size={18} style={{ color: '#F59E0B' }} />;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '55px',
        right: '0',
        width: '360px',
        background: 'var(--cine-surface-2)',
        border: '1px solid var(--cine-border)',
        borderRadius: 'var(--cine-radius-md)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--cine-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: 'var(--cine-accent)' }} />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--cine-font-heading)', letterSpacing: '0.04em', margin: 0 }}>
            NOTIFICATIONS
          </h4>
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--cine-accent)',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '999px',
            }}>
              {unreadCount} NEW
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              fontSize: '0.72rem',
              color: 'var(--cine-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--cine-muted)', fontSize: '0.85rem' }}>
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                markAsRead(n._id);
                if (n.metadata?.bookingId) {
                  navigate(`/ticket/${n.metadata.bookingId}`);
                  onClose();
                }
              }}
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--cine-border)',
                background: n.read ? 'transparent' : 'rgba(255, 64, 56, 0.06)',
                cursor: 'pointer',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: n.read ? 600 : 700, color: '#fff', marginBottom: '2px' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--cine-muted)', lineHeight: 1.4 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--cine-muted)', opacity: 0.7, marginTop: '4px' }}>
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
