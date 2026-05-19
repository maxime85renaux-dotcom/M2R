/* ══════════════════════════════════════════════
   METIN2 WIKI FR — app-standalone.js
   Zéro onclick inline — tout via addEventListener
   Compatible file:// et serveur local
   ══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   CONFIG CENTRALE — modifier ici, effet partout
   ══════════════════════════════════════════════ */
const CONFIG = {
  particles: {
    max:       60,    /* nb max de braises simultanées  */
    spawnRate: 0.2,   /* probabilité de spawn par frame */
    seed:      45,    /* particules initiales           */
  },
  resize:  { debounce: 200 }, /* ms entre deux recalculs resize */
  scroll:  { debounce:  80 }, /* ms entre deux recalculs scroll */
};

/* ── Raccourci i18n global — dispo dès que i18n.js est chargé ── */
function t(k) { return window.i18n ? window.i18n.t(k) : k; }

/* ── Debounce générique ── */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ── Lazy init : n'appelle fn() que si le sélecteur existe dans le DOM ── */
function safeInit(selector, fn) {
  if (document.querySelector(selector)) fn();
}

document.addEventListener('DOMContentLoaded', () => {
  /* Animations désactivées si prefers-reduced-motion */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    safeInit('#ptc',            initParticles);
    safeInit('#logo-particles', initLogoParticles);
  }

  /* Sections — initialisées seulement si présentes dans la page */
  safeInit('#class-grid',  initClasses);
  safeInit('.em-zone',     initEmpireMap);
  safeInit('#quest-grid',  initQuests);
  safeInit('[data-panel]', initTabs);
  safeInit('.nav-links',   initNavbar);
  safeInit('#hero',        initParallax);
  safeInit('#svtext',      initSaviez);
  safeInit('.tl-fresco',   initTimeline);

  /* Panneaux quêtes — chacun conditionnel à son conteneur */
  safeInit('#panel-liste',  initQuestRows);
  safeInit('#panel-bio',    initBioCards);
  safeInit('#panel-chasse', initChasseRows);
  safeInit('#panel-livres', initLivresRows);
  safeInit('#panel-equit',  initEquitRows);
});

/* ── PARTICULES BRAISES ── */
function initParticles() {
  const c = document.getElementById('ptc');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, pts = [], rafId, visible = true;

  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  function mk() {
    return { x: Math.random()*W, y: H+8, vx: (Math.random()-.5)*.3,
      vy: -(Math.random()*.48+.2), r: Math.random()*1.5+.28,
      life: 1, decay: Math.random()*.0025+.0015, hue: Math.random()*25+8 };
  }

  resize();
  window.addEventListener('resize', debounce(resize, CONFIG.resize.debounce), { passive: true });

  for (let i=0; i<CONFIG.particles.seed; i++) { const p=mk(); p.y=Math.random()*H; pts.push(p); }

  /* IntersectionObserver — stoppe les particules hors viewport */
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(c);

  function frame() {
    if (document.hidden || !visible) { rafId = requestAnimationFrame(frame); return; }
    ctx.clearRect(0,0,W,H);
    if (pts.length < CONFIG.particles.max && Math.random() < CONFIG.particles.spawnRate) pts.push(mk());
    pts = pts.filter(p => p.life > 0);
    pts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy; p.life-=p.decay; p.vx+=(Math.random()-.5)*.035;
      ctx.save(); ctx.globalAlpha=p.life*.45;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`hsl(${p.hue},86%,62%)`; ctx.fill(); ctx.restore();
    });
    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  /* Pause quand l'onglet est masqué */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else rafId = requestAnimationFrame(frame);
  });
}

/* ── PARTICULES LOGO ── */
function initLogoParticles() {
  const canvas = document.getElementById('logo-particles');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  const wrap = canvas.closest('.logo-particle-wrap');
  let W, H, pts = [], rafId, visible = true;

  function resize() {
    const rect = wrap.getBoundingClientRect();
    W = canvas.width  = rect.width  + 160;
    H = canvas.height = rect.height + 160;
  }
  function mk() {
    return { x: Math.random()*W, y: H+8, vx: (Math.random()-.5)*.3,
      vy: -(Math.random()*.48+.2), r: Math.random()*1.5+.28,
      life: 1, decay: Math.random()*.0025+.0015, hue: Math.random()*25+8 };
  }

  window.addEventListener('resize', debounce(resize, CONFIG.resize.debounce), { passive: true });

  /* IntersectionObserver — stoppe le canvas logo hors viewport */
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  function frame() {
    if (document.hidden || !visible) { rafId = requestAnimationFrame(frame); return; }
    ctx.clearRect(0,0,W,H);
    if (pts.length < CONFIG.particles.max && Math.random() < CONFIG.particles.spawnRate) pts.push(mk());
    pts = pts.filter(p => p.life > 0);
    pts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy; p.life-=p.decay; p.vx+=(Math.random()-.5)*.035;
      ctx.save(); ctx.globalAlpha=p.life*.45;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`hsl(${p.hue},86%,62%)`; ctx.fill(); ctx.restore();
    });
    rafId = requestAnimationFrame(frame);
  }

  /* Différé au premier rAF : getBoundingClientRect() retourne les bonnes dims */
  requestAnimationFrame(() => {
    resize();
    for (let i=0; i<CONFIG.particles.seed; i++) { const p=mk(); p.y=Math.random()*H; pts.push(p); }
    rafId = requestAnimationFrame(frame);
  });

  /* Pause onglet caché */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else rafId = requestAnimationFrame(frame);
  });
}

/* ── CLASSES ── */
const CLASS_IDS = ['guerrier','sura','ninja','chamane'];

/* ── CARTE EMPIRE INTERACTIVE ── */
function initEmpireMap() {
  const zones  = document.querySelectorAll('.em-zone');
  const imgs   = document.querySelectorAll('.em-img');
  const labels = document.querySelectorAll('.em-label');
  const panels = document.querySelectorAll('.em-info-panel');
  if (!zones.length) return;

  function selectEmpire(emp) {
    // Images
    imgs.forEach(i => i.classList.toggle('active', i.dataset.emp === emp));
    // Zones SVG
    zones.forEach(z => z.classList.toggle('active', z.dataset.emp === emp));
    // Labels
    labels.forEach(l => l.classList.toggle('active', l.dataset.emp === emp));
    // Infos
    panels.forEach(p => p.classList.toggle('active', p.dataset.info === emp));
  }

  zones.forEach(zone => {
    zone.addEventListener('click', () => selectEmpire(zone.dataset.emp));
    zone.addEventListener('mouseenter', () => {
      // Curseur change selon la zone
      zone.style.cursor = 'pointer';
    });
  });

  // Chunjo actif par défaut
  selectEmpire('c');
}

function initClasses() {
  const grid = document.getElementById('class-grid');
  if (!grid) return;

  // Ouvrir via data-class
  grid.querySelectorAll('[data-class]').forEach(card => {
    card.addEventListener('click', () => toggleClass(card.dataset.class));
    card.addEventListener('keydown', e => {
      if (e.key==='Enter' || e.key===' ') { e.preventDefault(); toggleClass(card.dataset.class); }
    });
  });

  // Fermer via data-close-class
  grid.querySelectorAll('[data-close-class]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); closeClass(btn.dataset.closeClass); });
  });
}

function toggleClass(id) {
  const grid  = document.getElementById('class-grid');
  const card  = grid.querySelector(`[data-class="${id}"]`);
  const panel = document.getElementById(`panel-${id}`);
  if (!card || !panel) return;
  const isOpen = panel.classList.contains('open');
  CLASS_IDS.forEach(c => {
    const el = grid.querySelector(`[data-class="${c}"]`);
    const p  = document.getElementById(`panel-${c}`);
    if (el) { el.classList.remove('open'); el.setAttribute('aria-expanded','false'); }
    if (p)  p.classList.remove('open');
  });
  if (!isOpen) {
    card.classList.add('open'); card.setAttribute('aria-expanded','true'); panel.classList.add('open');
    const cards = [...grid.querySelectorAll('[data-class]')];
    const cols  = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const idx   = cards.indexOf(card);
    const last  = cards[Math.min((Math.floor(idx/cols)+1)*cols-1, cards.length-1)];
    last.after(panel);
    setTimeout(() => panel.scrollIntoView({behavior:'smooth',block:'nearest'}), 60);
  }
}

function closeClass(id) {
  const grid  = document.getElementById('class-grid');
  const card  = grid?.querySelector(`[data-class="${id}"]`);
  const panel = document.getElementById(`panel-${id}`);
  if (card)  { card.classList.remove('open'); card.setAttribute('aria-expanded','false'); }
  if (panel) panel.classList.remove('open');
}

/* ── QUÊTES ── */
const QUEST_IDS = ['chasse','bio','livres','equit','liste'];

function initQuests() {
  const grid = document.getElementById('quest-grid');
  if (!grid) return;

  grid.querySelectorAll('[data-quest]').forEach(card => {
    card.addEventListener('click', () => toggleQuest(card.dataset.quest));
    card.addEventListener('keydown', e => {
      if (e.key==='Enter' || e.key===' ') { e.preventDefault(); toggleQuest(card.dataset.quest); }
    });
  });

  grid.querySelectorAll('[data-close-quest]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); closeQuest(btn.dataset.closeQuest); });
  });
}

function toggleQuest(id) {
  const grid  = document.getElementById('quest-grid');
  const card  = grid.querySelector(`[data-quest="${id}"]`);
  const panel = document.getElementById(`panel-${id}`);
  if (!card || !panel) return;
  const isOpen = panel.classList.contains('open');
  QUEST_IDS.forEach(q => {
    const el = grid.querySelector(`[data-quest="${q}"]`);
    const p  = document.getElementById(`panel-${q}`);
    if (el) { el.classList.remove('open'); el.setAttribute('aria-expanded','false'); }
    if (p)  p.classList.remove('open');
  });
  if (!isOpen) {
    card.classList.add('open'); card.setAttribute('aria-expanded','true'); panel.classList.add('open');
    const cards = [...grid.querySelectorAll('[data-quest]')];
    const cols  = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const idx   = cards.indexOf(card);
    const last  = cards[Math.min((Math.floor(idx/cols)+1)*cols-1, cards.length-1)];
    last.after(panel);
    setTimeout(() => panel.scrollIntoView({behavior:'smooth',block:'nearest'}), 60);
  }
}

function closeQuest(id) {
  const grid  = document.getElementById('quest-grid');
  const card  = grid?.querySelector(`[data-quest="${id}"]`);
  const panel = document.getElementById(`panel-${id}`);
  if (card)  { card.classList.remove('open'); card.setAttribute('aria-expanded','false'); }
  if (panel) panel.classList.remove('open');
}

/* ── ONGLETS (showH / showQ / showL unifiés) ── */
function initTabs() {
  document.querySelectorAll('[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabsEl = btn.closest('.qtabs');
      const parent = tabsEl.parentElement;
      tabsEl.querySelectorAll('.qtab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      parent.querySelectorAll(':scope > .qpanel').forEach(p => p.classList.remove('active'));
      const target = parent.querySelector(`#${btn.dataset.panel}`);
      if (target) target.classList.add('active');
    });
  });
}

