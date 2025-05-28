import { useEffect } from 'react';

const useScrollAnimation = () => {
  useEffect(() => {
    // Select all elements with the 'scroll-animation' class
    const scrollElements = document.querySelectorAll('.scroll-animation');
    
    // Immediately animate hero section elements
    const heroElements = document.querySelectorAll('#homeSection .scroll-animation');
    setTimeout(() => {
      heroElements.forEach(el => {
        el.classList.add('animate');
      });
    }, 200);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Add 'animate' class when element is in view
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { 
      threshold: 0.1, // Trigger when at least 10% of the element is visible
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before the element enters the viewport
    });
      scrollElements.forEach((el) => {
      // Don't observe hero elements and product cards since we're handling them differently
      if (!el.closest('#homeSection') && !el.classList.contains('productCard') && !el.closest('.productCardContainer')) {
        observer.observe(el);
      }
    });
    
    // Cleanup function
    return () => {
      // Reset container overflow when component unmounts
      const mainContainer = document.querySelector('.landingPageContainer');
      if (mainContainer) {
        mainContainer.style.overflow = 'auto';
      }
      
      scrollElements.forEach((el) => {
        if (!el.closest('#homeSection')) {
          observer.unobserve(el);
        }
      });
    };
  }, []);
};

export default useScrollAnimation;
