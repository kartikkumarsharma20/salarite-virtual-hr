import React from 'react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  colorScheme = 'indigo',
  subtitle,
  onClick,
}) {
  const schemeStyles = {
    indigo: {
      bg: '#eef2ff',
      iconColor: '#4f46e5',
      borderColor: '#e0e7ff',
    },
    orange: {
      bg: '#fffbeb',
      iconColor: '#f59e0b',
      borderColor: '#fef3c7',
    },
    blue: {
      bg: '#eff6ff',
      iconColor: '#3b82f6',
      borderColor: '#dbeafe',
    },
    green: {
      bg: '#ecfdf5',
      iconColor: '#10b981',
      borderColor: '#d1fae5',
    },
    red: {
      bg: '#fef2f2',
      iconColor: '#ef4444',
      borderColor: '#fee2e2',
    },
    purple: {
      bg: '#faf5ff',
      iconColor: '#a855f7',
      borderColor: '#f3e8ff',
    },
  }[colorScheme] || {
    bg: '#f8fafc',
    iconColor: '#64748b',
    borderColor: '#e2e8f0',
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      className="stat-card"
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.1,
          }}
        >
          {value}
        </p>
        {subtitle && (
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontWeight: 500,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: schemeStyles.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: schemeStyles.iconColor,
            flexShrink: 0,
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
