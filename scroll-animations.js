// ==========================================================================
// ANIMACIONES AL SCROLL Y EFECTOS MODERNOS
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Configuración del Intersection Observer
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // Observer para elementos que se animan al entrar en viewport
    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Solo observar una vez
                animateObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Elementos a observar
    const elementsToAnimate = document.querySelectorAll(`
        .page-section,
        .section-title,
        .service-item,
        .testimonial,
        .footer-block
    `);
    
    elementsToAnimate.forEach(element => {
        animateObserver.observe(element);
    });
    
    // ==========================================================================
    // HEADER QUE SE ENCOGE AL HACER SCROLL
    // ==========================================================================
    
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    let scrollTimeout;
    
    const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Agregar clase cuando se hace scroll hacia abajo
        if (scrollTop > 100) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
        
        // Ocultar header al hacer scroll rápido hacia abajo, mostrar al subir
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scroll hacia abajo
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scroll hacia arriba
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
        
        // Limpiar timeout anterior
        clearTimeout(scrollTimeout);
        
        // Mostrar header después de que se deje de hacer scroll
        scrollTimeout = setTimeout(() => {
            header.style.transform = 'translateY(0)';
        }, 1000);
    };
    
    // Throttle para optimizar rendimiento
    let ticking = false;
    
    const throttledScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // ==========================================================================
    // EFECTOS DE PARALLAX SUAVES
    // ==========================================================================
    
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
    
    // Solo aplicar parallax en pantallas grandes
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(handleParallax);
        }, { passive: true });
    }
    
    // ==========================================================================
    // SMOOTH SCROLL PARA ENLACES INTERNOS
    // ==========================================================================
    
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ==========================================================================
    // LAZY LOADING MEJORADO PARA IMÁGENES
    // ==========================================================================
    
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Agregar efecto de fade-in
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.5s ease-out';
                    
                    img.addEventListener('load', () => {
                        img.style.opacity = '1';
                    });
                    
                    // Si la imagen ya está cargada
                    if (img.complete) {
                        img.style.opacity = '1';
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // ==========================================================================
    // CONTADOR ANIMADO (PARA ESTADÍSTICAS FUTURAS)
    // ==========================================================================
    
    const animateCounters = () => {
        const counters = document.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000; // 2 segundos
            const increment = target / (duration / 16); // 60 FPS
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
    
    // Observer para contadores
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    });
    
    const counterSection = document.querySelector('[data-counters]');
    if (counterSection) {
        counterObserver.observe(counterSection);
    }
    
    // ==========================================================================
    // EFECTOS DE HOVER MEJORADOS
    // ==========================================================================
    
    const serviceItems = document.querySelectorAll('.service-item');
    
    serviceItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Agregar efecto de elevación suave
            item.style.transform = 'translateY(-8px) scale(1.01)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // ==========================================================================
    // OPTIMIZACIÓN PARA DISPOSITIVOS TÁCTILES
    // ==========================================================================
    
    // Detectar dispositivos táctiles
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // Agregar clase para estilos específicos de touch
        document.body.classList.add('touch-device');
        
        // Remover efectos hover problemáticos en móviles
        const hoverElements = document.querySelectorAll('.service-item, .button, .image-background');
        hoverElements.forEach(element => {
            element.classList.add('touch-optimized');
        });
    }
    
    // ==========================================================================
    // NAVEGACIÓN CON TECLADO MEJORADA
    // ==========================================================================
    
    // Focus visible solo cuando se usa teclado
    let isTabbing = false;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            isTabbing = true;
            document.body.classList.add('user-is-tabbing');
        }
    });
    
    document.addEventListener('mousedown', () => {
        isTabbing = false;
        document.body.classList.remove('user-is-tabbing');
    });
    
    // ==========================================================================
    // PERFORMANCE MONITORING
    // ==========================================================================
    
    // Monitorear el rendimiento de las animaciones
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 16.67) { // Más de 60 FPS
                        console.warn('Animation frame took too long:', entry.duration);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['measure'] });
        } catch (e) {
            // Silenciar errores en navegadores que no soportan todas las features
        }
    }
    
    // ==========================================================================
    // UTILITIES Y HELPER FUNCTIONS
    // ==========================================================================
    
    // Función para debounce
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    // Función para throttle
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };
    
    // Redimensionamiento de ventana optimizado
    const handleResize = debounce(() => {
        // Recalcular elementos si es necesario
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, 250);
    
    window.addEventListener('resize', handleResize);
    
    // Establecer altura de viewport inicial
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // ==========================================================================
    // INICIALIZACIÓN COMPLETA
    // ==========================================================================
    
    console.log('🎉 Animaciones y efectos modernos cargados correctamente');
    
    // Disparar evento personalizado cuando todo esté listo
    const readyEvent = new CustomEvent('fullVidaAnimationsReady', {
        detail: {
            timestamp: Date.now(),
            features: [
                'scroll-animations',
                'header-shrink',
                'parallax',
                'smooth-scroll',
                'lazy-loading',
                'touch-optimization'
            ]
        }
    });
    
    document.dispatchEvent(readyEvent);
});