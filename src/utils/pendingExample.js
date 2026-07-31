// Hand-off between an example page and the editor.
//
// The example pages are ordinary routes with no access to the editor's store,
// so "Use this example" parks the resume in sessionStorage and navigates to the
// template. TemplateWorkspace picks it up on mount and creates a resume from
// it. sessionStorage regardless of the user's storage mode: this is a transient
// baton, not saved work, and it must not outlive the tab.

const KEY = 'hatchresume.pendingExample';

export const stageExample = (name, data) => {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ name, data }));
    return true;
  } catch {
    // Private browsing or a full quota — the navigation still happens, the user
    // just lands on an empty editor instead of a filled one.
    return false;
  }
};

/** Read and clear in one step, so a reload does not re-import the example. */
export const takePendingExample = () => {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(KEY);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.data) return null;
    return parsed;
  } catch {
    return null;
  }
};
