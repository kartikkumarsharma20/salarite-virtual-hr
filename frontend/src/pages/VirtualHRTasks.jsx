import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Search,
  Filter,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  MessageSquare,
  Edit3,
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatRelativeTime, isOverdue } from '../utils/formatDate';

export default function VirtualHRTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal status update state
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [progressNote, setProgressNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState(null);

  const { tasks, loading, error, updateTaskStatus } = useTasks({
    isVirtualHR: true,
    status: statusFilter,
    priority: priorityFilter,
    search: searchTerm,
    autoPoll: true,
    pollInterval: 4000,
  });

  const openStatusModal = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setProgressNote('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setUpdating(true);
    try {
      await updateTaskStatus(selectedTask.id, newStatus, progressNote);
      setNotification({
        type: 'success',
        message: `Task "${selectedTask.title}" status updated to ${newStatus}!`,
      });
      setSelectedTask(null);
    } catch (err) {
      setNotification({
        type: 'error',
        message:
          err.response?.data?.detail || err.message || 'Failed to update task status.',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Metrics for Virtual HR user
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status?.toLowerCase() === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status?.toLowerCase() === 'in progress').length;
  const completedCount = tasks.filter((t) => t.status?.toLowerCase() === 'completed').length;
  const blockedCount = tasks.filter((t) => t.status?.toLowerCase() === 'blocked').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title */}
      <div>
        <h1
          style={{
            margin: '0 0 4px',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
          }}
        >
          My Assigned HR Tasks
        </h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Dedicated workspace for {user?.full_name}. Update progress, resolve blockers, and complete workflows.
        </p>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {error && <Notification type="error" message={error} onClose={() => {}} />}

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '14px',
        }}
      >
        <StatCard
          title="Assigned Tasks"
          value={totalCount}
          icon={CheckSquare}
          colorScheme="indigo"
          subtitle="Total assigned"
          onClick={() => setStatusFilter('All')}
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={Clock}
          colorScheme="orange"
          subtitle="To begin"
          onClick={() => setStatusFilter('Pending')}
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={PlayCircle}
          colorScheme="blue"
          subtitle="Underway"
          onClick={() => setStatusFilter('In Progress')}
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
          colorScheme="green"
          subtitle="Closed out"
          onClick={() => setStatusFilter('Completed')}
        />
        <StatCard
          title="Blocked"
          value={blockedCount}
          icon={AlertOctagon}
          colorScheme="red"
          subtitle="Need assistance"
          onClick={() => setStatusFilter('Blocked')}
        />
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              display: 'flex',
            }}
          >
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search my tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              color: '#0f172a',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
            className="input-focus"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8125rem',
              color: '#334155',
              backgroundColor: '#ffffff',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8125rem',
              color: '#334155',
              backgroundColor: '#ffffff',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Task List Table for Virtual HR */}
      {loading && tasks.length === 0 ? (
        <LoadingSpinner message="Loading assigned tasks..." />
      ) : tasks.length === 0 ? (
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
          <CheckSquare size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '1.0625rem', fontWeight: 600 }}>
            No tasks found in your queue
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            All assigned tasks have either been completed or none match your filter criteria.
          </p>
        </div>
      ) : (
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
                  <th style={{ padding: '14px 20px' }}>Task & Instructions</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px' }}>Priority</th>
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
                      <td style={{ padding: '16px 20px', maxWidth: '320px' }}>
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

                      <td style={{ padding: '16px 16px' }}>
                        <StatusBadge status={task.status} size="sm" />
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        <StatusBadge status={task.priority} type="priority" size="sm" />
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        <span
                          style={{
                            color: overdue ? '#dc2626' : '#334155',
                            fontWeight: overdue ? 600 : 400,
                            fontSize: '0.8125rem',
                          }}
                        >
                          {formatDate(task.deadline)}
                        </span>
                      </td>

                      <td style={{ padding: '16px 16px', color: '#64748b', fontSize: '0.8125rem' }}>
                        {formatRelativeTime(task.updated_at)}
                      </td>

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
                            onClick={() => openStatusModal(task)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #c7d2fe',
                              backgroundColor: '#eef2ff',
                              color: '#4338ca',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            className="btn-secondary-hover"
                          >
                            <Edit3 size={13} />
                            <span>Update Status</span>
                          </button>

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
                          >
                            <span>Details</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Status Update Modal */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title="Update Task Status & Progress"
        footer={
          <>
            <button
              onClick={() => setSelectedTask(null)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleStatusSubmit}
              disabled={updating}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: updating ? 'not-allowed' : 'pointer',
                opacity: updating ? 0.75 : 1,
              }}
              className="btn-primary"
            >
              {updating ? 'Saving...' : 'Confirm Update'}
            </button>
          </>
        }
      >
        <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '0.8125rem', color: '#64748b' }}>
              Selected Task:
            </p>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              {selectedTask?.title}
            </p>
          </div>

          <div>
            <label
              htmlFor="modal_status"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              New Workflow Status <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="modal_status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
              }}
              className="input-focus"
            >
              <option value="Pending">Pending (Not Started)</option>
              <option value="In Progress">In Progress (Active)</option>
              <option value="Completed">Completed (Delivered)</option>
              <option value="Blocked">Blocked (Escalation / Waiting)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="progress_note"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Progress Note (Optional)
            </label>
            <textarea
              id="progress_note"
              rows={3}
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              placeholder="e.g. Completed initial document screening; candidate requested 2 days extension..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                color: '#0f172a',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
              className="input-focus"
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              This note will be automatically added to the task audit trail visible to the Employer.
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
}
