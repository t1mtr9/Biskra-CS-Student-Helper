// ===================== THEME =====================
const modeBtn = document.getElementById("mode");

function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light" || savedTheme === "dark") applyTheme(savedTheme);

if (modeBtn) {
    modeBtn.addEventListener("click", () => {
        const next = document.body.classList.contains("light") ? "dark" : "light";
        applyTheme(next);
    });
}

// ===================== PERSISTENCE =====================
const STORAGEKEY = "biskrahelperstatev1";

function safeParseJSON(str, fallback = {}) {
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

function loadState() {
    const raw = localStorage.getItem(STORAGEKEY);
    return raw ? safeParseJSON(raw, {}) : {};
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGEKEY, JSON.stringify(state));
    } catch (e) {
        console.warn("Could not save state to localStorage", e);
    }
}

function persistInputValue(inputEl) {
    if (!inputEl || !inputEl.id) return;
    const state = loadState();
    state.marks = state.marks || {};
    state.marks[inputEl.id] = inputEl.value; // keep as string
    saveState(state);
}

function restoreAllSavedInputs() {
    const state = loadState();
    const marks = state.marks || {};
    for (const [id, value] of Object.entries(marks)) {
        const el = document.getElementById(id);
        if (el && ("value" in el)) el.value = value;
    }
}

function clearSemesterFromStorage(semKey) {
    const state = loadState();
    const marks = state.marks || {};
    Object.keys(marks).forEach((id) => {
        if (id.startsWith(semKey)) delete marks[id];
    });
    state.marks = marks;
    saveState(state);
}

function wireMarksPersistenceForSemester(semKey) {
    const host = document.getElementById("modules" + semKey);
    if (!host) return;
    restoreAllSavedInputs();
    host.querySelectorAll('input[type="number"]').forEach((inp) => {
        inp.addEventListener("input", (e) => persistInputValue(e.target));
    });
}

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

// ===================== SETTINGS =====================
const WEIGHTS = { CC: 0.4, EXAM: 0.6 };
const MARKSCALE = { MIN: 0, MAX: 20, PASS: 10 };

// ===================== MODULES DATA =====================
const MODULES = {
    s1: [
        { key: "an1", name: "Analysis 1", coef: 4 },
        { key: "alg1", name: "Algebra 1", coef: 3 },
        { key: "asd1", name: "ASD 1", hasTP: true, coef: 4 },
        { key: "ms1", name: "MS 1", coef: 3 },
        { key: "ste", name: "STE", single: true, coef: 1 },
        { key: "eng", name: "English", single: true, coef: 1 },
        { key: "phy1", name: "Physics 1", coef: 2, optional: true },
        { key: "elec", name: "Electronics", coef: 2, optional: true },
    ],
    s2: [
        { key: "an2", name: "Analysis 2", coef: 4 },
        { key: "alg2", name: "Algebra 2", coef: 2 },
        { key: "asd2", name: "ASD 2", hasTP: true, coef: 4 },
        { key: "ms2", name: "MS 2", coef: 2 },
        { key: "proba", name: "ProbaStats", coef: 2 },
        { key: "ict", name: "ICT", single: true, coef: 1 },
        { key: "ptm", name: "PTM", tpOnly: true, coef: 1 },
        { key: "phy2", name: "Physics 2", coef: 2 },
    ],
    s3: [
        { key: "algo", name: "Algo", hasTP: true, coef: 3 },
        { key: "archi", name: "Archi", hasTP: true, coef: 3 },
        { key: "tg", name: "TG", coef: 2 },
        { key: "si", name: "SI", coef: 3 },
        { key: "eng", name: "English", single: true, coef: 1 },
        { key: "mn", name: "MN", coef: 2 },
        { key: "lm", name: "LM", coef: 2 },
    ],
    s4: [
        { key: "os", name: "OS", hasTP: true, coef: 3 },
        { key: "tl", name: "TL", coef: 2 },
        { key: "rx", name: "RX", hasTP: true, coef: 3 },
        { key: "bd", name: "BD", hasTP: true, coef: 3 },
        { key: "eng", name: "English", single: true, coef: 1 },
        { key: "poo", name: "POO", tpOnly: true, coef: 2 },
        { key: "web", name: "Web", tpOnly: true, coef: 2 },
    ],
    s5: [
        { key: "os2", name: "OS 2", hasTP: true, coef: 2 },
        { key: "compil", name: "Compilation", hasTP: true, coef: 2 },
        { key: "logp", name: "Logic Prog", coef: 2 },
        { key: "gl2", name: "SE 2", hasTP: true, coef: 2 },
        { key: "mhi", name: "MHI", hasTP: true, coef: 2 },
        { key: "ps", name: "ProbStats", coef: 2, optional: true },
        { key: "pl", name: "Linear Prog", coef: 2, optional: true },
        { key: "pp", name: "Paradigms", coef: 2, optional: true },
        { key: "ai", name: "AI", coef: 2, optional: true },
        { key: "eng", name: "English", coef: 1 },
    ],
    s6: [
        { key: "mob", name: "Mobile", hasTP: true, coef: 3 },
        { key: "sec", name: "Security", coef: 3 },
        { key: "adb", name: "Admin BD", coef: 2, optional: true },
        { key: "info", name: "Infographics", coef: 2, optional: true },
        { key: "ws", name: "Web Sem", coef: 2, optional: true },
        { key: "crypto", name: "Crypto", coef: 2, optional: true },
        { key: "sw", name: "Sci Writing", coef: 1, optional: true },
        { key: "proj", name: "Project", single: true, coef: 4 },
    ],
};

