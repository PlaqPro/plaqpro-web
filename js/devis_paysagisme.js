/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Devis Paysagisme / Amenagement exterieur
//  devis_paysagisme.js
// ============================================================

(function() {
  'use strict';

  const FRAIS_GENERAUX = 1.12;
  const MARGE_SURVIE = 1.10;
  const MARGE_CIBLE = 1.30;

  const DevisPaysagisme = {
    _container: null,
    _containerId: null,
    _lastCalcul: null,
    _margeGlobale: 30,

    genererDevis(options) {
      options = options || {};
      const lotsSaisis = Array.isArray(options.lots) ? options.lots : [];
      const margeGlobale = n(options.margeGlobale, this._margeGlobale);
      const calcul = this.calcDevisComplet(lotsSaisis, margeGlobale);
      const config = getConfig();
      const numero = options.numero || nextNumero(config);
      const lignes = calcul.detailParLot.map(detail => {
        const prixVente = detail.prixVendu;
        const quantite = detail.quantite || 1;
        const prixUnitaire = quantite > 0 ? prixVente / quantite : prixVente;

        return {
          designation: detail.nom,
          poste: detail.nom,
          description: detail.description,
          quantite,
          unite: detail.unite,
          prixUnitaire: round2(prixUnitaire),
          total: round2(prixVente),
          baseHT: round2(detail.coutDirect),
          marge: round2(prixVente - detail.coutDirect),
          totalClient: round2(prixVente),
          tva: getTVA(),
          meta: {
            lotId: detail.lotId,
            optionsLot: detail.optionsLot,
            detailCalcul: detail.detail,
            coutDirect: detail.coutDirect,
            coutComplet: detail.coutComplet,
            prixMinimum: detail.prixMinimumLot,
            prixConseille: detail.prixConseilleLot,
          },
        };
      });
      const totalHT = lignes.reduce((sum, ligne) => sum + n(ligne.totalClient || ligne.total, 0), 0);
      const tva = getTVA();

      return {
        numero,
        objet: options.objet || 'Travaux de paysagisme et amenagement exterieur',
        clientId: options.clientId || null,
        chantierId: options.chantierId || null,
        date: options.date || new Date().toISOString().slice(0, 10),
        validite: options.validite || 30,
        statut: options.statut || 'Brouillon',
        lignes,
        totalHT: round2(totalHT),
        montantTVA: round2(totalHT * tva),
        totalTTC: round2(totalHT * (1 + tva)),
        tva,
        notes: options.notes || '',
        source: 'Pack Paysagisme',
        analyseInterne: {
          margeGlobale,
          coutDirect: calcul.coutDirect,
          coutComplet: calcul.coutComplet,
          prixMinimum: calcul.prixMinimum,
          prixConseille: calcul.prixConseille,
          prixAvecMargeGlobale: calcul.prixAvecMargeGlobale,
          margeAppliquee: calcul.margeAppliquee,
          margeEuro: calcul.margeEuro,
          margePct: calcul.margePct,
          detailParLot: calcul.detailParLot,
        },
      };
    },

    getHTML(containerId) {
      const html = this._buildHTML();
      if (containerId) {
        this._containerId = containerId;
        this._container = document.getElementById(containerId);
        if (this._container) {
          this._container.innerHTML = html;
          this._bind();
          this._refreshLotPrices();
        }
      }
      return html;
    },

    calcDevisComplet(lots, margeGlobale) {
      lots = Array.isArray(lots) ? lots : [];
      margeGlobale = n(margeGlobale, this._margeGlobale);
      const detailParLot = lots.map(item => this._calcLot(item, margeGlobale)).filter(Boolean);
      const coutDirect = detailParLot.reduce((sum, lot) => sum + lot.coutDirect, 0);
      const coutComplet = coutDirect * FRAIS_GENERAUX;
      const prixMinimum = coutComplet * MARGE_SURVIE;
      const prixConseille = coutComplet * MARGE_CIBLE;
      const prixAvecMargeGlobale = margeGlobale > 0 ? coutDirect * (1 + margeGlobale / 100) : prixConseille;
      const totalVendu = detailParLot.reduce((sum, lot) => sum + lot.prixVendu, 0);
      const margeEuro = totalVendu - coutDirect;
      const margePct = totalVendu > 0 ? margeEuro / totalVendu * 100 : 0;

      return {
        coutDirect: round2(coutDirect),
        coutComplet: round2(coutComplet),
        prixMinimum: round2(prixMinimum),
        prixConseille: round2(prixConseille),
        prixAvecMargeGlobale: round2(prixAvecMargeGlobale),
        margeAppliquee: margeGlobale > 0 ? margeGlobale : 'CDC',
        margeEuro: round2(margeEuro),
        margePct: round2(margePct),
        detailParLot,
      };
    },

    setMarge(pct) {
      this._margeGlobale = Math.max(0, n(pct, 0));
      if (this._container) {
        const input = this._container.querySelector('[data-devp-marge]');
        if (input && n(input.value, 0) !== this._margeGlobale) input.value = this._margeGlobale;
        this._refreshLotPrices();
        this._renderLiveMarge();
        const recap = this._container.querySelector('[data-devp-recap]');
        if (recap && recap.style.display !== 'none') this._afficherRecap();
      }
      if (window.App && typeof window.App.toast === 'function') {
        window.App.toast('Majoration sur coût mise à jour : ' + this._margeGlobale + '%', 'info');
      }
    },

    exporterRecap(devisId) {
      const devis = findDevis(devisId);
      if (!devis) {
        return '<div class="card"><p>Devis introuvable.</p></div>';
      }

      const analyse = devis.analyseInterne || {};
      const details = Array.isArray(analyse.detailParLot) ? analyse.detailParLot : [];
      const totalDirect = details.reduce((sum, lot) => sum + n(lot.coutDirect, 0), 0);
      const totalVendu = details.reduce((sum, lot) => sum + n(lot.prixVendu || lot.prixConseilleLot, 0), 0);
      const marge = totalVendu - totalDirect;
      const margePct = totalVendu > 0 ? marge / totalVendu * 100 : 0;

      return `
        <div class="card">
          <div class="calc-section-title">Recap interne paysagisme</div>
          <div style="overflow:auto">
            <table style="width:100%;border-collapse:collapse;min-width:720px">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border)">Lot</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Quantite</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Cout direct</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Prix vendu</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Marge €</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Marge %</th>
                </tr>
              </thead>
              <tbody>
                ${details.map(lot => recapRow(lot)).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <th style="text-align:left;padding:8px;border-top:2px solid var(--border)">Total general</th>
                  <th style="padding:8px;border-top:2px solid var(--border)"></th>
                  <th style="text-align:right;padding:8px;border-top:2px solid var(--border)">${fmt(totalDirect)}</th>
                  <th style="text-align:right;padding:8px;border-top:2px solid var(--border)">${fmt(totalVendu)}</th>
                  <th style="text-align:right;padding:8px;border-top:2px solid var(--border)">${fmt(marge)}</th>
                  <th style="text-align:right;padding:8px;border-top:2px solid var(--border)">${Math.round(margePct)} %</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `;
    },

    _buildHTML() {
      if (!window.PackPaysagisme || typeof window.PackPaysagisme.getLots !== 'function') {
        return '<div class="card"><p>PackPaysagisme doit etre charge avant DevisPaysagisme.</p></div>';
      }

      const lots = window.PackPaysagisme.getLots();
      const clients = getCollection('clients');
      const chantiers = getCollection('chantiers');

      return `
        <div class="card devis-paysagisme" style="display:flex;flex-direction:column;gap:16px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word;overflow:visible">
          <div>
            <h2 style="margin:0 0 4px;color:var(--text)">Devis paysagisme</h2>
            <p style="margin:0;color:var(--text-secondary,var(--text));font-size:13px">Selectionnez les lots, ajustez les quantites et creez un devis structure depuis le Pack Paysagisme.</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
            <div class="form-group">
              <label>Client</label>
              <select data-devp-client style="width:100%">
                <option value="">Selectionner un client</option>
                ${clients.map(client => `<option value="${escapeAttr(client.id)}">${escapeHtml(client.nom || client.raisonSociale || ('Client #' + client.id))}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Chantier</label>
              <select data-devp-chantier style="width:100%">
                <option value="">Selectionner un chantier</option>
                ${chantiers.map(chantier => `<option value="${escapeAttr(chantier.id)}">${escapeHtml(chantier.nom || chantier.titre || ('Chantier #' + chantier.id))}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Majoration sur coût (%)</label>
              <input type="number" min="0" step="1" value="${escapeAttr(this._margeGlobale)}" data-devp-marge oninput="DevisPaysagisme.setMarge(this.value)" style="width:100%">
            </div>
          </div>

          <div data-devp-live-marge style="border:1px solid var(--border);background:var(--bg-card);border-radius:var(--r-md,8px);padding:12px;color:var(--text)"></div>

          <div class="form-group">
            <label>Notes internes / contexte</label>
            <textarea data-devp-notes rows="3" style="width:100%" placeholder="Contraintes, hypotheses, exclusions, remarques chantier..."></textarea>
          </div>

          <div class="calc-section-title">Lots metier</div>
          <div data-devp-lots style="display:flex;flex-direction:column;gap:10px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word">
            ${lots.map(lot => this._lotHTML(lot)).join('')}
          </div>

          <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
            <button type="button" class="btn btn-secondary" data-devp-action="calculer">Calculer le devis</button>
            <button type="button" class="btn btn-primary" data-devp-action="creer">Creer le devis</button>
          </div>

          <div data-devp-recap style="display:none"></div>
        </div>
      `;
    },

    _lotHTML(lot) {
      return `
        <div class="card" data-devp-lot="${escapeAttr(lot.code || lot.id)}" style="padding:12px;border:1px solid var(--border)">
          <div class="devp-lot-grid" style="display:grid;grid-template-columns:auto minmax(0,1fr) minmax(100px,110px) minmax(110px,130px);gap:10px;align-items:start;min-width:0">
            <label style="display:flex;align-items:center;gap:8px;margin-top:4px">
              <input type="checkbox" data-devp-enabled>
              <span style="font-size:20px">${escapeHtml(lot.icone || '')}</span>
            </label>
            <div style="min-width:0;max-width:100%;word-wrap:break-word;overflow-wrap:break-word">
              <div style="font-weight:700;color:var(--text)">${escapeHtml(lot.nom)}</div>
              <div style="font-size:12px;color:var(--text-secondary,var(--text));margin-top:2px">${escapeHtml(lot.description || '')}</div>
              <div data-devp-options style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:10px">
                ${this._optionsHTML(lot.code || lot.id)}
              </div>
            </div>
            <div class="form-group" style="margin:0;min-width:0">
              <label>Quantite (${escapeHtml(lot.unite)})</label>
              <input type="number" min="0" step="0.01" value="1" data-devp-quantite>
            </div>
            <div style="text-align:right;min-width:0;word-wrap:break-word;overflow-wrap:break-word">
              <div style="font-size:12px;color:var(--text-secondary,var(--text))">Prix calcule</div>
              <div data-devp-prix style="font-weight:800;color:var(--accent);font-size:17px">0,00 €</div>
            </div>
          </div>
        </div>
      `;
    },

    _optionsHTML(lotId) {
      const fields = optionFields(lotId);
      return fields.map(field => {
        if (field.type === 'select') {
          return `
            <div class="form-group" style="margin:0">
              <label>${escapeHtml(field.label)}</label>
              <select data-devp-option="${escapeAttr(field.name)}">
                ${field.values.map(value => `<option value="${escapeAttr(value)}"${value === field.def ? ' selected' : ''}>${escapeHtml(value)}</option>`).join('')}
              </select>
            </div>
          `;
        }

        if (field.type === 'checkbox') {
          return `
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text);margin-top:24px">
              <input type="checkbox" data-devp-option="${escapeAttr(field.name)}"${field.def ? ' checked' : ''}>
              ${escapeHtml(field.label)}
            </label>
          `;
        }

        return `
          <div class="form-group" style="margin:0">
            <label>${escapeHtml(field.label)}</label>
            <input type="number" step="${escapeAttr(field.step || '0.01')}" value="${escapeAttr(field.def)}" data-devp-option="${escapeAttr(field.name)}">
          </div>
        `;
      }).join('');
    },

    _bind() {
      if (!this._container) return;
      this._container.addEventListener('input', event => {
        if (event.target && event.target.matches('[data-devp-marge]')) return;
        this._refreshLotPrices();
        this._renderLiveMarge();
      });
      this._container.addEventListener('change', event => {
        if (event.target && event.target.matches('[data-devp-marge]')) {
          this.setMarge(event.target.value);
          return;
        }
        this._refreshLotPrices();
        this._renderLiveMarge();
      });
      this._container.addEventListener('click', event => {
        const target = event.target.closest('[data-devp-action]');
        if (!target) return;
        const action = target.getAttribute('data-devp-action');
        if (action === 'calculer') this._afficherRecap();
        if (action === 'creer') this._creerDevis();
      });
    },

    _refreshLotPrices() {
      if (!this._container || !window.PackPaysagisme) return;
      this._container.querySelectorAll('[data-devp-lot]').forEach(row => {
        const lotId = row.getAttribute('data-devp-lot');
        const lot = findLot(lotId);
        const enabled = !!row.querySelector('[data-devp-enabled]')?.checked;
        const prixEl = row.querySelector('[data-devp-prix]');
        if (!lot || !prixEl) return;
        if (!enabled) {
          prixEl.textContent = '0,00 €';
          return;
        }
        const quantite = n(row.querySelector('[data-devp-quantite]')?.value, 0);
        const optionsLot = readOptions(row);
        const detail = this._calcLot({ lotId, quantite, optionsLot }, this._margeGlobale);
        prixEl.textContent = detail ? fmt(detail.prixVendu) : '0,00 €';
      });
      this._renderLiveMarge();
    },

    _collectLots() {
      if (!this._container) return [];
      const lots = [];
      this._container.querySelectorAll('[data-devp-lot]').forEach(row => {
        if (!row.querySelector('[data-devp-enabled]')?.checked) return;
        const lotId = row.getAttribute('data-devp-lot');
        const lot = findLot(lotId);
        if (!lot) return;
        const quantite = n(row.querySelector('[data-devp-quantite]')?.value, 0);
        if (quantite <= 0) return;
        const optionsLot = readOptions(row);
        lots.push({
          lotId,
          quantite,
          optionsLot,
        });
      });
      return lots;
    },

    _renderLiveMarge() {
      if (!this._container) return;
      const node = this._container.querySelector('[data-devp-live-marge]');
      if (!node) return;
      const lots = this._collectLots();
      const calcul = this.calcDevisComplet(lots, this._margeGlobale);
      const margeReelle = margeReelleDepuisMajoration(this._margeGlobale);
      node.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
          <div>
            <div style="font-size:12px;color:var(--text-secondary,var(--text))">Prix majoré de ${escapeHtml(this._margeGlobale)}% sur coût</div>
            <div style="font-size:22px;font-weight:800;color:var(--accent)">${fmt(calcul.prixAvecMargeGlobale)}</div>
            <div style="font-size:12px;color:var(--text-secondary,var(--text));margin-top:4px">Majoration de ${escapeHtml(this._margeGlobale)}% sur coût direct = marge réelle de ${fmtNumber(margeReelle)}% sur prix de vente</div>
          </div>
          <div style="font-size:13px;color:var(--text-secondary,var(--text));text-align:right">
            Coût direct : <strong style="color:var(--text)">${fmt(calcul.coutDirect)}</strong><br>
            Marge réelle : <strong style="color:var(--text)">${fmt(calcul.margeEuro)} (${fmtNumber(calcul.margePct)} %)</strong>
          </div>
        </div>
      `;
    },

    _afficherRecap() {
      const lots = this._collectLots();
      const recap = this._container.querySelector('[data-devp-recap]');
      if (!recap) return;
      if (!lots.length) {
        recap.style.display = 'block';
        recap.innerHTML = '<div class="card" style="margin-top:12px">Selectionnez au moins un lot.</div>';
        toast('Selectionnez au moins un lot', 'warning');
        return;
      }

      const calcul = this.calcDevisComplet(lots, this._margeGlobale);
      this._lastCalcul = calcul;
      const margeReelle = margeReelleDepuisMajoration(this._margeGlobale);
      const prixMajoreLabel = calcul.margeAppliquee === 'CDC'
        ? 'Prix conseillé CDC'
        : `Prix majoré de ${calcul.margeAppliquee}% sur coût`;
      recap.style.display = 'block';
      recap.innerHTML = `
        <div class="card" style="margin-top:12px">
          <div class="calc-section-title">Recapitulatif interne</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
            ${metric('Cout direct', calcul.coutDirect)}
            ${metric('Cout complet', calcul.coutComplet)}
            ${metric('Prix minimum', calcul.prixMinimum)}
            ${metric('Prix conseille', calcul.prixConseille)}
            ${metric(prixMajoreLabel, calcul.prixAvecMargeGlobale)}
            ${metric('Marge réelle sur prix de vente', `${fmt(calcul.margeEuro)} (${fmtNumber(calcul.margePct)} %)`, true)}
          </div>
          <div style="margin-top:10px;color:var(--text-secondary,var(--text));font-size:13px">
            Majoration de ${escapeHtml(this._margeGlobale)}% sur coût direct = marge réelle de ${fmtNumber(margeReelle)}% sur prix de vente.
          </div>
          <div style="overflow:auto;margin-top:12px">
            <table style="width:100%;border-collapse:collapse;min-width:620px">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;border-bottom:1px solid var(--border)">Lot</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Cout direct</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Prix calcule</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">Marge</th>
                </tr>
              </thead>
              <tbody>
                ${calcul.detailParLot.map(lot => summaryRow(lot)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    _creerDevis() {
      const lots = this._collectLots();
      if (!lots.length) {
        toast('Selectionnez au moins un lot', 'warning');
        return;
      }

      const clientId = n(this._container.querySelector('[data-devp-client]')?.value, 0) || null;
      const chantierId = n(this._container.querySelector('[data-devp-chantier]')?.value, 0) || null;
      const margeGlobale = n(this._container.querySelector('[data-devp-marge]')?.value, this._margeGlobale);
      const notes = this._container.querySelector('[data-devp-notes]')?.value || '';

      const devis = this.genererDevis({ clientId, chantierId, lots, margeGlobale, notes });
      if (!window.DB || typeof window.DB.addDevis !== 'function') {
        toast('DB.addDevis indisponible', 'error');
        return;
      }

      const saved = window.DB.addDevis(devis);
      toast(`Devis ${saved.numero || devis.numero} cree`, 'success');
      if (window.App && typeof window.App.navigate === 'function') {
        window.App.navigate('devis');
      }
    },

    _calcLot(item, margeGlobale) {
      const lot = findLot(item.lotId || item.code);
      if (!lot || typeof lot.calcPrix !== 'function') return null;

      margeGlobale = n(margeGlobale, this._margeGlobale);
      const quantite = n(item.quantite, 0);
      const optionsLot = item.optionsLot || {};
      const calc = lot.calcPrix(quantite, optionsLot);
      const coutMateriel = n(optionsLot.coutMateriel, 0);
      const coutEvacuation = n(optionsLot.coutEvacuation, 0);
      const coutSousTraitance = n(optionsLot.coutSousTraitance, 0);
      const coutDirect = n(calc.prixFournitures, 0) + n(calc.prixMO, 0) + coutMateriel + coutEvacuation + coutSousTraitance;
      const coutComplet = coutDirect * FRAIS_GENERAUX;
      const prixMinimumLot = coutComplet * MARGE_SURVIE;
      const prixConseilleLot = coutComplet * MARGE_CIBLE;
      const prixVendu = margeGlobale > 0 ? coutDirect * (1 + margeGlobale / 100) : prixConseilleLot;

      return {
        lotId: lot.code || item.lotId,
        nom: lot.nom,
        unite: lot.unite,
        description: lot.description || '',
        quantite,
        optionsLot,
        prixFournitures: round2(calc.prixFournitures),
        prixMO: round2(calc.prixMO),
        coutMateriel: round2(coutMateriel),
        coutEvacuation: round2(coutEvacuation),
        coutSousTraitance: round2(coutSousTraitance),
        coutDirect: round2(coutDirect),
        coutComplet: round2(coutComplet),
        prixMinimumLot: round2(prixMinimumLot),
        prixConseilleLot: round2(prixConseilleLot),
        prixVendu: round2(prixVendu),
        margeAppliquee: margeGlobale > 0 ? margeGlobale : 'CDC',
        margeEuro: round2(prixVendu - coutDirect),
        margePct: prixVendu > 0 ? round2((prixVendu - coutDirect) / prixVendu * 100) : 0,
        detail: Array.isArray(calc.detail) ? calc.detail.slice() : [],
      };
    },
  };

  function optionFields(lotId) {
    const map = {
      DIAGNOSTIC: [
        { name: 'heures', label: 'Heures', def: 2.5, step: '0.5' },
        { name: 'fraisDeplacement', label: 'Frais deplacement', def: 25, step: '1' },
      ],
      ABATTAGE_ARBRE: [
        { name: 'hauteur', label: 'Hauteur (m)', def: 4, step: '0.5' },
        { name: 'difficulte', label: 'Difficulte 1-3', def: 2, step: '1' },
        { name: 'dessouchage', label: 'Dessouchage', type: 'checkbox', def: false },
        { name: 'evacuation', label: 'Evacuation', type: 'checkbox', def: true },
      ],
      TERRASSEMENT: [
        { name: 'typeSol', label: 'Type sol', type: 'select', values: ['meuble', 'argileux', 'pierreux'], def: 'meuble' },
        { name: 'pente', label: 'Pente (%)', def: 0, step: '1' },
      ],
      MACONNERIE_EXT: [
        { name: 'type', label: 'Type', type: 'select', values: ['mur', 'muret', 'bac'], def: 'mur' },
        { name: 'enduit', label: 'Enduit', type: 'checkbox', def: true },
        { name: 'couvertine', label: 'Couvertine (ml)', def: 0, step: '0.5' },
      ],
      DALLE_BETON: [
        { name: 'epaisseur', label: 'Epaisseur (cm)', def: 12, step: '1' },
        { name: 'type', label: 'Type', type: 'select', values: ['standard', 'desactive', 'taloche'], def: 'standard' },
      ],
      BETON_DESACTIVE: [
        { name: 'epaisseur', label: 'Epaisseur (cm)', def: 12, step: '1' },
        { name: 'pente', label: 'Pente (%)', def: 0, step: '1' },
        { name: 'risqueMeteo', label: 'Risque meteo', type: 'checkbox', def: false },
      ],
      PAREMENT: [
        { name: 'materiau', label: 'Materiau', type: 'select', values: ['ardoise', 'pierre', 'plaquettes'], def: 'ardoise' },
        { name: 'angles', label: 'Angles (u)', def: 0, step: '1' },
        { name: 'chutes', label: 'Chutes (%)', def: 10, step: '1' },
      ],
      EAU_ARROSAGE: [
        { name: 'longueurReseau', label: 'Reseau (ml)', def: 10, step: '0.5' },
        { name: 'programmateur', label: 'Programmateur', type: 'checkbox', def: false },
      ],
      ELECTRICITE_EXT: [
        { name: 'longueurGaines', label: 'Gaines (ml)', def: 10, step: '0.5' },
        { name: 'sousTraitance', label: 'Sous-traitance', def: 0, step: '10' },
      ],
      VEGETALISATION: [
        { name: 'typeGazon', label: 'Gazon', type: 'select', values: ['non', 'semis', 'rouleau'], def: 'non' },
        { name: 'nbVegetaux', label: 'Vegetaux (u)', def: 0, step: '1' },
        { name: 'prixVegetalMoyen', label: 'Prix vegetal moy.', def: '', step: '1' },
        { name: 'paillage', label: 'Paillage / galets', type: 'checkbox', def: true },
      ],
      OUVRAGES_SPECIAUX: [
        { name: 'surface', label: 'Surface (m2)', def: 4, step: '0.5' },
        { name: 'complexite', label: 'Complexite 1-3', def: 2, step: '1' },
      ],
      NETTOYAGE_FINAL: [
        { name: 'niveau', label: 'Niveau 1-3', def: 2, step: '1' },
      ],
    };
    return map[lotId] || [];
  }

  function readOptions(row) {
    const options = {};
    row.querySelectorAll('[data-devp-option]').forEach(input => {
      const key = input.getAttribute('data-devp-option');
      if (input.type === 'checkbox') options[key] = input.checked;
      else if (input.tagName === 'SELECT') options[key] = input.value;
      else options[key] = n(input.value, 0);
    });
    return options;
  }

  function findLot(lotId) {
    if (!window.PackPaysagisme || typeof window.PackPaysagisme.getLots !== 'function') return null;
    return window.PackPaysagisme.getLots().find(lot => (lot.code || lot.id) === lotId) || null;
  }

  function findDevis(devisId) {
    const devis = getCollection('devis');
    return devis.find(d => String(d.id) === String(devisId) || String(d.numero) === String(devisId));
  }

  function getCollection(name) {
    if (!window.DB) return [];
    if (Array.isArray(window.DB[name])) return window.DB[name];
    if (typeof window.DB[`get${capitalize(name)}`] === 'function') return window.DB[`get${capitalize(name)}`]() || [];
    return [];
  }

  function getConfig() {
    return window.DB && typeof window.DB.getConfig === 'function' ? window.DB.getConfig() || {} : {};
  }

  function getTVA() {
    if (window.DB && typeof window.DB.getRatio === 'function') return window.DB.getRatio('TVA_TRAVAUX') || 0.10;
    return 0.10;
  }

  function nextNumero(config) {
    const prefix = config.prefixeDevis || 'DEV-';
    const year = new Date().getFullYear();
    const count = getCollection('devis').length + 1;
    return `${prefix}${year}-${String(count).padStart(4, '0')}`;
  }

  function recapRow(lot) {
    const prixVendu = n(lot.prixVendu || lot.prixConseilleLot, 0);
    const coutDirect = n(lot.coutDirect, 0);
    const marge = prixVendu - coutDirect;
    const margePct = prixVendu > 0 ? marge / prixVendu * 100 : 0;
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid var(--border)">${escapeHtml(lot.nom)}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">${fmt(lot.quantite)} ${escapeHtml(lot.unite || '')}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">${fmt(coutDirect)}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">${fmt(prixVendu)}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">${fmt(marge)}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">${Math.round(margePct)} %</td>
      </tr>
    `;
  }

  function summaryRow(lot) {
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid var(--border)">${escapeHtml(lot.nom)}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">${fmt(lot.coutDirect)}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">${fmt(lot.prixVendu || lot.prixConseilleLot)}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid var(--border)">${fmt(lot.margeEuro)} (${Math.round(lot.margePct || 0)} %)</td>
      </tr>
    `;
  }

  function metric(label, value) {
    const displayValue = typeof value === 'string' ? value : fmt(value);
    return `
      <div style="border:1px solid var(--border);border-radius:var(--r-md,8px);background:var(--bg-card);padding:12px">
        <div style="font-size:12px;color:var(--text-secondary,var(--text))">${escapeHtml(label)}</div>
        <div style="font-size:20px;font-weight:800;color:var(--accent)">${escapeHtml(displayValue)}</div>
      </div>
    `;
  }

  function margeReelleDepuisMajoration(pct) {
    pct = n(pct, 0);
    return Math.round((pct / (100 + pct)) * 100 * 10) / 10;
  }

  function toast(message, type) {
    if (window.App && typeof window.App.toast === 'function') window.App.toast(message, type || 'success');
  }

  function fmt(value) {
    if (window.Calculs && typeof window.Calculs.fmt === 'function') return window.Calculs.fmt(value || 0);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  function fmtNumber(value) {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  function n(value, def) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : (def || 0);
  }

  function round2(value) {
    return Math.round((value || 0) * 100) / 100;
  }

  function capitalize(value) {
    return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
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

  window.DevisPaysagisme = DevisPaysagisme;
})();
