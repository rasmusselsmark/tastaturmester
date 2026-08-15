/* Tastaturmester — keyboard layout definitions.
   Each layout is a list of rows. A row is a list of key objects:
     - code:  KeyboardEvent.code (physical key id)
     - main:  the character produced without Shift (lowercase for letters)
     - shift: the character produced with Shift held (empty if none)
     - finger: finger identifier used for coloring + hint
     - width:  key width class (1 = base). Use one of: 1, 1.25, 1.5, 1.75, 2, 2.25, 2.75, 6.25
     - label:  optional display label for non-typing keys (Shift, Space, ...)
     - home:   true for home-row bump keys (F, J for US; F, J for DK)
     - isoEnter: renders as tall ISO Enter shape
     - special: this key is a modifier (Shift, Ctrl, ...) — not directly typeable
*/

const FINGER_NAMES_DA = {
    "l-pinky":  "venstre lillefinger",
    "l-ring":   "venstre ringfinger",
    "l-middle": "venstre langfinger",
    "l-index":  "venstre pegefinger",
    "thumb":    "tommelfinger",
    "r-index":  "højre pegefinger",
    "r-middle": "højre langfinger",
    "r-ring":   "højre ringfinger",
    "r-pinky":  "højre lillefinger"
};

/* Helper builders keep the layout data compact and readable.
   `opts.altgr` is the character produced when AltGr is held — used for
   Danish `{`, `}`, `[`, `]`, `@`, ... which aren't reachable without AltGr. */
function key(code, main, shift, finger, opts = {}) {
    return {
        code,
        main,
        shift: shift || "",
        altgr: opts.altgr || "",
        finger,
        width: opts.width || 1,
        home: !!opts.home,
        label: opts.label || "",
        isoEnter: !!opts.isoEnter,
        special: !!opts.special
    };
}

