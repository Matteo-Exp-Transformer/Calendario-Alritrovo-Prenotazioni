import { createBrowserRouter, Navigate } from 'react-router-dom'
import { BookingRequestPage } from './pages/BookingRequestPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboard } from './pages/AdminDashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/prenota" replace />
  },
  {
    path: '/prenota',
    element: <BookingRequestPage />
  },
  {
    path: '/login',
    element: <AdminLoginPage />
  },
  {
    path: '/admin',
    element: <AdminDashboard />
  },
  {
    path: '*',
    element: <Navigate to="/prenota" replace />
  }
])
