/* Build Your First AI Agent — shared behaviour: top bar, theme, progress, glossary, coach, helpers. Plain JS, no deps. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.add("js");

  // ── storage (every call guarded: private windows / blocked storage must not break the page) ──
  const KEY = "byfa-v1";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  const store = {
    get(path, d) { let o = read(); for (const k of path.split(".")) { if (o == null) return d; o = o[k]; } return o == null ? d : o; },
    set(path, val) { const o = read(); let c = o; const ks = path.split("."); ks.slice(0, -1).forEach(k => { c = c[k] = c[k] || {}; }); c[ks.at(-1)] = val; write(o); },
  };

  const REPO = "https://github.com/csqa-agentix/workshop-agent-template", BRANCH = "main";
  const gh = (p, dir) => `${REPO}/${dir ? "tree" : "blob"}/${BRANCH}/${p}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PAGES = [
    { id: "journey", href: "journey.html", label: "Meet an agent", n: 1 },
    { id: "how", href: "how-it-works.html", label: "How it works", n: 2 },
    { id: "build", href: "build.html", label: "Build yours", n: 3 },
    { id: "ref", href: "handbook.html", label: "Handbook", n: 4 },
  ];

  // ── glossary ──────────────────────────────────────────────────────────────────
  const GLOSSARY = {
    "agent": "An AI that is given a goal and works toward it by itself: it picks tools, looks at the results, and decides the next step.",
    "model": "The AI “brain” (a large language model). It reads text and writes text. It lives on a server; your program talks to it over the internet.",
    "prompt": "Plain-English instructions for the model. The clearer and more specific they are, the better it behaves.",
    "system prompt": "The standing instructions the model sees at the start of every call: general rules + your job description + skills.",
    "tool": "An ordinary program function the agent can ask to run, like “read a file”. It returns real output, never a guess.",
    "tool call": "The model writing “please run read_file with path=notes.md”. The model never runs anything itself — the program does.",
    "MCP": "Model Context Protocol: a standard plug so any agent can use any tool server, like a USB port for tools.",
    "guardrail": "A rule enforced by code (not by asking nicely) that stops the agent from doing what it must never do.",
    "API key": "A secret password that proves to the model service that the request is yours. It lives in .env and nowhere else.",
    "workspace": "The folder of files the agent can see. Every run works on a copy, so your originals stay safe.",
    "trace": "An automatic recording of every step of a run, so you can replay what the agent did and why.",
    "A2A": "Agent2Agent: a standard way for one program (or agent) to call another by web address.",
    "skill": "A markdown file of reusable know-how (a checklist, a decision table) that is added to the agent's prompt.",
    "turn": "One round of the loop: the model decides, tools run, results go back.",
    "loop": "The repeat: ask the model → run the tools it asks for → show it the results → ask again, until it answers without a tool.",
    "subprocess": "A separate program started in the background by your program. Here: the tool server.",
    "stdio": "Standard input/output: the plain text pipe two programs on one computer use to talk to each other.",
    "JSON": "A simple text format for structured data, like {\"path\": \"notes.md\"}.",
    "schema": "A description of the arguments a tool accepts (names and types). The model reads it to call the tool correctly.",
    "docstring": "The sentence in triple quotes under a Python function. The model reads it to decide when to use the tool.",
    "token": "A chunk of text, roughly ¾ of a word. Models read and write tokens, and free tiers limit how many you can use.",
    "prompt injection": "Hidden instructions inside a file or web page that try to trick the agent. Guardrails treat file text as data, never as orders.",
    "environment": "A private Python toolbox (.venv) so this project's packages don't mix with others. Switch it on in every new terminal.",
    ".env": "A private file of settings and secrets. It is git-ignored: never share it, never paste it into a chat.",
    "stateless": "The model remembers nothing between calls. That's why the program re-sends the whole conversation each time.",
  };
  const popup = document.createElement("div");
  popup.className = "gpop"; popup.setAttribute("role", "tooltip"); popup.id = "gpop";
  document.addEventListener("DOMContentLoaded", () => document.body.append(popup));
  let popFor = null;
  const showPop = el => {
    const key = el.dataset.g, def = GLOSSARY[key] || GLOSSARY[key.toLowerCase()];
    if (!def) return;
    popFor = el; popup.innerHTML = `<b>${esc(key)}</b>${esc(def)}`; popup.classList.add("on");
    el.setAttribute("aria-describedby", "gpop");
    const r = el.getBoundingClientRect(), w = popup.offsetWidth, h = popup.offsetHeight;
    let x = r.left + scrollX + r.width / 2 - w / 2; x = Math.max(8 + scrollX, Math.min(x, scrollX + innerWidth - w - 8));
    let y = r.top + scrollY - h - 10; if (r.top - h - 10 < 64) y = r.bottom + scrollY + 10;
    popup.style.left = x + "px"; popup.style.top = y + "px";
  };
  const hidePop = () => { popup.classList.remove("on"); popFor = null; };
  const wireGlossary = (scope = document) => $$("[data-g]", scope).forEach(el => {
    if (el.dataset.gw) return; el.dataset.gw = 1; el.classList.add("g-t"); el.tabIndex = 0;
    el.addEventListener("mouseenter", () => showPop(el)); el.addEventListener("mouseleave", hidePop);
    el.addEventListener("focus", () => showPop(el)); el.addEventListener("blur", hidePop);
    el.addEventListener("click", e => { e.stopPropagation(); popFor === el ? hidePop() : showPop(el); });
  });
  document.addEventListener("click", hidePop);

  // ── theme ─────────────────────────────────────────────────────────────────────
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  try { const t = localStorage.getItem("kitchen-theme"); if (t) root.dataset.theme = t; } catch (e) {}
  const toggleTheme = () => { root.dataset.theme = isDark() ? "light" : "dark"; try { localStorage.setItem("kitchen-theme", root.dataset.theme); } catch (e) {} };

  // ── top bar ───────────────────────────────────────────────────────────────────
  function renderTopbar(page) {
    const bar = $("#topbar"); if (!bar) return;
    const done = store.get("done", {});
    bar.className = "topbar";
    bar.innerHTML = `<a class="brand" href="index.html" aria-label="Home"><b>🍕</b><span>Build Your First AI Agent</span></a>
      <nav class="tnav" aria-label="Chapters">${PAGES.map(p => `<a href="${p.href}"${p.id === page ? ' aria-current="page"' : ""}>${p.id !== "ref" && done[p.id] ? '<span class="tick" title="Done">✓</span>' : `<span>${p.n}</span>`} ${p.label}</a>`).join("")}</nav>
      <a class="tbtn opt" href="present.html" title="The original slide deck, for presenting">▶ Present</a>
      <button class="tbtn" id="tHelp" title="Help (?)" aria-label="Help">?</button>
      <button class="tbtn" id="tTheme" title="Light / dark" aria-label="Toggle light or dark">🌓</button>
      <div class="pbar" id="pbar"></div>`;
    const cur = $(".tnav a[aria-current]", bar); if (cur) { const n = $(".tnav", bar); n.scrollLeft = cur.offsetLeft - n.clientWidth / 2 + cur.clientWidth / 2; }
    $("#tTheme").onclick = toggleTheme; $("#tHelp").onclick = () => toggleHelp();
    const upd = () => { const h = root.scrollHeight - innerHeight; $("#pbar").style.width = (h > 0 ? scrollY / h * 100 : 0) + "%"; };
    addEventListener("scroll", upd, { passive: true }); upd();
  }

  // ── help + coach ──────────────────────────────────────────────────────────────
  function buildHelp() {
    const h = document.createElement("div"); h.className = "helpbox"; h.id = "helpbox"; h.setAttribute("role", "dialog"); h.setAttribute("aria-label", "How to get around");
    h.innerHTML = `<div><h3>How to get around</h3>
      <p><b>Scroll</b> — that's it. Or press <kbd>→</kbd> / <kbd>←</kbd> to jump between sections.</p>
      <p>At the end of every chapter a big <b>Next</b> card takes you onward.</p>
      <p>Dotted words <span class="g-t" style="border-color:var(--cheese)">like this</span> explain themselves — hover, focus or tap them.</p>
      <p>Anything marked <b>Show real code</b> is optional depth. <kbd>T</kbd> light/dark · <kbd>?</kbd> this help · <kbd>Esc</kbd> close.</p>
      <p><button class="btn sm" style="background:var(--cheese);border-color:var(--cheese);color:#2a1c12" id="helpOk">Got it</button></p></div>`;
    document.body.append(h);
    h.onclick = e => { if (e.target === h || e.target.id === "helpOk") toggleHelp(false); };
  }
  const toggleHelp = on => { const h = $("#helpbox"); if (h) h.classList.toggle("on", on); };
  function buildCoach() {
    if (store.get("coach", false)) return;
    const c = document.createElement("aside"); c.className = "coach"; c.setAttribute("role", "dialog"); c.setAttribute("aria-label", "Quick tip");
    c.innerHTML = `<span class="mouse" aria-hidden="true"></span><h4>Quick tip 👋</h4>
      <p><b>Just scroll.</b> Or press <kbd>→</kbd> to jump to the next section. At the end of each chapter, tap the big <b>Next</b> card.</p>
      <div class="row"><button class="btn" id="coachOk">Got it</button><button class="skip" id="coachHelp">More tips</button></div>`;
    document.body.append(c);
    const close = () => { c.classList.remove("on"); store.set("coach", true); setTimeout(() => c.remove(), 600); };
    $("#coachOk", c).onclick = close; $("#coachHelp", c).onclick = () => { close(); toggleHelp(true); };
    setTimeout(() => c.classList.add("on"), 1100);
    addEventListener("scroll", () => { if (scrollY > 220) close(); }, { passive: true, once: true });
  }

  // ── keyboard: → ← jump sections ───────────────────────────────────────────────
  function wireKeys() {
    addEventListener("keydown", e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target; if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      const k = e.key;
      if (k === "?") { toggleHelp(); return; }
      if (k === "Escape") { toggleHelp(false); hidePop(); return; }
      if (k.toLowerCase() === "t") { toggleTheme(); return; }
      if (k !== "ArrowRight" && k !== "ArrowLeft") return;
      if (t && t.closest && t.closest("[data-keys-own]")) return;
      const secs = $$("main .sec, main .hero").filter(s => s.offsetParent !== null);
      const y = scrollY + innerHeight * 0.25; let cur = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top + scrollY <= y) cur = i; });
      const to = secs[k === "ArrowRight" ? Math.min(cur + 1, secs.length - 1) : Math.max(cur - 1, 0)];
      if (to) { e.preventDefault(); to.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" }); }
    });
  }

  // ── reveal + progress tracking ────────────────────────────────────────────────
  function wireReveal() {
    const els = $$(".reveal"); if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach(e => io.observe(e));
  }
  function trackProgress(page) {
    if (!("IntersectionObserver" in window)) return;
    const secs = $$("main .sec[id]");
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      const h = $("h2", en.target);
      store.set("last", { page, id: en.target.id, title: (en.target.dataset.title || (h && h.textContent) || "").trim() });
    }), { rootMargin: "-40% 0px -55% 0px" });
    secs.forEach(s => io.observe(s));
    const end = $("[data-chapter-end]");
    if (end) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { store.set("done." + page, true); renderTopbar(page); o.disconnect(); } }, { threshold: .4 }).observe(end);
  }

  // ── helpers pages can use ─────────────────────────────────────────────────────
  function seg(el, cb, initial) {
    const btns = $$("button", el);
    const set = v => { btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.v === v ? "true" : "false")); cb && cb(v); };
    btns.forEach(b => b.addEventListener("click", () => set(b.dataset.v)));
    set(initial || (btns.find(b => b.getAttribute("aria-pressed") === "true") || btns[0]).dataset.v);
    return set;
  }
  function scrolly(rootEl, cb) {
    const steps = $$(".step", rootEl); if (!steps.length) return;
    const on = i => { steps.forEach((s, j) => s.classList.toggle("on", i === j)); cb(i, steps[i]); };
    if (!("IntersectionObserver" in window)) { on(0); return; }
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) on(steps.indexOf(en.target)); }),
      { rootMargin: innerWidth < 860 ? "-48% 0px -40% 0px" : "-42% 0px -42% 0px" });
    steps.forEach(s => io.observe(s)); on(0);
  }
  function wireCopy() {
    document.addEventListener("click", e => {
      const b = e.target.closest(".copy"); if (!b) return;
      const src = b.dataset.copy != null ? b.dataset.copy : ($("pre", b.parentElement) || {}).innerText || "";
      const text = src.replace(/^\$ /gm, "");
      const done = () => { const o = b.textContent; b.textContent = "Copied ✓"; setTimeout(() => (b.textContent = o), 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
      else { const t = document.createElement("textarea"); t.value = text; document.body.append(t); t.select(); try { document.execCommand("copy"); } catch (x) {} t.remove(); done(); }
    });
  }
  function typeLines(el, lines, { speed = 14, pause = 380, loop = false } = {}) {
    // typewriter for hero terminals; lines = [{html, type:true|false}]
    let alive = true; el.innerHTML = "";
    if (reduced()) { lines.forEach(l => { const row = document.createElement("span"); row.className = "tl"; row.innerHTML = l.html; el.append(row); }); return () => {}; }
    const run = async () => {
      do {
        el.innerHTML = "";
        for (const l of lines) {
          const row = document.createElement("span"); row.className = "tl"; el.append(row);
          if (reduced() || !l.type) row.innerHTML = l.html; else {
            const tmp = document.createElement("div"); tmp.innerHTML = l.html; const txt = tmp.textContent; row.textContent = "";
            for (let i = 0; i < txt.length && alive; i++) { row.textContent += txt[i]; await new Promise(r => setTimeout(r, speed)); }
            row.innerHTML = l.html;
          }
          await new Promise(r => setTimeout(r, pause));
          if (!alive) return;
        }
        if (loop && !reduced()) await new Promise(r => setTimeout(r, 3200));
      } while (loop && alive && !reduced());
    };
    run(); return () => { alive = false; };
  }

  function init({ page }) {
    const go = () => {
      renderTopbar(page); buildHelp(); wireGlossary(); wireKeys(); wireReveal(); wireCopy();
      if (page !== "home") trackProgress(page);
      buildCoach();
    };
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
  }

  window.Site = { init, $, $$, store, gh, esc, seg, scrolly, reduced, wireGlossary, typeLines, REPO, PAGES, GLOSSARY, toggleHelp };
})();
