## ⏱ CHECKPOINT 21/05/2026
### Terminé aujourd'hui ✅
- TVA auto-liquidée devis + factures + PDF
- Export DPGF complétée format AOS pro
- Workflow CCTP+DPGF obligatoires — boutons grisés jusqu'au chargement complet
- Fix pm.forEach → Object.entries
- Fix sélecteur boutons via IDs
- Fix autofill fond jaune login

### Prochaine étape
1. Calcul express multi-corps
2. Sauvegarde cloud Google Drive
3. PlaqTetris

---## ⏱ CHECKPOINT 21/05/2026
### TVA auto-liquidée ✅ TERMINÉE
- Select TVA 0% dans devis
- Ligne TVA masquée quand 0%
- Total HT → Total quand auto-liquidée
- NET À PAYER au lieu de TOTAL TTC
- Mention légale CGI 283-2 dans pied de devis
- Fix aperçu impression PDF

### Prochaine étape
1. TVA auto-liquidée sur factures
2. Export DPGF remplie avec prix ENT
3. Utiliser puST dans module DPGF

---## â± CHECKPOINT 21/05/2026 06:00
### TerminÃ© session 20-21/05/2026
- Fix bouton Main d'oeuvre (apostrophe onclick)
- Ã‰cran Base prix de marchÃ© : 6 corps de mÃ©tier (68 postes)
- Boutons filtres : Placo/Elec/Plomb/Menu/Carrelage/Divers
- Colonnes PU Vente + PU Sous-traitant + sauvegarde localStorage
- CLAUDE_PROFILE_GABRIEL.md crÃ©Ã© pour continuitÃ© sessions
- Module DPGF complet : triple upload, 3 passes Groq, rapport synthÃ¨se

### Prochaine session â€” PrioritÃ©s
1. TVA auto-liquidÃ©e (paramÃ¨tre chantier/client)
2. Export DPGF remplie avec prix ENT colonnes AOS
3. Utiliser puST dans module DPGF

---

## â± CHECKPOINT FIN DE JOURNÃ‰E 20/05/2026
### Module DPGF â€” Ã‰tat final
- ScÃ©nario 1 âœ… : CCTP PDF + DPGF Excel sÃ©parÃ©s â€” 100% fonctionnel
- ScÃ©nario 2 âœ… : PDF unique CCTP+DPGF bien structurÃ© â€” fonctionnel
- ScÃ©nario 3 âš ï¸ : PDF unique CCTP+DPGF mÃ©langÃ©s â€” Ã©cartÃ© (trop risquÃ©)
- Avertissement utilisateur ajoutÃ© sur zone combo
- CLAUDE_PROFILE_GABRIEL.md crÃ©Ã© pour continuitÃ© entre sessions

### Prochaine session (prioritÃ©s)
1. Ã‰cran "GÃ©rer ma base prix" dans ParamÃ¨tres
2. Export DPGF remplie avec prix ENT dans colonnes AOS
3. Rapprochement CCTP â†” DPGF enrichi

---

## â± CHECKPOINT 20/05/2026 17:15
- ScÃ©nario 3 DCE mairie : module combo CCTP+DPGF PDF terminÃ© âœ…
- Triple zone upload : CCTP seul / DPGF seul / CCTP+DPGF combo (violet)
- Analyse 4 passes Groq sÃ©quentielles avec dÃ©lai 1s anti-rate-limit
- Lecture PDF Ã©tendue Ã  60 000 chars (Ã©tait 18 000)
- DPGF dÃ©coupÃ© en 2 parties (tiers milieu + dernier tiers) â†’ fusion + dÃ©duplification
- Fichier test : Lot-03-PlÃ¢trerie-Peinture-Plafond.pdf (28p, 68 585 chars, 19 lignes DPGF)
- Prochain test : charger le PDF dans la zone combo et valider l'extraction

---

# PLAQPRO_STATUS.md â€” Ã‰tat complet du projet PlaqPro+
> Mis Ã  jour le **18/05/2026** â€” Sauvegarde backup `C:\PlaQproWEB_BACKUP_2605_SOIR`

