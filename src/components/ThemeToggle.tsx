import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'

/**
 * ThemeToggle
 *
 * Botón sol/luna que alterna entre modo claro y oscuro.
 * Posición: esquina superior izquierda (se usa dentro del Layout).
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '2px solid var(--color-primary)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-primary)',
        cursor: 'pointer',
        transition: 'all 0.35s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 92, 201, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
    >
      {theme === 'light' ? (
        <Moon size={20} />
      ) : (
        <Sun size={20} />
      )}
    </button>
  )
}
