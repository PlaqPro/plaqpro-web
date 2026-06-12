# PlaqPro+ - STATUS 11/06/2026

## Stack
- SPA PWA vanilla JS, zero npm
- Deploy : GitHub Pages
- Netlify abandonne
- ~82 fichiers JS / ~27 000+ lignes

## Regles de session
- Une seule tache a la fois
- 1 a 3 fichiers maximum par tache
- Pas d'audit global
- Rapport court
- node --check obligatoire sur chaque fichier JS modifie
- Aucun commit/push sauf demande explicite
- Preserver le comportement existant
- Ne jamais modifier .claude/settings.local.json

## Modules termines
- Auth client-side sessionStorage 8h
- Devis + Factures + PDF fond sombre
- TVA auto-liquidee + DPGF + CCTP
- Sidebar 6 groupes + Dashboard v2
- Import catalogue fournisseur
- Carte Premium CB QR code + expiration annuelle
- Email EmailJS + Signature distante EmailJS
- Export Excel factures + devis + liste achat
- Affectations ST + Logique Avoir
- landing.html vision plateforme BTP
- verify.html hash murmur2 + expiration
- PWA sw.js chemins corriges
- SRI integrity tous CDN
- window.esc() global XSS protection
- Modales UI remplacent confirm/prompt critiques

## Qualite code
- node --check OK sur tous les JS
- 0 alert() applicatif
- console.* : uniquement warn/error defensifs dans catch
- confirm() : residuel non bloquant dans suppressions simples
- Pas de suite de tests automatiques

## Scanner documentaire
- Service Worker : plaqpro-v20260612a
- Gestion Groq centralisee : js/db.js
- Fonctions Groq existantes : getGroqKey(), saveGroqKey(), removeGroqKey()
- Fonctionnalites scanner operationnelles : import photo, import PDF, apercu image, apercu PDF, recherche etendue, filtres, tri, compteurs, suppression, notes internes, edition manuelle, rattachement client, rattachement chantier, preparer PDF, impression fiche, bouton Analyser
- Statuts : A traiter, Saisi manuellement, Valide

## Architecture analyse scanner
- Scanner.extractDataFromDocument(document) existe
- Scanner.extractDataFromDocument(document) appelle Scanner.getAnalysisEngine()
- Scanner.extractDataFromDocument(document) tente le moteur choisi puis bascule en simulation si Groq echoue
- Scanner.extractDataWithSimulation(document) existe et porte la simulation
- Scanner.extractTextFromDocument(document) exploite document.textContent si present, sinon retourne le placeholder
- Scanner.extractDataWithGroq(document) tente d'abord l'extraction texte, puis construit le prompt, appelle l'utilitaire Groq et parse la reponse
- Scanner.buildGroqAnalysisPrompt(document) inclut document.textContent si present et demande d'analyser uniquement ce texte
- Scanner.parseGroqAnalysisResponse(rawResponse) parse JSON direct ou bloc JSON entoure de texte
- Scanner.normalizeExtractedData(data) normalise les champs Groq sans calcul automatique
- Scanner.callGroqForDocumentAnalysis(prompt) retourne rawResponse en succes et "Reponse Groq vide" si aucun contenu exploitable
- Scanner.canUseGroqAnalysis() existe
- Scanner.getAnalysisEngine() existe
- Succes standardise : { success: true, source: "simulation", extractedData: {...} }
- Erreur standardisee : { success: false, source: "simulation", error: "Document introuvable ou invalide" }
- Tracabilite : document.analysisResult = { success, source, engine, message, analyzedAt }
- Tracabilite fallback : document.analysisResult conserve fallback et fallbackReason
- Affichage existant : message analyse, moteur utilise, date derniere analyse, message IA indisponible si fallback actif
- Affichage donnees Groq : date, typeDocument et resume affiches si disponibles
- Etat visuel analyse : bouton Analyser desactive temporairement et message "Analyse en cours..." pendant l'analyse
- Fiche document : textarea discret "Texte brut du document" persiste document.textContent
- Fiche document : action "Envoyer" ouvre un email mailto pre-rempli et prepare la fiche PDF dans l'interface
- Stockage durable fichier : importFile() sauvegarde fileDataUrl via Scanner.fileToDataUrl(file), previewUrl conserve, apercu utilise previewUrl puis fileDataUrl
- Moteurs prevus : simulation operationnelle, Groq prepare sans OCR reel
- Secours Groq : en cas d'echec source "groq", relance simulation avec fallback: true et fallbackReason

## Audits
- Audit 1 P0/P1/P2 : 100% clos
- Audit 2 P0/P1/P2 : 100% clos
- Beta test bloquants : 100% corriges

## Derniere tache terminee
- Photo chantier : calcul surface M2 ajoute dans la mesure manuelle
- Mode surface : a partir de 3 points, boucle fermee visuellement entre dernier et premier point
- Aire polygone calculee en pixels2 puis convertie avec calibrationRatio au carre
- Affichage "Surface : X.XX m2" si calibration disponible
- Affichage "Calibrez d'abord une longueur de reference" si calibration absente
- AnalysePhoto.polygonArea(points) ajoutee
- Calcul ML existant conserve
- Validation : node --check js/analyse_photo.js OK
- Aucun commit/push effectue

## Prochaine tache prevue
1. Attendre prochaine tache definie par ChatGPT
