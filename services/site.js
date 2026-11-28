// Keep approved menu structure, prices and UI behavior when editing copy.
// Each dish stays a short client-facing proposition plus possible deliverables.
// Do not replace Reviews/Ordered with a generic Work view, or describe story
// projects as imagined/simulated. Their examples explain how the work functions.
// Reveal words name the outcome that the deliverables below make concrete.
// Stable dish numbers connect the menu, examples and enquiry emails.
const menu = [
  {
    id: 'fictional-worlds', number: 'I',
    name: 'Give people evidence of your fictional world',
    ingredients: 'Invitations, records, objects from the story, digital archives',
    price: '$1,600', timing: '5 working days',
    projects: ['lost-horizon', 'devil-return']
  },
  {
    id: 'visual-identity', number: 'II',
    name: 'Give an everyday thing a distinctive identity',
    ingredients: 'Visual identity, publications, websites',
    price: '$3,200', timing: '10 working days',
    projects: ['echoes']
  },
  {
    id: 'type-and-worlds', number: 'III',
    name: 'Give your project a typeface of its own',
    ingredients: 'Custom letterforms, font files, type specimens. A pictographic script for readers to decipher can be commissioned too.',
    price: '$6,400', timing: '1 month',
    projects: ['pcell']
  },
  {
    id: 'music-visuals', number: 'IV',
    name: 'Give your music a visual identity on record and on stage',
    ingredients: 'Release artwork, live visuals, projections',
    price: '$120',
    priceUnit: ' / project',
    projects: ['gala', 'deep-learning']
  },
  {
    id: 'audience-participation', number: 'V',
    name: 'Give your audience a part to play in your work',
    ingredients: 'Gesture interaction, responsive visuals, interactive prototypes',
    price: 'Price and timing on enquiry',
    projects: ['pcell', 'the-one', 'lost-horizon']
  },
  {
    id: 'event-identity', number: 'VI',
    name: 'Give your event a look of its own',
    ingredients: 'Event identity, invitations, tickets, campaign materials',
    price: '$640', timing: '2–3 working days',
    projects: ['devil-return']
  },
  {
    id: 'regular', number: 'VII',
    name: 'Bring in an extra pair of hands',
    ingredients: 'Temporary design and technical support',
    price: '$40/hr',
    projects: []
  }
];
// Read from finding a subject to giving audiences a way to take part.
const menuOrder = ['visual-identity', 'fictional-worlds', 'type-and-worlds', 'event-identity', 'music-visuals', 'regular', 'audience-participation'];
menu.sort((a, b) => menuOrder.indexOf(a.id) - menuOrder.indexOf(b.id));
menu.forEach((dish, index) => { dish.number = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][index]; });
const edits = {
  'devil-return': {
    media: [0, 2],
    description: 'For an exclusive comet return event, a mailed invitation and ticket make the experience begin before guests arrive.'
  },
  'lost-horizon': {
    title: 'Lost Horizon',
    media: [1, 0],
    description: 'Clues in a physical dossier unlock a digital archive, turning readers into investigators.'
  },
  echoes: {
    media: [0, 3],
    description: 'Patterns underfoot become a visual identity, connecting New York manhole covers with Fulu talismans in a book and mobile site.'
  },
  pcell: {
    title: 'Pcell',
    media: [1, 0],
    description: 'Letterforms give a first glimpse of another world, opening into a field of points that responds to your hands.'
  },
  gala: {
    media: [0],
    description: 'Live visuals performed to GALA by XG follow the track in real time.'
  },
  'deep-learning': {
    source: 'music',
    title: 'Deep Learning',
    cover: '../services/deep-learning.jpg',
    media: [7],
    description: 'Rhythm and tension in Deep Learning by BLASÉ guide the movement and cuts.'
  },
  'the-one': {
    media: [0, 1],
    description: 'Participants shape the sound and light, with a book carrying the experience beyond the installation.'
  }
};

