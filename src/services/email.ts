/**
 * Servicio de Email
 *
 * Invoca la Edge Function de Supabase que envía informes por email
 * usando Gmail SMTP.
 */
import { supabase } from './supabase'

interface SendReportEmailParams {
  pdfUrl: string
  email: string
  machineReference: string
  machineName: string
  reportDate: string
  technician?: string
}

interface SendReportEmailResult {
  success: boolean
  message?: string
  messageId?: string
  error?: string
}

/**
 * Envía un informe de mantenimiento por email al cliente.
 *
 * Llama a la Edge Function `send-report-email` que:
 * 1. Descarga el PDF desde Supabase Storage
 * 2. Lo adjunta al email
 * 3. Envía usando Gmail SMTP
 *
 * @param params - Datos del informe y destinatario
 * @returns Resultado del envío con success/error
 * @throws Error si la Edge Function falla o retorna error
 *
 * @example
 * const result = await sendReportEmail({
 *   pdfUrl: report.pdf_url,
 *   email: machine.email,
 *   machineReference: machine.reference,
 *   machineName: machine.name,
 *   reportDate: new Date(report.report_date).toLocaleDateString('es-ES'),
 *   technician: report.technician,
 * })
 */
export async function sendReportEmail(params: SendReportEmailParams): Promise<SendReportEmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke<SendReportEmailResult>(
      'send-report-email',
      {
        body: params,
      }
    )

    if (error) {
      console.error('❌ Error en Edge Function:', error)
      throw new Error(error.message || 'Error al enviar el email')
    }

    // La Edge Function puede devolver success: false sin que falle la llamada HTTP
    if (data && !data.success) {
      throw new Error(data.error || 'Error desconocido al enviar el email')
    }

    console.log('✅ Email enviado:', data?.messageId)
    return data || { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado'
    console.error('❌ Error en sendReportEmail:', message)
    throw new Error(message)
  }
}
