'use strict';

// Esta web NO utiliza backend. Lee archivos JSON que Netlify publica como estáticos.
// Las modificaciones hechas en Pages CMS se guardan en GitHub y Netlify las publica.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const create = (tag, className = '', text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};
const setText = (selector, value) => {
  const element = $(selector);
  if (element && typeof value === 'string') element.textContent = value;
};
const safeImageUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return '';
  // No aceptar protocolos ejecutables que puedan venir de un archivo editado.
  return /^(https?:\/\/|\/(?!\/)|\.\/)/i.test(value) ? value : '';
};
const safeExternalUrl = (value) => {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
};

let content = null;
let selectedCategory = 'Todos';
let activeProject = null;
let activePhoto = 0;
let lastFocused = null;

const icons = {
  kitchen: '<path d="M4 4h16v16H4zM4 10h16M13 4v16M17 14h0"/>',
  wardrobe: '<path d="M5 3h14v18H5zM12 3v18M9 11v3m6-3v3"/>',
  furniture: '<path d="M4 8h16v4H4zM7 12v9m10-9v9M7 5h10"/>',
  tools: '<path d="M13 7a5 5 0 0 1 6-5l-3 3 3 3 3-3a5 5 0 0 1-5 6L8 20a3 3 0 0 1-4-4z"/>'
};
function iconSvg(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [attribute, value] of Object.entries({
    viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': '1.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  })) svg.setAttribute(attribute, value);
  svg.innerHTML = icons[name] || icons.furniture; // Solo valores fijos definidos arriba.
  return svg;
}
function notify(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timeout);
  notify.timeout = setTimeout(() => toast.classList.remove('show'), 5500);
}
function whatsAppLink(message) {
  const phone = String(content?.whatsapp || '').replace(/\D/g, '');
  if (phone.length < 11 || phone.length > 15) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
function openWhatsApp(message) {
  const url = whatsAppLink(message);
  if (!url) {
    notify('Falta configurar el número de WhatsApp de Sergio en el administrador.');
    return;
  }
  // Se abre exclusivamente a partir de acciones del visitante.
  window.open(url, '_blank', 'noopener,noreferrer');
}

function renderServices() {
  const grid = $('#service-grid');
  grid.replaceChildren();
  content.services.forEach((service, index) => {
    if (!service.title) return;
    const card = create('a', 'service-card');
    card.href = '#contacto';
    card.setAttribute('aria-label', `Consultar por ${service.title}`);
    const header = create('div', 'service-card-top');
    header.append(create('span', 'service-num', String(index + 1).padStart(2, '0')));
    const icon = create('span', 'service-icon');
    icon.append(iconSvg(service.icon));
    header.append(icon);
    card.append(header, create('h3', '', service.title), create('p', '', service.description || ''));
    card.append(create('div', 'service-card-tail', 'CONSULTAR  ↗'));
    grid.append(card);
  });
}

function projectPhotos(project) {
  return [project.image, ...(Array.isArray(project.gallery) ? project.gallery : [])]
    .map(safeImageUrl).filter(Boolean);
}

function renderFilters() {
  const container = $('#filters');
  const categories = [...new Set(
    content.projects
      .filter(p => p.visible !== false)
      .map(p => p.category)
      .filter(Boolean)
  )];

  container.replaceChildren();

  for (const category of ['Todos', ...categories]) {
    const button = create('button', '', category);
    button.type = 'button';
    button.dataset.filter = category;
    button.setAttribute(
      'aria-pressed',
      String(category === selectedCategory)
    );
    container.append(button);
  }
}

function renderProjects() {
  const grid = $('#project-grid');
  grid.replaceChildren();
  const published = content.projects.filter(project => project.visible !== false);
  const visible = published.filter(project => selectedCategory === 'Todos' || project.category === selectedCategory);
  $('#example-note').hidden = !published.some(project => project.example);

  if (!visible.length) {
    grid.append(create('p', 'empty-projects', 'Todavía no hay trabajos publicados en esta categoría.'));
    return;
  }
  visible.forEach((project, index) => {
    const card = create('button', 'project-card');
    card.type = 'button';
    card.setAttribute('aria-label', `Ver fotografías de ${project.title}`);
    const picture = create('div', 'project-picture');
    const url = safeImageUrl(project.image);
    if (url) {
      const image = create('img');
      image.src = url;
      image.alt = project.title || 'Trabajo de carpintería';
      image.loading = 'lazy';
      image.onerror = () => { image.hidden = true; picture.classList.add('no-image'); };
      picture.append(image);
    } else picture.classList.add('no-image');
    picture.append(create('span', 'project-fallback', 'ST · CARPINTERÍA A MEDIDA'));
    picture.append(create('span', 'project-arrow', '↗'));
    const meta = create('div', 'project-meta');
    meta.append(create('div', 'project-category', `${(project.category || 'Otros').toUpperCase()}  /  ${String(index + 1).padStart(2, '0')}`));
    meta.append(create('h3', '', project.title || 'Trabajo a medida'));
    if (project.description) meta.append(create('p', 'project-description', project.description));
    if (project.example) meta.append(create('span', 'project-example', 'IMAGEN ILUSTRATIVA'));
    card.append(picture, meta);
    card.addEventListener('click', () => showProject(project));
    grid.append(card);
  });
}

// Galería de fotos: al hacer clic en un proyecto, permite recorrer sus imágenes.
function showProject(project) {
  activeProject = project;
  activePhoto = 0;
  lastFocused = document.activeElement;
  setText('#dialog-title', project.title || 'Trabajo de carpintería');
  setText('#dialog-category', project.category || 'Trabajo a medida');
  setText('#dialog-description', project.description || '');
  $('#dialog-example').hidden = !project.example;
  renderPhoto();
  $('#project-dialog').showModal();
}
function renderPhoto() {
  if (!activeProject) return;
  const photos = projectPhotos(activeProject);
  const photo = $('#dialog-photo');
  photo.hidden = photos.length === 0;
  $('#dialog-no-photo').hidden = photos.length !== 0;
  if (photos.length) {
    photo.src = photos[activePhoto];
    photo.alt = `${activeProject.title || 'Trabajo'} — foto ${activePhoto + 1} de ${photos.length}`;
  } else photo.removeAttribute('src');
  $('#dialog-count').textContent = photos.length ? `${activePhoto + 1} / ${photos.length}` : '';
  $('#dialog-prev').hidden = photos.length < 2;
  $('#dialog-next').hidden = photos.length < 2;
}
function changePhoto(step) {
  const photos = projectPhotos(activeProject || {});
  if (!photos.length) return;
  activePhoto = (activePhoto + step + photos.length) % photos.length;
  renderPhoto();
}

function renderSite(site) {
  const fields = {
    '#brand': site.brand, '#tagline': site.tagline, '#hero-eyebrow': site.heroEyebrow,
    '#hero-first': site.heroFirst, '#hero-second': site.heroSecond,
    '#hero-description': site.heroDescription, '#about-eyebrow': site.aboutEyebrow,
    '#about-title': site.aboutTitle, '#about-description': site.aboutDescription,
    '#services-intro': site.servicesIntro, '#projects-intro': site.projectsIntro,
    '#contact-title': site.contactTitle, '#contact-description': site.contactDescription
  };
  for (const [selector, value] of Object.entries(fields)) setText(selector, value);
  setText('#year', String(new Date().getFullYear()));
  if (site.brand) document.title = `${site.brand} Carpintería | Muebles a medida`;
  for (const [selector, url] of [['#hero-image', site.heroImage], ['#about-image', site.aboutImage]]) {
    if (safeImageUrl(url)) $(selector).src = url;
  }
  $('#city-detail').hidden = !site.city;
  setText('#city', site.city);
  $('#email-link').hidden = !site.email;
  if (site.email) {
    $('#email-link').href = `mailto:${encodeURIComponent(site.email.trim())}`;
    setText('#email-value', site.email);
  }
  const instagram = safeExternalUrl(site.instagram);
  $('#instagram-link').hidden = !instagram;
  if (instagram) $('#instagram-link').href = instagram;
  $('#floating-wa').addEventListener('click', event => {
    event.preventDefault();
    openWhatsApp('Hola, quisiera consultar por un trabajo de carpintería.');
  });
}

async function loadData() {
  // Promise.all trae las 3 fuentes de información por separado.
  const paths = ['/data/site.json', '/data/services.json', '/data/projects.json'];
  const results = await Promise.all(paths.map(async path => {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Error HTTP ${response.status}: ${path}`);
    return response.json();
  }));
  const [site, services, projects] = results;
  if (!site || !Array.isArray(services) || !Array.isArray(projects)) throw new Error('Formato de contenido incorrecto');
  content = { ...site, services, projects };
  renderSite(site);
  renderServices();
  renderFilters();
  renderProjects();
}

// Interacciones (no requieren framework ni servidor).
const menu = $('.menu-button');
menu.addEventListener('click', () => {
  const opened = $('.nav').classList.toggle('open');
  menu.setAttribute('aria-expanded', String(opened));
});
$$('.nav a').forEach(link => link.addEventListener('click', () => {
  $('.nav').classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}));
$('#filters').addEventListener('click', event => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  selectedCategory = button.dataset.filter;
  $$('#filters button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  if (content) renderProjects();
});
$('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#client-name').value.trim();
  const type = $('#client-type').value;
  const description = $('#client-message').value.trim();
  if (!name || !type || !description) return;
  openWhatsApp(`Hola, soy ${name}. Quisiera consultar por ${type.toLowerCase()}.\n\n${description}`);
});
$('#dialog-close').addEventListener('click', () => $('#project-dialog').close());
$('#dialog-cta').addEventListener('click', () => $('#project-dialog').close());
$('#dialog-prev').addEventListener('click', () => changePhoto(-1));
$('#dialog-next').addEventListener('click', () => changePhoto(1));
$('#project-dialog').addEventListener('click', event => {
  if (event.target === $('#project-dialog')) $('#project-dialog').close();
});
$('#project-dialog').addEventListener('close', () => lastFocused?.focus());
$('#project-dialog').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') changePhoto(-1);
  if (event.key === 'ArrowRight') changePhoto(1);
});
$('#hero-image').addEventListener('error', () => { $('#hero-image').src = '/assets/hero-placeholder.svg'; }, { once: true });
$('#about-image').addEventListener('error', () => { $('#about-image').src = '/assets/about-placeholder.svg'; }, { once: true });

loadData().catch(error => {
  console.error('No se pudo leer el contenido estático:', error);
  $('#project-grid').replaceChildren(create('p', 'empty-projects', 'No se pudieron cargar los trabajos. Abrí la web desde Netlify o un servidor local.'));
  notify('No se pudieron leer los archivos de contenido.');
});