const portfolio = new URL('../design/', document.baseURI);
const asset = path => new URL(path, portfolio).href;
const projects = new Map(window.PROJECTS.map(project => [project.id, project]));
const $ = id => document.getElementById(id);

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const textObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) {
      entry.target.dataset.entered = 'false';
      continue;
    }
    if (entry.target.dataset.entered === 'true') continue;
    entry.target.dataset.entered = 'true';
    entry.target.dataset.replays = String(Number(entry.target.dataset.replays || 0) + 1);
    if (!reducedMotion.matches) {
      entry.target.getAnimations().forEach(animation => animation.cancel());
      entry.target.animate([
        { opacity: 0, filter: 'blur(4px)' },
        { opacity: 1, filter: 'blur(0px)' }
      ], { duration: 1000, easing: 'ease-out' });
    }
  }
}, { threshold: 0, rootMargin: '-8% 0px -8% 0px' }) : null;

document.querySelectorAll('.story-copy').forEach(copy => textObserver?.observe(copy));

const preview = new URLSearchParams(location.search);
document.documentElement.dataset.blend = preview.get('blend') || 'difference';
const reviewLayout = preview.get('layout') === 'c' || preview.get('layout') === 'a' ? 'c' : 'b';
document.documentElement.dataset.reviewLayout = reviewLayout;
const revealWords = {
  'visual-identity': 'identity',
  'type-and-worlds': 'typeface',
  'fictional-worlds': 'evidence',
  'music-visuals': 'visual identity',
  'event-identity': 'look of its own',
  'audience-participation': 'part to play'
};

function addDeliverablesReveal(dish, name, ingredients) {
  const word = revealWords[dish.id];
  const offset = dish.name.indexOf(word);
  name.textContent = '';
  const trigger = element('span', 'objects-trigger', word);
  trigger.dataset.revealed = 'false';
  name.append(document.createTextNode(dish.name.slice(0, offset)), trigger, document.createTextNode(dish.name.slice(offset + word.length)));
  ingredients.id = dish.id + '-deliverables';
  ingredients.classList.add('objects-deliverables');
  ingredients.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 120 42');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('hand-mark');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', 'M4 9 C24 13 70 10 99 6 C109 4 114 8 108 12 C94 20 72 20 67 27 C63 31 62 35 64 39');
  path.setAttribute('pathLength', '1');
  svg.append(path);
  trigger.append(svg);
  let opened = false;
  const reveal = () => {
    if (opened) return;
    opened = true;
    trigger.dataset.revealed = 'true';
    ingredients.setAttribute('aria-hidden', 'false');
    if (reducedMotion.matches) {
      ingredients.style.opacity = '1';
      path.style.strokeDashoffset = '0';
      return;
    }
    path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, fill: 'forwards', easing: 'ease-in-out' });
    ingredients.animate([
      { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      { opacity: 1, clipPath: 'inset(0 0% 0 0)' }
    ], { duration: 1300, delay: 950, easing: 'ease-out', fill: 'forwards' });
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= .6) reveal();
        else if (!entry.isIntersecting) {
          opened = false;
          path.getAnimations().forEach(animation => animation.cancel());
          ingredients.getAnimations().forEach(animation => animation.cancel());
          path.style.strokeDashoffset = '1';
          ingredients.style.opacity = '0';
          ingredients.setAttribute('aria-hidden', 'true');
          trigger.dataset.revealed = 'false';
        }
      }
    }, { threshold: [0, .6], rootMargin: '-15% 0px -15% 0px' });
    observer.observe(name);
  } else reveal();
}

