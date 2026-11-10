'use strict';
const data = JSON.parse(document.querySelector('#page-data').textContent);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = $('.menu-toggle');
const nav = $('#main-nav');
function closeMenu(returnFocus = false) {
  nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu');
  if(returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); nav.classList.toggle('is-open', open);
});
$$('#main-nav a').forEach(a => a.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => { if(e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true); });
window.matchMedia('(min-width:681px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

const revealElements = $$('.reveal');
$$('.module-grid, .applications-grid').forEach(group => {
 [...group.children].forEach((el,index)=>el.style.setProperty('--reveal-delay',`${(index % (group.classList.contains('module-grid') ? 2 : 4))*90}ms`));
});
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting) {entry.target.classList.add('in-view');observer.unobserve(entry.target);}
  }), {threshold: .12, rootMargin:'0px 0px -30px 0px'});
  revealElements.forEach(el=>observer.observe(el));
  // Reveals are progressive enhancement: never leave content inaccessible after a change.
  reduceMotion.addEventListener('change',e=>{if(e.matches){document.documentElement.classList.remove('motion-ready');observer.disconnect();}});
}
let framePending = false;
const hero = $('.hero'); const offer = $('#inscricao'); const header = $('#header');
function updateScroll(){
  const y=window.scrollY; const max=document.documentElement.scrollHeight-window.innerHeight;
  $('.reading-progress').style.transform=`scaleX(${max>0?Math.min(y/max,1):0})`;
  header.classList.toggle('scrolled', y>100);
  if(!reduceMotion.matches && window.innerWidth>680 && y<hero.offsetHeight) hero.style.setProperty('--hero-shift',`${Math.min(y*.13,100)}px`);
  const r=offer.getBoundingClientRect();
  $('.mobile-purchase').classList.toggle('visible',y>hero.offsetHeight-100 && !(r.top<window.innerHeight && r.bottom>0));
  framePending=false;
}
function requestScroll(){if(!framePending){framePending=true;requestAnimationFrame(updateScroll);}}
window.addEventListener('scroll',requestScroll,{passive:true});window.addEventListener('resize',requestScroll);updateScroll();

let activeProject=data.projects[0];
$$('[data-project]').forEach(button=>button.addEventListener('click',()=>{
 const p=data.projects.find(p=>p.id===button.dataset.project); if(!p)return; activeProject=p;
 $$('[data-project]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 $$('[data-art]').forEach(panel=>{panel.hidden=panel.dataset.art!==p.id;});$('#project-title').textContent=p.title;$('#project-description').textContent=p.description;$('#project-meta').textContent=p.meta;$('#project-caption').textContent=p.caption; $('#project-learning').replaceChildren(...p.learn.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
}));
const imageModal=$('#image-modal');
function openImage(src,caption){$('#modal-image').src=src;$('#modal-image').alt=caption;$('#modal-caption').textContent=caption;imageModal.showModal();document.body.classList.add('modal-open');}
$$('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>openImage(b.dataset.lightbox,b.dataset.caption)));
$$('dialog').forEach(dialog=>{
 dialog.querySelectorAll('.close-modal,.close-dialog').forEach(b=>b.addEventListener('click',()=>dialog.close()));
 dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
 dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
});

// Animate the complete details box in both directions, including quick hover reversals.
$$('.overview-item').forEach(item=>{
 const summary=item.querySelector('summary');
 let animation=null, targetOpen=false, pinned=false, leaveTimer;
 const setOpen=(next)=>{
  if(targetOpen===next && !animation)return;
  targetOpen=next;
  const from=item.getBoundingClientRect().height;
  if(animation){animation.cancel();animation=null;}
  item.style.height='';
  item.open=next;
  const to=item.getBoundingClientRect().height;
  item.open=true;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){item.open=next;return;}
  item.style.overflow='hidden';
  animation=item.animate([{height:from+'px'},{height:to+'px'}],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});
  animation.onfinish=()=>{item.open=targetOpen;item.style.overflow='';animation=null;};
 };
 item.addEventListener('pointerenter',e=>{
  clearTimeout(leaveTimer);
  if(e.pointerType==='mouse')setOpen(true);
 });
 item.addEventListener('pointerleave',()=>{
  if(!pinned)leaveTimer=setTimeout(()=>setOpen(false),140);
 });
 summary.addEventListener('click',e=>{
  e.preventDefault();clearTimeout(leaveTimer);
  pinned=!pinned;setOpen(pinned);
 });
});
