import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarPlus,
  Video,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  Mail,
  User,
  CheckCircle,
} from 'lucide-react';
import { interviewService } from '../services/interviewService';
import Notification from '../components/Notification';

export default function ScheduleInterview() {
  const navigate = useNavigate();

  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');

  // Default to tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().slice(0, 10);

  const [interviewDate, setInterviewDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [mode, setMode] = useState('Video'); // Video, Voice, Chat
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!candidateName.trim()) {
      setError('Candidate full name is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!candidateEmail.trim() || !emailRegex.test(candidateEmail.trim())) {
      setError('Please provide a valid candidate email address.');
      return;
    }

    if (!interviewDate) {
      setError('Interview date is required.');
      return;
    }

    if (!startTime.trim()) {
      setError('Start time is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        candidate_name: candidateName.trim(),
        candidate_email: candidateEmail.trim(),
        candidate_phone: candidatePhone.trim() || null,
        interview_date: interviewDate,
        start_time: startTime.trim(),
        duration_minutes: parseInt(durationMinutes, 10),
        mode,
        notes: notes.trim() || null,
      };

      await interviewService.createInterview(payload);
      setSuccess('Candidate interview successfully scheduled!');
      setTimeout(() => {
        navigate('/interviews');
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || 'Failed to schedule candidate interview.'
      );
    } finally {
      setLoading(false);
    }
  };

  const modeOptions = [
    {
      id: 'Video',
      label: 'Video Interview',
      desc: 'Simulated video conference with camera & screen controls',
      icon: Video,
      color: '#4f46e5',
      bg: '#eef2ff',
    },
    {
      id: 'Voice',
      label: 'Voice Call',
      desc: 'Audio call with dynamic waveform simulation and mute controls',
      icon: Phone,
      color: '#0284c7',
      bg: '#f0f9ff',
    },
    {
      id: 'Chat',
      label: 'Chat Assessment',
      desc: 'Interactive chat messaging assessment session',
      icon: MessageSquare,
      color: '#7c3aed',
      bg: '#faf5ff',
    },
  ];

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate('/interviews')}
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
          aria-label="Back to interviews"
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
            Schedule Candidate Interview
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Coordinate candidate assessment sessions with Video, Voice, or Chat modes.
          </p>
        </div>
      </div>

      {error && <Notification type="error" message={error} onClose={() => setError('')} />}
      {success && <Notification type="success" message={success} onClose={() => setSuccess('')} />}

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
          gap: '24px',
        }}
      >
        {/* Section 1: Candidate Details */}
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            1. Candidate Information
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label
                htmlFor="cand_name"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Candidate Full Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="cand_name"
                type="text"
                required
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Maya Lin"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
                className="input-focus"
              />
            </div>

            <div>
              <label
                htmlFor="cand_email"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Candidate Email <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="cand_email"
                type="email"
                required
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="maya.lin@example.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
                className="input-focus"
              />
            </div>

            <div>
              <label
                htmlFor="cand_phone"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Phone Number (Optional)
              </label>
              <input
                id="cand_phone"
                type="tel"
                value={candidatePhone}
                onChange={(e) => setCandidatePhone(e.target.value)}
                placeholder="+1 (555) 789-0123"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
                className="input-focus"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Mode Selection */}
        <div>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            2. Choose Interview Mode
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            {modeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = mode === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => setMode(opt.id)}
                  style={{
                    border: `2px solid ${isSelected ? opt.color : '#e2e8f0'}`,
                    backgroundColor: isSelected ? opt.bg : '#ffffff',
                    borderRadius: '10px',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: opt.bg,
                        color: opt.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    {isSelected && <CheckCircle size={18} color={opt.color} />}
                  </div>
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                      {opt.label}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3 }}>
                      {opt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Schedule Date, Time & Duration */}
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            3. Date, Time & Duration
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label
                htmlFor="int_date"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Date <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="int_date"
                type="date"
                required
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
                className="input-focus"
              />
            </div>

            <div>
              <label
                htmlFor="int_time"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Start Time <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="int_time"
                type="text"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 10:00 AM, 02:30 PM"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
                className="input-focus"
              />
            </div>

            <div>
              <label
                htmlFor="int_dur"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Duration
              </label>
              <select
                id="int_dur"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
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
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Notes */}
        <div>
          <label
            htmlFor="int_notes"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Interview Agenda & Candidate Brief (Optional)
          </label>
          <textarea
            id="int_notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key discussion topics, portfolio review areas, or role requirements..."
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
              lineHeight: 1.5,
              resize: 'vertical',
            }}
            className="input-focus"
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/interviews')}
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
            <CalendarPlus size={16} />
            <span>{loading ? 'Scheduling...' : 'Schedule Interview'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
