const stories = [
  {
    id: 'fictional-worlds',
    direction: 'Make a fictional world feel real',
    title: 'How do you make a fictional world feel real?',
    description: 'A ticket or a dossier can make your world feel as if it existed before the audience arrived.',
    cases: ['devil-return', 'lost-horizon']
  },
  {
    id: 'visual-identity',
    direction: 'Give a brand a visual identity',
    title: 'What could make people take a second look at your brand?',
    description: 'Patterns on New York manhole covers and Fulu talismans became the visual identity of a book and mobile site.',
    cases: ['echoes']
  },
  {
    id: 'type-and-worlds',
    direction: 'Show a world through type',
    title: 'What could give people their first glimpse of your world?',
    description: 'Pcell’s letterforms disperse into a field of points that moves with your hands.',
    cases: ['pcell']
  },
  {
    id: 'music-visuals',
    direction: 'Give music a visual language',
    title: 'What should listeners see when they hear your music?',
    description: 'The track’s rhythm sets the cuts, its tension sets the pauses, and its atmosphere shapes the images.',
    cases: ['gala', 'deep-learning']
  },
  {
    id: 'audience-participation',
    direction: 'Make the audience part of the work',
    title: 'What could audiences do with the work you’ve already made?',
    description: 'An experience that responds to its audience can give people something to play with, capture or share.',
    cases: ['the-one', 'lost-horizon']
  }
];

const edits = {
  'devil-return': {
    media: [0, 2, 1],
    labels: ['Campaign ephemera', 'Printed campaign detail', 'Campaign poster'],
    description: 'Posters, a mailed ticket and a film give an imagined gathering for the returning comet one visual identity.'
  },
  'lost-horizon': {
    cover: 'assets/images--the_Lost_Horizon--010.jpg',
    media: [1, 0, 2, 3],
    labels: ['Printed dossier', 'Desktop simulation', 'Archive detail', 'Archive detail'],
    description: 'Clues hidden in a printed dossier unlock a desktop simulation.'
  },
  echoes: {
    cover: 'assets/echoes/publication-7.jpg',
    media: [0, 1, 3, 4]
  },
  pcell: {
    media: [1, 0, 2]
  },
  gala: {
    media: [0],
    description: 'Live visuals performed in real time to XG’s “GALA”.'
  },
  'deep-learning': {
    source: 'music',
    title: 'Deep Learning',
    description: 'A motion study set to “Deep Learning” by BLASÉ.',
    cover: '../services/deep-learning.jpg',
    media: [7],
    labels: ['Release visual study']
  },
  'the-one': {
    media: [0, 1, 2],
    description: 'An installation that responds to participants becomes a book of images, ink and transcripts.'
  }
};

const portfolio = new URL('../design/', document.baseURI);
const asset = path => new URL(path, portfolio).href;
const projects = new Map(window.PROJECTS.map(project => [project.id, project]));
const caseFor = id => {
  const edit = edits[id];
  const project = projects.get(edit.source || id);
  return {
    ...project,
    ...edit,
    portfolioId: project.id,
    media: edit.media.map((index, order) => ({
      ...project.media[index],
      label: edit.labels?.[order] || project.media[index].label
    }))
  };
};

const $ = id => document.getElementById(id);
const dialog = $('case-dialog');
const directionDialog = $('direction-dialog');
const directionOptions = $('direction-options');
const videoToggle = $('case-video-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const easing = 'cubic-bezier(.22, .68, .26, 1)';
const emailAddress = 'niojin.noi@gmail.com';
const emailLabel = $('email').textContent;
let currentCase;
let previousFocus;
let mediaIndex;
let closing = false;
let dialogAnimation;
let directionTrigger;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function animate(node, frames, options) {
  if (!reducedMotion.matches) return node.animate(frames, { easing, ...options });
}

function projectUrl(project) {
  return new URL('index.html?project=' + project.portfolioId, portfolio).href;
}

function makeExamplesTrigger(story) {
  const single = story.cases.length === 1;
  const button = element('button', 'text-link story-examples', single ? 'See a past project' : 'See past projects');
  button.type = 'button';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', single ? dialog.id : directionDialog.id);
  button.addEventListener('click', () => {
    if (single) {
      openCase(caseFor(story.cases[0]), button);
      return;
    }
    const entries = story.cases.map(id => {
      const project = caseFor(id);
      return indexLink(project.title, projectUrl(project), () => openCase(project, button));
    });
    openIndex('Past project examples', entries, button);
  });
  return button;
}

function makeDirectionTrigger(current) {
  const label = current ? current.direction + ' (change direction)' : 'Explore design services';
  const button = element('button', 'direction-trigger', label);
  button.type = 'button';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', directionDialog.id);
  button.addEventListener('click', () => openDirections(current, button));
  return button;
}

function openDirections(current, trigger) {
  const choices = stories.filter(story => story !== current).map(story => {
    return indexLink(story.direction, '#' + story.id, () => {
      const target = $(story.id);
      if (location.hash !== '#' + target.id) history.pushState(null, '', '#' + target.id);
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
    });
  });
  openIndex('Design services', choices, trigger);
}

function indexLink(label, href, activate) {
  const link = element('a', 'direction-option', label);
  link.href = href;
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    directionDialog.close();
    activate();
  });
  return link;
}

