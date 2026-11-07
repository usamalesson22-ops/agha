/**
 * AGHA FOOD'S — KEBAB & PIZZA
 * Interactive JavaScript Engine
 * Features: 3D Mouse Parallax, Ember Particle Canvas, Web Audio Synthesizer,
 * Real-time Cart Management, Craver's Lab Customizer, WhatsApp Order Integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAudio();
  initEmberCanvas();
  init3DParallax();
  initMenuFilter();
  initCraversLab();
  initCartSystem();
  initReservationForm();
  initHeaderScroll();
  initMobileNav();
  initArticles();
  initNewsletter();
});

/* ==========================================================================
   1. Web Audio Synthesizer (Zero external dependencies)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  const toggleBtn = document.getElementById('sfx-toggle');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      toggleBtn.innerHTML = soundEnabled 
        ? '<span>🔊</span> Sound: ON' 
        : '<span>🔇</span> Sound: OFF';
      if (soundEnabled) playSound('click');
    });
  }
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'add') {
      // Sizzling chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'success') {
      // Victory double tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(780, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    }
  } catch (e) {
    // Audio context safe fallback
  }
}

/* ==========================================================================
   2. Charcoal Ember Particle Canvas
   ========================================================================== */
function initEmberCanvas() {
  const canvas = document.getElementById('ember-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const maxParticles = 35;

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 80;
      this.size = Math.random() * 2.8 + 1;
      this.speedY = Math.random() * 1.4 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.alpha = Math.random() * 0.7 + 0.3;
      this.decay = Math.random() * 0.004 + 0.002;
      this.hue = Math.random() > 0.4 ? 22 : 38; // 22 is flame orange, 38 is golden ember
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.alpha -= this.decay;
      if (this.alpha <= 0 || this.y < 0) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(render);
  }
  render();
}

/* ==========================================================================
   3. 3D Parallax & Card Tilt Physics
   ========================================================================== */
