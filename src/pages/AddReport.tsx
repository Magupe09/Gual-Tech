import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Download, X, Image, Loader } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { jsPDF } from 'jspdf'
import { generateReportPDF } from '../services/pdfGenerator'

const FONT = 'helvetica'
const BOLD = 'bold'
const NORMAL = 'normal'
import { supabase } from '../services/supabase'
import { Machine, ReportFormData } from '../types'

export default function AddReport() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [machine, setMachine] = useState<Machine | null>(null)
  const [loading, setLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [photosPreview, setPhotosPreview] = useState<string[]>([])

  const [formData, setFormData] = useState<ReportFormData>({
    report_date: new Date().toISOString().split('T')[0],
    maintenance_type: 'preventivo',
    technician: '',
    parts_changed: [],
    notes: '',
    cost: 0,
    photos: []
  })

  const [partInput, setPartInput] = useState('')

  // Firma digital
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    if (id) fetchMachine()
  }, [id])

  // Evita que la página se escrolee mientras el usuario firma en el celular.
  // React registra touchmove como listener pasivo, así que e.preventDefault()
  // en los handlers sintéticos no bloquea el scroll. Por eso agregamos un
  // listener nativo con passive: false directo sobre el canvas.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault()
    }

    canvas.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      canvas.removeEventListener('touchmove', preventScroll)
    }
  }, [])

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
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || 0 : value
    }))
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setCompressing(true)
    setError('')

    try {
      const compressedFiles: File[] = []
      const previews: string[] = []

      for (const file of files) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        }
        
        const compressed = await imageCompression(file, options)
        compressedFiles.push(compressed)
        
        const reader = new FileReader()
        const previewPromise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(compressed)
        })
        previews.push(await previewPromise)
      }

      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...compressedFiles]
      }))
      setPhotosPreview(prev => [...prev, ...previews])
    } catch (err) {
      setError('Error al comprimir imágenes')
    } finally {
      setCompressing(false)
    }
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
    setPhotosPreview(prev => prev.filter((_, i) => i !== index))
  }

  const addPart = () => {
    if (partInput.trim()) {
      setFormData(prev => ({
        ...prev,
        parts_changed: [...prev.parts_changed, partInput.trim()]
      }))
      setPartInput('')
    }
  }

  const removePart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parts_changed: prev.parts_changed.filter((_, i) => i !== index)
    }))
  }

  // --- FIRMA DIGITAL ---
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    // El canvas interno es 500x120 pero se muestra escalado (width: 100%).
    // Hay que convertir las coordenadas de pantalla a coordenadas internas
    // multiplicando por la relación entre el tamaño real y el mostrado.
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCanvasCoords(e, canvas)
    setIsDrawing(true)
    setLastX(x)
    setLastY(y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCanvasCoords(e, canvas)

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    setLastX(x)
    setLastY(y)
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setSignatureData(canvas.toDataURL('image/png'))
      setFormData(prev => ({ ...prev, owner_signature: canvas.toDataURL('image/png') }))
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
    setSignatureData(null)
    setFormData(prev => ({ ...prev, owner_signature: undefined }))
  }

  const uploadPhotos = async (): Promise<string[]> => {
    if (!supabase) return photosPreview
    
    const urls: string[] = []
    
    for (const photo of formData.photos) {
      const fileName = `${id}/${Date.now()}-${photo.name}`
      const { error } = await supabase.storage
        .from('machine-photos')
        .upload(fileName, photo)

      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('machine-photos')
        .getPublicUrl(fileName)
      
      urls.push(publicUrl)
    }

    return urls
  }


  const generatePDF = async (): Promise<jsPDF> => {
    let consecutivo = '001'
    try {
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('machine_id', id)
      consecutivo = String((count || 0) + 1).padStart(3, '0')
    } catch {}

    return generateReportPDF({
      machine: {
        reference: machine?.reference || '',
        name: machine?.name || '',
        serial_number: machine?.serial_number || '',
        brand: machine?.brand,
        model: machine?.model,
        location: machine?.location,
        cliente: machine?.cliente,
      },
      report: {
        report_date: formData.report_date,
        maintenance_type: formData.maintenance_type,
        technician: formData.technician,
        parts_changed: formData.parts_changed,
        notes: formData.notes,
        cost: formData.cost,
      },
      photos: photosPreview,
      signatureData,
      consecutivo,
    })
  }

  const handleDownloadPDF = async () => {
    const doc = await generatePDF()
    doc.save(`informe-${machine?.reference}-${formData.report_date}.pdf`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let photoUrls: string[] = []
      
      if (formData.photos.length > 0) {
        setUploading(true)
        photoUrls = await uploadPhotos()
      }

      let ownerSignatureUrl: string | null = null
      if (signatureData) {
        const sigBlob = await (await fetch(signatureData)).blob()
        const sigFileName = `${id}/${Date.now()}-firma.png`
        const { error: sigError } = await supabase.storage
          .from('machine-pdfs')
          .upload(sigFileName, sigBlob)

        if (sigError) throw sigError

        const { data: { publicUrl: sigUrl } } = supabase.storage
          .from('machine-pdfs')
          .getPublicUrl(sigFileName)

        ownerSignatureUrl = sigUrl
      }

      const reportData = {
        machine_id: id,
        report_date: formData.report_date,
        maintenance_type: formData.maintenance_type,
        technician: formData.technician,
        parts_changed: formData.parts_changed,
        notes: formData.notes,
        cost: formData.cost,
        photos: photoUrls,
        created_at: new Date().toISOString()
      }

      const doc = await generatePDF()
      const pdfBlob = doc.output('blob')
      const pdfFileName = `${id}/${Date.now()}-informe.pdf`
      
      const { error: pdfError } = await supabase.storage
        .from('machine-pdfs')
        .upload(pdfFileName, pdfBlob)

      if (pdfError) throw pdfError

      const { data: { publicUrl: pdfUrl } } = supabase.storage
        .from('machine-pdfs')
        .getPublicUrl(pdfFileName)

      const { error: insertError } = await supabase
        .from('reports')
        .insert([{ ...reportData, pdf_url: pdfUrl, owner_signature_url: ownerSignatureUrl }])

      if (insertError) throw insertError

      navigate(`/machine/${id}`)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el informe'
      setError(errorMessage)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="btn-secondary p-2">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Nuevo Informe</h1>
            <p className="text-text-muted">{machine?.reference} - {machine?.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha del Informe *</label>
              <input
                type="date"
                name="report_date"
                value={formData.report_date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Mantenimiento *</label>
              <select
                name="maintenance_type"
                value={formData.maintenance_type}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="predictivo">Predictivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Técnico *</label>
              <input
                type="text"
                name="technician"
                value={formData.technician}
                onChange={handleChange}
                className="input-field"
                placeholder="Nombre del técnico"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Costo ($)</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="input-field"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Piezas Cambiadas</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={partInput}
                onChange={(e) => setPartInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPart())}
                className="input-field flex-1"
                placeholder="Agregar pieza..."
              />
              <button type="button" onClick={addPart} className="btn-secondary">
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.parts_changed.map((part, idx) => (
                <span key={idx} className="flex items-center gap-1 bg-surface-light px-3 py-1 rounded-full text-sm">
                  {part}
                  <button type="button" onClick={() => removePart(idx)} className="text-red-400 hover:text-red-300">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notas</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field min-h-[100px]"
              placeholder="Notas adicionales del mantenimiento..."
            />
          </div>

          {/* Firma Digital */}
          <div>
            <label className="block text-sm font-medium mb-2">Firma del Dueño</label>
            <div style={{
              border: '2px dashed var(--color-primary)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#ffffff'
            }}>
              <canvas
                ref={canvasRef}
                width={500}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{
                  width: '100%',
                  height: '120px',
                  cursor: 'crosshair',
                  display: 'block',
                  touchAction: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={clearSignature}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Limpiar Firma
              </button>
              {signatureData && (
                <span style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ✓ Firma capturada
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fotos</label>
            <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center">
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label htmlFor="photos" className="cursor-pointer">
                <Image size={32} className="mx-auto mb-2 text-text-muted" />
                <p className="text-text-muted">Click para subir fotos</p>
                <p className="text-xs text-text-muted mt-1">Se optimizarán automáticamente</p>
              </label>
            </div>

            {compressing && (
              <div className="flex items-center justify-center gap-2 mt-2 text-text-muted">
                <Loader size={16} className="animate-spin" />
                <span>Optimizando imágenes...</span>
              </div>
            )}

            {photosPreview.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {photosPreview.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            paddingTop: '48px',
            paddingBottom: '24px',
            marginTop: '48px',
            borderTop: '1px solid var(--color-primary)'
          }}>
            <button type="button" onClick={handleDownloadPDF} className="btn-secondary flex items-center gap-2">
              <Download size={18} />
              Descargar PDF
            </button>
            <button type="submit" disabled={loading || uploading} className="btn-primary flex items-center gap-2">
              <Save size={18} />
              {loading ? 'Guardando...' : 'Guardar Informe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
