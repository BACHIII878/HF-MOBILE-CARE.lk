/* ============================================================
   HF MOBILE CARE — script.js
   Products, search/filter/sort, wishlist, cart (localStorage),
   checkout + WhatsApp ordering.
   ------------------------------------------------------------
   HOW TO EDIT PRODUCTS:
   Each product below is one object. Copy a block, change the
   values, and it appears on the site automatically. Set
   "hidden: true" to hide a product without deleting it.
   ============================================================ */

const WHATSAPP_NUMBER = '94775157052'; // <- change WhatsApp number here if needed
const FREE_GIFT_THRESHOLD = 25000;     // FREE power bank over LKR 25,000
const FREE_GIFT_NAME = 'FREE Power Bank (Promo Gift)';

/* ---------------- CATEGORIES ---------------- */
const CATEGORIES = [
  { id:'cases',       name:'Mobile Phone Cases'  },
  { id:'earbuds',     name:'Wireless Earbuds'    },
  { id:'headphones',  name:'Headphones'          },
  { id:'chargers',    name:'Chargers & Adapters' },
  { id:'cables',      name:'USB Cables'          },
  { id:'powerbanks',  name:'Power Banks'         },
  { id:'protectors',  name:'Screen Protectors'   },
  { id:'watches',     name:'Smart Watches'       },
  { id:'speakers',    name:'Bluetooth Speakers'  },
  { id:'holders',     name:'Phone Holders'       },
  { id:'phones',      name:'Mobile Phones'       },
  { id:'other',       name:'Other Accessories'   },
];

/* ---------------- PRODUCTS (edit me!) ---------------- */
const PRODUCTS = [
  { id:1,  name:'Luxury Armor Case – iPhone/Samsung', cat:'cases',       img:'assets/product-case.jpg',        price:3490,  oldPrice:4990,  rating:4.8, reviews:132, desc:'Shockproof luxury armor case with raised camera protection and golden trim finish.' },
  { id:2,  name:'AirSound Wireless Earbuds Pro',      cat:'earbuds',     img:'assets/product-earbuds.jpg',     price:7990,  oldPrice:9990,  rating:4.7, reviews:208, desc:'True wireless earbuds with deep bass, touch controls and 24-hour total battery.' },
  { id:3,  name:'Studio Over-Ear Headphones',         cat:'headphones',  img:'assets/product-headphones.jpg',  price:11990, oldPrice:15990, rating:4.9, reviews:96,  desc:'Premium over-ear headphones with noise isolation and plush memory-foam cushions.' },
  { id:4,  name:'25W Fast Wall Charger + Cable',      cat:'chargers',    img:'assets/product-charger.jpg',     price:2490,  oldPrice:3490,  rating:4.6, reviews:311, desc:'High-speed 25W USB-C fast charger, bundled with a durable braided cable.' },
  { id:5,  name:'Braided USB-C Cable 2m',             cat:'cables',      img:'assets/product-cable.jpg',       price:990,   oldPrice:1490,  rating:4.5, reviews:420, desc:'Extra-tough nylon braided USB-C cable, 2 metres, supports fast charging & data.' },
  { id:6,  name:'20000mAh LED Power Bank',            cat:'powerbanks',  img:'assets/product-powerbank.jpg',   price:5490,  oldPrice:7490,  rating:4.8, reviews:175, desc:'Massive 20000mAh capacity with LED display and dual USB fast output.' },
  { id:7,  name:'9H Tempered Glass Protector',        cat:'protectors',  img:'assets/product-protector.jpg',   price:790,   oldPrice:1290,  rating:4.4, reviews:530, desc:'9H hardness tempered glass with oleophobic coating. Fits most popular models.' },
  { id:8,  name:'GoldFit Smart Watch Series 8',       cat:'watches',     img:'assets/product-watch.jpg',       price:8990,  oldPrice:12990, rating:4.6, reviews:143, desc:'Smart watch with heart-rate monitor, call alerts, sport modes and gold strap.' },
  { id:9,  name:'Thunder Bluetooth Speaker',          cat:'speakers',    img:'assets/product-speaker.jpg',     price:6490,  oldPrice:8990,  rating:4.7, reviews:88,  desc:'Room-filling 360° sound, 12-hour playtime, IPX6 splash resistance.' },
  { id:10, name:'360° Car Phone Holder',              cat:'holders',     img:'assets/product-holder.jpg',      price:1790,  oldPrice:2690,  rating:4.5, reviews:240, desc:'Strong-suction 360° rotating holder for dashboards and windscreens.' },
  { id:11, name:'Nova X5 Smartphone 128GB',           cat:'phones',      img:'assets/product-phone.jpg',       price:84990, oldPrice:94990, rating:4.9, reviews:67,  desc:'6.6" FHD+ display, 50MP camera, 8GB RAM, 128GB storage. 1-year warranty.' },
  { id:12, name:'MagSafe Ring Grip + Stand',          cat:'other',       img:'assets/product-accessories.jpg', price:1290,  oldPrice:1990,  rating:4.3, reviews:190, desc:'Magnetic ring grip that doubles as a kickstand. Slim gold finish.' },
  { id:13, name:'AirSound Earbuds Pro Max (ANC)',     cat:'earbuds',     img:'assets/product-earbuds-pro.jpg', price:12990, oldPrice:16990, rating:4.8, reviews:154, desc:'Active noise cancellation, wireless charging case, 30-hour battery life.' },
  { id:14, name:'Nova Ultra Flagship 256GB',          cat:'phones',      img:'assets/product-phone-ultra.jpg', price:164990,oldPrice:184990,rating:5.0, reviews:41,  desc:'Flagship performance, 120Hz AMOLED, 108MP camera, 12GB RAM, 256GB.' },
  { id:15, name:'Studio Pro ANC Headset',             cat:'headphones',  img:'assets/product-headphones-x.jpg',price:18990, oldPrice:24990, rating:4.9, reviews:73,  desc:'Active noise cancelling studio headset with 40h battery and foldable design.' },
  { id:16, name:'Promo: FREE Power Bank (Gift)',      cat:'powerbanks',  img:'assets/powerbank-free.jpg',      price:0,     oldPrice:3990,  rating:5.0, reviews:12,  desc:'FREE 10000mAh power bank added automatically to orders over LKR 25,000.', hidden:true },
];

