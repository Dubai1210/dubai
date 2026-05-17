/* ============================================================
   每日看番推荐 — 交互脚本（卡片版，支持多语言）
   ============================================================ */

(function () {
  'use strict';

  var ANIME_DATA_URL = 'data/anime.json';
  var grid = document.getElementById('da-grid');
  var loadMoreBtn = document.getElementById('da-load-more');
  var INITIAL_COUNT = 6;
  var LOAD_MORE_COUNT = 6;
  var allAnime = [];
  var shownCount = 0;

  // 类型中英映射
  var GENRE_CN = {
    'Action': '动作', 'Adventure': '冒险', 'Drama': '剧情', 'Comedy': '喜剧',
    'Fantasy': '奇幻', 'Romance': '恋爱', 'Supernatural': '超自然', 'Slice of Life': '日常',
    'Sci-Fi': '科幻', 'Mystery': '悬疑', 'Horror': '恐怖', 'Psychological': '心理',
    'Thriller': '惊悚', 'Sports': '运动', 'Historical': '历史', 'Music': '音乐',
    'Mecha': '机甲', 'Ecchi': '后宫', 'Mahou Shoujo': '魔法少女', 'Shounen': '少年',
    'Seinen': '青年', 'Shoujo': '少女', 'Josei': '女性', 'Isekai': '异世界',
    'Military': '军事', 'School': '校园', 'Game': '游戏', 'Parody': '搞笑',
    'Samurai': '武士', 'Martial Arts': '武术', 'Vampire': '吸血鬼', 'Harem': '后宫',
    'Reverse Harem': '逆后宫', 'Cars': '赛车', 'Space': '太空', 'Police': '警察',
    'Award Winning': '获奖', 'Gourmet': '美食', 'Workplace': '职场', 'Iyashikei': '治愈',
    'Racing': '竞速', 'Anthropomorphic': '拟人', 'CGDCT': '日常', 'Magical Sex Shift': '性转',
    'Gag Humor': '搞笑', 'Detective': '侦探', 'Organized Crime': '黑帮',
    'Crossdressing': '伪娘', 'Love Polygon': '多角恋', 'Idols (Female)': '偶像(女)',
    'Idols (Male)': '偶像(男)', 'Otaku Culture': '宅文化', 'Performing Arts': '表演艺术',
    'Pets': '宠物', 'Reincarnation': '转生', 'Time Travel': '穿越',
    'Video Game': '游戏', 'Visual Arts': '视觉艺术', 'Adult Cast': '成人向',
    'Childcare': '育儿', 'Delinquents': '不良', 'Educational': '教育',
    'High Stakes Game': '高赌注游戏', 'Medical': '医疗', 'Mythology': '神话',
    'Showbiz': '演艺圈', 'Super Power': '超能力', 'Survival': '生存',
    'Suspense': '悬疑', 'Team Sports': '团队运动', 'Tragedy': '悲剧',
    'Urban Fantasy': '都市奇幻', 'Villainess': '恶役千金', 'Combat Sports': '格斗运动',
    'Epic': '史诗', 'Avant Garde': '实验', 'Boys Love': '耽美', 'Girls Love': '百合',
    'Erotica': '情色', 'Hentai': '成人', 'Romantic Subtext': '暧昧'
  };

  // 日文类型映射
  var GENRE_JA = {
    'Action': 'アクション', 'Adventure': 'アドベンチャー', 'Drama': 'ドラマ',
    'Comedy': 'コメディ', 'Fantasy': 'ファンタジー', 'Romance': '恋愛',
    'Supernatural': '超自然', 'Slice of Life': '日常', 'Sci-Fi': 'SF',
    'Mystery': 'ミステリー', 'Horror': 'ホラー', 'Psychological': '心理',
    'Thriller': 'スリラー', 'Sports': 'スポーツ', 'Historical': '歴史',
    'Music': '音楽', 'Mecha': 'メカ', 'Ecchi': 'エッチ', 'Harem': 'ハーレム',
    'Shounen': '少年', 'Seinen': '青年', 'Shoujo': '少女', 'Josei': '女性向け',
    'Isekai': '異世界', 'Military': '軍事', 'School': '学園', 'Game': 'ゲーム',
    'Parody': 'パロディ', 'Samurai': '侍', 'Martial Arts': '武術',
    'Vampire': '吸血鬼', 'Racing': 'レース', 'Space': '宇宙', 'Police': '警察',
    'Award Winning': '受賞', 'Gourmet': 'グルメ', 'Workplace': '職場',
    'Iyashikei': '癒やし', 'Detective': '探偵', 'Organized Crime': 'マフィア',
    'Reincarnation': '転生', 'Time Travel': 'タイムリープ', 'Super Power': '超能力',
    'Survival': 'サバイバル', 'Suspense': 'サスペンス', 'Team Sports': '団体競技',
    'Tragedy': '悲劇', 'Urban Fantasy': '都市ファンタジー', 'Villainess': '悪役令嬢',
    'Combat Sports': '格闘技', 'Epic': '叙事詩', 'Medical': '医療',
    'Revenge': '復讐', 'Family': '家族', 'Post-Apocalyptic': '終末',
    'Cyberpunk': 'サイバーパンク', 'Dark Fantasy': 'ダークファンタジー',
    'Competition': '競技', 'Crime': '犯罪', 'Philosophy': '哲学',
    'Original': 'オリジナル', 'Various': '総合', 'Dark': 'ダーク',
    'Mahou Shoujo': '魔法少女', 'Boys Love': 'BL', 'Girls Love': '百合',
    'Romantic Subtext': '恋愛要素', 'Avant Garde': 'アバンギャルド'
  };
  // 中文→英文反向映射
  var GENRE_EN = {};
  Object.keys(GENRE_CN).forEach(function (k) { GENRE_EN[GENRE_CN[k]] = k; });

  function translateGenre(genreText) {
    var lang = getLang();
    if (lang === 'ja') {
      return genreText.split(' / ').map(function (g) {
        return GENRE_JA[g] || GENRE_CN[g] || g;
      }).join(' / ');
    }
    if (lang === 'en') {
      // 英文模式：如果类型含中文，反向翻译为英文
      return genreText.split(' / ').map(function (g) {
        return GENRE_EN[g] || g;
      }).join(' / ');
    }
    // 中文模式：英文→中文翻译
    return genreText.split(' / ').map(function (g) {
      return GENRE_CN[g] || g;
    }).join(' / ');
  }

  // 语言标签
  var LABELS = {
    zh: { epMovie: '部剧场版', epSeries: '集', reason: '推荐理由', loadFail: '加载失败，请稍后重试' },
    en: { epMovie: 'movie',    epSeries: 'eps', reason: 'Why Watch', loadFail: 'Failed to load. Please try again later.' },
    ja: { epMovie: '劇場版',   epSeries: '話',  reason: 'おすすめの理由', loadFail: '読み込み失敗。後でもう一度お試しください。' }
  };

  function getLang() {
    return (window.i18n && window.i18n.getLanguage()) || 'zh';
  }

  function getLabels() {
    return LABELS[getLang()] || LABELS.zh;
  }

  // 按年份降序，同 year 按评分降序
  function sortByYearAndRating(list) {
    return list.slice().sort(function (a, b) {
      if (b.year !== a.year) return b.year - a.year;
      return b.rating - a.rating;
    });
  }

  // 排序：年份降序 → 评分降序（不轮转，每日新鲜感由 API 24h 更新保证）
  function dailyShuffle(list) {
    return list.slice().sort(function (a, b) {
      if (b.year !== a.year) return b.year - a.year;
      return b.rating - a.rating;
    });
  }

  function formatDate() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    var lang = getLang();
    if (lang === 'en') {
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      return months[now.getMonth()] + ' ' + d + ', ' + y + ' ' + days[now.getDay()];
    }
    if (lang === 'ja') {
      var weekdaysJa = ['日','月','火','水','木','金','土'];
      return y + '年' + m + '月' + d + '日 (' + weekdaysJa[now.getDay()] + ')';
    }
    var weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return y + '年' + m + '月' + d + '日 星期' + weekdays[now.getDay()];
  }

  // 根据语言选择双语字段（含数据完整性检查）
  function hasCJK(s) { return /[一-鿿]/.test(s || ''); }
  function hasJapanese(s) { return /[぀-ゟ゠-ヿ]/.test(s || ''); }
  function pick(anime, zhField, enField, jaField, fallback) {
    var lang = getLang();
    if (lang === 'ja') {
      // 日语模式：严格只返回日文或英文，绝不回退到中文
      var jaVal = anime[jaField] || '';
      if (jaVal) return jaVal;
      var enValJ = anime[enField] || '';
      if (enValJ && !hasCJK(enValJ)) return enValJ;
      var fbValJ = anime[fallback] || '';
      if (fbValJ && !hasCJK(fbValJ)) return fbValJ;
      // 最后手段：用英文字段，跳过中文
      var lastEn = anime[enField] || '';
      return lastEn;
    }
    if (lang === 'en') {
      // 英文模式：优先英文字段，跳过含 CJK 的损坏数据
      var enVal = anime[enField] || '';
      if (enVal && !hasCJK(enVal)) return enVal;
      var fbVal = anime[fallback] || '';
      if (fbVal && !hasCJK(fbVal)) return fbVal;
      return anime[zhField] || anime[enField] || '';
    }
    // 中文模式：优先中文字段
    var zhVal = anime[zhField] || '';
    if (zhVal) return zhVal;
    var fbVal2 = anime[fallback] || '';
    if (fbVal2) return fbVal2;
    return anime[enField] || '';
  }

  function createCard(anime, index) {
    var lang = getLang();
    var labels = getLabels();
    var card = document.createElement('a');
    card.className = 'da-card';
    card.style.animationDelay = (0.1 + index * 0.07) + 's';
    // 使用 AniList 搜索链接
    var searchTitle = anime.titleEn || anime.title;
    card.href = 'https://anilist.co/search/anime?search=' + encodeURIComponent(searchTitle);
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    // 根据语言选择主标题和副标题
    var mainTitle, subTitle;
    if (lang === 'ja') {
      // 日语：优先日语标题 → 英语
      mainTitle = (anime.titleJa && anime.titleJa !== '') ? anime.titleJa : (anime.titleEn || anime.title);
      subTitle = (mainTitle === anime.titleJa && anime.titleEn && anime.titleEn !== anime.titleJa) ? anime.titleEn : '';
    } else if (lang === 'en') {
      // 英语：优先英语标题 → 日语原名（绝不显示中文副标题）
      mainTitle = anime.titleEn || anime.title;
      subTitle = (anime.titleJa && anime.titleJa !== mainTitle) ? anime.titleJa : '';
    } else {
      // 中文：优先中文标题 → 日语原名 → 英语
      mainTitle = anime.title;
      if (anime.titleJa && anime.titleJa !== mainTitle) {
        subTitle = anime.titleJa;
      } else {
        subTitle = anime.titleEn || '';
      }
    }

    var epLabel = anime.episodes === 1 ? labels.epMovie : labels.epSeries;
    var summaryText = pick(anime, 'summaryZh', 'summaryEn', 'summaryJa', 'summary');
    var reasonText = pick(anime, 'reasonZh', 'reasonEn', 'reasonJa', 'reason');
    var quoteText = pick(anime, 'quoteZh', 'quoteEn', 'quoteJa', 'quote');
    // 日语模式最终防护：绝不显示含 CJK 的文本（回退到英文通用语）
    if (lang === 'ja') {
      if (hasCJK(reasonText)) reasonText = 'A highly rated anime worth watching.';
      if (hasCJK(quoteText)) quoteText = 'This anime is worth your time.';
      if (hasCJK(summaryText)) summaryText = anime.summaryEn || anime.summary || '';
    }

    card.innerHTML =
      '<div class="da-card-top">' +
        '<div class="da-card-score"><i class="ri-star-fill"></i> ' + anime.rating + '</div>' +
        '<span class="da-card-year">' + anime.year + '</span>' +
      '</div>' +
      '<h3 class="da-card-title">' + mainTitle + '</h3>' +
      (subTitle ? '<div class="da-card-title-en">' + subTitle + '</div>' : '') +
      '<div class="da-card-tags">' +
        '<span class="da-card-tag">' + translateGenre(anime.genre) + '</span>' +
        '<span class="da-card-tag">' + anime.episodes + ' ' + epLabel + '</span>' +
        '<span class="da-card-tag">' + anime.studio + '</span>' +
      '</div>' +
      '<p class="da-card-summary">' + summaryText + '</p>' +
      '<div class="da-card-reason">' +
        '<div class="da-card-reason-label"><i class="ri-lightbulb-line"></i> ' + labels.reason + '</div>' +
        '<p>' + reasonText + '</p>' +
      '</div>' +
      '<div class="da-card-quote">&ldquo;' + quoteText + '&rdquo;</div>';

    return card;
  }

  // 完整重渲染（语言切换时用）
  function rerenderCards() {
    grid.innerHTML = '';
    shownCount = 0;
    document.getElementById('da-date').textContent = formatDate();
    renderCards(INITIAL_COUNT);
  }

  function renderCards(count) {
    var end = Math.min(shownCount + count, allAnime.length);
    for (var i = shownCount; i < end; i++) {
      grid.appendChild(createCard(allAnime[i], i));
    }
    shownCount = end;

    if (shownCount >= allAnime.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = '';
    }
  }

  // 加载数据：先加载静态 JSON（有完整中文），再用 API 补充新番
  function loadData(list) {
    document.getElementById('da-date').textContent = formatDate();
    allAnime = dailyShuffle(list);
    renderCards(INITIAL_COUNT);
  }

  function mergeData(staticList, apiList) {
    var GENERIC_ZH = '高分好评作品，值得一看。';
    var GENERIC_QUOTE_ZH = '这部作品值得你的时间。';
    var GENERIC_EN = 'A highly rated anime worth watching.';
    var GENERIC_QUOTE_EN = 'This anime is worth your time.';
    // 检测字符串是否含中日韩字符
    function hasCJK(s) { return /[一-鿿぀-ゟ゠-ヿ]/.test(s || ''); }
    var apiByTitleEn = {};
    var apiByTitle = {};
    apiList.forEach(function (a) {
      if (a.titleEn) apiByTitleEn[a.titleEn] = a;
      if (a.title) apiByTitle[a.title] = a;
    });
    staticList.forEach(function (a) {
      var api = apiByTitleEn[a.titleEn] || apiByTitle[a.title];
      if (!api) return;
      // 中文：用 API 优质数据覆盖通用文本
      if (a.reasonZh === GENERIC_ZH && api.reasonZh !== GENERIC_ZH) {
        a.reasonZh = api.reasonZh; a.reason = api.reason;
      }
      if (a.quoteZh === GENERIC_QUOTE_ZH && api.quoteZh !== GENERIC_QUOTE_ZH) {
        a.quoteZh = api.quoteZh; a.quote = api.quote;
      }
      // 英文：用 API 优质数据覆盖通用文本
      if ((!a.reasonEn || a.reasonEn === GENERIC_EN) && api.reasonEn !== GENERIC_EN) {
        a.reasonEn = api.reasonEn;
      }
      if ((!a.quoteEn || a.quoteEn === GENERIC_QUOTE_EN) && api.quoteEn !== GENERIC_QUOTE_EN) {
        a.quoteEn = api.quoteEn;
      }
      // 日语：API 有日语数据则覆盖
      if (api.reasonJa && api.reasonJa !== a.reasonJa) {
        a.reasonJa = api.reasonJa;
      }
      if (api.quoteJa && api.quoteJa !== a.quoteJa) {
        a.quoteJa = api.quoteJa;
      }
      if (api.titleJa && !a.titleJa) {
        a.titleJa = api.titleJa;
      }
      // summaryEn：修复含 CJK 字符的损坏英文摘要
      if (!a.summaryEn || hasCJK(a.summaryEn)) {
        a.summaryEn = api.summaryEn || api.summary || a.summaryEn;
        if (!a.summaryEn) a.summaryEn = a.summary || '';
      }
      // genre：静态 JSON 含中文类型时，换用 API 的英文类型（保证各语言模式都能正确翻译）
      if (hasCJK(a.genre) && api.genre && !hasCJK(api.genre)) {
        a.genre = api.genre;
      }
    });
    var titles = {};
    staticList.forEach(function (a) { titles[a.titleEn || a.title] = true; });
    var merged = staticList.slice();
    apiList.forEach(function (a) {
      var key = a.titleEn || a.title;
      if (!titles[key]) {
        titles[key] = true;
        merged.push(a);
      }
    });
    return merged;
  }

  // 先加载静态 JSON
  fetch(ANIME_DATA_URL)
    .then(function (res) { return res.json(); })
    .then(function (staticData) {
      // 再尝试从 API 获取实时数据，合并新番
      fetch('/api/anime')
        .then(function (res) { return res.json(); })
        .then(function (apiData) {
          if (Array.isArray(apiData) && apiData.length > 0) {
            loadData(mergeData(staticData, apiData));
          } else {
            loadData(staticData);
          }
        })
        .catch(function () {
          // API 失败，只用静态数据
          loadData(staticData);
        });
    })
    .catch(function () {
      var labels = getLabels();
      grid.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);padding:40px 0;">' + labels.loadFail + '</p>';
    });

  // 加载更多
  loadMoreBtn.addEventListener('click', function () {
    renderCards(LOAD_MORE_COUNT);
  });

  // 监听语言切换，重新渲染卡片
  document.addEventListener('languageChanged', function () {
    rerenderCards();
  });
})();
