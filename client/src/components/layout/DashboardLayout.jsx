import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Film,
  Building2,
  Calendar,
  Ticket,
  Users,
  Star,
  Tag,
  Utensils,
  BarChart2,
  Sparkles,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';
import { CineButton } from '../ui/CineButton';
import { CineBadge } from '../ui/CineBadge';

export const DashboardLayout = ({ children, title = 'CINEMA CONTROL ROOM' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: <LayoutDashboard size={16} /> },
    { label: 'Catalogue', path: '/admin?tab=movies', icon: <Film size={16} /> },
    { label: 'Multiplexes', path: '/admin?tab=theatres', icon: <Building2 size={16} /> },
    { label: 'Show Schedules', path: '/admin?tab=shows', icon: <Calendar size={16} /> },
    { label: 'Admissions', path: '/admin?tab=bookings', icon: <Ticket size={16} /> },
    { label: 'Analytics', path: '/admin?tab=analytics', icon: <BarChart2 size={16} /> },
    { label: 'AI Copilot', path: '/admin?tab=ai', icon: <Sparkles size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cine-bg)', color: 'var(--cine-text)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          background: 'var(--cine-surface-1)',
          borderRight: '1px solid var(--cine-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 800,
          transform: isSidebarOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--cine-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cine-text)', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>CINEAI</span>
            <CineBadge variant="primary">ADMIN</CineBadge>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--cine-text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 12px 4px 12px' }}>
            CONTROL ROOM MODULES
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname + location.search === item.path || (item.path === '/admin' && location.pathname === '/admin' && !location.search);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--cine-radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: isActive ? '#FFFFFF' : 'var(--cine-text-muted)',
                  background: isActive ? 'var(--cine-surface-3)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--cine-accent)' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ color: isActive ? 'var(--cine-accent)' : 'currentColor' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Return to Site */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--cine-border)', display: 'grid', gap: '10px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: 'var(--cine-text-muted)',
              textDecoration: 'none',
              padding: '6px 0',
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Public Platform</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--cine-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--cine-radius-full)',
                  background: 'var(--cine-accent)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                {user?.name || 'Admin'}
              </div>
            </div>

            <button
              onClick={logout}
              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px' }}
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            height: '64px',
            background: 'var(--cine-surface-1)',
            borderBottom: '1px solid var(--cine-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 700,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ display: 'none', background: 'none', border: 'none', color: 'var(--cine-text)', cursor: 'pointer' }}
              className="cine-mobile-nav-toggle"
            >
              <Menu size={20} />
            </button>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.04em' }}>
              {title}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              OPERATIONAL
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main style={{ flex: 1, padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