/* ── NAVBAR ACTIVE + BACK TO TOP ── */
function initNavbar() {
  const btt      = document.getElementById('btt');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  const onScroll = debounce(() => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 88) cur = s.id; });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${cur}`));
  }, CONFIG.scroll.debounce);

  window.addEventListener('scroll', () => {
    if (btt) btt.classList.toggle('show', window.scrollY > 400);
    onScroll();
  }, { passive: true });
}

/* ── PARALLAX VIDÉO HERO ── */
function initParallax() {
  const vid  = document.getElementById('bgvid');
  const hero = document.getElementById('hero');
  if (!vid || !hero) return;

  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  hero.addEventListener('mousemove', e => {
    if (!heroVisible) return;
    const x = (e.clientX/window.innerWidth -.5)*6;
    const y = (e.clientY/window.innerHeight-.5)*3;
    vid.style.transform = `scale(1.05) translate(${x}px,${y}px)`;
  });
}

/* ── SAVIEZ-VOUS ── */
/* ── CHRONOLOGIE ── */
function initTimeline() {
  const fill  = document.getElementById('tl-fill');
  const fresco = document.querySelector('.tl-fresco');
  if (!fill || !fresco) return;

  const nodes = Array.from(document.querySelectorAll('.tl-node[data-date]'));
  if (!nodes.length) return;

  /* ── 1. Dates min/max depuis les data-date ── */
  function parseDate(str) {
    const [y, m] = str.split('-').map(Number);
    return new Date(y, (m || 1) - 1, 1).getTime();
  }

  const dates  = nodes.map(n => parseDate(n.dataset.date));
  const first  = dates[0];
  const last   = dates[dates.length - 1];
  const range  = last - first;

  /* % de progression temps réel */
  const nowPct = Math.min(100, Math.max(0, (Date.now() - first) / range * 100));

  /* ── 2. Positionner les nœuds sur la barre ── */
  function positionNodes() {
    const railW = fresco.offsetWidth;
    const PAD   = 48; /* px — correspond au padding left/right du fresco */
    const usable = railW - PAD * 2;

    nodes.forEach((node, i) => {
      const pct = (dates[i] - first) / range * 100;
      node.style.setProperty('--pos', pct + '%');
    });
  }

  /* ── 3. Anti-chevauchement des labels ── */
  function resolveOverlaps() {
    const MIN_GAP = 8; /* px entre deux labels */

    /* Récupérer les rects des labels après positionnement */
    const items = nodes.map(node => {
      const label = node.querySelector('.tl-label');
      const pin   = node.querySelector('.tl-pin-wrap');
      return { node, label, pin, rect: null };
    });

    /* Mesurer */
    items.forEach(it => {
      it.rect = it.label.getBoundingClientRect();
    });

    /* Alterner top/bot par défaut */
    items.forEach((it, i) => {
      const side = i % 2 === 0 ? 'top' : 'bot';
      it.label.className = 'tl-label tl-label--' + side;
      const stem = it.node.querySelector('.tl-stem');
      if (stem) {
        stem.className = 'tl-stem tl-stem--' + side;
      }
    });

    /* Passe de collision sur les labels du même côté */
    ['top', 'bot'].forEach(side => {
      const group = items.filter(it => it.label.classList.contains('tl-label--' + side));
      group.sort((a, b) => a.rect.left - b.rect.left);

      for (let i = 1; i < group.length; i++) {
        const prev = group[i - 1].rect;
        const curr = group[i].rect;
        const overlap = prev.right + MIN_GAP - curr.left;
        if (overlap > 0) {
          /* Flip ce label de l'autre côté */
          const other = side === 'top' ? 'bot' : 'top';
          group[i].label.className = 'tl-label tl-label--' + other;
          const stem = group[i].node.querySelector('.tl-stem');
          if (stem) stem.className = 'tl-stem tl-stem--' + other;
          /* Re-mesurer */
          group[i].rect = group[i].label.getBoundingClientRect();
        }
      }
    });
  }

  /* ── 4. Animation au scroll ── */
  function runTimeline() {
    positionNodes();

    /* Petit délai pour laisser le layout se stabiliser avant anti-overlap */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolveOverlaps();

        /* Remplir la barre */
        setTimeout(() => {
          fill.style.width = nowPct + '%';
          setTimeout(() => fill.classList.add('tl-fill--active'), 2500);
        }, 150);

        /* Apparition en cascade des nœuds */
        nodes.forEach((node, i) => {
          setTimeout(() => node.classList.add('tl-node--visible'), 300 + i * 220);
        });
      });
    });
  }

  /* Relancer si fenêtre redimensionnée */
  window.addEventListener('resize', debounce(() => {
    nodes.forEach(n => n.classList.remove('tl-node--visible'));
    fill.classList.remove('tl-fill--active');
    fill.style.width = '0%';
    setTimeout(runTimeline, 100);
  }, 250));

  /* Déclencher à l'intersection */
  const section = document.getElementById('chronologie');
  if (section) {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        runTimeline();
        observer.disconnect();
      }
    }, { threshold: .1 });
    observer.observe(section);
  } else {
    runTimeline();
  }
}

function initSaviez() {
  const textEl = document.getElementById('svtext');
  const btn    = document.getElementById('svbtn');
  if (!textEl) return;
  const facts = [
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
  let idx = Math.floor(Math.random() * facts.length);
  textEl.textContent = facts[idx];  // textContent = anti-XSS
  if (btn) btn.addEventListener('click', () => {
    idx = (idx+1) % facts.length;
    textEl.textContent = facts[idx];
  });
}


/* ═══════════════════════════════════════════════
   DONNÉES INLINE — compatible file://
   ═══════════════════════════════════════════════ */

const QUESTS_DATA = [{"niv":1,"nom":"Bienvenue sur metin","pnj":"Automatique","recompenses":"300 EXP · 200 Yang · 4× Potion rouge (p) · Bijoux en bois +0","processus":["Allez voir le Garde du village","Allez voir le Gardien du village","Allez voir la Marchande pour récupérer les Potions rouges (p)","Retournez voir le Gardien du village"]},{"niv":2,"nom":"Lettre du Garde du Village","pnj":"Automatique","recompenses":"550 EXP · 1.000 Yang · 15× Potion rouge (p)","processus":["Allez voir le Garde du village","Tuez 9 Chiens errants","Retournez voir le Garde du village"]},{"niv":3,"nom":"Aidez la Marchande","pnj":"Automatique","recompenses":"850 EXP · 5.000 Yang · 20× Potion bleue (p)","processus":["Parlez au Garde du village","Allez voir la Marchande","Apportez le livre au Magasin d'armures"]},{"niv":4,"nom":"Un nouvel arôme","pnj":"Marchande","recompenses":"1.000 EXP · 500 Yang","processus":["Allez voir la Marchande","Allez voir le Magasin d'armes","Récupérez 2 Lilas sur les Loups bleus","Retournez voir le Magasin d'armes","Achetez de l'Huile de Musc dans l'item-shop","Retournez voir la Marchande"]},{"niv":5,"nom":"L'apprentissage","pnj":"Automatique","recompenses":"4 points de compétences","processus":["Allez voir votre Maître de classe","Choisissez votre spécialité — ce choix est définitif"]},{"niv":6,"nom":"La mission du Forgeron","pnj":"Automatique","recompenses":"5.000 EXP · 1.500 Yang · Fourrure de loup+","processus":["Allez voir le Garde du village","Allez voir le Forgeron","Allez voir le Magasinier","Retournez voir le Forgeron"]},{"niv":6,"nom":"La Marchande","pnj":"Marchande","recompenses":"1.500 EXP · 1.000 Yang","processus":["Allez voir la Marchande","Allez voir Yonah le potier","Récupérez un Noyau de Pêche sur les Sangliers","Retournez voir Yonah","Retournez voir la Marchande"]},{"niv":7,"nom":"Le dîner","pnj":"Marchande","recompenses":"1.000 EXP · 1.500 Yang","processus":["Allez voir la Marchande","Allez voir le Magasin d'armures pour savoir ce qu'il veut manger","Retournez voir la Marchande et dites-lui ce que son père veut manger : ragoût épicé avec du gibier d'ours, un chou aromatique et deux œufs"]},{"niv":7,"nom":"Encore une autre faveur","pnj":"Automatique","recompenses":"1.500 EXP · 5.000 Yang","processus":["Allez voir le Forgeron","Trouvez le Pêcheur et livrez-lui la canne à pêche","Remettez l'argent au Forgeron"]},{"niv":7,"nom":"Le mariage de la fille","pnj":"Octavio","recompenses":"4.000 EXP · 5.000 Yang · Arme 0 à 20+3 selon la classe","processus":["Allez voir Octavio","Allez voir la Vieille dame","Récupérez une Fleur rouge sang sur les Loups alphas affamés","Récupérez une Fleur orange sur les Loups bleus affamés","Récupérez une Fleur jaune parfumée sur les Loups alphas bleus affamés","Retournez voir la Vieille dame avec les fleurs pour obtenir le Noble bouquet","Apportez le Noble bouquet à la sœur de la Vieille dame dans le village voisin","Retournez voir Octavio"]},{"niv":8,"nom":"Ingrédients pour le médicament","pnj":"Baek-Go","recompenses":"3.000 EXP · 5.000 Yang · Fourrure de loup","processus":["Allez voir Baek-Go","Récupérez un Foie de loup sur les Loups bleus","Retournez voir Baek-Go"]},{"niv":9,"nom":"Une lettre du Forgeron","pnj":"Forgeron","recompenses":"4.000 EXP · 3.000 Yang","processus":["Parlez au Forgeron","Portez la Lettre du forgeron à Deokbae, le bûcheron du village voisin","Retournez voir le Forgeron"]},{"niv":9,"nom":"Parlez au Garde du Village","pnj":"Automatique","recompenses":"9.500 EXP · 2.000 Yang","processus":["Parlez au Garde du village"]},{"niv":9,"nom":"Packs","pnj":"Automatique","recompenses":"Aucune","processus":["Lisez la quête"]},{"niv":10,"nom":"Allez voir le capitaine","pnj":"Automatique","recompenses":"9.500 EXP · 2.000 Yang","processus":["Allez voir le Capitaine","Trouvez Yu-Hwan le musicien dans le village voisin","Retournez voir le Capitaine"]},{"niv":10,"nom":"Trouvez Soon","pnj":"Aranyo","recompenses":"7.000 EXP · 10.000 Yang","processus":["Allez voir Aranyo","Allez voir Soon","Retournez parler à Aranyo et dites-lui où se trouve son mari"]},{"niv":10,"nom":"Aidez Soon","pnj":"Soon","recompenses":"6.000 EXP · 2.000 Yang","processus":["Parlez à Soon","Parlez à Uriel","Retournez voir Soon avec le classement : oiseau céleste, trois plis, eau, aile de grue"]},{"niv":11,"nom":"La commande d'armure","pnj":"Magasin d'armures","recompenses":"26.000 EXP · 15.000 Yang · Groin","processus":["Parlez au Magasin d'armures","Trouvez le Forgeron","Parlez à Uriel — tuez des Chiens errants pour obtenir le Livre d'Uriel, apportez-le à Uriel pour obtenir le minerai de fer","Parlez à Octavio — tuez des Ours pour obtenir une Bile, apportez-la pour le minerai de cuivre","Parlez à Yonah — tuez des Sangliers rouges pour la Terre glaise, apportez-la pour le charbon","Retournez parler au Forgeron avec les 3 minerais","Allez annoncer la nouvelle au Magasin d'armures"]},{"niv":12,"nom":"Allez parler au Capitaine","pnj":"Automatique","recompenses":"24.000 EXP · 3.500 Yang","processus":["Allez voir le Capitaine","Tuez 10 Loups alphas gris","Retournez parler au Capitaine"]},{"niv":12,"nom":"Le meilleur livre de cuisine","pnj":"Octavio","recompenses":"12.000 EXP · 5.000 Yang · Griffe de loup","processus":["Allez parler à Octavio","Allez voir Soon","Retournez parler à Octavio","Tuez des Loups gris jusqu'à obtenir un Intestin de loup","Retournez voir Octavio"]},{"niv":13,"nom":"Trouvez une fourrure de loup","pnj":"Vieille dame","recompenses":"15.000 EXP · Armure niveau 9 selon la classe","processus":["Parlez à la Vieille dame","Tuez des Loups gris jusqu'à obtenir une Fourrure de loup (quête)","Retournez parler à la Vieille dame"]},{"niv":14,"nom":"Détruisez les pierres metin","pnj":"Automatique","recompenses":"48.000 EXP · 10.000 Yang · Pierre d'esprit","processus":["Allez parler au Capitaine","Détruisez une Metin de Bataille","Retournez voir le Capitaine"]},{"niv":15,"nom":"Trouvez Yu-Hwan le musicien","pnj":"Automatique","recompenses":"45.000 EXP · 2.000 Yang","processus":["Allez parler au Capitaine","Trouvez Yu-Hwan dans le village voisin","Retournez parler au Capitaine"]},{"niv":15,"nom":"Le gâteau de riz","pnj":"Ah-Yu","recompenses":"26.000 EXP · 10.000 Yang","processus":["Parlez à Ah-Yu","Allez voir le Magasin d'armes","Allez parler à Octavio","Trouvez Yu-Rang dans le village voisin","Allez voir Taurean","Retournez voir Yu-Rang afin de récupérer le gâteau de riz","Apportez-le à Ah-Yu"]},{"niv":16,"nom":"Capturez l'espion","pnj":"Automatique","recompenses":"100.000 EXP · 5.000 Yang","processus":["Parlez au Capitaine","Tuez des Soldats du Serment Blanc et des Archers du Serment Blanc jusqu'à obtenir la Lettre","Retournez voir le Capitaine"]},{"niv":16,"nom":"Trouvez la hache d'or","pnj":"Forgeron","recompenses":"36.000 EXP · 10.000 Yang · Ornement","processus":["Parlez au Forgeron","Tuez des Soldats du Serment Blanc jusqu'à obtenir la Hache d'Or","Apportez-la au Forgeron"]},{"niv":17,"nom":"Le cadeau pour Chaegirab","pnj":"Wonda-Rim","recompenses":"40.000 EXP · 10.000 Yang · Livre de compétence OU 20.000 EXP · 20.000 Yang · Pépite d'or","processus":["Allez parler à Wonda-Rim","Allez voir Uriel pour une idée de cadeau","Retournez voir Wonda-Rim pour lui faire part de l'idée d'Uriel","Tuez des Mu-Rang jusqu'à obtenir 5 Fourrures de Mu-Rang","Apportez les fourrures à Wonda-Rim","Portez le cadeau à Chaegirab (il le refusera)","Retournez voir Wonda-Rim pour lui expliquer la situation","Apportez la fourrure à Yang-Shin dans le village voisin"]},{"niv":18,"nom":"Trouvez l'épingle à cheveux","pnj":"Marchande","recompenses":"60.000 EXP · 10.000 Yang · Ticket d'équitation","processus":["Allez voir la Marchande","Parlez au Forgeron","Parlez au Magasin d'armes","Tuez des Archers du Serment Blanc jusqu'à obtenir l'épingle volée","Apportez l'épingle à la Marchande"]},{"niv":19,"nom":"Trouvez mon frère","pnj":"Mirine","recompenses":"122.000 EXP · 5.000 Yang","processus":["Parlez à Mirine","Cherchez des informations auprès de Yu-Hwan le musicien du village voisin","Allez voir Yang-Shin","Apportez les informations à Mirine"]},{"niv":20,"nom":"Tuez Mi-Jung du serment blanc","pnj":"Gardien du village","recompenses":"122.000 EXP · 20.000 Yang · Bracelet d'argent","processus":["Parlez au Gardien du village","Allez tuer Mi-Jung","Retournez voir le Gardien du village"]},{"niv":21,"nom":"Cherchez les matériaux","pnj":"Magasin d'armes","recompenses":"122.000 EXP · 20.000 Yang · Arme 20+3 selon la classe","processus":["Parlez au Magasin d'armes","Allez voir Uriel — tuez des Tigres pour obtenir le Colis d'Uriel, retournez voir Uriel pour le minerai de fer","Allez voir Ariyoung dans le village voisin","Apportez la lettre d'Ariyoung à Ah-Yu","Retournez voir le Magasin d'armes"]},{"niv":22,"nom":"Le gardien malade","pnj":"Automatique","recompenses":"50.000 EXP · 12.000 Yang · Chaussures de fil d'or +4 · 5× Potion Violette (g)","processus":["Parlez au Gardien du village","Allez voir Baek-Go","Tuez des Tigres blancs jusqu'à obtenir des Herbes médicinales+","Tuez des Tigres jusqu'à obtenir un Foie d'un Tigre+","Apportez les ingrédients à Baek-Go","Apportez le remède au frère du Garde de la Tour au fond du Temple Hwang en moins de 20 minutes"]},{"niv":23,"nom":"Tuez Eun-Jung du serment blanc","pnj":"Gardien du village","recompenses":"150.000 EXP · 25.000 Yang · Collier d'or +4","processus":["Parlez au Gardien du village","Tuez Eun-Jung","Retournez voir le Gardien du village"]},{"niv":25,"nom":"La cavalerie lourde","pnj":"Capitaine","recompenses":"150.000 EXP · 30.000 Yang · Boucles d'oreilles d'or","processus":["Parlez au Capitaine","Parlez à Yu-Hwan","Parlez au Marchand Ambulant","Parlez à Uriel","Retournez voir le Capitaine"]},{"niv":25,"nom":"Vaincre les Jin-Hees","pnj":"Vieille dame","recompenses":"Anneau de couple","processus":["Parlez à la Vieille dame","Tuez 10 Jin-Hees","Retournez voir la Vieille dame"]},{"niv":26,"nom":"Le déserteur","pnj":"Yang-Shin","recompenses":"35.000 EXP · 17.500–35.000 Yang · Rose jaune","processus":["Parlez à Yang-Shin","Parlez à Nakajima","Parlez à Ah-Yu","Retournez parler à Yang-Shin"]},{"niv":27,"nom":"Tuer les Goo-Paes","pnj":"Ariyoung","recompenses":"300.000 EXP · 10.000 Yang","processus":["Parlez à Ariyoung","Parlez à la Marchande","Retournez parler à Ariyoung","Tuez Goo-Pae jusqu'à obtenir l'Alliance d'Ariyoung","Retournez voir Ariyoung"]},{"niv":27,"nom":"Détruisez la metin noire","pnj":"Capitaine","recompenses":"1.000.000 EXP · 15.000 Yang · Natte de ruban rouge · Ornement","processus":["Parlez au Capitaine","Détruisez une Metin Noire","Retournez voir le Capitaine"]},{"niv":28,"nom":"Le soucis d'Ah-Yu","pnj":"Ah-Yu","recompenses":"850.000 EXP OU 500.000 EXP + 40.000 Yang","processus":["Parlez à Yu-Hwan","Parlez à Ah-Yu","Tuez Bera pour obtenir une Patte d'Ours","Apportez la Patte d'Ours à Yang-Shin","Parlez à Ah-Yu"]},{"niv":29,"nom":"La porcelaine brisée","pnj":"Yonah","recompenses":"600.000 EXP · 38.000 Yang","processus":["Parlez à Yonah","Parlez à Taurean","Parlez à Harang","Parlez au Palefrenier","Obtenez 6 Foins sur les Soldats Barbares ou Forts Soldats Barbares (ou achetez-les à un joueur)","Apportez les Foins à Yonah"]},{"niv":30,"nom":"Les Lances","pnj":"Ah-Yu","recompenses":"300.000 EXP · 20.000 Yang","processus":["Parlez à Ah-Yu","Tuez des Archers Barbares, Minions Barbares, Soldats Barbares et Généraux Barbares jusqu'à obtenir les 3 Lances du mari","Parlez à Ah-Yu"]},{"niv":30,"nom":"Le secret des Pierres Metin","pnj":"Uriel","recompenses":"1.500.000 EXP · 20.000 Yang","processus":["Parlez à Uriel","Allez jusqu'au Monument Hasun dans le donjon des singes (Hasung Dong)","Parlez à Uriel","Allez jusqu'au Monument de Seul Rong dans la Vallée de Seungryong","Parlez à Uriel"]},{"niv":31,"nom":"Ramenez les fleurs","pnj":"Huahn-So","recompenses":"400.000 EXP · 12.000 Yang","processus":["Parlez à Huahn-So","Parlez à Ariyoung","Parlez à Huahn-So","Cherchez la Fleur rare dans les Fleurs sans nom","Parlez à Huahn-So"]},{"niv":32,"nom":"Les pages du livre secret 1","pnj":"Uriel","recompenses":"1.250.000 EXP · 50.000 Yang · Larme de la Déesse","processus":["Parlez à Uriel","Parlez au Marchand Ambulant","Ramenez-lui 20 Épées en argent (en vente au Magasin d'armes)","Obtenez la Page de journal intime sur le Monument de Weol","Apportez-la à Uriel"]},{"niv":32,"nom":"Les pages du livre secret 2","pnj":"Uriel","recompenses":"1.250.000 EXP · 50.000 Yang · 10× Drapeau blanc","processus":["Parlez à Uriel","Parlez à Yang-Shin","Tuez des Sorciers orcs élites jusqu'à obtenir la Page de journal intime","Apportez-la à Uriel"]},{"niv":33,"nom":"La nouvelle arme","pnj":"Forgeron","recompenses":"200.000 EXP · 20.000 Yang · Arme 25+3 selon la classe","processus":["Parlez au Forgeron","Piochez 100 Minerais d'or · 100 Minerais d'argent · 100 Minerais d'ébène","Retournez voir le Forgeron"]},{"niv":34,"nom":"La nouvelle armure","pnj":"Forgeron","recompenses":"200.000 EXP · 20.000 Yang · Armure 26+3 selon la classe","processus":["Parlez au Forgeron","Piochez 100 Minerais d'ébène · 100 Minerais de cuivre · 100 Morceaux de Perle","Retournez voir le Forgeron"]},{"niv":35,"nom":"La hache de Deokbae","pnj":"Deokbae","recompenses":"400.000 EXP · 30.000 Yang","processus":["Parlez à Deokbae","Tuez des Généraux barbares jusqu'à obtenir la Hache d'or de David Kim","Ramenez-la à Deokbae"]},{"niv":36,"nom":"Le frère disparu","pnj":"Mirine","recompenses":"600.000 EXP · 35.000 Yang","processus":["Parlez à Mirine","Parlez à Yu-Hwan","Parlez à Yang-Shin","Cherchez le Cultivateur de Ginseng","Apportez le Pendentif de Mirine et le Collier de jade +2 à Mirine"]},{"niv":37,"nom":"L'araignée à clochette","pnj":"Yu-Rang","recompenses":"700.000 EXP · 30.000 Yang","processus":["Parlez à Yu-Rang","Cherchez la clochette sur les Jeunes araignées","Parlez à Taurean","Tuez des Jeunes araignées pour accrocher la clochette","Parlez à Yu-Rang","Parlez à Taurean"]},{"niv":38,"nom":"Le Livre du Temple","pnj":"Soon","recompenses":"850.000 EXP · 20.000 Yang","processus":["Parlez à Soon","Parlez à Aranyo","Parlez à la Marchande","Parlez à Soon","Tuez des Fanatiques funestes jusqu'à obtenir le Livre du Temple Secret","Retournez voir Soon"]},{"niv":39,"nom":"Le Gâteau de riz perdu","pnj":"Yu-Rang","recompenses":"900.000 EXP · 25.000 Yang","processus":["Parlez à Yu-Rang","Vous avez 30 minutes pour obtenir le Gâteau de riz sur les Jeunes araignées","Retournez voir Yu-Rang — si le temps est écoulé, la quête se termine sans récompense"]},{"niv":40,"nom":"Les pages du livre secret 3","pnj":"Uriel","recompenses":"2.000.000 EXP · 50.000 Yang · Bénédiction de Vie","processus":["Parlez à Uriel","Tuez des Fiers fanatiques funestes jusqu'à obtenir la Page de journal intime","Apportez-la à Uriel"]},{"niv":40,"nom":"Les pages du livre secret 4","pnj":"Uriel","recompenses":"2.750.000 EXP · 50.000 Yang · Bénédiction Magique","processus":["Parlez à Uriel","Allez jusqu'au Monument Wha puis le Monument Su dans le Jungsun Dong","Retournez voir Uriel"]},{"niv":40,"nom":"Les pages du livre secret 5","pnj":"Uriel","recompenses":"750.000 EXP + 2.000.000 EXP (au niveau 47) · 50.000 Yang · Bénédiction Magique","processus":["Parlez à Uriel","Parlez au Capitaine","Parlez à Nakajima","Tuez le Capitaine bestial jusqu'à obtenir la Page de journal intime","Retournez voir Uriel une fois le niveau 47 atteint"]},{"niv":40,"nom":"Tuez les Généraux du vent noir","pnj":"Capitaine","recompenses":"1.000.000 EXP · Anneau de Langage (30 jours)","processus":["Parlez au Capitaine","Tuez une fois le Jak-To du Vent Noir, le To-Su du Vent Noir et le Gu-Ryung du Vent Noir","Retournez parler au Capitaine"]},{"niv":41,"nom":"La demande du Marchand","pnj":"Marchand Ambulant","recompenses":"1.100.000 EXP · Collier d'or · Bracelet d'or · Boucles d'oreilles d'or","processus":["Allez voir le Marchand Ambulant","Allez voir Ariyoung qui vous donne des Vêtements à rendre à Ah-Yu — retournez voir Ariyoung pour obtenir le Fil","Allez voir la Marchande — tuez Tigres et Tigres blancs pour Herbes médicinales + 100 Foies de tigre, échangez contre la Pièce de Joaillerie","Tuez des Sorciers orcs élites jusqu'à obtenir 100 Dents d'Unggyi","Apportez le Fil, la Pièce de Joaillerie et les Dents d'Unggyi au Marchand Ambulant"]},{"niv":42,"nom":"Grouic Grouic","pnj":"Octavio","recompenses":"600.000 EXP · 500.000 Yang · 3× Carpe amour grillé","processus":["Parlez à Octavio","Parlez au Pêcheur puis à Yonah puis au Forgeron","Obtenez 20 Pierres de Diamant","Retournez voir le Forgeron","Après 24h, récupérez les Tueuses de baleine auprès du Forgeron","Apportez-les au Pêcheur"]},{"niv":43,"nom":"Allez voir Wonda-Rim","pnj":"Wonda-Rim","recompenses":"1.250.000 EXP · 32.000 Yang","processus":["Parlez à Wonda-Rim","Parlez à Chaegirab","Tuez des Combattants orcs jusqu'à obtenir la Lettre","Retournez voir Wonda-Rim"]},{"niv":44,"nom":"La carte au trésor de Soon","pnj":"Soon","recompenses":"1.400.000 EXP · 25.000 Yang · Casque 41 selon la classe","processus":["Parlez à Soon","Tuez Bera, Lykos, Tigris et Scrofa jusqu'à obtenir les 4 Cartes au Trésor","Retournez parler à Soon","Parlez au Vieil homme qui vous donne un Coffre au trésor","Retournez parler à Soon"]},{"niv":45,"nom":"Le trésor du chasseur","pnj":"Yang-Shin","recompenses":"1.500.000 EXP · 35.000 Yang · 20× Cape de bravoure","processus":["Parlez à Yang-Shin","Tuez les singes dans le donjon des singes (Sangsun Dong) jusqu'à obtenir l'Arc ouvragé","Retournez parler à Yang-Shin"]},{"niv":46,"nom":"Laissez les morts reposer en paix","pnj":"Maître Dragon","recompenses":"1.700.000 EXP · 30.000 Yang · 3× Diamant","processus":["Parlez au Maître Dragon","Tuez des Fiers chefs funestes jusqu'à obtenir l'Écharpe du Temple et la Doctrine du Temple","Retournez parler au Maître Dragon"]},{"niv":47,"nom":"L'étable a des ennuis","pnj":"Yonah","recompenses":"1.800.000 EXP · Livre de quête difficile","processus":["Parlez à Yonah","Obtenez 10 Foins","Parlez au Palefrenier","Retournez parler à Yonah"]},{"niv":47,"nom":"Les pages du livre secret 5 (suite, niv. 47)","pnj":"Automatique","recompenses":"2.000.000 EXP · 50.000 Yang","processus":["Donnez à Uriel la page obtenue sur le Capitaine bestial (quête commencée au niveau 40)"]},{"niv":47,"nom":"Les pages du livre secret 6","pnj":"Automatique","recompenses":"3.000.000 EXP · 75.000 Yang · Bénédiction du Dragon","processus":["Parlez à Uriel","Allez voir le Monument Mok au fond du Kuahlo Dong","Retournez parler à Uriel"]},{"niv":47,"nom":"Les pages du livre secret 7","pnj":"Automatique","recompenses":"3.000.000 EXP · 75.000 Yang","processus":["Parlez à Yu-Hwan","Tuez des Hors la loi du Désert jusqu'à obtenir la Page de journal intime","Parlez à Yu-Hwan","Parlez à Uriel"]},{"niv":47,"nom":"Les pages du livre secret 8","pnj":"Automatique","recompenses":"3.000.000 EXP · 70.000 Yang · 20× Cape de bravoure","processus":["Parlez à Uriel","Tuez des Épéistes serpents et des Archers serpents jusqu'à obtenir la Page de journal intime","Parlez à Uriel"]},{"niv":48,"nom":"Un médicament pour Balso","pnj":"Balso le traître","recompenses":"1.900.000 EXP · 30.000 Yang","processus":["Allez voir Balso le traître","Tuez des Pestiférés jusqu'à obtenir Peste","Rapportez-le à Balso le traître"]},{"niv":49,"nom":"Œil d'araignée spéciaux","pnj":"Octavio","recompenses":"2.100.000 EXP · 20.000 Yang","processus":["Allez voir Octavio","Récupérez 100× Œil d'araignée sur les araignées du Désert de Yongbi","Ramenez-les à Octavio"]},{"niv":50,"nom":"Les pages du livre secret 9","pnj":"Uriel","recompenses":"5.000.000 EXP · 125.000 Yang · Symbole du Roi sage","processus":["Tuez des Soldats Araignées élites au Kuahlo Dong jusqu'à obtenir la Page de journal intime","Apportez-la à Uriel"]},{"niv":50,"nom":"Les pages du livre secret 10","pnj":"Automatique","recompenses":"5.500.000 EXP · 137.500 Yang · Gants du Roi sage","processus":["Allez au Mont Sohan","Trouvez la Page de journal intime dans la Vieille boîte à papiers","Rapportez la page à Uriel"]},{"niv":50,"nom":"Les pages du livre secret 11","pnj":"Automatique","recompenses":"6.000.000 EXP · 150.000 Yang · Médaille du Dragon","processus":["Tuez des Araignées à griffes au Kuahlo Dong jusqu'à obtenir la Page de journal intime","Rapportez-la à Uriel"]},{"niv":50,"nom":"Le code","pnj":"Capitaine","recompenses":"1.300.000 EXP · 20.000 Yang","processus":["Parlez au Capitaine","Résolvez l'anagramme proposée"]},{"niv":51,"nom":"Le secret de la porcelaine céladon","pnj":"Yonah","recompenses":"2.500.000 EXP · 35.000 Yang · Chaussures de jade +3","processus":["Parlez à Yonah","Parlez à Uriel","Parlez à Soon","Parlez au Marchand Ambulant","Retournez voir Soon","Retournez voir Yonah"]},{"niv":52,"nom":"Une bonne nuit de sommeil","pnj":"Capitaine","recompenses":"3.800.000 EXP · 270.000 Yang · Manuel selon la classe","processus":["Parlez au Capitaine","Parlez à Baek-Go","Parlez à Yu-Hwan","Retournez parler au Capitaine","Vengez les soldats en tuant des Bourreaux funestes, Invocateurs funestes, Hauts tourmenteurs et Hauts évocateurs","Retournez parler au Capitaine"]},{"niv":53,"nom":"La porcelaine vert pâle","pnj":"Yonah","recompenses":"3.000.000 EXP · 30.000 Yang","processus":["Parlez à Yonah","Tuez des Hors la loi du Désert pour obtenir le Sable du désert","Obtenez du Minerai de cristal","Tuez des Forts singes de pierre et Forts singes d'or pour obtenir le Sang de primate","Apportez le tout à Yonah"]},{"niv":54,"nom":"Les provisions","pnj":"Capitaine","recompenses":"3.750.000 EXP · 125.000 Yang · Bouclier tigre singe +3","processus":["Parlez au Capitaine","Parlez à la Marchande","Parlez au Capitaine","Parlez à Yang-Shin","Tuez des Tigres blancs maudits jusqu'à obtenir 20 Fourrures de tigre éclatantes","Retournez parler à Yang-Shin"]},{"niv":55,"nom":"Les pages du livre secret 12","pnj":"Automatique","recompenses":"7.500.000 EXP · 162.500 Yang","processus":["Chunjo → Monument de Weol à Pyungmoo | Jinno → Monument de Weol à Yongan | Shinsoo → Monument de Weol à Joan","Parlez à Uriel"]},{"niv":55,"nom":"Les pages du livre secret 13","pnj":"Automatique","recompenses":"14.500.000 EXP · 175.000 Yang · Livre du Chef","processus":["Tuez des Croques-mitaines jusqu'au changement de la quête","Allez au Monument Gum au Temple Hwang","Parlez à Uriel"]},{"niv":55,"nom":"La situation de Balso","pnj":"Balso le traître","recompenses":"4.000.000 EXP · 65.000 Yang","processus":["Parlez à Balso le traître","Parlez à Baek-Go","Tuez le Seigneur singe jusqu'à obtenir l'Herbe du donjon difficile","Apportez-la à Baek-Go pour obtenir les Médicaments","Apportez les Médicaments à Balso le traître"]},{"niv":56,"nom":"Soutien de dispositif de guerre","pnj":"Capitaine","recompenses":"4.500.000 EXP · 50.000 Yang · 3× Attaque perçante · 3× Attaque critique","processus":["Parlez au Capitaine","Tuez des Archers pestiférés jusqu'à obtenir 5.000 Hauts de flèches","Retournez parler au Capitaine"]},{"niv":57,"nom":"Trouvez des pattes de grenouilles","pnj":"Magasinier","recompenses":"5.000.000 EXP · 50.000 Yang","processus":["Parlez au Magasinier","Parlez à Octavio","Tuez des Chefs gren. arboricoles jusqu'à obtenir les Pattes de grenouille (quête)","Retournez parler à Octavio"]},{"niv":58,"nom":"Rencontrez l'espion","pnj":"Capitaine","recompenses":"5.500.000 EXP · 50.000 Yang · 3× Gardon rouge","processus":["Parlez au Capitaine","Chunjo → Pêcheur à Yongan | Jinno → Pêcheur à Joan | Shinsoo → Pêcheur à Pyungmoo","Retournez parler au Capitaine"]},{"niv":59,"nom":"Bingsu?","pnj":"Taurean","recompenses":"6.000.000 EXP · 70.000 Yang · Parchemin de guerre","processus":["Parlez à Taurean","Parlez à Harang","Parlez à Octavio","Tuez des Glaces enchantées jusqu'à obtenir 50 Glaçons","Échangez les Glaçons à Octavio contre la Glace et sirop","Retournez parler à Taurean"]},{"niv":60,"nom":"Temple obscur","pnj":"Soon","recompenses":"7.000.000 EXP · 70.000 Yang · Livre du chef (2h)","processus":["Parlez à Soon","Tuez des Invocateurs Ésot. élites jusqu'à obtenir l'Écharpe du Temple, la Doctrine du Temple et la Traduction du Livre Maudit","Retournez parler à Soon"]},{"niv":60,"nom":"Nation obscure I","pnj":"Uriel","recompenses":"12.000.000 EXP · 175.000 Yang · 10× Parchemin d'exorcisme · 10× Fleur de pêcher · 10× Lilas","processus":["Parlez à Uriel","Obtenez la Copie de l'épitaphe sur la Pierre tombale ancienne","Retournez parler à Uriel"]},{"niv":60,"nom":"Nation obscure II","pnj":"Uriel","recompenses":"9.700.000 EXP · 3× Lecture concentrée · Toile d'araignée · Glande venin d'araignée","processus":["Parlez à Uriel","Tuez des Arbres maléfiques jusqu'à obtenir le Document ancien","Retournez parler à Uriel","Tuez à nouveau des Arbres maléfiques jusqu'à obtenir les 9 autres Documents anciens","Retournez parler à Uriel"]},{"niv":66,"nom":"Le journal","pnj":"Uriel","recompenses":"9.500.000 EXP · 3× Parchemin de Bénédiction · Queue de scorpion","processus":["Parlez à Uriel","Tuez le Roi démon dans la Tour des démons (Tour de Gumsan)","Retournez parler à Uriel"]},{"niv":66,"nom":"Lettre anonyme","pnj":"Gardien du village","recompenses":"< 30 min : 4.500.000 EXP · 200.000 Yang · Porcelaine brisée + roses + baies | Sinon : 4.000.000 EXP · 100.000 Yang + roses + baies","processus":["Parlez au Gardien du village","Parlez à Lee Chung","Tuez 200 Dryades rouges, obtenez l'Antidote et apportez-le à Lee Chung en moins de 30 minutes","Parlez au Soldat empoisonné","Parlez à Lee Chung"]},{"niv":72,"nom":"La découverte","pnj":"Lee Chung","recompenses":"12.350.000 EXP · Anneau d'expérience (1h) · Morceau de tissu · Médicament inconnu ou Médicament inconnu+","processus":["Parlez à Lee Chung","Allez jusqu'à la Pierre effritée au Bois Rouge pour obtenir les Notes","Retournez parler à Lee Chung"]},{"niv":72,"nom":"Trésor glacé","pnj":"Lee Chung","recompenses":"40.000.000 EXP · 225.000 Yang · 3× Élixir du chercheur · Gants de voleur (2h) · Médaille de Chance","processus":["Parlez à Lee Chung","Tuez des Golems de glace, Yétis et Hommes de glace furieux jusqu'à obtenir des Essences de cristal bleu","Apportez 50 Essences de cristal bleu à Lee Chung (peut échouer)"]},{"niv":75,"nom":"Dans la grotte","pnj":"Seon-Hae","recompenses":"Pierre de sang","processus":["Parlez à Seon-Hae","Allez à Doyyumhwan — recherchez 7 Larmes pétrifiées aux points indiqués","Tuez des Flammes jusqu'à obtenir 4 Obsidiennes","Apportez le tout à Seon-Hae — vous recevez les Larmes de Baljit-Elvedin","Allez jusqu'au point indiqué au Bois Rouge","Cliquez sur le parchemin de quête pour obtenir la Goutte de sang","Apportez la Goutte de sang à Seon-Hae pour recevoir la Pierre de sang"]},{"niv":75,"nom":"Journal intime d'une légende","pnj":"Heuk-Young","recompenses":"89.000.000 EXP · 1.200.000 Yang · Journal légendaire","processus":["Parlez à Heuk-Young","Obtenez 12 Pages sur les Squelettes de Sura 1, 2, 3, 4 (Grotte de l'Exil) et Squelette de Sura 5 (Grotte de l'Exil 2)","Tuez des Golems de glace d'enfer jusqu'à obtenir 6 Pages supplémentaires","Apportez les 15 Pages à Heuk-Young"]},{"niv":78,"nom":"Quartz de l'enfer rouge","pnj":"Lee Chung","recompenses":"36.000.000 EXP · Élixir du soleil (g) · Orbe de bénédiction · Médaille d'attention (4h)","processus":["Parlez à Lee Chung","Tuez des Tigres de combat, Flammes et Guerriers flamme pour obtenir Terre volcanique, Crinières flamboyantes et Pierres de fondation","Apportez une fois chaque objet à Lee Chung pour tenter la création d'un Quartz de l'enfer rouge","Rendez 20 Quartz de l'enfer rouge à Lee Chung"]},{"niv":78,"nom":"Dernier élément","pnj":"Lee Chung","recompenses":"48.000.000 EXP · 230.000 Yang · Élixir de la lune (g) · Cuivre magique · Livre du chef (2h) · 2× Tête réduite (via Baek-Go)","processus":["Parlez à Lee Chung","Tuez des Arbres maléfiques rouges jusqu'à obtenir 100 Résines d'arbre sacré","Retournez parler à Lee Chung","Parlez à Baek-Go"]},{"niv":80,"nom":"Le Sombre Masque de Bois","pnj":"Soon","recompenses":"120M EXP + 3M Yang OU 70M EXP + 7× Médaille du Dragon OU 120M EXP + pack objets du dieu dragon","processus":["Parlez à Soon","Tuez des Esprits flammes jusqu'à ce que le Sombre Masque de Bois se transforme en Cendres Ensorcelées","Tuez des Yétis jusqu'à obtenir 10 Glaçons","Retournez parler à Soon","Allez jusqu'à l'Autel Sombre à la Grotte de l'Exil avec la Glace noire","Retournez parler à Soon"]},{"niv":80,"nom":"Monstre étrange","pnj":"Soon","recompenses":"—","processus":["Flèche sur Soon — quête automatique déclenchée après Le Sombre Masque de Bois"]},{"niv":84,"nom":"La bataille commence","pnj":"Lee Chung","recompenses":"63.000.000 EXP · 250.000 Yang · Gants du Roi sage · Symbole du Roi sage · Minerai de fer magique","processus":["Parlez à Lee Chung","Vous recevez la Larme du ciel de Lee Chung","Tuez Tartare"]},{"niv":84,"nom":"Prince Charon","pnj":"Automatique","recompenses":"84.000.000 EXP · 250.000 Yang · 2× Pierre du forgeron · 20× Cape de bravoure · Fruit de la vie","processus":["Tuez Charon"]},{"niv":90,"nom":"La mission de Lee Chung","pnj":"Lee Chung","recompenses":"50.000 Yang","processus":["Parlez à Lee Chung","Parlez au Téléporteur","Téléportez-vous à Cap Feu du Dragon"]},{"niv":90,"nom":"Rocher du Dragon Sombre","pnj":"Amiral Angmur","recompenses":"100.000 Yang","processus":["Parlez à l'Amiral Angmur","Atteignez les 3 points présents sur la carte","Retournez parler à l'Amiral Angmur"]},{"niv":90,"nom":"La Lettre de Lee Chung","pnj":"Amiral Angmur","recompenses":"6.247.460 EXP · 137.000 Yang · 10× Lilas","processus":["Parlez à l'Amiral Angmur","Tuez des Combattants gnoll, Archers gnoll, Défenseurs gnoll, Magiciens gnoll, Généraux gnoll ou le Garde gnoll suprême jusqu'à obtenir la Lettre de Lee Chung","Retournez parler à l'Amiral Angmur"]},{"niv":90,"nom":"La lettre gnolle I","pnj":"Amiral Angmur","recompenses":"15.630.000 EXP · 148.000 Yang · Anneau d'expérience (1h) · Queue de scorpion","processus":["Parlez à l'Amiral Angmur","Tuez le Général gnoll jusqu'à obtenir la Lettre Gnoll","Retournez parler à l'Amiral Angmur"]},{"niv":90,"nom":"La lettre gnolle II","pnj":"Amiral Angmur","recompenses":"23.130.000 EXP · 100.000 Yang · Morceau de gemme · 10× Baie","processus":["Parlez à l'Amiral Angmur","Tuez le Seigneur gnoll jusqu'à obtenir la 2ème Lettre Gnoll","Retournez parler à l'Amiral Angmur"]},{"niv":90,"nom":"La Manticore","pnj":"Amiral Angmur","recompenses":"12.933.700 EXP · 170.000 Yang · Peau de tigre blanc","processus":["Parlez à l'Amiral Angmur","Tuez 50× Combattants manticores · 40× Soldats manticores · 20× Bourreaux manticores · 10× Généraux core","Retournez parler à l'Amiral Angmur"]},{"niv":90,"nom":"Renforcer le mur de protection I","pnj":"Amiral Angmur","recompenses":"21.640.000 EXP · Molaire d'orc · 5× Rose des montagnes","processus":["Parlez à l'Amiral Angmur","Tuez des Combattants gnoll, Archers gnoll, Défenseurs gnoll, Magiciens gnoll, Généraux gnoll, Seigneurs gnoll et Gardes gnolls suprêmes jusqu'à obtenir 50 Sables fins","Retournez parler à l'Amiral Angmur"]},{"niv":90,"nom":"Renforcer le mur de protection II","pnj":"Amiral Angmur","recompenses":"22.380.000 EXP · 192.000 Yang · Gants de voleur (2h) · 2× Souvenir de Démon","processus":["Parlez à l'Amiral Angmur","Tuez des Combattants manticores, Soldats manticores, Mages manticores, Bourreaux manticores, Généraux core, Rakshasas et Martyaxwars jusqu'à obtenir 100 Briques","Retournez parler à l'Amiral Angmur"]},{"niv":91,"nom":"La lettre manticore","pnj":"Amiral Angmur","recompenses":"18.803.000 EXP · Talisman inconnu · 10× Eau de Dok","processus":["Parlez à l'Amiral Angmur","Tuez des Généraux core jusqu'à ce qu'une fenêtre s'ouvre vous informant qu'il a remis la lettre","Retournez parler à l'Amiral Angmur"]},{"niv":91,"nom":"Le repaire de Martyaxwar","pnj":"Amiral Angmur","recompenses":"37.310.000 EXP · Troisième main · 20× Campanule","processus":["Parlez à l'Amiral Angmur","Tuez Martyaxwar jusqu'à obtenir le Collier à clous","Retournez parler à l'Amiral Angmur"]},{"niv":91,"nom":"Décodage","pnj":"Yon-I-Walker","recompenses":"25.805.400 EXP · 214.000 Yang · 2× Médicament inconnu","processus":["L'Amiral Angmur vous enverra parler à Yon-I-Walker","Tuez des Guerriers crabes, Archers scorpioniques, Soldats crevettes, Ermites diaboliques et Crabes cuirassés pour obtenir des Tablettes carapax","Validez-en 10 auprès de Yon-I-Walker (peut échouer)"]},{"niv":91,"nom":"Lettre de Manticore décodée","pnj":"Yon-I-Walker","recompenses":"27.874.000 EXP · 225.000 Yang","processus":["Parlez à Yon-I-Walker","Tuez le Général homard et le Roi des crabes pour obtenir des Poudres de carapax","Rendez-en 3 à Yon-I-Walker (24h d'attente entre chaque poudre, peut échouer)"]},{"niv":91,"nom":"Empoisonné !","pnj":"Amiral Angmur","recompenses":"6.766.050 EXP · 2× Dard de scorpion","processus":["Parlez à l'Amiral Angmur","Allez jusqu'à la Fleur de rocher et obtenez la Racine de fleur rocher","Parlez à Yon-I-Walker"]},{"niv":92,"nom":"La lettre du voleur rouge","pnj":"Amiral Angmur","recompenses":"33.874.000 EXP · 200.000 Yang · 10× Eau de Zin","processus":["Parlez à l'Amiral Angmur","Tuez le Voleur rouge bourreau et le Général noir jusqu'à obtenir 4 Lettres du voleur rouge","Retournez parler à l'Amiral Angmur"]},{"niv":92,"nom":"La lettre du voleur rouge 2","pnj":"Amiral Angmur","recompenses":"20.874.600 EXP · 2× Livre maléfique","processus":["Parlez à l'Amiral Angmur","Trouvez le Soldat blessé à la Baie de Nephrite et obtenez la 5ème Lettre du voleur rouge","Retournez parler à l'Amiral Angmur"]},{"niv":92,"nom":"Décoder la lettre du voleur rouge","pnj":"Yon-I-Walker","recompenses":"52.310.000 EXP · 2× Perle blanche","processus":["Parlez à l'Amiral Angmur","Parlez à Yon-I-Walker","Tuez le Général kappa et Triton pour obtenir 10 Écailles d'Oin","Retournez parler à Yon-I-Walker"]},{"niv":92,"nom":"Sombres projets","pnj":"Amiral Angmur","recompenses":"24.911.300 EXP · 2× Perle bleue","processus":["Parlez à l'Amiral Angmur"]},{"niv":93,"nom":"Prendre des forces I","pnj":"Amiral Angmur","recompenses":"41.810.000 EXP · 2× Perle de sang","processus":["Parlez à l'Amiral Angmur","Parlez à Yon-I-Walker","Tuez Polyphème jusqu'à obtenir Lumière intérieure","Retournez parler à Yon-I-Walker"]},{"niv":93,"nom":"Prendre des forces II","pnj":"Yon-I-Walker","recompenses":"43.370.000 EXP · 302.000 Yang · Morceau de glace · 10× Eau de Mong","processus":["Parlez à Yon-I-Walker","Tuez le Roi Wobba jusqu'à obtenir Lumière intérieure","Retournez parler à Yon-I-Walker"]},{"niv":93,"nom":"Prendre des forces III","pnj":"Yon-I-Walker","recompenses":"17.904.600 EXP · 30.000 Yang · Lecture concentrée · Médaille de Chance","processus":["Parlez à Yon-I-Walker","Parlez à Octavio","Attendez 24 heures"]},{"niv":93,"nom":"La recette du Millénaire","pnj":"Octavio","recompenses":"31.374.000 EXP · 5× Parchemin de Bénédiction · 20× Champignon Tue","processus":["Parlez à Octavio","Collectez 200× Racine de gango · 200× Champignon Tue · 200× Rose des montagnes","Parlez à Octavio","Attendez 24 heures"]},{"niv":93,"nom":"Essence du Millénaire","pnj":"Octavio","recompenses":"19.920.800 EXP · 335.000 Yang · 20× Élixir du soleil (p) · Symbole du Roi sage","processus":["Parlez à Octavio","Collectez l'Essence du Millénaire","Retournez parler à Yon-I-Walker"]},{"niv":94,"nom":"Perle de Léviathan","pnj":"Yon-I-Walker","recompenses":"12.904.600 EXP · 346.000 Yang · 3× Parchemin d'exorcisme","processus":["Parlez à Yon-I-Walker","Recevez la Perle de Léviathan","Utilisez-la","Retournez parler à l'Amiral Angmur"]},{"niv":94,"nom":"Appel de la Montagne de Tonnerre","pnj":"Amiral Angmur","recompenses":"14.074.700 EXP · 357.000 Yang · 3× Porcelaine brisée","processus":["Parlez à l'Amiral Angmur","Explorez la Montagne de Tonnerre en vérifiant les points présents sur la carte","Retournez parler à l'Amiral Angmur"]},{"niv":94,"nom":"Affaiblissez les Voleurs Rouges","pnj":"Amiral Angmur","recompenses":"16.014.000 EXP · Orbe de bénédiction · 3× Morceau de tissu · 20× Eau de Hwal","processus":["Parlez à l'Amiral Angmur","Tuez des Chefs rouges brutaux jusqu'à obtenir La cape de chef","Retournez parler à l'Amiral Angmur"]},{"niv":94,"nom":"Affaiblissez le Cyclope","pnj":"Amiral Angmur","recompenses":"21.014.000 EXP · 379.000 Yang · Cuivre magique · Livre du chef (2h)","processus":["Parlez à l'Amiral Angmur","Tuez 30× Général Outis · 3× Argès · 1× Polyphème","Retournez parler à l'Amiral Angmur"]},{"niv":94,"nom":"Affaiblissez les Géants","pnj":"Amiral Angmur","recompenses":"37.550.000 EXP · 390.000 Yang · Minerai de fer magique · 2× Pierre du forgeron · 5× Haricot Zen · 10× Rosée blanche","processus":["Parlez à l'Amiral Angmur","Tuez le Roi Wobba jusqu'à obtenir 9× Totem Géant","Retournez parler à l'Amiral Angmur"]},{"niv":94,"nom":"Aux Montagnes de Tonnerre","pnj":"Amiral Angmur","recompenses":"11.355.698 EXP · Orbe de bénédiction","processus":["Parlez à l'Amiral Angmur","Tuez des Casseurs N'a-qu'un-œil, Soldats cyclopes, Magiciens cyclopes, Bourreaux cyclopes, Généraux Outis, Argès et Polyphème jusqu'à obtenir la Pierre Noire et la Page du journal","Retournez parler à l'Amiral Angmur"]},{"niv":94,"nom":"Or Noire","pnj":"Amiral Angmur","recompenses":"26.473.000 EXP · 5× Parchemin d'exorcisme","processus":["Parlez à l'Amiral Angmur","Parlez à l'Alchimiste","Tuez des Casseurs N'a-qu'un-œil, Soldats cyclopes, Magiciens cyclopes, Bourreaux cyclopes, Généraux Outis, Argès et Polyphème jusqu'à obtenir 30× Or Noire","Donnez 10× Or Noire à l'Alchimiste (peut échouer)","Retournez parler à l'Amiral Angmur"]},{"niv":95,"nom":"Fièvre de l'or","pnj":"Amiral Angmur","recompenses":"27.532.400 EXP · 302.000 Yang · Perle de sang","processus":["Parlez à l'Amiral Angmur","Tuez des Capitaines Crochet jusqu'à obtenir la Lettre du Capitaine Crochet","Retournez parler à l'Amiral Angmur"]},{"niv":95,"nom":"Détournez la Livraison","pnj":"Amiral Angmur","recompenses":"43.550.000 EXP · Morceau de glace","processus":["Parlez à l'Amiral Angmur","Tuez des Capitaines Shrouk jusqu'à obtenir le Cuir de Shrouk","Retournez parler à l'Amiral Angmur"]},{"niv":95,"nom":"Arrêtez le Traitement","pnj":"Amiral Angmur","recompenses":"33.003.900 EXP · Médaille de Chance · Lecture concentrée","processus":["Parlez à l'Amiral Angmur","Tuez Le gros ogre","Retournez parler à l'Amiral Angmur"]},{"niv":95,"nom":"Malédiction de Vie","pnj":"Amiral Angmur","recompenses":"30.943.600 EXP · 335.000 Yang · 5× Parchemin de Bénédiction","processus":["Parlez à l'Amiral Angmur","Tuez des Magiciens lémures jusqu'à obtenir la Tablette lémure","Retournez parler à l'Amiral Angmur"]},{"niv":95,"nom":"L'inscription","pnj":"Amiral Angmur","recompenses":"31.932.500 EXP · 337.000 Yang · Élixir du soleil (p) · Symbole du Roi sage","processus":["Parlez à l'Amiral Angmur","Tuez des Magiciens lémures jusqu'à obtenir les 2 Tablettes lémures manquantes","Retournez parler à l'Amiral Angmur"]},{"niv":95,"nom":"Chaos dans la Forêt Enchantée","pnj":"Gardien du temple","recompenses":"5.825.000 EXP · 5× Rose des montagnes","processus":["Parlez au Gardien du village — il vous remet un Esprit de la terre","Entrez dans le Temple Ochao et tuez le Gardien En-Tai","Passez le Portail créé par sa mort pour parvenir à la Forêt Enchantée","Parlez au Gardien de la forêt afin de lui remettre l'Esprit de la terre"]},{"niv":95,"nom":"Première exploration","pnj":"Gardien de la forêt","recompenses":"776.600 EXP (répétable)","processus":["Parlez au Gardien de la forêt","Tuez 50 Combattants En-Tai","Retournez voir le Gardien de la forêt"]},{"niv":95,"nom":"Cherchez la Trousse de secours","pnj":"Gardien de la forêt","recompenses":"776.600 EXP (répétable)","processus":["Parlez au Gardien de la forêt","Tuez des Druides En-Tai jusqu'à obtenir une Trousse de secours","Retournez voir le Gardien de la forêt"]},{"niv":95,"nom":"Remettre la Trousse de secours","pnj":"Gardien de la forêt","recompenses":"5.825.000 EXP · 10× Racine de gango (répétable)","processus":["Parlez au Gardien de la forêt","Apportez la Trousse de secours jusqu'au Guetteur de la forêt"]},{"niv":95,"nom":"Seconde exploration","pnj":"Guetteur de la forêt","recompenses":"7.766.000 EXP (répétable)","processus":["Parlez au Guetteur de la forêt","Détruisez 5 Metins des êtres sylv.","Retournez voir le Guetteur de la forêt"]},{"niv":95,"nom":"Récupérer la Rosée En-Tai","pnj":"Guetteur de la forêt","recompenses":"7.766.000 EXP · 10× Eau de Yuong (répétable)","processus":["Parlez au Guetteur de la forêt","Tuez des Destructeurs En-Tai jusqu'à obtenir 5× Rosée En-Tai","Apportez-les au Guetteur de la forêt"]},{"niv":95,"nom":"Tuez le Seigneur En-Tai","pnj":"Éclaireur de la forêt","recompenses":"11.650.000 EXP (répétable)","processus":["Parlez à l'Éclaireur de la forêt","Tuez le Seigneur En-Tai jusqu'à obtenir le Bois précieux","Retournez voir l'Éclaireur de la forêt"]},{"niv":95,"nom":"Trouvez une Émeraude boisée","pnj":"Éclaireur de la forêt","recompenses":"11.650.000 EXP · Pierre des Dryades (répétable)","processus":["Parlez à l'Éclaireur de la forêt","Tuez le Seigneur En-Tai jusqu'à obtenir l'Émeraude boisée","Retournez voir l'Éclaireur de la forêt"]}];

const BIO_DATA = [
  {id:"b1",nom:"Biologiste 1",niv:30,pnj:"Chaegirab",attente:"2h par objet, taux ~50%",objets:"Molaire d'orc ×10 · Pierre d'âme de Jinunggy",bonus:"+10 Vitesse de déplacement (permanent)",processus:["Parlez à Chaegirab au niveau 30","Apportez-lui une Molaire d'orc — il l'étudie pendant 2h minimum","Revenez après 2h : 50% de chances que l'objet soit validé","Répétez jusqu'à 10 réussites (comptez ~20 molaires en moyenne)","Une fois 10 réussites atteintes, apportez la Pierre d'âme de Jinunggy","Vous recevez le bonus permanent +10 Vitesse de déplacement"]},
  {id:"b2",nom:"Biologiste 2",niv:40,pnj:"Chaegirab",attente:"2h par objet, taux ~50%",objets:"Livre maléfique ×15 · Pierre d'âme du Temple",bonus:"+5 Vitesse d'attaque (permanent)",processus:["Finir Biologiste 1 et atteindre le niveau 40","Parlez à Chaegirab","Apportez un Livre maléfique — étude 2h, taux ~50%","Répétez jusqu'à 15 réussites (~30 livres en moyenne)","Apportez la Pierre d'âme du Temple","Vous recevez +5 Vitesse d'attaque permanent"]},
  {id:"b3",nom:"Biologiste 3",niv:50,pnj:"Chaegirab",attente:"2h par objet, taux ~50%",objets:"Souvenir de Démon ×15 · Pierre d'âme de Sagyi",bonus:"+60 Défense (permanent)",processus:["Finir Biologiste 2 et atteindre le niveau 50","Parlez à Chaegirab","Apportez un Souvenir de Démon — étude 2h, taux ~50%","Répétez jusqu'à 15 réussites","Apportez la Pierre d'âme de Sagyi","Vous recevez +60 Défense permanent"]},
  {id:"b4",nom:"Biologiste 4",niv:60,pnj:"Chaegirab",attente:"2h par objet, taux ~50%",objets:"Orbe de glace ×20 · Pierre d'âme d'Aurtumryu",bonus:"+50 Valeur d'attaque (permanent)",processus:["Finir Biologiste 3 et atteindre le niveau 60","Parlez à Chaegirab","Apportez un Orbe de glace — étude 2h, taux ~50%","Répétez jusqu'à 20 réussites (~40 orbes en moyenne)","Apportez la Pierre d'âme d'Aurtumryu","Vous recevez +50 Valeur d'attaque permanent"]},
  {id:"b5",nom:"Biologiste 5",niv:70,pnj:"Chaegirab",attente:"2h par objet, taux ~50%",objets:"Rameau de Zelkova ×25 · Pierre d'âme de Gyimok",bonus:"+11 Vitesse de déplacement · +10% Défense (permanents)",processus:["Finir Biologiste 4 et atteindre le niveau 70","Parlez à Chaegirab","Apportez un Rameau de Zelkova — étude 2h, taux ~50%","Répétez jusqu'à 25 réussites (~50 rameaux en moyenne)","Apportez la Pierre d'âme de Gyimok","Vous recevez +11 Vitesse de déplacement ET +10% Défense permanents"]},
  {id:"b6",nom:"Biologiste 6",niv:80,pnj:"Chaegirab",attente:"2h par objet, taux ~50%",objets:"Certificat de Tugyis ×30 · Pierre d'âme de Tugyis",bonus:"+6 Vitesse d'attaque · +10% Valeur d'attaque (permanents)",processus:["Finir Biologiste 5 et atteindre le niveau 80","Parlez à Chaegirab","Apportez un Certificat de Tugyis — étude 2h, taux ~50%","Répétez jusqu'à 30 réussites (~60 certificats en moyenne)","Apportez la Pierre d'âme de Tugyis","Vous recevez +6 Vitesse d'attaque ET +10% Valeur d'attaque permanents"]},
  {id:"b7",nom:"Biologiste 7",niv:85,pnj:"Chaegirab",attente:"2h par objet, taux ~50%",objets:"Rameau d'arbre fant. Rge ×40 · Pierre d'âme du Bois Rge",bonus:"+10% Chance de parer une attaque de race (permanent)",processus:["Finir Biologiste 6 et atteindre le niveau 85","Parlez à Chaegirab","Apportez un Rameau d'arbre fantôme rouge — étude 2h, taux ~50%","Répétez jusqu'à 40 réussites (~80 rameaux en moyenne)","Apportez la Pierre d'âme du Bois Rouge","Vous recevez +10% Chance de parer une attaque de race permanent"]},
  {id:"b8",nom:"Biologiste 8",niv:90,pnj:"Chaegirab",attente:"2h par objet, taux ~50%",objets:"Certificat du Chef ×50 · Pierre d'âme du Chef",bonus:"+8% Bonus contre les races (permanent)",processus:["Finir Biologiste 7 et atteindre le niveau 90","Parlez à Chaegirab","Apportez un Certificat du Chef — étude 2h, taux ~50%","Répétez jusqu'à 50 réussites (~100 certificats en moyenne)","Apportez la Pierre d'âme du Chef","Vous recevez +8% Bonus contre les races permanent"]},
  {id:"sp1",nom:"Seon-Pyeong 1",niv:92,pnj:"Seon-Pyeong",attente:"12h par objet (plus court que Chaegirab)",objets:"Joyau de Cruauté ×10",bonus:"Au choix : +1000 PV de base · +120 Défense · +51 Valeur d'attaque",processus:["Atteindre le niveau 92 (pas besoin d'avoir fini les Biologistes)","Parlez à Seon-Pyeong (PNJ différent de Chaegirab)","Apportez un Joyau de Cruauté — étude 12h seulement","Répétez jusqu'à 10 réussites","À la fin : choisissez UN des 3 bonus permanents proposés","Recommençable avec un Parchemin du chercheur si vous regrettez votre choix"]},
  {id:"sp2",nom:"Seon-Pyeong 2",niv:94,pnj:"Seon-Pyeong",attente:"12h par objet",objets:"Joyau de Sagesse ×20 · Pierre d'âme de Beran-S.",bonus:"Au choix : +1100 PV de base · +140 Défense · +60 Valeur d'attaque",processus:["Finir Seon-Pyeong 1 et atteindre le niveau 94","Parlez à Seon-Pyeong","Apportez un Joyau de Sagesse — étude 12h","Répétez jusqu'à 20 réussites","Apportez aussi la Pierre d'âme de Beran-S.","À la fin : choisissez UN des 3 bonus permanents proposés","Recommençable avec un Parchemin du chercheur"]}
];

const CHASSE_DATA = {
  2:{m:"Tuer 10 Chiens errants affamés OU 5 Loups affamés",r:"15% EXP · Armure selon classe +0"},
  3:{m:"Tuer 20 Chiens errants affamés OU 10 Loups affamés",r:"15% EXP · Casque selon classe +0"},
  4:{m:"Tuer 15 Loups affamés OU 5 Loups alphas affamés",r:"15% EXP · Bouclier de bataille +0"},
  5:{m:"Tuer 10 Loups alphas affamés OU 10 Loups bleus affamés",r:"15% EXP · Objet aléatoire"},
  6:{m:"Tuer 20 Loups bleus affamés OU 10 Sangliers sauvages affamés",r:"15% EXP · Objet aléatoire"},
  7:{m:"Tuer 10 Sangliers sauvages affamés OU 5 Loups alphas bleus affamés",r:"15% EXP · Objet aléatoire"},
  8:{m:"Tuer 20 Sangliers sauvages affamés OU 10 Loups alphas bleus affamés",r:"15% EXP · Objet aléatoire"},
  9:{m:"Tuer 15 Loups alphas bleus affamés OU 5 Sangliers rouges affamés",r:"15% EXP · Objet aléatoire"},
  10:{m:"Tuer 20 Loups alphas bleus affamés OU 10 Sangliers rouges affamés",r:"15% EXP · Objet aléatoire"},
  11:{m:"Tuer 10 Sangliers rouges affamés OU 5 Ours affamés",r:"30% EXP · Objet aléatoire"},
  12:{m:"Tuer 15 Ours affamés OU 10 Loups gris affamés",r:"15% EXP · Objet aléatoire"},
  13:{m:"Tuer 20 Loups gris affamés OU 5 Grizzly affamés",r:"15% EXP · Objet aléatoire"},
  14:{m:"Tuer 15 Grizzly affamés OU 5 Loups alphas gris affamés",r:"15% EXP · Objet aléatoire"},
  15:{m:"Tuer 20 Grizzly affamés OU 10 Loups alphas gris affamés",r:"15% EXP · Objet aléatoire"},
  16:{m:"Tuer 15 Loups alphas gris affamés OU 5 Tigres affamés",r:"15% EXP · Objet aléatoire"},
  17:{m:"Tuer 20 Loups alphas gris affamés OU 10 Tigres affamés",r:"15% EXP · Objet aléatoire"},
  18:{m:"Tuer 10 Tigres affamés OU 10 Ours noirs affamés",r:"15% EXP · Objet aléatoire"},
  19:{m:"Tuer 20 Ours noirs affamés OU 10 Ours bruns affamés",r:"15% EXP · Objet aléatoire"},
  20:{m:"Tuer 20 Ours bruns affamés OU 15 Arcs du Serment craintif",r:"15% EXP · Objet aléatoire"},
  21:{m:"Tuer 20 Arcs du Serment craintif OU 10 Tigres blancs affamés",r:"15% EXP · Objet aléatoire · Yang"},
  22:{m:"Tuer 25 Tigres blancs affamés OU 10 Cdts du Serment craintif",r:"15% EXP · Chaussures fil d'Or +0 · 10k–100k Yang"},
  23:{m:"Tuer 20 Cdts du Serment craintif OU 40 Soldats T.Noire du Mal",r:"15% EXP · Collier de jade +0 · 10k–100k Yang"},
  24:{m:"Tuer 60 Soldats T.Noire du Mal OU 80 Maniacs du Vent Noir",r:"15% EXP · Boucles d'oreilles jade +0 · 10k–100k Yang"},
  25:{m:"Tuer 80 Forts Soldats Barbares OU 20 Joh-Hwangs T.Noire",r:"15% EXP · Bracelet de jade +0 · 10k–100k Yang"},
  26:{m:"Tuer 80 Forts Minions Barbares OU 20 Pho-Hwangs T.Noire",r:"15% EXP · Objet aléatoire · 10k–100k Yang"},
  27:{m:"Tuer 30 Pho-Hwangs T.Noire OU 20 Forts Généraux Barbares",r:"15% EXP · Objet aléatoire · 10k–100k Yang"},
  28:{m:"Tuer 35 Joh-Hwangs T.Noire OU 30 Forts Généraux Barbares",r:"15% EXP · Objet aléatoire · 10k–100k Yang"},
  29:{m:"Tuer 30 Orcs d'élite OU 30 Faibles Singes Soldats",r:"15% EXP · Coffre du dieu dragon · 10k–100k Yang"},
  30:{m:"Tuer 40 Éclaireurs orcs d'élite OU 30 Faibles Singes lanceurs",r:"15% EXP · Élixir du soleil (p) · 10k–100k Yang"},
  31:{m:"Tuer 50 Combattants orcs d'élite OU 45 Faibles Singes Combattants",r:"15% EXP · Élixir de la lune (p) · 20k–100k Yang"},
  32:{m:"Tuer 45 Rois scorpions OU 40 Faibles Singes généraux",r:"15% EXP · 20k–100k Yang"},
  33:{m:"Tuer 35 Orcs intrépides OU 30 Œils Volants",r:"15% EXP · Collier d'ébène +0 · 20k–100k Yang"},
  34:{m:"Tuer 40 Éclaireurs orcs intrépides OU 40 Rois scorpions",r:"15% EXP · Bracelet d'ébène +0 · 20k–100k Yang"},
  35:{m:"Tuer 40 Combattants orcs intrépides OU 20 Jeunes Araignées",r:"15% EXP · Boucles d'oreilles ébène +0 · 20k–100k Yang"},
  36:{m:"Tuer 30 Sorciers orcs intrépides OU 30 Jeunes venimeuses",r:"15% EXP · 20k–100k Yang"},
  37:{m:"Tuer 30 Généraux orcs intrépides OU 20 Jeunes hommes scorpions",r:"15% EXP · 20k–100k Yang"},
  38:{m:"Tuer 30 Hauts fanatiques OU 25 Araignées venimeuses",r:"15% EXP · 20k–100k Yang"},
  39:{m:"Tuer 30 Hauts arahans OU 30 Araignées venimeuses",r:"15% EXP · 20k–100k Yang"},
  40:{m:"Tuer 30 Combattants Hauts arahans OU 35 Archers scorpions",r:"15% EXP · Élixir du soleil (p) · 20k–100k Yang"},
  41:{m:"Tuer 40 Hauts arahans élites OU 40 Épéistes serpents",r:"15% EXP · Élixir de la lune (p) · 40k–150k Yang"},
  42:{m:"Tuer 40 Hauts juges OU 45 Araignées rouges venimeuses",r:"15% EXP · 40k–150k Yang"},
  43:{m:"Tuer 40 Hauts Tourmenteurs OU 30 Araignées à griffes",r:"15% EXP · 40k–150k Yang"},
  44:{m:"Tuer 40 Hauts évocateurs OU 30 Soldats Araignées",r:"15% EXP · 40k–150k Yang"},
  45:{m:"Tuer 50 Orcs noirs intrépides OU 35 Forts bandits du désert",r:"15% EXP · 40k–150k Yang"},
  46:{m:"Tuer 30 Arahans bestiaux OU 40 Singes Soldats",r:"15% EXP · Coffre du dieu dragon · 40k–150k Yang"},
  47:{m:"Tuer 35 Combattants arahans bestiaux OU 40 Singes lanceurs",r:"15% EXP · 40k–150k Yang"},
  48:{m:"Tuer 40 Chefs arahans bestiaux OU 40 Singes Combattants",r:"15% EXP · 40k–150k Yang"},
  49:{m:"Tuer 40 Juges bestiaux OU 45 Forts Singes lanceurs",r:"15% EXP · Élixir du soleil (p) · 40k–150k Yang"},
  50:{m:"Tuer 40 Tourmenteurs bestiaux OU 45 Forts Singes Combattants",r:"15% EXP · Élixir de la lune (p) · 40k–150k Yang"},
  51:{m:"Tuer 50 Soldats gren. arboricoles OU 30 Jeunes Araignées venimeuses",r:"15% EXP · Coffre du dieu dragon · 60k–200k Yang"},
  52:{m:"Tuer 50 Chefs gren. arboricoles OU 45 Araignées mortelles",r:"15% EXP · 60k–200k Yang"},
  53:{m:"Tuer 50 Croques-mitaines OU 50 Araignées rouges venimeuses furieuses",r:"15% EXP · 60k–200k Yang"},
  54:{m:"Tuer 50 Grands chefs gren. arbori. OU 30 Araignées à griffes (niv.56)",r:"15% EXP · Collier larme céleste +0 · 60k–200k Yang"},
  55:{m:"Tuer 50 Gal Grenouilles-taureaux OU 35 Soldats Araignées venimeuses",r:"15% EXP · Bracelet larme céleste +0 · 60k–200k Yang"},
  56:{m:"Tuer 80 Soldats démoniaques OU 30 Âmes furieuses",r:"15% EXP · Boucles d'oreilles larme C. +0 · 60k–200k Yang"},
  57:{m:"Tuer 80 Archers démons OU 40 Chiens infectés enragés",r:"15% EXP · 60k–200k Yang"},
  58:{m:"Tuer 80 Lanciers démoniaques OU 40 Pestiférés furieux",r:"15% EXP · 60k–200k Yang"},
  59:{m:"Tuer 80 Chamanes démoniaques OU 45 Combattants pestiférés furieux",r:"15% EXP · Élixir du soleil (p) · 60k–200k Yang"},
  60:{m:"Tuer 80 Vils Soldats démoniaques OU 40 Lanciers pestiférés furieux",r:"15% EXP · Casque niv.60 selon classe +0 · 60k–200k Yang"},
  61:{m:"Tuer 60 Vils lanciers démoniaques OU 60 Archers pestiférés furieux",r:"15% EXP · Élixir de la lune (p) · 60k–200k Yang"},
  62:{m:"Tuer 60 Destructeurs OU 55 Glaces enchantées",r:"15% EXP · Coffre du dieu dragon · 60k–200k Yang"},
  63:{m:"Tuer 60 Golems de pierre OU 45 Baleines de glace",r:"15% EXP · 60k–200k Yang"},
  64:{m:"Tuer 60 Golems de pierre OU 45 Lions de glace",r:"15% EXP · 60k–200k Yang"},
  65:{m:"Tuer 60 Berserkers OU 40 Yétis",r:"15% EXP · Chausses d'euphorie +0 · 60k–200k Yang"},
  66:{m:"Tuer 60 Golems Géants de Pierre OU 45 Golems de glace",r:"15% EXP · Armure niv.66 selon classe +0 · 60k–200k Yang"},
  67:{m:"Tuer 60 Milliers Combattants OU 50 Tigres minions",r:"15% EXP · 60k–200k Yang"},
  68:{m:"Tuer 60 Ogres Guerriers OU 50 Esprits flammes",r:"15% EXP · 60k–200k Yang"},
  69:{m:"Tuer 60 Ogres Bouchers OU 50 Flammes",r:"15% EXP · Élixir du soleil (p) · 60k–200k Yang"},
  70:{m:"Tuer 60 Ogres Berserkers OU 55 Guerriers flammes",r:"15% EXP · Élixir de la lune (p) · 60k–200k Yang"},
  71:{m:"Tuer 65 Esprits de la souche",r:"15% EXP · Coffre du dieu dragon"},
  72:{m:"Tuer 65 Esprits de la souche",r:"15% EXP"},
  73:{m:"Tuer 65 Dryades",r:"15% EXP"},
  74:{m:"Tuer 65 Esprits du saule pleureur",r:"15% EXP · Arme niv.75 selon classe +0 (liée)"},
  75:{m:"Tuer 65 Arbres maléfiques",r:"15% EXP · Arme niv.75 selon classe +0 (liée)"},
  76:{m:"Tuer 65 Esprits rouges de l'arbre",r:"15% EXP · Coffre du dieu dragon · Arme niv.75 +0 (liée)"},
  77:{m:"Tuer 65 Esprits rouges de la souche",r:"15% EXP"},
  78:{m:"Tuer 65 Dryades rouges",r:"15% EXP"},
  79:{m:"Tuer 65 Saules pleureurs rouges",r:"15% EXP · Élixir du soleil (p)"},
  80:{m:"Tuer 65 Arbres maléfiques rouges",r:"15% EXP · Élixir de la lune (p)"},
  81:{m:"Tuer 70 Glaçons d'enfer",r:"15% EXP · Coffre du dieu dragon"},
  82:{m:"Tuer 70 Baleines de glace d'enfer",r:"15% EXP"},
  83:{m:"Tuer 70 Insectes de glace d'enfer",r:"15% EXP"},
  84:{m:"Tuer 70 Hommes de glace d'enfer",r:"15% EXP"},
  85:{m:"Tuer 70 Yétis d'enfer",r:"15% EXP"},
  86:{m:"Tuer 75 Golems de glace d'enfer",r:"15% EXP"},
  87:{m:"Tuer 75 Guerriers Setaou",r:"15% EXP"},
  88:{m:"Tuer 75 Chasseurs Setaou",r:"15% EXP"},
  89:{m:"Tuer 75 Voyantes Setaou",r:"15% EXP · Élixir du soleil (p)"},
  90:{m:"Tuer 75 Voyantes Setaou",r:"15% EXP · Élixir de la lune (p)"},
  91:{m:"Tuer 80 Généraux gnolls",r:"15% EXP · Coffre du dieu dragon"},
  92:{m:"Tuer 80 Généraux Outis",r:"15% EXP · Coffre du dieu dragon"},
  93:{m:"Tuer 80 Généraux core",r:"15% EXP · Coffre du dieu dragon"},
  94:{m:"Tuer 80 Éventreurs tritoniques",r:"15% EXP · Coffre du dieu dragon"},
  95:{m:"Tuer 80 Généraux noirs",r:"15% EXP · Coffre du dieu dragon"},
  96:{m:"Tuer 80 Généraux blancs",r:"15% EXP · Coffre du dieu dragon"},
  97:{m:"Tuer 80 Crabes cuirassés",r:"15% EXP · Coffre du dieu dragon"},
  98:{m:"Tuer 80 Capitaines Crochets",r:"15% EXP · Coffre du dieu dragon"},
  99:{m:"Tuer 80 Généraux ogres",r:"15% EXP · Coffre du dieu dragon"}
};

const EQUIT_DATA = {
  0:{m:"Poney — monture temporaire via Ticket d'équitation",d:"Monture 10 min, déplacement uniquement. Ne pas monter/descendre sinon perte du Poney. Mourir = perte. Niveau requis : 10.",r:"Monture de déplacement 10 min"},
  1:{m:"Tuer 20 Archers Barbares en ≤30 min",d:"Après réussite : Dessin de cheval après 10h contre 100.000 Yang. La compétence Équitation ne s'active QU'APRÈS paiement. Niveau requis : 25.",r:"Dessin de cheval après 10h (100.000 Yang) — équitation niv.1"},
  2:{m:"Se déplacer aux points indiqués — Joan · Pyungmoo · Yongan",d:"Ne pas descendre du cheval, passer de portail, ni mourir. En cas d'échec : attendre ~24h (médaille non perdue).",r:"Progression équitation niv.2"},
  3:{m:"Se déplacer aux points indiqués — Joan · Pyungmoo · Yongan",d:"Ne pas descendre du cheval, passer de portail, ni mourir.",r:"Progression équitation niv.3"},
  4:{m:"Se déplacer aux points indiqués — Joan · Pyungmoo · Yongan",d:"Ne pas descendre du cheval.",r:"Progression équitation niv.4"},
  5:{m:"Se déplacer aux points indiqués — Joan · Pyungmoo · Yongan",d:"Dernier niveau sur ces trois cartes.",r:"Progression équitation niv.5"},
  6:{m:"Se déplacer aux points indiqués — Désert de Yongbi · Vallée de Seungryong",d:"La médaille équestre n'est pas perdue en cas d'échec.",r:"Progression équitation niv.6"},
  7:{m:"Se déplacer aux points indiqués — Désert de Yongbi · Vallée de Seungryong",d:"Ne pas descendre du cheval.",r:"Progression équitation niv.7"},
  8:{m:"Se déplacer aux points indiqués — Désert de Yongbi · Vallée de Seungryong",d:"Ne pas descendre du cheval.",r:"Progression équitation niv.8"},
  9:{m:"Se déplacer aux points indiqués — Mont Sohan · Doyyumhwan",d:"Ne pas descendre du cheval.",r:"Progression équitation niv.9"},
  10:{m:"Se déplacer aux points indiqués — Mont Sohan · Doyyumhwan",d:"Dernier niveau du Cheval débutant.",r:"Progression équitation niv.10"},
  11:{m:"Tuer 100 Archers serpents OU Archers scorpions en ≤2h",d:"Si réussite : Livre cheval de combat après 12h contre 500.000 Yang. Frappe statique débloquée. En groupe : le chef doit posséder la quête. Niveau requis : 35.",r:"Livre cheval de combat après 12h (500.000 Yang)"},
  12:{m:"Tuer 5 Bo sans descendre — Bakra · Bokjung · Jayang",d:"Toutes les missions 12 à 20 : sans descendre du cheval. Attendre ~24h en cas d'échec.",r:"Progression équitation niv.12"},
  13:{m:"Tuer 5 Chuong sans descendre — Bakra · Bokjung · Jayang",d:"Sans descendre du cheval.",r:"Progression équitation niv.13"},
  14:{m:"Tuer 10 Généraux orcs élites sans descendre — Vallée de Seungryong",d:"Sans descendre du cheval.",r:"Progression équitation niv.14"},
  15:{m:"Tuer 10 Orcs noirs sans descendre — Vallée de Seungryong",d:"Sans descendre du cheval.",r:"Progression équitation niv.15"},
  16:{m:"Tuer 10 Bourreaux funestes sans descendre — Vallée de Seungryong",d:"Sans descendre du cheval.",r:"Progression équitation niv.16"},
  17:{m:"Tuer 10 Araignées à griffes sans descendre — Kuahlo Dong",d:"Sans descendre du cheval.",r:"Progression équitation niv.17"},
  18:{m:"Tuer 20 Hors-la-loi du Désert sans descendre — Désert de Yongbi",d:"Sans descendre du cheval.",r:"Progression équitation niv.18"},
  19:{m:"Tuer 10 Golems de glace sans descendre — Mont Sohan",d:"Sans descendre du cheval.",r:"Progression équitation niv.19"},
  20:{m:"Tuer 20 Tigres de combat sans descendre — Doyyumhwan",d:"Dernier niveau du Cheval de Combat.",r:"Progression équitation niv.20"},
  21:{m:"Tuer 300 Archers démons dans la Tour de Gumsan en ≤30 min",d:"Si réussite : Livre équit. militaire après 12h contre 1.000.000 Yang. Frappe dynamique débloquée. En groupe : le chef doit posséder la quête. Niveau requis : 50.",r:"Livre équit. militaire après 12h (1.000.000 Yang) — cheval militaire"}
};

/* ═══════════════════════════════════════════════
   FONCTIONS DÉPLIANTES — toutes sections
   ═══════════════════════════════════════════════ */

function escHtml(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function normalize(s) {
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
}

/* ── Liste des quêtes ── */
/* ── Badge visuel typé ── */
function badge(type, label) {
  const cls = {
    timer: 'q-badge-timer',
    repeat: 'q-badge-repeat',
    perm: 'q-badge-perm',
    chain: 'q-badge-chain',
    fail: 'q-badge-fail',
    choice: 'q-badge-choice'
  };
  return '<span class="q-badge ' + (cls[type]||'') + '">' + label + '</span>';
}

/* ── Badges automatiques depuis le texte ── */
function autoBadges(text) {
  if (!text) return '';
  const t = text.toLowerCase();
  const out = [];
  if (/répétable/.test(t))              out.push(badge('repeat', 'Répétable'));
  if (/permanent|définitif/.test(t))          out.push(badge('perm', 'Permanent'));
  if (/peut échouer/.test(t))                 out.push(badge('fail', 'Peut échouer'));
  if (/≤30\s*min|en moins de|≤\d+/.test(t)) out.push(badge('timer', 'Chronométrée'));
  if (/au choix/.test(t))                          out.push(badge('choice', 'Au choix'));
  if (/chaînée|commencée au niveau/.test(t)) out.push(badge('chain', 'Chaînée'));
  return out.join(' ');
}


function initQuestRows() {
  const panel = document.getElementById('panel-liste');
  if (!panel) return;

  /* Index JSON par nom normalisé */
  const idx = {};
  QUESTS_DATA.filter(q => q.niv <= 84).forEach(q => { idx[normalize(q.nom)] = q; });

  /* Stocker les onglets pour l'auto-switch */
  const tabs   = [...panel.querySelectorAll('.qtab')];
  const qpanels = [...panel.querySelectorAll('.qpanel')];

  /* Construire les lignes dépliantes */
  panel.querySelectorAll('.qt tbody tr').forEach(tr => {
    const cells = tr.querySelectorAll('td');
    if (cells.length < 2) return;
    const data = idx[normalize(cells[1]?.textContent?.trim())];
    if (!data) return;

    tr.classList.add('q-row');
    const dr = document.createElement('tr');
    dr.classList.add('q-detail-row');
    const td = document.createElement('td');
    td.colSpan = cells.length;
    const proc = data.processus.map((e,i)=>`<li><span class="q-step-n">${i+1}</span>${escHtml(e)}</li>`).join('');
    const bdgs = autoBadges(data.recompenses + ' ' + data.processus.join(' '));
    td.innerHTML = `<div class="q-detail-inner q-two-col">
      <div class="q-detail-col">
        <div class="q-detail-label">${t('lbl.pnj')}</div>
        <div class="q-pnj">${escHtml(data.pnj)}</div>
        <div class="q-detail-label">${t('lbl.recompenses')}</div>
        <div class="q-recompenses">${escHtml(data.recompenses)}</div>
        ${bdgs ? `<div class="q-detail-label">${t('lbl.type')}</div><div>${bdgs}</div>` : ''}
      </div>
      <div class="q-detail-col">
        <div class="q-col-title"><div class="q-detail-label">${t('lbl.processus')}</div></div>
        <ol class="q-processus">${proc}</ol>
      </div>
    </div>`;
    dr.appendChild(td);
    tr.after(dr);
    tr.setAttribute('tabindex', '0');
    tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tr.click(); } });
    tr.addEventListener('click', () => {
      const open = tr.classList.contains('open');
      panel.querySelectorAll('.q-row.open').forEach(r => r.classList.remove('open'));
      panel.querySelectorAll('.q-detail-row.open').forEach(r => r.classList.remove('open'));
      if (!open) {
        tr.classList.add('open');
        dr.classList.add('open');
        setTimeout(() => tr.scrollIntoView({behavior:'smooth', block:'nearest'}), 50);
      }
    });
  });

  /* ── Barre de recherche : nom + PNJ + niveau ── */
  const qsInput = document.getElementById('qs-input');
  const qsCount = document.getElementById('qs-count');
  if (!qsInput) return;

  const allRows = [...panel.querySelectorAll('.q-row')];

  function switchToFirstTabWithResults() {
    /* Trouver le premier onglet qui a des résultats visibles */
    for (const tab of tabs) {
      const qp = panel.querySelector('#' + tab.dataset.panel);
      if (!qp) continue;
      const hasVisible = qp.querySelector('.q-row:not([style*="display: none"])');
      if (hasVisible) {
        tabs.forEach(t => t.classList.remove('active'));
        qpanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        qp.classList.add('active');
        return;
      }
    }
  }

  qsInput.addEventListener('input', () => {
    const raw = qsInput.value.trim();
    const q   = normalize(raw);
    const isNum = /^\d+$/.test(raw);
    let visible = 0;

    allRows.forEach(tr => {
      const cells  = tr.querySelectorAll('td');
      const nom    = normalize(cells[1]?.textContent || '');
      const pnj    = normalize(cells[3]?.textContent || '');
      const niveau = parseInt(cells[0]?.textContent || '0');
      let match;

      if (!q) {
        match = true;
      } else if (isNum) {
        /* Filtre par niveau exact OU niveau dans la plage */
        match = niveau === parseInt(raw) || nom.includes(q) || pnj.includes(q);
      } else {
        match = nom.includes(q) || pnj.includes(q);
      }

      tr.style.display = match ? '' : 'none';
      /* Masquer aussi la ligne de détail si cachée */
      const det = tr.nextElementSibling;
      if (det?.classList.contains('q-detail-row')) {
        if (!match) {
          det.classList.remove('open');
          tr.classList.remove('open');
          det.style.display = 'none';
        } else if (det.classList.contains('open')) {
          det.style.display = 'table-row';
        } else {
          det.style.display = '';
        }
      }
      if (match) visible++;
    });

    /* Compteur */
    if (q) {
      qsCount.textContent = visible + ' ' + t('lbl.results') + (visible !== 1 ? 's' : '');
    } else {
      qsCount.textContent = '';
    }

    /* Griser les onglets sans résultats */
    tabs.forEach(btn => {
      const qp = panel.querySelector('#' + btn.dataset.panel);
      if (!qp) return;
      const hasVis = qp.querySelector('.q-row:not([style*="display: none"])');
      btn.style.opacity = hasVis ? '1' : '0.35';
    });

    /* Auto-switch vers le premier onglet avec des résultats */
    if (q) switchToFirstTabWithResults();
  });

  /* Raccourci clavier global : / pour focus la recherche */
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      /* Ouvrir le panneau liste si pas déjà actif */
      const listeBtn = document.querySelector('[data-quest="liste"]');
      if (listeBtn) listeBtn.click();
      setTimeout(() => { qsInput.focus(); qsInput.select(); }, 150);
      e.preventDefault();
    }
  });
}

/* ── Biologiste ── */
/* ═══════════════════════════════════════════════════════
   BIOLOGISTE — cartes dépliantes avec barre de recherche
   ═══════════════════════════════════════════════════════ */
function initBioCards() {
  const panel = document.getElementById('panel-bio');
  if (!panel) return;

  /* Index par nom normalisé */
  const idx = {};
  BIO_DATA.filter(b => b.niv <= 92).forEach(b => { idx[normalize(b.nom)] = b; });

  /* Injecter barre de recherche avant les cards */
  const bioGrid = panel.querySelector('.bio-grid');
  if (bioGrid && !panel.querySelector('.qs-wrap-bio')) {
    const wrap = document.createElement('div');
    wrap.className = 'qs-wrap qs-wrap-bio';
    wrap.innerHTML = `<svg class="qs-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="search" class="qs-input" id="qs-bio" placeholder="${t('search.bio')}" aria-label="${t('search.bio')}"><span class="qs-count" id="qs-bio-count" aria-live="polite"></span>`;
    bioGrid.before(wrap);
    wrap.querySelector('#qs-bio').addEventListener('input', e => {
      const q = normalize(e.target.value);
      let vis = 0;
      panel.querySelectorAll('.bio-card').forEach(card => {
        const match = !q || normalize(card.textContent).includes(q);
        card.style.display = match ? '' : 'none';
        if (!match) { card.classList.remove('open'); const n = card.nextElementSibling; if (n?.classList.contains('bio-detail-panel')) n.style.display='none'; }
        if (match) vis++;
      });
      document.getElementById('qs-bio-count').textContent = q ? vis+' '+t('lbl.results')+(vis!==1?'s':'') : '';
    });
  }

  panel.querySelectorAll('.bio-card').forEach(card => {
    const nameEl = card.querySelector('.bio-name');
    if (!nameEl) return;
    const data = idx[normalize(nameEl.textContent.trim())];
    if (!data) return;

    card.classList.add('q-row');
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.style.cursor = 'pointer';

    /* Indicateur visuel */
    if (!card.querySelector('.bio-arrow')) {
      const arr = document.createElement('span');
      arr.className = 'bio-arrow';
      arr.textContent = '▶';
      arr.setAttribute('aria-hidden','true');
      card.appendChild(arr);
    }

    const div = document.createElement('div');
    div.classList.add('bio-detail-panel');
    div.style.display = 'none';

    const proc = data.processus.map((e,i)=>`<li><span class="q-step-n">${i+1}</span>${escHtml(e)}</li>`).join('');

    div.innerHTML = `
      <div class="q-detail-inner bio-detail-grid">
        <div class="q-detail-col">
          <div class="q-detail-label">${t('lbl.pnj')}</div>
          <div class="q-pnj">${escHtml(data.pnj)}</div>
          <div class="q-detail-label" style="margin-top:.6rem">${t('bio.lbl.objets')}</div>
          <div class="q-recompenses">${escHtml(data.objets)}</div>
          <div class="q-detail-label" style="margin-top:.6rem">${t('bio.lbl.attente')}</div>
          <div class="q-recompenses">${escHtml(data.attente)}</div>
          <div class="q-detail-label" style="margin-top:.6rem">${t('bio.lbl.bonus')}</div>
          <div class="q-pnj bio-bonus">${escHtml(data.bonus)} ${autoBadges(data.bonus)}</div>
        </div>
        <div class="q-detail-col">
          <div class="q-detail-label">${t('lbl.processus.complet')}</div>
          <ol class="q-processus">${proc}</ol>
        </div>
      </div>`;

    card.after(div);

    const toggle = () => {
      const open = card.classList.contains('open');
      panel.querySelectorAll('.bio-card.open').forEach(c => {
        c.classList.remove('open');
        const n = c.nextElementSibling;
        if (n?.classList.contains('bio-detail-panel')) n.style.display='none';
      });
      if (!open) {
        card.classList.add('open');
        div.style.display = 'block';
        setTimeout(() => card.scrollIntoView({behavior:'smooth',block:'nearest'}), 50);
      }
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();} });
  });
}

