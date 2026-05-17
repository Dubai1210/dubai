/* ============================================================
   历史上的今天 — 直接从对应语言维基获取
   ============================================================ */

(function () {
  'use strict';

  // ========== 常量 ==========
  var PER_PAGE = 15;

  var TAGS = {
    war:     { zh: '军事', en: 'Military', ja: '軍事' },
    politics:{ zh: '政治', en: 'Politics', ja: '政治' },
    science: { zh: '科学', en: 'Science', ja: '科学' },
    tech:    { zh: '科技', en: 'Technology', ja: 'テクノロジー' },
    people:  { zh: '人物', en: 'People', ja: '人物' },
    culture: { zh: '文化', en: 'Culture', ja: '文化' }
  };

  var MONTHS = {
    en: ['','January','February','March','April','May','June','July','August','September','October','November','December'],
    zh: ['','一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    ja: ['','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  };

  var MORE_TEXT = { zh: '更多事件', en: 'More Events', ja: 'もっと見る' };
  var BACK_TEXT = { zh: '返回主页', en: 'Back to Home', ja: 'ホームに戻る' };

  // 预编译正则
  var RE_WAR = /war|battle|invasion|bomb|military|attack|siege/;
  var RE_POL = /president|prime minister|revolution|election|parliament|treaty|kingdom|republic/;
  var RE_SCI = /discover|invent|science|physics|chemistry|dna|space|rocket|nuclear/;
  var RE_TECH = /computer|internet|software|technology|telephone/;
  var RE_PEO = /born|died|death|birth/;

  // ========== 状态 ==========
  var allEvents = [], shown = 0, container = null, observer = null;

  function L() { return (window.i18n && window.i18n.getLanguage()) || 'zh'; }
  function $(id) { return document.getElementById(id); }

  // ========== 翻译 ==========
  function translateText(text, target) {
    if (target === 'en') return Promise.resolve(text);
    return fetch('/api/translate?q=' + encodeURIComponent(text.substring(0, 400)) + '&lang=' + target)
      .then(function (r) { return r.json(); })
      .then(function (d) { return (d && d.text) || text; })
      .catch(function () { return text; });
  }

  function translateBatch(events) {
    var target = L();
    if (target === 'en') return Promise.resolve(events);
    return Promise.all(events.map(function (ev) {
      return translateText(ev.text, target).then(function (t) {
        return { year: ev.year, text: t, tag: ev.tag };
      });
    }));
  }

  // ========== 维基百科 ==========
  function fetchWiki(wl, m, d) {
    var title = wl === 'en' ? MONTHS.en[m] + ' ' + d : m + '月' + d + '日';
    var url = 'https://' + wl + '.wikipedia.org/w/api.php?action=parse&page=' +
      encodeURIComponent(title) + '&prop=wikitext&format=json&origin=*';
    return fetch(url).then(function (r) { return r.json(); })
      .then(function (d) { return (d && d.parse && d.parse.wikitext) ? parse(d.parse.wikitext['*']) : []; })
      .catch(function () { return []; });
  }

  function fetchMuffin(m, d) {
    return fetch('https://history.muffinlabs.com/date/' + m + '/' + d)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.data || !d.data.Events) return [];
        return d.data.Events.map(function (e) {
          return { year: parseInt(e.year), text: e.text, tag: guessTag(e.text) };
        }).filter(function (e) { return e.year && e.text; });
      }).catch(function () { return []; });
  }

  // ========== 解析 wikitext ==========
  function parse(text) {
    var sec = text.match(/==\s*(Events|大事[记記])\s*==([\s\S]*?)(?=\s*==|$)/i);
    if (!sec) return [];
    var lines = sec[2].split('\n'), out = [];
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (l.charAt(0) !== '*' || l.charAt(1) === '*') continue;
      var ym = l.match(/\[\[(\d{1,4})年\]\]/) || l.match(/(\d{3,4})年/);
      if (!ym) continue;
      var year = parseInt(ym[1]);
      if (year < 100 || year > 2100) continue;
      var txt = l.replace(/^\*\s*/, '')
        .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
        .replace(/'''?([^']+)'''?/g, '$1')
        .replace(/\{\{[^}]*\}\}/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/^\d{4}年\s*[–—-]\s*/, '')
        .replace(/^\d{4}年\s*/, '')
        .trim();
      if (txt.length >= 5 && txt.length <= 300) out.push({ year: year, text: txt, tag: guessTag(txt) });
    }
    return out;
  }

  function guessTag(t) {
    t = t.toLowerCase();
    if (RE_WAR.test(t)) return 'war';
    if (RE_POL.test(t)) return 'politics';
    if (RE_SCI.test(t)) return 'science';
    if (RE_TECH.test(t)) return 'tech';
    if (RE_PEO.test(t)) return 'people';
    return 'culture';
  }

  // ========== 渲染 ==========
  function getObserver() {
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
    }
    return observer;
  }

  function render(events, append) {
    if (!append) container.innerHTML = '';
    if (!events || !events.length) {
      if (!append) showStatus('tih-empty', 'ri-calendar-line');
      return;
    }

    var lang = L();
    var frag = document.createDocumentFragment();
    events.forEach(function (ev) {
      var div = document.createElement('div');
      div.className = 'tih-event';
      var tl = TAGS[ev.tag] ? (TAGS[ev.tag][lang] || TAGS[ev.tag].zh) : '';
      var th = tl ? '<span class="tih-event-tag ' + ev.tag + '">' + tl + '</span>' : '';
      div.innerHTML =
        '<div class="tih-event-dot"></div>' +
        '<div class="tih-event-card">' +
          '<span class="tih-event-year">' + ev.year + '</span>' +
          '<p class="tih-event-text">' + ev.text + '</p>' +
          th +
        '</div>';
      frag.appendChild(div);
    });
    container.appendChild(frag);

    // 滚动动画
    requestAnimationFrame(function () {
      var ob = getObserver();
      container.querySelectorAll('.tih-event:not(.visible)').forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.08) + 's';
        ob.observe(el);
      });
    });

    // "更多"按钮
    var old = container.querySelector('.tih-more-btn');
    if (old) old.remove();
    if (shown < allEvents.length) {
      var btn = document.createElement('div');
      btn.className = 'tih-more-btn';
      btn.innerHTML = '<button class="tih-more-btn-inner">' + (MORE_TEXT[lang] || MORE_TEXT.zh) + '</button>';
      container.appendChild(btn);
      btn.querySelector('button').onclick = loadMore;
    }
  }

  function showStatus(cls, icon) {
    container.innerHTML = '<div class="' + cls + '"><div class="' + cls + '-icon"><i class="' + icon + '"></i></div></div>';
  }

  // ========== 加载 ==========
  function loadMore() {
    var batch = allEvents.slice(shown, shown + PER_PAGE);
    shown += batch.length;
    translateBatch(batch).then(function (t) { render(t, true); });
  }

  function load(m, d) {
    container.innerHTML = '<div class="tih-loading"><div class="tih-loading-spinner"></div></div>';
    allEvents = []; shown = 0;

    var wl = L();
    var primary = wl === 'en' ? fetchWiki('en', m, d) : fetchWiki('zh', m, d);
    var fallback = wl === 'en' ? fetchWiki('zh', m, d) : fetchWiki('en', m, d);

    primary
      .then(function (evs) { return evs.length ? evs : fallback; })
      .then(function (evs) { return evs.length ? evs : fetchMuffin(m, d); })
      .then(function (evs) {
        if (!evs.length) { showStatus('tih-empty', 'ri-calendar-line'); return; }
        evs.sort(function (a, b) { return b.year - a.year; });
        allEvents = evs;
        var batch = allEvents.slice(0, PER_PAGE);
        shown = batch.length;
        translateBatch(batch).then(function (t) { render(t, false); });
      })
      .catch(function () { showStatus('tih-empty', 'ri-wifi-off-line'); });
  }

  // ========== 日期显示 ==========
  function updateDate(m, d) {
    var el = $('tih-date-display');
    if (!el) return;
    var l = L();
    var n = (MONTHS[l] || MONTHS.zh)[m];
    var txt = l === 'en' ? n + ' ' + d : m + '月' + d + '日';
    el.innerHTML = '历史上的 <span class="tih-date-num">' + txt + '</span>';
  }

  // ========== 初始化 ==========
  function init() {
    container = $('tih-timeline');
    if (!container) return;

    var now = new Date(), cm = now.getMonth() + 1, cd = now.getDate();
    var input = $('tih-date-input'), btn = $('tih-query-btn');

    function go(m, d) {
      cm = m; cd = d;
      updateDate(m, d);
      if (input) input.value = now.getFullYear() + '-' + String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      load(m, d);
    }

    go(cm, cd);

    if (btn) btn.onclick = function () {
      if (!input || !input.value) return;
      var p = input.value.split('-');
      if (p.length === 3) { var m = +p[1], d = +p[2]; if (m >= 1 && m <= 12 && d >= 1 && d <= 31) go(m, d); }
    };
    if (input) input.onkeydown = function (e) { if (e.key === 'Enter') btn.click(); };

    document.addEventListener('languageChanged', function () {
      updateDate(cm, cd);
      if (allEvents.length) {
        translateBatch(allEvents.slice(0, shown)).then(function (t) { render(t, false); });
      }
    });

    var topBtn = $('back-to-top');
    if (topBtn) {
      var sc = document.querySelector('.main-scroll');
      if (sc) sc.onscroll = function () { topBtn.classList.toggle('visible', sc.scrollTop > 400); };
      topBtn.onclick = function () { if (sc) sc.scrollTo({ top: 0, behavior: 'smooth' }); };
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
