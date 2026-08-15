/* Tastaturmester — level definitions.
   Each level has:
     - title:       shown in the level header (Danish)
     - description: short goal sentence (Danish)
     - generate():  returns the text to type for one round
   Levels 1–12 build up letter-by-letter drills.
   Levels 13–17 add capitals, Danish letters, punctuation and numbers.
   Levels 18–20 are curated Danish sample texts. */

/* Deterministic-ish random helpers — we do not need a seedable RNG. */
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleWords(arr, count) {
    const out = [];
    for (let i = 0; i < count; i++) out.push(pick(arr));
    return out.join(" ");
}

/* Build a drill from a small character set: groups of 3–5 chars, spaced. */
function drill(chars, groupCount = 40, minLen = 3, maxLen = 5) {
    const groups = [];
    for (let i = 0; i < groupCount; i++) {
        const len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
        let g = "";
        for (let j = 0; j < len; j++) g += pick(chars);
        groups.push(g);
    }
    return groups.join(" ");
}

/* Common Danish short words (built from letters we've introduced). */
const WORDS_HOME_ROW = ["as", "la", "sal", "dal", "hal", "dag", "lag", "jag", "gal", "kald", "hals", "flad", "glad", "skal", "hals"];
const WORDS_LETTERS  = ["hus", "bil", "kat", "hund", "sol", "sne", "vand", "bog", "brød", "mor", "far", "ven", "hjem", "leg", "fisk", "regn", "vind", "sky", "træ", "gul", "rød", "blå", "sort", "hvid", "stor", "lille", "hurtig", "langsom", "smuk", "god", "dag", "nat", "time", "år", "måned", "uge"];
const WORDS_SENTENCES = [
    "Solen skinner på den grønne mark.",
    "Katten sover ved vinduet.",
    "Vi cykler til stranden hver morgen.",
    "Blomsterne dufter i haven.",
    "Bogen ligger på bordet ved lampen.",
    "Hunden løber efter bolden.",
    "Vandet er koldt og klart om vinteren.",
    "Familien spiser aftensmad sammen.",
    "Fuglene synger tidligt om morgenen.",
    "Regnen falder blidt mod ruden."
];

const HC_ANDERSEN = "Der kom en soldat marcherende hen ad landevejen: en, to! en, to! Han havde sit tornyster på ryggen og en sabel ved siden, for han havde været i krigen, og nu skulle han hjem. Så mødte han en gammel heks på landevejen; hun var så ækel, hendes underlæbe hang hende lige ned på brystet.";

const H_C_LONG = "Det er meget godt at rejse ud i den vide verden, sagde ællingen. Rundt om løb der marker med korn, og det gule korn stod så prægtigt i solskinnet. Storken gik på sine lange røde ben og snakkede ægyptisk, for det sprog havde han lært af sin moder. Der var langt fra mark til mark, og bag ved dem strakte skoven sig med dybe søer.";

/* Sentence-level Danish practice (with punctuation, capitals, æøå). */
const PARAGRAPH_MID = "Livet er som en lang rejse, hvor hver dag byder på nye oplevelser. Nogle dage er lette og fyldt med glæde, mens andre kræver mere af os. Det vigtige er at blive ved med at gå fremad og lære undervejs.";

