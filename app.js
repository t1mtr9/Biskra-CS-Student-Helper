/*
  Biskra CS Student Helper
  - Semester Average Calculator (S1..S6)
  - Local persistence for marks + notes
  - Theme toggle
  - Added: routes (home/calc/pomodoro/adkar), Pomodoro, Adkar
*/

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

/* ---------------- PERSISTENCE ---------------- */
const STORAGEKEY = "biskrahelperstatev1";

function safeParseJSON(str, fallback = {}) {
    try { return JSON.parse(str); } catch { return fallback; }
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

/* ---------------- SETTINGS ---------------- */
const WEIGHTS = { CC: 0.4, EXAM: 0.6 };
const MARKSCALE = { MIN: 0, MAX: 20, PASS: 10 };

/* ---------------- MODULES DATA ---------------- */
const MODULES = {
    s1: [
        { key: "an1", name: "Analysis 1", coef: 4 },
        { key: "alg1", name: "Algebra 1", coef: 3 },
        { key: "asd1", name: "ASD 1", hasTP: true, coef: 4 },
        { key: "ms1", name: "MS 1", coef: 3 },
        { key: "ste", name: "STE", single: true, coef: 1 },
        { key: "eng", name: "English", single: true, coef: 1 },
        { key: "phy1", name: "Physics 1", coef: 2, optional: true },
        { key: "elec", name: "Electronics", coef: 2, optional: true }
    ],
    s2: [
        { key: "an2", name: "Analysis 2", coef: 4 },
        { key: "alg2", name: "Algebra 2", coef: 2 },
        { key: "asd2", name: "ASD 2", hasTP: true, coef: 4 },
        { key: "ms2", name: "MS 2", coef: 2 },
        { key: "proba", name: "ProbaStats", coef: 2 },
        { key: "ict", name: "ICT", single: true, coef: 1 },
        { key: "ptm", name: "PTM", tpOnly: true, coef: 1 },
        { key: "phy2", name: "Physics 2", coef: 2 }
    ],
    s3: [
        { key: "algo", name: "Algo", hasTP: true, coef: 3 },
        { key: "archi", name: "Archi", hasTP: true, coef: 3 },
        { key: "tg", name: "TG", coef: 2 },
        { key: "si", name: "SI", coef: 3 },
        { key: "eng", name: "English", single: true, coef: 1 },
        { key: "mn", name: "MN", coef: 2 },
        { key: "lm", name: "LM", coef: 2 }
    ],
    s4: [
        { key: "os", name: "OS", hasTP: true, coef: 3 },
        { key: "tl", name: "TL", coef: 2 },
        { key: "rx", name: "RX", hasTP: true, coef: 3 },
        { key: "bd", name: "BD", hasTP: true, coef: 3 },
        { key: "eng", name: "English", single: true, coef: 1 },
        { key: "poo", name: "POO", tpOnly: true, coef: 2 },
        { key: "web", name: "Web", tpOnly: true, coef: 2 }
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
        { key: "eng", name: "English", coef: 1 }
    ],
    s6: [
        { key: "mob", name: "Mobile", hasTP: true, coef: 3 },
        { key: "sec", name: "Security", coef: 3 },
        { key: "adb", name: "Admin BD", coef: 2, optional: true },
        { key: "info", name: "Infographics", coef: 2, optional: true },
        { key: "ws", name: "Web Sem", coef: 2, optional: true },
        { key: "crypto", name: "Crypto", coef: 2, optional: true },
        { key: "sw", name: "Sci Writing", coef: 1, optional: true },
        { key: "proj", name: "Project", single: true, coef: 4 }
    ]
};

const SEMESTERS = [
    { key: "s1", label: "S1 average" },
    { key: "s2", label: "S2 average" },
    { key: "s3", label: "S3 average" },
    { key: "s4", label: "S4 average" },
    { key: "s5", label: "S5 average" },
    { key: "s6", label: "S6 average" }
];

/* ---------------- DOM UTILS ---------------- */
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

/* ---------------- UI BUILDING ---------------- */
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
            <div class="kpi"><span>Status</span><strong id="status${semKey}" class="sub"></strong></div>
            <div class="kpi"><span>Total coef</span><strong id="sumCoef${semKey}" class="sub"></strong></div>
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
          <input type="number" disabled placeholder="" />
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
        <div class="name">${m.name}${m.optional ? ' <span style="opacity:.6;font-weight:700">(choice)</span>' : ""}</div>
        <div class="coef">coef ${m.coef}</div>
      </div>
      ${inputsTemplate(semKey, m)}
    `;
        host.appendChild(div);
    }
}

/* ---------------- CALCULATION ---------------- */
function choiceSelected(semKey, m) {
    if (!m.optional) return true;

    if (m.single) return !isEmptyInput(document.getElementById(semKey + m.key + "note"));

    let ids = [];
    if (m.hasTP) ids = [semKey + m.key + "td", semKey + m.key + "tp", semKey + m.key + "ex"];
    else if (m.tpOnly) ids = [semKey + m.key + "tp", semKey + m.key + "ex"];
    else ids = [semKey + m.key + "td", semKey + m.key + "ex"];

    return ids.some((id) => !isEmptyInput(document.getElementById(id)));
}

function moduleMark(semKey, m) {
    if (m.single) return readVal(semKey + m.key + "note");

    const ex = readVal(semKey + m.key + "ex");

    if (m.hasTP) {
        const td = readVal(semKey + m.key + "td");
        const tp = readVal(semKey + m.key + "tp");
        if ([td, tp, ex].some(Number.isNaN)) return NaN;
        return WEIGHTS.CC * ((td + tp) / 2) + WEIGHTS.EXAM * ex;
    }

    if (m.tpOnly) {
        const tp = readVal(semKey + m.key + "tp");
        if ([tp, ex].some(Number.isNaN)) return NaN;
        return WEIGHTS.CC * tp + WEIGHTS.EXAM * ex;
    }

    const td = readVal(semKey + m.key + "td");
    if ([td, ex].some(Number.isNaN)) return NaN;
    return WEIGHTS.CC * td + WEIGHTS.EXAM * ex;
}

function resetUI(semKey) {
    const modules = MODULES[semKey];

    for (const m of modules) {
        const ids = [];
        if (m.single) ids.push(semKey + m.key + "note");
        else if (m.hasTP) ids.push(semKey + m.key + "td", semKey + m.key + "tp", semKey + m.key + "ex");
        else if (m.tpOnly) ids.push(semKey + m.key + "tp", semKey + m.key + "ex");
        else ids.push(semKey + m.key + "td", semKey + m.key + "ex");

        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
    }

    clearSemesterFromStorage(semKey);

    const avgEl = document.getElementById("avg" + semKey);
    if (avgEl) avgEl.textContent = "";
    const st = document.getElementById("status" + semKey);
    if (st) { st.textContent = ""; st.className = "sub"; }
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
            coef: m.coef
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

/* ---------------- EXAMPLES ---------------- */
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

/* ---------------- ROUTER ---------------- */
function setActivePage(key) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));

    const target = document.getElementById("page" + key);
    const home = document.getElementById("pagehome");

    (target || home).classList.add("active");
    window.scrollTo(0, 0);
}


function currentRoute() {
    const key = (location.hash || "#home").replace("#", "") || "home";

    // allow your new pages
    const staticPages = ["home", "calc", "pomodoro", "adkar"];
    if (staticPages.includes(key)) return key;

    // allow semesters
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
        document.getElementById("btnExample" + semKey).addEventListener("click", () => { fillExample(semKey); computeAndRender(semKey); });
        document.getElementById("btnHome" + semKey).addEventListener("click", () => (location.hash = "#home"));
    }
}

function initRouter() {
    const apply = () => setActivePage(currentRoute());
    window.addEventListener("hashchange", apply);
    apply();
}

/* ---------------- POMODORO ---------------- */
let pomoTime = 25 * 60;
let pomoInterval = null;

function renderPomo() {
    const m = Math.floor(pomoTime / 60);
    const s = pomoTime % 60;
    const el = document.getElementById("pomoDisplay");
    if (el) el.textContent = `${m}:${String(s).padStart(2, "0")}`;
}

function wirePomodoro() {
    const btnToggle = document.getElementById("btnPomoToggle");
    const btnReset = document.getElementById("btnPomoReset");
    const btnHome = document.getElementById("btnPomoHome");

    if (btnToggle) {
        btnToggle.onclick = () => {
            if (pomoInterval) {
                clearInterval(pomoInterval);
                pomoInterval = null;
                btnToggle.textContent = "Start";
                return;
            }

            btnToggle.textContent = "Pause";
            pomoInterval = setInterval(() => {
                if (pomoTime > 0) {
                    pomoTime--;
                    renderPomo();
                } else {
                    clearInterval(pomoInterval);
                    pomoInterval = null;
                    btnToggle.textContent = "Start";
                    alert("Session over!");
                }
            }, 1000);
        };
    }

    if (btnReset) {
        btnReset.onclick = () => {
            if (pomoInterval) {
                clearInterval(pomoInterval);
                pomoInterval = null;
            }
            pomoTime = 25 * 60;
            renderPomo();
            if (btnToggle) btnToggle.textContent = "Start";
        };
    }

    if (btnHome) btnHome.onclick = () => (location.hash = "#home");

    renderPomo();
}

/* ---------------- ADKAR ---------------- */
window.handleDhikr = function (el) {
    const counter = el.querySelector(".counter");
    if (!counter) return;

    const val = parseInt(counter.textContent, 10);
    if (!Number.isFinite(val)) return;

    if (val > 0) counter.textContent = String(val - 1);
    if (val - 1 === 0) el.classList.add("done");
};

/* ---------------- BOOT ---------------- */
initPages();
initRouter();
wireNotesPersistence();
wirePomodoro();
