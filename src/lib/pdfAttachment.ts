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
      return null
    }

    
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