/* ═══════════════════════════════════════════════════════
   HELPER — ligne de tableau dépliante
   ═══════════════════════════════════════════════════════ */
function makeExpandRow(tr, panel, html) {
  tr.classList.add('q-row');
  tr.setAttribute('tabindex','0');
  tr.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();tr.click();} });
  const dr = document.createElement('tr');
  dr.classList.add('q-detail-row');
  const td = document.createElement('td');
  td.colSpan = tr.querySelectorAll('td').length || 4;
  td.innerHTML = html;
  dr.appendChild(td);
  tr.after(dr);
  tr.addEventListener('click', () => {
    const open = tr.classList.contains('open');
    panel.querySelectorAll('.q-row.open').forEach(r=>r.classList.remove('open'));
    panel.querySelectorAll('.q-detail-row.open').forEach(r=>r.classList.remove('open'));
    if (!open) { tr.classList.add('open'); dr.classList.add('open'); setTimeout(()=>tr.scrollIntoView({behavior:'smooth',block:'nearest'}),50); }
  });
}

/* Injecte une barre de recherche avant le premier .qt d'un panel */
function injectSearch(panel, id, placeholder, filterFn) {
  if (panel.querySelector('.qs-wrap-'+id)) return;
  const qt = panel.querySelector('.qt, .qtabs');
  if (!qt) return;
  const wrap = document.createElement('div');
  wrap.className = 'qs-wrap qs-wrap-'+id;
  wrap.innerHTML = `<svg class="qs-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="search" class="qs-input" placeholder="${placeholder}" aria-label="${placeholder}"><span class="qs-count" aria-live="polite"></span>`;
  qt.before(wrap);
  const input = wrap.querySelector('input');
  const count = wrap.querySelector('.qs-count');
  input.addEventListener('input', () => {
    const vis = filterFn(normalize(input.value), panel);
    count.textContent = input.value ? vis+' résultat'+(vis!==1?'s':'') : '';
  });
}

