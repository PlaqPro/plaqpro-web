// Quiz Métiers BTP — 8 corps de métier, 4 niveaux, 50+ questions, IA illimitée
'use strict';

const QM_DATA = {
  metiers: [
    { id: 'plaquiste', label: 'Plaquiste', icon: '🧱', color: '#e74c3c', desc: 'Cloisons, plafonds, isolation' },
    { id: 'macon', label: 'Maçon', icon: '🏗', color: '#8e44ad', desc: 'Gros œuvre, béton, briques' },
    { id: 'electricien', label: 'Électricien', icon: '⚡', color: '#f39c12', desc: 'Installations NF C 15-100' },
    { id: 'plombier', label: 'Plombier / Chauffagiste', icon: '🔧', color: '#2980b9', desc: 'Sanitaire, thermique, fluides' },
    { id: 'carreleur', label: 'Carreleur', icon: '⬛', color: '#16a085', desc: 'Pose, jointoiement, étanchéité' },
    { id: 'menuisier', label: 'Menuisier', icon: '🪵', color: '#d35400', desc: 'Bois, alu, PVC, serrurerie' },
    { id: 'peintre', label: 'Peintre', icon: '🎨', color: '#27ae60', desc: 'Revêtements, finitions, sols' },
    { id: 'couvreur', label: 'Couvreur / Étanchéiste', icon: '🏠', color: '#7f8c8d', desc: 'Toiture, zinguerie, étanchéité' },
  ],
  niveaux: [
    { id: 'debutant', label: 'Débutant', sublabel: 'CAP / Apprenti', stars: 1 },
    { id: 'confirme', label: 'Confirmé', sublabel: 'BP / 3-5 ans', stars: 2 },
    { id: 'expert', label: 'Expert', sublabel: 'BM / 10+ ans', stars: 3 },
    { id: 'maitre', label: 'Maître', sublabel: 'Pro + / Formateur', stars: 4 },
  ],
  questions: {
    plaquiste: {
      debutant: [
        { q: "Quelle est l'épaisseur standard d'une plaque de plâtre BA13 ?", r: "13 mm", opts: ["10 mm","13 mm","15 mm","18 mm"] },
        { q: "Que signifie l'abréviation 'BA' dans BA13 ?", r: "Bord aminci", opts: ["Bord arrondi","Bord aminci","Bord angle","Bord aplati"] },
        { q: "Quel profil métallique sert d'ossature verticale pour une cloison ?", r: "Montant", opts: ["Rail","Montant","Fourrure","Cornière"] },
        { q: "À quelle distance maximale fixe-t-on les montants d'une cloison standard ?", r: "60 cm", opts: ["40 cm","60 cm","80 cm","100 cm"] },
        { q: "Quel outil utilise-t-on pour couper une plaque de plâtre ?", r: "Cutter + règle", opts: ["Scie circulaire","Cutter + règle","Disqueuse","Scie sauteuse"] },
        { q: "Quelle vis est utilisée pour fixer la BA13 sur l'ossature métallique ?", r: "Vis TF 25 mm", opts: ["Vis TF 25 mm","Vis TB 35 mm","Vis bois 40 mm","Vis Ø6×50"] },
        { q: "Quel produit applique-t-on sur les joints entre plaques ?", r: "Enduit de jointement", opts: ["Plâtre poudre","Enduit de jointement","Colle carrelage","Mortier colle"] },
        { q: "La bande à joints sert à :", r: "Renforcer et masquer le joint entre plaques", opts: ["Isoler phoniquement","Renforcer et masquer le joint entre plaques","Fixer les plaques","Protéger les arêtes"] },
        { q: "Qu'est-ce qu'un rail en plaquisterie ?", r: "Le profil horizontal de sol et plafond", opts: ["Un profil vertical","Le profil horizontal de sol et plafond","Une pièce de jonction","Un outil de fixation"] },
        { q: "Quelle plaque utilise-t-on dans les pièces humides (salle de bain) ?", r: "Plaque hydrofuge (verte)", opts: ["BA13 standard","Plaque hydrofuge (verte)","Plaque coupe-feu","Plaque phonique"] },
        { q: "Quelle est la hauteur standard d'une cloison de distribution ?", r: "2,50 m (hauteur sous plafond)", opts: ["2,00 m","2,50 m (hauteur sous plafond)","3,00 m","1,80 m"] },
        { q: "Quel isolant est le plus couramment placé dans les cloisons ?", r: "Laine de roche ou laine de verre", opts: ["Polystyrène expansé","Laine de roche ou laine de verre","Liège","Polyuréthane"] },
      ],
      confirme: [
        { q: "Quel est le coefficient Rw minimum pour une cloison phonique entre logements ?", r: "53 dB", opts: ["45 dB","50 dB","53 dB","60 dB"] },
        { q: "Que désigne la norme NF EN 520 pour les plaques de plâtre ?", r: "Les spécifications des plaques de plâtre", opts: ["La pose des cloisons","Les spécifications des plaques de plâtre","L'isolation thermique","Les joints de dilatation"] },
        { q: "Pourquoi réalise-t-on des joints de fractionnement ?", r: "Pour absorber les dilatations sans fissures", opts: ["Pour améliorer l'acoustique","Pour absorber les dilatations sans fissures","Pour faciliter la peinture","Pour poser les gaines"] },
        { q: "La résistance au feu EI60 signifie :", r: "Étanche + isolant 60 minutes", opts: ["Extensible 60 cm","Étanche + isolant 60 minutes","Endurance incendie 60 bars","Épaisseur inégale 60 mm"] },
        { q: "Quel est l'entraxe montants pour une hauteur de cloison > 3,60 m ?", r: "40 cm", opts: ["60 cm","50 cm","40 cm","30 cm"] },
        { q: "Le système Placostil® est adapté à quelle utilisation principale ?", r: "Cloisons haute performance (anti-effraction, acoustique)", opts: ["Plafonds suspendus","Cloisons haute performance (anti-effraction, acoustique)","Doublage de murs","Isolation des toits"] },
        { q: "Quelle double plaque utilise-t-on pour améliorer l'isolation phonique ?", r: "2 × BA13 (ou BA18+BA13)", opts: ["2 × BA10","2 × BA13 (ou BA18+BA13)","BA13 + polystyrène","BA13 + fibres de bois"] },
        { q: "Dans une cloison hydrofuge, que complète-t-on sur le receveur de douche ?", r: "Un système d'étanchéité sous carrelage (SEAC)", opts: ["Un joint silicone seul","Un système d'étanchéité sous carrelage (SEAC)","Une membrane bitumineuse","Un primaire d'accrochage"] },
        { q: "Que vérifie-t-on avec un détecteur de montant ?", r: "La position des montants métalliques derrière la plaque posée", opts: ["La verticalité","La position des montants métalliques derrière la plaque posée","La résistance électrique","L'humidité"] },
        { q: "Quel est le rôle de la semelle acoustique sous rail ?", r: "Désolidariser la structure du plancher pour isoler les bruits de choc", opts: ["Niveler le sol","Désolidariser la structure du plancher pour isoler les bruits de choc","Protéger le rail de la corrosion","Faciliter le déplacement du rail"] },
      ],
      expert: [
        { q: "Quelle norme régit la performance acoustique des cloisons entre logements en France ?", r: "NRA (Nouvelle Réglementation Acoustique) – arrêté du 30 juin 1999", opts: ["RT2012","NRA (Nouvelle Réglementation Acoustique) – arrêté du 30 juin 1999","DTU 25.41","NF EN 14195"] },
        { q: "En ERP, quelle résistance au feu minimale exige-t-on pour les parois entre locaux à risque ?", r: "EI 60 ou EI 120 selon le type et classement ERP", opts: ["EI 30 systématiquement","EI 45","EI 60 ou EI 120 selon le type et classement ERP","EI 180 obligatoire"] },
        { q: "Qu'est-ce qu'un pont acoustique et comment l'évite-t-on ?", r: "Contact rigide entre structures transmettant le son — évité par désolidarisation et semelles résilientes", opts: ["Un point de condensation","Une fissure de retrait","Contact rigide entre structures transmettant le son — évité par désolidarisation et semelles résilientes","Un défaut de jointoiement"] },
        { q: "Le système de doublage thermique ITI sur ossature : quel DTU s'applique ?", r: "DTU 25.41", opts: ["DTU 25.31","DTU 25.41","DTU 20.13","DTU 23.1"] },
        { q: "Quelle est la valeur Rth minimale d'une laine de verre 45 mm pour ITI ?", r: "1,20 m².K/W (laine 45 mm λ=0,040)", opts: ["0,80 m².K/W","1,00 m².K/W","1,20 m².K/W (laine 45 mm λ=0,040)","1,60 m².K/W"] },
        { q: "Comment dimensionne-t-on le ferraillage d'une cloison haute > 4,50 m ?", r: "Note de calcul par bureau d'études, montants renforcés type C ou D", opts: ["On double les montants sans calcul","On augmente l'entraxe à 90 cm","Note de calcul par bureau d'études, montants renforcés type C ou D","On utilise uniquement des montants bois"] },
        { q: "Qu'est-ce que l'indice d'affaiblissement acoustique Rw+C et Rw+Ctr ?", r: "Rw+C pour bruits aériens à spectre rose ; Rw+Ctr pour bruits de trafic (basses fréquences)", opts: ["Deux variantes de la même mesure sans différence pratique","Rw+C pour bruits aériens à spectre rose ; Rw+Ctr pour bruits de trafic (basses fréquences)","C = correction climatique, Ctr = correction thermique","Mesures à 500 Hz et 1000 Hz"] },
        { q: "Dans le domaine du plafond suspendu, que désigne 'plénum' ?", r: "L'espace entre le plafond suspendu et le plancher brut supérieur", opts: ["La hauteur totale de la pièce","L'espace entre le plafond suspendu et le plancher brut supérieur","La quantité d'air dans les laines isolantes","Un type de dalle de faux-plafond"] },
      ],
      maitre: [
        { q: "Comment rédiger un PPSPS pour un chantier de cloisons avec risque de chute > 3 m ?", r: "Identifier les risques spécifiques, mesures de prévention collectives (garde-corps) puis EPI, validation CSPS", opts: ["Remplir la fiche générique sans adaptation","Identifier les risques spécifiques, mesures de prévention collectives (garde-corps) puis EPI, validation CSPS","Demander au maître d'ouvrage de le rédiger","Utiliser le PPSPS du lot gros-œuvre"] },
        { q: "Quelle méthode d'organisation permet de former un compagnon plaquiste sur la pose de bandes ?", r: "Formation en situation de travail (AFEST) : observation → démonstration → pratique encadrée → autonomie", opts: ["Lui remettre la fiche technique fabricant","Formation en situation de travail (AFEST) : observation → démonstration → pratique encadrée → autonomie","Envoyer en formation externe uniquement","Lui confier d'emblée un chantier autonome"] },
        { q: "Quelles vérifications réglementaires précèdent la réception d'une cloison en ERP ?", r: "PV de classement au feu, avis technique fabricant, rapport acoustique si requis, conformité DTU", opts: ["Seul le PV de classement au feu est obligatoire","PV de classement au feu, avis technique fabricant, rapport acoustique si requis, conformité DTU","Uniquement la facture fournisseur","Aucun document réglementaire requis en rénovation"] },
        { q: "Comment optimiser la productivité sur un chantier de 500 m² de cloisons ?", r: "Organisation en ilôts (ossaturier/préposes/finisseurs), pré-découpe en atelier, planning journalier affiché", opts: ["Faire tout faire par un seul compagnon","Organisation en ilôts (ossaturier/préposes/finisseurs), pré-découpe en atelier, planning journalier affiché","Sous-traiter la totalité","Commander au fur et à mesure sans stock"] },
        { q: "Que prévoit la RE2020 comme performance minimale pour les parois opaques neuves ?", r: "Uw ≤ 0,97 W/m².K pour les murs (valeur selon zone et usage)", opts: ["Aucune exigence sur les murs intérieurs","Uw ≤ 0,97 W/m².K pour les murs (valeur selon zone et usage)","R ≥ 7 m².K/W obligatoire","Isolation uniquement par l'extérieur"] },
      ],
    },

    macon: {
      debutant: [
        { q: "Que signifie le dosage 350 kg/m³ de ciment dans un béton ?", r: "On utilise 350 kg de ciment par m³ de béton", opts: ["La résistance en MPa","On utilise 350 kg de ciment par m³ de béton","L'épaisseur de la dalle","Le ratio eau/ciment"] },
        { q: "Quel outil sert à mesurer l'horizontalité d'un mur ?", r: "Niveau à bulle", opts: ["Fil à plomb","Niveau à bulle","Mètre ruban","Equerre"] },
        { q: "Quelle est la résistance caractéristique d'un béton C25/30 à 28 jours ?", r: "25 MPa sur cylindre / 30 MPa sur cube", opts: ["20 MPa","25 MPa sur cylindre / 30 MPa sur cube","35 MPa","40 MPa"] },
        { q: "Qu'est-ce qu'un parpaing creux standard ?", r: "Bloc béton 20×20×50 cm avec alvéoles", opts: ["Brique pleine réfractaire","Bloc béton 20×20×50 cm avec alvéoles","Pierre calcaire taillée","Moellon de granit"] },
        { q: "Quel mortier colle les briques et parpaings ?", r: "Mortier bâtard (ciment + chaux + sable)", opts: ["Béton armé","Mortier bâtard (ciment + chaux + sable)","Plâtre de finition","Colle carrelage"] },
        { q: "À quoi sert le coffrage ?", r: "Mouler le béton pendant sa prise", opts: ["Armature du béton","Mouler le béton pendant sa prise","Protéger le béton de la pluie","Isoler thermiquement"] },
        { q: "Quelle classe de ciment est la plus courante en maçonnerie ?", r: "CEM II / 32,5 ou 42,5", opts: ["CEM I 52,5 R","CEM II / 32,5 ou 42,5","CEM V / 22,5","CEM III / 42,5"] },
        { q: "Un liant hydraulique durcit grâce à :", r: "Une réaction chimique avec l'eau (hydratation)", opts: ["La chaleur du soleil","Une réaction chimique avec l'eau (hydratation)","L'évaporation de l'eau","La pression mécanique"] },
        { q: "Que désigne le 'fil de référence' sur un chantier de maçonnerie ?", r: "Un cordeau tendu pour aligner les rangs de briques/parpaings", opts: ["Le câble électrique de chantier","Un cordeau tendu pour aligner les rangs de briques/parpaings","La limite de propriété","Le tuyau d'alimentation en eau"] },
        { q: "Pourquoi arrose-t-on le béton après coulage ?", r: "Pour éviter la dessiccation et améliorer la résistance (cure)", opts: ["Pour accélérer le durcissement","Pour éviter la dessiccation et améliorer la résistance (cure)","Pour nettoyer la surface","Pour faciliter le décoffrage"] },
      ],
      confirme: [
        { q: "Quelle est la valeur minimale de l'enrobage des aciers dans un béton exposé à l'air en classe XC1 ?", r: "15 mm (avec recommandation 20 mm pour prise en compte des tolérances)", opts: ["10 mm","15 mm (avec recommandation 20 mm pour prise en compte des tolérances)","25 mm","35 mm"] },
        { q: "Qu'est-ce qu'un enduit monocouche ?", r: "Enduit prêt à l'emploi appliqué en une passe sur façade", opts: ["Un enduit en 3 couches","Enduit prêt à l'emploi appliqué en une passe sur façade","Un enduit de plâtre","Un ragréage de sol"] },
        { q: "Le DTU 20.1 concerne :", r: "Les ouvrages en maçonnerie de petits éléments", opts: ["Les fondations","Les ouvrages en maçonnerie de petits éléments","Les chapes de sol","Les toitures-terrasses"] },
        { q: "Quelle est la résistance minimale d'un béton de propreté ?", r: "C16/20 (150 kg/m³ minimum)", opts: ["C8/10","C16/20 (150 kg/m³ minimum)","C25/30","C35/45"] },
        { q: "Qu'est-ce qu'un chaînage horizontal ?", r: "Élément de béton armé qui solidarise les murs et reprend les efforts horizontaux", opts: ["Une poutre en acier","Élément de béton armé qui solidarise les murs et reprend les efforts horizontaux","Un joint de dilatation","Une semelle filante"] },
        { q: "Pourquoi un mur doit-il avoir une barrière anti-remontée capillaire ?", r: "Pour éviter que l'humidité du sol remonte dans la maçonnerie par capillarité", opts: ["Pour l'isolation thermique","Pour éviter que l'humidité du sol remonte dans la maçonnerie par capillarité","Pour la résistance structurelle","Pour le respect du DTU 26.1"] },
        { q: "Comment calcule-t-on la surface d'une fenêtre pour le DTU 20.1 ?", r: "Largeur × hauteur des tableaux (dimensions de baie)", opts: ["Nu de façade","Largeur × hauteur des tableaux (dimensions de baie)","Surface intérieure vitrée","Cadre + vitrage"] },
        { q: "Quelle est la pente minimale d'un appui de fenêtre ?", r: "10% (vers l'extérieur)", opts: ["2%","5%","10% (vers l'extérieur)","15%"] },
      ],
      expert: [
        { q: "Quelles sont les classes d'exposition XC, XS, XD dans le béton ?", r: "XC = carbonatation, XS = chlorures marins, XD = chlorures non marins", opts: ["XC = choc, XS = séisme, XD = décoffrage","XC = carbonatation, XS = chlorures marins, XD = chlorures non marins","Classes de résistance uniquement","Notations de chantier sans norme"] },
        { q: "Qu'est-ce que l'Eurocode 6 (EC6) ?", r: "Norme européenne de calcul des structures en maçonnerie", opts: ["Réglementation thermique","Norme européenne de calcul des structures en maçonnerie","DTU maçonnerie","Norme de qualité des blocs béton"] },
        { q: "Comment détermine-t-on les efforts dans un linteau ?", r: "Modèle de poutre simplement appuyée avec charge triangulaire (voûte de décharge) ou sur la longueur d'appui", opts: ["Toujours une charge répartie uniforme sur toute la travée","Modèle de poutre simplement appuyée avec charge triangulaire (voûte de décharge) ou sur la longueur d'appui","Aucun calcul requis < 1,20 m","Règle des 1/20 de la portée"] },
        { q: "Quel est l'effet alkali-silice dans le béton ?", r: "Réaction chimique entre les alcalins du ciment et la silice des granulats causant des fissures en réseau", opts: ["Carbonatation accélérée","Réaction chimique entre les alcalins du ciment et la silice des granulats causant des fissures en réseau","Corrosion des armatures","Retrait plastique"] },
      ],
      maitre: [
        { q: "Comment supervise-t-on la qualité du béton livré sur chantier (BPE) ?", r: "Contrôle réception : BL (bon de livraison), affaissement au cône, éprouvettes de contrôle en compression à J+28", opts: ["Vérifier uniquement la couleur","Contrôle réception : BL (bon de livraison), affaissement au cône, éprouvettes de contrôle en compression à J+28","Se fier uniquement au fournisseur","Mesurer la température uniquement"] },
        { q: "Quelles responsabilités engage le maître maçon sur la solidité d'un ouvrage livré ?", r: "Garantie décennale (10 ans) sur la solidité et les désordres rendant l'ouvrage impropre à sa destination — art. 1792 CC", opts: ["Garantie de parfait achèvement uniquement (1 an)","Garantie biennale (2 ans)","Garantie décennale (10 ans) sur la solidité et les désordres rendant l'ouvrage impropre à sa destination — art. 1792 CC","Aucune garantie légale"] },
        { q: "Comment organiser le plan de prévention pour la coactivité maçonnerie / charpente ?", r: "Réunion préalable, identification des zones de coactivité, phasage des travaux, balisage et gardiennage des risques croisés", opts: ["Chaque corps d'état travaille indépendamment","Réunion préalable, identification des zones de coactivité, phasage des travaux, balisage et gardiennage des risques croisés","Seul le maçon est responsable","Déléguer au CSPS uniquement"] },
      ],
    },

    electricien: {
      debutant: [
        { q: "Quelle est la tension nominale du réseau monophasé en France ?", r: "230 V / 50 Hz", opts: ["110 V","220 V","230 V / 50 Hz","400 V"] },
        { q: "Que signifie l'habilitation B1V ?", r: "Travaux sous tension en BT — exécutant", opts: ["Chargé de consignation HT","Travaux sous tension en BT — exécutant","Formation de base sans habilitation","Chargé de travaux électriques BT"] },
        { q: "Quel disjoncteur protège un circuit prise de courant 16A ?", r: "Disjoncteur 16A courbe C", opts: ["Fusible 10A","Disjoncteur 16A courbe C","Disjoncteur 32A","Interrupteur différentiel"] },
        { q: "La couleur du fil de protection (terre) est :", r: "Vert-jaune", opts: ["Bleu","Marron","Vert-jaune","Gris"] },
        { q: "Quelle section minimale pour un circuit éclairage 10A ?", r: "1,5 mm²", opts: ["0,75 mm²","1,0 mm²","1,5 mm²","2,5 mm²"] },
        { q: "Quelle est la fonction d'un interrupteur différentiel 30 mA ?", r: "Protéger les personnes contre les contacts indirects", opts: ["Protéger les appareils contre les surintensités","Protéger les personnes contre les contacts indirects","Couper l'alimentation générale","Mesurer la consommation"] },
        { q: "Que désigne le repère 'L' sur un câble électrique ?", r: "Phase (Live)", opts: ["Neutre","Terre","Phase (Live)","Retour lumière"] },
        { q: "Quel est le rôle de la barrette de terre dans un tableau électrique ?", r: "Regrouper et raccorder tous les conducteurs de protection PE", opts: ["Disjoncter en cas de surcharge","Regrouper et raccorder tous les conducteurs de protection PE","Séparer les circuits","Mesurer la résistance"] },
        { q: "Qu'est-ce qu'une prise de terre par piquet ?", r: "Électrode enfoncée dans le sol pour dissiper les courants de défaut", opts: ["Un câble reliant deux prises","Un dispositif de mesure","Électrode enfoncée dans le sol pour dissiper les courants de défaut","Le conducteur PE dans le câble"] },
        { q: "Combien de circuits maximum sans dérogation dans un logement selon NF C 15-100 ?", r: "8 circuits (points lumineux + prises) pour T1, plus selon surface", opts: ["4 circuits","8 circuits (points lumineux + prises) pour T1, plus selon surface","12 circuits fixe","Illimité"] },
      ],
      confirme: [
        { q: "Quel est le schéma des liaisons à la terre en France pour les logements neufs ?", r: "TT (Terre-Terre) imposé par ENEDIS", opts: ["TN-C","TN-S","TT (Terre-Terre) imposé par ENEDIS","IT"] },
        { q: "La section minimale pour un circuit cuisinière (32A) est :", r: "6 mm²", opts: ["2,5 mm²","4 mm²","6 mm²","10 mm²"] },
        { q: "Selon NF C 15-100, combien de prises 16A minimum dans un séjour de 20 m² ?", r: "5 prises (1 par tranche de 4 m² au-delà de 4 m²)", opts: ["2 prises","3 prises","5 prises (1 par tranche de 4 m² au-delà de 4 m²)","8 prises"] },
        { q: "Qu'est-ce qu'un tableau de communication (GTL) ?", r: "Tableau regroupant les équipements VDI (téléphone, TV, internet)", opts: ["Tableau divisionnaire secondaire","Tableau regroupant les équipements VDI (téléphone, TV, internet)","Tableau de comptage ERDF","Coffret de protection incendie"] },
        { q: "Quelle est la valeur maximale de la résistance de prise de terre dans un logement individuel ?", r: "100 Ω (avec ID 30 mA — sinon 50 Ω)", opts: ["10 Ω","50 Ω","100 Ω (avec ID 30 mA — sinon 50 Ω)","500 Ω"] },
        { q: "Dans quelle zone de salle de bain peut-on installer une prise rasoir ?", r: "Zone 2 (avec transfo de séparation)", opts: ["Zone 0","Zone 1","Zone 2 (avec transfo de séparation)","Partout avec protection IP44"] },
        { q: "Qu'est-ce qu'un câble H07VR ?", r: "Conducteur souple multibrin, isolation PVC, 450/750V", opts: ["Câble rigide tri-polaire","Conducteur souple multibrin, isolation PVC, 450/750V","Câble basse tension enterrable","Fil de masse armé"] },
        { q: "Que vérifie un test d'isolement entre conducteurs à 500 V DC ?", r: "La résistance d'isolement (> 1 MΩ selon NF C 15-100)", opts: ["La tension de fonctionnement","La résistance d'isolement (> 1 MΩ selon NF C 15-100)","La continuité de la terre","La chute de tension"] },
      ],
      expert: [
        { q: "Comment calcule-t-on la chute de tension admissible sur un circuit terminal ?", r: "ΔU% = (ρ × L × I) / (S × Un) × 100 ; max 3% éclairage, 5% force", opts: ["Toujours 3% quelle que soit l'usage","ΔU% = (ρ × L × I) / (S × Un) × 100 ; max 3% éclairage, 5% force","Mesure directe sur site uniquement","Règle des 10 m / mm²"] },
        { q: "Quelle est la classe II d'un matériel électrique ?", r: "Double isolation — pas de raccordement à la terre nécessaire", opts: ["Matériel 24V","Double isolation — pas de raccordement à la terre nécessaire","Matériel de classe industrielle","Fusible haute capacité"] },
        { q: "Qu'est-ce qu'un TGBT ?", r: "Tableau Général Basse Tension — armoire principale de distribution en aval du compteur", opts: ["Transformateur de courant","Tableau Général Basse Tension — armoire principale de distribution en aval du compteur","Testeur général de bâtiment","Terminal de gestion basse tension"] },
        { q: "Quelle protection utilise-t-on pour un moteur triphasé 15 kW ?", r: "Disjoncteur moteur + contacteur + relais thermique (In ≈ 30A)", opts: ["Fusible 63A seul","Disjoncteur moteur + contacteur + relais thermique (In ≈ 30A)","Interrupteur différentiel 40A","Simple disjoncteur 32A"] },
      ],
      maitre: [
        { q: "Comment établit-on un plan de prévention pour des travaux électriques en milieu industriel sous tension ?", r: "Analyse des risques, habilitation vérifiée (BR/B2V/HC), consignation, autorisation de travail, surveillance permanente", opts: ["Couper le disjoncteur et travailler","Habilitation B1 suffisante","Analyse des risques, habilitation vérifiée (BR/B2V/HC), consignation, autorisation de travail, surveillance permanente","Travaux uniquement la nuit"] },
        { q: "Quelles vérifications initiales sont requises à la mise en service d'une installation NF C 15-100 ?", r: "Rapport de vérification : continuité PE, isolement, polarité, ID, essai de fonctionnement", opts: ["Vérifier uniquement la tension","Rapport de vérification : continuité PE, isolement, polarité, ID, essai de fonctionnement","Attestation fabricant des appareils","Seul le CONSUEL vérifie"] },
        { q: "Comment former un apprenti à la pose d'un tableau électrique selon le référentiel BEP/CAP ?", r: "Progression : schéma → repérage → câblage partie par partie → test continuité → vérification croisée compagnon", opts: ["Lui confier directement le tableau complet","Progression : schéma → repérage → câblage partie par partie → test continuité → vérification croisée compagnon","Formation théorique uniquement 3 semaines","Utiliser uniquement des kits pré-câblés"] },
      ],
    },

    plombier: {
      debutant: [
        { q: "Quel matériau est le plus utilisé pour les canalisations d'eau potable en neuf ?", r: "Cuivre ou PER (polyéthylène réticulé)", opts: ["Plomb","PVC gris","Cuivre ou PER (polyéthylène réticulé)","Acier galvanisé"] },
        { q: "Quelle est la pression normale de service de l'eau en résidence ?", r: "3 à 4 bar", opts: ["1 bar","3 à 4 bar","8 bar","10 bar"] },
        { q: "Un siphon dans un lavabo sert à :", r: "Empêcher la remontée des odeurs d'égout par joint hydraulique", opts: ["Filtrer l'eau","Empêcher la remontée des odeurs d'égout par joint hydraulique","Réguler le débit","Retenir les corps solides"] },
        { q: "Quelle pente minimale recommande-t-on pour une évacuation horizontale ?", r: "1 à 2 cm par mètre (1-2%)", opts: ["0,5%","1 à 2 cm par mètre (1-2%)","5%","10%"] },
        { q: "Qu'est-ce qu'un clapet anti-retour ?", r: "Un dispositif permettant le flux dans un seul sens", opts: ["Un filtre à eau","Un dispositif permettant le flux dans un seul sens","Un robinet d'arrêt","Un détendeur de pression"] },
        { q: "Le tube PER est :", r: "Flexible, résistant à la chaleur, utilisable en gaine", opts: ["Rigide et non cintrable","Flexible, résistant à la chaleur, utilisable en gaine","Uniquement pour le froid","À souder obligatoirement"] },
        { q: "Quel outil permet de couper un tube cuivre proprement ?", r: "Coupe-tube", opts: ["Scie à métaux","Coupe-tube","Cisaille","Pince coupante"] },
        { q: "Un chauffe-eau électrique de 200 L est-il adapté à une famille de 4 personnes ?", r: "Oui, 200 L est standard pour 3-4 personnes", opts: ["Non, il faut 300 L minimum","Oui, 200 L est standard pour 3-4 personnes","Non, 100 L suffit","Uniquement si thermostat nuit"] },
        { q: "Que signifie NF sur un appareil sanitaire ?", r: "Norme Française — certification de conformité et qualité", opts: ["Niveau Fixe","Norme Française — certification de conformité et qualité","Non Fourni","Neutre Fonctionnel"] },
        { q: "Quelle est la temperature maxi de l'eau chaude sanitaire en sortie de ballon recommandée pour éviter la légionelle ?", r: "60°C minimum (stockage)", opts: ["40°C","50°C","60°C minimum (stockage)","80°C"] },
      ],
      confirme: [
        { q: "Que spécifie le DTU 60.1 ?", r: "Plomberie sanitaire pour bâtiments à usage d'habitation", opts: ["Chauffage central","Plomberie sanitaire pour bâtiments à usage d'habitation","Gaz naturel","Évacuation EP"] },
        { q: "Quelle est la section minimale de tube PVC pour une WC ?", r: "Ø 100 mm", opts: ["Ø 32 mm","Ø 50 mm","Ø 100 mm","Ø 150 mm"] },
        { q: "Qu'est-ce qu'un disconnecteur BA ou EA ?", r: "Dispositif anti-retour pour protéger le réseau AEP des pollutions", opts: ["Un filtre à sédiments","Dispositif anti-retour pour protéger le réseau AEP des pollutions","Un compteur d'eau","Un régulateur de pression"] },
        { q: "Pour une chaudière gaz à condensation, quel rendement peut-on atteindre ?", r: "107-109% sur PCI (récupération de la chaleur latente)", opts: ["90%","95%","107-109% sur PCI (récupération de la chaleur latente)","120%"] },
        { q: "Quelle norme régit les installations gaz intérieures ?", r: "NF DTU 61.1 (installation gaz domestique)", opts: ["NF C 15-100","NF DTU 61.1 (installation gaz domestique)","DTU 60.11","Arrêté du 2 août 1977"] },
        { q: "Que vérifie l'épreuve de résistance hydraulique à 15 bar ?", r: "L'étanchéité et la tenue mécanique des raccords et tubes sous pression", opts: ["Le débit nominal","L'étanchéité et la tenue mécanique des raccords et tubes sous pression","La qualité de l'eau","La pression de service"] },
        { q: "Qu'est-ce qu'un plancher chauffant hydraulique ?", r: "Circuit eau chaude noyé dans chape, chauffage par rayonnement sol", opts: ["Câble chauffant électrique","Circuit eau chaude noyé dans chape, chauffage par rayonnement sol","Ventilo-convecteur basse température","Radiateur électrique infrarouge"] },
      ],
      expert: [
        { q: "Comment dimensionne-t-on un réseau ECS avec bouclage ?", r: "Calcul des déperditions par mètre de tube, débit de bouclage pour maintenir 55°C en tout point, pompe sélectionnée sur ΔP + débit", opts: ["1 tube suffit sans bouclage","Calcul des déperditions par mètre de tube, débit de bouclage pour maintenir 55°C en tout point, pompe sélectionnée sur ΔP + débit","Débit forfaitaire 50 L/h","Uniquement dans les hôtels"] },
        { q: "Qu'est-ce que la méthode de calcul Darcy-Weisbach ?", r: "Formule de calcul des pertes de charge régulières dans une conduite : ΔP = λ × (L/D) × (ρv²/2)", opts: ["Méthode de soudure cuivre","Formule de calcul des pertes de charge régulières dans une conduite : ΔP = λ × (L/D) × (ρv²/2)","Norme de qualité eau potable","Protocole de test de pression"] },
        { q: "Quel est l'impact d'une eau trop calcaire (TH > 30°f) sur une chaudière ?", r: "Entartrage des échangeurs réduisant le rendement et risquant la surchauffe", opts: ["Aucun impact","Entartrage des échangeurs réduisant le rendement et risquant la surchauffe","Amélioration du chauffage","Augmentation du débit"] },
      ],
      maitre: [
        { q: "Quelles obligations réglementaires s'appliquent à l'entretien annuel d'une chaudière gaz < 70 kW ?", r: "Entretien obligatoire annuel par professionnel certifié RGE (arrêté du 15 sept. 2009), attestation remise au propriétaire", opts: ["Aucune obligation légale","Tous les 3 ans","Entretien obligatoire annuel par professionnel certifié RGE (arrêté du 15 sept. 2009), attestation remise au propriétaire","Uniquement en location"] },
        { q: "Comment forme-t-on un compagnon à la soudure cuivre capillaire ?", r: "Préparation tube (coupe + ébavurage + décapage) → flux → chauffage à la flamme douce → apport soudure → contrôle visuel + test pression", opts: ["Démonstration vidéo suffit","Préparation tube (coupe + ébavurage + décapage) → flux → chauffage à la flamme douce → apport soudure → contrôle visuel + test pression","Utiliser uniquement des raccords à compression","Formation en salle sans pratique"] },
      ],
    },

    carreleur: {
      debutant: [
        { q: "Que signifie la classe UPEC d'un carrelage ?", r: "Usure, Poinçonnement, Eau, Chimie — résistance du carrelage", opts: ["Une certification de qualité européenne","Usure, Poinçonnement, Eau, Chimie — résistance du carrelage","La taille des carreaux","Le pays de fabrication"] },
        { q: "Quelle colle est utilisée pour poser du carrelage au sol intérieur ?", r: "Mortier-colle C2 (colle déformable améliorée)", opts: ["Plâtre","Mortier-colle C2 (colle déformable améliorée)","Colle PU","Résine époxy"] },
        { q: "Qu'est-ce qu'un joint de fractionnement dans un carrelage ?", r: "Joint souple permettant les mouvements du support sans fissurer le carrelage", opts: ["Un joint de carrelage standard","Joint souple permettant les mouvements du support sans fissurer le carrelage","Un défaut de pose","Une fissure comblée"] },
        { q: "Comment évite-t-on le décollement du carrelage en double encollage ?", r: "En encollant à la fois le support et le dos du carreau", opts: ["En mouillant le carreau","En encollant à la fois le support et le dos du carreau","En chauffant le sol","En ajoutant du latex"] },
        { q: "Quel outil sert à couper un carreau droit ?", r: "Carrelette à roulette (coupe-carreaux)", opts: ["Disqueuse seule","Carrelette à roulette (coupe-carreaux)","Ciseau à froid","Marteau piqueur"] },
        { q: "Pourquoi imprègne-t-on le support avant de poser la colle ?", r: "Pour réguler l'absorption et améliorer l'adhérence", opts: ["Pour nettoyer","Pour réguler l'absorption et améliorer l'adhérence","Pour sécher plus vite","Pour colorer le support"] },
        { q: "Quelle est la largeur standard d'un joint de carrelage de sol ?", r: "2 à 5 mm selon la taille des carreaux", opts: ["0,5 mm","2 à 5 mm selon la taille des carreaux","10 mm","15 mm"] },
        { q: "Le carrelage classé A+ en émissions COV signifie :", r: "Très faibles émissions de composés organiques volatils — sain pour l'air intérieur", opts: ["Carrelage anti-glisse","Très faibles émissions de composés organiques volatils — sain pour l'air intérieur","Certification acoustique","Carrelage recycle"] },
      ],
      confirme: [
        { q: "Quel DTU régit la pose de carrelage collé au sol sur chape ?", r: "DTU 52.1", opts: ["DTU 26.2","DTU 52.1","DTU 40.11","DTU 60.1"] },
        { q: "Qu'est-ce qu'un système SEAC (Système d'Étanchéité à l'Eau sous Carrelage) ?", r: "Membrane étanche posée sur le support avant carrelage dans les pièces humides", opts: ["Un type de colle","Membrane étanche posée sur le support avant carrelage dans les pièces humides","Un produit de nettoyage","Un joint de silicone"] },
        { q: "Comment contrôle-t-on la planéité d'un support avant pose de grands formats ?", r: "Règle de 2 m : tolérance 5 mm sous règle de 2 m, 1 mm au mètre linéaire", opts: ["Niveau laser uniquement","Règle de 2 m : tolérance 5 mm sous règle de 2 m, 1 mm au mètre linéaire","Pas de vérification requise","Laser de sol 0,5 mm"] },
        { q: "Quelle résistance minimale doit avoir le support pour coller du carrelage selon DTU 52.1 ?", r: "Traction : ≥ 0,5 MPa (= 5 daN/cm²)", opts: ["0,1 MPa","0,5 MPa (= 5 daN/cm²)","2 MPa","5 MPa"] },
        { q: "Qu'est-ce qu'un ragréage autolissant ?", r: "Mortier fluide qui se met à niveau seul pour corriger les irrégularités du sol", opts: ["Un enduit de façade","Mortier fluide qui se met à niveau seul pour corriger les irrégularités du sol","Une résine de protection","Un ciment prompt"] },
        { q: "Quelle colle utilise-t-on pour poser du carrelage sur un plancher chauffant ?", r: "Colle déformable C2S1 ou C2S2 résistante aux variations thermiques", opts: ["Colle standard C1","Colle déformable C2S1 ou C2S2 résistante aux variations thermiques","Mortier bâtard","Ciment prompt"] },
      ],
      expert: [
        { q: "Comment calcule-t-on la pente d'une douche à l'italienne pour l'écoulement ?", r: "1 à 2% vers le siphon — soit 1 à 2 cm par mètre", opts: ["5% minimum","1 à 2% vers le siphon — soit 1 à 2 cm par mètre","0,5% suffit","3% obligatoire DTU"] },
        { q: "Qu'est-ce que l'indice PEI d'un carrelage ?", r: "Résistance à l'usure de la surface vitrée (0 = usage mur uniquement, 5 = zones très fréquentées)", opts: ["Poids par m²","Résistance à l'usure de la surface vitrée (0 = usage mur uniquement, 5 = zones très fréquentées)","Porosité de l'email","Puissance d'isolation"] },
        { q: "Dans quelle situation doit-on réaliser une désolidarisation périphérique avant pose carrelage ?", r: "Toujours en pose collée sur chape — profil ou joint souple périphérique 5-8 mm sur tous les murs", opts: ["Uniquement sur plancher chauffant","Toujours en pose collée sur chape — profil ou joint souple périphérique 5-8 mm sur tous les murs","Jamais si colle C2","Uniquement en pièces humides"] },
      ],
      maitre: [
        { q: "Comment gérer un sinistre de décollement massif d'un carrelage de grande surface ?", r: "Expertise contradictoire : analyse support (arrachement), contrôle colle (épaisseur, dosage, DU), rapport d'expertise, activation garantie décennale", opts: ["Reposer directement","Expertise contradictoire : analyse support (arrachement), contrôle colle (épaisseur, dosage, DU), rapport d'expertise, activation garantie décennale","Facturer le client","Ignorer si < 5 ans"] },
      ],
    },

    menuisier: {
      debutant: [
        { q: "Qu'est-ce qu'un dormant de fenêtre ?", r: "Le cadre fixe scellé dans la maçonnerie", opts: ["Le panneau ouvrant","Le cadre fixe scellé dans la maçonnerie","La poignée","Le joint d'étanchéité"] },
        { q: "Quelle essence de bois est la plus résistante aux intempéries pour l'extérieur ?", r: "Chêne, mélèze ou iroko (classe IV)", opts: ["Peuplier","Pin sylvestre","Chêne, mélèze ou iroko (classe IV)","MDF"] },
        { q: "Que désigne la valeur Uw d'une fenêtre ?", r: "Coefficient de déperdition thermique global de la fenêtre (W/m².K)", opts: ["Résistance au bruit","Coefficient de déperdition thermique global de la fenêtre (W/m².K)","Résistance à l'arrachement","Surface vitrée en m²"] },
        { q: "Quel est l'avantage du double vitrage par rapport au simple ?", r: "Meilleure isolation thermique et acoustique", opts: ["Plus léger","Meilleure isolation thermique et acoustique","Moins cher","Pose plus rapide"] },
        { q: "Qu'est-ce qu'un seuil de porte ?", r: "La partie basse de l'encadrement de porte au niveau du sol", opts: ["La serrure","La partie basse de l'encadrement de porte au niveau du sol","Le linteau","Le joint de porte"] },
        { q: "Quel matériau compose un panneau OSB ?", r: "Lamelles de bois orientées et encollées sous pression", opts: ["Placage de bois massif","Lamelles de bois orientées et encollées sous pression","Fibres de verre","Béton cellulaire"] },
        { q: "Quelle quincaillerie permet d'assembler deux pièces de bois perpendiculairement ?", r: "Équerre de renfort avec vis", opts: ["Charnière piano","Équerre de renfort avec vis","Pivots de porte","Crochet à tableau"] },
        { q: "Qu'est-ce que le MDF ?", r: "Medium Density Fiberboard — panneau de fibres de bois à densité moyenne", opts: ["Bois massif traité","Medium Density Fiberboard — panneau de fibres de bois à densité moyenne","Métal déployé","Plaque de plâtre haute dureté"] },
      ],
      confirme: [
        { q: "Quelle norme régit la performance thermique des fenêtres en France ?", r: "NF EN 14351-1 + RE2020 (Uw ≤ 1,3 W/m².K pour neuf)", opts: ["NF EN 520","NF EN 14351-1 + RE2020 (Uw ≤ 1,3 W/m².K pour neuf)","DTU 36.5","NF C 15-100"] },
        { q: "Le DTU 36.5 traite de :", r: "La mise en œuvre des fenêtres et portes extérieures", opts: ["Les parquets","La mise en œuvre des fenêtres et portes extérieures","Les bardages bois","Les cuisines équipées"] },
        { q: "Qu'est-ce qu'un triple vitrage Ug = 0,5 W/m².K ?", r: "Vitrage à isolation renforcée avec 3 vitrages et 2 lames de gaz argon/krypton", opts: ["Verre securit","Vitrage à isolation renforcée avec 3 vitrages et 2 lames de gaz argon/krypton","Simple vitrage traité","Vitrage anti-effraction"] },
        { q: "Quel est le label de performance des fenêtres bois en France ?", r: "ACOTHERM (acoustique + thermique)", opts: ["Qualifen","ACOTHERM (acoustique + thermique)","CE mark seul","A+"] },
        { q: "Comment calcule-t-on la surface d'une menuiserie pour le devis ?", r: "Largeur × hauteur de la baie hors tout (en m²)", opts: ["Surface vitrée uniquement","Largeur × hauteur de la baie hors tout (en m²)","Périmètre du dormant","Surface intérieure habitable"] },
        { q: "Qu'est-ce qu'une isolation par tableaux (ITR) ?", r: "Doublage placé dans les tableaux de fenêtres pour éliminer le pont thermique", opts: ["Isolation entre dormant et vitrage","Doublage placé dans les tableaux de fenêtres pour éliminer le pont thermique","Traitement anti-condensation","Joint mousse de calfeutrement"] },
      ],
      expert: [
        { q: "Qu'est-ce que la valeur Psi (ψ) linéaire d'un pont thermique de fenêtre ?", r: "Déperdition supplémentaire par mètre linéaire de jonction menuiserie/mur, en W/m.K", opts: ["Surface de la fenêtre","Déperdition supplémentaire par mètre linéaire de jonction menuiserie/mur, en W/m.K","Perméabilité à l'air","Résistance à l'arrachement"] },
        { q: "Quelle est la classe d'étanchéité à l'air minimale pour une fenêtre neuve (RE2020) ?", r: "Classe 4 (la plus élevée selon NF EN 12207)", opts: ["Classe 1","Classe 2","Classe 3","Classe 4 (la plus élevée selon NF EN 12207)"] },
      ],
      maitre: [
        { q: "Comment organiser la réception d'un chantier de remplacement de fenêtres (50 logements) ?", r: "Planning de remplacement par logement, réserves contradictoires avec maîtrise d'œuvre, test perméabilité à l'air, levée de réserves documentée", opts: ["Signer la réception sans inspection","Planning de remplacement par logement, réserves contradictoires avec maîtrise d'œuvre, test perméabilité à l'air, levée de réserves documentée","Uniquement photos","Déléguer au fabricant"] },
      ],
    },

    peintre: {
      debutant: [
        { q: "Qu'est-ce qu'une peinture acrylique ?", r: "Peinture à base d'eau et de liant acrylique — séchage rapide, peu d'odeur", opts: ["Peinture glycérophtalique","Peinture à base d'eau et de liant acrylique — séchage rapide, peu d'odeur","Peinture à l'huile de lin","Peinture bitumineuse"] },
        { q: "Quel outil permet d'appliquer une peinture sur une grande surface murale ?", r: "Rouleau laque (manchon + cage)", opts: ["Pinceau plat","Rouleau laque (manchon + cage)","Pistolet airless","Spatule"] },
        { q: "Que signifie 'mat', 'satiné', 'brillant' pour une peinture ?", r: "Le niveau de réflexion lumineuse (brillance) de la surface peinte", opts: ["La composition chimique","Le niveau de réflexion lumineuse (brillance) de la surface peinte","La résistance à l'humidité","L'épaisseur de la couche"] },
        { q: "Pourquoi applique-t-on une couche de primaire avant la peinture de finition ?", r: "Pour améliorer l'adhérence et uniformiser l'absorption du support", opts: ["Pour colorer le fond","Pour améliorer l'adhérence et uniformiser l'absorption du support","Pour accélérer le séchage","Pour économiser de la peinture"] },
        { q: "Quel produit prépare un mur neuf très absorbant ?", r: "Fixateur / primaire d'accrochage diluable", opts: ["Enduit de lissage","Fixateur / primaire d'accrochage diluable","Peinture en sous-couche épaisse","Eau pure"] },
        { q: "Qu'est-ce qu'un enduit de rebouchage ?", r: "Pâte pour boucher les trous, fissures et irrégularités avant peinture", opts: ["Une peinture épaisse","Pâte pour boucher les trous, fissures et irrégularités avant peinture","Un joint de carrelage","Un produit de décapage"] },
        { q: "Quel délai de recouvrement minimal entre deux couches de peinture acrylique ?", r: "2 à 4 heures selon conditions (20°C, 60% HR)", opts: ["30 minutes","2 à 4 heures selon conditions (20°C, 60% HR)","24 heures minimum","72 heures"] },
        { q: "Pourquoi protège-t-on les plinthes avec du ruban de masquage ?", r: "Pour réaliser des arrêtes nettes sans débordement de peinture", opts: ["Pour les isoler thermiquement","Pour réaliser des arrêtes nettes sans débordement de peinture","Pour les protéger de l'humidité","Par obligation réglementaire"] },
      ],
      confirme: [
        { q: "Que désigne un revêtement classé M0 (ou A1) en réaction au feu ?", r: "Non combustible — le meilleur classement (béton, verre, métal)", opts: ["Difficile à coller","Non combustible — le meilleur classement (béton, verre, métal)","Matériaux organiques traités","Ignifugation non certifiée"] },
        { q: "Quelle peinture utilise-t-on pour les façades extérieures exposées aux intempéries ?", r: "Peinture façade microporeuse (acrylique ou siloxane)", opts: ["Peinture intérieure satin","Peinture façade microporeuse (acrylique ou siloxane)","Glycérophtalique diluée","Laque polyuréthane"] },
        { q: "Qu'est-ce qu'un revêtement de sol souple (RSV) ?", r: "Lino, vinyle, moquette — pose collée ou flottante sur sous-couche", opts: ["Parquet massif","Lino, vinyle, moquette — pose collée ou flottante sur sous-couche","Carrelage émaillé","Béton ciré"] },
        { q: "Quel taux COV limite la réglementation pour les peintures décoratives intérieures ?", r: "< 30 g/L pour les peintures mate, < 200 g/L pour brillant (directive 2004/42/CE)", opts: ["Aucun seuil","< 30 g/L pour les peintures mate, < 200 g/L pour brillant (directive 2004/42/CE)","< 500 g/L","< 10 g/L obligatoire"] },
        { q: "Quel enduit permet d'obtenir un mur lisse 'finition toile peinte' sans papier peint ?", r: "Enduit de lissage en pâte (2 couches croisées) ponçage 180", opts: ["Plâtre de projection","Enduit de lissage en pâte (2 couches croisées) ponçage 180","Primaire d'accrochage épais","Ragréage sol"] },
        { q: "Quelle technique applique-t-on pour un effet béton ciré ?", r: "2 couches de micro-béton + adjuvant pigmenté, ponçage entre couches, finition cire ou vernis", opts: ["Peinture béton en spray","2 couches de micro-béton + adjuvant pigmenté, ponçage entre couches, finition cire ou vernis","Plâtre taloché grossier","Résine époxy monocolore"] },
      ],
      expert: [
        { q: "Comment évalue-t-on le pouvoir couvrant d'une peinture ?", r: "Rendement théorique (m²/L) et opacimétrie sur fond noir/blanc — classement de 1 à 4 (4 = très bonne opacité)", opts: ["Uniquement la couleur","Rendement théorique (m²/L) et opacimétrie sur fond noir/blanc — classement de 1 à 4 (4 = très bonne opacité)","Le prix au litre","La viscosité Krebs"] },
        { q: "Quels paramètres influencent la durabilité d'un enduit de façade ?", r: "Préparation du support, perméabilité à la vapeur, déphasage thermique, classement MERUC, flexibilité (classe T ou F)", opts: ["Uniquement la couleur choisie","Préparation du support, perméabilité à la vapeur, déphasage thermique, classement MERUC, flexibilité (classe T ou F)","Marque du fabricant","Saison de pose seule"] },
      ],
      maitre: [
        { q: "Comment rédiger un CCTP (lot peinture) pour un bâtiment neuf de 50 logements ?", r: "Décomposer par type de support (béton, plâtre, métal, bois), spécifier produits (norme, COV), nombre de couches, délais, tolérances de teinte et contrôle réception", opts: ["Utiliser un CCTP générique sans adaptation","Décomposer par type de support (béton, plâtre, métal, bois), spécifier produits (norme, COV), nombre de couches, délais, tolérances de teinte et contrôle réception","Uniquement le coloris et le prix","Déléguer au fabricant"] },
      ],
    },

    couvreur: {
      debutant: [
        { q: "Quelle est la pente minimale pour une toiture en tuiles canal ?", r: "25% (environ 14°)", opts: ["5%","10%","25% (environ 14°)","40%"] },
        { q: "Qu'est-ce qu'un chevron ?", r: "Pièce de bois portant les liteaux de toiture", opts: ["Une tuile faîtière","Pièce de bois portant les liteaux de toiture","Un produit d'étanchéité","Un type de couverture"] },
        { q: "Quel matériau constitue les gouttières les plus courantes ?", r: "PVC ou zinc", opts: ["Béton","PVC ou zinc","Ardoise","Acier inoxydable"] },
        { q: "Qu'est-ce qu'un faîtage ?", r: "L'arête supérieure d'un toit où se rejoignent les deux pans", opts: ["Un type de tuile","L'arête supérieure d'un toit où se rejoignent les deux pans","Une gouttière horizontale","Un système de fixation"] },
        { q: "Pourquoi pose-t-on un écran de sous-toiture ?", r: "Pour protéger la charpente des infiltrations en cas de soulèvement des tuiles", opts: ["Pour l'isolation thermique uniquement","Pour protéger la charpente des infiltrations en cas de soulèvement des tuiles","Pour améliorer l'esthétique","Obligatoire pour les tuiles plates uniquement"] },
        { q: "Quel EPI est indispensable pour travailler en toiture ?", r: "Harnais antichute + ligne de vie + casque", opts: ["Casque seul","Harnais antichute + ligne de vie + casque","Chaussures de sécurité seules","Lunettes de protection"] },
        { q: "Qu'est-ce que la zinguerie ?", r: "Travaux de couverture en zinc : noues, chéneaux, solins", opts: ["Pose de tuiles en zinc","Travaux de couverture en zinc : noues, chéneaux, solins","Isolation de toiture","Traitement anti-mousse"] },
        { q: "Une noue est :", r: "La rencontre en creux de deux pans de toiture", opts: ["Un type de fixation de tuile","La rencontre en creux de deux pans de toiture","Le faîte d'un toit","Une lucarne de toit"] },
      ],
      confirme: [
        { q: "Quel DTU régit la pose de tuiles de terre cuite ?", r: "DTU 40.21", opts: ["DTU 40.11","DTU 40.21","DTU 40.35","DTU 43.1"] },
        { q: "Quelle est la charge maximale admissible sur une toiture-terrasse non accessible ?", r: "150 kg/m² (charges d'entretien)", opts: ["50 kg/m²","100 kg/m²","150 kg/m² (charges d'entretien)","300 kg/m²"] },
        { q: "Qu'est-ce qu'un relevé d'étanchéité ?", r: "La remontée verticale du complexe d'étanchéité sur les points singuliers (acrotères, souches)", opts: ["Un relevé topographique","La remontée verticale du complexe d'étanchéité sur les points singuliers (acrotères, souches)","Un tableau récapitulatif","Un test de résistance"] },
        { q: "Que désigne la classe de vent V3 pour une toiture ?", r: "Zone de vent élevée — pression de vent 1400 Pa selon DTU", opts: ["Vitesse 3 m/s","Zone de vent élevée — pression de vent 1400 Pa selon DTU","Troisième couche de tuiles","Fixation avec 3 agrafes"] },
        { q: "Quel système de fixation garantit la résistance au vent des tuiles en zone V3 ?", r: "Agrafage ou crochetage systématique de toutes les tuiles (pas seulement périphérie)", opts: ["Fixation au mortier uniquement","Agrafage ou crochetage systématique de toutes les tuiles (pas seulement périphérie)","Aucune fixation — poids propre","2 vis par rang"] },
        { q: "Qu'est-ce qu'une toiture-terrasse accessible végétalisée ?", r: "Toiture avec complexe d'étanchéité + drain + substrat + végétalisation, accessible au public", opts: ["Un toit avec herbe sauvage","Toiture avec complexe d'étanchéité + drain + substrat + végétalisation, accessible au public","Un panneau solaire végétal","Un toit en tuiles vertes"] },
      ],
      expert: [
        { q: "Comment calcule-t-on la quantité de tuiles pour 100 m² de toiture à 30% de pente ?", r: "Surface au sol × (1/cos θ) = surface inclinée ; nb tuiles = S / (surface unitaire × (1-recouvrement))", opts: ["100 tuiles pour 100 m² systématiquement","Surface au sol × (1/cos θ) = surface inclinée ; nb tuiles = S / (surface unitaire × (1-recouvrement))","Quantité forfaitaire fabricant","Surface + 10% de chute"] },
        { q: "Qu'est-ce que le classement FIT d'une membrane d'étanchéité ?", r: "F = flexibilité à froid, I = imperméabilité, T = tenue à la chaleur", opts: ["Fabrication-Installation-Toiture","F = flexibilité à froid, I = imperméabilité, T = tenue à la chaleur","Force-Impact-Traction","Certification de formation installateur"] },
        { q: "Quels sont les points singuliers à traiter en priorité sur une toiture-terrasse ?", r: "Acrotères, souches, pénétrations (VMC, gaines), joints de dilatation, évacuations EP", opts: ["Uniquement le faîte","Acrotères, souches, pénétrations (VMC, gaines), joints de dilatation, évacuations EP","Aucun point singulier si membrane continue","Les angles uniquement"] },
      ],
      maitre: [
        { q: "Quelles dispositions prend-on pour un chantier de couverture en zone urbaine dense ?", r: "Plan de signalisation, protection des piétons (palissade + filet), coordination avec réseaux (lignes HT aériennes), autorisation voirie, PPSPS", opts: ["Aucune disposition spécifique","Plan de signalisation, protection des piétons (palissade + filet), coordination avec réseaux (lignes HT aériennes), autorisation voirie, PPSPS","Fermer la rue","Travailler uniquement la nuit"] },
        { q: "Comment réceptionner une toiture-terrasse après travaux ?", r: "Test d'étanchéité (mise en eau 24h ou test fumée), contrôle relevés et joints, rapport écrit, levée de réserves, activation assurance dommages-ouvrage", opts: ["Vérification visuelle seule","Test d'étanchéité (mise en eau 24h ou test fumée), contrôle relevés et joints, rapport écrit, levée de réserves, activation assurance dommages-ouvrage","Signature du bon de livraison","Confier au maître d'ouvrage"] },
      ],
    },
  },
};

