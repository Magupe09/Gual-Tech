import { jsPDF } from 'jspdf'

// ─────────────────────────────────────────────────────────────
//  Constantes de diseño (estilo dashboard moderno)
// ─────────────────────────────────────────────────────────────
type RGB = [number, number, number]

const FONT = 'helvetica'
const BOLD = 'bold'
const NORMAL = 'normal'

const PURPLE: RGB = [83, 45, 140]
const PURPLE_DARK: RGB = [56, 30, 96]
const PURPLE_SOFT: RGB = [243, 238, 251]
const INK: RGB = [42, 42, 46]
const MUTED: RGB = [104, 104, 116]
const FAINT: RGB = [152, 152, 162]
const BORDER: RGB = [226, 221, 238]
const WHITE: RGB = [255, 255, 255]

const GREEN: RGB = [22, 163, 74]
const GREEN_SOFT: RGB = [229, 247, 235]
const RED: RGB = [220, 38, 38]
const RED_SOFT: RGB = [253, 233, 233]
const AMBER: RGB = [202, 138, 4]
const AMBER_SOFT: RGB = [254, 243, 199]
const BLUE: RGB = [37, 99, 235]
const BLUE_SOFT: RGB = [224, 237, 254]
const GRAY: RGB = [113, 113, 122]
const GRAY_SOFT: RGB = [241, 241, 245]

const MARGIN = 16
const PAGE_W = 210
const PAGE_H = 297
const CW = PAGE_W - MARGIN * 2

// ─────────────────────────────────────────────────────────────
//  Tipos de entrada
// ─────────────────────────────────────────────────────────────
export interface PdfMachineData {
  reference: string
  name: string
  serial_number: string
  brand?: string | null
  model?: string | null
  location?: string | null
  cliente?: string | null
  status?: string | null
}

export interface PdfReportData {
  report_date: string
  maintenance_type: string
  technician: string
  parts_changed: string[]
  notes: string
  cost: number
}

export interface GeneratePdfParams {
  machine: PdfMachineData
  report: PdfReportData
  photos: string[]
  signatureData: string | null
  consecutivo: string
}

// Mapeo de estados de máquina → etiqueta + color
const STATUS: Record<string, { label: string; color: RGB; soft: RGB }> = {
  activo: { label: 'OPERATIVO', color: GREEN, soft: GREEN_SOFT },
  inactivo: { label: 'INACTIVO', color: RED, soft: RED_SOFT },
  mantenimiento: { label: 'EN MANTENIMIENTO', color: AMBER, soft: AMBER_SOFT },
}

// Mapeo de tipo de mantenimiento → etiqueta + color
const MTYPE: Record<string, { label: string; color: RGB; soft: RGB }> = {
  preventivo: { label: 'PREVENTIVO', color: BLUE, soft: BLUE_SOFT },
  correctivo: { label: 'CORRECTIVO', color: RED, soft: RED_SOFT },
  predictivo: { label: 'PREDICTIVO', color: PURPLE, soft: PURPLE_SOFT },
}

const imageFormat = (dataUrl: string): string =>
  dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'

