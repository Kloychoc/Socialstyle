// Payso Team Profile — page logic.
// Three parts, saved separately: style (Social Style), strengths (work strengths), type (4-letter type).
(() => {
  const { QUESTIONS: Q, LO, HI, MID, score } = window.SocialStyle;
  const A = window.Assessments;
  // answer dials: circles get smaller toward the middle, like a strength-of-agreement scale
  const DIAL4 = [
    { v: 1, size: 40, aria: q => `ตรงกับ A มาก: ${q.l}` }, { v: 2, size: 30, aria: q => `ค่อนข้างตรงกับ A: ${q.l}` },
    { v: 3, size: 30, aria: q => `ค่อนข้างตรงกับ B: ${q.r}` }, { v: 4, size: 40, aria: q => `ตรงกับ B มาก: ${q.r}` }];
  const DIAL5 = [
    { v: 1, size: 40, aria: q => `ตรงกับ A มาก: ${q.l}` }, { v: 2, size: 30, aria: q => `ค่อนข้างตรงกับ A: ${q.l}` },
    { v: 3, size: 22, mid: true, aria: () => "กลางๆ ใช่พอๆ กัน" },
    { v: 4, size: 30, aria: q => `ค่อนข้างตรงกับ B: ${q.r}` }, { v: 5, size: 40, aria: q => `ตรงกับ B มาก: ${q.r}` }];
  const ORDER = ["driver", "expressive", "amiable", "analytical"];
  const S = {
    driver:{name:"Driver", th:"ผู้ขับเคลื่อน", color:"แดง", tag:"Tell + Control",
      gist:"เน้นผลลัพธ์ ตัดสินใจเร็ว ชอบควบคุมเกม",
      strengths:["ตัดสินใจเด็ดขาด เดินงานเร็ว","ตั้งเป้าชัด ดันจนถึงผลลัพธ์","ไม่กลัวความท้าทายและความขัดแย้ง"],
      needs:"ผลลัพธ์และการได้ควบคุมงานเอง",
      talk:["เข้าเรื่องเลย บอกเป้าหมายกับผลลัพธ์ก่อนรายละเอียด","ให้ทางเลือก 2–3 ทางพร้อมผลดีผลเสีย แล้วให้เขาเลือก","ตรงเวลา สั้น กระชับ"],
      stress:"สั่งการมากขึ้น ฟังน้อยลง ดันทุรังเอาตามที่ตัวเองคิด",
      grow:"ลองถามความเห็นคนอื่นก่อนสรุป และใส่ใจความรู้สึกทีมอีกนิด"},
    expressive:{name:"Expressive", th:"นักจุดประกาย", color:"เหลือง", tag:"Tell + Emote",
      gist:"พลังเยอะ ชอบไอเดียใหม่ ชวนคนอื่นให้อินตาม",
      strengths:["สร้างแรงบันดาลใจ ขายไอเดียเก่ง","คิดภาพใหญ่ คิดนอกกรอบ","สร้างบรรยากาศและความสัมพันธ์เร็ว"],
      needs:"การยอมรับและได้เป็นที่สังเกต",
      talk:["คุยเรื่องภาพใหญ่ ความเป็นไปได้ และคนที่เกี่ยวข้อง","ให้เครดิตและพื้นที่ได้เล่าไอเดีย","ช่วยสรุป action กับวันส่งเป็นลายลักษณ์อักษรหลังคุย"],
      stress:"พูดแรง อารมณ์ขึ้น โทษคนอื่นตรงๆ",
      grow:"ฟังให้จบก่อนตอบ และปิดงานรายละเอียดให้ครบ"},
    amiable:{name:"Amiable", th:"ผู้ประสาน", color:"เขียว", tag:"Ask + Emote",
      gist:"ใส่ใจคน รักษาความสัมพันธ์ เป็นกาวของทีม",
      strengths:["เป็นผู้ฟังที่ดี คนไว้ใจ","ทำงานเป็นทีม ช่วยเหลือคนอื่น","ทำให้ลูกค้ารู้สึกอุ่นใจ ดูแลระยะยาวได้ดี"],
      needs:"ความมั่นคงและการเป็นที่ยอมรับของกลุ่ม",
      talk:["ทักทาย ถามความเป็นอยู่ก่อนเข้าเรื่อง","ถามความเห็นตรงๆ เพราะเขาอาจไม่พูดเอง","อธิบายว่าการเปลี่ยนแปลงกระทบทีมอย่างไร และให้เวลาปรับ"],
      stress:"ยอมตามทั้งที่ไม่เห็นด้วย แล้วเก็บไว้ในใจ",
      grow:"ฝึกพูดว่า 'ไม่' และบอกความเห็นต่างตั้งแต่ต้น"},
    analytical:{name:"Analytical", th:"นักวิเคราะห์", color:"น้ำเงิน", tag:"Ask + Control",
      gist:"ละเอียด ใช้ข้อมูล คิดให้รอบก่อนลงมือ",
      strengths:["วางแผนเป็นระบบ งานแม่นยำ","จับความเสี่ยงและช่องโหว่เก่ง","ตัดสินใจด้วยข้อมูล ไม่ใช่อารมณ์"],
      needs:"ความถูกต้องและข้อมูลที่ครบพอ",
      talk:["เตรียมข้อมูล ตัวเลข และที่มาให้พร้อม","ส่งเอกสารให้อ่านก่อนประชุม ให้เวลาคิด","เป็นขั้นตอน มีเหตุผลรองรับ"],
      stress:"ถอยออก เงียบ ขอข้อมูลเพิ่มไปเรื่อยๆ",
      grow:"ตั้งเส้นตายให้ตัวเองว่าข้อมูลแค่ไหนพอตัดสินใจ และแชร์ความคิดเร็วขึ้น"},
  };


  // The three parts, in the order they are offered.
  const PARTS = {
    style: {
      title: "สไตล์การสื่อสาร", sub: "Social Style 4 สี", time: "30 ข้อ · 8–10 นาที",
      items: Q, done: r => !!r.style, label: r => S[r.style] && `${S[r.style].name} · สี${S[r.style].color}`,
      scale: DIAL4,
      rules: ["แต่ละข้อมีสองแบบ A กับ B แตะวงกลมฝั่งที่ใกล้ตัวคุณกว่า วงใหญ่ = ใช่มาก",
              "ตอบตามสิ่งที่คุณทำจริงเป็นปกติ ไม่ใช่สิ่งที่อยากเป็น", "ไม่จำกัดเวลา ย้อนกลับไปแก้ได้"],
      local: ans => score(ans) },
    strengths: {
      title: "จุดแข็ง", sub: "12 จุดแข็ง", time: "24 คู่ · ไม่เกิน 8 นาที", timed: true, scale: DIAL5,
      rules: [`มีเวลาข้อละ ${A.STRENGTH_SECONDS} วินาที ตอบตามความรู้สึกแรก ไม่ต้องคิดนาน`,
              "ทั้งสองประโยคดีทั้งคู่ เลือกฝั่งที่เป็นตัวคุณมากกว่า ถ้าใช่พอๆ กันจริงๆ เลือกวงกลางได้",
              "ย้อนกลับไม่ได้ ถ้าหมดเวลา ข้อนั้นนับเป็นกลางๆ",
              "ถ้าสลับไปแอปอื่น เวลาจะหยุดนับให้"],
      items: A.STRENGTH_QUESTIONS, pair: true, done: r => Array.isArray(r.strengths) && r.strengths.length > 0,
      label: r => r.strengths.map(k => A.STRENGTHS[k].th).join(", "),
      local: ans => A.scoreStrengths(ans) },
    type: {
      title: "บุคลิก 4 ตัวอักษร", sub: "แนว MBTI", time: "20 ข้อ · 3–4 นาที",
      items: A.TYPE_QUESTIONS, done: r => !!r.type, label: r => `${r.type} · ${A.TYPES[r.type].th}`,
      scale: DIAL4,
      rules: ["แต่ละข้อมีสองแบบ A กับ B แตะวงกลมฝั่งที่ใกล้ตัวคุณกว่า วงใหญ่ = ใช่มาก",
              "ตอบตามธรรมชาติของคุณ ไม่ใช่สิ่งที่อยากเป็น", "ไม่จำกัดเวลา ย้อนกลับไปแก้ได้"],
      local: ans => A.scoreType(ans) },
  };
  const PART_KEYS = Object.keys(PARTS);
  const ANS_KEY = { style: "answers", strengths: "strengthAnswers", type: "typeAnswers" };

  // ---------- helpers ----------
  const $ = s => document.querySelector(s);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else n.setAttribute(k, v);
    }
    for (const k of kids) if (k != null) n.append(k);
    return n;
  };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)));
  const clarity = (a, r) => Math.min(Math.abs(a - MID), Math.abs(r - MID)) <= 3 ? "ใกล้เส้นแบ่ง ปรับสไตล์ได้ค่อนข้างง่าย" : "สไตล์ค่อนข้างชัด";
  const initial = name => (name || "?").trim().slice(0, 1).toUpperCase();
  const teamName = t => (t === "sales" ? "Sales" : "Marketing");
  const list = arr => { const u = el("ul"); arr.forEach(x => u.append(el("li", { text: x }))); return u; };
  const hasStyle = r => !!(r && S[r.style]);
  const hasStrengths = r => !!(r && Array.isArray(r.strengths) && r.strengths.length && r.strengths.every(k => A.STRENGTHS[k]));
  const hasType = r => !!(r && A.TYPES[r.type]);

  // ---------- api ----------
  async function api(path, opts = {}) {
    const res = await fetch(path, {
      ...opts,
      headers: { "Content-Type": "application/json", "x-access-code": store.get("ss_code") || "", ...(opts.headers || {}) },
    });
    if (res.status === 401) { showGate(true); throw new Error("access_code"); }
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "http_" + res.status);
    return res.json();
  }

  // ---------- state ----------
  let myId = store.get("ss_id");
  if (!myId) { myId = uuid(); store.set("ss_id", myId); }
  const st = {
    team: null, part: "style", me: {},
    ans: Object.fromEntries(PART_KEYS.map(k => [k, Array(PARTS[k].items.length).fill(0)])),
    rows: [], filter: "all", sel: null,
  };

  // ---------- gate ----------
  function showGate(wrong) {
    $("#gate").hidden = false; $("#app").hidden = true;
    $("#gate-error").hidden = !wrong || !store.get("ss_code");
    $("#gate-code").focus();
  }
  $("#gate-form").addEventListener("submit", e => {
    e.preventDefault();
    store.set("ss_code", $("#gate-code").value.trim());
    boot();
  });

  // ---------- tabs ----------
  const tabs = [...document.querySelectorAll(".tab")];
  function showTab(id) {
    tabs.forEach(t => {
      const on = t.id === id;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
    if (id !== "tab-quiz" && typeof stopTimer === "function" && st2.view === "ask") { st2.view = "start"; renderFlow(); }
    if (id === "tab-team") loadTeam();
    if (id === "tab-me") renderMe();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => showTab(t.id));
    t.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus(); showTab(next.id);
    });
  });

  // ---------- quiz: one question at a time ----------
  // Flow per part: start screen -> questions (tap = answer + next) -> finish screen -> save.
  // Strengths: 20 seconds per pair and no going back (as in Gallup); time out = กลางๆ (3).
  // Progress is kept in this browser so a refresh or a closed tab does not lose answers.
  const DRAFT = "ss_draft_v2";
  const st2 = { view: "start", pos: Object.fromEntries(PART_KEYS.map(k => [k, 0])), timeouts: 0, timer: null };

  function loadDraft() {
    try {
      const d = JSON.parse(store.get(DRAFT) || "{}");
      // name and team are kept too, so a refresh before the first save does not ask again
      if (d.who && !nameVal()) { $("#name").value = d.who.name || ""; if (d.who.team) setTeam(d.who.team); }
      PART_KEYS.forEach(k => {
        const x = d[k];
        if (x && Array.isArray(x.ans) && x.ans.length === PARTS[k].items.length) { st.ans[k] = x.ans; st2.pos[k] = Math.min(x.pos || 0, x.ans.length); }
      });
    } catch {}
  }
  function saveDraft() {
    try {
      const d = JSON.parse(store.get(DRAFT) || "{}");
      d[st.part] = { ans: st.ans[st.part], pos: st2.pos[st.part] };
      d.who = { name: nameVal(), team: st.team };
      store.set(DRAFT, JSON.stringify(d));
    } catch {}
  }
  function clearDraft(part) {
    try { const d = JSON.parse(store.get(DRAFT) || "{}"); delete d[part]; store.set(DRAFT, JSON.stringify(d)); } catch {}
  }

  // who you are
  const nameVal = () => $("#name").value.trim();
  const whoReady = () => !!(nameVal() && st.team);
  function renderWho(forceForm) {
    const ready = whoReady() && !forceForm;
    $("#who-form").hidden = ready;
    $("#who-line").hidden = !ready;
    $("#who-ok").disabled = !whoReady();
    if (ready) {
      const t = $("#who-text"); t.textContent = "ทำแบบทดสอบในชื่อ ";
      t.append(el("b", { text: nameVal() }), ` · ${teamName(st.team)}`);
    }
    renderFlow();
  }
  function setTeam(t) {
    st.team = t;
    document.querySelectorAll("#team-seg button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.team === t)));
    $("#who-ok").disabled = !whoReady();
  }
  document.querySelectorAll("#team-seg button").forEach(b => b.addEventListener("click", () => setTeam(b.dataset.team)));
  $("#name").addEventListener("input", () => { $("#who-ok").disabled = !whoReady(); });
  $("#who-ok").addEventListener("click", () => { saveWho(); renderWho(false); });
  function saveWho() {
    try { const d = JSON.parse(store.get(DRAFT) || "{}"); d.who = { name: nameVal(), team: st.team }; store.set(DRAFT, JSON.stringify(d)); } catch {}
  }
  $("#who-edit").addEventListener("click", () => { stopTimer(); renderWho(true); $("#name").focus(); });

  function renderParts() {
    const box = $("#parts"); box.textContent = "";
    PART_KEYS.forEach(k => {
      const p = PARTS[k], done = p.done(st.me);
      const answered = p.timed ? 0 : st.ans[k].filter(Boolean).length; // timed test always restarts
      const status = done ? "✓ ทำแล้ว: " + p.label(st.me)
        : answered ? `ทำค้างไว้ ${answered}/${p.items.length} ข้อ` : "ยังไม่ได้ทำ";
      const b = el("button", { type: "button", class: "part", "aria-pressed": String(st.part === k) },
        el("span", { class: "part__title", text: p.title }),
        el("span", { class: "part__meta", text: `${p.sub} · ${p.time}` }),
        el("span", { class: "part__status" + (done ? " part__status--done" : ""), text: status }));
      b.addEventListener("click", () => {
        stopTimer(); st.part = k; st2.view = "start"; renderParts(); renderFlow();
        $("#flow").scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
      box.append(b);
    });
  }

  function renderFlow() {
    stopTimer();
    const box = $("#flow"); box.textContent = "";
    $("#parts").hidden = st2.view !== "start"; // while answering, show only the question
    if (st2.view === "ask") return renderAsk(box);
    if (st2.view === "finish") return renderFinish(box);
    renderStart(box);
  }

  function renderStart(box) {
    const p = PARTS[st.part], ans = st.ans[st.part], answered = ans.filter(Boolean).length;
    const done = p.done(st.me);
    box.append(el("h2", { class: "section-title" }, el("span", { text: p.title })),
      el("p", { class: "muted", text: `${p.sub} · ${p.time}` }));
    const rules = el("ul", { class: "rules" });
    p.rules.forEach(r => rules.append(el("li", { text: r })));
    box.append(rules);
    if (!whoReady()) {
      box.append(el("p", { class: "notice", text: "ใส่ชื่อและเลือกทีมด้านบนก่อน แล้วค่อยเริ่ม" }));
      return;
    }
    const resume = answered > 0 && answered < ans.length && !p.timed;
    const start = el("button", { class: "btn big-cta", type: "button",
      text: resume ? `ทำต่อจากข้อ ${st2.pos[st.part] + 1}` : done ? "ทำใหม่" : "เริ่มเลย" });
    start.addEventListener("click", () => {
      if (!resume) {
        // timed test always starts clean; others keep earlier choices so a retake is quick
        if (p.timed || !done) st.ans[st.part] = Array(ans.length).fill(0);
        st2.pos[st.part] = 0;
      }
      st2.timeouts = 0;
      st2.view = "ask"; saveDraft(); renderFlow();
      $("#flow").scrollIntoView({ block: "start", behavior: "smooth" });
    });
    box.append(start);
    if (answered === ans.length && !done) {
      const save = el("button", { class: "linkbtn", type: "button", text: "ตอบครบแล้ว ไปหน้าบันทึก" });
      save.addEventListener("click", () => { st2.view = "finish"; renderFlow(); });
      box.append(save);
    }
  }

  function renderAsk(box) {
    const p = PARTS[st.part], ans = st.ans[st.part], i = st2.pos[st.part], q = p.items[i], n = p.items.length;
    const scale = p.scale; // [{v, label, size, mid}]
    const pct = Math.round(i / n * 100);
    const pause = el("button", { class: "linkbtn", type: "button", text: p.timed ? "ออก (เริ่มใหม่ทีหลัง)" : "พักไว้ก่อน" });
    pause.addEventListener("click", () => { st2.view = "start"; saveDraft(); renderFlow(); });
    box.append(el("div", { class: "flow__bar" },
      el("span", { class: "flow__count", text: `${p.title} · ข้อ ${i + 1} / ${n}` }), pause));
    // timed test shows one bar only (the clock); the count above carries progress
    if (!p.timed) box.append(el("div", { class: "progress", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(n), "aria-valuenow": String(i) },
      el("span", { class: "progress__bar", style: `width:${pct}%` })));

    let timerBox = null;
    if (p.timed) {
      timerBox = el("div", { class: "timer" },
        el("div", { class: "timer__track" }, el("span", { class: "timer__fill" })),
        el("span", { class: "timer__txt" }));
      box.append(timerBox);
    }
    box.append(el("div", { class: "flow__topic", id: "q-topic", text: q.t || "ข้อไหนเป็นตัวคุณมากกว่า" }));
    const A1 = el("div", { class: "stmt" }, el("span", { class: "stmt__tag", text: "A" }), el("span", { text: q.l }));
    const B1 = el("div", { class: "stmt" }, el("span", { class: "stmt__tag", text: "B" }), el("span", { text: q.r }));
    box.append(el("div", { class: "stmts" }, A1, B1));

    const dial = el("div", { class: "dial", role: "radiogroup", "aria-labelledby": "q-topic" });
    const lean = v => {
      A1.classList.toggle("is-lean", v != null && v < (scale.length + 1) / 2);
      B1.classList.toggle("is-lean", v != null && v > (scale.length + 1) / 2);
    };
    scale.forEach(o => {
      const b = el("button", { type: "button", role: "radio", class: o.mid ? "is-mid" : "",
        "aria-checked": String(ans[i] === o.v), "aria-label": o.aria(q) },
        el("i", { style: `width:${o.size}px;height:${o.size}px` }));
      b.addEventListener("click", () => choose(o.v));
      b.addEventListener("pointerenter", () => lean(o.v));
      b.addEventListener("pointerleave", () => lean(ans[i] || null));
      dial.append(b);
    });
    const labels = el("div", { class: "dial__labels", "aria-hidden": "true" },
      el("span", { text: "ใช่ A" }), el("span", { text: p.timed ? "กลางๆ" : "" }), el("span", { text: "ใช่ B" }));
    box.append(dial, labels);
    lean(ans[i] || null);

    const nav = el("div", { class: "flow__nav" });
    if (!p.timed && i > 0) {
      const back = el("button", { class: "btn btn--ghost", type: "button", text: "← ข้อก่อนหน้า" });
      back.addEventListener("click", () => { st2.pos[st.part] = i - 1; saveDraft(); renderFlow(); });
      nav.append(back);
    } else nav.append(el("span"));
    if (!p.timed && ans[i]) {
      const fwd = el("button", { class: "btn btn--ghost", type: "button", text: "ข้อถัดไป →" });
      fwd.addEventListener("click", () => next());
      nav.append(fwd);
    } else nav.append(el("span", { class: "keys", text: `กดปุ่ม 1–${scale.length} บนคีย์บอร์ดได้` }));
    box.append(nav);

    let locked = false;
    function choose(v) {
      if (locked) return;
      locked = true; stopTimer();
      ans[i] = v; saveDraft();
      dial.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-checked", String(scale[j].v === v)));
      lean(v);
      setTimeout(next, 260); // short pause so the choice is visible before moving on
    }
    function next() {
      stopTimer();
      st2.pos[st.part] = Math.min(i + 1, n);
      st2.view = ans.every(Boolean) && st2.pos[st.part] >= n ? "finish" : "ask";
      if (st2.view === "ask" && st2.pos[st.part] >= n) st2.pos[st.part] = ans.findIndex(v => !v);
      saveDraft(); renderFlow();
    }
    st2.keyHandler = e => {
      if (e.target.closest && e.target.closest("input,textarea")) return;
      const k = Number(e.key);
      if (k >= 1 && k <= scale.length) { e.preventDefault(); choose(scale[k - 1].v); }
    };
    if (p.timed) startTimer(timerBox, () => {
      // time is up: count as กลางๆ and move on
      st2.timeouts++;
      ans[i] = 3; saveDraft(); locked = true; next();
    });
    dial.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true });
  }
  document.addEventListener("keydown", e => {
    if (st2.view === "ask" && !$("#panel-quiz").hidden && st2.keyHandler) st2.keyHandler(e);
  });

  // 20-second countdown that pauses while the tab is hidden
  function startTimer(box, onEnd) {
    const total = A.STRENGTH_SECONDS * 1000;
    let left = total, last = performance.now();
    const fill = box.querySelector(".timer__fill"), txt = box.querySelector(".timer__txt");
    const draw = () => {
      fill.style.width = (left / total * 100) + "%";
      const secs = Math.ceil(left / 1000);
      txt.textContent = `เหลือ ${secs} วินาที`;
      box.classList.toggle("is-low", secs <= 5);
    };
    draw();
    st2.timer = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) left -= now - last;
      last = now;
      if (left <= 0) { left = 0; draw(); stopTimer(); onEnd(); return; }
      draw();
    }, 100);
  }
  function stopTimer() { if (st2.timer) { clearInterval(st2.timer); st2.timer = null; } }

  function renderFinish(box) {
    const p = PARTS[st.part];
    box.append(el("div", { class: "done-mark", "aria-hidden": "true", text: "✓" }),
      el("h2", { class: "section-title" }, el("span", { text: `ตอบ${p.title}ครบแล้ว` })));
    if (p.timed && st2.timeouts) box.append(el("p", { class: "muted", text: `หมดเวลา ${st2.timeouts} ข้อ ข้อเหล่านั้นนับเป็นกลางๆ` }));
    const save = el("button", { class: "btn big-cta", type: "button", id: "submit", text: "บันทึกและดูผล" });
    save.addEventListener("click", () => submit(save));
    box.append(save);
    if (!p.timed) {
      const review = el("button", { class: "linkbtn", type: "button", text: "ย้อนกลับไปทบทวนคำตอบ" });
      review.addEventListener("click", () => { st2.pos[st.part] = 0; st2.view = "ask"; renderFlow(); });
      box.append(review);
    }
  }

  async function submit(btn) {
    const part = st.part, answers = st.ans[part].slice();
    btn.disabled = true; btn.setAttribute("aria-busy", "true"); btn.textContent = "กำลังบันทึก…";
    let msg, isError = false;
    try {
      st.me = await api("/api/results/" + myId, { method: "PUT",
        body: JSON.stringify({ name: nameVal(), team: st.team, section: part, answers }) });
      clearDraft(part);
      const next = PART_KEYS.find(k => !PARTS[k].done(st.me));
      msg = `บันทึก${PARTS[part].title}แล้ว` + (next ? ` · ยังเหลือ${PARTS[next].title}` : " · ครบทั้ง 3 ชุดแล้ว");
      st2.view = "start";
      if (next) st.part = next;
    } catch (e) {
      if (e.message === "access_code") return;
      // show the result anyway, scored in the browser, and say it was not saved
      st.me = { ...st.me, name: nameVal(), team: st.team, [ANS_KEY[part]]: answers, ...PARTS[part].local(answers) };
      isError = true;
      msg = e.message === "db_not_configured"
        ? "บันทึกไม่สำเร็จ เพราะระบบยังไม่ได้เชื่อมฐานข้อมูล แจ้งผู้ดูแลระบบ"
        : "บันทึกไม่สำเร็จ ผลนี้ยังไม่ขึ้นในภาพรวมทีม กลับไปที่แท็บแบบทดสอบแล้วกดบันทึกอีกครั้ง";
    }
    renderParts(); renderFlow();
    showTab("tab-me");
    showNotice(msg, isError);
    const target = $("#me-" + part);
    if (target) target.scrollIntoView({ block: "start" });
  }

  function showNotice(msg, isError) {
    const n = $("#me-notice");
    n.textContent = msg || ""; n.hidden = !msg;
    n.className = "notice" + (isError ? " notice--error" : "");
  }
  // ---------- map (svg) ----------
  // Positions come from MapLayout (public/map-layout.js), which keeps every dot inside the
  // quadrant its scores belong to and stops dots overlapping. Covered by test/map-layout.test.js.
  const NS = "http://www.w3.org/2000/svg";
  const sv = (tag, attrs = {}, text) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (text != null) n.textContent = text; return n; };
  const G = window.MapLayout.GEOM, HALF = window.MapLayout.HALF;
  const isNearLine = (a, r) => Math.min(Math.abs(a - MID), Math.abs(r - MID)) <= 3;

  // points: [{id, a, r, style, name, team, isMe}]; opts: {selectedId, onSelect, pinLabel}
  function mapSvg(points, opts = {}) {
    const { W, H, padX, padY, inner, r: R } = G;
    const s = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "group",
      "aria-label": "แผนที่ Social Style แกนนอนจากถามไปบอก แกนตั้งจากเก็บอารมณ์ไปแสดงอารมณ์" });

    // quadrants: x = Ask (left) -> Tell (right); y = Control (top) -> Emote (bottom)
    // style names sit OUTSIDE the grid's corners so dots never cover them
    [["analytical", 0, 0], ["driver", 1, 0], ["amiable", 0, 1], ["expressive", 1, 1]].forEach(([k, col, row]) => {
      const x = padX + col * HALF, y = padY + row * HALF, left = col === 0, top = row === 0;
      s.append(sv("rect", { x, y, width: HALF, height: HALF, class: `q q--${k}` }));
      const tx = left ? padX : padX + inner, anchor = left ? "start" : "end";
      const ty = top ? padY - 28 : padY + inner + 24;
      s.append(sv("text", { x: tx, y: ty, "text-anchor": anchor, class: `q-label q-label--${k}` }, S[k].name));
      s.append(sv("text", { x: tx, y: ty + 18, "text-anchor": anchor, class: "q-sub" }, S[k].th));
    });
    s.append(sv("rect", { x: padX, y: padY, width: inner, height: inner, class: "frame" }));
    s.append(sv("line", { x1: padX + HALF, y1: padY, x2: padX + HALF, y2: padY + inner, class: "midline" }));
    s.append(sv("line", { x1: padX, y1: padY + HALF, x2: padX + inner, y2: padY + HALF, class: "midline" }));

    // axis labels on all four sides
    const t = (x, y, txt, anchor, cls = "axis") => s.append(sv("text", { x, y, "text-anchor": anchor, class: cls }, txt));
    t(padX + HALF, padY - 28, "▲ เก็บอารมณ์", "middle"); t(padX + HALF, padY - 10, "Control", "middle", "axis axis--en");
    t(padX + HALF, padY + inner + 24, "▼ แสดงอารมณ์", "middle"); t(padX + HALF, padY + inner + 42, "Emote", "middle", "axis axis--en");
    t(padX - 8, padY + HALF - 4, "◀ ถาม", "end"); t(padX - 8, padY + HALF + 14, "Ask", "end", "axis axis--en");
    t(padX + inner + 8, padY + HALF - 4, "บอก ▶", "start"); t(padX + inner + 8, padY + HALF + 14, "Tell", "start", "axis axis--en");

    if (!points.length) {
      s.append(sv("text", { x: padX + HALF, y: padY + HALF - 12, "text-anchor": "middle", class: "map-empty" }, "ยังไม่มีข้อมูลในกลุ่มนี้"));
    }

    const dots = sv("g");
    window.MapLayout.layout(points).forEach(p => {
      const cls = ["dot", `tone-${p.style}`];
      if (p.isMe) cls.push("dot--me");
      if (opts.selectedId === p.id) cls.push("is-sel");
      if (opts.pinLabel) cls.push("dot--pinned");
      const g = sv("g", { class: cls.join(" "), tabindex: "0", role: "button", "data-id": p.id,
        "aria-label": `${p.name}${p.isMe ? " (คุณ)" : ""} สไตล์ ${S[p.style].name} ทีม ${p.team === "sales" ? "Sales" : "Marketing"}`,
        "aria-pressed": String(opts.selectedId === p.id) });
      g.append(sv("circle", { cx: p.x, cy: p.y, r: R + 4, class: "dot__ring" }));
      g.append(sv("circle", { cx: p.x, cy: p.y, r: R, class: "dot__fill" }));
      g.append(sv("text", { x: p.x, y: p.y + 5, "text-anchor": "middle", class: "dot__txt" }, initial(p.name)));
      const tag = sv("g", { class: "dot__tag" });
      tag.append(sv("rect", { rx: 6, class: "dot__tagbg" }));
      tag.append(sv("text", { x: p.x, y: p.y, "text-anchor": "middle", class: "dot__tagtxt" }, p.isMe ? `${p.name} (คุณ)` : p.name));
      g.append(tag);
      const raise = () => { if (dots.lastChild !== g) dots.append(g); }; // hovered/focused dot (and its name tag) to the front, once
      g.addEventListener("pointerenter", raise);
      g.addEventListener("focus", raise);
      if (opts.onSelect) {
        g.addEventListener("click", () => opts.onSelect(p.id));
        g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); opts.onSelect(p.id); } });
      }
      dots.append(g);
    });
    s.append(dots);
    // the selected dot sits on top
    const sel = dots.querySelector(".is-sel"); if (sel) dots.append(sel);
    return s;
  }

  // Name tags are sized from the rendered text, so call this once the svg is in the page.
  function sizeTags(svg) {
    svg.querySelectorAll(".dot").forEach(g => {
      const c = g.querySelector(".dot__fill"), txt = g.querySelector(".dot__tagtxt"), bg = g.querySelector(".dot__tagbg");
      const cx = +c.getAttribute("cx"), cy = +c.getAttribute("cy");
      const above = cy - G.r - 34 > 0;
      txt.setAttribute("y", above ? cy - G.r - 14 : cy + G.r + 24);
      let bb; try { bb = txt.getBBox(); } catch { return; }
      const halfW = bb.width / 2 + 8;
      txt.setAttribute("x", Math.max(halfW + 2, Math.min(G.W - halfW - 2, cx)));
      bb = txt.getBBox();
      bg.setAttribute("x", bb.x - 8); bg.setAttribute("y", bb.y - 4);
      bg.setAttribute("width", bb.width + 16); bg.setAttribute("height", bb.height + 8);
    });
  }
  function mountMap(container, svg) { container.textContent = ""; container.append(svg); sizeTags(svg); }


  // ---------- my results ----------
  function todoCard(part) {
    const p = PARTS[part];
    const go = el("button", { class: "btn", type: "button", text: `ทำ${p.title}` });
    go.addEventListener("click", () => { st.part = part; st2.view = "start"; renderParts(); renderFlow(); showTab("tab-quiz"); window.scrollTo({ top: 0 }); });
    return el("div", { class: "card todo" },
      el("h2", { class: "subhead", text: p.title }),
      el("p", { class: "muted", text: `ยังไม่ได้ทำ · ${p.time}` }), go);
  }
  function retakeBtn(part) {
    const b = el("button", { class: "btn btn--ghost", type: "button", text: "ทำใหม่" });
    b.addEventListener("click", () => { st.part = part; st2.view = "start"; renderParts(); renderFlow(); showTab("tab-quiz"); window.scrollTo({ top: 0 }); });
    return b;
  }
  const partHead = (part, extra) => el("div", { class: "section-title" },
    el("h2", { text: PARTS[part].title }), el("div", { class: "row" }, extra, retakeBtn(part)));

  function renderMe() {
    const me = st.me;
    // overview
    const ov = $("#me-overview"); ov.textContent = "";
    const pills = el("div", { class: "overview" });
    if (hasStyle(me)) pills.append(el("span", { class: `chip tone-${me.style}`, text: `${S[me.style].name} · สี${S[me.style].color}` }));
    if (hasType(me)) pills.append(el("span", { class: "pill pill--mono", text: me.type }));
    if (hasStrengths(me)) me.strengths.forEach(k => pills.append(el("span", { class: "pill", text: A.STRENGTHS[k].th })));
    const doneCount = PART_KEYS.filter(k => PARTS[k].done(me)).length;
    ov.append(el("h2", { class: "subhead", text: me.name ? `โปรไฟล์ของ${me.name}` : "โปรไฟล์ของคุณ" }),
      doneCount ? pills : el("p", { class: "muted", text: "ยังไม่มีผล เริ่มจากแบบทดสอบชุดไหนก็ได้" }),
      el("p", { class: "muted", text: `ทำแล้ว ${doneCount} จาก 3 ชุด` }));

    renderMyStyle(me); renderMyStrengths(me); renderMyType(me);
  }

  function renderMyStyle(row) {
    const box = $("#me-style"); box.textContent = "";
    if (!hasStyle(row)) { box.append(todoCard("style")); return; }
    const k = row.style, d = S[k];
    const map = el("div", { class: "card map" });
    box.append(
      partHead("style"),
      el("div", { class: `hero tone-${k}` },
        el("span", { class: `chip tone-${k}`, text: `สี${d.color} · ${d.tag}` }),
        el("div", {}, el("span", { class: "hero__name", text: d.name }), " ", el("span", { class: "hero__th", text: d.th })),
        el("p", { text: d.gist })),
      el("div", { class: "scores" },
        el("span", {}, "Assertiveness ", el("b", { text: `${row.a}/${HI}` })),
        el("span", {}, "Responsiveness ", el("b", { text: `${row.r}/${HI}` })),
        el("span", { text: clarity(row.a, row.r) })),
      map,
      el("div", { class: "card facts" },
        el("div", {}, el("h3", { text: "จุดเด่นของสไตล์นี้" }), list(d.strengths)),
        el("div", {}, el("h3", { text: "อยากให้คนอื่นคุยกับฉันแบบนี้" }), list(d.talk)),
        el("div", {}, el("h3", { text: "สิ่งที่ฉันต้องการลึกๆ" }), el("p", { text: d.needs })),
        el("div", {}, el("h3", { text: "เวลาเครียดอาจจะ…" }), el("p", { text: d.stress })),
        el("div", {}, el("h3", { text: "ลองฝึกเพิ่ม" }), el("p", { text: d.grow }))));
    mountMap(map, mapSvg([{ id: "me", a: row.a, r: row.r, style: k, name: row.name || "คุณ", team: row.team, isMe: true }], { pinLabel: true }));
  }

  function renderMyStrengths(row) {
    const box = $("#me-strengths"); box.textContent = "";
    if (!hasStrengths(row)) {
      box.append(todoCard("strengths"));
      if (Array.isArray(row.strengthAnswers) && row.strengthAnswers.length)
        box.querySelector(".todo .muted").textContent = "ครั้งที่แล้วตอบกลางๆ หรือหมดเวลาทุกข้อ ระบบจึงยังบอกจุดแข็งไม่ได้ ลองทำใหม่อีกครั้ง";
      return;
    }
    const top = el("div", { class: "top3" });
    row.strengths.forEach((k, i) => {
      const d = A.STRENGTHS[k];
      top.append(el("div", { class: "sk" },
        el("span", { class: "sk__rank", text: `อันดับ ${i + 1} · ${A.GROUPS[d.group].th}` }),
        el("span", { class: "sk__name", text: d.th }),
        el("span", { class: "sk__en", text: d.en }),
        el("p", { text: d.desc }),
        el("dl", {}, el("dt", { text: "ใช้ให้เกิดประโยชน์" }), el("dd", { text: d.use }),
          el("dt", { text: "ระวัง" }), el("dd", { text: d.watch }))));
    });
    const card = el("div", { class: "card stack" }, el("h3", { class: "subhead", text: "คะแนนทั้ง 12 จุดแข็ง (เต็ม 8)" }));
    const scores = row.strengthScores || {};
    // when the 3rd place shares its score with others, say so instead of implying a clear winner
    const third = row.strengths.length === 3 ? scores[row.strengths[2]] : undefined;
    const tied = third != null ? A.STRENGTH_KEYS.filter(k => !row.strengths.includes(k) && scores[k] === third) : [];
    const tieNote = !tied.length ? null : (el("p", { class: "muted",
      text: `${A.STRENGTHS[row.strengths[2]].th} ได้คะแนนเท่ากับ ${tied.map(k => A.STRENGTHS[k].th).join(", ")} (${third} คะแนน) ระบบเลือกอันดับ 3 จากจำนวนครั้งที่คุณตอบ "มาก" และผลเมื่อสองจุดแข็งนี้เจอกันตรงๆ ถือว่าใช้ได้ใกล้เคียงกัน` }));
    if (Object.keys(scores).length) {
      card.append(barList(Object.keys(A.GROUPS).map(g => ({
        group: A.GROUPS[g].th,
        rows: A.STRENGTH_KEYS.filter(k => A.STRENGTHS[k].group === g)
          .map(k => ({ label: A.STRENGTHS[k].th, value: scores[k] || 0, strong: row.strengths.includes(k) })),
      })), 8));
      card.append(el("p", { class: "muted", text: "คะแนนนี้เทียบจุดแข็งของคุณเองกับตัวเอง ไม่ได้เทียบกับคนอื่น คะแนนต่ำแปลว่าไม่ใช่เรื่องที่คุณใช้เป็นอันดับแรก ไม่ได้แปลว่าทำไม่ได้" }));
    }
    box.append(partHead("strengths"), top, card);
    if (tieNote) top.after(tieNote);
  }

  function renderMyType(row) {
    const box = $("#me-type"); box.textContent = "";
    if (!hasType(row)) { box.append(todoCard("type")); return; }
    const d = A.TYPES[row.type];
    const axes = el("div", { class: "axes" });
    Object.entries(A.PAIR_OF).forEach(([ax, [a, b]]) => {
      const pa = (row.typeScores && row.typeScores[ax]) ?? (row.type.includes(a) ? 60 : 40), pb = 100 - pa;
      axes.append(el("div", { class: "axis-row" },
        el("span", { class: pa > 50 ? "is-win" : "is-lose" }, el("b", { text: a }), ` ${A.AXES[ax].letters[a]} ${pa}%`),
        el("div", { class: "split", role: "img", "aria-label": `${a} ${pa}% ${b} ${pb}%` },
          el("i", { style: `width:${pa}%` }), el("i", { style: `width:${pb}%` })),
        el("span", { class: pb > 50 ? "is-win" : "is-lose" }, `${pb}% ${A.AXES[ax].letters[b]} `, el("b", { text: b }))));
    });
    box.append(partHead("type"),
      el("div", { class: "card stack" },
        el("div", { class: "row" }, el("span", { class: "type-big", text: row.type }),
          el("div", {}, el("div", { class: "hero__th", text: d.th }), el("p", { class: "muted", text: d.gist }))),
        axes,
        el("p", {}, el("b", { text: "ทำงานด้วยให้ดี: " }), d.tip),
        el("p", { class: "muted", text: "แกนที่ใกล้ 50% แปลว่าคุณใช้ได้ทั้งสองแบบ ตัวอักษรตัวนั้นอาจเปลี่ยนได้ถ้าทำซ้ำ" })));
  }

  // single-series horizontal bars: groups = [{group, rows:[{label, value, strong, who}]}]
  function barList(groups, max) {
    const wrap = el("div", { class: "bars" });
    groups.forEach(g => {
      wrap.append(el("div", { class: "bars__group", text: g.group }));
      g.rows.forEach(r => {
        const pct = max ? Math.round(r.value / max * 100) : 0;
        wrap.append(el("div", { class: "bar" + (r.value === 0 ? " is-gap" : ""), title: r.who || "" },
          el("span", { class: "bar__name", text: r.label, style: r.strong ? "font-weight:700" : "" }),
          el("span", { class: "bar__track", role: "img", "aria-label": `${r.label} ${r.value}` }, el("span", { class: "bar__fill", style: `width:${pct}%` })),
          el("span", { class: "bar__val", text: String(r.value) }),
          r.who ? el("span", { class: "bar__who", text: r.who }) : null));
      });
    });
    return wrap;
  }

  // ---------- team ----------
  document.querySelectorAll("#filter-seg button").forEach(b => b.addEventListener("click", () => {
    st.filter = b.dataset.f;
    document.querySelectorAll("#filter-seg button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    renderTeam();
  }));

  let teamTimer = null;
  async function loadTeam() {
    clearTimeout(teamTimer);
    try { st.rows = await api("/api/results"); $("#team-error").hidden = true; renderTeam(); }
    catch (e) { if (e.message !== "access_code") $("#team-error").hidden = false; }
    if (!$("#panel-team").hidden) teamTimer = setTimeout(loadTeam, 20000); // light refresh while the team view is open
  }

  function select(id) {
    st.sel = st.sel === id ? null : id;
    renderTeam();
    const dot = document.querySelector(`#team-map .dot[data-id="${id}"]`);
    if (dot && document.activeElement !== dot) dot.focus({ preventScroll: true });
  }

  function renderTeam() {
    const all = st.rows.filter(r => st.filter === "all" || r.team === st.filter);
    const styled = all.filter(hasStyle);
    if (st.sel && !all.some(r => r.id === st.sel)) st.sel = null;
    const meTag = r => (r.id === myId ? " (คุณ)" : "");

    $("#team-done").textContent = all.length
      ? `${all.length} คน · ทำ Social Style ${styled.length} · จุดแข็ง ${all.filter(hasStrengths).length} · บุคลิก 4 ตัวอักษร ${all.filter(hasType).length}`
      : "";

    // style counts
    const tiles = $("#tiles"); tiles.textContent = "";
    ORDER.forEach(k => {
      const n = styled.filter(r => r.style === k).length;
      tiles.append(el("div", { class: `tile tone-${k}` },
        el("span", { class: "tile__label", text: `${S[k].name} · ${S[k].color}` }),
        el("span", { class: "tile__num", text: String(n) }),
        el("span", { class: "tile__unit", text: styled.length ? `คน · ${Math.round(n / styled.length * 100)}%` : "คน" })));
    });

    // map
    mountMap($("#team-map"), mapSvg(styled.map(r => ({ id: r.id, a: r.a, r: r.r, style: r.style, name: r.name, team: r.team, isMe: r.id === myId })),
      { selectedId: st.sel, onSelect: select }));

    // selected person's card: style + type + strengths
    const spot = $("#spot"); spot.textContent = "";
    const cur = all.find(r => r.id === st.sel);
    if (cur) {
      const tone = hasStyle(cur) ? cur.style : "none";
      spot.className = `spot tone-${tone}`;
      spot.append(el("div", { class: "spot__head" },
        el("span", { class: "spot__name", text: cur.name + meTag(cur) }),
        hasStyle(cur) ? el("span", { class: `chip tone-${cur.style}`, text: `${S[cur.style].name} · ${S[cur.style].th}` }) : null,
        el("span", { class: "badge", text: teamName(cur.team) }),
        hasStyle(cur) && isNearLine(cur.a, cur.r) ? el("span", { class: "badge", text: "ใกล้เส้นแบ่ง" }) : null));
      const typeRow = el("div", { class: "spot__row" }, el("span", { class: "spot__key", text: "บุคลิก" }));
      typeRow.append(hasType(cur)
        ? el("span", {}, el("b", { class: "pill--mono", text: cur.type }), ` ${A.TYPES[cur.type].th} · ${A.TYPES[cur.type].tip}`)
        : el("span", { class: "muted", text: "ยังไม่ได้ทำ" }));
      const strRow = el("div", { class: "spot__row" }, el("span", { class: "spot__key", text: "จุดแข็ง" }));
      if (hasStrengths(cur)) cur.strengths.forEach(k => strRow.append(el("span", { class: "pill", text: A.STRENGTHS[k].th })));
      else strRow.append(el("span", { class: "muted", text: "ยังไม่ได้ทำ" }));
      spot.append(typeRow, strRow);
      if (hasStyle(cur)) spot.append(
        el("span", { class: "spot__label", text: cur.id === myId ? "คนอื่นคุยกับคุณให้ได้ผล ถ้า…" : `คุยกับ${cur.name}ให้ได้ผล` }),
        list(S[cur.style].talk));
      spot.hidden = false;
    } else spot.hidden = true;

    renderStyleInsight(styled);
    renderTeamStrengths(all);
    renderTeamTypes(all);
    renderPeople(all);
  }

  function renderStyleInsight(rows) {
    const ins = $("#insight"); ins.textContent = "";
    if (rows.length < 3) { ins.hidden = true; return; }
    const counts = ORDER.map(k => [k, rows.filter(r => r.style === k).length]).sort((a, b) => b[1] - a[1]);
    const [topK, topN] = counts[0];
    const missing = counts.filter(x => x[1] === 0).map(x => S[x[0]].name);
    ins.append(el("h3", { class: "subhead", text: "สไตล์การสื่อสารของทีม" }),
      el("p", { text: `สไตล์ที่มีมากที่สุดคือ ${S[topK].name} (${topN} จาก ${rows.length} คน) ทีมอาจมองลูกค้าหรือปัญหาจากมุมของ ${S[topK].name} มากเกินไป ลองชวนคนสไตล์อื่นมาช่วยมองด้วย` }));
    if (missing.length) ins.append(el("p", { text: `ยังไม่มีคนสไตล์ ${missing.join(", ")} ในกลุ่มนี้ เวลาเจอลูกค้าสไตล์นี้ ทีมอาจต้องตั้งใจปรับวิธีคุยมากเป็นพิเศษ` }));
    ins.hidden = false;
  }

  function renderTeamStrengths(all) {
    const box = $("#team-strengths"); box.textContent = "";
    const rows = all.filter(hasStrengths);
    box.append(el("h3", { class: "subhead", text: "จุดแข็งของทีม" }));
    if (!rows.length) { box.append(el("p", { class: "muted", text: "ยังไม่มีใครทำแบบทดสอบจุดแข็ง" })); return; }
    box.append(el("p", { class: "muted", text: `จำนวนคนที่มีจุดแข็งนั้นอยู่ใน 3 อันดับแรก (จาก ${rows.length} คน)` }));
    const holders = k => rows.filter(r => r.strengths.includes(k));
    box.append(barList(Object.keys(A.GROUPS).map(g => ({
      group: `${A.GROUPS[g].th} · ${rows.reduce((n, r) => n + r.strengths.filter(k => A.STRENGTHS[k].group === g).length, 0)}`,
      rows: A.STRENGTH_KEYS.filter(k => A.STRENGTHS[k].group === g).map(k => {
        const h = holders(k);
        return { label: A.STRENGTHS[k].th, value: h.length, who: h.map(r => r.name).join(", ") };
      }),
    })), rows.length));
    const gaps = A.STRENGTH_KEYS.filter(k => !holders(k).length).map(k => A.STRENGTHS[k].th);
    if (gaps.length) box.append(el("p", {}, el("b", { text: "ยังไม่มีใครถนัดเป็นอันดับต้นๆ: " }), gaps.join(", "),
      " งานที่ต้องใช้จุดแข็งเหล่านี้ อาจต้องวางขั้นตอนหรือหาคนช่วยเสริม"));
  }

  function renderTeamTypes(all) {
    const box = $("#team-types"); box.textContent = "";
    const rows = all.filter(hasType);
    box.append(el("h3", { class: "subhead", text: "บุคลิก 4 ตัวอักษรของทีม" }));
    if (!rows.length) { box.append(el("p", { class: "muted", text: "ยังไม่มีใครทำแบบทดสอบบุคลิก 4 ตัวอักษร" })); return; }
    const axes = el("div", { class: "axes" });
    Object.entries(A.PAIR_OF).forEach(([ax, [a, b]]) => {
      const na = rows.filter(r => r.type.includes(a)).length, nb = rows.length - na;
      const pa = Math.round(na / rows.length * 100);
      axes.append(el("div", { class: "axis-row" },
        el("span", { class: na >= nb ? "is-win" : "is-lose" }, el("b", { text: a }), ` ${A.AXES[ax].letters[a]} · ${na} คน`),
        el("div", { class: "split", role: "img", "aria-label": `${a} ${na} คน ${b} ${nb} คน` },
          el("i", { style: `width:${pa}%` }), el("i", { style: `width:${100 - pa}%` })),
        el("span", { class: nb >= na ? "is-win" : "is-lose" }, `${nb} คน · ${A.AXES[ax].letters[b]} `, el("b", { text: b }))));
    });
    const counts = {};
    rows.forEach(r => (counts[r.type] = counts[r.type] || []).push(r.name));
    const types = el("div", { class: "types" });
    Object.entries(counts).sort((x, y) => y[1].length - x[1].length || x[0].localeCompare(y[0])).forEach(([t, names]) =>
      types.append(el("span", { class: "pill", title: names.join(", ") },
        el("b", { class: "pill--mono", text: t }), ` ${A.TYPES[t].th} · ${names.length}`)));
    box.append(axes, types);
  }

  function renderPeople(all) {
    const p = $("#people"); p.textContent = "";
    if (!all.length) {
      p.append(el("div", { class: "empty" },
        el("strong", { text: "ยังไม่มีใครทำแบบทดสอบ" }),
        el("span", { text: "ส่งลิงก์หน้านี้ให้ทีม Sales และ Marketing ผลของแต่ละคนจะขึ้นที่นี่หลังกดบันทึก" })));
      return;
    }
    [...ORDER, "none"].forEach(k => {
      const members = all.filter(r => (k === "none" ? !hasStyle(r) : r.style === k)).sort((x, y) => x.name.localeCompare(y.name, "th"));
      if (!members.length) return;
      const title = k === "none" ? "ยังไม่ได้ทำ Social Style" : `${S[k].name} · ${S[k].th}`;
      const group = el("div", { class: `group tone-${k}` },
        el("div", { class: "group__head" }, el("span", { text: title }), el("span", { class: "group__count", text: String(members.length) })));
      members.forEach(r => {
        const sub = [teamName(r.team), hasType(r) ? r.type : null, hasStrengths(r) ? A.STRENGTHS[r.strengths[0]].th : null].filter(Boolean).join(" · ");
        const row = el("div", { class: `person tone-${k}${st.sel === r.id ? " is-sel" : ""}`, role: "button", tabindex: "0", "aria-pressed": String(st.sel === r.id) },
          el("span", { class: "avatar", "aria-hidden": "true", text: initial(r.name) }),
          el("div", { class: "person__info" },
            el("div", { class: "person__name", text: r.name + (r.id === myId ? " (คุณ)" : "") }),
            el("div", { class: "person__team", text: sub })),
          hasStyle(r) && isNearLine(r.a, r.r) ? el("span", { class: "badge", text: "ใกล้เส้นแบ่ง" }) : el("span"));
        row.addEventListener("click", () => { select(r.id); $("#team-map").scrollIntoView({ behavior: "smooth", block: "center" }); });
        row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); row.click(); } });
        group.append(row);
      });
      p.append(group);
    });
  }

  // ---------- boot ----------
  async function boot() {
    try { await api("/api/config"); } catch (e) { if (e.message !== "access_code") showApp(); return; }
    showApp();
    try {
      st.me = await api("/api/results/" + myId);
      PART_KEYS.forEach(k => {
        const saved = st.me[ANS_KEY[k]];
        if (Array.isArray(saved) && saved.length === PARTS[k].items.length) st.ans[k] = saved.slice();
      });
      $("#name").value = st.me.name || "";
      if (st.me.team) setTeam(st.me.team);
      loadDraft();
      st.part = PART_KEYS.find(k => !PARTS[k].done(st.me)) || "style";
      renderParts(); renderWho(false);
      if (PART_KEYS.some(k => PARTS[k].done(st.me))) showTab("tab-me");
    } catch { /* first visit: nothing saved yet */ }
  }
  function showApp() { $("#gate").hidden = true; $("#app").hidden = false; }

  loadDraft();
  renderParts();
  renderWho(false);
  boot();
})();
