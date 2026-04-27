import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Download, X, Image, Loader } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { jsPDF } from 'jspdf'

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

  const PRIMARY = '#532D8C'
  const PRIMARY_RGB: [number, number, number] = [83, 45, 140]
  const GRAY_LIGHT = '#f5f5f5'
  const GRAY_TEXT = '#666666'
  const MARGIN = 14
  const HEADER_H = 48
  const FOOTER_H = 22
  const CONTENT_W = (pw: number) => pw - MARGIN * 2

  const drawFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    const fy = pageHeight - FOOTER_H
    doc.setDrawColor(...PRIMARY_RGB)
    doc.line(MARGIN, fy, pageWidth - MARGIN, fy)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Técnico: ${formData.technician}`, MARGIN, fy + 10)
    doc.text(`Gualtech - Javi Control`, pageWidth - MARGIN, fy + 10, { align: 'right' })
  }

  const drawSectionTitle = (doc: jsPDF, y: number, title: string, pageWidth: number) => {
    const cw = CONTENT_W(pageWidth)
    doc.setDrawColor(220, 210, 235)
    doc.line(MARGIN, y, pageWidth - MARGIN, y)
    doc.setFontSize(11)
    doc.setTextColor(...PRIMARY_RGB)
    doc.setFont(FONT, BOLD)
    doc.text(title, MARGIN, y + 7)
    doc.setFont(FONT, NORMAL)
    return y + 14
  }

  const generatePDF = async (): Promise<jsPDF> => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const cw = CONTENT_W(pageWidth)

    // ==========================================
    // Consecutivo (desde DB)
    // ==========================================
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
    // Logo (cargar una vez, mantener proporción)
    // ==========================================
    let logoBase64: string | null = null
    let logoW = 0, logoH = 0
    try {
      const img = new window.Image()
      img.src = '/logojavi.PNG'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject()
      })
      // Render a resolución NATIVA (evitar pérdida)
      const scale = 2 // retina para calidad
      const canvas = document.createElement('canvas')
      canvas.width = (img.width || 160) * scale
      canvas.height = (img.height || 60) * scale
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      logoBase64 = canvas.toDataURL('image/png')
      logoW = img.width || 160
      logoH = img.height || 60
    } catch {
      logoBase64 = null
    }

    // Calcular tamaño del logo manteniendo proporción
    const logoMaxH = 22
    let logoPrintW = 50
    let logoPrintH = logoMaxH
    if (logoW > 0 && logoH > 0) {
      const aspect = logoW / logoH
      logoPrintW = logoMaxH * aspect
      logoPrintH = logoMaxH
    }
    const logoX = MARGIN
    const logoY = (HEADER_H - logoPrintH) / 2

    // ==========================================
    // drawHeader: se llama en cada página
    // ==========================================
    const drawHeader = () => {
      // Banda púrpura con esquinas redondeadas (solo superior)
      doc.setFillColor(...PRIMARY_RGB)
      doc.roundedRect(0, 0, pageWidth, HEADER_H, 10, 10, 'F')

      // Logo (blanco sobre fondo púrpura, con proporción)
      doc.setTextColor(255, 255, 255)
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', logoX, logoY, logoPrintW, logoPrintH)
      } else {
        doc.setFontSize(14)
        doc.text('Gualtech', MARGIN, 28)
      }

      // Consecutivo + fecha a la derecha
      const creationDate = new Date().toLocaleDateString('es-ES')
      doc.setFontSize(11)
      doc.text(`No. ${consecutivo}`, pageWidth - MARGIN, 18, { align: 'right' })
      doc.setFontSize(9)
      doc.text(creationDate, pageWidth - MARGIN, 28, { align: 'right' })
    }

    // Dibujar primera página
    drawHeader()
    drawFooter(doc, pageWidth, pageHeight)

    // ==========================================
    // CONTENIDO
    // ==========================================
    let y = HEADER_H + 8

    // ---- TÍTULO ----
    doc.setTextColor(...PRIMARY_RGB)
    doc.setFontSize(18)
    doc.setFont(FONT, BOLD)
    doc.text('INFORME DE MANTENIMIENTO', pageWidth / 2, y, { align: 'center' })
    doc.setFont(FONT, NORMAL)
    y += 14

    // ---- CARD: MÁQUINA ----
    const cardX = MARGIN
    const cardW = cw
    const cardY = y
    const cardH = 34

    // Sombra/sutil: rectángulo gris de fondo
    doc.setFillColor(248, 247, 250)
    doc.setDrawColor(...PRIMARY_RGB)
    doc.roundedRect(cardX, cardY, cardW, cardH, 3, 3, 'FD')

    // Barra lateral púrpura
    doc.setFillColor(...PRIMARY_RGB)
    doc.rect(cardX, cardY, 4, cardH, 'F')

    doc.setTextColor(...PRIMARY_RGB)
    doc.setFontSize(10)
    doc.setFont(FONT, BOLD)
    doc.text('MÁQUINA', cardX + 14, cardY + 8)
    doc.setFont(FONT, NORMAL)

    doc.setTextColor(40, 40, 40)
    doc.setFontSize(10)
    doc.text(`${machine?.reference} - ${machine?.name}`, cardX + 14, cardY + 20)
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Serie: ${machine?.serial_number}  |  ${machine?.brand || '-'} ${machine?.model || '-'}`, cardX + 14, cardY + 30)

    y = cardY + cardH + 10

    // ---- DETALLE DEL SERVICIO ----
    y = drawSectionTitle(doc, y, 'DETALLE DEL SERVICIO', pageWidth)

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)

    // Fecha | Tipo (en columnas)
    const col1X = MARGIN + 4
    const col2X = MARGIN + 50
    const col3X = pageWidth / 2 + 4
    const col4X = pageWidth / 2 + 45

    doc.setFont(FONT, BOLD)
    doc.text('Fecha:', col1X, y)
    doc.setFont(FONT, NORMAL)
    doc.text(new Date(formData.report_date).toLocaleDateString('es-ES'), col2X, y)
    doc.setFont(FONT, BOLD)
    doc.text('Tipo:', col3X, y)
    doc.setFont(FONT, NORMAL)
    doc.text(formData.maintenance_type, col4X, y)
    y += 9

    doc.setFont(FONT, BOLD)
    doc.text('Técnico:', col1X, y)
    doc.setFont(FONT, NORMAL)
    doc.text(formData.technician, col2X, y)
    y += 14

    // ---- PIEZAS CAMBIADAS ----
    if (formData.parts_changed.length > 0) {
      y = drawSectionTitle(doc, y, 'PIEZAS CAMBIADAS', pageWidth)

      doc.setTextColor(60, 60, 60)
      doc.setFontSize(10)
      formData.parts_changed.forEach((part) => {
        doc.text(`•  ${part}`, MARGIN + 8, y)
        y += 7
      })
      y += 6
    }

    // ---- NOTAS ----
    if (formData.notes) {
      if (y > pageHeight - FOOTER_H - 40) {
        doc.addPage()
        drawHeader()
        drawFooter(doc, pageWidth, pageHeight)
        y = HEADER_H + 10
      }

      y = drawSectionTitle(doc, y, 'NOTAS', pageWidth)

      doc.setTextColor(60, 60, 60)
      doc.setFontSize(10)
      const splitNotes = doc.splitTextToSize(formData.notes, cw - 8)
      doc.text(splitNotes, MARGIN + 8, y)
      y += splitNotes.length * 5 + 10
    }

    // ---- REGISTRO FOTOGRÁFICO ----
    if (photosPreview.length > 0) {
      if (y > pageHeight - FOOTER_H - 30) {
        doc.addPage()
        drawHeader()
        drawFooter(doc, pageWidth, pageHeight)
        y = HEADER_H + 10
      }

      y = drawSectionTitle(doc, y, 'REGISTRO FOTOGRÁFICO', pageWidth)

      const imgW = (cw - 20) / 2
      const imgH = imgW * 0.65
      const gapX = 10
      const gapY = 12

      for (let i = 0; i < photosPreview.length; i++) {
        const col = i % 2
        const row = Math.floor(i / 2)

        // Salto de página si no entra la fila
        if (y + imgH + gapY > pageHeight - FOOTER_H) {
          doc.addPage()
          drawHeader()
          drawFooter(doc, pageWidth, pageHeight)
          y = HEADER_H + 10
          y = drawSectionTitle(doc, y, 'REGISTRO FOTOGRÁFICO (cont.)', pageWidth)
        }

        const ix = MARGIN + col * (imgW + gapX)
        const iy = y + row * (imgH + gapY)

        // Borde sutil alrededor de la foto
        doc.setDrawColor(200, 200, 200)
        doc.setFillColor(248, 247, 250)
        doc.roundedRect(ix - 1, iy - 1, imgW + 2, imgH + 14, 2, 2, 'FD')

        try {
          doc.addImage(photosPreview[i], 'JPEG', ix, iy, imgW, imgH)
        } catch {
          doc.setFontSize(8)
          doc.setTextColor(180, 180, 180)
          doc.text('Imagen no disponible', ix + 10, iy + imgH / 2)
        }

        doc.setFontSize(7)
        doc.setTextColor(140, 140, 140)
        doc.text(`Foto ${i + 1}`, ix + 2, iy + imgH + 8)
      }

      const totalRows = Math.ceil(photosPreview.length / 2)
      y = y + totalRows * (imgH + gapY) + 6
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
