/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Checklists Paysagisme
//  checklist_paysagisme.js
// ============================================================

(function() {
  'use strict';

  const STORAGE_KEY = 'plaqpro_checklists_paysagisme';

  const ChecklistPaysagisme = {
    CHECKLISTS: {
      terrassement() {
        return build('terrassement', [
          ['Accès', 'Accès camion vérifié', true],
          ['Accès', 'Accès benne ou remorque vérifié', true],
          ['Accès', 'Largeur de passage mesurée', false],
          ['Accès', 'Distance camion-zone travaux estimée', false],
          ['Accès', 'Stationnement autorisé ou solution prévue', true],
          ['Sécurité', 'DICT réseaux réalisée si terrassement concerné', true],
          ['Sécurité', 'Réseaux visibles photographiés et signalés', true],
          ['Sol', 'Nature du sol sondée ou estimée', true],
          ['Sol', 'Présence racines, souches ou blocs prise en compte', true],
          ['Sol', 'Sol humide ou argileux majoré', false],
          ['Métré', 'Surface ou volume calculé', true],
          ['Métré', 'Profondeur moyenne validée', true],
          ['Métré', 'Pente mesurée ou estimée', true],
          ['Exécution', 'Mini-pelle adaptée au passage', true],
          ['Exécution', 'Compactage prévu si nécessaire', true],
          ['Exécution', 'Géotextile prévu si besoin', false],
          ['Exécution', 'Drainage prévu si besoin', true],
          ['Évacuation', 'Volume foisonné estimé', true],
          ['Évacuation', 'Évacuation terre prévue', true],
          ['Évacuation', 'Coût déchetterie ou benne intégré', true],
          ['Évacuation', 'Temps chargement/déchargement intégré', false],
          ['Client', 'Zones conservées protégées', false],
          ['Client', 'Voisinage et mitoyenneté contrôlés', true],
          ['Client', 'Remise en état accès prévue', false],
          ['Marge', 'Alea sol/réseaux intégré au prix', true],
        ]);
      },

      dalle_beton() {
        return build('dalle_beton', [
          ['Support', 'Décaissement prévu', true],
          ['Support', 'Fond de forme contrôlé', true],
          ['Support', 'Hérisson ou couche drainante prévue', true],
          ['Support', 'Compactage prévu', true],
          ['Support', 'Géotextile prévu si nécessaire', false],
          ['Coffrage', 'Coffrage prévu et chiffré', true],
          ['Coffrage', 'Niveaux et pentes définis', true],
          ['Béton', 'Épaisseur validée', true],
          ['Béton', 'Volume béton calculé', true],
          ['Béton', 'Treillis commandé', true],
          ['Béton', 'Joints de dilatation prévus', true],
          ['Béton', 'Toupie accessible', true],
          ['Béton', 'Pompe ou brouette prévue si accès difficile', true],
          ['Finition', 'Type finition validé avec client', false],
          ['Finition', 'Pente écoulement prévue', true],
          ['Finition', 'Protection périphériques/piscine prévue', true],
          ['Météo', 'Météo vérifiée avant coulage', true],
          ['Météo', 'Protection pendant séchage prévue', true],
          ['Nettoyage', 'Nettoyage final prévu', false],
          ['Marge', 'Alea reprise/fissuration intégré', true],
        ]);
      },

      vegetalisation() {
        return build('vegetalisation', [
          ['Sol', 'Terre végétale commandée', true],
          ['Sol', 'Terreau ou amendement prévu', true],
          ['Sol', 'Drainage prévu si bac ou sol lourd', true],
          ['Sol', 'Géotextile prévu si paillage minéral', false],
          ['Sol', 'Volume de remplissage calculé', true],
          ['Végétaux', 'Liste végétaux validée client', true],
          ['Végétaux', 'Taille et conditionnement vérifiés', false],
          ['Végétaux', 'Saison de plantation adaptée', true],
          ['Végétaux', 'Exposition soleil/ombre vérifiée', true],
          ['Végétaux', 'Compatibilité sol/plantes contrôlée', false],
          ['Végétaux', 'Tuteurage prévu si nécessaire', false],
          ['Gazon', 'Semis ou rouleau choisi', false],
          ['Gazon', 'Préparation sol gazon prévue', true],
          ['Paillage', 'Paillage ou galets chiffrés', true],
          ['Paillage', 'Épaisseur de paillage définie', false],
          ['Arrosage', 'Arrosage de reprise prévu', true],
          ['Arrosage', 'Point d’eau disponible ou option prévue', true],
          ['Garantie', 'Garantie reprise encadrée par écrit', true],
          ['Client', 'Consignes d’entretien prévues', true],
          ['Marge', 'Pertes, pots, sacs et transport intégrés', true],
        ]);
      },

      maconnerie_ext() {
        return build('maconnerie_ext', [
          ['Implantation', 'Limites et niveaux vérifiés', true],
          ['Implantation', 'Mitoyenneté contrôlée', true],
          ['Implantation', 'Autorisation mur/clôture vérifiée si besoin', true],
          ['Fondation', 'Fondation dimensionnée', true],
          ['Fondation', 'Fouille chiffrée', true],
          ['Fondation', 'Ferraillage prévu', true],
          ['Fondation', 'Béton fondation chiffré', true],
          ['Élévation', 'Blocs/parpaings quantifiés', true],
          ['Élévation', 'Mortier quantifié', true],
          ['Élévation', 'Chaînages ou poteaux prévus', true],
          ['Élévation', 'Hauteur validée client', false],
          ['Finition', 'Enduit ou crépi prévu', true],
          ['Finition', 'Couvertines/chaperons chiffrés', true],
          ['Finition', 'Angles et coupes intégrés', true],
          ['Finition', 'Protection sol et ouvrages existants prévue', false],
          ['Accès', 'Approvisionnement matériaux possible', true],
          ['Accès', 'Échafaudage ou plateforme prévu si hauteur', true],
          ['Réseaux', 'Caniveaux ou évacuations coordonnés', false],
          ['Déchets', 'Gravats et sacs évacués', true],
          ['Nettoyage', 'Nettoyage fin chantier prévu', false],
          ['Qualité', 'Temps de séchage/enduit anticipé', true],
          ['Marge', 'Alea support et reprises intégré', true],
        ]);
      },

      complete() {
        return build('complete', [
          ['Diagnostic', 'Visite chantier réalisée avec photos', true],
          ['Diagnostic', 'Client, accès, adresse et contraintes notés', true],
          ['Diagnostic', 'Réseaux/DICT vérifiés si besoin', true],
          ['Diagnostic', 'Mitoyenneté et voisinage sensibles identifiés', true],
          ['Diagnostic', 'Météo et saison prises en compte', true],
          ['Métré', 'Surfaces rectangulaires ou polygonales calculées', true],
          ['Métré', 'Volumes terrassement/remplissage calculés', true],
          ['Métré', 'Linéaires murs, bacs, caniveaux mesurés', true],
          ['Métré', 'Pentes et écoulements contrôlés', true],
          ['Préparation', 'Protections existants prévues', true],
          ['Préparation', 'Installation chantier chiffrée', true],
          ['Terrassement', 'Nature sol et évacuation intégrées', true],
          ['Terrassement', 'Compactage/drainage/géotextile étudiés', true],
          ['Béton', 'Coffrage, treillis, joints et finition prévus', true],
          ['Béton', 'Accès toupie/pompe ou manutention prévu', true],
          ['Maçonnerie', 'Fondations et ferraillage chiffrés', true],
          ['Maçonnerie', 'Enduit, couvertines et finitions chiffrés', true],
          ['Parement', 'Matériau, chutes, angles et colle prévus', true],
          ['VRD', 'Caniveaux, regards, évacuation eaux prévus', true],
          ['Eau', 'Point d’eau, purge et protection gel vérifiés', true],
          ['Électricité', 'Gaines/attentes et sous-traitance clarifiées', true],
          ['Végétaux', 'Liste végétaux et tailles validées', true],
          ['Végétaux', 'Saison, exposition et arrosage validés', true],
          ['Végétaux', 'Garantie reprise encadrée', true],
          ['Paillage', 'Galets, pouzzolane ou paillage calculés', false],
          ['Ouvrages spéciaux', 'Ouvrage sur mesure mesuré et validé', true],
          ['Sous-traitance', 'Devis sous-traitants reçus', true],
          ['Sous-traitance', 'Marge de coordination appliquée', true],
          ['Matériel', 'Mini-pelle, camion, location ou outillage valorisés', true],
          ['Main-d’œuvre', 'Temps équipe estimé par lot', true],
          ['Évacuation', 'Benne/déchetterie/transport chiffrés', true],
          ['Fournitures', 'Prix fournisseurs actualisés', false],
          ['Fournitures', 'Pertes et consommables intégrés', true],
          ['Planning', 'Durées, séchage et délais fournisseurs anticipés', false],
          ['Client', 'Options et exclusions écrites', true],
          ['Client', 'Conditions paiement et acompte prévus', false],
          ['Sécurité', 'Risques chantier et protections prévus', true],
          ['Réception', 'Nettoyage final et photos après prévus', false],
          ['Marge', 'Coût direct/coût complet/prix minimum contrôlés', true],
          ['Marge', 'Marge cible vérifiée avant envoi devis', true],
        ]);
      },
    },

    _state: loadState(),
    _container: null,
    _containerId: null,
    _type: 'complete',

    getHTML(containerId, type) {
      this._type = normalizeType(type || this._type);
      const html = this._buildHTML(this._type);
      if (containerId) {
        this._containerId = containerId;
        this._container = document.getElementById(containerId);
        if (this._container) {
          this._container.innerHTML = html;
          this._bind();
          this._renderDynamic();
        }
      }
      return html;
    },

    getScore(type) {
      type = normalizeType(type || this._type);
      const checklist = this._getChecklist(type);
      const checked = this._state[type] || {};
      const alertes = [];
      let valides = 0;

      checklist.forEach(item => {
        if (checked[item.id]) valides++;
        else if (item.critique) alertes.push(item.texte);
      });

      return {
        total: checklist.length,
        valides,
        score: checklist.length ? Math.round(valides / checklist.length * 100) : 0,
        alertes,
      };
    },

    reset(type) {
      type = normalizeType(type || this._type);
      this._state[type] = {};
      saveState(this._state);
      this._renderDynamic();
      toast('Checklist réinitialisée', 'success');
    },

    _getChecklist(type) {
      type = normalizeType(type);
      return this.CHECKLISTS[type] ? this.CHECKLISTS[type]() : this.CHECKLISTS.complete();
    },

    _buildHTML(type) {
      const checklist = this._getChecklist(type);
      const groups = groupByCategorie(checklist);
      return `
        <div class="card checklist-paysagisme" style="display:flex;flex-direction:column;gap:16px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word;overflow:visible">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
            <div>
              <h2 style="margin:0 0 4px;color:var(--text)">Checklist paysagisme</h2>
              <p style="margin:0;color:var(--text-secondary,var(--text));font-size:13px">Contrôle anti-oublis avant chiffrage et avant envoi devis.</p>
            </div>
            <select data-clp-type style="${inputStyle()}">
              ${Object.keys(this.CHECKLISTS).map(key => `<option value="${escapeAttr(key)}"${key === type ? ' selected' : ''}>${escapeHtml(labelType(key))}</option>`).join('')}
            </select>
          </div>

          <div data-clp-score style="border:1px solid var(--border);background:var(--bg-card);border-radius:var(--r-md,8px);padding:12px"></div>
          <div data-clp-alertes style="display:flex;flex-direction:column;gap:8px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word"></div>

          <div style="display:flex;flex-direction:column;gap:14px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word">
            ${Object.keys(groups).map(categorie => `
              <div style="border:1px solid var(--border);border-radius:var(--r-md,8px);background:var(--bg-card);padding:12px">
                <div class="calc-section-title">${escapeHtml(categorie)}</div>
                <div style="display:flex;flex-direction:column;gap:8px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word">
                  ${groups[categorie].map(item => this._itemHTML(type, item)).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn-secondary" data-clp-action="reset">Réinitialiser</button>
            <button type="button" class="btn btn-secondary" data-clp-action="all">Tout valider</button>
            <button type="button" class="btn btn-primary" data-clp-action="diagnostic">Ajouter au diagnostic</button>
          </div>
        </div>
      `;
    },

    _itemHTML(type, item) {
      const checked = !!(this._state[type] && this._state[type][item.id]);
      return `
        <label style="display:flex;gap:10px;align-items:flex-start;color:var(--text);font-size:13px">
          <input type="checkbox" data-clp-item="${escapeAttr(item.id)}"${checked ? ' checked' : ''} style="margin-top:2px">
          <span>
            ${escapeHtml(item.texte)}
            ${item.critique ? '<span style="color:#EF4444;font-weight:700;margin-left:6px">critique</span>' : ''}
          </span>
        </label>
      `;
    },

    _bind() {
      if (!this._container) return;
      this._container.addEventListener('change', event => {
        if (event.target.matches('[data-clp-type]')) {
          this._type = normalizeType(event.target.value);
          this._container.innerHTML = this._buildHTML(this._type);
          this._bind();
          this._renderDynamic();
          return;
        }
        if (event.target.matches('[data-clp-item]')) {
          const id = event.target.getAttribute('data-clp-item');
          this._state[this._type] = this._state[this._type] || {};
          this._state[this._type][id] = event.target.checked;
          saveState(this._state);
          this._renderDynamic();
        }
      });

      this._container.addEventListener('click', event => {
        const target = event.target.closest('[data-clp-action]');
        if (!target) return;
        const action = target.getAttribute('data-clp-action');
        if (action === 'reset') this.reset(this._type);
        if (action === 'all') this._toutValider();
        if (action === 'diagnostic') this._ajouterAuDiagnostic();
      });
    },

    _renderDynamic() {
      if (!this._container) return;
      const score = this.getScore(this._type);
      const scoreEl = this._container.querySelector('[data-clp-score]');
      const alertesEl = this._container.querySelector('[data-clp-alertes]');
      if (scoreEl) {
        scoreEl.innerHTML = `
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
            <div>
              <div style="font-size:12px;color:var(--text-secondary,var(--text))">Points validés</div>
              <div style="font-size:24px;font-weight:800;color:var(--accent)">${score.valides} / ${score.total}</div>
            </div>
            <div style="font-size:28px;font-weight:900;color:${score.score < 70 ? '#EF4444' : 'var(--accent)'}">${score.score} %</div>
          </div>
        `;
      }
      if (alertesEl) {
        alertesEl.innerHTML = score.alertes.length
          ? score.alertes.map(alerte => `<div style="border:1px solid #EF4444;background:rgba(239,68,68,0.10);color:var(--text);border-radius:var(--r-md,8px);padding:10px 12px;font-size:13px;font-weight:600">⚠️ Critique non validé : ${escapeHtml(alerte)}</div>`).join('')
          : '<div style="border:1px solid #10B981;background:rgba(16,185,129,0.10);color:var(--text);border-radius:var(--r-md,8px);padding:10px 12px;font-size:13px;font-weight:600">Aucune alerte critique active.</div>';
      }
    },

    _toutValider() {
      const checklist = this._getChecklist(this._type);
      this._state[this._type] = {};
      checklist.forEach(item => { this._state[this._type][item.id] = true; });
      saveState(this._state);
      if (this._container) {
        this._container.querySelectorAll('[data-clp-item]').forEach(input => { input.checked = true; });
      }
      this._renderDynamic();
      toast('Tous les points sont validés', 'success');
    },

    _ajouterAuDiagnostic() {
      const score = this.getScore(this._type);
      const payload = {
        type: this._type,
        date: new Date().toISOString(),
        score,
      };

      if (window.DiagnosticChantier && typeof window.DiagnosticChantier.getDiagnostic === 'function') {
        const diag = window.DiagnosticChantier.getDiagnostic();
        diag.checklistsPaysagisme = Array.isArray(diag.checklistsPaysagisme) ? diag.checklistsPaysagisme : [];
        diag.checklistsPaysagisme.push(payload);
        if (window.DiagnosticChantier._diagnostic) {
          window.DiagnosticChantier._diagnostic = diag;
        }
        toast('Checklist ajoutée au diagnostic courant', 'success');
        return payload;
      }

      try {
        window.localStorage.setItem('plaqpro_checklist_paysagisme_last_diagnostic', JSON.stringify(payload));
        toast('Diagnostic indisponible : checklist sauvegardée en attente', 'warning');
      } catch (e) {
        toast('Impossible d’ajouter la checklist au diagnostic', 'error');
      }
      return payload;
    },
  };

  function build(type, rows) {
    return rows.map((row, index) => ({
      id: `${type}_${index + 1}`,
      categorie: row[0],
      texte: row[1],
      critique: !!row[2],
    }));
  }

  function groupByCategorie(items) {
    return items.reduce((groups, item) => {
      groups[item.categorie] = groups[item.categorie] || [];
      groups[item.categorie].push(item);
      return groups;
    }, {});
  }

  function normalizeType(type) {
    return ChecklistPaysagisme.CHECKLISTS[type] ? type : 'complete';
  }

  function labelType(type) {
    const labels = {
      terrassement: 'Terrassement',
      dalle_beton: 'Dalle béton',
      vegetalisation: 'Végétalisation',
      maconnerie_ext: 'Maçonnerie extérieure',
      complete: 'Complète',
    };
    return labels[type] || type;
  }

  function loadState() {
    try {
      const raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    try {
      if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state || {}));
    } catch (e) {}
  }

  function inputStyle() {
    return 'background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:9px 12px;color:var(--text);min-width:190px';
  }

  function toast(message, type) {
    if (window.App && typeof window.App.toast === 'function') window.App.toast(message, type || 'success');
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  window.ChecklistPaysagisme = ChecklistPaysagisme;
})();
