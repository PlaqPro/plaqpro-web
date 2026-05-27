/**
 * PlaqPro+ — Module Inscription & Qualification Métier
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits réservés
 */

Pages.inscription = function() {
  const div = document.createElement('div');

  if (!document.getElementById('style-inscription')) {
    const s = document.createElement('style');
    s.id = 'style-inscription';
    s.textContent = `
      .insc-hero { background: linear-gradient(135deg, #0A84FF 0%, #7c3aed 100%);
        border-radius: var(--radius-lg); padding: 36px; margin-bottom: 28px;
        text-align: center; color: #fff; }
      .insc-hero h1 { font-size: 26px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.03em; }
      .insc-hero p { font-size: 14px; opacity: .85; line-height: 1.6; }
      .insc-steps { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
      .insc-step { width: 32px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.3); transition: .3s; }
      .insc-step.active { background: #fff; width: 48px; }
      .insc-card { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 28px; max-width: 600px; margin: 0 auto; }
      .insc-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 500; }
      .insc-input { width: 100%; padding: 10px 14px; background: var(--bg-primary);
        border: 1px solid var(--border); border-radius: var(--radius-sm);
        color: var(--text-primary); font-size: 14px; margin-bottom: 14px; }
      .insc-input:focus { outline: none; border-color: var(--accent); }
      .insc-metier-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
      @media(max-width:600px){ .insc-metier-grid { grid-template-columns: repeat(2,1fr); } }
      .insc-metier-btn { padding: 16px 10px; border: 1px solid var(--border);
        border-radius: var(--radius-md); background: var(--bg-primary);
        cursor: pointer; text-align: center; transition: all .2s; }
      .insc-metier-btn:hover { border-color: var(--accent); }
      .insc-metier-btn.selected { border-color: var(--accent);
        background: rgba(79,142,247,0.1); }
      .insc-metier-em { font-size: 28px; display: block; margin-bottom: 6px; }
      .insc-metier-label { font-size: 12px; font-weight: 600; color: var(--text-primary); }
      .insc-pro-badge { background: linear-gradient(135deg, #0A84FF, #7c3aed);
        color: #fff; border-radius: var(--radius-lg); padding: 20px;
        text-align: center; margin-bottom: 20px; }
      .insc-pro-badge h3 { font-size: 18px; font-weight: 800; margin-bottom: 6px; }
      .insc-pro-badge p { font-size: 13px; opacity: .9; }
      .insc-features { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
      .insc-feature { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-secondary); }
      .insc-feature::before { content: '✓'; color: #10b981; font-weight: 700; flex-shrink: 0; }
    `;
    document.head.appendChild(s);
  }

  const METIERS = [
    { key: 'plaquiste',    em: '🧱', label: 'Plaquiste',     features: ['Cloisons BA13', 'DTU 25.41', 'Acoustique Rw', 'Résistance feu'] },
    { key: 'peintre',      em: '🎨', label: 'Peintre',       features: ['Calcul peinture', 'DTU 59.1', 'Surfaces & rendements', 'Sous-couche'] },
    { key: 'macon',        em: '🏗',  label: 'Maçon',         features: ['Pack Maçonnerie', 'Parpaings & béton', 'Enduits', 'Fondations'] },
    { key: 'electricien',  em: '⚡', label: 'Électricien',   features: ['Section câble NF C15-100', 'Tableaux', 'Éclairage', 'Prises'] },
    { key: 'plombier',     em: '🔧', label: 'Plombier',      features: ['Pack Plomberie DTU 60.1', 'Sanitaires', 'Chauffage', 'Évacuation'] },
    { key: 'carreleur',    em: '🔲', label: 'Carreleur',     features: ['Calcul surfaces', 'Colle & joint', 'Opus romain', 'Plinthes'] },
    { key: 'menuisier',    em: '🪵', label: 'Menuisier',     features: ['Linteau Eurocode 2', 'Portes & fenêtres', 'Parquet', 'Escaliers'] },
    { key: 'multi_corps',  em: '🏢', label: 'Multi-corps',   features: ['Tous les packs', 'Devis multi-corps', 'Sous-traitants', 'DPGF'] },
    { key: 'autre',        em: '📋', label: 'Autre',         features: ['Devis & facturation', 'Gestion chantiers', 'Prospection IA', 'Outils'] },
  ];

  let etape = 1;
  let metierSelectionne = null;
  let formData = {};

  function render() {
    div.innerHTML = `
      <div class="insc-hero">
        <h1>🚀 Bienvenue sur PlaqPro+</h1>
        <p>Créez votre profil en 2 minutes et débloquez<br>10 jours Pro offerts selon votre métier</p>
        <div class="insc-steps">
          <div class="insc-step ${etape >= 1 ? 'active' : ''}"></div>
          <div class="insc-step ${etape >= 2 ? 'active' : ''}"></div>
          <div class="insc-step ${etape >= 3 ? 'active' : ''}"></div>
        </div>
      </div>

      <div class="insc-card" id="insc-content">
        ${etape === 1 ? renderEtape1() : etape === 2 ? renderEtape2() : renderEtape3()}
      </div>
    `;
  }

  function renderEtape1() {
    return `
      <div style="font-size:13px;color:var(--text-tertiary);margin-bottom:20px;text-align:center">
        Étape 1/3 — Votre entreprise
      </div>
      <div class="insc-label">Nom de votre entreprise *</div>
      <input class="insc-input" id="insc-nom" placeholder="Dupont Plâtrerie" value="${formData.nom||''}">
      <div class="insc-label">Votre prénom *</div>
      <input class="insc-input" id="insc-prenom" placeholder="Jean" value="${formData.prenom||''}">
      <div class="insc-label">Email professionnel</div>
      <input class="insc-input" id="insc-email" type="email" placeholder="contact@entreprise.fr" value="${formData.email||''}">
      <div class="insc-label">Téléphone</div>
      <input class="insc-input" id="insc-tel" placeholder="06 12 34 56 78" value="${formData.tel||''}">
      <div class="insc-label">Ville</div>
      <input class="insc-input" id="insc-ville" placeholder="Lyon" value="${formData.ville||''}">
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
        <button class="btn btn-primary" onclick="INSC.etape1Suivant()">Suivant →</button>
      </div>
    `;
  }

  function renderEtape2() {
    return `
      <div style="font-size:13px;color:var(--text-tertiary);margin-bottom:20px;text-align:center">
        Étape 2/3 — Votre métier
      </div>
      <div style="font-size:14px;font-weight:600;margin-bottom:16px;text-align:center">
        Choisissez votre corps de métier principal
      </div>
      <div class="insc-metier-grid">
        ${METIERS.map(m => `
          <button class="insc-metier-btn ${metierSelectionne === m.key ? 'selected' : ''}"
            onclick="INSC.selectionnerMetier('${m.key}')">
            <span class="insc-metier-em">${m.em}</span>
            <span class="insc-metier-label">${m.label}</span>
          </button>
        `).join('')}
      </div>
      <div style="display:flex;gap:10px;justify-content:space-between;margin-top:8px">
        <button class="btn btn-secondary" onclick="INSC.allerEtape(1)">← Retour</button>
        <button class="btn btn-primary" onclick="INSC.etape2Suivant()">Suivant →</button>
      </div>
    `;
  }

  function renderEtape3() {
    const metier = METIERS.find(m => m.key === metierSelectionne);
    return `
      <div style="font-size:13px;color:var(--text-tertiary);margin-bottom:20px;text-align:center">
        Étape 3/3 — Votre offre
      </div>
      <div class="insc-pro-badge">
        <h3>🎁 10 jours Pro offerts !</h3>
        <p>En tant que <strong>${metier ? metier.label : 'artisan'}</strong>, débloquez immédiatement<br>toutes les fonctionnalités de votre métier</p>
      </div>
      ${metier ? `
        <div style="font-size:13px;font-weight:600;margin-bottom:12px">
          ${metier.em} Fonctionnalités débloquées pour ${metier.label} :
        </div>
        <div class="insc-features">
          ${metier.features.map(f => `<div class="insc-feature">${f}</div>`).join('')}
          <div class="insc-feature">Devis IA illimités</div>
          <div class="insc-feature">8 outils techniques + PDF</div>
          <div class="insc-feature">Appels d'offres IA</div>
          <div class="insc-feature">Prospection IA permis</div>
        </div>
      ` : ''}
      <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;font-size:12px;color:var(--text-tertiary);line-height:1.7">
        ✅ Aucune carte requise · Résiliable à tout moment · Données sur votre appareil
      </div>
      <div style="display:flex;gap:10px;justify-content:space-between">
        <button class="btn btn-secondary" onclick="INSC.allerEtape(2)">← Retour</button>
        <button class="btn btn-primary" style="flex:1" onclick="INSC.terminer()">
          🚀 Activer mes 10 jours Pro gratuits →
        </button>
      </div>
    `;
  }

  window.INSC = {
    etape1Suivant() {
      const nom = document.getElementById('insc-nom')?.value.trim();
      const prenom = document.getElementById('insc-prenom')?.value.trim();
      if (!nom) { App.toast('Le nom de votre entreprise est obligatoire', 'error'); return; }
      formData = {
        nom, prenom,
        email: document.getElementById('insc-email')?.value.trim(),
        tel:   document.getElementById('insc-tel')?.value.trim(),
        ville: document.getElementById('insc-ville')?.value.trim(),
      };
      etape = 2;
      render();
    },
    selectionnerMetier(key) {
      metierSelectionne = key;
      render();
    },
    etape2Suivant() {
      if (!metierSelectionne) { App.toast('Choisissez votre corps de métier', 'error'); return; }
      etape = 3;
      render();
    },
    allerEtape(n) {
      etape = n;
      render();
    },
    terminer() {
      const config = DB.getConfig();
      config.nom    = formData.nom;
      config.prenom = formData.prenom;
      config.email  = formData.email;
      config.tel    = formData.tel;
      config.ville  = formData.ville;
      config.metier = metierSelectionne;
      config.proExpire = new Date(Date.now() + 10*24*60*60*1000).toISOString();
      DB.saveConfig(config);
      localStorage.setItem('plaqpro_onboarding_done', '1');
      localStorage.setItem('plaqpro_metier', metierSelectionne);
      localStorage.setItem('plaqpro_pro_expire', config.proExpire);
      if (formData.ville) {
        const cfg = JSON.parse(localStorage.getItem('plaqpro_config')||'{}');
        cfg.ville = formData.ville;
        localStorage.setItem('plaqpro_config', JSON.stringify(cfg));
      }
      // Générer l'ID membre unique
      if (typeof CartePremium !== 'undefined') CartePremium.genererIdMembre();

      // Message de bienvenue avec info carte
      App.toast('🎉 Bienvenue ' + formData.prenom + ' ! Vos 10 jours Pro sont activés !', 'success');

      // Modale de bienvenue avec info carte
      setTimeout(() => {
        const d = document.createElement('div');
        d.innerHTML = `
          <div style="padding:24px;text-align:center">
            <div style="font-size:56px;margin-bottom:16px">🎉</div>
            <div style="font-size:20px;font-weight:800;margin-bottom:8px">
              Bienvenue ${formData.prenom} !
            </div>
            <div style="font-size:14px;color:var(--text-secondary);margin-bottom:20px;line-height:1.6">
              Vos <strong>10 jours Pro offerts</strong> sont activés.<br>
              Profitez de toutes les fonctionnalités PlaqPro+ !
            </div>
            <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460);border-radius:16px;
              padding:20px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.1)">
              <div style="font-size:13px;font-weight:700;color:#f59e0b;margin-bottom:8px;letter-spacing:.05em">
                🎫 VOTRE CARTE ADHÉRENT
              </div>
              <div style="font-size:22px;font-weight:900;margin-bottom:4px">
                <span style="color:#fff">Pla</span><span style="color:#4F8EF7">Q</span><span style="color:#fff">Pro</span><span style="color:#ef4444">+</span>
                <span style="color:#f59e0b;font-size:14px;margin-left:8px">PRO</span>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:12px">
                Avantages négociés • Tarifs partenaires BTP
              </div>
              <div style="background:rgba(255,255,255,0.08);border-radius:10px;padding:12px;
                display:flex;justify-content:space-between;align-items:center">
                <div style="text-align:left">
                  <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px">ADHÉRENT</div>
                  <div style="font-size:13px;font-weight:700;color:#fff">${formData.nom || formData.prenom}</div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px">STATUT</div>
                  <div style="font-size:13px;font-weight:700;color:#10b981">Actif ${new Date().getFullYear()}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px">ID MEMBRE</div>
                  <div style="font-size:13px;font-weight:700;color:#f59e0b">${typeof CartePremium !== 'undefined' ? CartePremium.genererIdMembre() : 'PP+????'}</div>
                </div>
              </div>
            </div>
            <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);
              border-radius:12px;padding:16px;margin-bottom:16px;font-size:13px;
              color:var(--text-secondary);line-height:1.7">
              📬 <strong style="color:#f59e0b">Vous recevrez votre carte par courrier sous quinzaine.</strong><br>
              Elle vous permettra d'obtenir des tarifs négociés chez nos partenaires fournisseurs BTP.
            </div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:16px">
              Contact partenariat : <a href="mailto:partenaire@aa-tb.fr" style="color:var(--accent)">partenaire@aa-tb.fr</a>
            </div>
          </div>
        `;
        App.openModal('🎉 Inscription réussie !', d,
          '<button class="btn btn-primary" onclick="App.closeModal();App.navigate(\'dashboard\')">🚀 Commencer PlaqPro+</button>'
        );
      }, 800);
    }
  };

  render();
  return div;
};