export async function generateReportPDF(params: GeneratePdfParams): Promise<jsPDF> {
  const { machine, report, photos, signatureData, consecutivo } = params

  const doc = new jsPDF()
  const PW = doc.internal.pageSize.getWidth()
  const PH = doc.internal.pageSize.getHeight()
  const MAX_Y = PH - MARGIN - 14

  let y = MARGIN

  // ── Utilidades de layout ──
  const ensureSpace = (h: number) => {
    if (y + h > MAX_Y) {
      doc.addPage()
      y = MARGIN
    }
  }

  const truncate = (text: string, maxW: number, size: number) => {
    doc.setFont(FONT, BOLD)
    doc.setFontSize(size)
    if (doc.getTextWidth(text) <= maxW) return text
    let t = text
    while (t.length > 0 && doc.getTextWidth(t + '…') > maxW) t = t.slice(0, -1)
    return t + '…'
  }

  // Tarjeta label/valor
  const card = (label: string, value: string, x: number, w: number, h: number, accent?: RGB) => {
    doc.setFillColor(...PURPLE_SOFT)
    doc.setDrawColor(...BORDER)
    doc.roundedRect(x, y, w, h, 2.5, 2.5, 'FD')
    doc.setFont(FONT, BOLD)
    doc.setFontSize(6.5)
    doc.setTextColor(...MUTED)
    doc.text(label.toUpperCase(), x + 5, y + 6)
    doc.setFont(FONT, BOLD)
    doc.setFontSize(9.5)
    doc.setTextColor(...(accent ?? INK))
    doc.text(truncate(value, w - 10, 9.5), x + 5, y + 12.5)
  }

  // Título de sección con barra de acento
  const sectionTitle = (text: string) => {
    ensureSpace(20)
    doc.setFillColor(...PURPLE)
    doc.roundedRect(MARGIN, y - 2, 3, 7, 1, 1, 'F')
    doc.setFont(FONT, BOLD)
    doc.setFontSize(11)
    doc.setTextColor(...PURPLE_DARK)
    doc.text(text.toUpperCase(), MARGIN + 7, y + 4)
    y += 13
  }

  // Carga del logo (si existe)
  let logoB64: string | null = null
  try {
    logoB64 = await urlToBase64('/logojavi.PNG')
  } catch {
    logoB64 = null
  }

  // ══════════════ CABECERA ══════════════
  doc.setFillColor(...PURPLE)
  doc.roundedRect(MARGIN, y, CW, 26, 4, 4, 'F')

  if (logoB64) {
    const lsz = 19
    try {
      doc.addImage(logoB64, 'PNG', MARGIN + 6, y + 3.5, lsz, lsz)
    } catch {}
  }

  const titleX = logoB64 ? MARGIN + 30 : MARGIN + 10
  doc.setFont(FONT, BOLD)
  doc.setFontSize(15)
  doc.setTextColor(...WHITE)
  doc.text('REPORTE DE MANTENIMIENTO', titleX, y + 11)

  doc.setFont(FONT, NORMAL)
  doc.setFontSize(8)
  doc.setTextColor(224, 216, 242)
  doc.text(`N° ${consecutivo}   ·   Generado: ${new Date().toLocaleDateString('es-ES')}`, titleX, y + 18)
  y += 26 + 10

  // ══════════════ INFORMACIÓN DEL EQUIPO ══════════════
  doc.setFont(FONT, BOLD)
  doc.setFontSize(13)
  doc.setTextColor(...INK)
  const machineTitle = machine.reference
    ? `${machine.reference}${machine.name ? ' · ' + machine.name : ''}`
    : (machine.name || 'Equipo')
  doc.text(doc.splitTextToSize(machineTitle, CW) as string[], MARGIN, y + 4)
  y += 12

  const info: [string, string][] = [
    ['Modelo', machine.model ? `${machine.brand || ''} ${machine.model}`.trim() : '—'],
    ['N° de serie', machine.serial_number || '—'],
    ['Cliente', machine.cliente || '—'],
    ['Ubicación', machine.location || '—'],
  ]
  const gap = 5
  const infoCardW = (CW - gap) / 2
  const infoCardH = 18
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const idx = r * 2 + c
      if (idx < info.length) {
        card(info[idx][0], info[idx][1], MARGIN + c * (infoCardW + gap), infoCardW, infoCardH)
      }
    }
    y += infoCardH + gap
  }
  y += 3

  // ══════════════ ESTADO DEL EQUIPO ══════════════
  const st = STATUS[machine.status || ''] ?? { label: 'SIN REGISTRO', color: GRAY, soft: GRAY_SOFT }
  ensureSpace(22)
  doc.setFillColor(...st.soft)
  doc.setDrawColor(...st.color)
  doc.roundedRect(MARGIN, y, CW, 19, 3, 3, 'FD')
  doc.setFont(FONT, BOLD)
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('ESTADO DEL EQUIPO', MARGIN + 7, y + 7)
  doc.setFont(FONT, BOLD)
  doc.setFontSize(15)
  doc.setTextColor(...st.color)
  doc.text(st.label, MARGIN + 7, y + 15)
  doc.setFillColor(...st.color)
  doc.circle(MARGIN + CW - 12, y + 9.5, 5.5, 'F')
  doc.setFillColor(...WHITE)
  doc.circle(MARGIN + CW - 12, y + 9.5, 2, 'F')
  y += 19 + 8

  // ══════════════ TARJETAS DE DATOS ══════════════
  const mt = MTYPE[report.maintenance_type] ?? {
    label: (report.maintenance_type || '—').toUpperCase(),
    color: GRAY,
    soft: GRAY_SOFT,
  }
  const dateLabel = report.report_date
    ? new Date(report.report_date).toLocaleDateString('es-ES')
    : '—'
  const costLabel = report.cost != null ? `$${Number(report.cost).toFixed(2)}` : '—'
  const cards: [string, string, RGB?][] = [
    ['Fecha', dateLabel],
    ['Tipo', mt.label, mt.color],
    ['Técnico', report.technician || '—'],
    ['Costo', costLabel],
  ]
  const rowGap = 5
  const rowCardW = (CW - rowGap * 3) / 4
  const rowCardH = 18
  for (let i = 0; i < 4; i++) {
    card(cards[i][0], cards[i][1], MARGIN + i * (rowCardW + rowGap), rowCardW, rowCardH, cards[i][2])
  }
  y += rowCardH + 8

  // ══════════════ RESUMEN DEL SERVICIO ══════════════
  sectionTitle('Resumen del servicio')

  const summaryItems: { label: string; color: RGB; soft: RGB }[] = []
  summaryItems.push(
    report.parts_changed.length > 0
      ? { label: `${report.parts_changed.length} componente(s) reemplazado(s)`, color: GREEN, soft: GREEN_SOFT }
      : { label: 'Sin componentes reemplazados', color: GRAY, soft: GRAY_SOFT }
  )
  summaryItems.push({ label: `Mantenimiento ${mt.label.toLowerCase()}`, color: mt.color, soft: mt.soft })
  if (report.notes && report.notes.trim()) {
    summaryItems.push({ label: 'Se registraron notas del servicio', color: BLUE, soft: BLUE_SOFT })
  }

  for (const item of summaryItems) {
    ensureSpace(15)
    doc.setFillColor(...item.soft)
    doc.setDrawColor(...BORDER)
    doc.roundedRect(MARGIN, y - 5, CW, 11, 2.5, 2.5, 'FD')
    doc.setFillColor(...item.color)
    doc.circle(MARGIN + 7, y, 2.2, 'F')
    doc.setFont(FONT, NORMAL)
    doc.setFontSize(9)
    doc.setTextColor(...INK)
    doc.text(item.label, MARGIN + 13, y + 3)
    y += 15
  }

  // Detalle de componentes como chips
  if (report.parts_changed.length > 0) {
    ensureSpace(26)
    doc.setFont(FONT, BOLD)
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('DETALLE DE COMPONENTES', MARGIN, y)
    y += 6
    let cx = MARGIN
    const chipH = 8
    for (const part of report.parts_changed) {
      doc.setFont(FONT, NORMAL)
      doc.setFontSize(8)
      const text = `•  ${part}`
      const tw = doc.getTextWidth(text) + 10
      if (cx + tw > MARGIN + CW) {
        cx = MARGIN
        y += chipH + 4
      }
      doc.setFillColor(...PURPLE_SOFT)
      doc.roundedRect(cx, y - chipH + 2, tw, chipH, 3, 3, 'F')
      doc.setTextColor(...PURPLE_DARK)
      doc.text(text, cx + 5, y + 1.5)
      cx += tw + 4
    }
    y += chipH + 4
  }
  y += 4

  // ══════════════ TRABAJO REALIZADO ══════════════
  sectionTitle('Trabajo realizado')
  const paragraphs = (report.notes || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (paragraphs.length > 0) {
    paragraphs.forEach((p, i) => {
      const lines = doc.splitTextToSize(p, CW - 18) as string[]
      const blockH = Math.max(13, lines.length * 4.5 + 8)
      ensureSpace(blockH)
      const num = String(i + 1).padStart(2, '0')
      doc.setFillColor(...PURPLE)
      doc.roundedRect(MARGIN, y - 4, 10, 9, 2, 2, 'F')
      doc.setFont(FONT, BOLD)
      doc.setFontSize(9)
      doc.setTextColor(...WHITE)
      doc.text(num, MARGIN + 5, y + 2, { align: 'center' })
      doc.setFont(FONT, NORMAL)
      doc.setFontSize(9)
      doc.setTextColor(...INK)
      doc.text(lines, MARGIN + 15, y + 2)
      y += blockH
    })
  } else {
    doc.setFont(FONT, NORMAL)
    doc.setFontSize(9)
    doc.setTextColor(...FAINT)
    doc.text('Sin detalle de actividades registrado.', MARGIN, y)
    y += 10
  }
  y += 4

  // ══════════════ REGISTRO FOTOGRÁFICO ══════════════
  if (photos.length > 0) {
    sectionTitle('Registro fotográfico')

    const cols = 2
    const photoGap = 6
    const cellW = (CW - photoGap * (cols - 1)) / cols
    const cellH = 60
    const blockH = cellH + 9

    let idx = 0
    while (idx < photos.length) {
      const availableRows = Math.max(1, Math.floor((MAX_Y - y) / blockH))
      const count = Math.min(photos.length - idx, availableRows * cols)

      for (let j = 0; j < count; j++) {
        const col = j % cols
        const row = Math.floor(j / cols)
        const px = MARGIN + col * (cellW + photoGap)
        const py = y + row * blockH

        doc.setFillColor(247, 246, 250)
        doc.setDrawColor(...BORDER)
        doc.roundedRect(px, py, cellW, cellH, 3, 3, 'FD')

        const dataUrl = photos[idx + j]
        const fmt = imageFormat(dataUrl)
        try {
          const props = doc.getImageProperties(dataUrl)
          const ratio = props.height / props.width
          let w = cellW - 8
          let h = w * ratio
          if (h > cellH - 8) {
            h = cellH - 8
            w = h / ratio
          }
          const ix = px + (cellW - w) / 2
          const iy = py + (cellH - h) / 2
          doc.addImage(dataUrl, fmt, ix, iy, w, h)
        } catch {
          try {
            doc.addImage(dataUrl, fmt, px + 4, py + 4, cellW - 8, cellH - 8)
          } catch {}
        }

        doc.setFont(FONT, BOLD)
        doc.setFontSize(7.5)
        doc.setTextColor(...MUTED)
        doc.text(`Foto ${String(idx + j + 1).padStart(2, '0')}`, px, py + cellH + 5)
      }

      idx += count
      if (idx < photos.length) {
        doc.addPage()
        y = MARGIN
      } else {
        y += Math.ceil(count / cols) * blockH
      }
    }
    y += 4
  }

  // ══════════════ FIRMA ══════════════
  if (signatureData) {
    ensureSpace(62)
    sectionTitle('Firma del responsable')

    const sigW = 70
    const sigH = 34
    doc.setDrawColor(...BORDER)
    doc.setFillColor(247, 246, 250)
    doc.roundedRect(MARGIN, y, sigW, sigH, 3, 3, 'FD')

    const fmt = imageFormat(signatureData)
    try {
      const props = doc.getImageProperties(signatureData)
      const ratio = props.height / props.width
      let w = sigW - 10
      let h = w * ratio
      if (h > sigH - 10) {
        h = sigH - 10
        w = h / ratio
      }
      const ix = MARGIN + (sigW - w) / 2
      const iy = y + (sigH - h) / 2
      doc.addImage(signatureData, fmt, ix, iy, w, h)
    } catch {
      try {
        doc.addImage(signatureData, fmt, MARGIN + 5, y + 5, sigW - 10, sigH - 10)
      } catch {}
    }

    const lineY = y + sigH + 12
    doc.setDrawColor(...MUTED)
    doc.setLineWidth(0.4)
    doc.line(MARGIN, lineY, MARGIN + sigW, lineY)
    doc.setFont(FONT, BOLD)
    doc.setFontSize(9)
    doc.setTextColor(...INK)
    doc.text(machine.cliente || machine.name || 'Responsable', MARGIN, lineY + 6)
    doc.setFont(FONT, NORMAL)
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('Responsable del mantenimiento', MARGIN, lineY + 11)
    y = lineY + 20
  }

  // ══════════════ FOOTER (todas las páginas) ══════════════
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, PH - 12, PW - MARGIN, PH - 12)
    doc.setFont(FONT, NORMAL)
    doc.setFontSize(7.5)
    doc.setTextColor(...FAINT)
    doc.text('GUALTECH · Reporte de Mantenimiento', MARGIN, PH - 7)
    doc.text(`Página ${i} de ${totalPages}`, PW - MARGIN, PH - 7, { align: 'right' })
  }

  return doc
}

export async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
