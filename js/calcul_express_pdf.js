/**
 * PlaqPro+ — PDF imprimable Calcul Express
 * Generation HTML print depuis un chiffrage sauvegarde.
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

  function toast(message, type) {
    if (typeof App !== 'undefined' && App.toast) App.toast(message, type || 'warning');
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

  function prixParCorps(chiffrage, corpsId) {
    var resume = chiffrage.resume || {};
    var corpsData = Array.isArray(resume.corpsData) ? resume.corpsData : [];
    var found = corpsData.find(function(row) {
      return row && row.corps && row.corps.id === corpsId;
    });
    if (found) return (Number(found.coutCorps) || 0) + (Number(found.gainCorps) || 0);
    var corpsActifs = Array.isArray(chiffrage.corpsActifs) ? chiffrage.corpsActifs : [];
    return corpsActifs.length ? (Number(resume.pvTotal) || 0) / corpsActifs.length : 0;
  }

  function piecesParCorps(chiffrage, corpsId) {
    var pieces = Array.isArray(chiffrage.pieces) ? chiffrage.pieces : [];
    return pieces
      .filter(function(piece) { return piece && piece.corps === corpsId; })
      .map(function(piece) { return piece.nom || 'Piece'; });
  }

  function buildRows(chiffrage) {
    var corpsActifs = Array.isArray(chiffrage.corpsActifs) ? chiffrage.corpsActifs : [];
    if (!corpsActifs.length) {
      return '<tr><td colspan="3" class="empty">Aucun corps de metier</td></tr>';
    }
    return corpsActifs.map(function(corpsId) {
      var pieces = piecesParCorps(chiffrage, corpsId);
      return '<tr>' +
        '<td>' + esc(corpsLabel(corpsId)) + '</td>' +
        '<td>' + esc(pieces.length ? pieces.join(', ') : 'Aucune piece') + '</td>' +
        '<td class="num">' + esc(fmtPrix(prixParCorps(chiffrage, corpsId))) + '</td>' +
      '</tr>';
    }).join('');
  }

  function buildHtml(chiffrage) {
    var chantier = chiffrage.chantier || {};
    var resume = chiffrage.resume || {};
    var coutTotal = Number(resume.coutTotal) || 0;
    var gainTotal = Number(resume.gainTotal) || 0;
    var pvTotal = Number(resume.pvTotal) || 0;
    var margePct = pvTotal > 0 ? Math.round((gainTotal / pvTotal) * 1000) / 10 : 0;

    return '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
      '<title>Chiffrage PlaqPro+</title>' +
      '<style>' +
        'body{font-family:Arial,sans-serif;color:#111827;margin:32px;background:#fff}' +
        '.head{display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid #2563eb;padding-bottom:18px;margin-bottom:24px}' +
        '.brand{font-size:28px;font-weight:900;color:#2563eb}' +
        '.meta{text-align:right;color:#4b5563;font-size:13px;line-height:1.5}' +
        'h1{font-size:22px;margin:0 0 4px;color:#111827}' +
        'table{width:100%;border-collapse:collapse;margin:20px 0 24px}' +
        'th{background:#eff6ff;color:#1d4ed8;text-align:left;padding:10px;border:1px solid #bfdbfe;font-size:13px;text-transform:uppercase}' +
        'td{padding:11px 10px;border:1px solid #e5e7eb;vertical-align:top;font-size:14px}' +
        '.num{text-align:right;font-weight:700;white-space:nowrap}' +
        '.empty{text-align:center;color:#6b7280}' +
        '.totals{margin-left:auto;width:320px;border:1px solid #d1d5db;border-radius:8px;overflow:hidden}' +
        '.total-row{display:flex;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #e5e7eb}' +
        '.total-row:last-child{border-bottom:none;background:#ecfdf5;color:#047857;font-weight:900}' +
        '.footer{margin-top:40px;padding-top:14px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;text-align:center}' +
        '.actions{margin-top:20px;text-align:right}' +
        '.print-btn{padding:9px 16px;border:0;border-radius:8px;background:#2563eb;color:#fff;font-weight:700;cursor:pointer}' +
        '@media print{body{margin:18mm}.actions{display:none!important}.head{break-inside:avoid}.totals{break-inside:avoid}}' +
      '</style></head><body>' +
        '<div class="head">' +
          '<div><div class="brand">PlaqPro+</div><h1>' + esc(chantier.nom || 'Sans nom') + '</h1></div>' +
          '<div class="meta">Date : ' + esc(fmtDate(chiffrage.date)) + '<br>Reference : ' + esc(chiffrage.id || '') + '</div>' +
        '</div>' +
        '<table><thead><tr><th>Corps</th><th>Pieces</th><th>Prix vente HT</th></tr></thead><tbody>' + buildRows(chiffrage) + '</tbody></table>' +
        '<div class="totals">' +
          '<div class="total-row"><span>Total HT</span><strong>' + esc(fmtPrix(pvTotal)) + '</strong></div>' +
          '<div class="total-row"><span>Cout direct</span><strong>' + esc(fmtPrix(coutTotal)) + '</strong></div>' +
          '<div class="total-row"><span>Gain estime</span><strong>' + esc(fmtPrix(gainTotal)) + '</strong></div>' +
          '<div class="total-row"><span>Marge</span><strong>' + esc(String(margePct).replace('.', ',') + ' %') + '</strong></div>' +
        '</div>' +
        '<div class="actions"><button class="print-btn" onclick="window.print()">Imprimer</button></div>' +
        '<div class="footer">Document généré par PlaqPro+</div>' +
      '</body></html>';
  }

  window.CalcExpressPdf = {
    genererPDF: function(chiffrageId) {
      var chiffrage = getAll().find(function(item) {
        return String(item.id || '') === String(chiffrageId || '');
      });
      if (!chiffrage) {
        toast('Chiffrage introuvable', 'error');
        return;
      }
      var win = window.open('', '_blank');
      if (!win) {
        toast('Fenetre impression bloquee', 'error');
        return;
      }
      win.document.open();
      win.document.write(buildHtml(chiffrage));
      win.document.close();
      win.focus();
      setTimeout(function() { win.print(); }, 250);
    },
  };
})();
