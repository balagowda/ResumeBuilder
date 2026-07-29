import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [resumes, setResumes] = useState(initial.resumes);
  const [activeId, setActiveId] = useState(initial.activeId);
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

  /** Patch the open resume. Accepts a value or an updater, like setState. */
  const updateActive = useCallback(
    (patch) => {
      setResumes((prev) =>
        prev.map((r) =>
          r.id === activeId
            ? { ...r, ...(typeof patch === 'function' ? patch(r) : patch), updatedAt: Date.now() }
            : r
        )
      );
    },
    [activeId]
  );

  const setFormData = useCallback(
    (next) => {
      updateActive((r) => ({ data: typeof next === 'function' ? next(r.data) : next }));
    },
    [updateActive]
  );

  const createResume = useCallback(
    (name) => {
      const record = createResumeRecord(name || 'Untitled resume', makeEmpty());
      setResumes((prev) => [...prev, record]);
      setActiveId(record.id);
      return record.id;
    },
    [makeEmpty]
  );

  // Note: no setState nested inside a setState updater anywhere below. React
  // re-invokes updaters (twice in StrictMode), so a setActiveId in there fires
  // more than once and can leave activeId pointing at a discarded record.
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
      setResumes((prev) => [...prev, copy]);
      setActiveId(copy.id);
    },
    [resumes]
  );

  const renameResume = useCallback((id, name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, name: trimmed } : r)));
  }, []);

  /** Deleting the last resume leaves a fresh empty one rather than no resume. */
  const deleteResume = useCallback(
    (id) => {
      const remaining = resumes.filter((r) => r.id !== id);
      if (remaining.length === 0) {
        const fresh = createResumeRecord('My resume', makeEmpty());
        setResumes([fresh]);
        setActiveId(fresh.id);
        return;
      }
      setResumes(remaining);
      if (activeId === id) setActiveId(remaining[0].id);
    },
    [resumes, activeId, makeEmpty]
  );

  const switchResume = useCallback((id) => setActiveId(id), []);

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

  const clearEverything = useCallback(() => {
    clearAll();
    const fresh = createResumeRecord('My resume', makeEmpty());
    setResumes([fresh]);
    setActiveId(fresh.id);
    setLastBackupAt(null);
  }, [makeEmpty]);

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
    duplicateResume,
    renameResume,
    deleteResume,
    switchResume,
    savedAt,
    needsBackup,
    markBackedUp,
    storageError,
    clearEverything,
  };
}
