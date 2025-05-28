import React from 'react';

const HeroSection = () => {
  return (
    <section id="homeSection" className="heroSection">
      <div className="heroContent scroll-animation slide-in-left">
        <h1 className="heroTitle">Từ Thiên Nhiên, Thiết Kế Cho Bạn</h1>
        <p className="heroSubtitle">Các sản phẩm dừa cao cấp từ nguồn bền vững</p>
        <div className="heroCta">
          <a href="#productSection" className="ctaButton">Mua Ngay</a>
          <a href="#aboutSection" className="secondaryCta">Tìm Hiểu Thêm</a>
        </div>
      </div>
      <div className="heroImage scroll-animation slide-in-right">
        <div className="heroImageOverlay"></div>
      </div>
    </section>
  );
};

export default HeroSection;
