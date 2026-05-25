/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
/* mode_chantier.js — Vue mobile simplifiée pour utilisation sur chantier */

const ChantierMobile = {

  /* ── Rendu principal ─────────────────────────────────────── */
  render() {
    const el = document.createElement('div');
    el.style.cssText = 'padding:12px;max-width:480px;margin:0 auto';

    const session = (() => { try { return JSON.parse(sessionStorage.getItem('plaqpro_session') || '{}'); } catch(e) { return {}; } })();
    const nom = session.nom || session.user || 'Bonjour';

    el.innerHTML = `
      <!-- Header mobile -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <div>
          <div style="font-size:18px;font-weight:700;color:var(--text-primary)">Mode Chantier</div>
          <div style="font-size:13px;color:var(--text-tertiary)">Bonjour ${this._esc(nom)} 👋</div>
        </div>
        <button onclick="ChantierMobile.switchToDesktop()"
          style="font-size:11px;padding:6px 12px;background:var(--bg-secondary);border:1px solid var(--border);
                 border-radius:var(--radius-md);color:var(--text-secondary);cursor:pointer;white-space:nowrap">
          → Version complète
        </button>
      </div>

      <!-- 4 grandes tuiles d'action -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px" id="mc-tiles"></div>

      <!-- Calculateur rapide inline -->
      <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);
                  padding:16px;margin-bottom:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:12px">⚡ Calculateur rapide</div>
        <div style="display:flex;gap:6px;margin-bottom:12px" id="mc-calc-tabs">
          <button class="mc-tab active" data-tab="surface" onclick="ChantierMobile.setTab('surface')"
            style="flex:1;padding:7px;font-size:12px;border-radius:var(--radius-sm);border:1px solid var(--accent);
                   background:rgba(79,142,247,0.15);color:var(--accent);cursor:pointer;font-weight:600">Surface</button>
          <button class="mc-tab" data-tab="materiaux" onclick="ChantierMobile.setTab('materiaux')"
            style="flex:1;padding:7px;font-size:12px;border-radius:var(--radius-sm);border:1px solid var(--border);
                   background:var(--bg-tertiary);color:var(--text-secondary);cursor:pointer">Matériaux</button>
          <button class="mc-tab" data-tab="heures" onclick="ChantierMobile.setTab('heures')"
            style="flex:1;padding:7px;font-size:12px;border-radius:var(--radius-sm);border:1px solid var(--border);
                   background:var(--bg-tertiary);color:var(--text-secondary);cursor:pointer">Heures</button>
        </div>
        <div id="mc-calc-content"></div>
      </div>

      <!-- Chantiers récents -->
      <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="font-size:13px;font-weight:700;color:var(--text-primary)">📋 Chantiers récents</div>
          <button onclick="App.navigate('chantiers')"
            style="font-size:11px;color:var(--accent);background:none;border:none;cursor:pointer;padding:0">Voir tout →</button>
        </div>
        <div id="mc-recent"></div>
      </div>
    `;

    return el;
  },

  /* ── Post-render init ────────────────────────────────────── */
  init() {
    this._renderTiles();
    this.setTab('surface');
    this._renderRecent();
  },

  /* ── Tuiles d'action ─────────────────────────────────────── */
  _renderTiles() {
    const tiles = [
      { icon: '⚡', label: 'Calcul Express', color: '#4F8EF7', bg: 'rgba(79,142,247,0.12)', action: "App.navigate('calculateur')" },
      { icon: '🏗', label: 'Chantiers',      color: '#2DD4A0', bg: 'rgba(45,212,160,0.12)', action: "App.navigate('chantiers')" },
      { icon: '📄', label: 'Devis',          color: '#FF9B32', bg: 'rgba(255,155,50,0.12)', action: "App.navigate('devis')" },
      { icon: '📐', label: 'Métrés',         color: '#C084FC', bg: 'rgba(192,132,252,0.12)', action: "App.navigate('metrages')" },
    ];
    const wrap = document.getElementById('mc-tiles');
    if (!wrap) return;
    wrap.innerHTML = tiles.map(t => `
      <button onclick="${t.action}"
        style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
               min-height:88px;padding:16px 8px;background:${t.bg};border:1px solid ${t.color}33;
               border-radius:var(--radius-md);cursor:pointer;transition:transform .1s;width:100%"
        ontouchstart="this.style.transform='scale(0.96)'" ontouchend="this.style.transform=''">
        <span style="font-size:28px">${t.icon}</span>
        <span style="font-size:13px;font-weight:700;color:${t.color}">${t.label}</span>
      </button>`).join('');
  },

  /* ── Onglets calculateur ─────────────────────────────────── */
  setTab(tab) {
    document.querySelectorAll('.mc-tab').forEach(btn => {
      const active = btn.dataset.tab === tab;
      btn.style.background = active ? 'rgba(79,142,247,0.15)' : 'var(--bg-tertiary)';
      btn.style.borderColor = active ? 'var(--accent)' : 'var(--border)';
      btn.style.color = active ? 'var(--accent)' : 'var(--text-secondary)';
      btn.style.fontWeight = active ? '600' : '400';
    });
    const c = document.getElementById('mc-calc-content');
    if (!c) return;
    if (tab === 'surface')   c.innerHTML = this._tabSurface();
    if (tab === 'materiaux') c.innerHTML = this._tabMateriaux();
    if (tab === 'heures')    c.innerHTML = this._tabHeures();
  },

  _tabSurface() {
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div>
          <label style="font-size:11px;color:var(--text-tertiary)">Longueur (m)</label>
          <input id="mc-lon" type="number" step="0.1" placeholder="0.00"
            class="form-control" oninput="ChantierMobile.calcSurface()" style="font-size:15px;padding:8px">
        </div>
        <div>
          <label style="font-size:11px;color:var(--text-tertiary)">Hauteur (m)</label>
          <input id="mc-hau" type="number" step="0.1" placeholder="0.00"
            class="form-control" oninput="ChantierMobile.calcSurface()" style="font-size:15px;padding:8px">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div>
          <label style="font-size:11px;color:var(--text-tertiary)">Nombre de faces</label>
          <input id="mc-fac" type="number" value="2" min="1" max="4"
            class="form-control" oninput="ChantierMobile.calcSurface()" style="font-size:15px;padding:8px">
        </div>
        <div>
          <label style="font-size:11px;color:var(--text-tertiary)">Déductions (m²)</label>
          <input id="mc-ded" type="number" step="0.1" placeholder="0.00"
            class="form-control" oninput="ChantierMobile.calcSurface()" style="font-size:15px;padding:8px">
        </div>
      </div>
      <div id="mc-surf-result" style="padding:10px 14px;background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.2);
           border-radius:var(--radius-sm);font-size:15px;font-weight:700;color:var(--accent);text-align:center">
        — m²
      </div>`;
  },

  _tabMateriaux() {
    return `
      <div style="margin-bottom:8px">
        <label style="font-size:11px;color:var(--text-tertiary)">Surface à couvrir (m²)</label>
        <input id="mc-mat-surf" type="number" step="0.1" placeholder="0.00"
          class="form-control" oninput="ChantierMobile.calcMateriaux()" style="font-size:15px;padding:8px">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div>
          <label style="font-size:11px;color:var(--text-tertiary)">Larg. plaque (m)</label>
          <input id="mc-mat-larg" type="number" step="0.1" value="1.2"
            class="form-control" oninput="ChantierMobile.calcMateriaux()" style="font-size:15px;padding:8px">
        </div>
        <div>
          <label style="font-size:11px;color:var(--text-tertiary)">Haut. plaque (m)</label>
          <input id="mc-mat-haut" type="number" step="0.1" value="2.5"
            class="form-control" oninput="ChantierMobile.calcMateriaux()" style="font-size:15px;padding:8px">
        </div>
      </div>
      <div id="mc-mat-result" style="padding:10px 14px;background:rgba(45,212,160,0.08);border:1px solid rgba(45,212,160,0.2);
           border-radius:var(--radius-sm);font-size:15px;font-weight:700;color:#2DD4A0;text-align:center">
        — plaques nécessaires
      </div>`;
  },

  _tabHeures() {
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div>
          <label style="font-size:11px;color:var(--text-tertiary)">Surface (m²)</label>
          <input id="mc-h-surf" type="number" step="0.1" placeholder="0.00"
            class="form-control" oninput="ChantierMobile.calcHeures()" style="font-size:15px;padding:8px">
        </div>
        <div>
          <label style="font-size:11px;color:var(--text-tertiary)">Rendement (m²/h)</label>
          <input id="mc-h-rend" type="number" step="0.1" value="5"
            class="form-control" oninput="ChantierMobile.calcHeures()" style="font-size:15px;padding:8px">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div>
          <label style="font-size:11px;color:var(--text-tertiary)">Nbre ouvriers</label>
          <input id="mc-h-ouv" type="number" value="1" min="1"
            class="form-control" oninput="ChantierMobile.calcHeures()" style="font-size:15px;padding:8px">
        </div>
        <div>
          <label style="font-size:11px;color:var(--text-tertiary)">Taux horaire (€/h)</label>
          <input id="mc-h-taux" type="number" step="0.5" value="45"
            class="form-control" oninput="ChantierMobile.calcHeures()" style="font-size:15px;padding:8px">
        </div>
      </div>
      <div id="mc-h-result" style="padding:10px 14px;background:rgba(192,132,252,0.08);border:1px solid rgba(192,132,252,0.2);
           border-radius:var(--radius-sm);font-size:14px;font-weight:700;color:#C084FC;text-align:center">
        — h &nbsp;·&nbsp; — €
      </div>`;
  },

  /* ── Calculs ─────────────────────────────────────────────── */
  calcSurface() {
    const l = parseFloat(document.getElementById('mc-lon')?.value) || 0;
    const h = parseFloat(document.getElementById('mc-hau')?.value) || 0;
    const f = parseFloat(document.getElementById('mc-fac')?.value) || 1;
    const d = parseFloat(document.getElementById('mc-ded')?.value) || 0;
    const s = Math.max(0, l * h * f - d);
    const r = document.getElementById('mc-surf-result');
    if (r) r.textContent = s > 0 ? s.toFixed(2) + ' m²' : '— m²';
  },

  calcMateriaux() {
    const surf = parseFloat(document.getElementById('mc-mat-surf')?.value) || 0;
    const larg = parseFloat(document.getElementById('mc-mat-larg')?.value) || 1.2;
    const haut = parseFloat(document.getElementById('mc-mat-haut')?.value) || 2.5;
    const airePlaque = larg * haut;
    const nb = surf > 0 && airePlaque > 0 ? Math.ceil(surf / airePlaque * 1.1) : 0;
    const r = document.getElementById('mc-mat-result');
    if (r) r.textContent = nb > 0 ? nb + ' plaques nécessaires (+10% chutes)' : '— plaques nécessaires';
  },

  calcHeures() {
    const surf  = parseFloat(document.getElementById('mc-h-surf')?.value) || 0;
    const rend  = parseFloat(document.getElementById('mc-h-rend')?.value) || 5;
    const ouv   = parseFloat(document.getElementById('mc-h-ouv')?.value) || 1;
    const taux  = parseFloat(document.getElementById('mc-h-taux')?.value) || 45;
    const heures = surf > 0 && rend > 0 ? surf / rend : 0;
    const cout  = heures * ouv * taux;
    const r = document.getElementById('mc-h-result');
    if (r) {
      r.textContent = heures > 0
        ? heures.toFixed(1) + ' h  ·  ' + new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(cout) + ' €'
        : '— h  ·  — €';
    }
  },

  /* ── Chantiers récents ───────────────────────────────────── */
  _renderRecent() {
    const wrap = document.getElementById('mc-recent');
    if (!wrap) return;
    const chantiers = (DB.getAll(DB.KEYS.chantiers) || [])
      .sort((a, b) => new Date(b.creeLe || 0) - new Date(a.creeLe || 0))
      .slice(0, 5);

    if (!chantiers.length) {
      wrap.innerHTML = '<div style="font-size:13px;color:var(--text-tertiary)">Aucun chantier enregistré.</div>';
      return;
    }

    wrap.innerHTML = chantiers.map(c => `
      <div onclick="App.navigate('chantiers',{id:${c.id}})"
        style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;
               background:var(--bg-tertiary);border-radius:var(--radius-sm);margin-bottom:6px;
               cursor:pointer;border:1px solid var(--border)">
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${this._esc(c.nom || c.adresse || 'Chantier')}</div>
          <div style="font-size:11px;color:var(--text-tertiary)">${c.statut || 'En cours'}</div>
        </div>
        <span style="color:var(--text-tertiary);font-size:16px">›</span>
      </div>`).join('');
  },

  /* ── Basculer en version complète ───────────────────────── */
  switchToDesktop() {
    sessionStorage.setItem('plaqpro_force_desktop', '1');
    App.navigate('dashboard');
  },

  _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },
};

/* ── Page entry-point ────────────────────────────────────────── */
if (typeof Pages !== 'undefined') {
  Pages.chantier_mobile = function() {
    const el = ChantierMobile.render();
    requestAnimationFrame(() => ChantierMobile.init());
    return el;
  };
}
