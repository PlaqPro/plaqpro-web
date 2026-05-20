// ============================================================
//  PLAQPRO WEB — Application principale
//  app.js
// ============================================================

const App = {

  currentPage: 'dashboard',
  currentModal: null,

  // ── Initialisation ────────────────────────────────────────
  init() {
    this.renderSidebar();
    this.navigate('dashboard');
    this.bindEvents();
  },

  // ── Navigation ────────────────────────────────────────────
  navigate(page, params = {}) {
    this.currentPage = page;
    this.currentParams = params;

    // Mettre à jour la sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Rendre la page
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.className = 'content fade-in';

    const pages = {
      dashboard:  () => Pages.dashboard(),
      clients:    () => Pages.clients(),
      chantiers:  () => Pages.chantiers(params),
      metrages:   () => Pages.metrages(params),
      cloisons:   () => Pages.cloisons(params),
      peinture:   () => Pages.peinture(params),
      devis:      () => Pages.devis(params),
      produits:   () => Pages.produits(),
      config:     () => Pages.config(),
    };

    if (pages[page]) {
      content.appendChild(pages[page]());
    }

    // Mettre à jour le topbar
    this.updateTopbar(page, params);
  },

  updateTopbar(page, params) {
    const titles = {
      dashboard: 'Tableau de bord',
      clients:   'Clients',
      chantiers: 'Chantiers',
      metrages:  'Métrés',
      cloisons:  'Cloisons',
      peinture:  'Peinture',
      devis:     'Devis',
      produits:  'Base tarifaire',
      config:    'Configuration',
    };
    document.getElementById('topbar-title').textContent = titles[page] || page;
  },

  // ── Sidebar ───────────────────────────────────────────────
  renderSidebar() {
    const nav = [
      { section: 'Principal' },
      { page: 'dashboard', icon: '⊞', label: 'Tableau de bord' },
      { section: 'Gestion' },
      { page: 'clients',   icon: '👤', label: 'Clients' },
      { page: 'chantiers', icon: '🏗', label: 'Chantiers' },
      { section: 'Travaux' },
      { page: 'metrages',  icon: '📐', label: 'Métrés' },
      { page: 'cloisons',  icon: '🧱', label: 'Cloisons' },
      { page: 'peinture',  icon: '🎨', label: 'Peinture' },
      { section: 'Commercial' },
      { page: 'devis',     icon: '📄', label: 'Devis' },
      { section: 'Paramètres' },
      { page: 'produits',  icon: '💰', label: 'Base tarifaire' },
      { page: 'config',    icon: '⚙️',  label: 'Configuration' },
    ];

    const sidebar = document.getElementById('sidebar-nav');
    sidebar.innerHTML = '';

    nav.forEach(item => {
      if (item.section) {
        const s = document.createElement('div');
        s.className = 'sidebar-section';
        s.innerHTML = `<div class="sidebar-section-title">${item.section}</div>`;
        sidebar.appendChild(s);
      } else {
        const a = document.createElement('a');
        a.className = 'nav-item';
        a.dataset.page = item.page;
        a.href = '#';
        a.innerHTML = `<span class="nav-icon">${item.icon}</span><span>${item.label}</span>`;
        a.addEventListener('click', e => { e.preventDefault(); App.navigate(item.page); });
        sidebar.appendChild(a);
      }
    });
  },

  // ── Événements globaux ────────────────────────────────────
  bindEvents() {
    // Fermer modal avec Échap
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  // ── Modales ───────────────────────────────────────────────
  openModal(title, content, footer) {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-body').appendChild(content);
    document.getElementById('modal-footer').innerHTML = footer || '';
    overlay.classList.add('open');
    this.currentModal = overlay;
  },

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('open');
  },

  // ── Notification toast ────────────────────────────────────
  toast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: ${type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--accent)'};
      color: white; padding: 12px 20px; border-radius: var(--radius-full);
      font-size: 14px; font-weight: 500; box-shadow: var(--shadow-lg);
      animation: fadeIn 0.2s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  // ── Helpers HTML ─────────────────────────────────────────
  el(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v);
    });
    children.forEach(c => {
      if (typeof c === 'string') el.insertAdjacentHTML('beforeend', c);
      else if (c) el.appendChild(c);
    });
    return el;
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  },

  statut(s) {
    const map = {
      'En cours':   'badge-blue',
      'En attente': 'badge-orange',
      'Terminé':    'badge-green',
      'Annulé':     'badge-red',
      'Brouillon':  'badge-gray',
      'Envoyé':     'badge-blue',
      'Accepté':    'badge-green',
      'Refusé':     'badge-red',
    };
    return `<span class="badge ${map[s] || 'badge-gray'}">${s}</span>`;
  },
};