/* US ANSI layout — 4 typing rows + modifier row. */
const LAYOUT_US = {
    id: "us",
    name: "Amerikansk (US ANSI)",
    rows: [
        [
            key("Backquote",    "`", "~", "l-pinky"),
            key("Digit1",       "1", "!", "l-pinky"),
            key("Digit2",       "2", "@", "l-ring"),
            key("Digit3",       "3", "#", "l-middle"),
            key("Digit4",       "4", "$", "l-index"),
            key("Digit5",       "5", "%", "l-index"),
            key("Digit6",       "6", "^", "r-index"),
            key("Digit7",       "7", "&", "r-index"),
            key("Digit8",       "8", "*", "r-middle"),
            key("Digit9",       "9", "(", "r-ring"),
            key("Digit0",       "0", ")", "r-pinky"),
            key("Minus",        "-", "_", "r-pinky"),
            key("Equal",        "=", "+", "r-pinky"),
            key("Backspace",    "",  "",  "r-pinky", { width: 2, label: "⌫", special: true })
        ],
        [
            key("Tab",          "",  "",  "l-pinky", { width: 1.5, label: "Tab", special: true }),
            key("KeyQ",         "q", "Q", "l-pinky"),
            key("KeyW",         "w", "W", "l-ring"),
            key("KeyE",         "e", "E", "l-middle"),
            key("KeyR",         "r", "R", "l-index"),
            key("KeyT",         "t", "T", "l-index"),
            key("KeyY",         "y", "Y", "r-index"),
            key("KeyU",         "u", "U", "r-index"),
            key("KeyI",         "i", "I", "r-middle"),
            key("KeyO",         "o", "O", "r-ring"),
            key("KeyP",         "p", "P", "r-pinky"),
            key("BracketLeft",  "[", "{", "r-pinky"),
            key("BracketRight", "]", "}", "r-pinky"),
            key("Backslash",    "\\","|", "r-pinky", { width: 1.5 })
        ],
        [
            key("CapsLock",     "",  "",  "l-pinky", { width: 1.75, label: "Caps", special: true }),
            key("KeyA",         "a", "A", "l-pinky"),
            key("KeyS",         "s", "S", "l-ring"),
            key("KeyD",         "d", "D", "l-middle"),
            key("KeyF",         "f", "F", "l-index", { home: true }),
            key("KeyG",         "g", "G", "l-index"),
            key("KeyH",         "h", "H", "r-index"),
            key("KeyJ",         "j", "J", "r-index", { home: true }),
            key("KeyK",         "k", "K", "r-middle"),
            key("KeyL",         "l", "L", "r-ring"),
            key("Semicolon",    ";", ":", "r-pinky"),
            key("Quote",        "'", '"', "r-pinky"),
            key("Enter",        "",  "",  "r-pinky", { width: 2.25, label: "Enter", special: true })
        ],
        [
            key("ShiftLeft",    "",  "",  "l-pinky", { width: 2.25, label: "Shift", special: true }),
            key("KeyZ",         "z", "Z", "l-pinky"),
            key("KeyX",         "x", "X", "l-ring"),
            key("KeyC",         "c", "C", "l-middle"),
            key("KeyV",         "v", "V", "l-index"),
            key("KeyB",         "b", "B", "l-index"),
            key("KeyN",         "n", "N", "r-index"),
            key("KeyM",         "m", "M", "r-index"),
            key("Comma",        ",", "<", "r-middle"),
            key("Period",       ".", ">", "r-ring"),
            key("Slash",        "/", "?", "r-pinky"),
            key("ShiftRight",   "",  "",  "r-pinky", { width: 2.75, label: "Shift", special: true })
        ],
        [
            key("ControlLeft",  "",  "",  "l-pinky", { width: 1.25, label: "Ctrl", special: true }),
            key("AltLeft",      "",  "",  "l-pinky", { width: 1.25, label: "Alt",  special: true }),
            key("MetaLeft",     "",  "",  "l-pinky", { width: 1.25, label: "Cmd",  special: true }),
            key("Space",        " ", "",  "thumb",   { width: 6.25, label: "Mellemrum" }),
            key("MetaRight",    "",  "",  "r-pinky", { width: 1.25, label: "Cmd",  special: true }),
            key("AltRight",     "",  "",  "r-pinky", { width: 1.25, label: "Alt",  special: true }),
            key("ControlRight", "",  "",  "r-pinky", { width: 1.25, label: "Ctrl", special: true })
        ]
    ]
};

/* Danish ISO layout — includes Æ, Ø, Å and the tall ISO Enter.
   Deadkeys (´ ` ¨ ^) are marked but not used in level content — pressing them
   alone does not produce a character on a real Danish keyboard. */