---

## ðŸ” AccÃ¨s & DÃ©ploiement

### URL de production
```
https://plaqpro.github.io/plaqpro-web/
```
> HÃ©bergement : GitHub Pages (dÃ©ploiement automatique sur git push vers master)
> Workflow : `.github/workflows/deploy.yml` â†’ branche `gh-pages` â†’ GitHub Pages

### Serveur local de dÃ©veloppement
```
python -m http.server 8080
â†’ http://localhost:8080/login.html
```
> Utiliser `login.html` comme point d'entrÃ©e (protÃ¨ge l'accÃ¨s Ã  `index.html`)

### Identifiants de connexion (login.html)
| Utilisateur | Mot de passe  | RÃ´le  | Nom affichÃ©    |
|-------------|---------------|-------|----------------|
| `admin`     | `PlaqPro2026!`| admin | Administrateur |
| `gabriel`   | `PlaqPro2026!`| admin | Gabriel        |
| `testeur1`  | `Test2026!`   | user  | Testeur 1      |
| `testeur2`  | `Test2026!`   | user  | Testeur 2      |

> Auth client-side â€” mots de passe en clair dans `login.html` (ligne 390, objet `PASSWORDS`).
> Session `sessionStorage` 8h â€” expiration automatique.
> Blocage 30 s aprÃ¨s 5 tentatives Ã©chouÃ©es.
> Badge utilisateur ðŸ‘‘/ðŸ‘¤ + bouton DÃ©connexion dans topbar.

---

## ðŸ“ Structure du projet

```
C:\PlaQproWEB\
â”œâ”€â”€ index.html          â€” SPA principale, routing, sidebar, modal global
â”œâ”€â”€ login.html          â€” Ã‰cran de connexion avec Auth client-side
â”œâ”€â”€ install.html        â€” Guide installation PWA (Ã©tapes + screenshots)
â”œâ”€â”€ manifest.json       â€” PWA : name="PlaqPro+", start_url="/login.html", theme=#4F8EF7
â”œâ”€â”€ sw.js               â€” Service Worker cache-first pour offline
â”œâ”€â”€ _redirects          â€” RÃ¨gle Netlify SPA : /* /index.html 200
â”œâ”€â”€ PLAQPRO_STATUS.md   â€” Ce fichier
â”œâ”€â”€ css/
â”‚   â””â”€â”€ style.css       â€” Design system glassmorphisme (386 l, 19 KB)
â”œâ”€â”€ assets/
â”‚   â”œâ”€â”€ Logo Plaqpro+.png
â”‚   â”œâ”€â”€ logo_plaqpro.png
â”‚   â”œâ”€â”€ icon-192.png    â€” IcÃ´ne PWA 192Ã—192
â”‚   â””â”€â”€ icon-512.png    â€” IcÃ´ne PWA 512Ã—512 (maskable)
â””â”€â”€ js/                 â€” 28 fichiers JavaScript
```

### Backup
```
C:\PlaQproWEB_BACKUP_2605_SOIR\   â† sauvegarde complÃ¨te du soir du 26/05
```

---

## ðŸ“œ Fichiers JavaScript â€” 28 fichiers

