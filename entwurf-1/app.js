'use strict';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reduceMotion = reducedQuery.matches;
try { reduceMotion = localStorage.getItem('estatestar-motion') === 'reduce' || reduceMotion; } catch {}
const heroVideo = $('#hero-video');
const motionToggle = $('#motion-toggle');
let manuallyPaused = false;

function updateMotion() {
  document.documentElement.classList.toggle('reduced-motion', reduceMotion);
  document.documentElement.classList.toggle('js-motion', !reduceMotion);
  $('#settings-motion').textContent = reduceMotion ? 'Bewegung aktivieren' : 'Bewegung reduzieren';
  if (reduceMotion) {
    heroVideo.pause();
    $$('.reveal').forEach(el => el.classList.add('in-view'));
  } else if (!manuallyPaused && !document.hidden) {
    heroVideo.play().catch(() => {});
  }
  updateVideoButton();
}
function updateVideoButton() {
  const paused = heroVideo.paused;
  motionToggle.setAttribute('aria-label', paused ? 'Hintergrundvideo abspielen' : 'Hintergrundvideo pausieren');
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.innerHTML = paused ? '▶ <span>Abspielen</span>' : 'Ⅱ <span>Pause</span>';
}
heroVideo.addEventListener('playing', () => { heroVideo.classList.add('playing'); updateVideoButton(); });
heroVideo.addEventListener('pause', updateVideoButton);
heroVideo.addEventListener('error', () => { heroVideo.classList.remove('playing'); motionToggle.hidden = true; });
motionToggle.addEventListener('click', () => {
  if (heroVideo.paused) { manuallyPaused = false; heroVideo.play().catch(updateVideoButton); }
  else { manuallyPaused = true; heroVideo.pause(); }
});
$('#settings-motion').addEventListener('click', () => {
  reduceMotion = !reduceMotion;
  try { localStorage.setItem('estatestar-motion', reduceMotion ? 'reduce' : 'full'); } catch {}
  updateMotion();
});
reducedQuery.addEventListener('change', event => { reduceMotion = event.matches; updateMotion(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) heroVideo.pause();
  else if (!reduceMotion && !manuallyPaused && window.scrollY < window.innerHeight) heroVideo.play().catch(() => {});
});
updateMotion();

const revealObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.classList.add('in-view');
    revealObserver.unobserve(entry.target);
  }
}, { threshold: 0.1 });
$$('.reveal').forEach(el => revealObserver.observe(el));
const videoObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !reduceMotion && !manuallyPaused && !document.hidden) heroVideo.play().catch(() => {});
  else heroVideo.pause();
}, { threshold: 0.05 });
videoObserver.observe($('.hero'));

let ticking = false;
const header = $('.header');
const progress = $('.progress');
const heroMedia = $('.hero-media');
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    header.classList.toggle('sticky', y > 110);
    const length = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (length > 0 ? Math.min(y / length, 1) : 0) + ')';
    if (!reduceMotion && y < innerHeight && innerWidth > 800) heroMedia.style.transform = 'translateY(' + y * .2 + 'px) scale(1.025)';
    ticking = false;
  });
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const menuToggle = $('.menu-toggle');
const mobileMenu = $('#mobile-menu');
function closeMenu() {
  mobileMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Menü öffnen');
  document.body.classList.remove('menu-open');
  $('main').inert = false;
  $('.footer').inert = false;
}
menuToggle.addEventListener('click', () => {
  const open = mobileMenu.hidden;
  mobileMenu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  document.body.classList.toggle('menu-open', open);
  $('main').inert = open;
  $('.footer').inert = open;
});
$$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuToggle.focus(); }
});
addEventListener('resize', () => { if (innerWidth > 800) closeMenu(); });

