# Format des objectifs Atlas

Ce document decrit le format officiel des fichiers d'objectif metier Atlas.
Un objectif Atlas est un fichier JSON declaratif. Il ne contient aucune interface, aucune IA et aucun code executable.

Les objectifs sont stockes dans `knowledge/objectives/` et charges par `knowledge/ObjectiveRegistry.js`.

## Structure d'un fichier objective JSON

Un fichier objective JSON decrit un objectif metier et la liste des connaissances attendues pour diagnostiquer si un projet est pret.

Structure generale :

```json
{
  "id": "objective_doublage_v1",
  "key": "doublage",
  "label": "Doublage",
  "description": "Schema de connaissances necessaires au diagnostic de doublage.",
  "requirements": []
}
```

## Champs obligatoires de l'objectif

- `id` : identifiant stable et unique de l'objectif.
- `key` : cle courte utilisee pour charger l'objectif.
- `label` : nom lisible de l'objectif.
- `requirements` : tableau des connaissances attendues.

## Champs optionnels de l'objectif

- `description` : description lisible du role de l'objectif.

## Structure d'un requirement

Chaque element de `requirements` doit respecter le modele `KnowledgeRequirement`.

```json
{
  "key": "surface_murs",
  "label": "Surface des murs",
  "description": "Surface totale des murs concernes par le doublage.",
  "required": true,
  "priority": 5,
  "category": "mesures",
  "acceptedSources": ["MEASURE", "PLAN", "PDF", "USER", "ESTIMATED"],
  "validationRules": [{ "type": "number" }],
  "dependsOn": [],
  "confidenceWeight": 1.4,
  "defaultQuestions": ["Quelle est la surface totale des murs a doubler ?"]
}
```

## Champs obligatoires d'un requirement

- `key` : cle unique de la connaissance. Elle doit correspondre au `type` d'une connaissance Atlas.
- `label` : libelle lisible.
- `description` : explication courte de la connaissance attendue.
- `required` : booleen. `true` rend la connaissance bloquante si elle manque.
- `priority` : niveau de priorite de 1 a 5.
- `category` : groupe logique de la connaissance.
- `acceptedSources` : tableau de sources autorisees.
- `validationRules` : tableau de regles de validation.
- `dependsOn` : tableau de dependances.
- `confidenceWeight` : poids de confiance de la connaissance.
- `defaultQuestions` : tableau de questions par defaut.

## Champs optionnels d'un requirement

Aucun champ supplementaire n'est requis par le format v1. Les nouveaux champs doivent rester declaratifs et ne doivent pas introduire de logique executable.

## Sources autorisees

Les sources doivent appartenir a la liste connue par `KnowledgeSource` :

- `USER` : information fournie par l'utilisateur.
- `PHOTO` : information issue d'une photo.
- `PLAN` : information issue d'un plan.
- `PDF` : information issue d'un document PDF.
- `MEASURE` : information mesuree.
- `OCR` : information issue d'une reconnaissance de texte.
- `AI` : information issue d'un traitement IA externe au schema.
- `IMPORT` : information importee.
- `CALCULATED` : information calculee.
- `ESTIMATED` : information estimee.

Un objectif metier peut restreindre cette liste. Par exemple l'objectif doublage utilise :

- `USER`
- `PHOTO`
- `PLAN`
- `PDF`
- `MEASURE`
- `AI`
- `ESTIMATED`

## validationRules

`validationRules` decrit les validations appliquees a une valeur de connaissance.

Types prevus :

- `required` : la valeur ne doit pas etre vide.
- `number` : la valeur doit etre un nombre fini.
- `text` : la valeur doit etre une chaine non vide.
- `boolean` : la valeur doit etre un booleen.
- `enum` : la valeur doit appartenir a une liste.
- `range` : la valeur numerique doit etre comprise entre `min` et `max`.
- `regex` : la valeur texte doit correspondre a un motif.
- `custom` : validation reservee au code, a eviter dans les objectifs JSON.

Exemples :

```json
[{ "type": "number" }, { "type": "range", "value": { "min": 0.1 } }]
```

```json
[{ "type": "boolean" }]
```

```json
[{ "type": "text" }]
```

## dependsOn

`dependsOn` decrit les dependances entre connaissances.

