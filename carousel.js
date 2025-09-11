document.addEventListener('DOMContentLoaded', function () {
  // ==========================================================================
  // Configuración del carrusel
  // ==========================================================================
  const SLIDE_INTERVAL = 6000; // 6s
  const TRANSITION_DURATION = 500; // ms

  // Selección de elementos del DOM
  const track = document.querySelector('.carousel-track');
  const dotsNav = document.querySelector('.carousel-nav');

  // Verificar elementos requeridos
  if (!track || !dotsNav) {
    console.warn('Carrusel: elementos necesarios no encontrados');
    return;
  }

  const slides = Array.from(track.children);
  const dots = Array.from(dotsNav.children);

  if (slides.length === 0 || dots.length === 0) {
    console.warn('Carrusel: no hay slides o indicadores disponibles');
    return;
  }

  // ==========================================================================
  // Estado
  // ==========================================================================
  let currentIndex = 0;
  let autoPlayInterval = null;
  let isTransitioning = false;
  let isPaused = false;

  // ==========================================================================
  // Helpers de estado/ARIA
  // ==========================================================================
  const setSlideAria = (index, isActive) => {
    const slide = slides[index];
    if (!slide) return;
    slide.classList.toggle('current-slide', isActive);
    slide.setAttribute('aria-hidden', (!isActive).toString());
  };

  const setDotAria = (index, isActive) => {
    const dot = dots[index];
    if (!dot) return;
    dot.classList.toggle('current-slide', isActive);
    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
  };

  // === FIX indicadores: asegura que solo uno quede activo ===
  const syncIndicators = () => {
    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('current-slide', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  // ==========================================================================
  // Movimiento
  // ==========================================================================
  /**
   * Mueve el carrusel a un slide específico
   * @param {number} newIndex - Índice del slide de destino
   */
  const moveToSlide = (newIndex) => {
    // Validar índice y estado
    if (
      newIndex < 0 ||
      newIndex >= slides.length ||
      newIndex === currentIndex ||
      isTransitioning
    ) {
      return;
    }

    isTransitioning = true;

    // 1) Guardar índice anterior
    const prevIndex = currentIndex;

    // 2) Desactivar anterior
    setSlideAria(prevIndex, false);
    setDotAria(prevIndex, false);

    // 3) Actualizar índice
    currentIndex = newIndex;

    // 4) Activar nuevo
    setSlideAria(currentIndex, true);
    setDotAria(currentIndex, true);

    // 5) Evento
    const slideChangeEvent = new CustomEvent('slideChange', {
      detail: {
        previousIndex: prevIndex,
        currentIndex,
        totalSlides: slides.length,
      },
    });
    track.dispatchEvent(slideChangeEvent);

    // 6) Sincronizar indicadores (blindaje extra)
    syncIndicators();

    // 7) Liberar transición
    setTimeout(() => {
      isTransitioning = false;
    }, TRANSITION_DURATION);
  };

  const moveToNextSlide = () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    moveToSlide(nextIndex);
  };

  const moveToPrevSlide = () => {
    const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    moveToSlide(prevIndex);
  };

  // ==========================================================================
  // Autoplay
  // ==========================================================================
  const startAutoPlay = () => {
    if (autoPlayInterval || isPaused) return;
    autoPlayInterval = setInterval(() => {
      if (!isPaused) moveToNextSlide();
    }, SLIDE_INTERVAL);
  };

  const stopAutoPlay = () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  };

  const pauseCarousel = (pause) => {
    isPaused = pause;
    if (pause) stopAutoPlay();
    else startAutoPlay();
  };

  // ==========================================================================
  // Eventos UI
  // ==========================================================================
  // Indicadores (dots)
  dotsNav.addEventListener('click', (e) => {
    const targetDot = e.target.closest('button');
    if (!targetDot) return;
    const targetIndex = dots.findIndex((dot) => dot === targetDot);
    if (targetIndex !== -1) moveToSlide(targetIndex);
  });

  // Teclado (flechas / space / home / end)
  document.addEventListener('keydown', (e) => {
    // Solo si el carrusel está en foco o hover
    if (
      !track.matches(':hover') &&
      document.activeElement !== track &&
      !dots.includes(document.activeElement)
    ) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        moveToPrevSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveToNextSlide();
        break;
      case ' ':
        e.preventDefault();
        pauseCarousel(!isPaused);
        break;
      case 'Home':
        e.preventDefault();
        moveToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        moveToSlide(slides.length - 1);
        break;
    }
  });

  // Pausar con hover
  track.addEventListener('mouseenter', () => pauseCarousel(true));
  track.addEventListener('mouseleave', () => pauseCarousel(false));

  // Pausar cuando la pestaña no está activa
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoPlay();
    else if (!isPaused) startAutoPlay();
  });

  // Gestos táctiles
  let startX = 0;
  let endX = 0;
  const MIN_SWIPE_DISTANCE = 50;

  track.addEventListener(
    'touchstart',
    (e) => {
      startX = e.touches[0].clientX;
    },
    { passive: true }
  );

  track.addEventListener(
    'touchend',
    (e) => {
      endX = e.changedTouches[0].clientX;
      const distance = Math.abs(startX - endX);
      if (distance > MIN_SWIPE_DISTANCE) {
        if (startX > endX) moveToNextSlide();
        else moveToPrevSlide();
      }
    },
    { passive: true }
  );

  // ==========================================================================
  // Accesibilidad
  // ==========================================================================
  const setupAccessibility = () => {
    // Track
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', 'Carrusel de imágenes');
    track.setAttribute('aria-live', 'polite');

    // Dots
    dots.forEach((dot, index) => {
      dot.setAttribute('aria-label', `Ir al slide ${index + 1} de ${slides.length}`);
      dot.setAttribute('type', 'button');
    });

    // Slides
    slides.forEach((slide, index) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${index + 1} de ${slides.length}`);
      slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    });
  };

  // Reinicializar
  const reinitialize = () => {
    stopAutoPlay();
    currentIndex = 0;
    isTransitioning = false;
    isPaused = false;

    slides.forEach((_, i) => setSlideAria(i, i === 0));
    dots.forEach((_, i) => setDotAria(i, i === 0));

    syncIndicators();
    startAutoPlay();
  };

  // API pública
  window.FullVidaCarousel = {
    moveToSlide,
    moveToNextSlide,
    moveToPrevSlide,
    startAutoPlay,
    stopAutoPlay,
    pauseCarousel,
    reinitialize,
    getCurrentIndex: () => currentIndex,
    getTotalSlides: () => slides.length,
    isPlaying: () => autoPlayInterval !== null && !isPaused,
  };

  // ==========================================================================
  // Inicialización
  // ==========================================================================
  setupAccessibility();

  // Asegurar estado inicial visible
  slides.forEach((_, i) => setSlideAria(i, i === 0));
  dots.forEach((_, i) => setDotAria(i, i === 0));

  startAutoPlay();
  syncIndicators();

  console.log('Carrusel Full Vida inicializado:', {
    totalSlides: slides.length,
    autoplayInterval: SLIDE_INTERVAL,
    transitionDuration: TRANSITION_DURATION,
  });

  // Manejo de errores de imagen (log)
  slides.forEach((slide, index) => {
    const img = slide.querySelector('.carousel-image');
    if (img) {
      img.addEventListener('error', () => {
        console.warn(`Error cargando imagen del slide ${index + 1}`);
      });
    }
  });
});
