import api from './axios'

export const getReports = () => api.get('/reports/')
export const createReport = (data) => api.post('/reports/', data)
export const deleteReport = (id) => api.delete(`/reports/${id}/`)