/* ============================================================
 * 人教版数学 · 章节同步教练 —— 核心逻辑
 * 路由 + 状态持久化 + 章节主线/学习页/练习/错题/复习/方法库/进度
 * 技巧串联：练习答错→错题本(techniques.captureMistake)；
 *           标记已梳理→进入间隔复习(techniques.ensureReview)；
 *           复习队列由 Leitner 调度(techniques.promote)。
 * ============================================================ */
const STORE_KEY = "pepMathCoach.v1";

/* ---------- 状态与持久化 ---------- */
function loadState() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; } catch (e) { return null; }
}
let state = loadState() || { chapters: {}, mistakes: [], review: {}, knowledgeDone: {}, logs: [] };
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
}

/* ---------- 通用工具 ---------- */
const $ = s => document.querySelector(s);
const view = () => document.getElementById("view");
function esc(s) { return (s == null ? "" : "" + s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function chapterById(id) { return CHAPTERS.find(c => c.id === id) || (window.Oly ? Oly.chapterById(id) : null); }
function isMastered(id) { return !!(state.chapters[id] && state.chapters[id].mastered); }
function isKnowledgeDone(id) { return !!state.knowledgeDone[id]; }
function chapterMistakeCount(id) { return state.mistakes.filter(m => m.chId === id && !m.resolved).length; }

/* ---------- 解锁：年级/册内顺序解锁，组内首章恒开放 ---------- */
function groupKey(ch) { return ch.stage + "|" + ch.grade; }
function unlocked(ch) {
  const same = CHAPTERS.filter(c => groupKey(c) === groupKey(ch)).sort((a, b) => CHAPTER_ORDER[a.id] - CHAPTER_ORDER[b.id]);
  const i = same.findIndex(c => c.id === ch.id);
  if (i <= 0) return true;
  const prev = same[i - 1];
  return isMastered(prev.id);
}

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2200);
}

function updateBadges() {
  const mb = $(".nav-link[data-route='mistakes'] .badge");
  const rb = $(".nav-link[data-route='review'] .badge");
  const mCount = state.mistakes.filter(m => !m.resolved).length;
  const rCount = TECH.reviewStats().due;
  if (mb) { mb.textContent = mCount; mb.classList.toggle("show", mCount > 0); }
  if (rb) { rb.textContent = rCount; rb.classList.toggle("show", rCount > 0); }
}

/* ---------- 章节树辅助 ---------- */
function gradesOfStage(stage) {
  const set = [];
  CHAPTERS.forEach(c => { if (c.stage === stage && set.indexOf(c.grade) < 0) set.push(c.grade); });
  return set;
}
function volumesOf(grade) {
  const set = [];
  CHAPTERS.forEach(c => { if (c.grade === grade && set.indexOf(c.vol) < 0) set.push(c.vol); });
  return set;
}
function chaptersOf(grade, vol) {
  return CHAPTERS.filter(c => c.grade === grade && c.vol === vol).sort((a, b) => a.no - b.no);
}

/* ============================================================
 * 路由
 * ============================================================ */
let curStage = STAGES[0].id;
function route() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  const parts = h.split("/");
  const top = parts[0] || "home";
  document.body.setAttribute("data-route", top);
  document.querySelectorAll(".nav-link").forEach(a => a.classList.toggle("active", a.dataset.route === top));
  updateBadges();
  if (top.indexOf("scan") === 0) return renderScan(h);
  if (top === "home") return renderHome(parts[1] || curStage);
  if (top === "learn") return renderLearn(parts[1]);
  if (top === "practice") return renderPractice(parts[1], parts[2] === "again");
  if (top === "mistakes") return renderMistakes();
  if (top === "oly") return renderOly(parts.slice(1));
  if (top === "review") return renderReview();
  if (top === "methods") return renderMethods(parts[1] === "anim" ? parts[2] : null);
  if (top === "ai") return renderDiagnose();
  if (top === "progress") return renderProgress();
  renderHome(curStage);
}
window.addEventListener("hashchange", route);

/* ============================================================
 * 首页：章节主线（学段 → 年级/册 → 分册 → 章）
 * ============================================================ */
function renderHome(stage) {
  if (stage) curStage = stage;
  let html = `<div class="stage-tabs">`;
  STAGES.forEach(s => {
    html += `<button class="stage-tab ${s.id === curStage ? "on" : ""}" data-stage="${s.id}">${s.id}</button>`;
  });
  html += `</div><p class="stage-desc">${esc(STAGES.find(s => s.id === curStage).desc)}</p>`;

  gradesOfStage(curStage).forEach(grade => {
    html += `<section class="grade-block"><h2 class="grade-h">${esc(grade)}</h2>`;
    volumesOf(grade).forEach(vol => {
      const volLabel = vol ? "（" + vol + "）" : "";
      html += `<div class="vol-h">${volLabel || " "}</div><div class="ch-grid">`;
      chaptersOf(grade, vol).forEach(ch => {
        const open = unlocked(ch);
        const m = isMastered(ch.id);
        const kd = isKnowledgeDone(ch.id);
        const mc = chapterMistakeCount(ch.id);
        const badges = [];
        if (m) badges.push(`<span class="chip chip-ok">已掌握</span>`);
        if (kd) badges.push(`<span class="chip chip-k">已梳理</span>`);
        if (mc > 0) badges.push(`<span class="chip chip-m">错${mc}</span>`);
        html += `<a class="ch-card ${open ? "" : "locked"}" href="#/learn/${ch.id}">
          <div class="ch-no">第${ch.no}章</div>
          <div class="ch-title">${open ? esc(ch.title) : "🔒 " + esc(ch.title)}</div>
          <div class="ch-badges">${badges.join("") || (open ? "" : '<span class="chip">需先掌握上一章</span>')}</div>
        </a>`;
      });
      html += `</div>`;
    });
    html += `</section>`;
  });
  view().innerHTML = html;
  view().querySelectorAll(".stage-tab").forEach(b => b.addEventListener("click", () => renderHome(b.dataset.stage)));
}

/* ============================================================
 * 章节学习页
 * ============================================================ */
