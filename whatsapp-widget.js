// ==========================================================================
// WIDGET DE WHATSAPP FLOTANTE PROFESIONAL (Seguro + Accesible + Optimizado)
// ==========================================================================

(() => {
  document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Configuración del widget
    // -------------------------------------------------------------
    const whatsappConfig = {
      phoneNumber: '51968323653', // Solo dígitos. Cambiar por el real si hace falta.
      companyName: 'AGUA DE MESA | FULL VIDA',
      // Mensajes contextuales por página
      messages: {
        default: '¡Hola! Me interesa solicitar información sobre los bidones de agua purificada FULL VIDA.',
        productos: '¡Hola! Quisiera conocer más sobre sus productos de agua purificada. ¿Podrían enviarme el catálogo completo?',
        maquila: '¡Hola! Me interesa el servicio de maquila para mi propia marca de agua. ¿Podrían brindarme más información?',
        empresas: '¡Hola! Represento a una empresa y necesitamos un plan de abastecimiento de agua. ¿Podrían contactarme?',
        contacto: '¡Hola! Quisiera solicitar una cotización para bidones de agua. ¿Cuáles son sus precios y condiciones de entrega?'
      },
      // Horarios de atención (America/Lima)
      businessHours: {
        enabled: true,
        timezone: 'America/Lima',
        schedule: {
          monday: { start: '08:00', end: '18:00' },
          tuesday: { start: '08:00', end: '18:00' },
          wednesday: { start: '08:00', end: '18:00' },
          thursday: { start: '08:00', end: '18:00' },
          friday: { start: '08:00', end: '18:00' },
          saturday: { start: '08:00', end: '18:00' },
          sunday: { start: '08:00', end: '13:00' }
        }
      },
      // Timing UI
      showDelayMs: 1500,    // Aparición del widget
      badgeDelayMs: 10000    // Aparición del badge si no hay interacción previa
    };

    // Evitar instancias duplicadas
    if (document.getElementById('whatsapp-widget')) return;

    // -------------------------------------------------------------
    // Utilidades
    // -------------------------------------------------------------
    const sanitizePhone = (raw) => (raw || '').replace(/\D+/g, '');
    const getContextualMessage = () => {
      const path = (window.location.pathname || '').toLowerCase();
      if (path.includes('productos')) return whatsappConfig.messages.productos;
      if (path.includes('maquila')) return whatsappConfig.messages.maquila;
      if (path.includes('empresas')) return whatsappConfig.messages.empresas;
      if (path.includes('contacto')) return whatsappConfig.messages.contacto;
      return whatsappConfig.messages.default;
    };
    const createSafeExternalOpen = (url) => {
      // Abrir con <a target=_blank rel=noopener noreferrer> para máxima seguridad
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      // Necesario que esté en DOM para algunos navegadores
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
    const i18nDay = (date, tz) =>
      date.toLocaleDateString('en-US', { weekday: 'long', timeZone: tz }).toLowerCase();
    const hhmm = (date, tz) =>
      date.toLocaleTimeString('en-US', { hour12: false, timeZone: tz }).slice(0, 5);

    const isOpenNow = () => {
      if (!whatsappConfig.businessHours.enabled) return true;
      const now = new Date();
      const tz = whatsappConfig.businessHours.timezone;
      const day = i18nDay(now, tz);
      const time = hhmm(now, tz);
      const today = whatsappConfig.businessHours.schedule[day];
      if (!today) return false;
      // Comparación segura con HH:MM (formato 24h)
      return time >= today.start && time <= today.end;
    };

    // -------------------------------------------------------------
    // CSS Inline (se inyecta una sola vez)
    // -------------------------------------------------------------
    const createWidgetStyles = () => {
      if (document.getElementById('whatsapp-widget-styles')) return;
      const styles = `
      <style id="whatsapp-widget-styles">
        .whatsapp-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: whatsapp-widget-in 0.6s ease-out 1.5s both;
        }
        .whatsapp-button {
          position: relative;
          width: 60px; height: 60px;
          background: #25D366; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #fff;
          box-shadow: 0 4px 20px rgba(37,211,102,0.4);
          transition: transform .3s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow .3s;
        }
        .whatsapp-button:hover { transform: scale(1.1) translateY(-2px); box-shadow: 0 8px 30px rgba(37,211,102,.6); }
        .whatsapp-pulse {
          position: absolute; inset: 0;
          border-radius: 50%; background: #25D366; opacity: .6;
          animation: whatsapp-pulse 2s ease-out infinite;
        }
        @keyframes whatsapp-pulse { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.6);opacity:0} }
        .whatsapp-badge {
          position: absolute; top: -5px; right: -5px;
          background: #FF3B30; color: #fff;
          border-radius: 50%; width: 22px; height: 22px;
          display: none; align-items: center; justify-content: center;
          font-size: 11px; font-weight: bold; animation: whatsapp-bounce .6s ease-in-out;
        }
        @keyframes whatsapp-bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        .whatsapp-chat {
          position: absolute; bottom: 80px; right: 0;
          width: 350px; max-width: calc(100vw - 40px);
          background:#fff; border-radius: 20px; overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,.15);
          opacity: 0; visibility: hidden; transform: scale(.8) translateY(20px);
          transition: transform .3s cubic-bezier(0.175,0.885,0.32,1.275), opacity .3s, visibility .3s;
        }
        .whatsapp-chat.active { opacity: 1; visibility: visible; transform: scale(1) translateY(0); }
        .whatsapp-chat-header {
          background:#075E54; color:#fff; padding: 15px 20px; display:flex; align-items:center; gap:12px;
        }
        .whatsapp-avatar { width:40px; height:40px; border-radius:50%; overflow:hidden; border:2px solid rgba(255,255,255,.2); }
        .whatsapp-avatar img { width:100%; height:100%; object-fit:cover; }
        .whatsapp-info { flex:1; }
        .whatsapp-info h4 { margin:0; font-size:16px; font-weight:600; }
        .whatsapp-status { font-size:12px; opacity:.9; display:flex; align-items:center; gap:6px; }
        .whatsapp-status::before { content:''; width:8px; height:8px; background:#4FC3F7; border-radius:50%; animation: whatsapp-online 2s ease-in-out infinite; }
        @keyframes whatsapp-online { 0%,100%{opacity:1} 50%{opacity:.5} }
        .whatsapp-close { background:none; border:none; color:#fff; font-size:22px; cursor:pointer; padding:5px; line-height:1; }
        .whatsapp-messages { padding:20px; max-height:200px; overflow-y:auto; }
        .whatsapp-message { margin-bottom:12px; animation: whatsapp-message-in .3s ease-out; }
        @keyframes whatsapp-message-in { from{opacity:0; transform: translateY(10px);} to{opacity:1; transform:none;} }
        .whatsapp-message p { background:#F0F0F0; padding:10px 12px; border-radius:15px 15px 15px 5px; margin:0 0 5px 0; font-size:14px; line-height:1.4; color:#333; display:inline-block; max-width:85%; }
        .whatsapp-time { font-size:11px; color:#999; margin-left:12px; }
        .whatsapp-actions { padding:0 20px 15px; display:flex; flex-direction:column; gap:8px; }
        .whatsapp-action { background:#E3F2FD; border:1px solid #BBDEFB; border-radius:20px; padding:10px 15px; text-align:left; cursor:pointer; font-size:14px; color:#1976D2; transition: background .2s, transform .2s; }
        .whatsapp-action:hover { background:#BBDEFB; transform: translateX(5px); }
        .whatsapp-footer { padding:15px 20px; border-top:1px solid #E0E0E0; }
        .whatsapp-send-btn { width:100%; background:#25D366; color:#fff; border:none; border-radius:25px; padding:12px 20px; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition: background .2s, transform .2s; }
        .whatsapp-send-btn:hover { background:#128C7E; transform: translateY(-1px); }
        /* Responsive */
        @media (max-width:480px){
          .whatsapp-widget{ bottom:15px; right:15px; }
          .whatsapp-button{ width:55px; height:55px; }
          .whatsapp-chat{ width: calc(100vw - 30px); bottom:75px; right:-15px; }
        }
        /* Estados especiales */
        .whatsapp-widget.closed-hours .whatsapp-status{ color:#FF9800; }
        .whatsapp-widget.closed-hours .whatsapp-status::before{ background:#FF9800; animation:none; }
        /* Animación de entrada widget */
        @keyframes whatsapp-widget-in { from{opacity:0; transform: scale(0) translateY(100px);} to{opacity:1; transform: scale(1) translateY(0);} }
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce){
          .whatsapp-pulse, .whatsapp-widget { animation: none !important; }
          .whatsapp-action:hover, .whatsapp-button:hover, .whatsapp-send-btn:hover { transform: none !important; }
          .whatsapp-chat { transition: none !important; }
        }
      </style>`;
      document.head.insertAdjacentHTML('beforeend', styles);
    };

    // -------------------------------------------------------------
    // HTML del widget
    // -------------------------------------------------------------
    const createWhatsAppWidget = () => {
      const widgetHTML = `
        <div id="whatsapp-widget" class="whatsapp-widget" aria-live="polite">
          <!-- Botón principal -->
          <button class="whatsapp-button" id="whatsapp-btn"
                  aria-label="Abrir chat de WhatsApp"
                  aria-haspopup="dialog"
                  aria-controls="whatsapp-chat"
                  aria-expanded="false" type="button">
            <div class="whatsapp-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.064 3.687"/></svg>
            </div>
            <div class="whatsapp-pulse" aria-hidden="true"></div>
            <div class="whatsapp-badge" id="whatsapp-badge" aria-hidden="true"><span>1</span></div>
          </button>

          <!-- Ventana de chat -->
          <div class="whatsapp-chat" id="whatsapp-chat" role="dialog" aria-modal="true" aria-labelledby="whatsapp-title" aria-hidden="true">
            <div class="whatsapp-chat-header">
              <div class="whatsapp-avatar"><img src="./imagenesvarias/LogoFullvidaWhatsApp.JPG" alt="FULL VIDA" /></div>
              <div class="whatsapp-info">
                <h4 id="whatsapp-title">AGUA DE MESA | FULL VIDA</h4>
                <span class="whatsapp-status" id="whatsapp-status">En línea</span>
              </div>
              <button class="whatsapp-close" id="whatsapp-close" aria-label="Cerrar chat" type="button">×</button>
            </div>

            <div class="whatsapp-messages">
              <div class="whatsapp-message received">
                <p>¡Hola!👋 Gracias por contactar a <strong>AGUA DE MESA | FULL VIDA</strong></p>
                <span class="whatsapp-time">Ahora</span>
              </div>
              <div class="whatsapp-message received">
                <p>¿En qué podemos ayudarte con nuestros productos de agua purificada? 💧</p>
                <span class="whatsapp-time">Ahora</span>
              </div>
            </div>

            <div class="whatsapp-actions">
              <button class="whatsapp-action" data-message="productos" type="button">📋 Ver Catálogo</button>
              <button class="whatsapp-action" data-message="empresas"  type="button">🏢 Plan Empresarial</button>
              <button class="whatsapp-action" data-message="contacto"  type="button">💰 Solicitar Cotización</button>
            </div>

            <div class="whatsapp-footer">
              <button class="whatsapp-send-btn" id="whatsapp-send" type="button">
                <span>Abrir WhatsApp</span>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', widgetHTML);
    };

    // -------------------------------------------------------------
    // Lógica de funcionamiento
    // -------------------------------------------------------------
    const initializeWidget = () => {
      const widget = document.getElementById('whatsapp-widget');
      const button = document.getElementById('whatsapp-btn');
      const chat = document.getElementById('whatsapp-chat');
      const closeBtn = document.getElementById('whatsapp-close');
      const sendBtn = document.getElementById('whatsapp-send');
      const actionBtns = document.querySelectorAll('.whatsapp-action');
      const badge = document.getElementById('whatsapp-badge');
      const statusEl = document.getElementById('whatsapp-status');

      +      // Asegurar URL absoluta del logo y fallback si no carga
        (function ensureAvatar() {
          const avatarImg = widget.querySelector('.whatsapp-avatar img');
          if (!avatarImg) return;
          const relPath = './imagenesvarias/LogoFullvidaWhatsApp.JPG';
          try {
            avatarImg.src = new URL(relPath, document.baseURI).href;
          } catch (e) {
            avatarImg.src = window.location.origin + '/' + relPath.replace(/^\.?\//, '');
          }
          avatarImg.addEventListener('error', () => {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="#075E54"/><text x="50%" y="54%" font-size="48" fill="#fff" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" alignment-baseline="middle">FV</text></svg>`;
            avatarImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
            avatarImg.style.objectFit = 'contain';
          }, { once: true });
        })();

      const phone = sanitizePhone(whatsappConfig.phoneNumber);
      let selectedMessage = getContextualMessage();
      let chatOpen = false;

      // Mostrar widget tras un breve delay
      setTimeout(() => {
        widget.style.display = 'block';
      }, whatsappConfig.showDelayMs);

      // Estado de horario
      const updateBusinessStatus = () => {
        const open = isOpenNow();
        if (open) {
          statusEl.textContent = 'En línea';
          widget.classList.remove('closed-hours');
          sendBtn.disabled = false;
        } else {
          statusEl.textContent = 'Fuera de horario';
          widget.classList.add('closed-hours');
          // Permitimos enviar igual, pero aclaramos en el texto.
        }
      };
      updateBusinessStatus();

      // Accesibilidad: foco y ARIA
      const setChatVisibility = (open) => {
        chatOpen = open;
        chat.classList.toggle('active', open);
        button.setAttribute('aria-expanded', String(open));
        chat.setAttribute('aria-hidden', String(!open));

        if (open) {
          badge.style.display = 'none';
          // Foco al primer control significativo
          const firstFocusable = chat.querySelector('button, [href], [tabindex]:not([tabindex="-1"])');
          if (firstFocusable) setTimeout(() => firstFocusable.focus(), 100);
        } else {
          // Devolver foco al botón
          button.focus();
        }
      };

      const toggleChat = () => setChatVisibility(!chatOpen);

      // Eventos
      button.addEventListener('click', (e) => {
        e.preventDefault();
        toggleChat();
      });

      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setChatVisibility(false);
      });

      // Cerrar con Escape y trampa de foco dentro del diálogo
      document.addEventListener('keydown', (e) => {
        if (!chatOpen) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          setChatVisibility(false);
        } else if (e.key === 'Tab') {
          const focusable = chat.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
          if (focusable.length) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault(); first.focus();
            }
          }
        }
      });

      // Clicks fuera del chat para cerrar
      document.addEventListener('click', (e) => {
        if (chatOpen && !document.getElementById('whatsapp-chat').contains(e.target) &&
          !document.getElementById('whatsapp-btn').contains(e.target)) {
          setChatVisibility(false);
        }
      });
      // Evitar burbujeo desde el interior del chat
      chat.addEventListener('click', (e) => e.stopPropagation());

      // Botones de acción contextual
      actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const messageType = btn.dataset.message;
          selectedMessage = whatsappConfig.messages[messageType] || whatsappConfig.messages.default;

          // Feedback visual
          actionBtns.forEach(b => b.style.background = '#E3F2FD');
          btn.style.background = '#BBDEFB';

          // Abrir WhatsApp
          setTimeout(() => {
            openWhatsApp(selectedMessage);
          }, 250);
        });
      });

      // Botón enviar
      sendBtn.addEventListener('click', () => {
        openWhatsApp(selectedMessage);
      });

      // Badge después de un tiempo si aún no hubo interacción (una vez por sesión)
      if (!sessionStorage.getItem('whatsappBadgeShown')) {
        setTimeout(() => {
          if (!chatOpen && badge) {
            badge.style.display = 'flex';
            sessionStorage.setItem('whatsappBadgeShown', '1');
          }
        }, whatsappConfig.badgeDelayMs);
      }

      // Recalcular estado cada minuto (por si cambia el horario)
      setInterval(updateBusinessStatus, 60 * 1000);

      function openWhatsApp(message) {
        const base = `https://wa.me/${phone}`;
        const encoded = encodeURIComponent(message || whatsappConfig.messages.default);
        const url = `${base}?text=${encoded}`;
        // Abrir de forma segura
        createSafeExternalOpen(url);

        // Cerrar chat y ocultar badge
        setChatVisibility(false);
        badge.style.display = 'none';

        // (Opcional) Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'whatsapp_click', {
            event_category: 'engagement',
            event_label: (message || '').substring(0, 50)
          });
        }
      }

      // Evento listo
      document.dispatchEvent(new CustomEvent('whatsappWidgetReady', {
        detail: { timestamp: Date.now(), phone }
      }));

      console.log('🟢 Widget de WhatsApp cargado correctamente');
    };

    // -------------------------------------------------------------
    // Boot
    // -------------------------------------------------------------
    createWidgetStyles();
    createWhatsAppWidget();
    initializeWidget();
  });
})();
