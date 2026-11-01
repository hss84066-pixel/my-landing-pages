/* 天命藍圖：首頁表單 */
(function () {
  'use strict';
  var CFG = window.BLUEPRINT_CONFIG || {};
  var CITIES = [
    ['台灣', [['台北',25.0330,121.5654],['新北',25.0120,121.4637],['基隆',25.1276,121.7392],['桃園',24.9936,121.3010],['新竹',24.8138,120.9675],['苗栗',24.5602,120.8214],['台中',24.1477,120.6736],['彰化',24.0518,120.5161],['南投',23.9157,120.6869],['雲林',23.7092,120.5413],['嘉義',23.4801,120.4491],['台南',22.9999,120.2270],['高雄',22.6273,120.3014],['屏東',22.6690,120.4862],['宜蘭',24.7570,121.7533],['花蓮',23.9871,121.6015],['台東',22.7583,121.1444],['澎湖',23.5655,119.5793],['金門',24.4493,118.3767],['馬祖',26.1597,119.9497]].map(function (c) { return c.concat('Asia/Taipei'); })],
    ['港澳與中國', [['香港',22.3193,114.1694,'Asia/Hong_Kong'],['澳門',22.1987,113.5439,'Asia/Macau'],['北京',39.9042,116.4074,'Asia/Shanghai'],['上海',31.2304,121.4737,'Asia/Shanghai'],['廣州',23.1291,113.2644,'Asia/Shanghai'],['深圳',22.5431,114.0579,'Asia/Shanghai']]],
    ['亞太', [['新加坡',1.3521,103.8198,'Asia/Singapore'],['吉隆坡',3.1390,101.6869,'Asia/Kuala_Lumpur'],['東京',35.6762,139.6503,'Asia/Tokyo'],['首爾',37.5665,126.9780,'Asia/Seoul'],['曼谷',13.7563,100.5018,'Asia/Bangkok'],['雪梨',-33.8688,151.2093,'Australia/Sydney'],['墨爾本',-37.8136,144.9631,'Australia/Melbourne']]],
    ['歐美', [['洛杉磯',34.0522,-118.2437,'America/Los_Angeles'],['舊金山',37.7749,-122.4194,'America/Los_Angeles'],['紐約',40.7128,-74.0060,'America/New_York'],['溫哥華',49.2827,-123.1207,'America/Vancouver'],['多倫多',43.6532,-79.3832,'America/Toronto'],['倫敦',51.5074,-0.1278,'Europe/London']]]
  ];
  var $ = function (id) { return document.getElementById(id); };
  var sel = $('city');
  CITIES.forEach(function (g) {
    var og = document.createElement('optgroup'); og.label = g[0];
    g[1].forEach(function (c) { var o = document.createElement('option'); o.value = JSON.stringify(c); o.textContent = c[0]; og.appendChild(o); });
    sel.appendChild(og);
  });
  var oo = document.createElement('option'); oo.value = 'other'; oo.textContent = '其他城市（自行輸入經緯度）'; sel.appendChild(oo);
  sel.value = JSON.stringify(CITIES[0][1][0]);
  var tzSel = $('tz');
  var zones = (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['Asia/Taipei','Asia/Hong_Kong','Asia/Shanghai','Asia/Tokyo','Europe/London','America/New_York','America/Los_Angeles']);
  zones.forEach(function (z) { var o = document.createElement('option'); o.value = z; o.textContent = z; tzSel.appendChild(o); });
  tzSel.value = 'Asia/Taipei';
  sel.addEventListener('change', function () { $('other').hidden = sel.value !== 'other'; preview(); });

  function encode(obj) { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function readInput() {
    var d = $('bdate').value, t = $('btime').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !/^\d{2}:\d{2}/.test(t)) return null;
    var place;
    if (sel.value === 'other') {
      var la = parseFloat($('lat').value), lo = parseFloat($('lon').value);
      if (!isFinite(la) || !isFinite(lo) || Math.abs(la) > 66 || Math.abs(lo) > 180) return null;
      place = [$('cityname').value.trim() || '自訂地點', la, lo, tzSel.value];
    } else place = JSON.parse(sel.value);
    var p = d.split('-').map(Number), q = t.split(':').map(Number);
    if (p[0] < 1900 || p[0] > 2100) return null;
    return { n: $('name').value.trim().slice(0, 20), y: p[0], m: p[1], d: p[2], h: q[0], mi: q[1], c: place[0], lat: place[1], lon: place[2], tz: place[3] };
  }

  // 即時預覽：填好生日後，右側閘門輪換成對方自己的盤
  var art = $('art'), timer;
  function preview() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var inp = readInput(); if (!inp) return;
      try { art.innerHTML = window.BlueprintCharts.gateWheel(window.Blueprint.compute(inp)); $('artcap').textContent = '這是你的 64 閘門輪：黑色是個性、紅色是設計。完整解讀會寄到你的信箱。'; } catch (e) {}
    }, 300);
  }
  ['bdate','btime','lat','lon','tz'].forEach(function (id) { $(id).addEventListener('change', preview); });
  try { art.innerHTML = window.BlueprintCharts.gateWheel(window.Blueprint.compute({ y: 1990, m: 6, d: 21, h: 12, mi: 0, lat: 25.033, lon: 121.5654, tz: 'Asia/Taipei' })); } catch (e) {}

  var form = $('form'), msg = $('msg'), btn = $('submit');
  function show(kind, html) { msg.hidden = false; msg.className = 'msg ' + kind; msg.innerHTML = html; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('website').value) return; // 防機器人
    var inp = readInput();
    if (!inp) { show('err', '請確認出生日期、時間與地點都已填寫；自訂地點需要正確的經緯度。'); return; }
    if (!inp.n) { show('err', '請填寫你的名字或暱稱，報告封面會用到。'); $('name').focus(); return; }
    var email = $('email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { show('err', '請填寫正確的 Email，報告會寄到這個信箱。'); $('email').focus(); return; }
    if (!$('consent').checked) { show('err', '請勾選同意個資使用說明後再送出。'); return; }
    var code = encode(inp), base = location.href.replace(/[#?].*$/, '').replace(/index\.html$/, '');
    var link = base + 'report.html#' + code;
    if (!CFG.appsScriptUrl) {
      show('ok', '<b>測試模式</b>：尚未設定寄信，所以不會寄出 Email。<br><a href="' + link + '">直接開啟這份報告</a>');
      return;
    }
    btn.disabled = true; btn.textContent = '送出中⋯';
    fetch(CFG.appsScriptUrl, { method: 'POST', body: JSON.stringify({ name: inp.n, email: email, birth: inp.y + '-' + inp.m + '-' + inp.d, time: $('btime').value, city: inp.c, code: code, link: link, consent: true }) })
      .then(function (r) { return r.json().catch(function () { return { ok: true }; }); })
      .then(function (res) {
        if (res && res.ok === false) throw new Error(res.error || 'failed');
        form.reset(); sel.value = JSON.stringify(CITIES[0][1][0]); $('other').hidden = true;
        show('ok', '<b>已寄出！</b>你的天命藍圖正寄往 ' + email.replace(/[<>&"]/g, '') + '。幾分鐘內沒看到的話，請檢查垃圾郵件或「促銷內容」分類。');
      })
      .catch(function () { show('err', '送出失敗，請稍後再試一次。若持續失敗，請私訊我們。'); })
      .then(function () { btn.disabled = false; btn.textContent = '寄給我我的天命藍圖'; });
  });
})();
