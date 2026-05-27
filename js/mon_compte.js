/**
 * PlaqPro+ — Module Mon Compte
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits réservés
 */

Pages.monCompte = function() {
  const div = document.createElement('div');
  const config = DB.getConfig();
  const user = JSON.parse(sessionStorage.getItem('plaqpro_session') || '{}');
  const groqKey = localStorage.getItem('plaqpro_groq_key') || '';
  const onboardingFait = localStorage.getItem('plaqpro_onboarding_done') === '1';

  if (!document.getElementById('style-compte')) {
    const s = document.createElement('style');
    s.id = 'style-compte';
    s.textContent = `
      .mc-hero { background: linear-gradient(135deg, #4F8EF7 0%, #7c3aed 100%);
        border-radius: var(--radius-lg); padding: 28px; margin-bottom: 24px; color: #fff;
        display: flex; align-items: center; gap: 20px; }
      .mc-avatar { width: 64px; height: 64px; border-radius: 50%;
        background: rgba(255,255,255,0.2); display: flex; align-items: center;
        justify-content: center; font-size: 28px; flex-shrink: 0; }
      .mc-hero-info h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
      .mc-hero-info p { font-size: 13px; opacity: .8; }
      .mc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media(max-width:768px){ .mc-grid { grid-template-columns: 1fr; } }
      .mc-panel { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 20px; }
      .mc-section { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary); padding-bottom: 8px;
        border-bottom: 1px solid var(--border); margin: 16px 0 12px; }
      .mc-section:first-child { margin-top: 0; }
      .mc-stat { display: flex; justify-content: space-between; align-items: center;
        padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
      .mc-stat:last-child { border: none; }
      .mc-stat-val { font-weight: 700; color: var(--accent); }
      .mc-plan { background: rgba(79,142,247,0.08); border: 1px solid rgba(79,142,247,0.3);
        border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; text-align: center; }
      .mc-plan-name { font-size: 18px; font-weight: 800; color: var(--accent); margin-bottom: 4px; }
      .mc-plan-price { font-size: 32px; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 4px; }
      .mc-plan-desc { font-size: 12px; color: var(--text-tertiary); }
      .mc-badge { display: inline-block; padding: 3px 10px; border-radius: 20px;
        font-size: 11px; font-weight: 700; }
      .mc-badge.ok { background: rgba(16,185,129,.12); color: #10b981; }
      .mc-badge.warn { background: rgba(245,158,11,.12); color: #f59e0b; }
      .mc-input { width: 100%; padding: 8px 12px; background: var(--bg-primary);
        border: 1px solid var(--border); border-radius: var(--radius-sm);
        color: var(--text-primary); font-size: 13px; margin-bottom: 8px; }
      .mc-groq-status { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 12px; }
      .mc-groq-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    `;
    document.head.appendChild(s);
  }

  // Stats utilisateur
  const nbClients  = (DB.clients||[]).length;
  const nbChantiers= (DB.chantiers||[]).length;
  const nbDevis    = (DB.devis||[]).length;
  const nbFactures = (DB.factures||[]).length;
  const caTotal    = (DB.factures||[]).reduce((s,f)=>s+(parseFloat(f.totalHT)||0),0);
  const groqOk     = groqKey.startsWith('gsk_') && groqKey.length > 20;

  div.innerHTML = `
    <div class="mc-hero">
      <div class="mc-avatar">👤</div>
      <div class="mc-hero-info">
        <h1>${user.username || config.nom || 'Mon compte'}</h1>
        <p>${config.nom || 'PlaqPro+'} · ${config.siret ? 'SIRET : ' + config.siret : 'SIRET non renseigné'}</p>
        <p style="margin-top:4px">
          <span class="mc-badge ok">✅ Plan Découverte</span>
          <span style="margin-left:8px;font-size:12px;opacity:.8">Version 2.0 · Mai 2026</span>
        </p>
      </div>
    </div>

    <!-- CARTE PREMIUM -->
    <div id="carte-premium-container" style="margin-bottom:20px"></div>

    <div class="mc-grid">

      <!-- COLONNE GAUCHE -->
      <div>
        <div class="mc-panel">
          <div class="mc-section">📊 Mes statistiques</div>
          <div class="mc-stat"><span>Clients</span><span class="mc-stat-val">${nbClients}</span></div>
          <div class="mc-stat"><span>Chantiers</span><span class="mc-stat-val">${nbChantiers}</span></div>
          <div class="mc-stat"><span>Devis émis</span><span class="mc-stat-val">${nbDevis}</span></div>
          <div class="mc-stat"><span>Factures</span><span class="mc-stat-val">${nbFactures}</span></div>
          <div class="mc-stat"><span>CA total facturé HT</span>
            <span class="mc-stat-val">${new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(caTotal)} €</span>
          </div>
          <div class="mc-stat"><span>Onboarding</span>
            <span class="mc-badge ${onboardingFait?'ok':'warn'}">${onboardingFait?'✅ Complété':'⚠️ En cours'}</span>
          </div>
        </div>

        <div class="mc-panel" style="margin-top:16px">
          <div class="mc-section">🔑 Assistant IA — Clé Groq</div>
          <div class="mc-groq-status">
            <div class="mc-groq-dot" style="background:${groqOk?'#10b981':'#ef4444'}"></div>
            <span>${groqOk ? '✅ Clé configurée et active' : '❌ Clé manquante — IA inactive'}</span>
          </div>
          ${groqOk ? `
            <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:12px">
              Clé : ${groqKey.substring(0,8)}••••••••••••${groqKey.slice(-4)}
            </div>` : `
            <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:12px">
              Obtenez une clé gratuite sur <a href="https://console.groq.com/keys" target="_blank" style="color:var(--accent)">console.groq.com</a>
            </div>`
          }
          <input type="password" class="mc-input" id="mc-groq-input"
            placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
            value="${groqOk ? groqKey : ''}">
          <button class="btn btn-primary btn-sm" onclick="MC.sauvegarderGroq()" style="width:100%">
            🔑 ${groqOk ? 'Mettre à jour la clé' : 'Activer l\'IA'}
          </button>
          <div style="margin-top:8px;font-size:11px;color:var(--text-tertiary)">
            🔒 Stockée localement — jamais transmise
          </div>
        </div>
      </div>

      <!-- COLONNE DROITE -->
      <div>
        <div class="mc-panel">
          <div class="mc-section">💎 Mon abonnement</div>
          <div class="mc-plan">
            <div class="mc-plan-name">Plan Découverte</div>
            <div class="mc-plan-price">0€ <span style="font-size:16px;font-weight:400;color:var(--text-tertiary)">/ mois</span></div>
            <div class="mc-plan-desc">Fonctionnalités de base — IA limitée</div>
          </div>
          <div style="background:rgba(79,142,247,.04);border:1px solid rgba(79,142,247,.2);border-radius:var(--radius-md);padding:14px;margin-bottom:12px">
            <div style="font-size:13px;font-weight:700;margin-bottom:8px">🚀 Passer au plan Pro — 29€/mois</div>
            <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;margin-bottom:10px">
              ✅ IA illimitée — devis auto<br>
              ✅ 8 outils techniques + PDF<br>
              ✅ DPGF & Appels d'offres IA<br>
              ✅ Prospection IA permis<br>
              ✅ Factur-X XML 2026<br>
              ✅ Support prioritaire
            </div>
            <button class="btn btn-primary" style="width:100%" onclick="App.toast('Bientôt disponible — nous vous contacterons !', 'success')">
              💳 Passer Pro — 10 jours gratuits
            </button>
          </div>
          <div style="font-size:11px;color:var(--text-tertiary);text-align:center">
            Sans engagement · Résiliable à tout moment
          </div>
        </div>

        <div class="mc-panel" style="margin-top:16px">
          <div class="mc-section">⚙️ Paramètres rapides</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn-secondary" onclick="App.navigate('config')" style="width:100%;justify-content:flex-start;gap:10px">
              ⚙️ Configuration entreprise
            </button>
            <button class="btn btn-secondary" onclick="Pages.rapportMensuel()" style="width:100%;justify-content:flex-start;gap:10px">
              📊 Rapport mensuel PDF
            </button>
            <button class="btn btn-secondary" onclick="MC.reinitOnboarding()" style="width:100%;justify-content:flex-start;gap:10px">
              👋 Relancer l'onboarding
            </button>
            <button class="btn btn-secondary" onclick="MC.exporterDonnees()" style="width:100%;justify-content:flex-start;gap:10px">
              💾 Exporter mes données (JSON)
            </button>
          </div>

          <div class="mc-section" style="margin-top:20px">⚠️ Zone danger</div>
          <button class="btn" style="width:100%;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);color:#ef4444;justify-content:flex-start;gap:10px"
            onclick="MC.deconnexion()">
            🚪 Se déconnecter
          </button>
        </div>
      </div>
    </div>

    <div style="margin-top:16px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;font-size:12px;color:var(--text-tertiary);line-height:1.8">
      <strong style="color:var(--text-primary)">⚖️ Mentions légales</strong> ·
      PlaqPro+ — © 2026 Gabriel Khamassi · Saint-Priest (69) ·
      Dépôt APP en cours · Marque PlaqPro+ INPI en cours ·
      <span style="color:var(--text-tertiary)">Outil d'aide à la décision — ne constitue pas un avis technique certifié</span>
    </div>
  `;

  setTimeout(() => {}, 50);

  // Afficher la carte premium
  setTimeout(() => {
    if (typeof CartePremium !== 'undefined') {
      CartePremium.afficherDansMonCompte('carte-premium-container');
    }
  }, 100);

  return div;
};

