# AddReport

## Resumen

Página de formulario para crear un nuevo informe de mantenimiento para una máquina específica. Es la página más compleja de la app por el manejo de fotos, compresión y generación de PDF.

**Archivo:** `src/pages/AddReport.tsx`
**Líneas:** 455
**Ruta:** `/machine/:id/add-report`

## Propósito

- Crear un informe de mantenimiento para una máquina específica
- Capturar: fecha, tipo de mantenimiento, técnico, costo, piezas, notas, fotos
- Comprimir imágenes antes de subir
- Generar PDF del informe
- Guardar en Supabase (datos + fotos + PDF)

## Tecnologías Usadas

| Tecnología | Propósito |
|------------|-----------|
| React 19 | Framework UI |
| TypeScript | Tipado (ReportFormData, Machine) |
| useState | Estados múltiples (formData, loading, previews, etc.) |
| useEffect | Cargar datos de la máquina |
| useParams | Capturar :id de la URL |
| useNavigate | Navegación (volver, ir a detalle) |
| browser-image-compression | Comprimir imágenes antes de subir |
| jsPDF | Generar PDF del informe |
| supabase.storage | Upload de fotos y PDFs |
| supabase.from().insert() | Insertar informe en tabla |
| Lucide React | Iconos varios |

## Bloques de Lógica

### 1. Captura de parámetro URL

```tsx
const { id } = useParams<{ id: string }>()
```

**Propósito:** Obtener el ID de la máquina desde la URL

---

### 2. Estados

```tsx
// Máquina (para mostrar info en el header)
const [machine, setMachine] = useState<Machine | null>(null)

// Formulario
const [formData, setFormData] = useState<ReportFormData>({
  report_date: new Date().toISOString().split('T')[0],
  maintenance_type: 'preventivo',
  technician: '',
  parts_changed: [],
  notes: '',
  cost: 0,
  photos: []
})

// Estados de proceso
const [loading, setLoading] = useState(false)
const [compressing, setCompressing] = useState(false)
const [uploading, setUploading] = useState(false)
const [error, setError] = useState('')
const [photosPreview, setPhotosPreview] = useState<string[]>([])

// Input auxiliar para piezas
const [partInput, setPartInput] = useState('')
```

| Estado | Propósito |
|--------|-----------|
| `machine` | Datos de la máquina (para header) |
| `formData` | Todos los campos del informe |
| `loading` | Guardando en DB |
| `compressing` | Comprimiendo imágenes |
| `uploading` | Subiendo archivos a storage |
| `error` | Mensaje de error |
| `photosPreview` | Previews de fotos (base64) |
| `partInput` | Input temporal para agregar pieza |

---

### 3. useEffect: Cargar máquina

```tsx
useEffect(() => {
  if (id) fetchMachine()
}, [id])

const fetchMachine = async () => {
  // Mismo patrón que MachineDetail
  // Trae los datos de la máquina para mostrar en el header
}
```

---

