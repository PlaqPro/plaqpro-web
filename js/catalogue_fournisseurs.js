/**
 * PlaqPro+ — Module Catalogue Fournisseurs
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits réservés
 */

Pages.catalogueFournisseurs = function() {
  const div = document.createElement('div');

  if (!document.getElementById('style-catalogue')) {
    const s = document.createElement('style');
    s.id = 'style-catalogue';
    s.textContent = `
      .cat-hero { background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
        border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; color: #fff; }
      .cat-hero h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
      .cat-hero p { font-size: 13px; opacity: .8; }
      .cat-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
      .cat-filter { padding: 6px 14px; border-radius: 980px; font-size: 12px; font-weight: 600;
        border: 1px solid var(--border); background: var(--bg-secondary);
        color: var(--text-secondary); cursor: pointer; transition: all .15s; }
      .cat-filter.active { background: #0d9488; color: #fff; border-color: #0d9488; }
      .cat-search { width: 100%; padding: 10px 14px; background: var(--bg-secondary);
        border: 1px solid var(--border); border-radius: var(--radius-md);
        color: var(--text-primary); font-size: 14px; margin-bottom: 16px; }
      .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
      .cat-card { background: var(--bg-secondary); border: 1px solid var(--border);
        border-radius: var(--radius-lg); padding: 16px; transition: all .2s;
        display: flex; flex-direction: column; gap: 10px; }
      .cat-card:hover { border-color: #0d9488; transform: translateY(-2px); }
      .cat-card.favori { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.04); }
      .cat-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
      .cat-card-logo { width: 40px; height: 40px; border-radius: 10px;
        background: var(--bg-primary); border: 1px solid var(--border);
        display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
      .cat-card-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
      .cat-card-type { font-size: 11px; color: var(--text-tertiary); }
      .cat-tags { display: flex; flex-wrap: wrap; gap: 5px; }
      .cat-tag { padding: 2px 8px; border-radius: 980px; font-size: 10px; font-weight: 600;
        background: rgba(13,148,136,0.1); color: #0d9488; }
      .cat-tag.orange { background: rgba(255,159,10,0.1); color: #f59e0b; }
      .cat-tag.blue { background: rgba(10,132,255,0.1); color: #0A84FF; }
      .cat-tag.purple { background: rgba(191,90,242,0.1); color: #BF5AF2; }
      .cat-card-desc { font-size: 12px; color: var(--text-tertiary); line-height: 1.5; }
      .cat-card-footer { display: flex; gap: 8px; align-items: center; padding-top: 8px;
        border-top: 1px solid var(--border); }
      .cat-btn-site { flex: 1; text-align: center; padding: 7px 12px; border-radius: var(--radius-sm);
        background: #0d9488; color: #fff; font-size: 12px; font-weight: 600;
        text-decoration: none; transition: opacity .15s; }
      .cat-btn-site:hover { opacity: .85; }
      .cat-btn-fav { width: 32px; height: 32px; border-radius: var(--radius-sm);
        background: var(--bg-primary); border: 1px solid var(--border);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 14px; transition: all .15s; flex-shrink: 0; }
      .cat-btn-fav:hover { border-color: #f59e0b; }
      .cat-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: .08em; color: var(--text-tertiary);
        margin: 20px 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
      .cat-empty { text-align: center; padding: 48px; color: var(--text-tertiary); font-size: 14px; }
      .cat-add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 16px;
        border-radius: var(--radius-md); background: rgba(13,148,136,0.08);
        border: 1px dashed #0d9488; color: #0d9488; font-size: 13px; font-weight: 600;
        cursor: pointer; transition: all .15s; margin-bottom: 20px; }
      .cat-add-btn:hover { background: rgba(13,148,136,0.15); }
    `;
    document.head.appendChild(s);
  }

  const FOURNISSEURS = [
    // ── NÉGOCE GÉNÉRALISTE ──
    { id:'pointp', nom:'Point.P', emoji:'🏗', type:'Négoce généraliste', url:'https://www.pointp.fr', desc:'1er réseau de négoce BTP en France. Placo, isolation, mortiers, outillage, livraison chantier.', tags:['Placo','Isolation','Gros œuvre','Livraison'], corps:['plaquiste','peintre','macon','tous'], categorie:'negoce' },
    { id:'bricoman', nom:'Bricoman', emoji:'🔨', type:'GSB Pro', url:'https://www.bricoman.fr', desc:'Prix bas dédiés aux professionnels. Large choix plâtrerie, peinture, isolation, outillage.', tags:['Prix pro','Plâtrerie','Peinture','Outillage'], corps:['plaquiste','peintre','tous'], categorie:'negoce' },
    { id:'bigmat', nom:'BigMat', emoji:'🧱', type:'Négoce matériaux', url:'https://www.bigmat.fr', desc:'Coopérative de négociants indépendants. Matériaux de construction, gros œuvre, couverture.', tags:['Gros œuvre','Couverture','Maçonnerie'], corps:['macon','tous'], categorie:'negoce' },
    { id:'tout_faire', nom:'Tout Faire', emoji:'🏠', type:'Négoce BTP', url:'https://www.toutfaire.fr', desc:'Réseau de négociants locaux. Matériaux, isolation, charpente, couverture, menuiserie.', tags:['Matériaux','Charpente','Couverture'], corps:['tous'], categorie:'negoce' },
    { id:'chausson', nom:'Chausson Matériaux', emoji:'🏛', type:'Négoce matériaux', url:'https://www.chausson-materiaux.fr', desc:'Matériaux de construction. Béton, parpaings, briques, couverture, isolation.', tags:['Béton','Parpaings','Couverture'], corps:['macon','tous'], categorie:'negoce' },
    { id:'lariviere', nom:'Larivière', emoji:'⚙️', type:'Négoce multi-corps', url:'https://www.lariviere.fr', desc:'Négoce matériaux et outillage professionnel pour artisans BTP.', tags:['Multi-corps','Outillage','Matériaux'], corps:['tous'], categorie:'negoce' },
    { id:'reseau_pro', nom:'Réseau Pro', emoji:'🔧', type:'GSB Pro', url:'https://www.reseaupro.fr', desc:'Enseigne pro de Leroy Merlin dédiée aux artisans. Prix négociés, compte pro.', tags:['Prix pro','Compte pro','Large gamme'], corps:['tous'], categorie:'negoce' },

    // ── PLACO / ISOLATION / SECOND ŒUVRE ──
    { id:'placo', nom:'Placo® Saint-Gobain', emoji:'🧱', type:'Fabricant plâtrerie', url:'https://www.placo.fr', desc:'Leader mondial des plaques de plâtre. BA13, double plaque, hydro, feu. Solutions cloisons et doublages.', tags:['BA13','Hydro','Feu','Cloisons'], corps:['plaquiste'], categorie:'placo' },
    { id:'knauf', nom:'Knauf', emoji:'🧱', type:'Fabricant plâtrerie', url:'https://www.knauf.fr', desc:'Plaques de plâtre, mortiers, enduits. Systèmes cloisons et doublages complets.', tags:['Plaques','Mortiers','Enduits'], corps:['plaquiste','macon'], categorie:'placo' },
    { id:'siniat', nom:'Siniat', emoji:'🧱', type:'Fabricant plâtrerie', url:'https://www.siniat.fr', desc:'Plaques de plâtre et systèmes de construction sèche. Solutions acoustiques et feu.', tags:['Construction sèche','Acoustique','Feu'], corps:['plaquiste'], categorie:'placo' },
    { id:'isover', nom:'Isover Saint-Gobain', emoji:'🌡️', type:'Fabricant isolation', url:'https://www.isover.fr', desc:'Laines de verre et de roche. Solutions isolation thermique et acoustique pour tous corps.', tags:['Laine de verre','Acoustique','Thermique'], corps:['plaquiste','tous'], categorie:'isolation' },
    { id:'rockwool', nom:'Rockwool', emoji:'🔊', type:'Fabricant isolation', url:'https://www.rockwool.com/fr', desc:'Laine de roche haute performance. Isolation thermique, acoustique et résistance au feu.', tags:['Laine de roche','Feu','Acoustique'], corps:['plaquiste','tous'], categorie:'isolation' },
    { id:'usg', nom:'USG Boral / Fermacell', emoji:'🧱', type:'Fabricant plâtrerie', url:'https://www.fermacell.fr', desc:'Plaques Fermacell fibres-gypse. Haute résistance, humidité, feu. Alternative BA13.', tags:['Fermacell','Fibres-gypse','Humidité'], corps:['plaquiste'], categorie:'placo' },

    // ── PEINTURE / ENDUITS ──
    { id:'weber', nom:'Weber Saint-Gobain', emoji:'🎨', type:'Fabricant enduits', url:'https://www.weber.fr', desc:'Mortiers, enduits, colles carrelage, ragréages. Solutions façade et intérieur.', tags:['Enduits','Mortiers','Façade'], corps:['peintre','macon','carreleur'], categorie:'peinture' },
    { id:'parex', nom:'Parex Lanko', emoji:'🎨', type:'Fabricant enduits', url:'https://www.parexlanko.com', desc:'Enduits façade, mortiers colle, ragréages. Large gamme renovation et neuf.', tags:['Façade','Ragréage','Colle'], corps:['peintre','macon'], categorie:'peinture' },
    { id:'mapei', nom:'Mapei', emoji:'🔲', type:'Fabricant colles', url:'https://www.mapei.com/fr', desc:'Colles carrelage, joints, ragréages, imperméabilisation. Référence mondiale.', tags:['Carrelage','Joints','Ragréage'], corps:['carreleur','macon'], categorie:'peinture' },
    { id:'sika', nom:'Sika', emoji:'💧', type:'Fabricant chimie BTP', url:'https://www.sika.fr', desc:'Colles, étanchéité, injection béton, produits de protection. Tous corps de métier.', tags:['Étanchéité','Colles','Béton'], corps:['tous'], categorie:'peinture' },

    // ── QUINCAILLERIE / OUTILLAGE ──
    { id:'wurth', nom:'Würth', emoji:'🔩', type:'Quincaillerie pro', url:'https://www.wurth.fr', desc:'Référence mondiale quincaillerie et outillage pro. Visserie, chevilles, outils électroportatifs.', tags:['Visserie','Chevilles','Outillage'], corps:['tous'], categorie:'quincaillerie' },
    { id:'legallais', nom:'Legallais', emoji:'🔧', type:'Quincaillerie industrielle', url:'https://www.legallais.com', desc:'Quincaillerie, outillage, EPI, fixation. Large catalogue pro livraison express.', tags:['Fixation','EPI','Outillage'], corps:['tous'], categorie:'quincaillerie' },
    { id:'descours', nom:'Descours & Cabaud', emoji:'⚙️', type:'Distribution industrielle', url:'https://www.descoursetcabaud.fr', desc:'Produits techniques, EPI, outillage, quincaillerie industrielle pour professionnels.', tags:['EPI','Technique','Industriel'], corps:['tous'], categorie:'quincaillerie' },
    { id:'commentfer', nom:'Comment Fer', emoji:'🔩', type:'Vente en ligne quincaillerie', url:'https://www.commentfer.fr', desc:'Quincaillerie, visserie, fixation en ligne. Prix compétitifs, livraison rapide.', tags:['En ligne','Visserie','Fixation'], corps:['tous'], categorie:'quincaillerie' },

    // ── ÉLECTRICITÉ ──
    { id:'sonepar', nom:'Sonepar', emoji:'⚡', type:'Distribution électrique', url:'https://www.sonepar.fr', desc:'1er distributeur mondial de matériel électrique. Câbles, tableaux, appareillage.', tags:['Câbles','Tableaux','Appareillage'], corps:['electricien'], categorie:'electricite' },
    { id:'rexel', nom:'Rexel', emoji:'💡', type:'Distribution électrique', url:'https://www.rexel.fr', desc:'Distribution matériel électrique et éclairage. Solutions domotique, énergie, sécurité.', tags:['Électrique','Éclairage','Domotique'], corps:['electricien'], categorie:'electricite' },
    { id:'prolians', nom:'Prolians', emoji:'🔌', type:'Distribution technique', url:'https://www.prolians.com', desc:'Outillage, EPI, fournitures industrielles et électriques pour professionnels.', tags:['Multi-corps','Outillage','EPI'], corps:['tous'], categorie:'electricite' },

    // ── PLEXI / POLYCARBONATE ──
    { id:'polyplexi', nom:'Polycarbonate Plexi', emoji:'🪟', type:'Spécialiste plaques', url:'https://www.polycarbonate-plexi.com', desc:'Spécialiste plaques polycarbonate et PMMA. Découpe sur mesure, transparence, résistance UV.', tags:['Polycarbonate','PMMA','Sur mesure'], corps:['plaquiste','menuisier','tous'], categorie:'plexi' },
    { id:'mccover', nom:'MCcover', emoji:'🏠', type:'Couverture & Translucide', url:'https://www.mccover.com', desc:'Plaques de couverture, polycarbonate, bacs acier. Solutions toiture et verrière.', tags:['Couverture','Verrière','Polycarbonate'], corps:['tous'], categorie:'plexi' },
    { id:'centralplexi', nom:'La Centrale du Plexi', emoji:'🔷', type:'Spécialiste PMMA', url:'https://www.lacentraleduplexi.com', desc:'Vente en ligne de plaques PMMA (plexiglas). Découpe sur mesure, nombreuses couleurs.', tags:['Plexiglas','PMMA','Découpe'], corps:['plaquiste','menuisier'], categorie:'plexi' },

    // ── COUVERTURE / FAÇADE ──
    { id:'monier', nom:'Monier / Braas', emoji:'🏡', type:'Fabricant couverture', url:'https://www.monier.fr', desc:'Tuiles, ardoises, accessoires de couverture. Solutions toiture résidentielle et collective.', tags:['Tuiles','Ardoises','Toiture'], corps:['tous'], categorie:'couverture' },
    { id:'onduline', nom:'Onduline', emoji:'🌧️', type:'Couverture légère', url:'https://www.onduline.com/fr', desc:'Plaques ondulées bitumineuses, sous-toitures, accessoires. Léger et facile à poser.', tags:['Léger','Abri','Sous-toiture'], corps:['tous'], categorie:'couverture' },

    // ── DISTRIBUTION GÉNÉRALE ──
    { id:'sgd', nom:'Saint-Gobain Distribution', emoji:'🏢', type:'Distribution BTP', url:'https://www.saint-gobain-distribution.fr', desc:'Réseau de distribution matériaux Saint-Gobain. Placoplatre, isolation, vitrage, outillage.', tags:['Saint-Gobain','Vitrage','Multi-corps'], corps:['tous'], categorie:'negoce' },
    { id:'socoda', nom:'Socoda', emoji:'🔧', type:'Groupement négoce', url:'https://www.socoda.fr', desc:'Groupement de distributeurs matériel électrique, plomberie, chauffage.', tags:['Électrique','Plomberie','Chauffage'], corps:['electricien','plombier'], categorie:'electricite' },
    { id:'lm_pro', nom:'Leroy Merlin Pro', emoji:'🛒', type:'GSB Pro', url:'https://www.leroymerlin.fr/pro', desc:'Espace pro Leroy Merlin. Tarifs négociés, compte dédié, livraison chantier.', tags:['Compte pro','GSB','Large gamme'], corps:['tous'], categorie:'negoce' },
    { id:'plateforme_btp', nom:'Plateforme du Bâtiment', emoji:'🏗', type:'GSB Pro', url:'https://www.laplateformebatiment.fr', desc:'Enseigne pro Saint-Gobain. Matériaux, plâtrerie, isolation, outillage. Ouverte aux pros.', tags:['Saint-Gobain','Pro','Plâtrerie'], corps:['plaquiste','tous'], categorie:'negoce' },
  ];

  const CATEGORIES = [
    { key: 'tous', label: '🔍 Tous' },
    { key: 'negoce', label: '🏗 Négoce' },
    { key: 'placo', label: '🧱 Placo/Plâtre' },
    { key: 'isolation', label: '🌡️ Isolation' },
    { key: 'peinture', label: '🎨 Peinture/Enduits' },
    { key: 'quincaillerie', label: '🔩 Quincaillerie' },
    { key: 'electricite', label: '⚡ Électricité' },
    { key: 'plexi', label: '🪟 Plexi/Polycarb.' },
    { key: 'couverture', label: '🏡 Couverture' },
  ];

  let categorieActive = 'tous';
  let recherche = '';
  let favoris = JSON.parse(localStorage.getItem('plaqpro_favoris_fournisseurs') || '[]');
  let fournisseursPerso = JSON.parse(localStorage.getItem('plaqpro_fournisseurs_perso') || '[]');

  function toggleFavori(id) {
    const idx = favoris.indexOf(id);
    if (idx > -1) favoris.splice(idx, 1);
    else favoris.push(id);
    localStorage.setItem('plaqpro_favoris_fournisseurs', JSON.stringify(favoris));
    render();
  }

  function getFiltered() {
    const tous = [...FOURNISSEURS, ...fournisseursPerso];
    return tous.filter(f => {
      const matchCat = categorieActive === 'tous' || f.categorie === categorieActive;
      const q = recherche.toLowerCase();
      const matchSearch = !q || f.nom.toLowerCase().includes(q) ||
        f.desc.toLowerCase().includes(q) ||
        (f.tags||[]).some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }

  function render() {
    const filtered = getFiltered();
    const favorisList = filtered.filter(f => favoris.includes(f.id));
    const autresList = filtered.filter(f => !favoris.includes(f.id));

    div.innerHTML = `
      <div class="cat-hero">
        <h1>🏪 Catalogue Fournisseurs BTP</h1>
        <p>${FOURNISSEURS.length + fournisseursPerso.length} enseignes référencées — Négoce, Fabricants, Spécialistes</p>
      </div>

      <input class="cat-search" id="cat-search" placeholder="🔍 Rechercher un fournisseur, matériau, spécialité..."
        value="${recherche}" oninput="CAT.rechercher(this.value)">

      <div class="cat-filters">
        ${CATEGORIES.map(c => `
          <button class="cat-filter ${c.key === categorieActive ? 'active' : ''}"
            onclick="CAT.filtrer('${c.key}')">
            ${c.label}
          </button>
        `).join('')}
      </div>

      <button class="cat-add-btn" onclick="CAT.ajouterPerso()">
        ➕ Ajouter un fournisseur local
      </button>

      ${favorisList.length > 0 ? `
        <div class="cat-section-title">⭐ Mes fournisseurs favoris (${favorisList.length})</div>
        <div class="cat-grid">
          ${favorisList.map(f => renderCard(f)).join('')}
        </div>
      ` : ''}

      ${autresList.length > 0 ? `
        ${favorisList.length > 0 ? '<div class="cat-section-title">📋 Tous les fournisseurs</div>' : ''}
        <div class="cat-grid">
          ${autresList.map(f => renderCard(f)).join('')}
        </div>
      ` : ''}

      ${filtered.length === 0 ? `
        <div class="cat-empty">
          <div style="font-size:48px;margin-bottom:16px">🔍</div>
          Aucun fournisseur trouvé pour "${recherche}"
        </div>
      ` : ''}
    `;
  }

  function renderCard(f) {
    const isFav = favoris.includes(f.id);
    return `
      <div class="cat-card ${isFav ? 'favori' : ''}">
        <div class="cat-card-header">
          <div style="display:flex;align-items:center;gap:10px;flex:1">
            <div class="cat-card-logo">${f.emoji}</div>
            <div>
              <div class="cat-card-name">${f.nom}</div>
              <div class="cat-card-type">${f.type}</div>
            </div>
          </div>
        </div>
        <div class="cat-tags">
          ${(f.tags||[]).map((t,i) => `<span class="cat-tag ${i===0?'':'orange'}">${t}</span>`).join('')}
        </div>
        <div class="cat-card-desc">${f.desc}</div>
        <div class="cat-card-footer">
          <a href="${f.url}" target="_blank" class="cat-btn-site">🌐 Visiter le site</a>
          <button class="cat-btn-fav" onclick="CAT.toggleFavori('${f.id}')" title="${isFav?'Retirer des favoris':'Ajouter aux favoris'}">
            ${isFav ? '⭐' : '☆'}
          </button>
        </div>
      </div>
    `;
  }

  window.CAT = {
    filtrer(cat) {
      categorieActive = cat;
      render();
    },
    rechercher(q) {
      recherche = q;
      render();
    },
    toggleFavori(id) {
      toggleFavori(id);
    },
    ajouterPerso() {
      App.openModal('Ajouter un fournisseur', `
        <div style="padding:16px;display:flex;flex-direction:column;gap:10px">
          <div><label style="font-size:12px;color:var(--text-secondary)">Nom *</label>
            <input class="form-control" id="fp-nom" placeholder="Nom de l'enseigne" style="margin-top:4px"></div>
          <div><label style="font-size:12px;color:var(--text-secondary)">Site web</label>
            <input class="form-control" id="fp-url" placeholder="https://..." style="margin-top:4px"></div>
          <div><label style="font-size:12px;color:var(--text-secondary)">Spécialité</label>
            <input class="form-control" id="fp-type" placeholder="Négoce local, Fournisseur béton..." style="margin-top:4px"></div>
          <div><label style="font-size:12px;color:var(--text-secondary)">Description</label>
            <input class="form-control" id="fp-desc" placeholder="Ce qu'ils vendent..." style="margin-top:4px"></div>
        </div>
      `, `<button class="btn btn-primary" onclick="CAT._sauvegarderPerso()">Ajouter</button>
          <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>`);
    },
    _sauvegarderPerso() {
      const nom = document.getElementById('fp-nom')?.value.trim();
      if (!nom) { App.toast('Le nom est obligatoire', 'error'); return; }
      const f = {
        id: 'perso_' + Date.now(),
        nom,
        emoji: '🏪',
        type: document.getElementById('fp-type')?.value.trim() || 'Fournisseur local',
        url: document.getElementById('fp-url')?.value.trim() || '#',
        desc: document.getElementById('fp-desc')?.value.trim() || '',
        tags: ['Local','Perso'],
        corps: ['tous'],
        categorie: 'negoce'
      };
      fournisseursPerso.push(f);
      localStorage.setItem('plaqpro_fournisseurs_perso', JSON.stringify(fournisseursPerso));
      App.closeModal();
      App.toast('Fournisseur ajouté ✅', 'success');
      render();
    }
  };

  render();
  return div;
};
