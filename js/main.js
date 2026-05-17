/* ============================================================
   Dubai 个人网站 — 交互脚本
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ========== 移动端菜单 ==========
  var hamburgerToggle = document.getElementById('hamburger-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  var mobileMenuClose = document.getElementById('mobile-menu-close');
  var bodyEl = document.body;

  function openMobileMenu() {
    mobileMenu.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    hamburgerToggle.classList.add('menu-open');
    bodyEl.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    hamburgerToggle.classList.remove('menu-open');
    bodyEl.style.overflow = '';

    // 关闭展开的子菜单
    document.querySelectorAll('.mobile-menu-item.active').forEach(function (item) {
      item.classList.remove('active');
    });
  }

  hamburgerToggle.addEventListener('click', function () {
    if (mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileMenuClose.addEventListener('click', closeMobileMenu);
  mobileMenuOverlay.addEventListener('click', closeMobileMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // 窗口大小变化时，如果切换到桌面布局则关闭移动菜单
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth > 992 && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    }, 200);
  });

  // 移动端子菜单展开/收起
  var mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
  mobileDropdownToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var parent = toggle.closest('.mobile-menu-item');
      parent.classList.toggle('active');
    });
  });

  // ========== 下拉菜单 ==========
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const parent = toggle.closest('.navbar-item');
      const isActive = parent.classList.contains('active');

      document.querySelectorAll('.navbar-item.active').forEach(function (item) {
        item.classList.remove('active');
      });

      if (!isActive) {
        parent.classList.add('active');
      }
    });
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.navbar-item.active').forEach(function (item) {
      item.classList.remove('active');
    });
  });

  // ========== 主题切换（下拉菜单） ==========
  const html = document.documentElement;
  const themeDropdown = document.getElementById('theme-dropdown');
  const themeToggle = document.getElementById('theme-toggle');
  const THEME_MODE_KEY = 'site-theme-mode';

  function getAutoTheme() {
    var h = new Date().getHours();
    return (h >= 8 && h < 18) ? 'light' : 'dark';
  }

  function applyTheme(mode) {
    var t = (mode === 'auto') ? getAutoTheme() : mode;
    html.setAttribute('data-theme', t);
    html.setAttribute('data-theme-mode', mode);
    localStorage.setItem(THEME_MODE_KEY, mode);
    // 更新下拉选项高亮
    if (themeDropdown) {
      themeDropdown.querySelectorAll('.theme-option').forEach(function (opt) {
        opt.classList.toggle('active', opt.getAttribute('data-theme') === mode);
      });
    }
  }

  // 初始化主题（内联脚本已设置，这里同步状态）
  var currentMode = html.getAttribute('data-theme-mode') || 'auto';
  applyTheme(currentMode);

  // 自动模式定时检查
  var themeTimer = null;
  function startAutoCheck() {
    if (themeTimer) clearInterval(themeTimer);
    themeTimer = setInterval(function () {
      if (html.getAttribute('data-theme-mode') === 'auto') {
        applyTheme('auto');
      }
    }, 60000);
  }
  startAutoCheck();

  // 下拉菜单交互
  if (themeDropdown) {
    themeToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      themeDropdown.classList.toggle('open');
    });

    themeDropdown.querySelectorAll('.theme-option').forEach(function (opt) {
      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        applyTheme(opt.getAttribute('data-theme'));
        themeDropdown.classList.remove('open');
      });
    });

    // 点击外部关闭
    document.addEventListener('click', function () {
      themeDropdown.classList.remove('open');
    });
  }

  // ========== 滚动动画 ==========
  var observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        var index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
        entry.target.style.transitionDelay = (index % 3) * 0.1 + 's';
      } else {
        entry.target.classList.remove('visible');
        entry.target.style.transitionDelay = '0s';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.project-card').forEach(function (card) {
    observer.observe(card);
  });

  // 语言切换已由 js/i18n.js 统一管理

  // ========== 迷你播放器交互 ==========
  var miniPlayer = document.getElementById('wn-mini-player');
  if (miniPlayer) {
    // 音量滑块
    var volSlider = document.getElementById('wn-mini-vol-slider');
    if (volSlider) {
      volSlider.addEventListener('input', function () {
        var vol = parseInt(this.value, 10) / 100;
        if (window.WNBridge) { WNBridge.setVolume(vol); }
      });
    }

    // 关闭按钮 — 停止白噪音
    var closeBtn = miniPlayer.querySelector('.wn-mini-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.WNBridge) { WNBridge.stop(); }
      });
    }

    // 点击名称跳转到白噪音页面
    var label = miniPlayer.querySelector('.wn-mini-label');
    if (label) {
      label.addEventListener('click', function (e) {
        e.stopPropagation();
        window.location.href = 'white-noise.html';
      });
    }
  }

  // ========== 背景音乐 ==========
  var audioPlayer = document.getElementById('audio-player');
  var audioDisc = document.getElementById('audio-disc');
  var bgMusic = document.getElementById('bg-music');
  var bgmVolSlider = document.getElementById('bgm-vol-slider');
  var bgmVolIcon = document.getElementById('bgm-vol-icon');
  var BGM_VOL_KEY = 'bg-music-volume';

  if (audioPlayer && bgMusic && audioDisc) {
    // 从 localStorage 恢复音量，默认 0.2
    var savedVol = parseFloat(localStorage.getItem(BGM_VOL_KEY));
    var bgmVol = isNaN(savedVol) ? 0.2 : Math.min(1, Math.max(0, savedVol));

    // 统一应用音量的函数
    function applyBgmVol() {
      bgMusic.volume = bgmVol;
    }
    applyBgmVol();
    if (bgmVolSlider) bgmVolSlider.value = Math.round(bgmVol * 100);

    function updateBgmVolIcon() {
      if (!bgmVolIcon) return;
      if (bgmVol === 0) { bgmVolIcon.className = 'ri-volume-mute-line bgm-vol-icon'; }
      else if (bgmVol < 0.5) { bgmVolIcon.className = 'ri-volume-down-line bgm-vol-icon'; }
      else { bgmVolIcon.className = 'ri-volume-up-line bgm-vol-icon'; }
    }
    updateBgmVolIcon();

    if (bgmVolSlider) {
      bgmVolSlider.addEventListener('input', function () {
        bgmVol = parseInt(this.value, 10) / 100;
        applyBgmVol();
        localStorage.setItem(BGM_VOL_KEY, bgmVol.toString());
        updateBgmVolIcon();
      });
    }

    // 音量控制 hover 显示/隐藏（带延迟防止闪烁）
    var bgmVolHideTimer = null;
    var bgmVolControl = document.getElementById('bgm-vol-control');

    function showBgmVol() {
      if (bgmVolHideTimer) { clearTimeout(bgmVolHideTimer); bgmVolHideTimer = null; }
      audioPlayer.classList.add('show-vol');
    }

    function hideBgmVol() {
      bgmVolHideTimer = setTimeout(function () {
        audioPlayer.classList.remove('show-vol');
      }, 300);
    }

    audioPlayer.addEventListener('mouseenter', showBgmVol);
    audioPlayer.addEventListener('mouseleave', hideBgmVol);
    if (bgmVolControl) {
      bgmVolControl.addEventListener('mouseenter', showBgmVol);
      bgmVolControl.addEventListener('mouseleave', hideBgmVol);
    }

    var path = window.location.pathname;
    var isHomePage = path === '/' || path === '/index.html' || path.endsWith('/index.html');
    var isWNRelatedPage = isHomePage || path.indexOf('white-noise') !== -1;

    function getWNState() {
      try { return JSON.parse(localStorage.getItem('wn-bridge-state') || '{}'); } catch (e) { return {}; }
    }

    function isWhiteNoiseActive() {
      if (!isWNRelatedPage) return false;
      var s = getWNState();
      return s.isPlaying && s.soundId;
    }

    function isUserPaused() {
      try { return localStorage.getItem('bg-music-user-paused') === '1'; } catch (e) { return false; }
    }

    function doPlay() {
      if (bgMusic.paused) {
        applyBgmVol(); // 确保使用用户音量
        if (bgMusic.readyState === 0) bgMusic.load();
        bgMusic.play().then(function () {
          audioPlayer.classList.add('playing');
          // 播放成功，保存状态
          localStorage.setItem('bg-music-user-paused', '0');
        }).catch(function () {});
      }
    }

    function startPlay() {
      if (!isWhiteNoiseActive()) { doPlay(); }
    }

    function pauseWN() {
      if (window.WNBridge) { WNBridge.pause(); }
    }

    // 自动播放
    if (!isUserPaused()) { startPlay(); }

    // 浏览器阻止自动播放时，首次交互恢复
    if (bgMusic.paused && !isUserPaused()) {
      var interactionEvents = ['click', 'touchstart', 'scroll', 'keydown'];
      function onFirstInteraction() {
        if (bgMusic.paused && !isUserPaused()) { startPlay(); }
        interactionEvents.forEach(function (evt) {
          document.removeEventListener(evt, onFirstInteraction, true);
        });
      }
      interactionEvents.forEach(function (evt) {
        document.addEventListener(evt, onFirstInteraction, true);
      });
    }

    audioDisc.addEventListener('click', function (e) {
      e.stopPropagation();
      if (bgMusic.paused) {
        // 用户点击播放：若白噪音活跃则暂停白噪音
        if (isWhiteNoiseActive()) { pauseWN(); }
        doPlay();
      } else {
        // 用户点击暂停：记住偏好
        localStorage.setItem('bg-music-user-paused', '1');
        bgMusic.pause();
        audioPlayer.classList.remove('playing');
      }
    });

    bgMusic.addEventListener('ended', function () {
      audioPlayer.classList.remove('playing');
    });

    // 音乐开始播放时确保应用用户音量
    bgMusic.addEventListener('playing', applyBgmVol);

    // 白噪音状态变化
    document.addEventListener('wnStateChanged', function (e) {
      if (!e.detail || isUserPaused()) return;
      if (e.detail.isPlaying) {
        // 白噪音播放 → 暂停背景音乐
        bgMusic.pause();
        audioPlayer.classList.remove('playing');
      } else if (!e.detail.soundId) {
        // 白噪音关闭 → 恢复背景音乐
        startPlay();
      }
      // 白噪音暂停（isPlaying=false, soundId 仍在）→ 背景音乐也恢复
      if (!e.detail.isPlaying && e.detail.soundId) {
        startPlay();
      }
    });
  }

  // ========== 登录/注册模态框 ==========
  var authOverlay = document.getElementById('auth-modal-overlay');
  var authModal = document.getElementById('auth-modal');
  var authClose = document.getElementById('auth-modal-close');

  if (authOverlay && authModal) {
    var AUTH_API = '/api/auth';
    var TOKEN_KEY = 'auth-token';
    var USER_KEY = 'auth-user';

    // 页面元素
    var pages = {
      login: document.getElementById('login-page'),
      register: document.getElementById('register-page'),
      forgot: document.getElementById('forgot-page'),
      resetSuccess: document.getElementById('reset-success-page'),
      profile: document.getElementById('profile-page')
    };

    // 获取存储的 token
    function getToken() {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    }

    // 获取存储的用户信息
    function getStoredUser() {
      try {
        return JSON.parse(localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || 'null');
      } catch (e) { return null; }
    }

    // 保存登录状态
    function saveAuth(data, remember) {
      var storage = remember ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, data.token);
      storage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    // 清除登录状态
    function clearAuth() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }

    // API 请求封装
    function apiRequest(endpoint, options) {
      return fetch(AUTH_API + endpoint, {
        method: options.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: options.body ? JSON.stringify(options.body) : undefined
      }).then(function (res) { return res.json(); });
    }

    // 带 token 的 API 请求
    function authRequest(endpoint, options) {
      var token = getToken();
      return fetch(AUTH_API + endpoint, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      }).then(function (res) { return res.json(); });
    }

    // 切换页面
    function showPage(name) {
      Object.keys(pages).forEach(function (key) {
        if (pages[key]) pages[key].classList.remove('active');
      });
      if (pages[name]) pages[name].classList.add('active');
    }

    // 显示消息提示
    function showMessage(form, message, type) {
      var existing = form.querySelector('.auth-message');
      if (existing) existing.remove();

      var div = document.createElement('div');
      div.className = 'auth-message ' + (type || 'info');
      div.textContent = message;
      form.insertBefore(div, form.firstChild);

      if (type !== 'error') {
        setTimeout(function () { div.remove(); }, 3000);
      }
    }

    // 打开模态框
    function openAuth(page) {
      if (page) showPage(page);
      authOverlay.classList.add('active');
      bodyEl.style.overflow = 'hidden';
    }

    // 关闭模态框
    function closeAuth() {
      authOverlay.classList.remove('active');
      bodyEl.style.overflow = '';
      // 清除所有消息
      authModal.querySelectorAll('.auth-message').forEach(function (m) { m.remove(); });
    }

    // 更新导航栏用户状态
    function updateNavUser() {
      var user = getStoredUser();
      var loginBtns = document.querySelectorAll('.btn-login');
      loginBtns.forEach(function (btn) {
        if (user) {
          btn.textContent = user.username;
          btn.classList.add('logged-in');
        } else {
          var loginText = (window.i18n && window.i18n.translate) ? window.i18n.translate({ zh: '登录', en: 'Login', ja: 'ログイン' }) : '登录';
          btn.textContent = loginText;
          btn.classList.remove('logged-in');
        }
      });
    }

    // 填充个人资料页
    function fillProfile(user) {
      var el;
      el = document.getElementById('profile-username');
      if (el) el.textContent = user.username || '-';
      el = document.getElementById('profile-email');
      if (el) el.textContent = user.email || '-';
      el = document.getElementById('profile-created');
      if (el) {
        var d = user.createdAt || user.created_at;
        el.textContent = d ? new Date(d).toLocaleDateString() : '-';
      }
    }

    // ---------- 事件绑定 ----------

    // 登录按钮 → 打开模态框
    document.querySelectorAll('.btn-login').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var user = getStoredUser();
        if (user) {
          fillProfile(user);
          showPage('profile');
        } else {
          showPage('login');
        }
        openAuth();
      });
    });

    // 关闭按钮
    if (authClose) {
      authClose.addEventListener('click', closeAuth);
    }

    // 点击遮罩关闭
    authOverlay.addEventListener('click', function (e) {
      if (e.target === authOverlay) closeAuth();
    });

    // ESC 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && authOverlay.classList.contains('active')) {
        closeAuth();
      }
    });

    // 页面切换链接
    var showRegister = document.getElementById('show-register');
    if (showRegister) showRegister.addEventListener('click', function (e) { e.preventDefault(); showPage('register'); });

    var showForgot = document.getElementById('show-forgot');
    if (showForgot) showForgot.addEventListener('click', function (e) { e.preventDefault(); showPage('forgot'); });

    var showLoginFromRegister = document.getElementById('show-login-from-register');
    if (showLoginFromRegister) showLoginFromRegister.addEventListener('click', function (e) { e.preventDefault(); showPage('login'); });

    var showLoginFromForgot = document.getElementById('show-login-from-forgot');
    if (showLoginFromForgot) showLoginFromForgot.addEventListener('click', function (e) { e.preventDefault(); showPage('login'); });

    var backToLogin = document.getElementById('back-to-login');
    if (backToLogin) backToLogin.addEventListener('click', function (e) { e.preventDefault(); showPage('login'); });

    // 密码可见性切换
    document.querySelectorAll('.auth-password-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var input = toggle.parentElement.querySelector('.auth-input');
        if (!input) return;
        var icon = toggle.querySelector('i');
        if (input.type === 'password') {
          input.type = 'text';
          if (icon) { icon.classList.remove('ri-eye-off-line'); icon.classList.add('ri-eye-line'); }
        } else {
          input.type = 'password';
          if (icon) { icon.classList.remove('ri-eye-line'); icon.classList.add('ri-eye-off-line'); }
        }
      });
    });

    // ---------- 登录表单 ----------
    var loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = loginForm.querySelector('.auth-submit');
        var username = document.getElementById('login-username').value.trim();
        var password = document.getElementById('login-password').value;
        var remember = document.getElementById('login-remember').checked;

        if (!username || !password) {
          showMessage(loginForm, '请填写用户名和密码', 'error');
          return;
        }

        var origText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '...';

        apiRequest('/login', {
          method: 'POST',
          body: { username: username, password: password }
        }).then(function (res) {
          if (res.success) {
            saveAuth(res.data, remember);
            updateNavUser();
            showMessage(loginForm, res.message || '登录成功', 'success');
            setTimeout(closeAuth, 800);
          } else {
            showMessage(loginForm, res.message || '登录失败', 'error');
          }
        }).catch(function () {
          showMessage(loginForm, '网络错误，请稍后重试', 'error');
        }).finally(function () {
          btn.disabled = false;
          btn.textContent = origText;
        });
      });
    }

    // ---------- 注册表单 ----------
    var registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = registerForm.querySelector('.auth-submit');
        var username = document.getElementById('register-username').value.trim();
        var email = document.getElementById('register-email').value.trim();
        var code = document.getElementById('register-code').value.trim();
        var password = document.getElementById('register-password').value;
        var confirmPassword = document.getElementById('register-confirm-password').value;

        if (!username || !email || !code || !password) {
          showMessage(registerForm, '请填写所有必填字段', 'error');
          return;
        }
        if (password !== confirmPassword) {
          showMessage(registerForm, '两次输入的密码不一致', 'error');
          return;
        }
        if (password.length < 6) {
          showMessage(registerForm, '密码至少6个字符', 'error');
          return;
        }

        var origText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '...';

        apiRequest('/register', {
          method: 'POST',
          body: { username: username, email: email, password: password, code: code }
        }).then(function (res) {
          if (res.success) {
            saveAuth(res.data, true);
            updateNavUser();
            showMessage(registerForm, res.message || '注册成功', 'success');
            setTimeout(closeAuth, 800);
          } else {
            showMessage(registerForm, res.message || '注册失败', 'error');
          }
        }).catch(function () {
          showMessage(registerForm, '网络错误，请稍后重试', 'error');
        }).finally(function () {
          btn.disabled = false;
          btn.textContent = origText;
        });
      });
    }

    // ---------- 发送验证码 ----------
    var sendCodeBtn = document.getElementById('send-code-btn');
    if (sendCodeBtn) {
      var codeCooldown = null;
      sendCodeBtn.addEventListener('click', function () {
        var email = document.getElementById('register-email').value.trim();
        if (!email) {
          showMessage(registerForm, '请先填写邮箱地址', 'error');
          return;
        }

        sendCodeBtn.disabled = true;

        apiRequest('/send-code', {
          method: 'POST',
          body: { email: email }
        }).then(function (res) {
          if (res.success) {
            showMessage(registerForm, '验证码已发送到你的邮箱', 'success');
            // 倒计时 60 秒
            var seconds = 60;
            sendCodeBtn.textContent = seconds + 's';
            codeCooldown = setInterval(function () {
              seconds--;
              if (seconds <= 0) {
                clearInterval(codeCooldown);
                sendCodeBtn.disabled = false;
                sendCodeBtn.removeAttribute('data-i18n-done');
                sendCodeBtn.textContent = (window.i18n && window.i18n.translate) ? window.i18n.translate({ zh: '发送验证码', en: 'Send Code', ja: '認証コード送信' }) : '发送验证码';
              } else {
                sendCodeBtn.textContent = seconds + 's';
              }
            }, 1000);
          } else {
            showMessage(registerForm, res.message || '发送失败', 'error');
            sendCodeBtn.disabled = false;
          }
        }).catch(function () {
          showMessage(registerForm, '网络错误，请稍后重试', 'error');
          sendCodeBtn.disabled = false;
        });
      });
    }

    // ---------- 忘记密码表单 ----------
    var forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = forgotForm.querySelector('.auth-submit');
        var email = document.getElementById('forgot-email').value.trim();

        if (!email) {
          showMessage(forgotForm, '请填写邮箱地址', 'error');
          return;
        }

        var origText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '...';

        apiRequest('/forgot-password', {
          method: 'POST',
          body: { email: email }
        }).then(function (res) {
          if (res.success) {
            showPage('resetSuccess');
          } else {
            showMessage(forgotForm, res.message || '发送失败', 'error');
          }
        }).catch(function () {
          showMessage(forgotForm, '网络错误，请稍后重试', 'error');
        }).finally(function () {
          btn.disabled = false;
          btn.textContent = origText;
        });
      });
    }

    // ---------- 退出登录 ----------
    var logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        clearAuth();
        updateNavUser();
        closeAuth();
      });
    }

    // ---------- 页面加载时立即用本地数据更新 UI，再后台验证 token ----------
    updateNavUser();
    var token = getToken();
    if (token) {
      authRequest('/me', { method: 'GET' }).then(function (res) {
        if (res.success) {
          var remember = !!localStorage.getItem(TOKEN_KEY);
          saveAuth({ token: token, user: res.data }, remember);
          updateNavUser();
        } else {
          clearAuth();
          updateNavUser();
        }
      }).catch(function () {});
    }
  }

});