const MC = {
  sauvegarderGroq() {
    const input = document.getElementById('mc-groq-input');
    const cle = (input?.value || '').trim();
    if (!cle.startsWith('gsk_') || cle.length < 20) {
      App.toast('❌ Clé invalide — elle doit commencer par gsk_', 'error');
      return;
    }
    localStorage.setItem('plaqpro_groq_key', cle);
    localStorage.setItem('groq_api_key', cle);
    localStorage.setItem('plaqpro_groq', cle);
    const config = JSON.parse(localStorage.getItem('plaqpro_config') || '{}');
    config.groqApiKey = cle; config.groqKey = cle; config.apiKeyGroq = cle;
    localStorage.setItem('plaqpro_config', JSON.stringify(config));
    App.toast('✅ Clé IA sauvegardée — assistant actif !', 'success');
    App.navigate('monCompte');
  },

  reinitOnboarding() {
    localStorage.removeItem('plaqpro_onboarding_done');
    App.navigate('dashboard');
    App.toast('Onboarding réinitialisé — rechargez le dashboard', 'success');
  },

  exporterDonnees() {
    const data = {
      clients:   DB.clients   || [],
      chantiers: DB.chantiers || [],
      devis:     DB.devis     || [],
      factures:  DB.factures  || [],
      config:    DB.getConfig(),
      export_date: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'plaqpro_export_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    App.toast('✅ Données exportées !', 'success');
  },

  deconnexion() {
    if (!confirm('Se déconnecter de PlaqPro+ ?')) return;
    sessionStorage.removeItem('plaqpro_session');
    window.location.href = 'login.html';
  }
};
