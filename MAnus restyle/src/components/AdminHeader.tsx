import React from 'react'
import { useAdminAuth } from '@/features/booking/hooks/useAdminAuth'
import { Button } from './ui'

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAdminAuth()

  return (
    <header className="bg-white text-gray-800 border-b border-gray-200 p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-al-ritrovo-primary">Al Ritrovo</h1>
          <p className="text-sm text-gray-500">Dashboard Admin</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold">
              {user?.name || user?.email}
            </p>
            {user?.name && (
              <p className="text-xs text-gray-500">{user.email}</p>
            )}
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Amministratore' : 'Staff'}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-gray-600 hover:bg-gray-100 border-gray-300"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
