import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User as UserIcon, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate, formatRelativeTime, isOverdue } from '../utils/formatDate';

export default function TaskCard({ task, onStatusChange, isVirtualHR = false }) {
  const navigate = useNavigate();
  const overdue = isOverdue(task.deadline, task.status);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      className="task-card-item"
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '12px',
            flexWrap: 'wrap',
          }}
        >
          <StatusBadge status={task.status} size="sm" />
          <StatusBadge status={task.priority} type="priority" size="sm" />
        </div>

        <h4
          onClick={() => navigate(`/tasks/${task.id}`)}
          style={{
            margin: '0 0 8px',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            lineHeight: 1.4,
          }}
          className="task-title-link"
        >
          {task.title}
        </h4>

        {task.description && (
          <p
            style={{
              margin: '0 0 16px',
              fontSize: '0.875rem',
              color: '#64748b',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {task.description}
          </p>
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserIcon size={14} color="#94a3b8" />
            <span style={{ fontWeight: 500, color: '#334155' }}>
              {task.assigned_to?.full_name || 'Unassigned'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: overdue ? '#dc2626' : '#64748b',
              fontWeight: overdue ? 600 : 400,
            }}
          >
            {overdue ? <AlertCircle size={14} color="#dc2626" /> : <Calendar size={14} />}
            <span>{formatDate(task.deadline)}</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            <span>Updated {formatRelativeTime(task.updated_at)}</span>
          </div>

          <button
            onClick={() => navigate(`/tasks/${task.id}`)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              padding: '2px 6px',
            }}
          >
            View Details &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
