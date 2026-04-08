import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isDemoMode } from '../services/supabase'

// Custom hook for responsive designs
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])
  
  return matches
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  // Responsive
  const isMobile = useMediaQuery('(max-width: 767px)')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Modo demo - siempre permite acceso
      if (isDemoMode || !supabase) {
        // Simular delay para UX
        await new Promise(resolve => setTimeout(resolve, 500))
        navigate('/dashboard')
        return
      }

      // Modo real - usar Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      navigate('/dashboard')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? '16px' : '24px',
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(/logojavi.PNG)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div style={{ 
        width: '100%', 
        maxWidth: isMobile ? '100%' : '480px', 
        backgroundColor: '#ffffff', 
        borderRadius: isMobile ? '0' : '12px', 
        padding: isMobile ? '24px' : '32px', 
        boxShadow: isMobile ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.15)' 
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
          <img 
            src="/logojavi.PNG" 
            alt="Javi Control" 
            style={{ width: isMobile ? '80px' : '128px', height: isMobile ? '80px' : '128px', objectFit: 'contain', marginBottom: '16px' }}
          />
          <h1 style={{ color: '#532D8C', fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>Javi Control</h1>
          <p style={{ color: '#7B5CC9', fontSize: isMobile ? '12px' : '14px', marginTop: '8px' }}>Gestión de Máquinas</p>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', textAlign: 'center', color: '#92400e', fontSize: isMobile ? '12px' : '14px' }}>
            Modo Demo - Click 「Iniciar Sesión」 para ver la app
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: isMobile ? '13px' : '14px', fontWeight: '500', marginBottom: '8px', color: '#532D8C' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #532D8C', backgroundColor: '#ffffff', color: '#1a1a1a', fontSize: isMobile ? '14px' : '16px' }}
              placeholder="tu@email.com"
              required={!isDemoMode}
              disabled={isDemoMode}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: isMobile ? '13px' : '14px', fontWeight: '500', marginBottom: '8px', color: '#532D8C' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #532D8C', backgroundColor: '#ffffff', color: '#1a1a1a', fontSize: isMobile ? '14px' : '16px' }}
              placeholder="••••••••"
              required={!isDemoMode}
              disabled={isDemoMode}
            />
          </div>

          {error && (
            <div style={{ padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#dc2626', fontSize: isMobile ? '12px' : '14px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px 24px', 
              backgroundColor: '#532D8C', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600', 
              fontSize: isMobile ? '14px' : '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
