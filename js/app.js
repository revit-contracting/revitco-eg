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
  const themeToggleBtnMobile = document.getElementById('themeToggleBtnMobile');
  const themeToggleMobileText = document.getElementById('themeToggleMobileText');
  const themeToggleMobileIcon = document.getElementById('themeToggleMobileIcon');
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

    // Update element titles with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (translations[lang] && translations[lang][key]) {
        el.setAttribute('title', translations[lang][key]);
      }
    });

    // Update aria-labels with data-i18n-aria-label
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (translations[lang] && translations[lang][key]) {
        el.setAttribute('aria-label', translations[lang][key]);
      }
    });

    // Translate portfolio tags and titles
    translatePortfolio(lang);

    // Re-run dynamic finishing calculation in the selected language
    if (typeof runFinishingCalculation === 'function') {
      runFinishingCalculation();
    }

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

  function filterPortfolio(filterCategory, isInitial = false) {
    portfolioItems.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      const matches = filterCategory === 'all' || itemCategory === filterCategory;

      if (matches) {
        item.style.display = 'block';
        if (isInitial) {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        }
      } else {
        if (isInitial) {
          item.style.display = 'none';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      }
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filterCategory = tab.getAttribute('data-filter');
      filterPortfolio(filterCategory);
    });
  });

  // Apply initial filter for the active tab on page load
  const activeTab = document.querySelector('.filter-tab-btn.active');
  if (activeTab) {
    filterPortfolio(activeTab.getAttribute('data-filter'), true);
  }

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

      const subject = currentLang === 'ar'
        ? `طلب استشارة هندسية ومقايسة - ${data.name}`
        : `Engineering Consultation & Quote Request - ${data.name}`;

      let body = '';
      if (currentLang === 'ar') {
        body = `طلب مقايسة واستشارة هندسية - شركة ريفيت\n\n` +
               `الاسم: ${data.name}\n` +
               `رقم الهاتف: ${data.phone}\n` +
               `الخدمة المطلوبة: ${data.service || 'غير محدد'}\n` +
               `المساحة: ${data.area ? data.area + ' م²' : 'غير محدد'}\n` +
               `الموقع: ${data.location || 'غير محدد'}\n` +
               `تفاصيل المشروع: ${data.details || 'لا يوجد'}\n\n` +
               `تم الإرسال عبر الموقع الإلكتروني لشركة ريفيت.`;
      } else {
        body = `Engineering Consultation & Quote Request - Revit Contracting\n\n` +
               `Name: ${data.name}\n` +
               `Phone: ${data.phone}\n` +
               `Service: ${data.service || 'Not specified'}\n` +
               `Area: ${data.area ? data.area + ' m²' : 'Not specified'}\n` +
               `Location: ${data.location || 'Not specified'}\n` +
               `Details: ${data.details || 'None'}\n\n` +
               `Sent from Revit Official Website.`;
      }

      const mailtoUrl = `mailto:revit.egypt@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;

      showToast(translations[currentLang]["form.successMsg"]);
      if (quoteForm) quoteForm.reset();
    });
  }

  // Footer Email Button Click Feedback
  const footerEmailBtn = document.querySelector('.footer-social-btn[href^="mailto:"]');
  if (footerEmailBtn) {
    footerEmailBtn.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('revit.egypt@gmail.com').catch(() => {});
      }
      showToast(currentLang === 'ar' ? 'تم نسخ البريد الإلكتروني: revit.egypt@gmail.com' : 'Email copied: revit.egypt@gmail.com');
    });
  }

  // --- Site Execution Reels Player Functionality ---
  const reelCards = document.querySelectorAll('.reel-card');

  reelCards.forEach(card => {
    const video = card.querySelector('.reel-video');
    const audioBtn = card.querySelector('.reel-audio-btn');
    const progressFill = card.querySelector('.reel-progress-fill');
    if (!video) return;

    // Toggle play/pause on card click (excluding audio button)
    card.addEventListener('click', (e) => {
      if (e.target.closest('.reel-audio-btn')) return;

      if (video.paused) {
        // Pause any other playing reels
        document.querySelectorAll('.reel-card.is-playing video').forEach(v => {
          if (v !== video) {
            v.pause();
            v.closest('.reel-card').classList.remove('is-playing');
          }
        });

        video.play().then(() => {
          card.classList.add('is-playing');
        }).catch(() => {});
      } else {
        video.pause();
        card.classList.remove('is-playing');
      }
    });

    // Toggle audio
    if (audioBtn) {
      audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        const icon = audioBtn.querySelector('i');
        if (icon) {
          if (video.muted) {
            icon.className = 'fas fa-volume-mute';
            audioBtn.setAttribute('title', currentLang === 'ar' ? 'تشغيل الصوت' : 'Unmute');
          } else {
            icon.className = 'fas fa-volume-up';
            audioBtn.setAttribute('title', currentLang === 'ar' ? 'كتم الصوت' : 'Mute');
          }
        }
        // If paused, play when unmuting
        if (!video.muted && video.paused) {
          video.play().then(() => {
            card.classList.add('is-playing');
          }).catch(() => {});
        }
      });
    }

    // Update progress bar
    video.addEventListener('timeupdate', () => {
      if (progressFill && video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        progressFill.style.width = percent + '%';
      }
    });

    // Reset progress when looped/ended
    video.addEventListener('ended', () => {
      if (progressFill) progressFill.style.width = '0%';
    });

    // Desktop hover preview (muted)
    card.addEventListener('mouseenter', () => {
      if (window.innerWidth > 992 && video.paused) {
        video.play().then(() => {
          card.classList.add('is-playing');
        }).catch(() => {});
      }
    });

    card.addEventListener('mouseleave', () => {
      if (window.innerWidth > 992 && !video.paused && video.muted) {
        video.pause();
        card.classList.remove('is-playing');
      }
    });
  });

  // IntersectionObserver: Pause reels when scrolled out of view to save CPU/battery
  if ('IntersectionObserver' in window) {
    const reelsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        if (!entry.isIntersecting && video && !video.paused) {
          video.pause();
          entry.target.classList.remove('is-playing');
        }
      });
    }, { threshold: 0.25 });

    reelCards.forEach(card => reelsObserver.observe(card));
  }

  // --- Smart Finishing Guide Digital Reader Modal Controller ---
  const guideModal = document.getElementById('guideModal');
  const openGuideModalBtn = document.getElementById('openGuideModalBtn');
  const bookTriggerBtn = document.getElementById('bookTriggerBtn');
  const closeGuideModalBtn = document.getElementById('closeGuideModalBtn');
  const closeGuideModalBtnBottom = document.getElementById('closeGuideModalBtnBottom');

  function openGuideModal() {
    if (guideModal) {
      guideModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeGuideModal() {
    if (guideModal) {
      guideModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (openGuideModalBtn) {
    openGuideModalBtn.addEventListener('click', openGuideModal);
  }

  if (bookTriggerBtn) {
    bookTriggerBtn.addEventListener('click', openGuideModal);
  }

  if (closeGuideModalBtn) {
    closeGuideModalBtn.addEventListener('click', closeGuideModal);
  }

  if (closeGuideModalBtnBottom) {
    closeGuideModalBtnBottom.addEventListener('click', closeGuideModal);
  }

  if (guideModal) {
    guideModal.addEventListener('click', (e) => {
      if (e.target === guideModal) {
        closeGuideModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && guideModal && guideModal.classList.contains('active')) {
      closeGuideModal();
    }
  });
});

// =========================================================================


// =========================================================================
// Executive Finishing Calculator Logic
// =========================================================================
function selectTierCard(rate, name, el) {
  const cards = document.querySelectorAll('#tierSelectorDeck .tier-card-btn');
  cards.forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');

  const tierInput = document.getElementById('finishingTier');
  if (tierInput) tierInput.value = rate;

  runFinishingCalculation();

}

function syncAreaFromInput(val) {
  const slider = document.getElementById('finishingAreaSlider');
  if (slider) slider.value = val;
  runFinishingCalculation();
}

function syncAreaFromSlider(val) {
  const input = document.getElementById('finishingArea');
  if (input) input.value = val;
  runFinishingCalculation();
}

function setQuickArea(area) {
  const input = document.getElementById('finishingArea');
  const slider = document.getElementById('finishingAreaSlider');
  if (input) input.value = area;
  if (slider) slider.value = area;
  runFinishingCalculation();
}



function switchPackageTier(index) {
  const grid = document.querySelector(".packages-grid");
  const cards = document.querySelectorAll(".packages-grid .package-card");
  const buttons = document.querySelectorAll(".packages-tiers-nav .tier-nav-btn");

  buttons.forEach(btn => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });

  const activeBtn = document.getElementById("btnTier" + index);
  if (activeBtn) {
    activeBtn.classList.add("active");
    activeBtn.setAttribute("aria-selected", "true");
  }
  if (grid) grid.classList.add("single-tier-active");
  cards.forEach((card, i) => {
    if (i === index) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

function switchAboutCertTab(tab) {
  const aboutPane = document.getElementById("aboutTabPane");
  const certsPane = document.getElementById("certsTabPane");
  const btnAbout = document.getElementById("btnShowAbout");
  const btnCerts = document.getElementById("btnShowCerts");
  const badgeAbout = document.getElementById("badgeAbout");
  const badgeCerts = document.getElementById("badgeCerts");

  if (tab === "about") {
    if (aboutPane) aboutPane.style.display = "block";
    if (certsPane) certsPane.style.display = "none";
    if (btnAbout) {
      btnAbout.classList.add("active");
      btnAbout.setAttribute("aria-selected", "true");
    }
    if (btnCerts) {
      btnCerts.classList.remove("active");
      btnCerts.setAttribute("aria-selected", "false");
    }
    if (badgeAbout) badgeAbout.style.display = "none";
    if (badgeCerts) badgeCerts.style.display = "inline-block";
  } else if (tab === "certs") {
    if (certsPane) certsPane.style.display = "block";
    if (aboutPane) aboutPane.style.display = "none";
    if (btnCerts) {
      btnCerts.classList.add("active");
      btnCerts.setAttribute("aria-selected", "true");
    }
    if (btnAbout) {
      btnAbout.classList.remove("active");
      btnAbout.setAttribute("aria-selected", "false");
    }
    if (badgeCerts) badgeCerts.style.display = "none";
    if (badgeAbout) badgeAbout.style.display = "inline-block";
  }
}

window.addEventListener("hashchange", () => {
  if (location.hash === "#certifications") {
    switchAboutCertTab("certs");
  } else if (location.hash === "#about") {
    switchAboutCertTab("about");
  }
});

function switchPackageTool(tool) {
  const calc = document.getElementById("finishingCalc");
  const comp = document.getElementById("packagesComparisonDeck");
  const btnCalc = document.getElementById("btnShowCalc");
  const btnComp = document.getElementById("btnShowCompare");
  const badgeCalc = document.getElementById("badgeCalc");
  const badgeCompare = document.getElementById("badgeCompare");

  if (tool === "calc") {
    if (calc) { calc.style.display = "block"; }
    if (comp) { comp.style.display = "none"; }
    if (btnCalc) {
      btnCalc.classList.add("active");
      btnCalc.setAttribute("aria-selected", "true");
    }
    if (btnComp) {
      btnComp.classList.remove("active");
      btnComp.setAttribute("aria-selected", "false");
    }
    if (badgeCalc) badgeCalc.style.display = "none";
    if (badgeCompare) badgeCompare.style.display = "inline-block";
  } else if (tool === "compare") {
    if (comp) { comp.style.display = "block"; }
    if (calc) { calc.style.display = "none"; }
    if (btnComp) {
      btnComp.classList.add("active");
      btnComp.setAttribute("aria-selected", "true");
    }
    if (btnCalc) {
      btnCalc.classList.remove("active");
      btnCalc.setAttribute("aria-selected", "false");
    }
    if (badgeCompare) badgeCompare.style.display = "none";
    if (badgeCalc) badgeCalc.style.display = "inline-block";
  }
}

function setFinishingPackage(rate, name) {
  switchPackageTool("calc");
  const cards = document.querySelectorAll('#tierSelectorDeck .tier-card-btn');
  cards.forEach(c => {
    if (c.innerText.includes(name)) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });

  const tierInput = document.getElementById('finishingTier');
  if (tierInput) tierInput.value = rate;

  runFinishingCalculation();

  const calcElem = document.getElementById('finishingCalc');
  if (calcElem) {
    calcElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// =========================================================================
// Bilingual Portfolio Translation Mappings & Logic
// =========================================================================
const portfolioTagMap = {
  "مخططات 2D": "2D Architectural Plans",
  "تصميم داخلي": "Interior Design",
  "عمارة": "Architecture",
  "حمامات": "Master Bathrooms",
  "دريسينج": "Walk-In Dressing",
  "غرف اطفال": "Kids Bedrooms",
  "غرف نوم": "Master Bedrooms",
  "فيلا": "Luxury Villa",
  "مكتبة شاشة": "TV Media Wall",
  "سفرة": "Dining Room",
  "دهانات داخلية": "Interior Wall Finishes",
  "سلالم": "Staircases & Railings",
  "طرقات داخلية": "Corridors & Hallways",
  "مطابخ": "Modern Kitchens",
  "مكاتب": "Commercial & Offices",
  "فندق": "Luxury Hotel Design",
  "مزرعة خيل": "Equestrian Stables",
  "اسوار": "Perimeter Walls",
  "بوابات حديد": "Wrought Iron Gates",
  "صور اثناء التنفيذ": "Site Construction",
  "واجهات": "Exterior Facades",
  "لاندسكيب": "Landscape Architecture",
  "لاندسكيب كامب": "Camp & Resort Landscape",
  "لاندسكيب فيلا": "Villa Landscape"
};

const portfolioTitleMap = {
  "الدور الارضي برج سكني": "Ground Floor - Residential Tower Plan",
  "الدور المتكرر برج سكني": "Typical Floor - Residential Tower Plan",
  "مخطط معماري تنفيذي - مسقط الدور الأرضي (نموذج 1)": "Working Architectural Plan - Ground Floor (Model 1)",
  "مخطط معماري تنفيذي - مسقط الدور الأول (نموذج 1)": "Working Architectural Plan - First Floor (Model 1)",
  "مسقط أفقي تفصيلي - توزيع الفراغات للدور الأرضي": "Detailed Floor Plan - Ground Floor Layout",
  "مسقط أفقي تفصيلي - التقسيم الداخلي للدور الأول": "Detailed Floor Plan - First Floor Layout",
  "مسقط أفقي تفصيلي - التقسيم والتوزيع للدور الثاني": "Detailed Floor Plan - Second Floor Layout",
  "مخطط أوتوكاد معماري - مسقط الدور الأرضي والمداخل": "AutoCAD Architectural Plan - Ground Floor & Entrances",
  "مخطط معماري شامل - نموذج فيلا سكنية متكاملة": "Comprehensive Architectural Blueprint - Residential Villa",
  "المخطط المعماري التنفيذي المعتمد النهائي": "Approved Final Architectural Working Blueprint"
};

function translatePortfolioTitle(title) {
  if (portfolioTitleMap[title]) return portfolioTitleMap[title];

  return title
    .replace(/^تصميم داخلي فاخر\s*-\s*(\d+)$/, 'Luxury Interior Design - $1')
    .replace(/^تصميم عمارة سكنية\s*-\s*(\d+)$/, 'Residential Building Design - $1')
    .replace(/^تصميم فندق فاخر\s*-\s*(\d+)$/, 'Luxury Hotel Concept - $1')
    .replace(/^تصميم اسطبل خيل\s*-\s*(\d+)$/, 'Equestrian Stables Concept - $1')
    .replace(/^تصميم لاندسكيب\s*-\s*(\d+)$/, 'Landscape Architecture Concept - $1')
    .replace(/^تصميم لاندسكيب كامب\s*-\s*(\d+)$/, 'Resort & Desert Camp Landscape - $1')
    .replace(/^تصميم لاندسكيب فيلا\s*-\s*(\d+)$/, 'Private Villa Landscape & Gardens - $1')
    .replace(/^تصميم حمامات ماستر فاخرة 3D\s*-\s*لوحة\s*(\d+)$/, '3D Luxury Master Bathroom Concept - Board $1')
    .replace(/^غرف ملابس ودريسينج روم مودرن\s*-\s*لوحة\s*(\d+)$/, 'Modern Walk-In Closet & Dressing Room - Board $1')
    .replace(/^تصميم غرف أطفال مبهجة وعصرية\s*-\s*لوحة\s*(\d+)$/, 'Vibrant & Modern Kids Bedroom Design - Board $1')
    .replace(/^أجنحة وغرف نوم رئيسية راقية\s*-\s*لوحة\s*(\d+)$/, 'Executive Master Bedroom Suite - Board $1')
    .replace(/^تصميمات فلل وقصور ثلاثية الأبعاد\s*-\s*لوحة\s*(\d+)$/, '3D Luxury Villa & Mansion Concepts - Board $1')
    .replace(/^ديكورات ومكتبات شاشات تلفزيون\s*-\s*لوحة\s*(\d+)$/, 'Bespoke TV Unit & Media Wall Decor - Board $1')
    .replace(/^غرف سفرة وطعام مودرن فاخرة\s*-\s*لوحة\s*(\d+)$/, 'Modern Luxury Dining Hall Concept - Board $1')
    .replace(/^تشطيبات ودهانات ديكورية مميزة\s*-\s*لوحة\s*(\d+)$/, 'Premium Decorative Coatings & Wall Finishes - Board $1')
    .replace(/^ديكورات وتشطيبات سلالم رخامية وخشبية\s*-\s*لوحة\s*(\d+)$/, 'Luxury Marble & Wood Staircase Finishes - Board $1')
    .replace(/^ممرات وطرقات داخلية بأحدث الإضاءات\s*-\s*لوحة\s*(\d+)$/, 'Ambient Lit Corridors & Hallways - Board $1')
    .replace(/^مطابخ عصرية متطورة بتشطيبات راقية\s*-\s*لوحة\s*(\d+)$/, 'Contemporary High-End Designer Kitchen - Board $1')
    .replace(/^تصميم وتشطيب مساحات مكاتب ومقرات إدارية\s*-\s*لوحة\s*(\d+)$/, 'Corporate Office & Executive Space Fit-Out - Board $1')
    .replace(/^إنشاء وتشطيب أسوار خرسانية وديكورية\s*-\s*لوحة\s*(\d+)$/, 'Decorative & Structural Boundary Walls - Board $1')
    .replace(/^تصنيع وتركيب بوابات حديد ليزر وفورفورجيه\s*-\s*لوحة\s*(\d+)$/, 'CNC Laser & Wrought Iron Gates - Board $1')
    .replace(/^أعمال التنفيذ والإنشاءات بالمواقع الميدانية\s*-\s*لوحة\s*(\d+)$/, 'Active Site Works & Structural Execution - Board $1')
    .replace(/^تنفيذ واجهات معمارية خارجية مودرن ونيوكلاسيك\s*-\s*لوحة\s*(\d+)$/, 'Modern & Neoclassic Exterior Facades - Board $1')
    .replace(/^تصميم وتنسيق حدائق ولاندسكيب متكامل\s*-\s*لوحة\s*(\d+)$/, 'Turnkey Garden & Landscape Design - Board $1');
}

function translatePortfolio(lang) {
  document.querySelectorAll('.portfolio-item-card').forEach(card => {
    const tagEl = card.querySelector('.portfolio-badge-tag');
    const titleEl = card.querySelector('.portfolio-item-title');

    if (tagEl) {
      if (!tagEl.hasAttribute('data-ar-tag')) {
        tagEl.setAttribute('data-ar-tag', tagEl.innerText.trim());
      }
      if (lang === 'en') {
        const ar = tagEl.getAttribute('data-ar-tag');
        tagEl.innerText = portfolioTagMap[ar] || ar;
      } else {
        tagEl.innerText = tagEl.getAttribute('data-ar-tag');
      }
    }

    if (titleEl) {
      if (!titleEl.hasAttribute('data-ar-title')) {
        titleEl.setAttribute('data-ar-title', titleEl.innerText.trim());
      }
      if (lang === 'en') {
        const ar = titleEl.getAttribute('data-ar-title');
        titleEl.innerText = translatePortfolioTitle(ar);
      } else {
        titleEl.innerText = titleEl.getAttribute('data-ar-title');
      }
    }
  });
}

function runFinishingCalculation() {
  const areaInput = document.getElementById('finishingArea');
  const tierInput = document.getElementById('finishingTier');
  const totalDisplay = document.getElementById('finishingTotalFigure');
  const durationDisplay = document.getElementById('finishingDuration');
  const whatsappBtn = document.getElementById('calcWhatsappLink');

  if (!areaInput || !tierInput || !totalDisplay) return;

  const area = parseFloat(areaInput.value) || 0;
  const rate = parseFloat(tierInput.value) || 6600;
  const total = area * rate;
  const isEn = (document.documentElement.getAttribute('lang') === 'en');

  const currencyUnit = isEn ? ' EGP' : ' ج.م';
  const locale = isEn ? 'en-US' : 'ar-EG';

  totalDisplay.innerText = total.toLocaleString(locale) + currencyUnit;

  const inst1 = document.getElementById('inst1');
  const inst2 = document.getElementById('inst2');
  const inst3 = document.getElementById('inst3');
  const inst4 = document.getElementById('inst4');
  const inst5 = document.getElementById('inst5');

  if (inst1) inst1.innerText = (total * 0.20).toLocaleString(locale) + currencyUnit;
  if (inst2) inst2.innerText = (total * 0.25).toLocaleString(locale) + currencyUnit;
  if (inst3) inst3.innerText = (total * 0.25).toLocaleString(locale) + currencyUnit;
  if (inst4) inst4.innerText = (total * 0.20).toLocaleString(locale) + currencyUnit;
  if (inst5) inst5.innerText = (total * 0.10).toLocaleString(locale) + currencyUnit;

  let duration = isEn ? "60 to 90 business days" : "من 60 إلى 90 يوم عمل";
  let packageName = isEn ? "Economic Package" : "الباقة الاقتصادية";

  if (rate === 6600) {
    duration = isEn ? "60 to 90 business days" : "من 60 إلى 90 يوم عمل";
    packageName = isEn ? "Deluxe Package" : "الباقة اللوكس";
  } else if (rate === 9000) {
    duration = isEn ? "75 to 90 business days" : "من 75 إلى 90 يوم عمل";
    packageName = isEn ? "VIP Package" : "باقة VIP";
  } else if (rate === 20500) {
    duration = isEn ? "90 to 120 business days" : "من 90 إلى 120 يوم عمل";
    packageName = isEn ? "LUXURY Hotel Package" : "باقة LUXURY الفندقية";
  }

  if (durationDisplay) {
    const durationPrefix = isEn ? 'Execution Timeline: ' : 'مدة التنفيذ: ';
    durationDisplay.innerHTML = '<i class="far fa-clock"></i> ' + durationPrefix + duration;
  }

  if (whatsappBtn) {
    var msg = isEn
      ? encodeURIComponent('Hello Revit Contracting, I would like to book an engineering consultation & site visit for (' + packageName + ') for an area of ' + area + ' m² with an estimated total of ' + total.toLocaleString('en-US') + ' EGP')
      : encodeURIComponent('مرحباً شركة ريفيت للمقاولات، أرغب في حجز استشارة ومعاينة هندسية لـ (' + packageName + ') لمساحة ' + area + ' م² بإجمالي تقديري ' + total.toLocaleString('ar-EG') + ' ج.م');
    whatsappBtn.href = 'https://wa.me/201044743355?text=' + msg;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  runFinishingCalculation();
  if (document.querySelector(".packages-tiers-nav")) { switchPackageTier(0); }
  if (location.hash === "#certifications") { switchAboutCertTab("certs"); }
});
