/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Graphiques dashboard (Chart.js)
//  graphiques.js
// ============================================================

var Graphiques = {

  _chartCA:      null,
  _chartStatuts: null,

  // ── Données : CA mensuel 6 mois ───────────────────────────
  _dataCA() {
    const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const now  = new Date();
    const mois = [];
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      mois.push({ y: d.getFullYear(), m: d.getMonth() });
      labels.push(MOIS[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2));
    }

    // Factures payées en priorité, sinon devis acceptés
    const factures = DB.factures.filter(f => f.statut === 'Payée');
    const source   = factures.length ? factures : DB.devis.filter(d => d.statut === 'Accepté');
    const amtKey   = factures.length ? 'totalTTC' : 'totalHT';
    const isFallback = !factures.length;

    const values = mois.map(({ y, m }) =>
      source
        .filter(x => { const d = new Date((x.date || x.createdAt || '').split('T')[0]); return d.getFullYear() === y && d.getMonth() === m; })
        .reduce((s, x) => s + (x[amtKey] || 0), 0)
    );

    // Si rien du tout, mettre des zéros pour afficher un graphe vide
    return { labels, values, isFallback };
  },

  // ── Données : chantiers par statut ────────────────────────
  _dataStatuts() {
    const all = DB.chantiers;
    const ORDER = ['En cours', 'En attente', 'Terminé'];
    const COLORS = {
      'En cours':   '#4F8EF7',
      'En attente': '#F7A64F',
      'Terminé':    '#2DD4A0',
    };
    const result = ORDER
      .map(s => ({ label: s, value: all.filter(c => c.statut === s).length, color: COLORS[s] }))
      .filter(x => x.value > 0);

    // Regrouper les statuts inconnus
    const autres = all.filter(c => !ORDER.includes(c.statut)).length;
    if (autres > 0) result.push({ label: 'Autre', value: autres, color: '#A78BFA' });

    return result;
  },

  // ── Section DOM avec deux cards ───────────────────────────
  renderSection() {
    const { isFallback } = this._dataCA();
    const statuts = this._dataStatuts();

    const section = document.createElement('div');
    section.id = 'graphiques-section';
    section.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px';

    // Card barre CA
    const card1 = document.createElement('div');
    card1.className = 'card';
    card1.innerHTML = `
      <div class="card-header">
        <span class="card-title">📊 CA 6 derniers mois ${isFallback ? '<span style="font-size:11px;font-weight:400;color:var(--text-tertiary)">(devis acceptés)</span>' : '<span style="font-size:11px;font-weight:400;color:var(--text-tertiary)">(factures payées)</span>'}</span>
      </div>
      <div class="card-body" style="padding-bottom:14px;position:relative;height:220px">
        <canvas id="chart-ca"></canvas>
      </div>
    `;

    // Card donut statuts
    const card2 = document.createElement('div');
    card2.className = 'card';

    if (statuts.length === 0) {
      card2.innerHTML = `
        <div class="card-header"><span class="card-title">🥧 Chantiers par statut</span></div>
        <div class="card-body" style="display:flex;align-items:center;justify-content:center;height:220px">
          <span style="color:var(--text-tertiary);font-size:13px">Aucun chantier</span>
        </div>
      `;
    } else {
      // Légende inline pour replacer celle de Chart.js
      const legendHTML = statuts.map(s => `
        <div style="display:flex;align-items:center;gap:6px">
          <span style="width:10px;height:10px;border-radius:50%;background:${s.color};flex-shrink:0"></span>
          <span style="font-size:12px;color:var(--text-secondary)">${s.label}</span>
          <span style="font-size:12px;font-weight:700;color:var(--text-primary);margin-left:2px">${s.value}</span>
        </div>`).join('');

      card2.innerHTML = `
        <div class="card-header"><span class="card-title">🥧 Chantiers par statut</span></div>
        <div class="card-body" style="display:flex;align-items:center;justify-content:center;gap:24px;height:220px;padding:16px">
          <div style="position:relative;height:180px;width:180px;flex-shrink:0">
            <canvas id="chart-statuts"></canvas>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none">
              <div style="font-size:26px;font-weight:800;color:var(--text-primary)">${statuts.reduce((s,x) => s+x.value, 0)}</div>
              <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em">total</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">${legendHTML}</div>
        </div>
      `;
    }

    section.appendChild(card1);
    section.appendChild(card2);
    return section;
  },

  // ── Initialiser Chart.js ──────────────────────────────────
  initCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('[Graphiques] Chart.js non disponible');
      return;
    }
    if (this._chartCA)      { this._chartCA.destroy();      this._chartCA = null; }
    if (this._chartStatuts) { this._chartStatuts.destroy(); this._chartStatuts = null; }

    Chart.defaults.color       = '#8892AA';
    Chart.defaults.font.family = "'Outfit', -apple-system, sans-serif";
    Chart.defaults.font.size   = 12;

    this._buildCA();
    this._buildStatuts();
  },

  _buildCA() {
    const ctx = document.getElementById('chart-ca');
    if (!ctx) return;
    const { labels, values } = this._dataCA();

    // Dégradé bleu accent
    const cctx = ctx.getContext('2d');
    const grad = cctx.createLinearGradient(0, 0, 0, 180);
    grad.addColorStop(0, 'rgba(79,142,247,0.75)');
    grad.addColorStop(1, 'rgba(79,142,247,0.08)');

    // Mettre en valeur le mois courant
    const bgColors = values.map((_, i) => i === labels.length - 1 ? '#4F8EF7' : 'rgba(79,142,247,0.45)');

    this._chartCA = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'CA (€)',
          data: values,
          backgroundColor: bgColors,
          borderColor:     values.map((_, i) => i === labels.length - 1 ? '#6BA3FF' : 'rgba(79,142,247,0.6)'),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(18,21,32,0.97)',
            borderColor:     'rgba(79,142,247,0.3)',
            borderWidth: 1,
            padding: 10,
            titleColor: '#F0F2F8',
            bodyColor:  '#8892AA',
            callbacks: {
              label: c => '  ' + new Intl.NumberFormat('fr-FR', { style:'currency', currency:'EUR', maximumFractionDigits: 0 }).format(c.parsed.y),
            },
          },
        },
        scales: {
          x: {
            grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { color: '#6870A0', font: { size: 11 } },
          },
          y: {
            grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: {
              color: '#6870A0',
              font:  { size: 11 },
              callback: v => v === 0 ? '0 €' : (v >= 1000 ? Math.round(v/1000) + 'k €' : v + ' €'),
            },
            beginAtZero: true,
          },
        },
      },
    });
  },

  _buildStatuts() {
    const ctx = document.getElementById('chart-statuts');
    if (!ctx) return;
    const statuts = this._dataStatuts();
    if (!statuts.length) return;

    this._chartStatuts = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels:   statuts.map(s => s.label),
        datasets: [{
          data:            statuts.map(s => s.value),
          backgroundColor: statuts.map(s => s.color),
          borderColor:     'rgba(13,15,20,0.85)',
          borderWidth: 3,
          hoverOffset: 10,
          hoverBorderColor: 'rgba(255,255,255,0.1)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        animation: { duration: 700, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(18,21,32,0.97)',
            borderColor:     'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
            titleColor: '#F0F2F8',
            bodyColor:  '#8892AA',
            callbacks: {
              label: c => `  ${c.label} : ${c.parsed} chantier${c.parsed > 1 ? 's' : ''}`,
            },
          },
        },
      },
    });
  },
};

