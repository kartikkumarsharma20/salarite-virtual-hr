import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  Video,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Calendar,
  Clock,
  Mail,
  User,
  AlertCircle,
  XCircle,
  CheckCircle,
  Play,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Send,
  Info,
} from 'lucide-react';
import { useInterviews } from '../hooks/useInterviews';
import { interviewService } from '../services/interviewService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';

export default function Interviews() {
  const navigate = useNavigate();
  const { isEmployer } = useAuth();

  const [modeFilter, setModeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Placeholder Room Modal state
  const [activeSession, setActiveSession] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatText, setNewChatText] = useState('');

  // Cancel modal state
  const [interviewToCancel, setInterviewToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Reschedule modal state
  const [rescheduleItem, setRescheduleItem] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDuration, setRescheduleDuration] = useState(30);
  const [savingReschedule, setSavingReschedule] = useState(false);

  const [notification, setNotification] = useState(null);

  const { interviews, loading, error, cancelInterview, refetch } = useInterviews({
    mode: modeFilter,
    status: statusFilter,
    autoPoll: true,
    pollInterval: 4000,
  });

  const filteredInterviews = interviews.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.candidate_name?.toLowerCase().includes(q) ||
      item.candidate_email?.toLowerCase().includes(q) ||
      item.notes?.toLowerCase().includes(q)
    );
  });

  // Launch simulated room placeholder
  const handleLaunchSession = (interview) => {
    setActiveSession(interview);
    setMicMuted(false);
    setCamOff(false);
    setChatMessages([
      {
        sender: interview.candidate_name,
        text: `Hello! Thank you for scheduling this ${interview.mode.toLowerCase()} session with me. I am ready to begin!`,
        time: 'Just now',
      },
    ]);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const userMsg = {
      sender: 'Interviewer (You)',
      text: newChatText.trim(),
      time: 'Just now',
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setNewChatText('');

    // Simulated reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: activeSession.candidate_name,
          text: 'Understood. Thank you for clarifying that point!',
          time: 'Just now',
        },
      ]);
    }, 1500);
  };

  const handleConfirmCancel = async () => {
    if (!interviewToCancel) return;
    setCancelling(true);
    try {
      await cancelInterview(interviewToCancel.id);
      setNotification({
        type: 'success',
        message: `Interview with ${interviewToCancel.candidate_name} has been cancelled.`,
      });
      setInterviewToCancel(null);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to cancel interview.',
      });
    } finally {
      setCancelling(false);
    }
  };

  const openRescheduleModal = (interview) => {
    setRescheduleItem(interview);
    setRescheduleDate(interview.interview_date ? interview.interview_date.slice(0, 10) : '');
    setRescheduleTime(interview.start_time);
    setRescheduleDuration(interview.duration_minutes || 30);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleItem) return;

    setSavingReschedule(true);
    try {
      await interviewService.updateInterview(rescheduleItem.id, {
        interview_date: rescheduleDate,
        start_time: rescheduleTime,
        duration_minutes: parseInt(rescheduleDuration, 10),
        status: 'Scheduled',
      });
      setNotification({
        type: 'success',
        message: `Interview rescheduled for ${formatDate(rescheduleDate)} at ${rescheduleTime}!`,
      });
      setRescheduleItem(null);
      refetch();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to reschedule interview.',
      });
    } finally {
      setSavingReschedule(false);
    }
  };

  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'voice':
        return <Phone size={14} color="#0284c7" />;
      case 'chat':
        return <MessageSquare size={14} color="#7c3aed" />;
      default:
        return <Video size={14} color="#4f46e5" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Schedule Action */}
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
            Candidate Interview Management
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Schedule and coordinate Voice, Video, and Chat candidate assessment sessions.
          </p>
        </div>

        {isEmployer && (
          <button
            onClick={() => navigate('/interviews/schedule')}
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
            <CalendarPlus size={16} />
            <span>Schedule New Interview</span>
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

      {/* Filter and Search Bar */}
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
            placeholder="Search candidate by name, email, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
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
            <option value="All">All Modes (Voice, Video, Chat)</option>
            <option value="Video">Video Interview</option>
            <option value="Voice">Voice Call</option>
            <option value="Chat">Chat Assessment</option>
          </select>

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
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Interviews Table */}
      {loading && filteredInterviews.length === 0 ? (
        <LoadingSpinner message="Loading interviews schedule..." />
      ) : filteredInterviews.length === 0 ? (
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
          <Calendar size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '1.0625rem', fontWeight: 600 }}>
            No interviews found
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Schedule candidate interviews or adjust the active filters to see past sessions.
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
                  <th style={{ padding: '14px 20px' }}>Candidate</th>
                  <th style={{ padding: '14px 16px' }}>Date & Time</th>
                  <th style={{ padding: '14px 16px' }}>Mode</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px' }}>Notes</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((item) => {
                  const isCancelled = item.status?.toLowerCase() === 'cancelled';
                  const isCompleted = item.status?.toLowerCase() === 'completed';

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.1s',
                      }}
                      className="table-row-hover"
                    >
                      {/* Candidate info */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {item.candidate_name}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                          {item.candidate_email}
                        </div>
                        {item.candidate_phone && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                            {item.candidate_phone}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {formatDate(item.interview_date)}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                          {item.start_time} ({item.duration_minutes} min)
                        </div>
                      </td>

                      {/* Mode Badge */}
                      <td style={{ padding: '16px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            border: '1px solid #dbeafe',
                          }}
                        >
                          {getModeIcon(item.mode)}
                          <span>{item.mode}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 16px' }}>
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      {/* Notes */}
                      <td style={{ padding: '16px 16px', maxWidth: '240px' }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8125rem',
                            color: '#475569',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.notes || '—'}
                        </p>
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
                          {!isCancelled && (
                            <button
                              onClick={() => handleLaunchSession(item)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#4f46e5',
                                color: '#ffffff',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(79, 70, 229, 0.25)',
                              }}
                              className="btn-primary"
                              title="Launch Simulated Interview Room"
                            >
                              <Play size={12} fill="#ffffff" />
                              <span>Launch Session</span>
                            </button>
                          )}

                          {isEmployer && !isCancelled && !isCompleted && (
                            <>
                              <button
                                onClick={() => openRescheduleModal(item)}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#ffffff',
                                  color: '#334155',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                                className="btn-outline-hover"
                              >
                                Reschedule
                              </button>

                              <button
                                onClick={() => setInterviewToCancel(item)}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #fee2e2',
                                  backgroundColor: '#fff5f5',
                                  color: '#dc2626',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                                className="btn-danger-hover"
                              >
                                Cancel
                              </button>
                            </>
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
      )}

      {/* Inbuilt Interview Mode Placeholder Panel Modal */}
      {activeSession && (
        <Modal
          isOpen={Boolean(activeSession)}
          onClose={() => setActiveSession(null)}
          title={`Active ${activeSession.mode} Session: ${activeSession.candidate_name}`}
          maxWidth="700px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                  }}
                  className="pulse-dot"
                />
                <span style={{ fontSize: '0.8125rem', color: '#166534', fontWeight: 600 }}>
                  Encrypted Session Active (Placeholder Room)
                </span>
              </div>
              <button
                onClick={() => setActiveSession(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <PhoneOff size={15} />
                <span>End Session</span>
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Note banner explaining placeholder mode */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.8125rem',
                color: '#0369a1',
              }}
            >
              <Info size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Inbuilt Mode Placeholder:</strong> External calling providers (e.g. WebRTC/Twilio/Agora) are not integrated in this simulated environment. This interactive panel demonstrates candidate connection, interactive controls, and session workflow for <strong>{activeSession.mode}</strong> mode.
              </div>
            </div>

            {/* Video Mode Simulation */}
            {activeSession.mode?.toLowerCase() === 'video' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    height: '260px',
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {camOff ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <VideoOff size={40} style={{ margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>Camera is currently disabled</p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#ffffff' }}>
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          backgroundColor: '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.75rem',
                          fontWeight: 700,
                          margin: '0 auto 12px',
                        }}
                      >
                        {activeSession.candidate_name.charAt(0)}
                      </div>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '1rem' }}>
                        {activeSession.candidate_name}
                      </p>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          color: '#4ade80',
                        }}
                      >
                        Connected • 1080p HD
                      </span>
                    </div>
                  )}

                  {/* Room status tag */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{activeSession.start_time}</span>
                    <span>•</span>
                    <span>{activeSession.duration_minutes} min scheduled</span>
                  </div>
                </div>

                {/* Session controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setMicMuted((prev) => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: micMuted ? '#fee2e2' : '#ffffff',
                      color: micMuted ? '#dc2626' : '#334155',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {micMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    <span>{micMuted ? 'Unmute' : 'Mute'}</span>
                  </button>

                  <button
                    onClick={() => setCamOff((prev) => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: camOff ? '#fee2e2' : '#ffffff',
                      color: camOff ? '#dc2626' : '#334155',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {camOff ? <VideoOff size={16} /> : <Video size={16} />}
                    <span>{camOff ? 'Start Video' : 'Stop Video'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Voice Mode Simulation */}
            {activeSession.mode?.toLowerCase() === 'voice' && (
              <div
                style={{
                  padding: '32px 24px',
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  color: '#ffffff',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 0 8px rgba(2, 132, 199, 0.25)',
                  }}
                  className="pulse-dot"
                >
                  <Phone size={36} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 700 }}>
                    {activeSession.candidate_name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
                    Voice Line Active • Call Duration: 05:42
                  </p>
                </div>

                {/* Simulated Audio Waveform */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: '36px',
                    margin: '8px 0',
                  }}
                >
                  {[24, 12, 32, 18, 36, 14, 28, 20, 34, 16, 30, 22].map((h, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: '4px',
                        height: micMuted ? '6px' : `${h}px`,
                        backgroundColor: '#38bdf8',
                        borderRadius: '2px',
                        transition: 'height 0.2s ease',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setMicMuted((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: micMuted ? '#ef4444' : '#334155',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {micMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  <span>{micMuted ? 'Muted' : 'Mute Microphone'}</span>
                </button>
              </div>
            )}

            {/* Chat Mode Simulation */}
            {activeSession.mode?.toLowerCase() === 'chat' && (
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '320px',
                  backgroundColor: '#ffffff',
                }}
              >
                {/* Chat Message Scroll */}
                <div
                  style={{
                    flex: 1,
                    padding: '16px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backgroundColor: '#fafbfc',
                  }}
                >
                  {chatMessages.map((msg, i) => {
                    const isMe = msg.sender.includes('You');
                    return (
                      <div
                        key={i}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          backgroundColor: isMe ? '#4f46e5' : '#ffffff',
                          color: isMe ? '#ffffff' : '#0f172a',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: isMe ? 'none' : '1px solid #e2e8f0',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 600, color: isMe ? '#c7d2fe' : '#64748b' }}>
                          {msg.sender}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.4 }}>
                          {msg.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendChatMessage}
                  style={{
                    padding: '10px 14px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '8px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <input
                    type="text"
                    value={newChatText}
                    onChange={(e) => setNewChatText(e.target.value)}
                    placeholder="Type candidate prompt or interview response..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Send size={14} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={Boolean(interviewToCancel)}
        onClose={() => setInterviewToCancel(null)}
        title="Confirm Interview Cancellation"
        footer={
          <>
            <button
              onClick={() => setInterviewToCancel(null)}
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
              Back
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: cancelling ? 'not-allowed' : 'pointer',
                opacity: cancelling ? 0.75 : 1,
              }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Interview'}
            </button>
          </>
        }
      >
        <p style={{ margin: '0 0 10px', fontSize: '0.9375rem', color: '#0f172a' }}>
          Are you sure you want to cancel the interview scheduled with candidate{' '}
          <strong>{interviewToCancel?.candidate_name}</strong> on{' '}
          <strong>{formatDate(interviewToCancel?.interview_date)}</strong>?
        </p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#dc2626' }}>
          The candidate record status will be updated to "Cancelled".
        </p>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={Boolean(rescheduleItem)}
        onClose={() => setRescheduleItem(null)}
        title={`Reschedule: ${rescheduleItem?.candidate_name}`}
        footer={
          <>
            <button
              onClick={() => setRescheduleItem(null)}
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
              onClick={handleRescheduleSubmit}
              disabled={savingReschedule}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: savingReschedule ? 'not-allowed' : 'pointer',
                opacity: savingReschedule ? 0.75 : 1,
              }}
              className="btn-primary"
            >
              {savingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </>
        }
      >
        <form onSubmit={handleRescheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              New Interview Date
            </label>
            <input
              type="date"
              required
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Start Time
              </label>
              <input
                type="text"
                required
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                placeholder="e.g. 10:30 AM"
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

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Duration (Minutes)
              </label>
              <select
                value={rescheduleDuration}
                onChange={(e) => setRescheduleDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
