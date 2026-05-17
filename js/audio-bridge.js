/* ============================================================
   跨页面音频桥接 — 白噪音在页面切换时不中断
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'wn-bridge-state';
  var audioCache = {};
  var currentAudio = null;
  var state = { soundId: null, isPlaying: false, volume: 0.7, timerEnd: null };
  var sounds = window.WNSounds;

  function getLang() { return localStorage.getItem('site-lang') || 'zh'; }
  function getSoundById(id) { for (var i = 0; i < sounds.length; i++) { if (sounds[i].id === id) return sounds[i]; } return null; }

  function tName(soundId) {
    var s = getSoundById(soundId);
    if (!s) return soundId;
    return s.name[getLang()] || s.name.zh || soundId;
  }

  // ========== 状态持久化 ==========
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { var parsed = JSON.parse(raw); if (parsed) state = parsed; }
    } catch (e) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        soundId: state.soundId,
        isPlaying: state.isPlaying,
        volume: state.volume,
        timerEnd: state.timerEnd
      }));
    } catch (e) {}
  }

  // ========== 停止播放 ==========
  function stop() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (e) {}
      currentAudio = null;
    }
    state.isPlaying = false;
    state.soundId = null;
    saveState();
    updateMiniPlayer();
    notifyChange();
  }

  // ========== 播放指定音源 ==========
  function play(soundId, vol, seekTime) {
    var sound = getSoundById(soundId);
    if (!sound) return;

    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} }

    if (!audioCache[soundId]) {
      var a = new Audio(sound.file);
      a.loop = true;
      a.preload = 'auto';
      audioCache[soundId] = a;
    }

    var audio = audioCache[soundId];
    audio.volume = (vol != null ? vol : state.volume) * (sound.vol || 1);
    if (seekTime != null) { audio.currentTime = seekTime; }

    audio.play().then(function () {
      currentAudio = audio;
      state.soundId = soundId;
      state.isPlaying = true;
      if (vol != null) state.volume = vol;
      saveState();
      updateMiniPlayer();
      notifyChange();
    }).catch(function (err) {
      console.error('音频桥接播放失败:', err.message);
    });
  }

  // ========== 暂停 ==========
  function pause() {
    if (currentAudio) {
      currentAudio.pause();
      state.isPlaying = false;
      saveState();
      updateMiniPlayer();
      notifyChange();
    }
  }

  // ========== 通知主页背景音乐 ==========
  function notifyChange() {
    document.dispatchEvent(new CustomEvent('wnStateChanged', { detail: { isPlaying: state.isPlaying, soundId: state.soundId } }));
  }

  // ========== 恢复播放 ==========
  function resume() {
    if (currentAudio && state.soundId && !state.isPlaying) {
      currentAudio.play().then(function () {
        state.isPlaying = true;
        saveState();
        updateMiniPlayer();
        notifyChange();
      }).catch(function () {});
    }
  }

  // ========== 切换暂停/播放 ==========
  function toggle() {
    if (state.isPlaying) { pause(); } else { resume(); }
  }

  // ========== 设置音量 ==========
  function setVolume(val) {
    state.volume = val;
    if (currentAudio) { currentAudio.volume = val; }
    saveState();
  }

  // ========== 页面离开时保存进度 ==========
  function saveProgress() {
    // 先刷新状态（white-noise.js 可能已通过 syncToBridge 写入最新状态）
    loadState();
    saveState();
  }

  // ========== 新页面恢复播放 ==========
  function resumeOnNewPage() {
    loadState();

    var path = window.location.pathname;
    var isWNPage = path.indexOf('white-noise') !== -1;
    var isHomePage = path === '/' || path === '/index.html' || path.endsWith('/index.html');

    // 白噪音页面由 white-noise.js 自行管理
    if (isWNPage) {
      updateMiniPlayer();
      return;
    }

    // 非主页：不恢复白噪音，隐藏迷你小窗，但保留状态供回到主页时使用
    if (!isHomePage) {
      updateMiniPlayer();
      return;
    }

    // 主页：同站内跳转时保留白噪音，刷新或直接进入不恢复
    var ref = document.referrer;
    var fromSameSite = ref && (ref.indexOf('livdubai.fun') !== -1 || ref.indexOf('localhost') !== -1 || ref.indexOf('127.0.0.1') !== -1);

    if (fromSameSite && state.soundId) {
      var sound = getSoundById(state.soundId);
      if (sound) {
        if (!audioCache[state.soundId]) {
          var a = new Audio(sound.file);
          a.loop = true;
          a.preload = 'auto';
          audioCache[state.soundId] = a;
        }
        var audio = audioCache[state.soundId];
        audio.volume = state.volume * (sound.vol || 1);
        currentAudio = audio;
        // 仅在之前是播放状态时才恢复播放，暂停状态保持暂停
        if (state.isPlaying) {
          audio.play().then(function () {
            state.isPlaying = true;
            saveState();
            updateMiniPlayer();
            notifyChange();
          }).catch(function () {
            state.isPlaying = false;
            saveState();
            updateMiniPlayer();
          });
        } else {
          updateMiniPlayer();
        }
      }
    } else {
      // 直接进入主页，不恢复
      state.isPlaying = false;
      state.soundId = null;
      saveState();
    }
    updateMiniPlayer();
  }

  // ========== 迷你播放器 UI ==========
  function updateMiniPlayer() {
    var mini = document.getElementById('wn-mini-player');
    if (!mini) return;

    // 非主页、非白噪音页面隐藏迷你小窗
    var p = window.location.pathname;
    var isHomeOrWN = p === '/' || p === '/index.html' || p.endsWith('/index.html') || p.indexOf('white-noise') !== -1;
    if (!isHomeOrWN) {
      mini.style.display = 'none';
      mini.classList.remove('playing');
      return;
    }

    if (state.soundId) {
      mini.style.display = 'flex';

      if (state.isPlaying) {
        mini.classList.add('playing');
      } else {
        mini.classList.remove('playing');
      }

      var label = mini.querySelector('.wn-mini-label');
      if (label) label.textContent = tName(state.soundId);

      var btn = mini.querySelector('.wn-mini-toggle i');
      if (btn) btn.className = state.isPlaying ? 'ri-pause-fill' : 'ri-play-fill';

      var volSlider = mini.querySelector('.wn-mini-vol-slider');
      if (volSlider && !volSlider.matches(':active')) {
        volSlider.value = Math.round(state.volume * 100);
      }
    } else {
      mini.style.display = 'none';
      mini.classList.remove('playing');
    }
  }

  // 监听语言变化
  document.addEventListener('languageChanged', function () {
    updateMiniPlayer();
  });

  // ========== 绑定迷你播放器事件 ==========
  function bindMiniPlayer() {
    var mini = document.getElementById('wn-mini-player');
    if (!mini) return;

    // 切换按钮
    var toggleBtn = mini.querySelector('.wn-mini-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggle();
      });
    }
  }

  // ========== 页面卸载时保存 ==========
  window.addEventListener('beforeunload', saveProgress);
  window.addEventListener('pagehide', saveProgress);

  // ========== 初始化 ==========
  loadState();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      resumeOnNewPage();
      bindMiniPlayer();
    });
  } else {
    resumeOnNewPage();
    bindMiniPlayer();
  }

  // ========== 导出 API ==========
  window.WNBridge = {
    play: play,
    stop: stop,
    pause: pause,
    resume: resume,
    toggle: toggle,
    setVolume: setVolume,
    getState: function () { return state; },
    updateUI: updateMiniPlayer,
    getName: tName,
  };

})();
