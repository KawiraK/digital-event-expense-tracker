import api from './axios'

export const getCSRF = () => api.get('/auth/csrf/')

export const register = (username, email, password) =>
  api.post('/auth/register/', { username, email, password })

export const login = (username, password) =>
  api.post('/auth/login/', { username, password })

export const logout = () => api.post('/auth/logout/')

export const getMe = () => api.get('/auth/me/')