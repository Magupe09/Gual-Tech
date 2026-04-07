import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isDemoMode } from '../services/supabase'
import logoImage from '../assets/logojavi.PNG'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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
        padding: '24px',
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${logoImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={logoImage} 
            alt="Javi Control" 
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold" style={{ color: '#532D8C' }}>Javi Control</h1>
          <p className="text-sm mt-2" style={{ color: '#7B5CC9' }}>Gestión de Máquinas Industriales</p>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-600 text-sm text-center">
            Modo Demo - Clickea "Iniciar Sesión" para ver la app
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#532D8C' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@email.com"
              required={!isDemoMode}
              disabled={isDemoMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#532D8C' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required={!isDemoMode}
              disabled={isDemoMode}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
            style={{ backgroundColor: '#532D8C', color: '#ffffff' }}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
