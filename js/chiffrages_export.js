/**
 * PlaqPro+ — Export historique chiffrages
 * CSV et JSON depuis localStorage.
 */

(function() {
  'use strict';

  var STORAGE_KEY = 'plaqpro_chiffrages';

  function toast(message, type) {
    if (typeof App !== 'undefined' && App.toast) App.toast(message, type || 'success');
  }

  function lireChiffrages() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function formatDate(value) {
    if (!value) return '';
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR');
  }

  function formatNombre(value) {
    var n = Number(value) || 0;
    return String(Math.round(n * 100) / 100).replace('.', ',');
  }

  function csvCell(value) {
    var text = String(value == null ? '' : value);
    if (/[;"\r\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function dateFichier() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return '' + y + m + day;
  }

  function telecharger(contenu, nomFichier, typeMime) {
    var blob = new Blob([contenu], { type: typeMime });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function verifierData(data) {
    if (!data.length) {
      toast('Aucun chiffrage à exporter', 'warning');
      return false;
    }
    return true;
  }

  window.ChiffragesExport = {
    exportCSV: function() {
      var data = lireChiffrages();
      if (!verifierData(data)) return;

      var lignes = [
        ['Date', 'Chantier', 'Corps', 'Coût HT', 'Gain estimé', 'Prix vente HT'],
      ];

      data.forEach(function(chiffrage) {
        var chantier = chiffrage.chantier || {};
        var resume = chiffrage.resume || {};
        lignes.push([
          formatDate(chiffrage.date),
          chantier.nom || 'Sans nom',
          Array.isArray(chiffrage.corpsActifs) ? chiffrage.corpsActifs.join(', ') : '',
          formatNombre(resume.coutTotal),
          formatNombre(resume.gainTotal),
          formatNombre(resume.pvTotal),
        ]);
      });

      var csv = lignes.map(function(ligne) {
        return ligne.map(csvCell).join(';');
      }).join('\r\n');

      telecharger('\ufeff' + csv, 'plaqpro_chiffrages_' + dateFichier() + '.csv', 'text/csv;charset=utf-8');
    },

    exportJSON: function() {
      var data = lireChiffrages();
      if (!verifierData(data)) return;

      telecharger(
        JSON.stringify(data, null, 2),
        'plaqpro_chiffrages_' + dateFichier() + '.json',
        'application/json;charset=utf-8'
      );
    },
  };
})();
