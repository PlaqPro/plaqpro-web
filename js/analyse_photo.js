/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel A. — AATB — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Analyse Photo Chantier (Vision IA)
//  analyse_photo.js
// ============================================================

const AnalysePhoto = {

  _currentFile:     null,
  _currentAnalysis: null,
  _pendingBase64:   null,
  HIST_KEY: 'plaqpro_analyses_photo',

  // ── Initialisation ────────────────────────────────────────
  init() {
    this._injectStyles();
  },

  _getPlatform() {
    const ua = navigator.userAgent;
    const isIOS     = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    return { isIOS, isAndroid, isMobile: isIOS || isAndroid, isDesktop: !isIOS && !isAndroid };
  },


  // ── Modal Scan Facture Fournisseur ────────────────────────
  showModalFournisseur() {
    const existing = document.getElementById('scan-four-overlay');
    if (existing) existing.remove();

    const plat = this._getPlatform();
    const overlay = document.createElement('div');
    overlay.id = 'scan-four-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px';
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div class="pm-modal" id="sf-modal-box">
        <div class="pm-modal-header">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:22px">🧾</span>
            <div>
              <div style="font-weight:700;font-size:15px;color:var(--text-primary)">Scan facture fournisseur</div>
              <div style="font-size:12px;color:var(--text-tertiary)">OCR IA — extraction automatique des données</div>
            </div>
          </div>
          <button class="pm-close" onclick="document.getElementById('scan-four-overlay').remove()">✕</button>
        </div>

        <div id="sf-step-input" class="pm-step">
          <div class="pm-section-title">📷 Photo ou scan de la facture</div>
          <div id="sf-input-zone">
            ${plat.isIOS ? `
              <button class="pm-btn-camera" onclick="AnalysePhoto._startCameraFour()">
                <span style="font-size:28px">📷</span>
                <span style="font-size:15px;font-weight:700">Prendre en photo</span>
              </button>
              <label class="pm-btn-gallery">
                <input type="file" accept="image/*" style="display:none" onchange="AnalysePhoto._handleFileFour(this.files[0])">
                <span style="font-size:18px">🖼</span> Depuis la galerie
              </label>
            ` : plat.isAndroid ? `
              <label class="pm-btn-camera">
                <input type="file" accept="image/*" capture="environment" style="display:none" onchange="AnalysePhoto._handleFileFour(this.files[0])">
                <span style="font-size:28px">📷</span>
                <span style="font-size:15px;font-weight:700">Prendre en photo</span>
              </label>
              <label class="pm-btn-gallery">
                <input type="file" accept="image/*" style="display:none" onchange="AnalysePhoto._handleFileFour(this.files[0])">
                <span style="font-size:18px">🖼</span> Depuis la galerie
              </label>
            ` : `
              <div class="pm-dropzone" id="sf-dropzone"
                ondragover="event.preventDefault();this.classList.add('pm-dz-active')"
                ondragleave="this.classList.remove('pm-dz-active')"
                ondrop="event.preventDefault();this.classList.remove('pm-dz-active');if(event.dataTransfer.files[0])AnalysePhoto._handleFileFour(event.dataTransfer.files[0])">
                <div style="font-size:36px;margin-bottom:8px">🧾</div>
                <div style="font-weight:600;font-size:14px;margin-bottom:6px">Glisser-déposer la facture</div>
                <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:14px">JPG, PNG, PDF scanné</div>
                <label class="btn btn-secondary" style="cursor:pointer;margin:0">
                  📁 Parcourir
                  <input type="file" accept="image/*" style="display:none" onchange="AnalysePhoto._handleFileFour(this.files[0])">
                </label>
              </div>
            `}
          </div>
          <div style="margin-top:12px;padding:9px 13px;background:rgba(247,166,79,0.07);border:1px solid rgba(247,166,79,0.2);border-radius:8px;font-size:12px;color:var(--text-secondary)">
            💡 Photographiez la facture à plat sous bonne lumière — l'IA extrait fournisseur, montants, TVA automatiquement
          </div>
        </div>

        <div id="sf-step-loading" class="pm-step" style="display:none">
          <div style="text-align:center;padding:40px 20px">
            <div class="pm-spinner" style="border-top-color:#F7A64F;border-color:rgba(247,166,79,0.2)"></div>
            <div style="font-size:15px;font-weight:600;color:var(--text-primary);margin-top:16px">Lecture de la facture…</div>
            <div style="font-size:13px;color:var(--text-tertiary);margin-top:6px">L'IA extrait les données comptables</div>
          </div>
        </div>

        <div id="sf-step-result" class="pm-step" style="display:none"></div>
      </div>`;

    document.body.appendChild(overlay);
  },

  _sfSetStep(step) {
    ['input','loading','result'].forEach(s => {
      const el = document.getElementById('sf-step-' + s);
      if (el) el.style.display = s === step ? 'block' : 'none';
    });
  },

  _handleFileFour(file) {
    if (!file || !file.type.startsWith('image/')) { App.toast('Sélectionnez une image', 'error'); return; }
    this._sfSetStep('loading');
    this._compress(file).then(blob => this._toBase64(blob)).then(b64 => this._lancerFournisseur(b64)).catch(err => {
      this._sfSetStep('input');
      App.toast('Erreur : ' + err.message, 'error');
    });
  },

  _startCameraFour() {
    if (!navigator.mediaDevices?.getUserMedia) { App.toast('Caméra non disponible', 'error'); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(stream => {
      const camOv = document.createElement('div');
      camOv.id = 'sf-cam-overlay';
      camOv.style.cssText = 'position:fixed;inset:0;z-index:9700;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px';
      camOv.innerHTML = `
        <video id="sf-cam-video" autoplay playsinline style="max-width:100%;max-height:70vh;border-radius:8px"></video>
        <canvas id="sf-cam-canvas" style="display:none"></canvas>
        <div style="display:flex;gap:12px">
          <button class="btn btn-primary" style="padding:12px 28px;font-size:16px;background:#F7A64F;border-color:#F7A64F" onclick="AnalysePhoto._captureFour()">📸 Scanner</button>
          <button class="btn btn-secondary" onclick="AnalysePhoto._stopCamFour()">✕ Annuler</button>
        </div>`;
      document.body.appendChild(camOv);
      document.getElementById('sf-cam-video').srcObject = stream;
      this._camStream = stream;
    }).catch(() => App.toast('Permission caméra refusée', 'error'));
  },

  _captureFour() {
    const video = document.getElementById('sf-cam-video');
    const canvas = document.getElementById('sf-cam-canvas');
    if (!video || !canvas) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    this._stopCamFour();
    canvas.toBlob(blob => { if (blob) this._handleFileFour(new File([blob], 'facture.jpg', { type: 'image/jpeg' })); }, 'image/jpeg', 0.92);
  },

  _stopCamFour() {
    if (this._camStream) { this._camStream.getTracks().forEach(t => t.stop()); this._camStream = null; }
    const ov = document.getElementById('sf-cam-overlay');
    if (ov) ov.remove();
  },

  async _lancerFournisseur(b64) {
    const _gcFour = groqConfig();
    if (!_gcFour) { this._sfSetStep('input'); App.toast('Clé Groq requise en local — configurez-la dans Paramètres', 'error'); return; }
    const prompt = `Tu es expert-comptable français. Analyse cette image de facture fournisseur BTP.
Extrais les données et réponds UNIQUEMENT en JSON valide, sans texte avant ni après :
{
  "fournisseur": "nom du fournisseur",
  "siret_fournisseur": "SIRET si visible, sinon vide",
  "numero_facture": "numéro de facture",
  "date_facture": "date au format YYYY-MM-DD",
  "montant_ht": 0,
  "taux_tva": 20,
  "montant_tva": 0,
  "montant_ttc": 0,
  "references_produits": ["ref1","ref2"],
  "chantier_suggere": "mention de chantier ou adresse si visible, sinon vide",
  "mode_paiement": "virement/chèque/CB/inconnu",
  "date_echeance": "YYYY-MM-DD ou vide"
}`;

    try {
      const res = await fetch(_gcFour.url, {
        method: 'POST',
        headers: _gcFour.headers,
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } },
            { type: 'text', text: prompt },
          ]}],
          temperature: 0.05, max_tokens: 512,
        }),
      });
      if (!res.ok) throw new Error('Groq HTTP ' + res.status);
      const data = await res.json();
      const raw  = (data.choices?.[0]?.message?.content || '').trim();
      const j0 = raw.indexOf('{'); const j1 = raw.lastIndexOf('}');
      if (j0 === -1 || j1 === -1) throw new Error('Réponse JSON introuvable');
      this._showResultsFournisseur(JSON.parse(raw.slice(j0, j1 + 1)));
    } catch(err) {
      this._sfSetStep('input');
      App.toast('Erreur OCR : ' + err.message, 'error');
    }
  },

  _showResultsFournisseur(data) {
    this._sfSetStep('result');
    const result = document.getElementById('sf-step-result');
    if (!result) return;

    const chantiers = (DB.chantiers || []);
    const chanOpts  = chantiers.map(c =>
      `<option value="${c.id}">${c.nom || c.adresse || ('Chantier #' + c.id)}</option>`).join('');

    const fld = (id, label, val, type = 'text') => `
      <div style="display:flex;flex-direction:column;gap:3px">
        <label style="font-size:11px;color:var(--text-tertiary);font-weight:700;text-transform:uppercase;letter-spacing:.04em">${label}</label>
        <input type="${type}" id="sf-${id}" value="${String(val || '').replace(/"/g,'&quot;')}"
          style="padding:7px 10px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:7px;font-size:13px;outline:none;transition:border-color .2s"
          onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
      </div>`;

    result.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:10px 12px;background:rgba(45,212,160,0.08);border:1px solid rgba(45,212,160,0.2);border-radius:8px">
        <span style="font-size:18px">✅</span>
        <div style="font-size:13px;font-weight:600;color:#2DD4A0">Facture analysée — vérifiez et corrigez si nécessaire</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        ${fld('fournisseur','Fournisseur', data.fournisseur)}
        ${fld('siret','SIRET fournisseur', data.siret_fournisseur)}
        ${fld('numero','N° Facture', data.numero_facture)}
        ${fld('date','Date facture', data.date_facture, 'date')}
        ${fld('echeance','Date échéance', data.date_echeance, 'date')}
        ${fld('mode-paiement','Mode paiement', data.mode_paiement)}
      </div>

      <!-- Montants -->
      <div style="background:var(--bg-tertiary);border-radius:10px;padding:12px 14px;margin-bottom:12px">
        <div style="font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Montants</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          ${fld('ht','Montant HT (€)', data.montant_ht, 'number')}
          <div style="display:flex;flex-direction:column;gap:3px">
            <label style="font-size:11px;color:var(--text-tertiary);font-weight:700;text-transform:uppercase;letter-spacing:.04em">TVA %</label>
            <input type="number" id="sf-tva" value="${data.taux_tva || 20}"
              style="padding:7px 10px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:7px;font-size:13px;outline:none"
              onchange="const ht=parseFloat(document.getElementById('sf-ht').value)||0;const tvaAmt=ht*(this.value/100);document.getElementById('sf-tva-mt').value=tvaAmt.toFixed(2);document.getElementById('sf-ttc').value=(ht+tvaAmt).toFixed(2)">
          </div>
          ${fld('tva-mt','TVA (€)', data.montant_tva, 'number')}
        </div>
        <div style="margin-top:10px;padding:10px 14px;background:rgba(247,166,79,0.1);border:1px solid rgba(247,166,79,0.25);border-radius:8px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:13px;font-weight:700;color:var(--text-primary)">Total TTC</span>
          <input type="number" id="sf-ttc" value="${data.montant_ttc || 0}"
            style="width:110px;text-align:right;font-size:16px;font-weight:900;color:#F7A64F;background:transparent;border:none;outline:none;font-family:var(--font-mono)">
        </div>
      </div>

      <!-- Références produits -->
      ${data.references_produits?.length ? `
        <div style="margin-bottom:12px;padding:10px 12px;background:var(--bg-tertiary);border-radius:8px">
          <div style="font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;margin-bottom:6px">Références produits</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${data.references_produits.map(r => `<span style="padding:2px 8px;border-radius:4px;font-size:11px;background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-secondary)">${r}</span>`).join('')}
          </div>
        </div>` : ''}

      <!-- Chantier -->
      <div style="margin-bottom:16px">
        <label style="font-size:11px;color:var(--text-tertiary);font-weight:700;text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:5px">Rattacher à un chantier</label>
        <select id="sf-chantier" style="width:100%;padding:8px 10px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;font-size:13px">
          <option value="">— Aucun chantier —</option>
          ${chanOpts}
        </select>
        ${data.chantier_suggere ? `<div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">💡 Suggestion IA : "${data.chantier_suggere}"</div>` : ''}
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary" style="flex:1" onclick="AnalysePhoto.showModalFournisseur()">↩ Recommencer</button>
        <button class="btn btn-primary" style="flex:2;background:#F7A64F;border-color:#F7A64F" onclick="AnalysePhoto._sauvegarderDepense()">💾 Enregistrer la dépense</button>
      </div>`;
  },

  _sauvegarderDepense() {
    const get = id => document.getElementById('sf-' + id)?.value?.trim() || '';
    const depense = {
      id:              Date.now(),
      fournisseur:     get('fournisseur'),
      siret:           get('siret'),
      numero:          get('numero'),
      date:            get('date') || new Date().toISOString().slice(0, 10),
      dateEcheance:    get('echeance'),
      modePaiement:    get('mode-paiement'),
      montantHT:       parseFloat(get('ht'))     || 0,
      tauxTVA:         parseFloat(document.getElementById('sf-tva')?.value) || 20,
      montantTVA:      parseFloat(get('tva-mt')) || 0,
      montantTTC:      parseFloat(get('ttc'))    || 0,
      chantierId:      document.getElementById('sf-chantier')?.value || null,
      createdAt:       new Date().toISOString(),
    };
    if (!depense.fournisseur && !depense.montantTTC) {
      App.toast('Renseignez au moins le fournisseur ou le montant', 'error'); return;
    }
    const list = AnalysePhoto._getDepenses();
    list.unshift(depense);
    localStorage.setItem('plaqpro_depenses', JSON.stringify(list));
    document.getElementById('scan-four-overlay')?.remove();
    App.toast('Dépense enregistrée — ' + (depense.fournisseur || 'Fournisseur') + ' ' + new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(depense.montantTTC), 'success');
  },

  _getDepenses() {
    try { return JSON.parse(localStorage.getItem('plaqpro_depenses') || '[]'); } catch { return []; }
  },

  // ── Modal principale ──────────────────────────────────────
  showModal() {
    this._currentFile     = null;
    this._currentAnalysis = null;
    const existing = document.getElementById('photo-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'photo-modal-overlay';
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

    const hist = this.getHistory();
    const histHTML = hist.length ? `
      <div class="pm-section-title">📂 Analyses récentes</div>
      <div id="pm-history" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">
        ${hist.slice(0, 5).map((h, i) => `
          <div style="text-align:center;cursor:pointer;padding:6px;background:var(--bg-tertiary);border-radius:var(--radius-md);
               border:1px solid var(--border);transition:border-color .15s;width:72px"
               onclick="AnalysePhoto._useHistory(${i})"
               onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--border)'">
            <div style="width:56px;height:42px;border-radius:4px;overflow:hidden;margin:0 auto 4px">
              <img src="${h.thumb}" style="width:100%;height:100%;object-fit:cover">
            </div>
            <div style="font-size:10px;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${h.type_piece || '?'}
            </div>
            <div style="font-size:9px;color:var(--text-tertiary)">${h.date}</div>
          </div>`).join('')}
      </div>` : '';

    const plat = this._getPlatform();
    overlay.innerHTML = `
      <div class="pm-modal" id="pm-modal-box">
        <div class="pm-modal-header">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:22px">📸</span>
            <div>
              <div style="font-weight:700;font-size:15px;color:var(--text-primary)">Analyse photo chantier</div>
              <div style="font-size:12px;color:var(--text-tertiary)">IA Vision — détection automatique des surfaces & travaux</div>
            </div>
          </div>
          <button class="pm-close" onclick="document.getElementById('photo-modal-overlay').remove()">✕</button>
        </div>

        <div id="pm-step-input" class="pm-step">
          ${histHTML}
          <div class="pm-section-title">📷 Ajouter une photo</div>
          <div id="pm-input-zone">
            ${plat.isIOS ? `
              <button class="pm-btn-camera" onclick="AnalysePhoto._startCamera()">
                <span style="font-size:28px">📷</span>
                <span style="font-size:15px;font-weight:700">Prendre une photo</span>
                <span style="font-size:11px;color:rgba(255,255,255,0.7)">Utilise la caméra arrière</span>
              </button>
              <label class="pm-btn-gallery">
                <input type="file" accept="image/*" style="display:none"
                  onchange="AnalysePhoto.handleFile(this.files[0])">
                <span style="font-size:18px">🖼</span> Choisir depuis la galerie
              </label>
            ` : plat.isAndroid ? `
              <label class="pm-btn-camera">
                <input type="file" accept="image/*" capture="environment" style="display:none"
                  onchange="AnalysePhoto.handleFile(this.files[0])">
                <span style="font-size:28px">📷</span>
                <span style="font-size:15px;font-weight:700">Prendre une photo</span>
                <span style="font-size:11px;color:rgba(255,255,255,0.7)">Ouvre la caméra arrière</span>
              </label>
              <label class="pm-btn-gallery">
                <input type="file" accept="image/*" style="display:none"
                  onchange="AnalysePhoto.handleFile(this.files[0])">
                <span style="font-size:18px">🖼</span> Choisir depuis la galerie
              </label>
            ` : `
              <div id="pm-dropzone" class="pm-dropzone"
                ondragover="AnalysePhoto._onDragOver(event)"
                ondragleave="AnalysePhoto._onDragLeave(event)"
                ondrop="AnalysePhoto._onDrop(event)">
                <div style="font-size:36px;margin-bottom:8px">🖼</div>
                <div style="font-weight:600;font-size:14px;margin-bottom:6px">Glisser-déposer une photo</div>
                <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:14px">JPG, PNG, WEBP — max 10 Mo</div>
                <label class="btn btn-secondary" style="cursor:pointer;margin:0">
                  📁 Parcourir les fichiers
                  <input type="file" accept="image/*" style="display:none"
                    onchange="AnalysePhoto.handleFile(this.files[0])">
                </label>
              </div>
              <div style="margin-top:12px;padding:10px 14px;background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.2);
                   border-radius:var(--radius-md);font-size:12px;color:var(--text-secondary);display:flex;align-items:center;gap:8px">
                <span style="font-size:18px">📱</span>
                Pour prendre une photo directement, utilisez PlaqPro+ sur votre tablette ou smartphone
              </div>
            `}
          </div>

          <div id="pm-demo-bar" style="margin-top:16px;padding:10px 14px;background:rgba(255,155,50,0.08);
               border:1px solid rgba(255,155,50,0.2);border-radius:var(--radius-md);
               display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
            <span style="font-size:12px;color:var(--text-secondary)">
              ${localStorage.getItem('plaqpro_groq_key')
                ? '✅ Clé Groq configurée — analyse réelle activée'
                : '⚠️ Pas de clé Groq — <strong>mode démo</strong> disponible'}
            </span>
            ${!localStorage.getItem('plaqpro_groq_key')
              ? `<button class="btn btn-secondary" style="font-size:12px;padding:5px 10px"
                   onclick="AnalysePhoto._runDemo()">🎭 Lancer une démo</button>`
              : ''}
          </div>
        </div>

        <div id="pm-step-preview" class="pm-step" style="display:none"></div>
        <div id="pm-step-loading" class="pm-step" style="display:none">
          <div style="text-align:center;padding:40px 20px">
            <div class="pm-spinner"></div>
            <div style="font-size:15px;font-weight:600;color:var(--text-primary);margin-top:16px">Analyse en cours…</div>
            <div style="font-size:13px;color:var(--text-tertiary);margin-top:6px">L'IA examine votre photo de chantier</div>
          </div>
        </div>
        <div id="pm-step-result" class="pm-step" style="display:none"></div>
      </div>`;

    document.body.appendChild(overlay);
  },

  // ── Drag & Drop ───────────────────────────────────────────
  _onDragOver(e) {
    e.preventDefault();
    const dz = document.getElementById('pm-dropzone');
    if (dz) dz.classList.add('pm-dz-active');
  },
  _onDragLeave(e) {
    const dz = document.getElementById('pm-dropzone');
    if (dz) dz.classList.remove('pm-dz-active');
  },
  _onDrop(e) {
    e.preventDefault();
    const dz = document.getElementById('pm-dropzone');
    if (dz) dz.classList.remove('pm-dz-active');
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) this.handleFile(file);
  },

  // ── Sélection fichier ─────────────────────────────────────
  handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      App.toast('Sélectionnez une image (JPG, PNG, WEBP)', 'error');
      return;
    }
    this._currentFile = file;
    this._showPreview(file);
  },

  _showPreview(file) {
    this._setStep('preview');
    const preview = document.getElementById('pm-step-preview');
    if (!preview) return;

    const url = URL.createObjectURL(file);
    const sizeMo = (file.size / 1024 / 1024).toFixed(2);
    const quality = file.size > 2 * 1024 * 1024 ? '⚠️ Sera compressée' : '✅ Taille optimale';

    preview.innerHTML = `
      <div style="text-align:center;margin-bottom:16px">
        <img src="${url}" style="max-width:100%;max-height:240px;border-radius:var(--radius-md);
             object-fit:contain;border:1px solid var(--border)">
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;
           background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:16px;font-size:12px">
        <span style="color:var(--text-secondary)">📁 ${file.name}</span>
        <span style="color:var(--text-secondary)">${sizeMo} Mo</span>
        <span style="color:var(--text-tertiary)">${quality}</span>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-secondary" style="flex:1" onclick="AnalysePhoto.showModal()">↩ Reprendre</button>
        <button class="btn btn-primary" style="flex:2" onclick="AnalysePhoto._lancer()">
          ✨ Analyser avec l'IA
        </button>
      </div>`;
  },

  // ── Lancement analyse ─────────────────────────────────────
  async _lancer() {
    if (!this._currentFile) return;
    this._setStep('loading');
    try {
      const blob = await this._compress(this._currentFile);
      const b64  = await this._toBase64(blob);

      // Validation rapide : photo de chantier ?
      const valide = await this._validerImage(b64);
      if (!valide) {
        this._pendingBase64 = b64;
        this._setStep('preview');
        this._showWarningNotChantier(b64);
        return;
      }

      const result = await this._callGroq(b64);
      this._currentAnalysis = result;
      this._saveToHistory(this._currentFile, result);
      this._showResults(result);
    } catch (err) {
      this._setStep('input');
      App.toast('Erreur analyse : ' + (err.message || err), 'error');
    }
  },

  async _validerImage(base64) {
    const _gcVal = groqConfig();
    if (!_gcVal) return true;
    try {
      const r = await fetch(_gcVal.url, {
        method: 'POST',
        headers: _gcVal.headers,
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + base64 } },
            { type: 'text', text: 'Cette image montre-t-elle un chantier, une pièce, un mur, ou des travaux de bâtiment ? Réponds juste OUI ou NON.' }
          ]}],
          temperature: 0.1, max_tokens: 5
        })
      });
      const d = await r.json();
      const ans = (d.choices?.[0]?.message?.content || '').trim().toUpperCase();
      return ans.startsWith('OUI') || ans.startsWith('YES');
    } catch(e) { return true; }
  },

  _showWarningNotChantier(b64) {
    const preview = document.getElementById('pm-step-preview');
    if (!preview) return;
    preview.innerHTML = `
      <div style="text-align:center;margin-bottom:14px">
        <img src="data:image/jpeg;base64,${b64}" style="max-width:100%;max-height:180px;border-radius:var(--radius-md);
             object-fit:contain;border:1px solid var(--border)">
      </div>
      <div style="padding:12px 16px;background:rgba(247,91,91,0.08);border:1px solid rgba(247,91,91,0.25);
           border-radius:var(--radius-md);margin-bottom:16px">
        <div style="font-weight:600;color:#F75B5B;margin-bottom:5px">⚠️ Photo non reconnue comme chantier</div>
        <div style="font-size:13px;color:var(--text-secondary)">
          Cette image ne semble pas être une photo de chantier.<br>
          Voulez-vous quand même l'analyser ?
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-secondary" style="flex:1" onclick="AnalysePhoto.showModal()">↩ Choisir une autre photo</button>
        <button class="btn btn-primary" style="flex:2" onclick="AnalysePhoto._lancerForce()">Analyser quand même</button>
      </div>`;
  },

  async _lancerForce() {
    const b64 = this._pendingBase64;
    if (!b64) return;
    this._setStep('loading');
    try {
      const result = await this._callGroq(b64);
      this._currentAnalysis = result;
      if (this._currentFile) this._saveToHistory(this._currentFile, result);
      this._showResults(result);
    } catch(err) {
      this._setStep('input');
      App.toast('Erreur analyse : ' + (err.message || err), 'error');
    }
  },

  async _startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      App.toast('Caméra non disponible — choisissez depuis la galerie', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const camOverlay = document.createElement('div');
      camOverlay.id = 'pm-camera-overlay';
      camOverlay.style.cssText = 'position:fixed;inset:0;z-index:9600;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px';
      camOverlay.innerHTML = `
        <video id="pm-cam-video" autoplay playsinline style="max-width:100%;max-height:70vh;border-radius:8px"></video>
        <div style="display:flex;gap:12px">
          <button class="btn btn-primary" style="padding:12px 28px;font-size:16px" onclick="AnalysePhoto._captureFrame()">📸 Capturer</button>
          <button class="btn btn-secondary" onclick="AnalysePhoto._stopCamera()">✕ Annuler</button>
        </div>
        <canvas id="pm-cam-canvas" style="display:none"></canvas>`;
      document.body.appendChild(camOverlay);
      const video = document.getElementById('pm-cam-video');
      video.srcObject = stream;
      this._camStream = stream;
    } catch(err) {
      App.toast('Permission caméra refusée — choisissez depuis la galerie', 'error');
    }
  },

  _captureFrame() {
    const video  = document.getElementById('pm-cam-video');
    const canvas = document.getElementById('pm-cam-canvas');
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    this._stopCamera();
    canvas.toBlob(blob => {
      if (blob) this.handleFile(new File([blob], 'camera.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.85);
  },

  _stopCamera() {
    if (this._camStream) { this._camStream.getTracks().forEach(t => t.stop()); this._camStream = null; }
    const ov = document.getElementById('pm-camera-overlay');
    if (ov) ov.remove();
  },

  // ── Compression ───────────────────────────────────────────
  _compress(file) {
    return new Promise(resolve => {
      if (file.size <= 2 * 1024 * 1024) { resolve(file); return; }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio  = Math.min(1, Math.sqrt(2 * 1024 * 1024 / file.size));
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob || file); }, 'image/jpeg', 0.7);
      };
      img.src = url;
    });
  },

  // ── Base64 ────────────────────────────────────────────────
  _toBase64(blob) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload  = e => res(e.target.result.split(',')[1]);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });
  },

  // ── Appel Groq Vision ─────────────────────────────────────
  async _callGroq(base64) {
    const _gcPhoto = groqConfig();
    if (!_gcPhoto) throw new Error('Clé Groq requise en local — configurez-la dans Paramètres');
    const prompt = `Tu es expert en bâtiment français. Analyse cette photo de chantier.