function init3DParallax() {
  // Hero Dish Interactive 3D tilt with mouse
  const heroPlate = document.getElementById('heroPlate3D');
  const heroWrapper = document.querySelector('.hero-plate-wrapper');

  if (heroPlate && heroWrapper) {
    heroWrapper.addEventListener('mousemove', (e) => {
      const rect = heroWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const rotX = -(y / rect.height) * 26;
      const rotY = (x / rect.width) * 26;
      
      heroPlate.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.05, 1.05, 1.05)`;
    });

    heroWrapper.addEventListener('mouseleave', () => {
      heroPlate.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  }

  // 3D Card Tilt on Menu Cards
  const cards = document.querySelectorAll('.menu-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = -(y / rect.height) * 14;
      const rotY = (x / rect.width) * 14;

      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
}

/* ==========================================================================
   4. Menu Filtering System
   ========================================================================== */
function initMenuFilter() {
  const filterBtns = document.querySelectorAll('.filter-pill');
  const menuCards = document.querySelectorAll('.menu-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      menuCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.92)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* ==========================================================================
   5. Craver's Lab - 3D Box Customizer
   ========================================================================== */
function initCraversLab() {
  const customizerState = {
    base: { name: '12" Stone-Fired Pizza', price: 14.99, img: 'assets/images/pizza_pepperoni.jpg' },
    protein: { name: 'Charred Seekh Kebab', price: 4.50 },
    spice: { name: 'Volcanic Ghost Pepper', label: '🌶️🌶️🌶️ Extreme' },
    cheese: { name: 'Lava Mozzarella Explosion', price: 2.50 }
  };

  const optionBtns = document.querySelectorAll('.lab-option-btn');
  const nameDisplay = document.getElementById('labSummaryName');
  const priceDisplay = document.getElementById('labPriceValue');
  const previewImg = document.getElementById('labDishImg');
  const tagsContainer = document.getElementById('labTagsContainer');
  const addCustomBtn = document.getElementById('addCustomBoxBtn');

  function updateLabUI() {
    const totalPrice = customizerState.base.price + customizerState.protein.price + customizerState.cheese.price;
    
    if (priceDisplay) priceDisplay.textContent = `$${totalPrice.toFixed(2)}`;
    if (nameDisplay) nameDisplay.textContent = `${customizerState.protein.name} ${customizerState.base.name}`;
    if (previewImg) previewImg.src = customizerState.base.img;

    if (tagsContainer) {
      tagsContainer.innerHTML = `
        <span class="lab-summary-tag">🔥 ${customizerState.protein.name}</span>
        <span class="lab-summary-tag">${customizerState.spice.label}</span>
        <span class="lab-summary-tag">🧀 ${customizerState.cheese.name}</span>
      `;
    }
  }

  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const step = btn.getAttribute('data-step');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price') || '0');
      const img = btn.getAttribute('data-img');
      const label = btn.getAttribute('data-label');

      // Update active state in siblings
      const parent = btn.closest('.lab-options-row');
      parent.querySelectorAll('.lab-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      if (step === 'base') {
        customizerState.base = { name, price, img };
      } else if (step === 'protein') {
        customizerState.protein = { name, price };
      } else if (step === 'spice') {
        customizerState.spice = { name, label: label || name };
      } else if (step === 'cheese') {
        customizerState.cheese = { name, price };
      }

      updateLabUI();
    });
  });

  if (addCustomBtn) {
    addCustomBtn.addEventListener('click', () => {
      playSound('add');
      const totalPrice = customizerState.base.price + customizerState.protein.price + customizerState.cheese.price;
      const customItem = {
        id: 'custom-' + Date.now(),
        title: `${customizerState.protein.name} ${customizerState.base.name} (Custom Box)`,
        price: totalPrice,
        img: customizerState.base.img,
        qty: 1
      };

      cartItems.push(customItem);
      updateCartDisplay();
      openCartDrawer();
      showToast('🔥 Custom Feast Box added to your order!');
    });
  }

  updateLabUI();
}

/* ==========================================================================
   6. Cart Management & WhatsApp Order System
   ========================================================================== */
let cartItems = [
  {
    id: 'item-1',
    title: 'Royal Charcoal Seekh Platter',
    price: 15.99,
    img: 'assets/images/kebab_charcoal.jpg',
    qty: 1
  },
  {
    id: 'item-2',
    title: 'Crown Crust Cheesy Pepperoni',
    price: 16.49,
    img: 'assets/images/pizza_pepperoni.jpg',
    qty: 1
  }
];

let appliedDiscount = 0; // percentage

function initCartSystem() {
  const cartTrigger = document.getElementById('cartTrigger');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartCloseBtn = document.getElementById('cartCloseBtn');

  if (cartTrigger) {
    cartTrigger.addEventListener('click', () => {
      playSound('click');
      openCartDrawer();
    });
  }

  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => {
      closeCartDrawer();
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', () => {
      closeCartDrawer();
    });
  }

  // Hook up all "Add to Cart" buttons
  const addButtons = document.querySelectorAll('.add-cart-btn');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('add');

      const card = btn.closest('.menu-card');
      const id = card.getAttribute('data-id') || 'item-' + Date.now();
      const title = card.querySelector('.menu-card-title').textContent.trim();
      const priceText = card.querySelector('.price-tag').textContent.replace('$', '').trim();
      const price = parseFloat(priceText);
      const img = card.querySelector('.menu-card-img').src;

      addToCart({ id, title, price, img });
      showToast(`🔥 "${title}" added to feast!`);
    });
  });

  // Coupon code handler
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const promoInput = document.getElementById('promoCodeInput');
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'AGHA20') {
        appliedDiscount = 0.20;
        playSound('success');
        showToast('🎉 Code AGHA20 Applied! 20% Discount unlocked!');
        updateCartDisplay();
      } else {
        showToast('❌ Invalid code. Try AGHA20');
      }
    });
  }

  // WhatsApp Order Button
  const waBtn = document.getElementById('orderWhatsAppBtn');
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      if (cartItems.length === 0) {
        alert('Your cart is empty! Add some delicious dishes first.');
        return;
      }
      playSound('success');
      sendWhatsAppOrder();
    });
  }

  // Direct Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      playSound('success');
      alert('🚀 Thank you! Order received. Our kitchen is firing up your feast right now! Delivery in 25 mins.');
      cartItems = [];
      updateCartDisplay();
      closeCartDrawer();
    });
  }

  updateCartDisplay();
}

function openCartDrawer() {
  document.getElementById('cartDrawer')?.classList.add('active');
  document.getElementById('cartOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  document.getElementById('cartDrawer')?.classList.remove('active');
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function addToCart(item) {
  const existing = cartItems.find(i => i.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ ...item, qty: 1 });
  }
  updateCartDisplay();
}

function updateCartDisplay() {
  const listContainer = document.getElementById('cartItemsList');
  const countBadge = document.getElementById('cartCountBadge');
  const subtotalDisplay = document.getElementById('cartSubtotal');
  const totalDisplay = document.getElementById('cartTotal');
  const deliveryTracker = document.getElementById('deliveryProgress');
  const deliveryLabel = document.getElementById('deliveryLabel');

  const totalCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  if (countBadge) countBadge.textContent = totalCount;

  if (!listContainer) return;

  if (cartItems.length === 0) {
    listContainer.innerHTML = `
      <div class="cart-empty-message">
        <span>🍕</span>
        <h4>Your Feast Cart is Empty</h4>
        <p>Add some juicy kebabs or wood-fired pizza to get started!</p>
      </div>
    `;
    if (subtotalDisplay) subtotalDisplay.textContent = '$0.00';
    if (totalDisplay) totalDisplay.textContent = '$0.00';
    if (deliveryTracker) deliveryTracker.style.width = '0%';
    return;
  }

  let subtotal = 0;
  listContainer.innerHTML = '';

  cartItems.forEach(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.img}" alt="${item.title}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-qty-controls">
        <button class="qty-btn" onclick="modifyQty('${item.id}', -1)">-</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="modifyQty('${item.id}', 1)">+</button>
      </div>
    `;
    listContainer.appendChild(itemEl);
  });

  // Calculate delivery & discounts
  const targetFreeDelivery = 35.00;
  const progress = Math.min(100, (subtotal / targetFreeDelivery) * 100);
  if (deliveryTracker) deliveryTracker.style.width = `${progress}%`;

  if (deliveryLabel) {
    if (subtotal >= targetFreeDelivery) {
      deliveryLabel.innerHTML = '🎉 <strong>FREE EXPRESS DELIVERY UNLOCKED!</strong>';
    } else {
      const remaining = (targetFreeDelivery - subtotal).toFixed(2);
      deliveryLabel.innerHTML = `Add <strong>$${remaining}</strong> more for <strong>FREE DELIVERY</strong>`;
    }
  }

  const discountAmount = subtotal * appliedDiscount;
  const deliveryFee = subtotal >= targetFreeDelivery ? 0 : 3.99;
  const finalTotal = subtotal - discountAmount + deliveryFee;

  if (subtotalDisplay) subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
  if (totalDisplay) totalDisplay.textContent = `$${finalTotal.toFixed(2)}`;
}

