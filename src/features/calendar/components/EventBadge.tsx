import { ChefHat, UtensilsCrossed, Store, Shield, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export type EventBadgeType = 'staff' | 'role' | 'category'

export interface EventBadgeProps {
  assignedTo: string
  type: EventBadgeType
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const CATEGORY_ICONS: Record<string, typeof ChefHat> = {
  Cuochi: ChefHat,
  Camerieri: UtensilsCrossed,
  Banconisti: Store,
  Amministratore: Shield,
}

const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  responsabile: Shield,
  dipendente: User,
  collaboratore: User,
}

const CATEGORY_COLORS: Record<string, string> = {
  Cuochi: 'bg-orange-100 text-orange-700 border-orange-300',
  Camerieri: 'bg-blue-100 text-blue-700 border-blue-300',
  Banconisti: 'bg-purple-100 text-purple-700 border-purple-300',
  Amministratore: 'bg-red-100 text-red-700 border-red-300',
  all: 'bg-gray-100 text-gray-700 border-gray-300',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 border-red-300',
  responsabile: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  dipendente: 'bg-green-100 text-green-700 border-green-300',
  collaboratore: 'bg-yellow-100 text-yellow-700 border-yellow-300',
}

const SIZE_CLASSES = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
}

const ICON_SIZE = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export function EventBadge({
  assignedTo,
  type,
  className,
  size = 'sm',
}: EventBadgeProps) {
  const getIcon = () => {
    if (type === 'category') {
      const Icon = CATEGORY_ICONS[assignedTo] || Users
      return <Icon className={cn(ICON_SIZE[size], 'mr-1')} />
    }

    if (type === 'role') {
      const Icon = ROLE_ICONS[assignedTo] || User
      return <Icon className={cn(ICON_SIZE[size], 'mr-1')} />
    }

    return <User className={cn(ICON_SIZE[size], 'mr-1')} />
  }

  const getColorClass = () => {
    if (type === 'category') {
      return CATEGORY_COLORS[assignedTo] || CATEGORY_COLORS.all
    }

    if (type === 'role') {
      return ROLE_COLORS[assignedTo] || 'bg-gray-100 text-gray-700 border-gray-300'
    }

    return 'bg-blue-100 text-blue-700 border-blue-300'
  }

  const getLabel = () => {
    if (type === 'staff') {
      return assignedTo
    }

    if (type === 'category') {
      return assignedTo === 'all' ? 'Tutti' : assignedTo
    }

    if (type === 'role') {
      const roleLabels: Record<string, string> = {
        admin: 'Admin',
        responsabile: 'Responsabile',
        dipendente: 'Dipendente',
        collaboratore: 'Collaboratore',
      }
      return roleLabels[assignedTo] || assignedTo
    }

    return assignedTo
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        SIZE_CLASSES[size],
        getColorClass(),
        className
      )}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </span>
  )
}

export interface EventBadgeListProps {
  badges: Array<{
    assignedTo: string
    type: EventBadgeType
  }>
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function EventBadgeList({
  badges,
  maxVisible = 3,
  size = 'sm',
  className,
}: EventBadgeListProps) {
  const visibleBadges = badges.slice(0, maxVisible)
  const remainingCount = Math.max(0, badges.length - maxVisible)

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {visibleBadges.map((badge, index) => (
        <EventBadge
          key={`${badge.type}-${badge.assignedTo}-${index}`}
          {...badge}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full border bg-gray-100 text-gray-700 border-gray-300 font-medium',
            SIZE_CLASSES[size]
          )}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  )
}
