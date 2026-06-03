/**
 * PlaqPro+ — Partage resume chiffrage
 * Web Share API avec fallback presse-papier.
 */

(function() {
  'use strict';

  var STORAGE_KEY = 'plaqpro_chiffrages';

  function toast(message, type) {
    if (typeof App !== 'undefined' && App.toast) App.toast(message, type || 'success');
  }

  function getAll() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function fmtDate(value) {
    if (!value) return 'Date inconnue';
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date inconnue';
    return date.toLocaleDateString('fr-FR');
  }

  function fmtPrix(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function corpsLabel(corpsId) {
    var labels = {
      plaquisterie: 'Platrerie',
      peinture: 'Peinture',
      electricite: 'Electricite',
      plomberie: 'Plomberie',
      maconnerie: 'Maconnerie',
      paysagisme: 'Paysagisme',
    };
    return labels[corpsId] || corpsId || 'Aucun';
  }

  function trouver(chiffrageId) {
    return getAll().find(function(item) {
      return String(item.id || '') === String(chiffrageId || '');
    });
  }

  function buildText(chiffrage) {
    var chantier = chiffrage.chantier || {};
    var resume = chiffrage.resume || {};
    var corps = Array.isArray(chiffrage.corpsActifs) ? chiffrage.corpsActifs : [];
    var nom = chantier.nom || 'Sans nom';

    return [
      'PlaqPro+ — Chiffrage ' + nom,
      'Date : ' + fmtDate(chiffrage.date),
      'Corps : ' + (corps.length ? corps.map(corpsLabel).join(', ') : 'Aucun'),
      'Prix vente HT : ' + fmtPrix(resume.pvTotal),
      'Gain estimé : ' + fmtPrix(resume.gainTotal),
    ].join('\n');
  }

  function copierTexte(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function() {
        toast('Résumé copié', 'success');
      });
    }
    toast('Presse-papier indisponible', 'error');
    return Promise.resolve();
  }

  window.CalcExpressShare = {
    partager: function(chiffrageId) {
      var chiffrage = trouver(chiffrageId);
      if (!chiffrage) {
        toast('Chiffrage introuvable', 'error');
        return;
      }

      var chantier = chiffrage.chantier || {};
      var title = 'PlaqPro+ — Chiffrage ' + (chantier.nom || 'Sans nom');
      var text = buildText(chiffrage);

      if (navigator.share) {
        navigator.share({ title: title, text: text }).catch(function() {});
        return;
      }

      copierTexte(text);
    },
  };
})();
