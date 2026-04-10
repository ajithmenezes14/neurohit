import { describe, it, expect } from 'vitest';
import { evaluateGuess } from '../game-logic.js';

describe('evaluateGuess', () => {
  it('marks all letters correct when guess equals target', () => {
    expect(evaluateGuess('CRANE', 'CRANE'))
      .toEqual(['correct','correct','correct','correct','correct']);
  });

  it('marks all letters absent when none appear in the target', () => {
    // STOMP has no letters in CRANE
    expect(evaluateGuess('STOMP', 'CRANE'))
      .toEqual(['absent','absent','absent','absent','absent']);
  });

  it('marks a letter present when it is in the word at the wrong position', () => {
    // 'E' is in CRANE (pos 4); guessing it at pos 0 → present
    const res = evaluateGuess('EXTRA', 'CRANE');
    expect(res[0]).toBe('present'); // E is present
  });

  it('evaluates a fully mixed result correctly', () => {
    // target: CRANE  guess: TRACE
    // T → absent  R → correct (pos 1)  A → correct (pos 2)  C → present (pos 0 in target)  E → correct (pos 4)
    const res = evaluateGuess('TRACE', 'CRANE');
    expect(res[0]).toBe('absent');   // T not in CRANE
    expect(res[1]).toBe('correct');  // R at same position (1) in both words
    expect(res[2]).toBe('correct');  // A at same position (2) in both words
    expect(res[3]).toBe('present');  // C in CRANE at pos 0, wrong pos in guess
    expect(res[4]).toBe('correct');  // E at same position (4) in both words
  });

  it('does not double-count a letter that appears once in the target', () => {
    // target: CRANE  guess: RARER  (R appears 3× in guess, once in CRANE)
    const res = evaluateGuess('RARER', 'CRANE');
    const rHits = [res[0], res[2], res[4]].filter(r => r !== 'absent');
    expect(rHits.length).toBe(1); // only one R should be non-absent
  });

  it('prefers correct over present for the same letter', () => {
    // target: ABBEY  guess: AABBY
    // A at pos 0 is correct; extra A at pos 1 should be absent (no spare A)
    const res = evaluateGuess('AABBY', 'ABBEY');
    expect(res[0]).toBe('correct'); // A correct
    expect(res[1]).toBe('absent');  // second A — no spare A left in target
  });

  it('marks excess occurrences of a letter as absent', () => {
    // target: CRANE  guess: CCCCC
    // First C at pos 0 is correct; the rest see no more Cs in target
    const res = evaluateGuess('CCCCC', 'CRANE');
    expect(res[0]).toBe('correct');
    expect(res[1]).toBe('absent');
    expect(res[2]).toBe('absent');
    expect(res[3]).toBe('absent');
    expect(res[4]).toBe('absent');
  });

  it('handles a letter that is present but not correct at any position', () => {
    // target: WORLD  guess: LEMON
    // L at pos 0: present (L is at pos 3 in WORLD, no exact match consumed it)
    const res = evaluateGuess('LEMON', 'WORLD');
    expect(res[0]).toBe('present'); // L present at wrong position
  });

  it('always returns an array of exactly 5 elements', () => {
    expect(evaluateGuess('HELLO', 'WORLD').length).toBe(5);
  });

  it('returns only valid result values', () => {
    const valid = new Set(['correct', 'present', 'absent']);
    evaluateGuess('PLUMB', 'CRANE').forEach(v => expect(valid.has(v)).toBe(true));
  });
});