window.modifyQty = function(id, delta) {
  playSound('click');
  const item = cartItems.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cartItems = cartItems.filter(i => i.id !== id);
  }
  updateCartDisplay();
};

function sendWhatsAppOrder() {
  let message = `🔥 *NEW ORDER - AGHA FOOD'S KEBAB & PIZZA* 🔥\n\n`;
  let subtotal = 0;
  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    message += `${index + 1}. ${item.title} x ${item.qty} = $${itemTotal.toFixed(2)}\n`;
  });

  const finalTotal = subtotal * (1 - appliedDiscount);
  message += `\n*Subtotal:* $${subtotal.toFixed(2)}`;
  if (appliedDiscount > 0) message += `\n*Discount:* -20% (AGHA20)`;
  message += `\n*Total Payable:* $${finalTotal.toFixed(2)}`;
  message += `\n\n📍 *Customer Order*: Ready for Delivery / Pickup!`;

  const phone = '15551234567'; // demo business number
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
}

/* ==========================================================================
   7. Reservation Handler
   ========================================================================== */
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    playSound('success');

    const name = form.querySelector('[name="name"]').value;
    const guests = form.querySelector('[name="guests"]').value;
    const date = form.querySelector('[name="date"]').value;
    const time = form.querySelector('[name="time"]').value;
    const seating = form.querySelector('[name="seating"]').value;

    const resId = 'AGHA-' + Math.floor(100000 + Math.random() * 900000);

    alert(`🎉 Table Reserved Successfully!\n\nBooking ID: ${resId}\nGuest: ${name}\nParty Size: ${guests} Guests\nDate: ${date} at ${time}\nArea: ${seating}\n\nA confirmation SMS has been dispatched. See you soon!`);
    form.reset();
  });
}

