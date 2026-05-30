/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Catalogue Paysagisme local
//  catalogue_paysagisme.js
// ============================================================

(function() {
  'use strict';

  const STORAGE_KEY = 'plaqpro_catalogue_paysagisme';

  const CATEGORIES = {
    TERRASSEMENT: 'Terrassement',
    BETON: 'Beton',
    MACONNERIE: 'Maconnerie',
    PAREMENT: 'Parement',
    VEGETAUX: 'Vegetaux',
    PAILLAGE: 'Paillage',
    EAU: 'Eau / arrosage',
    FINITIONS: 'Finitions',
  };

  const ARTICLES_DEFAUT = [
    { ref: 'TERRE-VEG-M3', designation: 'Terre vegetale', unite: 'm3', prixHT: 35, categorie: 'TERRASSEMENT' },
    { ref: 'SABLE-M3', designation: 'Sable', unite: 'm3', prixHT: 25, categorie: 'TERRASSEMENT' },
    { ref: 'GRAVIER-M3', designation: 'Gravier', unite: 'm3', prixHT: 28, categorie: 'TERRASSEMENT' },
    { ref: 'GEOTEXTILE-M2', designation: 'Geotextile', unite: 'm2', prixHT: 1.20, categorie: 'TERRASSEMENT' },
    { ref: 'REMBLAI-M3', designation: 'Remblai', unite: 'm3', prixHT: 18, categorie: 'TERRASSEMENT' },

    { ref: 'CIMENT-35KG', designation: 'Ciment 35kg', unite: 'sac', prixHT: 8, categorie: 'BETON' },
    { ref: 'GRAVIER-BETON-M3', designation: 'Gravier beton', unite: 'm3', prixHT: 32, categorie: 'BETON' },
    { ref: 'ADJUVANT-L', designation: 'Adjuvant beton', unite: 'L', prixHT: 6.5, categorie: 'BETON' },
    { ref: 'COLORANT-DESACTIVANT-L', designation: 'Colorant desactivant', unite: 'L', prixHT: 12, categorie: 'BETON' },

    { ref: 'BLOC-BETON-U', designation: 'Bloc beton', unite: 'u', prixHT: 1.35, categorie: 'MACONNERIE' },
    { ref: 'PARPAING-20-U', designation: 'Parpaing 20 cm', unite: 'u', prixHT: 1.20, categorie: 'MACONNERIE' },
    { ref: 'MORTIER-25KG', designation: 'Mortier 25kg', unite: 'sac', prixHT: 9.5, categorie: 'MACONNERIE' },
    { ref: 'ACIER-KG', designation: 'Acier ferraillage', unite: 'kg', prixHT: 1.2, categorie: 'MACONNERIE' },
    { ref: 'COFFRAGE-M2', designation: 'Coffrage', unite: 'm2', prixHT: 8, categorie: 'MACONNERIE' },

    { ref: 'ARDOISE-NAT-M2', designation: 'Ardoise naturelle', unite: 'm2', prixHT: 85, categorie: 'PAREMENT' },
    { ref: 'ARDOISE-M2', designation: 'Ardoise naturelle', unite: 'm2', prixHT: 85, categorie: 'PAREMENT' },
    { ref: 'PIERRE-RECONST-M2', designation: 'Pierre reconstituee', unite: 'm2', prixHT: 45, categorie: 'PAREMENT' },
    { ref: 'PLAQUETTES-M2', designation: 'Plaquettes de parement', unite: 'm2', prixHT: 48, categorie: 'PAREMENT' },
    { ref: 'GALETS-M3', designation: 'Galets', unite: 'm3', prixHT: 95, categorie: 'PAREMENT' },
    { ref: 'GRAVIER-DECO-M3', designation: 'Gravier deco', unite: 'm3', prixHT: 65, categorie: 'PAREMENT' },

    { ref: 'GAZON-ROULEAU-M2', designation: 'Gazon rouleau', unite: 'm2', prixHT: 4.50, categorie: 'VEGETAUX' },
    { ref: 'GAZON-ROUL-M2', designation: 'Gazon rouleau', unite: 'm2', prixHT: 4.50, categorie: 'VEGETAUX' },
    { ref: 'SEMENCES-GAZON-KG', designation: 'Semences gazon', unite: 'kg', prixHT: 8, categorie: 'VEGETAUX' },
    { ref: 'PLANT-MOY', designation: 'Vegetal moyen', unite: 'u', prixHT: 18, categorie: 'VEGETAUX' },
    { ref: 'ARBUSTE-U', designation: 'Arbustes', unite: 'u', prixHT: 18, categorie: 'VEGETAUX' },
    { ref: 'VIVACE-U', designation: 'Vivaces', unite: 'u', prixHT: 7.5, categorie: 'VEGETAUX' },
    { ref: 'OLIVIER-U', designation: 'Olivier', unite: 'u', prixHT: 95, categorie: 'VEGETAUX' },
    { ref: 'CORDYLINE-U', designation: 'Cordyline', unite: 'u', prixHT: 28.5, categorie: 'VEGETAUX' },
    { ref: 'ROMARIN-U', designation: 'Romarin', unite: 'u', prixHT: 6.5, categorie: 'VEGETAUX' },

    { ref: 'ECORCE-PIN-M3', designation: 'Ecorce de pin', unite: 'm3', prixHT: 35, categorie: 'PAILLAGE' },
    { ref: 'POUZZOLANE-M3', designation: 'Pouzzolane', unite: 'm3', prixHT: 42, categorie: 'PAILLAGE' },
    { ref: 'ARDOISE-PILEE-M3', designation: 'Ardoise pilee', unite: 'm3', prixHT: 78, categorie: 'PAILLAGE' },
    { ref: 'PAILLAGE-MINERAL-M3', designation: 'Paillage mineral', unite: 'm3', prixHT: 62, categorie: 'PAILLAGE' },

    { ref: 'TUYAU-PE-ML', designation: 'Tuyau PE', unite: 'ml', prixHT: 1.8, categorie: 'EAU' },
    { ref: 'RACCORDS-U', designation: 'Raccords', unite: 'u', prixHT: 3.5, categorie: 'EAU' },
    { ref: 'ROBINET-EXT-U', designation: 'Robinet exterieur', unite: 'u', prixHT: 28, categorie: 'EAU' },
    { ref: 'PROGRAMMATEUR-U', designation: 'Programmateur', unite: 'u', prixHT: 75, categorie: 'EAU' },
    { ref: 'GOUTTEURS-U', designation: 'Goutteurs', unite: 'u', prixHT: 0.45, categorie: 'EAU' },

    { ref: 'PLIOLITE-15L', designation: 'Peinture pliolite 15L', unite: 'bidon', prixHT: 65, categorie: 'FINITIONS' },
    { ref: 'ENDUIT-EXT-25KG', designation: 'Enduit exterieur 25kg', unite: 'sac', prixHT: 18, categorie: 'FINITIONS' },
    { ref: 'PRIMAIRE-L', designation: 'Primaire facade', unite: 'L', prixHT: 9.5, categorie: 'FINITIONS' },
    { ref: 'NETTOYANT-FACADE-L', designation: 'Nettoyant facade', unite: 'L', prixHT: 7.5, categorie: 'FINITIONS' },
  ];

  const CataloguePaysagisme = {
    CATEGORIES,
    ARTICLES_DEFAUT,
    _articles: [],
    _container: null,
    _containerId: null,
    _categorieActive: 'TERRASSEMENT',

    init() {
      this._articles = mergeArticles(ARTICLES_DEFAUT, this._loadStored());
      return this;
    },

    getArticles(categorie) {
      this._ensureLoaded();
      const articles = categorie ? this._articles.filter(article => article.categorie === categorie) : this._articles;
      return articles.map(cloneArticle);
    },

    getArticle(ref) {
      this._ensureLoaded();
      const article = this._articles.find(item => item.ref === ref);
      return article ? cloneArticle(article) : null;
    },

    getPrix(ref) {
      const article = this.getArticle(ref);
      return article ? n(article.prixHT, 0) : 0;
    },

    setPrix(ref, prix) {
      this._ensureLoaded();
      const article = this._articles.find(item => item.ref === ref);
      if (!article) return false;
      article.prixHT = round2(n(prix, 0));
      this._save();
      this._renderTable();
      return true;
    },

    importerCSV(texte) {
      this._ensureLoaded();
      const lignes = String(texte || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      const premiereLigne = lignes.length ? parseCSVLine(lignes[0]).join(';').toLowerCase() : '';
      const formatWillemse = premiereLigne.indexOf('reference_fournisseur') >= 0 || premiereLigne.indexOf('nom_produit') >= 0;
      const formatEnrichi = premiereLigne.indexOf('prixbas') >= 0 && premiereLigne.indexOf('prixmoyen') >= 0 && premiereLigne.indexOf('prixhaut') >= 0;
      const formatEnrichiExport = formatEnrichi && premiereLigne.indexOf('prixht') >= 0;
      const formatStandard = premiereLigne.indexOf('reference') >= 0 && premiereLigne.indexOf('designation') >= 0;
      const startIndex = formatWillemse || formatEnrichi || formatStandard ? 1 : 0;
      let count = 0;
      let ignoredPrix = 0;

      lignes.slice(startIndex).forEach(ligne => {
        const cols = parseCSVLine(ligne);
        if (formatWillemse && cols.length < 6) return;
        if (formatEnrichi && cols.length < 7) return;
        if (!formatWillemse && cols.length < 4) return;

        const article = formatWillemse
          ? normalizeArticle({
              ref: cols[0],
              designation: cols[1],
              unite: cols[3],
              prixHT: parsePrice(cols[4]),
              categorie: cols[5] || 'VEGETAUX',
            })
          : formatEnrichi
            ? (formatEnrichiExport
              ? normalizeArticle({
                  ref: cols[0],
                  designation: cols[1],
                  unite: cols[2],
                  prixHT: parsePrice(cols[3]),
                  categorie: cols[4] || 'VEGETAUX',
                  prixBas: parsePrice(cols[5]),
                  prixMoyen: parsePrice(cols[6]),
                  prixHaut: parsePrice(cols[7]),
                  source: cols[8] || '',
                  dateMaj: cols[9] || '',
                  notes: cols[10] || '',
                })
              : normalizeArticle({
                  ref: cols[0],
                  designation: cols[1],
                  unite: cols[2],
                  prixHT: parsePrice(cols[4]),
                  prixBas: parsePrice(cols[3]),
                  prixMoyen: parsePrice(cols[4]),
                  prixHaut: parsePrice(cols[5]),
                  categorie: cols[6] || 'VEGETAUX',
                  source: cols[7] || '',
                  dateMaj: cols[8] || '',
                  notes: cols[9] || '',
                }))
          : normalizeArticle({
              ref: cols[0],
              designation: cols[1],
              unite: cols[2],
              prixHT: parsePrice(cols[3]),
              categorie: cols[4] || 'VEGETAUX',
            });
        if (!article.ref || !article.designation) return;
        if (n(article.prixHT, 0) <= 0) {
          ignoredPrix++;
          return;
        }
        upsertArticle(this._articles, article);
        count++;
      });

      this._save();
      this._render();
      this._lastImportStats = { importes: count, ignoresPrix: ignoredPrix };
      if (window.App && typeof window.App.toast === 'function') {
        window.App.toast(`${count} articles importés, ${ignoredPrix} ignorés (prix manquant)`, count ? 'success' : 'warning');
      }
      return count;
    },

    exporterCSV() {
      this._ensureLoaded();
      const header = 'reference;designation;unite;prixHT;categorie;prixBas;prixMoyen;prixHaut;source;dateMaj;notes';
      const rows = this._articles.map(article => [
        csvEscape(article.ref),
        csvEscape(article.designation),
        csvEscape(article.unite),
        String(round2(article.prixHT)).replace('.', ','),
        csvEscape(article.categorie),
        String(round2(article.prixBas)).replace('.', ','),
        String(round2(article.prixMoyen || article.prixHT)).replace('.', ','),
        String(round2(article.prixHaut)).replace('.', ','),
        csvEscape(article.source),
        csvEscape(article.dateMaj),
        csvEscape(article.notes),
      ].join(';'));
      return [header].concat(rows).join('\n');
    },

    getHTML(containerId) {
      this._ensureLoaded();
      const html = this._buildHTML();
      if (containerId) {
        this._containerId = containerId;
        this._container = document.getElementById(containerId);
        if (this._container) {
          this._container.innerHTML = html;
          this._bind();
          this._renderTable();
        }
      }
      return html;
    },

    _ensureLoaded() {
      if (!this._articles.length) this.init();
    },

    _loadStored() {
      try {
        const raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(normalizeArticle).filter(Boolean) : [];
      } catch (e) {
        return [];
      }
    },

    _save() {
      try {
        if (window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this._articles));
        }
      } catch (e) {
        if (window.App && typeof window.App.toast === 'function') {
          window.App.toast('Sauvegarde catalogue impossible', 'error');
        }
      }
    },

    _buildHTML() {
      return `
        <div class="card catalogue-paysagisme" style="display:flex;flex-direction:column;gap:16px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word;overflow:visible">
          <div>
            <h2 style="margin:0 0 4px;color:var(--text)">Catalogue paysagisme</h2>
            <p style="margin:0;color:var(--text-secondary,var(--text));font-size:13px">Base locale de prix HT : fournitures, vegetaux, materiaux et finitions.</p>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${Object.keys(CATEGORIES).map(code => `
              <button type="button" class="btn ${code === this._categorieActive ? 'btn-primary' : 'btn-secondary'}" data-catp-cat="${escapeAttr(code)}">${escapeHtml(CATEGORIES[code])}</button>
            `).join('')}
          </div>

          <div data-catp-table></div>

          <div class="card" style="padding:12px;border:1px solid var(--border);background:var(--bg-card)">
            <div class="calc-section-title">Import / export CSV</div>
            <textarea data-catp-csv rows="6" style="width:100%;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:10px;color:var(--text);font-family:var(--font-mono,monospace)" placeholder="reference;designation;unite;prixHT;categorie;prixBas;prixMoyen;prixHaut;source;dateMaj;notes&#10;CORDYLINE-U;Cordyline australis 60cm;u;28.50;VEGETAUX;18.00;28.50;45.00;catalogue_paysagisme_base_prix_2026;2026-05-30;Plant graphique pour bac decoratif"></textarea>
            <div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:10px">
              <button type="button" class="btn btn-secondary" data-catp-action="exporter">Exporter CSV</button>
              <button type="button" class="btn btn-primary" data-catp-action="importer">Importer CSV</button>
            </div>
          </div>
        </div>
      `;
    },

    _bind() {
      if (!this._container) return;
      this._container.addEventListener('click', event => {
        const catBtn = event.target.closest('[data-catp-cat]');
        if (catBtn) {
          this._categorieActive = catBtn.getAttribute('data-catp-cat');
          this._render();
          return;
        }

        const actionBtn = event.target.closest('[data-catp-action]');
        if (!actionBtn) return;
        const action = actionBtn.getAttribute('data-catp-action');
        if (action === 'exporter') this._exportToTextarea();
        if (action === 'importer') this._importFromTextarea();
      });

      this._container.addEventListener('change', event => {
        const input = event.target.closest('[data-catp-prix]');
        if (!input) return;
        const ref = input.getAttribute('data-catp-prix');
        const ok = this.setPrix(ref, input.value);
        if (ok && window.App && typeof window.App.toast === 'function') {
          window.App.toast('Prix catalogue mis a jour', 'success');
        }
      });
    },

    _render() {
      if (!this._container) return;
      this._container.innerHTML = this._buildHTML();
      this._bind();
      this._renderTable();
    },

    _renderTable() {
      if (!this._container) return;
      const wrapper = this._container.querySelector('[data-catp-table]');
      if (!wrapper) return;

      const articles = this.getArticles(this._categorieActive);
      wrapper.innerHTML = `
        <div style="overflow:auto;border:1px solid var(--border);border-radius:var(--r-md,8px);background:var(--bg-card)">
          <table style="width:100%;border-collapse:collapse;min-width:680px">
            <thead>
              <tr>
                <th style="text-align:left;padding:9px;border-bottom:1px solid var(--border);color:var(--text)">Reference</th>
                <th style="text-align:left;padding:9px;border-bottom:1px solid var(--border);color:var(--text)">Designation</th>
                <th style="text-align:left;padding:9px;border-bottom:1px solid var(--border);color:var(--text)">Unite</th>
                <th style="text-align:right;padding:9px;border-bottom:1px solid var(--border);color:var(--text)">Prix HT</th>
              </tr>
            </thead>
            <tbody>
              ${articles.map(article => `
                <tr>
                  <td style="padding:9px;border-bottom:1px solid var(--border);color:var(--text);font-family:var(--font-mono,monospace);font-size:12px">${escapeHtml(article.ref)}</td>
                  <td style="padding:9px;border-bottom:1px solid var(--border);color:var(--text)">${escapeHtml(article.designation)}</td>
                  <td style="padding:9px;border-bottom:1px solid var(--border);color:var(--text-secondary,var(--text))">${escapeHtml(article.unite)}</td>
                  <td style="padding:9px;border-bottom:1px solid var(--border);text-align:right">
                    <input type="number" min="0" step="0.01" value="${escapeAttr(article.prixHT)}" data-catp-prix="${escapeAttr(article.ref)}" style="width:110px;text-align:right;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text)">
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    _exportToTextarea() {
      const textarea = this._container ? this._container.querySelector('[data-catp-csv]') : null;
      if (textarea) textarea.value = this.exporterCSV();
      if (window.App && typeof window.App.toast === 'function') {
        window.App.toast('CSV catalogue exporte', 'success');
      }
    },

    _importFromTextarea() {
      const textarea = this._container ? this._container.querySelector('[data-catp-csv]') : null;
      this.importerCSV(textarea ? textarea.value : '');
    },
  };

  function mergeArticles(defaults, stored) {
    const merged = [];
    defaults.forEach(article => upsertArticle(merged, normalizeArticle(article)));
    stored.forEach(article => upsertArticle(merged, normalizeArticle(article)));
    return merged;
  }

  function upsertArticle(list, article) {
    if (!article || !article.ref) return;
    const index = list.findIndex(item => item.ref === article.ref);
    if (index >= 0) list[index] = Object.assign({}, list[index], article);
    else list.push(article);
  }

  function normalizeArticle(article) {
    if (!article) return null;
    return {
      ref: String(article.ref || article.reference || '').trim(),
      designation: String(article.designation || '').trim(),
      unite: String(article.unite || 'u').trim(),
      prixHT: round2(n(article.prixHT, 0)),
      prixBas: round2(n(article.prixBas, 0)),
      prixMoyen: round2(n(article.prixMoyen, article.prixHT || 0)),
      prixHaut: round2(n(article.prixHaut, 0)),
      categorie: normalizeCategorie(article.categorie),
      source: String(article.source || '').trim(),
      dateMaj: String(article.dateMaj || '').trim(),
      notes: String(article.notes || '').trim(),
    };
  }

  function normalizeCategorie(categorie) {
    const key = String(categorie || 'VEGETAUX').trim().toUpperCase();
    return CATEGORIES[key] ? key : 'VEGETAUX';
  }

  function parseCSVLine(line) {
    const out = [];
    let current = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];
      if (char === '"' && quoted && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === ';' && !quoted) {
        out.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    out.push(current.trim());
    return out;
  }

  function parsePrice(value) {
    return n(String(value || '').replace(',', '.'), 0);
  }

  function csvEscape(value) {
    const text = String(value === undefined || value === null ? '' : value);
    if (/[;"\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }

  function cloneArticle(article) {
    return Object.assign({}, article);
  }

  function n(value, def) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : (def || 0);
  }

  function round2(value) {
    return Math.round((value || 0) * 100) / 100;
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

  CataloguePaysagisme.init();
  window.CataloguePaysagisme = CataloguePaysagisme;
})();
