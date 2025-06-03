/**
 * Simple fix for scrolling issues on the product detail page
 * This script ensures all elements are properly displayed
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Set a small timeout to ensure all components are rendered
  setTimeout(fixScrolling, 1000);
});

/**
 * Fix scrolling issues by correcting any problematic CSS
 */
function fixScrolling() {
  // Get the main elements
  const body = document.body;
  const root = document.getElementById('root');
  const productDetailPage = document.querySelector('.product-detail-page');
  
  // Reset any problematic styles
  if (body) {
    body.style.height = 'auto';
    body.style.overflow = 'auto';
    body.style.position = 'static';
  }
  
  if (root) {
    root.style.height = 'auto';
    root.style.overflow = 'visible';
  }
  
  if (productDetailPage) {
    productDetailPage.style.height = 'auto';
    productDetailPage.style.overflow = 'visible';
    productDetailPage.style.position = 'static';
  }
  
  // Fix any containers that might be restricting height
  const containers = document.querySelectorAll(
    '.product-detail-main, .product-detail-top-bg, ' +
    '.product-detail-tabs-section, .product-suggestions-section'
  );
  
  containers.forEach(container => {
    if (container) {
      container.style.height = 'auto';
      container.style.maxHeight = 'none';
      container.style.overflow = 'visible';
      container.style.display = 'block';
    }
  });
}

// Export the function to be used in React components
export default fixScrolling;