/* ==========================================================================
   8. Header Scroll & Active Links (Scroll Spy)
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Scroll spy for navigation tabs including Articles
    const scrollPosition = window.scrollY + 140;
    let currentId = '';

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });

  // Smooth click interaction and active state
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      playSound('click');
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ==========================================================================
   9. Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      playSound('click');
      navLinks.classList.toggle('active');
      toggleBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        toggleBtn.innerHTML = '☰';
      });
    });
  }
}

/* ==========================================================================
   10. Newsletter Form
   ========================================================================== */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      playSound('success');
      alert('🔥 Welcome to the Agha Food Squad! Your 20% discount coupon code is: AGHA20');
      form.reset();
    });
  }
}

/* ==========================================================================
   11. Toast Notification Utility
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #1C1C24;
      border: 1px solid #FF5E14;
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: 9999px;
      font-size: 0.9rem;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 94, 20, 0.4);
      z-index: 300;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
  }, 2800);
}

/* ==========================================================================
   12. Articles & Culinary Journal Engine
   ========================================================================== */
const articlesData = {
  'article-1': {
    id: 'article-1',
    category: 'grilling',
    categoryBadge: '🍢 Grilling Mastery',
    readTime: '⏱️ 6 min read',
    date: 'Nov 5, 2026',
    title: 'The Science of 800°F Charcoal: Why Real Lump Wood Outperforms Gas Grills',
    author: 'Chef Tariq Agha',
    authorRole: 'Master Pitmaster & Founder',
    authorAvatar: 'assets/images/avatar_1.jpg',
    image: 'assets/images/kebab_charcoal.jpg',
    likes: 184,
    content: `
      <div class="modal-article-hero">
        <img src="assets/images/kebab_charcoal.jpg" alt="Charcoal Grilling Seekh">
        <div class="modal-hero-overlay"></div>
      </div>
      <h2 class="modal-article-title">The Science of 800°F Charcoal: Why Real Lump Wood Outperforms Gas Grills</h2>
      <div class="modal-author-strip">
        <img src="assets/images/avatar_1.jpg" alt="Chef Tariq Agha" class="author-avatar">
        <div>
          <strong style="color: var(--color-white); font-size: 0.95rem; display: block;">Chef Tariq Agha</strong>
          <span style="color: var(--color-text-muted); font-size: 0.8rem;">Master Pitmaster & Founder • Published Nov 5, 2026</span>
        </div>
      </div>
      <div class="modal-article-prose">
        <p>Gas grillers often preach the convenience of turning a knob, but lump oakwood charcoal creates thermodynamic poetry that no gas flame or electric element can match. When skewered meat meets an 800°F charcoal zone, surface moisture flash-vaporizes within three seconds.</p>
        
        <h4>1. The Chemistry of Instant Flash Searing</h4>
        <p>This instantaneous flash triggers the renowned Maillard cascade — reducing sugars and amino acids combine rapidly to generate hundreds of new aromatic compounds. Unlike gas combustion, which produces water vapor that steams meat, natural lump charcoal delivers dry, radiant infrared heat that crisps exterior collagen while preserving 100% of internal juices.</p>

        <div class="modal-quote-box">
          "Charcoal isn't just a heat source; it is an active ingredient. The natural lignin inside seasoned oak produces guaiacol and syringol — the molecular hallmarks of authentic woodsmoke."
        </div>

        <h4>2. The Fat-Vaporization Feedback Loop</h4>
        <p>As our hand-skewered seekh kebabs drip spiced fat down into white-hot coals, the droplets don't merely burn away. They atomize into microscopic smoke plumes that surge upward, basting the meat in a gossamer veil of wood-fired umami. It's a continuous self-basting cycle unique to live lump coals.</p>

        <div class="modal-takeaways-box">
          <div class="modal-takeaways-title">🔥 Pitmaster Takeaways</div>
          <ul class="modal-takeaways-list">
            <li>100% organic lump oakwood charcoal with zero chemical binders or petroleum accelerants.</li>
            <li>Continuous 45-second skewer rotations to maintain internal thermal basting equilibrium.</li>
            <li>House-tempered 14-spice marinade rested for a minimum of 8 hours before touching coals.</li>
          </ul>
        </div>
      </div>
    `
  },
  'article-2': {
    id: 'article-2',
    category: 'pizza',
    categoryBadge: '🍕 Pizza Science',
    readTime: '⏱️ 4 min read',
    date: 'Nov 2, 2026',
    title: '48-Hour Cold Fermentation: Anatomy of an Airy Crown Crust',
    author: 'Chef Marco Valenti',
    authorRole: 'Head Pizzaiolo',
    authorAvatar: 'assets/images/avatar_2.jpg',
    image: 'assets/images/wood_oven.jpg',
    likes: 142,
    content: `
      <div class="modal-article-hero">
        <img src="assets/images/wood_oven.jpg" alt="Stone Oven Pizza">
        <div class="modal-hero-overlay"></div>
      </div>
      <h2 class="modal-article-title">48-Hour Cold Fermentation: Anatomy of an Airy Crown Crust</h2>
      <div class="modal-author-strip">
        <img src="assets/images/avatar_2.jpg" alt="Chef Marco Valenti" class="author-avatar">
        <div>
          <strong style="color: var(--color-white); font-size: 0.95rem; display: block;">Chef Marco Valenti</strong>
          <span style="color: var(--color-text-muted); font-size: 0.8rem;">Head Pizzaiolo • Published Nov 2, 2026</span>
        </div>
      </div>
      <div class="modal-article-prose">
        <p>Standard commercial pizzerias force dough to rise in under 90 minutes using warm water and excessive commercial yeast. While this inflates dough quickly, complex grain starches remain unfermented. When eaten, that fermentation continues in your gut, resulting in bloating and fatigue.</p>
        
        <h4>1. The Secret of 4°C Enzymatic Breakdown</h4>
        <p>By retarding dough at 4°C for 48 hours, yeast activity slows while enzymatic reactions peak. Protease gently breaks long gluten chains into supple strands, while amylase converts complex flour starches into maltose sugars. This yields unprecedented digestibility and deep complex sweetness.</p>

        <div class="modal-quote-box">
          "Time is the quietest chef in the kitchen. 48 hours of cold dormancy does what no artificial enhancer could ever replicate."
        </div>

        <h4>2. Volcanic Oven-Spring at 900°F</h4>
        <p>When the cold-fermented dough enters our cordierite stone oven at 900°F, trapped carbon dioxide expands with volcanic force within 15 seconds, creating dramatic micro-blisters ("cornicione") that crackle delicately on the outside while staying cloud-soft inside.</p>

        <div class="modal-takeaways-box">
          <div class="modal-takeaways-title">🍕 Pizzaiolo Takeaways</div>
          <ul class="modal-takeaways-list">
            <li>Double-zero Italian Caputo flour blended with stone-milled ancient grains.</li>
            <li>Strict 48-hour cold retard process ensuring effortless digestion.</li>
            <li>Flash-baked in 90 seconds on 900°F radiant stone hearths.</li>
          </ul>
        </div>
      </div>
    `
  },
  'article-3': {
    id: 'article-3',
    category: 'recipes',
    categoryBadge: '🌶️ Secret Recipes',
    readTime: '⏱️ 5 min read',
    date: 'Oct 28, 2026',
    title: 'The 14-Spice Symphony: Balancing Smokiness, Warmth & Aromatics',
    author: 'Spices Master Tariq',
    authorRole: 'Flavor Alchemist',
    authorAvatar: 'assets/images/avatar_3.jpg',
    image: 'assets/images/chef_plating.jpg',
    likes: 215,
    content: `
      <div class="modal-article-hero">
        <img src="assets/images/chef_plating.jpg" alt="Chef Plating Spices">
        <div class="modal-hero-overlay"></div>
      </div>
      <h2 class="modal-article-title">The 14-Spice Symphony: Balancing Smokiness, Warmth & Aromatics</h2>
      <div class="modal-author-strip">
        <img src="assets/images/avatar_3.jpg" alt="Spices Master Tariq" class="author-avatar">
        <div>
          <strong style="color: var(--color-white); font-size: 0.95rem; display: block;">Spices Master Tariq</strong>
          <span style="color: var(--color-text-muted); font-size: 0.8rem;">Flavor Alchemist • Published Oct 28, 2026</span>
        </div>
      </div>
      <div class="modal-article-prose">
        <p>True spice craft is not about setting tongues on fire — it's about culinary orchestration. A great spice blend tells a three-act story on the palate: initial floral sweetness, mid-palate warmth, and a gentle smoky resonance.</p>
        
        <h4>1. The Three Tiers of Flavor Architecture</h4>
        <p>Our house blend layers top notes of green cardamom and crushed star anise with heart notes of stone-ground coriander, roasted cumin, and mace. The bass note is delivered by hand-selected Kashmiri chili — celebrated worldwide for vibrant crimson color and silky, fruity warmth rather than harsh sting.</p>

        <div class="modal-quote-box">
          "If all you feel is raw heat, the kitchen has failed. Every skewer should deliver a narrative of fragrance, warmth, and live fire."
        </div>

        <h4>2. Daily Dry-Toast & Coarse Stone Milling</h4>
        <p>Pre-ground spices lose over 60% of volatile aromatic oils within weeks of sitting in packaging. Every morning at 8:00 AM, our crew dry-toasts whole spices in cast-iron karahis until fragrant, then coarsely mills them just in time for the afternoon's marinades.</p>

        <div class="modal-takeaways-box">
          <div class="modal-takeaways-title">🌶️ Spice Master Takeaways</div>
          <ul class="modal-takeaways-list">
            <li>Whole spices toasted fresh daily to unlock volatile essential oils.</li>
            <li>Zero artificial colorings, chemical MSG, or synthetic preservatives.</li>
            <li>Coarsely milled texture designed specifically for flame adhesion.</li>
          </ul>
        </div>
      </div>
    `
  },
  'article-4': {
    id: 'article-4',
    category: 'culture',
    categoryBadge: '🌙 Food Culture',
    readTime: '⏱️ 3 min read',
    date: 'Oct 21, 2026',
    title: 'Midnight Cravers: Why Street Food Hits Harder After Dark',
    author: 'Agha Culinary Team',
    authorRole: 'Night Shift Crew',
    authorAvatar: 'assets/images/avatar_1.jpg',
    image: 'assets/images/restaurant_vibe.jpg',
    likes: 198,
    content: `
      <div class="modal-article-hero">
        <img src="assets/images/restaurant_vibe.jpg" alt="Restaurant Vibe at Night">
        <div class="modal-hero-overlay"></div>
      </div>
      <h2 class="modal-article-title">Midnight Cravers: Why Street Food Hits Harder After Dark</h2>
      <div class="modal-author-strip">
        <img src="assets/images/avatar_1.jpg" alt="Agha Team" class="author-avatar">
        <div>
          <strong style="color: var(--color-white); font-size: 0.95rem; display: block;">Agha Culinary Team</strong>
          <span style="color: var(--color-text-muted); font-size: 0.8rem;">Night Shift Crew • Published Oct 21, 2026</span>
        </div>
      </div>
      <div class="modal-article-prose">
        <p>Have you ever wondered why a smashed double cheeseburger, hot loaded fries, or sizzling charcoal seekh kebab tastes exponentially more intense at 1:00 AM than at 1:00 PM? Science points to sensory focus.</p>
        
        <h4>1. Sensory Attunement in the Dark</h4>
        <p>When daylight noise subsides, ambient city lighting softens, and cognitive work slows, human senses shift. Olfactory receptors become hyper-sensitive to the warm volatile compounds of searing meats, melted aged cheeses, and toasted dough.</p>

        <div class="modal-quote-box">
          "Midnight isn't just an hour on the clock — it's a brotherhood of appetite and late-night cravings."
        </div>

        <h4>2. The Glow of Community</h4>
        <p>Whether it's squads wrapping up intense gaming tournaments, hospital staff finishing demanding shifts, or friends laughing over platters on our outdoor heated terrace, the live flame has always been humanity's original gathering point.</p>

        <div class="modal-takeaways-box">
          <div class="modal-takeaways-title">🌙 Midnight Crew Takeaways</div>
          <ul class="modal-takeaways-list">
            <li>Fresh made-to-order grill & pizza service until 2:00 AM daily.</li>
            <li>Guaranteed 25-minute late-night express delivery within city limits.</li>
            <li>Heated terrace and vibrant neon squad booths always open late.</li>
          </ul>
        </div>
      </div>
    `
  },
  'article-5': {
    id: 'article-5',
    category: 'grilling',
    categoryBadge: '🍢 Pitmaster Guide',
    readTime: '⏱️ 4 min read',
    date: 'Oct 15, 2026',
    title: 'The Platter Architecture: How to Construct the Perfect Feast',
    author: 'Grill Crew',
    authorRole: 'Squad Feasts Specialist',
    authorAvatar: 'assets/images/avatar_2.jpg',
    image: 'assets/images/platter_grill.jpg',
    likes: 167,
    content: `
      <div class="modal-article-hero">
        <img src="assets/images/platter_grill.jpg" alt="Grill Platter Feast">
        <div class="modal-hero-overlay"></div>
      </div>
      <h2 class="modal-article-title">The Platter Architecture: How to Construct the Perfect Feast</h2>
      <div class="modal-author-strip">
        <img src="assets/images/avatar_2.jpg" alt="Grill Crew" class="author-avatar">
        <div>
          <strong style="color: var(--color-white); font-size: 0.95rem; display: block;">Grill Crew</strong>
          <span style="color: var(--color-text-muted); font-size: 0.8rem;">Squad Feasts Specialist • Published Oct 15, 2026</span>
        </div>
      </div>
      <div class="modal-article-prose">
        <p>A memorable feast is an architectural balance. Piling random grilled meats onto a plate creates sensory fatigue; orchestrating temperatures, textures, and contrasting acidity creates a feast that disappears within minutes.</p>
        
        <h4>1. The Triad: Smoke, Acid & Crunch</h4>
        <p>Every bite on our platters is designed around a three-element principle: the deep smoky richness of live charcoal skewers must be countered by the crisp acid of sumac-rubbed red onions and cooling garlic toum, cradled within warm tandoor flatbread.</p>

        <div class="modal-quote-box">
          "A great platter is a conversation between hot fire, zesty pickles, and velvety dips."
        </div>

        <h4>2. Thermal Staging</h4>
        <p>Our squad platters are constructed in synchronized stages: flatbreads are pulled straight from the clay oven as the last coals kiss the skewers, ensuring that crispy items stay dry and hot proteins arrive sizzling to your table.</p>

        <div class="modal-takeaways-box">
          <div class="modal-takeaways-title">🍢 Platter Architecture Takeaways</div>
          <ul class="modal-takeaways-list">
            <li>Balanced variety: tender beef seekh, spiced chicken boti, and charred lamb chops.</li>
            <li>Three artisanal house-made dipping sauces included with every platter.</li>
            <li>Calibrated portions tailored for squads of 2, 4, or 8 hungry cravers.</li>
          </ul>
        </div>
      </div>
    `
  }
};

