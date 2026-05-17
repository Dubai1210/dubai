/* ============================================================
   多语言切换 — 支持 中文 / English / 日本語
   ============================================================ */

(function () {
  'use strict';

  // ========== 语言定义 ==========
  var SUPPORTED_LANGS = ['zh', 'en', 'ja'];

  var LANG_LABELS = {
    zh: '中文',
    en: 'English',
    ja: '日本語'
  };

  // ========== 当前语言 ==========
  var currentLang = localStorage.getItem('site-lang');
  if (!currentLang || SUPPORTED_LANGS.indexOf(currentLang) === -1) {
    // 尝试从浏览器语言推断
    var browserLang = (navigator.language || navigator.userLanguage || '').split('-')[0];
    currentLang = SUPPORTED_LANGS.indexOf(browserLang) !== -1 ? browserLang : 'zh';
  }

  // ========== 翻译函数 ==========
  // messages 格式: { zh: ()=> "中文", en: ()=> "English", ja: ()=> "日本語" }
  // 或: { zh: "静态文本", en: "Static text", ja: "静的テキスト" }
  function translate(messages, args) {
    var lang = currentLang;
    var msg;

    // 优先精确匹配当前语言
    if (messages[lang]) {
      msg = messages[lang];
    }
    // 回退: zh-cn → zh
    if (!msg && lang.indexOf('-') !== -1) {
      var base = lang.split('-')[0];
      if (messages[base]) {
        msg = messages[base];
      }
    }
    // 回退: en
    if (!msg && messages.en) {
      msg = messages.en;
    }
    // 回退: zh
    if (!msg && messages.zh) {
      msg = messages.zh;
    }
    // 最后回退: 第一个可用的
    if (!msg) {
      var keys = Object.keys(messages);
      if (keys.length > 0) {
        msg = messages[keys[0]];
      }
    }
    if (!msg) return '';

    if (typeof msg === 'function') {
      return msg.apply(null, args || []);
    }
    return msg;
  }

  // ========== 语言切换 ==========
  function setLanguage(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) return;
    if (lang === currentLang) return;

    currentLang = lang;
    localStorage.setItem('site-lang', lang);

    // 设置 HTML lang 属性
    document.documentElement.lang = lang === 'ja' ? 'ja' : lang === 'en' ? 'en' : 'zh-CN';

    // 刷新所有翻译
    refreshTranslations();

    // 触发自定义事件
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
  }

  function getLanguage() {
    return currentLang;
  }

  function nextLanguage() {
    var idx = SUPPORTED_LANGS.indexOf(currentLang);
    var nextIdx = (idx + 1) % SUPPORTED_LANGS.length;
    setLanguage(SUPPORTED_LANGS[nextIdx]);
  }

  // ========== 翻译刷新 ==========
  // 翻译消息表 — 集中管理所有页面文本
  var translations = {
    // 导航栏
    'nav.blog':       function () { return translate({ zh: '动态',         en: 'Blog',         ja: 'ブログ' }); },
    'nav.article':    function () { return translate({ zh: '博客动态',     en: 'Blog',          ja: 'ブログ' }); },
    'nav.home':       function () { return translate({ zh: '主页',         en: 'Home',          ja: 'ホーム' }); },
    'nav.login':      function () { return translate({ zh: '登录',         en: 'Login',         ja: 'ログイン' }); },
    'nav.langLabel':  function () { return translate({ zh: '中文',         en: 'English',       ja: '日本語' }); },
    'nav.langMobile': function () { return translate({ zh: '切换语言',     en: 'Language',      ja: '言語切替' }); },

    // 英雄区
    'hero.line1.before': function () { return translate({ zh: '我在',      en: 'I\'m ',        ja: '私は' }); },
    'hero.line1.under':  function () { return translate({ zh: '做一些',    en: 'making',        ja: '作っている' }); },
    'hero.line2.before': function () { return translate({ zh: '有意思的',  en: 'interesting',   ja: '面白い' }); },
    'hero.line2.emph':   function () { return translate({ zh: '应用',      en: 'Apps',          ja: 'アプリ' }); },
    'hero.intro.before': function () { return translate({ zh: '我是 ',     en: 'I am ',         ja: '私は' }); },
    'hero.intro.after':  function () { return translate({ zh: '，这是我的最新项目。', en: ', this is my latest project.', ja: '、これは私の最新プロジェクトです。' }); },

    // 应用卡片
    'hero.card.title':   function () { return translate({ zh: '白噪音',     en: 'White Noise',    ja: 'ホワイトノイズ' }); },
    'hero.card.desc':    function () { return translate({
      zh: '精选多种白噪音与环境音，助你放松身心、专注工作、安稳入眠。',
      en: 'A curated collection of white noise and ambient sounds to relax, focus, and sleep better.',
      ja: '厳選したホワイトノイズと環境音で、リラックス、集中、快適な眠りを。'
    }); },
    'hero.card.btn':     function () { return translate({ zh: '前往：抢先体验', en: 'Try Early Access', ja: '早期アクセスへ' }); },

    // 浮动卡片
    'hero.float.title':  function () { return translate({ zh: '神秘项目',   en: 'Mystery Project', ja: '秘密のプロジェクト' }); },
    'hero.float.btn':    function () { return translate({ zh: '入口',       en: 'Enter',         ja: '入る' }); },

    // 项目区
    'section.apps':      function () { return translate({ zh: '作品', en: 'Works', ja: 'ポートフォリオ' }); },
    'project.expand':    function () { return translate({ zh: '展开全部',   en: 'Show All',      ja: '全て展開' }); },
    'project.collapse':  function () { return translate({ zh: '收起',       en: 'Collapse',      ja: '折りたたむ' }); },
    'project.count':     function (n) { return translate({ zh: '(共 ' + n + ' 个)', en: '(' + n + ' total)', ja: '(全' + n + '件)' }); },

    // 页脚
    'footer.projects':   function () { return translate({ zh: '项目展示',   en: 'Projects',      ja: 'プロジェクト' }); },
    'footer.home':       function () { return translate({ zh: '首页',       en: 'Home',          ja: 'ホーム' }); },
    'footer.blog':       function () { return translate({ zh: '我的博客',   en: 'My Blog',       ja: 'ブログ' }); },
    'footer.lang':       function () { return translate({ zh: '切换语言',   en: 'Language',      ja: '言語切替' }); },
    'footer.copyright':  function () { return '© ' + new Date().getFullYear() + ' Dubai. All rights reserved.'; },
    'footer.disclaimer': function () { return translate({ zh: '免责声明', en: 'Disclaimer', ja: '免責事項' }); },

    // 每日看番推荐
    'da.title':    function () { return translate({ zh: '每日看番推荐', en: 'Daily Anime Picks', ja: '毎日のアニメおすすめ' }); },
    'da.loadMore': function () { return translate({ zh: '查看更多', en: 'Load More', ja: 'もっと見る' }); },

    // 项目展示页
    'projects.title':         function () { return translate({ zh: '项目展示',         en: 'Projects',              ja: 'プロジェクト' }); },
    'projects.subtitle':      function () { return translate({ zh: '每一个项目都是独立打磨的作品', en: 'Every project is crafted independently', ja: 'すべてのプロジェクトは独立して作られています' }); },
    'projects.current':       function () { return translate({ zh: '当前项目',         en: 'Current Projects',      ja: '現在のプロジェクト' }); },
    'projects.more':          function () { return translate({ zh: '更多项目即将到来',   en: 'More projects coming soon', ja: 'さらに多くのプロジェクトが近日公開' }); },
    'projects.future':        function () { return translate({ zh: '后续计划',         en: 'Upcoming',              ja: '今後の予定' }); },
    'projects.visit':         function () { return translate({ zh: '查看项目',         en: 'View Project',          ja: 'プロジェクトを見る' }); },
    'projects.coming':        function () { return translate({ zh: '即将推出',         en: 'Coming Soon',           ja: '近日公開' }); },
    'projects.mystery.desc':  function () { return translate({ zh: '正在开发中，敬请期待。', en: 'Under development, stay tuned.', ja: '開発中です、お楽しみに。' }); },
    'projects.placeholder.title':  function () { return translate({ zh: '你的下一个项目',   en: 'Your Next Project',     ja: '次のプロジェクト' }); },
    'projects.placeholder.title2': function () { return translate({ zh: '预留位置',         en: 'Reserved Slot',         ja: '予約枠' }); },
    'projects.placeholder.desc':   function () { return translate({ zh: '这里将展示你未来创建的新项目', en: 'Your future projects will appear here', ja: '今後作成するプロジェクトがここに表示されます' }); },
    'projects.placeholder.desc2':  function () { return translate({ zh: '有想法就动手，随时在这里添加新卡片', en: 'Got an idea? Add a new card here anytime', ja: 'アイデアがあればいつでもここに追加してください' }); },
    'projects.placeholder.tag':    function () { return translate({ zh: '待发布',           en: 'Pending',               ja: '公開待ち' }); },

    // 历史上的今天
    'tih.title':         function () { return translate({ zh: '历史上的今天', en: 'Today in History', ja: '今日の歴史' }); },
    'tih.query':         function () { return translate({ zh: '查询',       en: 'Search',          ja: '検索' }); },
    'tih.back':          function () { return translate({ zh: '返回主页', en: 'Back to Home', ja: 'ホームに戻る' }); },
    'tih.card.title':    function () { return translate({ zh: '历史上的今天', en: 'Today in History', ja: '今日の歴史' }); },
    'tih.card.desc':     function () { return translate({
      zh: '探索每一天的重大历史事件，以时间轴卡片形式呈现，支持多语言切换。',
      en: 'Explore major historical events for each day, presented in a timeline card format with multi-language support.',
      ja: '毎日の重要な歴史的イベントをタイムラインカード形式で探索、多言語切替に対応。'
    }); },

    // 移动端
    'mobile.logo':       function () { return translate({ zh: '我的Logo',   en: 'My Logo',       ja: 'マイロゴ' }); },
    'mobile.close':      function () { return translate({ zh: '关闭菜单',   en: 'Close Menu',    ja: 'メニューを閉じる' }); },
    'mobile.open':       function () { return translate({ zh: '打开菜单',   en: 'Open Menu',     ja: 'メニューを開く' }); },

    // 音频
    'audio.bgMusic':     function () { return translate({ zh: '背景音乐',   en: 'Background Music', ja: 'BGM' }); },

    // 登录模态框
    'login.title':       function () { return translate({ zh: '欢迎回来',       en: 'Welcome Back',      ja: 'おかえりなさい' }); },
    'login.subtitle':    function () { return translate({ zh: '登录你的账户继续', en: 'Sign in to continue', ja: 'アカウントにサインイン' }); },
    'login.emailLabel':  function () { return translate({ zh: '用户名或邮箱',   en: 'Username or Email', ja: 'ユーザー名またはメール' }); },
    'login.passwordLabel': function () { return translate({ zh: '密码',         en: 'Password',          ja: 'パスワード' }); },
    'login.remember':    function () { return translate({ zh: '记住我',         en: 'Remember me',       ja: 'ログイン状態を保持' }); },
    'login.forgot':      function () { return translate({ zh: '忘记密码？',     en: 'Forgot password?',  ja: 'パスワードをお忘れですか？' }); },
    'login.submit':      function () { return translate({ zh: '登录',           en: 'Sign In',           ja: 'サインイン' }); },
    'login.noAccount':   function () { return translate({ zh: '还没有账户？',   en: "Don't have an account?", ja: 'アカウントをお持ちでないですか？' }); },
    'login.register':    function () { return translate({ zh: '立即注册',       en: 'Sign up',           ja: '新規登録' }); },

    // 注册模态框
    'register.title':       function () { return translate({ zh: '创建账户',       en: 'Create Account',    ja: 'アカウント作成' }); },
    'register.subtitle':    function () { return translate({ zh: '注册一个新账户开始使用', en: 'Register to get started', ja: '新規登録して開始' }); },
    'register.usernameLabel': function () { return translate({ zh: '用户名',       en: 'Username',          ja: 'ユーザー名' }); },
    'register.emailLabel':  function () { return translate({ zh: '邮箱地址',       en: 'Email Address',     ja: 'メールアドレス' }); },
    'register.codeLabel':   function () { return translate({ zh: '验证码',         en: 'Verify Code',       ja: '認証コード' }); },
    'register.sendCode':    function () { return translate({ zh: '发送验证码',     en: 'Send Code',         ja: 'コード送信' }); },
    'register.passwordLabel': function () { return translate({ zh: '密码',         en: 'Password',          ja: 'パスワード' }); },
    'register.confirmLabel': function () { return translate({ zh: '确认密码',      en: 'Confirm Password',  ja: 'パスワード確認' }); },
    'register.submit':      function () { return translate({ zh: '注册',           en: 'Sign Up',           ja: '新規登録' }); },
    'register.hasAccount':  function () { return translate({ zh: '已有账户？',     en: 'Already have an account?', ja: 'アカウントをお持ちですか？' }); },
    'register.login':       function () { return translate({ zh: '立即登录',       en: 'Sign in',           ja: 'サインイン' }); },

    // 忘记密码模态框
    'forgot.title':       function () { return translate({ zh: '忘记密码',       en: 'Forgot Password',   ja: 'パスワードをお忘れですか' }); },
    'forgot.subtitle':    function () { return translate({ zh: '输入邮箱地址重置密码', en: 'Enter email to reset password', ja: 'メールアドレスを入力してパスワードをリセット' }); },
    'forgot.emailLabel':  function () { return translate({ zh: '邮箱地址',       en: 'Email Address',     ja: 'メールアドレス' }); },
    'forgot.submit':      function () { return translate({ zh: '发送重置链接',   en: 'Send Reset Link',   ja: 'リセットリンクを送信' }); },
    'forgot.back':        function () { return translate({ zh: '返回登录',       en: 'Back to Login',     ja: 'ログインに戻る' }); },
    'forgot.successTitle': function () { return translate({ zh: '邮件已发送',    en: 'Email Sent',        ja: 'メール送信完了' }); },
    'forgot.successDesc': function () { return translate({ zh: '请检查你的邮箱并点击重置链接', en: 'Check your email and click the reset link', ja: 'メールを確認してリセットリンクをクリックしてください' }); },
    'forgot.successHint': function () { return translate({ zh: '没有收到邮件？请检查垃圾邮件文件夹', en: "Didn't receive? Check your spam folder", ja: '届かない場合はスパムフォルダを確認してください' }); },
    'forgot.backToLogin': function () { return translate({ zh: '返回登录',       en: 'Back to Login',     ja: 'ログインに戻る' }); }
  };

  // data-i18n → translations 的映射
  function getTextByKey(key) {
    if (translations[key]) {
      return translations[key]();
    }
    // 支持带参数的 key: "project.count:6"
    var colonIdx = key.indexOf(':');
    if (colonIdx !== -1) {
      var baseKey = key.substring(0, colonIdx);
      var arg = key.substring(colonIdx + 1);
      if (translations[baseKey]) {
        return translations[baseKey](arg);
      }
    }
    return key;
  }

  function refreshTranslations() {
    var htmlEl = document.documentElement;

    // 锁定关键容器高度，防止切换时布局跳动
    var lockElements = document.querySelectorAll('.hero-card, .hero-slogan, .slogan-intro, .hero-card-info');
    var locks = [];
    for (var i = 0; i < lockElements.length; i++) {
      var el = lockElements[i];
      var rect = el.getBoundingClientRect();
      locks.push({ el: el, w: rect.width, h: rect.height });
      el.style.minWidth = rect.width + 'px';
      el.style.minHeight = rect.height + 'px';
    }

    // 淡出
    htmlEl.classList.add('i18n-fading');

    // 更新文本内容（用 setTimeout 替代 requestAnimationFrame，兼容后台标签页）
    setTimeout(function () {
      // 1. 更新 data-i18n 元素的文本内容
      var i18nElements = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < i18nElements.length; i++) {
        var el = i18nElements[i];
        var key = el.getAttribute('data-i18n');
        if (key && !el.classList.contains('logged-in')) {
          el.textContent = getTextByKey(key);
        }
      }

      // 2. 更新 data-i18n-attr 元素的属性值
      var i18nAttrElements = document.querySelectorAll('[data-i18n-attr]');
      for (var j = 0; j < i18nAttrElements.length; j++) {
        var attrEl = i18nAttrElements[j];
        var spec = attrEl.getAttribute('data-i18n-attr');
        if (!spec) continue;
        var parts = spec.split(':');
        var attrName = parts[0];
        var attrKey = parts.slice(1).join(':');
        if (attrName && attrKey) {
          attrEl.setAttribute(attrName, getTextByKey(attrKey));
        }
      }

      // 释放锁定，让布局自然适应新文本
      for (var k = 0; k < locks.length; k++) {
        locks[k].el.style.minWidth = '';
        locks[k].el.style.minHeight = '';
      }

      // 淡入
      htmlEl.classList.remove('i18n-fading');
    }, 50);

    // 安全机制：确保 class 一定被移除
    setTimeout(function () { htmlEl.classList.remove('i18n-fading'); }, 1000);

    // 3. 更新语言切换按钮文字
    updateLangToggleLabels();
  }

  // ========== 切换按钮 ==========
  function updateLangToggleLabels() {
    var currentLabel = LANG_LABELS[currentLang];
    var langToggles = document.querySelectorAll('#language-toggle span, #language-toggle-footer span');
    for (var i = 0; i < langToggles.length; i++) {
      langToggles[i].textContent = currentLabel;
    }
    // 移动端按钮
    var mobileToggle = document.querySelector('#language-toggle-mobile span');
    if (mobileToggle) {
      mobileToggle.textContent = translate({ zh: '切换语言', en: 'Language', ja: '言語切替' });
    }
  }

  function bindLangToggles() {
    var toggles = document.querySelectorAll('#language-toggle, #language-toggle-footer, #language-toggle-mobile');
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener('click', function () {
        nextLanguage();
      });
    }
  }

  // ========== 初始化 ==========
  function init() {
    // 设置初始 HTML lang 属性
    document.documentElement.lang = currentLang === 'ja' ? 'ja' : currentLang === 'en' ? 'en' : 'zh-CN';

    // 绑定切换按钮
    bindLangToggles();

    // 首次刷新翻译
    refreshTranslations();
  }

  // ========== 导出 ==========
  window.i18n = {
    translate: translate,
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    nextLanguage: nextLanguage,
    refresh: refreshTranslations,
    get currentLang() { return currentLang; },
    get supportedLangs() { return SUPPORTED_LANGS.slice(); },
    get langLabels() { return Object.assign({}, LANG_LABELS); }
  };

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
