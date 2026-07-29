import { jsPDF } from 'jspdf'

const FONT_TITLE = 'times'
const FONT_BODY = 'helvetica'
const BOLD = 'bold'
const NORMAL = 'normal'
const PRIMARY_RGB: [number, number, number] = [83, 45, 140]
const FRAME = 5
const MARGIN = 16

export interface PdfMachineData {
  reference: string
  name: string
  serial_number: string
  brand?: string | null
  model?: string | null
  location?: string | null
  cliente?: string | null
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

export async function generateReportPDF(params: GeneratePdfParams): Promise<jsPDF> {
  const { machine, report, photos, signatureData, consecutivo } = params
  const doc = new jsPDF()
  const PW = doc.internal.pageSize.getWidth()
  const PH = doc.internal.pageSize.getHeight()
  const M = MARGIN
  const CW = PW - M * 2
  const MAX_Y = PH - M - 20

  let currentPage = 1

  const drawFrame = () => {
    doc.setDrawColor(...PRIMARY_RGB)
    doc.setLineWidth(1.5)
    doc.roundedRect(FRAME, FRAME, PW - FRAME * 2, PH - FRAME * 2, 4, 4, 'S')
  }

  const newPage = (): number => {
    doc.addPage()
    currentPage++
    drawFrame()
    return M
  }

  const ensureSpace = (needed: number): void => {
    if (y + needed > MAX_Y) y = newPage()
  }

  // ── Page 1 ──
  drawFrame()
  let y = M

  // TITLE
  doc.setFontSize(24)
  doc.setFont(FONT_TITLE, BOLD)
  doc.setTextColor(...PRIMARY_RGB)
  doc.text('REPORTE TECNICO', M, y + 10)

  doc.setFontSize(10)
  doc.setFont(FONT_BODY, NORMAL)
  doc.setTextColor(60, 60, 60)
  doc.text(`N° ${consecutivo}`, PW - M, y + 10, { align: 'right' })
  doc.setFontSize(8)
  doc.setTextColor(140, 140, 140)
  doc.text(new Date().toLocaleDateString('es-ES'), PW - M, y + 18, { align: 'right' })
  y += 34

  // MACHINE INFO
  doc.setFontSize(11)
  doc.setFont(FONT_TITLE, BOLD)
  doc.setTextColor(40, 40, 40)
  doc.text(`${machine.reference} — ${machine.name}`, M, y)
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont(FONT_BODY, NORMAL)
  const machineMeta = [
    `Serie: ${machine.serial_number}`,
    `${machine.brand || '-'} ${machine.model || '-'}`,
    machine.location || ''
  ].filter(Boolean).join('  |  ')
  doc.text(machineMeta, M, y + 12)
  y += 32

  // SEPARATOR
  doc.setDrawColor(...PRIMARY_RGB)
  doc.setLineWidth(1)
  doc.line(M, y, PW - M, y)
  y += 14

  // TABLE DIMENSIONS — 2 columns (servicio + piezas), notas abajo a ancho completo
  const colW1 = (CW - 12) * 0.52
  const colW2 = (CW - 12) * 0.48
  const colX1 = M
  const colX2 = colX1 + colW1 + 12
  const LBL = 26
  const sepX1 = colX1 + colW1 + 6  // vertical divider between col1 and col2

  const drawTopHeaders = () => {
    doc.setFontSize(10)
    doc.setFont(FONT_TITLE, BOLD)
    doc.setTextColor(...PRIMARY_RGB)
    doc.text('DETALLE DEL SERVICIO', colX1, y)
    doc.text('PIEZAS CAMBIADAS', colX2, y)
    doc.setDrawColor(220, 210, 235)
    doc.setLineWidth(0.5)
    y += 4
    doc.line(colX1, y, PW - M, y)
    y += 12
  }

  const drawNotesHeader = (continued = false) => {
    doc.setFontSize(10)
    doc.setFont(FONT_TITLE, BOLD)
    doc.setTextColor(...PRIMARY_RGB)
    doc.text(continued ? 'NOTAS (cont.)' : 'NOTAS', M, y)
    doc.setDrawColor(220, 210, 235)
    doc.setLineWidth(0.5)
    y += 4
    doc.line(M, y, PW - M, y)
    y += 12
  }

  const drawCol1 = (): number => {
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    let cy = y
    const rows: [string, string][] = [
      ['Fecha', new Date(report.report_date).toLocaleDateString('es-ES')],
      ['Tipo', report.maintenance_type],
      ['Técnico', report.technician],
      ['Costo', `$${report.cost.toFixed(2)}`]
    ]
    rows.forEach(([lbl, val]) => {
      doc.setFont(FONT_BODY, BOLD)
      doc.text(lbl, colX1, cy)
      doc.setFont(FONT_BODY, NORMAL)
      doc.text(val, colX1 + LBL, cy)
      cy += 14
    })
    return cy
  }

  const drawCol2 = (): number => {
    doc.setFontSize(10)
    let cy = y
    if (report.parts_changed.length > 0) {
      doc.setTextColor(60, 60, 60)
      doc.setFont(FONT_BODY, NORMAL)
      report.parts_changed.forEach(part => {
        doc.text(`• ${part}`, colX2, cy)
        cy += 14
      })
    } else {
      doc.setTextColor(160, 160, 160)
      doc.setFont(FONT_BODY, NORMAL)
      doc.text('—', colX2, cy)
      cy += 14
    }
    return cy
  }

  // ── RENDER: Top row (2 columns: Servicio + Piezas) ──
  drawTopHeaders()
  const topHeaderY = y

  const c1end = drawCol1()
  const c2end = drawCol2()
  let yAfterTop = Math.max(c1end, c2end)

  // Vertical divider between col1 and col2
  doc.setDrawColor(230, 220, 240)
  doc.setLineWidth(0.3)
  doc.line(sepX1, topHeaderY, sepX1, yAfterTop)

  // Thin divider between top row and notes
  y = yAfterTop + 6
  doc.setDrawColor(200, 190, 220)
  doc.setLineWidth(0.4)
  doc.line(M, y, PW - M, y)
  y += 8

  // ── RENDER: Notes (full width, page-break aware) ──
  drawNotesHeader()
  let notesY = y
  let noteIdx = 0
  let splitNotes: string[] = []

  doc.setFontSize(10)
  if (report.notes) {
    doc.setTextColor(60, 60, 60)
    doc.setFont(FONT_BODY, NORMAL)
    splitNotes = doc.splitTextToSize(report.notes, CW)

    while (noteIdx < splitNotes.length) {
      const LINE_H = 12
      const remaining = MAX_Y - notesY

      if (remaining < LINE_H) {
        y = newPage()
        drawNotesHeader(true)
        notesY = y
        continue
      }

      const linesFit = Math.min(
        splitNotes.length - noteIdx,
        Math.floor(remaining / LINE_H)
      )
      const chunk = splitNotes.slice(noteIdx, noteIdx + linesFit)

      doc.text(chunk, M, notesY)
      noteIdx += chunk.length
      notesY += chunk.length * LINE_H
    }
    notesY += 8
  } else {
    doc.setTextColor(160, 160, 160)
    doc.setFont(FONT_BODY, NORMAL)
    doc.text('—', M, notesY)
    notesY += 14
  }

  y = notesY

  // Thin divider between notes and signature/photos
  y += 4
  ensureSpace(10)
  doc.setDrawColor(200, 190, 220)
  doc.setLineWidth(0.4)
  doc.line(M, y, PW - M, y)
  y += 8

  // ── BOTTOM: SIGNATURE + PHOTOS ──
  ensureSpace(100)
  const bottomGap = 14
  const sigSectionW = CW * 0.38
  const photoSectionW = CW * 0.62 - bottomGap
  const photoXStart = colX1 + sigSectionW + bottomGap
  const bottomStartY = y

  // Signature
  let sigEndY = bottomStartY
  if (signatureData) {
    doc.setFontSize(10)
    doc.setFont(FONT_TITLE, BOLD)
    doc.setTextColor(...PRIMARY_RGB)
    doc.text('FIRMA DEL RESPONSABLE', colX1, y)

    const sigBoxW = Math.min(sigSectionW - 8, 130)
    const sigBoxH = 44
    const sigX = colX1
    const sigY = y + 8

    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(sigX, sigY, sigBoxW, sigBoxH, 3, 3, 'FD')

    try { doc.addImage(signatureData, 'PNG', sigX + 2, sigY + 2, sigBoxW - 4, sigBoxH - 4) } catch {}

    const lineY = sigY + sigBoxH + 10
    doc.setDrawColor(100, 100, 100)
    doc.setLineWidth(0.4)
    doc.line(sigX, lineY, sigX + sigBoxW, lineY)

    doc.setFontSize(9)
    doc.setFont(FONT_BODY, NORMAL)
    doc.setTextColor(60, 60, 60)
    doc.text(machine.cliente || machine.name || 'Responsable', sigX, lineY + 6)
    doc.setFontSize(8)
    doc.setTextColor(140, 140, 140)
    doc.text(new Date(report.report_date).toLocaleDateString('es-ES'), sigX + sigBoxW, lineY + 6, { align: 'right' })

    sigEndY = lineY + 12
  } else {
    sigEndY = bottomStartY + 20
  }

  // Photos — render in batches that fit on each page
  let photoEndY = bottomStartY
  if (photos.length > 0) {
    let py = bottomStartY
    const perRow = Math.max(1, Math.floor(photoSectionW / 100))
    const thumbW = Math.min(90, Math.floor(photoSectionW / perRow) - 6)
    const thumbH = 62
    const thumbGap = 6
    const rowsPerPage = Math.max(1, Math.floor((MAX_Y - py - 10) / (thumbH + thumbGap)))
    const perPage = rowsPerPage * perRow

    let photoIdx = 0
    while (photoIdx < photos.length) {
      // Draw header
      doc.setFontSize(10)
      doc.setFont(FONT_TITLE, BOLD)
      doc.setTextColor(...PRIMARY_RGB)
      doc.text(photoIdx === 0 ? 'REGISTRO FOTOGRÁFICO' : 'REGISTRO FOTOGRÁFICO (cont.)', photoXStart, py)
      py += 10

      // How many on this page?
      const count = Math.min(perPage, photos.length - photoIdx)

      for (let j = 0; j < count; j++) {
        const col = j % perRow
        const row = Math.floor(j / perRow)
        const ix = photoXStart + col * (thumbW + thumbGap)
        const iy = py + row * (thumbH + thumbGap)

        doc.setDrawColor(200, 200, 200)
        doc.setFillColor(248, 247, 250)
        doc.roundedRect(ix, iy, thumbW, thumbH, 3, 3, 'FD')
        try { doc.addImage(photos[photoIdx + j], 'JPEG', ix + 1, iy + 1, thumbW - 2, thumbH - 2) } catch {}
        doc.setFontSize(6)
        doc.setTextColor(160, 160, 160)
        doc.text(`${photoIdx + j + 1}`, ix + thumbW - 10, iy + thumbH - 4)
      }

      photoIdx += count
      const rowsUsed = Math.ceil(count / perRow)
      photoEndY = py + rowsUsed * (thumbH + thumbGap)

      if (photoIdx < photos.length) {
        y = newPage()
        py = y
      }
    }
  } else {
    photoEndY = bottomStartY + 20
  }

  y = Math.max(sigEndY, photoEndY) + 4

  // ── FOOTER ──
  ensureSpace(14)
  doc.setDrawColor(...PRIMARY_RGB)
  doc.setLineWidth(0.8)
  doc.line(M, y, PW - M, y)
  y += 6

  doc.setFontSize(8)
  doc.setTextColor(140, 140, 140)
  doc.setFont(FONT_BODY, NORMAL)
  doc.text(`Técnico: ${report.technician || '—'}`, M, y)
  doc.text(`${currentPage}/${currentPage}`, PW - M, y, { align: 'right' })

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
