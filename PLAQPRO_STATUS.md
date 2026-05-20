## ⏱ CHECKPOINT 20/05/2026 16:30
- Scénario 3 DCE mairie en cours
- Fichier test : Lot-03-Plâtrerie-Peinture-Plafond.pdf (28p, 68585 chars)
- Problème identifié : prompt Groq limité à 6000 chars = 9% du document
- Solution en cours : extraction intelligente partie DPGF

---

# PLAQPRO_STATUS.md — État complet du projet PlaqPro+
> Mis à jour le **18/05/2026** — Sauvegarde backup `C:\PlaQproWEB_BACKUP_2605_SOIR`

---

## 🔐 Accès & Déploiement

### URL de production
```
https://plaqpro.github.io/plaqpro-web/
```
> Hébergement : GitHub Pages (déploiement automatique sur git push vers master)
> Workflow : `.github/workflows/deploy.yml` → branche `gh-pages` → GitHub Pages

### Serveur local de développement
```
python -m http.server 8080
→ http://localhost:8080/login.html
```
> Utiliser `login.html` comme point d'entrée (protège l'accès à `index.html`)

### Identifiants de connexion (login.html)
| Utilisateur | Mot de passe  | Rôle  | Nom affiché    |
|-------------|---------------|-------|----------------|
| `admin`     | `PlaqPro2026!`| admin | Administrateur |
| `gabriel`   | `PlaqPro2026!`| admin | Gabriel        |
| `testeur1`  | `Test2026!`   | user  | Testeur 1      |
| `testeur2`  | `Test2026!`   | user  | Testeur 2      |

> Auth client-side — mots de passe en clair dans `login.html` (ligne 390, objet `PASSWORDS`).
> Session `sessionStorage` 8h — expiration automatique.
> Blocage 30 s après 5 tentatives échouées.
> Badge utilisateur 👑/👤 + bouton Déconnexion dans topbar.

---

## 📁 Structure du projet

```
C:\PlaQproWEB\
├── index.html          — SPA principale, routing, sidebar, modal global
├── login.html          — Écran de connexion avec Auth client-side
├── install.html        — Guide installation PWA (étapes + screenshots)
├── manifest.json       — PWA : name="PlaqPro+", start_url="/login.html", theme=#4F8EF7
├── sw.js               — Service Worker cache-first pour offline
├── _redirects          — Règle Netlify SPA : /* /index.html 200
├── PLAQPRO_STATUS.md   — Ce fichier
├── css/
│   └── style.css       — Design system glassmorphisme (386 l, 19 KB)
├── assets/
│   ├── Logo Plaqpro+.png
│   ├── logo_plaqpro.png
│   ├── icon-192.png    — Icône PWA 192×192
│   └── icon-512.png    — Icône PWA 512×512 (maskable)
└── js/                 — 28 fichiers JavaScript
```

### Backup
```
C:\PlaQproWEB_BACKUP_2605_SOIR\   ← sauvegarde complète du soir du 26/05
```

---

## 📜 Fichiers JavaScript — 28 fichiers

