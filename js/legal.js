/**
 * PlaqPro+ — Module Documents Légaux
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits réservés
 */

Pages.legal = function(section) {
  const div = document.createElement('div');
  section = section || 'cgv';

  if (!document.getElementById('style-legal')) {
    const s = document.createElement('style');
    s.id = 'style-legal';
    s.textContent = `
      .legal-hero { background: linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%);
        border-radius: var(--radius-lg); padding: 28px; margin-bottom: 24px; }
      .legal-hero h1 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
      .legal-hero p { font-size: 13px; color: var(--text-tertiary); }
      .legal-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
      .legal-tab { padding: 7px 16px; border-radius: 980px; font-size: 12px; font-weight: 600;
        border: 1px solid var(--border); background: var(--bg-secondary);
        color: var(--text-secondary); cursor: pointer; transition: all .15s; }
      .legal-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
      .legal-content { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 32px; line-height: 1.75; }
      .legal-content h2 { font-size: 16px; font-weight: 700; color: var(--accent);
        margin: 24px 0 10px; padding-bottom: 6px;
        border-bottom: 1px solid var(--border); }
      .legal-content h2:first-child { margin-top: 0; }
      .legal-content h3 { font-size: 13px; font-weight: 700; color: var(--text-primary);
        margin: 16px 0 6px; }
      .legal-content p { font-size: 13px; color: var(--text-secondary);
        margin-bottom: 10px; font-weight: 300; }
      .legal-content ul { margin: 8px 0 12px 20px; }
      .legal-content li { font-size: 13px; color: var(--text-secondary);
        margin-bottom: 4px; font-weight: 300; }
      .legal-note { background: rgba(245,158,11,0.08); border-left: 3px solid #f59e0b;
        padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 14px 0;
        font-size: 12px; color: var(--text-secondary); font-style: italic; }
      .legal-note.blue { background: rgba(79,142,247,0.08); border-color: var(--accent); }
      .legal-note.red { background: rgba(239,68,68,0.08); border-color: #ef4444; }
      .legal-note.green { background: rgba(16,185,129,0.08); border-color: #10b981; }
      .legal-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
      .legal-table th { background: var(--accent); color: #fff; padding: 8px 10px; text-align: left; }
      .legal-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); color: var(--text-secondary); }
      .legal-table tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
    `;
    document.head.appendChild(s);
  }

  const SECTIONS = [
    { key: 'cgv', label: '⚖️ CGV' },
    { key: 'cgu', label: '📋 CGU' },
    { key: 'confidentialite', label: '🔒 Confidentialité' },
    { key: 'mentions', label: '📢 Mentions légales' },
    { key: 'cookies', label: '🍪 Cookies' },
    { key: 'ia', label: '🤖 IA & AI Act' },
    { key: 'rgpd', label: '📊 RGPD' },
  ];

  const CONTENT = {
    cgv: `
      <h2>Conditions Générales de Vente</h2>
      <p style="color:var(--text-tertiary);font-style:italic;margin-bottom:20px">Applicables à compter du 1er juin 2026 — Logiciel SaaS PlaqPro+</p>
      <div class="legal-note">⚠️ Document soumis au droit français. À faire valider par un avocat avant tout usage commercial.</div>
      <h2>Article 1 — Objet</h2>
      <p>Les présentes CGV régissent les relations contractuelles entre <strong>Gabriel Khamassi</strong> (Saint-Priest, 69, France) — éditeur de PlaqPro+ — et tout utilisateur souscrivant à un abonnement.</p>
      <h2>Article 2 — Service</h2>
      <p>PlaqPro+ est un logiciel SaaS de gestion pour artisans BTP incluant : devis IA, facturation Factur-X 2026, outils de calcul technique, prospection IA, gestion sous-traitants.</p>
      <div class="legal-note blue">ℹ️ PlaqPro+ est un outil d'aide à la décision. Les calculs et suggestions IA sont indicatifs et ne constituent pas un avis technique certifié.</div>
      <h2>Article 3 — Tarifs</h2>
      <table class="legal-table">
        <thead><tr><th>Plan</th><th>Prix</th><th>Fonctionnalités</th></tr></thead>
        <tbody>
          <tr><td><strong>Découverte</strong></td><td>0€/mois</td><td>Fonctions de base, IA limitée (5 req/mois)</td></tr>
          <tr><td><strong>Pro</strong></td><td>29€ HT/mois</td><td>Tout illimité, IA, 8 outils techniques — Prix de lancement</td></tr>
          <tr><td><strong>Équipe</strong></td><td>69€ HT/mois</td><td>Plan Pro + 5 utilisateurs</td></tr>
        </tbody>
      </table>
      <h2>Article 4 — Paiement</h2>
      <p>Paiement traité par <strong>Stripe</strong> (Stripe Payments Europe, Ltd). Aucune donnée bancaire stockée par PlaqPro+. Prélèvement mensuel automatique.</p>
      <h2>Article 5 — Période d'essai</h2>
      <p><strong>10 jours d'essai Pro gratuits</strong> à l'inscription. Aucune carte requise. Bascule automatique sur plan Découverte à l'issue.</p>
      <h2>Article 6 — Droit de rétractation</h2>
      <p>14 jours calendaires (art. L221-18 Code conso) pour les consommateurs. Contact : [EMAIL CONTACT].</p>
      <h2>Article 7 — Résiliation</h2>
      <ul>
        <li>Par l'abonné : à tout moment depuis Mon Compte, effective fin de période</li>
        <li>Données conservées 30 jours puis supprimées (export possible)</li>
      </ul>
      <h2>Article 8 — Responsabilité</h2>
      <p>Responsabilité limitée aux sommes versées lors des 3 derniers mois. PlaqPro+ n'est pas responsable des décisions prises sur la base des suggestions IA.</p>
      <h2>Article 9 — Propriété intellectuelle</h2>
      <p>Copyright © 2026 Gabriel Khamassi — Tous droits réservés. Dépôt APP et marque INPI en cours.</p>
      <h2>Article 10 — Loi applicable</h2>
      <p>Droit français. Tribunal compétent : Lyon (69).</p>
    `,
    cgu: `
      <h2>Conditions Générales d'Utilisation</h2>
      <p style="color:var(--text-tertiary);font-style:italic;margin-bottom:20px">Applicables à tous les utilisateurs de PlaqPro+</p>
      <h2>Article 1 — Acceptation</h2>
      <p>L'utilisation de PlaqPro+ implique l'acceptation des présentes CGU. L'utilisateur déclare avoir la capacité juridique et être âgé d'au moins 18 ans.</p>
      <h2>Article 2 — Accès</h2>
      <ul>
        <li>Un compte par utilisateur (sauf plan Équipe)</li>
        <li>Confidentialité des identifiants sous responsabilité de l'utilisateur</li>
        <li>Signalement immédiat en cas d'utilisation non autorisée</li>
      </ul>
      <h2>Article 3 — Utilisation autorisée</h2>
      <p>Usage exclusivement professionnel dans le secteur BTP. Interdiction d'utilisation frauduleuse, de reproduction du logiciel, ou de contournement des mesures de sécurité.</p>
      <h2>Article 4 — Intelligence Artificielle</h2>
      <div class="legal-note red">⚠️ Clause AI Act (UE) 2024/1689 : Les fonctionnalités IA sont des outils d'aide à la décision. L'utilisateur reste seul responsable des décisions prises.</div>
      <ul>
        <li>Suggestions IA indicatives et non certifiées</li>
        <li>L'IA peut produire des erreurs ou hallucinations</li>
        <li>Les alertes DTU ne se substituent pas aux textes normatifs officiels</li>
      </ul>
      <h2>Article 5 — Données</h2>
      <p>Les données métier sont stockées localement sur l'appareil de l'utilisateur. PlaqPro+ n'y a pas accès. L'utilisateur est responsable de ses sauvegardes.</p>
      <h2>Article 6 — Sanctions</h2>
      <p>Tout manquement peut entraîner la suspension immédiate du compte sans préjudice de toute action en justice.</p>
    `,
    confidentialite: `
      <h2>Politique de Confidentialité</h2>
      <p style="color:var(--text-tertiary);font-style:italic;margin-bottom:20px">Conformément au RGPD (UE) 2016/679 et à la Loi Informatique et Libertés</p>
      <h2>Responsable du traitement</h2>
      <p><strong>Gabriel Khamassi</strong> — Saint-Priest (69) — France<br>Email : [À COMPLÉTER] — SIRET : [À COMPLÉTER]</p>
      <h2>Données collectées</h2>
      <table class="legal-table">
        <thead><tr><th>Catégorie</th><th>Données</th><th>Base légale</th><th>Durée</th></tr></thead>
        <tbody>
          <tr><td>Compte</td><td>Nom, email, téléphone, SIRET</td><td>Contrat</td><td>Abonnement + 3 ans</td></tr>
          <tr><td>Données métier</td><td>Clients, chantiers, devis (locales)</td><td>Contrat</td><td>Contrôle utilisateur</td></tr>
          <tr><td>Facturation</td><td>Historique paiements (Stripe)</td><td>Obligation légale</td><td>10 ans</td></tr>
          <tr><td>Technique</td><td>Logs connexion, IP</td><td>Intérêt légitime</td><td>12 mois</td></tr>
          <tr><td>API IA</td><td>Textes requêtes Groq</td><td>Consentement</td><td>Selon Groq</td></tr>
        </tbody>
      </table>
      <div class="legal-note red">🔴 API IA : Si vous configurez une clé Groq, vos textes transitent par les serveurs de Groq Inc. (USA). Ne pas inclure de données personnelles identifiables dans les requêtes IA.</div>
      <h2>Vos droits RGPD</h2>
      <ul>
        <li><strong>Accès</strong> — obtenir une copie de vos données</li>
        <li><strong>Rectification</strong> — corriger vos données</li>
        <li><strong>Effacement</strong> — supprimer vos données (droit à l'oubli)</li>
        <li><strong>Portabilité</strong> — export JSON disponible dans Mon Compte</li>
        <li><strong>Opposition</strong> — s'opposer au traitement</li>
      </ul>
      <p>Contact : [EMAIL CONTACT] — Réponse sous 30 jours. Réclamation : <a href="https://www.cnil.fr" target="_blank" style="color:var(--accent)">www.cnil.fr</a></p>
      <h2>Destinataires</h2>
      <ul>
        <li>Stripe Payments Europe (Irlande, UE) — paiements</li>
        <li>Groq Inc. (USA) — API IA si configurée</li>
        <li>GitHub / Microsoft (USA) — hébergement code</li>
        <li>Aucune vente de données à des tiers</li>
      </ul>
    `,
    mentions: `
      <h2>Mentions Légales</h2>
      <p style="color:var(--text-tertiary);font-style:italic;margin-bottom:20px">Conformément à la Loi n°2004-575 du 21 juin 2004 (LCEN)</p>
      <h2>Éditeur</h2>
      <p><strong>Gabriel Khamassi</strong><br>
      Artisan du bâtiment — Plaquiste<br>
      Saint-Priest (69) — France<br>
      SIRET : [À COMPLÉTER]<br>
      Email : [À COMPLÉTER]<br>
      Téléphone : [À COMPLÉTER]</p>
      <h2>Directeur de la publication</h2>
      <p>Gabriel Khamassi</p>
      <h2>Hébergement</h2>
      <p>GitHub Pages — Microsoft Corporation<br>
      88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis<br>
      https://pages.github.com</p>
      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble du contenu de PlaqPro+ (code source, interface, algorithmes, marque) est protégé par le droit d'auteur et appartient exclusivement à <strong>Gabriel Khamassi</strong>.</p>
      <p><strong>Copyright © 2026 Gabriel Khamassi — Tous droits réservés</strong><br>
      Dépôt APP (Agence pour la Protection des Programmes) : en cours<br>
      Marque PlaqPro+ — Dépôt INPI classe 42 : en cours</p>
      <p>Toute reproduction, copie ou distribution sans autorisation écrite est interdite et constitue une contrefaçon passible de sanctions pénales (art. L335-2 et s. CPI).</p>
      <h2>Droit applicable</h2>
      <p>Droit français. Tribunal compétent : Lyon (69).</p>
    `,
    cookies: `
      <h2>Politique Cookies & Traceurs</h2>
      <p style="color:var(--text-tertiary);font-style:italic;margin-bottom:20px">Conformément à la directive ePrivacy et aux recommandations CNIL</p>
      <div class="legal-note green">✅ PlaqPro+ n'utilise aucun cookie tiers de tracking ou publicitaire. Toutes les données sont stockées localement sur votre appareil.</div>
      <h2>Cookies utilisés</h2>
      <table class="legal-table">
        <thead><tr><th>Nom</th><th>Type</th><th>Finalité</th><th>Durée</th></tr></thead>
        <tbody>
          <tr><td>plaqpro_session</td><td>sessionStorage</td><td>Authentification</td><td>8h</td></tr>
          <tr><td>plaqpro_config</td><td>localStorage</td><td>Configuration entreprise</td><td>Indéfinie</td></tr>
          <tr><td>plaqpro_clients/chantiers/devis/factures</td><td>localStorage</td><td>Données métier</td><td>Indéfinie</td></tr>
          <tr><td>plaqpro_groq_key</td><td>localStorage</td><td>Clé API IA (optionnelle)</td><td>Indéfinie</td></tr>
          <tr><td>plaqpro_onboarding_done</td><td>localStorage</td><td>État onboarding</td><td>Indéfinie</td></tr>
        </tbody>
      </table>
      <h2>Cookies strictement nécessaires</h2>
      <p>Ces cookies sont strictement nécessaires au fonctionnement de PlaqPro+. Conformément aux recommandations CNIL, ils ne nécessitent pas de consentement préalable.</p>
      <h2>Gestion et suppression</h2>
      <ul>
        <li>Exporter vos données : Mon Compte → Exporter mes données (JSON)</li>
        <li>Supprimer toutes les données : paramètres navigateur → vider le localStorage</li>
        <li>Bloquer les cookies : possible via les paramètres navigateur</li>
      </ul>
    `,
    ia: `
      <h2>Disclaimer IA — AI Act Européen</h2>
      <p style="color:var(--text-tertiary);font-style:italic;margin-bottom:20px">Conformément au Règlement (UE) 2024/1689 sur l'Intelligence Artificielle</p>
      <div class="legal-note red">🔴 AVERTISSEMENT OBLIGATOIRE : Les fonctionnalités IA de PlaqPro+ sont des systèmes d'aide à la décision. Toute décision reste sous l'entière responsabilité de l'utilisateur.</div>
      <h2>Nature du système IA</h2>
      <p>PlaqPro+ intègre l'API Groq (modèle llama-3.3-70b) pour :</p>
      <ul>
        <li>Génération automatique de devis depuis une description textuelle</li>
        <li>Analyse de documents CCTP/DPGF (appels d'offres)</li>
        <li>Assistant métier (questions/réponses techniques)</li>
        <li>Suggestions et alertes DTU</li>
      </ul>
      <h2>Limites et risques</h2>
      <ul>
        <li><strong>Hallucinations :</strong> l'IA peut générer des informations inexactes</li>
        <li><strong>Erreurs techniques :</strong> les calculs doivent être vérifiés avant usage</li>
        <li><strong>DTU :</strong> les alertes sont indicatives — consulter les DTU officiels</li>
        <li><strong>Appels d'offres :</strong> l'analyse IA ne remplace pas la lecture du DCE</li>
        <li><strong>Réglementation :</strong> les règles peuvent ne pas être à jour</li>
      </ul>
      <h2>Transparence (AI Act)</h2>
      <ul>
        <li>Toute interaction IA est signalée clairement dans l'interface</li>
        <li>Les réponses générées par IA sont identifiées comme telles</li>
        <li>Aucun contenu IA n'est présenté comme une certification</li>
      </ul>
      <h2>Exclusion de responsabilité</h2>
      <p>Gabriel Khamassi / PlaqPro+ décline toute responsabilité pour les préjudices résultant de l'utilisation des fonctionnalités IA : erreurs dans les devis, mauvaise interprétation des AO, non-conformité réglementaire, pertes financières.</p>
    `,
    rgpd: `
      <h2>Registre des Traitements RGPD</h2>
      <p style="color:var(--text-tertiary);font-style:italic;margin-bottom:20px">Conformément à l'article 30 du RGPD (UE) 2016/679 — Document interne</p>
      <div class="legal-note">⚠️ Document à usage interne — à présenter à la CNIL sur demande.</div>
      <h2>Responsable du traitement</h2>
      <p>Gabriel Khamassi — Saint-Priest (69) — [EMAIL] — [SIRET]</p>
      <h2>Registre des activités</h2>
      <table class="legal-table">
        <thead><tr><th>Traitement</th><th>Finalité</th><th>Base légale</th><th>Destinataires</th><th>Durée</th></tr></thead>
        <tbody>
          <tr><td>Comptes</td><td>Accès service</td><td>Contrat</td><td>Éditeur</td><td>Abonnement + 3 ans</td></tr>
          <tr><td>Facturation</td><td>Paiements</td><td>Contrat + loi</td><td>Stripe (UE)</td><td>10 ans</td></tr>
          <tr><td>Support</td><td>Assistance</td><td>Intérêt légitime</td><td>Éditeur</td><td>3 ans</td></tr>
          <tr><td>Logs</td><td>Sécurité</td><td>Intérêt légitime</td><td>Éditeur</td><td>12 mois</td></tr>
          <tr><td>API IA</td><td>Fonctionnalités IA</td><td>Consentement</td><td>Groq (USA)</td><td>Selon Groq</td></tr>
        </tbody>
      </table>
      <h2>Mesures de sécurité</h2>
      <ul>
        <li>Transport chiffré HTTPS (TLS 1.3)</li>
        <li>Authentification par session sécurisée (expiration 8h)</li>
        <li>Données métier stockées localement (localStorage)</li>
        <li>Clé API jamais exposée côté serveur</li>
      </ul>
      <h2>Sous-traitants RGPD</h2>
      <table class="legal-table">
        <thead><tr><th>Sous-traitant</th><th>Pays</th><th>Traitement</th><th>Garanties</th></tr></thead>
        <tbody>
          <tr><td>Stripe Payments Europe</td><td>Irlande (UE)</td><td>Paiements</td><td>DPA Stripe, CCT</td></tr>
          <tr><td>GitHub / Microsoft</td><td>USA</td><td>Hébergement code</td><td>CCT Microsoft</td></tr>
          <tr><td>Groq Inc.</td><td>USA</td><td>API IA (optionnel)</td><td>Politique Groq</td></tr>
        </tbody>
      </table>
    `
  };

  div.innerHTML = `
    <div class="legal-hero">
      <h1>⚖️ Documents Légaux & Réglementaires</h1>
      <p>PlaqPro+ — © 2026 Gabriel Khamassi · Version 1.0 · Mai 2026</p>
      <p style="margin-top:8px;font-size:11px;color:#f59e0b">⚠️ Ces documents doivent être validés par un avocat avant tout usage commercial.</p>
    </div>
    <div class="legal-tabs">
      ${SECTIONS.map(s => `
        <button class="legal-tab ${s.key === section ? 'active' : ''}"
          onclick="LEGAL.navigate('${s.key}')">
          ${s.label}
        </button>
      `).join('')}
    </div>
    <div class="legal-content">
      ${CONTENT[section] || '<p>Section non trouvée.</p>'}
    </div>
    <div style="margin-top:16px;text-align:center;font-size:11px;color:var(--text-tertiary)">
      PlaqPro+ · © 2026 Gabriel Khamassi · Saint-Priest (69) · Droit français · Tribunal de Lyon
    </div>
  `;

  window.LEGAL = {
    navigate(sec) {
      const tabs = document.querySelectorAll('.legal-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tabs.forEach(t => {
        if (t.getAttribute('onclick') === "LEGAL.navigate('" + sec + "')") {
          t.classList.add('active');
        }
      });
      const content = document.querySelector('.legal-content');
      if (content) content.innerHTML = CONTENT[sec] || '<p>Section non trouvée.</p>';
    }
  };

  return div;
};
