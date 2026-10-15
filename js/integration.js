/* ============================================================
 * 融入层（Integration）
 * 把上次 math-mastery 的全部学习技巧挂到本次「人教版章节主线」：
 *   - 127 解题方法库（window.MM_TECH）
 *   - 动图引擎（window.Anim，19 类交互演示）
 *   - 参数化出题（t.qgen，122 个方法支持每轮不重样）
 * 通过「章节→方法」映射，使每个章节都能按主线扩展出对应的解题技巧、
 * 动态演示与随机题库；并提供本章视角的 AI 诊断。
 * 本层只做“桥接 + 适配 + 渲染”，不重复定义数据。
 * ============================================================ */
(function () {
  /* ---------- 年级归一化：pep 章节 grade → MM_TECH grade ---------- */
  function normGrade(g) {
    const same = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "七年级", "八年级", "九年级"];
    if (same.indexOf(g) >= 0) return g;
    if (g === "必修第一册" || g === "必修第二册") return "十年级";
    if (g === "选择性必修第一册") return "十一年级";
    if (g === "选择性必修第二册" || g === "选择性必修第三册") return "十二年级";
    return g;
  }

  /* ---------- 显式映射（精准对应主线章节，优先于按年级自动匹配） ---------- */
  const EXPLICIT = {
    "x1sc1": ["count", "addsub"],          // 一上·准备课 → 数数与数位 / 100以内加减法
    "c7sc1": ["rational"],                 // 七上·有理数 → 有理数与数轴
    "gb1c1": ["set"]                       // 高一·集合 → 集合与逻辑
  };

  /* ---------- 取某章适用的解题方法（MM_TECH 对象数组） ---------- */
  function chapterTechs(ch) {
    if (!ch) return [];
    let ids = EXPLICIT[ch.id];
    if (!ids) {
      const ng = normGrade(ch.grade);
      ids = (window.MM_TECH || []).filter(t => t.grade === ng).map(t => t.id).slice(0, 6);
    }
    return ids.map(id => (window.MM_TECH || []).find(t => t.id === id)).filter(Boolean);
  }

  /* ---------- 参数化出题适配：生成题({q,opts,ans,explain,fig}) → pep 格式 ---------- */
  function pepFromGen(g, key) {
    return {
      q: g.q, options: g.opts, ans: g.ans,
      explain: g.explain || "", fig: g.fig || null,
      key: key, level: g.level, gen: true
    };
  }

  /* ---------- 取某章的练习题库 ----------
   * 优先用映射方法的 qgen 参数化生成（每轮不重样）；
   * 无参数化方法时回退到章内固定题。 */
  function chapterPracticeItems(ch, n) {
    n = n || 8;
    const techs = chapterTechs(ch).filter(t => typeof t.qgen === "function");
    const out = [];
    if (techs.length) {
      let i = 0;
      while (out.length < n && i < techs.length * 6) {
        const t = techs[i % techs.length];
        const g = t.qgen(1)[0];
        out.push(pepFromGen(g, t.id + "#" + out.length));
        i++;
      }
    }
    if (out.length < n && ch.questions && ch.questions.length) {
      ch.questions.forEach((q, idx) => {
        if (out.length >= n) return;
        out.push(q.gen ? q.gen() : {
          q: q.q, options: q.options, ans: q.ans,
          explain: q.explain, fig: q.fig, key: q.key
        });
      });
    }
    return out.slice(0, n);
  }

  /* ---------- 渲染单个解题方法卡 ---------- */
  // 富文本转义：先整体转义，再放行 <b></b>（原库步骤里的加粗标记）
  function escB(s) {
    return esc(s).replace(/&lt;\/?b&gt;/g, m => m.replace("&lt;", "<").replace("&gt;", ">"));
  }
  function renderTechCard(t) {
    if (!t) return "";
    let s = `<div class="tech-method">
      <div class="tm-head"><span class="tm-name">${esc(t.name)}</span><span class="tm-grade">${esc(t.grade || "")}</span></div>
      <div class="tm-sum">${escB(t.summary || "")}</div>`;
    if (t.steps && t.steps.length) {
      s += `<ol class="tm-steps">`;
      t.steps.forEach(st => {
        const txt = typeof st === "string" ? st : (st.text || st.t || "");
        s += `<li>${escB(txt)}</li>`;
      });
      s += `</ol>`;
    }
    // 动态演示：方法声明了 anim 且引擎存在 → 就地直接挂载（演示内部自带播放控制）
    if (t.anim && window.Anim && typeof window.Anim[t.anim] === "function") {
      s += `<div class="anim-box" data-animbox="${esc(t.anim)}"></div>`;
    } else {
      // 没配动图 → 跳转到演示库里最相关的具体演示（无相关则回退演示库）
      const ref = REF_ANIM[t.id];
      if (ref && window.Anim && typeof window.Anim[ref] === "function") {
        s += `<a class="tm-animlink" href="#/methods/anim/${esc(ref)}">🎬 看相关演示：${esc(ANIM_LABELS[ref] || ref)} →</a>`;
      } else {
        s += `<a class="tm-animlink" href="#/methods">🎬 去动图演示库看相关演示 →</a>`;
      }
    }
    s += `</div>`;
    return s;
  }

  /* ---------- 动图演示库（全部可交互 Anim 演示） ---------- */
  const ANIM_LABELS = {
    chicken: "鸡兔同笼 · 假设法(抬腿)", general: "将军饮马 · 对称点", melon: "瓜豆原理 · 轨迹",
    func: "函数图像变换", move: "动点问题", trip: "最短路径", geo: "几何变换",
    solid: "立体几何", conic: "圆锥曲线", euler: "欧拉公式", taylor: "泰勒展开",
    numshape: "数形结合", tree: "树状图", linearprog: "线性规划", normal: "正态分布",
    cgeo: "复数几何", lim: "极限", gtrans: "图形平移", definite: "定积分",
    countPoints: "数一数 · 10 个一组", placeValue: "数位 · 位值拆解", carryAdd: "进位加法 · 列竖式", borrowSub: "退位减法 · 列竖式"
  };
  /* 方法 → 演示库中最相关的具体演示（用于「看相关演示」直达跳转） */
  const REF_ANIM = {
    /* 小学 */
    multi: "placeValue", decimal: "placeValue", fourops: "carryAdd", trip: "trip",
    circle: "move", cylinder: "solid", perim: "gtrans",
    /* 初中 */
    rational: "move", linear1: "func", inequal: "linearprog", system: "func",
    segangle: "gtrans", triangle: "geo", congruent: "geo", similar: "geo", pyth: "geo",
    quad: "gtrans", circ: "move", inverse: "func", prob: "tree", funcconcept: "func",
    /* 高中 */
    explog: "func", trig: "func", trig_id: "func", sequence: "numshape", arithseq: "numshape",
    seqsum: "numshape", vector: "cgeo", derivative: "lim", deriv_mon: "lim", deriv_ineq: "lim",
    func_zero: "lim", lhopital: "lim", mvt: "func", series: "lim", lln: "lim",
    conic: "conic", conic_prop: "conic", coord_geo: "conic", complex: "cgeo", de_moivre: "cgeo",
    matrix: "gtrans", solid: "solid", vector_geo_adv: "solid", partial_deriv: "solid", gradient: "solid",
    integral_app: "definite", improper_int: "definite", param_eq: "move", polar_deep: "move",
    param_extremum: "move", binomial: "tree", counting: "tree", bayes: "tree", fullprob: "tree",
    markov: "tree", dist_binom: "normal", confidence: "normal", hypothesis: "normal"
  };
  function renderAnimGallery() {
    const names = Object.keys(ANIM_LABELS);
    let s = `<div class="anim-gallery">`;
    names.forEach(nm => {
      if (!window.Anim || typeof window.Anim[nm] !== "function") return;
      s += `<div class="anim-card" id="animcard-${esc(nm)}">
        <div class="anim-card-h">${esc(ANIM_LABELS[nm] || nm)}</div>
        <div class="anim-box" data-animbox="${nm}"></div>
      </div>`;
    });
    s += `</div>`;
    return s;
  }

  /* ---------- 挂载动图盒子（在页面渲染后调用） ---------- */
  function mountAnimBoxes(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-animbox]").forEach(box => {
      if (box.dataset.mounted) return;
      const nm = box.dataset.animbox;
      if (window.Anim && typeof window.Anim[nm] === "function") {
        try { window.Anim[nm](box); box.dataset.mounted = "1"; }
        catch (e) { box.textContent = "动图加载失败"; }
      }
    });
    scope.querySelectorAll("[data-anim]").forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const nm = btn.dataset.anim;
        const box = btn.parentElement.querySelector('[data-animbox="' + nm + '"]');
        if (box && window.Anim && typeof window.Anim[nm] === "function") {
          try { window.Anim[nm](box); box.dataset.mounted = "1"; } catch (e) {}
        }
      });
    });
  }

  /* ---------- AI 诊断（本章主线视角） ---------- */
  function analyzeDiagnose() {
    const now = Date.now();
    const byCh = {};
    state.mistakes.filter(m => !m.resolved).forEach(m => {
      if (!byCh[m.chId]) byCh[m.chId] = { count: 0, last: m.created || now };
      byCh[m.chId].count++;
      if (m.created) byCh[m.chId].last = Math.max(byCh[m.chId].last, m.created);
    });
    const weakChapters = Object.keys(byCh).map(chId => {
      const ch = chapterById(chId);
      const w = byCh[chId];
      const days = (now - w.last) / 86400000;
      const sev = Math.min(10, w.count * 2 + (days > 7 ? 2 : 0) + (days > 30 ? 3 : 0));
      const techs = ch ? chapterTechs(ch) : [];
      return { chId, ch, count: w.count, sev, techs };
    }).sort((a, b) => b.sev - a.sev);

    const rs = TECH.reviewStats();
    const total = CHAPTERS.length;
    const mastered = CHAPTERS.filter(c => isMastered(c.id)).length;
    const pct = total ? Math.round(mastered / total * 100) : 0;
    return { now, byCh, weakChapters, due: rs.due, total, mastered, pct };
  }

  /* ---------- 生成专属训练套餐（结合映射方法的 qgen） ---------- */
  function genPlanItems(r) {
    const items = [];
    r.weakChapters.slice(0, 6).forEach(x => {
      const ch = x.ch; if (!ch) return;
      const techs = x.techs.filter(t => typeof t.qgen === "function");
      if (techs.length) {
        techs.slice(0, 2).forEach(t => {
          const g = t.qgen(1)[0];
          items.push(pepFromGen(g, t.id + "#plan" + items.length));
        });
      } else if (ch.questions && ch.questions.length) {
        const q = ch.questions[Math.floor(Math.random() * ch.questions.length)];
        items.push(q.gen ? q.gen() : {
          q: q.q, options: q.options, ans: q.ans,
          explain: q.explain, fig: q.fig, key: q.key
        });
      }
    });
    return items;
  }

  /* ---------- 小学低年级方法挂接专属动图 ---------- */
  if (window.MM_TECH && Array.isArray(window.MM_TECH)) {
    const MAP = { count: "placeValue", addsub: "carryAdd", divide: "placeValue", fraction: "countPoints" };
    window.MM_TECH.forEach(t => {
      if (!t.anim && MAP[t.id] && typeof window.Anim[MAP[t.id]] === "function") t.anim = MAP[t.id];
    });
  }

  window.Integ = {
    normGrade, chapterTechs, chapterPracticeItems,
    renderTechCard, renderAnimGallery, mountAnimBoxes,
    analyzeDiagnose, genPlanItems
  };
})();
