import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { login } from '../services/auth'

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
      await login(email, password)
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
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? '16px' : '24px',
        overflow: 'hidden',
      }}
    >
      {/* Fondo aurora */}
      <div className="login-bg" />
      <div
        className="login-blob"
        style={{ width: '420px', height: '420px', background: '#7b5cc9', top: '-80px', left: '-60px' }}
      />
      <div
        className="login-blob"
        style={{ width: '360px', height: '360px', background: '#9d8ad4', bottom: '-60px', right: '-40px', animationDelay: '-6s' }}
      />
      <div
        className="login-blob"
        style={{ width: '280px', height: '280px', background: '#4c1d95', top: '42%', left: '56%', animationDelay: '-12s' }}
      />

      {/* Tarjeta glassmorphism */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '420px',
          borderRadius: '20px',
          padding: isMobile ? '28px' : '40px',
        }}
      >
        {/* Logo */}
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/logojavi.PNG"
            alt="GUALTECH"
            className="logo-float"
            style={{
              width: isMobile ? '72px' : '96px',
              height: isMobile ? '72px' : '96px',
              objectFit: 'cover',
              borderRadius: '50%',
              marginBottom: '16px',
              boxShadow: '0 10px 40px rgba(123, 92, 201, 0.55)',
            }}
          />
          <h1 style={{ color: '#ffffff', fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>GUALTECH</h1>
          <p style={{ color: '#c4b5fd', fontSize: isMobile ? '12px' : '14px', marginTop: '6px' }}>Gestión de Máquinas</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="animate-fade-in-up"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', animationDelay: '0.15s' }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#e9d5ff' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#e9d5ff' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(248, 113, 113, 0.5)',
                borderRadius: '10px',
                color: '#fecaca',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Iniciando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Signup Link */}
        <div
          className="animate-fade-in-up"
          style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '20px', animationDelay: '0.3s' }}
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '12px' }}>¿No tenés cuenta?</p>
          <Link
            to="/signup"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
            }}
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}
