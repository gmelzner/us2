// Edge Function: send-scheduled-emails
// Checks for and sends automated emails based on triggers

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

// Email templates
const emailTemplates = {
  retest_reminder: {
    subject: '📊 ¿Cómo va el equilibrio? Es hora de re-evaluar',
    html: (returnLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #14b8a6; margin: 0;">US2</h1>
          <p style="color: #666; margin: 5px 0;">Somos un equipo</p>
        </div>

        <h2 style="color: #333;">¡Pasaron 7 días desde su último test!</h2>

        <p style="color: #555; line-height: 1.6;">
          Es un buen momento para revisar cómo va el equilibrio en casa.
          ¿Notaron cambios? ¿Hay algo que mejorar?
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${returnLink}" style="background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
            Hacer el test de seguimiento
          </a>
        </div>

        <p style="color: #888; font-size: 14px; text-align: center;">
          El progreso se construye con pequeñas acciones consistentes.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          US2 - Visibiliza la carga mental del hogar<br>
          <a href="https://us2.fun" style="color: #14b8a6;">us2.fun</a>
        </p>
      </div>
    `
  },

  scheduled_followup: {
    subject: '🔔 Recordatorio: Seguimiento programado de {category}',
    html: (returnLink: string, category: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #14b8a6; margin: 0;">US2</h1>
          <p style="color: #666; margin: 5px 0;">Somos un equipo</p>
        </div>

        <h2 style="color: #333;">¡Es hora del seguimiento que programaron!</h2>

        <p style="color: #555; line-height: 1.6;">
          Hace unas semanas decidieron revisar cómo iba la categoría <strong>"${category}"</strong>.
          Este es el recordatorio que pidieron.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${returnLink}" style="background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
            Ver progreso y re-evaluar
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          US2 - Visibiliza la carga mental del hogar<br>
          <a href="https://us2.fun" style="color: #14b8a6;">us2.fun</a>
        </p>
      </div>
    `
  },

  anniversary: {
    subject: '💕 ¡Su aniversario se acerca! Un regalo especial',
    html: (returnLink: string, daysUntil: number) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #14b8a6; margin: 0;">US2</h1>
          <p style="color: #666; margin: 5px 0;">Somos un equipo</p>
        </div>

        <h2 style="color: #333;">¡Faltan ${daysUntil} días para su aniversario! 🎉</h2>

        <p style="color: #555; line-height: 1.6;">
          Qué mejor momento para celebrar su equipo que revisando todo lo que construyeron juntos.
        </p>

        <p style="color: #555; line-height: 1.6;">
          <strong>Idea:</strong> Hagan el test juntos y conversen sobre cómo evolucionó su dinámica este año.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${returnLink}" style="background: linear-gradient(135deg, #e879f9, #a855f7); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
            Ver nuestro progreso como equipo
          </a>
        </div>

        <p style="color: #888; font-size: 14px; text-align: center;">
          ¡Felicitaciones por otro año juntos! 💕
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          US2 - Visibiliza la carga mental del hogar<br>
          <a href="https://us2.fun" style="color: #14b8a6;">us2.fun</a>
        </p>
      </div>
    `
  },

  birthday: {
    subject: '🎂 ¡El cumple de tu pareja se acerca!',
    html: (returnLink: string, daysUntil: number) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #14b8a6; margin: 0;">US2</h1>
          <p style="color: #666; margin: 5px 0;">Somos un equipo</p>
        </div>

        <h2 style="color: #333;">¡Faltan ${daysUntil} días para el cumpleaños de tu pareja! 🎂</h2>

        <p style="color: #555; line-height: 1.6;">
          Es un momento especial para demostrarle cuánto te importa.
          ¿Ya pensaste qué van a hacer juntos?
        </p>

        <p style="color: #555; line-height: 1.6;">
          <strong>Ideas:</strong>
          <ul style="color: #555;">
            <li>Planificar una cena especial</li>
            <li>Organizar un día libre de tareas domésticas para ella/él</li>
            <li>Registrar un logro sorpresa en US2</li>
          </ul>
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${returnLink}" style="background: linear-gradient(135deg, #f472b6, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
            Ver ideas de regalo
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          US2 - Visibiliza la carga mental del hogar<br>
          <a href="https://us2.fun" style="color: #14b8a6;">us2.fun</a>
        </p>
      </div>
    `
  },

  partner_completed: {
    subject: '🎉 ¡Tu pareja completó el test! Vean los resultados juntos',
    html: (returnLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #14b8a6; margin: 0;">US2</h1>
          <p style="color: #666; margin: 5px 0;">Somos un equipo</p>
        </div>

        <h2 style="color: #333;">¡Tu pareja completó el test! 🎉</h2>

        <p style="color: #555; line-height: 1.6;">
          Ya están listos los resultados de ambos. Es hora de verlos juntos y
          conversar sobre cómo se reparten la gestión del hogar.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${returnLink}" style="background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
            Ver resultados juntos
          </a>
        </div>

        <p style="color: #888; font-size: 14px; text-align: center;">
          Recuerden: no se trata de culpas, sino de entenderse mejor como equipo.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          US2 - Visibiliza la carga mental del hogar<br>
          <a href="https://us2.fun" style="color: #14b8a6;">us2.fun</a>
        </p>
      </div>
    `
  }
}

// Send email via Resend
async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'US2 <hola@us2.fun>',
      to,
      subject,
      html,
    }),
  })

  const data = await response.json()
  return { success: response.ok, data }
}

// Check and send retest reminders (7 days since last test)
async function checkRetestReminders() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Get pairs with email saved
  const { data: pairs, error } = await supabase
    .from('pairs')
    .select('pair_id, shared_context')
    .not('shared_context->userA_email', 'is', null)

  if (error || !pairs) return { sent: 0, errors: [] }

  const results = { sent: 0, errors: [] as string[] }

  for (const pair of pairs) {
    const ctx = pair.shared_context || {}
    const email = ctx.userA_email
    if (!email) continue

    const returnLink = ctx.userA_returnLink || `https://us2.fun?pairID=${pair.pair_id}&user=A`

    // Check last test date from testHistory
    const testHistory = ctx.testHistory || []
    if (testHistory.length === 0) continue

    const lastTest = testHistory[testHistory.length - 1]
    const lastTestDate = new Date(lastTest.savedAt || lastTest.userA?.timestamp)

    // Check if 7 days have passed and we haven't sent a reminder for this test
    const daysSinceTest = Math.floor((Date.now() - lastTestDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceTest >= 7 && daysSinceTest < 14) {
      // Check if we already sent this reminder
      const lastReminderSent = ctx.lastRetestReminderSent
      if (lastReminderSent && new Date(lastReminderSent) > lastTestDate) continue

      // Send reminder
      const template = emailTemplates.retest_reminder
      const result = await sendEmail(email, template.subject, template.html(returnLink))

      if (result.success) {
        // Mark as sent
        await supabase
          .from('pairs')
          .update({
            shared_context: {
              ...ctx,
              lastRetestReminderSent: new Date().toISOString()
            }
          })
          .eq('pair_id', pair.pair_id)

        results.sent++
      } else {
        results.errors.push(`Failed to send to ${email}: ${JSON.stringify(result.data)}`)
      }
    }
  }

  return results
}

// Check and send scheduled follow-up reminders
async function checkScheduledFollowups() {
  const { data: pairs, error } = await supabase
    .from('pairs')
    .select('pair_id, shared_context')
    .not('shared_context->scheduledReevals', 'is', null)

  if (error || !pairs) return { sent: 0, errors: [] }

  const results = { sent: 0, errors: [] as string[] }
  const now = new Date()

  for (const pair of pairs) {
    const ctx = pair.shared_context || {}
    const email = ctx.userA_email
    if (!email) continue

    const returnLink = ctx.userA_returnLink || `https://us2.fun?pairID=${pair.pair_id}&user=A`
    const scheduledReevals = ctx.scheduledReevals || {}

    for (const [catKey, reeval] of Object.entries(scheduledReevals)) {
      const evalData = reeval as any
      const scheduledDate = new Date(evalData.scheduledAt)

      // Check if the scheduled date has passed
      if (scheduledDate <= now) {
        // Check if we already sent this reminder
        if (evalData.reminderSent) continue

        const categoryNames: Record<string, string> = {
          cat_limpieza: 'Limpieza',
          cat_hogar: 'Hogar',
          cat_admin: 'Administración',
          cat_cuidado: 'Cuidado',
          cat_emocional: 'Emocional',
          cat_social: 'Social',
          cat_salud: 'Salud',
          cat_mant: 'Mantenimiento',
          cat_logistica: 'Logística'
        }

        const categoryName = categoryNames[catKey] || catKey
        const template = emailTemplates.scheduled_followup
        const subject = template.subject.replace('{category}', categoryName)
        const result = await sendEmail(email, subject, template.html(returnLink, categoryName))

        if (result.success) {
          // Mark this specific followup as sent
          const updatedReevals = { ...scheduledReevals }
          updatedReevals[catKey] = { ...evalData, reminderSent: true }

          await supabase
            .from('pairs')
            .update({
              shared_context: {
                ...ctx,
                scheduledReevals: updatedReevals
              }
            })
            .eq('pair_id', pair.pair_id)

          results.sent++
        } else {
          results.errors.push(`Failed to send followup to ${email}: ${JSON.stringify(result.data)}`)
        }
      }
    }
  }

  return results
}

// Check and send anniversary reminders (7 days before)
async function checkAnniversaryReminders() {
  const { data: pairs, error } = await supabase
    .from('pairs')
    .select('pair_id, shared_context, anniversary_date')

  if (error || !pairs) return { sent: 0, errors: [] }

  const results = { sent: 0, errors: [] as string[] }
  const now = new Date()
  const currentYear = now.getFullYear()

  for (const pair of pairs) {
    const ctx = pair.shared_context || {}
    const email = ctx.userA_email
    if (!email) continue

    // Check anniversary from shared_context or anniversary_date field
    const anniversary = ctx.anniversary || {}
    let anniversaryMonth = anniversary.month
    let anniversaryDay = anniversary.day

    // Also check the anniversary_date field (format: MM-DD)
    if (!anniversaryMonth && pair.anniversary_date) {
      const parts = pair.anniversary_date.split('-')
      if (parts.length === 2) {
        anniversaryMonth = parseInt(parts[0])
        anniversaryDay = parseInt(parts[1])
      }
    }

    if (!anniversaryMonth || !anniversaryDay) continue

    // Calculate days until anniversary
    const anniversaryThisYear = new Date(currentYear, anniversaryMonth - 1, anniversaryDay)
    if (anniversaryThisYear < now) {
      // Anniversary already passed this year, check next year
      anniversaryThisYear.setFullYear(currentYear + 1)
    }

    const daysUntil = Math.floor((anniversaryThisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Send reminder 7 days before
    if (daysUntil === 7) {
      // Check if we already sent this year's reminder
      const lastAnniversaryReminder = ctx.lastAnniversaryReminderYear
      if (lastAnniversaryReminder === currentYear) continue

      const returnLink = ctx.userA_returnLink || `https://us2.fun?pairID=${pair.pair_id}&user=A`
      const template = emailTemplates.anniversary
      const result = await sendEmail(email, template.subject, template.html(returnLink, daysUntil))

      if (result.success) {
        await supabase
          .from('pairs')
          .update({
            shared_context: {
              ...ctx,
              lastAnniversaryReminderYear: currentYear
            }
          })
          .eq('pair_id', pair.pair_id)

        results.sent++
      } else {
        results.errors.push(`Failed to send anniversary to ${email}: ${JSON.stringify(result.data)}`)
      }
    }
  }

  return results
}

// Check and send birthday reminders (7 days before)
async function checkBirthdayReminders() {
  const { data: pairs, error } = await supabase
    .from('pairs')
    .select('pair_id, shared_context')

  if (error || !pairs) return { sent: 0, errors: [] }

  const results = { sent: 0, errors: [] as string[] }
  const now = new Date()
  const currentYear = now.getFullYear()

  for (const pair of pairs) {
    const ctx = pair.shared_context || {}
    const email = ctx.userA_email
    if (!email) continue

    // Check birthday from shared_context
    const birthday = ctx.partnerBirthday || {}
    const birthdayMonth = birthday.month
    const birthdayDay = birthday.day

    if (!birthdayMonth || !birthdayDay) continue

    // Calculate days until birthday
    const birthdayThisYear = new Date(currentYear, birthdayMonth - 1, birthdayDay)
    if (birthdayThisYear < now) {
      // Birthday already passed this year, check next year
      birthdayThisYear.setFullYear(currentYear + 1)
    }

    const daysUntil = Math.floor((birthdayThisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Send reminder 7 days before
    if (daysUntil === 7) {
      // Check if we already sent this year's reminder
      const lastBirthdayReminder = ctx.lastBirthdayReminderYear
      if (lastBirthdayReminder === currentYear) continue

      const returnLink = 'https://www.amazon.com/s?k=birthday+gift+for+partner'
      const template = emailTemplates.birthday
      const result = await sendEmail(email, template.subject, template.html(returnLink, daysUntil))

      if (result.success) {
        await supabase
          .from('pairs')
          .update({
            shared_context: {
              ...ctx,
              lastBirthdayReminderYear: currentYear
            }
          })
          .eq('pair_id', pair.pair_id)

        results.sent++
      } else {
        results.errors.push(`Failed to send birthday to ${email}: ${JSON.stringify(result.data)}`)
      }
    }
  }

  return results
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { type, email, data } = await req.json().catch(() => ({}))

    // Manual send (for testing or immediate notifications)
    if (type === 'manual' && email) {
      const templateName = data?.template || 'partner_completed'
      const template = emailTemplates[templateName as keyof typeof emailTemplates]

      if (!template) {
        return new Response(JSON.stringify({ error: 'Invalid template' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const returnLink = data?.returnLink || 'https://us2.fun'
      const subject = template.subject.replace('{category}', data?.category || '')
      const html = typeof template.html === 'function'
        ? template.html(returnLink, data?.category || data?.daysUntil || '')
        : template.html

      const result = await sendEmail(email, subject, html)

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Cron job - check all triggers
    if (type === 'cron' || !type) {
      const retestResults = await checkRetestReminders()
      const followupResults = await checkScheduledFollowups()
      const anniversaryResults = await checkAnniversaryReminders()
      const birthdayResults = await checkBirthdayReminders()

      const totalSent = retestResults.sent + followupResults.sent + anniversaryResults.sent + birthdayResults.sent
      const allErrors = [
        ...retestResults.errors,
        ...followupResults.errors,
        ...anniversaryResults.errors,
        ...birthdayResults.errors,
      ]

      return new Response(JSON.stringify({
        success: true,
        summary: {
          retest_reminders: retestResults.sent,
          scheduled_followups: followupResults.sent,
          anniversary_reminders: anniversaryResults.sent,
          birthday_reminders: birthdayResults.sent,
          total_sent: totalSent,
        },
        errors: allErrors,
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid request type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
