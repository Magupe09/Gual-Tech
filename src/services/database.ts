import { supabase } from './supabase'

/**
 * DELETE MACHINE
 * 
 * Elimina una máquina y todos sus informes asociados
 * ¿Por qué? Porque si la máquina se elimina, sus informes quedan huérfanos
 * 
 * @param machineId - ID de la máquina a eliminar
 * @throws Error si hay problema con Supabase
 */
export async function deleteMachine(machineId: string) {
  try {
    // PASO 1: Eliminar todos los informes asociados a la máquina
    const { error: reportsError } = await supabase
      .from('reports')
      .delete()
      .eq('machine_id', machineId)

    if (reportsError) {
      throw new Error(`Error al eliminar informes: ${reportsError.message}`)
    }

    // PASO 2: Eliminar la máquina
    const { error: machineError } = await supabase
      .from('machines')
      .delete()
      .eq('id', machineId)

    if (machineError) {
      throw new Error(`Error al eliminar máquina: ${machineError.message}`)
    }

    console.log('✅ Máquina eliminada exitosamente')
    return true
  } catch (error) {
    console.error('Error en deleteMachine:', error)
    throw error
  }
}

/**
 * DELETE REPORT
 * 
 * Elimina un informe específico
 * 
 * @param reportId - ID del informe a eliminar
 * @throws Error si hay problema con Supabase
 */
export async function deleteReport(reportId: string) {
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      throw new Error(`Error al eliminar informe: ${error.message}`)
    }

    console.log('✅ Informe eliminado exitosamente')
    return true
  } catch (error) {
    console.error('Error en deleteReport:', error)
    throw error
  }
}