### 4. handleChange: Actualizar campos

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target
  setFormData(prev => ({
    ...prev,
    [name]: name === 'cost' ? parseFloat(value) || 0 : value
  }))
}
```

**Nota:** Convierte `cost` a número.

---

### 5. handlePhotoChange: Compresión de imágenes

```tsx
const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  setCompressing(true)
  
  try {
    const compressedFiles: File[] = []
    const previews: string[] = []

    for (const file of files) {
      // Comprimir
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      }
      const compressed = await imageCompression(file, options)
      compressedFiles.push(compressed)
      
      // Crear preview (base64)
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
```

**Flujo:**
1. Recibe archivos del input
2. Comprime cada imagen (max 1MB, 1920px)
3. Genera preview en base64
4. Agrega al estado

---

### 6. removePhoto: Eliminar foto

```tsx
const removePhoto = (index: number) => {
  setFormData(prev => ({
    ...prev,
    photos: prev.photos.filter((_, i) => i !== index)
  }))
  setPhotosPreview(prev => prev.filter((_, i) => i !== index))
}
```

---

### 7. addPart / removePart: Manejo de piezas

```tsx
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
```

---

### 8. uploadPhotos: Subir fotos a Supabase Storage

```tsx
const uploadPhotos = async (): Promise<string[]> => {
  if (!supabase) return photosPreview
  
  const urls: string[] = []
  
  for (const photo of formData.photos) {
    const fileName = `${id}/${Date.now()}-${photo.name}`
    
    // Upload
    const { error } = await supabase.storage
      .from('machine-photos')
      .upload(fileName, photo)
    
    if (error) throw error
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('machine-photos')
      .getPublicUrl(fileName)
    
    urls.push(publicUrl)
  }
  
  return urls
}
```

**Storage buckets:** `machine-photos`

---

### 9. generatePDF: Generar PDF con jsPDF

```tsx
const generatePDF = (): jsPDF => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header con color
  doc.setFillColor(83, 45, 140)
  doc.rect(0, 0, pageWidth, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.text('Javi Control', 14, 20)
  
  // Contenido
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
  
  // Piezas cambiadas
  if (formData.parts_changed.length > 0) {
    doc.setFontSize(12)
    doc.text('Piezas Cambiadas:', 14, 110)
    doc.setFontSize(10)
    formData.parts_changed.forEach((part, idx) => {
      doc.text(`• ${part}`, 14, 118 + (idx * 6))
    })
  }
  
  // Notas
  if (formData.notes) {
    const notesY = 110 + (formData.parts_changed.length * 6) + 15
    doc.setFontSize(12)
    doc.text('Notas:', 14, notesY)
    doc.setFontSize(10)
    const splitNotes = doc.splitTextToSize(formData.notes, 180)
    doc.text(splitNotes, 14, notesY + 8)
  }
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} por Javi Control`, 14, 280)
  
  return doc
}
```

---

### 10. handleDownloadPDF: Descargar PDF

```tsx
const handleDownloadPDF = () => {
  const doc = generatePDF()
  doc.save(`informe-${machine?.reference}-${formData.report_date}.pdf`)
}
```

---

### 11. handleSubmit: Guardar informe

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    // 1. Subir fotos (si hay)
    let photoUrls: string[] = []
    if (formData.photos.length > 0) {
      if (isDemoMode || !supabase) {
        photoUrls = photosPreview  // Modo demo: usar previews
      } else {
        setUploading(true)
        photoUrls = await uploadPhotos()
      }
    }

    // 2. Preparar datos
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

    // 3. Guardar (demo o real)
    if (isDemoMode || !supabase) {
      await new Promise(resolve => setTimeout(resolve, 500))
      demoReports[id || ''].push({ ...reportData, id: Date.now().toString() })
    } else {
      // Generar y subir PDF
      const doc = generatePDF()
      const pdfBlob = doc.output('blob')
      const pdfFileName = `${id}/${Date.now()}-informe.pdf`
      
      await supabase.storage
        .from('machine-pdfs')
        .upload(pdfFileName, pdfBlob)

      // Insertar informe
      await supabase
        .from('reports')
        .insert([{ ...reportData, pdf_url: pdfUrl }])
    }

    // 4. Descargar PDF + navegar
    handleDownloadPDF()
    navigate(`/machine/${id}`)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
    setUploading(false)
  }
}
```

---

### 12. Render: Estructura del formulario

```
├── Header
│   ├── Botón volver
│   └── Título + referencia de máquina
├── Errores
├── Campos principales
│   ├── Fecha * (date)
│   ├── Tipo * (select: preventivo/correctivo/predictivo)
│   ├── Técnico * (text)
│   └── Costo (number)
├── Piezas cambiadas
│   ├── Input + botón agregar
│   └── Tags de piezas (con remove)
├── Notas (textarea)
├── Fotos
│   ├── Input file (hidden) + label
│   ├── Loading "Optimizando..."
│   └── Grid de previews (con remove)
└── Botones
    ├── Descargar PDF
    └── Guardar Informe
```

---

## Diferencias con otras páginas

| Característica | AddReport | AddMachine |
|----------------|-----------|-----------|
| **Líneas** | 455 | 206 |
| **useEffect** | Sí (cargar máquina) | No |
| **useParams** | Sí (capturar id) | No |
| **Compresión** | Sí (browser-image-compression) | No |
| **PDF** | Sí (jsPDF) | No |
| **Upload** | Sí (Supabase Storage) | No |
| **Arrays dinámicos** | photos, parts_changed | No |
| **Estados adicionales** | compressing, uploading, previews, partInput | Solo loading, error |

---

## Storage Buckets

- `machine-photos` — Fotos de mantenimiento
- `machine-pdfs` — PDFs generados

---

## edge Cases

1. **Sin fotos:** No intenta comprimir ni subir
2. **Error de compresión:** Muestra error, no rompe el form
3. **PDF descargable sin guardar:** El usuario puede generar PDF antes de guardar
4. **Modo demo:** Usa previews base64 en lugar de URLs de storage

---

## Conexiones

```
AddReport → supabase.ts → Supabase (reports table + storage)
AddReport → demoData.ts → demoReports
AddReport → types/index.ts → ReportFormData, Machine
AddReport → browser-image-compression → Compresión de fotos
AddReport → jsPDF → Generación de PDF
AddReport → App.tsx (Route /machine/:id/add-report)
AddReport → MachineDetail (/machine/:id) tras crear
```

---

## Siguiente: [[3-Components]]

---
*Parte del Cerebro: Javi Control | 1.1 Estructura → 1.1.1 Pages → AddReport*