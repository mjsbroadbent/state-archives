/* State Archives of Irad: document facsimiles drawn in SVG (paper, ink, stamps, typescript, hands).
   FAX.render(id) returns an <svg> string; ids are listed in FAX.ids. Each drawing gets its own id prefix. */
(function () {
  "use strict";
  var N = 0;
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var F = { mono: "'IBM Plex Mono', 'Courier New', monospace", serif: "'Old Standard TT', 'PT Serif', Georgia, serif", hand: "'Marck Script', 'Segoe Script', cursive", fa: "Amiri, 'Noto Naskh Arabic', serif", sans: "'Fira Sans', Arial, sans-serif" };
  var TONES = {
    cream: ["#f1e6c9", "#e2d1a6", "#b89b62"], grey: ["#e9e5d8", "#d6d0bd", "#9d9580"], yellow: ["#ecdcae", "#dcc489", "#a88a4a"],
    white: ["#f5f3ec", "#e7e3d6", "#aaa38f"], form: ["#eef0de", "#dcdfc4", "#a3a27e"], squared: ["#f3f1ea", "#e4e0d2", "#a7a08b"], card: ["#e6dcc3", "#d3c39d", "#9c8653"]
  };

  /* svg shell with defs: grain, edge shading, ink texture */
  function shell(w, h, o, body) {
    var u = "fx" + (++N), t = TONES[o.tone || "cream"], R = rng(o.seed || 7);
    var spots = "";
    for (var i = 0; i < (o.fox == null ? 7 : o.fox); i++) {
      spots += '<circle cx="' + (R() * w).toFixed(0) + '" cy="' + (R() * h).toFixed(0) + '" r="' + (3 + R() * 14).toFixed(1) + '" fill="' + t[2] + '" opacity="' + (0.05 + R() * 0.1).toFixed(2) + '"/>';
    }
    var fold = o.fold ? '<line x1="0" y1="' + o.fold + '" x2="' + w + '" y2="' + o.fold + '" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><line x1="0" y1="' + (o.fold + 2) + '" x2="' + w + '" y2="' + (o.fold + 2) + '" stroke="' + t[2] + '" stroke-opacity=".35" stroke-width="1.5"/>' : "";
    var holes = o.holes ? '<circle cx="30" cy="' + (h * 0.3) + '" r="4" fill="#5b5040" opacity=".55"/><circle cx="30" cy="' + (h * 0.5) + '" r="4" fill="#5b5040" opacity=".55"/><circle cx="30" cy="' + (h * 0.7) + '" r="4" fill="#5b5040" opacity=".55"/>' : "";
    var edge = o.edge || "";
    var defs =
      '<defs>' +
      '<radialGradient id="' + u + '-vg" cx="50%" cy="48%" r="75%"><stop offset="55%" stop-color="' + t[0] + '" stop-opacity="0"/><stop offset="100%" stop-color="' + t[2] + '" stop-opacity="' + (o.age || 0.45) + '"/></radialGradient>' +
      '<filter id="' + u + '-gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="' + (o.seed || 7) + '"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .15  0 0 0 .55 -.18"/></filter>' +
      '<filter id="' + u + '-ink" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="' + ((o.seed || 7) + 3) + '" result="n"/><feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.55" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>' +
      '<filter id="' + u + '-rough"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" seed="5" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="1.6"/></filter>' +
      '<filter id="' + u + '-seal" x="-5%" y="-5%" width="110%" height="110%"><feColorMatrix values="0 0 0 0 COLR  0 0 0 0 COLG  0 0 0 0 COLB  -.9 -.9 -.9 0 2.15" result="m0"/><feComposite in="m0" in2="SourceAlpha" operator="in" result="m"/><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="11" result="n"/><feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.0 1.32" result="nm"/><feComposite in="m" in2="nm" operator="in"/></filter>' +
      '<filter id="' + u + '-emb" x="-3%" y="-3%" width="106%" height="106%"><feColorMatrix type="luminanceToAlpha" result="a"/><feDiffuseLighting in="a" surfaceScale="2.6" lighting-color="' + t[0] + '" result="l"><feDistantLight azimuth="225" elevation="42"/></feDiffuseLighting><feComposite in="l" in2="SourceAlpha" operator="in"/></filter>' +
      '<filter id="' + u + '-embr" x="-3%" y="-3%" width="106%" height="106%"><feColorMatrix type="luminanceToAlpha" result="a"/><feDiffuseLighting in="a" surfaceScale="2.6" lighting-color="#c4403a" result="l"><feDistantLight azimuth="225" elevation="42"/></feDiffuseLighting><feComposite in="l" in2="SourceAlpha" operator="in"/></filter>' +
      (o.defs ? o.defs(u) : "") +
      '</defs>';
    var col = o.sealInk || [0.18, 0.2, 0.5];
    defs = defs.replace("COLR", col[0]).replace("COLG", col[1]).replace("COLB", col[2]);
    var bg = '<rect width="' + w + '" height="' + h + '" fill="' + t[0] + '"/>' + (o.under ? o.under(u) : "");
    var over = '<rect width="' + w + '" height="' + h + '" filter="url(#' + u + '-gr)" opacity=".55"/><rect width="' + w + '" height="' + h + '" fill="url(#' + u + '-vg)"/>' + spots + fold + holes + edge;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(o.label || "") + '">' + defs + bg + body(u, R) + over + "</svg>";
  }

  /* lines of text; o: x, y, lh, size, font, fill, anchor, jit (px), op (base opacity), weight, ls, style */
  function lines(arr, o, R) {
    var out = "";
    for (var i = 0; i < arr.length; i++) {
      var s = arr[i];
      if (s === "" || s == null) continue;
      if (o.font === F.hand) s = s.replace(/ѣ/g, "ђ").replace(/Ѣ/g, "Ђ");
      var jx = o.jit ? (R() - 0.5) * o.jit : 0, jy = o.jit ? (R() - 0.5) * o.jit * 0.6 : 0;
      var op = o.op ? (o.op - R() * 0.12) : 1;
      var x = o.x, anchor = o.anchor || "start", sz = o.size, wt = o.weight || 400;
      var m = /^\{(c|r|b|cb|i)\}(.*)$/.exec(s);
      if (m) { s = m[2]; if (m[1] === "c" || m[1] === "cb") { anchor = "middle"; x = o.cx; } if (m[1] === "r") { anchor = "end"; x = o.rx; } if (m[1] === "b" || m[1] === "cb") wt = 700; }
      out += '<text x="' + (x + jx).toFixed(1) + '" y="' + (o.y + i * o.lh + jy).toFixed(1) + '" font-family="' + o.font + '" font-size="' + sz + '" fill="' + (o.fill || "#222") + '" text-anchor="' + anchor + '" font-weight="' + wt + '" style="white-space:pre"' +
        (o.ls ? ' letter-spacing="' + o.ls + '"' : "") + (o.style ? ' font-style="' + o.style + '"' : "") + (o.rot ? ' transform="rotate(' + ((R() - 0.5) * o.rot).toFixed(2) + " " + x + " " + (o.y + i * o.lh) + ')"' : "") + ' opacity="' + op.toFixed(2) + '">' + esc(s) + "</text>";
    }
    return out;
  }
  /* round rubber stamp */
  function stampRound(u, o) {
    var r = o.r, id = u + "-arc" + (++N);
    var g = '<g transform="rotate(' + (o.rot || 0) + " " + o.cx + " " + o.cy + ')" filter="url(#' + u + '-ink)" opacity="' + (o.op || 0.85) + '" fill="' + o.color + '" stroke="' + o.color + '">';
    g += '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + r + '" fill="none" stroke-width="' + (r * 0.045) + '"/>';
    g += '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + (r * 0.92) + '" fill="none" stroke-width="' + (r * 0.012) + '"/>';
    g += '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + (r * 0.62) + '" fill="none" stroke-width="' + (r * 0.02) + '"/>';
    var ar = r * 0.74;
    g += '<path id="' + id + '" d="M ' + (o.cx - ar) + " " + o.cy + " a " + ar + " " + ar + " 0 1 1 " + (2 * ar) + ' 0 a ' + ar + " " + ar + " 0 1 1 " + (-2 * ar) + ' 0" fill="none" stroke="none"/>';
    g += '<text font-family="' + (o.font || F.sans) + '" font-size="' + (r * 0.19) + '" font-weight="700" stroke="none" letter-spacing="' + (r * 0.01) + '"><textPath href="#' + id + '" startOffset="' + (o.start || "0%") + '">' + esc(o.ring) + "</textPath></text>";
    if (o.center) {
      var cs = o.center.length, lh = r * 0.2;
      for (var i = 0; i < cs; i++) g += '<text x="' + o.cx + '" y="' + (o.cy + (i - (cs - 1) / 2) * lh + r * 0.06) + '" text-anchor="middle" font-family="' + (o.font || F.sans) + '" font-size="' + (r * (o.csize || 0.15)) + '" font-weight="700" stroke="none">' + esc(o.center[i]) + "</text>";
    }
    if (o.star) g += star(o.cx, o.cy - r * 0.35, r * 0.1, o.color);
    return g + "</g>";
  }
  function star(cx, cy, r, c) {
    var p = [];
    for (var i = 0; i < 10; i++) { var a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; p.push((cx + Math.cos(a) * rr).toFixed(1) + "," + (cy - Math.sin(a) * rr).toFixed(1)); }
    return '<polygon points="' + p.join(" ") + '" fill="' + c + '" stroke="none"/>';
  }
  function stampRect(u, o) {
    var g = '<g transform="rotate(' + (o.rot || 0) + " " + (o.x + o.w / 2) + " " + (o.y + o.h / 2) + ')" filter="url(#' + u + '-ink)" opacity="' + (o.op || 0.85) + '">';
    g += '<rect x="' + o.x + '" y="' + o.y + '" width="' + o.w + '" height="' + o.h + '" rx="' + (o.rx || 3) + '" fill="none" stroke="' + o.color + '" stroke-width="' + (o.sw || 3) + '"/>';
    if (o.double) g += '<rect x="' + (o.x + 5) + '" y="' + (o.y + 5) + '" width="' + (o.w - 10) + '" height="' + (o.h - 10) + '" rx="2" fill="none" stroke="' + o.color + '" stroke-width="1.2"/>';
    var n = o.lines.length, lh = o.lh || o.size * 1.2;
    for (var i = 0; i < n; i++) g += '<text x="' + (o.x + o.w / 2) + '" y="' + (o.y + o.h / 2 + (i - (n - 1) / 2) * lh + o.size * 0.35) + '" text-anchor="middle" font-family="' + (o.font || F.sans) + '" font-size="' + (i === 0 && o.first ? o.first : o.size) + '" font-weight="700" fill="' + o.color + '" letter-spacing="' + (o.ls || 0.5) + '">' + esc(o.lines[i]) + "</text>";
    return g + "</g>";
  }
  /* a signature: loops and a flourish */
  function sig(x, y, w, seed, color, sw) {
    var R = rng(seed), d = "M " + x + " " + (y + 4), cx = x;
    var n = 5 + Math.floor(R() * 4);
    for (var i = 0; i < n; i++) {
      var step = w / (n + 1), h = 10 + R() * 22;
      d += " c " + (step * 0.3).toFixed(1) + " " + (-h).toFixed(1) + " " + (step * 0.9).toFixed(1) + " " + (-h * 0.8).toFixed(1) + " " + (step * 0.55).toFixed(1) + " " + (h * 0.15).toFixed(1);
      d += " s " + (-step * 0.5).toFixed(1) + " " + (h * 0.9).toFixed(1) + " " + (step * 0.45).toFixed(1) + " " + (-2 + R() * 4).toFixed(1);
      cx += step;
    }
    d += " q " + (w * 0.25).toFixed(1) + " " + (8 + R() * 6).toFixed(1) + " " + (-w * 0.9).toFixed(1) + " " + (6 + R() * 6).toFixed(1);
    return '<path d="' + d + '" fill="none" stroke="' + (color || "#1d2a55") + '" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".88"/>';
  }
  /* the archive's own marks: foliation in pencil, and the violet archive stamp */
  function folio(x, y, n) { return '<text x="' + x + '" y="' + y + '" font-family="' + F.hand + '" font-size="26" fill="#6d6a66" opacity=".75">' + esc(n) + "</text>"; }
  function archStamp(u, x, y, ref, rot) {
    return stampRect(u, { x: x, y: y, w: 236, h: 58, color: "#4b3f8c", lines: ["ГОСАРХИВ ИРАДА", ref], size: 15, first: 13, rot: rot == null ? -1.5 : rot, sw: 2, op: 0.72, font: F.mono, ls: 0.3 });
  }
  /* seal image as an ink impression or a blind embossing */
  function sealImg(u, href, x, y, s, mode, extra) {
    return '<image href="' + href + '" x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" filter="url(#' + u + (mode === "emb" ? "-emb" : mode === "embr" ? "-embr" : "-seal") + ')"' + (extra || "") + "/>";
  }
  var SEAL = "/assets/img/seal-territory.svg", ISSR = "/assets/img/emblem-issr.svg", ROUND = "/assets/img/office-roundel.svg", EMBM = "/assets/img/state-emblem-mono.svg";

  /* ------------------------------------------------------------------ documents */
  var D = {};

  /* Fond 3: 19th-century Persian copy of the charter of 1727 */
  D.firman = function () {
    var w = 640, h = 1000;
    return shell(w, h, { tone: "cream", seed: 31, age: 0.6, fox: 12, label: "Persian copy of the charter of Abd al-Rahim Biy" }, function (u, R) {
      var s = "";
      s += '<rect x="40" y="40" width="560" height="920" fill="none" stroke="#a0782e" stroke-width="2" opacity=".6"/><rect x="48" y="48" width="544" height="904" fill="none" stroke="#a0782e" stroke-width=".8" opacity=".5"/>';
      // illuminated head-piece
      s += '<path d="M 190 160 Q 320 118 450 160 Q 386 146 320 147 Q 254 146 190 160 Z" fill="#b8892f" opacity=".55"/><path d="M 214 156 Q 320 128 426 156" fill="none" stroke="#2f4a7a" stroke-width="2.5" opacity=".55"/><circle cx="320" cy="134" r="4" fill="#2f4a7a" opacity=".5"/>';
      s += lines(["هو"], { x: 320, y: 104, lh: 0, size: 30, font: F.fa, fill: "#7b2d1d", anchor: "middle" }, R);
      s += lines(["بسم الله الرحمن الرحیم"], { x: 320, y: 196, lh: 0, size: 24, font: F.fa, fill: "#7b2d1d", anchor: "middle" }, R);
      var txt = [
        "حکم عالی شد که طایفهٔ ترسایان ایراد",
        "که در جنگ قلماق خدمت شایسته نمودند",
        "عبادت خود را آشکارا بجا آورند",
        "و در روزهای عید خود گشت نمایند",
        "و کشیشان و راهبان ایشان",
        "از جزیه و بیگار معاف باشند",
        "و از خزانهٔ عامره برای بنای کلیسای سنگین",
        "وجه و چوب داده شود",
        "و در عوض بزرگان ایشان در وقت جنگ سوار دهند",
        "و هر سال اسپ پیشکش نمایند",
        "تحریراً فی سنهٔ ۱۱۳۹"
      ];
      s += lines(txt, { x: 320, y: 262, lh: 50, size: 25, font: F.fa, fill: "#2a2118", anchor: "middle", jit: 2, op: 0.95 }, R);
      // seal of the copyist and attestation in another hand
      s += '<g opacity=".8" filter="url(#' + u + '-ink)"><ellipse cx="320" cy="860" rx="54" ry="40" fill="none" stroke="#3b2a1e" stroke-width="3"/><ellipse cx="320" cy="860" rx="46" ry="32" fill="none" stroke="#3b2a1e" stroke-width="1"/></g>';
      s += lines(["عبده"], { x: 320, y: 870, lh: 0, size: 26, font: F.fa, fill: "#3b2a1e", anchor: "middle", op: 0.8 }, R);
      s += lines(["سواد مطابق اصل است"], { x: 500, y: 818, lh: 0, size: 20, font: F.fa, fill: "#4a3a2a", anchor: "middle", rot: 8 }, R);
      // archivist's pencil note and foliation
      s += lines(["Копия XIX в."], { x: 72, y: 930, lh: 0, size: 20, font: F.hand, fill: "#6d6a66", op: 0.7 }, R);
      s += folio(560, 82, "1");
      s += archStamp(u, 370, 905, "Ф.3 Оп.1 Д.1", -1);
      return s;
    });
  };

  /* Fond 3: tribute register of the Kokand fort at Talas, 1842 */
  D.tribute = function () {
    var w = 900, h = 680;
    return shell(w, h, { tone: "yellow", seed: 44, age: 0.55, fox: 10, fold: 330, label: "Register of tribute horses, Kokand fort at Talas" }, function (u, R) {
      var s = "";
      s += lines(["دفتر اسپان پیشکش طوایف ترسا — قلعهٔ طلاس"], { x: 450, y: 78, lh: 0, size: 28, font: F.fa, fill: "#5a2a18", anchor: "middle" }, R);
      s += lines(["سنهٔ ۱۲۵۸"], { x: 450, y: 118, lh: 0, size: 22, font: F.fa, fill: "#5a2a18", anchor: "middle" }, R);
      var rows = [["یوسف بی", "۱۲"], ["توما آقسقال", "۹"], ["افرم ولد عیسی", "۷"], ["جانبک", "۵"], ["متی بی", "۱۰"]];
      for (var i = 0; i < rows.length; i++) {
        var y = 180 + i * 62;
        s += '<line x1="140" y1="' + (y + 16) + '" x2="760" y2="' + (y + 16) + '" stroke="#8a6a3a" stroke-width=".8" opacity=".5"/>';
        s += lines([rows[i][0]], { x: 740, y: y, lh: 0, size: 27, font: F.fa, fill: "#2a2118", anchor: "end", jit: 3 }, R);
        s += lines([rows[i][1]], { x: 200, y: y, lh: 0, size: 27, font: F.fa, fill: "#2a2118", anchor: "middle", jit: 3 }, R);
      }
      s += '<line x1="140" y1="505" x2="760" y2="505" stroke="#5a2a18" stroke-width="1.6" opacity=".7"/>';
      s += lines(["جمع"], { x: 740, y: 546, lh: 0, size: 27, font: F.fa, fill: "#5a2a18", anchor: "end" }, R);
      s += lines(["۴۳"], { x: 200, y: 546, lh: 0, size: 27, font: F.fa, fill: "#5a2a18", anchor: "middle" }, R);
      s += '<g opacity=".78" filter="url(#' + u + '-ink)" transform="rotate(-8 460 610)"><ellipse cx="460" cy="610" rx="44" ry="33" fill="#2c2018" opacity=".85"/></g>';
      s += lines(["عبده"], { x: 460, y: 619, lh: 0, size: 22, font: F.fa, fill: "#e8d8ae", anchor: "middle", op: 0.9 }, R);
      s += folio(840, 50, "7");
      s += archStamp(u, 620, 600, "Ф.3 Оп.1 Д.17", 1.2);
      return s;
    });
  };

  /* Fond 3: inventory of the church, 1876 (Russian, pre-reform spelling, handwritten) */
  D.inventory1876 = function () {
    var w = 760, h = 1060;
    return shell(w, h, { tone: "cream", seed: 52, age: 0.5, fox: 9, holes: true, label: "Inventory of the property of the Church of St. Janyl, 1876" }, function (u, R) {
      var s = "";
      s += lines(["{c}О П И С Ь", "{c}имуществу несторіанской церкви во имя Св. Джаныль", "{c}въ Ийыкъ-Джанылѣ, составленная по распоряженію", "{c}Начальника Ферганской области"], { x: 90, cx: 400, y: 120, lh: 40, size: 27, font: F.hand, fill: "#25284a", jit: 2, op: 0.95 }, R);
      var items = [
        "1. Зданіе церковное каменное, съ куполомъ . . . . 1",
        "2. Крестовъ серебряныхъ напрестольныхъ . . . . . . 6",
        "3. Чашъ серебряныхъ . . . . . . . . . . . . . . . . . . 2",
        "4. Книгъ рукописныхъ на сирійскомъ",
        "    и тюркскомъ языкахъ . . . . . . . . . не сочтено",
        "5. Ковровъ войлочныхъ (шырдакъ) . . . . . . . . . 11",
        "6. Колоколъ . . . . . . . . . . . . . . . . . . . . нѣтъ",
        "7. Грамоты ханскія въ футлярѣ кожаномъ . . . . 3"
      ];
      s += lines(items, { x: 90, y: 330, lh: 50, size: 25, font: F.hand, fill: "#25284a", jit: 3, op: 0.93 }, R);
      s += lines(["Октября 12 дня 1876 года.", "Чиновникъ особыхъ порученій"], { x: 90, y: 790, lh: 44, size: 25, font: F.hand, fill: "#25284a", jit: 2 }, R);
      s += sig(420, 832, 220, 76, "#25284a", 2);
      s += lines(["Съ подлиннымъ вѣрно."], { x: 470, y: 930, lh: 0, size: 22, font: F.hand, fill: "#4b3020", rot: 4 }, R);
      s += folio(690, 70, "4");
      s += archStamp(u, 80, 950, "Ф.3 Оп.2 Д.4", -1);
      return s;
    });
  };

  /* Fond 21: list of households recorded as departed, November 1916 / register of returned families 1917 */
  function ledgerForm(cfg) {
    var w = 1000, h = 70 + cfg.head.length * 30 + 60 + cfg.rows.length * 40 + 200;
    return shell(w, h, { tone: "grey", seed: cfg.seed, age: 0.5, fox: 8, fold: Math.round(h / 2), label: cfg.label }, function (u, R) {
      var s = "";
      s += lines(cfg.head, { x: 500, cx: 500, y: 64, lh: 30, size: 22, font: F.serif, fill: "#2b2b2b" }, R);
      var cols = cfg.cols, x = 50, top = 70 + cfg.head.length * 30, rowH = 40, nRows = cfg.rows.length;
      s += '<rect x="50" y="' + top + '" width="900" height="' + (60 + nRows * rowH) + '" fill="none" stroke="#3a3a3a" stroke-width="1.4"/>';
      s += '<line x1="50" y1="' + (top + 60) + '" x2="950" y2="' + (top + 60) + '" stroke="#3a3a3a" stroke-width="1.2"/>';
      for (var c = 0; c < cols.length; c++) {
        var cw = cols[c][1];
        if (c) s += '<line x1="' + x + '" y1="' + top + '" x2="' + x + '" y2="' + (top + 60 + nRows * rowH) + '" stroke="#3a3a3a" stroke-width="1"/>';
        var hl = cols[c][0].split("|");
        s += lines(hl, { x: x + cw / 2, y: top + 26 - (hl.length - 1) * 8, lh: 17, size: 14.5, font: F.serif, fill: "#2b2b2b", anchor: "middle" }, R);
        cols[c].x = x; x += cw;
      }
      for (var r = 0; r < nRows; r++) {
        var y = top + 60 + (r + 1) * rowH;
        s += '<line x1="50" y1="' + y + '" x2="950" y2="' + y + '" stroke="#3a3a3a" stroke-width=".6" opacity=".7"/>';
        for (var k = 0; k < cols.length; k++) {
          var cell = cfg.rows[r][k];
          if (cell == null) continue;
          var cc = cols[k];
          s += lines([cell], { x: cc[2] === "c" ? cc.x + cc[1] / 2 : cc.x + 10, y: y - 11, lh: 0, size: 21, font: F.hand, fill: "#1f2a52", anchor: cc[2] === "c" ? "middle" : "start", jit: 3, op: 0.95 }, R);
        }
      }
      var by = top + 60 + nRows * rowH + 50;
      s += lines(cfg.foot, { x: 60, y: by, lh: 34, size: 21, font: F.hand, fill: "#1f2a52", jit: 2 }, R);
      s += sig(600, by + 6, 170, cfg.seed + 5, "#1f2a52", 1.8);
      s += stampRound(u, { cx: 840, cy: by + 6, r: 62, color: "#2c3c7a", ring: cfg.stamp, rot: -14, star: true, op: 0.7, font: F.serif });
      s += folio(940, 40, cfg.folio);
      s += archStamp(u, 380, h - 76, cfg.ref, 0.8);
      return s;
    });
  }
  D.flightlist = function () {
    return ledgerForm({
      seed: 61, label: "List of households recorded as departed, Kara-Buura volost, 1916", folio: "12", ref: "Ф.21 Оп.1 Д.37",
      head: ["{cb}С П И С О К Ъ", "{c}инородческихъ хозяйствъ Кара-Бууринской волости, выбывшихъ съ мѣстъ", "{c}постояннаго жительства въ Октябрѣ и Ноябрѣ 1916 года"],
      cols: [["№|по пор.", 70, "c"], ["Имя и прозвище|домохозяина", 270], ["Душъ|обоего пола", 110, "c"], ["Скота|(головъ)", 100, "c"], ["Куда выбыли", 190], ["Примѣчаніе", 160]],
      rows: [
        ["1", "Асанкулъ Мамбетовъ", "7", "40", "за перевалъ", ""],
        ["2", "Тома Бакировъ", "5", "22", "въ горы", "неизвѣстно"],
        ["3", "Ефремъ Сыдыковъ", "9", "65", "въ Китай", ""],
        ["4", "Кубатъ Ниязовъ", "4", "—", "въ горы", "неизвѣстно"],
        ["5", "Юсупъ Тургуновъ", "6", "31", "за перевалъ", ""],
        ["6", "вдова Сайкалъ", "3", "8", "въ горы", "неизвѣстно"],
        ["7", "Маттай Осмоновъ", "8", "52", "неизвѣстно", ""]
      ],
      foot: ["Ноября 28 дня 1916 г.", "Волостной управитель"],
      stamp: "КАРА-БУУРИНСКІЙ ВОЛОСТНОЙ УПРАВИТЕЛЬ ·"
    });
  };
  D.returnlist = function () {
    return ledgerForm({
      seed: 66, label: "Register of families returned from China, 1917", folio: "3", ref: "Ф.21 Оп.1 Д.58",
      head: ["{cb}В Ѣ Д О М О С Т Ь", "{c}семействъ Кара-Бууринской волости, возвратившихся изъ Китая", "{c}по 1 Октября 1917 года"],
      cols: [["№|по пор.", 70, "c"], ["Имя|домохозяина", 270], ["Душъ|ушло", 100, "c"], ["Душъ|вернулось", 110, "c"], ["Прежнее|мѣсто", 170], ["Примѣчаніе", 180]],
      rows: [
        ["1", "Асанкулъ Мамбетовъ", "7", "4", "Кара-Буура", "земля занята"],
        ["2", "Ефремъ Сыдыковъ", "9", "6", "Кара-Буура", "земля занята"],
        ["3", "Юсупъ Тургуновъ", "6", "6", "уроч. Ак-Су", ""],
        ["4", "Маттай Осмоновъ", "8", "3", "Кара-Буура", "безъ скота"],
        ["5", "Тома Бакировъ", "5", "—", "", "не вернулись"],
        ["6", "Кубатъ Ниязовъ", "4", "—", "", "не вернулись"]
      ],
      foot: ["Октября 3 дня 1917 г.", "Волостной комиссаръ"],
      stamp: "КАРА-БУУРИНСКОЕ ВОЛОСТНОЕ ПРАВЛЕНІЕ ·"
    });
  };

  /* Fond 21: telegram, August 1916 (form with glued tape) */
  D.telegram1916 = function () {
    var w = 1000, h = 660;
    return shell(w, h, { tone: "form", seed: 71, age: 0.45, fox: 6, label: "Telegram from the Talas district officer, August 1916" }, function (u, R) {
      var s = "", ink = "#3c4a2c";
      s += '<rect x="30" y="30" width="940" height="600" fill="none" stroke="' + ink + '" stroke-width="2.4"/>';
      s += lines(["{cb}Т Е Л Е Г Р А М М А"], { cx: 500, x: 500, y: 92, lh: 0, size: 40, font: F.serif, fill: ink, ls: 3 }, R);
      s += lines(["Изъ Таласа", "Подана  14  числа  8  ч.  40  м.", "Словъ  29"], { x: 60, y: 150, lh: 32, size: 19, font: F.serif, fill: ink }, R);
      s += lines(["{r}Принята ______ числа ___ ч. ___ м.", "{r}Передалъ ____________"], { rx: 940, x: 940, y: 150, lh: 32, size: 19, font: F.serif, fill: ink }, R);
      s += '<line x1="60" y1="250" x2="940" y2="250" stroke="' + ink + '" stroke-width="1.2"/>';
      var tape = [
        "ТАШКЕНТЪ ВОЕННОМУ ГУБЕРНАТОРУ СЫРЪ-ДАРЬИНСКОЙ ОБЛАСТИ",
        "ЛИНІЯ НА ВЕРНЫЙ ПРЕРВАНА ТРЕТЬИ СУТКИ ВОЛОСТНЫЯ",
        "ПРАВЛЕНІЯ КАРА-БУУРА КЕНКОЛЬ НЕ ОТВЕЧАЮТЪ ПРИЗЫВНЫЕ",
        "СПИСКИ НЕ ПОЛУЧЕНЫ ДОНЕСЕНІЕ ПОСЫЛАЮ НАРОЧНЫМЪ",
        "ТАЛАССКІЙ УЧАСТКОВЫЙ ПРИСТАВЪ"
      ];
      for (var i = 0; i < tape.length; i++) {
        var y = 290 + i * 56, tw = tape[i].length * 12.9 + 26, x0 = 60 + (R() - 0.5) * 8, rot = (R() - 0.5) * 1.2;
        s += '<g transform="rotate(' + rot.toFixed(2) + " " + (x0 + tw / 2) + " " + (y + 14) + ')"><rect x="' + x0 + '" y="' + y + '" width="' + tw + '" height="30" fill="#f7f4e8" stroke="#c9c3a6" stroke-width=".8"/>';
        s += '<text x="' + (x0 + 13) + '" y="' + (y + 21) + '" font-family="' + F.mono + '" font-size="21" fill="#222" letter-spacing=".6" opacity=".9">' + esc(tape[i]) + "</text></g>";
      }
      s += stampRound(u, { cx: 860, cy: 560, r: 46, color: "#5b2b6e", ring: "ТАЛАСЪ ПОЧТ.-ТЕЛЕГР. КОНТОРА ·", center: ["14", "VIII", "1916"], csize: 0.2, rot: 10, op: 0.65, font: F.serif });
      s += folio(930, 70, "88");
      s += archStamp(u, 560, 556, "Ф.21 Оп.1 Д.9", -0.5);
      return s;
    });
  };

  /* Fond 85: internal-security special report, 14 June 1956 */
  D.report1956 = function () {
    var w = 800, h = 1130;
    return shell(w, h, { tone: "grey", seed: 81, age: 0.42, fox: 6, holes: true, label: "Special report of 14 June 1956" }, function (u, R) {
      var s = "", tw = { x: 90, y: 0, lh: 30, size: 19, font: F.mono, fill: "#1d1d22", jit: 1.4, op: 0.95 };
      s += lines(["{r}Сов. секретно", "{r}Экз. № 2"], { rx: 730, x: 730, y: 90, lh: 28, size: 19, font: F.mono, fill: "#1d1d22" }, R);
      s += lines(["ПЕРВОМУ СЕКРЕТАРЮ ЦК", "КОМПАРТИИ ИРАДА"], { x: 410, y: 180, lh: 28, size: 19, font: F.mono, fill: "#1d1d22" }, R);
      s += lines(["{c}С П Е Ц С О О Б Щ Е Н И Е"], { cx: 400, x: 400, y: 280, lh: 0, size: 21, font: F.mono, fill: "#1d1d22", weight: 700 }, R);
      tw.y = 340;
      s += lines([
        "    14 июня 1956 года около 9 часов утра на",
        "контрольно-пропускном пункте на въезде в г.Талас",
        "у колхозного рынка военнослужащим при попытке",
        "остановить гужевую повозку произведён выстрел,",
        "которым убита лошадь, принадлежащая престарелой",
        "жительнице пригорода. По предварительным данным",
        "выстрел произведён случайно.",
        "    К 12 часам у здания городского отдела милиции",
        "собралось до 300 человек, требовавших ареста",
        "военнослужащего и суда над ним. Переговоры",
        "представителей горкома результатов не дали.",
        "    К 19 часам число собравшихся достигло 6000",
        "человек. Опрокинуты две служебные автомашины,",
        "выбиты стёкла в здании конторы заготзерно.",
        "    Приняты меры к усилению охраны зданий",
        "государственных учреждений. Обстановка в городе",
        "остаётся напряжённой. Докладываю по мере",
        "поступления сведений."
      ], tw, R);
      s += lines(["Председатель Комитета госбезопасности", "при Совете Министров Ирадской ССР"], { x: 90, y: 940, lh: 28, size: 19, font: F.mono, fill: "#1d1d22" }, R);
      s += sig(520, 978, 170, 85, "#22305e", 2);
      s += lines(["14.VI.56  № 1/0412"], { x: 90, y: 1030, lh: 0, size: 17, font: F.mono, fill: "#1d1d22" }, R);
      // resolution in red pencil, received stamp
      s += lines(["Ознакомить членов бюро."], { x: 110, y: 130, lh: 0, size: 26, font: F.hand, fill: "#a3302a", rot: 6, op: 0.85 }, R);
      s += '<path d="M 112 140 q 120 10 260 -8" fill="none" stroke="#a3302a" stroke-width="1.5" opacity=".7"/>';
      s += stampRect(u, { x: 90, y: 168, w: 250, h: 74, color: "#3b3f8f", lines: ["ЦК КП ИРАДА", "Общий отдел", "Вх. № 2217  14 VI 1956"], size: 14, first: 15, rot: 2.5, double: true, op: 0.72, font: F.mono, lh: 19 });
      s += folio(720, 50, "3");
      s += archStamp(u, 90, 1056, "Ф.85 Оп.4 Д.211", -1);
      return s;
    });
  };

  /* Fond 86: minutes of the city committee bureau, 19 June 1956 */
  D.minutes1956 = function () {
    var w = 800, h = 1130;
    return shell(w, h, { tone: "grey", seed: 86, age: 0.4, fox: 5, holes: true, label: "Minutes of the Talas city committee bureau, 19 June 1956" }, function (u, R) {
      var s = "", tw = { x: 90, y: 0, lh: 30, size: 19, font: F.mono, fill: "#24242a", jit: 1.4, op: 0.94 };
      s += lines(["{c}П Р О Т О К О Л  № 31", "{c}заседания бюро Таласского городского", "{c}комитета КП Ирада", "{c}от 19 июня 1956 года"], { cx: 400, x: 400, y: 110, lh: 30, size: 19, font: F.mono, fill: "#24242a" }, R);
      tw.y = 270;
      s += lines([
        "Присутствовали: члены бюро - 7, кандидаты в",
        "члены бюро - 2, приглашённые - 4.",
        "",
        "СЛУШАЛИ:",
        "1. Информацию о событиях 14-18 июня 1956 г.",
        "   в городе Таласе.",
        "",
        "ПОСТАНОВИЛИ:",
        "1. Информацию принять к сведению.",
        "2. Секретарям первичных партийных организаций",
        "   предприятий провести собрания трудовых",
        "   коллективов до 22 июня.",
        "3. Горисполкому в недельный срок представить",
        "   предложения по жилищному строительству для",
        "   рабочих железнодорожного узла.",
        "4. Вопрос о работе бюро горкома в дни событий",
        "   перенести на пленум горкома."
      ], tw, R);
      s += lines(["Секретарь горкома"], { x: 90, y: 860, lh: 0, size: 19, font: F.mono, fill: "#24242a" }, R);
      s += sig(330, 856, 160, 91, "#1f2b55", 2);
      s += lines(["Верно:"], { x: 90, y: 930, lh: 0, size: 19, font: F.mono, fill: "#24242a" }, R);
      s += sig(200, 926, 110, 93, "#3a3a8a", 1.6);
      s += stampRound(u, { cx: 590, cy: 930, r: 64, color: "#3b3f8f", ring: "ТАЛАССКИЙ ГОРОДСКОЙ КОМИТЕТ КП ИРАДА ·", center: ["ДЛЯ", "ПАКЕТОВ"], csize: 0.17, rot: -18, op: 0.6, star: false, font: F.sans });
      s += folio(720, 50, "14");
      s += archStamp(u, 90, 1040, "Ф.86 Оп.1 Д.6", 1);
      return s;
    });
  };

  /* Fond 85: printed order of the military commandant, 17 June 1956 */
  D.curfew1956 = function () {
    var w = 800, h = 1130;
    return shell(w, h, { tone: "white", seed: 88, age: 0.5, fox: 8, fold: 565, label: "Order No. 1 of the military commandant of Talas, 17 June 1956" }, function (u, R) {
      var s = "", ink = "#151515";
      s += '<rect x="44" y="44" width="712" height="1042" fill="none" stroke="' + ink + '" stroke-width="3"/><rect x="54" y="54" width="692" height="1022" fill="none" stroke="' + ink + '" stroke-width="1"/>';
      s += lines(["{cb}ПРИКАЗ № 1"], { cx: 400, x: 400, y: 150, lh: 0, size: 54, font: F.serif, fill: ink, ls: 2 }, R);
      s += lines(["{c}военного коменданта города Таласа"], { cx: 400, x: 400, y: 200, lh: 0, size: 26, font: F.serif, fill: ink }, R);
      s += lines(["{c}Талас шаарынын аскер комендантынын буйругу"], { cx: 400, x: 400, y: 236, lh: 0, size: 19, font: F.serif, fill: "#333", style: "italic" }, R);
      s += lines(["17 июня 1956 года", "{r}гор. Талас"], { x: 90, rx: 710, y: 296, lh: 0, size: 21, font: F.serif, fill: ink }, R);
      s += lines(["В целях восстановления общественного порядка"], { x: 90, y: 360, lh: 0, size: 22, font: F.serif, fill: ink }, R);
      s += lines(["{cb}П Р И К А З Ы В А Ю:"], { cx: 400, x: 400, y: 412, lh: 0, size: 26, font: F.serif, fill: ink }, R);
      s += lines([
        "1. С 17 июня 1956 года в городе Таласе ввести",
        "    комендантский час с 21 часа до 6 часов утра.",
        "2. Хождение граждан и движение транспорта в",
        "    указанное время без пропусков военной",
        "    комендатуры запретить.",
        "3. Собрания и скопления граждан на улицах",
        "    и площадях города запретить.",
        "4. Лицам, имеющим огнестрельное оружие, сдать его",
        "    в военную комендатуру в течение 24 часов.",
        "5. Нарушители настоящего приказа будут",
        "    привлекаться к строгой ответственности."
      ], { x: 90, y: 470, lh: 38, size: 22, font: F.serif, fill: ink }, R);
      s += lines(["Военный комендант г. Таласа", "полковник"], { x: 90, y: 950, lh: 32, size: 22, font: F.serif, fill: ink }, R);
      s += lines(["Таласская городская типография. Зак. 1182. Тир. 400."], { x: 90, y: 1060, lh: 0, size: 13, font: F.serif, fill: "#444" }, R);
      // paste marks and a tear at the corner
      s += '<path d="M 756 44 L 700 44 L 756 110 Z" fill="#cfc9b7" opacity=".9"/>';
      s += '<rect x="330" y="20" width="140" height="40" fill="#d8c9a0" opacity=".45" transform="rotate(-3 400 40)"/>';
      s += folio(690, 1030, "27");
      s += archStamp(u, 470, 1000, "Ф.85 Оп.4 Д.215", -2);
      return s;
    });
  };

  /* Fond 108: Decree No. 1 of the Provisional Government, 12 March 1992 */
  D.decree1 = function () {
    var w = 800, h = 1130;
    return shell(w, h, { tone: "white", seed: 92, age: 0.35, fox: 4, holes: false, label: "Decree No. 1 of the Provisional Government, 12 March 1992" }, function (u, R) {
      var s = "", tw = { x: 80, y: 0, lh: 27, size: 17, font: F.mono, fill: "#1b1b22", jit: 1.6, op: 0.93 };
      s += lines(["{c}ИРАД РЕСПУБЛИКАСЫНЫН УБАКТЫЛУУ ӨКМӨТҮ", "{c}ВРЕМЕННОЕ ПРАВИТЕЛЬСТВО РЕСПУБЛИКИ ИРАД"], { cx: 400, x: 400, y: 80, lh: 28, size: 18, font: F.mono, fill: "#1b1b22", weight: 700 }, R);
      s += '<line x1="80" y1="122" x2="720" y2="122" stroke="#1b1b22" stroke-width="2"/><line x1="80" y1="127" x2="720" y2="127" stroke="#1b1b22" stroke-width=".8"/>';
      s += lines(["{c}ЖАРЛЫК № 1  /  ДЕКРЕТ № 1"], { cx: 400, x: 400, y: 172, lh: 0, size: 20, font: F.mono, fill: "#1b1b22", weight: 700 }, R);
      s += lines(["Талас ш., 1992-ж. 12-март", "{r}г. Талас, 12 марта 1992 г."], { x: 80, rx: 720, y: 210, lh: 0, size: 16, font: F.mono, fill: "#1b1b22" }, R);
      tw.y = 262;
      s += lines([
        "Өзгөчө чараларды жокко чыгаруу жөнүндө",
        "1. Кобозев шаарындагы өкмөттүн 1991-жылдын",
        "   ноябрындагы өзгөчө жарлыктары жараксыз деп",
        "   табылсын.",
        "2. Уруулардын өз алдынча башкаруусу мурдагы",
        "   жайыт чектеринде калыбына келтирилсин.",
        "3. Жыйындарга катышканы жана басма сөз",
        "   чыгарганы үчүн кармалгандар бир суткада",
        "   бошотулсун."
      ], tw, R);
      s += '<line x1="300" y1="520" x2="500" y2="520" stroke="#1b1b22" stroke-width="1" stroke-dasharray="4 4"/>';
      tw.y = 566;
      s += lines([
        "Об отмене чрезвычайных мер",
        "На территории, находящейся под управлением",
        "Временного правительства Республики Ирад:",
        "1. Чрезвычайные указы правительства в г.Кобозеве",
        "   от ноября 1991 года признать недействительными.",
        "2. Восстановить самоуправление родовых общин",
        "   в прежних границах пастбищ.",
        "3. Лиц, задержанных за участие в собраниях и",
        "   издание печатных материалов, освободить",
        "   в течение суток.",
        "4. Декрет вступает в силу с момента оглашения",
        "   по радио."
      ], tw, R);
      s += lines(["Убактылуу Президент", "Временный Президент Республики Ирад"], { x: 80, y: 930, lh: 27, size: 17, font: F.mono, fill: "#1b1b22" }, R);
      s += lines(["{r}А. Алимбеков"], { rx: 720, x: 720, y: 957, lh: 0, size: 17, font: F.mono, fill: "#1b1b22" }, R);
      s += sig(470, 950, 150, 108, "#16306b", 2.2);
      // no seal yet in March 1992: the coordinating council's rubber stamp
      s += stampRect(u, { x: 84, y: 990, w: 372, h: 64, color: "#2a3f8a", lines: ["ТАЛАС ШААРЫНЫН КООРДИНАЦИЯЛЫК КЕҢЕШИ", "Координационный совет г. Таласа"], size: 12.5, first: 13, rot: -4, op: 0.7, font: F.sans, lh: 20 });
      s += lines(["Радио 20.15 — окулду. Б."], { x: 470, y: 1060, lh: 0, size: 22, font: F.hand, fill: "#3a3a3a", rot: 5, op: 0.8 }, R);
      s += folio(720, 46, "1");
      s += archStamp(u, 480, 1072, "Ф.108 Оп.1 Д.2", 1);
      return s;
    });
  };

  /* Fond 108: bread coupons under the decree of 16 April 1992 */
  D.bread1992 = function () {
    var w = 900, h = 660;
    return shell(w, h, { tone: "card", seed: 95, age: 0.5, fox: 6, label: "Bread coupons of the Provisional Government's supply commission, May 1992" }, function (u, R) {
      var s = "";
      s += lines(["{c}ПРОДОВОЛЬСТВЕННАЯ КОМИССИЯ ВРЕМЕННОГО ПРАВИТЕЛЬСТВА РЕСПУБЛИКИ ИРАД", "{c}Убактылуу Өкмөттүн азык-түлүк комиссиясы · Талас · Май 1992"], { cx: 450, x: 450, y: 48, lh: 26, size: 17, font: F.sans, fill: "#2a2418", weight: 700 }, R);
      var cw = 196, ch = 118, x0 = 44, y0 = 96;
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
        var x = x0 + c * (cw + 8), y = y0 + r * (ch + 8), torn = (r === 0 && c < 3) || (r === 1 && c === 0);
        if (torn) { s += '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" fill="#a99a78" opacity=".25" stroke="#7d6e4e" stroke-dasharray="3 3"/>'; continue; }
        s += '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" fill="none" stroke="#5a4a2a" stroke-width="1.2" stroke-dasharray="5 3"/>';
        s += '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="' + (cw - 12) + '" height="' + (ch - 12) + '" fill="none" stroke="#8b2f24" stroke-width="1" opacity=".7"/>';
        s += lines(["{c}ХЛЕБ · НАН", "{cb}400 г", "{c}" + (r * 4 + c + 1) + " мая", "{c}Талас"], { cx: x + cw / 2, x: x + cw / 2, y: y + 30, lh: 25, size: 16, font: F.sans, fill: "#3a2c18" }, R);
      }
      s += lines(["Карточка № 04117 · рабочая норма"], { x: 44, y: 630, lh: 0, size: 16, font: F.mono, fill: "#3a2c18" }, R);
      s += stampRound(u, { cx: 790, cy: 590, r: 40, color: "#8b2f24", ring: "ПРОДКОМИССИЯ · ТАЛАС ·", center: ["1992"], csize: 0.24, rot: 12, op: 0.6, font: F.sans });
      s += archStamp(u, 430, 600, "Ф.108 Оп.1 Д.37", 0);
      return s;
    });
  };

  /* Fond 108, inventory 3: page from the Provisional President's working notebook, May 1992 */
  D.notebook1992 = function () {
    var w = 760, h = 1000;
    return shell(w, h, {
      tone: "squared", seed: 104, age: 0.35, fox: 4, label: "Page from the Provisional President's notebook, May 1992",
      under: function (u) {
        var g = "";
        for (var x = 20; x < w; x += 24) g += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + h + '" stroke="#8fa9c9" stroke-width=".7" opacity=".55"/>';
        for (var y = 20; y < h; y += 24) g += '<line x1="0" y1="' + y + '" x2="' + w + '" y2="' + y + '" stroke="#8fa9c9" stroke-width=".7" opacity=".55"/>';
        return g + '<line x1="644" y1="0" x2="644" y2="' + h + '" stroke="#d26a6a" stroke-width="1.4" opacity=".7"/>';
      }
    }, function (u, R) {
      var s = "", hand = { x: 50, y: 0, lh: 48, size: 27, font: F.hand, fill: "#1d2f6b", jit: 4, op: 0.95, rot: 1.5 };
      s += lines(["27.V"], { x: 50, y: 80, lh: 0, size: 32, font: F.hand, fill: "#1d2f6b" }, R);
      hand.y = 150;
      s += lines([
        "— вода: Сарчашма — очередь с 5 утра,",
        "   охрана — студ. дружина. Водовозы:",
        "   2 бочки на квартал (Старый город).",
        "— хлеб: норма 300 г с понедельника.",
        "   Продкомиссии — списки детей.",
        "— больница: керосин, стекло.",
        "   Ерматову — до четверга!",
        "— обращение по радио в 20.00 —",
        "   короче. Без цифр.",
        "— школа № 4 — под жильё?",
        "— оборонный совет: перевалы,",
        "   обоз 31-го — кто ведёт?"
      ], hand, R);
      s += '<path d="M 50 418 q 140 -6 300 2" fill="none" stroke="#1d2f6b" stroke-width="2" opacity=".7"/>';
      s += lines(["Не забыть:", "архив горкома —", "опечатать!"], { x: 470, y: 820, lh: 40, size: 26, font: F.hand, fill: "#1d2f6b", rot: -6 }, R);
      s += lines(["?"], { x: 680, y: 640, lh: 0, size: 54, font: F.hand, fill: "#1d2f6b" }, R);
      s += folio(690, 975, "46");
      s += archStamp(u, 60, 905, "Ф.108 Оп.3 Д.5", -1);
      return s;
    });
  };

  /* Fond 108: ratification minutes, 2 June 1992 */
  D.ratification1992 = function () {
    var w = 800, h = 1130;
    return shell(w, h, { tone: "white", seed: 112, age: 0.38, fox: 5, fold: 380, label: "Minutes of the Provisional Council, 2 June 1992" }, function (u, R) {
      var s = "", tw = { x: 80, y: 0, lh: 28, size: 18, font: F.mono, fill: "#1b1b22", jit: 1.6, op: 0.92 };
      s += lines(["{c}П Р О Т О К О Л  № 41", "{c}заседания Временного совета Республики Ирад", "{c}2 июня 1992 года", "{c}г. Талас, городской театр (подвальное помещение)"], { cx: 400, x: 400, y: 100, lh: 30, size: 18, font: F.mono, fill: "#1b1b22" }, R);
      tw.y = 270;
      s += lines([
        "Председательствует: Временный Президент",
        "Республики Ирад А. Алимбеков.",
        "Присутствуют: 63 делегата. Кворум имеется.",
        "",
        "СЛУШАЛИ:",
        "О ратификации Договора между Республикой Ирад",
        "и Соединёнными Штатами Америки, подписанного",
        "2 июня 1992 года.",
        "",
        "ПОСТАНОВИЛИ:",
        "Договор ратифицировать.",
        "",
        "Голосовали: за - 63, против - нет,",
        "воздержались - нет.",
        "Решение принято единогласно.",
        "",
        "Заседание закрыто в 23 ч. 10 мин."
      ], tw, R);
      s += lines(["Председатель", "Секретарь"], { x: 80, y: 860, lh: 60, size: 18, font: F.mono, fill: "#1b1b22" }, R);
      s += sig(330, 856, 160, 118, "#16306b", 2.1);
      s += sig(330, 916, 120, 121, "#2a2a2a", 1.7);
      s += lines(["Электричества нет. Протокол", "перепечатан 3.VI."], { x: 470, y: 1010, lh: 34, size: 22, font: F.hand, fill: "#4a4a4a", rot: 3, op: 0.8 }, R);
      s += folio(720, 46, "112");
      s += archStamp(u, 80, 1050, "Ф.108 Оп.1 Д.19", 0.8);
      return s;
    });
  };

  /* Fond 110: last page of the Toponymic Heritage Statute, 1993, under the Seal of the Territory */
  D.act1993 = function () {
    var w = 800, h = 1130;
    return shell(w, h, { tone: "white", seed: 121, age: 0.3, fox: 3, label: "Toponymic Heritage Statute 1993, last page with the Seal of the Territory", sealInk: [0.12, 0.17, 0.42] }, function (u, R) {
      var s = "", tw = { x: 90, y: 0, lh: 29, size: 18, font: F.mono, fill: "#1a1a1a", jit: 0.8, op: 0.95 };
      s += lines(["{c}TOPONYMIC HERITAGE STATUTE", "{c}No. 93-21"], { cx: 400, x: 400, y: 100, lh: 30, size: 19, font: F.mono, fill: "#1a1a1a", weight: 700 }, R);
      s += lines(["{r}- 6 -"], { rx: 710, x: 710, y: 60, lh: 0, size: 16, font: F.mono, fill: "#1a1a1a" }, R);
      tw.y = 190;
      s += lines([
        "    Sec. 8. Nurzhan. The city formerly known",
        "as Kobozev shall be known as Nurzhan in all",
        "acts, maps, signs and records of the Territory.",
        "",
        "    Sec. 9. Schedules. The State Archives,",
        "through its Toponymic Section, shall prepare",
        "and keep the schedules of restored names of",
        "settlements, rivers, passes and streets, and",
        "shall publish a gazetteer of settlements.",
        "",
        "    Sec. 10. Effective date. This Act shall",
        "take effect upon its publication in the",
        "Territorial Gazette."
      ], tw, R);
      s += lines(["Passed the Senate", "Passed the House of Representatives"], { x: 90, y: 640, lh: 64, size: 17, font: F.mono, fill: "#1a1a1a" }, R);
      s += '<line x1="440" y1="646" x2="710" y2="646" stroke="#1a1a1a"/><line x1="440" y1="710" x2="710" y2="710" stroke="#1a1a1a"/>';
      s += sig(470, 634, 180, 131, "#13265c", 2);
      s += sig(480, 698, 160, 134, "#13265c", 2);
      s += lines(["President of the Senate", "Speaker of the House"], { x: 440, y: 668, lh: 64, size: 14, font: F.mono, fill: "#1a1a1a" }, R);
      s += lines(["Attest:"], { x: 90, y: 800, lh: 0, size: 17, font: F.mono, fill: "#1a1a1a" }, R);
      s += '<line x1="200" y1="806" x2="430" y2="806" stroke="#1a1a1a"/>';
      s += sig(214, 794, 160, 137, "#13265c", 1.8);
      s += lines(["Clerk of the Territorial Legislature"], { x: 200, y: 830, lh: 0, size: 14, font: F.mono, fill: "#1a1a1a" }, R);
      s += '<g transform="rotate(-9 590 860)" opacity=".9">' + sealImg(u, SEAL, 470, 740, 240, "ink") + "</g>";
      s += folio(730, 1090, "61");
      s += archStamp(u, 90, 1040, "Ф.110 Оп.2 Д.88", -1);
      return s;
    });
  };

  /* Fond 110: certified copy with the seal embossed (dry seal) and ribbon, 2001 */
  D.cert2001 = function () {
    var w = 800, h = 1130;
    return shell(w, h, { tone: "white", seed: 128, age: 0.25, fox: 2, label: "Certified copy under the embossed Seal of the Territory, 2001" }, function (u, R) {
      var s = "", tw = { x: 100, y: 0, lh: 30, size: 18, font: F.mono, fill: "#1b1b1b", jit: 0.6, op: 0.96 };
      s += lines(["{c}TERRITORY OF IRAD", "{c}OFFICE OF THE CLERK OF THE TERRITORIAL LEGISLATURE"], { cx: 400, x: 400, y: 110, lh: 30, size: 17, font: F.serif, fill: "#1f2f55", weight: 700 }, R);
      s += '<line x1="100" y1="150" x2="700" y2="150" stroke="#1f2f55" stroke-width="1.5"/>';
      s += lines(["{cb}CERTIFICATE"], { cx: 400, x: 400, y: 230, lh: 0, size: 30, font: F.serif, fill: "#1b1b1b", ls: 4 }, R);
      tw.y = 300;
      s += lines([
        "    I hereby certify that the annexed is a",
        "true and correct copy of the Act as enrolled",
        "in the journals of the Territorial Legislature",
        "and deposited with the State Archives.",
        "",
        "    In witness whereof I have set my hand and",
        "caused the Seal of the Territory of Irad to be",
        "affixed at Talas this fourteenth day of May,",
        "two thousand and one."
      ], tw, R);
      s += '<line x1="420" y1="700" x2="700" y2="700" stroke="#1b1b1b"/>';
      s += sig(450, 688, 190, 141, "#152e66", 2);
      s += lines(["Clerk of the Territorial Legislature"], { x: 420, y: 724, lh: 0, size: 14, font: F.mono, fill: "#1b1b1b" }, R);
      // ribbon and wafer under the dry seal
      s += '<path d="M 150 800 L 205 1010 L 228 975 L 258 1012 L 250 800 Z" fill="#a3262a" opacity=".85"/><path d="M 240 790 L 330 990 L 345 950 L 380 978 L 320 780 Z" fill="#a3262a" opacity=".75"/>';
      s += '<circle cx="250" cy="830" r="96" fill="#b52e2e"/><circle cx="250" cy="830" r="96" fill="none" stroke="#7d1717" stroke-width="2"/>';
      s += sealImg(u, SEAL, 154, 734, 192, "embr");
      s += sealImg(u, SEAL, 470, 780, 210, "emb", ' opacity=".95"');
      s += folio(730, 1090, "2");
      s += archStamp(u, 460, 1030, "Ф.110 Оп.14 Д.302", 1);
      return s;
    });
  };

  /* Fond 310: the cut seal, December 2006 (detail of a cabinet decree's last page) */
  D.cutseal2006 = function () {
    var w = 900, h = 600;
    return shell(w, h, {
      tone: "white", seed: 133, age: 0.25, fox: 2, label: "The cut seal on a DRI cabinet decree, December 2006", sealInk: [0.15, 0.16, 0.38],
      defs: function (u) { return '<mask id="' + u + '-cut"><rect width="1000" height="1000" fill="#000"/><circle cx="500" cy="500" r="356" fill="#fff"/></mask>'; }
    }, function (u, R) {
      var s = "";
      s += lines(["... shall take effect on the day of its publication."], { x: 70, y: 70, lh: 0, size: 19, font: F.mono, fill: "#1b1b1b", jit: 0.6 }, R);
      s += lines(["Talas, December 2006"], { x: 70, y: 140, lh: 0, size: 19, font: F.mono, fill: "#1b1b1b" }, R);
      s += lines(["Prime Minister", "of the Democratic Republic of Irad"], { x: 70, y: 250, lh: 28, size: 18, font: F.mono, fill: "#1b1b1b" }, R);
      s += '<line x1="470" y1="268" x2="760" y2="268" stroke="#1b1b1b"/>';
      s += sig(490, 262, 220, 145, "#0f2a6a", 2.3);
      s += '<g transform="translate(560 300) rotate(7) scale(.27)" opacity=".92"><image href="' + SEAL + '" width="1000" height="1000" filter="url(#' + u + '-seal)" mask="url(#' + u + '-cut)"/></g>';
      s += lines(["(text of the decree withheld from the exhibition)"], { x: 70, y: 420, lh: 0, size: 15, font: F.serif, fill: "#7a7468", style: "italic" }, R);
      s += archStamp(u, 70, 500, "Ф.310 Оп.1 Д.4", -1);
      s += folio(840, 570, "9");
      return s;
    });
  };

  /* plate: the seals that came before and after, as ink impressions */
  D.successors = function () {
    var w = 1100, h = 380;
    return shell(w, h, {
      tone: "card", seed: 140, age: 0.35, fox: 4, label: "Seals and emblems of Irad, 1937 to today", sealInk: [0.2, 0.2, 0.42],
      defs: function (u) { return '<mask id="' + u + '-cut"><rect width="1000" height="1000" fill="#000"/><circle cx="500" cy="500" r="356" fill="#fff"/></mask>'; }
    }, function (u, R) {
      var s = "", xs = [40, 255, 470, 685, 900], sz = 160, labels = [["Iradi SSR", "1937–1992"], ["Territory of Irad", "1993–2006"], ["“The cut seal”", "DRI, 2006–2007"], ["ISEZ, Office", "2007–2009"], ["State Emblem", "since 2009"]];
      s += sealImg(u, ISSR, xs[0], 50, sz, "ink");
      s += sealImg(u, SEAL, xs[1], 50, sz, "ink");
      s += '<g transform="translate(' + xs[2] + ' 50) scale(' + (sz / 1000) + ')"><image href="' + SEAL + '" width="1000" height="1000" filter="url(#' + u + '-seal)" mask="url(#' + u + '-cut)"/></g>';
      s += sealImg(u, ROUND, xs[3], 50, sz, "ink");
      s += sealImg(u, EMBM, xs[4], 50, sz, "ink");
      for (var i = 0; i < 5; i++) s += lines(["{c}" + labels[i][0], "{c}" + labels[i][1]], { cx: xs[i] + sz / 2, x: xs[i] + sz / 2, y: 262, lh: 26, size: 19, font: F.serif, fill: "#2a2418" }, R);
      s += '<line x1="40" y1="320" x2="1060" y2="320" stroke="#7a6a48" stroke-width="1" opacity=".6"/>';
      s += lines(["Impressions from the reference sheet of the Archives' seal register."], { x: 40, y: 350, lh: 0, size: 16, font: F.serif, fill: "#5a4e36", style: "italic" }, R);
      return s;
    });
  };

  window.FAX = {
    ids: Object.keys(D),
    render: function (id) { return D[id] ? D[id]() : ""; },
    has: function (id) { return !!D[id]; }
  };
})();