Réponds UNIQUEMENT en JSON valide, sans texte avant ni après :
{
  "type_piece": "cuisine/salon/chambre/sdb/bureau/facade/jardin/couloir/cave/garage/...",
  "interieur_exterieur": "intérieur ou extérieur",
  "surfaces_estimees": { "murs_m2": 0, "plafond_m2": 0, "sol_m2": 0 },
  "hauteur_estimee": 2.5,
  "materiaux_visibles": ["placo","peinture","carrelage"],
  "etat": "neuf/bon/moyen/mauvais/a_renover",
  "travaux_necessaires": ["description courte 1","description courte 2"],
  "corps_metier": ["plaquiste","peintre","carreleur","electricien","plombier"],
  "budget_estime_ht": 0,
  "urgence": "faible/normale/urgente",
  "notes": "observations importantes en une phrase"
}`;

    const res = await fetch(_gcPhoto.url, {
      method: 'POST',
      headers: _gcPhoto.headers,
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + base64 } },
            { type: 'text', text: prompt },
          ],
        }],
        temperature: 0.1,
        max_tokens: 512,
      }),
    });

    if (!res.ok) throw new Error('Groq HTTP ' + res.status);
    const data = await res.json();
    const raw  = (data.choices?.[0]?.message?.content || '').trim();
    const j0   = raw.indexOf('{');
    const j1   = raw.lastIndexOf('}');
    if (j0 === -1 || j1 === -1) throw new Error('Réponse JSON introuvable');
    return JSON.parse(raw.slice(j0, j1 + 1));
  },

  // ── Mode démo ─────────────────────────────────────────────
  _runDemo() {
    this._setStep('loading');
    const demo = {
      type_piece: 'salon',
      interieur_exterieur: 'intérieur',
      surfaces_estimees: { murs_m2: 48, plafond_m2: 20, sol_m2: 20 },
      hauteur_estimee: 2.5,
      materiaux_visibles: ['placo BA13', 'peinture ancienne', 'parquet'],
      etat: 'moyen',
      travaux_necessaires: ['Refaire les joints de plaque', 'Reboucher fissures plafond', 'Peinture 2 couches'],
      corps_metier: ['plaquiste', 'peintre'],
      budget_estime_ht: 3200,
      urgence: 'normale',
      notes: 'Démo — configurez votre clé Groq dans Paramètres pour analyser vos vraies photos.',
      _demo: true,
    };
    setTimeout(() => {
      this._currentAnalysis = demo;
      this._showResults(demo);
    }, 1400);
  },

  // ── Affichage résultats ───────────────────────────────────
  _showResults(r) {
    this._setStep('result');
    const result = document.getElementById('pm-step-result');
    if (!result) return;

    const etatMap = { neuf: { label: 'Neuf', color: '#2DD4A0', pct: 100 }, bon: { label: 'Bon état', color: '#4F8EF7', pct: 78 }, moyen: { label: 'Moyen', color: '#F7A64F', pct: 50 }, mauvais: { label: 'Mauvais', color: '#F75B5B', pct: 28 }, a_renover: { label: 'À rénover', color: '#F75B5B', pct: 12 } };
    const urgMap = { faible: { label: 'Urgence faible', color: '#2DD4A0' }, normale: { label: 'Urgence normale', color: '#F7A64F' }, urgente: { label: '🚨 Urgent', color: '#F75B5B' } };
    const etat = etatMap[r.etat] || etatMap.moyen;
    const urg  = urgMap[r.urgence] || urgMap.normale;

    const metierColors = { plaquiste: '#4F8EF7', peintre: '#A78BFA', carreleur: '#F7A64F', electricien: '#F7CB4F', plombier: '#60A5FA', maçon: '#F75B5B', charpentier: '#2DD4A0', menuisier: '#FF9B32' };
    const metierTags = (r.corps_metier || []).map(m => {
      const c = metierColors[m] || '#8892AA';
      return `<span style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;
              background:${c}20;color:${c};border:1px solid ${c}40">${m}</span>`;
    }).join(' ');

    const surf = r.surfaces_estimees || {};
    const travaux = (r.travaux_necessaires || []).map(t => `<li style="margin-bottom:4px;color:var(--text-secondary)">${t}</li>`).join('');

    const demoBar = r._demo ? `
      <div style="padding:10px 14px;background:rgba(255,155,50,0.08);border:1px solid rgba(255,155,50,0.25);
           border-radius:var(--radius-md);margin-bottom:16px;font-size:12px;color:var(--text-secondary)">
        🎭 <strong>Mode démo</strong> — résultats simulés.
        <a href="#" onclick="App.closeModal&&App.closeModal();App.navigate('config');return false"
           style="color:var(--accent);margin-left:4px">Configurer la clé Groq →</a>
      </div>` : '';

    result.innerHTML = `
      ${demoBar}
      <!-- Card résumé -->
      <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);
           padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <div>
            <div style="font-size:18px;font-weight:800;color:var(--text-primary);text-transform:capitalize">
              ${r.type_piece || '?'} · ${r.interieur_exterieur || ''}
            </div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-top:3px">Hauteur estimée : ${r.hauteur_estimee || 2.5} m</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:22px;font-weight:800;color:var(--accent);font-family:var(--font-mono)">
              ${new Intl.NumberFormat('fr-FR').format(r.budget_estime_ht || 0)} €
            </div>
            <div style="font-size:11px;color:var(--text-tertiary)">Budget estimé HT</div>
          </div>
        </div>

        <!-- Surfaces -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
          ${[['🧱 Murs', surf.murs_m2], ['⬛ Plafond', surf.plafond_m2], ['🔲 Sol', surf.sol_m2]].map(([l, v]) => `
            <div style="text-align:center;padding:8px;background:var(--bg-tertiary);border-radius:var(--radius-sm)">
              <div style="font-size:13px;font-weight:700;color:var(--text-primary);font-family:var(--font-mono)">${v || 0} m²</div>
              <div style="font-size:10px;color:var(--text-tertiary)">${l}</div>
            </div>`).join('')}
        </div>

        <!-- Jauge état -->
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
            <span style="color:var(--text-secondary)">État du chantier</span>
            <span style="font-weight:700;color:${etat.color}">${etat.label}</span>
          </div>
          <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${etat.pct}%;background:${etat.color};border-radius:3px;transition:width .4s ease"></div>
          </div>
        </div>

        <!-- Tags corps de métier -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${metierTags}</div>

        <!-- Urgence -->
        <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;
             background:${urg.color}15;border:1px solid ${urg.color}40;font-size:12px;font-weight:600;color:${urg.color}">
          ${urg.label}
        </div>
      </div>

      <!-- Matériaux & travaux -->
      ${r.materiaux_visibles?.length ? `
        <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);
             padding:12px 14px;margin-bottom:12px">
          <div style="font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">
            Matériaux détectés
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${r.materiaux_visibles.map(m => `<span style="padding:3px 8px;border-radius:4px;font-size:11px;
              background:var(--bg-tertiary);border:1px solid var(--border);color:var(--text-secondary)">${m}</span>`).join('')}
          </div>
        </div>` : ''}

      ${travaux ? `
        <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);
             padding:12px 14px;margin-bottom:12px">
          <div style="font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">
            Travaux identifiés
          </div>
          <ul style="margin:0;padding-left:18px;font-size:13px">${travaux}</ul>
        </div>` : ''}

      ${r.notes ? `<div style="font-size:12px;color:var(--text-tertiary);font-style:italic;margin-bottom:14px;padding:8px 12px;
          background:var(--bg-tertiary);border-radius:var(--radius-sm)">${r.notes}</div>` : ''}

      <!-- Actions -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
        <button class="btn btn-secondary" style="font-size:12px;padding:8px 6px;text-align:center"
          onclick="AnalysePhoto._creerChantier()">🏗<br><span style="font-size:11px">Créer<br>chantier</span></button>
        <button class="btn btn-secondary" style="font-size:12px;padding:8px 6px;text-align:center"
          onclick="AnalysePhoto._prefillMetrages()">📐<br><span style="font-size:11px">Pré-remplir<br>métrés</span></button>
        <button class="btn btn-primary" style="font-size:12px;padding:8px 6px;text-align:center"
          onclick="AnalysePhoto._devisRapide()">💰<br><span style="font-size:11px">Devis<br>rapide</span></button>
      </div>
      <button class="btn btn-ghost" style="width:100%;font-size:12px" onclick="AnalysePhoto.showModal()">← Nouvelle analyse</button>`;
  },

  // ── Changer d'étape ───────────────────────────────────────
  _setStep(step) {
    ['input','preview','loading','result'].forEach(s => {
      const el = document.getElementById('pm-step-' + s);
      if (el) el.style.display = s === step ? 'block' : 'none';
    });
  },

  // ── Actions depuis l'analyse ──────────────────────────────
  _creerChantier() {
    const r = this._currentAnalysis;
    if (!r) return;
    const isExt = r.interieur_exterieur === 'extérieur' ? 'exterieur' : 'interieur';
    const notes = `[IA] ${r.type_piece} · ${r.etat} · Travaux : ${(r.travaux_necessaires || []).join(', ')}`;
    document.getElementById('photo-modal-overlay').remove();

    const div = document.createElement('div');
    const clients = DB.clients;
    div.innerHTML = `
      <div class="form-group"><label class="form-label">Nom du chantier *</label>
        <input class="form-control" id="ph-nom" value="${r.type_piece ? r.type_piece.charAt(0).toUpperCase() + r.type_piece.slice(1) + ' — analyse IA' : 'Chantier IA'}">
      </div>
      <div class="form-group"><label class="form-label">Client *</label>
        <select class="form-control" id="ph-client">
          <option value="">— Sélectionner —</option>
          ${clients.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Type</label>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button id="ph-btn-int" class="${isExt === 'interieur' ? 'btn btn-primary' : 'btn btn-secondary'}" style="flex:1"
            onclick="this.className='btn btn-primary';document.getElementById('ph-btn-ext').className='btn btn-secondary';document.getElementById('ph-type').value='interieur'">🏠 Intérieur</button>
          <button id="ph-btn-ext" class="${isExt === 'exterieur' ? 'btn btn-primary' : 'btn btn-secondary'}" style="flex:1"
            onclick="this.className='btn btn-primary';document.getElementById('ph-btn-int').className='btn btn-secondary';document.getElementById('ph-type').value='exterieur'">🌿 Extérieur</button>
        </div>
        <input type="hidden" id="ph-type" value="${isExt}">
      </div>
      <div class="form-group"><label class="form-label">Statut</label>
        <select class="form-control" id="ph-statut">
          <option selected>En attente</option><option>En cours</option><option>Terminé</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Notes (pré-remplies par l'IA)</label>
        <textarea class="form-control" id="ph-notes" rows="3">${notes}</textarea>
      </div>`;

    App.openModal('🏗 Nouveau chantier (IA)', div, `
      <button class="btn btn-secondary" onclick="App.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="AnalysePhoto._sauvegarderChantier()">Créer le chantier</button>
    `);
  },

  _sauvegarderChantier() {
    const nom      = document.getElementById('ph-nom')?.value.trim();
    const clientId = parseInt(document.getElementById('ph-client')?.value) || null;
    const type     = document.getElementById('ph-type')?.value || 'interieur';
    const statut   = document.getElementById('ph-statut')?.value || 'En attente';
    const notes    = document.getElementById('ph-notes')?.value || '';
    if (!nom) { App.toast('Nom du chantier requis', 'error'); return; }

    DB.addChantier({ nom, clientId, typeChantier: type, statut, notes,
      dateDebut: new Date().toISOString().slice(0, 10) });
    App.closeModal();
    App.toast('Chantier créé depuis l\'analyse IA !', 'success');
    setTimeout(() => App.navigate('chantiers'), 300);
  },

  _prefillMetrages() {
    const r = this._currentAnalysis;
    document.getElementById('photo-modal-overlay').remove();
    const surf = r?.surfaces_estimees || {};
    window._photoMetrageHint = { murs: surf.murs_m2 || 0, sol: surf.sol_m2 || 0, plafond: surf.plafond_m2 || 0, type: r?.type_piece };
    App.toast(`📐 Surfaces : murs ${surf.murs_m2||0} m², sol ${surf.sol_m2||0} m², plafond ${surf.plafond_m2||0} m²`);
    App.navigate('calculateur');
  },

  _devisRapide() {
    const r = this._currentAnalysis;
    document.getElementById('photo-modal-overlay').remove();
    window._photoDevisHint = { metiers: r?.corps_metier || [], surf: r?.surfaces_estimees || {}, type: r?.type_piece };
    App.navigate('projets_types');
  },

  // ── Historique ────────────────────────────────────────────
  _saveToHistory(file, analysis) {
    const hist = this.getHistory();
    const canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 60;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      canvas.getContext('2d').drawImage(img, 0, 0, 80, 60);
      URL.revokeObjectURL(url);
      const entry = {
        thumb:      canvas.toDataURL('image/jpeg', 0.5),
        type_piece: analysis.type_piece || '',
        etat:       analysis.etat || '',
        budget:     analysis.budget_estime_ht || 0,
        date:       new Date().toLocaleDateString('fr-FR'),
        analysis,
      };
      hist.unshift(entry);
      localStorage.setItem(this.HIST_KEY, JSON.stringify(hist.slice(0, 5)));
    };
    img.src = url;
  },

  getHistory() {
    try { return JSON.parse(localStorage.getItem(this.HIST_KEY) || '[]'); } catch { return []; }
  },

  _useHistory(idx) {
    const hist = this.getHistory();
    const h = hist[idx];
    if (!h) return;
    this._currentAnalysis = h.analysis;
    this._showResults(h.analysis);
  },

  // ── Styles ────────────────────────────────────────────────
  _injectStyles() {
    if (document.getElementById('photo-styles')) return;
    const s = document.createElement('style');
    s.id = 'photo-styles';
    s.textContent = `
      #photo-modal-overlay {
        position: fixed; inset: 0; z-index: 9500;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        padding: 16px;
        animation: fadeIn .15s ease;
      }
      .pm-modal {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        width: 100%; max-width: 480px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        animation: slideUp .2s ease;
      }
      @keyframes slideUp { from { transform: translateY(16px); opacity:0 } to { transform:none; opacity:1 } }
      @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }

      .pm-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
      }
      .pm-close {
        background: none; border: none; cursor: pointer;
        font-size: 16px; color: var(--text-tertiary); padding: 4px 8px;
        border-radius: var(--radius-sm); transition: all .15s;
      }
      .pm-close:hover { background: var(--bg-tertiary); color: var(--text-primary); }
      .pm-step { padding: 16px 20px; }
      .pm-section-title {
        font-size: 11px; font-weight: 700; color: var(--text-tertiary);
        text-transform: uppercase; letter-spacing: .06em;
        margin-bottom: 10px; padding-bottom: 5px;
        border-bottom: 1px solid var(--border);
      }

      .pm-btn-camera {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 6px; width: 100%; padding: 20px;
        background: linear-gradient(135deg, rgba(45,212,160,0.15), rgba(79,142,247,0.08));
        border: 2px solid rgba(45,212,160,0.3);
        border-radius: var(--radius-md);
        cursor: pointer; transition: all .15s;
        color: var(--text-primary);
        margin-bottom: 10px;
      }
      .pm-btn-camera:hover {
        border-color: rgba(45,212,160,0.6);
        background: linear-gradient(135deg, rgba(45,212,160,0.22), rgba(79,142,247,0.12));
      }
      .pm-btn-gallery {
        display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px;
        background: var(--bg-tertiary); border: 1px solid var(--border);
        border-radius: var(--radius-md); cursor: pointer; transition: all .15s;
        font-size: 13px; color: var(--text-secondary);
      }
      .pm-btn-gallery:hover { border-color: var(--accent); color: var(--text-primary); }

      .pm-dropzone {
        border: 2px dashed var(--border); border-radius: var(--radius-md);
        padding: 32px 20px; text-align: center;
        transition: all .15s; cursor: default;
        color: var(--text-secondary);
      }
      .pm-dz-active {
        border-color: var(--accent);
        background: rgba(79,142,247,0.06);
      }

      .pm-spinner {
        width: 44px; height: 44px; border-radius: 50%;
        border: 3px solid rgba(45,212,160,0.2);
        border-top-color: #2DD4A0;
        animation: spin .8s linear infinite;
        margin: 0 auto;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      .btn-ghost {
        background: none; border: 1px solid var(--border);
        color: var(--text-secondary); border-radius: var(--radius-sm);
        padding: 8px 12px; cursor: pointer; font-family: var(--font); font-size: 13px;
        transition: all .15s;
      }
      .btn-ghost:hover { border-color: var(--accent); color: var(--text-primary); }
    `;
    document.head.appendChild(s);
  },
};

// ── Auto-init après DOMContentLoaded ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => AnalysePhoto.init(), 600);
});
