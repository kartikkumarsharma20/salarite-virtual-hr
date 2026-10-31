import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Shield,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Activity,
} from 'lucide-react';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatDateTime, formatRelativeTime, isOverdue } from '../utils/formatDate';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isEmployer } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  // Status update inline form
  const [statusVal, setStatusVal] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Edit details modal for employer
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [virtualHRUsers, setVirtualHRUsers] = useState([]);
  const [editSaving, setEditSaving] = useState(false);

  const isFetchingRef = useRef(false);

  const fetchTask = useCallback(async (isBackground = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!isBackground) setLoading(true);

    try {
      const data = await taskService.getTaskById(id);
      setTask(data);
      if (!isBackground) {
        setStatusVal(data.status);
      }
      setError('');
    } catch (err) {
      if (!isBackground) {
        setError(err.response?.data?.detail || 'Task not found or error loading details.');
      }
    } finally {
      if (!isBackground) setLoading(false);
      isFetchingRef.current = false;
    }
  }, [id]);

  useEffect(() => {
    fetchTask(false);
  }, [fetchTask]);

  // Polling every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchTask(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [fetchTask]);

  // Load assignees if employer opens edit modal
  const openEditModal = async () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setEditDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
    setEditAssigneeId(task.assigned_to_id ? task.assigned_to_id.toString() : '');

    try {
      const users = await taskService.getVirtualHRUsers();
      setVirtualHRUsers(users);
    } catch (err) {
      console.error('Failed to load HR users for edit modal:', err);
    }
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setEditSaving(true);
    try {
      const updated = await taskService.updateTask(task.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || null,
        priority: editPriority,
        deadline: editDeadline ? new Date(editDeadline).toISOString() : null,
        assigned_to_id: editAssigneeId ? parseInt(editAssigneeId, 10) : null,
      });
      setTask(updated);
      setNotification({
        type: 'success',
        message: 'Task details updated successfully!',
      });
      setEditModalOpen(false);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to update task details.',
      });
    } finally {
      setEditSaving(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusVal) return;

    setStatusUpdating(true);
    try {
      const updated = await taskService.updateTaskStatus(task.id, statusVal, progressNote);
      setTask(updated);
      setProgressNote('');
      setNotification({
        type: 'success',
        message: `Status updated to ${statusVal}!`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to update status.',
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading && !task) {
    return <LoadingSpinner message="Loading task details and audit trail..." />;
  }

  if (error && !task) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <Notification type="error" message={error} onClose={() => {}} />
        <button
          onClick={() => navigate('/tasks')}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Return to Task Registry
        </button>
      </div>
    );
  }

  const isAssignedToCurrentUser = user && task.assigned_to_id === user.id;
  const canUpdateStatus = isEmployer || isAssignedToCurrentUser;
  const overdue = isOverdue(task.deadline, task.status);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#64748b',
              cursor: 'pointer',
            }}
            className="btn-outline-hover"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
                TASK #{task.id}
              </span>
              <StatusBadge status={task.status} size="sm" />
              <StatusBadge status={task.priority} type="priority" size="sm" />
            </div>
            <h1
              style={{
                margin: '4px 0 0',
                fontSize: '1.375rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.3,
              }}
            >
              {task.title}
            </h1>
          </div>
        </div>

        {isEmployer && (
          <button
            onClick={openEditModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #c7d2fe',
              backgroundColor: '#eef2ff',
              color: '#4338ca',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            className="btn-secondary-hover"
          >
            <Edit size={16} />
            <span>Edit Task Details</span>
          </button>
        )}
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Overview Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Assignee */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            <User size={15} />
            <span>Assignee</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
            {task.assigned_to ? task.assigned_to.full_name : 'Unassigned'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            {task.assigned_to ? task.assigned_to.email : 'No specialist assigned'}
          </p>
        </div>

        {/* Assigned By */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            <Shield size={15} />
            <span>Assigned By</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
            {task.assigned_by ? task.assigned_by.full_name : 'System Admin'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            {task.assigned_by ? task.assigned_by.email : 'employer@salarite.com'}
          </p>
        </div>

        {/* Target Deadline */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: overdue ? '1px solid #fecaca' : '1px solid #e2e8f0',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: overdue ? '#dc2626' : '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            <Calendar size={15} />
            <span>Target Deadline</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: overdue ? '#dc2626' : '#0f172a' }}>
            {formatDate(task.deadline)}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: overdue ? '#ef4444' : '#64748b' }}>
            {overdue ? 'Overdue' : 'On schedule'}
          </p>
        </div>

        {/* Updated Timestamp */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            <Clock size={15} />
            <span>Last Activity</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
            {formatRelativeTime(task.updated_at)}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Created {formatDate(task.created_at)}
          </p>
        </div>
      </div>

      {/* Description Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h3
          style={{
            margin: '0 0 12px',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          Description & Work Instructions
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.9375rem',
            color: '#334155',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}
        >
          {task.description || 'No detailed instructions provided for this task.'}
        </p>
      </div>

      {/* Update Status Panel */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h3
          style={{
            margin: '0 0 16px',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          Workflow Status Update
        </h3>

        {!canUpdateStatus ? (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#92400e',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={18} />
            <span>
              This task is assigned to another Virtual HR specialist. Only the assigned specialist or an Employer may modify its status.
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleStatusUpdate}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <label
                  htmlFor="status_select"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Current State
                </label>
                <select
                  id="status_select"
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
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
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="progress_note_input"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Progress Note / Comment
                </label>
                <input
                  id="progress_note_input"
                  type="text"
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  placeholder="Optional context (e.g. Sent documents to candidate)"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={statusUpdating || statusVal === task.status && !progressNote.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: statusUpdating ? 'not-allowed' : 'pointer',
                  opacity: statusUpdating ? 0.75 : 1,
                }}
                className="btn-primary"
              >
                <Save size={15} />
                <span>{statusUpdating ? 'Updating...' : 'Save Status Change'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Task Audit Trail Activity History */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Activity size={18} color="#4f46e5" />
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            Audit Trail & Activity Log
          </h3>
        </div>

        {(!task.activities || task.activities.length === 0) ? (
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
            No recorded activities for this task yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {task.activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  fontSize: '0.875rem',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #f8fafc',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    flexShrink: 0,
                  }}
                >
                  {act.user ? act.user.full_name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {act.user ? act.user.full_name : 'System User'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {formatDateTime(act.created_at)}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', color: '#475569', lineHeight: 1.4 }}>
                    {act.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Employer Edit Modal */}
      {isEmployer && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Task Details"
          footer={
            <>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
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
                type="button"
                onClick={handleEditSubmit}
                disabled={editSaving}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: editSaving ? 'not-allowed' : 'pointer',
                  opacity: editSaving ? 0.75 : 1,
                }}
                className="btn-primary"
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Task Title
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Instructions
              </label>
              <textarea
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Reassign To
                </label>
                <select
                  value={editAssigneeId}
                  onChange={(e) => setEditAssigneeId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="">-- Unassigned --</option>
                  {virtualHRUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Deadline
              </label>
              <input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