function openIndex(label, choices, trigger) {
  directionTrigger = trigger;
  directionDialog.setAttribute('aria-label', label);
  directionOptions.setAttribute('aria-label', label);
  directionOptions.classList.toggle('is-short', choices.length <= 2);
  directionOptions.replaceChildren(...choices);
  if (choices.length > 2) {
    const more = element('button', 'direction-option', 'More directions');
    more.type = 'button';
    more.addEventListener('click', () => {
      choices[1].focus({ preventScroll: true });
      choices[1].scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
    choices[0].after(more);
  }
  directionDialog.showModal();
  directionOptions.scrollTop = 0;
  animate(directionDialog.querySelector('.direction-sheet'), [
    { opacity: 0, transform: 'translateY(13px)' },
    { opacity: 1, transform: 'none' }
  ], { duration: 420 });
}

function closeDirections() {
  directionDialog.close();
  directionTrigger?.focus({ preventScroll: true });
}

$('direction-close').addEventListener('click', closeDirections);
directionDialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeDirections();
});

$('site-intro').append(makeDirectionTrigger());

stories.forEach(story => {
  const section = element('section', 'story');
  section.id = story.id;
  section.tabIndex = -1;
  const copy = element('header', 'story-copy measure');
  const title = element('h2', 'visually-hidden', story.title);
  title.id = story.id + '-title';
  section.setAttribute('aria-labelledby', title.id);
  copy.append(title, makeDirectionTrigger(story));
  section.append(copy, element('p', 'story-note measure', story.description), makeExamplesTrigger(story));
  $('stories').append(section);
});

const linkedStory = $(location.hash.slice(1));
if (linkedStory?.classList.contains('story')) linkedStory.scrollIntoView({ behavior: 'instant' });

function openCase(project, trigger) {
  currentCase = project;
  previousFocus = trigger;
  const title = $('case-full');
  title.textContent = project.title;
  title.setAttribute('aria-label', 'See the full project: ' + project.title);
  title.href = projectUrl(project);
  $('case-note-toggle').hidden = false;
  $('case-note-toggle').setAttribute('aria-expanded', 'false');
  $('case-text').hidden = true;
  $('case-controls').hidden = project.media.length < 2;
  showMedia(0, 0);
  dialog.showModal();
  dialog.scrollTop = 0;
  dialogAnimation = animate(dialog, [
    { opacity: 0, transform: 'translateY(16px)' },
    { opacity: 1, transform: 'none' }
  ], { duration: 780 });
  animate(dialog.querySelector('.case-copy'), [
    { opacity: 0, transform: 'translateY(17px)' },
    { opacity: 1, transform: 'none' }
  ], { duration: 610, delay: 180, fill: 'backwards' });
}

function revealCaseNote(moveFocus) {
  const note = $('case-text');
  const disclosure = $('case-note-toggle');
  disclosure.setAttribute('aria-expanded', 'true');
  note.hidden = false;
  if (moveFocus) note.focus({ preventScroll: true });
  disclosure.hidden = true;
  animate(note, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 380 });
}

$('case-note-toggle').addEventListener('click', () => revealCaseNote(true));

