/* 天命藍圖：完整版自動解讀引擎。依本命盤與未來 12 個月行運，寫出客戶看得懂、可以執行的文字。 */
(function (root) {
  'use strict';
  var T = root.BlueprintTexts, B = root.Blueprint;
  function sg(l) { return Math.floor(l / 30); }

  var VENUS_LOVE = [
    '你在感情裡直接、熱烈，喜歡主動追求，也需要新鮮感；心動來得快，記得給關係一點時間慢慢加溫。',
    '你在感情裡重視安全感與穩定，用實際的陪伴和照顧表達愛；一旦認定就很專一，但不喜歡被催促。',
    '你在感情裡需要聊得來的伴侶，心靈與話題的交流比什麼都重要；太無聊的關係會讓你想逃。',
    '你在感情裡溫柔而念舊，渴望像家人一樣的歸屬感；你很會照顧對方，卻常忘了說出自己的需要。',
    '你在感情裡熱情大方，喜歡被欣賞、被放在心上；真誠的讚美與用心的儀式感最能打動你。',
    '你在感情裡細心、務實，用行動和照顧表達愛；要小心過度挑剔，也別對自己太嚴格。',
    '你在感情裡重視和諧、浪漫與對等，很懂得經營關係；但為了避免衝突，常把真心話吞回去。',
    '你在感情裡深情而專一，追求靈魂層次的連結；信任建立得慢，一旦受傷也很難放下。',
    '你在感情裡需要自由與共同成長，喜歡能一起探索世界的伴侶；被綁住時會想逃離。',
    '你在感情裡慢熱、認真，重視承諾與長遠的規劃；對你來說，愛是用責任與時間證明的。',
    '你在感情裡需要空間與獨立，喜歡像朋友一樣平等的關係；太黏或太傳統的相處會讓你窒息。',
    '你在感情裡浪漫、包容，容易為愛付出；記得分辨真實的對方，和你想像中的對方。'];
  var PARTNER = [
    '你容易被有魄力、主動、敢衝的人吸引，也需要伴侶帶你勇敢行動。',
    '你需要穩定、可靠、懂得生活質感的伴侶，能給你踏實的安全感。',
    '你容易被聰明、幽默、好聊的人吸引，伴侶需要能和你一直有話說。',
    '你需要溫暖、顧家、能照顧情緒的伴侶，關係裡要有「回家」的感覺。',
    '你容易被自信、有光芒的人吸引，也需要伴侶真心欣賞你。',
    '你需要細心、務實、願意一起把日子過好的伴侶。',
    '你需要懂得溝通、尊重與平衡的伴侶，關係要對等才能長久。',
    '你容易被有深度、有神秘感的人吸引，渴望全心全意的連結。',
    '你需要開朗、熱愛學習與旅行的伴侶，能一起擴展視野。',
    '你需要成熟、有責任感、能一起規劃未來的伴侶。',
    '你容易被獨特、有想法的人吸引，伴侶也要尊重你的自由。',
    '你需要溫柔、有同理心、懂你內心世界的伴侶。'];
  var CAREER = [
    '你適合開創型的工作，需要自主權與挑戰，例如創業、業務開發，或帶頭推動新計畫。',
    '你適合能長期累積、看得見成果的工作，例如財務、美感、品牌、餐飲，或任何需要品質與耐心的領域。',
    '你適合需要溝通與資訊流動的工作，例如寫作、教學、行銷、媒體、銷售或顧問。',
    '你適合照顧人、帶來歸屬感的工作，例如教育、照護、餐飲、房地產或經營社群。',
    '你適合站上舞台、被看見的工作，例如表演、創作、品牌經營、管理或經營個人品牌。',
    '你適合需要專業、細節與服務精神的工作，例如醫療健康、分析、行政、品管或顧問。',
    '你適合需要美感、協調與人際的工作，例如設計、公關、法務、諮詢或合作型事業。',
    '你適合需要深度與洞察的工作，例如心理、研究、金融投資、身心靈或危機處理。',
    '你適合需要視野與傳播的工作，例如教育、出版、旅遊、國際事務或知識型創業。',
    '你適合有清楚晉升階梯、能長期累積專業權威的工作，例如管理、專業證照、企業或公部門。',
    '你適合創新、科技或改變群體的工作，例如網路、新創、社群經營、科技或社會議題。',
    '你適合需要想像力與同理心的工作，例如藝術、療癒、身心靈、影像或助人工作。'];
  var TALK = [
    '你說話直接、反應快，習慣先講再想；人際上要留意語氣，避免無心傷人。',
    '你說話穩重、實在，不輕易表態；熟了之後是最可靠的朋友，但改變想法需要時間。',
    '你能言善道、好奇心強，朋友圈很多元；要留意話題太多、承諾太快。',
    '你說話溫和、重感受，習慣先照顧對方的情緒；也容易因為一句話在心裡難過很久。',
    '你說話有感染力，自然成為焦點；記得也留空間給別人表達。',
    '你說話精準、有條理，擅長給具體建議；小心不要變成挑剔或過度分析。',
    '你說話得體、懂得協調，是人群中的和事佬；但常因為怕衝突而說不出真心話。',
    '你說話一針見血，能看穿人心；對人慢熱、有戒心，真正的朋友少而深。',
    '你說話直率、幽默，喜歡分享觀點；要小心太直接，或給出太多建議。',
    '你說話謹慎、重視分寸，給人可靠的印象；有時太嚴肅，讓人不敢靠近。',
    '你說話有獨特觀點，跟誰都能聊；但對人保持距離，不容易交心。',
    '你說話溫柔、有同理心，很會傾聽；要練習把自己的界線說清楚。'];
  var FAMILY = [
    '你的家庭可能充滿活力或衝突，讓你很早就學會獨立；你需要一個能自己做主的家。',
    '你重視家的穩定與舒適，需要一個實在、安心的生活空間；家人的安全感對你很重要。',
    '你的家庭常有很多交流或變動，你需要一個能自由溝通、不被管太多的家。',
    '家庭對你意義重大，你和家人的情感連結很深，也容易背負家人的情緒。',
    '你希望家是溫暖、熱鬧、以你為榮的地方，家人的肯定對你很重要。',
    '你的家庭重視規矩與責任，你可能很早就開始照顧家人；要學會適時放下責任感。',
    '你重視家庭的和諧，常是家裡的協調者；你需要一個美好、平衡的生活空間。',
    '你的家庭可能有一些不常說出口的議題，你對家人的情感很深，也需要自己的隱私。',
    '你需要一個自由、開放的家，有機會離家發展，或在外地生活。',
    '你的家庭重視責任與傳統，你可能很早就扛起責任；也要允許自己被照顧。',
    '你和家人之間需要空間與尊重，你的家庭觀念可能和上一代很不同。',
    '你對家人有很深的同理心，容易為家庭犧牲；你需要一個能安靜療癒的空間。'];
  var ENERGY = [
    '你的體力爆發力強，但容易衝太快；適合有挑戰性的運動，記得充分暖身。',
    '你的耐力很好但啟動慢，累了容易一直撐；適合規律、穩定的運動，例如散步、重訓或瑜伽。',
    '你的能量來自變化，常因為想太多而疲倦；適合多變、有趣的運動，並安排放空的時間。',
    '你的體力受情緒影響很大，心情不好時身體也會跟著累；照顧情緒就是照顧身體。',
    '你的能量旺盛、愛表現，容易透支；適合舞蹈或團體運動，也要留時間真正休息。',
    '你容易因為焦慮與追求完美而緊繃；規律的作息、溫和的運動與飲食節奏對你特別重要。',
    '你的能量需要平衡，壓力大時容易忽略身體；適合有節奏的運動，例如瑜伽或游泳。',
    '你的意志力很強，常把壓力往內收；需要能釋放情緒的運動，例如拳擊、重訓或深度伸展。',
    '你需要戶外與自由，關在室內太久會悶；適合登山、旅行、球類等開闊的活動。',
    '你很能撐，容易忽略身體的警訊；適合有目標的訓練，也要定期休息與檢查。',
    '你的能量起伏大、作息容易不規律；適合新奇的運動，更要固定睡眠時間。',
    '你的能量容易被環境吸走，需要充足的睡眠；適合游泳、冥想、溫和的身心運動。'];
  var BODY = ['頭部與臉部', '喉嚨與頸部', '呼吸道、神經系統與手臂', '胃與消化系統', '心臟與背部', '腸胃與消化吸收', '腎臟與腰部', '生殖與排泄系統', '臀部、大腿與肝臟', '骨骼、關節與牙齒', '小腿與血液循環', '雙足與免疫系統'];
  var IMG = ['春天的第一道火光', '五月的土地', '穿過林間的風', '守著家的月光', '正午的太陽', '秋收前細心整理的田', '黃昏時剛好平衡的天空', '深夜裡安靜燃燒的火', '射向遠方的箭', '冬日裡穩穩登頂的山', '劃過夜空的流星', '包容一切的海'];
  var GATE = [null, '創造力', '方向', '秩序', '公式化', '固定的韻律', '情緒中的親密與界線', '自我的角色', '貢獻', '專注', '自我的行為', '想法', '謹慎的表達', '聆聽者', '力量技能', '包容不同的節奏', '技能', '意見', '修正與改善', '需求', '當下',
    '掌握資源', '優雅', '同化', '合理化', '純真', '影響與說服', '照顧', '為值得的事冒險', '承諾', '感受', '影響力', '延續', '退後與反思', '力量', '改變', '穿越危機的經驗', '友誼', '為意義而奮鬥', '激發他人', '獨處與休息',
    '開啟新的體驗', '成長', '洞見', '警覺', '聚集者', '自我決心', '從困惑中領悟', '深度', '原則', '價值', '勇於面對衝擊', '沉靜的專注', '開始', '向上的企圖心', '豐盛', '追求新鮮體驗', '直覺洞見', '活力', '親密', '在限制中創新',
    '內在真理', '細節', '懷疑與求證', '從混沌中找到意義'];
  var CORE = { sun: '自我認同與人生方向', moon: '情緒與安全感', mercury: '思考與表達', venus: '愛與價值感', mars: '行動與企圖心', jupiter: '成長與信念', saturn: '責任與自律', uranus: '創新與自由', neptune: '靈感與理想', pluto: '轉化與掌控' };
  var NEED = { sun: '想活出自己', moon: '想要安全感', mercury: '想把事情想清楚', venus: '想被愛與被欣賞', mars: '想立刻行動', jupiter: '想擴展與冒險', saturn: '想穩定與負責', uranus: '想自由與改變', neptune: '想追求理想', pluto: '想深入與掌握' };
  var GIFTA = { sun: '清楚的自我方向', moon: '敏銳的感受力', mercury: '靈活的頭腦與表達', venus: '親和力與美感', mars: '果斷的行動力', jupiter: '樂觀與好運', saturn: '穩定與自律', uranus: '創新的眼光', neptune: '豐富的想像與同理', pluto: '深刻的洞察與意志力' };
  var ZH = { sun: '太陽', moon: '月亮', mercury: '水星', venus: '金星', mars: '火星', jupiter: '木星', saturn: '土星', uranus: '天王星', neptune: '海王星', pluto: '冥王星', asc: '上升', mc: '天頂', earth: '地球', nnode: '北交點' };
  var ASPZ = { conj: '合', sext: '六分', sq: '四分', tri: '三分', opp: '對分' };

  var TONE = {
    jupiter: { good: '{t}上的機會與好運增加，適合主動踏出一步', hard: '{t}上的機會很多，但容易期待過高或答應太多，要量力而為' },
    saturn: { good: '{t}適合建立長期、穩定的基礎，現在的努力會慢慢看到成果', hard: '{t}會遇到考驗與壓力，事情進展變慢，需要承擔責任、做出取捨' },
    uranus: { good: '{t}出現令人振奮的新變化，適合嘗試不同的做法', hard: '{t}可能突然出現變動，計畫被打亂，保持彈性比硬撐更重要' },
    neptune: { good: '{t}充滿靈感與溫柔的感受，適合療癒、創作與靠近心裡真正想要的', hard: '{t}容易看不清楚或過度理想化，重要決定前先確認事實' },
    pluto: { good: '{t}迎來深層而正向的轉變，適合放下舊的模式', hard: '{t}會碰到必須面對的深層議題，轉變雖然辛苦，卻是必要的' },
    mars: { good: '{t}行動力變強，適合推進卡住的事', hard: '{t}容易急躁或和人起衝突，先冷靜再回應' }
  };
  var STATION = {
    mercury: ['溝通、合約與交通容易出錯，重要訊息要再三確認，也適合回頭整理舊的想法', '溝通恢復順暢，延宕的事情可以重新推進'],
    venus: ['舊情或舊的金錢議題可能浮現，適合回顧，不急著做新的承諾', '感情與金錢的步調恢復正常，可以重新做決定'],
    mars: ['行動力下降、事情容易反覆，適合整理與修正，而不是衝刺', '卡住的事情重新開始前進，可以再次採取行動'],
    jupiter: ['擴張的腳步放慢，適合回頭檢視已經開始的計畫', '成長的動能回來了，適合再次推進'],
    saturn: ['壓力與責任需要重新調整結構，把基礎打得更穩', '前一段的努力開始累積成果']
  };
  var INGRESS = { jupiter: '接下來大約一年，這個領域容易帶來成長與好運', saturn: '接下來兩到三年，這個領域需要你負起責任、打好基礎', uranus: '接下來幾年，這個領域會出現打破常規的變化', neptune: '接下來幾年，這個領域會變得更有靈性，也更需要分辨真假', pluto: '接下來多年，這個領域會經歷深層的蛻變' };
  var TRZ = { mars: '火星', jupiter: '木星', saturn: '土星', uranus: '天王星', neptune: '海王星', pluto: '冥王星', mercury: '水星', venus: '金星' };
  var PT = { sun: '本命太陽', moon: '本命月亮', mercury: '本命水星', venus: '本命金星', mars: '本命火星', jupiter: '本命木星', saturn: '本命土星', asc: '上升點', mc: '天頂' };

  var AREAS = {
    love: { name: '愛情', theme: '感情', houses: [5, 7], points: ['venus', 'moon'],
      good: '主動安排約會、旅行或見重要的人；單身的話多參加有興趣的活動，讓緣分有機會出現', hard: '遇到摩擦先冷靜，不在情緒最高點談分合；把需要說清楚，而不是期待對方猜' },
    career: { name: '事業', theme: '工作與事業', houses: [10, 6, 2], points: ['mc', 'sun', 'saturn'],
      good: '主動提案、爭取曝光、洽談合作或調整收費，這段時間的努力最容易被看見', hard: '不在壓力下做重大決定或簽約，先把風險、成本與時間算清楚' },
    social: { name: '人際', theme: '人際往來', houses: [11, 3], points: ['asc', 'mercury'],
      good: '主動聯絡重要的人、參加社群或活動，建立新的合作與人脈', hard: '重要訊息寫成文字並再次確認，避免誤會；不必勉強維持消耗你的關係' },
    family: { name: '家庭', theme: '家庭與居住', houses: [4], points: ['moon'],
      good: '和家人好好吃頓飯、聊聊未來的計畫，也適合處理居家、搬家或裝修的事', hard: '給彼此空間，先說感受、再說決定；家裡的大事延到情緒穩定時再定' },
    health: { name: '身心', theme: '身體與情緒', houses: [6, 1], points: ['mars', 'asc', 'sun'],
      good: '建立新的運動或作息習慣，這段時間的身體調整會特別有感', hard: '降低工作量與運動強度，睡飽一點；身體不舒服時盡早就醫' }
  };

  function tone(e) {
    if (e.kind === 'aspect') {
      if (e.type === 'sext' || e.type === 'tri') return 'good';
      if (e.type === 'conj') return (e.body === 'jupiter') ? 'good' : 'hard';
      return 'hard';
    }
    if (e.kind === 'station') return e.retro ? 'hard' : 'good';
    if (e.kind === 'house') return e.body === 'jupiter' ? 'good' : e.body === 'saturn' ? 'hard' : 'neutral';
    if (e.kind === 'eclipse') return e.solar ? 'good' : 'neutral';
    return 'neutral';
  }
  function score(e) {
    if (e.kind === 'eclipse') return 5;
    if (e.kind === 'aspect') return { jupiter: 4, saturn: 4, uranus: 4, neptune: 3, pluto: 4, mars: 1 }[e.body] || 1;
    if (e.kind === 'house') return 3;
    if (e.kind === 'station') return e.body === 'mercury' && e.retro ? 2 : 1;
    return 0;
  }
  function month(d) { return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月'; }
  function when(e) {
    var a = e.start, b = e.end;
    if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) return month(a);
    if (a.getFullYear() === b.getFullYear()) return a.getFullYear() + ' 年 ' + (a.getMonth() + 1) + '–' + (b.getMonth() + 1) + ' 月';
    return month(a) + '至 ' + month(b);
  }
  function why(e) {
    if (e.kind === 'aspect') return TRZ[e.body] + T.TR_ASP[e.type] + PT[e.natal].replace('本命', '');
    if (e.kind === 'eclipse') return (e.solar ? '日蝕' : '月蝕') + '第 ' + e.house + ' 宮';
    if (e.kind === 'station') return TRZ[e.body] + (e.retro ? '逆行' : '順行');
    if (e.kind === 'house') return TRZ[e.body] + '入第 ' + e.house + ' 宮';
    return '';
  }
  function windows(list) {
    var seen = {}, out = [];
    list.slice().sort(function (x, y) { return x.start - y.start; }).forEach(function (e) {
      var w = when(e); if (seen[w]) return; seen[w] = 1; out.push(w + '（' + why(e) + '）');
    });
    return out.slice(0, 3);
  }
  function sentence(e, area) {
    var t = tone(e), th = AREAS[area].theme;
    if (e.kind === 'aspect') return when(e) + '，' + TRZ[e.body] + T.TR_ASP[e.type] + PT[e.natal] + '：' + TONE[e.body][t === 'good' ? 'good' : 'hard'].replace('{t}', th) + '。';
    if (e.kind === 'eclipse') return month(e.start) + '，' + (e.solar ? '日蝕' : '月蝕') + '落在你的第 ' + e.house + ' 宮（' + T.HOUSE[e.house - 1] + '）：' + (e.solar ? '這個領域會迎來新的開始，適合設定新目標。' : '這個領域的事情會走到一個段落，適合收尾與放下。');
    if (e.kind === 'station') return month(e.start) + '，' + TRZ[e.body] + (e.retro ? '開始逆行' : '恢復順行') + '：' + STATION[e.body][e.retro ? 0 : 1] + '。';
    if (e.kind === 'house') return month(e.start) + '起，' + TRZ[e.body] + '進入你的第 ' + e.house + ' 宮（' + T.HOUSE[e.house - 1] + '）：' + (INGRESS[e.body] || '這個領域的主題變得更明顯') + '。';
    return '';
  }
  function related(ev, area) {
    var A = AREAS[area];
    return ev.filter(function (e) {
      if (e.kind === 'aspect') return A.points.indexOf(e.natal) >= 0 && (e.body !== 'mars' || area === 'health' || area === 'love');
      if (e.kind === 'eclipse' || e.kind === 'house') return A.houses.indexOf(e.house) >= 0;
      if (e.kind === 'station') {
        if (area === 'social') return e.body === 'mercury' && e.retro;
        if (area === 'love') return e.body === 'venus';
        if (area === 'health') return e.body === 'mars';
        if (area === 'career') return e.body === 'saturn' || e.body === 'jupiter';
        return false;
      }
      return false;
    });
  }

  function area(key, r, ev) {
    var A = AREAS[key], pos = r.pos, h = r.houses, hd = r.hd, TY = T.TYPE[hd.type], AU = T.AUTH[hd.authority];
    var rel = related(ev, key);
    var nat;
    if (key === 'love') nat = '你的金星在' + T.SIGNS[sg(pos.venus.lon)] + '座：' + VENUS_LOVE[sg(pos.venus.lon)] + '第 7 宮落在' + T.SIGNS[sg(h.cusps[6])] + '座，' + PARTNER[sg(h.cusps[6])];
    else if (key === 'career') nat = '你的天頂在' + T.SIGNS[sg(h.mc)] + '座：' + CAREER[sg(h.mc)] + '在人類圖裡，你是' + TY.name + '，' + TY.engage;
    else if (key === 'social') nat = '你的水星在' + T.SIGNS[sg(pos.mercury.lon)] + '座：' + TALK[sg(pos.mercury.lon)] + '人類圖 ' + hd.profile + ' 的你，' + T.LINE[hd.pLine].t + '，也' + T.LINE[hd.dLine].t + '。';
    else if (key === 'family') nat = '你的天底在' + T.SIGNS[sg((h.mc + 180) % 360)] + '座：' + FAMILY[sg((h.mc + 180) % 360)] + '月亮在' + T.SIGNS[sg(pos.moon.lon)] + '座，' + T.MOON[sg(pos.moon.lon)];
    else nat = '你的火星在' + T.SIGNS[sg(pos.mars.lon)] + '座：' + ENERGY[sg(pos.mars.lon)] + '傳統占星中，' + T.SIGNS[sg(pos.sun.lon)] + '座太陽對應' + BODY[sg(pos.sun.lon)] + '，可以多留意。';
    var g = rel.filter(function (e) { return tone(e) === 'good'; }), b = rel.filter(function (e) { return tone(e) === 'hard'; });
    var overall;
    if (!rel.length) overall = '這一年的' + A.theme + '沒有特別強烈的行運，是相對平穩、適合穩穩經營的一年。';
    else if (g.length >= b.length * 1.5) overall = '整體來說，這一年的' + A.theme + '以順流為主，是值得主動把握的一年。';
    else if (b.length >= g.length * 1.5) overall = '整體來說，這一年的' + A.theme + '以調整與考驗為主，重點是穩住節奏、打好基礎。';
    else overall = '整體來說，這一年的' + A.theme + '有機會也有考驗，關鍵在於掌握時機。';
    var top = rel.slice().sort(function (x, y) { return score(y) - score(x) || x.start - y.start; }).slice(0, 3).sort(function (x, y) { return x.start - y.start; });
    var trend = overall + top.map(function (e) { return sentence(e, key); }).join('');
    var tips = [];
    var bestG = g.slice().sort(function (x, y) { return score(y) - score(x); })[0], bestB = b.slice().sort(function (x, y) { return score(y) - score(x); })[0];
    if (bestG) tips.push('把握 ' + when(bestG) + '：' + A.good + '。'); else tips.push(A.good + '。');
    if (bestB) tips.push(when(bestB) + '前後：' + A.hard + '。'); else tips.push(A.hard + '。');
    if (key === 'love' || key === 'family') tips.push('依你的' + AU.name + '：' + AU.t);
    if (key === 'career') tips.push('發揮你的天賦：' + T.SUN[sg(pos.sun.lon)].gift + '，以及' + TY.gift + '。');
    if (key === 'social') { var oc = ['sp', 'throat', 'g', 'head', 'heart'].filter(function (c) { return hd.open.indexOf(c) >= 0; })[0]; if (oc) tips.push('與人相處時，留意你開放的' + T.CENTER_ZH[oc] + '中心：' + T.OPEN[oc]); else tips.push('你的能量中心大多是固定的，在人群中保有自己的節奏，就是最好的相處方式。'); }
    if (key === 'health') { tips.push(TY.name + '的休息方式：' + TY.rest); tips.push('以上是能量傾向的參考，不是醫療判斷；身體若有不適，請以醫師的專業意見為準。'); }
    var goodW = windows(g), hardW = windows(b);
    var timing = (goodW.length ? '好時機：' + goodW.join('、') : '') + (goodW.length && hardW.length ? '\n' : '') + (hardW.length ? '要留意：' + hardW.join('、') : '');
    return { name: A.name, nat: nat, trend: trend, tips: tips, timing: timing };
  }

  function letter(r, inp, ev) {
    var pos = r.pos, hd = r.hd, TY = T.TYPE[hd.type], AU = T.AUTH[hd.authority], h = r.houses;
    var sS = sg(pos.sun.lon), mS = sg(pos.moon.lon), aS = sg(h.asc), gate = hd.P.sun.gate;
    var hc = {}; ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].forEach(function (k) { hc[pos[k].house] = (hc[pos[k].house] || 0) + 1; });
    var topH = +Object.keys(hc).sort(function (a, b) { return hc[b] - hc[a] || a - b; })[0];
    var t = CH2(inp.h) + ':' + CH2(inp.mi);
    var j = r.transit.jupiter;
    return ['親愛的' + (inp.n || '你') + '：',
      '你出生在' + inp.y + ' 年 ' + inp.m + ' 月 ' + inp.d + ' 日 ' + t + '，' + (inp.c || '') + '。那一刻，太陽在' + T.SIGNS[sS] + '座，月亮在' + T.SIGNS[mS] + '座，' + T.SIGNS[aS] + '座正從東方升起。',
      '你的太陽在' + T.SIGNS[sS] + '座。' + T.SUN[sS].t + '月亮在' + T.SIGNS[mS] + '座，' + T.MOON[mS] + '而上升' + T.SIGNS[aS] + '座讓' + T.ASC[aS].replace(/^別人眼中的你/, '別人眼中的你'),
      '在人類圖裡，你是' + TY.name + '，策略是「' + TY.strategy + '」，內在權威是' + AU.name + '。' + TY.t,
      '兩套系統放在一起看，你的太陽落在人類圖第 ' + gate + ' 號閘門「' + GATE[gate] + '」，而你的行星最集中在第 ' + topH + ' 宮（' + T.HOUSE[topH - 1] + '）。這份報告想告訴你的核心主題是：好好發揮你「' + T.SUN[sS].gift + '」的天賦，並且用' + TY.name + '的方式使用它。',
      '接下來一年，木星正經過你的第 ' + j + ' 宮（' + T.HOUSE[j - 1] + '），這是 12 年一次在這個領域擴展的時機。後面的章節會告訴你，愛情、事業、人際、家庭與身心各自的趨勢與具體建議。',
      '這份報告不是要告訴你命運已經寫定，而是一份認識自己的地圖。怎麼走，永遠由你決定。'];
  }
  function CH2(n) { return (n < 10 ? '0' : '') + n; }

  function keyAspects(r) {
    var outer = ['uranus', 'neptune', 'pluto'];
    return r.aspects.filter(function (x) { return !(outer.indexOf(x.a) >= 0 && outer.indexOf(x.b) >= 0); })
      .sort(function (a, b) { return a.orb - b.orb; }).slice(0, 4).map(function (x) {
        var hard = x.type === 'sq' || x.type === 'opp', head = ZH[x.a] + ASPZ[x.type] + ZH[x.b] + '（容許度 ' + x.orb.toFixed(1) + '°）';
        var body = x.type === 'conj' ? '你的' + CORE[x.a] + '和' + CORE[x.b] + '緊緊綁在一起：' + NEED[x.a] + '的時候，往往也' + NEED[x.b] + '。這讓你同時擁有' + GIFTA[x.a] + '與' + GIFTA[x.b] + '，提醒是別讓兩股力量一起用力過度。'
          : hard ? '你常在「' + NEED[x.a] + '」和「' + NEED[x.b] + '」之間拉扯，兩邊都很重要，卻很難同時滿足。這不是缺陷，而是這一生要整合的課題；當你允許兩者輪流被照顧，' + GIFTA[x.a] + '與' + GIFTA[x.b] + '會一起變成你的力量。'
          : '你的' + GIFTA[x.a] + '和' + GIFTA[x.b] + '能自然合作，' + NEED[x.a] + '時，' + CORE[x.b] + '會主動支援你。這是你不需要特別努力就擁有的優勢，遇到困難時記得回頭使用它。';
        return [head, body];
      });
  }
  function compare(r) {
    var pos = r.pos, hd = r.hd, cus = r.houses.cusps;
    var hc = {}; ['mercury','venus','mars','jupiter','saturn'].forEach(function (k) { hc[k] = pos[k].house; });
    var third = ['venus', 'mercury', 'mars', 'jupiter', 'saturn'][0];
    return ['sun', 'moon', third].map(function (k) {
      var p = pos[k], g = hd.P[k], hs = B.houseOf(p.lon, cus);
      return [ZH[k] + ' × 閘門 ' + g.gate, '占星說你的' + ZH[k] + '在' + T.SIGNS[sg(p.lon)] + '座第 ' + hs + ' 宮，主題是「' + T.HOUSE[hs - 1] + '」；人類圖說它落在第 ' + g.gate + ' 號閘門「' + GATE[g.gate] + '」。兩者一起看，代表你在「' + T.HOUSE[hs - 1] + '」這件事上，會透過「' + GATE[g.gate] + '」這股能量展現自己。'];
    });
  }
  var TYPE_WISH = { generator: '願你把力氣用在讓你心動的事情上，每一天都累得剛好，滿足地睡去', mg: '願你的速度被理解，也願你允許自己跳過不必要的步驟',
    manifestor: '願你勇敢地開創，也願身邊的人跟得上你的光', projector: '願你在被邀請的地方發光，休息的時候，不覺得虧欠', reflector: '願你遇見讓你驚喜的環境，在對的地方，映照出最好的自己' };
  function blessing(r) {
    var pos = r.pos, h = r.houses;
    var TRAIT = ['勇敢', '沉穩', '好奇', '溫柔', '自信', '細心', '優雅', '深邃', '開朗', '篤定', '獨特', '柔軟'];
    return ['願你像' + IMG[sg(pos.sun.lon)] + '，', '不急著證明什麼，也知道自己正在發光。', '', '願你心裡像' + IMG[sg(pos.moon.lon)] + '的那一面，', '在疲憊的時候，也被好好照顧。',
      '願你每一次走進陌生的地方，', '都帶著' + T.SIGNS[sg(h.asc)] + '座' + TRAIT[sg(h.asc)] + '的光。', '', TYPE_WISH[r.hd.type] + '。', '你的價值不是做出來的，', '而是你本來就在。'];
  }

  root.BlueprintNarrative = { area: area, letter: letter, keyAspects: keyAspects, compare: compare, blessing: blessing, GATE: GATE, AREAS: ['love', 'career', 'social', 'family', 'health'] };
})(typeof self !== 'undefined' ? self : this);