const projectData = [
  { title:'Westhafen Tower', category:'photo', type:'ARCHITEKTURFOTOGRAFIE', city:'Frankfurt am Main', image:'assets/westhafen-full.webp', description:'Glas, Geometrie und ein unverwechselbarer Rhythmus. Architekturfotografie aus dem ESTATESTAR-Portfolio.' },
  { title:'Berlin aus einer anderen Perspektive', category:'photo', type:'LUFTAUFNAHME', city:'Berlin · Regierungsviertel', image:'assets/berlin-full.webp', description:'Das Regierungsviertel aus der Luft. Eine Perspektive, die Architektur und ihren städtischen Kontext zusammenbringt.' },
  { title:'Neuer Wall', category:'film', type:'IMMOBILIENFILM', city:'Hamburg · Office', image:'assets/neuer-wall.webp', video:'https://estatestar.de/wp-content/uploads/2023/04/Neuer-Wall-Film-Office-Buero-Immobilienvideo_Comp.mp4', description:'Büroflächen am Neuen Wall. Der Originalfilm aus dem EstateStar-Portfolio.' },
  { title:'Rocket Tower', category:'photo', type:'ARCHITEKTURFOTOGRAFIE', city:'Berlin · Kreuzberg', image:'assets/rocket-full.webp', description:'Farbe und Form als architektonisches Statement. Der Rocket Tower in Berlin, fotografiert von ESTATESTAR.' },
  { title:'The Grid', category:'tour', type:'VIRTUELLE 360°-TOUR', city:'Berlin · Prinzenstraße', image:'assets/tour.webp', url:'https://my.mpskin.com/de/tour/estatestar-thegrid', description:'Räume selbst entdecken: die interaktive ESTATESTAR-Tour durch The Grid in Berlin.' },
  { title:'Elbphilharmonie', category:'photo', type:'LUFTAUFNAHME', city:'Hamburg · HafenCity', image:'assets/hamburg.webp', description:'Architektur zwischen Wasser und Stadt. Luftaufnahme der Elbphilharmonie aus dem EstateStar-Portfolio.' },
  { title:'Logistik in Perspektive', category:'film', type:'IMMOBILIENFILM', city:'Fritzlar · Logistics', image:'assets/logistics.webp', video:'https://estatestar.de/wp-content/uploads/2023/04/Fritzlar-Immobilienfilm-Logistikhalle-Logistikflaeche-Film-Video_Comp.mp4', description:'Flächen, Anbindung und Dimensionen filmisch erfahrbar machen. Immobilienfilm einer Logistikfläche in Fritzlar.' },
  { title:'Townhouse Berlin', category:'photo', type:'INTERIEURFOTOGRAFIE', city:'Berlin · Residential', image:'assets/interior.webp', description:'Material, Licht und Atmosphäre. Interieurfotografie aus dem EstateStar-Portfolio.' }
];
const slider = $('#work-slider');
let currentProjects = projectData;
let currentFilter = 'all';
let suppressClick = false;
let down = null;
function renderProjects(filter) {
  currentFilter = filter;
  currentProjects = filter === 'all' ? projectData : projectData.filter(p => p.category === filter);
  slider.replaceChildren();
  currentProjects.forEach((project, index) => {
    const button = document.createElement('button');
    button.className = 'project';
    button.type = 'button';
    button.setAttribute('aria-label', project.title + (project.category === 'film' ? ' – Film ansehen' : project.category === 'tour' ? ' – Tour öffnen' : ' – Foto vergrößern'));
    button.innerHTML = '<div class="project-picture"><img src="' + project.image + '" alt="' + project.title + '" loading="lazy" width="1200" height="750" draggable="false"><span class="project-type">' + project.type + '</span><span class="project-open" aria-hidden="true">' + (project.category === 'film' ? '▶' : project.category === 'tour' ? '360°' : '+') + '</span></div><div class="project-info"><div><h3>' + project.title + '</h3><p>' + project.city + '</p></div><span>' + String(index + 1).padStart(2, '0') + '</span></div>';
    button.addEventListener('click', () => { if (!suppressClick) openProject(project); });
    slider.append(button);
  });
  slider.scrollLeft = 0;
  $$('.filters button').forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#filter-summary').textContent = currentProjects.length + (currentProjects.length === 1 ? ' ausgewählte Arbeit' : ' ausgewählte Arbeiten');
  requestAnimationFrame(updateSlider);
}
function updateSlider() {
  const cards = $$('.project', slider);
  if (!cards.length) return;
  const index = cards.reduce((best, card, i) => Math.abs(card.offsetLeft - cards[0].offsetLeft - slider.scrollLeft) < Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - slider.scrollLeft) ? i : best, 0);
  $('#work-count').textContent = String(index + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
  $('#work-prev').disabled = slider.scrollLeft < 5;
  $('#work-next').disabled = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5;
}
function stepSlider(direction) {
  const card = $('.project', slider);
  const gap = parseFloat(getComputedStyle(slider).gap) || 28;
  slider.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: reduceMotion ? 'instant' : 'smooth' });
}
$('#work-prev').addEventListener('click', () => stepSlider(-1));
$('#work-next').addEventListener('click', () => stepSlider(1));
slider.addEventListener('scroll', updateSlider, { passive: true });
slider.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); stepSlider(1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); stepSlider(-1); }
});
slider.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  down = { x:event.clientX, left:slider.scrollLeft };
  suppressClick = false;
});
addEventListener('pointermove', event => {
  if (!down) return;
  const delta = event.clientX - down.x;
  if (Math.abs(delta) > 7) {
    suppressClick = true;
    slider.classList.add('dragging');
    slider.scrollLeft = down.left - delta;
  }
});
addEventListener('pointerup', () => {
  down = null;
  slider.classList.remove('dragging');
  setTimeout(() => { suppressClick = false; }, 0);
});
$$('.filters button').forEach(button => button.addEventListener('click', () => renderProjects(button.dataset.filter)));
$$('[data-jump-filter]').forEach(a => a.addEventListener('click', () => renderProjects(a.dataset.jumpFilter)));
addEventListener('resize', updateSlider);
renderProjects('all');

