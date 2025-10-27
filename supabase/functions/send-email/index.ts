import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'noreply@resend.dev'
const SENDER_NAME = Deno.env.get('SENDER_NAME') || 'Al Ritrovo'

interface SendEmailRequest {
  to: string
  subject: string
  html: string
  bookingId?: string
  emailType: string
}

interface ResendResponse {
  success: boolean
  error?: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('[Edge Function] RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const emailData: SendEmailRequest = await req.json()
    
    console.log('[Edge Function] Sending email to:', emailData.to)
    console.log('[Edge Function] Subject:', emailData.subject)
    console.log('[Edge Function] Type:', emailData.emailType)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Edge Function] Resend error:', data)
      return new Response(
        JSON.stringify({ success: false, error: data.message || 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Edge Function] Email sent successfully:', data.id)

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[Edge Function] Exception:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

