import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CineModal } from '../ui/CineModal';
import { CineInput } from '../ui/CineInput';
import { CineSelect } from '../ui/CineSelect';
import { CineButton } from '../ui/CineButton';
import { Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();

  useEffect(() => {
    setIsRegister(initialMode === 'register');
    setError('');
  }, [initialMode, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({ name, email, password, role });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setError('');
    setSubmitting(true);
    try {
      await login(demoEmail, demoPassword);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CineModal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Join CineAI' : 'Sign in to CineAI'}
      maxWidth="480px"
    >
      <p style={{ color: 'var(--cine-muted)', fontSize: '0.85rem', marginTop: '-10px', marginBottom: '20px', lineHeight: 1.5 }}>
        {isRegister
          ? 'Create your account to unlock smart cinema recommendations and priority seat reservations.'
          : 'Access your active reservations, digital passes, and personalized cinema DNA.'}
      </p>

      {error && (
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--cine-radius-md)',
            color: '#EF4444',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* 1-Click Fast Evaluator Demo Access */}
      <div
        style={{
          padding: '14px',
          backgroundColor: 'var(--cine-surface-2)',
          border: '1px solid var(--cine-border)',
          borderRadius: 'var(--cine-radius-md)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--cine-accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          <Sparkles size={13} /> Quick Demo Access (1-Click)
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <CineButton
            variant="outline"
            size="sm"
            onClick={() => handleQuickDemoLogin('admin@cineai.com', 'Admin@123')}
          >
            Admin
          </CineButton>
          <CineButton
            variant="outline"
            size="sm"
            onClick={() => handleQuickDemoLogin('owner@cineai.com', 'Owner@123')}
          >
            Theatre Partner
          </CineButton>
          <CineButton
            variant="outline"
            size="sm"
            onClick={() => handleQuickDemoLogin('user@cineai.com', 'User@123')}
          >
            Patron User
          </CineButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {isRegister && (
          <CineInput
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aryan Khan"
            icon={User}
          />
        )}

        <CineInput
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          icon={Mail}
        />

        <CineInput
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={Lock}
        />

        {isRegister && (
          <CineSelect
            label="Account Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'user', label: 'Moviegoer / Patron' },
              { value: 'theatreOwner', label: 'Theatre Owner / Exhibitor' },
            ]}
          />
        )}

        <CineButton
          type="submit"
          variant="primary"
          loading={submitting}
          style={{ width: '100%', marginTop: '6px' }}
        >
          {isRegister ? 'Create Account' : 'Sign In'}
        </CineButton>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8125rem', color: 'var(--cine-muted)' }}>
        {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          style={{ color: '#FFFFFF', fontWeight: 700, marginLeft: '4px', textDecoration: 'underline' }}
        >
          {isRegister ? 'Sign In' : 'Register now'}
        </button>
      </div>
    </CineModal>
  );
};

export default AuthModal;
