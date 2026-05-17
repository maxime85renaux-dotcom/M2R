/* ══════════════════════════════════════════════
   METIN2 WIKI FR — ui.js
   Navbar · Parallax · Saviez-vous · Back to top
   ══════════════════════════════════════════════ */

/* ── NAVBAR ACTIVE + BACK TO TOP ── */
export function initNavbar() {
  const btt      = document.getElementById('btt');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Back to top visibility
    if (btt) btt.classList.toggle('show', window.scrollY > 400);

    // Active nav link
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 88) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
}

/* ── PARALLAX VIDÉO HERO ── */
export function initParallax() {
  const vid  = document.getElementById('bgvid');
  const hero = document.getElementById('hero');
  if (!vid || !hero) return;

  hero.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - .5) * 6;
    const y = (e.clientY / window.innerHeight - .5) * 3;
    vid.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
  });
}

/* ── SAVIEZ-VOUS ── */
const FACTS = [
  "Le mari de Ah-Yu est mort à la guerre.",
  "Le PNJ Esprit d'un Sura s'appelle Akuma.",
  "L'Amiral Angmur est le chef militaire de l'empire Chunjo.",
  "Les missions biologiques donnent des bonus permanents cumulatifs.",
  "Un cheval au niveau 21 peut attaquer en se déplaçant.",
  "Il faut 55 réussites pour passer du stade Maître au Grand Maître.",
  "L'Embuscade d'un Ninja inflige des dégâts massifs dans le dos.",
  "Corps puissant au niveau G1 empêche le Guerrier Mental de tomber.",
  "La compétence Soin peut retirer des effets négatifs.",
  "Berserk augmente la vitesse d'attaque mais aussi les dégâts reçus.",
  "Un Accélérateur réduit le temps d'étude de Chaegirab.",
  "La Tour de Gumsan est nécessaire pour le Cheval Militaire.",
  "Les quêtes Yohara donnent des Gemmes ou des Reliques d'âme.",
  "Pour la 8ème compétence, la 7ème doit être au niveau Parfait.",
  "Il faut 21 médailles équestres pour toutes les missions d'équitation.",
  "Le taux biologique est ~50% — comptez ~20 jours pour la première.",
  "Waryong, Imha et Jungrang sont les trois zones de guilde.",
];

export function initSaviez() {
  const textEl = document.getElementById('svtext');
  const btn    = document.getElementById('svbtn');
  if (!textEl) return;

  let idx = Math.floor(Math.random() * FACTS.length);

  // Utilise textContent, jamais innerHTML (anti-XSS)
  textEl.textContent = FACTS[idx];

  if (btn) {
    btn.addEventListener('click', () => {
      idx = (idx + 1) % FACTS.length;
      textEl.textContent = FACTS[idx];
    });
  }
}
