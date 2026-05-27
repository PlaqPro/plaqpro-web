/**
 * PlaqPro+ — Module import catalogue fournisseur
 * Supporte : CSV, Excel (XLSX), texte libre avec séparateurs auto-détectés
 * Colonnes détectées : nom/désignation, prix, unité, référence
 */

window.ImportCatalogue = (() => {

  let _produitsParsés = [];
  let _fournisseurActif = '';

  const FOURNISSEURS = [
    'Point.P', 'Bricoman', 'Prolians', 'Legallais', 'BigMat',
    'Placoplatre', 'Knauf', 'Siniat', 'Autre'
  ];

  // ── Ouvrir la modal ────────────────────────────────────────────
  function ouvrirModal() {
    const html = `
      <div style="font-family:var(--font-main,system-ui);max-width:720px;margin:0 auto">
        <h2 style="margin:0 0 4px;font-size:17px;font-weight:700">📥 Importer un catalogue fournisseur</h2>
        <p style="margin:0 0 16px;font-size:12px;color:var(--text-tertiary,#888)">
          Formats acceptés : CSV · Excel (.xlsx) · Texte libre (colonnes auto-détectées)
        </p>

        <!-- Sélecteur fournisseur -->
        <div style="margin-bottom:14px">
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">Fournisseur</label>
          <select id="ic-fournisseur" style="width:100%;padding:8px 10px;border:1px solid var(--border,#ddd);border-radius:6px;font-size:13px">
            <option value="">-- Sélectionner --</option>
            ${FOURNISSEURS.map(f => `<option value="${f}">${f}</option>`).join('')}
          </select>
        </div>

        <!-- Zone de dépôt fichier -->
        <div id="ic-dropzone"
          style="border:2px dashed var(--border,#ddd);border-radius:8px;padding:28px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;margin-bottom:14px"
          onclick="document.getElementById('ic-file-input').click()"
          ondragover="ImportCatalogue._dragOver(event)"
          ondragleave="ImportCatalogue._dragLeave(event)"
          ondrop="ImportCatalogue._drop(event)">
          <div style="font-size:32px;margin-bottom:8px">📂</div>
          <div style="font-size:14px;font-weight:600;margin-bottom:4px">Glisser un fichier ici</div>
          <div style="font-size:12px;color:var(--text-tertiary,#888)">ou cliquer pour parcourir — CSV, XLSX, TXT</div>
          <input type="file" id="ic-file-input" accept=".csv,.xlsx,.xls,.txt" style="display:none"
            onchange="ImportCatalogue._handleFile(this.files[0])">
        </div>

        <!-- OU coller texte -->
        <div style="margin-bottom:14px">
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">
            Ou coller le contenu directement
          </label>
          <textarea id="ic-texte" rows="6" placeholder="Référence;Désignation;Prix HT;Unité&#10;BA13S;Plaque BA13 260x120;8.50;u"
            style="width:100%;padding:8px;border:1px solid var(--border,#ddd);border-radius:6px;font-size:12px;font-family:monospace;box-sizing:border-box;resize:vertical"
            oninput="ImportCatalogue._onTexteChange(this.value)"></textarea>
        </div>

        <div style="display:flex;gap:10px;margin-bottom:14px">
          <button onclick="ImportCatalogue._analyserTexte()"
            style="padding:9px 18px;background:var(--primary,#0d9488);color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer">
            🔍 Analyser
          </button>
          <button onclick="ImportCatalogue._reinitialiser()"
            style="padding:9px 14px;background:transparent;color:var(--text-secondary,#555);border:1px solid var(--border,#ddd);border-radius:6px;font-size:13px;cursor:pointer">
            ✕ Réinitialiser
          </button>
        </div>

        <!-- Zone de prévisualisation -->
        <div id="ic-preview"></div>
      </div>
    `;
    const d = document.createElement('div');
    d.innerHTML = html;
    if (typeof App !== 'undefined' && App.openModal) {
      App.openModal('📥 Importer un catalogue fournisseur', d,
        '<button class="btn btn-primary" id="ic-btn-import" onclick="ImportCatalogue._importer()" style="display:none">✅ Importer dans la base</button>' +
        '<button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>'
      );
    } else {
      _showFallbackModal(html);
    }
  }

  // ── Fallback modal si App non disponible ──────────────────────
  function _showFallbackModal(html) {
    let overlay = document.getElementById('ic-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ic-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
      overlay.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:24px;max-width:760px;width:100%;max-height:90vh;overflow-y:auto;position:relative">
          <button onclick="document.getElementById('ic-overlay').remove()"
            style="position:absolute;top:12px;right:12px;background:transparent;border:none;font-size:20px;cursor:pointer;color:#888">✕</button>
          <div id="ic-modal-inner"></div>
        </div>`;
      document.body.appendChild(overlay);
    }
    document.getElementById('ic-modal-inner').innerHTML = html;
  }

  // ── Drag & Drop ───────────────────────────────────────────────
  function _dragOver(e) {
    e.preventDefault();
    const dz = document.getElementById('ic-dropzone');
    if (dz) { dz.style.borderColor = '#0d9488'; dz.style.background = '#f0fdf4'; }
  }
  function _dragLeave(e) {
    const dz = document.getElementById('ic-dropzone');
    if (dz) { dz.style.borderColor = ''; dz.style.background = ''; }
  }
  function _drop(e) {
    e.preventDefault();
    _dragLeave(e);
    const file = e.dataTransfer?.files?.[0];
    if (file) _handleFile(file);
  }

  // ── Routage selon extension ───────────────────────────────────
  function _handleFile(file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const dz = document.getElementById('ic-dropzone');
    if (dz) dz.innerHTML = `<div style="padding:8px;color:#0d9488;font-weight:600">📄 ${file.name}</div>`;

    if (ext === 'xlsx' || ext === 'xls') {
      _parseExcel(file);
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        const textarea = document.getElementById('ic-texte');
        if (textarea) textarea.value = e.target.result.substring(0, 5000);
        _parseTexte(e.target.result);
      };
      reader.readAsText(file, 'UTF-8');
    }
  }

  // ── Parser Excel via SheetJS (CDN dynamique) ──────────────────
  function _parseExcel(file) {
    const _doparse = () => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          _analyserLignes(rows);
        } catch (err) {
          _afficherErreur('Erreur lecture Excel : ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    };

    if (typeof XLSX !== 'undefined') {
      _doparse();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = _doparse;
      script.onerror = () => _afficherErreur('Impossible de charger SheetJS pour lire le fichier Excel.');
      document.head.appendChild(script);
    }
  }

  // ── Parser texte (CSV / TSV / texte libre) ────────────────────
  function _parseTexte(text) {
    if (!text || !text.trim()) return;
    const lignes = text.split(/\r?\n/).filter(l => l.trim());
    if (lignes.length === 0) return;

    // Détecter séparateur : ; > \t > ,
    const sample = lignes.slice(0, 5).join('\n');
    let sep = ';';
    const countSemicolon = (sample.match(/;/g) || []).length;
    const countTab = (sample.match(/\t/g) || []).length;
    const countComma = (sample.match(/,/g) || []).length;
    if (countTab > countSemicolon && countTab > countComma) sep = '\t';
    else if (countComma > countSemicolon && countComma > countTab) sep = ',';

    const rows = lignes.map(l => l.split(sep).map(c => c.trim().replace(/^"|"$/g, '')));
    _analyserLignes(rows);
  }

  // ── Analyse des lignes et détection des colonnes ──────────────
  function _analyserLignes(rows) {
    if (!rows || rows.length < 2) {
      _afficherErreur('Fichier trop court ou vide.');
      return;
    }

    const header = rows[0].map(h => (h || '').toString().toLowerCase().trim());
    let colNom = -1, colPrix = -1, colUnite = -1, colRef = -1;

    const matchCol = (patterns) => {
      for (const pat of patterns) {
        const idx = header.findIndex(h => h.includes(pat));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    colRef   = matchCol(['ref', 'code', 'art', 'ean', 'sku']);
    colNom   = matchCol(['nom', 'désign', 'design', 'libellé', 'libelle', 'produit', 'description', 'desc']);
    colPrix  = matchCol(['prix', 'tarif', 'pu ', 'p.u', 'coût', 'cout', 'montant', 'ht']);
    colUnite = matchCol(['unité', 'unite', 'unit', 'uv', 'cdt', 'conditionn']);

    // Fallback si pas de header reconnu : 1ère colonne texte = nom, 1ère colonne numérique = prix
    if (colNom === -1 && colPrix === -1) {
      const sampleRow = rows[1] || [];
      sampleRow.forEach((cell, i) => {
        const val = (cell || '').toString().trim();
        if (colPrix === -1 && /^[\d.,]+$/.test(val.replace(/\s/g, ''))) colPrix = i;
        else if (colNom === -1 && val.length > 3) colNom = i;
      });
    }

    if (colNom === -1 && colPrix === -1) {
      _afficherErreur('Impossible de détecter les colonnes. Vérifiez que la première ligne est un en-tête (Nom, Prix, Unité…).');
      return;
    }

    const produits = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every(c => !c)) continue;
      const nom   = colNom   >= 0 ? (row[colNom]   || '').toString().trim() : '';
      const prixRaw = colPrix >= 0 ? (row[colPrix]  || '').toString().replace(',', '.').replace(/[^\d.]/g, '') : '';
      const prix  = parseFloat(prixRaw) || 0;
      const unite = colUnite >= 0 ? (row[colUnite] || '').toString().trim() : 'u';
      const ref   = colRef   >= 0 ? (row[colRef]   || '').toString().trim() : '';
      if (!nom && prix === 0) continue;
      produits.push({ ref, nom, prix, unite });
    }

    if (produits.length === 0) {
      _afficherErreur('Aucun produit détecté après analyse. Vérifiez le fichier.');
      return;
    }

    _produitsParsés = produits;
    _afficherPreview(produits, { colNom, colPrix, colUnite, colRef, header });
  }

  // ── Prévisualisation ──────────────────────────────────────────
  function _afficherPreview(produits, meta) {
    const preview = document.getElementById('ic-preview');
    if (!preview) return;

    const nbMatch = produits.filter(p => _trouverCatalogue(p.nom, p.ref) !== null).length;
    const nbNouveaux = produits.length - nbMatch;

    preview.innerHTML = `
      <div style="background:#f0fdf4;border:1px solid #6ee7b7;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">
          ✅ ${produits.length} produits détectés
        </div>
        <div style="font-size:12px;color:#555">
          ${nbMatch} correspondances avec le catalogue existant (prix mis à jour) ·
          ${nbNouveaux} nouveaux produits (ajoutés)
        </div>
        ${meta ? `<div style="font-size:11px;color:#888;margin-top:4px">
          Colonnes : Nom→${meta.colNom>=0?meta.header[meta.colNom]:'?'} ·
          Prix→${meta.colPrix>=0?meta.header[meta.colPrix]:'?'} ·
          Unité→${meta.colUnite>=0?meta.header[meta.colUnite]:'auto'} ·
          Ref→${meta.colRef>=0?meta.header[meta.colRef]:'auto'}
        </div>` : ''}
      </div>

      <div style="overflow-x:auto;margin-bottom:14px">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:var(--surface-2,#f5f5f5)">
              <th style="padding:6px 8px;text-align:left;border-bottom:1px solid var(--border,#ddd)">Réf</th>
              <th style="padding:6px 8px;text-align:left;border-bottom:1px solid var(--border,#ddd)">Désignation</th>
              <th style="padding:6px 8px;text-align:right;border-bottom:1px solid var(--border,#ddd)">Prix HT</th>
              <th style="padding:6px 8px;text-align:center;border-bottom:1px solid var(--border,#ddd)">Unité</th>
              <th style="padding:6px 8px;text-align:center;border-bottom:1px solid var(--border,#ddd)">Statut</th>
            </tr>
          </thead>
          <tbody>
            ${produits.slice(0, 50).map(p => {
              const match = _trouverCatalogue(p.nom, p.ref);
              const statut = match
                ? `<span style="color:#0d9488;font-weight:600">↺ MAJ</span>`
                : `<span style="color:#7c3aed;font-weight:600">+ Nouveau</span>`;
              return `<tr style="border-bottom:1px solid var(--border,#eee)">
                <td style="padding:5px 8px;color:#888;font-family:monospace">${p.ref || '—'}</td>
                <td style="padding:5px 8px">${p.nom || '—'}</td>
                <td style="padding:5px 8px;text-align:right;font-weight:600">${p.prix > 0 ? p.prix.toFixed(2) + ' €' : '—'}</td>
                <td style="padding:5px 8px;text-align:center">${p.unite || 'u'}</td>
                <td style="padding:5px 8px;text-align:center">${statut}</td>
              </tr>`;
            }).join('')}
            ${produits.length > 50 ? `<tr><td colspan="5" style="padding:8px;text-align:center;color:#888;font-style:italic">… et ${produits.length - 50} autres</td></tr>` : ''}
          </tbody>
        </table>
      </div>

      <button onclick="ImportCatalogue._importer()"
        style="width:100%;padding:12px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">
        📥 Importer ${produits.length} produit${produits.length > 1 ? 's' : ''} dans le catalogue
      </button>
    `;
  }

  // ── Trouver correspondance dans CATALOGUE ─────────────────────
  function _trouverCatalogue(nom, ref) {
    if (typeof CATALOGUE === 'undefined') return null;
    if (ref) {
      const byRef = CATALOGUE.find(p => p.ref && p.ref.toLowerCase() === ref.toLowerCase());
      if (byRef) return byRef;
    }
    if (nom && nom.length > 4) {
      const nomLower = nom.toLowerCase();
      return CATALOGUE.find(p => p.nom && p.nom.toLowerCase().includes(nomLower.substring(0, 12))) || null;
    }
    return null;
  }

  // ── Importer dans localStorage ────────────────────────────────
  function _importer() {
    if (_produitsParsés.length === 0) return;
    const fournisseur = document.getElementById('ic-fournisseur')?.value || _fournisseurActif || 'Import';

    // Mise à jour des prix overrides pour produits existants
    const overrides = JSON.parse(localStorage.getItem('plaqpro_prix_overrides') || '{}');
    let maj = 0;

    // Stockage des nouveaux produits
    const imports = JSON.parse(localStorage.getItem('plaqpro_produits_import') || '[]');
    let nouveaux = 0;

    _produitsParsés.forEach(p => {
      if (p.prix <= 0) return;
      const match = _trouverCatalogue(p.nom, p.ref);
      if (match) {
        overrides[match.ref] = {
          prix: p.prix,
          source: fournisseur,
          date: new Date().toISOString().split('T')[0]
        };
        maj++;
      } else {
        const existIdx = imports.findIndex(i => i.ref && i.ref === p.ref);
        const entry = {
          ref: p.ref || ('IMP_' + Date.now() + '_' + nouveaux),
          nom: p.nom,
          prix: p.prix,
          unite: p.unite || 'u',
          fam: 'Import fournisseur',
          sfam: fournisseur,
          source: fournisseur,
          date: new Date().toISOString().split('T')[0],
          tags: ['import']
        };
        if (existIdx >= 0) imports[existIdx] = entry;
        else imports.push(entry);
        nouveaux++;
      }
    });

    localStorage.setItem('plaqpro_prix_overrides', JSON.stringify(overrides));
    localStorage.setItem('plaqpro_produits_import', JSON.stringify(imports));

    const msg = `✅ Import terminé — ${maj} prix mis à jour, ${nouveaux} nouveaux produits ajoutés`;
    if (typeof App !== 'undefined') {
      App.toast(msg, 'success');
      App.closeModal();
      // Recharger la page catalogue si on y est
      if (typeof PROD !== 'undefined' && PROD.render) {
        setTimeout(() => { if (typeof App !== 'undefined') App.navigate('catalogue'); }, 400);
      }
    } else {
      document.getElementById('ic-overlay')?.remove();
      if (typeof App !== 'undefined') App.toast(msg, 'success');
      else document.title = msg;
    }
  }

  // ── Changement de texte en temps réel (debounce) ──────────────
  let _debounceTimer = null;
  function _onTexteChange(val) {
    clearTimeout(_debounceTimer);
    if (val.length < 20) return;
    _debounceTimer = setTimeout(() => _parseTexte(val), 800);
  }

  // ── Analyser le contenu du textarea ──────────────────────────
  function _analyserTexte() {
    const val = document.getElementById('ic-texte')?.value || '';
    if (!val.trim()) {
      _afficherErreur('Collez d\'abord du contenu dans la zone de texte.');
      return;
    }
    _parseTexte(val);
  }

  // ── Réinitialiser ─────────────────────────────────────────────
  function _reinitialiser() {
    _produitsParsés = [];
    const dz = document.getElementById('ic-dropzone');
    if (dz) dz.innerHTML = `
      <div style="font-size:32px;margin-bottom:8px">📂</div>
      <div style="font-size:14px;font-weight:600;margin-bottom:4px">Glisser un fichier ici</div>
      <div style="font-size:12px;color:var(--text-tertiary,#888)">ou cliquer pour parcourir — CSV, XLSX, TXT</div>
      <input type="file" id="ic-file-input" accept=".csv,.xlsx,.xls,.txt" style="display:none"
        onchange="ImportCatalogue._handleFile(this.files[0])">`;
    const ta = document.getElementById('ic-texte');
    if (ta) ta.value = '';
    const preview = document.getElementById('ic-preview');
    if (preview) preview.innerHTML = '';
  }

  // ── Afficher erreur dans la zone preview ──────────────────────
  function _afficherErreur(msg) {
    const preview = document.getElementById('ic-preview');
    if (preview) {
      preview.innerHTML = `
        <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px;color:#dc2626;font-size:13px">
          ⚠️ ${msg}
        </div>`;
    }
  }

  return {
    ouvrirModal,
    _handleFile,
    _dragOver,
    _dragLeave,
    _drop,
    _onTexteChange,
    _analyserTexte,
    _reinitialiser,
    _importer
  };
})();
