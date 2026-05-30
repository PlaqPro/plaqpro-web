/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Fiche chantier Paysagisme
//  chantier_paysagisme.js
// ============================================================

(function() {
  'use strict';

  const STORAGE_KEY = 'plaqpro_chantiers_paysagisme';
  const STATUTS = ['planifié', 'en cours', 'terminé', 'réceptionné'];

  const ChantierPaysagisme = {
    _container: null,
    _containerId: null,
    _filtre: 'tous',

    creer(chantierId, options) {
      options = options || {};
      const items = this.getAll();
      const now = new Date().toISOString();
      const item = {
        id: options.id || nextId(items),
        chantierId: n(chantierId, options.chantierId || 0),
        diagnostic: options.diagnostic || {},
        lots: Array.isArray(options.lots) ? options.lots : [],
        photos: Array.isArray(options.photos) ? options.photos : [],
        equipe: Array.isArray(options.equipe) ? options.equipe : [],
        materiel: Array.isArray(options.materiel) ? options.materiel : [],
        soustraitants: Array.isArray(options.soustraitants) ? options.soustraitants : [],
        avancement: clamp(n(options.avancement, 0), 0, 100),
        statut: STATUTS.indexOf(options.statut) >= 0 ? options.statut : 'planifié',
        dateDebut: options.dateDebut || '',
        dateFin: options.dateFin || '',
        notesChantier: options.notesChantier || '',
        margeCible: n(options.margeCible, 30),
        coutReel: n(options.coutReel, 0),
        createdAt: options.createdAt || now,
        updatedAt: now,
      };

      items.push(item);
      save(items);
      this._render();
      toast('Chantier paysagisme créé', 'success');
      return clone(item);
    },

    getAll() {
      return load().map(clone);
    },

    get(id) {
      const item = load().find(c => String(c.id) === String(id));
      return item ? clone(item) : null;
    },

    update(id, data) {
      const items = load();
      const index = items.findIndex(c => String(c.id) === String(id));
      if (index < 0) return null;

      const current = items[index];
      const next = Object.assign({}, current, data || {});
      next.id = current.id;
      next.chantierId = n(next.chantierId, current.chantierId);
      next.avancement = clamp(n(next.avancement, current.avancement), 0, 100);
      next.statut = STATUTS.indexOf(next.statut) >= 0 ? next.statut : current.statut;
      next.coutReel = n(next.coutReel, 0);
      next.margeCible = n(next.margeCible, 30);
      next.updatedAt = new Date().toISOString();
      items[index] = next;

      save(items);
      this._render();
      return clone(next);
    },

    delete(id) {
      const items = load();
      const next = items.filter(c => String(c.id) !== String(id));
      if (next.length === items.length) return false;
      save(next);
      this._render();
      toast('Chantier paysagisme supprimé', 'success');
      return true;
    },

    ajouterPhoto(id, base64, type) {
      type = ['avant', 'pendant', 'apres'].indexOf(type) >= 0 ? type : 'pendant';
      const item = this.get(id);
      if (!item) return null;
      item.photos.push({
        id: Date.now(),
        type,
        base64,
        date: new Date().toISOString(),
      });
      return this.update(id, { photos: item.photos });
    },

    updateAvancement(id, pct) {
      pct = clamp(n(pct, 0), 0, 100);
      const data = { avancement: pct };
      if (pct >= 100) data.statut = 'terminé';
      else if (pct > 0) data.statut = 'en cours';
      return this.update(id, data);
    },

    calcMargeReelle(id) {
      const item = this.get(id);
      if (!item) return null;
      const devis = findSignedDevis(item.chantierId);
      if (!devis) {
        return {
          chantierPaysagismeId: item.id,
          chantierId: item.chantierId,
          erreur: 'Aucun devis signé trouvé',
        };
      }
      const prixVendu = devis ? n(devis.totalHT || devis.totalClient || devis.totalTTC, 0) : 0;
      const coutReel = n(item.coutReel, 0);
      const margeEuro = prixVendu - coutReel;
      const margePct = prixVendu > 0 ? margeEuro / prixVendu * 100 : 0;
      return {
        chantierPaysagismeId: item.id,
        chantierId: item.chantierId,
        devisId: devis ? devis.id : null,
        numeroDevis: devis ? devis.numero : null,
        prixVendu: round2(prixVendu),
        coutReel: round2(coutReel),
        margeEuro: round2(margeEuro),
        margePct: round2(margePct),
        margeCible: n(item.margeCible, 30),
        ecartCible: round2(margePct - n(item.margeCible, 30)),
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
        }
      }
      return html;
    },

    _buildHTML() {
      const items = this._filtered();
      return `
        <div class="chantier-paysagisme" style="display:flex;flex-direction:column;gap:16px">
          <div class="card" style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
            <div>
              <h2 style="margin:0 0 4px;color:var(--text)">Chantiers paysagisme</h2>
              <p style="margin:0;color:var(--text-secondary,var(--text));font-size:13px">Suivi terrain : diagnostic, lots, photos, equipe, materiel, cout reel et avancement.</p>
            </div>
            <button type="button" class="btn btn-primary" data-cp-action="nouveau">Nouveau chantier paysagisme</button>
          </div>

          <div class="card" style="display:flex;gap:8px;flex-wrap:wrap">
            ${filterButton('tous', 'Tous', this._filtre)}
            ${filterButton('planifié', 'Planifié', this._filtre)}
            ${filterButton('en cours', 'En cours', this._filtre)}
            ${filterButton('terminé', 'Terminé', this._filtre)}
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px">
            ${items.length ? items.map(item => this._cardHTML(item)).join('') : emptyHTML()}
          </div>
        </div>
      `;
    },

    _cardHTML(item) {
      const linked = getLinkedChantier(item.chantierId);
      const client = linked && linked.clientId ? getClient(linked.clientId) : null;
      const marge = this.calcMargeReelle(item.id);
      const titre = linked ? (linked.nom || linked.titre || `Chantier #${linked.id}`) : `Chantier DB #${item.chantierId}`;
      const adresse = linked ? formatAdresse(linked) : 'Adresse non disponible';
      const clientNom = client ? (client.nom || client.raisonSociale || `Client #${client.id}`) : 'Client non renseigné';

      return `
        <div class="card" data-cp-id="${escapeAttr(item.id)}" style="border:1px solid var(--border);display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
            <div>
              <div style="font-weight:800;color:var(--text);font-size:16px">${escapeHtml(titre)}</div>
              <div style="font-size:13px;color:var(--text-secondary,var(--text));margin-top:2px">${escapeHtml(clientNom)}</div>
              <div style="font-size:12px;color:var(--text-secondary,var(--text));margin-top:2px">${escapeHtml(adresse)}</div>
            </div>
            <span style="${badgeStyle(item.statut)}">${escapeHtml(item.statut)}</span>
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary,var(--text));margin-bottom:5px">
              <span>Avancement</span>
              <span>${round2(item.avancement)} %</span>
            </div>
            <div style="height:9px;background:var(--bg-card);border:1px solid var(--border);border-radius:999px;overflow:hidden">
              <div style="height:100%;width:${clamp(item.avancement, 0, 100)}%;background:var(--accent)"></div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:12px">
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:8px">
              <div style="color:var(--text-secondary,var(--text))">Lots</div>
              <strong style="color:var(--text)">${item.lots.length}</strong>
            </div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:8px">
              <div style="color:var(--text-secondary,var(--text))">Photos</div>
              <strong style="color:var(--text)">${item.photos.length}</strong>
            </div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:8px">
              <div style="color:var(--text-secondary,var(--text))">Marge réelle</div>
              <strong style="color:${marge && marge.margePct < item.margeCible ? '#EF4444' : 'var(--text)'}">${marge ? `${round2(marge.margePct)} %` : '-'}</strong>
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn-secondary btn-sm" data-cp-action="voir" data-id="${escapeAttr(item.id)}">Voir</button>
            <button type="button" class="btn btn-secondary btn-sm" data-cp-action="modifier" data-id="${escapeAttr(item.id)}">Modifier</button>
            <button type="button" class="btn btn-secondary btn-sm" data-cp-action="avancement" data-id="${escapeAttr(item.id)}">Avancement</button>
            <button type="button" class="btn btn-secondary btn-sm" data-cp-action="photos" data-id="${escapeAttr(item.id)}">Photos</button>
          </div>
        </div>
      `;
    },

    _filtered() {
      const items = this.getAll();
      if (this._filtre === 'tous') return items;
      return items.filter(item => item.statut === this._filtre);
    },

    _bind() {
      if (!this._container) return;
      this._container.addEventListener('click', event => {
        const target = event.target.closest('[data-cp-action],[data-cp-filter]');
        if (!target) return;

        if (target.hasAttribute('data-cp-filter')) {
          this._filtre = target.getAttribute('data-cp-filter');
          this._render();
          return;
        }

        const action = target.getAttribute('data-cp-action');
        const id = target.getAttribute('data-id');
        if (action === 'nouveau') this._modalNouveau();
        if (action === 'voir') this._modalVoir(id);
        if (action === 'modifier') this._modalModifier(id);
        if (action === 'avancement') this._modalAvancement(id);
        if (action === 'photos') this._modalPhotos(id);
      });
    },

    _render() {
      if (!this._container) return;
      this._container.innerHTML = this._buildHTML();
      this._bind();
    },

    _modalNouveau() {
      const chantiers = getDBChantiers();
      openModal(
        'Nouveau chantier paysagisme',
        `
          <div style="display:flex;flex-direction:column;gap:12px">
            <label class="calc-input-group">
              <span>Chantier PlaqPro</span>
              <select id="cp-new-chantier" style="${inputStyle()}">
                <option value="">Sélectionner</option>
                ${chantiers.map(c => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.nom || c.titre || ('Chantier #' + c.id))}</option>`).join('')}
              </select>
            </label>
            <label class="calc-input-group">
              <span>Date début</span>
              <input type="date" id="cp-new-debut" style="${inputStyle()}">
            </label>
            <label class="calc-input-group">
              <span>Marge cible (%)</span>
              <input type="number" id="cp-new-marge" value="30" min="0" step="1" style="${inputStyle()}">
            </label>
            <label class="calc-input-group">
              <span>Notes chantier</span>
              <textarea id="cp-new-notes" rows="4" style="${inputStyle()}"></textarea>
            </label>
          </div>
        `,
        `
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
          <button type="button" class="btn btn-primary" onclick="ChantierPaysagisme._validerNouveau()">Créer</button>
        `
      );
    },

    _validerNouveau() {
      const chantierId = n(document.getElementById('cp-new-chantier')?.value, 0);
      if (!chantierId) {
        toast('Sélectionnez un chantier PlaqPro', 'error');
        return;
      }
      this.creer(chantierId, {
        dateDebut: document.getElementById('cp-new-debut')?.value || '',
        margeCible: n(document.getElementById('cp-new-marge')?.value, 30),
        notesChantier: document.getElementById('cp-new-notes')?.value || '',
      });
      closeModal();
    },

    _modalVoir(id) {
      const item = this.get(id);
      if (!item) return;
      const linked = getLinkedChantier(item.chantierId);
      const marge = this.calcMargeReelle(id);
      openModal(
        'Fiche chantier paysagisme',
        `
          <div style="display:flex;flex-direction:column;gap:12px">
            <div class="card" style="background:var(--bg-card);border:1px solid var(--border)">
              <strong>${escapeHtml(linked ? (linked.nom || linked.titre || 'Chantier') : 'Chantier non lié')}</strong>
              <div style="font-size:13px;color:var(--text-secondary,var(--text));margin-top:4px">${escapeHtml(formatAdresse(linked))}</div>
            </div>
            ${kv('Statut', item.statut)}
            ${kv('Avancement', `${round2(item.avancement)} %`)}
            ${kv('Date début', item.dateDebut || '-')}
            ${kv('Date fin', item.dateFin || '-')}
            ${kv('Cout réel', fmt(item.coutReel))}
            ${kv('Marge réelle', marge ? `${fmt(marge.margeEuro)} (${round2(marge.margePct)} %)` : '-')}
            ${kv('Equipe', `${item.equipe.length} affectation(s)`)}
            ${kv('Matériel', `${item.materiel.length} élément(s)`)}
            ${kv('Sous-traitants', `${item.soustraitants.length} intervenant(s)`)}
            <div>
              <div style="font-weight:700;color:var(--text);margin-bottom:4px">Notes</div>
              <div style="white-space:pre-wrap;color:var(--text-secondary,var(--text));font-size:13px">${escapeHtml(item.notesChantier || '-')}</div>
            </div>
          </div>
        `,
        '<button type="button" class="btn btn-primary" onclick="App.closeModal()">Fermer</button>'
      );
    },

    _modalModifier(id) {
      const item = this.get(id);
      if (!item) return;
      openModal(
        'Modifier chantier paysagisme',
        `
          <div style="display:flex;flex-direction:column;gap:12px">
            <label class="calc-input-group">
              <span>Statut</span>
              <select id="cp-edit-statut" style="${inputStyle()}">
                ${STATUTS.map(s => `<option value="${escapeAttr(s)}"${s === item.statut ? ' selected' : ''}>${escapeHtml(s)}</option>`).join('')}
              </select>
            </label>
            <label class="calc-input-group">
              <span>Date début</span>
              <input type="date" id="cp-edit-debut" value="${escapeAttr(item.dateDebut)}" style="${inputStyle()}">
            </label>
            <label class="calc-input-group">
              <span>Date fin</span>
              <input type="date" id="cp-edit-fin" value="${escapeAttr(item.dateFin)}" style="${inputStyle()}">
            </label>
            <label class="calc-input-group">
              <span>Cout réel HT</span>
              <input type="number" id="cp-edit-cout" value="${escapeAttr(item.coutReel)}" min="0" step="0.01" style="${inputStyle()}">
            </label>
            <label class="calc-input-group">
              <span>Marge cible (%)</span>
              <input type="number" id="cp-edit-marge" value="${escapeAttr(item.margeCible)}" min="0" step="1" style="${inputStyle()}">
            </label>
            <label class="calc-input-group">
              <span>Notes chantier</span>
              <textarea id="cp-edit-notes" rows="4" style="${inputStyle()}">${escapeHtml(item.notesChantier || '')}</textarea>
            </label>
          </div>
        `,
        `
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
          <button type="button" class="btn btn-primary" onclick="ChantierPaysagisme._validerModification(${escapeAttr(item.id)})">Enregistrer</button>
        `
      );
    },

    _validerModification(id) {
      this.update(id, {
        statut: document.getElementById('cp-edit-statut')?.value || 'planifié',
        dateDebut: document.getElementById('cp-edit-debut')?.value || '',
        dateFin: document.getElementById('cp-edit-fin')?.value || '',
        coutReel: n(document.getElementById('cp-edit-cout')?.value, 0),
        margeCible: n(document.getElementById('cp-edit-marge')?.value, 30),
        notesChantier: document.getElementById('cp-edit-notes')?.value || '',
      });
      closeModal();
      toast('Chantier paysagisme mis à jour', 'success');
    },

    _modalAvancement(id) {
      const item = this.get(id);
      if (!item) return;
      openModal(
        'Avancement chantier',
        `
          <div class="calc-input-group">
            <label>Avancement (%)</label>
            <input type="range" id="cp-av-pct" value="${escapeAttr(item.avancement)}" min="0" max="100" step="5" oninput="document.getElementById('cp-av-label').textContent=this.value + ' %'" style="width:100%">
            <div id="cp-av-label" style="font-size:24px;font-weight:800;color:var(--accent);text-align:center">${round2(item.avancement)} %</div>
          </div>
        `,
        `
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
          <button type="button" class="btn btn-primary" onclick="ChantierPaysagisme._validerAvancement(${escapeAttr(item.id)})">Mettre à jour</button>
        `
      );
    },

    _validerAvancement(id) {
      this.updateAvancement(id, document.getElementById('cp-av-pct')?.value || 0);
      closeModal();
      toast('Avancement mis à jour', 'success');
    },

    _modalPhotos(id) {
      const item = this.get(id);
      if (!item) return;
      openModal(
        'Photos chantier',
        `
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px">
              ${item.photos.length ? item.photos.map(photo => `
                <div style="border:1px solid var(--border);border-radius:var(--r-md,8px);overflow:hidden;background:var(--bg-card)">
                  <img src="${escapeAttr(photo.base64)}" alt="${escapeAttr(photo.type)}" style="width:100%;height:100px;object-fit:cover;display:block">
                  <div style="padding:6px;font-size:12px;color:var(--text);text-align:center">${escapeHtml(photo.type)}</div>
                </div>
              `).join('') : '<div style="color:var(--text-secondary,var(--text));font-size:13px">Aucune photo enregistrée.</div>'}
            </div>
            <div class="card" style="background:var(--bg-card);border:1px solid var(--border)">
              <div style="font-size:13px;color:var(--text-secondary,var(--text))">Ajout manuel via code : <code>ChantierPaysagisme.ajouterPhoto(id, base64, type)</code>.</div>
            </div>
          </div>
        `,
        '<button type="button" class="btn btn-primary" onclick="App.closeModal()">Fermer</button>'
      );
    },
  };

  function load() {
    try {
      const raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    if (window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items || []));
    }
  }

  function nextId(items) {
    return (items || []).reduce((max, item) => Math.max(max, n(item.id, 0)), 0) + 1;
  }

  function getDBChantiers() {
    if (!window.DB) return [];
    if (Array.isArray(window.DB.chantiers)) return window.DB.chantiers;
    if (typeof window.DB.getAll === 'function') return window.DB.getAll(window.DB.KEYS?.chantiers) || [];
    return [];
  }

  function getLinkedChantier(chantierId) {
    if (window.DB && typeof window.DB.getChantier === 'function') return window.DB.getChantier(n(chantierId, 0));
    return getDBChantiers().find(c => String(c.id) === String(chantierId)) || null;
  }

  function getClient(clientId) {
    if (window.DB && typeof window.DB.getClient === 'function') return window.DB.getClient(n(clientId, 0));
    if (window.DB && Array.isArray(window.DB.clients)) return window.DB.clients.find(c => String(c.id) === String(clientId)) || null;
    return null;
  }

  function getDevis() {
    if (!window.DB) return [];
    return Array.isArray(window.DB.devis) ? window.DB.devis : [];
  }

  function findSignedDevis(chantierId) {
    const signed = ['signé', 'signe', 'accepté', 'accepte', 'validé', 'valide'];
    return getDevis().find(devis => {
      const sameChantier = String(devis.chantierId) === String(chantierId);
      const statut = normalizeStatut(devis.statut);
      return sameChantier && signed.indexOf(statut) >= 0;
    }) || null;
  }

  function normalizeStatut(statut) {
    return String(statut || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function filterButton(value, label, active) {
    return `<button type="button" class="btn ${active === value ? 'btn-primary' : 'btn-secondary'}" data-cp-filter="${escapeAttr(value)}">${escapeHtml(label)}</button>`;
  }

  function emptyHTML() {
    return '<div class="card" style="color:var(--text-secondary,var(--text));font-size:14px">Aucun chantier paysagisme pour ce filtre.</div>';
  }

  function badgeStyle(statut) {
    const colors = {
      'planifié': ['#3B82F6', 'rgba(59,130,246,0.12)'],
      'en cours': ['#F59E0B', 'rgba(245,158,11,0.12)'],
      'terminé': ['#10B981', 'rgba(16,185,129,0.12)'],
      'réceptionné': ['#8B5CF6', 'rgba(139,92,246,0.12)'],
    };
    const c = colors[statut] || colors['planifié'];
    return `border:1px solid ${c[0]};background:${c[1]};color:${c[0]};border-radius:999px;padding:4px 9px;font-size:12px;font-weight:700;white-space:nowrap`;
  }

  function openModal(title, bodyHTML, footerHTML) {
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const footerEl = document.getElementById('modal-footer');
    const overlay = document.getElementById('modal-overlay');
    if (!titleEl || !bodyEl || !footerEl || !overlay) {
      toast('Modal PlaqPro indisponible', 'error');
      return;
    }
    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHTML;
    footerEl.innerHTML = footerHTML || '';
    overlay.style.display = 'flex';
  }

  function closeModal() {
    if (window.App && typeof window.App.closeModal === 'function') window.App.closeModal();
    else {
      const overlay = document.getElementById('modal-overlay');
      if (overlay) overlay.style.display = 'none';
    }
  }

  function kv(label, value) {
    return `
      <div style="display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid var(--border);padding:7px 0">
        <span style="color:var(--text-secondary,var(--text));font-size:13px">${escapeHtml(label)}</span>
        <strong style="color:var(--text);font-size:13px;text-align:right">${escapeHtml(value)}</strong>
      </div>
    `;
  }

  function formatAdresse(chantier) {
    if (!chantier) return 'Adresse non disponible';
    return chantier.adresse || [chantier.rue, chantier.codePostal, chantier.ville].filter(Boolean).join(' ') || 'Adresse non renseignée';
  }

  function inputStyle() {
    return 'background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:9px 12px;color:var(--text);width:100%';
  }

  function fmt(value) {
    if (window.Calculs && typeof window.Calculs.fmt === 'function') return window.Calculs.fmt(value || 0);
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value || 0);
  }

  function toast(message, type) {
    if (window.App && typeof window.App.toast === 'function') window.App.toast(message, type || 'success');
  }

  function n(value, def) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : (def || 0);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, n(value, min)));
  }

  function round2(value) {
    return Math.round((value || 0) * 100) / 100;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
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

  window.ChantierPaysagisme = ChantierPaysagisme;
})();
