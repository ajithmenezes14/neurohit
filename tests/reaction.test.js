import { describe, it, expect } from 'vitest';
import { getGrade } from '../game-logic.js';

describe('getGrade', () => {
  // ── ELITE (< 180 ms) ───────────────────────────────────────────────────────

  it('returns ELITE for 0 ms (theoretical minimum)', () => {
    expect(getGrade(0)).toBe('ELITE');
  });

  it('returns ELITE for 100 ms', () => {
    expect(getGrade(100)).toBe('ELITE');
  });

  it('returns ELITE for 179 ms (last value in range)', () => {
    expect(getGrade(179)).toBe('ELITE');
  });

  // ── Fast (180–249 ms) ─────────────────────────────────────────────────────

  it('returns Fast for exactly 180 ms (boundary)', () => {
    expect(getGrade(180)).toBe('Fast');
  });

  it('returns Fast for 200 ms', () => {
    expect(getGrade(200)).toBe('Fast');
  });

  it('returns Fast for 249 ms (last value in range)', () => {
    expect(getGrade(249)).toBe('Fast');
  });

  // ── Average (250–349 ms) ──────────────────────────────────────────────────

  it('returns Average for exactly 250 ms (boundary)', () => {
    expect(getGrade(250)).toBe('Average');
  });

  it('returns Average for 300 ms', () => {
    expect(getGrade(300)).toBe('Average');
  });

  it('returns Average for 349 ms (last value in range)', () => {
    expect(getGrade(349)).toBe('Average');
  });

  // ── Slow (>= 350 ms) ──────────────────────────────────────────────────────

  it('returns Slow for exactly 350 ms (boundary)', () => {
    expect(getGrade(350)).toBe('Slow');
  });

  it('returns Slow for 500 ms', () => {
    expect(getGrade(500)).toBe('Slow');
  });

  it('returns Slow for very large values', () => {
    expect(getGrade(9999)).toBe('Slow');
  });

  // ── Boundary precision ─────────────────────────────────────────────────────

  it('boundary at 180: 179 → ELITE, 180 → Fast', () => {
    expect(getGrade(179)).toBe('ELITE');
    expect(getGrade(180)).toBe('Fast');
  });

  it('boundary at 250: 249 → Fast, 250 → Average', () => {
    expect(getGrade(249)).toBe('Fast');
    expect(getGrade(250)).toBe('Average');
  });

  it('boundary at 350: 349 → Average, 350 → Slow', () => {
    expect(getGrade(349)).toBe('Average');
    expect(getGrade(350)).toBe('Slow');
  });
});
