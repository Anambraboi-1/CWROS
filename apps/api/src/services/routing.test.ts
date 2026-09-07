import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.JWT_SECRET = 'test-secret-please-ignore-1234567890';
process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'cwros-test-')), 'test.db');

const { seedIfEmpty } = await import('../seed.js');
const { calculateShortestRoute } = await import('./routing.js');

seedIfEmpty();

test('README §9 acceptance case: A -> R is 11.07km via A-C-D-G-J-L-N-O-Q-R', () => {
  const result = calculateShortestRoute('A', 'R');
  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.path, ['A', 'C', 'D', 'G', 'J', 'L', 'N', 'O', 'Q', 'R']);
    assert.equal(result.distance_km, 11.07);
  }
});

test('README §10.4: unreachable destination returns success:false with no fabricated route', () => {
  const result = calculateShortestRoute('A', 'ZZ');
  assert.equal(result.success, false);
});