/* ═══════════════════════════════════════════════════════
   MISSIONS DE CHASSE — lignes dépliantes + recherche
   ═══════════════════════════════════════════════════════ */
function initChasseRows() {
  const panel = document.getElementById('panel-chasse');
  if (!panel) return;

  panel.querySelectorAll('.qt tbody tr').forEach(tr => {
    const cells = tr.querySelectorAll('td');
    if (cells.length < 2) return;
    const niv = parseInt(cells[0]?.textContent?.trim());
    if (niv > 90) { tr.style.display = 'none'; return; }
    const data = CHASSE_DATA[niv];
    if (!data) return;

    const csteps = [`${t('lbl.mission')} : ${data.m}`, `${t('chasse.lbl.garanti')} ${niv}.`, `${t('chasse.lbl.special')} : ${data.r}`];
    const cproc = csteps.map((e,i)=>`<li><span class="q-step-n">${i+1}</span>${escHtml(e)}</li>`).join('');
    const hasSpecial = !/objet aléatoire/i.test(data.r) && !/^15%/.test(data.r.trim());
    makeExpandRow(tr, panel, `
      <div class="q-detail-inner">
        <div class="q-detail-col">
          <div class="q-detail-label">${t('lbl.niveau')}</div>
          <div class="q-pnj">${niv}</div>
          <div class="q-detail-label">${t('lbl.recompenses')}</div>
          <div class="q-recompenses">${escHtml(data.r)}</div>
          <div class="q-detail-label">${t('lbl.obtention')}</div>
          <div class="q-recompenses">${t('chasse.lbl.obtention.a')} ${niv}${t('chasse.lbl.obtention.b')} ${niv-1}${t('chasse.lbl.obtention.c')}</div>
          ${hasSpecial ? `<div class="q-detail-label">${t('lbl.type')}</div><div>${badge('perm',t('lbl.recomp.speciale'))}</div>` : ''}
        </div>
        <div class="q-detail-col">
          <div class="q-col-title"><div class="q-detail-label">${t('lbl.detail.mission')}</div></div>
          <ol class="q-processus">${cproc}</ol>
        </div>
      </div>`
    );
  });

  injectSearch(panel, 'chasse', t('search.chasse'), (q, p) => {
    let vis = 0;
    p.querySelectorAll('.qt tbody tr.q-row').forEach(tr => {
      const match = !q || normalize(tr.textContent).includes(q);
      tr.style.display = match ? '' : 'none';
      const det = tr.nextElementSibling;
      if (det?.classList.contains('q-detail-row')) {
        if (!match) { det.classList.remove('open'); tr.classList.remove('open'); }
        det.style.display = (!match) ? 'none' : (det.classList.contains('open') ? 'table-row' : 'none');
      }
      if (match) vis++;
    });
    /* Griser onglets sans résultats */
    p.querySelectorAll('.qtab').forEach(btn => {
      const qp = document.getElementById(btn.dataset.panel);
      if (!qp) return;
      btn.style.opacity = qp.querySelector('.q-row:not([style*="display: none"])') ? '1' : '0.35';
    });
    return vis;
  });
}

