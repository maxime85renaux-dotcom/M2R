/* PARTICULES */
(function(){
  const c=document.getElementById('ptc'),ctx=c.getContext('2d');
  let W,H,pts=[];
  function rsz(){W=c.width=window.innerWidth;H=c.height=window.innerHeight}
  rsz();window.addEventListener('resize',rsz);
  function mk(){return{x:Math.random()*W,y:H+8,vx:(Math.random()-.5)*.3,vy:-(Math.random()*.48+.2),r:Math.random()*1.5+.28,life:1,decay:Math.random()*.0025+.0015,hue:Math.random()*25+8}}
  for(let i=0;i<45;i++){const p=mk();p.y=Math.random()*H;pts.push(p)}
  function fr(){ctx.clearRect(0,0,W,H);if(Math.random()<.32)pts.push(mk());pts=pts.filter(p=>p.life>0);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=p.decay;p.vx+=(Math.random()-.5)*.035;ctx.save();ctx.globalAlpha=p.life*.45;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`hsl(${p.hue},86%,62%)`;ctx.fill();ctx.restore()});requestAnimationFrame(fr)}
  fr();
})();

/* PARALLAX */
const vid=document.getElementById('bgvid');
if(vid){document.getElementById('hero').addEventListener('mousemove',e=>{const x=(e.clientX/window.innerWidth-.5)*6;const y=(e.clientY/window.innerHeight-.5)*3;vid.style.transform=`scale(1.05) translate(${x}px,${y}px)`})}

/* CLASSES — toggle panneau dépliant */
const classes=['guerrier','sura','ninja','chamane'];
function toggleClass(id){
  const card=document.querySelector('.cc.'+id);
  const panel=document.getElementById('panel-'+id);
  const isOpen=panel.classList.contains('open');
  // Ferme tout
  classes.forEach(c=>{
    document.querySelector('.cc.'+c).classList.remove('open');
    document.getElementById('panel-'+c).classList.remove('open');
  });
  if(!isOpen){
    card.classList.add('open');
    panel.classList.add('open');
    card.setAttribute('aria-expanded','true');
    // Repositionne le panneau après la 2ème ligne si 4 colonnes
    const grid=document.getElementById('class-grid');
    const cols=getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const cards=[...grid.querySelectorAll('.cc')];
    const idx=cards.indexOf(card);
    const row=Math.floor(idx/cols);
    const lastInRow=cards[(row+1)*cols-1]||cards[cards.length-1];
    lastInRow.after(panel);
    setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}),60);
  }
}
function closeClass(id){
  document.querySelector('.cc.'+id).classList.remove('open');
  document.querySelector('.cc.'+id).setAttribute('aria-expanded','false');
  document.getElementById('panel-'+id).classList.remove('open');
}
// Clavier classes
document.querySelectorAll('.cc').forEach(el=>{
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}})
});

/* QUÊTES — toggle panneau dépliant */
const quests=['chasse','bio','livres','equit','liste'];
function toggleQuest(id){
  const card=document.querySelector('.qc.q'+id);
  const panel=document.getElementById('panel-'+id);
  const isOpen=panel.classList.contains('open');
  quests.forEach(q=>{
    document.querySelector('.qc.q'+q).classList.remove('open');
    document.getElementById('panel-'+q).classList.remove('open');
    document.querySelector('.qc.q'+q).setAttribute('aria-expanded','false');
  });
  if(!isOpen){
    card.classList.add('open');
    panel.classList.add('open');
    card.setAttribute('aria-expanded','true');
    const grid=document.getElementById('quest-grid');
    const cards=[...grid.querySelectorAll('.qc')];
    const cols=getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const idx=cards.indexOf(card);
    const row=Math.floor(idx/cols);
    const lastInRow=cards[(row+1)*cols-1]||cards[cards.length-1];
    lastInRow.after(panel);
    setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}),60);
  }
}
function closeQuest(id){
  document.querySelector('.qc.q'+id).classList.remove('open');
  document.querySelector('.qc.q'+id).setAttribute('aria-expanded','false');
  document.getElementById('panel-'+id).classList.remove('open');
}
// Clavier quêtes
document.querySelectorAll('.qc').forEach(el=>{
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}})
});

/* ONGLETS QUÊTES */
function showQ(id){
  const btn=event.target;
  const tabsEl=btn.closest('.qtabs');
  tabsEl.querySelectorAll('.qtab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const parent=tabsEl.parentElement;
  parent.querySelectorAll(':scope > .qpanel').forEach(p=>p.classList.remove('active'));
  parent.querySelector('#'+id).classList.add('active');
}
function showH(id){
  const btn=event.target;
  const tabsEl=btn.closest('.qtabs');
  tabsEl.querySelectorAll('.qtab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const parent=tabsEl.parentElement;
  parent.querySelectorAll(':scope > .qpanel').forEach(p=>p.classList.remove('active'));
  parent.querySelector('#'+id).classList.add('active');
}
function showL(id){
  const btn=event.target;
  const tabsEl=btn.closest('.qtabs');
  tabsEl.querySelectorAll('.qtab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const parent=tabsEl.parentElement;
  parent.querySelectorAll(':scope > .qpanel').forEach(p=>p.classList.remove('active'));
  parent.querySelector('#'+id).classList.add('active');
}

/* SAVIEZ-VOUS */
const facts=["Le mari de Ah-Yu est mort à la guerre.","Le PNJ Esprit d'un Sura s'appelle Akuma.","L'Amiral Angmur est le chef militaire de l'empire Chunjo.","Les missions biologiques donnent des bonus permanents cumulatifs.","Un cheval au niveau 21 peut attaquer en se déplaçant.","Il faut 55 réussites pour passer du stade Maître au Grand Maître.","L'Embuscade d'un Ninja inflige des dégâts massifs dans le dos.","Corps puissant au niveau G1 empêche le Guerrier Mental de tomber.","La compétence Soin peut retirer des effets négatifs.","Berserk augmente la vitesse d'attaque mais aussi les dégâts reçus.","Un Accélérateur réduit le temps d'étude de Chaegirab.","La Tour de Gumsan est nécessaire pour le Cheval Militaire.","Les quêtes Yohara donnent des Gemmes ou des Reliques d'âme.","La 9ème compétence du Guerrier CAC s'appelle Tremblement de terre.","Pour la 8ème compétence, la 7ème doit être au niveau Parfait.","Il faut 21 médailles équestres pour toutes les missions d'équitation.","Le taux biologique est ~50% — comptez ~20 jours pour la première.","Waryong, Imha et Jungrang sont les trois zones de guilde."];
let idx=Math.floor(Math.random()*facts.length);
document.getElementById('svtext').textContent=facts[idx];
function nextFact(){idx=(idx+1)%facts.length;document.getElementById('svtext').textContent=facts[idx];}

/* NAVBAR + BACK TO TOP */
const btt=document.getElementById('btt');
const navLinks=document.querySelectorAll('.nav-links a');
const sections=document.querySelectorAll('section[id]');
window.addEventListener('scroll',()=>{
  btt.classList.toggle('show',window.scrollY>400);
  let cur='';sections.forEach(s=>{if(window.scrollY>=s.offsetTop-88)cur=s.id});
  navLinks.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+cur));
},{passive:true});
