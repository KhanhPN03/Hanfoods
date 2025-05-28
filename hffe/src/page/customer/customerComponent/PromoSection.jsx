import React from 'react';

const PromoSection = () => {
  return (
    <section className="promoSection">
      <div className="promoContent scroll-animation slide-in-left">
        <h2 className="promoTitle">Giảm 25% Cho Đơn Hàng Đầu Tiên!</h2>
        <p className="promoText">Tham gia cộng đồng mua sắm thân thiện với môi trường và nhận những ưu đãi đặc biệt.</p>
        <button className="promoButton">Mua Ngay</button>
      </div>
      {/* <div className="promoImage scroll-animation slide-in-right"></div> */}
    </section>
  );
};

export default PromoSection;
