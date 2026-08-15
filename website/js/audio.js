/* Tastaturmester — tiny WebAudio sound effects.
   Two sounds: a soft click for correct keys, a low buzz for wrong keys.
   No audio files needed. */

const Sound = (() => {
    let ctx = null;
    let enabled = false;

    function ensureCtx() {
        if (!ctx) {
            try {
                ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                ctx = null;
            }
        }
        return ctx;
    }

    function setEnabled(on) {
        enabled = on;
        if (on) ensureCtx();
    }

    function isEnabled() { return enabled; }

    function beep(frequency, durationMs, gain, type = "sine") {
        if (!enabled) return;
        const c = ensureCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type;
        osc.frequency.value = frequency;
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + durationMs / 1000);
        osc.connect(g);
        g.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + durationMs / 1000);
    }

    function click() { beep(1400, 40, 0.05, "square"); }
    function wrong() { beep(180, 140, 0.08, "sawtooth"); }
    function ding() {
        beep(880, 180, 0.1, "sine");
        setTimeout(() => beep(1320, 200, 0.1, "sine"), 120);
    }

    return { setEnabled, isEnabled, click, wrong, ding };
})();
