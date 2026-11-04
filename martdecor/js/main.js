/* Общие блоки, подборка, каталог, карточка и статья. */
(function () {
  var PHONE = '+7 (909) 420-04-20';
  var TEL = '+79094200420';
  var KEY = 'martdecor-pick';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function t(s) { return esc(typo(s)); }
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; }
  function priceHtml(it) { return 'от ' + money(it.price) + (it.unit ? ' <small>/ ' + esc(it.unit) + '</small>' : ''); }
  function stockHtml(it) {
    return it.status === 'in'
      ? '<span class="stock">На складе, для примера</span>'
      : '<span class="stock ask">Срок уточнит менеджер, для примера</span>';
  }
  function byId(id) { return ITEMS.filter(function (i) { return i.id === id; })[0]; }
  function section(id) { return SECTIONS.filter(function (s) { return s.id === id; })[0]; }
  function param(name) { return new URLSearchParams(location.search).get(name); }

  /* браузерное хранилище может быть недоступно — тогда подборка живёт до перезагрузки */
  var memory = [];
  function loadPick() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return memory; }
  }
  function savePick(list) {
    memory = list;
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* остаётся в памяти */ }
  }
  function inPick(id) { return loadPick().indexOf(id) >= 0; }
  function togglePick(id) {
    var list = loadPick();
    var i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    savePick(list);
    syncPick();
  }

  function logoSvg() {
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M5 37V19a15 15 0 0 1 30 0v18" fill="none" stroke="#1c1917" stroke-width="2"/><path d="M8 37V19A12 12 0 0 1 19 7v30z" fill="#5e2129"/><path d="M21 7a12 12 0 0 1 11 12v18H21z" fill="#b9bdb7"/><path d="M12 37V25a3.5 3.5 0 0 1 7 0v12z" fill="#55704a"/><path d="M24 37V26a2.5 2.5 0 0 1 5 0v11z" fill="#a89a80"/></svg>';
  }

  function renderChrome() {
    var page = document.body.dataset.page;
    var nav = [['catalog.html', 'Каталог', 'catalog'], ['index.html#podbor', 'Как подбираем'], ['index.html#pro', 'Дизайнерам и мастерам'], ['index.html#sovety', 'Советы'], ['index.html#kontakty', 'Контакты']];
    $('#top').innerHTML =
      '<header class="topbar"><div class="wrap">' +
      '<a class="logo" href="index.html">' + logoSvg() + '<span><b>МАРТдекор</b><small>интерьерный салон</small></span></a>' +
      '<nav class="nav" id="nav">' + nav.map(function (n) {
        return '<a href="' + n[0] + '"' + (n[2] === page ? ' class="active"' : '') + '>' + t(n[1]) + '</a>';
      }).join('') + '</nav>' +
      '<a class="top-phone" href="tel:' + TEL + '">' + PHONE + '</a>' +
      '<button class="btn pick-btn" data-open-pick type="button"><i class="ti ti-bookmark" aria-hidden="true"></i><span class="label">Подборка</span> <span class="n" id="pick-n">0</span></button>' +
      '<button class="burger" id="burger" type="button" aria-label="Меню" aria-expanded="false"><i class="ti ti-menu-2" aria-hidden="true"></i></button>' +
      '</div></header>';

    $('#bottom').innerHTML =
      '<footer><div class="wrap"><div class="cols">' +
      '<div><h3>МАРТдекор</h3><p>' + t('Подбор не по каталогу, а под ваш интерьер. Ростов-на-Дону, пр. Михаила Нагибина, 30Л, дизайн-центр WEST, цокольный этаж.') + '</p></div>' +
      '<div><h3>Связаться</h3><ul><li><a href="tel:' + TEL + '">' + PHONE + '</a></li><li><a href="tel:+79094209420">+7 (909) 420-94-20</a></li><li><a href="mailto:info@martdecor.ru">info@martdecor.ru</a></li><li>' + t('Пн–пт 10:00–19:00, сб–вс 10:00–17:00') + '</li></ul></div>' +
      '<div><h3>Мы на связи</h3><ul><li><a href="https://wa.me/79094200420" rel="noopener">WhatsApp</a></li><li><a href="https://t.me/martdecorrostov" rel="noopener">Telegram</a></li><li><a href="https://vk.ru/martdecoronline" rel="noopener">ВКонтакте</a></li></ul></div>' +
      '</div><div class="legal"><span>ИП Арийская Людмила Руслановна, ИНН 231129240301, ОГРНИП 319619600052602</span>' +
      '<span>' + t('Это прототип для обсуждения. Цены и характеристики взяты с сайтов салона на 02.11.2026, наличие показано для примера, заявки не отправляются.') + '</span>' +
      '<span>Прототип: Татьяна, 2026</span></div></div></footer>';

    var drawer = document.createElement('div');
    drawer.innerHTML =
      '<div class="drawer-bg" data-close-pick></div>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-label="Подборка материалов"><div class="drawer-head"><h2>Ваша подборка</h2><button class="close" type="button" data-close-pick aria-label="Закрыть"><i class="ti ti-x" aria-hidden="true"></i></button></div>' +
      '<div class="drawer-body" id="drawer-body"></div></aside>';
    document.body.appendChild(drawer);

    $('#burger').addEventListener('click', function () {
      var open = $('#nav').classList.toggle('open');
      this.setAttribute('aria-expanded', String(open));
    });
  }

  function renderDrawer() {
    var list = loadPick().map(byId).filter(Boolean);
    $('#drawer-body').innerHTML =
      '<p>' + t(list.length
        ? 'Менеджер проверит наличие, рассчитает количество и предложит альтернативы, если что-то не подойдёт. На сайте оплата не производится.'
        : 'Подборка пока пуста. Опишите задачу или приложите фото помещения: менеджер предложит материалы сам. На сайте оплата не производится.') + '</p>' +
      (list.length ? '<ul class="pick-list">' + list.map(function (it) {
        return '<li><span>' + t(it.name) + '<small>' + esc(it.brand) + ', от ' + money(it.price) + (it.unit ? ' / ' + esc(it.unit) : '') + '</small></span><button type="button" data-remove="' + it.id + '" aria-label="Убрать"><i class="ti ti-trash" aria-hidden="true"></i></button></li>';
      }).join('') + '</ul>' : '') +
      '<form class="form" id="pick-form">' +
      '<label>Ваше имя<input class="field" name="name" autocomplete="name" required></label>' +
      '<label>Телефон<input class="field" name="phone" type="tel" autocomplete="tel" placeholder="+7" required></label>' +
      '<label>Кто вы<select class="field" name="who"><option>Делаю ремонт для себя</option><option>Дизайнер или архитектор</option><option>Мастер или строительная компания</option></select></label>' +
      '<label>Что оформляете<textarea class="field" name="task" rows="3" placeholder="Например: спальня, акцентная стена за изголовьем"></textarea></label>' +
      '<label>Фото, чертёж или дизайн-проект<input class="field" name="file" type="file"></label>' +
      '<label class="check"><input type="checkbox" name="samples"> <span>Нужны образцы на объект</span></label>' +
      '<label class="check"><input type="checkbox" name="ok" required> <span>Даю согласие на обработку персональных данных</span></label>' +
      '<button class="btn" type="submit">Получить подборку материалов</button>' +
      '<small>' + t('Это прототип: заявка никуда не отправляется.') + '</small>' +
      '</form>';
  }

  function syncPick() {
    var n = loadPick().length;
    var counter = $('#pick-n');
    if (counter) counter.textContent = n;
    $$('[data-pick]').forEach(function (b) {
      var on = inPick(b.dataset.pick);
      b.classList.toggle('is-added', on);
      b.innerHTML = on
        ? '<i class="ti ti-check" aria-hidden="true"></i>В подборке'
        : '<i class="ti ti-plus" aria-hidden="true"></i>В подборку';
    });
    if (document.documentElement.classList.contains('drawer-open')) renderDrawer();
  }

  function openPick() {
    renderDrawer();
    document.documentElement.classList.add('drawer-open');
    $('.drawer .close').focus();
  }
  function closePick() { document.documentElement.classList.remove('drawer-open'); }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-pick],[data-open-pick],[data-close-pick],[data-remove]');
    if (!el) return;
    if (el.dataset.pick) togglePick(el.dataset.pick);
    else if (el.hasAttribute('data-open-pick')) openPick();
    else if (el.hasAttribute('data-close-pick')) closePick();
    else if (el.dataset.remove) togglePick(el.dataset.remove);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePick(); });
  document.addEventListener('submit', function (e) {
    if (e.target.id !== 'pick-form') return;
    e.preventDefault();
    savePick([]);
    syncPick();
    $('#drawer-body').innerHTML = '<div class="done"><i class="ti ti-circle-check" aria-hidden="true"></i><h3>Спасибо!</h3><p>' + t('В готовом сайте заявка ушла бы менеджеру. Сейчас это прототип, поэтому ничего не отправлено.') + '</p></div>';
  });

  function card(it) {
    return '<article class="card reveal"><a class="ph-box" href="item.html?id=' + it.id + '" aria-label="' + esc(it.name) + '"><div class="ph ' + it.tone + '"><span>' + t('Нужно фото: ' + it.shot) + '</span></div></a>' +
      '<div class="body"><span class="brand">' + esc(it.brand) + '</span><h3><a href="item.html?id=' + it.id + '">' + t(it.name) + '</a></h3><p class="line">' + t(it.line) + '</p>' +
      '<div class="meta"><span class="price">' + priceHtml(it) + '</span>' + stockHtml(it) + '</div>' +
      '<button class="btn ghost" type="button" data-pick="' + it.id + '"></button></div></article>';
  }

  /* ───── главная ───── */
  function initHome() {
    var cats = $('#cats');
    if (cats) {
      cats.innerHTML = SECTIONS.map(function (s) {
        var ex = byId(s.example);
        return '<a class="cat reveal" href="catalog.html?s=' + s.id + '"><i class="ti ' + s.icon + '" aria-hidden="true"></i><h3>' + t(s.title) + '</h3><p>' + t(s.fact) + '</p><span class="from">' + t(ex.name) + ': от ' + money(ex.price) + (ex.unit ? ' / ' + esc(ex.unit) : '') + '</span></a>';
      }).join('') + '<a class="cat all reveal" href="catalog.html"><i class="ti ti-arrow-right" aria-hidden="true"></i><div><h3>Весь каталог</h3><p>' + t('Более 84 000 позиций от более чем 90 брендов') + '</p></div></a>';
    }
    var picks = $('#picks');
    if (picks) picks.innerHTML = ['bamboo', 'gelios', 'silviya', 'frost', 'charmant', 'novelreg'].map(byId).map(card).join('');
    var rev = $('#reviews');
    if (rev) rev.innerHTML = REVIEWS.map(function (r) {
      return '<figure class="review reveal" style="margin:0"><blockquote>' + t(r.text) + '</blockquote><figcaption><b>' + t(r.name) + '</b><small>' + t(r.role) + ', отзыв с ' + esc(r.src) + '</small></figcaption></figure>';
    }).join('');
    var art = $('#articles');
    if (art) art.innerHTML = ARTICLES.map(function (a) {
      return '<a class="article-card reveal" href="article.html?id=' + a.id + '"><h3>' + t(a.title) + '</h3><p>' + t(a.lead) + '</p><span>Читать совет</span></a>';
    }).join('');

    /* «открыто сейчас» по времени Ростова */
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    function part(type) { return parts.filter(function (p) { return p.type === type; })[0].value; }
    var minutes = Number(part('hour')) * 60 + Number(part('minute'));
    var close = /Sat|Sun/.test(part('weekday')) ? 17 * 60 : 19 * 60;
    var open = minutes >= 600 && minutes < close;
    $$('[data-open-now]').forEach(function (el) {
      el.classList.toggle('open', open);
      el.textContent = open ? 'Сейчас открыто, до ' + (close / 60) + ':00' : 'Сейчас закрыто, откроемся в 10:00';
    });
  }

  /* ───── каталог ───── */
  function initCatalog() {
    var box = $('#cat-grid');
    if (!box) return;
    var state = { s: section(param('s')) ? param('s') : 'all', q: '', brand: 'all', paint: false };
    var brands = ITEMS.map(function (i) { return i.brand; }).filter(function (b, i, a) { return a.indexOf(b) === i; }).sort();
    $('#f-brand').innerHTML = '<option value="all">Все бренды</option>' + brands.map(function (b) { return '<option>' + esc(b) + '</option>'; }).join('');
    $('#chips').innerHTML = [{ id: 'all', title: 'Все разделы' }].concat(SECTIONS).map(function (s) {
      return '<button class="chip" type="button" data-s="' + s.id + '">' + t(s.title) + '</button>';
    }).join('');

    function draw() {
      var q = state.q.trim().toLowerCase();
      var list = ITEMS.filter(function (it) {
        return (state.s === 'all' || it.s === state.s) &&
          (state.brand === 'all' || it.brand === state.brand) &&
          (!state.paint || it.paint) &&
          (!q || (it.name + ' ' + it.brand + ' ' + it.line).toLowerCase().indexOf(q) >= 0);
      });
      $$('.chip').forEach(function (c) { c.classList.toggle('on', c.dataset.s === state.s); });
      $('#f-count').textContent = 'Показано: ' + list.length + ' из ' + ITEMS.length;
      box.innerHTML = list.map(card).join('');
      $('#cat-empty').hidden = list.length > 0;
      syncPick();
      watchReveal();
    }
    $('#chips').addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (c) { state.s = c.dataset.s; draw(); }
    });
    $('#f-q').addEventListener('input', function () { state.q = this.value; draw(); });
    $('#f-brand').addEventListener('change', function () { state.brand = this.value; draw(); });
    $('#f-paint').addEventListener('change', function () { state.paint = this.checked; draw(); });
    $('#f-reset').addEventListener('click', function () {
      state = { s: 'all', q: '', brand: 'all', paint: false };
      $('#f-q').value = ''; $('#f-brand').value = 'all'; $('#f-paint').checked = false;
      draw();
    });
    draw();
  }

  /* ───── карточка ───── */
  function initItem() {
    var box = $('#item');
    if (!box) return;
    var it = byId(param('id')) || ITEMS[0];
    var sec = section(it.s);
    var pair = PAIRS[it.s];
    document.title = it.name + ' — МАРТдекор';
    var host = it.src.indexOf('martdecor.ru') >= 0 ? 'martdecor.ru' : 'martdecor.online';
    box.innerHTML =
      '<div class="crumbs"><a href="index.html">Главная</a> / <a href="catalog.html">Каталог</a> / <a href="catalog.html?s=' + sec.id + '">' + t(sec.title) + '</a></div>' +
      '<div class="item"><div class="ph ' + it.tone + '"><span>' + t('Нужно фото: ' + it.shot) + '</span></div><div>' +
      '<span class="brand">' + esc(it.brand) + '</span><h1>' + t(it.name) + '</h1><p class="line">' + t(it.line) + '</p>' +
      '<div class="buy"><span class="price">' + priceHtml(it) + '</span><button class="btn" type="button" data-pick="' + it.id + '"></button><button class="btn ghost" type="button" data-open-pick>Запросить образец</button><div style="width:100%">' + stockHtml(it) + '</div></div>' +
      '<table class="specs"><tbody>' + it.specs.map(function (r) { return '<tr><th scope="row">' + t(r[0]) + '</th><td>' + t(r[1]) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<div class="lists"><div><h3>Плюсы</h3><ul>' + it.pros.map(function (p) { return '<li>' + t(p) + '</li>'; }).join('') + '</ul></div>' +
      (it.needs.length ? '<div><h3>Что потребует</h3><ul>' + it.needs.map(function (p) { return '<li>' + t(p) + '</li>'; }).join('') + '</ul></div>' : '') +
      '<div><h3>Где применяют</h3><p>' + t(it.fits) + '</p></div></div>' +
      '<p class="source">Данные с <a href="' + esc(it.src) + '" rel="noopener">карточки на ' + host + '</a>, 02.11.2026.</p></div></div>' +
      '<section class="section alt" style="margin:0 calc(50% - 50vw);padding-left:calc(50vw - 50%);padding-right:calc(50vw - 50%)"><div class="head"><div><div class="eyebrow">С этим сочетают</div><h2>' + t(section(pair.to).title) + '</h2></div><p>' + t(pair.text) + '</p></div><div class="grid">' +
      ITEMS.filter(function (i) { return i.s === pair.to; }).slice(0, 3).map(card).join('') + '</div></section>';
  }

  /* ───── статья ───── */
  function initArticle() {
    var box = $('#article');
    if (!box) return;
    var a = ARTICLES.filter(function (x) { return x.id === param('id'); })[0] || ARTICLES[0];
    document.title = a.title + ' — МАРТдекор';
    box.innerHTML =
      '<div class="crumbs"><a href="index.html">Главная</a> / <a href="index.html#sovety">Советы</a></div><h1>' + t(a.title) + '</h1><p class="lead">' + t(a.lead) + '</p>' +
      '<ol>' + a.body.map(function (b) { return '<li><div><h3>' + t(b[0]) + '</h3><p>' + t(b[1]) + '</p></div></li>'; }).join('') + '</ol>' +
      '<p class="source" style="margin:24px 0 28px">Из <a href="' + esc(a.src) + '" rel="noopener">поста салона ВКонтакте</a>, ' + t(a.date) + '.</p>' +
      '<button class="btn" type="button" data-open-pick>Получить подборку материалов</button>';
  }

  /* появление при прокрутке */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -40px' }) : null;
  function watchReveal() {
    $$('.reveal:not(.seen)').forEach(function (el) { if (io) io.observe(el); else el.classList.add('seen'); });
  }

  renderChrome();
  initHome();
  initCatalog();
  initItem();
  initArticle();
  syncPick();
  watchReveal();
})();
