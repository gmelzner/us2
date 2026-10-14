/**
 * Texts and HTML of US2's emails, in Spanish and English.
 * The texts come unchanged from the original Supabase function
 * (supabase/functions/send-scheduled-emails/index.ts).
 */

export const EMAIL_TEMPLATES = {
  es: {
    tagline: 'Somos un equipo',
    footer: 'US2 - Visibiliza la carga mental del hogar',

    retest_reminder: {
      subject: '📊 ¿Cómo va el equilibrio? Es hora de re-evaluar',
      title: '¡Pasaron 2 semanas desde su último test!',
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

    monthly_achievements: {
      subject: '📊 Tu resumen mensual de logros en pareja',
      title: '¡Así les fue este mes! 🎉',
      body: 'Acá está el resumen de logros que sumaron juntos en {month}.',
      cta: 'Ver todos los logros',
      note: 'Cada pequeño logro cuenta. ¡Sigan construyendo juntos!'
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
      title: "It's been 2 weeks since your last test!",
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

    monthly_achievements: {
      subject: '📊 Your monthly couple achievements summary',
      title: "Here's how you did this month! 🎉",
      body: "Here's the summary of achievements you added together in {month}.",
      cta: 'See all achievements',
      note: 'Every small achievement counts. Keep building together!'
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

export function getLang(lang) {
  return lang === 'en' ? 'en' : 'es';
}

/** Text typed by people (achievements, names) never goes into the HTML as markup. */
export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BASE_STYLE = 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;';

function frame(lang, content) {
  const t = EMAIL_TEMPLATES[lang];
  return `
    <div style="${BASE_STYLE}">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #14b8a6; margin: 0;">US2</h1>
        <p style="color: #666; margin: 5px 0;">${t.tagline}</p>
      </div>
      ${content}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        ${t.footer}<br>
        <a href="https://us2.fun" style="color: #14b8a6;">us2.fun</a>
      </p>
    </div>
  `;
}

function button(link, label, gradient = 'linear-gradient(135deg, #14b8a6, #0d9488)') {
  return `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${escapeHtml(link)}" style="background: ${gradient}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
          ${label}
        </a>
      </div>`;
}

export function getSubject(templateKey, lang, extras = {}) {
  return EMAIL_TEMPLATES[lang][templateKey].subject.replace('{category}', extras.category ?? '');
}

export function generateEmailHtml(templateKey, lang, returnLink, extras = {}) {
  const template = EMAIL_TEMPLATES[lang][templateKey];
  const category = escapeHtml(extras.category ?? '');
  const title = (template.title || '').replace('{category}', category).replace('{days}', String(extras.days ?? ''));
  const body = (template.body || '').replace('{category}', category);

  let gradient;
  if (templateKey === 'anniversary') gradient = 'linear-gradient(135deg, #e879f9, #a855f7)';
  if (templateKey === 'birthday') gradient = 'linear-gradient(135deg, #f472b6, #ec4899)';

  // idea, ideas and note are fixed texts from the templates, not user input
  const extra = [template.idea, template.ideas]
    .filter(Boolean)
    .map((text) => `<p style="color: #555; line-height: 1.6;">${text}</p>`)
    .join('');
  const note = template.note ? `<p style="color: #888; font-size: 14px; text-align: center;">${template.note}</p>` : '';

  return frame(lang, `
      <h2 style="color: #333;">${title}</h2>
      <p style="color: #555; line-height: 1.6;">${body}</p>
      ${extra}
      ${button(returnLink, template.cta, gradient)}
      ${note}`);
}

const CATEGORY_ICONS = {
  hogar: '🏠', limpieza: '🧹', admin: '📋', cuidado: '👶', emocional: '💬',
  social: '👥', salud: '🏥', mant: '🔧', logistica: '🚗', general: '✓',
};

export function generateMonthlyAchievementsHtml(lang, returnLink, achievements, userName, partnerName, month) {
  const template = EMAIL_TEMPLATES[lang].monthly_achievements;
  const mine = achievements.filter((achievement) => achievement.user === 'A');
  const theirs = achievements.filter((achievement) => achievement.user === 'B');

  const list = (items, color) =>
    items.length === 0
      ? `<p style="color: #888; font-style: italic; padding: 10px 0;">${lang === 'es' ? 'Sin logros este mes' : 'No achievements this month'}</p>`
      : items
          .map(
            (achievement) => `
      <div style="padding: 10px 15px; background: ${color}15; border-left: 3px solid ${color}; margin-bottom: 8px; border-radius: 0 8px 8px 0;">
        <span style="margin-right: 8px;">${CATEGORY_ICONS[achievement.category] || '✓'}</span>
        <span style="color: #333;">${escapeHtml(achievement.text)}</span>
      </div>`
          )
          .join('');

  const stat = (count, label, color, background = '#f8f8f8') => `
          <td align="center" style="padding: 10px;">
            <div style="text-align: center; padding: 15px 25px; background: ${background}; border-radius: 12px; display: inline-block;">
              <div style="font-size: 28px; font-weight: bold; color: ${color};">${count}</div>
              <div style="font-size: 12px; color: #666;">${escapeHtml(label)}</div>
            </div>
          </td>`;

  const section = (letter, name, items, color, letterColor) => `
      <div style="margin-bottom: 25px;">
        <h3 style="color: ${color}; font-size: 16px; margin-bottom: 10px;">
          <span style="width: 24px; height: 24px; background: ${color}; border-radius: 50%; display: inline-block; text-align: center; color: ${letterColor}; font-size: 12px; line-height: 24px; margin-right: 8px;">${letter}</span>
          ${escapeHtml(name)}
        </h3>
        ${list(items, color)}
      </div>`;

  return frame(lang, `
      <h2 style="color: #333; text-align: center;">${template.title}</h2>
      <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 30px;">${template.body.replace('{month}', month)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
        <tr>
          ${stat(mine.length, userName, '#7fb3b3')}
          ${stat(theirs.length, partnerName, '#a78bbd')}
          ${stat(achievements.length, 'Total', '#333', 'linear-gradient(135deg, #7fb3b315, #a78bbd15)')}
        </tr>
      </table>
      ${section('A', userName, mine, '#7fb3b3', 'white')}
      ${section('B', partnerName, theirs, '#a78bbd', '#333')}
      ${button(returnLink, template.cta)}
      <p style="color: #888; font-size: 14px; text-align: center;">${template.note}</p>`);
}
