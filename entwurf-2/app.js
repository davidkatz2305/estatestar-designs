const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const mq=matchMedia('(prefers-reduced-motion:reduce)');let reduced=mq.matches,world=null;
try{reduced=localStorage.getItem('estate-flow-motion')==='reduce'||reduced;}catch{}
const journey=$('#journey'),canvas=$('#world'),chapters=$$('[data-chapter]'),rail=$('.journey-progress');
const works=[
 {id:'westhafen',title:'Westhafen Tower',place:'Frankfurt am Main',kind:'photo',label:'PHOTO',image:'assets/westhafen-full.webp'},
 {id:'berlin',title:'Berlin. Von oben.',place:'Berlin · Regierungsviertel',kind:'photo',label:'AERIAL',image:'assets/berlin-full.webp'},
 {id:'neuerwall',title:'Neuer Wall',place:'Hamburg · Office',kind:'film',label:'FILM',image:'assets/neuer-wall.webp',video:'https://estatestar.de/wp-content/uploads/2023/04/Neuer-Wall-Film-Office-Buero-Immobilienvideo_Comp.mp4'},
 {id:'rocket',title:'Rocket Tower',place:'Berlin · Kreuzberg',kind:'photo',label:'PHOTO',image:'assets/rocket-full.webp'},
 {id:'tour',title:'The Grid',place:'Berlin · Prinzenstraße',kind:'tour',label:'360°',image:'assets/tour.webp'},
 {id:'hamburg',title:'Elbphilharmonie',place:'Hamburg · HafenCity',kind:'photo',label:'AERIAL',image:'assets/hamburg.webp'},
 {id:'logistics',title:'Logistik in Perspektive',place:'Fritzlar · Logistics',kind:'film',label:'FILM',image:'assets/logistics.webp',video:'https://estatestar.de/wp-content/uploads/2023/04/Fritzlar-Immobilienfilm-Logistikhalle-Logistikflaeche-Film-Video_Comp.mp4'},
 {id:'townhouse',title:'Townhouse Berlin',place:'Berlin · Residential',kind:'photo',label:'INTERIEUR',image:'assets/interior.webp'}
];
const showreel={id:'showreel',title:'EstateStar Showreel',place:'Architektur. In Bewegung.',kind:'film',label:'SHOWREEL',image:'assets/hero-poster.webp',video:'https://estatestar.de/wp-content/uploads/2023/05/Estatestar-Showreel-Immobilienvideo-Immobilie-Foto-Film-360-16x9_Comp.mp4'};
function renderWorks(filter='all'){
 const visible=works.filter(w=>filter==='all'||w.kind===filter);
 $('#work-grid').innerHTML=visible.map(w=>`<button class="work-card" data-media="${w.id}" aria-label="${w.title} – ${w.kind==='photo'?'Foto ansehen':w.kind==='film'?'Film ansehen':'Tour öffnen'}"><div class="work-image"><img src="${w.image}" alt="${w.title}" loading="lazy" width="1000" height="800"><span class="work-open" aria-hidden="true">+</span></div><div class="work-meta"><div><h3>${w.title}</h3><p>${w.place}</p></div><span>${w.label}</span></div></button>`).join('');
 $('#work-status').textContent=visible.length+' Arbeiten';
}
renderWorks();
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderWorks(button.dataset.filter);}));
const dialog=$('#media-dialog'),content=$('#dialog-content');let trigger=null;
function openMedia(id,from){const item=id==='showreel'?showreel:works.find(w=>w.id===id);if(!item)return;trigger=from;$('#dialog-kind').textContent=item.label;$('#dialog-title').textContent=item.title;$('#dialog-caption').textContent=item.place;content.replaceChildren();
 if(item.kind==='photo'){const img=new Image();img.src=item.image;img.alt=item.title;content.append(img);}
 if(item.kind==='film'){const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.poster=item.image;video.src=item.video;content.append(video);video.play().catch(()=>{});}
 if(item.kind==='tour'){content.innerHTML='<div class="tour-choice"><div><h3>Die Tür ist offen.</h3><p>Der virtuelle Rundgang wird von MPskin / Matterport bereitgestellt. Beim Laden verbinden Sie sich mit dem externen Anbieter.</p><button class="pill" id="load-tour">Tour laden<span class="pill-icon" aria-hidden="true">+</span></button><a href="https://my.mpskin.com/de/tour/estatestar-thegrid" target="_blank" rel="noopener">Rundgang in neuem Tab öffnen</a></div></div>';$('#load-tour').addEventListener('click',()=>{const iframe=document.createElement('iframe');iframe.src='https://my.mpskin.com/de/tour/estatestar-thegrid';iframe.title='The Grid – EstateStar 360°-Rundgang';iframe.className='tour-frame';iframe.allow='fullscreen; xr-spatial-tracking';iframe.allowFullscreen=true;content.replaceChildren(iframe);});}
 dialog.showModal();world?.setActive(false);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-media]');if(b)openMedia(b.dataset.media,b);});
