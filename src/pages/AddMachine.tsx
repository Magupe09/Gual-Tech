import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../services/supabase'
import { MachineFormData } from '../types'

export default function AddMachine() {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditMode)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<MachineFormData>({
    reference: '',
    serial_number: '',
    name: '',
    brand: '',
    model: '',
    location: '',
    cliente: '',
    nit: '',
    email: '',
    telefono: ''
  })

  // En modo edición: cargar datos de la máquina
  useEffect(() => {
    if (!id) return

    const fetchMachine = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('machines')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        if (data) {
          setFormData({
            reference: data.reference || '',
            serial_number: data.serial_number || '',
            name: data.name || '',
            brand: data.brand || '',
            model: data.model || '',
            location: data.location || '',
            cliente: data.cliente || '',
            nit: data.nit || '',
            email: data.email || '',
            telefono: data.telefono || ''
          })
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al cargar la máquina'
        setError(msg)
      } finally {
        setFetching(false)
      }
    }

    fetchMachine()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEditMode && id) {
        // --- MODO EDICIÓN ---
        const { data, error: supabaseError } = await supabase
          .from('machines')
          .update(formData)
          .eq('id', id)
          .select()
          .single()

        if (supabaseError) throw supabaseError
        navigate(`/machine/${data.id}`)
      } else {
        // --- MODO CREACIÓN ---
        const { data, error: supabaseError } = await supabase
          .from('machines')
          .insert([formData])
          .select()
          .single()

        if (supabaseError) throw supabaseError
        navigate(`/machine/${data.id}`)
      }
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : ''
      // Detectar violación de unique constraint en serial_number
      if (rawMessage.includes('machines_serial_number_key') || rawMessage.includes('duplicate key')) {
        setError('Este número de serie ya está registrado. Usá uno diferente.')
      } else {
        setError(rawMessage || 'Error al guardar la máquina')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{ color: 'var(--color-primary)', fontSize: '20px' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="btn-secondary btn-icon">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? 'Editar Máquina' : 'Agregar Máquina'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Referencia *</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="input-field"
                placeholder="ej. MAQ-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Número de Serie *</label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                className="input-field"
                placeholder="ej. SN123456789"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Nombre de Empresa *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Nombre de la empresa"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="input-field"
                placeholder="ej. Siemens"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Modelo</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input-field"
                placeholder="ej. S7-1200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cliente *</label>
              <input
                type="text"
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                className="input-field"
                placeholder="Nombre del cliente"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">NIT</label>
              <input
                type="text"
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                className="input-field"
                placeholder="ej. 123456789-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dirección</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Dirección de la máquina"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">E-mail *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="input-field"
                placeholder="ej. +57 300 123 4567"
              />
            </div>
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
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6 py-2">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2">
              <Save size={18} />
              {loading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Guardar Máquina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
