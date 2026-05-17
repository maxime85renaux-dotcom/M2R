/* ══════════════════════════════════════════════
   METIN2 WIKI FR — classes.js
   Gestion des panneaux dépliants de classes
   ══════════════════════════════════════════════ */

const CLASS_IDS = ['guerrier', 'sura', 'ninja', 'chamane'];

export function initClasses() {
  const grid = document.getElementById('class-grid');
  if (!grid) return;

  // Attache les événements via data-class (plus de onclick inline)
  grid.querySelectorAll('.cc').forEach(card => {
    card.addEventListener('click', () => toggleClass(card.dataset.class));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleClass(card.dataset.class);
      }
    });
  });

  // Fermer via bouton ✕
  grid.querySelectorAll('.cp-close').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.close;
      closeClass(id);
    });
  });
}

function toggleClass(id) {
  const grid  = document.getElementById('class-grid');
  const card  = grid.querySelector(`.cc.${id}`);
  const panel = document.getElementById(`panel-${id}`);
  if (!card || !panel) return;

  const isOpen = panel.classList.contains('open');

  // Ferme tout
  CLASS_IDS.forEach(c => {
    const el = grid.querySelector(`.cc.${c}`);
    const p  = document.getElementById(`panel-${c}`);
    if (el) { el.classList.remove('open'); el.setAttribute('aria-expanded', 'false'); }
    if (p)  p.classList.remove('open');
  });

  if (!isOpen) {
    card.classList.add('open');
    card.setAttribute('aria-expanded', 'true');
    panel.classList.add('open');

    // Repositionne le panneau après la ligne courante
    const cards = [...grid.querySelectorAll('.cc')];
    const cols  = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const idx   = cards.indexOf(card);
    const row   = Math.floor(idx / cols);
    const lastInRow = cards[(row + 1) * cols - 1] ?? cards[cards.length - 1];
    lastInRow.after(panel);

    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
  }
}

function closeClass(id) {
  const grid  = document.getElementById('class-grid');
  const card  = grid?.querySelector(`.cc.${id}`);
  const panel = document.getElementById(`panel-${id}`);
  if (card)  { card.classList.remove('open'); card.setAttribute('aria-expanded', 'false'); }
  if (panel) panel.classList.remove('open');
}