| Fichier | Lignes | KB | Rôle |
|---------|--------|----|------|
| `auth.js` | 89 | 2,7 | Session, protection accès, badge topbar, déconnexion |
| `dpgf.js` | ~1 250 | ~62 | Module Appels d'offres — lecture DPGF Excel/AOS, analyse CCTP PDF via Groq, rapport synthèse Excel 2 onglets |
| `xlsx-js-style.js` | — | 415 | Bibliothèque locale xlsx-js-style v1.2.0 — export Excel avec styles (couleurs, polices, bordures) |
| `db.js` | 246 | 12,7 | Base localStorage — CRUD générique, nextId(), softDelete() |
| `calculs.js` | 119 | 6,0 | Fonctions partagées (fmt, arrondis, ratios, unités) |
| `app.js` | 1 265 | 61,3 | Moteur SPA — navigation, modal, dashboard, clients, chantiers, devis, factures, config |
| `alertes.js` | 394 | 18,6 | Notifications toast, alertes stock, alertes chantier |
| `calculateur.js` | 1 033 | 49,9 | Calcul Express — 5 onglets (Cloisons/Plafond/Peinture/Isolation/Chape) |
| `liste_achat.js` | 341 | 18,3 | Liste d'achat depuis devis, cochage, export |
| `page_cloisons.js` | 343 | 18,8 | Module cloisons par type (simple, double, phonique) |
| `page_peinture.js` | 364 | 19,9 | Module peinture — surfaces, rendement, sous-couche |
| `tarifs.js` | 587 | 27,7 | Grille tarifaire — filtres familles, recherche, import/export |
| `memo_oublis.js` | 178 | 8,1 | Mémo chantier — checklist type plaquiste, sauvegarde |
| `pdf_export.js` | 244 | 11,7 | Export PDF/print devis et factures |
| `produits_complet.js` | 541 | 49,5 | 240+ produits catalogue statiques + moteur recherche + filtres familles |
| `assistant_ia.js` | 355 | 15,5 | Assistant IA — FAQ, DTU, NF C 15-100, conseils techniques |
| `facturation.js` | 252 | 12,6 | Génération factures depuis devis acceptés, acomptes |
| `document_print.js` | 494 | 21,2 | Impression A4 — devis et factures format pro |
| `quiz_plaquiste.js` | 621 | 32,4 | Quiz 50+ questions, 3 niveaux, score, popup jeux sidebar |
| `calculatrice.js` | 417 | 18,1 | Calculatrice métier — convertisseur, surface, périmètre |
| `meteo.js` | 292 | 15,0 | Météo chantier — API **Open-Meteo** (gratuite, sans clé), alertes gel/pluie |
| `graphiques.js` | 237 | 9,9 | Graphiques Chart.js — CA mensuel, répartition chantiers |
| `calendrier.js` | 201 | 10,9 | Calendrier mensuel chantiers — navigation mois |
| `prospection.js` | 1 215 | 69,1 | Prospection IA — permis de construire, carte Leaflet, scoring leads |
| `pack_maconnerie.js` | 1 085 | 48,9 | Pack Maçonnerie — Parpaings/Béton/Enduit/Fondations |
| `pack_electricite.js` | 1 294 | 65,2 | Pack Électricité NF C 15-100 — Tableau/Câblage/Éclairage/Prises/Terre |
| `pack_plomberie.js` | 982 | 58,4 | Pack Plomberie DTU 60.1 — Tuyauterie/Sanitaires/Chauffage/Évacuation |
| `projets_types.js` | 782 | 45,2 | 8 projets types configurables → devis automatiques |
| `devis_multi.js` | 929 | 45,5 | Devis multi-corps d'état — 9 corps, recherche produits, impression A4 |
| `sw.js` | 59 | 1,7 | Service Worker — cache offline PWA |

**Total : 30 fichiers · ~15 250 lignes · ~1 252 KB**

---

## ✅ Fonctionnalités implémentées

### Navigation & Structure
- [x] SPA vanilla JS — navigation sans rechargement
- [x] Sidebar sections avec icônes et highlight page active
- [x] Topbar — titre dynamique, boutons + Client / + Chantier / ⚡ Calcul express
- [x] Modal global réutilisable (`App.openModal` / `App.closeModal`)
- [x] Design glassmorphisme dark (CSS variables, `--accent: #4F8EF7`)
- [x] Responsive sidebar + grilles adaptatives
- [x] Auth `login.html` + protection `auth.js` (redirect automatique)
- [x] PWA installable — manifest + service worker + `install.html`

### Tableau de bord
- [x] Stats temps réel (chantiers en cours, CA mois, devis en attente)
- [x] Derniers chantiers + derniers devis
- [x] Actions rapides (boutons)
- [x] Graphiques Chart.js (CA mensuel, répartition statuts)

### Clients
- [x] Liste + recherche + filtres
- [x] Fiche complète (coordonnées, SIRET, notes)
- [x] Modal création / édition
- [x] Soft delete (archivage)

