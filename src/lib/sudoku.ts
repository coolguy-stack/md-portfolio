// Tiny Sudoku toolkit: seedable generator with uniqueness, solver, candidates.
// 0 = empty.

export type Grid = number[][]; // 9x9
export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_REMOVALS: Record<Difficulty, number> = {
  easy: 36,   // ~45 clues
  medium: 46, // ~35 clues
  hard: 52,   // ~29 clues
};

// --- Seeded RNG (mulberry32) + helpers ---------------------------------------
function hashString(s: string) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function rngFromSeed(seed: string) {
  return mulberry32(hashString(seed));
}
export function shuffled<T>(arr: T[], rnd: () => number) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Basics -------------------------------------------------------------------
export function emptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}
function cloneGrid(g: Grid): Grid {
  return g.map((r) => r.slice());
}
function equals(a: Grid, b: Grid) {
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (a[i][j] !== b[i][j]) return false;
  return true;
}
const DIGITS = [1,2,3,4,5,6,7,8,9];
const boxIdx = (r: number, c: number) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

// --- Candidates ---------------------------------------------------------------
export function candidates(g: Grid, r: number, c: number): number[] {
  if (g[r][c] !== 0) return [];
  const used = new Set<number>();
  for (let k = 0; k < 9; k++) {
    used.add(g[r][k]);
    used.add(g[k][c]);
  }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = br; i < br + 3; i++) for (let j = bc; j < bc + 3; j++) used.add(g[i][j]);
  return DIGITS.filter((d) => !used.has(d));
}

// --- Solver (backtracking with MRV + count up to limit) ----------------------
export function solveCount(g: Grid, limit = 2): { count: number; solution?: Grid } {
  const board = cloneGrid(g);

  function findNext(): [number, number] | null {
    let best: [number, number] | null = null;
    let bestLen = 10;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const cand = candidates(board, r, c);
        if (cand.length < bestLen) {
          bestLen = cand.length;
          best = [r, c];
          if (bestLen === 1) return best;
        }
      }
    }
    return best;
  }

  let count = 0;
  let saved: Grid | undefined;

  function bt(): boolean {
    const next = findNext();
    if (!next) { // filled
      count++;
      if (!saved) saved = cloneGrid(board);
      return count >= limit; // stop if we hit limit
    }
    const [r, c] = next;
    for (const d of candidates(board, r, c)) {
      board[r][c] = d;
      const stop = bt();
      if (stop) return true;
      board[r][c] = 0;
    }
    return false;
  }

  bt();
  return { count, solution: saved };
}

// --- Full solution generator --------------------------------------------------
function generateSolved(rnd: () => number): Grid {
  const g = emptyGrid();
  const rows = Array.from({ length: 9 }, (_, i) => i);
  const cols = Array.from({ length: 9 }, (_, i) => i);

  function fill(cell = 0): boolean {
    if (cell >= 81) return true;
    const r = Math.floor(cell / 9), c = cell % 9;
    const nums = shuffled(DIGITS, rnd);
    for (const d of nums) {
      // fast checks
      let ok = true;
      for (let k = 0; k < 9; k++) { if (g[r][k] === d || g[k][c] === d) { ok = false; break; } }
      if (!ok) continue;
      const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
      for (let i = br; i < br+3; i++) for (let j = bc; j < bc+3; j++) {
        if (g[i][j] === d) { ok = false; break; }
      }
      if (!ok) continue;
      g[r][c] = d;
      if (fill(cell + 1)) return true;
      g[r][c] = 0;
    }
    return false;
  }

  fill(0);
  return g;
}

// --- Carve a unique puzzle ----------------------------------------------------
export function generate(seed: string, difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
  const rnd = rngFromSeed(seed);
  const solution = generateSolved(rnd);
  const puzzle = cloneGrid(solution);

  // candidate removal order
  const cells = shuffled(
    Array.from({ length: 81 }, (_, k) => [Math.floor(k / 9), k % 9] as [number, number]),
    rnd
  );

  let removed = 0;
  const target = DIFFICULTY_REMOVALS[difficulty];

  for (const [r, c] of cells) {
    if (removed >= target) break;
    const keep = puzzle[r][c];
    puzzle[r][c] = 0;
    const { count } = solveCount(puzzle, 2);
    if (count !== 1) {
      puzzle[r][c] = keep; // revert (not unique)
    } else {
      removed++;
    }
  }

  return { puzzle, solution };
}

// --- Helpers for UI -----------------------------------------------------------
export function isComplete(g: Grid) {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (g[r][c] === 0) return false;
  return true;
}
export function todaySeed() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
