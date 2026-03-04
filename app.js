(function () {
  'use strict';

  // ——— State ———
  let rg = 0, m = 0, dn = 0;
  let audioContext = null;
  let scalePlaybackTimeout = null;

  // ——— DOM refs ———
  const ragaNumberEl = document.getElementById('ragaNumber');
  const ragaNameEl = document.getElementById('ragaName');
  const ragaScaleEl = document.getElementById('ragaScale');
  const ragaScaleWesternEl = document.getElementById('ragaScaleWestern');
  const ragaArohanamEl = document.getElementById('ragaArohanam');
  const ragaAvarohanamEl = document.getElementById('ragaAvarohanam');
  const ragaPhraseEl = document.getElementById('ragaPhrase');
  const ragaComposerYearEl = document.getElementById('ragaComposerYear');
  const ragaTimeOfDayEl = document.getElementById('ragaTimeOfDay');
  const ragaChakraEl = document.getElementById('ragaChakra');
  const pianoEl = document.getElementById('piano');
  const bpmInput = document.getElementById('bpmInput');
  const gotoInput = document.getElementById('gotoInput');
  const reverbInput = document.getElementById('reverbInput');
  const reverbValueEl = document.getElementById('reverbValue');

  let reverbConvolver = null;
  let reverbGainNode = null;
  let dryGainNode = null;

  function getCurrentRaga() {
    return getRagaByCoords(rg, m, dn);
  }

  function ensureAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      buildReverb();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  function buildReverb() {
    if (!audioContext || reverbConvolver) return;
    var sampleRate = audioContext.sampleRate;
    var length = Math.min(2 * sampleRate, 88200);
    var impulse = audioContext.createBuffer(2, length, sampleRate);
    var left = impulse.getChannelData(0);
    var right = impulse.getChannelData(1);
    var decay = 2.5;
    for (var i = 0; i < length; i++) {
      var t = i / sampleRate;
      var d = Math.exp(-t * decay);
      left[i] = (Math.random() * 2 - 1) * d;
      right[i] = (Math.random() * 2 - 1) * d;
    }
    reverbConvolver = audioContext.createConvolver();
    reverbConvolver.buffer = impulse;
    reverbConvolver.normalize = true;
    reverbGainNode = audioContext.createGain();
    reverbGainNode.gain.value = 0;
    dryGainNode = audioContext.createGain();
    dryGainNode.gain.value = 1;
    reverbConvolver.connect(reverbGainNode);
    reverbGainNode.connect(audioContext.destination);
    dryGainNode.connect(audioContext.destination);
  }

  function getReverbAmount() {
    var el = document.getElementById('reverbInput');
    if (!el) return 0;
    return Math.max(0, Math.min(1, parseInt(el.value, 10) / 100));
  }

  function playNote(keyIndex, durationSeconds, onKeyLit, octave) {
    if (octave == null) octave = 4;
    const ctx = ensureAudio();

    function schedulePlay() {
      const freq = getFrequencyForKeyIndex(keyIndex, octave);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const reverbAmt = getReverbAmount();
      osc.connect(gain);
      if (dryGainNode) {
        gain.connect(dryGainNode);
        if (reverbConvolver) gain.connect(reverbConvolver);
        dryGainNode.gain.setValueAtTime(1 - reverbAmt, ctx.currentTime);
        if (reverbGainNode) reverbGainNode.gain.setValueAtTime(reverbAmt, ctx.currentTime);
      } else {
        gain.connect(ctx.destination);
      }
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationSeconds);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durationSeconds);
      if (typeof onKeyLit === 'function') onKeyLit(keyIndex, durationSeconds);
    }

    if (ctx.state === 'suspended') {
      ctx.resume().then(schedulePlay);
    } else {
      schedulePlay();
    }
  }

  function setKeyPlaying(keyIndex, durationMs, octave) {
    var sel = '.piano-key[data-key-index="' + keyIndex + '"]';
    if (keyIndex === 12 || (octave === 5 && keyIndex === 0))
      sel = '.piano-key[data-upper-sa="1"]';
    var keyEl = pianoEl.querySelector(sel);
    if (!keyEl) return;
    keyEl.classList.add('playing');
    setTimeout(function () {
      keyEl.classList.remove('playing');
    }, durationMs);
  }

  function buildPiano() {
    pianoEl.innerHTML = '';
    const isBlack = (i) => [1, 3, 6, 8, 10].indexOf(i) >= 0;
    const whiteOrder = [0, 2, 4, 5, 7, 9, 11, 12];
    const blackOrder = [1, 3, 6, 8, 10];
    const blackIndexMap = { 1: 1, 3: 2, 6: 3, 8: 4, 10: 5 };
    whiteOrder.forEach(function (i) {
      var key = document.createElement('div');
      key.className = 'piano-key white' + (i === 12 ? ' upper-sa' : '');
      key.dataset.keyIndex = String(i);
      if (i === 12) key.dataset.upperSa = '1';
      key.innerHTML = '<span class="key-labels"><span class="carnatic"></span><span class="western"></span></span>';
      pianoEl.appendChild(key);
    });
    blackOrder.forEach(function (i) {
      var key = document.createElement('div');
      key.className = 'piano-key black';
      key.dataset.keyIndex = String(i);
      key.dataset.blackIndex = String(blackIndexMap[i]);
      key.innerHTML = '<span class="key-labels"><span class="carnatic"></span><span class="western"></span></span>';
      pianoEl.appendChild(key);
    });
  }

  function updatePianoLabels() {
    var raga = getCurrentRaga();
    var scale = raga.scale;
    var keyIndices = getKeyIndicesForScale(scale);
    var westernNames = getWesternSpellingForKeyIndices(keyIndices);
    var keyToCarnatic = {};
    var keyToWestern = {};
    for (var j = 0; j < keyIndices.length; j++) {
      keyToCarnatic[keyIndices[j]] = scale[j];
      keyToWestern[keyIndices[j]] = typeof westernNoteForDisplay === 'function' ? westernNoteForDisplay(westernNames[j]) : westernNames[j];
    }
    keyToCarnatic[12] = 'Ṡ';
    keyToWestern[12] = "C'";

    var useWestern = document.getElementById('pianoNotesWestern') && document.getElementById('pianoNotesWestern').checked;
    pianoEl.classList.toggle('piano-labels-western', useWestern);
    pianoEl.classList.toggle('piano-labels-carnatic', !useWestern);

    var keys = pianoEl.querySelectorAll('.piano-key');
    keys.forEach(function (keyEl) {
      var upperSaKey = keyEl.dataset.upperSa === '1';
      var idx = upperSaKey ? 12 : parseInt(keyEl.dataset.keyIndex, 10);
      var inScale = upperSaKey || keyIndices.indexOf(idx) >= 0;
      var carnaticSpan = keyEl.querySelector('.carnatic');
      var westernSpan = keyEl.querySelector('.western');
      if (inScale) {
        carnaticSpan.textContent = keyToCarnatic[idx] || '';
        westernSpan.textContent = keyToWestern[idx] || '';
      } else {
        carnaticSpan.textContent = '';
        westernSpan.textContent = '';
      }
    });
  }

  function updatePianoHighlight() {
    const raga = getCurrentRaga();
    const keyIndices = getKeyIndicesForScale(raga.scale);
    updatePianoLabels();
    const keys = pianoEl.querySelectorAll('.piano-key');
    keys.forEach((keyEl) => {
      var upperSaKey = keyEl.dataset.upperSa === '1';
      var idx = upperSaKey ? 12 : parseInt(keyEl.dataset.keyIndex, 10);
      var inScale = upperSaKey || keyIndices.indexOf(idx) >= 0;
      keyEl.classList.remove('scale-s', 'scale-rg', 'scale-m', 'scale-p', 'scale-dn');
      if (inScale) {
        var scaleIndex = upperSaKey ? 7 : keyIndices.indexOf(idx);
        var scaleClass = scaleIndex === 0 || scaleIndex === 7 ? 'scale-s' : scaleIndex === 1 || scaleIndex === 2 ? 'scale-rg' : scaleIndex === 3 ? 'scale-m' : scaleIndex === 4 ? 'scale-p' : 'scale-dn';
        keyEl.classList.add(scaleClass);
      }
      keyEl.classList.toggle('highlighted', inScale);
      keyEl.classList.toggle('dimmed', !inScale);
      if (upperSaKey) {
        keyEl.onclick = function () {
          ensureAudio();
          var dur = 0.3;
          playNote(0, dur, function () { setKeyPlaying(12, dur * 1000, 5); }, 5);
        };
      } else {
        keyEl.onclick = inScale ? function () {
          ensureAudio();
          var dur = 0.3;
          var k = parseInt(keyEl.dataset.keyIndex, 10);
          playNote(k, dur, function (keyIdx, d) {
            setKeyPlaying(keyIdx, d * 1000);
          });
        } : null;
      }
    });
  }

  function updateRagaInfo() {
    const raga = getCurrentRaga();
    ragaNumberEl.textContent = 'Raga ' + raga.index;
    ragaNameEl.textContent = raga.name;
    if (ragaChakraEl && typeof CHAKRA_NAMES !== 'undefined') {
      var chakraIndex = raga.m * 6 + raga.rg;
      ragaChakraEl.textContent = CHAKRA_NAMES[chakraIndex] != null ? CHAKRA_NAMES[chakraIndex] : '';
    }
    if (typeof getArohanamAvarohanam === 'function') {
      var aa = getArohanamAvarohanam(raga.scale);
      if (ragaArohanamEl) ragaArohanamEl.textContent = aa.arohanam.join(' ') + ' Ṡ';
      if (ragaAvarohanamEl) ragaAvarohanamEl.textContent = 'Ṡ ' + aa.avarohanam.join(' ');
    }
    ragaScaleEl.textContent = raga.scale.join(' ');
    if (ragaScaleWesternEl && typeof getWesternScaleString === 'function') {
      ragaScaleWesternEl.textContent = getWesternScaleString(raga.scale);
    }
    var info = typeof getRagaInfo === 'function' ? getRagaInfo(raga.index) : null;
    if (info) {
      if (ragaPhraseEl) ragaPhraseEl.textContent = info.phrase || '';
      if (ragaComposerYearEl) ragaComposerYearEl.textContent = info.composerYear || '';
      if (ragaTimeOfDayEl) ragaTimeOfDayEl.textContent = info.timeOfDay || '';
    }
    gotoInput.value = raga.index;
  }

  function updateAxisDisplay() {
    var mEl = document.getElementById('dialMValue');
    var rgEl = document.getElementById('dialRgValue');
    var dnEl = document.getElementById('dialDnValue');
    if (mEl) mEl.textContent = m === 0 ? 'M1' : 'M2';
    if (rgEl && typeof RG_LABELS !== 'undefined') rgEl.textContent = RG_LABELS[rg];
    else if (rgEl) rgEl.textContent = 'R' + (rg + 1);
    if (dnEl && typeof DN_LABELS !== 'undefined') dnEl.textContent = DN_LABELS[dn];
    else if (dnEl) dnEl.textContent = 'D' + (dn + 1);
  }

  function setRagaByCoords(newRg, newM, newDn) {
    rg = Math.max(0, Math.min(5, newRg));
    m = Math.max(0, Math.min(1, newM));
    dn = Math.max(0, Math.min(5, newDn));
    updateRagaInfo();
    updatePianoHighlight();
    updateAxisDisplay();
  }

  function setRagaByIndex(ragaIndex) {
    const raga = getRagaByIndex(ragaIndex);
    if (!raga) return;
    rg = raga.rg;
    m = raga.m;
    dn = raga.dn;
    updateRagaInfo();
    updatePianoHighlight();
    updateAxisDisplay();
  }

  function prevRaga() {
    const raga = getCurrentRaga();
    const nextIndex = raga.index === 1 ? 72 : raga.index - 1;
    setRagaByIndex(nextIndex);
  }

  function nextRaga() {
    const raga = getCurrentRaga();
    const nextIndex = raga.index === 72 ? 1 : raga.index + 1;
    setRagaByIndex(nextIndex);
  }

  function playScale(ascending) {
    const raga = getCurrentRaga();
    if (typeof getArohanamAvarohanam !== 'function' || typeof getKeyIndicesInOrder !== 'function') return;
    var aa = getArohanamAvarohanam(raga.scale);
    var arohanamKeys = getKeyIndicesInOrder(aa.arohanam);
    var avarohanamKeys = getKeyIndicesInOrder(aa.avarohanam);
    var order = ascending
      ? arohanamKeys.concat([0])
      : [0].concat(avarohanamKeys);
    const bpm = Math.max(40, Math.min(240, parseInt(bpmInput.value, 10) || 80));
    const noteDuration = 60 / bpm;
    const noteMs = noteDuration * 1000;

    function playNext(idx) {
      if (idx >= order.length) return;
      var keyIdx = order[idx];
      var isUpperSa = (ascending && idx === order.length - 1) || (!ascending && idx === 0);
      var octave = isUpperSa ? 5 : 4;
      playNote(keyIdx, noteDuration * 0.9, function (k, d) {
        setKeyPlaying(isUpperSa ? 12 : k, d * 1000, isUpperSa ? 5 : undefined);
      }, octave);
      scalePlaybackTimeout = setTimeout(function () {
        playNext(idx + 1);
      }, noteMs);
    }

    if (scalePlaybackTimeout) clearTimeout(scalePlaybackTimeout);
    playNext(0);
  }

  function stopScalePlayback() {
    if (scalePlaybackTimeout) {
      clearTimeout(scalePlaybackTimeout);
      scalePlaybackTimeout = null;
    }
  }

  // ——— Init ———
  buildPiano();
  updateRagaInfo();
  updatePianoHighlight();
  updateAxisDisplay();

  (function initAudioUnlock() {
    var overlay = document.getElementById('audioUnlockOverlay');
    if (!overlay) return;
    var done = false;
    function unlockAndHide() {
      if (done) return;
      done = true;
      var ctx = ensureAudio();
      ctx.resume().then(function () {
        overlay.classList.add('audio-unlock-overlay--hidden');
        overlay.setAttribute('aria-hidden', 'true');
      }).catch(function () {
        done = false;
      });
    }
    overlay.addEventListener('touchstart', function (e) {
      e.preventDefault();
      unlockAndHide();
    }, { passive: false });
    overlay.addEventListener('click', function (e) {
      e.preventDefault();
      unlockAndHide();
    });
  })();

  document.getElementById('sidebarToggle').addEventListener('click', function () {
    var overlay = document.getElementById('settingsOverlay');
    overlay.classList.add('settings-overlay--open');
    overlay.setAttribute('aria-hidden', 'false');
  });

  document.getElementById('settingsClose').addEventListener('click', function () {
    var overlay = document.getElementById('settingsOverlay');
    overlay.classList.remove('settings-overlay--open');
    overlay.setAttribute('aria-hidden', 'true');
  });

  document.getElementById('settingsOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
      this.classList.remove('settings-overlay--open');
      this.setAttribute('aria-hidden', 'true');
    }
  });

  document.getElementById('btnPrev').addEventListener('click', prevRaga);
  document.getElementById('btnNext').addEventListener('click', nextRaga);
  document.getElementById('btnRandom').addEventListener('click', function () {
    var num = Math.floor(Math.random() * 72) + 1;
    setRagaByIndex(num);
  });
  document.getElementById('dialMUp').addEventListener('click', function () {
    setRagaByCoords(rg, m === 1 ? 0 : 1, dn);
  });
  document.getElementById('dialMDown').addEventListener('click', function () {
    setRagaByCoords(rg, m === 0 ? 1 : 0, dn);
  });
  document.getElementById('dialRgUp').addEventListener('click', function () {
    setRagaByCoords(rg === 5 ? 0 : rg + 1, m, dn);
  });
  document.getElementById('dialRgDown').addEventListener('click', function () {
    setRagaByCoords(rg === 0 ? 5 : rg - 1, m, dn);
  });
  document.getElementById('dialDnUp').addEventListener('click', function () {
    setRagaByCoords(rg, m, dn === 5 ? 0 : dn + 1);
  });
  document.getElementById('dialDnDown').addEventListener('click', function () {
    setRagaByCoords(rg, m, dn === 0 ? 5 : dn - 1);
  });

  document.getElementById('btnGoto').addEventListener('click', function () {
    const num = parseInt(gotoInput.value, 10);
    if (num >= 1 && num <= 72) setRagaByIndex(num);
  });

  if (reverbInput) {
    function updateReverbLabel() {
      if (reverbValueEl) reverbValueEl.textContent = (reverbInput.value || 0) + '%';
    }
    updateReverbLabel();
    reverbInput.addEventListener('input', updateReverbLabel);
  }

  var pianoNotesWestern = document.getElementById('pianoNotesWestern');
  var pianoNotesCarnatic = document.getElementById('pianoNotesCarnatic');
  if (pianoNotesWestern) pianoNotesWestern.addEventListener('change', updatePianoLabels);
  if (pianoNotesCarnatic) pianoNotesCarnatic.addEventListener('change', updatePianoLabels);

  document.getElementById('btnPlayAsc').addEventListener('click', function () {
    ensureAudio();
    playScale(true);
  });
  document.getElementById('btnPlayDesc').addEventListener('click', function () {
    ensureAudio();
    playScale(false);
  });

  window.melakartaApp = {
    setRagaByCoords: setRagaByCoords,
    getCurrentRaga: getCurrentRaga,
    stopScalePlayback: stopScalePlayback
  };
})();