| Fichier | Lignes | KB | RÃ´le |
|---------|--------|----|------|
| `auth.js` | 89 | 2,7 | Session, protection accÃ¨s, badge topbar, dÃ©connexion |
| `dpgf.js` | ~1 250 | ~62 | Module Appels d'offres â€” lecture DPGF Excel/AOS, analyse CCTP PDF via Groq, rapport synthÃ¨se Excel 2 onglets |
| `xlsx-js-style.js` | â€” | 415 | BibliothÃ¨que locale xlsx-js-style v1.2.0 â€” export Excel avec styles (couleurs, polices, bordures) |
| `db.js` | 246 | 12,7 | Base localStorage â€” CRUD gÃ©nÃ©rique, nextId(), softDelete() |
| `calculs.js` | 119 | 6,0 | Fonctions partagÃ©es (fmt, arrondis, ratios, unitÃ©s) |
| `app.js` | 1 265 | 61,3 | Moteur SPA â€” navigation, modal, dashboard, clients, chantiers, devis, factures, config |
| `alertes.js` | 394 | 18,6 | Notifications toast, alertes stock, alertes chantier |
| `calculateur.js` | 1 033 | 49,9 | Calcul Express â€” 5 onglets (Cloisons/Plafond/Peinture/Isolation/Chape) |
| `liste_achat.js` | 341 | 18,3 | Liste d'achat depuis devis, cochage, export |
| `page_cloisons.js` | 343 | 18,8 | Module cloisons par type (simple, double, phonique) |
| `page_peinture.js` | 364 | 19,9 | Module peinture â€” surfaces, rendement, sous-couche |
| `tarifs.js` | 587 | 27,7 | Grille tarifaire â€” filtres familles, recherche, import/export |
| `memo_oublis.js` | 178 | 8,1 | MÃ©mo chantier â€” checklist type plaquiste, sauvegarde |
| `pdf_export.js` | 244 | 11,7 | Export PDF/print devis et factures |
| `produits_complet.js` | 541 | 49,5 | 240+ produits catalogue statiques + moteur recherche + filtres familles |
| `assistant_ia.js` | 355 | 15,5 | Assistant IA â€” FAQ, DTU, NF C 15-100, conseils techniques |
| `facturation.js` | 252 | 12,6 | GÃ©nÃ©ration factures depuis devis acceptÃ©s, acomptes |
| `document_print.js` | 494 | 21,2 | Impression A4 â€” devis et factures format pro |
| `quiz_plaquiste.js` | 621 | 32,4 | Quiz 50+ questions, 3 niveaux, score, popup jeux sidebar |
| `calculatrice.js` | 417 | 18,1 | Calculatrice mÃ©tier â€” convertisseur, surface, pÃ©rimÃ¨tre |
| `meteo.js` | 292 | 15,0 | MÃ©tÃ©o chantier â€” API **Open-Meteo** (gratuite, sans clÃ©), alertes gel/pluie |
| `graphiques.js` | 237 | 9,9 | Graphiques Chart.js â€” CA mensuel, rÃ©partition chantiers |
| `calendrier.js` | 201 | 10,9 | Calendrier mensuel chantiers â€” navigation mois |
| `prospection.js` | 1 215 | 69,1 | Prospection IA â€” permis de construire, carte Leaflet, scoring leads |
| `pack_maconnerie.js` | 1 085 | 48,9 | Pack MaÃ§onnerie â€” Parpaings/BÃ©ton/Enduit/Fondations |
| `pack_electricite.js` | 1 294 | 65,2 | Pack Ã‰lectricitÃ© NF C 15-100 â€” Tableau/CÃ¢blage/Ã‰clairage/Prises/Terre |
| `pack_plomberie.js` | 982 | 58,4 | Pack Plomberie DTU 60.1 â€” Tuyauterie/Sanitaires/Chauffage/Ã‰vacuation |
| `projets_types.js` | 782 | 45,2 | 8 projets types configurables â†’ devis automatiques |
| `devis_multi.js` | 929 | 45,5 | Devis multi-corps d'Ã©tat â€” 9 corps, recherche produits, impression A4 |
| `sw.js` | 59 | 1,7 | Service Worker â€” cache offline PWA |

**Total : 30 fichiers Â· ~15 250 lignes Â· ~1 252 KB**

---

## âœ… FonctionnalitÃ©s implÃ©mentÃ©es

### Navigation & Structure
- [x] SPA vanilla JS â€” navigation sans rechargement
- [x] Sidebar sections avec icÃ´nes et highlight page active
- [x] Topbar â€” titre dynamique, boutons + Client / + Chantier / âš¡ Calcul express
- [x] Modal global rÃ©utilisable (`App.openModal` / `App.closeModal`)
- [x] Design glassmorphisme dark (CSS variables, `--accent: #4F8EF7`)
- [x] Responsive sidebar + grilles adaptatives
- [x] Auth `login.html` + protection `auth.js` (redirect automatique)
- [x] PWA installable â€” manifest + service worker + `install.html`

