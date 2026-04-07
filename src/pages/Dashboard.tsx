import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, LogOut } from 'lucide-react'
import { supabase, isDemoMode } from '../services/supabase'
import { demoMachines } from '../services/demoData'
import { Machine } from '../types'
import logoImage from '../assets/logojavi.PNG'

export default function Dashboard() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #532D8C', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoImage} alt="Javi Control" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ color: '#532D8C', fontSize: '24px', fontWeight: 'bold' }}>Javi Control</h1>
            <p style={{ color: '#666666', fontSize: '14px' }}>Gestión de Máquinas Industriales</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #532D8C', borderRadius: '8px', color: '#532D8C', cursor: 'pointer', fontWeight: '600' }}
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexShrink: 0 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px', flexShrink: 0 }}>
        <div className="card">
          <p className="text-sm" style={{ color: '#666666' }}>Total Máquinas</p>
          <p className="text-3xl font-bold" style={{ color: '#532D8C' }}>{machines.length}</p>
        </div>
        <div className="card">
          <p className="text-sm" style={{ color: '#666666' }}>Activas</p>
          <p className="text-3xl font-bold" style={{ color: '#16a34a' }}>
            {machines.filter(m => m.status === 'activo').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm" style={{ color: '#666666' }}>En Mantenimiento</p>
          <p className="text-3xl font-bold" style={{ color: '#ca8a04' }}>
            {machines.filter(m => m.status === 'mantenimiento').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm" style={{ color: '#666666' }}>Inactivas</p>
          <p className="text-3xl font-bold" style={{ color: '#dc2626' }}>
            {machines.filter(m => m.status === 'inactivo').length}
          </p>
        </div>
      </div>

      {/* Machines List - ocupa el resto del espacio */}
      <div className="card" style={{ flex: 1, overflow: 'auto' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#532D8C' }}>Máquinas</h2>
        
        {filteredMachines.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#666666' }}>
            {search ? 'No se encontraron máquinas con ese filtro' : 'No hay máquinas agregadas aún'}
          </div>
        ) : (
          <div className="machines-list">
            {filteredMachines.map(machine => (
              <Link
                key={machine.id}
                to={`/machine/${machine.id}`}
                className="flex items-center justify-between p-4 rounded-lg transition-all duration-200"
                style={{ 
                  backgroundColor: '#f5f5f5', 
                  border: '1px solid #532D8C' 
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(machine.status)}`} />
                  <div>
                    <p className="font-semibold" style={{ color: '#1a1a1a' }}>{machine.reference}</p>
                    <p className="text-sm" style={{ color: '#666666' }}>{machine.name} - {machine.serial_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm" style={{ color: '#666666' }}>{machine.brand} {machine.model}</p>
                  <p className="text-sm" style={{ color: '#666666' }}>{machine.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