const SEMESTERS = [
    { key: "s1", label: "S1 average" },
    { key: "s2", label: "S2 average" },
    { key: "s3", label: "S3 average" },
    { key: "s4", label: "S4 average" },
    { key: "s5", label: "S5 average" },
    { key: "s6", label: "S6 average" },
];

// ===================== DOM UTILS =====================
function clampMark(v) {
    if (Number.isNaN(v)) return NaN;
    if (v < MARKSCALE.MIN) return MARKSCALE.MIN;
    if (v > MARKSCALE.MAX) return MARKSCALE.MAX;
    return v;
}

function isEmptyInput(el) {
    return !el || String(el.value).trim() === "";
}

function readVal(id) {
    const el = document.getElementById(id);
    if (!el) return NaN;
    return clampMark(parseFloat(el.value));
}

function setWarn(semKey, msg) {
    const el = document.getElementById("warn" + semKey);
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("show", !!msg);
}

// ===================== UI BUILDING =====================
function pageTemplate(semKey, avgLabel) {
    return `
  <div class="grid">
    <section class="card">
      <div class="hd">
        <div class="h">Marks</div>
        <div class="badge">Coefficients fixed</div>
      </div>
      <div class="bd">
        <div id="warn${semKey}" class="warn"></div>
        <div class="modules" id="modules${semKey}"></div>
        <div class="actions">
          <button id="btnCalc${semKey}">Calculate</button>
          <button id="btnExample${semKey}" class="secondary">Fill example</button>
          <button id="btnReset${semKey}" class="secondary">Reset</button>
          <button id="btnHome${semKey}" class="secondary">Home</button>
        </div>
      </div>
    </section>

    <aside class="card side">
      <div class="hd">
        <div class="h">Result</div>
        <div class="badge">Weighted average</div>
      </div>
      <div class="bd">
        <div class="stat">
          <div class="sub">${avgLabel}</div>
          <div class="big" id="avg${semKey}"></div>
          <div class="kpi">
            <span>Status</span>
            <strong id="status${semKey}" class="sub"></strong>
          </div>
          <div class="kpi">
            <span>Total coef</span>
            <strong id="sumCoef${semKey}" class="sub"></strong>
          </div>
        </div>

        <div class="stat">
          <div class="sub">Module marks</div>
          <table class="table" id="table${semKey}">
            <thead>
              <tr><th>Module</th><th>Mark</th><th>Coef</th></tr>
            </thead>
            <tbody id="tbody${semKey}"></tbody>
          </table>
        </div>
      </div>
    </aside>
  </div>
  `;
}

function inputsTemplate(semKey, m) {
    const p = `${MARKSCALE.MIN}..${MARKSCALE.MAX}`;

    if (m.single) {
        return `
      <div class="row two">
        <div>
          <label>Note</label>
          <input type="number" step="0.25" min="${MARKSCALE.MIN}" max="${MARKSCALE.MAX}" placeholder="${p}" id="${semKey}${m.key}note" />
        </div>
        <div>
          <label>-</label>
          <input type="number" disabled placeholder="-" />
        </div>
      </div>
    `;
    }

    if (m.hasTP) {
        return `
      <div class="row">
        <div>
          <label>TD</label>
          <input type="number" step="0.25" min="${MARKSCALE.MIN}" max="${MARKSCALE.MAX}" placeholder="${p}" id="${semKey}${m.key}td" />
        </div>
        <div>
          <label>TP</label>
          <input type="number" step="0.25" min="${MARKSCALE.MIN}" max="${MARKSCALE.MAX}" placeholder="${p}" id="${semKey}${m.key}tp" />
        </div>
        <div>
          <label>Exam</label>
          <input type="number" step="0.25" min="${MARKSCALE.MIN}" max="${MARKSCALE.MAX}" placeholder="${p}" id="${semKey}${m.key}ex" />
        </div>
      </div>
    `;
    }

    if (m.tpOnly) {
        return `
      <div class="row two">
        <div>
          <label>TP</label>
          <input type="number" step="0.25" min="${MARKSCALE.MIN}" max="${MARKSCALE.MAX}" placeholder="${p}" id="${semKey}${m.key}tp" />
        </div>
        <div>
          <label>Exam</label>
          <input type="number" step="0.25" min="${MARKSCALE.MIN}" max="${MARKSCALE.MAX}" placeholder="${p}" id="${semKey}${m.key}ex" />
        </div>
      </div>
    `;
    }

    return `
    <div class="row two">
      <div>
        <label>TD</label>
        <input type="number" step="0.25" min="${MARKSCALE.MIN}" max="${MARKSCALE.MAX}" placeholder="${p}" id="${semKey}${m.key}td" />
      </div>
      <div>
        <label>Exam</label>
        <input type="number" step="0.25" min="${MARKSCALE.MIN}" max="${MARKSCALE.MAX}" placeholder="${p}" id="${semKey}${m.key}ex" />
      </div>
    </div>
  `;
}

function buildModulesUI(semKey) {
    const modules = MODULES[semKey];
    const host = document.getElementById("modules" + semKey);
    if (!host) return;

    host.innerHTML = "";
    for (const m of modules) {
        const div = document.createElement("div");
        div.className = "module";
        div.innerHTML = `
      <div class="top">
        <div class="name">${m.name} ${m.optional ? `<span style="opacity:.6;font-weight:700">(choice)</span>` : ""
            }</div>
        <div class="coef">coef ${m.coef}</div>
      </div>
      ${inputsTemplate(semKey, m)}
    `;
        host.appendChild(div);
    }
}

