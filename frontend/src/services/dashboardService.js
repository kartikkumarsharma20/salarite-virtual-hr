import api from './api';

export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getActivity() {
    const response = await api.get('/dashboard/activity');
    return response.data;
  },
};
