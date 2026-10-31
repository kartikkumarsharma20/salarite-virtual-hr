import api from './api';

export const taskService = {
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async getVirtualHRTasks(params = {}) {
    const response = await api.get('/virtual-hr/tasks', { params });
    return response.data;
  },

  async getTaskById(taskId) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  async updateTaskStatus(taskId, status, progressNote = '') {
    const response = await api.patch(`/tasks/${taskId}/status`, {
      status,
      progress_note: progressNote,
    });
    return response.data;
  },

  async deleteTask(taskId) {
    await api.delete(`/tasks/${taskId}`);
    return true;
  },

  async getVirtualHRUsers() {
    const response = await api.get('/users/virtual-hr');
    return response.data;
  },
};
