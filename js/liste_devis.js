/**
 * PlaqPro+ — Liste des devis sauvegardes
 * js/liste_devis.js
 */

(function() {
  'use strict';

  var fmtEuro = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });

  var STATUTS = {
    Brouillon: { bg: '#e5e7eb', color: '#374151' },
    Valide:   { bg: '#dcfce7', color: '#166534' },
    Validé:   { bg: '#dcfce7', color: '#166534' },
    Facture:  { bg: '#dbeafe', color: '#1d4ed8' },
    Facturé:  { bg: '#dbeafe', color: '#1d4ed8' },
    Annule:   { bg: '#fee2e2', color: '#991b1b' },
    Annulé:   { bg: '#fee2e2', color: '#991b1b' }
  };

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value) {
    if (!value) return '-';
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) return esc(value);
    return d.toLocaleDateString('fr-FR');
  }

  function badgeStatut(statut) {
    var s = statut || 'Brouillon';
    var colors = STATUTS[s] || STATUTS.Brouillon;
    return '<span style="display:inline-flex;align-items:center;padding:4px 9px;border-radius:999px;'
      + 'font-size:12px;font-weight:700;background:' + colors.bg + ';color:' + colors.color + '">'
      + esc(s) + '</span>';
  }

  function getClientNom(devis) {
    if (!devis || !devis.clientId || typeof DB === 'undefined' || !DB.getClient) return 'Client non renseigné';
    var client = DB.getClient(parseInt(devis.clientId));
    return client ? (client.nom || client.raisonSociale || 'Client sans nom') : 'Client introuvable';
  }

  function getChantierNom(devis) {
    if (!devis || !devis.chantierId || typeof DB === 'undefined' || !DB.getChantier) return 'Chantier non renseigné';
    var chantier = DB.getChantier(parseInt(devis.chantierId));
    return chantier ? (chantier.nom || 'Chantier sans nom') : 'Chantier introuvable';
  }

  function supprimerDevis(id) {
    if (typeof DB !== 'undefined' && typeof DB.deleteDevis === 'function') {
      DB.deleteDevis(id);
      return;
    }
    if (typeof DB !== 'undefined' && typeof DB.delete === 'function' && DB.KEYS && DB.KEYS.devis) {
      DB.delete(DB.KEYS.devis, id);
      return;
    }
    var key = (typeof DB !== 'undefined' && DB.KEYS && DB.KEYS.devis) ? DB.KEYS.devis : 'plaqpro_devis';
    var liste = JSON.parse(localStorage.getItem(key) || '[]').filter(function(d) {
      return d.id !== id;
    });
    localStorage.setItem(key, JSON.stringify(liste));
  }

  function styles() {
    return '<style id="liste-devis-styles">'
      + '.ld-wrap{padding:24px;max-width:1200px;margin:0 auto;color:var(--text)}'
      + '.ld-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:18px;flex-wrap:wrap}'
      + '.ld-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}'
      + '.ld-tab{padding:8px 13px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text);cursor:pointer;font-weight:650}'
      + '.ld-tab.active{background:var(--accent,#4f8ef7);border-color:var(--accent,#4f8ef7);color:#fff}'
      + '.ld-new{padding:9px 15px;border:0;border-radius:8px;background:var(--accent,#4f8ef7);color:#fff;cursor:pointer;font-weight:750}'
      + '.ld-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px}'
      + '.ld-card{background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:16px;color:var(--text)}'
      + '.ld-title{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px}'
      + '.ld-num{font-weight:800;font-size:17px}.ld-obj{font-size:13px;color:var(--text-secondary,#6b7280);margin-top:3px}'
      + '.ld-meta{font-size:13px;color:var(--text-secondary,#6b7280);line-height:1.55;margin:10px 0}'
      + '.ld-total{font-size:20px;font-weight:850;margin:10px 0;color:var(--accent,#4f8ef7)}'
      + '.ld-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}'
      + '.ld-btn{padding:8px 10px;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text);cursor:pointer;font-weight:650}'
      + '.ld-btn.primary{background:var(--accent,#4f8ef7);border-color:var(--accent,#4f8ef7);color:#fff}'
      + '.ld-btn.danger{border-color:#fecaca;color:#b91c1c}'
      + '.ld-empty{background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:26px;text-align:center;color:var(--text-secondary,#6b7280)}'
      + '@media(max-width:640px){.ld-wrap{padding:14px}.ld-card{padding:14px}.ld-actions .ld-btn{flex:1 1 calc(50% - 8px)}}'
      + '</style>';
  }

  window.ListeDevis = {
    _containerId: null,
    _filtre: 'Tous',

    render: function(containerId) {
      this._containerId = containerId;
      var container = document.getElementById(containerId);
      if (!container) {
        // Fallback : chercher le vrai container de l'app
        container = document.getElementById('content') ||
                    document.getElementById('main-content') ||
                    document.querySelector('.content') ||
                    document.body;
      }
      if (!container) return document.createTextNode('');

      var devis = [];
      if (typeof DevisMulti !== 'undefined' && typeof DevisMulti.lister === 'function') {
        devis = DevisMulti.lister() || [];
      }

      var filtres = ['Tous', 'Brouillon', 'Validé', 'Facturé'];
      var filtre = this._filtre || 'Tous';
      var visibles = filtre === 'Tous' ? devis : devis.filter(function(d) {
        return (d.statut || 'Brouillon') === filtre;
      });

      container.innerHTML = styles()
        + '<div class="ld-wrap">'
        + '<div class="ld-head">'
        + '<h2 style="margin:0;font-size:24px">Devis enregistrés</h2>'
        + '<button class="ld-new" onclick="App.navigate(\'devis_complet\')">+ Nouveau devis</button>'
        + '</div>'
        + '<div class="ld-tabs">'
        + filtres.map(function(f) {
          return '<button class="ld-tab ' + (f === filtre ? 'active' : '') + '" onclick="ListeDevis.filtrer(\'' + f + '\')">' + f + '</button>';
        }).join('')
        + '</div>'
        + (!devis.length
          ? '<div class="ld-empty">Aucun devis enregistré</div>'
          : (!visibles.length
            ? '<div class="ld-empty">Aucun devis pour ce statut</div>'
            : '<div class="ld-grid">' + visibles.map(this._cardHtml).join('') + '</div>'))
        + '</div>';
      return document.createTextNode('');
    },

    filtrer: function(statut) {
      this._filtre = statut || 'Tous';
      this.render(this._containerId);
    },

    _cardHtml: function(devis) {
      var id = parseInt(devis.id);
      return '<article class="ld-card">'
        + '<div class="ld-title">'
        + '<div><div class="ld-num">' + esc(devis.numero || ('Devis #' + id)) + '</div>'
        + '<div class="ld-obj">' + esc(devis.objet || 'Sans objet') + '</div></div>'
        + badgeStatut(devis.statut)
        + '</div>'
        + '<div class="ld-meta">'
        + '<div><strong>Client :</strong> ' + esc(getClientNom(devis)) + '</div>'
        + '<div><strong>Chantier :</strong> ' + esc(getChantierNom(devis)) + '</div>'
        + '<div><strong>Date :</strong> ' + formatDate(devis.date || devis.createdAt) + '</div>'
        + '</div>'
        + '<div class="ld-total">' + fmtEuro.format(parseFloat(devis.totalHT) || 0) + ' HT</div>'
        + '<div class="ld-actions">'
        + '<button class="ld-btn primary" onclick="ListeDevis.modifier(' + id + ')">✏️ Modifier</button>'
        + '<button class="ld-btn" onclick="ListeDevis.imprimer(' + id + ')">🖨 Imprimer</button>'
        + '<button class="ld-btn" onclick="ListeDevis.valider(' + id + ')">✅ Valider</button>'
        + '<button class="ld-btn danger" onclick="ListeDevis.supprimer(' + id + ')">🗑 Supprimer</button>'
        + '</div>'
        + '</article>';
    },

    modifier: function(id) {
      if (typeof DevisMulti !== 'undefined' && DevisMulti.charger(id)) {
        App.navigate('devis_complet');
      } else if (typeof App !== 'undefined' && App.toast) {
        App.toast('Devis introuvable', 'error');
      }
    },

    imprimer: function(id) {
      if (typeof DevisMulti !== 'undefined' && DevisMulti.charger(id)) {
        window.print();
      } else if (typeof App !== 'undefined' && App.toast) {
        App.toast('Devis introuvable', 'error');
      }
    },

    valider: function(id) {
      if (typeof DevisMulti !== 'undefined' && DevisMulti.mettreAJourStatut(id, 'Validé')) {
        this.render(this._containerId);
      } else if (typeof App !== 'undefined' && App.toast) {
        App.toast('Impossible de valider le devis', 'error');
      }
    },

    supprimer: function(id) {
      if (!confirm('Supprimer ce devis ?')) return;
      supprimerDevis(id);
      this.render(this._containerId);
    }
  };
})();