function makeMedia(item, project, title) {
  const figure = element('figure', 'project-media');
  const isVideo = item.type === 'video';
  const media = element(isVideo ? 'video' : 'img');
  if (isVideo) {
    media.preload = 'none';
    media.playsInline = true;
    const posterName = item.src.split('/').pop().replace(/\.[^.]+$/, '.jpg');
    media.poster = item.poster ? asset(item.poster) : new URL('assets/posters/' + posterName, document.baseURI).href;
    media.setAttribute('aria-label', title);
    const controls = element('figcaption', 'video-controls');
    const toggle = element('button', 'text-link', 'Play video');
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Play video for ' + title);
    toggle.addEventListener('click', async () => {
      if (!media.paused) return media.pause();
      document.querySelectorAll('video').forEach(other => {
        if (other !== media) other.pause();
      });
      try {
        await media.play();
      } catch (error) {
        if (error.name !== 'AbortError') toggle.textContent = 'Retry playback';
      }
    });
    const updateLabel = () => {
      toggle.textContent = media.paused ? 'Play video' : 'Pause video';
      toggle.setAttribute('aria-label', toggle.textContent + ' for ' + title);
    };
    ['play', 'pause', 'ended'].forEach(event => media.addEventListener(event, updateLabel));
    toggle.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || !Number.isFinite(media.duration)) return;
      event.preventDefault();
      media.currentTime = Math.max(0, Math.min(media.duration, media.currentTime + (event.key === 'ArrowLeft' ? -5 : 5)));
    });
    const mute = element('button', 'audio-toggle');
    mute.type = 'button';
    mute.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="sound-waves" d="M16 8c2 2 2 6 0 8M19 5c4 4 4 10 0 14"/><path class="sound-off" d="M16 8l6 8M22 8l-6 8"/></svg>';
    const updateMute = () => {
      mute.setAttribute('aria-label', (media.muted ? 'Unmute ' : 'Mute ') + title);
      mute.setAttribute('aria-pressed', String(media.muted));
      mute.title = media.muted ? 'Unmute' : 'Mute';
    };
    mute.addEventListener('click', () => { media.muted = !media.muted; });
    media.addEventListener('volumechange', updateMute);
    updateMute();
    controls.append(toggle, mute);
    figure.append(media, controls);
  } else {
    media.alt = title + ': ' + item.label;
    media.loading = 'lazy';
    media.decoding = 'async';
    if (item.width && item.height) {
      media.width = item.width;
      media.height = item.height;
    }
    figure.append(media);
  }
  media.addEventListener('error', () => {
    figure.replaceChildren(element('p', 'media-error', isVideo ? 'Video unavailable' : 'Image unavailable'));
  }, { once: true });
  media.src = asset(item.src);
  return figure;
}


function dishLink(dish, label) {
  const link = element('a', 'text-link', label);
  const body = 'Dish ' + dish.number + ': ' + dish.name + '\n\nProject details:\n\nDeliverables needed:\n\nTimeline:\n';
  link.href = 'mailto:niojin.noi@gmail.com?subject=' + encodeURIComponent('Enquiry for ' + dish.number + ' ' + dish.name) + '&body=' + encodeURIComponent(body);
  return link;
}

const menuIndex = element('nav', 'menu-index');
menuIndex.setAttribute('aria-label', 'Menu index, seven dishes');
const menuSections = new Map();
for (const [id, title] of [['specialities', 'House Specialties'], ['regular-menu', 'Regular']]) {
  const section = element('section', 'menu-section');
  section.id = id;
  const titleNode = element('h2', 'menu-section-title measure', title);
  titleNode.id = id + '-title';
  section.setAttribute('aria-labelledby', titleNode.id);
  section.append(titleNode);
  $('menu-items').append(section);
  menuSections.set(id, section);
  textObserver?.observe(titleNode);
}
const specialityIds = new Set(['visual-identity', 'fictional-worlds']);
for (const dish of menu) {
  const entry = element('article', 'menu-entry measure');
  entry.id = dish.id;
  const body = element('div', 'dish-body');
  const heading = element('h2', 'dish-heading');
  const number = dishLink(dish, dish.number);
  number.className = 'dish-number';
  number.setAttribute('aria-label', 'Enquire about dish ' + dish.number);
  heading.append(number);
  if (dish.id === 'audience-participation') heading.append(element('span', 'dish-addon', 'Add-on'));
  const name = element('p', 'dish-name', dish.name);
  const ingredients = element('p', 'ingredients', dish.ingredients);
  ingredients.setAttribute('aria-label', 'Possible deliverables: ' + dish.ingredients);
  const price = dishLink(dish, '');
  price.className = 'dish-price';
  // All listed fees and lead times are baselines, never fixed quotes.
  const basePrice = dish.price.startsWith('$') && dish.id !== 'regular' ? dish.price + '+' : dish.price;
  price.append(element('span', '', basePrice + (dish.priceUnit || '')));
  if (dish.timing) price.append(element('span', 'dish-timing', dish.timing.replace(/^(\d+(?:–\d+)?)/, '$1+')));
  price.title = 'Base pricing and minimum lead time; confirmed with project scope.';
  if (revealWords[dish.id]) addDeliverablesReveal(dish, name, ingredients);
  body.append(heading, name, ingredients, price);
  entry.append(body);
  menuSections.get(specialityIds.has(dish.id) ? 'specialities' : 'regular-menu').append(entry);
  textObserver?.observe(body);
  const jump = element('a', '', dish.number);
  jump.href = '#' + dish.id;
  const indexLabel = dish.number + ': ' + (dish.id === 'audience-participation' ? 'Add-on — ' : '') + dish.name;
  jump.setAttribute('aria-label', indexLabel);
  jump.title = indexLabel;
  jump.addEventListener('click', event => {
    event.preventDefault();
    history.replaceState(null, '', '#' + dish.id);
    body.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
  });
  menuIndex.append(jump);
}
$('menu-view').append(menuIndex);
const rateNote = element('p', 'menu-rate-note measure', 'Base pricing · Minimum lead times · Confirmed with project scope.');
$('menu-items').append(rateNote);

