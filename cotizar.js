// cotizar.js — mensaje de WhatsApp con emojis y saltos de línea bonitos
document.addEventListener('DOMContentLoaded', () => {
  const PHONE_WA = '51968323653'; // <-- tu número

  const form   = document.getElementById('cotizarForm');
  const btn    = document.getElementById('btnCotizar');
  const acepto = document.getElementById('acepto');

  // tipo
  const tipoRadios     = form.elements['tipo'];
  const accProductos   = document.querySelector('[data-section="productos"]');
  const accEmpresarial = document.querySelector('[data-section="empresarial"]');
  const accMaquila     = document.querySelector('[data-section="maquila"]');

  // básicos
  const soy         = document.getElementById('soy');
  const wrapEmpresa = document.getElementById('wrap-empresa');
  const empresa     = document.getElementById('empresa');
  const comprobante = document.getElementById('comprobante');
  const wrapRuc     = document.getElementById('wrap-ruc');
  const ruc         = document.getElementById('ruc');

  // Habilitar qty si marca formato
  document.querySelectorAll('.format-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const qty = document.getElementById(cb.dataset.target);
      if (!qty) return;
      qty.disabled = !cb.checked;
      qty.required = cb.checked;
      if (!cb.checked) qty.value = '';
    });
  });

  // Mostrar sección según tipo (y abrir acordeón correspondiente)
  function setTipoUI() {
    const tipo = [...tipoRadios].find(r => r.checked)?.value || 'productos';

    accProductos.classList.toggle('d-none', tipo !== 'productos');
    accEmpresarial.classList.toggle('d-none', tipo !== 'empresarial');
    accMaquila.classList.toggle('d-none', tipo !== 'maquila');

    [accProductos, accEmpresarial, accMaquila].forEach(acc => {
      acc.open = !acc.classList.contains('d-none');
    });

    const requiereEmpresa = (tipo === 'empresarial' || tipo === 'maquila' || soy.value === 'Empresa');
    wrapEmpresa.classList.toggle('d-none', !requiereEmpresa);
    empresa.required = requiereEmpresa;
  }

  tipoRadios.forEach(r => r.addEventListener('change', setTipoUI));

  // RUC visible si factura
  comprobante.addEventListener('change', () => {
    const factura = comprobante.value === 'Factura';
    wrapRuc.classList.toggle('d-none', !factura);
    ruc.required = factura;
  });

  soy.addEventListener('change', setTipoUI);

  // Botón habilitado solo si acepta
  const refreshBtn = () => {
    const enable = acepto.checked;
    btn.disabled = !enable;
    btn.setAttribute('aria-disabled', String(!enable));
  };
  acepto.addEventListener('change', refreshBtn);

  // Armar mensaje MULTILÍNEA con EMOJIS y abrir WA
  btn.addEventListener('click', () => {
    if (!acepto.checked) {
      alert('Debes aceptar la Política de Privacidad para continuar.');
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const val = id => (document.getElementById(id)?.value || '').trim();
    const nombre  = val('nombre');
    const correo  = val('correo');
    const celular = val('celular').replace(/[^\d+ ]/g,'');
    const ciudad  = val('ciudad');
    const soyTxt  = val('soy');
    const comp    = val('comprobante');
    const rucTxt  = val('ruc');
    const empresaTxt = val('empresa');

    const tipo = [...tipoRadios].find(r => r.checked)?.value || 'productos';

    const L = [];
    L.push('*Solicitud de cotización – FULL VIDA*');
    L.push('');
    L.push(`*Tipo:* ${tipo === 'productos' ? 'Productos' : (tipo === 'empresarial' ? 'Plan empresarial' : 'Maquila (marca propia)')}`);
    L.push('');
    L.push('*Datos de contacto*');
    L.push(`• Nombre: ${nombre}`);
    if (soyTxt)      L.push(`• Soy: ${soyTxt}`);
    if (empresaTxt)  L.push(`• Empresa: ${empresaTxt}`);
    if (ciudad)      L.push(`• Ciudad: ${ciudad}`);
    if (comp)        L.push(`• Comprobante: ${comp}${(comp==='Factura' && rucTxt) ? ` (RUC ${rucTxt})` : ''}`);
    L.push('');

    if (tipo === 'productos') {
      const items = [];
      document.querySelectorAll('.format-check').forEach(cb => {
        if (cb.checked) {
          const qty = document.getElementById(cb.dataset.target)?.value || '';
          items.push(`${cb.value}${qty ? ` x ${qty} UND.` : ''}`);
        }
      });
      if (items.length === 0) {
        alert('Selecciona al menos un formato y su cantidad.');
        return;
      }
      L.push('*Pedido – Productos*');
      L.push('• Formatos:');
      items.forEach(it => L.push(`   - ${it}`));

      const freq = val('frecuencia'); if (freq) L.push(`• Frecuencia: ${freq}`);
      const dir  = val('direccion');  if (dir)  L.push(`• Entrega: ${dir}`);
      const hor  = val('horario');    if (hor)  L.push(`• Horario: ${hor}`);
      L.push('');
    }

    if (tipo === 'empresarial') {
      L.push('*Pedido – Plan empresarial*');
      const sedes = val('sedes');      if (sedes) L.push(`• Nº de sedes: ${sedes}`);
      const cons  = val('consumo');    if (cons)  L.push(`• Consumo mensual aprox.: ${cons} Bidones`);
      const freq  = val('freqEmp');    if (freq)  L.push(`• Frecuencia: ${freq}`);
      const plan  = val('planSug');    if (plan)  L.push(`• Plan sugerido: ${plan}`);
      L.push('');
    }

    if (tipo === 'maquila') {
      L.push('*Pedido – Maquila (tu marca)*');
      const formatos = [...document.querySelectorAll('.maq-format:checked')].map(i => i.value);
      if (formatos.length) L.push(`• Formatos: ${formatos.join(', ')}`);
      const lote  = val('lote');       if (lote)  L.push(`• Volumen por lote: ${lote} Bidones`);
      const arte  = val('arte');       if (arte)  L.push(`• Etiqueta/arte: ${arte}`);
      const ent   = val('entregaMaq'); if (ent)   L.push(`• Entrega: ${ent}`);
      L.push('');
    }

    L.push('*Contacto*');
    if (celular) L.push(`• WhatsApp: ${celular}`);
    if (correo)  L.push(`• Email: ${correo}`);

    const comentarios = val('comentarios');
    if (comentarios) {
      L.push('');
      L.push('*Notas*');
      L.push(comentarios);
    }

    const mensaje = L.join('\n');
    const url = `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  });

  // Init
  setTipoUI();
  refreshBtn();
});
