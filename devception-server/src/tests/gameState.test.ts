/// <reference types="node" />
/**
 * gameState.test.ts — Unit tests for core game logic, role assignments,
 * room code generation, and input sanitization.
 *
 * Run with: npx tsx src/tests/gameState.test.ts
 */

import * as assert from 'assert';
import { assignRoles } from '../utils/roleAssigner';
import { generateRoomCode } from '../utils/roomCodeGenerator';
import { sanitizeChatMessage, sanitizeRoomCode, sanitizeDisplayName } from '../utils/sanitizer';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ ${name}\n     ${msg}`);
    failed++;
  }
}

console.log('\n── Role Assigner Tests ─────────────────────────────────────────');

test('assignRoles: solo demo mode assigns 0 imposters', () => {
  const roles = assignRoles(['player1'], 1);
  assert.strictEqual(roles.get('player1'), 'good-coder');
});

test('assignRoles: 4 players with 1 imposter assigns exactly 1 imposter', () => {
  const players = ['p1', 'p2', 'p3', 'p4'];
  const roles = assignRoles(players, 1);
  const imposters = Array.from(roles.values()).filter((r) => r === 'imposter');
  const coders = Array.from(roles.values()).filter((r) => r === 'good-coder');

  assert.strictEqual(imposters.length, 1, 'Should have exactly 1 imposter');
  assert.strictEqual(coders.length, 3, 'Should have exactly 3 good-coders');
});

test('assignRoles: 6 players with 2 imposters assigns exactly 2 imposters', () => {
  const players = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
  const roles = assignRoles(players, 2);
  const imposters = Array.from(roles.values()).filter((r) => r === 'imposter');
  const coders = Array.from(roles.values()).filter((r) => r === 'good-coder');

  assert.strictEqual(imposters.length, 2, 'Should have exactly 2 imposters');
  assert.strictEqual(coders.length, 4, 'Should have exactly 4 good-coders');
});

console.log('\n── Room Code Tests ─────────────────────────────────────────────');

test('generateRoomCode: returns uppercase string of valid length', () => {
  const code = generateRoomCode();
  assert.strictEqual(typeof code, 'string');
  assert.ok(code.length >= 4 && code.length <= 8, 'Room code length should be 4-8 chars');
  assert.strictEqual(code, code.toUpperCase(), 'Room code should be uppercase');
});

test('sanitizeRoomCode: cleans lowercases and removes illegal symbols', () => {
  assert.strictEqual(sanitizeRoomCode(' room-123! '), 'ROOM123');
  assert.strictEqual(sanitizeRoomCode('dev#49'), 'DEV49');
});

console.log('\n── Sanitizer Tests ─────────────────────────────────────────────');

test('sanitizeChatMessage: escapes HTML and removes dangerous controls', () => {
  const dirty = '<script>alert("xss")</script>\u0000Hello';
  const clean = sanitizeChatMessage(dirty);
  assert.strictEqual(clean.includes('<script>'), false);
  assert.strictEqual(clean.includes('&lt;script&gt;'), true);
  assert.strictEqual(clean.includes('\u0000'), false);
});

test('sanitizeDisplayName: falls back to Player if empty after stripping', () => {
  assert.strictEqual(sanitizeDisplayName('   '), 'Player');
  assert.strictEqual(sanitizeDisplayName('<>""'), 'Player');
  assert.strictEqual(sanitizeDisplayName('CyberNinja'), 'CyberNinja');
});

console.log(`\n─────────────────────────────────────────────────────────────────`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
