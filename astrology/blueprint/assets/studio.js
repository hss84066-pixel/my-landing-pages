/* 天命藍圖：內部版（解讀師工作台）。輸入生日 → 完整專業報告書，可直接編修文字後列印成 PDF。 */
(function () {
  'use strict';
  var B = window.Blueprint, CH = window.BlueprintCharts, T = window.BlueprintTexts, CFG = window.BLUEPRINT_CONFIG || {}, CITIES = window.BLUEPRINT_CITIES;
  var N = window.BlueprintNarrative;
  var ZH = { sun: '太陽', moon: '月亮', mercury: '水星', venus: '金星', mars: '火星', jupiter: '木星', saturn: '土星', uranus: '天王星', neptune: '海王星', pluto: '冥王星', nnode: '北交點', snode: '南交點', earth: '地球', asc: '上升', mc: '天頂' };
  var EL_COL = ['#e28a5e', '#86cfe0', '#a0a8d8', '#79c2cf'], MODE_COL = ['#e2735e', '#c8a35f', '#5c8fa0'];
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function encode(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function decode(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return JSON.parse(decodeURIComponent(escape(atob(s)))); }
  function sign(l) { return Math.floor(l / 30); }
  function deg(l) { var d = CH.dm(l); return d[0] + '°' + CH.pad(d[1]) + '′'; }
  function ymd(d) { return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); }
  var pageNo = 0;
  function pg(id, hdR, inner, foot, cls) {
    pageNo++;
    return '<section class="page in' + (cls ? ' ' + cls : '') + '" id="' + id + '"><div class="hd"><span>天命藍圖</span><span>' + hdR + '</span></div>' + inner +
      '<div class="ft"><span>' + esc(foot) + '</span><span class="pn">' + CH.pad(pageNo) + '</span></div></section>';
  }
  function note(key, html) { return '<div class="note" contenteditable="true" data-note="' + key + '" spellcheck="false">' + html + '</div>'; }

  // ---------- 表單 ----------
  var sel = $('city');
  CITIES.forEach(function (g) {
    var og = document.createElement('optgroup'); og.label = g[0];
    g[1].forEach(function (c) { var o = document.createElement('option'); o.value = JSON.stringify(c); o.textContent = c[0]; og.appendChild(o); });
    sel.appendChild(og);
  });
  var oo = document.createElement('option'); oo.value = 'other'; oo.textContent = '其他城市（自行輸入經緯度）'; sel.appendChild(oo);
  sel.value = JSON.stringify(CITIES[0][1][0]);
  var tzSel = $('tz');
  (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['Asia/Taipei']).forEach(function (z) { var o = document.createElement('option'); o.value = z; o.textContent = z; tzSel.appendChild(o); });
  tzSel.value = 'Asia/Taipei';
  sel.addEventListener('change', function () { $('other').hidden = sel.value !== 'other'; });
  $('reader').value = CFG.reader || CFG.brand || '';

  function readForm() {
    var d = $('bdate').value, t = $('btime').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !/^\d{2}:\d{2}/.test(t)) return null;
    var place;
    if (sel.value === 'other') {
      var la = parseFloat($('lat').value), lo = parseFloat($('lon').value);
      if (!isFinite(la) || !isFinite(lo)) return null;
      place = [$('cityname').value.trim() || '自訂地點', la, lo, tzSel.value];
    } else place = JSON.parse(sel.value);
    var p = d.split('-').map(Number), q = t.split(':').map(Number);
    return { n: $('name').value.trim(), y: p[0], m: p[1], d: p[2], h: q[0], mi: q[1], c: place[0], lat: place[1], lon: place[2], tz: place[3], r: $('reader').value.trim() };
  }
  function fillForm(inp) {
    $('name').value = inp.n || ''; $('bdate').value = inp.y + '-' + CH.pad(inp.m) + '-' + CH.pad(inp.d); $('btime').value = CH.pad(inp.h) + ':' + CH.pad(inp.mi);
    if (inp.r) $('reader').value = inp.r;
    var match = null; CITIES.forEach(function (g) { g[1].forEach(function (c) { if (c[0] === inp.c && Math.abs(c[1] - inp.lat) < 1e-3) match = c; }); });
    if (match) { sel.value = JSON.stringify(match); $('other').hidden = true; }
    else { sel.value = 'other'; $('other').hidden = false; $('cityname').value = inp.c || ''; $('lat').value = inp.lat; $('lon').value = inp.lon; tzSel.value = inp.tz; }
  }

  // ---------- 報告 ----------
  function build(inp) {
    pageNo = 0;
    var r = B.compute(inp), pos = r.pos, hd = r.hd, h = r.houses;
    var sS = sign(pos.sun.lon), mS = sign(pos.moon.lon), aS = sign(h.asc), TY = T.TYPE[hd.type], AU = T.AUTH[hd.authority];
    var name = inp.n || '個案', reader = inp.r || CFG.reader || '';
    var KEYS10 = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
    var el = [0, 0, 0, 0], md = [0, 0, 0];
    KEYS10.map(function (k) { return pos[k].lon; }).concat([h.asc]).forEach(function (l) { var s = sign(l); el[s % 4]++; md[s % 3]++; });
    var maxE = el.indexOf(Math.max.apply(null, el)), minE = el.indexOf(Math.min.apply(null, el));
    var hc = {}; KEYS10.forEach(function (k) { hc[pos[k].house] = (hc[pos[k].house] || 0) + 1; });
    var topH = Object.keys(hc).sort(function (a, b) { return hc[b] - hc[a] || a - b; }).slice(0, 3).map(Number);
    var coord = Math.abs(inp.lat).toFixed(4) + '°' + (inp.lat >= 0 ? 'N' : 'S') + ' · ' + Math.abs(inp.lon).toFixed(4) + '°' + (inp.lon >= 0 ? 'E' : 'W') + ' · ' + r.utc.toISOString().slice(0, 16) + 'Z';
    var dateStr = inp.y + '.' + CH.pad(inp.m) + '.' + CH.pad(inp.d), timeStr = CH.pad(inp.h) + ':' + CH.pad(inp.mi);
    var P = [];

    // 封面
    P.push('<section class="page cover" id="top"><div class="cover-base"></div><div class="cv-art">' + CH.gateWheel(r) + '</div>' +
      '<div class="cv-top">占星本命盤 × 人類圖</div><span class="free-tag" style="background:var(--gold);">完整版</span>' +
      '<h1 class="cv-title">天命<span>藍圖</span></h1><div class="cv-en">CELESTIAL BLUEPRINT</div><div class="cv-coord">' + coord + '</div>' +
      '<div class="cv-info"><div><span class="k">姓名</span><span class="v">' + esc(name) + '</span></div>' +
      '<div><span class="k">出生</span><span class="v">' + dateStr + '<br>' + timeStr + ' ' + esc(inp.c || '') + '</span></div>' +
      '<div><span class="k">日 · 月 · 升</span><span class="v">' + T.SIGNS[sS] + ' · ' + T.SIGNS[mS] + '<br>' + T.SIGNS[aS] + '</span></div>' +
      '<div><span class="k">人類圖</span><span class="v">' + TY.name + '<br>' + hd.profile + '</span></div>' +
      '<div><span class="k">解讀者</span><span class="v">' + esc(reader) + '</span></div></div><div class="cv-foot">' + new Date().getFullYear() + '</div></section>');
    pageNo = 1;

    // 致你的一封信
    var startD = new Date(); startD.setHours(0, 0, 0, 0);
    var evAll = B.transitYear(r, startD, 366);
    P.push(pg('letter', '寫給你', '<div class="part"><b>00</b>序</div><h1>寫給<span class="t">' + esc(name) + '</span></h1>' +
      note('letter', N.letter(r, inp, evAll).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '<p style="text-align:right;">' + esc(reader) + '</p>'), '序'));

    // 本命星盤
    P.push(pg('natal', '本命星盤', '<div class="part"><b>01</b>天空的語言</div><h1>本命<span class="t">星盤</span></h1>' +
      '<p class="key">' + T.STRONG[T.ELEMENTS[maxE]].split('：')[0] + '；行星最集中的宮位：' + topH.map(function (x) { return '第 ' + x + ' 宮（' + T.HOUSE[x - 1] + '）'; }).join('、') + '。</p>' +
      '<figure class="fig" style="max-width:150mm;margin-inline:auto;"><figcaption class="fig-cap"><span><b>FIG.01</b> · NATAL CHART</span><span>TROPICAL · PLACIDUS</span></figcaption>' + CH.natal(r) +
      '<div class="legend"><span><i class="sw tri"></i>三分相</span><span><i class="sw sx"></i>六分相</span><span><i class="sw sq"></i>四分／對分</span><span>粗線＝四軸</span><span class="mono">ʀ＝逆行</span></div></figure>', '01 · 天空的語言'));

    // 星盤資料表
    var rows = KEYS10.concat(['nnode']).map(function (k) {
      var p = pos[k], g = hd.P[k], d = hd.D[k];
      return '<tr><td>' + ZH[k] + '</td><td>' + T.SIGNS[sign(p.lon)] + '</td><td class="mono">' + deg(p.lon) + (p.retro && k !== 'nnode' ? ' R' : '') + '</td><td class="mono">' + p.house + '</td><td class="mono">' + g.gate + '.' + g.line + '</td><td class="mono" style="color:var(--coral);">' + d.gate + '.' + d.line + '</td></tr>';
    }).join('') + '<tr><td>上升</td><td>' + T.SIGNS[aS] + '</td><td class="mono">' + deg(h.asc) + '</td><td class="mono">1</td><td></td><td></td></tr><tr><td>天頂</td><td>' + T.SIGNS[sign(h.mc)] + '</td><td class="mono">' + deg(h.mc) + '</td><td class="mono">10</td><td></td><td></td></tr>';
    var cus = h.cusps.map(function (c, i) { return '<div><span class="mono" style="color:var(--cyan);">' + CH.pad(i + 1) + '</span><span>' + T.SIGNS[sign(c)] + '</span><span class="mono">' + deg(c) + '</span></div>'; }).join('');
    P.push(pg('data', '星盤資料表', '<h1 style="margin-top:0;">星盤<span class="t">資料表</span></h1><p class="key">行星度數、宮位，以及同一顆行星在人類圖的閘門與爻（白＝個性・意識，紅＝設計・潛意識）。</p>' +
      '<table class="dt"><tr><th>行星</th><th>星座</th><th>度數</th><th>宮</th><th>個性閘門</th><th>設計閘門</th></tr>' + rows + '</table>' +
      '<div class="datacols"><figure class="fig"><figcaption class="fig-cap"><span><b>FIG.02</b> · ASPECT GRID</span><span>ORB ±6° · ☉☽ ±8°</span></figcaption>' + CH.aspectGrid(r) + '</figure>' +
      '<div><h2>宮首 <span class="mono" style="font-size:8pt;color:var(--mute);">PLACIDUS</span></h2><div class="cusps">' + cus + '</div></div></div>', '01 · 天空的語言'));

    // 核心三角
    function bars(arr, names, cols) { var mx = Math.max.apply(null, arr) || 1; return arr.map(function (v, i) { return '<div class="bar-r"><span>' + names[i] + '</span><div class="tr"><div class="fl" style="width:' + Math.round(v / Math.max(5, mx) * 100) + '%;background:' + cols[i] + ';"></div></div><span class="mono">' + v + '</span></div>'; }).join(''); }
    P.push(pg('triad', '核心三角', '<h1 style="margin-top:0;">核心<span class="t">三角</span></h1><p class="key">太陽決定「是誰」，月亮決定「需要什麼」，上升決定「如何被看見」。</p><div class="g3">' +
      '<div class="trio" style="background:var(--earth);"><div class="lb">太陽 · 身份</div><div class="big">' + T.SIGNS[sS] + '太陽</div><div class="dg">' + deg(pos.sun.lon) + ' · 第 ' + pos.sun.house + ' 宮</div><p>' + T.SUN[sS].t + '落在第 ' + pos.sun.house + ' 宮，特別展現在「' + T.HOUSE[pos.sun.house - 1] + '」。</p></div>' +
      '<div class="trio" style="background:var(--air);"><div class="lb">月亮 · 需要</div><div class="big">' + T.SIGNS[mS] + '月亮</div><div class="dg">' + deg(pos.moon.lon) + ' · 第 ' + pos.moon.house + ' 宮</div><p>' + T.MOON[mS] + '</p></div>' +
      '<div class="trio" style="background:var(--deep);"><div class="lb">上升 · 被看見</div><div class="big">' + T.SIGNS[aS] + '上升</div><div class="dg">' + deg(h.asc) + '</div><p>' + T.ASC[aS] + '</p></div></div>' +
      '<h2>元素與模式</h2><div class="bars"><div>' + bars(el, T.ELEMENTS, EL_COL) + '</div><div>' + bars(md, T.MODES, MODE_COL) + '</div></div>' +
      (el[minE] <= 1 ? '<div class="box warm"><h3>' + T.ELEMENTS[minE] + '元素偏少</h3><p>' + T.WEAK[T.ELEMENTS[minE]] + '</p></div>' : '<div class="box"><h3>元素分布</h3><p>' + T.STRONG[T.ELEMENTS[maxE]] + '</p></div>'), '01 · 天空的語言'));

    // 相位清單
    var ASPZ = { conj: '合', sext: '六分', sq: '四分', tri: '三分', opp: '對分' };
    var aspRows = r.aspects.slice().sort(function (a, b) { return a.orb - b.orb; }).map(function (x) {
      var hard = x.type === 'sq' || x.type === 'opp';
      return '<tr><td>' + ZH[x.a] + ' — ' + ZH[x.b] + '</td><td><span class="pill' + (hard ? ' hard' : '') + '">' + ASPZ[x.type] + '</span></td><td class="mono">' + x.orb.toFixed(1) + '°</td><td>' + (hard ? '張力：需要整合的課題' : x.type === 'conj' ? '融合：兩股能量一起作用' : '和諧：容易發揮的天賦') + '</td></tr>';
    }).join('');
    P.push(pg('aspects', '宮位與相位', '<h1 style="margin-top:0;">宮位與<span class="t">相位</span></h1>' +
      '<h2>月交點軸線</h2><p>南交點在' + T.SIGNS[sign(pos.snode.lon)] + '座第 ' + pos.snode.house + ' 宮（舒適區：' + T.HOUSE[pos.snode.house - 1] + '）；北交點在' + T.SIGNS[sign(pos.nnode.lon)] + '座第 ' + pos.nnode.house + ' 宮（成長方向：' + T.HOUSE[pos.nnode.house - 1] + '）。</p>' +
      '<h2>主要相位（依容許度排序）</h2><table class="dt"><tr><th>相位</th><th>類型</th><th>容許度</th><th>性質</th></tr>' + aspRows + '</table>' +
      '<h2>關鍵相位解讀</h2>' + note('aspects', N.keyAspects(r).map(function (x) { return '<p><b>' + esc(x[0]) + '</b>　' + esc(x[1]) + '</p>'; }).join('')), '01 · 天空的語言'));

    // 人類圖
    var defN = ['無定義', '單一定義', '二分定義', '三分定義', '四分定義'][hd.definition] || '多重定義';
    var items = [['類型', TY.name], ['策略', TY.strategy], ['內在權威', AU.name], ['人生角色', hd.profile + ' ' + T.LINE[hd.pLine].n + '・' + T.LINE[hd.dLine].n],
      ['輪迴交叉', T.ANGLE[hd.angle].split('（')[0] + ' ' + hd.cross[0] + '/' + hd.cross[1] + ' | ' + hd.cross[2] + '/' + hd.cross[3]], ['定義', defN],
      ['非自己', TY.notself], ['標誌', TY.sig], ['開放中心', hd.open.map(function (c) { return T.CENTER_ZH[c]; }).join('、') || '無']];
    P.push(pg('design', '人類圖總覽', '<div class="part"><b>02</b>身體的設計</div><h1>人類圖<span class="t">總覽</span></h1><p class="key">' + TY.t + '</p>' +
      '<figure class="fig" style="max-width:128mm;margin-inline:auto;"><figcaption class="fig-cap"><span><b>FIG.03</b> · BODYGRAPH</span><span>DESIGN ' + ymd(r.design.date) + '</span></figcaption>' + CH.bodygraph(hd) +
      '<div class="legend"><span><i class="sw p"></i>個性（意識）</span><span><i class="sw d"></i>設計（潛意識）</span><span><i class="sw b"></i>兩者皆有</span></div></figure>' +
      '<div class="sumgrid">' + items.map(function (x) { return '<div><span class="k">' + x[0] + '</span><span class="v">' + esc(x[1]) + '</span></div>'; }).join('') + '</div>', '02 · 身體的設計'));

    // 通道與開放中心
    var ch = hd.channels.map(function (c) {
      var a = Math.min(c[0], c[1]), b = Math.max(c[0], c[1]), k = a + '-' + b;
      var src = (hd.pset[c[0]] && hd.pset[c[1]] ? '個性' : '') + (hd.dset[c[0]] && hd.dset[c[1]] ? (hd.pset[c[0]] && hd.pset[c[1]] ? '＋設計' : '設計') : '') || '個性／設計混合';
      return '<div class="box"><h3><span class="mono" style="color:var(--gold);">' + k + '</span>　' + (T.CHANNEL[k] || '') + '通道 <span style="font-size:8.6pt;color:var(--mute);font-weight:500;">' + T.CENTER_ZH[B.G2C[a]] + ' ⟷ ' + T.CENTER_ZH[B.G2C[b]] + ' · ' + src + '</span></h3></div>';
    }).join('') || '<p>沒有完整的通道（反映者）。</p>';
    var opens = T.OPEN_ORDER.filter(function (c) { return hd.open.indexOf(c) >= 0; }).map(function (c) { return '<tr><td>' + T.CENTER_ZH[c] + '</td><td style="white-space:normal;">' + T.OPEN[c] + '</td></tr>'; }).join('');
    P.push(pg('channels', '通道與開放中心', '<h1 style="margin-top:0;">通道與<span class="t">開放中心</span></h1><h2>啟動的通道</h2>' + ch +
      '<h2>開放中心</h2><table class="dt"><tr><th style="width:22mm;">中心</th><th>容易放大的＆一句提醒</th></tr>' + opens + '</table>' +
      '<p style="margin-top:3mm;"><b>' + hd.profile + ' 人生角色：</b>有意識的你' + T.LINE[hd.pLine].t + '；潛意識裡的你' + T.LINE[hd.dLine].t + '。</p>', '02 · 身體的設計'));

    // 合成對照輪
    P.push(pg('mandala', '合成對照輪', '<div class="part"><b>03</b>交會</div><h1>合成<span class="t">對照輪</span></h1><p class="key">外圈是人類圖的 64 閘門輪，往內是黃道、Placidus 宮位，以及個性（白）與設計（紅）兩組行星，中心是人類圖。同一個度數，既是星座的度數，也是閘門的位置。</p>' +
      '<figure class="fig"><figcaption class="fig-cap"><span><b>FIG.04</b> · SYNTHESIS WHEEL</span><span>64 GATES × ZODIAC × HOUSES</span></figcaption>' + CH.mandala(r) +
      '<div class="legend"><span><i class="sw p"></i>個性</span><span><i class="sw d"></i>設計</span><span><i class="sw b"></i>兩者</span><span class="mono">23.2＝閘門 23・第 2 爻</span></div></figure>', '03 · 交會'));

    // 雙系統對照
    var cmp = ['sun','earth','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','nnode'].map(function (k) {
      var p = pos[k], g = hd.P[k];
      return '<tr><td>' + ZH[k] + '</td><td>' + T.SIGNS[sign(p.lon)] + ' · 第 ' + houseOf(p.lon) + ' 宮</td><td class="mono">' + g.gate + '.' + g.line + '</td><td style="white-space:normal;">' + T.HOUSE[houseOf(p.lon) - 1] + '</td></tr>';
    }).join('');
    function houseOf(l) { return B.houseOf(l, h.cusps); }
    P.push(pg('compare', '雙系統對照', '<h1 style="margin-top:0;">同一顆星，<span class="t">兩種語言</span></h1><table class="dt"><tr><th>行星</th><th>占星：星座 · 宮位</th><th>人類圖閘門</th><th>宮位主題</th></tr>' + cmp + '</table>' +
      '<h2>三組關鍵對照</h2>' + note('compare', N.compare(r).map(function (x) { return '<p><b>' + esc(x[0]) + '</b>　' + esc(x[1]) + '</p>'; }).join('')), '03 · 交會'));

    // 未來 12 個月
    var start = new Date(); start.setHours(0, 0, 0, 0);
    var ev = B.transitYear(r, start, 366).filter(function (e) {
      if (e.kind === 'station') return ['mercury', 'venus', 'mars', 'jupiter', 'saturn'].indexOf(e.body) >= 0;
      if (e.kind === 'aspect') return e.body !== 'mars' || e.type === 'conj' || e.type === 'opp';
      return true;
    });
    var TRZ = { mars: '火星', jupiter: '木星', saturn: '土星', uranus: '天王星', neptune: '海王星', pluto: '冥王星', mercury: '水星', venus: '金星' };
    var evRows = ev.map(function (e) {
      var when = ymd(e.start) + (e.end - e.start > 864e5 ? ' – ' + ymd(e.end) : ''), what, mean;
      if (e.kind === 'aspect') { what = TRZ[e.body] + T.TR_ASP[e.type] + '本命' + ZH[e.natal]; mean = T.TR_PLANET[e.body] + ' × ' + T.TR_POINT[e.natal] + '（' + T.TR_TONE[e.type] + '）'; }
      else if (e.kind === 'eclipse') { what = (e.solar ? '日蝕' : '月蝕') + ' ' + T.SIGNS[sign(e.lon)] + ' ' + Math.floor(e.lon % 30) + '°（第 ' + e.house + ' 宮）'; mean = (e.solar ? '新的開始：' : '收成與釋放：') + T.HOUSE[e.house - 1]; }
      else if (e.kind === 'station') { what = TRZ[e.body] + (e.retro ? '逆行' : '恢復順行') + '（第 ' + e.house + ' 宮）'; mean = (e.retro ? '回顧與修正：' : '重新前進：') + T.HOUSE[e.house - 1]; }
      else { what = TRZ[e.body] + '進入第 ' + e.house + ' 宮'; mean = '接下來的主題：' + T.HOUSE[e.house - 1]; }
      return '<tr><td class="mono" style="white-space:nowrap;">' + when + '</td><td style="white-space:normal;">' + what + '</td><td style="white-space:normal;">' + mean + '</td></tr>';
    }).join('');
    P.push(pg('transits', '未來 12 個月', '<div class="part"><b>04</b>時間</div><h1>未來 12 個月的<span class="t">天空</span></h1><p class="key">從 ' + ymd(start) + ' 起算的實際行運：外行星與本命點的相位、日月蝕、逆行與宮位變化。</p>' +
      '<table class="dt tr-table"><tr><th style="width:36mm;">時間</th><th>天象</th><th>對個案的意義</th></tr>' + evRows + '</table>', '04 · 時間', 'flow'));

    // 未來一年總結（自動解讀）
    var areaHtml = N.AREAS.map(function (k) {
      var x = N.area(k, r, evAll);
      return '<div class="dom"><h2>' + x.name + '</h2>' + note('area-' + k,
        '<p><b>你的本質</b>　' + esc(x.nat) + '</p><p><b>這一年的趨勢</b>　' + esc(x.trend) + '</p><p><b>具體建議</b></p><ul>' +
        x.tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' + (x.timing ? '<p class="timing">' + esc(x.timing).replace(/\n/g, '<br>') + '</p>' : '')) + '</div>';
    }).join('');
    P.push(pg('year', '未來一年總結', '<h1 style="margin-top:0;">未來一年<span class="t">總結</span></h1><p class="key">根據你的本命盤，以及從 ' + ymd(startD) + ' 起未來 12 個月的實際行運，整理出五個生活面向的趨勢與具體建議。行運描述的是傾向與時機，不是注定的結果，怎麼運用由你決定。</p>' + areaHtml, '04 · 時間', 'flow'));

    // 使用說明書
    var firstOpen = T.OPEN_ORDER.filter(function (c) { return hd.open.indexOf(c) >= 0; })[0];
    var kw = [T.SUN[sS].kw, TY.kw, T.SUN[mS].kw].filter(function (v, i, a) { return a.indexOf(v) === i; });
    P.push(pg('manual', '一頁使用說明書', '<div class="part"><b>05</b>使用說明書</div><h1>一頁<span class="t">使用說明書</span></h1>' +
      '<div class="card"><div class="ttl">' + TY.name + '</div><div class="sub">' + T.SIGNS[sS] + '太陽 · ' + T.SIGNS[mS] + '月亮 · ' + T.SIGNS[aS] + '上升 ｜ ' + AU.name + ' · ' + hd.profile + '</div><div class="rule"></div><dl>' +
      '<dt>DECIDE</dt><dd>' + AU.t + '</dd><dt>ENGAGE</dt><dd>' + TY.engage + '</dd><dt>GIFTS</dt><dd>① ' + T.SUN[sS].gift + '<br>② ' + TY.gift + '</dd>' +
      '<dt>WATCH</dt><dd>① 感到「' + TY.notself + '」時，代表偏離了自己的設計。' + (firstOpen ? '<br>② 開放' + T.CENTER_ZH[firstOpen] + '中心：' + T.OPEN[firstOpen] : '') + '</dd>' +
      '<dt>REST</dt><dd>' + TY.rest + '</dd></dl><div class="rule"></div><div class="sub">人生關鍵字</div><div class="kw" contenteditable="true" data-note="keywords">' + kw.join(' · ') + '</div></div>', '05 · 使用說明書'));

    // 祝福
    P.push(pg('blessing', '結語與祝福', '<div class="part"><b>06</b>結語</div><h1>結語與<span class="t">祝福</span></h1>' +
      note('blessing', '<div class="poem">' + N.blessing(r).map(function (l) { return l ? esc(l) : '&nbsp;'; }).join('<br>') + '</div>') +
      '<p style="text-align:center;margin-top:8mm;color:var(--gold);" class="mono">— ' + esc(reader) + '</p>', '06 · 結語'));

    // 使用須知與免責聲明
    var dl = T.DISCLAIMER.slice(0, 5).concat([T.DISCLAIMER_PRO], T.DISCLAIMER.slice(5));
    P.push(pg('legal', '使用須知與免責聲明', '<h1 style="margin-top:0;">使用須知與<span class="t">免責聲明</span></h1><p class="key">請在閱讀本報告前，先了解以下內容。</p>' +
      '<div class="legal big"><dl>' + dl.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + x[1] + '</dd>'; }).join('') + '</dl></div>', '附錄'));
    return P.join('');
  }

  // ---------- 筆記：存在這台電腦的瀏覽器 ----------
  var storeKey = '';
  var STORE = 'bp-notes-v2:';
  function loadNotes() {
    document.querySelectorAll('[data-note]').forEach(function (el) {
      try { var v = localStorage.getItem(storeKey + ':' + el.dataset.note); if (v != null) el.innerHTML = v; } catch (e) {}
      el.addEventListener('input', function () { try { localStorage.setItem(storeKey + ':' + el.dataset.note, el.innerHTML); } catch (e) {} });
    });
  }
  function render(inp) {
    var root = $('report');
    try {
      root.innerHTML = build(inp);
      storeKey = STORE + [inp.y, inp.m, inp.d, inp.h, inp.mi, inp.lat.toFixed(2), inp.n].join('-');
      loadNotes();
      document.title = (inp.n ? inp.n + '的' : '') + '天命藍圖（完整版）';
      $('status').textContent = '已產生 ' + root.querySelectorAll('section.page').length + ' 頁完整報告，解讀文字已自動寫好。想調整語氣，直接點文字修改即可；完成後按「列印／存成 PDF」。';
    } catch (e) { $('status').textContent = '產生失敗：' + e.message; if (window.console) console.error(e); }
  }
  $('studio-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = readForm(); if (!inp) { $('status').textContent = '請確認出生日期、時間與地點。'; return; }
    history.replaceState(null, '', '#' + encode(inp)); render(inp);
    document.getElementById('top').scrollIntoView({ behavior: 'smooth' });
  });
  $('print').addEventListener('click', function () { window.print(); });
  $('clear').addEventListener('click', function () {
    if (!storeKey) return;
    Object.keys(localStorage).forEach(function (k) { if (k.indexOf(storeKey + ':') === 0) localStorage.removeItem(k); });
    var inp = readForm(); if (inp) render(inp);
  });
  if (location.hash.length > 1) { try { var inp0 = decode(location.hash.slice(1)); fillForm(inp0); render(inp0); } catch (e) {} }
})();
