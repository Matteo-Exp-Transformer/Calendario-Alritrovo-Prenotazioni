import React, { useState } from 'react'
import { AdminHeader } from '@/components/AdminHeader'
import { useBookingStats } from '@/features/booking/hooks/useBookingQueries'
import { PendingRequestsTab } from '@/features/booking/components/PendingRequestsTab'
import { ArchiveTab } from '@/features/booking/components/ArchiveTab'
import { BookingCalendarTab } from '@/features/booking/components/BookingCalendarTab'
import { SettingsTab } from '@/features/booking/components/SettingsTab'
import { AdminBookingForm } from '@/features/booking/components/AdminBookingForm'
import { Calendar, Clock, Archive, Settings, Plus } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'

type Tab = 'calendar' | 'pending' | 'archive' | 'settings'

interface NavItemProps {
  icon: React.ElementType
  label: string
  active?: boolean
  badge?: number
  onClick: () => void
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, badge, onClick }) => (
  <div 
    onClick={onClick}
    style={{ backgroundColor: 'rgba(40, 55, 70, 0.85)', color: '#FFFFFF' }}
    className={`
      relative flex items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 rounded-3xl transition-all duration-200 font-black tracking-wide border-2 cursor-pointer
      ${active
        ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 border-gray-800'
        : 'border-gray-800 hover:bg-[#2D3A4D] hover:border-gray-900 active:scale-95'
      }
    `}>
    <div className={`
      w-11 h-11 rounded-2xl flex items-center justify-center transition-all
      ${active
        ? 'bg-white/30'
        : 'bg-white/10 group-hover:bg-white/20'
      }
    `}>
      <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
    </div>

    <span className="text-white text-sm md:text-base uppercase tracking-widest">{label}</span>

    {badge && badge > 0 && (
      <div className="relative">
        <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-75"></div>
        <span className="relative inline-flex items-center justify-center min-w-[28px] h-7 bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-black px-2.5 rounded-full shadow-[0_4px_16px_rgba(239,68,68,0.6)] border-2 border-white/50">
          {badge}
        </span>
      </div>
    )}
  </div>
)


export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calendar')
  const [showPendingPanel, setShowPendingPanel] = useState(false)
  const [showNewBookingPanel, setShowNewBookingPanel] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)
  const { data: stats, isLoading: isLoadingStats } = useBookingStats()

  // Chiudi il pannello pendenti quando cambi tab
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab !== 'calendar') {
      setShowPendingPanel(false)
      // Reset selectedCalendarDate quando si cambia tab (tranne quando si va al calendario da Archivio)
      // Verrà resettato dopo che il calendario lo ha processato
    }
  }

  // Callback per navigare al calendario da Archivio
  const handleViewInCalendar = (date: string) => {
    setSelectedCalendarDate(date)
    setActiveTab('calendar')
    // Reset selectedCalendarDate dopo un delay per permettere al calendario di processarlo
    setTimeout(() => {
      setSelectedCalendarDate(null)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header con Navbar Orizzontale - Tema Colorato Professionale */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl border-b-4 border-yellow-400/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-3">
          {/* Top Bar: Logo + Stats + User Info - Allineati a sinistra */}
          <div className="flex items-center gap-6 mb-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white drop-shadow-lg">Al Ritrovo</h1>
              <p className="text-yellow-200 text-xs md:text-sm mt-0 font-medium leading-tight">Dashboard Amministratore</p>
            </div>
            <AdminHeader />
          </div>

          {/* Navigation Tabs Orizzontale */}
          <nav className="flex flex-wrap items-center gap-5 md:gap-6 pb-2 mt-4">
            <NavItem
              icon={Calendar}
              label="Calendario"
              active={activeTab === 'calendar'}
              onClick={() => handleTabChange('calendar')}
            />
            <NavItem
              icon={Clock}
              label="Prenotazioni Pendenti"
              active={activeTab === 'pending'}
              badge={stats?.pending}
              onClick={() => {
                handleTabChange('pending')
                setShowPendingPanel(true)
              }}
            />
            <NavItem
              icon={Archive}
              label="Archivio"
              active={activeTab === 'archive'}
              onClick={() => handleTabChange('archive')}
            />
            <NavItem
              icon={Settings}
              label="Impostazioni"
              active={activeTab === 'settings'}
              onClick={() => handleTabChange('settings')}
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Statistiche Cards - Solo se non in modalità impostazioni */}
        {activeTab !== 'settings' && (
          <div className="space-y-4 mb-8">
            {/* Collapse Card per Inserisci nuova prenotazione */}
            <CollapsibleCard
              title="Inserisci nuova prenotazione"
              subtitle="Crea una nuova prenotazione nel sistema"
              icon={Plus}
              defaultExpanded={false}
              expanded={showNewBookingPanel}
              onExpandedChange={setShowNewBookingPanel}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 shadow-xl"
              style={{ borderColor: 'rgba(40, 55, 70, 0.85)' }}
              headerClassName="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <div className="bg-white rounded-lg">
                <AdminBookingForm />
              </div>
            </CollapsibleCard>

            {/* Collapse Card con Prenotazioni Pendenti */}
            <CollapsibleCard
              title="Prenotazioni Pendenti"
              subtitle={isLoadingStats ? 'Caricamento...' : `${stats?.pending || 0} in attesa`}
              icon={Clock}
              defaultExpanded={false}
              expanded={showPendingPanel}
              onExpandedChange={setShowPendingPanel}
              counter={stats?.pending}
              className="bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl"
              style={{ borderColor: 'rgba(40, 55, 70, 0.85)' }}
              headerClassName="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <PendingRequestsTab />
              </div>
            </CollapsibleCard>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 min-h-[600px] border-2 border-purple-100 relative">
          {activeTab === 'calendar' && <BookingCalendarTab initialDate={selectedCalendarDate} />}
          {activeTab === 'pending' && <PendingRequestsTab />}
          {activeTab === 'archive' && <ArchiveTab onViewInCalendar={handleViewInCalendar} />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center text-sm text-warm-wood/60">
          <p>Al Ritrovo Booking System v2.0 - Dashboard Amministratore</p>
        </div>
      </footer>
    </div>
  )
}
