/* ============================================================
 * 奥数题库（原创同题型）—— 按 1–6 年级组织
 * 定位：与「举一反三」等奥数教辅**同题型、同专题**，
 *      但全部题目由本文件原创的参数化生成器现场生成，不复制任何原书题目，
 *      因此可安全地放进本开源项目。
 * 结构：年级 → 专题 → 生成器 gen() → { q, options, ans, explain, point }
 *      生成的题与 qgen 引擎同构，可直接复用练习/错题/复习/打印闭环。
 * 说明：题目难度按年级递进（数图形→和差倍→盈亏行程→数论综合）。
 * ============================================================ */
(function () {
  /* ---------- 小工具 ---------- */
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[rnd(0, a.length - 1)]; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function divisors(n) { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; }
  function h32(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return (h >>> 0).toString(36); }

  /* 由正确答案构造互异选项（全部转字符串，避免数字/字符串重复） */
  function opts(ans, make, n) {
    n = n || 4;
    const A = String(ans), set = [A];
    let g = 0;
    while (set.length < n && g++ < 400) { const s = String(make()); if (set.indexOf(s) < 0) set.push(s); }
    if (typeof ans === "number") {
      let k = 1;
      while (set.length < n) {
        const up = String(ans + k), dn = String(ans - k);
        if (set.indexOf(up) < 0) set.push(up);
        if (set.length < n && set.indexOf(dn) < 0) set.push(dn);
        k++;
      }
    } else {
      let k = 1;
      while (set.length < n) { const s = String(ans) + "（" + k + "）"; if (set.indexOf(s) < 0) set.push(s); k++; }
    }
    const arr = shuffle(set);
    return { options: arr, ans: arr.indexOf(A) };
  }
  function Q(q, ans, make, explain, point, level) {
    const o = opts(ans, make);
    return { q, options: o.options, ans: o.ans, explain, point: point || "", level: level || "奥数", fig: null };
  }

  /* ============================================================
   * 一年级
   * ============================================================ */
  const G1 = [
    { id: "count_shape", name: "数图形", desc: "按顺序数出指定图形的个数", gen: function () {
      const syms = ["○", "△", "□", "◇"]; const seq = []; const n = rnd(8, 14);
      for (let i = 0; i < n; i++) seq.push(pick(syms));
      const target = pick(syms); const c = seq.filter(s => s === target).length;
      return Q(`数一数，下面一排图形里 ${target} 有几个？ ${seq.join(" ")}`, c, () => rnd(1, n), `按从左到右的顺序数出 ${target}：一共有 ${c} 个。`, "数图形");
    } },
    { id: "compare", name: "比多比少", desc: "多几少几，一步加减解决", gen: function () {
      const a = rnd(3, 12), d = rnd(1, 5);
      if (Math.random() < 0.5) { const b = a + d; return Q(`小明有 ${a} 个苹果，小红比小明多 ${d} 个。小红有多少个？`, b, () => rnd(2, a + d + 5), `小红 = 小明 + 多出的 = ${a} + ${d} = ${b} 个。`, "比多比少"); }
      const b = a + d; return Q(`小红有 ${b} 个苹果，小明比小红少 ${d} 个。小明有多少个？`, a, () => rnd(1, b + 3), `小明 = 小红 − 少的 = ${b} − ${d} = ${a} 个。`, "比多比少");
    } },
    { id: "pattern", name: "找规律", desc: "按固定增减规律填下一个数", gen: function () {
      const s = rnd(1, 6), d = rnd(2, 5), arr = [];
      for (let i = 0; i < 5; i++) arr.push(s + i * d);
      return Q(`找规律填数：${arr.slice(0, 4).join("、")}、（　）`, arr[4], () => arr[4] + rnd(-3, 6), `每次都增加 ${d}，所以下一项 = ${arr[3]} + ${d} = ${arr[4]}。`, "找规律");
    } },
    { id: "odd_even", name: "单数与双数", desc: "区分单双数并数个数", gen: function () {
      const n = rnd(10, 30), odd = Math.ceil(n / 2), even = Math.floor(n / 2), askOdd = Math.random() < 0.5;
      return Q(`1 到 ${n} 这些数里，${askOdd ? "单数" : "双数"}一共有多少个？`, askOdd ? odd : even, () => rnd(1, n), `1~${n} 中单数有 ${odd} 个、双数有 ${even} 个。`, "单双数");
    } },
    { id: "queue", name: "排队问题", desc: "从前数、从后数求位置", gen: function () {
      if (Math.random() < 0.5) {
        const a = rnd(2, 8), b = rnd(2, 8), ans = a + b - 1;
        return Q(`小朋友排队，小明从前数第 ${a} 个，从后数第 ${b} 个。这一排一共有几人？`, ans, () => rnd(2, a + b + 3), `总人数 = 从前数 + 从后数 − 1 = ${a} + ${b} − 1 = ${ans} 人（小明被数了两次，要减 1）。`, "排队问题");
      }
      const n = rnd(6, 15), a = rnd(2, n - 1), ans = n - a + 1;
      return Q(`一共 ${n} 个小朋友排成一排，小华从前数第 ${a} 个。小华从后数是第几个？`, ans, () => rnd(1, n), `从后数 = 总人数 − 从前数 + 1 = ${n} − ${a} + 1 = ${ans}。`, "排队问题");
    } },
    { id: "make_ten", name: "凑十法", desc: "把加数凑成 10 再相加", gen: function () {
      const a = rnd(6, 9), b = rnd(4, 9), ans = a + b, need = 10 - a;
      return Q(`算一算，用凑十法：${a} + ${b} = ？`, ans, () => rnd(a, a + b + 3), `先凑十：${a} + ${need} = 10，还剩 ${b - need}；10 + ${b - need} = ${ans}。`, "凑十法");
    } },
    { id: "avg_share", name: "平均分", desc: "把总数平均分给几份", gen: function () {
      const per = rnd(2, 5), n = rnd(2, 6), total = per * n;
      return Q(`把 ${total} 个桃子平均分给 ${n} 只小猴，每只分到几个？`, per, () => rnd(1, total), `${total} ÷ ${n} = ${per} 个。`, "平均分");
    } }
  ];

  /* ============================================================
   * 二年级
   * ============================================================ */
  const G2 = [
    { id: "pattern2", name: "找规律进阶", desc: "等差、等比、加减交替", gen: function () {
      const type = rnd(0, 2);
      if (type === 0) { const s = rnd(2, 9), d = rnd(2, 9), a = []; for (let i = 0; i < 5; i++) a.push(s + i * d); return Q(`找规律填数：${a.slice(0, 4).join("、")}、（　）`, a[4], () => a[4] + rnd(-4, 8), `每次加 ${d}，下一项 = ${a[3]} + ${d} = ${a[4]}。`, "找规律"); }
      if (type === 1) { const s = rnd(2, 4), r = rnd(2, 3), a = []; let v = s; for (let i = 0; i < 5; i++) { a.push(v); v *= r; } return Q(`找规律填数：${a.slice(0, 4).join("、")}、（　）`, a[4], () => a[4] + rnd(-6, 10), `每次乘 ${r}，下一项 = ${a[3]} × ${r} = ${a[4]}。`, "找规律"); }
      const s = rnd(6, 12), p = rnd(2, 5), m = rnd(1, 3), a = [s];
      for (let i = 1; i < 5; i++) a.push(i % 2 === 1 ? a[i - 1] + p : a[i - 1] - m);
      return Q(`找规律填数：${a.slice(0, 4).join("、")}、（　）`, a[4], () => a[4] + rnd(-4, 6), `规律是「加 ${p}、减 ${m}」交替，下一项 = ${a[3]} ${a[4] > a[3] ? "+ " + p : "− " + m} = ${a[4]}。`, "找规律");
    } },
    { id: "count_lines", name: "数线段", desc: "n 个点能连成多少条线段", gen: function () {
      const n = rnd(4, 8), ans = n * (n - 1) / 2;
      return Q(`一条直线上有 ${n} 个点，任意两点连成一条线段，一共可以连成多少条线段？`, ans, () => rnd(2, ans + 4), `线段数 = ${n} × ${n - 1} ÷ 2 = ${ans} 条。`, "数线段");
    } },
    { id: "equalize", name: "移多补少", desc: "把相差数平均分开", gen: function () {
      const b = rnd(4, 12), d = rnd(1, 5) * 2, a = b + d, ans = d / 2;
      return Q(`甲有 ${a} 张卡片，乙有 ${b} 张。甲给乙多少张后，两人一样多？`, ans, () => rnd(1, a), `两人相差 ${d} 张，把相差数平均分开：${d} ÷ 2 = ${ans} 张。`, "移多补少");
    } },
    { id: "age2", name: "年龄问题", desc: "年龄差永远不变", gen: function () {
      const son = rnd(6, 10), d = rnd(22, 30), dad = son + d;
      if (Math.random() < 0.5) return Q(`今年爸爸 ${dad} 岁，儿子 ${son} 岁。爸爸比儿子大多少岁？`, d, () => rnd(10, 40), `年龄差 = ${dad} − ${son} = ${d} 岁。`, "年龄问题");
      return Q(`今年爸爸 ${dad} 岁，儿子 ${son} 岁。3 年后爸爸比儿子大多少岁？`, d, () => d + rnd(1, 6), `两人都长 3 岁，年龄差不变，还是 ${d} 岁。`, "年龄问题");
    } },
    { id: "sumdiff2", name: "和差倍", desc: "和倍、差倍基础", gen: function () {
      if (Math.random() < 0.5) {
        const sm = rnd(2, 9), m = rnd(2, 4), big = sm * m, sum = big + sm, askBig = Math.random() < 0.5;
        return Q(`两数的和是 ${sum}，大数是小数的 ${m} 倍。${askBig ? "大数" : "小数"}是多少？`, askBig ? big : sm, () => rnd(1, sum), `小数 = 和 ÷ (倍数 + 1) = ${sum} ÷ ${m + 1} = ${sm}；大数 = ${sm} × ${m} = ${big}。`, "和倍问题");
      }
      const sm = rnd(2, 8), m = rnd(2, 4), big = sm * m, diff = big - sm, askBig = Math.random() < 0.5;
      return Q(`两数的差是 ${diff}，大数是小数的 ${m} 倍。${askBig ? "大数" : "小数"}是多少？`, askBig ? big : sm, () => rnd(1, big + 3), `小数 = 差 ÷ (倍数 − 1) = ${diff} ÷ ${m - 1} = ${sm}；大数 = ${sm} × ${m} = ${big}。`, "差倍问题");
    } },
    { id: "square_array", name: "方阵问题", desc: "实心方阵最外层人数", gen: function () {
      const n = rnd(4, 12), ans = 4 * (n - 1);
      return Q(`一个 ${n} 行 ${n} 列的实心方阵，最外层一共有多少人？`, ans, () => rnd(4, 4 * n), `最外层 = 4 × (每边人数 − 1) = 4 × (${n} − 1) = ${ans} 人。`, "方阵问题");
    } },
    { id: "graph_eq", name: "等量代换", desc: "图文算式，先求一种图形", gen: function () {
      const o = rnd(2, 6), t = rnd(2, 6), s1 = 2 * o, s2 = o + t;
      return Q(`已知 ○ + ○ = ${s1}，○ + △ = ${s2}。那么 △ = ？`, t, () => rnd(1, 10), `由 ○ + ○ = ${s1} 得 ○ = ${o}；代入 ○ + △ = ${s2}，△ = ${s2} − ${o} = ${t}。`, "等量代换");
    } },
    { id: "stair", name: "间隔问题", desc: "上楼梯要走几层", gen: function () {
      const from = rnd(1, 3), to = from + rnd(2, 6), ans = to - from;
      return Q(`从第 ${from} 层走到第 ${to} 层，一共要走几层楼梯？`, ans, () => rnd(1, to), `走的层数 = 到达层 − 出发层 = ${to} − ${from} = ${ans} 层（不是 ${to} 层）。`, "间隔问题");
    } }
  ];

  /* ============================================================
   * 三年级
   * ============================================================ */
  const G3 = [
    { id: "plant3", name: "植树问题", desc: "两端都栽 / 只栽一端 / 环形", gen: function () {
      const d = pick([2, 4, 5, 10]), seg = rnd(4, 12), L = d * seg, type = rnd(0, 3);
      let trees, exp;
      if (type === 0) { trees = seg + 1; exp = `间隔数 = ${L} ÷ ${d} = ${seg}；两端都栽：棵数 = 间隔数 + 1 = ${trees}。`; }
      else if (type === 1) { trees = seg; exp = `间隔数 = ${L} ÷ ${d} = ${seg}；只栽一端：棵数 = 间隔数 = ${trees}。`; }
      else if (type === 2) { trees = seg - 1; exp = `间隔数 = ${L} ÷ ${d} = ${seg}；两端都不栽：棵数 = 间隔数 − 1 = ${trees}。`; }
      else { trees = seg; exp = `封闭（环形）：棵数 = 间隔数 = ${L} ÷ ${d} = ${trees}。`; }
      const mode = ["两端都栽", "只栽一端", "两端都不栽", "环形"][type];
      return Q(`一条 ${L} 米长的路，每隔 ${d} 米栽一棵树（${mode}），一共需要多少棵树？`, trees, () => Math.max(1, seg + rnd(-2, 3)), exp, "植树问题");
    } },
    { id: "average3", name: "平均数", desc: "总数 ÷ 个数", gen: function () {
      const n = rnd(3, 5), base = rnd(60, 90), a = []; let sum = 0;
      for (let i = 0; i < n; i++) { const v = base + rnd(-6, 6); a.push(v); sum += v; }
      while (sum % n !== 0) { const i = rnd(0, n - 1); a[i]++; sum++; }
      const avg = sum / n;
      return Q(`${n} 名同学的身高（厘米）分别是 ${a.join("、")}。他们的平均身高是多少厘米？`, avg, () => rnd(base - 10, base + 10), `平均数 = 总和 ÷ 个数 = (${a.join(" + ")}) ÷ ${n} = ${sum} ÷ ${n} = ${avg}。`, "平均数");
    } },
    { id: "sumdiff3", name: "和差问题", desc: "(和 ± 差) ÷ 2", gen: function () {
      const big = rnd(20, 80), diff = rnd(4, 30), small = big - diff, sum = big + small, askBig = Math.random() < 0.5;
      return Q(`甲、乙两筐共 ${sum} 个苹果，甲筐比乙筐多 ${diff} 个。${askBig ? "甲" : "乙"}筐有多少个？`, askBig ? big : small, () => rnd(small - 5, big + 6), `甲 = (和 + 差) ÷ 2 = (${sum} + ${diff}) ÷ 2 = ${big}；乙 = (和 − 差) ÷ 2 = ${small}。`, "和差问题");
    } },
    { id: "cycle3", name: "周期问题", desc: "看余数定位第 n 个", gen: function () {
      const colors = ["红", "黄", "蓝", "绿"], n = rnd(15, 60), idx = (n - 1) % 4, ans = colors[idx];
      return Q(`一串珠子按「红、黄、蓝、绿」4 个一组的顺序重复排列，第 ${n} 个珠子是什么颜色？`, ans, () => pick(colors.filter(x => x !== ans)), `${n} ÷ 4 = ${Math.floor(n / 4)} 余 ${n % 4 || 4}，对应一组中的第 ${idx + 1} 个，是${ans}色。`, "周期问题");
    } },
    { id: "guiyi3", name: "归一问题", desc: "先求一份，再求几份", gen: function () {
      const per = rnd(3, 9), n1 = rnd(2, 5), cost = per * n1, n2 = rnd(2, 8), ans = per * n2;
      return Q(`${n1} 本练习册要 ${cost} 元，照这样计算，${n2} 本要多少元？`, ans, () => rnd(per, ans + per * 3), `先求一本：${cost} ÷ ${n1} = ${per} 元；再求 ${n2} 本：${per} × ${n2} = ${ans} 元。`, "归一问题");
    } },
    { id: "chicken3", name: "鸡兔同笼", desc: "假设法求鸡兔只数", gen: function () {
      const H = rnd(8, 20), R = rnd(2, H - 2), C = H - R, F = 2 * C + 4 * R, askR = Math.random() < 0.5;
      const exp = askR ? `假设全是鸡，应有 ${2 * H} 只脚，实际多 ${F - 2 * H} 只；每只兔多 2 脚，兔 = (${F} − ${2 * H}) ÷ 2 = ${R} 只。` : `假设全是兔，应有 ${4 * H} 只脚，实际少 ${4 * H - F} 只；每只鸡少 2 脚，鸡 = (${4 * H} − ${F}) ÷ 2 = ${C} 只。`;
      return Q(`鸡兔同笼，一共 ${H} 个头、${F} 只脚，问${askR ? "兔" : "鸡"}有多少只？`, askR ? R : C, () => rnd(1, H - 1), exp, "鸡兔同笼");
    } },
    { id: "count_rect", name: "数长方形", desc: "行组合 × 列组合", gen: function () {
      const m = rnd(2, 4), n = rnd(2, 4), rows = m * (m + 1) / 2, cols = n * (n + 1) / 2, ans = rows * cols;
      return Q(`由 ${m} 行、${n} 列小方格组成的长方形网格中，一共有多少个长方形（含正方形）？`, ans, () => rnd(2, ans + 6), `长方形数 = 行组合数 × 列组合数 = [${m}×${m + 1}÷2] × [${n}×${n + 1}÷2] = ${rows} × ${cols} = ${ans} 个。`, "数图形");
    } },
    { id: "quick3", name: "简便计算", desc: "25 × 4 = 100 的巧用", gen: function () {
      const k = rnd(2, 9), b = 4 * k, ans = 25 * b;
      return Q(`用简便方法计算：25 × ${b} = ？`, ans, () => rnd(25, b * 30), `把 ${b} 拆成 4 × ${k}：25 × 4 × ${k} = 100 × ${k} = ${ans}。`, "简便计算");
    } }
  ];

  /* ============================================================
   * 四年级
   * ============================================================ */
  const G4 = [
    { id: "chicken4", name: "得失分问题", desc: "鸡兔同笼的得分变式", gen: function () {
      const N = rnd(8, 20), rightPts = rnd(3, 6), wrongLess = rnd(1, rightPts - 1);
      const correct = rnd(Math.ceil(N / 2), N - 1), wrong = N - correct;
      const S = correct * rightPts - wrong * wrongLess, askWrong = Math.random() < 0.5;
      return Q(`抢答赛共 ${N} 题，答对得 ${rightPts} 分、答错倒扣 ${wrongLess} 分。小明最终得 ${S} 分，他${askWrong ? "答错" : "答对"}了几题？`, askWrong ? wrong : correct, () => rnd(1, N), `假设全对得 ${N} × ${rightPts} = ${N * rightPts} 分，实际少 ${N * rightPts - S} 分；每题错比对少 ${rightPts + wrongLess} 分，错题 = ${N * rightPts - S} ÷ ${rightPts + wrongLess} = ${wrong} 题，对题 = ${correct} 题。`, "鸡兔同笼·得失分");
    } },
    { id: "profit4", name: "盈亏问题", desc: "盈 + 亏 ÷ 每份差", gen: function () {
      const a = rnd(3, 6), c = a + rnd(1, 3), N = rnd(4, 10), type = rnd(0, 2), diff = (c - a) * N;
      if (type === 0) { const b = rnd(1, diff - 1), dd = diff - b; return Q(`分糖果：每人分 ${a} 颗多 ${b} 颗，每人分 ${c} 颗少 ${dd} 颗。一共有几个小朋友？`, N, () => rnd(2, N + 8), `人数 = (盈 + 亏) ÷ 每份差 = (${b} + ${dd}) ÷ (${c} − ${a}) = ${diff} ÷ ${c - a} = ${N} 人。`, "盈亏问题"); }
      if (type === 1) { const b = rnd(diff + 1, diff + 12), e = b - diff; return Q(`每本本子分 ${a} 元多 ${b} 元，分 ${c} 元多 ${e} 元。一共有多少本？`, N, () => rnd(2, N + 8), `本数 = (大盈 − 小盈) ÷ 每份差 = (${b} − ${e}) ÷ (${c} − ${a}) = ${N} 本。`, "盈亏问题"); }
      const x = rnd(1, 10), y = x + diff;
      return Q(`分苹果：每人分 ${a} 个少 ${x} 个，每人分 ${c} 个少 ${y} 个。一共有几人？`, N, () => rnd(2, N + 8), `人数 = (大亏 − 小亏) ÷ 每份差 = (${y} − ${x}) ÷ (${c} − ${a}) = ${N} 人。`, "盈亏问题");
    } },
    { id: "trip4", name: "相遇与追及", desc: "速度和 / 速度差", gen: function () {
      if (Math.random() < 0.5) {
        const v1 = rnd(30, 60), v2 = rnd(30, 60), t = rnd(2, 6), s = (v1 + v2) * t;
        return Q(`甲、乙两地相距 ${s} 千米。两人同时从两地相向而行，速度分别是每小时 ${v1} 千米和 ${v2} 千米，几小时后相遇？`, t, () => rnd(1, s), `相遇时间 = 路程 ÷ 速度和 = ${s} ÷ (${v1} + ${v2}) = ${s} ÷ ${v1 + v2} = ${t} 小时。`, "相遇问题");
      }
      const v1 = rnd(40, 60), v2 = rnd(20, 35), t = rnd(2, 5), ds = (v1 - v2) * t;
      return Q(`甲以每小时 ${v1} 千米去追前面的乙（每小时 ${v2} 千米），出发时乙在甲前面 ${ds} 千米。几小时后追上？`, t, () => rnd(1, ds), `追及时间 = 追及路程 ÷ 速度差 = ${ds} ÷ (${v1} − ${v2}) = ${t} 小时。`, "追及问题");
    } },
    { id: "ap4", name: "等差数列", desc: "第 n 项与求和公式", gen: function () {
      const a1 = rnd(1, 9), d = rnd(2, 6), n = rnd(5, 12), an = a1 + (n - 1) * d;
      if (Math.random() < 0.5) return Q(`等差数列 ${a1}、${a1 + d}、${a1 + 2 * d}、…… 第 ${n} 项是多少？`, an, () => rnd(a1, an + d), `第 n 项 = 首项 + (项数 − 1) × 公差 = ${a1} + ${n - 1} × ${d} = ${an}。`, "等差数列");
      const sum = (a1 + an) * n / 2;
      return Q(`等差数列 ${a1}、${a1 + d}、${a1 + 2 * d}、…… 前 ${n} 项的和是多少？`, sum, () => rnd(sum - 20, sum + 20), `末项 = ${a1} + ${n - 1} × ${d} = ${an}；和 = (首项 + 末项) × 项数 ÷ 2 = (${a1} + ${an}) × ${n} ÷ 2 = ${sum}。`, "等差数列");
    } },
    { id: "inclusion4", name: "容斥原理", desc: "两集合重叠", gen: function () {
      const both = rnd(3, 10), onlyA = rnd(4, 15), onlyB = rnd(4, 15);
      const A = onlyA + both, B = onlyB + both, total = onlyA + onlyB + both;
      if (Math.random() < 0.5) return Q(`班里每人至少参加一个兴趣小组：参加数学组的有 ${A} 人，参加美术组的有 ${B} 人，两组都参加的有 ${both} 人。全班共多少人？`, total, () => rnd(both, total + 5), `全班 = 数学 + 美术 − 都参加 = ${A} + ${B} − ${both} = ${total} 人。`, "容斥原理");
      return Q(`参加数学组的有 ${A} 人，参加美术组的有 ${B} 人，两组都参加的有 ${both} 人。只参加数学组的有多少人？`, onlyA, () => rnd(1, A + 3), `只参加数学 = 数学 − 都参加 = ${A} − ${both} = ${onlyA} 人。`, "容斥原理");
    } },
    { id: "logic4", name: "逻辑推理", desc: "把条件串成一条链", gen: function () {
      const three = shuffle(["甲", "乙", "丙"]), hi = three[0], mid = three[1], lo = three[2];
      return Q(`三人比身高：${hi} 比 ${mid} 高，${mid} 比 ${lo} 高。谁最高？`, hi, () => pick([mid, lo]), `把两句话串起来：${hi} > ${mid} > ${lo}，所以 ${hi} 最高。`, "逻辑推理");
    } },
    { id: "age4", name: "年龄倍数", desc: "几年后年龄是几倍", gen: function () {
      const targetK = rnd(2, 4), son = rnd(6, 12), t = rnd(1, 6), dad = targetK * (son + t) - t;
      return Q(`今年爸爸 ${dad} 岁，儿子 ${son} 岁。几年后爸爸的年龄正好是儿子的 ${targetK} 倍？`, t, () => rnd(1, t + 6), `设 x 年后：${dad} + x = ${targetK} × (${son} + x)，解得 x = (${dad} − ${targetK}×${son}) ÷ (${targetK} − 1) = ${t} 年。`, "年龄问题");
    } },
    { id: "magic4", name: "三阶幻方", desc: "每线和为 15，中心为 5", gen: function () {
      if (Math.random() < 0.5) return Q(`用 1~9 填一个三阶幻方（每行、每列、每条对角线之和都相等）。每条线上的和是多少？`, 15, () => rnd(9, 21), `1 + 2 + … + 9 = 45，平均分给 3 行，每行和 = 45 ÷ 3 = 15。`, "幻方");
      return Q(`三阶幻方用 1~9 填数，每行、每列、对角线之和相等。中心格的数是多少？`, 5, () => rnd(1, 9), `每线之和为 15，中心格参与 4 条线，由对称性中心为两端平均数 (1 + 9) ÷ 2 = 5。`, "幻方");
    } },
    { id: "quick4", name: "简便计算", desc: "乘法分配律 99 / 101", gen: function () {
      const a = rnd(12, 99);
      if (Math.random() < 0.5) { const ans = a * 99; return Q(`用简便方法计算：${a} × 99 = ？`, ans, () => rnd(ans - a * 4, ans + a * 4), `${a} × 99 = ${a} × (100 − 1) = ${a * 100} − ${a} = ${ans}。`, "简便计算"); }
      const ans = a * 101; return Q(`用简便方法计算：${a} × 101 = ？`, ans, () => rnd(ans - a * 4, ans + a * 4), `${a} × 101 = ${a} × (100 + 1) = ${a * 100} + ${a} = ${ans}。`, "简便计算");
    } }
  ];

  /* ============================================================
   * 五年级
   * ============================================================ */
  const G5 = [
    { id: "cow5", name: "牛吃草", desc: "草每天匀速生长", gen: function () {
      const A = pick([36, 48, 60, 72, 84, 90, 120]);
      const pool = divisors(A).filter(d => d >= 4 && d <= 30);
      const ds = shuffle(pool).slice(0, 3);
      const g = rnd(1, 2);
      const n1 = g + ds[0], T1 = A / ds[0], n2 = g + ds[1], T2 = A / ds[1], n3 = g + ds[2], T3 = A / ds[2];
      return Q(`一片牧草每天匀速生长，可供 ${n1} 头牛吃 ${T1} 天，或供 ${n2} 头牛吃 ${T2} 天。若供 ${n3} 头牛，可以吃多少天？`, T3, () => rnd(2, T3 + 6), `设每头牛每天吃 1 份、草每天长 g 份：${A} + g × ${T1} = ${n1} × ${T1}，${A} + g × ${T2} = ${n2} × ${T2}，解得每天长草 g = ${g}、原有草量 = ${A} 份。故 ${n3} 头牛：${A} ÷ (${n3} − ${g}) = ${T3} 天。`, "牛吃草问题");
    } },
    { id: "conc5", name: "浓度问题", desc: "含盐率与含盐量", gen: function () {
      const p = pick([5, 10, 20, 25, 40, 50]), m = rnd(2, 8) * 100, salt = m * p / 100;
      if (Math.random() < 0.5) return Q(`${m} 克盐水含盐率为 ${p}%，其中含盐多少克？`, salt, () => rnd(Math.floor(salt / 2), salt * 2), `含盐量 = 盐水质量 × 含盐率 = ${m} × ${p}% = ${salt} 克。`, "浓度问题");
      const water = m - salt;
      return Q(`${m} 克盐水含盐率为 ${p}%，其中含水多少克？`, water, () => rnd(Math.floor(water / 2), m), `含水 = 盐水质量 − 含盐量 = ${m} − ${salt} = ${water} 克。`, "浓度问题");
    } },
    { id: "engineer5", name: "工程问题", desc: "把工程看作 1", gen: function () {
      const Te = rnd(1, 4) * 2, a = 3 * Te, b = Te * 3 / 2;
      return Q(`一项工程，甲单独做需要 ${a} 天，乙单独做需要 ${b} 天。两人合作，几天可以完成？`, Te, () => rnd(1, a), `把工程看作 1：甲每天做 1/${a}，乙每天做 1/${b}，合作每天做 1/${a} + 1/${b} = 1/${Te}，所以需要 ${Te} 天。`, "工程问题");
    } },
    { id: "numtheory5", name: "数论初步", desc: "约数个数与数的整除", gen: function () {
      if (Math.random() < 0.5) {
        const p = pick([2, 3, 5]), e1 = rnd(2, 4), q = pick([2, 3, 5, 7].filter(x => x !== p)), e2 = rnd(1, 2);
        const n = Math.pow(p, e1) * Math.pow(q, e2), cnt = (e1 + 1) * (e2 + 1);
        return Q(`${n} 的因数（约数）一共有多少个？`, cnt, () => rnd(2, cnt + 6), `${n} = ${p}^${e1} × ${q}^${e2}，因数个数 = (${e1} + 1) × (${e2} + 1) = ${cnt} 个。`, "约数个数");
      }
      const k = pick([3, 4, 5, 6, 7, 8, 9]), n = rnd(50, 200), cnt = Math.floor(n / k);
      return Q(`从 1 到 ${n} 中，能被 ${k} 整除的数一共有多少个？`, cnt, () => rnd(1, cnt + 5), `个数 = ⌊${n} ÷ ${k}⌋ = ${cnt} 个。`, "数的整除");
    } },
    { id: "fraction5", name: "分数应用", desc: "求一个数的几分之几", gen: function () {
      const den = rnd(3, 9), num = rnd(1, den - 1), whole = den * rnd(3, 12), part = whole * num / den;
      if (Math.random() < 0.5) return Q(`一堆货物共 ${whole} 吨，运走了 ${num}/${den}，运走了多少吨？`, part, () => rnd(Math.floor(part / 2), part + 10), `运走量 = ${whole} × ${num}/${den} = ${part} 吨。`, "分数应用");
      const rest = whole - part;
      return Q(`一堆货物共 ${whole} 吨，运走了 ${num}/${den}，还剩多少吨？`, rest, () => rnd(part, whole + 10), `运走 ${whole} × ${num}/${den} = ${part} 吨，还剩 ${whole} − ${part} = ${rest} 吨。`, "分数应用");
    } },
    { id: "boat5", name: "流水与过桥", desc: "顺水逆水、火车过桥", gen: function () {
      if (Math.random() < 0.5) {
        const boat = rnd(10, 25), cur = rnd(2, 6), down = boat + cur, up = boat - cur, askDown = Math.random() < 0.5;
        return Q(`一条船在静水中每小时行 ${boat} 千米，水流每小时 ${cur} 千米。它${askDown ? "顺水" : "逆水"}每小时行多少千米？`, askDown ? down : up, () => rnd(2, down + 5), `${askDown ? "顺水" : "逆水"}速度 = 船速 ${askDown ? "+" : "−"} 水速 = ${boat} ${askDown ? "+" : "−"} ${cur} = ${askDown ? down : up} 千米/时。`, "流水行船");
      }
      const len = rnd(10, 20) * 10, bridge = rnd(20, 50) * 10, L = len + bridge;
      const dv = []; for (let i = 10; i <= 30; i++) if (L % i === 0) dv.push(i);
      if (dv.length) { const v = pick(dv), t = L / v; return Q(`一列火车长 ${len} 米，以每秒 ${v} 米的速度完全通过一座长 ${bridge} 米的大桥，需要多少秒？`, t, () => rnd(1, t + 8), `通过时间 = (车长 + 桥长) ÷ 速度 = (${len} + ${bridge}) ÷ ${v} = ${t} 秒。`, "火车过桥"); }
      const boat = rnd(10, 25), cur = rnd(2, 6);
      return Q(`一条船静水速度每小时 ${boat} 千米，水流每小时 ${cur} 千米，顺水每小时行多少千米？`, boat + cur, () => rnd(2, boat + cur + 5), `顺水速度 = ${boat} + ${cur} = ${boat + cur} 千米/时。`, "流水行船");
    } },
    { id: "pigeon5", name: "抽屉原理", desc: "最不利情况 + 1", gen: function () {
      const drawers = rnd(3, 8), per = rnd(2, 4), ans = drawers * (per - 1) + 1, item = pick(["苹果", "铅笔", "小球", "糖果"]);
      return Q(`把${item}放进 ${drawers} 个抽屉，要保证至少有一个抽屉里不少于 ${per} 个，至少要放多少个${item}？`, ans, () => rnd(1, ans + 5), `最不利情况是每个抽屉先放 ${per - 1} 个，共 ${drawers} × ${per - 1} = ${drawers * (per - 1)} 个；再多放 1 个就必有抽屉达到 ${per} 个，所以至少 ${ans} 个。`, "抽屉原理");
    } },
    { id: "newop5", name: "定义新运算", desc: "按新规则代入求值", gen: function () {
      const a = rnd(3, 12), b = rnd(3, 12), type = rnd(0, 2);
      if (type === 0) { const ans = a * b - (a + b); return Q(`规定 a ※ b = a × b − (a + b)。求 ${a} ※ ${b} 的值。`, ans, () => rnd(ans - 8, ans + 8), `按定义代入：${a} ※ ${b} = ${a} × ${b} − (${a} + ${b}) = ${a * b} − ${a + b} = ${ans}。`, "定义新运算"); }
      if (type === 1) { const ans = (a + b) * 2; return Q(`规定 a ◎ b = (a + b) × 2。求 ${a} ◎ ${b} 的值。`, ans, () => rnd(ans - 8, ans + 8), `按定义代入：${a} ◎ ${b} = (${a} + ${b}) × 2 = ${a + b} × 2 = ${ans}。`, "定义新运算"); }
      const ans = a * b + a - b; return Q(`规定 a ⊙ b = a × b + a − b。求 ${a} ⊙ ${b} 的值。`, ans, () => rnd(ans - 8, ans + 8), `按定义代入：${a} ⊙ ${b} = ${a} × ${b} + ${a} − ${b} = ${a * b} + ${a} − ${b} = ${ans}。`, "定义新运算");
    } }
  ];

  /* ============================================================
   * 六年级
   * ============================================================ */
  const G6 = [
    { id: "ratio6", name: "按比分配", desc: "先求总份数与一份", gen: function () {
      const a = rnd(2, 5), b = rnd(2, 5), c = a + b, total = c * rnd(3, 12), askA = Math.random() < 0.5;
      const pa = total * a / c, pb = total * b / c;
      return Q(`把 ${total} 按 ${a} : ${b} 分给甲、乙两人，${askA ? "甲" : "乙"}分得多少？`, askA ? pa : pb, () => rnd(1, total - 1), `总份数 = ${a} + ${b} = ${c}，一份 = ${total} ÷ ${c} = ${total / c}；${askA ? "甲" : "乙"} = ${total / c} × ${askA ? a : b} = ${askA ? pa : pb}。`, "按比分配");
    } },
    { id: "percent6", name: "百分数应用", desc: "折扣 / 利润 / 百分数", gen: function () {
      const type = rnd(0, 2);
      if (type === 0) { const price = rnd(20, 90) * 10, dz = rnd(6, 9), ans = price * dz / 10; return Q(`一件商品原价 ${price} 元，打 ${dz} 折出售，现价多少元？`, ans, () => rnd(Math.floor(ans / 2), ans + 20), `打 ${dz} 折 = 原价 × ${dz / 10} = ${price} × ${dz / 10} = ${ans} 元。`, "百分数·折扣"); }
      if (type === 1) { const cost = rnd(20, 80) * 10, rate = rnd(1, 5) * 10, sell = cost * (1 + rate / 100); return Q(`一件商品进价 ${cost} 元，按 ${rate}% 的利润率定价，售价多少元？`, sell, () => rnd(cost, sell + 30), `售价 = 进价 × (1 + 利润率) = ${cost} × ${1 + rate / 100} = ${sell} 元。`, "百分数·利润"); }
      const total = rnd(2, 10) * 100, p = rnd(1, 5) * 10, ans = total * p / 100;
      return Q(`${total} 的 ${p}% 是多少？`, ans, () => rnd(1, total), `${total} × ${p}% = ${total} × ${p / 100} = ${ans}。`, "百分数应用");
    } },
    { id: "circle6", name: "圆的周长面积", desc: "C = 2πr，S = πr²", gen: function () {
      const r = rnd(2, 10);
      if (Math.random() < 0.5) { const c = 2 * Math.PI * r, ans = Math.round(c * 100) / 100; return Q(`一个圆的半径是 ${r} 厘米，它的周长是多少厘米？（π 取 3.14）`, ans, () => Math.round((ans + rnd(-3, 5)) * 100) / 100, `周长 C = 2πr = 2 × 3.14 × ${r} = ${ans} 厘米。`, "圆的周长"); }
      const s = Math.PI * r * r, ans = Math.round(s * 100) / 100;
      return Q(`一个圆的半径是 ${r} 厘米，它的面积是多少平方厘米？（π 取 3.14）`, ans, () => Math.round((ans + rnd(-10, 30)) * 100) / 100, `面积 S = πr² = 3.14 × ${r} × ${r} = ${ans} 平方厘米。`, "圆的面积");
    } },
    { id: "solid6", name: "圆柱与圆锥", desc: "V = πr²h，圆锥 ÷ 3", gen: function () {
      const r = pick([1, 2, 3, 4, 5]), h = rnd(3, 10), V = Math.round(3.14 * r * r * h * 100) / 100;
      if (Math.random() < 0.5) return Q(`一个圆柱的底面半径是 ${r} 厘米，高是 ${h} 厘米，体积是多少立方厘米？（π 取 3.14）`, V, () => Math.round((V + rnd(-20, 40)) * 100) / 100, `圆柱体积 V = πr²h = 3.14 × ${r} × ${r} × ${h} = ${V} 立方厘米。`, "圆柱体积");
      const Vc = Math.round(V / 3 * 100) / 100;
      return Q(`一个圆锥的底面半径是 ${r} 厘米，高是 ${h} 厘米，体积是多少立方厘米？（π 取 3.14）`, Vc, () => Math.round((Vc + rnd(-10, 20)) * 100) / 100, `圆锥体积 V = ⅓πr²h = 3.14 × ${r} × ${r} × ${h} ÷ 3 = ${Vc} 立方厘米。`, "圆锥体积");
    } },
    { id: "conc6", name: "浓度混合", desc: "盐总量 ÷ 盐水总量", gen: function () {
      const m1 = rnd(1, 4) * 100, m2 = rnd(1, 4) * 100, p1 = pick([5, 10, 20]), p2 = pick([20, 30, 40, 50]);
      const salt = m1 * p1 / 100 + m2 * p2 / 100, conc = Math.round(salt / (m1 + m2) * 1000) / 10;
      return Q(`把 ${m1} 克含盐 ${p1}% 的盐水与 ${m2} 克含盐 ${p2}% 的盐水混合，混合后的含盐率约是多少？（保留一位小数，单位 %）`, conc, () => Math.round((conc + rnd(-8, 8)) * 10) / 10, `盐共 ${m1} × ${p1}% + ${m2} × ${p2}% = ${salt} 克；盐水共 ${m1} + ${m2} = ${m1 + m2} 克；含盐率 = ${salt} ÷ ${m1 + m2} × 100% ≈ ${conc}%。`, "浓度问题");
    } },
    { id: "trip6", name: "行程综合", desc: "环形相遇与相向相遇", gen: function () {
      const sum = rnd(8, 16), t = rnd(2, 10), L = sum * t;
      if (Math.random() < 0.5) { const v1 = rnd(3, sum - 3), v2 = sum - v1; return Q(`环形跑道一圈 ${L} 米，甲每秒 ${v1} 米、乙每秒 ${v2} 米，两人从同一地点反向出发，第一次相遇需要多少秒？`, t, () => rnd(2, t + 8), `反向相遇：时间 = 一圈 ÷ 速度和 = ${L} ÷ (${v1} + ${v2}) = ${t} 秒。`, "环形行程"); }
      const v1 = rnd(4, 10), v2 = rnd(4, 10);
      return Q(`两地相距 ${L} 米，甲、乙同时相向出发，速度分别是每秒 ${v1} 米和 ${v2} 米，经过多少秒相遇？`, t, () => rnd(1, t + 8), `相遇时间 = 路程 ÷ 速度和 = ${L} ÷ (${v1} + ${v2}) = ${t} 秒。`, "相遇问题");
    } },
    { id: "remainder6", name: "带余除法", desc: "余数与周期余数", gen: function () {
      if (Math.random() < 0.5) {
        const d = rnd(3, 9), q = rnd(4, 20), r = rnd(1, d - 1), n = d * q + r;
        return Q(`${n} ÷ ${d} = ${q} …… （　），余数是多少？`, r, () => rnd(0, d), `余数 = 被除数 − 除数 × 商 = ${n} − ${d} × ${q} = ${r}。`, "带余除法");
      }
      const k = rnd(3, 7), n = rnd(20, 80), r = n % k, ans = r === 0 ? k : r;
      return Q(`一排数字按 1、2、…、${k} 循环排列，第 ${n} 个数字是几？`, ans, () => rnd(1, k), `${n} ÷ ${k} 余 ${r}${r === 0 ? "（整除）" : ""}，所以第 ${n} 个数字是 ${ans}。`, "周期余数");
    } },
    { id: "extreme6", name: "最值原理", desc: "最不利 + 1", gen: function () {
      const k = rnd(3, 6), ans = k + 1, item = pick(["小球", "铅笔", "本子"]);
      return Q(`箱子里有 ${k} 种颜色的${item}（数量足够多且看不见颜色）。一次至少要摸出多少个，才能保证有 2 个同色？`, ans, () => rnd(2, k + 4), `最不利情况是每种颜色各摸 1 个，共 ${k} 个；再多摸 1 个就必定出现 2 个同色，所以至少 ${ans} 个。`, "抽屉·最不利");
    } }
  ];

  /* ============================================================
   * 追加题型引擎（对齐《举一反三》教材目录的 240 个专题）
   * 全部原创参数化；同一引擎可服务多个年级的同类专题。
   * ============================================================ */
  const EXTRA = [
    /* ---------- 数数与观察 ---------- */
    { id: "count_objects", name: "数数有多少", desc: "一个一个数出个数", gen: function () {
      const sym = pick(["★", "●", "▲", "■", "◆"]), n = rnd(6, 15);
      return Q(`数一数，下面一共有多少个 ${sym}？\n${sym.repeat(n)}`, n, () => rnd(1, n + 4), `一个一个地数：一共有 ${n} 个。`, "数数");
    } },
    { id: "ordinal", name: "几和第几", desc: "第几个与前面有几人", gen: function () {
      const k = rnd(2, 9);
      return Q(`小朋友排队，小明从前面数是第 ${k} 个。小明的前面有几个人？`, k - 1, () => rnd(1, k + 2), `第 ${k} 个，说明前面有 ${k} − 1 = ${k - 1} 个人。`, "几和第几");
    } },
    { id: "same_diff", name: "相同与不同", desc: "找出与众不同的一个", gen: function () {
      const base = rnd(2, 9), other = pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== base));
      const seq = shuffle([base, base, base, base, other]);
      return Q(`下面几个数中，哪一个与其它不同？\n${seq.join("、")}`, other, () => pick([base, other + rnd(1, 3)]), `其它都是 ${base}，只有 ${other} 不一样。`, "相同与不同");
    } },
    { id: "observe_find", name: "谁的眼力好", desc: "比较三行图形的多少", gen: function () {
      const c = shuffle([3, 4, 5, 6, 7, 8]).slice(0, 3), sym = ["○", "△", "□"];
      let mi = 0; for (let i = 1; i < 3; i++) if (c[i] > c[mi]) mi = i;
      const desc = c.map((n, i) => `第${i + 1}行 ${sym[i].repeat(n)}`).join("\n");
      return Q(`看一看下面三行图形，第几行最多？\n${desc}`, mi + 1, () => rnd(1, 3), `数一数：第1行 ${c[0]} 个、第2行 ${c[1]} 个、第3行 ${c[2]} 个，第 ${mi + 1} 行最多。`, "观察比较");
    } },
    { id: "observe_think", name: "观察与思考", desc: "剪角后角数的变化", gen: function () {
      const n = pick([3, 4, 5]), nm = { 3: "三角", 4: "正方", 5: "五边" }[n];
      return Q(`一个${nm}形有 ${n} 个角，剪掉 1 个角（剪痕不经过其它顶点），还剩多少个角？`, n + 1, () => rnd(n - 1, n + 3), `剪掉 1 个角，这个角会变成 2 个角，所以角数增加 1：${n} + 1 = ${n + 1} 个。`, "观察与思考");
    } },
    /* ---------- 图形与计数 ---------- */
    { id: "path_count", name: "有几种走法", desc: "分步相乘求路线数", gen: function () {
      const a = rnd(2, 4), b = rnd(2, 4), ans = a * b;
      return Q(`从甲地到乙地有 ${a} 条路，从乙地到丙地有 ${b} 条路。从甲地经过乙地到丙地，一共有多少种不同的走法？`, ans, () => rnd(2, ans + 4), `分两步走，用乘法：${a} × ${b} = ${ans} 种。`, "乘法原理");
    } },
    { id: "count_cubes", name: "数数块数", desc: "长方体积木的总块数", gen: function () {
      const a = rnd(2, 4), b = rnd(2, 4), c = rnd(2, 4), ans = a * b * c;
      return Q(`用同样的小方块堆成一个长 ${a} 块、宽 ${b} 块、高 ${c} 块的长方体，一共用了多少个小方块？`, ans, () => rnd(2, ans + 6), `总数 = ${a} × ${b} × ${c} = ${ans} 个。`, "数方块");
    } },
    { id: "pattern_draw", name: "找规律画图", desc: "判断第几个是什么图形", gen: function () {
      const pair = pick([["○", "△"], ["□", "○"], ["△", "□"], ["●", "○"]]);
      const n = rnd(6, 15), idx = (n - 1) % 2, ans = pair[idx];
      return Q(`图形按「${pair[0]}、${pair[1]}」两个一组重复排列，第 ${n} 个图形是什么？`, ans, () => pair[1 - idx], `${n} ÷ 2 余 ${n % 2 || 2}，是这一组中的第 ${idx + 1} 个，所以是 ${ans}。`, "找规律");
    } },
    { id: "tangram", name: "妙拼七巧板", desc: "七巧板的组成", gen: function () {
      if (Math.random() < 0.5) return Q(`一副七巧板一共有多少块？`, 7, () => rnd(4, 11), `七巧板由 7 块图形组成。`, "七巧板");
      return Q(`一副七巧板中，三角形一共有几块？`, 5, () => rnd(2, 7), `七巧板共 7 块，其中 5 块是三角形，另外 2 块是正方形和平行四边形。`, "七巧板");
    } },
    { id: "cut_pieces", name: "图形折剪拼", desc: "剪几刀得到几段", gen: function () {
      const k = rnd(2, 6);
      return Q(`一根绳子剪 ${k} 刀，最多能剪成几段？`, k + 1, () => rnd(1, k + 5), `剪 1 刀变 2 段，每多剪 1 刀多 1 段：${k} + 1 = ${k + 1} 段。`, "剪拼");
    } },
    { id: "perimeter", name: "巧求周长", desc: "长方形、正方形与拼接", gen: function () {
      const type = rnd(0, 2);
      if (type === 0) { const a = rnd(4, 15), b = rnd(2, 12), ans = 2 * (a + b); return Q(`一个长方形的长是 ${a} 厘米、宽是 ${b} 厘米，它的周长是多少厘米？`, ans, () => rnd(2, a + b), `周长 = (长 + 宽) × 2 = (${a} + ${b}) × 2 = ${ans} 厘米。`, "长方形周长"); }
      if (type === 1) { const s = rnd(3, 9), ans = 4 * s; return Q(`一个正方形的边长是 ${s} 厘米，周长是多少厘米？`, ans, () => rnd(2, 4 * s), `正方形周长 = 边长 × 4 = ${s} × 4 = ${ans} 厘米。`, "正方形周长"); }
      const s = rnd(3, 8), ans = 6 * s;
      return Q(`用两个边长 ${s} 厘米的正方形拼成一个长方形，这个长方形的周长是多少厘米？`, ans, () => rnd(2, 8 * s), `拼成长 ${2 * s} 厘米、宽 ${s} 厘米的长方形，周长 = (${2 * s} + ${s}) × 2 = ${ans} 厘米。`, "周长的变化");
    } },
    { id: "area", name: "面积计算", desc: "长方形、正方形、三角形面积", gen: function () {
      const type = rnd(0, 2);
      if (type === 0) { const a = rnd(4, 15), b = rnd(3, 12), ans = a * b; return Q(`一个长方形长 ${a} 厘米、宽 ${b} 厘米，面积是多少平方厘米？`, ans, () => rnd(2, ans + 10), `面积 = 长 × 宽 = ${a} × ${b} = ${ans} 平方厘米。`, "长方形面积"); }
      if (type === 1) { const s = rnd(3, 12), ans = s * s; return Q(`一个正方形的边长是 ${s} 厘米，面积是多少平方厘米？`, ans, () => rnd(2, ans + 10), `面积 = 边长 × 边长 = ${s} × ${s} = ${ans} 平方厘米。`, "正方形面积"); }
      const b = rnd(2, 8) * 2, h = rnd(3, 10), ans = b * h / 2;
      return Q(`一个三角形的底是 ${b} 厘米、高是 ${h} 厘米，面积是多少平方厘米？`, ans, () => rnd(2, b * h), `三角形面积 = 底 × 高 ÷ 2 = ${b} × ${h} ÷ 2 = ${ans} 平方厘米。`, "三角形面积");
    } },
    { id: "area_cover", name: "客厅与铺地", desc: "方砖铺地需要几块", gen: function () {
      const a = rnd(3, 9), b = rnd(2, 8), s = pick([1, 2]), ans = (a * b * 100) / (s * s);
      return Q(`一间长 ${a} 米、宽 ${b} 米的地面，用边长 ${s} 分米的方砖来铺，一共需要多少块？`, ans, () => rnd(s, ans + s * 10), `地面 = ${a} × ${b} = ${a * b} 平方米 = ${a * b * 100} 平方分米；每块砖 = ${s} × ${s} = ${s * s} 平方分米；块数 = ${a * b * 100} ÷ ${s * s} = ${ans} 块。`, "铺地面积");
    } },
    { id: "euler", name: "一笔画成", desc: "奇点个数决定能否一笔画", gen: function () {
      const four = shuffle(["奇点个数是 0 个或 2 个", "奇点个数是 1 个", "奇点个数是 3 个", "奇点个数是 4 个"]);
      const correct = "奇点个数是 0 个或 2 个";
      return { q: "一个连通的图形，满足什么条件时才能一笔画成？", options: four, ans: four.indexOf(correct), explain: "一笔画的判定：奇点（引出奇数条线的点）个数是 0 个或 2 个时，才能一笔画成。", point: "一笔画", level: "奥数", fig: null };
    } },
    { id: "matchstick", name: "火柴棒游戏", desc: "摆正方形用几根火柴", gen: function () {
      const n = rnd(2, 8), ans = 3 * n + 1;
      return Q(`用火柴棒摆成一排的 ${n} 个正方形，相邻两个正方形共用一条边，一共需要多少根火柴棒？`, ans, () => rnd(4, ans + 4), `第 1 个用 4 根，后面每个只添 3 根：4 + 3 × (${n} − 1) = ${ans} 根。`, "火柴棒");
    } },
    { id: "balance", name: "天平平衡", desc: "等量代换的连乘", gen: function () {
      const a = rnd(2, 4), b = rnd(2, 3), c = rnd(2, 3), ans = a * b * c;
      return Q(`1 个西瓜和 ${a} 个菠萝一样重，1 个菠萝和 ${b} 个苹果一样重，1 个苹果和 ${c} 个草莓一样重。1 个西瓜和多少个草莓一样重？`, ans, () => rnd(2, ans + 8), `1 个西瓜 = ${a} × ${b} × ${c} = ${ans} 个草莓。`, "等量代换");
    } },
    /* ---------- 数与式 ---------- */
    { id: "fill_number", name: "填数", desc: "口算填未知数", gen: function () {
      const ans = rnd(2, 15), b = rnd(2, 9);
      if (Math.random() < 0.5) { const s = ans + b; return Q(`在方框里填合适的数：（　）+ ${b} = ${s}`, ans, () => rnd(1, s), `（　）= ${s} − ${b} = ${ans}。`, "填数"); }
      const p = ans * b;
      return Q(`在方框里填合适的数：（　）× ${b} = ${p}`, ans, () => rnd(1, p), `（　）= ${p} ÷ ${b} = ${ans}。`, "填数");
    } },
    { id: "riddle_expr", name: "算式之谜", desc: "符号代表的数", gen: function () {
      const x = rnd(2, 9), k = rnd(2, 4), s = x * k;
      const expr = Array(k).fill("△").join(" + ");
      return Q(`下面的算式中同一个符号表示同一个数：${expr} = ${s}。△ 表示多少？`, x, () => rnd(1, s), `${k} 个 △ 的和是 ${s}，△ = ${s} ÷ ${k} = ${x}。`, "算式谜");
    } },
    { id: "riddle_word", name: "文字之谜", desc: "汉字算式求代表数", gen: function () {
      const ch = pick(["数", "学", "奥", "巧", "思"]), k = rnd(2, 4), x = rnd(2, 9), s = x * k;
      return Q(`在算式「${ch} × ${k} = ${s}」中，同一个汉字表示同一个数。${ch} 代表几？`, x, () => rnd(1, s), `${ch} = ${s} ÷ ${k} = ${x}。`, "文字之谜");
    } },
    { id: "fill_op", name: "巧添符号", desc: "选择合适的运算符号", gen: function () {
      const type = rnd(0, 3);
      if (type === 0) { const a = rnd(2, 9); return Q(`在 ○ 里填合适的运算符号，使等式成立：${a} ○ ${a} = ${a * a}`, "×", () => pick(["+", "−", "÷"]), `${a} × ${a} = ${a * a}，所以填 ×。`, "填符号"); }
      if (type === 1) { const a = rnd(2, 9); return Q(`在 ○ 里填合适的运算符号，使等式成立：${a} ○ ${a} = ${2 * a}`, "+", () => pick(["−", "×", "÷"]), `${a} + ${a} = ${2 * a}，所以填 +。`, "填符号"); }
      if (type === 2) { const a = rnd(3, 9); return Q(`在 ○ 里填合适的运算符号，使等式成立：${a * a} ○ ${a} = ${a}`, "÷", () => pick(["+", "−", "×"]), `${a * a} ÷ ${a} = ${a}，所以填 ÷。`, "填符号"); }
      const a = rnd(3, 9);
      return Q(`在 ○ 里填合适的运算符号，使等式成立：${a} ○ ${a} = 0`, "−", () => pick(["+", "×", "÷"]), `${a} − ${a} = 0，所以填 −。`, "填符号");
    } },
    { id: "quick_calc", name: "巧算速算", desc: "凑整巧算", gen: function () {
      const a = rnd(11, 49), c = 100 - a, b = rnd(5, 50), ans = a + b + c;
      return Q(`用简便方法计算：${a} + ${b} + ${c} = ？`, ans, () => rnd(ans - 20, ans + 20), `先凑整：${a} + ${c} = 100，再算 100 + ${b} = ${ans}。`, "凑整巧算");
    } },
    { id: "quick_mul", name: "乘法速算", desc: "×11 的速算", gen: function () {
      const d1 = rnd(1, 8), d2 = rnd(1, 9 - d1), a = d1 * 10 + d2, ans = a * 11;
      return Q(`用速算方法计算：${a} × 11 = ？`, ans, () => rnd(a * 9, a * 13), `${a} × 11 用「两头一拉、中间相加」：百位取 ${d1}、个位取 ${d2}，中间是 ${d1} + ${d2} = ${d1 + d2}，结果 ${ans}。`, "乘法速算");
    } },
    { id: "quick_calc6", name: "简便运算", desc: "乘法分配律的巧用", gen: function () {
      const type = rnd(0, 2), a = rnd(12, 97);
      if (type === 0) { const ans = a * 100; return Q(`用简便方法计算：99 × ${a} + ${a} = ？`, ans, () => rnd(a * 85, a * 115), `99 个 ${a} 再加 1 个 ${a}，正好 100 个：100 × ${a} = ${ans}。`, "简便运算"); }
      if (type === 1) { const ans = a * 100; return Q(`用简便方法计算：101 × ${a} − ${a} = ？`, ans, () => rnd(a * 85, a * 115), `101 个 ${a} 减去 1 个 ${a} 剩 100 个：100 × ${a} = ${ans}。`, "简便运算"); }
      const k = rnd(2, 9), ans = 25 * 4 * k;
      return Q(`用简便方法计算：25 × 4 × ${k} = ？`, ans, () => rnd(100, 1200), `25 × 4 = 100，100 × ${k} = ${ans}。`, "简便运算");
    } },
    { id: "read_write_num", name: "数的读写", desc: "读作与写作互化", gen: function () {
      const pairs = [["四百零五", 405], ["三百二十", 320], ["五千零八", 5008], ["一千零六十", 1060], ["七百", 700], ["二百零三", 203], ["九百零九", 909], ["六千", 6000]];
      const it = pick(pairs);
      if (Math.random() < 0.5) return Q(`“${it[0]}”写作（　）`, it[1], () => rnd(100, 9999), `${it[0]} 写作 ${it[1]}。`, "数的读写");
      return Q(`${it[1]} 读作（　）`, it[0], () => pick(pairs.filter(p => p[0] !== it[0]).map(p => p[0])), `${it[1]} 读作“${it[0]}”。`, "数的读写");
    } },
    { id: "decompose", name: "数的分解", desc: "把一个数分成两部分", gen: function () {
      const t = rnd(6, 18), a = rnd(1, t - 1), b = t - a;
      return Q(`把 ${t} 分成两个数，其中一个数是 ${a}，另一个数是多少？`, b, () => rnd(1, t + a), `另一个数 = ${t} − ${a} = ${b}。`, "数的分解");
    } },
    { id: "number_fun", name: "数字趣谈", desc: "数位之间的关系", gen: function () {
      const tens = rnd(1, 8), units = rnd(0, 9), n = tens * 10 + units;
      return Q(`一个两位数，十位数字与个位数字的和是 ${tens + units}，十位数字是 ${tens}。这个两位数是多少？`, n, () => rnd(10, 99), `个位数字 = ${tens + units} − ${tens} = ${units}，所以这个两位数是 ${n}。`, "数字趣味");
    } },
    { id: "last_digit", name: "尾数和余数", desc: "积的个位数字", gen: function () {
      const a = rnd(11, 99), b = rnd(11, 99), d = (a % 10) * (b % 10) % 10;
      return Q(`${a} × ${b} 的个位数字是几？`, d, () => rnd(0, 9), `只看个位：${a % 10} × ${b % 10} = ${(a % 10) * (b % 10)}，个位数字是 ${d}。`, "尾数");
    } },
    { id: "binary", name: "二进制题", desc: "二进制与十进制互化", gen: function () {
      const len = rnd(3, 4), bits = [];
      for (let i = 0; i < len; i++) bits.push(i === 0 ? 1 : rnd(0, 1));
      const bin = bits.join(""), dec = parseInt(bin, 2);
      if (Math.random() < 0.5) return Q(`把二进制数 (${bin})₂ 化成十进制数是多少？`, dec, () => rnd(1, dec + 8), `按位展开：(${bin})₂ = ${bits.map((b, i) => b ? `${b}×2^${len - 1 - i}` : null).filter(Boolean).join(" + ")} = ${dec}。`, "二进制");
      return Q(`把十进制数 ${dec} 化成二进制是多少？`, bin, () => { const i = rnd(0, len - 1), b2 = bits.slice(); b2[i] = 1 - b2[i]; return b2.join(""); }, `${dec} 化成二进制是 ${bin}。`, "二进制");
    } },
    { id: "remainder_simple", name: "余数妙用", desc: "有余数的除法", gen: function () {
      const d = rnd(3, 9), q = rnd(2, 9), r = rnd(1, d - 1), n = d * q + r;
      if (Math.random() < 0.5) return Q(`${n} 个苹果，每 ${d} 个装一盘，最多能装满几盘？`, q, () => rnd(1, n), `${n} ÷ ${d} = ${q} …… ${r}，能装满 ${q} 盘，还剩 ${r} 个。`, "有余除法");
      return Q(`${n} 个苹果，每 ${d} 个装一盘，能装满几盘？还剩几个？（只填剩几个）`, r, () => rnd(0, d - 1), `${n} ÷ ${d} = ${q} …… ${r}，还剩 ${r} 个。`, "有余除法");
    } },
    { id: "fill_vertical", name: "巧填竖式", desc: "由结果倒推未知数", gen: function () {
      const a = rnd(11, 49), b = rnd(11, 49), s = a + b;
      return Q(`竖式计算中，一个两位数加上 ${b} 的结果是 ${s}。这个两位数是多少？`, a, () => rnd(10, a + 6), `用减法倒推：${s} − ${b} = ${a}。`, "竖式");
    } },
    { id: "estimate", name: "估值问题", desc: "把乘数看成整十数估算", gen: function () {
      const per = pick([18, 19, 21, 22, 28, 32, 39, 41, 49]), n = rnd(3, 9), real = per * n;
      const ans = Math.round(per / 10) * 10 * n;
      return Q(`每箱大约有 ${per} 个，${n} 箱大约一共有多少个？（按整十数估算）`, ans, () => pick([real, ans - 20, ans + 20, ans + 10]), `把 ${per} 看成整十数 ${Math.round(per / 10) * 10} 来估算：${Math.round(per / 10) * 10} × ${n} = ${ans} 个（准确值是 ${real}）。`, "估算");
    } },
    { id: "compare_num", name: "比较数的大小", desc: "分数的大小比较", gen: function () {
      let n1, d1, n2, d2;
      do {
        d1 = pick([2, 3, 4, 5, 6, 7, 8]); n1 = rnd(1, d1 - 1);
        d2 = pick([2, 3, 4, 5, 6, 7, 8]); n2 = rnd(1, d2 - 1);
      } while (n1 * d2 === n2 * d1);
      const v1 = n1 / d1, v2 = n2 / d2;
      const big = v1 > v2 ? `${n1}/${d1}` : `${n2}/${d2}`, small = v1 > v2 ? `${n2}/${d2}` : `${n1}/${d1}`;
      const askBig = Math.random() < 0.5;
      return Q(`比较 ${n1}/${d1} 与 ${n2}/${d2} 的大小，${askBig ? "较大" : "较小"}的一个是？`, askBig ? big : small, () => askBig ? small : big, `通分比较得：${n1}/${d1} ${v1 > v2 ? ">" : "<"} ${n2}/${d2}。`, "比较大小");
    } },
    /* ---------- 应用题 ---------- */
    { id: "simple_app1", name: "简单的应用", desc: "一步加减的应用题", gen: function () {
      const a = rnd(5, 20), b = rnd(2, 9);
      if (Math.random() < 0.5) { const ans = a + b; return Q(`树上有 ${a} 只小鸟，又飞来 ${b} 只，现在一共有多少只？`, ans, () => rnd(a, ans + 3), `${a} + ${b} = ${ans} 只。`, "加减应用"); }
      return Q(`盘子里有 ${a} 个苹果，吃掉了 ${b} 个，还剩多少个？`, a - b, () => rnd(1, a + 2), `${a} − ${b} = ${a - b} 个。`, "加减应用");
    } },
    { id: "simple_app2", name: "解决问题", desc: "两步计算的应用题", gen: function () {
      const a = rnd(4, 12), each = rnd(3, 8), take = rnd(2, 10), tot = a * each;
      return Q(`每盒有 ${each} 支铅笔，共 ${a} 盒。送出 ${take} 支后，还剩多少支？`, tot - take, () => rnd(take, tot + 5), `一共有 ${each} × ${a} = ${tot} 支，送出 ${take} 支后剩 ${tot} − ${take} = ${tot - take} 支。`, "两步应用");
    } },
    { id: "simple_app3", name: "解决问题", desc: "三步计算的应用题", gen: function () {
      const each = rnd(3, 9), groups = rnd(2, 4), boxes = groups * rnd(1, 3), tot = each * boxes;
      return Q(`每盒 ${each} 个鸡蛋，共 ${boxes} 盒。把这些鸡蛋平均放到 ${groups} 个篮子里，每个篮子放多少个？`, tot / groups, () => rnd(1, tot), `鸡蛋共 ${each} × ${boxes} = ${tot} 个，每个篮子 ${tot} ÷ ${groups} = ${tot / groups} 个。`, "三步应用");
    } },
    { id: "simple_app4", name: "一般应用题", desc: "归一与归总", gen: function () {
      const per = rnd(15, 60), n1 = rnd(3, 6), t1 = per * n1, n2 = rnd(4, 9), ans = per * n2;
      return Q(`一台机器 ${n1} 小时加工 ${t1} 个零件。照这样计算，${n2} 小时能加工多少个零件？`, ans, () => rnd(per, ans + per * 4), `先求每小时：${t1} ÷ ${n1} = ${per} 个；${n2} 小时：${per} × ${n2} = ${ans} 个。`, "归一问题");
    } },
    { id: "trick2", name: "趣味数学", desc: "上楼梯的间隔问题", gen: function () {
      const per = rnd(5, 12), to1 = rnd(2, 4), t1 = per * (to1 - 1), to2 = rnd(to1 + 1, to1 + 3), ans = per * (to2 - 1);
      return Q(`小明从 1 楼走到 ${to1} 楼用了 ${t1} 秒。照这样的速度，他从 1 楼走到 ${to2} 楼要用多少秒？`, ans, () => rnd(per, ans + per * 3), `从 1 楼到 ${to1} 楼走了 ${to1 - 1} 层，每层 ${t1} ÷ ${to1 - 1} = ${per} 秒；到 ${to2} 楼要走 ${to2 - 1} 层，用时 ${per} × ${to2 - 1} = ${ans} 秒。`, "间隔问题");
    } },
    { id: "cut_rope", name: "连连剪剪", desc: "剪绳子求刀数或段数", gen: function () {
      const seg = rnd(3, 8), d = rnd(2, 5), L = d * seg, cuts = seg - 1;
      if (Math.random() < 0.5) return Q(`一根长 ${L} 米的绳子，每 ${d} 米剪一段，一共要剪几刀？`, cuts, () => rnd(1, seg + 2), `可以剪成 ${L} ÷ ${d} = ${seg} 段，刀数比段数少 1：${seg} − 1 = ${cuts} 刀。`, "间隔问题");
      return Q(`一根绳子剪 ${cuts} 刀，可以剪成几段？`, seg, () => rnd(1, seg + 3), `段数 = 刀数 + 1 = ${cuts} + 1 = ${seg} 段。`, "间隔问题");
    } },
    { id: "number_game", name: "数字游戏", desc: "用数字组成两位数", gen: function () {
      const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      return Q(`用 ${ds.join("、")} 这三个数字，组成没有重复数字的两位数，一共可以组成多少个？`, 6, () => rnd(1, 10), `十位有 3 种选法，个位有 2 种：3 × 2 = 6 个。`, "排列");
    } },
    { id: "enumerate", name: "简单列举", desc: "有序排列不重不漏", gen: function () {
      const n = pick([3, 4]); let ans = 1;
      for (let i = 2; i <= n; i++) ans *= i;
      const chain = []; for (let i = n; i >= 1; i--) chain.push(i);
      return Q(`用 1、2、…、${n} 这 ${n} 个数字，组成没有重复数字的 ${n} 位数，一共可以组成多少个？`, ans, () => rnd(2, ans + 6), `依次安排每一位：${chain.join(" × ")} = ${ans} 个。`, "列举·排列");
    } },
    { id: "error_solve", name: "错中求解", desc: "看错的数带来多大偏差", gen: function () {
      const right = rnd(12, 45), w = right + rnd(1, 20), d = w - right;
      return Q(`做加法时，小马虎把一个加数 ${right} 看成了 ${w}。这样算出的和比正确的和多多少？`, d, () => rnd(1, d + 10), `把这个加数看大了 ${w} − ${right} = ${d}，所以算出的和也多 ${d}。`, "错中求解");
    } },
    { id: "correspond", name: "对应解题", desc: "消去法求单价", gen: function () {
      const p = rnd(2, 9), q = rnd(2, 9), n1 = rnd(3, 5);
      const A = n1 * p + 2 * q, B = (n1 + 1) * p + 2 * q;
      return Q(`买 ${n1} 本本子和 2 支笔共花 ${A} 元；买 ${n1 + 1} 本本子和 2 支笔共花 ${B} 元。一本本子多少元？`, p, () => rnd(1, p + 6), `两次相差 1 本本子，钱数相差 ${B} − ${A} = ${B - A} 元，所以一本本子 ${p} 元。`, "消去法");
    } },
    { id: "grouping", name: "合理分组", desc: "平均分成几组", gen: function () {
      const per = rnd(2, 6), groups = rnd(2, 6), total = per * groups;
      if (Math.random() < 0.5) return Q(`把 ${total} 个苹果平均分成 ${groups} 组，每组有多少个？`, per, () => rnd(1, total), `每组 = ${total} ÷ ${groups} = ${per} 个。`, "平均分");
      return Q(`有 ${total} 个苹果，每 ${per} 个放一盘，可以放几盘？`, groups, () => rnd(1, total), `盘数 = ${total} ÷ ${per} = ${groups} 盘。`, "平均分");
    } },
    { id: "arrange", name: "合理安排", desc: "能同时做的事并行", gen: function () {
      const w = rnd(6, 12), a = rnd(2, 5), b = rnd(2, 5), other = a + b, ans = Math.max(w, other);
      return Q(`妈妈要烧一壶水（需要 ${w} 分钟）。烧水的时候，她可以洗茶杯（${a} 分钟）和整理桌子（${b} 分钟）。做完这些事最少要用多少分钟？`, ans, () => rnd(3, w + other), `烧水的同时顺便做其它事，共需洗茶杯和整理桌子 ${other} 分钟；总时间取两者中较大者：max(${w}, ${other}) = ${ans} 分钟。`, "合理安排");
    } },
    { id: "optimize", name: "最优问题", desc: "烙饼的最少时间", gen: function () {
      const n = rnd(3, 7), per = 2, each = rnd(2, 5), times = Math.ceil(n * 2 / per), ans = times * each;
      return Q(`一口锅一次最多烙 ${per} 张饼，每张饼两面都要烙，每面需要 ${each} 分钟。烙 ${n} 张饼最少需要多少分钟？`, ans, () => rnd(each, ans + each * 4), `每张饼 2 面，共 ${n} × 2 = ${n * 2} 面；锅一次烙 ${per} 面，至少要 ${times} 次，用时 ${times} × ${each} = ${ans} 分钟。`, "最优问题");
    } },
    { id: "clock", name: "时钟问题", desc: "钟面上的时间与角度", gen: function () {
      if (Math.random() < 0.5) { const k = rnd(1, 5); return Q(`钟面上，分针从数字 12 走到数字 ${k}，经过了多少分钟？`, k * 5, () => rnd(1, 60), `分针走 1 个大格是 5 分钟，走 ${k} 格 = ${k} × 5 = ${k * 5} 分钟。`, "时钟问题"); }
      const h = rnd(1, 6), deg = h * 30;
      return Q(`钟面上 ${h} 时整，时针和分针所成的角是多少度？`, deg, () => rnd(30, 180), `整时时针指向 ${h}、分针指向 12，相差 ${h} 个大格，每格 30°，${h} × 30 = ${deg}°。`, "时钟问题");
    } },
    { id: "money", name: "付钱的方法", desc: "人民币的加减", gen: function () {
      const pay = pick([5, 10]), yuan = rnd(1, pay - 1), jiao = pick([5, 5, 0]), price = yuan * 10 + jiao, ans = (pay * 10 - price) / 10;
      return Q(`买一件商品需要 ${price / 10} 元，付了 ${pay} 元，应找回多少元？`, ans, () => Math.round(rnd(1, pay * 10 - 1)) / 10, `找回 = ${pay} − ${price / 10} = ${ans} 元。`, "人民币");
    } },
    { id: "read_clock", name: "时间计算", desc: "经过的时间", gen: function () {
      const h = rnd(6, 10), m = pick([0, 10, 20, 30]), add = pick([30, 45, 60, 90]);
      const t0 = h * 60 + m, t1 = t0 + add, h1 = Math.floor(t1 / 60) % 12, m1 = t1 % 60;
      return Q(`${h} 时 ${m === 0 ? "整" : m + " 分"}开始做作业，${add} 分钟后是几时几分？（填「几时几分」）`, `${h1}时${m1}分`, () => `${h1}时${(m1 + 30) % 60}分`, `${add} 分钟后是 ${h1} 时 ${m1} 分。`, "时间的计算");
    } },
    /* ---------- 数学思想方法 ---------- */
    { id: "restore", name: "还原与倒推", desc: "从结果一步步倒推", gen: function () {
      const x = rnd(2, 9), add = rnd(1, 8), mul = rnd(2, 4), res = (x + add) * mul;
      return Q(`一个数先加上 ${add}，再乘 ${mul}，结果是 ${res}。这个数原来是多少？`, x, () => rnd(1, res), `倒推：先除以 ${mul} 得 ${res / mul}，再减去 ${add} 得 ${x}。`, "还原倒推");
    } },
    { id: "logic_simple", name: "简单的推理", desc: "把条件串成一条链", gen: function () {
      const t = shuffle(["小明", "小红", "小刚"]), hi = t[0], mid = t[1], lo = t[2];
      if (Math.random() < 0.5) return Q(`${hi} 比 ${mid} 高，${mid} 比 ${lo} 高。谁最高？`, hi, () => pick([mid, lo]), `把两句话串起来：${hi} > ${mid} > ${lo}，所以 ${hi} 最高。`, "逻辑推理");
      return Q(`${hi} 比 ${mid} 高，${mid} 比 ${lo} 高。谁最矮？`, lo, () => pick([hi, mid]), `把两句话串起来：${hi} > ${mid} > ${lo}，所以 ${lo} 最矮。`, "逻辑推理");
    } },
    { id: "invariant", name: "变与不变", desc: "一增一减和不变", gen: function () {
      const s = rnd(10, 30), d = rnd(2, 8);
      return Q(`两个数的和是 ${s}。其中一个数增加 ${d}，另一个数减少 ${d}，现在的和是多少？`, s, () => rnd(s - 6, s + 8), `一个加 ${d}、一个减 ${d}，正好抵消，和不变，还是 ${s}。`, "不变量");
    } },
    { id: "trick1", name: "趣味问题", desc: "绕个弯的趣味题", gen: function () {
      const type = rnd(0, 2);
      if (type === 0) return Q(`树上有 10 只小鸟，猎人打下 1 只。树上还剩几只小鸟？`, 0, () => pick([9, 10, 1]), `枪声一响，其余的小鸟全被吓飞了，树上还剩 0 只。`, "趣味问题");
      if (type === 1) return Q(`家里有 5 支点燃的蜡烛，吹灭了 2 支。第二天早上还剩几支蜡烛？`, 2, () => pick([3, 5, 0]), `点燃的蜡烛会烧完，只有被吹灭的 2 支留了下来。`, "趣味问题");
      return Q(`1 个人唱 1 首歌要 3 分钟，10 个人一起唱同一首歌要几分钟？`, 3, () => rnd(3, 30), `大家一起唱同一首歌，时间不变，还是 3 分钟。`, "趣味问题");
    } },
    { id: "trick3", name: "数学趣题", desc: "巧解趣味题", gen: function () {
      const type = rnd(0, 2);
      if (type === 0) return Q(`一杯果汁，先喝掉一半，再喝掉剩下的一半，还剩原来这杯的几分之几？`, "1/4", () => pick(["1/2", "1/3", "3/4"]), `第一次剩 1/2，第二次又喝掉一半，剩 1/2 × 1/2 = 1/4。`, "分数趣题");
      if (type === 1) return Q(`现在是下午 3 点，再过 12 小时是几点？（填「几 点」）`, "3 点", () => pick(["15 点", "6 点", "12 点"]), `12 小时正好是钟面转一圈，又回到 3 点。`, "钟表趣题");
      return Q(`把一根 9 米长的绳子对折一次后剪开，每段长多少米？`, 4.5, () => pick([3, 6, 9]), `对折后剪开，得到 2 段等长的绳子，每段 9 ÷ 2 = 4.5 米。`, "剪绳趣题");
    } },
    { id: "pigeon_simple", name: "趣摸彩球", desc: "最不利情况 + 1", gen: function () {
      const k = rnd(2, 4), ans = k + 1, items = ["红", "黄", "蓝", "绿"].slice(0, k).join("、");
      return Q(`盒子里有 ${k} 种颜色的球（${items}）各若干个，颜色看不见。一次至少要摸出几个球，才能保证有 2 个同色？`, ans, () => rnd(2, ans + 3), `最不利是先摸到 ${k} 种颜色各 1 个（共 ${k} 个），再摸 1 个必有同色，所以至少 ${ans} 个。`, "抽屉原理");
    } },
    { id: "sumproduct", name: "和倍问题", desc: "和 ÷ (倍数 + 1)", gen: function () {
      const sm = rnd(2, 9), m = rnd(2, 5), big = sm * m, sum = big + sm, askBig = Math.random() < 0.5;
      return Q(`甲、乙两数的和是 ${sum}，甲是乙的 ${m} 倍。${askBig ? "甲" : "乙"}是多少？`, askBig ? big : sm, () => rnd(1, sum), `乙 = 和 ÷ (倍数 + 1) = ${sum} ÷ ${m + 1} = ${sm}；甲 = ${sm} × ${m} = ${big}。`, "和倍问题");
    } },
    { id: "diffproduct", name: "差倍问题", desc: "差 ÷ (倍数 − 1)", gen: function () {
      const sm = rnd(2, 9), m = rnd(2, 5), big = sm * m, diff = big - sm, askBig = Math.random() < 0.5;
      return Q(`甲、乙两数的差是 ${diff}，甲是乙的 ${m} 倍。${askBig ? "甲" : "乙"}是多少？`, askBig ? big : sm, () => rnd(1, big + 5), `乙 = 差 ÷ (倍数 − 1) = ${diff} ÷ ${m - 1} = ${sm}；甲 = ${sm} × ${m} = ${big}。`, "差倍问题");
    } },
    { id: "assume", name: "假设解题", desc: "假设法求两种量", gen: function () {
      const five = rnd(2, 8), ten = rnd(2, 6), tot = five + ten, money = five * 5 + ten * 10, askFive = Math.random() < 0.5;
      const exp = `假设全是 10 元：${tot} × 10 = ${tot * 10} 元，比实际多 ${tot * 10 - money} 元；每把 1 张 10 元换成 5 元就少 5 元，所以 5 元有 ${five} 张，10 元有 ${ten} 张。`;
      return Q(`有 5 元和 10 元的纸币共 ${tot} 张，一共 ${money} 元。${askFive ? "5 元" : "10 元"}纸币有多少张？`, askFive ? five : ten, () => rnd(1, tot), exp, "假设法");
    } },
    { id: "var_pattern", name: "变化规律", desc: "平方数等变化规律", gen: function () {
      if (Math.random() < 0.5) { const n = rnd(4, 8), seq = []; for (let i = 1; i <= 4; i++) seq.push(i * i); return Q(`观察规律：${seq.join("、")}、…… 第 ${n} 个数是多少？`, n * n, () => rnd(1, n * n + 10), `每个数都是它序号的平方，第 ${n} 个 = ${n} × ${n} = ${n * n}。`, "变化规律"); }
      const s = rnd(1, 4), seq = [s];
      for (let i = 1; i < 4; i++) seq.push(seq[i - 1] * 2 + 1);
      const ans = seq[3] * 2 + 1;
      return Q(`观察规律：${seq.join("、")}、…… 下一个数是多少？`, ans, () => rnd(ans - 6, ans + 6), `规律是「乘 2 加 1」：${seq[3]} × 2 + 1 = ${ans}。`, "变化规律");
    } },
    { id: "number_array", name: "数阵", desc: "每行和相等求缺数", gen: function () {
      const t = rnd(9, 15), a = rnd(1, t - 2), b = rnd(1, t - 1 - a), c = t - a - b;
      return Q(`在数阵中，每行三个数相加都等于 ${t}。某一行已经填了 ${a} 和 ${b}，第三个数是多少？`, c, () => rnd(1, t), `第三个数 = ${t} − ${a} − ${b} = ${c}。`, "数阵");
    } },
    { id: "multiple_problem", name: "倍数问题", desc: "几倍多几的逆求", gen: function () {
      const m = rnd(2, 5), x = rnd(3, 12), k = rnd(1, 6), y = m * x + k;
      return Q(`一个数的 ${m} 倍再加上 ${k} 等于 ${y}。这个数是多少？`, x, () => rnd(1, y), `先减去多的：${y} − ${k} = ${m * x}，再除以 ${m}：${m * x} ÷ ${m} = ${x}。`, "倍数问题");
    } },
    { id: "prime_factor", name: "分解质因数", desc: "质因数中最大的质数", gen: function () {
      const base = pick([[60, [2, 3, 5]], [84, [2, 3, 7]], [90, [2, 3, 5]], [126, [2, 3, 7]], [105, [3, 5, 7]], [132, [2, 3, 11]], [70, [2, 5, 7]], [78, [2, 3, 13]]]);
      const n = base[0], ps = base[1], mx = Math.max.apply(null, ps);
      return Q(`把 ${n} 分解质因数，其中最大的质因数是几？`, mx, () => pick(ps.filter(p => p !== mx)), `${n} = ${ps.join(" × ")}，最大的质因数是 ${mx}。`, "分解质因数");
    } },
    { id: "gcd", name: "最大公约数", desc: "求两数的最大公因数", gen: function () {
      function g(a, b) { while (b) { const t = a % b; a = b; b = t; } return a; }
      const k = rnd(3, 12); let x = rnd(2, 5), y = rnd(2, 5);
      while (y === x) y = rnd(2, 5);
      const a = k * x, b = k * y, ans = g(a, b);
      return Q(`${a} 和 ${b} 的最大公因数是多少？`, ans, () => rnd(1, ans + 8), `${a} = ${ans} × ${a / ans}，${b} = ${ans} × ${b / ans}，它们的最大公因数是 ${ans}。`, "最大公因数");
    } },
    { id: "lcm", name: "最小公倍数", desc: "求两数的最小公倍数", gen: function () {
      function g(a, b) { while (b) { const t = a % b; a = b; b = t; } return a; }
      let a = pick([4, 6, 8, 9, 10, 12]), b = pick([6, 8, 9, 10, 14, 15]);
      while (b === a) b = b + 2;
      const ans = a * b / g(a, b);
      return Q(`${a} 和 ${b} 的最小公倍数是多少？`, ans, () => rnd(a, ans + a * 3), `${a} × ${b} ÷ 最大公因数 = ${a} × ${b} ÷ ${g(a, b)} = ${ans}。`, "最小公倍数");
    } },
    { id: "substitution", name: "置换问题", desc: "等量关系的连乘置换", gen: function () {
      const a = rnd(2, 4), b = rnd(2, 4), c = rnd(2, 4), ans = a * b * c;
      return Q(`已知 1 个大瓶可以换 ${a} 个中瓶，1 个中瓶可以换 ${b} 个小瓶，1 个小瓶可以换 ${c} 个瓶盖。1 个大瓶可以换多少个瓶盖？`, ans, () => rnd(2, ans + 6), `逐级相乘：${a} × ${b} × ${c} = ${ans} 个瓶盖。`, "置换问题");
    } },
    { id: "trip5", name: "行程问题", desc: "追及与环形相遇", gen: function () {
      if (Math.random() < 0.5) { const v1 = rnd(5, 9), v2 = rnd(2, 4), t = rnd(4, 12), s = (v1 - v2) * t; return Q(`甲每分钟走 ${v1} 米，乙每分钟走 ${v2} 米。乙在甲前面 ${s} 米，甲去追乙，几分钟后追上？`, t, () => rnd(1, t + 8), `追及时间 = 路程差 ÷ 速度差 = ${s} ÷ (${v1} − ${v2}) = ${t} 分钟。`, "追及问题"); }
      const sum = rnd(4, 10), t = rnd(3, 10), L = sum * t, v1 = rnd(1, sum - 1), v2 = sum - v1;
      return Q(`环形跑道一圈 ${L} 米，甲每分钟 ${v1} 米、乙每分钟 ${v2} 米，两人从同一点反向出发，几分钟后第一次相遇？`, t, () => rnd(1, t + 8), `反向相遇时间 = 一圈 ÷ 速度和 = ${L} ÷ (${v1} + ${v2}) = ${t} 分钟。`, "环形行程");
    } },
    { id: "train_trip", name: "火车行程", desc: "两车错车的时间", gen: function () {
      const t = rnd(4, 10), v1 = rnd(10, 20), v2 = rnd(10, 20), sum = v1 + v2, L = sum * t;
      const l1 = Math.round(L * 0.45 / 10) * 10, l2 = L - l1;
      return Q(`甲火车长 ${l1} 米、每秒行 ${v1} 米，乙火车长 ${l2} 米、每秒行 ${v2} 米。两车相向而行，从车头相遇到车尾相离需要多少秒？`, t, () => rnd(2, t + 8), `错车路程 = 两车长之和 = ${l1} + ${l2} = ${L} 米；速度和 = ${v1} + ${v2} = ${sum} 米/秒；时间 = ${L} ÷ ${sum} = ${t} 秒。`, "火车行程");
    } },
    { id: "extreme5", name: "最大最小问题", desc: "数位组合的最值", gen: function () {
      const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort(function (a, b) { return a - b; });
      const biggest = Number(ds.slice().reverse().join("")), smallest = Number(ds.join(""));
      if (Math.random() < 0.5) return Q(`用 ${ds.join("、")} 这三个数字（每个用一次）组成的三位数中，最大的是多少？`, biggest, () => pick([smallest, biggest - 90]), `把数字从大到小排：${ds.slice().reverse().join("")}，最大的是 ${biggest}。`, "最大最小");
      return Q(`用 ${ds.join("、")} 这三个数字（每个用一次）组成的三位数中，最小的是多少？`, smallest, () => pick([biggest, smallest + 90]), `把数字从小到大排：${ds.join("")}，最小的是 ${smallest}。`, "最大最小");
    } },
    { id: "set_number", name: "设数法解题", desc: "设具体数使问题变简单", gen: function () {
      const p = rnd(1, 4) * 10, final = 100 - p * p / 100, arr = shuffle(["比原价低", "比原价高", "和原价一样", "无法确定"]);
      return { q: `一件商品先涨价 ${p}%，然后又降价 ${p}%，最后的价格与原价相比是怎样的？`, options: arr, ans: arr.indexOf("比原价低"), explain: `设原价为 100：涨价后是 100 × (1 + ${p}%) = ${100 + p}，再降价 ${p}% 后是 ${100 + p} × (1 − ${p}%) = ${final} < 100，所以比原价低。`, point: "设数法", level: "奥数", fig: null };
    } },
    { id: "unit1", name: "转化单位1", desc: "把整体看作“1”", gen: function () {
      const den = pick([3, 4, 5, 6, 8]), num = rnd(1, den - 1), k = rnd(3, 10), whole = den * k, part = num * k;
      if (Math.random() < 0.5) return Q(`甲数是 ${whole}，乙数是甲数的 ${num}/${den}。乙数是多少？`, part, () => rnd(1, whole), `乙数 = 甲数 × ${num}/${den} = ${whole} × ${num}/${den} = ${part}。`, "转化单位1");
      return Q(`甲数是 ${whole}，乙数是甲数的 ${num}/${den}。甲、乙两数的和是多少？`, whole + part, () => rnd(1, whole * 2), `乙数 = ${whole} × ${num}/${den} = ${part}；和 = ${whole} + ${part} = ${whole + part}。`, "转化单位1");
    } },
    { id: "algebra", name: "代数法解题", desc: "设 x 列方程", gen: function () {
      const x = rnd(10, 40), d = rnd(2, 15), y = x - d, sum = x + y;
      return Q(`甲、乙两数的和是 ${sum}，甲比乙多 ${d}。设乙为 x，则甲是 x + ${d}，列方程 x + (x + ${d}) = ${sum}。乙是多少？`, y, () => rnd(1, sum), `2x + ${d} = ${sum}，2x = ${sum - d} = ${2 * y}，x = ${y}，即乙是 ${y}。`, "代数法");
    } },
    /* ---------- 计数原理与对策 ---------- */
    { id: "count_principle", name: "加法乘法原理", desc: "分类用加法、分步用乘法", gen: function () {
      if (Math.random() < 0.5) { const a = rnd(2, 5), b = rnd(2, 5), ans = a + b; return Q(`从甲地到乙地，可以坐火车（${a} 班）或坐飞机（${b} 班）。一共有几种不同的走法？`, ans, () => rnd(2, a * b + 3), `坐火车和坐飞机是两类，用加法：${a} + ${b} = ${ans} 种。`, "加法原理"); }
      const a = rnd(2, 5), b = rnd(2, 5), ans = a * b;
      return Q(`从甲地到丙地要经过乙地。甲到乙有 ${a} 条路，乙到丙有 ${b} 条路。从甲地经乙地到丙地共有几种走法？`, ans, () => rnd(2, ans + 4), `分两步，用乘法：${a} × ${b} = ${ans} 种。`, "乘法原理");
    } },
    { id: "strategy", name: "对策趣味题", desc: "拿取游戏的最优策略", gen: function () {
      const maxTake = rnd(2, 4), total = (maxTake + 1) * rnd(2, 5) + rnd(1, maxTake), ans = total % (maxTake + 1);
      return Q(`有 ${total} 根小棒，两人轮流拿，每次至少拿 1 根、最多拿 ${maxTake} 根，拿到最后一根的人获胜。先拿的人第一次应拿几根才能保证获胜？`, ans, () => rnd(1, maxTake), `每轮两人一共能控制拿 ${maxTake + 1} 根。${total} ÷ ${maxTake + 1} 余 ${ans}，先拿 ${ans} 根，之后每轮凑成 ${maxTake + 1} 根，就能保证拿到最后一根。`, "对策问题");
    } },
    { id: "diophantine", name: "解不定方程", desc: "找出方程的正整数解", gen: function () {
      const a = pick([2, 3, 4, 5]), b = pick([3, 5, 7]), x0 = rnd(1, 5), y0 = rnd(1, 5), c = a * x0 + b * y0;
      const correct = `x=${x0}，y=${y0}`, set = [correct];
      let g = 0;
      while (set.length < 4 && g++ < 200) { const x = rnd(1, 6), y = rnd(1, 6); if (a * x + b * y !== c) { const s = `x=${x}，y=${y}`; if (set.indexOf(s) < 0) set.push(s); } }
      const arr = shuffle(set);
      return { q: `下列哪一组数是方程 ${a}x + ${b}y = ${c} 的正整数解？`, options: arr, ans: arr.indexOf(correct), explain: `把 x=${x0}、y=${y0} 代入：${a} × ${x0} + ${b} × ${y0} = ${a * x0} + ${b * y0} = ${c}，等式成立。`, point: "不定方程", level: "奥数", fig: null };
    } }
  ];

  const TOPICS = { "一年级": G1, "二年级": G2, "三年级": G3, "四年级": G4, "五年级": G5, "六年级": G6 };

  /* ---------- 题型引擎总表：引擎 id → { name, desc, gen } ---------- */
  const ENG = {};
  [G1, G2, G3, G4, G5, G6, EXTRA].forEach(function (arr) { arr.forEach(function (t) { ENG[t.id] = t; }); });

  /* ---------- 教材专题 → 引擎 映射（周次 → 引擎 id） ----------
   * "__mixed__" 表示不指定引擎，按全年级混合出题（如“综合练习/杂题”）。
   * 全部 240 个专题均有对应引擎，故不存在“生成器待补”的周次。 */
  const MAP = {
    "一年级": { 1: "count_objects", 2: "compare", 3: "ordinal", 4: "same_diff", 5: "observe_find", 6: "count_lines", 7: "path_count", 8: "observe_think", 9: "simple_app1", 10: "count_cubes", 11: "pattern_draw", 12: "restore", 13: "cut_pieces", 14: "tangram", 15: "count_shape", 16: "fill_number", 17: "age2", 18: "pattern", 19: "logic_simple", 20: "matchstick", 21: "invariant", 22: "queue", 23: "equalize", 24: "odd_even", 25: "trick1", 26: "logic_simple", 27: "riddle_expr", 28: "quick_calc", 29: "matchstick", 30: "restore", 31: "trick1", 32: "fill_op", 33: "pigeon_simple", 34: "money", 35: "grouping", 36: "balance", 37: "quick_calc", 38: "trick1", 39: "path_count", 40: "chicken3" },
    "二年级": { 1: "observe_find", 2: "same_diff", 3: "pattern", 4: "equalize", 5: "euler", 6: "trick2", 7: "count_shape", 8: "cut_rope", 9: "stair", 10: "trick2", 11: "compare", 12: "matchstick", 13: "equalize", 14: "number_game", 15: "graph_eq", 16: "fill_vertical", 17: "remainder_simple", 18: "stair", 19: "simple_app2", 20: "logic_simple", 21: "simple_app2", 22: "fill_vertical", 23: "logic_simple", 24: "remainder_simple", 25: "age2", 26: "quick_calc", 27: "quick_calc", 28: "stair", 29: "pattern_draw", 30: "fill_number", 31: "logic_simple", 32: "decompose", 33: "queue", 34: "simple_app2", 35: "arrange", 36: "clock", 37: "clock", 38: "read_write_num", 39: "number_game", 40: "__mixed__" },
    "三年级": { 1: "count_shape", 2: "pattern2", 3: "quick_calc", 4: "fill_op", 5: "riddle_expr", 6: "riddle_word", 7: "fill_number", 8: "remainder_simple", 9: "cycle3", 10: "trick3", 11: "matchstick", 12: "quick_mul", 13: "quick_calc", 14: "simple_app3", 15: "simple_app3", 16: "plant3", 17: "number_fun", 18: "inclusion4", 19: "enumerate", 20: "graph_eq", 21: "error_solve", 22: "correspond", 23: "profit4", 24: "logic4", 25: "sumproduct", 26: "diffproduct", 27: "diffproduct", 28: "sumdiff3", 29: "age4", 30: "restore", 31: "assume", 32: "average3", 33: "average3", 34: "logic4", 35: "perimeter", 36: "perimeter", 37: "area", 38: "arrange", 39: "pigeon5", 40: "__mixed__" },
    "四年级": { 1: "pattern2", 2: "var_pattern", 3: "logic4", 4: "simple_app3", 5: "riddle_expr", 6: "riddle_expr", 7: "optimize", 8: "ap4", 9: "var_pattern", 10: "var_pattern", 11: "error_solve", 12: "enumerate", 13: "sumproduct", 14: "plant3", 15: "area", 16: "ap4", 17: "count_shape", 18: "count_rect", 19: "simple_app3", 20: "quick4", 21: "quick_calc", 22: "average3", 23: "newop5", 24: "diffproduct", 25: "sumdiff3", 26: "age4", 27: "sumdiff2", 28: "cycle3", 29: "trip4", 30: "assume", 31: "restore", 32: "logic4", 33: "quick_calc", 34: "trip4", 35: "area_cover", 36: "binary", 37: "simple_app3", 38: "simple_app3", 39: "profit4", 40: "__mixed__" },
    "五年级": { 1: "average3", 2: "ap4", 3: "perimeter", 4: "area", 5: "count_shape", 6: "last_digit", 7: "simple_app4", 8: "simple_app4", 9: "simple_app4", 10: "number_array", 11: "cycle3", 12: "profit4", 13: "solid6", 14: "solid6", 15: "solid6", 16: "multiple_problem", 17: "multiple_problem", 18: "area", 19: "area_cover", 20: "number_fun", 21: "assume", 22: "graph_eq", 23: "prime_factor", 24: "prime_factor", 25: "gcd", 26: "lcm", 27: "lcm", 28: "trip4", 29: "trip4", 30: "trip5", 31: "trip5", 32: "riddle_expr", 33: "inclusion4", 34: "substitution", 35: "estimate", 36: "train_trip", 37: "enumerate", 38: "extreme5", 39: "logic4", 40: "__mixed__" },
    "六年级": { 1: "newop5", 2: "quick_calc6", 3: "quick_calc6", 4: "quick_calc6", 5: "quick_calc6", 6: "unit1", 7: "unit1", 8: "unit1", 9: "set_number", 10: "assume", 11: "assume", 12: "restore", 13: "algebra", 14: "ratio6", 15: "ratio6", 16: "engineer5", 17: "conc5", 18: "area", 19: "area", 20: "area", 21: "invariant", 22: "engineer5", 23: "engineer5", 24: "compare_num", 25: "extreme5", 26: "count_principle", 27: "solid6", 28: "solid6", 29: "pigeon5", 30: "pigeon5", 31: "logic4", 32: "logic4", 33: "trip6", 34: "trip6", 35: "trip6", 36: "boat5", 37: "strategy", 38: "remainder6", 39: "cow5", 40: "diophantine" }
  };
  const GRADES = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];

  /* 依据教材专题骨架（OLY_SYLLABUS）+ 引擎映射（MAP）构造某年级的专题列表
   * 返回项：{ week, id, name, page, engine, desc, hasGen } */
  function topicsOf(grade) {
    const syl = (window.OLY_SYLLABUS || {})[grade] || [];
    const map = MAP[grade] || {};
    return syl.map(function (it) {
      const eid = map[it.w] || null;
      const e = (eid && eid !== "__mixed__") ? ENG[eid] : null;
      return {
        week: it.w,
        id: "g" + keyOf(grade) + "w" + it.w,
        name: it.t,
        page: it.p,
        engine: eid,
        desc: e ? e.desc : (eid === "__mixed__" ? "本年级专题综合练习" : ""),
        hasGen: !!e
      };
    });
  }
  function topicById(grade, id) {
    const m = /^g\d+w(\d+)$/.exec(id || "");
    if (!m) return null;
    const w = parseInt(m[1], 10);
    return topicsOf(grade).find(function (t) { return t.week === w; }) || null;
  }
  function keyOf(grade) { const i = GRADES.indexOf(grade); return i >= 0 ? String(i + 1) : "1"; }
  function gradeByKey(k) { const i = parseInt(k, 10); return (i >= 1 && i <= GRADES.length) ? GRADES[i - 1] : ""; }
  function totalTopics() { let n = 0; GRADES.forEach(g => { n += topicsOf(g).length; }); return n; }

  /* 由题型引擎 + 所属教材专题生成一道题，挂上专题信息与指纹 */
  function genOne(engine, topic) {
    const it = engine.gen();
    it.topicId = topic.id; it.topicName = topic.name; it.week = topic.week;
    it.engine = engine.id;
    it.fp = topic.id + "#" + h32(it.q);
    return it;
  }

  /* 生成一组题（去重，保证每遍不重样）
   * grade: 年级；topicId: 指定专题（为空或综合练习则整年级混合）；n: 题数 */
  function makeItems(grade, topicId, n) {
    n = n || 8;
    const all = topicsOf(grade);
    const real = all.filter(function (t) { return t.engine && t.engine !== "__mixed__" && ENG[t.engine]; });
    let engines = null, fixedTopic = null;
    if (topicId) {
      const t = all.find(function (x) { return x.id === topicId; });
      if (t && t.engine && t.engine !== "__mixed__" && ENG[t.engine]) { engines = [ENG[t.engine]]; fixedTopic = t; }
    }
    if (!engines) {
      if (!real.length) return [];
      engines = [];
      real.forEach(function (t) { const e = ENG[t.engine]; if (engines.indexOf(e) < 0) engines.push(e); });
    }
    const pickTopicOf = function (e) {
      if (fixedTopic) return fixedTopic;
      const cand = real.filter(function (x) { return ENG[x.engine] === e; });
      return cand.length ? pick(cand) : real[0];
    };
    const out = [], seen = {};
    let guard = 0;
    while (out.length < n && guard < n * 60) {
      const e = pick(engines); guard++;
      const it = genOne(e, pickTopicOf(e));
      if (seen[it.fp]) continue;
      seen[it.fp] = 1; out.push(it);
    }
    let k = 0;
    while (out.length < n && k++ < n * 20) out.push(genOne(pick(engines), pickTopicOf(pick(engines))));
    return out;
  }

  /* 合成章：让奥数题也能在错题本里正常显示 / 被定位
   * id 形如 "oly:<年级号>:<专题id>"，专题 "__all__" 表示整年级综合练习 */
  function chapterById(id) {
    const m = /^oly:(\d+):(.+)$/.exec(id || "");
    if (!m) return null;
    const grade = gradeByKey(m[1]); if (!grade) return null;
    const t = (m[2] === "__all__") ? null : topicById(grade, m[2]);
    const name = t ? ("第" + t.week + "周 " + t.name) : "综合练习";
    return { id: id, stage: "奥数", grade: grade, title: grade + "·" + name, synthetic: true, isOly: true, week: t ? t.week : 0, engine: t ? t.engine : "" };
  }

  window.OLYMPIAD = TOPICS;
  window.Oly = {
    GRADES: GRADES, topicsOf: topicsOf, topicById: topicById, keyOf: keyOf, gradeByKey: gradeByKey,
    totalTopics: totalTopics, genOne: genOne, makeItems: makeItems, chapterById: chapterById, h32: h32,
    ENG: ENG, MAP: MAP,
    syllabusOf: function (grade) { return (window.OLY_SYLLABUS || {})[grade] || []; }
  };
})();
