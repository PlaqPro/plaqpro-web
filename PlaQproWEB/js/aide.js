// ============================================================
//  PLAQPRO WEB — Guide & Aide interactif
//  aide.js
// ============================================================

Pages.aide = function () {
  Aide._injectStyles();
  const div = document.createElement('div');
  div.id = 'aide-root';
  div.innerHTML = Aide._buildPage();
  setTimeout(() => Aide._init(div), 0);
  return div;
};

var Aide = {

  _tab: 'accueil',   // accueil | guides | fonctionnalites | faq
  _guide: null,      // 'demarrer' | 'devis' | 'clients'
  _step: 0,

  // ── Données ───────────────────────────────────────────────

  GUIDES: {
    demarrer: {
      titre: '🚀 Je démarre',
      color: '#4F8EF7',
      etapes: [
        {
          icon: '⚙️', titre: 'Configurer mon entreprise',
          desc: 'Commencez par renseigner vos infos entreprise — elles apparaîtront sur tous vos devis et factures.',
          action: { label: 'Aller dans Configuration', page: 'config' },
          checklist: ['Nom entreprise', 'Adresse', 'SIRET', 'Logo', 'Assurance décennale'],
        },
        {
          icon: '👤', titre: 'Créer mon premier client',
          desc: 'Ajoutez vos clients pour leur envoyer des devis professionnels.',
          action: { label: 'Créer un client', page: 'clients' },
          anim: true,
        },
        {
          icon: '🏗', titre: 'Créer un chantier',
          desc: 'Associez chaque chantier à un client. Intérieur ou extérieur — PlaqPro+ adapte les outils !',
          action: { label: 'Nouveau chantier', page: 'chantiers' },
        },
        {
          icon: '📐', titre: 'Saisir les métrés',
          desc: 'Mesurez les pièces — PlaqPro+ calcule automatiquement les surfaces !',
          action: { label: 'Saisir un métré', page: 'metrages' },
          schema: true,
        },
        {
          icon: '⚡', titre: 'Calcul Express',
          desc: 'Obtenez une estimation immédiate de vos matériaux et coûts.',
          action: { label: 'Calcul Express', page: 'calculateur' },
        },
        {
          icon: '📄', titre: 'Créer et envoyer un devis',
          desc: 'Utilisez le Calcul Express → cliquez "💾 Créer le devis" → suivez les 4 étapes du wizard (client, chantier, corps de métier, marge). Envoyez par email en 1 clic !',
          action: { label: 'Calcul Express', page: 'calculateur' },
        },
      ],
    },
    devis: {
      titre: '⚡ Devis vite',
      color: '#2DD4A0',
      etapes: [
        {
          icon: '⚡', titre: 'Étape 1 — Calcul Express',
          desc: 'Saisissez les dimensions (longueur, hauteur, type de cloison…). PlaqPro+ calcule les matériaux et le coût en temps réel. Cliquez ensuite sur "💾 Créer devis" pour lancer le wizard.',
          action: { label: 'Lancer le Calcul Express', page: 'calculateur' },
        },
        {
          icon: '👤', titre: 'Étape 2 — Client & Chantier',
          desc: 'Sélectionnez un client existant ou créez-en un nouveau en ligne (nom, tél, email). Associez ou créez un chantier directement dans le wizard — sans quitter le flux.',
          action: { label: 'Mes clients', page: 'clients' },
        },
        {
          icon: '🔧', titre: 'Étape 3 — Corps de métier additionnels',
          desc: 'Cochez les autres prestations à inclure : Électricité, Plomberie, Peinture, Maçonnerie, Carrelage, Extérieur. Prix pré-estimés, ajustables ligne par ligne.',
          action: { label: 'Calcul Express', page: 'calculateur' },
        },
        {
          icon: '📄', titre: 'Étape 4 — Finaliser & Envoyer',
          desc: 'Ajustez la marge globale avec le slider (0-80%), choisissez la TVA (10% rénovation / 20% neuf). Total TTC mis à jour en direct. Enregistrez et envoyez par email en 1 clic.',
          action: { label: 'Mes devis', page: 'devis' },
        },
      ],
    },
    clients: {
      titre: '🎯 Nouveaux clients',
      color: '#A78BFA',
      etapes: [
        {
          icon: '🎯', titre: 'Prospection IA',
          desc: 'PlaqPro+ trouve les permis de construire dans votre zone — prospects chauds garantis !',
          action: { label: 'Prospection IA', page: 'prospection' },
        },
        {
          icon: '🟢', titre: 'Enrichir les prospects',
          desc: 'Cliquez Enrichir → adresse, cadastre, liens Pages Jaunes, budget estimé automatiquement.',
          action: { label: 'Mes prospects', page: 'prospection' },
        },
        {
          icon: '📬', titre: 'Contacter',
          desc: 'Appelez directement ou envoyez un courrier professionnel personnalisé via l\'IA.',
          action: { label: 'Prospection IA', page: 'prospection' },
        },
      ],
    },
    flux: {
      titre: '⚡ Le flux de base PlaqPro+',
      color: '#F7A64F',
      etapes: [
        {
          icon: '⚡', titre: 'Calcul Express',
          desc: 'Saisissez les dimensions de votre chantier — PlaqPro+ calcule instantanément les matériaux nécessaires et le coût estimé.',
          action: { label: 'Lancer Calcul Express', page: 'calculateur' },
        },
        {
          icon: '👤', titre: 'Sélectionner / Créer un client',
          desc: 'Depuis le wizard de création de devis, sélectionnez un client existant ou créez-en un nouveau en ligne — nom, téléphone, email.',
          action: { label: 'Mes clients', page: 'clients' },
        },
        {
          icon: '🏗', titre: 'Associer un chantier',
          desc: 'Liez le devis à un chantier existant ou créez-en un nouveau directement dans le wizard — adresse et type (intérieur / extérieur).',
          action: { label: 'Mes chantiers', page: 'chantiers' },
        },
        {
          icon: '🔧', titre: 'Ajouter des corps de métier',
          desc: 'Cochez les autres prestations à inclure : Électricité, Plomberie, Peinture, Maçonnerie, Carrelage, Extérieur. Les prix sont pré-estimés et ajustables.',
          action: { label: 'Calcul Express', page: 'calculateur' },
        },
        {
          icon: '📄', titre: 'Finaliser le devis',
          desc: 'Ajustez la marge globale avec le slider, choisissez la TVA (10% rénovation / 20% neuf) — le Total TTC se met à jour en direct.',
          action: { label: 'Mes devis', page: 'devis' },
        },
        {
          icon: '📧', titre: 'Envoyer au client',
          desc: 'Enregistrez le devis et envoyez-le par email directement depuis la page Devis. Le client peut signer en ligne depuis son téléphone.',
          action: { label: 'Envoyer un devis', page: 'devis' },
        },
      ],
    },
  },

  FONCTIONNALITES: [
    { icon: '⚡', nom: 'Calcul Express',         desc: 'Estimez matériaux et coût en quelques secondes',         niveau: 'easy',   page: 'calculateur' },
    { icon: '📐', nom: 'Métrés',                  desc: 'Saisissez dimensions L×l×H, les surfaces se calculent',  niveau: 'easy',   page: 'metrages' },
    { icon: '📄', nom: 'Devis',                   desc: 'Créez et envoyez des devis pro par email',               niveau: 'easy',   page: 'devis' },
    { icon: '🧾', nom: 'Factures',                desc: 'Transformez vos devis en factures en 1 clic',            niveau: 'easy',   page: 'factures' },
    { icon: '📸', nom: 'Analyse Photo',           desc: 'Photographiez un chantier → PlaqPro+ l\'analyse. Dans Dashboard → Outils & Goodies → Actions rapides', niveau: 'easy', page: null, action: 'AnalysePhoto.showModal()' },
    { icon: '🎯', nom: 'Prospection IA',          desc: 'Trouvez des prospects via les permis de construire',     niveau: 'medium', page: 'prospection' },
    { icon: '🏛', nom: "DPGF / Appels d'offres",  desc: 'Uploadez un DPGF Excel/PDF → PlaqPro+ le complète avec vos prix automatiquement. Dans Commercial → Appels d\'offres', niveau: 'medium', page: 'dpgf' },
    { icon: '🧱', nom: 'Pack Maçonnerie',         desc: 'Devis maçonnerie avec calculs automatiques',             niveau: 'medium', page: 'maconnerie' },
    { icon: '⚡', nom: 'Pack Électricité',        desc: 'Chiffrage électricité NF C 15-100',                      niveau: 'medium', page: 'electricite' },
    { icon: '🔧', nom: 'Pack Plomberie',          desc: 'Calculs plomberie DTU 60.1 intégrés',                    niveau: 'medium', page: 'plomberie' },
    { icon: '🌿', nom: 'Pack Extérieur',          desc: 'Paysagisme, terrasses, clôtures',                        niveau: 'medium', page: 'exterieur' },
    { icon: '📦', nom: 'Projets Types',           desc: 'Modèles de devis prêts à personnaliser',                 niveau: 'easy',   page: 'projets_types' },
    { icon: '🤖', nom: 'Assistant IA',            desc: 'Posez vos questions pro à l\'IA 24h/24',                 niveau: 'easy',   page: null, action: "document.getElementById('ia-fab-btn')&&document.getElementById('ia-fab-btn').click()" },
    { icon: '🧠', nom: 'Quiz Plaquiste',          desc: 'Testez et développez vos connaissances',                 niveau: 'easy',   page: 'quiz' },
    { icon: '☕', nom: 'Pause Café',             desc: 'Musique lofi + citation + minuteur. Bouton ☕ en bas de la sidebar.',                                    niveau: 'easy',   page: null, action: 'PauseCafe.show()' },
    { icon: '🇪🇺', nom: 'Factur-X 2026',         desc: 'Vos factures sont automatiquement conformes à la réforme 2026. Téléchargez le XML depuis chaque facture.', niveau: 'easy',   page: 'factures' },
    { icon: '📊', nom: 'Export comptable',        desc: 'Exportez vos écritures en 1 clic — compatible Sage, EBP, Cegid. Dans Configuration → Export comptable.',   niveau: 'easy',   page: 'config' },
    { icon: '🔍', nom: 'Scanner facture four.',   desc: 'Photographiez une facture fournisseur → PlaqPro+ extrait les montants et la rattache au chantier. Dans Dashboard → Outils & Goodies', niveau: 'easy', page: null, action: 'AnalysePhoto.showModalFournisseur()' },
    { icon: '📈', nom: 'Marge brute temps réel',  desc: 'Voyez votre marge en temps réel sur le dashboard — total facturé vs total achats.',                         niveau: 'easy',   page: 'dashboard' },
    { icon: '✍️', nom: 'Signature électronique',  desc: 'Le client signe depuis son téléphone. Bouton ✍️ sur chaque devis envoyé.',                                  niveau: 'easy',   page: 'devis' },
  ],

  FAQ: [
    {
      q: 'Comment modifier un devis envoyé ?',
      a: 'Allez dans <strong>Devis</strong>, cliquez sur le devis puis sur le bouton <strong>Modifier</strong>. Chaque modification crée une nouvelle version. Si le client a déjà signé, vous devrez lui renvoyer un avenant.',
      page: 'devis',
    },
    {
      q: 'Peut-on avoir plusieurs utilisateurs ?',
      a: 'PlaqPro+ fonctionne actuellement en mode mono-utilisateur par appareil. Les données sont stockées localement. Pour partager, utilisez la fonctionnalité <strong>Exporter / Importer</strong> dans Configuration.',
      page: 'config',
    },
    {
      q: "Comment ajouter un produit qui n'existe pas ?",
      a: 'Allez dans <strong>Base tarifaire</strong> → bouton <strong>+ Nouveau produit</strong>. Vous pouvez aussi importer un catalogue Excel. Vos produits apparaîtront dans tous les devis.',
      page: 'produits',
    },
    {
      q: "Comment configurer l'assistant IA ?",
      a: 'Allez dans <strong>Configuration</strong> → section <strong>Intelligence Artificielle</strong> → saisissez votre clé API Groq (gratuite sur console.groq.com). L\'IA sera disponible dans tous les modules.',
      page: 'config',
    },
    {
      q: "Comment installer PlaqPro+ sur mon téléphone ?",
      a: 'PlaqPro+ est une PWA. Sur iPhone : ouvrez dans Safari → bouton Partager → <strong>Sur l\'écran d\'accueil</strong>. Sur Android : Chrome → menu ⋮ → <strong>Ajouter à l\'écran d\'accueil</strong>.',
      page: null,
    },
    {
      q: 'Mes données sont-elles sauvegardées ?',
      a: 'Vos données sont stockées localement dans votre navigateur (localStorage). Pensez à faire des <strong>exports réguliers</strong> depuis Configuration → Sauvegarder. Une sauvegarde cloud est en cours de développement.',
      page: 'config',
    },
    {
      q: 'Comment exporter mes devis en PDF ?',
      a: 'Ouvrez un devis → bouton <strong>Imprimer / PDF</strong> en haut à droite. Dans la boîte de dialogue d\'impression, choisissez <strong>Enregistrer en PDF</strong>. Le devis sera formaté avec votre logo.',
      page: 'devis',
    },
    {
      q: "Comment répondre à un appel d'offres ?",
      a: 'Dans <strong>Commercial → Appels d\'offres</strong>. Uploadez votre DPGF Excel ou PDF → l\'IA extrait les lots plâtrerie/peinture/sol et remplit vos prix automatiquement. Exportez le DPGF complété en Excel.',
      page: 'dpgf',
    },
    {
      q: "Qu'est-ce que le Factur-X 2026 ?",
      a: 'C\'est le format de facture électronique obligatoire en France à partir de septembre 2026. PlaqPro+ génère automatiquement vos factures dans ce format conforme EN16931. Téléchargez le XML depuis chaque facture.',
      page: 'factures',
    },
    {
      q: 'Comment scanner une facture fournisseur ?',
      a: 'Dans <strong>Dashboard → Outils & Goodies → Actions rapides → Scanner une facture</strong>. Prenez une photo et PlaqPro+ extrait automatiquement tous les montants (HT, TVA, TTC, fournisseur, date échéance).',
      page: null,
    },
    {
      q: 'Où est la calculatrice ?',
      a: 'Dans <strong>Dashboard → Outils & Goodies → Actions rapides → Calculatrice</strong>. Vous pouvez aussi y accéder via le menu <strong>🎮 Jeux</strong> en bas de la sidebar.',
      page: null,
    },
    {
      q: 'Comment voir ma marge ?',
      a: 'Sur le <strong>Dashboard</strong> — widget <strong>Marge brute</strong> en haut de page. Il affiche le total facturé, le total achats fournisseurs et votre marge en % pour le mois en cours.',
      page: 'dashboard',
    },
  ],

  AIDE_CONTEXTUELLE: {
    dashboard:     ['Vos KPIs se mettent à jour en temps réel', 'Cliquez sur une stat pour voir le détail', 'Le graphique CA utilise vos factures payées', 'Les alertes vous signalent les urgences'],
    calculateur:   ['Saisissez L×l×H pour obtenir les surfaces', 'Changez la pose dans l\'onglet Options', 'Sauvegardez le calcul comme devis avec 💾', 'L\'onglet Multi-corps combine plusieurs corps'],
    devis:         ['Créez un devis depuis un calcul Express', 'Envoyez par email avec le bouton 📧', 'La signature électronique est gratuite', 'Transformez en facture en 1 clic'],
    factures:      ['Les factures se créent depuis les devis acceptés', 'Marquez comme Payée pour mettre à jour le CA', 'Relancez en retard avec le bouton 🔔', 'Exportez en PDF avec le logo'],
    prospection:   ['Recherchez par code postal ou ville', 'Enrichissez pour obtenir les coordonnées', 'Envoyez un courrier personnalisé via IA', 'Filtrez par budget estimé'],
    dpgf:          ['Glissez votre DPGF en .xlsx ou .pdf', 'L\'IA analyse et extrait automatiquement les lots', 'Ajustez les marges par ligne', 'Exportez le DPGF complété avec 📥'],
    clients:       ['Ajoutez un client avant de créer un devis', 'Importez depuis un vCard ou CSV', 'L\'historique client regroupe devis et factures'],
    chantiers:     ['Liez chaque chantier à un client', 'Ajoutez des photos via l\'analyse IA', 'Suivez l\'avancement avec les statuts'],
    metrages:      ['Saisissez L×l×H en mètres', 'Déduisez les ouvertures (portes, fenêtres)', 'Les métrés alimentent le Calcul Express'],
    config:        ['Votre logo apparaît sur tous les documents', 'Configurez la TVA par défaut', 'Entrez votre clé Groq pour activer l\'IA', 'Exportez vos données régulièrement'],
  },

  // ── Build page ────────────────────────────────────────────
  _buildPage() {
    return `
      <div style="max-width:1040px;margin:0 auto;padding:0 4px">

        <!-- Tabs -->
        <div style="display:flex;gap:4px;background:var(--bg-secondary);border-radius:12px;padding:4px;margin-bottom:20px;flex-wrap:wrap">
          ${[['accueil','🏠 Accueil'],['guides','🗺 Guides'],['fonctionnalites','⚡ Fonctionnalités'],['faq','❓ FAQ']].map(([k,l]) =>
            `<button class="aide-tab${k==='accueil'?' active':''}" onclick="Aide._switchTab('${k}')" data-tab="${k}">${l}</button>`
          ).join('')}
        </div>

        <!-- Contenu -->
        <div id="aide-content"></div>

      </div>`;
  },

  // ── Init ──────────────────────────────────────────────────
  _init(root) {
    this._root = root;
    this._tab  = 'accueil';
    this._guide = null;
    this._renderTab();
  },

  _switchTab(tab) {
    this._tab   = tab;
    this._guide = null;
    document.querySelectorAll('.aide-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    this._renderTab();
  },

  _renderTab() {
    const c = document.getElementById('aide-content');
    if (!c) return;
    c.innerHTML = '';
    if      (this._tab === 'accueil')         c.appendChild(this._buildAccueil());
    else if (this._tab === 'guides')          c.appendChild(this._buildGuides());
    else if (this._tab === 'fonctionnalites') c.appendChild(this._buildFonctionnalites());
    else if (this._tab === 'faq')             c.appendChild(this._buildFAQ());
  },

  // ── Onglet Accueil ────────────────────────────────────────
  _buildAccueil() {
    const d = document.createElement('div');
    d.innerHTML = `
      <!-- Hero -->
      <div style="background:linear-gradient(135deg,rgba(79,142,247,0.15),rgba(167,139,250,0.1),rgba(45,212,160,0.08));border:1px solid rgba(79,142,247,0.2);border-radius:18px;padding:36px 40px;margin-bottom:24px;text-align:center;position:relative;overflow:hidden">
        <div class="aide-hero-bg"></div>
        <div style="position:relative;z-index:1">
          <div style="font-size:52px;margin-bottom:14px">👋</div>
          <h1 style="font-size:26px;font-weight:900;color:var(--text-primary);margin:0 0 10px">Bienvenue dans PlaqPro+</h1>
          <p style="font-size:15px;color:var(--text-secondary);margin:0 0 8px">Votre assistant professionnel complet.</p>
          <p style="font-size:14px;color:var(--text-tertiary)">Découvrez les <strong style="color:var(--accent)">${this.FONCTIONNALITES.length}</strong> fonctionnalités disponibles en quelques minutes !</p>
        </div>
      </div>

      <!-- 3 parcours -->
      <div style="margin-bottom:10px">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);margin-bottom:14px;font-weight:700">Par où commencer ?</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px">

          <div class="aide-parcours-card" onclick="Aide._switchTab('guides');Aide._openGuide('demarrer')"
               style="border-color:rgba(79,142,247,0.3)">
            <div style="font-size:38px;margin-bottom:10px">🚀</div>
            <div style="font-size:17px;font-weight:800;color:var(--text-primary);margin-bottom:6px">Je démarre</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.5">Nouveau sur PlaqPro+ ? Suivez les 6 étapes pour tout configurer et créer votre premier devis.</div>
            <div style="margin-top:12px;font-size:12px;color:#4F8EF7;font-weight:600">6 étapes →</div>
          </div>

          <div class="aide-parcours-card" onclick="Aide._switchTab('guides');Aide._openGuide('devis')"
               style="border-color:rgba(45,212,160,0.3)">
            <div style="font-size:38px;margin-bottom:10px">⚡</div>
            <div style="font-size:17px;font-weight:800;color:var(--text-primary);margin-bottom:6px">Je veux faire un devis vite</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.5">4 étapes rapides pour chiffrer et envoyer un devis professionnel en moins de 5 minutes.</div>
            <div style="margin-top:12px;font-size:12px;color:#2DD4A0;font-weight:600">4 étapes →</div>
          </div>

          <div class="aide-parcours-card" onclick="Aide._switchTab('guides');Aide._openGuide('clients')"
               style="border-color:rgba(167,139,250,0.3)">
            <div style="font-size:38px;margin-bottom:10px">🎯</div>
            <div style="font-size:17px;font-weight:800;color:var(--text-primary);margin-bottom:6px">Je cherche de nouveaux clients</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.5">Utilisez la Prospection IA pour trouver des chantiers via les permis de construire.</div>
            <div style="margin-top:12px;font-size:12px;color:#A78BFA;font-weight:600">3 étapes →</div>
          </div>

        </div>
      </div>

      <!-- Flux principal mis en avant -->
      <div style="margin-top:20px">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);margin-bottom:14px;font-weight:700">Le flux de base PlaqPro+</div>
        <div style="background:linear-gradient(135deg,rgba(247,166,79,0.08),rgba(79,142,247,0.06));border:1px solid rgba(247,166,79,0.25);border-radius:16px;padding:22px 24px;cursor:pointer"
             onclick="Aide._switchTab('guides');Aide._openGuide('flux')">
          <!-- Pipeline visuel -->
          <div style="display:flex;align-items:center;gap:0;flex-wrap:wrap;margin-bottom:16px">
            ${['⚡ Calcul','👤 Client','🏗 Chantier','🔧 Corps métier','📄 Devis','📧 Envoi'].map((label, i, arr) => `
              <div style="display:flex;align-items:center;gap:0">
                <div style="padding:6px 12px;background:rgba(247,166,79,0.12);border:1px solid rgba(247,166,79,0.3);border-radius:20px;font-size:12px;font-weight:600;color:var(--text-primary);white-space:nowrap">${label}</div>
                ${i < arr.length - 1 ? '<div style="width:18px;height:2px;background:rgba(247,166,79,0.3);flex-shrink:0"></div>' : ''}
              </div>`).join('')}
          </div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.6">Le flux complet de PlaqPro+ : du calcul des matériaux à l'envoi du devis signé — en 6 étapes guidées.</div>
          <div style="margin-top:12px;font-size:12px;color:#F7A64F;font-weight:600">Voir le guide complet → 6 étapes</div>
        </div>
      </div>

      <!-- Stats rapides -->
      <div style="margin-top:22px;padding:16px 20px;background:var(--bg-secondary);border-radius:12px;display:flex;gap:24px;flex-wrap:wrap;align-items:center">
        <div style="font-size:13px;color:var(--text-tertiary)">Votre avancement :</div>
        ${this._buildProgressStats()}
      </div>
    `;
    return d;
  },

  _buildProgressStats() {
    const clients  = (DB.clients  || []).length;
    const chantiers= (DB.chantiers|| []).length;
    const devis    = (DB.devis    || []).length;
    const config   = localStorage.getItem('plaqpro_config');
    let cfg = {}; try { cfg = JSON.parse(config||'{}'); } catch{}
    const configured = !!(cfg.nom || cfg.nomEntreprise);
    const stats = [
      { label: 'Config', ok: configured, page: 'config' },
      { label: 'Clients', ok: clients > 0, val: clients, page: 'clients' },
      { label: 'Chantiers', ok: chantiers > 0, val: chantiers, page: 'chantiers' },
      { label: 'Devis', ok: devis > 0, val: devis, page: 'devis' },
    ];
    return stats.map(s => `
      <div onclick="App.navigate('${s.page}')" style="cursor:pointer;text-align:center">
        <div style="font-size:20px">${s.ok ? '✅' : '⬜'}</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${s.label}${s.val !== undefined ? ' ('+s.val+')' : ''}</div>
      </div>`).join('');
  },

  // ── Onglet Guides ─────────────────────────────────────────
  _buildGuides() {
    const d = document.createElement('div');
    if (this._guide) {
      d.appendChild(this._buildGuideDetail(this._guide));
    } else {
      d.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
          ${Object.entries(this.GUIDES).map(([key, g]) => `
            <div class="aide-guide-card" onclick="Aide._openGuide('${key}')" style="border-top:3px solid ${g.color}">
              <div style="font-size:32px;margin-bottom:10px">${g.titre.split(' ')[0]}</div>
              <div style="font-size:16px;font-weight:800;color:var(--text-primary);margin-bottom:8px">${g.titre}</div>
              <div style="font-size:13px;color:var(--text-tertiary)">${g.etapes.length} étape${g.etapes.length>1?'s':''}</div>
              <div style="margin-top:14px;color:${g.color};font-size:13px;font-weight:600">Démarrer →</div>
            </div>`).join('')}
        </div>`;
    }
    return d;
  },

  _openGuide(key) {
    this._guide = key;
    this._step  = 0;
    const c = document.getElementById('aide-content');
    if (!c) return;
    c.innerHTML = '';
    c.appendChild(this._buildGuideDetail(key));
  },

  _buildGuideDetail(key) {
    const g = this.GUIDES[key];
    const d = document.createElement('div');

    const retour = `<button class="btn btn-secondary" onclick="Aide._guide=null;Aide._renderTab()" style="margin-bottom:20px;font-size:13px">← Retour aux guides</button>`;

    const header = `
      <div style="background:linear-gradient(135deg,${g.color}22,${g.color}08);border:1px solid ${g.color}33;border-radius:14px;padding:24px 28px;margin-bottom:22px">
        <div style="font-size:24px;font-weight:900;color:var(--text-primary)">${g.titre}</div>
        <div style="font-size:13px;color:var(--text-tertiary);margin-top:4px">${g.etapes.length} étapes — suivez le guide !</div>
        <!-- Progress bar -->
        <div style="margin-top:16px;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden">
          <div id="aide-guide-progress" style="height:100%;background:${g.color};border-radius:2px;width:${Math.round((this._step+1)/g.etapes.length*100)}%;transition:width .4s"></div>
        </div>
      </div>`;

    const stepsHTML = g.etapes.map((e, i) => {
      const active = i === this._step;
      const done   = i < this._step;
      return `
        <div class="aide-step${active?' active':''}${done?' done':''}" id="aide-step-${i}" onclick="Aide._gotoStep(${i})">
          <div class="aide-step-num" style="background:${done?'#2DD4A0':active?g.color:'var(--bg-tertiary)'};color:${done||active?'#fff':'var(--text-tertiary)'}">
            ${done ? '✓' : i+1}
          </div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:${active?'700':'600'};color:${active?'var(--text-primary)':'var(--text-secondary)'}">${e.icon} ${e.titre}</div>
            ${active ? `
              <div style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.6">${e.desc}</div>
              ${e.checklist ? `
                <div style="margin-top:12px;display:flex;flex-direction:column;gap:5px">
                  ${e.checklist.map(item => `
                    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;color:var(--text-secondary)">
                      <input type="checkbox" class="aide-check" onchange="this.parentElement.style.color=this.checked?'#2DD4A0':'var(--text-secondary)'">
                      ${item}
                    </label>`).join('')}
                </div>` : ''}
              ${e.schema ? `
                <div style="margin:14px 0;background:var(--bg-tertiary);border-radius:10px;padding:16px;display:flex;justify-content:center">
                  <svg viewBox="0 0 220 80" style="width:180px;height:auto">
                    <rect x="10" y="10" width="80" height="60" rx="4" fill="none" stroke="#4F8EF7" stroke-width="1.5"/>
                    <line x1="10" y1="10" x2="0" y2="0" stroke="#2DD4A0" stroke-width="1" stroke-dasharray="3,2"/>
                    <line x1="90" y1="10" x2="100" y2="0" stroke="#2DD4A0" stroke-width="1" stroke-dasharray="3,2"/>
                    <text x="50" y="44" text-anchor="middle" font-size="11" fill="#4F8EF7">L × l</text>
                    <text x="50" y="58" text-anchor="middle" font-size="9" fill="#8892AA">surface</text>
                    <line x1="110" y1="40" x2="130" y2="40" stroke="#F7A64F" stroke-width="1.5" marker-end="url(#arr)"/>
                    <text x="150" y="28" text-anchor="middle" font-size="10" fill="#2DD4A0">H</text>
                    <line x1="150" y1="10" x2="150" y2="70" stroke="#2DD4A0" stroke-width="1.5"/>
                    <line x1="143" y1="10" x2="157" y2="10" stroke="#2DD4A0" stroke-width="1"/>
                    <line x1="143" y1="70" x2="157" y2="70" stroke="#2DD4A0" stroke-width="1"/>
                    <text x="180" y="44" text-anchor="middle" font-size="10" fill="#8892AA">→ m²</text>
                  </svg>
                </div>` : ''}
              ${e.anim ? `<div class="aide-anim-mock"></div>` : ''}
              <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-primary" style="font-size:13px" onclick="App.navigate('${e.action.page}')">${e.action.label}</button>
                ${i < g.etapes.length-1 ? `<button class="btn btn-secondary" style="font-size:13px" onclick="Aide._nextStep()">Étape suivante →</button>` : `<button class="btn" style="font-size:13px;background:rgba(45,212,160,0.15);color:#2DD4A0;border:1px solid rgba(45,212,160,0.3)" onclick="Aide._guide=null;Aide._renderTab()">✓ Guide terminé !</button>`}
              </div>` : ''}
          </div>
        </div>`;
    }).join('');

    d.innerHTML = retour + header + `<div style="display:flex;flex-direction:column;gap:6px">${stepsHTML}</div>`;
    return d;
  },

  _gotoStep(i) {
    this._step = i;
    const c = document.getElementById('aide-content');
    if (!c) return;
    c.innerHTML = '';
    c.appendChild(this._buildGuideDetail(this._guide));
  },

  _nextStep() {
    const g = this.GUIDES[this._guide];
    if (this._step < g.etapes.length - 1) this._gotoStep(this._step + 1);
  },

  // ── Onglet Fonctionnalités ────────────────────────────────
  _buildFonctionnalites() {
    const niveaux = { easy: { label: 'Facile', color: '#2DD4A0', bg: 'rgba(45,212,160,0.12)' }, medium: { label: 'Intermédiaire', color: '#F7A64F', bg: 'rgba(247,166,79,0.12)' }, hard: { label: 'Avancé', color: '#F472B6', bg: 'rgba(244,114,182,0.12)' } };
    const d = document.createElement('div');

    const cardsHTML = this.FONCTIONNALITES.map(f => {
      const nv = niveaux[f.niveau] || niveaux.easy;
      const action = f.page
        ? `App.navigate('${f.page}')`
        : (f.action || 'void 0');
      return `
        <div class="aide-feat-card">
          <div style="font-size:36px;margin-bottom:10px">${f.icon}</div>
          <div style="font-size:14px;font-weight:800;color:var(--text-primary);margin-bottom:5px">${f.nom}</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.5;flex:1">${f.desc}</div>
          <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
            <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${nv.bg};color:${nv.color};font-weight:600">${nv.label}</span>
            <button class="btn btn-primary" style="font-size:11px;padding:5px 10px" onclick="${action}">Essayer →</button>
          </div>
        </div>`;
    }).join('');

    d.innerHTML = `
      <div style="margin-bottom:14px;font-size:13px;color:var(--text-secondary)">${this.FONCTIONNALITES.length} fonctionnalités disponibles dans PlaqPro+</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px">
        ${cardsHTML}
      </div>`;
    return d;
  },

  // ── Onglet FAQ ────────────────────────────────────────────
  _buildFAQ() {
    const d = document.createElement('div');
    d.innerHTML = `
      <div style="max-width:760px">
        <div style="font-size:14px;color:var(--text-secondary);margin-bottom:18px">Les réponses aux questions les plus fréquentes des artisans.</div>
        <div id="aide-faq-list" style="display:flex;flex-direction:column;gap:8px">
          ${this.FAQ.map((item, i) => `
            <div class="aide-faq-item" id="aide-faq-${i}">
              <button class="aide-faq-q" onclick="Aide._toggleFAQ(${i})">
                <span>❓ ${item.q}</span>
                <span class="aide-faq-arrow" id="aide-faq-arrow-${i}">▸</span>
              </button>
              <div class="aide-faq-a" id="aide-faq-a-${i}" style="display:none">
                <p>${item.a}</p>
                ${item.page ? `<button class="btn btn-secondary" style="font-size:12px;margin-top:6px" onclick="App.navigate('${item.page}')">Voir la fonctionnalité →</button>` : ''}
              </div>
            </div>`).join('')}
        </div>
        <div style="margin-top:28px;padding:16px 20px;background:rgba(79,142,247,0.06);border:1px solid rgba(79,142,247,0.15);border-radius:10px;font-size:13px;color:var(--text-secondary)">
          💬 Vous avez une autre question ? Utilisez l'<strong style="color:var(--text-primary)">Assistant IA</strong> (bouton 🤖 en bas à droite) — il répond 24h/24 !
        </div>
      </div>`;
    return d;
  },

  _toggleFAQ(i) {
    const body  = document.getElementById('aide-faq-a-' + i);
    const arrow = document.getElementById('aide-faq-arrow-' + i);
    const item  = document.getElementById('aide-faq-' + i);
    if (!body) return;
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : '';
    if (arrow) arrow.textContent = open ? '▸' : '▾';
    if (item)  item.classList.toggle('open', !open);
  },

  // ── Aide contextuelle (bouton ❓ par page) ────────────────
  _injectContextHelp() {
    if (document.getElementById('aide-ctx-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'aide-ctx-btn';
    btn.innerHTML = '❓';
    btn.title = 'Aide sur cette page';
    btn.style.cssText = 'position:fixed;bottom:100px;right:28px;z-index:8900;width:40px;height:40px;border-radius:50%;background:rgba(79,142,247,0.15);border:1px solid rgba(79,142,247,0.35);color:#4F8EF7;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .25s;backdrop-filter:blur(6px)';
    btn.onmouseenter = () => { btn.style.transform = 'scale(1.12)'; btn.style.background = 'rgba(79,142,247,0.28)'; };
    btn.onmouseleave = () => { btn.style.transform = 'scale(1)'; btn.style.background = 'rgba(79,142,247,0.15)'; };
    btn.onclick = () => this._showContextModal();
    document.body.appendChild(btn);
  },

  _showContextModal() {
    const page = App._currentPage || '';
    const tips  = this.AIDE_CONTEXTUELLE[page];
    const body  = document.createElement('div');
    body.style.cssText = 'display:flex;flex-direction:column;gap:10px';

    if (!tips || !tips.length) {
      body.innerHTML = `<div style="color:var(--text-secondary);font-size:13px">Explorez cette page — toutes les actions sont accessibles via les boutons visibles.</div>`;
    } else {
      tips.forEach((t, i) => {
        const el = document.createElement('div');
        el.style.cssText = 'display:flex;gap:10px;align-items:flex-start;padding:10px 12px;background:var(--bg-tertiary);border-radius:8px';
        el.innerHTML = `<span style="font-size:18px;flex-shrink:0;margin-top:-1px">${['💡','🎯','⚡','✨'][i%4]}</span><span style="font-size:13px;color:var(--text-secondary);line-height:1.5">${t}</span>`;
        body.appendChild(el);
      });
    }

    const footer = `<button class="btn btn-primary" style="font-size:13px" onclick="App.closeModal();App.navigate('aide')">📖 Guide complet</button>`;
    App.openModal('💡 Conseils — ' + (document.getElementById('topbar-title')?.textContent || 'cette page'), body, footer);
  },

  // ── Visite guidée premier login ───────────────────────────
  _checkFirstLogin() {
    if (localStorage.getItem('plaqpro_first_login') === 'done') return;
    setTimeout(() => this._startTour(), 1200);
  },

  _tourSteps: [
    { selector: '.sidebar',       text: 'Voici le menu principal →\nToutes les fonctionnalités sont ici.',   pos: 'right' },
    { selector: '.stats-grid',    text: 'Vos stats en temps réel ↑\nCA, devis, chantiers…',                  pos: 'bottom' },
    { selector: '[data-page="clients"]', text: 'Créez votre premier client ici →', pos: 'right' },
    { selector: '[data-page="calculateur"]', text: 'Calcul Express ⚡\nVotre outil principal →',             pos: 'right' },
    { selector: '#ia-fab-btn',    text: 'Assistant IA disponible 24h/24 ↓\nPosez vos questions ici !',      pos: 'top' },
  ],

  _tourIndex: 0,

  _startTour() {
    this._tourIndex = 0;
    this._showTourStep();
  },

  _showTourStep() {
    this._removeTourOverlay();
    const steps = this._tourSteps;
    const i     = this._tourIndex;
    if (i >= steps.length) { this._endTour(); return; }

    const s   = steps[i];
    const el  = document.querySelector(s.selector);

    const overlay = document.createElement('div');
    overlay.id = 'aide-tour-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99000;pointer-events:none';

    // Fond semi-transparent
    const bg = document.createElement('div');
    bg.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.55);pointer-events:all';
    bg.onclick = () => {};
    overlay.appendChild(bg);

    // Bulle info
    const bubble = document.createElement('div');
    bubble.style.cssText = 'position:fixed;background:#1a1d27;border:1px solid rgba(79,142,247,0.4);border-radius:14px;padding:18px 20px;max-width:260px;z-index:99001;pointer-events:all;box-shadow:0 8px 32px rgba(0,0,0,0.6)';

    // Positionner la bulle
    if (el) {
      const r = el.getBoundingClientRect();
      if (s.pos === 'right')  { bubble.style.left = (r.right + 14) + 'px'; bubble.style.top  = (r.top + r.height/2 - 60) + 'px'; }
      if (s.pos === 'bottom') { bubble.style.top  = (r.bottom + 14) + 'px'; bubble.style.left = (r.left + r.width/2 - 130) + 'px'; }
      if (s.pos === 'top')    { bubble.style.bottom = (window.innerHeight - r.top + 14) + 'px'; bubble.style.left = (r.left - 60) + 'px'; }
    } else {
      bubble.style.top = '50%'; bubble.style.left = '50%'; bubble.style.transform = 'translate(-50%,-50%)';
    }

    bubble.innerHTML = `
      <div style="font-size:13px;color:var(--text-primary);white-space:pre-line;line-height:1.6;margin-bottom:14px">${s.text}</div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button onclick="Aide._endTour()" style="font-size:12px;padding:5px 10px;background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--text-tertiary);cursor:pointer">Passer</button>
        <button onclick="Aide._nextTourStep()" style="font-size:12px;padding:5px 14px;background:var(--accent);border:none;border-radius:6px;color:#fff;cursor:pointer;font-weight:600">${i < steps.length-1 ? 'Suivant →' : 'Terminer ✓'}</button>
      </div>
      <div style="font-size:11px;color:var(--text-tertiary);margin-top:8px;text-align:center">${i+1} / ${steps.length}</div>`;

    overlay.appendChild(bubble);

    // Highlight l'élément ciblé si trouvé
    if (el) {
      const r = el.getBoundingClientRect();
      const hl = document.createElement('div');
      hl.style.cssText = `position:fixed;left:${r.left-4}px;top:${r.top-4}px;width:${r.width+8}px;height:${r.height+8}px;border:2px solid #4F8EF7;border-radius:8px;box-shadow:0 0 0 4000px rgba(0,0,0,0.55);z-index:99000;pointer-events:none;animation:aide-pulse 1.5s infinite`;
      overlay.insertBefore(hl, bg);
    }

    document.body.appendChild(overlay);
  },

  _nextTourStep() {
    this._tourIndex++;
    this._showTourStep();
  },

  _endTour() {
    this._removeTourOverlay();
    localStorage.setItem('plaqpro_first_login', 'done');
  },

  _removeTourOverlay() {
    const old = document.getElementById('aide-tour-overlay');
    if (old) old.remove();
  },

  // ── Styles ────────────────────────────────────────────────
  _injectStyles() {
    if (document.getElementById('aide-styles')) return;
    const s = document.createElement('style');
    s.id = 'aide-styles';
    s.textContent = `
      .aide-tab { flex:1; min-width:120px; padding:9px 14px; background:transparent; border:none; color:var(--text-secondary); font-size:13px; font-weight:600; cursor:pointer; border-radius:9px; transition:all .2s; }
      .aide-tab:hover { color:var(--text-primary); background:rgba(255,255,255,0.04); }
      .aide-tab.active { background:var(--bg-primary); color:var(--accent); box-shadow:0 1px 6px rgba(0,0,0,0.25); }
      .aide-parcours-card { background:var(--bg-secondary); border:1px solid var(--border); border-radius:16px; padding:24px; cursor:pointer; transition:all .25s; }
      .aide-parcours-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.25); border-color:rgba(79,142,247,0.4); }
      .aide-guide-card { background:var(--bg-secondary); border:1px solid var(--border); border-radius:14px; padding:22px; cursor:pointer; transition:all .25s; }
      .aide-guide-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.2); }
      .aide-step { display:flex; gap:14px; padding:14px 16px; border-radius:10px; cursor:pointer; transition:all .2s; border:1px solid transparent; }
      .aide-step:hover { background:rgba(255,255,255,0.02); }
      .aide-step.active { background:var(--bg-secondary); border-color:rgba(79,142,247,0.25); }
      .aide-step.done { opacity:.7; }
      .aide-step-num { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; margin-top:1px; }
      .aide-check { width:15px; height:15px; accent-color:#2DD4A0; cursor:pointer; }
      .aide-anim-mock { margin:14px 0; height:60px; background:linear-gradient(90deg,rgba(79,142,247,0.08) 25%,rgba(79,142,247,0.18) 50%,rgba(79,142,247,0.08) 75%); background-size:200% 100%; border-radius:8px; animation:aide-shimmer 1.8s infinite; }
      @keyframes aide-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      .aide-feat-card { background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px; padding:18px; display:flex; flex-direction:column; transition:all .22s; }
      .aide-feat-card:hover { border-color:rgba(79,142,247,0.3); transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,0.2); }
      .aide-faq-item { border:1px solid var(--border); border-radius:10px; overflow:hidden; transition:border-color .2s; }
      .aide-faq-item.open { border-color:rgba(79,142,247,0.3); }
      .aide-faq-q { width:100%; display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:transparent; border:none; color:var(--text-primary); font-size:13px; font-weight:600; cursor:pointer; text-align:left; gap:10px; }
      .aide-faq-q:hover { background:rgba(255,255,255,0.02); }
      .aide-faq-arrow { color:var(--text-tertiary); flex-shrink:0; font-size:12px; }
      .aide-faq-a { padding:0 16px 14px; font-size:13px; color:var(--text-secondary); line-height:1.6; }
      .aide-faq-a p { margin:0; }
      .aide-hero-bg { position:absolute; inset:0; background:radial-gradient(ellipse at 80% 20%,rgba(79,142,247,0.08),transparent 60%),radial-gradient(ellipse at 20% 80%,rgba(167,139,250,0.08),transparent 60%); pointer-events:none; }
      @keyframes aide-pulse { 0%,100%{box-shadow:0 0 0 4000px rgba(0,0,0,0.55),0 0 0 2px #4F8EF7} 50%{box-shadow:0 0 0 4000px rgba(0,0,0,0.55),0 0 0 4px rgba(79,142,247,0.6)} }
    `;
    document.head.appendChild(s);
  },
};

// ── Initialisation globale ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Aide._injectStyles();
  Aide._injectContextHelp();
  Aide._checkFirstLogin();
});
