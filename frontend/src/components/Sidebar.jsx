import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  PlusCircle,
  Calendar,
  CalendarPlus,
  Briefcase,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { isEmployer, isVirtualHR } = useAuth();

  const employerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Task Management', icon: CheckSquare },
    { to: '/tasks/create', label: 'Create Task', icon: PlusCircle },
    { to: '/interviews', label: 'Interviews', icon: Calendar },
    { to: '/interviews/schedule', label: 'Schedule Interview', icon: CalendarPlus },
  ];

  const virtualHRLinks = [
    { to: '/virtual-hr/tasks', label: 'Assigned Tasks', icon: CheckSquare },
    { to: '/dashboard', label: 'Workspace Overview', icon: LayoutDashboard },
  ];

  const navLinks = isEmployer ? employerLinks : virtualHRLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 40,
            display: 'block',
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: '240px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          transition: 'transform 0.2s ease-in-out',
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        <div style={{ padding: '16px 12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px 16px',
            }}
            className="mobile-close-header"
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Navigation
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
              }}
              className="mobile-close-btn"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    color: isActive ? '#4f46e5' : '#475569',
                    backgroundColor: isActive ? '#eef2ff' : 'transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Role Badge */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#f8fafc',
            margin: '0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isEmployer ? '#e0e7ff' : '#ecfdf5',
                color: isEmployer ? '#4f46e5' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={16} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  textTransform: 'uppercase',
                }}
              >
                Active Role
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#1e293b',
                }}
              >
                {isEmployer ? 'Employer Director' : 'Virtual HR Specialist'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
