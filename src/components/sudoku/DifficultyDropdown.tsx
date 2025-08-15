"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import type { Difficulty } from "@/lib/sudoku";

const OPTIONS: Difficulty[] = ["easy", "medium", "hard"];

export default function DifficultyDropdown({
  value,
  onChange,
  className = "",
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // close on outside click / Esc
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // simple keyboard support inside the list
  const onListKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = OPTIONS.indexOf(value);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onChange(OPTIONS[(idx + 1) % OPTIONS.length]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onChange(OPTIONS[(idx - 1 + OPTIONS.length) % OPTIONS.length]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
    } else if (e.key === "Escape") {
      setOpen(false);
      btnRef.current?.focus();
    }
  };

  return (
    <div
      ref={menuRef}
      className={`relative ${className}`}
      // ensure the native cursor never appears in this subtree
      style={{ cursor: "none" }}
    >
      <button
        ref={btnRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
      >
        <span className="capitalize text-white">{value}</span>
        <FiChevronDown />
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={0}
          onKeyDown={onListKey}
          className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-white/10 bg-zinc-900/95 backdrop-blur shadow-lg p-1"
          style={{ cursor: "none" }}
        >
          {OPTIONS.map((opt) => {
            const active = opt === value;
            return (
              <button
                key={opt}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                  btnRef.current?.focus();
                }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                style={{ cursor: "none" }}
              >
                <span className="capitalize">{opt}</span>
                {active && <FiCheck className="text-white/80" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
