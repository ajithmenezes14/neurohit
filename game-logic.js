// ── TIC-TAC-TOE ──────────────────────────────────────────────────────────────

// All winning line combinations for a 3×3 board (indices 0–8).
export var TTT_WIN = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

/**
 * Check if any player has won.
 * @param {(string|null)[]} b - 9-element board; cells are 'X', 'O', or null
 * @returns {string|null} 'X', 'O', or null (no winner yet)
 */
export function tttCheck(b) {
  for (var i = 0; i < TTT_WIN.length; i++) {
    var W = TTT_WIN[i];
    if (b[W[0]] && b[W[0]] === b[W[1]] && b[W[0]] === b[W[2]]) return b[W[0]];
  }
  return null;
}

/**
 * Minimax algorithm for perfect Tic-Tac-Toe play.
 * 'O' is the maximising player; 'X' is the minimising player.
 * @param {(string|null)[]} b  - board state (9 elements)
 * @param {string}          p  - player whose turn it is ('X' or 'O')
 * @returns {{idx: number, score: number}}
 */
export function minimax(b, p) {
  var w = tttCheck(b);
  if (w === 'O') return { score: 10 };
  if (w === 'X') return { score: -10 };
  var av = b.map(function(v, i) { return v == null ? i : null; })
            .filter(function(i) { return i !== null; });
  if (!av.length) return { score: 0 };
  var moves = av.map(function(i) {
    var nb = b.slice(); nb[i] = p;
    return { idx: i, score: minimax(nb, p === 'O' ? 'X' : 'O').score };
  });
  return p === 'O'
    ? moves.reduce(function(a, m) { return m.score > a.score ? m : a; })
    : moves.reduce(function(a, m) { return m.score < a.score ? m : a; });
}

// ── 2048 ──────────────────────────────────────────────────────────────────────

/**
 * Slide and merge a single row leftward.
 * Does NOT mutate the input array.
 * @param {number[]} row - 4-element row of tile values (0 = empty)
 * @returns {{row: number[], scoreDelta: number}}
 */
export function slideRow(row) {
  var f = row.filter(function(v) { return v !== 0; });
  var scoreDelta = 0;
  for (var i = 0; i < f.length - 1; i++) {
    if (f[i] === f[i + 1]) {
      f[i] *= 2;
      scoreDelta += f[i];
      f.splice(i + 1, 1);
    }
  }
  while (f.length < 4) f.push(0);
  return { row: f, scoreDelta: scoreDelta };
}

/**
 * Return true when the 2048 board has no legal moves remaining.
 * @param {number[][]} grid - 4×4 array of tile values
 * @returns {boolean}
 */
export function isGameOver(grid) {
  for (var r = 0; r < 4; r++) {
    for (var c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return false;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

// ── WORDLE ────────────────────────────────────────────────────────────────────

/**
 * Evaluate a Wordle guess against a target word.
 * Handles duplicate letters correctly: each letter in the target is consumed
 * once — first by exact (correct) matches, then by present matches.
 * @param {string} guess  - 5-letter uppercase guess
 * @param {string} target - 5-letter uppercase target
 * @returns {('correct'|'present'|'absent')[]} array of length 5
 */
export function evaluateGuess(guess, target) {
  var rem = target.split('');
  var res = Array(5).fill('absent');
  for (var i = 0; i < 5; i++) {
    if (guess[i] === target[i]) { res[i] = 'correct'; rem[i] = null; }
  }
  for (var i = 0; i < 5; i++) {
    if (res[i] !== 'correct') {
      var idx = rem.indexOf(guess[i]);
      if (idx >= 0) { res[i] = 'present'; rem[idx] = null; }
    }
  }
  return res;
}

// ── MINESWEEPER ───────────────────────────────────────────────────────────────

/**
 * Build a Minesweeper board: place mines randomly (avoiding the first-click
 * cell) then compute neighbour counts for every non-mine cell.
 * @param {number} rows
 * @param {number} cols
 * @param {number} mines
 * @param {number} avoidR - row index of the first click (never mined)
 * @param {number} avoidC - col index of the first click
 * @returns {number[][]} board where -1 = mine, 0–8 = neighbour count
 */
export function buildMineBoard(rows, cols, mines, avoidR, avoidC) {
  var board = [];
  for (var r = 0; r < rows; r++) {
    board.push([]);
    for (var c = 0; c < cols; c++) board[r].push(0);
  }
  var placed = 0;
  while (placed < mines) {
    var r = Math.floor(Math.random() * rows);
    var c = Math.floor(Math.random() * cols);
    if (board[r][c] === 0 && !(r === avoidR && c === avoidC)) {
      board[r][c] = -1;
      placed++;
    }
  }
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      if (board[r][c] === -1) continue;
      var n = 0;
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          var nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === -1) n++;
        }
      }
      board[r][c] = n;
    }
  }
  return board;
}

/**
 * Recursively reveal cells starting from (r, c).
 * Stops at flagged cells, already-revealed cells, and board edges.
 * Flood-fills through zero-valued cells.
 * Mutates `revealed` in place.
 * @param {number[][]}  board
 * @param {boolean[][]} revealed
 * @param {boolean[][]} flagged
 * @param {number}      rows
 * @param {number}      cols
 * @param {number}      r
 * @param {number}      c
 */
export function floodReveal(board, revealed, flagged, rows, cols, r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= cols || revealed[r][c] || flagged[r][c] || board[r][c] === -1) return;
  revealed[r][c] = true;
  if (board[r][c] === 0) {
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        floodReveal(board, revealed, flagged, rows, cols, r + dr, c + dc);
      }
    }
  }
}

// ── SNAKE ─────────────────────────────────────────────────────────────────────

/**
 * Return true if the given head position hits a wall or any snake segment.
 * @param {{x:number,y:number}}   head   - candidate next head position
 * @param {{x:number,y:number}[]} snake  - current body (before prepending new head)
 * @param {number}                width
 * @param {number}                height
 * @returns {boolean}
 */
export function isSnakeCollision(head, snake, width, height) {
  if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) return true;
  return snake.some(function(s) { return s.x === head.x && s.y === head.y; });
}

// ── WORD CHAIN ────────────────────────────────────────────────────────────────

/**
 * Validate a Word Chain submission.
 * @param {string}   word  - already normalised (lowercase, letters only)
 * @param {string[]} chain - current chain of accepted words
 * @returns {{ok:true}|{ok:false, code:'too_short'|'wrong_start'|'duplicate', expected?:string}}
 */
export function validateWord(word, chain) {
  if (!word || word.length < 2) return { ok: false, code: 'too_short' };
  if (chain.indexOf(word) >= 0) return { ok: false, code: 'duplicate' };
  if (chain.length > 0) {
    var prev = chain[chain.length - 1];
    var last = prev[prev.length - 1];
    if (word[0] !== last) return { ok: false, code: 'wrong_start', expected: last };
  }
  return { ok: true };
}

// ── REACTION TIME ─────────────────────────────────────────────────────────────

/**
 * Classify a reaction time into a performance grade.
 * @param {number} ms - reaction time in milliseconds
 * @returns {'ELITE'|'Fast'|'Average'|'Slow'}
 */
export function getGrade(ms) {
  if (ms < 180) return 'ELITE';
  if (ms < 250) return 'Fast';
  if (ms < 350) return 'Average';
  return 'Slow';
}
