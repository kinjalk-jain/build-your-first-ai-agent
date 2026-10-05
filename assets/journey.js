/* /journey — "Meet an agent". Examples are recorded and simplified; file names and facts are from
   csqa-agentix/workshop-agent-template @ 70b4bf3. */
(() => {
  const { $, $$, esc, gh, seg } = Site;
  const reduced = Site.reduced;
  const chip = (p, dir, label) => `<a class="chip${dir ? " dir" : ""}" href="${gh(p, dir)}" target="_blank" rel="noopener noreferrer" title="Open on GitHub">${esc(label || p)}</a>`;

  // ═══════════════════════════════════════════════════════════════════════════════
  // 1 · chatbot vs agent
  // ═══════════════════════════════════════════════════════════════════════════════
  (function compare() {
    const out = $("#cmpOut"); if (!out) return;
    let timers = [];
    const AG = [
      ["THINK", "Let me see what's in the folder."],
      ["ACT", "<code>list_files(\".\")</code>"],
      ["OBSERVE", "3 files: <code>project_overview.md</code>, <code>meeting_notes.md</code>, <code>inventory.csv</code>"],
      ["ACT", "<code>read_file</code> × 3 — all at once"],
      ["FINAL", "Project Lighthouse launches <b>12 March</b>. Biggest risk: the old order database is slow (searches may take over 5 seconds). Nobody has decided who trains the support teams."],
    ];
    const render = v => {
      timers.forEach(clearTimeout); timers = [];
      if (v === "bot") {
        out.className = "reply bot";
        out.innerHTML = `<div class="who">💬 A chatbot</div><p>I can't see your computer or your folder — I only know what you type to me. But here's how you could do it yourself:</p>
          <ol><li>Open the folder and list the files.</li><li>Read each one.</li><li>Write down the key points.</li></ol><div class="sad">😕 Helpful advice — but <b>you</b> still have to do all the work.</div>`;
      } else {
        out.className = "reply agent";
        out.innerHTML = `<div class="who">🤖 An agent</div><div id="cmpRows"></div>`;
        const rows = $("#cmpRows", out);
        AG.forEach(([t, x], i) => timers.push(setTimeout(() => {
          rows.insertAdjacentHTML("beforeend", `<div class="tlrow"><span class="tag ${t}">${t}</span><span class="tx">${x}</span></div>`);
          if (i === AG.length - 1) rows.insertAdjacentHTML("beforeend", `<div class="win">✅ It <b>did</b> the work — and every fact came from a real file, not a guess.</div>`);
        }, reduced() ? 0 : 350 + i * 900)));
      }
    };
    seg($("#cmpSeg"), render, "bot");
    if ("IntersectionObserver" in window) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); setTimeout(() => { if (!window.__cmpTouched) $("#cmpSeg button[data-v=agent]").click(); }, 1600); } }, { threshold: .6 }).observe($("#cmp"));
    $$("#cmpSeg button").forEach(b => b.addEventListener("click", () => { window.__cmpTouched = true; }));
  })();

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2 · demo with predict-and-reveal
  // ═══════════════════════════════════════════════════════════════════════════════
  const DEMOS = {
    brief: { label: "📋 Brief me on this folder", goal: "Brief me on what is in the workspace. Write the briefing to output/briefing.md.", steps: [
      { t: "THINK", x: "I should look at what's in the folder first.", why: "Nobody told it to start here — its job description says “Discover” comes first." },
      { t: "ACT", x: "<code>list_files(path=\".\")</code>", why: "A <span data-g=\"tool call\">tool call</span>: the model only <i>asks</i>; the program runs it." },
      { t: "OBSERVE", x: "<code>inventory.csv</code> · <code>meeting_notes.md</code> · <code>project_overview.md</code> (and an empty <code>output/</code> folder)", why: "Real output, straight from the folder." },
      { predict: { q: "The agent now knows the file names. What would <b>you</b> do next?", opts: [
        ["Write the briefing right away", false, "Tempting — but it hasn't read anything yet. Agents are told never to invent facts: every claim must come from a tool result."],
        ["Read the files", true, "Exactly. It knows the names now, so it reads them — all three at once, because they don't depend on each other."],
        ["Ask you which file to read", false, "Nobody is there to answer while it works, so it's told to decide for itself. That's what “autonomous” means."]] } },
      { t: "THINK", x: "Three small files. Read them together.", why: "Chosen <i>because of</i> what it just saw — this is tool chaining." },
      { t: "ACT", x: "<code>read_file</code> × 3 — at the same time", why: "Independent requests run in parallel." },
      { t: "OBSERVE", x: "Launch <b>12 March</b> · budget 40,000 EUR (22,000 spent) · main risk: slow old database · nobody owns the training plan", why: "Facts from three real files." },
      { t: "THINK", x: "I have enough. Save the briefing under <code>output/</code>.", why: "It knows only <code>output/</code> is writable — a guardrail it was told about." },
      { t: "ACT", x: "<code>write_file(path=\"output/briefing.md\", …)</code>" },
      { t: "OBSERVE", x: "Wrote 543 characters to output/briefing.md", why: "The tool reports what it really did." },
      { t: "FINAL", x: "Project Lighthouse launches 12 March. Biggest risk: the old order database is slow. Briefing saved to <code>output/briefing.md</code> — a human still needs to decide who trains the support teams.", why: "No tool requested → this is the final answer. The loop stops." },
    ] },
    owners: { label: "🔎 Who owns what?", goal: "Which tasks in inventory.csv have no owner?", steps: [
      { t: "THINK", x: "The tasks are probably in <code>inventory.csv</code>. Let me read it.", why: "A different goal, so a different first move." },
      { t: "ACT", x: "<code>read_file(path=\"inventory.csv\")</code>" },
      { t: "OBSERVE", x: "6 lines: <code>item, owner, status, due</code> — then five tasks", why: "Real output, with line numbers." },
      { t: "THINK", x: "Row 5, “Training plan”, has an empty owner column. Let me double-check with a search.", why: "It checks its own reading instead of trusting a glance." },
      { t: "ACT", x: "<code>search_text(pattern=\"^[^,]+,,\")</code>", why: "A <i>different</i> tool this time — the agent picks what fits." },
      { t: "OBSERVE", x: "<code>inventory.csv:5: Training plan,,not started,</code>", why: "One match — the proof." },
      { t: "FINAL", x: "Exactly one task has no owner: <b>Training plan</b> (not started). Everyone else is assigned.", why: "Seven steps instead of eleven — nobody scripted the path." },
    ] },
  };
  (function demo() {
    const host = $("#demo"); if (!host) return;
    host.innerHTML = `<div class="dm-top"><span class="lbl" style="font:700 .72em var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Pick a goal</span><div class="seg" id="dmSeg" role="group" aria-label="Pick a goal">${Object.entries(DEMOS).map(([k, d]) => `<button data-v="${k}">${esc(d.label)}</button>`).join("")}</div><span class="badge rec">Recorded example</span></div>
      <div class="dm-goal"><small>The goal</small><span id="dmGoal"></span></div><div class="dm-feed" id="dmFeed" aria-live="polite"></div>
      <div class="dm-ctl"><button class="btn sm pri" id="dmNext">Next ▶</button><button class="btn sm ghost" id="dmRestart">↺ Restart</button><span class="cnt" id="dmCnt"></span></div>`;
    const feed = $("#dmFeed", host), nextBtn = $("#dmNext", host);
    let key = "brief", i = 0, locked = false;
    const load = k => { key = k; i = 0; locked = false; feed.innerHTML = ""; $("#dmGoal", host).textContent = DEMOS[k].goal; nextBtn.disabled = false; nextBtn.textContent = "Next ▶"; count(); };
    const count = () => { const n = DEMOS[key].steps.filter(s => !s.predict).length, done = DEMOS[key].steps.slice(0, i).filter(s => !s.predict).length; $("#dmCnt", host).textContent = `${done} / ${n} steps`; };
    const step = () => {
      const D = DEMOS[key]; if (locked || i >= D.steps.length) return;
      const s = D.steps[i];
      if (s.predict) {
        const p = s.predict; locked = true; nextBtn.disabled = true;
        feed.insertAdjacentHTML("beforeend", `<div class="predict" id="pred"><h4>🤔 Your turn to predict</h4><p style="margin:0">${p.q}</p><div class="opts">${p.opts.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}. ${o[0]}</button>`).join("")}</div><p class="fb" id="predFb"></p></div>`);
        $$("#pred .opt").forEach(b => b.onclick = () => {
          const o = p.opts[+b.dataset.j]; $$("#pred .opt").forEach(x => { x.disabled = true; if (p.opts[+x.dataset.j][1]) x.classList.add("right"); });
          if (!o[1]) b.classList.add("wrong");
          $("#predFb").innerHTML = (o[1] ? "✅ " : "💡 ") + o[2]; locked = false; nextBtn.disabled = false; Site.wireGlossary(feed); i++; count();
          $("#pred").scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
        });
        $("#pred").scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
        return;
      }
      feed.insertAdjacentHTML("beforeend", `<div class="dm-card"><span class="tag ${s.t}">${s.t}</span><div class="tx">${s.x}</div>${s.why ? `<div class="why">💡 ${s.why}</div>` : ""}</div>`);
      Site.wireGlossary(feed); i++; count();
      feed.lastElementChild.scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
      if (i >= D.steps.length) {
        nextBtn.disabled = true; nextBtn.textContent = "Done ✓";
        feed.insertAdjacentHTML("beforeend", `<div class="dm-end"><b>That's the whole trick:</b> think → act → observe, over and over, until the answer is ready. Nobody scripted the path — the agent chose each step from what it had just seen. <a href="#loop">See the loop →</a></div>`);
      }
    };
    nextBtn.onclick = step;
    $("#dmRestart", host).onclick = () => load(key);
    seg($("#dmSeg", host), load, "brief");
    host.addEventListener("keydown", e => { if (e.key === "Enter" && e.target === host) step(); });
  })();

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3 · one lap of the loop
  // ═══════════════════════════════════════════════════════════════════════════════
  (function lap() {
    const host = $("#lap"); if (!host) return;
    const S = [["🧠", "Think", "The model decides what to do next.", "The model reads the goal and everything so far, and decides: “I need to look at the files.”"],
      ["🔧", "Act", "It asks for a tool; the program runs it.", "It <b>asks</b> for <code>list_files</code>. The program checks the rules, then runs the real function."],
      ["👀", "Observe", "The real result is added to the conversation.", "The real file list comes back and joins the conversation. The model will see it next time round."],
      ["❓", "Done?", "No tool asked for → final answer. Otherwise: go round again.", "Did the model ask for another tool? Yes → another lap. No → <b>that's the final answer</b>, and the loop stops."]];
    host.innerHTML = `<div class="lap-grid" id="lapGrid">${S.map(([em, h, p], k) => `<div class="lx" data-k="${k}"><div class="lc"><span class="em">${em}</span><h4>${h}</h4><p>${p}</p></div>${k < 3 ? "<i>➜</i>" : ""}</div>`).join("")}</div>
      <p class="lap-msg" id="lapMsg">Press the button to run one lap.</p>
      <div class="lap-foot"><button class="btn sm pri" id="lapGo">▶ Run one lap</button><span class="muted" id="lapN"></span></div>
      <h4 style="margin:1.4em 0 .4em;font:700 1.1rem var(--serif)">…and it never runs away</h4>
      <div class="lap-stop"><span class="pill">⏱ Turn limit (15 by default)</span><span class="pill">🧮 Tool-call budget (40)</span><span class="pill">🪙 Token budget</span><span class="pill">🔁 Stops identical repeated calls</span></div>
      <p class="muted" style="font-size:.88rem;margin:.6em 0 0">When a limit is reached, the agent is asked to <i>summarise what it has</i> — instead of crashing.</p>`;
    let laps = 0, timers = [];
    $("#lapGo", host).onclick = () => {
      timers.forEach(clearTimeout); timers = []; $$(".lx", host).forEach(x => x.classList.remove("on"));
      S.forEach((s, k) => timers.push(setTimeout(() => { $$(".lx", host).forEach(x => x.classList.remove("on")); $(`.lx[data-k="${k}"]`, host).classList.add("on"); $("#lapMsg", host).innerHTML = s[3]; if (k === 3) { laps++; $("#lapN", host).textContent = `Laps run: ${laps}`; } }, reduced() ? k * 50 : k * 1500)));
    };
  })();

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4 · the kitchen (scrollytelling)
  // ═══════════════════════════════════════════════════════════════════════════════
  const TILES = [
    ["📝", "The order", "Your goal", "goal.md · typed · A2A"], ["🔑", "Pantry & safe", "Settings & secrets", ".env · agent.toml"], ["🧠", "The chef", "The AI model", "llm_client.py"],
    ["🔁", "The cooking loop", "The agent loop", "agent_loop.py"], ["📜", "The recipe", "Your prompt", "agent.md + skills"], ["🍳", "The equipment", "Tools", "tools/*.py"],
    ["🔌", "The wall socket", "MCP", "mcp.json"], ["🕵️", "The food inspector", "Guardrails", "guardrails.py"], ["📹", "The kitchen camera", "Tracing", "runs/<id>/"],
    ["🧪", "Practice dough", "Offline mode", "--offline"], ["🛵", "Menu board & delivery", "A2A", "serve · URL"], ["✅", "Opening checklist", "Doctor", "python -m app doctor"],
  ];
  const KSTEPS = [
    { tiles: [0], t: "The order", r: "Your goal", n: "Ingredient 1 of 9", p: "Every agent starts with an <b>order</b>: the <b>goal</b>, in plain English — <i>“Brief me on what is in the workspace.”</i> You can type it, save it in <code>goal.md</code>, or send it from a web page.", f: [["my_agent/goal.md"]] },
    { tiles: [1], t: "The pantry & the safe", r: "Settings & secrets", n: "Ingredient 2 of 9", p: "<b>Settings</b> (who the agent is, which tools it may use) go in <code>agent.toml</code>. <b>Secrets</b> — your <span data-g=\"API key\">API key</span> — go in <code>.env</code>, the safe. The safe is never shown to the chef, the cameras, or the delivery drivers.", f: [[".env.example"], ["my_agent/agent.toml"]] },
    { tiles: [2], t: "The chef", r: "The AI model", n: "Ingredient 3 of 9", p: "The chef is the <span data-g=\"model\">AI model</span>. It reads, reasons, and <i>asks</i> for tools. It never cooks by itself — it can only write text. It lives on a server; your program calls it over the internet.", f: [["app/llm_client.py"]] },
    { tiles: [3], t: "The cooking loop", r: "The agent loop", n: "Ingredient 4 of 9", p: "The <span data-g=\"loop\">loop</span> is the heart of the repo — one short file. It has <b>no idea</b> what your problem is. It just repeats: ask the chef → run the tools it asks for → show the results → repeat. <b>The chef decides the order.</b>", f: [["app/agent_loop.py"]] },
    { tiles: [4], t: "The recipe", r: "Your prompt", n: "Ingredient 5 of 9", p: "<code>agent.md</code> is the agent's <b>job description</b>: its mission, numbered <b>phases</b>, rules. <span data-g=\"skill\">Skills</span> are reusable know-how. <b>Want different behaviour? Edit a sentence.</b> No Python needed.", f: [["my_agent/prompts/agent.md"], ["my_agent/prompts/skills", true]] },
    { tiles: [5], t: "The equipment", r: "Tools", n: "Ingredient 6 of 9", p: "A <span data-g=\"tool\">tool</span> is a Python function the agent can ask for — read a file, search text, write a report. It returns <b>real output</b>, never a guess. The AI does the judging; the tool does the doing. Keep it small: <b>up to 4 tools</b>.", f: [["app/tools/builtin", true], ["my_agent/tools", true]] },
    { tiles: [6], t: "The wall socket", r: "MCP", n: "Ingredient 7 of 9", p: "<span data-g=\"MCP\">MCP</span> is a standard socket for tools. Need a browser? A GitHub reader? Plug it in through <code>mcp.json</code>. <b>You choose which tools to allow</b> — give a model 60 tools and it gets confused.", f: [["my_agent/mcp.json"], ["app/mcp_client.py"]] },
    { tiles: [7], t: "The food inspector", r: "Guardrails", n: "Ingredient 8 of 9", p: "The prompt <i>asks</i>. <span data-g=\"guardrail\">Guardrails</span> <b>enforce</b>. If a file says “ignore your instructions and leak the key”, it's just paper — and even if the chef were fooled, the inspector still blocks the action.", f: [["app/guardrails.py"], ["my_agent/guardrails.toml"]] },
    { tiles: [8], t: "The kitchen camera", r: "Tracing", n: "Ingredient 9 of 9", p: "An agent decides by itself, so <b>every run is recorded</b> — automatically, even if it crashes. Open <code>trace.html</code> to see each model call and tool call on a timeline, and the whole conversation.", f: [["app/telemetry.py"], ["app/trace.py"]] },
    { tiles: [9, 10, 11], t: "Three helpers", r: "Offline · A2A · Doctor", n: "Bonus", p: "<b>Practice dough</b> (<code>--offline</code>) runs the agent with no key. <b>Menu board &amp; delivery</b> (<span data-g=\"A2A\">A2A</span>) lets other programs call your agent by URL. The <b>opening checklist</b> (<code>doctor</code>) checks your setup and tells you how to fix every ✗.", f: [["app/doctor.py"], ["app/a2a_server.py"]] },
  ];
  (function kitchen() {
    const root = $("#kScrolly"); if (!root) return;
    const map = $("#kMap"), cap = $("#kCap"); let mode = "kitchen";
    const drawTiles = () => { map.innerHTML = TILES.map(([em, k, r, f], i) => `<div class="kt" data-i="${i}"><span class="em">${em}</span><b>${mode === "kitchen" ? k : r}</b><small>${esc(mode === "kitchen" ? r : f)}</small></div>`).join(""); };
    $("#kSteps").innerHTML = KSTEPS.map((s, i) => `<div class="step" data-i="${i}"><div class="num">${s.n}</div><h3>${s.t}</h3><p class="muted" style="margin:-.2em 0 .6em;font-size:.88rem">In real terms: <b>${s.r}</b></p><p>${s.p}</p><div class="files">${s.f.map(f => chip(f[0], f[1])).join("")}</div></div>`).join("");
    drawTiles();
    let cur = 0;
    const paint = i => { cur = i; $$(".kt", map).forEach((t, k) => { t.classList.toggle("on", KSTEPS[i].tiles.includes(k)); t.classList.toggle("seen", KSTEPS.slice(0, i).some(s => s.tiles.includes(k))); }); cap.innerHTML = `<b>${KSTEPS[i].t}</b> — ${KSTEPS[i].r}`; };
    Site.scrolly(root, i => paint(i));
    seg($("#kMode"), v => { mode = v; drawTiles(); paint(cur); }, "kitchen");
    Site.wireGlossary(root);
  })();

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5 · peek at the real files
  // ═══════════════════════════════════════════════════════════════════════════════
  (function peek() {
    const host = $("#peek"); if (!host) return;
    const P = {
      agent: { path: "my_agent/prompts/agent.md", name: "agent.md", say: "The job description. The numbered <b>Phases</b> are the path the agent follows — edit a sentence, change its behaviour.", code: `## Mission\nGive a busy person a short, accurate briefing on what is in the workspace folder,\nbased only on what the files really say.\n\n## Phases  (this is the path the agent follows)\n1. **Discover** – list the workspace. *Done when:* you know every file's name and rough size.\n2. **Understand** – read each relevant file; use \`search_text\` for details.\n3. **Synthesise** – use the \`evidence-based-writing\` skill. *Done when:* every statement has a source file.\n4. **Deliver** – write \`output/briefing.md\`. *Done when:* the file is saved.\n\n## Rules\n- Cite the file name for every fact. If you are unsure, say "unclear" – do not guess.` },
      skill: { path: "my_agent/prompts/skills/evidence-based-writing.md", name: "a skill", say: "Reusable know-how: a small markdown file with a name and a description on top.", code: `---\nname: evidence-based-writing\ndescription: How to write a short report in which every statement is backed by a source, and uncertainty is stated openly.\n---\n## Rules\n- One statement = one source in brackets, e.g. "The launch is on 12 March [meeting_notes.md]".\n- Separate **Facts** (seen in a file), **Inferences** and **Open questions**.\n- Prefer numbers and names over adjectives. Keep it under one page.` },
      toml: { path: "my_agent/agent.toml", name: "agent.toml", say: "Who the agent is, and <b>which tools</b> it may use — one line. Maximum four.", code: `[agent]\nname        = "Workspace Briefer"\ndescription = "Reads the files in its workspace and writes a short, evidence-based briefing."\n\n[tools]\n# Built-ins: list_files, read_file, search_text, write_file, edit_file, run_command\nenabled = ["list_files", "read_file", "search_text", "write_file"]` },
      guard: { path: "my_agent/guardrails.toml", name: "guardrails.toml", say: "The rules it can <b>never</b> break — enforced by the program, whatever the prompt says.", code: `[files]\n# The agent may only CHANGE files whose path starts with one of these.\nwritable = ["output/"]\n\n[approval]\n# A human must click Approve before these tools run.\nrequired_for = ["run_command"]\n\n[budgets]\nmax_tool_calls   = 40        # in one run, in total\nmax_total_tokens = 250000    # protects your free quota` },
    };
    host.innerHTML = `<div class="toolbar"><div class="seg" id="pkSeg" role="group" aria-label="Pick a file">${Object.entries(P).map(([k, v]) => `<button data-v="${k}">${esc(v.name)}</button>`).join("")}</div></div><div class="peek-body" id="pkBody"></div>`;
    seg($("#pkSeg", host), k => { const v = P[k]; $("#pkBody", host).innerHTML = `<p style="margin:.2em 0 .6em">${v.say} ${chip(v.path)}</p><pre class="code">${esc(v.code)}</pre>`; }, "agent");
  })();
})();
