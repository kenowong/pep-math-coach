/* ============================================================
 * 错题卷打印 + 扫码复核（Print & Scan）
 * 依赖：qrcode-generator（window.qrcode，离线）
 * 数据链路：
 *   错题本(未清零) → 紧凑 JSON → LZW 压缩 → base64url → 切成多个可装进
 *   单个二维码的批次 → 每批生成一个「可扫 URL」二维码印在卷尾。
 *   家长扫码进入 #/scan?d=<批次> 页面，勾选孩子又做错的题，重新加入错题库。
 * 说明：单个二维码容量有限（v40-L 约 2953 字节），错题较多时自动分多批
 *       （每批一码），卷子正文仍是全部题目，家长逐批扫码核对即可。
 * ============================================================ */
(function () {
  "use strict";

  /* ---------- LZW（12bit，字典满 4096 复位）作用于 UTF-8 字节流 ---------- */
  function lzwEncode(bytes) {
    const d = new Map();
    for (let i = 0; i < 256; i++) d.set(String.fromCharCode(i), i);
    let size = 256;
    let w = String.fromCharCode(bytes[0]);
    const out = [];
    for (let i = 1; i < bytes.length; i++) {
      const c = String.fromCharCode(bytes[i]);
      const wc = w + c;
      if (d.has(wc)) { w = wc; }
      else { out.push(d.get(w)); if (size < 4096) d.set(wc, size++); w = c; }
    }
    out.push(d.get(w));
    return out;
  }
  function lzwDecode(codes) {
    const d = [];
    for (let i = 0; i < 256; i++) d[i] = String.fromCharCode(i);
    let size = 256;
    let w = d[codes[0]];
    let r = w;
    for (let i = 1; i < codes.length; i++) {
      const k = codes[i];
      let e;
      if (k < size) e = d[k];
      else if (k === size) e = w + w[0];
      else throw new Error("LZW 解码失败");
      r += e;
      if (size < 4096) d[size++] = w + e[0];
      w = e;
    }
    return r;
  }
  function packCodes(codes) {
    let bits = 0, val = 0; const out = [];
    for (const x of codes) { val = (val << 12) | x; bits += 12; while (bits >= 8) { bits -= 8; out.push((val >> bits) & 0xff); } }
    if (bits > 0) out.push((val << (8 - bits)) & 0xff);
    return out;
  }
  function unpackCodes(bytes) {
    const out = []; let bits = 0, val = 0;
    for (const x of bytes) { val = (val << 8) | x; bits += 8; while (bits >= 12) { bits -= 12; out.push((val >> bits) & 0xfff); } }
    return out;
  }
  function bytesToB64url(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64urlToBytes(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const bin = atob(s); const out = new Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 0xff;
    return out;
  }

  /* ---------- 紧凑编码 ---------- */
  // 每条错题只保留重新入库存与核对所需字段
  function compact(list) {
    return list.map(m => ({
      c: m.chId, k: m.qKey,
      q: m.q, o: m.options, a: m.ans,
      e: m.explain || "", f: m.fig || null
    }));
  }
  function encodeList(list) {
    const json = JSON.stringify(list);
    const bytes = new TextEncoder().encode(json);
    const packed = packCodes(lzwEncode(bytes));
    return bytesToB64url(packed);
  }
  function decodePayload(b64) {
    const bytes = b64urlToBytes(b64);
    const codes = unpackCodes(bytes);
    const str = lzwDecode(codes);
    const arr = new Array(str.length);
    for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i) & 0xff;
    const json = new TextDecoder().decode(Uint8Array.from(arr));
    return JSON.parse(json);
  }

  /* ---------- 二维码 ---------- */
  function baseHref() {
    const h = location.href.split("#")[0];
    return h || (location.origin + location.pathname);
  }
  function buildUrl(b64) { return baseHref() + "#/scan?d=" + b64; }
  // 生成二维码 <img>（内嵌 GIF data URL，体积远小于逐模块 SVG）；超容返回 null
  function qrHtml(text) {
    if (typeof qrcode !== "function") return null;
    try {
      const qr = qrcode(0, "L"); // 0=自动选版本；L=最大容量
      qr.addData(text, "Byte");
      qr.make();
      return `<img class="qr-img-src" alt="错题核对二维码" src="${qr.createDataURL(4, 8)}"/>`;
    } catch (e) { return null; }
  }
  // 单条 URL 能否装进一个二维码（只 make，不生成 SVG，更快）
  function canEncode(text) {
    if (typeof qrcode !== "function") return false;
    try { const qr = qrcode(0, "L"); qr.addData(text, "Byte"); qr.make(); return true; }
    catch (e) { return false; }
  }
  function urlFits(url) { return canEncode(url); }

  /* 把整批错题切成多个可装进二维码的子批（每批一码）
   * 采用贪心填充：逐题加入当前批，直到加入后超出单码容量则封口开新批。
   * 单题体积远小于二维码上限，故必能装入，保证每批都可用。 */
  function splitFitChunks(list) {
    if (!list.length) return [];
    const payloads = compact(list);
    const chunks = [];
    let cur = [];
    for (let i = 0; i < payloads.length; i++) {
      const trial = cur.concat([payloads[i]]);
      if (canEncode(buildUrl(encodeList(trial)))) { cur = trial; }
      else { if (cur.length) chunks.push(cur); cur = [payloads[i]]; }
    }
    if (cur.length) chunks.push(cur);
    return chunks;
  }

  window.PrintScan = {
    compact, encodeList, decodePayload,
    buildUrl, qrHtml, splitFitChunks, baseHref
  };
})();
