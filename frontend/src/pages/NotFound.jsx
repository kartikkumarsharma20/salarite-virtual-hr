import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#eef2ff',
          color: '#4f46e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 800,
          marginBottom: '20px',
        }}
      >
        404
      </div>
      <h1
        style={{
          margin: '0 0 8px',
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#0f172a',
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          margin: '0 0 24px',
          fontSize: '0.9375rem',
          color: '#64748b',
          maxWidth: '420px',
          lineHeight: 1.5,
        }}
      >
        The requested URL was not found in the Salarite Virtual HR application portal.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          className="btn-outline-hover"
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          className="btn-primary"
        >
          <Home size={16} />
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  );
}