function renderLearn(chId) {
  const ch = chapterById(chId);
  if (!ch) return renderHome();
  if (!unlocked(ch)) { toast("请先掌握上一章再进入"); return renderHome(curStage); }

  let html = `<a class="back" href="#/home">← 返回主线</a>
    <div class="learn-head">
      <div class="lh-meta">${esc(ch.stage)} · ${esc(ch.grade)}${ch.vol ? "（" + esc(ch.vol) + "）" : ""}</div>
      <h1 class="lh-title">第${ch.no}章 ${esc(ch.title)}</h1>
      <p class="lh-sum">${esc(ch.summary || "（内容建设中）")}</p>
    </div>`;

  // 本阶段学习方法
  const meths = chapterMethods(ch);
  html += `<section class="panel"><h3 class="panel-h">📘 本阶段配套学习方法</h3><div class="meth-list">`;
  meths.forEach(mid => {
    const m = METHODS[mid]; if (!m) return;
    html += `<div class="meth"><div class="meth-name">${esc(m.name)}</div><div class="meth-desc">${esc(m.desc)}</div>
      <ol class="meth-steps">${m.steps.map(s => `<li><b>${esc(s.t)}</b> ${esc(s.d)}</li>`).join("")}</ol></div>`;
  });
  html += `</div><p class="hint">完整方法库见 <a href="#/methods">学习方法库 →</a></p></section>`;

  // 知识梳理
  html += `<section class="panel"><h3 class="panel-h">🧠 知识梳理</h3>`;
  if (ch.knowledge && ch.knowledge.length) {
    html += TECH.buildMindmap(ch);
    html += `<div class="know-cards">`;
    ch.knowledge.forEach(k => {
      html += `<div class="know"><div class="know-term">${esc(k.term)}</div><div class="know-def">${esc(k.def)}</div>${k.tip ? `<div class="know-tip">💡 ${esc(k.tip)}</div>` : ""}</div>`;
    });
    html += `</div>`;
    const kd = isKnowledgeDone(ch.id);
    html += `<button class="btn ${kd ? "btn-ghost" : "btn-primary"}" id="btnKnow">${kd ? "✓ 已梳理（点此重新排程复习）" : "我已梳理本章知识 → 排进间隔复习"}</button>`;
  } else {
    html += `<p class="hint">本章知识卡建设中。先去 <a href="#/practice/${ch.id}">练习</a> 打基础。</p>`;
  }
  html += `</section>`;

  // 本章解题技巧（来自融会贯通技巧库，按主线映射）
  const techs = Integ.chapterTechs(ch);
  if (techs.length) {
    html += `<section class="panel"><h3 class="panel-h">📐 本章解题技巧（融会贯通技巧库）</h3>
      <p class="hint">下列解题方法已按本章主线自动匹配：配有动图的方法卡内直接嵌入了交互演示（点 ▶ 播放）；未配动图的可通过「去动图演示库」跳转观看。</p>
      <div class="tech-list">`;
    techs.forEach(t => { html += Integ.renderTechCard(t); });
    html += `</div></section>`;
  }

  // 例题/练习入口
  html += `<section class="panel"><h3 class="panel-h">✏️ 例题与练习</h3>`;
  const sample = Integ.chapterPracticeItems(ch, 3);
  if (sample.length) {
    const hasGen = techs.some(t => typeof t.qgen === "function");
    html += `<p class="hint">${hasGen ? "本章由参数化引擎随机出题（每轮不重样），以下为示例：" : "本章配套题，建议先预习、再精读、后练习。"}</p>`;
    html += `<div class="q-preview">`;
    sample.forEach((q, i) => { html += `<div class="q-item"><span class="q-idx">${i + 1}</span> ${esc(q.q)}</div>`; });
    html += `</div>`;
    html += `<a class="btn btn-primary" href="#/practice/${ch.id}">开始练习（答错自动入错题本）</a>`;
  } else {
    html += `<p class="hint">本章练习建设中。</p>`;
  }
  html += `</section>`;

  // 技巧面板
  const mc = chapterMistakeCount(ch.id);
  const revKey = "k:" + ch.id;
  const revDue = state.review[revKey] && !state.review[revKey].done && state.review[revKey].due <= Date.now();
  html += `<section class="panel tech-panel"><h3 class="panel-h">🔁 本章学习技巧状态</h3>
    <ul class="tech-state">
      <li>知识梳理：${isKnowledgeDone(ch.id) ? "已标记，进入间隔复习" : "未完成"}</li>
      <li>错题复盘：本章 ${mc} 道错题 ${mc ? '<a href="#/mistakes">去复盘 →</a>' : "（暂无）"}</li>
      <li>间隔巩固：${revDue ? '<span class="chip chip-m">今天待复习</span>' : "暂无到期"}</li>
    </ul></section>`;

  if (ch.built) {
    html += `<div class="learn-actions">
      <a class="btn btn-primary" href="#/practice/${ch.id}">去练习</a>
      <button class="btn btn-ok" id="btnMaster">标记本章已掌握（解锁下一章）</button>
    </div>`;
  }

  view().innerHTML = html;
  Integ.mountAnimBoxes(view());
  const bk = $("#btnKnow"); if (bk) bk.addEventListener("click", () => {
    state.knowledgeDone[ch.id] = true; TECH.ensureReview("k:" + ch.id); save(); toast("已排进间隔复习 ✓"); renderLearn(chId);
  });
  const bm = $("#btnMaster"); if (bm) bm.addEventListener("click", () => {
    state.chapters[ch.id] = state.chapters[ch.id] || {}; state.chapters[ch.id].mastered = true; save();
    toast("已掌握，下一章已解锁 ✓"); renderLearn(chId);
  });
}

/* ============================================================
 * 练习（答错自动入错题本）
 * ============================================================ */
