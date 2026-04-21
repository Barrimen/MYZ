/**
 * theme-init.js — Initialisation du thème customisé depuis localStorage
 * Ce script doit être inclus AVANT les autres scripts et CSS
 */

(function() {
  // Valeurs par défaut du thème
  const DEFAULT_THEME = {
    baseFontSize: 18,        // px
    goldColor: '#c7901e',    // Couleur dorée principale
    bgColor: '#0e0c0a',      // Couleur de fond
    textColor: '#d1c2a6',    // Couleur du texte
    borderIntensity: 1.0     // 0.5 à 1.5
  };

  const STORAGE_KEY = 'myz-theme-config';

  // Récupérer la configuration depuis localStorage ou utiliser les défauts
  function getThemeConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        // Fusionner avec les défauts pour s'assurer que tous les champs existent
        return Object.assign({}, DEFAULT_THEME, config);
      }
    } catch (e) {
      console.error('Erreur lecture localStorage:', e);
    }
    return DEFAULT_THEME;
  }

  // Appliquer la configuration au document
  function applyThemeConfig(config) {
    const root = document.documentElement;
    
    // Taille de police de base
    root.style.setProperty('--base-size', config.baseFontSize + 'px');
    
    // Couleurs
    root.style.setProperty('--gold', config.goldColor);
    root.style.setProperty('--bg', config.bgColor);
    root.style.setProperty('--text', config.textColor);
    
    // Intensité des bordures (modifie les couleurs dérivées)
    const intensity = config.borderIntensity;
    
    // Réduire/augmenter les saturation des bordures
    const borderColor = adjustBrightnessHex(config.bgColor, 30 * intensity);
    root.style.setProperty('--border', borderColor);
    root.style.setProperty('--border2', adjustBrightnessHex(config.bgColor, 50 * intensity));
    
    // Surfaces dérivées
    root.style.setProperty('--surface', adjustBrightnessHex(config.bgColor, 15 * intensity));
    root.style.setProperty('--surface2', adjustBrightnessHex(config.bgColor, 25 * intensity));
    root.style.setProperty('--surface3', adjustBrightnessHex(config.bgColor, 40 * intensity));
  }

  // Utilitaire pour ajuster la luminosité d'une couleur hex
  function adjustBrightnessHex(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  // Initialiser au chargement du document
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const config = getThemeConfig();
      applyThemeConfig(config);
    });
  } else {
    const config = getThemeConfig();
    applyThemeConfig(config);
  }

  // Exposer les fonctions globalement pour config.html
  window.themeConfig = {
    DEFAULT_THEME,
    STORAGE_KEY,
    getThemeConfig,
    applyThemeConfig,
    adjustBrightnessHex,
    saveConfig: function(config) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        applyThemeConfig(config);
        return true;
      } catch (e) {
        console.error('Erreur sauvegarde theme:', e);
        return false;
      }
    },
    resetConfig: function() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        applyThemeConfig(DEFAULT_THEME);
        return true;
      } catch (e) {
        console.error('Erreur reset theme:', e);
        return false;
      }
    }
  };
})();
