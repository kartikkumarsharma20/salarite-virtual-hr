import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({
  type = 'info',
  message,
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: '#ecfdf5',
      border: '#a7f3d0',
      text: '#065f46',
      icon: <CheckCircle2 size={18} color="#059669" />,
    },
    error: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#991b1b',
      icon: <AlertCircle size={18} color="#dc2626" />,
    },
    info: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#1e40af',
      icon: <Info size={18} color="#2563eb" />,
    },
  }[type] || {
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
    icon: <Info size={18} color="#2563eb" />,
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: typeConfig.bg,
        border: `1px solid ${typeConfig.border}`,
        color: typeConfig.text,
        fontSize: '0.875rem',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        marginBottom: '16px',
        animation: 'fadeIn 0.2s ease-in-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {typeConfig.icon}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: typeConfig.text,
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8,
          }}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
