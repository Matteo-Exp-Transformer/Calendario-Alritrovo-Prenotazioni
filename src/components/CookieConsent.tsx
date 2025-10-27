import React, { useState, useEffect } from 'react'
import { Button } from './ui'
import { Cookie } from 'lucide-react'

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookie-consent')
    
    if (!hasAccepted) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Cookie className="h-8 w-8 text-al-ritrovo-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Utilizziamo i Cookie
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Questo sito utilizza cookie tecnici necessari al funzionamento del sito e alla fornitura del servizio richiesto, 
              come descritto nella nostra{' '}
              <a 
                href="/privacy" 
                className="text-al-ritrovo-primary hover:underline font-medium"
              >
                Privacy Policy
              </a>.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAccept}
              >
                Accetto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
              >
                Rifiuta
              </Button>
              <a
                href="/privacy"
                className="text-sm text-gray-600 hover:text-al-ritrovo-primary inline-flex items-center"
              >
                Leggi di più
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Animation classes (add to Tailwind config if not present)
// Note: CSS animations are defined here but currently inline styles are used directly
// This can be used in the future if needed
// const styles = `
// @keyframes slide-up {
//   from {
//     transform: translateY(100%);
//     opacity: 0;
//   }
//   to {
//     transform: translateY(0);
//     opacity: 1;
//   }
// }
// 
// .animate-slide-up {
//   animation: slide-up 0.3s ease-out;
// }
// `
