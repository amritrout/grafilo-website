(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- AI bar demo ---------- */

  var SLIDES = [
    { tab: 'Polish', lit: 0, bl: 'Your text', b: 'i dont thnk we can mke it tmrw, can u move the mtg',
      al: 'Kip’s result', a: 'I don’t think we can make it tomorrow. Can you move the meeting?',
      chips: ['Fix Grammar', 'Rephrase', 'Add Emojis'], pick: 0, sel: false,
      says: 'Tap Polish to fix your writing', note: 'Nothing selected? Kip fixes everything you wrote.' },
    { tab: 'Tone', lit: 1, bl: 'Your selected text', b: 'Send me the report today.',
      al: 'Kip’s result', a: 'Hey! Could you send me the report today? Thanks!',
      chips: ['Professional', 'Casual', 'Friendly', 'Poetic'], pick: 2, sel: true,
      says: 'Tap Tone to change how it sounds', note: 'Select just a part of your text and only that part changes.' },
    { tab: 'Reply', lit: 3, bl: 'Message on your screen', b: 'Are you coming to dinner on Friday?',
      al: 'Kip’s reply', a: 'Yes, I’d love to! What time?',
      chips: ['Positive', 'Neutral', 'Negative'], pick: 0, sel: false,
      says: 'Tap Reply and Kip writes an answer', note: 'Kip reads the message on your screen only when you tap Reply.' },
    { tab: 'Chat', lit: 4, bl: 'You ask', b: 'Give me a polite way to say no',
      al: 'Kip’s answer', a: 'Thank you for asking. I’m not able to, but I appreciate it.',
      chips: [], pick: -1, sel: false,
      says: 'Tap Chat to ask Kip anything', note: 'It answers on your phone and forgets the chat when you close it.' },
    { tab: 'Voice', voice: true,
      says: 'Tap the mic and talk, ums and all', note: 'Speak naturally. Kip removes the ums, fixes the mistakes, and takes spoken changes.' }
  ];

  var tabsEl = $('demo-tabs');
  var panelText = $('panel-text');
  var panelVoice = $('panel-voice');
  var bars = document.querySelectorAll('#aibar .bi');
  var chipsEl = $('chips');
  var afterCard = $('t-after-card');
  var kipBar = $('kip-bar');
  var slide = 0;
  var timers = [];
  var playing = true;

  SLIDES.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.textContent = s.tab;
    b.addEventListener('click', function () { playing = !reduced; show(i); });
    tabsEl.appendChild(b);
  });

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function reveal(el, on) { el.classList.toggle('on', !!on); }

  function setKip(src) { if (kipBar.getAttribute('src') !== src) kipBar.setAttribute('src', src); }

  function show(i) {
    clearTimers();
    slide = i;
    var s = SLIDES[i];
    Array.prototype.forEach.call(tabsEl.children, function (b, k) {
      b.setAttribute('aria-selected', k === i ? 'true' : 'false');
    });
    $('demo-says').textContent = s.says;
    $('demo-note').textContent = s.note;
    setKip('kip.svg');
    if (s.voice) { panelText.hidden = true; panelVoice.hidden = false; runVoice(); }
    else { panelVoice.hidden = true; panelText.hidden = false; runText(s); }
  }

  function next() { show((slide + 1) % SLIDES.length); }

  function runText(s) {
    $('t-before-label').textContent = s.bl;
    var before = $('t-before');
    before.textContent = s.b;
    before.classList.toggle('sel', s.sel);
    $('t-after-label').textContent = s.al;
    $('t-after').textContent = s.a;
    chipsEl.textContent = '';
    s.chips.forEach(function (c) {
      var e = document.createElement('span');
      e.textContent = c;
      chipsEl.appendChild(e);
    });

    function state(step) {
      Array.prototype.forEach.call(bars, function (b, k) { b.classList.toggle('lit', step >= 1 && k === s.lit); });
      reveal(chipsEl, step >= 1 && s.chips.length > 0);
      Array.prototype.forEach.call(chipsEl.children, function (c, k) { c.classList.toggle('pick', step >= 2 && k === s.pick); });
      reveal(afterCard, step >= 4);
      setKip(step === 4 ? 'kip-happy.svg' : 'kip.svg');
      kipBar.classList.toggle('think', step === 3);
    }

    state(0);
    if (reduced) { state(4); return; }
    later(900, function () { state(1); });
    later(2000, function () { state(2); });
    later(2900, function () { state(3); });
    later(4000, function () { state(4); });
    if (playing) later(8200, next);
  }

  function runVoice() {
    var mic = $('mic');
    var micLabel = $('mic-label');
    var said = $('v-said');
    var clean = $('v-clean');
    var cmd = $('v-cmd');
    var cleanLabel = $('v-clean-label');
    var cleanText = $('v-clean-text');

    function state(stage) {
      var listening = stage === 0 || stage === 1 || stage === 4;
      mic.classList.toggle('live', listening);
      micLabel.textContent = listening ? 'Listening…' : 'Done';
      reveal(said, stage >= 1);
      reveal(clean, stage >= 3);
      reveal(cmd, stage >= 4);
      cleanLabel.textContent = stage >= 5 ? '3. Kip edits it' : '2. Kip writes it clean';
      cleanText.textContent = stage >= 5 ? 'Hi! Please let him know I’ll be there at six. Thanks!' : 'Tell him I’ll be there at six.';
      setKip(stage === 2 ? 'kip.svg' : (stage === 3 || stage === 5 ? 'kip-happy.svg' : 'kip.svg'));
      kipBar.classList.toggle('think', stage === 2);
    }

    state(0);
    if (reduced) { state(5); return; }
    later(1000, function () { state(1); });
    later(3800, function () { state(2); });
    later(4900, function () { state(3); });
    later(7500, function () { state(4); });
    later(9300, function () { state(5); });
    if (playing) later(13200, next);
  }

  playing = !reduced;
  show(0);

  /* ---------- Theme playground ---------- */

  var PRESETS = [
    ['Red', '#e53935'], ['Green', '#4caf50'], ['Orange', '#ff9800'], ['Blue', '#2962ff'],
    ['Teal', '#009688'], ['Purple', '#7e57c2'], ['Pink', '#e91e63'], ['Amber', '#ffb300'], ['Graphite', '#607d8b']
  ];
  var ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  var kb = $('kb');
  var rowsEl = $('kb-rows');
  var cfg = { acc: '#e53935', style: 'light', font: 'sans', radius: 8, shadow: true };

  ROWS.forEach(function (letters, r) {
    var row = document.createElement('div');
    row.className = 'kb-row r' + r;
    if (r === 2) row.appendChild(key('⇧', 'fn'));
    letters.split('').forEach(function (l) { row.appendChild(key(l, '')); });
    if (r === 2) row.appendChild(key('⌫', 'fn'));
    rowsEl.appendChild(row);
  });
  var last = document.createElement('div');
  last.className = 'kb-row r3';
  last.appendChild(key('123', 'fn wide'));
  last.appendChild(key(',', ''));
  last.appendChild(key('space', 'space'));
  last.appendChild(key('.', ''));
  last.appendChild(key('↵', 'enter'));
  rowsEl.appendChild(last);

  function key(label, cls) {
    var k = document.createElement('span');
    k.className = 'key ' + cls;
    k.textContent = label;
    return k;
  }

  function hex(c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16); }); }
  function mix(a, b, t) {
    var x = hex(a), y = hex(b);
    return '#' + x.map(function (v, i) {
      var m = Math.round(v + (y[i] - v) * t);
      return (m < 16 ? '0' : '') + m.toString(16);
    }).join('');
  }
  function luminance(c) {
    var v = hex(c).map(function (n) { n /= 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }

  function paint() {
    var a = cfg.acc;
    var light = cfg.style === 'light';
    var bg = light ? mix(a, '#ffffff', 0.9) : (cfg.style === 'black' ? '#000000' : mix(a, '#1b1b1f', 0.88));
    var keyBg = light ? '#ffffff' : (cfg.style === 'black' ? '#161618' : mix(a, '#2a2a2f', 0.86));
    var ink = light ? '#1b1b1f' : '#ececf1';
    var fonts = { sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', serif: 'Georgia, "Times New Roman", serif', mono: 'ui-monospace, Menlo, Consolas, monospace' };
    var s = kb.style;
    s.setProperty('--kb-bg', bg);
    s.setProperty('--kb-key', keyBg);
    s.setProperty('--kb-ink', ink);
    s.setProperty('--kb-fn', mix(a, keyBg, light ? 0.78 : 0.7));
    s.setProperty('--kb-acc', a);
    s.setProperty('--kb-acc-ink', luminance(a) > 0.45 ? '#16161c' : '#ffffff');
    s.setProperty('--kb-radius', cfg.radius + 'px');
    s.setProperty('--kb-shadow', cfg.shadow ? '0 1.5px 0 rgba(0,0,0,0.28)' : 'none');
    s.setProperty('--kb-font', fonts[cfg.font]);
  }

  var swatchEl = $('swatches');
  PRESETS.forEach(function (p, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sw';
    b.title = p[0];
    b.setAttribute('aria-label', p[0]);
    b.style.background = p[1];
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () { pickColour(p[1], b); });
    swatchEl.appendChild(b);
  });
  var custom = document.createElement('label');
  custom.className = 'sw custom';
  custom.title = 'Any colour';
  var input = document.createElement('input');
  input.type = 'color';
  input.value = '#e53935';
  input.setAttribute('aria-label', 'Choose any colour');
  input.addEventListener('input', function () { pickColour(input.value, custom); });
  custom.appendChild(input);
  swatchEl.appendChild(custom);

  function pickColour(c, el) {
    cfg.acc = c;
    Array.prototype.forEach.call(swatchEl.children, function (n) { n.setAttribute('aria-pressed', n === el ? 'true' : 'false'); });
    paint();
  }

  function seg(id, key) {
    var box = $(id);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      Array.prototype.forEach.call(box.children, function (n) { n.setAttribute('aria-pressed', n === b ? 'true' : 'false'); });
      var v = b.getAttribute('data-v');
      cfg[key] = key === 'shadow' ? v === 'on' : v;
      paint();
    });
  }
  seg('seg-style', 'style');
  seg('seg-font', 'font');
  seg('seg-shadow', 'shadow');
  $('radius').addEventListener('input', function (e) { cfg.radius = +e.target.value; paint(); });
  paint();
})();