// ── Rendu ─────────────────────────────────────────────────────────────────────
Pages.quizMetiers = function() {
  const state = JSON.parse(localStorage.getItem('plaqpro_quiz_metiers') || '{}');
  const div = document.createElement('div');
  div.innerHTML = `
<div style="max-width:900px;margin:0 auto;padding:16px">
  <div style="text-align:center;margin-bottom:24px">
    <h1 style="font-size:2rem;font-weight:800;background:linear-gradient(135deg,#e74c3c,#8e44ad);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
      🎮 Quiz Métiers BTP
    </h1>
    <p style="color:var(--text-tertiary);margin-top:4px">Formation professionnelle — 8 corps de métier · 4 niveaux · IA illimitée</p>
  </div>

  <div id="qm-screen-metier">
    <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:14px;color:var(--text-primary)">Choisissez votre métier</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:28px">
      ${QM_DATA.metiers.map(m => {
        const done = Object.values(QM_DATA.niveaux).filter(n => {
          const k = `${m.id}_${n.id}`;
          return state[k] && state[k].completed;
        }).length;
        return `<div onclick="QM.choisirMetier('${m.id}')" style="background:var(--bg-secondary);border:2px solid var(--border);border-radius:var(--radius-lg);padding:16px;cursor:pointer;transition:all .15s;position:relative" onmouseover="this.style.borderColor='${m.color}'" onmouseout="this.style.borderColor='var(--border)'">
          <div style="font-size:2rem;margin-bottom:8px">${m.icon}</div>
          <div style="font-weight:700;font-size:.95rem;color:var(--text-primary)">${m.label}</div>
          <div style="font-size:.78rem;color:var(--text-tertiary);margin-top:4px">${m.desc}</div>
          ${done > 0 ? `<div style="position:absolute;top:10px;right:10px;background:${m.color};color:#fff;font-size:.7rem;padding:2px 7px;border-radius:99px;font-weight:700">${done}/4 ✓</div>` : ''}
        </div>`;
      }).join('')}
    </div>

    ${_qmBadges(state)}
  </div>

  <div id="qm-screen-niveau" style="display:none"></div>
  <div id="qm-screen-quiz" style="display:none"></div>
  <div id="qm-screen-result" style="display:none"></div>
</div>`;
  return div;
};

