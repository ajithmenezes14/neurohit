import { describe, it, expect } from 'vitest';
import { isSnakeCollision } from '../game-logic.js';

// A typical snake body for most tests: head at (10,9), two segments behind it.
const snake = [{x:10,y:9}, {x:9,y:9}, {x:8,y:9}];

describe('isSnakeCollision', () => {
  // ── Walls ──────────────────────────────────────────────────────────────────

  it('returns false for a clear cell directly ahead', () => {
    expect(isSnakeCollision({x:11,y:9}, snake, 22, 18)).toBe(false);
  });

  it('detects a left-wall collision (x < 0)', () => {
    expect(isSnakeCollision({x:-1,y:9}, snake, 22, 18)).toBe(true);
  });

  it('detects a right-wall collision (x >= width)', () => {
    expect(isSnakeCollision({x:22,y:9}, snake, 22, 18)).toBe(true);
  });

  it('does not flag the last valid column as a wall (x = width-1)', () => {
    expect(isSnakeCollision({x:21,y:0}, snake, 22, 18)).toBe(false);
  });

  it('detects a top-wall collision (y < 0)', () => {
    expect(isSnakeCollision({x:5,y:-1}, snake, 22, 18)).toBe(true);
  });

  it('detects a bottom-wall collision (y >= height)', () => {
    expect(isSnakeCollision({x:5,y:18}, snake, 22, 18)).toBe(true);
  });

  it('does not flag the last valid row as a wall (y = height-1)', () => {
    expect(isSnakeCollision({x:0,y:17}, snake, 22, 18)).toBe(false);
  });

  // ── Self-collision ─────────────────────────────────────────────────────────

  it('detects collision with the head segment', () => {
    expect(isSnakeCollision({x:10,y:9}, snake, 22, 18)).toBe(true);
  });

  it('detects collision with a middle body segment', () => {
    expect(isSnakeCollision({x:9,y:9}, snake, 22, 18)).toBe(true);
  });

  it('detects collision with the tail segment', () => {
    expect(isSnakeCollision({x:8,y:9}, snake, 22, 18)).toBe(true);
  });

  it('does not flag the cell just beyond the tail as a collision', () => {
    expect(isSnakeCollision({x:7,y:9}, snake, 22, 18)).toBe(false);
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it('works correctly with a single-cell snake', () => {
    const tiny = [{x:5,y:5}];
    expect(isSnakeCollision({x:5,y:5}, tiny, 10, 10)).toBe(true);  // self
    expect(isSnakeCollision({x:6,y:5}, tiny, 10, 10)).toBe(false); // free
  });

  it('handles the top-left corner correctly', () => {
    expect(isSnakeCollision({x:0,y:0}, [], 22, 18)).toBe(false);   // free
    expect(isSnakeCollision({x:-1,y:0}, [], 22, 18)).toBe(true);   // wall
    expect(isSnakeCollision({x:0,y:-1}, [], 22, 18)).toBe(true);   // wall
  });
});
