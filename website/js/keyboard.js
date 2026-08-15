/* Tastaturmester — keyboard + hands renderer.
   Exposes:
     Keyboard.render(layout)   — draw the on-screen keyboard for a layout
     Keyboard.highlightNext(charMapEntry) — light the next-to-press key (+ Shift)
     Keyboard.clearNext()      — remove the next-key highlight
     Keyboard.flashPress(code, correct) — brief visual feedback on a keypress
     Hands.render()            — draw the SVG hands once
     Hands.highlightFinger(finger) — light up a finger id, or null to clear
*/

const Keyboard = (() => {
    let root = null;
    let keyEls = new Map();   // code -> element
    let nextEl = null;
    let shiftEls = [];        // Shift keys (may be more than one)
    let altGrEl = null;       // AltGr key (only present on DK layout)

    function svgHomeMark() {
        return document.createElement("span");
    }

    function render(layout) {
        root = document.getElementById("keyboard");
        root.innerHTML = "";
        keyEls.clear();
        shiftEls = [];
        altGrEl = null;

        for (const row of layout.rows) {
            const rowEl = document.createElement("div");
            rowEl.className = "kb-row";

            for (const k of row) {
                const el = document.createElement("div");
                el.className = "kb-key";
                if (k.width && k.width !== 1) {
                    el.classList.add("w-" + String(k.width).replace(".", "_"));
                }
                if (k.isoEnter) el.classList.add("iso-enter");
                if (k.home) el.classList.add("home-mark");
                if (k.finger && !k.special) el.setAttribute("data-finger", k.finger);
                el.setAttribute("data-code", k.code);

                if (k.special) {
                    el.classList.add("center");
                    const main = document.createElement("span");
                    main.className = "main-char";
                    main.textContent = k.label || "";
                    el.appendChild(main);
                    if (k.code === "ShiftLeft" || k.code === "ShiftRight") {
                        shiftEls.push(el);
                    }
                    if (k.label === "Alt Gr") altGrEl = el;
                } else {
                    const shiftSpan = document.createElement("span");
                    shiftSpan.className = "shift-char";
                    shiftSpan.textContent = k.shift || "";
                    const mainSpan = document.createElement("span");
                    mainSpan.className = "main-char";
                    mainSpan.textContent = (k.code === "Space") ? "" : (k.main || "");
                    if (k.code === "Space") el.classList.add("center");
                    el.appendChild(shiftSpan);
                    el.appendChild(mainSpan);
                    if (k.altgr) {
                        const altSpan = document.createElement("span");
                        altSpan.className = "altgr-char";
                        altSpan.textContent = k.altgr;
                        el.appendChild(altSpan);
                    }
                }

                rowEl.appendChild(el);
                keyEls.set(k.code, el);
            }

            root.appendChild(rowEl);
        }
    }

    function clearNext() {
        if (nextEl) nextEl.classList.remove("next");
        for (const s of shiftEls) s.classList.remove("next-shift");
        if (altGrEl) altGrEl.classList.remove("next-shift");
        nextEl = null;
    }

    function highlightNext(entry) {
        clearNext();
        if (!entry) return;
        const el = keyEls.get(entry.code);
        if (!el) return;
        el.classList.add("next");
        nextEl = el;
        if (entry.needsShift) {
            // Highlight the Shift key on the OPPOSITE side of the target key.
            const finger = entry.finger || "";
            const preferRight = finger.startsWith("l-");
            const preferred = shiftEls.find(s => s.getAttribute("data-code") === (preferRight ? "ShiftRight" : "ShiftLeft"));
            if (preferred) preferred.classList.add("next-shift");
            else for (const s of shiftEls) s.classList.add("next-shift");
        }
        if (entry.needsAltGr && altGrEl) {
            altGrEl.classList.add("next-shift");
        }
    }

    function flashPress(code, correct) {
        const el = keyEls.get(code);
        if (!el) return;
        el.classList.add(correct ? "pressed" : "wrong");
        setTimeout(() => el.classList.remove("pressed", "wrong"), 140);
    }

    return { render, highlightNext, clearNext, flashPress };
})();

const Hands = (() => {
    /* Two SVGs are inserted once. Each finger is a <rect> with data-finger. */
    const FINGER_IDS_L = ["l-pinky", "l-ring", "l-middle", "l-index", "thumb"];
    const FINGER_IDS_R = ["thumb", "r-index", "r-middle", "r-ring", "r-pinky"];

    function buildHand(side) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "hand-svg");
        svg.setAttribute("viewBox", "0 0 130 90");

        const ids = side === "left" ? FINGER_IDS_L : FINGER_IDS_R;
        // Four fingers as vertical rects, thumb angled.
        // Left hand: fingers pinky→index left to right, thumb on right side.
        // Right hand: thumb on left, then index→pinky.
        const fingerHeights = [45, 60, 65, 55]; // pinky, ring, middle, index
        const fingerWidths = 14;
        const gap = 3;

        // Palm
        const palm = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        palm.setAttribute("class", "palm");
        palm.setAttribute("x", side === "left" ? 6 : 30);
        palm.setAttribute("y", 55);
        palm.setAttribute("width", 90);
        palm.setAttribute("height", 32);
        palm.setAttribute("rx", 10);
        svg.appendChild(palm);

        // Fingers (4)
        for (let i = 0; i < 4; i++) {
            const h = side === "left" ? fingerHeights[i] : fingerHeights[3 - i];
            const fingerId = side === "left" ? ids[i] : ids[i + 1];
            const x = side === "left"
                ? 10 + i * (fingerWidths + gap)
                : 34 + i * (fingerWidths + gap);
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("class", "finger");
            rect.setAttribute("data-finger", fingerId);
            rect.setAttribute("x", x);
            rect.setAttribute("y", 70 - h);
            rect.setAttribute("width", fingerWidths);
            rect.setAttribute("height", h + 5);
            rect.setAttribute("rx", 5);
            svg.appendChild(rect);
        }

        // Thumb
        const thumb = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        thumb.setAttribute("class", "finger");
        thumb.setAttribute("data-finger", "thumb");
        thumb.setAttribute("data-side", side);
        thumb.setAttribute("width", 16);
        thumb.setAttribute("height", 36);
        thumb.setAttribute("rx", 6);
        if (side === "left") {
            thumb.setAttribute("x", 78);
            thumb.setAttribute("y", 55);
            thumb.setAttribute("transform", "rotate(30 78 55)");
        } else {
            thumb.setAttribute("x", 36);
            thumb.setAttribute("y", 55);
            thumb.setAttribute("transform", "rotate(-30 52 55)");
        }
        svg.appendChild(thumb);

        return svg;
    }

    function render() {
        const root = document.getElementById("hands-illustration");
        root.innerHTML = "";
        root.appendChild(buildHand("left"));
        root.appendChild(buildHand("right"));
    }

    function highlightFinger(finger) {
        const root = document.getElementById("hands-illustration");
        if (!root) return;
        // Clear all first.
        root.querySelectorAll(".finger.active").forEach(el => el.classList.remove("active"));
        if (!finger) return;
        // For thumb we may highlight only one side depending on context; keep both for simplicity.
        root.querySelectorAll(`.finger[data-finger="${finger}"]`).forEach(el => el.classList.add("active"));
    }

    return { render, highlightFinger };
})();
