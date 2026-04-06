// Tipos para el proyecto Javi Control

// Estados de máquina
export type MachineStatus = 'activo' | 'inactivo' | 'mantenimiento'

// Tipos de mantenimiento
export type MaintenanceType = 'preventivo' | 'correctivo' | 'predictivo'

// Interfaz de Máquina
export interface Machine {
  id: string
  reference: string
  serial_number: string
  name: string
  brand: string
  model: string
  year: number
  location: string
  status: MachineStatus
  created_at: string
  updated_at: string
}

// Interfaz de Informe
export interface Report {
  id: string
  machine_id: string
  report_date: string
  maintenance_type: MaintenanceType
  technician: string
  parts_changed: string[]
  notes: string
  cost: number
  photos: string[]
  pdf_url?: string
  created_at: string
}

// Datos del formulario de máquina
export interface MachineFormData {
  reference: string
  serial_number: string
  name: string
  brand: string
  model: string
  year: number
  location: string
  status: MachineStatus
}

// Datos del formulario de informe
export interface ReportFormData {
  report_date: string
  maintenance_type: MaintenanceType
  technician: string
  parts_changed: string[]
  notes: string
  cost: number
  photos: File[]
}

// Respuesta de usuario de Supabase
export interface User {
  id: string
  email: string
}