let prac = null;
function renderPractice(chId, again) {
  const ch = chapterById(chId);
  if (!ch) return renderHome();
  const preItems = Integ.chapterPracticeItems(ch, 8);
  if (!preItems.length) { view().innerHTML = `<a class="back" href="#/learn/${chId}">← 返回</a><p class="hint">本章暂无可出的练习题。</p>`; return; }
  if (!prac || prac.chId !== chId || again) {
    prac = { chId, idx: 0, correct: 0, total: preItems.length, items: preItems, done: false };
  }
  if (prac.done) return renderPracticeSummary(ch);

  const q = prac.items[prac.idx];
  let html = `<a class="back" href="#/learn/${chId}">← 返回学习页</a>
    <div class="prac-head">第 ${prac.idx + 1} / ${prac.total} 题 · ${esc(ch.title)}</div>`;
  if (q.fig) html += figures(q.fig);
  html += `<div class="q-text">${esc(q.q)}</div><div class="opts">`;
  q.options.forEach((o, i) => { html += `<button class="opt" data-i="${i}">${esc(o)}</button>`; });
  html += `</div><div class="prac-fb" id="fb"></div>`;
  html += `<div class="prac-nav"><button class="btn btn-ghost" id="nextBtn" disabled>下一题 →</button></div>`;
  view().innerHTML = html;

  const fb = $("#fb"); const next = $("#nextBtn");
  view().querySelectorAll(".opt").forEach(btn => btn.addEventListener("click", () => {
    const i = +btn.dataset.i;
    const right = i === q.ans;
    if (right) prac.correct++;
    else TECH.captureMistake({ chId, qKey: q.key || ("q" + prac.idx), q: q.q, options: q.options, ans: q.ans, myAns: i, explain: q.explain, fig: q.fig });
    view().querySelectorAll(".opt").forEach(b => b.disabled = true);
    btn.classList.add(right ? "opt-right" : "opt-wrong");
    if (!right) { const rb = view().querySelector(`.opt[data-i="${q.ans}"]`); if (rb) rb.classList.add("opt-right"); }
    fb.innerHTML = `<div class="fb-${right ? "ok" : "no"}">${right ? "✓ 答对了" : "✗ 答错了，已记入错题本"}</div>
      <div class="fb-exp">${esc(q.explain || "")}</div>`;
    next.disabled = false;
    updateBadges();
  }));
  next.addEventListener("click", () => {
    prac.idx++;
    if (prac.idx >= prac.total) { prac.done = true; return renderPracticeSummary(ch); }
    renderPractice(chId);
  });
}

function renderPracticeSummary(ch) {
  const allRight = prac.correct === prac.total;
  let html = `<a class="back" href="#/learn/${ch.id}">← 返回学习页</a>
    <div class="summary">
      <h2>练习完成</h2>
      <p>答对 <b>${prac.correct}</b> / ${prac.total} 题</p>`;
  if (allRight) {
    html += `<p class="ok-line">全对！可标记本章已掌握。</p>
      <button class="btn btn-ok" id="mBtn">标记已掌握（解锁下一章）</button>`;
  } else {
    html += `<p class="warn-line">有错题已入错题本，建议去 <a href="#/mistakes">错题复盘</a>。</p>`;
  }
  html += `<div class="summary-actions">
      <a class="btn btn-primary" href="#/practice/${ch.id}/again">再练一组（换一批题）</a>
      <a class="btn btn-ghost" href="#/learn/${ch.id}">返回学习页</a>
    </div></div>`;
  view().innerHTML = html;
  const mb = $("#mBtn"); if (mb) mb.addEventListener("click", () => {
    state.chapters[ch.id] = state.chapters[ch.id] || {}; state.chapters[ch.id].mastered = true; save();
    toast("已掌握，下一章已解锁 ✓"); renderLearn(ch.id);
  });
}

/* ============================================================
 * 错题本（三问 + 错因标签）
 * ============================================================ */
function renderMistakes() {
  const list = state.mistakes.filter(m => !m.resolved);
  let html = `<a class="back" href="#/home">← 返回主线</a>
    <h1 class="page-h">错题本（${list.length}）</h1>`;
  if (!list.length) { html += `<p class="hint">还没有错题。练习时答错的题会自动出现在这里。</p>`; view().innerHTML = html; return; }
  html += `<div class="print-toolbar">
      <button class="btn btn-primary" id="btnPrint">🖨️ 打印错题卷（${list.length} 题 · 附核对二维码）</button>
      <p class="hint">点击后生成纸质卷子并打印，<b>同时清空当前错题库</b>；孩子做完后，家长扫描卷尾二维码，勾选“又做错”的题即可重新入库。</p>
    </div>`;
  list.forEach(m => {
    const ch = chapterById(m.chId);
    const myAnsText = (m.myAns >= 0 && m.options && m.options[m.myAns] != null) ? m.options[m.myAns] : "（纸上作答）";
    html += `<div class="mistake" data-id="${esc(m.id)}">
      <div class="mk-head">${esc(ch ? (ch.stage + "·" + ch.title) : m.chId)}</div>
      <div class="mk-q">${esc(m.q)}</div>
      <div class="mk-ans">你的答案：<b class="no">${esc(myAnsText)}</b> ｜ 正确：<b class="ok">${esc((m.options && m.options[m.ans]) != null ? m.options[m.ans] : "")}</b></div>
      <div class="mk-exp">解析：${esc(m.explain || "")}</div>
      <div class="mk-tags">错因：`;
    TECH.MISTAKE_TAGS.forEach(t => {
      const on = (m.tags || []).indexOf(t.id) >= 0;
      html += `<button class="tag ${on ? "on" : ""}" data-tag="${t.id}">${t.label}</button>`;
    });
    html += `</div>
      <details class="mk-review"><summary>三问复盘</summary>
        <textarea class="ta" data-f="why" placeholder="① 为什么错？">${esc(m.reason && m.reason.why || "")}</textarea>
        <textarea class="ta" data-f="right" placeholder="② 正确思路是什么？">${esc(m.reason && m.reason.right || "")}</textarea>
        <textarea class="ta" data-f="how" placeholder="③ 以后怎么避免？">${esc(m.reason && m.reason.how || "")}</textarea>
      </details>
      <div class="mk-actions">
        <button class="btn btn-primary mk-save">保存复盘</button>
        <button class="btn btn-ghost mk-practice">重做本题</button>
      </div>
    </div>`;
  });
  view().innerHTML = html;
  const bprint = $("#btnPrint");
  if (bprint) bprint.addEventListener("click", () => openPrintSheet(list));
  view().querySelectorAll(".mistake").forEach(card => {
    const id = card.dataset.id;
    const m = state.mistakes.find(x => x.id === id);
    card.querySelectorAll(".tag").forEach(t => t.addEventListener("click", () => {
      m.tags = m.tags || [];
      const i = m.tags.indexOf(t.dataset.tag);
      if (i >= 0) m.tags.splice(i, 1); else m.tags.push(t.dataset.tag);
      t.classList.toggle("on"); save();
    }));
    card.querySelector(".mk-save").addEventListener("click", () => {
      m.reason = {
        why: card.querySelector('[data-f="why"]').value,
        right: card.querySelector('[data-f="right"]').value,
        how: card.querySelector('[data-f="how"]').value
      };
      save(); toast("复盘已保存 ✓");
    });
    card.querySelector(".mk-practice").addEventListener("click", () => {
      if (m.chId && m.chId.indexOf("oly:") === 0) {
        const seg = m.chId.split(":");          // oly:<年级号>:<专题id>
        const gk = seg[1], tid = seg[2];
        location.hash = (tid && tid !== "__all__") ? ("#/oly/p/" + gk + "/" + tid) : ("#/oly/p/" + gk);
      } else { location.hash = "#/practice/" + m.chId; }
    });
  });
}

