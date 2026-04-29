import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, FileText, Calendar, User, Package, Trash2, Download, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../services/supabase'
import { deleteMachine, deleteReport } from '../services/database'
import { sendReportEmail } from '../services/email'
import { Machine, Report } from '../types'
import ConfirmModal from '../components/ConfirmModal'
import ActionMenu from '../components/ActionMenu'

export default function MachineDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [machine, setMachine] = useState<Machine | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para modales
  const [showDeleteMachineModal, setShowDeleteMachineModal] = useState(false)
  const [showDeleteReportModal, setShowDeleteReportModal] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Estados para PIN de eliminación
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null)

  // Estados para envío de email
  const [sendingReportId, setSendingReportId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Auto-ocultar notificación después de 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  useEffect(() => {
    if (id) {
      fetchMachine()
      fetchReports()
    }
  }, [id])

  const fetchMachine = async () => {
    try {
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

  /**
   * ELIMINAR MÁQUINA
   * Borra la máquina y todos sus informes
   */
  const handleDeleteMachine = async () => {
    if (!id) return
    
    setIsDeleting(true)
    try {
      await deleteMachine(id)
      setShowDeleteMachineModal(false)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error eliminando máquina:', error)
      alert('Error al eliminar la máquina')
      setIsDeleting(false)
    }
  }

  /**
   * DESCARGAR PDF INFORME
   * Abre el PDF en nueva pestaña
   */
  const handleDownloadReport = (report: Report) => {
    if (report.pdf_url) {
      window.open(report.pdf_url, '_blank')
    }
  }

  /**
   * ENVIAR INFORME POR EMAIL
   * Llama a la Edge Function de Supabase que envía el PDF por Gmail SMTP
   */
  const handleEmailReport = async (report: Report) => {
    if (!report.pdf_url) {
      setNotification({ type: 'error', message: 'El informe no tiene PDF asociado' })
      return
    }

    if (!machine?.email) {
      setNotification({ type: 'error', message: 'La máquina no tiene email registrado' })
      return
    }

    setSendingReportId(report.id)
    setNotification(null)

    try {
      await sendReportEmail({
        pdfUrl: report.pdf_url,
        email: machine.email,
        machineReference: machine.reference,
        machineName: machine.name,
        reportDate: new Date(report.report_date).toLocaleDateString('es-ES'),
        technician: report.technician || undefined,
      })

      setNotification({
        type: 'success',
        message: `Informe enviado a ${machine.email}`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al enviar el email'
      setNotification({ type: 'error', message })
    } finally {
      setSendingReportId(null)
    }
  }

  /**
   * ABRIR MODAL PIN
   * Prepara el modal de PIN para eliminar informe
   */
  const openPinModal = (reportId: string) => {
    setDeletingReportId(reportId)
    setPinInput('')
    setPinError('')
    setShowPinModal(true)
  }

  /**
   * ELIMINAR CON PIN
   * Valida el PIN de 4 dígitos antes de eliminar
   */
  const handleDeleteWithPin = async () => {
    if (pinInput !== '0000') {
      setPinError('Código incorrecto')
      return
    }
    if (!deletingReportId) return

    setIsDeleting(true)
    try {
      await deleteReport(deletingReportId)
      setShowPinModal(false)
      setDeletingReportId(null)
      setPinInput('')
      setPinError('')
      
      setReports(reports.filter(r => r.id !== deletingReportId))
    } catch (error) {
      console.error('Error eliminando informe:', error)
      alert('Error al eliminar el informe')
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * ELIMINAR INFORME (directo, sin PIN)
   * Se mantiene por compatibilidad pero ya no se usa desde el menú
   */
  const handleDeleteReport = async (reportId: string) => {
    setIsDeleting(true)
    try {
      await deleteReport(reportId)
      setShowDeleteReportModal(false)
      setSelectedReportId(null)
      
      // Actualizar lista de informes
      setReports(reports.filter(r => r.id !== reportId))
    } catch (error) {
      console.error('Error eliminando informe:', error)
      alert('Error al eliminar el informe')
      setIsDeleting(false)
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
        {/* Notificación de email */}
        {notification && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: notification.type === 'success' ? '1px solid #16a34a' : '1px solid #dc2626',
              color: notification.type === 'success' ? '#166534' : '#991b1b',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'opacity 0.3s ease',
            }}
          >
            {notification.type === 'success' ? (
              <CheckCircle size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
            ) : (
              <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
            )}
            <span style={{ flex: 1 }}>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'inherit',
                opacity: 0.7,
              }}
            >
              ✕
            </button>
          </div>
        )}

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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to={`/machine/${id}/add-report`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#532D8C', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
              <Plus size={20} />
              Nuevo Informe
            </Link>
            <button 
              onClick={() => setShowDeleteMachineModal(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '10px 20px', 
                backgroundColor: '#dc2626', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: '600', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626'
              }}
            >
              <Trash2 size={20} />
              Eliminar
            </button>
          </div>
        </div>

        {/* Machine Info */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #532D8C', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ color: '#532D8C', fontSize: '20px', fontWeight: 'bold' }}>Información de la Máquina</h2>
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
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ color: '#666666', fontSize: '14px' }}>Dirección</p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {report.cost > 0 && (
                        <span style={{ color: '#1a1a1a', fontWeight: '500' }}>${report.cost.toFixed(2)}</span>
                      )}
                      <ActionMenu 
                        onEmail={() => handleEmailReport(report)}
                        onDownload={() => handleDownloadReport(report)}
                        onDelete={() => openPinModal(report.id)}
                        isSending={sendingReportId === report.id}
                      />
                    </div>
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

      {/* Modal: Eliminar Máquina */}
      <ConfirmModal
        isOpen={showDeleteMachineModal}
        title="Eliminar Máquina"
        message={`¿Estás seguro que querés eliminar la máquina "${machine?.name}"? Esta acción eliminará también todos sus informes y no se puede deshacer.`}
        confirmText="Eliminar Máquina"
        cancelText="Cancelar"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteMachine}
        onCancel={() => setShowDeleteMachineModal(false)}
      />

      {/* Modal: Eliminar Informe */}
      <ConfirmModal
        isOpen={showDeleteReportModal}
        title="Eliminar Informe"
        message="¿Estás seguro que querés eliminar este informe? No se puede deshacer."
        confirmText="Eliminar Informe"
        cancelText="Cancelar"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={() => {
          if (selectedReportId) {
            handleDeleteReport(selectedReportId)
          }
        }}
        onCancel={() => {
          setShowDeleteReportModal(false)
          setSelectedReportId(null)
        }}
      />

      {/* Modal: PIN de Seguridad */}
      {showPinModal && (
        <div
          onClick={() => {
            setShowPinModal(false)
            setPinError('')
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '380px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              textAlign: 'center'
            }}
          >
            <h2 style={{ color: '#dc2626', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              Confirmar Eliminación
            </h2>
            <p style={{ color: '#666666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              Ingresá el código de seguridad para eliminar el informe
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setPinInput(val)
                setPinError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pinInput.length === 4) {
                  handleDeleteWithPin()
                }
              }}
              placeholder="0000"
              autoFocus
              style={{
                width: '160px',
                padding: '12px',
                fontSize: '28px',
                textAlign: 'center',
                letterSpacing: '12px',
                border: `2px solid ${pinError ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '8px',
                outline: 'none',
                fontFamily: 'monospace',
                marginBottom: pinError ? '8px' : '24px'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#532D8C'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = pinError ? '#dc2626' : '#d1d5db'
              }}
            />

            {pinError && (
              <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
                {pinError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowPinModal(false)
                  setPinError('')
                  setPinInput('')
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f0f0f0',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteWithPin}
                disabled={pinInput.length !== 4 || isDeleting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: pinInput.length === 4 && !isDeleting ? '#dc2626' : '#d1d5db',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: pinInput.length === 4 && !isDeleting ? 'pointer' : 'not-allowed'
                }}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
