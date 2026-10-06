/**
 * Revit Contracting & Public Supplies - Main Application Controller
 * Handles Bilingual Switch, Dark/Light Themes, Portfolio Filter, Lightbox,
 * and WhatsApp Instant Quote Generator.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State Variables ---
  let currentLang = localStorage.getItem('revit_lang') || 'ar';
  let currentTheme = localStorage.getItem('revit_theme') || 'dark';

  const htmlElement = document.documentElement;
  const langToggleBtn = document.getElementById('langToggleBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const header = document.querySelector('.header');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const quoteForm = document.getElementById('quoteForm');
  const toast = document.getElementById('toastNotification');

  // --- Initial Setup ---
  applyLanguage(currentLang);
  applyTheme(currentTheme);

  // --- Language Switcher ---
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('revit_lang', lang);
    htmlElement.setAttribute('lang', lang);
    htmlElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Update all text nodes with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    // Update placeholders with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang] && translations[lang][key]) {
        el.setAttribute('placeholder', translations[lang][key]);
      }
    });

    // Update Language Toggle Button text
    if (langToggleBtn) {
      langToggleBtn.innerHTML = lang === 'ar' 
        ? '<i class="fas fa-globe"></i> <span class="lang-text">English</span>' 
        : '<i class="fas fa-globe"></i> <span class="lang-text">العربية</span>';
    }
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const newLang = currentLang === 'ar' ? 'en' : 'ar';
      applyLanguage(newLang);
    });
  }

  // --- Dark / Light Theme Switcher ---
  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('revit_theme', theme);
    if (theme === 'light') {
      htmlElement.setAttribute('data-theme', 'light');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggleBtn.setAttribute('title', 'الوضع الليلي');
      }
    } else {
      htmlElement.removeAttribute('data-theme');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggleBtn.setAttribute('title', 'الوضع النهاري');
      }
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  // --- Mobile Drawer Menu & Overlay ---
  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    const icon = mobileMenuBtn ? mobileMenuBtn.querySelector('i') : null;
    if (icon) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    }
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    const icon = mobileMenuBtn ? mobileMenuBtn.querySelector('i') : null;
    if (icon) {
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-times');
    }
  }

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', closeDrawer);
    }

    // Close drawer when clicking nav links or CTA buttons
    mobileDrawer.querySelectorAll('.nav-link, .btn').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }

  // --- Scroll Effects & Navbar ---
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    if (scrollTopBtn) {
      if (scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Portfolio Filter Functionality ---
  const filterTabs = document.querySelectorAll('.filter-tab-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterCategory = tab.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterCategory === 'all' || itemCategory === filterCategory) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // --- Cinematic Lightbox Modal ---
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  let currentImageIndex = 0;
  let activeVisibleCards = [];

  function updateVisibleCards() {
    activeVisibleCards = Array.from(portfolioItems).filter(item => item.style.display !== 'none');
  }

  function showLightbox(index) {
    updateVisibleCards();
    if (activeVisibleCards.length === 0) return;

    if (index < 0) index = activeVisibleCards.length - 1;
    if (index >= activeVisibleCards.length) index = 0;

    currentImageIndex = index;
    const card = activeVisibleCards[currentImageIndex];
    const img = card.querySelector('img');
    const titleEl = card.querySelector('.portfolio-item-title');

    if (img && lightboxImage) {
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt || 'Revit Project';
    }

    if (titleEl && lightboxCaption) {
      lightboxCaption.textContent = titleEl.textContent;
    }

    if (lightboxModal) {
      lightboxModal.classList.add('active');
      document.body.classList.add('lightbox-open');
    }
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      document.body.classList.remove('lightbox-open');
    }
  }

  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      updateVisibleCards();
      const index = activeVisibleCards.indexOf(item);
      if (index !== -1) {
        showLightbox(index);
      }
    });
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    // Touch swipe navigation for mobile Lightbox
    let touchStartX = 0;
    let touchStartY = 0;

    lightboxModal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Only trigger swipe if horizontal movement is dominant and > 40px
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX > 0) {
          // Swipe right: previous in RTL, next in LTR
          showLightbox(currentLang === 'ar' ? currentImageIndex - 1 : currentImageIndex + 1);
        } else {
          // Swipe left: next in RTL, previous in LTR
          showLightbox(currentLang === 'ar' ? currentImageIndex + 1 : currentImageIndex - 1);
        }
      }
    }, { passive: true });
  }

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightbox(currentImageIndex - 1);
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightbox(currentImageIndex + 1);
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (lightboxModal && lightboxModal.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightbox(currentLang === 'ar' ? currentImageIndex + 1 : currentImageIndex - 1);
      if (e.key === 'ArrowRight') showLightbox(currentLang === 'ar' ? currentImageIndex - 1 : currentImageIndex + 1);
    }
  });

  // --- Instant WhatsApp Quote Generator & Form Handling ---
  const sendWhatsappBtn = document.getElementById('sendWhatsappBtn');
  const sendEmailBtn = document.getElementById('sendEmailBtn');

  function getFormData() {
    const name = document.getElementById('clientName')?.value.trim() || '';
    const phone = document.getElementById('clientPhone')?.value.trim() || '';
    const service = document.getElementById('clientService')?.value || '';
    const area = document.getElementById('clientArea')?.value.trim() || '';
    const location = document.getElementById('clientLocation')?.value.trim() || '';
    const details = document.getElementById('clientDetails')?.value.trim() || '';

    return { name, phone, service, area, location, details };
  }

  function showToast(message) {
    if (!toast) return;
    const msgEl = toast.querySelector('.toast-msg');
    if (msgEl) msgEl.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  if (sendWhatsappBtn) {
    sendWhatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const data = getFormData();

      if (!data.name || !data.phone) {
        alert(currentLang === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف على الأقل.' : 'Please enter your name and phone number.');
        return;
      }

      // Format WhatsApp Message
      let msg = '';
      if (currentLang === 'ar') {
        msg = `*طلب عرض سعر واستشارة هندسية - شركة ريفيت للمقاولات والتوريدات*\n\n` +
              `👤 *الاسم:* ${data.name}\n` +
              `📱 *الهاتف:* ${data.phone}\n` +
              `🏗️ *نوع الخدمة:* ${data.service || 'غير محدد'}\n` +
              `📐 *المساحة:* ${data.area ? data.area + ' م²' : 'غير محددة'}\n` +
              `📍 *موقع المشروع:* ${data.location || 'غير محدد'}\n` +
              `📝 *تفاصيل إضافية:* ${data.details || 'لا توجد ملاحظات إضافية'}\n\n` +
              `تم الإرسال عبر الموقع الإلكتروني لشركة ريفيت.`;
      } else {
        msg = `*Quote Request & Engineering Consultation - Revit Contracting*\n\n` +
              `👤 *Name:* ${data.name}\n` +
              `📱 *Phone:* ${data.phone}\n` +
              `🏗️ *Service:* ${data.service || 'Not specified'}\n` +
              `📐 *Area:* ${data.area ? data.area + ' m²' : 'Not specified'}\n` +
              `📍 *Location:* ${data.location || 'Not specified'}\n` +
              `📝 *Details:* ${data.details || 'None'}\n\n` +
              `Sent from Revit Official Website.`;
      }

      const encodedMsg = encodeURIComponent(msg);
      // Main WhatsApp number: +201044743355
      const whatsappUrl = `https://wa.me/201044743355?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');
      showToast(translations[currentLang]["form.successMsg"]);
    });
  }

  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const data = getFormData();
      if (!data.name || !data.phone) {
        alert(currentLang === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف على الأقل.' : 'Please enter your name and phone number.');
        return;
      }
      showToast(translations[currentLang]["form.successMsg"]);
      if (quoteForm) quoteForm.reset();
    });
  }
});
