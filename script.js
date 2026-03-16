
const pages = Array.from(document.querySelectorAll('.page'));
const nextButtons = document.querySelectorAll('.next');
const prevButtons = document.querySelectorAll('.prev');
const restartButtons = document.querySelectorAll('.restart');
const pathEl = document.getElementById('threadPath');
const needleGroup = document.getElementById('needleGroup');

let current = 0;
let animating = false;

function clamp(n, min, max){ return Math.min(Math.max(n, min), max); }

function getAnchor(index){
  const total = pages.length - 1;
  const x = 8 + (84 * (index / total));
  const wave = [50, 26, 70, 32, 64, 38, 72, 34, 60, 48];
  return { x, y: wave[index] ?? 50 };
}

function buildPath(toIndex){
  const pts = [];
  for(let i=0; i<=toIndex; i++) pts.push(getAnchor(i));
  if(pts.length === 1){
    const p = pts[0];
    return `M ${p.x} ${p.y} L ${p.x+0.01} ${p.y+0.01}`;
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for(let i=0; i<pts.length-1; i++){
    const p1 = pts[i], p2 = pts[i+1];
    const midX = (p1.x + p2.x) / 2;
    d += ` C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function getNeedleAngle(a, b){
  return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}

function setNeedle(x, y, angle){
  needleGroup.setAttribute('transform', `translate(${x} ${y}) rotate(${angle})`);
}

function refreshActive(){
  pages.forEach((p, idx) => p.classList.toggle('active', idx === current));
}

function animateThread(fromIndex, toIndex, duration=1350){
  const direction = toIndex >= fromIndex ? 1 : -1;
  const start = performance.now();

  function frame(now){
    const t = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);

    const progress = fromIndex + (toIndex - fromIndex) * eased;
    const whole = direction === 1 ? Math.floor(progress) : Math.ceil(progress);
    const next = clamp(whole + direction, 0, pages.length - 1);
    const localT = Math.abs(progress - whole);

    const p1 = getAnchor(clamp(whole, 0, pages.length - 1));
    const p2 = getAnchor(next);

    const x = p1.x + (p2.x - p1.x) * localT;
    const y = p1.y + (p2.y - p1.y) * localT;
    const angle = getNeedleAngle(p1, p2);

    const completeIndex = direction === 1 ? Math.floor(progress) : Math.ceil(progress);
    const baseIndex = clamp(completeIndex, 0, pages.length - 1);
    let d = buildPath(baseIndex);

    if(baseIndex !== next){
      const last = getAnchor(baseIndex);
      const midX = (last.x + x) / 2;
      d += ` C ${midX} ${last.y}, ${midX} ${y}, ${x} ${y}`;
    }

    pathEl.setAttribute('d', d);
    setNeedle(x, y, angle);

    if(t < 1){
      requestAnimationFrame(frame);
    } else {
      pathEl.setAttribute('d', buildPath(toIndex));
      const end = getAnchor(toIndex);
      const prev = getAnchor(Math.max(0, toIndex - 1));
      setNeedle(end.x, end.y, getNeedleAngle(prev, end));
      animating = false;
    }
  }
  requestAnimationFrame(frame);
}

function clearTurnClasses(){
  pages.forEach(p => p.classList.remove('leaving-left','leaving-right','entering-left','entering-right','turn-complete'));
}

function goTo(target){
  if(animating) return;
  target = clamp(target, 0, pages.length - 1);
  if(target === current) return;

  animating = true;
  const previous = current;
  const leaving = pages[previous];
  const entering = pages[target];
  const forward = target > previous;

  clearTurnClasses();
  leaving.classList.add(forward ? 'leaving-left' : 'leaving-right');
  entering.classList.add(forward ? 'entering-right' : 'entering-left');
  entering.classList.add('active');

  setTimeout(() => {
    leaving.classList.add('turn-complete');
    current = target;
    refreshActive();
    clearTurnClasses();
  }, 900);

  animateThread(previous, target, 1350);
}

nextButtons.forEach(btn => btn.addEventListener('click', () => goTo(current + 1)));
prevButtons.forEach(btn => btn.addEventListener('click', () => goTo(current - 1)));
restartButtons.forEach(btn => btn.addEventListener('click', () => goTo(0)));

window.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowRight') goTo(current + 1);
  if(e.key === 'ArrowLeft') goTo(current - 1);
});

window.addEventListener('load', () => {
  refreshActive();
  pathEl.setAttribute('d', buildPath(0));
  const a = getAnchor(0), b = getAnchor(1);
  setNeedle(a.x, a.y, getNeedleAngle(a, b));
});
