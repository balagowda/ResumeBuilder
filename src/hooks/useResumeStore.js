import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useHistoryState from './useHistoryState';
import {
  MODE_DEVICE,
  MODE_SESSION,
  clearAll,
  createResumeRecord,
  hasContent,
  loadStore,
  requestPersistence,
  saveStore,
  setMode as persistMode,
} from '../utils/resumeStore';

/**
 * Owns every resume the user has, which one is open, and where they are stored.
 *
 * `makeEmpty` is injected rather than imported so the shape of a blank resume
 * stays defined next to the form that renders it.
 */
export default function useResumeStore(makeEmpty) {
  // Hydrate synchronously in the initialiser rather than in an effect, so a
  // returning user never sees a frame of empty form before their data lands.
  const [initial] = useState(() => {
    const { store, mode: loadedMode } = loadStore();
    const list = store.resumes.length
      ? store.resumes
      : [createResumeRecord('My resume', makeEmpty())];
    const active = list.some((r) => r.id === store.activeId) ? store.activeId : list[0].id;
    return { mode: loadedMode, resumes: list, activeId: active, lastBackupAt: store.lastBackupAt || null };
  });

  const [mode, setModeState] = useState(initial.mode);

  // resumes and activeId travel together through one history stack, so undoing
  // a delete brings the resume back *and* re-selects it.
  const history = useHistoryState(
    { resumes: initial.resumes, activeId: initial.activeId },
    { limit: 60 }
  );
  const { resumes, activeId } = history.state;

  /** Commit a change to the document, recording one undo step. */
  const commit = history.set;
  const setResumes = useCallback(
    (updater, opts) =>
      commit(
        (doc) => ({
          ...doc,
          resumes: typeof updater === 'function' ? updater(doc.resumes) : updater,
        }),
        opts
      ),
    [commit]
  );
  const setActiveId = useCallback(
    (id, opts = { label: 'switch', coalesce: true }) =>
      commit((doc) => ({ ...doc, activeId: id }), opts),
    [commit]
  );

  const [savedAt, setSavedAt] = useState(null);
  const [lastBackupAt, setLastBackupAt] = useState(initial.lastBackupAt);
  const [storageError, setStorageError] = useState(null);

  // Skip the persist effect on the very first render, so hydrating does not
  // immediately write the same store straight back.
  const hydrated = useRef(false);

  useEffect(() => {
    if (initial.mode === MODE_DEVICE) requestPersistence();
    hydrated.current = true;
  }, [initial.mode]);

  // Persist whenever anything meaningful changes.
  useEffect(() => {
    if (!hydrated.current) return;
    const result = saveStore({ schema: 1, activeId, resumes, lastBackupAt }, mode);
    if (result.ok) {
      setSavedAt(new Date());
      setStorageError(null);
    } else {
      // Most likely quota, or storage blocked outright in private browsing.
      setStorageError(
        'Your browser is blocking storage, so edits are only held in this tab. Download a backup before you close it.'
      );
    }
  }, [resumes, activeId, lastBackupAt, mode]);

  // Falling back to the first resume means a stale activeId degrades to "shows
  // the wrong resume" rather than crashing the whole builder on a null formData.
  const active = useMemo(
    () => resumes.find((r) => r.id === activeId) || resumes[0] || null,
    [resumes, activeId]
  );

  /**
   * Patch the open resume.
   *
   * `label` decides which undo step the change lands in. Field typing passes
   * coalesce so a run of keystrokes collapses into one step; structural edits
   * pass their own label so each is individually reversible.
   */
  const updateActive = useCallback(
    (patch, opts = { label: 'edit', coalesce: true }) => {
      setResumes(
        (prev) =>
          prev.map((r) =>
            r.id === activeId
              ? { ...r, ...(typeof patch === 'function' ? patch(r) : patch), updatedAt: Date.now() }
              : r
          ),
        opts
      );
    },
    [activeId, setResumes]
  );

  const setFormData = useCallback(
    (next, opts) => {
      updateActive((r) => ({ data: typeof next === 'function' ? next(r.data) : next }), opts);
    },
    [updateActive]
  );

  // Operations touching both the list and the selection commit once, through a
  // single updater, so they are one undo step rather than two.
  //
  // Note also: no setState nested inside another setState's updater anywhere
  // below. React re-invokes updaters (twice in StrictMode), so a setActiveId in
  // there fires more than once and can leave activeId on a discarded record.
  const createResume = useCallback(
    (name) => {
      const record = createResumeRecord(name || 'Untitled resume', makeEmpty());
      commit(
        (doc) => ({ resumes: [...doc.resumes, record], activeId: record.id }),
        { label: 'new resume' }
      );
      return record.id;
    },
    [makeEmpty, commit]
  );

  /**
   * Add a resume that already has content — how the example pages hand a
   * finished resume to the editor. Separate from createResume because the
   * caller cannot patch the new record afterwards: updateActive closes over the
   * activeId from the current render, which is still the old resume.
   */
  const createResumeFrom = useCallback(
    (name, data, extra = {}) => {
      const record = createResumeRecord(name || 'Untitled resume', data, extra);
      commit(
        (doc) => ({ resumes: [...doc.resumes, record], activeId: record.id }),
        { label: 'load example' }
      );
      return record.id;
    },
    [commit]
  );

  const duplicateResume = useCallback(
    (id) => {
      const source = resumes.find((r) => r.id === id);
      if (!source) return;
      const copy = createResumeRecord(
        `${source.name} (copy)`,
        JSON.parse(JSON.stringify(source.data)),
        {
          sectionOrder: source.sectionOrder,
          experienceHeading: source.experienceHeading,
          templateId: source.templateId,
        }
      );
      commit((doc) => ({ resumes: [...doc.resumes, copy], activeId: copy.id }), {
        label: 'duplicate resume',
      });
    },
    [resumes, commit]
  );

  const renameResume = useCallback(
    (id, name) => {
      const trimmed = (name || '').trim();
      if (!trimmed) return;
      setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, name: trimmed } : r)), {
        label: 'rename',
      });
    },
    [setResumes]
  );

  /** Deleting the last resume leaves a fresh empty one rather than no resume. */
  const deleteResume = useCallback(
    (id) => {
      // Built out here, not in the updater: createResumeRecord generates an id,
      // and an updater can run more than once.
      const fresh = createResumeRecord('My resume', makeEmpty());
      commit(
        (doc) => {
          const remaining = doc.resumes.filter((r) => r.id !== id);
          if (remaining.length === 0) {
            return { resumes: [fresh], activeId: fresh.id };
          }
          return {
            resumes: remaining,
            activeId: doc.activeId === id ? remaining[0].id : doc.activeId,
          };
        },
        { label: 'delete resume' }
      );
    },
    [makeEmpty, commit]
  );

  const switchResume = useCallback((id) => setActiveId(id), [setActiveId]);

  const changeMode = useCallback(
    async (nextMode) => {
      const store = { schema: 1, activeId, resumes, lastBackupAt };
      const result = persistMode(nextMode, store);
      if (!result.ok) {
        setStorageError('Could not switch storage mode — your browser refused the write.');
        return;
      }
      setModeState(nextMode);
      setStorageError(null);
      if (nextMode === MODE_DEVICE) await requestPersistence();
    },
    [activeId, resumes, lastBackupAt]
  );

  const markBackedUp = useCallback(() => setLastBackupAt(Date.now()), []);

  /**
   * Clear Data is the most destructive thing in the app, so it goes through the
   * history stack like everything else — one Ctrl+Z brings it all back. The
   * storage keys are dropped too, but the persist effect rewrites them from
   * whatever state the history lands on.
   */
  const clearEverything = useCallback(() => {
    clearAll();
    const fresh = createResumeRecord('My resume', makeEmpty());
    commit({ resumes: [fresh], activeId: fresh.id }, { label: 'clear all' });
    setLastBackupAt(null);
  }, [makeEmpty, commit]);

  /**
   * Whether there is work that would be lost on close. Only meaningful in
   * session mode — in device mode the data survives, so there is nothing to warn
   * about.
   */
  const needsBackup = useMemo(() => {
    if (mode === MODE_DEVICE) return false;
    if (!resumes.some((r) => hasContent(r.data))) return false;
    const newestEdit = resumes.reduce((max, r) => Math.max(max, r.updatedAt || 0), 0);
    return !lastBackupAt || lastBackupAt < newestEdit;
  }, [mode, resumes, lastBackupAt]);

  return {
    mode,
    isSessionMode: mode === MODE_SESSION,
    changeMode,
    resumes,
    activeId,
    active,
    formData: active ? active.data : null,
    setFormData,
    updateActive,
    createResume,
    createResumeFrom,
    duplicateResume,
    renameResume,
    deleteResume,
    switchResume,
    savedAt,
    needsBackup,
    markBackedUp,
    storageError,
    clearEverything,
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undoLabel: history.undoLabel,
    redoLabel: history.redoLabel,
  };
}
