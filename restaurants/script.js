const form = document.querySelector('#service-contact');

if (form) {
  const params = new URLSearchParams(window.location.search);
  const selectedBusiness = params.get('business') || params.get('restaurant');
  if (selectedBusiness) form.elements.business.value = selectedBusiness;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const business = data.get('business').trim();
    const subject = encodeURIComponent(`Website conversation — ${business}`);
    const body = encodeURIComponent([
      `Name: ${data.get('name').trim()}`,
      `Business or project: ${business}`,
      `Preferred contact: ${data.get('contact').trim()}`,
      '',
      data.get('message').trim()
    ].join('\n'));
    document.querySelector('#form-note').textContent = 'Your email is ready to send in your mail app.';
    window.location.href = `mailto:niojin.noi@gmail.com?subject=${subject}&body=${body}`;
  });
}

const serviceTracks = document.querySelectorAll('.service-track');

function openServiceTrack(track) {
  serviceTracks.forEach((item) => {
    const isOpen = item === track;
    item.classList.toggle('is-open', isOpen);
    const toggle = item.querySelector('.track-toggle');
    const mark = item.querySelector('.track-mark');
    toggle?.setAttribute('aria-expanded', String(isOpen));
    if (mark) mark.textContent = isOpen ? '−' : '+';
  });
}

serviceTracks.forEach((track) => {
  const toggle = track.querySelector('.track-toggle');
  toggle?.addEventListener('click', () => openServiceTrack(track));

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    track.addEventListener('mouseenter', () => openServiceTrack(track));
  }
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const parallaxImages = document.querySelectorAll('[data-parallax-image], [data-parallax-video]');
const ambientVideos = document.querySelectorAll('video[autoplay]');
const parallaxCopy = document.querySelector('[data-parallax]');
let parallaxFrame;

function updateParallax() {
  parallaxFrame = undefined;
  if (reduceMotion.matches) return;

  const viewportCenter = window.innerHeight / 2;
  parallaxImages.forEach((image) => {
    const frame = image.closest('.parallax-frame');
    const rect = frame.getBoundingClientRect();
    const distance = (rect.top + rect.height / 2 - viewportCenter) / window.innerHeight;
    const offset = Math.max(-46, Math.min(46, distance * -34));
    image.style.setProperty('--image-y', `${offset}px`);
  });

  if (parallaxCopy) {
    const speed = Number(parallaxCopy.dataset.parallax);
    const offset = Math.max(-28, window.scrollY * speed);
    parallaxCopy.style.setProperty('--parallax-y', `${offset}px`);
  }
}

function requestParallax() {
  if (!parallaxFrame) parallaxFrame = requestAnimationFrame(updateParallax);
}

if (parallaxImages.length) {
  updateParallax();
  addEventListener('scroll', requestParallax, { passive: true });
  addEventListener('resize', requestParallax);
  reduceMotion.addEventListener?.('change', requestParallax);
}

function respectMotionPreference() {
  ambientVideos.forEach((video) => {
    if (reduceMotion.matches) video.pause();
    else video.play().catch(() => {});
  });
}

if (ambientVideos.length) {
  respectMotionPreference();
  reduceMotion.addEventListener?.('change', respectMotionPreference);
}

const revealElements = document.querySelectorAll('.scroll-reveal');

if (revealElements.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
  document.body.classList.add('reveal-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
}
