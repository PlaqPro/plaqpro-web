// ============================================================
//  PLAQPRO WEB — Prospection IA (Permis de construire)
//  prospection.js
// ============================================================

var Prospection = {

  _map:        null,
  _rayonCircle: null,
  _markers:    [],
  _permis:     [],
  _filtered:   [],
  _rayon:      20,
  _ville:      'Lyon',
  _lat:        45.748,
  _lng:        4.847,

  MODEL:       'llama-3.1-8b-instant',
  PROSP_KEY:   'plaqpro_prospects',
  PHONES_KEY:  'plaqpro_prosp_phones',
  ENRICHI_KEY: 'plaqpro_prosp_enrichi',

  TYPE_COLORS: {
    'Construction neuve': '#4F8EF7',
    'Rénovation':         '#2DD4A0',
    'Extension':          '#F7A64F',
    'Aménagement':        '#A78BFA',
  },

  // ── Initialisation ────────────────────────────────────────
  async init() {
    this._ville = DB.getConfig().ville || localStorage.getItem('plaqpro_ville') || 'Lyon';
    await this._geocodeVille();
    this._initMap();
    await this.rechercher();
  },

  async _geocodeVille() {
    try {
      const r = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(this._ville)}&count=1&language=fr`,
        { signal: AbortSignal.timeout(5000) }
      );
      const d = await r.json();
      if (d.results?.length) {
        this._lat = d.results[0].latitude;
        this._lng = d.results[0].longitude;
      }
    } catch(e) { /* coordonnées par défaut */ }
  },

  _initMap() {
    const mapEl = document.getElementById('prosp-map');
    if (!mapEl) { console.error('[Prospection] #prosp-map introuvable'); return; }
    if (typeof L === 'undefined') { console.error('[Prospection] Leaflet non chargé'); return; }
    if (this._map) { try { this._map.remove(); } catch(e){} this._map = null; }

    this._map = L.map('prosp-map', { zoomControl: true, preferCanvas: true })
                  .setView([this._lat, this._lng], 11);

    // Force le recalcul des dimensions (container parfois pas encore peint)
    requestAnimationFrame(() => this._map && this._map.invalidateSize());

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(this._map);

    this._rayonCircle = L.circle([this._lat, this._lng], {
      radius:      this._rayon * 1000,
      color:       '#4F8EF7',
      fillColor:   '#4F8EF7',
      fillOpacity: 0.05,
      weight:      1.5,
      dashArray:   '6 4',
    }).addTo(this._map);

    // Marqueur entreprise
    const hqIcon = L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#4F8EF7;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker([this._lat, this._lng], { icon: hqIcon })
      .addTo(this._map)
      .bindPopup(`<b>${DB.getConfig().nomEntreprise || 'Mon entreprise'}</b><br>${this._ville}`);
  },

  // ── Recherche ─────────────────────────────────────────────
  async rechercher() {
    this._showLoading(true);
    const rayon = parseInt(document.getElementById('prosp-rayon')?.value || this._rayon) || 20;
    this._rayon = rayon;
    this._permis   = await this.fetchPermisConstructire(this._ville, this._rayon);
    this._restoreFromStore();
    this._filtered = [...this._permis];
    this._appliquerFiltres();
    this._renderStats();
    this._renderListe();
    this._renderMarkers();
    this._showLoading(false);

    // Source badge
    const src = document.getElementById('prosp-source');
    if (src) {
      const isDemo = this._sourceLabel === 'Démo';
      src.textContent = this._sourceLabel
        ? `Source : ${this._sourceLabel} · ${this._permis.length} permis`
        : `${this._permis.length} permis chargés`;
      src.style.color = isDemo ? 'var(--orange)' : 'var(--green)';
    }

    // Recalcul dimensions carte après rendu complet
    setTimeout(() => this._map && this._map.invalidateSize(), 200);
  },

  // ── API Permis de construire ──────────────────────────────
  async fetchPermisConstructire(ville, rayon) {
    this._sourceLabel = null;

    // Tentative 1 : APIDF CEREMA SITADEL (pas de CORS sur preprod)
    try {
      // Résoudre code département depuis ville via api-adresse
      const geoR  = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(ville)}&limit=1&type=municipality`,
        { signal: AbortSignal.timeout(4000) }
      );
      const geoD  = await geoR.json();
      const dep   = geoD.features?.[0]?.properties?.citycode?.slice(0, 2) || '69';
      const url1  = `https://apidf-preprod.cerema.fr/sitadel/logements/departements/${dep}/?ordering=-date_reelle_autorisation&limit=30`;
      console.log('[Prospection] Tentative APIDF:', url1);
      const r1    = await fetch(url1, { signal: AbortSignal.timeout(6000) });
      if (!r1.ok) throw new Error('HTTP ' + r1.status);
      const d1    = await r1.json();
      const items = d1.results || d1.features || [];
      if (items.length) {
        console.log('[Prospection] APIDF OK :', items.length, 'permis');
        this._sourceLabel = 'SITADEL CEREMA';
        return items.map(x => this._normaliserAPIDF(x));
      }
    } catch(e) {
      console.warn('[Prospection] APIDF inaccessible :', e.message);
    }

    // Tentative 2 : OpenDataSoft SITADEL
    try {
      const where = encodeURIComponent(`commune_nom like '${ville}'`);
      const url2  = `https://data.statistiques.developpement-durable.gouv.fr/api/explore/v2.1/catalog/datasets/sit_portatif/records?where=${where}&limit=30&order_by=date_reelle_autorisation%20desc`;
      console.log('[Prospection] Tentative ODS:', url2);
      const r2 = await fetch(url2, { signal: AbortSignal.timeout(6000) });
      if (!r2.ok) throw new Error('HTTP ' + r2.status);
      const d2 = await r2.json();
      if (d2.results?.length) {
        console.log('[Prospection] ODS OK :', d2.results.length, 'permis');
        this._sourceLabel = 'SITADEL ODS';
        return d2.results.map(x => this._normaliserRecord(x));
      }
    } catch(e) {
      console.warn('[Prospection] ODS inaccessible :', e.message);
    }

    // Fallback : données de démonstration réalistes
    console.info('[Prospection] Données de démonstration (APIs CORS-bloquées)');
    this._sourceLabel = 'Démo';
    return this._donneesSimulees(ville);
  },

  _normaliserAPIDF(r) {
    const type = this._detectType(r.nature_projet || r.type_doc || r.type_autorisation || '');
    return {
      id:               r.numero || r.id || ('apidf-' + Math.random().toString(36).slice(2)),
      adresse:          [r.adresse_num, r.adresse_voie, r.commune_nom || r.lib_commune].filter(Boolean).join(' ') || r.adresse || 'Adresse inconnue',
      commune:          r.commune_nom || r.lib_commune || '',
      datePermis:       (r.date_reelle_autorisation || r.date_autorisation || '').split('T')[0],
      surface:          parseInt(r.surface_plancher_totale || r.surface_plancher || r.superficie || 0) || 0,
      typeNature:       r.nature_projet || r.type_doc || '',
      nomPetitionnaire: r.nom_petitionnaire || '',
      lat:              parseFloat(r.latitude || r.lat) || this._lat + (Math.random() - 0.5) * 0.2,
      lng:              parseFloat(r.longitude || r.lng) || this._lng + (Math.random() - 0.5) * 0.3,
      typeLabel:        type,
      score:            null,
      scoreData:        null,
      _api:             true,
    };
  },

  _normaliserRecord(r) {
    const type = this._detectType(r.nature_projet || r.type_autorisation || '');
    return {
      id:               r.numero || r.id_local || ('api-' + Math.random().toString(36).slice(2)),
      adresse:          [r.adresse_num, r.adresse_voie, r.commune_nom].filter(Boolean).join(' ') || r.adresse || 'Adresse inconnue',
      commune:          r.commune_nom || '',
      datePermis:       (r.date_reelle_autorisation || r.date_autorisation || '').split('T')[0],
      surface:          parseInt(r.surface_plancher || r.surface || 0) || 0,
      typeNature:       r.nature_projet || '',
      nomPetitionnaire: r.nom_petitionnaire || '',
      lat:              parseFloat(r.latitude)  || this._lat + (Math.random() - 0.5) * 0.25,
      lng:              parseFloat(r.longitude) || this._lng + (Math.random() - 0.5) * 0.35,
      typeLabel:        type,
      score:            null,
      scoreData:        null,
      _api:             true,
    };
  },

  _detectType(nature) {
    const n = (nature || '').toLowerCase();
    if (n.includes('neuf') || n.includes('construction'))          return 'Construction neuve';
    if (n.includes('extension') || n.includes('agrand'))           return 'Extension';
    if (n.includes('aménagement') || n.includes('amenagement'))    return 'Aménagement';
    return 'Rénovation';
  },

  _donneesSimulees(ville) {
    // Permis de démonstration réalistes — adresses et GPS réels Lyon et agglomération
    const DATA = [
      { adresse:'14 rue de la République, Lyon 2ème',      commune:'Lyon',              lat:45.7481, lng:4.8326, type:'Rénovation',         surface:95,  nom:'M. Dupont',           jours:18 },
      { adresse:'56 boulevard des Brotteaux, Lyon 6ème',   commune:'Lyon',              lat:45.7616, lng:4.8484, type:'Construction neuve',  surface:180, nom:'SCI Brotteaux',       jours:45 },
      { adresse:'8 avenue Berthelot, Lyon 7ème',           commune:'Lyon',              lat:45.7368, lng:4.8378, type:'Extension',           surface:65,  nom:'Mme Laurent',         jours:12 },
      { adresse:'22 rue Garibaldi, Lyon 3ème',             commune:'Lyon',              lat:45.7497, lng:4.8451, type:'Aménagement',         surface:120, nom:'M. Martin',           jours:90 },
      { adresse:'7 place des Terreaux, Lyon 1er',          commune:'Lyon',              lat:45.7677, lng:4.8326, type:'Rénovation',         surface:210, nom:'SARL Immo Presqu\'île',jours:7  },
      { adresse:'45 cours Vitton, Lyon 6ème',              commune:'Lyon',              lat:45.7590, lng:4.8551, type:'Construction neuve',  surface:145, nom:'Mme Petit',           jours:30 },
      { adresse:'28 rue Pierre Corneille, Lyon 6ème',      commune:'Lyon',              lat:45.7635, lng:4.8478, type:'Extension',           surface:58,  nom:'M. et Mme Bernard',   jours:60 },
      { adresse:'15 avenue Paul Santy, Lyon 8ème',         commune:'Lyon',              lat:45.7274, lng:4.8546, type:'Rénovation',         surface:88,  nom:'M. Rousseau',         jours:22 },
      { adresse:'89 boulevard Pinel, Lyon 8ème',           commune:'Lyon',              lat:45.7213, lng:4.8642, type:'Construction neuve',  surface:250, nom:'SCI Grand Lyon',      jours:5  },
      { adresse:'3 rue de Bonnel, Lyon 3ème',              commune:'Lyon',              lat:45.7484, lng:4.8596, type:'Aménagement',         surface:75,  nom:'Mme Durand',          jours:40 },
      { adresse:'12 rue d\'Alsace-Lorraine, Villeurbanne', commune:'Villeurbanne',      lat:45.7694, lng:4.8917, type:'Rénovation',         surface:100, nom:'M. Lefebvre',         jours:15 },
      { adresse:'34 cours Émile Zola, Villeurbanne',       commune:'Villeurbanne',      lat:45.7719, lng:4.8799, type:'Construction neuve',  surface:195, nom:'EURL Habitat Plus',   jours:52 },
      { adresse:'7 rue de la Soie, Villeurbanne',          commune:'Villeurbanne',      lat:45.7783, lng:4.8974, type:'Extension',           surface:40,  nom:'M. Moreau',           jours:8  },
      { adresse:'18 avenue Félix Faure, Caluire-et-Cuire', commune:'Caluire-et-Cuire', lat:45.7937, lng:4.8553, type:'Rénovation',         surface:130, nom:'Mme Simon',           jours:70 },
      { adresse:'5 rue Henri Rolland, Vénissieux',         commune:'Vénissieux',        lat:45.7007, lng:4.8851, type:'Construction neuve',  surface:160, nom:'SCI Les Pins',        jours:25 },
      { adresse:'23 avenue de la Promenade, Bron',         commune:'Bron',              lat:45.7387, lng:4.9115, type:'Extension',           surface:52,  nom:'M. Thomas',           jours:35 },
      { adresse:'67 rue Gabriel Péri, Vaulx-en-Velin',    commune:'Vaulx-en-Velin',    lat:45.7797, lng:4.9177, type:'Rénovation',         surface:82,  nom:'Mme Garcia',          jours:48 },
      { adresse:'14 avenue de l\'Europe, Tassin',          commune:'Tassin-la-Demi-Lune', lat:45.7556, lng:4.7968, type:'Construction neuve', surface:220, nom:'M. et Mme Blanc',   jours:3  },
      { adresse:'8 rue Baraban, Lyon 3ème',                commune:'Lyon',              lat:45.7485, lng:4.8587, type:'Aménagement',         surface:66,  nom:'SARL ArchiLyon',      jours:120},
      { adresse:'32 avenue Roger Salengro, Décines',       commune:'Décines-Charpieu',  lat:45.7660, lng:4.9563, type:'Construction neuve',  surface:175, nom:'M. Faure',            jours:18 },
    ];

    const now = new Date();
    return DATA.map((d, i) => ({
      id:               'demo-' + i,
      adresse:          d.adresse,
      commune:          d.commune,
      datePermis:       new Date(now.getTime() - d.jours * 86400000).toISOString().split('T')[0],
      surface:          d.surface,
      typeNature:       d.type,
      nomPetitionnaire: d.nom,
      lat:              d.lat,
      lng:              d.lng,
      typeLabel:        d.type,
      score:            null,
      scoreData:        null,
      _simule:          true,
    }));
  },

  // ── Score local (instantané) ──────────────────────────────
  _scoreLocal(p) {
    let s = 25;
    if (p.typeLabel === 'Construction neuve') s += 35;
    else if (p.typeLabel === 'Extension')     s += 25;
    else if (p.typeLabel === 'Rénovation')    s += 18;
    else                                      s += 10;

    if      (p.surface >= 200) s += 28;
    else if (p.surface >= 100) s += 18;
    else if (p.surface >= 50)  s += 10;
    else if (p.surface > 0)    s += 4;

    const ageDays = (Date.now() - new Date(p.datePermis || Date.now())) / 86400000;
    if      (ageDays <  30)  s += 15;
    else if (ageDays <  90)  s +=  8;
    else if (ageDays > 180)  s -= 10;

    return Math.min(100, Math.max(0, Math.round(s)));
  },

  _scoreColor(s) {
    if (s >= 70) return '#2DD4A0';
    if (s >= 40) return '#F7A64F';
    return '#F75B5B';
  },

  // ── Niveau de maturité prospect ───────────────────────────
  // 🔴 rouge  = pas enrichi
  // 🟠 orange = enrichi cadastre, pas de téléphone
  // 🟢 vert   = enrichi + téléphone saisi
  _getTier(p) {
    if (!p._enrichi) return 'rouge';
    if (!p._phone)   return 'orange';
    return 'vert';
  },

  TIER_CONFIG: {
    rouge:  { emoji: '🔴', label: 'À enrichir',  color: '#F75B5B', bg: 'rgba(247,91,91,0.08)',  border: 'rgba(247,91,91,0.25)'  },
    orange: { emoji: '🟠', label: 'Enrichi',      color: '#F7A64F', bg: 'rgba(247,166,79,0.08)', border: 'rgba(247,166,79,0.25)' },
    vert:   { emoji: '🟢', label: 'Complet',       color: '#2DD4A0', bg: 'rgba(45,212,160,0.08)', border: 'rgba(45,212,160,0.25)' },
  },

  // ── Budget travaux estimé ──────────────────────────────────
  _getBudgetEstime(p) {
    const s = p.surface || 60;
    const mult = p.typeLabel === 'Construction neuve' ? 1.5 :
                 p.typeLabel === 'Extension'          ? 1.2 : 1;
    const base = s * 42 * mult;
    if (base < 15000)  return { min: 5000,  max: 15000,  label: '5 – 15 k€',  color: '#8892AA' };
    if (base < 40000)  return { min: 15000, max: 40000,  label: '15 – 40 k€', color: '#F7A64F' };
    return             { min: 40000, max: base,          label: '40 k€+',     color: '#2DD4A0' };
  },

  // ── Filtres ───────────────────────────────────────────────
  _appliquerFiltres() {
    const type    = document.getElementById('filtre-type')?.value    || '';
    const surfMin = parseInt(document.getElementById('filtre-surf-min')?.value) || 0;
    const surfMax = parseInt(document.getElementById('filtre-surf-max')?.value) || 99999;
    const dateMin = document.getElementById('filtre-date')?.value    || '';

    this._filtered = this._permis.filter(p => {
      if (type && p.typeLabel !== type)                         return false;
      if (p.surface && p.surface < surfMin)                     return false;
      if (p.surface && surfMax < 99999 && p.surface > surfMax)  return false;
      if (dateMin && p.datePermis && p.datePermis < dateMin)    return false;
      return true;
    });
  },

  // ── Rendu stats ───────────────────────────────────────────
  _renderStats() {
    const el = document.getElementById('prosp-stats');
    if (!el) return;

    const verts   = this._permis.filter(p => this._getTier(p) === 'vert').length;
    const oranges = this._permis.filter(p => this._getTier(p) === 'orange').length;
    const rouges  = this._permis.filter(p => this._getTier(p) === 'rouge').length;
    const budget  = this._permis.reduce((s, p) => s + this._getBudgetEstime(p).min, 0);
    const courriers = rouges + oranges;
    const prospects = DB.getAll(this.PROSP_KEY);
    const mois    = new Date();
    const cesMois = prospects.filter(x => {
      const d = new Date(x.createdAt || '');
      return d.getMonth() === mois.getMonth() && d.getFullYear() === mois.getFullYear();
    }).length;

    const fmt = v => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

    el.innerHTML = `
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:0">
        <div class="stat-card">
          <div class="stat-label">Statut prospects</div>
          <div style="display:flex;gap:12px;align-items:center;margin-top:4px;flex-wrap:wrap">
            <span style="font-size:18px;font-weight:800;color:#2DD4A0">🟢 ${verts}</span>
            <span style="font-size:18px;font-weight:800;color:#F7A64F">🟠 ${oranges}</span>
            <span style="font-size:18px;font-weight:800;color:#F75B5B">🔴 ${rouges}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Budget travaux estimé</div>
          <div class="stat-value" style="font-size:18px;color:var(--green)">${fmt(budget)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Courriers à envoyer</div>
          <div class="stat-value">📬 ${courriers}
            ${courriers > 0 ? `<button class="btn btn-secondary btn-sm" style="font-size:11px;margin-left:8px;vertical-align:middle"
              onclick="Prospection.imprimerCourriers()">Imprimer tout</button>` : ''}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Prospects créés ce mois</div>
          <div class="stat-value">👥 ${cesMois}</div>
        </div>
      </div>
    `;
  },

  // ── Rendu marqueurs ───────────────────────────────────────
  _renderMarkers() {
    if (!this._map) return;
    this._markers.forEach(m => m.remove());
    this._markers = [];

    if (this._rayonCircle) {
      this._rayonCircle.setLatLng([this._lat, this._lng]);
      this._rayonCircle.setRadius(this._rayon * 1000);
    }

    this._filtered.forEach(p => {
      if (!p.lat || !p.lng) return;
      const score = p.score ?? this._scoreLocal(p);
      const color = this._scoreColor(score);

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2px solid #fff;
               display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;
               color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.45);cursor:pointer">${score}</div>`,
        iconSize:   [30, 30],
        iconAnchor: [15, 15],
      });

      const m = L.marker([p.lat, p.lng], { icon })
        .addTo(this._map)
        .bindPopup(`
          <div style="min-width:180px">
            <b style="font-size:13px">${p.typeLabel}</b><br>
            <span style="font-size:12px;color:#555">${p.adresse}</span><br>
            ${p.surface ? `<span style="font-size:11px">📐 ${p.surface} m²</span><br>` : ''}
            ${p.datePermis ? `<span style="font-size:11px">📅 ${new Date(p.datePermis).toLocaleDateString('fr-FR')}</span><br>` : ''}
            <b style="color:${color};font-size:13px">Score : ${score}/100</b>
          </div>
        `);

      m.on('click', () => this._highlightCard(p.id));
      this._markers.push(m);
    });

    // Ajuster la vue sur les marqueurs
    if (this._markers.length && this._map) {
      try {
        const group  = L.featureGroup(this._markers);
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          this._map.fitBounds(bounds.pad(0.15), { maxZoom: 13, animate: false });
        } else {
          this._map.setView([this._lat, this._lng], 11);
        }
      } catch(e) {
        console.warn('[Prospection] fitBounds :', e.message);
        this._map.setView([this._lat, this._lng], 11);
      }
    } else if (this._map) {
      this._map.setView([this._lat, this._lng], 11);
    }

    console.log('[Prospection] Marqueurs rendus :', this._markers.length, '/', this._filtered.length);
  },

  _highlightCard(id) {
    document.querySelectorAll('.prosp-card').forEach(c => c.style.outline = '');
    const card = document.querySelector(`[data-pid="${id}"]`);
    if (card) {
      card.style.outline = '2px solid var(--accent)';
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  // ── Rendu liste ───────────────────────────────────────────
  _renderListe() {
    const el = document.getElementById('prosp-liste');
    if (!el) return;

    if (!this._filtered.length) {
      el.innerHTML = `<div style="text-align:center;color:var(--text-tertiary);padding:40px 20px;font-size:13px">
        Aucun résultat — essayez d'élargir le rayon ou les filtres
      </div>`;
      return;
    }

    const sorted = [...this._filtered].sort((a, b) =>
      (b.score ?? this._scoreLocal(b)) - (a.score ?? this._scoreLocal(a))
    );

    el.innerHTML = '';
    sorted.forEach(p => el.appendChild(this._buildCard(p)));
  },

  _buildCard(p) {
    const score     = p.score ?? this._scoreLocal(p);
    const typeColor = this.TYPE_COLORS[p.typeLabel] || '#8892AA';
    const dejaCree  = DB.getAll(this.PROSP_KEY).some(x => x.permisId === p.id);
    const dateStr   = p.datePermis ? new Date(p.datePermis + 'T00:00:00').toLocaleDateString('fr-FR') : '—';
    const tier      = this._getTier(p);
    const tc        = this.TIER_CONFIG[tier];
    const budget    = this._getBudgetEstime(p);
    const cad       = p._enrichi?.cadastre;
    const lnk       = p._enrichi?.links;

    // ── Panneau enrichissement (orange + vert) ─────────────
    const enrichPanel = p._enrichi ? `
      <div style="margin-top:8px;padding:7px 10px;background:${tc.bg};
        border:1px solid ${tc.border};border-radius:var(--radius-sm);
        font-size:11px;display:flex;flex-wrap:wrap;align-items:center;gap:10px">
        ${cad ? `<span title="Référence cadastrale">🏛 <b>${cad.refParcelle}</b></span>` : ''}
        ${cad?.surfaceParcelle ? `<span>📏 ${cad.surfaceParcelle.toLocaleString('fr-FR')} m²</span>` : ''}
        ${p._enrichi.geocode?.score ? `<span style="color:var(--text-tertiary)">📍 ${Math.round(p._enrichi.geocode.score*100)}%</span>` : ''}
        ${lnk ? `
          <a href="${lnk.maps}" target="_blank" onclick="event.stopPropagation()" style="color:var(--accent);text-decoration:none">🗺</a>
          <a href="${lnk.streetview}" target="_blank" onclick="event.stopPropagation()" style="color:var(--accent);text-decoration:none">📸 Street View</a>
          <a href="${lnk.dvf}" target="_blank" onclick="event.stopPropagation()" style="color:var(--accent);text-decoration:none">💰 DVF</a>
        ` : ''}
      </div>
    ` : '';

    // ── Champ téléphone (orange uniquement) ────────────────
    const phonePanel = tier === 'orange' ? `
      <div style="margin-top:8px;display:flex;align-items:center;gap:6px" onclick="event.stopPropagation()">
        <input id="tel-${p.id}" class="form-control" type="tel" placeholder="📞 Saisir le téléphone…"
          style="flex:1;padding:5px 9px;font-size:12px"
          onkeydown="if(event.key==='Enter')Prospection.sauvegarderTelephone('${p.id}')">
        <button class="btn btn-primary btn-sm"
          onclick="Prospection.sauvegarderTelephone('${p.id}')">✓</button>
      </div>
    ` : tier === 'vert' ? `
      <div style="margin-top:8px;display:flex;align-items:center;gap:8px;font-size:12px">
        <a href="tel:${p._phone}" onclick="event.stopPropagation()"
           style="color:#2DD4A0;font-weight:600;text-decoration:none">📞 ${p._phone}</a>
        <span style="color:var(--text-tertiary);font-size:11px;cursor:pointer"
          onclick="event.stopPropagation();Prospection.saisirTelephone('${p.id}')">[modifier]</span>
      </div>
    ` : '';

    const card = document.createElement('div');
    card.className   = 'card prosp-card';
    card.dataset.pid = p.id;
    card.style.cssText = `margin-bottom:10px;padding:14px 14px 10px;
      transition:outline .15s,box-shadow .15s;cursor:pointer;border-color:${tc.border}`;

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;flex-wrap:wrap">
            <span style="font-size:11px;font-weight:800;padding:2px 7px;border-radius:10px;
              background:${tc.bg};color:${tc.color};border:1px solid ${tc.border}">
              ${tc.emoji} ${tc.label}
            </span>
            <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;
              background:${typeColor}22;color:${typeColor};border:1px solid ${typeColor}55">${p.typeLabel}</span>
            ${p._simule ? '<span style="font-size:10px;color:var(--text-tertiary);font-style:italic">simulé</span>' : ''}
          </div>
          <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px;
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.adresse}">${p.adresse}</div>
          <div style="font-size:11px;color:var(--text-secondary);display:flex;flex-wrap:wrap;gap:8px">
            ${p.surface ? `<span>📐 ${p.surface} m²</span>` : ''}
            <span>📅 ${dateStr}</span>
            ${p.nomPetitionnaire ? `<span>👤 ${p.nomPetitionnaire}</span>` : ''}
            <span style="padding:1px 6px;border-radius:8px;background:${budget.color}22;color:${budget.color};
              border:1px solid ${budget.color}44;font-weight:600">💰 ${budget.label}</span>
          </div>
          ${p.scoreData?.opportunite ? `<div style="margin-top:4px;font-size:11px;color:var(--text-tertiary);font-style:italic">${p.scoreData.opportunite}</div>` : ''}
          ${enrichPanel}
          ${phonePanel}
        </div>
        <div style="flex-shrink:0;text-align:center">
          <div style="width:44px;height:44px;border-radius:50%;border:3px solid ${tc.color};
            display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div style="font-size:13px;font-weight:800;color:${tc.color};line-height:1">${score}</div>
            <div style="font-size:8px;color:var(--text-tertiary);line-height:1;margin-top:1px">score</div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
        ${tier === 'rouge' ? `
          <button class="btn btn-primary btn-sm"
            onclick="event.stopPropagation();Prospection.enrichirPermis('${p.id}')">✨ Enrichir</button>
          <button class="btn btn-secondary btn-sm"
            onclick="event.stopPropagation();Prospection.genererCourrier('${p.id}')">📬 Courrier postal</button>
        ` : tier === 'orange' ? `
          <button class="btn btn-secondary btn-sm"
            onclick="event.stopPropagation();Prospection.ouvrirTrouverContact('${p.id}')">🔍 Trouver contact</button>
          <button class="btn btn-secondary btn-sm"
            onclick="event.stopPropagation();Prospection.genererCourrier('${p.id}')">📬 Courrier</button>
          <button class="btn btn-secondary btn-sm"
            onclick="event.stopPropagation();Prospection.genererMessage('${p.id}')">🤖 Message IA</button>
          <button class="btn btn-secondary btn-sm"
            onclick="event.stopPropagation();Prospection.analyserIA('${p.id}')">⭐ Scorer</button>
          <button class="btn btn-secondary btn-sm"
            onclick="event.stopPropagation();Prospection.creerProspect('${p.id}')"
            ${dejaCree ? 'disabled' : ''}>${dejaCree ? '✅ Créé' : '+ Prospect'}</button>
        ` : `
          <a href="tel:${p._phone}" onclick="event.stopPropagation()"
            class="btn btn-primary btn-sm">📞 Appeler</a>
          <button class="btn btn-secondary btn-sm"
            onclick="event.stopPropagation();Prospection.genererMessage('${p.id}')">🤖 Message IA</button>
          <button class="btn btn-secondary btn-sm"
            onclick="event.stopPropagation();Prospection.genererCourrier('${p.id}')">📬 Courrier</button>
          <button class="btn btn-secondary btn-sm"
            onclick="event.stopPropagation();Prospection.creerProspect('${p.id}')"
            ${dejaCree ? 'disabled' : ''}>${dejaCree ? '✅ Créé' : '+ Prospect'}</button>
        `}
      </div>
    `;

    card.addEventListener('click', () => {
      if (this._map && p.lat && p.lng) {
        this._map.setView([p.lat, p.lng], 14);
        this._markers.forEach(m => {
          if (Math.abs(m.getLatLng().lat - p.lat) < 0.001) m.openPopup();
        });
      }
    });

    return card;
  },

  // ── Créer prospect ────────────────────────────────────────
  creerProspect(id) {
    const p = this._permis.find(x => x.id === id);
    if (!p) return;

    const client   = convertirPermisEnProspect(p);
    const existing = DB.getAll(this.PROSP_KEY).find(x => x.permisId === id);
    if (!existing) {
      DB.add(this.PROSP_KEY, {
        permisId:  id,
        clientId:  client.id,
        adresse:   p.adresse,
        type:      p.typeLabel,
        surface:   p.surface,
      });
    }

    App.toast('✅ Prospect créé : ' + (client.nom || p.adresse));
    this._renderListe();
    this._renderStats();
  },

  // ── Générer message contact ───────────────────────────────
  async genererMessage(id) {
    const p = this._permis.find(x => x.id === id);
    if (!p) return;

    const body = document.createElement('div');
    body.innerHTML = `<div style="text-align:center;color:var(--text-tertiary);padding:24px;font-size:13px">⏳ Génération du message…</div>`;
    App.openModal('🤖 Message de contact personnalisé', body, '');

    const config = DB.getConfig();
    let   msg    = '';

    const _gcMsg = groqConfig();
    try {
      if (!_gcMsg) throw new Error('no-proxy');
      const prompt = `Tu es un commercial pour "${config.nomEntreprise || 'PlaqPro+'}", entreprise de plaquisterie et peinture. Rédige un message de prospection professionnel et chaleureux (120-150 mots maximum) pour contacter ${p.nomPetitionnaire || 'un propriétaire'} qui a un projet de ${(p.typeLabel || 'travaux').toLowerCase()}${p.surface ? ` de ${p.surface} m²` : ''} au ${p.adresse}. Utilise le vouvoiement. Propose un devis gratuit. Ne mentionne pas explicitement un "permis de construire". Signe avec "${config.nomEntreprise || 'Notre équipe'}"${config.telephone ? ' et le téléphone ' + config.telephone : ''}.`;
      const r = await fetch(_gcMsg.url, {
        method:  'POST',
        headers: _gcMsg.headers,
        body:    JSON.stringify({
          model:      this.MODEL,
          messages:   [{ role: 'user', content: prompt }],
          max_tokens: 350,
          temperature: 0.7,
        }),
      });
      const d = await r.json();
      msg = d.choices?.[0]?.message?.content?.trim() || '';
      if (!msg) throw new Error('Réponse vide');
    } catch(e) {
      msg = `Bonjour ${p.nomPetitionnaire || 'Madame, Monsieur'},\n\nNous avons eu connaissance de votre projet de ${(p.typeLabel || 'travaux').toLowerCase()} au ${p.adresse} et nous serions ravis de vous accompagner dans vos travaux d'aménagement intérieur.\n\nSpécialistes en plaquisterie et peinture depuis plusieurs années, nous intervenons sur${p.surface ? ` des surfaces de ${p.surface} m²` : ' tous types de chantiers'} avec sérieux et réactivité.\n\nNous vous proposons un devis gratuit et sans engagement. N'hésitez pas à nous contacter.\n\nCordialement,\n${config.nomEntreprise || 'Notre équipe'}\n${config.telephone || ''} — ${config.email || ''}`;
    }

    const newBody = document.createElement('div');
    newBody.style.cssText = 'display:flex;flex-direction:column;gap:10px';
    newBody.innerHTML = `
      <div style="font-size:12px;color:var(--text-tertiary)">📍 ${p.adresse} · ${p.typeLabel}${p.surface ? ' · ' + p.surface + ' m²' : ''}</div>
    `;
    const ta = document.createElement('textarea');
    ta.id    = 'prosp-msg-ta';
    ta.value = msg;
    ta.style.cssText = 'width:100%;height:200px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);padding:12px;font-size:13px;line-height:1.65;resize:vertical;font-family:inherit;box-sizing:border-box';
    newBody.appendChild(ta);

    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-body').appendChild(newBody);
    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-primary"
        onclick="navigator.clipboard.writeText(document.getElementById('prosp-msg-ta').value).then(()=>App.toast('Message copié !'),'success')">
        📋 Copier le message
      </button>
      <button class="btn btn-secondary" onclick="App.closeModal()">Fermer</button>
    `;
  },

  // ── Score IA (Groq) ───────────────────────────────────────
  async analyserIA(id) {
    const p = this._permis.find(x => x.id === id);
    if (!p) return;

    App.toast('⏳ Analyse IA en cours…');

    try {
      const _gcAna = groqConfig();
      if (!_gcAna) throw new Error('Clé Groq requise en local');
      const prompt = `Analyse ce permis de construire pour un artisan plaquiste/peintre et retourne UNIQUEMENT un objet JSON valide (pas de texte autour) : {"score":0-100,"type_travaux":"type exact","opportunite":"description courte de l'opportunité (max 20 mots)","message_contact":"première phrase d'accroche personnalisée"}. Données du permis : type=${p.typeLabel}, surface=${p.surface || '?'} m², date=${p.datePermis || '?'}, commune=${p.commune || p.adresse}, pétitionnaire=${p.nomPetitionnaire || 'inconnu'}. Score élevé = gros chantier récent, construction neuve ou extension importante.`;

      const r = await fetch(_gcAna.url, {
        method:  'POST',
        headers: _gcAna.headers,
        body:    JSON.stringify({
          model:       this.MODEL,
          messages:    [{ role: 'user', content: prompt }],
          max_tokens:  200,
          temperature: 0.3,
        }),
      });

      const d   = await r.json();
      const raw = d.choices?.[0]?.message?.content || '{}';
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('JSON introuvable dans la réponse');

      const parsed = JSON.parse(match[0]);
      p.score     = Math.min(100, Math.max(0, Math.round(Number(parsed.score) || this._scoreLocal(p))));
      p.scoreData = parsed;

      App.toast(`⭐ Score IA : ${p.score}/100 — ${parsed.type_travaux || p.typeLabel}`);
      this._renderListe();
      this._renderMarkers();
    } catch(e) {
      console.error('[Prospection] analyserIA :', e);
      App.toast('Erreur analyse IA : ' + e.message, 'error');
    }
  },

  // ── Géocodage précis (api-adresse.data.gouv.fr) ──────────
  async geocodeAdresse(adresse) {
    try {
      const r = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const feat = data.features?.[0];
      if (!feat) return null;
      const [lng, lat] = feat.geometry.coordinates;
      return {
        lat, lng,
        label:    feat.properties.label,
        city:     feat.properties.city,
        postcode: feat.properties.postcode,
        score:    feat.properties.score, // 0-1 fiabilité
      };
    } catch(e) {
      console.warn('[Prospection] Géocodage :', e.message);
      return null;
    }
  },

  // ── Cadastre IGN (apicarto.ign.fr) ───────────────────────
  // Retourne : ref parcelle, section, numéro, surface parcelle
  // Note légale : le nom du propriétaire n'est PAS accessible via
  // les APIs publiques (protection RGPD/CNIL depuis 2019).
  async getCadastre(adresse, lat, lng) {
    if (!lat || !lng) {
      const geo = await this.geocodeAdresse(adresse);
      if (geo) { lat = geo.lat; lng = geo.lng; }
    }
    if (!lat || !lng) return null;

    try {
      const r = await fetch(
        `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${lng}&lat=${lat}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const f    = data.features?.[0]?.properties;
      if (!f) return null;

      const section = (f.section || '').trim();
      const numero  = (f.numero  || '').padStart(4, '0');
      const code    = f.commune  || '';
      return {
        refParcelle:     [code, section, numero].filter(Boolean).join(' '),
        section,
        numero,
        codeCommune:     code,
        surfaceParcelle: f.contenance ? Math.round(Number(f.contenance)) : null,
        feuille:         f.feuille || '',
      };
    } catch(e) {
      console.warn('[Prospection] Cadastre IGN :', e.message);
      return null;
    }
  },

  // ── Liens Maps / Street View / DVF ───────────────────────
  getStreetViewUrl(adresse, lat, lng) {
    const q = encodeURIComponent(adresse);
    const maps = (lat && lng)
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${q}`;
    const sv = (lat && lng)
      ? `https://www.google.com/maps?q=${lat},${lng}&layer=c`
      : `https://www.google.com/maps?q=${q}&layer=c`;
    const dvf = (lat && lng)
      ? `https://app.dvf.etalab.gouv.fr/#lon=${lng}&lat=${lat}&zoom=17`
      : 'https://app.dvf.etalab.gouv.fr/';
    const pagesjaunes = `https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui=${encodeURIComponent(adresse)}&ou=`;
    return { maps, streetview: sv, dvf, pagesjaunes };
  },

  // ── Enrichissement automatique ────────────────────────────
  async enrichirPermis(id) {
    const p = this._permis.find(x => x.id === id);
    if (!p) return;

    if (p._enrichi) { this._showEnrichModal(p); return; }

    App.toast('✨ Enrichissement en cours…');

    const geocode  = await this.geocodeAdresse(p.adresse);
    if (geocode) { p.lat = geocode.lat; p.lng = geocode.lng; }

    const cadastre = await this.getCadastre(p.adresse, p.lat, p.lng);
    const links    = this.getStreetViewUrl(p.adresse, p.lat, p.lng);

    p._enrichi = { geocode, cadastre, links };

    const eStore = this._loadStore(this.ENRICHI_KEY);
    eStore[p.adresse] = p._enrichi;
    localStorage.setItem(this.ENRICHI_KEY, JSON.stringify(eStore));

    if (geocode) this._renderMarkers();
    App.toast('✅ Fiche enrichie avec données cadastrales !');
    this._renderStats();
    this._renderListe();
    this._showEnrichModal(p);
  },

  // ── Modal détail enrichissement ───────────────────────────
  _showEnrichModal(p) {
    const e   = p._enrichi || {};
    const cad = e.cadastre;
    const geo = e.geocode;
    const lnk = e.links || this.getStreetViewUrl(p.adresse, p.lat, p.lng);

    const body = document.createElement('div');
    body.style.cssText = 'display:flex;flex-direction:column;gap:10px;font-size:13px';

    const bloc = (icon, titre, html) => {
      const d = document.createElement('div');
      d.style.cssText = 'padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border)';
      d.innerHTML = `<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-tertiary);margin-bottom:8px">${icon} ${titre}</div>${html}`;
      return d;
    };

    // Infos permis
    body.appendChild(bloc('📋', 'Permis', `
      <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;color:var(--text-secondary)">
        <span style="color:var(--text-tertiary)">Type</span><span style="color:var(--text-primary)">${p.typeLabel}</span>
        <span style="color:var(--text-tertiary)">Adresse</span><span style="color:var(--text-primary)">${p.adresse}</span>
        ${p.surface ? `<span style="color:var(--text-tertiary)">Surface</span><span><b>${p.surface} m²</b></span>` : ''}
        ${p.datePermis ? `<span style="color:var(--text-tertiary)">Date</span><span>${new Date(p.datePermis+'T00:00:00').toLocaleDateString('fr-FR')}</span>` : ''}
        ${p.nomPetitionnaire ? `<span style="color:var(--text-tertiary)">Pétitionnaire</span><span><b>${p.nomPetitionnaire}</b></span>` : ''}
      </div>
    `));

    // Géocodage
    body.appendChild(bloc('📍', 'Géocodage (api-adresse.data.gouv.fr)', geo
      ? `<div style="color:var(--text-primary);margin-bottom:4px">${geo.label}</div>
         <div style="color:var(--text-tertiary);font-size:11px">
           Fiabilité : <b style="color:${geo.score > 0.7 ? 'var(--green)' : 'var(--orange)'}">${Math.round((geo.score||0)*100)}%</b>
           &nbsp;·&nbsp; ${p.lat?.toFixed(6)}, ${p.lng?.toFixed(6)}
         </div>`
      : `<span style="color:var(--text-tertiary)">Non disponible</span>`
    ));

    // Cadastre
    body.appendChild(bloc('🏛', 'Cadastre (IGN Apicarto)', cad
      ? `<div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;color:var(--text-secondary)">
           <span style="color:var(--text-tertiary)">Référence</span>
           <span style="color:var(--text-primary);font-weight:700;font-family:monospace;letter-spacing:.05em">${cad.refParcelle}</span>
           <span style="color:var(--text-tertiary)">Section / N°</span>
           <span>${cad.section} — ${cad.numero}</span>
           ${cad.surfaceParcelle ? `<span style="color:var(--text-tertiary)">Surface parcelle</span><span><b>${cad.surfaceParcelle.toLocaleString('fr-FR')} m²</b></span>` : ''}
           ${cad.feuille ? `<span style="color:var(--text-tertiary)">Feuille</span><span>${cad.feuille}</span>` : ''}
         </div>`
      : `<span style="color:var(--text-tertiary)">Parcelle non trouvée</span>`
    ));

    // Propriétaire
    body.appendChild(bloc('👤', 'Propriétaire', `
      <div style="color:var(--text-primary);margin-bottom:8px">${p.nomPetitionnaire || '(non renseigné dans le permis)'}</div>
      <div style="font-size:11px;color:var(--text-tertiary);padding:6px 8px;
        background:rgba(247,166,79,0.1);border:1px solid rgba(247,166,79,0.25);border-radius:var(--radius-sm)">
        ⚠ Le nom du propriétaire cadastral est une donnée protégée (CNIL/RGPD, art. L107 B LPF).
        Seul le pétitionnaire du permis est disponible publiquement.
      </div>
      <div style="margin-top:8px">
        <a href="${lnk.pagesjaunes}" target="_blank"
           style="font-size:12px;color:var(--accent);text-decoration:none">
          🔍 Rechercher dans les Pages Jaunes →
        </a>
      </div>
    `));

    // Liens
    body.appendChild(bloc('🔗', 'Liens utiles', `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <a href="${lnk.maps}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;
           padding:6px 12px;background:var(--bg-tertiary);border:1px solid var(--border);
           border-radius:var(--radius-sm);color:var(--text-primary);text-decoration:none;font-size:12px">🗺 Google Maps</a>
        <a href="${lnk.streetview}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;
           padding:6px 12px;background:var(--bg-tertiary);border:1px solid var(--border);
           border-radius:var(--radius-sm);color:var(--text-primary);text-decoration:none;font-size:12px">📸 Street View</a>
        <a href="${lnk.dvf}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;
           padding:6px 12px;background:var(--bg-tertiary);border:1px solid var(--border);
           border-radius:var(--radius-sm);color:var(--text-primary);text-decoration:none;font-size:12px">💰 Valeurs foncières</a>
      </div>
    `));

    const dejaCree = DB.getAll(this.PROSP_KEY).some(x => x.permisId === p.id);
    const footer = `
      <button class="btn btn-primary" onclick="Prospection.creerProspect('${p.id}');App.closeModal()" ${dejaCree ? 'disabled' : ''}>
        ${dejaCree ? '✅ Prospect créé' : '+ Créer prospect'}
      </button>
      <button class="btn btn-secondary" onclick="App.closeModal();setTimeout(()=>Prospection.genererMessage('${p.id}'),100)">🤖 Message IA</button>
      <button class="btn btn-secondary" onclick="App.closeModal()">Fermer</button>
    `;
    App.openModal('✨ ' + p.typeLabel + ' — ' + p.adresse, body, footer);
  },

  // ── Persistance téléphone + enrichissement ────────────────
  _loadStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  },

  _restoreFromStore() {
    const phones   = this._loadStore(this.PHONES_KEY);
    const enrichis = this._loadStore(this.ENRICHI_KEY);
    this._permis.forEach(p => {
      if (phones[p.adresse])   p._phone   = phones[p.adresse];
      if (enrichis[p.adresse]) p._enrichi = enrichis[p.adresse];
    });
  },

  // ── Saisie + sauvegarde téléphone ────────────────────────
  saisirTelephone(id) {
    const p = this._permis.find(x => x.id === id);
    if (!p) return;
    const body = document.createElement('div');
    body.innerHTML = `
      <div style="margin-bottom:12px;font-size:13px;color:var(--text-secondary)">
        📍 ${p.adresse}
      </div>
      <input id="modal-tel-input" class="form-control" type="tel"
        value="${p._phone || ''}" placeholder="06 12 34 56 78"
        style="font-size:15px;padding:10px 14px">
    `;
    const footer = `
      <button class="btn btn-primary"
        onclick="Prospection.sauvegarderTelephone('${id}',document.getElementById('modal-tel-input').value);App.closeModal()">
        ✓ Enregistrer
      </button>
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
    `;
    App.openModal('📞 Saisir le téléphone', body, footer);
    setTimeout(() => document.getElementById('modal-tel-input')?.focus(), 100);
  },

  sauvegarderTelephone(id, valeur) {
    const p = this._permis.find(x => x.id === id);
    if (!p) return;
    const tel = (valeur !== undefined ? valeur : document.getElementById(`tel-${id}`)?.value || '').trim();
    if (!tel) { App.toast('⚠ Numéro vide', 'error'); return; }

    p._phone = tel;
    const phones = this._loadStore(this.PHONES_KEY);
    phones[p.adresse] = tel;
    localStorage.setItem(this.PHONES_KEY, JSON.stringify(phones));

    // Mettre à jour le prospect DB si existant
    const prosp = DB.getAll(this.PROSP_KEY).find(x => x.permisId === id);
    if (prosp) DB.update(this.PROSP_KEY, prosp.id, { telephone: tel });

    App.toast('🟢 Prospect complet ! Téléphone enregistré.');
    this._renderListe();
    this._renderStats();
  },

  // ── Panel "Trouver le contact" ────────────────────────────
  ouvrirTrouverContact(id) {
    const p = this._permis.find(x => x.id === id);
    if (!p) return;

    const nom   = encodeURIComponent(p.nomPetitionnaire || '');
    const adr   = encodeURIComponent(p.adresse);
    const ville = encodeURIComponent(p.commune || this._ville);

    const lien = (icon, label, url) =>
      `<a href="${url}" target="_blank" rel="noopener"
         style="display:flex;align-items:center;gap:10px;padding:10px 14px;
         background:var(--bg-secondary);border:1px solid var(--border);
         border-radius:var(--radius-sm);text-decoration:none;color:var(--text-primary);
         font-size:13px;transition:border-color .15s"
         onmouseover="this.style.borderColor='var(--accent)'"
         onmouseout="this.style.borderColor='var(--border)'">
         <span style="font-size:20px">${icon}</span>
         <div>
           <div style="font-weight:600">${label}</div>
           <div style="font-size:11px;color:var(--text-tertiary);margin-top:1px">${url.length > 60 ? url.slice(0,60)+'…' : url}</div>
         </div>
         <span style="margin-left:auto;color:var(--text-tertiary);font-size:11px">↗</span>
       </a>`;

    const body = document.createElement('div');
    body.style.cssText = 'display:flex;flex-direction:column;gap:8px';
    body.innerHTML = `
      <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:4px">
        📍 ${p.adresse}${p.nomPetitionnaire ? ' · 👤 ' + p.nomPetitionnaire : ''}
      </div>
      ${lien('🔍', 'Pages Jaunes — annuaire inversé',
        `https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui=${nom || adr}&ou=${ville}`)}
      ${lien('📘', 'Facebook — rechercher le nom',
        `https://www.facebook.com/search/people/?q=${nom || adr}`)}
      ${lien('💼', 'LinkedIn — rechercher la société',
        `https://www.linkedin.com/search/results/people/?keywords=${nom || adr}+${ville}`)}
      ${lien('🔎', 'Google — adresse + contact',
        `https://www.google.com/search?q=${adr}+propriétaire+contact`)}
      ${lien('🏛', 'Infogreffe — si c\'est une société',
        `https://www.infogreffe.fr/recherche-siret-siren/?champs=${nom}`)}
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">
          📞 Numéro trouvé ? Saisissez-le ici :
        </div>
        <div style="display:flex;gap:8px">
          <input id="quick-tel-${id}" class="form-control" type="tel" placeholder="06 12 34 56 78"
            style="flex:1;padding:8px 12px;font-size:13px"
            onkeydown="if(event.key==='Enter'){Prospection.sauvegarderTelephone('${id}',this.value);App.closeModal();}">
          <button class="btn btn-primary" style="white-space:nowrap"
            onclick="Prospection.sauvegarderTelephone('${id}',document.getElementById('quick-tel-${id}').value);App.closeModal()">
            🟢 Enregistrer
          </button>
        </div>
      </div>
    `;

    App.openModal('🔍 Trouver le contact', body, `<button class="btn btn-secondary" onclick="App.closeModal()">Fermer</button>`);
    setTimeout(() => document.getElementById(`quick-tel-${id}`)?.focus(), 100);
  },

  // ── Courrier postal A4 ────────────────────────────────────
  async genererCourrier(id) {
    const p = this._permis.find(x => x.id === id);
    if (!p) return;
    this._imprimerLettres([p]);
  },

  async imprimerCourriers() {
    const cibles = this._filtered.filter(p => this._getTier(p) !== 'vert');
    if (!cibles.length) { App.toast('Aucun courrier à imprimer', 'error'); return; }
    App.toast(`⏳ Génération de ${cibles.length} courrier${cibles.length > 1 ? 's' : ''}…`);
    await this._imprimerLettres(cibles);
  },

  async _imprimerLettres(permisListe) {
    const config  = DB.getConfig();
    const lettres = [];

    const _gcLet = groqConfig();
    for (const p of permisListe) {
      let corps = '';
      try {
        if (!_gcLet) throw new Error('no-proxy');
        const prompt = `Rédige une lettre postale professionnelle et chaleureuse (150 mots max) d'un artisan plaquiste/peintre "${config.nomEntreprise || 'PlaqPro+'}" vers le destinataire d'un projet de ${(p.typeLabel||'travaux').toLowerCase()}${p.surface ? ' de ' + p.surface + ' m²' : ''} au ${p.adresse}. Commence par "Madame, Monsieur," et propose un devis gratuit. Mentionne l'expérience locale. Signe avec le nom de l'entreprise. En français uniquement.`;
        const r = await fetch(_gcLet.url, {
          method: 'POST',
          headers: _gcLet.headers,
          body: JSON.stringify({ model: this.MODEL, messages: [{ role: 'user', content: prompt }], max_tokens: 300, temperature: 0.7 }),
        });
        const d = await r.json();
        corps = d.choices?.[0]?.message?.content?.trim() || '';
      } catch(e) { /* fallback */ }

      if (!corps) {
        corps = `Madame, Monsieur,\n\nArtisan plaquiste et peintre installé dans votre secteur depuis plusieurs années, je vous contacte au sujet de votre projet de ${(p.typeLabel || 'travaux').toLowerCase()} au ${p.adresse}.\n\nFort de mon expérience dans la région et de ma connaissance des chantiers locaux, je serais heureux de vous accompagner dans vos travaux d'aménagement intérieur${p.surface ? ' (surface estimée : ' + p.surface + ' m²)' : ''}.\n\nJe vous propose un devis gratuit, détaillé et sans engagement, réalisé directement sur place.\n\nN'hésitez pas à me contacter pour convenir d'un rendez-vous à votre convenance.\n\nDans l'attente de vous lire, je vous adresse mes cordiales salutations.\n\n${config.nomEntreprise || 'Mon entreprise'}`;
      }

      lettres.push({ permis: p, corps });
    }

    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const pages = lettres.map(({ permis: p, corps }) => `
      <div class="lettre">
        <div class="entete">
          <div class="exp">
            <strong>${config.nomEntreprise || 'Mon entreprise'}</strong><br>
            ${config.adresse || ''}<br>
            ${config.telephone ? 'Tél : ' + config.telephone + '<br>' : ''}
            ${config.email ? config.email : ''}
            ${config.siret ? '<br>SIRET : ' + config.siret : ''}
          </div>
          <div class="dest">
            <strong>${p.nomPetitionnaire || 'Madame, Monsieur'}</strong><br>
            ${p.adresse}
          </div>
        </div>
        <div class="date">Le ${today}</div>
        <div class="objet"><strong>Objet :</strong> Projet de ${(p.typeLabel || 'travaux').toLowerCase()}${p.surface ? ' — ' + p.surface + ' m²' : ''}</div>
        <div class="corps">${corps.replace(/\n/g, '<br>')}</div>
        ${config.nomEntreprise ? `<div class="signature"><br>${config.nomEntreprise}${config.telephone ? '<br>' + config.telephone : ''}</div>` : ''}
      </div>
    `).join('<div class="page-break"></div>');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
      <title>Courriers — ${today}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Georgia, serif; font-size: 12pt; color: #111; background: #fff; }
        .lettre { width: 210mm; min-height: 297mm; padding: 20mm 20mm 25mm; page-break-after: always; position: relative; }
        .entete { display: flex; justify-content: space-between; margin-bottom: 18mm; }
        .exp { font-size: 11pt; line-height: 1.6; color: #333; }
        .dest { font-size: 11pt; line-height: 1.6; text-align: right; border: 1px solid #ccc; padding: 10px 14px; border-radius: 4px; }
        .date { margin-bottom: 8mm; font-size: 11pt; color: #555; }
        .objet { margin-bottom: 8mm; font-size: 11pt; }
        .corps { line-height: 1.8; font-size: 11.5pt; white-space: pre-wrap; }
        .signature { margin-top: 12mm; font-size: 11pt; color: #333; }
        .page-break { page-break-before: always; }
        @media print {
          .lettre { page-break-after: always; }
          .no-print { display: none; }
        }
      </style>
    </head><body>
      <div class="no-print" style="padding:12px 20px;background:#1a1d27;color:#f0f2f8;display:flex;align-items:center;gap:12px;font-family:sans-serif;font-size:13px">
        📬 ${lettres.length} courrier${lettres.length > 1 ? 's' : ''} généré${lettres.length > 1 ? 's' : ''}
        <button onclick="window.print()" style="margin-left:auto;padding:7px 16px;background:#4F8EF7;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">
          🖨 Imprimer ${lettres.length} courrier${lettres.length > 1 ? 's' : ''}
        </button>
        <button onclick="window.close()" style="padding:7px 12px;background:#333;color:#aaa;border:none;border-radius:6px;cursor:pointer;font-size:13px">✕</button>
      </div>
      ${pages}
    </body></html>`;

    const win = window.open('', '_blank', 'width=900,height=750,scrollbars=yes');
    if (!win) { App.toast('⚠ Popup bloquée — autorisez les popups pour ce site', 'error'); return; }
    win.document.write(html);
    win.document.close();
  },

  // ── Utilitaires ───────────────────────────────────────────
  _showLoading(on) {
    const el = document.getElementById('prosp-loading');
    if (el) el.style.display = on ? 'flex' : 'none';
  },
};

// ── Conversion permis → fiche client ─────────────────────────
function convertirPermisEnProspect(permis) {
  const existing = DB.clients.find(c => c._permisId === permis.id);
  if (existing) return existing;

  const e   = permis._enrichi || {};
  const cad = e.cadastre;
  const geo = e.geocode;

  const nom     = permis.nomPetitionnaire || ('Prospect — ' + (permis.commune || permis.adresse || ''));
  const adresse = geo?.label || permis.adresse || '';
  const ville   = geo?.city  || permis.commune || '';

  let notes = `Prospect issu permis de construire — ${permis.typeLabel || ''}`;
  if (permis.surface)    notes += ` · ${permis.surface} m²`;
  if (permis.datePermis) notes += ` · ${permis.datePermis}`;
  if (cad?.refParcelle)  notes += `\nRéf. cadastrale : ${cad.refParcelle}`;
  if (cad?.surfaceParcelle) notes += ` · Parcelle ${cad.surfaceParcelle} m²`;

  return DB.addClient({
    nom,
    adresse,
    ville,
    telephone: '',
    email:    '',
    notes,
    statut:   'Prospect',
    actif:    true,
    _permisId: permis.id,
  });
}

// ── Page + Widget dashboard ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  Object.assign(Pages, {
    prospection() {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;gap:16px';

      // Stats
      const statsWrap = document.createElement('div');
      statsWrap.id = 'prosp-stats';
      statsWrap.innerHTML = `<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:0">
        <div class="stat-card"><div class="stat-label">Permis trouvés</div><div class="stat-value">📋 —</div></div>
        <div class="stat-card"><div class="stat-label">Haute priorité (≥70)</div><div class="stat-value" style="color:var(--green)">⭐ —</div></div>
        <div class="stat-card"><div class="stat-label">Prospects ce mois</div><div class="stat-value">👥 —</div></div>
        <div class="stat-card"><div class="stat-label">CA potentiel estimé</div><div class="stat-value" style="font-size:20px">— €</div></div>
      </div>`;
      wrap.appendChild(statsWrap);

      // Contrôles filtres
      const ctrlCard = document.createElement('div');
      ctrlCard.className = 'card';
      ctrlCard.innerHTML = `
        <div class="card-body" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px">
          <div style="display:flex;align-items:center;gap:6px">
            <label style="font-size:12px;color:var(--text-secondary);white-space:nowrap">Rayon :</label>
            <select id="prosp-rayon" class="form-control" style="width:90px;padding:5px 8px;font-size:13px"
              onchange="Prospection._rayon=parseInt(this.value)">
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="20" selected>20 km</option>
              <option value="50">50 km</option>
            </select>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <label style="font-size:12px;color:var(--text-secondary);white-space:nowrap">Type :</label>
            <select id="filtre-type" class="form-control" style="width:165px;padding:5px 8px;font-size:13px"
              onchange="Prospection._appliquerFiltres();Prospection._renderListe();Prospection._renderMarkers()">
              <option value="">Tous les types</option>
              <option>Construction neuve</option>
              <option>Rénovation</option>
              <option>Extension</option>
              <option>Aménagement</option>
            </select>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <label style="font-size:12px;color:var(--text-secondary);white-space:nowrap">Surface :</label>
            <input id="filtre-surf-min" class="form-control" type="number" placeholder="min" style="width:64px;padding:5px 8px;font-size:13px"
              oninput="Prospection._appliquerFiltres();Prospection._renderListe();Prospection._renderMarkers()">
            <span style="font-size:12px;color:var(--text-tertiary)">–</span>
            <input id="filtre-surf-max" class="form-control" type="number" placeholder="max" style="width:64px;padding:5px 8px;font-size:13px"
              oninput="Prospection._appliquerFiltres();Prospection._renderListe();Prospection._renderMarkers()">
            <span style="font-size:12px;color:var(--text-tertiary)">m²</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <label style="font-size:12px;color:var(--text-secondary);white-space:nowrap">Depuis :</label>
            <input id="filtre-date" class="form-control" type="date" style="width:145px;padding:5px 8px;font-size:13px"
              oninput="Prospection._appliquerFiltres();Prospection._renderListe();Prospection._renderMarkers()">
          </div>
          <button class="btn btn-primary btn-sm" onclick="Prospection.rechercher()" style="margin-left:auto">
            🔍 Actualiser
          </button>
        </div>
      `;
      wrap.appendChild(ctrlCard);

      // Carte + Liste
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:1fr 400px;gap:16px';

      // Carte
      const mapCard = document.createElement('div');
      mapCard.className = 'card';
      mapCard.innerHTML = `
        <div class="card-header">
          <span class="card-title">🗺 Carte des opportunités</span>
          <span id="prosp-source" style="font-size:11px;color:var(--text-tertiary);margin-left:auto">Chargement…</span>
        </div>
        <div class="card-body" style="padding:0;position:relative;border-radius:0 0 var(--radius-md) var(--radius-md);overflow:hidden">
          <div id="prosp-map" style="height:540px;width:100%;min-height:400px"></div>
          <div id="prosp-loading" style="display:none;position:absolute;inset:0;background:rgba(13,15,20,.75);
            align-items:center;justify-content:center;font-size:14px;color:var(--text-secondary);flex-direction:column;gap:8px">
            <div style="font-size:24px">⏳</div>Chargement des permis…
          </div>
        </div>
      `;
      grid.appendChild(mapCard);

      // Liste
      const listCard = document.createElement('div');
      listCard.className = 'card';
      listCard.innerHTML = `
        <div class="card-header">
          <span class="card-title">📋 Opportunités</span>
          <span id="prosp-count" style="font-size:11px;color:var(--text-tertiary)"></span>
        </div>
        <div id="prosp-liste" class="card-body" style="overflow-y:auto;max-height:540px;padding:12px"></div>
      `;
      grid.appendChild(listCard);
      wrap.appendChild(grid);

      // Légende
      const legend = document.createElement('div');
      legend.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--text-secondary);align-items:center';
      legend.innerHTML = `
        <span style="color:var(--text-tertiary);font-size:11px;text-transform:uppercase;letter-spacing:.05em">Score :</span>
        <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#2DD4A0;display:inline-block"></span>≥70 Priorité haute</span>
        <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#F7A64F;display:inline-block"></span>40–69 Opportunité</span>
        <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#F75B5B;display:inline-block"></span>&lt;40 Faible</span>
        <span style="margin-left:12px;color:var(--text-tertiary);font-size:11px;text-transform:uppercase;letter-spacing:.05em">Types :</span>
        ${Object.entries(Prospection.TYPE_COLORS).map(([l, c]) =>
          `<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:${c};display:inline-block"></span>${l}</span>`
        ).join('')}
      `;
      wrap.appendChild(legend);

      // Init après insertion dans le DOM (150ms pour laisser le layout s'établir)
      setTimeout(() => {
        Prospection.init().then(() => {
          const count = document.getElementById('prosp-count');
          if (count) count.textContent = Prospection._filtered.length + ' résultats';
          // Double invalidateSize pour les cas où le layout est encore en flux
          setTimeout(() => Prospection._map && Prospection._map.invalidateSize(), 300);
        }).catch(e => console.error('[Prospection] init error:', e));
      }, 150);

      return wrap;
    },
  });

  // ── Widget dashboard ────────────────────────────────────────
  const _origDash = Pages.dashboard.bind(Pages);
  Pages.dashboard = function() {
    const div = _origDash();

    const prospects  = DB.getAll('plaqpro_prospects');
    const mois       = new Date();
    const nouveaux   = prospects.filter(x => {
      const d = new Date(x.createdAt || '');
      return d.getMonth() === mois.getMonth() && d.getFullYear() === mois.getFullYear();
    }).length;

    const widget = document.createElement('div');
    widget.className = 'card';
    widget.style.cssText = 'margin-bottom:0;cursor:pointer;border-color:rgba(79,142,247,0.25);transition:border-color .2s,box-shadow .2s';
    widget.innerHTML = `
      <div class="card-body" style="display:flex;align-items:center;gap:14px;padding:14px 18px">
        <span style="font-size:30px;flex-shrink:0">🎯</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:700;color:var(--text-primary)">Prospection IA — Permis de construire</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:3px">
            ${prospects.length} prospect${prospects.length !== 1 ? 's' : ''} total
            · <span style="color:var(--accent);font-weight:600">${nouveaux} nouveau${nouveaux !== 1 ? 'x' : ''} ce mois</span>
            · Données permis publiques temps réel
          </div>
        </div>
        <button class="btn btn-primary btn-sm" style="flex-shrink:0"
          onclick="event.stopPropagation();App.navigate('prospection')">
          Voir les opportunités →
        </button>
      </div>
    `;
    widget.addEventListener('mouseenter', () => { widget.style.borderColor = 'var(--accent)'; widget.style.boxShadow = 'var(--shadow-lg)'; });
    widget.addEventListener('mouseleave', () => { widget.style.borderColor = 'rgba(79,142,247,0.25)'; widget.style.boxShadow = ''; });
    widget.addEventListener('click', () => App.navigate('prospection'));

    const statsGrid = div.querySelector('.stats-grid');
    if (statsGrid) div.insertBefore(widget, statsGrid);
    else div.prepend(widget);

    return div;
  };
});
