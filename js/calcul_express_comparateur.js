/**
 * PlaqPro+ — Comparateur de chiffrages sauvegardes
 * Comparaison cote a cote depuis localStorage.
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

  function fmtDate(value) {
    if (!value) return 'Date inconnue';
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date inconnue';
    return date.toLocaleDateString('fr-FR');
  }

  function fmtPct(value) {
    return String(Math.round((Number(value) || 0) * 10) / 10).replace('.', ',') + ' %';
  }

  function chantierNom(chiffrage) {
    return (chiffrage.chantier && chiffrage.chantier.nom) || 'Sans nom';
  }

  function corpsActifs(chiffrage) {
    var corps = Array.isArray(chiffrage.corpsActifs) ? chiffrage.corpsActifs : [];
    return corps.length ? corps.join(', ') : 'Aucun';
  }

  function resumeValue(chiffrage, key) {
    return Number((chiffrage.resume || {})[key]) || 0;
  }

  function margePct(chiffrage) {
    var pv = resumeValue(chiffrage, 'pvTotal');
    var gain = resumeValue(chiffrage, 'gainTotal');
    return pv > 0 ? (gain / pv) * 100 : 0;
  }

  function optionLabel(chiffrage) {
    return (chiffrage.id || 'sans-id') + ' — ' + chantierNom(chiffrage) + ' — ' + fmtDate(chiffrage.date);
  }

  function optionsHtml(items, selectedId) {
    return items.map(function(item) {
      var id = String(item.id || '');
      var selected = id === String(selectedId || '') ? ' selected' : '';
      return '<option value="' + esc(id) + '"' + selected + '>' + esc(optionLabel(item)) + '</option>';
    }).join('');
  }

  function cell(value, highlight) {
    var style = highlight ? 'color:#16a34a;font-weight:900' : 'color:var(--text,#111);font-weight:700';
    return '<td style="padding:10px;border-bottom:1px solid var(--border,#e5e7eb);' + style + '">' + esc(value) + '</td>';
  }

  function row(label, valueA, valueB, highlightA, highlightB) {
    return '<tr>' +
      '<td style="padding:10px;border-bottom:1px solid var(--border,#e5e7eb);color:var(--text-secondary,#777);font-weight:700">' + esc(label) + '</td>' +
      cell(valueA, highlightA) +
      cell(valueB, highlightB) +
    '</tr>';
  }

  function buildTable(a, b) {
    var coutA = resumeValue(a, 'coutTotal');
    var coutB = resumeValue(b, 'coutTotal');
    var pvA = resumeValue(a, 'pvTotal');
    var pvB = resumeValue(b, 'pvTotal');
    var gainA = resumeValue(a, 'gainTotal');
    var gainB = resumeValue(b, 'gainTotal');
    var margeA = margePct(a);
    var margeB = margePct(b);

    return '<table style="width:100%;border-collapse:collapse;margin-top:16px;background:var(--card-bg,var(--bg-card,#fff));color:var(--text,#111)">' +
      '<thead><tr>' +
        '<th style="text-align:left;padding:10px;border-bottom:2px solid var(--accent,#4f8ef7);color:var(--accent,#4f8ef7)">Critere</th>' +
        '<th style="text-align:left;padding:10px;border-bottom:2px solid var(--accent,#4f8ef7);color:var(--accent,#4f8ef7)">Chiffrage A</th>' +
        '<th style="text-align:left;padding:10px;border-bottom:2px solid var(--accent,#4f8ef7);color:var(--accent,#4f8ef7)">Chiffrage B</th>' +
      '</tr></thead><tbody>' +
        row('Nom chantier', chantierNom(a), chantierNom(b), false, false) +
        row('Corps actifs', corpsActifs(a), corpsActifs(b), false, false) +
        row('Cout total HT', fmtPrix(coutA), fmtPrix(coutB), false, false) +
        row('Prix vente HT', fmtPrix(pvA), fmtPrix(pvB), false, false) +
        row('Gain estime', fmtPrix(gainA), fmtPrix(gainB), gainA > gainB, gainB > gainA) +
        row('Marge %', fmtPct(margeA), fmtPct(margeB), margeA > margeB, margeB > margeA) +
      '</tbody></table>';
  }

  function renderMessage(container, message) {
    container.innerHTML = '<div style="background:var(--card-bg,var(--bg-card,#fff));color:var(--text,#111);border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:20px">' + esc(message) + '</div>';
  }

  window.CalcExpressComparateur = {
    render: function(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;

      var items = getAll();
      if (items.length < 2) {
        renderMessage(container, 'Ajoutez au moins 2 chiffrages pour comparer');
        return;
      }

      var firstId = String(items[0].id || '');
      var secondId = String(items[1].id || '');
      container.innerHTML =
        '<div style="background:var(--card-bg,var(--bg-card,#fff));color:var(--text,#111);border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:16px">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end">' +
            '<label style="display:flex;flex-direction:column;gap:6px;font-size:.85rem;color:var(--text-secondary,#777)">Chiffrage A' +
              '<select id="' + esc(containerId) + '-a" style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);background:transparent;color:var(--text,#111)">' + optionsHtml(items, firstId) + '</select>' +
            '</label>' +
            '<label style="display:flex;flex-direction:column;gap:6px;font-size:.85rem;color:var(--text-secondary,#777)">Chiffrage B' +
              '<select id="' + esc(containerId) + '-b" style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);background:transparent;color:var(--text,#111)">' + optionsHtml(items, secondId) + '</select>' +
            '</label>' +
            '<button type="button" id="' + esc(containerId) + '-btn" style="padding:10px 16px;border-radius:8px;background:var(--accent,#4f8ef7);color:#fff;border:none;cursor:pointer;font-weight:700">Comparer</button>' +
          '</div>' +
          '<div id="' + esc(containerId) + '-result"></div>' +
        '</div>';

      document.getElementById(containerId + '-btn').addEventListener('click', function() {
        var idA = document.getElementById(containerId + '-a').value;
        var idB = document.getElementById(containerId + '-b').value;
        var a = items.find(function(item) { return String(item.id || '') === String(idA); });
        var b = items.find(function(item) { return String(item.id || '') === String(idB); });
        var result = document.getElementById(containerId + '-result');
        if (!a || !b) {
          result.innerHTML = '<div style="margin-top:14px;color:#ef4444;font-weight:700">Chiffrage introuvable</div>';
          return;
        }
        result.innerHTML = buildTable(a, b);
      });
    },
  };
})();
