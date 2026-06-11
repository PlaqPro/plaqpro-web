/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Quiz interactif Plaquiste
//  quiz_plaquiste.js
// ============================================================

// var (pas const) pour que window.Quiz soit accessible depuis les onclick=""
var Quiz = {

  // ── État courant ──────────────────────────────────────────
  _questions: [],
  _current:   0,
  _score:     0,
  _startTime: 0,
  _source:    'local',   // 'local' | 'ia'
  _niveau:    '',
  _answered:  false,
  _container: null,

  // ── Questions locales (24) ────────────────────────────────
  QUESTIONS: {

    apprenti: [
      {
        question: 'Que signifie "BA" dans BA13 ?',
        reponses: ['Béton Armé', 'Bord Aminci', 'Bloc Alvéolaire', 'Base Aluminium'],
        bonne: 1,
        explication: 'BA = Bord Aminci. L\'amincissement du bord facilite la réalisation des joints sans créer de surépaisseur visible.',
        categorie: 'Plaques',
      },
      {
        question: 'Dans quelle pièce utilise-t-on principalement les plaques BA13H (hydrofuges) ?',
        reponses: ['Séjour', 'Chambre', 'Salle de bains', 'Couloir'],
        bonne: 2,
        explication: 'Les plaques hydrofuges (repérées en vert) sont destinées aux pièces humides : salle de bains, cuisine, WC.',
        categorie: 'Plaques',
      },
      {
        question: 'À quoi sert le rail (R) dans une ossature cloison ?',
        reponses: ['Élément porteur vertical', 'Guide horizontal sol/plafond', 'Support de plaques', 'Raidisseur de montant'],
        bonne: 1,
        explication: 'Le rail se fixe horizontalement au sol et au plafond. Il guide et maintient les montants verticaux en position.',
        categorie: 'Ossature',
      },
      {
        question: 'Quel outil utilise-t-on pour couper une plaque de plâtre sans scie électrique ?',
        reponses: ['Marteau-piqueur', 'Cutter + règle + couteau', 'Disqueuse d\'angle', 'Scie à métaux'],
        bonne: 1,
        explication: 'On score au cutter contre une règle, on casse sur l\'arête, puis on tranche le carton au dos. Rapide et propre.',
        categorie: 'Plaques',
      },
      {
        question: 'Quelle vis est spécifique à la fixation plaque BA13 sur montant métallique ?',
        reponses: ['Vis à bois 4×40 mm', 'Vis TF 3,5 × 25 mm', 'Vis CHC M6', 'Tirefond 6×60'],
        bonne: 1,
        explication: 'La vis TF (Tête Fraisée) 3,5×25 est auto-foreuse et auto-fraiseuse : elle s\'enfonce dans le métal en arasant sa tête.',
        categorie: 'Ossature',
      },
      {
        question: 'Quelle est la première opération après vissage des plaques, avant peinture ?',
        reponses: ['Poncer toute la surface', 'Appliquer la peinture directement', 'Enduire et lisser les joints et têtes de vis', 'Imprimer avec un rouleau'],
        bonne: 2,
        explication: 'Le jointage (bande + enduit + lissage + ponçage) est obligatoire pour obtenir une surface plane sans traces.',
        categorie: 'Jointage',
      },
      {
        question: 'Pourquoi applique-t-on un apprêt (primaire) avant la peinture de finition sur plâtre ?',
        reponses: ['Pour colorer la surface', 'Pour réduire la porosité et uniformiser l\'absorption', 'Pour éviter le ponçage', 'Pour accélérer le séchage'],
        bonne: 1,
        explication: 'Le plâtre est très poreux. L\'apprêt pénètre et consolide la surface, empêchant la peinture de finition de "boire" inégalement.',
        categorie: 'Peinture',
      },
      {
        question: 'Parmi ces EPI, lequel est OBLIGATOIRE pour couper des plaques de plâtre à la meuleuse ?',
        reponses: ['Casque intégral uniquement', 'Lunettes de protection + masque FFP2', 'Tablier de cuir', 'Gants de travail uniquement'],
        bonne: 1,
        explication: 'Couper du plâtre génère poussières et projections. Lunettes (projections) + masque FFP2 (poussières silicées) sont indispensables.',
        categorie: 'Normes',
      },
    ],

    compagnon: [
      {
        question: 'Pour une cloison de 20 m², combien de plaques BA13 (120×260 cm) prévoir avec 10 % de perte ?',
        reponses: ['5 plaques', '6 plaques', '7 plaques', '8 plaques'],
        bonne: 3,
        explication: '1 plaque = 1,20 × 2,60 = 3,12 m². Besoin brut = 20 ÷ 3,12 = 6,41. Avec 10 % : 6,41 × 1,10 = 7,05 → 8 plaques.',
        categorie: 'Calculs',
      },
      {
        question: 'Quel est l\'entraxe standard des montants pour une cloison BA13 simple peau ?',
        reponses: ['40 cm', '60 cm', '75 cm', '90 cm'],
        bonne: 1,
        explication: 'L\'entraxe standard est 60 cm : un bord de plaque tombe sur un montant, le bord opposé sur le suivant (120 cm / 2).',
        categorie: 'Ossature',
      },
      {
        question: 'Le DTU 25.41 régit principalement :',
        reponses: ['Les revêtements de sols', 'Les ouvrages en plaques de plâtre', 'L\'isolation thermique par l\'extérieur', 'La peinture intérieure'],
        bonne: 1,
        explication: 'Le DTU 25.41 (NF DTU 25.41) définit les règles de mise en œuvre des cloisons légères et doublages en plaques de plâtre.',
        categorie: 'Normes',
      },
      {
        question: 'Une porte EI 60 résiste au feu pendant :',
        reponses: ['30 minutes', '45 minutes', '60 minutes', '90 minutes'],
        bonne: 2,
        explication: 'EI 60 = Étanchéité aux flammes (E) + Isolation thermique (I) pendant 60 minutes. Équivalent européen de l\'ancienne notation CF1h.',
        categorie: 'Portes',
      },
      {
        question: 'Le rendement standard d\'une peinture murale en émulsion (1 couche, finition) est de :',
        reponses: ['3 à 5 m²/L', '8 à 12 m²/L', '15 à 20 m²/L', '25 à 30 m²/L'],
        bonne: 1,
        explication: 'En conditions normales, 1 litre de peinture d\'émulsion couvre 8 à 12 m² par couche selon le produit et la porosité du support.',
        categorie: 'Peinture',
      },
      {
        question: 'La TVA à taux réduit de 10 % s\'applique aux travaux de rénovation si le logement est achevé depuis :',
        reponses: ['Plus de 6 mois', 'Plus de 2 ans', 'Plus de 5 ans', 'Plus de 10 ans'],
        bonne: 1,
        explication: 'Art. 279-0 bis du CGI : TVA 10 % pour travaux de rénovation dans locaux d\'habitation achevés depuis plus de 2 ans.',
        categorie: 'Calculs',
      },
      {
        question: 'Quelle épaisseur de laine minérale est couramment posée en doublage intérieur mur extérieur pour satisfaire la RE2020 ?',
        reponses: ['45 mm', '75 mm', '100 à 120 mm', '200 mm'],
        bonne: 2,
        explication: 'La RE2020 exige R ≥ 3,7 m².K/W. Avec λ = 0,032 W/m.K, il faut ~120 mm. La pratique courante est 100 à 120 mm.',
        categorie: 'Isolation',
      },
      {
        question: 'Hauteur maximale garantie sans renfort pour une cloison Placostil 98/48 double BA13 ?',
        reponses: ['2,60 m', '3,20 m', '4,00 m', '5,50 m'],
        bonne: 1,
        explication: 'Selon les abaques Placo® pour la cloison 98/48 (deux plaques BA13 + laine), la hauteur libre maximale sans renfort est 3,20 m.',
        categorie: 'Ossature',
      },
    ],

    chef: [
      {
        question: 'À partir de quelle date la RE2020 est-elle obligatoire pour les logements collectifs neufs (permis de construire) ?',
        reponses: ['1er juillet 2021', '1er janvier 2022', '1er juillet 2022', '1er janvier 2023'],
        bonne: 1,
        explication: 'La RE2020 s\'applique aux permis de construire déposés à partir du 1er janvier 2022 pour tous les logements neufs (individuels et collectifs).',
        categorie: 'Normes',
      },
      {
        question: 'Quel est l\'indice d\'affaiblissement acoustique Rw typique d\'une cloison double peau 72/48 + laine minérale ?',
        reponses: ['25 dB', '32 dB', '38 à 42 dB', '52 dB'],
        bonne: 2,
        explication: 'Une cloison double peau (2 × BA13) 72/48 avec laine de 45 mm atteint 38 à 42 dB (Rw+C), selon les configurations DTU 25.41.',
        categorie: 'Normes',
      },
      {
        question: 'Le coefficient de perte standard appliqué aux plaques de plâtre en métré est de :',
        reponses: ['5 %', '8 %', '10 %', '15 %'],
        bonne: 2,
        explication: '10 % (facteur × 1,10) est le coefficient de chute standard pour les plaques, tenant compte des découpes : portes, angles, ajustements.',
        categorie: 'Calculs',
      },
      {
        question: 'La TVA à 20 % s\'applique OBLIGATOIREMENT pour des travaux de plâtrerie dans :',
        reponses: ['Un appartement de 5 ans', 'Une maison neuve en construction', 'Un bureau de 10 ans', 'Une extension de 15 m²'],
        bonne: 1,
        explication: 'La TVA à 20 % s\'applique à la construction neuve. Toute rénovation dans un local > 2 ans peut bénéficier des taux réduits (10 % ou 5,5 %).',
        categorie: 'Calculs',
      },
      {
        question: 'Qu\'est-ce qu\'un Avis Technique (ATec) délivré par le CSTB ?',
        reponses: ['Un diplôme professionnel', 'Une évaluation de conformité pour produits hors normes', 'Un certificat de chantier', 'Un label écologique'],
        bonne: 1,
        explication: 'L\'Avis Technique (ATec) est émis par le CSTB pour des procédés ou produits innovants non couverts par les DTU. Il encadre leur utilisation.',
        categorie: 'Normes',
      },
      {
        question: 'Le délai légal de rétractation pour un client particulier après signature d\'un devis à domicile est de :',
        reponses: ['7 jours', '10 jours', '14 jours', '30 jours'],
        bonne: 2,
        explication: 'Art. L221-18 Code de la consommation : 14 jours de droit de rétractation pour tout contrat signé hors établissement (à domicile, chantier, etc.).',
        categorie: 'Calculs',
      },
      {
        question: 'La charge admissible par fixation directe dans une plaque BA13 (cheville spéciale type Molly) est d\'environ :',
        reponses: ['5 kg', '15 kg', '30 kg', '50 kg'],
        bonne: 1,
        explication: 'Une cheville spéciale plaque (Molly, Gripper…) supporte environ 15 kg par point. Au-delà, il faut viser un montant de l\'ossature.',
        categorie: 'Normes',
      },
      {
        question: 'Quelle est la résistance thermique R minimale exigée par la RE2020 pour un plancher bas sur vide sanitaire (zone H1) ?',
        reponses: ['R ≥ 2,0 m².K/W', 'R ≥ 3,0 m².K/W', 'R ≥ 4,0 m².K/W', 'R ≥ 5,5 m².K/W'],
        bonne: 1,
        explication: 'La RE2020 exige R ≥ 3,0 m².K/W pour les planchers bas sur vide sanitaire en zone H1, soit environ 100 mm de PSE ou 120 mm de laine.',
        categorie: 'Isolation',
      },
    ],
  },

  // ── Génération IA ─────────────────────────────────────────
  async genererQuestionIA(niveau) {
    const gc = groqConfig();
    if (!gc) throw new Error('Clé Groq requise en local — configurez-la dans Paramètres');

    const prompt =
      `Tu es expert plaquiste. Génère UNE question quiz niveau ${niveau}. ` +
      `Réponds UNIQUEMENT en JSON valide (pas de texte autour) : ` +
      `{"question":"...","reponses":["A","B","C","D"],"bonne":0,"explication":"...","categorie":"..."}. ` +
      `Catégories possibles : Plaques/Ossature/Jointage/Peinture/Isolation/Normes/Calculs/Portes/Sols. ` +
      `La propriété "bonne" est l'index (0-3) de la bonne réponse dans le tableau "reponses".`;

    const resp = await fetch(gc.url, {
      method: 'POST',
      headers: gc.headers,
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 350,
        temperature: 0.85,
      }),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.error) throw new Error(data.error.message);

    const raw = data.choices?.[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Pas de JSON dans la réponse');

    const q = JSON.parse(match[0]);
    if (!q.question || !Array.isArray(q.reponses) || q.reponses.length < 4 || q.bonne == null) {
      throw new Error('Structure JSON invalide');
    }
    return q;
  },

  // ── Démarrage ─────────────────────────────────────────────
  // Appelé depuis onclick="" — ne reçoit que le niveau, trouve le container lui-même
  async demarrer(niveau) {
    const container = document.getElementById('quiz-page');
    if (!container) { console.error('[Quiz] #quiz-page introuvable'); return; }

    Quiz._niveau    = niveau;
    Quiz._container = container;
    Quiz._current   = 0;
    Quiz._score     = 0;
    Quiz._answered  = false;

    const hasGroq = !!getGroqKey();

    if (hasGroq) {
      Quiz._afficherChargement(container, niveau);
      try {
        const calls = Array.from({ length: 10 }, () => Quiz.genererQuestionIA(niveau));
        Quiz._questions = await Promise.all(calls);
        Quiz._source    = 'ia';
      } catch (err) {
        console.warn('[Quiz] Fallback local — ', err.message);
        Quiz._questions = Quiz._questionsLocales(niveau);
        Quiz._source    = 'local';
        if (container._dotInterval) { clearInterval(container._dotInterval); delete container._dotInterval; }
        App.toast('Fallback questions locales : ' + err.message, 'info');
      }
    } else {
      Quiz._questions = Quiz._questionsLocales(niveau);
      Quiz._source    = 'local';
    }

    Quiz._startTime = Date.now();
    Quiz._afficherQuestion(container);
  },

  _questionsLocales(niveau) {
    const MAP = {
      'Apprenti':         'apprenti',
      'Compagnon':        'compagnon',
      'Chef de chantier': 'chef',
    };
    const key = MAP[niveau];
    let pool;
    if (key) {
      pool = [...Quiz.QUESTIONS[key]];
    } else {
      // Mélange
      pool = [
        ...Quiz.QUESTIONS.apprenti,
        ...Quiz.QUESTIONS.compagnon,
        ...Quiz.QUESTIONS.chef,
      ];
    }
    return pool.sort(() => Math.random() - 0.5).slice(0, 10);
  },

  // ── Écrans ────────────────────────────────────────────────
  _afficherChargement(container, niveau) {
    container.innerHTML = `
      <div style="text-align:center;padding:64px 20px">
        <div style="font-size:52px;margin-bottom:20px">✨</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:8px;color:var(--text-primary)">
          Génération IA en cours…
        </div>
        <div style="color:var(--text-secondary);font-size:13px;margin-bottom:28px">
          10 questions personnalisées · Niveau ${niveau}
        </div>
        <div style="display:flex;justify-content:center;gap:8px" id="quiz-dots">
          ${Array(10).fill(0).map((_, i) =>
            `<div style="width:8px;height:8px;border-radius:50%;background:var(--accent);opacity:0.2;transition:opacity .2s" id="dot-${i}"></div>`
          ).join('')}
        </div>
      </div>`;
    let i = 0;
    container._dotInterval = setInterval(() => {
      for (let k = 0; k < 10; k++) {
        const d = document.getElementById('dot-' + k);
        if (d) d.style.opacity = k === i % 10 ? '1' : '0.2';
      }
      i++;
    }, 180);
  },

  _afficherQuestion(container) {
    if (container._dotInterval) { clearInterval(container._dotInterval); delete container._dotInterval; }

    const q     = Quiz._questions[Quiz._current];
    const total = Quiz._questions.length;
    const pct   = Math.round((Quiz._current / total) * 100);
    const L     = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <!-- Barre de progression -->
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--text-secondary)">
          <span>
            ${Quiz._source === 'ia'
              ? '<span style="background:rgba(79,142,247,0.15);color:var(--accent);padding:2px 8px;border-radius:10px;font-weight:700;font-size:11px">✨ Dynamique</span>'
              : '<span style="background:var(--bg-tertiary);padding:2px 8px;border-radius:10px;font-size:11px">📚 Certifié</span>'}
            &nbsp;Niveau <strong>${Quiz._niveau}</strong>
          </span>
          <span>Question <strong>${Quiz._current + 1}</strong> / ${total} &nbsp;·&nbsp; Score : <strong>${Quiz._score}</strong></span>
        </div>
        <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--accent);border-radius:3px;transition:width .4s ease"></div>
        </div>
      </div>

      <!-- Question -->
      <div class="card" style="margin-bottom:12px">
        <div class="card-body">
          <div style="margin-bottom:10px">
            <span style="background:var(--accent);color:#fff;border-radius:20px;
                         padding:3px 12px;font-size:11px;font-weight:700">
              ${q.categorie || 'Général'}
            </span>
          </div>
          <div style="font-size:15px;font-weight:600;line-height:1.55;color:var(--text-primary)">
            ${q.question}
          </div>
        </div>
      </div>

      <!-- Réponses -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px"
           id="quiz-answers">
        ${q.reponses.map((r, i) => `
          <button id="qa-${i}" onclick="Quiz._repondre(${i})"
            style="text-align:left;padding:14px 16px;border-radius:var(--radius-md);
                   border:1.5px solid var(--border);background:var(--bg-secondary);
                   color:var(--text-primary);cursor:pointer;font-size:13px;line-height:1.4;
                   display:flex;gap:10px;align-items:flex-start;
                   transition:border-color .15s,background .15s">
            <span style="font-weight:800;color:var(--accent);min-width:18px;flex-shrink:0">${L[i]}</span>
            <span>${r}</span>
          </button>`).join('')}
      </div>

      <!-- Explication (cachée) -->
      <div id="quiz-explication" style="display:none;margin-bottom:14px"></div>

      <!-- Bouton Suivant -->
      <div style="text-align:right">
        <button id="quiz-suivant" class="btn btn-primary" onclick="Quiz._suivant()"
          style="display:none">
          ${Quiz._current + 1 < total ? 'Question suivante →' : 'Voir les résultats →'}
        </button>
      </div>
    `;
  },

  _repondre(idx) {
    if (Quiz._answered) return;
    Quiz._answered = true;

    const q     = Quiz._questions[Quiz._current];
    const bonne = parseInt(q.bonne);
    const juste = idx === bonne;
    if (juste) Quiz._score++;

    // Colorier les boutons
    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById('qa-' + i);
      if (!btn) continue;
      btn.style.cursor = 'default';
      btn.onclick = null;
      if (i === bonne) {
        btn.style.background     = 'rgba(45,212,160,0.12)';
        btn.style.borderColor    = '#2DD4A0';
        btn.style.color          = '#2DD4A0';
      } else if (i === idx) {
        btn.style.background     = 'rgba(247,91,91,0.12)';
        btn.style.borderColor    = '#F75B5B';
        btn.style.color          = '#F75B5B';
      }
    }

    // Explication
    const exp = document.getElementById('quiz-explication');
    if (exp) {
      exp.style.display = 'block';
      const c = juste ? ['rgba(45,212,160,0.1)', 'rgba(45,212,160,0.35)', '#2DD4A0'] : ['rgba(247,91,91,0.1)', 'rgba(247,91,91,0.3)', '#F75B5B'];
      exp.innerHTML = `
        <div style="padding:14px 16px;border-radius:var(--radius-md);
                    background:${c[0]};border:1px solid ${c[1]}">
          <div style="font-weight:700;color:${c[2]};margin-bottom:6px">
            ${juste ? '✅ Bonne réponse !' : '❌ Mauvaise réponse'}
          </div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.5">
            ${q.explication || ''}
          </div>
        </div>`;
    }

    const suivant = document.getElementById('quiz-suivant');
    if (suivant) suivant.style.display = 'inline-flex';
  },

  _suivant() {
    Quiz._answered = false;
    Quiz._current++;
    if (Quiz._current >= Quiz._questions.length) {
      Quiz._afficherResultat(Quiz._container);
    } else {
      Quiz._afficherQuestion(Quiz._container);
    }
  },

  // ── Résultats ─────────────────────────────────────────────
  _afficherResultat(container) {
    const total  = Quiz._questions.length;
    const pct    = Math.round((Quiz._score / total) * 100);
    const duree  = Math.round((Date.now() - Quiz._startTime) / 1000);

    // Stats persistées
    const SKEY  = 'plaqpro_quiz_stats';
    const stats = JSON.parse(localStorage.getItem(SKEY) || '{"parties":0,"meilleur":0,"badges":[]}');
    stats.parties = (stats.parties || 0) + 1;
    stats.meilleur = Math.max(stats.meilleur || 0, pct);
    const badges = stats.badges || [];
    const nouveaux = [];

    const tryBadge = (id, label, emoji, cond) => {
      if (cond && !badges.includes(id)) { badges.push(id); nouveaux.push({ id, label, emoji }); }
    };
    tryBadge('premier',    'Premier quiz',        '🎯', stats.parties === 1);
    tryBadge('apprenti',   'Apprenti certifié',   '🟡', Quiz._niveau === 'Apprenti'         && pct >= 60);
    tryBadge('compagnon',  'Compagnon certifié',  '🔵', Quiz._niveau === 'Compagnon'         && pct >= 60);
    tryBadge('chef',       'Chef de chantier',    '🔴', Quiz._niveau === 'Chef de chantier'  && pct >= 60);
    tryBadge('parfait',    'Score parfait 100 %', '⭐', pct === 100);
    tryBadge('eclair',     'Éclair — sous 30 s',  '⚡', duree < 30 && pct > 50);
    tryBadge('assidu',     'Assidu — 5 quiz',     '🏆', stats.parties >= 5);

    stats.badges = badges;
    localStorage.setItem(SKEY, JSON.stringify(stats));

    const couleur = pct >= 80 ? '#2DD4A0' : pct >= 50 ? '#F7A64F' : '#F75B5B';
    const emoji   = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚';

    const badgeIcons = { premier:'🎯', apprenti:'🟡', compagnon:'🔵', chef:'🔴', parfait:'⭐', eclair:'⚡', assidu:'🏆' };

    container.innerHTML = `
      <div class="card" style="max-width:520px;margin:0 auto">
        <div class="card-body" style="padding:32px 28px;text-align:center">

          <div style="font-size:56px;margin-bottom:12px">${emoji}</div>
          <div style="font-size:52px;font-weight:800;color:${couleur};line-height:1">${pct} %</div>
          <div style="font-size:16px;font-weight:600;margin:8px 0 4px">
            ${Quiz._score} / ${total} bonnes réponses
          </div>
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:24px">
            Niveau ${Quiz._niveau} &nbsp;·&nbsp;
            ${Quiz._source === 'ia' ? '✨ Questions dynamiques' : '📚 Questions certifiées'} &nbsp;·&nbsp;
            ${duree} s
          </div>

          ${nouveaux.length ? `
          <div style="background:rgba(79,142,247,0.1);border:1px solid rgba(79,142,247,0.3);
                      border-radius:var(--radius-md);padding:16px;margin-bottom:20px">
            <div style="font-weight:700;margin-bottom:10px;font-size:14px">🎖 Badges débloqués !</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
              ${nouveaux.map(b => `
                <span style="background:var(--bg-tertiary);border:1px solid var(--border);
                             border-radius:20px;padding:4px 14px;font-size:12px;font-weight:500">
                  ${b.emoji} ${b.label}
                </span>`).join('')}
            </div>
          </div>` : ''}

          ${badges.length ? `
          <div style="margin-bottom:22px">
            <div style="font-size:11px;color:var(--text-tertiary);text-transform:uppercase;
                        letter-spacing:.08em;margin-bottom:8px">Votre collection</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">
              ${badges.map(id => `<span title="${id}" style="font-size:22px">${badgeIcons[id] || '🏅'}</span>`).join('')}
            </div>
          </div>` : ''}

          <div style="padding:12px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:20px;font-size:12px;color:var(--text-secondary)">
            Total parties : <strong>${stats.parties}</strong> &nbsp;·&nbsp;
            Meilleur score : <strong style="color:${couleur}">${stats.meilleur} %</strong>
          </div>

          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
            <button class="btn btn-primary"   onclick="Quiz.demarrer('${Quiz._niveau}')">🔄 Rejouer</button>
            <button class="btn btn-secondary" onclick="App.navigate('quiz')">← Accueil quiz</button>
          </div>
        </div>
      </div>`;
  },

  // ── Popup jeux (sidebar) ──────────────────────────────────
  toggleGamesPopup(e) {
    if (e) e.preventDefault();
    const p = document.getElementById('games-popup');
    if (!p) return;
    const open = p.style.display !== 'none';
    p.style.display = open ? 'none' : 'block';
    if (!open) {
      // Fermer en cliquant ailleurs
      setTimeout(() => {
        document.addEventListener('click', function close(ev) {
          if (!p.contains(ev.target)) { p.style.display = 'none'; }
          document.removeEventListener('click', close);
        });
      }, 10);
    }
  },
};

// ── Page Quiz ─────────────────────────────────────────────────
Object.assign(Pages, {

  quiz() {
    const statsRaw = localStorage.getItem('plaqpro_quiz_stats');
    const stats    = statsRaw ? JSON.parse(statsRaw) : { parties: 0, meilleur: 0, badges: [] };
    const badgeIcons = { premier:'🎯', apprenti:'🟡', compagnon:'🔵', chef:'🔴', parfait:'⭐', eclair:'⚡', assidu:'🏆' };
    const hasGroq  = !!getGroqKey();

    const wrap = document.createElement('div');
    wrap.id = 'quiz-page';

    // Zone accueil
    const accueil = document.createElement('div');
    accueil.innerHTML = `
      <!-- Header -->
      <div class="card" style="margin-bottom:16px">
        <div class="card-body" style="text-align:center;padding:28px 24px">
          <div style="font-size:40px;margin-bottom:8px">🎮</div>
          <div style="font-size:22px;font-weight:800;margin-bottom:6px">Quiz Plaquiste</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">
            Testez vos connaissances en plâtrerie, isolation et réglementation
            ${hasGroq
              ? '<br><span style="color:var(--accent);font-size:12px;font-weight:600">✨ Questions générées dynamiquement</span>'
              : '<br><span style="color:var(--text-tertiary);font-size:12px">📚 Banque de questions certifiées</span>'}
          </div>

          <!-- Niveaux -->
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:440px;margin:0 auto 16px">
            ${[
              ['Apprenti',         '🟡', 'Bases, outils, matériaux',          'rgba(247,166,79,0.15)',  'rgba(247,166,79,0.4)'],
              ['Compagnon',        '🔵', 'Calculs, DTU, normes courantes',     'rgba(79,142,247,0.15)', 'rgba(79,142,247,0.4)'],
              ['Chef de chantier', '🔴', 'RE2020, acoustique, gestion',        'rgba(247,91,91,0.12)',  'rgba(247,91,91,0.35)'],
              ['Mélange',          '🎲', 'Questions de tous niveaux',          'rgba(45,212,160,0.12)', 'rgba(45,212,160,0.35)'],
            ].map(([niv, em, desc, bg, brd]) => `
              <button onclick="Quiz.demarrer('${niv}')"
                style="padding:16px 12px;border-radius:var(--radius-md);border:1.5px solid ${brd};
                       background:${bg};cursor:pointer;transition:opacity .15s;text-align:center">
                <div style="font-size:24px;margin-bottom:4px">${em}</div>
                <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:2px">${niv}</div>
                <div style="font-size:11px;color:var(--text-secondary)">${desc}</div>
              </button>`).join('')}
          </div>
        </div>
      </div>

      <!-- Stats joueur -->
      ${stats.parties > 0 ? `
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><span class="card-title">📊 Vos stats</span></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;margin-bottom:${(stats.badges||[]).length ? 16 : 0}px">
            <div>
              <div style="font-size:22px;font-weight:800;color:var(--accent)">${stats.parties}</div>
              <div style="font-size:11px;color:var(--text-secondary)">Parties jouées</div>
            </div>
            <div>
              <div style="font-size:22px;font-weight:800;color:var(--accent)">${stats.meilleur} %</div>
              <div style="font-size:11px;color:var(--text-secondary)">Meilleur score</div>
            </div>
            <div>
              <div style="font-size:22px;font-weight:800;color:var(--accent)">${(stats.badges||[]).length}</div>
              <div style="font-size:11px;color:var(--text-secondary)">Badges</div>
            </div>
          </div>
          ${(stats.badges||[]).length ? `
          <div style="border-top:1px solid var(--border);padding-top:12px">
            <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em">Collection de badges</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${(stats.badges||[]).map(id => `
                <span style="background:var(--bg-tertiary);border:1px solid var(--border);
                             border-radius:20px;padding:4px 12px;font-size:12px">
                  ${badgeIcons[id] || '🏅'}
                  <span style="margin-left:4px;color:var(--text-secondary)">${id}</span>
                </span>`).join('')}
            </div>
          </div>` : ''}
        </div>
      </div>` : ''}

      <!-- Guide badges -->
      <div class="card">
        <div class="card-header"><span class="card-title">🎖 Badges à débloquer</span></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">
            ${[
              ['🎯', 'Premier quiz',        'Compléter son 1er quiz'],
              ['🟡', 'Apprenti certifié',   'Niveau Apprenti ≥ 60 %'],
              ['🔵', 'Compagnon certifié',  'Niveau Compagnon ≥ 60 %'],
              ['🔴', 'Chef de chantier',    'Niveau Chef ≥ 60 %'],
              ['⭐', 'Score parfait 100 %', 'Tout bon en une partie'],
              ['⚡', 'Éclair',             'Terminer en moins de 30 s'],
              ['🏆', 'Assidu',             '5 quiz complétés'],
            ].map(([ic, lbl, desc]) => {
              const earned = (stats.badges||[]).includes(
                { '🎯':'premier','🟡':'apprenti','🔵':'compagnon','🔴':'chef','⭐':'parfait','⚡':'eclair','🏆':'assidu' }[ic]
              );
              return `
                <div style="display:flex;gap:10px;align-items:center;padding:8px 10px;
                            background:${earned ? 'rgba(45,212,160,0.07)' : 'var(--bg-tertiary)'};
                            border:1px solid ${earned ? 'rgba(45,212,160,0.3)' : 'var(--border)'};
                            border-radius:var(--radius-md)">
                  <span style="font-size:20px;opacity:${earned ? '1' : '0.35'}">${ic}</span>
                  <div>
                    <div style="font-size:12px;font-weight:600;color:${earned ? '#2DD4A0' : 'var(--text-primary)'}">${lbl}</div>
                    <div style="font-size:11px;color:var(--text-tertiary)">${desc}</div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Zone de jeu (vide au départ)
    const gameZone = document.createElement('div');
    gameZone.id = 'quiz-game-zone';
    gameZone.style.marginTop = '16px';

    wrap.appendChild(accueil);
    wrap.appendChild(gameZone);
    return wrap;
  },
});

