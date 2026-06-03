(function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function nombre(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function fmtQte(value) {
    return String(Math.round(nombre(value) * 100) / 100).replace('.', ',');
  }

  function fmtPrix(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(nombre(value));
  }

  function agregerMateriaux(lignes) {
    var map = {};

    (lignes || []).forEach(function (ligne) {
      (ligne.materiaux || []).forEach(function (materiau) {
        var code = materiau.codeMat || '';
        var unite = materiau.unite || '';
        var key = code + '|' + unite;
        if (!map[key]) {
          map[key] = {
            code: code,
            designation: materiau.designation || code,
            qte: 0,
            unite: unite,
            totalAchat: 0,
          };
        }
        map[key].qte += nombre(materiau.qte);
        map[key].totalAchat += nombre(materiau.totalAchat);
      });
    });

    return Object.keys(map).map(function (key) {
      return map[key];
    });
  }

  function renderLignes(lignes) {
    if (!lignes.length) {
      return '<p style="margin:0;color:#6b7280">Aucune ligne chiffrage.</p>';
    }

    return '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
      '<thead><tr>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #d1d5db">Corps</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #d1d5db">Pièce</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #d1d5db">Ouvrage</th>' +
        '<th style="text-align:right;padding:8px;border-bottom:1px solid #d1d5db">Qté</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #d1d5db">Unité</th>' +
        '<th style="text-align:right;padding:8px;border-bottom:1px solid #d1d5db">Cout mat</th>' +
        '<th style="text-align:right;padding:8px;border-bottom:1px solid #d1d5db">Cout MO</th>' +
        '<th style="text-align:right;padding:8px;border-bottom:1px solid #d1d5db">Prix vente</th>' +
      '</tr></thead><tbody>' +
      lignes.map(function (ligne) {
        return '<tr>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb">' + esc(ligne.corpsLabel || ligne.corps) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb">' + esc(ligne.piece) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb">' + esc(ligne.ouvrageCode) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">' + esc(fmtQte(ligne.qte)) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb">' + esc(ligne.unite) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">' + esc(fmtPrix(ligne.coutMat)) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">' + esc(fmtPrix(ligne.coutMO)) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">' + esc(fmtPrix(ligne.prixVente)) + '</td>' +
        '</tr>';
      }).join('') +
      '</tbody></table>';
  }

  function renderMateriaux(materiaux) {
    if (!materiaux.length) {
      return '<p style="margin:0;color:#6b7280">Aucun matériau agrégé.</p>';
    }

    return '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
      '<thead><tr>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #d1d5db">Code</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #d1d5db">Désignation</th>' +
        '<th style="text-align:right;padding:8px;border-bottom:1px solid #d1d5db">Qté</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid #d1d5db">Unité</th>' +
        '<th style="text-align:right;padding:8px;border-bottom:1px solid #d1d5db">Total achat</th>' +
      '</tr></thead><tbody>' +
      materiaux.map(function (materiau) {
        return '<tr>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb">' + esc(materiau.code) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb">' + esc(materiau.designation) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">' + esc(fmtQte(materiau.qte)) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb">' + esc(materiau.unite) + '</td>' +
          '<td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">' + esc(fmtPrix(materiau.totalAchat)) + '</td>' +
        '</tr>';
      }).join('') +
      '</tbody></table>';
  }

  function renderTotaux(totaux) {
    return '<div style="display:grid;grid-template-columns:repeat(4,minmax(140px,1fr));gap:10px">' +
      '<div style="padding:10px;border:1px solid #d1d5db;border-radius:8px"><strong>Cout mat total</strong><br>' + esc(fmtPrix(totaux.coutMat)) + '</div>' +
      '<div style="padding:10px;border:1px solid #d1d5db;border-radius:8px"><strong>Cout MO total</strong><br>' + esc(fmtPrix(totaux.coutMO)) + '</div>' +
      '<div style="padding:10px;border:1px solid #d1d5db;border-radius:8px"><strong>Prix vente total</strong><br>' + esc(fmtPrix(totaux.prixVente)) + '</div>' +
      '<div style="padding:10px;border:1px solid #d1d5db;border-radius:8px"><strong>Gain total</strong><br>' + esc(fmtPrix(totaux.gain)) + '</div>' +
    '</div>';
  }

  function fermerModale(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  function afficherModale(lignes, materiaux, totaux) {
    var overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(17,24,39,.72);display:flex;align-items:center;justify-content:center;padding:18px';
    overlay.innerHTML =
      '<div style="width:min(1180px,100%);max-height:92vh;overflow:auto;background:#fff;color:#111827;border-radius:10px;box-shadow:0 24px 80px rgba(0,0,0,.35)">' +
        '<div style="position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:#fff;border-bottom:1px solid #e5e7eb">' +
          '<h2 style="margin:0;font-size:18px">Debug Calcul Express V2</h2>' +
          '<button type="button" data-ced-close style="padding:8px 14px;border-radius:8px;border:1px solid #d1d5db;background:#111827;color:#fff;cursor:pointer">Fermer</button>' +
        '</div>' +
        '<div style="padding:16px;display:grid;gap:18px">' +
          '<section><h3 style="margin:0 0 10px;font-size:15px">Lignes chiffrage</h3>' + renderLignes(lignes) + '</section>' +
          '<section><h3 style="margin:0 0 10px;font-size:15px">Matériaux agrégés</h3>' + renderMateriaux(materiaux) + '</section>' +
          '<section><h3 style="margin:0 0 10px;font-size:15px">Totaux</h3>' + renderTotaux(totaux) + '</section>' +
        '</div>' +
      '</div>';

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay || event.target.getAttribute('data-ced-close') !== null) {
        fermerModale(overlay);
      }
    });

    document.body.appendChild(overlay);
  }

  function dump(pieces, corpsActifs, corpsConfig) {
    if (location.hostname === 'plaqproplus.fr') return;
    if (typeof CalcExpressStructure === 'undefined' || !CalcExpressStructure.buildLignes) return;

    var lignes = CalcExpressStructure.buildLignes(pieces, corpsActifs, corpsConfig) || [];
    var materiaux = agregerMateriaux(lignes);
    var totaux = CalcExpressStructure.totaux
      ? CalcExpressStructure.totaux(lignes)
      : { coutMat: 0, coutMO: 0, prixVente: 0, gain: 0 };

    afficherModale(lignes, materiaux, totaux);
  }

  window.CalcExpressDebug = {
    dump: dump,
  };
})();
