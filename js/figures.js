/* ============================================================
 * 配图引擎（SVG）—— 轻量、无依赖、离线可用
 * 题目通过 q.fig = {name, ...params} 引用；学习页用 figures() 渲染。
 * ============================================================ */
window.Fig = {
  /* 点阵：n 个圆点，用于「数一数」 */
  dots(p) {
    const n = Math.max(1, p.n || 5);
    const cols = Math.ceil(Math.sqrt(n));
    let s = `<svg viewBox="0 0 320 160" class="fig"><rect width="320" height="160" fill="#f7faff"/>`;
    for (let i = 0; i < n; i++) {
      const r = i % cols, c = Math.floor(i / cols);
      s += `<circle cx="${40 + r * 36}" cy="${50 + c * 36}" r="13" fill="#2f6fed" opacity="0.85"/>`;
    }
    s += `</svg>`;
    return s;
  },
  /* 比多少：左△ 右○，数量由 left/right 决定 */
  compare(p) {
    const L = p.left || 3, R = p.right || 5;
    let s = `<svg viewBox="0 0 320 160" class="fig"><rect width="320" height="160" fill="#f7faff"/>`;
    s += `<text x="60" y="28" font-size="14" fill="#333" text-anchor="middle">△ 左边 ${L} 个</text>`;
    s += `<text x="260" y="28" font-size="14" fill="#333" text-anchor="middle">○ 右边 ${R} 个</text>`;
    for (let i = 0; i < L; i++) s += `<path d="M${40 + i * 28} 70 l12 20 l-24 0 z" fill="#e0533d"/>`;
    for (let i = 0; i < R; i++) s += `<circle cx="${230 + i * 22}" cy="78" r="11" fill="#2f6fed"/>`;
    s += `</svg>`;
    return s;
  },
  /* 数轴：标出 points 中的点 */
  numberLine(p) {
    const pts = (p.points || [-2]).slice();
    const min = Math.min(-3, ...pts), max = Math.max(3, ...pts);
    const W = 320, x0 = 30, span = W - 60, step = span / (max - min);
    const X = v => x0 + (v - min) * step;
    let s = `<svg viewBox="0 0 320 120" class="fig"><rect width="320" height="120" fill="#f7faff"/>`;
    s += `<line x1="${x0}" y1="60" x2="${W - 30}" y2="60" stroke="#333" stroke-width="2"/>`;
    for (let v = min; v <= max; v++) {
      const x = X(v);
      s += `<line x1="${x}" y1="54" x2="${x}" y2="66" stroke="#333" stroke-width="2"/>`;
      s += `<text x="${x}" y="84" font-size="12" fill="#333" text-anchor="middle">${v}</text>`;
    }
    s += `<text x="${W - 18}" y="56" font-size="11" fill="#888">→</text>`;
    pts.forEach(v => {
      s += `<circle cx="${X(v)}" cy="60" r="6" fill="#e0533d"/>`;
      s += `<text x="${X(v)}" y="40" font-size="13" fill="#e0533d" text-anchor="middle" font-weight="bold">${v}</text>`;
    });
    s += `</svg>`;
    return s;
  },
  /* 韦恩图：sets=1 单圆 / 2 双圆交；marked 为需高亮的元素编号（1..4） */
  venn(p) {
    const sets = p.sets || 1;
    const marked = p.marked || [];
    const hi = v => marked.indexOf(v) >= 0;
    const fill = v => hi(v) ? "#ffd966" : "#cfe0ff";
    let s = `<svg viewBox="0 0 320 180" class="fig"><rect width="320" height="180" fill="#f7faff"/>`;
    if (sets === 1) {
      s += `<circle cx="160" cy="90" r="60" fill="${fill(1)}" stroke="#2f6fed" stroke-width="2"/>`;
      s += `<text x="160" y="95" font-size="15" fill="#333" text-anchor="middle">A</text>`;
      s += `<text x="160" y="150" font-size="12" fill="#888" text-anchor="middle">${hi(1) ? "高亮元素 ∈ A" : "集合 A"}</text>`;
    } else {
      s += `<circle cx="125" cy="90" r="58" fill="${fill(1)}" stroke="#2f6fed" stroke-width="2"/>`;
      s += `<circle cx="195" cy="90" r="58" fill="${fill(2)}" stroke="#2f6fed" stroke-width="2"/>`;
      s += `<text x="95" y="60" font-size="14" fill="#333">A</text>`;
      s += `<text x="225" y="60" font-size="14" fill="#333">B</text>`;
      s += `<text x="160" y="95" font-size="12" fill="#333" text-anchor="middle">${hi(3) ? "∩" : ""}</text>`;
      s += `<text x="160" y="165" font-size="12" fill="#888" text-anchor="middle">${hi(2) ? "阴影= A∩B" : "A 与 B"}</text>`;
    }
    s += `</svg>`;
    return s;
  }
};
function figures(spec) {
  if (!spec || !window.Fig) return "";
  const name = typeof spec === "string" ? spec : spec.name;
  const params = typeof spec === "string" ? {} : spec;
  if (!window.Fig[name]) return "";
  try { return window.Fig[name](params); } catch (e) { return ""; }
}
