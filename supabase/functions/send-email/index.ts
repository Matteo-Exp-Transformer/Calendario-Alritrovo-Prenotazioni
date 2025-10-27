import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'noreply@resend.dev'
const SENDER_NAME = Deno.env.get('SENDER_NAME') || 'Al Ritrovo'

Deno.serve(async (req) => {
  const { to, subject, html, bookingId, emailType } = await req.json()
  
  console.log('[Edge Function] Sending email to:', to)
  console.log('[Edge Function] Subject:', subject)
  console.log('[Edge Function] Type:', emailType)
  console.log('[Edge Function] Booking ID:', bookingId)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
    }),
  })
  
  const data = await res.json()
  
  console.log('[Edge Function] Resend response:', data)
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
