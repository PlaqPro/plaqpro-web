/**
 * PlaqPro+ - Base locale du futur module Scanner.
 * Pas d'interface complexe ici : ce module liste les documents scannes.
 */

const Scanner = {
  _previewDocId: null,
  _editDocId: null,
  _pdfDocId: null,
  _analyzingDocIds: new Set(),
  currentStatusFilter: 'all',
  currentSearchQuery: '',

  getDocuments() {
    return DB.getScannedDocuments();
  },

  saveDocument(document) {
    return DB.saveScannedDocument(document);
  },

  removeDocument(id) {
    DB.removeScannedDocument(id);
  },

  canUseGroqAnalysis() {
    return typeof getGroqKey === 'function' && !!getGroqKey();
  },

  getAnalysisEngine() {
    if (this.canUseGroqAnalysis()) {
      return { type: 'groq', available: true };
    }
    return { type: 'simulation', available: true };
  },

  confirmRemove(id) {
    if (!confirm('Supprimer ce document scanne ?')) return;
    this.removeDocument(id);
    this.refresh();
  },

  showPreview(id) {
    this._previewDocId = id;
    this.refresh();
  },

  closePreview() {
    this._previewDocId = null;
    this.refresh();
  },

  preparePdf(id) {
    this._pdfDocId = id;
    this.refresh();
  },

  closePdfSummary() {
    this._pdfDocId = null;
    this.refresh();
  },

  printPdfSummary() {
    window.print();
  },

  sendDocumentByEmail(id) {
    const doc = this.getDocuments().find(item => String(item.id) === String(id));
    if (!doc) return;
    this._pdfDocId = id;
    this.refresh();
    const subject = 'Facture / Document scanné';
    const body = this._buildDocumentEmailBody(doc);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  },

  setStatusFilter(filter) {
    this.currentStatusFilter = filter || 'all';
    this.refresh();
  },

  setSearchQuery(value) {
    this.currentSearchQuery = value || '';
    this.refresh();
  },

  editData(id) {
    this._editDocId = id;
    this.refresh();
  },

  cancelEdit() {
    this._editDocId = null;
    this.refresh();
  },

  saveExtractedData(id) {
    const doc = this.getDocuments().find(item => String(item.id) === String(id));
    if (!doc) return;
    const field = name => document.getElementById(`scanner-edit-${name}`)?.value || '';
    DB.saveScannedDocument({
      ...doc,
      clientId: field('clientId') || null,
      chantierId: field('chantierId') || null,
      note: field('note'),
      extractedData: {
        fournisseur: field('fournisseur'),
        numero: field('numero'),
        dateDocument: field('dateDocument'),
        montantHT: field('montantHT'),
        tva: field('tva'),
        montantTTC: field('montantTTC'),
        echeance: field('echeance'),
      },
    });
    this._editDocId = null;
    this.refresh();
  },

  saveDocumentTextContent(id, value) {
    const doc = this.getDocuments().find(item => String(item.id) === String(id));
    if (!doc) return;
    DB.saveScannedDocument({
      ...doc,
      textContent: value || '',
    });
  },

  validateDocument(id) {
    const doc = this.getDocuments().find(item => String(item.id) === String(id));
    if (!doc) return;
    DB.saveScannedDocument({ ...doc, status: 'validated' });
    this.refresh();
  },

  async analyzeDocument(id) {
    const doc = this.getDocuments().find(item => String(item.id) === String(id));
    if (!doc) return;
    const analysisId = String(id);
    if (this._analyzingDocIds.has(analysisId)) return;
    this._analyzingDocIds.add(analysisId);
    this.refresh();
    try {
      const engine = this.getAnalysisEngine();
      const result = await this.extractDataFromDocument(doc);
      const analysisResult = {
        success: result.success,
        source: 'simulation',
        engine: engine.type,
        message: result.success ? 'Analyse simulée effectuée' : result.error,
        fallback: result.fallback === true,
        fallbackReason: result.fallbackReason || '',
        analyzedAt: new Date().toISOString(),
      };
      if (!result.success) {
        DB.saveScannedDocument({ ...doc, analysisResult });
        return;
      }
      DB.saveScannedDocument({
        ...doc,
        extractedData: {
          ...(doc.extractedData || {}),
          ...result.extractedData,
        },
        analysisResult,
      });
    } finally {
      this._analyzingDocIds.delete(analysisId);
      this.refresh();
    }
  },

  async extractDataFromDocument(document) {
    const engine = this.getAnalysisEngine();
    if (!document || typeof document !== 'object') {
      return {
        success: false,
        source: 'simulation',
        error: 'Document introuvable ou invalide',
      };
    }
    if (engine.type === 'groq') {
      const result = await this.extractDataWithGroq(document);
      if (!result.success && result.source === 'groq') {
        return {
          ...this.extractDataWithSimulation(document),
          fallback: true,
          fallbackReason: result.error,
        };
      }
      return result;
    }
    return this.extractDataWithSimulation(document);
  },

  extractDataWithSimulation(document) {
    return {
      success: true,
      source: 'simulation',
      extractedData: {
        fournisseur: 'FOURNISSEUR TEST',
        numero: 'FAC-TEST',
        montantHT: '100.00',
        tva: '20.00',
        montantTTC: '120.00',
      },
    };
  },

  extractTextFromDocument(document) {
    const textContent = typeof document?.textContent === 'string' ? document.textContent.trim() : '';
    if (textContent) {
      return {
        success: true,
        source: 'document-text',
        text: document.textContent,
      };
    }
    return {
      success: false,
      source: 'text-extraction',
      error: 'Extraction de texte non encore implémentée',
    };
  },

  async extractDataWithGroq(document) {
    const textExtraction = this.extractTextFromDocument(document);
    if (!textExtraction.success) {
      return {
        success: false,
        source: 'groq',
        error: 'Extraction de texte non disponible',
      };
    }
    const prompt = this.buildGroqAnalysisPrompt(document);
    const response = await this.callGroqForDocumentAnalysis(prompt);
    if (!response.success) {
      return response;
    }
    return this.parseGroqAnalysisResponse(response.rawResponse);
  },

  buildGroqAnalysisPrompt(document) {
    const textContent = typeof document?.textContent === 'string' ? document.textContent.trim() : '';
    const context = {
      title: document?.title || '',
      type: document?.type || '',
      fileName: document?.fileName || '',
      fileType: document?.fileType || '',
      note: document?.note || '',
    };
    return `Analyse le document suivant pour PlaqPro+.

Contexte disponible :
${JSON.stringify(context, null, 2)}

Texte brut du document a analyser uniquement :
${textContent}

Analyse uniquement le texte brut ci-dessus. N'invente aucune information absente du texte.

Extrais les informations suivantes si elles sont presentes :
- fournisseur
- numero de facture ou de document
- date
- montant HT
- TVA
- montant TTC
- type de document
- resume court

Reponds uniquement avec un JSON strict, sans texte avant ni apres, au format :
{
  "fournisseur": "",
  "numero": "",
  "dateDocument": "",
  "montantHT": "",
  "tva": "",
  "montantTTC": "",
  "typeDocument": "",
  "resume": ""
}`;
  },

  parseGroqAnalysisResponse(rawResponse) {
    try {
      const extractedData = this.normalizeExtractedData(JSON.parse(rawResponse));
      return {
        success: true,
        source: 'groq',
        extractedData,
      };
    } catch (error) {
      const responseText = String(rawResponse || '');
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        try {
          const extractedData = this.normalizeExtractedData(JSON.parse(responseText.slice(jsonStart, jsonEnd + 1)));
          return {
            success: true,
            source: 'groq',
            extractedData,
          };
        } catch (innerError) {
          return {
            success: false,
            source: 'groq',
            error: 'Réponse Groq invalide',
          };
        }
      }
      return {
        success: false,
        source: 'groq',
        error: 'Réponse Groq invalide',
      };
    }
  },

  normalizeExtractedData(data) {
    const source = data && typeof data === 'object' ? data : {};
    return {
      fournisseur: source.fournisseur || '',
      numero: source.numero || '',
      date: source.date || source.dateDocument || '',
      montantHT: source.montantHT || '',
      tva: source.tva || '',
      montantTTC: source.montantTTC || '',
      typeDocument: source.typeDocument || '',
      resume: source.resume || '',
    };
  },

  async callGroqForDocumentAnalysis(prompt) {
    const apiKey = typeof getGroqKey === 'function' ? getGroqKey() : '';
    if (!apiKey) {
      return {
        success: false,
        source: 'groq',
        error: 'Clé Groq absente',
      };
    }
    if (!prompt || typeof prompt !== 'string') {
      return {
        success: false,
        source: 'groq',
        error: 'Prompt Groq invalide',
      };
    }
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'Tu extrais des donnees de documents pour PlaqPro+ et tu reponds en JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return {
          success: false,
          source: 'groq',
          error: data?.error?.message || `Erreur Groq ${response.status}`,
        };
      }
      const content = data?.choices?.[0]?.message?.content || '';
      if (!content) {
        return {
          success: false,
          source: 'groq',
          error: 'Réponse Groq vide',
        };
      }
      return {
        success: true,
        source: 'groq',
        rawResponse: content,
      };
    } catch (error) {
      return {
        success: false,
        source: 'groq',
        error: error?.message || 'Appel Groq impossible',
      };
    }
  },

  addTestDocument() {
    DB.saveScannedDocument({
      title: 'Document test',
      type: 'scan',
      date: new Date().toISOString(),
      clientId: null,
      chantierId: null,
      source: 'manual-test',
    });
    this.refresh();
  },

  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('Lecture du fichier impossible'));
      reader.readAsDataURL(file);
    });
  },

  async importFile(input) {
    const file = input && input.files && input.files[0];
    if (!file) return;
    const fileDataUrl = await this.fileToDataUrl(file);
    DB.saveScannedDocument({
      title: file.name,
      type: file.type === 'application/pdf' ? 'pdf' : 'image',
      date: new Date().toISOString(),
      clientId: null,
      chantierId: null,
      source: 'file-import',
      fileName: file.name,
      fileType: file.type || '',
      fileSize: file.size || 0,
      fileDataUrl,
      previewUrl: URL.createObjectURL(file),
    });
    input.value = '';
    this.refresh();
  },

  refresh() {
    const content = document.getElementById('content');
    if (content) {
      content.innerHTML = '';
      content.appendChild(this.render());
    }
  },

  render() {
    const div = document.createElement('div');
    const documents = this.getDocuments();
    const visibleDocuments = documents
      .filter(doc => this._matchesStatusFilter(doc) && this._matchesSearch(doc))
      .sort((a, b) => this._dateValue(b.date) - this._dateValue(a.date));
    div.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Documents scannes</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('scanner-file-input').click()">
              Importer photo/PDF
            </button>
            <button class="btn btn-primary btn-sm" onclick="Scanner.addTestDocument()">
              Ajouter un document test
            </button>
          </div>
        </div>
        <div class="card-body">
          <input id="scanner-file-input" type="file" accept="image/*,application/pdf" style="display:none" onchange="Scanner.importFile(this)">
          ${this._renderCounters(documents)}
          <input class="form-control" placeholder="Rechercher" value="${this._escAttr(this.currentSearchQuery)}"
                 oninput="Scanner.setSearchQuery(this.value)" style="margin-bottom:12px">
          ${this._renderStatusFilter()}
          ${visibleDocuments.length ? `
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Taille</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${visibleDocuments.map(doc => {
                    const isAnalyzing = this._analyzingDocIds.has(String(doc.id));
                    return `
                    <tr>
                      <td>${this._esc(doc.title || 'Document scanne')}</td>
                      <td>${this._esc(doc.type || 'document')}</td>
                      <td>${this._formatDate(doc.date)}</td>
                      <td>${doc.fileSize ? this._formatSize(doc.fileSize) : ''}</td>
                      <td>${this._renderStatus(doc)}</td>
                      <td>
                        <button class="btn btn-danger btn-sm" onclick="Scanner.confirmRemove('${this._escAttr(doc.id)}')">
                          Supprimer
                        </button>
                        ${(doc.previewUrl || doc.fileDataUrl) ? `
                          <button class="btn btn-secondary btn-sm" onclick="Scanner.showPreview('${this._escAttr(doc.id)}')">
                            Voir
                          </button>
                        ` : ''}
                        <button class="btn btn-secondary btn-sm" onclick="Scanner.editData('${this._escAttr(doc.id)}')">
                          Modifier données
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="Scanner.validateDocument('${this._escAttr(doc.id)}')">
                          Valider
                        </button>
                        ${doc.source === 'file-import' ? `
                          <button class="btn btn-secondary btn-sm" onclick="Scanner.analyzeDocument('${this._escAttr(doc.id)}')" ${isAnalyzing ? 'disabled' : ''}>
                            ${isAnalyzing ? 'Analyse en cours...' : 'Analyser'}
                          </button>
                        ` : ''}
                        <button class="btn btn-secondary btn-sm" onclick="Scanner.preparePdf('${this._escAttr(doc.id)}')">
                          Préparer PDF
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="Scanner.sendDocumentByEmail('${this._escAttr(doc.id)}')">
                          Envoyer
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="6">${this._renderAnalyzingMessage(doc)}${this._renderAnalysisMessage(doc)}${this._renderAttachment(doc)}${this._renderExtractedData(doc)}${this._renderRawDocumentText(doc)}${this._renderNote(doc)}${this._renderEditForm(doc)}</td>
                    </tr>
                  `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div style="color:var(--text-secondary);font-size:14px">
              Aucun document scanne pour ce filtre.
            </div>
          `}
          ${this._renderPreview(visibleDocuments)}
          ${this._renderPdfSummary(visibleDocuments)}
        </div>
      </div>
    `;
    return div;
  },

  _renderPreview(documents) {
    const doc = documents.find(item => String(item.id) === String(this._previewDocId));
    const previewSource = doc?.previewUrl || doc?.fileDataUrl || '';
    if (!doc || !previewSource) return '';
    const title = this._esc(doc.title || 'Document scanne');
    const close = '<button class="btn btn-secondary btn-sm" onclick="Scanner.closePreview()">Fermer l apercu</button>';
    if ((doc.fileType || '').startsWith('image/')) {
      return `
        <div class="card" style="margin-top:16px">
          <div class="card-header">
            <div class="card-title">Aperçu - ${title}</div>
            ${close}
          </div>
          <div class="card-body">
            <img src="${this._escAttr(previewSource)}" alt="${title}" style="max-width:100%;height:auto;border-radius:8px;border:1px solid var(--border)">
          </div>
        </div>
      `;
    }
    if (doc.fileType === 'application/pdf') {
      return `
        <div class="card" style="margin-top:16px">
          <div class="card-header">
            <div class="card-title">Aperçu - ${title}</div>
            ${close}
          </div>
          <div class="card-body">
            <a class="btn btn-primary" href="${this._escAttr(previewSource)}" target="_blank" rel="noopener">
              Ouvrir le PDF
            </a>
          </div>
        </div>
      `;
    }
    return '';
  },

  _renderPdfSummary(documents) {
    const doc = documents.find(item => String(item.id) === String(this._pdfDocId));
    if (!doc) return '';
    const data = doc.extractedData || doc.donneesExtraites || {};
    const rows = [
      ['Titre', doc.title || 'Document scanne'],
      ['Type', doc.type || 'document'],
      ['Date', this._formatDate(doc.date)],
      ['clientId', doc.clientId || 'Non rattache'],
      ['chantierId', doc.chantierId || 'Non rattache'],
      ['Fournisseur', data.fournisseur || ''],
      ['Numero', data.numero || ''],
      ['Montant HT', data.montantHT || ''],
      ['TVA', data.tva || ''],
      ['Montant TTC', data.montantTTC || ''],
      ['Echeance', data.echeance || ''],
      ['Statut', this._statusLabel(doc)],
      ['Note interne', doc.note || ''],
    ];
    return `
      <div class="card scanner-print-summary" style="margin-top:16px">
        <div class="card-header">
          <div class="card-title">Préparer export PDF</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" onclick="Scanner.printPdfSummary()">Imprimer</button>
            <button class="btn btn-secondary btn-sm" onclick="Scanner.closePdfSummary()">Fermer</button>
          </div>
        </div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:160px 1fr;gap:8px;font-size:14px">
            ${rows.map(([label, value]) => `
              <div style="color:var(--text-secondary)">${label}</div>
              <div><strong>${this._esc(value)}</strong></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  _buildDocumentEmailBody(doc) {
    const data = doc.extractedData || doc.donneesExtraites || {};
    const lines = [
      'Bonjour,',
      '',
      'Veuillez trouver ci-dessous le résumé du document scanné.',
      '',
      `Titre : ${doc.title || 'Document scanné'}`,
      `Type : ${doc.type || 'document'}`,
      `Date : ${this._formatDate(doc.date)}`,
      `Statut : ${this._statusLabel(doc)}`,
      `Client : ${doc.clientId || 'Non rattaché'}`,
      `Chantier : ${doc.chantierId || 'Non rattaché'}`,
      '',
      'Données extraites :',
      `Fournisseur : ${data.fournisseur || ''}`,
      `Numéro : ${data.numero || ''}`,
      `Date document : ${data.dateDocument || data.date || ''}`,
      `Montant HT : ${data.montantHT || ''}`,
      `TVA : ${data.tva || ''}`,
      `Montant TTC : ${data.montantTTC || ''}`,
      `Type document : ${data.typeDocument || ''}`,
      `Résumé : ${data.resume || ''}`,
      '',
      'Pièce jointe : préparez le PDF depuis la fiche PlaqPro+, puis joignez-le manuellement avant envoi.',
    ];
    if (doc.note) {
      lines.splice(lines.length - 2, 0, `Note interne : ${doc.note}`, '');
    }
    return lines.join('\n');
  },

  _renderStatusFilter() {
    const options = [
      ['all', 'Tous'],
      ['todo', 'À traiter'],
      ['manual', 'Saisi manuellement'],
      ['validated', 'Validé'],
    ];
    return `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        ${options.map(([value, label]) => `
          <button class="btn ${this.currentStatusFilter === value ? 'btn-primary' : 'btn-secondary'} btn-sm"
                  onclick="Scanner.setStatusFilter('${value}')">
            ${label}
          </button>
        `).join('')}
      </div>
    `;
  },

  _renderCounters(documents) {
    const counts = documents.reduce((acc, doc) => {
      acc.total += 1;
      acc[this._getStatusKey(doc)] += 1;
      return acc;
    }, { total: 0, todo: 0, manual: 0, validated: 0 });
    const items = [
      ['Total', counts.total],
      ['À traiter', counts.todo],
      ['Saisi manuellement', counts.manual],
      ['Validé', counts.validated],
    ];
    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:12px">
        ${items.map(([label, value]) => `
          <div style="padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--glass-bg)">
            <div style="font-size:11px;color:var(--text-secondary)">${label}</div>
            <div style="font-size:20px;font-weight:800">${value}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  _matchesStatusFilter(doc) {
    const status = this._getStatusKey(doc);
    return this.currentStatusFilter === 'all' || this.currentStatusFilter === status;
  },

  _matchesSearch(doc) {
    const query = (this.currentSearchQuery || '').trim().toLowerCase();
    if (!query) return true;
    const data = doc.extractedData || doc.donneesExtraites || {};
    return [
      doc.title,
      doc.fileName,
      doc.type,
      doc.textContent,
      data.fournisseur,
      data.numero,
      data.typeDocument,
      data.resume,
      doc.clientId,
      doc.chantierId,
    ].some(value => String(value || '').toLowerCase().includes(query));
  },

  _getStatusKey(doc) {
    if (doc.status === 'validated') return 'validated';
    const data = doc.extractedData || doc.donneesExtraites || {};
    const hasData = Object.values(data).some(value => value !== undefined && value !== null && value !== '');
    return hasData ? 'manual' : 'todo';
  },

  _renderExtractedData(doc) {
    const data = doc.extractedData || doc.donneesExtraites || {};
    const fields = [
      ['fournisseur', 'Fournisseur'],
      ['numero', 'Numero'],
      ['dateDocument', 'Date document'],
      ['date', 'Date'],
      ['montantHT', 'Montant HT'],
      ['tva', 'TVA'],
      ['montantTTC', 'Montant TTC'],
      ['echeance', 'Echeance'],
      ['typeDocument', 'Type document'],
    ].filter(([key]) => data[key] !== undefined && data[key] !== null && data[key] !== '');

    if (!fields.length) {
      return '<div style="font-size:12px;color:var(--text-secondary);padding:6px 0">Données extraites : Aucune donnée extraite</div>';
    }

    return `
      <div style="font-size:12px;color:var(--text-secondary);padding:6px 0">
        <strong style="color:var(--text-primary)">Données extraites :</strong>
        ${fields.map(([key, label]) => `
          <span style="display:inline-block;margin:3px 10px 3px 0">
            ${label} : <strong>${this._esc(data[key])}</strong>
          </span>
        `).join('')}
        ${data.resume ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:4px">Resume : <strong>${this._esc(data.resume)}</strong></div>` : ''}
      </div>
    `;
  },

  _renderAttachment(doc) {
    return `
      <div style="font-size:12px;color:var(--text-secondary);padding:6px 0 0">
        Client : <strong>${this._esc(doc.clientId || 'Non rattaché')}</strong>
        <span style="margin-left:12px">Chantier : <strong>${this._esc(doc.chantierId || 'Non rattaché')}</strong></span>
      </div>
    `;
  },

  _renderAnalysisMessage(doc) {
    const result = doc.analysisResult;
    if (!result) return '';
    const color = result.success ? 'var(--green)' : '#F75B5B';
    const analyzedAt = result.analyzedAt ? ` - ${this._formatDateTime(result.analyzedAt)}` : '';
    const engine = result.engine ? ` - moteur : ${result.engine}` : '';
    const fallback = result.fallback === true
      ? `<div style="font-size:11px;color:var(--text-secondary);padding-top:2px">Analyse IA indisponible, simulation utilisée${result.fallbackReason ? ` - ${this._esc(result.fallbackReason)}` : ''}</div>`
      : '';
    return `<div style="font-size:12px;color:${color};padding:6px 0">${this._esc(result.message || '')}${this._esc(analyzedAt)}${this._esc(engine)}${fallback}</div>`;
  },

  _renderAnalyzingMessage(doc) {
    if (!this._analyzingDocIds.has(String(doc.id))) return '';
    return '<div style="font-size:12px;color:var(--text-secondary);padding:6px 0">Analyse en cours...</div>';
  },

  _renderNote(doc) {
    if (!doc.note) return '';
    return `
      <div style="font-size:12px;color:var(--text-secondary);padding:6px 0">
        Note : <strong>${this._esc(doc.note)}</strong>
      </div>
    `;
  },

  _renderRawDocumentText(doc) {
    return `
      <label style="display:block;font-size:12px;color:var(--text-secondary);padding:6px 0">
        Texte brut du document
        <textarea class="form-control" rows="3" onchange="Scanner.saveDocumentTextContent('${this._escAttr(doc.id)}', this.value)" style="margin-top:4px;font-size:12px">${this._esc(doc.textContent || '')}</textarea>
      </label>
    `;
  },

  _renderStatus(doc) {
    const status = this._getStatusKey(doc);
    const cls = status === 'validated' ? 'badge-success' : status === 'manual' ? 'badge-warning' : 'badge-secondary';
    return `<span class="badge ${cls}">${this._statusLabel(doc)}</span>`;
  },

  _statusLabel(doc) {
    const status = this._getStatusKey(doc);
    if (status === 'validated') return 'Validé';
    if (status === 'manual') return 'Saisi manuellement';
    return 'À traiter';
  },

  _renderEditForm(doc) {
    if (String(doc.id) !== String(this._editDocId)) return '';
    const data = doc.extractedData || doc.donneesExtraites || {};
    const input = (name, label, value = data[name] || '') => `
      <label style="display:block;font-size:12px;color:var(--text-secondary)">
        ${label}
        <input id="scanner-edit-${name}" class="form-control" value="${this._escAttr(value)}" style="margin-top:4px">
      </label>
    `;
    return `
      <div style="margin-top:10px;padding:12px;border:1px solid var(--border);border-radius:8px">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
          ${input('fournisseur', 'Fournisseur')}
          ${input('numero', 'Numero')}
          ${input('dateDocument', 'Date document')}
          ${input('montantHT', 'Montant HT')}
          ${input('tva', 'TVA')}
          ${input('montantTTC', 'Montant TTC')}
          ${input('echeance', 'Echeance')}
          ${input('clientId', 'clientId', doc.clientId || '')}
          ${input('chantierId', 'chantierId', doc.chantierId || '')}
        </div>
        <label style="display:block;font-size:12px;color:var(--text-secondary);margin-top:10px">
          note
          <textarea id="scanner-edit-note" class="form-control" rows="3" style="margin-top:4px">${this._esc(doc.note || '')}</textarea>
        </label>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-primary btn-sm" onclick="Scanner.saveExtractedData('${this._escAttr(doc.id)}')">Enregistrer</button>
          <button class="btn btn-secondary btn-sm" onclick="Scanner.cancelEdit()">Annuler</button>
        </div>
      </div>
    `;
  },

  _formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return this._esc(value);
    return date.toLocaleDateString('fr-FR');
  },

  _formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return this._esc(value);
    return date.toLocaleString('fr-FR');
  },

  _dateValue(value) {
    if (!value) return 0;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  },

  _formatSize(bytes) {
    const size = Number(bytes) || 0;
    if (size < 1024) return `${size} o`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;
    return `${(size / 1024 / 1024).toFixed(1)} Mo`;
  },

  _esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  },

  _escAttr(value) {
    return this._esc(value).replace(/`/g, '&#96;');
  },
};

window.Scanner = Scanner;
