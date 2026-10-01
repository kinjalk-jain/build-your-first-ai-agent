# Build Your First AI Agent — a beginner's guide

A friendly, slide-style walkthrough of an **AI agent template**, told as a pizza kitchen ("Agent Kitchen").
No AI expertise needed — it explains prompts, tools, MCP, guardrails and tracing in plain language.
One file (`index.html`), no build step, no dependencies, no external requests — it works offline and on any static host.

It has two parts in the same page:
- **Slides** — the story: what an agent is, the 12 "ingredients", how to plan one, and what to do when things go wrong.
- **Handbook** (press **H**) — the same material written out in detail: folder map, setup, tools, MCP, guardrails, tracing, troubleshooting.

## Read it
Open `index.html` in a browser (or the hosted URL) and press **F** for full screen.

| Key | Does |
|---|---|
| `→` `Space` `PageDown` / click right side | next step (bullets appear one by one), then next slide |
| `←` `PageUp` / click left side | back |
| `Home` `End` | first / last slide |
| `M` | menu: jump to any slide |
| `S` | show everything on a slide at once (good for reading on your own screen) |
| `H` | open the written handbook · `H` or `Esc` returns to the slides |
| `T` | light / dark |
| `F` | full screen |
| `?` | help |

Links like `…/#i7-mcp` open a specific slide. Swipe works on phones.

## Deploy to Vercel (free)
**Option A — from GitHub (recommended: every `git push` redeploys)**
1. Push this folder to a GitHub repo (e.g. `build-your-first-ai-agent`).
2. vercel.com → *Add New… → Project* → import the repo → Framework preset **Other** → leave build settings empty → Deploy.

**Option B — Vercel CLI (no GitHub needed)**
```bash
cd build-your-first-ai-agent
npx vercel --prod          # first time: log in, accept the defaults ("Other" framework, no build command)
```

Vercel serves `index.html` at the root. Share the short production URL (`<project-name>.vercel.app`) with readers.