/* ============================================================
 * 错题卷打印（带核对二维码；打印后清空错题库）
 * ============================================================ */
function pad2(n) { return (n < 10 ? "0" : "") + n; }

/* 清空「未清零」错题及其对应的间隔复习条目 */
function clearOpenMistakes() {
  state.mistakes.filter(m => !m.resolved).forEach(m => { delete state.review["m:" + m.id]; });
  state.mistakes = state.mistakes.filter(m => m.resolved);
  save();
  updateBadges();
}

/* 纯函数：组装可打印卷子 HTML（供打印与预览复用） */
function buildPaperHtml(list, ranges, qrs, dateStr) {
  let html = `<div class="paper">
    <div class="paper-head">
      <div class="paper-title">错 题 重 做 卷</div>
      <div class="paper-meta">共 ${list.length} 题 · 生成日期 ${dateStr} · 人教版数学 · 章节同步教练</div>
    </div>
    <div class="paper-tip">说明：请在横线上作答或写过程。做完交给家长，家长扫描卷尾二维码逐批核对，把再次做错的题重新加入错题本。（本卷打印后，电子错题本已同步清空。）</div>`;

  list.forEach((m, i) => {
    const ch = chapterById(m.chId);
    html += `<div class="pq">
      <div class="pq-no">${i + 1}.（${esc(ch ? ch.title : m.chId)}）</div>
      <div class="pq-q">${esc(m.q)}</div>`;
    if (m.fig) html += `<div class="paper-figs">${figures(m.fig)}</div>`;
    html += `<div class="pq-opts">`;
    (m.options || []).forEach((o, k) => { html += `<span class="pq-opt">${"ABCDEFGH"[k] || (k + 1)}. ${esc(o)}</span>`; });
    html += `</div><div class="pq-blank"></div></div>`;
  });

  html += `<div class="qr-section"><div style="font-weight:700;margin-bottom:6px">家长核对区 · 扫码核对又做错的题</div>`;
  qrs.forEach(q => {
    const r = ranges[q.i];
    html += `<div class="qr-block">
      <div class="qr-img">${q.html}</div>
      <div class="qr-txt">
        <b>第 ${q.i + 1} / ${qrs.length} 批 · 第 ${r.from}–${r.to} 题（共 ${r.n} 题）</b><br>
        用手机扫描此二维码进入核对页，勾选孩子<b>再次做错</b>的题目，确认后自动重新加入错题本。
      </div></div>`;
  });
  html += `</div></div>`;
  return html;
}

/* 纯函数：组装扫码核对列表 HTML（供渲染与预览复用） */
function buildScanHtml(items) {
  let html = `<p class="hint">本批共 ${items.length} 题，请逐题核对后再确认。</p>`;
  items.forEach((it, i) => {
    const ansText = (it.o && it.o[it.a] != null) ? it.o[it.a] : "";
    html += `<div class="sc-item" data-i="${i}">
      <div class="sc-q"><span class="sc-no">${i + 1}.</span>${esc(it.q)}</div>`;
    if (it.f) html += figures(it.f);
    html += `<div class="sc-ans">正确答案：<b>${esc(("ABCDEFGH"[it.a] || "") + (ansText ? ". " + ansText : ""))}</b></div>`;
    if (it.e) html += `<div class="sc-exp">解析：${esc(it.e)}</div>`;
    html += `<label class="sc-check"><input type="checkbox" class="sc-cb" data-i="${i}"> 孩子又做错了</label>
    </div>`;
  });
  html += `<div class="scan-bar">
      <span class="cnt" id="scCnt">已勾选 0 题</span>
      <button class="btn btn-ghost" id="scAll">全选 / 取消</button>
      <button class="btn btn-primary" id="scConfirm">确认 · 重新加入错题库</button>
    </div>`;
  return html;
}

