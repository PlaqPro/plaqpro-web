/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
var PauseCafe = {
  _timerInterval: null,
  _timerDuration: 0,
  _timerRemaining: 0,
  _muted: true,

  CITATIONS: [
    "Un bon artisan mérite un bon café !",
    "Entre deux cloisons, un café s'impose.",
    "Le plâtre sèche, le café refroidit — profitez du bon !",
    "Mesure deux fois, café une fois !",
    "Un chantier sans pause café n'est pas un chantier sérieux !"
  ],

  show() {
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    this._buildOverlay();
  },

  hide() {
    const ov = document.getElementById('pause-cafe-overlay');
    if (ov) { ov.style.opacity = '0'; setTimeout(() => ov.remove(), 420); }
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
  },

  _buildOverlay() {
    const existing = document.getElementById('pause-cafe-overlay');
    if (existing) existing.remove();
    const ov = document.createElement('div');
    ov.id = 'pause-cafe-overlay';
    ov.innerHTML = `
      <canvas id="cafe-particles"></canvas>
      <div class="cafe-container">
        <div class="cafe-cup-wrapper">${this._svgCup()}</div>
        <h1 class="cafe-title">☕ Pause Café</h1>

        <div class="cafe-quote" id="cafe-quote">
          <div class="cafe-quote-loading">✨ Une pensée pour vous...</div>
        </div>

        <div class="cafe-stats-wrap" id="cafe-stats"></div>

        <div class="cafe-meteo-wrap" id="cafe-meteo"></div>

        <div class="cafe-music-card">
          <div class="cafe-card-label">🎵 Lofi pour la pause</div>
          <div class="cafe-music-row">
            <button id="cafe-mute-btn" onclick="PauseCafe.toggleMute()" title="Mute/Unmute">🔇</button>
            <span id="cafe-mute-hint">Cliquez 🔊 pour activer le son</span>
          </div>
          <div class="cafe-yt-wrap">
            <iframe id="cafe-yt"
              src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&loop=1&playlist=jfKfPfyJRdk"
              allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        </div>

        <div class="cafe-timer-card">
          <div class="cafe-card-label">⏱ Durée de la pause</div>
          <div class="cafe-timer-btns">
            <button onclick="PauseCafe.startTimer(5,this)" class="cafe-timer-btn">5 min</button>
            <button onclick="PauseCafe.startTimer(10,this)" class="cafe-timer-btn">10 min</button>
            <button onclick="PauseCafe.startTimer(15,this)" class="cafe-timer-btn">15 min</button>
          </div>
          <div id="cafe-countdown" style="display:none">
            <div id="cafe-cdown">--:--</div>
            <div class="cafe-cdown-bar"><div id="cafe-cdown-fill"></div></div>
          </div>
        </div>

        <button class="cafe-back-btn" onclick="PauseCafe.hide()">💪 Retour au travail</button>
      </div>
    `;
    document.body.appendChild(ov);
    requestAnimationFrame(() => { ov.style.opacity = '1'; });
    this._muted = true;
    this._startParticles();
    this._loadQuote();
    this._loadStats();
    this._loadMeteo();
  },

  toggleMute() {
    this._muted = !this._muted;
    const btn = document.getElementById('cafe-mute-btn');
    const hint = document.getElementById('cafe-mute-hint');
    const iframe = document.getElementById('cafe-yt');
    if (btn) btn.textContent = this._muted ? '🔇' : '🔊';
    if (hint) hint.textContent = this._muted ? 'Cliquez 🔊 pour activer le son' : '🎵 Musique en cours...';
    if (iframe) {
      const base = 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1&playlist=jfKfPfyJRdk';
      iframe.src = base + (this._muted ? '&mute=1' : '&mute=0');
    }
  },

  startTimer(minutes, btn) {
    if (this._timerInterval) clearInterval(this._timerInterval);
    document.querySelectorAll('.cafe-timer-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this._timerDuration = minutes * 60;
    this._timerRemaining = this._timerDuration;
    const el = document.getElementById('cafe-countdown');
    if (el) el.style.display = 'block';
    this._renderCountdown();
    this._timerInterval = setInterval(() => {
      this._timerRemaining--;
      this._renderCountdown();
      if (this._timerRemaining <= 0) {
        clearInterval(this._timerInterval);
        this._timerInterval = null;
        this._onTimerEnd();
      }
    }, 1000);
  },

  _renderCountdown() {
    const m = Math.floor(this._timerRemaining / 60);
    const s = this._timerRemaining % 60;
    const disp = document.getElementById('cafe-cdown');
    const fill = document.getElementById('cafe-cdown-fill');
    if (disp) {
      disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      const pct = this._timerRemaining / this._timerDuration;
      disp.style.color = pct < 0.2 ? '#ef4444' : pct < 0.5 ? '#f59e0b' : '#2DD4A0';
    }
    if (fill && this._timerDuration > 0) {
      fill.style.width = ((1 - this._timerRemaining / this._timerDuration) * 100) + '%';
    }
  },

  _onTimerEnd() {
    this._playDing();
    const disp = document.getElementById('cafe-cdown');
    if (disp) { disp.textContent = '00:00'; disp.style.animation = 'cafeFlash .5s 6'; }
    const t = document.createElement('div');
    t.className = 'cafe-toast';
    t.textContent = '☕ Pause terminée — retour au chantier !';
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 50);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4500);
  },

  _playDing() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [[880, 0], [1100, 0.28], [880, 0.56]].forEach(([freq, delay]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = 'sine';
        const t = ctx.currentTime + delay;
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.start(t); osc.stop(t + 0.55);
      });
    } catch(e) {}
  },

  _startParticles() {
    const canvas = document.getElementById('cafe-particles');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const bubbles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height * (0.4 + Math.random() * 0.7),
      r: 2 + Math.random() * 11,
      vy: 0.25 + Math.random() * 0.75,
      wobble: Math.random() * Math.PI * 2,
      op: 0.07 + Math.random() * 0.2
    }));
    const tick = () => {
      if (!document.getElementById('pause-cafe-overlay')) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach(b => {
        b.y -= b.vy; b.wobble += 0.016; b.x += Math.sin(b.wobble) * 0.45;
        if (b.y < -b.r * 2) { b.y = canvas.height + b.r; b.x = Math.random() * canvas.width; }
        const g = ctx.createRadialGradient(b.x - b.r * .3, b.y - b.r * .3, b.r * .1, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(210,150,85,${b.op * 1.5})`);
        g.addColorStop(0.6, `rgba(120,60,18,${b.op})`);
        g.addColorStop(1, `rgba(50,15,3,${b.op * .4})`);
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      requestAnimationFrame(tick);
    };
    tick();
    const onResize = () => { if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; } };
    window.addEventListener('resize', onResize);
  },

  async _loadQuote() {
    const el = document.getElementById('cafe-quote');
    if (!el) return;
    const _gcCafe = groqConfig();
    try {
      if (!_gcCafe) throw new Error('no-proxy');
      const r = await fetch(_gcCafe.url, {
        method: 'POST',
        headers: _gcCafe.headers,
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'Génère une courte citation motivante et humoristique pour un artisan qui prend sa pause café. Max 2 lignes. En français. Donne uniquement la citation, sans guillemets ni explication.' }],
          max_tokens: 80, temperature: 1.1
        })
      });
      const d = await r.json();
      const q = d.choices?.[0]?.message?.content?.trim();
      if (q) {
        el.innerHTML = `<div class="cafe-quote-text">"${q}"</div><div class="cafe-quote-src">✨ via IA Groq</div>`;
        return;
      }
    } catch(e) {}
    const q = this.CITATIONS[Math.floor(Math.random() * this.CITATIONS.length)];
    el.innerHTML = `<div class="cafe-quote-text">"${q}"</div>`;
  },

  _loadStats() {
    const el = document.getElementById('cafe-stats');
    if (!el) return;
    const today = new Date().toISOString().slice(0, 10);
    const devis = (JSON.parse(localStorage.getItem('plaqpro_devis') || '[]'))
      .filter(d => (d.date || d.created_at || '').startsWith(today));
    const chantiers = (JSON.parse(localStorage.getItem('plaqpro_chantiers') || '[]'))
      .filter(c => /en.?cours/i.test(c.statut || ''));
    const ca = devis.reduce((s, d) => s + parseFloat(d.total_ttc || d.montant_ttc || d.montant || 0), 0);
    let msg = 'Continuez comme ça, vous assurez ! 👷';
    if (devis.length > 0) msg = `${devis.length} devis créé${devis.length > 1 ? 's' : ''} aujourd'hui — du bon boulot ! 🎉`;
    else if (chantiers.length > 2) msg = `${chantiers.length} chantiers actifs — vous êtes sur tous les fronts ! 💪`;
    else if (devis.length === 0 && chantiers.length === 0) msg = 'Journée calme — une pause bien méritée ! 😊';
    el.innerHTML = `
      <div class="cafe-stats-grid">
        <div class="cafe-stat"><div class="cafe-stat-val">${devis.length}</div><div class="cafe-stat-lbl">Devis du jour</div></div>
        <div class="cafe-stat"><div class="cafe-stat-val">${ca > 0 ? this._fmt(ca) : '—'}</div><div class="cafe-stat-lbl">CA potentiel</div></div>
        <div class="cafe-stat"><div class="cafe-stat-val">${chantiers.length}</div><div class="cafe-stat-lbl">Chantiers actifs</div></div>
      </div>
      <div class="cafe-stats-msg">${msg}</div>
    `;
  },

  _loadMeteo() {
    const el = document.getElementById('cafe-meteo');
    if (!el) return;
    if (typeof Meteo !== 'undefined' && Meteo._data?.daily) {
      const d = Meteo._data.daily;
      const maxT = d.temperature_2m_max?.[1];
      const minT = d.temperature_2m_min?.[1];
      const wcode = d.weathercode?.[1] ?? d.weather_code?.[1] ?? 0;
      if (maxT != null) {
        el.innerHTML = `<div class="cafe-meteo-inner">
          <div class="cafe-meteo-ico">${this._wxIcon(wcode)}</div>
          <div>
            <div class="cafe-meteo-temp">Demain : ${Math.round(minT)}–${Math.round(maxT)}°C</div>
            <div class="cafe-meteo-tip">${this._wxTip(wcode, maxT)}</div>
          </div>
        </div>`;
        return;
      }
    }
    el.innerHTML = `<div class="cafe-meteo-inner">
      <div class="cafe-meteo-ico">🌤️</div>
      <div class="cafe-meteo-tip">Vérifiez la météo avant vos travaux extérieurs de demain !</div>
    </div>`;
  },

  _wxIcon(c) {
    if (c === 0) return '☀️'; if (c <= 2) return '⛅'; if (c <= 3) return '☁️';
    if (c <= 48) return '🌫️'; if (c <= 67) return '🌧️'; if (c <= 77) return '❄️';
    if (c <= 82) return '🌦️'; return '⛈️';
  },

  _wxTip(c, t) {
    if (c === 0 && t > 12) return '☀️ Parfait pour les enduits et finitions extérieures !';
    if (c <= 2) return '⛅ Bonne journée pour travailler en extérieur.';
    if (c >= 61 && c <= 67) return '🌧️ Pluie prévue — privilégiez les travaux intérieurs.';
    if (c >= 71 && c <= 77) return '❄️ Risque de gel — reportez les enduits extérieurs.';
    return '☁️ Temps couvert — pensez à couvrir vos matériaux.';
  },

  _fmt(n) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  },

  _svgCup() {
    return `<svg class="cafe-svg" viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg">
      <path class="vp vp1" d="M42 38 C39 30 43 22 40 14" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2.5" stroke-linecap="round"/>
      <path class="vp vp2" d="M60 34 C57 26 61 18 58 10" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2.5" stroke-linecap="round"/>
      <path class="vp vp3" d="M78 38 C75 30 79 22 76 14" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="60" cy="110" rx="44" ry="9" fill="#5C3317"/>
      <ellipse cx="60" cy="108" rx="40" ry="7" fill="#7B4A1E"/>
      <path d="M28 58 L34 98 Q60 105 86 98 L92 58 Z" fill="#7B4A1E"/>
      <path d="M28 58 L34 98 Q60 105 86 98 L92 58 Z" fill="url(#cupg)"/>
      <ellipse cx="60" cy="58" rx="32" ry="9" fill="#2C0F03"/>
      <ellipse cx="60" cy="57" rx="29" ry="7.5" fill="#3D1A07"/>
      <ellipse cx="60" cy="56" rx="24" ry="5.5" fill="#C8893C" opacity=".65"/>
      <ellipse cx="54" cy="55" rx="9" ry="3.5" fill="#EDBE7A" opacity=".3"/>
      <path d="M91 68 C112 68 112 88 91 88" fill="none" stroke="#5C3317" stroke-width="8" stroke-linecap="round"/>
      <path d="M91 68 C109 68 109 88 91 88" fill="none" stroke="#8B5C2A" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="47" cy="74" rx="5" ry="11" fill="rgba(255,255,255,.07)" transform="rotate(-8 47 74)"/>
      <defs>
        <linearGradient id="cupg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,.13)"/>
          <stop offset="100%" style="stop-color:rgba(0,0,0,.18)"/>
        </linearGradient>
      </defs>
    </svg>`;
  },

  _injectStyles() {
    if (document.getElementById('pause-cafe-styles')) return;
    const s = document.createElement('style');
    s.id = 'pause-cafe-styles';
    s.textContent = `
      #pause-cafe-overlay {
        position:fixed; inset:0; z-index:99999;
        background:radial-gradient(ellipse at 50% 55%, #1e0e06 0%, #0d0603 55%, #090408 100%);
        display:flex; align-items:flex-start; justify-content:center;
        opacity:0; transition:opacity .42s ease; overflow-y:auto; padding:20px 0 44px;
      }
      #cafe-particles { position:fixed; inset:0; pointer-events:none; z-index:0; }
      .cafe-container {
        position:relative; z-index:1; max-width:500px; width:92%;
        display:flex; flex-direction:column; align-items:center; gap:18px;
        animation:cafeFadeUp .62s ease both;
      }
      @keyframes cafeFadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

      .cafe-svg {
        width:120px; height:120px;
        filter:drop-shadow(0 6px 30px rgba(139,69,19,.6));
        animation:cafeTilt 4.8s ease-in-out infinite; transform-origin:60px 110px;
      }
      @keyframes cafeTilt { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
      .vp { stroke-dasharray:9 5; }
      .vp1 { animation:vpRise 2.4s ease-in-out infinite; }
      .vp2 { animation:vpRise 2.4s ease-in-out infinite .75s; }
      .vp3 { animation:vpRise 2.4s ease-in-out infinite 1.5s; }
      @keyframes vpRise {
        0%   { opacity:0; stroke-dashoffset:22; }
        35%  { opacity:.9; }
        100% { opacity:0; stroke-dashoffset:-28; }
      }

      .cafe-title {
        font-size:2.1rem; font-weight:800; color:#F4C57A; margin:0;
        text-shadow:0 2px 22px rgba(244,197,122,.45); letter-spacing:.02em;
      }

      .cafe-quote {
        background:rgba(139,69,19,.18); border:1px solid rgba(244,197,122,.22);
        border-radius:14px; padding:16px 22px; text-align:center; width:100%;
        box-sizing:border-box;
      }
      .cafe-quote-text { color:#F4C57A; font-size:1.05rem; line-height:1.6; font-style:italic; font-weight:500; }
      .cafe-quote-src { color:rgba(244,197,122,.4); font-size:.72rem; margin-top:6px; }
      .cafe-quote-loading { color:rgba(244,197,122,.5); font-size:.9rem; animation:cafePulse 1.6s infinite; }
      @keyframes cafePulse { 0%,100%{opacity:.4} 50%{opacity:1} }

      .cafe-stats-wrap, .cafe-meteo-wrap, .cafe-music-card, .cafe-timer-card {
        background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
        border-radius:14px; padding:16px 18px; width:100%; box-sizing:border-box;
      }
      .cafe-stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:10px; }
      .cafe-stat { background:rgba(255,255,255,.055); border-radius:10px; padding:12px 6px; text-align:center; }
      .cafe-stat-val { font-size:1.35rem; font-weight:700; color:#F4C57A; }
      .cafe-stat-lbl { font-size:.66rem; color:rgba(255,255,255,.38); margin-top:3px; text-transform:uppercase; letter-spacing:.07em; }
      .cafe-stats-msg { text-align:center; color:rgba(255,255,255,.52); font-size:.84rem; }

      .cafe-meteo-inner { display:flex; align-items:center; gap:14px; }
      .cafe-meteo-ico { font-size:2.2rem; line-height:1; }
      .cafe-meteo-temp { color:#fff; font-weight:600; font-size:.95rem; }
      .cafe-meteo-tip { color:rgba(255,255,255,.5); font-size:.82rem; margin-top:4px; }

      .cafe-card-label {
        color:rgba(255,255,255,.55); font-size:.78rem; font-weight:700;
        text-transform:uppercase; letter-spacing:.09em; margin-bottom:12px;
      }
      .cafe-music-row { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
      #cafe-mute-btn {
        background:rgba(255,255,255,.1); border:none; border-radius:8px;
        width:38px; height:38px; font-size:1.1rem; cursor:pointer; color:#fff;
        transition:background .2s; flex-shrink:0;
      }
      #cafe-mute-btn:hover { background:rgba(255,255,255,.2); }
      #cafe-mute-hint { color:rgba(255,255,255,.38); font-size:.74rem; }
      .cafe-yt-wrap { border-radius:10px; overflow:hidden; }
      .cafe-yt-wrap iframe { width:100%; height:80px; border:none; display:block; }

      .cafe-timer-btns { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; }
      .cafe-timer-btn {
        padding:8px 22px; background:rgba(244,197,122,.1); border:1px solid rgba(244,197,122,.25);
        border-radius:8px; color:#F4C57A; cursor:pointer; font-size:.9rem; font-weight:600;
        transition:all .2s; font-family:inherit;
      }
      .cafe-timer-btn:hover, .cafe-timer-btn.active {
        background:rgba(244,197,122,.26); border-color:rgba(244,197,122,.7);
        box-shadow:0 0 14px rgba(244,197,122,.25);
      }
      #cafe-countdown { margin-top:18px; text-align:center; }
      #cafe-cdown {
        font-size:3.4rem; font-weight:800; color:#2DD4A0;
        font-variant-numeric:tabular-nums; letter-spacing:.04em; transition:color .5s; line-height:1;
      }
      .cafe-cdown-bar { background:rgba(255,255,255,.08); border-radius:4px; height:4px; margin-top:12px; overflow:hidden; }
      #cafe-cdown-fill { height:100%; background:linear-gradient(90deg,#F4C57A,#E8943A); transition:width 1s linear; width:0; }
      @keyframes cafeFlash { 0%,100%{opacity:1} 50%{opacity:0} }

      .cafe-back-btn {
        background:linear-gradient(135deg,#8B4513,#6B3A2A); border:1px solid rgba(244,197,122,.3);
        border-radius:12px; color:#F4C57A; padding:14px 42px; font-size:1rem; font-weight:700;
        cursor:pointer; transition:all .22s; letter-spacing:.04em;
        box-shadow:0 4px 22px rgba(100,40,10,.45); font-family:inherit;
      }
      .cafe-back-btn:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(139,69,19,.65); }

      .cafe-toast {
        position:fixed; bottom:80px; left:50%; transform:translateX(-50%) translateY(18px);
        background:linear-gradient(135deg,#7B4A1E,#5C3317); color:#F4C57A;
        padding:14px 30px; border-radius:12px; font-weight:600; font-size:.95rem;
        z-index:100002; opacity:0; transition:all .4s ease;
        box-shadow:0 4px 26px rgba(0,0,0,.55); white-space:nowrap;
      }
      .cafe-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
    `;
    document.head.appendChild(s);
  }
};

document.addEventListener('DOMContentLoaded', () => PauseCafe._injectStyles());
