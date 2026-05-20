# PROFIL GABRIEL — PlaqPro+ avec Claude

## Identité métier
- Nom : Gabriel / Société : AATB
- Métier : Artisan plaquiste / peintre multi-travaux
- Région : Lyon / Saint-Priest (69)
- Profil client : 70% Pro / 30% Particuliers
- Spécialité : Réponse aux appels d'offres marchés publics et privés

## Méthode de travail avec Claude
- Règle d'or : On termine une tâche jusqu'au bout avant d'en commencer une autre
- Validation : Par capture d'écran ou retour direct
- Rythme : Rapide — on avance, on teste, on corrige
- Checkpoints : PLAQPRO_STATUS.md toutes les 30-45 min
- Débogage : Console F12 — Gabriel colle les erreurs directement
- Déploiement : GitHub Pages uniquement — git push = déploiement auto

## Connaissances métier acquises
- BA13, BA13H, Prégyfeu, ossature 48/70, LV45, ACERMI, EUCEB
- EI30/EI60/CF1h, Rw, DAS, PV DAS, SSI
- CCTP, DPGF, AO, DCE, MOA, MOE, BET, RC, CCAP, AE
- Finition A/B/C, DTU 59.1, COV 2010, étiquette A+
- Prix marché AATB : cloison EI60=92€, porte DAS simple=1850€, porte DAS double=3200€
- AOS = plateforme AO — format Excel colonnes Index/Désignation/Qté DO/PU

## Projet PlaqPro+
- Repo : https://github.com/PlaqPro/plaqpro-web
- URL prod : https://plaqpro.github.io/plaqpro-web/login.html
- Stack : HTML5/CSS3/JS ES6+, localStorage, Groq IA, xlsx-js-style
- Répertoire local : C:\PlaQproWEB\

## Phrases clés
- "On termine une tâche jusqu'au bout sans laisser des bugs en suspension"
- "alléluia :-)" = ça marche enfin
- "on va être coupé" = prompt trop long
- "tu es trop malin :-)" = Claude a anticipé

## Module DPGF — État au 20/05/2026 (fin de journée)
- Scénario 1 ✅ : CCTP PDF (orange) + DPGF Excel (bleu) séparés — fonctionnel
- Scénario 2 ✅ : PDF unique bien structuré (CCTP puis DPGF) — fonctionnel via zone combo (violet)
- Scénario 3 ⚠️ : PDF unique mélangé (technique + chiffrage) — écarté, trop risqué
- Zone combo : avertissement affiché, 3 passes Groq, détection dynamique début DPGF
- Lecture PDF : jusqu'à 60 000 chars via PDF.js
- Rapport Excel : 1 onglet, formules, alertes, conseils AO, xlsx-js-style local

## Prochaine session — Priorités
1. Écran "Gérer ma base prix" dans Paramètres (localStorage plaqpro_prix_marche)
2. Export DPGF remplie — colonnes prix ENT dans format AOS Excel
3. Rapprochement CCTP ↔ DPGF enrichi (justifications auto par exigence)

## Démarrage nouvelle session
1. Lire CLAUDE_PROFILE_GABRIEL.md
2. Lire PLAQPRO_STATUS.md
3. Lire dernier transcript si dispo
4. Résumer en 5 lignes ce qu'on sait
5. Demander "On reprend où ?" et attendre Gabriel

*Créé le 20/05/2026 — Mis à jour fin de journée 20/05/2026*