// ===================== CALCULATION =====================
function choiceSelected(semKey, m) {
    if (!m.optional) return true;
    if (m.single) return !isEmptyInput(document.getElementById(`${semKey}${m.key}note`));

    let ids = [];
    if (m.hasTP) ids = [`${semKey}${m.key}td`, `${semKey}${m.key}tp`, `${semKey}${m.key}ex`];
    else if (m.tpOnly) ids = [`${semKey}${m.key}tp`, `${semKey}${m.key}ex`];
    else ids = [`${semKey}${m.key}td`, `${semKey}${m.key}ex`];

    return ids.some((id) => !isEmptyInput(document.getElementById(id)));
}

function moduleMark(semKey, m) {
    if (m.single) return readVal(`${semKey}${m.key}note`);

    const ex = readVal(`${semKey}${m.key}ex`);

    if (m.hasTP) {
        const td = readVal(`${semKey}${m.key}td`);
        const tp = readVal(`${semKey}${m.key}tp`);
        if ([td, tp, ex].some(Number.isNaN)) return NaN;
        return WEIGHTS.CC * ((td + tp) / 2) + WEIGHTS.EXAM * ex;
    }

    if (m.tpOnly) {
        const tp = readVal(`${semKey}${m.key}tp`);
        if ([tp, ex].some(Number.isNaN)) return NaN;
        return WEIGHTS.CC * tp + WEIGHTS.EXAM * ex;
    }

    const td = readVal(`${semKey}${m.key}td`);
    if ([td, ex].some(Number.isNaN)) return NaN;
    return WEIGHTS.CC * td + WEIGHTS.EXAM * ex;
}

function resetUI(semKey) {
    const modules = MODULES[semKey];

    for (const m of modules) {
        const ids = [];
        if (m.single) ids.push(`${semKey}${m.key}note`);
        else if (m.hasTP) ids.push(`${semKey}${m.key}td`, `${semKey}${m.key}tp`, `${semKey}${m.key}ex`);
        else if (m.tpOnly) ids.push(`${semKey}${m.key}tp`, `${semKey}${m.key}ex`);
        else ids.push(`${semKey}${m.key}td`, `${semKey}${m.key}ex`);

        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
    }

    clearSemesterFromStorage(semKey);

    const avgEl = document.getElementById("avg" + semKey);
    if (avgEl) avgEl.textContent = "";

    const st = document.getElementById("status" + semKey);
    if (st) {
        st.textContent = "";
        st.className = "sub";
    }

    const sumCoefEl = document.getElementById("sumCoef" + semKey);
    if (sumCoefEl) sumCoefEl.textContent = "";

    const tbody = document.getElementById("tbody" + semKey);
    if (tbody) tbody.innerHTML = "";

    setWarn(semKey, "");
}

function computeAndRender(semKey) {
    setWarn(semKey, "");
    const modules = MODULES[semKey];

    let sumCoef = 0;
    let sum = 0;
    const rows = [];

    for (const m of modules) {
        if (m.optional && !choiceSelected(semKey, m)) continue;

        const mark = moduleMark(semKey, m);
        if (Number.isNaN(mark)) {
            setWarn(semKey, `Fill all required fields using numbers between ${MARKSCALE.MIN} and ${MARKSCALE.MAX}.`);
            return;
        }

        sumCoef += m.coef;
        sum += mark * m.coef;

        rows.push({
            name: m.name + (m.optional ? " (choice)" : ""),
            mark,
            coef: m.coef,
        });
    }

    if (sumCoef === 0) {
        setWarn(semKey, "No modules selected.");
        return;
    }

    const avg = sum / sumCoef;

    const avgEl = document.getElementById("avg" + semKey);
    if (avgEl) avgEl.textContent = avg.toFixed(2);

    const st = document.getElementById("status" + semKey);
    const pass = avg >= MARKSCALE.PASS;
    if (st) {
        st.textContent = pass ? "PASS" : "FAIL";
        st.className = pass ? "pass" : "fail";
    }

    const sumCoefEl = document.getElementById("sumCoef" + semKey);
    if (sumCoefEl) sumCoefEl.textContent = String(sumCoef);

    const tbody = document.getElementById("tbody" + semKey);
    if (tbody) {
        tbody.innerHTML = rows
            .map((r) => `<tr><td>${r.name}</td><td>${r.mark.toFixed(2)}</td><td>${r.coef}</td></tr>`)
            .join("");
    }
}

