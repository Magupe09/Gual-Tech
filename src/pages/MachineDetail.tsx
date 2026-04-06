import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, FileText, Calendar, User, Package } from 'lucide-react'
import { supabase, isDemoMode } from '../services/supabase'
import { demoMachines, demoReports } from '../services/demoData'
import { Machine, Report } from '../types'

export default function MachineDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [machine, setMachine] = useState<Machine | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchMachine()
      fetchReports()
    }
  }, [id])

  const fetchMachine = async () => {
    try {
      if (isDemoMode || !supabase) {
        await new Promise(resolve => setTimeout(resolve, 200))
        const found = demoMachines.find(m => m.id === id)
        setMachine(found || null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setMachine(data)
    } catch (error) {
      console.error('Error fetching machine:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      if (isDemoMode || !supabase) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setReports(demoReports[id || ''] || [])
        return
      }

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('machine_id', id)
        .order('report_date', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-500'
      case 'inactivo': return 'bg-red-500'
      case 'mantenimiento': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'preventivo': return 'bg-blue-500'
      case 'correctivo': return 'bg-red-500'
      case 'predictivo': return 'bg-purple-500'
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

  if (!machine) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-white text-xl">Máquina no encontrada</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary p-2">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{machine.reference}</h1>
              <p className="text-text-muted">{machine.name}</p>
            </div>
          </div>
          <Link to={`/machine/${id}/add-report`} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Nuevo Informe
          </Link>
        </div>

        {/* Machine Info */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Información de la Máquina</h2>
            <div className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(machine.status)}`}>
              {machine.status.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-text-muted text-sm">Número de Serie</p>
              <p className="text-white font-medium">{machine.serial_number}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Marca</p>
              <p className="text-white font-medium">{machine.brand || '-'}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Modelo</p>
              <p className="text-white font-medium">{machine.model || '-'}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Año</p>
              <p className="text-white font-medium">{machine.year || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-text-muted text-sm">Ubicación</p>
              <p className="text-white font-medium">{machine.location || '-'}</p>
            </div>
          </div>
        </div>

        {/* Reports History */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">Historial de Informes</h2>
          
          {reports.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay informes registrados</p>
              <Link to={`/machine/${id}/add-report`} className="text-accent hover:underline mt-2 inline-block">
                Crear el primer informe
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report.id} className="p-4 bg-surface-light rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs text-white ${getMaintenanceTypeColor(report.maintenance_type)}`}>
                        {report.maintenance_type}
                      </span>
                      <span className="text-text-muted text-sm flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(report.report_date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    {report.cost > 0 && (
                      <span className="text-white font-medium">${report.cost.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-text-muted">
                      <User size={14} />
                      <span>{report.technician}</span>
                    </div>
                    {report.parts_changed && report.parts_changed.length > 0 && (
                      <div className="flex items-center gap-2 text-text-muted">
                        <Package size={14} />
                        <span>{report.parts_changed.length} pieza(s)</span>
                      </div>
                    )}
                  </div>

                  {report.notes && (
                    <p className="text-text-muted text-sm mt-3 border-t border-primary pt-3">
                      {report.notes}
                    </p>
                  )}

                  {report.photos && report.photos.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {report.photos.map((photo, idx) => (
                        <a
                          key={idx}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-16 h-16 rounded overflow-hidden border border-primary"
                        >
                          <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