/* ═══════════════════════════════════════════════════════
   LIVRES DE QUÊTES — lignes dépliantes + recherche
   ═══════════════════════════════════════════════════════ */
function initLivresRows() {
  const panel = document.getElementById('panel-livres');
  if (!panel) return;

  panel.querySelectorAll('.qt tbody tr').forEach(tr => {
    const cells = tr.querySelectorAll('td');
    if (cells.length < 2) return;
    const nom     = cells[0]?.textContent?.trim();
    const mission = cells[1]?.textContent?.trim();
    const recomp  = cells[2]?.textContent?.trim() || '';
    if (!nom || !mission) return;

    /* Déterminer le type de livre depuis le panneau actif */
    const livreType = (() => {
      const qp = tr.closest('.qpanel');
      if (!qp) return '';
      const m = {'lf':'Facile','ln':'Normal','ld':'Difficile','le':'Expert','lp1':'Prince 1','lp2':'Prince 2','lp3':'Prince 3','ly':'Yohara'};
      return m[qp.id] || '';
    })();

    const lsteps = [`${t('lbl.accomplir')} : ${mission}`, t('livres.lbl.obtention')];
    const lproc = lsteps.map((e,i)=>`<li><span class="q-step-n">${i+1}</span>${escHtml(e)}</li>`).join('');
    const lbdgs = autoBadges(recomp + ' ' + mission);
    makeExpandRow(tr, panel, `
      <div class="q-detail-inner">
        <div class="q-detail-col">
          <div class="q-detail-label">${t('livres.lbl.type')}</div>
          <div class="q-pnj">${escHtml(livreType)}</div>
          <div class="q-detail-label">${t('lbl.recompenses.possibles')}</div>
          <div class="q-recompenses">${escHtml(recomp) || t('livres.lbl.voirpool')}</div>
          ${lbdgs ? `<div class="q-detail-label">${t('lbl.type')}</div><div>${lbdgs}</div>` : ''}
        </div>
        <div class="q-detail-col">
          <div class="q-col-title"><div class="q-detail-label">${t('lbl.processus')}</div></div>
          <ol class="q-processus">${lproc}</ol>
        </div>
      </div>`
    );
  });

  injectSearch(panel, 'livres', t('search.livres'), (q, p) => {
    let vis = 0;
    p.querySelectorAll('.qt tbody tr.q-row').forEach(tr => {
      const match = !q || normalize(tr.textContent).includes(q);
      tr.style.display = match ? '' : 'none';
      const det = tr.nextElementSibling;
      if (det?.classList.contains('q-detail-row')) {
        if (!match) { det.classList.remove('open'); tr.classList.remove('open'); }
        det.style.display = (!match) ? 'none' : (det.classList.contains('open') ? 'table-row' : 'none');
      }
      if (match) vis++;
    });
    p.querySelectorAll('.qtab').forEach(btn => {
      const qp = document.getElementById(btn.dataset.panel);
      if (!qp) return;
      btn.style.opacity = qp.querySelector('.q-row:not([style*="display: none"])') ? '1' : '0.35';
    });
    return vis;
  });
}

