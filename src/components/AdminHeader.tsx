import React from 'react'
import { useAdminAuth } from '@/features/booking/hooks/useAdminAuth'
import { Button } from './ui'
import { LogOut, User, Shield } from 'lucide-react'

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAdminAuth()

  return (
    <div className="flex items-center gap-4">
      {/* User Info Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
        <div className="flex items-center gap-3">
          {/* Avatar Icon */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-indigo-900" />
          </div>

          {/* User Details */}
          <div className="text-right">
            <p className="text-sm font-bold text-white">
              {user?.name || user?.email}
            </p>
            <div className="flex items-center gap-1.5 justify-end">
              <Shield className="w-3 h-3 text-yellow-300" />
              <p className="text-xs text-yellow-200 font-medium">
                {user?.role === 'admin' ? 'Amministratore' : 'Staff'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <Button
        variant="outline"
        size="md"
        onClick={logout}
        className="bg-white/10 border-2 border-white/30 text-white hover:bg-red-500 hover:border-red-400 hover:scale-105 transition-all"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  )
}
