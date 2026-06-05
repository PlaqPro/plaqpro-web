/**
 * PlaqPro+ — Liste d'achat V2 depuis Calcul Express
 * Genere une ventilation achats par corps de metier.
 */

(function() {
  'use strict';

  var CORPS_BDD = {
    Plâtrerie: { label: 'Plâtrerie', ouvrage: 'OUV_CLOISON_BA13_M48' },
    peinture: { label: 'Peinture', ouvrage: 'OUV_PEINTURE_MURS_2_COUCHES' },
    maconnerie: { label: 'Maconnerie', ouvrage: 'OUV_MUR_PARPAING_20' },
    paysagisme: { label: 'Paysagisme', ouvrage: 'OUV_GAZON_ROULEAU' },
  };

  var CORPS_LABELS = {
    Plâtrerie: 'Plâtrerie',
    peinture: 'Peinture',
    electricite: 'Electricite',
    plomberie: 'Plomberie',
    maconnerie: 'Maconnerie',
    paysagisme: 'Paysagisme',
  };

  var QUANTITES_OUV = {
    prise_simple: 'OUV_PRISE_16A',
    prise_double: 'OUV_PRISE_16A',
    prise_double_usb: 'OUV_PRISE_16A',
    prise_20a: 'OUV_PRISE_16A',
    prise_etanche: 'OUV_PRISE_16A',
    prise_rj45: 'OUV_PRISE_16A',
    inter_simple: 'OUV_INTERRUPTEUR_SIMPLE',
    inter_vv: 'OUV_INTERRUPTEUR_SIMPLE',
    inter_double: 'OUV_INTERRUPTEUR_SIMPLE',
    variateur: 'OUV_INTERRUPTEUR_SIMPLE',
    inter_etanche: 'OUV_INTERRUPTEUR_SIMPLE',
    point_dcl: 'OUV_POINT_LUMINEUX_DCL',
    spot_encastre: 'OUV_POINT_LUMINEUX_DCL',
    applique: 'OUV_POINT_LUMINEUX_DCL',
    hublot_ext: 'OUV_POINT_LUMINEUX_DCL',
    tableau_13m: 'OUV_TABLEAU_13M',
    tableau_26m: 'OUV_TABLEAU_13M',
    disjoncteur: 'OUV_TABLEAU_13M',
    wc_standard: 'OUV_WC_STANDARD',
    wc_suspendu: 'OUV_WC_STANDARD',
    lavabo: 'OUV_RECEVEUR_DOUCHE',
    evier_1bac: 'OUV_ALIM_PER_16',
    evier_2bacs: 'OUV_ALIM_PER_16',
    douche_receveur: 'OUV_RECEVEUR_DOUCHE',
    douche_italienne: 'OUV_RECEVEUR_DOUCHE',
    baignoire: 'OUV_RECEVEUR_DOUCHE',
    baignoire_balneo: 'OUV_RECEVEUR_DOUCHE',
    lave_linge: 'OUV_ALIM_PER_16',
    lave_vaisselle: 'OUV_ALIM_PER_16',
    robinet_ext: 'OUV_ALIM_PER_16',
    mitigeur_lavabo: 'OUV_ALIM_PER_16',
    mitigeur_douche: 'OUV_RECEVEUR_DOUCHE',
    mitigeur_evier: 'OUV_ALIM_PER_16',
    nourrice: 'OUV_ALIM_PER_16',
    vanne_arret: 'OUV_ALIM_PER_16',
  };

  var PRIX_ML = {
    cable_15: { designation: 'Cable 1.5mm2', unite: 'ml', prix: 1.8 },
    cable_25: { designation: 'Cable 2.5mm2', unite: 'ml', prix: 2.4 },
    gaine_irl: { designation: 'Gaine IRL', unite: 'ml', prix: 1.2 },
    per_16: { designation: 'Alimentation PER 16', unite: 'ml', prix: 3.5 },
    per_20: { designation: 'Alimentation PER 20', unite: 'ml', prix: 4.8 },
    pvc_40: { designation: 'Evacuation PVC 40', unite: 'ml', prix: 6.0 },
    pvc_100: { designation: 'Evacuation PVC 100', unite: 'ml', prix: 12.0 },
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtPrix(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function fmtQte(value) {
    var n = Number(value) || 0;
    return String(Math.round(n * 100) / 100).replace('.', ',');
  }

  function bddDisponible() {
    return typeof BddV2 !== 'undefined' && BddV2.estChargee && BddV2.estChargee();
  }

  function ensureCorps(result, corpsId) {
    if (!result.parCorps[corpsId]) {
      result.parCorps[corpsId] = {
        label: CORPS_LABELS[corpsId] || corpsId,
        _map: {},
        lignes: [],
        totalHT: 0,
      };
    }
    return result.parCorps[corpsId];
  }

  function addLine(result, corpsId, code, designation, qte, unite, prixUnitaire) {
    var bloc = ensureCorps(result, corpsId);
    var key = code + '|' + unite;
    var qty = Number(qte) || 0;
    var prix = Number(prixUnitaire) || 0;
    if (!qty) return;
    if (!bloc._map[key]) {
      bloc._map[key] = {
        code: code,
        designation: designation || code,
        qte: 0,
        unite: unite || 'u',
        prixUnitaire: prix,
        totalHT: 0,
      };
      bloc.lignes.push(bloc._map[key]);
    }
    bloc._map[key].qte += qty;
    bloc._map[key].totalHT = bloc._map[key].qte * bloc._map[key].prixUnitaire;
  }

  function genererListeDepuisStructure(pieces, corpsActifs, corpsConfig) {
    if (!bddDisponible()) return { parCorps: {}, totalGeneral: 0, erreur: 'BddV2 non disponible' };

    var result = { parCorps: {}, totalGeneral: 0 };
    var lignes = CalcExpressStructure.buildLignes(pieces, corpsActifs, corpsConfig) || [];

    lignes.forEach(function(ligne) {
      if (!ligne || !ligne.corps) return;
      var bloc = ensureCorps(result, ligne.corps);
      if (ligne.corpsLabel) bloc.label = ligne.corpsLabel;
      (ligne.materiaux || []).forEach(function(materiau) {
        addLine(
          result,
          ligne.corps,
          materiau.codeMat,
          materiau.designation,
          materiau.qte,
          materiau.unite,
          materiau.prixAchat
        );
      });
    });

    return finaliser(result);
  }

  function addComposition(result, corpsId, ouvrageCode, quantite) {
    if (!ouvrageCode || !quantite) return;
    var composition = BddV2.getComposition(ouvrageCode) || [];
    if (!composition.length) {
      var ouvrage = BddV2.getOuvrage ? BddV2.getOuvrage(ouvrageCode) : null;
      if (ouvrage) {
        addLine(result, corpsId, ouvrageCode, ouvrage.designation, quantite, ouvrage.unite || 'u', 0);
      }
      return;
    }
    composition.forEach(function(item) {
      var codeMat = item.code_materiau || item.codeMat || item.code;
      var materiau = codeMat && BddV2.getMateriau ? BddV2.getMateriau(codeMat) : null;
      var qteParUnite = Number(item.quantite_unitaire || item.qteParUnite || 0);
      var perte = Number(item.perte || 0);
      var qteTotal = qteParUnite * (1 + perte) * quantite;
      var designation = (materiau && materiau.designation) || item.designation || codeMat;
      var unite = (materiau && materiau.unite) || item.unite || '';
      var prix = Number((materiau && materiau.pu_ht) || item.pu_ht || 0);
      addLine(result, corpsId, codeMat, designation, qteTotal, unite, prix);
    });
  }

  function finaliser(result) {
    result.totalGeneral = 0;
    Object.keys(result.parCorps).forEach(function(corpsId) {
      var bloc = result.parCorps[corpsId];
      bloc.totalHT = bloc.lignes.reduce(function(sum, ligne) {
        ligne.qte = Math.round((Number(ligne.qte) || 0) * 100) / 100;
        ligne.totalHT = Math.round((Number(ligne.totalHT) || 0) * 100) / 100;
        return sum + ligne.totalHT;
      }, 0);
      bloc.totalHT = Math.round(bloc.totalHT * 100) / 100;
      delete bloc._map;
      result.totalGeneral += bloc.totalHT;
    });
    result.totalGeneral = Math.round(result.totalGeneral * 100) / 100;
    return result;
  }

  function exportCSV(data) {
    var rows = [['Corps', 'Ref', 'Designation', 'Qte', 'Unite', 'PU HT', 'Total HT']];
    Object.keys(data.parCorps).forEach(function(corpsId) {
      var bloc = data.parCorps[corpsId];
      bloc.lignes.forEach(function(ligne) {
        rows.push([bloc.label, ligne.code, ligne.designation, ligne.qte, ligne.unite, ligne.prixUnitaire, ligne.totalHT]);
      });
    });
    var csv = rows.map(function(row) {
      return row.map(function(cell) {
        var text = String(cell == null ? '' : cell);
        return /[;"\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
      }).join(';');
    }).join('\r\n');
    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'liste_achat_v2.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function renderTable(bloc) {
    var rows = bloc.lignes.map(function(ligne) {
      return '<tr>' +
        '<td>' + esc(ligne.code) + '</td>' +
        '<td>' + esc(ligne.designation) + '</td>' +
        '<td style="text-align:right">' + esc(fmtQte(ligne.qte)) + '</td>' +
        '<td>' + esc(ligne.unite) + '</td>' +
        '<td style="text-align:right">' + esc(fmtPrix(ligne.prixUnitaire)) + '</td>' +
        '<td style="text-align:right;font-weight:700">' + esc(fmtPrix(ligne.totalHT)) + '</td>' +
      '</tr>';
    }).join('');
    var forfaitOnly = bloc.lignes.length > 0 && bloc.lignes.every(function(ligne) {
      return ligne.code && String(ligne.code).indexOf('FORFAIT_') === 0;
    });
    var titreCorps = esc(bloc.label);
    if (forfaitOnly) {
      titreCorps += ' <span style="font-size:11px;color:var(--text-muted,#888)">(coût forfaitaire — détail à enrichir)</span>';
    }
    return '<section style="background:var(--card-bg,var(--bg-card,#fff));border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:14px;margin-bottom:14px;color:var(--text,#111)">' +
      '<h3 style="margin:0 0 10px;color:var(--accent,#4f8ef7)">' + titreCorps + '</h3>' +
      '<table style="width:100%;border-collapse:collapse"><thead><tr>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid var(--border,#e5e7eb)">Ref</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid var(--border,#e5e7eb)">Designation</th>' +
        '<th style="text-align:right;padding:8px;border-bottom:1px solid var(--border,#e5e7eb)">Qte</th>' +
        '<th style="text-align:left;padding:8px;border-bottom:1px solid var(--border,#e5e7eb)">Unite</th>' +
        '<th style="text-align:right;padding:8px;border-bottom:1px solid var(--border,#e5e7eb)">PU HT</th>' +
        '<th style="text-align:right;padding:8px;border-bottom:1px solid var(--border,#e5e7eb)">Total HT</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div style="text-align:right;margin-top:10px;font-weight:900">Sous-total : ' + esc(fmtPrix(bloc.totalHT)) + '</div>' +
    '</section>';
  }

  function genererListeFallback(pieces, corpsActifs, corpsConfig) {
    if (!bddDisponible()) return { parCorps: {}, totalGeneral: 0, erreur: 'BddV2 non disponible' };

    var result = { parCorps: {}, totalGeneral: 0 };
    var allPieces = Array.isArray(pieces) ? pieces : [];
    var corps = Array.isArray(corpsActifs) ? corpsActifs : [];
    var configs = corpsConfig || {};

    corps.forEach(function(corpsId) {
      ensureCorps(result, corpsId);
      var mapping = CORPS_BDD[corpsId];
      if (mapping) {
        allPieces
          .filter(function(piece) { return piece && piece.corps === corpsId && Number(piece.surface) > 0; })
          .forEach(function(piece) { addComposition(result, corpsId, mapping.ouvrage, Number(piece.surface) || 0); });
      }
      if (corpsId === 'electricite' || corpsId === 'plomberie') {
        allPieces
          .filter(function(piece) { return piece && piece.corps === corpsId; })
          .forEach(function(piece) {
            var quantites = piece.quantites || {};
            Object.keys(quantites).forEach(function(key) {
              addComposition(result, corpsId, QUANTITES_OUV[key], Number(quantites[key]) || 0);
            });
          });
        var config = configs[corpsId] || {};
        Object.keys(config).forEach(function(key) {
          if (key === 'type' || key === 'lieuxKey' || !PRIX_ML[key]) return;
          var info = PRIX_ML[key];
          addLine(result, corpsId, key, info.designation, Number(config[key]) || 0, info.unite, info.prix);
        });
      }
    });

    return finaliser(result);
  }

  window.ListeAchatV2 = {
    genererListe: function(pieces, corpsActifs, corpsConfig) {
      if (typeof CalcExpressStructure !== 'undefined' && CalcExpressStructure.buildLignes) {
        return genererListeDepuisStructure(pieces, corpsActifs, corpsConfig);
      }
      return genererListeFallback(pieces, corpsActifs, corpsConfig);
    },

    render: function(containerId, pieces, corpsActifs, corpsConfig) {
      var container = document.getElementById(containerId);
      if (!container) {
        // Fallback : chercher le vrai container de l'app
        container = document.getElementById('content') ||
                    document.getElementById('main-content') ||
                    document.querySelector('.content') ||
                    document.body;
      }
      if (!container) return document.createTextNode('');
      var data = this.genererListe(pieces, corpsActifs, corpsConfig);
      if (data.erreur) {
        container.innerHTML = '<div style="padding:18px;border-radius:8px;background:var(--card-bg,var(--bg-card,#fff));color:var(--text,#111)">BddV2 non disponible</div>';
        return document.createTextNode('');
      }
      var corpsIds = Object.keys(data.parCorps).filter(function(corpsId) {
        return data.parCorps[corpsId].lignes.length > 0;
      });
      var html = '<style>@media print{.lav2-actions{display:none!important}}</style>' +
        '<div class="lav2-actions" style="display:flex;gap:8px;margin-bottom:14px">' +
          '<button type="button" data-lav2-export style="padding:8px 16px;border-radius:8px;background:var(--accent,#4f8ef7);color:#fff;border:none;cursor:pointer">Exporter CSV</button>' +
          '<button type="button" onclick="window.print()" style="padding:8px 16px;border-radius:8px;background:var(--accent,#4f8ef7);color:#fff;border:none;cursor:pointer">Imprimer</button>' +
        '</div>';
      if (!corpsIds.length) {
        html += '<div style="padding:18px;border-radius:8px;background:var(--card-bg,var(--bg-card,#fff));color:var(--text,#111)">Aucune ligne d achat calculee</div>';
      } else {
        html += corpsIds.map(function(corpsId) { return renderTable(data.parCorps[corpsId]); }).join('');
        html += '<div style="text-align:right;font-size:1.1rem;font-weight:900;color:var(--text,#111)">Total general HT : ' + esc(fmtPrix(data.totalGeneral)) + '</div>';
      }
      container.innerHTML = html;
      var exportBtn = container.querySelector('[data-lav2-export]');
      if (exportBtn) exportBtn.addEventListener('click', function() { exportCSV(data); });
      return document.createTextNode('');
    },
  };
})();
