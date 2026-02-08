// ===================== HABIT TRACKER =====================
// NOTE: Your HTML uses inline onclick="showAddHabitForm()", "addNewHabit()", etc.
// To make that work reliably, we expose those functions on window. [file:1]

/**
 * The key used to store habit tracker data in localStorage.
 * @type {string}
 */
const HABIT_STORAGE_KEY = "habitTrackerData";

/**
 * Retrieves habit data from localStorage.
 * @returns {{habits: Array<object>, completions: object}} The parsed habit data or a default object.
 */
function getHabitData() {
    const raw = localStorage.getItem(HABIT_STORAGE_KEY);
    return raw
        ? safeParseJSON(raw, { habits: [], completions: {} })
        : { habits: [], completions: {} };
}

/**
 * Saves habit data to localStorage.
 * @param {object} data - The habit data to save.
 */
function saveHabitData(data) {
    try {
        localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Could not save habit data", e);
    }
}

/**
 * Gets today's date in YYYY-MM-DD format.
 * @returns {string} Today's date.
 */
function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

/**
 * Shows the add habit form.
 */
function showAddHabitForm() {
    const form = document.getElementById("addHabitForm");
    const name = document.getElementById("habitName");
    if (form) form.style.display = "block";
    if (name) name.focus();
}

/**
 * Cancels adding a new habit and hides the form.
 */
function cancelAddHabit() {
    const form = document.getElementById("addHabitForm");
    const name = document.getElementById("habitName");
    const goal = document.getElementById("habitGoal");
    const cat = document.getElementById("habitCategory");

    if (form) form.style.display = "none";
    if (name) name.value = "";
    if (goal) goal.value = "1";
    if (cat) cat.value = "";
}

/**
 * Returns a random color from a predefined list.
 * @returns {string} A random color hex code.
 */
function getRandomColor() {
    const colors = ["#6ea8fe", "#31d0aa", "#ffd166", "#ff6b6b", "#9bb0d0", "#a78bfa", "#fb923c"];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Adds a new habit to the list.
 */
function addNewHabit() {
    const nameEl = document.getElementById("habitName");
    const goalEl = document.getElementById("habitGoal");
    const catEl = document.getElementById("habitCategory");

    const name = (nameEl?.value || "").trim();
    const goal = parseInt(goalEl?.value, 10) || 1;
    const category = (catEl?.value || "").trim();

    if (!name) {
        alert("Please enter a habit name");
        return;
    }

    const data = getHabitData();
    const newHabit = {
        id: Date.now().toString(),
        name,
        goal,
        category: category || "General",
        createdAt: new Date().toISOString(),
        color: getRandomColor(),
    };

    data.habits.push(newHabit);
    saveHabitData(data);

    cancelAddHabit();
    renderHabits();
}

/**
 * Deletes a habit.
 * @param {string} habitId - The ID of the habit to delete.
 */
function deleteHabit(habitId) {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    const data = getHabitData();
    data.habits = data.habits.filter((h) => h.id !== habitId);

    Object.keys(data.completions).forEach((date) => {
        if (data.completions[date]) delete data.completions[date][habitId];
    });

    saveHabitData(data);
    renderHabits();
}

/**
 * Toggles the completion status of a habit for today.
 * @param {string} habitId - The ID of the habit to toggle.
 */
function toggleHabitCompletion(habitId) {
    const data = getHabitData();
    const today = getTodayDate();

    if (!data.completions[today]) data.completions[today] = {};
    if (!data.completions[today][habitId]) data.completions[today][habitId] = 0;

    const habit = data.habits.find((h) => h.id === habitId);
    if (!habit) return;

    data.completions[today][habitId]++;

    if (data.completions[today][habitId] > habit.goal) {
        data.completions[today][habitId] = 0;
    }

    saveHabitData(data);
    renderHabits();
}

/**
 * Calculates the current streak for a habit.
 * @param {string} habitId - The ID of the habit.
 * @returns {number} The current streak in days.
 */
function getHabitStreak(habitId) {
    const data = getHabitData();
    const habit = data.habits.find((h) => h.id === habitId);
    if (!habit) return 0;

    let streak = 0;
    let currentDate = new Date();

    while (true) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const completed = data.completions[dateStr]?.[habitId] || 0;

        if (completed >= habit.goal) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (dateStr === getTodayDate()) {
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }

        if (streak > 365) break;
    }

    return streak;
}

/**
 * Renders the list of habits.
 */
