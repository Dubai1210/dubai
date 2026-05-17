/* ============================================================
   沉浸式白噪音 v5 — 20 种 Bilibili 真实音源
   全部音频来自 Bilibili 热门白噪音视频
   ============================================================ */
(function () {
  'use strict';

  var audioEls = {};
  var currentSound = null, currentAudio = null, lastSound = null, isPlaying = false;
  var volume = 0.7, timerEnd = null, timerInterval = null;
  var playId = 0;

  var sounds = window.WNSounds;

  function getLang() { return localStorage.getItem('site-lang') || 'zh'; }
  function t(obj) { return obj[getLang()] || obj.zh || ''; }
  function getSoundById(id) { for (var i = 0; i < sounds.length; i++) { if (sounds[i].id === id) return sounds[i]; } return null; }

  // ==================== 跨页面状态同步 ====================
  function syncToBridge() {
    try {
      localStorage.setItem('wn-bridge-state', JSON.stringify({
        soundId: currentSound,
        isPlaying: isPlaying,
        volume: volume,
        timerEnd: timerEnd
      }));
    } catch (e) {}
  }

  // ==================== 播放核心 ====================
  function stopAll() {
    for (var key in audioEls) { try { audioEls[key].pause(); } catch(e) {} }
    isPlaying = false; currentSound = null; currentAudio = null;
    syncToBridge();
  }

  function playSound(soundId) {
    var sound = getSoundById(soundId);
    if (!sound) return;
    lastSound = soundId;
    if (currentSound === soundId && isPlaying) { stopAll(); updateUI(); return; }

    var a = audioEls[soundId];
    if (!a) return;

    stopAll();
    a.volume = volume * (sound.vol || 1);
    a.currentTime = 0;

    var thisPlayId = ++playId;
    a.play().then(function () {
      if (thisPlayId !== playId) return;
      currentSound = soundId; currentAudio = a; isPlaying = true; updateUI(); syncToBridge();
    }).catch(function (err) {
      if (thisPlayId !== playId) return;
      console.error('播放失败:' + soundId, err.message);
      stopAll(); updateUI();
    });
  }

  // ==================== 音量/定时器 ====================
  function setVolume(val) { volume = val; if (currentAudio) { currentAudio.volume = volume; } syncToBridge(); }
  function setTimer(minutes) {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (!minutes) { timerEnd = null; updateTimerUI(); return; }
    timerEnd = Date.now() + minutes * 60000;
    timerInterval = setInterval(function () { if (Date.now() >= timerEnd && isPlaying) { stopAll(); timerEnd = null; clearInterval(timerInterval); timerInterval = null; updateUI(); } updateTimerUI(); }, 1000);
    updateTimerUI();
  }

  // ==================== UI ====================
  function updateUI() {
    var icon = document.getElementById('disc-icon'); if (icon) icon.className = isPlaying ? 'ri-pause-fill' : 'ri-play-fill';
    var disc = document.getElementById('disc-play'); if (disc) disc.classList.toggle('playing', isPlaying);
    var cards = document.querySelectorAll('.wn-card'); cards.forEach(function (c) { c.classList.toggle('active', c.getAttribute('data-sound') === currentSound); });
    updateTimerUI(); updateStatus();
  }

  function updateStatus() {
    var label = document.getElementById('status-label'); if (!label) return;
    if (currentSound) {
      var s = getSoundById(currentSound); var text = t(s.name);
      if (isPlaying && timerEnd) { var r = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000)); var m = Math.floor(r / 60), sec = r % 60; text += ' · ' + m + ':' + (sec < 10 ? '0' : '') + sec; }
      if (!isPlaying) text += ' · 已暂停';
      label.innerHTML = '<strong>' + text + '</strong>';
    } else { label.textContent = '未播放'; }
  }

  function updateTimerUI() {
    var btns = document.querySelectorAll('.wn-timer-btn');
    btns.forEach(function (btn) { var min = parseInt(btn.getAttribute('data-min'), 10); var active = (min === 0 && !timerEnd) || (timerEnd && min > 0 && Math.abs(timerEnd - Date.now() - min * 60000) < 59000); btn.classList.toggle('active', active); });
  }

  // ==================== 渲染卡片 ====================
  function renderCards() {
    var grid = document.getElementById('sound-grid'); if (!grid) return;
    grid.innerHTML = '';
    sounds.forEach(function (s) {
      var card = document.createElement('div'); card.className = 'wn-card'; card.setAttribute('data-sound', s.id);
      card.style.backgroundImage = 'url(' + s.img + ')';
      card.innerHTML = '<div class="wn-card-icon-sm"><i class="' + s.icon + '"></i></div><div class="wn-card-label">' + t(s.name) + '</div>';
      card.addEventListener('click', function () { playSound(s.id); });
      grid.appendChild(card);
    });
  }

  // ==================== 丝滑惯性横向滚动 ====================
  function initScroll() {
    var el = document.getElementById('sound-grid');
    if (!el) return;

    var velocity = 0,
        targetVel = 0,
        animationId = null,
        friction = 0.96,
        sensitivity = 0.35;

    function loop() {
      // 混合当前速度与目标速度（平滑过渡）
      velocity += (targetVel - velocity) * 0.25;
      // 应用速度
      el.scrollLeft += velocity;
      // 摩擦力减速
      velocity *= friction;
      targetVel *= friction;

      // 边界弹性
      var maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft < 0) { el.scrollLeft += (0 - el.scrollLeft) * 0.3; velocity *= 0.5; }
      if (el.scrollLeft > maxScroll) { el.scrollLeft += (maxScroll - el.scrollLeft) * 0.3; velocity *= 0.5; }

      // 当速度极低且无输入时停止
      if (Math.abs(velocity) < 0.05 && Math.abs(targetVel) < 0.05) {
        animationId = null;
        return;
      }
      animationId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (!animationId) { animationId = requestAnimationFrame(loop); }
    }

    // 鼠标滚轮
    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      targetVel += e.deltaY * sensitivity * 0.5;
      startLoop();
    }, { passive: false });

    // 触屏使用原生 overflow 滑动，不拦截点击
  }

  function preloadAll() {
    sounds.forEach(function (s) {
      if (!audioEls[s.id]) {
        var a = new Audio(s.file);
        a.loop = true;
        a.preload = 'auto';
        audioEls[s.id] = a;
      }
    });
  }

  // ==================== 初始化 ====================
  function init() {
    preloadAll();

    // 从桥接状态恢复 — 先设状态再尝试播放，确保 UI 立即同步
    try {
      var saved = JSON.parse(localStorage.getItem('wn-bridge-state') || '{}');
      if (saved.soundId) {
        volume = saved.volume || 0.7;
        lastSound = saved.soundId;
        timerEnd = saved.timerEnd || null;
        currentSound = saved.soundId;

        var s = getSoundById(saved.soundId);
        if (s && audioEls[saved.soundId]) {
          var a = audioEls[saved.soundId];
          currentAudio = a;
          a.volume = volume * (s.vol || 1);

          if (saved.isPlaying) {
            isPlaying = true;
            a.play().catch(function () {
              isPlaying = false;
              updateUI();
            });
          } else {
            isPlaying = false;
          }
        }
      }
    } catch (e) {}

    var html = document.documentElement;
    var wnMode = localStorage.getItem('site-theme-mode') || 'auto';
    var wnTheme; if (wnMode === 'auto') { var h = new Date().getHours(); wnTheme = (h >= 8 && h < 18) ? 'light' : 'dark'; } else { wnTheme = wnMode; }
    html.setAttribute('data-theme', wnTheme);
    var themeBtn = document.getElementById('theme-toggle-wn');
    if (themeBtn) { var ti = themeBtn.querySelector('i'); if (ti) ti.className = html.getAttribute('data-theme') === 'dark' ? 'ri-moon-line' : 'ri-sun-line'; themeBtn.addEventListener('click', function () { var cur = html.getAttribute('data-theme'), next = cur === 'dark' ? 'light' : 'dark'; html.setAttribute('data-theme', next); localStorage.setItem('site-theme-mode', next); if (ti) ti.className = next === 'dark' ? 'ri-moon-line' : 'ri-sun-line'; }); }
    renderCards();
    initScroll();
    var playBtn = document.getElementById('disc-play'); if (playBtn) { playBtn.addEventListener('click', function () { if (isPlaying) { stopAll(); updateUI(); } else playSound(lastSound || sounds[0].id); }); }
    var volSlider = document.getElementById('volume-slider'); if (volSlider) { volSlider.addEventListener('input', function () { setVolume(parseInt(this.value, 10) / 100); }); }
    var timerBar = document.getElementById('timer-bar'); if (timerBar) { timerBar.addEventListener('click', function (e) { var btn = e.target.closest('.wn-timer-btn'); if (!btn) return; setTimer(parseInt(btn.getAttribute('data-min'), 10) || 0); }); }
    document.addEventListener('keydown', function (e) { if (e.target.tagName === 'INPUT') return; if (e.code === 'Space') { e.preventDefault(); if (isPlaying) { stopAll(); updateUI(); } else playSound(lastSound || sounds[0].id); } if (e.code === 'ArrowUp') { e.preventDefault(); setVolume(Math.min(1, volume + 0.05)); if (volSlider) volSlider.value = volume * 100; } if (e.code === 'ArrowDown') { e.preventDefault(); setVolume(Math.max(0, volume - 0.05)); if (volSlider) volSlider.value = volume * 100; } });
    document.addEventListener('languageChanged', function () { renderCards(); updateUI(); });
    updateUI();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