// ============================================================
//  PLAQTETRIS — Tetris avec plaques plâtre
//  Accessible via Pages.plaqtetris()
// ============================================================

Object.assign(Pages, {

  plaqtetris() {

    // ── Cleanup instance précédente ───────────────────────────
    if (window._tetrisDestroy) { window._tetrisDestroy(); }

    var COLS = 10, ROWS = 20, CELL = 28;
    var BEST_KEY = 'plaqpro_tetris_best';
    var _gameRunning = false;

    // ── Définition des pièces ─────────────────────────────────
    var DEFS = [
      { name:'BA13S', label:'Plaque Standard',  c1:'#dde1e7', c2:'#6b7280', cells:[[0,0],[1,0],[2,0],[3,0]] },
      { name:'BA13H', label:'Plaque Hydrofuge', c1:'#6ee7b7', c2:'#059669', cells:[[0,0],[1,0],[2,0],[0,1]] },
      { name:'BA13F', label:'Plaque Feu',       c1:'#fca5a5', c2:'#dc2626', cells:[[1,0],[2,0],[0,1],[1,1]] },
      { name:'R48',   label:'Rail R48',         c1:'#94a3b8', c2:'#334155', cells:[[0,0],[0,1],[0,2],[0,3]] },
      { name:'M48',   label:'Montant M48',      c1:'#c4b5fd', c2:'#7c3aed', cells:[[0,0],[1,0],[2,0],[1,1]] },
      { name:'Dalle', label:'Dalle plafond',    c1:'#fef9c3', c2:'#ca8a04', cells:[[0,0],[1,0],[0,1],[1,1]] },
    ];

    // ── Rotation horaire + normalisation ─────────────────────
    function rotateCW(cells) {
      var maxY = Math.max.apply(null, cells.map(function(c){return c[1];}));
      var rot  = cells.map(function(c){ return [maxY - c[1], c[0]]; });
      var minX = Math.min.apply(null, rot.map(function(c){return c[0];}));
      var minY = Math.min.apply(null, rot.map(function(c){return c[1];}));
      return rot.map(function(c){ return [c[0]-minX, c[1]-minY]; });
    }

    // ── État du jeu ──────────────────────────────────────────
    var grid, cur, cx, cy, nextP, score, lines, level, over, paused, flash, flashT, best;

    function loadBest() { best = parseInt(localStorage.getItem(BEST_KEY)||'0', 10)||0; }
    function saveBest() { if (score>best){best=score;localStorage.setItem(BEST_KEY,score);} }

    function randPiece() {
      var d = DEFS[Math.floor(Math.random()*DEFS.length)];
      return { name:d.name, label:d.label, c1:d.c1, c2:d.c2, cells:d.cells.map(function(c){return[c[0],c[1]];}) };
    }

    function fits(cells, x, y) {
      for (var i=0;i<cells.length;i++) {
        var nx=x+cells[i][0], ny=y+cells[i][1];
        if (nx<0||nx>=COLS||ny>=ROWS) return false;
        if (ny>=0 && grid[ny][nx]) return false;
      }
      return true;
    }

    function spawn() {
      cur = nextP;
      var w = Math.max.apply(null, cur.cells.map(function(c){return c[0];})) + 1;
      cx  = Math.floor((COLS - w) / 2);
      cy  = 0;
      nextP = randPiece();
      if (!fits(cur.cells, cx, cy)) { over=true; saveBest(); }
      updateHUD();
    }

    function place() {
      for (var i=0;i<cur.cells.length;i++) {
        var nx=cx+cur.cells[i][0], ny=cy+cur.cells[i][1];
        if (ny>=0) grid[ny][nx] = { c1:cur.c1, c2:cur.c2 };
      }
      var cleared=0;
      for (var r=ROWS-1;r>=0;r--) {
        if (grid[r].every(function(c){return c!==null;})) {
          grid.splice(r,1);
          grid.unshift(new Array(COLS).fill(null));
          cleared++; r++;
        }
      }
      if (cleared) {
        var pts=[0,100,300,500,800][cleared]||800;
        score += pts*level; lines += cleared;
        level  = Math.floor(lines/10)+1;
        flash  = cleared>=4 ? '🏆 PLAQ-TETRIS !!'
               : cleared>=3 ? '⭐ TRIPLE !'
               : cleared>=2 ? '✨ DOUBLE !'
               : '✅ Bonne pose !';
        flashT = 100;
      }
      spawn();
    }

    function startGame() {
      grid   = Array.from({length:ROWS}, function(){return new Array(COLS).fill(null);});
      score  = 0; lines = 0; level = 1;
      over   = false; paused = false; flash = ''; flashT = 0;
      loadBest();
      nextP  = randPiece();
      spawn();
    }

    function dropMs() { return Math.max(80, 550-(level-1)*45); }

    function softDrop() {
      if (fits(cur.cells,cx,cy+1)) { cy++; score++; }
      else place();
    }

    function hardDrop() {
      while (fits(cur.cells,cx,cy+1)) { cy++; score+=2; }
      place();
    }

    function doRotate() {
      var r = rotateCW(cur.cells);
      if      (fits(r,cx,cy))   cur.cells=r;
      else if (fits(r,cx+1,cy)) { cur.cells=r; cx++; }
      else if (fits(r,cx-1,cy)) { cur.cells=r; cx--; }
    }

    // ── Canvas principal (280×560) ───────────────────────────
    var cvs = document.createElement('canvas');
    cvs.width=COLS*CELL; cvs.height=ROWS*CELL;
    cvs.style.cssText='display:block;border-radius:10px;border:1px solid rgba(255,255,255,0.12);'
      +'touch-action:none;cursor:pointer;max-width:100%;';
    var ctx = cvs.getContext('2d');

    // ── Canvas pièce suivante ────────────────────────────────
    var nCvs=document.createElement('canvas');
    nCvs.width=120; nCvs.height=100;
    nCvs.style.cssText='display:block;border-radius:8px;border:1px solid rgba(255,255,255,0.1);';
    var nCtx=nCvs.getContext('2d');

    // ── HUD refs (initialisées après construction DOM) ────────
    var hudScore, hudLines, hudLevel, hudBest, hudName;
    var hudStyle='font-size:20px;font-weight:800;color:#F0F2F8;font-family:monospace;letter-spacing:-0.5px;';

    function updateHUD() {
      if (!hudScore) return;
      hudScore.textContent=score;
      hudLines.textContent=lines;
      hudLevel.textContent=level;
      hudBest.textContent =Math.max(score,best);
      if (cur) hudName.textContent=cur.label||'';
      renderNext();
    }

    // ── Rendu cellule ─────────────────────────────────────────
    function renderCell(c, x, y, a) {
      ctx.globalAlpha=a||1;
      ctx.fillStyle=c.c1;
      ctx.fillRect(x*CELL+1,y*CELL+1,CELL-2,CELL-2);
      ctx.strokeStyle=c.c2; ctx.lineWidth=1.5;
      ctx.strokeRect(x*CELL+1.5,y*CELL+1.5,CELL-3,CELL-3);
      ctx.fillStyle='rgba(255,255,255,0.22)';
      ctx.fillRect(x*CELL+3,y*CELL+3,CELL-6,4);
      ctx.globalAlpha=1;
    }

    function renderNext() {
      if (!nCtx) return;
      var nc=24;
      nCtx.fillStyle='#0D0F14'; nCtx.fillRect(0,0,120,100);
      if (!nextP) return;
      var mx=Math.max.apply(null,nextP.cells.map(function(c){return c[0];}))+1;
      var my=Math.max.apply(null,nextP.cells.map(function(c){return c[1];}))+1;
      var ox=Math.floor((5-mx)/2), oy=Math.floor((4-my)/2);
      nextP.cells.forEach(function(c){
        var px=(ox+c[0])*nc+8, py=(oy+c[1])*nc+8;
        nCtx.fillStyle=nextP.c1; nCtx.fillRect(px,py,nc-2,nc-2);
        nCtx.strokeStyle=nextP.c2; nCtx.lineWidth=1; nCtx.strokeRect(px+.5,py+.5,nc-3,nc-3);
        nCtx.fillStyle='rgba(255,255,255,0.22)'; nCtx.fillRect(px+2,py+2,nc-4,4);
      });
    }

    // ── Rendu principal ───────────────────────────────────────
    function draw() {
      ctx.fillStyle='#0D0F14'; ctx.fillRect(0,0,cvs.width,cvs.height);
      ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=0.5;
      for (var c=0;c<COLS;c++){ctx.beginPath();ctx.moveTo(c*CELL,0);ctx.lineTo(c*CELL,cvs.height);ctx.stroke();}
      for (var r=0;r<ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*CELL);ctx.lineTo(cvs.width,r*CELL);ctx.stroke();}

      for (var row=0;row<ROWS;row++) for (var col=0;col<COLS;col++) if(grid[row][col]) renderCell(grid[row][col],col,row);

      if (!over && !paused && cur) {
        var gy=cy; while(fits(cur.cells,cx,gy+1)) gy++;
        if (gy>cy) cur.cells.forEach(function(c){renderCell({c1:cur.c1,c2:cur.c2},cx+c[0],gy+c[1],0.18);});
        cur.cells.forEach(function(c){if(cy+c[1]>=0) renderCell({c1:cur.c1,c2:cur.c2},cx+c[0],cy+c[1]);});
      }

      if (flashT>0) {
        flashT--;
        var a=Math.min(1,flashT/25);
        ctx.fillStyle='rgba(0,0,0,'+(a*0.6)+')';
        ctx.fillRect(0,cvs.height/2-28,cvs.width,56);
        ctx.globalAlpha=a;
        ctx.fillStyle='#fff'; ctx.font='bold 19px Outfit,sans-serif'; ctx.textAlign='center';
        ctx.fillText(flash,cvs.width/2,cvs.height/2+7);
        ctx.textAlign='left'; ctx.globalAlpha=1;
      }

      if (over) {
        ctx.fillStyle='rgba(0,0,0,0.82)'; ctx.fillRect(0,0,cvs.width,cvs.height);
        ctx.textAlign='center';
        ctx.fillStyle='#F7A64F'; ctx.font='bold 20px Outfit,sans-serif';
        ctx.fillText('🏗 Chantier terminé !',cvs.width/2,cvs.height/2-34);
        ctx.fillStyle='#9ca3af'; ctx.font='14px Outfit,sans-serif';
        ctx.fillText('Score : '+score,cvs.width/2,cvs.height/2-6);
        ctx.fillText('Meilleur : '+Math.max(score,best),cvs.width/2,cvs.height/2+16);
        ctx.fillStyle='#4F8EF7'; ctx.font='bold 13px Outfit,sans-serif';
        ctx.fillText('Cliquez / ↵ pour rejouer',cvs.width/2,cvs.height/2+50);
        ctx.textAlign='left';
      }

      if (paused && !over) {
        ctx.fillStyle='rgba(0,0,0,0.72)'; ctx.fillRect(0,0,cvs.width,cvs.height);
        ctx.fillStyle='#fff'; ctx.font='bold 22px Outfit,sans-serif'; ctx.textAlign='center';
        ctx.fillText('⏸ Pause — cliquez pour reprendre',cvs.width/2,cvs.height/2);
        ctx.textAlign='left';
      }
    }

    // ── Boucle de jeu ─────────────────────────────────────────
    var animId=null, lastT=0, destroyed=false;
    function loop(ts) {
      if (destroyed) return;
      animId=requestAnimationFrame(loop);
      if (!over && !paused && ts-lastT>dropMs()) { softDrop(); lastT=ts; }
      draw();
    }

    // ── Clavier — preventDefault UNIQUEMENT quand jeu actif ──
    var ARROW_KEYS = ['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space',' '];
    function onKey(e) {
      if (!_gameRunning) return;
      if (ARROW_KEYS.indexOf(e.key) >= 0 || ARROW_KEYS.indexOf(e.code) >= 0) e.preventDefault();
      if (over) { if(e.key==='Enter'||e.key===' '){startGame();lastT=0;} return; }
      if (e.key==='p'||e.key==='P'||e.key==='Escape') { paused=!paused; return; }
      if (paused) return;
      if (e.key==='ArrowLeft'  && fits(cur.cells,cx-1,cy)) cx--;
      if (e.key==='ArrowRight' && fits(cur.cells,cx+1,cy)) cx++;
      if (e.key==='ArrowDown')  softDrop();
      if (e.key==='ArrowUp'||e.key==='z'||e.key==='Z') doRotate();
      if (e.key===' ') hardDrop();
    }
    document.addEventListener('keydown', onKey);

    // ── Tactile sur canvas uniquement ─────────────────────────
    var tStart=null;
    function onTouchStart(e) {
      e.preventDefault();
      tStart={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()};
    }
    function onTouchMove(e) {
      e.preventDefault();
      if (!tStart || over || paused) return;
      var dx=e.touches[0].clientX-tStart.x, dy=e.touches[0].clientY-tStart.y;
      // Swipe continu gauche/droite (seuil 36px)
      if (Math.abs(dx)>Math.abs(dy) && Math.abs(dx)>36) {
        if (dx>0 && fits(cur.cells,cx+1,cy)) { cx++; tStart.x=e.touches[0].clientX; }
        else if (dx<0 && fits(cur.cells,cx-1,cy)) { cx--; tStart.x=e.touches[0].clientX; }
      }
      // Swipe bas continu = softDrop
      if (dy>36 && Math.abs(dy)>Math.abs(dx)) { softDrop(); tStart.y=e.touches[0].clientY; }
    }
    function onTouchEnd(e) {
      e.preventDefault();
      if (!tStart) return;
      var dx=e.changedTouches[0].clientX-tStart.x, dy=e.changedTouches[0].clientY-tStart.y;
      var dt=Date.now()-tStart.t;
      if (over) { startGame(); lastT=0; tStart=null; return; }
      // Tap court = rotation
      if (Math.abs(dx)<20 && Math.abs(dy)<20 && dt<200) { doRotate(); }
      // Swipe bas rapide = hard drop
      else if (dy>80 && Math.abs(dy)>Math.abs(dx)) { hardDrop(); }
      tStart=null;
    }
    cvs.addEventListener('touchstart', onTouchStart, {passive:false});
    cvs.addEventListener('touchmove',  onTouchMove,  {passive:false});
    cvs.addEventListener('touchend',   onTouchEnd,   {passive:false});

    cvs.addEventListener('click',function(){
      if (over) { startGame(); lastT=0; }
      else paused=!paused;
    });

    // ── Cleanup complet ───────────────────────────────────────
    function destroy() {
      _gameRunning = false;
      destroyed = true;
      if (animId) cancelAnimationFrame(animId);
      animId = null;
      document.removeEventListener('keydown', onKey);
      cvs.removeEventListener('touchstart', onTouchStart);
      cvs.removeEventListener('touchmove',  onTouchMove);
      cvs.removeEventListener('touchend',   onTouchEnd);
      if (navObserver) navObserver.disconnect();
      window._tetrisDestroy = null;
      window._tetrisRunning = false;
    }
    window._tetrisDestroy = destroy;
    window._tetrisRunning = false;

    // ── Construction DOM ─────────────────────────────────────
    var hudStyle2 = hudStyle; // alias pour hudStat closure
    function hudStat(label) {
      var w=document.createElement('div');
      w.style.cssText='margin-bottom:14px;';
      var lbl=document.createElement('div');
      lbl.style.cssText='font-size:9px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px;';
      lbl.textContent=label;
      var val=document.createElement('div');
      val.style.cssText=hudStyle2;
      w.appendChild(lbl); w.appendChild(val);
      return [w, val];
    }

    var sW=hudStat('Score');   hudScore=sW[1];
    var lW=hudStat('Lignes');  hudLines=lW[1];
    var lvW=hudStat('Niveau'); hudLevel=lvW[1];
    var bW=hudStat('Record');  hudBest =bW[1];

    hudName=document.createElement('div');
    hudName.style.cssText='font-size:11px;color:#6ee7b7;font-weight:600;margin-top:4px;height:16px;';

    var nextLabel=document.createElement('div');
    nextLabel.style.cssText='font-size:9px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;';
    nextLabel.textContent='Suivant';

    var panel=document.createElement('div');
    panel.style.cssText='display:flex;flex-direction:column;padding:14px 10px 10px 14px;min-width:128px;';
    [sW[0],lW[0],lvW[0],bW[0]].forEach(function(el){panel.appendChild(el);});
    panel.appendChild(hudName);
    var sep=document.createElement('div');
    sep.style.cssText='height:1px;background:rgba(255,255,255,0.08);margin:10px 0;';
    panel.appendChild(sep);
    panel.appendChild(nextLabel);
    panel.appendChild(nCvs);

    var gameRow=document.createElement('div');
    gameRow.style.cssText='display:flex;align-items:flex-start;gap:0;';
    gameRow.appendChild(cvs);
    gameRow.appendChild(panel);

    var controls=document.createElement('div');
    controls.style.cssText='margin-top:12px;padding:10px 14px;background:rgba(255,255,255,0.03);'
      +'border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:12px;color:rgba(255,255,255,0.45);'
      +'display:flex;gap:16px;flex-wrap:wrap;';
    controls.innerHTML='<span>← → Déplacer</span><span>↑ / Z Pivoter</span><span>↓ Descendre</span>'
      +'<span>Espace Chute rapide</span><span>P Pause</span>'
      +'<span style="color:rgba(79,142,247,0.7)">📱 Glisser pour déplacer · Tap pour pivoter · Glisser bas pour chute</span>';

    var legend=document.createElement('div');
    legend.style.cssText='margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;';
    DEFS.forEach(function(d){
      var b=document.createElement('span');
      b.style.cssText='display:inline-flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,0.5);';
      b.innerHTML='<span style="display:inline-block;width:12px;height:12px;background:'+d.c1+';border:1px solid '+d.c2+';border-radius:2px"></span>'+d.name;
      legend.appendChild(b);
    });

    var cardBody=document.createElement('div');
    cardBody.style.cssText='padding:18px;overflow-x:auto;';
    cardBody.appendChild(gameRow);
    cardBody.appendChild(controls);
    cardBody.appendChild(legend);

    // Bouton Quitter dans le header
    var btnQuitter=document.createElement('button');
    btnQuitter.className='btn btn-secondary btn-sm';
    btnQuitter.textContent='✕ Quitter';
    btnQuitter.onclick=function(){ destroy(); App.navigate('dashboard'); };

    var cardHead=document.createElement('div');
    cardHead.className='card-header';
    cardHead.innerHTML='<span class="card-title">🎲 PlaqTetris</span>'
      +'<span style="font-size:12px;color:var(--text-tertiary)">Empile les plaques plâtre !</span>';
    cardHead.appendChild(btnQuitter);

    var card=document.createElement('div');
    card.className='card';
    card.style.cssText='max-width:440px;';
    card.appendChild(cardHead);
    card.appendChild(cardBody);

    var wrap=document.createElement('div');
    wrap.appendChild(card);

    // ── MutationObserver — cleanup auto si on navigue ailleurs
    var navObserver = null;
    try {
      navObserver = new MutationObserver(function() {
        if (!document.body.contains(wrap) && window._tetrisDestroy) {
          destroy();
        }
      });
      var contentEl = document.getElementById('content') || document.body;
      navObserver.observe(contentEl, {childList:true, subtree:false});
    } catch(e) {}

    // ── Démarrage différé (DOM ajouté au document d'abord) ───
    setTimeout(function() {
      startGame();
      _gameRunning = true;
      window._tetrisRunning = true;
      updateHUD();
      requestAnimationFrame(function(ts){ lastT=ts; loop(ts); });
    }, 50);

    return wrap;
  },

});
