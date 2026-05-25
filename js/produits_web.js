/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
/* produits_web.js — Recherche produits via IA Groq + ajout dynamique au catalogue */

const ProduitsWeb = {
  _pending: [],

  async rechercher(query) {
    const container = document.getElementById('prod-results');
    if (!container) return;

    const _gcProd = groqConfig();
    if (!_gcProd) {
      container.innerHTML = `
        <div class="prod-empty">
          <div class="prod-empty-icon">🔑</div>
          <div style="font-size:15px;font-weight:600;color:var(--text-secondary);margin-bottom:8px">Clé Groq requise en local</div>
          <div style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px">
            Configurez votre clé API Groq dans <strong>⚙️ Paramètres → IA avancées</strong>.
          </div>
          <button class="btn btn-secondary" onclick="App.navigate('config')">⚙️ Configurer</button>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:48px 24px;gap:16px">
        <div style="width:40px;height:40px;border:3px solid var(--accent);border-top-color:transparent;
             border-radius:50%;animation:spin 0.8s linear infinite"></div>
        <div style="color:var(--text-secondary);font-size:14px">
          Recherche IA en cours pour <strong>"${this._esc(query)}"</strong>…
        </div>
      </div>`;

    const prompt = `Tu es un expert en fournitures pour plaquistes et entreprises du bâtiment (BA13, isolation, rails, plaques de plâtre, enduits, etc.).
Génère une liste JSON de 4 à 6 produits pertinents pour la requête : "${query}"

Format STRICT — réponds UNIQUEMENT avec ce JSON, sans texte avant ni après :
[
  {
    "reference": "REF_UNIQUE",
    "categorie": "Cloison|Plaque|Fixation|Joint|Isolation|Peinture|Preparat.|Accessoire|Plafond|Main oeuvre|Matériaux spéciaux",
    "designation": "Nom complet du produit",
    "description": "Description courte (max 80 caractères)",
    "prixHT": 12.50,
    "unite": "u|ml|m2|L|sac|boite|rl|h|lot",
    "rendement": "ex: 8 m2/sac ou -",
    "fournisseurs": ["Fournisseur1", "Fournisseur2"]
  }
]`;

    try {
      const res = await fetch(_gcProd.url, {
        method: 'POST',
        headers: _gcProd.headers,
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const raw = (data.choices?.[0]?.message?.content || '').trim();

      const jsonStart = raw.indexOf('[');
      const jsonEnd   = raw.lastIndexOf(']');
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('JSON introuvable');

      const produits = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      if (!Array.isArray(produits) || !produits.length) throw new Error('Liste vide');

      this.afficherResultats(produits, query);
    } catch (err) {
      container.innerHTML = `
        <div class="prod-empty">
          <div class="prod-empty-icon">⚠️</div>
          <div style="font-size:15px;font-weight:600;color:#F75B5B;margin-bottom:8px">Erreur de recherche</div>
          <div style="font-size:13px;color:var(--text-tertiary);margin-bottom:16px">${this._esc(err.message)}</div>
          <button class="btn btn-secondary" onclick="ProduitsWeb.rechercher(${JSON.stringify(query)})">↻ Réessayer</button>
        </div>`;
    }
  },

  afficherResultats(produits, query) {
    this._pending = produits;
    const container = document.getElementById('prod-results');
    if (!container) return;

    const stats = document.getElementById('prod-stats');
    if (stats) stats.textContent = produits.length + ' résultat' + (produits.length > 1 ? 's' : '') + ' IA pour "' + query + '"';

    const cards = produits.map((p, i) => {
      const fournisseurs = Array.isArray(p.fournisseurs) && p.fournisseurs.length
        ? p.fournisseurs.map(f => `<span style="font-size:10px;padding:2px 6px;background:rgba(79,142,247,0.12);
             color:var(--accent);border-radius:4px">${this._esc(f)}</span>`).join(' ')
        : '';
      return `
        <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);
             padding:16px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
            <div>
              <div style="font-size:11px;font-weight:600;color:var(--text-tertiary);letter-spacing:.5px;
                   text-transform:uppercase;margin-bottom:3px">${this._esc(p.reference || '')}</div>
              <div style="font-weight:600;font-size:14px;color:var(--text-primary)">${this._esc(p.designation || '')}</div>
              ${p.description ? `<div style="font-size:12px;color:var(--text-tertiary);margin-top:3px">${this._esc(p.description)}</div>` : ''}
            </div>
            <span style="flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.5px;padding:3px 8px;
                 background:rgba(255,155,50,0.15);color:#FF9B32;border-radius:4px;white-space:nowrap">✨ IA</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <span style="font-size:13px;font-weight:700;color:var(--text-primary)">
                ${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(p.prixHT || 0)} €/${this._esc(p.unite || 'u')}
              </span>
              <span style="font-size:11px;color:var(--text-tertiary);padding:2px 6px;
                   background:var(--bg-tertiary);border-radius:4px">${this._esc(p.categorie || '')}</span>
              ${p.rendement && p.rendement !== '-' ? `<span style="font-size:11px;color:var(--text-tertiary)">Rend: ${this._esc(p.rendement)}</span>` : ''}
            </div>
          </div>
          ${fournisseurs ? `<div style="display:flex;gap:4px;flex-wrap:wrap">${fournisseurs}</div>` : ''}
          <div style="display:flex;gap:8px;margin-top:4px">
            <button class="btn btn-primary" style="flex:1;font-size:12px;padding:6px 10px"
              onclick="ProduitsWeb._ajouterIndex(${i})">✅ Ajouter au catalogue</button>
            <button class="btn btn-secondary" style="font-size:12px;padding:6px 10px"
              onclick="ProduitsWeb._modifierIndex(${i})">✏️ Modifier</button>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div style="margin-bottom:16px;padding:10px 14px;background:rgba(255,155,50,0.08);
           border:1px solid rgba(255,155,50,0.25);border-radius:var(--radius-md);font-size:12px;
           color:var(--text-secondary)">
        ✨ Résultats générés par IA — vérifiez les prix avant utilisation.
        <button onclick="ProdMoteur.rechercher()" style="background:none;border:none;color:var(--accent);
          cursor:pointer;font-size:12px;margin-left:8px;text-decoration:underline">← Retour catalogue</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">${cards}</div>`;
  },

  _ajouterIndex(i) {
    const p = this._pending[i];
    if (!p) return;
    this._sauvegarder(p);
  },

  _modifierIndex(i) {
    const p = this._pending[i];
    if (!p) return;
    this._modalConfirm(p, i);
  },

  _modalConfirm(p, idx) {
    const cats = ['Cloison','Plaque','Fixation','Joint','Isolation','Peinture','Preparat.','Accessoire','Plafond','Main oeuvre','Matériaux spéciaux'];
    const unites = ['u','ml','m2','L','sac','boite','rl','h','lot'];
    const fournStr = Array.isArray(p.fournisseurs) ? p.fournisseurs.join(', ') : '';

    const d = document.createElement('div');
    d.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Référence *</label>
          <input class="form-control" id="pweb-ref" value="${this._esc(p.reference || '')}"></div>
        <div class="form-group"><label class="form-label">Catégorie</label>
          <select class="form-control" id="pweb-cat">
            ${cats.map(c => `<option ${p.categorie === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select></div>
      </div>
      <div class="form-group"><label class="form-label">Désignation *</label>
        <input class="form-control" id="pweb-design" value="${this._esc(p.designation || '')}"></div>
      <div class="form-group"><label class="form-label">Description</label>
        <input class="form-control" id="pweb-desc" value="${this._esc(p.description || '')}"></div>
      <div class="form-row-3">
        <div class="form-group"><label class="form-label">Unité</label>
          <select class="form-control" id="pweb-unite">
            ${unites.map(u => `<option ${p.unite === u ? 'selected' : ''}>${u}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">Prix HT (€) *</label>
          <input class="form-control" id="pweb-prix" type="number" step="0.01" value="${p.prixHT || ''}"></div>
        <div class="form-group"><label class="form-label">Rendement</label>
          <input class="form-control" id="pweb-rend" value="${this._esc(p.rendement || '-')}"></div>
      </div>
      <div class="form-group"><label class="form-label">Fournisseurs (séparés par des virgules)</label>
        <input class="form-control" id="pweb-fournisseurs" value="${this._esc(fournStr)}"
          placeholder="Knauf, Saint-Gobain, Bricomarché…"></div>`;

    App.openModal('✏️ Modifier avant ajout', d, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="ProduitsWeb._confirmerEdit(${idx})">✅ Ajouter</button>
    `);
  },

  _confirmerEdit(idx) {
    const ref    = document.getElementById('pweb-ref')?.value.trim();
    const design = document.getElementById('pweb-design')?.value.trim();
    const prix   = parseFloat(document.getElementById('pweb-prix')?.value);
    if (!ref || !design || isNaN(prix)) { App.toast('Champs obligatoires manquants', 'error'); return; }

    const fournRaw = document.getElementById('pweb-fournisseurs')?.value || '';
    const fournisseurs = fournRaw.split(',').map(s => s.trim()).filter(Boolean);

    const updated = Object.assign({}, this._pending[idx] || {}, {
      reference:   ref,
      categorie:   document.getElementById('pweb-cat')?.value,
      designation: design,
      description: document.getElementById('pweb-desc')?.value.trim(),
      unite:       document.getElementById('pweb-unite')?.value,
      prixHT:      prix,
      rendement:   document.getElementById('pweb-rend')?.value.trim() || '-',
      fournisseurs,
    });

    App.closeModal();
    this._sauvegarder(updated);
  },

  _sauvegarder(p) {
    const item = {
      reference:   p.reference,
      categorie:   p.categorie || 'Accessoire',
      designation: p.designation,
      description: p.description || '',
      unite:       p.unite || 'u',
      prixHT:      parseFloat(p.prixHT) || 0,
      rendement:   p.rendement || '-',
      fournisseurs: Array.isArray(p.fournisseurs) ? p.fournisseurs : [],
      sourceIA:    true,
      ajouteLe:    new Date().toISOString(),
      actif:       true,
    };

    const saved = DB.add(DB.KEYS.produits, item);

    // Historique IA séparé
    const hist = JSON.parse(localStorage.getItem('plaqpro_produits_ia') || '[]');
    hist.unshift({ id: saved.id, reference: saved.reference, designation: saved.designation,
                   prixHT: saved.prixHT, unite: saved.unite, ajouteLe: saved.ajouteLe });
    localStorage.setItem('plaqpro_produits_ia', JSON.stringify(hist.slice(0, 50)));

    App.toast('Produit "' + (saved.designation || saved.reference) + '" ajouté au catalogue !', 'success');
    setTimeout(() => App.navigate('produits'), 500);
  },

  renderHistorique() {
    const hist = JSON.parse(localStorage.getItem('plaqpro_produits_ia') || '[]');
    if (!hist.length) return '<p style="color:var(--text-tertiary);font-size:13px;margin:0">Aucun produit ajouté via IA pour l\'instant.</p>';

    const rows = hist.map(h => `
      <tr>
        <td style="font-family:var(--font-mono);font-size:12px">${this._esc(h.reference || '')}</td>
        <td>${this._esc(h.designation || '')}</td>
        <td style="text-align:right;white-space:nowrap">
          ${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(h.prixHT || 0)} €/${this._esc(h.unite || '')}
        </td>
        <td style="font-size:11px;color:var(--text-tertiary);white-space:nowrap">
          ${h.ajouteLe ? new Date(h.ajouteLe).toLocaleDateString('fr-FR') : ''}
        </td>
        <td>
          <button class="btn btn-danger" style="font-size:11px;padding:3px 8px"
            onclick="ProduitsWeb.supprimerIA(${h.id})">🗑</button>
        </td>
      </tr>`).join('');

    return `
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="color:var(--text-tertiary);font-size:11px;border-bottom:1px solid var(--border)">
            <th style="padding:6px 8px;text-align:left;font-weight:600">Réf</th>
            <th style="padding:6px 8px;text-align:left;font-weight:600">Désignation</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600">Prix HT</th>
            <th style="padding:6px 8px;text-align:left;font-weight:600">Ajouté le</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  },

  supprimerIA(id) {
    if (!confirm('Supprimer ce produit du catalogue ?')) return;
    DB.delete(DB.KEYS.produits, id);
    const hist = JSON.parse(localStorage.getItem('plaqpro_produits_ia') || '[]')
      .filter(h => h.id !== id);
    localStorage.setItem('plaqpro_produits_ia', JSON.stringify(hist));
    App.toast('Produit supprimé');
    App.navigate('config');
  },

  _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },
};
