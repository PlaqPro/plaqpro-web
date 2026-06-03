/**
 * PlaqPro+ — Historique des chiffrages sauvegardes
 * Lecture localStorage et rechargement simple vers DevisMulti.
 */

(function() {
  'use strict';

  var KEY_FALLBACK = 'plaqpro_chiffrages';

  function storageKey() {
    if (typeof DB !== 'undefined' && DB.KEYS && DB.KEYS.chiffrages) return DB.KEYS.chiffrages;
    return KEY_FALLBACK;
  }

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
      var raw = localStorage.getItem(storageKey()) || '[]';
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveAll(items) {
    localStorage.setItem(storageKey(), JSON.stringify(items));
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
      hour: '2-digit',
      minute: '2-digit',
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

  function corpsIcon(corpsId) {
    var icons = {
      plaquisterie: '🧱',
      peinture: '🎨',
      electricite: '⚡',
      plomberie: '🔧',
      maconnerie: '🏗',
      paysagisme: '🌿',
    };
    return icons[corpsId] || '🔧';
  }

  function buildBadges(corpsActifs) {
    var corps = Array.isArray(corpsActifs) ? corpsActifs : [];
    if (!corps.length) return '<span style="font-size:.8rem;color:var(--text-secondary,#666)">Aucun corps</span>';
    return corps.map(function(corpsId) {
      return '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;background:rgba(79,142,247,.12);color:var(--accent,#2563eb);font-size:.78rem;font-weight:700">' +
        esc(corpsIcon(corpsId) + ' ' + corpsLabel(corpsId)) +
      '</span>';
    }).join('');
  }

  function renderEmpty(container) {
    container.innerHTML =
      '<div class="card" style="padding:24px;text-align:center;color:var(--text-secondary,#666)">' +
        '<div style="font-weight:700;margin-bottom:6px">Aucun chiffrage sauvegardé</div>' +
      '</div>';
  }

  function renderCard(item) {
    var chantier = item.chantier || {};
    var resume = item.resume || {};
    var nom = chantier.nom || 'Sans nom';
    var id = item.id || '';
    return '<div class="card" data-hc-id="' + esc(id) + '" style="padding:16px;margin-bottom:12px">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px">' +
        '<div>' +
          '<div style="font-size:.78rem;color:var(--text-secondary,#666);margin-bottom:4px">' + esc(fmtDate(item.date)) + '</div>' +
          '<div style="font-size:1rem;font-weight:800;color:var(--text-primary,#111)">' + esc(nom) + '</div>' +
        '</div>' +
        '<div style="font-size:1.25rem;font-weight:900;color:#16a34a">' + esc(fmtPrix(resume.pvTotal)) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' + buildBadges(item.corpsActifs) + '</div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">' +
        '<button type="button" class="btn btn-secondary btn-sm" data-hc-action="delete" data-hc-id="' + esc(id) + '">Supprimer</button>' +
        '<button type="button" class="btn btn-primary btn-sm" data-hc-action="load" data-hc-id="' + esc(id) + '">Charger dans Devis</button>' +
      '</div>' +
    '</div>';
  }

  function buildStateFromChiffrage(item) {
    var state = (typeof DevisMulti !== 'undefined' && DevisMulti._newState)
      ? DevisMulti._newState()
      : { clientId: '', chantierId: '', objet: "Devis multi-corps d'etat", sections: [] };
    var chantier = item.chantier || {};
    var resume = item.resume || {};
    var pieces = Array.isArray(item.pieces) ? item.pieces : [];
    var corpsActifs = Array.isArray(item.corpsActifs) ? item.corpsActifs : [];
    var totalQte = pieces.reduce(function(sum, piece) {
      return sum + (parseFloat(piece.surface || piece.nbPoints || 0) || 0);
    }, 0);
    var prixMoyen = totalQte > 0 ? Math.round((Number(resume.pvTotal) || 0) / totalQte) : 0;

    state.clientId = chantier.clientId || '';
    state.chantierId = chantier.chantierId || '';
    state.objet = 'Chiffrage ' + (chantier.nom || 'sans nom');

    corpsActifs.forEach(function(corpsId) {
      var lignes = pieces.filter(function(piece) { return piece.corps === corpsId; });
      if (!lignes.length) return;
      var sec = {
        sid: 'hc_' + corpsId + '_' + Date.now(),
        key: corpsId,
        icon: corpsIcon(corpsId),
        titre: corpsLabel(corpsId),
        tva: 10,
        lignes: [],
      };
      lignes.forEach(function(piece, index) {
        var qte = parseFloat(piece.surface || piece.nbPoints || 0) || 0;
        if (!qte) return;
        sec.lignes.push({
          lid: 'hc_l_' + corpsId + '_' + index + '_' + Date.now(),
          id: 'hc_l_' + corpsId + '_' + index + '_' + Date.now(),
          ref: '',
          designation: piece.nom || corpsLabel(corpsId),
          unite: (corpsId === 'electricite' || corpsId === 'plomberie') ? 'u' : 'm²',
          qte: qte,
          prix: prixMoyen,
        });
      });
      if (sec.lignes.length) state.sections.push(sec);
    });

    return state;
  }

  function deleteItem(id, containerId) {
    saveAll(getAll().filter(function(item) { return String(item.id || '') !== String(id); }));
    if (typeof App !== 'undefined' && App.toast) App.toast('Chiffrage supprimé', 'success');
    window.HistoriqueChiffrages.render(containerId);
  }

  function loadItem(id) {
    var item = getAll().find(function(chiffrage) { return String(chiffrage.id || '') === String(id); });
    if (!item) {
      if (typeof App !== 'undefined' && App.toast) App.toast('Chiffrage introuvable', 'error');
      return;
    }
    if (typeof DevisMulti === 'undefined') {
      if (typeof App !== 'undefined' && App.toast) App.toast('Module DevisMulti indisponible', 'error');
      return;
    }
    DevisMulti._state = buildStateFromChiffrage(item);
    if (typeof App !== 'undefined' && App.navigate) App.navigate('devis_complet');
  }

  window.HistoriqueChiffrages = {
    render: function(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;
      var items = getAll();
      if (!items.length) {
        renderEmpty(container);
        return;
      }
      var exportBar = '<div style="display:flex;gap:8px;margin-bottom:16px">'
        + '<button onclick="ChiffragesExport.exportCSV()" style="padding:8px 16px;border-radius:8px;background:var(--accent,#4f8ef7);color:#fff;border:none;cursor:pointer">⬇ Export CSV</button>'
        + '<button onclick="ChiffragesExport.exportJSON()" style="padding:8px 16px;border-radius:8px;background:var(--accent,#4f8ef7);color:#fff;border:none;cursor:pointer">⬇ Export JSON</button>'
        + '</div>';
      container.innerHTML = exportBar + items.map(renderCard).join('');
      container.querySelectorAll('[data-hc-action]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var action = btn.getAttribute('data-hc-action');
          var id = btn.getAttribute('data-hc-id');
          if (action === 'delete') deleteItem(id, containerId);
          if (action === 'load') loadItem(id);
        });
      });
    },
  };
})();