/* ---------------- HELPERS ---------------- */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const lkr = n => 'LKR ' + n.toLocaleString('en-LK', {minimumFractionDigits:2, maximumFractionDigits:2});
const discountOf = p => p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
const catName = id => (CATEGORIES.find(c => c.id === id) || {}).name || id;

function stars(rating){
  const full = Math.floor(rating);
  let out = '';
  for (let i = 0; i < 5; i++)
    out += i < full ? '★' : '<span class="dim">★</span>';
  return out;
}

/* ---------------- STATE (localStorage) ---------------- */
const store = {
  get cart(){ try { return JSON.parse(localStorage.getItem('hfmc_cart')) || []; } catch(e){ return []; } },
  set cart(v){ localStorage.setItem('hfmc_cart', JSON.stringify(v)); },
  get wish(){ try { return JSON.parse(localStorage.getItem('hfmc_wish')) || []; } catch(e){ return []; } },
  set wish(v){ localStorage.setItem('hfmc_wish', JSON.stringify(v)); },
};

/* ---------------- RENDER: CATEGORIES ---------------- */
function renderCategories(){
  $('#categoryGrid').innerHTML = CATEGORIES.map(c => {
    // use a representative product image per category
    const rep = PRODUCTS.find(p => p.cat === c.id);
    const img = rep ? rep.img : 'assets/product-accessories.jpg';
    return `<div class="category-card reveal" data-cat="${c.id}">
      <img src="${img}" alt="${c.name}">
      <h3>${c.name}</h3>
    </div>`;
  }).join('');
  $$('#categoryGrid .category-card').forEach(card => {
    card.addEventListener('click', () => {
      setFilter(card.dataset.cat);
      document.getElementById('shop').scrollIntoView({behavior:'smooth'});
    });
  });
}

/* ---------------- RENDER: FILTER PILLS ---------------- */
let activeFilter = 'all';
let activeSearch = '';

function renderPills(){
  const pills = [{id:'all', name:'All Products'}, ...CATEGORIES];
  $('#filterPills').innerHTML = pills.map(p =>
    `<button class="pill ${p.id === activeFilter ? 'active' : ''}" data-pill="${p.id}">${p.name}</button>`
  ).join('');
  $$('#filterPills .pill').forEach(b =>
    b.addEventListener('click', () => setFilter(b.dataset.pill)));
}

function setFilter(cat){
  activeFilter = cat;
  renderPills();
  renderProducts();
}

