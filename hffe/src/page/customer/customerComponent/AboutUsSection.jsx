import React from 'react';

const AboutUsSection = () => {
  return (
    <section id="aboutSection" className="aboutUsSection">
      <div className="aboutUsContent">
        <div className="aboutUsImage scroll-animation slide-in-left"></div>
        <div className="aboutUsText scroll-animation slide-in-right">
          <h2 className="sectionTitle">Câu Chuyện Của Chúng Tôi</h2>
          <p className="aboutDescription">
            Tại CocoNature, chúng tôi đam mê biến những quả dừa thành các sản phẩm gia dụng đẹp và bền vững. 
            Sứ mệnh của chúng tôi là mang đến cho bạn những đồ trang trí và dụng cụ nhà bếp vừa thiết thực, 
            vừa phong cách, được chế tác tỉ mỉ từ vật liệu tái chế.
          </p>
          <p className="aboutDescription">
            Từ những món đồ trang trí tinh xảo đến dụng cụ nhà bếp thân thiện với môi trường, 
            mỗi sản phẩm đều kể một câu chuyện về sự đổi mới và phát triển bền vững. 
            Hãy tận hưởng vẻ đẹp và tiện ích từ những sản phẩm được tạo ra với sự quan tâm đến 
            cả ngôi nhà của bạn và môi trường.
          </p>
          <div className="aboutCertifications">
            <div className="certBadge organicCert">Chứng Nhận Hữu Cơ</div>
            <div className="certBadge ecoCert">Thân Thiện Môi Trường</div>
            <div className="certBadge fairTradeCert">Thương Mại Công Bằng</div>
          </div>
          <button className="learnMoreButton">Tìm Hiểu Thêm Về Chúng Tôi</button>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
