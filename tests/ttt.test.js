import { describe, it, expect } from 'vitest';
import { tttCheck, minimax } from '../game-logic.js';

// ── tttCheck ──────────────────────────────────────────────────────────────────

describe('tttCheck', () => {
  it('returns null on an empty board', () => {
    expect(tttCheck(Array(9).fill(null))).toBeNull();
  });

  it('detects a top-row horizontal win for X', () => {
    expect(tttCheck(['X','X','X', null,null,null, null,null,null])).toBe('X');
  });

  it('detects a middle-row horizontal win for O', () => {
    expect(tttCheck([null,null,null, 'O','O','O', null,null,null])).toBe('O');
  });

  it('detects a bottom-row horizontal win', () => {
    expect(tttCheck([null,null,null, null,null,null, 'X','X','X'])).toBe('X');
  });

  it('detects a left-column vertical win', () => {
    expect(tttCheck(['X',null,null, 'X',null,null, 'X',null,null])).toBe('X');
  });

  it('detects a right-column vertical win', () => {
    expect(tttCheck([null,null,'O', null,null,'O', null,null,'O'])).toBe('O');
  });

  it('detects a top-left to bottom-right diagonal', () => {
    expect(tttCheck(['X',null,null, null,'X',null, null,null,'X'])).toBe('X');
  });

  it('detects a top-right to bottom-left diagonal', () => {
    expect(tttCheck([null,null,'O', null,'O',null, 'O',null,null])).toBe('O');
  });

  it('returns null on a full draw board', () => {
    // X O X / X O O / O X X — no winner
    expect(tttCheck(['X','O','X', 'X','O','O', 'O','X','X'])).toBeNull();
  });

  it('does not count two-in-a-row as a win', () => {
    expect(tttCheck(['X','X',null, null,null,null, null,null,null])).toBeNull();
  });

  it('O wins even if X also has two-in-a-row', () => {
    expect(tttCheck(['O','O','O', 'X','X',null, null,null,null])).toBe('O');
  });
});

// ── minimax ───────────────────────────────────────────────────────────────────

describe('minimax', () => {
  it('returns score 10 immediately when O has already won', () => {
    const board = ['O','O','O', 'X','X',null, null,null,null];
    expect(minimax(board, 'X').score).toBe(10);
  });

  it('returns score -10 immediately when X has already won', () => {
    const board = ['X','X','X', 'O','O',null, null,null,null];
    expect(minimax(board, 'O').score).toBe(-10);
  });

  it('returns score 0 on a full draw board', () => {
    expect(minimax(['X','O','X', 'X','O','O', 'O','X','X'], 'O').score).toBe(0);
  });

  it('picks the winning move when O can win immediately (top row)', () => {
    // O,O,_ / X,X,_ / _,_,_  →  O plays index 2
    const board = ['O','O',null, 'X','X',null, null,null,null];
    expect(minimax(board, 'O').idx).toBe(2);
  });

  it('blocks X from winning (top row)', () => {
    // X,X,_ / O,_,_ / _,_,O  →  O must block at index 2
    const board = ['X','X',null, 'O',null,null, null,null,'O'];
    expect(minimax(board, 'O').idx).toBe(2);
  });

  it('O takes the winning move over blocking when both are possible', () => {
    // O can win AND X threatens — O should win immediately
    // O,O,_ / X,X,_ / _,_,_  (same as above — verify O wins, not blocks)
    const board = ['O','O',null, 'X','X',null, null,null,null];
    const result = minimax(board, 'O');
    expect(result.idx).toBe(2);   // winning move
    expect(result.score).toBe(10);
  });

  it('the AI (O) never loses from any starting position (score >= 0)', () => {
    // From an empty board, best play is at least a draw
    const result = minimax(Array(9).fill(null), 'O');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('returns a valid board index for every available move', () => {
    const board = ['X','O',null, null,'O','X', null,null,'X'];
    const result = minimax(board, 'O');
    expect(board[result.idx]).toBeNull(); // must pick an empty cell
  });
});