// ===================== EXAMPLES =====================
function fillExample(semKey) {
    const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = v;
            persistInputValue(el);
        }
    };

    switch (semKey) {
        case "s1":
            set("s1an1td", 12); set("s1an1ex", 11);
            set("s1alg1td", 13); set("s1alg1ex", 12);
            set("s1asd1td", 13); set("s1asd1tp", 14); set("s1asd1ex", 12);
            set("s1ms1td", 12); set("s1ms1ex", 10);
            set("s1stenote", 15);
            set("s1engnote", 16);
            set("s1phy1td", 12); set("s1phy1ex", 10);
            set("s1electd", 11); set("s1elecex", 12);
            return;

        case "s2":
            set("s2an2td", 11); set("s2an2ex", 12);
            set("s2alg2td", 12); set("s2alg2ex", 11);
            set("s2asd2td", 12); set("s2asd2tp", 13); set("s2asd2ex", 11);
            set("s2ms2td", 10); set("s2ms2ex", 11);
            set("s2probatd", 12); set("s2probaex", 10);
            set("s2ictnote", 16);
            set("s2ptmtp", 13); set("s2ptmex", 12);
            set("s2phy2td", 11); set("s2phy2ex", 10);
            return;

        case "s3":
            set("s3algotd", 12); set("s3algotp", 13); set("s3algoex", 11);
            set("s3architd", 11); set("s3architp", 12); set("s3archiex", 12);
            set("s3tgtd", 10); set("s3tgex", 10);
            set("s3sitd", 14); set("s3siex", 10);
            set("s3mntd", 15); set("s3mnex", 12);
            set("s3lmtd", 13); set("s3lmex", 9);
            set("s3engnote", 16);
            return;

        case "s4":
            set("s4ostd", 12); set("s4ostp", 12); set("s4osex", 11);
            set("s4tltd", 13); set("s4tlex", 10);
            set("s4rxtd", 11); set("s4rxtp", 12); set("s4rxex", 12);
            set("s4bdtd", 14); set("s4bdtp", 15); set("s4bdex", 11);
            set("s4pootp", 13); set("s4pooex", 10);
            set("s4webtp", 14); set("s4webex", 12);
            set("s4engnote", 17);
            return;

        case "s5":
            set("s5os2td", 12); set("s5os2tp", 12); set("s5os2ex", 11);
            set("s5compiltd", 11); set("s5compiltp", 12); set("s5compilex", 10);
            set("s5logptd", 13); set("s5logpex", 11);
            set("s5gl2td", 12); set("s5gl2tp", 13); set("s5gl2ex", 11);
            set("s5mhitd", 14); set("s5mhitp", 14); set("s5mhiex", 12);
            set("s5aitd", 14); set("s5aiex", 12);
            set("s5pltd", 12); set("s5plex", 11);
            set("s5engtd", 16); set("s5engex", 14);
            return;

        case "s6":
            set("s6mobtd", 13); set("s6mobtp", 14); set("s6mobex", 12);
            set("s6sectd", 12); set("s6secex", 11);
            set("s6cryptotd", 12); set("s6cryptoex", 10);
            set("s6wstd", 13); set("s6wsex", 12);
            set("s6swtd", 14); set("s6swex", 13);
            set("s6projnote", 16);
            return;

        default:
            return;
    }
}

// ===================== ROUTER =====================
function setActivePage(key) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    const target = document.getElementById("page" + key);
    const home = document.getElementById("pagehome");
    (target || home).classList.add("active");
    window.scrollTo(0, 0);
}

function currentRoute() {
    const key = (location.hash || "#home").replace("#", "");
    // FIX: add "habits" to known static pages (your HTML has id="pagehabits")
    const staticPages = ["home", "calc", "pomodoro", "adkar", "quiz", "habits"];
    if (staticPages.includes(key)) return key;
    return SEMESTERS.some((s) => s.key === key) ? key : "home";
}

function initPages() {
    for (const sem of SEMESTERS) {
        const semKey = sem.key;
        const page = document.getElementById("page" + semKey);
        if (!page) continue;

        page.innerHTML = pageTemplate(semKey, sem.label);

        buildModulesUI(semKey);
        wireMarksPersistenceForSemester(semKey);

        document.getElementById("btnCalc" + semKey).addEventListener("click", () => computeAndRender(semKey));
        document.getElementById("btnReset" + semKey).addEventListener("click", () => resetUI(semKey));
        document.getElementById("btnExample" + semKey).addEventListener("click", () => {
            fillExample(semKey);
            computeAndRender(semKey);
        });
        document.getElementById("btnHome" + semKey).addEventListener("click", () => (location.hash = "#home"));
    }
}

function initRouter() {
    const apply = () => setActivePage(currentRoute());
    window.addEventListener("hashchange", apply);
    apply();
}

// ===================== POMODORO =====================
let pomoInterval = null;
const POMOMAXFOCUS = 5;

const pomoState = {
    phase: "focus", // focus | short | long | done
    focusDone: 0,
    remaining: 25 * 60,
    running: false,
    focusMin: 25,
    shortMin: 5,
    longMin: 15,
    autoNext: true,
    sound: true,
};

function el(id) {
    return document.getElementById(id);
}

function formatMMSS(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function phaseLabel(phase) {
    if (phase === "focus") return "Focus";
    if (phase === "short") return "Short Rest";
    if (phase === "long") return "Long Rest";
    return "Done";
}

function phaseDurationSec(phase) {
    if (phase === "focus") return pomoState.focusMin * 60;
    if (phase === "short") return pomoState.shortMin * 60;
    if (phase === "long") return pomoState.longMin * 60;
    return 0;
}

function setBadge(text) {
    const b = el("pomoBadge");
    if (b) b.textContent = text;
}

function renderPomo() {
    const d = el("pomoDisplay");
    const ph = el("pomoPhase");
    const cnt = el("pomoCount");

    if (d) d.textContent = formatMMSS(pomoState.remaining);
    if (ph) ph.textContent = phaseLabel(pomoState.phase);
    if (cnt) cnt.textContent = String(pomoState.focusDone);

    const toggle = el("btnPomoToggle");
    if (toggle) toggle.textContent = pomoState.running ? "Pause" : "Start";

    setBadge(pomoState.phase === "done" ? `Finished (${POMOMAXFOCUS} focus)` : phaseLabel(pomoState.phase));
}

function stopTimer() {
    if (pomoInterval) clearInterval(pomoInterval);
    pomoInterval = null;
    pomoState.running = false;
    renderPomo();
}

function beep() {
    if (!pomoState.sound) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();

        o.type = "sine";
        o.frequency.value = 880;
        g.gain.value = 0.0001;

        o.connect(g);
        g.connect(ctx.destination);
        o.start();

        g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.30);
        o.stop(ctx.currentTime + 0.32);

        setTimeout(() => ctx.close && ctx.close(), 600);
    } catch {
        /* ignore */
    }
}

