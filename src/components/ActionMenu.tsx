import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Trash2, Edit, Download, Mail, Loader2 } from 'lucide-react'

interface ActionMenuProps {
  onEdit?: () => void
  onDelete?: () => void
  onDownload?: () => void
  onEmail?: () => void
  /** Indica si se está enviando el email (muestra spinner) */
  isSending?: boolean
}

/**
 * ActionMenu
 * 
 * Menú de 3 puntos para acciones en informes
 * 
 * @param onEdit - Callback para editar
 * @param onDelete - Callback para eliminar
 * @param onDownload - Callback para descargar PDF
 * @param onEmail - Callback para enviar por email
 * @param isSending - Muestra spinner en botón de email mientras envía
 */
export default function ActionMenu({ onEdit, onDelete, onDownload, onEmail, isSending }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú si clickea afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Botón de 3 puntos */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '4px 8px',
          backgroundColor: 'transparent',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <MoreVertical size={16} style={{ color: '#666666' }} />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            minWidth: '180px',
            zIndex: 100,
            marginTop: '4px'
          }}
        >
          {/* Opción Enviar por Email */}
          {onEmail && (
            <button
              onClick={() => {
                if (!isSending) {
                  onEmail()
                  setIsOpen(false)
                }
              }}
              disabled={isSending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: isSending ? 'wait' : 'pointer',
                color: isSending ? '#999999' : '#532D8C',
                fontSize: '14px',
                fontWeight: '500',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background-color 0.2s',
                borderRadius: '8px 8px 0 0'
              }}
              onMouseEnter={(e) => {
                if (!isSending) e.currentTarget.style.backgroundColor = '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Mail size={16} />
              )}
              {isSending ? 'Enviando...' : 'Enviar por Email'}
            </button>
          )}

          {/* Opción Descargar PDF */}
          {onDownload && (
            <button
              onClick={() => {
                onDownload()
                setIsOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#532D8C',
                fontSize: '14px',
                fontWeight: '500',
                borderBottom: onDelete ? '1px solid #f0f0f0' : 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Download size={16} />
              Descargar PDF
            </button>
          )}

          {/* Opción Editar */}
          {onEdit && (
            <button
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#532D8C',
                fontSize: '14px',
                fontWeight: '500',
                borderBottom: onDelete ? '1px solid #f0f0f0' : 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Edit size={16} />
              Editar
            </button>
          )}

          {/* Opción Eliminar */}
          {onDelete && (
            <button
              onClick={() => {
                onDelete()
                setIsOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                borderRadius: '0 0 8px 8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
