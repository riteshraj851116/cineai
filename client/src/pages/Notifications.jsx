import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  CinePageHeader,
  CineButton,
  CineBadge,
  CineLoader,
  CineEmptyState,
} from '../components/ui';
import {
  Bell,
  CheckCircle2,
  Ticket,
  Calendar,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchUnreadCount } = useNotifications() || {};

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationService.getNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const { data } = await notificationService.markAsRead(id);
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        if (fetchUnreadCount) fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data } = await notificationService.markAllAsRead();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        if (fetchUnreadCount) fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '70vh', padding: '120px 24px' }}>
        <CineEmptyState
          title="AUTHENTICATION REQUIRED"
          description="Log in to view your real-time booking alerts, ticket updates, and personalized cinema offers."
          actionText="LOG IN"
          onAction={() => navigate('/profile')}
        />
      </div>
    );
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '96px', paddingTop: '40px' }}>
      <div className="cine-page-container">
        <CinePageHeader
          eyebrow="PATRON DISPATCH"
          title="NOTIFICATIONS"
          subtitle="Real-time alerts, admission confirmations, acoustic cinema updates, and reward disbursements."
        />

        {/* Action & Filter Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'UNREAD'].map((tab) => {
              const isSelected = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  style={{
                    padding: '8px 18px',
                    background: isSelected ? 'var(--cine-accent)' : 'var(--cine-surface)',
                    border: `1px solid ${isSelected ? 'var(--cine-accent)' : 'var(--cine-border)'}`,
                    borderRadius: 'var(--cine-radius-md)',
                    color: isSelected ? '#FFFFFF' : 'var(--cine-muted)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tab === 'UNREAD' ? `UNREAD (${unreadCount})` : `ALL (${notifications.length})`}
                </button>
              );
            })}
          </div>

          {/* Mark all read button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--cine-muted)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={14} color="var(--cine-emerald)" />
              <span>MARK ALL AS READ</span>
            </button>
          )}
        </div>

        {/* Notifications Feed */}
        {loading ? (
          <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CineLoader text="RETRIEVING DISPATCHES & ALERTS..." />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <CineEmptyState
            title={filter === 'UNREAD' ? 'NO UNREAD NOTIFICATIONS' : 'NO NOTIFICATIONS FOUND'}
            description="You are completely up to date. Screening passes and booking receipts will appear here."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredNotifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif._id}
                  style={{
                    backgroundColor: isUnread ? 'var(--cine-surface-2)' : 'var(--cine-surface)',
                    border: `1px solid ${isUnread ? 'var(--cine-accent)' : 'var(--cine-border)'}`,
                    borderRadius: 'var(--cine-radius-lg)',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: isUnread ? 'rgba(229, 9, 20, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: isUnread ? 'var(--cine-accent)' : 'var(--cine-muted)',
                      }}
                    >
                      {notif.type === 'booking' ? (
                        <Ticket size={20} />
                      ) : notif.type === 'cancellation' ? (
                        <AlertCircle size={20} />
                      ) : (
                        <Bell size={20} />
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--cine-text)', margin: 0 }}>
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--cine-accent)',
                              display: 'inline-block',
                            }}
                          />
                        )}
                      </div>

                      <p style={{ color: 'var(--cine-text-secondary)', fontSize: '0.88rem', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                        {notif.message}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--cine-muted)', fontSize: '0.74rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          <span>{new Date(notif.createdAt).toLocaleString()}</span>
                        </div>

                        {notif.metadata?.bookingId && (
                          <Link
                            to={`/ticket/${notif.metadata.bookingId}`}
                            style={{
                              color: 'var(--cine-accent)',
                              fontWeight: 800,
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>VIEW TICKET PASS</span>
                            <ArrowRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mark as read button if unread */}
                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      title="Mark as read"
                      style={{
                        background: 'none',
                        border: '1px solid var(--cine-border)',
                        borderRadius: 'var(--cine-radius-sm)',
                        padding: '6px 12px',
                        color: 'var(--cine-muted)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      MARK READ
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
