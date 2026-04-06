import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, LogOut } from 'lucide-react'
import { supabase, isDemoMode } from '../services/supabase'
import { demoMachines } from '../services/demoData'
import { Machine } from '../types'

export default function Dashboard() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchMachines()
  }, [])

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

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    window.location.href = '/'
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
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="bg-surface border-b border-primary px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-white">J</span>
            </div>
            <h1 className="text-xl font-bold text-white">Javi Control</h1>
          </div>
          <button onClick={handleLogout} className="btn-secondary flex items-center gap-2">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Link to="/add-machine" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Agregar Máquina
          </Link>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-text-muted text-sm">Total Máquinas</p>
            <p className="text-3xl font-bold text-white">{machines.length}</p>
          </div>
          <div className="card">
            <p className="text-text-muted text-sm">Activas</p>
            <p className="text-3xl font-bold text-green-500">
              {machines.filter(m => m.status === 'activo').length}
            </p>
          </div>
          <div className="card">
            <p className="text-text-muted text-sm">En Mantenimiento</p>
            <p className="text-3xl font-bold text-yellow-500">
              {machines.filter(m => m.status === 'mantenimiento').length}
            </p>
          </div>
          <div className="card">
            <p className="text-text-muted text-sm">Inactivas</p>
            <p className="text-3xl font-bold text-red-500">
              {machines.filter(m => m.status === 'inactivo').length}
            </p>
          </div>
        </div>

        {/* Machines List */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4">Máquinas</h2>
          
          {filteredMachines.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              {search ? 'No se encontraron máquinas con ese filtro' : 'No hay máquinas agregadas aún'}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredMachines.map(machine => (
                <Link
                  key={machine.id}
                  to={`/machine/${machine.id}`}
                  className="flex items-center justify-between p-4 bg-surface-light rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(machine.status)}`} />
                    <div>
                      <p className="font-semibold text-white">{machine.reference}</p>
                      <p className="text-sm text-text-muted">{machine.name} - {machine.serial_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-muted">{machine.brand} {machine.model}</p>
                    <p className="text-sm text-text-muted">{machine.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
