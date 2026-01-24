// Edge Function: send-scheduled-emails
// Checks for and sends automated emails based on triggers
// Supports ES (Spanish) and EN (English)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

// Bilingual email templates
const emailTemplates = {
  es: {
    tagline: 'Somos un equipo',
    footer: 'US2 - Visibiliza la carga mental del hogar',

    retest_reminder: {
      subject: '📊 ¿Cómo va el equilibrio? Es hora de re-evaluar',
      title: '¡Pasaron 7 días desde su último test!',
      body: 'Es un buen momento para revisar cómo va el equilibrio en casa. ¿Notaron cambios? ¿Hay algo que mejorar?',
      cta: 'Hacer el test de seguimiento',
      note: 'El progreso se construye con pequeñas acciones consistentes.'
    },

    scheduled_followup: {
      subject: '🔔 Recordatorio: Seguimiento programado de {category}',
      title: '¡Es hora del seguimiento que programaron!',
      body: 'Hace unas semanas decidieron revisar cómo iba la categoría "{category}". Este es el recordatorio que pidieron.',
      cta: 'Ver progreso y re-evaluar'
    },

    anniversary: {
      subject: '💕 ¡Su aniversario se acerca! Un regalo especial',
      title: '¡Faltan {days} días para su aniversario! 🎉',
      body: 'Qué mejor momento para celebrar su equipo que revisando todo lo que construyeron juntos.',
      idea: '<strong>Idea:</strong> Hagan el test juntos y conversen sobre cómo evolucionó su dinámica este año.',
      cta: 'Ver nuestro progreso como equipo',
      note: '¡Felicitaciones por otro año juntos! 💕'
    },

    birthday: {
      subject: '🎂 ¡El cumple de tu pareja se acerca!',
      title: '¡Faltan {days} días para el cumpleaños de tu pareja! 🎂',
      body: 'Es un momento especial para demostrarle cuánto te importa. ¿Ya pensaste qué van a hacer juntos?',
      ideas: '<strong>Ideas:</strong><ul><li>Planificar una cena especial</li><li>Organizar un día libre de tareas domésticas</li><li>Registrar un logro sorpresa en US2</li></ul>',
      cta: 'Ver ideas de regalo'
    },

    partner_completed: {
      subject: '🎉 ¡Tu pareja completó el test! Vean los resultados juntos',
      title: '¡Tu pareja completó el test! 🎉',
      body: 'Ya están listos los resultados de ambos. Es hora de verlos juntos y conversar sobre cómo se reparten la gestión del hogar.',
      cta: 'Ver resultados juntos',
      note: 'Recuerden: no se trata de culpas, sino de entenderse mejor como equipo.'
    },

    categories: {
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
  },

  en: {
    tagline: 'We are a team',
    footer: 'US2 - Visualize the mental load at home',

    retest_reminder: {
      subject: '📊 How is the balance going? Time to re-evaluate',
      title: "It's been 7 days since your last test!",
      body: "It's a good time to review how the balance is going at home. Have you noticed changes? Is there something to improve?",
      cta: 'Take the follow-up test',
      note: 'Progress is built with small consistent actions.'
    },

    scheduled_followup: {
      subject: '🔔 Reminder: Scheduled follow-up for {category}',
      title: "It's time for the follow-up you scheduled!",
      body: 'A few weeks ago you decided to review how the "{category}" category was going. This is the reminder you requested.',
      cta: 'See progress and re-evaluate'
    },

    anniversary: {
      subject: '💕 Your anniversary is coming! A special gift',
      title: 'Only {days} days until your anniversary! 🎉',
      body: 'What better time to celebrate your team than by reviewing everything you built together.',
      idea: '<strong>Idea:</strong> Take the test together and discuss how your dynamic has evolved this year.',
      cta: 'See our progress as a team',
      note: 'Congratulations on another year together! 💕'
    },

    birthday: {
      subject: "🎂 Your partner's birthday is coming!",
      title: "Only {days} days until your partner's birthday! 🎂",
      body: "It's a special moment to show them how much you care. Have you thought about what you'll do together?",
      ideas: '<strong>Ideas:</strong><ul><li>Plan a special dinner</li><li>Organize a chore-free day for them</li><li>Log a surprise achievement in US2</li></ul>',
      cta: 'See gift ideas'
    },

    partner_completed: {
      subject: '🎉 Your partner completed the test! See the results together',
      title: 'Your partner completed the test! 🎉',
      body: "Both results are ready. It's time to see them together and discuss how you divide the household management.",
      cta: 'See results together',
      note: "Remember: it's not about blame, but about understanding each other better as a team."
    },

    categories: {
      cat_limpieza: 'Cleaning',
      cat_hogar: 'Home',
      cat_admin: 'Administration',
      cat_cuidado: 'Caregiving',
      cat_emocional: 'Emotional',
      cat_social: 'Social',
      cat_salud: 'Health',
      cat_mant: 'Maintenance',
      cat_logistica: 'Logistics'
    }
  }
}

type Lang = 'es' | 'en'
type TemplateKey = 'retest_reminder' | 'scheduled_followup' | 'anniversary' | 'birthday' | 'partner_completed'

// Get language or default to Spanish
function getLang(lang?: string): Lang {
  return lang === 'en' ? 'en' : 'es'
}

// Generate HTML email from template
function generateEmailHtml(
  templateKey: TemplateKey,
  lang: Lang,
  returnLink: string,
  extras?: { category?: string; days?: number }
): string {
  const t = emailTemplates[lang]
  const template = t[templateKey] as any

  const baseStyle = 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'

  let title = template.title || ''
  let body = template.body || ''

  // Replace placeholders
  if (extras?.category) {
    title = title.replace('{category}', extras.category)
    body = body.replace('{category}', extras.category)
  }
  if (extras?.days !== undefined) {
    title = title.replace('{days}', String(extras.days))
  }

  // Choose button color based on template
  let buttonGradient = 'linear-gradient(135deg, #14b8a6, #0d9488)' // teal default
  if (templateKey === 'anniversary') {
    buttonGradient = 'linear-gradient(135deg, #e879f9, #a855f7)' // purple
  } else if (templateKey === 'birthday') {
    buttonGradient = 'linear-gradient(135deg, #f472b6, #ec4899)' // pink
  }

  // Build extra content (ideas, notes)
  let extraContent = ''
  if (template.idea) {
    extraContent += `<p style="color: #555; line-height: 1.6;">${template.idea}</p>`
  }
  if (template.ideas) {
    extraContent += `<p style="color: #555; line-height: 1.6;">${template.ideas}</p>`
  }

  let noteContent = ''
  if (template.note) {
    noteContent = `<p style="color: #888; font-size: 14px; text-align: center;">${template.note}</p>`
  }

  return `
    <div style="${baseStyle}">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #14b8a6; margin: 0;">US2</h1>
        <p style="color: #666; margin: 5px 0;">${t.tagline}</p>
      </div>

      <h2 style="color: #333;">${title}</h2>

      <p style="color: #555; line-height: 1.6;">${body}</p>

      ${extraContent}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${returnLink}" style="background: ${buttonGradient}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
          ${template.cta}
        </a>
      </div>

      ${noteContent}

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        ${t.footer}<br>
        <a href="https://us2.fun" style="color: #14b8a6;">us2.fun</a>
      </p>
    </div>
  `
}

// Get subject with replacements
function getSubject(templateKey: TemplateKey, lang: Lang, extras?: { category?: string }): string {
  const template = emailTemplates[lang][templateKey] as any
  let subject = template.subject
  if (extras?.category) {
    subject = subject.replace('{category}', extras.category)
  }
  return subject
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

    const lang = getLang(ctx.userA_lang)
    const returnLink = ctx.userA_returnLink || `https://us2.fun?pairID=${pair.pair_id}&user=A`

    const testHistory = ctx.testHistory || []
    if (testHistory.length === 0) continue

    const lastTest = testHistory[testHistory.length - 1]
    const lastTestDate = new Date(lastTest.savedAt || lastTest.userA?.timestamp)
    const daysSinceTest = Math.floor((Date.now() - lastTestDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceTest >= 7 && daysSinceTest < 14) {
      const lastReminderSent = ctx.lastRetestReminderSent
      if (lastReminderSent && new Date(lastReminderSent) > lastTestDate) continue

      const subject = getSubject('retest_reminder', lang)
      const html = generateEmailHtml('retest_reminder', lang, returnLink)
      const result = await sendEmail(email, subject, html)

      if (result.success) {
        await supabase
          .from('pairs')
          .update({
            shared_context: { ...ctx, lastRetestReminderSent: new Date().toISOString() }
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

    const lang = getLang(ctx.userA_lang)
    const returnLink = ctx.userA_returnLink || `https://us2.fun?pairID=${pair.pair_id}&user=A`
    const scheduledReevals = ctx.scheduledReevals || {}
    const categories = emailTemplates[lang].categories as Record<string, string>

    for (const [catKey, reeval] of Object.entries(scheduledReevals)) {
      const evalData = reeval as any
      const scheduledDate = new Date(evalData.scheduledAt)

      if (scheduledDate <= now && !evalData.reminderSent) {
        const categoryName = categories[catKey] || catKey
        const subject = getSubject('scheduled_followup', lang, { category: categoryName })
        const html = generateEmailHtml('scheduled_followup', lang, returnLink, { category: categoryName })
        const result = await sendEmail(email, subject, html)

        if (result.success) {
          const updatedReevals = { ...scheduledReevals }
          updatedReevals[catKey] = { ...evalData, reminderSent: true }

          await supabase
            .from('pairs')
            .update({
              shared_context: { ...ctx, scheduledReevals: updatedReevals }
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

    const lang = getLang(ctx.userA_lang)

    const anniversary = ctx.anniversary || {}
    let anniversaryMonth = anniversary.month
    let anniversaryDay = anniversary.day

    if (!anniversaryMonth && pair.anniversary_date) {
      const parts = pair.anniversary_date.split('-')
      if (parts.length === 2) {
        anniversaryMonth = parseInt(parts[0])
        anniversaryDay = parseInt(parts[1])
      }
    }

    if (!anniversaryMonth || !anniversaryDay) continue

    const anniversaryThisYear = new Date(currentYear, anniversaryMonth - 1, anniversaryDay)
    if (anniversaryThisYear < now) {
      anniversaryThisYear.setFullYear(currentYear + 1)
    }

    const daysUntil = Math.floor((anniversaryThisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil === 7) {
      const lastAnniversaryReminder = ctx.lastAnniversaryReminderYear
      if (lastAnniversaryReminder === currentYear) continue

      const returnLink = ctx.userA_returnLink || `https://us2.fun?pairID=${pair.pair_id}&user=A`
      const subject = getSubject('anniversary', lang)
      const html = generateEmailHtml('anniversary', lang, returnLink, { days: daysUntil })
      const result = await sendEmail(email, subject, html)

      if (result.success) {
        await supabase
          .from('pairs')
          .update({
            shared_context: { ...ctx, lastAnniversaryReminderYear: currentYear }
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

    const lang = getLang(ctx.userA_lang)

    const birthday = ctx.partnerBirthday || {}
    const birthdayMonth = birthday.month
    const birthdayDay = birthday.day

    if (!birthdayMonth || !birthdayDay) continue

    const birthdayThisYear = new Date(currentYear, birthdayMonth - 1, birthdayDay)
    if (birthdayThisYear < now) {
      birthdayThisYear.setFullYear(currentYear + 1)
    }

    const daysUntil = Math.floor((birthdayThisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil === 7) {
      const lastBirthdayReminder = ctx.lastBirthdayReminderYear
      if (lastBirthdayReminder === currentYear) continue

      const returnLink = 'https://www.amazon.com/s?k=birthday+gift+for+partner'
      const subject = getSubject('birthday', lang)
      const html = generateEmailHtml('birthday', lang, returnLink, { days: daysUntil })
      const result = await sendEmail(email, subject, html)

      if (result.success) {
        await supabase
          .from('pairs')
          .update({
            shared_context: { ...ctx, lastBirthdayReminderYear: currentYear }
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
      const templateKey = (data?.template || 'partner_completed') as TemplateKey
      const lang = getLang(data?.lang)

      if (!emailTemplates[lang][templateKey]) {
        return new Response(JSON.stringify({ error: 'Invalid template' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const returnLink = data?.returnLink || 'https://us2.fun'
      const subject = getSubject(templateKey, lang, { category: data?.category })
      const html = generateEmailHtml(templateKey, lang, returnLink, {
        category: data?.category,
        days: data?.daysUntil
      })

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