$('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{content.querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('src');v.load();});content.replaceChildren();trigger?.focus();onScroll();});
const menu=$('#menu'),menuButton=$('.menu-toggle');function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Menü öffnen');document.body.classList.remove('menu-open');$('main').inert=false;$('footer').inert=false;}
menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');document.body.classList.toggle('menu-open',open);$('main').inert=open;$('footer').inert=open;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=$(a.getAttribute('href'));if(!el)return;e.preventDefault();closeMenu();history.replaceState(null,'',a.getAttribute('href'));const top=el.getBoundingClientRect().top+scrollY;window.scrollTo({top,behavior:reduced?'instant':'smooth'});}));
function applyMotion(){document.documentElement.classList.toggle('reduced',reduced);$('#motion-toggle').textContent=reduced?'Bewegung aktivieren':'Bewegung reduzieren';$('#motion-toggle').setAttribute('aria-pressed',String(reduced));world?.setReduced(reduced);world?.setActive(!reduced&&!dialog.open);document.documentElement.style.removeProperty('--journey-color');journey.style.background='';measure();onScroll();}
$('#motion-toggle').addEventListener('click',()=>{reduced=!reduced;try{localStorage.setItem('estate-flow-motion',reduced?'reduce':'full');}catch{}applyMotion();});mq.addEventListener('change',e=>{reduced=e.matches;applyMotion();});
$('#world-compare').addEventListener('input',e=>{world?.setCompare(Number(e.target.value)/100);$('.fallback-compare').style.setProperty('--split',e.target.value+'%');});
$$('[data-media="westhafen"]').forEach(el=>{el.addEventListener('pointerenter',()=>world?.setHover(1));el.addEventListener('pointerleave',()=>world?.setHover(0));el.addEventListener('focus',()=>world?.setHover(1));el.addEventListener('blur',()=>world?.setHover(0));});
$('#brief-form').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget);const body=`Guten Tag EstateStar,\n\nLeistungen: ${d.getAll('service').join(', ')||'Noch offen'}\n\nProjekt:\n${d.get('project')}\n\n${d.get('name')}\n${d.get('email')}`;location.href='mailto:studio@estatestar.de?subject='+encodeURIComponent('Projektanfrage / '+d.get('name'))+'&body='+encodeURIComponent(body);});
let anchors=[],end=0;function measure(){anchors=chapters.map(el=>el.getBoundingClientRect().top+scrollY);end=journey.getBoundingClientRect().bottom+scrollY;}
function currentProgress(){const y=scrollY;if(y<=anchors[0])return 0;for(let i=0;i<anchors.length-1;i++){if(y<anchors[i+1])return i+(y-anchors[i])/(anchors[i+1]-anchors[i]);}return 4;}
function onScroll(){const p=currentProgress();world?.setProgress(p);world?.setActive(scrollY<end&&!document.hidden&&!dialog.open&&!reduced);rail.style.opacity=scrollY>end-innerHeight*.5?'0':'1';$('#chapter-count').textContent=String(Math.min(5,Math.round(p)+1)).padStart(2,'0');$('.journey-progress i').style.transform=`scaleY(${.05+p/4*.95})`;}
applyMotion();addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',()=>{measure();onScroll();});addEventListener('hashchange',onScroll);addEventListener('pageshow',()=>{measure();onScroll();});
if(new URLSearchParams(location.search).has('fallback')){document.documentElement.classList.add('no-webgl');}
else{try{const {createWorld}=await import('./world.js');world=await createWorld(canvas,{reduced,onState:s=>{
 if(reduced)return;const d=s.dark;journey.style.background=`rgb(${Math.round(233-213*d)} ${Math.round(233-212*d)} ${Math.round(228-207*d)})`;
 chapters.forEach((el,i)=>{const copy=$('.chapter-inner',el);const a=Math.max(0,Math.min(1,1-Math.abs(s.progress-i)*1.45));copy.style.opacity=String(a);copy.style.transform=`translateY(${(i-s.progress)*30}px)`;});
 canvas.dataset.progress=s.progress.toFixed(3);canvas.dataset.drawCalls=s.drawCalls;canvas.dataset.triangles=s.triangles;canvas.dataset.textures=s.textures;canvas.dataset.renderMs=s.renderMs.toFixed(2);canvas.dataset.frameMs=s.frameMs.toFixed(2);
}});if(!world)document.documentElement.classList.add('no-webgl');}catch{document.documentElement.classList.add('no-webgl');}}
await document.fonts.ready;measure();world?.setProgress(currentProgress(),true);applyMotion();onScroll();
window.addEventListener('pagehide',e=>{if(!e.persisted)world?.destroy();else world?.setActive(false);});
