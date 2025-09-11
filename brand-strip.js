// brand-strip.js — Mini carrusel infinito para tira de logos
// Funciona con tu estructura actual en maquila.html
// Busca primero [data-brand-strip]; si no existe, usa la sección "logos-title"

document.addEventListener('DOMContentLoaded', () => {
  // 1) Localizar el "track" (contenedor que se moverá)
  let track =
    document.querySelector('[data-brand-strip]') ||
    document.querySelector('[aria-labelledby="logos-title"] .image-background > div');

  if (!track) {
    console.warn('[brand-strip] No se encontró el contenedor de logos.');
    return;
  }

  // 2) Contenedor visible (para overflow: hidden y eventos)
  const container = track.closest('.image-background') || track.parentElement;
  if (!container) {
    console.warn('[brand-strip] No se encontró un contenedor padre.');
    return;
  }

  // 3) Opciones
  const BASE_SPEED_DESKTOP = 0.6; // px por frame aprox (~60fps)
  const BASE_SPEED_MOBILE  = 0.4;
  const speedBase = window.innerWidth <= 768 ? BASE_SPEED_MOBILE : BASE_SPEED_DESKTOP;

  // 4) Estilos mínimos forzados (no cambian tu look & feel)
  container.style.overflow = 'hidden';
  container.style.position = container.style.position || 'relative';
  track.style.display = 'flex';
  track.style.gap = track.style.gap || '24px';
  track.style.willChange = 'transform';
  track.style.transform = 'translateX(0)';
  track.style.userSelect = 'none';
  // Anula cualquier overflow:auto heredado
  track.style.overflow = 'visible';

  // 5) Calcular ancho original y clonar
  let originalChildren = Array.from(track.children);
  if (originalChildren.length === 0) return;

  // Guardamos un "snapshot" del estado original para poder reconstruir
  const originalHTML = track.innerHTML;
  let originalWidth = 0;
  let resetWidth = 0;
  let pos = 0;
  let rafId = null;
  let paused = false;
  let speed = speedBase;

  const computeOriginalWidth = () => {
    // Medimos con el DOM ya renderizado
    // Nota: scrollWidth aquí es del track completo actual (sin clones)
    originalWidth = track.scrollWidth;
    resetWidth = originalWidth;
  };

  const buildClones = () => {
    // Añadimos clones hasta que el ancho total sea al menos 2x el ancho del contenedor
    const containerWidth = container.clientWidth;
    let totalWidth = track.scrollWidth;

    // Seguridad: no clones infinitamente
    let cycles = 0;
    while (totalWidth < containerWidth * 2 && cycles < 5) {
      track.innerHTML += originalHTML; // duplicamos bloque original
      totalWidth = track.scrollWidth;
      cycles++;
    }
  };

  const teardown = () => {
    cancelAnimationFrame(rafId);
    // Restaurar HTML original
    track.innerHTML = originalHTML;
    pos = 0;
    track.style.transform = 'translateX(0)';
  };

  const animate = () => {
    if (!paused) {
      pos -= speed;
      // Cuando hemos desplazado más que el ancho original, “saltamos” sin corte
      if (-pos >= resetWidth) {
        pos += resetWidth;
      }
      track.style.transform = `translateX(${pos}px)`;
    }
    rafId = requestAnimationFrame(animate);
  };

  const handleVisibility = () => {
    paused = document.hidden;
  };

  const handleHover = (p) => {
    paused = p;
  };

  const handleResize = () => {
    // Recalcula velocidad y reconstruye (por si cambian tamaños)
    speed = window.innerWidth <= 768 ? BASE_SPEED_MOBILE : BASE_SPEED_DESKTOP;
    teardown();
    computeOriginalWidth();
    buildClones();
    // Reiniciar animación
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animate);
  };

  // 6) Inicialización
  computeOriginalWidth();
  buildClones();
  rafId = requestAnimationFrame(animate);

  // 7) Pausas y eventos
  container.addEventListener('mouseenter', () => handleHover(true));
  container.addEventListener('mouseleave', () => handleHover(false));
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('resize', debounce(handleResize, 200), { passive: true });

  // 8) Respeta “prefers-reduced-motion”
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    speed = 0; // congelado si el usuario lo prefiere
  }

  // Utilidad: debounce
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Exponer una API mínima (opcional)
  window.FullVidaBrands = {
    pause: () => (paused = true),
    play: () => (paused = false),
    setSpeed: (pxPerFrame) => (speed = pxPerFrame || speedBase),
    rebuild: handleResize,
  };
});
s