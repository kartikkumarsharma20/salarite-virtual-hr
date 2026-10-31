import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import TaskTable from '../components/TaskTable';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EmployerTasks() {
  const navigate = useNavigate();
  const { isEmployer } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const [virtualHRUsers, setVirtualHRUsers] = useState([]);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load Virtual HR users for assignee dropdown filter
  useEffect(() => {
    const loadAssignees = async () => {
      try {
        const users = await taskService.getVirtualHRUsers();
        setVirtualHRUsers(users);
      } catch (err) {
        console.error('Failed to load virtual HR users for filter:', err);
      }
    };
    loadAssignees();
  }, []);

  const { tasks, loading, error, removeTask, refetch } = useTasks({
    isVirtualHR: false,
    status: statusFilter,
    priority: priorityFilter,
    assigneeId: assigneeFilter ? parseInt(assigneeFilter, 10) : null,
    search: searchTerm,
    autoPoll: true,
    pollInterval: 4000,
  });

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setDeleteLoading(true);
    try {
      await removeTask(taskToDelete.id);
      setNotification({
        type: 'success',
        message: `Task "${taskToDelete.title}" has been deleted successfully.`,
      });
      setTaskToDelete(null);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to delete task.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title & Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
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
            Team Tasks & Delegation
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Monitor, assign, and manage all organizational workflows across Virtual HR specialists.
          </p>
        </div>

        {isEmployer && (
          <button
            onClick={() => navigate('/tasks/create')}
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
              boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
            }}
            className="btn-primary"
          >
            <PlusCircle size={17} />
            <span>Create New Task</span>
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

      {error && <Notification type="error" message={error} onClose={() => {}} />}

      {/* Filters and Controls Toolbar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
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
              placeholder="Search tasks by title or keyword..."
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

          {/* Filter dropdowns */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {/* Status Filter */}
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

            {/* Priority Filter */}
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

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
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
              <option value="">All Assignees</option>
              {virtualHRUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>

            {/* View Mode Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '7px 10px',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? '#eef2ff' : '#ffffff',
                  color: viewMode === 'table' ? '#4f46e5' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '7px 10px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#eef2ff' : '#ffffff',
                  color: viewMode === 'grid' ? '#4f46e5' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                title="Grid Card View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Content */}
      {loading && tasks.length === 0 ? (
        <LoadingSpinner message="Loading task registry..." />
      ) : viewMode === 'table' ? (
        <TaskTable
          tasks={tasks}
          onDelete={(t) => setTaskToDelete(t)}
          isEmployer={isEmployer}
          emptyMessage="No tasks match the active filters."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} isVirtualHR={false} />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        title="Confirm Task Deletion"
        footer={
          <>
            <button
              onClick={() => setTaskToDelete(null)}
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
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: deleteLoading ? 'not-allowed' : 'pointer',
                opacity: deleteLoading ? 0.75 : 1,
              }}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Task'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#0f172a' }}>
              Are you sure you want to permanently delete this task?
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#64748b' }}>
              Task: <strong>"{taskToDelete?.title}"</strong>
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#ef4444' }}>
              This action cannot be undone and will remove all associated audit activity history.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
