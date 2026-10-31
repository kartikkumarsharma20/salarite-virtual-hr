import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  PlusCircle,
  CalendarPlus,
  ArrowRight,
  Video,
  Phone,
  MessageSquare,
  Activity as ActivityIcon,
  RefreshCw,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import TaskTable from '../components/TaskTable';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import { formatDate, formatRelativeTime } from '../utils/formatDate';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isEmployer } = useAuth();

  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [statsData, activityData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivity(),
      ]);
      setStats(statsData);
      setActivities(activityData.activities || []);
      setError(null);
    } catch (err) {
      if (!isBackground) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            'Unable to fetch live dashboard metrics.'
        );
      }
    } finally {
      if (!isBackground) setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Live polling every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchDashboardData(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  if (loading && !stats) {
    return <LoadingSpinner fullScreen={false} message="Loading dashboard statistics..." />;
  }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header and Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
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
            Welcome back, {user?.full_name}
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Real-time HR operations, team delegation, and interview schedules.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fetchDashboardData(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            className="btn-outline-hover"
            title="Refresh now"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {isEmployer && (
            <>
              <button
                onClick={() => navigate('/interviews/schedule')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #c7d2fe',
                  backgroundColor: '#eef2ff',
                  color: '#4338ca',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="btn-secondary-hover"
              >
                <CalendarPlus size={16} />
                <span>Schedule Interview</span>
              </button>

              <button
                onClick={() => navigate('/tasks/create')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
                }}
                className="btn-primary"
              >
                <PlusCircle size={16} />
                <span>Create Task</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && <Notification type="error" message={error} onClose={() => setError(null)} />}

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          title="Total Tasks"
          value={stats?.total_tasks || 0}
          icon={CheckSquare}
          colorScheme="indigo"
          subtitle="All team tasks"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          title="Pending"
          value={stats?.pending_tasks || 0}
          icon={Clock}
          colorScheme="orange"
          subtitle="Awaiting start"
          onClick={() => navigate('/tasks?status=Pending')}
        />
        <StatCard
          title="In Progress"
          value={stats?.in_progress_tasks || 0}
          icon={PlayCircle}
          colorScheme="blue"
          subtitle="Currently active"
          onClick={() => navigate('/tasks?status=In Progress')}
        />
        <StatCard
          title="Completed"
          value={stats?.completed_tasks || 0}
          icon={CheckCircle2}
          colorScheme="green"
          subtitle="Successfully finished"
          onClick={() => navigate('/tasks?status=Completed')}
        />
        <StatCard
          title="Blocked"
          value={stats?.blocked_tasks || 0}
          icon={AlertOctagon}
          colorScheme="red"
          subtitle="Requires attention"
          onClick={() => navigate('/tasks?status=Blocked')}
        />
        <StatCard
          title="Upcoming Interviews"
          value={stats?.upcoming_interviews_count || 0}
          icon={Calendar}
          colorScheme="purple"
          subtitle="Scheduled sessions"
          onClick={() => navigate('/interviews')}
        />
      </div>

      {/* Main Section: Recent Tasks Table */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              Recent Tasks
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
              Live task updates from Virtual HR team members
            </p>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>View All Tasks</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <TaskTable
          tasks={stats?.recent_tasks || []}
          isEmployer={isEmployer}
          emptyMessage="No tasks have been created yet."
        />
      </div>

      {/* Bottom Grid: Upcoming Interviews & Real Activity Feed */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Upcoming Interviews Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#4f46e5" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Upcoming Interviews
              </h3>
            </div>
            <button
              onClick={() => navigate('/interviews')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All Interviews &rarr;
            </button>
          </div>

          {(!stats?.upcoming_interviews || stats.upcoming_interviews.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No upcoming interviews scheduled.</p>
              {isEmployer && (
                <button
                  onClick={() => navigate('/interviews/schedule')}
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Schedule one now
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.upcoming_interviews.map((interview) => (
                <div
                  key={interview.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    backgroundColor: '#fafbfc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                      {interview.candidate_name}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.75rem',
                        color: '#64748b',
                      }}
                    >
                      <span>{formatDate(interview.interview_date)}</span>
                      <span>•</span>
                      <span>{interview.start_time} ({interview.duration_minutes}m)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {getModeIcon(interview.mode)}
                      <span>{interview.mode}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Task Activity Feed */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ActivityIcon size={18} color="#059669" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Recent Activity
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
              Audit Trail
            </span>
          </div>

          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No recent activities recorded.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                maxHeight: '340px',
                overflowY: 'auto',
              }}
            >
              {activities.slice(0, 7).map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#4f46e5',
                      marginTop: '5px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', color: '#1e293b', lineHeight: 1.4 }}>
                      {act.details}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {formatRelativeTime(act.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