### Tableau de bord
- [x] Stats temps rÃ©el (chantiers en cours, CA mois, devis en attente)
- [x] Derniers chantiers + derniers devis
- [x] Actions rapides (boutons)
- [x] Graphiques Chart.js (CA mensuel, rÃ©partition statuts)

### Clients
- [x] Liste + recherche + filtres
- [x] Fiche complÃ¨te (coordonnÃ©es, SIRET, notes)
- [x] Modal crÃ©ation / Ã©dition
- [x] Soft delete (archivage)

### Chantiers
- [x] Liste avec filtres statut (En cours / En attente / TerminÃ©)
- [x] Fiche â€” dates, client liÃ©, surface, notes
- [x] Total devis par chantier
- [x] Liens vers mÃ©trÃ©s, cloisons, peinture

### Calendrier
- [x] Vue mensuelle des chantiers
- [x] Navigation mois prÃ©cÃ©dent / suivant
- [x] Indicateurs visuels chantiers par jour

### MÃ©trÃ©s
- [x] Saisie piÃ¨ce par piÃ¨ce (L Ã— l Ã— H)
- [x] Calcul surfaces murs / sol / plafond
- [x] Export vers calculateur

### Calcul Express (`calculateur.js`)
- [x] **Cloisons** â€” BA/rail/montants/vis/bandes/enduit
- [x] **Plafond** â€” ossature + plaques
- [x] **Peinture** â€” surf nette, sous-couche, finition
- [x] **Isolation** â€” laine de verre, Ã©paisseurs
- [x] **Chape** â€” volume bÃ©ton / chape fluide
- [x] RÃ©sultats HT / MO / TVA 10% & 20% / TTC
- [x] CrÃ©ation devis depuis rÃ©sultats

### Cloisons & Peinture (pages dÃ©diÃ©es)
- [x] Calcul cloisons par type (simple, double, phonique)
- [x] Calcul peinture avec rendement et nombre de couches

### Devis
- [x] Liste avec filtres statut
- [x] CrÃ©ation â€” lignes, quantitÃ©s, prix, TVA
- [x] Statuts : Brouillon / EnvoyÃ© / AcceptÃ© / RefusÃ©
- [x] Impression A4 professionnelle
- [x] Conversion devis â†’ facture
- [x] NumÃ©rotation automatique (prÃ©fixe configurable)

### Devis Complet Multi-corps d'Ã©tat (`devis_multi.js`)
- [x] 9 corps : Cloisons, Plafond, Peinture, Ã‰lectricitÃ©, Plomberie, Carrelage, Sol, DÃ©molition, Autre
- [x] Sections avec titre Ã©ditable + TVA par section (10/20/5.5/0%)
- [x] Recherche produits 3 lettres (CATALOGUE + DB.produits)
- [x] Lignes article libre avec focus auto
- [x] Sous-totaux par section en temps rÃ©el
- [x] RÃ©capitulatif global sticky (HT / TVA mixtes / TTC)
- [x] Impression A4 pro avec rÃ©cap et pied de page
- [x] Enregistrement vers `DB.devis`

### Factures
- [x] GÃ©nÃ©ration depuis devis acceptÃ©
- [x] NumÃ©rotation auto `FAC-YYYY-XXXX`
- [x] Impression A4

### Liste d'achat
- [x] GÃ©nÃ©ration depuis un devis
- [x] Cochage articles, tri par famille

### Grille tarifaire
- [x] Catalogue complet avec filtres familles
- [x] Recherche libre avec surbrillance

### MÃ©mo chantier
- [x] Checklist par type de travaux
- [x] Sauvegarde Ã©tat par chantier