/* ---------------- RENDER: PRODUCTS ---------------- */
function visibleProducts(){
  let list = PRODUCTS.filter(p => !p.hidden);
  if (activeFilter !== 'all') list = list.filter(p => p.cat === activeFilter);
  if (activeSearch) {
    const q = activeSearch.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || catName(p.cat).toLowerCase().includes(q));
  }
  const sort = $('#sortSelect').value;
  if (sort === 'low-high') list = [...list].sort((a,b) => a.price - b.price);
  if (sort === 'high-low') list = [...list].sort((a,b) => b.price - a.price);
  if (sort === 'discount') list = [...list].sort((a,b) => discountOf(b) - discountOf(a));
  if (sort === 'rating')  list = [...list].sort((a,b) => b.rating - a.rating);
  return list;
}

function renderProducts(){
  const list = visibleProducts();
  $('#noResults').hidden = list.length > 0;
  $('#productGrid').innerHTML = list.map(p => {
    const disc = discountOf(p);
    const wished = store.wish.includes(p.id);
    return `
    <article class="product-card" data-id="${p.id}">
      <div class="pc-img">
        ${disc ? `<span class="pc-badge">-${disc}%</span>` : ''}
        <div class="pc-actions">
          <button class="mini-btn ${wished ? 'wished' : ''}" data-act="wish" title="Wishlist">
            <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9C.5 8 2.5 4.5 6.5 4.5c2.4 0 4.1 1.3 5.5 3.2 1.4-1.9 3.1-3.2 5.5-3.2 4 0 6 3.5 4.5 7.5-2.5 4.4-10 9-10 9z"/></svg>
          </button>
          <button class="mini-btn" data-act="view" title="Quick View">
            <svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="pc-body">
        <span class="pc-cat">${catName(p.cat)}</span>
        <h3 class="pc-name">${p.name}</h3>
        <div class="stars">${stars(p.rating)} <span style="color:#888;font-size:.75rem">(${p.reviews})</span></div>
        <div class="pc-price">
          ${p.oldPrice > p.price ? `<span class="pc-old">${lkr(p.oldPrice)}</span>` : ''}
          <span class="pc-new">${lkr(p.price)}</span>
        </div>
        <button class="pc-add" data-act="add">ADD TO CART</button>
      </div>
    </article>`;
  }).join('');

  $$('#productGrid .product-card').forEach(card => {
    const id = +card.dataset.id;
    card.addEventListener('click', e => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'add'){ addToCart(id); flashAdd(e.target.closest('.pc-add')); }
      if (act === 'wish') toggleWish(id, e.target.closest('.mini-btn'));
      if (act === 'view') openQuickView(id);
    });
  });
}

function flashAdd(btn){
  if (!btn) return;
  btn.classList.add('added');
  btn.textContent = '✓ ADDED';
  setTimeout(() => { btn.classList.remove('added'); btn.textContent = 'ADD TO CART'; }, 1300);
}

/* ---------------- WISHLIST ---------------- */
function toggleWish(id, btn){
  let w = store.wish;
  if (w.includes(id)) { w = w.filter(x => x !== id); btn?.classList.remove('wished'); toast('Removed from wishlist'); }
  else { w.push(id); btn?.classList.add('wished'); toast('Added to wishlist ♥'); }
  store.wish = w;
  updateBadges();
}

function updateBadges(){
  const cartQty = store.cart.reduce((s,i) => s + i.qty, 0);
  $('#cartCount').textContent = cartQty;
  $('#wishCount').textContent = store.wish.length;
}

/* ---------------- CART ---------------- */
function addToCart(id, qty = 1){
  const cart = store.cart;
  const line = cart.find(i => i.id === id);
  if (line) line.qty += qty; else cart.push({id, qty});
  store.cart = cart;
  updateBadges();
  renderCart();
  toast('Added to cart ✓');
  bumpCartIcon();
}

function setQty(id, qty){
  let cart = store.cart;
  if (qty <= 0) cart = cart.filter(i => i.id !== id);
  else cart.find(i => i.id === id).qty = qty;
  store.cart = cart;
  updateBadges();
  renderCart();
}

function cartTotals(){
  const cart = store.cart;
  const subtotal = cart.reduce((s,i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return p ? s + p.price * i.qty : s;
  }, 0);
  const discount = cart.reduce((s,i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return p && p.oldPrice > p.price ? s + (p.oldPrice - p.price) * i.qty : s;
  }, 0);
  return { subtotal, discount, total: subtotal, qualifies: subtotal >= FREE_GIFT_THRESHOLD };
}

