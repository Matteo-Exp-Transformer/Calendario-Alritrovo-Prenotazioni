import React from 'react'
import { useAdminAuth } from '@/features/booking/hooks/useAdminAuth'
import { Button } from './ui'

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAdminAuth()

  return (
    <header className="bg-al-ritrovo-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Al Ritrovo</h1>
          <p className="text-sm text-gray-300">Dashboard Admin</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">
              {user?.name || user?.email}
            </p>
            {user?.name && (
              <p className="text-xs text-gray-400">{user.email}</p>
            )}
            <p className="text-xs text-gray-400">
              {user?.role === 'admin' ? 'Amministratore' : 'Staff'}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-white hover:bg-al-ritrovo-primary-dark"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
