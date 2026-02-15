import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/auth-layout'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/Login'
import { RegisterPage } from '@/pages/Register'
import { TransactionsPage } from '@/pages/Transactions'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/transactions" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/transactions', element: <TransactionsPage /> },
        ],
      },
    ],
  },
])
