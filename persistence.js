// ===================== PERSISTENCE =====================

/**
 * The key used to store the application state in localStorage.
 * @type {string}
 */
const STORAGEKEY = "biskrahelperstatev1";

/**
 * Safely parses a JSON string.
 * @param {string} str - The JSON string to parse.
 * @param {*} [fallback={}] - The fallback value to return if parsing fails.
 * @returns {object} The parsed object or the fallback value.
 */
function safeParseJSON(str, fallback = {}) {
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

/**
 * Loads the application state from localStorage.
 * @returns {object} The loaded state or an empty object.
 */
function loadState() {
    const raw = localStorage.getItem(STORAGEKEY);
    return raw ? safeParseJSON(raw, {}) : {};
}

/**
 * Saves the application state to localStorage.
 * @param {object} state - The state to save.
 */
function saveState(state) {
    try {
        localStorage.setItem(STORAGEKEY, JSON.stringify(state));
    } catch (e) {
        console.warn("Could not save state to localStorage", e);
    }
}

/**
 * Persists the value of an input element to localStorage.
 * @param {HTMLInputElement} inputEl - The input element.
 */
function persistInputValue(inputEl) {
    if (!inputEl || !inputEl.id) return;
    const state = loadState();
    state.marks = state.marks || {};
    state.marks[inputEl.id] = inputEl.value; // keep as string
    saveState(state);
}

/**
 * Restores the values of all saved input elements.
 */
function restoreAllSavedInputs() {
    const state = loadState();
    const marks = state.marks || {};
    for (const [id, value] of Object.entries(marks)) {
        const el = document.getElementById(id);
        if (el && ("value" in el)) el.value = value;
    }
}

/**
 * Clears all saved data for a semester from localStorage.
 * @param {string} semKey - The key of the semester to clear (e.g., "s1").
 */
function clearSemesterFromStorage(semKey) {
    const state = loadState();
    const marks = state.marks || {};
    Object.keys(marks).forEach((id) => {
        if (id.startsWith(semKey)) delete marks[id];
    });
    state.marks = marks;
    saveState(state);
}

/**
 * Wires up the persistence for the marks of a given semester.
 * @param {string} semKey - The key of the semester (e.g., "s1").
 */
function wireMarksPersistenceForSemester(semKey) {
    const host = document.getElementById("modules" + semKey);
    if (!host) return;
    restoreAllSavedInputs();
    host.querySelectorAll('input[type="number"]').forEach((inp) => {
        inp.addEventListener("input", (e) => persistInputValue(e.target));
    });
}

/**
 * Wires up the persistence for the notes.
 */
function wireNotesPersistence() {
    const notesEl = document.getElementById("notes");
    if (!notesEl) return;
    const state = loadState();
    notesEl.value = state.notes || "";
    notesEl.addEventListener("input", () => {
        const s = loadState();
        s.notes = notesEl.value;
        saveState(s);
    });
}
