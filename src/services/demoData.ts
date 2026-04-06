// Demo data para testing sin Supabase
import { Machine, Report } from '../types'

export const demoMachines: Machine[] = [
  {
    id: '1',
    reference: 'MAQ-001',
    serial_number: 'SN2024001',
    name: 'Torno CNC Principal',
    brand: 'Haas',
    model: 'VF-2',
    year: 2022,
    location: 'Planta 1 - Línea A',
    status: 'activo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    reference: 'MAQ-002',
    serial_number: 'SN2024002',
    name: 'Fresadora Industrial',
    brand: 'DMG MORI',
    model: 'DMU 50',
    year: 2021,
    location: 'Planta 1 - Línea B',
    status: 'mantenimiento',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    reference: 'MAQ-003',
    serial_number: 'SN2024003',
    name: 'Prensa Hidráulica',
    brand: 'Schuler',
    model: 'PST 100',
    year: 2020,
    location: 'Planta 2',
    status: 'inactivo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const demoReports: Record<string, Report[]> = {
  '1': [
    {
      id: 'r1',
      machine_id: '1',
      report_date: '2024-03-15',
      maintenance_type: 'preventivo',
      technician: 'Juan Pérez',
      parts_changed: ['Filtro de aceite', 'Bandas de transmisión'],
      notes: 'Mantenimiento programado trimestral. Todo en orden.',
      cost: 250.00,
      photos: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'r2',
      machine_id: '1',
      report_date: '2024-02-01',
      maintenance_type: 'correctivo',
      technician: 'Carlos Gómez',
      parts_changed: ['Rodamiento principal'],
      notes: 'Se detectó ruido anormal. Se reemplazó rodamiento.',
      cost: 450.00,
      photos: [],
      created_at: new Date().toISOString()
    }
  ],
  '2': [
    {
      id: 'r3',
      machine_id: '2',
      report_date: '2024-03-20',
      maintenance_type: 'predictivo',
      technician: 'María López',
      parts_changed: [],
      notes: 'Análisis de vibraciones indicando desgaste. En mantenimiento preventivo.',
      cost: 0,
      photos: [],
      created_at: new Date().toISOString()
    }
  ]
}

export const isDemoMode = true
