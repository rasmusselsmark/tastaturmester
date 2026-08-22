/* Tastaturmester — main app logic.
   Owns the game state, keyboard event handling, timer and metrics. */

const App = (() => {
    const STORAGE_KEY_PREFIX = "tastaturmester.best.";
    const STORAGE_KEY_LAYOUT = "tastaturmester.layout";
    const STORAGE_KEY_SOUND  = "tastaturmester.sound";
    const STORAGE_KEY_LEVEL  = "tastaturmester.level";

    /* Session state — reset on each new round. */
    const state = {
        layoutId: "dk",
        levelIdx: 0,
        text: "",
        pos: 0,
        correctCount: 0,
        errorCount: 0,
        started: false,
        finished: false,
        startTs: 0,
        endTs: 0,
        timerId: null,
        charMap: null
    };

    /* DOM refs, populated in init(). */
    const dom = {};

    function init() {
        dom.layoutSelect = document.getElementById("layout-select");
        dom.levelSelect  = document.getElementById("level-select");
        dom.soundToggle  = document.getElementById("sound-toggle");
        dom.soundIcon    = document.getElementById("sound-icon");
        dom.levelTitle   = document.getElementById("level-title");
        dom.levelDesc    = document.getElementById("level-description");
        dom.statTime     = document.getElementById("stat-time");
        dom.statCpm      = document.getElementById("stat-cpm");
        dom.statAcc      = document.getElementById("stat-accuracy");
        dom.statErr      = document.getElementById("stat-errors");
        dom.typingArea   = document.getElementById("typing-area");
        dom.textDisplay  = document.getElementById("text-display");
        dom.hint         = document.getElementById("hint");
        dom.layoutWarn   = document.getElementById("layout-warning");
        dom.fingerName   = document.getElementById("finger-name");
        dom.overlay      = document.getElementById("results-overlay");
        dom.resultCpm    = document.getElementById("result-cpm");
        dom.resultWpm    = document.getElementById("result-wpm");
        dom.resultAcc    = document.getElementById("result-accuracy");
        dom.resultTime   = document.getElementById("result-time");
        dom.resultCor    = document.getElementById("result-correct");
        dom.resultErr    = document.getElementById("result-errors");
        dom.resultBest   = document.getElementById("result-best");
        dom.btnRetry     = document.getElementById("btn-retry");
        dom.btnNext      = document.getElementById("btn-next");
        dom.btnClose     = document.getElementById("btn-close");

        populateLevels();
        loadPreferences();
        wireEvents();

        Hands.render();
        setLayout(state.layoutId, { silent: true });
        setLevel(state.levelIdx);
    }

    function populateLevels() {
        dom.levelSelect.innerHTML = "";
        LEVELS.forEach((lvl, i) => {
            const opt = document.createElement("option");
            opt.value = String(i);
            opt.textContent = `${i + 1}. ${lvl.title.replace(/^Niveau \d+ — /, "")}`;
            dom.levelSelect.appendChild(opt);
        });
    }

    function loadPreferences() {
        const savedLayout = localStorage.getItem(STORAGE_KEY_LAYOUT);
        if (savedLayout && LAYOUTS[savedLayout]) state.layoutId = savedLayout;
        dom.layoutSelect.value = state.layoutId;

        const savedLevel = parseInt(localStorage.getItem(STORAGE_KEY_LEVEL) || "0", 10);
        if (!isNaN(savedLevel) && savedLevel >= 0 && savedLevel < LEVELS.length) {
            state.levelIdx = savedLevel;
        }
        dom.levelSelect.value = String(state.levelIdx);

        const savedSound = localStorage.getItem(STORAGE_KEY_SOUND) === "on";
        setSound(savedSound);
    }

    function wireEvents() {
        dom.layoutSelect.addEventListener("change", (e) => setLayout(e.target.value));
        dom.levelSelect.addEventListener("change", (e) => setLevel(parseInt(e.target.value, 10)));
        dom.soundToggle.addEventListener("click", () => setSound(!Sound.isEnabled()));

        dom.typingArea.addEventListener("click", () => dom.typingArea.focus());
        dom.typingArea.addEventListener("keydown", onKeyDown);

        dom.btnRetry.addEventListener("click", () => { closeOverlay(); setLevel(state.levelIdx); });
        dom.btnNext.addEventListener("click", () => {
            closeOverlay();
            const next = Math.min(LEVELS.length - 1, state.levelIdx + 1);
            dom.levelSelect.value = String(next);
            setLevel(next);
        });
        dom.btnClose.addEventListener("click", () => closeOverlay());

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !dom.overlay.classList.contains("hidden")) closeOverlay();
        });
    }

    function setSound(on) {
        Sound.setEnabled(on);
        localStorage.setItem(STORAGE_KEY_SOUND, on ? "on" : "off");
        dom.soundIcon.textContent = on ? "🔊" : "🔇";
    }

    function setLayout(id, opts = {}) {
        if (!LAYOUTS[id]) return;
        state.layoutId = id;
        state.charMap = buildCharMap(LAYOUTS[id]);
        Keyboard.render(LAYOUTS[id]);
        localStorage.setItem(STORAGE_KEY_LAYOUT, id);
        if (!opts.silent) {
            // Layout change resets the current round so highlights stay correct.
            setLevel(state.levelIdx);
        }
    }

    function setLevel(idx) {
        stopTimer();
        state.levelIdx = idx;
        state.pos = 0;
        state.correctCount = 0;
        state.errorCount = 0;
        state.started = false;
        state.finished = false;
        state.startTs = 0;
        state.endTs = 0;

        const level = LEVELS[idx];
        state.text = level.generate();
        dom.levelTitle.textContent = level.title;
        dom.levelDesc.textContent = level.description;

        localStorage.setItem(STORAGE_KEY_LEVEL, String(idx));

        renderText();
        updateStatsDisplay();
        updateTimeDisplay();
        dom.hint.classList.remove("hidden");
        dom.hint.textContent = "Klik her og begynd at skrive for at starte";
        updateLayoutWarning();
        highlightNextChar();
        dom.typingArea.focus();
    }

    function updateLayoutWarning() {
        const missing = new Set();
        for (const ch of state.text) {
            if (!state.charMap.has(ch)) missing.add(ch);
        }
        if (missing.size === 0) {
            dom.layoutWarn.classList.add("hidden");
            dom.layoutWarn.textContent = "";
            return;
        }
        const hasDanish = [..."æøåÆØÅ"].some(c => missing.has(c));
        if (hasDanish && state.layoutId === "us") {
            dom.layoutWarn.textContent = "Dette niveau kræver dansk tastaturlayout — skift øverst til højre.";
        } else {
            dom.layoutWarn.textContent = "Nogle tegn kan ikke skrives med det valgte layout: " + [...missing].join(" ");
        }
        dom.layoutWarn.classList.remove("hidden");
    }

    function renderText() {
        dom.textDisplay.innerHTML = "";
        for (let i = 0; i < state.text.length; i++) {
            const ch = state.text[i];
            const span = document.createElement("span");
            span.className = "char";
            if (ch === " ") {
                span.classList.add("space");
                span.textContent = " ";
            } else {
                span.textContent = ch;
            }
            dom.textDisplay.appendChild(span);
        }
        markCurrentChar();
    }

    function markCurrentChar() {
        const spans = dom.textDisplay.children;
        for (let i = 0; i < spans.length; i++) {
            spans[i].classList.remove("current");
        }
        if (state.pos < spans.length) {
            const el = spans[state.pos];
            el.classList.add("current");
            // Long texts run past the fold — keep the cursor in view.
            el.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
    }

    function highlightNextChar() {
        if (state.pos >= state.text.length) {
            Keyboard.clearNext();
            Hands.highlightFinger(null);
            dom.fingerName.textContent = "—";
            return;
        }
        const ch = state.text[state.pos];
        const entry = state.charMap.get(ch);
        if (!entry) {
            Keyboard.clearNext();
            Hands.highlightFinger(null);
            dom.fingerName.textContent = `? (${ch})`;
            return;
        }
        Keyboard.highlightNext(entry);
        Hands.highlightFinger(entry.finger);
        dom.fingerName.textContent = FINGER_NAMES_DA[entry.finger] || entry.finger;
    }

    function onKeyDown(e) {
        if (state.finished) return;

        // Ignore meta keys (Cmd, Win, ...), otherwise cannot e.g. switch tabs
        if (e.metaKey) return;

        // Ignore pure modifier presses.
        if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"].includes(e.key)) return;

        // Backspace disabled by design — errors are locked in.
        if (e.key === "Backspace") { e.preventDefault(); return; }

        // Ignore anything that is not a single character (arrow keys, F-keys, ...).
        if (e.key.length !== 1) return;

        e.preventDefault();

        if (!state.started) startRound();

        const expected = state.text[state.pos];
        const typed = e.key;

        if (typed === expected) {
            state.correctCount++;
            markCorrect(state.pos);
            state.pos++;
            Sound.click();
            Keyboard.flashPress(e.code, true);
            if (state.pos >= state.text.length) {
                finish();
            } else {
                highlightNextChar();
                markCurrentChar();
            }
        } else {
            state.errorCount++;
            markWrong(state.pos);
            Sound.wrong();
            Keyboard.flashPress(e.code, false);
        }
        updateStatsDisplay();
    }

    function markCorrect(i) {
        const el = dom.textDisplay.children[i];
        if (!el) return;
        el.classList.remove("wrong", "current");
        el.classList.add("correct");
    }

    function markWrong(i) {
        const el = dom.textDisplay.children[i];
        if (!el) return;
        el.classList.add("wrong");
    }

    function startRound() {
        state.started = true;
        state.startTs = performance.now();
        dom.hint.classList.add("hidden");
        state.timerId = setInterval(tick, 200);
    }

    function tick() {
        updateTimeDisplay();
        updateStatsDisplay();
    }

    /* Elapsed seconds — the round runs until the whole text is typed. */
    function elapsedSeconds() {
        if (!state.started) return 0;
        const endTs = state.finished ? state.endTs : performance.now();
        return (endTs - state.startTs) / 1000;
    }

    function updateTimeDisplay() {
        dom.statTime.textContent = String(Math.floor(elapsedSeconds()));
    }

    function stopTimer() {
        if (state.timerId) {
            clearInterval(state.timerId);
            state.timerId = null;
        }
    }

    function updateStatsDisplay() {
        const cpm = currentCpm();
        dom.statCpm.textContent = String(Math.round(cpm));
        dom.statAcc.textContent = String(Math.round(accuracy()));
        dom.statErr.textContent = String(state.errorCount);
    }

    function currentCpm() {
        if (!state.started) return 0;
        const endTs = state.finished ? state.endTs : performance.now();
        const minutes = (endTs - state.startTs) / 60000;
        if (minutes <= 0) return 0;
        return state.correctCount / minutes;
    }

    function accuracy() {
        const total = state.correctCount + state.errorCount;
        if (total === 0) return 100;
        return (state.correctCount / total) * 100;
    }

    function finish() {
        if (state.finished) return;
        state.finished = true;
        state.endTs = performance.now();
        stopTimer();
        updateTimeDisplay();
        Sound.ding();
        showResults();
    }

    function showResults() {
        const cpm = Math.round(currentCpm());
        const wpm = Math.round(cpm / 5);
        const acc = Math.round(accuracy());
        const key = STORAGE_KEY_PREFIX + state.levelIdx;
        const prev = parseInt(localStorage.getItem(key) || "0", 10) || 0;
        const best = Math.max(prev, cpm);
        if (cpm > prev) localStorage.setItem(key, String(cpm));

        dom.resultCpm.textContent = String(cpm);
        dom.resultWpm.textContent = String(wpm);
        dom.resultAcc.textContent = String(acc);
        dom.resultTime.textContent = String(Math.round(elapsedSeconds()));
        dom.resultCor.textContent = String(state.correctCount);
        dom.resultErr.textContent = String(state.errorCount);
        dom.resultBest.textContent = String(best);

        dom.overlay.classList.remove("hidden");
    }

    function closeOverlay() {
        dom.overlay.classList.add("hidden");
        dom.typingArea.focus();
    }

    return { init };
})();

document.addEventListener("DOMContentLoaded", () => App.init());
