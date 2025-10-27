import React from 'react'

export const AdminLoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-al-ritrovo-primary mb-2">
            Al Ritrovo
          </h1>
          <p className="text-gray-600">Area Admin - Login</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Sistema di autenticazione in arrivo nella Fase 3...
          </p>
        </div>
      </div>
    </div>
  )
}
