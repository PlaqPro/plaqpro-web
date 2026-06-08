/**
 * PlaqPro+ â€” Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi â€” Saint-Priest (69)
 * Tous droits reserves â€” All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours â€” Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB â€” Application principale
//  app.js
// ============================================================

window.esc = function(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
};

const App = {

  currentPage: 'dashboard',
  currentModal: null,

  // â”€â”€ Initialisation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  init() {
    this.renderSidebar();
    this.navigate('dashboard');
    this.bindEvents();
  },

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // NOTE : ce router partiel est Ã©crasÃ© au chargement par index.html (App.navigate = navigateTo).
  // Ne pas ajouter de pages ici â€” les ajouter dans pageMap de index.html uniquement.
  navigate(page, params = {}) {
    this.currentPage = page;
    this.currentParams = params;

    // Mettre Ã  jour la sidebar
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
      devisIntelligent: (params) => Pages.devisIntelligent(params),
      devis:      () => Pages.devis(params),
      devisMulti:           () => DevisMulti.render(),
      listeDevis:           () => ListeDevis.render('content'),
      historiqueChiffrages: () => HistoriqueChiffrages.render('content'),
      chiffrageRecap:      (params) => CalcExpressRecap.afficherRecap('content', params && params.id),
      dashboardChiffrages:   ()       => DashboardChiffrages.render('content'),
      comparateurChiffrages: ()       => CalcExpressComparateur.render('content'),
      listeAchatV2:          ()       => ListeAchatV2.render('content', [], [], {}),
      produits:   () => Pages.produits(),
      catalogueFournisseurs: () => Pages.catalogueFournisseurs(),
      config:     () => Pages.config(),
      calcul:      () => Pages.calculateur(),
      calculateur: () => Pages.calculateur(),
      calendrier:  () => Pages.calendrier(),
      prospection: () => Pages.prospection(),
      factures:    () => Pages.factures(),
      projets:     () => Pages.projetsTypes(),
      liste_achat: () => Pages.listeAchat(),
      dpgf:        () => Pages.dpgf(),
      tarifs:      () => Pages.tarifs(),
      memo:        () => Pages.memo(),
      maconnerie:  () => Pages.maconnerie(),
      electricite: () => Pages.electricite(),
      plomberie:   () => Pages.plomberie(),
      sousTraitants: () => Pages.sousTraitants(),
      charges:     () => Pages.charges(),
      rentabilite: () => Pages.rentabilite(),
      acoustique:  () => Pages.acoustique(),
      resistanceFeu: () => Pages.resistanceFeu(),
      thermique:     () => Pages.thermique(),
      sectionCable:  () => Pages.sectionCable(),
      tempsChantier: () => Pages.tempsChantier(),
      linteau:       () => Pages.linteau(),
      monCompte:     () => Pages.monCompte(),
      chargesCouts:  () => Pages.chargesCouts(),
      inscription:   () => Pages.inscription(),
      legal:         (params) => Pages.legal(params && params.section),
      quizMetiers:   () => Pages.quizMetiers(),
      calcExpressV2: () => Pages.calcExpressV2(),
    };

    if (pages[page]) {
      content.appendChild(pages[page]());
    }

    // Mettre Ã  jour le topbar
    this.updateTopbar(page, params);
  },

  updateTopbar(page, params) {
    const titles = {
      dashboard: 'Tableau de bord',
      clients:   'Clients',
      chantiers: 'Chantiers',
      metrages:  'MÃ©trÃ©s',
      cloisons:  'Cloisons',
      peinture:  'Peinture',
      devisIntelligent: 'ðŸ“„ Nouveau Devis',
      devis:     'Devis',
      produits:  'Catalogue fournisseurs',
      config:      'Configuration',
      quizMetiers:   'ðŸŽ® Quiz MÃ©tiers BTP',
      calcExpressV2: 'âš¡ Nouveau chiffrage',
    };
    document.getElementById('topbar-title').textContent = titles[page] || page;
  },

  // â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  renderSidebar() {
    const nav = [
      { page: 'calcExpressV2', icon: '<i class="ph ph-lightning"></i>', label: 'âš¡ Nouveau chiffrage' },
      { page: 'dashboard',   icon: '<i class="ph ph-squares-four"></i>', label: 'Tableau de bord' },

      { section: 'ðŸ‘¥ Gestion' },
      { page: 'clients',     icon: '<i class="ph ph-users"></i>', label: 'Clients' },
      { page: 'chantiers',   icon: '<i class="ph ph-hard-hat"></i>', label: 'Chantiers & MÃ©trÃ©s' },
      { page: 'sousTraitants', icon: '<i class="ph ph-handshake"></i>', label: 'Sous-traitants' },
      { page: 'calendrier',  icon: '<i class="ph ph-calendar"></i>', label: 'Calendrier' },

      { section: 'ðŸ“„ Commercial' },
      { page: 'devisIntelligent', icon: '<i class="ph ph-file-text"></i>', label: 'Devis' },
      { page: 'devis', icon: '<i class="ph ph-clock-counter-clockwise"></i>', label: 'Devis (ancien)' },
      { page: 'factures',    icon: '<i class="ph ph-receipt"></i>', label: 'Factures' },
      { page: 'dpgf',        icon: '<i class="ph ph-bank"></i>', label: 'Appels d\'offres' },
      { page: 'prospection', icon: '<i class="ph ph-map-pin"></i>', label: 'Prospection IA' },

      { section: 'ðŸ”§ Outils' },
      { page: 'produits',    icon: '<i class="ph ph-package"></i>', label: 'Base produits' },
      { page: 'catalogueFournisseurs', icon: '<i class="ph ph-storefront"></i>', label: 'Catalogue fournisseurs' },
      { page: 'tarifs',      icon: '<i class="ph ph-coins"></i>', label: 'Mes prix de vente' },
      { page: 'calcul',      icon: '<i class="ph ph-lightning"></i>', label: 'Calcul Express (ancien)' },

      { section: 'ðŸ“ Techniques' },
      { page: 'acoustique',  icon: '<i class="ph ph-speaker-high"></i>', label: 'Acoustique' },
      { page: 'resistanceFeu', icon: '<i class="ph ph-fire"></i>', label: 'RÃ©sistance au feu' },
      { page: 'thermique',   icon: '<i class="ph ph-thermometer"></i>', label: 'Thermique' },
      { page: 'sectionCable', icon: '<i class="ph ph-lightning"></i>', label: 'CÃ¢blage' },
      { page: 'charges',     icon: '<i class="ph ph-scales"></i>', label: 'Charge plancher' },
      { page: 'linteau',     icon: '<i class="ph ph-bridge"></i>', label: 'Linteau' },

      { section: 'âš™ï¸ ParamÃ¨tres' },
      { page: 'monCompte',   icon: '<i class="ph ph-user-circle"></i>', label: 'Mon compte' },
      { page: 'chargesCouts', icon: '<i class="ph ph-calculator"></i>', label: 'Mes charges & coÃ»ts' },
      { page: 'config',      icon: '<i class="ph ph-gear"></i>', label: 'Configuration' },
      { page: 'legal',       icon: '<i class="ph ph-scales"></i>', label: 'Mentions lÃ©gales' },

      { section: 'ðŸŽ® Formation' },
      { page: 'quizMetiers', icon: '<i class="ph ph-game-controller"></i>', label: 'Quiz MÃ©tiers BTP' },
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

  // â”€â”€ Ã‰vÃ©nements globaux â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  bindEvents() {
    // Fermer modal avec Ã‰chap
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  // â”€â”€ Modales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  modalForm({ titre, champs, onConfirm }) {
    const id = 'modal-form-' + Date.now();
    const html = `<div id="${id}" style="position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:28px;width:380px;max-width:95vw">
        <div style="font-weight:700;font-size:16px;margin-bottom:20px">${esc(titre)}</div>
        ${champs.map(c => `<div style="margin-bottom:14px">
          <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px">${esc(c.label)}</label>
          <input id="${id}-${c.id}" type="${c.type||'text'}" style="width:100%;padding:8px 10px;background:var(--bg-input,var(--bg));border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:14px" />
        </div>`).join('')}
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
          <button onclick="document.getElementById('${id}').remove()" style="padding:8px 16px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--text);cursor:pointer">Annuler</button>
          <button id="${id}-ok" style="padding:8px 16px;background:var(--accent);border:none;border-radius:6px;color:#fff;font-weight:600;cursor:pointer">CrÃ©er</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById(id);
    modal.querySelector(`#${id}-ok`).addEventListener('click', () => {
      const vals = {};
      champs.forEach(c => { vals[c.id] = modal.querySelector(`#${id}-${c.id}`).value.trim(); });
      if (onConfirm(vals) !== false) modal.remove();
    });
    const first = modal.querySelector('input');
    if (first) first.focus();
  },

  modalConfirm({ message, onConfirm, labelOui = 'Confirmer', labelNon = 'Annuler' }) {
    const id = 'modal-confirm-' + Date.now();
    const el = document.createElement('div');
    el.id = id;
    el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
    el.innerHTML = `<div style="background:var(--bg-card,#fff);border-radius:12px;padding:24px;max-width:360px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.2)">
      <p style="margin:0 0 20px;font-size:1rem;color:var(--text-main,#111)">${message}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button id="${id}-non" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border,#ddd);background:transparent;cursor:pointer">${labelNon}</button>
        <button id="${id}-oui" style="padding:8px 16px;border-radius:8px;border:none;background:var(--accent,#2563eb);color:#fff;cursor:pointer;font-weight:600">${labelOui}</button>
      </div></div>`;
    document.body.appendChild(el);
    const close = () => document.body.removeChild(el);
    document.getElementById(id + '-non').onclick = close;
    document.getElementById(id + '-oui').onclick = () => { close(); onConfirm(); };
    el.onclick = e => { if (e.target === el) close(); };
  },

  modalConfirmDanger({ titre, message, motConfirm, onConfirm }) {
    const id = 'modal-danger-' + Date.now();
    const html = `<div id="${id}" style="position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center">
      <div style="background:var(--bg-card);border:1px solid #ef4444;border-radius:12px;padding:28px;width:420px;max-width:95vw">
        <div style="font-weight:700;font-size:16px;margin-bottom:12px;color:#ef4444">${esc(titre)}</div>
        <p style="font-size:14px;color:var(--text-secondary);margin-bottom:16px">${message}</p>
        <p style="font-size:13px;margin-bottom:8px">Tapez <strong>${esc(motConfirm)}</strong> pour confirmer :</p>
        <input id="${id}-inp" type="text" placeholder="${esc(motConfirm)}" style="width:100%;padding:8px 10px;background:var(--bg-input,var(--bg));border:1px solid #ef4444;border-radius:6px;color:var(--text);font-size:14px" />
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
          <button onclick="document.getElementById('${id}').remove()" style="padding:8px 16px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--text);cursor:pointer">Annuler</button>
          <button id="${id}-ok" style="padding:8px 16px;background:#ef4444;border:none;border-radius:6px;color:#fff;font-weight:600;cursor:pointer">Supprimer dÃ©finitivement</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById(id);
    modal.querySelector(`#${id}-ok`).addEventListener('click', () => {
      if (modal.querySelector(`#${id}-inp`).value.trim() === motConfirm) {
        modal.remove();
        onConfirm();
      } else {
        App.toast('Tapez exactement : ' + motConfirm, 'error');
      }
    });
    modal.querySelector(`#${id}-inp`).focus();
  },

  // â”€â”€ Notification toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Helpers HTML â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    if (!dateStr) return 'â€”';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  },

  statut(s) {
    const map = {
      'En cours':   'badge-blue',
      'En attente': 'badge-orange',
      'TerminÃ©':    'badge-green',
      'AnnulÃ©':     'badge-red',
      'Brouillon':  'badge-gray',
      'EnvoyÃ©':     'badge-blue',
      'AcceptÃ©':    'badge-green',
      'RefusÃ©':     'badge-red',
    };
    return `<span class="badge ${map[s] || 'badge-gray'}">${s}</span>`;
  },

  relancerDevis(devisId) {
    const devis = DB.getDevisById ? DB.getDevisById(devisId) : (DB.devis||[]).find(d=>d.id===devisId);
    if (!devis) return;
    const chantier = DB.getChantier(devis.chantierId);
    const client = chantier ? DB.getClient(chantier.clientId) : null;
    const config = DB.getConfig();
    const entreprise = config.nom || 'Notre entreprise';
    const nomClient = client ? (client.nom || client.raisonSociale || '') : '';
    const email = client ? (client.email || '') : '';
    const montant = new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2}).format(parseFloat(devis.totalHT)||0);
    const sujet = encodeURIComponent('Relance devis ' + (devis.numero||'') + ' â€” ' + entreprise);
    const corps = encodeURIComponent(
      'Bonjour ' + nomClient + ',\n\n' +
      'Je me permets de revenir vers vous concernant le devis nÂ°' + (devis.numero||'') +
      ' d\'un montant de ' + montant + ' â‚¬ HT que je vous ai adressÃ©.\n\n' +
      'Avez-vous eu l\'occasion d\'en prendre connaissance ? Je reste disponible pour rÃ©pondre Ã  vos questions.\n\n' +
      'Cordialement,\n' + entreprise + '\n' + (config.tel||'') + '\n' + (config.email||'')
    );
    const mailtoUrl = 'mailto:' + email + '?subject=' + sujet + '&body=' + corps;
    window.open(mailtoUrl, '_blank');
    App.toast('ðŸ“¬ Email de relance prÃªt â€” vÃ©rifiez votre client mail', 'success');
  },
};


// ============================================================
//  PAGES
// ============================================================
const Pages = {

  // â”€â”€ Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  dashboard() {
    const div = document.createElement('div');
    const config = DB.getConfig();
    const aujourd_hui = new Date();
    const jours = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    const mois = ['janvier','fÃ©vrier','mars','avril','mai','juin','juillet','aoÃ»t','septembre','octobre','novembre','dÃ©cembre'];
    const dateStr = jours[aujourd_hui.getDay()] + ' ' + aujourd_hui.getDate() + ' ' + mois[aujourd_hui.getMonth()] + ' ' + aujourd_hui.getFullYear();
    const prenom = (config.nomEntreprise || 'Gabriel').split(' ')[0];

    const devis = DB.devis || [];
    const factures = DB.factures || [];
    const chantiers = DB.chantiers || [];
    const impayes = factures.filter(f => {
      if (f.statut === 'PayÃ©e' || f.statut === 'AnnulÃ©e') return false;
      return f.dateEcheance && new Date(f.dateEcheance) < aujourd_hui;
    });
    const chantiersEnCours = chantiers.filter(c => c.statut === 'En cours');
    const moisCourant = aujourd_hui.getMonth();
    const anneeCourante = aujourd_hui.getFullYear();
    const caMois = factures.filter(f => {
      if (!f.date) return false;
      const d = new Date(f.date);
      return d.getMonth() === moisCourant && d.getFullYear() === anneeCourante;
    }).reduce((s,f) => s + (parseFloat(f.totalHT)||0), 0);
    const fmt = n => new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(n);
    const fmtDate = d => {
      if (!d) return 'â€”';
      try { return new Date(String(d).split('T')[0]).toLocaleDateString('fr-FR'); } catch(e) { return 'â€”'; }
    };
    const devisBrouillons = devis.filter(d => (d.statut || 'Brouillon') === 'Brouillon');
    const montantBrouillons = devisBrouillons.reduce((s,d) => s + (parseFloat(d.totalHT) || 0), 0);
    const derniereFacture = [...factures]
      .filter(f => f.date)
      .sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    const prochainRdv = [...chantiers]
      .filter(c => c.dateDebut && new Date(c.dateDebut) >= new Date(aujourd_hui.toDateString()))
      .sort((a,b) => new Date(a.dateDebut) - new Date(b.dateDebut))[0];
    const chantiersRecents = [...chantiersEnCours]
      .sort((a,b) => new Date(b.updatedAt || b.dateDebut || b.date || 0) - new Date(a.updatedAt || a.dateDebut || a.date || 0))
      .slice(0, 3);
    const montantDevisChantier = chantierId => devis
      .filter(d => String(d.chantierId || '') === String(chantierId || ''))
      .reduce((s,d) => s + (parseFloat(d.totalHT) || 0), 0);

    div.innerHTML = '';

    // â”€â”€ CSS DASHBOARD â”€â”€
    if (!document.getElementById('style-dashboard-v2')) {
      const s = document.createElement('style');
      s.id = 'style-dashboard-v2';
      s.textContent = `
        .db-header { margin-bottom: 24px; }
        .db-greeting { font-size: 22px; font-weight: 800; letter-spacing: -.02em; margin-bottom: 2px; }
        .db-date { font-size: 13px; color: var(--text-tertiary); }
        .db-widgets { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 24px; }
        @media(max-width:700px){ .db-widgets { grid-template-columns: 1fr; } }
        .db-widget { background: var(--bg-secondary); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 18px; }
        .db-widget-label { font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .07em; color: var(--text-tertiary); margin-bottom: 8px; }
        .db-widget-val { font-size: 28px; font-weight: 900; letter-spacing: -.03em; margin-bottom: 4px; }
        .db-widget-desc { font-size: 12px; color: var(--text-tertiary); }
        .db-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .08em; color: var(--text-tertiary); margin-bottom: 12px;
          padding-bottom: 6px; border-bottom: 1px solid var(--border); }
        .db-chantiers { display: flex; flex-direction: column; gap: 8px; }
        .db-chantier-item { background: var(--bg-secondary); border: 1px solid var(--border);
          border-radius: var(--radius-md); padding: 12px 16px; display: flex;
          align-items: center; justify-content: space-between; cursor: pointer;
          transition: border-color .15s; font-size: 13px; }
        .db-save-indicator { font-size: 11px; color: #10b981; text-align: right;
          margin-bottom: 8px; }
        .db-info-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px; }
        @media(max-width:900px){ .db-info-grid { grid-template-columns:1fr; } }
      `;
      document.head.appendChild(s);
    }

    // â”€â”€ RENDER â”€â”€
    div.innerHTML = `
      <div class="db-save-indicator">ðŸ’¾ Sauvegarde automatique â€” ${aujourd_hui.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})}</div>

      <div class="db-header">
        <div class="db-greeting">Bonjour ${prenom} ðŸ‘‹</div>
        <div class="db-date">${dateStr}</div>
      </div>
      <div id="meteo-dashboard-slot"></div>

      <!-- WIDGETS KPI -->
      <div class="db-section-title">Vue d'ensemble</div>
      <div class="db-widgets">
        <div class="db-widget"
          style="${impayes.length > 0 ? 'border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.04)' : ''}">
          <div class="db-widget-label">ðŸ’¸ ImpayÃ©s</div>
          <div class="db-widget-val" style="color:${impayes.length > 0 ? '#ef4444' : '#10b981'}">
            ${impayes.length > 0 ? impayes.length + ' fact.' : 'âœ… OK'}
          </div>
          <div class="db-widget-desc">${impayes.length > 0 ? fmt(impayes.reduce((s,f)=>s+(parseFloat(f.totalTTC)||0),0)) + ' â‚¬ TTC en attente' : 'Aucune facture en retard'}</div>
        </div>
        <div class="db-widget">
          <div class="db-widget-label">ðŸ“ˆ CA ce mois</div>
          <div class="db-widget-val" style="color:var(--accent)">${fmt(caMois)} â‚¬</div>
          <div class="db-widget-desc">FacturÃ© en ${mois[moisCourant]} ${anneeCourante}</div>
        </div>
        <div class="db-widget">
          <div class="db-widget-label">ðŸ— Chantiers actifs</div>
          <div class="db-widget-val">${chantiersEnCours.length}</div>
          <div class="db-widget-desc">En cours Â· ${chantiers.length} au total</div>
        </div>
      </div>

      <div class="db-section-title">Informations utiles</div>
      <div class="db-info-grid">
        <div class="db-widget">
          <div class="db-widget-label">ðŸ“„ Devis en attente</div>
          <div class="db-widget-val">${devisBrouillons.length}</div>
          <div class="db-widget-desc">${fmt(montantBrouillons)} â‚¬ HT en brouillon</div>
        </div>
        <div class="db-widget">
          <div class="db-widget-label">ðŸ§¾ DerniÃ¨re facture</div>
          <div class="db-widget-val">${derniereFacture ? fmt(parseFloat(derniereFacture.totalHT || derniereFacture.totalTTC || 0)) + ' â‚¬' : 'â€”'}</div>
          <div class="db-widget-desc">${derniereFacture ? fmtDate(derniereFacture.date) : 'Aucune facture Ã©mise'}</div>
        </div>
        <div class="db-widget">
          <div class="db-widget-label">ðŸ“… Prochain RDV</div>
          <div class="db-widget-val" style="font-size:20px">${prochainRdv ? fmtDate(prochainRdv.dateDebut) : 'â€”'}</div>
          <div class="db-widget-desc">${prochainRdv ? (prochainRdv.nom || prochainRdv.titre || 'Chantier') : 'Aucun rendez-vous prÃ©vu'}</div>
        </div>
      </div>

      <!-- CHANTIERS EN COURS -->
      ${chantiersRecents.length > 0 ? `
        <div class="db-section-title" style="margin-top:8px">Chantiers en cours</div>
        <div class="db-chantiers">
          ${chantiersRecents.map(c => {
            const cl = DB.getClient(c.clientId);
            const montant = montantDevisChantier(c.id);
            return '<div class="db-chantier-item">' +
              '<div>' +
                '<div style="font-weight:700">' + c.nom + '</div>' +
                '<div style="font-size:11px;color:var(--text-tertiary)">' + (cl?.nom||'â€”') + ' Â· ' + (c.adresse||'â€”') + '</div>' +
              '</div>' +
              '<div style="text-align:right">' +
                '<div style="font-size:11px;color:var(--text-tertiary)">' + (c.statut || 'En cours') + '</div>' +
                '<div style="font-size:13px;font-weight:700;color:var(--text-primary)">' + (montant ? fmt(montant) + ' â‚¬ HT' : 'Aucun devis') + '</div>' +
              '</div>' +
            '</div>';
          }).join('')}
        </div>
      ` : `
        <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;text-align:center;margin-top:8px">
          <div style="font-size:32px;margin-bottom:10px">ðŸ—</div>
          <div style="font-size:14px;font-weight:700;margin-bottom:6px">Aucun chantier en cours</div>
          <div style="font-size:12px;color:var(--text-tertiary)">Aucun chantier actif Ã  afficher.</div>
        </div>
      `}

      <div style="text-align:center;margin-top:24px">
        <button onclick="App.navigate('calcExpressV2')"
          style="padding:12px 32px;border-radius:10px;background:var(--accent,#4f8ef7);color:#fff;border:none;cursor:pointer;font-size:15px;font-weight:600">
          âš¡ Nouveau chiffrage
        </button>
      </div>
    `;

    setTimeout(() => {
      const slot = document.getElementById('meteo-dashboard-slot');
      if (!slot || typeof Meteo === 'undefined') return;
      if (Meteo._data) {
        slot.innerHTML = '';
        slot.appendChild(Meteo.renderCard());
      } else {
        Meteo.refresh();
      }
    }, 0);

    return div;
  },

  // â”€â”€ Clients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
              <th>ID</th><th>SociÃ©tÃ©</th><th>Ville</th><th>TÃ©lÃ©phone</th><th>Email</th><th>Chantiers</th><th></th>
            </tr></thead>
            <tbody>
              ${clients.length ? clients.map(c => {
                const nbCh = DB.getChantiersByClient(c.id).length;
                return `<tr onclick="Pages.modalEditClient(${c.id})">
                  <td class="font-mono text-xs text-tertiary">${String(c.id).padStart(3,'0')}</td>
                  <td>
                    <strong>${c.nom}</strong>
                    <span class="badge ${c.type === 'particulier' ? 'badge-orange' : 'badge-blue'}" style="margin-left:6px;font-size:10px">
                      ${c.type === 'particulier' ? 'ðŸ  Particulier' : 'ðŸ¢ Pro'}
                    </span>
                  </td>
                  <td>${c.cp ? c.cp + ' ' : ''}${c.ville || 'â€”'}</td>
                  <td>${c.telephone || 'â€”'}</td>
                  <td class="text-secondary">${c.email || 'â€”'}</td>
                  <td><span class="badge ${nbCh > 0 ? 'badge-blue' : 'badge-gray'}">${nbCh}</span></td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();App.navigate('chantiers', {clientId: ${c.id}})">Chantiers â†’</button>
                  </td>
                </tr>`;
              }).join('') : `<tr><td colspan="7">
                <div class="empty-state">
                  <div class="empty-state-icon">ðŸ‘¤</div>
                  <div class="empty-state-title">Aucun client</div>
                  <div class="empty-state-text">Commencez par crÃ©er votre premier client</div>
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

  // â”€â”€ Chantiers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          <button class="nav-tab">TerminÃ©s (${chantiers.filter(c=>c.statut==='TerminÃ©').length})</button>
        </div>
        <button class="btn btn-primary" onclick="Pages.modalNouveauChantier()">+ Nouveau chantier</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Chantier</th><th>Client</th><th>DÃ©but</th><th>Fin prÃ©vue</th><th>Statut</th><th>Total</th><th></th>
            </tr></thead>
            <tbody>
              ${chantiers.length ? chantiers.map(c => {
                const client = DB.getClient(c.clientId);
                const devisCh = DB.getDevisByChantier(c.id);
                const totalTTC = devisCh.reduce((s, d) => s + (d.totalTTC || 0), 0);
                return `<tr onclick="Pages.modalEditChantier(${c.id})">
                  <td><strong>${c.nom}</strong><br><span class="text-xs text-secondary">${c.adresse || ''}</span></td>
                  <td>${client?.nom || 'â€”'}</td>
                  <td>${App.formatDate(c.dateDebut)}</td>
                  <td>${App.formatDate(c.dateFin)}</td>
                  <td>${App.statut(c.statut)}</td>
                  <td><strong>${totalTTC > 0 ? Calculs.fmt(totalTTC) : 'â€”'}</strong></td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();App.navigate('metrages', {chantierId: ${c.id}})">MÃ©trÃ©s</button>
                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();App.navigate('devis', {chantierId: ${c.id}})">Devis</button>
                  </td>
                </tr>`;
              }).join('') : `<tr><td colspan="7">
                <div class="empty-state">
                  <div class="empty-state-icon">ðŸ—</div>
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

  // â”€â”€ MÃ©trÃ©s â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  metrages(params = {}) {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="flex justify-between items-center mb-16">
        <div id="metrage-chantier-select">
          <select class="form-control" id="sel-chantier-metrage" style="width:280px" onchange="Pages.chargerMetrages(this.value)">
            <option value="">â€” SÃ©lectionner un chantier â€”</option>
            ${DB.chantiers.map(c => `<option value="${c.id}" ${params.chantierId == c.id ? 'selected' : ''}>${c.id} â€” ${c.nom}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary" onclick="Pages.modalNouveauMetrage()">+ Nouveau mÃ©trÃ©</button>
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
      { icon:'ðŸ§±', label:'Cloisons',    page:'cloisons'    },
      { icon:'âš¡', label:'Ã‰lectricitÃ©', page:'electricite' },
      { icon:'ðŸ”§', label:'Plomberie',   page:'plomberie'   },
      { icon:'ðŸŽ¨', label:'Peinture',    page:'peinture'    },
    ];
    const packsExt = [
      { icon:'ðŸ§±', label:'MaÃ§onnerie',  page:'maconnerie'  },
      { icon:'ðŸŒ¿', label:'Paysagisme',  page:'paysagisme'  },
      { icon:'ðŸ—', label:'Terrassement',page:'maconnerie'  },
    ];
    const packs = isExt ? packsExt : packsInt;
    const quickAccess = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;
                  padding:12px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);
                  border:1px solid var(--border)">
        <span style="font-size:12px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap">
          AccÃ¨s rapide packs :
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
        <div class="empty-state-icon">ðŸ“</div>
        <div class="empty-state-title">Aucun mÃ©trÃ© pour ce chantier</div>
        <button class="btn btn-primary" onclick="Pages.modalNouveauMetrage(${chantierId})">+ Saisir un mÃ©trÃ©</button>
      </div></div>`;
      return;
    }

    let totalMurs = 0, totalPlaf = 0;

    list.innerHTML += `<div class="card">
      <div class="card-header">
        <span class="card-title">PiÃ¨ces saisies (${metrages.length})</span>
        <button class="btn btn-primary btn-sm" onclick="Pages.modalNouveauMetrage(${chantierId})">+ Ajouter</button>
      </div>
      <div class="table-wrap">
        <table>
          ${isExt ? `
          <thead><tr><th>DÃ©signation</th><th>Dimensions</th><th>Surface</th><th>LinÃ©aire</th><th></th></tr></thead>
          <tbody>
            ${metrages.map(m => {
              const surf = m.surfaceExt || (m.longueur * m.largeur) || 0;
              const lin  = m.lineaire || 0;
              totalMurs += surf;
              return '<tr>' +
                '<td><strong>' + m.piece + '</strong></td>' +
                '<td class="font-mono">' + (m.longueur > 0 ? m.longueur + ' Ã— ' + m.largeur + (m.hauteur > 1 ? ' Ã— ' + m.hauteur : '') + ' m' : 'â€”') + '</td>' +
                '<td>' + (surf > 0 ? Calculs.fmtN(surf, 1) + ' mÂ²' : 'â€”') + '</td>' +
                '<td>' + (lin > 0 ? Calculs.fmtN(lin, 1) + ' ml' : 'â€”') + '</td>' +
                '<td><button class="btn btn-danger btn-sm" onclick="Pages.supprimerMetrage(' + m.id + ', ' + chantierId + ')">âœ•</button></td>' +
                '</tr>';
            }).join('')}
          </tbody>
          <tfoot>
            <tr style="background:var(--bg-tertiary)">
              <td colspan="2"><strong>TOTAUX</strong></td>
              <td><strong>${Calculs.fmtN(totalMurs, 1)} mÂ²</strong></td>
              <td></td><td></td>
            </tr>
          </tfoot>
          ` : `
          <thead><tr><th>PiÃ¨ce</th><th>L Ã— l Ã— H</th><th>PÃ©rimÃ¨tre</th><th>Surface murs</th><th>Surface plafond</th><th></th></tr></thead>
          <tbody>
            ${metrages.map(m => {
              const c = Calculs.metrage(m.longueur, m.largeur, m.hauteur);
              totalMurs += c.surfMurs;
              totalPlaf += c.surfPlafond;
              return '<tr>' +
                '<td><strong>' + m.piece + '</strong></td>' +
                '<td class="font-mono">' + m.longueur + ' Ã— ' + m.largeur + ' Ã— ' + m.hauteur + ' m</td>' +
                '<td>' + Calculs.fmtN(c.perimetre, 1) + ' m</td>' +
                '<td>' + Calculs.fmtN(c.surfMurs, 1) + ' mÂ²</td>' +
                '<td>' + Calculs.fmtN(c.surfPlafond, 1) + ' mÂ²</td>' +
                '<td><button class="btn btn-danger btn-sm" onclick="Pages.supprimerMetrage(' + m.id + ', ' + chantierId + ')">âœ•</button></td>' +
                '</tr>';
            }).join('')}
          </tbody>
          <tfoot>
            <tr style="background:var(--bg-tertiary)">
              <td colspan="3"><strong>TOTAUX</strong></td>
              <td><strong>${Calculs.fmtN(totalMurs, 1)} mÂ²</strong></td>
              <td><strong>${Calculs.fmtN(totalPlaf, 1)} mÂ²</strong></td>
              <td></td>
            </tr>
          </tfoot>
          `}
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
            <span class="card-title">âš¡ Estimation automatique des besoins</span>
            <button class="btn btn-primary btn-sm" onclick="Pages.genererDevisDepuisMetrages(${chantierId})">ðŸ“„ GÃ©nÃ©rer le devis</button>
          </div>
          <div class="card-body">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Cloisons (mat.)</div>
                <div class="stat-value" style="font-size:18px">${Calculs.fmt(besoins.cloison.coutMat)}</div>
                <div class="stat-sub">${Calculs.fmtN(besoins.cloison.plaques)} plaques Â· ${Calculs.fmtN(besoins.cloison.rails,1)} ml rails</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Joints (mat.)</div>
                <div class="stat-value" style="font-size:18px">${Calculs.fmt(besoins.joints.coutMat)}</div>
                <div class="stat-sub">${Calculs.fmtN(besoins.joints.bandes,1)} ml bandes Â· ${Calculs.fmtN(besoins.joints.enduit,1)} kg enduit</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Peinture (mat.)</div>
                <div class="stat-value" style="font-size:18px">${Calculs.fmt(besoins.peinture.coutMat)}</div>
                <div class="stat-sub">${Calculs.fmtN(besoins.peinture.litres,1)} L Â· ${Calculs.fmtN(besoins.peinture.heures,1)} h MO</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Main d'Å“uvre</div>
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
    App.modalConfirmDanger({
      titre: 'Supprimer ce mÃ©trÃ© ?',
      message: 'Ce mÃ©trÃ© sera supprimÃ© dÃ©finitivement.',
      motConfirm: 'SUPPRIMER',
      onConfirm: () => {
        DB.deleteMetrage(id);
        Pages.chargerMetrages(chantierId);
        App.toast('MÃ©trÃ© supprimÃ©');
      }
    });
  },

  genererDevisDepuisMetrages(chantierId) {
    App.navigate('devis', { chantierId, generer: true });
  },

  // â”€â”€ Devis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  devis(params = {}) {
    const div = document.createElement('div');

    // SÃ©lection chantier
    const chantierId = params.chantierId;
    let devisData = null;

    div.innerHTML = `
      <div class="flex justify-between items-center mb-16">
        <select class="form-control" id="sel-chantier-devis" style="width:280px" onchange="Pages.chargerDevisChantier(this.value)">
          <option value="">â€” SÃ©lectionner un chantier â€”</option>
          ${DB.chantiers.map(c => `<option value="${c.id}" ${chantierId == c.id ? 'selected' : ''}>${c.id} â€” ${c.nom}</option>`).join('')}
        </select>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" id="btn-generer-devis" onclick="Pages.genererDevis()" style="display:none">âš¡ GÃ©nÃ©rer depuis mÃ©trÃ©s</button>
          <button class="btn btn-primary" id="btn-save-devis" onclick="Pages.sauvegarderDevis()" style="display:none">ðŸ’¾ Enregistrer</button>
          <span class="no-print" style="font-size:11px;color:var(--text-secondary);margin-right:4px" title="Firefox : Impression â†’ Plus de paramÃ¨tres â†’ En-tÃªtes et pieds de page â†’ Vide">â„¹ï¸</span>
          <button class="btn btn-secondary" id="btn-print-devis" onclick="Pages.imprimerDevis()" style="display:none">ðŸ–¨ AperÃ§u / Imprimer</button>
          <button class="btn btn-secondary" id="btn-excel-devis" onclick="Pages.exporterDevisExcel()" style="display:none">ðŸ“Š Excel</button>
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
          montantTVA: d.montantTVA || (d.totalHT ? d.totalHT * (d.tva || 0) : 0),
          tva:        d.tva        || 0,
        },
      };
      Pages.afficherDevis(Pages._devisEnCours, chantier, client);
    }
  },

  genererDevis(chantierId) {
    const id = parseInt(chantierId || document.getElementById('sel-chantier-devis')?.value);
    if (!id) { App.toast('SÃ©lectionnez un chantier', 'error'); return; }

    const chantier = DB.getChantier(id);
    const client   = chantier ? DB.getClient(chantier.clientId) : null;
    const profil   = DB.getProfil();
    const typeCli  = client?.type || 'pro';
    const marges   = typeCli === 'particulier'
      ? { materiaux: profil.margeMatParticulier, mo: profil.margeMO, tva: profil.tvaParticulier / 100 }
      : { materiaux: profil.margeMatPro,         mo: profil.margeMO, tva: profil.tvaPro / 100 };
    const resultat = Calculs.calculerDevis(id, marges);

    if (!resultat) {
      document.getElementById('devis-content').innerHTML = `<div class="card"><div class="empty-state">
        <div class="empty-state-icon">ðŸ“</div>
        <div class="empty-state-title">Aucun mÃ©trÃ© saisi pour ce chantier</div>
        <button class="btn btn-primary" onclick="App.navigate('metrages', {chantierId: ${id}})">Saisir les mÃ©trÃ©s</button>
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
              ${chantier ? chantier.nom : 'â€”'} Â· ${client ? client.nom : 'â€”'} Â· ${App.formatDate(devis.date)}
            </div>
          </div>
          <div class="no-print" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <select class="form-control" style="width:140px" onchange="Pages.mettreAJourStatutDevis(this.value)">
              ${['Brouillon','EnvoyÃ©','AcceptÃ©','RefusÃ©'].map(s => `<option ${devis.statut === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
            ${App.statut(devis.statut)}
            ${devis.id && devis.statut === 'AcceptÃ©'
              ? `<button class="btn btn-primary btn-sm" onclick="Pages.convertirEnFacture(${devis.id})">ðŸ§¾ Convertir en facture</button>`
              : ''}
            ${devis.id ? `<button class="btn btn-secondary btn-sm" onclick="DocPrint.apercu('devis',${devis.id})">ðŸ–¨ AperÃ§u impression</button>` : ''}
            ${devis.id ? `<button class="btn btn-primary btn-sm" onclick="EmailDevis.envoyerDevis(${devis.id})">ðŸ“§ Envoyer au client</button>` : ''}
            ${devis.id && typeof Signature !== 'undefined' && !Signature.estSigne(devis.id) ? `<button class="btn btn-secondary btn-sm" onclick="Signature.demanderSignature(${devis.id})">âœï¸ Signature</button>` : ''}
            ${devis.id && typeof Signature !== 'undefined' && Signature.estSigne(devis.id) ? Signature.badgeHtml(devis.id) + `<button class="btn btn-secondary btn-sm" onclick="Signature.voirSignature(${devis.id})">ðŸ–¼ Voir</button>` : ''}
          </div>
        </div>
        <div class="card-body">
          <!-- En-tÃªte entreprise / client -->
          <div class="form-row mb-16">
            <div>
              <div class="text-xs text-tertiary mb-4">ENTREPRISE</div>
              <strong>${config.nomEntreprise}</strong><br>
              <span class="text-secondary text-sm">${config.adresse}</span><br>
              <span class="text-secondary text-sm">${config.telephone} Â· ${config.email}</span>
            </div>
            <div>
              <div class="text-xs text-tertiary mb-4">CLIENT</div>
              <strong>${client?.nom || 'â€”'}</strong><br>
              <span class="text-secondary text-sm">${client?.adresse || ''} ${client?.cp || ''} ${client?.ville || ''}</span>
            </div>
          </div>

          <!-- Lignes du devis -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <thead>
              <tr style="background:var(--bg-tertiary)">
                <th style="padding:10px 14px;text-align:left;font-size:12px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.05em">Poste</th>
                <th style="padding:10px 14px;text-align:right;font-size:12px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.05em">Total HT</th>
              </tr>
            </thead>
            <tbody>
              ${lignes.map((l, i) => `
              <tr style="border-bottom:0.5px solid var(--border)">
                <td style="padding:12px 14px;font-weight:500">${l.poste}</td>
                <td style="padding:12px 14px;text-align:right;font-family:var(--font-mono);font-weight:600;color:var(--accent)">${Calculs.fmt(l.totalClient)}</td>
              </tr>`).join('')}
            </tbody>
          </table>

          <!-- Totaux -->
          <div style="max-width:400px;margin-left:auto">
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border)">
              <span class="text-secondary">${totaux.tva === 0 ? 'Total' : 'Total HT'}</span>
              <span class="font-mono">${Calculs.fmt(totaux.totalHT)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border)">
              <select onchange="Pages._changerTVADevis(this.value)" style="background:transparent;border:none;color:var(--text-secondary);font-size:13px;cursor:pointer" title="Changer le taux TVA">
                <option value="0.20" ${(totaux.tva||0.1)==0.20?'selected':''}>TVA 20%</option>
                <option value="0.10" ${(totaux.tva||0.1)==0.10?'selected':''}>TVA 10%</option>
                <option value="0.055" ${totaux.tva==0.055?'selected':''}>TVA 5,5%</option>
                <option value="0" ${totaux.tva===0?'selected':''}>TVA 0% â€” Auto-liquidÃ©e</option>
              </select>
              ${totaux.tva === 0 ? '' : `<span class="font-mono">${Calculs.fmt(totaux.montantTVA)}</span>`}
            </div>
            <div class="total-row mt-8">
              <span class="total-label">${totaux.tva === 0 ? 'NET Ã€ PAYER' : 'TOTAL TTC'}</span>
              <span class="total-value">${Calculs.fmt(totaux.totalTTC)}</span>
            </div>
          </div>

          <!-- Note de bas -->
          <div class="mt-16" style="padding:12px;background:var(--bg-tertiary);border-radius:var(--radius-md);font-size:12px;color:var(--text-tertiary)">
            Devis valable 30 jours Â· Prix HT Â·
            ${(totaux.tva === 0 || totaux.tva === '0') ?
              'TVA 0% â€” Auto-liquidation TVA art. 283-2 du CGI' :
              'TVA ' + Math.round((totaux.tva || 0) * 100) + '%'
            } Â· SIRET ${config.siret}
          </div>

          <!-- Ligne libre avec IA -->
          <div class="mt-16 no-print" style="padding:14px 16px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:var(--radius-md)">
            <div style="font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">
              + Ajouter une ligne personnalisÃ©e
            </div>
            <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">
              <div style="flex:1;min-width:200px">
                <div style="display:flex;gap:6px;align-items:center">
                  <input class="form-control" id="ligne-libre-desig" placeholder="DÃ©signation du posteâ€¦"
                    style="flex:1;font-size:13px">
                  ${!!localStorage.getItem('plaqpro_groq_key') ? `
                  <button class="btn btn-secondary btn-sm" onclick="Pages._ameliorerLigneIA()" title="AmÃ©liorer avec l'IA" style="white-space:nowrap">âœ¨ IA</button>
                  ` : ''}
                </div>
                <div id="ligne-libre-ia-result" style="display:none;margin-top:5px"></div>
              </div>
              <div style="width:100px">
                <input type="number" class="form-control" id="ligne-libre-prix" placeholder="Prix HT â‚¬"
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
            <thead><tr><th>NÂ°</th><th>Date</th><th>Total HT</th><th>Total TTC</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              ${DB.getDevisByChantier(parseInt(document.getElementById('sel-chantier-devis')?.value || 0)).map(d =>
                `<tr>
                  <td class="font-mono">${d.numero}</td>
                  <td>${App.formatDate(d.date)}</td>
                  <td>${Calculs.fmt(d.totalHT)}</td>
                  <td><strong>${Calculs.fmt(d.totalTTC)}</strong></td>
                  <td>${App.statut(d.statut)}</td>
                  <td>
                    ${d.statut === 'AcceptÃ©' ? `<button class="btn btn-primary btn-sm" onclick="Pages.convertirEnFacture(${d.id})">ðŸ§¾ â†’ Facture</button>` + ((DB.factures||[]).find(f=>f.devisId===d.id) ? ' <span style="color:#10b981;font-size:11px">âœ… FacturÃ©e</span>' : '') : ''}
                    <button class="btn btn-secondary btn-sm" onclick="DocPrint.apercu('devis',${d.id})">ðŸ–¨</button>
                    <button class="btn btn-secondary btn-sm" onclick="EmailDevis.envoyerDevis(${d.id})">ðŸ“§</button>
                    ${d.statut === 'EnvoyÃ©' ? `<button onclick="App.relancerDevis(${d.id})" class="btn btn-sm" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;font-size:11px;padding:4px 10px;border-radius:6px">ðŸ“¬ Relancer</button>` : ''}
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
    const tvaManuelle = Pages._devisEnCours?.totaux?.tva;
    const tva = tvaManuelle !== undefined ? tvaManuelle : r.TVA_TRAVAUX;
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
    // Auto-conversion devis â†’ facture dÃ¨s acceptation
    if (statut === 'AcceptÃ©' && Pages._devisEnCours) {
      const devisId = Pages._devisEnCours.id;
      if (devisId) {
        const existing = (DB.factures || []).find(f => f.devisId === devisId);
        if (!existing) {
          setTimeout(() => {
            App.modalForm({
              titre: 'âœ… Devis acceptÃ© !',
              champs: [],
              onConfirm: function() { Pages.convertirEnFacture(devisId); }
            });
          }, 300);
        }
      }
    }
  },

  async _ameliorerLigneIA() {
    const input = document.getElementById('ligne-libre-desig');
    if (!input || !input.value.trim()) return;
    const btn = document.querySelector('[onclick="Pages._ameliorerLigneIA()"]');
    if (btn) { btn.textContent = 'âŒ›'; btn.disabled = true; }
    const original = input.value;
    const _gcApp = groqConfig();
    if (!_gcApp) { if (btn) { btn.textContent = 'âœ¨ IA'; btn.disabled = false; } return; }
    try {
      const r = await fetch(_gcApp.url, {
        method: 'POST',
        headers: _gcApp.headers,
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: `Tu es expert en bÃ¢timent. Transforme cette dÃ©signation en texte professionnel pour un devis de plaquiste : '${original}'\nRÃ©ponds avec UNIQUEMENT la dÃ©signation professionnelle corrigÃ©e, max 1 ligne.` }],
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
            <span style="padding:2px 8px;border-radius:10px;background:rgba(45,212,160,0.15);color:#2DD4A0;border:1px solid rgba(45,212,160,0.3)">âœ¨ AmÃ©liorÃ© par IA</span>
            <button onclick="document.getElementById('ligne-libre-desig').value='${original.replace(/'/g, "&#39;")}';document.getElementById('ligne-libre-ia-result').style.display='none'"
              style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);font-size:11px;text-decoration:underline">Garder l'original</button>
          </div>`;
        }
      }
    } catch(e) {}
    if (btn) { btn.textContent = 'âœ¨ IA'; btn.disabled = false; }
  },

  _ajouterLigneLibre() {
    const desig = document.getElementById('ligne-libre-desig')?.value.trim();
    const prix  = parseFloat(document.getElementById('ligne-libre-prix')?.value) || 0;
    if (!desig) { App.toast('Saisissez une dÃ©signation', 'error'); return; }
    if (!Pages._devisEnCours) return;
    Pages._devisEnCours.lignes.push({ poste: desig, baseHT: prix, marge: 0, totalClient: prix });
    const totalHT = Pages._devisEnCours.lignes.reduce((s, l) => s + (l.totalClient || 0), 0);
    const tvaDevis = Pages._devisEnCours.totaux?.tva;
    const tva = tvaDevis !== undefined ? tvaDevis : (Pages._devisEnCours.autoLiquidee ? 0 : 0.1);
    Pages._devisEnCours.totaux = { ...Pages._devisEnCours.totaux, totalHT, montantTVA: totalHT * tva, totalTTC: totalHT * (1 + tva) };
    const ch = DB.getChantier(Pages._devisEnCours.chantierId);
    const cl = ch ? DB.getClient(ch.clientId) : null;
    Pages.afficherDevis(Pages._devisEnCours, ch, cl);
    App.toast('Ligne ajoutÃ©e au devis');
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
    App.toast('Devis ' + saved.numero + ' enregistrÃ© !');
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

  // â”€â”€ Catalogue paysagisme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  cataloguePaysagisme() {
    const el = document.createElement('div'); el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = '<div class="page-header"><h1 class="page-title">ðŸŒ¿ Catalogue prix paysagisme</h1></div><div id="catalogue-pays-container" class="mt-16"></div>';
    setTimeout(() => {
      const container = document.getElementById('catalogue-pays-container');
      if (typeof CataloguePaysagisme !== 'undefined') CataloguePaysagisme.getHTML('catalogue-pays-container');
      else if (container) container.innerHTML = '<p class="text-secondary">Module en cours de chargementâ€¦</p>';
    }, 0);
    return el;
  },

  // â”€â”€ Checklist paysagisme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  checklistPaysagisme() {
    const el = document.createElement('div'); el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = '<div class="page-header"><h1 class="page-title">âœ… Checklists chantier</h1></div><div id="checklist-container" class="mt-16"></div>';
    setTimeout(() => {
      const container = document.getElementById('checklist-container');
      if (typeof ChecklistPaysagisme !== 'undefined') ChecklistPaysagisme.getHTML('checklist-container', 'complete');
      else if (container) container.innerHTML = '<p class="text-secondary">Module en cours de chargementâ€¦</p>';
    }, 0);
    return el;
  },

  // â”€â”€ Ã‰quipe paysagisme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  equipePaysagisme() {
    const el = document.createElement('div'); el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = '<div class="page-header"><h1 class="page-title">ðŸ‘· Mon Ã©quipe</h1></div><div id="equipe-container" class="mt-16"></div>';
    setTimeout(() => {
      const container = document.getElementById('equipe-container');
      if (typeof EquipePaysagisme !== 'undefined') EquipePaysagisme.getHTML('equipe-container');
      else if (container) container.innerHTML = '<p class="text-secondary">Module en cours de chargementâ€¦</p>';
    }, 0);
    return el;
  },

  // â”€â”€ Parc matÃ©riel paysagisme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  materielPaysagisme() {
    const el = document.createElement('div'); el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = '<div class="page-header"><h1 class="page-title">ðŸšœ Parc matÃ©riel</h1></div><div id="materiel-container" class="mt-16"></div>';
    setTimeout(() => {
      const container = document.getElementById('materiel-container');
      if (typeof MaterielPaysagisme !== 'undefined') MaterielPaysagisme.getHTML('materiel-container');
      else if (container) container.innerHTML = '<p class="text-secondary">Module en cours de chargementâ€¦</p>';
    }, 0);
    return el;
  },

  // â”€â”€ Calcul Express V2 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  calcExpressV2() {
    const el = document.createElement('div');
    el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">âš¡ Nouveau chiffrage</h1>
      </div>
      <div id="calc-express-v2-container" class="mt-16"></div>`;
    setTimeout(() => {
      if (typeof BddV2 !== 'undefined') BddV2.charger();
      if (typeof CalcExpressV2 !== 'undefined') CalcExpressV2.init('calc-express-v2-container');
    }, 0);
    return el;
  },

  // â”€â”€ MÃ©trages paysagisme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  metragePaysagisme() {
    const el = document.createElement('div'); el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = '<div class="page-header"><h1 class="page-title">ðŸ“ MÃ©trages avancÃ©s</h1></div>' +
      '<div id="metrage-container" class="mt-16"></div>';
    setTimeout(() => {
      if (typeof MetragePaysagisme !== 'undefined') MetragePaysagisme.getHTML('metrage-container');
      else { const c = document.getElementById('metrage-container'); if (c) c.innerHTML = '<p class="text-secondary">Module en cours de chargementâ€¦</p>'; }
    }, 0);
    return el;
  },

  // â”€â”€ Import CSV / Willemse â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  importCsvPaysagisme() {
    const el = document.createElement('div'); el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = '<div class="page-header"><h1 class="page-title">ðŸ“¥ Import CSV / Willemse</h1></div><div id="import-csv-container" class="mt-16"></div>';
    setTimeout(() => {
      const container = document.getElementById('import-csv-container');
      if (typeof TemplateCsvPaysagisme !== 'undefined') TemplateCsvPaysagisme.getHTML('import-csv-container');
      else if (container) container.innerHTML = '<p class="text-secondary">Module en cours de chargementâ€¦</p>';
    }, 0);
    return el;
  },

  // â”€â”€ Rapports paysagisme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  rapportsPaysagisme() {
    const el = document.createElement('div'); el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = '<div class="page-header"><h1 class="page-title">ðŸ“Š Rapports & marges</h1></div><div id="rapports-pays-container" class="mt-16"></div>';
    setTimeout(() => {
      const container = document.getElementById('rapports-pays-container');
      if (typeof RapportPaysagisme !== 'undefined') RapportPaysagisme.getHTML('rapports-pays-container');
      else if (container) container.innerHTML = '<p class="text-secondary">Module en cours de chargementâ€¦</p>';
    }, 0);
    return el;
  },

  // â”€â”€ Chantiers paysagisme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  chantiersPaysagisme() {
    const el = document.createElement('div'); el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = '<div class="page-header"><h1 class="page-title">ðŸŒ¿ Chantiers extÃ©rieurs</h1></div><div id="chantiers-pays-container" class="mt-16"></div>';
    setTimeout(() => {
      const container = document.getElementById('chantiers-pays-container');
      if (typeof ChantierPaysagisme !== 'undefined') ChantierPaysagisme.getHTML('chantiers-pays-container');
      else if (container) container.innerHTML = '<p class="text-secondary">Module en cours de chargementâ€¦</p>';
    }, 0);
    return el;
  },

  // â”€â”€ Paysagisme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  paysagisme() {
    const el = document.createElement('div'); el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = '<div class="page-header"><h1 class="page-title">ðŸŒ¿ Paysagisme</h1></div><div id="paysagisme-devis-container" class="mt-16"></div>';
    setTimeout(() => {
      const container = document.getElementById('paysagisme-devis-container');
      if (typeof DevisPaysagisme !== 'undefined') DevisPaysagisme.getHTML('paysagisme-devis-container');
      else if (container) container.innerHTML = '<p class="text-secondary">Module en cours de chargementâ€¦</p>';
    }, 0);
    // margeGlobale appliquÃ©e via DevisPaysagisme.setMarge() si disponible
    return el;
  },

  // â”€â”€ Diagnostic chantier â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  diagnostic() {
    const el = document.createElement('div'); el.className = 'page-content paysagisme-page';
    el.style.cssText = 'overflow:visible;min-width:0;width:100%;box-sizing:border-box;';
    el.innerHTML = '<div class="page-header"><h1 class="page-title">ðŸ“‹ Diagnostic chantier</h1></div><div id="diagnostic-container" class="mt-16"></div>';
    setTimeout(() => {
      const container = document.getElementById('diagnostic-container');
      if (typeof DiagnosticChantier !== 'undefined') DiagnosticChantier.getHTML('diagnostic-container');
      else if (container) container.innerHTML = '<p class="text-secondary">Module en cours de chargementâ€¦</p>';
    }, 0);
    return el;
  },

  // â”€â”€ Base tarifaire â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            <thead><tr><th>RÃ©f.</th><th>CatÃ©gorie</th><th>DÃ©signation</th><th>UnitÃ©</th><th>Prix HT</th><th>Rendement</th><th></th></tr></thead>
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
        <td class="text-secondary">${p.rendement || 'â€”'}</td>
        <td><button class="btn btn-danger btn-sm" onclick="event.stopPropagation();Pages.supprimerProduit(${p.id})">âœ•</button></td>
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
    App.modalConfirm({ message: 'DÃ©sactiver ce produit ?', onConfirm: () => {
      DB.updateProduit(id, { actif: false });
      App.navigate('produits');
      App.toast('Produit dÃ©sactivÃ©');
    }});
  },

  // â”€â”€ Widget Marge brute mensuelle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          <div style="font-size:14px;font-weight:800;color:var(--text-primary)">ðŸ“Š DÃ©penses du mois â€” ${moisLabel}</div>
          <button class="btn btn-ghost btn-sm" onclick="AnalysePhoto.showModalFournisseur()" style="font-size:12px">ðŸ§¾ Scanner une facture</button>
        </div>

        <!-- 3 KPI -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;flex:1;width:100%;margin-bottom:14px">
          <div style="text-align:center;padding:12px;background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.15);border-radius:10px">
            <div style="font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px">Total facturÃ© HT</div>
            <div style="font-size:18px;font-weight:900;color:#4F8EF7;font-family:var(--font-mono)">${fmt(totalFac)}</div>
            <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">${factures.length} facture${factures.length!==1?'s':''}</div>
          </div>
          <div style="text-align:center;padding:12px;background:rgba(247,91,91,0.08);border:1px solid rgba(247,91,91,0.15);border-radius:10px">
            <div style="font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px">Total achats HT</div>
            <div style="font-size:18px;font-weight:900;color:#F75B5B;font-family:var(--font-mono)">${fmt(totalDep)}</div>
            <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">${depenses.length} dÃ©pense${depenses.length!==1?'s':''}</div>
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
            <span>FacturÃ©</span>
          </div>
          <div style="height:8px;background:rgba(247,91,91,0.2);border-radius:4px;overflow:hidden;position:relative">
            <div style="position:absolute;inset:0;width:${Math.min(100, totalFac > 0 ? Math.round(totalDep/totalFac*100) : 0)}%;background:#F75B5B;border-radius:4px"></div>
            <div style="position:absolute;right:0;top:0;bottom:0;width:${Math.min(100, margePct)}%;background:${margeCol};border-radius:4px"></div>
          </div>
          ${totalFac === 0 && totalDep === 0 ? '<div style="text-align:center;font-size:12px;color:var(--text-tertiary);margin-top:8px">Scannez vos factures fournisseurs avec le bouton ðŸ§¾ ci-dessus</div>' : ''}
        </div>
      </div>`;
  },

  // â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  config() {
    const config = DB.getConfig();
    setTimeout(() => Pages._renderPrixMarche(), 50);
    const groqKey = localStorage.getItem('plaqpro_groq_key') || '';
    const profil = DB.getProfil ? DB.getProfil() : {};
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="card" style="max-width:860px;margin-bottom:16px">
        <div class="card-header"><span class="card-title">ðŸ¢ Profil entreprise â€” Positionnement marchÃ©</span></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <div>
              <label class="form-label">RÃ©partition clientÃ¨le</label>
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
                <option value="placo" ${profil.typeInterv==='placo'?'selected':''}>PlÃ¢trerie / Peinture</option>
                <option value="renov" ${profil.typeInterv==='renov'?'selected':''}>RÃ©novation complÃ¨te</option>
                <option value="neuf"  ${profil.typeInterv==='neuf'?'selected':''}>Construction neuve</option>
              </select>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:20px">
            <div>
              <label class="form-label">Taux MO Pro (â‚¬/h)</label>
              <input type="number" id="cfg-taux-pro" class="form-control" value="${profil.tauxHorairePro ?? 42}" min="20" max="120" step="0.5">
            </div>
            <div>
              <label class="form-label">Taux MO Particulier (â‚¬/h)</label>
              <input type="number" id="cfg-taux-part" class="form-control" value="${profil.tauxHoraireParticulier ?? 38}" min="20" max="120" step="0.5">
            </div>
            <div>
              <label class="form-label">Marge matÃ©riaux Pro (%)</label>
              <input type="number" id="cfg-marge-mat-pro" class="form-control" value="${profil.margeMatPro ?? 22}" min="0" max="100">
            </div>
            <div>
              <label class="form-label">Marge matÃ©riaux Particulier (%)</label>
              <input type="number" id="cfg-marge-mat-part" class="form-control" value="${profil.margeMatParticulier ?? 32}" min="0" max="100">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px">
            <div>
              <label class="form-label">TVA chantiers Pro (%)</label>
              <select id="cfg-tva-pro" class="form-control">
                <option value="20" ${(profil.tvaPro??20)==20?'selected':''}>20% (neuf / pro)</option>
                <option value="10" ${profil.tvaPro==10?'selected':''}>10% (rÃ©novation)</option>
                <option value="5.5" ${profil.tvaPro==5.5?'selected':''}>5,5% (amÃ©lioration Ã©nergÃ©tique)</option>
                <option value="0" ${profil.tvaPro==0?'selected':''}>0% (auto-liquidÃ©e â€” marchÃ© public ST)</option>
              </select>
            </div>
            <div>
              <label class="form-label">TVA chantiers Particuliers (%)</label>
              <select id="cfg-tva-part" class="form-control">
                <option value="10" ${(profil.tvaParticulier??10)==10?'selected':''}>10% (rÃ©novation)</option>
                <option value="20" ${profil.tvaParticulier==20?'selected':''}>20% (neuf)</option>
                <option value="5.5" ${profil.tvaParticulier==5.5?'selected':''}>5,5% (amÃ©lioration Ã©nergÃ©tique)</option>
                <option value="0" ${profil.tvaParticulier==0?'selected':''}>0% (auto-liquidÃ©e)</option>
              </select>
            </div>
            <div>
              <label class="form-label">Marge MO (%)</label>
              <input type="number" id="cfg-marge-mo" class="form-control" value="${profil.margeMO ?? 20}" min="0" max="100">
            </div>
          </div>

          <div style="margin-top:16px;text-align:right">
            <button class="btn btn-primary" onclick="Pages.sauvegarderProfil()">ðŸ’¾ Enregistrer le profil</button>
          </div>
        </div>
      </div>
      <div class="card" style="max-width:600px">
        <div class="card-header"><span class="card-title">âš™ï¸ ParamÃ¨tres entreprise</span></div>
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
              <label class="form-label">TÃ©lÃ©phone</label>
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
              <label class="form-label">PrÃ©fixe devis</label>
              <input class="form-control" id="cfg-prefix" value="${config.prefixeDevis || 'DEV-'}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">ðŸŒ¤ Ville (mÃ©tÃ©o)</label>
            <input class="form-control" id="cfg-ville" value="${config.ville || 'Lyon'}" placeholder="Lyon, Paris, Marseilleâ€¦"
              style="max-width:220px">
          </div>
          <button class="btn btn-primary" onclick="Pages.sauvegarderConfig()">Enregistrer</button>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px">
        <div class="card-header"><span class="card-title">ðŸ–¼ Logo entreprise</span></div>
        <div class="card-body">
          <div style="margin-bottom:10px;font-size:12px;color:var(--text-tertiary)">
            Format PNG/SVG transparent recommandÃ© Â· <strong>200 Ã— 80 px recommandÃ©</strong>
          </div>
          <div id="logo-preview" style="margin-bottom:14px;padding:14px 20px;background:var(--bg-tertiary);
               border-radius:var(--radius-md);text-align:center;min-height:88px;
               display:flex;align-items:center;justify-content:center;border:1px dashed var(--border)">
            ${localStorage.getItem('plaqpro_logo_entreprise')
              ? `<img src="${localStorage.getItem('plaqpro_logo_entreprise')}"
                      style="max-width:200px;max-height:80px;object-fit:contain" alt="Logo">`
              : `<span class="text-secondary text-sm">Aucun logo Â· utilisera assets/logo_plaqpro.png par dÃ©faut</span>`}
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <label class="btn btn-secondary" style="cursor:pointer;margin:0">
              ðŸ“ Choisir un logo
              <input type="file" accept="image/*" style="display:none" onchange="Pages.previewLogo(this)">
            </label>
            ${localStorage.getItem('plaqpro_logo_entreprise')
              ? `<button class="btn btn-danger" onclick="Pages.supprimerLogo()">ðŸ—‘ Supprimer</button>` : ''}
          </div>
          <div style="margin-top:8px;font-size:11px;color:var(--text-tertiary)">
            StockÃ© localement dans votre navigateur Â· utilisÃ© dans les aperÃ§us d'impression
          </div>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px">
        <div class="card-header"><span class="card-title">ðŸ§¾ En-tÃªte &amp; Pied de page</span></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Forme juridique</label>
              <input class="form-control" id="cfg-forme" value="${config.formeJuridique || ''}" placeholder="SARL, EI, SASâ€¦">
            </div>
            <div class="form-group">
              <label class="form-label">NÂ° RCS</label>
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
            <input class="form-control" id="cfg-banque" value="${config.banque || ''}" placeholder="CrÃ©dit Agricole, BNPâ€¦">
          </div>
          <div class="form-group">
            <label class="form-label">Conditions de paiement</label>
            <textarea class="form-control" id="cfg-conditions" rows="2">${config.conditionsPaiement || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Mentions lÃ©gales</label>
            <textarea class="form-control" id="cfg-mentions" rows="2">${config.mentionsLegales || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Texte pied de page â€” Devis</label>
            <textarea class="form-control" id="cfg-pied-devis" rows="2">${config.piedPageDevis || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Texte pied de page â€” Facture</label>
            <textarea class="form-control" id="cfg-pied-facture" rows="2">${config.piedPageFacture || ''}</textarea>
          </div>
          <button class="btn btn-primary" onclick="Pages.sauvegarderConfig()">Enregistrer</button>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px">
        <div class="card-header">
          <span class="card-title">ðŸ“§ Email â€” Configuration EmailJS</span>
          <a href="https://www.emailjs.com" target="_blank" rel="noopener"
             style="font-size:11px;color:var(--accent);text-decoration:none">
            CrÃ©er un compte gratuit â†’
          </a>
        </div>
        <div class="card-body">
          <div style="padding:10px 14px;background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.2);
               border-radius:var(--radius-md);font-size:12px;color:var(--text-secondary);margin-bottom:16px">
            EmailJS permet d'envoyer des emails directement depuis le navigateur, sans serveur.<br>
            CrÃ©ez un compte sur emailjs.com â†’ ajoutez un <strong>Email Service</strong> (Gmail, Outlookâ€¦)
            â†’ crÃ©ez un <strong>Email Template</strong> avec les variables :
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
            <button class="btn btn-primary" onclick="EmailDevis.sauvegarderConfig()">ðŸ’¾ Enregistrer</button>
            <button class="btn btn-secondary" onclick="EmailDevis.tester()">ðŸ“§ Tester l'envoi</button>
          </div>
        </div>
      </div>

      <div class="card mt-16" style="max-width:900px">
        <div class="card-header">
          <span class="card-title">ðŸ’° Base prix de marchÃ© AATB</span>
          <span style="font-size:11px;color:var(--text-tertiary)">UtilisÃ©e automatiquement dans le module DPGF / AO</span>
        </div>
        <div class="card-body">
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
            Ces prix de rÃ©fÃ©rence sont appliquÃ©s automatiquement lors de l'analyse d'un DPGF.
            Modifiez-les selon vos conditions nÃ©gociÃ©es avec vos fournisseurs.
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:13px" id="prix-marche-table">
              <thead>
                <tr id="prix-marche-header" style="background:var(--bg-tertiary)">
                  <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-tertiary)">Poste type</th>
                  <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);width:110px">PU Vente (â‚¬)</th>
                  <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);width:110px">PU Sous-trait. (â‚¬)</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-tertiary)">LibellÃ© rÃ©fÃ©rence</th>
                  <th style="padding:10px 12px;width:60px"></th>
                </tr>
              </thead>
              <tbody id="prix-marche-tbody"></tbody>
            </table>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
            <button class="btn btn-primary" onclick="Pages.sauvegarderPrixMarche()">ðŸ’¾ Enregistrer les prix</button>
            <button class="btn btn-secondary" onclick="Pages.reinitPrixMarche()">ðŸ”„ RÃ©initialiser par dÃ©faut</button>
          </div>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px">
        <div class="card-header">
          <span class="card-title">ðŸ“Š Export comptable</span>
          <span style="font-size:11px;color:var(--text-tertiary)">Sage Â· EBP Â· Cegid Â· CSV</span>
        </div>
        <div class="card-body">
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
            Exportez vos factures au format comptable standard (CSV Journal) compatible avec Sage, EBP, Cegid et la plupart des logiciels de comptabilitÃ©.
          </div>

          <!-- SÃ©lecteur pÃ©riode -->
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px">
            <div class="form-group" style="margin:0;flex:1;min-width:140px">
              <label class="form-label">PÃ©riode</label>
              <select class="form-control" id="export-compta-periode">
                <option value="mois">Mois en cours</option>
                <option value="mois_prec">Mois prÃ©cÃ©dent</option>
                <option value="trim">Trimestre en cours</option>
                <option value="trim_prec">Trimestre prÃ©cÃ©dent</option>
                <option value="annee" selected>AnnÃ©e en cours</option>
                <option value="annee_prec">AnnÃ©e prÃ©cÃ©dente</option>
                <option value="tout">Tout</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;flex:1;min-width:140px">
              <label class="form-label">Format logiciel</label>
              <select class="form-control" id="export-compta-format">
                <option value="sage">Sage</option>
                <option value="ebp">EBP</option>
                <option value="cegid">Cegid</option>
                <option value="generic" selected>GÃ©nÃ©rique CSV</option>
              </select>
            </div>
          </div>

          <!-- Comptes comptables -->
          <div style="background:var(--bg-tertiary);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:16px;font-size:12px">
            <div style="font-weight:700;color:var(--text-primary);margin-bottom:8px">Comptes comptables utilisÃ©s</div>
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
                <span style="color:var(--text-secondary)">TVA collectÃ©e</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="font-mono" style="font-size:11px;color:var(--accent)">512xxx</span>
                <span style="color:var(--text-secondary)">Banque (rÃ¨glements)</span>
              </div>
            </div>
          </div>

          <div id="export-compta-preview" style="display:none;margin-bottom:14px;max-height:180px;overflow:auto;background:var(--bg-tertiary);border-radius:var(--radius-md);padding:10px;font-size:11px;font-family:var(--font-mono);color:var(--text-secondary);line-height:1.6;white-space:pre"></div>

          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-secondary" onclick="Pages._previewExportComptable()">ðŸ‘ AperÃ§u</button>
            <button class="btn btn-primary"   onclick="Pages.exporterComptable()">ðŸ“Š Exporter pour mon comptable</button>
          </div>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px;border-color:rgba(247,91,91,0.25)">
        <div class="card-header" style="border-bottom-color:rgba(247,91,91,0.2)">
          <span class="card-title" style="color:#F75B5B">âš  Zone de test</span>
        </div>
        <div class="card-body">
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
            Supprime tous les clients, chantiers, devis, factures et mÃ©trÃ©s.<br>
            <strong>La configuration entreprise et la base tarifaire sont conservÃ©es.</strong>
          </p>
          <button class="btn btn-danger" onclick="Pages.reinitialiserDonnees()">
            ðŸ—‘ RÃ©initialiser toutes les donnÃ©es
          </button>
        </div>
      </div>

      <div class="card mt-16" style="max-width:600px">
        <div class="card-header"><span class="card-title">âœ¨ Produits ajoutÃ©s via IA</span></div>
        <div class="card-body">
          ${typeof ProduitsWeb !== 'undefined' ? ProduitsWeb.renderHistorique() : '<p style="color:var(--text-tertiary);font-size:13px;margin:0">Module non chargÃ©.</p>'}
        </div>
      </div>

      ${Session.estAdmin() ? `
      <div class="card mt-16" style="max-width:600px">
        <div class="card-header">
          <span class="card-title">ðŸ¤– FonctionnalitÃ©s IA avancÃ©es</span>
          <span style="font-size:11px;color:var(--text-tertiary)">Admin uniquement</span>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">ClÃ© API
              <span style="font-size:11px;color:var(--text-tertiary);font-weight:400;margin-left:6px">
                (stockÃ©e localement sur cet appareil)
              </span>
            </label>
            <div style="display:flex;gap:8px">
              <input class="form-control" id="cfg-groq-key" type="password"
                value="${groqKey}" placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                style="font-family:var(--font-mono);font-size:13px;flex:1">
              <button class="btn btn-secondary" onclick="Pages.toggleGroqKeyVisibility()" title="Afficher/masquer">ðŸ‘</button>
            </div>
            <div style="margin-top:6px;font-size:11px;color:var(--text-tertiary)">
              ðŸ”’ StockÃ©e sur votre appareil uniquement â€” <a href="https://console.groq.com/keys" target="_blank" style="color:var(--accent)">Obtenir une clÃ© gratuite â†’</a>
            </div>
          </div>
          <div id="groq-test-result" style="display:none;margin-bottom:12px;padding:10px 14px;border-radius:var(--radius-md);font-size:13px"></div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary" onclick="Pages.sauvegarderGroqKey()">ðŸ’¾ Enregistrer</button>
            <button class="btn btn-secondary" onclick="Pages.testerGroq()">âš¡ Tester</button>
            ${groqKey ? `<button class="btn btn-danger" onclick="Pages.supprimerGroqKey()">Supprimer</button>` : ''}
          </div>
        </div>
      </div>` : ''}

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid var(--border);max-width:860px">
  <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-tertiary);margin-bottom:16px">âš–ï¸ Mentions lÃ©gales & CGV</div>
  <div style="background:var(--bg-primary);border:0.5px solid var(--border);border-radius:12px;padding:16px;font-size:12px;color:var(--text-secondary);line-height:1.8">
    <div style="font-weight:700;color:var(--text);margin-bottom:8px">PlaqPro+ â€” Logiciel de gestion pour artisans BTP</div>
    <div>Ã‰diteur : Gabriel Khamassi â€” Saint-Priest (69) â€” France</div>
    <div>Copyright Â© 2026 Gabriel Khamassi â€” Tous droits rÃ©servÃ©s</div>
    <div style="margin-top:10px;padding-top:10px;border-top:0.5px solid var(--border);font-weight:600;color:var(--text)">Conditions GÃ©nÃ©rales d'Utilisation</div>
    <div style="margin-top:6px">PlaqPro+ est un <strong>outil d'aide Ã  la dÃ©cision</strong>. Les calculs, suggestions, alertes DTU et analyses IA sont fournis Ã  titre indicatif et ne constituent en aucun cas un avis technique, juridique ou rÃ©glementaire certifiÃ©.</div>
    <div style="margin-top:6px">L'utilisateur reste seul responsable des dÃ©cisions prises sur la base des informations fournies par l'application. Gabriel Khamassi ne saurait Ãªtre tenu responsable des prÃ©judices directs ou indirects rÃ©sultant de l'utilisation de PlaqPro+.</div>
    <div style="margin-top:6px">Les donnÃ©es saisies dans PlaqPro+ sont stockÃ©es localement sur l'appareil de l'utilisateur. Aucune donnÃ©e n'est transmise Ã  des tiers sans consentement explicite.</div>
    <div style="margin-top:10px;padding-top:10px;border-top:0.5px solid var(--border);font-size:11px;color:var(--text-tertiary)">
      DÃ©pÃ´t APP en cours â€” Marque PlaqPro+ INPI en cours â€” Version 2.0 â€” Mai 2026
    </div>
  </div>
</div>
    `;
    return div;
  },

  // â”€â”€ Export Comptable â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // En-tÃªte selon format
    const isSage  = format === 'sage';
    const isEBP   = format === 'ebp';
    const isCegid = format === 'cegid';

    if (isSage) {
      rows.push(['JournalCode','JournalLib','EcritureNum','EcritureDate','CompteNum','CompteLib','CompteAuxNum','CompteAuxLib','PieceRef','PieceDate','EcritureLib','Debit','Credit','EcritureLet','DateLet','ValidDate','Montantdevise','Idevise'].join(';'));
    } else if (isEBP) {
      rows.push(['Type','Date','PiÃ¨ce','Compte','LibellÃ©','DÃ©bit','CrÃ©dit','Lettrage'].join(';'));
    } else if (isCegid) {
      rows.push(['Journal','Date','RÃ©fÃ©rence','Compte','LibellÃ©','Sens','Montant','Devise'].join(';'));
    } else {
      rows.push(['Date','NÂ° piÃ¨ce','LibellÃ©','Compte','IntitulÃ© compte','DÃ©bit','CrÃ©dit','Lettrage'].join(';'));
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
      const tvaAmt    = parseFloat(f.montantTVA || totalHT * (f.tva || 0));
      const totalTTC  = parseFloat(f.totalTTC  || totalHT + tvaAmt);
      const tvaRate   = Math.round((f.tva || 0) * 100);
      const numEcr    = String(ecritureNum++).padStart(6, '0');
      const clientCode = '411' + String(f.id || ecritureNum).padStart(3, '0');
      const tvaCode   = tvaRate <= 10 ? '445712' : '445711';
      const libelle   = esc((f.numero || 'FAC') + ' - ' + clientNom);

      if (isSage) {
        rows.push(['VT','Ventes','VT' + numEcr, fmtDate(f.date), clientCode, esc(clientNom), '', '', esc(f.numero||''), fmtDate(f.date), libelle, '', fmtAmt(totalTTC), '', '', '', '', ''].join(';'));
        rows.push(['VT','Ventes','VT' + numEcr, fmtDate(f.date), '706000', 'Prestations services', '', '', esc(f.numero||''), fmtDate(f.date), libelle, fmtAmt(totalHT), '', '', '', '', '', ''].join(';'));
        rows.push(['VT','Ventes','VT' + numEcr, fmtDate(f.date), tvaCode, 'TVA collectÃ©e ' + tvaRate + '%', '', '', esc(f.numero||''), fmtDate(f.date), libelle, fmtAmt(tvaAmt), '', '', '', '', '', ''].join(';'));
        if (f.statut === 'PayÃ©e' && f.datePaiement) {
          const numEcrR = String(ecritureNum++).padStart(6, '0');
          rows.push(['BQ','Banque','BQ' + numEcrR, fmtDate(f.datePaiement), '512000', 'Banque', '', '', esc(f.numero||''), fmtDate(f.datePaiement), esc('RÃ¨glement ' + f.numero), fmtAmt(totalTTC), '', '', '', '', '', ''].join(';'));
          rows.push(['BQ','Banque','BQ' + numEcrR, fmtDate(f.datePaiement), clientCode, esc(clientNom), '', '', esc(f.numero||''), fmtDate(f.datePaiement), esc('RÃ¨glement ' + f.numero), '', fmtAmt(totalTTC), '', '', '', '', ''].join(';'));
        }
      } else if (isEBP) {
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), clientCode, libelle, '', fmtAmt(totalTTC), ''].join(';'));
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), '706000', libelle, fmtAmt(totalHT), '', ''].join(';'));
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), tvaCode,  libelle, fmtAmt(tvaAmt), '', ''].join(';'));
        if (f.statut === 'PayÃ©e' && f.datePaiement) {
          rows.push(['BQ', fmtDate(f.datePaiement), esc(f.numero||''), '512000', esc('RÃ¨glement ' + f.numero), fmtAmt(totalTTC), '', ''].join(';'));
          rows.push(['BQ', fmtDate(f.datePaiement), esc(f.numero||''), clientCode, esc('RÃ¨glement ' + f.numero), '', fmtAmt(totalTTC), ''].join(';'));
        }
      } else if (isCegid) {
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), clientCode, libelle, 'C', fmtAmt(totalTTC), 'EUR'].join(';'));
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), '706000',   libelle, 'D', fmtAmt(totalHT), 'EUR'].join(';'));
        rows.push(['VT', fmtDate(f.date), esc(f.numero||''), tvaCode,    libelle, 'D', fmtAmt(tvaAmt), 'EUR'].join(';'));
      } else {
        rows.push([fmtDate(f.date), esc(f.numero||''), libelle, clientCode, esc('Clients'), '', fmtAmt(totalTTC), esc(f.numero||'')].join(';'));
        rows.push([fmtDate(f.date), esc(f.numero||''), libelle, '706000', esc('Prestations services'), fmtAmt(totalHT), '', esc(f.numero||'')].join(';'));
        rows.push([fmtDate(f.date), esc(f.numero||''), libelle, tvaCode, esc('TVA collectÃ©e ' + tvaRate + '%'), fmtAmt(tvaAmt), '', esc(f.numero||'')].join(';'));
        if (f.statut === 'PayÃ©e' && f.datePaiement) {
          rows.push([fmtDate(f.datePaiement), esc(f.numero||''), esc('RÃ¨glement ' + f.numero), '512000', esc('Banque'), fmtAmt(totalTTC), '', esc(f.numero||'')].join(';'));
          rows.push([fmtDate(f.datePaiement), esc(f.numero||''), esc('RÃ¨glement ' + f.numero), clientCode, esc('Clients'), '', fmtAmt(totalTTC), esc(f.numero||'')].join(';'));
        }
      }
    });

    // â”€â”€ DÃ©penses fournisseurs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const depenses = (() => { try { return JSON.parse(localStorage.getItem('plaqpro_depenses') || '[]'); } catch { return []; } })()
      .filter(d => { const dt = new Date(d.date || ''); return dt >= start && dt <= end; });

    depenses.forEach(d => {
      const numEcr   = String(ecritureNum++).padStart(6, '0');
      const fourCode = '401' + String(d.id || ecritureNum).toString().slice(-3).padStart(3, '0');
      const achatCode= d.montantHT < 500 ? '606000' : '605000'; // fournitures / matiÃ¨res
      const libelle  = esc((d.numero || 'DEP') + ' - ' + (d.fournisseur || 'Fournisseur'));
      const htAmt    = parseFloat(d.montantHT  || 0);
      const tvaAmt   = parseFloat(d.montantTVA || htAmt * ((d.tauxTVA || 20) / 100));
      const ttcAmt   = parseFloat(d.montantTTC || htAmt + tvaAmt);
      const tvaCode  = (d.tauxTVA || 20) <= 10 ? '445662' : '445661'; // TVA dÃ©ductible

      if (isSage) {
        rows.push(['AC','Achats','AC' + numEcr, fmtDate(d.date), fourCode, esc(d.fournisseur||''), '', '', esc(d.numero||''), fmtDate(d.date), libelle, fmtAmt(ttcAmt), '', '', '', '', '', ''].join(';'));
        rows.push(['AC','Achats','AC' + numEcr, fmtDate(d.date), achatCode, 'Achats matÃ©riaux', '', '', esc(d.numero||''), fmtDate(d.date), libelle, '', fmtAmt(htAmt), '', '', '', '', ''].join(';'));
        rows.push(['AC','Achats','AC' + numEcr, fmtDate(d.date), tvaCode,  'TVA dÃ©ductible', '', '', esc(d.numero||''), fmtDate(d.date), libelle, '', fmtAmt(tvaAmt), '', '', '', '', ''].join(';'));
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
        rows.push([fmtDate(d.date), esc(d.numero||''), libelle, achatCode, esc('Achats matÃ©riaux'), '', fmtAmt(htAmt), esc(d.numero||'')].join(';'));
        rows.push([fmtDate(d.date), esc(d.numero||''), libelle, tvaCode,   esc('TVA dÃ©ductible'), '', fmtAmt(tvaAmt), esc(d.numero||'')].join(';'));
      }
    });

    return { csv: rows.join('\n'), count: factures.length + depenses.length };
  },

  _previewExportComptable() {
    const format = document.getElementById('export-compta-format')?.value || 'generic';
    const { csv, count } = this._genererCSVComptable(format);
    const zone = document.getElementById('export-compta-preview');
    if (!zone) return;
    if (count === 0) { App.toast('Aucune facture pour cette pÃ©riode', 'error'); return; }
    const lines = csv.split('\n').slice(0, 12);
    zone.style.display = '';
    zone.textContent   = lines.join('\n') + (csv.split('\n').length > 12 ? '\nâ€¦' : '');
    App.toast(count + ' facture' + (count > 1 ? 's' : '') + ' trouvÃ©e' + (count > 1 ? 's' : ''), 'success');
  },

  exporterComptable() {
    const format = document.getElementById('export-compta-format')?.value || 'generic';
    const periode= document.getElementById('export-compta-periode')?.value || 'annee';
    const { csv, count } = this._genererCSVComptable(format);
    if (count === 0) { App.toast('Aucune facture pour cette pÃ©riode', 'error'); return; }
    const config  = DB.getConfig ? DB.getConfig() : {};
    const nom     = (config.nomEntreprise || 'plaqpro').replace(/\s+/g, '_');
    const suffix  = { sage: 'sage', ebp: 'ebp', cegid: 'cegid', generic: 'comptable' }[format] || 'export';
    const fname   = nom + '_' + suffix + '_' + periode + '_' + new Date().toISOString().slice(0, 10) + '.csv';
    const bom     = 'ï»¿'; // BOM UTF-8 pour Excel
    const blob    = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
    const a       = document.createElement('a');
    a.href        = URL.createObjectURL(blob);
    a.download    = fname;
    a.click();
    URL.revokeObjectURL(a.href);
    App.toast(count + ' facture' + (count > 1 ? 's' : '') + ' exportÃ©e' + (count > 1 ? 's' : '') + ' â†’ ' + fname, 'success');
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
      App.toast('Logo enregistrÃ© !');
      setTimeout(() => App.navigate('config'), 400);
    };
    reader.readAsDataURL(file);
  },

  supprimerLogo() {
    App.modalConfirm({ message: 'Supprimer le logo ?', onConfirm: () => {
      localStorage.removeItem('plaqpro_logo_entreprise');
      App.navigate('config');
      App.toast('Logo supprimÃ©');
    }});
  },

  _renderPrixMarche(corpsFiltre) {
    const tbody  = document.getElementById('prix-marche-tbody');
    const theader = document.getElementById('prix-marche-header');
    if (!tbody) return;

    // Boutons corps de mÃ©tier
    const CORPS = [
      { id: 'placo',  label: 'ðŸ§± Placo/Peinture' },
      { id: 'elec',   label: 'âš¡ Ã‰lectricitÃ©' },
      { id: 'plomb',  label: 'ðŸš¿ Plomberie' },
      { id: 'menu',   label: 'ðŸªŸ Menuiserie' },
      { id: 'carre',  label: 'ðŸ  Carrelage/Sol' },
      { id: 'divers', label: 'ðŸ”§ Divers' },
    ];

    // Injecter boutons si pas encore prÃ©sents
    let btnsZone = document.getElementById('prix-marche-btns');
    if (!btnsZone) {
      btnsZone = document.createElement('div');
      btnsZone.id = 'prix-marche-btns';
      btnsZone.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px';
      tbody.closest('table').parentElement.insertBefore(btnsZone, tbody.closest('table'));
    }
    const actif = corpsFiltre || 'placo';
    btnsZone.innerHTML = CORPS.map(c => {
      const base = DPGF.getPrixMarche();
      const n = Object.values(base).filter(v => v.corps === c.id).length;
      return `<button class="dpgf-lot-btn${actif === c.id ? ' active' : ''}"
        onclick="Pages._renderPrixMarche('${c.id}')"
        style="font-size:12px;padding:5px 12px">${c.label} <span style="opacity:.7">(${n})</span></button>`;
    }).join('');

    // Mettre Ã  jour header colonnes
    if (theader) {
      theader.innerHTML = `
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-tertiary)">Poste type</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);width:110px">PU Vente (â‚¬)</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);width:110px">PU Sous-trait. (â‚¬)</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-tertiary)">LibellÃ© rÃ©fÃ©rence</th>
        <th style="padding:10px 12px;width:60px"></th>
      `;
    }

    // Filtrer et afficher
    const base = DPGF.getPrixMarche();
    const filtre = Object.entries(base).filter(([, v]) => v.corps === actif);
    tbody.innerHTML = filtre.map(([key, val], i) => `
      <tr style="border-bottom:1px solid var(--border);background:${i%2===0?'var(--bg-secondary)':'transparent'}">
        <td style="padding:8px 12px;color:var(--text-secondary);font-size:12px">${val.libelle || key}</td>
        <td style="padding:8px 12px;text-align:right">
          <input type="number" class="form-control" style="width:85px;text-align:right;padding:4px 6px;font-size:13px"
            data-key="${key}" value="${val.pu}" min="0" max="99999" step="0.5" title="Prix de vente client">
        </td>
        <td style="padding:8px 12px;text-align:right">
          <input type="number" class="form-control" style="width:85px;text-align:right;padding:4px 6px;font-size:13px;background:rgba(247,166,79,0.08)"
            data-key-st="${key}" value="${val.puST || ''}" min="0" max="99999" step="0.5" title="Prix sous-traitant">
        </td>
        <td style="padding:8px 12px">
          <input type="text" class="form-control" style="font-size:12px;padding:4px 6px"
            data-key-lib="${key}" value="${val.libelle || key}" placeholder="LibellÃ©">
        </td>
        <td style="padding:8px 12px;text-align:center">
          <button class="btn btn-secondary" style="font-size:11px;padding:3px 6px"
            onclick="Pages._resetLignePrix('${key}')">â†º</button>
        </td>
      </tr>
    `).join('');
  },

  _resetLignePrix(key) {
    const defaut = DPGF.PRIX_MARCHE_DEFAUT[key];
    if (!defaut) return;
    const inp    = document.querySelector('[data-key="' + key + '"]');
    const inpLib = document.querySelector('[data-key-lib="' + key + '"]');
    if (inp)    inp.value    = defaut.pu;
    if (inpLib) inpLib.value = defaut.libelle || key;
    App.toast('Prix rÃ©initialisÃ© : ' + key, 'info');
  },

  sauvegarderPrixMarche() {
    // Charger la base complÃ¨te existante
    const base = DPGF.getPrixMarche();
    const saved = { ...base };
    // Mettre Ã  jour les postes visibles (corps actif)
    document.querySelectorAll('#prix-marche-tbody [data-key]').forEach(inp => {
      const key   = inp.dataset.key;
      const pu    = parseFloat(inp.value) || 0;
      const stEl  = document.querySelector('[data-key-st="' + key + '"]');
      const libEl = document.querySelector('[data-key-lib="' + key + '"]');
      const puST  = stEl ? parseFloat(stEl.value) || 0 : (saved[key]?.puST || 0);
      const libelle = libEl ? libEl.value : (saved[key]?.libelle || key);
      saved[key] = { ...saved[key], pu, puST, libelle };
    });
    localStorage.setItem('plaqpro_prix_marche', JSON.stringify(saved));
    App.toast('âœ… Prix sauvegardÃ©s', 'success');
  },

  reinitPrixMarche() {
    localStorage.removeItem('plaqpro_prix_marche');
    this._renderPrixMarche();
    App.toast('ðŸ”„ Prix rÃ©initialisÃ©s aux valeurs par dÃ©faut', 'info');
  },

  _changerTVADevis(val) {
    const tva = parseFloat(val);
    if (!Pages._devisEnCours) return;
    const totalHT = Pages._devisEnCours.totaux?.totalHT || 0;
    Pages._devisEnCours.totaux = {
      ...Pages._devisEnCours.totaux,
      tva,
      montantTVA: totalHT * tva,
      totalTTC:   totalHT * (1 + tva),
    };
    Pages._devisEnCours.autoLiquidee = (tva === 0);
    Pages.afficherDevis(Pages._devisEnCours, true);
    App.toast(tva === 0 ? 'âœ… TVA auto-liquidÃ©e activÃ©e' : 'TVA ' + Math.round(tva*100) + '% appliquÃ©e', 'success');
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
    App.toast('Configuration enregistrÃ©e !');
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
    App.toast('âœ… Profil enregistrÃ©', 'success');
  },

  sauvegarderGroqKey() {
    const key = document.getElementById('cfg-groq-key')?.value.trim();
    if (!key) { App.toast('ClÃ© vide', 'error'); return; }
    localStorage.setItem('plaqpro_groq_key', key);
    if (typeof AssistantIA !== 'undefined') AssistantIA._checkGroq();
    App.toast('ParamÃ¨tres IA enregistrÃ©s !');
  },

  supprimerGroqKey() {
    App.modalConfirm({ message: 'Supprimer la clÃ© API Groq ?', onConfirm: () => {
      localStorage.removeItem('plaqpro_groq_key');
      if (typeof AssistantIA !== 'undefined') AssistantIA._checkGroq();
      App.navigate('config');
      App.toast('ClÃ© supprimÃ©e');
    }});
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
      res.innerHTML = 'âš  Entrez une clÃ© avant de tester.';
      return;
    }
    res.style.display = 'block';
    res.style.background = 'rgba(255,255,255,0.04)';
    res.style.border = '1px solid var(--border)';
    res.style.color = 'var(--text-secondary)';
    res.innerHTML = 'â³ Test en coursâ€¦';
    try {
      // Test direct avec la clÃ© saisie (utile en local pour valider la clÃ©)
      const testUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const r = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'RÃ©ponds juste "OK"' }],
          max_tokens: 5
        })
      });
      const data = await r.json();
      if (data.choices?.[0]?.message?.content) {
        res.style.background = 'rgba(45,212,160,0.10)';
        res.style.border = '1px solid rgba(45,212,160,0.3)';
        res.style.color = '#2DD4A0';
        res.innerHTML = 'âœ… Connexion rÃ©ussie ! RÃ©ponse : ' + data.choices[0].message.content.trim();
      } else if (data.error) {
        throw new Error(data.error.message);
      }
    } catch (err) {
      res.style.background = 'rgba(247,91,91,0.12)';
      res.style.border = '1px solid rgba(247,91,91,0.3)';
      res.style.color = '#F75B5B';
      res.innerHTML = 'âš  Erreur : ' + err.message;
    }
  },

  // â”€â”€ Modales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  reinitialiserDonnees() {
    App.modalConfirmDanger({
      titre: 'âš ï¸ RÃ©initialisation irrÃ©versible',
      message: 'Tous les clients, chantiers, devis, factures et mÃ©trÃ©s seront supprimÃ©s dÃ©finitivement.<br>La configuration entreprise et les produits seront conservÃ©s.',
      motConfirm: 'SUPPRIMER',
      onConfirm: () => {
        [DB.KEYS.clients, DB.KEYS.chantiers, DB.KEYS.devis,
         DB.KEYS.factures, DB.KEYS.metrages].forEach(key => {
          localStorage.removeItem(key);
        });
        App.toast('Base de donnÃ©es rÃ©initialisÃ©e', 'success');
        setTimeout(() => App.navigate('dashboard'), 400);
      }
    });
  },

  toggleAccordion(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const open = el.style.display !== 'none';
    el.style.display = open ? 'none' : 'block';
    const ico = document.getElementById(id + '-ico');
    if (ico) ico.textContent = open ? 'â–¸' : 'â–¾';
  },

  _initMeteoAccordion() {
    const el = document.getElementById('acc-meteo');
    if (!el || el.style.display === 'none') return;
    const slot = document.getElementById('meteo-accordion-slot');
    if (!slot || slot.dataset.inited) return;
    slot.dataset.inited = '1';
    if (typeof Meteo === 'undefined') {
      slot.innerHTML = '<p style="color:var(--text-tertiary);font-size:13px;margin:8px 0">Module mÃ©tÃ©o non chargÃ©.</p>';
      return;
    }
    if (Meteo._data) {
      slot.appendChild(Meteo.renderCard());
    } else {
      slot.innerHTML = `
        <div style="text-align:center;padding:24px;color:var(--text-tertiary);font-size:13px">
          ðŸŒ¡ï¸ DonnÃ©es mÃ©tÃ©o en cours de chargementâ€¦
          <br>
          <button class="btn btn-secondary" style="margin-top:12px;font-size:12px"
            onclick="const s=document.getElementById('meteo-accordion-slot');if(Meteo._data){s.innerHTML='';s.appendChild(Meteo.renderCard());}else{Meteo.refresh();}">
            â†» RafraÃ®chir
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
      container.innerHTML = '<p style="color:var(--text-tertiary);font-size:13px;margin:0">Module graphiques non chargÃ©.</p>';
      return;
    }
    container.appendChild(Graphiques.renderSection());
    setTimeout(() => Graphiques.initCharts(), 80);
  },

  modalNouveauClient() {
    const body = Pages._formClient();
    App.openModal('Nouveau client', body, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderClient()">CrÃ©er le client</button>
    `);
  },

  modalEditClient(id) {
    const c = DB.getClient(id);
    if (!c) return;
    const body = Pages._formClient(c);
    App.openModal('Modifier â€” ' + c.nom, body, `
      <button class="btn btn-danger" onclick="Pages.supprimerClient(${id})">Supprimer</button>
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderClient(${id})">Enregistrer</button>
    `);
  },

  _bindCodePostalVille(root, cpSelector, villeSelector) {
    const cpInput = root.querySelector(cpSelector);
    const villeInput = root.querySelector(villeSelector);
    if (!cpInput || !villeInput) return;
    const listId = cpInput.id + '-villes';
    let datalist = root.querySelector('#' + listId);
    if (!datalist) {
      datalist = document.createElement('datalist');
      datalist.id = listId;
      root.appendChild(datalist);
      villeInput.setAttribute('list', listId);
    }
    villeInput.addEventListener('input', () => { villeInput.dataset.userEdited = '1'; });
    cpInput.addEventListener('input', () => {
      cpInput.dataset.userEdited = '1';
      const cp = cpInput.value.replace(/\D/g, '').slice(0, 5);
      if (cpInput.value !== cp) cpInput.value = cp;
      if (cp.length !== 5 || typeof fetch === 'undefined') return;
      fetch('https://geo.api.gouv.fr/communes?codePostal=' + cp + '&fields=nom&limit=5')
        .then(r => r.ok ? r.json() : [])
        .then(villes => {
          const noms = (Array.isArray(villes) ? villes : []).map(v => v.nom).filter(Boolean);
          datalist.innerHTML = noms.map(n => '<option value="' + esc(n) + '"></option>').join('');
          if (noms.length === 1 && !villeInput.dataset.userEdited) villeInput.value = noms[0];
        })
        .catch(() => {});
    });
  },

  _formClient(c = {}) {
    const d = document.createElement('div');
    d.innerHTML = `
      <div class="form-group"><label class="form-label">SociÃ©tÃ© *</label>
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
        <div class="form-group"><label class="form-label">TÃ©lÃ©phone</label>
          <input class="form-control" id="f-tel" value="${c.telephone || ''}"></div>
        <div class="form-group"><label class="form-label">Email</label>
          <input class="form-control" id="f-email" value="${c.email || ''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Type de client</label>
          <select class="form-control" id="f-type-client">
            <option value="pro" ${(c.type||'pro')==='pro'?'selected':''}>ðŸ¢ Professionnel</option>
            <option value="particulier" ${c.type==='particulier'?'selected':''}>ðŸ  Particulier</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">SIRET / SIREN</label>
          <input class="form-control" id="f-siret-client" value="${c.siret || ''}" placeholder="000 000 000 00000"></div>
      </div>
      <div class="form-group"><label class="form-label">Notes</label>
        <input class="form-control" id="f-notes-client" value="${c.notes || ''}" placeholder="Informations complÃ©mentairesâ€¦"></div>
    `;
    this._bindCodePostalVille(d, '#f-cp', '#f-ville');
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
      type: document.getElementById('f-type-client')?.value || 'pro',
      siret: document.getElementById('f-siret-client')?.value || '',
      notes: document.getElementById('f-notes-client')?.value || '',
    };
    if (id) { DB.updateClient(id, data); App.toast('Client mis Ã  jour'); }
    else     { DB.addClient(data);        App.toast('Client crÃ©Ã© !'); }
    App.closeModal();
    App.navigate('clients');
  },

  supprimerClient(id) {
    App.modalConfirmDanger({
      titre: 'DÃ©sactiver ce client ?',
      message: 'Ce client sera dÃ©sactivÃ© et retirÃ© de la liste.',
      motConfirm: 'OK',
      onConfirm: () => {
        DB.deleteClient(id);
        App.closeModal();
        App.navigate('clients');
        App.toast('Client dÃ©sactivÃ©');
      }
    });
  },

  modalNouveauChantier() {
    const body = Pages._formChantier();
    App.openModal('Nouveau chantier', body, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderChantier()">CrÃ©er le chantier</button>
    `);
  },

  modalEditChantier(id) {
    const c = DB.getChantier(id);
    if (!c) return;
    const body = Pages._formChantier(c);

    const affectations = c.sousTraitants || [];
    const stRows = affectations.map(aff => {
      const st = DB.getSousTraitantById(aff.stId);
      const col = aff.statut === 'TerminÃ©' ? '#10b981' : aff.statut === 'AnnulÃ©' ? '#ef4444' : '#f59e0b';
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:6px;font-size:13px;flex-wrap:wrap">'
        + '<span style="font-weight:700;flex:1;min-width:100px">' + (st ? st.nom + (st.prenom ? ' ' + st.prenom : '') : 'â€”') + '</span>'
        + '<span style="color:var(--text-secondary);flex:2;min-width:120px">' + (aff.travaux || 'â€”') + '</span>'
        + '<span style="font-family:var(--font-mono)">' + (aff.montant ? aff.montant.toFixed(2) + ' â‚¬ HT' : 'â€”') + '</span>'
        + '<span style="padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:' + col + '20;color:' + col + '">' + (aff.statut || 'En cours') + '</span>'
        + '</div>';
    }).join('');

    const stSection = document.createElement('div');
    stSection.innerHTML = '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">'
      + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);margin-bottom:10px">ðŸ¤ Sous-traitants affectÃ©s</div>'
      + (affectations.length === 0 ? '<div style="font-size:13px;color:var(--text-tertiary);margin-bottom:10px">Aucun sous-traitant affectÃ©</div>' : stRows)
      + '<button class="btn btn-secondary btn-sm" style="margin-top:6px" onclick="App.closeModal();setTimeout(function(){if(typeof ST!==\'undefined\')ST.affecter(' + id + ')},150)">âž• Affecter un ST</button>'
      + '</div>';
    body.appendChild(stSection);

    App.openModal('Modifier â€” ' + c.nom, body, `
      <button class="btn btn-danger" onclick="Pages.supprimerChantier(${id})">Supprimer</button>
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderChantier(${id})">Enregistrer</button>
    `);
  },

  _formChantier(c = {}) {
    const d = document.createElement('div');
    d.innerHTML = `
      <input type="hidden" id="f-type-chantier" value="${c.typeChantier || 'interieur'}">
      <div class="form-group"><label class="form-label">Client *</label>
        <select class="form-control" id="f-client">
          <option value="">â€” SÃ©lectionner â€”</option>
          ${DB.clients.map(cl => `<option value="${cl.id}" ${c.clientId == cl.id ? 'selected' : ''}>${cl.nom}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Nom du chantier *</label>
        <input class="form-control" id="f-nom-ch" value="${c.nom || ''}"></div>
      <div class="form-group"><label class="form-label">Adresse du chantier</label>
        <input class="form-control" id="f-adr-ch" value="${c.adresse || ''}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Code postal</label>
          <input class="form-control" id="f-cp-ch" value="${c.codePostal || c.cp || ''}" maxlength="5" inputmode="numeric"></div>
        <div class="form-group"><label class="form-label">Ville</label>
          <input class="form-control" id="f-ville-ch" value="${c.ville || ''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Date dÃ©but</label>
          <input class="form-control" type="date" id="f-debut" value="${c.dateDebut || ''}"></div>
        <div class="form-group"><label class="form-label">Date fin prÃ©vue</label>
          <input class="form-control" type="date" id="f-fin" value="${c.dateFin || ''}"></div>
      </div>
      <div class="form-group"><label class="form-label">Statut</label>
        <select class="form-control" id="f-statut">
          ${['En attente','En cours','TerminÃ©','AnnulÃ©'].map(s => `<option ${c.statut === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Notes</label>
        <textarea class="form-control" id="f-notes">${c.notes || ''}</textarea></div>
    `;
    this._bindCodePostalVille(d, '#f-cp-ch', '#f-ville-ch');
    const clientSelect = d.querySelector('#f-client');
    const adrInput = d.querySelector('#f-adr-ch');
    const cpInput = d.querySelector('#f-cp-ch');
    const villeInput = d.querySelector('#f-ville-ch');
    [adrInput, cpInput, villeInput].forEach(inp => {
      if (inp) inp.addEventListener('input', () => { inp.dataset.userEdited = '1'; });
    });
    if (clientSelect) {
      clientSelect.addEventListener('change', () => {
        const client = DB.clients.find(cl => String(cl.id) === String(clientSelect.value));
        if (!client) return;
        if (adrInput && !adrInput.dataset.userEdited && !adrInput.value.trim()) adrInput.value = client.adresse || '';
        if (cpInput && !cpInput.dataset.userEdited && !cpInput.value.trim()) cpInput.value = client.codePostal || client.cp || '';
        if (villeInput && !villeInput.dataset.userEdited && !villeInput.value.trim()) villeInput.value = client.ville || '';
      });
    }
    return d;
  },

  setTypeChantier(type) {
    // Sauvegarder les valeurs actuelles du formulaire
    const nom     = document.getElementById('f-nom-ch')?.value || '';
    const client  = document.getElementById('f-client')?.value || '';
    const adr     = document.getElementById('f-adr-ch')?.value || '';
    const cp      = document.getElementById('f-cp-ch')?.value || '';
    const ville   = document.getElementById('f-ville-ch')?.value || '';
    const debut   = document.getElementById('f-debut')?.value || '';
    const fin     = document.getElementById('f-fin')?.value || '';
    const statut  = document.getElementById('f-statut')?.value || '';
    const notes   = document.getElementById('f-notes')?.value || '';

    // RecrÃ©er le formulaire avec le bon type
    const chantierPartiel = { typeChantier: type, nom, clientId: parseInt(client), adresse: adr, codePostal: cp, cp, ville, dateDebut: debut, dateFin: fin, statut, notes };
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    modalBody.innerHTML = '';
    modalBody.appendChild(Pages._formChantier(chantierPartiel));
  },

  sauvegarderChantier(id) {
    const nom = document.getElementById('f-nom-ch').value.trim();
    const clientId = parseInt(document.getElementById('f-client').value);
    if (!nom || !clientId) { App.toast('Nom et client obligatoires', 'error'); return; }
    const data = {
      clientId, nom, adresse: document.getElementById('f-adr-ch').value,
      codePostal: document.getElementById('f-cp-ch')?.value || '',
      cp: document.getElementById('f-cp-ch')?.value || '',
      ville: document.getElementById('f-ville-ch')?.value || '',
      dateDebut: document.getElementById('f-debut').value,
      dateFin:   document.getElementById('f-fin').value,
      statut:    document.getElementById('f-statut').value,
      notes:     document.getElementById('f-notes').value,
      typeChantier: document.getElementById('f-type-chantier')?.value || 'interieur',
      natureExt:      document.getElementById('f-nature-ext')?.value || '',
      solExt:         document.getElementById('f-sol-ext')?.value || '',
      surfaceEstimee: parseFloat(document.getElementById('f-surface-est')?.value) || 0,
      accesExt:       document.getElementById('f-acces-ext')?.value || 'facile',
      typeTravaux:    document.getElementById('f-type-travaux')?.value || '',
      nbPieces:       parseInt(document.getElementById('f-nb-pieces')?.value) || 0,
      etatLogement:   document.getElementById('f-etat-logement')?.value || 'neuf',
    };
    if (id) { DB.updateChantier(id, data); App.toast('Chantier mis Ã  jour'); }
    else     { DB.addChantier(data);        App.toast('Chantier crÃ©Ã© !'); }
    App.closeModal();
    App.navigate('chantiers');
  },

  supprimerChantier(id) {
    App.modalConfirm({ message: 'Supprimer ce chantier ?', onConfirm: () => {
      DB.deleteChantier(id);
      App.closeModal();
      App.navigate('chantiers');
      App.toast('Chantier supprimÃ©');
    }});
  },

  modalNouveauMetrage(chantierId) {
    const chantier = chantierId ? DB.getChantier(parseInt(chantierId)) : null;
    const isExt = chantier?.typeChantier === 'exterieur';
    const d = document.createElement('div');
    if (isExt) {
      d.innerHTML = `
        ${!chantierId ? `<div class="form-group"><label class="form-label">Chantier *</label>
          <select class="form-control" id="f-ch-metrage">
            <option value="">â€” SÃ©lectionner â€”</option>
            ${DB.chantiers.map(c => '<option value="' + c.id + '">' + c.nom + '</option>').join('')}
          </select></div>` : '<input type="hidden" id="f-ch-metrage" value="' + chantierId + '">'}
        <div class="form-group"><label class="form-label">DÃ©signation *</label>
          <input class="form-control" id="f-piece" placeholder="Muret, Terrasse, AllÃ©e, ClÃ´ture, Escalier..."></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Surface (mÂ²)</label>
            <input class="form-control" id="f-surface-ext" type="number" step="0.01" placeholder="0.00" oninput="Pages.calcMetrageExtPreview()">
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:3px">ou longueur Ã— largeur ci-dessous</div>
          </div>
          <div class="form-group"><label class="form-label">LinÃ©aire (ml)</label>
            <input class="form-control" id="f-lineaire-ext" type="number" step="0.01" placeholder="0.00">
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:3px">clÃ´tures, bordures, caniveaux...</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div class="form-group"><label class="form-label">Longueur (m)</label>
            <input class="form-control" id="f-long" type="number" step="0.01" placeholder="0.00" oninput="Pages.calcMetrageExtPreview()"></div>
          <div class="form-group"><label class="form-label">Largeur (m)</label>
            <input class="form-control" id="f-larg" type="number" step="0.01" placeholder="0.00" oninput="Pages.calcMetrageExtPreview()"></div>
          <div class="form-group"><label class="form-label">Hauteur (m)</label>
            <input class="form-control" id="f-haut" type="number" step="0.01" placeholder="0.00">
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:3px">muret, mur...</div>
          </div>
        </div>
        <div id="metrage-preview" style="display:none;background:var(--bg-tertiary);border-radius:var(--radius-md);padding:10px;margin-top:4px;font-size:13px">
          Surface calculÃ©e : <strong id="prev-surface-ext">â€”</strong>
        </div>
      `;
      App.openModal('ðŸŒ¿ Nouveau mÃ©trÃ© extÃ©rieur', d,
        '<button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>' +
        '<button class="btn btn-primary" onclick="Pages.sauvegarderMetrage(true)">Ajouter</button>'
      );
    } else {
      d.innerHTML = `
        ${!chantierId ? `<div class="form-group"><label class="form-label">Chantier *</label>
          <select class="form-control" id="f-ch-metrage">
            <option value="">â€” SÃ©lectionner â€”</option>
            ${DB.chantiers.map(c => '<option value="' + c.id + '">' + c.nom + '</option>').join('')}
          </select></div>` : '<input type="hidden" id="f-ch-metrage" value="' + chantierId + '">'}
        <div class="form-group"><label class="form-label">Nom de la piÃ¨ce *</label>
          <input class="form-control" id="f-piece" placeholder="SÃ©jour, Chambre 1, Cuisine..."></div>
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
            <div><span class="text-tertiary">PÃ©rimÃ¨tre : </span><strong id="prev-perim">â€”</strong></div>
            <div><span class="text-tertiary">Murs : </span><strong id="prev-murs">â€”</strong></div>
            <div><span class="text-tertiary">Plafond : </span><strong id="prev-plaf">â€”</strong></div>
          </div>
        </div>
      `;
      App.openModal('ðŸ  Nouveau mÃ©trÃ© intÃ©rieur', d,
        '<button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>' +
        '<button class="btn btn-primary" onclick="Pages.sauvegarderMetrage(false)">Ajouter la piÃ¨ce</button>'
      );
    }
  },

  calcMetrageExtPreview() {
    const L = parseFloat(document.getElementById('f-long')?.value) || 0;
    const l = parseFloat(document.getElementById('f-larg')?.value) || 0;
    let surf = parseFloat(document.getElementById('f-surface-ext')?.value) || 0;
    if (!surf && L > 0 && l > 0) {
      surf = L * l;
      const el = document.getElementById('f-surface-ext');
      if (el) el.value = surf.toFixed(2);
    }
    const prev  = document.getElementById('metrage-preview');
    const prevEl = document.getElementById('prev-surface-ext');
    if (surf > 0 && prev && prevEl) {
      prevEl.textContent = surf.toFixed(2) + ' mÂ²';
      prev.style.display = 'block';
    }
  },

  calcMetragePreview() {
    const L = parseFloat(document.getElementById('f-long')?.value) || 0;
    const l = parseFloat(document.getElementById('f-larg')?.value) || 0;
    const H = parseFloat(document.getElementById('f-haut')?.value) || 0;
    if (L > 0 && l > 0 && H > 0) {
      const c = Calculs.metrage(L, l, H);
      document.getElementById('prev-perim').textContent = Calculs.fmtN(c.perimetre, 2) + ' m';
      document.getElementById('prev-murs').textContent  = Calculs.fmtN(c.surfMurs, 2) + ' mÂ²';
      document.getElementById('prev-plaf').textContent  = Calculs.fmtN(c.surfPlafond, 2) + ' mÂ²';
      document.getElementById('metrage-preview').style.display = 'block';
    }
  },

  sauvegarderMetrage(isExt) {
    const chantierId = parseInt(document.getElementById('f-ch-metrage')?.value);
    const piece = document.getElementById('f-piece')?.value.trim();
    if (!chantierId || !piece) { App.toast('DÃ©signation et chantier obligatoires', 'error'); return; }
    if (isExt) {
      const surf = parseFloat(document.getElementById('f-surface-ext')?.value) || 0;
      const lin  = parseFloat(document.getElementById('f-lineaire-ext')?.value) || 0;
      const L    = parseFloat(document.getElementById('f-long')?.value) || 0;
      const l    = parseFloat(document.getElementById('f-larg')?.value) || 0;
      const H    = parseFloat(document.getElementById('f-haut')?.value) || 0;
      const surfFinale = surf || (L > 0 && l > 0 ? L * l : 0);
      if (!surfFinale && !lin) { App.toast('Saisissez une surface ou un linÃ©aire', 'error'); return; }
      DB.addMetrage({ chantierId, piece, longueur: L || surfFinale, largeur: l || 1, hauteur: H || 1,
        surfaceExt: surfFinale, lineaire: lin, typeMetrage: 'exterieur' });
    } else {
      const L = parseFloat(document.getElementById('f-long')?.value);
      const l = parseFloat(document.getElementById('f-larg')?.value);
      const H = parseFloat(document.getElementById('f-haut')?.value);
      if (!L || !l || !H) { App.toast('Longueur, largeur et hauteur obligatoires', 'error'); return; }
      DB.addMetrage({ chantierId, piece, longueur: L, largeur: l, hauteur: H, typeMetrage: 'interieur' });
    }
    App.closeModal();
    Pages.chargerMetrages(chantierId);
    App.toast('MÃ©trÃ© ajoutÃ© !');
  },

  modalNouveauDevis() {
    App.navigate('devis');
  },

  modalNouveauProduit() {
    const d = Pages._formProduit();
    App.openModal('Nouveau produit', d, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="Pages.sauvegarderProduit()">CrÃ©er</button>
    `);
  },

  modalEditProduit(id) {
    const p = DB.getById(DB.KEYS.produits, id);
    if (!p) return;
    const d = Pages._formProduit(p);
    App.openModal('Modifier â€” ' + p.reference, d, `
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
             ðŸ” Chercher via IA
           </button>
         </div>`
      : '';
    d.innerHTML = `
      ${webSearch}
      <div class="form-row">
        <div class="form-group"><label class="form-label">CatÃ©gorie</label>
          <select class="form-control" id="f-cat">
            ${['Cloison','Plaque','Fixation','Joint','Isolation','Peinture','Preparat.','Accessoire','Plafond','Main oeuvre']
              .map(c => `<option ${p.categorie === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">RÃ©fÃ©rence *</label>
          <input class="form-control" id="f-ref" value="${p.reference || ''}"></div>
      </div>
      <div class="form-group"><label class="form-label">DÃ©signation *</label>
        <input class="form-control" id="f-design" value="${p.designation || ''}"></div>
      <div class="form-row-3">
        <div class="form-group"><label class="form-label">UnitÃ©</label>
          <select class="form-control" id="f-unite">
            ${['u','ml','m2','L','sac','boite','rl','h','lot'].map(u => `<option ${p.unite === u ? 'selected' : ''}>${u}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">Prix HT (â‚¬) *</label>
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
    if (id) { DB.updateProduit(id, data); App.toast('Produit mis Ã  jour'); }
    else     { DB.addProduit(data);        App.toast('Produit crÃ©Ã© !'); }
    App.closeModal();
    App.navigate('produits');
  },
};

// Lancer l'app
document.addEventListener('DOMContentLoaded', () => App.init());



