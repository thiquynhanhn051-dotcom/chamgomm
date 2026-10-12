/* CHẠM GỐM — main.js */
(function () {
  'use strict';
  const D = window.CG, A = window.ART;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const vnd = (n) => n.toLocaleString('vi-VN') + 'đ';
  const fmtDate = (s) => s.split('-').reverse().join('/');
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const I = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-4 3-6 6.5-6s6 2 6.5 6M16 4.5a3.5 3.5 0 010 7M18 14c2 .6 3.3 2.4 3.5 6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    cert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/></svg>',
    flower: '<svg viewBox="0 0 40 40" aria-hidden="true">' + A.flower(20, 20, 9, 'currentColor', 'transparent') + '</svg>'
  };

  /* ---------- helpers ---------- */
  const store = (k, v) => { try { const a = JSON.parse(localStorage.getItem(k) || '[]'); a.push(v); localStorage.setItem(k, JSON.stringify(a)); } catch (e) { /* bỏ qua */ } };
  const toastEl = $('#toast'); let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 3400); }

  const CART_KEY = 'cg_cart';
  const cartToggle = $('#cartToggle');
  const cartPanel = $('#cartPanel');
  const cartList = $('#cartList');
  const cartTotal = $('#cartTotal');
  const cartCount = $('#cartCount');

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveCart(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
  }
  function updateCartUI() {
    const items = getCart();
    const totals = items.reduce((acc, item) => {
      const product = prodById(item.id);
      if (!product) return acc;
      acc.count += item.qty;
      acc.total += item.qty * product.price;
      return acc;
    }, { count: 0, total: 0 });

    cartCount.textContent = String(totals.count || 0);
    cartCount.style.display = totals.count ? 'grid' : 'none';
    cartTotal.textContent = vnd(totals.total || 0);

    if (!items.length) {
      cartList.innerHTML = `<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h2l2.4 10.2a1 1 0 001 .8h8.9a1 1 0 001-.8L20 7H7"/><circle cx="10" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg><div><strong>Giỏ hàng trống</strong><p>Chọn những món gốm bạn thích để lưu lại.</p></div></div>`;
      return;
    }

    cartList.innerHTML = items.map((item) => {
      const product = prodById(item.id);
      if (!product) return '';
      return `<div class="cart-item">
        <div class="thumb" style="background:${A.col(product.bg)}">${A.pot(product.type, Object.assign({ label: product.name }, product))}</div>
        <div class="meta">
          <strong>${esc(product.name)}</strong>
          <small>${vnd(product.price)}</small>
          <div class="qty">
            <button class="cart-qty-btn" data-cart-qty="${product.id}" data-cart-delta="-1" aria-label="Giảm số lượng">−</button>
            <span class="cart-qty-value">${item.qty}</span>
            <button class="cart-qty-btn" data-cart-qty="${product.id}" data-cart-delta="1" aria-label="Tăng số lượng">+</button>
          </div>
          <button class="remove" data-cart-remove="${product.id}">Xóa</button>
        </div>
        <div class="price" style="font-size:1rem;align-self:center">${vnd(item.qty * product.price)}</div>
      </div>`;
    }).join('');
  }
  function addToCart(productId, qty) {
    const items = getCart();
    const nextQty = Number(qty || 1);
    const existing = items.find((item) => item.id === productId);
    if (existing) existing.qty += nextQty;
    else items.push({ id: productId, qty: nextQty });
    saveCart(items);
    updateCartUI();
    openCart(true);
    const product = prodById(productId);
    toast(product ? `Đã thêm “${product.name}” vào giỏ quà.` : 'Đã thêm sản phẩm vào giỏ quà.');
  }
  function changeCartQty(productId, delta) {
    const items = getCart();
    const match = items.find((item) => item.id === productId);
    if (!match) return;
    match.qty += Number(delta || 0);
    if (match.qty <= 0) {
      const next = items.filter((item) => item.id !== productId);
      saveCart(next);
      updateCartUI();
      return;
    }
    saveCart(items);
    updateCartUI();
  }
  function removeFromCart(productId) {
    const items = getCart().filter((item) => item.id !== productId);
    saveCart(items);
    updateCartUI();
    toast('Đã xóa sản phẩm khỏi giỏ hàng.');
  }
  function clearCart() {
    saveCart([]);
    updateCartUI();
    toast('Giỏ hàng đã được xóa.');
  }
  function openCart(open) {
    cartPanel.classList.toggle('open', open);
    cartPanel.setAttribute('aria-hidden', String(!open));
    cartToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('lock', open);
  }

  const all = [...D.village, ...D.lab];
  const artById = (id) => all.find((a) => a.id === id);
  const wsById = (id) => D.workshops.find((w) => w.id === id);
  const courseById = (id) => D.courses.find((c) => c.id === id);
  const prodById = (id) => D.products.find((p) => p.id === id);
  const projById = (id) => D.projects.find((p) => p.id === id);
  const artSeed = (a) => a.seed + (a.id.length % 4);
  const articleCover = (a, wide) => a.thumb
    ? `<img class="article-cover-image${wide ? ' article-cover-image--wide' : ''}" src="${esc(a.thumb.src)}" alt="${esc(a.thumb.alt)}" loading="lazy" decoding="async">`
    : A.cover(artSeed(a), { wide: !!wide });
  const stag = (i) => `style="--d:${(i % 4) * 90}ms"`;

  /* ---------- renderers ---------- */
  function artCard(a, i) {
    return `<article class="card art-card reveal" ${stag(i || 0)}>
      <div class="thumb">${articleCover(a, false)}</div>
      <div class="body"><span class="chip">${esc(a.tag)}</span>
      <h3><a class="stretch" href="#bai-${a.id}" data-article="${a.id}">${esc(a.title)}</a></h3>
      <p>${esc(a.excerpt)}</p>
      <div class="meta"><span>${fmtDate(a.date)}</span><span>${a.read} phút đọc</span><span>${esc(a.author)}</span></div></div></article>`;
  }

  function wsCard(w, opt) {
    opt = opt || {};
    const types = { 'cham-lan-dau': 'bowl', 'men-hoa-bien': 'vase', 've-gom': 'cup', 'tour-bat-trang': 'jar' };
    const cover = w.thumb
      ? `<img class="article-cover-image" src="${esc(w.thumb.src)}" alt="${esc(w.thumb.alt)}" loading="lazy" decoding="async">`
      : A.cover(w.seed + 1, { type: types[w.id], wide: !!opt.big });
    return `<article class="card ws-card ${opt.big ? 'ws-big' : ''} ${opt.reveal ? 'reveal' : ''}" ${stag(opt.i || 0)}>
      <div class="thumb">${cover}</div>
      <div class="body"><span class="chip" style="align-self:flex-start">${esc(w.level)}</span>
      <h3>${esc(opt.home ? w.short : w.name)}</h3><p>${esc(w.desc)}</p>
      <div class="ws-meta"><span>${I.clock}${esc(w.duration)}</span><span>${I.users}Tối đa ${w.seats} học viên</span></div>
      <div class="ws-foot"><div class="price">${vnd(w.price)}<small>/người</small></div>
      <button class="btn btn-wine btn-sm" data-register="${w.id}">Đăng ký</button></div></div></article>`;
  }

  function prodCard(p, i) {
    return `<article class="card prod reveal" data-cat="${esc(p.cat)}" ${stag(i)}>
      <div class="thumb" style="background:${A.col(p.bg)}">${p.limited ? `<span class="badge">${esc(p.limited)}</span>` : ''}${A.pot(p.type, Object.assign({ label: p.name }, p))}</div>
      <div class="body"><span class="cat">${esc(p.cat)}</span><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p>
      <div class="foot"><span class="price">${vnd(p.price)}</span>
        <div class="prod-actions">
          <button class="btn btn-ghost btn-sm" data-product="${p.id}">Xem chi tiết</button>
          <button class="btn btn-wine btn-sm" data-cart-add="${p.id}">Thêm</button>
        </div>
      </div></div></article>`;
  }

  function renderStatic() {
    $('#heroArt').innerHTML = A.heroArt();

    const items = ['Chạm vào đất', 'Chạm vào ký ức', 'Đất · Lửa · Bàn tay', 'Gốm Việt', 'Làng nghề còn đỏ lửa'];
    const seq = items.map((t) => `<span>${t}${I.flower}</span>`).join('');
    $('#marquee').innerHTML = seq + seq + seq + seq;

    const catPot = { blue: { a: 'wine', b: 'wine2', accent: 'ivory', deco: 'band' }, wine: { a: 'blue', b: 'blueSoft', accent: 'wine', deco: 'flower' }, paper: { a: 'blue', b: 'blueSoft', accent: 'wine', deco: 'flower' }, soft: { a: 'wine', b: 'wine2', accent: 'blue', deco: 'dots' }, wine2: { a: 'ivory', b: 'paper', accent: 'wine', deco: 'band' } };
    const categoryPhotos = {
      'chuyen-lang-gom': 'assets/chuyen-lang-gom-thumb.png',
      'tram-trai-nghiem': 'assets/tram-trai-nghiem-thumb.png',
      'nhat-ky-xuong-lo': 'assets/nhat-ky-xuong-lo-thumb.png',
      'gom-vi-cong-dong': 'assets/gom-vi-cong-dong-thumb.png'
    };
    $('#catGrid').innerHTML = D.categories.map((c, i) => {
      const photo = categoryPhotos[c.id];
      const art = photo
        ? `<img src="${photo}" alt="${esc(c.title)}" loading="lazy" decoding="async">`
        : A.pot(c.type, Object.assign({ label: c.title }, catPot[c.scheme]));
      const isPhotoCard = Boolean(photo);
      const experienceCard = c.id === 'tram-trai-nghiem';
      return `<a class="cat-card c-${c.scheme} ${isPhotoCard ? 'cat-card--photo' : ''} ${experienceCard ? 'cat-card--experience' : ''} reveal" href="${c.href}" ${stag(i)}>
        <span class="no">${c.no}</span><span class="go">${I.arrow}</span>
        <div class="art">${art}</div>
        <h3>${c.title}</h3><p>${c.desc}</p></a>`;
    }).join('');

    $('#homeRail').innerHTML = D.workshops.map((w, i) => wsCard(w, { home: true, i })).join('');
    $('#latestGrid').innerHTML = [...all].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map(artCard).join('');

    $('#aboutArt').innerHTML = '<img src="assets/about-potter-thumb.png" alt="Nghệ nhân và học viên cùng tạo hình gốm trên bàn xoay" loading="lazy" decoding="async">';

    // Shop
    $('#shopFilters').innerHTML = ['Tất cả', ...D.productCats].map((c, i) => `<button class="filter" aria-pressed="${i === 0}" data-filter="${i === 0 ? '' : esc(c)}">${esc(c)}</button>`).join('');
    $('#prodGrid').innerHTML = D.products.map(prodCard).join('');

    // Village
    const v = D.village;
    $('#villageLead').innerHTML = `<article class="card lead-story reveal"><div class="thumb">${A.cover(artSeed(v[0]), { type: 'vase', wide: true })}</div>
      <div class="body"><span class="chip">${esc(v[0].tag)} · Bài nổi bật</span><h3><a class="stretch" href="#bai-${v[0].id}" data-article="${v[0].id}">${esc(v[0].title)}</a></h3>
      <p>${esc(v[0].excerpt)}</p><div class="meta"><span>${fmtDate(v[0].date)}</span><span>${v[0].read} phút đọc</span><span>${esc(v[0].author)}</span></div></div></article>
      <div class="side-stack">${[v[1], v[2]].map((a, i) => `<article class="card mini reveal" ${stag(i + 1)}><div class="thumb">${A.cover(artSeed(a))}</div>
      <div class="body"><span class="chip" style="align-self:flex-start">${esc(a.tag)}</span><h3><a class="stretch" href="#bai-${a.id}" data-article="${a.id}">${esc(a.title)}</a></h3><div class="meta"><span>${a.read} phút đọc</span></div></div></article>`).join('')}</div>`;
    $('#villageGrid').innerHTML = v.slice(3).map(artCard).join('');

    // Experience
    $('#wsGrid').innerHTML = D.workshops.map((w, i) => wsCard(w, { big: true, reveal: true, i })).join('');
    $('#timeline').innerHTML = D.schedule.map((s, i) => {
      const w = wsById(s.ws), [y, m, d] = s.date.split('-');
      return `<li class="tl-item reveal" ${stag(i)}><div class="tl-date"><b>${d}/${m}</b><small>${y}</small></div>
        <div class="tl-info"><h4>${esc(w.name)}</h4><p>${s.time} · ${esc(w.place)}</p></div>
        <div class="tl-act"><span class="seats ${s.left <= 3 ? 'low' : ''}">Còn ${s.left} chỗ</span><button class="btn btn-wine btn-sm" data-register="${w.id}" data-date="${s.date}">Giữ chỗ</button></div></li>`;
    }).join('');
    $('#courseGrid').innerHTML = D.courses.map((c, i) => `<article class="card course reveal" ${stag(i)}>
      <div class="top"><div><span class="chip">${esc(c.level)}</span><h3 style="margin-top:10px">${esc(c.name)}</h3></div><span class="seats">${esc(c.length)}</span></div>
      <div><b style="font-family:var(--f-label);letter-spacing:.16em;text-transform:uppercase;font-size:.8rem">Lộ trình</b><ol class="path" style="margin-top:10px">${c.path.map((p) => `<li>${esc(p)}</li>`).join('')}</ol></div>
      <div class="teacher"><div class="av">${esc(c.teacher.split(' ').pop()[0])}</div><div><b>${esc(c.teacher)}</b><small>${esc(c.teacherRole)}</small></div></div>
      <div class="cert">${I.cert}<span>${esc(c.cert)}</span></div>
      <div class="foot"><div class="price">${vnd(c.fee)}<small>${esc(c.note || '/khóa')}</small></div><button class="btn btn-wine btn-sm" data-register="c:${c.id}">Đăng ký khóa học</button></div></article>`).join('');

    // Lab
    renderLab('');
    const pop = [...D.lab].sort((a, b) => b.views - a.views).slice(0, 5);
    $('#popList').innerHTML = pop.map((a, i) => `<li><span class="n">${i + 1}</span><div><a href="#bai-${a.id}" data-article="${a.id}">${esc(a.title)}</a><small>${a.views.toLocaleString('vi-VN')} lượt đọc</small></div></li>`).join('');
    $('#tagList').innerHTML = D.tagList.map((t) => `<button class="tag" aria-pressed="false" data-tag="${esc(t)}">#${esc(t)}</button>`).join('');
    renderRelated(D.lab[0]);

    // Community
    $('#impact').innerHTML = [[7, 'Dự án đang chạy', ''], [2720, 'Trẻ em được đồng hành', '+'], [120, 'Tình nguyện viên', '+'], [620, 'Triệu đồng gây quỹ', '']].map(([n, l, s]) => `<div class="reveal"><b data-count="${n}" data-suffix="${s}">0</b><span>${l}</span></div>`).join('');
    $('#projList').innerHTML = D.projects.map((p, i) => `<article class="proj reveal" id="${p.id}">
      <div class="proj-art">${p.thumb ? `<img src="${esc(p.thumb.src)}" alt="${esc(p.thumb.alt)}" loading="lazy" decoding="async">` : A.cover([1, 2, 3, 4, 6, 7, 8][i])}</div>
      <div><div class="no">0${i + 1}</div><span class="chip" style="background:var(--wine);color:var(--ivory)">${esc(p.tag)}</span>
      <h3>${esc(p.name)}</h3><p style="font-weight:600">${esc(p.lead)}</p><p class="story">${esc(p.story)}</p>
      <div class="res">${p.results.map((r) => `<div><b data-count="${r.n}">0</b><span>${esc(r.l)}</span></div>`).join('')}</div>
      <button class="btn btn-wine" data-join="${p.id}">Tham gia dự án ${I.arrow}</button></div></article>`).join('');

    $$('[data-flower]').forEach((e) => e.insertAdjacentHTML('afterbegin', I.flower));
  }

  function renderLab(tag) {
    const list = tag ? D.lab.filter((a) => a.tags.includes(tag)) : D.lab;
    $('#labList').innerHTML = list.length ? list.map((a, i) => `<article class="lab-item reveal in" ${stag(i)}>
      <div class="thumb">${articleCover(a, i === 0)}</div>
      <div><span class="lab-no">N° ${String(D.lab.indexOf(a) + 1).padStart(2, '0')} · ${esc(a.tag)} · ${a.read} phút đọc</span>
      <h3><a class="stretch" href="#bai-${a.id}" data-article="${a.id}">${esc(a.title)}</a></h3><p>${esc(a.excerpt)}</p></div></article>`).join('')
      : '<p class="empty">Chưa có bài viết với từ khóa này.</p>';
  }

  function renderRelated(a) {
    const tags = a.tags || [a.tag.toLowerCase()];
    let rel = all.filter((x) => x.id !== a.id && ((x.tags || []).some((t) => tags.includes(t)) || x.sec === a.sec));
    rel.sort((x, y) => ((y.tags || []).filter((t) => tags.includes(t)).length - (x.tags || []).filter((t) => tags.includes(t)).length) || y.views - x.views);
    $('#relList').innerHTML = rel.slice(0, 4).map((x) => `<li><a href="#bai-${x.id}" data-article="${x.id}">${esc(x.title)}</a></li>`).join('');
  }

  /* ---------- reveal / count / parallax ---------- */
  let io;
  function observe(root) {
    if (!io) {
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-count]', e.target).forEach(count);
        if (e.target.hasAttribute && e.target.hasAttribute('data-count')) count(e.target);
        io.unobserve(e.target);
      }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    }
    $$('.reveal:not(.in), .stat', root).forEach((el) => io.observe(el));
  }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = to.toLocaleString('vi-VN') + suf; return; }
    const t0 = performance.now(), dur = 1500;
    (function step(t) { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e).toLocaleString('vi-VN') + suf; if (p < 1) requestAnimationFrame(step); })(t0);
  }
  const par = $$('[data-parallax]');
  let ticking = false;
  const header = $('#header'), toTop = $('#toTop');
  function onScroll() {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    header.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 900);
    if (reduce) return;
    par.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const f = parseFloat(el.dataset.parallax), off = (r.top + r.height / 2 - vh / 2) * f;
      el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)${el.tagName === 'IMG' ? ' scale(1.12)' : ''}`;
    });
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- nav active ---------- */
  const navLinks = $$('.nav a');
  const secIds = navLinks.map((a) => a.dataset.nav);
  const navIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('active', a.dataset.nav === e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secIds.forEach((id) => { const s = document.getElementById(id); if (s) navIO.observe(s); });

  /* ---------- drawer ---------- */
  const drawer = $('#drawer'), burger = $('#openMenu');
  function menu(open) {
    drawer.classList.toggle('open', open); drawer.setAttribute('aria-hidden', !open);
    burger.setAttribute('aria-expanded', open); document.body.classList.toggle('lock', open);
  }
  burger.addEventListener('click', () => menu(true));
  $('#closeMenu').addEventListener('click', () => menu(false));
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('a')) menu(false);
    if (e.target.closest('[data-contact]')) burger.focus({ preventScroll: true });
    if (e.target.closest('[data-register]')) menu(false);
  });

  /* ---------- modal ---------- */
  const overlay = $('#overlay'), modal = $('#modal');
  const contact = $('#lien-he .contact'), contactParent = contact.parentNode;
  let lastFocus = null;
  let contactOpen = false;
  let contactReveals = [];
  function openModal(html, cls) {
    lastFocus = document.activeElement;
    modal.className = 'modal ' + (cls || ''); modal.innerHTML = html; modal.scrollTop = 0;
    overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
    setTimeout(() => modal.focus({ preventScroll: true }), 50);
  }
  function closeModal(fromPop) {
    if (!overlay.classList.contains('open')) return;
    overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true');
    if (contactOpen) {
      contactParent.append(contact);
      contactReveals.forEach(([el, wasVisible]) => el.classList.toggle('in', wasVisible));
      contactReveals = [];
      modal.removeAttribute('aria-label');
      contactOpen = false;
    }
    if (!drawer.classList.contains('open') && !$('#search').classList.contains('open')) document.body.classList.remove('lock');
    if (!fromPop && history.state && history.state.art) history.back();
    else if (!fromPop && location.hash.startsWith('#bai-')) history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target.closest('[data-close]')) closeModal(); });
  const closeBtn = '<button class="icon-btn m-close" data-close aria-label="Đóng">' + I.close + '</button>';
  function openContact() {
    openModal(closeBtn, 'contact-modal');
    modal.setAttribute('aria-label', 'Liên hệ CHẠM GỐM');
    contactReveals = [...contact.querySelectorAll('.reveal')].map((el) => [el, el.classList.contains('in')]);
    modal.append(contact);
    contactReveals.forEach(([el]) => el.classList.add('in'));
    contactOpen = true;
  }

  /* article */
  function openArticle(id, push) {
    const a = artById(id); if (!a) return;
    const paras = a.body.map((p) => `<p>${esc(p)}</p>`);
    let body;
    if (a.sections) {
      const video = a.video
        ? `<figure class="read-video"><div class="read-video-frame"><video src="${esc(a.video.src)}" title="${esc(a.video.title)}" controls playsinline preload="metadata" poster="${esc(a.thumb.src)}">Trình duyệt của bạn không hỗ trợ phát video HTML5.</video></div><figcaption>${esc(a.video.caption)}</figcaption></figure>`
        : '';
      body = paras.join('') + video + a.sections.map((section) => {
        const images = section.images || (section.image ? [section.image] : []);
        const figures = images.map((image) => `<figure class="read-figure"><img src="${esc(image.src)}" alt="${esc(image.alt)}" loading="lazy" decoding="async"><figcaption>${esc(image.caption)}</figcaption></figure>`).join('');
        const list = section.list ? `<ol class="read-list">${section.list.map((item) => `<li>${esc(item)}</li>`).join('')}</ol>` : '';
        return `<section class="read-section"><h3>${esc(section.title)}</h3>${section.body.map((p, index) => `${index === 1 && images.length ? figures : ''}<p>${esc(p)}</p>`).join('')}${section.body.length < 2 ? figures : ''}${list}${section.quote ? `<blockquote class="pull">“${esc(section.quote)}”</blockquote>` : ''}${section.table ? `<div class="read-table-wrap" role="region" aria-label="${esc(section.table.label)}" tabindex="0"><table class="read-table"><thead><tr>${section.table.headers.map((heading) => `<th scope="col">${esc(heading)}</th>`).join('')}</tr></thead><tbody>${section.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}</section>`;
      }).join('');
    } else {
      body = paras[0] + `<blockquote class="pull">“${esc(a.quote)}”</blockquote>` + paras.slice(1).join('');
    }
    if (a.facts) body += `<dl class="facts">${a.facts.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>`;
    const tags = a.tags || [a.tag.toLowerCase()];
    const rel = all.filter((x) => x.id !== a.id && ((x.tags || []).some((t) => tags.includes(t)) || x.sec === a.sec)).slice(0, 3);
    openModal(`${closeBtn}<div class="read-cover">${articleCover(a, true)}</div><article class="read-body">
      <span class="chip">${esc(a.tag)}</span><h2>${esc(a.title)}</h2>
      <div class="meta"><span>Bởi ${esc(a.author)}</span><span>${fmtDate(a.date)}</span><span>${a.read} phút đọc</span><span>${a.views.toLocaleString('vi-VN')} lượt đọc</span></div>
      ${body}
      <div class="read-more"><h3>Đọc tiếp</h3>${rel.map((x) => `<a href="#bai-${x.id}" data-article="${x.id}">${esc(x.title)}</a>`).join('')}</div></article>`, 'read');
    if (a.sec === 'lab') renderRelated(a);
    if (push !== false) history.pushState({ art: id }, '', '#bai-' + id);
  }

  /* product */
  function openProduct(id) {
    const p = prodById(id); if (!p) return;
    const food = ['teapot', 'cup', 'bowl'].includes(p.type);
    openModal(`${closeBtn}<div class="m-grid"><div class="m-art" style="background:${A.col(p.bg)}">${A.pot(p.type, Object.assign({ label: p.name }, p))}</div>
      <div class="m-body"><span class="chip" style="justify-self:start">${esc(p.limited || p.cat)}</span><h2>${esc(p.name)}</h2><div class="price" style="font-size:1.7rem">${vnd(p.price)}</div>
      <p>${esc(p.short)} Mỗi sản phẩm được nặn, phủ men và nung thủ công tại xưởng CHẠM GỐM, vì vậy màu sắc và dáng có thể khác nhau đôi chút giữa các món.</p>
      <dl class="specs"><div><dt>Danh mục</dt><dd>${esc(p.cat)}</dd></div><div><dt>Kích thước</dt><dd>${esc(p.size)}</dd></div><div><dt>Chất liệu</dt><dd>Đất sét tuyển chọn, men thủ công</dd></div><div><dt>Bảo quản</dt><dd>${food ? 'Rửa tay nhẹ, tránh sốc nhiệt' : 'Lau khô, tránh va đập'}</dd></div></dl>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-wine" data-addcart="${p.id}">Thêm vào giỏ quà</button><a class="btn btn-ghost" href="#lien-he" data-close data-contact>Hỏi thêm</a></div></div></div>`);
  }

  /* forms */
  const fld = (id, label, extra) => `<div class="field"><label for="${id}">${label}</label>${extra}<span class="msg"></span></div>`;
  function validate(form) {
    let ok = true;
    $$('.field', form).forEach((f) => {
      const inp = $('input,select,textarea', f); if (!inp) return;
      let m = '', v = inp.value.trim();
      if (inp.required && !v) m = 'Vui lòng điền thông tin này.';
      else if (inp.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) m = 'Email chưa đúng định dạng.';
      else if (inp.type === 'tel' && v && !/^(\+84|0)\d{9,10}$/.test(v.replace(/[\s.-]/g, ''))) m = 'Số điện thoại chưa hợp lệ.';
      f.classList.toggle('err', !!m); $('.msg', f).textContent = m; if (m) ok = false;
    });
    return ok;
  }
  const successView = (title, text) => `${closeBtn}<div class="success"><svg viewBox="0 0 100 100">${A.flower(50, 50, 38, A.C.blue, A.C.wine)}</svg><h2 class="sec-title" style="font-size:2.2rem">${title}</h2><p>${text}</p><button class="btn btn-wine" data-close>Đóng</button></div>`;

  function openRegister(sel, date) {
    const ws = D.workshops.map((w) => `<option value="${w.id}">${esc(w.name)} — ${vnd(w.price)}</option>`).join('');
    const cs = D.courses.map((c) => `<option value="c:${c.id}">${esc(c.name)} — ${vnd(c.fee)}</option>`).join('');
    openModal(`${closeBtn}<form class="m-body" id="regForm" novalidate><span class="eyebrow">${I.flower}Đăng ký tham gia</span><h2>Giữ chỗ của bạn</h2>
      <p style="opacity:.85">Điền thông tin, chúng tôi sẽ gọi xác nhận trong vòng 24 giờ.</p>
      ${fld('r-prog', 'Chương trình', `<select id="r-prog" name="prog"><optgroup label="Workshop">${ws}</optgroup><optgroup label="Khóa học">${cs}</optgroup></select>`)}
      ${fld('r-date', 'Ngày tham gia', '<select id="r-date" name="date"></select>')}
      <div class="row2">${fld('r-name', 'Họ và tên', '<input id="r-name" name="name" autocomplete="name" required>')}${fld('r-phone', 'Số điện thoại', '<input id="r-phone" name="phone" type="tel" autocomplete="tel" required>')}</div>
      <div class="row2">${fld('r-email', 'Email', '<input id="r-email" name="email" type="email" autocomplete="email" required>')}${fld('r-n', 'Số người tham gia', '<select id="r-n" name="n">' + [1, 2, 3, 4, 5, 6].map((n) => `<option>${n}</option>`).join('') + '</select>')}</div>
      ${fld('r-note', 'Ghi chú (không bắt buộc)', '<textarea id="r-note" name="note" rows="2"></textarea>')}
      <button class="btn btn-wine" type="submit" style="justify-self:start">Gửi đăng ký</button></form>`, 'narrow');
    const form = $('#regForm'), prog = $('#r-prog'), dsel = $('#r-date');
    if (sel) prog.value = sel;
    const upd = () => {
      const v = prog.value;
      if (v.startsWith('c:')) dsel.innerHTML = '<option value="">Chúng tôi sẽ liên hệ xếp lịch khai giảng</option>';
      else dsel.innerHTML = D.schedule.filter((s) => s.ws === v).map((s) => `<option value="${s.date}">${fmtDate(s.date)} · ${s.time} (còn ${s.left} chỗ)</option>`).join('') || '<option value="">Chưa có lịch, chúng tôi sẽ liên hệ</option>';
    };
    upd(); if (date) dsel.value = date;
    prog.addEventListener('change', upd);
    form.addEventListener('submit', (e) => {
      e.preventDefault(); if (!validate(form)) return;
      const f = Object.fromEntries(new FormData(form).entries());
      const name = prog.selectedOptions[0].textContent.split(' — ')[0];
      store('cg_registrations', f);
      modal.innerHTML = successView(`Cảm ơn ${esc(f.name)}!`, `Chúng tôi đã nhận đăng ký <b>${esc(name)}</b> cho ${esc(f.n)} người${f.date ? ' ngày ' + fmtDate(f.date) : ''}. CHẠM GỐM sẽ gọi cho bạn qua số ${esc(f.phone)} để xác nhận.`);
    });
  }

  function openJoin(id) {
    const p = projById(id); if (!p) return;
    openModal(`${closeBtn}<form class="m-body" id="joinForm" novalidate><span class="eyebrow">${I.flower}Gốm Vì Cộng Đồng</span><h2>Tham gia “${esc(p.name)}”</h2>
      <p style="opacity:.85">${esc(p.lead)}</p>
      <div class="row2">${fld('j-name', 'Họ và tên', '<input id="j-name" name="name" required autocomplete="name">')}${fld('j-email', 'Email', '<input id="j-email" name="email" type="email" required autocomplete="email">')}</div>
      ${fld('j-role', 'Bạn muốn đồng hành theo cách nào?', '<select id="j-role" name="role"><option>Làm tình nguyện viên</option><option>Quyên tặng gốm / dụng cụ</option><option>Đóng góp tài chính</option><option>Kết nối trường học / tổ chức</option><option>Lan tỏa dự án</option></select>')}
      ${fld('j-msg', 'Lời nhắn (không bắt buộc)', '<textarea id="j-msg" name="msg" rows="3"></textarea>')}
      <button class="btn btn-wine" type="submit" style="justify-self:start">Gửi đăng ký tham gia</button></form>`, 'narrow');
    const form = $('#joinForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault(); if (!validate(form)) return;
      const f = Object.fromEntries(new FormData(form).entries());
      store('cg_join', Object.assign({ project: id }, f));
      modal.innerHTML = successView('Cảm ơn bạn đã chạm tay!', `Chúng tôi sẽ gửi thông tin chi tiết về dự án “${esc(p.name)}” tới ${esc(f.email)} trong thời gian sớm nhất.`);
    });
  }

  /* ---------- search ---------- */
  const searchEl = $('#search'), sInput = $('#searchInput'), sRes = $('#searchRes'), sHint = $('#searchHint');
  const sIndex = [
    ...D.products.map((p) => ({ k: 'Sản phẩm', t: p.name, s: p.cat + ' · ' + vnd(p.price), x: p.name + ' ' + p.cat + ' ' + p.short, run: () => openProduct(p.id) })),
    ...all.map((a) => ({ k: 'Bài viết', t: a.title, s: a.tag + ' · ' + a.read + ' phút đọc', x: a.title + ' ' + a.tag + ' ' + a.excerpt + ' ' + (a.tags || []).join(' '), run: () => openArticle(a.id) })),
    ...D.workshops.map((w) => ({ k: 'Workshop', t: w.name, s: w.duration + ' · ' + vnd(w.price), x: w.name + ' ' + w.desc, run: () => openRegister(w.id) })),
    ...D.courses.map((c) => ({ k: 'Khóa học', t: c.name, s: c.length + ' · ' + vnd(c.fee), x: c.name + ' ' + c.teacher + ' ' + c.path.join(' '), run: () => openRegister('c:' + c.id) })),
    ...D.projects.map((p) => ({ k: 'Dự án', t: p.name, s: p.tag, x: p.name + ' ' + p.lead, run: () => { const el = document.getElementById(p.id); el && el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }))
  ];
  sIndex.forEach((i) => { i.n = norm(i.x + ' ' + i.t); });
  let sCur = [];
  function doSearch() {
    const q = norm(sInput.value.trim()); sRes.innerHTML = '';
    if (!q) { sHint.textContent = 'Gợi ý: “men”, “Bát Tràng”, “bộ trà”, “trẻ em”…'; sCur = []; return; }
    const toks = q.split(/\s+/);
    sCur = sIndex.filter((i) => toks.every((t) => i.n.includes(t))).slice(0, 12);
    sHint.textContent = sCur.length ? `${sCur.length} kết quả` : 'Không tìm thấy kết quả phù hợp. Hãy thử từ khóa khác.';
    sRes.innerHTML = sCur.map((i, n) => `<button class="res-item" data-res="${n}"><span class="chip">${i.k}</span><span><b>${esc(i.t)}</b><small>${esc(i.s)}</small></span></button>`).join('');
  }
  function openSearch(open) {
    searchEl.classList.toggle('open', open); searchEl.setAttribute('aria-hidden', !open); document.body.classList.toggle('lock', open);
    if (open) setTimeout(() => sInput.focus(), 300);
  }
  cartToggle.addEventListener('click', () => openCart(!cartPanel.classList.contains('open')));
  $('#closeCart').addEventListener('click', () => openCart(false));
  $('#checkoutCart').addEventListener('click', () => { openCart(false); openContact(); });
  $('#clearCart').addEventListener('click', clearCart);
  $('#openSearch').addEventListener('click', () => openSearch(true));
  $('#closeSearch').addEventListener('click', () => openSearch(false));
  sInput.addEventListener('input', doSearch);
  sInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && sCur[0]) { openSearch(false); sCur[0].run(); } });
  sRes.addEventListener('click', (e) => { const b = e.target.closest('[data-res]'); if (b) { const it = sCur[+b.dataset.res]; openSearch(false); setTimeout(it.run, 350); } });

  /* ---------- delegated clicks ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    let el;
    if ((el = t.closest('[data-contact]'))) { e.preventDefault(); openContact(); return; }
    if ((el = t.closest('[data-article]'))) { e.preventDefault(); openArticle(el.dataset.article); return; }
    if ((el = t.closest('[data-product]'))) { openProduct(el.dataset.product); return; }
    if ((el = t.closest('[data-register]'))) { openRegister(el.dataset.register, el.dataset.date); return; }
    if ((el = t.closest('[data-join]'))) { openJoin(el.dataset.join); return; }
    if ((el = t.closest('[data-cart-add]')) || (el = t.closest('[data-addcart]'))) {
      const productId = el.dataset.cartAdd || el.dataset.addcart;
      addToCart(productId, 1); if (overlay.classList.contains('open')) closeModal();
      return;
    }
    if ((el = t.closest('[data-cart-remove]'))) { removeFromCart(el.dataset.cartRemove); return; }
    if ((el = t.closest('[data-cart-qty]'))) { changeCartQty(el.dataset.cartQty, Number(el.dataset.cartDelta || 0)); return; }
    if ((el = t.closest('[data-filter]'))) {
      const f = el.dataset.filter;
      $$('#shopFilters .filter').forEach((b) => b.setAttribute('aria-pressed', b === el));
      $$('#prodGrid .prod').forEach((c) => { const show = !f || c.dataset.cat === f; c.classList.toggle('hide', !show); if (show) c.classList.add('in'); });
      return;
    }
    if ((el = t.closest('[data-tag]'))) {
      const on = el.getAttribute('aria-pressed') === 'true';
      $$('#tagList .tag').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      if (!on) el.setAttribute('aria-pressed', 'true');
      renderLab(on ? '' : el.dataset.tag); return;
    }
    if ((el = t.closest('[data-rail]'))) {
      const rail = $('#homeRail'), card = rail.querySelector('.ws-card');
      rail.scrollBy({ left: (+el.dataset.rail) * (card.offsetWidth + 22), behavior: 'smooth' }); return;
    }
    if (t.closest('#toTop')) window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* tabs */
  const tabs = $$('.tab');
  function selectTab(tab) {
    tabs.forEach((b) => { const on = b === tab; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; $('#' + b.getAttribute('aria-controls')).hidden = !on; });
    observe($('#' + tab.getAttribute('aria-controls')));
  }
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => selectTab(b));
    b.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; selectTab(n); n.focus(); }
    });
  });

  /* contact & newsletter */
  const cf = $('#contactForm');
  cf.addEventListener('submit', (e) => { e.preventDefault(); if (!validate(cf)) return; store('cg_contact', Object.fromEntries(new FormData(cf).entries())); cf.reset(); toast('Cảm ơn bạn! CHẠM GỐM sẽ phản hồi trong 1–2 ngày làm việc.'); });
  $('#newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('#news-email'), msg = $('#newsMsg'), v = inp.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { msg.textContent = 'Vui lòng nhập email hợp lệ.'; inp.focus(); return; }
    store('cg_news', v); inp.value = ''; msg.textContent = 'Đã đăng ký! Bản tin đầu tiên sẽ đến hộp thư của bạn.'; toast('Đăng ký bản tin thành công.');
  });

  /* keyboard + history */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (overlay.classList.contains('open')) closeModal();
    else if (searchEl.classList.contains('open')) openSearch(false);
    else if (drawer.classList.contains('open')) menu(false);
    else if (cartPanel.classList.contains('open')) openCart(false);
  });
  window.addEventListener('popstate', () => {
    if (overlay.classList.contains('open') && !(history.state && history.state.art)) closeModal(true);
    else if (location.hash.startsWith('#bai-')) openArticle(location.hash.slice(5), false);
  });

  /* ---------- init ---------- */
  renderStatic();
  updateCartUI();
  const pageId = new URLSearchParams(location.search).get('trang');
  const pageTitles = {
    'tiem-gom': 'Tiệm Gốm',
    'chuyen-lang-gom': 'Chuyện Làng Gốm',
    'tram-trai-nghiem': 'Trạm Trải Nghiệm',
    'nhat-ky-xuong-lo': 'Nhật Ký Xưởng Lò',
    'gom-vi-cong-dong': 'Gốm Vì Cộng Đồng'
  };
  const page = pageTitles[pageId] && document.getElementById(pageId);
  if (page) {
    document.body.classList.add('page-view');
    page.classList.add('page-current');
    document.title = pageTitles[pageId] + ' — CHẠM GỐM';
    navLinks.forEach((a) => a.classList.toggle('active', a.dataset.nav === pageId));
  }
  observe(document);
  onScroll();
  if (location.hash.startsWith('#bai-')) openArticle(location.hash.slice(5), false);
})();