let indexScheduled = false;
function updateMenuIndex() {
  indexScheduled = false;
  updateReviewScale();
  const entries = menu.map(dish => $(dish.id).querySelector('.dish-body'));
  const nearest = entries.reduce((best, node) => Math.abs(node.getBoundingClientRect().top - innerHeight / 3) < Math.abs(best.getBoundingClientRect().top - innerHeight / 3) ? node : best);
  menuIndex.classList.toggle('is-visible', $('menu-items').getBoundingClientRect().top < innerHeight * .85);
  [...menuIndex.querySelectorAll('a')].forEach((link, index) => {
    if (entries[index] === nearest) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
addEventListener('scroll', () => {
  if (!indexScheduled) { indexScheduled = true; requestAnimationFrame(updateMenuIndex); }
}, { passive: true });
updateMenuIndex();

function caseFor(id, dish) {
  const edit = edits[id];
  const source = projects.get(edit.source || id);
  const project = { ...source, ...edit, sourceId: source.id };
  if (id === 'devil-return') project.description = 'An identity and promotional campaign for an exclusive comet return event, carried through its invitations, tickets and public material.';
  if (id === 'echoes') project.description = 'New York manhole covers take a new form through a visual identity that connects their patterns with Fulu talismans.';
  if (id === 'pcell' && dish.id === 'audience-participation') {
    project.description = 'Hand gestures reshape a field of points, giving visitors something they can play with, capture and share.';
    project.mediaIndices = [0];
  } else {
    project.mediaIndices = edit.media;
  }
  project.items = project.mediaIndices.map(index => source.media[index]);
  return project;
}

function reviewEntries() {
  const grouped = new Map();
  for (const dish of menu) {
    for (const id of dish.projects) {
      if (!grouped.has(id)) grouped.set(id, { dish, dishes: [], project: caseFor(id, dish) });
      grouped.get(id).dishes.push(dish);
    }
  }
  const order = ['devil-return', 'pcell', 'echoes', 'lost-horizon', 'gala', 'the-one', 'deep-learning'];
  const entries = order.map(id => grouped.get(id)).filter(Boolean);
  const music = entries.find(entry => entry.project.sourceId === 'music');
  if (music) {
    music.project.title = 'Music visuals';
    music.project.items = projects.get('music').media.slice(1);
  }
  return entries;
}
const reviews = reviewEntries();
const nextCursor = element('span', 'asset-next-cursor', 'next');
nextCursor.hidden = true;
nextCursor.setAttribute('aria-hidden', 'true');
document.body.append(nextCursor);
addEventListener('scroll', () => { nextCursor.hidden = true; }, {passive:true});
const reviewNotes = {
  'devil-return': {
    field: 'Events', delivered: '3 formats: posters, mailed tickets, film',
    opening: 'An exclusive event begins with the invitation.',
    approach: 'A mailed invitation and ticket establish a personal connection before guests arrive. The same visual identity carries into the posters and film, making each encounter recognisably part of the event.'
  },
  pcell: {
    field: 'Typography and interaction', delivered: '1 typeface, 1 hand-responsive experience',
    opening: 'A typeface becomes a world you can touch.',
    approach: 'Benzene-ring ambigrams give the letterforms their structure. That structure extends into a field of points that responds to hand gestures, letting the audience reshape the visual language.'
  },
  echoes: {
    field: 'Everyday objects', delivered: '1 publication, 1 mobile website',
    opening: 'A second look at what lies underfoot.',
    approach: 'The patterns on New York manhole covers become the starting point. Their connection with Fulu talismans gives the publication and mobile website a shared visual language, inviting readers to look again at a familiar object.'
  },
  'lost-horizon': {
    field: 'Storytelling', delivered: '1 printed dossier, 1 interactive digital archive',
    opening: 'A story discovered through its evidence.',
    approach: 'The dossier gives readers something to examine. Clues on the page unlock the digital archive, so moving between physical evidence and the screen becomes part of piecing the story together.'
  },
  gala: {
    field: 'Music visuals', delivered: '1 live visual performance for 1 track',
    opening: 'The performance follows the track in real time.',
    approach: 'Visuals for XG’s GALA were operated by hand at Volvox Labs. Real-time control lets changes on screen follow the track as it unfolds.'
  },
  'the-one': {
    field: 'Installation', delivered: '1 responsive installation, 1 publication',
    opening: 'The audience changes what happens in the room.',
    approach: 'Participants shape the installation’s sound and light. A companion book translates the experience into images, ink and transcripts, carrying it into a form that can be revisited.'
  },
  music: {
    field: 'Music visuals', delivered: '8 visual works for 8 tracks',
    opening: 'Each track sets its own pace.',
    approach: 'Visual sequences for tracks by BLASÉ, CRO, Sophie Powers and others take their timing from the music. Rhythm, tension and atmosphere guide the movement and cuts.'
  }
};
let routeKey = '';
const positions = new Map();
history.scrollRestoration = 'manual';

function courseLabels(dishes, key) {
  const ordered = element('p', 'review-meta-line', 'Ordered ');
  const courseNames = element('div', 'ordered-course-names');
  dishes.forEach((dish, index) => {
    if (index) ordered.append(document.createTextNode(', '));
    const number = element('button', 'ordered-number', dish.number);
    number.type = 'button';
    number.insertAdjacentHTML('beforeend', '<svg class="hand-mark" viewBox="0 0 120 42" aria-hidden="true"><path d="M4 9 C24 13 70 10 99 6 C109 4 114 8 108 12 C94 20 72 20 67 27 C63 31 62 35 64 39" pathLength="1"/></svg>');
    number.setAttribute('aria-expanded', 'false');
    number.setAttribute('aria-controls', 'ordered-' + key + '-' + dish.id);
    const name = element('p', 'ordered-course-name', dish.name);
    name.id = 'ordered-' + key + '-' + dish.id;
    name.hidden = true;
    number.addEventListener('click', () => {
    const open = number.getAttribute('aria-expanded') !== 'true';
    number.setAttribute('aria-expanded', String(open));
    name.hidden = !open;
    if (open && !reducedMotion.matches) name.animate([{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],{duration:900,easing:'ease-out'});
    });
    ordered.append(number);
    courseNames.append(name);
  });
  return { ordered, courseNames };
}

function renderReviews() {
  const view = $('reviews-view');
  if (view.dataset.loaded) return;
  const overall = element('header', 'opening reviews-overall');
  const openingCopy = element('div', 'measure');
  openingCopy.append(element('h1', '', 'Reviews'), element('p', '', 'A look at what came out of the kitchen. Each project brings together its own selection from the menu.'));
  overall.append(openingCopy);
  view.append(overall);
  const rail = element('div', 'reviews-rail');
  const track = element('div', 'reviews-track');
  const viewport = element('div', 'reviews-viewport');
  viewport.append(track);
  rail.append(viewport);
  view.append(rail);
  for (const { dishes, project } of reviews) {
    const entry = element('article', 'review-entry');
    entry.id = 'review-' + project.sourceId;
    const notes = reviewNotes[project.sourceId];
    const copy = element('div', 'review-copy');
    const title = element('h2', 'review-project-title', project.title);
    const { ordered, courseNames } = courseLabels(dishes, project.sourceId);
    copy.append(ordered, courseNames, element('p', 'review-field', notes.field));
    copy.append(element('p', 'review-deliveries', notes.delivered));
    const analysis = element('div', 'review-analysis');
    analysis.append(element('p', 'review-opening-note', notes.opening), element('p', '', notes.approach));
    copy.append(analysis);
    const media = element('div', 'review-images');
    const items = project.items;
    const assetLabel = project.sourceId === 'music' ? element('p', 'review-asset-caption') : null;
    if (assetLabel) copy.prepend(assetLabel);
    const slides = items.map(item => makeMedia(item, project, items.length > 1 ? project.title + ': ' + item.label.replace(/simulation/gi, 'experience') : project.title));
    let selected = 0;
    const show = () => {
      if (assetLabel) assetLabel.textContent = items[selected].label;
      slides.forEach((slide, index) => {
        const active = index === selected;
        slide.classList.toggle('is-active', active);
        slide.inert = !active;
        slide.setAttribute('aria-hidden', String(!active));
      });
    };
    const select = index => {
      slides[selected].querySelector('video')?.pause();
      selected = index;
      show();
    };
    slides.forEach((slide, index) => {
      if (slides.length > 1) {
        const surface = slide.querySelector('img, video');
        if (surface) {
          surface.classList.add('next-asset-surface');
          surface.tabIndex = 0;
          surface.setAttribute('role', 'button');
          surface.setAttribute('aria-label', 'Next asset for ' + project.title);
          surface.addEventListener('click', () => select((selected + 1) % slides.length));
          surface.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select((selected + 1) % slides.length); }
          });

        }
      }
      media.append(slide);
    });
    media.addEventListener('pointermove', event => {
      nextCursor.hidden = event.pointerType !== 'mouse' || !event.target.closest('.next-asset-surface');
      nextCursor.style.left = event.clientX + 'px';
      nextCursor.style.top = event.clientY + 'px';
    });
    media.addEventListener('pointerleave', () => { nextCursor.hidden = true; });
    show();
    const courseHeader = element('div', 'review-course-heading');
    for (const dish of dishes) {
      const heading = element('div', 'review-course-label');
      heading.append(element('span', 'course-code', dish.number), element('span', 'course-title', dish.name));
      courseHeader.append(heading);
    }
    copy.prepend(title);
    entry.append(courseHeader, media, copy);
    if (reviewLayout === 'c') textObserver?.observe(copy);
    track.append(entry);

  }
  if (reviewLayout === 'b') mountReviewGroups(view, overall, rail, track);
  const close = element('a', 'text-link reviews-end', 'Back to menu');
  close.href = '#menu';
  view.append(close);
  view.dataset.loaded = 'true';
}

let reviewGroups = null;
function mountReviewGroups(view, overall, rail, track) {
  const originalPanels = new Map(reviews.map(entry => [entry.project.sourceId, $('review-' + entry.project.sourceId)]));
  const index = element('nav', 'review-group-index');
  index.setAttribute('aria-label', 'Review index');
  index.append(element('h2', '', 'On the table'));
  const choices = new Map();
  const music = reviews.find(entry => entry.project.sourceId === 'music');
  const musicCards = music.project.items.map((item, i) => {
    const panel = element('article', 'review-entry');
    panel.id = 'review-music-track-' + i;
    const title = element('h2', 'review-project-title', item.label);
    const media = element('div', 'review-images');
    const figure = makeMedia(item, music.project, item.label);
    figure.classList.add('is-active');
    media.append(figure);
    const copy = element('div', 'review-copy');
    const { ordered, courseNames } = courseLabels(music.dishes, 'music-track-' + i);
    const analysis = element('div', 'review-analysis');
    analysis.append(element('p', 'review-opening-note', reviewNotes.music.opening), element('p', '', reviewNotes.music.approach));
    copy.append(title, ordered, courseNames, element('p', 'review-deliveries', '1 visual work for 1 track'), analysis);
    panel.append(media, copy);
    return panel;
  });
  const back = element('button', 'text-link group-back', 'Back to index');
  back.type = 'button';
  back.hidden = true;
  const courseHeading = element('div', 'active-course-heading');
  courseHeading.hidden = true;
  rail.hidden = true;
  const showIndex = () => {
    document.querySelectorAll('video').forEach(video => video.pause());
    overall.hidden = false;
    index.hidden = false;
    rail.hidden = true;
    back.hidden = true;
    courseHeading.hidden = true;
    reviewGroups.active = false;
    window.scrollTo({top:index.getBoundingClientRect().top + scrollY, behavior:'instant'});
    choices.get(reviewGroups.current)?.focus({preventScroll:true});
  };
  back.addEventListener('click', showIndex);
  const open = (entry, requestedCourse) => {
    const course = entry.dishes.some(dish => dish.number === requestedCourse) ? requestedCourse : entry.dishes[entry.dishes.length - 1].number;
    const group = reviews.filter(candidate => candidate.dishes.some(dish => dish.number === course));
    const start = group.indexOf(entry);
    const sequence = [...group.slice(start), ...group.slice(0, start)];
    const panels = sequence.flatMap(candidate => candidate.project.sourceId === 'music' ? musicCards : [originalPanels.get(candidate.project.sourceId)]);
    document.querySelectorAll('video').forEach(video => video.pause());
    track.replaceChildren(...panels);
    panels.forEach(panel => {
      panel.addEventListener('focusin', () => {
        if (reviewGroups.active) window.scrollTo({top:rail.getBoundingClientRect().top + scrollY + panel.offsetLeft, behavior:'instant'});
      }, {once:true});
    });
    overall.hidden = true;
    index.hidden = true;
    rail.hidden = false;
    back.hidden = false;
    reviewGroups.active = true;
    reviewGroups.current = course;
    const dish = menu.find(dish => dish.number === course);
    courseHeading.replaceChildren(element('span', 'course-code', course), element('span', 'course-title', dish.name));
    courseHeading.hidden = false;
    track.style.transform = 'translateX(0px)';
    updateReviewScale();
    window.scrollTo({top:0, behavior:'instant'});
    if (!reducedMotion.matches) rail.animate([{opacity:0,transform:'translateX(15vw)'},{opacity:1,transform:'translateX(0)'}],{duration:700,easing:'cubic-bezier(.22,.61,.36,1)'});
  };
  menu.filter(dish => dish.projects.length).forEach(dish => {
    const row = element('div', 'review-group-choice');
    const choice = element('button', 'review-group-project');
    choice.type = 'button';
    choice.append(element('span', 'index-course-code', dish.number), element('span', '', dish.name));
    choice.addEventListener('click', () => {
      const entry = dish.number === 'IV' ? music : reviews.find(candidate => candidate.dishes.some(course => course.number === dish.number));
      open(entry, dish.number);
    });
    choices.set(dish.number, choice);
    row.append(choice);
    index.append(row);
  });
  view.insertBefore(index, rail);
  view.append(back, courseHeading);
  reviewGroups = { open, active:false, current:null };
}

// A panel grows towards the viewport centre and recedes as it passes it.
// Its centre is unchanged by a centre-origin transform, avoiding layout feedback.
function updateReviewScale() {
  if ($('reviews-view').hidden) return;
  if (reviewLayout === 'b') {
    if (!reviewGroups?.active) return;
    const rail = document.querySelector('.reviews-rail');
    const track = document.querySelector('.reviews-track');
    if (!rail || !track) return;
    const travel = Math.max(0, track.scrollWidth - rail.clientWidth);
    rail.style.height = (innerHeight + travel) + 'px';
    const progress = Math.min(travel, Math.max(0, -rail.getBoundingClientRect().top));
    track.style.transform = 'translateX(' + -progress + 'px)';
    track.querySelectorAll('.review-entry').forEach(panel => {
      const proximity = Math.max(0, 1 - Math.abs(panel.offsetLeft - progress) / innerWidth);
      const media = panel.querySelector('.review-images');
      const copy = panel.querySelector('.review-copy');
      media.style.transform = 'scale(' + (reducedMotion.matches ? 1 : .95 + .15 * proximity).toFixed(5) + ')';
      copy.style.filter = reducedMotion.matches ? 'none' : 'blur(' + (4 * (1 - proximity)).toFixed(2) + 'px)';
      copy.style.opacity = reducedMotion.matches ? '1' : String(.35 + .65 * proximity);
    });
    return;
  }
  document.querySelectorAll('.review-entry').forEach(entry => {
    const bounds = entry.getBoundingClientRect();
    const distance = Math.abs(bounds.top + bounds.height / 2 - innerHeight / 2);
    const proximity = Math.max(0, 1 - distance / (innerHeight * .7));
    const scale = reducedMotion.matches ? 1 : .95 + .15 * proximity;
    entry.style.transform = 'scale(' + scale.toFixed(5) + ')';
  });
}
addEventListener('resize', () => requestAnimationFrame(updateReviewScale));
reducedMotion.addEventListener('change', () => requestAnimationFrame(updateReviewScale));

// A fixed scatter keeps the wall composed and prevents images jumping on refresh.
const galleryWall = [
  ['book+booklet_edited.png', 'Book and booklet', 7, 0, 34],
  ['3.png', 'Graphic study', 70, 12, 13],
  ['IMG_8250 2.png', 'Studio photograph', 46, 48, 24],
  ['Image_20251119_0005.jpg', 'Printed study', 9, 78, 16],
  ['theone.png', 'The One', 60, 101, 31],
  ['6.jpg', 'Printed Matter open call', 22, 133, 14],
  ['book5_edited.png', 'Book detail', 5, 169, 36],
  ['fromland_tolab.png', 'From land to lab', 70, 195, 20],
  ['ps1.jpg', 'Publication detail', 42, 225, 17],
  ['book5.png', 'Publication composition', 8, 264, 25]
];
function renderGallery() {
  const view = $('gallery-view');
  if (view.dataset.loaded) return;
  const wall = element('div', 'gallery-wall');
  galleryWall.forEach(([file, description, x, y, width]) => {
    const entry = element('figure', 'gallery-wall-piece');
    entry.style.setProperty('--x', x);
    entry.style.setProperty('--y', y);
    entry.style.setProperty('--width', width);
    const image = document.createElement('img');
    image.src = 'assets/gallery/' + encodeURIComponent(file);
    image.alt = description;
    image.loading = y < 70 ? 'eager' : 'lazy';
    image.decoding = 'async';
    entry.append(image);
    wall.append(entry);
  });
  view.append(wall);
  view.dataset.loaded = 'true';
}

// Keep the review and gallery implementations for a later release.
const pausedViews = new Set(['reviews', 'gallery']);
document.querySelectorAll('[data-view]').forEach(link => {
  if (!pausedViews.has(link.dataset.view)) return;
  link.removeAttribute('href');
  link.setAttribute('aria-disabled', 'true');
  link.setAttribute('role', 'link');
  link.tabIndex = -1;
  link.addEventListener('click', event => event.preventDefault());
});

function navigate() {
  if (routeKey) positions.set(routeKey, window.scrollY);
  document.querySelectorAll('video').forEach(video => video.pause());
  const parts = location.hash.slice(1).split('/');
  const name = !pausedViews.has(parts[0]) && ['reviews', 'about', 'gallery'].includes(parts[0]) ? parts[0] : 'menu';
  const nextKey = name === 'reviews' ? parts.join('/') : name;
  for (const view of ['menu', 'reviews', 'about', 'gallery']) $(view + '-view').hidden = view !== name;
  document.querySelectorAll('[data-view]').forEach(link => {
    if (link.dataset.view === name) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (name === 'reviews') {
    renderReviews();
  }
  if (name === 'gallery') renderGallery();
  const legacy = parts[0] === 'temporary-support' || parts[0] === 'design-partner' ? 'regular' : parts[0];
  const targetDish = name === 'menu' && menu.some(dish => dish.id === legacy) ? $(legacy) : null;
  document.title = name[0].toUpperCase() + name.slice(1) + ' | N°3';
  routeKey = nextKey;
  const reviewTarget = name === 'reviews' && parts[2] ? reviews.find(entry => entry.project.id === parts[2] && entry.dishes.some(dish => dish.number === parts[1])) || reviews.find(entry => entry.project.id === parts[2]) : null;
  if (reviewTarget) {
    const entry = $('review-' + reviewTarget.project.sourceId);
    if (reviewLayout === 'b') {
      reviewGroups.open(reviewTarget, parts[1]);
    } else entry.scrollIntoView({ block: 'center', behavior: 'instant' });
  }
  else if (targetDish) targetDish.querySelector('.dish-body').scrollIntoView({ block: 'center', behavior: 'instant' });
  else window.scrollTo({ top: positions.get(nextKey) || 0, behavior: 'instant' });
  requestAnimationFrame(updateMenuIndex);
}
window.addEventListener('hashchange', navigate);
navigate();
