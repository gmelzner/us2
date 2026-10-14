/**
 * US2's automatic emails: what to send, to whom and when. Ported from the
 * original Supabase function with the same rules, plus three safeguards:
 *
 * - Links in emails are always built here, never taken from what the page
 *   saved, so an email from hola@us2.fun can only point to us2.fun.
 * - What has been sent is recorded under keys the page never writes, so the
 *   page saving its own copy of the context cannot make a reminder go twice.
 * - Changes to the shared context are merged key by key, not overwritten.
 *
 * Everything receives `query`, `send` and `now`, so it can be tested without
 * a real mail server or a real date.
 */

import { EMAIL_TEMPLATES, generateEmailHtml, generateMonthlyAchievementsHtml, getLang, getSubject } from './email-templates.js';

const SITE = 'https://us2.fun';
const DAY = 24 * 60 * 60 * 1000;
const MONTH_NAMES = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

export function returnLink(pairId, role) {
  return `${SITE}/?pairID=${encodeURIComponent(pairId)}&user=${role}`;
}

function mergeContext(query, pairId, changes) {
  return query(
    'UPDATE pairs SET shared_context = shared_context || $2::jsonb, updated_at = now() WHERE pair_id = $1',
    [pairId, JSON.stringify(changes)]
  );
}

/**
 * Calendar days from today to the next time this month and day come around.
 * Counted on dates, not hours: the original compared against midnight and
 * sent "7 days to go" eight days early.
 */
function daysUntilNext(month, day, now) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  let next = Date.UTC(now.getUTCFullYear(), month - 1, day);
  if (next < today) next = Date.UTC(now.getUTCFullYear() + 1, month - 1, day);
  return Math.round((next - today) / DAY);
}

async function sendAndRecord({ query, send, results }, pairId, to, subject, html, changes) {
  const result = await send(to, subject, html);
  if (result.success) {
    await mergeContext(query, pairId, changes);
    results.sent++;
  } else {
    results.errors.push(`${pairId}: ${JSON.stringify(result.data)}`);
  }
}

// Two weeks after the last test, invite them to take it again
async function retestReminders(context) {
  const { query, now } = context;
  const pairs = await query("SELECT pair_id, shared_context FROM pairs WHERE shared_context ? 'userA_email'");
  for (const { pair_id: pairId, shared_context: ctx } of pairs) {
    const history = Array.isArray(ctx.testHistory) ? ctx.testHistory : [];
    if (!ctx.userA_email || history.length === 0) continue;
    const last = history[history.length - 1];
    const lastTest = new Date(last.savedAt || last.userA?.timestamp);
    if (Number.isNaN(lastTest.getTime())) continue;
    const days = Math.floor((now.getTime() - lastTest.getTime()) / DAY);
    if (days < 14 || days >= 21) continue;
    if (ctx.lastRetestReminderSent && new Date(ctx.lastRetestReminderSent) > lastTest) continue;

    const lang = getLang(ctx.userA_lang);
    await sendAndRecord(context, pairId, ctx.userA_email, getSubject('retest_reminder', lang),
      generateEmailHtml('retest_reminder', lang, returnLink(pairId, 'A')),
      { lastRetestReminderSent: now.toISOString() });
  }
}

// 30 days after a follow-up they scheduled for a category
async function scheduledFollowups(context) {
  const { query, now } = context;
  const pairs = await query("SELECT pair_id, shared_context FROM pairs WHERE shared_context ? 'userA_email' AND shared_context ? 'scheduledReevals'");
  for (const { pair_id: pairId, shared_context: ctx } of pairs) {
    const lang = getLang(ctx.userA_lang);
    const sent = { ...(ctx.followupRemindersSent || {}) };
    for (const [category, reevaluation] of Object.entries(ctx.scheduledReevals || {})) {
      const scheduledAt = reevaluation?.scheduledAt;
      if (!scheduledAt || reevaluation.reminderSent || sent[category] === scheduledAt) continue;
      const due = new Date(scheduledAt);
      if (Number.isNaN(due.getTime())) continue;
      due.setDate(due.getDate() + 30);
      if (due > now) continue;

      const name = EMAIL_TEMPLATES[lang].categories[category] || category;
      sent[category] = scheduledAt;
      await sendAndRecord(context, pairId, ctx.userA_email, getSubject('scheduled_followup', lang, { category: name }),
        generateEmailHtml('scheduled_followup', lang, returnLink(pairId, 'A'), { category: name }),
        { followupRemindersSent: sent });
    }
  }
}

// A week before their anniversary
async function anniversaryReminders(context) {
  const { query, now } = context;
  const pairs = await query("SELECT pair_id, shared_context, anniversary_date FROM pairs WHERE shared_context ? 'userA_email'");
  for (const { pair_id: pairId, shared_context: ctx, anniversary_date: anniversaryDate } of pairs) {
    let month = Number(ctx.anniversary?.month);
    let day = Number(ctx.anniversary?.day);
    if (!month && anniversaryDate) [month, day] = anniversaryDate.split('-').map(Number);
    if (!month || !day) continue;
    const days = daysUntilNext(month, day, now);
    if (days !== 7 || ctx.lastAnniversaryReminderYear === now.getUTCFullYear()) continue;

    const lang = getLang(ctx.userA_lang);
    await sendAndRecord(context, pairId, ctx.userA_email, getSubject('anniversary', lang),
      generateEmailHtml('anniversary', lang, returnLink(pairId, 'A'), { days }),
      { lastAnniversaryReminderYear: now.getUTCFullYear() });
  }
}

