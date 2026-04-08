import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, LogOut } from 'lucide-react'
import { supabase, isDemoMode } from '../services/supabase'
import { demoMachines } from '../services/demoData'
import { Machine } from '../types'
import logoImage from '../assets/logojavi.PNG'

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

export default function Dashboard() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  
  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    fetchMachines()
  }, [])

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    navigate('/')
  }

  const fetchMachines = async () => {
    try {
      // Modo demo - usar datos de ejemplo
      if (isDemoMode || !supabase) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setMachines(demoMachines)
        setLoading(false)
        return
      }

      // Modo real - traer de Supabase
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMachines(data || [])
    } catch (error) {
      console.error('Error fetching machines:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMachines = machines.filter(m => 
    m.reference.toLowerCase().includes(search.toLowerCase()) ||
    m.serial_number.toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-500'
      case 'inactivo': return 'bg-red-500'
      case 'mantenimiento': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ color: '#532D8C' }}>
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header con logo y logout */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: isMobile ? '16px' : '24px', 
        paddingBottom: '16px', 
        borderBottom: '2px solid #532D8C', 
        flexShrink: 0,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoImage} alt="Javi Control" style={{ width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ color: '#532D8C', fontSize: isMobile ? '18px' : '24px', fontWeight: 'bold' }}>Javi Control</h1>
            <p style={{ color: '#666666', fontSize: isMobile ? '12px' : '14px' }}>Gestión de Máquinas</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: isMobile ? '6px 12px' : '8px 16px', 
            backgroundColor: 'transparent', 
            border: '1px solid #532D8C', 
            borderRadius: '8px', 
            color: '#532D8C', 
            cursor: 'pointer', 
            fontWeight: '600',
            fontSize: isMobile ? '12px' : '14px'
          }}
        >
          <LogOut size={isMobile ? 14 : 18} />
          {isMobile ? 'Salir' : 'Cerrar Sesión'}
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexShrink: 0, flexDirection: isMobile ? 'column' : 'row' }}>
        <Link to="/add-machine" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Agregar Máquina
        </Link>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <Search className="absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666666' }} size={20} />
          <input
            type="text"
            placeholder="Buscar por referencia, número de serie o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)', 
        gap: isMobile ? '8px' : '16px', 
        marginBottom: '24px', 
        flexShrink: 0 
      }}>
        <div className="card">
          <p style={{ color: '#666666', fontSize: isMobile ? '11px' : '14px' }}>Total</p>
          <p style={{ color: '#532D8C', fontSize: isMobile ? '20px' : '36px', fontWeight: 'bold' }}>{machines.length}</p>
        </div>
        <div className="card">
          <p style={{ color: '#666666', fontSize: isMobile ? '11px' : '14px' }}>Activas</p>
          <p style={{ color: '#16a34a', fontSize: isMobile ? '20px' : '36px', fontWeight: 'bold' }}>
            {machines.filter(m => m.status === 'activo').length}
          </p>
        </div>
        <div className="card">
          <p style={{ color: '#666666', fontSize: isMobile ? '11px' : '14px' }}>Mant.</p>
          <p style={{ color: '#ca8a04', fontSize: isMobile ? '20px' : '36px', fontWeight: 'bold' }}>
            {machines.filter(m => m.status === 'mantenimiento').length}
          </p>
        </div>
        <div className="card">
          <p style={{ color: '#666666', fontSize: isMobile ? '11px' : '14px' }}>Inact.</p>
          <p style={{ color: '#dc2626', fontSize: isMobile ? '20px' : '36px', fontWeight: 'bold' }}>
            {machines.filter(m => m.status === 'inactivo').length}
          </p>
        </div>
      </div>

      {/* Machines List - ocupa el resto del espacio */}
      <div className="card" style={{ flex: 1, overflow: 'auto' }}>
        <h2 style={{ color: '#532D8C', fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold', marginBottom: '16px' }}>Máquinas</h2>
        
        {filteredMachines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#666666' }}>
            {search ? 'No se encontraron máquinas' : 'No hay máquinas agregadas aún'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredMachines.map(machine => (
              <Link
                key={machine.id}
                to={`/machine/${machine.id}`}
                style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  padding: isMobile ? '12px' : '16px',
                  backgroundColor: '#ffffff', 
                  border: '1px solid #532D8C',
                  borderRadius: '8px',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '8px' : '0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: getStatusColor(machine.status).replace('bg-', '').replace('-500', '') === 'green' ? '#16a34a' : getStatusColor(machine.status).replace('bg-', '').replace('-500', '') === 'yellow' ? '#ca8a04' : getStatusColor(machine.status).replace('bg-', '').replace('-500', '') === 'red' ? '#dc2626' : '#666666' }} />
                  <div>
                    <p style={{ color: '#532D8C', fontWeight: '600', fontSize: isMobile ? '14px' : '16px' }}>{machine.reference}</p>
                    <p style={{ color: '#1a1a1a', fontSize: isMobile ? '12px' : '14px' }}>{machine.name}</p>
                    <p style={{ color: '#666666', fontSize: isMobile ? '11px' : '12px' }}>N/S: {machine.serial_number}</p>
                  </div>
                </div>
                <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                  <p style={{ color: '#1a1a1a', fontSize: isMobile ? '12px' : '14px' }}>{machine.brand} {machine.model}</p>
                  <p style={{ color: '#666666', fontSize: isMobile ? '12px' : '14px' }}>{machine.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