/* ═══════════════════════════════════════════════════════
   MISSIONS D'ÉQUITATION — lignes dépliantes + recherche
   ═══════════════════════════════════════════════════════ */
function initEquitRows() {
  const panel = document.getElementById('panel-equit');
  if (!panel) return;

  panel.querySelectorAll('.qt tbody tr').forEach(tr => {
    const cells = tr.querySelectorAll('td');
    if (cells.length < 2) return;
    const niv  = parseInt(cells[0]?.textContent?.trim());
    const data = EQUIT_DATA[niv];
    if (isNaN(niv) || !data) return;

    /* Déterminer la phase */
    const phase = niv === 0 ? t('equit.phase.poney') :
                  niv <= 10 ? t('equit.phase.debutant') :
                  niv <= 20 ? t('equit.phase.combat') :
                  t('equit.phase.militaire');

    const isChronometree = (niv === 1 || niv === 11 || niv === 21);
    const chrono = isChronometree ? `<div class="q-detail-label" style="margin-top:.6rem">⏱ ${t('equit.lbl.chronometree')}</div><div class="q-recompenses equit-warn">${t('equit.lbl.chrono.warn')}</div>` : `<div class="q-detail-label" style="margin-top:.6rem">${t('equit.lbl.regle.echec')}</div><div class="q-recompenses">${t('equit.lbl.medaille.ok')}</div>`;

    const esteps = [data.m, data.d, `Récompense : ${data.r}`];
    const eproc = esteps.map((e,i)=>`<li><span class="q-step-n">${i+1}</span>${escHtml(e)}</li>`).join('');
    const ebdgs = isChronometree ? badge('timer', t('lbl.chronometree')) : '';
    makeExpandRow(tr, panel, `
      <div class="q-detail-inner">
        <div class="q-detail-col">
          <div class="q-detail-label">Phase</div>
          <div class="q-pnj">${escHtml(phase)}</div>
          <div class="q-detail-label">Récompense</div>
          <div class="q-pnj equit-reward">${escHtml(data.r)}</div>
          <div class="q-detail-label">${isChronometree ? '⚠ Règle' : 'Règle'}</div>
          <div class="q-recompenses ${isChronometree ? 'equit-warn' : ''}">${isChronometree ? 'Raté = perte de la médaille équestre. Pas de 2ème chance immédiate.' : 'La médaille n’est pas perdue, vous pouvez recommencer.'}</div>
          ${ebdgs ? `<div class="q-detail-label">Type</div><div>${ebdgs}</div>` : ''}
        </div>
        <div class="q-detail-col">
          <div class="q-col-title"><div class="q-detail-label">${t('lbl.processus')}</div></div>
          <ol class="q-processus">${eproc}</ol>
        </div>
      </div>`
    );
  });

  injectSearch(panel, 'equit', t('search.equit'), (q, p) => {
    let vis = 0;
    p.querySelectorAll('.qt tbody tr.q-row').forEach(tr => {
      const match = !q || normalize(tr.textContent).includes(q);
      tr.style.display = match ? '' : 'none';
      const det = tr.nextElementSibling;
      if (det?.classList.contains('q-detail-row')) {
        if (!match) { det.classList.remove('open'); tr.classList.remove('open'); }
        det.style.display = (!match) ? 'none' : (det.classList.contains('open') ? 'table-row' : 'none');
      }
      if (match) vis++;
    });
    p.querySelectorAll('.qtab').forEach(btn => {
      const qp = document.getElementById(btn.dataset.panel);
      if (!qp) return;
      btn.style.opacity = qp.querySelector('.q-row:not([style*="display: none"])') ? '1' : '0.35';
    });
    return vis;
  });
}

