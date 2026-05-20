# 👤 PROFIL GABRIEL — PlaqPro+ avec Claude

## Identité métier
- **Nom** : Gabriel
- **Société** : AATB
- **Métier** : Artisan plaquiste / peintre — multi-travaux
- **Région** : Lyon / Saint-Priest (69)
- **Profil client** : 70% Pro (bureaux, ERP) / 30% Particuliers
- **Spécialité AO** : Réponse aux appels d'offres marchés publics et privés

## Méthode de travail avec Claude
- **Règle d'or** : On termine une tâche jusqu'au bout avant d'en commencer une autre
- **Validation** : Par capture d'écran ou retour direct ("ça marche", "toujours pas")
- **Prompts** : Directs dans Claude Code — pas de questions inutiles
- **Rythme** : Rapide — on avance, on teste, on corrige
- **Checkpoints** : PLAQPRO_STATUS.md mis à jour régulièrement (toutes les 30-45 min)
- **Débogage** : Console navigateur F12 — Gabriel colle les erreurs directement
- **Déploiement** : GitHub Pages uniquement (plus Netlify) — git push = déploiement auto

## Connaissances métier à ne pas réexpliquer
- BA13, BA13H, Prégyfeu, ossature 48/70, LV45, ACERMI
- EI30/EI60/CF1h, Rw, DAS, PV DAS, SSI
- CCTP, DPGF, AO, DCE, MOA, MOE, BET, RC, CCAP, AE
- Finition A/B/C, DTU 59.1, COV 2010, étiquette A+
- Prix de marché : cloison EI60 = 85-105€, porte DAS simple = 1850€, porte DAS double = 3200€
- AOS = plateforme appel d'offres — format Excel avec colonnes Index/Désignation/Qté DO/PU

## Projet PlaqPro+
- **Repo** : https://github.com/PlaqPro/plaqpro-web
- **URL prod** : https://plaqpro.github.io/plaqpro-web/login.html
- **Stack** : HTML5/CSS3/JS ES6+, localStorage, Groq IA, SheetJS xlsx-js-style
- **Déploiement** : GitHub Actions natif (workflow deploy.yml)
- **Répertoire local** : C:\PlaQproWEB\

## Modules PlaqPro+ — État
- ✅ Login SHA-256
- ✅ Devis multi-travaux
- ✅ Facturation
- ✅ Liste achats
- ✅ Clients (Pro/Particulier + SIRET)
- ✅ Chantiers
- ✅ Export Excel (xlsx-js-style)
- ✅ Impression PDF devis
- ✅ Profil entreprise (mix Pro/Part, marges, TVA)
- ✅ Projets types (13 projets)
- ✅ Grille tarifaire
- ✅ **Module DPGF / AO** — complet (voir ci-dessous)

## Module DPGF — Détail
- Double upload : CCTP PDF (orange) + DPGF Excel (bleu)
- Lecture PDF via PDF.js 3.11.174
- Analyse Groq llama-3.3-70b-versatile → extraction infos affaire + exigences CCTP
- Détection format AOS automatique (colonnes Index/Désig/Qté DO/PU)
- Base prix marché AATB (23 postes, localStorage plaqpro_prix_marche)
- Rapprochement automatique CCTP ↔ DPGF (_rapprocher)
- Rapport synthèse Excel : 1 onglet (tableau + formules + commentaires + alertes + conseils AO)
- Scénario 1 : CCTP PDF + DPGF Excel séparés ✅
- Scénario 2 : PDF unique CCTP+DPGF → extraction lignes_dpgf auto ✅
- Scénario 3 : DCE complet mairie (en cours) 🔄

## Ce qui reste à faire (priorité)
1. 🔄 Scénario 3 : DCE mairie — extraction intelligente début+fin document
2. ⬜ Écran "Gérer ma base prix" dans Paramètres
3. ⬜ Export DPGF remplie avec prix ENT dans colonnes AOS
4. ⬜ Rapprochement CCTP ↔ DPGF enrichi (justifications auto par exigence)
5. ⬜ Calcul express multi-corps (Électricité/Carrelage/Plomberie)
6. ⬜ Sauvegarde cloud Google Drive

## Phrases clés de Gabriel
- "On termine une tâche jusqu'au bout sans laisser des bugs ou des questions en suspension"
- "c'est là où ton rôle est super important"
- "alléluia :-)" — quand quelque chose fonctionne enfin
- "on va être coupé" — quand un prompt est trop long
- "tu es trop malin :-)" — quand Claude anticipe

## Comment démarrer une nouvelle session
1. Lire ce fichier CLAUDE_PROFILE_GABRIEL.md
2. Lire PLAQPRO_STATUS.md
3. Lire le dernier transcript si disponible
4. Résumer ce qu'on sait en 5 lignes
5. Demander : "On reprend où ?" et attendre la réponse de Gabriel

---
*Créé le 20/05/2026 — Session fondatrice PlaqPro+*
