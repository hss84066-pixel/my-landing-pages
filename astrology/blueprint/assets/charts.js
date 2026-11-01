/* 天命藍圖：SVG 圖表（觀測站配色） */
(function (root) {
  'use strict';
  var B = root.Blueprint;
  var C = { ink: '#e6e9f2', des: '#e2735e', paper: '#131931', inner: '#161c35', line: '#323c63', line2: '#3b4670', mute: '#9aa3bf', mute2: '#b3bad2', onMark: '#11162b',
    fire: '#e28a5e', earth: '#86cfe0', air: '#a0a8d8', water: '#79c2cf', gold: '#c8a35f', brown: '#8f7a58', cyan: '#86cfe0' };
  var EL = ['fire', 'earth', 'air', 'water'];
  var SG = '♈♉♊♋♌♍♎♏♐♑♒♓';
  var MONO = "IBM Plex Mono, ui-monospace, monospace", SYM = "Noto Sans Symbols, Segoe UI Symbol, DejaVu Sans, sans-serif";
  var GL = { moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇', nnode: '☊', snode: '☋' };
  function f(v) { return v.toFixed(1); }
  function mkPt(asc) { return function (lon, r) { var t = (180 + (lon - asc)) * Math.PI / 180; return [r * Math.cos(t), -r * Math.sin(t)]; }; }
  function dm(l) { var x = l % 30, d = Math.floor(x), m = Math.round((x - d) * 60); if (m === 60) { d++; m = 0; } return [d, m]; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function glyph(k, x, y, size, color) {
    if (k === 'sun') return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + (size * .36).toFixed(1) + '" fill="none" stroke="' + color + '" stroke-width="' + (size * .09).toFixed(2) + '"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + (size * .09).toFixed(2) + '" fill="' + color + '"/>';
    if (k === 'earth') { var r = size * .36; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r.toFixed(1) + '" fill="none" stroke="' + color + '" stroke-width="' + (size * .09).toFixed(2) + '"/><path d="M' + f(x - r) + ' ' + f(y) + 'H' + f(x + r) + 'M' + f(x) + ' ' + f(y - r) + 'V' + f(y + r) + '" stroke="' + color + '" stroke-width="' + (size * .08).toFixed(2) + '"/>'; }
    return '<text x="' + f(x) + '" y="' + f(y) + '" font-family="' + SYM + '" font-size="' + size + '" font-weight="600" fill="' + color + '" text-anchor="middle" dominant-baseline="central">' + GL[k] + '</text>';
  }
  function spread(items, minsep) {
    items = items.slice().sort(function (a, b) { return a[1] - b[1]; });
    var pos = items.map(function (t) { return t[1]; });
    for (var it = 0; it < 80; it++) {
      var moved = false;
      for (var i = 0; i < pos.length; i++) {
        var j = (i + 1) % pos.length, d = ((pos[j] - pos[i]) % 360 + 360) % 360;
        if (d < minsep) { var sh = (minsep - d) / 2 + .05; pos[i] -= sh; pos[j] += sh; moved = true; }
      }
      if (!moved) break;
    }
    return items.map(function (t, i) { return [t[0], t[1], pos[i]]; });
  }
  function arcSeg(pt, a, b, R1, R2) {
    var p1 = pt(a, R1), p2 = pt(b, R1), p3 = pt(b, R2), p4 = pt(a, R2);
    return 'M' + f(p1[0]) + ',' + f(p1[1]) + ' A' + R1 + ',' + R1 + ' 0 0,0 ' + f(p2[0]) + ',' + f(p2[1]) + ' L' + f(p3[0]) + ',' + f(p3[1]) + ' A' + R2 + ',' + R2 + ' 0 0,1 ' + f(p4[0]) + ',' + f(p4[1]) + 'Z';
  }
  function zodiacRing(S, pt, R1, R2, gsize, grad) {
    for (var i = 0; i < 12; i++) {
      S.push('<path d="' + arcSeg(pt, i * 30, i * 30 + 30, R1, R2) + '" fill="' + C[EL[i % 4]] + '" fill-opacity=".14" stroke="' + C.ink + '" stroke-opacity=".4" stroke-width=".8"/>');
      var g = pt(i * 30 + 15, (R1 + R2) / 2);
      S.push('<text x="' + f(g[0]) + '" y="' + f(g[1]) + '" font-family="' + SYM + '" font-size="' + gsize + '" font-weight="600" fill="' + C[EL[i % 4]] + '" text-anchor="middle" dominant-baseline="central">' + SG[i] + '</text>');
    }
    for (var d = 0; d < 360; d++) {
      var L = d % 10 === 0 ? grad[0] : d % 5 === 0 ? grad[1] : grad[2], a = pt(d, R2), b = pt(d, R2 - L);
      S.push('<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="' + C.ink + '" stroke-opacity="' + (L > grad[2] ? .6 : .3) + '" stroke-width="' + (L === grad[0] ? .9 : .6) + '"/>');
    }
  }
  var ACOL = { conj: C.brown, sext: C.water, tri: C.water, sq: C.des, opp: C.des };
  var KEYS = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','nnode'];

  function natal(r) {
    var asc = r.houses.asc, pt = mkPt(asc), cusps = r.houses.cusps, pos = r.pos, S = [];
    S.push('<svg class="chart-svg" viewBox="-345 -345 690 690" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="本命星盤">');
    S.push('<circle r="292" fill="' + C.paper + '" stroke="' + C.ink + '" stroke-opacity=".8" stroke-width="1.4"/>');
    zodiacRing(S, pt, 292, 252, 21, [10, 6, 3]);
    S.push('<circle r="252" fill="none" stroke="' + C.ink + '" stroke-opacity=".7"/><circle r="152" fill="' + C.inner + '" stroke="' + C.ink + '" stroke-opacity=".45" stroke-width=".8"/><circle r="136" fill="' + C.inner + '" stroke="' + C.ink + '" stroke-opacity=".45" stroke-width=".8"/>');
    cusps.forEach(function (c, i) {
      var ax = [0, 3, 6, 9].indexOf(i) >= 0, a = pt(c, ax ? 306 : 241), b = pt(c, 136);
      S.push('<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="' + C.ink + '" stroke-width="' + (ax ? 1.8 : .7) + '" stroke-opacity="' + (ax ? .95 : .45) + '"/>');
      var nx = cusps[(i + 1) % 12], mid = c + (((nx - c) % 360) + 360) % 360 / 2, t = pt(mid, 144);
      S.push('<text x="' + f(t[0]) + '" y="' + f(t[1]) + '" font-family="' + MONO + '" font-size="9" font-weight="600" fill="' + C.mute + '" text-anchor="middle" dominant-baseline="central">' + (i + 1) + '</text>');
      var dd = dm(c), sg = SG[Math.floor(c / 30)], l = pt(c, ax ? 320 : 306);
      if (ax) {
        var lab = ['ASC', '', '', 'IC', '', '', 'DSC', '', '', 'MC'][i];
        S.push('<text x="' + f(l[0]) + '" y="' + f(l[1] - 6) + '" font-family="' + MONO + '" font-size="10" font-weight="600" fill="' + C.des + '" text-anchor="middle">' + lab + '</text><text x="' + f(l[0]) + '" y="' + f(l[1] + 7) + '" font-family="' + MONO + '" font-size="9" font-weight="500" fill="' + C.ink + '" text-anchor="middle">' + dd[0] + '°<tspan font-family="' + SYM + '">' + sg + '</tspan>' + pad(dd[1]) + '′</text>');
      } else {
        S.push('<text x="' + f(l[0]) + '" y="' + f(l[1]) + '" font-family="' + MONO + '" font-size="8.5" font-weight="500" fill="' + C.mute + '" text-anchor="middle" dominant-baseline="central">' + dd[0] + '<tspan font-family="' + SYM + '">' + sg + '</tspan></text>');
      }
    });
    r.aspects.forEach(function (x) {
      if (x.type === 'conj') return;
      var a = pt(pos[x.a].lon, 136), b = pt(pos[x.b].lon, 136), w = x.orb < 2 ? 1.6 : x.orb < 4 ? 1.1 : .7;
      S.push('<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="' + ACOL[x.type] + '" stroke-width="' + w + '" stroke-opacity=".9"' + (x.type === 'sext' ? ' stroke-dasharray="4 3"' : '') + '/>');
    });
    spread(KEYS.map(function (k) { return [k, pos[k].lon]; }), 9.2).forEach(function (it) {
      var k = it[0], l = it[1], p = it[2], a = pt(l, 252), b = pt(l, 238), c = pt(p, 240);
      S.push('<path d="M' + f(a[0]) + ',' + f(a[1]) + ' L' + f(b[0]) + ',' + f(b[1]) + ' L' + f(c[0]) + ',' + f(c[1]) + '" fill="none" stroke="' + C.ink + '" stroke-width=".7" stroke-opacity=".55"/>');
      var dot = pt(l, 136); S.push('<circle cx="' + f(dot[0]) + '" cy="' + f(dot[1]) + '" r="2.2" fill="' + C.ink + '"/>');
      var g = pt(p, 227); S.push(glyph(k, g[0], g[1], 19, C.ink));
      var dd = dm(l), t1 = pt(p, 203), t2 = pt(p, 184), t3 = pt(p, 166);
      S.push('<text x="' + f(t1[0]) + '" y="' + f(t1[1]) + '" font-family="' + MONO + '" font-size="11.5" font-weight="600" fill="' + C.ink + '" text-anchor="middle" dominant-baseline="central">' + dd[0] + '°</text>');
      S.push('<text x="' + f(t2[0]) + '" y="' + f(t2[1]) + '" font-family="' + SYM + '" font-size="11" font-weight="600" fill="' + C[EL[Math.floor(l / 30) % 4]] + '" text-anchor="middle" dominant-baseline="central">' + SG[Math.floor(l / 30)] + '</text>');
      S.push('<text x="' + f(t3[0]) + '" y="' + f(t3[1]) + '" font-family="' + MONO + '" font-size="8.5" font-weight="500" fill="' + C.mute + '" text-anchor="middle" dominant-baseline="central">' + pad(dd[1]) + '′' + (pos[k].retro && k !== 'nnode' ? 'ʀ' : '') + '</text>');
    });
    S.push('</svg>'); return S.join('');
  }

  // ---------- 人類圖 ----------
  var CENT = { head: ['poly', [[150,14],[185,62],[115,62]]], ajna: ['poly', [[115,84],[185,84],[150,136]]], throat: ['rect', [118,158,64,64]],
    g: ['poly', [[150,253],[192,295],[150,337],[108,295]]], heart: ['poly', [[213,318],[254,300],[248,344]]], spleen: ['poly', [[40,345],[100,385],[40,425]]],
    sp: ['poly', [[260,345],[260,425],[200,385]]], sacral: ['rect', [118,363,64,64]], root: ['rect', [120,440,60,60]] };
  var GP = {64:[132,59],61:[150,59],63:[168,59],47:[132,88],24:[150,88],4:[168,88],17:[134,111],11:[166,111],43:[150,126],
    62:[132,162],23:[150,162],56:[168,162],16:[122,178],20:[122,199],35:[178,173],12:[178,190],45:[178,207],31:[134,218],8:[150,218],33:[166,218],
    1:[150,259],7:[136,268],13:[164,268],10:[114,295],25:[186,295],15:[136,322],2:[150,331],46:[164,322],
    21:[240,307],51:[220,316],26:[229,331],40:[243,336],
    48:[47,350],57:[59,358],44:[71,366],50:[85,375],32:[76,401],28:[64,409],18:[52,417],
    36:[253,350],22:[241,358],37:[229,366],6:[215,375],49:[224,401],55:[236,409],30:[248,417],
    5:[132,367],14:[150,367],29:[168,367],34:[122,386],27:[122,407],59:[178,405],42:[134,423],3:[150,423],9:[166,423],
    53:[134,444],60:[150,444],52:[166,444],54:[124,458],38:[124,473],58:[124,488],19:[176,458],39:[176,473],41:[176,488]};
  var VIA = { '20-34': [[103,292]] };
  var DEFCOL = { head: C.gold, ajna: C.cyan, throat: C.brown, g: C.gold, heart: C.des, spleen: C.brown, sp: C.brown, sacral: C.des, root: C.brown };

  function bodygraph(hd, ox, oy, sc) {
    var S = [], T = function (p) { return [ox + p[0] * sc, oy + p[1] * sc]; };
    function path(pts, col, w, extra) { return '<path d="M' + pts.map(function (p) { var q = T(p); return f(q[0]) + ',' + f(q[1]); }).join(' L') + '" fill="none" stroke="' + col + '" stroke-width="' + (w * sc).toFixed(2) + '" stroke-linejoin="round"' + (extra || '') + '/>'; }
    function pts(c) { return [GP[c[0]]].concat(VIA[c[0] + '-' + c[1]] || [], [GP[c[1]]]); }
    B.CHANNELS.forEach(function (c) { var p = pts(c); S.push(path(p, C.line2, 8.4)); S.push(path(p, C.inner, 6)); });
    function halves(p) {
      var L = [], tot = 0; for (var i = 0; i < p.length - 1; i++) { var l = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); L.push(l); tot += l; }
      var h = tot / 2, acc = 0, first = [p[0]];
      for (var j = 0; j < L.length; j++) {
        if (acc + L[j] >= h) { var t = (h - acc) / L[j], m = [p[j][0] + (p[j + 1][0] - p[j][0]) * t, p[j][1] + (p[j + 1][1] - p[j][1]) * t]; first.push(m); return [first, [m].concat(p.slice(j + 1))]; }
        first.push(p[j + 1]); acc += L[j];
      }
    }
    B.CHANNELS.forEach(function (c) {
      var hv = halves(pts(c));
      [[c[0], hv[0]], [c[1], hv[1]]].forEach(function (x) {
        var g = x[0], seg = x[1], p = hd.pset[g], d = hd.dset[g];
        if (p && d) { S.push(path(seg, C.des, 6)); S.push(path(seg, C.ink, 6, ' stroke-dasharray="' + (3 * sc).toFixed(1) + ' ' + (3 * sc).toFixed(1) + '"')); }
        else if (p) S.push(path(seg, C.ink, 6)); else if (d) S.push(path(seg, C.des, 6));
      });
    });
    Object.keys(CENT).forEach(function (c) {
      var k = CENT[c][0], geo = CENT[c][1], def = hd.defined[c], fill = def ? DEFCOL[c] : C.inner, st = def ? C.ink : C.line2;
      if (k === 'rect') { var q = T([geo[0], geo[1]]); S.push('<rect x="' + f(q[0]) + '" y="' + f(q[1]) + '" width="' + f(geo[2] * sc) + '" height="' + f(geo[3] * sc) + '" rx="' + (4 * sc).toFixed(1) + '" fill="' + fill + '" stroke="' + st + '" stroke-width="' + (1.4 * sc).toFixed(2) + '"/>'); }
      else S.push('<polygon points="' + geo.map(function (p) { var q = T(p); return f(q[0]) + ',' + f(q[1]); }).join(' ') + '" fill="' + fill + '" stroke="' + st + '" stroke-width="' + (1.4 * sc).toFixed(2) + '" stroke-linejoin="round"/>');
    });
    var r = 6.3 * sc;
    Object.keys(GP).forEach(function (gs) {
      var g = +gs, q = T(GP[g]), X = q[0], Y = q[1], p = hd.pset[g], d = hd.dset[g], tc;
      if (p && d) { S.push('<path d="M' + f(X) + ',' + f(Y - r) + ' A' + f(r) + ',' + f(r) + ' 0 0,0 ' + f(X) + ',' + f(Y + r) + 'Z" fill="' + C.des + '"/><path d="M' + f(X) + ',' + f(Y - r) + ' A' + f(r) + ',' + f(r) + ' 0 0,1 ' + f(X) + ',' + f(Y + r) + 'Z" fill="' + C.ink + '"/>'); tc = C.onMark; }
      else if (p) { S.push('<circle cx="' + f(X) + '" cy="' + f(Y) + '" r="' + f(r) + '" fill="' + C.ink + '"/>'); tc = C.onMark; }
      else if (d) { S.push('<circle cx="' + f(X) + '" cy="' + f(Y) + '" r="' + f(r) + '" fill="' + C.des + '"/>'); tc = C.onMark; }
      else { S.push('<circle cx="' + f(X) + '" cy="' + f(Y) + '" r="' + f(r) + '" fill="' + C.inner + '" stroke="' + C.line2 + '" stroke-width="' + (.6 * sc).toFixed(2) + '"/>'); tc = C.mute2; }
      S.push('<text x="' + f(X) + '" y="' + f(Y + .3 * sc) + '" font-family="' + MONO + '" font-size="' + (6.6 * sc).toFixed(1) + '" font-weight="600" fill="' + tc + '" text-anchor="middle" dominant-baseline="central">' + g + '</text>');
    });
    return S.join('');
  }
  var ROWS = ['sun','earth','nnode','snode','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
  function bodygraphFull(hd) {
    var S = ['<svg class="chart-svg" viewBox="0 0 456 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="人類圖">'];
    S.push(bodygraph(hd, 78, 6, 1));
    [[0, C.des, hd.D, 'DESIGN', .12], [378, C.ink, hd.P, 'PERSONALITY', .08]].forEach(function (s) {
      var x0 = s[0], col = s[1], data = s[2];
      S.push('<text x="' + (x0 + 39) + '" y="20" font-family="' + MONO + '" font-size="8" font-weight="600" letter-spacing=".8" fill="' + col + '" text-anchor="middle">' + s[3] + '</text><line x1="' + (x0 + 6) + '" y1="28" x2="' + (x0 + 72) + '" y2="28" stroke="' + col + '"/>');
      ROWS.forEach(function (k, i) {
        var y = 46 + i * 35, g = data[k];
        S.push('<rect x="' + (x0 + 6) + '" y="' + (y - 13) + '" width="66" height="26" rx="3" fill="' + col + '" fill-opacity="' + s[4] + '"/>');
        S.push(glyph(k, x0 + 21, y, 14, col));
        S.push('<text x="' + (x0 + 51) + '" y="' + (y + .5) + '" font-family="' + MONO + '" font-size="11" font-weight="600" fill="' + col + '" text-anchor="middle" dominant-baseline="central">' + g.gate + '.' + g.line + '</text>');
      });
    });
    S.push('</svg>'); return S.join('');
  }

  // ---------- 封面：64 閘門輪（個人化） ----------
  function gateWheel(r) {
    var hd = r.hd, pt = mkPt(r.houses.asc), S = ['<svg class="art-svg" viewBox="-440 -440 880 880" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'];
    S.push('<circle r="430" fill="rgba(13,18,38,.6)" stroke="' + C.ink + '" stroke-opacity=".5" stroke-width="1.2"/>');
    B.ORDER.forEach(function (g, i) {
      var a = 302 + i * 5.625, b = a + 5.625, p = hd.pset[g], d = hd.dset[g];
      if (p && d) S.push('<path d="' + arcSeg(pt, a, b, 428, 408) + '" fill="' + C.ink + '"/><path d="' + arcSeg(pt, a, b, 408, 388) + '" fill="' + C.des + '"/>');
      else S.push('<path d="' + arcSeg(pt, a, b, 428, 388) + '" fill="' + (p ? C.ink : d ? C.des : C.inner) + '"/>');
      S.push('<path d="' + arcSeg(pt, a, b, 428, 388) + '" fill="none" stroke="' + C.ink + '" stroke-opacity=".25" stroke-width=".6"/>');
      var t = pt(a + 2.8125, 408);
      S.push('<text x="' + f(t[0]) + '" y="' + f(t[1]) + '" font-family="' + MONO + '" font-size="12" font-weight="600" fill="' + (p || d ? C.onMark : C.mute) + '" text-anchor="middle" dominant-baseline="central">' + g + '</text>');
    });
    zodiacRing(S, pt, 388, 350, 20, [7, 5, 2.5]);
    S.push('<circle r="350" fill="none" stroke="' + C.ink + '" stroke-opacity=".6"/>');
    [['p', 321, 298, C.ink, hd.P, r.pos], ['d', 270, 246, C.des, hd.D, r.design.pos]].forEach(function (tr) {
      spread(ROWS.map(function (k) { return [k, tr[5][k].lon]; }), 7.4).forEach(function (it) {
        var k = it[0], l = it[1], p = it[2], a = pt(l, 350), b = pt(l, 338), c = pt(p, tr[1] + 12);
        S.push('<path d="M' + f(a[0]) + ',' + f(a[1]) + ' L' + f(b[0]) + ',' + f(b[1]) + ' L' + f(c[0]) + ',' + f(c[1]) + '" fill="none" stroke="' + tr[3] + '" stroke-width=".8" stroke-opacity=".7"/>');
        var m = pt(p, tr[1]); S.push('<circle cx="' + f(m[0]) + '" cy="' + f(m[1]) + '" r="11.5" fill="' + tr[3] + '"/>' + glyph(k, m[0], m[1], 14, C.onMark));
        var g = tr[4][k], t = pt(p, tr[2]);
        S.push('<text x="' + f(t[0]) + '" y="' + f(t[1]) + '" font-family="' + MONO + '" font-size="10.5" font-weight="600" fill="' + tr[3] + '" text-anchor="middle" dominant-baseline="central">' + g.gate + '.' + g.line + '</text>');
      });
    });
    S.push('<circle r="232" fill="none" stroke="' + C.ink + '" stroke-opacity=".35" stroke-dasharray="2 6"/>');
    S.push('</svg>'); return S.join('');
  }


  // ---------- 相位表 ----------
  function aspectMark(nm, x, y, col) {
    if (nm === 'sq') return '<rect x="' + (x - 5) + '" y="' + (y - 5) + '" width="10" height="10" fill="none" stroke="' + col + '" stroke-width="1.6"/>';
    if (nm === 'tri') return '<path d="M' + x + ',' + (y - 6) + ' L' + (x + 6) + ',' + (y + 5) + ' L' + (x - 6) + ',' + (y + 5) + 'Z" fill="none" stroke="' + col + '" stroke-width="1.6"/>';
    var ch = { conj: '☌', opp: '☍', sext: '⚹' }[nm];
    return '<text x="' + x + '" y="' + y + '" font-family="' + SYM + '" font-size="13" font-weight="600" fill="' + col + '" text-anchor="middle" dominant-baseline="central">' + ch + '</text>';
  }
  function aspectGrid(r) {
    var keys = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','asc','mc'];
    var lon = function (k) { return k === 'asc' ? r.houses.asc : k === 'mc' ? r.houses.mc : r.pos[k].lon; };
    var c = 30, n = keys.length, W = c * (n + 1) + 4, S = ['<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + W + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="相位表">'];
    var AS = [[0,'conj'],[60,'sext'],[90,'sq'],[120,'tri'],[180,'opp']];
    keys.forEach(function (k, i) {
      var y = c * (i + 1);
      for (var j = 0; j < i; j++) {
        var x = c * (j + 1), a = keys[j], d = Math.abs(lon(a) - lon(k)) % 360; d = Math.min(d, 360 - d);
        S.push('<rect x="' + x + '" y="' + y + '" width="' + c + '" height="' + c + '" fill="' + C.inner + '" stroke="' + C.line + '" stroke-width=".8"/>');
        var lum = ['sun','moon'].indexOf(a) >= 0 || ['sun','moon'].indexOf(k) >= 0;
        AS.forEach(function (s) {
          var orb = Math.abs(d - s[0]);
          if (orb <= (lum ? 8 : 6)) {
            S.push(aspectMark(s[1], x + c / 2, y + c / 2 - 4, ACOL[s[1]]));
            S.push('<text x="' + (x + c / 2) + '" y="' + (y + c - 5) + '" font-family="' + MONO + '" font-size="7" font-weight="500" fill="' + C.mute + '" text-anchor="middle">' + Math.floor(orb) + '°' + pad(Math.round((orb % 1) * 60) % 60) + '</text>');
          }
        });
      }
      var x0 = c * (i + 1);
      S.push('<rect x="' + x0 + '" y="' + y + '" width="' + c + '" height="' + c + '" fill="' + C.ink + '"/>');
      if (k === 'asc' || k === 'mc') S.push('<text x="' + (x0 + c / 2) + '" y="' + (y + c / 2) + '" font-family="' + MONO + '" font-size="8.5" font-weight="600" fill="' + C.onMark + '" text-anchor="middle" dominant-baseline="central">' + k.toUpperCase() + '</text>');
      else S.push(glyph(k, x0 + c / 2, y + c / 2, 15, C.onMark));
    });
    S.push('</svg>'); return S.join('');
  }

  // ---------- 合成對照輪（64 閘門 × 黃道 × 宮位 × 人類圖） ----------
  function mandala(r) {
    var hd = r.hd, pt = mkPt(r.houses.asc), cusps = r.houses.cusps, S = ['<svg class="chart-svg" viewBox="-440 -440 880 880" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="星盤與人類圖合成對照輪">'];
    S.push('<circle r="430" fill="' + C.paper + '" stroke="' + C.ink + '" stroke-opacity=".7" stroke-width="1.4"/>');
    B.ORDER.forEach(function (g, i) {
      var a = 302 + i * 5.625, b = a + 5.625, p = hd.pset[g], d = hd.dset[g];
      if (p && d) S.push('<path d="' + arcSeg(pt, a, b, 428, 408) + '" fill="' + C.ink + '"/><path d="' + arcSeg(pt, a, b, 408, 388) + '" fill="' + C.des + '"/>');
      else S.push('<path d="' + arcSeg(pt, a, b, 428, 388) + '" fill="' + (p ? C.ink : d ? C.des : C.inner) + '"/>');
      S.push('<path d="' + arcSeg(pt, a, b, 428, 388) + '" fill="none" stroke="' + C.ink + '" stroke-opacity=".25" stroke-width=".6"/>');
      var t = pt(a + 2.8125, 408);
      S.push('<text x="' + f(t[0]) + '" y="' + f(t[1]) + '" font-family="' + MONO + '" font-size="12" font-weight="600" fill="' + (p || d ? C.onMark : C.mute) + '" text-anchor="middle" dominant-baseline="central">' + g + '</text>');
    });
    zodiacRing(S, pt, 388, 350, 20, [7, 5, 2.5]);
    S.push('<circle r="350" fill="none" stroke="' + C.ink + '" stroke-opacity=".6"/>');
    cusps.forEach(function (c, i) {
      var ax = [0, 3, 6, 9].indexOf(i) >= 0, a = pt(c, 343), b = pt(c, 230);
      S.push('<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="' + (ax ? C.gold : C.mute) + '" stroke-opacity="' + (ax ? .9 : .5) + '" stroke-width="' + (ax ? 1.4 : .8) + '"' + (ax ? '' : ' stroke-dasharray="3 4"') + '/>');
      var nx = cusps[(i + 1) % 12], mid = c + (((nx - c) % 360) + 360) % 360 / 2, t = pt(mid, 338);
      S.push('<text x="' + f(t[0]) + '" y="' + f(t[1]) + '" font-family="' + MONO + '" font-size="9.5" font-weight="600" fill="' + C.gold + '" text-anchor="middle" dominant-baseline="central">' + (i + 1) + '</text>');
    });
    S.push('<circle r="230" fill="' + C.inner + '" stroke="' + C.ink + '" stroke-opacity=".5"/>');
    [[321, 298, C.ink, hd.P, r.pos], [270, 246, C.des, hd.D, r.design.pos]].forEach(function (tr) {
      spread(ROWS.map(function (k) { return [k, tr[4][k].lon]; }), 7.4).forEach(function (it) {
        var k = it[0], l = it[1], p = it[2], a = pt(l, 350), b = pt(l, 338), c = pt(p, tr[0] + 12);
        S.push('<path d="M' + f(a[0]) + ',' + f(a[1]) + ' L' + f(b[0]) + ',' + f(b[1]) + ' L' + f(c[0]) + ',' + f(c[1]) + '" fill="none" stroke="' + tr[2] + '" stroke-width=".8" stroke-opacity=".7"/>');
        var m = pt(p, tr[0]); S.push('<circle cx="' + f(m[0]) + '" cy="' + f(m[1]) + '" r="11.5" fill="' + tr[2] + '"/>' + glyph(k, m[0], m[1], 14, C.onMark));
        var g = tr[3][k], t = pt(p, tr[1]);
        S.push('<text x="' + f(t[0]) + '" y="' + f(t[1]) + '" font-family="' + MONO + '" font-size="10.5" font-weight="600" fill="' + tr[2] + '" text-anchor="middle" dominant-baseline="central">' + g.gate + '.' + g.line + '</text>');
      });
    });
    S.push(bodygraph(hd, -150 * 0.88, -257 * 0.88, 0.88));
    S.push('</svg>'); return S.join('');
  }

  root.BlueprintCharts = { natal: natal, aspectGrid: aspectGrid, mandala: mandala, bodygraph: bodygraphFull, gateWheel: gateWheel, dm: dm, pad: pad, SG: SG, GL: GL };
})(typeof self !== 'undefined' ? self : this);
