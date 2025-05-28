/**
 * Touch Utility for Product Detail Page
 * 
 * This script provides touch-based interactions for the product detail page,
 * enhancing the mobile experience by adding touch gestures for galleries,
 * tab navigation, and other interactive elements.
 * 
 * Features:
 * - Smooth scrolling for horizontal elements
 * - Gallery swipe navigation
 * - Image zoom on long press
 * - Passive touch handlers for better performance
 * - Hardware-accelerated animations
 */

// Constants for touch events
const SWIPE_THRESHOLD = 50; // Minimum distance to be considered a swipe
const SWIPE_TIMEOUT = 300; // Maximum time (ms) to complete a swipe
const PASSIVE_SUPPORT = checkPassiveSupport();

// Check if passive event listeners are supported
function checkPassiveSupport() {
  let supportsPassive = false;
  try {
    // Test via a getter in the options object to see if the passive property is accessed
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {}
  return supportsPassive;
}

// Helper function to register touch events
function registerTouchEvents() {
  // Use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    // Gallery swipe functionality
    const galleryMain = document.querySelector('.product-gallery-main');
    if (galleryMain) {
      setupGallerySwipe(galleryMain);
    }
    
    // Tabs navigation swipe
    const tabsNav = document.querySelector('.product-tabs-nav');
    if (tabsNav) {
      setupHorizontalScroll(tabsNav);
    }
    
    // Product thumbnails scroll
    const thumbnailsContainer = document.querySelector('.product-thumbnails');
    if (thumbnailsContainer) {
      setupHorizontalScroll(thumbnailsContainer);
    }
    
    // Add long-press functionality for zoom (if supported)
    const productImages = document.querySelectorAll('.gallery-image');
    productImages.forEach(img => {
      setupLongPress(img);
    });

    // Make all scrollable areas smooth on iOS
    const scrollContainers = document.querySelectorAll('.scroll-container, .horizontal-scroll');
    scrollContainers.forEach(container => {
      setupSmoothScrolling(container);
    });
  });
}

/**
 * Setup smooth scrolling for containers
 * @param {HTMLElement} element - The container element
 */
function setupSmoothScrolling(element) {
  // Add CSS properties for smooth scrolling
  element.style.webkitOverflowScrolling = 'touch';
  element.style.scrollBehavior = 'smooth';
  
  // Mark for hardware acceleration
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'scroll-position';
}

/**
 * Setup horizontal scrolling with momentum
 * @param {HTMLElement} element - The scrollable element
 */
function setupHorizontalScroll(element) {
  let isDown = false;
  let startX;
  let scrollLeft;
  const options = PASSIVE_SUPPORT ? { passive: true } : false;

  element.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - element.offsetLeft;
    scrollLeft = element.scrollLeft;
  }, options);

  element.addEventListener('touchend', () => {
    isDown = false;
  }, options);

  // Use a non-passive listener for touchmove to allow preventDefault
  element.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    
    // Don't prevent default scrolling behavior
    // This allows native scrolling with momentum
    
    const x = e.touches[0].pageX - element.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    
    requestAnimationFrame(() => {
      element.scrollLeft = scrollLeft - walk;
    });
  }, { passive: false });
}

/**
 * Setup gallery swipe navigation
 * @param {HTMLElement} gallery - The gallery container element
 */
function setupGallerySwipe(gallery) {
  let touchstartX = 0;
  let touchendX = 0;
  let touchstartTime = 0;
  const options = PASSIVE_SUPPORT ? { passive: true } : false;
  
  gallery.addEventListener('touchstart', (e) => {
    touchstartX = e.changedTouches[0].screenX;
    touchstartTime = new Date().getTime();
  }, options);
  
  gallery.addEventListener('touchend', (e) => {
    touchendX = e.changedTouches[0].screenX;
    const touchDuration = new Date().getTime() - touchstartTime;
    
    // Confirm it's a swipe (fast enough and far enough)
    if (touchDuration < SWIPE_TIMEOUT) {
      handleGallerySwipe(touchstartX, touchendX);
    }
  }, options);
}

/**
 * Handle gallery swipe navigation
 * @param {number} startX - Starting X position
 * @param {number} endX - Ending X position
 */
function handleGallerySwipe(startX, endX) {
  const difference = Math.abs(startX - endX);
  
  if (difference > SWIPE_THRESHOLD) {
    // Determine swipe direction
    if (startX > endX) {
      // Swiped left - next image
      const nextBtn = document.querySelector('.gallery-nav-next');
      if (nextBtn) nextBtn.click();
    } else {
      // Swiped right - previous image
      const prevBtn = document.querySelector('.gallery-nav-prev');
      if (prevBtn) prevBtn.click();
    }
  }
}

