document.addEventListener('DOMContentLoaded', function () {
    // Configuración del carrusel
    const SLIDE_INTERVAL = 6000; // 15 segundos
    const TRANSITION_DURATION = 500; // Duración de la transición en ms
    
    // Selección de elementos del DOM
    const track = document.querySelector('.carousel-track');
    const dotsNav = document.querySelector('.carousel-nav');
    
    // Verificar que existan los elementos necesarios
    if (!track || !dotsNav) {
        console.warn('Carrusel: Elementos necesarios no encontrados');
        return;
    }
    
    const slides = Array.from(track.children);
    const dots = Array.from(dotsNav.children);
    
    // Verificar que haya slides y dots
    if (slides.length === 0 || dots.length === 0) {
        console.warn('Carrusel: No hay slides o dots disponibles');
        return;
    }
    
    // Variables de estado
    let currentIndex = 0;
    let autoPlayInterval = null;
    let isTransitioning = false;
    let isPaused = false;
    
    /**
     * Mueve el carrusel a un slide específico
     * @param {number} newIndex - Índice del slide de destino
     */
    const moveToSlide = (newIndex) => {
        // Validar índice
        if (newIndex < 0 || newIndex >= slides.length || newIndex === currentIndex || isTransitioning) {
            return;
        }
        
        isTransitioning = true;
        
        // Remover clase actual
        const currentSlide = slides[currentIndex];
        const currentDot = dots[currentIndex];
        
        currentSlide.classList.remove('current-slide');
        currentDot.classList.remove('current-slide');
        
        // Agregar clase nueva
        const newSlide = slides[newIndex];
        const newDot = dots[newIndex];
        
        newSlide.classList.add('current-slide');
        newDot.classList.add('current-slide');
        
        // Actualizar índice
        const prevIndex = currentIndex;
        currentIndex = newIndex;
        
        // Disparar evento personalizado
        const slideChangeEvent = new CustomEvent('slideChange', {
            detail: {
                previousIndex: prevIndex,
                currentIndex: currentIndex,
                totalSlides: slides.length
            }
        });
        track.dispatchEvent(slideChangeEvent);
        
        // Permitir nueva transición después de la duración
        setTimeout(() => {
            isTransitioning = false;
        }, TRANSITION_DURATION);
    };
    
    /**
     * Mueve al siguiente slide
     */
    const moveToNextSlide = () => {
        const nextIndex = (currentIndex + 1) % slides.length;
        moveToSlide(nextIndex);
    };
    
    /**
     * Mueve al slide anterior
     */
    const moveToPrevSlide = () => {
        const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
        moveToSlide(prevIndex);
    };
    
    /**
     * Inicia el autoplay del carrusel
     */
    const startAutoPlay = () => {
        if (autoPlayInterval || isPaused) return;
        
        autoPlayInterval = setInterval(() => {
            if (!isPaused) {
                moveToNextSlide();
            }
        }, SLIDE_INTERVAL);
    };
    
    /**
     * Detiene el autoplay del carrusel
     */
    const stopAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    };
    
    /**
     * Pausa/reanuda el carrusel
     * @param {boolean} pause - True para pausar, false para reanudar
     */
    const pauseCarousel = (pause) => {
        isPaused = pause;
        if (pause) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    };
    
    // Event Listeners
    
    // Navegación por dots
    dotsNav.addEventListener('click', (e) => {
        const targetDot = e.target.closest('button');
        if (!targetDot) return;
        
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        if (targetIndex !== -1) {
            moveToSlide(targetIndex);
        }
    });
    
    // Navegación por teclado
    document.addEventListener('keydown', (e) => {
        // Solo actuar si el carrusel está en foco o es visible
        if (!track.matches(':hover') && document.activeElement !== track && !dots.includes(document.activeElement)) {
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
            case ' ': // Barra espaciadora
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
    
    // Pausar/reanudar con hover
    track.addEventListener('mouseenter', () => pauseCarousel(true));
    track.addEventListener('mouseleave', () => pauseCarousel(false));
    
    // Pausar cuando la pestaña no está activa
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else if (!isPaused) {
            startAutoPlay();
        }
    });
    
    // Soporte para gestos táctiles (básico)
    let startX = 0;
    let endX = 0;
    const MIN_SWIPE_DISTANCE = 50;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const distance = Math.abs(startX - endX);
        
        if (distance > MIN_SWIPE_DISTANCE) {
            if (startX > endX) {
                moveToNextSlide(); // Swipe left = siguiente
            } else {
                moveToPrevSlide(); // Swipe right = anterior
            }
        }
    }, { passive: true });
    
    // Mejorar accesibilidad
    const setupAccessibility = () => {
        // Hacer el track focuseable
        track.setAttribute('tabindex', '0');
        track.setAttribute('role', 'region');
        track.setAttribute('aria-label', 'Carrusel de imágenes');
        track.setAttribute('aria-live', 'polite');
        
        // Configurar dots como botones accesibles
        dots.forEach((dot, index) => {
            dot.setAttribute('aria-label', `Ir al slide ${index + 1} de ${slides.length}`);
            dot.setAttribute('type', 'button');
        });
        
        // Configurar slides
        slides.forEach((slide, index) => {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', `${index + 1} de ${slides.length}`);
        });
    };
    
    // Función para reinicializar el carrusel si es necesario
    const reinitialize = () => {
        stopAutoPlay();
        currentIndex = 0;
        isTransitioning = false;
        isPaused = false;
        
        // Resetear clases
        slides.forEach(slide => slide.classList.remove('current-slide'));
        dots.forEach(dot => dot.classList.remove('current-slide'));
        
        // Activar primer slide
        if (slides[0] && dots[0]) {
            slides[0].classList.add('current-slide');
            dots[0].classList.add('current-slide');
        }
        
        startAutoPlay();
    };
    
    // API pública del carrusel
    const carouselAPI = {
        moveToSlide,
        moveToNextSlide,
        moveToPrevSlide,
        startAutoPlay,
        stopAutoPlay,
        pauseCarousel,
        reinitialize,
        getCurrentIndex: () => currentIndex,
        getTotalSlides: () => slides.length,
        isPlaying: () => autoPlayInterval !== null && !isPaused
    };
    
    // Exponer API globalmente si es necesario
    window.FullVidaCarousel = carouselAPI;
    
    // Inicialización
    setupAccessibility();
    
    // Asegurar que el primer slide esté activo
    if (slides[0] && dots[0]) {
        slides[0].classList.add('current-slide');
        dots[0].classList.add('current-slide');
    }
    
    // Iniciar autoplay
    startAutoPlay();
    
    // Log de inicialización
    console.log('Carrusel Full Vida inicializado correctamente:', {
        totalSlides: slides.length,
        autoplayInterval: SLIDE_INTERVAL,
        transitionDuration: TRANSITION_DURATION
    });
    
    // Manejar errores de imagen
    slides.forEach((slide, index) => {
        const img = slide.querySelector('.carousel-image');
        if (img) {
            img.addEventListener('error', () => {
                console.warn(`Error cargando imagen del slide ${index + 1}`);
                // Opcionalmente, mostrar una imagen por defecto
            });
        }
    });
});