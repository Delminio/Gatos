const slides = document.getElementById('slides');
const slideEls = Array.from(document.querySelectorAll('.slide'));
const nextButtons = document.querySelectorAll('.next');
const prevButtons = document.querySelectorAll('.prev');
const restartButtons = document.querySelectorAll('.restart');
const threadTrail = document.getElementById('threadTrail');
const threadGlow = document.getElementById('threadGlow');
const threadHead = document.getElementById('threadHead');

let current = 0;
let animating = false;

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function getAnchorForSlide(index) {
  const total = slideEls.length - 1;
  const x = 7 + (86 * (index / total));
  const wave = [48, 24, 72, 30, 66, 36, 74, 32, 64, 48];
  const y = wave[index] ?? 50;
  return { x, y };
}

function buildPath(progressIndex) {
  const points = [];
  for (let i = 0; i <= progressIndex; i++) points.push(getAnchorForSlide(i));
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y} L ${p.x + 0.01} ${p.y + 0.01}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midX = (p1.x + p2.x) / 2;
    d += ` C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function setHeadPosition(index) {
  const p = getAnchorForSlide(index);
  threadHead.setAttribute('cx', p.x);
  threadHead.setAttribute('cy', p.y);
}

function updateSlideClasses() {
  slideEls.forEach((slide, idx) => slide.classList.toggle('is-active', idx === current));
}

function animateThread(fromIndex, toIndex, duration = 1100) {
  const direction = toIndex >= fromIndex ? 1 : -1;
  const start = performance.now();

  function frame(now) {
    const t = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const progress = fromIndex + (toIndex - fromIndex) * eased;
    const whole = direction === 1 ? Math.floor(progress) : Math.ceil(progress);
    const next = clamp(whole + direction, 0, slideEls.length - 1);
    const localT = Math.abs(progress - whole);

    const p1 = getAnchorForSlide(clamp(whole, 0, slideEls.length - 1));
    const p2 = getAnchorForSlide(next);
    const headX = p1.x + (p2.x - p1.x) * localT;
    const headY = p1.y + (p2.y - p1.y) * localT;

    const completeUntil = direction === 1 ? Math.floor(progress) : Math.ceil(progress);
    const basePathIndex = clamp(completeUntil, 0, slideEls.length - 1);
    let d = buildPath(basePathIndex);

    if (basePathIndex !== next) {
      const last = getAnchorForSlide(basePathIndex);
      const midX = (last.x + headX) / 2;
      d += ` C ${midX} ${last.y}, ${midX} ${headY}, ${headX} ${headY}`;
    }

    threadTrail.setAttribute('d', d);
    threadGlow.setAttribute('d', d);
    threadHead.setAttribute('cx', headX);
    threadHead.setAttribute('cy', headY);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      const finalPath = buildPath(toIndex);
      threadTrail.setAttribute('d', finalPath);
      threadGlow.setAttribute('d', finalPath);
      setHeadPosition(toIndex);
      animating = false;
    }
  }
  requestAnimationFrame(frame);
}

function goTo(index) {
  if (animating) return;
  const target = clamp(index, 0, slideEls.length - 1);
  if (target === current) return;
  const previous = current;
  current = target;
  animating = true;
  slides.style.transform = `translateX(-${current * 100}vw)`;
  updateSlideClasses();
  animateThread(previous, current);
}

nextButtons.forEach(btn => btn.addEventListener('click', () => goTo(current + 1)));
prevButtons.forEach(btn => btn.addEventListener('click', () => goTo(current - 1)));
restartButtons.forEach(btn => btn.addEventListener('click', () => goTo(0)));

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') goTo(current + 1);
  if (e.key === 'ArrowLeft') goTo(current - 1);
});

window.addEventListener('load', () => {
  updateSlideClasses();
  const path = buildPath(0);
  threadTrail.setAttribute('d', path);
  threadGlow.setAttribute('d', path);
  setHeadPosition(0);
});
