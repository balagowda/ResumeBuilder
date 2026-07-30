import { useCallback, useMemo, useState } from 'react';

/**
 * State with an undo/redo stack.
 *
 * Every entry carries its own label and timestamp, and the coalescing decision
 * is derived from the entry at the top of the stack rather than from a ref.
 * That matters because React re-invokes state updaters (twice in StrictMode) —
 * a ref read inside an updater would see a value from the wrong pass and merge
 * edits that should have stayed separate.
 *
 * Typing is coalesced: a run of keystrokes in the same field collapses into one
 * undo step, so Ctrl+Z does not walk back a character at a time.
 */
export default function useHistoryState(initialState, options = {}) {
  const { limit = 60, coalesceMs = 700 } = options;

  const [history, setHistory] = useState(() => ({
    entries: [{ state: initialState, label: 'init', at: 0 }],
    index: 0,
  }));

  const state = history.entries[history.index].state;

  /**
   * Commit a new state.
   *
   * `label` names the kind of change, and only changes sharing a label can
   * merge. `coalesce` opts a change into merging at all — structural edits
   * (delete, reorder, import) always get their own entry so they can each be
   * undone individually.
   */
  const set = useCallback(
    (updater, { label = 'edit', coalesce = false } = {}) => {
      // Read the clock out here: inside the updater it would differ between
      // StrictMode's two passes.
      const at = Date.now();

      setHistory((h) => {
        const current = h.entries[h.index];
        const next = typeof updater === 'function' ? updater(current.state) : updater;
        if (Object.is(next, current.state)) return h;

        // Committing after an undo discards the abandoned redo branch.
        const kept = h.entries.slice(0, h.index + 1);

        const canMerge =
          coalesce &&
          kept.length > 1 && // never merge into the initial entry
          current.label === label &&
          at - current.at < coalesceMs;

        if (canMerge) {
          const merged = kept.slice(0, -1).concat({ state: next, label, at });
          return { entries: merged, index: merged.length - 1 };
        }

        const appended = kept.concat({ state: next, label, at });
        const trimmed =
          appended.length > limit ? appended.slice(appended.length - limit) : appended;
        return { entries: trimmed, index: trimmed.length - 1 };
      });
    },
    [coalesceMs, limit]
  );

  const undo = useCallback(() => {
    setHistory((h) => (h.index > 0 ? { ...h, index: h.index - 1 } : h));
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => (h.index < h.entries.length - 1 ? { ...h, index: h.index + 1 } : h));
  }, []);

  const canUndo = history.index > 0;
  const canRedo = history.index < history.entries.length - 1;

  /** What the next undo would reverse, for a button tooltip. */
  const undoLabel = canUndo ? history.entries[history.index].label : null;
  const redoLabel = canRedo ? history.entries[history.index + 1].label : null;

  return useMemo(
    () => ({ state, set, undo, redo, canUndo, canRedo, undoLabel, redoLabel }),
    [state, set, undo, redo, canUndo, canRedo, undoLabel, redoLabel]
  );
}
