import { ReactNode, useState, useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'
import ThemeToggle from './ThemeToggle'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [dimensions, setDimensions] = useState({ width: '90vw', height: '90vh', padding: '24px', radius: '12px' })
  const theme = useThemeStore((s) => s.theme)

  // Sincronizar atributo data-theme en <html> para que CSS responda
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        // Mobile
        setDimensions({ width: '100vw', height: '100vh', padding: '16px', radius: '0' })
      } else if (width < 1024) {
        // Tablet
        setDimensions({ width: '95vw', height: '90vh', padding: '20px', radius: '12px' })
      } else {
        // Desktop
        setDimensions({ width: '90vw', height: '90vh', padding: '24px', radius: '12px' })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div style={{ 
      backgroundColor: 'var(--color-bg-dark)', 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: dimensions.padding,
      transition: 'background-color 0.35s ease'
    }}>
      <ThemeToggle />

      <div style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        backgroundColor: 'var(--color-surface)',
        borderRadius: dimensions.radius,
        boxShadow: dimensions.radius === '0' ? 'none' : theme === 'dark'
          ? '0 4px 24px rgba(0, 0, 0, 0.5)'
          : '0 4px 20px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.35s ease, box-shadow 0.35s ease'
      }}>
        <main style={{ flex: 1, padding: dimensions.padding, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