function nextPhaseAuto() {
    beep();

    if (pomoState.phase === "focus") {
        pomoState.focusDone += 1;

        if (pomoState.focusDone >= POMOMAXFOCUS) {
            pomoState.phase = "done";
            pomoState.remaining = 0;
            stopTimer();
            renderPomo();
            return;
        }

        // long rest after every 4th focus session
        pomoState.phase = pomoState.focusDone % 4 === 0 ? "long" : "short";
        pomoState.remaining = phaseDurationSec(pomoState.phase);
    } else if (pomoState.phase === "short" || pomoState.phase === "long") {
        pomoState.phase = "focus";
        pomoState.remaining = phaseDurationSec("focus");
    }

    renderPomo();
    if (pomoState.autoNext) startTimer();
    else stopTimer();
}

function tick() {
    if (pomoState.remaining > 0) {
        pomoState.remaining -= 1;
        renderPomo();
        return;
    }
    nextPhaseAuto();
}

function startTimer() {
    if (pomoState.phase === "done") return;
    if (pomoInterval) clearInterval(pomoInterval);
    pomoState.running = true;
    pomoInterval = setInterval(tick, 1000);
    renderPomo();
}

function applyPomodoroSettingsFromUI() {
    const focusSelect = el("pomoFocusSelect");
    const shortInp = el("pomoShort");
    const longInp = el("pomoLong");
    const autoChk = el("pomoAuto");
    const soundChk = el("pomoSound");

    pomoState.focusMin = focusSelect ? parseInt(focusSelect.value, 10) : 25;
    pomoState.shortMin = shortInp ? Math.max(1, parseInt(shortInp.value || "5", 10)) : 5;
    pomoState.longMin = longInp ? Math.max(1, parseInt(longInp.value || "15", 10)) : 15;
    pomoState.autoNext = !!(autoChk && autoChk.checked);
    pomoState.sound = !!(soundChk && soundChk.checked);
}

function resetPomodoro(full = true) {
    stopTimer();
    applyPomodoroSettingsFromUI();
    pomoState.phase = "focus";
    pomoState.focusDone = 0;
    pomoState.remaining = phaseDurationSec("focus");
    if (!full) return renderPomo();
    renderPomo();
}

function skipPomodoroPhase() {
    if (pomoState.phase === "done") return;
    pomoState.remaining = 0;
    renderPomo();
    nextPhaseAuto();
}

function wirePomodoro() {
    const btnToggle = el("btnPomoToggle");
    const btnReset = el("btnPomoReset");
    const btnSkip = el("btnPomoSkip");
    const btnHome = el("btnPomoHome");

    const focusSelect = el("pomoFocusSelect");
    const shortInp = el("pomoShort");
    const longInp = el("pomoLong");
    const autoChk = el("pomoAuto");
    const soundChk = el("pomoSound");

    const onSettingsChange = () => {
        applyPomodoroSettingsFromUI();
        if (!pomoState.running) {
            pomoState.phase = "focus";
            pomoState.focusDone = 0;
            pomoState.remaining = phaseDurationSec("focus");
            renderPomo();
        }
    };

    [focusSelect, shortInp, longInp, autoChk, soundChk].forEach((x) => {
        if (!x) return;
        x.addEventListener("change", onSettingsChange);
        x.addEventListener("input", onSettingsChange);
    });

    if (btnToggle) {
        btnToggle.onclick = () => {
            if (pomoState.running) return stopTimer();
            applyPomodoroSettingsFromUI();
            if (pomoState.remaining === 0 && pomoState.phase !== "done") {
                pomoState.remaining = phaseDurationSec(pomoState.phase);
            }
            startTimer();
        };
    }
    if (btnReset) btnReset.onclick = () => resetPomodoro(true);
    if (btnSkip) btnSkip.onclick = () => skipPomodoroPhase();
    if (btnHome) btnHome.onclick = () => (location.hash = "#home");

    resetPomodoro(true);
}

// ===================== ADKAR =====================
// already used inline in HTML: onclick="handleDhikr(this)"
window.handleDhikr = function (el) {
    const counter = el.querySelector(".counter");
    if (!counter) return;

    const val = parseInt(counter.textContent, 10);
    if (!Number.isFinite(val)) return;

    if (val > 0) counter.textContent = String(val - 1);
    if (val - 1 <= 0) el.classList.add("done");
};

