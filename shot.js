/* 用本机 Edge 无头渲染单文件离线版，抓取关键界面截图 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const ROOT = __dirname;
const FILE = "file://" + path.join(ROOT, "pep-math-coach-standalone.html");
const OUT = path.join(ROOT, "updateshots");
fs.mkdirSync(OUT, { recursive: true });

const shots = [
  { name: "home_desktop",        route: "#/home",         w: 1280, h: 900 },
  { name: "oly_desktop",         route: "#/oly",          w: 1280, h: 900 },
  { name: "methods_desktop",     route: "#/methods",      w: 1280, h: 900 },
  { name: "mobile_home",         route: "#/home",         w: 390,  h: 844, dpr: 2 },
  { name: "mobile_oly",          route: "#/oly",          w: 390,  h: 844, dpr: 2 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--allow-file-access-from-files"],
  });
  const page = await browser.newPage();
  for (const s of shots) {
    await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: s.dpr || 1 });
    await page.goto(FILE + s.route, { waitUntil: "networkidle0" });
    // 等 hash 路由渲染 + 动图/列表填充
    await new Promise(r => setTimeout(r, 900));
    const file = path.join(OUT, s.name + ".png");
    await page.screenshot({ path: file, fullPage: false });
    console.log("shot:", s.name, fs.statSync(file).size, "bytes");
  }
  await browser.close();
  console.log("ALL DONE");
})().catch(e => { console.error(e); process.exit(1); });
