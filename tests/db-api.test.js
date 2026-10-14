import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildStatement } from '../api/db.js';

const rejects = (request, why) => assert.throws(() => buildStatement(request), undefined, why);

test('reads and changes are always scoped to one pair', () => {
  rejects({ table: 'pairs', action: 'select', filters: [] }, 'no filter');
  rejects({ table: 'newsletter_subscribers', action: 'select', columns: 'email', filters: [['source', 'x']] }, 'not by pair');
  rejects({ table: 'pairs', action: 'update', values: { shared_context: {} }, filters: [['id', 'x']] }, 'pairs not by id');
  const { text, params } = buildStatement({ table: 'pairs', action: 'select', columns: 'shared_context', filters: [['pair_id', 'US2-ABC123']] });
  assert.equal(text, 'SELECT "shared_context" FROM "pairs" WHERE "pair_id" = $1 LIMIT 100');
  assert.deepEqual(params, ['US2-ABC123']);
});

test('only known tables, actions and columns get through', () => {
  rejects({ table: 'schema_migrations', action: 'select', filters: [['pair_id', 'US2-A1']] });
  rejects({ table: 'tests', action: 'update', values: { score: 1 }, filters: [['pair_id', 'US2-A1']] });
  rejects({ table: 'users', action: 'select', columns: 'email; DROP TABLE users', filters: [['pair_id', 'US2-A1']] });
  rejects({ table: 'users', action: 'insert', values: { pair_id: 'US2-A1', is_admin: true } });
  rejects({ table: 'pairs', action: 'select', filters: [['pair_id', "x' OR '1'='1"]] });
});

test('upserts follow the conflict key the app uses', () => {
  const { text, params } = buildStatement({
    table: 'pairs', action: 'upsert', onConflict: 'pair_id', returning: true,
    values: { pair_id: 'US2-A1', shared_context: { badges: [1, 2] } },
  });
  assert.match(text, /ON CONFLICT \("pair_id"\) DO UPDATE SET "shared_context" = EXCLUDED."shared_context", "updated_at" = now\(\) RETURNING/);
  assert.equal(params[1], '{"badges":[1,2]}');
  rejects({ table: 'pairs', action: 'upsert', onConflict: 'id', values: { pair_id: 'US2-A1' } });
});

test('an achievement can change status by its id', () => {
  const { text } = buildStatement({
    table: 'achievements', action: 'update', values: { status: 'done' },
    filters: [['id', '7d3f0d0e-8a43-4e3b-9d0a-1c2b3c4d5e6f']], returning: true,
  });
  assert.match(text, /^UPDATE "achievements" SET "status" = \$1 WHERE "id" = \$2 RETURNING/);
});