// ===================== CS QUIZ =====================
const QUIZ_QUESTIONS = [
    {
        cat: "Basics",
        q: "Which one is a real programming paradigm?",
        options: ["Object-Oriented Programming", "Circle-Oriented Programming", "Keyboard-Oriented Programming"],
        answer: 0,
        exp: "OOP is a real paradigm; the others are jokes.",
    },
    {
        cat: "Data Structures",
        q: "Which structure uses LIFO (Last In, First Out)?",
        options: ["Queue", "Stack", "Binary search tree"],
        answer: 1,
        exp: "Stacks are LIFO; queues are FIFO.",
    },
    {
        cat: "Algorithms",
        q: "Binary search works correctly only if the array is…",
        options: ["Sorted", "Random", "Full of duplicates"],
        answer: 0,
        exp: "Binary search relies on sorted order to discard half each step.",
    },
    {
        cat: "Big-O",
        q: "Which is generally the fastest growth (worst) as n gets big?",
        options: ["O(n log n)", "O(n^2)", "O(log n)"],
        answer: 1,
        exp: "Quadratic grows faster than n log n and log n.",
    },
    {
        cat: "Operating Systems",
        q: "What does a process scheduler mainly decide?",
        options: ["Which app gets the CPU next", "How many pixels are on screen", "The Wi‑Fi password"],
        answer: 0,
        exp: "Scheduling is about CPU time allocation.",
    },
    {
        cat: "Networking",
        q: "HTTP is mainly used at which layer (classic TCP/IP view)?",
        options: ["Application", "Transport", "Link"],
        answer: 0,
        exp: "HTTP is an application-layer protocol.",
    },
    {
        cat: "Databases",
        q: "In SQL, which keyword is used to filter rows?",
        options: ["WHERE", "FILTERNOW", "SEARCH"],
        answer: 0,
        exp: "WHERE filters rows that match a condition.",
    },
    {
        cat: "Security",
        q: "Which one is a good practice for passwords?",
        options: ["Reuse the same password everywhere", "Use a password manager + unique passwords", "Save passwords in a public note"],
        answer: 1,
        exp: "Unique passwords + a manager reduces damage if one site leaks.",
    },
    {
        cat: "Programming",
        q: "A compiler mainly does what?",
        options: ["Translates source code to machine/bytecode", "Cleans your keyboard", "Makes your internet faster"],
        answer: 0,
        exp: "Compilers translate code; jokes aside.",
    },
    {
        cat: "Fun CS",
        q: "If you find a bug, what is the best first move?",
        options: ["Panic", "Reproduce it consistently", "Delete the whole project"],
        answer: 1,
        exp: "Reproducing makes debugging possible.",
    },
    {
        cat: "Web",
        q: "CSS is mainly responsible for…",
        options: ["Styling/layout", "Database queries", "CPU scheduling"],
        answer: 0,
        exp: "CSS controls appearance; JS controls logic; DB stores data.",
    },
    {
        cat: "Git",
        q: "What does 'git commit' create?",
        options: ["A snapshot in history", "A new laptop", "A virus"],
        answer: 0,
        exp: "A commit records a snapshot of tracked changes.",
    },
    {
        cat: "Fun",
        q: "What's the best club in Biskra?",
        options: ["Debug Club", "InterLink Club", "Metaverse Club"],
        answer: 1,
        exp: "InterLink is the best club here.",
    },
    {
        cat: "Fun",
        q: "Who is the best programmer?",
        options: ["Elon Musk", "Steve Jobs", "Abderrazak"],
        answer: 2,
        exp: "Because Abderrazak made this web application.",
    },
    {
        cat: "Basics",
        q: "What does 'bug' mean in programming?",
        options: ["A feature", "An error in the code", "A hardware upgrade"],
        answer: 1,
        exp: "A bug is an error or flaw that causes incorrect or unexpected behavior.",
    },
    {
        cat: "Basics",
        q: "Which of these is NOT a programming language?",
        options: ["Python", "HTML", "Cappuccino"],
        answer: 2,
        exp: "HTML is a markup language; Cappuccino is just a drink name here.",
    },
    {
        cat: "Programming",
        q: "What does 'IDE' stand for?",
        options: ["Integrated Development Environment", "Internal Data Engine", "Infinite Debugging Experience"],
        answer: 0,
        exp: "An IDE is a software suite that helps you write, run, and debug code.",
    },
    {
        cat: "Programming",
        q: "In most languages, arrays are usually indexed starting from…",
        options: ["0", "1", "−1"],
        answer: 0,
        exp: "Many languages like C, Java, and JavaScript use zero-based indexing.",
    },
    {
        cat: "Data Structures",
        q: "Which data structure is best to implement a FIFO queue?",
        options: ["Queue", "Stack", "Hash table"],
        answer: 0,
        exp: "A queue is explicitly designed for FIFO behavior.",
    },
    {
        cat: "Data Structures",
        q: "Which structure is best suited for fast key–value lookups?",
        options: ["Array", "Hash map", "Queue"],
        answer: 1,
        exp: "Hash maps (dictionaries) give average O(1) key–value access.",
    },
    {
        cat: "Algorithms",
        q: "Which algorithm is typically used for finding the shortest path in a weighted graph?",
        options: ["Bubble sort", "Dijkstra’s algorithm", "Merge sort"],
        answer: 1,
        exp: "Dijkstra’s algorithm finds shortest paths from a source in a weighted graph.",
    },
    {
        cat: "Algorithms",
        q: "Which sorting algorithm is usually O(n log n) in the average case?",
        options: ["Bubble sort", "Insertion sort", "Merge sort"],
        answer: 2,
        exp: "Merge sort guarantees O(n log n) time complexity.",
    },
    {
        cat: "Big-O",
        q: "If an algorithm doubles its steps every time n increases by 1, its complexity is roughly…",
        options: ["O(n)", "O(log n)", "O(2^n)"],
        answer: 2,
        exp: "Doubling with each increment is characteristic of exponential time.",
    },
    {
        cat: "Big-O",
        q: "Which complexity is generally best (fastest) for large n?",
        options: ["O(n^3)", "O(log n)", "O(n^2)"],
        answer: 1,
        exp: "Logarithmic time grows the slowest, so it’s best for large inputs.",
    },
    {
        cat: "Operating Systems",
        q: "What is a 'thread' in an OS?",
        options: ["A type of cable", "A unit of CPU execution inside a process", "A backup file"],
        answer: 1,
        exp: "A thread is the smallest unit of execution scheduled by the OS.",
    },
    {
        cat: "Operating Systems",
        q: "What does 'deadlock' mean?",
        options: ["CPU overheating", "Processes waiting on each other forever", "Hard disk full"],
        answer: 1,
        exp: "Deadlock happens when processes wait on resources in a cycle that never breaks.",
    },
    {
        cat: "Networking",
        q: "Which protocol is commonly used to send emails?",
        options: ["SMTP", "FTP", "SSH"],
        answer: 0,
        exp: "SMTP (Simple Mail Transfer Protocol) is used for sending emails.",
    },
    {
        cat: "Networking",
        q: "Which device usually connects multiple networks together?",
        options: ["Router", "Keyboard", "Monitor"],
        answer: 0,
        exp: "Routers forward packets between different networks.",
    },
    {
        cat: "Networking",
        q: "What does IP in 'IP address' stand for?",
        options: ["Internet Protocol", "Internal Program", "Input Processor"],
        answer: 0,
        exp: "IP stands for Internet Protocol, which handles addressing and routing.",
    },
    {
        cat: "Databases",
        q: "What does SQL stand for?",
        options: ["Structured Query Language", "Simple Question List", "Sequential Query Logic"],
        answer: 0,
        exp: "SQL is the standard language for working with relational databases.",
    },
    {
        cat: "Databases",
        q: "Which SQL command is used to remove a table completely?",
        options: ["DELETE TABLE", "DROP TABLE", "REMOVE TABLE"],
        answer: 1,
        exp: "DROP TABLE deletes the table structure and its data.",
    },
    {
        cat: "Databases",
        q: "A primary key in a table must be…",
        options: ["Unique and not NULL", "Always text", "Always a number"],
        answer: 0,
        exp: "Primary keys uniquely identify rows and cannot be NULL.",
    },
    {
        cat: "Security",
        q: "What does 'HTTPS' add on top of HTTP?",
        options: ["More ads", "Encryption and security", "Faster Wi‑Fi"],
        answer: 1,
        exp: "HTTPS uses TLS to encrypt traffic and improve security.",
    },
    {
        cat: "Security",
        q: "What is phishing?",
        options: ["Optimizing code", "Tricking users into giving up secrets", "Testing Wi‑Fi speed"],
        answer: 1,
        exp: "Phishing uses fake messages/sites to steal credentials or data.",
    },
    {
        cat: "Security",
        q: "Two‑factor authentication (2FA) usually means…",
        options: ["Two passwords only", "Password plus another proof (code, app, device)", "Using two browsers"],
        answer: 1,
        exp: "2FA combines something you know (password) with something you have or are.",
    },
    {
        cat: "Web",
        q: "HTML is mainly used for…",
        options: ["Structuring web content", "Styling pages", "Running database queries"],
        answer: 0,
        exp: "HTML defines the structure and semantics of web pages.",
    },
    {
        cat: "Web",
        q: "JavaScript in the browser is mainly used for…",
        options: ["Interactivity and logic", "Only styling", "Installing drivers"],
        answer: 0,
        exp: "JavaScript adds dynamic behavior and logic to web pages.",
    },
    {
        cat: "Web",
        q: "Which HTTP method is commonly used to request data (without changing it)?",
        options: ["GET", "DELETE", "FORMAT"],
        answer: 0,
        exp: "GET requests data from a resource without modifying it.",
    },
    {
        cat: "Git",
        q: "Which command creates a copy of a remote repository on your machine?",
        options: ["git clone", "git copy", "git download"],
        answer: 0,
        exp: "git clone copies an entire remote repo locally.",
    },
    {
        cat: "Git",
        q: "Which command sends your local commits to a remote?",
        options: ["git push", "git send", "git upload"],
        answer: 0,
        exp: "git push uploads your commits to a remote repository.",
    },
    {
        cat: "Git",
        q: "What does 'git status' show?",
        options: ["Battery level", "Current branch and changes", "Internet speed"],
        answer: 1,
        exp: "git status shows staged/unstaged changes and branch info.",
    },
    {
        cat: "Programming",
        q: "What is a 'loop' used for?",
        options: ["Repeating code multiple times", "Encrypting files", "Drawing UI only"],
        answer: 0,
        exp: "Loops let you repeat a block of code until a condition changes.",
    },
    {
        cat: "Programming",
        q: "In many languages, '==' is used to…",
        options: ["Assign a value", "Compare two values", "Delete a variable"],
        answer: 1,
        exp: "== (or ===) is typically a comparison operator, not assignment.",
    },
    {
        cat: "Programming",
        q: "What is a variable?",
        options: ["A fixed number", "A named storage for data", "Only a constant string"],
        answer: 1,
        exp: "Variables store data values that can change during program execution.",
    },
    {
        cat: "Fun CS",
        q: "When your code works on the first try, you should…",
        options: ["Assume it’s perfect forever", "Still test it and be suspicious", "Immediately refactor the universe"],
        answer: 1,
        exp: "Even if it runs, you still need to test and review the logic.",
    },
    {
        cat: "Fun CS",
        q: "What is the unofficial first step of debugging?",
        options: ["Blame the compiler", "Check if you saved the file and re‑run", "Uninstall the OS"],
        answer: 1,
        exp: "Forgetting to save or re‑run is a classic source of “bugs”.",
    },
    {
        cat: "Fun",
        q: "What’s the most powerful key for a CS student?",
        options: ["Caps Lock", "Ctrl+S", "Num Lock"],
        answer: 1,
        exp: "Saving your work frequently is the real superpower.",
    },
    {
        cat: "Fun",
        q: "A programmer’s best friend during deadlines is…",
        options: ["Sleep", "Coffee or tea", "Turning off the PC"],
        answer: 1,
        exp: "Caffeine and focus are a classic combo during crunch time.",
    },
    {
        cat: "Basics",
        q: "RAM is mainly used for…",
        options: ["Permanent storage", "Temporary working memory", "Improving screen colors"],
        answer: 1,
        exp: "RAM holds data and code that the CPU is actively using.",
    },
    {
        cat: "Basics",
        q: "The CPU is often called the…",
        options: ["Heart of the computer", "Brain of the computer", "Legs of the computer"],
        answer: 1,
        exp: "The CPU performs most calculations, so it’s nicknamed the brain.",
    },
];

