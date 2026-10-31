import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckSquare, Calendar, User, AlertCircle } from 'lucide-react';
import { taskService } from '../services/taskService';
import Notification from '../components/Notification';

export default function CreateTask() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [virtualHRUsers, setVirtualHRUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch Virtual HR users for assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await taskService.getVirtualHRUsers();
        setVirtualHRUsers(users);
        if (users.length > 0) {
          setAssignedToId(users[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load virtual HR users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        assigned_to_id: assignedToId ? parseInt(assignedToId, 10) : null,
      };

      const newTask = await taskService.createTask(payload);
      setSuccess('Task created and assigned successfully!');
      setTimeout(() => {
        navigate(`/tasks/${newTask.id}`);
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || 'Failed to create task.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate('/tasks')}
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
          aria-label="Back to tasks"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1
            style={{
              margin: '0 0 2px',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
            }}
          >
            Create New Task
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Assign operational goals and workflows to a Virtual HR specialist.
          </p>
        </div>
      </div>

      {error && <Notification type="error" message={error} onClose={() => setError('')} />}
      {success && <Notification type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Task Title <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Verify Form I-9 & Tax Documentation for New Hire"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9375rem',
              color: '#0f172a',
              outline: 'none',
            }}
            className="input-focus"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Detailed Instructions & Deliverables
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, required documents, vendor contact details, or milestone criteria..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              color: '#0f172a',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              resize: 'vertical',
            }}
            className="input-focus"
          />
        </div>

        {/* Grid for Priority, Assignee, Deadline */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Priority Level
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
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
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent Priority</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label
              htmlFor="assigned_to"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Assign to Virtual HR Specialist
            </label>
            <select
              id="assigned_to"
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
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
              <option value="">-- Unassigned --</option>
              {virtualHRUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label
              htmlFor="deadline"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Target Deadline
            </label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
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
              className="input-focus"
            />
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '12px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
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
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 22px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
            }}
            className="btn-primary"
          >
            <Save size={16} />
            <span>{loading ? 'Creating Task...' : 'Create & Assign Task'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