function openPrintSheet(list) {
  if (!list || !list.length) { toast("错题本为空，暂无可打印内容"); return; }
  if (!window.PrintScan) { toast("打印组件未就绪，请刷新页面重试"); return; }

  // 1) 把整批错题切成若干「能装进单个二维码」的子批
  let chunks;
  try { chunks = PrintScan.splitFitChunks(list); }
  catch (e) { toast("二维码数据编码失败：" + ((e && e.message) || e)); return; }
  if (!chunks.length) { toast("无法生成二维码，请重试"); return; }

  // 2) 打印前二次确认（会清空错题库）
  const ok = window.confirm(
    "将生成带二维码的错题卷并开始打印，\n同时清空当前错题库（共 " + list.length + " 题）。\n\n" +
    "孩子做完卷子后，家长扫描卷尾二维码，勾选“又做错”的题即可重新加入错题本。\n\n确定继续？"
  );
  if (!ok) return;

  // 3) 逐批生成二维码 SVG，并标注覆盖的题号区间
  let cursor = 0;
  const ranges = chunks.map(ck => { const r = { from: cursor + 1, to: cursor + ck.length, n: ck.length }; cursor += ck.length; return r; });
  const qrs = chunks.map((ck, i) => {
    const b64 = PrintScan.encodeList(ck);
    return { i, n: ck.length, html: PrintScan.qrHtml(PrintScan.buildUrl(b64)) };
  });
  if (qrs.some(q => !q.html)) { toast("二维码生成失败，请重试或分批打印"); return; }

  // 4) 组装可打印卷子
  const now = new Date();
  const dateStr = now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate());
  const html = buildPaperHtml(list, ranges, qrs, dateStr);
  const pa = document.getElementById("printArea");
  pa.innerHTML = html;

  // 5) 同时清空当前错题库
  clearOpenMistakes();

  // 6) 等二维码图片就绪后再打印（避免打出空白码），并收尾
  toast("错题卷已生成，错题库已清空 ✓");
  let printed = false;
  const doPrint = () => {
    if (printed) return; printed = true;
    try { window.print(); } catch (e) {}
    setTimeout(() => {
      const a = document.getElementById("printArea"); if (a) a.innerHTML = "";
      if (location.hash.replace(/^#\/?/, "").split("/")[0] === "mistakes") renderMistakes();
    }, 500);
  };
  const imgs = pa.querySelectorAll("img");
  if (!imgs.length) { doPrint(); }
  else {
    let pending = imgs.length;
    const one = () => { if (--pending <= 0) doPrint(); };
    Array.prototype.forEach.call(imgs, im => {
      if (im.complete) one(); else { im.addEventListener("load", one); im.addEventListener("error", one); }
    });
    setTimeout(doPrint, 900); // 兜底：图片事件万一不触发也照常打印
  }
}

/* ============================================================
 * 扫码核对页（#/scan?d=<批次数据>）
 * 家长扫错题卷卷尾二维码进入，勾选再次做错的题 → 重新加入错题库
 * ============================================================ */
function renderScan(hash) {
  const mm = (hash || "").match(/[?&]d=([^&]+)/);
  const data = mm ? mm[1] : "";
  let items = [], err = "";
  if (!data) {
    err = "未识别到二维码数据。请扫描错题卷卷尾的二维码进入本页。";
  } else if (!window.PrintScan) {
    err = "解码组件未就绪，请刷新页面后重试。";
  } else {
    try { items = PrintScan.decodePayload(data) || []; }
    catch (e) { err = "二维码数据解析失败，可能是扫描不完整，请对准整张二维码重扫。"; }
  }

  let html = `<a class="back" href="#/home">← 返回主线</a>
    <div class="scan-head"><h1>错题核对 · 扫码重做卷</h1>
      <p>对照孩子的纸质卷子逐题核对，勾选<b>再次做错</b>的题目，确认后重新加入错题本。</p></div>`;
  if (err) { html += `<div class="empty">${esc(err)}</div>`; view().innerHTML = html; return; }
  if (!items.length) { html += `<div class="empty">本批没有可核对的题目。</div>`; view().innerHTML = html; return; }

  html += buildScanHtml(items);
  view().innerHTML = html;

  const cbs = () => view().querySelectorAll(".sc-cb");
  const refresh = () => {
    const n = Array.prototype.filter.call(cbs(), c => c.checked).length;
    const cnt = document.getElementById("scCnt"); if (cnt) cnt.textContent = "已勾选 " + n + " 题";
    view().querySelectorAll(".sc-item").forEach(card => {
      const cb = card.querySelector(".sc-cb");
      card.classList.toggle("wrong", !!(cb && cb.checked));
    });
  };
  cbs().forEach(cb => cb.addEventListener("change", refresh));
  const allBtn = document.getElementById("scAll");
  if (allBtn) allBtn.addEventListener("click", () => {
    const all = Array.prototype.slice.call(cbs());
    const on = all.length > 0 && all.every(c => c.checked);
    all.forEach(c => { c.checked = !on; });
    refresh();
  });
  const cf = document.getElementById("scConfirm");
  if (cf) cf.addEventListener("click", () => {
    const picked = Array.prototype.filter.call(cbs(), c => c.checked).map(c => items[+c.dataset.i]);
    if (!picked.length) { toast("还没有勾选任何题目"); return; }
    picked.forEach(it => TECH.captureMistake({
      chId: it.c, qKey: it.k, q: it.q, options: it.o, ans: it.a,
      myAns: -1, explain: it.e || "", fig: it.f || null
    }));
    toast("已重新加入错题本 " + picked.length + " 题 ✓");
    location.hash = "#/mistakes";
  });
}

/* ============================================================
 * 奥数题库（按 1–6 年级的专题练习；答错同样进错题本）
 *   路由：#/oly                    年级专题总览
 *         #/oly/g/<年级号>         切到某年级总览
 *         #/oly/p/<年级号>         该年级综合练习（整年级混合出题）
 *         #/oly/p/<年级号>/<专题id> 指定专题练习
 * ============================================================ */
let olyGrade = Oly.GRADES[0];

function renderOly(sub) {
  sub = sub || [];
  if (sub[0] === "p") return renderOlyPractice(sub[1], sub[2]);
  if (sub[0] === "g" && sub[1]) { const g = Oly.gradeByKey(sub[1]); if (g) olyGrade = g; }

  const g = olyGrade, topics = Oly.topicsOf(g);
  let html = `<a class="back" href="#/home">← 返回主线</a>
    <div class="oly-head"><h1>奥数题库 · 按教材专题分类</h1>
      <p>专题分类与编号对齐《小学奥数举一反三》（每册 40 周、共 6 册 240 个专题）；题目由参数化引擎现场生成，每遍不重样。</p></div>
    <p class="hint">仅收录教材的<b>专题目录</b>（周次与专题名），不复制任何原书题目；题目全部原创同题型，可放心使用。答错的题会自动进入 <a href="#/mistakes">错题本</a>，并与章节题一样支持打印错题卷、间隔复习。</p>
    <div class="stage-tabs">`;
  Oly.GRADES.forEach(gr => { html += `<button class="stage-tab ${gr === g ? "on" : ""}" data-g="${Oly.keyOf(gr)}">${gr}</button>`; });
  html += `</div>
    <div class="row" style="margin:12px 0">
      <a class="btn btn-primary" href="#/oly/p/${Oly.keyOf(g)}">🎯 ${g}综合练习（${topics.length} 个专题随机出题）</a>
    </div>
    <div class="oly-grid">`;
  topics.forEach(t => {
    html += `<div class="oly-topic">
      <div class="oly-topic-w">第 ${t.week} 周</div>
      <div class="oly-topic-n">${esc(t.name)}</div>
      <div class="oly-topic-d">${esc(t.desc || "综合练习")}</div>
      <a class="oly-topic-go" href="#/oly/p/${Oly.keyOf(g)}/${encodeURIComponent(t.id)}">开始练习 →</a>
    </div>`;
  });
  html += `</div>`;
  view().innerHTML = html;
  view().querySelectorAll(".stage-tab").forEach(b => b.addEventListener("click", () => { olyGrade = Oly.gradeByKey(b.dataset.g); renderOly(); }));
}

function renderOlyPractice(gk, topicId) {
  const grade = Oly.gradeByKey(gk);
  if (!grade) { view().innerHTML = `<a class="back" href="#/oly">← 返回奥数题库</a><div class="empty">没有找到对应年级。</div>`; return; }
  olyGrade = grade;
  const items = Oly.makeItems(grade, topicId, 8);
  if (!items.length) { view().innerHTML = `<a class="back" href="#/oly/g/${gk}">← 返回</a><p class="hint">该专题暂无题目。</p>`; return; }
  prac = { chId: "oly:" + gk + ":" + (topicId || "__all__"), oly: true, gk, grade, topicId: topicId || "", idx: 0, correct: 0, total: items.length, items, done: false };
  paintOly();
}

function paintOly() {
  if (prac.done) return olySummary();
  const grade = prac.grade;
  const topic = prac.topicId ? Oly.topicById(grade, prac.topicId) : null;
  const title = topic ? ("第 " + topic.week + " 周 " + topic.name) : "综合练习";
  const q = prac.items[prac.idx];
  let html = `<a class="back" href="#/oly/g/${prac.gk}">← 返回奥数题库</a>
    <div class="prac-head">第 ${prac.idx + 1} / ${prac.total} 题 · ${esc(grade)} · ${esc(title)}</div>`;
  if (q.fig) html += figures(q.fig);
  html += `<div class="q-text">${esc(q.q)}</div><div class="opts">`;
  q.options.forEach((o, i) => { html += `<button class="opt" data-i="${i}">${esc(o)}</button>`; });
  html += `</div><div class="prac-fb" id="fb"></div>
    <div class="prac-nav"><button class="btn btn-ghost" id="nextBtn" disabled>下一题 →</button></div>`;
  view().innerHTML = html;

  const fb = $("#fb"), next = $("#nextBtn");
  view().querySelectorAll(".opt").forEach(btn => btn.addEventListener("click", () => {
    const i = +btn.dataset.i, right = i === q.ans;
    if (right) prac.correct++;
    else {
      const chId = "oly:" + prac.gk + ":" + (q.topicId || prac.topicId || "__all__");
      TECH.captureMistake({ chId, qKey: q.fp || ("q" + prac.idx), q: q.q, options: q.options, ans: q.ans, myAns: i, explain: q.explain, fig: q.fig });
    }
    view().querySelectorAll(".opt").forEach(b => b.disabled = true);
    btn.classList.add(right ? "opt-right" : "opt-wrong");
    if (!right) { const rb = view().querySelector(`.opt[data-i="${q.ans}"]`); if (rb) rb.classList.add("opt-right"); }
    fb.innerHTML = `<div class="fb-${right ? "ok" : "no"}">${right ? "✓ 答对了" : "✗ 答错了，已记入错题本"}</div><div class="fb-exp">${esc(q.explain || "")}</div>`;
    next.disabled = false; updateBadges();
  }));
  next.addEventListener("click", () => {
    prac.idx++;
    if (prac.idx >= prac.total) { prac.done = true; return olySummary(); }
    paintOly();
  });
}

function olySummary() {
  const allRight = prac.correct === prac.total;
  const back = "#/oly/g/" + prac.gk;
  const redo = prac.topicId ? ("#/oly/p/" + prac.gk + "/" + prac.topicId) : ("#/oly/p/" + prac.gk);
  let html = `<a class="back" href="${back}">← 返回奥数题库</a>
    <div class="summary"><h2>练习完成</h2><p>答对 <b>${prac.correct}</b> / ${prac.total} 题</p>`;
  if (allRight) html += `<p class="ok-line">全对！继续保持。</p>`;
  else html += `<p class="warn-line">有错题已进错题本，建议去 <a href="#/mistakes">错题复盘</a>。</p>`;
  html += `<div class="summary-actions">
      <a class="btn btn-primary" href="${redo}">再练一组（换一批题）</a>
      <a class="btn btn-ghost" href="${back}">返回奥数题库</a>
    </div></div>`;
  view().innerHTML = html;
}

/* ============================================================
 * 间隔复习（Leitner 队列）
 * ============================================================ */
function renderReview() {
  const items = TECH.dueItems();
  const stats = TECH.reviewStats();
  let html = `<a class="back" href="#/home">← 返回主线</a>
    <h1 class="page-h">间隔复习</h1>
    <p class="hint">今天到期 ${stats.due} 条 · 队列共 ${stats.total} 条 · 已毕业 ${stats.done} 条（Leitner 1/2/4/7/15 天）</p>`;
  if (!items.length) {
    html += `<div class="empty">🎉 今天没有待复习的内容，去 <a href="#/practice/c7sc1">练一章</a> 或标记知识梳理吧。</div>`;
    view().innerHTML = html; return;
  }
  items.forEach(it => {
    if (it.kind === "mistake") {
      const m = it.payload;
      html += `<div class="rev-item" data-key="${esc(it.key)}">
        <div class="rev-tag">错题 · 第${it.box}盒</div>
        <div class="mk-q">${esc(m.q)}</div>`;
      if (m.fig) html += figures(m.fig);
      html += `<div class="opts">`;
      m.options.forEach((o, i) => { html += `<button class="opt" data-i="${i}">${esc(o)}</button>`; });
      html += `</div><div class="rev-fb" id="fb_${esc(it.key)}"></div>
        <div class="rev-actions">
          <button class="btn btn-ok rev-ok">记住了 ✓</button>
          <button class="btn btn-ghost rev-no">还不会 ✗</button>
        </div></div>`;
    } else {
      const ch = it.payload;
      html += `<div class="rev-item" data-key="${esc(it.key)}">
        <div class="rev-tag">知识卡 · 第${it.box}盒 · ${esc(ch.title)}</div>
        <p class="hint">合上书，回忆本章核心概念，再展开核对：</p>
        <details><summary>展开知识卡核对</summary><div class="know-cards">`;
      (ch.knowledge || []).forEach(k => { html += `<div class="know"><div class="know-term">${esc(k.term)}</div><div class="know-def">${esc(k.def)}</div></div>`; });
      html += `</div></details>
        <div class="rev-actions">
          <button class="btn btn-ok rev-ok">记住了 ✓</button>
          <button class="btn btn-ghost rev-no">还不会 ✗</button>
        </div></div>`;
    }
  });
  view().innerHTML = html;
  view().querySelectorAll(".rev-item").forEach(card => {
    const key = card.dataset.key;
    const okBtn = card.querySelector(".rev-ok");
    const noBtn = card.querySelector(".rev-no");
    okBtn.addEventListener("click", () => { TECH.promote(key, true); toast("已升级盒子，拉长间隔 ✓"); renderReview(); });
    noBtn.addEventListener("click", () => { TECH.promote(key, false); toast("回到第 1 盒，明天再见 ✓"); renderReview(); });
    card.querySelectorAll(".opt").forEach(btn => btn.addEventListener("click", () => {
      const i = +btn.dataset.i;
      const m = state.mistakes.find(x => x.id === key.slice(2));
      const right = m && i === m.ans;
      card.querySelectorAll(".opt").forEach(b => b.disabled = true);
      btn.classList.add(right ? "opt-right" : "opt-wrong");
      if (!right && m) { const rb = card.querySelector(`.opt[data-i="${m.ans}"]`); if (rb) rb.classList.add("opt-right"); }
      const fb = card.querySelector(".rev-fb"); if (fb) fb.innerHTML = `<div class="fb-${right ? "ok" : "no"}">${right ? "✓ 正确，升级盒子" : "✗ 错了，回到第 1 盒"}</div>`;
      if (right) TECH.promote(key, true); else { TECH.promote(key, false); if (m) TECH.captureMistake(m); }
      card.querySelector(".rev-actions").style.display = "none";
      setTimeout(() => renderReview(), 900);
    }));
  });
}

/* ============================================================
 * 学习方法库
 * ============================================================ */
function renderMethods(focusAnim) {
  let html = `<a class="back" href="#/home">← 返回主线</a><h1 class="page-h">学习方法库</h1>
    <p class="hint">方法按学段与教材进度对应：小学打基础习惯，初中加归纳/对比，高中加解题/费曼；错题复盘与间隔巩固贯穿全学段。</p>`;
  STAGES.forEach(stage => {
    html += `<h2 class="grade-h">${esc(stage.id)}阶段对应方法</h2><div class="meth-list">`;
    STAGE_METHOD_MAP[stage.id].forEach(mid => {
      const m = METHODS[mid]; if (!m) return;
      html += `<div class="meth"><div class="meth-name">${esc(m.name)}</div><div class="meth-desc">${esc(m.desc)}</div>
        <ol class="meth-steps">${m.steps.map(s => `<li><b>${esc(s.t)}</b> ${esc(s.d)}</li>`).join("")}</ol></div>`;
    });
    html += `</div>`;
  });
  html += `<h2 class="grade-h">🎬 动态演示库（融会贯通动图引擎）</h2>
    <p class="hint">以下演示来自上次项目的 SVG 动图模块，可点击交互播放，帮助建立几何与函数的动态直觉。</p>`;
  html += Integ.renderAnimGallery();
  view().innerHTML = html;
  Integ.mountAnimBoxes(view());
  // 从方法卡「看相关演示」跳入：滚动到目标演示并高亮
  if (focusAnim) {
    const card = view().querySelector("#animcard-" + focusAnim);
    if (card) {
      try { card.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { card.scrollIntoView(); }
      card.classList.add("anim-flash");
    }
  }
}

/* ============================================================
 * 我的进度
 * ============================================================ */
function renderProgress() {
  let total = CHAPTERS.length, mastered = 0;
  STAGES.forEach(s => { CHAPTERS.forEach(c => { if (c.stage === s.id && isMastered(c.id)) mastered++; }); });
  const kDone = Object.keys(state.knowledgeDone).length;
  const mTotal = state.mistakes.length, mOpen = state.mistakes.filter(m => !m.resolved).length;
  const rs = TECH.reviewStats();
  let html = `<a class="back" href="#/home">← 返回主线</a><h1 class="page-h">我的进度</h1>
    <div class="stat-grid">
      <div class="stat"><div class="stat-n">${mastered}/${total}</div><div class="stat-l">已掌握章节</div></div>
      <div class="stat"><div class="stat-n">${kDone}</div><div class="stat-l">已梳理知识卡</div></div>
      <div class="stat"><div class="stat-n">${mOpen}/${mTotal}</div><div class="stat-l">未清零错题</div></div>
      <div class="stat"><div class="stat-n">${rs.due}</div><div class="stat-l">今日待复习</div></div>
    </div>`;
  STAGES.forEach(stage => {
    const all = CHAPTERS.filter(c => c.stage === stage.id);
    const done = all.filter(c => isMastered(c.id)).length;
    const pct = all.length ? Math.round(done / all.length * 100) : 0;
    html += `<div class="prog-row"><span class="prog-name">${esc(stage.id)}</span>
      <span class="prog-bar"><i style="width:${pct}%"></i></span>
      <span class="prog-num">${done}/${all.length}</span></div>`;
  });
  html += `<p class="hint">提示：错题清空、知识卡毕业都需要间隔复习连续做对。坚持每天 5 分钟复习，遗忘曲线被你拉平。</p>`;
  view().innerHTML = html;
}

/* ============================================================
 * AI 知识漏洞诊断（本章主线视角）
 * 综合错题本 + 间隔复习 + 章节掌握度，给出薄弱章节排行与训练套餐。
 * ============================================================ */
function renderDiagnose() {
  const r = Integ.analyzeDiagnose();
  let html = `<a class="back" href="#/home">← 返回主线</a>
    <h1 class="page-h">AI 知识漏洞诊断</h1>`;
  html += `<div class="card diag-head">
      <div class="diag-top">
        <div class="diag-mastery"><div class="n">${r.pct}%</div><div class="l">总体掌握度</div></div>
        <div class="diag-stats">
          <div><b>${r.mastered}</b> 已掌握章节</div>
          <div><b>${Object.keys(r.byCh).length}</b> 个薄弱章节</div>
          <div><b>${r.due}</b> 条待复习</div>
        </div>
      </div>
      <div class="bar"><i style="width:${r.pct}%"></i></div>
    </div>`;

  if (r.weakChapters.length) {
    html += `<section class="card"><h3>各薄弱章节（按严重程度）</h3>`;
    r.weakChapters.forEach(x => {
      const ch = x.ch;
      const name = ch ? (ch.stage + "·" + ch.title) : x.chId;
      html += `<div class="stage-row"><span class="stage-name">${esc(name)}</span>
        <div class="bar mini"><i class="warn" style="width:${Math.min(100, x.sev * 10)}%"></i></div>
        <span class="stage-num">错题 ${x.count} · 严重度 ${x.sev}</span></div>`;
    });
    html += `</section>`;
    const top = r.weakChapters[0];
    const topName = top.ch ? top.ch.title : top.chId;
    html += `<section class="card diag-concl"><h3>🧠 诊断结论</h3><div class="muted">
      当前共 <b>${Object.keys(r.byCh).length}</b> 个章节有未清零错题，最需突破的是「<b>${esc(topName)}</b>」。` +
      `系统将按章节匹配「融会贯通技巧库」中的解题方法并做参数化出题，连对即消除。` +
      (r.due ? `另有 <b>${r.due}</b> 条内容今天到期复习，记得在「间隔复习」里巩固。` : ``) +
      `</div></section>`;
    html += `<div class="row" style="margin:4px 0 12px">
      <button class="btn" id="planBtn">🎯 开始专属训练套餐（${r.weakChapters.length} 章）</button>
      <a class="btn soft" href="#/mistakes">去错题本复盘</a></div>`;
  } else {
    html += `<div class="empty">🎉 当前没有未清零的薄弱点，保持得很好！去 <a href="#/review">间隔复习</a> 巩固已学内容。</div>`;
  }
  view().innerHTML = html;
  const pb = $("#planBtn");
  if (pb) pb.addEventListener("click", () => renderPlan(r));
}

/* 专属训练套餐：顺序答题，答错记入错题本 */
function renderPlan(r) {
  const items = Integ.genPlanItems(r);
  if (!items.length) { toast("暂无可练内容，先去练习制造一些错题吧"); location.hash = "#/ai"; return; }
  let idx = 0, correct = 0;
  function paint() {
    const q = items[idx];
    let html = `<a class="back" href="#/ai">← 返回诊断</a>
      <div class="prac-head">专属训练 第 ${idx + 1}/${items.length} 题</div>`;
    if (q.fig) html += figures(q.fig);
    html += `<div class="q-text">${esc(q.q)}</div><div class="opts">`;
    q.options.forEach((o, i) => { html += `<button class="opt" data-i="${i}">${esc(o)}</button>`; });
    html += `</div><div class="prac-fb" id="fb"></div>
      <div class="prac-nav"><button class="btn btn-ghost" id="nextBtn" disabled>下一题 →</button></div>`;
    view().innerHTML = html;
    const fb = $("#fb"); const next = $("#nextBtn");
    view().querySelectorAll(".opt").forEach(btn => btn.addEventListener("click", () => {
      const i = +btn.dataset.i; const right = i === q.ans;
      if (right) correct++;
      else {
        const chId = q.chId || (r.weakChapters[0] && r.weakChapters[0].chId) || "x1sc1";
        TECH.captureMistake({ chId, qKey: q.key, q: q.q, options: q.options, ans: q.ans, myAns: i, explain: q.explain, fig: q.fig });
      }
      view().querySelectorAll(".opt").forEach(b => b.disabled = true);
      btn.classList.add(right ? "opt-right" : "opt-wrong");
      if (!right) { const rb = view().querySelector(`.opt[data-i="${q.ans}"]`); if (rb) rb.classList.add("opt-right"); }
      fb.innerHTML = `<div class="fb-${right ? "ok" : "no"}">${right ? "✓ 答对了" : "✗ 答错了，已记入错题本"}</div><div class="fb-exp">${esc(q.explain || "")}</div>`;
      next.disabled = false; updateBadges();
    }));
    next.addEventListener("click", () => {
      idx++;
      if (idx >= items.length) {
        view().innerHTML = `<a class="back" href="#/ai">← 返回诊断</a>
          <div class="summary"><h2>训练完成</h2><p>答对 <b>${correct}</b> / ${items.length} 题</p>
          <p class="hint">错题已入错题本，去「间隔复习」按遗忘曲线巩固。</p>
          <div class="summary-actions"><a class="btn btn-primary" href="#/ai">返回诊断</a><a class="btn btn-ghost" href="#/mistakes">看错题本</a></div></div>`;
        return;
      }
      paint();
    });
  }
  paint();
}

/* ============================================================
 * 返回顶部悬浮按钮（长页面滚动超过一屏后出现）
 * ============================================================ */
(function setupToTop() {
  const btn = document.getElementById("toTop");
  if (!btn) return;
  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    btn.classList.toggle("show", y > 320);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  btn.addEventListener("click", () => {
    try { window.scrollTo({ top: 0, behavior: "smooth" }); }
    catch (e) { window.scrollTo(0, 0); }
  });
  onScroll();
})();

/* ---------- 启动 ---------- */
route();
