import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EventListPage from './pages/EventListPage'
import EventFormPage from './pages/EventFormPage'
import EventDetailPage from './pages/EventDetailPage'
import ExpenseFormPage from './pages/ExpenseFormPage'
import CategoriesPage from './pages/CategoriesPage'
import AlertsPage from './pages/AlertsPage'
import ReportsPage from './pages/ReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />

          <Route path="/events" element={
            <ProtectedRoute><EventListPage /></ProtectedRoute>
          } />

          <Route path="/events/new" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <EventFormPage />
            </ProtectedRoute>
          } />

          <Route path="/events/:id" element={
            <ProtectedRoute><EventDetailPage /></ProtectedRoute>
          } />

          <Route path="/events/:id/edit" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <EventFormPage />
            </ProtectedRoute>
          } />

          <Route path="/events/:id/expenses/new" element={
            <ProtectedRoute allowedRoles={['organizer', 'finance_manager', 'admin']}>
              <ExpenseFormPage />
            </ProtectedRoute>
          } />

          <Route path="/categories" element={
            <ProtectedRoute><CategoriesPage /></ProtectedRoute>
          } />

          <Route path="/alerts" element={
            <ProtectedRoute allowedRoles={['finance_manager', 'admin']}>
              <AlertsPage />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['finance_manager', 'admin']}>
              <ReportsPage />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}