function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const quizState = {
    order: [],
    idx: 0,
    score: 0,
    locked: false,
    total: 12,
};

function qEl(id) {
    return document.getElementById(id);
}

function quizSetBadge(text) {
    const b = qEl("quizBadge");
    if (b) b.textContent = text;
}

function quizRender() {
    const progress = qEl("quizProgress");
    const score = qEl("quizScore");
    const cat = qEl("quizCategory");
    const q = qEl("quizQuestion");
    const optionsHost = qEl("quizOptions");
    const feedback = qEl("quizFeedback");
    const btnNext = qEl("btnQuizNext");

    if (!progress || !score || !cat || !q || !optionsHost || !feedback || !btnNext) return;

    const done = quizState.idx >= quizState.order.length;
    if (done) {
        quizSetBadge("Finished");
        progress.textContent = `${quizState.order.length}/${quizState.order.length}`;
        score.textContent = String(quizState.score);
        cat.textContent = "Results";
        q.textContent = `You scored ${quizState.score}/${quizState.order.length}.`;
        optionsHost.innerHTML = "";
        feedback.style.display = "block";
        feedback.innerHTML = `Want a rematch? Hit <strong>Restart</strong>.`;
        btnNext.disabled = true;
        return;
    }

    const current = quizState.order[quizState.idx];
    quizSetBadge("Think fast");
    progress.textContent = `${quizState.idx + 1}/${quizState.order.length}`;
    score.textContent = String(quizState.score);
    cat.textContent = current.cat;
    q.textContent = current.q;

    feedback.style.display = "none";
    feedback.innerHTML = "";
    btnNext.disabled = true;

    optionsHost.innerHTML = "";
    quizState.locked = false;

    current.options.forEach((optText, optIdx) => {
        const btn = document.createElement("button");
        btn.className = "quizOptionBtn";
        btn.type = "button";
        btn.textContent = optText;
        btn.onclick = () => quizChoose(optIdx);
        optionsHost.appendChild(btn);
    });
}

