# Agent Kitchen — the workshop guide

A single-page, slide-style walkthrough of the **workshop agent template** (`../workshop-agent-template`), told as a pizza kitchen.
One file (`index.html`), no build step, no dependencies, no external requests — it works offline and on any static host.

## Present it
Open `index.html` in a browser (or the hosted URL) and press **F** for full screen.

| Key | Does |
|---|---|
| `→` `Space` `PageDown` / click right side | next step (bullets appear one by one), then next slide |
| `←` `PageUp` / click left side | back |
| `Home` `End` | first / last slide |
| `M` | menu: jump to any slide |
| `S` | show everything on a slide at once (good for people reading on their own screen) |
| `T` | light / dark |
| `F` | full screen |
| `?` | help |

Links like `…/#i7-mcp` open a specific slide. Swipe works on phones.

## Deploy to Vercel (free)
**Option A — drag and drop / CLI**
```bash
cd workshop-agent-template-guide
npx vercel --prod          # first time: log in, accept the defaults ("Other" framework, no build command)
```
**Option B — from GitHub**
1. Push this folder to a GitHub repo.
2. vercel.com → *Add New… → Project* → import the repo → Framework preset **Other** → Deploy.

Vercel serves `index.html` at the root. Share that URL with participants.
