/**
 * Edge Function: send-report-email
 *
 * Envía informes de mantenimiento por email usando Gmail SMTP.
 * Corre en Supabase Edge Functions (Deno runtime).
 *
 * Body esperado (JSON):
 * {
 *   pdfUrl: string,           // URL pública del PDF en Supabase Storage
 *   email: string,            // Email del destinatario (cliente)
 *   machineReference: string, // Referencia de la máquina (ej: "MAQ-001")
 *   machineName: string,      // Nombre de la máquina
 *   reportDate: string,       // Fecha del informe (formato legible)
 *   technician?: string       // Técnico que realizó el mantenimiento
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore - npm specifier in Deno
import nodemailer from 'npm:nodemailer@6.9.15'

// CORS para que el frontend pueda llamar a la función
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  pdfUrl: string
  email: string
  machineReference: string
  machineName: string
  reportDate: string
  technician?: string
}

/**
 * Valida que los campos requeridos estén presentes
 */
function validateRequest(body: EmailRequest): string | null {
  if (!body.pdfUrl) return 'pdfUrl es requerido'
  if (!body.email) return 'email es requerido'
  if (!body.machineReference) return 'machineReference es requerido'
  if (!body.machineName) return 'machineName es requerido'
  if (!body.reportDate) return 'reportDate es requerido'

  // Validación básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) return 'Formato de email inválido'

  return null
}

/**
 * Construye el HTML del email con el diseño del informe
 */
function buildEmailHTML(params: EmailRequest): string {
  const { machineReference, machineName, reportDate, technician } = params

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 24px; margin-bottom: 24px;">
    <!-- Header -->
    <tr>
      <td style="background-color: #532D8C; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">INFORME DE MANTENIMIENTO</h1>
        <p style="color: #d4c4f0; margin: 8px 0 0 0; font-size: 14px;">Javi Control · Gualtech</p>
      </td>
    </tr>

    <!-- Contenido -->
    <tr>
      <td style="padding: 32px 24px;">
        <p style="color: #333333; font-size: 16px; margin: 0 0 24px 0;">
          Hola,
        </p>
        <p style="color: #333333; font-size: 16px; margin: 0 0 24px 0; line-height: 1.5;">
          Adjunto encontrarás el informe de mantenimiento correspondiente a la máquina
          <strong style="color: #532D8C;">${machineReference} - ${machineName}</strong>.
        </p>

        <!-- Datos del informe -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
          <tr>
            <td style="padding: 16px 20px; border-bottom: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Máquina</p>
              <p style="color: #1a1a1a; font-size: 15px; margin: 0; font-weight: 500;">${machineReference} - ${machineName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 20px; border-bottom: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Fecha del Informe</p>
              <p style="color: #1a1a1a; font-size: 15px; margin: 0; font-weight: 500;">${reportDate}</p>
            </td>
          </tr>
          ${technician ? `
          <tr>
            <td style="padding: 16px 20px;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Técnico</p>
              <p style="color: #1a1a1a; font-size: 15px; margin: 0; font-weight: 500;">${technician}</p>
            </td>
          </tr>
          ` : ''}
        </table>

        <p style="color: #333333; font-size: 16px; margin: 24px 0 0 0; line-height: 1.5;">
          El informe completo se adjunta en formato PDF. Si tenés alguna consulta, no dudes en contactarnos.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f5f5f5; padding: 16px 24px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          Este email fue enviado automáticamente por Javi Control.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

serve(async (req: Request) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Método no permitido. Usá POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body: EmailRequest = await req.json()

    // Validar campos requeridos
    const validationError = validateRequest(body)
    if (validationError) {
      return new Response(
        JSON.stringify({ success: false, error: validationError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Descargar PDF desde Supabase Storage
    console.log(`📥 Descargando PDF: ${body.pdfUrl}`)
    const pdfResponse = await fetch(body.pdfUrl)

    if (!pdfResponse.ok) {
      throw new Error(`No se pudo descargar el PDF: ${pdfResponse.status} ${pdfResponse.statusText}`)
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    // 2. Configurar transporte SMTP de Gmail
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')

    if (!smtpUser || !smtpPass) {
      throw new Error(
        'Credenciales SMTP no configuradas. ' +
        'Ejecutá: supabase secrets set SMTP_USER=tu-email@gmail.com SMTP_PASS=tu-app-password'
      )
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true para puerto 465 (SSL), false para 587 (TLS)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // 3. Enviar email con PDF adjunto
    console.log(`📧 Enviando email a ${body.email}...`)

    const info = await transporter.sendMail({
      from: `"Javi Control" <${smtpUser}>`,
      to: body.email,
      subject: `Informe de Mantenimiento - ${body.machineReference}`,
      html: buildEmailHTML(body),
      attachments: [
        {
          filename: `informe-${body.machineReference}-${body.reportDate.replace(/\//g, '-')}.pdf`,
          content: new Uint8Array(pdfBuffer),
          contentType: 'application/pdf',
        },
      ],
    })

    console.log(`✅ Email enviado. Message ID: ${info.messageId}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email enviado correctamente',
        messageId: info.messageId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error(`❌ Error enviando email: ${message}`)

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
