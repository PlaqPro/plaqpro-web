/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Templates CSV Paysagisme
//  template_csv_paysagisme.js
// ============================================================

(function() {
  'use strict';

  const HEADER = 'reference;designation;unite;prixHT;categorie;fournisseur;notes';
  const WILLEMSE_HEADER = 'reference_fournisseur;nom_produit;taille_conditionnement;unite;prix_ht;categorie_plaqpro;ean;disponibilite;notes';

  const TemplateCsvPaysagisme = {
    templateVegetaux() {
      return HEADER + '\n';
    },

    templateFournitures() {
      return HEADER + '\n';
    },

    templateWillemse() {
      return WILLEMSE_HEADER + '\n';
    },

    exempleVegetaux() {
      return [
        HEADER,
        'VEG-CORDYLINE-60;Cordyline australis 60cm;u;28.50;VEGETAUX;Willemse;Plante graphique pour bac decoratif',
        'VEG-CORDYLINE-90;Cordyline australis 90cm;u;42.00;VEGETAUX;Willemse;Sujet plus haut pour massif',
        'VEG-OLIVIER-120;Olivier 120/140cm;u;95.00;VEGETAUX;Pepiniere locale;Prevoir tuteurage',
        'VEG-ROMARIN-U;Romarin officinal;u;6.50;VEGETAUX;Pepiniere locale;Aromatique resistant',
        'VEG-POURPIER-U;Pourpier decoratif;u;3.20;VEGETAUX;Pepiniere locale;Floraison estivale',
        'VEG-LAVANDE-U;Lavande vraie;u;5.80;VEGETAUX;Pepiniere locale;Massif sec',
        'VEG-GAURA-U;Gaura blanc;u;6.20;VEGETAUX;Pepiniere locale;Vivace fleurie',
        'VEG-PHOTINIA-U;Photinia 80/100cm;u;18.00;VEGETAUX;Willemse;Haie persistante',
        'VEG-LAURIER-U;Laurier sauce 80cm;u;16.00;VEGETAUX;Pepiniere locale;Persistant',
        'VEG-GRAMINEE-U;Graminee decorative;u;7.50;VEGETAUX;Pepiniere locale;Massif contemporain',
        'VEG-BAMBOU-U;Bambou non tracant;u;32.00;VEGETAUX;Willemse;Prevoir barriere si doute',
        'VEG-ERABLE-U;Erable du Japon petit sujet;u;48.00;VEGETAUX;Pepiniere locale;Exposition mi-ombre',
        'VEG-HORTENSIA-U;Hortensia;u;14.50;VEGETAUX;Willemse;Sol frais',
        'VEG-THYM-U;Thym rampant;u;4.20;VEGETAUX;Pepiniere locale;Couvre-sol sec',
        'VEG-FETUQUE-U;Fetuque bleue;u;5.10;VEGETAUX;Pepiniere locale;Graminee basse',
        'VEG-GAZON-ROULEAU;Gazon rouleau;m2;4.50;VEGETAUX;Fournisseur gazon;Prix hors pose',
        'VEG-SEMENCE-SPORT;Semences gazon rustique;kg;8.00;VEGETAUX;Fournisseur gazon;Dose selon fiche technique',
        'VEG-TERREAU-70L;Terreau plantation 70L;sac;9.90;VEGETAUX;Negoce;Amendement plantation',
        'VEG-TERRE-VEG;Terre vegetale criblee;m3;35.00;TERRASSEMENT;Carriere locale;Livraison a chiffrer',
        'VEG-GEOTEXTILE;Geotextile anti-repousse;m2;1.20;TERRASSEMENT;Negoce;Sous galets ou paillage',
      ].join('\n') + '\n';
    },

    telechargerCSV(contenu, nomFichier) {
      nomFichier = nomFichier || 'template_paysagisme.csv';
      const blob = new Blob(['\ufeff' + (contenu || '')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomFichier;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast(`Téléchargement ${nomFichier} lancé`, 'success');
    },

    getHTML(containerId) {
      const html = this._buildHTML();
      if (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = html;
          this._bind(container);
        }
      }
      return html;
    },

    _buildHTML() {
      return `
        <div class="card template-csv-paysagisme" style="display:flex;flex-direction:column;gap:16px">
          <div>
            <h2 style="margin:0 0 4px;color:var(--text)">Templates CSV paysagisme</h2>
            <p style="margin:0;color:var(--text-secondary,var(--text));font-size:13px">Téléchargez un modèle, complétez vos prix HT, puis importez dans le catalogue paysagisme.</p>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn-secondary" data-tcsv-action="vegetaux">Végétaux vide</button>
            <button type="button" class="btn btn-secondary" data-tcsv-action="fournitures">Fournitures vide</button>
            <button type="button" class="btn btn-secondary" data-tcsv-action="willemse">Template Willemse</button>
            <button type="button" class="btn btn-primary" data-tcsv-action="exemple">Exemple végétaux</button>
          </div>

          <div style="border:1px solid var(--border);background:var(--bg-card);border-radius:var(--r-md,8px);padding:12px;color:var(--text);font-size:13px">
            Format Willemse attendu fin août 2026.
          </div>

          <div>
            <div class="calc-section-title">Import CSV</div>
            <textarea data-tcsv-import rows="9" style="width:100%;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:10px;color:var(--text);font-family:var(--font-mono,monospace)" placeholder="${escapeAttr(HEADER)}"></textarea>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;flex-wrap:wrap">
              <button type="button" class="btn btn-primary" data-tcsv-action="importer">Importer</button>
            </div>
            <div data-tcsv-result style="display:none;margin-top:10px;border:1px solid var(--border);background:var(--bg-card);border-radius:var(--r-md,8px);padding:10px;color:var(--text);font-size:13px"></div>
          </div>
        </div>
      `;
    },

    _bind(container) {
      container.addEventListener('click', event => {
        const target = event.target.closest('[data-tcsv-action]');
        if (!target) return;

        const action = target.getAttribute('data-tcsv-action');
        if (action === 'vegetaux') this.telechargerCSV(this.templateVegetaux(), 'template_vegetaux_paysagisme.csv');
        if (action === 'fournitures') this.telechargerCSV(this.templateFournitures(), 'template_fournitures_paysagisme.csv');
        if (action === 'willemse') this.telechargerCSV(this.templateWillemse(), 'template_willemse_paysagisme.csv');
        if (action === 'exemple') this.telechargerCSV(this.exempleVegetaux(), 'exemple_vegetaux_paysagisme.csv');
        if (action === 'importer') this._importer(container);
      });
    },

    _importer(container) {
      const textarea = container.querySelector('[data-tcsv-import]');
      const result = container.querySelector('[data-tcsv-result]');
      const contenu = textarea ? textarea.value : '';

      if (!window.CataloguePaysagisme || typeof window.CataloguePaysagisme.importerCSV !== 'function') {
        showResult(result, 'CataloguePaysagisme indisponible : import impossible.', 'warning');
        toast('CataloguePaysagisme indisponible', 'warning');
        return 0;
      }

      const count = window.CataloguePaysagisme.importerCSV(contenu);
      showResult(result, `${count} article(s) importé(s) dans le catalogue paysagisme.`, count ? 'success' : 'warning');
      toast(`${count} article(s) importé(s)`, count ? 'success' : 'warning');
      return count;
    },
  };

  function showResult(node, message, type) {
    if (!node) return;
    node.style.display = 'block';
    node.style.borderColor = type === 'success' ? '#10B981' : '#F59E0B';
    node.style.background = type === 'success' ? 'rgba(16,185,129,0.10)' : 'rgba(245,158,11,0.12)';
    node.textContent = message;
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

  window.TemplateCsvPaysagisme = TemplateCsvPaysagisme;
})();
