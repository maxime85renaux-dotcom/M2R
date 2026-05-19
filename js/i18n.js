/* ══════════════════════════════════════════════
   i18n.js — Moteur de traduction FR/EN
   localStorage · data-i18n · data-i18n-html
   ══════════════════════════════════════════════ */

(function () {
  /* ── Langues disponibles ── */
  const LANGS = { fr: LANG_FR, en: LANG_EN };
  const DEFAULT_LANG = 'fr';
  const LS_KEY = 'm2return_lang';

  /* ── Langue active ── */
  let currentLang = localStorage.getItem(LS_KEY) || DEFAULT_LANG;
  if (!LANGS[currentLang]) currentLang = DEFAULT_LANG;

  /* ── Traduire une clé ── */
  function t(key) {
    return LANGS[currentLang][key] || LANGS[DEFAULT_LANG][key] || key;
  }

  /* ── Appliquer toutes les traductions au DOM ── */
  function applyTranslations() {
    /* Texte simple */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });

    /* HTML (pour les chaînes avec balises <strong>, <em>, etc.) */
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = t(key);
    });

    /* Attributs title/placeholder/aria-label */
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    /* Metadonnées */
    document.title = t('page.title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t('page.description');

    /* Attribut lang sur <html> */
    document.documentElement.lang = currentLang;

    /* Bouton langue */
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.textContent = t('lang.toggle');
  }

  /* ── Changer de langue ── */
  function setLang(lang) {
    if (!LANGS[lang]) return;
    currentLang = lang;
    localStorage.setItem(LS_KEY, lang);
    applyTranslations();

    /* Animation flash sur le body pour signaler le changement */
    document.body.classList.add('lang-switch');
    setTimeout(() => document.body.classList.remove('lang-switch'), 300);
  }

  /* ── Créer le bouton de langue dans la navbar ── */
  function createLangButton() {
    const nav = document.querySelector('.nav-links');
    if (!nav) return;

    const btn = document.createElement('button');
    btn.id = 'lang-toggle-btn';
    btn.className = 'lang-btn';
    btn.setAttribute('aria-label', 'Switch language');
    btn.textContent = t('lang.toggle');

    btn.addEventListener('click', () => {
      setLang(currentLang === 'fr' ? 'en' : 'fr');
    });

    nav.appendChild(btn);
  }

  /* ── Init ── */
  function init() {
    createLangButton();
    applyTranslations();
  }

  /* ── Exposer globalement ── */
  window.i18n = { t, setLang, getLang: () => currentLang };

  /* ── Lancer après le DOM ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