function renderHabits() {
    const data = getHabitData();
    const container = document.getElementById("habitsContainer");
    const emptyState = document.getElementById("emptyState");

    if (!container || !emptyState) return;

    const today = getTodayDate();

    if (data.habits.length === 0) {
        container.innerHTML = "";
        emptyState.style.display = "block";
        updateHabitStats();
        return;
    }

    emptyState.style.display = "none";

    const grouped = {};
    data.habits.forEach((habit) => {
        const cat = habit.category || "General";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(habit);
    });

    let html = "";
    Object.keys(grouped).forEach((category) => {
        html += `<div class="habit-category-title">${category}</div>`;

        grouped[category].forEach((habit) => {
            const completed = data.completions[today]?.[habit.id] || 0;
            const isComplete = completed >= habit.goal;
            const streak = getHabitStreak(habit.id);
            const progress = Math.min((completed / habit.goal) * 100, 100);

            html += `
        <div class="module" style="margin-bottom: 12px; ${isComplete ? "opacity: 0.85;" : ""}">
          <div class="top">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: ${habit.color}; box-shadow: 0 0 8px ${habit.color};"></div>
              <div class="name">${habit.name}</div>
              ${streak > 0 ? `<div class="coef">🔥 ${streak} day${streak > 1 ? "s" : ""}</div>` : ""}
            </div>
            <button onclick="deleteHabit('${habit.id}')" class="secondary" style="padding: 6px 10px; font-size: 12px; opacity: 0.7;">Delete</button>
          </div>

          <div style="margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-size: 13px; color: var(--muted);">
                Progress: ${completed} / ${habit.goal}
              </div>
              <div style="font-size: 13px; font-weight: 700; color: ${isComplete ? "var(--good)" : "var(--accent)"};">
                ${Math.round(progress)}%
              </div>
            </div>

            <div style="height: 8px; background: var(--surface-2); border-radius: 999px; overflow: hidden;">
              <div style="height: 100%; width: ${progress}%; background: ${isComplete ? "var(--good)" : "var(--accent)"
                }; transition: width 0.3s ease; box-shadow: 0 0 10px ${isComplete ? "var(--good)" : "var(--accent)"};"></div>
            </div>
          </div>

          ${generateContributionGraph(habit, data.completions)}

          <div class="actions" style="margin-top: 12px;">
            <button onclick="toggleHabitCompletion('${habit.id}')" style="flex: 1; ${isComplete ? "background: rgba(49, 208, 170, 0.20); border-color: var(--good);" : ""
                }">
              ${isComplete ? "✓ Completed" : "+ Mark Progress"}
            </button>
          </div>
        </div>
      `;
        });
    });

    container.innerHTML = html;
    updateHabitStats();
}

/**
 * Generates a GitHub-style contribution graph for a habit.
 * @param {object} habit - The habit object.
 * @param {object} completions - The completions data.
 * @returns {string} The HTML for the contribution graph.
 */
function generateContributionGraph(habit, completions) {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 91; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        days.push(date);
    }
    days.reverse();

    let graphHtml = '<div class="contributionGraph">';
    days.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const completionCount = completions[dateStr]?.[habit.id] || 0;
        const level = Math.min(Math.floor((completionCount / habit.goal) * 4), 4);
        graphHtml += `<div class="daySquare" style="background-color: var(--contribution-level-${level})" title="${dateStr}: ${completionCount}/${habit.goal}"></div>`;
    });
    graphHtml += '</div>';
    return graphHtml;
}

/**
 * Updates the habit statistics.
 */
function updateHabitStats() {
    const data = getHabitData();
    const today = getTodayDate();

    let totalCompleted = 0;
    let maxStreak = 0;

    data.habits.forEach((habit) => {
        const completed = data.completions[today]?.[habit.id] || 0;
        if (completed >= habit.goal) totalCompleted++;

        const streak = getHabitStreak(habit.id);
        if (streak > maxStreak) maxStreak = streak;
    });

    const totalEl = document.getElementById("totalHabits");
    const completedEl = document.getElementById("todayCompleted");
    const streakEl = document.getElementById("currentStreak");

    if (totalEl) totalEl.textContent = data.habits.length;
    if (completedEl) completedEl.textContent = totalCompleted;
    if (streakEl) streakEl.textContent = maxStreak;
}

// Expose habit functions for inline HTML onclick handlers
window.showAddHabitForm = showAddHabitForm;
window.cancelAddHabit = cancelAddHabit;
window.addNewHabit = addNewHabit;
window.deleteHabit = deleteHabit;
window.toggleHabitCompletion = toggleHabitCompletion;
window.renderHabits = renderHabits;

/**
 * Initializes the habits page.
 */
(function initHabits() {
    const checkAndRenderHabits = () => {
        const habitsPage = document.getElementById("pagehabits");
        if (habitsPage && habitsPage.classList.contains("active")) {
            renderHabits();
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setTimeout(checkAndRenderHabits, 100));
    } else {
        setTimeout(checkAndRenderHabits, 100);
    }

    window.addEventListener("hashchange", () => setTimeout(checkAndRenderHabits, 50));
})();
