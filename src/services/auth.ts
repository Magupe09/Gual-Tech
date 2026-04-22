import { supabase } from './supabase'

/**
 * EMAIL AUTORIZADO
 * 
 * Este es el único email que puede registrarse en la app.
 * Cambiar aquí si necesitás agregar más usuarios en el futuro.
 */
const AUTHORIZED_EMAIL = 'hermano@gmail.com'

/**
 * VALIDAR EMAIL AUTORIZADO
 * 
 * ¿Por qué existe esta función?
 * - Porque queremos CENTRALIZAR la lógica de validación
 * - Si después necesitás cambiar la regla, cambias en UN SOLO LUGAR
 * - Es más fácil de testear
 * 
 * @param email - Email a validar
 * @returns true si el email está autorizado
 */
export function isAuthorizedEmail(email: string): boolean {
  return email.toLowerCase().trim() === AUTHORIZED_EMAIL.toLowerCase()
}

/**
 * SIGNUP (REGISTRO)
 * 
 * ¿Qué hace?
 * 1. Valida que el email sea el autorizado
 * 2. Si es válido, crea el usuario en Supabase
 * 3. Si NO es válido, lanza error
 * 
 * @param email - Email del usuario
 * @param password - Password (mínimo 8 caracteres)
 * @returns Datos del usuario autenticado o error
 */
export async function signup(email: string, password: string) {
  // PASO 1: Validar email
  if (!isAuthorizedEmail(email)) {
    throw new Error(
      `❌ El email ${email} no está autorizado. ` +
      `Solo ${AUTHORIZED_EMAIL} puede registrarse.`
    )
  }

  // PASO 2: Validar password (opcional pero buena práctica)
  if (password.length < 8) {
    throw new Error('❌ La contraseña debe tener mínimo 8 caracteres')
  }

  // PASO 3: Crear usuario en Supabase
  // Si el email ya existe, Supabase lanza error automáticamente
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    // Si el error es "User already registered", significa que ya existe
    if (error.message.includes('already registered')) {
      throw new Error('❌ Este usuario ya está registrado. Intenta con login.')
    }
    throw error
  }

  console.log('✅ Usuario registrado:', data.user?.email)
  return data
}

/**
 * LOGIN (INGRESO)
 * 
 * ¿Qué hace?
 * 1. Valida email + password contra Supabase
 * 2. Si son correctos, devuelve el usuario y token
 * 3. Si son incorrectos, devuelve error
 * 
 * @param email - Email del usuario
 * @param password - Password
 * @returns Datos del usuario autenticado o error
 */
export async function login(email: string, password: string) {
  // PASO 1: Intentar loguearse con Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Mensaje genérico por seguridad (no reveles si el email existe o no)
    throw new Error('❌ Email o contraseña incorrectos')
  }

  console.log('✅ Sesión iniciada:', data.user?.email)
  return data
}

/**
 * LOGOUT (SALIDA)
 * 
 * ¿Qué hace?
 * 1. Destruye la sesión actual
 * 2. Usuario queda deslogueado
 * 
 * @returns void
 */
export async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  console.log('✅ Sesión cerrada')
}

/**
 * GET CURRENT USER
 * 
 * ¿Qué hace?
 * 1. Obtiene el usuario actualmente logueado
 * 2. Si no hay sesión, devuelve null
 * 
 * Útil para proteger rutas: Si no hay usuario, redirige a login
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return data.user
}

/**
 * WATCH AUTH STATE
 * 
 * ¿Qué hace?
 * Escucha cambios en la sesión (login, logout, sesión expirada)
 * 
 * Útil para:
 * - Actualizar UI cuando el usuario se loguea/desloguea
 * - Redirigir a login si la sesión expira
 */
export function onAuthStateChange(callback: (isLoggedIn: boolean) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    // event puede ser: 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', etc
    const isLoggedIn = !!session
    callback(isLoggedIn)
  })

  // Devuelve una función para desuscribirse
  return data?.subscription?.unsubscribe
}
