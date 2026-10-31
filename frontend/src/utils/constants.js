export const TASK_STATUSES = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
};

export const TASK_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const INTERVIEW_MODES = {
  VOICE: 'Voice',
  VIDEO: 'Video',
  CHAT: 'Chat',
};

export const INTERVIEW_STATUSES = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const USER_ROLES = {
  EMPLOYER: 'employer',
  VIRTUAL_HR: 'virtual_hr',
};

export const STATUS_COLORS = {
  Pending: {
    bg: '#fef3c7',
    text: '#92400e',
    border: '#fde68a',
    dot: '#f59e0b',
  },
  'In Progress': {
    bg: '#e0f2fe',
    text: '#075985',
    border: '#bae6fd',
    dot: '#0284c7',
  },
  Completed: {
    bg: '#dcfce7',
    text: '#166534',
    border: '#bbf7d0',
    dot: '#16a34a',
  },
  Blocked: {
    bg: '#fee2e2',
    text: '#991b1b',
    border: '#fecaca',
    dot: '#dc2626',
  },
  Scheduled: {
    bg: '#ede9fe',
    text: '#5b21b6',
    border: '#ddd6fe',
    dot: '#7c3aed',
  },
  Cancelled: {
    bg: '#f1f5f9',
    text: '#475569',
    border: '#e2e8f0',
    dot: '#64748b',
  },
};

export const PRIORITY_COLORS = {
  Low: {
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1',
  },
  Medium: {
    bg: '#e0e7ff',
    text: '#3730a3',
    border: '#c7d2fe',
  },
  High: {
    bg: '#ffedd5',
    text: '#9a3412',
    border: '#fed7aa',
  },
  Urgent: {
    bg: '#ffe4e6',
    text: '#9f1239',
    border: '#fecdd3',
  },
};
