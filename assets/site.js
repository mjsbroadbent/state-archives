/* State Archives of Irad (archives.iradgov.org): header, footer, language and the data-driven pages.
   Data: /data/fonds.json, /data/exhibitions.json, /data/closed.json, /data/fees.json. Facsimiles: /assets/facsimile.js.
   Nothing typed into the forms leaves the browser. */
(function () {
  "use strict";
  var I = window.SA_I18N;
  var LANGS = ["en", "ir", "ru"];
  var GOV = "https://iradgov.org/";
  var LANG = "en";
  try { var saved = localStorage.getItem("archives_lang"); if (LANGS.indexOf(saved) >= 0) LANG = saved; } catch (e) {}
  var qs = new URLSearchParams(location.search);
  if (LANGS.indexOf(qs.get("lang")) >= 0) LANG = qs.get("lang");
  var PAGE = document.body.getAttribute("data-page") || "";
  var cache = {}, origHTML = new WeakMap();

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fill(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); }
  function t(k, v) { var d = I.ui[LANG] || {}; var s = d[k] != null ? d[k] : I.ui.en[k]; return s == null ? k : (v ? fill(s, v) : s); }
  function tri(o) { if (o == null) return ""; if (typeof o === "string") return o; return o[LANG] || o.en || ""; }
  /* long texts exist in English and Russian; Iradi readers get the English */
  function bi(o) { if (o == null) return ""; if (typeof o === "string") return o; return o[LANG] || (LANG === "ir" ? o.en : o.en) || ""; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iradNow() { var n = new Date(); return new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 6 * 3600000); }
  function fmtDate(y, m, d) {
    var M = I.ui[LANG].months;
    if (LANG === "ir") return d + "-" + M[m - 1] + " " + y;
    return d + " " + M[m - 1] + " " + y;
  }
  function monthNom(m) { return I.ui[LANG].monthsNom[m - 1]; }
  function getJSON(url) {
    if (!cache[url]) cache[url] = fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    return cache[url];
  }
  function som(x) { var s = Number(x).toFixed(2); if (LANG !== "en") s = s.replace(".", ","); return s; }
  function rr() {
    var n = iradNow(), m = n.getMonth() + 1, y = n.getFullYear(), nm = m === 12 ? 1 : m + 1, ny = m === 12 ? y + 1 : y;
    var last = new Date(y, m, 0).getDate();
    return { m: m, y: y, nm: nm, ny: ny, last: last, d: n.getDate(), mName: monthNom(m), nmName: monthNom(nm), mIn: I.ui[LANG].monthsIn[m - 1], mGen: I.ui[LANG].monthsGen[m - 1], nmIn: I.ui[LANG].monthsIn[nm - 1], nmFrom: I.ui[LANG].monthsFrom[nm - 1] };
  }
  function refLine(r, lang) {
    if (!r || !r.f) return "";
    var L = lang || LANG;
    if (L === "ru") return "Ф. " + r.f + ". Оп. " + r.op + ". Д. " + r.d + (r.l ? ". Л. " + r.l : "") + ".";
    return fill(L === "en" ? I.ui.en.refFmt : t("refFmt"), { f: r.f, op: r.op, d: r.d, l: r.l });
  }

  /* ---------- icons ---------- */
  var IC = {
    fonds: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M4.5 9v10.5h15V9M10 13h4"/></svg>',
    reading: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6.5c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5V19c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5z"/><path d="M12 7v12.5"/></svg>',
    copies: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="1"/><path d="m3.5 7 8.5 6.5L20.5 7"/></svg>',
    gen: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="4.5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="4" cy="19.5" r="1.6"/><circle cx="9" cy="19.5" r="1.6"/><circle cx="18" cy="19.5" r="1.6"/><path d="M12 6.5v2.5M12 9H6v1M12 9h6v1M6 14v2.5H4V18M6 16.5h3V18M18 14v4"/></svg>',
    ex: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="3" width="16" height="18" rx="1"/><circle cx="15.5" cy="16" r="2.6"/><path d="M7.5 7.5h9M7.5 10.5h9M7.5 13.5h4"/></svg>',
    closed: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="18" height="13" rx="1"/><path d="M3 11h18M10 14h4M8 7V5a4 4 0 0 1 8 0v2"/></svg>',
    ld: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h11l3 3v13H5z"/><path d="M8 10h8M8 13h8M8 16h5"/></svg>',
    topo: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>'
  };

  /* ---------- chrome ---------- */
  var NAV = [["home", "/"], ["fonds", "/fonds.html"], ["reading", "/reading-room.html"], ["copies", "/copies.html"], ["genealogy", "/genealogy.html"], ["exhibitions", "/exhibitions.html"], ["closed", "/closed-shelf.html"], ["about", "/about.html"]];
  var NAVPAGE = { exhibition: "exhibitions" };
  function navLabel(k) { var s = (I.ui[LANG] || {})["navS_" + k]; return s != null ? s : t("nav_" + k); }
  function navHref(k) { for (var i = 0; i < NAV.length; i++) if (NAV[i][0] === k) return NAV[i][1]; return "/"; }
  function chrome() {
    var top = $("#top"), bottom = $("#bottom"), r = rr();
    if (top) {
      var cur = NAVPAGE[PAGE] || PAGE;
      top.innerHTML =
        '<a class="skip" href="#main">' + esc(t("skip")) + "</a>" +
        '<div class="util"><div class="wrap"><div class="left"><span class="gl">' + esc(t("utilGov")) + '</span><a href="' + GOV + '">' + esc(t("govLink")) + '</a></div>' +
        '<div class="right"><span class="clock" id="clock"></span><div class="langs" role="group" aria-label="' + esc(t("langLabel")) + '">' +
        LANGS.map(function (l) { return '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === LANG) + '" lang="' + I.htmlLang[l] + '">' + esc(I.langs[l]) + "</button>"; }).join("") +
        "</div></div></div></div>" +
        '<div class="mast"><div class="wrap"><a class="home-link" href="/"><img class="emb" src="/assets/state-emblem-160.png" alt="' + esc(t("embAlt")) + '" width="78" height="78">' +
        '<div class="label-plate"><div class="k">' + esc(t("mastK")) + '</div><div class="n">' + esc(t("mastN")) + '</div><div class="s">' + esc(t("mastS")) + "</div></div></a>" +
        '<div class="mast-status"><a class="rr-chip" href="/reading-room.html#book">' + esc(t("rrChip")) + "<small>" + esc(t("rrChipS", { m: r.mGen })) + "</small></a>" +
        '<span class="ret">' + esc(t("mastAddr")) + "</span></div></div></div>" +
        '<nav class="nav" aria-label="' + esc(t("navLabel")) + '"><div class="wrap"><button class="burger" type="button" aria-expanded="false"><span class="bars"></span>' + esc(t("menu")) + '</button><ul class="menu">' +
        NAV.map(function (n) { return '<li><a href="' + n[1] + '"' + (n[0] === cur ? ' aria-current="page"' : "") + ">" + esc(navLabel(n[0])) + "</a></li>"; }).join("") +
        "</ul></div></nav>";
      $(".burger", top).addEventListener("click", function () {
        var nav = $(".nav", top), open = !nav.classList.contains("open");
        nav.classList.toggle("open", open); this.setAttribute("aria-expanded", open);
      });
      $$("[data-lang]", top).forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); }); });
      tick();
    }
    if (bottom) {
      bottom.innerHTML =
        '<footer class="foot"><div class="wrap"><div class="cols">' +
        '<div><div class="femb"><img src="/assets/state-emblem-160.png" alt="" width="46" height="46"><strong>' + esc(t("mastN")) + "</strong></div>" +
        '<address style="font-style:normal">' + t("footAddr") + "</address></div>" +
        "<div><h4>" + esc(t("footHours")) + "</h4>" + t("footHoursBody") + "</div>" +
        "<div><h4>" + esc(t("footArch")) + "</h4><ul>" + ["fonds", "reading", "copies", "genealogy", "exhibitions", "closed", "about"].map(function (k) { return '<li><a href="' + navHref(k) + '">' + esc(t("nav_" + k)) + "</a></li>"; }).join("") + "</ul></div>" +
        "<div><h4>" + esc(t("footGov")) + '</h4><ul><li><a href="https://iradgov.org/">' + esc(t("footGovPortal")) + '</a></li><li><a href="https://e-irad.org/">' + esc(t("footEirad")) + '</a></li><li><a href="/about.html#ld">' + esc(t("footLD")) + '</a></li><li><a href="/about.html#topo">' + esc(t("footTopo")) + "</a></li></ul></div>" +
        '</div><div class="fine"><span>' + esc(t("footCopy", { y: iradNow().getFullYear() })) + "</span><span>" + esc(t("footTime")) + "</span></div></div></footer>";
    }
  }
  var tickTimer;
  function tick() {
    var el = $("#clock"); if (!el) return;
    var d = iradNow();
    el.textContent = t("clock", { d: fmtDate(d.getFullYear(), d.getMonth() + 1, d.getDate()), t: pad(d.getHours()) + ":" + pad(d.getMinutes()) });
    clearTimeout(tickTimer); tickTimer = setTimeout(tick, 30000);
  }

  /* ---------- static text ---------- */
  function staticText() {
    var P = (I.pages && I.pages[LANG]) || {};
    $$("[data-i18n]").forEach(function (el) {
      if (!origHTML.has(el)) origHTML.set(el, el.innerHTML);
      var k = el.getAttribute("data-i18n");
      var U = LANG !== "en" && I.ui[LANG] ? I.ui[LANG][k] : null;
      el.innerHTML = LANG === "en" ? origHTML.get(el) : P[k] != null ? P[k] : U != null ? esc(U) : origHTML.get(el);
    });
    $$("[data-i18n-ph]").forEach(function (el) {
      if (!el.hasAttribute("data-ph-en")) el.setAttribute("data-ph-en", el.getAttribute("placeholder") || "");
      var k = el.getAttribute("data-i18n-ph");
      el.setAttribute("placeholder", LANG === "en" || P[k] == null ? el.getAttribute("data-ph-en") : P[k]);
    });
    document.documentElement.lang = I.htmlLang[LANG];
    var tk = document.body.getAttribute("data-title");
    if (tk) { var tt = t("title_" + tk); document.title = (tt && tt !== "title_" + tk ? tt + " | " : "") + t("siteName"); }
  }
  function setLang(l) {
    if (LANGS.indexOf(l) < 0 || l === LANG) return;
    LANG = l;
    try { localStorage.setItem("archives_lang", l); } catch (e) {}
    var u = new URL(location.href);
    if (u.searchParams.has("lang")) { u.searchParams.delete("lang"); history.replaceState(null, "", u.pathname + (u.search || "") + u.hash); }
    render();
  }

  /* ---------- reading-room status (home slip) ---------- */
  function rrSlips() {
    var r = rr();
    $$("[data-rr]").forEach(function (el) { el.innerHTML = t(el.getAttribute("data-rr"), { m: r.mName, mIn: r.mIn, nm: r.nmName, nmIn: r.nmIn, nmFrom: r.nmFrom, y: r.y, ny: r.ny }); });
  }

  /* ---------- home ---------- */
  function allItems(data) {
    var out = [];
    data.exhibitions.forEach(function (ex) { ex.items.forEach(function (it) { if (it.ref && it.ref.f && window.FAX && FAX.has(it.fx)) out.push({ ex: ex, it: it }); }); });
    return out;
  }
  function exCard(ex) {
    var first = ex.items[0];
    return '<a class="ex-card" href="/exhibition.html?id=' + encodeURIComponent(ex.id) + '"><div class="thumb" aria-hidden="true">' + (window.FAX ? FAX.render(first.fx) : "") + "</div>" +
      '<div class="body"><div class="k">' + esc(fondsLabel(ex.fonds)) + "</div><h3>" + esc(tri(ex.title)) + "</h3><p>" + esc(tri(ex.sub)) + "</p></div></a>";
  }
  function fondsLabel(list) { return t(list.length > 1 ? "fondsShortPl" : "fondsShort", { n: list.join(", ") }); }
  function home() {
    getJSON("/data/fonds.json").then(function (d) {
      var el = $("#statFonds"); if (el) el.textContent = d.fonds.length;
    }).catch(function () {});
    getJSON("/data/exhibitions.json").then(function (data) {
      var items = allItems(data), n = iradNow(), pick = items[(n.getFullYear() * 12 + n.getMonth()) % items.length];
      var box = $("#dotm");
      if (box && pick) {
        box.innerHTML = '<div class="kicker">' + esc(t("dotmK")) + '</div><div class="facs-wrap">' + FAX.render(pick.it.fx) + "</div>" +
          '<p class="small" style="margin:10px 0 0"><b>' + esc(tri(pick.it.title)) + "</b>, " + esc(bi(pick.it.date)) + '<br><span class="mono">' + esc(refLine(pick.it.ref)) + '</span><br><a href="/exhibition.html?id=' + encodeURIComponent(pick.ex.id) + "#" + pick.it.fx + '">' + esc(t("dotmMore", { ex: tri(pick.ex.title) })) + "</a></p>";
      }
      var list = $("#exHome");
      if (list) list.innerHTML = data.exhibitions.slice().sort(function (a, b) { return a.since < b.since ? 1 : -1; }).slice(0, 3).map(exCard).join("");
    }).catch(function () { var b = $("#dotm"); if (b) b.innerHTML = '<p class="muted">' + esc(t("loadFail")) + "</p>"; });
  }

  /* ---------- guide to the fonds ---------- */
  var fState = { period: "all", access: "all", q: "" };
  function accLabel(a) { return '<span class="acc ' + a + '">' + esc(t("acc_" + a)) + "</span>"; }
  function fondsPage() {
    var host = $("#fonds"); if (!host) return;
    getJSON("/data/fonds.json").then(function (d) {
      var bar = $("#ffilters");
      bar.innerHTML =
        '<div class="chips" role="group" aria-label="' + esc(t("fPeriod")) + '">' + ["all"].concat(d.periods).map(function (p) { return '<button type="button" class="chip" data-p="' + p + '" aria-pressed="' + (fState.period === p) + '">' + esc(t("per_" + p)) + "</button>"; }).join("") + "</div>" +
        '<div class="chips" role="group" aria-label="' + esc(t("fAccess")) + '">' + ["all", "open", "restricted"].map(function (a) { return '<button type="button" class="chip" data-a="' + a + '" aria-pressed="' + (fState.access === a) + '">' + esc(t("accF_" + a)) + "</button>"; }).join("") + "</div>" +
        '<input type="search" id="fq" value="' + esc(fState.q) + '" placeholder="' + esc(t("fSearch")) + '" aria-label="' + esc(t("fSearch")) + '"><span class="fcount" id="fcount"></span>';
      $$("[data-p]", bar).forEach(function (b) { b.addEventListener("click", function () { fState.period = b.getAttribute("data-p"); fondsPage(); }); });
      $$("[data-a]", bar).forEach(function (b) { b.addEventListener("click", function () { fState.access = b.getAttribute("data-a"); fondsPage(); }); });
      $("#fq").addEventListener("input", function () { fState.q = this.value; drawFonds(d); });
      drawFonds(d);
      var cl = $("#colls");
      if (cl) cl.innerHTML = d.collections.map(function (c) {
        return '<div class="icard"><div class="top"><span class="fno">' + esc(t("collK")) + '</span><span class="dates">' + esc(c.dates) + "</span></div><h3>" + esc(tri(c.title)) + '</h3><div class="more"><p>' + esc(bi(c.desc)) + "</p></div></div>";
      }).join("");
    }).catch(function () { host.innerHTML = '<p class="muted">' + esc(t("loadFail")) + "</p>"; });
  }
  function drawFonds(d) {
    var host = $("#fonds"), q = fState.q.trim().toLowerCase(), shown = 0, html = "";
    var hash = (location.hash || "").replace("#f", "");
    d.periods.forEach(function (p) {
      if (fState.period !== "all" && fState.period !== p) return;
      var list = d.fonds.filter(function (f) {
        if (f.period !== p) return false;
        if (fState.access === "open" && f.access !== "open") return false;
        if (fState.access === "restricted" && f.access === "open") return false;
        if (q) {
          var hay = (f.n + " " + f.title.en + " " + tri(f.title) + " " + f.desc.en + " " + bi(f.desc) + " " + f.dates).toLowerCase();
          if (hay.indexOf(q) < 0) return false;
        }
        return true;
      }).sort(function (a, b) { return a.n - b.n; });
      if (!list.length) return;
      shown += list.length;
      html += '<h2 class="period-h">' + esc(t("per_" + p)) + "<span>" + esc(t("perRange_" + p)) + '</span></h2><div class="cards">' + list.map(function (f) {
        var open = String(f.n) === hash;
        return '<article class="icard' + (open ? " hl" : "") + '" id="f' + f.n + '"><div class="top"><span class="fno">' + esc(t("fondN", { n: f.n })) + '</span><span class="dates">' + esc(f.dates === "June 1956" ? t("june1956") : f.dates) + "</span></div>" +
          '<h3><a href="#f' + f.n + '">' + esc(tri(f.title)) + "</a></h3>" +
          '<div class="meta">' + accLabel(f.access) + " · " + esc(t("fExtent", { o: f.opisi, u: f.units.toLocaleString(LANG === "en" ? "en-GB" : "ru-RU") })) + "</div>" +
          "<details" + (open ? " open" : "") + "><summary>" + esc(t("fMore")) + '</summary><div class="more"><p>' + esc(bi(f.desc)) + "</p>" +
          (f.exhibition ? '<p><a href="/exhibition.html?id=' + f.exhibition + '">' + esc(t("fSeeEx")) + "</a></p>" : "") +
          (f.access !== "open" && f.access !== "rule30" ? '<p><a href="/closed-shelf.html">' + esc(t("fSeeClosed")) + "</a></p>" : "") +
          '<p class="cite">' + esc(t("fCite", { n: f.n })) + "</p></div></details></article>";
      }).join("") + "</div>";
    });
    host.innerHTML = html || '<p class="muted">' + esc(t("noneFound")) + "</p>";
    var c = $("#fcount"); if (c) c.textContent = t("fCount", { n: shown, all: d.fonds.length });
    if (hash) { var el = document.getElementById("f" + hash); if (el && !drawFonds.done) { drawFonds.done = true; setTimeout(function () { el.scrollIntoView({ block: "center" }); }, 60); } }
  }

  /* ---------- reading room ---------- */
  function readingPage() {
    var plan = $("#seats");
    if (plan) {
      var h = "";
      for (var i = 1; i <= 24; i++) {
        var mf = i > 20, oos = i === 22 || i === 9;
        h += '<div class="seat' + (mf ? " mf" : "") + (oos ? " oos" : " taken") + '" title="' + esc(oos ? t("seatOos") : t("seatTaken")) + '">' + (mf ? "M" + (i - 20) : i) + "</div>";
      }
      plan.innerHTML = h;
    }
    var f = $("#bookForm"); if (!f || f.dataset.bound) return;
    f.dataset.bound = "1";
    var r = rr(), di = $("#bkDate", f);
    if (di) { di.min = r.y + "-" + pad(r.m) + "-" + pad(r.d); di.max = r.y + "-" + pad(r.m) + "-" + pad(r.last); }
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var x = rr(), out = $("#bkResult");
      out.innerHTML = '<div class="stampmsg">' + esc(t("bkNo")) + "<small>" + esc(t("bkTry")) + "</small></div>" +
        '<p class="muted small">' + esc(t("bkNote", { nmFrom: x.nmFrom, nm: x.nmName })) + "</p>";
      out.scrollIntoView({ block: "nearest" });
    });
  }

  /* ---------- copies and certificates ---------- */
  var cState = { step: 1 };
  function copiesPage() {
    var host = $("#copyFlow"); if (!host) return;
    getJSON("/data/fees.json").then(function (fees) {
      var tb = $("#feeTable");
      if (tb) tb.innerHTML = "<thead><tr><th>" + esc(t("feeService")) + "</th><th>" + esc(t("feeUnit")) + '</th><th style="text-align:right">' + esc(t("feeSom")) + "</th></tr></thead><tbody>" +
        fees.services.map(function (s) { return "<tr><td>" + esc(tri(s.label)) + (s.note ? '<br><span class="muted small">' + esc(bi(s.note)) + "</span>" : "") + "</td><td>" + esc(tri(s.unit)) + '</td><td class="num">' + (s.id === "scan" ? "—" : som(s.som)) + "</td></tr>"; }).join("") + "</tbody>";
      drawCopy(fees);
    }).catch(function () { host.innerHTML = '<p class="muted">' + esc(t("loadFail")) + "</p>"; });
  }
  function stepsBar(n) {
    return '<ol class="steps">' + [1, 2, 3].map(function (i) { return '<li class="' + (i === n ? "on" : i < n ? "done" : "") + '">' + esc(t("cStep" + i)) + "</li>"; }).join("") + "</ol>";
  }
  function drawCopy(fees) {
    var host = $("#copyFlow"), s = cState;
    if (s.step === 1) {
      host.innerHTML = stepsBar(1) + '<form class="form" id="cf1" novalidate>' +
        '<div class="row"><label for="cType">' + esc(t("cType")) + '</label><select id="cType">' + fees.services.filter(function (x) { return x.id !== "scan"; }).map(function (x) { return '<option value="' + x.id + '"' + (s.type === x.id ? " selected" : "") + ">" + esc(tri(x.label)) + "</option>"; }).join("") + "</select></div>" +
        '<div class="row"><label>' + esc(t("cRef")) + '</label><div class="refs">' +
        ["f", "op", "d", "l"].map(function (k) { return '<label style="font-weight:400"><span>' + esc(t("ref_" + k)) + '</span><input type="text" inputmode="numeric" id="cr_' + k + '" value="' + esc((s.ref || {})[k] || "") + '"></label>'; }).join("") + "</div></div>" +
        '<div class="hint">' + esc(t("cRefHint")) + "</div>" +
        '<div class="row"><label for="cSheets">' + esc(t("cSheets")) + '</label><input type="number" id="cSheets" min="1" max="200" value="' + (s.sheets || 1) + '"></div>' +
        '<div class="row"><label for="cCert">' + esc(t("cCert")) + '</label><select id="cCert"><option value="0">' + esc(t("no")) + '</option><option value="1"' + (s.cert ? " selected" : "") + ">" + esc(t("yes")) + "</option></select></div>" +
        '<div class="row"><label for="cPurpose">' + esc(t("cPurpose")) + '</label><select id="cPurpose">' + ["research", "pension", "property", "family", "other"].map(function (p) { return '<option value="' + p + '"' + (s.purpose === p ? " selected" : "") + ">" + esc(t("pur_" + p)) + "</option>"; }).join("") + "</select></div>" +
        '<div class="actions"><button class="btn" type="submit">' + esc(t("cNext")) + '</button></div><p class="muted small" id="cErr" role="alert"></p></form>';
      $("#cf1").addEventListener("submit", function (e) {
        e.preventDefault();
        s.type = $("#cType").value; s.sheets = Math.max(1, Math.min(200, parseInt($("#cSheets").value, 10) || 1)); s.cert = $("#cCert").value === "1"; s.purpose = $("#cPurpose").value;
        s.ref = {}; ["f", "op", "d", "l"].forEach(function (k) { s.ref[k] = $("#cr_" + k).value.trim(); });
        var svc = fees.services.filter(function (x) { return x.id === s.type; })[0];
        if (svc.needsRef && (!s.ref.f || !s.ref.op || !s.ref.d)) { $("#cErr").textContent = t("cErrRef"); return; }
        s.step = 2; drawCopy(fees);
      });
    } else if (s.step === 2) {
      var svc = fees.services.filter(function (x) { return x.id === s.type; })[0];
      var base = svc.perSheet ? svc.som * s.sheets : svc.som, cert = s.cert ? fees.certification : 0;
      if (svc.id === "pension" && s.purpose === "pension") base = 0;
      var total = base + cert;
      if (!s.no) { var n = iradNow(); s.no = "КЗ-" + n.getFullYear() + "/" + String(1000 + (n.getMonth() * 731 + n.getDate() * 37 + n.getHours() * 11 + n.getMinutes()) % 9000); }
      host.innerHTML = stepsBar(2) + '<div class="form"><h3>' + esc(t("cSummary")) + '</h3><table class="ledger"><tbody>' +
        "<tr><td>" + esc(t("cType")) + "</td><td>" + esc(tri(svc.label)) + "</td></tr>" +
        (svc.needsRef ? "<tr><td>" + esc(t("cRef")) + '</td><td class="mono">' + esc(refLine({ f: s.ref.f, op: s.ref.op, d: s.ref.d, l: s.ref.l || "" })) + "</td></tr>" : "") +
        "<tr><td>" + esc(t("cSheets")) + "</td><td>" + s.sheets + "</td></tr>" +
        "<tr><td>" + esc(t("cCost")) + '</td><td class="mono">' + som(base) + (cert ? " + " + som(cert) + " (" + esc(t("cCertShort")) + ")" : "") + " = <b>" + som(total) + " " + esc(t("somUnit")) + "</b></td></tr>" +
        "<tr><td>" + esc(t("cNo")) + '</td><td class="mono"><b>' + esc(s.no) + "</b></td></tr></tbody></table>" +
        '<p style="margin-top:14px">' + t("cPay") + "</p><p>" + t("cDelivery") + "</p>" +
        '<div class="actions"><button class="btn ghost" type="button" id="cBack">' + esc(t("cBack")) + '</button><button class="btn" type="button" id="cGo">' + esc(t("cNext")) + "</button></div></div>";
      $("#cBack").addEventListener("click", function () { s.step = 1; drawCopy(fees); });
      $("#cGo").addEventListener("click", function () { s.step = 3; drawCopy(fees); });
    } else {
      host.innerHTML = stepsBar(3) + '<div class="form"><h3>' + esc(t("cSaeH")) + "</h3><p>" + t("cSae") + "</p>" +
        '<div class="envelope" aria-label="' + esc(t("cEnvAlt")) + '"><div class="from">' + t("cEnvFrom") + '</div><div class="stampbox">' + esc(t("cEnvStamp")) + '</div><div class="to">' + t("cEnvTo") + '</div><div class="no">' + esc(t("cEnvNo", { no: s.no })) + "</div></div>" +
        '<p class="small muted">' + esc(t("cEnvNote")) + "</p>" +
        '<div class="stampmsg ink">' + esc(t("cDone")) + "<small>" + esc(t("cDoneS")) + "</small></div>" +
        '<div class="actions"><button class="btn ghost" type="button" id="cNew">' + esc(t("cNew")) + "</button></div></div>";
      $("#cNew").addEventListener("click", function () { cState = { step: 1 }; drawCopy(fees); });
    }
  }

  /* ---------- genealogy desk ---------- */
  function genPage() {
    var f = $("#genForm"); if (!f) return;
    function calc() {
      var where = $("#gWhere").value, when = $("#gWhen").value, known = $("#gKnown").value, lang = $("#gLang").value, out = $("#genResult");
      if (where === "atr") { out.innerHTML = '<div class="stampmsg ink">' + esc(t("gAtr")) + "<small>" + esc(t("gAtrS")) + "</small></div>"; return; }
      if (when === "after1991") { out.innerHTML = '<div class="stampmsg ink">' + esc(t("gAfter")) + "<small>" + esc(t("gAfterS")) + "</small></div>"; return; }
      var base = { pre1917: [14, 20], y1917: [11, 16], soviet: [8, 13] }[when];
      var lo = base[0], hi = base[1], notes = [];
      if (known === "no") { lo += 6; hi += 9; notes.push(t("gNoteUnknown")); }
      if (where === "abroad") { lo += 3; hi += 4; notes.push(t("gNoteAbroad")); }
      if (lang === "en") { lo += 2; hi += 3; notes.push(t("gNoteEn")); }
      if (when === "pre1917") notes.push(t("gNotePre"));
      var fonds = { pre1917: "3, 21", y1917: "21, 175, 236", soviet: "207, 236, 288" }[when];
      out.innerHTML = '<div class="stampmsg">' + esc(t("gWait", { lo: lo, hi: hi })) + "<small>" + esc(t("gWaitS")) + "</small></div>" +
        '<p class="small"><b>' + esc(t("gFonds")) + "</b> " + esc(fonds) + "</p>" + (notes.length ? '<ul class="small">' + notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>" : "");
    }
    if (!f.dataset.bound) { f.dataset.bound = "1"; f.addEventListener("submit", function (e) { e.preventDefault(); calc(); }); }
    if ($("#genResult").innerHTML) calc();
  }

  /* ---------- exhibitions ---------- */
  function exList() {
    var host = $("#exList"); if (!host) return;
    getJSON("/data/exhibitions.json").then(function (data) {
      host.innerHTML = data.exhibitions.map(exCard).join("");
    }).catch(function () { host.innerHTML = '<p class="muted">' + esc(t("loadFail")) + "</p>"; });
  }
  function exPage() {
    var host = $("#exhibit"); if (!host) return;
    var id = qs.get("id");
    getJSON("/data/exhibitions.json").then(function (data) {
      var list = data.exhibitions, idx = -1;
      for (var i = 0; i < list.length; i++) if (list[i].id === id) idx = i;
      if (idx < 0) { host.innerHTML = '<div class="nf"><h1>' + esc(t("exMissing")) + '</h1><p><a href="/exhibitions.html">' + esc(t("exAll")) + "</a></p></div>"; return; }
      var ex = list[idx];
      document.title = tri(ex.title) + " | " + t("siteName");
      var h = '<div class="crumbs"><a href="/">' + esc(t("nav_home")) + '</a> › <a href="/exhibitions.html">' + esc(t("nav_exhibitions")) + "</a></div>" +
        '<div class="page-h"><div><div class="kicker">' + esc(t("exK")) + "</div><h1>" + esc(tri(ex.title)) + '</h1><p class="lead" style="margin:6px 0 0">' + esc(tri(ex.sub)) + '</p></div><span class="ref">' + esc(fondsLabel(ex.fonds)) + "</span></div>" +
        '<div class="ex-intro"><div class="prose"><p>' + esc(bi(ex.intro)) + "</p></div>" +
        '<div class="card tone small"><p style="margin:0 0 6px"><b>' + esc(t("exItems", { n: ex.items.length })) + "</b></p><p style=\"margin:0 0 6px\">" + esc(t("exSince", { d: fmtDate(+ex.since.slice(0, 4), +ex.since.slice(5, 7), +ex.since.slice(8, 10)) })) + '</p><p style="margin:0">' + esc(t("exCopyNote")) + "</p></div></div>";
      ex.items.forEach(function (it) {
        var ref = it.ref && it.ref.f ? '<div class="cat-ref">' + esc(t("exRef")) + ": " + esc(refLine(it.ref, "en")) + '<span class="ru">' + esc(refLine(it.ref, "ru")) + "</span></div>" : (it.ref && it.ref.note ? '<div class="cat-ref">' + esc(bi(it.ref.note)) + "</div>" : "");
        h += '<section class="item" id="' + esc(it.fx) + '"><div class="facs" data-fx="' + esc(it.fx) + '" role="button" tabindex="0" aria-label="' + esc(t("exZoom")) + '">' + FAX.render(it.fx) + '<span class="zoom">' + esc(t("exZoom")) + "</span></div>" +
          "<div><h2>" + esc(tri(it.title)) + '</h2><div class="date">' + esc(bi(it.date)) + "</div>" + ref + "<p>" + esc(bi(it.caption)) + "</p>" +
          (it.text ? '<details class="tr"><summary>' + esc(t(LANG === "ru" ? "exTrRu" : "exTr")) + '</summary><div class="tx">' + esc(bi(it.text)) + "</div></details>" : "") + "</div></section>";
      });
      var prev = list[(idx - 1 + list.length) % list.length], next = list[(idx + 1) % list.length];
      h += '<div class="ex-nav"><a href="/exhibition.html?id=' + prev.id + '">‹ ' + esc(tri(prev.title)) + '</a><a href="/exhibitions.html">' + esc(t("exAll")) + '</a><a href="/exhibition.html?id=' + next.id + '">' + esc(tri(next.title)) + " ›</a></div>";
      host.innerHTML = h;
      $$(".facs[data-fx]", host).forEach(function (el) {
        var open = function () { lightbox(el.getAttribute("data-fx"), el.parentNode.querySelector("h2").textContent); };
        el.addEventListener("click", open);
        el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      });
      if (location.hash && !exPage.jumped) { exPage.jumped = true; var tg = document.getElementById(location.hash.slice(1)); if (tg) setTimeout(function () { tg.scrollIntoView(); }, 80); }
    }).catch(function () { host.innerHTML = '<p class="muted">' + esc(t("loadFail")) + "</p>"; });
  }
  function lightbox(fx, cap) {
    var lb = $("#lb");
    if (!lb) { lb = document.createElement("div"); lb.id = "lb"; lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); document.body.appendChild(lb); }
    lb.innerHTML = '<button type="button">' + esc(t("close")) + ' ✕</button><div class="inner">' + FAX.render(fx) + '<p class="cap">' + esc(cap) + "</p></div>";
    lb.classList.add("open");
    var close = function () { lb.classList.remove("open"); document.removeEventListener("keydown", key); };
    var key = function (e) { if (e.key === "Escape") close(); };
    $("button", lb).addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", key);
    $("button", lb).focus();
  }

  /* ---------- closed shelf ---------- */
  function closedPage() {
    var host = $("#revList"); if (!host) return;
    getJSON("/data/closed.json").then(function (d) {
      var shelf = $("#shelf");
      if (shelf) shelf.innerHTML = d.records.map(function (r) { return '<div class="box" style="height:' + (78 + (r.fond || 9) % 5 * 8) + 'px"><div class="lab">' + esc(r.fond ? "Ф. " + r.fond : "ОЭЗИ") + "<br>" + esc(r.dates) + '</div><div class="tape">' + esc(t("tape")) + "</div></div>"; }).join("");
      host.innerHTML = d.records.map(function (r) {
        return '<li><h3>' + (r.fond ? '<a href="/fonds.html#f' + r.fond + '">' + esc(t("fondN", { n: r.fond })) + "</a> · " : "") + esc(tri(r.title)) + ' <span class="muted small mono">' + esc(r.dates) + "</span></h3>" +
          "<p style=\"margin:4px 0 6px\">" + esc(bi(r.scope)) + '</p><div class="st">' + esc(t("revStatus")) + " · " + esc(t("revSince", { y: r.since })) + " · " + esc(t("revEnd")) + "</div></li>";
      }).join("");
    }).catch(function () { host.innerHTML = '<li class="muted">' + esc(t("loadFail")) + "</li>"; });
    var f = $("#regForm");
    if (f && !f.dataset.bound) {
      f.dataset.bound = "1";
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var n = iradNow(), no = "КР-" + n.getFullYear() + "/" + String(4000 + (n.getMonth() * 211 + n.getDate() * 17 + n.getHours() * 7 + n.getMinutes()) % 5000);
        $("#regResult").innerHTML = '<div class="stampmsg ink">' + esc(t("regDone", { no: no })) + "<small>" + esc(t("regDoneS")) + "</small></div>";
      });
    }
  }

  /* ---------- render ---------- */
  function render() {
    chrome(); staticText(); rrSlips();
    if (PAGE === "home") home();
    if (PAGE === "fonds") fondsPage();
    if (PAGE === "reading") readingPage();
    if (PAGE === "copies") copiesPage();
    if (PAGE === "genealogy") genPage();
    if (PAGE === "exhibitions") exList();
    if (PAGE === "exhibition") exPage();
    if (PAGE === "closed") closedPage();
    $$("[data-ic]").forEach(function (el) { if (!el.firstChild || el.firstChild.nodeName !== "svg") el.insertAdjacentHTML("afterbegin", IC[el.getAttribute("data-ic")] || ""); });
  }
  render();
})();