function _qmBadges(state) {
  const total = QM_DATA.metiers.length * QM_DATA.niveaux.length;
  const done = QM_DATA.metiers.reduce((acc, m) =>
    acc + QM_DATA.niveaux.filter(n => {
      const k = `${m.id}_${n.id}`;
      return state[k] && state[k].completed;
    }).length, 0);
  if (done === 0) return '';
  const pct = Math.round(done / total * 100);
  return `<div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;margin-top:8px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span style="font-weight:700;color:var(--text-primary)">🏅 Progression globale</span>
      <span style="font-weight:700;color:var(--accent)">${done}/${total} niveaux</span>
    </div>
    <div style="background:var(--border);border-radius:99px;height:8px;overflow:hidden">
      <div style="background:linear-gradient(90deg,#e74c3c,#8e44ad);height:100%;width:${pct}%;transition:width .3s"></div>
    </div>
    <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px">
      ${QM_DATA.metiers.map(m => {
        const lvls = QM_DATA.niveaux.filter(n => {
          const k = `${m.id}_${n.id}`;
          return state[k] && state[k].completed;
        });
        if (!lvls.length) return '';
        return `<span style="background:#1a1a2e;color:#fff;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600">${m.icon} ${m.label} — ${lvls.map(n => '★'.repeat(n.stars)).join(' ')}</span>`;
      }).join('')}
    </div>
  </div>`;
}

