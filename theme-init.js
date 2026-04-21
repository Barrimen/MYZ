/**
 * theme-init.js — Initialisation du thème depuis Firestore
 * Ce script doit être inclus AVANT les autres scripts et CSS.
 * Applique les défauts immédiatement (pas de FOUC), puis charge
 * la config Firestore de façon asynchrone et met à jour les variables.
 */

(function() {
  const DEFAULT_THEME = {
    baseFontSize: 18,
    goldColor: '#c7901e',
    bgColor: '#0e0c0a',
    textColor: '#d1c2a6',
    borderIntensity: 1.0
  };

  const FIRESTORE_URL =
    'https://firestore.googleapis.com/v1/projects/myz-campagne/databases/(default)/documents/config/theme';

  function applyThemeConfig(config) {
    const root = document.documentElement;
    root.style.setProperty('--base-size', config.baseFontSize + 'px');
    root.style.setProperty('--gold', config.goldColor);
    root.style.setProperty('--bg', config.bgColor);
    root.style.setProperty('--text', config.textColor);
    const intensity = config.borderIntensity;
    root.style.setProperty('--border',   adjustBrightnessHex(config.bgColor, 30 * intensity));
    root.style.setProperty('--border2',  adjustBrightnessHex(config.bgColor, 50 * intensity));
    root.style.setProperty('--surface',  adjustBrightnessHex(config.bgColor, 15 * intensity));
    root.style.setProperty('--surface2', adjustBrightnessHex(config.bgColor, 25 * intensity));
    root.style.setProperty('--surface3', adjustBrightnessHex(config.bgColor, 40 * intensity));
  }

  function adjustBrightnessHex(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  // Convertit le format natif Firestore REST en objet plat
  function parseFirestoreDoc(doc) {
    if (!doc || !doc.fields) return null;
    const out = {};
    for (const [k, v] of Object.entries(doc.fields)) {
      if (v.stringValue  !== undefined) out[k] = v.stringValue;
      else if (v.integerValue !== undefined) out[k] = parseInt(v.integerValue);
      else if (v.doubleValue  !== undefined) out[k] = v.doubleValue;
    }
    return out;
  }

  // 1. Applique les défauts immédiatement (évite le flash)
  applyThemeConfig(DEFAULT_THEME);

  // 2. Charge la config Firestore et met à jour les variables si disponible
  fetch(FIRESTORE_URL)
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      const config = parseFirestoreDoc(data);
      if (config) applyThemeConfig(Object.assign({}, DEFAULT_THEME, config));
    })
    .catch(() => {}); // Firestore indisponible → on garde les défauts

  // Exposé globalement pour config.html (aperçu en direct)
  window.themeConfig = {
    DEFAULT_THEME,
    applyThemeConfig,
    adjustBrightnessHex
  };
})();
