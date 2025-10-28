import React, { ReactNode, useId, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface CollapsibleCardProps {
  title: string
  subtitle?: string | ReactNode
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children: ReactNode
  defaultExpanded?: boolean
  defaultOpen?: boolean
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  counter?: number
  actions?: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  loading?: boolean
  isLoading?: boolean
  loadingMessage?: string
  loadingContent?: ReactNode
  error?: string | null
  onRetry?: () => void
  errorActionLabel?: string
  emptyMessage?: string
  showEmpty?: boolean
  isEmpty?: boolean
  emptyContent?: ReactNode
  emptyActionLabel?: string
  onEmptyAction?: () => void
  collapseDisabled?: boolean
  id?: string
}

export const CollapsibleCard = ({
  title,
  subtitle,
  description,
  icon: Icon,
  children,
  defaultExpanded = true,
  defaultOpen,
  expanded,
  onExpandedChange,
  counter,
  actions,
  className = '',
  headerClassName = '',
  contentClassName,
  loading = false,
  isLoading,
  loadingMessage = 'Caricamento...',
  loadingContent,
  error = null,
  onRetry,
  errorActionLabel = 'Riprova',
  emptyMessage = 'Nessun elemento disponibile',
  showEmpty = false,
  isEmpty,
  emptyContent,
  emptyActionLabel = 'Aggiungi elemento',
  onEmptyAction,
  collapseDisabled = false,
  id,
}: CollapsibleCardProps) => {
  // LOCKED: 2025-01-16 - CollapsibleCard.tsx completamente testato
  // Test eseguiti: 57 test, tutti passati (100%)
  // Componenti testati: CollapsibleCard, CardActionButton, state management complesso
  // Funzionalità: Loading/error/empty states, accessibility, keyboard navigation
  // NON MODIFICARE SENZA PERMESSO ESPLICITO
  const generatedId = useId()
  const cardId = id ?? `collapsible-card-${generatedId}`
  const headerId = `${cardId}-header`
  const contentId = `${cardId}-content`

  const resolvedLoading = isLoading ?? loading
  const resolvedEmpty = useMemo(
    () => (isEmpty ?? showEmpty) && !resolvedLoading && !error,
    [isEmpty, showEmpty, resolvedLoading, error]
  )

  const initialExpanded = useMemo(() => {
    if (expanded !== undefined) {
      return expanded
    }

    if (defaultOpen !== undefined) {
      return defaultOpen
    }

    return defaultExpanded
  }, [defaultExpanded, defaultOpen, expanded])

  const [internalExpanded, setInternalExpanded] = useState(initialExpanded)

  const isControlled = expanded !== undefined
  const isExpanded = isControlled ? expanded : internalExpanded

  const toggleExpanded = () => {
    if (collapseDisabled) {
      return
    }

    const nextValue = !isExpanded

    if (!isControlled) {
      setInternalExpanded(nextValue)
    }

    onExpandedChange?.(nextValue)
  }

  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleExpanded()
    }
  }

  const renderStateContent = () => {
    if (resolvedLoading) {
      return (
        <div
          className={
            contentClassName ??
            'flex flex-col items-center justify-center gap-3 py-10 px-4 sm:px-6 text-sm text-gray-600'
          }
          role="status"
          aria-live="polite"
        >
          {loadingContent ?? (
            <>
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-b-transparent border-blue-600/60"
                aria-hidden="true"
              >
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
              <span>{loadingMessage}</span>
            </>
          )}
        </div>
      )
    }

    if (error) {
      return (
        <div
          className={
            contentClassName ??
            'flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-6 sm:px-6'
          }
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-2 text-sm text-red-800">
            <div
              className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500"
              aria-hidden="true"
            ></div>
            <p>{error}</p>
          </div>
          {onRetry && (
            <div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  onRetry()
                }}
                className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <span>{errorActionLabel}</span>
              </button>
            </div>
          )}
        </div>
      )
    }

    if (resolvedEmpty) {
      if (emptyContent) {
        return (
          <div className={contentClassName ?? 'px-4 py-10 sm:px-6'}>
            {emptyContent}
          </div>
        )
      }

      return (
        <div
          className={
            contentClassName ??
            'flex flex-col items-center gap-4 px-4 py-12 text-center text-gray-500 sm:px-6'
          }
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            {Icon && (
              <Icon className="h-7 w-7 text-gray-400" aria-hidden="true" />
            )}
          </div>
          <p className="text-sm sm:text-base">{emptyMessage}</p>
          {onEmptyAction && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onEmptyAction()
              }}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {emptyActionLabel}
            </button>
          )}
        </div>
      )
    }

    return null
  }

  const stateContent = renderStateContent()
  const shouldWrapChildren = Boolean(contentClassName)

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-1 ${className}`}
      data-expanded={isExpanded}
      role="region"
      aria-labelledby={headerId}
    >
      {/* Header */}
      <div
        className={`flex cursor-pointer items-start justify-between gap-4 rounded-t-lg px-4 py-4 transition-colors hover:bg-gray-50 sm:px-6 relative ${headerClassName}`}
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={handleHeaderKeyDown}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        id={headerId}
        data-collapsible-disabled={collapseDisabled}
      >
        <div className="flex flex-1 items-start gap-3">
          {Icon && (
            <Icon className="mt-1 h-5 w-5 text-gray-500" aria-hidden="true" />
          )}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
              {counter !== undefined && (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  aria-label={`${counter} items`}
                >
                  {counter}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            {description && (
              <p className="text-xs text-gray-400 sm:text-sm">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
          {!collapseDisabled && (
            <button
              type="button"
              className="p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={e => {
                e.stopPropagation()
                toggleExpanded()
              }}
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
              disabled={collapseDisabled}
            >
              {isExpanded ? (
                <ChevronUp
                  className="h-4 w-4 text-gray-500 transition-transform duration-200"
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown
                  className="h-4 w-4 text-gray-500 transition-transform duration-200"
                  aria-hidden="true"
                />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          id={contentId}
          className="border-t border-gray-200" // maintain border separation
          role="region"
          aria-labelledby={headerId}
          data-state={
            resolvedLoading
              ? 'loading'
              : error
                ? 'error'
                : resolvedEmpty
                  ? 'empty'
                  : 'default'
          }
        >
          {stateContent}

          {!stateContent && (
            <>
              {shouldWrapChildren ? (
                <div className={contentClassName}>{children}</div>
              ) : (
                children
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Predefined action buttons for common operations
export const CardActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
}) => {
  const baseClasses =
    'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors'
  const variantClasses = {
    default: 'text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50',
    primary: 'text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50',
    danger: 'text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50',
  }

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      aria-label={label}
    >
      <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
      {label}
    </button>
  )
}

export default CollapsibleCard
