import React from 'react'
import { useAdminAuth } from '@/features/booking/hooks/useAdminAuth'
import { useBookingStats } from '@/features/booking/hooks/useBookingQueries'
import { LogOut, User, Shield } from 'lucide-react'

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAdminAuth()
  const { data: stats, isLoading: isLoadingStats } = useBookingStats()

  return (
    <div className="flex items-center gap-2">
      {/* Stats Cards - Elegant Design */}
      <div className="flex items-center gap-2">
        {/* Totale Settimana Card */}
        <div className="bg-gradient-to-br from-purple-500/80 to-pink-600/80 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-xs font-semibold text-yellow-200 uppercase tracking-wide">Settimana</p>
          <p className="text-xl font-bold text-white">
            {isLoadingStats ? '...' : stats?.totalWeek || 0}
          </p>
        </div>
        
        {/* Totale Giorno Card */}
        <div className="bg-gradient-to-br from-cyan-500/80 to-blue-600/80 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-xs font-semibold text-yellow-200 uppercase tracking-wide">Oggi</p>
          <p className="text-xl font-bold text-white">
            {isLoadingStats ? '...' : stats?.totalDay || 0}
          </p>
        </div>
        
        {/* Totale Mese Card */}
        <div className="bg-gradient-to-br from-blue-500/80 to-indigo-600/80 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-xs font-semibold text-yellow-200 uppercase tracking-wide">Mese</p>
          <p className="text-xl font-bold text-white">
            {isLoadingStats ? '...' : stats?.totalMonth || 0}
          </p>
        </div>
        
        {/* Rifiutate Card */}
        <div className="bg-gradient-to-br from-red-500/80 to-orange-600/80 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-xs font-semibold text-yellow-200 uppercase tracking-wide">Rifiutate</p>
          <p className="text-xl font-bold text-white">
            {isLoadingStats ? '...' : stats?.rejected || 0}
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-indigo-900" />
          </div>

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
      <button
        onClick={logout}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border-2 border-red-400/50 rounded-xl text-white font-semibold hover:bg-red-500 hover:border-red-400 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  )
}
