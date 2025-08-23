/* =======================================================
   Cart logic (front-end only) — requires app.js (window.BH)
   - Per-user cart: localStorage["bh_cart_<email>"]
   - Coupons: SAVE10 (10% off subtotal), FREESHIP (free shipping)
   - Tax: 10%
   ======================================================= */

(function(){
  'use strict';
  const TAX_RATE = 0.10;
  const SHIP_STANDARD = 5.99;
  const SHIP_EXPRESS  = 14.99;

  if (!window.BH) {
    console.error('Missing app.js (BH). Load app.js before cart.js');
    return;
  }

  // DOM
  const loginGate  = document.getElementById('loginGate');
  const cartLayout = document.getElementById('cartLayout');
  const itemsList  = document.getElementById('itemsList');
  const emptyState = document.getElementById('emptyState');
  const recsWrap   = document.getElementById('recs');
  const recsGrid   = document.getElementById('recsGrid');

  const couponInput = document.getElementById('couponCode');
  const applyCoupon = document.getElementById('applyCoupon');
  const shipMethod  = document.getElementById('shipMethod');

  const sumSubtotal = document.getElementById('sumSubtotal');
  const sumDiscount = document.getElementById('sumDiscount');
  const sumShipping = document.getElementById('sumShipping');
  const sumTax      = document.getElementById('sumTax');
  const sumTotal    = document.getElementById('sumTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const toTop = document.getElementById('toTop');

  // Session check
  const session = BH.getSession();
  if (!session) {
    loginGate.hidden = false;
    cartLayout.hidden = true;
    return;
  } else {
    loginGate.hidden = true;
    cartLayout.hidden = false;
  }

  // --- State ---
  let items = BH.getCart(session.email);         // [{id,title,price,img,qty}]
  let coupon = loadCoupon() || '';               // 'SAVE10' | 'FREESHIP' | ''

  // Prefill coupon input if any
  if (couponInput) couponInput.value = coupon;

  // --- Rendering ---
  function fmt(n){ return `$${n.toFixed(2)}`; }

  function renderItems(){
    itemsList.setAttribute('aria-busy','true');

    if (!items.length) {
      itemsList.innerHTML = '';
      emptyState.hidden = false;
      recsWrap.hidden = false;
      renderRecs();
    } else {
      emptyState.hidden = true;
      recsWrap.hidden = false; // can still show
      itemsList.innerHTML = items.map(itemTpl).join('');
    }

    bindItemEvents();
    recalc();
    itemsList.setAttribute('aria-busy','false');
  }

  function itemTpl(it){
    const line = it.price * it.qty;
    return `
      <li class="item" data-id="${it.id}">
        <img class="cover" src="${it.img}" alt="${it.title} cover">
        <div>
          <h3 class="title">${it.title}</h3>
          <p class="author">${it.author || ''}</p>
          ${it.genre ? `<span class="chip">${it.genre}</span>` : ''}
          <div class="qty" aria-label="Quantity for ${it.title}">
            <button class="qty-dec" aria-label="Decrease quantity">–</button>
            <input class="qty-val" type="number" min="1" max="99" value="${it.qty}">
            <button class="qty-inc" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="line-right">
          <div class="price">${fmt(it.price)}</div>
          <div class="line-total">${fmt(line)}</div>
          <button class="remove" aria-label="Remove ${it.title}">Remove</button>
        </div>
      </li>
    `;
  }

  function bindItemEvents(){
    itemsList.querySelectorAll('.item').forEach(row => {
      const id  = row.dataset.id;
      const dec = row.querySelector('.qty-dec');
      const inc = row.querySelector('.qty-inc');
      const inp = row.querySelector('.qty-val');
      const rem = row.querySelector('.remove');

      dec.addEventListener('click', () => changeQty(id, -1));
      inc.addEventListener('click', () => changeQty(id, +1));
      inp.addEventListener('change', () => setQty(id, parseInt(inp.value || '1', 10)));
      rem.addEventListener('click', () => removeItem(id));
    });
  }

  function changeQty(id, d){
    const it = items.find(i => i.id === id);
    if (!it) return;
    it.qty = clamp((it.qty || 1) + d, 1, 99);
    persist();
  }

  function setQty(id, v){
    const it = items.find(i => i.id === id);
    if (!it) return;
    it.qty = clamp(v || 1, 1, 99);
    persist();
  }

  function removeItem(id){
    items = items.filter(i => i.id !== id);
    persist();
  }

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  // --- Totals / Coupons / Shipping ---
  function recalc(){
    const subtotal = items.reduce((s,i) => s + i.price * i.qty, 0);
    let discount = 0;

    const code = (coupon || '').trim().toUpperCase();
    if (code === 'SAVE10') discount = subtotal * 0.10;

    let shipping = 0;
    if (items.length) {
      if (code === 'FREESHIP') shipping = 0;
      else shipping = shipMethod.value === 'express' ? SHIP_EXPRESS : SHIP_STANDARD;
    }

    const taxedBase = Math.max(subtotal - discount, 0);
    const tax = taxedBase * TAX_RATE;
    const total = taxedBase + tax + shipping;

    sumSubtotal.textContent = fmt(subtotal);
    sumDiscount.textContent = `– ${fmt(discount)}`;
    sumShipping.textContent = fmt(shipping);
    sumTax.textContent = fmt(tax);
    sumTotal.textContent = fmt(total);

    checkoutBtn.disabled = items.length === 0;
  }

  function applyCouponNow(){
    coupon = (couponInput.value || '').trim().toUpperCase();
    if (coupon && !['SAVE10','FREESHIP'].includes(coupon)) {
      alert('Invalid coupon. Try SAVE10 or FREESHIP.');
      coupon = '';
      couponInput.value = '';
    }
    saveCoupon(coupon);
    recalc();
  }

  function saveCoupon(code){
    localStorage.setItem(`bh_coupon_${session.email}`, code || '');
  }
  function loadCoupon(){
    return localStorage.getItem(`bh_coupon_${session.email}`) || '';
  }

  // --- Recommendations (simple demo) ---
  const RECS = [
    { id: "Atomic Habits", title: "Atomic Habits", price: 14.95, img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=1200&auto=format&fit=crop" },
    { id: "Project Hail Mary", title: "Project Hail Mary", price: 16.99, img: "https://images.unsplash.com/photo-1519681394605-5f7f14f4a2d3?q=80&w=1200&auto=format&fit=crop" },
    { id: "The Midnight Library", title: "The Midnight Library", price: 12.99, img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop" },
  ];

  function renderRecs(){
    recsGrid.innerHTML = RECS.map(r => `
      <article class="rec">
        <img src="${r.img}" alt="${r.title} cover">
        <div class="body">
          <h4 class="title">${r.title}</h4>
          <div class="meta">
            <span class="price">$${r.price.toFixed(2)}</span>
            <button class="btn add-rec" data-id="${r.id}" data-title="${r.title}" data-price="${r.price}" data-img="${r.img}">Add to Cart</button>
          </div>
        </div>
      </article>
    `).join('');

    recsGrid.querySelectorAll('.add-rec').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = {
          id: btn.dataset.id,
          title: btn.dataset.title,
          price: parseFloat(btn.dataset.price),
          img: btn.dataset.img,
          qty: 1
        };
        const res = BH.addToCart(item); // updates badge + fires event
        if (res.ok) {
          items = BH.getCart(session.email);
          renderItems();
          alert(`Added "${item.title}" to your cart.`);
        }
      });
    });
  }

  // --- Persistence ---
  function persist(){
    BH.setCart(session.email, items); // updates badge + fires bh:cart-changed
    renderItems();
  }

  // --- Events ---
  applyCoupon.addEventListener('click', applyCouponNow);
  couponInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyCouponNow(); }});
  shipMethod.addEventListener('change', recalc);

  window.addEventListener('bh:cart-changed', () => BH.updateNav());

  // Back to top
  const onScroll = () => toTop.classList.toggle('show', window.scrollY > 300);
  window.addEventListener('scroll', onScroll);
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  onScroll();

  // --- Init ---
  renderItems();

  // Demo checkout
  checkoutBtn.addEventListener('click', () => {
    alert('This is a demo checkout. Implement payment flow here.');
  });
})();
