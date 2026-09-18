import React, { useState, useEffect } from 'react';
import { CineNavbar } from './CineNavbar';
import { CineFooter } from './CineFooter';
import { PageTransition } from './PageTransition';
import { GlobalSearchModal } from './GlobalSearchModal';
import { CineAIAssistant } from '../ai/CineAIAssistant';
import { CustomCursor } from '../common/CustomCursor';

export const CineLayout = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global key listener for '/' search trigger
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--cine-bg)',
        color: 'var(--cine-text)',
      }}
    >
      <CineNavbar onOpenSearch={() => setIsSearchOpen(true)} />

      <PageTransition>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </PageTransition>

      <CineFooter />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <CineAIAssistant />
      <CustomCursor />
    </div>
  );
};
