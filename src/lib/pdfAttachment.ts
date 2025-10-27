// PDF attachment for booking confirmation emails

export interface PDFAttachment {
  filename: string
  content: string // base64 encoded
  type: string
}

/**
 * Get the PDF attachment for booking confirmation
 * This PDF should only be attached when a booking is accepted
 */
export const getPDFAttachment = (): PDFAttachment | null => {
  try {
    const pdfBase64 = import.meta.env.VITE_MENU_PDF_BASE64
    
    if (!pdfBase64) {
      console.warn('[PDF] No PDF configured - skipping attachment')
      return null
    }

    console.log('[PDF] PDF attachment loaded successfully')
    console.log('[PDF] PDF size:', pdfBase64.length, 'chars')
    console.log('[PDF] First 50 chars:', pdfBase64.substring(0, 50))
    
    return {
      filename: 'Menu_Regolamento_Al_Ritrovo.pdf',
      content: pdfBase64,
      type: 'application/pdf',
    }
  } catch (error) {
    console.error('[PDF] Error loading PDF attachment:', error)
    return null
  }
}

