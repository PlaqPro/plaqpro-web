/**
 * PlaqPro+ — Dashboard chiffrages sauvegardes
 * Synthese localStorage pour tuiles et top chantiers.
 */

(function() {
  'use strict';

  var STORAGE_KEY = 'plaqpro_chiffrages';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getAll() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function fmtPrix(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function fmtPct(value) {
    return String(Math.round((Number(value) || 0) * 10) / 10).replace('.', ',') + ' %';
  }

  function card(label, value) {
    return '<div style="background:var(--card-bg,var(--bg-card,#fff));border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:16px;color:var(--text,#111)">' +
      '<div style="font-size:.78rem;color:var(--text-secondary,#777);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">' + esc(label) + '</div>' +
      '<div style="font-size:1.45rem;font-weight:900;color:var(--accent,#4f8ef7)">' + esc(value) + '</div>' +
    '</div>';
  }

  function topRows(items) {
    var top = items.slice().sort(function(a, b) {
      return (Number((b.resume || {}).pvTotal) || 0) - (Number((a.resume || {}).pvTotal) || 0);
    }).slice(0, 3);

    return top.map(function(item, index) {
      var chantier = item.chantier || {};
      var resume = item.resume || {};
      return '<div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--border,#e5e7eb)">' +
        '<span style="color:var(--text,#111);font-weight:700">' + esc((index + 1) + '. ' + (chantier.nom || 'Sans nom')) + '</span>' +
        '<span style="color:var(--accent,#4f8ef7);font-weight:900;white-space:nowrap">' + esc(fmtPrix(resume.pvTotal)) + '</span>' +
      '</div>';
    }).join('');
  }

  window.DashboardChiffrages = {
    render: function(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;

      var items = getAll();
      if (!items.length) {
        container.innerHTML = '<div style="background:var(--card-bg,var(--bg-card,#fff));color:var(--text,#111);border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:20px">Aucune donnée</div>';
        return;
      }

      var caTotal = items.reduce(function(sum, item) {
        return sum + (Number((item.resume || {}).pvTotal) || 0);
      }, 0);
      var gainTotal = items.reduce(function(sum, item) {
        return sum + (Number((item.resume || {}).gainTotal) || 0);
      }, 0);
      var margePct = caTotal > 0 ? (gainTotal / caTotal) * 100 : 0;

      container.innerHTML =
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:18px">' +
          card('Nb chiffrages', String(items.length)) +
          card('CA total', fmtPrix(caTotal)) +
          card('Gain total', fmtPrix(gainTotal)) +
          card('Marge', fmtPct(margePct)) +
        '</div>' +
        '<div style="background:var(--card-bg,var(--bg-card,#fff));border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:16px;color:var(--text,#111)">' +
          '<h3 style="margin:0 0 10px;font-size:1rem;color:var(--text,#111)">Top 3 chantiers</h3>' +
          topRows(items) +
        '</div>';
    },
  };
})();
