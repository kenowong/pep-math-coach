/* ============================================================
 * pep-math-coach 单文件离线版构建脚本
 * 把 styles.css 与 js/*.js 全部内联进 index.html 骨架，
 * 产出 pep-math-coach-standalone.html：双击即开、零依赖、可离线。
 * 用法：node build_standalone.js
 * ============================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;

let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

/* 1. 内联样式表 */
html = html.replace(/<link rel="stylesheet" href="styles\.css" \/>/, () => {
  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  return "<style>\n" + css + "\n</style>";
});

/* 2. 内联全部脚本（按 index.html 引用顺序） */
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  const p = path.join(ROOT, src.replace(/^\//, ""));
  if (!fs.existsSync(p)) throw new Error("找不到脚本文件: " + src);
  const code = fs.readFileSync(p, "utf8");
  if (code.includes("</script")) throw new Error(src + " 含 </script>，内联会破坏 HTML，先处理！");
  return "<script>\n" + code + "\n</script>";
});

if (/src="js\//.test(html)) throw new Error("仍有未内联的脚本引用！");
if (/href="styles\.css"/.test(html)) throw new Error("仍有未内联的样式引用！");

const OUT = path.join(ROOT, "pep-math-coach-standalone.html");
fs.writeFileSync(OUT, html, "utf8");
console.log("OK ->", OUT, fs.statSync(OUT).size, "bytes");
