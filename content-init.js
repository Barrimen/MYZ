// content-init.js — mini-CMS : remplace les [data-content] depuis Firestore
(function () {
  var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';

  var D = {
    global: {
      loginTitle:    'Connexion',
      loginSub:      'Accès écriture',
      footerCredit:  'Mutant : Year Zero · Free League Publishing',
      footerPrivate: 'Portail de campagne — usage privé'
    },
    index: {
      pageSubtitle: 'Portail de campagne · Mutant Year Zero'
    },
    relations: {
      pageTitle:      '🕸 La Toile des Relations',
      emptyTitle:     'La toile est vide',
      emptyHint:      'Connectez-vous ou cliquez sur « + Personnage » pour commencer',
      emptyHintAuth:  'Cliquez sur le canvas ou utilisez « + Personnage » pour commencer',
      journalTitle:   'Journal des relations',
      journalEmpty:   'Aucune action pour l\'instant.',
      btnAddNode:     '+ Personnage',
      btnAddRelation: '+ Relation'
    },
    chronique: {
      pageTitle:         '📖 La Chronique du Peuple',
      emptyTitle:        'La chronique attend d\'être écrite',
      emptySubtitle:     'Connectez-vous pour ajouter des séances',
      emptySubtitleAuth: 'Sélectionnez une séance ou créez-en une nouvelle',
      sidebarLabel:      'Séances de campagne',
      momentsTitle:      'Moments',
      timelineEmpty:     'Aucune séance'
    }
  };

  window.contentStrings = Object.assign({}, D.global, D[page] || {});
  window.contentDefaults = D;

  function apply(strings) {
    Object.assign(window.contentStrings, strings);
    document.querySelectorAll('[data-content]').forEach(function (el) {
      var k = el.getAttribute('data-content');
      if (strings[k] !== undefined) el.textContent = strings[k];
    });
  }

  apply(window.contentStrings);

  var BASE = 'https://firestore.googleapis.com/v1/projects/myz-campagne/databases/(default)/documents/content/';

  function parse(data) {
    var f = data && data.fields && data.fields.strings &&
            data.fields.strings.mapValue && data.fields.strings.mapValue.fields;
    if (!f) return null;
    var out = {};
    Object.keys(f).forEach(function (k) {
      if (f[k].stringValue !== undefined) out[k] = f[k].stringValue;
    });
    return out;
  }

  function load(id) {
    fetch(BASE + id)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { var s = parse(d); if (s) apply(s); })
      .catch(function () {});
  }

  load('global');
  if (page !== 'global' && page !== 'config') load(page);
})();