const LEVELS = [
    {
        title: "Niveau 1 — Pegefingre",
        description: "Startposition: venstre pegefinger på F, højre på J. Skift mellem F og J med mellemrum.",
        generate: () => drill("fj".split(""), 30, 3, 5)
    },
    {
        title: "Niveau 2 — Langfingre",
        description: "Tilføj D og K. Hold pegefingrene på F og J som udgangspunkt.",
        generate: () => drill("fjdk".split(""), 30, 3, 5)
    },
    {
        title: "Niveau 3 — Ringfingre",
        description: "Tilføj S og L. Nu bruger du seks fingre.",
        generate: () => drill("fjdksl".split(""), 30, 3, 5)
    },
    {
        title: "Niveau 4 — Lillefingre",
        description: "Tilføj A og de tilstødende bogstaver. Hele hjemmerækken er nu i spil.",
        generate: () => drill("asdfjkla".split(""), 30, 3, 5)
    },
    {
        title: "Niveau 5 — Hjemmerækken",
        description: "Bogstaverne G og H tilføjes. Pegefingrene rækker ind mod midten.",
        generate: () => drill("asdfghjkl".split(""), 30, 3, 5)
    },
    {
        title: "Niveau 6 — Første ord",
        description: "Små ord fra hjemmerækken. Prøv at bevare rolig rytme.",
        generate: () => shuffleWords(WORDS_HOME_ROW, 30)
    },
    {
        title: "Niveau 7 — Øverste række",
        description: "Ræk op efter E, I, R og U. Fingrene vender tilbage til hjemmerækken bagefter.",
        generate: () => drill("asdfghjkleirfu".split(""), 30, 3, 5)
    },
    {
        title: "Niveau 8 — Mere top",
        description: "Tilføj T, Y, W og O. Halvdelen af de mest brugte bogstaver er nu med.",
        generate: () => drill("asdfghjkleirfutywo".split(""), 30, 3, 5)
    },
    {
        title: "Niveau 9 — Q og P",
        description: "De to yderste bogstaver på øverste række. Brug lillefingrene.",
        generate: () => drill("qwertyuiopasdfghjkl".split(""), 30, 3, 5)
    },
    {
        title: "Niveau 10 — Nederste række",
        description: "Ræk ned efter V, B, N og M. Pegefingre gør arbejdet.",
        generate: () => drill("asdfghjklvbnm".split(""), 30, 3, 5)
    },
    {
        title: "Niveau 11 — Alle bogstaver",
        description: "Nu har du hele alfabetet a-z. Blandet drill med tilfældige bogstaver.",
        generate: () => drill("abcdefghijklmnopqrstuvwxyz".split(""), 30, 3, 5)
    },
    {
        title: "Niveau 12 — Rigtige ord",
        description: "Almindelige danske ord uden æ, ø, å endnu.",
        generate: () => shuffleWords(WORDS_LETTERS.filter(w => !/[æøå]/.test(w)), 25)
    },
    {
        title: "Niveau 13 — Store bogstaver",
        description: "Brug Shift med modsatte hånd. Skift kun mellem store og små når det er nødvendigt.",
        generate: () => {
            const words = [];
            for (let i = 0; i < 20; i++) {
                const w = pick(WORDS_LETTERS.filter(w => !/[æøå]/.test(w)));
                words.push(w[0].toUpperCase() + w.slice(1));
            }
            return words.join(" ");
        }
    },
    {
        title: "Niveau 14 — Æ, Ø og Å",
        description: "De danske bogstaver ligger på højre lillefinger og ringfinger. Vælg dansk layout for korrekt fremhævning.",
        generate: () => drill("asdfghjklæøå".split(""), 25, 3, 5)
    },
    {
        title: "Niveau 15 — Danske ord",
        description: "Almindelige danske ord med æ, ø og å.",
        generate: () => shuffleWords(WORDS_LETTERS, 25)
    },
    {
        title: "Niveau 16 — Tegnsætning",
        description: "Punktum og komma. Punktum står på højre ringfinger, komma på højre langfinger.",
        generate: () => {
            const words = [];
            for (let i = 0; i < 18; i++) {
                let w = pick(WORDS_LETTERS);
                if (i % 4 === 3) w += ".";
                else if (i % 4 === 1) w += ",";
                words.push(w);
            }
            return words.join(" ");
        }
    },
    {
        title: "Niveau 17 — Tal",
        description: "Cifre på taltasterne. Hold hænderne så tæt på hjemmerækken som muligt.",
        generate: () => {
            const groups = [];
            for (let i = 0; i < 25; i++) {
                let g = "";
                const len = 3 + Math.floor(Math.random() * 3);
                for (let j = 0; j < len; j++) g += Math.floor(Math.random() * 10);
                groups.push(g);
            }
            return groups.join(" ");
        }
    },
    {
        title: "Niveau 18 — Korte sætninger",
        description: "Fuldstændige danske sætninger med tegnsætning og store bogstaver.",
        generate: () => {
            const sentences = [];
            for (let i = 0; i < 4; i++) sentences.push(pick(WORDS_SENTENCES));
            return sentences.join(" ");
        }
    },
    {
        title: "Niveau 19 — Længere tekst",
        description: "Et helt afsnit på dansk med varieret tegnsætning.",
        generate: () => PARAGRAPH_MID
    },
    {
        title: "Niveau 20 — Klassisk dansk",
        description: "Et uddrag fra H. C. Andersens eventyr. Det ultimative niveau.",
        generate: () => Math.random() < 0.5 ? HC_ANDERSEN : H_C_LONG
    }
];
