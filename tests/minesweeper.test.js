import { describe, it, expect } from 'vitest';
import { buildMineBoard, floodReveal } from '../game-logic.js';

// ── buildMineBoard ────────────────────────────────────────────────────────────

describe('buildMineBoard', () => {
  it('returns a board with the correct number of rows and columns', () => {
    const board = buildMineBoard(9, 9, 10, 4, 4);
    expect(board.length).toBe(9);
    board.forEach(row => expect(row.length).toBe(9));
  });

  it('places exactly the requested number of mines', () => {
    const board = buildMineBoard(9, 9, 10, 4, 4);
    const count = board.flat().filter(v => v === -1).length;
    expect(count).toBe(10);
  });

  it('never places a mine on the avoided cell (centre)', () => {
    for (let i = 0; i < 20; i++) {
      const board = buildMineBoard(9, 9, 10, 4, 4);
      expect(board[4][4]).not.toBe(-1);
    }
  });

  it('never places a mine on the avoided cell (corner)', () => {
    for (let i = 0; i < 20; i++) {
      const board = buildMineBoard(9, 9, 10, 0, 0);
      expect(board[0][0]).not.toBe(-1);
    }
  });

  it('computes correct neighbour counts for every non-mine cell', () => {
    const board = buildMineBoard(5, 5, 5, 2, 2);
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (board[r][c] === -1) continue;
        let expected = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && board[nr][nc] === -1) expected++;
          }
        }
        expect(board[r][c]).toBe(expected);
      }
    }
  });

  it('places exactly the requested number of mines on a small 3×3 board', () => {
    const board = buildMineBoard(3, 3, 3, 1, 1);
    const count = board.flat().filter(v => v === -1).length;
    expect(count).toBe(3);
  });

  it('produces a board with no mines when mine count is 0', () => {
    const board = buildMineBoard(4, 4, 0, 0, 0);
    expect(board.flat().every(v => v === 0)).toBe(true);
  });
});

// ── floodReveal ───────────────────────────────────────────────────────────────

function makeGrid(rows, cols, fill) {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

describe('floodReveal', () => {
  it('reveals the clicked cell', () => {
    const board    = [[1,1,1],[1,0,1],[1,1,1]];
    const revealed = makeGrid(3,3,false);
    const flagged  = makeGrid(3,3,false);
    floodReveal(board, revealed, flagged, 3, 3, 0, 0);
    expect(revealed[0][0]).toBe(true);
  });

  it('does not reveal flagged cells', () => {
    const board    = [[0,0],[0,0]];
    const revealed = makeGrid(2,2,false);
    const flagged  = makeGrid(2,2,false);
    flagged[0][1] = true;
    floodReveal(board, revealed, flagged, 2, 2, 0, 0);
    expect(revealed[0][1]).toBe(false);
  });

  it('does not re-reveal an already-revealed cell (no infinite loop)', () => {
    const board    = [[0,0],[0,0]];
    const revealed = makeGrid(2,2,false);
    const flagged  = makeGrid(2,2,false);
    expect(() => floodReveal(board, revealed, flagged, 2, 2, 0, 0)).not.toThrow();
  });

  it('flood-fills through a board of all zeros', () => {
    const board    = [[0,0,0],[0,0,0],[0,0,0]];
    const revealed = makeGrid(3,3,false);
    const flagged  = makeGrid(3,3,false);
    floodReveal(board, revealed, flagged, 3, 3, 1, 1);
    expect(revealed.flat().every(Boolean)).toBe(true);
  });

  it('stops flood-fill at numbered (non-zero) borders', () => {
    // Zero cell surrounded by 1s: only the zero and its 8 neighbours revealed
    const board = [
      [1,1,1],
      [1,0,1],
      [1,1,1]
    ];
    const revealed = makeGrid(3,3,false);
    const flagged  = makeGrid(3,3,false);
    floodReveal(board, revealed, flagged, 3, 3, 1, 1);
    // The center (0) is revealed; its 8 neighbours (all 1s) are also revealed
    // because the flood enters them and reveals them (they are value 1, not 0,
    // so flood does not continue past them)
    expect(revealed[1][1]).toBe(true);
    expect(revealed[0][0]).toBe(true); // adjacent, so revealed
    expect(revealed.flat().filter(Boolean).length).toBe(9); // all 9 revealed
  });

  it('does not reveal a mine cell directly (mine reveals are handled by msClick)', () => {
    // floodReveal is only called for safe cells; if called on a mine the cell
    // simply gets revealed (msClick prevents this in practice)
    const board    = [[-1,0],[0,0]];
    const revealed = makeGrid(2,2,false);
    const flagged  = makeGrid(2,2,false);
    floodReveal(board, revealed, flagged, 2, 2, 1, 1); // click safe cell
    expect(revealed[0][0]).toBe(false); // mine cell — not reached via flood
  });

  it('stays within bounds — no index-out-of-range error on a 1×1 board', () => {
    const board    = [[0]];
    const revealed = [[false]];
    const flagged  = [[false]];
    expect(() => floodReveal(board, revealed, flagged, 1, 1, 0, 0)).not.toThrow();
    expect(revealed[0][0]).toBe(true);
  });
});