// ── Contrôleur ─────────────────────────────────────────────────────────────
window.QM = {
  _metier: null,
  _niveau: null,
  _questions: [],
  _current: 0,
  _score: 0,
  _answered: false,
  _iaMode: false,

  choisirMetier(id) {
    this._metier = QM_DATA.metiers.find(m => m.id === id);
    const state = JSON.parse(localStorage.getItem('plaqpro_quiz_metiers') || '{}');
    document.getElementById('qm-screen-metier').style.display = 'none';
    document.getElementById('qm-screen-niveau').style.display = '';
    document.getElementById('qm-screen-niveau').innerHTML = this._renderNiveaux(state);
  },

  _renderNiveaux(state) {
    const m = this._metier;
    return `<div>
      <button onclick="QM.retourMetiers()" style="background:none;border:none;color:var(--text-tertiary);cursor:pointer;font-size:.9rem;margin-bottom:16px">← Retour</button>
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:3rem">${m.icon}</div>
        <h2 style="font-weight:800;font-size:1.4rem;margin-top:8px">${m.label}</h2>
        <p style="color:var(--text-tertiary)">${m.desc}</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;margin-bottom:20px">
        ${QM_DATA.niveaux.map(n => {
          const k = `${m.id}_${n.id}`;
          const done = state[k] && state[k].completed;
          const best = done ? state[k].best : null;
          return `<div onclick="QM.choisirNiveau('${n.id}')" style="background:var(--bg-secondary);border:2px solid ${done ? m.color : 'var(--border)'};border-radius:var(--radius-lg);padding:16px;cursor:pointer;text-align:center;transition:border-color .15s" onmouseover="this.style.borderColor='${m.color}'" onmouseout="this.style.borderColor='${done ? m.color : 'var(--border)'}'">
            <div style="font-size:1.4rem;margin-bottom:6px">${'★'.repeat(n.stars)}${'☆'.repeat(4 - n.stars)}</div>
            <div style="font-weight:700;font-size:1rem">${n.label}</div>
            <div style="font-size:.8rem;color:var(--text-tertiary);margin-top:4px">${n.sublabel}</div>
            ${done ? `<div style="margin-top:8px;font-size:.8rem;color:${m.color};font-weight:700">✓ Meilleur: ${best}%</div>` : ''}
          </div>`;
        }).join('')}
      </div>
      <div style="text-align:center;margin-top:8px">
        <button onclick="QM.lancerIA()" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:10px 22px;border-radius:var(--radius-lg);cursor:pointer;font-weight:700;font-size:.9rem">
          🤖 Questions IA illimitées (Groq)
        </button>
      </div>
    </div>`;
  },

  choisirNiveau(id) {
    this._niveau = QM_DATA.niveaux.find(n => n.id === id);
    this._iaMode = false;
    this._lancerQuiz();
  },

  _lancerQuiz() {
    const pool = this._iaMode
      ? this._questions
      : (QM_DATA.questions[this._metier.id]?.[this._niveau?.id] || []);

    if (!pool.length) {
      alert('Aucune question disponible pour cette combinaison.');
      return;
    }

    // Anti-répétition : mélange aléatoire
    this._questions = [...pool].sort(() => Math.random() - 0.5);
    this._current = 0;
    this._score = 0;
    this._answered = false;

    document.getElementById('qm-screen-niveau').style.display = 'none';
    document.getElementById('qm-screen-quiz').style.display = '';
    this._afficherQuestion();
  },

  _afficherQuestion() {
    const q = this._questions[this._current];
    const total = this._questions.length;
    const m = this._metier;
    const screen = document.getElementById('qm-screen-quiz');
    const opts = [...q.opts].sort(() => Math.random() - 0.5);

    screen.innerHTML = `
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <button onclick="QM.retourNiveaux()" style="background:none;border:none;color:var(--text-tertiary);cursor:pointer">←</button>
          <span style="font-size:.85rem;color:var(--text-tertiary)">${m.icon} ${m.label}${this._iaMode ? ' · IA' : (' · ' + this._niveau.label)}</span>
          <span style="margin-left:auto;font-weight:700;color:var(--accent)">${this._current + 1} / ${total}</span>
        </div>
        <div style="background:var(--border);border-radius:99px;height:5px;margin-bottom:20px;overflow:hidden">
          <div style="background:${m.color};height:100%;width:${((this._current + 1) / total * 100)}%;transition:width .3s"></div>
        </div>
        <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px">
          <p style="font-weight:700;font-size:1.05rem;line-height:1.5;color:var(--text-primary)">${q.q}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px" id="qm-opts">
          ${opts.map((o, i) => `
            <button onclick="QM.repondre(${JSON.stringify(o)}, this)" id="qm-opt-${i}" style="background:var(--bg-secondary);border:2px solid var(--border);border-radius:var(--radius-lg);padding:12px 16px;text-align:left;cursor:pointer;font-size:.9rem;transition:all .15s;color:var(--text-primary)">
              ${o}
            </button>
          `).join('')}
        </div>
        <div id="qm-explication" style="display:none;margin-top:14px;padding:14px;background:#1a1a2e;border-radius:var(--radius-lg);color:#e0e0e0;font-size:.88rem;line-height:1.6"></div>
        <div style="margin-top:16px;text-align:right">
          <button id="qm-btn-next" onclick="QM.suivant()" style="display:none;background:${m.color};color:#fff;border:none;padding:10px 24px;border-radius:var(--radius-lg);cursor:pointer;font-weight:700">
            ${this._current + 1 < this._questions.length ? 'Question suivante →' : 'Voir les résultats'}
          </button>
        </div>
      </div>`;
    this._answered = false;
  },

  repondre(choix, btn) {
    if (this._answered) return;
    this._answered = true;
    const q = this._questions[this._current];
    const correct = choix === q.r;
    if (correct) this._score++;

    document.querySelectorAll('#qm-opts button').forEach(b => {
      b.style.cursor = 'default';
      if (b.textContent.trim() === q.r) {
        b.style.background = '#27ae60';
        b.style.color = '#fff';
        b.style.borderColor = '#27ae60';
      }
    });
    if (!correct) {
      btn.style.background = '#e74c3c';
      btn.style.color = '#fff';
      btn.style.borderColor = '#e74c3c';
    }

    const expl = document.getElementById('qm-explication');
    expl.style.display = '';
    expl.innerHTML = correct
      ? `✅ <strong>Bonne réponse !</strong> ${q.expl || ''}`
      : `❌ <strong>Mauvaise réponse.</strong> La bonne réponse était : <strong>${q.r}</strong>${q.expl ? '<br>' + q.expl : ''}`;

    document.getElementById('qm-btn-next').style.display = '';
  },

  suivant() {
    this._current++;
    if (this._current < this._questions.length) {
      this._afficherQuestion();
    } else {
      this._afficherResultat();
    }
  },

  _afficherResultat() {
    const total = this._questions.length;
    const pct = Math.round(this._score / total * 100);
    const m = this._metier;
    const n = this._niveau;

    if (!this._iaMode && n) {
      const state = JSON.parse(localStorage.getItem('plaqpro_quiz_metiers') || '{}');
      const k = `${m.id}_${n.id}`;
      const prev = state[k] || {};
      state[k] = {
        completed: true,
        best: Math.max(pct, prev.best || 0),
        attempts: (prev.attempts || 0) + 1,
        lastScore: pct,
        lastDate: new Date().toLocaleDateString('fr-FR'),
      };
      localStorage.setItem('plaqpro_quiz_metiers', JSON.stringify(state));
    }

    const msg = pct >= 90 ? '🏆 Excellent !' : pct >= 70 ? '👍 Bien joué !' : pct >= 50 ? '📚 Continuez à apprendre' : '💪 Révisez et recommencez';

    document.getElementById('qm-screen-quiz').style.display = 'none';
    document.getElementById('qm-screen-result').style.display = '';
    document.getElementById('qm-screen-result').innerHTML = `
      <div style="text-align:center;padding:32px 16px">
        <div style="font-size:4rem;margin-bottom:16px">${pct >= 70 ? '🏅' : '📋'}</div>
        <h2 style="font-size:2rem;font-weight:800;color:${m.color}">${pct}%</h2>
        <p style="font-size:1.1rem;color:var(--text-primary);margin:8px 0">${msg}</p>
        <p style="color:var(--text-tertiary)">${this._score} / ${total} bonnes réponses · ${m.icon} ${m.label}${n ? ' · ' + n.label : ' · IA'}</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px">
          <button onclick="QM._lancerQuiz()" style="background:${m.color};color:#fff;border:none;padding:10px 22px;border-radius:var(--radius-lg);cursor:pointer;font-weight:700">🔄 Recommencer</button>
          <button onclick="QM.retourNiveaux()" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-primary);padding:10px 22px;border-radius:var(--radius-lg);cursor:pointer;font-weight:700">← Changer de niveau</button>
          <button onclick="QM.retourMetiers()" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-primary);padding:10px 22px;border-radius:var(--radius-lg);cursor:pointer;font-weight:700">🏗 Changer de métier</button>
          <button onclick="QM.lancerIA()" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:10px 22px;border-radius:var(--radius-lg);cursor:pointer;font-weight:700">🤖 IA illimitée</button>
        </div>
      </div>`;
  },

  retourMetiers() {
    document.getElementById('qm-screen-niveau').style.display = 'none';
    document.getElementById('qm-screen-quiz').style.display = 'none';
    document.getElementById('qm-screen-result').style.display = 'none';
    document.getElementById('qm-screen-metier').style.display = '';
  },

  retourNiveaux() {
    const state = JSON.parse(localStorage.getItem('plaqpro_quiz_metiers') || '{}');
    document.getElementById('qm-screen-quiz').style.display = 'none';
    document.getElementById('qm-screen-result').style.display = 'none';
    document.getElementById('qm-screen-niveau').style.display = '';
    document.getElementById('qm-screen-niveau').innerHTML = this._renderNiveaux(state);
  },

  async lancerIA() {
    const apiKey = localStorage.getItem('plaqpro_groq_key') || localStorage.getItem('groq_api_key') || '';
    if (!apiKey.startsWith('gsk_')) {
      const saisie = prompt('Clé API Groq (gsk_...) pour les questions IA illimitées :');
      if (!saisie || !saisie.startsWith('gsk_')) {
        alert('Clé Groq invalide. Les questions IA ne sont pas disponibles.');
        return;
      }
      localStorage.setItem('plaqpro_groq_key', saisie);
    }
    const metierLabel = this._metier?.label || 'BTP général';
    document.getElementById('qm-screen-niveau').innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-tertiary)">🤖 Génération de 10 questions IA pour ${metierLabel}…</div>`;
    document.getElementById('qm-screen-niveau').style.display = '';
    document.getElementById('qm-screen-metier').style.display = 'none';

    try {
      const key = localStorage.getItem('plaqpro_groq_key') || localStorage.getItem('groq_api_key');
      const prompt = `Tu es un formateur expert en BTP français. Génère exactement 10 questions QCM de niveau expert sur le métier : ${metierLabel}.
Format JSON strict (tableau) :
[{"q":"Question?","r":"Réponse exacte","opts":["Réponse exacte","Mauvaise1","Mauvaise2","Mauvaise3"],"expl":"Explication courte"}]
- Les options doivent contenir 4 éléments dont la bonne réponse
- Questions techniques précises avec normes, DTU, matériaux spécifiques
- Niveau professionnel confirmé ou expert
- Réponse en JSON pur, sans markdown`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });
      const data = await res.json();
      const txt = data.choices?.[0]?.message?.content || '';
      const match = txt.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('Format invalide');
      const questions = JSON.parse(match[0]);
      if (!Array.isArray(questions) || !questions.length) throw new Error('Tableau vide');
      this._iaMode = true;
      this._questions = questions;
      this._lancerQuiz();
    } catch (e) {
      document.getElementById('qm-screen-niveau').innerHTML = `<div style="text-align:center;padding:32px;color:#e74c3c">
        ❌ Erreur IA : ${e.message}<br><br>
        <button onclick="QM.retourMetiers()" style="background:var(--bg-secondary);border:1px solid var(--border);padding:8px 18px;border-radius:var(--radius-lg);cursor:pointer">← Retour</button>
      </div>`;
    }
  },
};
