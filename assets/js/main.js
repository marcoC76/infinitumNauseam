(function() {
  'use strict';

  // --- Terminal boot sequence ---
  function bootSequence() {
    const header = document.querySelector('.terminal-status');
    if (header) {
      const msgs = [
        'CARGANDO_KERNEL...',
        'INICIANDO_SUBSISTEMA_NARRATIVO...',
        'CONECTANDO_AL_ABISMO...',
        'SISTEMA_INICIALIZADO'
      ];
      let i = 0;
      const interval = setInterval(function() {
        if (i < msgs.length) {
          header.textContent = msgs[i];
          header.style.color = i === msgs.length - 1 ? '#00ff41' : '#8a6000';
          i++;
        } else {
          clearInterval(interval);
        }
      }, 600);
    }
  }

  // --- Typewriter effect for titles ---
  function typewriterEffect(element, text, speed) {
    if (!element) return;
    speed = speed || 50;
    element.textContent = '';
    element.style.borderRight = '2px solid #00ff41';
    element.style.display = 'inline-block';
    element.style.overflow = 'hidden';
    element.style.whiteSpace = 'nowrap';

    let i = 0;
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed + Math.random() * 60);
      } else {
        element.style.borderRight = '2px solid #00ff41';
        setInterval(function() {
          if (element.style.borderColor === 'transparent') {
            element.style.borderColor = '#00ff41';
          } else {
            element.style.borderColor = 'transparent';
          }
        }, 500);
      }
    }
    type();
  }

  // --- Glitch on hover for post items ---
  function initGlitchEffect() {
    var items = document.querySelectorAll('.post-item-title');
    items.forEach(function(el) {
      var text = el.textContent;
      el.setAttribute('data-text', text);
      el.classList.add('glitch');
    });
  }

  // --- Random static flicker ---
  function staticFlicker() {
    var overlay = document.querySelector('.noise-overlay');
    if (!overlay) return;
    setInterval(function() {
      if (Math.random() < 0.1) {
        overlay.style.opacity = '0.08';
        setTimeout(function() {
          overlay.style.opacity = '0.035';
        }, 100);
      }
    }, 3000);
  }

  // --- Terminal clock ---
  function updateClock() {
    var clockEl = document.querySelector('.terminal-time');
    if (!clockEl) return;
    var now = new Date();
    var hours = String(now.getHours()).padStart(2, '0');
    var mins = String(now.getMinutes()).padStart(2, '0');
    var secs = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = hours + ':' + mins + ':' + secs;
  }

  // --- Fade-in on scroll for post items ---
  function initScrollReveal() {
    var items = document.querySelectorAll('.post-item');
    if (!items.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }
      });
    }, { threshold: 0.1 });

    items.forEach(function(item) {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      item.style.transition = 'all 0.5s ease';
      observer.observe(item);
    });
  }

  // --- Random glitch on the site title ---
  function initTitleGlitch() {
    var title = document.querySelector('.site-title .title-text');
    if (!title) return;
    var original = title.textContent;
    setInterval(function() {
      if (Math.random() < 0.05) {
        var glitched = original.split('').map(function(c) {
          if (Math.random() < 0.3) {
            var chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return c;
        }).join('');
        title.textContent = glitched;
        title.style.color = '#ff1a1a';
        setTimeout(function() {
          title.textContent = original;
          title.style.color = '';
        }, 150);
      }
    }, 4000);
  }

  // --- Initialize ---
  document.addEventListener('DOMContentLoaded', function() {
    bootSequence();
    initGlitchEffect();
    staticFlicker();
    initScrollReveal();
    initTitleGlitch();
    updateClock();
    setInterval(updateClock, 1000);

    // Typewriter effect on post pages
    var postTitle = document.querySelector('.post-title.typewriter');
    if (postTitle) {
      var text = postTitle.getAttribute('data-text') || postTitle.textContent.trim();
      typewriterEffect(postTitle, text, 45);
    }

    // Typewriter effect on home title
    var homeTitle = document.querySelector('.home-title.typewriter');
    if (homeTitle) {
      var text = homeTitle.getAttribute('data-text') || homeTitle.textContent.trim();
      typewriterEffect(homeTitle, text, 40);
    }
  });

})();
