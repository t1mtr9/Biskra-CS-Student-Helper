// ===================== THEME =====================

/**
 * The button that toggles the theme.
 * @type {HTMLElement|null}
 */
const modeBtn = document.getElementById("mode");

/**
 * Applies a theme to the document.
 * @param {string} theme - The theme to apply ("light" or "dark").
 */
function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
}

// Apply the saved theme on load.
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light" || savedTheme === "dark") applyTheme(savedTheme);

// Add a click listener to the theme toggle button.
if (modeBtn) {
    modeBtn.addEventListener("click", () => {
        const next = document.body.classList.contains("light") ? "dark" : "light";
        applyTheme(next);
    });
}
