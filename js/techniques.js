/* ============================================================
 * 学习技巧引擎（Techniques）
 * 三类技巧贯穿全系统：
 *   1) 知识梳理  —— 章节知识卡 + 思维导图（数据驱动，可标记已梳理）
 *   2) 错题复盘  —— 练习答错自动入错题本，三问 + 错因标签
 *   3) 间隔巩固  —— Leitner 五盒调度，按 1/2/4/7/15 天节奏回看
 * 本文件只放「逻辑 + 技巧专属渲染」，页面组装在 app.js。
 * ============================================================ */
const TECH = (function () {
  const LEITNER = [1, 2, 4, 7, 15];           // 各盒间隔（天）
  const DAY = 24 * 3600 * 1000;

  /* ---------- 错因标签 ---------- */
  const MISTAKE_TAGS = [
    { id: "concept", label: "概念不清" },
    { id: "calc", label: "计算失误" },
    { id: "read", label: "审题偏差" },
    { id: "idea", label: "思路错误" }
  ];

  /* ---------- 间隔巩固调度 ---------- */
  function mkReview() {
    const now = Date.now();
    return { box: 1, due: now, last: now, history: [], done: false };
  }
  function ensureReview(key) {
    if (!state.review[key]) state.review[key] = mkReview();
  }
  function promote(key, ok) {
    const r = state.review[key];
    if (!r) return;
    r.last = Date.now();
    r.box = ok ? Math.min(5, r.box + 1) : 1;
    r.history.push({ ok, t: r.last });
    const iv = LEITNER[Math.min(r.box, 5) - 1] || 15;
    r.due = r.last + iv * DAY;
    if (r.box >= 5) r.done = true;
    // 错题满盒即毕业
    if (r.done && key.indexOf("m:") === 0) {
      const m = state.mistakes.find(x => x.id === key.slice(2));
      if (m) m.resolved = true;
    }
    save();
  }

  /* 今日到期待复习条目（错题 + 知识卡） */
  function dueItems() {
    const now = Date.now();
    const out = [];
    for (const key in state.review) {
      const r = state.review[key];
      if (r.done || r.due > now) continue;
      if (key.indexOf("m:") === 0) {
        const m = state.mistakes.find(x => x.id === key.slice(2) && !x.resolved);
        if (m) out.push({ key, kind: "mistake", box: r.box, payload: m });
      } else if (key.indexOf("k:") === 0) {
        const ch = CHAPTERS.find(c => c.id === key.slice(2));
        if (ch) out.push({ key, kind: "knowledge", box: r.box, payload: ch });
      }
    }
    return out.sort((a, b) => a.box - b.box);
  }

  function reviewStats() {
    let total = 0, due = 0, done = 0;
    const now = Date.now();
    for (const k in state.review) {
      const r = state.review[k];
      total++;
      if (r.done) done++; else if (r.due <= now) due++;
    }
    return { total, due, done };
  }

  /* ---------- 错题捕获（练习答错时调用） ---------- */
  function captureMistake(rec) {
    // rec: {chId, qKey, q, options, ans, myAns, explain, fig}
    const id = rec.chId + "#" + rec.qKey;
    let m = state.mistakes.find(x => x.id === id && !x.resolved);
    if (m) {
      m.myAns = rec.myAns; m.created = Date.now();
    } else {
      m = Object.assign({ id, resolved: false, reason: "", tags: [], created: Date.now() }, rec);
      state.mistakes.push(m);
    }
    ensureReview("m:" + id);
    save();
    return m;
  }

  /* ---------- 知识梳理：思维导图（SVG） ---------- */
  function buildMindmap(ch) {
    const items = ch.knowledge || [];
    if (!items.length) return "";
    const W = 680, H = 240, cx = W / 2, cy = 40;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="mindmap">`;
    s += `<rect width="${W}" height="${H}" fill="#fbfdff"/>`;
    // 中心节点（章标题）
    s += `<rect x="${cx - 70}" y="${cy - 16}" width="140" height="32" rx="16" fill="#2f6fed"/>`;
    s += `<text x="${cx}" y="${cy + 5}" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">${esc(ch.title)}</text>`;
    // 子节点环绕下半区
    const n = items.length;
    items.forEach((it, i) => {
      const ang = Math.PI + (Math.PI * (i + 0.5) / n); // 下半弧
      const r = 150;
      const x = cx + r * Math.cos(ang);
      const y = cy + 30 + 120 * (i % 2 === 0 ? 0.4 : 0.95);
      const bx = x < cx ? x - 64 : x - 64;
      s += `<line x1="${cx}" y1="${cy + 16}" x2="${x}" y2="${y - 12}" stroke="#9bb4e8" stroke-width="1.5"/>`;
      s += `<rect x="${bx}" y="${y - 14}" width="128" height="28" rx="8" fill="#eaf1ff" stroke="#2f6fed" stroke-width="1"/>`;
      s += `<text x="${bx + 64}" y="${y + 5}" font-size="12" fill="#1a3a5f" text-anchor="middle">${esc(it.term)}</text>`;
    });
    s += `</svg>`;
    return s;
  }

  return { LEITNER, MISTAKE_TAGS, ensureReview, promote, dueItems, reviewStats, captureMistake, buildMindmap };
})();
