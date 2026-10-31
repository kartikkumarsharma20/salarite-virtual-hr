import api from './api';

export const interviewService = {
  async getInterviews(params = {}) {
    const response = await api.get('/interviews', { params });
    return response.data;
  },

  async getInterviewById(interviewId) {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  },

  async createInterview(interviewData) {
    const response = await api.post('/interviews', interviewData);
    return response.data;
  },

  async updateInterview(interviewId, interviewData) {
    const response = await api.put(`/interviews/${interviewId}`, interviewData);
    return response.data;
  },

  async cancelInterview(interviewId) {
    const response = await api.patch(`/interviews/${interviewId}/cancel`);
    return response.data;
  },
};
