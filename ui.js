// ===================== DOM UTILS =====================

/**
 * Clamps a mark to be within the allowed range.
 * @param {number} v - The mark to clamp.
 * @returns {number} The clamped mark.
 */
function clampMark(v) {
    if (Number.isNaN(v)) return NaN;
    if (v < MARKSCALE.MIN) return MARKSCALE.MIN;
    if (v > MARKSCALE.MAX) return MARKSCALE.MAX;
    return v;
}

/**
 * Checks if an input element is empty.
 * @param {HTMLInputElement} el - The input element to check.
 * @returns {boolean} True if the input is empty, false otherwise.
 */
function isEmptyInput(el) {
    return !el || String(el.value).trim() === "";
}

/**
 * Reads and parses the value of an input element.
 * @param {string} id - The ID of the input element.
 * @returns {number} The parsed value, or NaN if the input is invalid.
 */
function readVal(id) {
    const el = document.getElementById(id);
    if (!el) return NaN;
    return clampMark(parseFloat(el.value));
}

/**
 * Sets a warning message for a semester.
 * @param {string} semKey - The key of the semester (e.g., "s1").
 * @param {string} msg - The warning message to display.
 */
function setWarn(semKey, msg) {
    const el = document.getElementById("warn" + semKey);
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("show", !!msg);
}

// ===================== UI BUILDING =====================

/**
 * Generates the HTML template for a semester page.
 * @param {string} semKey - The key of the semester (e.g., "s1").
 * @param {string} avgLabel - The label for the average mark.
 * @returns {string} The HTML template for the page.
 */
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

/**
 * Generates the HTML template for the inputs of a module.
 * @param {string} semKey - The key of the semester (e.g., "s1").
 * @param {object} m - The module object.
 * @returns {string} The HTML template for the inputs.
 */
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

/**
 * Builds the UI for the modules of a semester.
 * @param {string} semKey - The key of the semester (e.g., "s1").
 */
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
