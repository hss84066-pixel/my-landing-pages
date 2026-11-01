/* 天命藍圖：免費版 6 頁報告 */
(function () {
  'use strict';
  var B = window.Blueprint, CH = window.BlueprintCharts, T = window.BlueprintTexts, CFG = window.BLUEPRINT_CONFIG || {};
  var ZH = { sun: '太陽', moon: '月亮', mercury: '水星', venus: '金星', mars: '火星', jupiter: '木星', saturn: '土星', uranus: '天王星', neptune: '海王星', pluto: '冥王星', nnode: '北交點' };
  var EL_COL = ['#e28a5e', '#86cfe0', '#a0a8d8', '#79c2cf'], MODE_COL = ['#e2735e', '#c8a35f', '#5c8fa0'];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function decode(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return JSON.parse(decodeURIComponent(escape(atob(s)))); }
  function sign(l) { return Math.floor(l / 30); }
  function deg(l) { var d = CH.dm(l); return d[0] + '°' + CH.pad(d[1]) + '′'; }
  function pg(id, hdR, inner, n, foot) {
    return '<section class="page in" id="' + id + '"><div class="hd"><span>天命藍圖</span><span>' + hdR + '</span></div>' + inner +
      '<div class="ft"><span>' + esc(foot) + '</span><span class="pn">' + CH.pad(n) + '</span></div></section>';
  }

  function render(inp) {
    var r = B.compute(inp), pos = r.pos, hd = r.hd, h = r.houses;
    var sS = sign(pos.sun.lon), mS = sign(pos.moon.lon), aS = sign(h.asc);
    var TY = T.TYPE[hd.type], AU = T.AUTH[hd.authority];
    var name = inp.n || '你';
    // 元素與模式
    var el = [0, 0, 0, 0], md = [0, 0, 0];
    ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].map(function (k) { return pos[k].lon; }).concat([h.asc]).forEach(function (l) { var s = sign(l); el[s % 4]++; md[s % 3]++; });
    var maxE = el.indexOf(Math.max.apply(null, el)), minE = el.indexOf(Math.min.apply(null, el));
    var hc = {}; ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].forEach(function (k) { hc[pos[k].house] = (hc[pos[k].house] || 0) + 1; });
    var topH = Object.keys(hc).sort(function (a, b) { return hc[b] - hc[a] || a - b; }).slice(0, 2).map(Number).sort(function (a, b) { return a - b; });
    var lat = inp.lat, lon = inp.lon;
    var coord = Math.abs(lat).toFixed(4) + '°' + (lat >= 0 ? 'N' : 'S') + ' · ' + Math.abs(lon).toFixed(4) + '°' + (lon >= 0 ? 'E' : 'W') + ' · ' + r.utc.toISOString().slice(0, 16) + 'Z';
    var dateStr = inp.y + '.' + CH.pad(inp.m) + '.' + CH.pad(inp.d), timeStr = CH.pad(inp.h) + ':' + CH.pad(inp.mi);
    var P = [];

    // 1 封面
    P.push('<section class="page cover" id="top"><div class="cover-base"></div><div class="cv-art">' + CH.gateWheel(r) + '</div>' +
      '<div class="cv-top">占星本命盤 × 人類圖</div>' +
      '<h1 class="cv-title">天命<span>藍圖</span></h1><div class="cv-en">CELESTIAL BLUEPRINT</div><div class="cv-coord">' + coord + '</div>' +
      '<div class="cv-info"><div><span class="k">姓名</span><span class="v">' + esc(name) + '</span></div>' +
      '<div><span class="k">出生</span><span class="v">' + dateStr + '<br>' + timeStr + ' ' + esc(inp.c || '') + '</span></div>' +
      '<div><span class="k">日 · 月 · 升</span><span class="v">' + T.SIGNS[sS] + ' · ' + T.SIGNS[mS] + '<br>' + T.SIGNS[aS] + '</span></div>' +
      '<div><span class="k">人類圖</span><span class="v">' + TY.name + '<br>' + hd.profile + '</span></div>' +
      '<div><span class="k">解讀者</span><span class="v">' + esc(CFG.reader || CFG.brand || '') + '</span></div></div>' +
      '<div class="cv-foot">' + new Date().getFullYear() + '</div></section>');

    // 2 本命星盤
    var rowsA = ['sun','moon','mercury','venus','mars','jupiter'], rowsB = ['saturn','uranus','neptune','pluto','nnode'];
    function row(k) { var p = pos[k]; return '<tr><td>' + ZH[k] + '</td><td>' + T.SIGNS[sign(p.lon)] + '</td><td class="mono">' + deg(p.lon) + (p.retro && k !== 'nnode' ? ' R' : '') + '</td><td class="mono">' + p.house + '</td></tr>'; }
    var th = '<tr><th>行星</th><th>星座</th><th>度數</th><th>宮</th></tr>';
    P.push(pg('natal', '本命星盤',
      '<div class="part"><b>01</b>天空的語言</div><h1>本命<span class="t">星盤</span></h1>' +
      '<p class="key">' + T.STRONG[T.ELEMENTS[maxE]].split('：')[0] + '，行星最集中在第 ' + topH.join('、') + ' 宮（' + topH.map(function (x) { return T.HOUSE[x - 1]; }).join('；') + '）。這是你這一生投入最多能量的地方。</p>' +
      '<figure class="fig" style="max-width:132mm;margin-inline:auto;"><figcaption class="fig-cap"><span><b>FIG.01</b> · NATAL CHART</span><span>TROPICAL · PLACIDUS</span></figcaption>' + CH.natal(r) +
      '<div class="legend"><span><i class="sw tri"></i>三分相</span><span><i class="sw sx"></i>六分相</span><span><i class="sw sq"></i>四分／對分</span><span>粗線＝四軸</span><span class="mono">ʀ＝逆行</span></div></figure>' +
      '<div class="tables2"><table class="dt">' + th + rowsA.map(row).join('') + '</table><table class="dt">' + th + rowsB.map(row).join('') +
      '<tr><td>上升</td><td>' + T.SIGNS[aS] + '</td><td class="mono">' + deg(h.asc) + '</td><td class="mono">1</td></tr><tr><td>天頂</td><td>' + T.SIGNS[sign(h.mc)] + '</td><td class="mono">' + deg(h.mc) + '</td><td class="mono">10</td></tr></table></div>',
      2, '01 · 天空的語言'));

    // 3 人類圖
    var defN = ['無定義', '單一定義', '二分定義', '三分定義', '四分定義'][hd.definition] || '多重定義';
    var openZh = hd.open.map(function (c) { return T.CENTER_ZH[c]; }).join('、') || '無';
    var items = [['類型', TY.name], ['策略', TY.strategy], ['內在權威', AU.name], ['人生角色', hd.profile + ' ' + T.LINE[hd.pLine].n + '・' + T.LINE[hd.dLine].n],
      ['輪迴交叉', T.ANGLE[hd.angle].split('（')[0] + ' ' + hd.cross[0] + '/' + hd.cross[1] + ' | ' + hd.cross[2] + '/' + hd.cross[3]], ['定義', defN],
      ['非自己', TY.notself], ['標誌', TY.sig], ['開放中心', openZh]];
    P.push(pg('design', '人類圖總覽',
      '<div class="part"><b>02</b>身體的設計</div><h1>人類圖<span class="t">總覽</span></h1><p class="key">' + TY.t + '</p>' +
      '<figure class="fig" style="max-width:118mm;margin-inline:auto;"><figcaption class="fig-cap"><span><b>FIG.02</b> · BODYGRAPH</span><span>DESIGN ⟷ PERSONALITY</span></figcaption>' + CH.bodygraph(hd) +
      '<div class="legend"><span><i class="sw p"></i>個性（意識）</span><span><i class="sw d"></i>設計（潛意識）</span><span><i class="sw b"></i>兩者皆有</span></div></figure>' +
      '<div class="sumgrid">' + items.map(function (x) { return '<div><span class="k">' + x[0] + '</span><span class="v">' + esc(x[1]) + '</span></div>'; }).join('') + '</div>' +
      '<p style="margin-top:3mm;"><b>' + hd.profile + ' 人生角色：</b>有意識的你' + T.LINE[hd.pLine].t + '；潛意識裡的你' + T.LINE[hd.dLine].t + '。</p>',
      3, '02 · 身體的設計'));

    // 4 核心三角
    function bars(arr, names, cols) { var mx = Math.max.apply(null, arr) || 1; return arr.map(function (v, i) { return '<div class="bar-r"><span>' + names[i] + '</span><div class="tr"><div class="fl" style="width:' + Math.round(v / Math.max(5, mx) * 100) + '%;background:' + cols[i] + ';"></div></div><span class="mono">' + v + '</span></div>'; }).join(''); }
    var weak = el[minE] <= 1 ? '<div class="box warm"><h3>' + T.ELEMENTS[minE] + '元素偏少</h3><p>' + T.WEAK[T.ELEMENTS[minE]] + '</p></div>' : '<div class="box"><h3>元素分布均衡</h3><p>' + T.STRONG[T.ELEMENTS[maxE]] + '</p></div>';
    var sg = B.gateOf(pos.sun.lon);
    P.push(pg('triad', '核心三角',
      '<h1 style="margin-top:0;">核心<span class="t">三角</span></h1><p class="key">太陽決定你「是誰」，月亮決定你「需要什麼」，上升決定你「如何被看見」。</p>' +
      '<div class="g3">' +
      '<div class="trio" style="background:var(--earth);"><div class="lb">太陽 · 身份</div><div class="big">' + T.SIGNS[sS] + '太陽</div><div class="dg">' + deg(pos.sun.lon) + ' · 第 ' + pos.sun.house + ' 宮</div><p>' + T.SUN[sS].t + '落在第 ' + pos.sun.house + ' 宮，這份特質特別展現在「' + T.HOUSE[pos.sun.house - 1] + '」。</p></div>' +
      '<div class="trio" style="background:var(--air);"><div class="lb">月亮 · 需要</div><div class="big">' + T.SIGNS[mS] + '月亮</div><div class="dg">' + deg(pos.moon.lon) + ' · 第 ' + pos.moon.house + ' 宮</div><p>' + T.MOON[mS] + '</p></div>' +
      '<div class="trio" style="background:var(--deep);"><div class="lb">上升 · 被看見</div><div class="big">' + T.SIGNS[aS] + '上升</div><div class="dg">' + deg(h.asc) + '</div><p>' + T.ASC[aS] + '</p></div></div>' +
      '<h2>元素與模式</h2><div class="bars"><div>' + bars(el, T.ELEMENTS, EL_COL) + '</div><div>' + bars(md, T.MODES, MODE_COL) + '<p class="mono" style="font-size:8pt;color:var(--mute);margin-top:1mm;">十大行星＋上升，共 11 點</p></div></div>' + weak +
      '<div class="box"><h3>兩套系統的第一個交會</h3><p>你的太陽在' + T.SIGNS[sS] + ' ' + deg(pos.sun.lon) + '，在人類圖裡對應第 <span class="mono">' + sg.gate + '</span> 號閘門第 <span class="mono">' + sg.line + '</span> 爻。同一個黃道度數，在兩套系統裡說著不同的語言；完整版會把每一顆行星並排解讀。</p></div>',
      4, '01 · 天空的語言'));

    // 5 一頁使用說明書
    var firstOpen = T.OPEN_ORDER.filter(function (c) { return hd.open.indexOf(c) >= 0; })[0];
    var kw = [T.SUN[sS].kw, TY.kw, T.SUN[mS].kw].filter(function (v, i, a) { return a.indexOf(v) === i; });
    P.push(pg('manual', '一頁使用說明書',
      '<div class="part"><b>03</b>使用說明書</div><h1>一頁<span class="t">使用說明書</span></h1><p class="key">把前面的內容濃縮成一張卡。存在手機裡，迷惘時拿出來看。</p>' +
      '<div class="card"><div class="ttl">' + TY.name + '</div><div class="sub">' + T.SIGNS[sS] + '太陽 · ' + T.SIGNS[mS] + '月亮 · ' + T.SIGNS[aS] + '上升 ｜ ' + AU.name + ' · ' + hd.profile + '</div><div class="rule"></div><dl>' +
      '<dt>DECIDE</dt><dd>' + AU.t + '</dd><dt>ENGAGE</dt><dd>' + TY.engage + '</dd>' +
      '<dt>GIFTS</dt><dd>① ' + T.SUN[sS].gift + '<br>② ' + TY.gift + '</dd>' +
      '<dt>WATCH</dt><dd>① 感到「' + TY.notself + '」時，代表你偏離了自己的設計。' + (firstOpen ? '<br>② 開放' + T.CENTER_ZH[firstOpen] + '中心：' + T.OPEN[firstOpen] : '') + '</dd>' +
      '<dt>REST</dt><dd>' + TY.rest + '</dd></dl><div class="rule"></div><div class="sub">人生關鍵字</div><div class="kw">' + kw.join(' · ') + '</div></div>',
      5, '03 · 使用說明書'));

    // 6 升級
    function offer(o, main) {
      if (!o) return '';
      var btn = o.url ? '<a class="btn ' + (main ? 'btn-main' : 'btn-ghost') + '" href="' + esc(o.url) + '" target="_blank" rel="noopener">' + esc(o.cta || (main ? '升級完整版' : '預約諮詢')) + '</a>' : '<span class="btn ' + (main ? 'btn-main' : 'btn-ghost') + '" aria-disabled="true">即將開放</span>';
      return '<div class="offer' + (main ? ' main' : '') + '"><h3>' + esc(o.title) + '</h3>' + (o.price ? '<div class="price">' + esc(o.price) + '</div>' : '') + (o.keyword ? '<p class="howto">到官方 LINE 輸入<span class="kw-chip">' + esc(o.keyword) + '</span>' + esc(o.desc || '') + '</p>' : '<ul>' + (o.points || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>') + btn + '</div>';
    }
    var tj = r.transit;
    P.push(pg('upgrade', '下一步',
      '<div class="part"><b>04</b>下一步</div><h1>這是你藍圖的<span class="t">前 6 頁</span></h1>' +
      '<div class="tease"><p>此刻，木星正經過你的<b>第 ' + tj.jupiter + ' 宮（' + T.HOUSE[tj.jupiter - 1] + '）</b>，這是 12 年一次在這個領域擴展的時機；土星在你的<b>第 ' + tj.saturn + ' 宮（' + T.HOUSE[tj.saturn - 1] + '）</b>，提醒你在這裡打穩基礎。完整版會告訴你接下來 12 個月，愛情、事業、人際、家庭與身心各自要注意什麼。</p></div>' +
      '<h2>完整版還包含</h2><ul class="full-list">' + ['星盤資料表與相位表', '宮位與關鍵相位解讀', '月交點：靈魂的來處與去向', '通道與開放中心完整解讀', '星盤 × 人類圖合成對照輪', '雙系統逐星對照', '未來 12 個月的實際行運', '未來一年總結：愛情、事業、人際、家庭、身心', '解讀師親筆的開場信', '專屬的結語與祝福'].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '<div class="offers">' + offer(CFG.upgrade, true) + offer(CFG.consult, false) + '</div>' +
      '<div class="legal"><h3>使用須知與免責聲明</h3><dl>' + T.DISCLAIMER.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + x[1] + '</dd>'; }).join('') + '</dl></div>',
      6, '04 · 下一步'));
    return P.join('');
  }

  function boot() {
    var root = document.getElementById('report'), raw = location.hash.slice(1);
    try {
      if (!raw) throw new Error('empty');
      var inp = decode(raw);
      ['y','m','d','h','mi','lat','lon'].forEach(function (k) { if (typeof inp[k] !== 'number' || !isFinite(inp[k])) throw new Error('bad ' + k); });
      if (!inp.tz) throw new Error('tz');
      root.innerHTML = render(inp);
      document.title = (inp.n ? inp.n + '的' : '') + '天命藍圖';
    } catch (e) {
      root.innerHTML = '<section class="page in"><h1>找不到報告資料</h1><p>這個連結不完整或已損壞。請回到首頁重新填寫，報告會再寄到你的信箱。</p><p><a class="btn btn-main" href="./">回到首頁</a></p></section>';
      if (window.console) console.error(e);
    }
  }
  var pb = document.getElementById('print'); if (pb) pb.addEventListener('click', function () { window.print(); });
  window.addEventListener('hashchange', boot);
  boot();
  window.BlueprintReport = { render: render };
})();
