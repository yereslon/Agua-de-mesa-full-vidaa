// ==========================================================================
// HEADER Y FOOTER RESPONSIVE - COMPLETO (con botón X para cerrar menú)
// ==========================================================================

(() => {
  // ========================================================================
  // VARIABLES GLOBALES
  // ========================================================================
  const body = document.body;
  const header = document.querySelector('header');

  let menuToggle = document.querySelector('.menu-toggle');
  let mobileNav   = document.querySelector('.mobile-nav');
  let mobileOverlay = document.querySelector('.mobile-overlay');
  let mobileClose = document.querySelector('.mobile-close');

  let isMenuOpen = false;
  let lastScrollTop = 0;
  let scrollTimeout;
  let ticking = false;

  // ========================================================================
  // CREAR ELEMENTOS NECESARIOS SI NO EXISTEN
  // ========================================================================
  const createResponsiveElements = () => {
    if (!document.querySelector('.menu-toggle')) createMobileMenu();
    if (!document.querySelector('.mobile-overlay')) createMobileOverlay();
    setupHeaderStructure();
  };

  const createMobileMenu = () => {
    // Botón hamburguesa
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.setAttribute('aria-label', 'Abrir menú de navegación');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.innerHTML = '<span class="hamburger"></span>';

    // Panel móvil
    const mobileNavElement = document.createElement('nav');
    mobileNavElement.className = 'mobile-nav';
    mobileNavElement.setAttribute('aria-label', 'Navegación móvil');
    mobileNavElement.setAttribute('aria-hidden', 'true');

    // Header del panel con botón X
    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'mobile-nav-header';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-close';
    closeBtn.setAttribute('aria-label', 'Cerrar menú');
    closeBtn.setAttribute('type', 'button');
    closeBtn.innerHTML = `
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
        <path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z"/>
      </svg>
    `;

    mobileHeader.appendChild(closeBtn);
    mobileNavElement.appendChild(mobileHeader);

    // Clonar enlaces del menú principal
    const mainNav = document.querySelector('.main-nav ul');
    if (mainNav) {
      const mobileList = mainNav.cloneNode(true);
      mobileNavElement.appendChild(mobileList);

      // CTA móvil
      const ctaButton = document.querySelector('.cta-button');
      if (ctaButton) {
        const mobileCTA = document.createElement('div');
        mobileCTA.className = 'mobile-cta';
        mobileCTA.appendChild(ctaButton.cloneNode(true));
        mobileNavElement.appendChild(mobileCTA);
      }
    }

    // Insertar en DOM
    const headerContainer = document.querySelector('.header-container') || header;
    headerContainer.appendChild(menuButton);
    body.appendChild(mobileNavElement);
  };

  const createMobileOverlay = () => {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    body.appendChild(overlay);
  };

  const setupHeaderStructure = () => {
    if (!header.querySelector('.header-container')) {
      const container = document.createElement('div');
      container.className = 'header-container';
      while (header.firstChild) container.appendChild(header.firstChild);
      header.appendChild(container);
    }
  };

  // ========================================================================
  // FUNCIONALIDAD DEL MENÚ MÓVIL
  // ========================================================================
  const toggleMobileMenu = () => {
    isMenuOpen = !isMenuOpen;

    menuToggle?.classList.toggle('active', isMenuOpen);
    mobileNav?.classList.toggle('active', isMenuOpen);
    mobileOverlay?.classList.toggle('active', isMenuOpen);

    menuToggle?.setAttribute('aria-expanded', isMenuOpen.toString());
    mobileNav?.setAttribute('aria-hidden', (!isMenuOpen).toString());
    mobileOverlay?.setAttribute('aria-hidden', (!isMenuOpen).toString());

    if (isMenuOpen) {
      body.classList.add('no-scroll');
      const firstLink = mobileNav?.querySelector('a');
      setTimeout(() => (mobileClose || firstLink)?.focus(), 250);
    } else {
      body.classList.remove('no-scroll');
      menuToggle?.focus();
    }

    const event = new CustomEvent('mobileMenuToggle', { detail: { isOpen: isMenuOpen } });
    document.dispatchEvent(event);
  };

  const closeMobileMenu = () => {
    if (isMenuOpen) toggleMobileMenu();
  };

  // ========================================================================
  // SCROLL HEADER: REDUCE/OCULTA EN DESPLAZAMIENTO
  // ========================================================================
  const handleHeaderScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 50) header?.classList.add('header-scrolled');
    else header?.classList.remove('header-scrolled');

    if (window.innerWidth > 768) {
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
    }

    lastScrollTop = scrollTop;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (header) header.style.transform = 'translateY(0)';
    }, 1500);
  };

  const throttledScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleHeaderScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  // ========================================================================
  // HANDLERS VARIOS
  // ========================================================================
  const handleResize = () => {
    const width = window.innerWidth;

    if (width > 768 && isMenuOpen) closeMobileMenu();
    if (width <= 768 && header) header.style.transform = 'translateY(0)';

    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  const handleKeyboardNavigation = (e) => {
    // Cerrar con Escape
    if (e.key === 'Escape' && isMenuOpen) {
      closeMobileMenu();
      return;
    }

    // Focus trap con Tab dentro del panel móvil
    if (e.key === 'Tab' && isMenuOpen) {
      const focusable = mobileNav?.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
      if (!focusable || focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  };

  const handleOutsideClick = (e) => {
    if (isMenuOpen && !mobileNav?.contains(e.target) && !menuToggle?.contains(e.target)) {
      closeMobileMenu();
    }
  };

  // ========================================================================
  // UTILIDADES
  // ========================================================================
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

  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  // ========================================================================
  // FEATURES EXTRA (igual que tenías)
  // ========================================================================
  const setupFooterAnimations = () => {
    const footerSections = document.querySelectorAll('.footer-section');
    if ('IntersectionObserver' in window && footerSections.length > 0) {
      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            footerObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      footerSections.forEach((section) => footerObserver.observe(section));
    }
  };

  const setupSmoothScroll = () => {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;

        e.preventDefault();
        if (isMenuOpen) closeMobileMenu();

        const headerHeight = header?.offsetHeight || 70;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;

        window.scrollTo({ top: targetPosition, behavior: 'smooth' });

        if (history.replaceState) history.replaceState(null, null, `#${targetId}`);
      });
    });
  };

  const setupActivePageIndicator = () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a');

    navLinks.forEach((link) => {
      const linkPath = link.getAttribute('href');
      if (
        linkPath === currentPath ||
        (currentPath === '' && linkPath === 'index.html') ||
        (currentPath === 'index.html' && linkPath === 'index.html')
      ) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    });
  };

  const setupLazyLoading = () => {
    const lazyImages = document.querySelectorAll('footer img[data-src]');
    if ('IntersectionObserver' in window && lazyImages.length > 0) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      lazyImages.forEach((img) => imageObserver.observe(img));
    }
  };

  const enhanceAccessibility = () => {
    // Skip link
    if (!document.querySelector('.skip-link')) {
      const skipLink = document.createElement('a');
      skipLink.className = 'skip-link';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Saltar al contenido principal';
      skipLink.setAttribute('accesskey', 's');
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Botones sin texto
    const buttons = document.querySelectorAll('button:not([aria-label]):not([title])');
    buttons.forEach((button) => {
      if (!button.textContent.trim()) button.setAttribute('aria-label', 'Botón');
    });

    // Enlaces externos
    const externalLinks = document.querySelectorAll(
      'a[href^="http"]:not([href*="' + window.location.hostname + '"])'
    );
    externalLinks.forEach((link) => {
      link.setAttribute('rel', 'noopener noreferrer');
      if (!link.getAttribute('aria-label') && !link.title) {
        link.setAttribute('aria-label', link.textContent + ' (abre en nueva ventana)');
      }
    });
  };

  const monitorPerformance = () => {
    if ('performance' in window && 'measure' in window.performance) {
      window.performance.mark('header-footer-start');
      setTimeout(() => {
        window.performance.mark('header-footer-end');
        window.performance.measure('header-footer-load', 'header-footer-start', 'header-footer-end');

        const measure = window.performance.getEntriesByName('header-footer-load')[0];
        if (measure && measure.duration > 100) {
          console.warn('Header/Footer took longer than expected to load:', measure.duration + 'ms');
        }
      }, 0);
    }
  };

  // ========================================================================
  // EVENT LISTENERS
  // ========================================================================
  const setupEventListeners = () => {
    // Botón hamburguesa
    menuToggle?.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMobileMenu();
    });

    // Botón X
    mobileClose?.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
    });

    // Overlay
    mobileOverlay?.addEventListener('click', closeMobileMenu);

    // Enlaces del menú móvil
    const mobileLinks = mobileNav?.querySelectorAll('a');
    mobileLinks?.forEach((link) => {
      link.addEventListener('click', () => setTimeout(closeMobileMenu, 150));
    });

    // Scroll / Resize
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Teclado y clicks fuera
    document.addEventListener('keydown', handleKeyboardNavigation);
    document.addEventListener('click', handleOutsideClick);
  };

  // ========================================================================
  // API PÚBLICA
  // ========================================================================
  const headerFooterAPI = {
    openMobileMenu: () => { if (!isMenuOpen) toggleMobileMenu(); },
    closeMobileMenu,
    toggleMobileMenu,
    isMenuOpen: () => isMenuOpen,
    scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    refreshActiveLinks: setupActivePageIndicator,
    on: (event, callback) => document.addEventListener(event, callback),
    off: (event, callback) => document.removeEventListener(event, callback),
  };
  window.FullVidaHeaderFooter = headerFooterAPI;

  // ========================================================================
  // INICIALIZACIÓN
  // ========================================================================
  const init = () => {
    try {
      createResponsiveElements();

      // Actualizar referencias
      menuToggle = document.querySelector('.menu-toggle');
      mobileNav = document.querySelector('.mobile-nav');
      mobileOverlay = document.querySelector('.mobile-overlay');
      mobileClose = document.querySelector('.mobile-close');

      setupEventListeners();
      setupActivePageIndicator();
      setupSmoothScroll();
      setupFooterAnimations();
      setupLazyLoading();
      enhanceAccessibility();
      monitorPerformance();

      handleResize();

      const readyEvent = new CustomEvent('headerFooterReady', {
        detail: { timestamp: Date.now(), features: ['responsive-menu', 'smooth-scroll', 'accessibility', 'animations'] }
      });
      document.dispatchEvent(readyEvent);

      console.log('🎯 Header y Footer responsive inicializados correctamente');
    } catch (error) {
      console.error('Error inicializando Header/Footer:', error);
    }
  };

  // Manejo de errores del archivo
  window.addEventListener('error', (e) => {
    if (e.filename && e.filename.includes('header-footer')) {
      console.error('Error en Header/Footer:', e.error);
    }
  });

  // Cleanup
  window.addEventListener('beforeunload', () => {
    clearTimeout(scrollTimeout);
    window.removeEventListener('scroll', throttledScroll);
    window.removeEventListener('resize', handleResize);
  });

  // Lanzar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
    