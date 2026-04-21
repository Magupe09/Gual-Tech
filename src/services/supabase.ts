// Configuración del cliente de Supabase
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Variables de entorno (requeridas)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar credenciales
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas. ' +
    'Configurálas en .env.local o en Vercel (Settings > Environment Variables)'
  )
}

// Cliente de Supabase (siempre se crea)
const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ Conectado a Supabase')

export const supabase = supabaseClient
