import api from './axios'

export const getAlerts = () => api.get('/alerts/')
export const resolveAlert = (id) => api.patch(`/alerts/${id}/resolve/`)