import React, { useEffect } from 'react';
import './css/customerPage.css'
import './css/ScrollbarFix.css';
import './css/animations.css';
import { useAppContext } from '../../context/AppContext';
import MainHeader from '../../components/shared/MainHeader';
import HeroSection from './customerComponent/HeroSection';
import FeatureStrip from './customerComponent/FeatureStrip';
import ProductShowcase from './customerComponent/ProductShowcase';
import PromoSection from './customerComponent/PromoSection';
import TestimonialSection from './customerComponent/TestimonialSection';
import AboutUsSection from './customerComponent/AboutUsSection';
import ContactSection from './customerComponent/ContactSection';
import MainFooter from '../../components/shared/MainFooter';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const HomePage = () => {
  // Use the custom hook for scroll animations
  useScrollAnimation();
  
  // Use app context for authentication and cart management
  const { checkAuthStatus, user } = useAppContext();
  
  // Check authentication status on component mount
  useEffect(() => {
    // Fix for double scrollbar issue
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflowX = 'hidden';
    
    // Chỉ gọi checkAuthStatus khi user === undefined (chưa xác định)
    if (typeof user === 'undefined') {
      checkAuthStatus();
    }
    
    return () => {
      // Reset overflow settings when component unmounts
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';
    };
  }, [user, checkAuthStatus]); // Added checkAuthStatus to dependency array
  
  return (
    <div className="landingPageContainer" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <HeroSection />
        <FeatureStrip />
        <ProductShowcase />
        <PromoSection />
        <TestimonialSection />
        <AboutUsSection />
        <ContactSection />
      </div>
      <MainFooter />
    </div>
  );
};

export default HomePage;
