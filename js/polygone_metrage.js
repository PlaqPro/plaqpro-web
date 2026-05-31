/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Polygone / metrage avance
//  polygone_metrage.js
// ============================================================

(function() {
  'use strict';

  const PolygoneMetrage = {
    _containerId: null,
    _container: null,
    _options: {},
    _mode: 'polygone',
    _points: [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 4 },
      { x: 0, y: 4 },
    ],
    _segments: [
      { longueur: 5, largeur: 1 },
    ],
    _deductions: [],
    _pente: 0,

    _showShapeInputs(shape) {
      const box = document.getElementById('poly-shape-inputs');
      if (!box) return;
      const field = (id, label, placeholder) =>
        `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <label style="font-size:.85rem;color:var(--text-secondary,#666);min-width:120px">${label}</label>
          <input id="${id}" type="number" min="0" step="0.01" placeholder="${placeholder}"
            style="width:100px;padding:6px 10px;border-radius:6px;border:1px solid var(--border,#e2e8f0);font-size:.9rem">
          <span style="font-size:.8rem;color:var(--text-tertiary,#999)">m</span>
        </div>`;
      const configs = {
        rectangle: {
          html: field('shape-l','Longueur','ex: 12') + field('shape-w','Largeur','ex: 8'),
          btn: 'Calculer le rectangle'
        },
        triangle: {
          html: field('shape-b','Base','ex: 10') + field('shape-h','Hauteur','ex: 6'),
          btn: 'Calculer le triangle'
        },
        'forme-l': {
          html: field('shape-l1','Longueur 1','ex: 10') + field('shape-w1','Largeur 1','ex: 4') +
                field('shape-l2','Longueur 2','ex: 6') + field('shape-w2','Largeur 2','ex: 3'),
          btn: 'Calculer la forme en L'
        },
        libre: { html: '', btn: null }
      };
      const cfg = configs[shape];
      if (!cfg) return;
      if (shape === 'libre') {
        box.style.display = 'none';
        const wrap = this._container.querySelector('#poly-canvas-wrap');
        const panel = this._container.querySelector('[data-poly-panel="polygone"]');
        if (wrap) { wrap.style.display = 'flex'; }
        if (panel) { panel.style.display = 'none'; }
        this._initCanvas();
        return;
      }
      box.innerHTML = cfg.html +
        `<button type="button" id="shape-apply" style="margin-top:4px;padding:8px 18px;border-radius:8px;border:none;background:var(--accent,#2563eb);color:#fff;font-weight:600;cursor:pointer;align-self:flex-start">${cfg.btn}</button>`;
      box.style.display = 'flex';
      document.getElementById('shape-apply').onclick = () => this._applyShape(shape);
    },

    _applyShape(shape) {
      const v = id => parseFloat(document.getElementById(id)?.value) || 0;
      let points = [];
      if (shape === 'rectangle') {
        const L = v('shape-l'), W = v('shape-w');
        if (!L || !W) { App.toast('Saisir longueur et largeur', 'warning'); return; }
        points = [{x:0,y:0},{x:L,y:0},{x:L,y:W},{x:0,y:W}];
      } else if (shape === 'triangle') {
        const B = v('shape-b'), H = v('shape-h');
        if (!B || !H) { App.toast('Saisir base et hauteur', 'warning'); return; }
        points = [{x:0,y:0},{x:B,y:0},{x:0,y:H}];
      } else if (shape === 'forme-l') {
        const L1=v('shape-l1'),W1=v('shape-w1'),L2=v('shape-l2'),W2=v('shape-w2');
        if (!L1||!W1||!L2||!W2) { App.toast('Saisir toutes les dimensions', 'warning'); return; }
        points = [
          {x:0,y:0},{x:L1,y:0},{x:L1,y:W2},
          {x:L2,y:W2},{x:L2,y:W1},{x:0,y:W1}
        ];
      }
      this._points = points;
      this._mode = 'polygone';
      document.getElementById('poly-shape-inputs').style.display = 'none';
      document.querySelectorAll('[data-shape]').forEach(b => b.style.border = '2px solid var(--border,#e2e8f0)');
      this._render();
      App.toast('✅ Points calculés — vérifiez et ajustez si besoin', 'success');
    },

    init(containerId, options) {
      this._containerId = containerId;
      this._container = document.getElementById(containerId);
      this._options = options || {};

      if (!this._container) {
        if (window.App && typeof window.App.toast === 'function') {
          window.App.toast('Conteneur metrage introuvable', 'error');
        }
        return;
      }

      this._container.innerHTML = this.getHTML();
      this._bind();
      this._render();
    },

    getHTML() {
      return `
        <div class="poly-metrage" style="display:flex;flex-direction:column;gap:16px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word;overflow:visible">
          <div class="calc-section-title">Mode de metrage</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn-secondary" data-poly-action="mode-polygone">Mode polygone</button>
            <button type="button" class="btn btn-secondary" data-poly-action="mode-segments">Mode segments</button>
            <button type="button" class="btn btn-secondary" data-poly-action="reset">Reinitialiser</button>
          </div>

          <div id="poly-shapes" style="background:var(--bg-secondary,#f8f9fa);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:.8rem;font-weight:600;color:var(--text-secondary,#666);text-transform:uppercase;letter-spacing:.05em">Démarrage rapide — choisir une forme</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button type="button" data-shape="rectangle" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;border-radius:8px;border:2px solid var(--border,#e2e8f0);background:var(--bg-card,#fff);cursor:pointer;font-size:.8rem;color:var(--text-main,#111);min-width:80px">
                <span style="font-size:1.4rem">▬</span>Rectangle
              </button>
              <button type="button" data-shape="triangle" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;border-radius:8px;border:2px solid var(--border,#e2e8f0);background:var(--bg-card,#fff);cursor:pointer;font-size:.8rem;color:var(--text-main,#111);min-width:80px">
                <span style="font-size:1.4rem">◭</span>Triangle
              </button>
              <button type="button" data-shape="forme-l" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;border-radius:8px;border:2px solid var(--border,#e2e8f0);background:var(--bg-card,#fff);cursor:pointer;font-size:.8rem;color:var(--text-main,#111);min-width:80px">
                <span style="font-size:1.4rem">⌐</span>Forme en L
              </button>
              <button type="button" data-shape="libre" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;border-radius:8px;border:2px solid var(--border,#e2e8f0);background:var(--bg-card,#fff);cursor:pointer;font-size:.8rem;color:var(--text-main,#111);min-width:80px">
                <span style="font-size:1.4rem">✏️</span>Libre
              </button>
            </div>
            <div id="poly-shape-inputs" style="display:none;flex-direction:column;gap:8px"></div>
          </div>

          <div id="poly-canvas-wrap" style="display:none;flex-direction:column;gap:10px">
            <div style="font-size:.8rem;color:var(--text-secondary,#666)">
              📍 Cliquez sur la grille pour poser vos points — la surface se trace automatiquement
            </div>
            <canvas id="poly-canvas" style="border:1px solid var(--border,#e2e8f0);border-radius:10px;cursor:crosshair;touch-action:none;width:100%;max-width:600px;height:320px;display:block"></canvas>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              <button type="button" id="poly-canvas-undo" style="padding:7px 14px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:transparent;cursor:pointer;font-size:.85rem">↩ Annuler dernier point</button>
              <button type="button" id="poly-canvas-reset" style="padding:7px 14px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:transparent;cursor:pointer;font-size:.85rem">🗑 Effacer tout</button>
              <button type="button" id="poly-canvas-done" style="padding:7px 16px;border-radius:8px;border:none;background:var(--accent,#2563eb);color:#fff;font-weight:600;cursor:pointer;font-size:.85rem">✓ Terminer et calculer</button>
              <span id="poly-canvas-info" style="font-size:.8rem;color:var(--text-secondary,#666)">0 point posé</span>
            </div>
          </div>

          <div data-poly-panel="polygone">
            <div class="calc-section-title">Points du polygone</div>
            <div style="overflow:auto;border:1px solid var(--border);border-radius:var(--r-md,8px);background:var(--bg-card)">
              <table style="width:100%;border-collapse:collapse;min-width:460px">
                <thead>
                  <tr style="color:var(--text);border-bottom:1px solid var(--border)">
                    <th style="padding:8px;text-align:left;width:52px">#</th>
                    <th style="padding:8px;text-align:left">X (m)</th>
                    <th style="padding:8px;text-align:left">Y (m)</th>
                    <th style="padding:8px;text-align:right;width:110px">Supprimer</th>
                  </tr>
                </thead>
                <tbody data-poly-points></tbody>
              </table>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
              <button type="button" class="btn btn-secondary" data-poly-action="add-point">Ajouter un point</button>
            </div>
          </div>

          <div data-poly-panel="segments" style="display:none">
            <div class="calc-section-title">Lineaire segmente</div>
            <div style="overflow:auto;border:1px solid var(--border);border-radius:var(--r-md,8px);background:var(--bg-card)">
              <table style="width:100%;border-collapse:collapse;min-width:460px">
                <thead>
                  <tr style="color:var(--text);border-bottom:1px solid var(--border)">
                    <th style="padding:8px;text-align:left;width:52px">#</th>
                    <th style="padding:8px;text-align:left">Longueur (m)</th>
                    <th style="padding:8px;text-align:left">Largeur (m)</th>
                    <th style="padding:8px;text-align:right;width:110px">Supprimer</th>
                  </tr>
                </thead>
                <tbody data-poly-segments></tbody>
              </table>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
              <button type="button" class="btn btn-secondary" data-poly-action="add-segment">Ajouter un segment</button>
            </div>
          </div>

          <div>
            <div class="calc-section-title">Deductions d'obstacles</div>
            <div data-poly-deductions style="display:flex;flex-direction:column;gap:8px;box-sizing:border-box;width:100%;max-width:100%;word-wrap:break-word;overflow-wrap:break-word"></div>
            <button type="button" class="btn btn-secondary" data-poly-action="add-deduction" style="margin-top:10px">Ajouter une deduction</button>
          </div>

          <div class="calc-input-group">
            <label>Pente (%)</label>
            <input type="number" step="0.1" min="0" data-poly-pente value="0" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:9px 12px;color:var(--text);max-width:180px">
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:12px">
              <div style="font-size:12px;color:var(--text-secondary,var(--text))">Surface projetee</div>
              <div data-poly-surface-projetee style="font-size:22px;font-weight:800;color:var(--accent)">0,00 m2</div>
            </div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:12px">
              <div style="font-size:12px;color:var(--text-secondary,var(--text))">Deductions</div>
              <div data-poly-surface-deductions style="font-size:22px;font-weight:800;color:var(--text)">0,00 m2</div>
            </div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:12px">
              <div style="font-size:12px;color:var(--text-secondary,var(--text))">Surface reelle</div>
              <div data-poly-surface-reelle style="font-size:22px;font-weight:800;color:var(--accent)">0,00 m2</div>
            </div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:12px">
              <div style="font-size:12px;color:var(--text-secondary,var(--text))">Perimetre / lineaire</div>
              <div data-poly-perimetre style="font-size:22px;font-weight:800;color:var(--text)">0,00 ml</div>
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn-primary" data-poly-action="use-surface">Utiliser cette surface</button>
          </div>
        </div>
      `;
    },

    calcSurface(points) {
      if (!Array.isArray(points) || points.length < 3) return 0;
      let sum = 0;
      for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];
        sum += n(current.x, 0) * n(next.y, 0) - n(next.x, 0) * n(current.y, 0);
      }
      return Math.abs(sum) / 2;
    },

    calcPerimetre(points) {
      if (!Array.isArray(points) || points.length < 2) return 0;
      let total = 0;
      for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];
        const dx = n(next.x, 0) - n(current.x, 0);
        const dy = n(next.y, 0) - n(current.y, 0);
        total += Math.sqrt(dx * dx + dy * dy);
      }
      return total;
    },

    _initCanvas() {
      const canvas = this._container.querySelector('#poly-canvas');
      if (!canvas) return;
      this._canvas = canvas;
      this._canvasPoints = [];
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      this._ctx = canvas.getContext('2d');
      this._ctx.scale(dpr, dpr);
      this._cw = rect.width;
      this._ch = rect.height;
      this._drawCanvas();
      canvas.addEventListener('click', e => {
        const pt = this._canvasCoords(e);
        const pts = this._canvasPoints;
        if (pts.length >= 3) {
          const dx = pt.xm - pts[0].xm;
          const dy = pt.ym - pts[0].ym;
          if (Math.sqrt(dx*dx + dy*dy) <= 1.5) {
            this._points = pts.map(p => ({ x: p.xm, y: p.ym }));
            this._container.querySelector('#poly-canvas-wrap').style.display = 'none';
            this._container.querySelector('[data-poly-panel="polygone"]').style.display = '';
            this._mode = 'polygone';
            this._render();
            App.toast('✅ Polygone fermé — ' + pts.length + ' points importés', 'success');
            return;
          }
        }
        pts.push(pt);
        this._updateCanvasInfo();
        this._drawCanvas();
      });
      canvas.addEventListener('pointermove', e => {
        if (this._canvasPoints.length === 0) return;
        this._drawCanvas(this._canvasCoords(e));
      });
      canvas.addEventListener('pointerleave', () => this._drawCanvas());
      this._container.querySelector('#poly-canvas-undo').onclick = () => {
        this._canvasPoints.pop();
        this._updateCanvasInfo();
        this._drawCanvas();
      };
      this._container.querySelector('#poly-canvas-reset').onclick = () => {
        this._canvasPoints = [];
        this._updateCanvasInfo();
        this._drawCanvas();
      };
      this._container.querySelector('#poly-canvas-done').onclick = () => {
        if (this._canvasPoints.length < 3) { App.toast('Posez au moins 3 points', 'warning'); return; }
        this._points = this._canvasPoints.map(p => ({
          x: Math.round(p.xm * 100) / 100,
          y: Math.round(p.ym * 100) / 100
        }));
        this._container.querySelector('#poly-canvas-wrap').style.display = 'none';
        this._container.querySelector('[data-poly-panel="polygone"]').style.display = '';
        this._mode = 'polygone';
        this._render();
        App.toast('✅ Surface tracée — ' + this._points.length + ' points importés', 'success');
      };
    },

    _canvasCoords(e) {
      const rect = this._canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const margin = 30;
      const scale = this._canvasScale || 1;
      const xm = Math.max(0, Math.round((px - margin) / scale));
      const ym = Math.max(0, Math.round((py - margin) / scale));
      const pxSnap = margin + xm * scale;
      const pySnap = margin + ym * scale;
      return { px: pxSnap, py: pySnap, xm, ym };
    },

    _drawCanvas(preview) {
      if (!this._ctx) return;
      const ctx = this._ctx;
      const W = this._cw, H = this._ch;
      const margin = 30;
      const pts = this._canvasPoints;
      let maxM = 20;
      if (pts.length > 0) {
        const maxX = Math.max(...pts.map(p => p.xm));
        const maxY = Math.max(...pts.map(p => p.ym));
        maxM = Math.max(maxX + 2, maxY + 2, 20);
      }
      const scale = Math.min(W - margin * 2, H - margin * 2) / maxM;
      this._canvasScale = scale;
      const toX = m => margin + m * scale;
      const toY = m => margin + m * scale;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card') || '#fff';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(148,163,184,.25)';
      ctx.lineWidth = 1;
      for (let m = 0; m <= maxM + 1; m++) {
        const x = toX(m); const y = toY(m);
        if (x <= W - margin) { ctx.beginPath(); ctx.moveTo(x, margin); ctx.lineTo(x, H - margin); ctx.stroke(); }
        if (y <= H - margin) { ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(W - margin, y); ctx.stroke(); }
      }
      ctx.fillStyle = 'rgba(100,116,139,.7)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      for (let m = 0; m <= maxM; m += 5) {
        const x = toX(m);
        if (x <= W - margin) ctx.fillText(m + 'm', x, H - margin + 14);
      }
      ctx.textAlign = 'right';
      for (let m = 0; m <= maxM; m += 5) {
        const y = toY(m);
        if (y <= H - margin) ctx.fillText(m + 'm', margin - 4, y + 4);
      }
      if (pts.length === 0) return;
      if (pts.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(toX(pts[0].xm), toY(pts[0].ym));
        pts.forEach(p => ctx.lineTo(toX(p.xm), toY(p.ym)));
        ctx.closePath();
        ctx.fillStyle = 'rgba(37,99,235,.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(37,99,235,.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(toX(pts[0].xm), toY(pts[0].ym));
        pts.forEach(p => ctx.lineTo(toX(p.xm), toY(p.ym)));
        ctx.strokeStyle = 'rgba(37,99,235,.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      if (preview && pts.length > 0) {
        const last = pts[pts.length - 1];
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(toX(last.xm), toY(last.ym));
        ctx.lineTo(preview.px, preview.py);
        ctx.strokeStyle = 'rgba(37,99,235,.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
        const dx = preview.xm - last.xm;
        const dy = preview.ym - last.ym;
        const dist = Math.round(Math.sqrt(dx*dx + dy*dy) * 10) / 10;
        if (dist > 0) {
          const labelX = (toX(last.xm) + preview.px) / 2;
          const labelY = (toY(last.ym) + preview.py) / 2 - 10;
          ctx.save();
          ctx.fillStyle = 'rgba(30,30,30,.75)';
          const txt = dist + ' m';
          ctx.font = 'bold 12px system-ui';
          const tw = ctx.measureText(txt).width;
          ctx.beginPath();
          ctx.roundRect(labelX - tw/2 - 6, labelY - 14, tw + 12, 20, 4);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(txt, labelX, labelY);
          ctx.restore();
        }
        if (pts.length >= 3) {
          const dx = preview.xm - pts[0].xm;
          const dy = preview.ym - pts[0].ym;
          if (Math.sqrt(dx*dx + dy*dy) <= 1.5) {
            ctx.beginPath();
            ctx.arc(toX(pts[0].xm), toY(pts[0].ym), 10, 0, Math.PI * 2);
            ctx.strokeStyle = '#16a34a';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.fillStyle = '#16a34a';
            ctx.font = 'bold 11px system-ui';
            ctx.textAlign = 'left';
            ctx.fillText('Cliquer pour fermer', toX(pts[0].xm) + 14, toY(pts[0].ym) + 4);
          }
        }
      }
      pts.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(toX(p.xm), toY(p.ym), 5, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#16a34a' : '#2563eb';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    },

    _updateCanvasInfo() {
      const el = this._container.querySelector('#poly-canvas-info');
      if (!el) return;
      const n = this._canvasPoints.length;
      el.textContent = n === 0 ? '0 point posé' : n + ' point' + (n > 1 ? 's' : '') + ' posé' + (n > 1 ? 's' : '') + (n >= 3 ? ' — prêt à terminer' : '');
    },

    reset() {
      this._mode = 'polygone';
      this._points = [];
      this._segments = [{ longueur: 5, largeur: 1 }];
      this._deductions = [];
      this._pente = 0;
      if (this._container) {
        this._container.querySelectorAll('[data-shape]').forEach(b => b.style.border = '2px solid var(--border,#e2e8f0)');
        const box = this._container.querySelector('#poly-shape-inputs');
        if (box) box.style.display = 'none';
        const wrap = this._container.querySelector('#poly-canvas-wrap');
        if (wrap) wrap.style.display = 'none';
        const panel = this._container.querySelector('[data-poly-panel="polygone"]');
        if (panel) panel.style.display = '';
      }
      this._render();
    },

    getPoints() {
      return this._points.map(point => ({ x: n(point.x, 0), y: n(point.y, 0) }));
    },

    getSurface() {
      return this._getComputed().surfaceReelle;
    },

    _bind() {
      this._container.querySelectorAll('[data-shape]').forEach(btn => {
        btn.addEventListener('click', () => {
          this._container.querySelectorAll('[data-shape]').forEach(b => b.style.border = '2px solid var(--border,#e2e8f0)');
          btn.style.border = '2px solid var(--accent,#2563eb)';
          this._showShapeInputs(btn.dataset.shape);
          if (btn.dataset.shape !== 'libre') {
            this._mode = 'polygone';
            this._render();
          }
        });
      });

      this._container.addEventListener('click', event => {
        const target = event.target.closest('[data-poly-action]');
        if (!target) return;

        const action = target.getAttribute('data-poly-action');
        const index = parseInt(target.getAttribute('data-index'), 10);

        if (action === 'mode-polygone') this._mode = 'polygone';
        if (action === 'mode-segments') this._mode = 'segments';
        if (action === 'add-point') this._addPoint();
        if (action === 'remove-point') this._points.splice(index, 1);
        if (action === 'add-segment') this._segments.push({ longueur: 1, largeur: 1 });
        if (action === 'remove-segment') this._segments.splice(index, 1);
        if (action === 'add-deduction') this._deductions.push({ label: 'Obstacle', forme: 'rectangle', largeur: 1, longueur: 1, rayon: 0.5 });
        if (action === 'remove-deduction') this._deductions.splice(index, 1);
        if (action === 'reset') this.reset();
        if (action === 'use-surface') this._useSurface();

        if (action !== 'use-surface' && action !== 'reset') this._render();
      });

      this._container.addEventListener('input', event => {
        const target = event.target;
        const type = target.getAttribute('data-poly-field');
        const index = parseInt(target.getAttribute('data-index'), 10);

        if (type === 'point-x') this._points[index].x = n(target.value, 0);
        if (type === 'point-y') this._points[index].y = n(target.value, 0);
        if (type === 'segment-longueur') this._segments[index].longueur = n(target.value, 0);
        if (type === 'segment-largeur') this._segments[index].largeur = n(target.value, 0);
        if (type === 'deduction-label') this._deductions[index].label = target.value;
        if (type === 'deduction-forme') this._deductions[index].forme = target.value;
        if (type === 'deduction-longueur') this._deductions[index].longueur = n(target.value, 0);
        if (type === 'deduction-largeur') this._deductions[index].largeur = n(target.value, 0);
        if (type === 'deduction-rayon') this._deductions[index].rayon = n(target.value, 0);
        if (target.hasAttribute('data-poly-pente')) this._pente = Math.max(0, n(target.value, 0));

        this._renderResults();
        if (type && type.indexOf('deduction-') === 0) this._renderDeductions();
      });
    },

    _addPoint() {
      const last = this._points[this._points.length - 1] || { x: 0, y: 0 };
      this._points.push({ x: n(last.x, 0) + 1, y: n(last.y, 0) });
    },

    _render() {
      if (!this._container) return;
      this._renderMode();
      this._renderPoints();
      this._renderSegments();
      this._renderDeductions();
      const penteInput = this._container.querySelector('[data-poly-pente]');
      if (penteInput) penteInput.value = String(this._pente);
      this._renderResults();
    },

    _renderMode() {
      const polyPanel = this._container.querySelector('[data-poly-panel="polygone"]');
      const segPanel = this._container.querySelector('[data-poly-panel="segments"]');
      if (polyPanel) polyPanel.style.display = this._mode === 'polygone' ? '' : 'none';
      if (segPanel) segPanel.style.display = this._mode === 'segments' ? '' : 'none';

      const btnPoly = this._container.querySelector('[data-poly-action="mode-polygone"]');
      const btnSeg = this._container.querySelector('[data-poly-action="mode-segments"]');
      if (btnPoly) btnPoly.className = this._mode === 'polygone' ? 'btn btn-primary' : 'btn btn-secondary';
      if (btnSeg) btnSeg.className = this._mode === 'segments' ? 'btn btn-primary' : 'btn btn-secondary';
    },

    _renderPoints() {
      const tbody = this._container.querySelector('[data-poly-points]');
      if (!tbody) return;
      tbody.innerHTML = this._points.map((point, index) => `
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px;color:var(--text)">${index + 1}</td>
          <td style="padding:8px">
            <input type="number" step="0.01" data-poly-field="point-x" data-index="${index}" value="${escapeAttr(point.x)}" style="width:100%;background:transparent;border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text)">
          </td>
          <td style="padding:8px">
            <input type="number" step="0.01" data-poly-field="point-y" data-index="${index}" value="${escapeAttr(point.y)}" style="width:100%;background:transparent;border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text)">
          </td>
          <td style="padding:8px;text-align:right">
            <button type="button" class="btn btn-secondary btn-sm" data-poly-action="remove-point" data-index="${index}">Supprimer</button>
          </td>
        </tr>
      `).join('');
    },

    _renderSegments() {
      const tbody = this._container.querySelector('[data-poly-segments]');
      if (!tbody) return;
      tbody.innerHTML = this._segments.map((segment, index) => `
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px;color:var(--text)">${index + 1}</td>
          <td style="padding:8px">
            <input type="number" min="0" step="0.01" data-poly-field="segment-longueur" data-index="${index}" value="${escapeAttr(segment.longueur)}" style="width:100%;background:transparent;border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text)">
          </td>
          <td style="padding:8px">
            <input type="number" min="0" step="0.01" data-poly-field="segment-largeur" data-index="${index}" value="${escapeAttr(segment.largeur)}" style="width:100%;background:transparent;border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text)">
          </td>
          <td style="padding:8px;text-align:right">
            <button type="button" class="btn btn-secondary btn-sm" data-poly-action="remove-segment" data-index="${index}">Supprimer</button>
          </td>
        </tr>
      `).join('');
    },

    _renderDeductions() {
      const wrapper = this._container.querySelector('[data-poly-deductions]');
      if (!wrapper) return;

      if (!this._deductions.length) {
        wrapper.innerHTML = '<div style="font-size:13px;color:var(--text-secondary,var(--text));padding:8px 0">Aucune deduction ajoutee.</div>';
        this._renderResults();
        return;
      }

      wrapper.innerHTML = this._deductions.map((deduction, index) => {
        const forme = deduction.forme || 'rectangle';
        const dims = forme === 'cercle'
          ? `
            <div class="calc-input-group">
              <label>Rayon (m)</label>
              <input type="number" min="0" step="0.01" data-poly-field="deduction-rayon" data-index="${index}" value="${escapeAttr(deduction.rayon)}" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text)">
            </div>`
          : `
            <div class="calc-input-group">
              <label>Longueur (m)</label>
              <input type="number" min="0" step="0.01" data-poly-field="deduction-longueur" data-index="${index}" value="${escapeAttr(deduction.longueur)}" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text)">
            </div>
            <div class="calc-input-group">
              <label>Largeur (m)</label>
              <input type="number" min="0" step="0.01" data-poly-field="deduction-largeur" data-index="${index}" value="${escapeAttr(deduction.largeur)}" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text)">
            </div>`;

        return `
          <div style="border:1px solid var(--border);border-radius:var(--r-md,8px);padding:10px;background:var(--bg-card)">
            <div style="display:grid;grid-template-columns:1fr 140px auto;gap:8px;align-items:end">
              <div class="calc-input-group">
                <label>Label</label>
                <input type="text" data-poly-field="deduction-label" data-index="${index}" value="${escapeAttr(deduction.label)}" placeholder="Piscine, maison..." style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text)">
              </div>
              <div class="calc-input-group">
                <label>Forme</label>
                <select data-poly-field="deduction-forme" data-index="${index}" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-sm,6px);padding:7px;color:var(--text)">
                  <option value="rectangle"${forme === 'rectangle' ? ' selected' : ''}>Rectangle</option>
                  <option value="cercle"${forme === 'cercle' ? ' selected' : ''}>Cercle</option>
                </select>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" data-poly-action="remove-deduction" data-index="${index}">Supprimer</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:8px">
              ${dims}
            </div>
          </div>
        `;
      }).join('');

      this._renderResults();
    },

    _renderResults() {
      const computed = this._getComputed();
      this._setText('[data-poly-surface-projetee]', `${fmt(computed.surfaceProjetee)} m2`);
      this._setText('[data-poly-surface-deductions]', `${fmt(computed.surfaceDeductions)} m2`);
      this._setText('[data-poly-surface-reelle]', `${fmt(computed.surfaceReelle)} m2`);
      this._setText('[data-poly-perimetre]', `${fmt(computed.perimetre)} ml`);
    },

    _getComputed() {
      let surfaceProjetee = 0;
      let perimetre = 0;

      if (this._mode === 'segments') {
        surfaceProjetee = this._segments.reduce((sum, segment) => {
          return sum + Math.max(0, n(segment.longueur, 0)) * Math.max(0, n(segment.largeur, 0));
        }, 0);
        perimetre = this._segments.reduce((sum, segment) => sum + Math.max(0, n(segment.longueur, 0)), 0);
      } else {
        surfaceProjetee = this.calcSurface(this._points);
        perimetre = this.calcPerimetre(this._points);
      }

      const surfaceDeductions = this._deductions.reduce((sum, deduction) => sum + this._calcDeduction(deduction), 0);
      const surfaceNetteProjetee = Math.max(0, surfaceProjetee - surfaceDeductions);
      const angle = Math.atan(Math.max(0, n(this._pente, 0)) / 100);
      const surfaceReelle = surfaceNetteProjetee / Math.cos(angle);

      return {
        surfaceProjetee: round2(surfaceProjetee),
        surfaceDeductions: round2(surfaceDeductions),
        surfaceNetteProjetee: round2(surfaceNetteProjetee),
        surfaceReelle: round2(surfaceReelle),
        perimetre: round2(perimetre),
      };
    },

    _calcDeduction(deduction) {
      if (!deduction) return 0;
      if (deduction.forme === 'cercle') {
        const rayon = Math.max(0, n(deduction.rayon, 0));
        return Math.PI * rayon * rayon;
      }
      return Math.max(0, n(deduction.longueur, 0)) * Math.max(0, n(deduction.largeur, 0));
    },

    _setText(selector, value) {
      const el = this._container.querySelector(selector);
      if (el) el.textContent = value;
    },

    _useSurface() {
      const computed = this._getComputed();
      if (this._options && typeof this._options.onSurface === 'function') {
        this._options.onSurface(computed.surfaceReelle, computed.perimetre, computed);
      }
    },
  };

  function n(value, def) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : (def || 0);
  }

  function round2(value) {
    return Math.round((value || 0) * 100) / 100;
  }

  function fmt(value) {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  function escapeAttr(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  window.PolygoneMetrage = PolygoneMetrage;
})();
