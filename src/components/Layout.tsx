import { ReactNode, useState, useEffect } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [dimensions, setDimensions] = useState({ width: '90vw', height: '90vh', padding: '24px', radius: '12px' })

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
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: dimensions.padding
    }}>
      <div style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        backgroundColor: '#ffffff',
        borderRadius: dimensions.radius,
        boxShadow: dimensions.radius === '0' ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <main style={{ flex: 1, padding: dimensions.padding, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
