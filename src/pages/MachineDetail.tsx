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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{ color: '#532D8C', fontSize: '20px' }}>Cargando...</div>
      </div>
    )
  }

  if (!machine) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{ color: '#dc2626', fontSize: '20px' }}>Máquina no encontrada</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #532D8C', borderRadius: '8px', cursor: 'pointer' }}>
              <ArrowLeft size={20} style={{ color: '#532D8C' }} />
            </button>
            <div>
              <h1 style={{ color: '#532D8C', fontSize: '24px', fontWeight: 'bold' }}>{machine.reference}</h1>
              <p style={{ color: '#666666', fontSize: '14px' }}>{machine.name}</p>
            </div>
          </div>
          <Link to={`/machine/${id}/add-report`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#532D8C', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
            <Plus size={20} />
            Nuevo Informe
          </Link>
        </div>

        {/* Machine Info */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #532D8C', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#532D8C', fontSize: '20px', fontWeight: 'bold' }}>Información de la Máquina</h2>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '14px', color: '#ffffff', backgroundColor: machine.status === 'activo' ? '#16a34a' : machine.status === 'inactivo' ? '#dc2626' : '#ca8a04' }}>
              {machine.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ color: '#1a1a1a' }}>
            <div>
              <p style={{ color: '#666666', fontSize: '14px' }}>Número de Serie</p>
              <p style={{ color: '#1a1a1a', fontWeight: '500', fontSize: '16px' }}>{machine.serial_number}</p>
            </div>
            <div>
              <p style={{ color: '#666666', fontSize: '14px' }}>Marca</p>
              <p style={{ color: '#1a1a1a', fontWeight: '500', fontSize: '16px' }}>{machine.brand || '-'}</p>
            </div>
            <div>
              <p style={{ color: '#666666', fontSize: '14px' }}>Modelo</p>
              <p style={{ color: '#1a1a1a', fontWeight: '500', fontSize: '16px' }}>{machine.model || '-'}</p>
            </div>
            <div>
              <p style={{ color: '#666666', fontSize: '14px' }}>Año</p>
              <p style={{ color: '#1a1a1a', fontWeight: '500', fontSize: '16px' }}>{machine.year || '-'}</p>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ color: '#666666', fontSize: '14px' }}>Ubicación</p>
              <p style={{ color: '#1a1a1a', fontWeight: '500', fontSize: '16px' }}>{machine.location || '-'}</p>
            </div>
          </div>
        </div>

        {/* Reports History */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #532D8C', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ color: '#532D8C', fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Historial de Informes</h2>
          
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#666666' }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#532D8C' }} />
              <p style={{ marginBottom: '8px' }}>No hay informes registrados</p>
              <Link to={`/machine/${id}/add-report`} style={{ color: '#532D8C', textDecoration: 'underline' }}>
                Crear el primer informe
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reports.map(report => (
                <div key={report.id} style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#ffffff', backgroundColor: report.maintenance_type === 'preventivo' ? '#16a34a' : report.maintenance_type === 'correctivo' ? '#dc2626' : '#7B5CC9' }}>
                        {report.maintenance_type}
                      </span>
                      <span style={{ color: '#666666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {new Date(report.report_date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    {report.cost > 0 && (
                      <span style={{ color: '#1a1a1a', fontWeight: '500' }}>${report.cost.toFixed(2)}</span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666666' }}>
                      <User size={14} />
                      <span style={{ color: '#1a1a1a' }}>{report.technician}</span>
                    </div>
                    {report.parts_changed && report.parts_changed.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666666' }}>
                        <Package size={14} />
                        <span style={{ color: '#1a1a1a' }}>{report.parts_changed.length} pieza(s)</span>
                      </div>
                    )}
                  </div>

                  {report.notes && (
                    <p style={{ color: '#666666', fontSize: '14px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #532D8C' }}>
                      {report.notes}
                    </p>
                  )}

                  {report.photos && report.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      {report.photos.map((photo, idx) => (
                        <a
                          key={idx}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ width: '64px', height: '64px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #532D8C' }}
                        >
                          <img src={photo} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
