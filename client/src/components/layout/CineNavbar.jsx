import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import { useNotifications } from '../../context/NotificationContext';
import { CityModal } from '../common/CityModal';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { AuthModal } from '../common/AuthModal';
import { CineAvatar } from '../ui/CineAvatar';
import { CineButton } from '../ui/CineButton';
import { CineDrawer } from '../ui/CineDrawer';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Ticket,
  Film,
  Sparkles,
  MapPin,
  Bookmark,
  Gift,
} from 'lucide-react';

export const CineNavbar = ({ onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Movies', path: '/movies' },
    { label: 'Cinemas', path: '/cinemas' },
    { label: 'Community', path: '/community' },
    { label: 'AI', path: '/ai' },
  ];

  const isLinkActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 900,
          width: '100%',
          backgroundColor: scrolled ? 'rgba(16, 63, 58, 0.96)' : 'rgba(16, 63, 58, 0.9)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--cine-border)',
          transition: 'background-color 0.25s ease, border-color 0.25s ease',
        }}
      >
        <div className="cine-page-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 'var(--cine-nav-height)',
              gap: '24px',
            }}
          >
            {/* 1. Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--cine-font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: '#FFFFFF',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cine-accent)',
                  }}
                />
                <span>CINEAI</span>
              </Link>

              {/* 2. Desktop Navigation Links */}
              <nav
                className="desktop-only"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '28px',
                }}
              >
                {navLinks.map((link) => {
                  const active = isLinkActive(link.path);
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: active ? '#FFFFFF' : 'var(--cine-muted)',
                        position: 'relative',
                        transition: 'color var(--cine-transition-fast)',
                        padding: '4px 0',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.color = 'var(--cine-muted)';
                      }}
                    >
                      {link.label}
                      {active && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            left: 0,
                            right: 0,
                            height: '2px',
                            backgroundColor: 'var(--cine-accent)',
                            borderRadius: '1px',
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* 3. Right Utility Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Search Trigger Capsule */}
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Search movies and cinemas"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 14px',
                  borderRadius: 'var(--cine-radius-full)',
                  backgroundColor: 'var(--cine-surface)',
                  border: '1px solid var(--cine-border)',
                  color: 'var(--cine-muted)',
                  fontSize: '0.8125rem',
                  transition: 'border-color var(--cine-transition-fast), color var(--cine-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--cine-border-hover)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--cine-border)';
                  e.currentTarget.style.color = 'var(--cine-muted)';
                }}
              >
                <Search size={14} />
                <span className="desktop-only">Search movies, cinemas...</span>
                <kbd
                  className="desktop-only"
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--cine-surface-2)',
                    fontSize: '0.68rem',
                    color: 'var(--cine-dim)',
                    fontFamily: 'var(--cine-font-mono)',
                    border: '1px solid var(--cine-border)',
                  }}
                >
                  /
                </kbd>
              </button>

              {/* City Hub Selector */}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="desktop-only"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--cine-radius-md)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--cine-border)',
                  color: 'var(--cine-text-secondary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  transition: 'all var(--cine-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--cine-surface)';
                  e.currentTarget.style.borderColor = 'var(--cine-border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--cine-border)';
                }}
              >
                <MapPin size={13} color="var(--cine-accent)" />
                <span>{selectedCity?.toUpperCase() || 'MUMBAI'}</span>
                <ChevronDown size={13} color="var(--cine-muted)" />
              </button>

              {/* Notification Bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  aria-label="View notifications"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--cine-radius-md)',
                    backgroundColor: isNotifOpen ? 'var(--cine-surface-2)' : 'transparent',
                    border: '1px solid var(--cine-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isNotifOpen ? '#FFFFFF' : 'var(--cine-muted)',
                    position: 'relative',
                    transition: 'all var(--cine-transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'var(--cine-border-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isNotifOpen) {
                      e.currentTarget.style.color = 'var(--cine-muted)';
                      e.currentTarget.style.borderColor = 'var(--cine-border)';
                    }
                  }}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        backgroundColor: 'var(--cine-accent)',
                        color: '#FFFFFF',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--cine-bg)',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
                )}
              </div>

              {/* User Profile / Auth Actions */}
              {user ? (
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '4px 8px 4px 4px',
                      borderRadius: 'var(--cine-radius-full)',
                      backgroundColor: isUserMenuOpen ? 'var(--cine-surface-2)' : 'transparent',
                      border: '1px solid var(--cine-border)',
                      transition: 'all var(--cine-transition-fast)',
                    }}
                  >
                    <CineAvatar src={user.avatar} name={user.name} size={30} />
                    <span
                      className="desktop-only"
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={13} color="var(--cine-muted)" />
                  </button>

                  {/* Profile Dropdown */}
                  {isUserMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '220px',
                        backgroundColor: 'var(--cine-surface)',
                        border: '1px solid var(--cine-border)',
                        borderRadius: 'var(--cine-radius-lg)',
                        padding: '6px',
                        boxShadow: 'var(--cine-shadow-lg)',
                        zIndex: 950,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        animation: 'cineFadeIn 0.15s ease-out',
                      }}
                    >
                      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--cine-border-subtle)', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cine-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--cine-radius-sm)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--cine-text)',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cine-surface-2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <User size={15} color="var(--cine-muted)" />
                        <span>Profile & Preferences</span>
                      </Link>

                      <Link
                        to="/bookings"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--cine-radius-sm)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--cine-text)',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cine-surface-2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Ticket size={15} color="var(--cine-muted)" />
                        <span>My Bookings</span>
                      </Link>

                      <Link
                        to="/watchlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--cine-radius-sm)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--cine-text)',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cine-surface-2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Bookmark size={15} color="var(--cine-muted)" />
                        <span>My Watchlist</span>
                      </Link>

                      <Link
                        to="/rewards"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--cine-radius-sm)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--cine-text)',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cine-surface-2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Gift size={15} color="var(--cine-gold)" />
                        <span>CinePoints & Rewards</span>
                      </Link>

                      {(user.role === 'admin' || user.role === 'theatreOwner') && (
                        <Link
                          to={user.role === 'admin' ? '/admin' : '/theatre-owner'}
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: 'var(--cine-radius-sm)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'var(--cine-accent)',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cine-surface-2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <LayoutDashboard size={15} />
                          <span>{user.role === 'admin' ? 'Control Room' : 'Partner Suite'}</span>
                        </Link>
                      )}

                      <div style={{ borderTop: '1px solid var(--cine-border-subtle)', marginTop: '4px', paddingTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: 'var(--cine-radius-sm)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#EF4444',
                            textAlign: 'left',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CineButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenAuth('login')}
                  >
                    Log In
                  </CineButton>
                  <CineButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenAuth('register')}
                  >
                    Sign Up
                  </CineButton>
                </div>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                className="mobile-only"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open mobile menu"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--cine-radius-md)',
                  border: '1px solid var(--cine-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <CineDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="NAVIGATION"
        position="right"
        width="300px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* City Selector on Mobile */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsCityModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 'var(--cine-radius-md)',
              backgroundColor: 'var(--cine-surface-2)',
              border: '1px solid var(--cine-border)',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--cine-accent)" />
              <span>Location: {selectedCity?.toUpperCase() || 'MUMBAI'}</span>
            </div>
            <ChevronDown size={14} color="var(--cine-muted)" />
          </button>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--cine-radius-md)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: active ? 'var(--cine-accent)' : '#FFFFFF',
                    backgroundColor: active ? 'var(--cine-surface-2)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Auth actions if logged out */}
          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--cine-border)', paddingTop: '16px' }}>
              <CineButton
                variant="primary"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleOpenAuth('login');
                }}
                style={{ width: '100%' }}
              >
                Log In
              </CineButton>
              <CineButton
                variant="outline"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleOpenAuth('register');
                }}
                style={{ width: '100%' }}
              >
                Create Account
              </CineButton>
            </div>
          )}
        </div>
      </CineDrawer>

      {/* Global City Selection Modal */}
      <CityModal />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
      />

      <style>{`
        @media (max-width: 860px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
        @media (min-width: 861px) {
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default CineNavbar;