const modal = $('#media-modal');
const modalBody = $('#modal-body');
function showModal(title, eyebrow, description) {
  $('#modal-title').textContent = title;
  $('#modal-eyebrow').textContent = eyebrow;
  $('#modal-description').textContent = description || '';
  modalBody.replaceChildren();
  if (!modal.open) modal.showModal();
}
function addVideo(src, poster) {
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.src = src;
  if (poster) video.poster = poster;
  video.setAttribute('aria-label', $('#modal-title').textContent);
  modalBody.append(video);
  video.play().catch(() => {});
  const fallback = document.createElement('a');
  fallback.className = 'text-link';
  fallback.href = src;
  fallback.target = '_blank';
  fallback.rel = 'noopener';
  fallback.textContent = 'Film separat öffnen';
  modalBody.append(fallback);
}
function addTour(url) {
  const panel = document.createElement('div');
  panel.className = 'tour-consent';
  panel.innerHTML = '<img src="assets/tour.webp" alt=""><div><h3>Bereit für einen Perspektivwechsel?</h3><p>Die interaktive Tour wird von MPskin / Matterport geladen. Dabei wird eine Verbindung zum externen Anbieter hergestellt.</p><button class="button light-button" id="load-tour">Tour laden</button><a href="' + url + '" target="_blank" rel="noopener">Tour in neuem Tab öffnen</a></div>';
  modalBody.append(panel);
  $('#load-tour').addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'tour-iframe';
    iframe.title = 'ESTATESTAR – virtueller Rundgang durch The Grid';
    iframe.allow = 'fullscreen; xr-spatial-tracking';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    modalBody.replaceChildren(iframe);
    const fallback = document.createElement('a');
    fallback.href = url; fallback.target = '_blank'; fallback.rel = 'noopener'; fallback.className = 'text-link';
    fallback.textContent = 'Tour separat öffnen';
    modalBody.append(fallback);
  });
}
function openProject(project) {
  showModal(project.title, project.type + ' · ' + project.city, project.description);
  if (project.category === 'film') addVideo(project.video, project.image);
  else if (project.category === 'tour') addTour(project.url);
  else {
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title + ' – ' + project.city;
    modalBody.append(img);
  }
}
$$('[data-showreel]').forEach(button => button.addEventListener('click', () => {
  showModal('We make your estate a star.', 'ESTATESTAR SHOWREEL', 'Ein Blick in unsere Welt: Architektur, Perspektive und Bewegung.');
  addVideo('https://estatestar.de/wp-content/uploads/2023/05/Estatestar-Showreel-Immobilienvideo-Immobilie-Foto-Film-360-16x9_Comp.mp4', 'assets/hero-poster.webp');
}));
$$('[data-tour]').forEach(button => button.addEventListener('click', () => openProject(projectData.find(p => p.category === 'tour'))));
$('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', event => {
  if (event.target !== modal) return;
  const r = modal.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
});
modal.addEventListener('close', () => {
  $$('video', modalBody).forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
  modalBody.replaceChildren();
});

