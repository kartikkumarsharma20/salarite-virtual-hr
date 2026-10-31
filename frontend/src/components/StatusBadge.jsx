import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';

export default function StatusBadge({ status, type = 'status', size = 'md' }) {
  if (!status) return null;

  const colorMap = type === 'priority' ? PRIORITY_COLORS : STATUS_COLORS;
  const config = colorMap[status] || {
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1',
    dot: '#94a3b8',
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        fontSize: isSmall ? '0.75rem' : '0.8125rem',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      {type === 'status' && (
        <span
          style={{
            width: isSmall ? '5px' : '6px',
            height: isSmall ? '5px' : '6px',
            borderRadius: '50%',
            backgroundColor: config.dot || config.text,
          }}
        />
      )}
      {status}
    </span>
  );
}
