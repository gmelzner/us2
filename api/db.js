/**
 * The only door to the database. The page used to talk to Supabase straight
 * from the browser; it now sends the same small set of operations here, and
 * this function runs them only if they fit what the app actually does.
 *
 * Everything is scoped to a pair: a read or a change must say which pair it
 * is about, so nobody can list the whole table. The pair id is the key that
 * both people share through the link, as it was with Supabase.
 */

import { query } from '../lib/db.js';

const MAXIMUM_BODY_BYTES = 256_000;
const MAXIMUM_ROWS = 100;
const PAIR_ID = /^[A-Za-z0-9_-]{3,64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// pg would turn a JS array into a Postgres array, so JSON columns are sent as text
const JSON_COLUMNS = new Set(['shared_context', 'category_scores', 'answers']);

const TABLES = {
  pairs: {
    actions: ['select', 'update', 'upsert'],
    columns: ['id', 'pair_id', 'shared_context', 'anniversary_date', 'anniversary_email_sent', 'created_at', 'updated_at'],
    writable: ['pair_id', 'shared_context', 'anniversary_date', 'anniversary_email_sent'],
    conflict: ['pair_id'],
    touchesUpdatedAt: true,
  },
  users: {
    actions: ['select', 'insert', 'update'],
    columns: ['id', 'pair_uuid', 'pair_id', 'role', 'name', 'email', 'created_at'],
    writable: ['pair_uuid', 'pair_id', 'role', 'name', 'email'],
    conflict: [],
    // The app looks the person up first and then changes them by their id, a uuid
    updatableById: true,
  },
  tests: {
    actions: ['select', 'insert'],
    columns: ['id', 'pair_uuid', 'pair_id', 'user_role', 'score', 'category_scores', 'answers', 'completed_at'],
    writable: ['pair_uuid', 'pair_id', 'user_role', 'score', 'category_scores', 'answers'],
    conflict: [],
  },
  achievements: {
    actions: ['select', 'insert', 'update'],
    columns: ['id', 'pair_uuid', 'pair_id', 'user_role', 'text', 'category', 'status', 'created_at'],
    writable: ['pair_uuid', 'pair_id', 'user_role', 'text', 'category', 'status'],
    conflict: [],
    // An achievement's status is changed by its id, a uuid nobody can guess
    updatableById: true,
  },
  newsletter_subscribers: {
    actions: ['select', 'upsert'],
    columns: ['email', 'pair_id', 'source', 'created_at'],
    writable: ['email', 'source', 'pair_id', 'created_at'],
    conflict: ['email'],
  },
};

class InvalidRequest extends Error {}

function fail(message) {
  throw new InvalidRequest(message);
}

function quote(column) {
  return `"${column}"`;
}

function readColumns(table, columns) {
  if (columns === undefined || columns === '*') return table.columns;
  if (typeof columns !== 'string') fail('columns');
  const list = columns.split(',').map((column) => column.trim());
  if (!list.every((column) => table.columns.includes(column))) fail('columns');
  return list;
}

function readFilters(table, filters, action) {
  if (!Array.isArray(filters) || filters.length === 0 || filters.length > 3) fail('filters');
  for (const filter of filters) {
    if (!Array.isArray(filter) || filter.length !== 2 || !table.columns.includes(filter[0])) fail('filters');
  }
  const byPair = filters.find(([column]) => column === 'pair_id');
  const byId = filters.find(([column]) => column === 'id');
  if (byPair) {
    if (typeof byPair[1] !== 'string' || !PAIR_ID.test(byPair[1])) fail('pair_id');
  } else if (!(action === 'update' && table.updatableById && byId && UUID.test(String(byId[1])))) {
    fail('every read or change must name its pair');
  }
  return filters;
}

function readValues(table, values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) fail('values');
  const entries = Object.entries(values);
  if (entries.length === 0 || !entries.every(([column]) => table.writable.includes(column))) fail('values');
  if ('pair_id' in values && values.pair_id !== null && !PAIR_ID.test(String(values.pair_id))) fail('pair_id');
  return entries.map(([column, value]) => [
    column,
    JSON_COLUMNS.has(column) && value !== null ? JSON.stringify(value) : value,
  ]);
}

/** Turns one operation into a parameterised statement. Values never touch the SQL text. */
function buildStatement(request) {
  const table = TABLES[request.table];
  if (!table) fail('table');
  const { action } = request;
  if (!table.actions.includes(action)) fail('action');
  const name = quote(request.table);
  const params = [];
  const parameter = (value) => {
    params.push(value);
    return `$${params.length}`;
  };
  const where = (filters) =>
    ' WHERE ' + filters.map(([column, value]) => `${quote(column)} = ${parameter(value)}`).join(' AND ');
  const returning = request.returning ? ` RETURNING ${table.columns.map(quote).join(', ')}` : '';

  if (action === 'select') {
    const columns = readColumns(table, request.columns);
    let text = `SELECT ${columns.map(quote).join(', ')} FROM ${name}` + where(readFilters(table, request.filters, action));
    if (request.order) {
      if (!table.columns.includes(request.order.column)) fail('order');
      text += ` ORDER BY ${quote(request.order.column)} ${request.order.ascending === false ? 'DESC' : 'ASC'}`;
    }
    const limit = Number.isInteger(request.limit) ? Math.min(request.limit, MAXIMUM_ROWS) : MAXIMUM_ROWS;
    return { text: `${text} LIMIT ${limit}`, params };
  }

  if (action === 'update') {
    const filters = readFilters(table, request.filters, action);
    const values = readValues(table, request.values);
    const assignments = values.map(([column, value]) => `${quote(column)} = ${parameter(value)}`);
    if (table.touchesUpdatedAt) assignments.push('"updated_at" = now()');
    return { text: `UPDATE ${name} SET ${assignments.join(', ')}` + where(filters) + returning, params };
  }

  // insert and upsert
  const values = readValues(table, request.values);
  if (request.table !== 'newsletter_subscribers' && !values.some(([column]) => column === 'pair_id')) fail('pair_id');
  let text = `INSERT INTO ${name} (${values.map(([column]) => quote(column)).join(', ')}) VALUES (${values
    .map(([, value]) => parameter(value))
    .join(', ')})`;
  if (action === 'upsert') {
    if (!table.conflict.includes(request.onConflict)) fail('onConflict');
    const updates = values.filter(([column]) => column !== request.onConflict);
    const set = updates.map(([column]) => `${quote(column)} = EXCLUDED.${quote(column)}`);
    if (table.touchesUpdatedAt) set.push('"updated_at" = now()');
    text += ` ON CONFLICT (${quote(request.onConflict)}) ` + (set.length ? `DO UPDATE SET ${set.join(', ')}` : 'DO NOTHING');
  }
  return { text: text + returning, params };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? null);
    if (body.length > MAXIMUM_BODY_BYTES) return res.status(413).json({ error: 'Payload too large' });
    const request = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!request || typeof request !== 'object') fail('body');

    const { text, params } = buildStatement(request);
    return res.status(200).json({ data: await query(text, params) });
  } catch (error) {
    if (error instanceof InvalidRequest || error instanceof SyntaxError) {
      return res.status(400).json({ error: `Invalid request: ${error.message}` });
    }
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

export { buildStatement };
