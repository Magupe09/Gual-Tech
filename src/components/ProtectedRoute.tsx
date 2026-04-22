import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute
 * 
 * Este componente protege las rutas que requieren autenticación.
 * 
 * ¿Cómo funciona?
 * 1. Verifica si hay usuario logueado
 * 2. Si SÍ → muestra el contenido
 * 3. Si NO → redirige a login
 * 
 * @param children - El componente a mostrar si está autenticado
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        setIsAuthenticated(!!user)
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Mientras verifica la autenticación, muestra un loader
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '32px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #532D8C',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666' }}>Cargando...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Si NO está autenticado, redirige a login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Si está autenticado, muestra el contenido
  return <>{children}</>
}
