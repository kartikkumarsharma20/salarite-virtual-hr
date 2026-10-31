import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  AlertCircle,
  ExternalLink,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate, formatRelativeTime, isOverdue } from '../utils/formatDate';

export default function TaskTable({
  tasks = [],
  onDelete,
  onQuickStatusChange,
  isEmployer = false,
  isVirtualHR = false,
  emptyMessage = 'No tasks found.',
}) {
  const navigate = useNavigate();

  if (!tasks || tasks.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '48px 24px',
          textAlign: 'center',
          color: '#64748b',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#94a3b8',
          }}
        >
          <Clock size={24} />
        </div>
        <h4 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '1rem', fontWeight: 600 }}>
          {emptyMessage}
        </h4>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          Try clearing your search or status filters to view existing tasks.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}
            >
              <th style={{ padding: '14px 20px' }}>Task Title</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px' }}>Priority</th>
              <th style={{ padding: '14px 16px' }}>Assignee</th>
              <th style={{ padding: '14px 16px' }}>Deadline</th>
              <th style={{ padding: '14px 16px' }}>Last Updated</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const overdue = isOverdue(task.deadline, task.status);

              return (
                <tr
                  key={task.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.1s',
                  }}
                  className="table-row-hover"
                >
                  {/* Title & Description */}
                  <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                    <div
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      style={{
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        lineHeight: 1.4,
                      }}
                      className="task-title-link"
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: '#64748b',
                          marginTop: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {task.description}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px 16px' }}>
                    <StatusBadge status={task.status} size="sm" />
                  </td>

                  {/* Priority */}
                  <td style={{ padding: '16px 16px' }}>
                    <StatusBadge status={task.priority} type="priority" size="sm" />
                  </td>

                  {/* Assignee */}
                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: task.assigned_to ? '#e0e7ff' : '#f1f5f9',
                          color: task.assigned_to ? '#4338ca' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {task.assigned_to
                          ? task.assigned_to.full_name.charAt(0).toUpperCase()
                          : '?'}
                      </div>
                      <span
                        style={{
                          color: task.assigned_to ? '#1e293b' : '#94a3b8',
                          fontWeight: 500,
                          fontSize: '0.8125rem',
                        }}
                      >
                        {task.assigned_to?.full_name || 'Unassigned'}
                      </span>
                    </div>
                  </td>

                  {/* Deadline */}
                  <td style={{ padding: '16px 16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: overdue ? '#dc2626' : '#334155',
                        fontWeight: overdue ? 600 : 400,
                        fontSize: '0.8125rem',
                      }}
                    >
                      {overdue && <AlertCircle size={14} color="#dc2626" />}
                      <span>{formatDate(task.deadline)}</span>
                    </div>
                  </td>

                  {/* Last Updated */}
                  <td style={{ padding: '16px 16px', color: '#64748b', fontSize: '0.8125rem' }}>
                    {formatRelativeTime(task.updated_at)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px',
                      }}
                    >
                      <button
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        className="btn-outline-hover"
                        title="View Task Details"
                      >
                        <ExternalLink size={13} />
                        <span>View</span>
                      </button>

                      {isEmployer && onDelete && (
                        <button
                          onClick={() => onDelete(task)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #fee2e2',
                            backgroundColor: '#fff5f5',
                            color: '#dc2626',
                            cursor: 'pointer',
                          }}
                          className="btn-danger-hover"
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
