// ===================== ADKAR =====================

/**
 * Handles the dhikr counter.
 * It is already used inline in HTML: onclick="handleDhikr(this)"
 * @param {HTMLElement} el - The element that was clicked.
 */
window.handleDhikr = function (el) {
    // Find the counter element within the clicked element.
    const counter = el.querySelector(".counter");
    if (!counter) return;

    // Get the current value of the counter.
    const val = parseInt(counter.textContent, 10);
    if (!Number.isFinite(val)) return;

    // Decrement the counter if it's greater than 0.
    if (val > 0) counter.textContent = String(val - 1);
    // If the counter reaches 0, add the "done" class to the element.
    if (val - 1 <= 0) el.classList.add("done");
};