### Base produits (`produits_complet.js`)
- [x] 240+ produits statiques catalogue
- [x] Familles : Plaque plÃ¢tre, Carreau, Ossature mÃ©tal, Fixation, Isolation, Enduit/Joint, Peinture, Sol, MaÃ§onnerie, Plomberie, Ã‰lectricitÃ©, Sanitaire, Cloison spÃ©ciale, Main d'Å“uvre
- [x] Produits DB dynamiques (ajout/modif via Base tarifaire)
- [x] Moteur recherche avec surbrillance
- [x] Filtres familles avec compteurs

### Pack MaÃ§onnerie (`pack_maconnerie.js`)
- [x] Parpaings/Briques â€” quantitÃ©s, colle, rejointoiement
- [x] BÃ©ton/Chape â€” volume, ferraillage
- [x] Enduit FaÃ§ade â€” surface, couches, armature
- [x] Fondations â€” fouilles, bÃ©ton, ferraillage
- [x] Alertes normatives colorÃ©es
- [x] Bouton "CrÃ©er devis"

### Pack Ã‰lectricitÃ© â€” NF C 15-100 (`pack_electricite.js`)
- [x] Tableau Ã©lectrique â€” circuits, modules, disjoncteur gÃ©nÃ©ral
- [x] CÃ¢blage â€” chute de tension, section, alertes >3%
- [x] Ã‰clairage â€” flux lumineux, spots LED, 5 types de piÃ¨ce
- [x] Prises â€” rÃ¨gles NFC 15-100 par type de piÃ¨ce
- [x] Terre â€” rÃ©sistance piquet, rÃ©seau parallÃ¨le
- [x] Table de rÃ©fÃ©rence sections/intensitÃ©s/disjoncteurs
- [x] 19 produits Ã©lectricitÃ© en base catalogue

### Pack Plomberie â€” DTU 60.1 / DTU 60.11 (`pack_plomberie.js`)
- [x] Tuyauterie â€” 4 matÃ©riaux, raccords, isolation, nourrice
- [x] Sanitaires â€” 6 types, mitigeur standard/thermostatique
- [x] Chauffage â€” puissance/surface, plancher chauffant hydraulique
- [x] Ã‰vacuation â€” DN100/DN50, contrÃ´le pente (alertes DTU)
- [x] Table de rÃ©fÃ©rence dÃ©bits
- [x] Bouton "CrÃ©er devis"

### Projets Types (`projets_types.js`)
- [x] 8 modÃ¨les : Salle de bain, Bureau cloisons, Appartement T3, Cuisine, Local commercial, Cloison vitrÃ©e, Chambre, Douche italienne
- [x] Inputs dimensions â†’ quantitÃ©s automatiques
- [x] Tableau lignes entiÃ¨rement Ã©ditable (ref/dÃ©sig/unitÃ©/qtÃ©/prix)
- [x] Article libre + ðŸ’¾ "Sauvegarder en base produits"
- [x] Totaux HT / TVA 10% / TTC
- [x] Bouton "CrÃ©er ce devis" â†’ modal client/chantier â†’ `DB.addDevis()`

