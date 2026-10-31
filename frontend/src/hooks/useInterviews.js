import { useState, useEffect, useCallback, useRef } from 'react';
import { interviewService } from '../services/interviewService';
import { useAuth } from '../context/AuthContext';

export function useInterviews({
  mode = '',
  status = '',
  autoPoll = true,
  pollInterval = 5000,
} = {}) {
  const { isAuthenticated } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchInterviews = useCallback(
    async (isBackground = false) => {
      if (!isAuthenticated) return;
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      if (!isBackground) setLoading(true);

      try {
        const params = {};
        if (mode && mode !== 'All') params.mode = mode;
        if (status && status !== 'All') params.status = status;

        const data = await interviewService.getInterviews(params);
        setInterviews(data);
        setError(null);
      } catch (err) {
        if (!isBackground) {
          setError(
            err.response?.data?.detail || err.message || 'Failed to load interviews'
          );
        }
      } finally {
        if (!isBackground) setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [isAuthenticated, mode, status]
  );

  useEffect(() => {
    fetchInterviews(false);
  }, [fetchInterviews]);

  useEffect(() => {
    if (!autoPoll || !isAuthenticated) return;

    const timer = setInterval(() => {
      fetchInterviews(true);
    }, pollInterval);

    return () => clearInterval(timer);
  }, [autoPoll, isAuthenticated, pollInterval, fetchInterviews]);

  const cancelInterview = async (interviewId) => {
    const updated = await interviewService.cancelInterview(interviewId);
    setInterviews((prev) => prev.map((i) => (i.id === interviewId ? updated : i)));
    return updated;
  };

  return {
    interviews,
    loading,
    error,
    refetch: () => fetchInterviews(false),
    cancelInterview,
  };
}
