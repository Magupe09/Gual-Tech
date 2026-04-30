import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../services/auth'

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

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  
  // Responsive
  const isMobile = useMediaQuery('(max-width: 767px)')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validaciones básicas
    if (!email.trim()) {
      setError('El email es requerido')
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError('La contraseña es requerida')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres')
      setLoading(false)
      return
    }

    try {
      await signup(email, password)
      setSuccess('✅ Cuenta creada exitosamente. Redirigiendo al dashboard...')
      
      // Redirigir después de 2 segundos para que vea el mensaje
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse'
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
            alt="GUALTECH" 
            style={{ width: isMobile ? '80px' : '128px', height: isMobile ? '80px' : '128px', objectFit: 'contain', marginBottom: '16px' }}
          />
          <h1 style={{ color: '#532D8C', fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>GUALTECH</h1>
          <p style={{ color: '#7B5CC9', fontSize: isMobile ? '12px' : '14px', marginTop: '8px' }}>Crea tu cuenta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: isMobile ? '13px' : '14px', fontWeight: '500', marginBottom: '8px', color: '#532D8C' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #532D8C', backgroundColor: '#ffffff', color: '#1a1a1a', fontSize: isMobile ? '14px' : '16px', boxSizing: 'border-box' }}
              placeholder="tu@email.com"
              required
            />
            <p style={{ fontSize: '12px', color: '#7B5CC9', marginTop: '6px', fontStyle: 'italic' }}>
              ℹ️ Solo ciertos emails están autorizados para registrarse
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: isMobile ? '13px' : '14px', fontWeight: '500', marginBottom: '8px', color: '#532D8C' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #532D8C', backgroundColor: '#ffffff', color: '#1a1a1a', fontSize: isMobile ? '14px' : '16px', boxSizing: 'border-box' }}
              placeholder="••••••••"
              required
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
              Mínimo 8 caracteres
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: isMobile ? '13px' : '14px', fontWeight: '500', marginBottom: '8px', color: '#532D8C' }}>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #532D8C', backgroundColor: '#ffffff', color: '#1a1a1a', fontSize: isMobile ? '14px' : '16px', boxSizing: 'border-box' }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#dc2626', fontSize: isMobile ? '12px' : '14px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '12px', backgroundColor: '#dcfce7', border: '1px solid #22c55e', borderRadius: '8px', color: '#16a34a', fontSize: isMobile ? '12px' : '14px' }}>
              {success}
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
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Login Link */}
        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
          <p style={{ color: '#666', fontSize: isMobile ? '13px' : '14px', marginBottom: '12px' }}>
            ¿Ya tenés cuenta?
          </p>
          <Link 
            to="/" 
            style={{ 
              display: 'inline-block',
              padding: '10px 20px', 
              backgroundColor: '#f0e6ff', 
              color: '#532D8C', 
              border: '2px solid #532D8C', 
              borderRadius: '8px', 
              fontWeight: '600', 
              fontSize: isMobile ? '14px' : '16px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#532D8C'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0e6ff'
              e.currentTarget.style.color = '#532D8C'
            }}
          >
            Volver a Login
          </Link>
        </div>
      </div>
    </div>
  )
}