// A week before the partner's birthday
async function birthdayReminders(context) {
  const { query, now } = context;
  const pairs = await query("SELECT pair_id, shared_context FROM pairs WHERE shared_context ? 'userA_email' AND shared_context ? 'partnerBirthday'");
  for (const { pair_id: pairId, shared_context: ctx } of pairs) {
    const month = Number(ctx.partnerBirthday?.month);
    const day = Number(ctx.partnerBirthday?.day);
    if (!month || !day) continue;
    const days = daysUntilNext(month, day, now);
    if (days !== 7 || ctx.lastBirthdayReminderYear === now.getUTCFullYear()) continue;

    const lang = getLang(ctx.userA_lang);
    await sendAndRecord(context, pairId, ctx.userA_email, getSubject('birthday', lang),
      generateEmailHtml('birthday', lang, returnLink(pairId, 'A'), { days }),
      { lastBirthdayReminderYear: now.getUTCFullYear() });
  }
}

// On the 1st, the achievements they approved last month, to whoever subscribed
async function monthlySummaries(context) {
  const { query, now } = context;
  if (now.getUTCDate() !== 1) return;
  // Last month, in UTC like the rest of the run (Vercel's clock)
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const thisMonth = (date) => Boolean(date) && new Date(date) >= end;

  const pairs = await query("SELECT pair_id, shared_context FROM pairs WHERE shared_context ? 'achievements'");
  for (const { pair_id: pairId, shared_context: ctx } of pairs) {
    const achievements = (Array.isArray(ctx.achievements) ? ctx.achievements : []).filter((achievement) => {
      if (achievement?.status !== 'approved' || !achievement.approvedAt) return false;
      const approved = new Date(achievement.approvedAt);
      return approved >= start && approved < end;
    });
    if (achievements.length === 0) continue;

    const users = await query('SELECT role, name FROM users WHERE pair_id = $1', [pairId]);
    const names = {
      A: users.find((user) => user.role === 'A')?.name || (ctx.userA_lang === 'en' ? 'User A' : 'Usuario A'),
      B: users.find((user) => user.role === 'B')?.name || (ctx.userB_lang === 'en' ? 'User B' : 'Usuario B'),
    };

    for (const [role, partner] of [['A', 'B'], ['B', 'A']]) {
      const email = ctx[`user${role}_email`];
      if (!email || !ctx[`user${role}_monthlySubscribed`] || thisMonth(ctx[`user${role}_lastMonthlySent`])) continue;
      const lang = getLang(ctx[`user${role}_lang`]);
      await sendAndRecord(context, pairId, email, EMAIL_TEMPLATES[lang].monthly_achievements.subject,
        generateMonthlyAchievementsHtml(lang, returnLink(pairId, role), achievements, names[role], names[partner], MONTH_NAMES[lang][start.getUTCMonth()]),
        { [`user${role}_lastMonthlySent`]: now.toISOString() });
    }
  }
}

/** The daily run: every kind of reminder, one after the other. */
export async function runScheduledEmails({ query, send, now = new Date() }) {
  const summary = {};
  const errors = [];
  for (const [name, check] of Object.entries({ retestReminders, scheduledFollowups, anniversaryReminders, birthdayReminders, monthlySummaries })) {
    const results = { sent: 0, errors };
    try {
      await check({ query, send, now, results });
    } catch (error) {
      errors.push(`${name}: ${error.message}`);
    }
    summary[name] = results.sent;
  }
  return { summary, errors };
}

/**
 * "Your partner completed the test", sent once, only when both tests are in
 * and person A left an email. Returns whether an email went out.
 */
export async function notifyPartnerCompleted({ query, send, pairId }) {
  const [pair] = await query('SELECT shared_context FROM pairs WHERE pair_id = $1', [pairId]);
  const ctx = pair?.shared_context;
  if (!ctx?.userA_email || ctx.partnerCompletedEmailSent) return false;
  const roles = await query('SELECT DISTINCT user_role FROM tests WHERE pair_id = $1', [pairId]);
  if (!['A', 'B'].every((role) => roles.some((row) => row.user_role === role))) return false;

  const lang = getLang(ctx.userA_lang);
  const result = await send(ctx.userA_email, getSubject('partner_completed', lang),
    generateEmailHtml('partner_completed', lang, returnLink(pairId, 'A')));
  if (!result.success) throw new Error(`Resend: ${JSON.stringify(result.data)}`);
  await mergeContext(query, pairId, { partnerCompletedEmailSent: new Date().toISOString() });
  return true;
}
