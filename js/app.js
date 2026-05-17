/* ══════════════════════════════════════════════
   METIN2 WIKI FR — app.js
   Point d'entrée principal — importe et initialise
   tous les modules
   ══════════════════════════════════════════════ */

import { initParticles } from './particles.js';
import { initClasses }   from './classes.js';
import { initQuests }    from './quests.js';
import { initNavbar, initParallax, initSaviez } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initClasses();
  initQuests();
  initNavbar();
  initParallax();
  initSaviez();
});
