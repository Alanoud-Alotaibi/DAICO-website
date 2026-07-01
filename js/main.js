/**
 * DAICO Homepage Controller
 * Enhanced with: animated count-up, staggered card entrance,
 * program-type badge facet coloring, toast notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  loadFeaturedPrograms('all');
  initFilterTabs();
  initStats();
  initTestimonials();
  initFAQs();
  initContactForm();
  initScrollAnimations();
});

// ================================================================
// THEME MANAGEMENT (Light / Dark Mode)
// ================================================================
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('daico_theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(toggleBtn, currentTheme);

  toggleBtn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('daico_theme', theme);
    updateThemeIcon(toggleBtn, theme);
  });
}

function updateThemeIcon(btn, theme) {
  if (theme === 'dark') {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  } else {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  }
}

// ================================================================
// MOBILE MENU HANDLER
// ================================================================
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('active');
    if (menu.classList.contains('active')) {
      menu.style.display = 'flex';
      menu.style.flexDirection = 'column';
      menu.style.position = 'absolute';
      menu.style.top = '60px';
      menu.style.right = '0';
      menu.style.left = '0';
      menu.style.backgroundColor = 'var(--bg-secondary)';
      menu.style.padding = 'var(--space-lg)';
      menu.style.borderBottom = '1px solid var(--border-color)';
    } else {
      menu.style.display = '';
    }
  });
}

// ================================================================
// FEATURED PROGRAMS — Card Renderer with facet badge coloring
// (brief §4: "program-type badge uses its assigned facet color")
// ================================================================
function loadFeaturedPrograms(typeFilter = 'all') {
  const container = document.getElementById('programs-container');
  if (!container) return;

  if (!window.DAICO_DB) return;
  let events = window.DAICO_DB.select('events', { status: 'published' });

  if (typeFilter !== 'all') {
    events = events.filter(e => e.type === typeFilter);
  }

  // Limit to max 6 featured programs on home
  events = events.slice(0, 6);

  if (events.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: var(--space-xl)">لا توجد برامج تدريبية منشورة حالياً.</div>`;
    return;
  }

  container.innerHTML = events.map((event, index) => {
    const trainer = window.DAICO_DB.selectOne('trainers', { id: event.trainer_id }) || { name: 'دايكو للتدريب', title: 'خبير تدريب' };
    const category = window.DAICO_DB.selectOne('categories', { id: event.category_id }) || { name_ar: 'عام' };
    
    // Type Translate
    const typesMap = { course: 'دورة', bootcamp: 'معسكر', workshop: 'ورشة عمل', hackathon: 'هاكاثون' };
    const typeLabel = typesMap[event.type] || event.type;
    
    const priceLabel = event.price > 0 ? `${event.price} ريال` : 'مجانًا';
    const priceClass = event.price > 0 ? 'badge-warning' : 'badge-success';

    // Staggered entrance delay (brief §5)
    const delay = index * 0.08;

    return `
      <div class="card program-card animate-in" style="transition-delay: ${delay}s">
        <img class="program-image" src="${event.cover_image}" alt="${event.title}">
        <span class="program-badge-tag" data-type="${event.type}">${typeLabel}</span>
        
        <div class="program-card-body">
          <div class="program-meta">
            <span>${category.name_ar}</span>
            <span class="badge ${priceClass}">${priceLabel}</span>
          </div>
          
          <h3 style="font-size: 1.15rem; margin: var(--space-sm) 0">${event.title}</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-md)">
            ${event.description.substring(0, 95)}...
          </p>

          <div class="program-meta" style="margin-bottom: var(--space-md)">
            <span>📅 ${event.start_date}</span>
            <span>📍 ${event.location_type === 'online' ? 'عن بعد' : 'حضوري'}</span>
          </div>
          
          <div class="program-trainer">
            <img class="trainer-avatar" src="${trainer.photo}" alt="${trainer.name}">
            <div class="trainer-details">
              <span class="trainer-name">${trainer.name}</span>
              <span class="trainer-title">${trainer.title}</span>
            </div>
          </div>
          
          <a href="auth/login.html" class="btn btn-primary btn-sm" style="margin-top: var(--space-md)">تفاصيل البرنامج وتسجيل</a>
        </div>
      </div>
    `;
  }).join('');

  // Trigger entrance animation after render
  requestAnimationFrame(() => {
    const cards = container.querySelectorAll('.animate-in');
    cards.forEach(card => card.classList.add('visible'));
  });
}

// ================================================================
// FILTER TABS — Click Events
// ================================================================
function initFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const type = tab.getAttribute('data-type');
      loadFeaturedPrograms(type);
    });
  });
}

// ================================================================
// STATS — Animated count-up using IntersectionObserver
// (brief §4 HOMEPAGE: "animated count-up, icons in facet colors")
// ================================================================
function initStats() {
  const stats = window.DAICO_DB ? window.DAICO_DB.selectOne('homepage', { section_name: 'homepage_data' }) : null;
  
  // Get elements
  const statElements = {
    'stat-students': { suffix: '+' },
    'stat-courses': { suffix: '+' },
    'stat-trainers': { suffix: '+' },
    'stat-employment': { suffix: '%' }
  };

  // Set target values from DB or fallback
  if (stats) {
    const data = stats.content_data.stats;
    setStatTarget('stat-students', data.students);
    setStatTarget('stat-courses', data.courses);
    setStatTarget('stat-trainers', data.trainers);
    setStatTarget('stat-employment', data.employment_rate);
  }

  // Use IntersectionObserver for count-up on scroll
  const statsSection = document.querySelector('.stats-section');
  if (!statsSection) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateAllStats();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
}

function setStatTarget(id, rawValue) {
  const el = document.getElementById(id);
  if (!el) return;
  
  // Parse the raw value (e.g., "12,500+" → 12500, "94%" → 94)
  const cleanValue = String(rawValue).replace(/[^0-9.]/g, '');
  const numericValue = parseFloat(cleanValue) || 0;
  
  // Store the original display format and numeric target
  el.setAttribute('data-target', numericValue);
  el.setAttribute('data-raw', rawValue);
}

function animateAllStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(el => {
    const target = parseFloat(el.getAttribute('data-target')) || 0;
    const rawValue = el.getAttribute('data-raw') || '';
    
    if (target === 0 && rawValue) {
      // If we have raw but no numeric target, just display raw
      el.innerText = rawValue;
      return;
    }
    
    animateCountUp(el, target, rawValue);
  });
}

function animateCountUp(element, target, rawFormat) {
  const duration = 2000; // 2 seconds
  const startTime = performance.now();
  const isPercentage = rawFormat.includes('%');
  const hasPlus = rawFormat.includes('+');
  const hasComma = rawFormat.includes(',');
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(eased * target);
    
    // Format the number
    let display = hasComma 
      ? currentValue.toLocaleString('en-US') 
      : String(currentValue);
    
    if (hasPlus) display += '+';
    if (isPercentage) display += '%';
    
    element.innerText = display;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // Final value — use the raw format for accuracy
      element.innerText = rawFormat;
    }
  }
  
  requestAnimationFrame(update);
}

// ================================================================
// SCROLL ANIMATIONS — Staggered entrance via IntersectionObserver
// (brief §5: "staggered fade-up for card grids")
// ================================================================
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('.animate-in');
  
  if (animateElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  animateElements.forEach(el => observer.observe(el));
}

// ================================================================
// TESTIMONIALS SLIDER
// ================================================================
function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial-slide');
  if (slides.length === 0) return;

  let currentIdx = 0;
  
  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');
  }

  // Next slide timer
  setInterval(() => {
    currentIdx = (currentIdx + 1) % slides.length;
    showSlide(currentIdx);
  }, 6000);
}

// ================================================================
// FAQ ACCORDION
// ================================================================
function initFAQs() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ================================================================
// CONTACT FORM — with toast notification
// ================================================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertContainer = document.getElementById('contact-alert-container');
  if (!form || !alertContainer) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const msg = document.getElementById('contact-message').value;

    if (!name || !email || !msg) {
      showAlert(alertContainer, 'danger', 'يرجى تعبئة كافة الحقول المطلوبة.');
      return;
    }

    // Show toast for success (brief §5: toasts for transient feedback)
    showToast('success', 'نشكرك على تواصلك معنا! تم إرسال رسالتك وسيتصل بك أحد ممثلي دايكو قريباً.');
    form.reset();
  });
}

// ================================================================
// ALERT UTILITY — Inline alerts for form validation
// ================================================================
function showAlert(container, type, message) {
  container.innerHTML = `
    <div class="alert alert-${type}">
      ${message}
    </div>
  `;
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Clear alert after 6s
  setTimeout(() => {
    container.innerHTML = '';
  }, 6000);
}

// ================================================================
// TOAST NOTIFICATION UTILITY — Transient feedback
// (brief §5: "Toasts replace static alert divs for transient feedback")
// ================================================================
function showToast(type, message, duration = 5000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  
  container.appendChild(toast);

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

// Make toast available globally
window.DAICO_TOAST = showToast;
