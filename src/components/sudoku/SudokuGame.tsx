"use client";

import { useEffect, useMemo, useState } from "react";
import type { Difficulty, Grid } from "@/lib/sudoku";
import { candidates, generate, todaySeed } from "@/lib/sudoku";
import DifficultyDropdown from "./DifficultyDropdown";

/* ---------- Types ---------- */
type Cell = {
  value: number;        // 0..9 (0 = empty)
  given: boolean;       // part of the puzzle
  notes: Set<number>;   // pencil marks
};
type GameState = {
  cells: Cell[][];
  given: Grid;
  solution: Grid;
  sel: { r: number; c: number } | null;
  notesMode: boolean;
  startedAt: number;
  elapsed: number;      // seconds (live while playing)
  status: "playing" | "won";
  finalElapsed?: number; // captured when puzzle is solved
};
type Action =
  | { type: "init"; puzzle: Grid; solution: Grid }
  | { type: "tick" }
  | { type: "select"; r: number; c: number }
  | { type: "toggle-notes" }
  | { type: "clear" }
  | { type: "input"; n: number }
  | { type: "erase" }
  | { type: "auto-notes" }
  | { type: "hint" }
  | { type: "load"; state: GameState }
  | { type: "win"; final: number };

/* ---------- Helpers ---------- */
function gridToCells(p: Grid): Cell[][] {
  return p.map(row =>
    row.map(v => ({ value: v, given: v !== 0, notes: new Set<number>() }))
  );
}
function cellsToGrid(cells: Cell[][]): Grid {
  return cells.map(r => r.map(c => c.value));
}

/* ---------- Simple history (undo/redo) ---------- */
function withHistory(reducer: (s: GameState, a: Action) => GameState) {
  type H = { past: GameState[]; present: GameState; future: GameState[] };
  return function useHistory(initState: GameState) {
    const [hist, setHist] = useState<H>({ past: [], present: initState, future: [] });

    function dispatch(a: Action) {
      setHist(h => {
        const next = reducer(h.present, a);
        // Don’t push to history for tick/win
        if (a.type === "tick" || a.type === "win") return { ...h, present: next };
        return { past: [...h.past, h.present], present: next, future: [] };
      });
    }
    const undo = () =>
      setHist(h =>
        h.past.length
          ? {
              past: h.past.slice(0, -1),
              present: h.past[h.past.length - 1],
              future: [h.present, ...h.future],
            }
          : h
      );
    const redo = () =>
      setHist(h =>
        h.future.length
          ? {
              past: [...h.past, h.present],
              present: h.future[0],
              future: h.future.slice(1),
            }
          : h
      );

    return {
      state: hist.present,
      dispatch,
      undo,
      redo,
      canUndo: !!hist.past.length,
      canRedo: !!hist.future.length,
    };
  };
}