/* ═══════════════════════════════════════════════════════
   HIÉRARCHIE VISUELLE — icônes SVG + rewardLine
   Patch appliqué après init pour ne pas casser les
   template literals imbriqués
   ═══════════════════════════════════════════════════════ */

/* Icônes SVG par type de section (éléments DOM réels) */
const SECTION_ICONS = {
  pnj:       'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  recomp:    'M12 2l3.09 8.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  processus: 'M9 12l2 2 4-4M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
  temps:     'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2',
  info:      'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16v-4M12 8h.01',
  objet:     'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  phase:     'M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z',
  echec:     'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM15 9l-6 6M9 9l6 6',
  type:      'M7 7m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M17 17m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0',
  niveau:    'M22 12h-4l-3 9L9 3l-3 9H2',
};

function makeSvg(type) {
  const d = SECTION_ICONS[type] || SECTION_ICONS.info;
  return '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="' + d + '"/></svg>';
}

/* Upgrade les q-detail-label : ajoute icône + classe q-section-title */
function upgradeLabels(container) {
  const MAP = {
    'pnj': 'pnj', 'récompenses': 'recomp', 'récompenses possibles': 'recomp',
    'récompense': 'recomp', 'bonus obtenu': 'recomp', 'objets requis': 'objet',
    'processus': 'processus', 'processus complet': 'processus',
    'détail de la mission': 'processus',
    'délai & taux': 'temps', 'délai &amp; taux': 'temps',
    'niveau': 'niveau', 'phase': 'phase', 'type de livre': 'objet',
    'obtention': 'info', 'type': 'type', 'règle': 'echec',
    '⚠ règle': 'echec',
  };

  container.querySelectorAll('.q-detail-label').forEach(el => {
    if (el.classList.contains('q-section-title')) return; // déjà fait
    const key = el.textContent.trim().toLowerCase();
    const iconType = MAP[key];
    if (!iconType) return;
    el.classList.add('q-section-title');
    el.innerHTML = makeSvg(iconType) + '<span>' + el.textContent.trim() + '</span>';
  });
}
// Zones cartes
document.querySelectorAll('.zone-card').forEach(card => {
  card.addEventListener('click', () => {
    const zone = card.dataset.zone;
    const panel = document.getElementById('zpanel-' + zone);
    const isOpen = panel.classList.contains('open');
    document.querySelectorAll('.zone-panel.open').forEach(p => p.classList.remove('open'));
    document.querySelectorAll('.sc.active-zone').forEach(c => c.classList.remove('active-zone'));
    if (!isOpen) {
      panel.classList.add('open');
      card.classList.add('active-zone');
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
});
document.querySelectorAll('.zp-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const zone = btn.dataset.closeZone;
    document.getElementById('zpanel-' + zone).classList.remove('open');
    document.querySelector('[data-zone="' + zone + '"]').classList.remove('active-zone');
  });
});

