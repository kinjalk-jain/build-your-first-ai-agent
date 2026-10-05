/* The architecture diagram: one data set, drawn at four zoom levels (Kitchen → Real → Files → Code).
   Used twice on /how-it-works: the explorable map and the run player. Every file/function name below was checked against
   csqa-agentix/workshop-agent-template (commit 70b4bf3). */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const W = 200, H = 66;

  // k = kitchen name · r = real name · f = file · c = code. Title/sub per zoom level are chosen in label().
  const NODES = [
    { id: "you",     x: 10,  y: 24,  cls: "you",  k: "🍕 The customer",       r: "You",                    f: "terminal · web page · URL", c: "python -m app …" },
    { id: "entry",   x: 330, y: 24,  cls: "eng",  k: "🔔 The order window",   r: "Entry points",           f: "app/__main__.py",           c: "main()" },
    { id: "config",  x: 10,  y: 130, cls: "in",   k: "🗝️ Pantry & safe",      r: "Settings & secrets",     f: "app/config.py",             c: "load_settings()" },
    { id: "runner",  x: 330, y: 130, cls: "eng",  k: "🧾 The kitchen manager", r: "Runner",                f: "app/runner.py",             c: "run_once()" },
    { id: "prompts", x: 10,  y: 235, cls: "in",   k: "📜 The recipe book",    r: "Prompt builder",         f: "app/prompts/loader.py",     c: "build_system_prompt()" },
    { id: "loop",    x: 330, y: 240, cls: "hero", k: "👨‍🍳 The cooking loop",    r: "Agent loop",             f: "app/agent_loop.py",         c: "run_agent()", h: 96 },
    { id: "ws",      x: 10,  y: 340, cls: "in",   k: "🥬 The ingredients",    r: "Workspace copy",         f: "app/workspace.py",          c: "prepare_workspace()" },
    { id: "model",   x: 650, y: 24,  cls: "ext",  k: "🧠 The chef",           r: "The AI model (cloud)",   f: "BASE_URL in .env",          c: "chat.completions.create()" },
    { id: "llm",     x: 650, y: 130, cls: "eng",  k: "📞 The phone line",     r: "Model client",           f: "app/llm_client.py",         c: "LLM.complete()" },
    { id: "guard",   x: 330, y: 400, cls: "safe", k: "🕵️ The food inspector", r: "Guardrails",             f: "app/guardrails.py",         c: "Guardrails.check_before()" },
    { id: "hub",     x: 650, y: 320, cls: "eng",  k: "🔌 The wall socket",    r: "Tool hub (MCP client)",  f: "app/mcp_client.py",         c: "ToolHub.call()" },
    { id: "server",  x: 650, y: 415, cls: "ext",  k: "🏭 The equipment room", r: "Tool server (MCP)",      f: "app/mcp_server.py",         c: "FastMCP.add_tool()" },
    { id: "tools",   x: 650, y: 510, cls: "ext",  k: "🍳 The equipment",      r: "Your tools",             f: "app/tools/builtin/*.py",    c: "@tool read_file()" },
    { id: "rec",     x: 330, y: 505, cls: "rec",  k: "📹 The kitchen camera", r: "Recorder",               f: "trace.py · telemetry.py",   c: "Trace.log()" },
  ];
  const EDGES = [
    { id: "you-entry",     d: "M210,57 L330,57" },
    { id: "entry-runner",  d: "M430,90 L430,130" },
    { id: "config-runner", d: "M210,163 L330,163" },
    { id: "prompts-runner", d: "M210,268 C270,268 280,185 330,178" },
    { id: "ws-runner",     d: "M210,373 C280,373 290,196 330,191" },
    { id: "runner-loop",   d: "M430,196 L430,240" },
    { id: "loop-llm",      d: "M530,270 C590,270 596,168 650,168", label: "asks the model", lx: 590, ly: 240 },
    { id: "llm-model",     d: "M750,130 L750,90" },
    { id: "loop-guard",    d: "M430,336 L430,400" },
    { id: "guard-hub",     d: "M530,433 C590,433 596,353 650,353", label: "if allowed", lx: 590, ly: 408 },
    { id: "hub-server",    d: "M750,386 L750,415" },
    { id: "server-tools",  d: "M750,481 L750,510" },
    { id: "tools-ws",      d: "M650,552 C510,646 60,646 60,406", label: "reads & writes the copy", lx: 360, ly: 624, dashed: true },
    { id: "loop-rec",      d: "M330,300 C266,300 266,538 330,538", label: "records", lx: 286, ly: 430, dashed: true },
  ];

  // What each box is, in plain words, with the real files. `snip` is abridged real code.
  const INFO = {
    you: { what: "That's you. You start the agent in one of three ways — a terminal command, a web page on your own computer, or another program calling a URL (A2A). All three end up in the same place.", files: [["app/__main__.py"], ["app/a2a_server.py"]], snip: `python -m app "Brief me"       # terminal\npython -m app serve            # web page + URL` },
    entry: { what: "The front door. It reads what you typed after python -m app, decides which door you used, works out the goal, and hands over to the runner. This — not agent.md — is the file that starts everything.", files: [["app/__main__.py"]], snip: `def main(argv=None):\n    if argv[:1] == ["serve"]:\n        return serve_command_line(argv[1:])\n    ...\n    return run_command_line(argv)` },
    config: { what: "Opens the safe. Loading this file reads your .env (the API key) into memory, then reads agent.toml (which tools) and guardrails.toml (the rules). Nothing here talks to the AI.", files: [["app/config.py"], [".env.example"], ["my_agent/agent.toml"], ["my_agent/guardrails.toml"]], snip: `if not os.environ.get("NO_DOTENV"):\n    load_dotenv(ROOT / ".env")` },
    runner: { what: "Does one complete run, start to finish: opens a run folder, copies your files, starts the tools, builds the prompt, runs the loop, writes the report. The terminal, the web page and the URL door all call this same function, so they behave identically.", files: [["app/runner.py"]], snip: `async def run_once(goal, ...):\n    trace = Trace(...)          # runs/<id>/ first\n    work = prepare_workspace(...)\n    async with ToolHub.for_agent(...) as hub:\n        system_prompt = build_system_prompt(...)\n        result = await run_agent(...)` },
    prompts: { what: "Glues your markdown into one prompt: the general rules (system.md), then your job description (agent.md), then your skills. The files are only read as text — none of them “calls” anything.", files: [["app/prompts/loader.py"], ["app/prompts/system.md"], ["my_agent/prompts/agent.md"], ["my_agent/prompts/skills", true]], snip: `return f"{system.strip()}\\n\\n=== YOUR ROLE AND WORKFLOW ===\\n{agent.strip()}\\n\\n{skills_block}"` },
    ws: { what: "Copies your workspace folder into the run folder. The agent only ever sees and changes the copy, so your originals can't be damaged — and afterwards you get a diff of what changed.", files: [["app/workspace.py"], ["my_agent/workspace", true]], snip: `work = prepare_workspace(s.workspace_dir, trace.run_dir / "workspace")` },
    loop: { what: "The heart of the repo: ask the model → run the tools it asks for → show it the results → repeat. It knows nothing about your problem. The model decides what to do; your prompt steers it. When the model replies with no tool request, that is the final answer.", files: [["app/agent_loop.py"]], snip: `for turn in range(1, max_turns + 1):\n    reply = await ask_model(use_tools=True)\n    if not reply.tool_calls:        # final answer\n        return RunResult("completed", ...)\n    messages.extend(await asyncio.gather(\n        *(run_one(c) for c in reply.tool_calls)))` },
    llm: { what: "The only file that talks to the AI model. It sends the whole conversation plus the list of tools, waits for the reply, and handles slow-downs: if the free tier says “too many requests” it waits and retries.", files: [["app/llm_client.py"]], snip: `response = self.client.chat.completions.create(**request)\nturn = parse_response(response)   # text + any tool calls` },
    model: { what: "The AI itself, running on someone else's server. It only ever receives text and returns text — including text that says “please run this tool”. It cannot touch your computer. Which provider and model is set in .env.", files: [[".env.example"]], snip: `MODEL=nvidia/nemotron-3-super-120b-a12b\nBASE_URL=https://integrate.api.nvidia.com/v1` },
    guard: { what: "Rules enforced in code, because a prompt is only a request. Before every tool runs it checks: is this tool blocked, is the write allowed, is the budget spent? It also asks a human for risky actions and cleans every result (secrets blanked out, hidden orders flagged).", files: [["app/guardrails.py"], ["my_agent/guardrails.toml"]], snip: `def check_before(self, tool, args):\n    if tool in r.write_tools:\n        if not path.startswith(r.writable):\n            return "BLOCKED: you may only write under ..."\n    return None   # None = go ahead` },
    hub: { what: "The wall socket: where tools plug in. At launch it starts the tool server, asks “what tools do you have?”, and hands that list to the model. Later, when the model asks for a tool, hub.call() forwards the request and brings back the answer as text.", files: [["app/mcp_client.py"], ["my_agent/mcp.json"]], snip: `result = await asyncio.wait_for(\n    e.session.call_tool(e.original, args), CALL_TIMEOUT)` },
    server: { what: "A small background program, started automatically, that serves your tool functions over MCP (the standard plug). It only offers the tools listed in agent.toml — anything else, the model never even sees.", files: [["app/mcp_server.py"], ["my_agent/agent.toml"]], snip: `for fn in discover():\n    if enabled and fn.__name__ not in enabled:\n        continue          # not listed → the model never sees it\n    server.add_tool(fn)` },
    tools: { what: "Plain Python functions with @tool on top: list_files, read_file, search_text, write_file… The function's docstring tells the model when to use it; its type hints become the argument rules. This is the only place real things happen.", files: [["app/tools/builtin", true], ["my_agent/tools", true], ["app/tools/_sandbox.py"]], snip: `@tool\ndef read_file(path: str, start_line: int = 1, max_lines: int = 200) -> str:\n    """Read a text file from the workspace, with line numbers."""\n    file = resolve(path)    # stays inside the workspace` },
    rec: { what: "Records everything, even if the run crashes: live THINK / ACT / OBSERVE lines in your terminal, a report.md, and a full trace you can open as a web page afterwards.", files: [["app/trace.py"], ["app/telemetry.py"]], snip: `[ 1] THINK   Let me see what is in the workspace.\n[ 1] ACT     list_files({"path": "."})` },
  };

  const LABELS = {
    kitchen: n => [n.k, n.r],
    real: n => [n.r, n.f],
    files: n => [n.f, n.r],
    code: n => [n.c, n.f],
  };

  const el = (name, attrs = {}, parent) => { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.append(e); return e; };
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function makeDiagram(host, opts = {}) {
    let mode = opts.mode || "real", selected = null;
    host.classList.add("dg");
    const svg = el("svg", { viewBox: "0 0 860 664", role: "group", "aria-label": "Architecture diagram: who talks to whom when the agent runs", class: "dg-svg" });
    const defs = el("defs", {}, svg);
    for (const [id, cls] of [["ah", "ah"], ["ah-on", "ah on"]]) {
      const m = el("marker", { id: id + (opts.uid || ""), viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
      el("path", { d: "M0,1 L9,5 L0,9 z", class: cls }, m);
    }
    const gE = el("g", {}, svg), gN = el("g", {}, svg), gP = el("g", {}, svg);
    const eMap = {}, nMap = {};
    EDGES.forEach(e => {
      const g = el("g", { class: "ed" + (e.dashed ? " dashed" : ""), "data-id": e.id }, gE);
      el("path", { d: e.d, "marker-end": `url(#ah${opts.uid || ""})` }, g);
      if (e.label) { const t = el("text", { x: e.lx, y: e.ly, class: "edl", "text-anchor": "middle" }, g); t.textContent = e.label; }
      eMap[e.id] = g;
    });
    NODES.forEach(n => {
      const h = n.h || H;
      const g = el("g", { class: `nd ${n.cls}`, "data-id": n.id, transform: `translate(${n.x},${n.y})`, tabindex: opts.clickable === false ? -1 : 0, role: "button", "aria-label": n.r }, gN);
      el("rect", { width: W, height: h, rx: 14 }, g);
      const t1 = el("text", { x: W / 2, y: h / 2 - 3, class: "t1", "text-anchor": "middle" }, g);
      const t2 = el("text", { x: W / 2, y: h / 2 + 16, class: "t2", "text-anchor": "middle" }, g);
      g._t = [t1, t2]; nMap[n.id] = g;
      if (opts.clickable !== false) {
        g.addEventListener("click", () => pick(n.id));
        g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(n.id); } });
        g.addEventListener("mouseenter", () => hover(n.id)); g.addEventListener("mouseleave", () => hover(null));
        g.addEventListener("focus", () => hover(n.id)); g.addEventListener("blur", () => hover(null));
      }
    });
    host.append(svg);

    function setMode(m) {
      mode = m; host.dataset.mode = m;
      NODES.forEach(n => { const [a, b] = LABELS[m](n); const g = nMap[n.id]; g._t[0].textContent = a; g._t[1].textContent = b; g.classList.toggle("mono1", m === "files" || m === "code"); g.classList.toggle("mono2", m === "real" || m === "code"); });
    }
    function hover(id) {
      host.classList.toggle("hovering", !!id);
      Object.values(nMap).forEach(g => g.classList.remove("rel")); Object.values(eMap).forEach(g => g.classList.remove("rel"));
      if (!id) return;
      nMap[id].classList.add("rel");
      EDGES.forEach(e => { const [a, b] = e.id.split("-"); if (a === id || b === id) { eMap[e.id].classList.add("rel"); nMap[a].classList.add("rel"); nMap[b].classList.add("rel"); } });
    }
    function pick(id) { select(id); opts.onPick && opts.onPick(id); }
    function select(id) { selected = id; Object.entries(nMap).forEach(([k, g]) => g.classList.toggle("sel", k === id)); }
    function light(nodes = [], edges = []) {
      host.classList.toggle("playing", true);
      Object.entries(nMap).forEach(([k, g]) => g.classList.toggle("active", nodes.includes(k)));
      Object.entries(eMap).forEach(([k, g]) => { const on = edges.includes(k); g.classList.toggle("on", on); g.querySelector("path").setAttribute("marker-end", `url(#${on ? "ah-on" : "ah"}${opts.uid || ""})`); });
    }
    function clear() { host.classList.remove("playing"); light([], []); host.classList.remove("playing"); }
    function pulse(edgeId, reverse = false, dur = 800) {
      if (reduced()) return;
      const path = eMap[edgeId] && eMap[edgeId].querySelector("path"); if (!path) return;
      const len = path.getTotalLength(), c = el("circle", { r: 7, class: "pkt" }, gP), t0 = performance.now();
      const step = now => { const t = Math.min(1, (now - t0) / dur), p = path.getPointAtLength(len * (reverse ? 1 - t : t)); c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); if (t < 1) requestAnimationFrame(step); else c.remove(); };
      requestAnimationFrame(step);
    }
    setMode(mode);
    return { svg, setMode, light, clear, pulse, select, get mode() { return mode; }, get selected() { return selected; } };
  }

  window.Diagram = { make: makeDiagram, NODES, EDGES, INFO };
})();
