
const slides = document.querySelectorAll('.slide');
const container = document.getElementById('slides');
const nextButtons = document.querySelectorAll('.next');
const prevButtons = document.querySelectorAll('.prev');
const restartButtons = document.querySelectorAll('.restart');

const line = document.getElementById('line');
const needleGroup = document.getElementById('needleGroup');

let index = 0;
let moving = false;

function clamp(v,min,max){ return Math.min(Math.max(v,min),max); }

function pointFor(i){
  const total = slides.length - 1;
  const x = 8 + (84 * (i / total));
  const wave = [18, 32, 24, 40, 28, 50, 34, 58, 42, 66];
  return {x, y: wave[i] || 50};
}

function angle(a,b){
  return Math.atan2(b.y-a.y, b.x-a.x) * 180 / Math.PI;
}

function buildPath(until){
  const pts = [];
  for(let i=0;i<=until;i++) pts.push(pointFor(i));
  if(pts.length === 1){
    const p = pts[0];
    return `M ${p.x} ${p.y} L ${p.x+.01} ${p.y+.01}`;
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for(let i=0;i<pts.length-1;i++){
    const p1 = pts[i], p2 = pts[i+1];
    const mx = (p1.x + p2.x) / 2;
    d += ` C ${mx} ${p1.y}, ${mx} ${p2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function setNeedle(x,y,a){
  needleGroup.setAttribute('transform', `translate(${x} ${y}) rotate(${a})`);
}

function animateThread(from,to,duration=520){
  const dir = to >= from ? 1 : -1;
  const start = performance.now();

  function frame(now){
    const t = clamp((now-start)/duration,0,1);
    const e = 1 - Math.pow(1-t,3);
    const prog = from + (to-from)*e;
    const whole = dir===1 ? Math.floor(prog) : Math.ceil(prog);
    const nxt = clamp(whole+dir, 0, slides.length-1);
    const lt = Math.abs(prog-whole);

    const p1 = pointFor(clamp(whole,0,slides.length-1));
    const p2 = pointFor(nxt);

    const x = p1.x + (p2.x-p1.x)*lt;
    const y = p1.y + (p2.y-p1.y)*lt;

    const completed = dir===1 ? Math.floor(prog) : Math.ceil(prog);
    const base = clamp(completed,0,slides.length-1);
    let d = buildPath(base);

    if(base !== nxt){
      const last = pointFor(base);
      const mx = (last.x + x)/2;
      d += ` C ${mx} ${last.y}, ${mx} ${y}, ${x} ${y}`;
    }

    line.setAttribute('d', d);
    setNeedle(x,y,angle(p1,p2));

    if(t<1){
      requestAnimationFrame(frame);
    } else {
      line.setAttribute('d', buildPath(to));
      const prev = pointFor(Math.max(0,to-1));
      const end = pointFor(to);
      setNeedle(end.x,end.y,angle(prev,end));
      moving = false;
    }
  }
  requestAnimationFrame(frame);
}

function goTo(target){
  if(moving) return;
  target = clamp(target,0,slides.length-1);
  if(target === index) return;
  moving = true;
  const from = index;
  index = target;
  container.style.transform = `translateX(-${index*100}vw)`;
  animateThread(from,target);
}

nextButtons.forEach(btn => btn.addEventListener('click', ()=>goTo(index+1)));
prevButtons.forEach(btn => btn.addEventListener('click', ()=>goTo(index-1)));
restartButtons.forEach(btn => btn.addEventListener('click', ()=>goTo(0)));

document.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowRight') goTo(index+1);
  if(e.key === 'ArrowLeft') goTo(index-1);
});

line.setAttribute('d', buildPath(0));
const a = pointFor(0), b = pointFor(1);
setNeedle(a.x,a.y,angle(a,b));
