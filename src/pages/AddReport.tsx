import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Download, X, Image, Loader } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { jsPDF } from 'jspdf'
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

  useEffect(() => {
    if (id) fetchMachine()
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

  const drawFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    doc.setDrawColor(83, 45, 140)
    doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Técnico: ${formData.technician}`, 14, pageHeight - 10)
    doc.text(`Gualtech - Javi Control`, pageWidth - 14, pageHeight - 10, { align: 'right' })
  }

  const generatePDF = async (): Promise<jsPDF> => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Margen útil (entre header y footer)
    const marginTop = 40
    const marginBottom = 25

    // Obtener consecutivo basado en informes existentes
    let consecutivo = '001'
    try {
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('machine_id', id)
      consecutivo = String((count || 0) + 1).padStart(3, '0')
    } catch {
      consecutivo = '001'
    }

    // ==========================================
    // Cargar logo UNA VEZ (async)
    // ==========================================
    let logoBase64: string | null = null
    try {
      const img = new window.Image()
      img.src = '/logojavi.PNG'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject()
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.width || 160
      canvas.height = img.height || 60
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      logoBase64 = canvas.toDataURL('image/png')
    } catch {
      logoBase64 = null
    }

    // ==========================================
    // HEADER FIJO (se repite en cada página)
    // ==========================================
    const drawHeader = () => {
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 8, 40, 15)
      } else {
        doc.setFontSize(14)
        doc.setTextColor(83, 45, 140)
        doc.text('Gualtech', 14, 20)
      }

      // Consecutivo + fecha a la derecha
      const creationDate = new Date().toLocaleDateString('es-ES')
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`No. ${consecutivo}`, pageWidth - 14, 15, { align: 'right' })
      doc.text(`Fecha: ${creationDate}`, pageWidth - 14, 22, { align: 'right' })

      // Línea separadora del header
      doc.setDrawColor(83, 45, 140)
      doc.line(14, 30, pageWidth - 14, 30)
    }

    // Dibujar header y footer en primera página
    drawHeader()
    drawFooter(doc, pageWidth, pageHeight)

    // ==========================================
    // TÍTULO
    // ==========================================
    doc.setTextColor(83, 45, 140)
    doc.setFontSize(16)
    doc.text('Informe de Mantenimiento', pageWidth / 2, marginTop, { align: 'center' })

    // ==========================================
    // INFO DE MÁQUINA
    // ==========================================
    doc.setDrawColor(83, 45, 140)
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(14, 48, pageWidth - 28, 28, 3, 3, 'F')
    doc.setTextColor(83, 45, 140)
    doc.setFontSize(10)
    doc.text('Máquina', 20, 56)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.text(`${machine?.reference} - ${machine?.name}`, 20, 64)
    doc.text(`Serie: ${machine?.serial_number}  |  ${machine?.brand || '-'} ${machine?.model || '-'}`, 20, 72)

    // ==========================================
    // DATOS DEL INFORME
    // ==========================================
    let currentY = 88
    doc.setDrawColor(83, 45, 140)
    doc.line(14, currentY, pageWidth - 14, currentY)
    currentY += 8

    doc.setFontSize(11)
    doc.setTextColor(83, 45, 140)
    doc.text('Detalle del Servicio', 14, currentY)
    currentY += 8

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)

    // Fila: Fecha | Tipo
    doc.text(`Fecha:`, 14, currentY)
    doc.text(`${new Date(formData.report_date).toLocaleDateString('es-ES')}`, 50, currentY)
    doc.text(`Tipo:`, pageWidth / 2, currentY)
    doc.text(`${formData.maintenance_type}`, pageWidth / 2 + 20, currentY)
    currentY += 8

    // Fila: Técnico
    doc.text(`Técnico:`, 14, currentY)
    doc.text(`${formData.technician}`, 50, currentY)
    currentY += 12

    // ==========================================
    // PIEZAS CAMBIADAS
    // ==========================================
    if (formData.parts_changed.length > 0) {
      doc.setDrawColor(200, 200, 200)
      doc.line(14, currentY - 4, pageWidth - 14, currentY - 4)

      doc.setFontSize(11)
      doc.setTextColor(83, 45, 140)
      doc.text('Piezas Cambiadas:', 14, currentY)
      currentY += 8
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      formData.parts_changed.forEach((part) => {
        doc.text(`• ${part}`, 20, currentY)
        currentY += 6
      })
      currentY += 6
    }

    // ==========================================
    // NOTAS
    // ==========================================
    if (formData.notes) {
      // Verificar espacio antes de notas
      if (currentY > pageHeight - 60) {
        doc.addPage()
        drawHeader()
        drawFooter(doc, pageWidth, pageHeight)
        currentY = marginTop + 10
      }

      doc.setDrawColor(200, 200, 200)
      doc.line(14, currentY - 4, pageWidth - 14, currentY - 4)

      doc.setFontSize(11)
      doc.setTextColor(83, 45, 140)
      doc.text('Notas:', 14, currentY)
      currentY += 8
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      const splitNotes = doc.splitTextToSize(formData.notes, pageWidth - 28)
      doc.text(splitNotes, 14, currentY)
      currentY += splitNotes.length * 5 + 8
    }

    // ==========================================
    // FOTOS
    // ==========================================
    if (photosPreview.length > 0) {
      // Verificar espacio en página actual
      if (currentY > pageHeight - 50) {
        doc.addPage()
        drawHeader()
        drawFooter(doc, pageWidth, pageHeight)
        currentY = marginTop + 5
      }

      doc.setDrawColor(83, 45, 140)
      doc.line(14, currentY - 4, pageWidth - 14, currentY - 4)

      doc.setFontSize(11)
      doc.setTextColor(83, 45, 140)
      doc.text('Registro Fotográfico', 14, currentY)
      currentY += 10

      for (let i = 0; i < photosPreview.length; i++) {
        if (currentY + 65 > pageHeight - marginBottom) {
          doc.addPage()
          drawHeader()
          drawFooter(doc, pageWidth, pageHeight)
          currentY = marginTop + 5
          doc.setFontSize(10)
          doc.setTextColor(83, 45, 140)
          doc.text('Registro Fotográfico (cont.):', 14, currentY)
          currentY += 10
        }

        const col = i % 2
        const row = Math.floor(i / 2)
        const x = 14 + (col * ((pageWidth - 28) / 2 + 5))
        const photoY = currentY + (row * 65)

        try {
          doc.addImage(photosPreview[i], 'JPEG', x, photoY, 78, 52)
          doc.setFontSize(7)
          doc.setTextColor(120, 120, 120)
          doc.text(`Foto ${i + 1}`, x, photoY + 57)
        } catch {
          doc.setFontSize(7)
          doc.setTextColor(180, 180, 180)
          doc.text(`Foto ${i + 1}: No disponible`, x, photoY + 25)
        }
      }

      const fotoRows = Math.ceil(photosPreview.length / 2)
      currentY = currentY + (fotoRows * 65)
    }

    return doc
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
        .insert([{ ...reportData, pdf_url: pdfUrl }])

      if (insertError) throw insertError

      handleDownloadPDF()
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
    <div className="min-h-screen bg-bg-dark p-6">
      <div className="max-w-2xl mx-auto">
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

          <div className="flex justify-end gap-4 pt-4 border-t border-primary">
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
