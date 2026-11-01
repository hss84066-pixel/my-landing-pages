/* 天命藍圖：星盤與人類圖計算（瀏覽器端）。行星位置使用 Astronomy Engine（MIT 授權）。 */
(function (root) {
  'use strict';
  var A = (typeof module !== 'undefined' && module.exports) ? require('astronomy-engine') : root.Astronomy;
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  function norm(x) { return ((x % 360) + 360) % 360; }

  // ---------- 時區：用瀏覽器內建的 IANA 時區資料（含歷史夏令時間） ----------
  function tzOffsetMin(utcMs, tz) {
    var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    var p = {}; f.formatToParts(new Date(utcMs)).forEach(function (x) { p[x.type] = x.value; });
    return (Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second) - utcMs) / 60000;
  }
  function localToUTC(y, m, d, h, mi, tz) {
    var guess = Date.UTC(y, m - 1, d, h, mi);
    var off = tzOffsetMin(guess, tz), utc = guess - off * 60000;
    var off2 = tzOffsetMin(utc, tz); if (off2 !== off) utc = guess - off2 * 60000;
    return { date: new Date(utc), offsetMin: tzOffsetMin(utc, tz) };
  }

  // ---------- 行星黃經（真黃道、當日分點，視位置） ----------
  var BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  function lonOf(body, time) {
    if (body === 'Moon') return norm(A.EclipticGeoMoon(time).lon);
    var v = A.GeoVector(A.Body[body], time, true);
    var w = A.RotateVector(A.Rotation_EQJ_ECT(time), v);
    return norm(A.SphereFromVector(w).lon);
  }
  function trueNode(time) { // Meeus 第 47 章
    var T = time.tt / 36525;
    var D = (297.8501921 + 445267.1114034 * T) * D2R, M = (357.5291092 + 35999.0502909 * T) * D2R;
    var Mp = (134.9633964 + 477198.8675055 * T) * D2R, F = (93.2720950 + 483202.0175233 * T) * D2R;
    var O = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441;
    O += -1.4979 * Math.sin(2 * (D - F)) - 0.1500 * Math.sin(M) - 0.1226 * Math.sin(2 * D) + 0.1176 * Math.sin(2 * F) + 0.0801 * Math.sin(2 * (Mp - F));
    return norm(O);
  }
  function positions(date) {
    var t = A.MakeTime(date), t2 = A.MakeTime(new Date(date.getTime() + 864e5)), out = {};
    BODIES.forEach(function (b) {
      var l = lonOf(b, t), l2 = lonOf(b, t2);
      out[b.toLowerCase()] = { lon: l, retro: ((l2 - l + 540) % 360 - 180) < 0 };
    });
    out.nnode = { lon: trueNode(t), retro: true };
    out.snode = { lon: norm(out.nnode.lon + 180), retro: true };
    out.earth = { lon: norm(out.sun.lon + 180), retro: false };
    return out;
  }

  // ---------- 宮位（Placidus） ----------
  function houses(date, lat, lonE) {
    var t = A.MakeTime(date), T = t.tt / 36525;
    var eps = (23.439291111 - 0.0130041667 * T) * D2R, phi = lat * D2R;
    var ramc = norm(A.SiderealTime(t) * 15 + lonE);
    var r = ramc * D2R;
    var mc = norm(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(eps)) * R2D);
    var asc = norm(Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) * R2D);
    function raToLon(ra) { var a = ra * D2R; return norm(Math.atan2(Math.sin(a), Math.cos(a) * Math.cos(eps)) * R2D); }
    function cusp(kind, frac) {
      var lam = raToLon(ramc + (kind === 'day' ? 90 * frac : 90 + 90 * frac));
      for (var i = 0; i < 60; i++) {
        var dec = Math.asin(Math.sin(eps) * Math.sin(lam * D2R));
        var x = -Math.tan(phi) * Math.tan(dec); x = Math.max(-1, Math.min(1, x));
        var sda = Math.acos(x) * R2D;
        var ra = kind === 'day' ? ramc + sda * frac : ramc + sda + (180 - sda) * frac;
        var nl = raToLon(ra);
        if (Math.abs(((nl - lam + 540) % 360) - 180) < 1e-7) { lam = nl; break; }
        lam = nl;
      }
      return lam;
    }
    var c = new Array(12);
    c[0] = asc; c[9] = mc; c[3] = norm(mc + 180); c[6] = norm(asc + 180);
    c[10] = cusp('day', 1 / 3); c[11] = cusp('day', 2 / 3);
    c[1] = cusp('night', 1 / 3); c[2] = cusp('night', 2 / 3);
    c[4] = norm(c[10] + 180); c[5] = norm(c[11] + 180); c[7] = norm(c[1] + 180); c[8] = norm(c[2] + 180);
    return { cusps: c, asc: asc, mc: mc };
  }
  function houseOf(lon, cusps) {
    for (var i = 0; i < 12; i++) {
      var a = cusps[i], b = cusps[(i + 1) % 12];
      if (norm(lon - a) < norm(b - a)) return i + 1;
    }
    return 1;
  }

  // ---------- 人類圖 ----------
  var ORDER = [41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
  function gateOf(lon) { var d = norm(lon - 302), i = Math.floor(d / 5.625); return { gate: ORDER[i], line: Math.floor((d % 5.625) / 0.9375) + 1 }; }
  var CENTERS = { head: [64,61,63], ajna: [47,24,4,17,43,11], throat: [62,23,56,35,12,45,33,8,31,20,16], g: [7,1,13,10,25,15,46,2], heart: [21,40,26,51], spleen: [48,57,44,50,32,28,18], sp: [6,37,22,36,30,55,49], sacral: [5,14,29,59,9,3,42,27,34], root: [53,60,52,19,39,41,58,38,54] };
  var G2C = {}; Object.keys(CENTERS).forEach(function (c) { CENTERS[c].forEach(function (g) { G2C[g] = c; }); });
  var CHANNELS = [[64,47],[61,24],[63,4],[17,62],[43,23],[11,56],[16,48],[20,57],[20,34],[20,10],[10,34],[10,57],[34,57],[35,36],[12,22],[45,21],[31,7],[8,1],[33,13],[25,51],[15,5],[2,14],[46,29],[26,44],[40,37],[50,27],[32,54],[28,38],[18,58],[59,6],[42,53],[3,60],[9,52],[39,55],[41,30],[19,49]];
  var MOTORS = ['sacral', 'sp', 'heart', 'root'];

  function designDate(birth, sunLon) {
    var target = norm(sunLon - 88), lo = birth.getTime() - 100 * 864e5, hi = birth.getTime() - 80 * 864e5;
    for (var i = 0; i < 60; i++) {
      var m = (lo + hi) / 2, d = ((lonOf('Sun', A.MakeTime(new Date(m))) - target + 540) % 360) - 180;
      if (d > 0) hi = m; else lo = m;
    }
    return new Date(lo);
  }
  function humanDesign(pPos, dPos) {
    var keys = ['sun','earth','nnode','snode','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
    var P = {}, D = {}, pset = {}, dset = {};
    keys.forEach(function (k) { P[k] = gateOf(pPos[k].lon); D[k] = gateOf(dPos[k].lon); pset[P[k].gate] = 1; dset[D[k].gate] = 1; });
    var act = CHANNELS.filter(function (c) { return (pset[c[0]] || dset[c[0]]) && (pset[c[1]] || dset[c[1]]); });
    var defined = {}, adj = {};
    act.forEach(function (c) {
      var a = G2C[c[0]], b = G2C[c[1]]; defined[a] = defined[b] = 1;
      (adj[a] = adj[a] || {})[b] = 1; (adj[b] = adj[b] || {})[a] = 1;
    });
    function reach(s, t) { var seen = {}, st = [s]; seen[s] = 1; while (st.length) { var x = st.pop(); if (x === t) return true; Object.keys(adj[x] || {}).forEach(function (y) { if (!seen[y]) { seen[y] = 1; st.push(y); } }); } return false; }
    var motorThroat = MOTORS.some(function (m) { return defined[m] && reach(m, 'throat'); });
    var type;
    if (!Object.keys(defined).length) type = 'reflector';
    else if (defined.sacral) type = motorThroat ? 'mg' : 'generator';
    else type = motorThroat ? 'manifestor' : 'projector';
    var auth;
    if (defined.sp) auth = 'emotional';
    else if (defined.sacral) auth = 'sacral';
    else if (defined.spleen) auth = 'splenic';
    else if (defined.heart) auth = reach('heart', 'throat') ? 'ego-manifested' : 'ego-projected';
    else if (defined.g && reach('g', 'throat')) auth = 'self';
    else if (type === 'reflector') auth = 'lunar';
    else auth = 'mental';
    // definition
    var comps = 0, seen = {};
    Object.keys(defined).forEach(function (c) {
      if (seen[c]) return; comps++; var st = [c]; seen[c] = 1;
      while (st.length) { var x = st.pop(); Object.keys(adj[x] || {}).forEach(function (y) { if (!seen[y]) { seen[y] = 1; st.push(y); } }); }
    });
    var pl = P.sun.line, dl = D.sun.line, profile = pl + '/' + dl;
    var angle = ['4/1'].indexOf(profile) >= 0 ? 'juxta' : (['5/1','5/2','6/2','6/3'].indexOf(profile) >= 0 ? 'left' : 'right');
    var open = Object.keys(CENTERS).filter(function (c) { return !defined[c]; });
    return { P: P, D: D, pset: pset, dset: dset, channels: act, defined: defined, open: open, type: type, authority: auth,
      definition: comps, profile: profile, pLine: pl, dLine: dl, angle: angle,
      cross: [P.sun.gate, P.earth.gate, D.sun.gate, D.earth.gate] };
  }

  // ---------- 相位 ----------
  var ASPECTS = [[0,'conj'],[60,'sext'],[90,'sq'],[120,'tri'],[180,'opp']];
  function aspects(pos, keys) {
    var out = [];
    for (var i = 0; i < keys.length; i++) for (var j = i + 1; j < keys.length; j++) {
      var a = keys[i], b = keys[j], d = Math.abs(pos[a].lon - pos[b].lon) % 360; d = Math.min(d, 360 - d);
      var lum = (a === 'sun' || a === 'moon' || b === 'sun' || b === 'moon');
      ASPECTS.forEach(function (x) { var orb = lum ? 8 : 6; if (Math.abs(d - x[0]) <= orb) out.push({ a: a, b: b, type: x[1], orb: Math.abs(d - x[0]) }); });
    }
    return out;
  }


  // ---------- 未來 12 個月行運（內部版） ----------
  function transitYear(r, start, days) {
    days = days || 366;
    var t0 = start.getTime(), DAY = 864e5, out = [];
    var natal = { sun: r.pos.sun.lon, moon: r.pos.moon.lon, mercury: r.pos.mercury.lon, venus: r.pos.venus.lon, mars: r.pos.mars.lon,
      jupiter: r.pos.jupiter.lon, saturn: r.pos.saturn.lon, asc: r.houses.asc, mc: r.houses.mc };
    var TP = ['Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    var ASP = [[0, 'conj'], [60, 'sext'], [90, 'sq'], [120, 'tri'], [180, 'opp']];
    var runs = {}, prevHouse = {}, prevSpeed = {};
    for (var d = 0; d <= days; d++) {
      var date = new Date(t0 + d * DAY), t = A.MakeTime(date), t2 = A.MakeTime(new Date(t0 + (d + 1) * DAY));
      TP.concat(['Mercury', 'Venus']).forEach(function (b) {
        var l = lonOf(b, t), l2 = lonOf(b, t2), sp = ((l2 - l + 540) % 360) - 180, key = b.toLowerCase();
        if (prevSpeed[key] !== undefined && (prevSpeed[key] < 0) !== (sp < 0))
          out.push({ kind: 'station', body: key, retro: sp < 0, start: date, end: date, lon: l, house: houseOf(l, r.houses.cusps) });
        prevSpeed[key] = sp;
        if (TP.indexOf(b) < 0) return;
        var h = houseOf(l, r.houses.cusps);
        if (b !== 'Mars' && prevHouse[key] && prevHouse[key] !== h) out.push({ kind: 'house', body: key, house: h, start: date, end: date, lon: l });
        prevHouse[key] = h;
        Object.keys(natal).forEach(function (n) {
          var diff = Math.abs(l - natal[n]) % 360; diff = Math.min(diff, 360 - diff);
          ASP.forEach(function (x) {
            if (b === 'Mars' && (x[1] === 'sext' || x[1] === 'tri')) return;
            var k = key + '|' + x[1] + '|' + n, hit = Math.abs(diff - x[0]) < 1;
            var cur = runs[k];
            if (hit) {
              if (cur && cur.open && (d - cur.lastD) <= 3) { cur.end = date; cur.lastD = d; }
              else { cur = runs[k + '#' + d] = { kind: 'aspect', body: key, type: x[1], natal: n, start: date, end: date, lastD: d, open: true }; runs[k] = cur; }
            } else if (cur && d - cur.lastD > 3) cur.open = false;
          });
        });
      });
    }
    Object.keys(runs).forEach(function (k) { if (k.indexOf('#') > 0) out.push(runs[k]); });
    // 日月蝕
    try {
      var se = A.SearchGlobalSolarEclipse(start);
      while (se.peak.date.getTime() < t0 + days * DAY) {
        var ls = lonOf('Sun', se.peak); out.push({ kind: 'eclipse', solar: true, type: se.kind, start: se.peak.date, end: se.peak.date, lon: ls, house: houseOf(ls, r.houses.cusps) });
        se = A.NextGlobalSolarEclipse(se.peak);
      }
      var le = A.SearchLunarEclipse(start);
      while (le.peak.date.getTime() < t0 + days * DAY) {
        var lm = lonOf('Moon', le.peak); out.push({ kind: 'eclipse', solar: false, type: le.kind, start: le.peak.date, end: le.peak.date, lon: lm, house: houseOf(lm, r.houses.cusps) });
        le = A.NextLunarEclipse(le.peak);
      }
    } catch (e) {}
    out.sort(function (a, b) { return a.start - b.start; });
    return out;
  }

  function compute(input) {
    var u = localToUTC(input.y, input.m, input.d, input.h, input.mi, input.tz);
    var pos = positions(u.date);
    var hs = houses(u.date, input.lat, input.lon);
    Object.keys(pos).forEach(function (k) { pos[k].house = houseOf(pos[k].lon, hs.cusps); });
    var dd = designDate(u.date, pos.sun.lon), dpos = positions(dd);
    var hd = humanDesign(pos, dpos);
    var asp = aspects(pos, ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']);
    // 目前行運：木星、土星所在宮位（升級頁的預告）
    var now = new Date(), tn = A.MakeTime(now);
    var transit = { jupiter: houseOf(lonOf('Jupiter', tn), hs.cusps), saturn: houseOf(lonOf('Saturn', tn), hs.cusps),
      jupiterLon: lonOf('Jupiter', tn), saturnLon: lonOf('Saturn', tn), date: now };
    return { input: input, utc: u.date, offsetMin: u.offsetMin, pos: pos, houses: hs, design: { date: dd, pos: dpos }, hd: hd, aspects: asp, transit: transit };
  }

  var api = { compute: compute, transitYear: transitYear, lonOf: function (b, d) { return lonOf(b, A.MakeTime(d)); }, gateOf: gateOf, houseOf: houseOf, norm: norm, CENTERS: CENTERS, CHANNELS: CHANNELS, G2C: G2C, ORDER: ORDER, localToUTC: localToUTC, positions: positions, houses: houses };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Blueprint = api;
})(typeof self !== 'undefined' ? self : this);