### Chantiers
- [x] Liste avec filtres statut (En cours / En attente / Terminé)
- [x] Fiche — dates, client lié, surface, notes
- [x] Total devis par chantier
- [x] Liens vers métrés, cloisons, peinture

### Calendrier
- [x] Vue mensuelle des chantiers
- [x] Navigation mois précédent / suivant
- [x] Indicateurs visuels chantiers par jour

### Métrés
- [x] Saisie pièce par pièce (L × l × H)
- [x] Calcul surfaces murs / sol / plafond
- [x] Export vers calculateur

### Calcul Express (`calculateur.js`)
- [x] **Cloisons** — BA/rail/montants/vis/bandes/enduit
- [x] **Plafond** — ossature + plaques
- [x] **Peinture** — surf nette, sous-couche, finition
- [x] **Isolation** — laine de verre, épaisseurs
- [x] **Chape** — volume béton / chape fluide
- [x] Résultats HT / MO / TVA 10% & 20% / TTC
- [x] Création devis depuis résultats

### Cloisons & Peinture (pages dédiées)
- [x] Calcul cloisons par type (simple, double, phonique)
- [x] Calcul peinture avec rendement et nombre de couches

### Devis
- [x] Liste avec filtres statut
- [x] Création — lignes, quantités, prix, TVA
- [x] Statuts : Brouillon / Envoyé / Accepté / Refusé
- [x] Impression A4 professionnelle
- [x] Conversion devis → facture
- [x] Numérotation automatique (préfixe configurable)

### Devis Complet Multi-corps d'état (`devis_multi.js`)
- [x] 9 corps : Cloisons, Plafond, Peinture, Électricité, Plomberie, Carrelage, Sol, Démolition, Autre
- [x] Sections avec titre éditable + TVA par section (10/20/5.5/0%)
- [x] Recherche produits 3 lettres (CATALOGUE + DB.produits)
- [x] Lignes article libre avec focus auto
- [x] Sous-totaux par section en temps réel
- [x] Récapitulatif global sticky (HT / TVA mixtes / TTC)
- [x] Impression A4 pro avec récap et pied de page
- [x] Enregistrement vers `DB.devis`

### Factures
- [x] Génération depuis devis accepté
- [x] Numérotation auto `FAC-YYYY-XXXX`
- [x] Impression A4

### Liste d'achat
- [x] Génération depuis un devis
- [x] Cochage articles, tri par famille

### Grille tarifaire
- [x] Catalogue complet avec filtres familles
- [x] Recherche libre avec surbrillance

### Mémo chantier
- [x] Checklist par type de travaux
- [x] Sauvegarde état par chantier

### Base produits (`produits_complet.js`)
- [x] 240+ produits statiques catalogue
- [x] Familles : Plaque plâtre, Carreau, Ossature métal, Fixation, Isolation, Enduit/Joint, Peinture, Sol, Maçonnerie, Plomberie, Électricité, Sanitaire, Cloison spéciale, Main d'œuvre
- [x] Produits DB dynamiques (ajout/modif via Base tarifaire)
- [x] Moteur recherche avec surbrillance
- [x] Filtres familles avec compteurs

### Pack Maçonnerie (`pack_maconnerie.js`)
- [x] Parpaings/Briques — quantités, colle, rejointoiement
- [x] Béton/Chape — volume, ferraillage
- [x] Enduit Façade — surface, couches, armature
- [x] Fondations — fouilles, béton, ferraillage
- [x] Alertes normatives colorées
- [x] Bouton "Créer devis"

### Pack Électricité — NF C 15-100 (`pack_electricite.js`)
- [x] Tableau électrique — circuits, modules, disjoncteur général
- [x] Câblage — chute de tension, section, alertes >3%
- [x] Éclairage — flux lumineux, spots LED, 5 types de pièce
- [x] Prises — règles NFC 15-100 par type de pièce
- [x] Terre — résistance piquet, réseau parallèle
- [x] Table de référence sections/intensités/disjoncteurs
- [x] 19 produits électricité en base catalogue

