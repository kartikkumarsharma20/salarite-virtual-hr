import React from 'react';

export default function LoadingSpinner({ size = 'md', message = 'Loading...', fullScreen = false }) {
  const spinnerSize = size === 'sm' ? 18 : size === 'lg' ? 40 : 28;

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px',
        color: '#64748b',
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          border: '3px solid #e2e8f0',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
        }}
      />
      {message && <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}