// ============================================================
//  PAGES
// ============================================================
const Pages = {

  // ── Dashboard ─────────────────────────────────────────────
  dashboard() {
    const stats = DB.getDashboardStats();
    const chantiers = DB.chantiers.filter(c => c.statut === 'En cours');
    const devisRecents = DB.devis.slice(-5).reverse();

    const div = document.createElement('div');
    div.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-label">Clients actifs</div>
          <div class="stat-value">${stats.nbClients}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏗</div>
          <div class="stat-label">Chantiers</div>
          <div class="stat-value">${stats.nbChantiers}</div>
          <div class="stat-sub">${stats.nbEnCours} en cours</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-label">Devis émis</div>
          <div class="stat-value">${stats.nbDevis}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💶</div>
          <div class="stat-label">CA devis HT</div>
          <div class="stat-value">${Calculs.fmtN(stats.totalDevisHT, 0)}</div>
          <div class="stat-sub">€ hors taxes</div>
        </div>
      </div>

      <!-- Widget Dépenses du mois / Marge brute -->
      ${Pages._buildWidgetMarge()}

      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <span class="card-title">🏗 Chantiers en cours</span>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('chantiers')">Voir tout →</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>Chantier</th><th>Client</th><th>Fin</th><th>Statut</th>
              </tr></thead>
              <tbody>
                ${chantiers.length ? chantiers.map(c => {
                  const client = DB.getClient(c.clientId);
                  return `<tr onclick="App.navigate('chantiers', {id: ${c.id}})">
                    <td><strong>${c.nom}</strong></td>
                    <td>${client?.nom || '—'}</td>
                    <td>${App.formatDate(c.dateFin)}</td>
                    <td>${App.statut(c.statut)}</td>
                  </tr>`;
                }).join('') : '<tr><td colspan="4" class="text-secondary" style="text-align:center;padding:24px">Aucun chantier en cours</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">📄 Devis récents</span>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('devis')">Voir tout →</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>N°</th><th>Chantier</th><th>TTC</th><th>Statut</th>
              </tr></thead>
              <tbody>
                ${devisRecents.length ? devisRecents.map(d => {
                  const ch = DB.getChantier(d.chantierId);
                  return `<tr onclick="App.navigate('devis', {id: ${d.id}})">
                    <td class="font-mono" style="font-size:12px">${d.numero}</td>
                    <td>${ch?.nom || '—'}</td>
                    <td><strong>${Calculs.fmt(d.totalTTC)}</strong></td>
                    <td>${App.statut(d.statut)}</td>
                  </tr>`;
                }).join('') : '<tr><td colspan="4" class="text-secondary" style="text-align:center;padding:24px">Aucun devis</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Outils & Goodies -->
      <div class="card mt-16" id="card-outils">
        <div class="card-header" style="cursor:pointer" onclick="Pages.toggleAccordion('acc-root')">
          <span class="card-title">🧰 Outils &amp; Goodies</span>
          <span id="acc-root-ico" style="font-size:18px;color:var(--text-tertiary)">▸</span>
        </div>
        <div id="acc-root" style="display:none">

          <!-- ⚡ Actions rapides -->
          <div style="border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px;cursor:pointer;background:var(--bg-secondary)"
                 onclick="Pages.toggleAccordion('acc-actions')">
              <span style="font-weight:600;font-size:14px">⚡ Actions rapides</span>
              <span id="acc-actions-ico" style="color:var(--text-tertiary)">▸</span>
            </div>
            <div id="acc-actions" style="display:none;padding:14px 20px">
              <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">
                <button class="btn btn-primary"   onclick="Pages.modalNouveauClient()">👤 + Client</button>
                <button class="btn btn-secondary" onclick="Pages.modalNouveauChantier()">🏗 + Chantier</button>
                <button class="btn btn-secondary" onclick="Pages.modalNouveauDevis()">📄 + Devis</button>
                <button class="btn btn-secondary" onclick="App.navigate('calculateur')">⚡ Calcul Express</button>
                <button class="btn btn-secondary" onclick="App.navigate('prospection')">🔭 Prospection IA</button>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
                <button onclick="if(typeof AnalysePhoto !== 'undefined') AnalysePhoto.showModal()"
                  style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:var(--radius-md);
                         padding:14px 10px;cursor:pointer;transition:all .15s;text-align:center;display:flex;
                         flex-direction:column;align-items:center;gap:6px;color:var(--text-primary)"
                  onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--border)'">
                  <span style="font-size:26px">📸</span>
                  <span style="font-size:12px;font-weight:600">Analyser une photo</span>
                </button>
                <button onclick="if(typeof AnalysePhoto !== 'undefined') AnalysePhoto.showModalFournisseur()"
                  style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:var(--radius-md);
                         padding:14px 10px;cursor:pointer;transition:all .15s;text-align:center;display:flex;
                         flex-direction:column;align-items:center;gap:6px;color:var(--text-primary)"
                  onmouseenter="this.style.borderColor='#F7A64F'" onmouseleave="this.style.borderColor='var(--border)'">
                  <span style="font-size:26px">🧾</span>
                  <span style="font-size:12px;font-weight:600">Scanner une facture</span>
                </button>
                <button onclick="if(typeof Calculatrice !== 'undefined') Calculatrice.toggle()"
                  style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:var(--radius-md);
                         padding:14px 10px;cursor:pointer;transition:all .15s;text-align:center;display:flex;
                         flex-direction:column;align-items:center;gap:6px;color:var(--text-primary)"
                  onmouseenter="this.style.borderColor='#2DD4A0'" onmouseleave="this.style.borderColor='var(--border)'">
                  <span style="font-size:26px">🧮</span>
                  <span style="font-size:12px;font-weight:600">Calculatrice</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ⛅ Météo -->
          <div style="border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px;cursor:pointer;background:var(--bg-secondary)"
                 onclick="Pages.toggleAccordion('acc-meteo');Pages._initMeteoAccordion()">
              <span style="font-weight:600;font-size:14px">⛅ Météo chantier</span>
              <span id="acc-meteo-ico" style="color:var(--text-tertiary)">▸</span>
            </div>
            <div id="acc-meteo" style="display:none">
              <div id="meteo-accordion-slot" style="padding:0 20px 14px"></div>
            </div>
          </div>

          <!-- 📊 Graphiques CA -->
          <div style="border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px;cursor:pointer;background:var(--bg-secondary)"
                 onclick="Pages.toggleAccordion('acc-graphs');Pages._initGraphsAccordion()">
              <span style="font-weight:600;font-size:14px">📊 Graphiques CA</span>
              <span id="acc-graphs-ico" style="color:var(--text-tertiary)">▸</span>
            </div>
            <div id="acc-graphs" style="display:none">
              <div id="db-graphs-container" style="padding:14px 20px"></div>
            </div>
          </div>

        </div>
      </div>
    `;
    return div;
  },

  // ── Clients ───────────────────────────────────────────────
  clients() {
    const clients = DB.clients;
    const div = document.createElement('div');

    div.innerHTML = `
      <div class="flex justify-between items-center mb-16">
        <div></div>
        <button class="btn btn-primary" onclick="Pages.modalNouveauClient()">+ Nouveau client</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>ID</th><th>Société</th><th>Ville</th><th>Téléphone</th><th>Email</th><th>Chantiers</th><th></th>
            </tr></thead>
            <tbody>
              ${clients.length ? clients.map(c => {
                const nbCh = DB.getChantiersByClient(c.id).length;
                return `<tr onclick="Pages.modalEditClient(${c.id})">
                  <td class="font-mono text-xs text-tertiary">${String(c.id).padStart(3,'0')}</td>
                  <td><strong>${c.nom}</strong></td>
                  <td>${c.cp ? c.cp + ' ' : ''}${c.ville || '—'}</td>
                  <td>${c.telephone || '—'}</td>
                  <td class="text-secondary">${c.email || '—'}</td>
                  <td><span class="badge ${nbCh > 0 ? 'badge-blue' : 'badge-gray'}">${nbCh}</span></td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();App.navigate('chantiers', {clientId: ${c.id}})">Chantiers →</button>
                  </td>
                </tr>`;
              }).join('') : `<tr><td colspan="7">
                <div class="empty-state">
                  <div class="empty-state-icon">👤</div>
                  <div class="empty-state-title">Aucun client</div>
                  <div class="empty-state-text">Commencez par créer votre premier client</div>
                  <button class="btn btn-primary" onclick="Pages.modalNouveauClient()">+ Nouveau client</button>
                </div>
              </td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
    return div;
  },

  // ── Chantiers ─────────────────────────────────────────────
  chantiers(params = {}) {
    const chantiers = params.clientId
      ? DB.getChantiersByClient(params.clientId)
      : DB.chantiers;

    const div = document.createElement('div');
    div.innerHTML = `
      <div class="flex justify-between items-center mb-16">
        <div class="nav-tabs">
          <button class="nav-tab active">Tous (${chantiers.length})</button>
          <button class="nav-tab">En cours (${chantiers.filter(c=>c.statut==='En cours').length})</button>
          <button class="nav-tab">Terminés (${chantiers.filter(c=>c.statut==='Terminé').length})</button>
        </div>
        <button class="btn btn-primary" onclick="Pages.modalNouveauChantier()">+ Nouveau chantier</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Chantier</th><th>Client</th><th>Début</th><th>Fin prévue</th><th>Statut</th><th>Total</th><th></th>
            </tr></thead>
            <tbody>
              ${chantiers.length ? chantiers.map(c => {
                const client = DB.getClient(c.clientId);
                const devisCh = DB.getDevisByChantier(c.id);
                const totalTTC = devisCh.reduce((s, d) => s + (d.totalTTC || 0), 0);
                return `<tr onclick="Pages.modalEditChantier(${c.id})">
                  <td><strong>${c.nom}</strong><br><span class="text-xs text-secondary">${c.adresse || ''}</span></td>
                  <td>${client?.nom || '—'}</td>
                  <td>${App.formatDate(c.dateDebut)}</td>
                  <td>${App.formatDate(c.dateFin)}</td>
                  <td>${App.statut(c.statut)}</td>
                  <td><strong>${totalTTC > 0 ? Calculs.fmt(totalTTC) : '—'}</strong></td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();App.navigate('metrages', {chantierId: ${c.id}})">Métrés</button>
                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();App.navigate('devis', {chantierId: ${c.id}})">Devis</button>
                  </td>
                </tr>`;
              }).join('') : `<tr><td colspan="7">
                <div class="empty-state">
                  <div class="empty-state-icon">🏗</div>
                  <div class="empty-state-title">Aucun chantier</div>
                  <button class="btn btn-primary" onclick="Pages.modalNouveauChantier()">+ Nouveau chantier</button>
                </div>
              </td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
    return div;
  },

  // ── Métrés ────────────────────────────────────────────────
  metrages(params = {}) {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="flex justify-between items-center mb-16">
        <div id="metrage-chantier-select">
          <select class="form-control" id="sel-chantier-metrage" style="width:280px" onchange="Pages.chargerMetrages(this.value)">
            <option value="">— Sélectionner un chantier —</option>
            ${DB.chantiers.map(c => `<option value="${c.id}" ${params.chantierId == c.id ? 'selected' : ''}>${c.id} — ${c.nom}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary" onclick="Pages.modalNouveauMetrage()">+ Nouveau métré</button>
      </div>
      <div id="metrages-list"></div>
      <div id="metrages-calculs" style="display:none" class="mt-16"></div>
    `;

    if (params.chantierId) {
      setTimeout(() => Pages.chargerMetrages(params.chantierId), 10);
    }

    return div;
  },

  chargerMetrages(chantierId) {
    if (!chantierId) return;
    const metrages = DB.getMetragesByChantier(parseInt(chantierId));
    const list = document.getElementById('metrages-list');
    if (!list) return;

    const chantier = DB.getChantier(parseInt(chantierId));
    const isExt = chantier?.typeChantier === 'exterieur';
    const packsInt = [
      { icon:'🧱', label:'Cloisons',    page:'cloisons'    },
      { icon:'⚡', label:'Électricité', page:'electricite' },
      { icon:'🔧', label:'Plomberie',   page:'plomberie'   },
      { icon:'🎨', label:'Peinture',    page:'peinture'    },
    ];
    const packsExt = [
      { icon:'🧱', label:'Maçonnerie',  page:'maconnerie'  },
      { icon:'🌿', label:'Paysagisme',  page:'cloisons'    },
      { icon:'🏗', label:'Terrassement',page:'maconnerie'  },
    ];
    const packs = isExt ? packsExt : packsInt;
    const quickAccess = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;
                  padding:12px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);
                  border:1px solid var(--border)">
        <span style="font-size:12px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap">
          Accès rapide packs :
        </span>
        ${packs.map(p => `
          <button class="btn btn-secondary btn-sm"
            onclick="App.navigate('${p.page}', {chantierId:${chantierId}})"
            style="display:flex;align-items:center;gap:5px">
            ${p.icon} ${p.label}
          </button>`).join('')}
      </div>`;
    list.innerHTML = quickAccess;

    if (!metrages.length) {
      list.innerHTML += `<div class="card"><div class="empty-state">
        <div class="empty-state-icon">📐</div>
        <div class="empty-state-title">Aucun métré pour ce chantier</div>
        <button class="btn btn-primary" onclick="Pages.modalNouveauMetrage(${chantierId})">+ Saisir un métré</button>
      </div></div>`;
      return;
    }

    let totalMurs = 0, totalPlaf = 0;

    list.innerHTML += `<div class="card">
      <div class="card-header">
        <span class="card-title">Pièces saisies (${metrages.length})</span>
        <button class="btn btn-primary btn-sm" onclick="Pages.modalNouveauMetrage(${chantierId})">+ Ajouter</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Pièce</th><th>L × l × H</th><th>Périmètre</th><th>Surface murs</th><th>Surface plafond</th><th></th></tr></thead>
          <tbody>
            ${metrages.map(m => {
              const c = Calculs.metrage(m.longueur, m.largeur, m.hauteur);
              totalMurs += c.surfMurs;
              totalPlaf += c.surfPlafond;
              return `<tr>
                <td><strong>${m.piece}</strong></td>
                <td class="font-mono">${m.longueur} × ${m.largeur} × ${m.hauteur} m</td>
                <td>${Calculs.fmtN(c.perimetre, 1)} m</td>
                <td>${Calculs.fmtN(c.surfMurs, 1)} m²</td>
                <td>${Calculs.fmtN(c.surfPlafond, 1)} m²</td>
                <td><button class="btn btn-danger btn-sm" onclick="Pages.supprimerMetrage(${m.id}, ${chantierId})">✕</button></td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot>
            <tr style="background:var(--bg-tertiary)">
              <td colspan="3"><strong>TOTAUX</strong></td>
              <td><strong>${Calculs.fmtN(totalMurs, 1)} m²</strong></td>
              <td><strong>${Calculs.fmtN(totalPlaf, 1)} m²</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>`;

    // Afficher les calculs automatiques
    const calcDiv = document.getElementById('metrages-calculs');
    if (calcDiv) {
      calcDiv.style.display = 'block';
      const besoins = Calculs.genererBesoins(parseInt(chantierId));
      if (besoins) {
        calcDiv.innerHTML = `<div class="card">
          <div class="card-header">
            <span class="card-title">⚡ Estimation automatique des besoins</span>
            <button class="btn btn-primary btn-sm" onclick="Pages.genererDevisDepuisMetrages(${chantierId})">📄 Générer le devis</button>
          </div>
          <div class="card-body">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Cloisons (mat.)</div>
                <div class="stat-value" style="font-size:18px">${Calculs.fmt(besoins.cloison.coutMat)}</div>
                <div class="stat-sub">${Calculs.fmtN(besoins.cloison.plaques)} plaques · ${Calculs.fmtN(besoins.cloison.rails,1)} ml rails</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Joints (mat.)</div>
                <div class="stat-value" style="font-size:18px">${Calculs.fmt(besoins.joints.coutMat)}</div>
                <div class="stat-sub">${Calculs.fmtN(besoins.joints.bandes,1)} ml bandes · ${Calculs.fmtN(besoins.joints.enduit,1)} kg enduit</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Peinture (mat.)</div>
                <div class="stat-value" style="font-size:18px">${Calculs.fmt(besoins.peinture.coutMat)}</div>
                <div class="stat-sub">${Calculs.fmtN(besoins.peinture.litres,1)} L · ${Calculs.fmtN(besoins.peinture.heures,1)} h MO</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Main d'œuvre</div>
                <div class="stat-value" style="font-size:18px">${Calculs.fmt(besoins.cloison.coutMO + besoins.joints.coutMO + besoins.peinture.coutMO)}</div>
                <div class="stat-sub">${Calculs.fmtN(besoins.cloison.heuresMO + besoins.joints.heures + besoins.peinture.heures, 1)} h total</div>
              </div>
            </div>
          </div>
        </div>`;
      }
    }
  },

  supprimerMetrage(id, chantierId) {
    if (!confirm('Supprimer ce métré ?')) return;
    DB.deleteMetrage(id);
    Pages.chargerMetrages(chantierId);
    App.toast('Métré supprimé');
  },

  genererDevisDepuisMetrages(chantierId) {
    App.navigate('devis', { chantierId, generer: true });
  },

  // ── Devis ─────────────────────────────────────────────────
  devis(params = {}) {
    const div = document.createElement('div');

    // Sélection chantier
    const chantierId = params.chantierId;
    let devisData = null;

    div.innerHTML = `
      <div class="flex justify-between items-center mb-16">
        <select class="form-control" id="sel-chantier-devis" style="width:280px" onchange="Pages.chargerDevisChantier(this.value)">
          <option value="">— Sélectionner un chantier —</option>
          ${DB.chantiers.map(c => `<option value="${c.id}" ${chantierId == c.id ? 'selected' : ''}>${c.id} — ${c.nom}</option>`).join('')}
        </select>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" id="btn-generer-devis" onclick="Pages.genererDevis()" style="display:none">⚡ Générer depuis métrés</button>
          <button class="btn btn-primary" id="btn-save-devis" onclick="Pages.sauvegarderDevis()" style="display:none">💾 Enregistrer</button>
          <span class="no-print" style="font-size:11px;color:var(--text-secondary);margin-right:4px" title="Firefox : Impression → Plus de paramètres → En-têtes et pieds de page → Vide">ℹ️</span>
          <button class="btn btn-secondary" id="btn-print-devis" onclick="Pages.imprimerDevis()" style="display:none">🖨 Aperçu / Imprimer</button>
          <button class="btn btn-secondary" id="btn-excel-devis" onclick="Pages.exporterDevisExcel()" style="display:none">📊 Excel</button>
        </div>
      </div>
      <div id="devis-content"></div>
    `;

    if (chantierId) {
      setTimeout(() => {
        Pages.chargerDevisChantier(chantierId, params.generer);
      }, 10);
    }

    return div;
  },

  _devisEnCours: null,

  chargerDevisChantier(chantierId, genererAuto = false) {
    if (!chantierId) return;
    const id = parseInt(chantierId);
    const chantier = DB.getChantier(id);
    const client = chantier ? DB.getClient(chantier.clientId) : null;
    const devisExistants = DB.getDevisByChantier(id);

    document.getElementById('btn-generer-devis').style.display = 'inline-flex';

    if (genererAuto || !devisExistants.length) {
      Pages.genererDevis(id);
    } else {
      // Afficher le dernier devis
      const d = devisExistants[devisExistants.length - 1];
      Pages._devisEnCours = {
        ...d,
        chantierId: id,
        totaux: d.totaux || {
          totalHT:    d.totalHT    || 0,
          totalTTC:   d.totalTTC   || 0,
          montantTVA: d.montantTVA || (d.totalHT ? d.totalHT * (d.tva || 0.1) : 0),
          tva:        d.tva        || 0.1,
        },
      };
      Pages.afficherDevis(Pages._devisEnCours, chantier, client);
    }
  },

  genererDevis(chantierId) {
    const id = parseInt(chantierId || document.getElementById('sel-chantier-devis')?.value);
    if (!id) { App.toast('Sélectionnez un chantier', 'error'); return; }

    const chantier = DB.getChantier(id);
    const client   = chantier ? DB.getClient(chantier.clientId) : null;
    const resultat = Calculs.calculerDevis(id);

    if (!resultat) {
      document.getElementById('devis-content').innerHTML = `<div class="card"><div class="empty-state">
        <div class="empty-state-icon">📐</div>
        <div class="empty-state-title">Aucun métré saisi pour ce chantier</div>
        <button class="btn btn-primary" onclick="App.navigate('metrages', {chantierId: ${id}})">Saisir les métrés</button>
      </div></div>`;
      return;
    }

    const config = DB.getConfig();
    const numero = config.prefixeDevis + String(DB.nextId(DB.KEYS.devis)).padStart(4, '0');

    Pages._devisEnCours = {
      chantierId: id,
      numero,
      date: new Date().toISOString().split('T')[0],
      statut: 'Brouillon',
      lignes: resultat.lignes,
      totaux: resultat.totaux,
    };

    document.getElementById('btn-save-devis').style.display = 'inline-flex';
    document.getElementById('btn-print-devis').style.display = 'inline-flex';
    document.getElementById('btn-excel-devis').style.display = 'inline-flex';
    Pages.afficherDevis(Pages._devisEnCours, chantier, client);
  },

  afficherDevis(devis, chantier, client) {
    const config = DB.getConfig();
    const content = document.getElementById('devis-content');
    if (!content) return;

    const totaux = devis.totaux || {};
    const lignes = devis.lignes || [];

    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Devis ${devis.numero || ''}</div>
            <div class="text-sm text-secondary mt-4">
              ${chantier ? chantier.nom : '—'} · ${client ? client.nom : '—'} · ${App.formatDate(devis.date)}
            </div>
          </div>
          <div class="no-print" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <select class="form-control" style="width:140px" onchange="Pages.mettreAJourStatutDevis(this.value)">
              ${['Brouillon','Envoyé','Accepté','Refusé'].map(s => `<option ${devis.statut === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
            ${App.statut(devis.statut)}
            ${devis.id && devis.statut === 'Accepté'
              ? `<button class="btn btn-primary btn-sm" onclick="Pages.convertirEnFacture(${devis.id})">🧾 Convertir en facture</button>`
              : ''}
            ${devis.id ? `<button class="btn btn-secondary btn-sm" onclick="DocPrint.apercu('devis',${devis.id})">🖨 Aperçu impression</button>` : ''}
            ${devis.id ? `<button class="btn btn-primary btn-sm" onclick="EmailDevis.envoyerDevis(${devis.id})">📧 Envoyer au client</button>` : ''}
            ${devis.id && typeof Signature !== 'undefined' && !Signature.estSigne(devis.id) ? `<button class="btn btn-secondary btn-sm" onclick="Signature.demanderSignature(${devis.id})">✍️ Signature</button>` : ''}
            ${devis.id && typeof Signature !== 'undefined' && Signature.estSigne(devis.id) ? Signature.badgeHtml(devis.id) + `<button class="btn btn-secondary btn-sm" onclick="Signature.voirSignature(${devis.id})">🖼 Voir</button>` : ''}
          </div>
        </div>
        <div class="card-body">
          <!-- En-tête entreprise / client -->
          <div class="form-row mb-16">
            <div>
              <div class="text-xs text-tertiary mb-4">ENTREPRISE</div>
              <strong>${config.nomEntreprise}</strong><br>
              <span class="text-secondary text-sm">${config.adresse}</span><br>
              <span class="text-secondary text-sm">${config.telephone} · ${config.email}</span>
            </div>
            <div>
              <div class="text-xs text-tertiary mb-4">CLIENT</div>
              <strong>${client?.nom || '—'}</strong><br>
              <span class="text-secondary text-sm">${client?.adresse || ''} ${client?.cp || ''} ${client?.ville || ''}</span>
            </div>
          </div>

          <!-- Lignes du devis -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <thead>
              <tr style="background:var(--bg-tertiary)">
                <th style="padding:10px 14px;text-align:left;font-size:12px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.05em">Poste</th>
                <th style="padding:10px 14px;text-align:right;font-size:12px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.05em">Base HT</th>
                <th style="padding:10px 14px;text-align:center;font-size:12px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.05em;width:120px">Marge %</th>
                <th style="padding:10px 14px;text-align:right;font-size:12px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.05em">Total HT client</th>
              </tr>
            </thead>
            <tbody>
              ${lignes.map((l, i) => `
              <tr style="border-bottom:0.5px solid var(--border)">
                <td style="padding:12px 14px;font-weight:500">${l.poste}</td>
                <td style="padding:12px 14px;text-align:right;font-family:var(--font-mono)">${Calculs.fmt(l.baseHT)}</td>
                <td style="padding:12px 14px;text-align:center">
                  <span class="no-print" style="display:inline-flex;align-items:center;gap:4px">
                    <input type="number" value="${Math.round((l.marge || 0) * 100)}" min="0" max="200"
                      style="width:70px;text-align:center;border:0.5px solid var(--border);border-radius:var(--radius-sm);padding:4px 8px;font-family:var(--font-mono);font-size:13px"
                      onchange="Pages.majMargeLigne(${i}, this.value)"> %
                  </span>
                  <span class="print-only" style="display:none;font-family:var(--font-mono)">${Math.round((l.marge || 0) * 100)} %</span>
                </td>
                <td style="padding:12px 14px;text-align:right;font-family:var(--font-mono);font-weight:600;color:var(--accent)">${Calculs.fmt(l.totalClient)}</td>
              </tr>`).join('')}
            </tbody>
          </table>

          <!-- Totaux -->
          <div style="max-width:400px;margin-left:auto">
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border)">
              <span class="text-secondary">Total HT</span>
              <span class="font-mono">${Calculs.fmt(totaux.totalHT)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border)">
              <span class="text-secondary">TVA ${Math.round((totaux.tva || 0.1) * 100)}%</span>
              <span class="font-mono">${Calculs.fmt(totaux.montantTVA)}</span>
            </div>
            <div class="total-row mt-8">
              <span class="total-label">TOTAL TTC</span>
              <span class="total-value">${Calculs.fmt(totaux.totalTTC)}</span>
            </div>
          </div>

          <!-- Note de bas -->
          <div class="mt-16" style="padding:12px;background:var(--bg-tertiary);border-radius:var(--radius-md);font-size:12px;color:var(--text-tertiary)">
            Devis valable 30 jours · Prix HT · TVA ${Math.round((totaux.tva || 0.1) * 100)}% (rénovation) · SIRET ${config.siret}
          </div>

          <!-- Ligne libre avec IA -->
          <div class="mt-16 no-print" style="padding:14px 16px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:var(--radius-md)">
            <div style="font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">
              + Ajouter une ligne personnalisée
            </div>
            <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">
              <div style="flex:1;min-width:200px">
                <div style="display:flex;gap:6px;align-items:center">
                  <input class="form-control" id="ligne-libre-desig" placeholder="Désignation du poste…"
                    style="flex:1;font-size:13px">
                  ${!!localStorage.getItem('plaqpro_groq_key') ? `
                  <button class="btn btn-secondary btn-sm" onclick="Pages._ameliorerLigneIA()" title="Améliorer avec l'IA" style="white-space:nowrap">✨ IA</button>
                  ` : ''}
                </div>
                <div id="ligne-libre-ia-result" style="display:none;margin-top:5px"></div>
              </div>
              <div style="width:100px">
                <input type="number" class="form-control" id="ligne-libre-prix" placeholder="Prix HT €"
                  step="0.01" min="0" style="font-size:13px">
              </div>
              <button class="btn btn-primary btn-sm" onclick="Pages._ajouterLigneLibre()" style="white-space:nowrap">+ Ajouter</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Devis existants -->
      ${DB.getDevisByChantier(parseInt(document.getElementById('sel-chantier-devis')?.value || 0)).length > 0 ? `
      <div class="card mt-16 no-print">
        <div class="card-header"><span class="card-title">Historique des devis</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>N°</th><th>Date</th><th>Total HT</th><th>Total TTC</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              ${DB.getDevisByChantier(parseInt(document.getElementById('sel-chantier-devis')?.value || 0)).map(d =>
                `<tr>
                  <td class="font-mono">${d.numero}</td>
                  <td>${App.formatDate(d.date)}</td>
                  <td>${Calculs.fmt(d.totalHT)}</td>
                  <td><strong>${Calculs.fmt(d.totalTTC)}</strong></td>
                  <td>${App.statut(d.statut)}</td>
                  <td>
                    ${d.statut === 'Accepté' ? `<button class="btn btn-primary btn-sm" onclick="Pages.convertirEnFacture(${d.id})">🧾 Facture</button>` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="DocPrint.apercu('devis',${d.id})">🖨</button>
                    <button class="btn btn-secondary btn-sm" onclick="EmailDevis.envoyerDevis(${d.id})">📧</button>
                  </td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
      </div>` : ''}
    `;

    document.getElementById('btn-save-devis').style.display = 'inline-flex';
    document.getElementById('btn-print-devis').style.display = 'inline-flex';
    document.getElementById('btn-excel-devis').style.display = 'inline-flex';
  },

  majMargeLigne(index, valeur) {
    if (!Pages._devisEnCours) return;
    const pct = parseFloat(valeur) / 100;
    Pages._devisEnCours.lignes[index].marge = pct;
    Pages._devisEnCours.lignes[index].totalClient = Pages._devisEnCours.lignes[index].baseHT * (1 + pct);
    // Recalculer totaux
    const r = DB.getRatios();
    const totalHT = Pages._devisEnCours.lignes.reduce((s, l) => s + l.totalClient, 0);
    const tva = r.TVA_TRAVAUX;
    Pages._devisEnCours.totaux.totalHT   = totalHT;
    Pages._devisEnCours.totaux.montantTVA = totalHT * tva;
    Pages._devisEnCours.totaux.totalTTC  = totalHT * (1 + tva);
    // Re-afficher
    const ch = DB.getChantier(Pages._devisEnCours.chantierId);
    const cl = ch ? DB.getClient(ch.clientId) : null;
    Pages.afficherDevis(Pages._devisEnCours, ch, cl);
  },

  mettreAJourStatutDevis(statut) {
    if (Pages._devisEnCours) Pages._devisEnCours.statut = statut;
  },

  async _ameliorerLigneIA() {
    const input = document.getElementById('ligne-libre-desig');
    if (!input || !input.value.trim()) return;
    const btn = document.querySelector('[onclick="Pages._ameliorerLigneIA()"]');
    if (btn) { btn.textContent = '⌛'; btn.disabled = true; }
    const original = input.value;
    const _gcApp = groqConfig();
    if (!_gcApp) { if (btn) { btn.textContent = '✨ IA'; btn.disabled = false; } return; }
    try {
      const r = await fetch(_gcApp.url, {
        method: 'POST',
        headers: _gcApp.headers,
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: `Tu es expert en bâtiment. Transforme cette désignation en texte professionnel pour un devis de plaquiste : '${original}'\nRéponds avec UNIQUEMENT la désignation professionnelle corrigée, max 1 ligne.` }],
          max_tokens: 60, temperature: 0.3
        })
      });
      const d = await r.json();
      const improved = (d.choices?.[0]?.message?.content || '').trim();
      if (improved) {
        input.value = improved;
        const resultDiv = document.getElementById('ligne-libre-ia-result');
        if (resultDiv) {
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = `<div style="display:flex;align-items:center;gap:8px;font-size:12px">
            <span style="padding:2px 8px;border-radius:10px;background:rgba(45,212,160,0.15);color:#2DD4A0;border:1px solid rgba(45,212,160,0.3)">✨ Amélioré par IA</span>
            <button onclick="document.getElementById('ligne-libre-desig').value='${original.replace(/'/g, "&#39;")}';document.getElementById('ligne-libre-ia-result').style.display='none'"
              style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);font-size:11px;text-decoration:underline">Garder l'original</button>
          </div>`;
        }
      }
    } catch(e) {}
    if (btn) { btn.textContent = '✨ IA'; btn.disabled = false; }
  },

  _ajouterLigneLibre() {
    const desig = document.getElementById('ligne-libre-desig')?.value.trim();
    const prix  = parseFloat(document.getElementById('ligne-libre-prix')?.value) || 0;
    if (!desig) { App.toast('Saisissez une désignation', 'error'); return; }
    if (!Pages._devisEnCours) return;
    Pages._devisEnCours.lignes.push({ poste: desig, baseHT: prix, marge: 0, totalClient: prix });
    const totalHT = Pages._devisEnCours.lignes.reduce((s, l) => s + (l.totalClient || 0), 0);
    const tva = Pages._devisEnCours.totaux?.tva || 0.1;
    Pages._devisEnCours.totaux = { ...Pages._devisEnCours.totaux, totalHT, montantTVA: totalHT * tva, totalTTC: totalHT * (1 + tva) };
    const ch = DB.getChantier(Pages._devisEnCours.chantierId);
    const cl = ch ? DB.getClient(ch.clientId) : null;
    Pages.afficherDevis(Pages._devisEnCours, ch, cl);
    App.toast('Ligne ajoutée au devis');
  },

  sauvegarderDevis() {
    const d = Pages._devisEnCours;
    if (!d) return;
    const saved = DB.addDevis({
      chantierId: d.chantierId,
      numero:     d.numero,
      date:       d.date,
      statut:     d.statut,
      lignes:     d.lignes,
      totalHT:    d.totaux.totalHT,
      totalTTC:   d.totaux.totalTTC,
      montantTVA: d.totaux.montantTVA,
      tva:        d.totaux.tva,
    });
    Pages._devisEnCours.id = saved.id;
    App.toast('Devis ' + saved.numero + ' enregistré !');
  },

  imprimerDevis() {
    const btnXls = document.getElementById('btn-excel-devis');
    if (btnXls && Pages._devisEnCours?.id) btnXls.style.display = 'inline-flex';
    window.print();
  },

  exporterDevisExcel() {
    if (Pages._devisEnCours?.id) ExcelExport.exporterDevis(Pages._devisEnCours.id);
    else App.toast('Enregistrez le devis d\'abord', 'error');
  },

  // ── Base tarifaire ────────────────────────────────────────
  produits() {
    const produits = DB.produits;
    const cats = [...new Set(produits.map(p => p.categorie))];

    const div = document.createElement('div');
    div.innerHTML = `
      <div class="flex justify-between items-center mb-16">
        <div class="nav-tabs" id="cat-tabs">
          <button class="nav-tab active" onclick="Pages.filtrerProduits('', this)">Tous (${produits.length})</button>
          ${cats.map(c => `<button class="nav-tab" onclick="Pages.filtrerProduits('${c}', this)">${c} (${produits.filter(p=>p.categorie===c).length})</button>`).join('')}
        </div>
        <button class="btn btn-primary" onclick="Pages.modalNouveauProduit()">+ Nouveau produit</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table id="produits-table">
            <thead><tr><th>Réf.</th><th>Catégorie</th><th>Désignation</th><th>Unité</th><th>Prix HT</th><th>Rendement</th><th></th></tr></thead>
            <tbody id="produits-body">
              ${Pages.renderProduits(produits)}
            </tbody>
          </table>
        </div>
      </div>
    `;
    return div;
  },

  renderProduits(produits) {
    return produits.map(p => `
      <tr onclick="Pages.modalEditProduit(${p.id})">
        <td class="font-mono text-sm">${p.reference}</td>
        <td><span class="badge badge-gray">${p.categorie}</span></td>
        <td>${p.designation}</td>
        <td class="text-secondary">${p.unite}</td>
        <td><strong>${Calculs.fmt(p.prixHT)}</strong></td>
        <td class="text-secondary">${p.rendement || '—'}</td>
        <td><button class="btn btn-danger btn-sm" onclick="event.stopPropagation();Pages.supprimerProduit(${p.id})">✕</button></td>
      </tr>
    `).join('');
  },

  filtrerProduits(cat, btn) {
    document.querySelectorAll('#cat-tabs .nav-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const produits = cat ? DB.produits.filter(p => p.categorie === cat) : DB.produits;
    document.getElementById('produits-body').innerHTML = Pages.renderProduits(produits);
  },

  supprimerProduit(id) {
    if (!confirm('Désactiver ce produit ?')) return;
    DB.updateProduit(id, { actif: false });
    App.navigate('produits');
    App.toast('Produit désactivé');
  },

  // ── Widget Marge brute mensuelle ──────────────────────────
  _buildWidgetMarge() {
    const now   = new Date();
    const y     = now.getFullYear();
    const m     = now.getMonth();
    const start = new Date(y, m, 1);
    const end   = new Date(y, m + 1, 0);
    const inRange = d => { const dt = new Date(d || ''); return dt >= start && dt <= end; };

    const factures  = (DB.factures || []).filter(f => inRange(f.date));
    const depenses  = (() => { try { return JSON.parse(localStorage.getItem('plaqpro_depenses') || '[]'); } catch { return []; } })()
                        .filter(d => inRange(d.date));

    const totalFac  = factures.reduce((s, f) => s + (parseFloat(f.totalHT) || 0), 0);
    const totalDep  = depenses.reduce((s, d) => s + (parseFloat(d.montantHT) || 0), 0);
    const marge     = totalFac - totalDep;
    const margePct  = totalFac > 0 ? Math.round(marge / totalFac * 100) : 0;
    const margeCol  = margePct >= 40 ? '#2DD4A0' : margePct >= 20 ? '#F7A64F' : '#F75B5B';
    const moisLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const fmt = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

    return `
      <div style="background:linear-gradient(135deg,rgba(247,166,79,0.08),rgba(45,212,160,0.06));border:1px solid rgba(247,166,79,0.2);border-radius:14px;padding:18px 20px;margin-bottom:16px;display:flex;align-items:stretch;gap:0;flex-wrap:wrap;overflow:hidden">
        <!-- Titre -->
        <div style="flex:0 0 100%;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:14px;font-weight:800;color:var(--text-primary)">📊 Dépenses du mois — ${moisLabel}</div>
          <button class="btn btn-ghost btn-sm" onclick="AnalysePhoto.showModalFournisseur()" style="font-size:12px">🧾 Scanner une facture</button>
        </div>

        <!-- 3 KPI -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;flex:1;width:100%;margin-bottom:14px">
          <div style="text-align:center;padding:12px;background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.15);border-radius:10px">
            <div style="font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px">Total facturé HT</div>
            <div style="font-size:18px;font-weight:900;color:#4F8EF7;font-family:var(--font-mono)">${fmt(totalFac)}</div>
            <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">${factures.length} facture${factures.length!==1?'s':''}</div>
          </div>
          <div style="text-align:center;padding:12px;background:rgba(247,91,91,0.08);border:1px solid rgba(247,91,91,0.15);border-radius:10px">
            <div style="font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px">Total achats HT</div>
            <div style="font-size:18px;font-weight:900;color:#F75B5B;font-family:var(--font-mono)">${fmt(totalDep)}</div>
            <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">${depenses.length} dépense${depenses.length!==1?'s':''}</div>
          </div>
          <div style="text-align:center;padding:12px;background:${margeCol}15;border:1px solid ${margeCol}30;border-radius:10px">
            <div style="font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px">Marge brute</div>
            <div style="font-size:18px;font-weight:900;color:${margeCol};font-family:var(--font-mono)">${fmt(marge)}</div>
            <div style="font-size:11px;font-weight:700;color:${margeCol};margin-top:2px">${margePct}%</div>
          </div>
        </div>

        <!-- Barre marge -->
        <div style="flex:0 0 100%">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-tertiary);margin-bottom:4px">
            <span>Achats</span>
            <span style="color:${margeCol};font-weight:700">Marge ${margePct}%</span>
            <span>Facturé</span>
          </div>
          <div style="height:8px;background:rgba(247,91,91,0.2);border-radius:4px;overflow:hidden;position:relative">
            <div style="position:absolute;inset:0;width:${Math.min(100, totalFac > 0 ? Math.round(totalDep/totalFac*100) : 0)}%;background:#F75B5B;border-radius:4px"></div>
            <div style="position:absolute;right:0;top:0;bottom:0;width:${Math.min(100, margePct)}%;background:${margeCol};border-radius:4px"></div>
          </div>
          ${totalFac === 0 && totalDep === 0 ? '<div style="text-align:center;font-size:12px;color:var(--text-tertiary);margin-top:8px">Scannez vos factures fournisseurs avec le bouton 🧾 ci-dessus</div>' : ''}
        </div>
      </div>`;
  },

  // ── Config ────────────────────────────────────────────────
  config() {
    const config = DB.getConfig();
    const groqKey = localStorage.getItem('plaqpro_groq_key') || '';
    const profil = DB.getProfil ? DB.getProfil() : {};
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="card" style="max-width:860px;margin-bottom:16px">
        <div class="card-header"><span class="card-title">🏢 Profil entreprise — Positionnement marché</span></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <div>
              <label class="form-label">Répartition clientèle</label>
              <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
                <span style="font-size:12px;color:var(--text-secondary)">Particuliers</span>
                <input type="range" id="cfg-mix-pro" min="0" max="100"
                  value="${profil.mixPro ?? 70}"
                  style="flex:1"
                  oninput="document.getElementById('cfg-mix-pro-val').textContent=this.value+'% Pro / '+(100-this.value)+'% Particuliers'">
                <span style="font-size:12px;color:var(--text-secondary)">Professionnels</span>
              </div>
              <div id="cfg-mix-pro-val" style="text-align:center;font-weight:700;color:var(--accent);margin-top:4px">
                ${profil.mixPro ?? 70}% Pro / ${100-(profil.mixPro ?? 70)}% Particuliers
              </div>
            </div>
            <div>
              <label class="form-label">Type d'interventions principal</label>
              <select id="cfg-type-interv" class="form-control" style="margin-top:8px">
                <option value="multi" ${(profil.typeInterv||'multi')==='multi'?'selected':''}>Multi-travaux (couteau suisse)</option>
                <option value="placo" ${profil.typeInterv==='placo'?'selected':''}>Plaquisterie / Peinture</option>
                <option value="renov" ${profil.typeInterv==='renov'?'selected':''}>Rénovation complète</option>
                <option value="neuf"  ${profil.typeInterv==='neuf'?'selected':''}>Construction neuve</option>
              </select>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:20px">
            <div>
              <label class="form-label">Taux MO Pro (€/h)</label>
              <input type="number" id="cfg-taux-pro" class="form-control" value="${profil.tauxHorairePro ?? 42}" min="20" max="120" step="0.5">
            </div>
            <div>
              <label class="form-label">Taux MO Particulier (€/h)</label>
              <input type="number" id="cfg-taux-part" class="form-control" value="${profil.tauxHoraireParticulier ?? 38}" min="20" max="120" step="0.5">
            </div>
            <div>
              <label class="form-label">Marge matériaux Pro (%)</label>
              <input type="number" id="cfg-marge-mat-pro" class="form-control" value="${profil.margeMatPro ?? 22}" min="0" max="100">
            </div>
            <div>
              <label class="form-label">Marge matériaux Particulier (%)</label>
              <input type="number" id="cfg-marge-mat-part" class="form-control" value="${profil.margeMatParticulier ?? 32}" min="0" max="100">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px">
            <div>
              <label class="form-label">TVA chantiers Pro (%)</label>
              <select id="cfg-tva-pro" class="form-control">
                <option value="20" ${(profil.tvaPro??20)==20?'selected':''}>20% (neuf / pro)</option>
                <option value="10" ${profil.tvaPro==10?'selected':''}>10% (rénovation)</option>
                <option value="5.5" ${profil.tvaPro==5.5?'selected':''}>5,5% (amélioration énergétique)</option>
              </select>
            </div>
            <div>
              <label class="form-label">TVA chantiers Particuliers (%)</label>
              <select id="cfg-tva-part" class="form-control">
                <option value="10" ${(profil.tvaParticulier??10)==10?'selected':''}>10% (rénovation)</option>
                <option value="20" ${profil.tvaParticulier==20?'selected':''}>20% (neuf)</option>
                <option value="5.5" ${profil.tvaParticulier==5.5?'selected':''}>5,5% (amélioration énergétique)</option>
              </select>
            </div>
            <div>
              <label class="form-label">Marge MO (%)</label>
              <input type="number" id="cfg-marge-mo" class="form-control" value="${profil.margeMO ?? 20}" min="0" max="100">
            </div>
          </div>

          <div style="margin-top:16px;text-align:right">
            <button class="btn btn-primary" onclick="Pages.sauvegarderProfil()">💾 Enregistrer le profil</button>
          </div>
        </div>
      </div>
      <div class="card" style="max-width:600px">
        <div class="card-header"><span class="card-title">⚙️ Paramètres entreprise</span></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Nom de l'entreprise</label>
            <input class="form-control" id="cfg-nom" value="${config.nomEntreprise || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Adresse</label>
            <input class="form-control" id="cfg-adresse" value="${config.adresse || ''}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Téléphone</label>
              <input class="form-control" id="cfg-tel" value="${config.telephone || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-control" id="cfg-email" value="${config.email || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">SIRET</label>
              <input class="form-control" id="cfg-siret" value="${config.siret || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Préfixe devis</label>
              <input class="form-control" id="cfg-prefix" value="${config.prefixeDevis || 'DEV-'}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">🌤 Ville (météo)</label>
            <input class="form-control" id="cfg-ville" value="${config.ville || 'Lyon'}" placeholder="Lyon, Paris, Marseille…"
              style="max-width:220px">
          </div>
          <button class="btn btn-primary" onclick="Pages.sauvegarderConfig()">Enregistrer</button>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px">
        <div class="card-header"><span class="card-title">🖼 Logo entreprise</span></div>
        <div class="card-body">
          <div style="margin-bottom:10px;font-size:12px;color:var(--text-tertiary)">
            Format PNG/SVG transparent recommandé · <strong>200 × 80 px recommandé</strong>
          </div>
          <div id="logo-preview" style="margin-bottom:14px;padding:14px 20px;background:var(--bg-tertiary);
               border-radius:var(--radius-md);text-align:center;min-height:88px;
               display:flex;align-items:center;justify-content:center;border:1px dashed var(--border)">
            ${localStorage.getItem('plaqpro_logo_entreprise')
              ? `<img src="${localStorage.getItem('plaqpro_logo_entreprise')}"
                      style="max-width:200px;max-height:80px;object-fit:contain" alt="Logo">`
              : `<span class="text-secondary text-sm">Aucun logo · utilisera assets/logo_plaqpro.png par défaut</span>`}
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <label class="btn btn-secondary" style="cursor:pointer;margin:0">
              📁 Choisir un logo
              <input type="file" accept="image/*" style="display:none" onchange="Pages.previewLogo(this)">
            </label>
            ${localStorage.getItem('plaqpro_logo_entreprise')
              ? `<button class="btn btn-danger" onclick="Pages.supprimerLogo()">🗑 Supprimer</button>` : ''}
          </div>
          <div style="margin-top:8px;font-size:11px;color:var(--text-tertiary)">
            Stocké localement dans votre navigateur · utilisé dans les aperçus d'impression
          </div>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px">
        <div class="card-header"><span class="card-title">🧾 En-tête &amp; Pied de page</span></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Forme juridique</label>
              <input class="form-control" id="cfg-forme" value="${config.formeJuridique || ''}" placeholder="SARL, EI, SAS…">
            </div>
            <div class="form-group">
              <label class="form-label">N° RCS</label>
              <input class="form-control" id="cfg-rcs" value="${config.rcs || ''}" placeholder="Lyon B 000 000 000">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">TVA intracommunautaire</label>
            <input class="form-control" id="cfg-tva-intra" value="${config.tvaIntra || ''}" placeholder="FR 00 000000000">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">IBAN</label>
              <input class="form-control" id="cfg-iban" value="${config.iban || ''}" placeholder="FR76 0000 0000 0000 0000 0000 000" style="font-family:var(--font-mono);font-size:12px">
            </div>
            <div class="form-group">
              <label class="form-label">BIC</label>
              <input class="form-control" id="cfg-bic" value="${config.bic || ''}" placeholder="XXXXXXXX" style="font-family:var(--font-mono)">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Banque</label>
            <input class="form-control" id="cfg-banque" value="${config.banque || ''}" placeholder="Crédit Agricole, BNP…">
          </div>
          <div class="form-group">
            <label class="form-label">Conditions de paiement</label>
            <textarea class="form-control" id="cfg-conditions" rows="2">${config.conditionsPaiement || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Mentions légales</label>
            <textarea class="form-control" id="cfg-mentions" rows="2">${config.mentionsLegales || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Texte pied de page — Devis</label>
            <textarea class="form-control" id="cfg-pied-devis" rows="2">${config.piedPageDevis || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Texte pied de page — Facture</label>
            <textarea class="form-control" id="cfg-pied-facture" rows="2">${config.piedPageFacture || ''}</textarea>
          </div>
          <button class="btn btn-primary" onclick="Pages.sauvegarderConfig()">Enregistrer</button>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px">
        <div class="card-header">
          <span class="card-title">📧 Email — Configuration EmailJS</span>
          <a href="https://www.emailjs.com" target="_blank" rel="noopener"
             style="font-size:11px;color:var(--accent);text-decoration:none">
            Créer un compte gratuit →
          </a>
        </div>
        <div class="card-body">
          <div style="padding:10px 14px;background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.2);
               border-radius:var(--radius-md);font-size:12px;color:var(--text-secondary);margin-bottom:16px">
            EmailJS permet d'envoyer des emails directement depuis le navigateur, sans serveur.<br>
            Créez un compte sur emailjs.com → ajoutez un <strong>Email Service</strong> (Gmail, Outlook…)
            → créez un <strong>Email Template</strong> avec les variables :
            <code style="font-size:11px">&#123;&#123;to_email&#125;&#125;</code>,
            <code style="font-size:11px">&#123;&#123;subject&#125;&#125;</code>,
            <code style="font-size:11px">&#123;&#123;message&#125;&#125;</code>,
            <code style="font-size:11px">&#123;&#123;from_name&#125;&#125;</code>,
            <code style="font-size:11px">&#123;&#123;doc_numero&#125;&#125;</code>,
            <code style="font-size:11px">&#123;&#123;total_ttc&#125;&#125;</code>.
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Service ID</label>
              <input class="form-control" id="cfg-ejs-service" type="password"
                value="${localStorage.getItem('plaqpro_emailjs_service') || ''}"
                placeholder="service_xxxxxxx" style="font-family:var(--font-mono);font-size:13px">
            </div>
            <div class="form-group">
              <label class="form-label">Template ID</label>
              <input class="form-control" id="cfg-ejs-template" type="password"
                value="${localStorage.getItem('plaqpro_emailjs_template') || ''}"
                placeholder="template_xxxxxxx" style="font-family:var(--font-mono);font-size:13px">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Public Key</label>
            <input class="form-control" id="cfg-ejs-key" type="password"
              value="${localStorage.getItem('plaqpro_emailjs_key') || ''}"
              placeholder="XXXXXXXXXXXXXXXXXXXX" style="font-family:var(--font-mono);font-size:13px">
          </div>
          <div class="form-group">
            <label class="form-label">Email de test</label>
            <input class="form-control" id="cfg-ejs-test-email" type="email"
              placeholder="votre@email.fr" style="max-width:260px">
          </div>
          <div id="ejs-test-result" style="display:none;margin-bottom:12px;padding:10px 14px;
               border-radius:var(--radius-md);font-size:13px"></div>
          <style>
            .ejs-result.ejs-ok   { background:rgba(45,212,160,0.12); border:1px solid rgba(45,212,160,0.3); color:#2DD4A0 }
            .ejs-result.ejs-error{ background:rgba(247,91,91,0.12);  border:1px solid rgba(247,91,91,0.3);  color:#F75B5B }
            .ejs-result.ejs-info { background:rgba(79,142,247,0.08); border:1px solid rgba(79,142,247,0.2); color:var(--accent) }
          </style>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="EmailDevis.sauvegarderConfig()">💾 Enregistrer</button>
            <button class="btn btn-secondary" onclick="EmailDevis.tester()">📧 Tester l'envoi</button>
          </div>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px">
        <div class="card-header">
          <span class="card-title">📊 Export comptable</span>
          <span style="font-size:11px;color:var(--text-tertiary)">Sage · EBP · Cegid · CSV</span>
        </div>
        <div class="card-body">
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
            Exportez vos factures au format comptable standard (CSV Journal) compatible avec Sage, EBP, Cegid et la plupart des logiciels de comptabilité.
          </div>

          <!-- Sélecteur période -->
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px">
            <div class="form-group" style="margin:0;flex:1;min-width:140px">
              <label class="form-label">Période</label>
              <select class="form-control" id="export-compta-periode">
                <option value="mois">Mois en cours</option>
                <option value="mois_prec">Mois précédent</option>
                <option value="trim">Trimestre en cours</option>
                <option value="trim_prec">Trimestre précédent</option>
                <option value="annee" selected>Année en cours</option>
                <option value="annee_prec">Année précédente</option>
                <option value="tout">Tout</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;flex:1;min-width:140px">
              <label class="form-label">Format logiciel</label>
              <select class="form-control" id="export-compta-format">
                <option value="sage">Sage</option>
                <option value="ebp">EBP</option>
                <option value="cegid">Cegid</option>
                <option value="generic" selected>Générique CSV</option>
              </select>
            </div>
          </div>

          <!-- Comptes comptables -->
          <div style="background:var(--bg-tertiary);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:16px;font-size:12px">
            <div style="font-weight:700;color:var(--text-primary);margin-bottom:8px">Comptes comptables utilisés</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
              <div style="display:flex;align-items:center;gap:8px">
                <span class="font-mono" style="font-size:11px;color:var(--accent)">411xxx</span>
                <span style="color:var(--text-secondary)">Clients</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="font-mono" style="font-size:11px;color:var(--accent)">706xxx</span>
                <span style="color:var(--text-secondary)">Prestations de services</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="font-mono" style="font-size:11px;color:var(--accent)">44571x</span>
                <span style="color:var(--text-secondary)">TVA collectée</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="font-mono" style="font-size:11px;color:var(--accent)">512xxx</span>
                <span style="color:var(--text-secondary)">Banque (règlements)</span>
              </div>
            </div>
          </div>

          <div id="export-compta-preview" style="display:none;margin-bottom:14px;max-height:180px;overflow:auto;background:var(--bg-tertiary);border-radius:var(--radius-md);padding:10px;font-size:11px;font-family:var(--font-mono);color:var(--text-secondary);line-height:1.6;white-space:pre"></div>

          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-secondary" onclick="Pages._previewExportComptable()">👁 Aperçu</button>
            <button class="btn btn-primary"   onclick="Pages.exporterComptable()">📊 Exporter pour mon comptable</button>
          </div>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px;border-color:rgba(247,91,91,0.25)">
        <div class="card-header" style="border-bottom-color:rgba(247,91,91,0.2)">
          <span class="card-title" style="color:#F75B5B">⚠ Zone de test</span>
        </div>
        <div class="card-body">
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
            Supprime tous les clients, chantiers, devis, factures et métrés.<br>
            <strong>La configuration entreprise et la base tarifaire sont conservées.</strong>
          </p>
          <button class="btn btn-danger" onclick="Pages.reinitialiserDonnees()">
            🗑 Réinitialiser toutes les données
          </button>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px">
        <div class="card-header"><span class="card-title">✨ Produits ajoutés via IA</span></div>
        <div class="card-body">
          ${typeof ProduitsWeb !== 'undefined' ? ProduitsWeb.renderHistorique() : '<p style="color:var(--text-tertiary);font-size:13px;margin:0">Module non chargé.</p>'}
        </div>
      </div>

      ${Session.estAdmin() ? `
      <div class="card mt-16" style="max-width:600px">
        <div class="card-header">
          <span class="card-title">🤖 Fonctionnalités IA avancées</span>
          <span style="font-size:11px;color:var(--text-tertiary)">Admin uniquement</span>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Clé API
              <span style="font-size:11px;color:var(--text-tertiary);font-weight:400;margin-left:6px">
                (stockée localement sur cet appareil)
              </span>
            </label>
            <div style="display:flex;gap:8px">
              <input class="form-control" id="cfg-groq-key" type="password"
                value="${groqKey}" placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                style="font-family:var(--font-mono);font-size:13px;flex:1">
              <button class="btn btn-secondary" onclick="Pages.toggleGroqKeyVisibility()" title="Afficher/masquer">👁</button>
            </div>
          </div>
          <div id="groq-test-result" style="display:none;margin-bottom:12px;padding:10px 14px;border-radius:var(--radius-md);font-size:13px"></div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary" onclick="Pages.sauvegarderGroqKey()">💾 Enregistrer</button>
            <button class="btn btn-secondary" onclick="Pages.testerGroq()">⚡ Tester</button>
            ${groqKey ? `<button class="btn btn-danger" onclick="Pages.supprimerGroqKey()">Supprimer</button>` : ''}
          </div>
        </div>
      </div>` : ''}
    `;
    return div;
  },

  // ── Export Comptable ──────────────────────────────────────
  _getComptaPeriode() {
    const sel  = document.getElementById('export-compta-periode')?.value || 'annee';
    const now  = new Date();
    const y    = now.getFullYear();
    const m    = now.getMonth(); // 0-based
    let start, end;

    if (sel === 'mois')      { start = new Date(y, m, 1);     end = new Date(y, m + 1, 0); }
    else if (sel === 'mois_prec') { start = new Date(y, m - 1, 1); end = new Date(y, m, 0); }
    else if (sel === 'trim') {
      const q = Math.floor(m / 3);
      start = new Date(y, q * 3, 1); end = new Date(y, q * 3 + 3, 0);
    }
    else if (sel === 'trim_prec') {
      const q = Math.floor(m / 3) - 1;
      const qy = q < 0 ? y - 1 : y;
      const qq = q < 0 ? 3 : q;
      start = new Date(qy, qq * 3, 1); end = new Date(qy, qq * 3 + 3, 0);
    }
    else if (sel === 'annee')      { start = new Date(y, 0, 1); end = new Date(y, 11, 31); }
    else if (sel === 'annee_prec') { start = new Date(y - 1, 0, 1); end = new Date(y - 1, 11, 31); }
    else { start = new Date(2000, 0, 1); end = new Date(2099, 11, 31); }

    return { start, end };
  },

  _genererCSVComptable(format) {
    const { start, end } = this._getComptaPeriode();
    const factures = (DB.factures || []).filter(f => {
      const d = new Date(f.date || '');
      return d >= start && d <= end;
    });
    const config = DB.getConfig();
    const rows   = [];

    // En-tête selon format
    const isSage  = format === 'sage';
    const isEBP   = format === 'ebp';
    const isCegid = format === 'cegid';

    if (isSage) {
      rows.push(['JournalCode','JournalLib','EcritureNum','EcritureDate','CompteNum','CompteLib','CompteAuxNum','CompteAuxLib','PieceRef','PieceDate','EcritureLib','Debit','Credit','EcritureLet','DateLet','ValidDate','Montantdevise','Idevise'].join(';'));
    } else if (isEBP) {
      rows.push(['Type','Date','Pièce','Compte','Libellé','Débit','Crédit','Lettrage'].join(';'));
    } else if (isCegid) {
      rows.push(['Journal','Date','Référence','Compte','Libellé','Sens','Montant','Devise'].join(';'));
    } else {
      rows.push(['Date','N° pièce','Libellé','Compte','Intitulé compte','Débit','Crédit','Lettrage'].join(';'));
    }

    const fmtDate = d => {
      if (!d) return '';
      const dt = new Date(d);
      if (isNaN(dt)) return d;
      const dd = String(dt.getDate()).padStart(2, '0');
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const yy = dt.getFullYear();
      return isSage || isCegid ? yy + mm + dd : dd + '/' + mm + '/' + yy;
    };
    const fmtAmt = n => parseFloat(n || 0).toFixed(2).replace('.', ',');
    const esc    = s => '"' + String(s || '').replace(/"/g, '""') + '"';

    let ecritureNum = 1;

    factures.forEach(f => {
      const chantier = DB.getChantier ? DB.getChantier(f.chantierId) : null;
      const client   = chantier ? (DB.getClient ? DB.getClient(chantier.clientId) : null) : null;
      const clientNom = client?.nom || ('Client ' + (f.chantierId || f.id));
      const totalHT   = parseFloat(f.totalHT  || 0);
      const tvaAmt    = parseFloat(f.montantTVA || totalHT * (f.tva || 0.1));
      const totalTTC  = parseFloat(f.totalTTC  || totalHT + tvaAmt);
      const tvaRate   = Math.round((f.tva || 0.1) * 100);
      const numEcr    = String(ecritureNum++).padStart(6, '0');
      const clientCode = '411' + String(f.id || ecritureNum).padStart(3, '0');
      const tvaCode   = tvaRate <= 10 ? '445712' : '445711';
      const libelle   = esc((f.numero || 'FAC') + ' - ' + clientNom);

      if (isSage) {
        rows.push(['VT','Ventes','VT' + numEcr, fmtDate(f.date), clientCode, esc(clientNom), '', '', esc(f.numero||''), fmtDate(f.date), libelle, '', fmtAmt(totalTTC), '', '', '', '', ''].join(';'));
        rows.push(['VT','Ventes','VT' + numEcr, fmtDate(f.date), '706000', 'Prestations services', '', '', esc(f.numero||''), fmtDate(f.date), libelle, fmtAmt(totalHT), '', '', '', '', '', ''].join(';'));
        rows.push(['VT','Ventes','VT' + numEcr, fmtDate(f.date), tvaCode, 'TVA collectée ' + tvaRate + '%', '', '', esc(f.numero||''), fmtDate(f.date), libelle, fmtAmt(tvaAmt), '', '', '', '', '', ''].join(';'));
        if (f.statut === 'Payée' && f.datePaiement) {
          const numEcrR = String(ecritureNum++).padStart(6, '0');
          rows.push(['BQ','Banque','BQ' + numEcrR, fmtDate(f.datePaiement), '512000', 'Banque', '', '', esc(f.numero||''), fmtDate(f.datePaiement), esc('Règlement ' + f.numero), fmtAmt(totalTTC), '', '', '', '', '', ''].join(';'));
          rows.push(['BQ','Banque','BQ' + numEcrR, fmtDate(f.datePaiement), clientCode, esc(clientNom), '', '', esc(f.numero||''), fmtDate(f.datePaiement), esc('Règlement ' + f.numero), '', fmtAmt(totalTTC), '', '', '', '', ''].join(';'));
        }
      } else if (isEBP) {
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), clientCode, libelle, '', fmtAmt(totalTTC), ''].join(';'));
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), '706000', libelle, fmtAmt(totalHT), '', ''].join(';'));
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), tvaCode,  libelle, fmtAmt(tvaAmt), '', ''].join(';'));
        if (f.statut === 'Payée' && f.datePaiement) {
          rows.push(['BQ', fmtDate(f.datePaiement), esc(f.numero||''), '512000', esc('Règlement ' + f.numero), fmtAmt(totalTTC), '', ''].join(';'));
          rows.push(['BQ', fmtDate(f.datePaiement), esc(f.numero||''), clientCode, esc('Règlement ' + f.numero), '', fmtAmt(totalTTC), ''].join(';'));
        }
      } else if (isCegid) {
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), clientCode, libelle, 'C', fmtAmt(totalTTC), 'EUR'].join(';'));
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), '706000',   libelle, 'D', fmtAmt(totalHT), 'EUR'].join(';'));
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), tvaCode,    libelle, 'D', fmtAmt(tvaAmt), 'EUR'].join(';'));
      } else {
        rows.push([fmtDate(f.date), esc(f.numero||''), libelle, clientCode, esc('Clients'), '', fmtAmt(totalTTC), esc(f.numero||'')].join(';'));
        rows.push([fmtDate(f.date), esc(f.numero||''), libelle, '706000', esc('Prestations services'), fmtAmt(totalHT), '', esc(f.numero||'')].join(';'));
        rows.push([fmtDate(f.date), esc(f.numero||''), libelle, tvaCode, esc('TVA collectée ' + tvaRate + '%'), fmtAmt(tvaAmt), '', esc(f.numero||'')].join(';'));
        if (f.statut === 'Payée' && f.datePaiement) {
          rows.push([fmtDate(f.datePaiement), esc(f.numero||''), esc('Règlement ' + f.numero), '512000', esc('Banque'), fmtAmt(totalTTC), '', esc(f.numero||'')].join(';'));
          rows.push([fmtDate(f.datePaiement), esc(f.numero||''), esc('Règlement ' + f.numero), clientCode, esc('Clients'), '', fmtAmt(totalTTC), esc(f.numero||'')].join(';'));
        }
      }
    });

    // ── Dépenses fournisseurs ─────────────────────────────────
    const depenses = (() => { try { return JSON.parse(localStorage.getItem('plaqpro_depenses') || '[]'); } catch { return []; } })()
      .filter(d => { const dt = new Date(d.date || ''); return dt >= start && dt <= end; });

    depenses.forEach(d => {
      const numEcr   = String(ecritureNum++).padStart(6, '0');
      const fourCode = '401' + String(d.id || ecritureNum).toString().slice(-3).padStart(3, '0');
      const achatCode= d.montantHT < 500 ? '606000' : '605000'; // fournitures / matières
      const libelle  = esc((d.numero || 'DEP') + ' - ' + (d.fournisseur || 'Fournisseur'));
      const htAmt    = parseFloat(d.montantHT  || 0);
      const tvaAmt   = parseFloat(d.montantTVA || htAmt * ((d.tauxTVA || 20) / 100));
      const ttcAmt   = parseFloat(d.montantTTC || htAmt + tvaAmt);
      const tvaCode  = (d.tauxTVA || 20) <= 10 ? '445662' : '445661'; // TVA déductible

      if (isSage) {
        rows.push(['AC','Achats','AC' + numEcr, fmtDate(d.date), fourCode, esc(d.fournisseur||''), '', '', esc(d.numero||''), fmtDate(d.date), libelle, fmtAmt(ttcAmt), '', '', '', '', '', ''].join(';'));
        rows.push(['AC','Achats','AC' + numEcr, fmtDate(d.date), achatCode, 'Achats matériaux', '', '', esc(d.numero||''), fmtDate(d.date), libelle, '', fmtAmt(htAmt), '', '', '', '', ''].join(';'));
        rows.push(['AC','Achats','AC' + numEcr, fmtDate(d.date), tvaCode,  'TVA déductible', '', '', esc(d.numero||''), fmtDate(d.date), libelle, '', fmtAmt(tvaAmt), '', '', '', '', ''].join(';'));
      } else if (isEBP) {
        rows.push(['AC', fmtDate(d.date), esc(d.numero||''), fourCode, libelle, fmtAmt(ttcAmt), '', ''].join(';'));
        rows.push(['AC', fmtDate(d.date), esc(d.numero||''), achatCode, libelle, '', fmtAmt(htAmt), ''].join(';'));
        rows.push(['AC', fmtDate(d.date), esc(d.numero||''), tvaCode,   libelle, '', fmtAmt(tvaAmt), ''].join(';'));
      } else if (isCegid) {
        rows.push(['AC', fmtDate(d.date), esc(d.numero||''), fourCode,  libelle, 'D', fmtAmt(ttcAmt), 'EUR'].join(';'));
        rows.push(['AC', fmtDate(d.date), esc(d.numero||''), achatCode, libelle, 'C', fmtAmt(htAmt), 'EUR'].join(';'));
        rows.push(['AC', fmtDate(d.date), esc(d.numero||''), tvaCode,   libelle, 'C', fmtAmt(tvaAmt), 'EUR'].join(';'));
      } else {
        rows.push([fmtDate(d.date), esc(d.numero||''), libelle, fourCode,  esc('Fournisseurs'), fmtAmt(ttcAmt), '', esc(d.numero||'')].join(';'));
        rows.push([fmtDate(d.date), esc(d.numero||''), libelle, achatCode, esc('Achats matériaux'), '', fmtAmt(htAmt), esc(d.numero||'')].join(';'));
        rows.push([fmtDate(d.date), esc(d.numero||''), libelle, tvaCode,   esc('TVA déductible'), '', fmtAmt(tvaAmt), esc(d.numero||'')].join(';'));
      }
    });

    return { csv: rows.join('\n'), count: factures.length + depenses.length };
  },

  _previewExportComptable() {
    const format = document.getElementById('export-compta-format')?.value || 'generic';
    const { csv, count } = this._genererCSVComptable(format);
    const zone = document.getElementById('export-compta-preview');
    if (!zone) return;
    if (count === 0) { App.toast('Aucune facture pour cette période', 'error'); return; }
    const lines = csv.split('\n').slice(0, 12);
    zone.style.display = '';
    zone.textContent   = lines.join('\n') + (csv.split('\n').length > 12 ? '\n…' : '');
    App.toast(count + ' facture' + (count > 1 ? 's' : '') + ' trouvée' + (count > 1 ? 's' : ''), 'success');
  },

  exporterComptable() {
    const format = document.getElementById('export-compta-format')?.value || 'generic';
    const periode= document.getElementById('export-compta-periode')?.value || 'annee';
    const { csv, count } = this._genererCSVComptable(format);
    if (count === 0) { App.toast('Aucune facture pour cette période', 'error'); return; }
    const config  = DB.getConfig ? DB.getConfig() : {};
    const nom     = (config.nomEntreprise || 'plaqpro').replace(/\s+/g, '_');
    const suffix  = { sage: 'sage', ebp: 'ebp', cegid: 'cegid', generic: 'comptable' }[format] || 'export';
    const fname   = nom + '_' + suffix + '_' + periode + '_' + new Date().toISOString().slice(0, 10) + '.csv';
    const bom     = '﻿'; // BOM UTF-8 pour Excel
    const blob    = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
    const a       = document.createElement('a');
    a.href        = URL.createObjectURL(blob);
    a.download    = fname;
    a.click();
    URL.revokeObjectURL(a.href);
    App.toast(count + ' facture' + (count > 1 ? 's' : '') + ' exportée' + (count > 1 ? 's' : '') + ' → ' + fname, 'success');
  },

  previewLogo(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { App.toast('Fichier trop lourd (max 2 Mo)', 'error'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      localStorage.setItem('plaqpro_logo_entreprise', e.target.result);
      const preview = document.getElementById('logo-preview');
      if (preview) preview.innerHTML = `<img src="${e.target.result}" style="max-width:200px;max-height:80px;object-fit:contain" alt="Logo">`;
      App.toast('Logo enregistré !');
      setTimeout(() => App.navigate('config'), 400);
    };
    reader.readAsDataURL(file);
  },

  supprimerLogo() {
    if (!confirm('Supprimer le logo ?')) return;
    localStorage.removeItem('plaqpro_logo_entreprise');
    App.navigate('config');
    App.toast('Logo supprimé');
  },

  sauvegarderConfig() {
    const g = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    DB.saveConfig({
      nomEntreprise:      g('cfg-nom'),
      adresse:            g('cfg-adresse'),
      telephone:          g('cfg-tel'),
      email:              g('cfg-email'),
      siret:              g('cfg-siret'),
      prefixeDevis:       g('cfg-prefix'),
      ville:              g('cfg-ville') || 'Lyon',
      formeJuridique:     g('cfg-forme'),
      rcs:                g('cfg-rcs'),
      tvaIntra:           g('cfg-tva-intra'),
      iban:               g('cfg-iban'),
      bic:                g('cfg-bic'),
      banque:             g('cfg-banque'),
      conditionsPaiement: g('cfg-conditions'),
      mentionsLegales:    g('cfg-mentions'),
      piedPageDevis:      g('cfg-pied-devis'),
      piedPageFacture:    g('cfg-pied-facture'),
    });
    const ville = g('cfg-ville') || 'Lyon';
    localStorage.setItem('plaqpro_ville', ville);
    if (typeof Meteo !== 'undefined') Meteo.changerVille(ville);
    App.toast('Configuration enregistrée !');
  },

  sauvegarderProfil() {
    const profil = {
      mixPro:               parseInt(document.getElementById('cfg-mix-pro')?.value ?? 70),
      typeInterv:           document.getElementById('cfg-type-interv')?.value || 'multi',
      tauxHorairePro:       parseFloat(document.getElementById('cfg-taux-pro')?.value ?? 42),
      tauxHoraireParticulier: parseFloat(document.getElementById('cfg-taux-part')?.value ?? 38),
      margeMatPro:          parseFloat(document.getElementById('cfg-marge-mat-pro')?.value ?? 22) / 100,
      margeMatParticulier:  parseFloat(document.getElementById('cfg-marge-mat-part')?.value ?? 32) / 100,
      margeMO:              parseFloat(document.getElementById('cfg-marge-mo')?.value ?? 20) / 100,
      tvaPro:               parseFloat(document.getElementById('cfg-tva-pro')?.value ?? 20),
      tvaParticulier:       parseFloat(document.getElementById('cfg-tva-part')?.value ?? 10),
    };
    localStorage.setItem('plaqpro_profil', JSON.stringify(profil));
    App.toast('✅ Profil enregistré', 'success');
  },

  sauvegarderGroqKey() {
    const key = document.getElementById('cfg-groq-key')?.value.trim();
    if (!key) { App.toast('Clé vide', 'error'); return; }
    localStorage.setItem('plaqpro_groq_key', key);
    if (typeof AssistantIA !== 'undefined') AssistantIA._checkGroq();
    App.toast('Paramètres IA enregistrés !');
  },

  supprimerGroqKey() {
    if (!confirm('Supprimer la clé API Groq ?')) return;
    localStorage.removeItem('plaqpro_groq_key');
    if (typeof AssistantIA !== 'undefined') AssistantIA._checkGroq();
    App.navigate('config');
    App.toast('Clé supprimée');
  },

  toggleGroqKeyVisibility() {
    const inp = document.getElementById('cfg-groq-key');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
  },

  async testerGroq() {
    const key = document.getElementById('cfg-groq-key')?.value.trim();
    const res = document.getElementById('groq-test-result');
    if (!res) return;
    if (!key) {
      res.style.display = 'block';
      res.style.background = 'rgba(247,91,91,0.12)';
      res.style.border = '1px solid rgba(247,91,91,0.3)';
      res.style.color = '#F75B5B';
      res.innerHTML = '⚠ Entrez une clé avant de tester.';
      return;
    }
    res.style.display = 'block';
    res.style.background = 'rgba(255,255,255,0.04)';
    res.style.border = '1px solid var(--border)';
    res.style.color = 'var(--text-secondary)';
    res.innerHTML = '⏳ Test en cours…';
    try {
      // Test direct avec la clé saisie (utile en local pour valider la clé)
      const testUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const r = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'Réponds juste "OK"' }],
          max_tokens: 5
        })
      });
      const data = await r.json();
      if (data.choices?.[0]?.message?.content) {
        res.style.background = 'rgba(45,212,160,0.10)';
        res.style.border = '1px solid rgba(45,212,160,0.3)';
        res.style.color = '#2DD4A0';
        res.innerHTML = '✅ Connexion réussie ! Réponse : ' + data.choices[0].message.content.trim();
      } else if (data.error) {
        throw new Error(data.error.message);
      }
    } catch (err) {
      res.style.background = 'rgba(247,91,91,0.12)';
      res.style.border = '1px solid rgba(247,91,91,0.3)';
      res.style.color = '#F75B5B';
      res.innerHTML = '⚠ Erreur : ' + err.message;
    }
  },

  // ── Modales ───────────────────────────────────────────────
  reinitialiserDonnees() {
    if (!confirm('Êtes-vous sûr ? Cette action est irréversible.\n\nTous les clients, chantiers, devis, factures et métrés seront supprimés.\nLa configuration entreprise et les produits seront conservés.')) return;
    [DB.KEYS.clients, DB.KEYS.chantiers, DB.KEYS.devis, DB.KEYS.factures, DB.KEYS.metrages].forEach(key => {
      localStorage.removeItem(key);
    });
    App.toast('Base de données réinitialisée', 'success');
    setTimeout(() => App.navigate('dashboard'), 400);
  },

  toggleAccordion(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const open = el.style.display !== 'none';
    el.style.display = open ? 'none' : 'block';
    const ico = document.getElementById(id + '-ico');
    if (ico) ico.textContent = open ? '▸' : '▾';
  },

  _initMeteoAccordion() {
    const el = document.getElementById('acc-meteo');
    if (!el || el.style.display === 'none') return;
    const slot = document.getElementById('meteo-accordion-slot');
    if (!slot || slot.dataset.inited) return;
    slot.dataset.inited = '1';
    if (typeof Meteo === 'undefined') {
      slot.innerHTML = '<p style="color:var(--text-tertiary);font-size:13px;margin:8px 0">Module météo non chargé.</p>';
      return;
    }
    if (Meteo._data) {
      slot.appendChild(Meteo.renderCard());
    } else {
      slot.innerHTML = `
        <div style="text-align:center;padding:24px;color:var(--text-tertiary);font-size:13px">
          🌡️ Données météo en cours de chargement…
          <br>
          <button class="btn btn-secondary" style="margin-top:12px;font-size:12px"
            onclick="const s=document.getElementById('meteo-accordion-slot');if(Meteo._data){s.innerHTML='';s.appendChild(Meteo.renderCard());}else{Meteo.refresh();}">
            ↻ Rafraîchir
          </button>
        </div>`;
    }
  },

  _initGraphsAccordion() {
    const el = document.getElementById('acc-graphs');
    if (!el || el.style.display === 'none') return;
    const container = document.getElementById('db-graphs-container');
    if (!container || container.dataset.inited) return;
    container.dataset.inited = '1';
    if (typeof Graphiques === 'undefined') {
      container.innerHTML = '<p style="color:var(--text-tertiary);font-size:13px;margin:0">Module graphiques non chargé.</p>';
      return;
    }
    container.appendChild(Graphiques.renderSection());
    setTimeout(() => Graphiques.initCharts(), 80);
  },

  modalNouveauClient() {
    const body = Pages._formClient();
    App.openModal('Nouveau client', body, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderClient()">Créer le client</button>
    `);
  },

  modalEditClient(id) {
    const c = DB.getClient(id);
    if (!c) return;
    const body = Pages._formClient(c);
    App.openModal('Modifier — ' + c.nom, body, `
      <button class="btn btn-danger" onclick="Pages.supprimerClient(${id})">Supprimer</button>
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderClient(${id})">Enregistrer</button>
    `);
  },

  _formClient(c = {}) {
    const d = document.createElement('div');
    d.innerHTML = `
      <div class="form-group"><label class="form-label">Société *</label>
        <input class="form-control" id="f-nom" value="${c.nom || ''}" placeholder="Nom de l'entreprise ou du client"></div>
      <div class="form-group"><label class="form-label">Adresse</label>
        <input class="form-control" id="f-adresse" value="${c.adresse || ''}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Code postal</label>
          <input class="form-control" id="f-cp" value="${c.cp || ''}"></div>
        <div class="form-group"><label class="form-label">Ville</label>
          <input class="form-control" id="f-ville" value="${c.ville || ''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Téléphone</label>
          <input class="form-control" id="f-tel" value="${c.telephone || ''}"></div>
        <div class="form-group"><label class="form-label">Email</label>
          <input class="form-control" id="f-email" value="${c.email || ''}"></div>
      </div>
    `;
    return d;
  },

  sauvegarderClient(id) {
    const nom = document.getElementById('f-nom').value.trim();
    if (!nom) { App.toast('Le nom est obligatoire', 'error'); return; }
    const data = {
      nom, adresse: document.getElementById('f-adresse').value,
      cp: document.getElementById('f-cp').value,
      ville: document.getElementById('f-ville').value,
      telephone: document.getElementById('f-tel').value,
      email: document.getElementById('f-email').value,
    };
    if (id) { DB.updateClient(id, data); App.toast('Client mis à jour'); }
    else     { DB.addClient(data);        App.toast('Client créé !'); }
    App.closeModal();
    App.navigate('clients');
  },

  supprimerClient(id) {
    if (!confirm('Désactiver ce client ?')) return;
    DB.deleteClient(id);
    App.closeModal();
    App.navigate('clients');
    App.toast('Client désactivé');
  },

  modalNouveauChantier() {
    const body = Pages._formChantier();
    App.openModal('Nouveau chantier', body, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderChantier()">Créer le chantier</button>
    `);
  },

  modalEditChantier(id) {
    const c = DB.getChantier(id);
    if (!c) return;
    const body = Pages._formChantier(c);
    App.openModal('Modifier — ' + c.nom, body, `
      <button class="btn btn-danger" onclick="Pages.supprimerChantier(${id})">Supprimer</button>
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderChantier(${id})">Enregistrer</button>
    `);
  },

  _formChantier(c = {}) {
    const d = document.createElement('div');
    const isExt = c.typeChantier === 'exterieur';
    d.innerHTML = `
      <div class="form-group">
        <label class="form-label">Type de chantier *</label>
        <div style="display:flex;gap:10px;margin-bottom:4px">
          <button type="button" id="type-btn-int"
            class="btn ${!isExt ? 'btn-primary' : 'btn-secondary'}"
            style="flex:1;padding:16px 10px;font-size:20px;display:flex;flex-direction:column;align-items:center;gap:6px;border-radius:var(--radius-md)"
            onclick="Pages.setTypeChantier('interieur')">
            🏠<span style="font-size:12px;font-weight:700;letter-spacing:.04em">INTÉRIEUR</span>
          </button>
          <button type="button" id="type-btn-ext"
            class="btn ${isExt ? 'btn-primary' : 'btn-secondary'}"
            style="flex:1;padding:16px 10px;font-size:20px;display:flex;flex-direction:column;align-items:center;gap:6px;border-radius:var(--radius-md)"
            onclick="Pages.setTypeChantier('exterieur')">
            🌿<span style="font-size:12px;font-weight:700;letter-spacing:.04em">EXTÉRIEUR</span>
          </button>
        </div>
        <input type="hidden" id="f-type-chantier" value="${c.typeChantier || 'interieur'}">
      </div>
      <div class="form-group"><label class="form-label">Client *</label>
        <select class="form-control" id="f-client">
          <option value="">— Sélectionner —</option>
          ${DB.clients.map(cl => `<option value="${cl.id}" ${c.clientId == cl.id ? 'selected' : ''}>${cl.nom}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Nom du chantier *</label>
        <input class="form-control" id="f-nom-ch" value="${c.nom || ''}"></div>
      <div class="form-group"><label class="form-label">Adresse du chantier</label>
        <input class="form-control" id="f-adr-ch" value="${c.adresse || ''}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Date début</label>
          <input class="form-control" type="date" id="f-debut" value="${c.dateDebut || ''}"></div>
        <div class="form-group"><label class="form-label">Date fin prévue</label>
          <input class="form-control" type="date" id="f-fin" value="${c.dateFin || ''}"></div>
      </div>
      <div class="form-group"><label class="form-label">Statut</label>
        <select class="form-control" id="f-statut">
          ${['En attente','En cours','Terminé','Annulé'].map(s => `<option ${c.statut === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Notes</label>
        <textarea class="form-control" id="f-notes">${c.notes || ''}</textarea></div>
    `;
    return d;
  },

  setTypeChantier(type) {
    const inp = document.getElementById('f-type-chantier');
    const btnInt = document.getElementById('type-btn-int');
    const btnExt = document.getElementById('type-btn-ext');
    if (!inp || !btnInt || !btnExt) return;
    inp.value = type;
    if (type === 'exterieur') {
      btnExt.className = btnExt.className.replace('btn-secondary','btn-primary');
      btnInt.className = btnInt.className.replace('btn-primary','btn-secondary');
    } else {
      btnInt.className = btnInt.className.replace('btn-secondary','btn-primary');
      btnExt.className = btnExt.className.replace('btn-primary','btn-secondary');
    }
  },

  sauvegarderChantier(id) {
    const nom = document.getElementById('f-nom-ch').value.trim();
    const clientId = parseInt(document.getElementById('f-client').value);
    if (!nom || !clientId) { App.toast('Nom et client obligatoires', 'error'); return; }
    const data = {
      clientId, nom, adresse: document.getElementById('f-adr-ch').value,
      dateDebut: document.getElementById('f-debut').value,
      dateFin:   document.getElementById('f-fin').value,
      statut:    document.getElementById('f-statut').value,
      notes:     document.getElementById('f-notes').value,
      typeChantier: document.getElementById('f-type-chantier')?.value || 'interieur',
    };
    if (id) { DB.updateChantier(id, data); App.toast('Chantier mis à jour'); }
    else     { DB.addChantier(data);        App.toast('Chantier créé !'); }
    App.closeModal();
    App.navigate('chantiers');
  },

  supprimerChantier(id) {
    if (!confirm('Supprimer ce chantier ?')) return;
    DB.deleteChantier(id);
    App.closeModal();
    App.navigate('chantiers');
    App.toast('Chantier supprimé');
  },

  modalNouveauMetrage(chantierId) {
    const d = document.createElement('div');
    d.innerHTML = `
      ${!chantierId ? `<div class="form-group"><label class="form-label">Chantier *</label>
        <select class="form-control" id="f-ch-metrage">
          <option value="">— Sélectionner —</option>
          ${DB.chantiers.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
        </select></div>` : `<input type="hidden" id="f-ch-metrage" value="${chantierId}">`}
      <div class="form-group"><label class="form-label">Nom de la pièce *</label>
        <input class="form-control" id="f-piece" placeholder="Séjour, Chambre 1..."></div>
      <div class="form-row-3">
        <div class="form-group"><label class="form-label">Longueur (m)</label>
          <input class="form-control" id="f-long" type="number" step="0.01" placeholder="0.00" oninput="Pages.calcMetragePreview()"></div>
        <div class="form-group"><label class="form-label">Largeur (m)</label>
          <input class="form-control" id="f-larg" type="number" step="0.01" placeholder="0.00" oninput="Pages.calcMetragePreview()"></div>
        <div class="form-group"><label class="form-label">Hauteur (m)</label>
          <input class="form-control" id="f-haut" type="number" step="0.01" value="2.6" oninput="Pages.calcMetragePreview()"></div>
      </div>
      <div id="metrage-preview" style="display:none;background:var(--bg-tertiary);border-radius:var(--radius-md);padding:12px;margin-top:4px">
        <div class="flex gap-16" style="font-size:13px">
          <div><span class="text-tertiary">Périmètre : </span><strong id="prev-perim">—</strong></div>
          <div><span class="text-tertiary">Murs : </span><strong id="prev-murs">—</strong></div>
          <div><span class="text-tertiary">Plafond : </span><strong id="prev-plaf">—</strong></div>
        </div>
      </div>
    `;
    App.openModal('Nouveau métré', d, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderMetrage()">Ajouter la pièce</button>
    `);
  },

  calcMetragePreview() {
    const L = parseFloat(document.getElementById('f-long')?.value) || 0;
    const l = parseFloat(document.getElementById('f-larg')?.value) || 0;
    const H = parseFloat(document.getElementById('f-haut')?.value) || 0;
    if (L > 0 && l > 0 && H > 0) {
      const c = Calculs.metrage(L, l, H);
      document.getElementById('prev-perim').textContent = Calculs.fmtN(c.perimetre, 2) + ' m';
      document.getElementById('prev-murs').textContent  = Calculs.fmtN(c.surfMurs, 2) + ' m²';
      document.getElementById('prev-plaf').textContent  = Calculs.fmtN(c.surfPlafond, 2) + ' m²';
      document.getElementById('metrage-preview').style.display = 'block';
    }
  },

  sauvegarderMetrage() {
    const chantierId = parseInt(document.getElementById('f-ch-metrage')?.value);
    const piece = document.getElementById('f-piece')?.value.trim();
    const L = parseFloat(document.getElementById('f-long')?.value);
    const l = parseFloat(document.getElementById('f-larg')?.value);
    const H = parseFloat(document.getElementById('f-haut')?.value);
    if (!chantierId || !piece || !L || !l || !H) {
      App.toast('Tous les champs sont obligatoires', 'error');
      return;
    }
    DB.addMetrage({ chantierId, piece, longueur: L, largeur: l, hauteur: H });
    App.closeModal();
    Pages.chargerMetrages(chantierId);
    App.toast('Métré ajouté !');
  },

  modalNouveauDevis() {
    App.navigate('devis');
  },

  modalNouveauProduit() {
    const d = Pages._formProduit();
    App.openModal('Nouveau produit', d, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderProduit()">Créer</button>
    `);
  },

  modalEditProduit(id) {
    const p = DB.getById(DB.KEYS.produits, id);
    if (!p) return;
    const d = Pages._formProduit(p);
    App.openModal('Modifier — ' + p.reference, d, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderProduit(${id})">Enregistrer</button>
    `);
  },

  _formProduit(p = {}) {
    const d = document.createElement('div');
    const isNew = !p.id;
    const webSearch = isNew && typeof ProduitsWeb !== 'undefined'
      ? `<div style="margin-bottom:14px;padding:10px 14px;background:rgba(255,155,50,0.08);
              border:1px solid rgba(255,155,50,0.2);border-radius:var(--radius-md);
              font-size:12px;color:var(--text-secondary);display:flex;align-items:center;justify-content:space-between;gap:8px">
           <span>Vous ne trouvez pas ce produit dans le catalogue ?</span>
           <button type="button" class="btn btn-secondary" style="font-size:11px;padding:4px 10px;white-space:nowrap"
             onclick="App.closeModal();setTimeout(()=>{ App.navigate('produits'); setTimeout(()=>{ const inp=document.getElementById('prod-search'); if(inp){inp.focus();} },200); },100)">
             🔍 Chercher via IA
           </button>
         </div>`
      : '';
    d.innerHTML = `
      ${webSearch}
      <div class="form-row">
        <div class="form-group"><label class="form-label">Catégorie</label>
          <select class="form-control" id="f-cat">
            ${['Cloison','Plaque','Fixation','Joint','Isolation','Peinture','Preparat.','Accessoire','Plafond','Main oeuvre']
              .map(c => `<option ${p.categorie === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">Référence *</label>
          <input class="form-control" id="f-ref" value="${p.reference || ''}"></div>
      </div>
      <div class="form-group"><label class="form-label">Désignation *</label>
        <input class="form-control" id="f-design" value="${p.designation || ''}"></div>
      <div class="form-row-3">
        <div class="form-group"><label class="form-label">Unité</label>
          <select class="form-control" id="f-unite">
            ${['u','ml','m2','L','sac','boite','rl','h','lot'].map(u => `<option ${p.unite === u ? 'selected' : ''}>${u}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">Prix HT (€) *</label>
          <input class="form-control" id="f-prix" type="number" step="0.01" value="${p.prixHT || ''}"></div>
        <div class="form-group"><label class="form-label">Rendement</label>
          <input class="form-control" id="f-rend" value="${p.rendement || '-'}"></div>
      </div>
    `;
    return d;
  },

  sauvegarderProduit(id) {
    const ref   = document.getElementById('f-ref').value.trim();
    const design = document.getElementById('f-design').value.trim();
    const prix  = parseFloat(document.getElementById('f-prix').value);
    if (!ref || !design || !prix) { App.toast('Champs obligatoires manquants', 'error'); return; }
    const data = {
      categorie:   document.getElementById('f-cat').value,
      reference:   ref, designation: design,
      unite:       document.getElementById('f-unite').value,
      prixHT:      prix,
      rendement:   document.getElementById('f-rend').value,
    };
    if (id) { DB.updateProduit(id, data); App.toast('Produit mis à jour'); }
    else     { DB.addProduit(data);        App.toast('Produit créé !'); }
    App.closeModal();
    App.navigate('produits');
  },
};

// Lancer l'app
document.addEventListener('DOMContentLoaded', () => App.init());
