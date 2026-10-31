import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, ShieldCheck, UserCheck, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { user, isEmployer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
            }}
          >
            S
          </div>
          <div>
            <span
              style={{
                fontSize: '1.0625rem',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              Salarite <span style={{ color: '#4f46e5' }}>Virtual HR</span>
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Live sync pulse indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            fontSize: '0.75rem',
            color: '#166534',
            fontWeight: 600,
          }}
          className="live-sync-badge"
          title="Automatic polling active every 3-5 seconds"
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'inline-block',
              boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)',
            }}
            className="pulse-dot"
          />
          <span>Live Sync</span>
        </div>

        {/* User profile and role */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                lineHeight: 1.2,
              }}
              className="user-info-text"
            >
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                {user.full_name}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: isEmployer ? '#4f46e5' : '#059669',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {isEmployer ? 'Employer' : 'Virtual HR'}
              </span>
            </div>

            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isEmployer ? '#e0e7ff' : '#ecfdf5',
                color: isEmployer ? '#4338ca' : '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: `2px solid ${isEmployer ? '#c7d2fe' : '#a7f3d0'}`,
              }}
            >
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="btn-outline-hover"
              title="Sign Out"
            >
              <LogOut size={15} />
              <span className="logout-text">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
