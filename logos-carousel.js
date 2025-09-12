// logos-carousel.js
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('logosCarousel');
  if (!container) return;

  const track = container.querySelector('.logos-track');
  const items = Array.from(track.querySelectorAll('.logos-item'));
  if (items.length === 0) return;

  // Config
  const SLIDE_INTERVAL = 5000; // 5s
  const TRANSITION_MS  = 500;  // debe coincidir con el CSS
  // visibles desde CSS var(--visible)
  const getVisible = () => {
    const v = getComputedStyle(container).getPropertyValue('--visible').trim();
    return Math.max(1, parseInt(v || '4', 10));
  };

  let visible = getVisible();

  // Clonar los primeros "visible" para efecto infinito
  const clones = items.slice(0, visible).map(n => n.cloneNode(true));
  clones.forEach(c => track.appendChild(c));

  let index = 0;
  let stepPx = 0;
  let timer = null;

  const measure = () => {
    // ancho del primer item (ya adaptado por --visible) + gap
    const first = track.querySelector('.logos-item');
    if (!first) return;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap || '0');
    const rect = first.getBoundingClientRect();
    stepPx = rect.width + gap;

    // reiniciar posición para evitar derivas tras resize
    track.style.transition = 'none';
    track.style.transform  = 'translateX(0px)';
    index = 0;
    // forzar reflow y devolver transición
    void track.offsetWidth;
    track.style.transition = `transform ${TRANSITION_MS}ms ease`;
  };

  const next = () => {
    index += 1;
    track.style.transform = `translateX(-${index * stepPx}px)`;
  };

  // Al terminar la transición, si estamos al final real, saltar sin transición
  track.addEventListener('transitionend', () => {
    // items.length = originales; al llegar a "items.length" estamos sobre el primer clon
    if (index >= items.length) {
      track.style.transition = 'none';
      index = 0;
      track.style.transform = 'translateX(0px)';
      void track.offsetWidth; // reflow
      track.style.transition = `transform ${TRANSITION_MS}ms ease`;
    }
  });

  const start = () => { if (!timer) timer = setInterval(next, SLIDE_INTERVAL); };
  const stop  = () => { clearInterval(timer); timer = null; };

  // Pausar al pasar el mouse
  container.addEventListener('mouseenter', stop);
  container.addEventListener('mouseleave', start);

  // Redimensionar: recalcular visible/medidas
  window.addEventListener('resize', () => {
    const newVisible = getVisible();
    if (newVisible !== visible) {
      // si cambió, recargar clones (simple: recargar la página del carrusel)
      // Para mantenerlo simple: recalculamos solo medidas.
      visible = newVisible;
    }
    measure();
  });

  // Init
  measure();
  start();
});