/* ---------- Reducer ---------- */
function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "init": {
      return {
        cells: gridToCells(action.puzzle),
        given: action.puzzle,
        solution: action.solution,
        sel: null,
        notesMode: false,
        startedAt: Date.now(),
        elapsed: 0,
        status: "playing",
        finalElapsed: undefined,
      };
    }
    case "tick":
      return {
        ...state,
        elapsed: Math.floor((Date.now() - state.startedAt) / 1000),
      };

    case "select":
      return { ...state, sel: { r: action.r, c: action.c } };

    case "toggle-notes":
      return { ...state, notesMode: !state.notesMode };

    case "clear": {
      const cells: Cell[][] = state.cells.map(r =>
        r.map(c => ({ ...c, notes: new Set<number>() }))
      );
      return { ...state, cells };
    }

    case "erase": {
      if (!state.sel) return state;
      const { r, c } = state.sel;
      const target = state.cells[r][c];
      if (target.given) return state;
      const cells: Cell[][] = state.cells.map((row, i) =>
        row.map((cell, j) =>
          i === r && j === c ? { ...cell, value: 0, notes: new Set<number>() } : cell
        )
      );
      return { ...state, cells };
    }

    case "input": {
      if (!state.sel) return state;
      const { r, c } = state.sel;
      const target = state.cells[r][c];
      if (target.given) return state;

      const cells: Cell[][] = state.cells.map((row, i) =>
        row.map((cell, j) => {
          if (i !== r || j !== c) return cell;
          if (state.notesMode) {
            const ns = new Set<number>(cell.notes);
            if (ns.has(action.n)) ns.delete(action.n);
            else ns.add(action.n);
            return { ...cell, notes: ns };
          }
          return { ...cell, value: action.n, notes: new Set<number>() };
        })
      );
      return { ...state, cells };
    }

    case "auto-notes": {
      const board = cellsToGrid(state.cells);
      const cells = state.cells.map((row, r) =>
        row.map((cell, c) => {
          if (cell.given || cell.value !== 0) return cell;
          return { ...cell, notes: new Set<number>(candidates(board, r, c)) };
        })
      );
      return { ...state, cells };
    }

    case "hint": {
      // Try fill a naked single
      const board = cellsToGrid(state.cells);
      for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === 0) {
            const cand = candidates(board, r, c);
            if (cand.length === 1) {
              const cells: Cell[][] = state.cells.map((row, i) =>
                row.map((cell, j) =>
                  i === r && j === c
                    ? { ...cell, value: cand[0], notes: new Set<number>() }
                    : cell
                )
              );
              return { ...state, cells };
            }
          }
        }
      // Fallback: reveal selected cell
      if (!state.sel) return state;
      const { r, c } = state.sel;
      if (state.cells[r][c].given) return state;
      const cells: Cell[][] = state.cells.map((row, i) =>
        row.map((cell, j) =>
          i === r && j === c
            ? { ...cell, value: state.solution[r][c], notes: new Set<number>() }
            : cell
        )
      );
      return { ...state, cells };
    }

    case "load":
      return action.state;

    case "win":
      return {
        ...state,
        status: "won",
        finalElapsed: action.final,
        elapsed: 0, // show 0:00 after win
      };

    default:
      return state;
  }
}

/* ---------- Hook ---------- */
const useSudoku = withHistory(reducer);

/* ---------- UI helpers ---------- */
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function fmtTime(s: number) {
  const m = Math.floor(s / 60),
    ss = s % 60;
  return `${pad(m)}:${pad(ss)}`;
}
function inSameBox(r1: number, c1: number, r2: number, c2: number) {
  return (
    Math.floor(r1 / 3) === Math.floor(r2 / 3) &&
    Math.floor(c1 / 3) === Math.floor(c2 / 3)
  );
}

