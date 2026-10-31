import { useState, useEffect, useCallback, useRef } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

export function useTasks({
  isVirtualHR = false,
  status = '',
  priority = '',
  assigneeId = null,
  search = '',
  autoPoll = true,
  pollInterval = 4000,
} = {}) {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchTasks = useCallback(
    async (isBackground = false) => {
      if (!isAuthenticated) return;
      if (isFetchingRef.current) return; // avoid duplicate in-flight requests

      isFetchingRef.current = true;
      if (!isBackground) setLoading(true);

      try {
        const params = {};
        if (status && status !== 'All') params.status = status;
        if (priority && priority !== 'All') params.priority = priority;
        if (assigneeId) params.assignee_id = assigneeId;
        if (search && search.trim()) params.search = search.trim();

        const data = isVirtualHR
          ? await taskService.getVirtualHRTasks(params)
          : await taskService.getTasks(params);

        setTasks(data);
        setError(null);
      } catch (err) {
        if (!isBackground) {
          setError(err.response?.data?.detail || err.message || 'Failed to load tasks');
        }
      } finally {
        if (!isBackground) setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [isAuthenticated, isVirtualHR, status, priority, assigneeId, search]
  );

  // Initial fetch and effect dependency
  useEffect(() => {
    fetchTasks(false);
  }, [fetchTasks]);

  // Automatic polling interval (3-5 seconds)
  useEffect(() => {
    if (!autoPoll || !isAuthenticated) return;

    const timer = setInterval(() => {
      fetchTasks(true);
    }, pollInterval);

    return () => clearInterval(timer);
  }, [autoPoll, isAuthenticated, pollInterval, fetchTasks]);

  const updateTaskStatus = async (taskId, newStatus, progressNote) => {
    const updated = await taskService.updateTaskStatus(taskId, newStatus, progressNote);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  };

  const removeTask = async (taskId) => {
    await taskService.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return {
    tasks,
    loading,
    error,
    refetch: () => fetchTasks(false),
    updateTaskStatus,
    removeTask,
  };
}
