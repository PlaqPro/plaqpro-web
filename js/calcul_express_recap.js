/**
 * PlaqPro+ — Recapitulatif chiffrage sauvegarde
 * Affichage HTML imprimable depuis localStorage.
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
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function corpsLabel(corpsId) {
    var labels = {
      plaquisterie: 'Platrerie',
      peinture: 'Peinture',
      electricite: 'Electricite',
      plomberie: 'Plomberie',
      maconnerie: 'Maconnerie',
      paysagisme: 'Paysagisme',
    };
    return labels[corpsId] || corpsId || 'Corps';
  }

  function piecesParCorps(chiffrage, corpsId) {
    return (Array.isArray(chiffrage.pieces) ? chiffrage.pieces : [])
      .filter(function(piece) { return piece && piece.corps === corpsId; })
      .map(function(piece) { return piece.nom || 'Piece'; });
  }

  function prixCorps(chiffrage, corpsId) {
    var resume = chiffrage.resume || {};
    var data = Array.isArray(resume.corpsData) ? resume.corpsData : [];
    var found = data.find(function(row) {
      return row && row.corps && row.corps.id === corpsId;
    });
    if (found) return (Number(found.coutCorps) || 0) + (Number(found.gainCorps) || 0);
    var corps = Array.isArray(chiffrage.corpsActifs) ? chiffrage.corpsActifs : [];
    return corps.length ? (Number(resume.pvTotal) || 0) / corps.length : 0;
  }

  function rowsHtml(chiffrage) {
    var corps = Array.isArray(chiffrage.corpsActifs) ? chiffrage.corpsActifs : [];
    if (!corps.length) {
      return '<tr><td colspan="3" style="text-align:center;color:var(--text-secondary,#777)">Aucun corps</td></tr>';
    }
    return corps.map(function(corpsId) {
      var pieces = piecesParCorps(chiffrage, corpsId);
      return '<tr>' +
        '<td>' + esc(corpsLabel(corpsId)) + '</td>' +
        '<td>' + esc(pieces.length ? pieces.join(', ') : 'Aucune piece') + '</td>' +
        '<td style="text-align:right;font-weight:700">' + esc(fmtPrix(prixCorps(chiffrage, corpsId))) + '</td>' +
      '</tr>';
    }).join('');
  }

  function renderEmpty(container) {
    container.innerHTML = '<div style="padding:24px;border-radius:8px;background:var(--card-bg,var(--bg-card,#fff));color:var(--text,#111)">Aucun chiffrage sauvegarde</div>';
  }

  window.CalcExpressRecap = {
    afficherRecap: function(containerId, chiffrageId) {
      var container = document.getElementById(containerId);
      if (!container) {
        // Fallback : chercher le vrai container de l'app
        container = document.getElementById('content') ||
                    document.getElementById('main-content') ||
                    document.querySelector('.content') ||
                    document.body;
      }
      if (!container) return document.createTextNode('');
      var all = getAll();
      if (!all.length) {
        renderEmpty(container);
        return document.createTextNode('');
      }
      var chiffrage = chiffrageId
        ? all.find(function(item) { return String(item.id || '') === String(chiffrageId); })
        : all[0];
      if (!chiffrage) {
        renderEmpty(container);
        return document.createTextNode('');
      }

      var chantier = chiffrage.chantier || {};
      var resume = chiffrage.resume || {};
      container.innerHTML =
        '<style>@media print{.cex-recap-actions{display:none!important}.cex-recap{box-shadow:none!important;border:none!important}}</style>' +
        '<div class="cex-recap" style="background:var(--card-bg,var(--bg-card,#fff));color:var(--text,#111);border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:20px">' +
          '<div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:20px">' +
            '<div><div style="font-size:.8rem;color:var(--text-secondary,#777);margin-bottom:4px">Chiffrage PlaqPro+</div>' +
            '<h2 style="margin:0;font-size:1.35rem">' + esc(chantier.nom || 'Sans nom') + '</h2></div>' +
            '<div style="text-align:right;color:var(--text-secondary,#777);font-size:.9rem">' + esc(fmtDate(chiffrage.date)) + '</div>' +
          '</div>' +
          '<table style="width:100%;border-collapse:collapse;margin-bottom:18px">' +
            '<thead><tr>' +
              '<th style="text-align:left;padding:10px;border-bottom:1px solid var(--border,#e5e7eb);color:var(--accent,#4f8ef7)">Corps</th>' +
              '<th style="text-align:left;padding:10px;border-bottom:1px solid var(--border,#e5e7eb);color:var(--accent,#4f8ef7)">Pieces</th>' +
              '<th style="text-align:right;padding:10px;border-bottom:1px solid var(--border,#e5e7eb);color:var(--accent,#4f8ef7)">Prix</th>' +
            '</tr></thead>' +
            '<tbody>' + rowsHtml(chiffrage) + '</tbody>' +
          '</table>' +
          '<div style="display:flex;justify-content:flex-end;margin-bottom:18px">' +
            '<div style="min-width:280px;border:1px solid var(--border,#e5e7eb);border-radius:8px;overflow:hidden">' +
              '<div style="display:flex;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--border,#e5e7eb)"><span>Total HT</span><strong>' + esc(fmtPrix(resume.pvTotal)) + '</strong></div>' +
              '<div style="display:flex;justify-content:space-between;padding:10px 12px"><span>Gain estime</span><strong style="color:#16a34a">' + esc(fmtPrix(resume.gainTotal)) + '</strong></div>' +
            '</div>' +
          '</div>' +
          '<div class="cex-recap-actions" style="display:flex;gap:8px;justify-content:flex-end">' +
            '<button type="button" onclick="window.print()" style="padding:8px 16px;border-radius:8px;background:var(--accent,#4f8ef7);color:#fff;border:none;cursor:pointer">Imprimer</button>' +
            '<button type="button" onclick="history.back()" style="padding:8px 16px;border-radius:8px;background:transparent;color:var(--text,#111);border:1px solid var(--border,#e5e7eb);cursor:pointer">Retour</button>' +
          '</div>' +
        '</div>';
      return document.createTextNode('');
    },
  };
})();
