(function () {
  'use strict';

  // ——— State ———
  let rg = 0, m = 0, dn = 0;
  let audioContext = null;
  let scalePlaybackTimeout = null;

  // ——— DOM refs ———
  const ragaNumberEl = document.getElementById('ragaNumber');
  const ragaNameEl = document.getElementById('ragaName');
  const ragaArohanamEl = document.getElementById('ragaArohanam');
  const ragaAvarohanamEl = document.getElementById('ragaAvarohanam');
  const ragaPhraseEl = document.getElementById('ragaPhrase');
  const ragaComposerYearEl = document.getElementById('ragaComposerYear');
  const ragaTimeOfDayEl = document.getElementById('ragaTimeOfDay');
  const ragaChakraEl = document.getElementById('ragaChakra');
  const ragaHindustaniEl = document.getElementById('ragaHindustani');
  const ragaWesternEl = document.getElementById('ragaWestern');
  const pianoEl = document.getElementById('piano');
  const bpmInput = document.getElementById('bpmInput');
  const reverbInput = document.getElementById('reverbInput');
  const ragaSearchInput = document.getElementById('ragaSearchInput');
  const ragaListEl = document.getElementById('ragaList');
  const reverbValueEl = document.getElementById('reverbValue');

  const SETTINGS_KEY = 'melakartaSettings';

  function loadSettings() {
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      var s = JSON.parse(raw);
      if (bpmInput && s.bpm != null) {
        var bpm = Math.max(40, Math.min(240, Number(s.bpm) || 80));
        bpmInput.value = String(bpm);
      }
      if (reverbInput && s.reverb != null) {
        var rev = Math.max(0, Math.min(100, Number(s.reverb) || 0));
        reverbInput.value = String(rev);
        if (reverbValueEl) reverbValueEl.textContent = rev + '%';
      }
      if (s.rootNote != null) {
        var r = Math.max(0, Math.min(11, parseInt(s.rootNote, 10) || 0));
        setRootNote(r);
      }
      if (s.instrument === 'guitar' || s.instrument === 'veena' || s.instrument === 'violin') {
        var instBtn = document.querySelector('.instrument-btn[data-instrument="' + s.instrument + '"]');
        if (instBtn) {
          document.querySelectorAll('.instrument-btn').forEach(function (b) { b.classList.remove('selected'); });
          instBtn.classList.add('selected');
        }
      } else if (s.instrument === 'sitar') {
        var veenaBtn = document.querySelector('.instrument-btn[data-instrument="veena"]');
        if (veenaBtn) {
          document.querySelectorAll('.instrument-btn').forEach(function (b) { b.classList.remove('selected'); });
          veenaBtn.classList.add('selected');
        }
      } else if (s.instrument === 'piano') {
        var p = document.querySelector('.instrument-btn[data-instrument="piano"]');
        if (p) {
          document.querySelectorAll('.instrument-btn').forEach(function (b) { b.classList.remove('selected'); });
          p.classList.add('selected');
        }
      }
      updateTransposeLabel();
      updatePianoLabels();
      updatePianoHighlight();
      updateRagaInfo();
    } catch (e) {}
  }

  function saveSettings() {
    try {
      var s = {
        bpm: bpmInput ? parseInt(bpmInput.value, 10) || 80 : 80,
        reverb: reverbInput ? parseInt(reverbInput.value, 10) || 0 : 0,
        rootNote: getRootNote(),
        instrument: getInstrument()
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch (e) {}
  }

  let rootNote = 0;

  function getRootNote() {
    return rootNote;
  }

  function setRootNote(value) {
    var n = Math.max(0, Math.min(11, parseInt(value, 10) || 0));
    rootNote = n;
    var group = document.getElementById('rootNoteGroup');
    if (group) {
      group.querySelectorAll('.root-note-btn').forEach(function (btn) {
        btn.classList.toggle('selected', parseInt(btn.dataset.root, 10) === n);
      });
    }
    updateTransposeLabel();
  }

  function getInstrument() {
    var btn = document.querySelector('.instrument-btn.selected');
    var v = btn ? btn.dataset.instrument : 'piano';
    return (v === 'guitar' || v === 'veena' || v === 'violin') ? v : 'piano';
  }

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

  /**
   * Schedule a single note with the selected instrument timbre.
   * Connects to dry/reverb and runs at ctx.currentTime.
   */
  function scheduleInstrumentNote(ctx, freq, durationSeconds, instrument, reverbAmt) {
    var now = ctx.currentTime;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);

    function connectToDestination(src) {
      src.connect(gain);
      if (dryGainNode) {
        gain.connect(dryGainNode);
        if (reverbConvolver) src.connect(reverbConvolver);
        dryGainNode.gain.setValueAtTime(1 - reverbAmt, now);
        if (reverbGainNode) reverbGainNode.gain.setValueAtTime(reverbAmt, now);
      } else {
        gain.connect(ctx.destination);
      }
    }

    if (instrument === 'piano') {
      var osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      var osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2.5;
      var gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.15, now);
      osc.connect(gain);
      osc2.connect(gain2);
      gain2.connect(gain);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + durationSeconds * 0.9);
      osc.start(now);
      osc.stop(now + durationSeconds);
      osc2.start(now);
      osc2.stop(now + durationSeconds * 0.4);
      connectToDestination(gain);
      return;
    }

    if (instrument === 'guitar') {
      var decay = Math.min(0.4, durationSeconds * 1.2);
      var osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + decay * 0.3);
      filter.Q.value = 2;
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + decay);
      osc.connect(filter);
      filter.connect(gain);
      osc.start(now);
      osc.stop(now + decay);
      connectToDestination(gain);
      return;
    }

    if (instrument === 'veena') {
      var attack = 0.02;
      var release = Math.min(0.8, durationSeconds * 1.5);
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      var osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 0.5;
      var gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.12, now);
      osc.connect(gain);
      osc2.connect(gain2);
      gain2.connect(gain);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.01, now + release);
      osc.start(now);
      osc.stop(now + release);
      osc2.start(now);
      osc2.stop(now + release);
      connectToDestination(gain);
      return;
    }

    if (instrument === 'violin') {
      var attack = 0.05;
      var release = Math.min(0.6, durationSeconds * 1.2);
      var osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2800;
      filter.Q.value = 1;
      var vibrato = ctx.createOscillator();
      vibrato.type = 'sine';
      vibrato.frequency.value = 5;
      vibrato.start(now);
      vibrato.stop(now + release);
      var vibGain = ctx.createGain();
      vibGain.gain.value = freq * 0.008;
      vibrato.connect(vibGain);
      vibGain.connect(osc.frequency);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.01, now + release);
      osc.connect(filter);
      filter.connect(gain);
      osc.start(now);
      osc.stop(now + release);
      connectToDestination(gain);
      return;
    }

    // fallback: piano-like sine
    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + durationSeconds);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + durationSeconds);
    connectToDestination(gain);
  }

  function playNote(pitchIndex, durationSeconds, onKeyLit, octave) {
    if (octave == null) octave = 4;
    const ctx = ensureAudio();
    const instrument = getInstrument();

    function schedulePlay() {
      const freq = getFrequencyForKeyIndex(pitchIndex, octave);
      const reverbAmt = getReverbAmount();
      scheduleInstrumentNote(ctx, freq, durationSeconds, instrument, reverbAmt);
      if (typeof onKeyLit === 'function') onKeyLit(durationSeconds);
    }

    if (ctx.state === 'suspended') {
      ctx.resume().then(schedulePlay);
    } else {
      schedulePlay();
    }
  }

  function setKeyPlaying(keyIndex, durationMs, octave) {
    var sel = '.piano-key[data-key-index="' + keyIndex + '"]';
    if (keyIndex === 12)
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
    var root = getRootNote();
    pianoEl.classList.add('piano-labels-western');

    var westernSharp = (typeof WESTERN_SHARP !== 'undefined') ? WESTERN_SHARP : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    var keys = pianoEl.querySelectorAll('.piano-key');
    keys.forEach(function (keyEl) {
      var upperSaKey = keyEl.dataset.upperSa === '1';
      var keyIndex = upperSaKey ? 12 : parseInt(keyEl.dataset.keyIndex, 10);
      var inScale = upperSaKey || keyIndices.indexOf(keyIndex) >= 0;
      var carnaticSpan = keyEl.querySelector('.carnatic');
      var westernSpan = keyEl.querySelector('.western');
      if (inScale) {
        var scaleIdx = upperSaKey ? 7 : keyIndices.indexOf(keyIndex);
        carnaticSpan.textContent = upperSaKey ? 'Ṡ' : (scale[scaleIdx] || '');
        var transposedPitch = upperSaKey ? root : (keyIndex + root) % 12;
        var westernName = westernSharp[transposedPitch];
        if (upperSaKey) {
          westernSpan.innerHTML = typeof westernNoteForDisplayHTML === 'function' ? westernNoteForDisplayHTML(westernName + "'") : westernName + "'";
        } else {
          westernSpan.innerHTML = typeof westernNoteForDisplayHTML === 'function' ? westernNoteForDisplayHTML(westernName) : westernName;
        }
      } else {
        carnaticSpan.textContent = '';
        westernSpan.innerHTML = '';
      }
    });
  }

  function updatePianoHighlight() {
    const raga = getCurrentRaga();
    const keyIndices = getKeyIndicesForScale(raga.scale);
    var root = getRootNote();
    updatePianoLabels();
    const keys = pianoEl.querySelectorAll('.piano-key');
    keys.forEach((keyEl) => {
      var upperSaKey = keyEl.dataset.upperSa === '1';
      var keyIndex = upperSaKey ? 12 : parseInt(keyEl.dataset.keyIndex, 10);
      var inScale = upperSaKey || keyIndices.indexOf(keyIndex) >= 0;
      keyEl.classList.remove('scale-s', 'scale-rg', 'scale-m', 'scale-p', 'scale-dn');
      if (inScale) {
        var scaleIndex = upperSaKey ? 7 : keyIndices.indexOf(keyIndex);
        var scaleClass = scaleIndex === 0 || scaleIndex === 7 ? 'scale-s' : scaleIndex === 1 || scaleIndex === 2 ? 'scale-rg' : scaleIndex === 3 ? 'scale-m' : scaleIndex === 4 ? 'scale-p' : 'scale-dn';
        keyEl.classList.add(scaleClass);
      }
      keyEl.classList.toggle('highlighted', inScale);
      keyEl.classList.toggle('dimmed', !inScale);
      if (upperSaKey) {
        keyEl.onclick = function () {
          ensureAudio();
          var dur = 0.3;
          playNote(root, dur, function () { setKeyPlaying(12, dur * 1000, 5); }, 5);
        };
      } else {
        keyEl.onclick = inScale ? function () {
          ensureAudio();
          var dur = 0.3;
          var p = parseInt(keyEl.dataset.keyIndex, 10);
          var transposedPitch = (p + root) % 12;
          playNote(transposedPitch, dur, function () { setKeyPlaying(p, dur * 1000, 4); }, 4);
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
      if (ragaArohanamEl) {
        ragaArohanamEl.textContent = aa.arohanam.join(' ') + ' Ṡ';
      }
      if (ragaAvarohanamEl) {
        ragaAvarohanamEl.textContent = 'Ṡ ' + aa.avarohanam.join(' ');
      }
    }
    var info = typeof getRagaInfo === 'function' ? getRagaInfo(raga.index) : null;
    if (info) {
      if (ragaPhraseEl) ragaPhraseEl.textContent = info.phrase || '';
      if (ragaComposerYearEl) ragaComposerYearEl.textContent = info.composerYear || '';
      if (ragaTimeOfDayEl) ragaTimeOfDayEl.textContent = info.timeOfDay || '';
      var hindRow = document.getElementById('ragaRowHindustani');
      var westRow = document.getElementById('ragaRowWestern');
      if (ragaHindustaniEl && hindRow) {
        ragaHindustaniEl.textContent = info.hindustani || '';
        hindRow.style.display = info.hindustani ? 'block' : 'none';
      }
      if (ragaWesternEl && westRow) {
        ragaWesternEl.textContent = info.western || '';
        westRow.style.display = info.western ? 'block' : 'none';
      }
    }
    updateRagaListSelection(raga.index);
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
    var root = getRootNote();

    function playNext(idx, prevPitchIndex, prevOctave) {
      if (idx >= order.length) return;
      var keyIdx = order[idx];
      var isUpperSa = (ascending && idx === order.length - 1) || (!ascending && idx === 0);
      var pitchIndex = (keyIdx + root) % 12;
      var octave = isUpperSa ? 5 : 4;
      if (ascending && prevPitchIndex != null && prevOctave != null) {
        var prevMidi = prevOctave * 12 + prevPitchIndex;
        var currMidi = octave * 12 + pitchIndex;
        if (currMidi <= prevMidi) octave = 5;
      }
      var keyToHighlight = isUpperSa ? 12 : keyIdx;
      playNote(pitchIndex, noteDuration * 0.9, function () {
        setKeyPlaying(keyToHighlight, noteMs, octave);
      }, octave);
      scalePlaybackTimeout = setTimeout(function () {
        playNext(idx + 1, pitchIndex, octave);
      }, noteMs);
    }

    if (scalePlaybackTimeout) clearTimeout(scalePlaybackTimeout);
    playNext(0, null, null);
  }

  function stopScalePlayback() {
    if (scalePlaybackTimeout) {
      clearTimeout(scalePlaybackTimeout);
      scalePlaybackTimeout = null;
    }
  }

  function renderRagaList(filter) {
    if (!ragaListEl || typeof MELAKARTA === 'undefined') return;
    var q = (filter || '').trim().toLowerCase();
    var list = MELAKARTA.filter(function (r) {
      if (!q) return true;
      return (r.name && r.name.toLowerCase().indexOf(q) >= 0) ||
             (String(r.index).indexOf(q) >= 0);
    });
    ragaListEl.innerHTML = '';
    list.forEach(function (r) {
      var li = document.createElement('li');
      li.className = 'raga-list-item';
      li.dataset.ragaIndex = String(r.index);
      li.textContent = r.index + '. ' + r.name;
      li.addEventListener('click', function () {
        setRagaByIndex(r.index);
      });
      ragaListEl.appendChild(li);
    });
  }

  function updateRagaListSelection(ragaIndex) {
    if (!ragaListEl) return;
    ragaListEl.querySelectorAll('.raga-list-item').forEach(function (li) {
      li.classList.toggle('selected', parseInt(li.dataset.ragaIndex, 10) === ragaIndex);
    });
  }

  function updateTransposeLabel() {
    if (typeof WESTERN_NOTES === 'undefined') return;
    var root = getRootNote();
    var note = WESTERN_NOTES[root] != null ? WESTERN_NOTES[root] : 'C';
    var playEl = document.getElementById('transposeLabel');
    if (playEl) playEl.textContent = note;
  }

  function buildRootNoteButtons() {
    var group = document.getElementById('rootNoteGroup');
    if (!group || group.querySelectorAll('.root-note-btn').length > 0) return;
    if (typeof WESTERN_NOTES === 'undefined') return;
    for (var i = 0; i < 12; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'root-note-btn' + (i === 0 ? ' selected' : '');
      btn.dataset.root = String(i);
      btn.setAttribute('aria-label', 'Starting Sa: ' + (WESTERN_NOTES[i] || ''));
      btn.textContent = WESTERN_NOTES[i] != null ? WESTERN_NOTES[i] : '';
      (function (idx) {
        btn.addEventListener('click', function () {
          setRootNote(idx);
          saveSettings();
          updatePianoLabels();
          updatePianoHighlight();
        });
      })(i);
      group.appendChild(btn);
    }
  }

  // ——— Init ———
  buildPiano();
  buildRootNoteButtons();
  updateTransposeLabel();
  updateRagaInfo();
  updatePianoHighlight();
  updateAxisDisplay();
  loadSettings();
  updateTransposeLabel();
  renderRagaList('');
  if (ragaSearchInput) {
    ragaSearchInput.addEventListener('input', function () {
      renderRagaList(ragaSearchInput.value);
      updateRagaListSelection(getCurrentRaga().index);
    });
  }

  (function initAudioUnlock() {
    var overlay = document.getElementById('audioUnlockOverlay');
    var unlockBtn = document.getElementById('audioUnlockBtn');
    if (!overlay) return;
    var done = false;
    function unlockAndHide() {
      if (done) return;
      done = true;
      var ctx = ensureAudio();
      ctx.resume();
      overlay.classList.add('audio-unlock-overlay--hidden');
      overlay.setAttribute('aria-hidden', 'true');
    }
    function onTap(e) {
      if (e) e.preventDefault();
      unlockAndHide();
    }
    if (unlockBtn) {
      unlockBtn.addEventListener('touchstart', onTap, { passive: false });
      unlockBtn.addEventListener('touchend', onTap, { passive: false });
      unlockBtn.addEventListener('click', onTap);
    }
    overlay.addEventListener('touchstart', onTap, { passive: false });
    overlay.addEventListener('touchend', onTap, { passive: false });
    overlay.addEventListener('click', onTap);
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

  if (reverbInput) {
    function updateReverbLabel() {
      if (reverbValueEl) reverbValueEl.textContent = (reverbInput.value || 0) + '%';
    }
    updateReverbLabel();
    reverbInput.addEventListener('input', function () {
      updateReverbLabel();
      saveSettings();
    });
  }

  if (bpmInput) {
    bpmInput.addEventListener('change', saveSettings);
    bpmInput.addEventListener('input', saveSettings);
  }

  var instrumentGroup = document.getElementById('instrumentGroup');
  if (instrumentGroup) {
    instrumentGroup.querySelectorAll('.instrument-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        instrumentGroup.querySelectorAll('.instrument-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        saveSettings();
      });
    });
  }

  document.getElementById('btnPlayAsc').addEventListener('click', function () {
    ensureAudio();
    playScale(true);
  });
  document.getElementById('btnPlayDesc').addEventListener('click', function () {
    ensureAudio();
    playScale(false);
  });

  var btnTransposePrev = document.getElementById('btnTransposePrev');
  var btnTransposeNext = document.getElementById('btnTransposeNext');
  if (btnTransposePrev) {
    btnTransposePrev.addEventListener('click', function () {
      setRootNote((getRootNote() + 11) % 12);
      saveSettings();
      updatePianoLabels();
      updatePianoHighlight();
    });
  }
  if (btnTransposeNext) {
    btnTransposeNext.addEventListener('click', function () {
      setRootNote((getRootNote() + 1) % 12);
      saveSettings();
      updatePianoLabels();
      updatePianoHighlight();
    });
  }

  window.melakartaApp = {
    setRagaByCoords: setRagaByCoords,
    getCurrentRaga: getCurrentRaga,
    stopScalePlayback: stopScalePlayback
  };
})();
