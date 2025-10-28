import React from 'react'
import { useAdminAuth } from '@/features/booking/hooks/useAdminAuth'
import { useBookingStats } from '@/features/booking/hooks/useBookingQueries'
import { LogOut, User, Shield, TrendingUp, Calendar, BarChart3, XCircle } from 'lucide-react'

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAdminAuth()
  const { data: stats, isLoading: isLoadingStats } = useBookingStats()

  return (
    <div className="flex items-center gap-6">
      {/* Stats Cards - VERO DESIGN MODERNO CON NEUMORPHISM */}
      <div className="flex items-center gap-4">
        {/* Settimana - Neumorphic Card */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 rounded-3xl p-6 shadow-[8px_8px_24px_rgba(139,92,246,0.3),-8px_-8px_24px_rgba(236,72,153,0.2)] border-2 border-white/40">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-white/30 backdrop-blur-sm shadow-inner flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <p className="text-[9px] font-black text-white/90 uppercase tracking-[0.15em] leading-tight">Settimana</p>
              </div>
              <p className="text-4xl font-black text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                {isLoadingStats ? '...' : stats?.totalWeek || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Oggi - Neumorphic Card */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 rounded-3xl p-6 shadow-[8px_8px_24px_rgba(6,182,212,0.3),-8px_-8px_24px_rgba(59,130,246,0.2)] border-2 border-white/40">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-white/30 backdrop-blur-sm shadow-inner flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <p className="text-[9px] font-black text-white/90 uppercase tracking-[0.15em] leading-tight">Oggi</p>
              </div>
              <p className="text-4xl font-black text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                {isLoadingStats ? '...' : stats?.totalDay || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Mese - Neumorphic Card */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-600 rounded-3xl p-6 shadow-[8px_8px_24px_rgba(59,130,246,0.3),-8px_-8px_24px_rgba(99,102,241,0.2)] border-2 border-white/40">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-white/30 backdrop-blur-sm shadow-inner flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <p className="text-[9px] font-black text-white/90 uppercase tracking-[0.15em] leading-tight">Mese</p>
              </div>
              <p className="text-4xl font-black text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                {isLoadingStats ? '...' : stats?.totalMonth || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Rifiutate - Neumorphic Card */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-orange-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-orange-600 rounded-3xl p-6 shadow-[8px_8px_24px_rgba(244,63,94,0.3),-8px_-8px_24px_rgba(249,115,22,0.2)] border-2 border-white/40">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-white/30 backdrop-blur-sm shadow-inner flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <p className="text-[9px] font-black text-white/90 uppercase tracking-[0.15em] leading-tight">Rifiutate</p>
              </div>
              <p className="text-4xl font-black text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                {isLoadingStats ? '...' : stats?.rejected || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Card - Design Elegante con Depth */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
        <div className="relative bg-white/20 backdrop-blur-xl rounded-3xl px-6 py-4 border-2 border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 rounded-full blur-md opacity-75"></div>
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_24px_rgba(168,85,247,0.4)] ring-4 ring-white/50">
                <User className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            </div>

            <div className="text-left">
              <p className="text-sm font-black text-white leading-tight tracking-wide drop-shadow-md">
                {user?.name || user?.email}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-5 h-5 rounded-lg bg-yellow-400/80 backdrop-blur-sm flex items-center justify-center shadow-md">
                  <Shield className="w-3 h-3 text-yellow-900" />
                </div>
                <p className="text-xs font-bold text-yellow-100 tracking-wider uppercase">
                  {user?.role === 'admin' ? 'Admin' : 'Staff'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button - Design Distintivo */}
      <button
        onClick={logout}
        className="group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
        <div className="relative inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl text-white font-black tracking-wide shadow-[0_8px_24px_rgba(244,63,94,0.4)] border-2 border-white/30 hover:shadow-[0_12px_32px_rgba(244,63,94,0.6)] transition-all">
          <LogOut className="w-5 h-5 drop-shadow-lg" />
          <span className="text-sm uppercase tracking-widest drop-shadow-md">Logout</span>
        </div>
      </button>
    </div>
  )
}
