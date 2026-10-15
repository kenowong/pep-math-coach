/* 生成内嵌截图的 HTML 更新说明 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const SHOT = path.join(ROOT, "updateshots");

function base64(file) {
  return fs.readFileSync(path.join(SHOT, file), "base64");
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>pep-math-coach 更新说明 · 2026-10-15</title>
<style>
:root{--blue:#2f6fed;--blue-d:#1a3a5f;--bg:#f7f9fd;--card:#fff;--line:#e3e9f3;--txt:#1f2937;--mut:#5d6b7a}
*{box-sizing:border-box}
body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;background:var(--bg);color:var(--txt);line-height:1.75}
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
.badge{display:inline-block;font-size:12px;padding:2px 8px;border-radius:20px;background:#eef3fc;color:var(--blue);margin-right:6px}
.note{background:#eef8ff;border-left:4px solid var(--blue);padding:12px 16px;border-radius:0 10px 10px 0;margin:14px 0;font-size:14px}
.summary{background:var(--card);padding:18px 22px;border-radius:12px;border:1px solid var(--line);margin-top:30px}
footer{margin-top:36px;font-size:13px;color:var(--mut);text-align:center}
a{color:var(--blue)}
</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>pep-math-coach 更新说明</h1>
  <p class="meta">人教版数学 · 章节同步教练 · 2026-10-15</p>
</header>

<p>本次更新围绕“章节主线 + 学法 + 解题技巧”的核心定位，重点补齐了<strong>奥数题库体系</strong>、<strong>错题纸质化闭环</strong>、<strong>移动端可用性</strong>和<strong>离线分发能力</strong>。以下为具体改动与对应界面。</p>

<h2>一、奥数题库：对齐教材目录，240 个专题原创生成</h2>
<p>新增 <strong>#/oly 奥数题库</strong>，专题分类与编号对齐《小学奥数举一反三》目录：</p>
<ul>
  <li>一年级 B 版、二至六年级 A 版，每册 40 周，共 <strong>6 × 40 = 240 个专题</strong>。</li>
  <li>仅收录教材的<strong>专题目录级信息</strong>（周次 + 专题名），不复制原书任何题目。</li>
  <li>所有题目由参数化引擎现场生成，每遍练习题目不同；答错题自动进入错题本，复用打印、扫码、间隔复习闭环。</li>
</ul>

<div class="figure">
  <img src="data:image/png;base64,${base64("oly_desktop.png")}" alt="奥数题库桌面端" />
  <p class="caption">图 1：奥数题库桌面端，按年级与周次展示 240 个专题</p>
</div>

<h2>二、错题卷打印 + 扫码复核闭环</h2>
<p>错题本新增<strong>打印错题卷</strong>功能，形成完整纸质化闭环：</p>
<ol>
  <li>点击“打印错题卷”，系统生成仅含题目、不含答案的纸质卷，并附带二维码。</li>
  <li>打印同时自动清空当前未清零错题库，避免重复打印。</li>
  <li>孩子做完后，家长扫描二维码进入 #/scan 核对页，勾选“又做错”的题目，被勾选的题自动重新入库。</li>
</ol>
<div class="note">
  二维码采用紧凑 JSON → LZW 压缩 → base64url → 贪心分批策略，单码容量约 2953 字节；50 道中等错题实测可分 2 批生成。
</div>

<h2>三、返回顶部与手机端响应式优化</h2>
<p>为提升手机体验，做了两项核心调整：</p>
<ul>
  <li><strong>固定返回顶部按钮</strong>：右下角悬浮，滚动超过 320px 时淡入；扫码复核页自动隐藏，避免与底部操作栏冲突。</li>
  <li><strong>导航栏横滑</strong>：在 640px 以下屏幕，顶部导航改为单行横向滚动，避免 7 个链接折行撑高顶栏；同步收紧了边距、卡片网格与安全区适配。</li>
</ul>

<div class="figure">
  <img src="data:image/png;base64,${base64("mobile_oly.png")}" alt="奥数题库手机端" />
  <p class="caption">图 2：手机端奥数题库，导航横滑、专题卡片两列、安全区适配</p>
</div>

<h2>四、章节主线与学习方法库</h2>
<p>章节主页保持小学 / 初中 / 高中学段切换，153 章骨架清晰展示；学习方法页接入此前 math-mastery 的全部 127 个解题技巧，按学段分类，可在练习页一键关联到对应演示。</p>

<div class="figure">
  <img src="data:image/png;base64,${base64("home_desktop.png")}" alt="章节主线桌面端" />
  <p class="caption">图 3：章节主线桌面端，学段切换 + 年级卡片网格</p>
</div>

<div class="figure">
  <img src="data:image/png;base64,${base64("methods_desktop.png")}" alt="学习方法桌面端" />
  <p class="caption">图 4：学习方法库，按学段聚合 127 个解题技巧</p>
</div>

<h2>五、单文件离线版与开源发布</h2>
<p>针对手机浏览器直接打开本地 HTML 时相对路径资源无法加载的问题，新增 <code>build_standalone.js</code> 构建脚本，将 styles.css 与 17 个 JS 全部内联，生成 <strong>pep-math-coach-standalone.html</strong>（约 977 KB）。用户只需把这一个文件拷到手机，点开即用。</p>

<div class="figure">
  <img src="data:image/png;base64,${base64("mobile_home.png")}" alt="章节主页手机端" />
  <p class="caption">图 5：手机端章节主页，顶部导航单行横滑、卡片两列显示</p>
</div>

<p>本次代码已同步开源至 GitHub 与 Gitee：</p>
<ul>
  <li>GitHub：<a href="https://github.com/kenowong/pep-math-coach">https://github.com/kenowong/pep-math-coach</a></li>
  <li>Gitee：<a href="https://gitee.com/kenowong/pep-math-coach">https://gitee.com/kenowong/pep-math-coach</a></li>
</ul>

<div class="summary">
  <h3>总结</h3>
  <p>本次更新将 pep-math-coach 从“章节练习工具”扩展为覆盖<strong>人教版章节主线、奥数教材专题、学法与解题技巧、错题纸质化闭环</strong>的完整学习应用；同时补齐了手机端适配与单文件离线分发能力。后续将继续完善章节动图、每法配图及题库扩容。</p>
</div>

<footer>© 2026 keno王 · MIT 协议开源</footer>
</div>
</body>
</html>`;

const OUT = path.join(ROOT, "update_article_2026-10-15.html");
fs.writeFileSync(OUT, html, "utf8");
console.log("OK ->", OUT, fs.statSync(OUT).size, "bytes");