function showMedia(index, delta) {
  mediaIndex = index;
  const item = currentCase.media[index];
  const container = $('case-media');
  const isVideo = item.type === 'video';
  const media = element(isVideo ? 'video' : 'img');
  const description = $('case-text');
  description.textContent = currentCase.description;
  videoToggle.hidden = !isVideo;
  videoToggle.textContent = 'Play video';
  $('case-return').hidden = isVideo && currentCase.media.length > 1;
  if (isVideo) {
    media.preload = 'none';
    media.playsInline = true;
    media.poster = asset(item.poster || currentCase.cover);
    media.setAttribute('aria-label', item.label);
    const updateVideoLabel = () => {
      if (media === container.lastElementChild) videoToggle.textContent = media.paused ? 'Play video' : 'Pause video';
    };
    ['play', 'pause', 'ended'].forEach(event => media.addEventListener(event, updateVideoLabel));
  } else {
    media.alt = currentCase.title + ': ' + item.label;
  }
  media.addEventListener('error', () => {
    if (media !== container.lastElementChild) return;
    const message = isVideo ? 'Video unavailable' : 'Image unavailable';
    description.textContent = message + '.';
    if (description.hidden) revealCaseNote(document.activeElement === $('case-note-toggle'));
    $('media-label').textContent = item.label + ': ' + message;
    videoToggle.hidden = true;
    $('case-return').hidden = false;
    media.remove();
  }, { once: true });
  media.src = asset(item.src);
  const outgoing = container.lastElementChild;
  container.querySelectorAll('[inert]').forEach(node => node.remove());
  outgoing?.matches('video') && outgoing.pause();
  if (!delta || !outgoing || reducedMotion.matches || outgoing.matches('video')) {
    outgoing?.remove();
  } else {
    outgoing.inert = true;
    const departure = animate(outgoing, [
      { opacity: 1, transform: 'none' },
      { opacity: 0, transform: 'translateX(' + (-delta * 13) + 'px)' }
    ], { duration: 340, fill: 'both' });
    departure.finished.then(() => outgoing.remove(), () => outgoing.remove());
  }
  container.append(media);
  $('media-label').textContent = item.label;
  if (delta) animate(media, [
    { opacity: 0, transform: 'translateY(' + (delta * 22) + 'px) scale(1.015)' },
    { opacity: 1, transform: 'none' }
  ], { duration: 630 });
}

videoToggle.addEventListener('click', async () => {
  const video = $('case-media').querySelector('video');
  if (!video) return;
  if (!video.paused) {
    video.pause();
    return;
  }
  try {
    await video.play();
  } catch (error) {
    if (video.isConnected && error.name !== 'AbortError') videoToggle.textContent = 'Retry video playback';
  }
});

videoToggle.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  const video = $('case-media').querySelector('video');
  if (!video || !Number.isFinite(video.duration)) return;
  event.preventDefault();
  const delta = event.key === 'ArrowLeft' ? -5 : 5;
  video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + delta));
});

function stepMedia(delta) {
  if (closing) return;
  const count = currentCase.media.length;
  showMedia((mediaIndex + delta + count) % count, delta);
}
$('case-prev').addEventListener('click', () => stepMedia(-1));
$('case-next').addEventListener('click', () => stepMedia(1));

let swipeStart;
$('case-media').addEventListener('pointerdown', event => {
  if (event.pointerType !== 'touch' || !event.isPrimary || !event.target.matches('img')) return;
  swipeStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
});
$('case-media').addEventListener('pointercancel', () => { swipeStart = null; });
$('case-media').addEventListener('pointerup', event => {
  if (swipeStart?.id !== event.pointerId) return;
  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) stepMedia(dx < 0 ? 1 : -1);
});

async function closeCase() {
  if (closing) return;
  closing = true;
  $('case-media').querySelector('video')?.pause();
  const opacity = getComputedStyle(dialog).opacity;
  dialogAnimation?.cancel();
  const exit = animate(dialog, [
    { opacity, transform: 'none' },
    { opacity: 0, transform: 'translateY(16px)' }
  ], { duration: 365, fill: 'forwards' });
  if (exit) await exit.finished;
  dialog.close();
  exit?.cancel();
  $('case-media').replaceChildren();
  closing = false;
  previousFocus?.focus({ preventScroll: true });
}

dialog.querySelectorAll('[data-close-case]').forEach(button => button.addEventListener('click', closeCase));
dialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeCase();
});
$('copy-email').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(emailAddress);
    $('copy-status').textContent = 'Email address copied.';
    $('copy-email').textContent = 'Address copied';
    $('email').textContent = emailLabel;
  } catch {
    $('copy-status').textContent = 'Couldn’t copy. Select the email address to copy it.';
    $('copy-email').textContent = 'Retry copy';
    $('email').textContent = emailAddress;
  }
  animate($('copy-email'), [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 280 });
});