/**
 * Setup long-press functionality
 * @param {HTMLElement} element - The element to apply long press to
 */
function setupLongPress(element) {
  let timer;
  let isLongPress = false;
  const options = PASSIVE_SUPPORT ? { passive: true } : false;
  
  element.addEventListener('touchstart', () => {
    isLongPress = false;
    timer = setTimeout(() => {
      isLongPress = true;
      openZoomView(element);
    }, 500); // 500ms long press
  }, options);
  
  element.addEventListener('touchend', () => {
    clearTimeout(timer);
  }, options);
  
  // Prevent click event if it was a long press
  element.addEventListener('click', (e) => {
    if (isLongPress) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
}

/**
 * Open zoom view for image with pinch zoom support
 * @param {HTMLElement} imgElement - The image element
 */
function openZoomView(imgElement) {
  // Create overlay with hardware acceleration
  const overlay = document.createElement('div');
  overlay.className = 'zoom-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
  overlay.style.zIndex = '2000';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.transform = 'translateZ(0)'; // Hardware acceleration
  
  // Create zoomed image container for pinch zoom
  const imageContainer = document.createElement('div');
  imageContainer.style.position = 'relative';
  imageContainer.style.width = '90%';
  imageContainer.style.height = '90%';
  imageContainer.style.display = 'flex';
  imageContainer.style.alignItems = 'center';
  imageContainer.style.justifyContent = 'center';
  
  // Create zoomed image with hardware acceleration
  const zoomedImg = document.createElement('img');
  zoomedImg.src = imgElement.src;
  zoomedImg.style.maxWidth = '100%';
  zoomedImg.style.maxHeight = '100%';
  zoomedImg.style.objectFit = 'contain';
  zoomedImg.style.transform = 'translateZ(0)'; // Hardware acceleration
  zoomedImg.style.willChange = 'transform'; // Optimize animations
  
  // Close on tap
  overlay.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  imageContainer.appendChild(zoomedImg);
  overlay.appendChild(imageContainer);
  document.body.appendChild(overlay);
  
  // Setup pinch zoom if supported
  if ('ontouchstart' in window) {
    setupPinchZoom(zoomedImg);
  }
}

/**
 * Setup pinch zoom for image viewer
 * @param {HTMLImageElement} image - The image to enable pinch zoom on
 */
function setupPinchZoom(image) {
  let currentScale = 1;
  let startDist = 0;
  let pinchStarted = false;
  
  // Pinch start
  image.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinchStarted = true;
      startDist = getDistance(e.touches[0], e.touches[1]);
      e.preventDefault();
    }
  });
  
  // Pinch move
  image.addEventListener('touchmove', (e) => {
    if (pinchStarted && e.touches.length === 2) {
      const currentDist = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDist / startDist;
      
      // Limit scale between 0.5 and 3
      currentScale = Math.min(Math.max(currentScale * scale, 0.5), 3);
      
      // Apply transformation with hardware acceleration
      image.style.transform = `scale(${currentScale}) translateZ(0)`;
      startDist = currentDist;
      e.preventDefault();
    }
  });
  
  // Pinch end
  image.addEventListener('touchend', (e) => {
    if (pinchStarted && e.touches.length < 2) {
      pinchStarted = false;
    }
  });
}

/**
 * Calculate distance between two touch points
 * @param {Touch} touch1 - First touch point
 * @param {Touch} touch2 - Second touch point
 * @return {number} - Distance between touch points
 */
function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Initialize when document is loaded with passive listener
document.addEventListener('DOMContentLoaded', registerTouchEvents, PASSIVE_SUPPORT ? { passive: true } : false);

// Re-initialize when component updates (for React) but optimize with debounce
const observer = new MutationObserver(debounce(() => {
  // Check if product gallery or tabs were added
  if (document.querySelector('.product-gallery-main') || 
      document.querySelector('.product-tabs-nav')) {
    registerTouchEvents();
  }
}, 100));

/**
 * Simple debounce function to prevent excessive function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @return {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Start observing for DOM changes with optimized config
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: false, // Don't track text changes for better performance
});

// Cleanup function to remove observers when component unmounts
function cleanup() {
  observer.disconnect();
}

export { registerTouchEvents, cleanup };