/* Upgrade les .q-recompenses : tente d'y injecter des images d'items */
function upgradeRewards(container) {
  container.querySelectorAll('.q-recompenses').forEach(el => {
    const text = el.textContent.trim();
    if (!text || text.length > 200) return; // skip les trop longs
    if (el.querySelector('img, .q-reward-line')) return; // déjà upgradé

    const parts = text.split('·').map(p => p.trim()).filter(Boolean);
    if (parts.length <= 1) {
      const img = itemImg(text);
      if (img) el.innerHTML = '<span class="q-reward-line">' + img + '<span>' + escHtml(text) + '</span></span>';
      return;
    }

    const html = parts.map(part => {
      const img = itemImg(part);
      return '<span class="q-reward-line">' + (img||'') + '<span>' + escHtml(part) + '</span></span>';
    }).join('');
    el.innerHTML = html;
    el.classList.add('q-recompenses-wrap');
  });
}

/* Observe les dépliants qui s'ouvrent et applique les upgrades */
(function patchDetailRows() {
  /* Quêtes + Chasse + Livres + Equit : tableau rows */
  document.querySelectorAll('.q-detail-row, .bio-detail-panel').forEach(el => {
    el._upgraded = false;
  });

  /* MutationObserver sur .open */
  const obs = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.type !== 'attributes' || m.attributeName !== 'class') return;
      const el = m.target;
      if (!el.classList.contains('open')) return;
      if (el._upgraded) return;
      el._upgraded = true;
      /* Chercher le td dedans */
      const inner = el.querySelector('.q-detail-inner') || el;
      upgradeLabels(inner);
      upgradeRewards(inner);
    });
  });

  function observe(root) {
    root.querySelectorAll('.q-detail-row, .bio-detail-panel').forEach(el => {
      obs.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
    });
  }

  /* Observer les panneaux existants */
  ['panel-liste','panel-bio','panel-chasse','panel-livres','panel-equit'].forEach(id => {
    const p = document.getElementById(id);
    if (p) observe(p);
    /* Observer aussi si le panneau est ajouté après (déplacement DOM) */
    new MutationObserver(() => { const pp = document.getElementById(id); if (pp) observe(pp); })
      .observe(document.body, { childList: true, subtree: true });
  });
})();