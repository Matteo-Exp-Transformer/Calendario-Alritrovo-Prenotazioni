import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'noreply@resend.dev'
const SENDER_NAME = Deno.env.get('SENDER_NAME') || 'Al Ritrovo'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { to, subject, html, bookingId, emailType } = await req.json()
    
    console.log('[Edge Function] Sending email to:', to)
    console.log('[Edge Function] Subject:', subject)
    console.log('[Edge Function] Type:', emailType)
    console.log('[Edge Function] Booking ID:', bookingId)

    // Validate recipients
    let recipients: string | string[]
    
    if (Array.isArray(to)) {
      // Validate array: max 50 recipients (Resend limit)
      if (to.length > 50) {
        return new Response(JSON.stringify({ 
          error: 'Too many recipients. Maximum 50 recipients allowed.' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
      
      // Validate each email format (basic check)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      for (const email of to) {
        if (typeof email !== 'string' || !emailRegex.test(email)) {
          return new Response(JSON.stringify({ 
            error: `Invalid email format: ${email}` 
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          })
        }
      }
      
      recipients = to
    } else if (typeof to === 'string') {
      // Validate single email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(to)) {
        return new Response(JSON.stringify({ 
          error: `Invalid email format: ${to}` 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
      
      recipients = to
    } else {
      return new Response(JSON.stringify({ 
        error: 'Invalid recipient format. Must be a string or array of strings.' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: recipients, // Can be string or string[]
        subject,
        html,
      }),
    })
    
    const data = await res.json()
    
    console.log('[Edge Function] Resend response:', data)
    
    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('[Edge Function] Error:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