### Pack Plomberie — DTU 60.1 / DTU 60.11 (`pack_plomberie.js`)
- [x] Tuyauterie — 4 matériaux, raccords, isolation, nourrice
- [x] Sanitaires — 6 types, mitigeur standard/thermostatique
- [x] Chauffage — puissance/surface, plancher chauffant hydraulique
- [x] Évacuation — DN100/DN50, contrôle pente (alertes DTU)
- [x] Table de référence débits
- [x] Bouton "Créer devis"

### Projets Types (`projets_types.js`)
- [x] 8 modèles : Salle de bain, Bureau cloisons, Appartement T3, Cuisine, Local commercial, Cloison vitrée, Chambre, Douche italienne
- [x] Inputs dimensions → quantités automatiques
- [x] Tableau lignes entièrement éditable (ref/désig/unité/qté/prix)
- [x] Article libre + 💾 "Sauvegarder en base produits"
- [x] Totaux HT / TVA 10% / TTC
- [x] Bouton "Créer ce devis" → modal client/chantier → `DB.addDevis()`

### Module DPGF / Appels d'offres (`dpgf.js`) ✅ TERMINÉ
- [x] **Double upload** — zone CCTP (PDF) + zone DPGF (Excel), grille 2 colonnes
- [x] **Lecture PDF via PDF.js** — extraction texte page par page (jusqu'à 20 pages, 18 000 chars)
- [x] **Détection format AOS** — reconnaissance automatique en-tête (désignation/unité/qté) dans les 20 premières lignes, bypass Groq
- [x] **Analyse CCTP via Groq** (`llama-3.3-70b-versatile`) — extraction JSON structuré : infos affaire (MOA/MOE/Économiste/Lot/Référence/DCE) + exigences techniques
- [x] **Analyse DPGF via Groq** (`llama-3.1-8b-instant`) — extraction lignes avec désignation, unité, quantité, prix unitaire
- [x] **Base prix marché** — 22 familles de travaux plaquisterie/peinture avec PU de référence
- [x] **Rapport synthèse Excel 2 onglets** (xlsx-js-style v1.2.0) :
  - Onglet 1 "Synthèse (modifiable)" — en-tête affaire (MOA/MOE/Économiste), tableau avec PU DO + PU AATB + montants, totaux HT/TVA/TTC, bloc NOTES DÉTAILLÉES, bloc ANALYSE DES ÉCARTS, CONSEILS GÉNÉRAUX
  - Onglet 2 "Base prix marché" — référentiel complet avec PU min/max
- [x] **Styles professionnels** — couleurs BM (bleu marine), alternance lignes, en-têtes colorés, totaux gras, hauteurs de lignes personnalisées
- [x] **Formules Excel réelles** — format `{ t:'n', v:valeurPré-calculée, f:'=formule' }` pour recalcul dans Excel
- [x] **`ws1['!ref']`** — plage dynamique couvrant toutes les lignes générées post-AOA

### Prospection IA (`prospection.js`)
- [x] Carte Leaflet des permis de construire
- [x] Scoring leads IA
- [x] Export prospects

### Assistant IA (`assistant_ia.js`)
- [x] FAQ plaquisterie / DTU / NF C 15-100
- [x] Conseils techniques contextuels

### Graphiques (`graphiques.js`)
- [x] CA mensuel — Chart.js
- [x] Répartition chantiers par statut

### Météo (`meteo.js`)
- [x] API **Open-Meteo** (gratuite, **sans clé API**)
- [x] Géocodage automatique par nom de ville
- [x] Alertes gel / pluie / vent pour chantiers
- [x] Ville configurable dans Configuration

### Jeux
- [x] Quiz Plaquiste — 50+ questions, 3 niveaux, score, popup sidebar
- [ ] PlaqTetris — affiché "bientôt" dans sidebar
- [ ] Chantier Rush — affiché "bientôt" dans sidebar

### Configuration (`app.js`)
- [x] Infos entreprise (nom, adresse, SIRET, IBAN, RCS…)
- [x] Préfixe numérotation devis/factures
- [x] Ville météo
- [x] Conditions de paiement / mentions légales
- [x] Pied de page devis et factures

### Données & Persistance
- [x] 100% localStorage — zéro serveur backend
- [x] Export/Import JSON global
- [x] Données de démonstration auto-initialisées
- [x] Soft delete (archivage sans suppression définitive)

---

## 🚧 Backlog — Ce qui reste à faire

### Priorité haute
- [ ] **Signature électronique devis** — canvas HTML5, PNG embarqué dans PDF
- [ ] **Email devis** — `mailto:` pré-rempli avec PDF en pièce jointe (Blob URL)
- [ ] **Suivi avancement chantier** — % complétion par poste, timeline Gantt simple
- [ ] **Module photos chantier** — upload/capture, galerie par chantier (localStorage Blob)
- [ ] **Bug potentiel numérotation** — `nextId()` peut dupliquer si localStorage resetté

### Priorité moyenne
- [ ] **Relances devis** — alertes auto devis envoyés depuis X jours sans réponse
- [ ] **Acomptes & échéancier** — 30% commande / 70% livraison, suivi règlements
- [ ] **Export Excel** — SheetJS pour clients / chantiers / CA
- [ ] **Pack Isolation thermique** — ITI/ITE, laines, panneaux, R requis par DTU
- [ ] **Pack Carrelage** — surfaces, colle, joint, opus romain
- [ ] **Pack Sol souple** — LVT, parquet, sous-couche, plinthes
- [ ] **Bibliothèque clauses devis** — textes standard insertibles (garanties, conditions)

### Priorité basse / améliorations
- [ ] **PlaqTetris** — jeu pièces placo
- [ ] **Chantier Rush** — mini-jeu gestion chantier
- [ ] **Mode hors-ligne complet** — améliorer cache SW, sync différée
- [ ] **Multi-utilisateurs** — partage données inter-appareils (nécessite backend)
- [ ] **Thème clair** — toggle dark/light mode
- [ ] **QR code sur devis** — watermark BROUILLON/ACCEPTÉ
- [ ] **Historique modifications** — log des changements par entité
- [ ] **Sauvegarde cloud** — Google Drive ou Dropbox API JS
- [ ] **Calculatrice flottante** — widget accessible depuis toutes les pages

---

## 🗺️ Sidebar — Structure actuelle

```
Principal
  ⊞  Tableau de bord
  ⚡  Calcul Express

Gestion
  👤  Clients
  🏗  Chantiers
  📅  Calendrier
  🎯  Prospection IA

Travaux
  📐  Métrés
  🧱  Cloisons
  🎨  Peinture

Commercial
  📄  Devis
  📋  Devis complet
  🧾  Factures
  📦  Projets types
  🛒  Liste d'achat
  💶  Grille tarifaire
  ✅  Mémo chantier

Params
  💰  Base tarifaire

Packs Métier
  🧱  Pack Maçonnerie
  ⚡  Électricité
  🔧  Plomberie

Footer (fixe)
  ⚙️  Configuration
  🎮  Jeux → popup Quiz / PlaqTetris (bientôt) / Chantier Rush (bientôt)
```

---

## 🗄️ localStorage — Clés utilisées

| Clé | Contenu |
|-----|---------|
| `plaqpro_clients` | Clients (nom, adresse, SIRET, tel, email…) |
| `plaqpro_chantiers` | Chantiers (clientId, nom, dates, statut, notes) |
| `plaqpro_metrages` | Métrés par chantier (pièces L×l×H) |
| `plaqpro_cloisons` | Calculs cloisons sauvegardés |
| `plaqpro_peintures` | Calculs peinture sauvegardés |
| `plaqpro_devis` | Devis (numero, lignes[], totalHT, totalTTC, statut) |
| `plaqpro_factures` | Factures générées depuis devis |
| `plaqpro_produits` | Produits tarifaires personnalisés |
| `plaqpro_ratios` | Ratios de calcul (ml/m², etc.) |
| `plaqpro_config` | Config entreprise (nom, SIRET, IBAN, préfixe…) |
| `plaqpro_prospects` | Leads prospection IA |
| `plaqpro_session` | Session auth (**sessionStorage**, expire auto 8h) |

---

## 📦 Dépendances externes (CDN — zéro npm, zéro build)

| Lib | Version | Usage | Clé API ? |
|-----|---------|-------|-----------|
| Leaflet | 1.9.4 | Carte prospection | Non |
| Chart.js | latest | Graphiques dashboard | Non |
| QRCode.js | 1.5.3 | QR code sur devis | Non |
| Google Fonts | Outfit | Typographie | Non |
| Open-Meteo | v1 | Météo (géocodage + prévisions) | **Non — gratuit** |
| PDF.js | 3.11.174 | Extraction texte PDF (CCTP) — `cdnjs.cloudflare.com` | Non |
| xlsx-js-style | 1.2.0 | Export Excel avec styles — **local** `js/xlsx-js-style.js` | Non |
| Groq API | v1 | Analyse IA DPGF + CCTP (llama-3.1-8b / llama-3.3-70b) | **Oui — configurée dans l'app** |

> **Aucune clé API requise pour les fonctions de base.** La clé Groq est optionnelle (DPGF + Assistant IA) — configurable dans l'application (⚙️ Configuration → Clé Groq).

---

## 🔧 Architecture technique

- **Stack** : HTML5 / CSS3 / JavaScript ES6+ vanilla — zéro framework, zéro build
- **Pattern SPA** : routing client-side dans `index.html` (DOMContentLoaded)
- **Pages** : `Pages.xxx = function() { return domElement; }`
- **Navigation** : `App.navigate(page, params)` → `pageMap[page]()`
- **DB** : Objet `DB` singleton — CRUD localStorage, `nextId()`, `softDelete()`
- **Styles** : CSS variables glassmorphisme + `<style id="xxx">` injectés par module (guard anti-doublon)
- **Auth** : Mots de passe en clair dans `login.html` (démo) — session `sessionStorage` 8h
- **PWA** : `manifest.json` + `sw.js` cache-first pour offline

---

## 🌐 Déploiement Netlify — Procédure

1. Aller sur **https://app.netlify.com**
2. Drag & drop du dossier `C:\PlaQproWEB` sur la zone de drop
3. Récupérer l'URL générée (ex: `https://xxxxx.netlify.app`)
4. Mettre l'URL ici dans ce fichier
5. Pour les mises à jour : re-drag & drop ou utiliser `netlify-cli`

> Le fichier `_redirects` gère le routing SPA (toutes les routes → `index.html`).
> Aucune configuration serveur supplémentaire n'est nécessaire.

---

---

## 📋 Session 20/05/2026 — Module DPGF AO complet

### TERMINÉ ✅
- Double upload CCTP PDF + DPGF Excel
- Lecture PDF via PDF.js (texte lisible)
- Analyse Groq : extraction infos affaire (MOA/MOE/Économiste/Lot/Référence/DCE)
- Rapport synthèse 1 onglet : tableau + formules + commentaires + alertes + recommandations + conseils AO
- Rapprochement automatique CCTP ↔ DPGF (`_rapprocher`)
- Scénario 2 : PDF unique CCTP+DPGF — extraction `lignes_dpgf` automatique
- Déploiement GitHub Pages natif (workflow Actions v4)
- xlsx-js-style en local (`js/xlsx-js-style.js`)

### EN COURS 🔄
- Scénario 3 : DCE complet mairie (28 pages) — à tester en nouvelle conversation
- Écran "Gérer ma base prix" dans Paramètres
- Rapprochement technique CCTP ↔ DPGF à enrichir

### PROCHAINE SESSION
1. Tester scénario 3 DCE mairie
2. Écran base prix
3. Export DPGF remplie avec prix ENT

---

*Dernière mise à jour : 20/05/2026*
