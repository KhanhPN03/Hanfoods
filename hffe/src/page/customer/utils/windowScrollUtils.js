/**
 * Window Scroll Utilities for ProductDetail Page
 * This file contains utilities to improve scrolling behavior globally
 */

/**
 * Fix scrolling issues by disabling and re-enabling body position
 * This is particularly useful for iOS devices
 */
function applyScrollFixes() {
  // Check if we're on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  if (isIOS) {
    // Fix for iOS bounce effect
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Re-enable proper scrolling
    setTimeout(() => {
      document.body.style.position = '';
    }, 300);
  }
  
  // Ensure smooth scrolling for all browsers
  if (!CSS.supports('scroll-behavior', 'smooth')) {
    // Polyfill for smooth scrolling
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } else {
    window.scrollTo(0, 0);
  }
}

/**
 * Add passive scroll listeners for improved performance
 */
function setupPassiveListeners() {
  // Check if passive listeners are supported
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() { supportsPassive = true; return true; }
    });
    window.addEventListener('test', null, opts);
    window.removeEventListener('test', null, opts);
  } catch (e) {}
  
  // Add passive listeners for scroll events
  if (supportsPassive) {
    const scrollableElements = document.querySelectorAll('.scroll-container');
    scrollableElements.forEach(el => {
      el.addEventListener('scroll', () => {}, { passive: true });
      el.addEventListener('wheel', () => {}, { passive: true });
      el.addEventListener('touchstart', () => {}, { passive: true });
      el.addEventListener('touchmove', () => {}, { passive: true });
    });
  }
}

/**
 * Fix viewport issues on mobile devices
 */
function fixMobileViewport() {
  // Set viewport height variable for CSS
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  // Set initial viewport height
  setViewportHeight();
  
  // Update on resize or orientation change
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', setViewportHeight);
}

export { applyScrollFixes, setupPassiveListeners, fixMobileViewport };
