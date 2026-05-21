with open(r"C:\PlaQproWEB\js\dpgf.js", "r", encoding="utf-8", errors="replace") as f:
    c = f.read()

changes = []

# 1 - _wbOriginal + flags
old1 = "  _wbOriginal:   null,"
new1 = "  _wbOriginal:   null,\n  _cctpCharge:   false,\n  _dpgfCharge:   false,"
if old1 in c: c = c.replace(old1, new1, 1); changes.append("1 OK")
else: changes.append("1 FAIL")

# 2 - _cctpCharge dans _handleCCTP
old2 = "        App.toast(`✅ CCTP analysé — ${this._exigencesCCTP.length} exigences techniques extraites`, 'success');"
new2 = "        this._cctpCharge = true;\n        this._verifierPret();\n        " + old2
if old2 in c: c = c.replace(old2, new2, 1); changes.append("2 OK")
else: changes.append("2 FAIL")

# 3 - _dpgfCharge dans _handleFile
old3 = "      this._showLoading(false);\n      this._afficherTableau();"
new3 = "      this._showLoading(false);\n      this._dpgfCharge = true;\n      this._verifierPret();\n      this._afficherTableau();"
if old3 in c: c = c.replace(old3, new3, 1); changes.append("3 OK")
else: changes.append("3 FAIL")

# 4 - _cctpCharge + _dpgfCharge dans _handleCombo
old4 = "      App.toast(`✅ Analyse complète — ${nbExig} exigences CCTP + ${nbLig} lignes DPGF`, 'success');"
new4 = "      this._cctpCharge = true;\n      this._dpgfCharge = true;\n      this._verifierPret();\n      " + old4
if old4 in c: c = c.replace(old4, new4, 1); changes.append("4 OK")
else: changes.append("4 FAIL")

# 5 - reset _dpgfCharge dans _handleFile
old5 = "    async _handleFile(file) {\n      this._fileName  = file.name;\n      this._lignes    = [];"
new5 = "    async _handleFile(file) {\n      this._fileName  = file.name;\n      this._lignes    = [];\n      this._dpgfCharge = false;"
if old5 in c: c = c.replace(old5, new5, 1); changes.append("5 OK")
else: changes.append("5 FAIL")

# 6 - Boutons grisés dans _buildPage
old6 = '                  <button class="btn btn-secondary" onclick="DPGF._exporterExcel()" style="font-size:12px">\U0001f4e5 DPGF complétée</button>\n                  <button class="btn btn-secondary" onclick="DPGF._exporterRapportSynthese()" style="font-size:12px">\U0001f4ca Rapport synthèse</button>\n                  <button class="btn btn-primary"   onclick="DPGF._genererDevis()"  style="font-size:12px">\U0001f4c4 Générer devis PlaqPro+</button>'
new6 = '                  <button class="btn btn-secondary" onclick="DPGF._exporterExcel()" style="font-size:12px;opacity:0.4;cursor:not-allowed" disabled title="Chargez CCTP + DPGF">\U0001f4e5 DPGF complétée</button>\n                  <button class="btn btn-secondary" onclick="DPGF._exporterRapportSynthese()" style="font-size:12px;opacity:0.4;cursor:not-allowed" disabled title="Chargez CCTP + DPGF">\U0001f4ca Rapport synthèse</button>\n                  <button class="btn btn-primary"   onclick="DPGF._genererDevis()"  style="font-size:12px;opacity:0.4;cursor:not-allowed" disabled title="Chargez CCTP + DPGF">\U0001f4c4 Générer devis PlaqPro+</button>'
if old6 in c: c = c.replace(old6, new6, 1); changes.append("6 OK")
else: changes.append("6 FAIL")

# 7 - Fonction _verifierPret
old7 = "    // ── Rapprochement CCTP ↔ DPGF ────────────────────────────────────────"
verifier = """    // ── Vérification documents prêts ─────────────────────────────────────
    _verifierPret() {
      const btnRapport = document.querySelector('[onclick="DPGF._exporterRapportSynthese()"]');
      const btnDPGF    = document.querySelector('[onclick="DPGF._exporterExcel()"]');
      const btnDevis   = document.querySelector('[onclick="DPGF._genererDevis()"]');
      const cctpStatus = document.getElementById('cctp-status');
      const dpgfStatus = document.getElementById('dpgf-status');
      if (!this._cctpCharge && !this._dpgfCharge) return;
      if (this._cctpCharge && !this._dpgfCharge) {
        if (dpgfStatus) dpgfStatus.innerHTML = '⏳ <strong>En attente du DPGF...</strong>';
      }
      if (this._dpgfCharge && !this._cctpCharge) {
        if (cctpStatus) cctpStatus.innerHTML = '⏳ <strong>En attente du CCTP...</strong>';
      }
      const pret = this._cctpCharge && this._dpgfCharge;
      [btnRapport, btnDPGF, btnDevis].forEach(btn => {
        if (!btn) return;
        btn.disabled = !pret;
        btn.style.opacity = pret ? '1' : '0.4';
        btn.style.cursor  = pret ? 'pointer' : 'not-allowed';
        btn.title = pret ? '' : 'Chargez CCTP + DPGF pour activer';
      });
      if (pret) App.toast('✅ CCTP + DPGF chargés — rapport et export disponibles', 'success');
    },\n"""
new7 = verifier + old7
if old7 in c: c = c.replace(old7, new7, 1); changes.append("7 OK")
else: changes.append("7 FAIL: " + repr(old7[:50]))

with open(r"C:\PlaQproWEB\js\dpgf.js", "w", encoding="utf-8") as f:
    f.write(c)

print("Changes:", changes)