function renderCart(){
  const cart = store.cart;
  const box = $('#cartItems');
  if (!cart.length){
    box.innerHTML = `<p class="cart-empty">Your cart is empty.<br>✦ Add some golden deals ✦</p>`;
  } else {
    box.innerHTML = cart.map(i => {
      const p = PRODUCTS.find(x => x.id === i.id);
      if (!p) return '';
      return `<div class="cart-item" data-id="${p.id}">
        <img src="${p.img}" alt="${p.name}">
        <div>
          <p class="ci-name">${p.name}</p>
          <p class="ci-price">${lkr(p.price)}</p>
          <div class="qty-control">
            <button data-qty="-1">−</button><span>${i.qty}</span><button data-qty="1">+</button>
          </div>
        </div>
        <button class="ci-remove" data-remove aria-label="Remove">✕</button>
      </div>`;
    }).join('');
  }
  const t = cartTotals();
  $('#cartSubtotal').textContent = lkr(t.subtotal);
  $('#cartDiscount').textContent = '− ' + lkr(t.discount);
  $('#cartTotal').textContent = lkr(t.total);
  $('#freeGiftLine').hidden = !t.qualifies || !cart.length;
  $('#checkoutBtn').disabled = !cart.length;
  $('#checkoutBtn').style.opacity = cart.length ? 1 : .5;

  $$('#cartItems .cart-item').forEach(item => {
    const id = +item.dataset.id;
    item.querySelectorAll('[data-qty]').forEach(b =>
      b.addEventListener('click', () => {
        const cur = store.cart.find(i => i.id === id).qty;
        setQty(id, cur + (+b.dataset.qty));
      }));
    item.querySelector('[data-remove]').addEventListener('click', () => setQty(id, 0));
  });
}

function bumpCartIcon(){
  const b = $('#cartBtn');
  b.style.transform = 'scale(1.25)';
  setTimeout(() => b.style.transform = '', 220);
}

function openCart(){ $('#cartSidebar').classList.add('open'); $('#overlay').classList.add('show'); }
function closeCart(){ $('#cartSidebar').classList.remove('open'); $('#overlay').classList.remove('show'); }

/* ---------------- QUICK VIEW ---------------- */
let qvId = null, qvQty = 1;
function openQuickView(id){
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  qvId = id; qvQty = 1;
  $('#qvImg').src = p.img; $('#qvImg').alt = p.name;
  $('#qvCat').textContent = catName(p.cat);
  $('#qvName').textContent = p.name;
  $('#qvStars').innerHTML = `${stars(p.rating)} <span style="color:#888;font-size:.8rem">${p.rating} (${p.reviews} reviews)</span>`;
  $('#qvDesc').textContent = p.desc;
  $('#qvOld').textContent = p.oldPrice > p.price ? lkr(p.oldPrice) : '';
  $('#qvNew').textContent = lkr(p.price);
  $('#qvQty').textContent = qvQty;
  openModal('quickViewModal');
}
$('#qvMinus').addEventListener('click', () => { qvQty = Math.max(1, qvQty - 1); $('#qvQty').textContent = qvQty; });
$('#qvPlus').addEventListener('click', () => { qvQty++; $('#qvQty').textContent = qvQty; });
$('#qvAdd').addEventListener('click', () => { if (qvId) addToCart(qvId, qvQty); closeModal('quickViewModal'); });

/* ---------------- MODALS ---------------- */
function openModal(id){ $('#'+id).classList.add('open'); }
function closeModal(id){ $('#'+id).classList.remove('open'); }
$$('[data-close]').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.close)));
$$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); }));

/* ---------------- CHECKOUT ---------------- */
$('#checkoutBtn').addEventListener('click', () => {
  if (!store.cart.length) return;
  closeCart();
  renderCheckoutSummary();
  openModal('checkoutModal');
});

function renderCheckoutSummary(){
  const cart = store.cart;
  const t = cartTotals();
  let rows = cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return p ? `<div class="co-row"><span>${p.name} × ${i.qty}</span><span>${lkr(p.price * i.qty)}</span></div>` : '';
  }).join('');
  if (t.qualifies) rows += `<div class="co-row"><span>🎁 ${FREE_GIFT_NAME}</span><span class="gold-text">FREE</span></div>`;
  rows += `<div class="co-row co-total"><span>Total (Cash on Delivery)</span><span class="gold-text">${lkr(t.total)}</span></div>`;
  $('#coOrderSummary').innerHTML = rows;
}

