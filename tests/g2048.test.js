import { describe, it, expect } from 'vitest';
import { slideRow, isGameOver } from '../game-logic.js';

// ── slideRow ──────────────────────────────────────────────────────────────────

describe('slideRow', () => {
  it('merges two equal adjacent tiles', () => {
    expect(slideRow([2,2,0,0]).row).toEqual([4,0,0,0]);
  });

  it('adds the merged value to scoreDelta', () => {
    expect(slideRow([2,2,0,0]).scoreDelta).toBe(4);
  });

  it('merges two independent pairs', () => {
    expect(slideRow([2,2,2,2]).row).toEqual([4,4,0,0]);
    expect(slideRow([2,2,2,2]).scoreDelta).toBe(8);
  });

  it('does not triple-merge three equal tiles (only one pair merges)', () => {
    // [4,4,4,0] → [8,4,0,0], not [12,0,0,0]
    expect(slideRow([4,4,4,0]).row).toEqual([8,4,0,0]);
    expect(slideRow([4,4,4,0]).scoreDelta).toBe(8);
  });

  it('slides tiles left before merging', () => {
    expect(slideRow([0,2,0,2]).row).toEqual([4,0,0,0]);
  });

  it('does not merge different tiles', () => {
    expect(slideRow([2,4,2,4]).row).toEqual([2,4,2,4]);
    expect(slideRow([2,4,2,4]).scoreDelta).toBe(0);
  });

  it('handles an all-zero row', () => {
    expect(slideRow([0,0,0,0]).row).toEqual([0,0,0,0]);
    expect(slideRow([0,0,0,0]).scoreDelta).toBe(0);
  });

  it('handles a row that is already left-packed with no merges', () => {
    expect(slideRow([2,4,8,16]).row).toEqual([2,4,8,16]);
    expect(slideRow([2,4,8,16]).scoreDelta).toBe(0);
  });

  it('slides a single tile to the front', () => {
    expect(slideRow([0,0,0,8]).row).toEqual([8,0,0,0]);
  });

  it('merges large tile values correctly', () => {
    expect(slideRow([1024,1024,0,0]).row).toEqual([2048,0,0,0]);
    expect(slideRow([1024,1024,0,0]).scoreDelta).toBe(2048);
  });

  it('does not mutate the input array', () => {
    const original = [2,2,4,4];
    slideRow(original);
    expect(original).toEqual([2,2,4,4]);
  });

  it('returns exactly 4 elements', () => {
    expect(slideRow([2,0,0,0]).row.length).toBe(4);
    expect(slideRow([0,0,0,0]).row.length).toBe(4);
  });
});

// ── isGameOver ────────────────────────────────────────────────────────────────

describe('isGameOver', () => {
  it('returns false when an empty cell exists', () => {
    const grid = [[2,4,2,4],[4,2,4,2],[2,4,2,4],[4,2,4,0]];
    expect(isGameOver(grid)).toBe(false);
  });

  it('returns false when horizontally adjacent equal tiles exist', () => {
    const grid = [
      [2,2,4,8],
      [8,16,32,64],
      [128,256,512,1024],
      [2048,128,64,32]
    ];
    expect(isGameOver(grid)).toBe(false);
  });

  it('returns false when vertically adjacent equal tiles exist', () => {
    const grid = [
      [2, 4,  8, 16],
      [2, 8, 16, 32],
      [4,16, 32, 64],
      [8,32, 64,128]
    ];
    expect(isGameOver(grid)).toBe(false);
  });

  it('returns true when the board is full with no possible merges', () => {
    const grid = [
      [2, 4,  2,  4],
      [4, 2,  4,  2],
      [2, 4,  2,  4],
      [4, 2,  4,  2]
    ];
    expect(isGameOver(grid)).toBe(true);
  });

  it('returns false for a board with one empty cell', () => {
    const grid = [
      [2, 4,  2,  4],
      [4, 2,  4,  2],
      [2, 4,  2,  4],
      [4, 2,  4,  0]  // last cell empty
    ];
    expect(isGameOver(grid)).toBe(false);
  });
});