const LAYOUT_DK = {
    id: "dk",
    name: "Dansk (DK ISO)",
    rows: [
        [
            key("Backquote",    "§", "½", "l-pinky"),
            key("Digit1",       "1", "!", "l-pinky"),
            key("Digit2",       "2", '"', "l-ring",  { altgr: "@" }),
            key("Digit3",       "3", "#", "l-middle",{ altgr: "£" }),
            key("Digit4",       "4", "¤", "l-index", { altgr: "$" }),
            key("Digit5",       "5", "%", "l-index", { altgr: "€" }),
            key("Digit6",       "6", "&", "r-index"),
            key("Digit7",       "7", "/", "r-index", { altgr: "{" }),
            key("Digit8",       "8", "(", "r-middle",{ altgr: "[" }),
            key("Digit9",       "9", ")", "r-ring",  { altgr: "]" }),
            key("Digit0",       "0", "=", "r-pinky", { altgr: "}" }),
            key("Minus",        "+", "?", "r-pinky"),
            key("Equal",        "´", "`", "r-pinky", { altgr: "|" }),
            key("Backspace",    "",  "",  "r-pinky", { width: 2, label: "⌫", special: true })
        ],
        [
            key("Tab",          "",  "",  "l-pinky", { width: 1.5, label: "Tab", special: true }),
            key("KeyQ",         "q", "Q", "l-pinky"),
            key("KeyW",         "w", "W", "l-ring"),
            key("KeyE",         "e", "E", "l-middle"),
            key("KeyR",         "r", "R", "l-index"),
            key("KeyT",         "t", "T", "l-index"),
            key("KeyY",         "y", "Y", "r-index"),
            key("KeyU",         "u", "U", "r-index"),
            key("KeyI",         "i", "I", "r-middle"),
            key("KeyO",         "o", "O", "r-ring"),
            key("KeyP",         "p", "P", "r-pinky"),
            key("BracketLeft",  "å", "Å", "r-pinky"),
            key("BracketRight", "¨", "^", "r-pinky"),
            key("Enter",        "",  "",  "r-pinky", { width: 1.25, label: "Enter", special: true, isoEnter: true })
        ],
        [
            key("CapsLock",     "",  "",  "l-pinky", { width: 1.75, label: "Caps", special: true }),
            key("KeyA",         "a", "A", "l-pinky"),
            key("KeyS",         "s", "S", "l-ring"),
            key("KeyD",         "d", "D", "l-middle"),
            key("KeyF",         "f", "F", "l-index", { home: true }),
            key("KeyG",         "g", "G", "l-index"),
            key("KeyH",         "h", "H", "r-index"),
            key("KeyJ",         "j", "J", "r-index", { home: true }),
            key("KeyK",         "k", "K", "r-middle"),
            key("KeyL",         "l", "L", "r-ring"),
            key("Semicolon",    "æ", "Æ", "r-pinky"),
            key("Quote",        "ø", "Ø", "r-pinky"),
            key("Backslash",    "'", "*", "r-pinky")
        ],
        [
            key("ShiftLeft",    "",  "",  "l-pinky", { width: 1.25, label: "Shift", special: true }),
            key("IntlBackslash","<", ">", "l-pinky", { altgr: "\\" }),
            key("KeyZ",         "z", "Z", "l-pinky"),
            key("KeyX",         "x", "X", "l-ring"),
            key("KeyC",         "c", "C", "l-middle"),
            key("KeyV",         "v", "V", "l-index"),
            key("KeyB",         "b", "B", "l-index"),
            key("KeyN",         "n", "N", "r-index"),
            key("KeyM",         "m", "M", "r-index"),
            key("Comma",        ",", ";", "r-middle"),
            key("Period",       ".", ":", "r-ring"),
            key("Slash",        "-", "_", "r-pinky"),
            key("ShiftRight",   "",  "",  "r-pinky", { width: 2.75, label: "Shift", special: true })
        ],
        [
            key("ControlLeft",  "",  "",  "l-pinky", { width: 1.25, label: "Ctrl", special: true }),
            key("AltLeft",      "",  "",  "l-pinky", { width: 1.25, label: "Alt",  special: true }),
            key("MetaLeft",     "",  "",  "l-pinky", { width: 1.25, label: "Cmd",  special: true }),
            key("Space",        " ", "",  "thumb",   { width: 6.25, label: "Mellemrum" }),
            key("MetaRight",    "",  "",  "r-pinky", { width: 1.25, label: "Cmd",  special: true }),
            key("AltRight",     "",  "",  "r-pinky", { width: 1.25, label: "Alt Gr", special: true }),
            key("ControlRight", "",  "",  "r-pinky", { width: 1.25, label: "Ctrl", special: true })
        ]
    ]
};

const LAYOUTS = {
    us: LAYOUT_US,
    dk: LAYOUT_DK
};

/* Build a lookup from character → {code, needsShift, needsAltGr, finger}
   so we can find where a target character lives on the current layout. */
function buildCharMap(layout) {
    const map = new Map();
    for (const row of layout.rows) {
        for (const k of row) {
            if (k.special) continue;
            if (k.main && !map.has(k.main)) {
                map.set(k.main, { code: k.code, needsShift: false, needsAltGr: false, finger: k.finger });
            }
            if (k.shift && !map.has(k.shift)) {
                map.set(k.shift, { code: k.code, needsShift: true, needsAltGr: false, finger: k.finger });
            }
            if (k.altgr && !map.has(k.altgr)) {
                map.set(k.altgr, { code: k.code, needsShift: false, needsAltGr: true, finger: k.finger });
            }
        }
    }
    return map;
}
