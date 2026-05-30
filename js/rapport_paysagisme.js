/**
 * PlaqPro+ — Logiciel de gestion pour artisans BTP
 * Copyright (c) 2026 Gabriel Khamassi — Saint-Priest (69)
 * Tous droits reserves — All rights reserved
 * Toute reproduction, copie, distribution ou modification
 * interdite sans autorisation ecrite de l auteur.
 * Depot APP en cours — Marque PlaqPro+ INPI en cours
 */
// ============================================================
//  PLAQPRO WEB — Rapports Paysagisme
//  rapport_paysagisme.js
// ============================================================

(function() {
  'use strict';

  const RapportPaysagisme = {
    _container: null,
    _containerId: null,
    _lastHTML: '',
    _lastName: 'rapport-paysagisme',

    genererRapportChantier(chantierId) {
      const chantierPaysage = findChantierPaysage(chantierId);
      if (!chantierPaysage) return emptyReport('Chantier paysagisme introuvable.');

      const chantier = getChantier(chantierPaysage.chantierId);
      const client = chantier && chantier.clientId ? getClient(chantier.clientId) : null;
      const diagnosticEval = evalDiagnostic(chantierPaysage.diagnostic);
      const marge = calcMarge(chantierPaysage);
      const lots = getDetailLots(chantierPaysage);
      const photosAvant = (chantierPaysage.photos || []).filter(p => p.type === 'avant');
      const photosApres = (chantierPaysage.photos || []).filter(p => p.type === 'apres');

      return docShell('Rapport chantier paysagisme', `
        ${headerBlock('Rapport chantier paysagisme', [
          ['Client', clientName(client)],
          ['Adresse', formatAdresse(chantier)],
          ['Dates', `${chantierPaysage.dateDebut || '-'} → ${chantierPaysage.dateFin || '-'}`],
          ['Statut', chantierPaysage.statut || '-'],
          ['Avancement', `${n(chantierPaysage.avancement, 0)} %`],
        ])}

        ${section('Diagnostic initial', `
          ${metrics([
            ['Coefficient difficulté', diagnosticEval.coefficient],
            ['Temps installation estimé', `${diagnosticEval.tempsInstallation} h`],
            ['Alertes actives', diagnosticEval.alertes.length],
          ])}
          ${alertList(diagnosticEval.alertes)}
        `)}

        ${section('Lots réalisés', table(
          ['Lot', 'Quantité', 'Coût direct', 'Prix vendu', 'Marge'],
          lots.map(lot => [
            lot.nom,
            `${fmtNumber(lot.quantite)} ${lot.unite || ''}`,
            money(lot.coutDirect),
            money(lot.prixVendu || lot.prixConseilleLot),
            `${money(lot.margeEuro)} (${fmtNumber(lot.margePct)} %)`,
          ])
        ))}

        ${section('Main d’œuvre', resourceTable(chantierPaysage.equipe, ['profil', 'heures', 'cout'], 'Aucune main d’œuvre renseignée.'))}
        ${section('Matériel', resourceTable(chantierPaysage.materiel, ['nom', 'heures', 'cout'], 'Aucun matériel renseigné.'))}
        ${section('Sous-traitants', resourceTable(chantierPaysage.soustraitants, ['nom', 'metier', 'cout'], 'Aucun sous-traitant renseigné.'))}

        ${section('Synthèse financière', metrics([
          ['Coût direct', money(marge.coutDirect)],
          ['Coût complet estimé', money(marge.coutComplet)],
          ['Prix vendu HT', money(marge.prixVendu)],
          ['Marge', `${money(marge.margeEuro)} (${fmtNumber(marge.margePct)} %)`],
        ]))}

        ${section('Photos avant / après', photosBlock(photosAvant, photosApres))}
      `);
    },

    genererFicheDevis(devisId) {
      const devis = getDevisById(devisId);
      if (!devis) return emptyReport('Devis introuvable.');
      const chantier = devis.chantierId ? getChantier(devis.chantierId) : null;
      const client = devis.clientId ? getClient(devis.clientId) : (chantier && chantier.clientId ? getClient(chantier.clientId) : null);
      const lignes = Array.isArray(devis.lignes) ? devis.lignes : [];

      return docShell('Fiche devis paysagisme', `
        ${headerBlock('Fiche devis paysagisme', [
          ['Devis', devis.numero || `#${devis.id || '-'}`],
          ['Client', clientName(client)],
          ['Chantier', chantier ? (chantier.nom || chantier.titre || '-') : '-'],
          ['Adresse', formatAdresse(chantier)],
          ['Date', devis.date || new Date().toISOString().slice(0, 10)],
        ])}

        <p style="font-size:14px;line-height:1.5;color:#333">
          Nous vous proposons une prestation complète d’aménagement extérieur et de paysagisme,
          incluant les travaux, fournitures, végétaux, finitions et conditions ci-dessous.
        </p>

        ${section('Détail des lots', table(
          ['Désignation', 'Quantité', 'Unité', 'Prix unitaire HT', 'Total HT'],
          lignes.map(ligne => [
            ligne.designation || ligne.poste || '-',
            fmtNumber(ligne.quantite || 1),
            ligne.unite || 'forfait',
            money(ligne.prixUnitaire || ligne.totalClient || ligne.total || 0),
            money(ligne.totalClient || ligne.total || ligne.baseHT || 0),
          ])
        ))}

        ${section('Totaux', metrics([
          ['Total HT', money(devis.totalHT)],
          ['TVA', money(devis.montantTVA || (n(devis.totalTTC, 0) - n(devis.totalHT, 0)))],
          ['Total TTC', money(devis.totalTTC)],
        ]))}

        ${section('Conditions', `
          <ul>
            <li>Délai d’intervention sous réserve de météo favorable, disponibilité matériaux et validation du devis.</li>
            <li>Garantie de reprise végétaux limitée aux conditions normales d’arrosage, de saison et d’exposition.</li>
            <li>Paiement selon conditions indiquées au devis : acompte à la commande, solde à réception sauf accord contraire.</li>
            <li>Les réseaux enterrés non signalés, supports dégradés ou contraintes non visibles pourront donner lieu à avenant.</li>
          </ul>
        `)}

        ${section('Mentions légales paysagisme', `
          <p>Les travaux sont réalisés selon les règles professionnelles applicables aux aménagements extérieurs. Les interventions électriques, structurelles ou réseaux nécessitant une habilitation spécifique seront réalisées ou validées par un professionnel compétent.</p>
        `)}

        ${signatureBlock()}
      `);
    },

    genererRecapMarge(periode) {
      periode = periode || {};
      const items = getChantiersPaysage().filter(item => inPeriod(item, periode));
      const rows = items.map(item => {
        const chantier = getChantier(item.chantierId);
        const marge = calcMarge(item);
        return {
          nom: chantier ? (chantier.nom || chantier.titre || `Chantier #${chantier.id}`) : `Chantier #${item.chantierId}`,
          ca: marge.prixVendu,
          cout: marge.coutDirect,
          margeEuro: marge.margeEuro,
          margePct: marge.margePct,
        };
      });
      const totalCA = rows.reduce((s, r) => s + r.ca, 0);
      const totalCout = rows.reduce((s, r) => s + r.cout, 0);
      const totalMarge = totalCA - totalCout;
      const margePct = totalCA > 0 ? totalMarge / totalCA * 100 : 0;

      return docShell('Récapitulatif marges paysagisme', `
        ${headerBlock('Récapitulatif marges paysagisme', [
          ['Période début', periode.debut || '-'],
          ['Période fin', periode.fin || '-'],
          ['Nombre de chantiers', rows.length],
        ])}

        ${section('Totaux', metrics([
          ['CA HT', money(totalCA)],
          ['Coût réel/direct', money(totalCout)],
          ['Marge totale', money(totalMarge)],
          ['Marge moyenne', `${fmtNumber(margePct)} %`],
        ]))}

        ${section('Détail par chantier', table(
          ['Chantier', 'CA HT', 'Coût réel', 'Marge €', 'Marge %', 'Alerte'],
          rows.map(row => [
            row.nom,
            money(row.ca),
            money(row.cout),
            money(row.margeEuro),
            `${fmtNumber(row.margePct)} %`,
            row.margePct < 15 ? '⚠️ Marge < 15%' : '',
          ])
        ))}
      `);
    },

    exporterPDF(html, nomFichier) {
      html = html || this._lastHTML;
      nomFichier = nomFichier || this._lastName || 'rapport-paysagisme';
      if (!html) {
        toast('Aucun rapport à exporter', 'warning');
        return false;
      }

      const doc = fullPrintHTML(html, nomFichier);
      try {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        iframe.contentDocument.open();
        iframe.contentDocument.write(doc);
        iframe.contentDocument.close();
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => iframe.remove(), 1000);
        toast('Export PDF lancé', 'success');
        return true;
      } catch (e) {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(doc);
          win.document.close();
          win.focus();
          win.print();
          toast('Export ouvert dans un nouvel onglet', 'success');
          return true;
        }
      }
      toast('Export PDF impossible', 'error');
      return false;
    },

    getHTML(containerId) {
      const html = this._buildHTML();
      if (containerId) {
        this._containerId = containerId;
        this._container = document.getElementById(containerId);
        if (this._container) {
          this._container.innerHTML = html;
          this._bind();
        }
      }
      return html;
    },

    _buildHTML() {
      const chantiers = getChantiersPaysage();
      const devisPaysage = getDevis().filter(d => d.source === 'Pack Paysagisme' || d.analyseInterne);
      return `
        <div class="rapport-paysagisme" style="display:flex;flex-direction:column;gap:16px">
          <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
            <div>
              <h2 style="margin:0 0 4px;color:var(--text)">Rapports paysagisme</h2>
              <p style="margin:0;color:var(--text-secondary,var(--text));font-size:13px">Générez rapports chantier, fiches devis client et récapitulatifs de marge.</p>
            </div>
            <button type="button" class="btn btn-primary" data-rp-action="exporter">Export PDF</button>
          </div>

          <div class="card">
            <div class="calc-section-title">Chantiers paysagisme</div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${chantiers.length ? chantiers.map(item => chantierRow(item)).join('') : '<div style="color:var(--text-secondary,var(--text));font-size:13px">Aucun chantier paysagisme.</div>'}
            </div>
          </div>

          <div class="card">
            <div class="calc-section-title">Fiches devis client</div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${devisPaysage.length ? devisPaysage.map(devis => devisRow(devis)).join('') : '<div style="color:var(--text-secondary,var(--text));font-size:13px">Aucun devis paysagisme détecté.</div>'}
            </div>
          </div>

          <div class="card">
            <div class="calc-section-title">Récap marges période</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;align-items:end">
              <label class="calc-input-group">
                <span>Début</span>
                <input type="month" data-rp-debut style="${inputStyle()}">
              </label>
              <label class="calc-input-group">
                <span>Fin</span>
                <input type="month" data-rp-fin style="${inputStyle()}">
              </label>
              <button type="button" class="btn btn-secondary" data-rp-action="recap">Générer récap marges</button>
            </div>
          </div>

          <div class="card" data-rp-preview style="display:none"></div>
        </div>
      `;
    },

    _bind() {
      if (!this._container) return;
      this._container.addEventListener('click', event => {
        const target = event.target.closest('[data-rp-action]');
        if (!target) return;
        const action = target.getAttribute('data-rp-action');
        const id = target.getAttribute('data-id');
        if (action === 'rapport') this._preview(this.genererRapportChantier(id), `rapport-chantier-${id}`);
        if (action === 'fiche') this._preview(this.genererFicheDevis(id), `fiche-devis-${id}`);
        if (action === 'recap') {
          const debut = this._container.querySelector('[data-rp-debut]')?.value || '';
          const fin = this._container.querySelector('[data-rp-fin]')?.value || '';
          this._preview(this.genererRecapMarge({ debut, fin }), 'recap-marges-paysagisme');
        }
        if (action === 'exporter') this.exporterPDF(this._lastHTML, this._lastName);
      });
    },

    _preview(html, name) {
      this._lastHTML = html;
      this._lastName = name;
      const preview = this._container ? this._container.querySelector('[data-rp-preview]') : null;
      if (preview) {
        preview.style.display = 'block';
        preview.innerHTML = html;
        preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
  };

  function findChantierPaysage(chantierId) {
    return getChantiersPaysage().find(item => String(item.id) === String(chantierId) || String(item.chantierId) === String(chantierId)) || null;
  }

  function getChantiersPaysage() {
    if (window.ChantierPaysagisme && typeof window.ChantierPaysagisme.getAll === 'function') return window.ChantierPaysagisme.getAll();
    try {
      const raw = window.localStorage ? window.localStorage.getItem('plaqpro_chantiers_paysagisme') : null;
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function getDetailLots(chantierPaysage) {
    if (chantierPaysage.analyseInterne && Array.isArray(chantierPaysage.analyseInterne.detailParLot)) return chantierPaysage.analyseInterne.detailParLot;
    if (window.DevisPaysagisme && typeof window.DevisPaysagisme.calcDevisComplet === 'function' && Array.isArray(chantierPaysage.lots)) {
      return window.DevisPaysagisme.calcDevisComplet(chantierPaysage.lots).detailParLot;
    }
    return (chantierPaysage.lots || []).map(lot => ({
      nom: lot.nom || lot.lotId || '-',
      quantite: lot.quantite || 1,
      unite: lot.unite || '',
      coutDirect: lot.coutDirect || 0,
      prixVendu: lot.prixVente || lot.prixVendu || 0,
      margeEuro: n(lot.prixVente || lot.prixVendu, 0) - n(lot.coutDirect, 0),
      margePct: pct(n(lot.prixVente || lot.prixVendu, 0) - n(lot.coutDirect, 0), n(lot.prixVente || lot.prixVendu, 0)),
    }));
  }

  function calcMarge(chantierPaysage) {
    const margeModule = window.ChantierPaysagisme && typeof window.ChantierPaysagisme.calcMargeReelle === 'function'
      ? window.ChantierPaysagisme.calcMargeReelle(chantierPaysage.id)
      : null;
    const lots = getDetailLots(chantierPaysage);
    const coutLots = lots.reduce((sum, lot) => sum + n(lot.coutDirect, 0), 0);
    const venduLots = lots.reduce((sum, lot) => sum + n(lot.prixVendu || lot.prixConseilleLot, 0), 0);
    const coutDirect = n(chantierPaysage.coutReel, 0) || coutLots;
    const prixVendu = margeModule && margeModule.prixVendu ? margeModule.prixVendu : venduLots;
    const margeEuro = prixVendu - coutDirect;
    return {
      coutDirect: round2(coutDirect),
      coutComplet: round2(coutDirect * 1.12),
      prixVendu: round2(prixVendu),
      margeEuro: round2(margeEuro),
      margePct: round2(pct(margeEuro, prixVendu)),
    };
  }

  function evalDiagnostic(diagnostic) {
    if (window.DiagnosticChantier && typeof window.DiagnosticChantier.calcCoefficient === 'function') {
      return window.DiagnosticChantier.calcCoefficient(diagnostic || {});
    }
    return { coefficient: 1, alertes: [], tempsInstallation: 1.5 };
  }

  function resourceTable(items, fields, emptyText) {
    items = Array.isArray(items) ? items : [];
    if (!items.length) return `<p style="color:#666">${escapeHtml(emptyText)}</p>`;
    return table(fields.map(labelize), items.map(item => fields.map(field => {
      const value = item[field] !== undefined ? item[field] : '';
      return field === 'cout' ? money(value) : value;
    })));
  }

  function photosBlock(avant, apres) {
    const all = []
      .concat((avant || []).map(p => Object.assign({}, p, { label: 'Avant' })))
      .concat((apres || []).map(p => Object.assign({}, p, { label: 'Après' })));
    if (!all.length) return '<p style="color:#666">Aucune photo avant/après disponible.</p>';
    return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">${all.map(photo => `
      <figure style="margin:0;border:1px solid #ddd;border-radius:8px;overflow:hidden">
        <img src="${escapeAttr(photo.base64)}" alt="${escapeAttr(photo.label)}" style="width:100%;height:120px;object-fit:cover;display:block">
        <figcaption style="padding:6px;text-align:center;font-size:12px;color:#555">${escapeHtml(photo.label)}</figcaption>
      </figure>
    `).join('')}</div>`;
  }

  function chantierRow(item) {
    const chantier = getChantier(item.chantierId);
    const nom = chantier ? (chantier.nom || chantier.titre || `Chantier #${chantier.id}`) : `Chantier #${item.chantierId}`;
    return `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;border:1px solid var(--border);border-radius:var(--r-md,8px);padding:10px;background:var(--bg-card)">
        <div>
          <strong style="color:var(--text)">${escapeHtml(nom)}</strong>
          <div style="font-size:12px;color:var(--text-secondary,var(--text))">${escapeHtml(item.statut || '-')} · ${n(item.avancement, 0)} %</div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" data-rp-action="rapport" data-id="${escapeAttr(item.id)}">Rapport</button>
      </div>
    `;
  }

  function devisRow(devis) {
    return `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;border:1px solid var(--border);border-radius:var(--r-md,8px);padding:10px;background:var(--bg-card)">
        <div>
          <strong style="color:var(--text)">${escapeHtml(devis.numero || `Devis #${devis.id}`)}</strong>
          <div style="font-size:12px;color:var(--text-secondary,var(--text))">${money(devis.totalHT)} HT</div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" data-rp-action="fiche" data-id="${escapeAttr(devis.id || devis.numero)}">Fiche devis</button>
      </div>
    `;
  }

  function docShell(title, body) {
    return `
      <article class="rp-document" style="background:#fff;color:#222;padding:24px;border-radius:8px;font-family:Arial,sans-serif;line-height:1.35">
        <h1 style="margin:0 0 16px;font-size:24px;color:#111">${escapeHtml(title)}</h1>
        ${body}
      </article>
    `;
  }

  function headerBlock(title, rows) {
    return `
      <div style="border:1px solid #ddd;border-radius:8px;padding:12px;margin-bottom:16px;background:#f8fafc">
        <h2 style="margin:0 0 10px;font-size:17px;color:#111">${escapeHtml(title)}</h2>
        ${rows.map(row => `<div style="display:flex;justify-content:space-between;gap:12px;border-top:1px solid #e5e7eb;padding:6px 0"><span style="color:#555">${escapeHtml(row[0])}</span><strong style="text-align:right">${escapeHtml(row[1])}</strong></div>`).join('')}
      </div>
    `;
  }

  function section(title, content) {
    return `<section style="margin-top:18px"><h2 style="font-size:17px;margin:0 0 8px;color:#1f4d78">${escapeHtml(title)}</h2>${content}</section>`;
  }

  function metrics(items) {
    return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">${items.map(item => `
      <div style="border:1px solid #ddd;border-radius:8px;padding:10px;background:#f9fafb">
        <div style="font-size:12px;color:#666">${escapeHtml(item[0])}</div>
        <strong style="font-size:18px;color:#111">${escapeHtml(item[1])}</strong>
      </div>
    `).join('')}</div>`;
  }

  function table(headers, rows) {
    rows = rows || [];
    return `
      <div style="overflow:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr>${headers.map(h => `<th style="text-align:left;border-bottom:2px solid #ddd;padding:8px;background:#f3f4f6">${escapeHtml(h)}</th>`).join('')}</tr></thead>
          <tbody>${rows.length ? rows.map(row => `<tr>${row.map(cell => `<td style="border-bottom:1px solid #eee;padding:8px;vertical-align:top">${escapeHtml(cell)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" style="padding:8px;color:#666">Aucune donnée.</td></tr>`}</tbody>
        </table>
      </div>
    `;
  }

  function alertList(alertes) {
    alertes = alertes || [];
    if (!alertes.length) return '<p style="color:#666">Aucune alerte active.</p>';
    return `<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">${alertes.map(a => `<div style="border:1px solid #f59e0b;background:#fff7ed;border-radius:8px;padding:8px;color:#7c2d12">${escapeHtml(a)}</div>`).join('')}</div>`;
  }

  function signatureBlock() {
    return `
      <section style="margin-top:28px">
        <h2 style="font-size:17px;color:#1f4d78">Acceptation du client</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:12px">
          <div style="border-top:1px solid #333;padding-top:8px">Date et mention "bon pour accord"</div>
          <div style="border-top:1px solid #333;padding-top:8px">Signature client</div>
        </div>
      </section>
    `;
  }

  function fullPrintHTML(html, title) {
    return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>@page{margin:16mm}body{margin:0;background:#fff}.rp-document{box-shadow:none!important;border-radius:0!important}</style></head><body>${html}</body></html>`;
  }

  function emptyReport(message) {
    return docShell('Rapport paysagisme', `<p>${escapeHtml(message)}</p>`);
  }

  function getDevisById(id) {
    return getDevis().find(d => String(d.id) === String(id) || String(d.numero) === String(id)) || null;
  }

  function getDevis() {
    return window.DB && Array.isArray(window.DB.devis) ? window.DB.devis : [];
  }

  function getChantier(id) {
    if (window.DB && typeof window.DB.getChantier === 'function') return window.DB.getChantier(n(id, 0));
    return window.DB && Array.isArray(window.DB.chantiers) ? window.DB.chantiers.find(c => String(c.id) === String(id)) : null;
  }

  function getClient(id) {
    if (window.DB && typeof window.DB.getClient === 'function') return window.DB.getClient(n(id, 0));
    return window.DB && Array.isArray(window.DB.clients) ? window.DB.clients.find(c => String(c.id) === String(id)) : null;
  }

  function inPeriod(item, periode) {
    const date = String(item.dateFin || item.dateDebut || item.updatedAt || item.createdAt || '').slice(0, 7);
    if (!date) return true;
    if (periode.debut && date < periode.debut) return false;
    if (periode.fin && date > periode.fin) return false;
    return true;
  }

  function formatAdresse(chantier) {
    if (!chantier) return '-';
    return chantier.adresse || [chantier.rue, chantier.codePostal, chantier.ville].filter(Boolean).join(' ') || '-';
  }

  function clientName(client) {
    return client ? (client.nom || client.raisonSociale || `Client #${client.id}`) : '-';
  }

  function labelize(value) {
    return String(value || '').replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
  }

  function money(value) {
    if (window.Calculs && typeof window.Calculs.fmt === 'function') return window.Calculs.fmt(value || 0);
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value || 0);
  }

  function fmtNumber(value) {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n(value, 0));
  }

  function pct(part, total) {
    return total > 0 ? part / total * 100 : 0;
  }

  function inputStyle() {
    return 'background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md,8px);padding:9px 12px;color:var(--text);width:100%';
  }

  function toast(message, type) {
    if (window.App && typeof window.App.toast === 'function') window.App.toast(message, type || 'success');
  }

  function n(value, def) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : (def || 0);
  }

  function round2(value) {
    return Math.round((value || 0) * 100) / 100;
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  window.RapportPaysagisme = RapportPaysagisme;
})();
