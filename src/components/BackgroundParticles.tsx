import React from 'react';

interface BackgroundParticlesProps {
  variant?: 'grammar' | 'vocab' | 'flashcards' | 'league';
}

export const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({ variant = 'grammar' }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Base soft cream page background #FBF8EE */}
      <div className="absolute inset-0 bg-[#FBF8EE]" />

      {/* Gentle ambient tints based on tab */}
      {variant === 'grammar' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#DDF3EC]/50 via-transparent to-[#DDF3EC]/30" />
      )}
      {variant === 'vocab' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#EAF6F2]/60 via-transparent to-[#DDF3EC]/20" />
      )}
      {variant === 'flashcards' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#DDF3EC]/40 via-transparent to-[#EAF6F2]/30" />
      )}
      {variant === 'league' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#DDF3EC]/50 via-transparent to-[#FBF8EE]" />
      )}

      {/* Soft nature-like illustrations: delicate leaves & rounded hill silhouettes in mint/teal */}
      <svg
        className="absolute top-16 left-6 w-16 h-16 text-[#1F9A8A]/10 animate-leaf"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C6 7.5 4 10 4 13c1.5-2.5 5-4.5 9-4.5c2 0 3.5.5 4-.5" />
      </svg>

      <svg
        className="absolute top-1/3 -right-6 w-28 h-28 text-[#DDF3EC] animate-leaf"
        style={{ animationDelay: '2s' }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="9" />
      </svg>

      <svg
        className="absolute bottom-36 left-4 w-14 h-14 text-[#1F9A8A]/10 animate-leaf"
        style={{ animationDelay: '4s' }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C6 7.5 4 10 4 13c1.5-2.5 5-4.5 9-4.5c2 0 3.5.5 4-.5" />
      </svg>

      {/* Soft nature hill curves at bottom in mint */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-28 opacity-40 text-[#DDF3EC]"
        preserveAspectRatio="none"
        viewBox="0 0 1200 120"
        fill="currentColor"
      >
        <path d="M0,40 C200,90 400,20 600,60 C800,100 1000,30 1200,70 L1200,120 L0,120 Z" />
      </svg>
    </div>
  );
};
