import React from 'react'
import { useAdminAuth } from '@/features/booking/hooks/useAdminAuth'
import { useBookingStats } from '@/features/booking/hooks/useBookingQueries'
import { User, Shield } from 'lucide-react'

export const AdminHeader: React.FC = () => {
  const { user } = useAdminAuth()
  const { data: stats, isLoading: isLoadingStats } = useBookingStats()

  return (
    <div className="flex items-center gap-2 lg:gap-3 w-full">
      {/* Stats Cards - STILE UNIFORME MODERNO - Ridotte 3/4 */}
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        {/* Settimana */}
        <div className="bg-white rounded-modern border-2 border-gray-400 shadow-md hover:shadow-lg hover:border-violet-500 transition-all p-2 lg:p-3 flex flex-col items-center justify-center min-h-[60px] min-w-[70px] lg:min-h-[70px] lg:min-w-[85px]">
          <p className="text-[8px] lg:text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 lg:mb-1 text-center">Settimana</p>
          <p className="text-2xl lg:text-3xl font-black text-gray-900 leading-none text-center">
            {isLoadingStats ? '...' : stats?.totalWeek || 0}
          </p>
        </div>

        {/* Oggi */}
        <div className="bg-white rounded-modern border-2 border-gray-400 shadow-md hover:shadow-lg hover:border-cyan-500 transition-all p-2 lg:p-3 flex flex-col items-center justify-center min-h-[60px] min-w-[70px] lg:min-h-[70px] lg:min-w-[85px]">
          <p className="text-[8px] lg:text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 lg:mb-1 text-center">Oggi</p>
          <p className="text-2xl lg:text-3xl font-black text-gray-900 leading-none text-center">
            {isLoadingStats ? '...' : stats?.totalDay || 0}
          </p>
        </div>

        {/* Mese */}
        <div className="bg-white rounded-modern border-2 border-gray-400 shadow-md hover:shadow-lg hover:border-blue-500 transition-all p-2 lg:p-3 flex flex-col items-center justify-center min-h-[60px] min-w-[70px] lg:min-h-[70px] lg:min-w-[85px]">
          <p className="text-[8px] lg:text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 lg:mb-1 text-center">Mese</p>
          <p className="text-2xl lg:text-3xl font-black text-gray-900 leading-none text-center">
            {isLoadingStats ? '...' : stats?.totalMonth || 0}
          </p>
        </div>

        {/* Rifiutate */}
        <div className="bg-white rounded-modern border-2 border-gray-400 shadow-md hover:shadow-lg hover:border-rose-500 transition-all p-2 lg:p-3 flex flex-col items-center justify-center min-h-[60px] min-w-[70px] lg:min-h-[70px] lg:min-w-[85px]">
          <p className="text-[8px] lg:text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 lg:mb-1 text-center">Rifiutate</p>
          <p className="text-2xl lg:text-3xl font-black text-gray-900 leading-none text-center">
            {isLoadingStats ? '...' : stats?.rejected || 0}
          </p>
        </div>

        {/* User Info - Accanto al count Rifiutate */}
        <div className="bg-white rounded-modern border-2 border-gray-400 shadow-md hover:shadow-lg hover:border-purple-500 transition-all px-2 lg:px-3 py-2 lg:py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <User className="w-3.5 h-3.5 lg:w-4.5 lg:h-4.5 text-white" />
            </div>

            <div className="text-left min-w-0">
              <p className="text-[10px] lg:text-xs font-bold text-gray-900 leading-tight truncate">
                {user?.name || user?.email}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-md bg-yellow-400 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Shield className="w-1.5 h-1.5 lg:w-2 lg:h-2 text-yellow-900" />
                </div>
                <p className="text-[8px] lg:text-[9px] font-semibold text-gray-600 tracking-wide uppercase">
                  {user?.role === 'admin' ? 'Admin' : 'Staff'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