const serviceImages = [
  ['assets/westhafen-full.webp', 'Architekturfotografie des Westhafen Towers'],
  ['assets/hero-poster.webp', 'Filmszene aus dem EstateStar-Showreel'],
  ['assets/tour.webp', 'Dreidimensionale Übersicht einer virtuellen EstateStar-Tour'],
  ['assets/lab-after.webp', 'Architekturaufnahme aus dem EstateStar Digital Lab']
];
$$('.service').forEach(detail => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    $$('.service').forEach(other => { if (other !== detail) other.open = false; });
    const i = Number(detail.dataset.service);
    const image = $('#service-preview');
    image.src = serviceImages[i][0]; image.alt = serviceImages[i][1];
    $('#service-index').textContent = '0' + (i + 1) + ' / 04';
  });
});

const stage = $('#depth-stage');
stage.addEventListener('pointermove', event => {
  if (reduceMotion || event.pointerType === 'touch') return;
  const r = stage.getBoundingClientRect();
  const x = (event.clientX - r.left) / r.width - .5;
  const y = (event.clientY - r.top) / r.height - .5;
  $('.depth-main').style.transform = 'rotateX(' + (8 - y * 12) + 'deg) rotateY(' + (-15 + x * 18) + 'deg) rotateZ(-7deg) translateZ(20px)';
  $('.depth-back').style.transform = 'rotateX(' + (6 - y * 6) + 'deg) rotateY(' + (-17 + x * 10) + 'deg) rotateZ(8deg) translateZ(-50px)';
});
stage.addEventListener('pointerleave', () => {
  $('.depth-main').style.transform = '';
  $('.depth-back').style.transform = '';
});
$('#compare-range').addEventListener('input', event => {
  $('#comparison').style.setProperty('--split', event.target.value + '%');
  event.target.setAttribute('aria-valuetext', (100 - Number(event.target.value)) + ' Prozent bearbeitete Aufnahme');
});
$('#brief-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const services = data.getAll('service');
  const message = 'Hallo EstateStar,\n\nich möchte ein Projekt mit Ihnen besprechen.\n\nLeistungen: ' + (services.length ? services.join(', ') : 'Noch offen') + '\n\n' + data.get('message') + '\n\n' + data.get('name') + '\n' + data.get('email');
  const email = document.createElement('a');
  email.href = 'mailto:studio@estatestar.de?subject=' + encodeURIComponent('Projektanfrage · ' + data.get('name')) + '&body=' + encodeURIComponent(message);
  email.click();
  $('#form-status').textContent = 'Ihr Briefing ist vorbereitet. Bitte senden Sie es in Ihrem E-Mail-Programm ab. Falls sich kein Programm öffnet: Schreiben Sie direkt an studio@estatestar.de.';
});
$('#year').textContent = new Date().getFullYear();
