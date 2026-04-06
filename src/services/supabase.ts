// Configuración del cliente de Supabase
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Verificar que las credenciales estén configuradas
const inDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_')

// Cliente de Supabase
let supabaseClient: SupabaseClient | null = null

if (!inDemoMode && supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Conectado a Supabase')
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error)
  }
} else {
  console.warn('⚠️ Modo demo activado - Configurá las credenciales en .env.local')
}

export const supabase = supabaseClient
export const isDemoMode = inDemoMode
