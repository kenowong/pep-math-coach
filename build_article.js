/* 生成内嵌截图 + 底部个人二维码的更新说明（已去 AI 味） */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const SHOT = path.join(ROOT, "updateshots");

function b64(file) {
  return fs.readFileSync(path.join(SHOT, file)).toString("base64");
}
const qr = fs.readFileSync("E:/WorkBuddy/wechat-ops/assets/wechat_qrcode.jpg").toString("base64");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>pep-math-coach 更新说明 · 2026-10-15</title>
<style>
:root{--blue:#2f6fed;--blue-d:#1a3a5f;--bg:#f7f9fd;--card:#fff;--line:#e3e9f3;--txt:#1f2937;--mut:#5d6b7a}
*{box-sizing:border-box}
body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;background:var(--bg);color:var(--txt);line-height:1.78}
.wrap{max-width:780px;margin:0 auto;padding:32px 20px 60px}
header{border-bottom:1px solid var(--line);padding-bottom:20px;margin-bottom:24px;background:var(--card);padding:24px 28px;border-radius:14px;box-shadow:0 2px 10px rgba(31,41,55,.06)}
h1{margin:0 0 8px;font-size:26px;color:var(--blue-d);letter-spacing:-.3px}
.meta{margin:0;color:var(--mut);font-size:14px}
h2{font-size:20px;color:var(--blue-d);margin:32px 0 14px;border-left:4px solid var(--blue);padding-left:10px}
h3{font-size:17px;margin:22px 0 10px;color:var(--txt)}
p{margin:10px 0}
ul,ol{margin:8px 0;padding-left:22px}
li{margin:6px 0}
.figure{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;margin:18px 0;box-shadow:0 2px 10px rgba(31,41,55,.05)}
.figure img{width:100%;height:auto;border-radius:8px;display:block}
.caption{font-size:13px;color:var(--mut);text-align:center;margin-top:10px}
.note{background:#eef8ff;border-left:4px solid var(--blue);padding:12px 16px;border-radius:0 10px 10px 0;margin:14px 0;font-size:14px}
.summary{background:var(--card);padding:18px 22px;border-radius:12px;border:1px solid var(--line);margin-top:30px}
footer{margin-top:36px;font-size:13px;color:var(--mut);text-align:center}
a{color:var(--blue)}
.qr-cta{text-align:center;margin:40px 0 10px}
.qr-cta h2{border:none;padding:0;text-align:center;margin-bottom:8px}
.qr-cta img{width:200px;height:200px;display:block;margin:0 auto 10px}
.qr-cta p{color:var(--mut);font-size:14px}
</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>pep-math-coach 更新说明</h1>
  <p class="meta">人教版数学 · 章节同步教练 · 2026-10-15</p>
</header>

<p>这一版主要补了四块：奥数题库、错题打印闭环、手机端适配，还有离线单文件版。每处改动下面都配了实际界面截图。</p>

<h2>一、奥数题库：对齐教材目录，240 个专题原创生成</h2>
<p>奥数模块（#/oly）按《小学奥数举一反三》的目录结构组织：</p>
<ul>
  <li>一年级 B 版、二至六年级 A 版，每册 40 周，共 6 × 40 = 240 个专题。</li>
  <li>只取教材的专题目录（周次 + 专题名），不抄原题。</li>
  <li>题目全部由参数化引擎现场生成，每遍不一样；答错的自动进错题本，照样能打印、扫码、进间隔复习。</li>
</ul>

<div class="figure">
  <img src="data:image/png;base64,${b64("oly_desktop.png")}" alt="奥数题库桌面端" />
  <p class="caption">图 1：奥数题库桌面端，按年级与周次展示 240 个专题</p>
</div>

<h2>二、错题卷打印 + 扫码复核闭环</h2>
<p>错题本现在能直接打印错题卷，走通了纸质闭环：</p>
<ol>
  <li>点"打印错题卷"，出一份只印题不印答案的卷子，带上二维码。</li>
  <li>打印的同时把当前未清零的错题库清空，防止重复打。</li>
  <li>孩子做完，家长扫卷尾二维码进 #/scan 核对页，勾掉"又做错"的题，这些题自动回库。</li>
</ol>
<div class="note">
  二维码用紧凑 JSON → LZW 压缩 → base64url → 贪心分批，单码上限约 2953 字节；50 道中等题实测分 2 批。
</div>

<h2>三、返回顶部与手机端响应式优化</h2>
<p>手机上主要改了两处：</p>
<ul>
  <li>右下角加了个"返回顶部"悬浮按钮，滚过 320px 才淡出；扫码页会自动隐藏，免得挡住底部操作栏。</li>
  <li>顶栏导航在 640px 以下改成单行横滑，7 个链接不再折行把顶栏撑高；边距、卡片网格和安全区也一起收了一档。</li>
</ul>

<div class="figure">
  <img src="data:image/png;base64,${b64("mobile_oly.png")}" alt="奥数题库手机端" />
  <p class="caption">图 2：手机端奥数题库，导航横滑、专题卡片两列、安全区适配</p>
</div>

<h2>四、章节主线与学习方法库</h2>
<p>章节主页还是小学 / 初中 / 高中切换、153 章骨架；学习方法页接了 math-mastery 那 127 个解题技巧，按学段分类，练习页里能一键跳到对应演示。</p>

<div class="figure">
  <img src="data:image/png;base64,${b64("home_desktop.png")}" alt="章节主线桌面端" />
  <p class="caption">图 3：章节主线桌面端，学段切换 + 年级卡片网格</p>
</div>

<div class="figure">
  <img src="data:image/png;base64,${b64("methods_desktop.png")}" alt="学习方法桌面端" />
  <p class="caption">图 4：学习方法库，按学段聚合 127 个解题技巧</p>
</div>

<h2>五、单文件离线版与开源发布</h2>
<p>手机直接用文件管理器打开 index.html 会丢样式——相对路径的 css/js 加载不出来。我加了 build_standalone.js，把样式和 17 个 JS 全内联，生成 pep-math-coach-standalone.html（约 977KB）。把这个文件拷到手机，点开就能用。</p>

<div class="figure">
  <img src="data:image/png;base64,${b64("mobile_home.png")}" alt="章节主页手机端" />
  <p class="caption">图 5：手机端章节主页，顶部导航单行横滑、卡片两列显示</p>
</div>

<p>代码已推到 GitHub 和 Gitee：</p>
<ul>
  <li>GitHub：<a href="https://github.com/kenowong/pep-math-coach">https://github.com/kenowong/pep-math-coach</a></li>
  <li>Gitee：<a href="https://gitee.com/kenowong/pep-math-coach">https://gitee.com/kenowong/pep-math-coach</a></li>
</ul>

<div class="summary">
  <h3>总结</h3>
  <p>这一版把原来"只能做章节练习"的工具，扩成了覆盖章节主线、奥数专题、学法技巧、错题纸质闭环的一个完整学习应用，手机端和离线分发也补齐了。下一步是补章节动图、每法配图，再把题库铺开。</p>
</div>

<div class="qr-cta">
  <h2>想一起折腾这个工具？</h2>
  <img src="data:image/jpeg;base64,${qr}" alt="keno王 个人微信二维码" />
  <p>扫码加我微信，拉你进交流群，更新第一时间知会。</p>
</div>

<footer>© 2026 keno王 · MIT 协议开源</footer>
</div>
</body>
</html>`;

const OUT = path.join(ROOT, "update_article_2026-10-15.html");
fs.writeFileSync(OUT, html, "utf8");
console.log("OK ->", OUT, fs.statSync(OUT).size, "bytes");
