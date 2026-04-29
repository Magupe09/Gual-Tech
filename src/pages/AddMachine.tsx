import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../services/supabase'
import { MachineFormData } from '../types'

export default function AddMachine() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
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
      const { data, error: supabaseError } = await supabase
        .from('machines')
        .insert([formData])
        .select()
        .single()

      if (supabaseError) throw supabaseError
      
      navigate(`/machine/${data.id}`)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar la máquina'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="btn-secondary p-2">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Agregar Máquina</h1>
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
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Nombre descriptivo de la máquina"
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

          <div className="flex justify-center gap-4 pt-10 pb-4 mt-10 border-t border-primary">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6 py-2">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2">
              <Save size={18} />
              {loading ? 'Guardando...' : 'Guardar Máquina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
