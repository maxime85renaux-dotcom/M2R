/* ══════════════════════════════════════════════
   METIN2 WIKI FR — quests.js
   Panneaux dépliants quêtes + onglets internes
   ══════════════════════════════════════════════ */

const QUEST_IDS = ['chasse', 'bio', 'livres', 'equit', 'liste'];

export function initQuests() {
  const grid = document.getElementById('quest-grid');
  if (!grid) return;

  // Vignettes cliquables
  grid.querySelectorAll('.qc').forEach(card => {
    card.addEventListener('click', () => toggleQuest(card.dataset.quest));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleQuest(card.dataset.quest);
      }
    });
  });

  // Boutons fermer
  grid.querySelectorAll('.qcp-close').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      closeQuest(btn.dataset.close);
    });
  });

  // Onglets internes (showH, showQ, showL unifiés)
  document.querySelectorAll('.qtab[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn));
  });
}

function toggleQuest(id) {
  const grid  = document.getElementById('quest-grid');
  const card  = grid.querySelector(`.qc.q${id}`);
  const panel = document.getElementById(`panel-${id}`);
  if (!card || !panel) return;

  const isOpen = panel.classList.contains('open');

  QUEST_IDS.forEach(q => {
    const el = grid.querySelector(`.qc.q${q}`);
    const p  = document.getElementById(`panel-${q}`);
    if (el) { el.classList.remove('open'); el.setAttribute('aria-expanded', 'false'); }
    if (p)  p.classList.remove('open');
  });

  if (!isOpen) {
    card.classList.add('open');
    card.setAttribute('aria-expanded', 'true');
    panel.classList.add('open');

    const cards = [...grid.querySelectorAll('.qc')];
    const cols  = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const idx   = cards.indexOf(card);
    const row   = Math.floor(idx / cols);
    const lastInRow = cards[(row + 1) * cols - 1] ?? cards[cards.length - 1];
    lastInRow.after(panel);

    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
  }
}

function closeQuest(id) {
  const grid  = document.getElementById('quest-grid');
  const card  = grid?.querySelector(`.qc.q${id}`);
  const panel = document.getElementById(`panel-${id}`);
  if (card)  { card.classList.remove('open'); card.setAttribute('aria-expanded', 'false'); }
  if (panel) panel.classList.remove('open');
}

/**
 * Onglets internes scoped — un seul handler pour showH / showQ / showL
 * Utiliser data-panel="targetId" sur chaque .qtab
 */
function switchTab(btn) {
  const tabsEl = btn.closest('.qtabs');
  const parent = tabsEl.parentElement;
  const targetId = btn.dataset.panel;

  tabsEl.querySelectorAll('.qtab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  parent.querySelectorAll(':scope > .qpanel').forEach(p => p.classList.remove('active'));
  const target = parent.querySelector(`#${targetId}`);
  if (target) target.classList.add('active');
}