### Module DPGF / Appels d'offres (`dpgf.js`) âœ… TERMINÃ‰
- [x] **Double upload** â€” zone CCTP (PDF) + zone DPGF (Excel), grille 2 colonnes
- [x] **Lecture PDF via PDF.js** â€” extraction texte page par page (jusqu'Ã  20 pages, 18 000 chars)
- [x] **DÃ©tection format AOS** â€” reconnaissance automatique en-tÃªte (dÃ©signation/unitÃ©/qtÃ©) dans les 20 premiÃ¨res lignes, bypass Groq
- [x] **Analyse CCTP via Groq** (`llama-3.3-70b-versatile`) â€” extraction JSON structurÃ© : infos affaire (MOA/MOE/Ã‰conomiste/Lot/RÃ©fÃ©rence/DCE) + exigences techniques
- [x] **Analyse DPGF via Groq** (`llama-3.1-8b-instant`) â€” extraction lignes avec dÃ©signation, unitÃ©, quantitÃ©, prix unitaire
- [x] **Base prix marchÃ©** â€” 22 familles de travaux plaquisterie/peinture avec PU de rÃ©fÃ©rence
- [x] **Rapport synthÃ¨se Excel 2 onglets** (xlsx-js-style v1.2.0) :
  - Onglet 1 "SynthÃ¨se (modifiable)" â€” en-tÃªte affaire (MOA/MOE/Ã‰conomiste), tableau avec PU DO + PU AATB + montants, totaux HT/TVA/TTC, bloc NOTES DÃ‰TAILLÃ‰ES, bloc ANALYSE DES Ã‰CARTS, CONSEILS GÃ‰NÃ‰RAUX
  - Onglet 2 "Base prix marchÃ©" â€” rÃ©fÃ©rentiel complet avec PU min/max
- [x] **Styles professionnels** â€” couleurs BM (bleu marine), alternance lignes, en-tÃªtes colorÃ©s, totaux gras, hauteurs de lignes personnalisÃ©es
- [x] **Formules Excel rÃ©elles** â€” format `{ t:'n', v:valeurPrÃ©-calculÃ©e, f:'=formule' }` pour recalcul dans Excel
- [x] **`ws1['!ref']`** â€” plage dynamique couvrant toutes les lignes gÃ©nÃ©rÃ©es post-AOA

### Prospection IA (`prospection.js`)
- [x] Carte Leaflet des permis de construire
- [x] Scoring leads IA
- [x] Export prospects

### Assistant IA (`assistant_ia.js`)
- [x] FAQ plaquisterie / DTU / NF C 15-100
- [x] Conseils techniques contextuels

### Graphiques (`graphiques.js`)
- [x] CA mensuel â€” Chart.js
- [x] RÃ©partition chantiers par statut

### MÃ©tÃ©o (`meteo.js`)
- [x] API **Open-Meteo** (gratuite, **sans clÃ© API**)
- [x] GÃ©ocodage automatique par nom de ville
- [x] Alertes gel / pluie / vent pour chantiers
- [x] Ville configurable dans Configuration

### Jeux
- [x] Quiz Plaquiste â€” 50+ questions, 3 niveaux, score, popup sidebar
- [ ] PlaqTetris â€” affichÃ© "bientÃ´t" dans sidebar
- [ ] Chantier Rush â€” affichÃ© "bientÃ´t" dans sidebar

### Configuration (`app.js`)
- [x] Infos entreprise (nom, adresse, SIRET, IBAN, RCSâ€¦)
- [x] PrÃ©fixe numÃ©rotation devis/factures
- [x] Ville mÃ©tÃ©o
- [x] Conditions de paiement / mentions lÃ©gales
- [x] Pied de page devis et factures

### DonnÃ©es & Persistance
- [x] 100% localStorage â€” zÃ©ro serveur backend
- [x] Export/Import JSON global
- [x] DonnÃ©es de dÃ©monstration auto-initialisÃ©es
- [x] Soft delete (archivage sans suppression dÃ©finitive)

---

## ðŸš§ Backlog â€” Ce qui reste Ã  faire

### PrioritÃ© haute
- [ ] **Signature Ã©lectronique devis** â€” canvas HTML5, PNG embarquÃ© dans PDF
- [ ] **Email devis** â€” `mailto:` prÃ©-rempli avec PDF en piÃ¨ce jointe (Blob URL)
- [ ] **Suivi avancement chantier** â€” % complÃ©tion par poste, timeline Gantt simple
- [ ] **Module photos chantier** â€” upload/capture, galerie par chantier (localStorage Blob)
- [ ] **Bug potentiel numÃ©rotation** â€” `nextId()` peut dupliquer si localStorage resettÃ©

### PrioritÃ© moyenne
- [ ] **Relances devis** â€” alertes auto devis envoyÃ©s depuis X jours sans rÃ©ponse
- [ ] **Acomptes & Ã©chÃ©ancier** â€” 30% commande / 70% livraison, suivi rÃ¨glements
- [ ] **Export Excel** â€” SheetJS pour clients / chantiers / CA
- [ ] **Pack Isolation thermique** â€” ITI/ITE, laines, panneaux, R requis par DTU
- [ ] **Pack Carrelage** â€” surfaces, colle, joint, opus romain
- [ ] **Pack Sol souple** â€” LVT, parquet, sous-couche, plinthes
- [ ] **BibliothÃ¨que clauses devis** â€” textes standard insertibles (garanties, conditions)

### PrioritÃ© basse / amÃ©liorations
- [ ] **PlaqTetris** â€” jeu piÃ¨ces placo
- [ ] **Chantier Rush** â€” mini-jeu gestion chantier
- [ ] **Mode hors-ligne complet** â€” amÃ©liorer cache SW, sync diffÃ©rÃ©e
- [ ] **Multi-utilisateurs** â€” partage donnÃ©es inter-appareils (nÃ©cessite backend)
- [ ] **ThÃ¨me clair** â€” toggle dark/light mode
- [ ] **QR code sur devis** â€” watermark BROUILLON/ACCEPTÃ‰
- [ ] **Historique modifications** â€” log des changements par entitÃ©
- [ ] **Sauvegarde cloud** â€” Google Drive ou Dropbox API JS
- [ ] **Calculatrice flottante** â€” widget accessible depuis toutes les pages

---

## ðŸ—ºï¸ Sidebar â€” Structure actuelle

```
Principal
  âŠž  Tableau de bord
  âš¡  Calcul Express

Gestion
  ðŸ‘¤  Clients
  ðŸ—  Chantiers
  ðŸ“…  Calendrier
  ðŸŽ¯  Prospection IA

Travaux
  ðŸ“  MÃ©trÃ©s
  ðŸ§±  Cloisons
  ðŸŽ¨  Peinture

Commercial
  ðŸ“„  Devis
  ðŸ“‹  Devis complet
  ðŸ§¾  Factures
  ðŸ“¦  Projets types
  ðŸ›’  Liste d'achat
  ðŸ’¶  Grille tarifaire
  âœ…  MÃ©mo chantier

Params
  ðŸ’°  Base tarifaire

Packs MÃ©tier
  ðŸ§±  Pack MaÃ§onnerie
  âš¡  Ã‰lectricitÃ©
  ðŸ”§  Plomberie

Footer (fixe)
  âš™ï¸  Configuration
  ðŸŽ®  Jeux â†’ popup Quiz / PlaqTetris (bientÃ´t) / Chantier Rush (bientÃ´t)
```

---

## ðŸ—„ï¸ localStorage â€” ClÃ©s utilisÃ©es

| ClÃ© | Contenu |
|-----|---------|
| `plaqpro_clients` | Clients (nom, adresse, SIRET, tel, emailâ€¦) |
| `plaqpro_chantiers` | Chantiers (clientId, nom, dates, statut, notes) |
| `plaqpro_metrages` | MÃ©trÃ©s par chantier (piÃ¨ces LÃ—lÃ—H) |
| `plaqpro_cloisons` | Calculs cloisons sauvegardÃ©s |
| `plaqpro_peintures` | Calculs peinture sauvegardÃ©s |
| `plaqpro_devis` | Devis (numero, lignes[], totalHT, totalTTC, statut) |
| `plaqpro_factures` | Factures gÃ©nÃ©rÃ©es depuis devis |
| `plaqpro_produits` | Produits tarifaires personnalisÃ©s |
| `plaqpro_ratios` | Ratios de calcul (ml/mÂ², etc.) |
| `plaqpro_config` | Config entreprise (nom, SIRET, IBAN, prÃ©fixeâ€¦) |
| `plaqpro_prospects` | Leads prospection IA |
| `plaqpro_session` | Session auth (**sessionStorage**, expire auto 8h) |

---

## ðŸ“¦ DÃ©pendances externes (CDN â€” zÃ©ro npm, zÃ©ro build)

| Lib | Version | Usage | ClÃ© API ? |
|-----|---------|-------|-----------|
| Leaflet | 1.9.4 | Carte prospection | Non |
| Chart.js | latest | Graphiques dashboard | Non |
| QRCode.js | 1.5.3 | QR code sur devis | Non |
| Google Fonts | Outfit | Typographie | Non |
| Open-Meteo | v1 | MÃ©tÃ©o (gÃ©ocodage + prÃ©visions) | **Non â€” gratuit** |
| PDF.js | 3.11.174 | Extraction texte PDF (CCTP) â€” `cdnjs.cloudflare.com` | Non |
| xlsx-js-style | 1.2.0 | Export Excel avec styles â€” **local** `js/xlsx-js-style.js` | Non |
| Groq API | v1 | Analyse IA DPGF + CCTP (llama-3.1-8b / llama-3.3-70b) | **Oui â€” configurÃ©e dans l'app** |

> **Aucune clÃ© API requise pour les fonctions de base.** La clÃ© Groq est optionnelle (DPGF + Assistant IA) â€” configurable dans l'application (âš™ï¸ Configuration â†’ ClÃ© Groq).

---

## ðŸ”§ Architecture technique

- **Stack** : HTML5 / CSS3 / JavaScript ES6+ vanilla â€” zÃ©ro framework, zÃ©ro build
- **Pattern SPA** : routing client-side dans `index.html` (DOMContentLoaded)
- **Pages** : `Pages.xxx = function() { return domElement; }`
- **Navigation** : `App.navigate(page, params)` â†’ `pageMap[page]()`
- **DB** : Objet `DB` singleton â€” CRUD localStorage, `nextId()`, `softDelete()`
- **Styles** : CSS variables glassmorphisme + `<style id="xxx">` injectÃ©s par module (guard anti-doublon)
- **Auth** : Mots de passe en clair dans `login.html` (dÃ©mo) â€” session `sessionStorage` 8h
- **PWA** : `manifest.json` + `sw.js` cache-first pour offline

---

## ðŸŒ DÃ©ploiement Netlify â€” ProcÃ©dure

1. Aller sur **https://app.netlify.com**
2. Drag & drop du dossier `C:\PlaQproWEB` sur la zone de drop
3. RÃ©cupÃ©rer l'URL gÃ©nÃ©rÃ©e (ex: `https://xxxxx.netlify.app`)
4. Mettre l'URL ici dans ce fichier
5. Pour les mises Ã  jour : re-drag & drop ou utiliser `netlify-cli`

> Le fichier `_redirects` gÃ¨re le routing SPA (toutes les routes â†’ `index.html`).
> Aucune configuration serveur supplÃ©mentaire n'est nÃ©cessaire.

---

---

## ðŸ“‹ Session 20/05/2026 â€” Module DPGF AO complet

### TERMINÃ‰ âœ…
- Double upload CCTP PDF + DPGF Excel
- Lecture PDF via PDF.js (texte lisible)
- Analyse Groq : extraction infos affaire (MOA/MOE/Ã‰conomiste/Lot/RÃ©fÃ©rence/DCE)
- Rapport synthÃ¨se 1 onglet : tableau + formules + commentaires + alertes + recommandations + conseils AO
- Rapprochement automatique CCTP â†” DPGF (`_rapprocher`)
- ScÃ©nario 2 : PDF unique CCTP+DPGF â€” extraction `lignes_dpgf` automatique
- DÃ©ploiement GitHub Pages natif (workflow Actions v4)
- xlsx-js-style en local (`js/xlsx-js-style.js`)

### EN COURS ðŸ”„
- ScÃ©nario 3 : DCE complet mairie (28 pages) â€” Ã  tester en nouvelle conversation
- Ã‰cran "GÃ©rer ma base prix" dans ParamÃ¨tres
- Rapprochement technique CCTP â†” DPGF Ã  enrichir

### PROCHAINE SESSION
1. Tester scÃ©nario 3 DCE mairie
2. Ã‰cran base prix
3. Export DPGF remplie avec prix ENT

---

*DerniÃ¨re mise Ã  jour : 20/05/2026*


