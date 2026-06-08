/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Devis Multi-Corps d'État
//  js/devis_multi.js
// ============================================================

var DevisMulti = {

  _state: null,
  _uidCounter: 0,
  _dropResults: {},   // sid -> tableau résultats recherche

  // ── Types de corps ────────────────────────────────────────
  TYPES: [
    { key: 'cloisons',    icon: '🧱', label: 'Cloisons',    tva: 10 },
    { key: 'plafond',     icon: '⬜', label: 'Plafond',     tva: 10 },
    { key: 'peinture',    icon: '🎨', label: 'Peinture',    tva: 10 },
    { key: 'electricite', icon: '⚡', label: 'Électricité', tva: 10 },
    { key: 'plomberie',   icon: '🔧', label: 'Plomberie',   tva: 10 },
    { key: 'carrelage',   icon: '🏠', label: 'Carrelage',   tva: 10 },
    { key: 'sol',         icon: '🟫', label: 'Sol',         tva: 10 },
    { key: 'demolition',  icon: '🔨', label: 'Démolition',  tva: 10 },
    { key: 'autre',       icon: '📋', label: 'Autre',       tva: 10 },
  ],

  // ── Helpers ───────────────────────────────────────────────
  _uid: function() {
    return 'dm_' + (++DevisMulti._uidCounter) + '_' + (Date.now() % 100000);
  },

  _esc: function(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  },

  _fmt: function(n) {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
  },

  _tvaValue: function(value, fallback) {
    var parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  },

  _isHeaderLine: function(l) {
    return !!(l && (l._header || l.isHeader || l.type === 'header'));
  },

  _isZeroAmountLine: function(l) {
    return ((parseFloat(l && l.qte) || parseFloat(l && l.quantite) || 0) === 0)
      && ((parseFloat(l && l.prix) || parseFloat(l && l.prixHT) || 0) === 0)
      && ((parseFloat(l && l.totalHT) || 0) === 0);
  },

  _normLabel: function(value) {
    return String(value || '').replace(/[^\wÀ-ÿ]+/g, ' ').trim().toLowerCase();
  },

  _isZeroNoiseLine: function(l, sec) {
    if (!l) return false;
    var totalHT = ((parseFloat(l && l.qte) || 0) * (parseFloat(l && l.prix) || 0));
    if (totalHT > 0) return false;
    var designation = DevisMulti._normLabel(l.designation || '');
    var titre = DevisMulti._normLabel(sec && sec.titre || '');
    var unite = DevisMulti._normLabel(l.unite || '');
    if (designation.indexOf('preparation chantier exterieur') !== -1 || designation.indexOf('préparation chantier extérieur') !== -1) return true;
    if (designation.indexOf('protection chantier') !== -1) return true;
    if (designation === 'paysagisme' && titre === 'paysagisme') return true;
    return !!titre && designation === titre && (!unite || unite === 'forfait' || unite === 'ff' || unite === 'u');
  },

  _lignesFacturables: function(sec) {
    return (sec && sec.lignes || []).filter(function(l) {
      return !DevisMulti._isHeaderLine(l) && !DevisMulti._isZeroNoiseLine(l, sec);
    });
  },

  _normalizeId: function(value) {
    var n = parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  },

  _newState: function() {
    return { clientId: '', chantierId: '', objet: "Devis multi-corps d'état", sections: [] };
  },

  // ── Page principale ───────────────────────────────────────
  render: function() {
    DevisMulti._injectStyles();
    if (!DevisMulti._state) DevisMulti._state = DevisMulti._newState();
    var wrap = document.createElement('div');
    wrap.id = 'dm-wrap';
    wrap.className = 'dm-wrap';
    wrap.innerHTML = DevisMulti._buildHTML();
    return wrap;
  },

  _buildHTML: function() {
    var clients   = DB.clients   || [];
    var chantiers = DB.chantiers || [];
    var state     = DevisMulti._state;

    var optCli = '<option value="">— Client —</option>'
      + clients.map(function(c) {
          var sel = (String(c.id) === String(state.clientId)) ? ' selected' : '';
          return '<option value="' + c.id + '"' + sel + '>' + DevisMulti._esc(c.nom || c.raisonSociale || '') + '</option>';
        }).join('');

    var filteredCha = state.clientId
      ? chantiers.filter(function(c) { return String(c.clientId) === String(state.clientId); })
      : chantiers;
    var optCha = '<option value="">— Chantier —</option>'
      + filteredCha.map(function(c) {
          var sel = (String(c.id) === String(state.chantierId)) ? ' selected' : '';
          return '<option value="' + c.id + '"' + sel + '>' + DevisMulti._esc(c.nom || c.adresse || '') + '</option>';
        }).join('');

    return ''
      // Hero
      + '<div class="dm-hero">'
      + '<div class="dm-hero-inner">'
      + '<div class="dm-hero-badge">📋 Multi-corps d\'état</div>'
      + '<h1 class="dm-hero-title">Devis Complet</h1>'
      + '<p class="dm-hero-sub">Structurez votre devis par corps de métier. Recherchez dans la base produits, ajoutez des articles libres, récapitulatif automatique.</p>'
      + '</div>'
      + '</div>'
      + '<div id="dm-alertes-regles" style="margin-bottom:16px">' + DevisMulti._alertesRegles() + '</div>'
      + '<div id="dm-recap-metrages" style="display:none"></div>'
      + '<div id="dm-ia-zone" style="margin-bottom:16px">'
      + '<div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px">'
      + '<div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:8px">🤖 Assistant IA — Analyse des travaux</div>'
      + '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">Décrivez les travaux en langage naturel — l\'IA génère le devis avec matériaux et quantités</div>'
      + '<textarea id="dm-ia-descriptif" class="form-control" rows="3" style="font-size:13px;margin-bottom:10px" placeholder="Ex: doublage sur mur existant, 3 cloisons de 3m×2.50, mise en peinture murs et plafond, revêtement sol vinyl rouleau, 2 fenêtres 120×120 et une porte 220×90 fourniture..."></textarea>'
      + '<div style="display:flex;gap:8px;align-items:center">'
      + '<button class="btn btn-primary" onclick="DevisMulti._analyserIA()" id="dm-ia-btn">🤖 Analyser et générer le devis</button>'
      + '<span id="dm-ia-status" style="font-size:12px;color:var(--text-tertiary)"></span>'
      + '</div>'
      + '<div id="dm-ia-resultat" style="margin-top:12px"></div>'
      + '</div>'
      + '</div>'
      // Barre en-tête
      + '<div class="dm-header-bar">'
      + '<div class="dm-header-row">'
      + '<div class="dm-header-field">'
      + '<label class="dm-label">Client</label>'
      + '<div style="display:flex;gap:6px;align-items:center">'
      + '<select class="form-control dm-sel" id="dm-sel-client" onchange="DevisMulti._onClientChange(this.value)" style="flex:1">' + optCli + '</select>'
      + '<button class="btn btn-secondary btn-sm" onclick="DevisMulti._nouveauClient()" title="Nouveau client">+</button>'
      + '</div>'
      + '</div>'
      + '<div class="dm-header-field">'
      + '<label class="dm-label">Chantier</label>'
      + '<div style="display:flex;gap:6px;align-items:center">'
      + '<select class="form-control dm-sel" id="dm-sel-chantier" onchange="DevisMulti._onChantierChange(this.value)" style="flex:1">' + optCha + '</select>'
      + '<button class="btn btn-secondary btn-sm" onclick="DevisMulti._nouveauChantier()" title="Nouveau chantier">+</button>'
      + '</div>'
      + '</div>'
      + '<div class="dm-header-field dm-header-objet">'
      + '<label class="dm-label">Objet</label>'
      + '<input class="form-control" id="dm-objet" value="' + DevisMulti._esc(state.objet) + '" oninput="DevisMulti._state.objet=this.value" placeholder="Objet du devis…">'
      + '</div>'
      + '</div>'
      + '<div class="dm-header-actions">'
      + '<button class="btn btn-secondary btn-sm" onclick="DevisMulti._nouveau()" title="Nouveau devis vide">🗑 Nouveau</button>'
      + '<button class="btn btn-secondary btn-sm" onclick="DevisMulti.imprimer()">🖨 Imprimer A4</button>'
      + '<button class="btn btn-secondary btn-sm" onclick="DevisMulti.exporterExcel()">📊 Excel</button>'
      + '<button class="btn btn-primary" onclick="DevisMulti.enregistrer()">💾 Enregistrer le devis</button>'
      + '</div>'
      + '</div>'
      // Grille principale
      + '<div class="dm-layout">'
      + '<div class="dm-sections-col" id="dm-sections-col">' + DevisMulti._buildSectionsHTML() + '</div>'
      + '<div class="dm-recap-col"><div id="dm-recap">' + DevisMulti._buildRecapHTML() + '</div></div>'
      + '</div>';
  },

  _onClientChange: function(clientId) {
    DevisMulti._state.clientId = DevisMulti._normalizeId(clientId) || '';
    DevisMulti._state.chantierId = '';
    var chantiers = DB.chantiers || [];
    var filtered  = DevisMulti._state.clientId
      ? chantiers.filter(function(c) { return String(c.clientId) === String(DevisMulti._state.clientId); })
      : chantiers;
    var html = '<option value="">— Chantier —</option>'
      + filtered.map(function(c) {
          return '<option value="' + c.id + '">' + DevisMulti._esc(c.nom || c.adresse || '') + '</option>';
        }).join('');
    var sel = document.getElementById('dm-sel-chantier');
    if (sel) sel.innerHTML = html;
  },

  _nouveauClient: function() {
    App.modalForm({
      titre: 'Nouveau client',
      champs: [
        { id: 'nom',   label: 'Nom *',       type: 'text',  required: true },
        { id: 'tel',   label: 'Téléphone',   type: 'tel' },
        { id: 'email', label: 'Email',        type: 'email' },
      ],
      onConfirm: function(vals) {
        if (!vals.nom) { App.toast('Le nom est obligatoire', 'error'); return false; }
        var client = DB.addClient({ nom: vals.nom, telephone: vals.tel || '', email: vals.email || '', statut: 'Actif' });
        DevisMulti._state.clientId = DevisMulti._normalizeId(client.id) || '';
        var wrap = document.getElementById('dm-wrap');
        if (wrap) { wrap.innerHTML = DevisMulti._buildHTML(); DevisMulti._bindEvents(); }
        App.toast('Client ' + vals.nom + ' créé ✅', 'success');
      }
    });
  },

  _nouveauChantier: function() {
    if (!DevisMulti._state.clientId) { App.toast('Sélectionnez d\'abord un client', 'warning'); return; }
    App.modalForm({
      titre: 'Nouveau chantier',
      champs: [
        { id: 'nom',     label: 'Nom du chantier *', type: 'text', required: true },
        { id: 'adresse', label: 'Adresse',            type: 'text' },
      ],
      onConfirm: function(vals) {
        if (!vals.nom) { App.toast('Le nom est obligatoire', 'error'); return false; }
        var chantier = DB.addChantier({
          clientId: DevisMulti._normalizeId(DevisMulti._state.clientId),
          nom: vals.nom, adresse: vals.adresse || '', statut: 'En cours'
        });
        DevisMulti._state.chantierId = DevisMulti._normalizeId(chantier.id) || '';
        var wrap = document.getElementById('dm-wrap');
        if (wrap) { wrap.innerHTML = DevisMulti._buildHTML(); DevisMulti._bindEvents(); }
        App.toast('Chantier ' + vals.nom + ' créé ✅', 'success');
      }
    });
  },

  _onChantierChange: function(chantierId) {
    DevisMulti._state.chantierId = DevisMulti._normalizeId(chantierId) || '';
    if (!chantierId) return;

    // Récupérer les métrés du chantier
    var metrages = DB.getMetragesByChantier(parseInt(chantierId));
    if (!metrages || metrages.length === 0) return;

    // Calculer les surfaces globales
    var totalMurs    = 0;
    var totalSol     = 0;
    var totalPlafond = 0;
    var pieces       = [];

    metrages.forEach(function(m) {
      var surfMurs    = 2 * (m.longueur + m.largeur) * m.hauteur;
      var surfSol     = m.longueur * m.largeur;
      var surfPlafond = m.longueur * m.largeur;
      totalMurs    += surfMurs;
      totalSol     += surfSol;
      totalPlafond += surfPlafond;
      pieces.push({
        nom:     m.piece || 'Pièce',
        l:       m.longueur,
        la:      m.largeur,
        h:       m.hauteur,
        murs:    Math.round(surfMurs * 10) / 10,
        sol:     Math.round(surfSol * 10) / 10,
        plafond: Math.round(surfPlafond * 10) / 10,
      });
    });

    totalMurs    = Math.round(totalMurs * 10) / 10;
    totalSol     = Math.round(totalSol * 10) / 10;
    totalPlafond = Math.round(totalPlafond * 10) / 10;

    // Afficher le récap métrés
    var recapDiv = document.getElementById('dm-recap-metrages');
    if (recapDiv) {
      recapDiv.style.display = 'block';
      recapDiv.innerHTML =
          '<div style="background:rgba(79,142,247,.08);border:1px solid rgba(79,142,247,.3);border-radius:8px;padding:14px;margin-bottom:16px">'
        + '<div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:10px">📐 Métrés du chantier — importés automatiquement</div>'
        + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px">'
        + '<div style="text-align:center;background:var(--bg-primary);border-radius:6px;padding:10px">'
        + '<div style="font-size:20px;font-weight:800;color:var(--accent)">' + totalMurs + ' m²</div>'
        + '<div style="font-size:11px;color:var(--text-tertiary)">Surface murs</div></div>'
        + '<div style="text-align:center;background:var(--bg-primary);border-radius:6px;padding:10px">'
        + '<div style="font-size:20px;font-weight:800;color:#10b981">' + totalSol + ' m²</div>'
        + '<div style="font-size:11px;color:var(--text-tertiary)">Surface sol</div></div>'
        + '<div style="text-align:center;background:var(--bg-primary);border-radius:6px;padding:10px">'
        + '<div style="font-size:20px;font-weight:800;color:#8b5cf6">' + totalPlafond + ' m²</div>'
        + '<div style="font-size:11px;color:var(--text-tertiary)">Surface plafond</div></div>'
        + '</div>'
        + '<div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px">'
        + pieces.map(function(p) {
            return '🏠 <b>' + p.nom + '</b> : ' + p.l + '×' + p.la + '×' + p.h + 'm'
              + ' — murs ' + p.murs + 'm² / sol ' + p.sol + 'm²';
          }).join(' &nbsp;|&nbsp; ')
        + '</div>'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
        + '<button class="btn btn-secondary btn-sm" onclick="DevisMulti._importerMurs(' + totalMurs + ')">+ Import murs ' + totalMurs + ' m²</button>'
        + '<button class="btn btn-secondary btn-sm" onclick="DevisMulti._importerSol(' + totalSol + ')">+ Import sol ' + totalSol + ' m²</button>'
        + '<button class="btn btn-secondary btn-sm" onclick="DevisMulti._importerPlafond(' + totalPlafond + ')">+ Import plafond ' + totalPlafond + ' m²</button>'
        + '<button class="btn btn-primary btn-sm" onclick="DevisMulti._importerTout(' + totalMurs + ',' + totalSol + ',' + totalPlafond + ')">⚡ Tout importer</button>'
        + '</div>'
        + '</div>';
    }

    // Stocker les métrés dans le state
    DevisMulti._state.metrages = { totalMurs: totalMurs, totalSol: totalSol, totalPlafond: totalPlafond, pieces: pieces };
  },

  _importerMurs: function(surface) {
    DevisMulti._ajouterSectionAvecSurface('cloisons', '🧱', 'Cloisons', surface, 'm²', 'Pose cloisons BA13');
    App.toast('Murs ' + surface + ' m² importés ✅', 'success');
  },

  _importerSol: function(surface) {
    DevisMulti._ajouterSectionAvecSurface('carrelage', '🏠', 'Carrelage / Sol', surface, 'm²', 'Pose carrelage sol');
    App.toast('Sol ' + surface + ' m² importé ✅', 'success');
  },

  _importerPlafond: function(surface) {
    DevisMulti._ajouterSectionAvecSurface('plafond', '⬜', 'Plafond', surface, 'm²', 'Pose plafond suspendu BA13');
    App.toast('Plafond ' + surface + ' m² importé ✅', 'success');
  },

  _importerTout: function(murs, sol, plafond) {
    DevisMulti._ajouterSectionAvecSurface('cloisons', '🧱', 'Cloisons / Murs', murs, 'm²', 'Pose cloisons BA13');
    DevisMulti._ajouterSectionAvecSurface('peinture', '🎨', 'Peinture murs', murs, 'm²', 'Peinture 2 couches');
    DevisMulti._ajouterSectionAvecSurface('carrelage', '🏠', 'Carrelage / Sol', sol, 'm²', 'Pose carrelage sol');
    DevisMulti._ajouterSectionAvecSurface('plafond', '⬜', 'Plafond', plafond, 'm²', 'Pose plafond suspendu BA13');
    DevisMulti._renderSections();
    App.toast('⚡ Tout importé — ' + murs + ' m² murs / ' + sol + ' m² sol / ' + plafond + ' m² plafond', 'success');
  },

  _ajouterSectionAvecSurface: function(key, icon, titre, surface, unite, designation) {
    var state = DevisMulti._state;
    // Chercher si section existe déjà
    var sec = state.sections.find(function(s) { return s.key === key; });
    if (!sec) {
      sec = { key: key, icon: icon, titre: titre, tva: 10, lignes: [], sid: DevisMulti._uid() };
      state.sections.push(sec);
    }
    sec.lignes.push({
      id:          DevisMulti._uid(),
      ref:         '',
      designation: designation,
      unite:       unite,
      qte:         surface,
      prix:        0,
    });
  },

  _nouveau: function() {
    App.modalConfirmDanger({
      titre: '🗑 Effacer le devis ?',
      message: 'Le devis en cours sera effacé définitivement.',
      motConfirm: 'EFFACER',
      onConfirm: () => {
        DevisMulti._state = DevisMulti._newState();
        DevisMulti._rerenderAll();
      }
    });
  },

  // ── Sections ──────────────────────────────────────────────
  _buildSectionsHTML: function() {
    var html = '';
    DevisMulti._state.sections.forEach(function(sec) {
      html += DevisMulti._buildSectionHTML(sec);
    });
    html += DevisMulti._buildAddSectionHTML();
    return html;
  },

  _buildSectionHTML: function(sec) {
    var total = DevisMulti._sectionTotal(sec);

    var rows = (sec.lignes || []).map(function(l, li) {
      if (DevisMulti._isHeaderLine(l)) return '';
      if (DevisMulti._isZeroNoiseLine(l, sec)) return '';
      return DevisMulti._buildRowHTML(sec.sid, l, li);
    }).join('');

    return '<div class="dm-section" id="dm-sec-' + sec.sid + '">'
      // En-tête section
      + '<div class="dm-sec-header">'
      + '<span class="dm-sec-icon">' + sec.icon + '</span>'
      + '<input class="dm-sec-titre-input" value="' + DevisMulti._esc(sec.titre) + '"'
      + ' oninput="DevisMulti._onTitreChange(\'' + sec.sid + '\',this.value)">'
      + '<span class="dm-sec-tva">'
      + '<label style="font-size:10px;color:var(--text-tertiary);margin-right:4px">TVA</label>'
      + '<select class="dm-tva-sel" onchange="DevisMulti._onTvaChange(\'' + sec.sid + '\',this.value)">'
      + '<option value="10"' + (sec.tva===10?' selected':'') + '>10%</option>'
      + '<option value="20"' + (sec.tva===20?' selected':'') + '>20%</option>'
      + '<option value="5.5"' + (sec.tva===5.5?' selected':'') + '>5,5%</option>'
      + '<option value="0"' + (sec.tva===0?' selected':'') + '>0%</option>'
      + '</select>'
      + '</span>'
      + '<span class="dm-sec-subtotal" id="dm-sec-total-' + sec.sid + '">' + DevisMulti._fmt(total) + ' € HT</span>'
      + '<button class="dm-sec-del" onclick="DevisMulti.removeSection(\'' + sec.sid + '\')" title="Supprimer">✕</button>'
      + '</div>'
      // Tableau lignes
      + '<div class="dm-table-wrap">'
      + '<table class="dm-table">'
      + '<thead><tr><th class="dm-th-ref">Réf.</th><th class="dm-th-wide">Désignation</th><th class="dm-th-s">Unité</th><th class="dm-th-s">Qté</th><th class="dm-th-s">Prix HT</th><th class="dm-th-s">Total HT</th><th style="width:28px"></th></tr></thead>'
      + '<tbody id="dm-tbody-' + sec.sid + '">'
      + (rows || '<tr class="dm-empty-row"><td colspan="7" style="text-align:center;color:var(--text-tertiary);padding:14px;font-size:12px">Aucune ligne — ajoutez un produit ci-dessous</td></tr>')
      + '</tbody>'
      + '</table>'
      + '</div>'
      // Barre ajout
      + '<div class="dm-add-row">'
      + '<div class="dm-search-wrap">'
      + '<input class="dm-search-input" id="dm-search-' + sec.sid + '"'
      + ' placeholder="🔍 Rechercher dans la base produits (3 lettres min.)…"'
      + ' oninput="DevisMulti._onSearch(\'' + sec.sid + '\',this)"'
      + ' onblur="DevisMulti._hideDropdown(\'' + sec.sid + '\')">'
      + '<div class="dm-dropdown" id="dm-drop-' + sec.sid + '" style="display:none"></div>'
      + '</div>'
      + '<button class="btn btn-secondary btn-sm" style="white-space:nowrap" onclick="DevisMulti.addLigneLibre(\'' + sec.sid + '\')">+ Article libre</button>'
      + '</div>'
      + '</div>';
  },

  _buildRowHTML: function(sid, l, li) {
    var tot = ((parseFloat(l.qte) || 0) * (parseFloat(l.prix) || 0)).toFixed(2);
    var lock = l.obligatoire ? '<span title="Ligne obligatoire du package" style="font-size:12px;color:#10b981">Obligatoire</span>' : '<button class="dm-del-btn" onclick="DevisMulti.removeLigne(\'' + sid + '\',' + li + ')">✕</button>';
    return '<tr id="dm-row-' + sid + '-' + li + '">'
      + '<td><input class="dm-cell" value="' + DevisMulti._esc(l.ref || '') + '"'
      + ' onchange="DevisMulti._updateLigne(\'' + sid + '\',' + li + ',\'ref\',this.value)"></td>'
      + '<td><div style="display:flex;gap:4px;align-items:center">'
      + '<input class="dm-cell dm-cell-wide" id="dm-desig-' + sid + '-' + li + '" value="' + DevisMulti._esc(l.designation || '') + '"'
      + ' onchange="DevisMulti._updateLigne(\'' + sid + '\',' + li + ',\'designation\',this.value)">'
      + '<button class="dm-ia-btn" onclick="DevisMulti._ameliorerDesignationIA(\'' + sid + '\',' + li + ')" title="✨ Améliorer avec l\'IA">✨</button>'
      + '</div>'
      + '<div id="dm-ia-badge-' + sid + '-' + li + '" style="display:none;margin-top:2px;font-size:10px"></div>'
      + '</td>'
      + '<td><input class="dm-cell dm-cell-xs" value="' + DevisMulti._esc(l.unite || 'u') + '"'
      + ' onchange="DevisMulti._updateLigne(\'' + sid + '\',' + li + ',\'unite\',this.value)"></td>'
      + '<td><input class="dm-cell dm-cell-num" type="number" min="0" step="0.01" value="' + (l.qte || 1) + '"'
      + ' oninput="DevisMulti._updateLigne(\'' + sid + '\',' + li + ',\'qte\',parseFloat(this.value)||0)"></td>'
      + '<td><input class="dm-cell dm-cell-num" type="number" min="0" step="0.01" value="' + (parseFloat(l.prix) || 0).toFixed(2) + '"'
      + ' oninput="DevisMulti._updateLigne(\'' + sid + '\',' + li + ',\'prix\',parseFloat(this.value)||0)"></td>'
      + '<td class="dm-cell-total" id="dm-tot-' + sid + '-' + li + '">' + tot + ' €</td>'
      + '<td>' + lock + '</td>'
      + '</tr>';
  },

  _buildAddSectionHTML: function() {
    var btns = DevisMulti.TYPES.map(function(t) {
      return '<button class="dm-type-btn" onclick="DevisMulti.addSection(\'' + t.key + '\')">'
        + '<span class="dm-type-icon">' + t.icon + '</span>'
        + '<span>' + t.label + '</span>'
        + '</button>';
    }).join('');
    return '<div class="dm-add-section">'
      + '<div class="dm-add-section-title">+ Ajouter un corps de métier</div>'
      + '<div class="dm-type-grid">' + btns + '</div>'
      + '</div>';
  },

  // ── Récapitulatif ─────────────────────────────────────────
  _buildRecapHTML: function() {
    var state  = DevisMulti._state;
    var totaux = DevisMulti._globalTotals();

    var secRows = state.sections.map(function(sec) {
      return '<div class="dm-recap-row">'
        + '<span class="dm-recap-label">' + sec.icon + ' ' + DevisMulti._esc(sec.titre) + '</span>'
        + '<span class="dm-recap-val">' + DevisMulti._fmt(DevisMulti._sectionTotal(sec)) + ' €</span>'
        + '</div>';
    }).join('') || '<div class="dm-recap-empty">Aucune section</div>';

    return '<div class="dm-recap-card">'
      + '<div class="dm-recap-title">Récapitulatif</div>'
      + '<div id="dm-recap-sections">' + secRows + '</div>'
      + '<div class="dm-recap-sep"></div>'
      + '<div class="dm-recap-row dm-recap-ht-row">'
      + '<span>Total HT</span>'
      + '<span class="dm-recap-val" id="dm-recap-ht">' + DevisMulti._fmt(totaux.ht) + ' €</span>'
      + '</div>'
      + '<div class="dm-recap-row" style="color:var(--text-tertiary)">'
      + '<span>TVA (taux mixtes)</span>'
      + '<span class="dm-recap-val" id="dm-recap-tva">' + DevisMulti._fmt(totaux.tva) + ' €</span>'
      + '</div>'
      + '<div class="dm-recap-total">'
      + '<span>Total TTC</span>'
      + '<span class="dm-recap-ttc" id="dm-recap-ttc">' + DevisMulti._fmt(totaux.ttc) + ' €</span>'
      + '</div>'
      + '<div class="dm-recap-nb" id="dm-recap-nb">' + state.sections.length + ' corps · ' + DevisMulti._nbLignes() + ' lignes</div>'
      + '</div>';
  },

  // ── Totaux ────────────────────────────────────────────────
  _sectionTotal: function(sec) {
    return DevisMulti._lignesFacturables(sec).reduce(function(s, l) {
      return s + (parseFloat(l.qte) || 0) * (parseFloat(l.prix) || 0);
    }, 0);
  },

  _globalTotals: function() {
    var ht  = 0;
    var tva = 0;
    DevisMulti._state.sections.forEach(function(sec) {
      var secHT = DevisMulti._sectionTotal(sec);
      ht  += secHT;
      tva += secHT * (DevisMulti._tvaValue(sec.tva, 0) / 100);
    });
    return { ht: ht, tva: tva, ttc: ht + tva };
  },

  _alertesRegles: function() {
    if (typeof ReglesEngine === 'undefined') return '';
    var state = DevisMulti._state;
    var allCtx = { warnings:[], alertes:[], recommandations:[], normes:[], securite:[] };
    state.sections.forEach(function(sec) {
      var metier = sec.key === 'cloisons' ? 'placo'
        : sec.key === 'peinture' ? 'peinture'
        : sec.key === 'carrelage' ? 'carrelage'
        : sec.key === 'electricite' ? 'electricite'
        : sec.key === 'plomberie' ? 'plomberie'
        : sec.key === 'maconnerie' ? 'maconnerie' : null;
      if (!metier) return;
      var input = { surface: 0, erp: false };
      var ctx = ReglesEngine.executer(metier, '*', input);
      ['warnings','alertes','recommandations','normes','securite'].forEach(function(k) {
        allCtx[k] = allCtx[k].concat(ctx[k]);
      });
    });
    // Dédoublonner
    ['warnings','alertes','recommandations','normes','securite'].forEach(function(k) {
      allCtx[k] = [...new Set(allCtx[k])];
    });
    return ReglesEngine.renderAlertes(allCtx);
  },

  _analyserIA: async function() {
    var descriptif = (document.getElementById('dm-ia-descriptif')?.value || '').trim();
    if (!descriptif) { App.toast('Saisissez un descriptif des travaux', 'warning'); return; }

    var config = DB.getConfig();
    var groqKey = config.groqApiKey || config.groqKey || config.apiKeyGroq || '';
    if (!groqKey) {
      App.toast('Clé Groq manquante — configurez-la dans ⚙️ Configuration', 'error');
      return;
    }

    var metrages = DevisMulti._state.metrages || {};
    var mursTotal    = metrages.totalMurs    || 0;
    var solTotal     = metrages.totalSol     || 0;
    var plafondTotal = metrages.totalPlafond || 0;
    var pieces       = metrages.pieces       || [];

    var btn    = document.getElementById('dm-ia-btn');
    var status = document.getElementById('dm-ia-status');
    if (btn) btn.disabled = true;
    if (status) status.textContent = '⏳ Analyse en cours...';

    var prompt = `Tu es un expert en chiffrage BTP pour artisans plaquistes/peintres.

Métrés du chantier :
- Surface murs totale : ${mursTotal} m²
- Surface sol totale  : ${solTotal} m²
- Surface plafond     : ${plafondTotal} m²
- Pièces : ${pieces.map(function(p){ return p.nom + ' (' + p.l + 'x' + p.la + 'x' + p.h + 'm)'; }).join(', ')}

Descriptif des travaux : "${descriptif}"

Génère un devis structuré en JSON UNIQUEMENT (pas de texte avant ou après) avec ce format exact :
{
  "sections": [
    {
      "key": "cloisons",
      "icon": "🧱",
      "titre": "Cloisons",
      "lignes": [
        {
          "designation": "Cloison M48 BA13 double face",
          "qte": 22.5,
          "unite": "m²",
          "prix_unitaire_ht": 45,
          "detail": "3 cloisons de 3m×2.50m"
        }
      ]
    }
  ],
  "recommandations": [
    "Prévoir bande armée aux angles sortants",
    "Vérifier planéité support avant doublage"
  ],
  "alertes": [
    "DTU 25.41 : hauteur > 2.5m — vérifier ossature M70"
  ],
  "resume": "Devis généré : cloisons 22.5m², peinture 45m², sol 24m²"
}

Règles importantes :
- Déduire les ouvertures (fenêtres, portes) des surfaces de peinture
- Fenêtre 120×120 = 1.44 m² à déduire par fenêtre
- Porte 220×90 = 1.98 m² à déduire par porte
- Pour le doublage : utiliser la surface murs totale du chantier
- Pour la peinture murs : surface murs - ouvertures
- Pour la peinture plafond : surface plafond du chantier
- Pour le sol : surface sol du chantier
- Utiliser les prix indicatifs du marché français (MO + matériaux)
- Keys possibles : cloisons, plafond, peinture, electricite, plomberie, carrelage, sol, demolition, menuiserie, autre
- Pour la fourniture de porte : key "menuiserie", prix indicatif selon type
- Toujours inclure la main d'oeuvre dans le prix unitaire HT`;

    try {
      var resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + groqKey },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 2000,
          temperature: 0.1,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      var data = await resp.json();
      var text = (data.choices?.[0]?.message?.content || '').trim();

      var result = (typeof AssistantIA !== 'undefined' && AssistantIA.parseJsonGroq)
        ? AssistantIA.parseJsonGroq(text)
        : JSON.parse(text.replace(/```json/g,'').replace(/```/g,'').trim());

      // Injecter les sections dans le state
      var state = DevisMulti._state;
      var ajoutees = 0;

      (result.sections || []).forEach(function(sec) {
        var existing = state.sections.find(function(s) { return s.key === sec.key; });
        if (!existing) {
          existing = { key: sec.key, icon: sec.icon || '📋', titre: sec.titre, tva: 10, lignes: [] };
          state.sections.push(existing);
        }
        (sec.lignes || []).forEach(function(l) {
          existing.lignes.push({
            id:          DevisMulti._uid(),
            ref:         '',
            designation: l.designation + (l.detail ? ' (' + l.detail + ')' : ''),
            unite:       l.unite || 'm²',
            qte:         parseFloat(l.qte) || 0,
            prix:        parseFloat(l.prix_unitaire_ht) || 0,
          });
          ajoutees++;
        });
      });

      // Afficher le résultat
      var resultatDiv = document.getElementById('dm-ia-resultat');
      if (resultatDiv) {
        var html = '';
        if (result._analysePartielle) {
          html += '<div style="background:rgba(245,158,11,.08);border-left:3px solid #f59e0b;padding:10px 14px;border-radius:0 6px 6px 0;font-size:13px;font-weight:600;margin-bottom:10px">Analyse partielle : la réponse IA a été reçue mais n’a pas pu être entièrement structurée.</div>';
        }
        if (result.resume)
          html += '<div style="background:rgba(79,142,247,.1);border-left:3px solid var(--accent);padding:10px 14px;border-radius:0 6px 6px 0;font-size:13px;font-weight:600;margin-bottom:10px">✅ ' + result.resume + '</div>';
        if (result.alertes && result.alertes.length)
          html += result.alertes.map(function(a) {
            return '<div style="background:rgba(245,158,11,.08);border-left:3px solid #f59e0b;padding:8px 12px;border-radius:0 6px 6px 0;margin-bottom:6px;font-size:12px">🟡 ' + a + '</div>';
          }).join('');
        if (result.recommandations && result.recommandations.length)
          html += result.recommandations.map(function(r) {
            return '<div style="background:rgba(16,185,129,.08);border-left:3px solid #10b981;padding:8px 12px;border-radius:0 6px 6px 0;margin-bottom:6px;font-size:12px">💡 ' + r + '</div>';
          }).join('');
        resultatDiv.innerHTML = html;
      }

      // Rafraîchir les sections
      DevisMulti._renderSections();
      if (status) status.textContent = result._analysePartielle ? 'Analyse partielle' : '✅ ' + ajoutees + ' lignes générées';
      App.toast(result._analysePartielle ? 'Analyse partielle — vérifiez le devis généré' : '🤖 Devis généré — ' + ajoutees + ' lignes ajoutées !', result._analysePartielle ? 'warning' : 'success');

    } catch(e) {
      console.warn('[DevisMulti] Analyse IA indisponible:', e);
      if (status) status.textContent = 'Analyse partielle';
      App.toast('Analyse partielle — complétez le devis manuellement', 'warning');
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  _nbLignes: function() {
    return DevisMulti._state.sections.reduce(function(s, sec) {
      return s + DevisMulti._lignesFacturables(sec).length;
    }, 0);
  },

  _refreshTotaux: function(sid) {
    // Sous-total section
    if (sid) {
      var sec = DevisMulti._state.sections.find(function(s) { return s.sid === sid; });
      if (sec) {
        var el = document.getElementById('dm-sec-total-' + sid);
        if (el) el.textContent = DevisMulti._fmt(DevisMulti._sectionTotal(sec)) + ' € HT';
      }
    }
    // Recap global
    var totaux = DevisMulti._globalTotals();
    var htEl   = document.getElementById('dm-recap-ht');
    var tvaEl  = document.getElementById('dm-recap-tva');
    var ttcEl  = document.getElementById('dm-recap-ttc');
    var nbEl   = document.getElementById('dm-recap-nb');
    if (htEl)  htEl.textContent  = DevisMulti._fmt(totaux.ht)  + ' €';
    if (tvaEl) tvaEl.textContent = DevisMulti._fmt(totaux.tva) + ' €';
    if (ttcEl) ttcEl.textContent = DevisMulti._fmt(totaux.ttc) + ' €';
    if (nbEl)  nbEl.textContent  = DevisMulti._state.sections.length + ' corps · ' + DevisMulti._nbLignes() + ' lignes';
    // Lignes par section dans recap
    var recapSec = document.getElementById('dm-recap-sections');
    if (recapSec) {
      recapSec.innerHTML = DevisMulti._state.sections.map(function(s) {
        return '<div class="dm-recap-row">'
          + '<span class="dm-recap-label">' + s.icon + ' ' + DevisMulti._esc(s.titre) + '</span>'
          + '<span class="dm-recap-val">' + DevisMulti._fmt(DevisMulti._sectionTotal(s)) + ' €</span>'
          + '</div>';
      }).join('') || '<div class="dm-recap-empty">Aucune section</div>';
    }
  },

  // ── Actions sections ──────────────────────────────────────
  addSection: function(key) {
    var t = DevisMulti.TYPES.find(function(x) { return x.key === key; });
    if (!t) return;
    DevisMulti._state.sections.push({
      sid: DevisMulti._uid(), key: key, icon: t.icon, titre: t.label, tva: t.tva, lignes: []
    });
    DevisMulti._rerenderSectionsCol();
    DevisMulti._refreshTotaux(null);
  },

  removeSection: function(sid) {
    App.modalConfirmDanger({
      titre: '🗑 Supprimer la section ?',
      message: 'Cette section et toutes ses lignes seront supprimées.',
      motConfirm: 'SUPPRIMER',
      onConfirm: () => {
        DevisMulti._state.sections = DevisMulti._state.sections.filter(s => s.sid !== sid);
        DevisMulti._rerenderAll();
      }
    });
  },

  _onTitreChange: function(sid, val) {
    var sec = DevisMulti._state.sections.find(function(s) { return s.sid === sid; });
    if (sec) { sec.titre = val; DevisMulti._refreshTotaux(null); }
  },

  _onTvaChange: function(sid, val) {
    var sec = DevisMulti._state.sections.find(function(s) { return s.sid === sid; });
    if (sec) { sec.tva = DevisMulti._tvaValue(val, 0); DevisMulti._refreshTotaux(sid); }
  },

  // ── Actions lignes ────────────────────────────────────────
  addLigneFromProduit: function(sid, p) {
    var sec = DevisMulti._state.sections.find(function(s) { return s.sid === sid; });
    if (!sec) return;
    sec.lignes.push({
      lid: DevisMulti._uid(),
      ref:         p.ref         || '',
      designation: p.designation || p.nom || '',
      unite:       p.unite       || 'u',
      qte:         1,
      prix:        parseFloat(p.prix || p.prixHT || 0)
    });
    DevisMulti._rerenderTbody(sid);
    DevisMulti._refreshTotaux(sid);
    var inp = document.getElementById('dm-search-' + sid);
    if (inp) inp.value = '';
    var drop = document.getElementById('dm-drop-' + sid);
    if (drop) drop.style.display = 'none';
  },

  addLigneLibre: function(sid) {
    var sec = DevisMulti._state.sections.find(function(s) { return s.sid === sid; });
    if (!sec) return;
    sec.lignes.push({ lid: DevisMulti._uid(), ref: '', designation: '', unite: 'u', qte: 1, prix: 0 });
    DevisMulti._rerenderTbody(sid);
    DevisMulti._refreshTotaux(sid);
    // Focus on last designation input
    setTimeout(function() {
      var tbody = document.getElementById('dm-tbody-' + sid);
      if (!tbody) return;
      var inputs = tbody.querySelectorAll('input.dm-cell-wide');
      if (inputs.length) inputs[inputs.length - 1].focus();
    }, 50);
  },

  _ameliorerDesignationIA: async function(sid, li) {
    var inputId = 'dm-desig-' + sid + '-' + li;
    var input   = document.getElementById(inputId);
    if (!input || !input.value.trim()) return;
    var btn = input.parentNode ? input.parentNode.querySelector('.dm-ia-btn') : null;
    if (btn) { btn.textContent = '⌛'; btn.disabled = true; }

    var _gcDm = groqConfig();
    if (!_gcDm) { if (btn) { btn.textContent = '✨'; btn.disabled = false; } return; }
    var original = input.value;
    try {
      var r = await fetch(_gcDm.url, {
        method: 'POST',
        headers: _gcDm.headers,
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: "Tu es expert en bâtiment. Transforme cette désignation en texte professionnel pour un devis de plaquiste : '" + original + "'\nRéponds avec UNIQUEMENT la désignation professionnelle corrigée, max 1 ligne." }],
          max_tokens: 60, temperature: 0.3
        })
      });
      var d = await r.json();
      var improved = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || '').trim();
      if (improved) {
        input.value = improved;
        var sec = DevisMulti._state.sections.find(function(s) { return s.sid === sid; });
        if (sec && sec.lignes[li]) sec.lignes[li].designation = improved;

        var badge = document.getElementById('dm-ia-badge-' + sid + '-' + li);
        if (badge) {
          badge.style.display = 'block';
          var safeOrig = original.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
          badge.innerHTML = '<span style="padding:1px 6px;border-radius:8px;background:rgba(45,212,160,0.15);color:#2DD4A0;border:1px solid rgba(45,212,160,0.3)">✨ Amélioré par IA</span>'
            + ' <button onclick="'
            + "var el=document.getElementById('" + inputId + "');"
            + "if(el){el.value='" + safeOrig + "';"
            + "var s=DevisMulti._state.sections.find(function(x){return x.sid==='" + sid + "'});"
            + "if(s&&s.lignes[" + li + "])s.lignes[" + li + "].designation=el.value;}"
            + "this.closest('[id]').style.display='none';"
            + '" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);text-decoration:underline">Garder l\'original</button>';
        }
        App.toast && App.toast('Désignation améliorée par IA ✨', 'success');
      }
    } catch(e) { App.toast && App.toast('Erreur IA', 'error'); }
    if (btn) { btn.textContent = '✨'; btn.disabled = false; }
  },

  removeLigne: function(sid, li) {
    var sec = DevisMulti._state.sections.find(function(s) { return s.sid === sid; });
    if (!sec) return;
    if (sec.lignes[li] && sec.lignes[li].obligatoire) {
      App.toast('Ligne obligatoire du package — non supprimable', 'warning');
      return;
    }
    sec.lignes.splice(li, 1);
    DevisMulti._rerenderTbody(sid);
    DevisMulti._refreshTotaux(sid);
  },

  _updateLigne: function(sid, li, field, val) {
    var sec = DevisMulti._state.sections.find(function(s) { return s.sid === sid; });
    if (!sec || !sec.lignes[li]) return;
    sec.lignes[li][field] = val;
    var l   = sec.lignes[li];
    var tot = ((parseFloat(l.qte) || 0) * (parseFloat(l.prix) || 0)).toFixed(2);
    var el  = document.getElementById('dm-tot-' + sid + '-' + li);
    if (el) el.textContent = tot + ' €';
    DevisMulti._refreshTotaux(sid);
  },

  // ── Re-renders ciblés ─────────────────────────────────────
  _rerenderTbody: function(sid) {
    var sec   = DevisMulti._state.sections.find(function(s) { return s.sid === sid; });
    var tbody = document.getElementById('dm-tbody-' + sid);
    if (!tbody || !sec) return;
    if (!DevisMulti._lignesFacturables(sec).length) {
      tbody.innerHTML = '<tr class="dm-empty-row"><td colspan="7" style="text-align:center;color:var(--text-tertiary);padding:14px;font-size:12px">Aucune ligne — ajoutez un produit ci-dessous</td></tr>';
      return;
    }
    tbody.innerHTML = sec.lignes.map(function(l, li) {
      if (DevisMulti._isHeaderLine(l)) return '';
      if (DevisMulti._isZeroNoiseLine(l, sec)) return '';
      return DevisMulti._buildRowHTML(sid, l, li);
    }).join('');
  },

  _rerenderSectionsCol: function() {
    var col = document.getElementById('dm-sections-col');
    if (col) col.innerHTML = DevisMulti._buildSectionsHTML();
    var recap = document.getElementById('dm-recap');
    if (recap) recap.innerHTML = DevisMulti._buildRecapHTML();
  },

  _renderSections: function() {
    DevisMulti._rerenderSectionsCol();
  },

  _rerenderAll: function() {
    var wrap = document.getElementById('dm-wrap');
    if (wrap) wrap.innerHTML = DevisMulti._buildHTML();
  },

  // ── Recherche produits ────────────────────────────────────
  _onSearch: function(sid, inputEl) {
    var q = (inputEl.value || '').trim();
    if (q.length < 3) { DevisMulti._hideDropdown(sid); return; }
    var results = DevisMulti._searchProduits(q);
    DevisMulti._dropResults[sid] = results;
    DevisMulti._showDropdown(sid, results);
  },

  _searchProduits: function(raw) {
    function norm(s) {
      return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }
    var q = norm(raw);
    var results = [];
    var seen    = {};

    // CATALOGUE statique (produits_complet.js)
    if (typeof CATALOGUE !== 'undefined') {
      for (var i = 0; i < CATALOGUE.length; i++) {
        if (results.length >= 10) break;
        var p = CATALOGUE[i];
        var k = (p.ref || '') + '|' + (p.nom || '');
        if (seen[k]) continue;
        var match = norm(p.ref).indexOf(q) !== -1
                 || norm(p.nom).indexOf(q) !== -1
                 || (p.tags && p.tags.some(function(t) { return norm(t).indexOf(q) !== -1; }));
        if (match) {
          results.push({ ref: p.ref, designation: p.nom, unite: p.unite, prix: p.prix });
          seen[k] = true;
        }
      }
    }

    // DB.produits dynamiques
    var dbProd = DB.produits || [];
    for (var j = 0; j < dbProd.length; j++) {
      if (results.length >= 12) break;
      var dp = dbProd[j];
      var dk = (dp.reference || '') + '|' + (dp.designation || '');
      if (seen[dk]) continue;
      var dmatch = norm(dp.reference).indexOf(q) !== -1
                || norm(dp.designation).indexOf(q) !== -1;
      if (dmatch) {
        results.push({ ref: dp.reference, designation: dp.designation, unite: dp.unite, prix: dp.prixHT });
        seen[dk] = true;
      }
    }

    return results;
  },

  _showDropdown: function(sid, results) {
    var drop = document.getElementById('dm-drop-' + sid);
    if (!drop) return;
    if (!results.length) {
      drop.innerHTML = '<div style="padding:10px 14px;font-size:12px;color:var(--text-tertiary)">Aucun résultat</div>';
      drop.style.display = 'block';
      return;
    }
    drop.innerHTML = results.map(function(p, i) {
      return '<div class="dm-drop-item" onmousedown="DevisMulti._pickDrop(\'' + sid + '\',' + i + ')">'
        + '<span class="dm-drop-ref">' + DevisMulti._esc(p.ref || '—') + '</span>'
        + '<span class="dm-drop-nom">' + DevisMulti._esc(p.designation || '') + '</span>'
        + '<span class="dm-drop-prix">' + (parseFloat(p.prix) || 0).toFixed(2) + ' €/' + DevisMulti._esc(p.unite || 'u') + '</span>'
        + '</div>';
    }).join('');
    drop.style.display = 'block';
  },

  _pickDrop: function(sid, idx) {
    var results = DevisMulti._dropResults[sid] || [];
    if (results[idx]) DevisMulti.addLigneFromProduit(sid, results[idx]);
  },

  _hideDropdown: function(sid) {
    setTimeout(function() {
      var drop = document.getElementById('dm-drop-' + sid);
      if (drop) drop.style.display = 'none';
    }, 200);
  },

  // ── Enregistrer ───────────────────────────────────────────
  enregistrer: function() {
    var state = DevisMulti._state;
    if (!state.sections.length) {
      App.toast('Ajoutez au moins une section avant d\'enregistrer.', 'error');
      return;
    }
    var nbLignes = DevisMulti._nbLignes();
    if (!nbLignes) {
      App.toast('Le devis est vide — ajoutez des lignes.', 'error');
      return;
    }

    state.clientId = DevisMulti._normalizeId(state.clientId) || '';
    state.chantierId = DevisMulti._normalizeId(state.chantierId) || '';
    if (!state.clientId) {
      App.toast('Veuillez sélectionner un client avant de continuer', 'warning');
      return;
    }

    var config   = DB.getConfig();
    var numero   = config.prefixeDevis + String(DB.nextId(DB.KEYS.devis)).padStart(4, '0');
    var today    = new Date();
    var dateStr  = today.toISOString().split('T')[0];
    var validite = new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0];
    var totaux   = DevisMulti._globalTotals();

    // Lignes aplaties avec séparateurs de section
    var lignes = [];
    state.sections.forEach(function(sec) {
      lignes.push({
        ref: '', designation: '─── ' + sec.icon + ' ' + sec.titre + ' ───',
        _header: true, isHeader: true, type: 'header'
      });
      DevisMulti._lignesFacturables(sec).forEach(function(l) {
        lignes.push({
          ref:         l.ref || '',
          designation: l.designation || '',
          unite:       l.unite || 'u',
          quantite:    parseFloat(l.qte)  || 0,
          prixHT:      parseFloat(l.prix) || 0,
          tva:         DevisMulti._tvaValue(sec.tva, 0),
          totalHT:     (parseFloat(l.qte) || 0) * (parseFloat(l.prix) || 0),
          obligatoire: !!l.obligatoire,
          option:      !!l.option
        });
      });
    });

    DB.addDevis({
      numero:     numero,
      objet:      state.objet || "Devis multi-corps d'état",
      clientId:   DevisMulti._normalizeId(state.clientId),
      chantierId: DevisMulti._normalizeId(state.chantierId),
      date:       dateStr,
      validite:   validite,
      statut:     'Brouillon',
      lignes:     lignes,
      totalHT:    totaux.ht,
      totalTTC:   totaux.ttc,
      montantTVA: totaux.ttc - totaux.ht,
      tva:        state.tvaAutoLiquidee ? 0 : 0.1,
      notes:      "Devis multi-corps : " + state.sections.map(function(s) { return s.titre; }).join(', ')
    });

    // Reset state pour prochain devis
    DevisMulti._state = DevisMulti._newState();
    App.navigate('devis');
  },

  enregistrerSilencieux: function() {
    var state = DevisMulti._state;
    state.clientId = DevisMulti._normalizeId(state.clientId) || '';
    state.chantierId = DevisMulti._normalizeId(state.chantierId) || '';
    if (!state.clientId) return null;
    var sections = state.sections || [];
    var lignes = [];
    sections.forEach(function(sec) {
      lignes.push({ _header:true, isHeader:true, type:'header', designation: sec.titre, icon: sec.icon, tva: sec.tva });
      DevisMulti._lignesFacturables(sec).forEach(function(l) {
        lignes.push({
          ref: l.ref || '', designation: l.designation || '',
          unite: l.unite || '', quantite: parseFloat(l.qte) || 0,
          prixHT: parseFloat(l.prix) || 0,
          totalHT: (parseFloat(l.qte)||0) * (parseFloat(l.prix)||0),
          tva: sec.tva || 20,
          obligatoire: !!l.obligatoire,
          option: !!l.option,
        });
      });
    });
    if (!lignes.filter(function(l) { return !DevisMulti._isHeaderLine(l); }).length) return null;
    var totalHT = lignes.filter(function(l) { return !DevisMulti._isHeaderLine(l); }).reduce(function(s, l) { return s + l.totalHT; }, 0);
    var tva = parseFloat(state.tva) || 20;
    var devis = {
      numero:     'DEV-' + Date.now(),
      objet:      state.objet || 'Devis',
      clientId:   DevisMulti._normalizeId(state.clientId),
      chantierId: DevisMulti._normalizeId(state.chantierId) || '',
      date:       new Date().toISOString().slice(0,10),
      validite:   state.validite || '',
      statut:     'Brouillon',
      lignes:     lignes,
      totalHT:    totalHT,
      tva:        tva,
      totalTTC:   totalHT * (1 + tva/100),
      montantTVA: totalHT * tva/100,
      notes:      state.notes || '',
    };
    var result = DB.addDevis(devis);
    // Ne pas réinitialiser _state, ne pas naviguer
    return result ? (result.id || devis.numero) : null;
  },

  lister: function() {
    return DB.getAll(DB.KEYS.devis) || [];
  },

  charger: function(devisId) {
    var liste = DevisMulti.lister();
    var id = parseInt(devisId);
    var devis = liste.find(function(d) { return d.id === id; });
    if (!devis) return false;

    // Reconstruire _state depuis le devis sauvegardé
    DevisMulti._state = DevisMulti._newState();
    DevisMulti._state.clientId   = DevisMulti._normalizeId(devis.clientId) || '';
    DevisMulti._state.chantierId = DevisMulti._normalizeId(devis.chantierId) || '';
    DevisMulti._state.objet      = devis.objet      || '';
    DevisMulti._state.date       = devis.date       || '';
    DevisMulti._state.validite   = devis.validite   || '';
    DevisMulti._state.notes      = devis.notes      || '';
    DevisMulti._state.tva        = devis.tva        || 20;
    DevisMulti._state._devisId   = devis.id;

    // Reconstruire sections depuis lignes aplaties
    var secCourante = null;
    (devis.lignes || []).forEach(function(l) {
      if (DevisMulti._isHeaderLine(l)) {
        secCourante = {
          key:    l.designation || 'section',
          icon:   l.icon || '',
          titre:  l.designation || '',
          tva:    l.tva || 10,
          lignes: [],
          sid:    DevisMulti._uid()
        };
        DevisMulti._state.sections.push(secCourante);
      } else if (secCourante) {
        secCourante.lignes.push({
          id:          DevisMulti._uid(),
          ref:         l.ref         || '',
          designation: l.designation || '',
          unite:       l.unite       || '',
          qte:         l.quantite    || 0,
          prix:        l.prixHT      || 0,
          obligatoire: !!l.obligatoire,
          option:      !!l.option,
        });
      }
    });
    return true;
  },

  mettreAJourStatut: function(devisId, statut) {
    var liste = DB.getAll(DB.KEYS.devis) || [];
    var id = parseInt(devisId);
    var idx = liste.findIndex(function(d) { return d.id === id; });
    if (idx === -1) return false;
    liste[idx].statut = statut;
    liste[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(DB.KEYS.devis, JSON.stringify(liste));
    return true;
  },

  // ── Impression A4 ─────────────────────────────────────────
  imprimer: function() {
    var state  = DevisMulti._state;
    var config = DB.getConfig();
    var today  = new Date();

    if (!state.sections.length) {
      App.toast('Aucune section à imprimer.', 'error');
      return;
    }

    var clientNom  = '';
    var clientInfo = '';
    if (state.clientId) {
      var cli = DB.getClient(parseInt(state.clientId));
      if (cli) {
        clientNom  = cli.nom || cli.raisonSociale || '';
        clientInfo = [cli.adresse, cli.cp && cli.ville ? cli.cp + ' ' + cli.ville : '', cli.telephone, cli.email]
          .filter(Boolean).join('<br>');
      }
    }
    var chanNom = '';
    if (state.chantierId) {
      var cha = DB.getChantier(parseInt(state.chantierId));
      if (cha) chanNom = cha.nom || cha.adresse || '';
    }

    var totaux = DevisMulti._globalTotals();

    // HTML des sections
    var sectionsHTML = state.sections.map(function(sec) {
      var rows = DevisMulti._lignesFacturables(sec).map(function(l) {
        var ht = (parseFloat(l.qte) || 0) * (parseFloat(l.prix) || 0);
        return '<tr>'
          + '<td>' + DevisMulti._esc(l.ref || '') + '</td>'
          + '<td>' + DevisMulti._esc(l.designation || '') + '</td>'
          + '<td style="text-align:center">' + DevisMulti._esc(l.unite || 'u') + '</td>'
          + '<td style="text-align:right">' + (parseFloat(l.qte) || 0) + '</td>'
          + '<td style="text-align:right">' + (parseFloat(l.prix) || 0).toFixed(2) + ' €</td>'
          + '<td style="text-align:right;font-weight:600">' + ht.toFixed(2) + ' €</td>'
          + '</tr>';
      }).join('');
      var secTot = DevisMulti._sectionTotal(sec);
      return '<div class="p-section">'
        + '<div class="p-sec-head">' + sec.icon + ' ' + DevisMulti._esc(sec.titre)
        + '<span class="p-sec-tva">TVA ' + DevisMulti._tvaValue(sec.tva, 0) + '%</span></div>'
        + '<table class="p-tbl"><thead><tr><th>Réf.</th><th>Désignation</th><th>Unité</th><th style="text-align:right">Qté</th><th style="text-align:right">Prix HT</th><th style="text-align:right">Total HT</th></tr></thead>'
        + '<tbody>' + (rows || '<tr><td colspan="6" style="text-align:center;color:#999;padding:8px">Aucune ligne</td></tr>') + '</tbody>'
        + '<tfoot><tr><td colspan="5" style="text-align:right;padding:6px 8px;font-weight:700">Sous-total ' + DevisMulti._esc(sec.titre) + '</td>'
        + '<td style="text-align:right;padding:6px 8px;font-weight:700">' + DevisMulti._fmt(secTot) + ' €</td></tr></tfoot>'
        + '</table></div>';
    }).join('');

    // Recap lignes
    var recapRows = state.sections.map(function(sec) {
      return '<tr><td>' + sec.icon + ' ' + DevisMulti._esc(sec.titre) + '</td>'
        + '<td style="text-align:right">' + DevisMulti._fmt(DevisMulti._sectionTotal(sec)) + ' €</td></tr>';
    }).join('');

    var html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">'
      + '<title>Devis — ' + DevisMulti._esc(state.objet || '') + '</title>'
      + '<style>'
      + '*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#1a1a1a;margin:0;padding:20px 28px}'
      + 'h1,h2,h3{margin:0}'
      + '.p-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:14px;border-bottom:3px solid #1a56e0}'
      + '.p-company-name{font-size:14px;font-weight:800;color:#1a1a1a}'
      + '.p-company-info{font-size:9.5px;color:#555;line-height:1.9;margin-top:3px}'
      + '.p-doc-title{font-size:26px;font-weight:800;color:#1a56e0;text-align:right;letter-spacing:-1px}'
      + '.p-doc-meta{font-size:9.5px;color:#555;text-align:right;line-height:1.9;margin-top:3px}'
      + '.p-parties{display:flex;gap:20px;margin-bottom:20px}'
      + '.p-party{flex:1;border:1px solid #d0d7e3;border-radius:4px;padding:10px 14px}'
      + '.p-party-lbl{font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:#888;margin-bottom:3px}'
      + '.p-party-name{font-size:12px;font-weight:700;color:#1a1a1a}'
      + '.p-party-info{font-size:9.5px;color:#666;margin-top:2px;line-height:1.7}'
      + '.p-objet{background:#f0f4ff;border-left:4px solid #1a56e0;padding:6px 12px;font-size:11px;font-weight:600;margin-bottom:20px;color:#1a1a1a}'
      + '.p-section{margin-bottom:18px;page-break-inside:avoid}'
      + '.p-sec-head{background:#1a56e0;color:#fff;padding:6px 10px;font-size:11px;font-weight:700;display:flex;justify-content:space-between;align-items:center}'
      + '.p-sec-tva{font-size:9px;font-weight:400;opacity:.8}'
      + '.p-tbl{width:100%;border-collapse:collapse;font-size:10px}'
      + '.p-tbl th{background:#e8eef8;padding:5px 8px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#444;border-bottom:1px solid #c5cfe0}'
      + '.p-tbl td{padding:4px 8px;border-bottom:1px solid #f0f0f0;vertical-align:middle}'
      + '.p-tbl tfoot td{border-top:2px solid #c5cfe0;background:#f5f7fa;font-size:10.5px}'
      + '.p-recap-wrap{display:flex;justify-content:flex-end;margin-top:24px;page-break-inside:avoid}'
      + '.p-recap{width:300px;border:1px solid #d0d7e3;border-radius:4px;overflow:hidden}'
      + '.p-recap-title{background:#e8eef8;padding:7px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#555}'
      + '.p-recap table{width:100%;border-collapse:collapse}'
      + '.p-recap td{padding:5px 12px;font-size:10.5px;border-bottom:1px solid #f0f0f0}'
      + '.p-recap .p-recap-sep td{border-top:2px solid #c5cfe0;padding:0}'
      + '.p-recap .p-tot-ttc td{background:#1a56e0;color:#fff;font-size:13px;font-weight:800;padding:9px 12px;border-bottom:none}'
      + '.p-footer{margin-top:28px;padding-top:10px;border-top:1px solid #d0d7e3;font-size:8.5px;color:#888;text-align:center}'
      + '@page{size:A4 portrait;margin:15mm 15mm}'
      + '@media print{body{padding:0}}'
      + '</style></head><body>'
      // En-tête
      + '<div class="p-header">'
      + '<div><div class="p-company-name">' + DevisMulti._esc(config.nomEntreprise || '') + '</div>'
      + '<div class="p-company-info">' + DevisMulti._esc(config.adresse || '') + '<br>'
      + DevisMulti._esc(config.telephone || '') + ' · ' + DevisMulti._esc(config.email || '') + '<br>'
      + 'SIRET : ' + DevisMulti._esc(config.siret || '') + '</div>'
      + '</div>'
      + '<div><div class="p-doc-title">DEVIS</div>'
      + '<div class="p-doc-meta">Date : ' + today.toLocaleDateString('fr-FR') + '<br>'
      + 'Validité : 30 jours</div></div>'
      + '</div>'
      // Parties
      + '<div class="p-parties">'
      + '<div class="p-party"><div class="p-party-lbl">Client</div>'
      + '<div class="p-party-name">' + DevisMulti._esc(clientNom || '—') + '</div>'
      + (clientInfo ? '<div class="p-party-info">' + clientInfo + '</div>' : '')
      + '</div>'
      + '<div class="p-party"><div class="p-party-lbl">Chantier</div>'
      + '<div class="p-party-name">' + DevisMulti._esc(chanNom || '—') + '</div>'
      + '</div>'
      + '</div>'
      // Objet
      + '<div class="p-objet">Objet : ' + DevisMulti._esc(state.objet || '') + '</div>'
      // Sections
      + sectionsHTML
      // Récap
      + '<div class="p-recap-wrap"><div class="p-recap">'
      + '<div class="p-recap-title">Récapitulatif</div>'
      + '<table><tbody>'
      + recapRows
      + '<tr class="p-recap-sep"><td colspan="2" style="height:2px"></td></tr>'
      + '<tr><td>Total HT</td><td style="text-align:right;font-weight:700">' + DevisMulti._fmt(totaux.ht)  + ' €</td></tr>'
      + '<tr><td>TVA</td><td style="text-align:right">'                        + DevisMulti._fmt(totaux.tva) + ' €</td></tr>'
      + '<tr class="p-tot-ttc"><td>Total TTC</td><td style="text-align:right">' + DevisMulti._fmt(totaux.ttc) + ' €</td></tr>'
      + '</tbody></table></div></div>'
      // Pied de page
      + '<div class="p-footer">' + DevisMulti._esc(config.piedPageDevis || 'Devis valable 30 jours à compter de sa date d\'émission.') + '</div>'
      + '</body></html>';

    var win = window.open('', '_blank', 'width=900,height=750');
    if (!win) { App.toast('Autorisez les popups pour imprimer.', 'error'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(function() { win.print(); }, 500);
  },

  exporterExcel: function() {
    var devis = DB.devis[DB.devis.length - 1];
    if (devis) ExcelExport.exporterDevis(devis.id);
    else App.toast('Aucun devis à exporter', 'error');
  },

  // ── Styles ────────────────────────────────────────────────
  _injectStyles: function() {
    if (document.getElementById('dm-styles')) return;
    var s = document.createElement('style');
    s.id = 'dm-styles';
    s.textContent = `
      /* ── Wrapper ────────────────────────────────── */
      .dm-wrap { padding: 24px; max-width: 1500px; }

      /* ── Hero ───────────────────────────────────── */
      .dm-hero {
        background: linear-gradient(135deg,
          rgba(79,142,247,0.14) 0%, rgba(167,139,250,0.09) 50%, rgba(45,212,160,0.05) 100%);
        border: 1px solid var(--glass-border-md);
        border-radius: var(--r-xl);
        padding: 28px 36px;
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
      }
      .dm-hero::before {
        content: '';
        position: absolute; top: -40px; right: -40px;
        width: 200px; height: 200px;
        background: radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%);
        pointer-events: none;
      }
      .dm-hero-inner { position: relative; }
      .dm-hero-badge {
        display: inline-block;
        background: rgba(79,142,247,0.15);
        border: 1px solid rgba(79,142,247,0.3);
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 11px; font-weight: 700;
        color: var(--accent);
        text-transform: uppercase; letter-spacing: .08em;
        margin-bottom: 10px;
      }
      .dm-hero-title {
        font-size: 26px; font-weight: 800;
        color: var(--text-primary);
        margin: 0 0 6px; letter-spacing: -0.5px;
      }
      .dm-hero-sub { font-size: 14px; color: var(--text-secondary); margin: 0; }

      /* ── Barre d'en-tête ────────────────────────── */
      .dm-header-bar {
        display: flex; justify-content: space-between;
        align-items: flex-end; gap: 16px;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--r-xl);
        padding: 16px 20px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .dm-header-row { display: flex; gap: 12px; flex-wrap: wrap; flex: 1; align-items: flex-end; }
      .dm-header-field { display: flex; flex-direction: column; gap: 4px; }
      .dm-header-objet { flex: 1; min-width: 220px; }
      .dm-header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; flex-wrap: wrap; }
      .dm-label {
        font-size: 10px; font-weight: 700;
        color: var(--text-tertiary);
        text-transform: uppercase; letter-spacing: .06em;
      }
      .dm-sel { min-width: 180px; }

      /* ── Layout 2 colonnes ──────────────────────── */
      .dm-layout { display: grid; grid-template-columns: 1fr; gap: 20px; align-items: start; }
      @media (min-width: 1200px) {
        .dm-layout { grid-template-columns: 1fr 340px; }
      }

      /* ── Colonne sections ───────────────────────── */
      .dm-sections-col { display: flex; flex-direction: column; gap: 14px; }

      /* ── Section ────────────────────────────────── */
      .dm-section {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--r-xl);
        overflow: visible;
      }
      .dm-sec-header {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--glass-border);
        background: rgba(255,255,255,0.02);
        border-radius: var(--r-xl) var(--r-xl) 0 0;
        flex-wrap: wrap;
      }
      .dm-sec-icon { font-size: 18px; flex-shrink: 0; }
      .dm-sec-titre-input {
        flex: 1; min-width: 120px;
        background: none; border: none; outline: none;
        font-size: 14px; font-weight: 700; color: var(--text-primary);
        font-family: var(--font, sans-serif);
      }
      .dm-sec-titre-input:focus { color: var(--accent); }
      .dm-sec-tva {
        display: flex; align-items: center; gap: 4px;
        flex-shrink: 0;
      }
      .dm-tva-sel {
        background: rgba(255,255,255,0.06);
        border: 1px solid var(--glass-border-md);
        border-radius: var(--r-sm);
        color: var(--text-secondary);
        font-size: 11px;
        padding: 2px 6px;
        outline: none;
        cursor: pointer;
      }
      .dm-sec-subtotal {
        font-family: var(--font-mono);
        font-size: 13px; font-weight: 700;
        color: var(--accent);
        white-space: nowrap; flex-shrink: 0;
      }
      .dm-sec-del {
        background: none; border: none; cursor: pointer;
        color: var(--text-tertiary); font-size: 13px;
        padding: 4px 6px; border-radius: var(--r-sm);
        transition: all .12s; flex-shrink: 0;
      }
      .dm-sec-del:hover { background: rgba(247,91,91,0.12); color: var(--red, #F75B5B); }

      /* ── Table ──────────────────────────────────── */
      .dm-table-wrap { overflow-x: auto; }
      .dm-table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 560px; }
      .dm-table thead th {
        padding: 7px 8px;
        text-align: left;
        font-size: 10px; font-weight: 700;
        text-transform: uppercase; letter-spacing: .05em;
        color: var(--text-tertiary);
        border-bottom: 1px solid var(--glass-border);
        background: rgba(255,255,255,0.015);
        white-space: nowrap;
      }
      .dm-th-ref   { width: 80px; }
      .dm-th-wide  { /* auto */ }
      .dm-th-s     { width: 72px; }
      .dm-table tbody tr:hover { background: rgba(255,255,255,0.025); }
      .dm-table td { padding: 3px 5px; border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
      .dm-empty-row td { border: none !important; }

      .dm-cell {
        width: 100%;
        background: rgba(255,255,255,0.04);
        border: 1px solid transparent;
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 12px; color: var(--text-primary);
        outline: none;
        font-family: var(--font, sans-serif);
        transition: border-color .12s, background .12s;
      }
      .dm-cell:focus { border-color: var(--accent); background: rgba(79,142,247,0.07); }
      .dm-cell-wide { width: 100%; }
      .dm-cell-xs { max-width: 54px; text-align: center; }
      .dm-cell-num { max-width: 72px; font-family: var(--font-mono); text-align: right; }
      .dm-cell-total {
        font-family: var(--font-mono); font-size: 12px; font-weight: 600;
        color: var(--text-primary); white-space: nowrap;
        text-align: right; padding: 3px 10px;
      }
      .dm-del-btn {
        background: none; border: none; cursor: pointer;
        color: var(--text-tertiary); font-size: 11px;
        padding: 3px 5px; border-radius: 4px;
        transition: all .12s;
      }
      .dm-del-btn:hover { background: rgba(247,91,91,0.12); color: #F75B5B; }
      .dm-ia-btn {
        background: none; border: 1px solid rgba(45,212,160,0.25); border-radius: 4px;
        width: 26px; height: 26px; font-size: 12px; cursor: pointer; color: #2DD4A0;
        flex-shrink: 0; transition: all .15s; padding: 0;
      }
      .dm-ia-btn:hover { background: rgba(45,212,160,0.12); border-color: rgba(45,212,160,0.5); }
      .dm-ia-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      /* ── Barre ajout ligne ──────────────────────── */
      .dm-add-row {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 14px;
        border-top: 1px solid var(--glass-border);
        background: rgba(255,255,255,0.01);
        border-radius: 0 0 var(--r-xl) var(--r-xl);
        flex-wrap: wrap;
      }
      .dm-search-wrap { flex: 1; position: relative; min-width: 200px; }
      .dm-search-input {
        width: 100%;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--glass-border-md);
        border-radius: var(--r-md);
        padding: 7px 12px;
        font-size: 13px; color: var(--text-primary);
        outline: none;
        transition: border-color .12s;
        box-sizing: border-box;
        font-family: var(--font, sans-serif);
      }
      .dm-search-input:focus { border-color: var(--accent); background: rgba(79,142,247,0.06); }
      .dm-dropdown {
        position: absolute;
        top: calc(100% + 4px); left: 0; right: 0;
        background: #1a1d27;
        border: 1px solid var(--glass-border-md);
        border-radius: var(--r-md);
        box-shadow: 0 8px 32px rgba(0,0,0,0.65);
        z-index: 9000;
        max-height: 260px; overflow-y: auto;
      }
      .dm-drop-item {
        display: flex; align-items: center; gap: 10px;
        padding: 8px 12px; cursor: pointer;
        transition: background .1s;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .dm-drop-item:last-child { border-bottom: none; }
      .dm-drop-item:hover { background: rgba(79,142,247,0.12); }
      .dm-drop-ref {
        font-family: var(--font-mono); font-size: 11px;
        color: var(--accent); width: 76px; flex-shrink: 0;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .dm-drop-nom { flex: 1; font-size: 12px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .dm-drop-prix { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); white-space: nowrap; flex-shrink: 0; }

      /* ── Bouton ajouter section ─────────────────── */
      .dm-add-section {
        background: var(--glass-bg);
        border: 1px dashed var(--glass-border-md);
        border-radius: var(--r-xl);
        padding: 20px;
      }
      .dm-add-section-title {
        font-size: 13px; font-weight: 700;
        color: var(--text-secondary);
        margin-bottom: 14px; text-align: center;
        text-transform: uppercase; letter-spacing: .05em;
      }
      .dm-type-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
      .dm-type-btn {
        display: flex; flex-direction: column; align-items: center; gap: 4px;
        padding: 11px 8px;
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--glass-border);
        border-radius: var(--r-lg);
        cursor: pointer;
        font-size: 11px; font-weight: 600;
        color: var(--text-secondary);
        transition: all .15s;
        font-family: var(--font, sans-serif);
      }
      .dm-type-icon { font-size: 20px; }
      .dm-type-btn:hover {
        background: rgba(79,142,247,0.1);
        border-color: rgba(79,142,247,0.3);
        color: var(--accent);
        transform: translateY(-1px);
      }

      /* ── Colonne récap ──────────────────────────── */
      .dm-recap-col { }
      .dm-recap-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--r-xl);
        padding: 20px;
        position: sticky;
        top: 80px;
      }
      .dm-recap-title {
        font-size: 11px; font-weight: 700;
        color: var(--text-tertiary);
        text-transform: uppercase; letter-spacing: .08em;
        margin-bottom: 14px;
      }
      .dm-recap-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 5px 0; font-size: 13px; color: var(--text-secondary);
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .dm-recap-row:last-child { border-bottom: none; }
      .dm-recap-ht-row { border-top: 1px solid var(--glass-border-md); margin-top: 8px; padding-top: 8px; }
      .dm-recap-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 8px; }
      .dm-recap-val { font-family: var(--font-mono); font-weight: 600; color: var(--text-primary); white-space: nowrap; }
      .dm-recap-sep { height: 1px; background: var(--glass-border-md); margin: 10px 0; }
      .dm-recap-total {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 0 6px;
        border-top: 1px solid var(--glass-border-md);
        margin-top: 10px;
      }
      .dm-recap-total > span:first-child { font-weight: 700; font-size: 13px; color: var(--accent); }
      .dm-recap-ttc { font-size: 24px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono); }
      .dm-recap-nb { font-size: 11px; color: var(--text-tertiary); text-align: right; margin-top: 8px; }
      .dm-recap-empty { font-size: 12px; color: var(--text-tertiary); text-align: center; padding: 10px 0; font-style: italic; }
    `;
    document.head.appendChild(s);
  },
};

// ── Enregistrement page ────────────────────────────────────
Pages.devisComplet = function() {
  return DevisMulti.render();
};

