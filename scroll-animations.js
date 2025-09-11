// ==========================================================================
// ANIMACIONES AL SCROLL Y EFECTOS MODERNOS (sin lógica de header-scroll)
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    // -------------------------------------------------------------
    // Intersection Observer para animaciones de aparición
    // -------------------------------------------------------------
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                animateObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll(`
        .page-section,
        .section-title,
        .service-item,
        .testimonial,
        .footer-block
    `);

    elementsToAnimate.forEach(el => animateObserver.observe(el));

    // -------------------------------------------------------------
    // PARALLAX SUAVE SOLO EN ESCRITORIO
    // -------------------------------------------------------------
    const parallaxElements = document.querySelectorAll('.carousel-image');

    const handleParallax = () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;

        parallaxElements.forEach(element => {
            if (element.closest('.current-slide')) {
                const yPos = -(scrolled * parallaxSpeed);
                element.style.transform = `translateY(${yPos}px)`;
            }
        });
    };

    if (window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(handleParallax);
        }, { passive: true });
    }

    // -------------------------------------------------------------
    // SMOOTH SCROLL PARA ENLACES INTERNOS
    // (Nota: si también lo tienes en header-footer.js, no pasa nada;
    // ambos apuntan al mismo desplazamiento)
    // -------------------------------------------------------------
    const header = document.querySelector('header');
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();
                const headerHeight = header?.offsetHeight || 70;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // -------------------------------------------------------------
    // LAZY LOADING MEJORADO PARA IMÁGENES
    // -------------------------------------------------------------
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Efecto fade-in
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.5s ease-out';

                    img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });

                    if (img.complete) img.style.opacity = '1';

                    obs.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // -------------------------------------------------------------
    // CONTADOR ANIMADO (para estadísticas futuras)
    // -------------------------------------------------------------
    const animateCounters = () => {
        const counters = document.querySelectorAll('[data-count]');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count, 10);
            const duration = 2000; // 2s
            const increment = target / (duration / 16); // ~60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };

            updateCounter();
        });
    };

    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                obs.unobserve(entry.target);
            }
        });
    });

    const counterSection = document.querySelector('[data-counters]');
    if (counterSection) counterObserver.observe(counterSection);

    // -------------------------------------------------------------
    // EFECTOS DE HOVER MEJORADOS
    // -------------------------------------------------------------
    const serviceItems = document.querySelectorAll('.service-item');

    serviceItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-8px) scale(1.01)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
        });
    });

    // -------------------------------------------------------------
    // OPTIMIZACIÓN PARA DISPOSITIVOS TÁCTILES
    // -------------------------------------------------------------
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        document.body.classList.add('touch-device');
        document.querySelectorAll('.service-item, .button, .image-background')
                .forEach(el => el.classList.add('touch-optimized'));
    }

    // -------------------------------------------------------------
    // NAVEGACIÓN CON TECLADO MEJORADA (focus-visible simulado)
    // -------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') document.body.classList.add('user-is-tabbing');
    });
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('user-is-tabbing');
    });

    // -------------------------------------------------------------
    // PERFORMANCE MONITORING (opcional, silencioso)
    // -------------------------------------------------------------
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 16.67) {
                        console.warn('Animation frame took too long:', entry.duration);
                    }
                }
            });
            observer.observe({ entryTypes: ['measure'] });
        } catch (_) {/* noop */}
    }

    // -------------------------------------------------------------
    // UTILIDADES: debounce + manejo de resize para --vh
    // -------------------------------------------------------------
    const debounce = (fn, wait) => {
        let t; return (...args) => {
            clearTimeout(t); t = setTimeout(() => fn(...args), wait);
        };
    };

    const handleResize = debounce(() => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, 250);

    window.addEventListener('resize', handleResize);

    // Altura de viewport inicial
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // -------------------------------------------------------------
    // READY
    // -------------------------------------------------------------
    console.log('🎉 Animaciones y efectos modernos cargados correctamente');

    const readyEvent = new CustomEvent('fullVidaAnimationsReady', {
        detail: {
            timestamp: Date.now(),
            features: [
                'scroll-animations',
                'parallax',
                'smooth-scroll',
                'lazy-loading',
                'touch-optimization'
            ]
        }
    });
    document.dispatchEvent(readyEvent);
});
