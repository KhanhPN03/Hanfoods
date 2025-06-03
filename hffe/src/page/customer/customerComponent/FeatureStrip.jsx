import React from 'react';

const FeatureStrip = () => {
  // Features data could be moved to context if needed for reuse
  const features = [
    {
      iconClass: "organicIcon",
      title: "100% Hữu Cơ",
      description: "Sản phẩm tự nhiên đã chứng nhận"
    },
    {
      iconClass: "shippingIcon",
      title: "Miễn Phí Vận Chuyển",
      description: "Cho đơn hàng trên 1.000.000đ"
    },
    {
      iconClass: "qualityIcon",
      title: "Chất Lượng Cao Cấp",
      description: "Sản phẩm thủ công tinh xảo"
    },
    {
      iconClass: "supportIcon",
      title: "Hỗ Trợ 24/7",
      description: "Chăm sóc khách hàng tận tâm"
    }
  ];

  return (
    <section className="featureStrip">
      {features.map((feature, index) => (
        <div key={index} className="featureItem scroll-animation fade-in">
          <div className={`featureIcon ${feature.iconClass}`}></div>
          <div className="featureText">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default FeatureStrip;