function quizChoose(chosenIdx) {
    if (quizState.locked) return;

    const current = quizState.order[quizState.idx];
    const optionsHost = qEl("quizOptions");
    const feedback = qEl("quizFeedback");
    const btnNext = qEl("btnQuizNext");
    if (!current || !optionsHost || !feedback || !btnNext) return;

    quizState.locked = true;

    const buttons = Array.from(optionsHost.querySelectorAll("button"));
    buttons.forEach((b) => (b.disabled = true));

    const correctIdx = current.answer;
    const chosenBtn = buttons[chosenIdx];
    const correctBtn = buttons[correctIdx];

    const isCorrect = chosenIdx === correctIdx;
    if (isCorrect) {
        quizState.score += 1;
        if (chosenBtn) chosenBtn.classList.add("correct");
        quizSetBadge("Nice!");
    } else {
        if (chosenBtn) chosenBtn.classList.add("wrong");
        if (correctBtn) correctBtn.classList.add("reveal");
        quizSetBadge("Oops!");
    }

    feedback.style.display = "block";
    feedback.innerHTML = isCorrect
        ? `Correct. <strong>${current.exp}</strong>`
        : `Wrong. Correct answer: <strong>${current.options[correctIdx]}</strong>. ${current.exp}`;

    btnNext.disabled = false;

    const scoreEl = qEl("quizScore");
    if (scoreEl) scoreEl.textContent = String(quizState.score);
}

function quizNext() {
    if (quizState.idx < quizState.order.length) quizState.idx += 1;
    quizRender();
}

function quizRestart() {
    const pool = [...QUIZ_QUESTIONS];
    shuffleInPlace(pool);

    quizState.total = pool.length;
    quizState.order = pool.slice(0, quizState.total);
    quizState.idx = 0;
    quizState.score = 0;
    quizState.locked = false;

    quizSetBadge("Warm up");
    quizRender();
}

function wireQuiz() {
    const btnNext = qEl("btnQuizNext");
    const btnRestart = qEl("btnQuizRestart");
    const btnHome = qEl("btnQuizHome");

    if (btnNext) btnNext.onclick = quizNext;
    if (btnRestart) btnRestart.onclick = quizRestart;
    if (btnHome) btnHome.onclick = () => (location.hash = "#home");

    quizRestart();
}

// ===================== BOOT (main app) =====================
initPages();
initRouter();
wireNotesPersistence();
wirePomodoro();
wireQuiz();

// ===================== HABIT TRACKER =====================
// NOTE: Your HTML uses inline onclick="showAddHabitForm()", "addNewHabit()", etc.
// To make that work reliably, we expose those functions on window. [file:1]

const HABIT_STORAGE_KEY = "habitTrackerData";

function getHabitData() {
    const raw = localStorage.getItem(HABIT_STORAGE_KEY);
    return raw
        ? safeParseJSON(raw, { habits: [], completions: {} })
        : { habits: [], completions: {} };
}

function saveHabitData(data) {
    try {
        localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Could not save habit data", e);
    }
}

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

function showAddHabitForm() {
    const form = document.getElementById("addHabitForm");
    const name = document.getElementById("habitName");
    if (form) form.style.display = "block";
    if (name) name.focus();
}

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

function getRandomColor() {
    const colors = ["#6ea8fe", "#31d0aa", "#ffd166", "#ff6b6b", "#9bb0d0", "#a78bfa", "#fb923c"];
    return colors[Math.floor(Math.random() * colors.length)];
}

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
        html += `<div style="margin-bottom: 16px;">`;
        html += `<div style="font-size: 12px; color: var(--muted); margin-bottom: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${category}</div>`;

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

          <div class="actions" style="margin-top: 12px;">
            <button onclick="toggleHabitCompletion('${habit.id}')" style="flex: 1; ${isComplete ? "background: rgba(49, 208, 170, 0.20); border-color: var(--good);" : ""
                }">
              ${isComplete ? "✓ Completed" : "+ Mark Progress"}
            </button>
          </div>
        </div>
      `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
    updateHabitStats();
}

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

// auto-render habits when entering page (hash navigation)
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
