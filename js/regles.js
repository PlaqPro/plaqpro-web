/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO+ — Moteur de Règles Métier / DTU / Qualité / Sécu
//  Version pragmatique 80/20 — règles terrain utiles
// ============================================================

const ReglesEngine = {

  // ── Exécution du moteur ───────────────────────────────────
  executer(metier, type, input) {
    const ctx = { warnings: [], alertes: [], recommandations: [], normes: [], securite: [] };
    const regles = this.REGLES.filter(r =>
      (r.metiers.includes('*') || r.metiers.includes(metier)) &&
      (r.types.includes('*')   || r.types.includes(type))
    );
    regles.forEach(r => { try { r.execute(input, ctx); } catch(e) {} });
    return ctx;
  },

  // ── Rendu HTML des alertes ────────────────────────────────
  renderAlertes(ctx) {
    if (!ctx) return '';
    const total = ctx.warnings.length + ctx.alertes.length +
                  ctx.recommandations.length + ctx.normes.length + ctx.securite.length;
    if (total === 0) return '<div style="color:#10b981;font-size:12px;padding:8px 0">✅ Aucune alerte — paramètres conformes</div>';

    let html = '';
    if (ctx.securite.length)       html += ctx.securite.map(m =>
      `<div style="background:rgba(239,68,68,.12);border-left:3px solid #ef4444;padding:8px 12px;border-radius:0 6px 6px 0;margin-bottom:6px;font-size:12px">
        🔴 <b>SÉCURITÉ</b> — ${m}</div>`).join('');
    if (ctx.alertes.length)        html += ctx.alertes.map(m =>
      `<div style="background:rgba(239,68,68,.08);border-left:3px solid #f97316;padding:8px 12px;border-radius:0 6px 6px 0;margin-bottom:6px;font-size:12px">
        🟠 <b>ALERTE</b> — ${m}</div>`).join('');
    if (ctx.normes.length)         html += ctx.normes.map(m =>
      `<div style="background:rgba(79,142,247,.08);border-left:3px solid #4F8EF7;padding:8px 12px;border-radius:0 6px 6px 0;margin-bottom:6px;font-size:12px">
        🔵 <b>DTU/NORME</b> — ${m}</div>`).join('');
    if (ctx.warnings.length)       html += ctx.warnings.map(m =>
      `<div style="background:rgba(245,158,11,.08);border-left:3px solid #f59e0b;padding:8px 12px;border-radius:0 6px 6px 0;margin-bottom:6px;font-size:12px">
        🟡 <b>ATTENTION</b> — ${m}</div>`).join('');
    if (ctx.recommandations.length) html += ctx.recommandations.map(m =>
      `<div style="background:rgba(16,185,129,.08);border-left:3px solid #10b981;padding:8px 12px;border-radius:0 6px 6px 0;margin-bottom:6px;font-size:12px">
        💡 <b>CONSEIL</b> — ${m}</div>`).join('');
    html += '<div style="font-size:10px;color:var(--text-tertiary);margin-top:8px;padding-top:8px;border-top:1px solid var(--border);font-style:italic">⚠️ Suggestions indicatives — à vérifier avec les DTU applicables. Ne constitue pas un avis technique certifié.</div>';
    return html;
  },

  // ── Base de règles ────────────────────────────────────────
  REGLES: [

    // ════════════════════════════════════
    //  PLACO / CLOISONS
    // ════════════════════════════════════

    {
      id: 'placo.cloison.hauteur_limite',
      metiers: ['placo'], types: ['cloison'],
      execute(input, ctx) {
        if (input.hauteur > 4.0)
          ctx.alertes.push(`Hauteur ${input.hauteur}m > 4m : cloison hors domaine DTU 25.41 standard — bureau d'études requis`);
        else if (input.hauteur > 3.0)
          ctx.normes.push(`DTU 25.41 : hauteur ${input.hauteur}m > 3m → ossature M70 ou M90 obligatoire, pas M48`);
      }
    },

    {
      id: 'placo.cloison.ossature_hauteur',
      metiers: ['placo'], types: ['cloison'],
      execute(input, ctx) {
        if (input.hauteur > 2.6 && input.ossature === 'M48')
          ctx.warnings.push(`Hauteur ${input.hauteur}m avec M48 : préférer M70 pour rigidité optimale (DTU 25.41)`);
      }
    },

    {
      id: 'placo.cloison.entraxe',
      metiers: ['placo'], types: ['cloison'],
      execute(input, ctx) {
        ctx.normes.push('DTU 25.41 : entraxe montants 60 cm max — rails fixés tous les 60 cm');
      }
    },

    {
      id: 'placo.cloison.isolation',
      metiers: ['placo'], types: ['cloison'],
      execute(input, ctx) {
        if (input.surface > 20 && !input.isolation)
          ctx.recommandations.push('Surface > 20 m² sans isolation : proposer laine de verre 45mm pour performance acoustique');
      }
    },

    {
      id: 'placo.cloison.securite_hauteur',
      metiers: ['placo'], types: ['cloison'],
      execute(input, ctx) {
        if (input.hauteur > 3.0)
          ctx.securite.push(`Travail en hauteur ${input.hauteur}m : échafaudage roulant + EPI obligatoires`);
      }
    },

    {
      id: 'placo.cloison.finition',
      metiers: ['placo'], types: ['cloison'],
      execute(input, ctx) {
        if (input.finition === 'Q4')
          ctx.normes.push('DTU 25.41 : finition Q4 — 3 passes enduit + ponçage + couche de finition');
        if (input.surface > 50)
          ctx.recommandations.push('Grande surface > 50 m² : prévoir bandes armées aux angles sortants');
      }
    },

    // ════════════════════════════════════
    //  PLACO / PLAFONDS
    // ════════════════════════════════════

    {
      id: 'placo.plafond.hauteur_travail',
      metiers: ['placo'], types: ['plafond'],
      execute(input, ctx) {
        if (input.hauteur_locale > 3.5)
          ctx.securite.push(`Pose plafond à ${input.hauteur_locale}m : échafaudage de pied obligatoire — pas d'escabeau`);
        else if (input.hauteur_locale > 2.5)
          ctx.warnings.push(`Plafond à ${input.hauteur_locale}m : prévoir échafaudage roulant ou tréteau réglementaire`);
      }
    },

    {
      id: 'placo.plafond.pertes',
      metiers: ['placo'], types: ['plafond'],
      execute(input, ctx) {
        ctx.normes.push('DTU 25.41 : prévoir +10% de pertes sur plaques plafond (découpes, chutes)');
        if (input.surface > 30)
          ctx.recommandations.push('Plafond > 30 m² : prévoir suspentes Rfix tous les 90 cm — ossature T47');
      }
    },

    {
      id: 'placo.plafond.humidite',
      metiers: ['placo'], types: ['plafond'],
      execute(input, ctx) {
        if (input.zone_humide)
          ctx.alertes.push('Zone humide : utiliser exclusivement BA13H (hydrofuge) — pas de BA13 standard');
      }
    },

    // ════════════════════════════════════
    //  PLACO / DOUBLAGE
    // ════════════════════════════════════

    {
      id: 'placo.doublage.pont_thermique',
      metiers: ['placo'], types: ['doublage'],
      execute(input, ctx) {
        ctx.normes.push('DTU 25.41 : doublage collé — vérifier planéité support < 5mm sous règle de 2m');
        ctx.recommandations.push('Penser à traiter les ponts thermiques en périphérie (nez de dalle, tableaux)');
      }
    },

    {
      id: 'placo.doublage.humidite',
      metiers: ['placo'], types: ['doublage'],
      execute(input, ctx) {
        if (input.mur_exterieur)
          ctx.alertes.push('Doublage sur mur extérieur : vérifier absence d\'humidité — remontées capillaires interdites avant pose');
      }
    },

    // ════════════════════════════════════
    //  PEINTURE
    // ════════════════════════════════════

    {
      id: 'peinture.sechage',
      metiers: ['peinture'], types: ['*'],
      execute(input, ctx) {
        ctx.normes.push('DTU 59.1 : temps de séchage minimum 4h entre couches — 24h pour impression');
        ctx.normes.push('DTU 59.1 : température d\'application 5°C < T < 35°C — humidité < 80%');
      }
    },

    {
      id: 'peinture.support_humide',
      metiers: ['peinture'], types: ['*'],
      execute(input, ctx) {
        if (input.support_neuf)
          ctx.alertes.push('Support neuf (placo/enduit) : attendre minimum 28 jours avant peinture — taux humidité < 5%');
      }
    },

    {
      id: 'peinture.couches_teinte',
      metiers: ['peinture'], types: ['*'],
      execute(input, ctx) {
        if (input.teinte_foncee)
          ctx.warnings.push('Teinte foncée : prévoir 3 couches minimum + impression teinté dans la masse');
        if (input.teinte_foncee)
          ctx.recommandations.push('Option commerciale : proposer peinture monocouche haut de gamme (gain temps + qualité)');
      }
    },

    {
      id: 'peinture.surface_grande',
      metiers: ['peinture'], types: ['*'],
      execute(input, ctx) {
        if (input.surface > 50)
          ctx.recommandations.push('Surface > 50 m² : recommander primaire d\'accrochage — meilleure tenue long terme');
        if (input.surface > 100)
          ctx.warnings.push('Grande surface > 100 m² : prévoir rouleau 18cm + perche télescopique — gain de temps significatif');
      }
    },

    {
      id: 'peinture.hauteur',
      metiers: ['peinture'], types: ['*'],
      execute(input, ctx) {
        if (input.hauteur > 2.7)
          ctx.warnings.push(`Hauteur ${input.hauteur}m > 2,7m : échafaudage roulant recommandé — pas d'escabeau`);
        if (input.hauteur > 3.5)
          ctx.securite.push(`Peinture en hauteur ${input.hauteur}m : échafaudage de pied + harnais si nécessaire`);
      }
    },

    {
      id: 'peinture.support_abime',
      metiers: ['peinture'], types: ['*'],
      execute(input, ctx) {
        if (input.support_abime) {
          ctx.alertes.push('Support abîmé : enduit de rebouchage obligatoire avant peinture');
          ctx.recommandations.push('Option commerciale : proposer enduit de lissage complet — valeur ajoutée + marge');
        }
      }
    },

    {
      id: 'peinture.cov',
      metiers: ['peinture'], types: ['*'],
      execute(input, ctx) {
        if (input.interieur)
          ctx.normes.push('COV 2010 : utiliser peintures étiquette A ou A+ pour locaux occupés — obligatoire ERP');
      }
    },

    // ════════════════════════════════════
    //  CARRELAGE
    // ════════════════════════════════════

    {
      id: 'carrelage.planéité',
      metiers: ['carrelage'], types: ['*'],
      execute(input, ctx) {
        ctx.normes.push('DTU 52.1 : planéité support < 5mm sous règle 2m — ragréage obligatoire si dépassé');
      }
    },

    {
      id: 'carrelage.grand_format',
      metiers: ['carrelage'], types: ['*'],
      execute(input, ctx) {
        if (input.format_cm > 60)
          ctx.warnings.push(`Grand format ${input.format_cm}cm : mortier colle double encollage obligatoire — DTU 52.1`);
        if (input.format_cm > 90)
          ctx.alertes.push(`Très grand format ${input.format_cm}cm : pose sur chape fluide recommandée — vérifier planéité au laser`);
      }
    },

    {
      id: 'carrelage.joint',
      metiers: ['carrelage'], types: ['*'],
      execute(input, ctx) {
        ctx.normes.push('DTU 52.1 : joint de dilatation obligatoire tous les 40-60 m² et en périphérie');
        if (input.surface > 40)
          ctx.alertes.push(`Surface ${input.surface} m² : joints de fractionnement obligatoires — DTU 52.1`);
      }
    },

    {
      id: 'carrelage.humidite',
      metiers: ['carrelage'], types: ['*'],
      execute(input, ctx) {
        if (input.zone_humide) {
          ctx.normes.push('DTU 52.2 : zone humide — étanchéité sous carrelage (SPEC) obligatoire');
          ctx.recommandations.push('Proposer bande d\'étanchéité aux angles + membrane SPEC — valeur ajoutée importante');
        }
      }
    },

    {
      id: 'carrelage.chauffage_sol',
      metiers: ['carrelage'], types: ['*'],
      execute(input, ctx) {
        if (input.chauffage_sol) {
          ctx.normes.push('Carrelage sur chauffage sol : colle déformable C2S1 obligatoire — joint 3mm minimum');
          ctx.alertes.push('Chauffage sol : mise en chauffe progressive obligatoire — attendre 21 jours après pose');
        }
      }
    },

    // ════════════════════════════════════
    //  ÉLECTRICITÉ
    // ════════════════════════════════════

    {
      id: 'elec.nfc15100',
      metiers: ['electricite'], types: ['*'],
      execute(input, ctx) {
        ctx.normes.push('NF C15-100 : toute installation doit être vérifiée par un électricien qualifié QUALIFELEC');
      }
    },

    {
      id: 'elec.salle_eau',
      metiers: ['electricite'], types: ['*'],
      execute(input, ctx) {
        if (input.salle_eau) {
          ctx.normes.push('NF C15-100 : salle d\'eau — volumes 0/1/2/3 — équipements selon zone obligatoire');
          ctx.alertes.push('Salle d\'eau : liaison équipotentielle obligatoire — disjoncteur différentiel 30mA');
        }
      }
    },

    // ════════════════════════════════════
    //  MAÇONNERIE
    // ════════════════════════════════════

    {
      id: 'maco.gel',
      metiers: ['maconnerie'], types: ['*'],
      execute(input, ctx) {
        if (input.temperature < 5)
          ctx.alertes.push(`Température ${input.temperature}°C < 5°C : maçonnerie interdite — risque gel mortier (DTU 20.1)`);
        else if (input.temperature < 8)
          ctx.warnings.push(`Température ${input.temperature}°C : conditions limites — utiliser adjuvants antigel`);
      }
    },

    {
      id: 'maco.enduit',
      metiers: ['maconnerie'], types: ['enduit'],
      execute(input, ctx) {
        ctx.normes.push('DTU 26.1 : support doit être propre, sain, dépolissé — humidification avant application');
        if (input.facade)
          ctx.warnings.push('Enduit façade : ne pas appliquer sous soleil direct ou vent fort — DTU 26.1');
      }
    },

    // ════════════════════════════════════
    //  RÈGLES UNIVERSELLES (tous métiers)
    // ════════════════════════════════════

    {
      id: 'universal.document',
      metiers: ['*'], types: ['*'],
      execute(input, ctx) {
        if (input.erp)
          ctx.normes.push('Travaux ERP : vérifier autorisation préalable — dossier sécurité incendie si modification structure');
      }
    },

    {
      id: 'universal.sous_traitance',
      metiers: ['*'], types: ['*'],
      execute(input, ctx) {
        if (input.sous_traitance)
          ctx.alertes.push('Sous-traitance : contrat écrit obligatoire + agrément maître d\'ouvrage (Loi 75-1334)');
      }
    },

    {
      id: 'universal.garantie',
      metiers: ['*'], types: ['*'],
      execute(input, ctx) {
        ctx.recommandations.push('Pensez à mentionner dans le devis : garantie décennale + assurance RC Pro');
      }
    },

  ]
};
