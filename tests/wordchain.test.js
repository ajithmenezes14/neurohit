import { describe, it, expect } from 'vitest';
import { validateWord } from '../game-logic.js';

describe('validateWord', () => {
  // ── Empty chain (first word) ───────────────────────────────────────────────

  it('accepts any valid word as the first entry', () => {
    expect(validateWord('apple', [])).toEqual({ ok: true });
  });

  it('accepts a long word as the first entry', () => {
    expect(validateWord('extraordinary', [])).toEqual({ ok: true });
  });

  // ── Too short ──────────────────────────────────────────────────────────────

  it('rejects an empty string', () => {
    expect(validateWord('', [])).toMatchObject({ ok: false, code: 'too_short' });
  });

  it('rejects a null/undefined word', () => {
    expect(validateWord(null, [])).toMatchObject({ ok: false, code: 'too_short' });
  });

  it('rejects a single-character word', () => {
    expect(validateWord('a', [])).toMatchObject({ ok: false, code: 'too_short' });
  });

  it('accepts a two-character word (minimum length)', () => {
    expect(validateWord('an', [])).toEqual({ ok: true });
  });

  // ── Wrong starting letter ──────────────────────────────────────────────────

  it('rejects a word that does not start with the required letter', () => {
    const result = validateWord('cat', ['apple']);
    expect(result).toMatchObject({ ok: false, code: 'wrong_start', expected: 'e' });
  });

  it('includes the expected starting letter in the error', () => {
    const result = validateWord('dog', ['apple']);
    expect(result.expected).toBe('e');
  });

  it('accepts a word starting with the correct letter', () => {
    expect(validateWord('elephant', ['apple'])).toEqual({ ok: true });
  });

  it('respects the last letter of the most recently added word', () => {
    const chain = ['apple', 'elephant', 'tiger'];
    expect(validateWord('rabbit', chain)).toEqual({ ok: true }); // r is last of 'tiger'
    expect(validateWord('snake', chain)).toMatchObject({ ok: false, code: 'wrong_start' });
  });

  // ── Duplicate detection ────────────────────────────────────────────────────

  it('rejects a word already in the chain', () => {
    const result = validateWord('apple', ['apple']);
    expect(result).toMatchObject({ ok: false, code: 'duplicate' });
  });

  it('detects a duplicate mid-chain', () => {
    const chain = ['apple', 'elephant', 'tiger', 'rabbit'];
    expect(validateWord('tiger', chain)).toMatchObject({ ok: false, code: 'duplicate' });
  });

  it('does not flag a word that sounds similar but is not identical', () => {
    const chain = ['apple', 'elephant'];
    expect(validateWord('elephants', chain)).toMatchObject({ ok: false, code: 'wrong_start' });
    // 'elephants' starts with 'e' (last of 'apple') — wait, 'apple' ends in 'e'
    // so 'elephants' starts with 'e' → valid start, not a duplicate, length >= 2 → ok
    expect(validateWord('elephants', ['apple'])).toEqual({ ok: true });
  });

  // ── Case sensitivity ───────────────────────────────────────────────────────

  it('is case-sensitive — expects lowercase normalised input', () => {
    // Chain expects words starting with 'e'; 'Elephant' starts with 'E' ≠ 'e'
    const result = validateWord('Elephant', ['apple']);
    expect(result).toMatchObject({ ok: false, code: 'wrong_start' });
  });
});
