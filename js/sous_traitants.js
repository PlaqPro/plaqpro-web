/**
 * PlaqPro+ — Module Sous-Traitants
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits réservés
 */

Pages.sousTraitants = function() {
  const div = document.createElement('div');

  if (!document.getElementById('style-st')) {
    const s = document.createElement('style');
    s.id = 'style-st';
    s.textContent = `
      .st-hero { background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; color: #fff; }
      .st-hero h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      .st-hero p  { font-size: 13px; opacity: .8; margin: 0; }
      .st-grid { display: grid; grid-template-columns: 340px 1fr; gap: 20px; }
      @media(max-width:900px){ .st-grid { grid-template-columns: 1fr; } }
      .st-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 20px; }
      .st-section { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary); padding-bottom: 8px;
        border-bottom: 1px solid var(--border); margin: 16px 0 12px; }
      .st-section:first-child { margin-top: 0; }
      .st-card { background: var(--bg-primary); border: 1px solid var(--border);
        border-radius: var(--radius-md); padding: 14px; margin-bottom: 10px;
        cursor: pointer; transition: border-color .2s; }
      .st-card:hover { border-color: var(--accent); }
      .st-card.selected { border-color: #0d9488; background: rgba(13,148,136,.06); }
      .st-card-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
      .st-card-meta { font-size: 12px; color: var(--text-tertiary); }
      .st-badge { display: inline-block; padding: 2px 8px; border-radius: 20px;
        font-size: 11px; font-weight: 600; margin-left: 6px; }
      .st-badge.ok   { background: rgba(16,185,129,.12); color: #10b981; }
      .st-badge.warn { background: rgba(245,158,11,.12);  color: #f59e0b; }
      .st-badge.fail { background: rgba(239,68,68,.12);   color: #ef4444; }
      .st-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
      .st-form-full { margin-bottom: 10px; }
      .st-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
      .st-input { width: 100%; padding: 8px 12px; background: var(--bg-primary);
        border: 1px solid var(--border); border-radius: var(--radius-sm);
        color: var(--text-primary); font-size: 13px; }
      .st-input:focus { outline: none; border-color: #0d9488; }
      .st-alerte { border-radius: var(--radius-md); padding: 10px 14px;
        font-size: 12px; line-height: 1.6; margin-bottom: 8px; }
      .st-alerte.fail { background: rgba(239,68,68,.08); border-left: 3px solid #ef4444; }
      .st-alerte.warn { background: rgba(245,158,11,.08); border-left: 3px solid #f59e0b; }
      .st-alerte.ok   { background: rgba(16,185,129,.08); border-left: 3px solid #10b981; }
      .st-corps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin-bottom:12px; }
      .st-corps-btn { padding: 7px 6px; border: 1px solid var(--border);
        border-radius: var(--radius-sm); background: var(--bg-primary);
        cursor: pointer; text-align: center; font-size: 11px;
        color: var(--text-secondary); transition: all .15s; }
      .st-corps-btn.active { border-color: #0d9488; background: rgba(13,148,136,.1);
        color: #0d9488; font-weight: 600; }
    `;
    document.head.appendChild(s);
  }

  const CORPS = [
    { key:'plaquiste',   label:'Plaquiste',    icon:'🧱' },
    { key:'peintre',     label:'Peintre',       icon:'🎨' },
    { key:'electricien', label:'Électricien',   icon:'⚡' },
    { key:'plombier',    label:'Plombier',      icon:'🔧' },
    { key:'carreleur',   label:'Carreleur',     icon:'🔲' },
    { key:'macon',       label:'Maçon',         icon:'🏗' },
    { key:'menuisier',   label:'Menuisier',     icon:'🪵' },
    { key:'serrurier',   label:'Serrurier',     icon:'🔩' },
    { key:'paysagiste',  label:'Paysagiste',    icon:'🌿' },
    { key:'chauffagiste',label:'Chauffagiste',  icon:'🌡️' },
    { key:'isolation',   label:'Isolation',     icon:'🧊' },
    { key:'autre',       label:'Autre',         icon:'📋' },
  ];

  div.innerHTML = `
    <div class="st-hero">
      <h1>🤝 Sous-Traitants</h1>
      <p>Gérez votre réseau de sous-traitants — contrats, assurances, conformité loi 75-1334</p>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div style="font-size:13px;color:var(--text-secondary)" id="st-count">Chargement...</div>
      <button class="btn btn-primary" onclick="ST.ouvrirFormulaire()">+ Nouveau sous-traitant</button>
    </div>

    <div class="st-grid">
      <!-- LISTE -->
      <div>
        <div style="margin-bottom:10px">
          <input class="form-control" id="st-search" placeholder="🔍 Rechercher un sous-traitant..."
            oninput="ST.filtrer(this.value)" style="font-size:13px">
        </div>
        <div id="st-liste">
          <div style="text-align:center;padding:40px;color:var(--text-tertiary);font-size:13px">
            Aucun sous-traitant — cliquez sur "+ Nouveau"
          </div>
        </div>
      </div>

      <!-- DETAIL -->
      <div id="st-detail">
        <div class="st-panel" style="text-align:center;padding:60px 20px;color:var(--text-tertiary)">
          <div style="font-size:48px;margin-bottom:16px">🤝</div>
          <div style="font-size:14px">Sélectionnez un sous-traitant pour voir sa fiche</div>
        </div>
      </div>
    </div>

    <!-- MODAL FORMULAIRE -->
    <div id="st-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:500;
      align-items:center;justify-content:center;padding:20px">
      <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);
        padding:28px;max-width:640px;width:100%;max-height:90vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h3 style="font-size:17px;font-weight:700" id="st-modal-title">Nouveau sous-traitant</h3>
          <button onclick="ST.fermerFormulaire()" style="background:none;border:none;color:var(--text-tertiary);cursor:pointer;font-size:20px">✕</button>
        </div>

        <div class="st-section">🏢 Identité</div>
        <div class="st-form-row">
          <div><div class="st-label">Nom / Raison sociale *</div>
            <input class="st-input" id="st-f-nom" placeholder="Dupont Plâtrerie"></div>
          <div><div class="st-label">Prénom (si artisan)</div>
            <input class="st-input" id="st-f-prenom" placeholder="Jean"></div>
        </div>
        <div class="st-form-row">
          <div><div class="st-label">SIRET *</div>
            <input class="st-input" id="st-f-siret" placeholder="123 456 789 00012" maxlength="17"></div>
          <div><div class="st-label">Statut juridique</div>
            <select class="st-input" id="st-f-statut">
              <option value="ae">Auto-entrepreneur</option>
              <option value="eurl">EURL</option>
              <option value="sarl">SARL</option>
              <option value="sas">SAS / SASU</option>
              <option value="ei">EI</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
        <div class="st-form-row">
          <div><div class="st-label">Téléphone</div>
            <input class="st-input" id="st-f-tel" placeholder="06 12 34 56 78"></div>
          <div><div class="st-label">Email</div>
            <input class="st-input" id="st-f-email" placeholder="contact@entreprise.fr"></div>
        </div>
        <div class="st-form-full">
          <div class="st-label">Adresse</div>
          <input class="st-input" id="st-f-adresse" placeholder="12 rue des Artisans">
        </div>
        <div class="st-form-row">
          <div>
            <div class="st-label">Code postal</div>
            <input class="st-input" id="st-f-cp" placeholder="69000" maxlength="5" inputmode="numeric">
          </div>
          <div>
            <div class="st-label">Ville</div>
            <div id="st-f-cp-select"></div>
            <input class="st-input" id="st-f-ville" placeholder="Lyon" readonly>
          </div>
        </div>

        <div class="st-section">🔨 Corps de métier</div>
        <div class="st-corps-grid" id="st-corps-grid">
          ${CORPS.map(c => `
            <button class="st-corps-btn" data-key="${c.key}" onclick="ST.toggleCorps(this)">
              ${c.icon} ${c.label}
            </button>
          `).join('')}
        </div>
        <div class="st-form-full">
          <div class="st-label">Spécialités / Qualifications</div>
          <input class="st-input" id="st-f-qualifs" placeholder="Qualibat 4411, RGE, QUALIFELEC...">
        </div>

        <div class="st-section">🛡️ Assurances (obligatoires)</div>
        <div class="st-form-row">
          <div><div class="st-label">Assureur RC Pro *</div>
            <input class="st-input" id="st-f-assureur-rc" placeholder="AXA, Allianz..."></div>
          <div><div class="st-label">N° police RC Pro</div>
            <input class="st-input" id="st-f-police-rc" placeholder="RC-2026-XXXXX"></div>
        </div>
        <div class="st-form-row">
          <div><div class="st-label">Expiration RC Pro *</div>
            <input class="st-input" id="st-f-exp-rc" type="date"></div>
          <div><div class="st-label">Expiration Décennale</div>
            <input class="st-input" id="st-f-exp-dec" type="date"></div>
        </div>
        <div class="st-form-row">
          <div><div class="st-label">Assureur Décennale</div>
            <input class="st-input" id="st-f-assureur-dec" placeholder="Assureur décennale"></div>
          <div><div class="st-label">N° police Décennale</div>
            <input class="st-input" id="st-f-police-dec" placeholder="DEC-2026-XXXXX"></div>
        </div>

        <div class="st-section">💰 Conditions financières</div>
        <div class="st-form-row">
          <div><div class="st-label">Taux horaire HT (€/h)</div>
            <input class="st-input" id="st-f-taux" type="number" placeholder="45" min="0" step="0.5"></div>
          <div><div class="st-label">Délai paiement (jours)</div>
            <input class="st-input" id="st-f-delai" type="number" placeholder="30" min="0" max="60"></div>
        </div>
        <div class="st-form-row">
          <div><div class="st-label">IBAN</div>
            <input class="st-input" id="st-f-iban" placeholder="FR76 XXXX XXXX XXXX"></div>
          <div><div class="st-label">Retenue de garantie</div>
            <select class="st-input" id="st-f-retenue">
              <option value="0">Aucune</option>
              <option value="5" selected>5% (standard)</option>
              <option value="10">10%</option>
            </select>
          </div>
        </div>

        <div class="st-section">📋 Notes</div>
        <div class="st-form-full">
          <textarea class="st-input" id="st-f-notes" rows="2"
            placeholder="Notes, conditions particulières, historique..."></textarea>
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
          <button class="btn btn-secondary" onclick="ST.fermerFormulaire()">Annuler</button>
          <button class="btn btn-primary" onclick="ST.sauvegarder()">💾 Sauvegarder</button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => ST.init(), 50);
  return div;
};

const ST = {
  _corps: [],
  _editId: null,

  init() {
    this.renderListe();
  },

  filtrer(q) {
    this.renderListe(q);
  },

  renderListe(q = '') {
    const sts = DB.getSousTraitants().filter(st =>
      !q || (st.nom||'').toLowerCase().includes(q.toLowerCase()) ||
      (st.prenom||'').toLowerCase().includes(q.toLowerCase()) ||
      (st.corps||[]).join(' ').toLowerCase().includes(q.toLowerCase())
    );

    const count = document.getElementById('st-count');
    if (count) count.textContent = `${sts.length} sous-traitant${sts.length > 1 ? 's' : ''}`;

    const liste = document.getElementById('st-liste');
    if (!liste) return;

    if (sts.length === 0) {
      liste.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-tertiary);font-size:13px">
        ${q ? 'Aucun résultat' : 'Aucun sous-traitant — cliquez sur "+ Nouveau"'}</div>`;
      return;
    }

    liste.innerHTML = sts.map(st => {
      const alertes = this._getAlertes(st);
      const badge = alertes.some(a => a.type === 'fail')
        ? '<span class="st-badge fail">⚠️ Alerte</span>'
        : alertes.some(a => a.type === 'warn')
          ? '<span class="st-badge warn">⚠ Attention</span>'
          : '<span class="st-badge ok">✅ OK</span>';
      return `
        <div class="st-card" onclick="ST.voirDetail(${st.id})">
          <div class="st-card-name">${st.nom || ''} ${st.prenom || ''} ${badge}</div>
          <div class="st-card-meta">
            ${(st.corps||[]).join(', ')} · ${st.statut || ''} · ${st.ville || ''}
          </div>
        </div>`;
    }).join('');
  },

  voirDetail(id) {
    const st = DB.getSousTraitantById(id);
    if (!st) return;
    const alertes = this._getAlertes(st);
    const detail = document.getElementById('st-detail');
    if (!detail) return;

    document.querySelectorAll('.st-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`.st-card[onclick="ST.voirDetail(${id})"]`);
    if (card) card.classList.add('selected');

    detail.innerHTML = `
      <div class="st-panel">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
          <div>
            <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em">${st.nom || ''} ${st.prenom || ''}</div>
            <div style="font-size:13px;color:var(--text-tertiary);margin-top:4px">
              ${st.statut || ''} · SIRET : ${st.siret || '—'}
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="ST.ouvrirFormulaire(${id})">✏️ Modifier</button>
            <button class="btn btn-primary btn-sm" onclick="ST.genererContrat(${id})">📄 Contrat</button>
          </div>
        </div>

        ${alertes.length > 0 ? `
          <div style="margin-bottom:16px">
            ${alertes.map(a => `<div class="st-alerte ${a.type}">${a.msg}</div>`).join('')}
          </div>` : `
          <div class="st-alerte ok" style="margin-bottom:16px">✅ Dossier complet — conformité OK</div>`
        }

        <div class="st-section">🔨 Corps de métier</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
          ${(st.corps||[]).map(c => `<span style="background:rgba(13,148,136,.1);color:#0d9488;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600">${c}</span>`).join('') || '—'}
        </div>
        ${st.qualifs ? `<div style="font-size:12px;color:var(--text-tertiary);margin-bottom:16px">🏅 ${st.qualifs}</div>` : ''}

        <div class="st-section">📞 Contact</div>
        <div style="font-size:13px;display:flex;flex-direction:column;gap:6px;margin-bottom:16px">
          ${st.tel   ? `<div>📱 <a href="tel:${st.tel}" style="color:var(--accent)">${st.tel}</a></div>` : ''}
          ${st.email ? `<div>✉️ <a href="mailto:${st.email}" style="color:var(--accent)">${st.email}</a></div>` : ''}
          ${st.adresse ? `<div>📍 ${st.adresse}</div>` : ''}
        </div>

        <div class="st-section">🛡️ Assurances</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
          <div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px">
            <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">RC PRO</div>
            <div style="font-size:13px;font-weight:600">${st.assureurRc || '—'}</div>
            <div style="font-size:11px;color:var(--text-tertiary)">Police : ${st.policeRc || '—'}</div>
            <div style="font-size:11px;margin-top:4px;color:${this._expColor(st.expRc)}">
              Expire : ${st.expRc ? new Date(st.expRc).toLocaleDateString('fr-FR') : '—'}
            </div>
          </div>
          <div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px">
            <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">DÉCENNALE</div>
            <div style="font-size:13px;font-weight:600">${st.assureurDec || '—'}</div>
            <div style="font-size:11px;color:var(--text-tertiary)">Police : ${st.policeDec || '—'}</div>
            <div style="font-size:11px;margin-top:4px;color:${this._expColor(st.expDec)}">
              Expire : ${st.expDec ? new Date(st.expDec).toLocaleDateString('fr-FR') : '—'}
            </div>
          </div>
        </div>

        <div class="st-section">💰 Conditions financières</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;font-size:13px">
          <div>Taux : <strong>${st.taux ? st.taux + ' €/h' : '—'}</strong></div>
          <div>Paiement : <strong>${st.delai ? st.delai + ' jours' : '—'}</strong></div>
          <div>Retenue : <strong>${st.retenue ? st.retenue + '%' : '—'}</strong></div>
        </div>
        ${st.iban ? `<div style="font-size:12px;color:var(--text-tertiary);margin-bottom:16px">IBAN : ${st.iban}</div>` : ''}

        ${st.notes ? `<div class="st-section">📋 Notes</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:16px">${st.notes}</div>` : ''}

        <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:16px;border-top:1px solid var(--border)">
          <button class="btn btn-primary" onclick="ST.genererContrat(${id})">📄 Générer contrat ST</button>
          <button class="btn btn-secondary" onclick="ST.affecter(${id})">🏗 Affecter à un chantier</button>
          <button class="btn btn-secondary" style="color:#ef4444" onclick="ST.supprimer(${id})">🗑 Supprimer</button>
        </div>
      </div>`;
  },

  _expColor(dateStr) {
    if (!dateStr) return 'var(--text-tertiary)';
    const exp = new Date(dateStr);
    const now = new Date();
    const diff = (exp - now) / (1000 * 60 * 60 * 24);
    if (diff < 0)   return '#ef4444';
    if (diff < 60)  return '#f59e0b';
    return '#10b981';
  },

  _getAlertes(st) {
    const alertes = [];
    const now = new Date();
    if (!st.siret) alertes.push({ type:'fail', msg:'❌ SIRET manquant — obligatoire loi 75-1334' });
    if (!st.assureurRc || !st.expRc) alertes.push({ type:'fail', msg:'❌ RC Pro manquante — vérification obligatoire avant mission' });
    else {
      const diff = (new Date(st.expRc) - now) / (1000 * 60 * 60 * 24);
      if (diff < 0)  alertes.push({ type:'fail', msg:`❌ RC Pro expirée depuis ${Math.abs(Math.round(diff))} jours — NE PAS AFFECTER` });
      else if (diff < 60) alertes.push({ type:'warn', msg:`⚠️ RC Pro expire dans ${Math.round(diff)} jours — renouvellement à anticiper` });
    }
    if (st.expDec) {
      const diff = (new Date(st.expDec) - now) / (1000 * 60 * 60 * 24);
      if (diff < 0)  alertes.push({ type:'fail', msg:`❌ Décennale expirée — travaux non couverts` });
      else if (diff < 60) alertes.push({ type:'warn', msg:`⚠️ Décennale expire dans ${Math.round(diff)} jours` });
    }
    if (st.statut === 'ae') alertes.push({ type:'warn', msg:'⚠️ Auto-entrepreneur : vérifier plafond CA (77 700€/an) — risque requalification' });
    return alertes;
  },

  _attachCpAutocomplete() {
    const cpInput = document.getElementById('st-f-cp');
    const villeInput = document.getElementById('st-f-ville');
    const selectContainer = document.getElementById('st-f-cp-select');
    if (!cpInput || !villeInput || !selectContainer) return;

    cpInput.addEventListener('keyup', function() {
      const cp = this.value.replace(/\D/g, '');
      if (cp.length !== 5) { selectContainer.innerHTML = ''; return; }
      fetch(`https://geo.api.gouv.fr/communes?codePostal=${cp}&fields=nom&format=json`)
        .then(r => r.json())
        .then(communes => {
          selectContainer.innerHTML = '';
          if (!communes || communes.length === 0) return;
          if (communes.length === 1) {
            villeInput.value = communes[0].nom;
            villeInput.readOnly = true;
          } else {
            const sel = document.createElement('select');
            sel.className = 'st-input';
            sel.style.marginBottom = '6px';
            sel.innerHTML = '<option value="">— Choisir la commune —</option>' +
              communes.map(c => `<option value="${c.nom}">${c.nom}</option>`).join('');
            sel.addEventListener('change', function() {
              if (this.value) { villeInput.value = this.value; villeInput.readOnly = true; }
            });
            selectContainer.appendChild(sel);
          }
        })
        .catch(() => { villeInput.readOnly = false; });
    });
  },

  toggleCorps(btn) {
    btn.classList.toggle('active');
    this._corps = [...document.querySelectorAll('.st-corps-btn.active')].map(b => b.dataset.key);
  },

  ouvrirFormulaire(id = null) {
    this._editId = id;
    this._corps = [];
    document.querySelectorAll('.st-corps-btn').forEach(b => b.classList.remove('active'));
    const fields = ['nom','prenom','siret','statut','tel','email','adresse','cp','ville','qualifs',
      'assureur-rc','police-rc','exp-rc','exp-dec','assureur-dec','police-dec',
      'taux','delai','iban','retenue','notes'];
    fields.forEach(f => { const el = document.getElementById('st-f-'+f); if (el) el.value = ''; });

    if (id) {
      const st = DB.getSousTraitantById(id);
      if (st) {
        document.getElementById('st-f-nom').value       = st.nom || '';
        document.getElementById('st-f-prenom').value    = st.prenom || '';
        document.getElementById('st-f-siret').value     = st.siret || '';
        document.getElementById('st-f-statut').value    = st.statut || 'ae';
        document.getElementById('st-f-tel').value       = st.tel || '';
        document.getElementById('st-f-email').value     = st.email || '';
        document.getElementById('st-f-adresse').value   = st.adresse || '';
        document.getElementById('st-f-qualifs').value   = st.qualifs || '';
        document.getElementById('st-f-assureur-rc').value = st.assureurRc || '';
        document.getElementById('st-f-police-rc').value   = st.policeRc || '';
        document.getElementById('st-f-exp-rc').value      = st.expRc || '';
        document.getElementById('st-f-exp-dec').value     = st.expDec || '';
        document.getElementById('st-f-assureur-dec').value= st.assureurDec || '';
        document.getElementById('st-f-police-dec').value  = st.policeDec || '';
        document.getElementById('st-f-taux').value      = st.taux || '';
        document.getElementById('st-f-delai').value     = st.delai || '30';
        document.getElementById('st-f-iban').value      = st.iban || '';
        document.getElementById('st-f-retenue').value   = st.retenue || '5';
        document.getElementById('st-f-notes').value     = st.notes || '';
        document.getElementById('st-f-cp').value        = st.cp || '';
        document.getElementById('st-f-ville').value     = st.ville || '';
        if (st.ville) document.getElementById('st-f-ville').readOnly = true;
        this._corps = st.corps || [];
        this._corps.forEach(key => {
          const btn = document.querySelector(`.st-corps-btn[data-key="${key}"]`);
          if (btn) btn.classList.add('active');
        });
      }
      document.getElementById('st-modal-title').textContent = 'Modifier sous-traitant';
    } else {
      document.getElementById('st-modal-title').textContent = 'Nouveau sous-traitant';
      document.getElementById('st-f-delai').value   = '30';
      document.getElementById('st-f-retenue').value = '5';
    }
    document.getElementById('st-modal').style.display = 'flex';
    if (!this._cpAutocompleteAttached) {
      this._attachCpAutocomplete();
      this._cpAutocompleteAttached = true;
    }
  },

  fermerFormulaire() {
    document.getElementById('st-modal').style.display = 'none';
  },

  sauvegarder() {
    const nom = document.getElementById('st-f-nom').value.trim();
    if (!nom) { App.toast('Le nom est obligatoire', 'error'); return; }
    const siret = document.getElementById('st-f-siret').value.trim();
    if (!siret) { App.toast('Le SIRET est obligatoire', 'error'); return; }

    const data = {
      nom:         nom,
      prenom:      document.getElementById('st-f-prenom').value.trim(),
      siret:       siret,
      statut:      document.getElementById('st-f-statut').value,
      tel:         document.getElementById('st-f-tel').value.trim(),
      email:       document.getElementById('st-f-email').value.trim(),
      adresse:     document.getElementById('st-f-adresse').value.trim(),
      qualifs:     document.getElementById('st-f-qualifs').value.trim(),
      assureurRc:  document.getElementById('st-f-assureur-rc').value.trim(),
      policeRc:    document.getElementById('st-f-police-rc').value.trim(),
      expRc:       document.getElementById('st-f-exp-rc').value,
      expDec:      document.getElementById('st-f-exp-dec').value,
      assureurDec: document.getElementById('st-f-assureur-dec').value.trim(),
      policeDec:   document.getElementById('st-f-police-dec').value.trim(),
      taux:        parseFloat(document.getElementById('st-f-taux').value) || 0,
      delai:       parseInt(document.getElementById('st-f-delai').value) || 30,
      iban:        document.getElementById('st-f-iban').value.trim(),
      retenue:     parseInt(document.getElementById('st-f-retenue').value) || 5,
      notes:       document.getElementById('st-f-notes').value.trim(),
      cp:          document.getElementById('st-f-cp').value.trim(),
      ville:       document.getElementById('st-f-ville').value.trim(),
      corps:       [...document.querySelectorAll('.st-corps-btn.active')].map(b => b.dataset.key),
    };

    if (this._editId) {
      DB.updateSousTraitant(this._editId, data);
      App.toast('Sous-traitant mis à jour ✅', 'success');
    } else {
      DB.addSousTraitant(data);
      App.toast('Sous-traitant ajouté ✅', 'success');
    }
    this.fermerFormulaire();
    this.renderListe();
  },

  supprimer(id) {
    if (!confirm('Supprimer ce sous-traitant ?')) return;
    DB.deleteSousTraitant(id);
    document.getElementById('st-detail').innerHTML = `
      <div class="st-panel" style="text-align:center;padding:60px 20px;color:var(--text-tertiary)">
        <div style="font-size:48px;margin-bottom:16px">🤝</div>
        <div style="font-size:14px">Sélectionnez un sous-traitant pour voir sa fiche</div>
      </div>`;
    this.renderListe();
    App.toast('Sous-traitant supprimé', 'success');
  },

  affecter(stId) {
    const st = DB.getSousTraitantById(stId);
    if (!st) return;
    const chantiers = DB.chantiers || [];
    if (!chantiers.length) { App.toast('Aucun chantier disponible', 'warning'); return; }
    const liste = chantiers.map(c => `<option value="${c.id}">${c.nom}</option>`).join('');
    App.openModal('Affecter à un chantier',
      `<div style="padding:16px">
        <div style="margin-bottom:12px;font-size:14px">Affecter <strong>${st.nom}</strong> au chantier :</div>
        <select class="form-control" id="st-aff-chantier" style="margin-bottom:12px">${liste}</select>
        <div style="margin-bottom:8px"><div class="st-label">Travaux à réaliser</div>
          <textarea class="form-control" id="st-aff-travaux" rows="2" placeholder="Description des travaux sous-traités..."></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><div class="st-label">Montant HT (€)</div>
            <input type="number" class="form-control" id="st-aff-montant" placeholder="0.00"></div>
          <div><div class="st-label">Date début prévue</div>
            <input type="date" class="form-control" id="st-aff-date"></div>
        </div>
      </div>`,
      `<button class="btn btn-primary" onclick="ST._confirmerAffectation(${stId})">✅ Affecter</button>
       <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>`
    );
  },

  _confirmerAffectation(stId) {
    const chantierId = document.getElementById('st-aff-chantier')?.value;
    const travaux    = document.getElementById('st-aff-travaux')?.value;
    const montant    = document.getElementById('st-aff-montant')?.value;
    const date       = document.getElementById('st-aff-date')?.value;
    const chantier   = DB.getChantier(parseInt(chantierId));
    const st         = DB.getSousTraitantById(stId);
    if (!chantier || !st) return;
    const affectations = chantier.sousTraitants || [];
    affectations.push({ stId, travaux, montant: parseFloat(montant)||0, date, statut:'En cours' });
    DB.updateChantier(parseInt(chantierId), { sousTraitants: affectations });
    App.closeModal();
    App.toast(`${st.nom} affecté au chantier ${chantier.nom} ✅`, 'success');
  },

  genererContrat(stId) {
    const st = DB.getSousTraitantById(stId);
    if (!st) return;
    const config  = DB.getConfig();
    const date    = new Date().toLocaleDateString('fr-FR');
    const donneur = config.nomEntreprise || 'AATB';
    const adresseDonneur = config.adresse || '';
    const siretDonneur   = config.siret   || '';

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Contrat de sous-traitance — ${st.nom}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;color:#1a1a2e;margin:0;padding:30px;line-height:1.6}
      .header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #0d9488;margin-bottom:24px}
      .header-title{font-size:20px;font-weight:800;color:#0d9488}
      h3{font-size:13px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.05em;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #0d9488}
      .parties{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:16px 0}
      .partie{background:#f0fdfa;border:1px solid #0d9488;border-radius:8px;padding:14px}
      .partie-title{font-size:11px;font-weight:700;text-transform:uppercase;color:#0d9488;margin-bottom:8px}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th{background:#0d9488;color:#fff;padding:7px 10px;text-align:left;font-size:11px}
      td{padding:7px 10px;border-bottom:1px solid #eee;font-size:12px}
      .article{margin:16px 0;padding:14px;background:#f8f9ff;border-radius:6px;font-size:12px}
      .article-title{font-weight:700;margin-bottom:8px;color:#1a1a2e}
      .warning{background:#fff8f0;border-left:4px solid #f59e0b;padding:10px 14px;border-radius:0 6px 6px 0;font-size:11px;margin:12px 0}
      .sign-zone{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}
      .sign-box{border-top:1px solid #ccc;padding-top:10px;text-align:center;font-size:11px;color:#666}
      .footer-doc{margin-top:30px;padding-top:12px;border-top:1px solid #ddd;font-size:10px;color:#888;text-align:center}
      @media print{body{padding:15px}}
    </style></head><body>

    <div class="header">
      <div>
        <div class="header-title">📄 Contrat de Sous-Traitance</div>
        <div style="font-size:11px;color:#666;margin-top:4px">Loi n°75-1334 du 31 décembre 1975 relative à la sous-traitance</div>
      </div>
      <div style="text-align:right;font-size:11px;color:#666">
        Réf. : ST-${Date.now().toString().slice(-6)}<br>
        Date : ${date}
      </div>
    </div>

    <h3>Les parties</h3>
    <div class="parties">
      <div class="partie">
        <div class="partie-title">🏢 Donneur d'ordre (Entrepreneur principal)</div>
        <strong>${donneur}</strong><br>
        ${adresseDonneur}<br>
        SIRET : ${siretDonneur}<br>
        ${config.telephone || ''}<br>
        ${config.email || ''}
      </div>
      <div class="partie">
        <div class="partie-title">🤝 Sous-traitant</div>
        <strong>${st.nom} ${st.prenom || ''}</strong><br>
        ${st.adresse || ''}<br>
        SIRET : ${st.siret || '—'}<br>
        ${st.tel || ''}<br>
        ${st.email || ''}
      </div>
    </div>

    <div class="warning">
      ⚠️ <strong>Agrément maître d'ouvrage :</strong> Conformément à l'article 3 de la loi 75-1334, le sous-traitant doit être agréé par le maître d'ouvrage avant tout début d'exécution. L'entrepreneur principal s'engage à obtenir cet agrément.
    </div>

    <h3>Objet du contrat</h3>
    <div class="article">
      <div class="article-title">Article 1 — Désignation des travaux sous-traités</div>
      Le présent contrat a pour objet de confier au sous-traitant l'exécution des travaux suivants :<br><br>
      Corps de métier : <strong>${(st.corps||[]).join(', ') || '—'}</strong><br>
      Qualifications : ${st.qualifs || '—'}<br><br>
      <em>Description détaillée des travaux : à compléter lors de l'affectation au chantier</em>
    </div>

    <h3>Conditions financières</h3>
    <table>
      <thead><tr><th>Élément</th><th>Valeur</th></tr></thead>
      <tbody>
        <tr><td>Taux horaire HT convenu</td><td><strong>${st.taux ? st.taux + ' €/h' : 'À définir par avenant'}</strong></td></tr>
        <tr><td>Délai de paiement</td><td><strong>${st.delai || 30} jours</strong> après réception de la facture</td></tr>
        <tr><td>Retenue de garantie</td><td><strong>${st.retenue || 5}%</strong> — libérée à la levée des réserves</td></tr>
        <tr><td>IBAN sous-traitant</td><td>${st.iban || '—'}</td></tr>
        <tr><td>Paiement direct (art. 6 loi 75-1334)</td><td>Le sous-traitant peut exiger le paiement direct du maître d'ouvrage</td></tr>
      </tbody>
    </table>

    <h3>Obligations du sous-traitant</h3>
    <div class="article">
      <div class="article-title">Article 2 — Assurances obligatoires</div>
      Le sous-traitant déclare être couvert par les assurances suivantes :<br><br>
      <strong>RC Professionnelle :</strong> ${st.assureurRc || '—'} · Police n° ${st.policeRc || '—'} · Exp. ${st.expRc ? new Date(st.expRc).toLocaleDateString('fr-FR') : '—'}<br>
      <strong>Décennale :</strong> ${st.assureurDec || '—'} · Police n° ${st.policeDec || '—'} · Exp. ${st.expDec ? new Date(st.expDec).toLocaleDateString('fr-FR') : '—'}<br><br>
      Le sous-traitant s'engage à maintenir ces assurances à jour pendant toute la durée du contrat et à fournir les attestations sur demande.
    </div>

    <div class="article">
      <div class="article-title">Article 3 — Travail dissimulé (L8221-1 et suivants du Code du Travail)</div>
      Le sous-traitant atteste sur l'honneur :<br>
      ✓ Être à jour de ses obligations fiscales et sociales<br>
      ✓ N'employer que des salariés déclarés<br>
      ✓ Fournir sur demande les documents de vigilance (attestation URSSAF, liste salariés étrangers)<br><br>
      <strong>L'entrepreneur principal effectuera les vérifications périodiques tous les 6 mois conformément à l'article L8222-1 du Code du Travail.</strong>
    </div>

    <div class="article">
      <div class="article-title">Article 4 — Obligations générales</div>
      ✓ Respecter les règles de l'art et les normes DTU applicables<br>
      ✓ Respecter le plan de prévention et les consignes de sécurité du chantier<br>
      ✓ Fournir les matériaux et outillages nécessaires sauf accord contraire<br>
      ✓ Se conformer au planning général de l'entreprise principale<br>
      ✓ Souscrire une assurance dommages-ouvrage si requis
    </div>

    <h3>Résiliation</h3>
    <div class="article">
      Le contrat peut être résilié par l'une ou l'autre des parties avec un préavis de <strong>8 jours</strong> par lettre recommandée avec AR. En cas de faute grave, la résiliation peut être immédiate.
    </div>

    <h3>Litiges</h3>
    <div class="article">
      En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut, le Tribunal compétent sera celui du siège social de l'entrepreneur principal.
    </div>

    <div class="sign-zone">
      <div class="sign-box">
        <div style="height:60px"></div>
        <strong>${donneur}</strong><br>
        L'Entrepreneur Principal<br>
        Date et signature
      </div>
      <div class="sign-box">
        <div style="height:60px"></div>
        <strong>${st.nom} ${st.prenom || ''}</strong><br>
        Le Sous-Traitant<br>
        Date et signature précédée de "Lu et approuvé"
      </div>
    </div>

    <div class="footer-doc">
      Document généré par PlaqPro+ · ${donneur} · Référence loi n°75-1334 du 31/12/1975 · Article L8222-1 Code du Travail
    </div>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
};