function initArticles() {
  const filterPills = document.querySelectorAll('.article-filter-pill');
  const articleCards = document.querySelectorAll('.article-featured-card, .article-card');
  const modal = document.getElementById('articleModal');
  const overlay = document.getElementById('articleModalOverlay');
  const closeBtn = document.getElementById('articleModalCloseBtn');
  const modalCategory = document.getElementById('articleModalCategory');
  const modalReadTime = document.getElementById('articleModalReadTime');
  const modalBody = document.getElementById('articleModalBody');

  // Category Filter Navigation
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      playSound('click');
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-article-filter');

      articleCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = card.classList.contains('article-featured-card') ? 'grid' : 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'all 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Modal Open Handler
  function openArticleModal(articleId) {
    const data = articlesData[articleId];
    if (!data || !modal || !overlay || !modalBody) return;

    if (modalCategory) modalCategory.textContent = data.categoryBadge;
    if (modalReadTime) modalReadTime.textContent = data.readTime;

    let isLiked = false;
    let currentLikes = data.likes;

    modalBody.innerHTML = `
      ${data.content}
      <div class="modal-article-actions">
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="modal-like-btn" id="modalLikeBtn">
            <span>❤️</span> <span id="likeCount">${currentLikes}</span> Likes
          </button>
          <button class="modal-share-btn" id="modalShareBtn">
            <span>🔗</span> Share Story
          </button>
        </div>
        <button class="btn btn-primary btn-sm" id="modalOrderBtn">
          🔥 Order Signature Dish
        </button>
      </div>
    `;

    // Interactivity: Like Button
    const likeBtn = document.getElementById('modalLikeBtn');
    const likeCountSpan = document.getElementById('likeCount');
    if (likeBtn && likeCountSpan) {
      likeBtn.addEventListener('click', () => {
        isLiked = !isLiked;
        if (isLiked) {
          currentLikes++;
          likeBtn.classList.add('liked');
          playSound('success');
          showToast('❤️ Thanks for loving this culinary story!');
        } else {
          currentLikes--;
          likeBtn.classList.remove('liked');
          playSound('click');
        }
        likeCountSpan.textContent = currentLikes;
      });
    }

    // Interactivity: Share Button
    const shareBtn = document.getElementById('modalShareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        playSound('click');
        const shareUrl = window.location.href.split('#')[0] + '#articles';
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('🔗 Article link copied to clipboard!');
          }).catch(() => {
            showToast('🔗 Share URL: ' + shareUrl);
          });
        } else {
          showToast('🔗 Share URL: ' + shareUrl);
        }
      });
    }

    // Interactivity: Order CTA
    const orderBtn = document.getElementById('modalOrderBtn');
    if (orderBtn) {
      orderBtn.addEventListener('click', () => {
        closeArticleModal();
        playSound('add');
        const menuSection = document.getElementById('menu');
        if (menuSection) {
          menuSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Display Modal
    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalBody.scrollTop = 0;
    playSound('add');
  }

  // Modal Close Handler
  function closeArticleModal() {
    if (!modal || !overlay) return;
    overlay.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    playSound('click');
  }

  // Bind Buttons
  document.querySelectorAll('.read-article-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const articleId = btn.getAttribute('data-article-id');
      if (articleId) openArticleModal(articleId);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeArticleModal);
  if (overlay) overlay.addEventListener('click', closeArticleModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeArticleModal();
    }
  });
}
