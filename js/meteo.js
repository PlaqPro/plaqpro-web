/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Widget Météo (Open-Meteo, sans clé API)
//  meteo.js
// ============================================================

var Meteo = {

  _data:    null,
  _city:    'Lyon',
  _lat:     null,
  _lon:     null,
  _loading: false,

  // ── Codes WMO → icône / label / catégorie ─────────────────
  WMO: {
    0:  { icon: '☀️',  label: 'Ensoleillé',             cat: 'good'  },
    1:  { icon: '🌤️', label: 'Peu nuageux',             cat: 'good'  },
    2:  { icon: '⛅',  label: 'Partiellement nuageux',   cat: 'ok'    },
    3:  { icon: '☁️',  label: 'Couvert',                 cat: 'ok'    },
    45: { icon: '🌫️', label: 'Brouillard',              cat: 'ok'    },
    48: { icon: '🌫️', label: 'Brouillard givrant',      cat: 'frost' },
    51: { icon: '🌦️', label: 'Bruine légère',           cat: 'rain'  },
    53: { icon: '🌦️', label: 'Bruine',                  cat: 'rain'  },
    55: { icon: '🌦️', label: 'Bruine dense',            cat: 'rain'  },
    61: { icon: '🌧️', label: 'Pluie légère',            cat: 'rain'  },
    63: { icon: '🌧️', label: 'Pluie',                   cat: 'rain'  },
    65: { icon: '🌧️', label: 'Pluie forte',             cat: 'rain'  },
    71: { icon: '❄️',  label: 'Neige légère',            cat: 'frost' },
    73: { icon: '❄️',  label: 'Neige',                   cat: 'frost' },
    75: { icon: '❄️',  label: 'Neige forte',             cat: 'frost' },
    77: { icon: '🌨️', label: 'Grains de neige',         cat: 'frost' },
    80: { icon: '🌦️', label: 'Averses légères',         cat: 'rain'  },
    81: { icon: '🌦️', label: 'Averses',                 cat: 'rain'  },
    82: { icon: '🌦️', label: 'Averses fortes',          cat: 'rain'  },
    85: { icon: '🌨️', label: 'Averses de neige',        cat: 'frost' },
    86: { icon: '🌨️', label: 'Averses de neige fortes', cat: 'frost' },
    95: { icon: '⛈️',  label: 'Orage',                  cat: 'rain'  },
    96: { icon: '⛈️',  label: 'Orage avec grêle',        cat: 'rain'  },
    99: { icon: '⛈️',  label: 'Orage fort',              cat: 'rain'  },
  },

  _wmo(code) {
    return this.WMO[code] || { icon: '🌡️', label: 'Conditions inconnues', cat: 'ok' };
  },

  // ── Conseil chantier ──────────────────────────────────────
  _conseil(data) {
    const c = data.current;
    const w = this._wmo(c.weather_code);
    // Vérifier pluie dans les 3 prochains jours
    const rainNext = (data.daily?.weather_code || []).slice(1, 4).some(code => {
      const cat = (this.WMO[code] || {}).cat;
      return cat === 'rain' || cat === 'frost';
    });

    if (c.temperature_2m < 5 || w.cat === 'frost')
      return { texte: 'Gel — ne pas appliquer d\'enduits',            emoji: '❄️',  couleur: '#A78BFA' };
    if (w.cat === 'rain')
      return { texte: 'Pluie — reporter les travaux extérieurs',      emoji: '🌧',  couleur: '#60A5FA' };
    if (c.wind_speed_10m > 50)
      return { texte: 'Vent fort — sécuriser le chantier',            emoji: '💨',  couleur: '#F7A64F' };
    if (c.relative_humidity_2m > 70)
      return { texte: 'Humidité élevée — éviter le jointage',         emoji: '⚠️',  couleur: '#F7A64F' };
    if (rainNext)
      return { texte: 'Pluie prévue prochainement — planifier',       emoji: '🌂',  couleur: '#60A5FA' };
    return   { texte: 'Bonnes conditions pour sécher les enduits',    emoji: '✅',  couleur: '#2DD4A0' };
  },

  // ── Initialisation ────────────────────────────────────────
  async init() {
    this._city = localStorage.getItem('plaqpro_ville')
      || (typeof DB !== 'undefined' ? (DB.getConfig().ville || 'Lyon') : 'Lyon');
    this._injectTopbar();
    this._topbarLoading();
    await this._fetchWeather();
  },

  // ── Topbar : badge compact ────────────────────────────────
  _injectTopbar() {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    if (document.getElementById('meteo-topbar')) return;
    const badge = document.createElement('div');
    badge.id = 'meteo-topbar';
    badge.style.cssText = 'display:flex;align-items:center;flex-shrink:0;';
    const actions = topbar.querySelector('.topbar-actions');
    actions ? topbar.insertBefore(badge, actions) : topbar.appendChild(badge);
  },

  _topbarLoading() {
    const el = document.getElementById('meteo-topbar');
    if (el) el.innerHTML = '<span style="opacity:0.35;font-size:12px;padding:4px 8px">🌡 …</span>';
  },

  _updateTopbar() {
    const el = document.getElementById('meteo-topbar');
    if (!el || !this._data) return;
    const c = this._data.current;
    const w = this._wmo(c.weather_code);
    el.innerHTML = `
      <div title="${w.label} · Ressenti ${Math.round(c.apparent_temperature)}°C · Humidité ${c.relative_humidity_2m}% · Vent ${Math.round(c.wind_speed_10m)} km/h"
           style="display:flex;align-items:center;gap:5px;padding:4px 10px;
                  background:var(--bg-elevated);border:1px solid var(--border);
                  border-radius:var(--r-full);font-size:12px;cursor:default;
                  transition:border-color .15s"
           onmouseenter="this.style.borderColor='var(--accent)'"
           onmouseleave="this.style.borderColor='var(--border)'">
        <span style="font-size:15px">${w.icon}</span>
        <span style="font-weight:700;color:var(--text-primary)">${Math.round(c.temperature_2m)}°</span>
        <span style="color:var(--text-tertiary);font-size:11px">${this._city}</span>
      </div>
    `;
  },

  // ── Fetch principal ───────────────────────────────────────
  async _fetchWeather() {
    if (this._loading) return;
    this._loading = true;
    try {
      let lat, lon, geoOk = false;

      // Essayer la géolocalisation (timeout 4s)
      try {
        const pos = await new Promise((res, rej) => {
          if (!navigator.geolocation) { rej('nogeo'); return; }
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000, maximumAge: 300000 });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        geoOk = true;
      } catch { /* fallback ville */ }

      // Géocodage si pas de position GPS
      if (!geoOk) {
        const r   = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(this._city)}&count=1&language=fr&format=json`);
        const geo = await r.json();
        if (!geo.results?.length) throw new Error('Ville introuvable : ' + this._city);
        lat         = geo.results[0].latitude;
        lon         = geo.results[0].longitude;
        this._city  = geo.results[0].name;
      }

      this._lat = lat;
      this._lon = lon;

      // Récupérer la météo
      const url  = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
                 + `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m`
                 + `&daily=weather_code,temperature_2m_max,temperature_2m_min`
                 + `&timezone=auto&forecast_days=4&wind_speed_unit=kmh`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Open-Meteo HTTP ' + resp.status);
      this._data = await resp.json();

      this._updateTopbar();
      const slot = document.getElementById('meteo-dashboard-slot');
      if (slot) this._fillSlot(slot);

    } catch (err) {
      console.warn('[Meteo]', err.message || err);
      const el = document.getElementById('meteo-topbar');
      if (el) el.innerHTML = `<span style="opacity:0.3;font-size:11px;padding:4px 8px" title="${err.message||err}">🌡 N/D</span>`;
    } finally {
      this._loading = false;
    }
  },

  // ── Dashboard slot ────────────────────────────────────────
  _fillSlot(slot) {
    slot.innerHTML = '';
    if (!this._data) {
      const placeholder = document.createElement('div');
      placeholder.className = 'card';
      placeholder.style.marginBottom = '16px';
      placeholder.innerHTML = `<div class="card-body" style="display:flex;align-items:center;gap:10px;padding:14px 20px">
        <span style="font-size:20px;opacity:0.35">🌡️</span>
        <span style="font-size:12px;color:var(--text-tertiary)">Chargement météo…</span>
      </div>`;
      slot.appendChild(placeholder);
      return;
    }
    slot.appendChild(this.renderCard());
  },

  // ── Carte dashboard complète ──────────────────────────────
  renderCard() {
    const d    = this._data;
    const curr = d.current;
    const day  = d.daily;
    const w    = this._wmo(curr.weather_code);
    const adc  = this._conseil(d);
    const JOURS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

    // Prévisions J+1, J+2, J+3
    const forecastHTML = (day.time || []).slice(1, 4).map((dateStr, i) => {
      const idx = i + 1;
      const fw  = this._wmo(day.weather_code[idx]);
      const j   = JOURS[new Date(dateStr + 'T12:00:00').getDay()];
      const mn  = Math.round(day.temperature_2m_min[idx]);
      const mx  = Math.round(day.temperature_2m_max[idx]);
      return `
        <div style="text-align:center;padding:10px 8px;background:var(--bg-tertiary);
                    border-radius:var(--r-md);flex:1;min-width:0">
          <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase;
                      letter-spacing:.06em;margin-bottom:4px">${j}</div>
          <div style="font-size:24px;margin-bottom:3px">${fw.icon}</div>
          <div style="font-size:11px;color:var(--text-secondary);line-height:1.3">${fw.label}</div>
          <div style="font-size:12px;margin-top:5px;font-family:var(--font-mono)">
            <span style="color:var(--text-tertiary)">${mn}°</span>
            <span style="color:var(--text-primary);font-weight:700;margin-left:4px">${mx}°</span>
          </div>
        </div>`;
    }).join('');

    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginBottom = '16px';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">${w.icon} Météo · ${this._city}</span>
        <button class="btn btn-ghost btn-sm" onclick="Meteo.refresh()" title="Actualiser la météo">↻ Actualiser</button>
      </div>
      <div class="card-body">
        <!-- Ligne principale -->
        <div style="display:grid;grid-template-columns:auto 1fr;gap:20px;margin-bottom:14px;align-items:center">
          <!-- Température + icône -->
          <div style="display:flex;align-items:center;gap:12px">
            <div style="font-size:56px;line-height:1">${w.icon}</div>
            <div>
              <div style="font-size:38px;font-weight:800;color:var(--text-primary);line-height:1;font-family:var(--font-mono)">
                ${Math.round(curr.temperature_2m)}<span style="font-size:22px;font-weight:400">°C</span>
              </div>
              <div style="font-size:13px;color:var(--text-secondary);margin-top:2px">${w.label}</div>
              <div style="font-size:11px;color:var(--text-tertiary);margin-top:3px">
                Ressenti ${Math.round(curr.apparent_temperature)}°C
              </div>
            </div>
          </div>
          <!-- Détails -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:12px">
            <div style="display:flex;justify-content:space-between;padding:5px 8px;
                        background:var(--bg-tertiary);border-radius:var(--r-sm)">
              <span style="color:var(--text-tertiary)">💧 Humidité</span>
              <span style="font-weight:600">${curr.relative_humidity_2m} %</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 8px;
                        background:var(--bg-tertiary);border-radius:var(--r-sm)">
              <span style="color:var(--text-tertiary)">💨 Vent</span>
              <span style="font-weight:600">${Math.round(curr.wind_speed_10m)} km/h</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 8px;
                        background:var(--bg-tertiary);border-radius:var(--r-sm)">
              <span style="color:var(--text-tertiary)">🌡 Aujourd'hui</span>
              <span style="font-weight:600;font-family:var(--font-mono)">
                ${Math.round(day.temperature_2m_min[0])}° / ${Math.round(day.temperature_2m_max[0])}°
              </span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 8px;
                        background:var(--bg-tertiary);border-radius:var(--r-sm)">
              <span style="color:var(--text-tertiary)">📍 Source</span>
              <span style="font-weight:600;font-size:11px">${this._lat ? 'GPS' : 'Ville'}</span>
            </div>
          </div>
        </div>

        <!-- Prévisions 3 jours -->
        <div style="display:flex;gap:8px;margin-bottom:12px">
          ${forecastHTML}
        </div>

        <!-- Conseil chantier -->
        <div style="padding:10px 14px;border-radius:var(--r-md);
                    background:${adc.couleur}15;border:1px solid ${adc.couleur}38;
                    display:flex;align-items:center;gap:10px">
          <span style="font-size:20px;flex-shrink:0">${adc.emoji}</span>
          <span style="font-size:13px;font-weight:500;color:var(--text-primary)">${adc.texte}</span>
        </div>
      </div>
    `;
    return card;
  },

  // ── Actualisation ─────────────────────────────────────────
  async refresh() {
    this._data = null;
    this._city = localStorage.getItem('plaqpro_ville')
      || (typeof DB !== 'undefined' ? (DB.getConfig().ville || 'Lyon') : 'Lyon');
    this._topbarLoading();
    const slot = document.getElementById('meteo-dashboard-slot');
    if (slot) this._fillSlot(slot);
    await this._fetchWeather();
  },

  // ── Changer de ville depuis Config ────────────────────────
  changerVille(ville) {
    if (!ville) return;
    this._city = ville.trim();
    localStorage.setItem('plaqpro_ville', this._city);
    this.refresh();
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Meteo.init();
});
