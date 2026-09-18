import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export class CineErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CineAI Error Boundary Caught]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: 'var(--cine-bg)',
            color: 'var(--cine-text)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <AlertOctagon size={32} color="var(--cine-accent)" />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.4rem',
              letterSpacing: '0.04em',
              marginBottom: '10px',
              color: '#FFFFFF',
            }}
          >
            CINEAI HIT A RARE GLITCH.
          </h2>

          <p
            style={{
              color: 'var(--cine-muted)',
              fontSize: '0.9rem',
              maxWidth: '460px',
              marginBottom: '28px',
              lineHeight: 1.5,
            }}
          >
            An isolated component encountered an unexpected interruption. The core booking engine remains protected.
          </p>

          <button
            onClick={this.handleReload}
            className="cine-btn cine-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RotateCcw size={16} />
            <span>RELOAD EXPERIENCE</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
