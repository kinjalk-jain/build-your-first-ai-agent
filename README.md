# Build Your First AI Agent — an interactive beginner's guide

A friendly, **interactive** guide to an AI-agent template, told as a pizza kitchen ("Agent Kitchen").
No AI expertise needed. Static files only — no build step, no dependencies, no external requests — so it works offline and on any static host.

It explains the companion template, [`csqa-agentix/workshop-agent-template`](https://github.com/csqa-agentix/workshop-agent-template), and every file name, function and message in it was checked against that repo (commit `70b4bf3`).

## What's in it

| Page | File | What it does |
|---|---|---|
| **Home** `/` | `index.html` | Three doors — *never heard of agents* / *how does it really work?* / *build one now* — plus "continue where you left off". |
| **1 · Meet an agent** `/journey` | `journey.html` | Chatbot-vs-agent, a watch-it-work demo with predict-and-reveal, the loop, a scroll-driven pizza-kitchen map (kitchen words ↔ real names), a peek at the real files. ~6 min. |
| **2 · How it works** `/how-it-works` | `how-it-works.html` | *Who starts the agent?* (a "press Enter" simulator and the seven startup stages), how `agent.md` + skills + goal become one prompt, a four-zoom architecture map, a **recorded-run player** with scrubber, the **tool-call gearbox** with four "break it" scenarios, *where is my file used?*, and *run it end to end*. ~12 min. |
| **3 · Build yours** `/build` | `build.html` | A 20-step checklist that remembers your progress (OS-aware commands, copy buttons) and a **blueprint builder** that writes `agent.md`, `agent.toml`, `guardrails.toml` and `goal.md` for you. ~1 hour. |
| **4 · Handbook** `/handbook` | `handbook.html` → `present.html#hb-map` | The full written reference (folder maps, MCP, guardrails, tracing, troubleshooting, words explained). |
| **Present** `/present` | `present.html` | The original click-through slide deck, kept for workshops. Old links such as `/#i7-mcp` and `/#hb-mcp` are redirected here. |

Shared code lives in `assets/`: `site.css` / `site.js` (top bar, theme, saved progress, glossary tooltips, first-visit tip), plus one stylesheet/script pair per page. `assets/diagram.js` is the architecture diagram used twice on the *How it works* page.

## Design rules it follows

- **Three layers per idea:** *Glance* (a picture and one sentence) → *Play* (click, step, scrub, break it) → *Dive* (real code and GitHub links, folded away).
- **Scroll, don't click-click-click.** Arrow keys jump between sections; each chapter ends with a big **Next** card; a sticky bar shows where you are.
- **Honest examples.** The runs are *recorded* and labelled as such — they are simplified from the template's real log format, never presented as live model output.
- Works on phones, in dark mode, with the keyboard, and with `prefers-reduced-motion`. Reading works without JavaScript; interactions need it.

| Key | Does |
|---|---|
| `→` / `←` | jump to the next / previous section |
| `?` | how to get around |
| `T` | light / dark |
| `Esc` | close help |

The slide deck (`/present`) keeps its own keys: `→` `Space` next · `←` back · `M` menu · `S` show all · `H` handbook · `T` theme · `F` full screen · `?` help.

## Run it locally

```bash
python3 -m http.server 8000      # then open http://localhost:8000
```

(Any static server works; `vercel.json` turns on clean URLs so `/how-it-works` resolves to `how-it-works.html`.)

## Updating the content

- The template repo address is set once in `assets/site.js` (`REPO`, `BRANCH`) and in `present.html`.
- `assets/diagram.js` holds the architecture (nodes, edges, per-box explanations). `assets/how.js` holds the recorded run, the stages and the gearbox scenarios.
- If the template changes, re-check the file names, function names and quoted messages, then update the commit shown at the bottom of *How it works*.

## Deploy to Vercel (free)

**From GitHub (recommended: every `git push` redeploys)**
1. Push this folder to a GitHub repo.
2. vercel.com → *Add New… → Project* → import the repo → Framework preset **Other** → leave build settings empty → Deploy.

**Vercel CLI**
```bash
npx vercel --prod      # first time: log in, accept the defaults ("Other" framework, no build command)
```

Vercel serves `index.html` at the root. Share the short production URL (`<project-name>.vercel.app`).
