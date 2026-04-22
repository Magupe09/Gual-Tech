interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

/**
 * ConfirmModal
 * 
 * Modal reutilizable para pedir confirmación antes de acciones destructivas
 * 
 * @param isOpen - Si el modal está visible
 * @param title - Título del modal
 * @param message - Mensaje de confirmación
 * @param confirmText - Texto del botón de confirmar
 * @param cancelText - Texto del botón de cancelar
 * @param isDangerous - Si es true, el botón es rojo (para acciones destructivas)
 * @param onConfirm - Callback cuando confirma
 * @param onCancel - Callback cuando cancela
 * @param isLoading - Si está cargando
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  isDangerous = true,
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop (fondo oscuro) */}
      <div
        onClick={onCancel}
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
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            zIndex: 1000
          }}
        >
          {/* Title */}
          <h2
            style={{
              color: isDangerous ? '#dc2626' : '#532D8C',
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            {title}
          </h2>

          {/* Message */}
          <p
            style={{
              color: '#666666',
              fontSize: '14px',
              marginBottom: '32px',
              lineHeight: '1.5'
            }}
          >
            {message}
          </p>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}
          >
            <button
              onClick={onCancel}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f0f0f0',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: isDangerous ? '#dc2626' : '#532D8C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isLoading ? 'Eliminando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
