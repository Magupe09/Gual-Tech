import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Download, X, Image, Loader } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { jsPDF } from 'jspdf'
import { supabase, isDemoMode } from '../services/supabase'
import { demoMachines, demoReports } from '../services/demoData'
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
      if (isDemoMode || !supabase) {
        await new Promise(resolve => setTimeout(resolve, 200))
        const found = demoMachines.find(m => m.id === id)
        setMachine(found || null)
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

  const generatePDF = (): jsPDF => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFillColor(83, 45, 140)
    doc.rect(0, 0, pageWidth, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.text('Javi Control', 14, 20)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.text(`Informe de Mantenimiento`, 14, 45)
    
    doc.setFontSize(12)
    doc.text(`Máquina: ${machine?.reference} - ${machine?.name}`, 14, 55)
    doc.text(`Número de Serie: ${machine?.serial_number}`, 14, 62)
    
    doc.setFontSize(11)
    doc.text(`Fecha: ${new Date(formData.report_date).toLocaleDateString('es-ES')}`, 14, 75)
    doc.text(`Tipo: ${formData.maintenance_type}`, 14, 82)
    doc.text(`Técnico: ${formData.technician}`, 14, 89)
    
    if (formData.cost > 0) {
      doc.text(`Costo: $${formData.cost.toFixed(2)}`, 14, 96)
    }
    
    if (formData.parts_changed.length > 0) {
      doc.setFontSize(12)
      doc.text('Piezas Cambiadas:', 14, 110)
      doc.setFontSize(10)
      formData.parts_changed.forEach((part, idx) => {
        doc.text(`• ${part}`, 14, 118 + (idx * 6))
      })
    }
    
    if (formData.notes) {
      const notesY = 110 + (formData.parts_changed.length * 6) + 15
      doc.setFontSize(12)
      doc.text('Notas:', 14, notesY)
      doc.setFontSize(10)
      const splitNotes = doc.splitTextToSize(formData.notes, 180)
      doc.text(splitNotes, 14, notesY + 8)
    }
    
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} por Javi Control`, 14, 280)
    
    return doc
  }

  const handleDownloadPDF = () => {
    const doc = generatePDF()
    doc.save(`informe-${machine?.reference}-${formData.report_date}.pdf`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let photoUrls: string[] = []
      
      if (formData.photos.length > 0) {
        if (isDemoMode || !supabase) {
          photoUrls = photosPreview
        } else {
          setUploading(true)
          photoUrls = await uploadPhotos()
        }
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

      if (isDemoMode || !supabase) {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (!demoReports[id || '']) {
          demoReports[id || ''] = []
        }
        demoReports[id || ''].push({
          ...reportData,
          id: Date.now().toString()
        } as any)
      } else {
        const doc = generatePDF()
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
      }

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
