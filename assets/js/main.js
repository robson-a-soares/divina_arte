/* Divina Arte — comportamento do site (JS simples, sem bibliotecas) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Cabeçalho: transparente no topo, sólido ao descer */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('solid', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Menu mobile */
  var btn = $('.menu-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', open);
    });
    $$('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); btn.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* Slideshow do hero (com traços de progresso) */
  var slides = $$('.hero .slides img');
  if (slides.length > 1) {
    var i = 0, timer, dots = document.createElement('div');
    dots.className = 'dots';
    slides.forEach(function (_, k) {
      var d = document.createElement('button');
      d.setAttribute('aria-label', 'Imagem ' + (k + 1));
      d.addEventListener('click', function () { go(k); play(); });
      dots.appendChild(d);
    });
    $('.hero').appendChild(dots);
    var db = $$('button', dots);
    function go(n) {
      slides[i].classList.remove('on'); db[i].classList.remove('on');
      i = n; slides[i].classList.add('on'); db[i].classList.add('on');
    }
    function play() { clearInterval(timer); timer = setInterval(function () { go((i + 1) % slides.length); }, 5500); }
    db[0].classList.add('on'); play();
  }

  /* Carrosséis horizontais: setas (no computador); no telemóvel desliza-se com o dedo */
  $$('.rail-wrap').forEach(function (w) {
    var rail = $('.rail', w);
    $$('.rail-nav button', w).forEach(function (b) {
      b.addEventListener('click', function () {
        var step = rail.children[0].getBoundingClientRect().width + 22;
        rail.scrollBy({ left: step * Number(b.getAttribute('data-dir')), behavior: 'smooth' });
      });
    });
  });

  /* Aparecer ao fazer scroll */
  var rev = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rev.forEach(function (r) { io.observe(r); });
  } else { rev.forEach(function (r) { r.classList.add('in'); }); }

  /* Filtros da galeria */
  var fbtn = $$('.filters button');
  var figs = $$('.gallery figure');
  fbtn.forEach(function (b) {
    b.addEventListener('click', function () {
      fbtn.forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      var f = b.getAttribute('data-f');
      figs.forEach(function (fig) {
        fig.hidden = !(f === 'all' || fig.getAttribute('data-c') === f);
      });
    });
  });

  /* Lightbox */
  var lb = $('.lightbox');
  if (lb) {
    var img = $('img', lb), cnt = $('.cnt', lb), cur = 0, list = [];
    function visible() { return figs.filter(function (f) { return !f.hidden; }); }
    function show(n) {
      cur = (n + list.length) % list.length;
      img.src = list[cur].querySelector('button').getAttribute('data-full');
      img.alt = list[cur].querySelector('img').alt;
      cnt.textContent = (cur + 1) + ' / ' + list.length;
    }
    function open(fig) { list = visible(); show(list.indexOf(fig)); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; img.src = ''; }
    figs.forEach(function (f) { f.addEventListener('click', function () { open(f); }); });
    $('.x', lb).addEventListener('click', close);
    $('.pv', lb).addEventListener('click', function () { show(cur - 1); });
    $('.nx', lb).addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
    var sx = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });
  }

  /* Formulário de cotação -> WhatsApp / E-mail (sem servidor) */
  var form = $('form.q');
  if (form) {
    var wa = form.getAttribute('data-wa');
    var mail = form.getAttribute('data-mail');
    var company = form.getAttribute('data-company');
    var labels = {
      nome: 'Nome', telefone: 'Telefone/WhatsApp', email: 'E-mail', evento: 'Tipo de evento',
      data: 'Data do evento', local: 'Local', convidados: 'Nº de convidados',
      servico: 'Serviço pretendido', orcamento: 'Orçamento disponível', descricao: 'Descrição do pedido'
    };
    function compose() {
      var lines = ['Olá, ' + company + '! Gostaria de pedir uma cotação.', ''];
      Object.keys(labels).forEach(function (k) {
        var el = form.elements[k];
        if (el && el.value.trim()) {
          var v = el.value.trim();
          if (k === 'data') { var p = v.split('-'); if (p.length === 3) v = p[2] + '/' + p[1] + '/' + p[0]; }
          lines.push('*' + labels[k] + ':* ' + v);
        }
      });
      return lines.join('\n');
    }
    function valid() {
      var err = $('.err', form), nome = form.elements.nome, tel = form.elements.telefone;
      if (!nome.value.trim() || !tel.value.trim()) {
        err.textContent = 'Por favor indique o seu nome e telefone/WhatsApp.';
        (nome.value.trim() ? tel : nome).focus();
        return false;
      }
      err.textContent = '';
      return true;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valid()) return;
      window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(compose()), '_blank', 'noopener');
    });
    var m = $('.btn-mail', form);
    if (m) m.addEventListener('click', function () {
      if (!valid()) return;
      window.location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Pedido de cotação — ' + company) + '&body=' + encodeURIComponent(compose());
    });
  }

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
