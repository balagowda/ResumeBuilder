/**
 * Resume persistence — nothing in this module touches the network.
 *
 * Two backends, chosen by the user:
 *
 *  - 'session' (the default): sessionStorage. The browser itself erases it the
 *    moment the tab closes. This is the only reliable way to promise "your data
 *    is gone when you leave": cleanup code in beforeunload/unload does not run
 *    on a crash, a force quit, or a mobile app kill, and beforeunload cannot
 *    tell a close apart from a reload, so erasing there would wipe data on every
 *    refresh. Reloading and navigating around the site keep the data; closing
 *    the tab drops it.
 *
 *  - 'device': localStorage, plus a StorageManager persistence request so the
 *    browser is less likely to evict it (Safari otherwise clears storage after
 *    ~7 days without a visit).
 *
 * The mode flag itself is the one thing kept in localStorage, so an opt-in to
 * 'device' survives a close. In the default mode nothing is written there.
 */

const STORE_KEY = 'hatchresume.store.v1';
const MODE_KEY = 'hatchresume.storageMode';
const LEGACY_KEY = 'resumeFormData';

export const MODE_SESSION = 'session';
export const MODE_DEVICE = 'device';

const backendFor = (mode) => (mode === MODE_DEVICE ? window.localStorage : window.sessionStorage);

const newId = () =>
  `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** A resume record wrapping one formData blob plus its per-resume view state. */
export const createResumeRecord = (name, data, extra = {}) => ({
  id: newId(),
  name: name || 'Untitled resume',
  data,
  // sectionOrder and experienceHeading used to live only in React state, so a
  // reload silently reset them. They belong to the resume, so they persist here.
  sectionOrder: extra.sectionOrder || null,
  experienceHeading: extra.experienceHeading || null,
  templateId: extra.templateId || null,
  updatedAt: Date.now(),
});

const emptyStore = () => ({ schema: 1, activeId: null, resumes: [], lastBackupAt: null });

/**
 * Read the mode. Defaults to session, so a first-time visitor gets
 * erase-on-close without having to choose anything.
 */
export const getMode = () => {
  try {
    return window.localStorage.getItem(MODE_KEY) === MODE_DEVICE ? MODE_DEVICE : MODE_SESSION;
  } catch {
    // Private browsing can throw on access; session is the safe assumption.
    return MODE_SESSION;
  }
};

/**
 * Ask the browser not to evict our storage. Only meaningful in device mode, and
 * only honoured by some browsers — a false result is not an error, just a "no".
 */
export const requestPersistence = async () => {
  if (!navigator.storage || !navigator.storage.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
};

const readFrom = (storage) => {
  try {
    const raw = storage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.resumes)) return null;
    return { ...emptyStore(), ...parsed };
  } catch {
    return null;
  }
};

const writeTo = (storage, store) => {
  try {
    storage.setItem(STORE_KEY, JSON.stringify(store));
    return { ok: true };
  } catch (err) {
    // Quota exceeded, or storage blocked entirely (Safari private mode).
    return { ok: false, error: err };
  }
};

/**
 * Pull a pre-versions `resumeFormData` blob into the new shape.
 *
 * Anyone with that key already had a resume persisted across visits, so they
 * are migrated into device mode rather than into the erase-on-close default —
 * silently dropping work someone had saved is not a change we get to make for
 * them. New visitors still start in session mode.
 */
const migrateLegacy = () => {
  let raw;
  try {
    raw = window.localStorage.getItem(LEGACY_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const record = createResumeRecord('My resume', data);
    const store = { ...emptyStore(), activeId: record.id, resumes: [record] };

    // Land it in device mode first, and only drop the legacy key once the new
    // copy is safely written.
    const result = writeTo(window.localStorage, store);
    if (!result.ok) return null;
    try {
      window.localStorage.setItem(MODE_KEY, MODE_DEVICE);
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* the store is written; the stale key is harmless if removal fails */
    }
    return store;
  } catch {
    return null;
  }
};

/** Load the store for the active mode, migrating legacy data on first run. */
export const loadStore = () => {
  const migrated = migrateLegacy();
  if (migrated) return { store: migrated, mode: MODE_DEVICE };

  const mode = getMode();
  const store = readFrom(backendFor(mode)) || emptyStore();
  return { store, mode };
};

export const saveStore = (store, mode) => writeTo(backendFor(mode), store);

/**
 * Switch backends, carrying the current resumes across so the toggle never
 * costs the user their work. Leaving device mode clears the localStorage copy —
 * that is the whole point of switching back.
 */
export const setMode = (nextMode, store) => {
  const mode = nextMode === MODE_DEVICE ? MODE_DEVICE : MODE_SESSION;
  const result = writeTo(backendFor(mode), store);
  if (!result.ok) return result;

  try {
    if (mode === MODE_DEVICE) {
      window.localStorage.setItem(MODE_KEY, MODE_DEVICE);
      window.sessionStorage.removeItem(STORE_KEY);
    } else {
      window.localStorage.removeItem(MODE_KEY);
      window.localStorage.removeItem(STORE_KEY);
    }
  } catch {
    /* preference is best-effort */
  }
  return { ok: true };
};

/** Wipe every copy, in both backends. Used by Clear Data. */
export const clearAll = () => {
  [window.localStorage, window.sessionStorage].forEach((storage) => {
    try {
      storage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  });
  try {
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
};

/** True when a resume has enough in it that losing it would actually hurt. */
export const hasContent = (data) => {
  if (!data) return false;
  const filled = (v) => typeof v === 'string' && v.trim().length > 0;
  if (filled(data.fullName) || filled(data.summary) || filled(data.skills)) return true;
  const anyEntry = (list, key) =>
    Array.isArray(list) && list.some((entry) => entry && filled(entry[key]));
  return (
    anyEntry(data.experiences, 'title') ||
    anyEntry(data.education, 'studyTitle') ||
    anyEntry(data.projects, 'title') ||
    anyEntry(data.others, 'title')
  );
};
