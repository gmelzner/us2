/**
 * Runs against a real, throwaway Postgres (the rules lean on jsonb operators):
 *   TEST_DATABASE_URL=postgres://... npm test
 * Skipped when TEST_DATABASE_URL is not set. Never point it at production:
 * it wipes the tables.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import pg from 'pg';
import { runScheduledEmails, notifyPartnerCompleted, returnLink } from '../lib/scheduled-emails.js';

const url = process.env.TEST_DATABASE_URL;
const options = { skip: !url && 'TEST_DATABASE_URL not set' };
let client;
const query = (text, params) => client.query(text, params).then((result) => result.rows);

function postman() {
  const sent = [];
  const send = async (to, subject, html) => {
    sent.push({ to, subject, html });
    return { success: true, data: {} };
  };
  return { sent, send };
}

async function pair(pairId, context, anniversaryDate = null) {
  await query('INSERT INTO pairs (pair_id, shared_context, anniversary_date) VALUES ($1, $2, $3)', [pairId, JSON.stringify(context), anniversaryDate]);
}

before(async () => {
  if (!url) return;
  client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await client.query(readFileSync(new URL('../db/migrations/001_schema.sql', import.meta.url), 'utf-8'));
});
after(() => client?.end());

test('each reminder goes once, to person A, with a link to us2.fun', options, async () => {
  const now = new Date('2026-03-08T12:00:00Z');
  const daysAgo = (days) => new Date(now.getTime() - days * 86400000).toISOString();
  await pair('US2-RETEST', { userA_email: 'a@test', userA_lang: 'en', userA_returnLink: 'https://evil.example', testHistory: [{ savedAt: daysAgo(15) }] });
  await pair('US2-TOOSOON', { userA_email: 'b@test', testHistory: [{ savedAt: daysAgo(3) }] });
  await pair('US2-FOLLOW', { userA_email: 'c@test', scheduledReevals: { cat_hogar: { scheduledAt: daysAgo(31) } } });
  await pair('US2-ANNIV', { userA_email: 'd@test' }, '03-15');
  await pair('US2-BDAY', { userA_email: 'e@test', partnerBirthday: { month: 3, day: 15 } });
  await pair('US2-NOMAIL', { testHistory: [{ savedAt: daysAgo(15) }], partnerBirthday: { month: 3, day: 15 } });

  const { sent, send } = postman();
  const first = await runScheduledEmails({ query, send, now });
  assert.deepEqual(first.errors, []);
  assert.deepEqual(sent.map((email) => email.to).sort(), ['a@test', 'c@test', 'd@test', 'e@test']);
  assert.match(sent.find((email) => email.to === 'a@test').subject, /How is the balance going/);
  assert.match(sent.find((email) => email.to === 'c@test').subject, /Hogar/);
  for (const email of sent) assert.doesNotMatch(email.html, /evil\.example/);
  assert.ok(sent.find((email) => email.to === 'a@test').html.includes(returnLink('US2-RETEST', 'A').replace(/&/g, '&amp;')));

  // The page saves its own copy of the follow-ups without our mark: still only once
  await query("UPDATE pairs SET shared_context = shared_context || '{\"scheduledReevals\": {\"cat_hogar\": {\"scheduledAt\": \"" + daysAgo(31) + "\"}}}'::jsonb WHERE pair_id = 'US2-FOLLOW'");
  const again = postman();
  await runScheduledEmails({ query, send: again.send, now });
  assert.deepEqual(again.sent, []);
});

test('the monthly summary escapes what people typed', options, async () => {
  const now = new Date('2026-04-01T12:00:00Z');
  await pair('US2-MONTH', {
    userA_email: 'a@month', userA_monthlySubscribed: true,
    userB_email: 'b@month', userB_monthlySubscribed: true,
    achievements: [
      { text: '<img src=x onerror=alert(1)> Lavé los platos', user: 'A', category: 'hogar', status: 'approved', approvedAt: '2026-03-10T10:00:00Z' },
      { text: 'Pendiente', user: 'B', category: 'hogar', status: 'pending' },
    ],
  });
  await query("INSERT INTO users (pair_id, role, name) VALUES ('US2-MONTH', 'A', 'Ana'), ('US2-MONTH', 'B', 'Beto')");
  const { sent, send } = postman();
  await runScheduledEmails({ query, send, now });
  const monthly = sent.filter((email) => email.to.endsWith('@month'));
  assert.equal(monthly.length, 2);
  assert.ok(monthly[0].html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.doesNotMatch(monthly[0].html, /<img/);
  assert.match(monthly[0].html, /Marzo/);
});

test('partner notification needs both tests and goes only once', options, async () => {
  await pair('US2-NOTIFY', { userA_email: 'a@notify', userA_returnLink: 'https://evil.example' });
  await query("INSERT INTO tests (pair_id, user_role, score) VALUES ('US2-NOTIFY', 'A', 50)");
  const { sent, send } = postman();
  assert.equal(await notifyPartnerCompleted({ query, send, pairId: 'US2-NOTIFY' }), false);
  await query("INSERT INTO tests (pair_id, user_role, score) VALUES ('US2-NOTIFY', 'B', 40)");
  assert.equal(await notifyPartnerCompleted({ query, send, pairId: 'US2-NOTIFY' }), true);
  assert.equal(await notifyPartnerCompleted({ query, send, pairId: 'US2-NOTIFY' }), false);
  assert.equal(sent.length, 1);
  assert.doesNotMatch(sent[0].html, /evil\.example/);
});