/* ---------- Component ---------- */
export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [seed, setSeed] = useState<string>(() => todaySeed());

  // Initial board on first mount
  const init: GameState = useMemo(() => {
    const { puzzle, solution } = generate(seed, difficulty);
    return {
      cells: gridToCells(puzzle),
      given: puzzle,
      solution,
      sel: null,
      notesMode: false,
      startedAt: Date.now(),
      elapsed: 0,
      status: "playing",
      finalElapsed: undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { state, dispatch, undo, redo, canUndo, canRedo } = useSudoku(init);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        dispatch({ type: "input", n: Number(e.key) });
      } else if (e.key === "Backspace" || e.key === "Delete") {
        dispatch({ type: "erase" });
      } else if (e.key === "n") {
        dispatch({ type: "toggle-notes" });
      } else if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        state.sel
      ) {
        e.preventDefault();
        const { r, c } = state.sel;
        const d =
          e.key === "ArrowUp"
            ? [-1, 0]
            : e.key === "ArrowDown"
            ? [1, 0]
            : e.key === "ArrowLeft"
            ? [0, -1]
            : [0, 1];
        const nr = (r + d[0] + 9) % 9,
          nc = (c + d[1] + 9) % 9;
        dispatch({ type: "select", r: nr, c: nc });
      } else if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, state.sel, undo, redo]);

  // Derived board
  const board: Grid = useMemo(
    () => state.cells.map(r => r.map(c => c.value)),
    [state.cells]
  );

  // FAST solved check (no backtracking): compare to known solution
  const complete = useMemo(() => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== state.solution[r][c]) return false;
      }
    }
    return true;
  }, [board, state.solution]);

  // New/Daily
  function newGame(opts?: { daily?: boolean }) {
    const useSeed = opts?.daily ? todaySeed() : `${Date.now()}`;
    setSeed(useSeed);
    const { puzzle, solution } = generate(useSeed, difficulty);
    dispatch({
      type: "load",
      state: {
        cells: gridToCells(puzzle),
        given: puzzle,
        solution,
        sel: null,
        notesMode: false,
        startedAt: Date.now(), // timer starts fresh
        elapsed: 0,            // shows 0:00 until first tick
        status: "playing",
        finalElapsed: undefined,
      },
    });
  }

  /* ---------- Timer (rock-solid) ---------- */
  // Tick only while playing
  useEffect(() => {
    if (state.status !== "playing") return;
    const id = setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => clearInterval(id);
  }, [state.status, dispatch]);

  // When puzzle becomes complete, capture final time and stop timer
  useEffect(() => {
    if (complete && state.status !== "won") {
      const final = Math.floor((Date.now() - state.startedAt) / 1000);
      dispatch({ type: "win", final });
    }
  }, [complete, state.status, state.startedAt, dispatch]);

  // Selection helpers
  const sel = state.sel;
  const selVal = sel ? state.cells[sel.r][sel.c].value : 0;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Difficulty</span>
          <DifficultyDropdown
            value={difficulty}
            onChange={(d) => setDifficulty(d)}
          />
          <button
            onClick={() => newGame({ daily: true })}
            className="ml-2 rounded-md border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
            title="Daily Sudoku"
          >
            Daily
          </button>
          <button
            onClick={() => newGame()}
            className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
            title="New random"
          >
            New
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm">
            Time: {fmtTime(state.elapsed)}
          </span>
          {state.status === "won" && (
            <span className="text-emerald-300 text-sm">
              • Finished in {fmtTime(state.finalElapsed ?? 0)}
            </span>
          )}
          <button
            onClick={() => dispatch({ type: "toggle-notes" })}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              state.notesMode
                ? "border-white bg-white/10 text-white"
                : "border-white/20 text-white hover:bg-white/10"
            }`}
            title="Toggle notes (n)"
          >
            Notes {state.notesMode ? "On" : "Off"}
          </button>
          <button
            onClick={() => dispatch({ type: "auto-notes" })}
            className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            Auto-notes
          </button>
          <button
            onClick={() => dispatch({ type: "hint" })}
            className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            Hint
          </button>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent disabled:pointer-events-none"
            title="Undo (Ctrl/Cmd+Z)"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent disabled:pointer-events-none"
            title="Redo"
          >
            Redo
          </button>
        </div>
      </div>

      {/* Board + side pad */}
      <div className="flex flex-col md:flex-row gap-6">
       {/* Board (wrapped so it never overflows on mobile) */}
       <div className="w-full md:w-auto max-w-[min(92vw,560px)] mx-auto">
          <div
            className="grid grid-cols-9 grid-rows-9 select-none overflow-hidden rounded-xl border border-white/10"
            role="grid"
            aria-label="Sudoku board"
          >
            {state.cells.map((row, r) =>
              row.map((cell, c) => {
                const selected = sel && sel.r === r && sel.c === c;
                const sameRow = sel && sel.r === r;
                const sameCol = sel && sel.c === c;
                const sameBox = sel && inSameBox(sel.r, sel.c, r, c);
                const sameVal = sel && selVal !== 0 && cell.value === selVal;

                const base =
                  "relative flex items-center justify-center " +
                  "h-10 w-10 sm:h-11 sm:w-11 md:h-14 md:w-14";
                const bg = selected
                  ? "bg-white/15"
                  : sameRow || sameCol || sameBox
                  ? "bg-white/[0.06]"
                  : "bg-transparent";
                const num = cell.given
                  ? "text-white font-semibold"
                  : "text-white";

                const thick =
                  (c === 2 || c === 5 ? "border-r-2 " : "") +
                  (r === 2 || r === 5 ? "border-b-2 " : "");
                const border = `border border-white/10 ${thick} border-white/10`;

                return (
                  <button
                    key={`${r}-${c}`}
                    className={`${base} ${bg} ${border}`}
                    onClick={() => dispatch({ type: "select", r, c })}
                  >
                    {cell.value !== 0 ? (
                      <span
                        className={`${num} ${
                          sameVal ? "bg-white/10 rounded px-1" : ""
                        }`}
                      >
                        {cell.value}
                      </span>
                    ) : cell.notes.size ? (
                      <div className="grid grid-cols-3 grid-rows-3 gap-[1px] text-[9px] sm:text-[10px] text-white/60 leading-none">
                        {Array.from({ length: 9 }, (_, i) => i + 1).map(
                          (n) => (
                            <span key={n} className="text-center opacity-70">
                              {cell.notes.has(n) ? n : ""}
                            </span>
                          )
                        )}
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

        {/* Mobile number pad */}
            <div className="mt-4 grid grid-cols-5 gap-2 md:hidden">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
                <button
                key={n}
                onClick={() => dispatch({ type: "input", n })}
                className="h-11 rounded-lg bg-white/10 hover:bg-white/15 text-white"
                >
                {n}
                </button>
            ))}
            <button
                onClick={() => dispatch({ type: "erase" })}
                className="h-11 rounded-lg bg-white/10 hover:bg-white/15 text-white col-span-2"
            >
                Erase
            </button>
            </div>

        {/* Mobile actions (always visible on phones) */}
            <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
            <button
                onClick={() => dispatch({ type: "toggle-notes" })}
                className={`h-11 rounded-lg border text-sm ${
                state.notesMode
                    ? "border-white bg-white/10 text-white"
                    : "border-white/20 text-white hover:bg-white/10"
                }`}
            >
                Notes {state.notesMode ? "On" : "Off"}
            </button>
            <button
                onClick={() => dispatch({ type: "auto-notes" })}
                className="h-11 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10"
            >
                Auto-notes
            </button>

            <button
                onClick={() => dispatch({ type: "clear" })}
                className="h-11 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10"
            >
                Clear notes
            </button>
            <button
                onClick={() => dispatch({ type: "hint" })}
                className="h-11 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10"
            >
                Hint
            </button>

            <button
                onClick={undo}
                disabled={!canUndo}
                className="h-11 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/10 disabled:opacity-40"
                title="Undo"
            >
                Undo
            </button>
            <button
                onClick={redo}
                disabled={!canRedo}
                className="h-11 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/10 disabled:opacity-40"
                title="Redo"
            >
                Redo
            </button>
            </div>
        </div>

        {/* Side actions (desktop) */}
        <div className="hidden md:flex flex-col gap-2 min-w-[140px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => dispatch({ type: "input", n })}
              className="h-11 rounded-md border border-white/15 hover:bg-white/10 text-white"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => dispatch({ type: "erase" })}
            className="h-11 rounded-md border border-white/15 hover:bg-white/10 text-white"
          >
            Erase
          </button>
          <button
            onClick={() => dispatch({ type: "clear" })}
            className="h-11 rounded-md border border-white/15 hover:bg-white/10 text-white/80"
          >
            Clear notes
          </button>
        </div>
      </div>

      {/* Win banner */}
      {complete && (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 px-4 py-3">
          🎉 Solved in {fmtTime(state.finalElapsed ?? 0)}!
        </div>
      )}

      <p className="mt-4 text-white/50 text-sm">
        Tip: click a cell and type 1–9, Backspace to erase. Toggle notes (N). Arrow keys move.
      </p>
    </div>
  );
}