Dans le format JSON, une dependance peut rester vide :

```json
"dependsOn": []
```

Elle peut aussi referencer une autre connaissance sous forme declarative :

```json
"dependsOn": [
  {
    "dependsOn": ["presence_plafond"],
    "description": "La hauteur n'est demandee que si un plafond existe."
  }
]
```

La logique metier precise doit rester dans les moteurs ou les validateurs testes, pas dans le JSON.

## priority

`priority` indique l'importance d'une connaissance pour le diagnostic.

- `1` : faible priorite.
- `2` : priorite basse.
- `3` : priorite normale.
- `4` : priorite haute.
- `5` : priorite critique.

Le `DiagnosticEngine` utilise cette priorite pour trier les actions suggerees.

## confidenceWeight

`confidenceWeight` indique le poids relatif d'une connaissance dans l'evaluation de confiance.

Recommandations :

- `0.1` a `0.5` : information utile mais secondaire.
- `0.6` a `1` : information standard.
- `1.1` a `1.5` : information importante.
- au-dessus de `1.5` : a reserver aux connaissances structurantes.

Le poids doit rester numerique et positif.

## defaultQuestions

`defaultQuestions` contient des questions simples permettant de demander la connaissance manquante.

Exemple :

```json
"defaultQuestions": ["Quelle est la hauteur sous plafond ?"]
```

Ces questions sont declaratives. Elles ne doivent contenir ni logique, ni prompt IA, ni instruction d'interface.

## Exemple complet base sur doublage

```json
{
  "id": "objective_doublage_v1",
  "key": "doublage",
  "label": "Doublage",
  "description": "Schema de connaissances necessaires au diagnostic de doublage.",
  "requirements": [
    {
      "key": "surface_murs",
      "label": "Surface des murs",
      "description": "Surface totale des murs concernes par le doublage.",
      "required": true,
      "priority": 5,
      "category": "mesures",
      "acceptedSources": ["MEASURE", "PLAN", "PDF", "USER", "ESTIMATED"],
      "validationRules": [{ "type": "number" }, { "type": "range", "value": { "min": 0.1 } }],
      "dependsOn": [],
      "confidenceWeight": 1.4,
      "defaultQuestions": ["Quelle est la surface totale des murs a doubler ?"]
    },
    {
      "key": "type_support",
      "label": "Type de support",
      "description": "Nature du support existant recevant le doublage.",
      "required": true,
      "priority": 5,
      "category": "support",
      "acceptedSources": ["USER", "PHOTO", "AI"],
      "validationRules": [{ "type": "text" }],
      "dependsOn": [],
      "confidenceWeight": 1.2,
      "defaultQuestions": ["Quel est le type de support existant ?"]
    },
    {
      "key": "marque_preferee",
      "label": "Marque preferee",
      "description": "Marque ou fournisseur prefere s'il existe.",
      "required": false,
      "priority": 1,
      "category": "preference",
      "acceptedSources": ["USER", "PDF"],
      "validationRules": [{ "type": "text" }],
      "dependsOn": [],
      "confidenceWeight": 0.3,
      "defaultQuestions": ["Y a-t-il une marque preferee ?"]
    }
  ]
}
```

## Regles de creation d'un nouvel objectif metier

1. Creer un fichier JSON dans `knowledge/objectives/`.
2. Utiliser un `id` stable, versionne si besoin, par exemple `objective_nom_v1`.
3. Utiliser une `key` courte, sans espace, en minuscules et avec underscores si necessaire.
4. Decrire chaque connaissance sous forme de `KnowledgeRequirement` complet.
5. Marquer `required: true` uniquement pour les informations bloquantes.
6. Donner une priorite de 1 a 5 selon l'importance pour le diagnostic.
7. Limiter `acceptedSources` aux sources reellement acceptables.
8. Utiliser des `validationRules` simples et declaratives.
9. Garder `dependsOn` declaratif et testable.
10. Ajouter des `defaultQuestions` courtes et neutres.
11. Ajouter un test dans `knowledge/tests/`.
12. Verifier que l'objectif se charge avec `ObjectiveRegistry`.
13. Verifier que `DiagnosticEngine` produit les actions attendues.
14. Ne jamais mettre d'HTML, de CSS, de logique UI ou de prompt IA dans un objectif.