$('#checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#coName').value.trim();
  const phone = $('#coPhone').value.trim();
  const address = $('#coAddress').value.trim();
  if (!name || !phone || !address){ toast('Please fill in all required fields'); return; }

  const cart = store.cart;
  const t = cartTotals();
  let msg = `*NEW ORDER — HF MOBILE CARE*%0A%0A`;
  msg += `*Name:* ${encodeURIComponent(name)}%0A`;
  msg += `*Phone:* ${encodeURIComponent(phone)}%0A`;
  msg += `*Address:* ${encodeURIComponent(address)}%0A%0A`;
  msg += `*Order Details:*%0A`;
  cart.forEach(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    if (p) msg += `• ${encodeURIComponent(p.name)} × ${i.qty} — ${encodeURIComponent(lkr(p.price * i.qty))}%0A`;
  });
  if (t.qualifies) msg += `• 🎁 ${encodeURIComponent(FREE_GIFT_NAME)} — FREE%0A`;
  msg += `%0A*Total: ${encodeURIComponent(lkr(t.total))}*%0A`;
  msg += `Payment: Cash on Delivery%0A%0A`;
  msg += `(Sent from the HF MOBILE CARE website)`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  closeModal('checkoutModal');
  store.cart = []; updateBadges(); renderCart();
  openModal('successModal');
  e.target.reset();
});

/* ---------------- SEARCH ---------------- */
$('#searchToggle').addEventListener('click', () => {
  const bar = $('#searchBar');
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) $('#searchInput').focus();
});
function runSearch(){
  activeSearch = $('#searchInput').value.trim();
  renderProducts();
  document.getElementById('shop').scrollIntoView({behavior:'smooth'});
}
$('#searchGo').addEventListener('click', runSearch);
$('#searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });

/* offer / footer category shortcuts */
$$('[data-offer-filter]').forEach(a => a.addEventListener('click', () => setFilter(a.dataset.offerFilter)));
$$('[data-foot-cat]').forEach(a => a.addEventListener('click', () => setFilter(a.dataset.footCat)));

/* ---------------- NAV / SCROLL ---------------- */
const hamburger = $('#hamburger'), navLinks = $('#navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
$$('.nav-link').forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
}));

window.addEventListener('scroll', () => {
  $('#navbar').classList.toggle('scrolled', scrollY > 10);
  $('#backToTop').classList.toggle('show', scrollY > 600);
  // active link highlight
  const sections = ['home','shop','categories','offers','about','contact'];
  let current = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 120) current = id;
  });
  $$('.nav-link').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
});
$('#backToTop').addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));

/* ---------------- TOAST ---------------- */
let toastTimer;
function toast(msg){
  let t = $('.toast');
  if (!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

/* ---------------- CONTACT FORM → WHATSAPP ---------------- */
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#cfName').value.trim(), phone = $('#cfPhone').value.trim(),
        email = $('#cfEmail').value.trim(), msg = $('#cfMsg').value.trim();
  if (!name || !phone || !msg){ toast('Please fill in all required fields'); return; }
  const text = `*MESSAGE — HF MOBILE CARE website*%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AEmail: ${encodeURIComponent(email || '—')}%0A%0A${encodeURIComponent(msg)}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  e.target.reset();
  toast('Opening WhatsApp…');
});

/* ---------------- REVEAL ON SCROLL ---------------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target); } });
}, {threshold:.12});
function observeReveals(){ $$('.reveal:not(.visible)').forEach(el => io.observe(el)); }

/* ---------------- INIT ---------------- */
$('#sortSelect').addEventListener('change', renderProducts);
$('#cartBtn').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
$('#overlay').addEventListener('click', closeCart);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){ closeCart(); $$('.modal.open').forEach(m => m.classList.remove('open')); }
});
$('#year').textContent = new Date().getFullYear();

renderCategories();
renderPills();
renderProducts();
renderCart();
updateBadges();
observeReveals();

window.addEventListener('load', () => {
  setTimeout(() => $('#loader').classList.add('hidden'), 700);
});
/* fallback if load event already fired */
setTimeout(() => $('#loader').classList.add('hidden'), 3200);
