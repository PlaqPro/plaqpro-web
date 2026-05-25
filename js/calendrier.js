/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Calendrier mensuel
//  calendrier.js
// ============================================================

var Calendrier = {

  _year:  new Date().getFullYear(),
  _month: new Date().getMonth(),

  MOIS: ['Janvier','Février','Mars','Avril','Mai','Juin',
         'Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  JOURS: ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],

  STATUT_STYLE: {
    'En cours':   { bg: 'rgba(79,142,247,0.18)',  border: '#4F8EF7', text: '#4F8EF7'  },
    'En attente': { bg: 'rgba(247,166,79,0.18)',  border: '#F7A64F', text: '#F7A64F'  },
    'Terminé':    { bg: 'rgba(45,212,160,0.18)',  border: '#2DD4A0', text: '#2DD4A0'  },
  },

  _style(statut) {
    return this.STATUT_STYLE[statut] || { bg: 'rgba(167,139,250,0.18)', border: '#A78BFA', text: '#A78BFA' };
  },

  // Chantiers actifs dans un intervalle [dateDebut, dateFin]
  _chantiersForDay(dateObj) {
    const all = DB.getAll ? DB.getAll(DB.KEYS ? DB.KEYS.chantiers : 'plaqpro_chantiers') : [];
    const ts = dateObj.getTime();
    return all.filter(c => {
      const start = c.dateDebut ? new Date(c.dateDebut.split('T')[0]).getTime() : null;
      const end   = c.dateFin   ? new Date(c.dateFin.split('T')[0]).getTime()   : start;
      if (!start) return false;
      return ts >= start && ts <= (end || start);
    });
  },

  _modalChantier(c) {
    const style = this._style(c.statut);
    const body = document.createElement('div');
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${style.border};flex-shrink:0"></span>
          <span style="font-size:13px;color:var(--text-secondary)">${c.statut || '—'}</span>
        </div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:13px">
          <span style="color:var(--text-tertiary)">Client</span>
          <span style="color:var(--text-primary)">${Calendrier._clientNom(c.clientId)}</span>
          <span style="color:var(--text-tertiary)">Adresse</span>
          <span style="color:var(--text-primary)">${c.adresse || '—'}</span>
          <span style="color:var(--text-tertiary)">Début</span>
          <span style="color:var(--text-primary)">${Calendrier._fmt(c.dateDebut)}</span>
          <span style="color:var(--text-tertiary)">Fin</span>
          <span style="color:var(--text-primary)">${Calendrier._fmt(c.dateFin)}</span>
          ${c.montant ? `<span style="color:var(--text-tertiary)">Montant</span><span style="color:var(--text-primary)">${Number(c.montant).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}</span>` : ''}
          ${c.description ? `<span style="color:var(--text-tertiary)">Notes</span><span style="color:var(--text-primary)">${c.description}</span>` : ''}
        </div>
      </div>
    `;
    const footer = `<button class="btn btn-primary" onclick="App.closeModal();App.navigate('chantiers',{id:'${c.id}'})">Voir le chantier →</button>
                    <button class="btn btn-secondary" onclick="App.closeModal()">Fermer</button>`;
    App.openModal('🏗 ' + (c.nom || c.titre || 'Chantier'), body, footer);
  },

  _clientNom(id) {
    if (!id) return '—';
    try {
      const clients = DB.getAll ? DB.getAll(DB.KEYS ? DB.KEYS.clients : 'plaqpro_clients') : [];
      const c = clients.find(x => x.id === id);
      return c ? (c.nom || c.prenom || '—') : '—';
    } catch(e) { return '—'; }
  },

  _fmt(d) {
    if (!d) return '—';
    try { return new Date(d.split('T')[0]).toLocaleDateString('fr-FR'); } catch(e) { return d; }
  },

  prev() { if (this._month === 0) { this._month = 11; this._year--; } else { this._month--; } this._render(); },
  next() { if (this._month === 11) { this._month = 0; this._year++; } else { this._month++; } this._render(); },
  today() { this._year = new Date().getFullYear(); this._month = new Date().getMonth(); this._render(); },

  _render() {
    const wrap = document.getElementById('calendrier-root');
    if (!wrap) return;
    wrap.innerHTML = '';
    wrap.appendChild(this._buildCalendar());
  },

  _buildCalendar() {
    const frag = document.createDocumentFragment();
    const now  = new Date();

    // ── Header navigation ─────────────────────────────────────
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap';
    header.innerHTML = `
      <button class="btn btn-secondary btn-sm" onclick="Calendrier.prev()">‹ Préc.</button>
      <span style="font-size:17px;font-weight:700;color:var(--text-primary);min-width:180px;text-align:center">
        ${this.MOIS[this._month]} ${this._year}
      </span>
      <button class="btn btn-secondary btn-sm" onclick="Calendrier.next()">Suiv. ›</button>
      <button class="btn btn-secondary btn-sm" onclick="Calendrier.today()" style="margin-left:8px">Aujourd'hui</button>
    `;
    frag.appendChild(header);

    // ── Grille ────────────────────────────────────────────────
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden';

    // En-têtes jours
    this.JOURS.forEach(j => {
      const h = document.createElement('div');
      h.style.cssText = 'background:var(--bg-secondary);padding:8px 4px;text-align:center;font-size:11px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.06em';
      h.textContent = j;
      grid.appendChild(h);
    });

    // Premier jour du mois (1=Lun … 7=Dim)
    const firstDay = new Date(this._year, this._month, 1).getDay(); // 0=Sun
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // convert to Mon-based

    const daysInMonth  = new Date(this._year, this._month + 1, 0).getDate();
    const daysInPrev   = new Date(this._year, this._month, 0).getDate();
    const totalCells   = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.style.cssText = 'background:var(--bg-primary);min-height:96px;padding:6px;position:relative;vertical-align:top;overflow:hidden';

      let dayNum, isCurrentMonth = true;
      if (i < startOffset) {
        dayNum = daysInPrev - startOffset + i + 1;
        isCurrentMonth = false;
      } else if (i >= startOffset + daysInMonth) {
        dayNum = i - startOffset - daysInMonth + 1;
        isCurrentMonth = false;
      } else {
        dayNum = i - startOffset + 1;
      }

      const cellDate = new Date(
        isCurrentMonth ? this._year : (i < startOffset ? (this._month === 0 ? this._year - 1 : this._year) : (this._month === 11 ? this._year + 1 : this._year)),
        isCurrentMonth ? this._month : (i < startOffset ? (this._month === 0 ? 11 : this._month - 1) : (this._month === 11 ? 0 : this._month + 1)),
        dayNum
      );

      const isToday = cellDate.toDateString() === now.toDateString();
      const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;

      // Numéro du jour
      const numEl = document.createElement('div');
      numEl.style.cssText = `
        display:inline-flex;align-items:center;justify-content:center;
        width:24px;height:24px;border-radius:50%;margin-bottom:4px;
        font-size:12px;font-weight:${isToday ? '800' : '500'};
        ${isToday ? 'background:var(--accent);color:#fff;' : `color:${isCurrentMonth ? (isWeekend ? 'var(--text-secondary)' : 'var(--text-primary)') : 'var(--text-tertiary)'};`}
      `;
      numEl.textContent = dayNum;
      cell.appendChild(numEl);

      if (!isCurrentMonth) cell.style.background = 'var(--bg-secondary)';

      // Chantiers du jour
      if (isCurrentMonth) {
        const chantiers = this._chantiersForDay(cellDate);
        chantiers.slice(0, 3).forEach(c => {
          const st = this._style(c.statut);
          const ev = document.createElement('div');
          ev.style.cssText = `
            background:${st.bg};border-left:2px solid ${st.border};
            color:${st.text};font-size:10px;font-weight:600;
            padding:2px 5px;border-radius:2px;margin-bottom:2px;
            cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
            transition:opacity .15s;
          `;
          ev.title = c.nom || c.titre || 'Chantier';
          ev.textContent = c.nom || c.titre || 'Chantier';
          ev.addEventListener('mouseenter', () => ev.style.opacity = '.75');
          ev.addEventListener('mouseleave', () => ev.style.opacity = '1');
          ev.addEventListener('click', e => { e.stopPropagation(); Calendrier._modalChantier(c); });
          cell.appendChild(ev);
        });
        if (chantiers.length > 3) {
          const more = document.createElement('div');
          more.style.cssText = 'font-size:10px;color:var(--text-tertiary);padding:1px 5px';
          more.textContent = `+${chantiers.length - 3} autre${chantiers.length - 3 > 1 ? 's' : ''}`;
          cell.appendChild(more);
        }
      }

      grid.appendChild(cell);
    }

    frag.appendChild(grid);

    // ── Légende ───────────────────────────────────────────────
    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;gap:20px;margin-top:14px;flex-wrap:wrap';
    [
      { label: 'En cours',   color: '#4F8EF7' },
      { label: 'En attente', color: '#F7A64F' },
      { label: 'Terminé',    color: '#2DD4A0' },
      { label: 'Autre',      color: '#A78BFA' },
    ].forEach(({ label, color }) => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)';
      item.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color}"></span>${label}`;
      legend.appendChild(item);
    });
    frag.appendChild(legend);

    return frag;
  },
};

// ── Page ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Object.assign(Pages, {
    calendrier() {
      const wrap = document.createElement('div');
      wrap.id = 'calendrier-root';

      // Reset to current month on each visit
      Calendrier._year  = new Date().getFullYear();
      Calendrier._month = new Date().getMonth();

      wrap.appendChild(Calendrier._buildCalendar());
      return wrap;
    },
  });
});
